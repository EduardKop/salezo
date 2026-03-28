"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Robot as Bot,
  CheckCircle as CheckCircle2,
  CircleDashed,
  Database,
  FolderPlus,
  Lock,
  LockKey as LockKeyhole,
  Scroll as ScrollText,
  UsersThree as UsersRound,
  Wrench,
} from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { PageLoader } from "@/components/ui/page-loader";
import { cn } from "@/lib/utils";
import { useLanguage, type Language } from "@/hooks/useLanguage";
import { dashboardHome as translations, t as getT } from "@/lib/i18n/translations";

type DbProject = {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  details: unknown;
};

type DbProjectMember = {
  project_id: string;
  user_id: string;
  status: string | null;
};

type StepKey =
  | "project"
  | "scripts"
  | "sms_assist"
  | "script_agents"
  | "vector_db";

type StepDefinition = {
  key: StepKey;
  title: string;
  description: string;
  hint: string;
  actionLabel: string;
  actionHref: string;
  icon: React.ComponentType<{ className?: string }>;
};

type StepState = StepDefinition & {
  isUnlocked: boolean;
  isComplete: boolean;
};

type ErrorKey = "loadFailed" | "noAccess" | null;

type JourneyNodeProps = {
  step: StepState;
  stepNumber: number;
  lockedHint: string;
  completeLabel: string;
  inProgressLabel: string;
  lockedLabel: string;
  className?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

type ProjectDetail = {
  name: string;
  information: unknown;
};

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function normalizeDetails(value: unknown): ProjectDetail[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is Record<string, unknown> => isRecord(item))
    .map((item) => ({
      name: typeof item.name === "string" ? item.name : "",
      information: item.information,
    }))
    .filter((item) => item.name.length > 0);
}

function collectDetailNameTokens(projects: DbProject[]): string[] {
  return projects.flatMap((project) =>
    normalizeDetails(project.details).map((detail) => normalizeText(detail.name))
  );
}

function hasAnyKeyword(tokens: string[], keywords: readonly string[]): boolean {
  return tokens.some((token) => keywords.some((keyword) => token.includes(keyword)));
}

function buildRawCompletion(projects: DbProject[], scriptCountByProject: Record<string, number>): Record<StepKey, boolean> {
  const tokens = collectDetailNameTokens(projects);

  return {
    project: projects.length > 0,
    scripts: projects.some(p => (scriptCountByProject[p.id] ?? 0) > 0) || hasAnyKeyword(tokens, [
      "script",
      "scripts",
      "скрипт",
      "скрипты",
      "playbook",
    ]),
    sms_assist: hasAnyKeyword(tokens, [
      "assistant",
      "message assistant",
      "sms assistant",
      "смс помощ",
      "помощник",
    ]),
    script_agents: hasAnyKeyword(tokens, [
      "script agent",
      "sales agent",
      "ai agent",
      "агент",
    ]),
    vector_db: hasAnyKeyword(tokens, [
      "vector",
      "vector database",
      "knowledge base",
      "вектор",
      "база знаний",
    ]),
  };
}

function buildStepStates(
  definitions: StepDefinition[],
  rawCompletion: Record<StepKey, boolean>
): StepState[] {
  const result: StepState[] = [];

  for (let index = 0; index < definitions.length; index += 1) {
    const definition = definitions[index];
    const previous = result[index - 1];
    const isUnlocked = index === 0 || (previous ? previous.isComplete : false);
    const isComplete = isUnlocked && rawCompletion[definition.key];

    result.push({
      ...definition,
      isUnlocked,
      isComplete,
    });
  }

  return result;
}

function buildMemberCountByProject(
  projects: DbProject[],
  members: DbProjectMember[]
): Record<string, number> {
  const usersByProject = new Map<string, Set<string>>();

  for (const project of projects) {
    usersByProject.set(project.id, new Set([project.owner_id]));
  }

  for (const member of members) {
    if (member.status === "rejected") {
      continue;
    }

    const users = usersByProject.get(member.project_id);
    if (users) {
      users.add(member.user_id);
    }
  }

  return Object.fromEntries(
    Array.from(usersByProject.entries()).map(([projectId, users]) => [
      projectId,
      users.size,
    ])
  );
}

