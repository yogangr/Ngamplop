# Buku Kondangan

Aplikasi Next.js + Neon (Postgres) untuk mencatat kondangan: nama, alamat,
kategori, tanggal, dan uang. Login hanya dengan password.

## Cara menjalankan

1. Buat project di https://neon.tech lalu salin **connection string**.
2. `cp .env.example .env.local`, isi `DATABASE_URL` dan `SESSION_SECRET`
   (buat dengan `openssl rand -base64 32`).
3. `npm install`
4. `npm run dev` lalu buka http://localhost:3000

Saat pertama dibuka, Anda diminta membuat password pertama. Catatan lama
(sebelum ada login) otomatis menjadi milik pengguna pertama ini.

## Pengguna

- Login hanya dengan password; password dicocokkan ke semua pengguna.
- Pengguna yang sudah masuk bisa menambah pengguna baru lewat ikon orang-plus
  di pojok kanan atas. Password tidak boleh kembar dan minimal 8 karakter.
- Setiap pengguna hanya melihat catatannya sendiri.
- Password disimpan sebagai hash scrypt. Setelah 5 kali salah dari satu IP,
  login diblokir 15 menit.

## Deploy ke Vercel

Push ke GitHub, import di Vercel, tambahkan `DATABASE_URL` dan `SESSION_SECRET`.
