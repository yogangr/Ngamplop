"use client";

import { useEffect, useState, useTransition } from "react";
import { createEntry, updateEntry } from "@/app/actions";
import { KATEGORI, warna, rupiah, hariIni } from "./kategori";
import { Close } from "./Icons";

const CEPAT = [50000, 100000, 150000, 200000, 300000, 500000, 1000000];
const singkat = (n) => (n >= 1000000 ? `${n / 1000000} jt` : `${n / 1000} rb`);

export default function EntrySheet({ entry, onClose, onSaved }) {
  const [uang, setUang] = useState(entry ? String(entry.uang) : "");
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
      const res = entry ? await updateEntry(entry.id, fd) : await createEntry(fd);
      if (res?.error) return setError(res.error);
      onSaved(entry ? "Perubahan disimpan" : "Catatan ditambahkan");
    });
  }

  const nominal = Number(uang);

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title" onSubmit={submit}>
        <div className="sheet-head">
          <h2 id="sheet-title">{entry ? "Ubah catatan" : "Catat kondangan"}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Tutup">
            <Close />
          </button>
        </div>

        <label className="field">
          <span>Nama</span>
          <input name="nama" required autoFocus autoComplete="off" defaultValue={entry?.nama} placeholder="Siapa yang mengundang?" />
        </label>

        <label className="field">
          <span>Alamat</span>
          <input name="alamat" required autoComplete="off" defaultValue={entry?.alamat} placeholder="Lokasi acara, mis. Gedung Serbaguna, Kediri" />
        </label>

        <fieldset className="field">
          <legend>Kategori</legend>
          <div className="choice">
            {KATEGORI.map((k, i) => (
              <label key={k.nama} className="choice-item" style={warna(k)}>
                <input type="radio" name="kategori" value={k.nama} required={i === 0} defaultChecked={entry?.kategori === k.nama} />
                <span>{k.nama}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="field">
          <span>Tanggal</span>
          <input type="date" name="tanggal" required defaultValue={entry?.tanggal ?? hariIni()} />
        </label>

        <div className="field">
          <label htmlFor="uang">Uang</label>
          <div className="money-input">
            <b>Rp</b>
            <input
              id="uang"
              name="uang"
              type="number"
              required
              min="0"
              step="1000"
              inputMode="numeric"
              value={uang}
              onChange={(e) => setUang(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="quick" role="group" aria-label="Nominal cepat">
            {CEPAT.map((n) => (
              <button key={n} type="button" aria-pressed={nominal === n} onClick={() => setUang(String(n))}>
                {singkat(n)}
              </button>
            ))}
          </div>
          <p className="hint">{nominal > 0 ? rupiah(nominal) : "Pilih nominal cepat atau ketik sendiri."}</p>
        </div>

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
            {pending ? "Menyimpan…" : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}
