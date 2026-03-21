"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Settings, FolderGit2, X, Save, Check, Plus } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  isProductInfoList,
  isStringList,
  type Project,
  type ProjectDetail,
  type ProjectDetailValue,
  type ProductInfo,
} from "@/lib/projects";

const translations = {
  en: {
    back: "Back to projects",
    loading: "Loading project...",
    notFound: "Project not found or you don't have access",
    settings: "Settings",
    created: "Created on",
    details: "Project details",
    workspaceDashboard: "Workspace Dashboard",
    comingSoon: "AI integrations, analytics, chat avatars, and kanban boards for this project will be added here. Stay tuned!",
    settingsTitle: "Project Settings",
    settingsDesc: "Edit your project details. Changes are saved immediately.",
    save: "Save changes",
    saving: "Saving...",
    saved: "Saved!",
    cancel: "Cancel",
    projectName: "Project name",
    addProduct: "Add product...",
    addProductPrice: "Avg price (optional)",
    addCountry: "Add country...",
    scripts: "Scripts",
    notAdded: "Not added",
  },
  ru: {
    back: "К списку проектов",
    loading: "Загрузка проекта...",
    notFound: "Проект не найден или у вас нет к нему доступа",
    settings: "Настройки",
    created: "Создан",
    details: "Детали проекта",
    workspaceDashboard: "Рабочее пространство",
    comingSoon: "Интеграция с ИИ, аналитика, чат-аватарки и канбан-доски для этого проекта будут добавлены сюда. Следите за обновлениями!",
    settingsTitle: "Настройки проекта",
    settingsDesc: "Редактируйте детали проекта. Изменения сохраняются сразу.",
    save: "Сохранить",
    saving: "Сохранение...",
    saved: "Сохранено!",
    cancel: "Отмена",
    projectName: "Название проекта",
    addProduct: "Добавить товар...",
    addProductPrice: "Ср. цена (необяз.)",
    addCountry: "Добавить страну...",
    scripts: "Скрипты",
    notAdded: "Не добавлено",
  }
};

const FIELD_LABEL_MAP: Record<string, { en: string; ru: string }> = {
  name:             { en: "Sales sphere",        ru: "Сфера продаж" },
  products:         { en: "Products & Services",  ru: "Товары и Услуги" },
  price:            { en: "Average Price Range",  ru: "Средний диапазон цен" },
  description:      { en: "Mission",              ru: "Миссия" },
  retention:        { en: "Client Retention",     ru: "Удержание клиентов" },
  retentionDesc:    { en: "Retention Process",    ru: "Процесс удержания" },
  retentionMetrics: { en: "Retention Metrics",    ru: "Метрики удержания" },
  problems:         { en: "Current Problems",     ru: "Текущие проблемы" },
  salesProcess:     { en: "Sales Process",        ru: "Процесс продаж" },
  countries:        { en: "Sales Countries",      ru: "Страны продаж" },
};

const STORED_NAME_TO_KEY: Record<string, string> = {};
for (const [key, labels] of Object.entries(FIELD_LABEL_MAP)) {
  STORED_NAME_TO_KEY[labels.en.toLowerCase()] = key;
  STORED_NAME_TO_KEY[labels.ru.toLowerCase()] = key;
}
const EXTRA_ALIASES: Record<string, string> = {
  "sales sphere": "name", "сфера продаж": "name",
  "products & services": "products", "товары и услуги": "products",
  "average price range": "price", "средний диапазон цен": "price",
  "describe the team's mission": "description", "опишите миссию команды": "description", "опишите миссию": "description",
  "client retention": "retention", "удержание клиентов": "retention",
  "retention process": "retentionDesc", "процесс удержания": "retentionDesc",
  "retention metrics": "retentionMetrics", "метрики удержания": "retentionMetrics",
  "current problems": "problems", "текущие проблемы": "problems",
  "define the sales process": "salesProcess", "определите процесс продаж": "salesProcess",
  "sales countries": "countries", "страны продаж": "countries",
};
Object.assign(STORED_NAME_TO_KEY, EXTRA_ALIASES);

