// Sumber video per episode, terpisah dari metadata anime.
// Kunci: "<id anime>:<nomor episode>". Isi hanya dengan video yang SAH:
//   { type: "file", url: "/videos/contoh.mp4", credit: "..." }   -> video milik sendiri / lisensi terbuka
//   { type: "youtube", id: "ID_VIDEO", credit: "Kanal resmi ..." } -> embed dari kanal resmi yang mengizinkan
export const videoSources = {
  // Magic Knight Rayearth (AniList 435), kanal resmi Ani-One Asia
  "435:1": { type: "youtube", id: "t0rFFd8BtvA", credit: "Ani-One Asia (kanal resmi)" },
  "435:2": { type: "youtube", id: "4eWSBr-bcOw", credit: "Ani-One Asia (kanal resmi)" },
  "435:3": { type: "youtube", id: "0RHBqHt5Kdg", credit: "Ani-One Asia (kanal resmi)" },
  "435:4": { type: "youtube", id: "33akKZ4hKnU", credit: "Ani-One Asia (kanal resmi)" },
  "435:5": { type: "youtube", id: "yUx-w10Emms", credit: "Ani-One Asia (kanal resmi)" },
  "435:6": { type: "youtube", id: "C3vcTHaClX0", credit: "Ani-One Asia (kanal resmi)" },
  "435:7": { type: "youtube", id: "AjHY9nrmJxM", credit: "Ani-One Asia (kanal resmi)" },

  // My Hero Academia S1 (AniList 21459), kanal resmi Ani-One Indonesia
  "21459:1": { type: "youtube", id: "jE2oIRiFjkY", credit: "Ani-One Indonesia (kanal resmi)" },
  "21459:2": { type: "youtube", id: "Gj4O-1USJXs", credit: "Ani-One Indonesia (kanal resmi)" },
  "21459:3": { type: "youtube", id: "tbAEoF84pv0", credit: "Ani-One Indonesia (kanal resmi)" },
  "21459:4": { type: "youtube", id: "l6eVfplcDWg", credit: "Ani-One Indonesia (kanal resmi)" },
  "21459:5": { type: "youtube", id: "JxbJb_lrUUQ", credit: "Ani-One Indonesia (kanal resmi)" },
  "21459:6": { type: "youtube", id: "GO2goZdhPos", credit: "Ani-One Indonesia (kanal resmi)" },
  "21459:7": { type: "youtube", id: "o0JDCZA-ETc", credit: "Ani-One Indonesia (kanal resmi)" },
  "21459:8": { type: "youtube", id: "lOx4UKBpt_M", credit: "Ani-One Indonesia (kanal resmi)" },
  "21459:9": { type: "youtube", id: "F0vzvCSMl_E", credit: "Ani-One Indonesia (kanal resmi)" },
  "21459:10": { type: "youtube", id: "WrPpgh3S2is", credit: "Ani-One Indonesia (kanal resmi)" },
  "21459:11": { type: "youtube", id: "hjykLSHg0D0", credit: "Ani-One Indonesia (kanal resmi)" },
  "21459:12": { type: "youtube", id: "N3jKOTu_pGc", credit: "Ani-One Indonesia (kanal resmi)" },
  "21459:13": { type: "youtube", id: "Oty53UfzE38", credit: "Ani-One Indonesia (kanal resmi)" },

  // My Teen Romantic Comedy SNAFU (Season 1) (AniList 14813), kanal resmi Ani-One Asia
  "14813:1": { type: "youtube", id: "O6dXFEGg5do", credit: "Ani-One Asia (kanal resmi)" },
  "14813:2": { type: "youtube", id: "ZOYOQK42x6E", credit: "Ani-One Asia (kanal resmi)" },
  "14813:3": { type: "youtube", id: "S2WR_zHFkjY", credit: "Ani-One Asia (kanal resmi)" },
  "14813:4": { type: "youtube", id: "FmqK836aU08", credit: "Ani-One Asia (kanal resmi)" },
  "14813:5": { type: "youtube", id: "7C3lBuzgcM8", credit: "Ani-One Asia (kanal resmi)" },
  "14813:6": { type: "youtube", id: "B7XVXeUZE6A", credit: "Ani-One Asia (kanal resmi)" },
  "14813:7": { type: "youtube", id: "YNbRgEI3uCs", credit: "Ani-One Asia (kanal resmi)" },
  "14813:8": { type: "youtube", id: "oi-wDQMLeQQ", credit: "Ani-One Asia (kanal resmi)" },
  "14813:9": { type: "youtube", id: "JiIx08vUkUw", credit: "Ani-One Asia (kanal resmi)" },
  "14813:10": { type: "youtube", id: "xiIVa050k5k", credit: "Ani-One Asia (kanal resmi)" },
  "14813:11": { type: "youtube", id: "HQ9EwLnfgKs", credit: "Ani-One Asia (kanal resmi)" },
  "14813:12": { type: "youtube", id: "bIQ8VKe2NU0", credit: "Ani-One Asia (kanal resmi)" },
  "14813:13": { type: "youtube", id: "J-Fup-Jh4sU", credit: "Ani-One Asia (kanal resmi)" },

  // My Teen Romantic Comedy SNAFU TOO! (Season 2) (AniList 20698), kanal resmi Ani-One Asia
  "20698:1": { type: "youtube", id: "CpS2zr8OWvI", credit: "Ani-One Asia (kanal resmi)" },
  "20698:2": { type: "youtube", id: "H5e75ny86qs", credit: "Ani-One Asia (kanal resmi)" },
  "20698:3": { type: "youtube", id: "Ccn74suRDTQ", credit: "Ani-One Asia (kanal resmi)" },
  "20698:4": { type: "youtube", id: "yWr83RuB5jU", credit: "Ani-One Asia (kanal resmi)" },
  "20698:5": { type: "youtube", id: "gCgAJEXTGtA", credit: "Ani-One Asia (kanal resmi)" },
  "20698:6": { type: "youtube", id: "kJi8WhtuqlA", credit: "Ani-One Asia (kanal resmi)" },
  "20698:7": { type: "youtube", id: "68iPWly39Ps", credit: "Ani-One Asia (kanal resmi)" },
  "20698:8": { type: "youtube", id: "LXKs8zLaWcQ", credit: "Ani-One Asia (kanal resmi)" },
  "20698:9": { type: "youtube", id: "R1TF17zGc3M", credit: "Ani-One Asia (kanal resmi)" },
  "20698:10": { type: "youtube", id: "JBKJvFPEPRQ", credit: "Ani-One Asia (kanal resmi)" },
  "20698:11": { type: "youtube", id: "M-ptfAzUkVU", credit: "Ani-One Asia (kanal resmi)" },
  "20698:12": { type: "youtube", id: "0FPAwyNqoMw", credit: "Ani-One Asia (kanal resmi)" },
  "20698:13": { type: "youtube", id: "Km1MU3OspyQ", credit: "Ani-One Asia (kanal resmi)" },

  // My Teen Romantic Comedy SNAFU Climax (Season 3) (AniList 108489), kanal resmi Ani-One Asia
  "108489:1": { type: "youtube", id: "bz2Z3Ik8JlQ", credit: "Ani-One Asia (kanal resmi)" },
  "108489:2": { type: "youtube", id: "L6YTPGsvQOY", credit: "Ani-One Asia (kanal resmi)" },
  "108489:3": { type: "youtube", id: "wmaCq7fFcFs", credit: "Ani-One Asia (kanal resmi)" },
  "108489:4": { type: "youtube", id: "3GLtaGtCPcc", credit: "Ani-One Asia (kanal resmi)" },
  "108489:5": { type: "youtube", id: "kY9r38oTM_g", credit: "Ani-One Asia (kanal resmi)" },
  "108489:6": { type: "youtube", id: "aymslOCOvUk", credit: "Ani-One Asia (kanal resmi)" },
  "108489:7": { type: "youtube", id: "IJg1gRpDTc0", credit: "Ani-One Asia (kanal resmi)" },
  "108489:8": { type: "youtube", id: "r7TxFgVLRaA", credit: "Ani-One Asia (kanal resmi)" },
  "108489:9": { type: "youtube", id: "KIq7eDHJkrI", credit: "Ani-One Asia (kanal resmi)" },
  "108489:10": { type: "youtube", id: "_1BDwBtRLJQ", credit: "Ani-One Asia (kanal resmi)" },
  "108489:11": { type: "youtube", id: "fQtygxSrLE4", credit: "Ani-One Asia (kanal resmi)" },
  "108489:12": { type: "youtube", id: "pHerJQpswVE", credit: "Ani-One Asia (kanal resmi)" },

  // My Hero Academia Season 2 (AniList 21856), kanal resmi Ani-One Indonesia
  "21856:1": { type: "youtube", id: "p6vcYCZklkY", credit: "Ani-One Indonesia (kanal resmi)" },

  // Zom 100: Bucket List of the Dead (AniList 159831), kanal resmi Muse Indonesia
  "159831:1": { type: "youtube", id: "dcEI-0przZE", credit: "Muse Indonesia (kanal resmi)" },
  "159831:2": { type: "youtube", id: "Y-_OWLe5paw", credit: "Muse Indonesia (kanal resmi)" },
  "159831:3": { type: "youtube", id: "GbdZ38c3Hdk", credit: "Muse Indonesia (kanal resmi)" },
  "159831:4": { type: "youtube", id: "tH4_MmI68vQ", credit: "Muse Indonesia (kanal resmi)" },
  "159831:5": { type: "youtube", id: "UVrx0Ar4_TQ", credit: "Muse Indonesia (kanal resmi)" },
  "159831:6": { type: "youtube", id: "4IPbk0AZ3UY", credit: "Muse Indonesia (kanal resmi)" },
  "159831:7": { type: "youtube", id: "lJAvvn1a_gI", credit: "Muse Indonesia (kanal resmi)" },
  "159831:8": { type: "youtube", id: "uastElaWSow", credit: "Muse Indonesia (kanal resmi)" },
  "159831:9": { type: "youtube", id: "TslVJ9u2Czk", credit: "Muse Indonesia (kanal resmi)" },
  "159831:10": { type: "youtube", id: "5tgmnqK_3Pw", credit: "Muse Indonesia (kanal resmi)" },
  "159831:11": { type: "youtube", id: "tC7c1U60ZlE", credit: "Muse Indonesia (kanal resmi)" },
  "159831:12": { type: "youtube", id: "Hc4T9bdCE-4", credit: "Muse Indonesia (kanal resmi)" },

  // Hotaru no Yomeiri / Firefly Wedding / Pernikahan Kunang-kunang (AniList 205909),
// kanal resmi Muse Indonesia. Masih tayang, episode 1-5 terverifikasi.
  "205909:1": { type: "youtube", id: "KU1QRn49_iU", credit: "Muse Indonesia (kanal resmi)" },
  "205909:2": { type: "youtube", id: "XwoKwTY5yDM", credit: "Muse Indonesia (kanal resmi)" },
  "205909:3": { type: "youtube", id: "_xTCdeegEgw", credit: "Muse Indonesia (kanal resmi)" },
  "205909:4": { type: "youtube", id: "VFa53oC-1EY", credit: "Muse Indonesia (kanal resmi)" },
  "205909:5": { type: "youtube", id: "XzL3LGkh6w0", credit: "Muse Indonesia (kanal resmi)" },

  // BanG Dream! YUME∞MITA (AniList 198376), kanal resmi Muse Indonesia
  "198376:1": { type: "youtube", id: "WuzfR-yJuaw", credit: "Muse Indonesia (kanal resmi)" },
  "198376:2": { type: "youtube", id: "cDZWqGQWb9M", credit: "Muse Indonesia (kanal resmi)" },
  "198376:3": { type: "youtube", id: "EOlNh3_Rm_I", credit: "Muse Indonesia (kanal resmi)" },
  "198376:4": { type: "youtube", id: "reWSi7ZmMQI", credit: "Muse Indonesia (kanal resmi)" },
  "198376:5": { type: "youtube", id: "Ns-Or7MK6p4", credit: "Muse Indonesia (kanal resmi)" },
  "198376:6": { type: "youtube", id: "igVMWEwo_F0", credit: "Muse Indonesia (kanal resmi)" },
  "198376:7": { type: "youtube", id: "ZkL8bZn3MFo", credit: "Muse Indonesia (kanal resmi)" },
  "198376:8": { type: "youtube", id: "ddo8bme8kuw", credit: "Muse Indonesia (kanal resmi)" },
  "198376:9": { type: "youtube", id: "rN4sYulTCtM", credit: "Muse Indonesia (kanal resmi)" },
  "198376:10": { type: "youtube", id: "g7Q1GTxu4pQ", credit: "Muse Indonesia (kanal resmi)" },
  "198376:11": { type: "youtube", id: "jBaiPY0YfVw", credit: "Muse Indonesia (kanal resmi)" },
  "198376:12": { type: "youtube", id: "bOPx5lZg8Pk", credit: "Muse Indonesia (kanal resmi)" },
  "198376:13": { type: "youtube", id: "kZPCjy4X7zk", credit: "Muse Indonesia (kanal resmi)" },

  // School Babysitters (Gakuen Babysitters) (AniList 98503), kanal resmi Muse Indonesia
  "98503:1": { type: "youtube", id: "Zgy8MmPMLWI", credit: "Muse Indonesia (kanal resmi)" },
  "98503:2": { type: "youtube", id: "L_0EpKx-hyA", credit: "Muse Indonesia (kanal resmi)" },
  "98503:3": { type: "youtube", id: "7tLJkqTjPcQ", credit: "Muse Indonesia (kanal resmi)" },
  "98503:4": { type: "youtube", id: "KyIeSh9Fjrk", credit: "Muse Indonesia (kanal resmi)" },
  "98503:5": { type: "youtube", id: "HRlujnjGTBI", credit: "Muse Indonesia (kanal resmi)" },
  "98503:6": { type: "youtube", id: "CqkIzAsctSY", credit: "Muse Indonesia (kanal resmi)" },
  "98503:7": { type: "youtube", id: "G-gJgn-oKEo", credit: "Muse Indonesia (kanal resmi)" },
  "98503:8": { type: "youtube", id: "FVxSGtVrssg", credit: "Muse Indonesia (kanal resmi)" },
  "98503:9": { type: "youtube", id: "2ychOxUrc-o", credit: "Muse Indonesia (kanal resmi)" },
  "98503:10": { type: "youtube", id: "OxxMqInmXnM", credit: "Muse Indonesia (kanal resmi)" },
  "98503:11": { type: "youtube", id: "vAtHPI_gV9Y", credit: "Muse Indonesia (kanal resmi)" },
  "98503:12": { type: "youtube", id: "4Yo2UpiREC4", credit: "Muse Indonesia (kanal resmi)" },

  // Sasaki and Peeps (AniList 152682), kanal resmi Muse Indonesia
  // Video ID diambil dari playlist resmi; perlu verifikasi embed dan episode mapping.
  "152682:1": { type: "youtube", id: "wczHQRvcAP4", credit: "Muse Indonesia (kanal resmi)" },
  "152682:2": { type: "youtube", id: "PX4AFNEOC7w", credit: "Muse Indonesia (kanal resmi)" },
  "152682:3": { type: "youtube", id: "XGz7edeef34", credit: "Muse Indonesia (kanal resmi)" },
  "152682:4": { type: "youtube", id: "v2xoMu_Lrys", credit: "Muse Indonesia (kanal resmi)" },
  "152682:5": { type: "youtube", id: "7BphMBX9H4o", credit: "Muse Indonesia (kanal resmi)" },
  "152682:6": { type: "youtube", id: "V2Smwwl-Xg8", credit: "Muse Indonesia (kanal resmi)" },
  "152682:7": { type: "youtube", id: "oLZuP6mxhfE", credit: "Muse Indonesia (kanal resmi)" },
  "152682:8": { type: "youtube", id: "RS7ulyxk2TY", credit: "Muse Indonesia (kanal resmi)" },
  "152682:9": { type: "youtube", id: "ux0hmIZWRqs", credit: "Muse Indonesia (kanal resmi)" },
  "152682:10": { type: "youtube", id: "70aqPdk_YRA", credit: "Muse Indonesia (kanal resmi)" },
  "152682:11": { type: "youtube", id: "tbyaaDGKp_E", credit: "Muse Indonesia (kanal resmi)" },
  "152682:12": { type: "youtube", id: "dNN8znF5BXs", credit: "Muse Indonesia (kanal resmi)" },

  // Ringing Fate (AniList 141862), kanal resmi Ani-Mi Asia
  "141862:1": { type: "youtube", id: "LFF-wQsBIN8", credit: "Ani-Mi Asia (kanal resmi)" },
  "141862:2": { type: "youtube", id: "EYXxQaWqPEQ", credit: "Ani-Mi Asia (kanal resmi)" },
  "141862:3": { type: "youtube", id: "gAWBIN-dXAQ", credit: "Ani-Mi Asia (kanal resmi)" },
  "141862:4": { type: "youtube", id: "dQMEDJx89-E", credit: "Ani-Mi Asia (kanal resmi)" },
  "141862:5": { type: "youtube", id: "hPKQ7jMWOAE", credit: "Ani-Mi Asia (kanal resmi)" },
  "141862:6": { type: "youtube", id: "1rrVDABrKfc", credit: "Ani-Mi Asia (kanal resmi)" },
  "141862:7": { type: "youtube", id: "ABxAsCvRcOc", credit: "Ani-Mi Asia (kanal resmi)" },
  "141862:8": { type: "youtube", id: "SuZPXBTjEz0", credit: "Ani-Mi Asia (kanal resmi)" },
  "141862:9": { type: "youtube", id: "vW-6bTFYxT8", credit: "Ani-Mi Asia (kanal resmi)" },
  "141862:10": { type: "youtube", id: "rI5grIXHQSQ", credit: "Ani-Mi Asia (kanal resmi)" },
  "141862:11": { type: "youtube", id: "tQ42NnEUw50", credit: "Ani-Mi Asia (kanal resmi)" },
  "141862:12": { type: "youtube", id: "vG6n44vpOVg", credit: "Ani-Mi Asia (kanal resmi)" },

  // The Daily Life of the Immortal King Season 1 (AniList 114121), kanal resmi Ani-Mi Asia
  "114121:1": { type: "youtube", id: "nwDt4kCpVjQ", credit: "Ani-Mi Asia (kanal resmi)" },
  "114121:2": { type: "youtube", id: "aP-F25UcI48", credit: "Ani-Mi Asia (kanal resmi)" },
  "114121:3": { type: "youtube", id: "0OHAGjX_ZDc", credit: "Ani-Mi Asia (kanal resmi)" },
  "114121:4": { type: "youtube", id: "XxqhHguZRPo", credit: "Ani-Mi Asia (kanal resmi)" },
  "114121:5": { type: "youtube", id: "LTZl9o9YD9U", credit: "Ani-Mi Asia (kanal resmi)" },
  "114121:6": { type: "youtube", id: "xO1jCphpyBI", credit: "Ani-Mi Asia (kanal resmi)" },
  "114121:7": { type: "youtube", id: "AOyFberA07I", credit: "Ani-Mi Asia (kanal resmi)" },
  "114121:8": { type: "youtube", id: "oKlaZ4Xfyg4", credit: "Ani-Mi Asia (kanal resmi)" },
  "114121:9": { type: "youtube", id: "N9kQ8tSSSys", credit: "Ani-Mi Asia (kanal resmi)" },
  "114121:10": { type: "youtube", id: "yPatG7rcc2o", credit: "Ani-Mi Asia (kanal resmi)" },
  "114121:11": { type: "youtube", id: "Dd5E0Azn03E", credit: "Ani-Mi Asia (kanal resmi)" },
  "114121:12": { type: "youtube", id: "IU47v8pJvpI", credit: "Ani-Mi Asia (kanal resmi)" },
  "114121:13": { type: "youtube", id: "uzxd3J0-N-c", credit: "Ani-Mi Asia (kanal resmi)" },
  "114121:14": { type: "youtube", id: "7tF0TQ7UuXU", credit: "Ani-Mi Asia (kanal resmi)" },
  "114121:15": { type: "youtube", id: "ePtcaNSYN60", credit: "Ani-Mi Asia (kanal resmi)" },

  // The Daily Life of the Immortal King Season 2 (AniList 126357), kanal resmi Ani-Mi Asia
  "126357:1": { type: "youtube", id: "8kw73-cc6NY", credit: "Ani-Mi Asia (kanal resmi)" },
  "126357:2": { type: "youtube", id: "KbzhJedgW0Y", credit: "Ani-Mi Asia (kanal resmi)" },
  "126357:3": { type: "youtube", id: "is1HUzaiwFA", credit: "Ani-Mi Asia (kanal resmi)" },
  "126357:4": { type: "youtube", id: "q319loGHpJk", credit: "Ani-Mi Asia (kanal resmi)" },
  "126357:5": { type: "youtube", id: "f2_81FZmYA4", credit: "Ani-Mi Asia (kanal resmi)" },
  "126357:6": { type: "youtube", id: "ANDuJ-uyeug", credit: "Ani-Mi Asia (kanal resmi)" },
  "126357:7": { type: "youtube", id: "77mK0ulpn8c", credit: "Ani-Mi Asia (kanal resmi)" },
  "126357:8": { type: "youtube", id: "D0lRzL-J6Fw", credit: "Ani-Mi Asia (kanal resmi)" },
  "126357:9": { type: "youtube", id: "FcewPgBnIGQ", credit: "Ani-Mi Asia (kanal resmi)" },
  "126357:10": { type: "youtube", id: "QZCgsUuKDdE", credit: "Ani-Mi Asia (kanal resmi)" },
  "126357:11": { type: "youtube", id: "um_r9X-gzQE", credit: "Ani-Mi Asia (kanal resmi)" },
  "126357:12": { type: "youtube", id: "te0-eHMKJ5k", credit: "Ani-Mi Asia (kanal resmi)" },

  // The Daily Life of the Immortal King Season 3 (AniList 141852), kanal resmi Ani-Mi Asia
  "141852:1": { type: "youtube", id: "uLserU0TTkY", credit: "Ani-Mi Asia (kanal resmi)" },
  "141852:2": { type: "youtube", id: "HGzZTFtDRgY", credit: "Ani-Mi Asia (kanal resmi)" },
  "141852:3": { type: "youtube", id: "x_U8H38WUhU", credit: "Ani-Mi Asia (kanal resmi)" },
  "141852:4": { type: "youtube", id: "lqJxPXkm3yw", credit: "Ani-Mi Asia (kanal resmi)" },
  "141852:5": { type: "youtube", id: "RMg_p0Wk480", credit: "Ani-Mi Asia (kanal resmi)" },
  "141852:6": { type: "youtube", id: "dz32mNpFQ74", credit: "Ani-Mi Asia (kanal resmi)" },
  "141852:7": { type: "youtube", id: "nrmRwpJPQBE", credit: "Ani-Mi Asia (kanal resmi)" },
  "141852:8": { type: "youtube", id: "1l8wU0BmUys", credit: "Ani-Mi Asia (kanal resmi)" },
  "141852:9": { type: "youtube", id: "aBvNbxWRyN4", credit: "Ani-Mi Asia (kanal resmi)" },
  "141852:10": { type: "youtube", id: "pgIYNo3nZx4", credit: "Ani-Mi Asia (kanal resmi)" },
  "141852:11": { type: "youtube", id: "1w-PwC92R4M", credit: "Ani-Mi Asia (kanal resmi)" },
  "141852:12": { type: "youtube", id: "RtIL66bnU3I", credit: "Ani-Mi Asia (kanal resmi)" },

  // The Daily Life of the Immortal King Season 4 (AniList 156110), kanal resmi Ani-Mi Asia
  "156110:1": { type: "youtube", id: "2ha9lp0jPbA", credit: "Ani-Mi Asia (kanal resmi)" },
  "156110:2": { type: "youtube", id: "mi-4tQVpu0M", credit: "Ani-Mi Asia (kanal resmi)" },
  "156110:3": { type: "youtube", id: "40mv8ksmZNg", credit: "Ani-Mi Asia (kanal resmi)" },
  "156110:4": { type: "youtube", id: "_1lxrd26lqs", credit: "Ani-Mi Asia (kanal resmi)" },
  "156110:5": { type: "youtube", id: "GbKHnS_MFRA", credit: "Ani-Mi Asia (kanal resmi)" },
  "156110:6": { type: "youtube", id: "JzCfA0bOvws", credit: "Ani-Mi Asia (kanal resmi)" },
  "156110:7": { type: "youtube", id: "Sx6fNV4xolY", credit: "Ani-Mi Asia (kanal resmi)" },
  "156110:8": { type: "youtube", id: "uLEzSN3g59Y", credit: "Ani-Mi Asia (kanal resmi)" },
  "156110:9": { type: "youtube", id: "6EkP_0VVP0o", credit: "Ani-Mi Asia (kanal resmi)" },
  "156110:10": { type: "youtube", id: "LRGyuv2Ts1g", credit: "Ani-Mi Asia (kanal resmi)" },
  "156110:11": { type: "youtube", id: "OEfr0YqXFz0", credit: "Ani-Mi Asia (kanal resmi)" },
  "156110:12": { type: "youtube", id: "tfNZruMWIUs", credit: "Ani-Mi Asia (kanal resmi)" },

  // The Daily Life of the Immortal King Season 5 (AniList 185857), kanal resmi Ani-Mi Asia
  "185857:1": { type: "youtube", id: "X28TR4CfGk0", credit: "Ani-Mi Asia (kanal resmi)" },
  "185857:2": { type: "youtube", id: "Lb0x0pqs2mg", credit: "Ani-Mi Asia (kanal resmi)" },
  "185857:3": { type: "youtube", id: "MuVLIyzLYlA", credit: "Ani-Mi Asia (kanal resmi)" },
  "185857:4": { type: "youtube", id: "kW-Kj-3d0PA", credit: "Ani-Mi Asia (kanal resmi)" },
  "185857:5": { type: "youtube", id: "BsRiN7lflFw", credit: "Ani-Mi Asia (kanal resmi)" },
  "185857:6": { type: "youtube", id: "ROABT8DWLUA", credit: "Ani-Mi Asia (kanal resmi)" },
  "185857:7": { type: "youtube", id: "b2if1q_Tu6I", credit: "Ani-Mi Asia (kanal resmi)" },
  "185857:8": { type: "youtube", id: "dSgmDQmKIIw", credit: "Ani-Mi Asia (kanal resmi)" },
  "185857:9": { type: "youtube", id: "6t1BUA7yH2g", credit: "Ani-Mi Asia (kanal resmi)" },
  "185857:10": { type: "youtube", id: "d7ls2BvctrY", credit: "Ani-Mi Asia (kanal resmi)" },
  "185857:11": { type: "youtube", id: "UZqzZsnmSPo", credit: "Ani-Mi Asia (kanal resmi)" },
  "185857:12": { type: "youtube", id: "nzqQNl6VzE8", credit: "Ani-Mi Asia (kanal resmi)" },
  "21856:2": { type: "youtube", id: "8iJsRgNbTa8", credit: "Ani-One Indonesia (kanal resmi)" },
  "21856:3": { type: "youtube", id: "t0s6NI57DbA", credit: "Ani-One Indonesia (kanal resmi)" },
  "21856:4": { type: "youtube", id: "rc7UG5DdgYo", credit: "Ani-One Indonesia (kanal resmi)" },
  "21856:5": { type: "youtube", id: "NsbLkPcnyQw", credit: "Ani-One Indonesia (kanal resmi)" },
  "21856:6": { type: "youtube", id: "aeln7CIOaFc", credit: "Ani-One Indonesia (kanal resmi)" },
  "21856:7": { type: "youtube", id: "A-t4fJ1crBQ", credit: "Ani-One Indonesia (kanal resmi)" },
  "21856:8": { type: "youtube", id: "omIYioMPyus", credit: "Ani-One Indonesia (kanal resmi)" },
  "21856:9": { type: "youtube", id: "h4cCd-6mmG4", credit: "Ani-One Indonesia (kanal resmi)" },
  "21856:10": { type: "youtube", id: "VUaG3fW_N18", credit: "Ani-One Indonesia (kanal resmi)" },
  "21856:11": { type: "youtube", id: "VUDb3M-CDzE", credit: "Ani-One Indonesia (kanal resmi)" },
  "21856:12": { type: "youtube", id: "R6cYWgriylg", credit: "Ani-One Indonesia (kanal resmi)" },
  "21856:13": { type: "youtube", id: "GP11GVisudc", credit: "Ani-One Indonesia (kanal resmi)" },
  "21856:14": { type: "youtube", id: "2XPP5YOS7x0", credit: "Ani-One Indonesia (kanal resmi)" },
  "21856:15": { type: "youtube", id: "zgzB6cklKGA", credit: "Ani-One Indonesia (kanal resmi)" },
  "21856:16": { type: "youtube", id: "qQMIyUmWE3U", credit: "Ani-One Indonesia (kanal resmi)" },
  "21856:17": { type: "youtube", id: "p9WvjcrfZ9I", credit: "Ani-One Indonesia (kanal resmi)" },
  "21856:18": { type: "youtube", id: "jTJq2vLq2N0", credit: "Ani-One Indonesia (kanal resmi)" },
  "21856:19": { type: "youtube", id: "G0bn6zulltU", credit: "Ani-One Indonesia (kanal resmi)" },
  "21856:20": { type: "youtube", id: "eyJFGL_1SdM", credit: "Ani-One Indonesia (kanal resmi)" },
  "21856:21": { type: "youtube", id: "rYwkngmQe9A", credit: "Ani-One Indonesia (kanal resmi)" },
  "21856:22": { type: "youtube", id: "CoxFeEKpO-A", credit: "Ani-One Indonesia (kanal resmi)" },
  "21856:23": { type: "youtube", id: "eUTaj3l7MNI", credit: "Ani-One Indonesia (kanal resmi)" },
  "21856:24": { type: "youtube", id: "2TKxgRk4siE", credit: "Ani-One Indonesia (kanal resmi)" },
  "21856:25": { type: "youtube", id: "3yfCOc9ebdg", credit: "Ani-One Indonesia (kanal resmi)" },

  // BLEACH: Thousand-Year Blood War (AniList 116674), kanal resmi Ani-One Asia
  "116674:1": { type: "youtube", id: "uiw5xswZQsQ", credit: "Ani-One Asia (kanal resmi)" },
  "116674:2": { type: "youtube", id: "R0DyETh9YLk", credit: "Ani-One Asia (kanal resmi)" },
  "116674:3": { type: "youtube", id: "LMcwt2AThqI", credit: "Ani-One Asia (kanal resmi)" },
  "116674:4": { type: "youtube", id: "-CX-hyDz3pg", credit: "Ani-One Asia (kanal resmi)" },
  "116674:5": { type: "youtube", id: "ij2A88BkiZA", credit: "Ani-One Asia (kanal resmi)" },
  "116674:6": { type: "youtube", id: "c4drScAyU3s", credit: "Ani-One Asia (kanal resmi)" },
  "116674:7": { type: "youtube", id: "EdsMxYeCdWM", credit: "Ani-One Asia (kanal resmi)" },
  "116674:8": { type: "youtube", id: "FjMaBIIsWd8", credit: "Ani-One Asia (kanal resmi)" },
  "116674:9": { type: "youtube", id: "h4fFa5z-A8g", credit: "Ani-One Asia (kanal resmi)" },
  "116674:10": { type: "youtube", id: "A4CY2DOtkys", credit: "Ani-One Asia (kanal resmi)" },
  "116674:11": { type: "youtube", id: "X8Vo-1RuUD4", credit: "Ani-One Asia (kanal resmi)" },
  "116674:12": { type: "youtube", id: "_ORh_ZXtDcU", credit: "Ani-One Asia (kanal resmi)" },
  "116674:13": { type: "youtube", id: "TUk-wAL9-I8", credit: "Ani-One Asia (kanal resmi)" },

  // BLEACH: Thousand-Year Blood War - The Separation (AniList 159322), kanal resmi Ani-One Asia
  "159322:1": { type: "youtube", id: "kjbAaqXNHME", credit: "Ani-One Asia (kanal resmi)" },
  "159322:2": { type: "youtube", id: "90P9j6FZfEI", credit: "Ani-One Asia (kanal resmi)" },
  "159322:3": { type: "youtube", id: "C2W7R5TlLY0", credit: "Ani-One Asia (kanal resmi)" },
  "159322:4": { type: "youtube", id: "e4ZavmFRUr8", credit: "Ani-One Asia (kanal resmi)" },
  "159322:5": { type: "youtube", id: "u4he3lAqbGo", credit: "Ani-One Asia (kanal resmi)" },
  "159322:6": { type: "youtube", id: "NAkUFjpBWvc", credit: "Ani-One Asia (kanal resmi)" },

  // AniList 120120, diimpor dari daftar tautan.
  // Kanal belum bisa diverifikasi, jadi seluruh entri ditandai `unverified`
  // dan tidak diputar sampai atribusinya dipastikan.
  "120120:1": { type: "youtube", id: "NuGSr9noWoc", credit: "Kanal belum terverifikasi", unverified: true },
  "120120:2": { type: "youtube", id: "udOxNLXftyU", credit: "Kanal belum terverifikasi", unverified: true },
  "120120:3": { type: "youtube", id: "AfqcAhzpUdo", credit: "Kanal belum terverifikasi", unverified: true },
  "120120:4": { type: "youtube", id: "HJX8DSNaA24", credit: "Kanal belum terverifikasi", unverified: true },
  "120120:5": { type: "youtube", id: "arbIRFuW6vM", credit: "Kanal belum terverifikasi", unverified: true },
  "120120:6": { type: "youtube", id: "cb0wQI-jvIE", credit: "Kanal belum terverifikasi", unverified: true },
  "120120:7": { type: "youtube", id: "x1go80VlZf8", credit: "Kanal belum terverifikasi", unverified: true },
  "120120:8": { type: "youtube", id: "gIPFvvnjsNM", credit: "Kanal belum terverifikasi", unverified: true },
  "120120:9": { type: "youtube", id: "0hcBkrnpwu4", credit: "Kanal belum terverifikasi", unverified: true },
  "120120:10": { type: "youtube", id: "pf_StalkSwM", credit: "Kanal belum terverifikasi", unverified: true },
  "120120:11": { type: "youtube", id: "eJjjL7p34Ys", credit: "Kanal belum terverifikasi", unverified: true },
  "120120:12": { type: "youtube", id: "QVxn6rq-2Zo", credit: "Kanal belum terverifikasi", unverified: true },
  "120120:13": { type: "youtube", id: "AFLETAohnRE", credit: "Kanal belum terverifikasi", unverified: true },
  "120120:14": { type: "youtube", id: "pPG6cZ0ADEU", credit: "Kanal belum terverifikasi", unverified: true },
  "120120:15": { type: "youtube", id: "joM2TpAfuDI", credit: "Kanal belum terverifikasi", unverified: true },
  "120120:16": { type: "youtube", id: "vc9VEmKRObQ", credit: "Kanal belum terverifikasi", unverified: true },
  "120120:17": { type: "youtube", id: "E_HWulLqHuY", credit: "Kanal belum terverifikasi", unverified: true },
  "120120:18": { type: "youtube", id: "2oWaa0UwLb4", credit: "Kanal belum terverifikasi", unverified: true },
  "120120:19": { type: "youtube", id: "AA0rOp3_ytY", credit: "Kanal belum terverifikasi", unverified: true },
  "120120:20": { type: "youtube", id: "RKh0E79QFoA", credit: "Kanal belum terverifikasi", unverified: true },
  "120120:21": { type: "youtube", id: "-JoI5nUAgGA", credit: "Kanal belum terverifikasi", unverified: true },
  "120120:22": { type: "youtube", id: "hVPbsKePi48", credit: "Kanal belum terverifikasi", unverified: true },
  "120120:23": { type: "youtube", id: "fal1iP2PNxU", credit: "Kanal belum terverifikasi", unverified: true },
  "120120:24": { type: "youtube", id: "fM1xZlEiyk8", credit: "Kanal belum terverifikasi", unverified: true },

  // Mairimashita! Iruma-kun Season 1 (AniList 108858), kanal resmi Muse Indonesia
  // 23 episode - placeholder, perlu verifikasi video ID dari playlist resmi
  "108858:1": { type: "youtube", id: "PLACEHOLDER_EP1", credit: "Muse Indonesia (kanal resmi)", unverified: true },
  "108858:2": { type: "youtube", id: "PLACEHOLDER_EP2", credit: "Muse Indonesia (kanal resmi)", unverified: true },
  "108858:3": { type: "youtube", id: "PLACEHOLDER_EP3", credit: "Muse Indonesia (kanal resmi)", unverified: true },
  "108858:4": { type: "youtube", id: "PLACEHOLDER_EP4", credit: "Muse Indonesia (kanal resmi)", unverified: true },
  "108858:5": { type: "youtube", id: "PLACEHOLDER_EP5", credit: "Muse Indonesia (kanal resmi)", unverified: true },
  "108858:6": { type: "youtube", id: "PLACEHOLDER_EP6", credit: "Muse Indonesia (kanal resmi)", unverified: true },
  "108858:7": { type: "youtube", id: "PLACEHOLDER_EP7", credit: "Muse Indonesia (kanal resmi)", unverified: true },
  "108858:8": { type: "youtube", id: "PLACEHOLDER_EP8", credit: "Muse Indonesia (kanal resmi)", unverified: true },
  "108858:9": { type: "youtube", id: "PLACEHOLDER_EP9", credit: "Muse Indonesia (kanal resmi)", unverified: true },
  "108858:10": { type: "youtube", id: "PLACEHOLDER_EP10", credit: "Muse Indonesia (kanal resmi)", unverified: true },
  "108858:11": { type: "youtube", id: "PLACEHOLDER_EP11", credit: "Muse Indonesia (kanal resmi)", unverified: true },
  "108858:12": { type: "youtube", id: "PLACEHOLDER_EP12", credit: "Muse Indonesia (kanal resmi)", unverified: true },
  "108858:13": { type: "youtube", id: "PLACEHOLDER_EP13", credit: "Muse Indonesia (kanal resmi)", unverified: true },
  "108858:14": { type: "youtube", id: "PLACEHOLDER_EP14", credit: "Muse Indonesia (kanal resmi)", unverified: true },
  "108858:15": { type: "youtube", id: "PLACEHOLDER_EP15", credit: "Muse Indonesia (kanal resmi)", unverified: true },
  "108858:16": { type: "youtube", id: "PLACEHOLDER_EP16", credit: "Muse Indonesia (kanal resmi)", unverified: true },
  "108858:17": { type: "youtube", id: "PLACEHOLDER_EP17", credit: "Muse Indonesia (kanal resmi)", unverified: true },
  "108858:18": { type: "youtube", id: "PLACEHOLDER_EP18", credit: "Muse Indonesia (kanal resmi)", unverified: true },
  "108858:19": { type: "youtube", id: "PLACEHOLDER_EP19", credit: "Muse Indonesia (kanal resmi)", unverified: true },
  "108858:20": { type: "youtube", id: "PLACEHOLDER_EP20", credit: "Muse Indonesia (kanal resmi)", unverified: true },
  "108858:21": { type: "youtube", id: "PLACEHOLDER_EP21", credit: "Muse Indonesia (kanal resmi)", unverified: true },
  "108858:22": { type: "youtube", id: "PLACEHOLDER_EP22", credit: "Muse Indonesia (kanal resmi)", unverified: true },
  "108858:23": { type: "youtube", id: "PLACEHOLDER_EP23", credit: "Muse Indonesia (kanal resmi)", unverified: true },

  // Mairimashita! Iruma-kun Season 4 (AniList 164129), kanal resmi Muse Indonesia
  // Placeholder untuk episode Season 4
  "164129:1": { type: "youtube", id: "PLACEHOLDER_S4_EP1", credit: "Muse Indonesia (kanal resmi)", unverified: true },

  // Chihayafuru Season 1 (AniList 10800), kanal resmi Muse Indonesia
  "10800:1": { type: "youtube", id: "PLACEHOLDER_CH1_EP1", credit: "Muse Indonesia (kanal resmi)", unverified: true },

  // Chihayafuru Season 2 (AniList 16037), kanal resmi Muse Indonesia
  "16037:1": { type: "youtube", id: "PLACEHOLDER_CH2_EP1", credit: "Muse Indonesia (kanal resmi)", unverified: true },

  // Chihayafuru Season 3 (AniList 104466), kanal resmi Muse Indonesia
  "104466:1": { type: "youtube", id: "PLACEHOLDER_CH3_EP1", credit: "Muse Indonesia (kanal resmi)", unverified: true },

  // Black Bullet (AniList 20785), kanal resmi Muse Indonesia
  "20785:1": { type: "youtube", id: "PLACEHOLDER_BB_EP1", credit: "Muse Indonesia (kanal resmi)", unverified: true },

  // The Seven Deadly Sins (AniList 20467), kanal resmi Muse Indonesia
  "20467:1": { type: "youtube", id: "PLACEHOLDER_SDS_EP1", credit: "Muse Indonesia (kanal resmi)", unverified: true },

  // The Seven Deadly Sins: Signs of Holy War (AniList 21871), kanal resmi Muse Indonesia
  "21871:1": { type: "youtube", id: "PLACEHOLDER_SDS_SHW_EP1", credit: "Muse Indonesia (kanal resmi)", unverified: true },

  // The Seven Deadly Sins: Revival of The Commandments (AniList 33354), kanal resmi Muse Indonesia
  "33354:1": { type: "youtube", id: "PLACEHOLDER_SDS_ROTC_EP1", credit: "Muse Indonesia (kanal resmi)", unverified: true },

  // Tanpa Sadar Levelku Jadi Paling Tinggi Season 1 (AniList 144728), kanal resmi Muse Indonesia
  "144728:1": { type: "youtube", id: "PLACEHOLDER_TSL_S1_EP1", credit: "Muse Indonesia (kanal resmi)", unverified: true },

  // Tanpa Sadar Levelku Jadi Paling Tinggi Season 2 (AniList 164541), kanal resmi Muse Indonesia
  "164541:1": { type: "youtube", id: "PLACEHOLDER_TSL_S2_EP1", credit: "Muse Indonesia (kanal resmi)", unverified: true },

  // Garda Belakang (AniList 198376) - sudah ada sebagai BanG Dream! YUME∞MITA
  // Note: BanG Dream! YUME∞MITA sudah terdaftar di atas (198376)

  // The Detective Is Already Dead Season 2 (AniList 161594), kanal resmi Muse Indonesia
  "161594:1": { type: "youtube", id: "PLACEHOLDER_TDIA_S2_EP1", credit: "Muse Indonesia (kanal resmi)", unverified: true },

  // Sasaki and Peeps Season 2 (AniList 187765), kanal resmi Muse Indonesia
  // Note: Sasaki Season 1 sudah ada (152682)
  "187765:1": { type: "youtube", id: "PLACEHOLDER_SAS_S2_EP1", credit: "Muse Indonesia (kanal resmi)", unverified: true },

  // BlazBlue Alternative: Dark War (AniList 162847), kanal resmi Muse Indonesia
  "162847:1": { type: "youtube", id: "PLACEHOLDER_BB_Alt_EP1", credit: "Muse Indonesia (kanal resmi)", unverified: true },

  // Ikan yang Lepas / The Fish That Got Away (AniList 171035), kanal resmi Muse Indonesia
  "171035:1": { type: "youtube", id: "PLACEHOLDER_IYL_EP1", credit: "Muse Indonesia (kanal resmi)", unverified: true }
};

