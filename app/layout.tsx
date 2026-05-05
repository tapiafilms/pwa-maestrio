import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maestrio · Tu técnico en minutos",
  description: "Conectamos clientes con técnicos y maestros de confianza vía WhatsApp. Rápido, fácil y sin complicaciones.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
