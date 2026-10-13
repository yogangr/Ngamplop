import crypto from "node:crypto";
import { promisify } from "node:util";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "./db";

const scrypt = promisify(crypto.scrypt);
const COOKIE = "kondangan_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 hari
export const MIN_PASSWORD = 8;

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) throw new Error("SESSION_SECRET belum diatur (minimal 16 karakter).");
  return s;
}

/* ---------- Password ---------- */
export async function hashPassword(pw) {
  const salt = crypto.randomBytes(16);
  const key = await scrypt(pw, salt, 64);
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

async function cocok(pw, stored) {
  const [s, k] = stored.split(":");
  const asli = Buffer.from(k, "hex");
  const key = await scrypt(pw, Buffer.from(s, "hex"), 64);
  return key.length === asli.length && crypto.timingSafeEqual(key, asli);
}

// Login hanya dengan password, jadi password dicocokkan ke semua pengguna.
export async function cariUserDariPassword(pw) {
  const users = await sql`SELECT id, password_hash FROM users`;
  let ketemu = null;
  for (const u of users) {
    if (await cocok(pw, u.password_hash)) ketemu ??= { id: u.id };
  }
  return ketemu;
}

/* ---------- Sesi (cookie bertanda tangan) ---------- */
function sign(v) {
  return crypto.createHmac("sha256", secret()).update(v).digest("base64url");
}
function sama(a, b) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export async function mulaiSesi(userId) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const v = `${userId}.${exp}`;
  (await cookies()).set(COOKIE, `${v}.${sign(v)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function akhiriSesi() {
  (await cookies()).delete(COOKIE);
}

export async function currentUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const p = token.split(".");
  if (p.length !== 3) return null;
  const [id, exp, sig] = p;
  if (!sama(sig, sign(`${id}.${exp}`))) return null;
  if (Number(exp) < Date.now() / 1000) return null;
  const rows = await sql`SELECT id FROM users WHERE id = ${Number(id)}`;
  return rows[0] ?? null;
}

export async function requireUser() {
  const u = await currentUser();
  if (!u) redirect("/login");
  return u;
}

/* ---------- Pembatasan percobaan login ---------- */
export async function clientIp() {
  const h = await headers();
  return (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || "tidak-diketahui";
}
export async function terlaluBanyakGagal(ip) {
  const r = await sql`
    SELECT count(*)::int AS n FROM login_gagal
    WHERE ip = ${ip} AND waktu > now() - interval '15 minutes'`;
  return r[0].n >= 5;
}
export async function catatGagal(ip) {
  await sql`INSERT INTO login_gagal (ip) VALUES (${ip})`;
  await sql`DELETE FROM login_gagal WHERE waktu < now() - interval '1 day'`;
}
export async function hapusGagal(ip) {
  await sql`DELETE FROM login_gagal WHERE ip = ${ip}`;
}
