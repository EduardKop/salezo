"use client";

import * as React from "react";
import { Plus, Building2, Briefcase, Loader2, UserCheck, UserX, Settings, X, Trash2, Link2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase";
import { useLanguage } from "@/hooks/useLanguage";
import { AvatarCircles } from "@/components/ui/avatar-circles";
import { toast } from "sonner";
import {
  isProductInfoList,
  isStringList,
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

  const getProductsSummary = (products: { name: string; price: string }[]): string => {
    return products.length.toString();
  };

  const getCountriesSummary = (countries: string[]): string => {
    if (countries.length === 0) return t?.global || "Global";
    if (countries.length <= 2) return countries.join(", ");
    return `${countries[0]}, ${countries[1]} +${countries.length - 2}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'ru' ? "ru-RU" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  if (!mounted) return null;

  if (isLoading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (dbError) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center text-center p-8 text-rose-500">
        <h2 className="text-lg font-bold mb-2">Supabase Query Error</h2>
        <code className="text-sm bg-rose-50 dark:bg-rose-900/20 px-4 py-2 rounded-md">{dbError}</code>
      </div>
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

  if (projects.length === 0) {
    return (
      <>
        <div className="p-8 max-w-5xl mx-auto w-full h-full flex flex-col pt-24 text-center items-center justify-center min-h-[60vh] animate-in fade-in duration-500 relative z-10">
        <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-black/10 dark:border-white/10 shadow-sm">
          <Plus className="w-8 h-8 text-neutral-400" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight mb-2">{t.pageTitle}</h1>
        <p className="text-neutral-500 max-w-md mx-auto mb-8">
          {t.emptyDesc}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            {t.createProjectBtn}
          </Link>
          <Link
            href="/dashboard/projects/connect"
            className="inline-flex items-center justify-center gap-2 bg-white dark:bg-[#000000] text-neutral-900 dark:text-neutral-100 px-6 py-2.5 rounded-full text-sm font-medium transition-colors border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-neutral-500"
          >
            <Link2 className="w-4 h-4" />
            {t.connectProject}
          </Link>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <div className="p-8 max-w-[1200px] mx-auto w-full pt-20 relative z-0">
        <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 mb-1">
            {t.pageTitle}
          </h1>
          <p className="text-neutral-500 max-w-2xl text-sm">
            {t.pageDesc}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/dashboard/projects/connect"
            className="inline-flex items-center justify-center gap-2 bg-white dark:bg-[#000000] text-neutral-900 dark:text-neutral-100 hover:border-black dark:hover:border-neutral-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-neutral-200 dark:border-neutral-800 shadow-sm shrink-0"
          >
            <Link2 className="w-4 h-4" />
            {t.connectProject}
          </Link>
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-transparent shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            {t.newProject}
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-8">
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

          const productsValue = getDetailValue(project.details, ["товары", "products"]);
          const priceValue = getDetailValue(project.details, ["диапазон", "price"]);
          const descValue = getDetailValue(project.details, ["миссию", "description"]);
          const countriesValue = getDetailValue(project.details, ["страны", "countries"]);
          const problemsValue = getDetailValue(project.details, ["проблемы", "problems"]);

          const products = isProductInfoList(productsValue) ? productsValue : [];
          const price = typeof priceValue === "string" ? priceValue : undefined;
          const desc = typeof descValue === "string" ? descValue : undefined;
          const countries = isStringList(countriesValue)
            ? countriesValue
            : typeof countriesValue === "string"
              ? countriesValue.split(",").map((country) => country.trim()).filter(Boolean)
              : [];
          const problems = typeof problemsValue === "string" ? problemsValue : undefined;

          const hasProducts = products.length > 0;

          const pendingMembers = project.members?.filter(m => m.status === 'pending') || [];
          const approvedMembers = project.members?.filter(
            (member) => member.status === "approved" && member.user_id !== project.owner_id
          ) || [];

          // Only owner and admins get the management side panel
          const myMembership = project.members?.find(m => m.user_id === currentUserId && m.status === 'approved');
          const isAdmin = myMembership?.role === 'admin';
          const canManage = isOwner || isAdmin;

          return (
            <div key={project.id} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Main Project Card (Clicks through to dashboard) */}
              <Link
                href={`/dashboard/projects/${project.id}`}
                className={`${canManage ? 'lg:col-span-2' : 'lg:col-span-3'} group flex flex-col justify-between h-full bg-white dark:bg-[#000000] border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden transition-colors hover:border-black dark:hover:border-neutral-500`}
              >
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                      </div>
                      <div>
                        <h3 className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-100 group-hover:underline underline-offset-4 decoration-neutral-300 dark:decoration-neutral-700 line-clamp-1">
                          {project.name}
                        </h3>
                        <p className="text-[12px] text-neutral-500 font-mono mt-0.5">
                          ID: {project.id.split('-')[0]}...
                        </p>
                      </div>
                    </div>
                  </div>

                  {desc ? (
                    <p className="text-[13px] text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed mb-4">
                      {desc}
                    </p>
                  ) : (
                    <p className="text-[13px] text-neutral-400 dark:text-neutral-600 line-clamp-2 leading-relaxed mb-4 italic">
                      {t.noDesc}
                    </p>
                  )}

                  {/* Data Grid row */}
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-2">
                    <div className="flex flex-col">
                      <span className="text-[11px] text-neutral-500 uppercase tracking-widest font-semibold mb-1">{t.priceRange}</span>
                      <span className="text-[13px] text-neutral-900 dark:text-neutral-100 font-medium truncate">
                        {price && price !== "N/A" ? price : "—"}
                      </span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-[11px] text-neutral-500 uppercase tracking-widest font-semibold mb-1">{t.markets}</span>
                      <span className="text-[13px] text-neutral-900 dark:text-neutral-100 font-medium truncate">
                        {countries.length > 0 ? getCountriesSummary(countries) : t.global}
                      </span>
                    </div>
                    
                    {problems && (
                      <div className="flex flex-col col-span-2">
                        <span className="text-[11px] text-neutral-500 uppercase tracking-widest font-semibold mb-1 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> {t.focusArea}</span>
                        <span className="text-[13px] text-neutral-900 dark:text-neutral-100 line-clamp-1">
                          {problems}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Vercel-style footer */}
                <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-200 dark:bg-neutral-900/50 dark:border-neutral-800 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1.5 text-[12px] text-neutral-500">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span>{t.created} {formatDate(project.created_at)}</span>
                  </div>
                  
                  {hasProducts && (
                    <div className="flex items-center gap-1.5 text-[12px] text-neutral-500">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>{getProductsSummary(products)} {t.items}</span>
                    </div>
                  )}
                </div>
              </Link>

              {/* Project Access Panel — only owner / admin */}
              {canManage && (
              <div className="bg-white dark:bg-[#000000] border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 flex flex-col h-full shadow-sm relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/5 blur-3xl rounded-full pointer-events-none" />

                {canManage && (
                  <div className="mb-6 pb-6 border-b border-neutral-200 dark:border-neutral-800">
                    <h4 className="text-[14px] font-semibold text-neutral-900 dark:text-neutral-100 mb-1 flex items-center gap-2">
                      {t.projectAccess}
                    </h4>
                    <p className="text-[12px] text-neutral-500 mb-4 leading-relaxed">
                      {t.accessDesc}
                    </p>

                    <div>
                      <span className="text-[11px] text-neutral-500 uppercase tracking-widest font-semibold mb-1.5 block">
                        {t.connectionKey}
                      </span>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 block px-3 py-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md text-[13px] font-mono font-semibold tracking-widest text-neutral-800 dark:text-neutral-200 truncate select-all">
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
                          className="px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-neutral-500 rounded-md text-[12px] font-medium transition-colors text-neutral-700 dark:text-neutral-300 shrink-0"
                        >
                          {copiedProjectId === project.id ? t.copied : t.copy}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Approvals Block - Button Only */}
                {canManage && pendingMembers.length > 0 && (
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
          );
        })}
      </div>

      <AnimatePresence>
        {managingProjectId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
             <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]"
             >
               <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0">
                 <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                   {t.manageMembersTitle}
                 </h2>
                 <button onClick={() => setManagingProjectId(null)} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 p-1">
                   <X className="w-5 h-5" />
                 </button>
               </div>
               
               <div className="p-4 overflow-y-auto flex-1">
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
                         <div key={member.id} className="flex flex-col gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/50 rounded-lg">
                           <div className="flex items-center gap-2.5">
                             {profile?.avatar_url ? (
                               <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                             ) : (
                               <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-[10px] font-bold text-neutral-600 dark:text-neutral-300 shrink-0">
                                 {initials}
                               </div>
                             )}
                             <div className="flex flex-col min-w-0 flex-1">
                               <span className="text-[14px] font-medium text-neutral-900 dark:text-neutral-100 truncate">{name}</span>
                               {email && <span className="text-[11px] text-neutral-500 truncate">{email}</span>}
                             </div>
                           </div>
                           
                           <div className="flex items-center gap-2 pl-[42px]">
                             <select
                               value={member.role}
                               onChange={(e) => handleUpdateRole(member.id, e.target.value as MemberRole)}
                                className="text-[12px] flex-1 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 rounded px-2 py-1.5 outline-none focus:border-amber-500 transition-colors"
                              >
                                <option value="sales_manager">{t.salesManager}</option>
                                <option value="admin">{t.adminRole}</option>
                             </select>
                             <button
                               onClick={() => handleRemoveMember(member.id)}
                               className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded transition-colors shrink-0"
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
               
               <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 shrink-0 flex justify-end">
                 <button
                   onClick={() => setManagingProjectId(null)}
                   className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
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
              className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm dark:bg-black/60"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#000000] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/20">
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
                          <div key={member.id} className="flex items-center justify-between p-3 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
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
                              <select
                                value={selectedRoles[member.id] || 'sales_manager'}
                                onChange={(e) => setSelectedRoles(prev => ({...prev, [member.id]: e.target.value as MemberRole}))}
                                className="w-full text-[11px] font-medium bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 rounded px-2 py-1.5 focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 cursor-pointer text-center"
                              >
                                <option value="sales_manager">{t.salesManager}</option>
                                <option value="admin">{t.adminRole}</option>
                              </select>
                              
                              <div className="flex items-center gap-1.5 w-full">
                                <button
                                  onClick={() => {
                                    handleApprove(member.id);
                                    if (pendingReviewMembers.length === 1) setReviewingProjectId(null); // Close if last one
                                  }}
                                  className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-500/30 rounded shadow-sm transition-colors"
                                  title={t.approve}
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    handleReject(member.id);
                                    if (pendingReviewMembers.length === 1) setReviewingProjectId(null); // Close if last one
                                  }}
                                  className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-500 border border-rose-200 dark:border-rose-500/30 rounded shadow-sm transition-colors"
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
