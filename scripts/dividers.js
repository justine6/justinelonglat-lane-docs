
(() => {
  const dividers = document.querySelectorAll(".section-divider");
  if (!dividers.length) return;

  // Fallback: if IntersectionObserver isn’t supported, just show them
  if (!("IntersectionObserver" in window)) {
    dividers.forEach((d) => d.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          // optional: stop observing once visible
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.2 }
  );

  dividers.forEach((d) => observer.observe(d));
})();
