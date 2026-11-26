import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

;

export const metadata: Metadata = {
  title: { default: "STRIDEXA", template: "%s . STRIDEXA" },
  description: "Plan projects, move work across a board and keep your team in sync.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable}  h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
