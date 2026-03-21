"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/layout/BrandLogo";

export function SiteHeader() {
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);



  React.useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname?.startsWith("/dashboard")) return null;

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-10 transition-all duration-300 border-b",
        isScrolled
          ? "bg-white/80 dark:bg-black/80 backdrop-blur-xl border-black/10 dark:border-white/10 shadow-sm"
          : "bg-transparent border-transparent"
      )}
    >
      <div className="w-full px-4 h-12 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <BrandLogo className="transition-transform group-hover:scale-[1.02]" />
        </Link>


        <div className="flex items-center gap-4">
            {mounted && (
              <button
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="relative inline-flex items-center justify-center w-9 h-9 overflow-hidden rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all text-neutral-600 dark:text-neutral-400 group focus:outline-none"
              >
                {resolvedTheme === "dark" ? (
                   <Moon className="h-4 w-4 hover:text-white" />
                ) : (
                   <Sun className="h-4 w-4 hover:text-black" />
                )}
                <span className="sr-only">Toggle theme</span>
              </button>
            )}
        </div>

      </div>
    </header>
  );
}
