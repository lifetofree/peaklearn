import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import DevTabBar from "@/components/DevTabBar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "PeakLearn - Knowledge Management",
  description: "Personal knowledge management with video collections",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen bg-background text-foreground font-body antialiased">
        <DevTabBar />
        {children}
      </body>
    </html>
  );
}
