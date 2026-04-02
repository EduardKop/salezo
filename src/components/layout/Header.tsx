"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  ArrowSquareOut,
  Brain,
  CaretDown,
  ChatTeardropDots,
  CheckCircle,
  Eye,
  EyeSlash,
  Globe,
  LinkSimple,
  List,
  ListDashes,
  Moon,
  Plus,
  Question as HelpCircle,
  Scroll as ScrollText,
  SignOut as LogOut,
  SquaresFour,
  Sun,
  User as UserIcon,
  X,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import type { User } from "@supabase/supabase-js";
import { getAccessibleScriptsAction } from "@/app/actions/scripts";
import {
  hasOpenRouterKeyAction,
  removeOpenRouterKeyAction,
  saveOpenRouterKeyAction,
} from "@/app/actions/openrouter";
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
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";

type TopSectionId = "salesAgents" | "scripts" | "chat";
type Project = { id: string; name: string };
type Script = { id: string; title: string | null };

const headerTranslations = {
  en: {
    salesAgents: "Sales Agents",
    scripts: "Scripts",
    chat: "AI Chat",
    workspace: "Workspace",
    allProjects: "All Projects",
    allScripts: "All Scripts",
    newProject: "New Project",
    connectProject: "Connect Project",
    addScript: "Add Script",
    newChat: "New Chat",
    myProjects: "My Projects",
    myScripts: "My Scripts",
    recentProjects: "Recent projects",
    recentScripts: "Recent scripts",
    empty: "Empty",
    addProject: "Add project",
    addFirstScript: "Add script",
    openMenu: "Open navigation",
    closeMenu: "Close navigation",
  },
  ru: {
    salesAgents: "Sales Agents",
    scripts: "Scripts",
    chat: "AI Chat",
    workspace: "Workspace",
    allProjects: "Все проекты",
    allScripts: "Все скрипты",
    newProject: "Новый проект",
    connectProject: "Подключить проект",
    addScript: "Добавить скрипт",
    newChat: "Новый чат",
    myProjects: "Мои проекты",
    myScripts: "Мои скрипты",
    recentProjects: "Последние проекты",
    recentScripts: "Последние скрипты",
    empty: "Пусто",
    addProject: "Добавить проект",
    addFirstScript: "Добавить скрипт",
    openMenu: "Открыть навигацию",
    closeMenu: "Закрыть навигацию",
  },
} as const;

const sectionTheme = {
  salesAgents: {
    accent: "text-sky-500 dark:text-sky-400",
    activeBg: "bg-sky-500/14 dark:bg-sky-400/16",
    activeText: "text-sky-700 dark:text-sky-200",
  },
  scripts: {
    accent: "text-emerald-500 dark:text-emerald-400",
    activeBg: "bg-emerald-500/14 dark:bg-emerald-400/16",
    activeText: "text-emerald-700 dark:text-emerald-200",
  },
  chat: {
    accent: "text-violet-500 dark:text-violet-400",
    activeBg: "bg-violet-500/14 dark:bg-violet-400/16",
    activeText: "text-violet-700 dark:text-violet-200",
  },
} as const;

function deriveSection(pathname: string): TopSectionId {
  if (pathname.startsWith("/sales-agents/scripts") || pathname.startsWith("/dashboard/scripts")) {
    return "scripts";
  }
  if (pathname.startsWith("/sales-agents/chat") || pathname.startsWith("/dashboard/chat")) {
    return "chat";
  }
  return "salesAgents";
}

function isProjectDetailPath(pathname: string) {
  return /^\/(?:sales-agents|dashboard)\/projects\/[^/]+/.test(pathname)
    && !pathname.endsWith("/new")
    && !pathname.endsWith("/connect");
}

function isScriptDetailPath(pathname: string) {
  return /^\/(?:sales-agents|dashboard)\/scripts\/[^/]+/.test(pathname)
    && !pathname.endsWith("/new")
    && !pathname.endsWith("/all");
}

