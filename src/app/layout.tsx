import type { Metadata } from "next";
import localFont from "next/font/local";
import React from "react";
import { Header } from "../components/Header";
import { ThemeProvider } from "../contexts/ThemeContext";
import { ImageCacheProvider } from "../components/ImageCacheProvider";
import { ImageCacheStatus } from "../components/ImageCacheStatus";
import "./css/header.css";
import "./css/swiper-custom.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "./globals.css";

export const dynamic = "force-dynamic";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
  fallback: ["system-ui", "arial", "sans-serif"],
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
  fallback: ["monospace", "courier", "monospace"],
});

// Load Disalina font with proper fallbacks
// Using web font from Adobe Typekit instead of local files
const disalina = {
  variable: "--font-disalina",
  style: {
    fontFamily: 'Disalina, var(--font-geist-sans), system-ui, arial, sans-serif',
  },
};

export const metadata: Metadata = {
  title: "Thiago Battista - Artista Digital e Produtor Cultural",
  description: "Webfólio de Thiago Battista e repositório profissional",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/bry3pwr.css"></link>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="description" content="Webfólio de Thiago Battista e repositório profissional" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${disalina.variable} antialiased min-h-screen flex flex-col`}
        style={{
          backgroundColor: 'var(--background)',
          color: 'var(--foreground)'
        }}
      >
        <ThemeProvider>
          <ImageCacheProvider>
            <a href="#main-content" className="skip-link">
              Pular para o conteúdo principal
            </a>
            <Header />
            <main id="main-content" className="flex-1 p-4 md:pl-48 md:mt-0">
              {children}
            </main>
            {process.env.NODE_ENV === 'development' && <ImageCacheStatus />}
          </ImageCacheProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
