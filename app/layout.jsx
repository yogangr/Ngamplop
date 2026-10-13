import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata = {
  title: "Buku Kondangan",
  description: "Catatan kondangan: siapa, di mana, kapan, dan berapa amplopnya.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1E1B4B",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={body.variable}>
      <body>{children}</body>
    </html>
  );
}