function Avatar({
  url,
  name,
}: {
  url?: string | null;
  name: string;
}) {
  const [error, setError] = React.useState(false);
  const initials = name.charAt(0).toUpperCase();

  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-gradient-to-br from-blue-500 to-purple-600 shadow-sm dark:border-white/10">
      {url && !error ? (
        <img
          src={url}
          alt={name}
          width={32}
          height={32}
          className="h-full w-full object-cover"
          onError={() => setError(true)}
          loading="lazy"
        />
      ) : (
        <span className="text-sm font-semibold text-white">{initials}</span>
      )}
    </span>
  );
}

function TopButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl px-3.5 py-2 font-mono text-[12px] uppercase tracking-[0.22em] transition-colors",
        active
          ? "bg-black/[0.06] text-black dark:bg-white/[0.08] dark:text-white"
          : "text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white"
      )}
    >
      {label}
    </button>
  );
}

function SubButton({
  label,
  active,
  onClick,
  icon,
  iconClassName,
  iconOnly,
  underlineActive = true,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  iconClassName?: string;
  iconOnly?: boolean;
  underlineActive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={iconOnly ? label : undefined}
      className={cn(
        "group relative inline-flex items-center gap-2 px-2 py-2 font-mono text-[13px] transition-colors",
        iconOnly && "justify-center rounded-md",
        active
          ? "text-black dark:text-white"
          : "text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white"
      )}
    >
      {icon ? <span className={cn("flex items-center", iconClassName)}>{icon}</span> : null}
      {!iconOnly ? <span className="whitespace-nowrap">{label}</span> : null}
      {active && underlineActive ? (
        <motion.span
          layoutId="header-subnav-underline"
          className="absolute inset-x-1 -bottom-0.5 h-px rounded-full bg-black dark:bg-white"
          transition={{ type: "spring", stiffness: 460, damping: 36 }}
        />
      ) : null}
    </button>
  );
}

