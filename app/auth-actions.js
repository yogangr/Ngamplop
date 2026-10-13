"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sql, ensureTable } from "@/lib/db";
import {
  MIN_PASSWORD,
  hashPassword,
  cariUserDariPassword,
  mulaiSesi,
  akhiriSesi,
  requireUser,
  clientIp,
  terlaluBanyakGagal,
  catatGagal,
  hapusGagal,
} from "@/lib/auth";

export async function login(formData) {
  const pw = String(formData.get("password") ?? "");
  if (!pw) return { error: "Masukkan password." };

  await ensureTable();
  const ip = await clientIp();
  if (await terlaluBanyakGagal(ip)) {
    return { error: "Terlalu banyak percobaan gagal. Coba lagi dalam 15 menit." };
  }

  const user = await cariUserDariPassword(pw);
  if (!user) {
    await catatGagal(ip);
    return { error: "Password salah." };
  }

  await hapusGagal(ip);
  await mulaiSesi(user.id);
  redirect("/");
}

// Dipakai sekali saja: membuat pengguna pertama saat belum ada pengguna sama sekali.
// Catatan lama (sebelum ada login) otomatis menjadi milik pengguna pertama ini.
export async function buatPenggunaPertama(formData) {
  const pw = String(formData.get("password") ?? "");
  const ulang = String(formData.get("ulang") ?? "");
  if (pw.length < MIN_PASSWORD) return { error: `Password minimal ${MIN_PASSWORD} karakter.` };
  if (pw !== ulang) return { error: "Kedua password tidak sama." };

  await ensureTable();
  const hash = await hashPassword(pw);
  const rows = await sql`
    INSERT INTO users (password_hash)
    SELECT ${hash} WHERE NOT EXISTS (SELECT 1 FROM users)
    RETURNING id`;
  if (!rows[0]) return { error: "Pengguna sudah ada. Silakan masuk." };

  await sql`UPDATE kondangan SET user_id = ${rows[0].id} WHERE user_id IS NULL`;
  await mulaiSesi(rows[0].id);
  redirect("/");
}

export async function tambahPengguna(formData) {
  await requireUser();
  const pw = String(formData.get("password") ?? "");
  const ulang = String(formData.get("ulang") ?? "");
  if (pw.length < MIN_PASSWORD) return { error: `Password minimal ${MIN_PASSWORD} karakter.` };
  if (pw !== ulang) return { error: "Kedua password tidak sama." };

  // Password adalah satu-satunya identitas, jadi tidak boleh kembar.
  if (await cariUserDariPassword(pw)) {
    return { error: "Password ini tidak bisa dipakai. Coba password lain." };
  }

  await sql`INSERT INTO users (password_hash) VALUES (${await hashPassword(pw)})`;
  revalidatePath("/");
  return { ok: true };
}

export async function logout() {
  await akhiriSesi();
  redirect("/login");
}
