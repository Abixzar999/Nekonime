#!/usr/bin/env bash
# Pakai: scripts/tambah-playlist.sh "<alamat playlist>" <id AniList> [--apply]
# Tanpa --apply hanya pratinjau. Hanya membaca daftar video, tidak mengunduh apa pun.
set -euo pipefail

URL="${1:-}"
ID="${2:-}"
APPLY="${3:-}"

if [ -z "$URL" ] || [ -z "$ID" ]; then
  echo 'Pakai: scripts/tambah-playlist.sh "<alamat playlist>" <id AniList> [--apply]'
  exit 1
fi
if [ -n "$APPLY" ] && [ "$APPLY" != "--apply" ]; then
  echo "Argumen ketiga hanya boleh --apply."
  exit 1
fi
command -v yt-dlp >/dev/null || { echo "yt-dlp belum terpasang: sudo pacman -S yt-dlp"; exit 1; }

cd "$(dirname "${BASH_SOURCE[0]}")/.."

echo "Membaca daftar playlist..."
yt-dlp --flat-playlist --print "%(playlist_index)s | %(id)s | %(title)s" "$URL"

IDS="$(yt-dlp --flat-playlist --print id "$URL")"
echo
echo "Jumlah video: $(printf '%s\n' "$IDS" | wc -l)"
echo

if [ -n "$APPLY" ]; then
  node scripts/import-links.mjs --links "$IDS" --anime "$ID" --apply
else
  node scripts/import-links.mjs --links "$IDS" --anime "$ID"
fi
