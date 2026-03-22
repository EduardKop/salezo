"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowRight, Loader2, Edit2, Plus, X, LayoutList, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";
import { PageLoader } from "@/components/ui/page-loader";
import type { ProductInfo } from "@/lib/projects";

import { newProject as translations, common, t as getT, type Language } from "@/lib/i18n/translations";

export default function NewProjectPage() {
  const router = useRouter();
  const { language, mounted } = useLanguage();
  const t = mounted ? getT(translations, language as Language) : translations.ru;
  const c = mounted ? getT(common, language as Language) : common.ru;

  const [step, setStep] = React.useState(1);
  const [viewMode, setViewMode] = React.useState<"wizard" | "list">("wizard");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    products: [] as ProductInfo[],
    priceFrom: "",
    priceTo: "",
    hasRetention: null as boolean | null,
    retentionDescription: "",
    retentionMetrics: "",
    currentProblems: "",
    description: "",
    salesProcess: "",
    countries: [] as string[],
  });
  const [currentProductName, setCurrentProductName] = React.useState("");
  const [currentProductPrice, setCurrentProductPrice] = React.useState("");
  const [currentCountry, setCurrentCountry] = React.useState("");

  const addProduct = () => {
    if (currentProductName.trim()) {
      setFormData((prev) => ({
        ...prev,
        products: [...prev.products, { name: currentProductName.trim(), price: currentProductPrice.trim() }],
      }));
      setCurrentProductName("");
      setCurrentProductPrice("");
    }
  };

  const removeProduct = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const addCountry = () => {
    if (currentCountry.trim()) {
      setFormData((prev) => ({
        ...prev,
        countries: [...prev.countries, currentCountry.trim()],
      }));
      setCurrentCountry("");
    }
  };

  const removeCountry = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      countries: prev.countries.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const checkIsStepValid = (sId: string) => {
    switch (sId) {
      case "name":
        return formData.name.trim().length > 2;
      case "products":
        return formData.products.length > 0;
      case "price":
        return formData.priceFrom.trim() !== "" && formData.priceTo.trim() !== "";
      case "description":
        return formData.description.trim().length > 5;
      case "retention":
        return formData.hasRetention !== null;
      case "retentionDesc":
        return formData.retentionDescription.trim().length > 5;
      case "retentionMetrics":
        return formData.retentionMetrics.trim().length > 1;
      case "problems":
        return formData.currentProblems.trim().length > 5;
      case "salesProcess":
        return formData.salesProcess.trim().length > 5;
      case "countries":
        return formData.countries.length > 0;
      default:
        return false;
    }
  };

  const isListViewValid = () =>
    formData.name.trim().length > 2 &&
    formData.products.length > 0 &&
    formData.priceFrom.trim() !== "" &&
    formData.priceTo.trim() !== "" &&
    formData.description.trim().length > 5 &&
    formData.hasRetention !== null &&
    (formData.hasRetention === false || (
      formData.retentionDescription.trim().length > 5 &&
      formData.retentionMetrics.trim().length > 1
    )) &&
    formData.currentProblems.trim().length > 5 &&
    formData.salesProcess.trim().length > 5 &&
    formData.countries.length > 0;

  const baseSteps = [
    { id: "name", title: t.steps.name.title, desc: t.steps.name.desc },
    { id: "products", title: t.steps.products.title, desc: t.steps.products.desc },
    { id: "price", title: t.steps.price.title, desc: t.steps.price.desc },
    { id: "description", title: t.steps.description.title, desc: t.steps.description.desc },
    { id: "retention", title: t.steps.retention.title, desc: t.steps.retention.desc },
    ...(formData.hasRetention
      ? [
          { id: "retentionDesc", title: t.steps.retentionDesc.title, desc: t.steps.retentionDesc.desc },
          { id: "retentionMetrics", title: t.steps.retentionMetrics.title, desc: t.steps.retentionMetrics.desc },
        ]
      : []),
    { id: "problems", title: t.steps.problems.title, desc: t.steps.problems.desc },
    { id: "salesProcess", title: t.steps.salesProcess.title, desc: t.steps.salesProcess.desc },
    { id: "countries", title: t.steps.countries.title, desc: t.steps.countries.desc },
  ];

  // Assign numbers dynamically based on actual steps in play
  const steps = baseSteps.map((s, idx) => ({ ...s, num: idx + 1 }));

  const currentStepData = steps.find((s) => s.num === step);
  const isValid = currentStepData ? checkIsStepValid(currentStepData.id) : false;

  const handleNext = () => {
    if (step < steps.length) {
      setStep(step + 1);
      setTimeout(() => {
        window.scrollTo({ top: window.scrollY + 150, behavior: "smooth" });
      }, 100);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData?.user) {
        throw new Error("You must be logged in to create a project.");
      }

      const details = [
        { name: t.steps.products.title, information: formData.products },
        { name: t.steps.price.title, information: `${formData.priceFrom} - ${formData.priceTo}` },
        { name: t.steps.description.title, information: formData.description },
        { name: t.steps.retention.title, information: formData.hasRetention },
        ...(formData.hasRetention ? [
          { name: t.steps.retentionDesc.title, information: formData.retentionDescription },
          { name: t.steps.retentionMetrics.title, information: formData.retentionMetrics }
        ] : []),
        { name: t.steps.problems.title, information: formData.currentProblems },
        { name: t.steps.salesProcess.title, information: formData.salesProcess },
        { name: t.steps.countries.title, information: formData.countries }
      ];

      const { error: insertError } = await supabase
        .from("projects")
        .insert({
          name: formData.name,
          owner_id: userData.user.id,
          details: details
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      router.push("/sales-agents/projects");
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error(language === 'ru' ? "Не удалось создать проект" : "Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderValueSummary = (sId: string) => {
    switch (sId) {
      case "products":
        return formData.products.length > 0 
          ? formData.products.map(p => p.price ? `${p.name} (${p.price})` : p.name).join(", ") 
          : c.notProvided;
      case "price":
        return formData.priceFrom && formData.priceTo ? `${formData.priceFrom} - ${formData.priceTo}` : c.notProvided;
      case "retention":
        return formData.hasRetention === true ? c.yes : formData.hasRetention === false ? c.no : c.notProvided;
      case "retentionDesc":
        return formData.retentionDescription || c.notProvided;
      case "retentionMetrics":
        return formData.retentionMetrics || c.notProvided;
      case "problems":
        return formData.currentProblems || c.notProvided;
      case "countries":
        return formData.countries.length > 0 ? formData.countries.join(", ") : c.notProvided;
      default:
        return (formData[sId as keyof typeof formData] as string) || c.notProvided;
    }
  };

  if (!mounted) {
    return <PageLoader className="min-h-[calc(100vh-5rem)]" />;
  }

  return (
    <>
      <div className="p-4 md:p-8 max-w-3xl mx-auto w-full pt-20 lg:pt-28 mb-32 cursor-default relative z-0">
        {/* ── Minimal header ── */}
      <div className="mb-6 text-center relative z-10">
        <h1 className="text-xl font-semibold tracking-tight text-black dark:text-white">
          {t.header}
        </h1>
      </div>

      {/* ── View toggle (no top gap) ── */}
      <div className="flex justify-center mb-8 relative z-10">
        <div className="inline-flex items-center bg-neutral-100 dark:bg-neutral-900 rounded-xl p-1 gap-1">
          <button
            onClick={() => setViewMode("wizard")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
              viewMode === "wizard"
                ? "bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            )}
          >
            <Wand2 className="w-4 h-4" />
            {language === "ru" ? "Пошагово" : "Step by step"}
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
              viewMode === "list"
                ? "bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            )}
          >
            <LayoutList className="w-4 h-4" />
            {language === "ru" ? "Все сразу" : "All at once"}
          </button>
        </div>
      </div>

      {viewMode === "wizard" && <div className="relative">
        <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-neutral-200 dark:bg-neutral-800 rounded-full" />

        <motion.div
          className="absolute left-[27px] top-6 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full z-0"
          initial={{ height: "0%" }}
          animate={{
            height: `${((step - 1) / (steps.length - 1)) * 100}%`,
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />

        <LayoutGroup>
          <div className="space-y-6 relative z-10 w-full flex flex-col items-center">
            <AnimatePresence>
              {steps.map((s) => {
                const isPast = step > s.num;
                const isActive = step === s.num;

                // Color mappings
                const cMap = [
                  "from-blue-500/10 to-purple-500/10",
                  "from-purple-500/10 to-pink-500/10",
                  "from-pink-500/10 to-rose-500/10",
                  "from-rose-500/10 to-orange-500/10",
                  "from-orange-500/10 to-amber-500/10",
                  "from-amber-500/10 to-yellow-500/10",
                  "from-yellow-500/10 to-lime-500/10",
                  "from-lime-500/10 to-green-500/10",
                  "from-green-500/10 to-emerald-500/10",
                ];
                const glowColor = cMap[(s.num - 1) % cMap.length];

                return (
                  <motion.div
                    key={s.id}
                    layout="position"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                    className={cn(
                      "flex gap-6 w-full max-w-3xl transition-all duration-500",
                      isActive ? "opacity-100" : isPast ? "opacity-80" : "opacity-30 blur-[2px] pointer-events-none"
                    )}
                  >
                    <StepIndicator currentStep={step} thisStep={s.num} />

                    <div className="flex-1 relative w-full">
                      {isActive && (
                        <div
                          className={cn(
                            "absolute -inset-4 bg-gradient-to-r blur-xl rounded-[2rem] -z-10 animate-pulse-slow",
                            glowColor
                          )}
                        />
                      )}

                      <motion.div
                        layout
                        style={isPast ? { height: 90 } : {}}
                        className={cn(
                          "bg-white dark:bg-[#111] border border-black/5 dark:border-white/5 rounded-2xl shadow-lg shadow-black/5 dark:shadow-white/5 overflow-hidden w-full relative",
                          isPast ? "flex items-center px-5" : "p-6"
                        )}
                      >
                        <AnimatePresence mode="popLayout" initial={false}>
                          {isPast ? (
                            <motion.div
                              key="compact"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.3 }}
                              className="flex justify-between items-center w-full"
                            >
                              <div className="flex-1 mr-4 overflow-hidden">
                                <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 truncate">
                                  {s.title}
                                </h4>
                                <p className="text-sm md:text-base text-black dark:text-white font-medium truncate">
                                  {renderValueSummary(s.id)}
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  setStep(s.num);
                                  window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                                className="p-2 text-neutral-400 hover:text-black dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 rounded-lg transition-colors shrink-0"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="full"
                              initial={{ opacity: 0, y: 30 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -30 }}
                              transition={{ duration: 0.4 }}
                              className="flex flex-col w-full"
                            >
                              <motion.h3
                                layout="position"
                                className="text-xl font-semibold mb-1 text-black dark:text-white"
                              >
                                {s.title}
                              </motion.h3>
                              <motion.p layout="position" className="text-sm text-neutral-500 mb-6">
                                {s.desc}
                              </motion.p>

                              {s.id === "name" && (
                                <input
                                  type="text"
                                  placeholder={t.steps.name.placeholder}
                                  value={formData.name}
                                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                  disabled={!isActive}
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && isValid) handleNext();
                                  }}
                                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-black dark:text-white placeholder:text-neutral-400 disabled:opacity-50"
                                />
                              )}

                              {s.id === "products" && (
                                <div className="space-y-4">
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      placeholder={t.steps.products.placeholder}
                                      value={currentProductName}
                                      onChange={(e) => setCurrentProductName(e.target.value)}
                                      disabled={!isActive}
                                      autoFocus
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault();
                                          if (currentProductName.trim()) addProduct();
                                          else if (isValid) handleNext();
                                        }
                                      }}
                                      className="flex-[1.2] px-4 py-3 bg-neutral-50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-black dark:text-white placeholder:text-neutral-400 disabled:opacity-50"
                                    />
                                    <input
                                      type="text"
                                      placeholder={t.steps.products.pricePlaceholder}
                                      value={currentProductPrice}
                                      onChange={(e) => setCurrentProductPrice(e.target.value)}
                                      disabled={!isActive}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault();
                                          if (currentProductName.trim()) addProduct();
                                          else if (isValid) handleNext();
                                        }
                                      }}
                                      className="flex-[2] px-4 py-3 bg-neutral-50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-black dark:text-white placeholder:text-neutral-400 placeholder:text-sm disabled:opacity-50"
                                    />
                                    <button
                                      onClick={addProduct}
                                      disabled={!currentProductName.trim() || !isActive}
                                      className="px-4 py-3 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-black dark:text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center shrink-0"
                                    >
                                      <Plus className="w-5 h-5" />
                                    </button>
                                  </div>

                                  {formData.products.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                      <AnimatePresence>
                                        {formData.products.map((product, idx) => (
                                          <motion.div
                                            key={`${product.name}-${idx}`}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 border border-black/5 dark:border-white/5 rounded-lg text-sm font-medium"
                                          >
                                            <span className="text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                                              <span>{product.name}</span>
                                              {product.price && (
                                                <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded text-xs">
                                                  {product.price}
                                                </span>
                                              )}
                                            </span>
                                            <div className="w-px h-3.5 bg-neutral-300 dark:bg-neutral-700 mx-1" />
                                            <button
                                              onClick={() => removeProduct(idx)}
                                              className="text-neutral-400 hover:text-red-500 transition-colors p-0.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                                            >
                                              <X className="w-3.5 h-3.5" />
                                            </button>
                                          </motion.div>
                                        ))}
                                      </AnimatePresence>
                                    </div>
                                  )}
                                </div>
                              )}

                              {s.id === "price" && (
                                <div className="space-y-3">
                                  <div className="flex gap-4">
                                    <input
                                      type="text"
                                      placeholder={t.steps.price.from}
                                      value={formData.priceFrom}
                                      onChange={(e) => setFormData({ ...formData, priceFrom: e.target.value })}
                                      disabled={!isActive}
                                      autoFocus
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter" && isValid) handleNext();
                                      }}
                                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all text-black dark:text-white placeholder:text-neutral-400 disabled:opacity-50"
                                    />
                                    <div className="flex items-center text-neutral-400">—</div>
                                    <input
                                      type="text"
                                      placeholder={t.steps.price.to}
                                      value={formData.priceTo}
                                      onChange={(e) => setFormData({ ...formData, priceTo: e.target.value })}
                                      disabled={!isActive}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter" && isValid) handleNext();
                                      }}
                                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all text-black dark:text-white placeholder:text-neutral-400 disabled:opacity-50"
                                    />
                                  </div>
                                  <p className="text-xs text-neutral-400 flex items-center gap-1.5">
                                    <span>💡</span>
                                    <span>{t.steps.price.hint}</span>
                                  </p>
                                </div>
                              )}

                              {s.id === "description" && (
                                <textarea
                                  placeholder={t.steps.description.placeholder}
                                  value={formData.description}
                                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                  disabled={!isActive}
                                  rows={3}
                                  autoFocus
                                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all text-black dark:text-white placeholder:text-neutral-400 disabled:opacity-50 resize-none"
                                />
                              )}

                              {s.id === "retention" && (
                                <div className="flex gap-4">
                                  <button
                                    onClick={() => {
                                      setFormData({ ...formData, hasRetention: true });
                                      setTimeout(() => {
                                        setStep(step + 1);
                                      }, 300);
                                    }}
                                    className={cn(
                                      "flex-1 p-4 rounded-xl border-2 transition-all font-medium text-lg",
                                      formData.hasRetention === true
                                        ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-400"
                                        : "border-black/5 dark:border-white/5 bg-neutral-50 dark:bg-black/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-black dark:text-white"
                                    )}
                                  >
                                    {c.yes}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setFormData({ ...formData, hasRetention: false });
                                      setTimeout(() => {
                                        setStep(step + 1);
                                      }, 300);
                                    }}
                                    className={cn(
                                      "flex-1 p-4 rounded-xl border-2 transition-all font-medium text-lg",
                                      formData.hasRetention === false
                                        ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-400"
                                        : "border-black/5 dark:border-white/5 bg-neutral-50 dark:bg-black/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-black dark:text-white"
                                    )}
                                  >
                                    {c.no}
                                  </button>
                                </div>
                              )}

                              {s.id === "retentionDesc" && (
                                <textarea
                                  placeholder={t.steps.retentionDesc.placeholder}
                                  value={formData.retentionDescription}
                                  onChange={(e) =>
                                    setFormData({ ...formData, retentionDescription: e.target.value })
                                  }
                                  disabled={!isActive}
                                  rows={3}
                                  autoFocus
                                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-black dark:text-white placeholder:text-neutral-400 disabled:opacity-50 resize-none"
                                />
                              )}

                              {s.id === "retentionMetrics" && (
                                <textarea
                                  placeholder={t.steps.retentionMetrics.placeholder}
                                  value={formData.retentionMetrics}
                                  onChange={(e) =>
                                    setFormData({ ...formData, retentionMetrics: e.target.value })
                                  }
                                  disabled={!isActive}
                                  rows={2}
                                  autoFocus
                                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-black dark:text-white placeholder:text-neutral-400 disabled:opacity-50 resize-none"
                                />
                              )}

                              {s.id === "problems" && (
                                <textarea
                                  placeholder={t.steps.problems.placeholder}
                                  value={formData.currentProblems}
                                  onChange={(e) => setFormData({ ...formData, currentProblems: e.target.value })}
                                  disabled={!isActive}
                                  rows={4}
                                  autoFocus
                                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all text-black dark:text-white placeholder:text-neutral-400 disabled:opacity-50 resize-none"
                                />
                              )}

                              {s.id === "salesProcess" && (
                                <textarea
                                  placeholder={t.steps.salesProcess.placeholder}
                                  value={formData.salesProcess}
                                  onChange={(e) => setFormData({ ...formData, salesProcess: e.target.value })}
                                  disabled={!isActive}
                                  rows={4}
                                  autoFocus
                                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-black dark:text-white placeholder:text-neutral-400 disabled:opacity-50 resize-none"
                                />
                              )}

                              {s.id === "countries" && (
                                <div className="space-y-4">
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      placeholder={t.steps.countries.placeholder}
                                      value={currentCountry}
                                      onChange={(e) => setCurrentCountry(e.target.value)}
                                      disabled={!isActive}
                                      autoFocus
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault();
                                          if (currentCountry.trim()) addCountry();
                                          else if (isValid) handleNext();
                                        }
                                      }}
                                      className="flex-1 px-4 py-3 bg-neutral-50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-black dark:text-white placeholder:text-neutral-400 disabled:opacity-50"
                                    />
                                    <button
                                      onClick={addCountry}
                                      disabled={!currentCountry.trim() || !isActive}
                                      className="px-4 py-3 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-black dark:text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center shrink-0"
                                    >
                                      <Plus className="w-5 h-5" />
                                    </button>
                                  </div>

                                  {formData.countries.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                      <AnimatePresence>
                                        {formData.countries.map((country, idx) => (
                                          <motion.div
                                            key={`${country}-${idx}`}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 border border-black/5 dark:border-white/5 rounded-lg text-sm font-medium"
                                          >
                                            <span className="text-neutral-800 dark:text-neutral-200">{country}</span>
                                            <div className="w-px h-3.5 bg-neutral-300 dark:bg-neutral-700 mx-1" />
                                            <button
                                              onClick={() => removeCountry(idx)}
                                              className="text-neutral-400 hover:text-red-500 transition-colors p-0.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                                            >
                                              <X className="w-3.5 h-3.5" />
                                            </button>
                                          </motion.div>
                                        ))}
                                      </AnimatePresence>
                                    </div>
                                  )}
                                </div>
                              )}

                              <motion.div
                                layout="position"
                                className="mt-6 flex justify-between items-center"
                              >
                                {s.num > 1 ? (
                                  <button
                                    onClick={() => {
                                      setStep(s.num - 1);
                                      window.scrollTo({ top: 0, behavior: "smooth" });
                                    }}
                                    className="text-sm text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
                                    disabled={isSubmitting}
                                  >
                                    {c.back}
                                  </button>
                                ) : (
                                  <span />
                                )}

                                {s.num < steps.length ? (
                                  <NextButton onClick={handleNext} disabled={!checkIsStepValid(s.id)} label={c.continue} />
                                ) : (
                                  <button
                                    onClick={handleSubmit}
                                    disabled={!checkIsStepValid(s.id) || isSubmitting}
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-2.5 rounded-xl font-medium transition-all focus:outline-none shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:scale-100 hover:scale-105 active:scale-95"
                                  >
                                    {isSubmitting ? (
                                      <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {t.creating}
                                      </>
                                    ) : (
                                      <>
                                        <Check className="w-4 h-4" />
                                        {t.createProject}
                                      </>
                                    )}
                                  </button>
                                )}
                              </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </LayoutGroup>
      </div>}

      {/* ── List / Notion-style view ── */}
      {viewMode === "list" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#111] border border-black/5 dark:border-white/5 rounded-2xl shadow-lg overflow-hidden"
        >
          {/* Name */}
          <ListRow label={t.steps.name.title} description={t.steps.name.desc}>
            <div className="w-full">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t.steps.name.placeholder}
                className="w-full bg-transparent text-sm text-black dark:text-white placeholder:text-neutral-400 focus:outline-none"
              />
              {formData.name.length > 0 && formData.name.trim().length <= 2 && (
                <span className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-red-500"/> {language === "ru" ? "Слишком коротко, минимум 3 символа" : "Too short, minimum 3 characters"}</span>
              )}
            </div>
          </ListRow>

          {/* Products */}
          <ListRow label={t.steps.products.title} description={t.steps.products.desc}>
            <div className="space-y-3 w-full">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentProductName}
                  onChange={(e) => setCurrentProductName(e.target.value)}
                  placeholder={t.steps.products.placeholder}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (currentProductName.trim()) addProduct(); } }}
                  className="flex-[1.2] px-3 py-2 bg-neutral-50 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg text-sm text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                />
                <input
                  type="text"
                  value={currentProductPrice}
                  onChange={(e) => setCurrentProductPrice(e.target.value)}
                  placeholder={t.steps.products.pricePlaceholder}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (currentProductName.trim()) addProduct(); } }}
                  className="flex-[2] px-3 py-2 bg-neutral-50 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg text-sm text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                />
                <button onClick={addProduct} disabled={!currentProductName.trim()} className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-black dark:text-white rounded-lg transition-colors disabled:opacity-40 shrink-0">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {formData.products.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.products.map((p, idx) => (
                    <span key={idx} className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-sm">
                      <span className="text-black dark:text-white">{p.name}</span>
                      {p.price && <span className="text-purple-600 dark:text-purple-400 text-xs">({p.price})</span>}
                      <button onClick={() => removeProduct(idx)} className="text-neutral-400 hover:text-red-500 transition-colors ml-0.5"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </ListRow>

          {/* Price */}
          <ListRow label={t.steps.price.title} description={t.steps.price.desc}>
            <div className="flex items-center gap-3 w-full">
              <input type="text" value={formData.priceFrom} onChange={(e) => setFormData({ ...formData, priceFrom: e.target.value })} placeholder={t.steps.price.from}
                className="flex-1 bg-transparent text-sm text-black dark:text-white placeholder:text-neutral-400 focus:outline-none" />
              <span className="text-neutral-400 shrink-0">—</span>
              <input type="text" value={formData.priceTo} onChange={(e) => setFormData({ ...formData, priceTo: e.target.value })} placeholder={t.steps.price.to}
                className="flex-1 bg-transparent text-sm text-black dark:text-white placeholder:text-neutral-400 focus:outline-none" />
            </div>
          </ListRow>

          {/* Description */}
          <ListRow label={t.steps.description.title} description={t.steps.description.desc}>
            <div className="w-full">
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t.steps.description.placeholder} rows={3}
                className="w-full bg-transparent text-sm text-black dark:text-white placeholder:text-neutral-400 focus:outline-none resize-none" />
              {formData.description.length > 0 && formData.description.trim().length <= 5 && (
                <span className="text-red-500 text-xs mt-1 font-medium flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-red-500"/> {language === "ru" ? "Слишком коротко, нужно минимум 5 символов" : "Too short, minimum 5 characters"}</span>
              )}
            </div>
          </ListRow>

          {/* Retention */}
          <ListRow label={t.steps.retention.title} description={t.steps.retention.desc}>
            <div className="flex gap-3">
              <button onClick={() => setFormData({ ...formData, hasRetention: true })}
                className={cn("px-4 py-1.5 rounded-lg border text-sm font-medium transition-all",
                  formData.hasRetention === true ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300" : "border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:border-black/20 dark:hover:border-white/20")}>
                {c.yes}
              </button>
              <button onClick={() => setFormData({ ...formData, hasRetention: false })}
                className={cn("px-4 py-1.5 rounded-lg border text-sm font-medium transition-all",
                  formData.hasRetention === false ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300" : "border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:border-black/20 dark:hover:border-white/20")}>
                {c.no}
              </button>
            </div>
          </ListRow>

          {/* Retention fields - conditional */}
          {formData.hasRetention && (<>
            <ListRow label={t.steps.retentionDesc.title} description={t.steps.retentionDesc.desc}>
              <div className="w-full">
                <textarea value={formData.retentionDescription} onChange={(e) => setFormData({ ...formData, retentionDescription: e.target.value })}
                  placeholder={t.steps.retentionDesc.placeholder} rows={3}
                  className="w-full bg-transparent text-sm text-black dark:text-white placeholder:text-neutral-400 focus:outline-none resize-none" />
                {formData.retentionDescription.length > 0 && formData.retentionDescription.trim().length <= 5 && (
                  <span className="text-red-500 text-xs mt-1 font-medium flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-red-500"/> {language === "ru" ? "Слишком коротко, нужно минимум 5 символов" : "Too short, minimum 5 characters"}</span>
                )}
              </div>
            </ListRow>
            <ListRow label={t.steps.retentionMetrics.title} description={t.steps.retentionMetrics.desc}>
              <div className="w-full">
                <textarea value={formData.retentionMetrics} onChange={(e) => setFormData({ ...formData, retentionMetrics: e.target.value })}
                  placeholder={t.steps.retentionMetrics.placeholder} rows={2}
                  className="w-full bg-transparent text-sm text-black dark:text-white placeholder:text-neutral-400 focus:outline-none resize-none" />
                {formData.retentionMetrics.length > 0 && formData.retentionMetrics.trim().length <= 1 && (
                  <span className="text-red-500 text-xs mt-1 font-medium flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-red-500"/> {language === "ru" ? "Заполните поле" : "Please fill out this field"}</span>
                )}
              </div>
            </ListRow>
          </>)}

          {/* Problems */}
          <ListRow label={t.steps.problems.title} description={t.steps.problems.desc}>
            <div className="w-full">
              <textarea value={formData.currentProblems} onChange={(e) => setFormData({ ...formData, currentProblems: e.target.value })}
                placeholder={t.steps.problems.placeholder} rows={3}
                className="w-full bg-transparent text-sm text-black dark:text-white placeholder:text-neutral-400 focus:outline-none resize-none" />
              {formData.currentProblems.length > 0 && formData.currentProblems.trim().length <= 5 && (
                <span className="text-red-500 text-xs mt-1 font-medium flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-red-500"/> {language === "ru" ? "Слишком коротко, нужно минимум 5 символов" : "Too short, minimum 5 characters"}</span>
              )}
            </div>
          </ListRow>

          {/* Sales process */}
          <ListRow label={t.steps.salesProcess.title} description={t.steps.salesProcess.desc}>
            <div className="w-full">
              <textarea value={formData.salesProcess} onChange={(e) => setFormData({ ...formData, salesProcess: e.target.value })}
                placeholder={t.steps.salesProcess.placeholder} rows={3}
                className="w-full bg-transparent text-sm text-black dark:text-white placeholder:text-neutral-400 focus:outline-none resize-none" />
              {formData.salesProcess.length > 0 && formData.salesProcess.trim().length <= 5 && (
                <span className="text-red-500 text-xs mt-1 font-medium flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-red-500"/> {language === "ru" ? "Слишком коротко, нужно минимум 5 символов" : "Too short, minimum 5 characters"}</span>
              )}
            </div>
          </ListRow>

          {/* Countries */}
          <ListRow label={t.steps.countries.title} description={t.steps.countries.desc}>
            <div className="space-y-3 w-full">
              <div className="flex gap-2">
                <input type="text" value={currentCountry} onChange={(e) => setCurrentCountry(e.target.value)}
                  placeholder={t.steps.countries.placeholder}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (currentCountry.trim()) addCountry(); } }}
                  className="flex-1 bg-transparent text-sm text-black dark:text-white placeholder:text-neutral-400 focus:outline-none" />
                <button onClick={addCountry} disabled={!currentCountry.trim()} className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-black dark:text-white rounded-lg transition-colors disabled:opacity-40 shrink-0">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {formData.countries.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.countries.map((c, idx) => (
                    <span key={idx} className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-sm text-black dark:text-white">
                      {c}
                      <button onClick={() => removeCountry(idx)} className="text-neutral-400 hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </ListRow>

          {/* Submit bar */}
          <div className="px-5 py-4 bg-neutral-50 dark:bg-neutral-900/60 flex justify-between items-center border-t border-black/5 dark:border-white/5">
            <span className="text-xs text-neutral-400">
              {isListViewValid()
                ? (language === "ru" ? "✓ Готово к созданию" : "✓ Ready to create")
                : (language === "ru" ? "Заполните все поля" : "Fill in all required fields")}
            </span>
            <button
              onClick={handleSubmit}
              disabled={!isListViewValid() || isSubmitting}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2 rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 hover:scale-105 active:scale-95"
            >
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />{t.creating}</> : <><Check className="w-4 h-4" />{t.createProject}</>}
            </button>
          </div>
        </motion.div>
      )}
      </div>
    </>
  );
}

