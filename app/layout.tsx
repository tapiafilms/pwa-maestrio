import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chasquilla MVP",
  description: "Marketplace to connect clients with technicians by WhatsApp.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
