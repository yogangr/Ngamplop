"use client";

import { useEffect, useState, useTransition } from "react";
import { tambahPengguna } from "@/app/auth-actions";
import PasswordInput from "./PasswordInput";
import { Close } from "./Icons";

export default function UserSheet({ jumlah, onClose, onSaved }) {
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  function submit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError("");
    start(async () => {
      const res = await tambahPengguna(fd);
      if (res?.error) return setError(res.error);
      onSaved("Pengguna baru ditambahkan");
    });
  }

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="sheet" role="dialog" aria-modal="true" aria-labelledby="user-title" onSubmit={submit}>
        <div className="sheet-head">
          <h2 id="user-title">Tambah pengguna</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Tutup">
            <Close />
          </button>
        </div>

        <p className="hint">
          Pengguna baru masuk hanya dengan password. Setiap pengguna punya catatan kondangan sendiri.
          Saat ini ada {jumlah} pengguna.
        </p>

        <PasswordInput name="password" label="Password baru (minimal 8 karakter)" baru autoFocus />
        <PasswordInput name="ulang" label="Ulangi password" baru />

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <div className="sheet-actions">
          <button type="button" className="btn ghost" onClick={onClose}>
            Batal
          </button>
          <button className="btn primary" disabled={pending}>
            {pending ? "Menyimpan…" : "Tambah pengguna"}
          </button>
        </div>
      </form>
    </div>
  );
}
