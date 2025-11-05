// /assets/back-to-top.js
(function () {
  var btn = document.createElement("button");
  btn.textContent = "↑";
  btn.setAttribute("id", "backToTop");
  btn.setAttribute(
    "style",
    `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      width: 2.5rem;
      height: 2.5rem;
      font-size: 1.4rem;
      line-height: 1.4rem;
      border-radius: 50%;
      border: none;
      background: #1e3a8a;
      color: white;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.4s ease;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
      z-index: 999;
    `
  );
  document.body.appendChild(btn);

  function toggle() {
    btn.style.opacity = window.scrollY > 200 ? "1" : "0";
  }

  window.addEventListener("scroll", toggle);
  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();
