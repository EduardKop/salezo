"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  Buildings,
  CaretDown,
  Check,
  CheckCircle,
  CircleNotch,
  Copy,
  LinkSimple,
  Plus,
  Scroll as ScrollText,
  UserPlus,
  X,
  ChatCircle,
  Phone,
  Users,
} from "@phosphor-icons/react";

import {
  bulkConnectScriptsAction,
  bulkGenerateShareKeysAction,
  connectScriptToProjectAction,
  disconnectScriptFromProjectAction,
  generateShareKeyAction,
  getManagedProjectsAction,
  getMyScriptsWithSharesAction,
  getScriptSharesAction,
  revokeShareKeyAction,
  type Script,
  type ScriptShareUser,
} from "@/app/actions/scripts";
import { useLanguage } from "@/hooks/useLanguage";
import {
  common,
  scriptsDashboard as translations,
  t as getT,
  type Language,
} from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";
import { PageLoader } from "@/components/ui/page-loader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ScriptRow = Script & {
  dialog_count: number;
  share_count: number;
};

type ManagedProject = { id: string; name: string };
type StatusFilter = "all" | "with_project" | "sharing_active" | "standalone";
type T = (typeof translations)["en"] | (typeof translations)["ru"];
type CommonT = (typeof common)["en"] | (typeof common)["ru"];

function SalesTypeIcon({ type, className }: { type: string; className?: string }) {
  if (type === "phone") return <Phone className={className || "h-4 w-4"} weight="duotone" />;
  if (type === "chat") return <ChatCircle className={className || "h-4 w-4"} weight="duotone" />;
  return <Users className={className || "h-4 w-4"} weight="duotone" />;
}

