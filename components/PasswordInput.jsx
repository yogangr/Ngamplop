"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "./Icons";

export default function PasswordInput({ name, label, baru = false, autoFocus = false }) {
  const id = useId();
  const [lihat, setLihat] = useState(false);
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="pw">
        <input
          id={id}
          name={name}
          type={lihat ? "text" : "password"}
          required
          minLength={baru ? 8 : undefined}
          autoFocus={autoFocus}
          autoComplete={baru ? "new-password" : "current-password"}
        />
        <button
          type="button"
          className="icon-btn"
          onClick={() => setLihat((v) => !v)}
          aria-label={lihat ? "Sembunyikan password" : "Tampilkan password"}
        >
          {lihat ? <EyeOff /> : <Eye />}
        </button>
      </div>
    </div>
  );
}
