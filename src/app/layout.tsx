import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { cookies, headers } from "next/headers";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { LanguageProvider } from "@/providers/language-provider";
import { Toaster } from "sonner";
import { SiteHeader } from "@/components/layout/SiteHeader";
import {
  detectLanguageFromHeader,
  isLanguage,
  LANGUAGE_COOKIE,
} from "@/lib/i18n/config";

const inter = Inter({ subsets: ["latin", "cyrillic"] });
const brandIconUrl = "/black-logo.png?v=20260321";
const faviconUrl = "/favicon.ico?v=20260321";

// SEO & Metadata
export const metadata: Metadata = {
  title: "Salezo — Sales Management Platform",
  description: "Manage sales projects, track team performance, create AI scripts and vector databases to help managers close more deals.",
  icons: {
    icon: [
      {
        url: brandIconUrl,
        type: "image/png",
      },
    ],
    shortcut: [
      {
        url: faviconUrl,
        type: "image/x-icon",
      },
    ],
    apple: [
      {
        url: brandIconUrl,
        type: "image/png",
      },
    ],
  },
  openGraph: {
    title: "Salezo",
    description: "The ultimate platform for sales teams. Manage projects, track metrics, and grow faster.",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://salezo.io",
    siteName: "Salezo",
    locale: "ru_RU",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const cookieLanguage = cookieStore.get(LANGUAGE_COOKIE)?.value;
  const initialLanguage = isLanguage(cookieLanguage)
    ? cookieLanguage
    : detectLanguageFromHeader(headerStore.get("accept-language"));

  return (
    <html lang={initialLanguage} suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen antialiased bg-background text-foreground flex flex-col`}>
        <LanguageProvider initialLanguage={initialLanguage}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SiteHeader />
            <main className="flex-1 w-full">
              {children}
            </main>
            {/* Apple-style toast feedback */}
            <Toaster 
              position="bottom-right" 
              toastOptions={{
                className: "dark:bg-black dark:text-white dark:border-white/10 bg-white text-black border-black/10 rounded-2xl shadow-xl",
              }}
            />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
