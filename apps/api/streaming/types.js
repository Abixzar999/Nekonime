// Kontrak data streaming. File ini hanya dokumentasi tipe (JSDoc), tanpa kode runtime.

/**
 * @typedef {"youtube" | "file" | "embed"} SourceType
 */

/**
 * Satu sumber video yang siap diputar frontend.
 *
 * - youtube: `youtubeId` berisi ID video YouTube resmi.
 * - file:    `url` berisi URL file langsung (.mp4/.m3u8).
 * - embed:   `url` berisi halaman embed resmi untuk dirender di iframe.
 *
 * @typedef {object} StreamSource
 * @property {string} id          Identitas unik sumber.
 * @property {string} provider    ID provider asal.
 * @property {SourceType} type
 * @property {string | null} [youtubeId]
 * @property {string | null} [url]
 * @property {string} [title]
 * @property {string} [credit]    Keterangan kanal/pemegang hak.
 * @property {"verified"} [license]
 */

/**
 * Provider streaming. Hanya provider dengan `enabled === true` dan
 * `license.verified === true` yang boleh dipanggil oleh registry.
 *
 * @typedef {object} StreamProvider
 * @property {string} id
 * @property {string} label
 * @property {{ verified: boolean, note: string }} license
 * @property {boolean} enabled
 * @property {(args: { animeId: string, episode: number, title?: string }) => Promise<StreamSource[]>} getStreams
 * @property {(args: { animeId: string }) => Array<{ episode: number, available: true }>} [listEpisodes]
 */

export {};