const JourneyNode = React.forwardRef<HTMLDivElement, JourneyNodeProps>(
  (
    {
      step,
      stepNumber,
      lockedHint,
      completeLabel,
      inProgressLabel,
      lockedLabel,
      className,
    },
    ref
  ) => {
    const Icon = step.icon;
    const statusLabel = step.isComplete
      ? completeLabel
      : step.isUnlocked
        ? inProgressLabel
        : lockedLabel;
    const helperText = step.isUnlocked ? step.hint : lockedHint;

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border bg-white/85 px-4 py-3 shadow-[0_1px_0_0_rgba(15,23,42,0.04)] transition-colors dark:bg-black/35",
          step.isComplete
            ? "border-emerald-500/30"
            : step.isUnlocked
              ? "border-sky-500/30"
              : "border-black/12 dark:border-white/10",
          className
        )}
      >
        <div className="grid gap-2.5 md:grid-cols-[auto_1fr_auto] md:items-start">
          <div
            className={cn(
              "mt-0.5 inline-flex h-7 min-w-7 items-center justify-center rounded-md border px-1.5 text-[11px] font-semibold tracking-[0.08em]",
              step.isComplete
                ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : step.isUnlocked
                  ? "border-sky-500/35 bg-sky-500/10 text-sky-700 dark:text-sky-300"
                  : "border-black/15 bg-black/[0.04] text-neutral-600 dark:border-white/15 dark:bg-white/[0.03] dark:text-neutral-300"
            )}
          >
            {stepNumber}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  step.isComplete
                    ? "text-emerald-500 dark:text-emerald-300"
                    : step.isUnlocked
                      ? "text-sky-500 dark:text-sky-300"
                      : "text-neutral-500 dark:text-neutral-400"
                )}
              />
              <h3 className="flex items-center gap-1.5 truncate text-[14px] font-semibold leading-6 text-black dark:text-white">
                <span className="truncate">{step.title}</span>
                {step.isComplete && (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 dark:text-emerald-300" />
                )}
              </h3>
              <div
                className={cn(
                  "inline-flex w-max items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]",
                  step.isComplete
                    ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : step.isUnlocked
                      ? "border-sky-500/35 bg-sky-500/10 text-sky-700 dark:text-sky-300"
                      : "border-black/15 bg-black/[0.04] text-neutral-600 dark:border-white/15 dark:bg-white/[0.03] dark:text-neutral-300"
                )}
              >
                {step.isComplete ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                ) : step.isUnlocked ? (
                  <CircleDashed className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <Lock className="h-3.5 w-3.5 shrink-0" />
                )}
                {statusLabel}
              </div>
            </div>

            <p className="mt-1 text-[12px] leading-5 text-black/70 dark:text-white/70">
              {step.description}
            </p>
          </div>

          {!step.isComplete && (
            <div className="w-full md:w-auto">
              {step.isUnlocked ? (
                <Link
                  href={step.actionHref}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-sky-500/35 bg-sky-500/10 px-2.5 py-1.5 text-[12px] font-semibold text-sky-700 transition-colors hover:bg-sky-500/20 dark:text-sky-200 md:w-auto"
                >
                  {step.actionLabel}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-black/12 bg-black/[0.04] px-2.5 py-1.5 text-[12px] font-semibold text-neutral-600 dark:border-white/12 dark:bg-white/[0.03] dark:text-neutral-400 md:w-auto">
                  {step.actionLabel}
                  <Lock className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
          )}
        </div>

        <div className="mt-2 border-t border-black/10 pt-2 dark:border-white/10">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-black/50 dark:text-white/50">
            {helperText}
          </p>
        </div>
      </div>
    );
  }
);

JourneyNode.displayName = "JourneyNode";