function ConnectModal({
  script,
  t,
  projects,
  onClose,
  onConnected,
}: {
  script: ScriptRow;
  t: T;
  projects: ManagedProject[];
  onClose: () => void;
  onConnected: (projectId: string | null, projectName: string | null) => void;
}) {
  const [connecting, setConnecting] = React.useState<string | null>(null);

  const handleConnect = async (projectId: string, projectName: string) => {
    setConnecting(projectId);
    try {
      await connectScriptToProjectAction(script.id, projectId);
      onConnected(projectId, projectName);
      toast.success(t.connectedOk);
      onClose();
    } catch {
      toast.error(t.connectError);
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async () => {
    setConnecting("disconnect");
    try {
      await disconnectScriptFromProjectAction(script.id);
      onConnected(null, null);
      toast.success(t.disconnectedOk);
      onClose();
    } catch {
      toast.error(t.disconnectError);
    } finally {
      setConnecting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/15 bg-black/70 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h3 className="text-sm font-semibold text-white">{t.connectModalTitle}</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <p className="text-xs leading-5 text-neutral-400">{t.connectModalDesc}</p>

          {projects.length === 0 ? (
            <p className="py-6 text-center text-sm text-neutral-500">{t.noProjects}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {projects.map((project) => {
                const isCurrent = script.project_id === project.id;
                const isConnecting = connecting === project.id;

                return (
                  <button
                    key={project.id}
                    onClick={() => (isCurrent ? undefined : handleConnect(project.id, project.name))}
                    disabled={Boolean(connecting)}
                    className={cn(
                      "flex items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors",
                      isCurrent
                        ? "cursor-default border-emerald-400/35 bg-emerald-500/10"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20"
                    )}
                  >
                    <span className="text-sm text-white">{project.name}</span>
                    {isCurrent ? (
                      <CheckCircle className="h-4 w-4 text-emerald-400" weight="fill" />
                    ) : isConnecting ? (
                      <CircleNotch className="h-4 w-4 animate-spin text-neutral-400" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}

          {script.project_id && (
            <button
              onClick={handleDisconnect}
              disabled={Boolean(connecting)}
              className="w-full rounded-lg border border-rose-400/35 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-500/20 disabled:opacity-60"
            >
              {connecting === "disconnect" ? (
                <CircleNotch className="mr-1.5 inline h-3.5 w-3.5 animate-spin" />
              ) : null}
              {t.disconnect}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function ShareModal({
  script,
  t,
  c,
  users,
  loadingUsers,
  revoking,
  shareLink,
  onClose,
  onCopy,
  onRevoke,
}: {
  script: ScriptRow;
  t: T;
  c: CommonT;
  users: ScriptShareUser[];
  loadingUsers: boolean;
  revoking: boolean;
  shareLink: string;
  onClose: () => void;
  onCopy: (value: string) => void;
  onRevoke: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/15 bg-black/75 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h3 className="text-sm font-semibold text-white">{t.shareModalTitle}</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <p className="text-xs leading-5 text-neutral-400">{t.shareModalDesc}</p>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
              {t.shareLinkLabel}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-md border border-white/10 bg-black/35 px-3 py-2 text-xs text-white/90">
                {shareLink}
              </code>
              <button
                onClick={() => onCopy(shareLink)}
                className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/10 px-2.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/15"
              >
                <Copy className="h-3.5 w-3.5" />
                {t.copy}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                {t.acceptedCount}
              </p>
              <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] font-semibold text-white">
                {loadingUsers ? "..." : users.length}
              </span>
            </div>

            {loadingUsers ? (
              <div className="flex items-center gap-2 py-3 text-xs text-neutral-400">
                <CircleNotch className="h-4 w-4 animate-spin" />
                {c.loading}
              </div>
            ) : users.length === 0 ? (
              <p className="py-3 text-xs text-neutral-500">{t.acceptedUsersEmpty}</p>
            ) : (
              <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded-md border border-white/10 bg-black/30 px-2.5 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-white">
                        {user.user_name || user.user_email || user.user_id}
                      </p>
                      {user.user_email ? (
                        <p className="truncate text-[11px] text-neutral-400">{user.user_email}</p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-4">
            <button
              onClick={onRevoke}
              disabled={revoking}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-400/35 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-500/20 disabled:opacity-60"
            >
              {revoking ? <CircleNotch className="h-3.5 w-3.5 animate-spin" /> : null}
              {t.revokeShare}
            </button>
            <button
              onClick={onClose}
              className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/15"
            >
              {c.close}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function BulkLinksModal({
  result,
  scriptsMap,
  t,
  c,
  onClose,
  onCopy,
}: {
  result: Record<string, string>;
  scriptsMap: Map<string, ScriptRow>;
  t: T;
  c: CommonT;
  onClose: () => void;
  onCopy: (value: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/15 bg-black/75 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h3 className="text-sm font-semibold text-white">{t.bulkResultsTitle}</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[60vh] space-y-2 overflow-y-auto p-5">
          {Object.entries(result).map(([scriptId, key]) => {
            const title = scriptsMap.get(scriptId)?.title || t.untitledScript;
            return (
              <div
                key={scriptId}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{title}</p>
                  <code className="truncate text-xs tracking-[0.14em] text-neutral-300">{key}</code>
                </div>
                <button
                  onClick={() => onCopy(key)}
                  className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/15"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {t.copy}
                </button>
              </div>
            );
          })}
        </div>

        <div className="border-t border-white/10 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/15"
          >
            {c.close}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function ScriptsDashboardPage() {
  const { language, mounted } = useLanguage();
  const t = mounted ? getT(translations, language as Language) : translations.ru;
  const c = mounted ? getT(common, language as Language) : common.ru;

  const [scripts, setScripts] = React.useState<ScriptRow[]>([]);
  const [managedProjects, setManagedProjects] = React.useState<ManagedProject[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [connectingScript, setConnectingScript] = React.useState<ScriptRow | null>(null);
  const [sharingScriptId, setSharingScriptId] = React.useState<string | null>(null);
  const [shareUsers, setShareUsers] = React.useState<ScriptShareUser[]>([]);
  const [loadingShareUsers, setLoadingShareUsers] = React.useState(false);
  const [generatingShareId, setGeneratingShareId] = React.useState<string | null>(null);
  const [revokingShareId, setRevokingShareId] = React.useState<string | null>(null);

  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [projectFilterId, setProjectFilterId] = React.useState<string>("all");

  const [bulkMode, setBulkMode] = React.useState(false);
  const [selectedScriptIds, setSelectedScriptIds] = React.useState<string[]>([]);
  const [bulkProjectId, setBulkProjectId] = React.useState<string>("");
  const [bulkConnecting, setBulkConnecting] = React.useState(false);
  const [bulkSharing, setBulkSharing] = React.useState(false);
  const [bulkShareResult, setBulkShareResult] = React.useState<Record<string, string> | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    Promise.all([getMyScriptsWithSharesAction(), getManagedProjectsAction()])
      .then(([scriptsData, projectsData]) => {
        if (cancelled) return;
        setScripts(scriptsData);
        setManagedProjects(projectsData);
      })
      .catch(() => {
        if (cancelled) return;
        setScripts([]);
        setManagedProjects([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    setSelectedScriptIds((prev) => prev.filter((id) => scripts.some((script) => script.id === id)));
  }, [scripts]);

  const scriptsMap = React.useMemo(
    () => new Map(scripts.map((script) => [script.id, script])),
    [scripts]
  );
  const managedProjectsMap = React.useMemo(
    () => new Map(managedProjects.map((project) => [project.id, project.name])),
    [managedProjects]
  );
  const selectedSet = React.useMemo(() => new Set(selectedScriptIds), [selectedScriptIds]);

  const sharingScript = React.useMemo(
    () => (sharingScriptId ? scripts.find((script) => script.id === sharingScriptId) ?? null : null),
    [scripts, sharingScriptId]
  );
  const sharingKey = sharingScript?.share_key ?? null;

  React.useEffect(() => {
    if (!sharingScriptId || !sharingKey) {
      setShareUsers([]);
      setLoadingShareUsers(false);
      return;
    }

    let cancelled = false;
    setLoadingShareUsers(true);

    getScriptSharesAction(sharingScriptId)
      .then((users) => {
        if (cancelled) return;
        setShareUsers(users);
        setScripts((prev) =>
          prev.map((script) =>
            script.id === sharingScriptId ? { ...script, share_count: users.length } : script
          )
        );
      })
      .catch(() => {
        if (cancelled) return;
        setShareUsers([]);
        toast.error(t.sharesLoadError);
      })
      .finally(() => {
        if (!cancelled) setLoadingShareUsers(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sharingScriptId, sharingKey, t.sharesLoadError]);

  const handleConnected = React.useCallback(
    (scriptId: string, projectId: string | null, projectName: string | null) => {
      setScripts((prev) =>
        prev.map((script) =>
          script.id === scriptId
            ? {
                ...script,
                project_id: projectId,
                projects: projectId && projectName ? { id: projectId, name: projectName } : null,
              }
            : script
        )
      );
    },
    []
  );

  const copyValue = React.useCallback(
    async (value: string) => {
      try {
        await navigator.clipboard.writeText(value);
        toast.success(t.copied);
      } catch {
        toast.error(c.error);
      }
    },
    [c.error, t.copied]
  );

  const getShareLink = React.useCallback((key: string) => {
    const pathname = `/sales-agents/scripts/connect?key=${encodeURIComponent(key)}`;
    if (typeof window === "undefined") return pathname;
    return `${window.location.origin}${pathname}`;
  }, []);

  const handleOpenShare = async (script: ScriptRow) => {
    if (script.share_key) {
      setSharingScriptId(script.id);
      return;
    }

    setGeneratingShareId(script.id);
    try {
      const key = await generateShareKeyAction(script.id);
      setScripts((prev) =>
        prev.map((item) => (item.id === script.id ? { ...item, share_key: key } : item))
      );
      toast.success(t.shareKeyGenerated);
      setSharingScriptId(script.id);
    } catch {
      toast.error(t.shareGenerateError);
    } finally {
      setGeneratingShareId(null);
    }
  };

  const handleRevokeShare = async () => {
    if (!sharingScript) return;

    setRevokingShareId(sharingScript.id);
    try {
      await revokeShareKeyAction(sharingScript.id);
      setScripts((prev) =>
        prev.map((script) =>
          script.id === sharingScript.id
            ? { ...script, share_key: null, share_count: 0 }
            : script
        )
      );
      setShareUsers([]);
      setSharingScriptId(null);
      toast.success(t.shareKeyRevoked);
    } catch {
      toast.error(t.shareRevokeError);
    } finally {
      setRevokingShareId(null);
    }
  };

  const filteredScripts = React.useMemo(() => {
    return scripts.filter((script) => {
      const byStatus =
        statusFilter === "all" ||
        (statusFilter === "with_project" && Boolean(script.project_id)) ||
        (statusFilter === "sharing_active" && Boolean(script.share_key)) ||
        (statusFilter === "standalone" && !script.project_id);

      const byProject = projectFilterId === "all" || script.project_id === projectFilterId;

      return byStatus && byProject;
    });
  }, [projectFilterId, scripts, statusFilter]);

  const toggleBulkMode = () => {
    setBulkMode((prev) => {
      const next = !prev;
      if (!next) {
        setSelectedScriptIds([]);
        setBulkProjectId("");
      }
      return next;
    });
  };

  const toggleSelectScript = (scriptId: string) => {
    setSelectedScriptIds((prev) =>
      prev.includes(scriptId) ? prev.filter((id) => id !== scriptId) : [...prev, scriptId]
    );
  };

  const handleBulkConnect = async () => {
    if (selectedScriptIds.length === 0) {
      toast.error(t.bulkNoSelection);
      return;
    }
    if (!bulkProjectId) {
      toast.error(t.bulkNeedProject);
      return;
    }

    setBulkConnecting(true);
    try {
      const result = await bulkConnectScriptsAction(selectedScriptIds, bulkProjectId);
      const projectName = managedProjectsMap.get(bulkProjectId) ?? null;
      const selected = new Set(selectedScriptIds);

      setScripts((prev) =>
        prev.map((script) =>
          selected.has(script.id)
            ? {
                ...script,
                project_id: bulkProjectId,
                projects: projectName ? { id: bulkProjectId, name: projectName } : script.projects,
              }
            : script
        )
      );

      toast.success(`${t.bulkConnectSuccess}: ${result.connected}`);
    } catch {
      toast.error(t.bulkConnectError);
    } finally {
      setBulkConnecting(false);
    }
  };

  const handleBulkShare = async () => {
    if (selectedScriptIds.length === 0) {
      toast.error(t.bulkNoSelection);
      return;
    }

    setBulkSharing(true);
    try {
      const result = await bulkGenerateShareKeysAction(selectedScriptIds);
      const generatedCount = Object.keys(result).length;

      setScripts((prev) =>
        prev.map((script) =>
          result[script.id] ? { ...script, share_key: result[script.id] } : script
        )
      );

      setBulkShareResult(result);
      toast.success(`${t.bulkShareSuccess}: ${generatedCount}`);
    } catch {
      toast.error(t.bulkShareError);
    } finally {
      setBulkSharing(false);
    }
  };

  if (!mounted || isLoading) {
    return <PageLoader className="min-h-[calc(100vh-5rem)]" />;
  }

  if (scripts.length === 0) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-3xl items-center justify-center p-6">
        <div className="w-full rounded-2xl border border-white/15 bg-black/60 p-8 text-center shadow-xl backdrop-blur-xl">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-neutral-300">
            <ScrollText className="h-7 w-7" weight="duotone" />
          </div>
          <h1 className="text-2xl font-semibold text-white">{t.emptyTitle}</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-neutral-400">{t.emptyDesc}</p>
          <Link
            href="/sales-agents/scripts/new"
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-emerald-400/40 bg-emerald-500/15 px-4 py-2.5 text-sm font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/25"
          >
            <Plus className="h-4 w-4" />
            {t.createFirst}
          </Link>
        </div>
      </div>
    );
  }

  const filterTabs: Array<{ id: StatusFilter; label: string }> = [
    { id: "all", label: t.filterAll },
    { id: "with_project", label: t.filterWithProject },
    { id: "sharing_active", label: t.filterSharingActive },
    { id: "standalone", label: t.filterStandalone },
  ];

  const activeProjectLabel =
    projectFilterId === "all"
      ? t.projectFilterAll
      : managedProjectsMap.get(projectFilterId) ?? t.projectFilterAll;

  return (
    <div className="relative w-full min-h-[calc(100vh-5rem)] p-6 md:p-8 lg:p-10">
      <div className="mx-auto w-full max-w-[1240px]">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight text-white">{t.pageTitle}</h1>
            <p className="max-w-3xl text-sm text-neutral-400">{t.pageDesc}</p>
          </div>
          <Link
            href="/sales-agents/scripts/new"
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/35 bg-emerald-500/15 px-4 py-2.5 text-sm font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/25"
          >
            <Plus className="h-4 w-4" />
            {t.addScript}
          </Link>
        </div>

        <div className="mb-5 rounded-2xl border border-white/15 bg-black/55 p-4 backdrop-blur-xl">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                    statusFilter === tab.id
                      ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-200"
                      : "border-white/15 bg-white/[0.03] text-neutral-300 hover:border-white/25"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-neutral-200 transition-colors hover:border-white/25">
                  <Buildings className="h-3.5 w-3.5 text-neutral-400" />
                  <span>{activeProjectLabel}</span>
                  <CaretDown className="h-3.5 w-3.5 text-neutral-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="w-56 rounded-xl border border-white/15 bg-black/85 p-1.5 backdrop-blur-xl"
                >
                  <DropdownMenuItem
                    onClick={() => setProjectFilterId("all")}
                    className={cn(
                      "cursor-pointer rounded-lg px-2.5 py-2 text-xs font-semibold",
                      projectFilterId === "all" ? "text-cyan-300" : "text-neutral-200"
                    )}
                  >
                    <span className="flex w-full items-center justify-between">
                      {t.projectFilterAll}
                      {projectFilterId === "all" ? <Check className="h-3.5 w-3.5" /> : null}
                    </span>
                  </DropdownMenuItem>
                  {managedProjects.map((project) => (
                    <DropdownMenuItem
                      key={project.id}
                      onClick={() => setProjectFilterId(project.id)}
                      className={cn(
                        "cursor-pointer rounded-lg px-2.5 py-2 text-xs font-semibold",
                        projectFilterId === project.id ? "text-cyan-300" : "text-neutral-200"
                      )}
                    >
                      <span className="flex w-full items-center justify-between gap-2">
                        <span className="truncate">{project.name}</span>
                        {projectFilterId === project.id ? <Check className="h-3.5 w-3.5" /> : null}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <button
                onClick={toggleBulkMode}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                  bulkMode
                    ? "border-violet-400/40 bg-violet-500/15 text-violet-200"
                    : "border-white/15 bg-white/[0.03] text-neutral-200 hover:border-white/25"
                )}
              >
                {bulkMode ? t.massSharingOff : t.massSharingOn}
              </button>
            </div>
          </div>
        </div>

        {filteredScripts.length === 0 ? (
          <div className="rounded-2xl border border-white/15 bg-black/50 p-8 text-center text-neutral-400">
            {t.emptyDesc}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
          >
            {filteredScripts.map((script) => {
              const isConnected = Boolean(script.project_id);
              const isSharingActive = Boolean(script.share_key);
              const isSelected = selectedSet.has(script.id);
              const title = script.title || t.untitledScript;
              const projectName = script.projects?.name ?? null;
              const isGeneratingShare = generatingShareId === script.id;

              return (
                <motion.article
                  key={script.id}
                  variants={{
                    hidden: { opacity: 0, y: 6 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.18, ease: "easeOut" } },
                  }}
                  className={cn(
                    "relative flex min-h-[320px] flex-col rounded-2xl border bg-black/55 p-4 shadow-sm backdrop-blur-xl",
                    isSelected ? "border-cyan-400/40" : "border-white/15"
                  )}
                >
                  {bulkMode ? (
                    <button
                      onClick={() => toggleSelectScript(script.id)}
                      className={cn(
                        "absolute right-3 top-3 z-10 inline-flex h-5 w-5 items-center justify-center rounded border transition-colors",
                        isSelected
                          ? "border-cyan-400/40 bg-cyan-500/20 text-cyan-200"
                          : "border-white/20 bg-black/40 text-transparent hover:border-white/40"
                      )}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  ) : null}

                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-semibold text-white">{title}</h3>
                      <div className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/[0.03] px-2 py-1 text-xs text-neutral-300">
                        <SalesTypeIcon type={script.sales_type} className="h-3.5 w-3.5" />
                        {t[script.sales_type as "phone" | "chat" | "in_person"]}
                      </div>
                    </div>
                    <span className="shrink-0 rounded-md border border-white/15 bg-white/[0.03] px-2 py-1 text-xs font-semibold text-neutral-300">
                      {script.dialog_count} {t.dialogCount}
                    </span>
                  </div>

                  <div className="mt-3">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                      {t.scriptNotesLabel}
                    </p>
                    <p className="line-clamp-3 text-sm leading-6 text-neutral-300">
                      {script.description && script.description.trim().length > 0
                        ? script.description
                        : t.noNotes}
                    </p>
                  </div>

                  <div className="mt-4">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                      {t.statusLabel}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={cn(
                          "inline-flex max-w-full items-center gap-1 rounded-md border px-2 py-1 text-xs",
                          isConnected
                            ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-200"
                            : "border-white/15 bg-white/[0.03] text-neutral-400"
                        )}
                      >
                        <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">
                          {isConnected && projectName
                            ? `${t.connectedToProject}: ${projectName}`
                            : t.projectStatusStandalone}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs",
                          isSharingActive
                            ? "border-violet-400/35 bg-violet-500/12 text-violet-200"
                            : "border-white/15 bg-white/[0.03] text-neutral-400"
                        )}
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        {isSharingActive
                          ? `${t.sharingStatusActive} (${script.share_count ?? 0})`
                          : t.sharingStatusInactive}
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto grid grid-cols-1 gap-2 pt-4 sm:grid-cols-3">
                    <Link
                      href={`/sales-agents/scripts/${script.id}/chat`}
                      className="inline-flex items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-500/12 px-3 py-2 text-xs font-semibold text-cyan-200 transition-colors hover:bg-cyan-500/22"
                    >
                      {t.openEditor}
                    </Link>

                    <button
                      onClick={() => setConnectingScript(script)}
                      className={cn(
                        "inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors",
                        isConnected
                          ? "border-emerald-400/35 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/22"
                          : "border-white/15 bg-white/[0.04] text-neutral-200 hover:border-white/30"
                      )}
                    >
                      <LinkSimple className="h-3.5 w-3.5" />
                      <span className="truncate">
                        {isConnected ? projectName || t.projectStatusConnected : t.connectToProject}
                      </span>
                    </button>

                    <button
                      onClick={() => handleOpenShare(script)}
                      disabled={isGeneratingShare}
                      className={cn(
                        "inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-60",
                        isSharingActive
                          ? "border-violet-400/35 bg-violet-500/12 text-violet-200 hover:bg-violet-500/20"
                          : "border-white/15 bg-white/[0.04] text-neutral-200 hover:border-white/30"
                      )}
                    >
                      {isGeneratingShare ? (
                        <CircleNotch className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <UserPlus className="h-3.5 w-3.5" />
                      )}
                      {isSharingActive ? t.manageShareButton : t.shareButton}
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {bulkMode ? (
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            className="fixed bottom-4 left-1/2 z-40 w-[min(980px,calc(100%-1.5rem))] -translate-x-1/2 rounded-2xl border border-white/15 bg-black/75 p-3 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="text-sm font-semibold text-white">
                {t.selectedCount}: <span className="text-cyan-300">{selectedScriptIds.length}</span>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-neutral-200 transition-colors hover:border-white/30">
                    <Buildings className="h-3.5 w-3.5 text-neutral-400" />
                    <span>
                      {bulkProjectId
                        ? managedProjectsMap.get(bulkProjectId) ?? t.bulkSelectProject
                        : t.bulkSelectProject}
                    </span>
                    <CaretDown className="h-3.5 w-3.5 text-neutral-400" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    sideOffset={8}
                    className="w-56 rounded-xl border border-white/15 bg-black/85 p-1.5 backdrop-blur-xl"
                  >
                    {managedProjects.map((project) => (
                      <DropdownMenuItem
                        key={project.id}
                        onClick={() => setBulkProjectId(project.id)}
                        className={cn(
                          "cursor-pointer rounded-lg px-2.5 py-2 text-xs font-semibold",
                          bulkProjectId === project.id ? "text-cyan-300" : "text-neutral-200"
                        )}
                      >
                        <span className="flex w-full items-center justify-between gap-2">
                          <span className="truncate">{project.name}</span>
                          {bulkProjectId === project.id ? <Check className="h-3.5 w-3.5" /> : null}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <button
                  onClick={handleBulkConnect}
                  disabled={bulkConnecting}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-cyan-400/35 bg-cyan-500/15 px-3 py-2 text-xs font-semibold text-cyan-200 transition-colors hover:bg-cyan-500/22 disabled:opacity-60"
                >
                  {bulkConnecting ? <CircleNotch className="h-3.5 w-3.5 animate-spin" /> : null}
                  {t.bulkConnectAction}
                </button>

                <button
                  onClick={handleBulkShare}
                  disabled={bulkSharing}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-violet-400/35 bg-violet-500/12 px-3 py-2 text-xs font-semibold text-violet-200 transition-colors hover:bg-violet-500/20 disabled:opacity-60"
                >
                  {bulkSharing ? <CircleNotch className="h-3.5 w-3.5 animate-spin" /> : null}
                  {t.bulkShareAction}
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {connectingScript ? (
          <ConnectModal
            script={connectingScript}
            t={t}
            projects={managedProjects}
            onClose={() => setConnectingScript(null)}
            onConnected={(projectId, projectName) => {
              handleConnected(connectingScript.id, projectId, projectName);
            }}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {sharingScript && sharingScript.share_key ? (
          <ShareModal
            script={sharingScript}
            t={t}
            c={c}
            users={shareUsers}
            loadingUsers={loadingShareUsers}
            revoking={revokingShareId === sharingScript.id}
            shareLink={getShareLink(sharingScript.share_key)}
            onClose={() => setSharingScriptId(null)}
            onCopy={copyValue}
            onRevoke={handleRevokeShare}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {bulkShareResult ? (
          <BulkLinksModal
            result={bulkShareResult}
            scriptsMap={scriptsMap}
            t={t}
            c={c}
            onClose={() => setBulkShareResult(null)}
            onCopy={copyValue}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
