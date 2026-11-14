# Job Collector

Skrip Python (tanpa AI, tanpa dependensi tambahan) untuk mengumpulkan **draft** lowongan posisi data/AI
dari API lowongan publik resmi milik sistem rekrutmen perusahaan: Greenhouse, Lever, SmartRecruiters, Ashby.

LinkedIn, Glints, Jobstreet, dan situs sejenis **tidak didukung** karena ketentuan layanannya melarang
pengambilan data otomatis. Lowongan dari sana dimasukkan manual oleh admin, dengan link ke sumber aslinya.

## Cara pakai

1. Salin `companies.example.json` menjadi `companies.json`, lalu isi perusahaan target.
   - Buka halaman karier perusahaan. Kalau URL-nya `boards.greenhouse.io/<slug>`, `jobs.lever.co/<slug>`,
     `jobs.smartrecruiters.com/<slug>`, atau `jobs.ashbyhq.com/<slug>`, catat ATS dan slug-nya.
2. Jalankan:

```bash
python3 collect_jobs.py --config companies.json --out hasil/lowongan
```

3. Buka `hasil/lowongan.csv`, review, lalu masukkan yang relevan lewat admin Lowongan di `intelligo.id/admin`.

## Cara kerja

- Filter judul memakai pola kata kunci (`include_patterns`, `exclude_patterns`, bisa diganti di config).
- Filter lokasi memakai daftar `locations` di config (kosongkan untuk semua lokasi).
- Skill dan level dideteksi dari kata kunci, bukan AI.
- Deskripsi lengkap tidak disimpan. Setiap baris menyimpan `apply_url` dan `source_name` sebagai sumber.
- Jeda 1 detik antar-request supaya sopan ke server sumber.
