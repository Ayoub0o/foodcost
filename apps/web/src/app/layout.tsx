import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getLocale } from "next-intl/server";
import { Inter } from "next/font/google";
import { allowSearchIndexing } from "@/lib/env";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export async function generateMetadata(): Promise<Metadata> {
  if (allowSearchIndexing()) return {};
  return { robots: { index: false, follow: false } };
}

/**
 * Next.js 15.5 requires <html> and <body> in the root layout (not only under
 * [locale]). Locale is read from next-intl so `lang` stays correct.
 */
export default async function RootLayout({ children }: { children: ReactNode }) {
  let locale = "en";
  try {
    locale = await getLocale();
  } catch {
    // Non-localized routes (robots, sitemap, api) have no request locale.
  }

  return (
    <html lang={locale} className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
