"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  Sun, 
  Moon,
  Globe
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<"EN" | "RU">("EN");

  useEffect(() => setMounted(true), []);

  const toggleLang = () => {
    // Simulated i18n switcher, stores in profile/localStorage
    const next = lang === "EN" ? "RU" : "EN";
    setLang(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("mm_lang", next);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50 dark:bg-black">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a] flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-neutral-200 dark:border-neutral-800">
          <Link href="/dashboard" className="font-semibold text-lg tracking-tight flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-black dark:bg-white flex items-center justify-center">
               <span className="block w-2 h-2 rounded-full bg-white dark:bg-black" />
            </span>
            Major Moments
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 text-sm font-medium space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white transition-colors">
            <LayoutDashboard className="w-4 h-4" />
            {lang === "EN" ? "Dashboard" : "Сводка"}
          </Link>
          <Link href="/dashboard/team" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-black dark:hover:text-white transition-colors">
            <Users className="w-4 h-4" />
            {lang === "EN" ? "Team" : "Команда"}
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-black dark:hover:text-white transition-colors">
            <Settings className="w-4 h-4" />
            {lang === "EN" ? "Settings" : "Настройки"}
          </Link>
        </nav>

        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
          
          {/* Controls: Theme & Lang */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
            >
              {mounted && theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={toggleLang}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
            >
              <Globe className="w-4 h-4" />
              {lang}
            </button>
          </div>

          {/* User Profile Outline */}
          <div className="flex items-center gap-3 px-2 py-3 mt-2 rounded-xl group cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
              ED
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">Eduard V.</p>
              <p className="text-xs text-neutral-500 truncate">Manager</p>
            </div>
            <LogOut className="w-4 h-4 text-neutral-400 group-hover:text-red-500 transition-colors" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto">
        <header className="h-16 flex items-center px-8 border-b border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-10 md:hidden">
          {/* Mobile Header */}
          <span className="font-semibold text-lg tracking-tight">Major Moments</span>
        </header>

        <div className="p-8 pb-24 md:pb-8 flex-1 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
