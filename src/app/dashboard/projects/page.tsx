"use client";

import * as React from "react";
import {
  Plus,
  Buildings as Building2,
  CircleNotch as Loader2,
  UserCheck,
  UserMinus as UserX,
  Gear as Settings,
  X,
  Trash as Trash2,
  Link as Link2,
  CheckCircle,
  XCircle,
  CaretDown,
  Check,
} from "@phosphor-icons/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase";
import { useLanguage } from "@/hooks/useLanguage";
import { AvatarCircles } from "@/components/ui/avatar-circles";
import { PageLoader } from "@/components/ui/page-loader";
import { toast } from "sonner";
import {
  normalizeProfile,
  type MemberRole,
  type Project,
  type ProjectDetail,
  type ProjectDetailValue,
  type ProjectMember,
} from "@/lib/projects";
import {
  approveMemberAction,
  rejectMemberAction,
  updateMemberRoleAction,
  removeMemberAction,
} from "@/app/actions/members";

import { projects as translations, common, t as getT, type Language } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";
import { InteractiveGridPattern } from "@/components/ui/interactive-grid-pattern";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Meteors } from "@/components/ui/meteors";
import { AuroraText } from "@/components/ui/aurora-text";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { MagicCard } from "@/components/ui/magic-card";
import { useTheme } from "next-themes";

