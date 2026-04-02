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
  disconnectTeamScriptAction,
  generateShareKeyAction,
  getManagedProjectsAction,
  getMyScriptsWithSharesAction,
  getProjectConnectedScriptsAction,
  getScriptSharesAction,
  getScriptConnectRequestsAction,
  approveScriptConnectRequestAction,
  rejectScriptConnectRequestAction,
  revokeShareKeyAction,
  requestScriptConnectAction,
  type Script,
  type ScriptConnectRequest,
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

type ManagedProject = { id: string; name: string; isOwner: boolean; role: string | null };
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

  const handleConnect = async (project: ManagedProject) => {
    setConnecting(project.id);
    try {
      const result = await requestScriptConnectAction(script.id, project.id);
      if (result.direct) {
        onConnected(project.id, project.name);
        toast.success(t.connectedOk);
      } else {
        toast.success(t.requestSentOk);
      }
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
        className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/92 shadow-2xl backdrop-blur-xl dark:border-white/15 dark:bg-black/70"
      >
        <div className="flex items-center justify-between border-b border-neutral-200/80 px-5 py-4 dark:border-white/10">
          <h3 className="text-sm font-semibold text-neutral-950 dark:text-white">{t.connectModalTitle}</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-neutral-500 transition-colors hover:bg-black/[0.05] hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <p className="text-xs leading-5 text-neutral-600 dark:text-neutral-400">{t.connectModalDesc}</p>

          {projects.length === 0 ? (
            <p className="py-6 text-center text-sm text-neutral-500 dark:text-neutral-500">{t.noProjects}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {projects.map((project) => {
                const isCurrent = script.project_id === project.id;
                const isConnecting = connecting === project.id;
                const canDirect = project.isOwner || project.role === "admin";
                const roleLabel = project.isOwner
                  ? t.ownerRoleLabel
                  : project.role === "admin"
                  ? t.adminRoleLabel
                  : t.memberRoleLabel;

                return (
                  <button
                    key={project.id}
                    onClick={() => isCurrent ? undefined : handleConnect(project)}
                    disabled={Boolean(connecting)}
                    className={cn(
                      "flex items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors",
                      isCurrent
                        ? "cursor-default border-emerald-200 bg-emerald-50 dark:border-emerald-400/35 dark:bg-emerald-500/10"
                        : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-neutral-900 dark:text-white block truncate">{project.name}</span>
                      {!isCurrent && (
                        <span className="text-[11px] text-neutral-500 dark:text-neutral-500">
                          {canDirect ? roleLabel : `${roleLabel} · ${t.requestLabel}`}
                        </span>
                      )}
                    </div>
                    {isCurrent ? (
                      <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" weight="fill" />
                    ) : isConnecting ? (
                      <CircleNotch className="h-4 w-4 animate-spin text-neutral-400 shrink-0" />
                    ) : !canDirect ? (
                      <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 shrink-0">
                        {t.requestLabel}
                      </span>
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
              className="w-full rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100 disabled:opacity-60 dark:border-rose-400/35 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20"
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
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/92 shadow-2xl backdrop-blur-xl dark:border-white/15 dark:bg-black/75"
      >
        <div className="flex items-center justify-between border-b border-neutral-200/80 px-5 py-4 dark:border-white/10">
          <h3 className="text-sm font-semibold text-neutral-950 dark:text-white">{t.shareModalTitle}</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-neutral-500 transition-colors hover:bg-black/[0.05] hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <p className="text-xs leading-5 text-neutral-600 dark:text-neutral-400">{t.shareModalDesc}</p>

          <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/80 p-3 dark:border-white/10 dark:bg-white/[0.03]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-500">
              {t.shareLinkLabel}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-800 dark:border-white/10 dark:bg-black/35 dark:text-white/90">
                {shareLink}
              </code>
              <button
                onClick={() => onCopy(shareLink)}
                className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2.5 py-2 text-xs font-semibold text-neutral-900 transition-colors hover:bg-neutral-100 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
              >
                <Copy className="h-3.5 w-3.5" />
                {t.copy}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/80 p-3 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-500">
                {t.acceptedCount}
              </p>
              <span className="rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-neutral-900 dark:border-white/10 dark:bg-transparent dark:text-white">
                {loadingUsers ? "..." : users.length}
              </span>
            </div>

            {loadingUsers ? (
              <div className="flex items-center gap-2 py-3 text-xs text-neutral-500 dark:text-neutral-400">
                <CircleNotch className="h-4 w-4 animate-spin" />
                {c.loading}
              </div>
            ) : users.length === 0 ? (
              <p className="py-3 text-xs text-neutral-500 dark:text-neutral-500">{t.acceptedUsersEmpty}</p>
            ) : (
              <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded-md border border-neutral-200 bg-white px-2.5 py-2 dark:border-white/10 dark:bg-black/30"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-neutral-950 dark:text-white">
                        {user.user_name || user.user_email || user.user_id}
                      </p>
                      {user.user_email ? (
                        <p className="truncate text-[11px] text-neutral-500 dark:text-neutral-400">{user.user_email}</p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-neutral-200/80 pt-4 dark:border-white/10">
            <button
              onClick={onRevoke}
              disabled={revoking}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100 disabled:opacity-60 dark:border-rose-400/35 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20"
            >
              {revoking ? <CircleNotch className="h-3.5 w-3.5 animate-spin" /> : null}
              {t.revokeShare}
            </button>
            <button
              onClick={onClose}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-900 transition-colors hover:bg-neutral-100 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
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
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/92 shadow-2xl backdrop-blur-xl dark:border-white/15 dark:bg-black/75"
      >
        <div className="flex items-center justify-between border-b border-neutral-200/80 px-5 py-4 dark:border-white/10">
          <h3 className="text-sm font-semibold text-neutral-950 dark:text-white">{t.bulkResultsTitle}</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-neutral-500 transition-colors hover:bg-black/[0.05] hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
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
                className="flex items-center gap-2 rounded-lg border border-neutral-200/80 bg-neutral-50/80 px-3 py-2 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-neutral-950 dark:text-white">{title}</p>
                  <code className="truncate text-xs tracking-[0.14em] text-neutral-600 dark:text-neutral-300">{key}</code>
                </div>
                <button
                  onClick={() => onCopy(key)}
                  className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-neutral-900 transition-colors hover:bg-neutral-100 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {t.copy}
                </button>
              </div>
            );
          })}
        </div>

        <div className="border-t border-neutral-200/80 px-5 py-4 dark:border-white/10">
          <button
            onClick={onClose}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-900 transition-colors hover:bg-neutral-100 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
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
  const [projectScripts, setProjectScripts] = React.useState<(Script & { dialog_count: number; share_count: number; member_name: string | null; member_email: string | null })[]>([]);
  const [managedProjects, setManagedProjects] = React.useState<ManagedProject[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [connectRequests, setConnectRequests] = React.useState<ScriptConnectRequest[]>([]);
  const [processingRequestId, setProcessingRequestId] = React.useState<string | null>(null);
  const [previewRequest, setPreviewRequest] = React.useState<ScriptConnectRequest | null>(null);
  const [disconnectingTeamScriptId, setDisconnectingTeamScriptId] = React.useState<string | null>(null);

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

    Promise.all([
      getMyScriptsWithSharesAction(),
      getManagedProjectsAction(),
      getScriptConnectRequestsAction().catch(() => []),
      getProjectConnectedScriptsAction().catch(() => []),
    ])
      .then(([scriptsData, projectsData, requests, projScripts]) => {
        if (cancelled) return;
        setScripts(scriptsData);
        setManagedProjects(projectsData);
        setConnectRequests(requests);
        setProjectScripts(projScripts);
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

  const handleApproveRequest = React.useCallback(async (requestId: string) => {
    setProcessingRequestId(requestId);
    try {
      await approveScriptConnectRequestAction(requestId);
      setConnectRequests((prev) => prev.filter((r) => r.id !== requestId));
      setPreviewRequest(null);
      // Refresh both own scripts and project-connected scripts
      getMyScriptsWithSharesAction().then(setScripts).catch(() => {});
      getProjectConnectedScriptsAction().then(setProjectScripts).catch(() => {});
      toast.success(language === "ru" ? "Скрипт подключён к проекту" : "Script connected to project");
    } catch (err: any) {
      toast.error(language === "ru" ? "Не удалось одобрить запрос" : "Failed to approve request");
    } finally {
      setProcessingRequestId(null);
    }
  }, [language]);

  const handleRejectRequest = React.useCallback(async (requestId: string) => {
    setProcessingRequestId(requestId);
    try {
      await rejectScriptConnectRequestAction(requestId);
      setConnectRequests((prev) => prev.filter((r) => r.id !== requestId));
      setPreviewRequest(null);
      toast.success(language === "ru" ? "Запрос отклонён" : "Request rejected");
    } catch {
      toast.error(language === "ru" ? "Не удалось отклонить запрос" : "Failed to reject request");
    } finally {
      setProcessingRequestId(null);
    }
  }, [language]);

  const handleDisconnectTeamScript = React.useCallback(async (scriptId: string) => {
    setDisconnectingTeamScriptId(scriptId);
    try {
      await disconnectTeamScriptAction(scriptId);
      setProjectScripts((prev) => prev.filter((s) => s.id !== scriptId));
      toast.success(language === "ru" ? "Скрипт отключён от проекта" : "Script disconnected from project");
    } catch {
      toast.error(language === "ru" ? "Не удалось отключить скрипт" : "Failed to disconnect script");
    } finally {
      setDisconnectingTeamScriptId(null);
    }
  }, [language]);

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
        <div className="w-full rounded-2xl border border-neutral-200/80 bg-white/88 p-8 text-center shadow-xl backdrop-blur-xl dark:border-white/15 dark:bg-black/60">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-300">
            <ScrollText className="h-7 w-7" weight="duotone" />
          </div>
          <h1 className="text-2xl font-semibold text-neutral-950 dark:text-white">{t.emptyTitle}</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-neutral-600 dark:text-neutral-400">{t.emptyDesc}</p>
          <Link
            href="/sales-agents/scripts/new"
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-400/40 dark:bg-emerald-500/15 dark:text-emerald-300 dark:hover:bg-emerald-500/25"
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
    <div className="relative min-h-[calc(100vh-5rem)] w-full">
      <div className="mx-auto w-full max-w-[1160px] px-4 py-5 sm:px-6 md:px-8 md:py-6 lg:px-8 lg:py-8">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4 md:mb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 dark:text-white">{t.pageTitle}</h1>
            <p className="max-w-3xl text-sm text-neutral-600 dark:text-neutral-400">{t.pageDesc}</p>
          </div>
          <Link
            href="/sales-agents/scripts/new"
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-400/35 dark:bg-emerald-500/15 dark:text-emerald-300 dark:hover:bg-emerald-500/25"
          >
            <Plus className="h-4 w-4" />
            {t.addScript}
          </Link>
        </div>

        {/* ── Pending script connect requests (owner only) ───────────────── */}
        {connectRequests.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {language === "ru" ? "Запросы на подключение скриптов" : "Script connect requests"}
              </h2>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                {connectRequests.length}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {connectRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-amber-200/80 bg-amber-50/60 dark:border-amber-500/20 dark:bg-amber-500/5 px-5 py-4"
                >
                  {/* Avatar + name */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {(req.requester_name || req.requester_email || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                        {req.requester_name || req.requester_email || "Unknown"}
                      </p>
                      {req.requester_name && (
                        <p className="text-[11px] text-neutral-500 truncate">{req.requester_email}</p>
                      )}
                    </div>
                  </div>

                  {/* Script info + project */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-neutral-700 dark:text-neutral-300 truncate">
                      <span className="font-semibold text-neutral-900 dark:text-white">
                        {req.script_title || (language === "ru" ? "Скрипт без названия" : "Untitled script")}
                      </span>
                      {" → "}
                      <span className="text-emerald-700 dark:text-emerald-400">{req.project_name}</span>
                    </p>
                    {req.script_description && (
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-500 line-clamp-1 mt-0.5">
                        {req.script_description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setPreviewRequest(req)}
                      className="text-[12px] font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      {language === "ru" ? "Просмотр" : "Preview"}
                    </button>
                    <button
                      onClick={() => handleRejectRequest(req.id)}
                      disabled={processingRequestId === req.id}
                      className="text-[12px] font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-500/20 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                    >
                      {processingRequestId === req.id ? (
                        <CircleNotch className="w-3.5 h-3.5 animate-spin" />
                      ) : (language === "ru" ? "Отклонить" : "Reject")}
                    </button>
                    <button
                      onClick={() => handleApproveRequest(req.id)}
                      disabled={processingRequestId === req.id}
                      className="text-[12px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
                    >
                      {processingRequestId === req.id ? (
                        <CircleNotch className="w-3.5 h-3.5 animate-spin" />
                      ) : (language === "ru" ? "Принять" : "Approve")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4 rounded-2xl border border-neutral-200/80 bg-white/82 p-3.5 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.25)] backdrop-blur-xl dark:border-white/15 dark:bg-black/55 md:mb-5 md:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                    statusFilter === tab.id
                      ? "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-400/40 dark:bg-cyan-500/15 dark:text-cyan-200"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 dark:border-white/15 dark:bg-white/[0.03] dark:text-neutral-300 dark:hover:border-white/25"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 transition-colors hover:border-neutral-300 dark:border-white/15 dark:bg-white/[0.03] dark:text-neutral-200 dark:hover:border-white/25">
                  <Buildings className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
                  <span>{activeProjectLabel}</span>
                  <CaretDown className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="w-56 rounded-xl border border-neutral-200 bg-white/95 p-1.5 backdrop-blur-xl dark:border-white/15 dark:bg-black/85"
                >
                  <DropdownMenuItem
                    onClick={() => setProjectFilterId("all")}
                    className={cn(
                      "cursor-pointer rounded-lg px-2.5 py-2 text-xs font-semibold",
                      projectFilterId === "all"
                        ? "text-cyan-700 dark:text-cyan-300"
                        : "text-neutral-800 dark:text-neutral-200"
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
                      projectFilterId === project.id
                        ? "text-cyan-700 dark:text-cyan-300"
                        : "text-neutral-800 dark:text-neutral-200"
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
                    ? "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-400/40 dark:bg-violet-500/15 dark:text-violet-200"
                    : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300 dark:border-white/15 dark:bg-white/[0.03] dark:text-neutral-200 dark:hover:border-white/25"
                )}
              >
                {bulkMode ? t.massSharingOff : t.massSharingOn}
              </button>
            </div>
          </div>
        </div>

        {filteredScripts.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200/80 bg-white/82 p-8 text-center text-neutral-600 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.25)] dark:border-white/15 dark:bg-black/50 dark:text-neutral-400">
            {t.emptyDesc}
          </div>
        ) : (
          <motion.div
            className="grid justify-center gap-4 [grid-template-columns:repeat(auto-fit,minmax(320px,360px))]"
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
                    "relative flex min-h-[320px] flex-col rounded-2xl border bg-white/84 p-4 shadow-[0_20px_70px_-46px_rgba(15,23,42,0.28)] backdrop-blur-xl dark:bg-black/55 dark:shadow-sm",
                    isSelected
                      ? "border-cyan-200 dark:border-cyan-400/40"
                      : "border-neutral-200/80 dark:border-white/15"
                  )}
                >
                  {bulkMode ? (
                    <button
                      onClick={() => toggleSelectScript(script.id)}
                      className={cn(
                        "absolute right-3 top-3 z-10 inline-flex h-5 w-5 items-center justify-center rounded border transition-colors",
                        isSelected
                          ? "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-400/40 dark:bg-cyan-500/20 dark:text-cyan-200"
                          : "border-neutral-200 bg-white text-transparent hover:border-neutral-300 dark:border-white/20 dark:bg-black/40 dark:hover:border-white/40"
                      )}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  ) : null}

                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-semibold text-neutral-950 dark:text-white">{title}</h3>
                      <div className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-700 dark:border-white/15 dark:bg-white/[0.03] dark:text-neutral-300">
                        <SalesTypeIcon type={script.sales_type} className="h-3.5 w-3.5" />
                        {t[script.sales_type as "phone" | "chat" | "in_person"]}
                      </div>
                    </div>
                    <span className="shrink-0 rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs font-semibold text-neutral-700 dark:border-white/15 dark:bg-white/[0.03] dark:text-neutral-300">
                      {script.dialog_count} {t.dialogCount}
                    </span>
                  </div>

                  <div className="mt-3">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-500">
                      {t.scriptNotesLabel}
                    </p>
                    <p className="line-clamp-3 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                      {script.description && script.description.trim().length > 0
                        ? script.description
                        : t.noNotes}
                    </p>
                  </div>

                  <div className="mt-4">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-500">
                      {t.statusLabel}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={cn(
                          "inline-flex max-w-full items-center gap-1 rounded-md border px-2 py-1 text-xs",
                          isConnected
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/35 dark:bg-emerald-500/10 dark:text-emerald-200"
                            : "border-neutral-200 bg-white text-neutral-500 dark:border-white/15 dark:bg-white/[0.03] dark:text-neutral-400"
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
                            ? "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-400/35 dark:bg-violet-500/12 dark:text-violet-200"
                            : "border-neutral-200 bg-white text-neutral-500 dark:border-white/15 dark:bg-white/[0.03] dark:text-neutral-400"
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
                      className="inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-700 transition-colors hover:bg-cyan-100 dark:border-cyan-400/30 dark:bg-cyan-500/12 dark:text-cyan-200 dark:hover:bg-cyan-500/22"
                    >
                      {t.openEditor}
                    </Link>

                    <button
                      onClick={() => setConnectingScript(script)}
                      className={cn(
                        "inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors",
                        isConnected
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-400/35 dark:bg-emerald-500/15 dark:text-emerald-200 dark:hover:bg-emerald-500/22"
                          : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300 dark:border-white/15 dark:bg-white/[0.04] dark:text-neutral-200 dark:hover:border-white/30"
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
                          ? "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 dark:border-violet-400/35 dark:bg-violet-500/12 dark:text-violet-200 dark:hover:bg-violet-500/20"
                          : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300 dark:border-white/15 dark:bg-white/[0.04] dark:text-neutral-200 dark:hover:border-white/30"
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

        {/* ── Scripts connected to my projects by team members ─────── */}
        {projectScripts.length > 0 && (
          <div className="mt-10">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                {language === "ru" ? "Скрипты участников проекта" : "Team scripts in your projects"}
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                {language === "ru"
                  ? "Скрипты добавленные участниками ваших проектов"
                  : "Scripts added by members of your projects"}
              </p>
            </div>
            <motion.div
              className="grid justify-center gap-4 [grid-template-columns:repeat(auto-fit,minmax(320px,360px))]"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
            >
              {projectScripts.map((script) => {
                const title = script.title || (language === "ru" ? "Без названия" : "Untitled script");
                const projectName = (script as any).projects?.name ?? null;

                return (
                  <motion.article
                    key={script.id}
                    variants={{ hidden: { opacity: 0, y: 6 }, visible: { opacity: 1, y: 0, transition: { duration: 0.2 } } }}
                    className="flex flex-col gap-3 rounded-2xl border border-indigo-100 dark:border-indigo-500/15 bg-white/90 dark:bg-[#0f0f10] p-4 shadow-sm"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold text-neutral-900 dark:text-white">{title}</h3>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="text-[11px] text-neutral-500">{script.dialog_count} {language === "ru" ? "диалогов" : "dialogs"}</span>
                          {projectName && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                              <span className="w-1 h-1 rounded-full bg-emerald-500 inline-block" />
                              {projectName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Member info */}
                    <div className="flex items-center gap-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/5 px-3 py-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                        {(script.member_name || script.member_email || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-medium text-neutral-700 dark:text-neutral-300 truncate">
                          {script.member_name || script.member_email || "Unknown"}
                        </p>
                        {script.member_name && script.member_email && (
                          <p className="text-[10px] text-neutral-500 truncate">{script.member_email}</p>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {script.description && (
                      <p className="text-[12px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                        {script.description}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="mt-auto flex gap-2">
                      <Link
                        href={`/sales-agents/scripts/${script.id}/chat`}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-transparent hover:bg-neutral-50 dark:hover:bg-white/[0.04] px-3 py-2 text-[12px] font-semibold text-neutral-700 dark:text-neutral-300 transition-colors"
                      >
                        {language === "ru" ? "Открыть" : "Open"} →
                      </Link>
                      <button
                        onClick={() => handleDisconnectTeamScript(script.id)}
                        disabled={disconnectingTeamScriptId === script.id}
                        className="flex items-center justify-center gap-1 rounded-xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/5 hover:bg-rose-100 dark:hover:bg-rose-500/10 px-3 py-2 text-[12px] font-semibold text-rose-700 dark:text-rose-400 transition-colors disabled:opacity-50"
                      >
                        {disconnectingTeamScriptId === script.id ? (
                          <CircleNotch className="w-3.5 h-3.5 animate-spin" />
                        ) : (language === "ru" ? "Отключить" : "Disconnect")}
                      </button>
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {bulkMode ? (
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            className="fixed bottom-4 left-1/2 z-40 w-[min(980px,calc(100%-1.5rem))] -translate-x-1/2 rounded-2xl border border-neutral-200/80 bg-white/92 p-3 shadow-2xl backdrop-blur-xl dark:border-white/15 dark:bg-black/75"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="text-sm font-semibold text-neutral-950 dark:text-white">
                {t.selectedCount}: <span className="text-cyan-700 dark:text-cyan-300">{selectedScriptIds.length}</span>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-800 transition-colors hover:border-neutral-300 dark:border-white/15 dark:bg-white/[0.03] dark:text-neutral-200 dark:hover:border-white/30">
                    <Buildings className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
                    <span>
                      {bulkProjectId
                        ? managedProjectsMap.get(bulkProjectId) ?? t.bulkSelectProject
                        : t.bulkSelectProject}
                    </span>
                    <CaretDown className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    sideOffset={8}
                    className="w-56 rounded-xl border border-neutral-200 bg-white/95 p-1.5 backdrop-blur-xl dark:border-white/15 dark:bg-black/85"
                  >
                    {managedProjects.map((project) => (
                      <DropdownMenuItem
                        key={project.id}
                        onClick={() => setBulkProjectId(project.id)}
                        className={cn(
                          "cursor-pointer rounded-lg px-2.5 py-2 text-xs font-semibold",
                          bulkProjectId === project.id
                            ? "text-cyan-700 dark:text-cyan-300"
                            : "text-neutral-800 dark:text-neutral-200"
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
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-700 transition-colors hover:bg-cyan-100 disabled:opacity-60 dark:border-cyan-400/35 dark:bg-cyan-500/15 dark:text-cyan-200 dark:hover:bg-cyan-500/22"
                >
                  {bulkConnecting ? <CircleNotch className="h-3.5 w-3.5 animate-spin" /> : null}
                  {t.bulkConnectAction}
                </button>

                <button
                  onClick={handleBulkShare}
                  disabled={bulkSharing}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 transition-colors hover:bg-violet-100 disabled:opacity-60 dark:border-violet-400/35 dark:bg-violet-500/12 dark:text-violet-200 dark:hover:bg-violet-500/20"
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

      {/* ── Script connect request preview modal ─────────────────── */}
      <AnimatePresence>
        {previewRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewRequest(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-white/15 dark:bg-[#111]"
            >
              <div className="flex items-center justify-between border-b border-neutral-200/80 px-5 py-4 dark:border-white/10">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {language === "ru" ? "Запрос на подключение" : "Script connect request"}
                </h3>
                <button
                  onClick={() => setPreviewRequest(null)}
                  className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Requester */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {(previewRequest.requester_name || previewRequest.requester_email || "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-neutral-900 dark:text-white">
                      {previewRequest.requester_name || previewRequest.requester_email}
                    </p>
                    {previewRequest.requester_name && (
                      <p className="text-[12px] text-neutral-500">{previewRequest.requester_email}</p>
                    )}
                  </div>
                </div>

                {/* Script details */}
                <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-4 space-y-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-500 mb-1">
                      {language === "ru" ? "Скрипт" : "Script"}
                    </p>
                    <p className="text-[15px] font-bold text-neutral-900 dark:text-white">
                      {previewRequest.script_title || (language === "ru" ? "Без названия" : "Untitled")}
                    </p>
                  </div>
                  {previewRequest.script_description && (
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-500 mb-1">
                        {language === "ru" ? "Описание" : "Description"}
                      </p>
                      <p className="text-[13px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {previewRequest.script_description}
                      </p>
                    </div>
                  )}
                  {previewRequest.script_sales_type && (
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-500 mb-1">
                        {language === "ru" ? "Тип" : "Type"}
                      </p>
                      <p className="text-[12px] text-neutral-700 dark:text-neutral-300 capitalize">
                        {previewRequest.script_sales_type}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-500 mb-1">
                      {language === "ru" ? "Подключить к проекту" : "Connect to project"}
                    </p>
                    <p className="text-[13px] font-semibold text-emerald-700 dark:text-emerald-400">
                      {previewRequest.project_name}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => handleRejectRequest(previewRequest.id)}
                    disabled={!!processingRequestId}
                    className="flex-1 rounded-xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/5 text-rose-700 dark:text-rose-400 text-[13px] font-semibold py-2.5 hover:bg-rose-100 dark:hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                  >
                    {processingRequestId ? <CircleNotch className="w-4 h-4 animate-spin mx-auto" /> : (language === "ru" ? "Отклонить" : "Reject")}
                  </button>
                  <button
                    onClick={() => handleApproveRequest(previewRequest.id)}
                    disabled={!!processingRequestId}
                    className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-bold py-2.5 transition-colors disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                  >
                    {processingRequestId ? <CircleNotch className="w-4 h-4 animate-spin mx-auto" /> : (language === "ru" ? "Принять" : "Approve")}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
