document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".doc-card");

  if (!cards.length) return;

  // Fallback for old browsers: just show them
  if (!("IntersectionObserver" in window)) {
    cards.forEach((card) => card.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15 },
  );

  cards.forEach((card) => observer.observe(card));
});
