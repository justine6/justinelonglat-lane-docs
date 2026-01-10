// scripts/partials.js
// Footer-only partial injector for static sites.
// Injects /_partials/footer.html into #siteFooter.
// Safe: fails silently if missing.

(async function () {
  async function inject(selector, url) {
    const el = document.querySelector(selector);
    if (!el) return;

    try {
      const res = await fetch(url, { cache: "no-cache" });
      if (!res.ok) throw new Error(url + " -> " + res.status);
      el.innerHTML = await res.text();
    } catch (e) {
      console.warn("Partial inject failed:", url, e);
    }
  }

  await inject("#siteFooter", "/_partials/footer.html");
})();
