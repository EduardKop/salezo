"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { MemberRole, MemberStatus } from "@/lib/projects";

// ─── Server-side Supabase client (reads user JWT from cookies) ───────────────
async function getServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  );
}

type ManagedMember = {
  id: string;
  project_id: string;
  user_id: string;
  role: MemberRole;
  status: MemberStatus;
};

type ProjectOwner = {
  owner_id: string;
};

const ASSIGNABLE_ROLES: MemberRole[] = ["sales_manager", "admin"];

function coerceRole(role: string): MemberRole {
  return ASSIGNABLE_ROLES.includes(role as MemberRole)
    ? (role as MemberRole)
    : "sales_manager";
}

function assertMutableMember(member: ManagedMember, ownerId: string) {
  if (member.user_id === ownerId || member.role === "owner") {
    throw new Error("Cannot modify project owner");
  }
}

// ─── helper: verify current user is owner OR admin of the project ─────────────
async function assertCanManage(
  supabase: Awaited<ReturnType<typeof getServerSupabase>>,
  memberId: string
) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Unauthorized: not authenticated");

  // Get the project for this member record
  const { data: member, error: memberError } = await supabase
    .from("project_members")
    .select("id, project_id, user_id, role, status")
    .eq("id", memberId)
    .single();

  if (memberError || !member) throw new Error("Member not found");

  // Check ownership
  const { data: project } = await supabase
    .from("projects")
    .select("owner_id")
    .eq("id", member.project_id)
    .single();

  const isOwner = project?.owner_id === user.id;
  if (isOwner) {
    return {
      user,
      member: member as ManagedMember,
      project: project as ProjectOwner,
    };
  }

  // Check admin role
  const { data: myMembership } = await supabase
    .from("project_members")
    .select("role")
    .eq("project_id", member.project_id)
    .eq("user_id", user.id)
    .eq("status", "approved")
    .single();

  if (myMembership?.role !== "admin") {
    throw new Error("Unauthorized: you are not the owner or admin of this project");
  }

  return {
    user,
    member: member as ManagedMember,
    project: project as ProjectOwner,
  };
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function approveMemberAction(memberId: string, role: string) {
  const supabase = await getServerSupabase();
  const { member, project } = await assertCanManage(supabase, memberId);
  assertMutableMember(member, project.owner_id);

  if (member.status !== "pending") {
    throw new Error("Only pending requests can be approved");
  }

  const safeRole = coerceRole(role);

  const { data, error } = await supabase
    .from("project_members")
    .update({ status: "approved", role: safeRole })
    .eq("id", memberId)
    .select();

  if (error) throw new Error(`Failed to approve member: ${error.message}`);
  if (!data || data.length === 0) throw new Error("Approval failed (RLS blocked)");
  return { success: true };
}

export async function rejectMemberAction(memberId: string) {
  const supabase = await getServerSupabase();
  const { member, project } = await assertCanManage(supabase, memberId);
  assertMutableMember(member, project.owner_id);

  if (member.status !== "pending") {
    throw new Error("Only pending requests can be rejected");
  }

  const { data, error } = await supabase
    .from("project_members")
    .delete()
    .eq("id", memberId)
    .select();

  if (error) throw new Error(`Failed to reject member: ${error.message}`);
  if (!data || data.length === 0) throw new Error("Rejection failed (RLS blocked)");
  return { success: true };
}

export async function updateMemberRoleAction(memberId: string, newRole: string) {
  const supabase = await getServerSupabase();
  const { member, project } = await assertCanManage(supabase, memberId);
  assertMutableMember(member, project.owner_id);

  if (member.status !== "approved") {
    throw new Error("Only approved members can change role");
  }

  const safeRole = coerceRole(newRole);

  const { data, error } = await supabase
    .from("project_members")
    .update({ role: safeRole })
    .eq("id", memberId)
    .select();

  if (error) throw new Error(`Failed to update role: ${error.message}`);
  if (!data || data.length === 0) throw new Error("Role update failed (RLS blocked)");
  return { success: true };
}

export async function removeMemberAction(memberId: string) {
  const supabase = await getServerSupabase();
  const { member, project } = await assertCanManage(supabase, memberId);
  assertMutableMember(member, project.owner_id);

  const { data, error } = await supabase
    .from("project_members")
    .delete()
    .eq("id", memberId)
    .select();

  if (error) throw new Error(`Failed to remove member: ${error.message}`);
  if (!data || data.length === 0) throw new Error("Member removal failed (RLS blocked)");
  return { success: true };
}
