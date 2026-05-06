import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maestrio · Tu técnico en minutos",
  description: "Conectamos clientes con técnicos y maestros de confianza vía WhatsApp.",
  manifest: "/manifest.json",
  themeColor: "#4282d8",
  icons: {
    icon: "/icon-192x192.png",
    apple: "/icon-192x192.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
