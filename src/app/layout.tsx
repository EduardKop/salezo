import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "sonner";
import { SiteHeader } from "@/components/layout/SiteHeader";

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
    url: "https://salezo.io", // TODO: update when domain is confirmed
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen antialiased bg-background text-foreground flex flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
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
      </body>
    </html>
  );
}
