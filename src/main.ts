import { openUrl } from "@tauri-apps/plugin-opener";
import { getVersion } from "@tauri-apps/api/app";
import { invoke } from "@tauri-apps/api/core";
import { LANG_NAMES, translations } from "./translations";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HaInstance {
  id: string;
  name: string;
  url: string;
}

// ---------------------------------------------------------------------------
// Instance storage
// ---------------------------------------------------------------------------

function getInstances(): HaInstance[] {
  try {
    return JSON.parse(localStorage.getItem("ha_instances") ?? "[]");
  } catch {
    return [];
  }
}

function saveInstances(instances: HaInstance[]): void {
  localStorage.setItem("ha_instances", JSON.stringify(instances));
}

/** Migrates a legacy ha_url entry into the instances list on first run. */
function migrateLegacyUrl(): void {
  const legacy = localStorage.getItem("ha_url");
  if (legacy && getInstances().length === 0) {
    saveInstances([{ id: Date.now().toString(), name: "", url: legacy }]);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeUrl(raw: string): string | null {
  let url = raw.trim();
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) url = "http://" + url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return url;
  } catch {
    return null;
  }
}

function currentLang(): string {
  return localStorage.getItem("app_lang") ?? "en";
}

function t() {
  return translations[currentLang()] ?? translations["en"];
}

async function applyZoom(factor: number): Promise<void> {
  try {
    await invoke("set_zoom", { factor });
  } catch {
    // not running inside Tauri
  }
}

// ---------------------------------------------------------------------------
// Update checker
// ---------------------------------------------------------------------------

async function checkForUpdates(): Promise<void> {
  const banner = document.getElementById("update-banner");
  const updateText = document.getElementById("update-text");
  const downloadLink = document.getElementById("update-download");
  if (!banner || !updateText) return;

  try {
    const current = await getVersion();
    const res = await fetch(
      "https://api.github.com/repos/PsydoV2/home-assistant-desktop/releases/latest",
      { headers: { Accept: "application/vnd.github+json" } },
    );
    if (!res.ok) return;
    const data = (await res.json()) as { tag_name?: string };
    const latest = data.tag_name?.replace(/^v/, "");
    if (latest && latest !== current) {
      updateText.textContent = `${t().update_available} v${latest}`;
      if (downloadLink) downloadLink.textContent = t().download;
      banner.removeAttribute("hidden");
    }
  } catch {
    // offline or rate-limited
  }
}

// ---------------------------------------------------------------------------
// Language
// ---------------------------------------------------------------------------

function updateLanguage(lang: string): void {
  const tr = translations[lang];
  if (!tr) return;

  document.documentElement.lang = lang;

  const set = (id: string, text: string) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  set("welcome-text", tr.welcome);
  set("sub-text", tr.p_text);
  set("url-label", tr.label);
  set("name-label", tr.name_label);
  set("instances-title", tr.your_instances);
  set("add-instance-btn", tr.add_instance);
  set("back-btn", tr.back);
  set("storage-info", tr.footer);

  // Only reset connect button when NOT in edit mode
  if (!editingInstanceId) {
    set("connect-btn", tr.connect);
  }

  const urlInput = document.getElementById("ha-url") as HTMLInputElement | null;
  if (urlInput) urlInput.placeholder = tr.placeholder;

  const nameInput = document.getElementById("ha-name") as HTMLInputElement | null;
  if (nameInput) nameInput.placeholder = tr.name_placeholder;

  const langText = document.getElementById("current-lang");
  if (langText) langText.textContent = LANG_NAMES[lang] ?? lang.toUpperCase();

  const helpLink = document.getElementById("help-link");
  if (helpLink) {
    const svg = helpLink.querySelector("svg");
    helpLink.textContent = tr.help + " ";
    if (svg) helpLink.appendChild(svg);
  }

  localStorage.setItem("app_lang", lang);
}

// ---------------------------------------------------------------------------
// Edit state
// ---------------------------------------------------------------------------

let editingInstanceId: string | null = null;

// ---------------------------------------------------------------------------
// View switching
// ---------------------------------------------------------------------------

function showInstanceList(): void {
  const section = document.getElementById("instances-section");
  const form = document.getElementById("add-form");
  if (section) section.removeAttribute("hidden");
  if (form) form.setAttribute("hidden", "");
  renderInstances();
}

function showAddForm(withBack: boolean): void {
  const section = document.getElementById("instances-section");
  const form = document.getElementById("add-form");
  const backBtn = document.getElementById("back-btn");
  const welcomeText = document.getElementById("welcome-text");
  const subText = document.getElementById("sub-text");

  if (section) section.setAttribute("hidden", "");
  if (form) form.removeAttribute("hidden");

  // Hide the welcome heading when accessed from the instance list
  const hideHeader = withBack;
  if (welcomeText) welcomeText.style.display = hideHeader ? "none" : "";
  if (subText) subText.style.display = hideHeader ? "none" : "";

  if (backBtn) {
    if (withBack) backBtn.removeAttribute("hidden");
    else backBtn.setAttribute("hidden", "");
  }

  const urlInput = document.getElementById("ha-url") as HTMLInputElement | null;
  urlInput?.focus();
}

