import { redirect } from "next/navigation";
import { sql, ensureTable } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import Kondangan from "@/components/Kondangan";

export const dynamic = "force-dynamic";

export default async function Page() {
  if (!process.env.DATABASE_URL || !process.env.SESSION_SECRET) {
    return (
      <main className="wrap">
        <h1 className="title">AMPLOP</h1>
        <p className="error-box">
          <code>DATABASE_URL</code> dan <code>SESSION_SECRET</code> belum
          diatur. Salin <code>.env.example</code> ke <code>.env.local</code>,
          isi keduanya, lalu jalankan ulang.
        </p>
      </main>
    );
  }

  await ensureTable();
  const user = await currentUser();
  if (!user) redirect("/login");

  const rows = await sql`
    SELECT id, nama, alamat, kategori,
           to_char(tanggal, 'YYYY-MM-DD') AS tanggal,
           uang::bigint AS uang
    FROM kondangan
    WHERE user_id = ${user.id}
    ORDER BY kondangan.tanggal DESC, id DESC`;
  const [{ n }] = await sql`SELECT count(*)::int AS n FROM users`;

  const entries = rows.map((r) => ({ ...r, uang: Number(r.uang) }));
  return <Kondangan entries={entries} jumlahPengguna={n} />;
}
