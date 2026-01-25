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
};

document.addEventListener("DOMContentLoaded", () => {
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
    if (langText)
      langText.textContent =
        lang === "de" ? "Deutsch" : lang === "en" ? "English" : "Français";

    if (helpLink) {
      const svg = helpLink.querySelector("svg")?.outerHTML || "";
      helpLink.innerHTML = `${t.help} ${svg}`;
    }
    localStorage.setItem("app_lang", lang);
  }

  // --- WICHTIG: URL-CHECK ---
  const savedUrl = localStorage.getItem("ha_url");
  // Wir leiten nur weiter, wenn eine URL da ist UND wir nicht auf der index.html bleiben wollen
  if (
    savedUrl &&
    savedUrl.startsWith("http") &&
    !window.location.href.includes("reset=true")
  ) {
    window.location.replace(savedUrl);
    return; // Stop das Script hier, wenn wir weiterleiten
  }

  // Falls wir durch einen Reset kommen, säubern wir die URL-Parameter
  if (window.location.href.includes("reset=true")) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  const savedLang = localStorage.getItem("app_lang") || "de";
  updateLanguage(savedLang);

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

  window.addEventListener("click", (e) => {
    if (!langWrapper?.contains(e.target as Node))
      langWrapper?.classList.remove("open");
  });

  connectBtn?.addEventListener("click", () => {
    let url = urlInput.value.trim();
    if (url && !url.startsWith("http")) url = "http://" + url;
    if (url) {
      localStorage.setItem("ha_url", url);
      window.location.replace(url);
    }
  });
});
