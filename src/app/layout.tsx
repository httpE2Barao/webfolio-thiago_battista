import type { Metadata } from "next";
import localFont from "next/font/local";
import React from "react";
import { Header } from "../components/Header";
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
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

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
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-1 p-4 md:pl-48 md:mt-0">
          {children}
        </main>
      </body>
    </html>
  );
}
