/**
 * Central i18n translations for Salezo.
 * Add all new keys here — never inline translations in components.
 */

export type Language = "en" | "ru";

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

// ─── Utility: pick translations for a given language ──────────────────────────
export function t<T extends { en: object; ru: object }>(
  dict: T,
  lang: Language
): T["en"] {
  return dict[lang] as T["en"];
}
