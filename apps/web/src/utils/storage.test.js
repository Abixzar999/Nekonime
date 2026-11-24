import test from "node:test";
import assert from "node:assert/strict";
import { loadJSON, saveJSON } from "./storage.js";

const withStorage = (impl, run) => {
  const original = globalThis.localStorage;
  globalThis.localStorage = impl;
  try {
    return run();
  } finally {
    globalThis.localStorage = original;
  }
};

test("JSON rusak mengembalikan nilai cadangan", () => {
  withStorage(
    { getItem: () => "{rusak", setItem: () => {} },
    () => assert.deepEqual(loadJSON("x", []), [])
  );
});

test("nilai JSON valid dibaca apa adanya", () => {
  withStorage(
    { getItem: () => JSON.stringify([{ id: 1 }]), setItem: () => {} },
    () => assert.deepEqual(loadJSON("x", []), [{ id: 1 }])
  );
});

test("localStorage yang diblokir tidak membuat crash", () => {
  withStorage(
    {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {}
    },
    () => assert.deepEqual(loadJSON("x", []), [])
  );
});

test("gagal menyimpan tidak membuat crash", () => {
  withStorage(
    {
      getItem: () => null,
      setItem: () => {
        throw new Error("penuh");
      }
    },
    () => assert.doesNotThrow(() => saveJSON("x", { id: 1 }))
  );
});
