"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChatTeardropDots,
  Link as LinkIcon,
  ListDashes,
  Plus,
  Scroll as ScrollText,
  SquaresFour,
  X,
} from "@phosphor-icons/react";
import { getAccessibleScriptsAction } from "@/app/actions/scripts";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";

const DESKTOP_SIDEBAR_WIDTH = 288;

const translations = {
  en: {
    salesAgents: "Sales Agents",
    scripts: "Scripts",
    chat: "AI Chat",
    workspace: "Workspace",
    projects: "Projects",
    allScripts: "All Scripts",
    newChat: "New Chat",
    recentProjects: "Recent Projects",
    recentScripts: "Recent Scripts",
    newProject: "New Project",
    connectProject: "Connect Project",
    newScript: "Add Script",
    noProjects: "No projects yet",
    noScripts: "No scripts yet",
    untitledScript: "Untitled script",
    closeMenu: "Hide menu",
  },
  ru: {
    salesAgents: "Sales Agents",
    scripts: "Скрипты",
    chat: "AI Чат",
    workspace: "Рабочее пространство",
    projects: "Проекты",
    allScripts: "Все скрипты",
    newChat: "Новый чат",
    recentProjects: "Последние проекты",
    recentScripts: "Последние скрипты",
    newProject: "Новый проект",
    connectProject: "Подключить проект",
    newScript: "Добавить скрипт",
    noProjects: "Проектов пока нет",
    noScripts: "Скриптов пока нет",
    untitledScript: "Скрипт без названия",
    closeMenu: "Скрыть меню",
  },
} as const;

type Project = { id: string; name: string };
type Script = { id: string; title: string | null };
type NavSectionId = "salesAgents" | "scripts" | "chat";

type SidebarProps = {
  mobileOpen?: boolean;
  onNavigate?: () => void;
};

const SECTION_THEME = {
  salesAgents: {
    accent: "text-sky-500 dark:text-sky-400",
    activeBg: "bg-sky-500/[0.10] dark:bg-sky-400/[0.12]",
    activeText: "text-sky-700 dark:text-sky-300",
  },
  scripts: {
    accent: "text-emerald-500 dark:text-emerald-400",
    activeBg: "bg-emerald-500/[0.10] dark:bg-emerald-400/[0.12]",
    activeText: "text-emerald-700 dark:text-emerald-300",
  },
  chat: {
    accent: "text-violet-500 dark:text-violet-400",
    activeBg: "bg-violet-500/[0.10] dark:bg-violet-400/[0.12]",
    activeText: "text-violet-700 dark:text-violet-300",
  },
} as const;

function SectionHeading({ label }: { label: string }) {
  return (
    <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500 dark:text-neutral-500">
      {label}
    </p>
  );
}

function Divider() {
  return <div className="mx-3 h-px bg-black/7 dark:bg-white/7" />;
}

function RecentListSkeleton() {
  return (
    <div className="space-y-2 pl-10 pt-1">
      {(["72%", "60%", "78%"] as const).map((width, index) => (
        <div
          key={index}
          className="h-3 rounded-full bg-black/[0.06] dark:bg-white/[0.06]"
          style={{ width }}
        />
      ))}
    </div>
  );
}

type SidebarRowProps = {
  href: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
  section: NavSectionId;
  onClick?: () => void;
};

function SidebarRow({
  href,
  icon: Icon,
  label,
  active = false,
  section,
  onClick,
}: SidebarRowProps) {
  const theme = SECTION_THEME[section];

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150",
        active
          ? cn(theme.activeBg, "font-medium", theme.activeText)
          : "text-neutral-700 hover:bg-black/[0.03] hover:text-neutral-950 dark:text-neutral-300 dark:hover:bg-white/[0.04] dark:hover:text-white"
      )}
    >
      <Icon
        className={cn(
          "h-[16px] w-[16px] shrink-0",
          active ? theme.accent : "text-neutral-500 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-white"
        )}
        weight={active ? "fill" : "regular"}
      />
      <span className="min-w-0 truncate">{label}</span>
    </Link>
  );
}

type RecentLinkProps = {
  href: string;
  label: string;
  active?: boolean;
  section: NavSectionId;
  onClick?: () => void;
};

