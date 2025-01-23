import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Job Scraper - Automatize a coleta de vagas de emprego",
  description: "Conecte-se aos principais job boards e extraia dados de vagas em segundos com a nossa API e Dashboard avançados.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`min-h-screen bg-background font-sans antialiased ${inter.variable}`}>
        {children}
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  );
}