type TaskadeBeamNodeProps = {
  step: StepState;
  stepNumber: number;
  x: number;
  y: number;
  accentColor: string;
  completeLabel: string;
  inProgressLabel: string;
  lockedLabel: string;
  className?: string;
};

const TaskadeBeamNode = React.forwardRef<HTMLDivElement, TaskadeBeamNodeProps>(
  (
    {
      step,
      stepNumber,
      x,
      y,
      accentColor,
      completeLabel,
      inProgressLabel,
      lockedLabel,
      className,
    },
    ref
  ) => {
    const Icon = step.icon;
    const statusLabel = step.isComplete
      ? completeLabel
      : step.isUnlocked
        ? inProgressLabel
        : lockedLabel;
    const helperText = step.hint;
    const helperOnTop = stepNumber <= 3;
    const showHelper = step.isUnlocked && !step.isComplete;

    return (
      <div
        className={cn("absolute z-20 w-[320px] -translate-x-1/2 -translate-y-1/2", className)}
        style={{ left: `${x}%`, top: `${y}%` }}
      >
        {showHelper && helperOnTop && (
          <p className="pointer-events-none absolute -top-12 left-0 w-full text-left font-mono text-[10.5px] leading-5 tracking-[0.06em] text-black/52 dark:text-white/46">
            {helperText}
          </p>
        )}

        <div
          ref={ref}
          className={cn(
            "relative overflow-hidden rounded-[24px] border bg-white/78 px-4 py-4 shadow-[0_16px_44px_-36px_rgba(2,6,23,0.8)] backdrop-blur-sm dark:bg-black/55",
            step.isComplete
              ? "border-emerald-500/45 dark:border-emerald-400/45"
              : "border-black/12 dark:border-white/10"
          )}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `linear-gradient(115deg, ${accentColor}26 0%, rgba(15, 23, 42, 0) 65%)`,
            }}
          />
          <span
            className="pointer-events-none absolute bottom-5 left-0 top-5 w-[3px] rounded-r-full"
            style={{ backgroundColor: accentColor }}
          />

          <div className="relative">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="flex items-center gap-1.5 whitespace-normal break-words text-[16px] font-semibold leading-[1.2] text-black dark:text-white">
                  <span>{step.title}</span>
                  {step.isComplete && (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 dark:text-emerald-300" />
                  )}
                </h3>
              </div>

              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold",
                  step.isComplete
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : step.isUnlocked
                      ? "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300"
                      : "border-black/15 bg-black/[0.05] text-neutral-600 dark:border-white/15 dark:bg-white/[0.04] dark:text-neutral-400"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {statusLabel}
              </span>
            </div>

            <p className="mt-2 text-[13px] leading-6 text-black/68 dark:text-white/64">{step.description}</p>

            {!step.isComplete && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {step.isUnlocked ? (
                  <Link
                    href={step.actionHref}
                    className="inline-flex items-center gap-1 rounded-full border border-blue-500/35 bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold text-blue-700 transition-colors hover:bg-blue-500/20 dark:text-blue-300"
                  >
                    {step.actionLabel}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-black/15 bg-black/[0.05] px-2.5 py-1 text-[11px] font-semibold text-neutral-600 dark:border-white/15 dark:bg-white/[0.04] dark:text-neutral-400">
                    {step.actionLabel}
                    <Lock className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {showHelper && !helperOnTop && (
          <p className="pointer-events-none absolute left-0 top-[calc(100%+0.5rem)] w-full text-left font-mono text-[10.5px] leading-5 tracking-[0.06em] text-black/52 dark:text-white/46">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

TaskadeBeamNode.displayName = "TaskadeBeamNode";

export default function DashboardPage() {
  const { language, mounted } = useLanguage();
  const activeLanguage = (mounted ? language : "ru") as Language;
  const t = getT(translations, activeLanguage);

  const [loading, setLoading] = React.useState(true);
  const [errorKey, setErrorKey] = React.useState<ErrorKey>(null);
  const [projects, setProjects] = React.useState<DbProject[]>([]);
  const [members, setMembers] = React.useState<DbProjectMember[]>([]);
  const [scriptCounts, setScriptCounts] = React.useState<Record<string, number>>({});

  const loadDashboardState = React.useCallback(async () => {
    setLoading(true);
    setErrorKey(null);

    try {
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!userData.user) {
        setProjects([]);
        setMembers([]);
        setErrorKey("noAccess");
        setLoading(false);
        return;
      }

      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("id,name,owner_id,created_at,details")
        .order("created_at", { ascending: false });

      if (projectsError) {
        throw projectsError;
      }

      const userProjects = (projectsData ?? []) as DbProject[];
      setProjects(userProjects);

      const projectIds = userProjects.map((project) => project.id);
      if (projectIds.length === 0) {
        setMembers([]);
        setLoading(false);
        return;
      }

      const { data: membersData, error: membersError } = await supabase
        .from("project_members")
        .select("project_id,user_id,status")
        .in("project_id", projectIds);

      if (membersError) {
        throw membersError;
      }

      setMembers((membersData ?? []) as DbProjectMember[]);

      // Also fetch script counts
      const { data: scriptsData } = await supabase
        .from("scripts")
        .select("project_id");
      
      const counts: Record<string, number> = {};
      for (const s of (scriptsData || [])) {
        if (s.project_id) {
          counts[s.project_id] = (counts[s.project_id] || 0) + 1;
        }
      }
      setScriptCounts(counts);

      setLoading(false);
    } catch (error) {
      console.error("Dashboard state load failed:", error);
      setErrorKey("loadFailed");
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!mounted) {
      return;
    }

    loadDashboardState();

    const supabase = createClient();
    const channel = supabase
      .channel("dashboard-home-state")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects" },
        () => {
          loadDashboardState();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "project_members" },
        () => {
          loadDashboardState();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadDashboardState, mounted]);

  const firstProjectId = projects[0]?.id;
  const stepDefinitions = React.useMemo<StepDefinition[]>(
    () => [
      {
        key: "project",
        title: t.stepProjectTitle,
        description: t.stepProjectDescription,
        hint: t.stepProjectHint,
        actionLabel: t.stepProjectAction,
        actionHref: "/sales-agents/projects/new",
        icon: FolderPlus,
      },
      {
        key: "scripts",
        title: t.stepScriptsTitle,
        description: t.stepScriptsDescription,
        hint: t.stepScriptsHint,
        actionLabel: t.stepScriptsAction,
        actionHref: firstProjectId
          ? `/sales-agents/projects/${firstProjectId}/scripts`
          : "/sales-agents/projects/new",
        icon: ScrollText,
      },
      {
        key: "sms_assist",
        title: t.stepSmsAssistTitle,
        description: t.stepSmsAssistDescription,
        hint: t.stepSmsAssistHint,
        actionLabel: t.stepSmsAssistAction,
        actionHref: firstProjectId
          ? `/sales-agents/projects/${firstProjectId}`
          : "/sales-agents/projects/new",
        icon: Bot,
      },
      {
        key: "script_agents",
        title: t.stepScriptAgentsTitle,
        description: t.stepScriptAgentsDescription,
        hint: t.stepScriptAgentsHint,
        actionLabel: t.stepScriptAgentsAction,
        actionHref: firstProjectId
          ? `/sales-agents/projects/${firstProjectId}`
          : "/sales-agents/projects/new",
        icon: Wrench,
      },
      {
        key: "vector_db",
        title: t.stepVectorTitle,
        description: t.stepVectorDescription,
        hint: t.stepVectorHint,
        actionLabel: t.stepVectorAction,
        actionHref: firstProjectId
          ? `/sales-agents/projects/${firstProjectId}`
          : "/sales-agents/projects/new",
        icon: Database,
      },
    ],
    [firstProjectId, t]
  );

  const rawCompletion = React.useMemo(
    () => buildRawCompletion(projects, scriptCounts),
    [projects, scriptCounts]
  );

  const steps = React.useMemo(
    () => buildStepStates(stepDefinitions, rawCompletion),
    [rawCompletion, stepDefinitions]
  );

  const memberCountByProject = React.useMemo(
    () => buildMemberCountByProject(projects, members),
    [members, projects]
  );

  const completedSteps = React.useMemo(
    () => steps.filter((step) => step.isComplete).length,
    [steps]
  );

  const nextStep = React.useMemo(
    () => steps.find((step) => !step.isComplete) ?? null,
    [steps]
  );

  const allComplete = steps.length > 0 && steps.every((step) => step.isComplete);

  const desktopContainerRef = React.useRef<HTMLDivElement>(null);
  const stepOneRef = React.useRef<HTMLDivElement>(null);
  const stepTwoRef = React.useRef<HTMLDivElement>(null);
  const stepThreeRef = React.useRef<HTMLDivElement>(null);
  const stepFourRef = React.useRef<HTMLDivElement>(null);
  const stepFiveRef = React.useRef<HTMLDivElement>(null);

  const desktopStepRefs = [
    stepOneRef,
    stepTwoRef,
    stepThreeRef,
    stepFourRef,
    stepFiveRef,
  ] as const;

  const roadmapPositions = [
    { x: 18, y: 19 },
    { x: 50, y: 19 },
    { x: 82, y: 19 },
    { x: 74, y: 58 },
    { x: 36, y: 58 },
  ] as const;

  const roadmapAccentColors = [
    "#38bdf8",
    "#22c55e",
    "#a78bfa",
    "#f59e0b",
    "#ec4899",
  ] as const;

  const beamConnections = [
    {
      fromRef: stepOneRef,
      toRef: stepTwoRef,
      active: steps[0]?.isComplete ?? false,
      curvature: 0,
      startColor: "#38bdf8",
      stopColor: "#22d3ee",
      fromAnchor: "right" as const,
      toAnchor: "left" as const,
    },
    {
      fromRef: stepTwoRef,
      toRef: stepThreeRef,
      active: steps[1]?.isComplete ?? false,
      curvature: 0,
      startColor: "#22c55e",
      stopColor: "#14b8a6",
      fromAnchor: "right" as const,
      toAnchor: "left" as const,
    },
    {
      fromRef: stepThreeRef,
      toRef: stepFourRef,
      active: steps[2]?.isComplete ?? false,
      curvature: 0,
      startColor: "#a78bfa",
      stopColor: "#8b5cf6",
      fromAnchor: "bottom" as const,
      toAnchor: "top" as const,
    },
    {
      fromRef: stepFourRef,
      toRef: stepFiveRef,
      active: steps[3]?.isComplete ?? false,
      curvature: 0,
      startColor: "#f59e0b",
      stopColor: "#f97316",
      fromAnchor: "left" as const,
      toAnchor: "right" as const,
    },
  ] as const;

  if (!mounted || loading) {
    return <PageLoader className="min-h-[calc(100vh-5rem)]" />;
  }

  if (errorKey) {
    return (
      <div className="mx-auto w-full max-w-4xl p-4 md:p-8">
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
          <p className="text-sm font-medium text-red-300">
            {errorKey === "noAccess" ? t.noAccess : t.loadFailed}
          </p>
          {errorKey !== "noAccess" && (
            <button
              onClick={() => loadDashboardState()}
              className="mt-3 inline-flex items-center rounded-lg border border-red-400/40 px-3 py-1.5 text-xs font-semibold text-red-200 transition-colors hover:bg-red-500/20"
            >
              {t.retry}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-3 pb-10 pt-5 sm:px-4 md:px-6 md:pb-14 md:pt-7 xl:px-8 xl:pt-8">
      <div className="mb-4 text-center md:mb-6">
        <h1 className="mx-auto max-w-4xl text-[1.7rem] font-bold leading-tight tracking-tight text-black dark:text-white sm:text-3xl md:text-4xl">
          {t.title}
        </h1>
      </div>

      {!allComplete && steps.length > 0 && (
        <div className="mb-4 flex justify-center md:mb-6">
          <div className="w-full max-w-3xl rounded-xl border border-black/10 bg-white/56 px-3 py-2 backdrop-blur-sm dark:border-white/10 dark:bg-black/28">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="inline-flex items-start gap-2 text-[12px] leading-5 text-black/70 dark:text-white/66">
                <LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-300" />
                <span>{t.securityNotice}</span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="rounded-md border border-black/12 bg-black/[0.03] px-2 py-1 font-semibold text-black/60 dark:border-white/12 dark:bg-white/[0.03] dark:text-white/60">
                  {t.progressLabel}: {completedSteps}/{steps.length}
                </span>
                {nextStep && (
                  <span className="rounded-md border border-black/12 bg-black/[0.03] px-2 py-1 font-semibold text-black/60 dark:border-white/12 dark:bg-white/[0.03] dark:text-white/60">
                    {t.nextAction}: {nextStep.title}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {allComplete ? (
        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/[0.06] p-5 md:p-7">
          <h2 className="text-xl font-semibold text-black dark:text-white">{t.allDoneTitle}</h2>
          <p className="mt-2 text-sm leading-7 text-black/72 dark:text-white/72">{t.allDoneDescription}</p>

          <div className="mt-5 space-y-2">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/sales-agents/projects/${project.id}`}
                className="flex flex-col gap-2 rounded-xl border border-black/10 bg-white/80 px-4 py-3 transition-colors hover:border-black/20 hover:bg-white dark:border-white/10 dark:bg-black/30 dark:hover:border-white/20 dark:hover:bg-black/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-black dark:text-white">{project.name}</p>
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs font-medium text-black/70 dark:text-white/70 sm:ml-4">
                  <UsersRound className="h-3.5 w-3.5" />
                  {memberCountByProject[project.id] ?? 1} {t.users}
                  <span className="ml-1 text-blue-700 dark:text-blue-200">{t.openProject}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-2.5 sm:gap-3 xl:hidden">
            {steps.map((step, index) => (
              <JourneyNode
                key={step.key}
                stepNumber={index + 1}
                step={step}
                lockedHint={t.lockedHint}
                completeLabel={t.complete}
                inProgressLabel={t.inProgress}
                lockedLabel={t.locked}
              />
            ))}
          </div>

          <div
            ref={desktopContainerRef}
            className="relative hidden h-[760px] overflow-visible xl:block"
          >
            <div aria-hidden="true" className="dashboard-roadmap-gradient">
              <div className="dashboard-roadmap-blob dashboard-roadmap-blob-1" />
              <div className="dashboard-roadmap-blob dashboard-roadmap-blob-2" />
              <div className="dashboard-roadmap-blob dashboard-roadmap-blob-3" />
            </div>

            {steps.map((step, index) => (
              <TaskadeBeamNode
                key={`desktop-${step.key}`}
                ref={desktopStepRefs[index]}
                step={step}
                stepNumber={index + 1}
                x={roadmapPositions[index]?.x ?? 50}
                y={roadmapPositions[index]?.y ?? 50}
                accentColor={roadmapAccentColors[index] ?? "#38bdf8"}
                completeLabel={t.complete}
                inProgressLabel={t.inProgress}
                lockedLabel={t.locked}
              />
            ))}

            {beamConnections.map((connection, index) => (
              <AnimatedBeam
                key={`dashboard-beam-${index}`}
                className="z-0"
                containerRef={desktopContainerRef}
                fromRef={connection.fromRef}
                toRef={connection.toRef}
                straight
                fromAnchor={connection.fromAnchor}
                toAnchor={connection.toAnchor}
                curvature={connection.curvature}
                duration={4.6 - index * 0.3}
                delay={index * 0.14}
                pathColor={connection.active ? "#475569" : "#9ca3af"}
                pathWidth={1.6}
                pathOpacity={connection.active ? 0.36 : 0.18}
                gradientStartColor={connection.active ? "#facc15" : "#ca8a04"}
                gradientStopColor={connection.active ? "#fde047" : "#eab308"}
                movingDasharray="4 10"
                movingPathWidth={1.05}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
