/**
 * Central i18n translations for Salezo.
 * Add all new keys here — never inline translations in components.
 */
import type { Language } from "@/lib/i18n/config";
export type { Language } from "@/lib/i18n/config";

// ─── Common (shared across pages) ─────────────────────────────────────────────
export const common = {
  en: {
    save:        "Save",
    cancel:      "Cancel",
    close:       "Close",
    confirm:     "Confirm",
    loading:     "Loading...",
    error:       "Error",
    success:     "Success",
    back:        "Back",
    continue:    "Continue",
    yes:         "Yes",
    no:          "No",
    notProvided: "Not provided",
  },
  ru: {
    save:        "Сохранить",
    cancel:      "Отмена",
    close:       "Закрыть",
    confirm:     "Подтвердить",
    loading:     "Загрузка...",
    error:       "Ошибка",
    success:     "Успешно",
    back:        "Назад",
    continue:    "Продолжить",
    yes:         "Да",
    no:          "Нет",
    notProvided: "Не указано",
  },
} as const;

// ─── Sidebar ───────────────────────────────────────────────────────────────────
export const sidebar = {
  en: {
    dashboard:      "Dashboard",
    projectsTitle:  "Sales Projects",
    newProject:     "New Project",
    connectProject: "Connect Project",
    showAll:        "Show all",
    loading:        "Loading...",
  },
  ru: {
    dashboard:      "Дашборд",
    projectsTitle:  "Проекты Продаж",
    newProject:     "Новый Проект",
    connectProject: "Подключить Проект",
    showAll:        "Все проекты",
    loading:        "Загрузка...",
  },
} as const;

// ─── Projects Page ─────────────────────────────────────────────────────────────
export const projects = {
  en: {
    pageTitle:         "Sales Projects",
    pageDesc:          "Add projects to boost sales, manage the sales process, create vector databases and scripts to assist managers and executives.",
    missionLabel:      "Mission",
    salesProcessLabel: "Sales Process",
    stagesLabel:       "Stages",
    stageProject:      "Project",
    stageScripts:      "Scripts",
    stageAssistant:    "Message assistant",
    stageAgents:       "Script agents",
    stageVector:       "Vector database",
    connected:         "Connected",
    notConnected:      "Not connected",
    newProject:        "New Project",
    connectProject:    "Connect Project",
    global:            "Global",
    noDesc:            "No description provided.",
    priceRange:        "Price Range",
    markets:           "Markets",
    focusArea:         "Focus Area",
    created:           "Created",
    items:             "Items",
    projectAccess:     "Project Access",
    accessDesc:        "Share this security key with your team members to grant them access to this project.",
    connectionKey:     "Connection Key",
    copy:              "Copy",
    copied:            "Copied!",
    activeMembers:     "Active Members",
    projectOwner:      "Project Owner",
    workspaceCTA:      "create a new project workspace",
    emptyDesc:         "Manage all your existing projects here or create a new workspace to start tracking and analyzing your data.",
    createProjectBtn:  "Create Project",
    pendingRequests:   "Pending Requests",
    approve:           "Approve",
    reject:            "Reject",
    viewer:            "Viewer",
    owner:             "Owner",
    admin:             "Admin",
    adminRole:         "Admin",
    salesManager:      "Sales Manager",
    selectRole:        "Select role",
    manageMemb:        "Manage",
    manageMembersTitle:"Manage Members",
    saveChanges:       "Save",
    removeMember:      "Remove User",
    roleUpdated:       "Role updated",
    myPendingRequests: "Pending Approvals",
    myPendingDesc:     "You sent a request to join the following project. Once approved, the project will appear in your dashboard.",
    awaitingApproval:  "Awaiting owner approval...",
    reviewRequests:    "Review Requests",
  },
  ru: {
    pageTitle:         "Проекты Продаж",
    pageDesc:          "Добавляйте проекты для увеличения продаж, управляйте процессом, создавайте векторные базы и скрипты, чтобы помогать менеджерам и руководителям.",
    missionLabel:      "Миссия",
    salesProcessLabel: "Процесс продаж",
    stagesLabel:       "Стадии",
    stageProject:      "Проект",
    stageScripts:      "Скрипты",
    stageAssistant:    "AI-помощник",
    stageAgents:       "AI-агенты",
    stageVector:       "Векторная база",
    connected:         "Подключено",
    notConnected:      "Не подключено",
    newProject:        "Новый Проект",
    connectProject:    "Подключиться к Проекту",
    global:            "Глобальный рынок",
    noDesc:            "Описание отсутствует.",
    priceRange:        "Ценовой диапазон",
    markets:           "Рынки",
    focusArea:         "Проблемы",
    created:           "Создан",
    items:             "Позиций",
    projectAccess:     "Доступ к Проекту",
    accessDesc:        "Поделитесь этим ключом безопасности с членами команды, чтобы дать им доступ к проекту.",
    connectionKey:     "Ключ Присоединения",
    copy:              "Скопировать",
    copied:            "Скопировано!",
    activeMembers:     "Активные Участники",
    projectOwner:      "Создатель Проекта",
    workspaceCTA:      "создайте новый проект",
    emptyDesc:         "Управляйте всеми вашими текущими проектами или создайте новый для начала аналитики.",
    createProjectBtn:  "Создать Проект",
    pendingRequests:   "Запросы на доступ",
    approve:           "Принять",
    reject:            "Отказать",
    viewer:            "Зритель",
    owner:             "Владелец",
    admin:             "Админ",
    adminRole:         "Админ",
    salesManager:      "Менеджер по продажам",
    selectRole:        "Выберите роль",
    manageMemb:        "Управление",
    manageMembersTitle:"Управление Участниками",
    saveChanges:       "Сохранить",
    removeMember:      "Удалить Пользователя",
    roleUpdated:       "Роль обновлена",
    myPendingRequests: "Ожидают подтверждения",
    myPendingDesc:     "Вы отправили запрос на присоединение к этому проекту. Как только создатель одобрит заявку, он появится в вашем списке.",
    awaitingApproval:  "Ожидает одобрения владельцем...",
    reviewRequests:    "Рассмотреть Заявки",
  },
} as const;

