(function () {
  var KEY = "jutellane-theme";
  function prefersDark() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  }
  function apply(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    var btn = document.getElementById("themeToggle");
    if (btn) btn.textContent = theme === "dark" ? "☀️" : "🌙";
  }
  function initial() {
    return localStorage.getItem(KEY) || (prefersDark() ? "dark" : "light");
  }
  function init() {
    var theme = initial();
    apply(theme);
    var btn = document.getElementById("themeToggle");
    if (btn)
      btn.addEventListener("click", function () {
        var t =
          document.documentElement.getAttribute("data-theme") === "dark"
            ? "light"
            : "dark";
        localStorage.setItem(KEY, t);
        apply(t);
      });
  }
  // Early paint hint (avoid flash)
  try {
    var saved = localStorage.getItem(KEY);
    if (saved === "dark" || (!saved && prefersDark())) {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  } catch (_) {}
  // Run after DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
