import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Una pregunta para ti ✨",
  description: "Un pequeño cuento hecho especialmente para ti.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Una pregunta para ti ✨",
    description: "Un pequeño cuento hecho especialmente para ti.",
    images: [{ url: "/og.png", width: 1536, height: 864, alt: "Pantano encantado con un sapito coronado" }],
    type: "website",
    locale: "es_MX",
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
