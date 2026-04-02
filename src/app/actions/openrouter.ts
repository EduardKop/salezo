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

/**
 * Returns true if the current user has an OpenRouter API key stored.
 */
export async function hasOpenRouterKeyAction(): Promise<boolean> {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("profiles")
    .select("openrouter_api_key")
    .eq("id", user.id)
    .single();

  return Boolean(data?.openrouter_api_key);
}

/**
 * Saves an OpenRouter API key for the current user.
 */
export async function saveOpenRouterKeyAction(apiKey: string): Promise<void> {
  const supabase = await getServerSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("not_authenticated");

  const trimmed = apiKey.trim();
  if (!trimmed) throw new Error("key_empty");
  if (!trimmed.startsWith("sk-or-")) throw new Error("key_invalid_format");

  const { error } = await supabase
    .from("profiles")
    .update({ openrouter_api_key: trimmed })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
}

/**
 * Removes the OpenRouter API key for the current user.
 */
export async function removeOpenRouterKeyAction(): Promise<void> {
  const supabase = await getServerSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("not_authenticated");

  const { error } = await supabase
    .from("profiles")
    .update({ openrouter_api_key: null })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
}
