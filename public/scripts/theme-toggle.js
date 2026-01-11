(function () {
  const KEY = "jlt_theme";
  const root = document.documentElement;
  const btn = document.getElementById("themeToggle");

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem(KEY, theme); } catch {}
  }

  function getPreferred() {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "light" || saved === "dark") return saved;
    } catch {}
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }

  // init
  apply(getPreferred());

  if (btn) {
    btn.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") || "dark";
      apply(current === "dark" ? "light" : "dark");
    });
  }
})();
