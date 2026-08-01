(() => {
  const launchForms = {
    'nathan+flowcue@bstudiob.co.uk': {
      button: 'Get FlowCue launch updates',
      subject: 'BStudioB — FlowCue launch interest',
      note: 'Free, no-obligation FlowCue launch updates.'
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

    const consent = document.createElement('label');
    consent.className = 'form-consent';
    consent.htmlFor = `${form.querySelector('input[type="email"]').id}-consent`;
    consent.innerHTML = `<input id="${consent.htmlFor}" name="privacy_consent" type="checkbox" required> <span>I agree that BStudioB may use my details for ${recipient.includes('inspector') ? 'this pilot enquiry' : 'relevant product updates'}, as described in the <a href="privacy.html">Privacy notice</a>.</span>`;
    note.before(consent);
  });

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const targets = document.querySelectorAll('.hero, .statement, .focus, .company-collections, .principles, .contact, .collection-hero, .product-feature, .page-product-list, .community-products');
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
