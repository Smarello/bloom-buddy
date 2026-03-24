import type { Metadata } from "next";
import { Quicksand, Nunito } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const quicksand = Quicksand({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bloom Buddy — La tua guida verde",
  description:
    "Scatta una foto alla tua pianta e scopri di che specie è, come sta e cosa fare per curarla al meglio.",
  openGraph: {
    title: "Bloom Buddy — La tua guida verde",
    description:
      "Scatta una foto alla tua pianta e scopri di che specie è, come sta e cosa fare per curarla al meglio.",
    type: "website",
    locale: "it_IT",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${quicksand.variable} ${nunito.variable}`}
    >
      <body className="min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
