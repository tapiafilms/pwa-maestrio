import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chasquilla MVP",
  description: "Marketplace to connect clients with technicians by WhatsApp."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
