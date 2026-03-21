"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase";
import { useLanguage, type Language } from "@/hooks/useLanguage";
import { auth as translations, t as getT } from "@/lib/i18n/translations";

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { language, mounted } = useLanguage();
  const activeLanguage = (mounted ? language : "ru") as Language;
  const t = getT(translations, activeLanguage);

  async function onGoogleLogin() {
    setIsLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setIsLoading(false);
      toast.error(t.signInFailed, { description: error.message });
    }
    // On success the browser redirects — no need to setIsLoading(false)
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{t.welcome}</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {t.subtitle}
        </p>
      </div>

      <div className="grid gap-6">
        <button
          type="button"
          disabled={isLoading}
          onClick={onGoogleLogin}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 h-10 px-4 py-2"
        >
          {isLoading ? (
            <span className="animate-spin mr-2 h-4 w-4 rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
          )}
          {t.google}
        </button>
      </div>

      <p className="px-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
        {t.termsLead}{" "}
        <a href="#" className="underline underline-offset-4 hover:text-black dark:hover:text-white">{t.termsOfService}</a>{" "}
        {t.and}{" "}
        <a href="#" className="underline underline-offset-4 hover:text-black dark:hover:text-white">{t.privacyPolicy}</a>.
      </p>
    </div>
  );
}
