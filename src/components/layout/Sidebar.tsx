"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Plus,
  Robot as Bot,
  Scroll as ScrollText,
  FileText,
  CaretDown as ChevronDown,
  SquaresFour,
  ListDashes,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase";
import { getAccessibleScriptsAction } from "@/app/actions/scripts";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

const translations = {
  en: {
    dashboard: "Sales Agents",
    projectsTitle: "Projects",
    allScripts: "All Scripts",
    newProject: "New Project",
    connectProject: "Connect Project",
    scriptsTitle: "Scripts",
    scriptsWorkspace: "Scripts Workspace",
    newScript: "Add Script",
    connectScript: "Connect Script",
    comingSoon: "Soon",
    showAllProjects: "All projects",
    showAllScripts: "All scripts",
    loading: "Loading...",
    scripts: "Scripts",
    notAdded: "Not added",
    untitledScript: "Untitled script",
  },
  ru: {
    dashboard: "Sales Agents",
    projectsTitle: "Проекты",
    allScripts: "Все Скрипты",
    newProject: "Новый Проект",
    connectProject: "Подключить Проект",
    scriptsTitle: "Скрипты",
    scriptsWorkspace: "Рабочее пространство скриптов",
    newScript: "Добавить Скрипт",
    connectScript: "Подключить Скрипт",
    comingSoon: "Скоро",
    showAllProjects: "Все проекты",
    showAllScripts: "Все скрипты",
    loading: "Загрузка...",
    scripts: "Скрипты",
    notAdded: "Не добавлено",
    untitledScript: "Скрипт без названия",
  }
};

type Project = {
  id: string;
  name: string;
};

type Script = {
  id: string;
  title: string | null;
};

type SidebarProps = {
  mobileOpen?: boolean;
  onNavigate?: () => void;
};