// ─── Scripts Dashboard Page ───────────────────────────────────────────────────
export const scriptsDashboard = {
  en: {
    pageTitle: "Your Scripts",
    pageDesc:
      "Manage standalone scripts, connect them to projects, and share secure access links.",
    addScript: "New Script",
    emptyTitle: "No scripts yet",
    emptyDesc:
      "Create your first script to start managing conversations, responses, and AI context.",
    createFirst: "Create First Script",
    untitledScript: "Untitled script",
    dialogCount: "dialogs",
    scriptTypeLabel: "Sales channel",
    scriptNotesLabel: "Description",
    noNotes: "No description provided.",
    openEditor: "Open Editor",

    statusLabel: "Status",
    projectStatusConnected: "Project connected",
    projectStatusStandalone: "Standalone",
    sharingStatusActive: "Sharing active",
    sharingStatusInactive: "No sharing",

    connectToProject: "Connect to project",
    connectedToProject: "Connected",
    disconnect: "Disconnect",
    connectModalTitle: "Connect to project",
    connectModalDesc:
      "Projects you own or manage are available here. Connected scripts become available to project members.",
    noProjects: "No managed projects yet.",
     connectedOk: "Connected.",
    requestSentOk: "Request sent to project owner.",
    connectError: "Failed to connect script.",
    disconnectError: "Failed to disconnect script.",
    disconnectedOk: "Disconnected from project.",
    requestLabel: "Send request",
    memberRoleLabel: "Member",
    ownerRoleLabel: "You own this",
    adminRoleLabel: "Admin",

    shareButton: "Share",
    manageShareButton: "Manage share",
    shareModalTitle: "Sharing access",
    shareModalDesc:
      "Share this key or link to grant read access to this script.",
    shareKeyLabel: "Share key",
    shareLinkLabel: "Share link",
    copy: "Copy",
    copied: "Copied",
    acceptedCount: "Accepted users",
    acceptedUsersEmpty: "No accepted users yet.",
    revokeShare: "Revoke access",
    shareKeyGenerated: "Share key generated.",
    shareKeyRevoked: "Share access revoked.",
    shareGenerateError: "Failed to generate share key.",
    shareRevokeError: "Failed to revoke share key.",
    sharesLoadError: "Failed to load accepted users.",

    filtersTitle: "Filters",
    filterAll: "All",
    filterWithProject: "With project",
    filterSharingActive: "Sharing active",
    filterStandalone: "Standalone",
    projectFilterLabel: "Project",
    projectFilterAll: "All projects",
    massSharingOn: "Mass sharing",
    massSharingOff: "Exit mass sharing",

    selectedCount: "Selected",
    bulkConnectLabel: "Connect to project",
    bulkSelectProject: "Select project",
    bulkConnectAction: "Connect",
    bulkShareAction: "Create access links",
    bulkNeedProject: "Choose a project first.",
    bulkNoSelection: "Select at least one script.",
    bulkConnectSuccess: "Scripts connected",
    bulkConnectError: "Bulk connect failed.",
    bulkShareSuccess: "Links generated",
    bulkShareError: "Bulk sharing failed.",
    bulkResultsTitle: "Generated links",

    phone: "Phone call",
    chat: "Chat / Messenger",
    in_person: "In-person",
  },
  ru: {
    pageTitle: "Ваши Скрипты",
    pageDesc:
      "Управляйте автономными скриптами, подключайте их к проектам и делитесь безопасными ссылками доступа.",
    addScript: "Новый скрипт",
    emptyTitle: "Скриптов пока нет",
    emptyDesc:
      "Создайте первый скрипт, чтобы управлять диалогами, ответами и контекстом для AI.",
    createFirst: "Создать первый скрипт",
    untitledScript: "Скрипт без названия",
    dialogCount: "диалогов",
    scriptTypeLabel: "Канал продаж",
    scriptNotesLabel: "Описание",
    noNotes: "Описание не указано.",
    openEditor: "Открыть редактор",

    statusLabel: "Статус",
    projectStatusConnected: "Подключён к проекту",
    projectStatusStandalone: "Без привязки",
    sharingStatusActive: "Шеринг активен",
    sharingStatusInactive: "Шеринг не активен",

    connectToProject: "Подключить к проекту",
    connectedToProject: "Подключён",
    disconnect: "Отключить",
    connectModalTitle: "Подключить к проекту",
    connectModalDesc:
      "Здесь отображаются проекты, которыми вы владеете или управляете. Подключённые скрипты доступны участникам проекта.",
    noProjects: "У вас пока нет управляемых проектов.",
     connectedOk: "Подключено.",
    requestSentOk: "Запрос отправлен владельцу проекта.",
    connectError: "Не удалось подключить скрипт.",
    disconnectError: "Не удалось отключить скрипт.",
    disconnectedOk: "Скрипт отключён от проекта.",
    requestLabel: "Отправить запрос",
    memberRoleLabel: "Участник",
    ownerRoleLabel: "Ваш проект",
    adminRoleLabel: "Администратор",

    shareButton: "Поделиться",
    manageShareButton: "Управление доступом",
    shareModalTitle: "Доступ по ссылке",
    shareModalDesc:
      "Поделитесь ключом или ссылкой, чтобы выдать доступ на чтение этого скрипта.",
    shareKeyLabel: "Ключ доступа",
    shareLinkLabel: "Ссылка доступа",
    copy: "Копировать",
    copied: "Скопировано",
    acceptedCount: "Приняли доступ",
    acceptedUsersEmpty: "Пока никто не принял доступ.",
    revokeShare: "Отозвать доступ",
    shareKeyGenerated: "Ключ доступа создан.",
    shareKeyRevoked: "Доступ по ссылке отозван.",
    shareGenerateError: "Не удалось создать ключ доступа.",
    shareRevokeError: "Не удалось отозвать доступ.",
    sharesLoadError: "Не удалось загрузить пользователей, принявших доступ.",

    filtersTitle: "Фильтры",
    filterAll: "Все",
    filterWithProject: "С проектом",
    filterSharingActive: "Шеринг активен",
    filterStandalone: "Без привязки",
    projectFilterLabel: "Проект",
    projectFilterAll: "Все проекты",
    massSharingOn: "Массовый шеринг",
    massSharingOff: "Выйти из массового режима",

    selectedCount: "Выбрано",
    bulkConnectLabel: "Подключить к проекту",
    bulkSelectProject: "Выберите проект",
    bulkConnectAction: "Подключить",
    bulkShareAction: "Создать ссылки доступа",
    bulkNeedProject: "Сначала выберите проект.",
    bulkNoSelection: "Выберите хотя бы один скрипт.",
    bulkConnectSuccess: "Скрипты подключены",
    bulkConnectError: "Не удалось массово подключить скрипты.",
    bulkShareSuccess: "Ссылки созданы",
    bulkShareError: "Не удалось массово создать ссылки.",
    bulkResultsTitle: "Созданные ссылки",

    phone: "Звонок",
    chat: "Чат / Мессенджер",
    in_person: "Оффлайн",
  },
} as const;

