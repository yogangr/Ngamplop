"use server";

import { revalidatePath } from "next/cache";
import { sql, ensureTable, KATEGORI } from "@/lib/db";
import { requireUser } from "@/lib/auth";

function parse(formData) {
  const nama = String(formData.get("nama") ?? "").trim();
  const alamat = String(formData.get("alamat") ?? "").trim();
  const kategori = String(formData.get("kategori") ?? "");
  const tanggal = String(formData.get("tanggal") ?? "");
  const uang = Math.round(Number(formData.get("uang") ?? 0));

  if (!nama) return { error: "Nama wajib diisi." };
  if (!alamat) return { error: "Alamat wajib diisi." };
  if (!KATEGORI.includes(kategori)) return { error: "Pilih kategori." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) return { error: "Tanggal tidak valid." };
  if (!Number.isFinite(uang) || uang < 0) return { error: "Jumlah uang tidak valid." };

  return { data: { nama, alamat, kategori, tanggal, uang } };
}

export async function createEntry(formData) {
  const user = await requireUser();
  const { data, error } = parse(formData);
  if (error) return { error };
  await ensureTable();
  await sql`
    INSERT INTO kondangan (user_id, nama, alamat, kategori, tanggal, uang)
    VALUES (${user.id}, ${data.nama}, ${data.alamat}, ${data.kategori}, ${data.tanggal}, ${data.uang})`;
  revalidatePath("/");
  return { ok: true };
}

export async function updateEntry(id, formData) {
  const user = await requireUser();
  const { data, error } = parse(formData);
  if (error) return { error };
  await ensureTable();
  await sql`
    UPDATE kondangan
    SET nama = ${data.nama}, alamat = ${data.alamat}, kategori = ${data.kategori},
        tanggal = ${data.tanggal}, uang = ${data.uang}
    WHERE id = ${Number(id)} AND user_id = ${user.id}`;
  revalidatePath("/");
  return { ok: true };
}

export async function deleteEntry(id) {
  const user = await requireUser();
  await ensureTable();
  await sql`DELETE FROM kondangan WHERE id = ${Number(id)} AND user_id = ${user.id}`;
  revalidatePath("/");
  return { ok: true };
}