function RecentMenu({
  label,
  title,
  items,
  emptyLabel,
  actionLabel,
  actionHref,
  itemHref,
  open,
  onOpenChange,
  active,
}: {
  label: string;
  title: string;
  items: { id: string; label: string }[];
  emptyLabel: string;
  actionLabel: string;
  actionHref: string;
  itemHref: (id: string) => string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  active?: boolean;
}) {
  return (
    <div
      className="relative inline-flex shrink-0 items-center"
      onMouseEnter={() => onOpenChange(true)}
      onMouseLeave={() => onOpenChange(false)}
    >
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className={cn(
          "group relative inline-flex h-9 items-center gap-2 px-2 py-2 font-mono text-[13px] transition-colors",
          active
            ? "text-black dark:text-white"
            : "text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white"
        )}
      >
        <span>{label}</span>
        <CaretDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
        {active ? (
          <motion.span
            layoutId="header-subnav-underline"
            className="absolute inset-x-1 -bottom-0.5 h-px rounded-full bg-black dark:bg-white"
            transition={{ type: "spring", stiffness: 460, damping: 36 }}
          />
        ) : null}
      </button>

      <AnimatePresence>
        {open ? (
          <div className="absolute left-0 top-full z-[70]">
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.14, ease: "easeOut" }}
              className="relative mt-px w-64 rounded-2xl border border-black/8 bg-white/96 p-3 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.35)] backdrop-blur-xl before:absolute before:-top-2 before:left-0 before:right-0 before:h-2 before:content-[''] dark:border-white/10 dark:bg-[#0b0b0d]/96 dark:shadow-[0_24px_60px_-34px_rgba(0,0,0,0.85)]"
            >
              <div className="mb-2 px-1">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-neutral-500">
                  {title}
                </p>
              </div>

              {items.length > 0 ? (
                <div className="space-y-1">
                  {items.map((item) => (
                    <Link
                      key={item.id}
                      href={itemHref(item.id)}
                      className="block rounded-xl px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-black/[0.04] hover:text-black dark:text-neutral-300 dark:hover:bg-white/[0.05] dark:hover:text-white"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 rounded-xl border border-dashed border-black/10 px-3 py-4 text-sm text-neutral-500 dark:border-white/10 dark:text-neutral-400">
                  <p>{emptyLabel}</p>
                  <Link
                    href={actionHref}
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-black transition-colors hover:bg-black/[0.04] dark:border-white/10 dark:text-white dark:hover:bg-white/[0.05]"
                  >
                    <Plus className="h-3.5 w-3.5 text-emerald-500" />
                    {actionLabel}
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function MobileNavRow({
  href,
  label,
  active,
  onClick,
  icon,
  iconClassName,
}: {
  href: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  iconClassName?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
        active
          ? "bg-black/[0.06] text-black dark:bg-white/[0.08] dark:text-white"
          : "text-neutral-600 hover:bg-black/[0.04] hover:text-black dark:text-neutral-300 dark:hover:bg-white/[0.05] dark:hover:text-white"
      )}
    >
      {icon ? <span className={cn("flex items-center", iconClassName)}>{icon}</span> : <span className="w-4" />}
      <span>{label}</span>
    </Link>
  );
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const currentSection = React.useMemo(() => deriveSection(pathname), [pathname]);
  const { setTheme, resolvedTheme } = useTheme();
  const { language, changeLanguage } = useLanguage();

  const [mounted, setMounted] = React.useState(false);
  const [user, setUser] = React.useState<User | null>(null);
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [showLangMenu, setShowLangMenu] = React.useState(false);
  const [showOpenRouter, setShowOpenRouter] = React.useState(false);
  const [hasApiKey, setHasApiKey] = React.useState<boolean | null>(null);
  const [apiKeyInput, setApiKeyInput] = React.useState("");
  const [showApiKey, setShowApiKey] = React.useState(false);
  const [isSavingKey, setIsSavingKey] = React.useState(false);
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [openSection, setOpenSection] = React.useState<TopSectionId>(currentSection);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [scripts, setScripts] = React.useState<Script[]>([]);
  const [recentMenu, setRecentMenu] = React.useState<"projects" | "scripts" | null>(null);
  const [, startTransition] = React.useTransition();

  const t = mounted
    ? headerTranslations[language as keyof typeof headerTranslations]
    : headerTranslations.ru;

  React.useEffect(() => {
    setOpenSection(currentSection);
  }, [currentSection]);

  React.useEffect(() => {
    setMounted(true);
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    hasOpenRouterKeyAction().then(setHasApiKey).catch(() => setHasApiKey(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    let isMounted = true;

    async function loadProjects() {
      const { data } = await supabase
        .from("projects")
        .select("id, name")
        .order("created_at", { ascending: false });

      if (isMounted) {
        setProjects((data ?? []).slice(0, 6));
      }
    }

    async function loadScripts() {
      const data = await getAccessibleScriptsAction().catch(() => []);
      if (isMounted) {
        setScripts(data.slice(0, 6));
      }
    }

    loadProjects();
    loadScripts();

    const channel = supabase
      .channel("header-navigation")
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, loadProjects)
      .on("postgres_changes", { event: "*", schema: "public", table: "project_members" }, loadProjects)
      .on("postgres_changes", { event: "*", schema: "public", table: "scripts" }, loadScripts)
      .subscribe();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const email = user?.email || "";

  const navigate = React.useCallback((href: string) => {
    startTransition(() => {
      router.push(href);
    });
    setMobileNavOpen(false);
    setRecentMenu(null);
  }, [router]);

  const handlePrimarySection = React.useCallback((section: TopSectionId) => {
    setOpenSection(section);
    if (section === "salesAgents") {
      navigate("/sales-agents");
      return;
    }
    if (section === "scripts") {
      navigate("/sales-agents/scripts");
      return;
    }
    navigate("/sales-agents/chat");
  }, [navigate]);

  const handleSaveApiKey = React.useCallback(async () => {
    setIsSavingKey(true);
    try {
      await saveOpenRouterKeyAction(apiKeyInput);
      setHasApiKey(true);
      setApiKeyInput("");
      setShowOpenRouter(false);
      toast.success(language === "ru" ? "OpenRouter подключён!" : "OpenRouter connected!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg === "key_invalid_format") {
        toast.error(language === "ru" ? "Ключ должен начинаться с sk-or-" : "Key must start with sk-or-");
      } else if (msg === "key_empty") {
        toast.error(language === "ru" ? "Введите ключ" : "Please enter a key");
      } else {
        toast.error(language === "ru" ? "Не удалось сохранить ключ" : "Failed to save key");
      }
    } finally {
      setIsSavingKey(false);
    }
  }, [apiKeyInput, language]);

  const handleRemoveApiKey = React.useCallback(async () => {
    try {
      await removeOpenRouterKeyAction();
      setHasApiKey(false);
      setShowOpenRouter(false);
      toast.success(language === "ru" ? "OpenRouter отключён" : "OpenRouter disconnected");
    } catch {
      toast.error(language === "ru" ? "Ошибка при отключении" : "Failed to disconnect");
    }
  }, [language]);

  const handleSignOut = React.useCallback(async () => {
    setIsSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
    } catch {
      setIsSigningOut(false);
    }
  }, [router]);

  const projectItems = React.useMemo(
    () => projects.map((project) => ({ id: project.id, label: project.name })),
    [projects]
  );

  const scriptItems = React.useMemo(
    () => scripts.map((script) => ({ id: script.id, label: script.title || (language === "ru" ? "Скрипт без названия" : "Untitled script") })),
    [language, scripts]
  );

  const renderSubnav = (section: TopSectionId) => {
    if (section === "salesAgents") {
      const projectDetailActive = isProjectDetailPath(pathname);

      return (
        <>
          <SubButton
            label={t.workspace}
            active={pathname === "/sales-agents" || pathname === "/dashboard"}
            onClick={() => navigate("/sales-agents")}
            icon={<SquaresFour className="h-4 w-4" weight="fill" />}
            iconClassName={sectionTheme.salesAgents.accent}
          />
          <SubButton
            label={t.allProjects}
            active={pathname === "/sales-agents/projects" || pathname === "/dashboard/projects"}
            onClick={() => navigate("/sales-agents/projects")}
            icon={<ListDashes className="h-4 w-4" />}
          />
          <RecentMenu
            label={t.myProjects}
            title={t.recentProjects}
            items={projectItems}
            emptyLabel={t.empty}
            actionLabel={t.addProject}
            actionHref="/sales-agents/projects/new"
            itemHref={(id) => `/sales-agents/projects/${id}`}
            open={recentMenu === "projects"}
            onOpenChange={(open) => setRecentMenu(open ? "projects" : null)}
            active={projectDetailActive}
          />
          <SubButton
            label={t.newProject}
            active={pathname === "/sales-agents/projects/new" || pathname === "/dashboard/projects/new"}
            onClick={() => navigate("/sales-agents/projects/new")}
            icon={<Plus className="h-4 w-4" />}
            iconClassName="text-emerald-500/70 transition-transform transition-colors group-hover:scale-110 group-hover:text-emerald-500 dark:text-emerald-400/75 dark:group-hover:text-emerald-300"
            iconOnly
            underlineActive={false}
          />
          <SubButton
            label={t.connectProject}
            active={pathname === "/sales-agents/projects/connect" || pathname === "/dashboard/projects/connect"}
            onClick={() => navigate("/sales-agents/projects/connect")}
            icon={<LinkSimple className="h-4 w-4" />}
            iconClassName="text-violet-500/70 transition-transform transition-colors group-hover:scale-110 group-hover:text-violet-500 dark:text-violet-400/75 dark:group-hover:text-violet-300"
            iconOnly
            underlineActive={false}
          />
        </>
      );
    }

    if (section === "scripts") {
      const scriptDetailActive = isScriptDetailPath(pathname);

      return (
        <>
          <SubButton
            label={t.workspace}
            active={pathname === "/sales-agents/scripts" || pathname === "/dashboard/scripts"}
            onClick={() => navigate("/sales-agents/scripts")}
            icon={<ScrollText className="h-4 w-4" weight="fill" />}
            iconClassName={sectionTheme.scripts.accent}
          />
          <SubButton
            label={t.allScripts}
            active={pathname === "/sales-agents/scripts/all" || pathname === "/dashboard/scripts/all"}
            onClick={() => navigate("/sales-agents/scripts/all")}
            icon={<ListDashes className="h-4 w-4" />}
          />
          <RecentMenu
            label={t.myScripts}
            title={t.recentScripts}
            items={scriptItems}
            emptyLabel={t.empty}
            actionLabel={t.addFirstScript}
            actionHref="/sales-agents/scripts/new"
            itemHref={(id) => `/sales-agents/scripts/${id}/chat`}
            open={recentMenu === "scripts"}
            onOpenChange={(open) => setRecentMenu(open ? "scripts" : null)}
            active={scriptDetailActive}
          />
          <SubButton
            label={t.addScript}
            active={pathname === "/sales-agents/scripts/new" || pathname === "/dashboard/scripts/new"}
            onClick={() => navigate("/sales-agents/scripts/new")}
            icon={<Plus className="h-4 w-4" />}
            iconClassName="text-emerald-500/70 transition-transform transition-colors group-hover:scale-110 group-hover:text-emerald-500 dark:text-emerald-400/75 dark:group-hover:text-emerald-300"
            iconOnly
            underlineActive={false}
          />
        </>
      );
    }

    return (
      <SubButton
        label={t.newChat}
        active={pathname === "/sales-agents/chat" || pathname === "/dashboard/chat"}
        onClick={() => navigate("/sales-agents/chat")}
        icon={<ChatTeardropDots className="h-4 w-4" weight="fill" />}
        iconClassName={sectionTheme.chat.accent}
      />
    );
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-black/8 bg-white/94 backdrop-blur-xl transition-colors duration-200 dark:border-white/8 dark:bg-[#050506]/96">
        <div className="relative z-10 flex h-14 items-center justify-between gap-4 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label={mobileNavOpen ? t.closeMenu : t.openMenu}
              onClick={() => setMobileNavOpen((value) => !value)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/8 text-neutral-600 transition-colors hover:bg-black/[0.04] hover:text-black dark:border-white/10 dark:text-neutral-300 dark:hover:bg-white/[0.05] dark:hover:text-white lg:hidden"
            >
              {mobileNavOpen ? <X className="h-4 w-4" /> : <List className="h-4 w-4" />}
            </button>

            <Link href="/sales-agents" className="flex items-center gap-2 group">
              <BrandLogo className="gap-2.5 text-base" imageClassName="h-7" />
            </Link>
          </div>

          <div className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
            <div className="flex min-w-0 items-center gap-1 overflow-visible">
              <div className="flex items-center gap-1">
                <TopButton
                  label={t.salesAgents}
                  active={openSection === "salesAgents"}
                  onClick={() => handlePrimarySection("salesAgents")}
                />
                <AnimatePresence mode="popLayout" initial={false}>
                  {openSection === "salesAgents" ? (
                    <motion.div
                      key="salesAgents-subnav"
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="flex items-center gap-1"
                    >
                      {renderSubnav("salesAgents")}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <div className="mx-1 h-5 w-px bg-black/8 dark:bg-white/10" />

              <div className="flex items-center gap-1">
                <TopButton
                  label={t.scripts}
                  active={openSection === "scripts"}
                  onClick={() => handlePrimarySection("scripts")}
                />
                <AnimatePresence mode="popLayout" initial={false}>
                  {openSection === "scripts" ? (
                    <motion.div
                      key="scripts-subnav"
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="flex items-center gap-1"
                    >
                      {renderSubnav("scripts")}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <div className="mx-1 h-5 w-px bg-black/8 dark:bg-white/10" />

              <div className="flex items-center gap-1">
                <TopButton
                  label={t.chat}
                  active={openSection === "chat"}
                  onClick={() => handlePrimarySection("chat")}
                />
                <AnimatePresence mode="popLayout" initial={false}>
                  {openSection === "chat" ? (
                    <motion.div
                      key="chat-subnav"
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="flex items-center gap-1"
                    >
                      {renderSubnav("chat")}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {mounted ? (
              <>
                <DropdownMenu
                  open={dropdownOpen}
                  onOpenChange={(open) => {
                    setDropdownOpen(open);
                    if (!open) setShowLangMenu(false);
                  }}
                >
                  <DropdownMenuTrigger className="rounded-full transition-opacity hover:opacity-85 focus:outline-none" aria-label="Open profile menu">
                    {user ? (
                      <Avatar url={avatarUrl} name={name} />
                    ) : (
                      <span className="block h-8 w-8 animate-pulse rounded-full bg-black/[0.06] dark:bg-white/[0.07]" />
                    )}
                  </DropdownMenuTrigger>

                  <DropdownMenuContent className="w-64" align="end">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="p-3 font-normal">
                        <div className="flex items-center gap-3">
                          <Avatar url={avatarUrl} name={name} />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-black dark:text-white">{name}</p>
                            <p className="truncate text-xs text-neutral-500">{email}</p>
                          </div>
                        </div>
                      </DropdownMenuLabel>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                      <DropdownMenuItem className="cursor-pointer" disabled>
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        setTimeout(() => setShowOpenRouter(true), 60);
                      }}
                      className="group/dropdown-menu-item relative flex w-full cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden hover:bg-accent hover:text-accent-foreground"
                    >
                      <Brain className="mr-1 h-4 w-4 text-violet-500" />
                      <span className="flex-1 text-left">OpenRouter</span>
                      <span
                        className={cn(
                          "ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          hasApiKey
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
                        )}
                      >
                        {hasApiKey === null ? "..." : hasApiKey ? (language === "ru" ? "Подключён" : "Connected") : "Connect"}
                      </span>
                    </button>

                    <DropdownMenuSeparator />

                    <div
                      className="cursor-pointer rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setShowLangMenu((value) => !value);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <span>Language</span>
                        </div>
                        <CaretDown className={cn("h-4 w-4 transition-transform", showLangMenu && "rotate-180")} />
                      </div>
                    </div>

                    {showLangMenu ? (
                      <div className="animate-in fade-in slide-in-from-top-1 px-2 pb-1 duration-150">
                        <div className="flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800/50">
                          {(["en", "ru"] as const).map((lang) => (
                            <button
                              key={lang}
                              onClick={() => changeLanguage(lang)}
                              className={cn(
                                "flex h-8 flex-1 items-center justify-center rounded-md text-xs font-medium transition-all",
                                language === lang
                                  ? "pointer-events-none bg-white text-black shadow dark:bg-[#111] dark:text-white"
                                  : "text-neutral-500 hover:text-black dark:hover:text-white"
                              )}
                            >
                              {lang === "en" ? "Eng" : "Ru"}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <DropdownMenuSeparator />

                    <DropdownMenuItem className="cursor-pointer" disabled>
                      <HelpCircle className="mr-2 h-4 w-4" />
                      <span>Support</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600 dark:text-red-400 dark:focus:bg-red-500/10 dark:focus:text-red-400"
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                    >
                      {isSigningOut ? (
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
                      ) : (
                        <LogOut className="mr-2 h-4 w-4" />
                      )}
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="h-6 w-px bg-black/10 dark:bg-white/10" />

                <button
                  type="button"
                  onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-black/[0.05] dark:text-neutral-400 dark:hover:bg-white/[0.05]"
                  aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {resolvedTheme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </button>
              </>
            ) : null}
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileNavOpen ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileNavOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="fixed left-3 right-3 top-16 z-50 max-h-[calc(100vh-5rem)] overflow-y-auto rounded-[28px] border border-black/8 bg-white/96 p-4 shadow-[0_24px_56px_-32px_rgba(0,0,0,0.34)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0b0b0d]/96 lg:hidden"
            >
              <div className="mb-4 flex items-center justify-between">
                <BrandLogo className="gap-2.5 text-base" imageClassName="h-7" />
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-black/[0.05] hover:text-black dark:text-neutral-400 dark:hover:bg-white/[0.05] dark:hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-5">
                <section className="space-y-2">
                  <p className="px-3 font-mono text-[10px] uppercase tracking-[0.24em] text-neutral-500">{t.salesAgents}</p>
                  <div className="space-y-1">
                    <MobileNavRow href="/sales-agents" label={t.workspace} active={deriveSection(pathname) === "salesAgents" && (pathname === "/sales-agents" || pathname === "/dashboard")} onClick={() => setMobileNavOpen(false)} icon={<SquaresFour className="h-4 w-4" weight="fill" />} iconClassName={sectionTheme.salesAgents.accent} />
                    <MobileNavRow href="/sales-agents/projects" label={t.allProjects} active={pathname === "/sales-agents/projects" || pathname === "/dashboard/projects"} onClick={() => setMobileNavOpen(false)} icon={<ListDashes className="h-4 w-4" />} />
                    <MobileNavRow href="/sales-agents/projects/new" label={t.newProject} active={pathname === "/sales-agents/projects/new" || pathname === "/dashboard/projects/new"} onClick={() => setMobileNavOpen(false)} icon={<Plus className="h-4 w-4" />} iconClassName="text-emerald-500" />
                    <MobileNavRow href="/sales-agents/projects/connect" label={t.connectProject} active={pathname === "/sales-agents/projects/connect" || pathname === "/dashboard/projects/connect"} onClick={() => setMobileNavOpen(false)} icon={<LinkSimple className="h-4 w-4" />} iconClassName="text-violet-500" />
                    {projectItems.map((project) => (
                      <MobileNavRow key={project.id} href={`/sales-agents/projects/${project.id}`} label={project.label} active={pathname === `/sales-agents/projects/${project.id}`} onClick={() => setMobileNavOpen(false)} />
                    ))}
                  </div>
                </section>

                <div className="h-px bg-black/8 dark:bg-white/8" />

                <section className="space-y-2">
                  <p className="px-3 font-mono text-[10px] uppercase tracking-[0.24em] text-neutral-500">{t.scripts}</p>
                  <div className="space-y-1">
                    <MobileNavRow href="/sales-agents/scripts" label={t.workspace} active={pathname === "/sales-agents/scripts" || pathname === "/dashboard/scripts"} onClick={() => setMobileNavOpen(false)} icon={<ScrollText className="h-4 w-4" weight="fill" />} iconClassName={sectionTheme.scripts.accent} />
                    <MobileNavRow href="/sales-agents/scripts/all" label={t.allScripts} active={pathname === "/sales-agents/scripts/all" || pathname === "/dashboard/scripts/all"} onClick={() => setMobileNavOpen(false)} icon={<ListDashes className="h-4 w-4" />} />
                    <MobileNavRow href="/sales-agents/scripts/new" label={t.addScript} active={pathname === "/sales-agents/scripts/new" || pathname === "/dashboard/scripts/new"} onClick={() => setMobileNavOpen(false)} icon={<Plus className="h-4 w-4" />} iconClassName="text-emerald-500" />
                    {scriptItems.map((script) => (
                      <MobileNavRow key={script.id} href={`/sales-agents/scripts/${script.id}/chat`} label={script.label} active={pathname === `/sales-agents/scripts/${script.id}/chat`} onClick={() => setMobileNavOpen(false)} />
                    ))}
                  </div>
                </section>

                <div className="h-px bg-black/8 dark:bg-white/8" />

                <section className="space-y-2">
                  <p className="px-3 font-mono text-[10px] uppercase tracking-[0.24em] text-neutral-500">{t.chat}</p>
                  <div className="space-y-1">
                    <MobileNavRow href="/sales-agents/chat" label={t.newChat} active={pathname === "/sales-agents/chat" || pathname === "/dashboard/chat"} onClick={() => setMobileNavOpen(false)} icon={<ChatTeardropDots className="h-4 w-4" weight="fill" />} iconClassName={sectionTheme.chat.accent} />
                  </div>
                </section>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showOpenRouter ? (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => {
                setShowOpenRouter(false);
                setApiKeyInput("");
                setShowApiKey(false);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-black/[0.08] bg-white shadow-2xl dark:border-white/[0.08] dark:bg-[#0f0f10]"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />
              <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-48 -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl" />

              <button
                onClick={() => {
                  setShowOpenRouter(false);
                  setApiKeyInput("");
                  setShowApiKey(false);
                }}
                className="absolute right-4 top-4 z-10 rounded-xl p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-white/[0.06] dark:hover:text-neutral-200"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="relative z-10 p-8">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 shadow-lg shadow-violet-500/10">
                    <Brain className="h-7 w-7 text-violet-600 dark:text-violet-400" weight="duotone" />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-bold text-neutral-900 dark:text-white">OpenRouter</h2>
                    <p className="mt-0.5 text-[12px] text-neutral-500 dark:text-neutral-400">
                      {language === "ru" ? "AI провайдер для чата" : "AI provider for chat"}
                    </p>
                  </div>
                </div>

                {hasApiKey ? (
                  <div className="space-y-5">
                    <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 dark:border-emerald-500/20 dark:bg-emerald-500/5">
                      <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" weight="fill" />
                      <div>
                        <p className="text-[14px] font-semibold text-emerald-700 dark:text-emerald-300">
                          {language === "ru" ? "Ключ подключён" : "API key connected"}
                        </p>
                        <p className="mt-0.5 text-[12px] text-neutral-500 dark:text-neutral-400">
                          {language === "ru" ? "AI чат активен и готов к работе" : "AI chat is active and ready"}
                        </p>
                      </div>
                    </div>

                    <a
                      href="https://openrouter.ai/activity"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[13px] text-violet-600 hover:underline dark:text-violet-400"
                    >
                      <ArrowSquareOut className="h-4 w-4" />
                      {language === "ru" ? "Посмотреть использование на openrouter.ai" : "View usage on openrouter.ai"}
                    </a>

                    <div className="border-t border-neutral-100 pt-4 dark:border-neutral-800">
                      <button
                        onClick={handleRemoveApiKey}
                        className="w-full rounded-2xl border border-rose-200 bg-rose-50 py-3 text-[13px] font-semibold text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/5 dark:text-rose-400 dark:hover:bg-rose-500/10"
                      >
                        {language === "ru" ? "Отключить OpenRouter" : "Disconnect OpenRouter"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <p className="text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                      {language === "ru"
                        ? "Вставьте ваш API ключ OpenRouter чтобы активировать AI чат. Ключ хранится в вашем профиле."
                        : "Paste your OpenRouter API key to activate AI chat. The key is stored securely in your profile."}
                    </p>

                    <div>
                      <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                        {language === "ru" ? "API Ключ" : "API Key"}
                      </label>
                      <div className="relative">
                        <input
                          type={showApiKey ? "text" : "password"}
                          value={apiKeyInput}
                          onChange={(event) => setApiKeyInput(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" && apiKeyInput.trim()) handleSaveApiKey();
                          }}
                          placeholder="sk-or-v1-..."
                          autoFocus
                          className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 pr-12 text-[14px] text-neutral-900 transition-all placeholder:text-neutral-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 dark:border-neutral-700 dark:bg-white/[0.04] dark:text-neutral-100 dark:placeholder:text-neutral-600 dark:focus:border-violet-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey((value) => !value)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-neutral-400 transition-colors hover:text-neutral-700 dark:hover:text-neutral-200"
                        >
                          {showApiKey ? <EyeSlash className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <a
                      href="https://openrouter.ai/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[13px] text-violet-600 hover:underline dark:text-violet-400"
                    >
                      <ArrowSquareOut className="h-4 w-4" />
                      {language === "ru" ? "Получить бесплатный ключ на openrouter.ai" : "Get a free key at openrouter.ai"}
                    </a>

                    <div className="flex gap-3 pt-1">
                      <button
                        onClick={() => {
                          setShowOpenRouter(false);
                          setApiKeyInput("");
                          setShowApiKey(false);
                        }}
                        className="flex-1 rounded-2xl border border-neutral-200 bg-transparent py-3 text-[13px] font-semibold text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-white/[0.04]"
                      >
                        {language === "ru" ? "Отмена" : "Cancel"}
                      </button>
                      <button
                        onClick={handleSaveApiKey}
                        disabled={!apiKeyInput.trim() || isSavingKey}
                        className="flex-1 rounded-2xl bg-violet-600 py-3 text-[13px] font-bold text-white shadow-lg shadow-violet-500/20 transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isSavingKey ? (language === "ru" ? "Сохранение..." : "Saving...") : (language === "ru" ? "Подключить" : "Connect")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