// ─── Connect Page ──────────────────────────────────────────────────────────────
export const connect = {
  en: {
    joinTitle:    "Join Sales Project",
    joinDesc:     "Enter the connection key provided by the project owner to gain access to their project metrics.",
    connectionKey:"Connection Key",
    keyPlaceholder:"e.g. A3F8B21C",
    invalidKey:   "Invalid connection key or you've already requested access.",
    connectUnavailable:"Connection is temporarily unavailable. Please try again in a moment.",
    alreadyOwner: "You are already the owner of this project.",
    connect:      "Connect",
    tryAgain:     "Try Again",
    connecting:   "Connecting...",
    success:      "Success!",
    footerWarning:"Make sure you have an active account to accept invitations safely.",
  },
  ru: {
    joinTitle:    "Присоединиться к Проекту",
    joinDesc:     "Введите ключ подключения, предоставленный владельцем проекта, чтобы получить доступ к аналитике.",
    connectionKey:"Ключ подключения",
    keyPlaceholder:"напр. A3F8B21C",
    invalidKey:   "Неверный ключ или вы уже отправили запрос на доступ.",
    connectUnavailable:"Подключение временно недоступно. Попробуйте ещё раз чуть позже.",
    alreadyOwner: "Вы уже являетесь владельцем этого проекта.",
    connect:      "Подключиться",
    tryAgain:     "Повторить",
    connecting:   "Подключение...",
    success:      "Успешно!",
    footerWarning:"Убедитесь, что вы находитесь в правильном аккаунте для безопасного принятия приглашений.",
  },
} as const;

