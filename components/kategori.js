// Setiap kategori punya warna sendiri: c = warna utama, t = latar lembut, x = warna teks di atas latar lembut.
export const KATEGORI = [
  { nama: "Teman SD", c: "#F59E0B", t: "#FEF3C7", x: "#92400E" },
  { nama: "Teman SMP", c: "#22C55E", t: "#DCFCE7", x: "#166534" },
  { nama: "Teman SMA", c: "#0EA5E9", t: "#E0F2FE", x: "#075985" },
  { nama: "Teman kuliah", c: "#8B5CF6", t: "#EDE9FE", x: "#5B21B6" },
  { nama: "Tetangga", c: "#78716C", t: "#F0EEEC", x: "#44403C" },
  { nama: "Saudara", c: "#F43F5E", t: "#FFE4E6", x: "#9F1239" },
];

const peta = Object.fromEntries(KATEGORI.map((k) => [k.nama, k]));
export const metaOf = (nama) => peta[nama] ?? KATEGORI[4];
export const warna = (k) => ({ "--c": k.c, "--t": k.t, "--x": k.x });

export const rupiah = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export const tanggalPendek = (s) =>
  new Date(s + "T00:00:00").toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const bulanLabel = (ym) =>
  new Date(ym + "-01T00:00:00").toLocaleDateString("id-ID", { month: "long", year: "numeric" });

export const hariIni = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};
