import type {} from "@tauri-apps/api"; // makes this file a module → enables declare global

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    __TAURI__?: {
      opener?: {
        open?: (url: string) => Promise<void>;
        openUrl?: (url: string) => Promise<void>;
      };
    };
  }
}

// ---------------------------------------------------------------------------
// Translations
// ---------------------------------------------------------------------------

const LANG_NAMES: Record<string, string> = {
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

interface Translation {
  welcome: string;
  p_text: string;
  label: string;
  connect: string;
  footer: string;
  help: string;
  placeholder: string;
  invalid_url: string;
}

const translations: Record<string, Translation> = {
  en: {
    welcome: "Welcome!",
    p_text: "Please enter the URL of your Home Assistant",
    label: "URL",
    connect: "Connect",
    footer: "ONLY LOCALLY SAVED",
    help: "Help",
    placeholder: "http://homeassistant.local:8123",
    invalid_url: "Please enter a valid URL (e.g. http://192.168.1.x:8123)",
  },
  de: {
    welcome: "Willkommen!",
    p_text: "Bitte gib die URL deiner Home Assistant Instanz ein",
    label: "URL",
    connect: "Verbinden",
    footer: "NUR LOKAL GESPEICHERT",
    help: "Hilfe",
    placeholder: "http://homeassistant.local:8123",
    invalid_url:
      "Bitte gib eine gültige URL ein (z.B. http://192.168.1.x:8123)",
  },
  fr: {
    welcome: "Bienvenue !",
    p_text: "Veuillez saisir l'URL de votre instance Home Assistant",
    label: "URL",
    connect: "Se connecter",
    footer: "ENREGISTRÉ LOCALEMENT UNIQUEMENT",
    help: "Aide",
    placeholder: "http://homeassistant.local:8123",
    invalid_url: "Veuillez entrer une URL valide (ex. http://192.168.1.x:8123)",
  },
  es: {
    welcome: "¡Bienvenido!",
    p_text: "Introduce la URL de tu instancia de Home Assistant",
    label: "URL",
    connect: "Conectar",
    footer: "GUARDADO SOLO LOCALMENTE",
    help: "Ayuda",
    placeholder: "http://homeassistant.local:8123",
    invalid_url: "Introduce una URL válida (p.ej. http://192.168.1.x:8123)",
  },
  it: {
    welcome: "Benvenuto!",
    p_text: "Inserisci l'URL della tua istanza Home Assistant",
    label: "URL",
    connect: "Connetti",
    footer: "SALVATO SOLO LOCALMENTE",
    help: "Aiuto",
    placeholder: "http://homeassistant.local:8123",
    invalid_url: "Inserisci un URL valido (es. http://192.168.1.x:8123)",
  },
  nl: {
    welcome: "Welkom!",
    p_text: "Voer de URL van je Home Assistant instantie in",
    label: "URL",
    connect: "Verbinden",
    footer: "ALLEEN LOKAAL OPGESLAGEN",
    help: "Hulp",
    placeholder: "http://homeassistant.local:8123",
    invalid_url: "Voer een geldige URL in (bijv. http://192.168.1.x:8123)",
  },
  pl: {
    welcome: "Witaj!",
    p_text: "Wprowadź adres URL swojej instancji Home Assistant",
    label: "URL",
    connect: "Połącz",
    footer: "ZAPISANO TYLKO LOKALNIE",
    help: "Pomoc",
    placeholder: "http://homeassistant.local:8123",
    invalid_url: "Podaj prawidłowy URL (np. http://192.168.1.x:8123)",
  },
  pt: {
    welcome: "Bem-vindo!",
    p_text: "Insira o URL da sua instância do Home Assistant",
    label: "URL",
    connect: "Conectar",
    footer: "SALVO APENAS LOCALMENTE",
    help: "Ajuda",
    placeholder: "http://homeassistant.local:8123",
    invalid_url: "Insira um URL válido (ex. http://192.168.1.x:8123)",
  },
  ru: {
    welcome: "Добро пожаловать!",
    p_text: "Введите URL-адрес вашего экземпляра Home Assistant",
    label: "URL",
    connect: "Подключиться",
    footer: "СОХРАНЕНО ТОЛЬКО ЛОКАЛЬНО",
    help: "Помощь",
    placeholder: "http://homeassistant.local:8123",
    invalid_url: "Введите корректный URL (напр. http://192.168.1.x:8123)",
  },
  ja: {
    welcome: "ようこそ！",
    p_text: "Home Assistant インスタンスのURLを入力してください",
    label: "URL",
    connect: "接続",
    footer: "ローカルにのみ保存されます",
    help: "ヘルプ",
    placeholder: "http://homeassistant.local:8123",
    invalid_url: "有効なURLを入力してください（例: http://192.168.1.x:8123）",
  },
  zh: {
    welcome: "欢迎！",
    p_text: "请输入您的 Home Assistant 实例 URL",
    label: "URL",
    connect: "连接",
    footer: "仅保存在本地",
    help: "帮助",
    placeholder: "http://homeassistant.local:8123",
    invalid_url: "请输入有效的 URL（例如 http://192.168.1.x:8123）",
  },
  tr: {
    welcome: "Hoş geldiniz!",
    p_text: "Home Assistant örneğinizin URL'sini girin",
    label: "URL",
    connect: "Bağlan",
    footer: "SADECE YEREL OLARAK KAYDEDİLDİ",
    help: "Yardım",
    placeholder: "http://homeassistant.local:8123",
    invalid_url: "Geçerli bir URL girin (örn. http://192.168.1.x:8123)",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Prepends http:// if no protocol is given and validates the result. */
function normalizeUrl(raw: string): string | null {
  let url = raw.trim();
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) url = "http://" + url;
  try {
    new URL(url); // throws if invalid
    return url;
  } catch {
    return null;
  }
}

/** Opens a URL in the system browser via the Tauri opener plugin (v2). */
async function openExternalUrl(url: string): Promise<void> {
  const tauri = window.__TAURI__;
  if (tauri?.opener) {
    try {
      if (typeof tauri.opener.open === "function") {
        await tauri.opener.open(url);
        return;
      }
      if (typeof tauri.opener.openUrl === "function") {
        await tauri.opener.openUrl(url);
        return;
      }
    } catch (err) {
      console.error("Tauri opener error:", err);
    }
  }
  // Fallback for browser-based development
  window.open(url, "_blank", "noopener,noreferrer");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  // 1. Reset & redirect logic
  const urlParams = new URLSearchParams(window.location.search);
  const isReset = urlParams.get("reset") === "1";

  if (isReset) {
    localStorage.removeItem("ha_url");
    // Clean the query string from the address bar without a reload
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  const savedUrl = localStorage.getItem("ha_url");
  if (savedUrl && !isReset) {
    window.location.replace(savedUrl);
    return; // Stop further execution – the page is navigating away
  }

  // 2. Element references
  const urlInput = document.getElementById("ha-url") as HTMLInputElement | null;
  const connectBtn = document.getElementById(
    "connect-btn",
  ) as HTMLButtonElement | null;
  const welcomeText = document.getElementById("welcome-text");
  const subText = document.getElementById("sub-text");
  const urlLabel = document.getElementById("url-label");
  const storageInfo = document.getElementById("storage-info");
  const helpLink = document.getElementById(
    "help-link",
  ) as HTMLAnchorElement | null;
  const errorMsg = document.getElementById("error-msg");
  const langWrapper = document.getElementById("lang-select-container");
  const langTrigger = langWrapper?.querySelector<HTMLElement>(
    ".custom-select__trigger",
  );
  const langText = document.getElementById("current-lang");
  const options = document.querySelectorAll<HTMLElement>(".custom-option");

  // 3. Language update
  function updateLanguage(lang: string): void {
    const t = translations[lang];
    if (!t) return;

    if (welcomeText) welcomeText.textContent = t.welcome;
    if (subText) subText.textContent = t.p_text;
    if (urlLabel) urlLabel.textContent = t.label;
    if (connectBtn) connectBtn.textContent = t.connect;
    if (storageInfo) storageInfo.textContent = t.footer;
    if (urlInput) urlInput.placeholder = t.placeholder;

    if (langText) {
      langText.textContent = LANG_NAMES[lang] ?? lang.toUpperCase();
    }

    // Re-set help link text while preserving the SVG icon inside it
    if (helpLink) {
      const svg = helpLink.querySelector("svg");
      helpLink.textContent = t.help + " ";
      if (svg) helpLink.appendChild(svg);
    }

    localStorage.setItem("app_lang", lang);
  }

  // 4. Connect action – shared between button click and Enter key
  function handleConnect(): void {
    if (!urlInput) return;
    const t =
      translations[localStorage.getItem("app_lang") ?? "en"] ??
      translations["en"];

    const url = normalizeUrl(urlInput.value);
    if (!url) {
      if (errorMsg) {
        errorMsg.textContent = t.invalid_url;
        errorMsg.removeAttribute("hidden");
      }
      urlInput.focus();
      return;
    }

    if (errorMsg) errorMsg.setAttribute("hidden", "");
    localStorage.setItem("ha_url", url);
    window.location.replace(url);
  }

  // 5. Help link – attach once, do not rebuild on language change
  helpLink?.addEventListener("click", async (e) => {
    e.preventDefault();
    const href = helpLink.getAttribute("href");
    if (href) await openExternalUrl(href);
  });

  // 6. Connect button & Enter key
  connectBtn?.addEventListener("click", handleConnect);
  urlInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleConnect();
  });

  // Clear error on input
  urlInput?.addEventListener("input", () => {
    if (errorMsg) errorMsg.setAttribute("hidden", "");
  });

  // 7. Language dropdown
  updateLanguage(localStorage.getItem("app_lang") ?? "en");

  langTrigger?.addEventListener("click", (e) => {
    e.stopPropagation();
    langWrapper?.classList.toggle("open");
  });

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

  // Close dropdown when clicking outside
  window.addEventListener("click", () => langWrapper?.classList.remove("open"));
});
