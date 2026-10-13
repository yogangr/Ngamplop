import { redirect } from "next/navigation";
import { sql, ensureTable } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import LoginForm from "@/components/LoginForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Masuk | Buku Kondangan" };

export default async function LoginPage() {
  if (!process.env.DATABASE_URL || !process.env.SESSION_SECRET) {
    return (
      <main className="wrap">
        <p className="error-box">
          <code>DATABASE_URL</code> dan <code>SESSION_SECRET</code> belum diatur di <code>.env.local</code>.
        </p>
      </main>
    );
  }

  await ensureTable();
  if (await currentUser()) redirect("/");

  const [{ n }] = await sql`SELECT count(*)::int AS n FROM users`;
  return <LoginForm pertama={n === 0} />;
}