export default function ProjectsPage() {
  const { language, mounted } = useLanguage();
  const t = mounted ? getT(translations, language as Language) : translations.ru;
  const c = mounted ? getT(common, language as Language) : common.ru;

  const [projects, setProjects] = React.useState<Project[]>([]);
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [dbError, setDbError] = React.useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = React.useState<Record<string, MemberRole>>({});
  const [managingProjectId, setManagingProjectId] = React.useState<string | null>(null);
  const [reviewingProjectId, setReviewingProjectId] = React.useState<string | null>(null);
  const [copiedProjectId, setCopiedProjectId] = React.useState<string | null>(null);
  const supabase = React.useMemo(() => createClient(), []);
  const { resolvedTheme } = useTheme();

  const fetchProjects = React.useCallback(async () => {
    setIsLoading(true);
    setDbError(null);

    // ── Run auth + projects fetch in parallel (saves ~150ms per load) ──
    const [{ data: userData, error: userError }, { data, error }] = await Promise.all([
      supabase.auth.getUser(),
      supabase
        .from("projects")
        .select("id, name, created_at, owner_id, join_key, plan, details")
        .order("created_at", { ascending: false }),
    ]);

    if (userError) {
      setDbError(userError.message);
      setIsLoading(false);
      return;
    }

    const userId = userData?.user?.id || null;
    setCurrentUserId(userId);

    if (error) {
      setDbError(error.message);
      setIsLoading(false);
      return;
    }

    if (data) {
      let projectsData = data as Project[];
      const projectIds = projectsData.map(p => p.id);

      if (projectIds.length > 0) {
        // Members query runs after we have project IDs (can't parallelize this one)
        const { data: membersData, error: membersError } = await supabase
          .from('project_members')
          .select(`
            id, project_id, user_id, status, role, user_name, user_email,
            profiles ( id, full_name, avatar_url )
          `)
          .in('project_id', projectIds);

        if (membersError) {
          setDbError(membersError.message);
          setIsLoading(false);
          return;
        }

        if (membersData) {
          const typedMembers = membersData as ProjectMember[];

          projectsData = projectsData.map(p => ({
            ...p,
            members: typedMembers.filter((member) => member.project_id === p.id)
          }));
        }
      }

      // Frontend RLS fallback — extra safety net
      projectsData = projectsData.filter(p =>
        p.owner_id === userId ||
        p.members?.some(m => m.user_id === userId && (m.status === "approved" || m.status === "pending"))
      );

      // Fetch script counts for the loaded projects
      const { data: scriptsData } = await supabase
        .from("scripts")
        .select("project_id")
        .in("project_id", projectIds);

      const scriptCounts: Record<string, number> = {};
      for (const s of (scriptsData || [])) {
        if (s.project_id) {
          scriptCounts[s.project_id] = (scriptCounts[s.project_id] || 0) + 1;
        }
      }

      projectsData = projectsData.map(p => ({
        ...p,
        scripts_count: scriptCounts[p.id] || 0
      }));

      setProjects(projectsData);
    }
    setIsLoading(false);
  }, [supabase]);

  React.useEffect(() => {
    fetchProjects();

    const channel = supabase.channel('projects-page')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_members' }, () => {
        // Trigger fetch when members are added/updated (e.g. someone requests to join, or gets approved)
        fetchProjects();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        // Trigger fetch when projects are added/updated
        fetchProjects();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProjects, supabase]);

  // ── Optimistic helper: remove a member from local state without refetch ──
  const removeMemberLocally = (memberId: string) => {
    setProjects(prev => prev.map(p => ({
      ...p,
      members: p.members?.filter((member) => member.id !== memberId)
    })));
  };

  // ── Optimistic helper: update member fields in local state ──
  const updateMemberLocally = (
    memberId: string,
    patch: Partial<Pick<ProjectMember, "role" | "status">>
  ) => {
    setProjects(prev => prev.map(p => ({
      ...p,
      members: p.members?.map((member) =>
        member.id === memberId ? { ...member, ...patch } : member
      )
    })));
  };

  const getErrorMessage = (error: unknown, fallback: string) =>
    error instanceof Error && error.message ? error.message : fallback;

  const handleApprove = async (memberId: string) => {
    const role = (selectedRoles[memberId] || "sales_manager") as MemberRole;
    // Optimistic update
    updateMemberLocally(memberId, { status: 'approved', role });
    try {
      await approveMemberAction(memberId, role);
      toast.success(language === 'ru' ? 'Участник принят' : 'Member approved');
    } catch (error) {
      // Rollback on failure
      void fetchProjects();
      toast.error(getErrorMessage(error, language === 'ru' ? 'Ошибка при одобрении' : 'Failed to approve'));
    }
  };

  const handleReject = async (memberId: string) => {
    // Optimistic update
    removeMemberLocally(memberId);
    try {
      await rejectMemberAction(memberId);
      toast.success(language === 'ru' ? 'Запрос отклонён' : 'Request rejected');
    } catch (error) {
      void fetchProjects();
      toast.error(getErrorMessage(error, language === 'ru' ? 'Ошибка при отклонении' : 'Failed to reject'));
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: MemberRole) => {
    updateMemberLocally(memberId, { role: newRole });
    try {
      await updateMemberRoleAction(memberId, newRole);
      toast.success(t.roleUpdated);
    } catch (error) {
      void fetchProjects();
      toast.error(getErrorMessage(error, language === 'ru' ? 'Ошибка обновления роли' : 'Failed to update role'));
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    removeMemberLocally(memberId);
    try {
      await removeMemberAction(memberId);
      toast.success(language === 'ru' ? 'Участник удалён' : 'Member removed');
    } catch (error) {
      void fetchProjects();
      toast.error(getErrorMessage(error, language === 'ru' ? 'Ошибка удаления участника' : 'Failed to remove member'));
    }
  };


  const getDetailValue = (
    details: ProjectDetail[],
    keywords: string[]
  ): ProjectDetailValue | undefined => {
    return details.find((detail) =>
      keywords.some((keyword) =>
        detail.name.toLowerCase().includes(keyword.toLowerCase())
      )
    )?.information;
  };

  const projectsDotPatternBackground = null;

  if (!mounted || isLoading) {
    return <PageLoader className="min-h-[calc(100vh-5rem)]" />;
  }

  if (dbError) {
    return (
      <>
        {projectsDotPatternBackground}
        <div className="relative z-10 w-full h-[60vh] flex flex-col items-center justify-center text-center p-8 text-rose-500">
          <h2 className="text-lg font-bold mb-2">Supabase Query Error</h2>
          <code className="text-sm bg-rose-50 dark:bg-rose-900/20 px-4 py-2 rounded-md">{dbError}</code>
        </div>
      </>
    );
  }

  const managingProject = managingProjectId
    ? projects.find((project) => project.id === managingProjectId) ?? null
    : null;
  const reviewingProject = reviewingProjectId
    ? projects.find((project) => project.id === reviewingProjectId) ?? null
    : null;
  const managedMembers = managingProject
    ? managingProject.members?.filter(
        (member) => member.status === "approved" && member.user_id !== managingProject.owner_id
      ) ?? []
    : [];
  const pendingReviewMembers = reviewingProject
    ? reviewingProject.members?.filter((member) => member.status === "pending") ?? []
    : [];

  const roleOptions: Array<{ value: MemberRole; label: string }> = [
    { value: "sales_manager", label: t.salesManager },
    { value: "admin", label: t.adminRole },
  ];

  const getRoleLabel = (role: MemberRole) =>
    roleOptions.find((option) => option.value === role)?.label ?? t.salesManager;

  if (projects.length === 0) {
    return (
      <>
        <div className="w-full max-w-2xl mx-auto flex flex-col pt-20 lg:pt-32 items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center text-center p-8 bg-white dark:bg-[#111] border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full">
            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 rounded-xl flex items-center justify-center mb-6 border border-neutral-200 dark:border-neutral-800">
              <Building2 className="w-8 h-8" weight="duotone" />
            </div>
            
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mb-2">
              {t.pageTitle}
            </h1>
            <p className="text-base text-neutral-500 dark:text-neutral-400 mb-8 max-w-md">
              {t.emptyDesc}
            </p>

            <div className="flex items-center justify-center gap-3">
              <Link href="/sales-agents/projects/new">
                <button className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-400 text-white dark:text-neutral-950 px-6 py-2.5 rounded-lg text-[13px] font-bold transition-colors shadow-sm">
                  <Plus className="w-4 h-4" />
                  {t.createProjectBtn}
                </button>
              </Link>
              <Link href="/sales-agents/projects/connect">
                <button className="flex items-center justify-center gap-2 bg-white dark:bg-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 shadow-sm px-6 py-2.5 rounded-lg text-[13px] font-medium transition-colors">
                  <Link2 className="w-4 h-4" />
                  {t.connectProject}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {projectsDotPatternBackground}
      <div className="w-full flex-1 flex flex-col p-6 md:p-8 lg:p-12 relative z-10">
        <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 mb-1">
            {t.pageTitle}
          </h1>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/sales-agents/projects/connect"
            className="inline-flex items-center justify-center gap-2 bg-white dark:bg-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 shadow-sm px-4 py-2 rounded-lg text-[13px] font-medium transition-colors shrink-0"
          >
            <Link2 className="w-4 h-4" />
            {t.connectProject}
          </Link>
          <Link
            href="/sales-agents/projects/new"
            className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-400 text-white dark:text-neutral-950 px-4 py-2 rounded-lg text-[13px] font-bold transition-colors shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            {t.newProject}
          </Link>
        </div>
      </div>

      <motion.div 
        className="flex flex-col gap-6"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
      >
        {projects.length === 0 && !isLoading && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center opacity-50">
            <Building2 className="w-12 h-12 mb-4 text-neutral-400" />
            <p className="text-neutral-500 font-medium">Нет проектов / No projects</p>
          </div>
        )}
        {projects.map((project) => {
          const pendingMe = project.members?.find(
            (member) => member.user_id === currentUserId && member.status === "pending"
          );
          const isOwner = currentUserId === project.owner_id;
          
          if (pendingMe && !isOwner) {
            return (
              <div key={project.id} className="grid grid-cols-1 lg:grid-cols-3 gap-4 opacity-70">
                <div className="lg:col-span-2 group flex flex-col justify-center bg-white dark:bg-[#000000] border border-amber-200 dark:border-amber-500/30 rounded-lg overflow-hidden p-6 shadow-sm relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center shrink-0">
                      <Loader2 className="w-5 h-5 text-amber-600 dark:text-amber-500 animate-spin" />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-1">
                        {project.name}
                      </h3>
                      <p className="text-[12px] text-amber-600 dark:text-amber-500 font-medium mt-1">
                        {t.myPendingRequests} — {t.awaitingApproval}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          const missionValue = getDetailValue(project.details, ["миссию", "mission", "description"]);
          const salesProcessValue = getDetailValue(project.details, [
            "процесс продаж",
            "sales process",
            "sales-process",
          ]);

          const mission =
            typeof missionValue === "string" && missionValue.trim().length > 0
              ? missionValue
              : c.notProvided;
          const salesProcess =
            typeof salesProcessValue === "string" && salesProcessValue.trim().length > 0
              ? salesProcessValue
              : c.notProvided;

          const detailNameTokens = project.details.map((detail) =>
            detail.name.toLowerCase()
          );
          const hasStage = (keywords: string[]) =>
            detailNameTokens.some((token) =>
              keywords.some((keyword) => token.includes(keyword))
            );

          const stageRows = [
            { label: t.stageProject, enabled: true },
            { label: t.stageScripts, enabled: (project.scripts_count ?? 0) > 0 },
            {
              label: t.stageAssistant,
              enabled: hasStage(["assistant", "message", "sms", "помощ"]),
            },
            { label: t.stageAgents, enabled: hasStage(["agent", "агент"]) },
            {
              label: t.stageVector,
              enabled: hasStage(["vector", "вектор", "knowledge base", "база знаний"]),
            },
          ];

          const pendingMembers = project.members?.filter(m => m.status === 'pending') || [];
          const approvedMembers = project.members?.filter(
            (member) => member.status === "approved" && member.user_id !== project.owner_id
          ) || [];

          // Only owner and admins get the management side panel
          const myMembership = project.members?.find(m => m.user_id === currentUserId && m.status === 'approved');
          const isAdmin = myMembership?.role === 'admin';
          const canManage = isOwner || isAdmin;

          return (
            <motion.div 
              key={project.id} 
              className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all dark:border-neutral-800 dark:bg-[#111]"
              variants={{
                hidden: { opacity: 0, y: 5 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } }
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50/50 p-5 px-6 dark:border-neutral-900 dark:bg-[#161616]">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-white">
                    {project.name}
                  </h3>
                </div>
                <Link
                  href={`/sales-agents/projects/${project.id}`}
                  className="group flex items-center justify-center rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-600 transition-all hover:border-cyan-500 hover:bg-cyan-50 hover:text-cyan-700 dark:border-neutral-700 dark:bg-[#0a0a0a] dark:text-neutral-400 dark:hover:border-cyan-800 dark:hover:bg-cyan-950/30 dark:hover:text-cyan-400"
                >
                  {language === "ru" ? "Открыть проект" : "Open Project"} &rarr;
                </Link>
              </div>

              {/* Body */}
              <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-neutral-100 dark:divide-neutral-900">
                {/* Column 1: Context */}
                <div className="flex-1 flex flex-col gap-6 p-6">
                  <div>
                    <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                      {t.missionLabel}
                    </p>
                    <p className="text-[13px] leading-relaxed text-neutral-800 dark:text-neutral-300">
                      {mission}
                    </p>
                  </div>
                  <div>
                    <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                      {t.salesProcessLabel}
                    </p>
                    <p className="text-[13px] leading-relaxed text-neutral-800 dark:text-neutral-300">
                      {salesProcess}
                    </p>
                  </div>
                </div>

                {/* Column 2: Stages */}
                <div className="flex-1 p-6">
                  <p className="mb-4 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                    {t.stagesLabel}
                  </p>
                  <div className="flex flex-col gap-2.5">
                    {stageRows.map((stage) => (
                      <div
                        key={stage.label}
                        className="flex items-center justify-between rounded-md bg-neutral-50 px-3 py-2 dark:bg-[#1a1a1a] border border-transparent dark:border-neutral-900"
                      >
                        <span className="font-mono text-[11px] text-neutral-600 dark:text-neutral-400">
                          {stage.label}
                        </span>
                        <span
                          className={cn(
                            "ml-2 inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wide uppercase",
                            stage.enabled
                              ? "text-emerald-600 dark:text-emerald-500"
                              : "text-neutral-400 dark:text-neutral-600"
                          )}
                        >
                          {stage.enabled ? (
                            <CheckCircle className="h-3 w-3 shrink-0" weight="bold" />
                          ) : (
                            <XCircle className="h-3 w-3 shrink-0" weight="bold" />
                          )}
                          {stage.enabled ? t.connected : t.notConnected}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 3: Access */}
                {canManage && (
                  <div className="flex w-full shrink-0 flex-col bg-neutral-50/30 p-6 lg:w-[380px] dark:bg-black/20">
                    <div className="mb-5 pb-5 border-b border-neutral-200 dark:border-neutral-800">
                      <h4 className="text-[14px] font-semibold text-neutral-900 dark:text-white mb-1">
                        {t.projectAccess}
                      </h4>
                      <p className="text-[12px] text-neutral-500 dark:text-neutral-400 mb-4">
                        {t.accessDesc}
                      </p>

                      <div>
                        <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                          {t.connectionKey}
                        </span>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 block rounded-lg border border-neutral-200 bg-white px-3 py-2 font-mono text-[12px] font-medium text-neutral-800 dark:border-neutral-700 dark:bg-[#0a0a0a] dark:text-neutral-200 truncate select-all">
                            {project.join_key ?? project.id}
                          </code>
                          <button
                            onClick={async (e) => {
                              e.preventDefault();
                              try {
                                await navigator.clipboard.writeText(project.join_key ?? project.id);
                                setCopiedProjectId(project.id);
                                window.setTimeout(() => {
                                  setCopiedProjectId((current) =>
                                    current === project.id ? null : current
                                  );
                                }, 2000);
                              } catch {
                                toast.error(language === "ru" ? "Не удалось скопировать ключ" : "Failed to copy key");
                              }
                            }}
                            className="shrink-0 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[12px] font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-[#111] dark:text-neutral-300 dark:hover:bg-[#1a1a1a]"
                          >
                            {copiedProjectId === project.id ? t.copied : t.copy}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Approvals Block - Button Only */}
                    {pendingMembers.length > 0 && (
                      <div className="mb-4">
                        <button
                          onClick={() => setReviewingProjectId(project.id)}
                          className="w-full flex items-center justify-between px-4 py-3 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30 rounded-lg transition-colors group/btn"
                        >
                          <span className="flex items-center gap-2.5 text-[13px] font-medium text-amber-900 dark:text-amber-100">
                            <UserCheck className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                            {t.reviewRequests}
                          </span>
                          <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-amber-500 text-white text-[10px] font-bold shadow-sm">
                            {pendingMembers.length}
                          </span>
                        </button>
                      </div>
                    )}

                    <div className="mt-auto">
                      <span className="text-[11px] text-neutral-500 uppercase tracking-widest font-semibold mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          {t.activeMembers}
                          <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500 px-1.5 py-0.5 rounded text-[10px]">
                            {1 + approvedMembers.length}
                          </span>
                        </span>
                        {isOwner && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setManagingProjectId(project.id);
                            }}
                            className="flex items-center gap-1 text-[10px] text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                          >
                            <Settings className="w-3.5 h-3.5" />
                            {t.manageMemb}
                          </button>
                        )}
                      </span>
                      
                      <div className="pt-2 pl-2">
                        <AvatarCircles
                          numPeople={0}
                          members={[
                            {
                              name: t.projectOwner,
                              url: "",
                              initials: t.owner.substring(0, 2).toUpperCase(),
                              role: t.owner
                            },
                            ...approvedMembers.map((member) => {
                              const profile = normalizeProfile(member.profiles);
                              const name = member.user_name || profile?.full_name || "Unknown User";
                              const initials = name.substring(0, 2).toUpperCase();
                              return {
                                name: name,
                                url: profile?.avatar_url || "",
                                initials: initials,
                                role: member.role === 'admin' ? t.adminRole : member.role === 'sales_manager' ? t.salesManager : member.role
                              }
                            })
                          ]}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <AnimatePresence>
        {managingProjectId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setManagingProjectId(null)}
              className="absolute inset-0 bg-neutral-900/40 dark:bg-black/60"
            />
             <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="relative w-full max-w-md overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-[#111] flex flex-col max-h-[80vh]"
             >
               <div className="relative p-5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#161616] flex items-center justify-between shrink-0">
                 <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                   {t.manageMembersTitle}
                 </h2>
                 <button
                   onClick={() => setManagingProjectId(null)}
                   className="rounded-md p-1.5 text-neutral-500 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                 >
                   <X className="w-4 h-4" />
                 </button>
               </div>
               
               <div className="relative p-5 overflow-y-auto flex-1">
                 {managedMembers.length === 0 ? (
                   <div className="text-center text-neutral-500 py-8 text-sm">
                     {t.activeMembers}: 0
                   </div>
                 ) : (
                   <div className="flex flex-col gap-3">
                     {managedMembers.map((member) => {
                       const profile = normalizeProfile(member.profiles);
                       const name = member.user_name || profile?.full_name || "Unknown User";
                       const email = member.user_email || "";
                       const initials = name.substring(0, 2).toUpperCase();

                       return (
                         <div key={member.id} className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-[#0a0a0a]">
                           <div className="flex items-center gap-2.5">
                             {profile?.avatar_url ? (
                               <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                             ) : (
                               <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-[10px] font-bold text-neutral-600 dark:text-neutral-400 shrink-0 border border-neutral-200 dark:border-neutral-800">
                                 {initials}
                               </div>
                             )}
                             <div className="flex flex-col min-w-0 flex-1">
                               <span className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100 truncate">{name}</span>
                               {email && <span className="text-[11px] text-neutral-500 truncate">{email}</span>}
                             </div>
                           </div>
                           
                           <div className="flex items-center gap-2 pl-[42px]">
                             <DropdownMenu>
                               <DropdownMenuTrigger className="flex-1 inline-flex items-center justify-between rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-[11px] font-medium text-neutral-800 outline-none transition-colors hover:border-neutral-300 dark:border-neutral-700 dark:bg-[#111] dark:text-neutral-200 dark:hover:border-neutral-600">
                                 <span className="truncate">{getRoleLabel(member.role)}</span>
                                 <CaretDown className="h-3 w-3 shrink-0 opacity-70" />
                               </DropdownMenuTrigger>
                               <DropdownMenuContent
                                 align="start"
                                 sideOffset={6}
                                 className="w-[220px] rounded-lg border border-neutral-200 bg-white p-1 shadow-xl dark:border-neutral-800 dark:bg-[#161616]"
                               >
                                 {roleOptions.map((roleOption) => {
                                   const isActive = member.role === roleOption.value;
                                   return (
                                     <DropdownMenuItem
                                       key={roleOption.value}
                                       onClick={() => handleUpdateRole(member.id, roleOption.value)}
                                       className={cn(
                                         "cursor-pointer rounded-md px-2.5 py-2 text-[12px] font-medium transition-colors",
                                         "focus:bg-neutral-100 dark:focus:bg-neutral-800",
                                         isActive
                                           ? "text-neutral-900 font-semibold dark:text-white"
                                           : "text-neutral-600 dark:text-neutral-400"
                                       )}
                                     >
                                       <span className="flex w-full items-center justify-between gap-2">
                                         <span>{roleOption.label}</span>
                                         {isActive && <Check className="h-3.5 w-3.5 shrink-0" />}
                                       </span>
                                     </DropdownMenuItem>
                                   );
                                 })}
                               </DropdownMenuContent>
                             </DropdownMenu>
                             <button
                               onClick={() => handleRemoveMember(member.id)}
                               className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-colors shrink-0 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50"
                               title={t.removeMember}
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                           </div>
                         </div>
                       );
                     })}
                   </div>
                 )}
               </div>
               
               <div className="relative p-5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#161616] shrink-0 flex justify-end">
                 <button
                   onClick={() => setManagingProjectId(null)}
                   className="px-4 py-2 rounded-lg text-[12px] font-semibold border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 transition-colors dark:border-neutral-700 dark:bg-[#0a0a0a] dark:text-neutral-200 dark:hover:bg-[#111]"
                 >
                   {c.close}
                 </button>
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {reviewingProjectId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReviewingProjectId(null)}
              className="absolute inset-0 bg-neutral-900/40 dark:bg-black/60"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#111] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#161616]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-500/30">
                    <UserCheck className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-100">
                      {t.reviewRequests}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setReviewingProjectId(null)}
                  className="p-2 bg-transparent text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 max-h-[50vh] overflow-y-auto custom-scrollbar">
                {(() => {
                  if (!reviewingProject) return null;
                  
                  if (pendingReviewMembers.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-10 opacity-60">
                         <UserCheck className="w-10 h-10 text-neutral-400 mb-3" />
                         <p className="text-sm font-medium text-neutral-500 text-center">No pending requests</p>
                      </div>
                    );
                  }

                  return (
                    <div className="flex flex-col gap-3">
                      {pendingReviewMembers.map((member) => {
                        const profile = normalizeProfile(member.profiles);
                        const name = member.user_name || profile?.full_name || "Unknown User";
                        const email = member.user_email || "";
                        const initials = name.substring(0, 2).toUpperCase();

                        return (
                          <div key={member.id} className="flex items-center justify-between p-3 bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 rounded-lg hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
                            <div className="flex items-center gap-3 w-full min-w-0 pr-3">
                              {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover shrink-0 border border-neutral-200 dark:border-neutral-800" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-[10px] font-bold text-neutral-600 dark:text-neutral-400 shrink-0 border border-neutral-200 dark:border-neutral-800">
                                  {initials}
                                </div>
                              )}
                              <div className="flex flex-col min-w-0">
                                <span className="text-[13px] font-semibold truncate text-neutral-900 dark:text-neutral-100">
                                  {name}
                                </span>
                                {email && <span className="text-[11px] text-neutral-500 truncate">{email}</span>}
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-2 shrink-0 w-[140px]">
                              <DropdownMenu>
                                <DropdownMenuTrigger className="w-full inline-flex items-center justify-between rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1.5 text-[11px] font-medium text-neutral-800 outline-none transition-colors hover:border-neutral-300 dark:border-neutral-700 dark:bg-[#111] dark:text-neutral-200 dark:hover:border-neutral-600">
                                  <span className="truncate">
                                    {getRoleLabel((selectedRoles[member.id] || "sales_manager") as MemberRole)}
                                  </span>
                                  <CaretDown className="h-3 w-3 shrink-0 opacity-70" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  sideOffset={6}
                                  className="w-[160px] rounded-lg border border-neutral-200 bg-white p-1 shadow-xl dark:border-neutral-800 dark:bg-[#161616]"
                                >
                                  {roleOptions.map((roleOption) => {
                                    const currentRole = (selectedRoles[member.id] || "sales_manager") as MemberRole;
                                    const isActive = currentRole === roleOption.value;

                                    return (
                                      <DropdownMenuItem
                                        key={roleOption.value}
                                        onClick={() =>
                                          setSelectedRoles((prev) => ({
                                            ...prev,
                                            [member.id]: roleOption.value,
                                          }))
                                        }
                                        className={cn(
                                          "cursor-pointer rounded-md px-2 py-1.5 text-[11px] font-medium",
                                          isActive
                                            ? "text-neutral-900 font-semibold dark:text-white"
                                            : "text-neutral-600 dark:text-neutral-400"
                                        )}
                                      >
                                        <span className="flex w-full items-center justify-between gap-2">
                                          <span>{roleOption.label}</span>
                                          {isActive && <Check className="h-3 w-3 shrink-0" />}
                                        </span>
                                      </DropdownMenuItem>
                                    );
                                  })}
                                </DropdownMenuContent>
                              </DropdownMenu>
                              
                              <div className="flex items-center gap-1.5 w-full">
                                <button
                                  onClick={() => {
                                    handleApprove(member.id);
                                    if (pendingReviewMembers.length === 1) setReviewingProjectId(null); // Close if last one
                                  }}
                                  className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-800/50 rounded shadow-sm transition-colors"
                                  title={t.approve}
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    handleReject(member.id);
                                    if (pendingReviewMembers.length === 1) setReviewingProjectId(null); // Close if last one
                                  }}
                                  className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-500 border border-rose-200 dark:border-rose-800/50 rounded shadow-sm transition-colors"
                                  title={t.reject}
                                >
                                  <UserX className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
    </>
  );
}
