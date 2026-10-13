"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { deleteEntry } from "@/app/actions";
import { logout } from "@/app/auth-actions";
import {
  KATEGORI,
  metaOf,
  warna,
  rupiah,
  tanggalPendek,
  bulanLabel,
} from "./kategori";
import {
  Plus,
  Search,
  Sliders,
  Pin,
  Pencil,
  Trash,
  Envelope,
  UserPlus,
  Logout,
} from "./Icons";
import EntrySheet from "./EntrySheet";
import UserSheet from "./UserSheet";

export default function Kondangan({ entries, jumlahPengguna }) {
  const [sheet, setSheet] = useState(null); // null | { entry: obj | null }
  const [hapus, setHapus] = useState(null);
  const [toast, setToast] = useState("");
  const [pengguna, setPengguna] = useState(false);
  const [pending, start] = useTransition();

  const [q, setQ] = useState("");
  const [kat, setKat] = useState("Semua");
  const [lanjutan, setLanjutan] = useState(false);
  const [dari, setDari] = useState("");
  const [sampai, setSampai] = useState("");
  const [min, setMin] = useState("");
  const [maks, setMaks] = useState("");
  const [urut, setUrut] = useState("terbaru");

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!hapus) return;
    const onKey = (e) => e.key === "Escape" && setHapus(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [hapus]);

  const total = entries.reduce((a, e) => a + e.uang, 0);
  const rata = entries.length ? Math.round(total / entries.length) : 0;
  const tahun = String(new Date().getFullYear());
  const tahunIni = entries
    .filter((e) => e.tanggal.startsWith(tahun))
    .reduce((a, e) => a + e.uang, 0);

  const perKategori = useMemo(() => {
    const m = Object.fromEntries(
      KATEGORI.map((k) => [k.nama, { n: 0, uang: 0 }]),
    );
    for (const e of entries) {
      if (m[e.kategori]) {
        m[e.kategori].n += 1;
        m[e.kategori].uang += e.uang;
      }
    }
    return m;
  }, [entries]);

  const jumlahLanjutan =
    [dari, sampai, min, maks].filter((v) => v !== "").length +
    (urut !== "terbaru" ? 1 : 0);
  const adaFilter = kat !== "Semua" || q.trim() || jumlahLanjutan > 0;

  function reset() {
    setQ("");
    setKat("Semua");
    setDari("");
    setSampai("");
    setMin("");
    setMaks("");
    setUrut("terbaru");
  }

  const visible = useMemo(() => {
    const t = q.trim().toLowerCase();
    const list = entries.filter((e) => {
      if (kat !== "Semua" && e.kategori !== kat) return false;
      if (dari && e.tanggal < dari) return false;
      if (sampai && e.tanggal > sampai) return false;
      if (min !== "" && e.uang < Number(min)) return false;
      if (maks !== "" && e.uang > Number(maks)) return false;
      if (
        t &&
        !(
          e.nama.toLowerCase().includes(t) || e.alamat.toLowerCase().includes(t)
        )
      )
        return false;
      return true;
    });
    const sorters = {
      terbaru: (a, b) => b.tanggal.localeCompare(a.tanggal) || b.id - a.id,
      terlama: (a, b) => a.tanggal.localeCompare(b.tanggal) || a.id - b.id,
      "uang-besar": (a, b) => b.uang - a.uang,
      "uang-kecil": (a, b) => a.uang - b.uang,
      nama: (a, b) => a.nama.localeCompare(b.nama, "id"),
    };
    return list.sort(sorters[urut]);
  }, [entries, kat, q, dari, sampai, min, maks, urut]);

  const totalTampil = visible.reduce((a, e) => a + e.uang, 0);

  const grup = useMemo(() => {
    if (urut !== "terbaru" && urut !== "terlama")
      return [{ kunci: "semua", label: null, items: visible, total: 0 }];
    const m = new Map();
    for (const e of visible) {
      const k = e.tanggal.slice(0, 7);
      if (!m.has(k))
        m.set(k, { kunci: k, label: bulanLabel(k), items: [], total: 0 });
      const g = m.get(k);
      g.items.push(e);
      g.total += e.uang;
    }
    return [...m.values()];
  }, [visible, urut]);

  function konfirmasiHapus() {
    start(async () => {
      await deleteEntry(hapus.id);
      setHapus(null);
      setToast("Catatan dihapus");
    });
  }

  const bukaBaru = () => setSheet({ entry: null });

  return (
    <>
      <header className="topbar">
        <div className="topbar-in">
          <div className="brand">
            <span className="brand-mark">
              <Envelope />
            </span>
            <span>NGAMPLOP</span>
          </div>
          <div className="topbar-actions">
            <button className="btn primary desk-only" onClick={bukaBaru}>
              <Plus /> Catat kondangan
            </button>
            <button
              className="icon-btn"
              onClick={() => setPengguna(true)}
              aria-label="Tambah pengguna"
              title="Tambah pengguna"
            >
              <UserPlus />
            </button>
            <form action={logout}>
              <button className="icon-btn" aria-label="Keluar" title="Keluar">
                <Logout />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="wrap">
        <section className="hero" aria-label="Ringkasan">
          <p className="hero-label">Total uang yang sudah diberikan</p>
          <p className="hero-total">{rupiah(total)}</p>

          <div
            className="bar"
            role="img"
            aria-label={
              KATEGORI.filter((k) => perKategori[k.nama].uang > 0)
                .map((k) => `${k.nama} ${rupiah(perKategori[k.nama].uang)}`)
                .join(", ") || "Belum ada data"
            }
          >
            {KATEGORI.filter((k) => perKategori[k.nama].uang > 0).map((k) => (
              <span
                key={k.nama}
                title={`${k.nama}: ${rupiah(perKategori[k.nama].uang)}`}
                style={{
                  width: `${(perKategori[k.nama].uang / total) * 100}%`,
                  background: k.c,
                }}
              />
            ))}
          </div>

          <dl className="stats">
            <div>
              <dt>Undangan</dt>
              <dd>{entries.length}</dd>
            </div>
            <div>
              <dt>Rata-rata</dt>
              <dd>{rupiah(rata)}</dd>
            </div>
            <div>
              <dt>Tahun {tahun}</dt>
              <dd>{rupiah(tahunIni)}</dd>
            </div>
          </dl>
        </section>

        <div className="searchrow">
          <label className="search">
            <Search />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari nama atau alamat"
              aria-label="Cari nama atau alamat"
            />
          </label>
          <button
            className="btn outline"
            aria-expanded={lanjutan}
            aria-controls="filter-lanjutan"
            onClick={() => setLanjutan((v) => !v)}
          >
            <Sliders /> Filter
            {jumlahLanjutan > 0 && (
              <span className="badge">{jumlahLanjutan}</span>
            )}
          </button>
        </div>

        <div className="pills" role="group" aria-label="Filter kategori">
          <button
            className="pill"
            aria-pressed={kat === "Semua"}
            onClick={() => setKat("Semua")}
          >
            Semua <small>{entries.length}</small>
          </button>
          {KATEGORI.map((k) => (
            <button
              key={k.nama}
              className="pill"
              style={warna(k)}
              aria-pressed={kat === k.nama}
              onClick={() => setKat(kat === k.nama ? "Semua" : k.nama)}
            >
              <i className="dot" />
              {k.nama} <small>{perKategori[k.nama].n}</small>
            </button>
          ))}
        </div>

        {lanjutan && (
          <div className="advanced" id="filter-lanjutan">
            <label className="field">
              <span>Dari tanggal</span>
              <input
                type="date"
                value={dari}
                max={sampai || undefined}
                onChange={(e) => setDari(e.target.value)}
              />
            </label>
            <label className="field">
              <span>Sampai tanggal</span>
              <input
                type="date"
                value={sampai}
                min={dari || undefined}
                onChange={(e) => setSampai(e.target.value)}
              />
            </label>
            <label className="field">
              <span>Uang minimal (Rp)</span>
              <input
                type="number"
                min="0"
                step="1000"
                inputMode="numeric"
                value={min}
                onChange={(e) => setMin(e.target.value)}
                placeholder="0"
              />
            </label>
            <label className="field">
              <span>Uang maksimal (Rp)</span>
              <input
                type="number"
                min="0"
                step="1000"
                inputMode="numeric"
                value={maks}
                onChange={(e) => setMaks(e.target.value)}
                placeholder="Tanpa batas"
              />
            </label>
            <label className="field wide">
              <span>Urutkan</span>
              <select value={urut} onChange={(e) => setUrut(e.target.value)}>
                <option value="terbaru">Tanggal terbaru</option>
                <option value="terlama">Tanggal terlama</option>
                <option value="uang-besar">Uang terbesar</option>
                <option value="uang-kecil">Uang terkecil</option>
                <option value="nama">Nama A sampai Z</option>
              </select>
            </label>
          </div>
        )}

        {entries.length > 0 && (
          <div className="resultbar" aria-live="polite">
            <span>
              <strong>{visible.length}</strong> dari {entries.length} catatan,
              total <strong>{rupiah(totalTampil)}</strong>
            </span>
            {adaFilter && (
              <button className="linkbtn" onClick={reset}>
                Reset filter
              </button>
            )}
          </div>
        )}

        {entries.length === 0 ? (
          <div className="empty">
            <span className="empty-icon">
              <Envelope width={32} height={32} />
            </span>
            <h2>Belum ada catatan</h2>
            <p>
              Catat kondangan pertama supaya kamu tahu siapa saja yang sudah
              didatangi dan berapa amplopnya.
            </p>
            <button className="btn primary" onClick={bukaBaru}>
              <Plus /> Catat kondangan pertama
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="empty">
            <h2>Tidak ada yang cocok</h2>
            <p>Coba ubah kata kunci atau longgarkan filter.</p>
            <button className="btn outline" onClick={reset}>
              Reset filter
            </button>
          </div>
        ) : (
          grup.map((g) => (
            <section key={g.kunci} className="group">
              {g.label && (
                <div className="month">
                  <h2>{g.label}</h2>
                  <span>{rupiah(g.total)}</span>
                </div>
              )}
              <ul className="list">
                {g.items.map((e) => {
                  const k = metaOf(e.kategori);
                  return (
                    <li key={e.id} className="item" style={warna(k)}>
                      <div className="avatar" aria-hidden="true">
                        {e.nama.trim().charAt(0).toUpperCase()}
                      </div>
                      <div className="info">
                        <h3>{e.nama}</h3>
                        <p className="addr">
                          <Pin width={14} height={14} />
                          <span>{e.alamat}</span>
                        </p>
                        <div className="tags">
                          <span className="tag">{e.kategori}</span>
                          <time dateTime={e.tanggal}>
                            {tanggalPendek(e.tanggal)}
                          </time>
                        </div>
                      </div>
                      <strong className="money">{rupiah(e.uang)}</strong>
                      <div className="icons">
                        <button
                          className="icon-btn"
                          onClick={() => setSheet({ entry: e })}
                          aria-label={`Ubah catatan ${e.nama}`}
                        >
                          <Pencil width={18} height={18} />
                        </button>
                        <button
                          className="icon-btn danger"
                          onClick={() => setHapus(e)}
                          aria-label={`Hapus catatan ${e.nama}`}
                        >
                          <Trash width={18} height={18} />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </main>

      <button
        className="fab mob-only"
        onClick={bukaBaru}
        aria-label="Catat kondangan baru"
      >
        <Plus width={26} height={26} />
      </button>

      {sheet && (
        <EntrySheet
          key={sheet.entry?.id ?? "baru"}
          entry={sheet.entry}
          onClose={() => setSheet(null)}
          onSaved={(msg) => {
            setSheet(null);
            setToast(msg);
          }}
        />
      )}

      {pengguna && (
        <UserSheet
          jumlah={jumlahPengguna}
          onClose={() => setPengguna(false)}
          onSaved={(msg) => {
            setPengguna(false);
            setToast(msg);
          }}
        />
      )}

      {hapus && (
        <div
          className="overlay"
          onMouseDown={(e) => e.target === e.currentTarget && setHapus(null)}
        >
          <div
            className="sheet confirm"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="del-title"
          >
            <h2 id="del-title">Hapus catatan ini?</h2>
            <p>
              Catatan <strong>{hapus.nama}</strong> sebesar {rupiah(hapus.uang)}{" "}
              akan dihapus permanen.
            </p>
            <div className="sheet-actions">
              <button className="btn ghost" onClick={() => setHapus(null)}>
                Batal
              </button>
              <button
                className="btn danger"
                onClick={konfirmasiHapus}
                disabled={pending}
                autoFocus
              >
                {pending ? "Menghapus…" : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </>
  );
}
