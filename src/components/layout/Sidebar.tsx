"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, ChevronRight, LayoutGrid, Link2, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

const translations = {
  en: {
    dashboard: "Dashboard",
    projectsTitle: "Sales Projects",
    newProject: "New Project",
    connectProject: "Connect Project",
    showAll: "Show all",
    loading: "Loading...",
    scripts: "Scripts",
    notAdded: "Not added",
  },
  ru: {
    dashboard: "Дашборд",
    projectsTitle: "Проекты Продаж",
    newProject: "Новый Проект",
    connectProject: "Подключить Проект",
    showAll: "Все проекты",
    loading: "Загрузка...",
    scripts: "Скрипты",
    notAdded: "Не добавлено",
  }
};

type Project = {
  id: string;
  name: string;
};

export function Sidebar() {
  const { language, mounted } = useLanguage();
  const t = mounted ? translations[language as keyof typeof translations] : translations.ru;

  const pathname = usePathname();
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    async function loadProjects() {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .order('created_at', { ascending: false });
        
      if (!error && data && isMounted) {
        setProjects(data);
      }
      if (isMounted) setLoading(false);
    }
    
    loadProjects();

    const channel = supabase.channel('sidebar-projects')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        loadProjects();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_members' }, () => {
        loadProjects();
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <aside className="fixed left-0 top-12 w-[260px] h-[calc(100vh-3rem)] border-r border-neutral-200/50 dark:border-white/[0.05] bg-neutral-50/60 dark:bg-[#050505]/60 backdrop-blur-2xl z-0 overflow-y-auto hidden md:block custom-scrollbar shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent dark:from-white/[0.02] dark:to-transparent pointer-events-none" />
      <div className="flex flex-col gap-6 py-8 px-5 w-full h-full relative z-10">
        
        {/* Main Navigation */}
        <div className="space-y-1">
          <Link
            href="/dashboard"
            className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group"
          >
            {pathname === "/dashboard" && (
              <motion.div
                layoutId="sidebar-active"
                className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800/50 rounded-lg -z-10"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <LayoutGrid className={cn(
              "w-4 h-4 transition-colors",
              pathname === "/dashboard" ? "text-black dark:text-white" : "text-neutral-400 group-hover:text-black dark:group-hover:text-white"
            )} />
            <span className={cn(
              "transition-colors",
              pathname === "/dashboard" ? "text-black dark:text-white" : "text-neutral-500 group-hover:text-black dark:group-hover:text-white"
            )}>{t.dashboard}</span>
            {pathname === "/dashboard" && (
              <motion.div
                layoutId="sidebar-active-indicator"
                className="absolute left-0 top-[20%] bottom-[20%] w-[3px] bg-black dark:bg-white rounded-r-md"
              />
            )}
          </Link>
        </div>

        {/* Projects Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-3 group">
            <Link 
              href="/dashboard/projects"
              className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest hover:text-black dark:hover:text-white transition-colors"
            >
              {t.projectsTitle}
            </Link>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Link 
                href="/dashboard/projects/connect"
                className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                title={t.connectProject}
              >
                <Link2 className="w-3.5 h-3.5" />
              </Link>
              <Link 
                href="/dashboard/projects/new"
                className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                title={t.newProject}
              >
                <Plus className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="space-y-0.5 relative before:absolute before:inset-y-2 before:left-[19px] before:w-[1px] before:bg-neutral-200 dark:before:bg-neutral-800/60">
            {loading ? (
              <div className="px-3 py-2.5 text-sm text-neutral-400 flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700 animate-pulse ml-1.5" />
                {t.loading}
              </div>
            ) : projects.length === 0 ? (
              <Link
                href="/dashboard/projects/new"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-neutral-500 transition-all group relative"
              >
                <div className="w-1.5 h-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 ml-1.5 bg-white dark:bg-[#000000] z-10 group-hover:border-black dark:group-hover:border-white transition-colors" />
                <span className="group-hover:text-black dark:group-hover:text-white transition-colors flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5" />
                  {t.newProject}
                </span>
                <div className="absolute inset-0 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg pointer-events-none group-hover:border-neutral-300 dark:group-hover:border-neutral-700 transition-colors" />
              </Link>
            ) : (
              <>
                {projects.slice(0, 5).map((project) => {
                  const isActive = pathname?.includes(`/projects/${project.id}`);
                  // Module subitems — extend this array as new modules are added
                  const modules = [
                    { key: "scripts", label: t.scripts, href: `/dashboard/projects/${project.id}/scripts`, hasContent: false },
                  ];
                  return (
                    <div key={project.id}>
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group"
                      >
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-active"
                            className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800/50 rounded-lg -z-10"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full border ml-1.5 z-10 transition-colors bg-white dark:bg-[#000000]",
                          isActive
                            ? "border-black dark:border-white bg-black dark:bg-white"
                            : "border-neutral-300 dark:border-neutral-700 group-hover:border-neutral-500 dark:group-hover:border-neutral-400"
                        )} />
                        <span className={cn(
                          "truncate transition-colors flex-1",
                          isActive ? "text-black dark:text-white" : "text-neutral-500 group-hover:text-neutral-800 dark:group-hover:text-neutral-200"
                        )}>
                          {project.name}
                        </span>
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-active-indicator"
                            className="absolute left-0 top-[20%] bottom-[20%] w-[3px] bg-black dark:bg-white rounded-r-md"
                          />
                        )}
                      </Link>

                      {/* Module sub-links shown when project is active */}
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-7 mt-0.5 space-y-0.5 overflow-hidden"
                        >
                          {modules.map((mod) => {
                            const modActive = pathname === mod.href;
                            return (
                              <Link
                                key={mod.key}
                                href={mod.href}
                                className={cn(
                                  "flex items-center justify-between px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-colors group/mod",
                                  modActive
                                    ? "bg-neutral-100 dark:bg-neutral-800/60 text-black dark:text-white"
                                    : "text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/30"
                                )}
                              >
                                <span>{mod.label}</span>
                                {!mod.hasContent && (
                                  <span className="text-[10px] text-neutral-400 dark:text-neutral-600 font-normal">
                                    {t.notAdded}
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                        </motion.div>
                      )}
                    </div>
                  );
                })}
                
                {projects.length > 5 && (
                  <Link
                    href="/dashboard/projects"
                    className="relative flex items-center gap-3 px-3 py-2 mt-1 rounded-lg text-[12px] font-semibold transition-colors group text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-transparent ml-1.5 z-10 flex items-center justify-center">
                      <MoreHorizontal className="w-3 h-3 text-neutral-400 group-hover:text-black dark:group-hover:text-white" />
                    </div>
                    <span>{t.showAll}</span>
                    <ChevronRight className="w-3 h-3 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-auto transition-all text-neutral-400" />
                  </Link>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </aside>
  );
}
