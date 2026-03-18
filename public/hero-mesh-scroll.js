(function () {
  const hero = document.querySelector(".home-hero.mesh-surface");
  const mesh = hero?.querySelector(".mesh-nodes");

  if (!hero || !mesh) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduceMotion.matches) return;

  let ticking = false;

  function updateMeshMotion() {
    const rect = hero.getBoundingClientRect();
    const viewportH = window.innerHeight || document.documentElement.clientHeight;

    // center-based progress through viewport, clamped
    const progressRaw = (rect.top + rect.height / 2 - viewportH / 2) / viewportH;
    const progress = Math.max(-1, Math.min(1, progressRaw));

    // subtle multi-axis platform-style motion
    const shiftY = progress * -34;
    const shiftX = progress * 10;
    const scale = 1 + Math.abs(progress) * 0.03;
    const tilt = progress * -1.1;

    const drift1 = progress * -18;
    const drift2 = progress * 14;

    hero.style.setProperty("--mesh-shift-y", `${shiftY.toFixed(2)}px`);
    hero.style.setProperty("--mesh-shift-x", `${shiftX.toFixed(2)}px`);
    hero.style.setProperty("--mesh-scale", scale.toFixed(3));
    hero.style.setProperty("--mesh-tilt", `${tilt.toFixed(2)}deg`);
    hero.style.setProperty("--node-drift-1", `${drift1.toFixed(2)}px`);
    hero.style.setProperty("--node-drift-2", `${drift2.toFixed(2)}px`);

    ticking = false;
  }

  function requestTick() {
    if (!ticking) {
      window.requestAnimationFrame(updateMeshMotion);
      ticking = true;
    }
  }

  updateMeshMotion();
  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", requestTick);
})();