// Subcomponents

function StepIndicator({ currentStep, thisStep }: { currentStep: number; thisStep: number }) {
  const isPast = currentStep > thisStep;
  const isActive = currentStep === thisStep;

  return (
    <div className="relative mt-2 shrink-0 z-10 py-1">
      <motion.div
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg border-2 transition-all duration-500",
          isPast
            ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-lg"
            : isActive
            ? "bg-white dark:bg-black text-blue-600 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] shadow-blue-500/20"
            : "bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-400"
        )}
        animate={isActive ? { scale: [1, 1.05, 1] } : { scale: 1 }}
        transition={{ repeat: isActive ? Infinity : 0, duration: 2 }}
      >
        {isPast ? <Check className="w-6 h-6" /> : thisStep}
      </motion.div>

      {/* Outer Glow Ring for active step */}
      {isActive && (
        <div
          className="absolute inset-0 top-1 rounded-full border border-blue-500/30 w-14 h-14 animate-ping"
          style={{ animationDuration: "3s" }}
        />
      )}
    </div>
  );
}

function NextButton({ onClick, disabled, label }: { onClick: () => void; disabled: boolean, label: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all focus:outline-none",
        disabled
          ? "bg-neutral-100 dark:bg-neutral-900 text-neutral-400 cursor-not-allowed"
          : "bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 hover:scale-105 active:scale-95 shadow-md"
      )}
    >
      {label}
      <ArrowRight className="w-4 h-4" />
    </button>
  );
}

function ListRow({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex border-b border-black/5 dark:border-white/5 last:border-0 hover:bg-neutral-50/60 dark:hover:bg-white/[0.015] transition-colors group">
      <div className="w-[210px] shrink-0 px-5 py-4 border-r border-black/5 dark:border-white/5">
        <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300 leading-tight">{label}</div>
        <div className="text-xs text-neutral-400 mt-1 leading-relaxed">{description}</div>
      </div>
      <div className="flex-1 px-4 py-4 flex items-start">
        {children}
      </div>
    </div>
  );
}