function getFieldKey(storedName: string): string | null {
  return STORED_NAME_TO_KEY[storedName.toLowerCase()] ?? null;
}

function translateFieldName(storedName: string, lang: string): string {
  const key = getFieldKey(storedName);
  if (!key) return storedName;
  const labels = FIELD_LABEL_MAP[key];
  return lang === "en" ? labels.en : labels.ru;
}

function filterRetentionDetails(details: ProjectDetail[]): ProjectDetail[] {
  const retentionEnabled =
    details.find((detail) => getFieldKey(detail.name) === "retention")?.information ===
    true;

  if (retentionEnabled) {
    return details;
  }

  return details.filter((detail) => {
    const key = getFieldKey(detail.name);
    return key !== "retentionDesc" && key !== "retentionMetrics";
  });
}

function cloneDetailValue(value: ProjectDetailValue): ProjectDetailValue {
  if (isProductInfoList(value)) {
    return value.map((product) => ({ ...product }));
  }

  if (isStringList(value)) {
    return [...value];
  }

  return value;
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

// ── Chip-list editors ─────────────────────────────────────────────────────────

function ProductsEditor({
  products,
  onChange,
  lang,
}: {
  products: ProductInfo[];
  onChange: (v: ProductInfo[]) => void;
  lang: string;
}) {
  const t = lang === "en" ? translations.en : translations.ru;
  const [newName, setNewName] = React.useState("");
  const [newPrice, setNewPrice] = React.useState("");

  const add = () => {
    if (!newName.trim()) return;
    onChange([...products, { name: newName.trim(), price: newPrice.trim() }]);
    setNewName("");
    setNewPrice("");
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={t.addProduct}
          className="flex-[1.5] px-3 py-2 text-[13px] bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
        />
        <input
          value={newPrice}
          onChange={e => setNewPrice(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={t.addProductPrice}
          className="flex-[2] px-3 py-2 text-[13px] bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
        />
        <button
          onClick={add}
          disabled={!newName.trim()}
          className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg transition-colors disabled:opacity-40 shrink-0"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {products.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {products.map((p, idx) => (
              <motion.div
                key={`${p.name}-${idx}`}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-[13px] font-medium"
              >
                <span className="text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                  <span>{p.name}</span>
                  {p.price && (
                    <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded text-[11px]">
                      {p.price}
                    </span>
                  )}
                </span>
                <div className="w-px h-3.5 bg-neutral-300 dark:bg-neutral-700 mx-0.5" />
                <button
                  onClick={() => onChange(products.filter((_, i) => i !== idx))}
                  className="text-neutral-400 hover:text-red-500 transition-colors p-0.5 rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function CountriesEditor({
  countries,
  onChange,
  lang,
}: {
  countries: string[];
  onChange: (v: string[]) => void;
  lang: string;
}) {
  const t = lang === "en" ? translations.en : translations.ru;
  const [newCountry, setNewCountry] = React.useState("");

  const add = () => {
    if (!newCountry.trim()) return;
    onChange([...countries, newCountry.trim()]);
    setNewCountry("");
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={newCountry}
          onChange={e => setNewCountry(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={t.addCountry}
          className="flex-1 px-3 py-2 text-[13px] bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
        />
        <button
          onClick={add}
          disabled={!newCountry.trim()}
          className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg transition-colors disabled:opacity-40 shrink-0"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {countries.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {countries.map((c, idx) => (
              <motion.div
                key={`${c}-${idx}`}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-[13px] font-medium"
              >
                <span className="text-neutral-800 dark:text-neutral-200">{c}</span>
                <div className="w-px h-3.5 bg-neutral-300 dark:bg-neutral-700 mx-0.5" />
                <button
                  onClick={() => onChange(countries.filter((_, i) => i !== idx))}
                  className="text-neutral-400 hover:text-red-500 transition-colors p-0.5 rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ProjectPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { language, mounted } = useLanguage();
  const t = mounted ? translations[language as keyof typeof translations] : translations.ru;

  const [project, setProject] = React.useState<Project | null>(null);
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // settings modal
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [editedName, setEditedName] = React.useState("");
  const [editedDetails, setEditedDetails] = React.useState<ProjectDetail[]>([]);
  const [isSaving, setIsSaving] = React.useState(false);
  const [savedOk, setSavedOk] = React.useState(false);

  React.useEffect(() => {
    if (!id) return;
    let alive = true;
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push("/login"); return; }
        setCurrentUserId(user.id);

        const { data, error } = await supabase
          .from("projects").select("*").eq("id", id).single();
        if (error) throw error;
        if (alive) { setProject(data as Project); setIsLoading(false); }
      } catch (error) {
        if (alive) {
          setError(getErrorMessage(error, "Failed to load project"));
          setIsLoading(false);
        }
      }
    })();
    return () => { alive = false; };
  }, [id, router]);

  const openSettings = () => {
    if (!project) return;
    setEditedName(project.name);
    setEditedDetails(project.details?.map((detail) => ({
      // Deep-clone details so edits don't mutate displayed data.
      name: detail.name,
      information: cloneDetailValue(detail.information),
    })) ?? []);
    setSavedOk(false);
    setSettingsOpen(true);
  };

  const handleDetailChange = (idx: number, value: ProjectDetailValue) => {
    setEditedDetails(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], information: value };
      return next;
    });
  };

  const handleSave = async () => {
    if (!project) return;
    const filteredDetails = filterRetentionDetails(editedDetails);
    setIsSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("projects")
        .update({ name: editedName, details: filteredDetails })
        .eq("id", project.id);
      if (error) throw error;
      setProject(prev => prev ? { ...prev, name: editedName, details: filteredDetails } : prev);
      setEditedDetails(filteredDetails);
      setSavedOk(true);
      toast.success(language === "ru" ? "Изменения сохранены" : "Changes saved");
      setTimeout(() => setSettingsOpen(false), 800);
    } catch (error) {
      toast.error(getErrorMessage(error, language === "ru" ? "Не удалось сохранить изменения" : "Failed to save changes"));
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted) return null;
  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full p-8">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
      <p className="text-neutral-500 text-sm font-medium">{t.loading}</p>
    </div>
  );
  if (error || !project) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full p-8 relative">
      <FolderGit2 className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mb-6" />
      <h2 className="text-xl font-bold tracking-tight mb-2 text-neutral-900 dark:text-neutral-100">{t.notFound}</h2>
      <Link href="/dashboard/projects" className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg text-sm font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" />{t.back}
      </Link>
    </div>
  );

  const isOwner = currentUserId === project.owner_id;

  const formatDate = (ds: string) =>
    new Date(ds).toLocaleDateString(language === "ru" ? "ru-RU" : "en-US", { month: "long", day: "numeric", year: "numeric" });

  const formatDetailValue = (detail: ProjectDetail): string => {
    if (typeof detail.information === "boolean")
      return detail.information ? (language === "ru" ? "Да" : "Yes") : (language === "ru" ? "Нет" : "No");
    if (isProductInfoList(detail.information)) {
      return detail.information
        .map((product) => product.name + (product.price ? ` (${product.price})` : ""))
        .join(", ");
    }
    if (Array.isArray(detail.information)) {
      return detail.information.join(", ");
    }
    return String(detail.information);
  };

  // ── retention helper: when the user toggles retention we must inject/remove sub-fields ──
  const handleRetentionToggle = (idx: number, val: boolean) => {
    setEditedDetails(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], information: val };

      // canonical labels used when storing details via the wizard
      const rdDescNames  = ["retention process", "процесс удержания", "retentiondesc"];
      const rdMetricNames = ["retention metrics", "метрики удержания", "retentionmetrics"];

      const hasDesc    = next.some(d => rdDescNames.includes(d.name.toLowerCase()));
      const hasMetrics = next.some(d => rdMetricNames.includes(d.name.toLowerCase()));

      if (val) {
        // Insert the two sub-fields right after retention if missing
        const insertAt = idx + 1;
        if (!hasDesc)    next.splice(insertAt,     0, { name: "Retention Process",  information: "" });
        if (!hasMetrics) next.splice(insertAt + (hasDesc ? 0 : 1), 0, { name: "Retention Metrics", information: "" });
      }
      // When setting to false we leave them in the array but the modal will skip rendering them
      // so on save they'll naturally be excluded — handled below via filteredDetails
      return next;
    });
  };

  return (
    <div className="w-full relative min-h-screen pb-20">
      <div className="p-4 md:p-8 max-w-[1200px] mx-auto w-full pt-8 relative z-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/projects" className="p-2 -ml-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-black dark:hover:text-white transition-colors" title={t.back}>
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">{project.name}</h1>
              <p className="text-[13px] text-neutral-500 mt-1">{t.created}: {formatDate(project.created_at)}</p>
            </div>
          </div>
          {isOwner && (
            <button
              onClick={openSettings}
              className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-md text-sm font-medium transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">{t.settings}</span>
            </button>
          )}
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Module button area ── */}
          <div className="lg:col-span-2 space-y-3">
            {/* Scripts module */}
            <Link
              href={`/dashboard/projects/${project.id}/scripts`}
              className="group flex items-center justify-between w-full bg-white dark:bg-[#000000] border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 rounded-xl px-5 py-4 transition-all hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center group-hover:bg-neutral-200 dark:group-hover:bg-neutral-800 transition-colors">
                  <svg className="w-4 h-4 text-neutral-500 dark:text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                  </svg>
                </div>
                <span className="text-[14px] font-semibold text-neutral-900 dark:text-neutral-100">{t.scripts}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-neutral-400 dark:text-neutral-600 font-medium">{t.notAdded}</span>
                <svg className="w-4 h-4 text-neutral-300 dark:text-neutral-700 group-hover:text-neutral-500 dark:group-hover:text-neutral-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </Link>
          </div>

          <div className="bg-white dark:bg-[#000000] border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm h-fit">
            <h3 className="text-[14px] font-semibold text-neutral-900 dark:text-neutral-100 mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-800 uppercase tracking-widest">
              {t.details}
            </h3>
            <div className="space-y-4">
              {project.details?.map((detail, idx) => {
                const key = getFieldKey(detail.name);

                // ── Products: render as chips ──
                if (key === "products" && isProductInfoList(detail.information) && detail.information.length > 0) {
                  return (
                    <div key={idx} className="flex flex-col gap-2">
                      <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                        {translateFieldName(detail.name, language)}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {detail.information.map((product, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800/70 rounded text-[11px] font-medium text-neutral-700 dark:text-neutral-300"
                          >
                            {product.name}
                            {product.price && (
                              <span className="text-neutral-400 dark:text-neutral-500 font-normal">· {product.price}</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                }

                // ── Countries: render as chips ──
                if (key === "countries" && isStringList(detail.information) && detail.information.length > 0) {
                  return (
                    <div key={idx} className="flex flex-col gap-2">
                      <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                        {translateFieldName(detail.name, language)}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {detail.information.map((c: string, i: number) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800/70 rounded text-[11px] font-medium text-neutral-700 dark:text-neutral-300"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                }

                const valStr = formatDetailValue(detail);
                if (!valStr || valStr === "0" || valStr === "false") return null;
                return (
                  <div key={idx} className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                      {translateFieldName(detail.name, language)}
                    </span>
                    <span className="text-[13px] text-neutral-900 dark:text-neutral-100 leading-relaxed font-medium">{valStr}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Settings Modal ── */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm dark:bg-black/70"
              onClick={() => setSettingsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="relative w-full max-w-2xl bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Rainbow top bar */}
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                    <Settings className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-100">{t.settingsTitle}</h2>
                    <p className="text-[12px] text-neutral-500 mt-0.5">{t.settingsDesc}</p>
                  </div>
                </div>
                <button onClick={() => setSettingsOpen(false)} className="p-2 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable body */}
              <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
                {/* Project name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">{t.projectName}</label>
                  <input
                    value={editedName}
                    onChange={e => setEditedName(e.target.value)}
                    className="w-full px-3 py-2 text-[14px] font-medium bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="border-t border-neutral-200 dark:border-neutral-800" />

                {/* Each detail field */}
                {(() => {
                  // Figure out if retention is currently true so we can show/hide sub-fields
                  const retentionDetail = editedDetails.find(d => getFieldKey(d.name) === "retention");
                  const retentionOn = retentionDetail?.information === true;
                  const retentionSubKeys = new Set(["retentionDesc", "retentionMetrics"]);

                  return editedDetails.map((detail, idx) => {
                    const key = getFieldKey(detail.name);
                    // Hide retention sub-fields when retention = false
                    if (!retentionOn && key && retentionSubKeys.has(key)) return null;

                    const label = translateFieldName(detail.name, language);
                    const isBoolean = typeof detail.information === "boolean";
                    const isRetentionField = key === "retention";
                    const isProducts = key === "products";
                    const isCountries = key === "countries";
                    const isStringArray = !isProducts && !isCountries && isStringList(detail.information);

                    return (
                      <div key={idx} className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">{label}</label>

                        {isBoolean ? (
                          <div className="flex items-center gap-3">
                            {[true, false].map((val) => (
                              <button
                                key={String(val)}
                                onClick={() =>
                                  isRetentionField
                                    ? handleRetentionToggle(idx, val)
                                    : handleDetailChange(idx, val)
                                }
                                className={cn(
                                  "flex-1 py-2 rounded-lg text-[13px] font-medium border transition-colors",
                                  detail.information === val
                                    ? val
                                      ? "bg-blue-500 border-blue-500 text-white"
                                      : "bg-neutral-900 dark:bg-white border-neutral-900 dark:border-white text-white dark:text-black"
                                    : "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400"
                                )}
                              >
                                {val
                                  ? (language === "ru" ? "Да" : "Yes")
                                  : (language === "ru" ? "Нет" : "No")}
                              </button>
                            ))}
                          </div>
                        ) : isProducts ? (
                          <ProductsEditor
                            products={isProductInfoList(detail.information) ? detail.information : []}
                            onChange={v => handleDetailChange(idx, v)}
                            lang={language}
                          />
                        ) : isCountries ? (
                          <CountriesEditor
                            countries={isStringList(detail.information) ? detail.information : []}
                            onChange={v => handleDetailChange(idx, v)}
                            lang={language}
                          />
                        ) : (
                          <textarea
                            rows={String(detail.information).length > 120 ? 4 : 2}
                            value={isStringArray
                              ? (detail.information as string[]).join(", ")
                              : String(detail.information)}
                            onChange={e => handleDetailChange(idx, e.target.value)}
                            className="w-full px-3 py-2 text-[13px] bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors resize-none"
                          />
                        )}
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 shrink-0 flex items-center justify-end gap-3">
                <button onClick={() => setSettingsOpen(false)} className="px-4 py-2 text-[13px] font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                  {t.cancel}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || savedOk}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-medium transition-all",
                    savedOk
                      ? "bg-emerald-500 text-white"
                      : "bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-60"
                  )}
                >
                  {isSaving ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" />{t.saving}</>
                  ) : savedOk ? (
                    <><Check className="w-3.5 h-3.5" />{t.saved}</>
                  ) : (
                    <><Save className="w-3.5 h-3.5" />{t.save}</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
