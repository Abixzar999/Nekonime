import test from "node:test";
import assert from "node:assert/strict";
import { getSourceStatus, getVideoSource, videoSources } from "./episodes.js";

test("sumber Ani-One yang terverifikasi tetap tersedia", () => {
  const entry = getVideoSource("21459", 1);
  assert.equal(entry.id, "jE2oIRiFjkY");
  assert.equal(getSourceStatus("21459", 1), "available");
});

test("Pernikahan Kunang-kunang (Hotaru no Yomeiri) episode 1-5 tersedia", () => {
  assert.equal(getVideoSource("205909", 1).id, "KU1QRn49_iU");
  assert.equal(getVideoSource("205909", 5).id, "XzL3LGkh6w0");
  for (let episode = 1; episode <= 5; episode += 1) {
    assert.equal(getSourceStatus("205909", episode), "available");
  }
});

test("Zom 100 dari Muse Indonesia tersedia lengkap 12 episode", () => {
  assert.equal(getVideoSource("159831", 1).id, "dcEI-0przZE");
  assert.equal(getVideoSource("159831", 12).id, "Hc4T9bdCE-4");

  for (let episode = 1; episode <= 12; episode += 1) {
    assert.equal(getSourceStatus("159831", episode), "available");
  }
});

test("School Babysitters episode 1-12 tersedia", () => {
  assert.equal(getVideoSource("98503", 1).id, "Zgy8MmPMLWI");
  assert.equal(getVideoSource("98503", 12).id, "4Yo2UpiREC4");
  for (let episode = 1; episode <= 12; episode += 1) {
    assert.equal(getSourceStatus("98503", episode), "available");
  }
});

test("BanG Dream! YUME∞MITA episode 1-13 tersedia", () => {
  assert.equal(getVideoSource("198376", 1).id, "WuzfR-yJuaw");
  assert.equal(getVideoSource("198376", 13).id, "kZPCjy4X7zk");
  for (let episode = 1; episode <= 13; episode += 1) {
    assert.equal(getSourceStatus("198376", episode), "available");
  }
});

test("entri 120120 dinonaktifkan tanpa menghapus datanya", () => {
  assert.equal(getVideoSource("120120", 1), null);
  assert.equal(getSourceStatus("120120", 1), "unverified");
  assert.equal(videoSources["120120:1"].id, "NuGSr9noWoc");
  assert.equal(videoSources["120120:1"].unverified, true);
});

test("episode tanpa mapping tidak dianggap tersedia", () => {
  assert.equal(getVideoSource("99999", 1), null);
  assert.equal(getSourceStatus("99999", 1), "none");
});
