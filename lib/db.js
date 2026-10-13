import { neon } from "@neondatabase/serverless";

export const KATEGORI = [
  "Teman SD",
  "Teman SMP",
  "Teman SMA",
  "Teman kuliah",
  "Tetangga",
  "Saudara",
];

// Koneksi dibuat saat pertama dipakai, supaya build tidak gagal bila env belum ada.
let _sql;
export const sql = (strings, ...values) => (_sql ??= neon(process.env.DATABASE_URL))(strings, ...values);

let ready;
export function ensureTable() {
  ready ??= (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id         SERIAL PRIMARY KEY,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`;
    await sql`
      CREATE TABLE IF NOT EXISTS kondangan (
        id         SERIAL PRIMARY KEY,
        nama       TEXT NOT NULL,
        alamat     TEXT NOT NULL,
        kategori   TEXT NOT NULL,
        tanggal    DATE NOT NULL,
        uang       BIGINT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`;
    await sql`ALTER TABLE kondangan ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id) ON DELETE CASCADE`;
    await sql`CREATE INDEX IF NOT EXISTS kondangan_user_idx ON kondangan (user_id)`;
    await sql`
      CREATE TABLE IF NOT EXISTS login_gagal (
        id    SERIAL PRIMARY KEY,
        ip    TEXT NOT NULL,
        waktu TIMESTAMPTZ NOT NULL DEFAULT now()
      )`;
  })().catch((e) => {
    ready = undefined;
    throw e;
  });
  return ready;
}
