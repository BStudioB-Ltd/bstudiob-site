(() => {
  'use strict';

  const root = document.documentElement;
  try {
    if (window.self === window.top) {
      root.dataset.topLevel = 'true';
      return;
    }
  } catch {
    // Cross-origin access means this page is framed.
  }

  root.dataset.framed = 'true';
  window.stop();
  document.addEventListener('DOMContentLoaded', () => document.body.replaceChildren());
})();
