import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import DevBanner from "@/components/DevBanner";
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
      <body className="min-h-screen flex flex-col bg-background text-foreground font-body antialiased">
        {process.env.NODE_ENV === 'development' && <DevBanner />}
        <DevTabBar />
        <div className="flex-1">{children}</div>
        <footer className="border-t py-4">
          <p className="text-center text-xs text-muted-foreground">
            Powered by Adduckivity · v{process.env.npm_package_version ?? '0.1.0'}
          </p>
        </footer>
      </body>
    </html>
  );
}
