document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("ha-url") as HTMLInputElement;
  const btn = document.getElementById("connect-btn");

  // Prüfen ob bereits eine URL gespeichert ist
  const savedUrl = localStorage.getItem("ha_url");
  if (savedUrl) {
    window.location.replace(savedUrl);
  }

  btn?.addEventListener("click", () => {
    let url = input.value.trim();

    // Validierung und automatisches Hinzufügen von http://
    if (url && !url.startsWith("http")) {
      url = "http://" + url;
    }

    if (url) {
      localStorage.setItem("ha_url", url);
      window.location.replace(url);
    } else {
      input.style.borderBottomColor = "#ef5350";
    }
  });
});