// ─── New Project Wizard ────────────────────────────────────────────────────────
export const newProject = {
  en: {
    header:       "Let's set up your workspace",
    subHeader:    "Follow these simple steps to get started with Salezo.",
    creating:     "Creating...",
    createProject:"Create Project",
    steps: {
      name:            { title: "Sales sphere",            desc: "e.g. Stock trading, Car sales, etc.",                           placeholder: "Sales sphere..." },
      products:        { title: "Products & Services",     desc: "List the products or services your company sells",              placeholder: "e.g. Software subscriptions, consulting hours...", pricePlaceholder: "Avg price (optional), e.g. 100 EUR or $10" },
      price:           { title: "Average Price Range",     desc: "Specify the price range your customers typically pay",          from: "e.g. 500 USD", to: "e.g. 5000 USD", hint: "Write the amount followed by the currency, e.g. 100 EUR, 2000 USD, 50 GBP" },
      description:     { title: "Describe the team's mission", desc: "What does this group of people do?",                       placeholder: "This project is responsible for handling inbound B2B enterprise leads..." },
      retention:       { title: "Client Retention",        desc: "Is there a retention department or process?" },
      retentionDesc:   { title: "Retention Process",       desc: "Describe what the retention team does",                        placeholder: "The retention team handles renewals, churn risks..." },
      retentionMetrics:{ title: "Retention Metrics",       desc: "Average retention numbers/rates",                              placeholder: "We aim for 95% retention rate..." },
      problems:        { title: "Current Problems",        desc: "What are the biggest issues in the sales department right now?",placeholder: "Lack of motivation, poor lead quality, slow CRM..." },
      salesProcess:    { title: "Define the sales process",desc: "Calls, meetings, or chats? Any specific CRM features needed?", placeholder: "Sales involve multiple cold calls and customized PDF proposals..." },
      countries:       { title: "Sales Countries",         desc: "Which countries do you sell to? Add all relevant markets.",     placeholder: "e.g. USA, Germany, France..." },
    },
  },
  ru: {
    header:       "Давайте настроим рабочее пространство",
    subHeader:    "Следуйте этим простым шагам, чтобы начать работу с Salezo.",
    creating:     "Создание...",
    createProject:"Создать проект",
    steps: {
      name:            { title: "Сфера продаж",            desc: "Например: Продажа акций, Продажа автомобилей и т.д.",           placeholder: "Сфера продаж..." },
      products:        { title: "Товары и Услуги",          desc: "Перечислите товары или услуги, которые продает ваша компания",  placeholder: "Например: подписка на ПО, консультации...", pricePlaceholder: "Ср. цена (необяз.), Например 100 евро или 10 долларов" },
      price:           { title: "Средний диапазон цен",    desc: "Укажите диапазон цен, который обычно платят ваши клиенты",     from: "Например: 500 EUR", to: "Например: 5000 EUR", hint: "Пишите сумму, а после неё валюту, например: 100 EUR, 2000 USD, 50 GBP" },
      description:     { title: "Опишите миссию команды", desc: "Чем занимается эта группа людей?",                             placeholder: "Этот проект отвечает за обработку входящих B2B лидов..." },
      retention:       { title: "Удержание клиентов",      desc: "Есть ли отдел удержания (retention) или процесс?" },
      retentionDesc:   { title: "Процесс удержания",       desc: "Опишите, чем занимается команда удержания",                    placeholder: "Команда удержания занимается продлениями, рисками оттока..." },
      retentionMetrics:{ title: "Метрики удержания",       desc: "Средние показатели/доля удержания",                            placeholder: "Мы нацелены на 95% удержание..." },
      problems:        { title: "Текущие проблемы",        desc: "Каковы главные проблемы в отделе продаж на данный момент?",    placeholder: "Отсутствие мотивации, плохое качество лидов, медленная CRM..." },
      salesProcess:    { title: "Определите процесс продаж",desc: "Звонки, встречи или чаты? Нужны ли специфичные функции CRM?", placeholder: "Продажи включают в себя холодные звонки и персонализированные PDF-предложения..." },
      countries:       { title: "Страны продаж",           desc: "В каких странах вы продаёте? Добавьте все актуальные рынки.",  placeholder: "Например: Украина, Германия, США..." },
    },
  },
} as const;

// ─── Site Header ──────────────────────────────────────────────────────────────
export const siteHeader = {
  en: {
    product: "Product",
    news: "News",
    howItWorks: "How it works",
    productTitle: "Available in Salezo",
    productSubtitle: "Core product capabilities available today.",
    projects: "Sales Projects",
    projectsDescription: "Organize sales workspaces around real project flows.",
    access: "Project Access",
    accessDescription: "Join projects by key and manage approvals clearly.",
    roles: "Team Roles",
    rolesDescription: "Keep owners, admins, and members separated by access level.",
    scripts: "Scripts",
    scriptsDescription: "Prepare dedicated script modules inside each project.",
    bilingual: "Bilingual UI",
    bilingualDescription: "Switch between Russian and English instantly.",
    secure: "Secure Foundation",
    secureDescription: "Built on Supabase auth, database rules, and RLS.",
    newsTitle: "Sales News",
    newsSubtitle: "A curated sales news hub will appear here soon.",
    newsPlaceholder: "Coming soon",
    docsTitle: "Documentation",
    docsSubtitle: "See how the workspace is structured and how the flow works.",
    docsLink: "Open documentation",
    languageToggle: "Switch language",
    themeToggle: "Toggle theme",
  },
  ru: {
    product: "Продукт",
    news: "Новости",
    howItWorks: "Как это работает",
    productTitle: "Доступно в Salezo",
    productSubtitle: "Ключевые возможности продукта, доступные уже сейчас.",
    projects: "Проекты Продаж",
    projectsDescription: "Организуйте рабочие пространства продаж вокруг реальных проектов.",
    access: "Доступ к Проекту",
    accessDescription: "Подключайтесь по ключу и удобно управляйте одобрением доступа.",
    roles: "Роли Команды",
    rolesDescription: "Разделяйте владельцев, админов и участников по уровням доступа.",
    scripts: "Скрипты",
    scriptsDescription: "Подготавливайте отдельные модульные скрипты внутри проекта.",
    bilingual: "Два Языка",
    bilingualDescription: "Мгновенно переключайтесь между русским и английским.",
    secure: "Безопасная Основа",
    secureDescription: "Построено на Supabase auth, правилах базы и RLS.",
    newsTitle: "Новости Продаж",
    newsSubtitle: "Здесь скоро появится отдельный хаб с новостями по Sales.",
    newsPlaceholder: "Скоро",
    docsTitle: "Документация",
    docsSubtitle: "Посмотрите, как устроено рабочее пространство и логика продукта.",
    docsLink: "Открыть документацию",
    languageToggle: "Сменить язык",
    themeToggle: "Переключить тему",
  },
} as const;

