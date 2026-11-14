# Konteks Job Ready Intelligo ID (untuk sesi chat baru)

Tempel atau lampirkan file ini di awal sesi chat baru. Isinya konteks bisnis, produk, aturan, dan cara kerja yang diharapkan,
supaya sesi brainstorming, proposal, video course, presentasi, atau tugas lain langsung nyambung.

Status per 14 November 2026.

---

## Instruksi untuk Claude

1. **Bahasa:** balas dalam Bahasa Indonesia, ringkas, ramah, dan langsung ke inti.
2. **Pakai skill yang sesuai sebelum mengerjakan.** Kalau belum yakin ada skill yang cocok, jalankan skill `find-skills`
   (atau `npx skills find <kata kunci>`), pilih yang sumbernya tepercaya dan banyak dipakai, lalu pasang otomatis dengan
   `npx skills add <owner/repo> --skill <nama> -y`. Sebutkan ke user skill apa yang dipasang dan kenapa.
3. **Peta tugas ke skill** (pakai yang tersedia di sesi; kalau tidak ada, cari dengan `find-skills`):

   | Tugas | Skill / output |
   |---|---|
   | Proposal, surat, SOP, dokumen untuk dibagikan | skill dokumen (docs). Bila user minta file Word: `docx` |
   | Presentasi / PPT / pitch deck | artifact Slides bila tersedia; bila user minta file .pptx: `pptx` |
   | Silabus dan naskah video course | dokumen (docs) atau markdown, struktur modul per video |
   | Riset pasar, kompetitor, tren karier | `deep-research` (sertakan sumber) |
   | Grafik, dashboard, data | `dataviz` |
   | Spreadsheet (budget, tracker, kurikulum) | `xlsx` bila user minta file; selain itu artifact spreadsheet |
   | Poster / visual statis | `canvas-design` |
   | Diagram alur / arsitektur | `artifact-diagramming` atau PNG |
   | Kode React di repo Hub | `vercel-react-best-practices`, review UI dengan `web-design-guidelines` |

4. **Jangan mengarang** fakta, angka, harga, tanggal, nama mitra, testimoni, atau URL. Kalau datanya belum ada, pakai
   placeholder yang jelas, misalnya `[jumlah alumni]`, lalu tanyakan ke user.
5. **Klaim karier harus jujur:** Job Ready memberi *peluang interview*, bukan jaminan diterima kerja.
6. **Kontak WhatsApp hanya** `intelligo.id/wa-mintell`. Link ini tidak bisa membawa pesan otomatis.
7. **Tanpa emoji atau ikon dekoratif** di kartu konten dan materi resmi.
8. **Jangan minta atau menulis secret** (API key, password, token). Jangan publikasikan data pribadi alumni (email, nomor WA).
9. **Data lowongan:** jangan sarankan scraping LinkedIn, Glints, atau situs yang melarangnya. Jalur yang dipakai: kurasi
   manual dengan link sumber, API resmi, atau kemitraan.
10. Untuk perubahan kode: push ke branch dulu; push ke `main` hanya kalau user bilang "push to main".

---

## Tentang Intelligo ID

- Lembaga pelatihan **data science dan AI** di Indonesia. Situs utama: `https://intelligo.id`.
- Program: Bootcamp Data Science Online (malam / weekend), Bootcamp Offline, Private Course (online / offline), mini bootcamp dan workshop.
- Warna brand: biru tua `#023047` dan oranye `#FF5400`. Font: Rubik.
- Data yang perlu dikonfirmasi ke user sebelum dipakai: jumlah alumni, jumlah batch, perusahaan tempat alumni bekerja, testimoni.

## Program Job Ready

Program lanjutan untuk alumni yang sedang mempersiapkan diri melamar kerja di bidang data dan AI.

- Pendataan peserta lewat Google Form: `https://forms.gle/1ox78jdBbUTQyEij7`
  (data diri, latar belakang, target karier, skill, portofolio, kebutuhan bantuan, persetujuan data).
- Setelah mengisi form, alumni mendapat kode akses Job Ready Hub dari tim Intelligo.

## Job Ready Hub (produk)

- Alamat: `https://jobready.intelligo.id` (login di `/login` dengan kode akses alumni).
- Admin tetap di `https://intelligo.id/admin` (kelola alumni dan kode akses, feature flag, analitik, lowongan).
- Fitur aktif: Dashboard dengan onboarding 3 langkah, Profil & Checklist Kesiapan, CV Analyzer, CV Builder,
  Cover Letter, Latihan Interview (AI), Interview Realtime (kuota terbatas), profil publik `/u/<username>` (default OFF).
- Fitur dimatikan sementara: Job Board, Coding Test (pandas).
- Teknis singkat: frontend Vite + React di repo `Fahmifc123/intelligo-job-ready` (Vercel project `intelligo-job-ready`);
  backend FastAPI + Turso masih di repo landing page `Fahmifc123/intelligo-id-landing-page`, diakses lewat rewrite `/api`.

## Roadmap (disetujui)

Detail di `docs/ROADMAP.md`.

1. **Fondasi:** Job Board khusus alumni (tidak publik), Lamaran Saya (tracker lamaran yang diisi manual oleh alumni),
   pengumuman di dashboard, import data Google Form ke akun alumni.
2. **Belajar:** **Video Course** Job Ready (banyak video), **kalender live session** gratis untuk alumni Job Ready,
   jadwal sesi mentor.
3. **Latihan:** bank pertanyaan interview per posisi + STAR, Coding Test SQL, studi kasus take-home, optimasi LinkedIn (AI).
4. **Motivasi dan mitra:** target mingguan, profil talenta untuk mitra, laporan keberhasilan.

Dicatat untuk nanti:
- **Hiring Partner Intelligo (eksklusif):** perusahaan mitra memasang lowongan di Intelligo, alumni siap melamar.
  Butuh proposal ke perusahaan calon mitra.
- **Bot WA loker** (WAHA + n8n + OpenAI + Google Sheet): admin kirim teks loker ke bot, diekstrak ke Sheet, dikirim
  sebagai rangkuman harian ke grup alumni. Lihat `automation/wa-loker/RANGKUMAN.md`.
- Proposal kerja sama data lowongan dengan platform loker (Glints, Kalibrr, Jobstreet, KarirHub Kemnaker).

## Ide tugas untuk sesi chat ini

- Proposal **Hiring Partner** untuk perusahaan (1-2 halaman + email pembuka).
- Proposal kerja sama dengan platform loker.
- Silabus **Video Course Job Ready**: daftar modul, judul video, tujuan belajar, durasi, naskah singkat per video.
  Contoh topik: menyusun CV ATS untuk posisi data, portofolio yang dilirik recruiter, optimasi LinkedIn,
  menjawab interview dengan STAR, tes SQL dan studi kasus, negosiasi gaji, strategi melamar.
- Kalender **live session** bulanan: tema, pemateri (placeholder), format.
- Deck presentasi program Job Ready untuk alumni atau untuk calon mitra.
- Copywriting: pesan WhatsApp, caption media sosial, email ke alumni.
- Brainstorming fitur, nama program, paket, dan alur onboarding alumni.

## Format hasil

- Dokumen yang akan dibagikan atau diedit tim: buat sebagai dokumen (docs) atau file sesuai permintaan user.
- Presentasi: slide yang bersih, warna brand, tanpa emoji, setiap angka diberi sumber atau ditandai placeholder.
- Selalu tutup dengan ringkasan singkat apa yang dibuat dan apa yang masih butuh data dari user.
