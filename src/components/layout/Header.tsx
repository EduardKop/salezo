"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun, LogOut, Settings, HelpCircle, User as UserIcon, Globe, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { BrandLogo } from "@/components/layout/BrandLogo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [user, setUser] = React.useState<User | null>(null);
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [showLangMenu, setShowLangMenu] = React.useState(false);
  const { language, changeLanguage } = useLanguage();

  React.useEffect(() => {
    let rafId = 0;
    let isScrolled = false;
    const SHOW_AT = 20;
    const HIDE_AT = 0;

    const updateScrolled = () => {
      const y = window.scrollY || window.pageYOffset;
      const nextScrolled = isScrolled ? y > HIDE_AT : y > SHOW_AT;

      if (nextScrolled !== isScrolled) {
        isScrolled = nextScrolled;
        setScrolled(nextScrolled);
      }

      rafId = 0;
    };

    const handleScroll = () => {
      if (rafId !== 0) {
        return;
      }
      rafId = window.requestAnimationFrame(updateScrolled);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  React.useEffect(() => {
    setMounted(true);
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  async function handleSignOut() {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  const avatarUrl = user?.user_metadata?.avatar_url;
  const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const email = user?.email || "";

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 border-b transition-[background-color,border-color,box-shadow] duration-150",
        scrolled
          ? "bg-white/90 dark:bg-black/90 border-black/10 dark:border-white/10 shadow-sm"
          : "bg-transparent border-transparent shadow-none"
      )}
    >
      <div className="w-full px-4 h-12 flex items-center justify-between">
        {/* Logo */}
        <Link href="/sales-agents" className="flex items-center gap-2 group">
          <BrandLogo className="transition-transform group-hover:scale-[1.02]" />
        </Link>

        {/* Actions — client-only to avoid base-ui SSR/client ID mismatch */}
        <div className="flex items-center gap-2 md:gap-4">
          {mounted && (<>
            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors focus:outline-none px-2 py-1 rounded-md">
                Profile
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden shrink-0 shadow-sm border border-black/10 dark:border-white/10">
                        {avatarUrl && !imageError ? (
                          <img
                            src={avatarUrl}
                            alt={name}
                            className="w-full h-full object-cover"
                            onError={() => setImageError(true)}
                          />
                        ) : (
                          <span className="text-white text-sm font-semibold">
                            {name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col space-y-0.5">
                        <p className="text-sm font-medium leading-none text-black dark:text-white">{name}</p>
                        <p className="text-xs leading-none text-neutral-500 truncate max-w-[140px]">
                          {email}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <div
                  className="flex items-center justify-between px-2 py-1.5 text-sm cursor-pointer rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  onClick={(e) => { e.preventDefault(); setShowLangMenu(!showLangMenu); }}
                >
                  <div className="flex items-center">
                    <Globe className="mr-2 h-4 w-4" />
                    <span>Language</span>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", showLangMenu ? "rotate-180" : "")} />
                </div>
                {showLangMenu && (
                  <div className="p-2 pt-1 animate-in fade-in slide-in-from-top-1">
                    <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800/50 rounded-lg p-1">
                      <button
                        onClick={() => changeLanguage('en')}
                        className={cn("flex-1 flex items-center justify-center text-xs font-medium h-8 rounded-md transition-all",
                          language === 'en' ? "bg-white dark:bg-[#111] shadow text-black dark:text-white pointer-events-none" : "text-neutral-500 hover:text-black dark:hover:text-white")}
                      >Eng</button>
                      <button
                        onClick={() => changeLanguage('ru')}
                        className={cn("flex-1 flex items-center justify-center text-xs font-medium h-8 rounded-md transition-all",
                          language === 'ru' ? "bg-white dark:bg-[#111] shadow text-black dark:text-white pointer-events-none" : "text-neutral-500 hover:text-black dark:hover:text-white")}
                      >Ru</button>
                    </div>
                  </div>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Support</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-500/10"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                >
                  {isSigningOut ? (
                    <span className="mr-2 h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  ) : (
                    <LogOut className="mr-2 h-4 w-4" />
                  )}
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-6 w-px bg-black/10 dark:bg-white/10 mx-1" />

            {/* Theme Toggle */}
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
          </>)}
        </div>
      </div>
    </header>
  );
}
