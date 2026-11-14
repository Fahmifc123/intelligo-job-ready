# Bot WA Loker: WAHA + n8n + OpenAI + Google Sheet

Rangkuman rencana bot WhatsApp untuk **input** dan **pengiriman** info loker ke grup alumni Intelligo ID.
Status: rencana, belum dibangun. Dokumen ini ringkasan diskusi 14 November 2026.

## Tujuan

1. **Input:** admin kirim teks loker apa saja + link ke nomor bot, lalu OpenAI mengekstrak datanya dan menyimpannya ke Google Sheet sebagai draft.
2. **Kirim:** setiap hari n8n mengambil loker yang disetujui dari Sheet dan mengirim satu pesan rangkuman ke grup WA alumni.

## Komponen

| Komponen | Fungsi | Catatan |
|---|---|---|
| WAHA | WhatsApp HTTP API: terima pesan (webhook) dan kirim pesan | Bukan API resmi WhatsApp. Jalan di Docker, harus menyala terus (VPS) |
| n8n | Orkestrasi workflow | Self-hosted di VPS yang sama atau n8n Cloud |
| OpenAI API | Ekstrak teks loker jadi JSON | Model kecil cukup. Key disimpan di credential n8n |
| Google Sheet | Database loker sederhana | Disambungkan lewat credential Google di n8n |
| Nomor WA khusus bot | Akun yang dijalankan WAHA | **Jangan** pakai nomor utama Mintell |

## Alur 1: Input loker via WA

```
Admin -> chat pribadi ke nomor bot
  -> WAHA webhook -> n8n
     1. Cek pengirim ada di daftar nomor admin (env), selain itu abaikan
     2. Cek ada link https:// di teks, kalau tidak: balas "Kirim link sumber lowongannya"
     3. Cek duplikat: link sudah ada di Sheet -> balas "Sudah ada di baris N"
     4. OpenAI ekstrak -> JSON (format tetap)
     5. Validasi JSON (posisi, perusahaan, link wajib)
     6. Tambah baris ke Sheet, status = draft
     7. Balas ringkasan ke admin + nomor baris
```

Perintah balasan admin:

| Perintah | Aksi |
|---|---|
| `kirim <baris>` | Ubah status jadi `siap kirim` |
| `hapus <baris>` | Ubah status jadi `dibatalkan` |

### Field yang diekstrak

`posisi`, `perusahaan`, `lokasi`, `sistem_kerja` (Onsite/Hybrid/Remote), `level`, `tipe` (Full-time/Contract/Internship),
`skill` (daftar), `deadline` (YYYY-MM-DD), `link_sumber`, `nama_sumber` (dari domain link), `ringkasan` (1-2 kalimat).

### Aturan ekstraksi (untuk prompt OpenAI)

- Hanya isi field yang ada di teks. Field yang tidak disebut dibiarkan kosong, tidak boleh ditebak (contoh: gaji).
- **Jangan** ambil nama, nomor HP, atau email recruiter (data pribadi, UU PDP).
- Ringkasan ditulis ulang dengan kata-kata sendiri, bukan salinan deskripsi.
- Output wajib JSON sesuai skema (pakai mode JSON / structured output).

## Alur 2: Kirim rangkuman ke grup

```
n8n Schedule (mis. setiap hari 09.00 WIB)
  1. Ambil baris status = siap kirim (maks. 5)
  2. Susun satu pesan rangkuman
  3. WAHA sendText ke chatId grup alumni
  4. Tandai baris: status = terkirim, tanggal_kirim = hari ini
```

Contoh pesan:

```
Info Loker Data & AI - 15 Nov 2026

1. Data Analyst - PT Contoh (Jakarta, Hybrid, Entry level)
   Sumber: LinkedIn
   https://...

Lowongan dikurasi tim Intelligo dari sumber publik. Lamar langsung lewat link sumber.
Pertanyaan: intelligo.id/wa-mintell
```

## Struktur Google Sheet

| Kolom | Isi |
|---|---|
| id | Nomor baris / ID unik |
| dibuat_pada | Waktu input |
| dibuat_oleh | Nomor admin (cukup 4 digit terakhir) |
| posisi, perusahaan, lokasi, sistem_kerja, level, tipe | Hasil ekstraksi |
| skill | Dipisah koma |
| deadline | YYYY-MM-DD |
| link_sumber, nama_sumber | Wajib |
| ringkasan | 1-2 kalimat |
| status | draft / siap kirim / terkirim / dibatalkan |
| tanggal_kirim | Diisi saat terkirim ke grup |

Hasil `scripts/job_collector/collect_jobs.py` bisa ditempel ke Sheet yang sama dengan status `draft`.

## Risiko dan mitigasi

| Risiko | Mitigasi |
|---|---|
| Nomor bot diblokir (WAHA tidak resmi, melanggar ketentuan WhatsApp) | Nomor khusus bot; kirim 1 rangkuman/hari; hanya ke grup alumni yang tahu ada bot; tanpa pesan pribadi massal |
| Orang lain mengisi Sheet | Allowlist nomor admin di env n8n |
| AI salah ekstrak / mengarang | Field kosong bila tidak ada; semua hasil masuk draft dan direview admin |
| Hak cipta deskripsi loker | Simpan fakta + ringkasan sendiri + link sumber, bukan teks utuh |
| Data pribadi recruiter | Tidak diekstrak dan tidak disimpan |
| Secret bocor | API key, password, dan daftar nomor admin di env/credential n8n, tidak di workflow atau repo |

Alternatif resmi: WhatsApp Business Platform (Cloud API) dari Meta. Dukungan kirim ke grup terbatas dan aturannya bisa berubah, cek dokumentasi Meta sebelum memilih. WhatsApp Channel bisa jadi pilihan untuk siaran satu arah (posting manual).

## Kebutuhan setup

1. VPS dengan Docker (untuk WAHA dan n8n).
2. Nomor WA khusus bot, lalu scan QR di dashboard WAHA.
3. Masukkan nomor bot ke grup alumni, ambil `chatId` grup dari WAHA.
4. OpenAI API key (credential n8n).
5. Google Sheet + credential Google di n8n.
6. Env n8n: daftar nomor admin, `chatId` grup, URL WAHA, API key WAHA.

## Rencana file (belum dibuat)

```
automation/wa-loker/
  docker-compose.yml           WAHA + n8n
  .env.example                 nama variabel saja, tanpa nilai
  workflows/input-loker.json   Alur 1
  workflows/kirim-loker.json   Alur 2
  prompt-ekstraksi.md          Prompt + skema JSON
  sheet-template.csv           Header kolom Sheet
  SETUP.md                     Panduan langkah demi langkah
```

## Keputusan yang masih terbuka

- Pakai WAHA (tidak resmi, cepat) atau WhatsApp Cloud API (resmi, terbatas untuk grup).
- Lokasi hosting (VPS mana) dan siapa yang memegang nomor bot.
- Jam kirim dan jumlah loker maksimal per hari.
- Grup mana saja yang menerima rangkuman.
