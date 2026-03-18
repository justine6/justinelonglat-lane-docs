(function () {
  const hero = document.querySelector("[data-hero-motion='mesh']");
  if (!hero) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (prefersReducedMotion.matches) return;

  let ticking = false;

  function updateHeroMotion() {
    const rect = hero.getBoundingClientRect();
    const viewportH = window.innerHeight || document.documentElement.clientHeight;

    // progress centered in viewport
    const progressRaw = (rect.top + rect.height / 2 - viewportH / 2) / viewportH;
    const progress = Math.max(-1, Math.min(1, progressRaw));

    // subtle motion tuning
    const shiftY = progress * -10;     // vertical drift
    const shiftX = progress * 4;       // slight horizontal parallax
    const scale = 1 + Math.abs(progress) * 0.01;
    const ringScale = 1 + Math.abs(progress) * 0.015;
    const ringOpacity = 0.82 - Math.abs(progress) * 0.08;

    hero.style.setProperty("--hero-shift-y", `${shiftY.toFixed(2)}px`);
    hero.style.setProperty("--hero-shift-x", `${shiftX.toFixed(2)}px`);
    hero.style.setProperty("--hero-scale", scale.toFixed(3));
    hero.style.setProperty("--hero-ring-scale", ringScale.toFixed(3));
    hero.style.setProperty("--hero-ring-opacity", ringOpacity.toFixed(3));

    ticking = false;
  }

  function requestTick() {
    if (!ticking) {
      window.requestAnimationFrame(updateHeroMotion);
      ticking = true;
    }
  }

  // initial run
  updateHeroMotion();

  // listeners
  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", requestTick);
})();