// Sumber yang sudah terverifikasi saja yang boleh diputar.
// Entri `unverified` tetap disimpan agar atribusinya bisa dilengkapi nanti.
export const getVideoSource = (animeId, episode) => {
  const entry = videoSources[`${animeId}:${episode}`];
  return entry && entry.unverified !== true ? entry : null;
};

// Status sumber untuk memberi pesan yang jujur di UI.
// "available" | "unverified" | "none"
export const getSourceStatus = (animeId, episode) => {
  const entry = videoSources[`${animeId}:${episode}`];
  if (!entry) return "none";
  return entry.unverified === true ? "unverified" : "available";
};

// Apakah anime ini punya setidaknya satu episode dengan sumber terverifikasi.
export const hasPlayableSource = (animeId) =>
  Object.keys(videoSources).some((key) => {
    if (!key.startsWith(`${animeId}:`)) return false;
    const entry = videoSources[key];
    return Boolean(entry) && entry.unverified !== true;
  });

// Daftar id anime yang punya sumber terverifikasi (untuk katalog "Bisa Ditonton").
export const playableAnimeIds = [
  ...new Set(
    Object.keys(videoSources)
      .filter((key) => {
        const entry = videoSources[key];
        return Boolean(entry) && entry.unverified !== true;
      })
      .map((key) => Number(key.split(":")[0]))
      .filter((n) => Number.isInteger(n) && n > 0)
  )
];
