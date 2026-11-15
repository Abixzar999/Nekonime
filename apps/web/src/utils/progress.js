// Format menit:detik, mis. 754 detik -> "12:34"
export function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}

// Dianggap selesai bila sudah ditonton 95% atau lebih
export const isFinished = (position, duration) =>
  duration > 0 && position >= duration * 0.95;

// Detik tempat melanjutkan: 0 bila belum ada, baru mulai, atau sudah selesai
export function resumePoint(entry) {
  if (!entry || !entry.duration || !entry.position) return 0;
  if (entry.position < 10 || isFinished(entry.position, entry.duration)) return 0;
  return Math.floor(entry.position);
}

// Pertahankan progres bila anime dan episode yang sama dicatat ulang
export function keepProgress(history, animeId, episode) {
  const same = history.find((i) => i.animeId === animeId && i.episode === episode);
  return same && same.duration ? { position: same.position, duration: same.duration } : {};
}
