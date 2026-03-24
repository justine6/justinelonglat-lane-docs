(() => {
  const hero = document.querySelector(".home-hero[data-hero-motion='mesh']");
  if (!hero) return;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const updateFromScroll = () => {
    const rect = hero.getBoundingClientRect();
    const vh = window.innerHeight || 1;

    const progress = clamp((vh - rect.top) / (vh + rect.height), 0, 1);
    const driftY = Math.round(progress * 18);
    const fade = 1 - progress * 0.08;

    hero.style.setProperty("--hero-grid-y", `${driftY}px`);
    hero.style.setProperty("--hero-fade", `${fade}`);
  };

  const updateFromPointer = (event) => {
    const rect = hero.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 18;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 14;

    hero.style.setProperty("--hero-glow-x", `${x}px`);
    hero.style.setProperty("--hero-glow-y", `${y}px`);
  };

  const resetPointer = () => {
    hero.style.setProperty("--hero-glow-x", `0px`);
    hero.style.setProperty("--hero-glow-y", `0px`);
  };

  window.addEventListener("scroll", updateFromScroll, { passive: true });
  window.addEventListener("resize", updateFromScroll);
  hero.addEventListener("pointermove", updateFromPointer);
  hero.addEventListener("pointerleave", resetPointer);

  updateFromScroll();
})();