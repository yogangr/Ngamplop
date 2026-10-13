"use client";

import { useState, useTransition } from "react";
import { login, buatPenggunaPertama } from "@/app/auth-actions";
import PasswordInput from "./PasswordInput";
import { Envelope } from "./Icons";

export default function LoginForm({ pertama }) {
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function submit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError("");
    start(async () => {
      const res = pertama ? await buatPenggunaPertama(fd) : await login(fd);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <main className="login">
      <form className="login-card" onSubmit={submit}>
        <span className="brand-mark">
          <Envelope width={26} height={26} />
        </span>
        <div>
          <h1>{pertama ? "Buat password pertama" : "Buku Kondangan"}</h1>
          <p className="sub">
            {pertama
              ? "Belum ada pengguna. Password ini akan dipakai untuk masuk, dan catatan lama (jika ada) otomatis jadi milik Anda."
              : "Masukkan password untuk membuka catatan Anda."}
          </p>
        </div>

        <PasswordInput name="password" label={pertama ? "Password (minimal 8 karakter)" : "Password"} baru={pertama} autoFocus />
        {pertama && <PasswordInput name="ulang" label="Ulangi password" baru />}

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <button className="btn primary" disabled={pending}>
          {pending ? "Memproses…" : pertama ? "Buat dan masuk" : "Masuk"}
        </button>
      </form>
    </main>
  );
}
