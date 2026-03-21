"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type SupabaseActionError = {
  message: string;
  code?: string | null;
  details?: string | null;
  hint?: string | null;
};

const KNOWN_JOIN_ERRORS = new Set([
  "invalid_key",
  "already_owner",
  "already_member",
  "already_requested",
  "not_authenticated",
]);

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

function normalizeJoinErrorMessage(message: string) {
  return message
    .trim()
    .replace(/^"+|"+$/g, "")
    .replace(/^ERROR:\s*/i, "")
    .trim();
}

function isMissingRpc(error: SupabaseActionError, fnName: string) {
  const message = normalizeJoinErrorMessage(error.message);
  return (
    error.code === "PGRST202" ||
    (message.includes("Could not find the function") && message.includes(fnName))
  );
}

function toJoinError(error: SupabaseActionError) {
  const normalized = normalizeJoinErrorMessage(error.message);
  return KNOWN_JOIN_ERRORS.has(normalized) ? normalized : null;
}

async function requestProjectAccessLegacy(params: {
  supabase: Awaited<ReturnType<typeof getServerSupabase>>;
  joinKey: string;
  userId: string;
  userEmail: string;
  userName: string;
}) {
  const { supabase, joinKey, userId, userEmail, userName } = params;

  const { data, error: projectError } = await supabase.rpc(
    "get_project_by_join_key",
    { p_join_key: joinKey }
  );

  if (projectError) {
    const joinError = toJoinError(projectError);
    if (joinError) {
      throw new Error(joinError);
    }

    if (isMissingRpc(projectError, "get_project_by_join_key")) {
      throw new Error("connect_unavailable");
    }

    throw new Error(normalizeJoinErrorMessage(projectError.message));
  }

  const project = Array.isArray(data) ? data[0] : null;

  if (!project) {
    throw new Error("invalid_key");
  }

  if (project.owner_id === userId) {
    throw new Error("already_owner");
  }

  const { data: existingMember } = await supabase
    .from("project_members")
    .select("status")
    .eq("project_id", project.id)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingMember?.status === "approved") {
    throw new Error("already_member");
  }

  if (existingMember?.status === "pending") {
    throw new Error("already_requested");
  }

  const { error: upsertError } = await supabase
    .from("project_members")
    .upsert(
      {
        project_id: project.id,
        user_id: userId,
        user_email: userEmail,
        user_name: userName,
        status: "pending",
        role: "sales_manager",
      },
      { onConflict: "project_id,user_id" }
    );

  if (upsertError) {
    const joinError = toJoinError(upsertError);
    if (joinError) {
      throw new Error(joinError);
    }

    throw new Error(normalizeJoinErrorMessage(upsertError.message));
  }

  return { success: true, projectId: project.id as string };
}

/**
 * Joins a project via its join_key (short code like "8BD51D13").
 * Server-side: verifies user auth, validates key, creates pending membership.
 */
export async function joinProjectAction(joinKey: string) {
  const supabase = await getServerSupabase();

  // 1. Verify auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("not_authenticated");

  const trimmedKey = joinKey.trim();
  if (!trimmedKey) throw new Error("invalid_key");

  const email = user.email ?? "";
  const name =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    email.split("@")[0] ||
    "Unknown User";

  const { data: projectId, error: requestError } = await supabase.rpc(
    "request_project_access",
    {
      p_join_key: trimmedKey,
      p_user_id: user.id,
      p_user_email: email,
      p_user_name: name,
    }
  );

  if (requestError) {
    console.error("joinProjectAction error:", requestError);

    if (isMissingRpc(requestError, "request_project_access")) {
      return requestProjectAccessLegacy({
        supabase,
        joinKey: trimmedKey,
        userId: user.id,
        userEmail: email,
        userName: name,
      });
    }

    const joinError = toJoinError(requestError);
    if (joinError) {
      throw new Error(joinError);
    }

    throw new Error(normalizeJoinErrorMessage(requestError.message));
  }

  return { success: true, projectId };
}
