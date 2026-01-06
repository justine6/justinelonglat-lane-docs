// /assets/latest-updates.js
(function () {
  function fmt(d) {
    try {
      return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    } catch (_) {
      return d.toISOString();
    }
  }

  function render() {
    var slot = document.getElementById("latest-updates");
    if (!slot) return;

    var last = new Date(document.lastModified);
    var env = /vercel\.app$/.test(location.hostname)
      ? "Vercel"
      : location.hostname || "local";

    slot.textContent = "Last updated: " + fmt(last) + " · Environment: " + env;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