function RecentLink({
  href,
  label,
  active = false,
  section,
  onClick,
}: RecentLinkProps) {
  const theme = SECTION_THEME[section];

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "block rounded-lg px-3 py-1.5 pl-10 text-sm transition-colors duration-150",
        active
          ? cn("font-medium", theme.activeText)
          : "text-neutral-700 hover:bg-black/[0.03] hover:text-neutral-950 dark:text-neutral-300 dark:hover:bg-white/[0.04] dark:hover:text-white"
      )}
    >
      <span className="block truncate">{label}</span>
    </Link>
  );
}

export function Sidebar({ mobileOpen = false, onNavigate }: SidebarProps) {
  const { language, mounted } = useLanguage();
  const t = mounted
    ? translations[language as keyof typeof translations]
    : translations.ru;

  const pathname = usePathname() ?? "";
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [scripts, setScripts] = React.useState<Script[]>([]);
  const [loadingProjects, setLoadingProjects] = React.useState(true);
  const [loadingScripts, setLoadingScripts] = React.useState(true);

  React.useEffect(() => {
    try {
      localStorage.setItem("salezo:sidebar-width", String(DESKTOP_SIDEBAR_WIDTH));
    } catch {}

    document.documentElement.style.setProperty(
      "--dashboard-sidebar-width",
      `${DESKTOP_SIDEBAR_WIDTH}px`
    );

    window.dispatchEvent(
      new CustomEvent("salezo-sidebar-width", {
        detail: { width: DESKTOP_SIDEBAR_WIDTH },
      })
    );
  }, []);

  const isWorkspaceActive = pathname === "/sales-agents" || pathname === "/dashboard";
  const isProjectsOverviewActive =
    pathname === "/sales-agents/projects" || pathname === "/dashboard/projects";
  const isNewProjectActive =
    pathname === "/sales-agents/projects/new" || pathname === "/dashboard/projects/new";
  const isConnectProjectActive =
    pathname === "/sales-agents/projects/connect" || pathname === "/dashboard/projects/connect";

  const isScriptsWorkspaceActive =
    pathname === "/sales-agents/scripts" || pathname === "/dashboard/scripts";
  const isAllScriptsActive =
    pathname === "/sales-agents/scripts/all" || pathname === "/dashboard/scripts/all";
  const isNewScriptActive =
    pathname === "/sales-agents/scripts/new" || pathname === "/dashboard/scripts/new";

  const isChatActive = pathname === "/sales-agents/chat" || pathname === "/dashboard/chat";

  const selectedProjectId = React.useMemo(() => {
    const match = pathname.match(/\/projects\/([^/]+)/);
    const value = match?.[1];
    return !value || ["new", "connect"].includes(value) ? null : value;
  }, [pathname]);

  const selectedScriptId = React.useMemo(() => {
    const match = pathname.match(/\/scripts\/([^/]+)/);
    const value = match?.[1];
    return !value || ["new", "all", "connect"].includes(value) ? null : value;
  }, [pathname]);

  const visibleProjects = React.useMemo(() => projects.slice(0, 6), [projects]);
  const visibleScripts = React.useMemo(() => scripts.slice(0, 6), [scripts]);

  React.useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    async function loadProjects() {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name")
        .order("created_at", { ascending: false });

      if (!isMounted) return;

      if (!error && data) {
        setProjects(data);
      }
      setLoadingProjects(false);
    }

    async function loadScripts() {
      const data = await getAccessibleScriptsAction().catch(() => []);
      if (!isMounted) return;
      setScripts(data);
      setLoadingScripts(false);
    }

    loadProjects();
    loadScripts();

    const channel = supabase
      .channel("sidebar-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, loadProjects)
      .on("postgres_changes", { event: "*", schema: "public", table: "project_members" }, loadProjects)
      .on("postgres_changes", { event: "*", schema: "public", table: "scripts" }, loadScripts)
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <aside
      className={cn(
        "fixed left-2 top-12 z-40 h-[calc(100vh-3.5rem)] w-[calc(100vw-1rem)] max-w-[280px] transition-transform duration-300 ease-out md:left-2 md:top-12 md:h-[calc(100vh-3.5rem)] md:w-[272px] md:max-w-none",
        mobileOpen ? "translate-x-0" : "-translate-x-[104%] md:translate-x-0"
      )}
    >
      <div className="flex h-full flex-col overflow-hidden rounded-[28px] border border-black/8 bg-white/88 shadow-[0_24px_48px_-36px_rgba(0,0,0,0.22)] backdrop-blur-xl dark:border-white/8 dark:bg-[#0b0b0d]/90 dark:shadow-[0_28px_56px_-42px_rgba(0,0,0,0.8)]">
        <button
          type="button"
          onClick={onNavigate}
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-black/[0.05] hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-white/[0.05] dark:hover:text-white md:hidden"
          aria-label={t.closeMenu}
        >
          <X className="h-4 w-4" />
        </button>

        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
          <div className="space-y-5">
            <section className="space-y-2">
              <SectionHeading label={t.salesAgents} />
              <div className="space-y-0.5">
                <SidebarRow
                  href="/sales-agents"
                  icon={SquaresFour}
                  label={t.workspace}
                  active={isWorkspaceActive}
                  section="salesAgents"
                  onClick={onNavigate}
                />
                <SidebarRow
                  href="/sales-agents/projects"
                  icon={ListDashes}
                  label={t.projects}
                  active={isProjectsOverviewActive || selectedProjectId !== null}
                  section="salesAgents"
                  onClick={onNavigate}
                />
                <SidebarRow
                  href="/sales-agents/projects/new"
                  icon={Plus}
                  label={t.newProject}
                  active={isNewProjectActive}
                  section="salesAgents"
                  onClick={onNavigate}
                />
                <SidebarRow
                  href="/sales-agents/projects/connect"
                  icon={LinkIcon}
                  label={t.connectProject}
                  active={isConnectProjectActive}
                  section="salesAgents"
                  onClick={onNavigate}
                />
              </div>

              <div className="space-y-1 pt-2">
                <SectionHeading label={t.recentProjects} />
                {loadingProjects ? (
                  <RecentListSkeleton />
                ) : visibleProjects.length === 0 ? (
                  <p className="pl-10 pt-1 text-sm italic text-neutral-400 dark:text-neutral-500">
                    {t.noProjects}
                  </p>
                ) : (
                  <div className="space-y-0.5">
                    {visibleProjects.map((project) => (
                      <RecentLink
                        key={project.id}
                        href={`/sales-agents/projects/${project.id}`}
                        label={project.name}
                        active={selectedProjectId === project.id}
                        section="salesAgents"
                        onClick={onNavigate}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>

            <Divider />

            <section className="space-y-2">
              <SectionHeading label={t.scripts} />
              <div className="space-y-0.5">
                <SidebarRow
                  href="/sales-agents/scripts"
                  icon={ScrollText}
                  label={t.workspace}
                  active={isScriptsWorkspaceActive}
                  section="scripts"
                  onClick={onNavigate}
                />
                <SidebarRow
                  href="/sales-agents/scripts/all"
                  icon={ListDashes}
                  label={t.allScripts}
                  active={isAllScriptsActive || selectedScriptId !== null}
                  section="scripts"
                  onClick={onNavigate}
                />
                <SidebarRow
                  href="/sales-agents/scripts/new"
                  icon={Plus}
                  label={t.newScript}
                  active={isNewScriptActive}
                  section="scripts"
                  onClick={onNavigate}
                />
              </div>

              <div className="space-y-1 pt-2">
                <SectionHeading label={t.recentScripts} />
                {loadingScripts ? (
                  <RecentListSkeleton />
                ) : visibleScripts.length === 0 ? (
                  <p className="pl-10 pt-1 text-sm italic text-neutral-400 dark:text-neutral-500">
                    {t.noScripts}
                  </p>
                ) : (
                  <div className="space-y-0.5">
                    {visibleScripts.map((script) => (
                      <RecentLink
                        key={script.id}
                        href={`/sales-agents/scripts/${script.id}/chat`}
                        label={script.title || t.untitledScript}
                        active={selectedScriptId === script.id}
                        section="scripts"
                        onClick={onNavigate}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>

            <Divider />

            <section className="space-y-2">
              <SectionHeading label={t.chat} />
              <div className="space-y-0.5">
                <SidebarRow
                  href="/sales-agents/chat"
                  icon={ChatTeardropDots}
                  label={t.newChat}
                  active={isChatActive}
                  section="chat"
                  onClick={onNavigate}
                />
              </div>
            </section>
          </div>
        </nav>
      </div>
    </aside>
  );
}
