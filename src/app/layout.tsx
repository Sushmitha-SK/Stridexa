import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "STRIDEXA", template: "%s . STRIDEXA" },
  description: "Plan projects, move work across a board and keep your team in sync.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable}  h-full antialiased`}>
      <body className="min-h-full font-sans">
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
