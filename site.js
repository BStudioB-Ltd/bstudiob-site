(() => {
  document.querySelectorAll('[data-tributary-showcase]').forEach((showcase) => {
    const tabs = [...showcase.querySelectorAll('[data-tributary-showcase-tab]')];
    const panels = [...showcase.querySelectorAll('[data-tributary-showcase-panel]')];
    const show = (name) => {
      tabs.forEach((tab) => { const active = tab.dataset.tributaryShowcaseTab === name; tab.classList.toggle('is-active', active); tab.setAttribute('aria-selected', String(active)); });
      panels.forEach((panel) => { const active = panel.dataset.tributaryShowcasePanel === name; panel.classList.toggle('is-active', active); panel.hidden = !active; });
    };
    tabs.forEach((tab, index) => { tab.addEventListener('click', () => show(tab.dataset.tributaryShowcaseTab)); tab.addEventListener('keydown', (event) => { if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return; event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length; tabs[next].focus(); show(tabs[next].dataset.tributaryShowcaseTab); }); });
    show(tabs[0]?.dataset.tributaryShowcaseTab || 'controller');
  });

  const splash = document.querySelector('[data-tributary-splash]');
  if (splash) {
    const dismiss = () => { splash.classList.add('is-dismissed'); window.setTimeout(() => splash.remove(), 500); };
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) dismiss();
    else window.addEventListener('load', () => window.setTimeout(dismiss, 420), { once: true });
  }

  document.querySelectorAll('[data-studio-carousel]').forEach((carousel) => {
    const slides = [...carousel.querySelectorAll('[data-studio-slide]')];
    const tabs = [...carousel.querySelectorAll('[data-studio-tab]')];
    const cards = [...carousel.querySelectorAll('[data-hero-select]')];
    let current = 0;
    const show = (next) => {
      current = (next + slides.length) % slides.length;
      slides.forEach((slide, index) => {
        const active = index === current;
        slide.hidden = !active;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
        slide.inert = !active;
      });
      tabs.forEach((tab, index) => {
        const active = index === current;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
      });
      cards.forEach((card) => {
        const active = Number(card.dataset.heroSelect) === current;
        if (active) card.setAttribute('aria-current', 'true');
        else card.removeAttribute('aria-current');
      });
    };
    carousel.querySelector('[data-studio-prev]')?.addEventListener('click', () => show(current - 1));
    carousel.querySelector('[data-studio-next]')?.addEventListener('click', () => show(current + 1));
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => show(index));
      tab.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : current + (event.key === 'ArrowRight' ? 1 : -1);
        show(next);
        tabs[current].focus();
      });
    });
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        carousel.classList.add('has-selection');
        const selected = Number(card.dataset.heroSelect);
        tabs[selected]?.focus();
        show(selected);
      });
    });
    document.querySelectorAll('a[href^="#studio-tab-"], a[href^="#hero-tab-"], a[href^="#hero-slide-"]').forEach((link) => {
      const targetId = link.hash.slice(1);
      const index = tabs.findIndex((tab) => tab.id === targetId || tab.getAttribute('aria-controls') === targetId);
      if (index >= 0) link.addEventListener('click', () => {
        carousel.classList.add('has-selection');
        show(index);
      });
    });
    show(0);
  });

  const accountFrame = document.querySelector('.account-portal-frame');
  if (accountFrame) {
    const accountIntro = document.getElementById('account-intro-copy');
    const accountFrameHeading = document.getElementById('account-frame-heading');
    const accountAuthStatus = document.getElementById('account-auth-status');
    const signedOutIntro = accountIntro?.textContent ?? '';
    const signedOutHeading = accountFrameHeading?.textContent ?? '';
    let accountStateReceived = false;
    const requestAccountState = () => accountFrame.contentWindow?.postMessage({ type: 'account-portal:request-auth-state' }, new URL(accountFrame.src).origin);
    const updateAccountState = (authenticated) => {
      if (accountIntro) accountIntro.textContent = authenticated
        ? 'You’re signed in to your BStudioB account. Your dashboard and assigned product access are shown here.'
        : signedOutIntro;
      if (accountFrameHeading) accountFrameHeading.textContent = authenticated
        ? 'Your BStudioB dashboard'
        : signedOutHeading;
      if (accountAuthStatus) {
        accountAuthStatus.hidden = !authenticated;
        accountAuthStatus.textContent = authenticated ? 'Signed in to your BStudioB account.' : '';
      }
    };
    window.addEventListener('message', (event) => {
      if (event.source !== accountFrame.contentWindow || event.origin !== new URL(accountFrame.src).origin) return;
      if (event.data?.type === 'account-portal:resize') {
        const height = Number(event.data.height);
        if (!Number.isFinite(height)) return;
        accountFrame.style.height = `${Math.min(1400, Math.max(460, Math.ceil(height) + 4))}px`;
        return;
      }
      if (event.data?.type !== 'account-portal:auth-state' || typeof event.data.authenticated !== 'boolean') return;
      accountStateReceived = true;
      if (event.data.authenticated && window.location.pathname !== '/myaccount/') {
        window.location.assign('/myaccount/');
        return;
      }
      updateAccountState(event.data.authenticated);
    });
    accountFrame.addEventListener('load', requestAccountState);
    requestAccountState();
    let accountStateAttempts = 0;
    const retryAccountState = () => {
      if (accountStateReceived || ++accountStateAttempts >= 10) return;
      requestAccountState();
      window.setTimeout(retryAccountState, 500);
    };
    window.setTimeout(retryAccountState, 500);
  }

  document.querySelectorAll('[data-product-gallery]').forEach((gallery) => {
    const slides = [...gallery.querySelectorAll('[data-product-gallery-slide]')];
    const tabs = [...gallery.querySelectorAll('[data-product-gallery-tab]')];
    let current = 0;
    const show = (next) => {
      current = (next + slides.length) % slides.length;
      slides.forEach((slide, index) => {
        const active = index === current;
        slide.hidden = !active;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
        slide.inert = !active;
      });
      tabs.forEach((tab, index) => {
        const active = index === current;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
      });
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => show(index));
      tab.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : current + (event.key === 'ArrowRight' ? 1 : -1);
        show(next);
        tabs[current].focus();
      });
    });
    show(0);
  });

  const launchForms = {
    'hello+tributary@bstudiob.co.uk': {
      button: 'Request invite-only access',
      subject: 'BStudioB — Tributary early-access enquiry',
      note: 'We only collect details needed for this invite-only early-access enquiry; no account or payment is created. '
    },
    'nathan+inspector@bstudiob.co.uk': {
      button: 'Apply for an Inspector pilot',
      subject: 'BStudioB — Inspector pilot application',
      note: 'Free application to discuss a future supervised pilot.'
    },
    'nathan+cards@bstudiob.co.uk': {
      button: 'Join playtester list',
      subject: 'BStudioB — Cards playtester interest',
      note: 'Free, no-obligation invitations to future Cards playtests.'
    },
    'nathan+buildy@bstudiob.co.uk': {
      button: 'Request private-beta access',
      subject: 'BStudioB — Buildy access interest',
      note: 'Free, no-obligation updates about Buildy access.'
    }
  };

  document.querySelectorAll('.waitlist-form').forEach((form) => {
    const recipient = new URL(form.action).pathname.slice(1);
    const config = launchForms[recipient];
    if (!config) return;

    const button = form.querySelector('button[type="submit"]');
    if (button) button.firstChild.nodeValue = `${config.button} `;

    const subject = form.querySelector('input[name="_subject"]');
    if (subject) subject.value = config.subject;

    const note = form.querySelector('.form-note');
    if (note && config.note) note.firstChild.nodeValue = `${config.note} `;

    if (form.querySelector('[name="privacy_consent"]')) return;

    const consent = document.createElement('label');
    consent.className = 'form-consent';
    consent.htmlFor = `${form.querySelector('input[type="email"]').id}-consent`;
    consent.innerHTML = `<input id="${consent.htmlFor}" name="privacy_consent" type="checkbox" required> <span>I agree that BStudioB may use my details for ${recipient.includes('inspector') ? 'this pilot enquiry' : 'relevant product updates'}, as described in the <a href="privacy.html">Privacy notice</a>.</span>`;
    note.before(consent);
  });

  document.querySelectorAll('[data-tributary-carousel]').forEach((carousel) => {
    const slides = [...carousel.querySelectorAll('.tributary-slide')];
    const tabs = [...carousel.querySelectorAll('[data-tributary-tab]')];
    let current = 0;
    const show = (next) => {
      current = (next + slides.length) % slides.length;
      slides.forEach((slide, index) => {
        const active = index === current;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
        slide.inert = !active;
      });
      tabs.forEach((tab, index) => {
        const active = index === current;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
      });
    };
    carousel.querySelector('[data-carousel-prev]')?.addEventListener('click', () => show(current - 1));
    carousel.querySelector('[data-carousel-next]')?.addEventListener('click', () => show(current + 1));
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => show(index));
      tab.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : current + (event.key === 'ArrowRight' ? 1 : -1);
        show(next);
        tabs[current].focus();
      });
    });
    carousel.addEventListener('keydown', (event) => {
      if (event.target !== carousel || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      show(current + (event.key === 'ArrowRight' ? 1 : -1));
    });
    show(0);
  });

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const targets = document.querySelectorAll('.hero, .studio-summary, .statement, .focus, .company-collections, .principles, .contact, .collection-hero, .product-feature, .page-product-list, .community-products, .tributary-explainer');
  const itemTargets = document.querySelectorAll('.focus-grid article, .collection-route, .principles li, .product-feature figure, .product-feature > div:last-child, .product-list article, .community-products article');
  document.body.classList.add('motion-ready');
  window.addEventListener('load', () => document.body.classList.add('page-loaded'), { once: true });

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -5% 0px' });

  targets.forEach((target, index) => {
    target.classList.add('reveal');
    target.style.setProperty('--reveal-delay', `${Math.min(index * 35, 140)}ms`);
    if (target.getBoundingClientRect().top < window.innerHeight * .92) target.classList.add('is-visible');
    observer.observe(target);
  });

  itemTargets.forEach((target, index) => {
    target.classList.add('reveal-item');
    target.style.setProperty('--item-delay', `${(index % 4) * 85}ms`);
    if (target.getBoundingClientRect().top < window.innerHeight * .92) target.classList.add('is-visible');
    observer.observe(target);
  });
})();
