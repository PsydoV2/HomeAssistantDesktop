const translations = {
  en: {
    welcome: "Welcome!",
    p_text: "Please enter the URL of your Home Assistant",
    label: "URL",
    connect: "Connect",
    footer: "ONLY LOCALLY SAVED",
    help: "Help",
  },
  de: {
    welcome: "Willkommen!",
    p_text: "Bitte gib die URL deiner Home Assistant Instanz ein",
    label: "URL",
    connect: "Verbinden",
    footer: "NUR LOKAL GESPEICHERT",
    help: "Hilfe",
  },
  fr: {
    welcome: "Bienvenue !",
    p_text: "Veuillez saisir l'URL de votre instance",
    label: "URL",
    connect: "Se connecter",
    footer: "ENREGISTRÉ LOCALEMENT UNIQUEMENT",
    help: "Aide",
  },
  es: {
    welcome: "¡Bienvenido!",
    p_text: "Introduce la URL de tu instancia",
    label: "URL",
    connect: "Conectar",
    footer: "GUARDADO SOLO LOCALMENTE",
    help: "Ayuda",
  },
  it: {
    welcome: "Benvenuto!",
    p_text: "Inserisci l'URL della tua istanza",
    label: "URL",
    connect: "Connetti",
    footer: "SALVATO SOLO LOCALMENTE",
    help: "Aiuto",
  },
  nl: {
    welcome: "Welkom!",
    p_text: "Voer de URL van je instantie in",
    label: "URL",
    connect: "Verbinden",
    footer: "ALLEEN LOKAAL OPGESLAGEN",
    help: "Hulp",
  },
  pl: {
    welcome: "Witaj!",
    p_text: "Wprowadź adres URL swojej instancji",
    label: "URL",
    connect: "Połącz",
    footer: "ZAPISANO TYLKO LOKALNIE",
    help: "Pomoc",
  },
  pt: {
    welcome: "Bem-vindo!",
    p_text: "Insira o URL da sua instância",
    label: "URL",
    connect: "Conectar",
    footer: "SALVO APENAS LOCALMENTE",
    help: "Ajuda",
  },
  ru: {
    welcome: "Добро пожаловать!",
    p_text: "Введите URL-адрес вашего инstanса",
    label: "URL",
    connect: "Подключиться",
    footer: "СОХРАНЕНО ТОЛЬКО ЛОКАЛЬНО",
    help: "Помощь",
  },
  ja: {
    welcome: "ようこそ！",
    p_text: "インスタンスのURLを入力してください",
    label: "URL",
    connect: "接続",
    footer: "ローカルにのみ保存されます",
    help: "ヘルプ",
  },
  zh: {
    welcome: "欢迎！",
    p_text: "请输入您的实例 URL",
    label: "URL",
    connect: "连接",
    footer: "仅保存在本地",
    help: "帮助",
  },
  tr: {
    welcome: "Hoş geldiniz!",
    p_text: "Lütfen örneğinizin URL'sini girin",
    label: "URL",
    connect: "Bağlan",
    footer: "SADECE YEREL OLARAK KAYDEDİLDİ",
    help: "Yardım",
  },
};

document.addEventListener("DOMContentLoaded", () => {
  // 1. Reset-Logic (Absolute Priorität)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("reset") === "1") {
    localStorage.removeItem("ha_url");
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  // 2. Redirect-Check
  const savedUrl = localStorage.getItem("ha_url");
  if (
    savedUrl &&
    savedUrl.startsWith("http") &&
    urlParams.get("reset") !== "1"
  ) {
    window.location.replace(savedUrl);
    return;
  }

  // UI Elemente
  const urlInput = document.getElementById("ha-url") as HTMLInputElement;
  const connectBtn = document.getElementById(
    "connect-btn",
  ) as HTMLButtonElement;
  const welcomeText = document.getElementById("welcome-text");
  const subText = document.getElementById("sub-text");
  const urlLabel = document.getElementById("url-label");
  const storageInfo = document.getElementById("storage-info");
  const helpLink = document.getElementById("help-link");
  const langWrapper = document.getElementById("lang-select-container");
  const langTrigger = langWrapper?.querySelector(".custom-select__trigger");
  const langText = document.getElementById("current-lang");
  const options = document.querySelectorAll(".custom-option");

  function updateLanguage(lang: string) {
    const t = translations[lang as keyof typeof translations];
    if (!t) return;

    if (welcomeText) welcomeText.textContent = t.welcome;
    if (subText) subText.textContent = t.p_text;
    if (urlLabel) urlLabel.textContent = t.label;
    if (connectBtn) connectBtn.textContent = t.connect;
    if (storageInfo) storageInfo.textContent = t.footer;

    if (langText) {
      const names: any = {
        en: "English",
        de: "Deutsch",
        fr: "Français",
        es: "Español",
        it: "Italiano",
        nl: "Nederlands",
        pl: "Polski",
        pt: "Português",
        ru: "Русский",
        ja: "日本語",
        zh: "中文",
        tr: "Türkçe",
      };
      langText.textContent = names[lang] || lang.toUpperCase();
    }

    if (helpLink) {
      const svg = helpLink.querySelector("svg")?.outerHTML || "";
      helpLink.innerHTML = `${t.help} ${svg}`;
    }
    localStorage.setItem("app_lang", lang);
  }

  // Init
  updateLanguage(localStorage.getItem("app_lang") || "en");

  langTrigger?.addEventListener("click", () =>
    langWrapper?.classList.toggle("open"),
  );

  options.forEach((option) => {
    option.addEventListener("click", () => {
      const val = option.getAttribute("data-value");
      if (val) {
        updateLanguage(val);
        langWrapper?.classList.remove("open");
        options.forEach((opt) => opt.classList.remove("selected"));
        option.classList.add("selected");
      }
    });
  });

  connectBtn?.addEventListener("click", () => {
    let url = urlInput.value.trim();
    if (url && !url.startsWith("http")) url = "http://" + url;
    if (url) {
      localStorage.setItem("ha_url", url);
      window.location.replace(url);
    }
  });

  window.addEventListener("click", (e) => {
    if (!langWrapper?.contains(e.target as Node))
      langWrapper?.classList.remove("open");
  });
});
