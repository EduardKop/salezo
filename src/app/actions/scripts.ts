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

  // 1. Try: user owns the script (SECURITY DEFINER — reliable through pooler)
  const { data: ownRows } = await supabase.rpc("get_own_script", { p_script_id: scriptId });
  if (ownRows?.[0]) {
    const s = ownRows[0];
    const script: Script = {
      ...s,
      projects: s.project_name ? { id: s.project_id, name: s.project_name } : null,
    };
    return { script, role: "owner", canEdit: true, canManage: true, isOwner: true };
  }

  // 2. Try: user is project member — normal RLS should work here
  const { data: memberScript } = await supabase
    .from("scripts")
    .select("*, projects (id, name)")
    .eq("id", scriptId)
    .single();

  if (memberScript) {
    if (memberScript.project_id) {
      // Project member?
      const { data: membership } = await supabase
        .from("project_members")
        .select("role")
        .eq("project_id", memberScript.project_id)
        .eq("user_id", userId)
        .eq("status", "approved")
        .single();

      if (membership) {
        const role = membership.role as ScriptAccessRole;
        const canEdit = ["owner", "admin", "sales_manager"].includes(role);
        const canManage = ["owner", "admin"].includes(role);
        return { script: memberScript, role, canEdit, canManage, isOwner: false };
      }
    }
    // Visible but no membership — shared via link (viewer)
    return { script: memberScript, role: "viewer", canEdit: false, canManage: false, isOwner: false };
  }

  // 3. Try: user owns the project (SECURITY DEFINER)
  const { data: projRows } = await supabase.rpc("get_script_as_project_owner", { p_script_id: scriptId });
  if (projRows?.[0]) {
    const s = projRows[0];
    const script: Script = { ...s, projects: null };
    return { script, role: "owner", canEdit: true, canManage: true, isOwner: false };
  }

  return null;
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
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("not_authenticated");

  // Use SECURITY DEFINER RPC — bypasses RLS INSERT check (auth.uid() unreliable via pooler)
  const { data, error } = await supabase.rpc("create_script", {
    p_sales_type:  salesType,
    p_title:       title ?? null,
    p_description: description ?? null,
  });

  if (error) throw new Error(error.message);
  return data as string;
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

  // Use SECURITY DEFINER RPC — validates access and inserts (bypasses pooler RLS issue)
  const { error } = await supabase.rpc("save_script_dialog", {
    p_script_id: scriptId,
    p_turns:     turns,
  });

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
 * Project owner disconnects a team member's script from their project.
 * The script owner_id stays the same — only project_id is cleared.
 */
