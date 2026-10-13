-- Opsional: semua tabel dibuat otomatis oleh aplikasi saat pertama dibuka.
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kondangan (
  id         SERIAL PRIMARY KEY,
  user_id    INT REFERENCES users(id) ON DELETE CASCADE,
  nama       TEXT NOT NULL,
  alamat     TEXT NOT NULL,
  kategori   TEXT NOT NULL,
  tanggal    DATE NOT NULL,
  uang       BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS kondangan_user_idx ON kondangan (user_id);

CREATE TABLE IF NOT EXISTS login_gagal (
  id    SERIAL PRIMARY KEY,
  ip    TEXT NOT NULL,
  waktu TIMESTAMPTZ NOT NULL DEFAULT now()
);
