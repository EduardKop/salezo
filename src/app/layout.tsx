import type { Metadata, Viewport } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin", "cyrillic"] });

// SEO & Metadata API Integration
export const metadata: Metadata = {
  title: "Major Moments - Elite Sales Platform",
  description: "The ultimate tool for sales reps, team leads and owners. See your major moments effortlessly.",
  openGraph: {
    title: "Major Moments",
    description: "SaaS Utility Dashboard for maximum info density and speed.",
    url: "https://yourdomain.com",
    siteName: "Major Moments",
    locale: "en_US", // Will be dynamic via i18n in real implementation
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
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className={`${inter.className} min-h-screen antialiased bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
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
