import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/session-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cici Rotell Photography",
  description: "Professional photography portfolio by Cici Rotell",
  openGraph: {
    title: "Cici Rotell Photography",
    description: "Professional photography portfolio by Cici Rotell",
    type: "website",
    siteName: "Cici Rotell Photography",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cici Rotell Photography",
    description: "Professional photography portfolio by Cici Rotell",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
