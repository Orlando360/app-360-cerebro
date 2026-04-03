import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "App Factory 360 — Orlando Iguarán",
  description: "Diagnóstico empresarial inteligente y generación automatizada de apps personalizadas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