// ---------------------------------------------------------------------------
// Instance list rendering
// ---------------------------------------------------------------------------

function renderInstances(): void {
  const list = document.getElementById("instances-list");
  if (!list) return;

  const instances = getInstances();
  list.innerHTML = "";

  if (instances.length === 0) {
    const empty = document.createElement("p");
    empty.style.cssText =
      "text-align:center;color:var(--muted);font-size:13px;margin:16px 0;";
    empty.textContent = t().no_instances;
    list.appendChild(empty);
    return;
  }

  for (const instance of instances) {
    const item = document.createElement("div");
    item.className = "instance-item";
    item.setAttribute("role", "listitem");

    const info = document.createElement("div");
    info.className = "instance-info";

    const name = document.createElement("span");
    name.className = "instance-name";
    name.textContent = instance.name || instance.url;

    const url = document.createElement("span");
    url.className = "instance-url";
    url.textContent = instance.name ? instance.url : "";

    info.appendChild(name);
    info.appendChild(url);
    info.addEventListener("click", () => connectToInstance(instance));

    const editBtn = document.createElement("button");
    editBtn.className = "instance-edit";
    editBtn.type = "button";
    editBtn.setAttribute("aria-label", "Edit instance");
    editBtn.textContent = "✏";
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      startEditInstance(instance);
    });

    const delBtn = document.createElement("button");
    delBtn.className = "instance-delete";
    delBtn.type = "button";
    delBtn.setAttribute("aria-label", "Delete instance");
    delBtn.textContent = "✕";
    delBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const updated = getInstances().filter((i) => i.id !== instance.id);
      saveInstances(updated);
      renderInstances();
    });

    item.appendChild(info);
    item.appendChild(editBtn);
    item.appendChild(delBtn);
    list.appendChild(item);
  }
}

function startEditInstance(instance: HaInstance): void {
  editingInstanceId = instance.id;
  const urlInput = document.getElementById("ha-url") as HTMLInputElement | null;
  const nameInput = document.getElementById("ha-name") as HTMLInputElement | null;
  const connectBtn = document.getElementById("connect-btn") as HTMLButtonElement | null;
  const errorMsg = document.getElementById("error-msg");

  if (nameInput) nameInput.value = instance.name;
  if (urlInput) urlInput.value = instance.url;
  if (errorMsg) errorMsg.setAttribute("hidden", "");
  if (connectBtn) connectBtn.textContent = t().save;

  showAddForm(true);
}

async function connectToInstance(instance: HaInstance): Promise<void> {
  localStorage.setItem("ha_url", instance.url);
  await applyZoom(getZoom());
  window.location.replace(instance.url);
}

// ---------------------------------------------------------------------------
// Zoom controls
// ---------------------------------------------------------------------------

function getZoom(): number {
  return parseFloat(localStorage.getItem("zoom_level") ?? "1");
}

