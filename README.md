# Intelligo ID - Job Ready Hub

Dashboard karier untuk alumni Intelligo ID, berjalan di https://jobready.intelligo.id.

- Stack: Vite + React + TypeScript + Tailwind + shadcn/ui.
- Backend: belum dipisah. `/api/*` di-rewrite ke `https://www.intelligo.id/api/*` (lihat `vercel.json`),
  jadi browser tetap satu origin. Saat dev lokal, Vite mem-proxy `/api` ke alamat yang sama.
- Admin (kode akses alumni, feature flag, analitik) tetap di `intelligo.id/admin`.

## Route

| Path | Halaman |
|---|---|
| `/` | Dashboard (butuh login) |
| `/login` | Login dengan kode akses |
| `/profile`, `/cv-analyzer`, `/cv-builder`, `/cover-letter`, `/interview-prep`, `/interview-realtime`, `/jobs`, `/coding-test` | Fitur hub, dibatasi feature flag admin |
| `/u/:username` | Profil publik alumni |
| `/job-ready-hub/*` | Redirect ke path baru |

Fitur yang dimatikan admin disembunyikan dari menu dan dashboard.

## Pengembangan

```bash
npm ci
npm run dev
npm run build
```

Tidak ada environment variable yang dibutuhkan frontend. Jangan commit file `.env`.
