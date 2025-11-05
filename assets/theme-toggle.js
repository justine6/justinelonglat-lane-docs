(function () {
  var KEY = "theme"; // keep your chosen key
  var root = document.documentElement;
  var btn  = document.getElementById("themeToggle");

  // Determine initial theme (stored -> system -> light)
  var initial = localStorage.getItem(KEY);
  if (!initial) {
    initial = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  setTheme(initial);

  // Bind after header partial is injected
  if (btn) btn.addEventListener("click", function () {
    setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
  });

  function setTheme(t) {
    root.setAttribute("data-theme", t);
    localStorage.setItem(KEY, t);
    if (btn) {
      var dark = t === "dark";
      btn.textContent = dark ? "☀️" : "🌙";
      btn.setAttribute("aria-pressed", String(dark));
      btn.setAttribute("title", dark ? "Switch to light theme" : "Switch to dark theme");
      btn.setAttribute("aria-label", btn.getAttribute("title"));
    }
  }
})();
