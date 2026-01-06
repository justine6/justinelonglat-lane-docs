// /scripts/latest-updates.js
(function () {
  // Dynamically show "Latest updates" message in footer
  const el = document.getElementById("latest-updates");
  if (!el) return;

  const messages = [
    "Last verified on " + new Date().toLocaleDateString(),
    "Docs refreshed weekly — see GitHub for latest commits.",
    "Built with ❤️ by JustineLonglaT-Lane Consulting.",
  ];

  const msg = messages[Math.floor(Math.random() * messages.length)];
  el.textContent = msg;
})();
