// /scripts/theme-toggle.js
(function () {
  var KEY = "jutellane-theme";

  function prefersDark() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  }

  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    // Update button glyph if present
    var btn = document.getElementById("themeToggle");
    if (btn) btn.textContent = t === "dark" ? "☀️" : "🌙";
  }

  function initTheme() {
    var saved = localStorage.getItem(KEY);
    var theme = saved || (prefersDark() ? "dark" : "light");
    applyTheme(theme);
  }

  function wireButton() {
    // header may be injected later; retry until we find the button
    var btn = document.getElementById("themeToggle");
    if (!btn) {
      setTimeout(wireButton, 100);
      return;
    }
    btn.addEventListener("click", function () {
      var current =
        document.documentElement.getAttribute("data-theme") || "light";
      var next = current === "light" ? "dark" : "light";
      localStorage.setItem(KEY, next);
      applyTheme(next);
    });
  }

  initTheme();
  // Run once DOM is ready, but also cope with dynamic partials
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wireButton);
  } else {
    wireButton();
  }
})();