async function setZoom(factor: number): Promise<void> {
  const clamped = Math.round(Math.min(3.0, Math.max(0.5, factor)) * 10) / 10;
  localStorage.setItem("zoom_level", String(clamped));
  const label = document.getElementById("zoom-level");
  if (label) label.textContent = `${Math.round(clamped * 100)}%`;
  await applyZoom(clamped);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", async () => {
  migrateLegacyUrl();

  const params = new URLSearchParams(window.location.search);

  // ?switch=1  →  clear active URL but keep saved instances (from tray "Switch Instance")
  // ?reset=1   →  full wipe of all data (legacy / deep reset)
  if (params.get("switch") === "1") {
    localStorage.removeItem("ha_url");
    window.history.replaceState({}, document.title, window.location.pathname);
  } else if (params.get("reset") === "1") {
    localStorage.removeItem("ha_url");
    localStorage.removeItem("ha_instances");
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  // Apply stored zoom before potentially redirecting
  const savedZoom = getZoom();
  await applyZoom(savedZoom);
  const zoomLabel = document.getElementById("zoom-level");
  if (zoomLabel) zoomLabel.textContent = `${Math.round(savedZoom * 100)}%`;

  // Fast-path: saved URL → navigate immediately
  const savedUrl = localStorage.getItem("ha_url");
  if (savedUrl) {
    window.location.replace(savedUrl);
    return;
  }

  // Decide which view to show
  const instances = getInstances();
  if (instances.length > 0) {
    showInstanceList();
  } else {
    showAddForm(false);
  }

  // --- Language setup ---
  const savedLang = currentLang();
  updateLanguage(savedLang);

  // Mark initially selected option
  document.querySelectorAll<HTMLElement>(".custom-option").forEach((opt) => {
    if (opt.getAttribute("data-value") === savedLang) {
      opt.classList.add("selected");
    }
  });

  // --- Element refs ---
  const urlInput   = document.getElementById("ha-url")      as HTMLInputElement | null;
  const nameInput  = document.getElementById("ha-name")     as HTMLInputElement | null;
  const connectBtn = document.getElementById("connect-btn") as HTMLButtonElement | null;
  const errorMsg   = document.getElementById("error-msg");
  const helpLink   = document.getElementById("help-link")   as HTMLAnchorElement | null;
  const langWrapper = document.getElementById("lang-select-container");
  const langTrigger = langWrapper?.querySelector<HTMLElement>(".custom-select__trigger");
  const options    = document.querySelectorAll<HTMLElement>(".custom-option");
  const backBtn    = document.getElementById("back-btn")    as HTMLButtonElement | null;
  const addBtn     = document.getElementById("add-instance-btn");
  const zoomOut    = document.getElementById("zoom-out")    as HTMLButtonElement | null;
  const zoomIn     = document.getElementById("zoom-in")     as HTMLButtonElement | null;

  // --- Connect / Save logic ---
  async function handleConnect(): Promise<void> {
    if (!urlInput) return;
    const url = normalizeUrl(urlInput.value);
    if (!url) {
      if (errorMsg) {
        errorMsg.textContent = t().invalid_url;
        errorMsg.removeAttribute("hidden");
      }
      urlInput.focus();
      return;
    }
    if (errorMsg) errorMsg.setAttribute("hidden", "");

    const name = nameInput?.value.trim() ?? "";

    if (editingInstanceId) {
      // Update existing instance in place
      const updated = getInstances().map((i) =>
        i.id === editingInstanceId ? { ...i, name, url } : i,
      );
      saveInstances(updated);
      editingInstanceId = null;
      if (connectBtn) connectBtn.textContent = t().connect;
    } else {
      // Add new instance (skip if exact URL already saved)
      const existing = getInstances();
      if (!existing.find((i) => i.url === url)) {
        saveInstances([...existing, { id: Date.now().toString(), name, url }]);
      }
    }

    localStorage.setItem("ha_url", url);
    await applyZoom(getZoom());
    window.location.replace(url);
  }

  // --- Event listeners ---
  connectBtn?.addEventListener("click", handleConnect);
  urlInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleConnect();
  });
  urlInput?.addEventListener("input", () => {
    if (errorMsg) errorMsg.setAttribute("hidden", "");
  });

  helpLink?.addEventListener("click", async (e) => {
    e.preventDefault();
    const href = helpLink.getAttribute("href");
    if (href) {
      try {
        await openUrl(href);
      } catch {
        window.open(href, "_blank", "noopener,noreferrer");
      }
    }
  });

  backBtn?.addEventListener("click", () => {
    // Cancel any pending edit
    editingInstanceId = null;
    if (connectBtn) connectBtn.textContent = t().connect;
    showInstanceList();
  });

  addBtn?.addEventListener("click", () => {
    editingInstanceId = null;
    if (nameInput) nameInput.value = "";
    if (urlInput) urlInput.value = "";
    if (errorMsg) errorMsg.setAttribute("hidden", "");
    if (connectBtn) connectBtn.textContent = t().connect;
    showAddForm(true);
  });

  // --- Zoom ---
  zoomOut?.addEventListener("click", () => setZoom(getZoom() - 0.1));
  zoomIn?.addEventListener("click", () => setZoom(getZoom() + 0.1));

  // --- Language dropdown with full keyboard support ---
  function openDropdown(): void {
    langWrapper?.classList.add("open");
    langTrigger?.setAttribute("aria-expanded", "true");
  }
  function closeDropdown(): void {
    langWrapper?.classList.remove("open");
    langTrigger?.setAttribute("aria-expanded", "false");
  }
  function selectOption(opt: HTMLElement): void {
    const val = opt.getAttribute("data-value");
    if (!val) return;
    updateLanguage(val);
    closeDropdown();
    options.forEach((o) => o.classList.remove("selected"));
    opt.classList.add("selected");
    langTrigger?.focus();
  }

  langTrigger?.addEventListener("click", (e) => {
    e.stopPropagation();
    langWrapper?.classList.contains("open") ? closeDropdown() : openDropdown();
  });
  langTrigger?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      langWrapper?.classList.contains("open") ? closeDropdown() : openDropdown();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      openDropdown();
      (options[0] as HTMLElement | undefined)?.focus();
    } else if (e.key === "Escape") {
      closeDropdown();
    }
  });

  options.forEach((option, idx) => {
    option.addEventListener("click", () => selectOption(option));
    option.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectOption(option);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        (options[idx + 1] as HTMLElement | undefined)?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (idx === 0) langTrigger?.focus();
        else (options[idx - 1] as HTMLElement | undefined)?.focus();
      } else if (e.key === "Escape") {
        closeDropdown();
        langTrigger?.focus();
      }
    });
  });

  window.addEventListener("click", () => closeDropdown());

  // Non-blocking update check
  checkForUpdates();
});
