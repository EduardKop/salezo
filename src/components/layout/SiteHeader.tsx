"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  CaretDown as ChevronDown,
  FileText,
  Kanban as FolderKanban,
  Globe,
  Translate as Languages,
  Link as Link2,
  Moon,
  Scroll as ScrollText,
  ShieldCheck,
  Sun,
  UsersThree as UsersRound,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { useLanguage, type Language } from "@/hooks/useLanguage";
import { siteHeader as translations, t as getT } from "@/lib/i18n/translations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
type SiteHeaderTranslation = (typeof translations)["en"];
type ProductMenuKey =
  | "projects"
  | "access"
  | "roles"
  | "scripts"
  | "bilingual"
  | "secure";

const productMenuItems = [
  {
    key: "projects",
    icon: FolderKanban,
    iconClassName: "text-blue-500",
  },
  {
    key: "access",
    icon: Link2,
    iconClassName: "text-emerald-500",
  },
  {
    key: "roles",
    icon: UsersRound,
    iconClassName: "text-violet-500",
  },
  {
    key: "scripts",
    icon: ScrollText,
    iconClassName: "text-amber-500",
  },
  {
    key: "bilingual",
    icon: Languages,
    iconClassName: "text-pink-500",
  },
  {
    key: "secure",
    icon: ShieldCheck,
    iconClassName: "text-cyan-500",
  },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const { language, changeLanguage } = useLanguage();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const activeLanguage = language as Language;
  const t = getT(translations, activeLanguage);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/sales-agents")
  ) {
    return null;
  }

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-10 transition-all duration-300 border-b",
        isScrolled
          ? "bg-white/80 dark:bg-black/80 backdrop-blur-xl border-black/10 dark:border-white/10 shadow-sm"
          : "bg-transparent border-transparent"
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-[1440px] items-center gap-4 px-4">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <BrandLogo className="transition-transform group-hover:scale-[1.02]" />
        </Link>

        <nav className="hidden flex-1 items-center justify-center md:flex">
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-black/[0.04] hover:text-black focus:outline-none dark:text-neutral-300 dark:hover:bg-white/[0.06] dark:hover:text-white">
                <span>{t.product}</span>
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                sideOffset={12}
                className="w-[min(92vw,640px)] min-w-[640px] rounded-3xl border border-black/10 bg-white/95 p-3 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-[#080808]/95"
              >
                <div className="px-3 pb-3 pt-2">
                  <p className="text-sm font-semibold text-black dark:text-white">{t.productTitle}</p>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{t.productSubtitle}</p>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {productMenuItems.map((item) => {
                    const Icon = item.icon;
                    const titleKey = item.key as ProductMenuKey;
                    const descriptionKey = `${item.key}Description` as keyof SiteHeaderTranslation;
                    return (
                      <div
                        key={item.key}
                        className="rounded-2xl px-3 py-3 transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 rounded-xl bg-black/[0.04] p-2 dark:bg-white/[0.06]">
                            <Icon className={cn("h-4 w-4", item.iconClassName)} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-black dark:text-white">
                              {t[titleKey]}
                            </p>
                            <p className="mt-1 text-sm leading-5 text-neutral-500 dark:text-neutral-400">
                              {t[descriptionKey]}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-black/[0.04] hover:text-black focus:outline-none dark:text-neutral-300 dark:hover:bg-white/[0.06] dark:hover:text-white">
                <span>{t.news}</span>
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                sideOffset={12}
                className="w-72 rounded-3xl border border-black/10 bg-white/95 p-3 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-[#080808]/95"
              >
                <div className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-[0.24em] text-neutral-400 dark:text-neutral-500">
                  {t.newsTitle}
                </div>
                <div className="rounded-2xl px-3 py-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-xl bg-black/[0.04] p-2 dark:bg-white/[0.06]">
                      <Globe className="h-4 w-4 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-black dark:text-white">{t.newsPlaceholder}</p>
                      <p className="mt-1 text-sm leading-5 text-neutral-500 dark:text-neutral-400">
                        {t.newsSubtitle}
                      </p>
                    </div>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-black/[0.04] hover:text-black focus:outline-none dark:text-neutral-300 dark:hover:bg-white/[0.06] dark:hover:text-white">
                <span>{t.howItWorks}</span>
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                sideOffset={12}
                className="w-80 rounded-3xl border border-black/10 bg-white/95 p-3 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-[#080808]/95"
              >
                <div className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-[0.24em] text-neutral-400 dark:text-neutral-500">
                  {t.docsTitle}
                </div>
                <div className="rounded-2xl px-3 pt-1">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-xl bg-black/[0.04] p-2 dark:bg-white/[0.06]">
                      <FileText className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-black dark:text-white">{t.docsLink}</p>
                      <p className="mt-1 text-sm leading-5 text-neutral-500 dark:text-neutral-400">
                        {t.docsSubtitle}
                      </p>
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator className="my-3 bg-black/5 dark:bg-white/8" />
                <DropdownMenuItem
                  className="cursor-pointer rounded-2xl px-3 py-2.5 text-sm font-medium"
                  onClick={() => router.push("/docs")}
                >
                  <FileText className="mr-2 h-4 w-4 text-blue-500" />
                  <span>{t.docsLink}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => changeLanguage(activeLanguage === "ru" ? "en" : "ru")}
            className="inline-flex h-9 min-w-12 items-center justify-center rounded-full px-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-600 transition-all hover:bg-black/5 hover:text-black focus:outline-none dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <span className="sr-only">{t.languageToggle}</span>
            <span aria-hidden="true">{activeLanguage}</span>
          </button>
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="group relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full text-neutral-600 transition-all hover:bg-black/5 focus:outline-none dark:text-neutral-400 dark:hover:bg-white/5"
          >
            <Sun className="h-4 w-4 hover:text-black dark:hidden" />
            <Moon className="hidden h-4 w-4 hover:text-white dark:block" />
            <span className="sr-only">{t.themeToggle}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