// ─── Landing Page ─────────────────────────────────────────────────────────────
export const landing = {
  en: {
    badge: "Salezo OS is live",
    titleTop: "The Workspace for",
    titleBottom: "Top-tier Sales AI.",
    description:
      "A focused sales workspace for reps, team leads, and owners. Manage projects, organize access, and build the operational layer around your sales flow.",
    cta: "Increase sales",
    dialogTitle: "Sign in to Salezo",
    flowEyebrow: "How it works",
    flowTitle: "From sales conversations to AI execution",
    flowDescription:
      "Turn real sales context into structured AI systems, assistants, and decision support.",
    flowUser: "User",
    flowDialogs: "Sales dialogs",
    flowAi: "AI",
    flowVectorDb: "Vector database",
    flowVectorDbDesc: "Sales memory and objections.",
    flowScriptAssistant: "AI script",
    flowScriptAssistantDesc: "Reply and rebuttal guidance.",
    flowAgents: "Sales agents",
    flowAgentsDesc: "AI agents for lead flow.",
    flowImprovedScripts: "Better scripts",
    flowImprovedScriptsDesc: "Scripts improved from wins.",
    flowAnalysis: "Issue analysis",
    flowAnalysisDesc: "Bottlenecks and weak points.",
    featureSectionEyebrow: "Core modules",
    featureSectionTitle: "Scroll through the AI sales stack.",
    featureSectionDescription:
      "Each layer handles a different part of the workflow, from sales memory to execution and analysis.",
    featureVectorLabel: "AI Sales Knowledge Base",
    featureVectorHeadline: "Keep your sales memory structured and retrievable.",
    featureVectorBody:
      "Store objections, winning language, and deal context so the AI works from real sales knowledge.",
    featureVectorPointOne: "Shared memory for AI",
    featureVectorPointTwo: "Objections and patterns",
    featureScriptLabel: "AI Sales Assistant",
    featureScriptHeadline: "Generate live script guidance from real conversations.",
    featureScriptBody:
      "Surface stronger replies, rebuttals, and next-step prompts while the team is actively selling.",
    featureScriptPointOne: "Reply suggestions",
    featureScriptPointTwo: "Rebuttal blocks",
    featureAgentsLabel: "AI Sales Agents",
    featureAgentsHeadline: "Launch agents for lead flow and follow-ups.",
    featureAgentsBody:
      "Specialized agents can qualify, route, and move conversations forward without losing context.",
    featureAgentsPointOne: "Lead handling",
    featureAgentsPointTwo: "Follow-up logic",
    featureBetterLabel: "Sales Script Generator",
    featureBetterHeadline: "Turn winning calls into stronger reusable playbooks.",
    featureBetterBody:
      "Promote the best phrases, structures, and sequencing patterns into upgraded script systems.",
    featureBetterPointOne: "Script upgrades",
    featureBetterPointTwo: "What converts best",
    featureAnalysisLabel: "Sales Funnel Analysis",
    featureAnalysisHeadline: "Find weak points before they cost the pipeline.",
    featureAnalysisBody:
      "Spot recurring objections, stalled stages, and the parts of the process that need attention first.",
    featureAnalysisPointOne: "Pipeline bottlenecks",
    featureAnalysisPointTwo: "Stage-by-stage issues",
    featureTableFeature: "Feature",
    featureTableHandles: "Handles",
    featureTableValue: "Why it matters",
    featureIntroEyebrow: "What runs inside Salezo?",
    featureIntroTitlePrefix: "A sales workspace, or a complete",
    featureIntroTitleHighlight: "AI operating system?",
    featureIntroDescription:
      "Salezo is built to do more than display data. It connects your sales knowledge base, AI sales assistant, AI agents, sales script generator, and sales funnel analysis into one working system for teams that want to train faster, sell better, and improve continuously.",
    featureIntroMorphingTexts: [
      "SALEZO IS BUILT TO DO MORE THAN DISPLAY DATA.",
      "IT CONNECTS YOUR SALES KNOWLEDGE BASE.",
      "YOUR AI SALES ASSISTANT AND AI AGENTS.",
      "YOUR SALES SCRIPT GENERATOR.",
      "YOUR SALES FUNNEL ANALYSIS.",
      "ONE WORKING SYSTEM TO TRAIN FASTER.",
      "SELL BETTER. IMPROVE CONTINUOUSLY.",
    ],
    featureVectorHandle:
      "Builds a sales vector database with objections, scripts, deal context, and team knowledge.",
    featureVectorValue:
      "Use it inside Salezo AI, power external agents, or export the knowledge base for AI model training.",
    featureScriptHandle:
      "Supports reps in difficult sales situations, training flows, and onboarding with a sales simulator.",
    featureScriptValue:
      "Improves sales scripts, strengthens objection handling, and reveals weak points in the script flow.",
    featureAgentsHandle:
      "Runs the full AI script flow with extra context from the internet and external resources.",
    featureAgentsValue:
      "Helps automate research, qualification, follow-up, and more advanced AI sales execution.",
    featureBetterHandle:
      "Uses the project setup, vector database, AI agents, and AI scripts to upgrade any sales script.",
    featureBetterValue:
      "Strengthens messaging, sales logic, structure, and conversion-focused script quality.",
    featureAnalysisHandle:
      "Analyzes the same project context, AI scripts, knowledge base, and agent activity to detect sales issues.",
    featureAnalysisValue:
      "Shows bottlenecks, weak funnel stages, recurring objections, and the highest-impact growth opportunities.",
    mockupLabel: "Salezo Dashboard",
  },
  ru: {
    badge: "Salezo OS уже доступна",
    titleTop: "Рабочее пространство для",
    titleBottom: "Sales AI высокого уровня.",
    description:
      "Сфокусированное рабочее пространство для менеджеров по продажам, тимлидов и владельцев. Управляйте проектами, доступами и всей операционной логикой вокруг продаж.",
    cta: "Увеличить продажи",
    dialogTitle: "Войти в Salezo",
    flowEyebrow: "Как это работает",
    flowTitle: "От диалогов продаж к AI-исполнению",
    flowDescription:
      "Превращайте реальные sales-диалоги в структурированные AI-системы, помощников и инструменты для решений.",
    flowUser: "Пользователь",
    flowDialogs: "Диалоги продаж",
    flowAi: "AI",
    flowVectorDb: "Векторная база",
    flowVectorDbDesc: "Память продаж и возражений.",
    flowScriptAssistant: "AI скрипт",
    flowScriptAssistantDesc: "Подсказки для ответов и возражений.",
    flowAgents: "AI агенты",
    flowAgentsDesc: "Агенты для лидов и продаж.",
    flowImprovedScripts: "Сильнее скрипты",
    flowImprovedScriptsDesc: "Улучшение скриптов по удачным кейсам.",
    flowAnalysis: "Анализ проблем",
    flowAnalysisDesc: "Узкие места и слабые этапы.",
    featureSectionEyebrow: "Основные модули",
    featureSectionTitle: "Прокрутите весь AI sales-стек.",
    featureSectionDescription:
      "Каждый слой отвечает за свою часть процесса: от памяти продаж до исполнения и аналитики.",
    featureVectorLabel: "AI база знаний для продаж",
    featureVectorHeadline: "Храните память о продажах в структурированном виде.",
    featureVectorBody:
      "Сохраняйте возражения, сильные формулировки и контекст сделок, чтобы AI работал от реальных знаний отдела продаж.",
    featureVectorPointOne: "Общая память для AI",
    featureVectorPointTwo: "Возражения и паттерны",
    featureScriptLabel: "AI помощник для продаж",
    featureScriptHeadline: "Получайте живые подсказки из реальных sales-диалогов.",
    featureScriptBody:
      "Показывайте более сильные ответы, rebuttal-блоки и следующий шаг прямо во время продаж.",
    featureScriptPointOne: "Подсказки для ответов",
    featureScriptPointTwo: "Блоки возражений",
    featureAgentsLabel: "AI агенты для продаж",
    featureAgentsHeadline: "Запускайте агентов для лидов и follow-up процессов.",
    featureAgentsBody:
      "Специализированные агенты могут квалифицировать, маршрутизировать и продвигать диалог, не теряя контекст.",
    featureAgentsPointOne: "Обработка лидов",
    featureAgentsPointTwo: "Follow-up логика",
    featureBetterLabel: "Генератор скриптов продаж",
    featureBetterHeadline: "Превращайте успешные звонки в более сильные playbook-системы.",
    featureBetterBody:
      "Поднимайте лучшие фразы, структуру и последовательности в улучшенные сценарии продаж.",
    featureBetterPointOne: "Улучшение скриптов",
    featureBetterPointTwo: "Что конвертит лучше",
    featureAnalysisLabel: "Анализ воронки продаж",
    featureAnalysisHeadline: "Находите слабые места до того, как они бьют по воронке.",
    featureAnalysisBody:
      "Выявляйте повторяющиеся возражения, зависшие этапы и участки процесса, требующие внимания в первую очередь.",
    featureAnalysisPointOne: "Узкие места воронки",
    featureAnalysisPointTwo: "Проблемы по этапам",
    featureTableFeature: "Фича",
    featureTableHandles: "За что отвечает",
    featureTableValue: "Что даёт",
    featureIntroEyebrow: "Что работает внутри Salezo?",
    featureIntroTitlePrefix: "Рабочее пространство для продаж, или полноценная",
    featureIntroTitleHighlight: "AI operating system?",
    featureIntroDescription:
      "Salezo создана не только для отображения данных. Платформа объединяет AI базу знаний для продаж, AI помощника для продаж, AI агентов, генератор скриптов продаж и анализ воронки продаж в единую систему для команд, которые хотят быстрее обучать менеджеров, продавать сильнее и постоянно улучшать процесс.",
    featureIntroMorphingTexts: [
      "SALEZO СОЗДАНА НЕ ТОЛЬКО ДЛЯ ОТОБРАЖЕНИЯ ДАННЫХ.",
      "ОНА ОБЪЕДИНЯЕТ AI БАЗУ ЗНАНИЙ ДЛЯ ПРОДАЖ.",
      "AI ПОМОЩНИКА ДЛЯ ПРОДАЖ И AI АГЕНТОВ.",
      "ГЕНЕРАТОР СКРИПТОВ ПРОДАЖ.",
      "АНАЛИЗ ВОРОНКИ ПРОДАЖ.",
      "ЕДИНУЮ СИСТЕМУ, ЧТОБЫ ОБУЧАТЬ БЫСТРЕЕ.",
      "ПРОДАВАТЬ СИЛЬНЕЕ И ПОСТОЯННО УЛУЧШАТЬ ПРОЦЕСС.",
    ],
    featureVectorHandle:
      "Создаёт векторную базу продаж с возражениями, скриптами, контекстом сделок и знаниями команды.",
    featureVectorValue:
      "Позволяет использовать базу внутри AI в Salezo, запускать внешних агентов или выгружать её для обучения AI-моделей.",
    featureScriptHandle:
      "Помогает менеджерам отвечать в сложных sales-ситуациях, проходить тренинг и обучать новых менеджеров в симуляторе продаж.",
    featureScriptValue:
      "Позволяет улучшать скрипт продаж, усиливать ответы на возражения и находить слабые места в сценарии.",
    featureAgentsHandle:
      "Работает по полному флоу AI script, добавляя больше контекста через интернет и внешние ресурсы.",
    featureAgentsValue:
      "Помогает автоматизировать исследования, квалификацию, follow-up и более сложное AI-исполнение продаж.",
    featureBetterHandle:
      "После настройки проекта, векторной базы, AI-агентов и AI scripts усиливает любой скрипт продаж.",
    featureBetterValue:
      "Улучшает формулировки, логику продаж, структуру диалога и общий уровень конверсии скрипта.",
    featureAnalysisHandle:
      "Анализирует тот же контекст проекта, AI-скриптов, базы знаний и работы агентов, чтобы находить проблемы в продажах.",
    featureAnalysisValue:
      "Показывает узкие места, слабые этапы воронки, повторяющиеся возражения и точки роста для команды продаж.",
    mockupLabel: "Дашборд Salezo",
  },
} as const;

