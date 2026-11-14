# Roadmap Job Ready Hub

Catatan fitur yang sudah disetujui. Diperbarui 14 November 2026.
Semua fitur baru dilindungi feature flag dan bisa dinyalakan satu per satu dari `intelligo.id/admin`.

## Tahap 1 - Fondasi
- [x] **Job Board khusus alumni.** Kunci `/api/public/jobs` jadi endpoint yang wajib login alumni. Tidak ada data lowongan yang publik.
- [x] **Lamaran Saya (application tracker).** Diisi manual oleh alumni: posisi, perusahaan, link lowongan dari mana saja, tanggal, catatan. Status: Disimpan, Melamar, Tes/Interview, Offer, Diterima, Ditolak. Bisa diisi otomatis dari Job Board.
- [ ] **Pengumuman di dashboard** (dikelola admin).
- [ ] **Import data Google Form** pendataan alumni ke akun alumni + kode akses (admin).

## Tahap 2 - Belajar
- [x] **Video Course.** Course, modul, video; progres tonton dan lanjutkan. Admin mengelola course. Hosting video belum diputuskan (YouTube unlisted atau Vimeo/Bunny Stream dengan pembatasan domain).
- [x] **Kalender live session** gratis untuk alumni Job Ready. Kalender dan daftar sesi, tombol tambah ke Google Calendar, link Zoom/Meet hanya untuk alumni yang login. Rekaman bisa masuk ke Video Course. Opsional: tombol "Saya ikut".
- [ ] **Jadwal sesi mentor** (review CV, mock interview).

## Tahap 3 - Latihan
- [ ] Bank pertanyaan interview per posisi + panduan STAR.
- [ ] Coding Test SQL.
- [ ] Studi kasus take-home dengan dataset dan rubrik.
- [ ] Optimasi LinkedIn dengan AI.

## Tahap 4 - Motivasi dan mitra
- [ ] Target mingguan di dashboard.
- [ ] Profil talenta untuk mitra (admin), hanya alumni yang setuju profilnya dibagikan.
- [ ] Laporan keberhasilan (admin), angka jujur dari data Lamaran Saya.

## Dicatat untuk nanti
### Hiring Partner Intelligo (eksklusif)
- Perusahaan mitra memasang lowongan langsung di Intelligo, dan alumni Job Ready siap melamar.
- Lowongan mitra tampil di Job Board sebagai "Eksklusif Hiring Partner", hanya untuk alumni yang login.
- Langkah pertama: user menyusun proposal untuk perusahaan calon mitra. Pengembangan fitur menunggu proposal dan mitra pertama.
- Ide pengembangan nanti: form posting lowongan untuk mitra, profil talenta (Tahap 4) sebagai bahan rujukan, laporan kandidat per lowongan.
- Klaim tetap jujur: peluang interview, bukan jaminan diterima kerja.

### Lainnya
- Bot WA loker (WAHA + n8n + OpenAI + Google Sheet): lihat `automation/wa-loker/RANGKUMAN.md`.
- Job collector dari API ATS publik: lihat `scripts/job_collector/`.
- Proposal kerja sama data lowongan dengan platform loker (Glints, Kalibrr, Jobstreet, KarirHub).
- Hapus kode Hub dari repo landing page setelah subdomain terverifikasi.

## Keputusan yang masih terbuka
- Hosting video course.
- Zoom atau Google Meet untuk live session; satu link tetap atau per sesi.
- Urutan kerja: Tahap 1 dulu, atau Video Course dan Kalender dulu.
