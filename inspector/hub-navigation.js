(() => {
  function focusTarget(hash) {
    if (!hash?.startsWith("#")) return;
    const target = document.getElementById(hash.slice(1));
    if (target?.tabIndex === -1) {
      target.focus({ preventScroll: true });
    }
  }

  function scheduleFocus(hash) {
    window.requestAnimationFrame(() => {
      if (window.location.hash === hash) focusTarget(hash);
    });
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest?.('a[href^="#"]');
    if (link) scheduleFocus(link.hash);
  });

  window.addEventListener("hashchange", () => {
    scheduleFocus(window.location.hash);
  });
})();