// ─── Auth Form ────────────────────────────────────────────────────────────────
export const auth = {
  en: {
    welcome: "Welcome back",
    subtitle: "Sign in to your account to continue",
    google: "Google",
    signInFailed: "Google sign-in failed",
    termsLead: "By clicking continue, you agree to our",
    termsOfService: "Terms of Service",
    privacyPolicy: "Privacy Policy",
    and: "and",
  },
  ru: {
    welcome: "С возвращением",
    subtitle: "Войдите в аккаунт, чтобы продолжить",
    google: "Google",
    signInFailed: "Не удалось войти через Google",
    termsLead: "Нажимая продолжить, вы соглашаетесь с нашими",
    termsOfService: "Условиями использования",
    privacyPolicy: "Политикой конфиденциальности",
    and: "и",
  },
} as const;

// ─── Login Page ───────────────────────────────────────────────────────────────
export const login = {
  en: {
    back: "Back to home",
    badge: "Secure access for your workspace",
    titleTop: "Continue inside",
    titleBottom: "your AI sales system.",
    description:
      "Sign in to access projects, team permissions, and the operational layer around your sales process.",
    panelLabel: "Inside Salezo",
    panelTitle: "Projects, access, and execution",
    panelDescription:
      "Move from scattered sales operations to one structured workspace for managers, leads, and owners.",
    panelPointOne: "Project-based collaboration",
    panelPointTwo: "Role-aware access and approvals",
    panelPointThree: "AI-ready operational foundation",
  },
  ru: {
    back: "На главную",
    badge: "Безопасный доступ к рабочему пространству",
    titleTop: "Продолжайте работу",
    titleBottom: "в вашей AI sales-системе.",
    description:
      "Войдите, чтобы получить доступ к проектам, ролям команды и операционному слою вокруг ваших продаж.",
    panelLabel: "Внутри Salezo",
    panelTitle: "Проекты, доступы и исполнение",
    panelDescription:
      "Перейдите от разрозненных sales-процессов к единому рабочему пространству для менеджеров, тимлидов и владельцев.",
    panelPointOne: "Совместная работа вокруг проектов",
    panelPointTwo: "Роли, доступы и согласования",
    panelPointThree: "Основа для AI-инструментов",
  },
} as const;

