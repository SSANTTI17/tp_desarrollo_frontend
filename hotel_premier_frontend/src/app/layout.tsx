import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // <--- ESTA LÍNEA ES CRUCIAL

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hotel Premier",
  description: "Sistema de Gestión Hotelera",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
