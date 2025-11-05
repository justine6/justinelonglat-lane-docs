// assets/theme-toggle.js
(function () {
  var KEY = "jutellane-theme";
  var btn = document.getElementById("themeToggle");

  function apply(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    if (btn) btn.textContent = theme === "dark" ? "☀️" : "🌙";
  }

  var initial =
    localStorage.getItem(KEY) ||
    (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

  apply(initial);

  if (btn) {
    btn.addEventListener("click", function () {
      var next = (document.documentElement.getAttribute("data-theme") === "dark") ? "light" : "dark";
      localStorage.setItem(KEY, next);
      apply(next);
    });
  }
})();
