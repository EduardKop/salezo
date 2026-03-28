"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function getServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) =>
          toSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          ),
      },
    }
  );
}

export type SalesType = "phone" | "chat" | "in_person";

export type MessageType = "text" | "voice" | "video" | "screenshot";

export interface DialogTurn {
  role: "client" | "manager";
  type: MessageType;
  // text — main content (what was typed / voice transcript / video narration / screenshot description)
  text: string;
  // visual_description — only for video (what is shown visually) and screenshot (what is seen)
  visual_description?: string;
}

export interface Script {
  id: string;
  owner_id: string;
  title: string | null;
  description: string | null;
  sales_type: SalesType;
  project_id: string | null;
  share_key?: string | null;
  created_at: string;
  updated_at: string;
  dialog_count?: number;
  share_count?: number;
  projects?: { id: string; name: string } | null;
}

export interface ScriptShareUser {
  id: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface ScriptDialog {
  id: string;
  script_id: string;
  turns: DialogTurn[];
  created_at: string;
}

export type ScriptAccessRole = "owner" | "admin" | "sales_manager" | "viewer";

export interface ScriptAccess {
  script: Script;
  role: ScriptAccessRole;
  /** Can add dialogs (owner, admin, sales_manager) */
  canEdit: boolean;
  /** Can delete dialogs / change settings / attach to project (owner + admin) */
  canManage: boolean;
  /** Can disconnect/delete script (owner only) */
  isOwner: boolean;
}

/**
 * Central access resolver. Checks:
 * 1. If user owns the script → role = "owner"
 * 2. If script is in a project the user is an approved member of → role from project_members
 * Returns null if no access.
 */
async function resolveScriptAccess(
  supabase: Awaited<ReturnType<typeof getServerSupabase>>,
  scriptId: string,
  userId: string
): Promise<ScriptAccess | null> {
  // Fetch the script with its project
  const { data: script, error } = await supabase
    .from("scripts")
    .select("*, projects (id, name)")
    .eq("id", scriptId)
    .single();

  if (error || !script) return null;

  // Owner check
  if (script.owner_id === userId) {
    return {
      script,
      role: "owner",
      canEdit: true,
      canManage: true,
      isOwner: true,
    };
  }

  // Project member check
  if (script.project_id) {
    const { data: membership } = await supabase
      .from("project_members")
      .select("role")
      .eq("project_id", script.project_id)
      .eq("user_id", userId)
      .eq("status", "approved")
      .single();

    if (membership) {
      const role = membership.role as ScriptAccessRole;
      const canEdit = ["owner", "admin", "sales_manager"].includes(role);
      const canManage = ["owner", "admin"].includes(role);
      return { script, role, canEdit, canManage, isOwner: false };
    }
  }

  return null; // No access
}

/**
 * Creates a new script record. Returns the script id.
 */
export async function createScriptAction(
  salesType: SalesType,
  title?: string,
  description?: string
): Promise<string> {
  const supabase = await getServerSupabase();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("not_authenticated");

  const { data, error } = await supabase
    .from("scripts")
    .insert({
      owner_id: user.id,
      sales_type: salesType,
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "insert failed");
  return data.id;
}

export interface ScriptMember {
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  role: string;
  avatar_url: string | null;
}

/**
 * Returns members who have access to a script through its linked project.
 * Only available if the script is connected to a project and the caller has access.
 */
export async function getScriptMembersAction(
  scriptId: string
): Promise<{ members: ScriptMember[]; projectName: string | null }> {
  const supabase = await getServerSupabase();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("not_authenticated");

  const access = await resolveScriptAccess(supabase, scriptId, user.id);
  if (!access) throw new Error("script_not_found");

  if (!access.script.project_id) {
    return { members: [], projectName: null };
  }

  const projectName =
    (access.script.projects as { id: string; name: string } | null)?.name ?? null;

  const { data: members, error } = await supabase
    .from("project_members")
    .select("user_id, user_name, user_email, role, profiles ( avatar_url )")
    .eq("project_id", access.script.project_id)
    .eq("status", "approved")
    .order("role");

  if (error) throw new Error(error.message);

  return {
    projectName,
    members: (members ?? []).map((m: any) => ({
      user_id: m.user_id,
      user_name: m.user_name,
      user_email: m.user_email,
      role: m.role,
      avatar_url: m.profiles?.avatar_url ?? null,
    })),
  };
}

// ── Sharing actions ─────────────────────────────────────────────────────────

function generateKey(length = 10): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

/**
 * Generates (or returns existing) share key for a script. Owner only.
 */
export async function generateShareKeyAction(scriptId: string): Promise<string> {
  const supabase = await getServerSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("not_authenticated");

  const { data: script } = await supabase
    .from("scripts")
    .select("id, owner_id, share_key")
    .eq("id", scriptId)
    .single();

  if (!script) throw new Error("script_not_found");
  if (script.owner_id !== user.id) throw new Error("not_script_owner");

  if (script.share_key) return script.share_key;

  const key = generateKey();
  const { error } = await supabase
    .from("scripts")
    .update({ share_key: key })
    .eq("id", scriptId);

  if (error) throw new Error(error.message);
  return key;
}

/**
 * Generates share keys for multiple scripts at once. Owner only.
 */
export async function bulkGenerateShareKeysAction(scriptIds: string[]): Promise<Record<string, string>> {
  const supabase = await getServerSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("not_authenticated");

  const result: Record<string, string> = {};

  for (const scriptId of scriptIds) {
    const { data: script } = await supabase
      .from("scripts")
      .select("id, owner_id, share_key")
      .eq("id", scriptId)
      .eq("owner_id", user.id)
      .single();

    if (!script) continue;

    if (script.share_key) {
      result[scriptId] = script.share_key;
      continue;
    }

    const key = generateKey();
    const { error } = await supabase
      .from("scripts")
      .update({ share_key: key })
      .eq("id", scriptId);

    if (!error) result[scriptId] = key;
  }

  return result;
}

/**
 * Bulk connect multiple scripts to a project. Owner only.
 */
export async function bulkConnectScriptsAction(
  scriptIds: string[],
  projectId: string
): Promise<{ connected: number }> {
  const supabase = await getServerSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("not_authenticated");

  // Verify user manages the project
  const { data: project } = await supabase
    .from("projects")
    .select("id, owner_id")
    .eq("id", projectId)
    .single();

  if (!project) throw new Error("project_not_found");

  if (project.owner_id !== user.id) {
    const { data: membership } = await supabase
      .from("project_members")
      .select("role")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .eq("status", "approved")
      .single();
    if (!membership || !["owner", "admin"].includes(membership.role)) {
      throw new Error("not_project_manager");
    }
  }

  let connected = 0;
  for (const scriptId of scriptIds) {
    const { error } = await supabase
      .from("scripts")
      .update({ project_id: projectId })
      .eq("id", scriptId)
      .eq("owner_id", user.id);
    if (!error) connected++;
  }

  return { connected };
}

/**
 * Revoke a share key (disables sharing link). Owner only.
 */
export async function revokeShareKeyAction(scriptId: string): Promise<void> {
  const supabase = await getServerSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("not_authenticated");

  const { error } = await supabase
    .from("scripts")
    .update({ share_key: null })
    .eq("id", scriptId)
    .eq("owner_id", user.id);

  if (error) throw new Error(error.message);

  // Also remove existing shares
  await supabase
    .from("script_shares")
    .delete()
    .eq("script_id", scriptId);
}

/**
 * Returns users who have accepted a share link for a script. Owner only.
 */
export async function getScriptSharesAction(scriptId: string): Promise<ScriptShareUser[]> {
  const supabase = await getServerSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("not_authenticated");

  const { data: script } = await supabase
    .from("scripts")
    .select("owner_id")
    .eq("id", scriptId)
    .single();

  if (!script || script.owner_id !== user.id) throw new Error("not_script_owner");

  const { data, error } = await supabase
    .from("script_shares")
    .select("id, script_id, user_id, created_at, profiles ( full_name, email, avatar_url )")
    .eq("script_id", scriptId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((s: any) => ({
    id: s.id,
    user_id: s.user_id,
    user_name: s.profiles?.full_name ?? null,
    user_email: s.profiles?.email ?? null,
    avatar_url: s.profiles?.avatar_url ?? null,
    created_at: s.created_at,
  }));
}

/**
 * Accept a script share key — gives the current user read access.
 */
export async function acceptScriptShareAction(shareKey: string): Promise<string> {
  const supabase = await getServerSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("not_authenticated");

  const { data, error } = await supabase.rpc("accept_script_share", {
    p_share_key: shareKey,
  });

  if (error) throw new Error(error.message);
  return data as string;
}

/**
 * Returns all scripts owned by the user with share counts.
 * Enhanced version of getMyScriptsAction with sharing info.
 */
export async function getMyScriptsWithSharesAction(): Promise<
  (Script & { dialog_count: number; share_count: number })[]
> {
  const supabase = await getServerSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("not_authenticated");

  const { data: scripts, error: scriptsError } = await supabase
    .from("scripts")
    .select("*, projects (id, name)")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (scriptsError) throw new Error(scriptsError.message);
  if (!scripts || scripts.length === 0) return [];

  const scriptIds = scripts.map((s) => s.id);

  // Count dialogs
  const { data: dialogs } = await supabase
    .from("script_dialogs")
    .select("script_id")
    .in("script_id", scriptIds);

  const dialogCount: Record<string, number> = {};
  for (const d of dialogs ?? []) {
    dialogCount[d.script_id] = (dialogCount[d.script_id] ?? 0) + 1;
  }

  // Count shares (graceful — table may not exist yet)
  const shareCount: Record<string, number> = {};
  try {
    const { data: shares } = await supabase
      .from("script_shares")
      .select("script_id")
      .in("script_id", scriptIds);
    for (const s of shares ?? []) {
      shareCount[s.script_id] = (shareCount[s.script_id] ?? 0) + 1;
    }
  } catch { /* script_shares table may not exist yet */ }

  return scripts.map((s) => ({
    ...s,
    dialog_count: dialogCount[s.id] ?? 0,
    share_count: shareCount[s.id] ?? 0,
    share_key: (s as any).share_key ?? null,
  }));
}



/**
 * Updates an existing script's title and/or description.
 * Only owner or admin can change settings.
 */
export async function updateScriptMetadataAction(
  scriptId: string,
  payload: { title?: string; description?: string }
): Promise<void> {
  const supabase = await getServerSupabase();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("not_authenticated");

  const access = await resolveScriptAccess(supabase, scriptId, user.id);
  if (!access) throw new Error("script_not_found");
  if (!access.canManage) throw new Error("insufficient_permissions");

  const { error } = await supabase
    .from("scripts")
    .update({
      ...(payload.title !== undefined ? { title: payload.title } : {}),
      ...(payload.description !== undefined ? { description: payload.description } : {}),
    })
    .eq("id", scriptId);

  if (error) throw new Error(error.message);
}

/**
 * Saves a recorded dialog (array of client/manager turns) to a script.
 * Owner, admin, and sales_manager can add dialogs.
 */
export async function saveDialogAction(
  scriptId: string,
  turns: DialogTurn[]
): Promise<void> {
  const supabase = await getServerSupabase();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("not_authenticated");

  const access = await resolveScriptAccess(supabase, scriptId, user.id);
  if (!access) throw new Error("script_not_found");
  if (!access.canEdit) throw new Error("insufficient_permissions");

  const { error } = await supabase
    .from("script_dialogs")
    .insert({ script_id: scriptId, turns });

  if (error) throw new Error(error.message);
}

/**
 * Connects a script to a project.
 * - Script owner can connect to any project they own or manage (owner/admin).
 * - Project admin can connect their own scripts to the project they admin.
 */
export async function connectScriptToProjectAction(
  scriptId: string,
  projectId: string
): Promise<void> {
  const supabase = await getServerSupabase();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("not_authenticated");

  // Verify user owns the script
  const { data: script, error: scriptError } = await supabase
    .from("scripts")
    .select("id, owner_id")
    .eq("id", scriptId)
    .single();

  if (scriptError || !script) throw new Error("script_not_found");
  if (script.owner_id !== user.id) throw new Error("not_script_owner");

  // Verify user owns or manages the project (owner or admin)
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, owner_id")
    .eq("id", projectId)
    .single();

  if (projectError || !project) throw new Error("project_not_found");

  const isProjectOwner = project.owner_id === user.id;

  if (!isProjectOwner) {
    // Check if user is an admin of this project
    const { data: membership } = await supabase
      .from("project_members")
      .select("role")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .eq("status", "approved")
      .single();

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      throw new Error("not_project_manager");
    }
  }

  const { error } = await supabase
    .from("scripts")
    .update({ project_id: projectId })
    .eq("id", scriptId);

  if (error) throw new Error(error.message);
}

/**
 * Disconnects a script from its project. Only the script owner can do this.
 */
export async function disconnectScriptFromProjectAction(
  scriptId: string
): Promise<void> {
  const supabase = await getServerSupabase();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("not_authenticated");

  const { error } = await supabase
    .from("scripts")
    .update({ project_id: null })
    .eq("id", scriptId)
    .eq("owner_id", user.id);

  if (error) throw new Error(error.message);
}

/**
 * Returns all scripts owned by the current user, with dialog count.
 */
export async function getMyScriptsAction(): Promise<
  (Script & { dialog_count: number })[]
> {
  const supabase = await getServerSupabase();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("not_authenticated");

  const { data: scripts, error: scriptsError } = await supabase
    .from("scripts")
    .select("*, projects (id, name)")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (scriptsError) throw new Error(scriptsError.message);
  if (!scripts || scripts.length === 0) return [];

  // Count dialogs for each script
  const { data: dialogs, error: dialogsError } = await supabase
    .from("script_dialogs")
    .select("script_id")
    .in(
      "script_id",
      scripts.map((s) => s.id)
    );

  if (dialogsError) throw new Error(dialogsError.message);

  const countMap: Record<string, number> = {};
  for (const d of dialogs ?? []) {
    countMap[d.script_id] = (countMap[d.script_id] ?? 0) + 1;
  }

  return scripts.map((s) => ({ ...s, dialog_count: countMap[s.id] ?? 0 }));
}

/**
 * Returns all scripts the current user can access:
 * - Scripts they own
 * - Scripts linked to projects they are an approved member of
 * Used by the Sidebar to show all accessible scripts.
 */
export async function getAccessibleScriptsAction(): Promise<
  { id: string; title: string | null; owner_id: string }[]
> {
  const supabase = await getServerSupabase();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return [];

  // 1. Own scripts
  const { data: ownScripts } = await supabase
    .from("scripts")
    .select("id, title, owner_id")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  // 2. Project member scripts
  const { data: memberships } = await supabase
    .from("project_members")
    .select("project_id")
    .eq("user_id", user.id)
    .eq("status", "approved");

  const projectIds = (memberships ?? []).map((m) => m.project_id);
  let memberScripts: { id: string; title: string | null; owner_id: string }[] = [];

  if (projectIds.length > 0) {
    const { data: projectScripts } = await supabase
      .from("scripts")
      .select("id, title, owner_id")
      .in("project_id", projectIds)
      .neq("owner_id", user.id) // avoid duplicates
      .order("created_at", { ascending: false });

    memberScripts = projectScripts ?? [];
  }

  // Merge: own scripts first, then member scripts
  const ownList = ownScripts ?? [];
  const merged = [...ownList, ...memberScripts];
  return merged;
}

/**
 * Returns scripts shared with the current user via:
 * 1. Project membership (approved member of a project that has the script)
 * 2. Direct share link (user accepted a share link via script_shares table)
 */
export async function getSharedScriptsAction(): Promise<
  (Script & { dialog_count: number; member_role: string })[]
> {
  const supabase = await getServerSupabase();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("not_authenticated");

  const allScripts: (Script & { dialog_count: number; member_role: string })[] = [];
  const seenIds = new Set<string>();

  // === Source 1: project membership ===
  const { data: memberships } = await supabase
    .from("project_members")
    .select("project_id, role")
    .eq("user_id", user.id)
    .eq("status", "approved");

  const membershipMap: Record<string, string> = {};
  for (const m of memberships ?? []) {
    membershipMap[m.project_id] = m.role;
  }

  const projectIds = Object.keys(membershipMap);
  if (projectIds.length > 0) {
    const { data: projectScripts } = await supabase
      .from("scripts")
      .select("*, projects (id, name)")
      .in("project_id", projectIds)
      .neq("owner_id", user.id)
      .order("created_at", { ascending: false });

    for (const s of projectScripts ?? []) {
      if (!seenIds.has(s.id)) {
        seenIds.add(s.id);
        allScripts.push({
          ...s,
          dialog_count: 0,
          member_role: membershipMap[s.project_id!] ?? "viewer",
        });
      }
    }
  }

  // === Source 2: direct share link (script_shares) ===
  try {
    const { data: shareRows } = await supabase
      .from("script_shares")
      .select("script_id")
      .eq("user_id", user.id);

    const shareScriptIds = (shareRows ?? [])
      .map((r) => r.script_id)
      .filter((id) => !seenIds.has(id));

    if (shareScriptIds.length > 0) {
      const { data: shareScripts } = await supabase
        .from("scripts")
        .select("*, projects (id, name)")
        .in("id", shareScriptIds)
        .order("created_at", { ascending: false });

      for (const s of shareScripts ?? []) {
        if (!seenIds.has(s.id)) {
          seenIds.add(s.id);
          allScripts.push({
            ...s,
            dialog_count: 0,
            member_role: "viewer",
          });
        }
      }
    }
  } catch { /* script_shares may not exist yet */ }

  if (allScripts.length === 0) return [];

  // Count dialogs for all found scripts
  const { data: dialogs } = await supabase
    .from("script_dialogs")
    .select("script_id")
    .in("script_id", allScripts.map((s) => s.id));

  const countMap: Record<string, number> = {};
  for (const d of dialogs ?? []) {
    countMap[d.script_id] = (countMap[d.script_id] ?? 0) + 1;
  }

  return allScripts.map((s) => ({
    ...s,
    dialog_count: countMap[s.id] ?? 0,
  }));
}

/**
 * Returns projects owned by the current user (for connect dropdown).
 */
export async function getMyOwnedProjectsAction(): Promise<
  { id: string; name: string }[]
> {
  const supabase = await getServerSupabase();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("not_authenticated");

  const { data, error } = await supabase
    .from("projects")
    .select("id, name")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * Returns projects the user can manage (owner or admin) — for connecting scripts.
 */
export async function getManagedProjectsAction(): Promise<
  { id: string; name: string }[]
> {
  const supabase = await getServerSupabase();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("not_authenticated");

  // Projects user owns
  const { data: ownedProjects } = await supabase
    .from("projects")
    .select("id, name")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  // Projects where user is admin
  const { data: adminMemberships } = await supabase
    .from("project_members")
    .select("project_id")
    .eq("user_id", user.id)
    .eq("status", "approved")
    .eq("role", "admin");

  const adminProjectIds = (adminMemberships ?? []).map((m) => m.project_id);
  let adminProjects: { id: string; name: string }[] = [];

  if (adminProjectIds.length > 0) {
    const { data } = await supabase
      .from("projects")
      .select("id, name")
      .in("id", adminProjectIds)
      .order("created_at", { ascending: false });
    adminProjects = data ?? [];
  }

  // Merge and deduplicate
  const owned = ownedProjects ?? [];
  const seen = new Set(owned.map((p) => p.id));
  const merged = [...owned];
  for (const p of adminProjects) {
    if (!seen.has(p.id)) {
      merged.push(p);
      seen.add(p.id);
    }
  }

  return merged;
}

/**
 * Returns a single script by id with full access resolution.
 * Members of the linked project can also read it.
 */
export async function getScriptAction(scriptId: string): Promise<Script> {
  const supabase = await getServerSupabase();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("not_authenticated");

  const access = await resolveScriptAccess(supabase, scriptId, user.id);
  if (!access) throw new Error("script_not_found");

  return access.script;
}

/**
 * Returns the full access object for a script (role, canEdit, canManage).
 * Used by UI to conditionally render controls.
 */
export async function getScriptAccessAction(scriptId: string): Promise<ScriptAccess> {
  const supabase = await getServerSupabase();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("not_authenticated");

  const access = await resolveScriptAccess(supabase, scriptId, user.id);
  if (!access) throw new Error("script_not_found");

  return access;
}

/**
 * Returns all saved dialogs for a script (latest first).
 * Accessible to any user with read access to the script.
 */
export async function getScriptDialogsAction(
  scriptId: string
): Promise<ScriptDialog[]> {
  const supabase = await getServerSupabase();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("not_authenticated");

  const access = await resolveScriptAccess(supabase, scriptId, user.id);
  if (!access) throw new Error("script_not_found");

  const { data, error } = await supabase
    .from("script_dialogs")
    .select("*")
    .eq("script_id", scriptId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as ScriptDialog[];
}

/**
 * Deletes a saved dialog by id.
 * Only owner and admin can delete.
 */
export async function deleteDialogAction(dialogId: string): Promise<void> {
  const supabase = await getServerSupabase();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("not_authenticated");

  // First, find what script this dialog belongs to
  const { data: dialog } = await supabase
    .from("script_dialogs")
    .select("script_id")
    .eq("id", dialogId)
    .single();

  if (!dialog) throw new Error("dialog_not_found");

  const access = await resolveScriptAccess(supabase, dialog.script_id, user.id);
  if (!access) throw new Error("script_not_found");
  // Only owner and admin can delete dialogs
  if (!access.canManage && !access.isOwner) throw new Error("insufficient_permissions");

  const { error } = await supabase
    .from("script_dialogs")
    .delete()
    .eq("id", dialogId);

  if (error) throw new Error(error.message);
}
