(() => {
  document.querySelectorAll('[data-studio-carousel]').forEach((carousel) => {
    const slides = [...carousel.querySelectorAll('[data-studio-slide]')];
    const tabs = [...carousel.querySelectorAll('[data-studio-tab]')];
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

  const targets = document.querySelectorAll('.hero, .studio-summary, .statement, .focus, .company-collections, .principles, .contact, .collection-hero, .product-feature, .page-product-list, .community-products');
  const itemTargets = document.querySelectorAll('.focus-grid article, .collection-route, .principles li, .product-feature figure, .product-feature > div:last-child, .product-list article, .community-products article');
  document.body.classList.add('motion-ready', 'page-loaded');

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