// ─── Docs ─────────────────────────────────────────────────────────────────────
export const docs = {
  en: {
    eyebrow: "Documentation",
    title: "How Salezo works",
    description:
      "This documentation area is being prepared. It will explain the product structure, project flow, roles, and AI-assisted modules.",
    statusTitle: "In progress",
    statusDescription:
      "We are gradually turning product knowledge into structured docs.",
  },
  ru: {
    eyebrow: "Документация",
    title: "Как работает Salezo",
    description:
      "Этот раздел документации сейчас готовится. Здесь будет описание структуры продукта, логики проектов, ролей и AI-модулей.",
    statusTitle: "В процессе",
    statusDescription:
      "Мы постепенно превращаем знания о продукте в структурированную документацию.",
  },
} as const;

// ─── Dashboard Home ───────────────────────────────────────────────────────────
export const dashboardHome = {
  en: {
    eyebrow: "Guided Workspace Setup",
    title: "Build your sales AI system step by step",
    securityNotice:
      "All data is protected. To configure the dashboard, complete your first project end to end.",
    progressLabel: "Progress",
    nextAction: "Next action",
    loadFailed: "Could not load dashboard progress.",
    noAccess: "You need to sign in to see this dashboard state.",
    retry: "Retry",
    users: "users",
    openProject: "Open project",
    complete: "Complete",
    inProgress: "In progress",
    locked: "After previous step",
    lockedHint: "Complete the previous step to unlock this one.",
    allDoneTitle: "Workspace is fully configured",
    allDoneDescription:
      "All key setup stages are complete. Open any project workspace below.",
    stepProjectTitle: "Create project",
    stepProjectDescription:
      "Define products, pricing, process, and sales markets to create the foundation.",
    stepProjectHint:
      "Start in the project wizard to unlock all downstream AI modules.",
    stepProjectAction: "Open project wizard",
    stepScriptsTitle: "Create scripts",
    stepScriptsDescription:
      "Add your first sales scripts and scenario logic for managers.",
    stepScriptsHint:
      "Open the scripts module and add your first script block.",
    stepScriptsAction: "Open scripts",
    stepSmsAssistTitle: "Enable message assistant",
    stepSmsAssistDescription:
      "Prepare AI response assistance for difficult message threads.",
    stepSmsAssistHint:
      "Set up the assistant layer to help with replies and objections.",
    stepSmsAssistAction: "Configure assistant",
    stepScriptAgentsTitle: "Set up script agents",
    stepScriptAgentsDescription:
      "Add AI agents that adapt and improve scripts automatically.",
    stepScriptAgentsHint:
      "Configure script agents to iterate wording and structure.",
    stepScriptAgentsAction: "Configure agents",
    stepVectorTitle: "Create vector database",
    stepVectorDescription:
      "Build a reusable knowledge base for AI execution and model training.",
    stepVectorHint:
      "Index project knowledge to unlock vector-powered AI memory.",
    stepVectorAction: "Configure vector DB",
  },
  ru: {
    eyebrow: "Пошаговая Настройка Workspace",
    title: "Соберите вашу AI sales-систему по шагам",
    securityNotice:
      "Все данные защищены. Чтобы настроить дашборд, нужно полностью создать первый проект.",
    progressLabel: "Прогресс",
    nextAction: "Следующий шаг",
    loadFailed: "Не удалось загрузить прогресс дашборда.",
    noAccess: "Нужно войти в аккаунт, чтобы увидеть состояние дашборда.",
    retry: "Повторить",
    users: "пользователей",
    openProject: "Открыть проект",
    complete: "Готово",
    inProgress: "В процессе",
    locked: "После завершения прошлого шага",
    lockedHint: "Сначала завершите предыдущий шаг, чтобы разблокировать этот.",
    allDoneTitle: "Workspace полностью настроен",
    allDoneDescription:
      "Все ключевые этапы пройдены. Ниже можно открыть любой проект.",
    stepProjectTitle: "Создать проект",
    stepProjectDescription:
      "Задайте продукты, цены, процесс и рынки, чтобы построить основу системы.",
    stepProjectHint:
      "Начните с мастера проекта, чтобы открыть остальные AI-модули.",
    stepProjectAction: "Открыть мастер проекта",
    stepScriptsTitle: "Создать скрипты",
    stepScriptsDescription:
      "Добавьте первые скрипты продаж и сценарии работы менеджеров.",
    stepScriptsHint:
      "Откройте модуль скриптов и добавьте первый рабочий блок.",
    stepScriptsAction: "Открыть скрипты",
    stepSmsAssistTitle: "Включить помощь для сообщений",
    stepSmsAssistDescription:
      "Подготовьте AI-помощь для сложных переписок и возражений.",
    stepSmsAssistHint:
      "Настройте слой помощника для ответов и работы с возражениями.",
    stepSmsAssistAction: "Настроить помощника",
    stepScriptAgentsTitle: "Настроить AI-агентов скриптов",
    stepScriptAgentsDescription:
      "Добавьте AI-агентов для адаптации и улучшения скриптов.",
    stepScriptAgentsHint:
      "Настройте агентов, чтобы итеративно усиливать структуру скриптов.",
    stepScriptAgentsAction: "Настроить агентов",
    stepVectorTitle: "Создать векторную базу",
    stepVectorDescription:
      "Соберите переиспользуемую базу знаний для AI и обучения моделей.",
    stepVectorHint:
      "Проиндексируйте знания проекта, чтобы включить векторную память AI.",
    stepVectorAction: "Настроить векторную базу",
  },
} as const;

// ─── Utility: pick translations for a given language ──────────────────────────
export function t<T extends { en: object; ru: object }>(
  dict: T,
  lang: Language
): T["en"] {
  return dict[lang] as T["en"];
}