export function Sidebar({ mobileOpen = false, onNavigate }: SidebarProps) {
  const { language, mounted } = useLanguage();
  const t = mounted ? translations[language as keyof typeof translations] : translations.ru;

  const pathname = usePathname();
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [scripts, setScripts] = React.useState<Script[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [projectsOpen, setProjectsOpen] = React.useState(false);
  const [scriptsOpen, setScriptsOpen] = React.useState(false);
  const [menuStateReady, setMenuStateReady] = React.useState(false);
  const [allowMenuAnimation, setAllowMenuAnimation] = React.useState(false);
  const isProjectsNodeActive =
    pathname === "/sales-agents/projects" || pathname === "/dashboard/projects";
  const isSalesAgentsBranchActive =
    pathname === "/sales-agents" ||
    pathname === "/dashboard";
  const isScriptsBranchActive =
    pathname === "/sales-agents/scripts" || pathname === "/dashboard/scripts";
  const isAllScriptsNodeActive =
    pathname === "/sales-agents/scripts/all" ||
    pathname === "/dashboard/scripts/all";

  React.useEffect(() => {
    try {
      const savedProjectsOpen = localStorage.getItem("sidebar:projects-open");
      const savedScriptsOpen = localStorage.getItem("sidebar:scripts-open");

      if (savedProjectsOpen !== null) {
        setProjectsOpen(savedProjectsOpen === "true");
      }
      if (savedScriptsOpen !== null) {
        setScriptsOpen(savedScriptsOpen === "true");
      }
    } catch {
      // ignore localStorage errors to keep sidebar functional
    } finally {
      setMenuStateReady(true);
    }
  }, []);

  React.useEffect(() => {
    if (!menuStateReady) {
      return;
    }
    const frameId = requestAnimationFrame(() => {
      setAllowMenuAnimation(true);
    });
    return () => cancelAnimationFrame(frameId);
  }, [menuStateReady]);

  React.useEffect(() => {
    if (!menuStateReady) {
      return;
    }
    try {
      localStorage.setItem("sidebar:projects-open", String(projectsOpen));
    } catch {
      // ignore localStorage errors to keep sidebar functional
    }
  }, [projectsOpen, menuStateReady]);

  React.useEffect(() => {
    if (!menuStateReady) {
      return;
    }
    try {
      localStorage.setItem("sidebar:scripts-open", String(scriptsOpen));
    } catch {
      // ignore localStorage errors to keep sidebar functional
    }
  }, [scriptsOpen, menuStateReady]);

  React.useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    async function loadData() {
      const [{ data: projectsData, error: pErr }, scriptsData] = await Promise.all([
        supabase.from('projects').select('id, name').order('created_at', { ascending: false }),
        getAccessibleScriptsAction(),
      ]);
        
      if (isMounted) {
        if (!pErr && projectsData) setProjects(projectsData);
        setScripts(scriptsData);
        setLoading(false);
      }
    }
    
    loadData();

    const channel = supabase.channel('sidebar-data')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_members' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scripts' }, loadData)
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <aside
      className={cn(
        "fixed left-0 top-12 w-[260px] h-[calc(100vh-3rem)] border-r border-neutral-200/50 dark:border-white/[0.05] bg-neutral-50/60 dark:bg-[#050505]/60 backdrop-blur-2xl z-40 overflow-y-auto custom-scrollbar shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-out md:z-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent dark:from-white/[0.02] dark:to-transparent pointer-events-none" />
      <div className="flex flex-col gap-4 py-8 px-5 w-full h-full relative z-10">
        
        {/* Sales Agents Branch */}
        <div className="space-y-2">
          <Link
            href="/sales-agents"
            onClick={onNavigate}
            className="relative z-10 flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group"
          >
            {isSalesAgentsBranchActive && (
              <motion.div
                layoutId="sidebar-active"
                className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800/50 rounded-lg -z-10"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <Bot className={cn(
              "w-4 h-4 transition-colors",
              isSalesAgentsBranchActive ? "text-black dark:text-white" : "text-neutral-400 group-hover:text-black dark:group-hover:text-white"
            )} />
            <span className={cn(
              "transition-colors",
              isSalesAgentsBranchActive ? "text-black dark:text-white" : "text-neutral-500 group-hover:text-black dark:group-hover:text-white"
            )}>{t.dashboard}</span>
            <div
              className={cn(
                "absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-r-md transition-colors",
                isSalesAgentsBranchActive
                  ? "bg-[#8fc2ff]"
                  : "bg-[#8fc2ff]/40"
              )}
            />
          </Link>

          <div className="space-y-1 ml-4 pl-3">
            <button
              type="button"
              onClick={() => setProjectsOpen((prev) => !prev)}
              className={cn(
                "inline-flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors",
                isProjectsNodeActive
                  ? "bg-neutral-100 dark:bg-neutral-800/40 text-black dark:text-white"
                  : "text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100/60 dark:hover:bg-neutral-800/30"
              )}
            >
              <FileText className="h-3.5 w-3.5 shrink-0 opacity-80" />
              <span className="flex-1 text-left">{t.projectsTitle}</span>
              <motion.span
                initial={false}
                animate={{ rotate: menuStateReady && projectsOpen ? 0 : -90 }}
                transition={{ duration: allowMenuAnimation ? 0.2 : 0, ease: "easeOut" }}
                className={cn(
                  "inline-flex items-center justify-center transition-opacity",
                  menuStateReady ? "opacity-70" : "opacity-0"
                )}
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {projectsOpen && (
                <motion.div
                  key="projects-dropdown"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: allowMenuAnimation ? 0.22 : 0, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="ml-3 space-y-0.5 pt-0.5">
                    {loading ? (
                      <div className="py-2.5 text-sm text-neutral-400 flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700 animate-pulse" />
                        {t.loading}
                      </div>
                    ) : (
                      <>
                        <Link
                          href="/sales-agents/projects"
                          onClick={onNavigate}
                          className="mb-2 flex w-full items-center gap-2 rounded-md bg-neutral-100/50 px-3 py-2 text-[12px] font-semibold text-neutral-600 transition-colors hover:bg-neutral-200/50 hover:text-neutral-900 dark:bg-neutral-800/30 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-200"
                        >
                          <SquaresFour className="h-3.5 w-3.5" weight="bold" />
                          <span>{t.showAllProjects}</span>
                        </Link>

                        {projects.length === 0 && (
                          <Link
                            href="/sales-agents/projects/new"
                            onClick={onNavigate}
                            className="inline-flex items-center gap-1.5 rounded-md px-1 py-1.5 text-[13px] font-medium text-neutral-500 transition-colors hover:text-black dark:hover:text-white"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{t.newProject}</span>
                          </Link>
                        )}

                        {projects.length > 0 && (
                          <div className="pt-0.5 mt-0.5">
                            {projects.slice(0, 5).map((project) => {
                          const isActive = pathname?.includes(`/projects/${project.id}`);
                          return (
                            <div key={project.id}>
                              <Link
                                href={`/sales-agents/projects/${project.id}`}
                                onClick={onNavigate}
                                className="relative flex items-center px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors group"
                              >
                                <span
                                  className={cn(
                                    "truncate transition-colors flex-1",
                                    isActive
                                      ? "text-black dark:text-white"
                                      : "text-neutral-500 group-hover:text-neutral-800 dark:group-hover:text-neutral-200"
                                  )}
                                >
                                  {project.name}
                                </span>
                              </Link>
                            </div>
                          );
                        })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Scripts Branch */}
        <div className="space-y-2">
          <Link
            href="/sales-agents/scripts"
            onClick={onNavigate}
            className="relative z-10 flex min-w-0 items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group"
          >
            {isScriptsBranchActive && (
              <motion.div
                layoutId="sidebar-active"
                className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800/50 rounded-lg -z-10"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <ScrollText className={cn(
              "w-4 h-4 transition-colors",
              isScriptsBranchActive ? "text-black dark:text-white" : "text-neutral-400 group-hover:text-black dark:group-hover:text-white"
            )} />
            <span className={cn(
              "truncate transition-colors",
              isScriptsBranchActive ? "text-black dark:text-white" : "text-neutral-500 group-hover:text-black dark:group-hover:text-white"
            )}>
              {t.scriptsTitle}
            </span>
            <div
              className={cn(
                "absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-r-md transition-colors",
                isScriptsBranchActive
                  ? "bg-[#8fe0b5]"
                  : "bg-[#8fe0b5]/40"
              )}
            />
          </Link>

          <div className="space-y-1 ml-4 pl-3">
            <button
              type="button"
              onClick={() => setScriptsOpen((prev) => !prev)}
              className={cn(
                "inline-flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors",
                isAllScriptsNodeActive
                  ? "bg-neutral-100 dark:bg-neutral-800/40 text-black dark:text-white"
                  : "text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100/60 dark:hover:bg-neutral-800/30"
              )}
            >
              <FileText className="h-3.5 w-3.5 shrink-0 opacity-80" />
              <span className="flex-1 text-left">{t.allScripts}</span>
              <motion.span
                initial={false}
                animate={{ rotate: menuStateReady && scriptsOpen ? 0 : -90 }}
                transition={{ duration: allowMenuAnimation ? 0.2 : 0, ease: "easeOut" }}
                className={cn(
                  "inline-flex items-center justify-center transition-opacity",
                  menuStateReady ? "opacity-70" : "opacity-0"
                )}
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {scriptsOpen && (
                <motion.div
                  key="scripts-dropdown"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: allowMenuAnimation ? 0.22 : 0, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="ml-3 space-y-0.5 pt-0.5">
                    {loading ? (
                      <div className="py-2.5 text-sm text-neutral-400 flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700 animate-pulse" />
                        {t.loading}
                      </div>
                    ) : (
                      <>
                        <Link
                          href="/sales-agents/scripts/all"
                          onClick={onNavigate}
                          className="mb-2 flex w-full items-center gap-2 rounded-md bg-neutral-100/50 px-3 py-2 text-[12px] font-semibold text-neutral-600 transition-colors hover:bg-neutral-200/50 hover:text-neutral-900 dark:bg-neutral-800/30 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-200"
                        >
                          <ListDashes className="h-3.5 w-3.5" weight="bold" />
                          <span>{t.showAllScripts}</span>
                        </Link>

                        {scripts.length === 0 && (
                          <Link
                            href="/sales-agents/scripts/new"
                            onClick={onNavigate}
                            className="flex w-full items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium text-neutral-500 transition-colors hover:text-black dark:hover:text-white"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{t.newScript}</span>
                          </Link>
                        )}

                        {scripts.length > 0 && (
                          <div className="pt-0.5 mt-0.5">
                            {scripts.slice(0, 5).map((script) => {
                              const isActive = pathname?.includes(`/scripts/${script.id}`);
                              return (
                                <div key={script.id}>
                                  <Link
                                    href={`/sales-agents/scripts/${script.id}/chat`}
                                    onClick={onNavigate}
                                    className="relative flex items-center px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors group"
                                  >
                                    <span
                                      className={cn(
                                        "truncate transition-colors flex-1",
                                        isActive
                                          ? "text-black dark:text-white"
                                          : "text-neutral-500 group-hover:text-neutral-800 dark:group-hover:text-neutral-200"
                                      )}
                                    >
                                      {script.title || t.untitledScript}
                                    </span>
                                  </Link>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </aside>
  );
}