export async function disconnectTeamScriptAction(scriptId: string): Promise<void> {
  const supabase = await getServerSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("not_authenticated");

  // SECURITY DEFINER — validates project ownership and disconnects
  const { error } = await supabase.rpc("disconnect_team_script", {
    p_script_id: scriptId,
  });
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
 * Returns scripts connected to projects owned by the current user
 * but NOT owned by the current user (i.e. scripts from team members).
 */
export async function getProjectConnectedScriptsAction(): Promise<
  (Script & { dialog_count: number; share_count: number; member_name: string | null; member_email: string | null; projects?: { id: string; name: string } | null })[]
> {
  const supabase = await getServerSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("not_authenticated");

  // SECURITY DEFINER — bypasses RLS on scripts + profiles
  const { data, error } = await supabase.rpc("get_project_team_scripts");
  if (error) throw new Error(error.message);

  return (data ?? []).map((r: any) => ({
    id:           r.id,
    owner_id:     r.owner_id,
    title:        r.title,
    description:  r.description,
    sales_type:   r.sales_type,
    project_id:   r.project_id,
    share_key:    r.share_key ?? null,
    created_at:   r.created_at,
    updated_at:   r.updated_at,
    dialog_count: Number(r.dialog_count ?? 0),
    share_count:  Number(r.share_count ?? 0),
    member_name:  r.member_name ?? null,
    member_email: r.member_email ?? null,
    projects:     r.project_name ? { id: r.project_id, name: r.project_name } : null,
  }));
}

/**
 * Returns ALL projects the user has access to:
 * - Projects they own
 * - Projects they are an approved member of (any role)
 *
 * Each entry includes `isOwner` and `role` so the UI can decide
 * whether connecting is direct (owner/admin) or via request (member).
 */
export async function getManagedProjectsAction(): Promise<
  { id: string; name: string; isOwner: boolean; role: string | null }[]
> {
  const supabase = await getServerSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("not_authenticated");

  // Projects user owns
  const { data: ownedProjects } = await supabase
    .from("projects")
    .select("id, name")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  // All approved memberships (any role)
  const { data: memberships } = await supabase
    .from("project_members")
    .select("project_id, role")
    .eq("user_id", user.id)
    .eq("status", "approved");

  const membershipMap: Record<string, string> = {};
  for (const m of memberships ?? []) {
    membershipMap[m.project_id] = m.role;
  }

  const memberProjectIds = Object.keys(membershipMap);
  let memberProjects: { id: string; name: string }[] = [];

  if (memberProjectIds.length > 0) {
    const { data } = await supabase
      .from("projects")
      .select("id, name")
      .in("id", memberProjectIds)
      .order("created_at", { ascending: false });
    memberProjects = data ?? [];
  }

  // Merge: owned first, then member projects not already in owned
  const owned = ownedProjects ?? [];
  const ownedIds = new Set(owned.map((p) => p.id));

  const result: { id: string; name: string; isOwner: boolean; role: string | null }[] = [
    ...owned.map((p) => ({ ...p, isOwner: true, role: "owner" })),
  ];

  for (const p of memberProjects) {
    if (!ownedIds.has(p.id)) {
      result.push({
        ...p,
        isOwner: false,
        role: membershipMap[p.id] ?? "viewer",
      });
    }
  }

  return result;
}

// ── Script connect requests ──────────────────────────────────────────────────

export interface ScriptConnectRequest {
  id: string;
  script_id: string;
  project_id: string;
  requester_id: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  // Joined data
  requester_email: string | null;
  requester_name: string | null;
  requester_avatar: string | null;
  script_title: string | null;
  script_description: string | null;
  script_sales_type: string | null;
  project_name: string | null;
}

/**
 * Member requests to connect their own script to a project they belong to.
 * If they are the project owner or admin → connects directly.
 * Otherwise → creates a pending request for the project owner to approve.
 */
export async function requestScriptConnectAction(
  scriptId: string,
  projectId: string
): Promise<{ direct: boolean }> {
  const supabase = await getServerSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("not_authenticated");

  // User must own the script
  const { data: script } = await supabase
    .from("scripts")
    .select("id, owner_id")
    .eq("id", scriptId)
    .single();
  if (!script) throw new Error("script_not_found");
  if (script.owner_id !== user.id) throw new Error("not_script_owner");

  // Use SECURITY DEFINER RPC — handles all permission checks and RLS bypass internally
  const { data: result, error } = await supabase.rpc("create_script_connect_request", {
    p_script_id:  scriptId,
    p_project_id: projectId,
  });

  if (error) throw new Error(error.message);
  return { direct: result === "direct" };
}

/**
 * Returns pending script connect requests for projects owned by the current user.
 */
export async function getScriptConnectRequestsAction(): Promise<ScriptConnectRequest[]> {
  const supabase = await getServerSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("not_authenticated");

  // SECURITY DEFINER RPC — bypasses RLS on script_connect_requests and profiles
  const { data, error } = await supabase.rpc("get_script_connect_requests");
  if (error) throw new Error(error.message);

  return (data ?? []).map((r: any) => ({
    id: r.id,
    script_id: r.script_id,
    project_id: r.project_id,
    requester_id: r.requester_id,
    status: r.status,
    created_at: r.created_at,
    requester_email: r.requester_email ?? null,
    requester_name: r.requester_name ?? null,
    requester_avatar: r.requester_avatar ?? null,
    script_title: r.script_title ?? null,
    script_description: r.script_description ?? null,
    script_sales_type: r.script_sales_type ?? null,
    project_name: r.project_name ?? null,
  }));
}

/**
 * Owner approves a script connect request → connects the script to the project.
 */
export async function approveScriptConnectRequestAction(requestId: string): Promise<void> {
  const supabase = await getServerSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("not_authenticated");

  // Use SECURITY DEFINER RPC — bypasses RLS so owner can update a script they don't own
  const { error } = await supabase.rpc("approve_script_connect_request", {
    p_request_id: requestId,
  });
  if (error) throw new Error(error.message);
}

/**
 * Owner rejects a script connect request.
 */
export async function rejectScriptConnectRequestAction(requestId: string): Promise<void> {
  const supabase = await getServerSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("not_authenticated");

  const { data: req } = await supabase
    .from("script_connect_requests")
    .select("id, project_id")
    .eq("id", requestId)
    .single();
  if (!req) throw new Error("request_not_found");

  const { data: project } = await supabase
    .from("projects")
    .select("owner_id")
    .eq("id", req.project_id)
    .single();
  if (!project || project.owner_id !== user.id) throw new Error("not_project_owner");

  await supabase
    .from("script_connect_requests")
    .update({ status: "rejected" })
    .eq("id", requestId);
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

  // Script owner — use SECURITY DEFINER (reliable through pooler)
  if (access.isOwner) {
    const { data: ownData, error: ownError } = await supabase.rpc("get_own_script_dialogs", {
      p_script_id: scriptId,
    });
    if (ownError) throw new Error(ownError.message);
    return (ownData ?? []) as ScriptDialog[];
  }

  // Project owner of a team script — SECURITY DEFINER
  const { data: projData, error: projError } = await supabase.rpc(
    "get_script_dialogs_as_project_owner",
    { p_script_id: scriptId }
  );
  if (!projError && projData !== null) return (projData ?? []) as ScriptDialog[];

  // Project member — normal RLS read
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
