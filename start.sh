#!/usr/bin/env bash
# Menyalakan backend (apps/api) dan web (apps/web) sekaligus.
# Berhenti dengan Ctrl+C: kedua server ikut dimatikan.
set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_PORT=3001

# Jangan menyalakan ulang kalau port backend sudah dipakai proses lain.
if ss -ltn "sport = :${API_PORT}" 2>/dev/null | grep -q LISTEN; then
  echo "Port ${API_PORT} sudah dipakai. Lihat prosesnya dengan:"
  echo "  ss -ltnp | grep ${API_PORT}"
  echo "Kalau itu server NEKONIME lama, matikan dengan: kill PID  (PID dari output di atas)"
  exit 1
fi

# Pasang dependensi hanya jika belum ada.
for dir in apps/api apps/web; do
  if [ ! -d "$ROOT/$dir/node_modules" ]; then
    echo "Memasang dependensi $dir ..."
    (cd "$ROOT/$dir" && npm install) || exit 1
  fi
done

pids=()
cleanup() {
  trap - INT TERM EXIT
  echo
  echo "Mematikan server..."
  for pid in "${pids[@]}"; do
    kill "$pid" 2>/dev/null
  done
  wait 2>/dev/null
  exit 0
}
trap cleanup INT TERM EXIT

# Backend
(cd "$ROOT/apps/api" && exec npm start 2>&1 | sed -u 's/^/[api] /') &
pids+=($!)

# Tunggu backend sehat (maksimal sekitar 15 detik)
ok=0
for _ in $(seq 1 30); do
  if curl -sS --max-time 2 "http://localhost:${API_PORT}/api/health" >/dev/null 2>&1; then
    ok=1
    break
  fi
  sleep 0.5
done
if [ "$ok" -eq 1 ]; then
  echo "[api] sehat di http://localhost:${API_PORT}"
else
  echo "[api] belum menjawab setelah 15 detik. Web tetap dinyalakan; cek log [api] di atas."
fi

# Web
(cd "$ROOT/apps/web" && exec npm run dev 2>&1 | sed -u 's/^/[web] /') &
pids+=($!)

echo
echo "NEKONIME menyala. Buka alamat yang tertulis di baris [web] (biasanya http://localhost:5173/)."
echo "Tekan Ctrl+C untuk mematikan keduanya."
wait
