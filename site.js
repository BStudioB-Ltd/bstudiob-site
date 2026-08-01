(() => {
  const launchForms = {
    'nathan+inspire@bstudiob.co.uk': {
      button: 'Join creator beta',
      subject: 'BStudioB — Inspire creator beta',
      note: 'Free, no-obligation access updates for Inspire.'
    },
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
    'nathan+mymark@bstudiob.co.uk': {
      button: 'Join private beta',
      subject: 'BStudioB — MyMark private beta',
      note: 'Free, no-obligation private-beta updates for MyMark.'
    },
    'nathan+hackergo@bstudiob.co.uk': {
      button: 'Register interest',
      subject: 'BStudioB — HackerGO community interest',
      note: 'Free updates about future, authorised learning experiences.'
    },
    'nathan+opspy@bstudiob.co.uk': {
      button: 'Join closed beta',
      subject: 'BStudioB — OpSpy closed beta'
    },
    'nathan+hexagate@bstudiob.co.uk': {
      button: 'Request research access',
      subject: 'BStudioB — HexaGate research access'
    },
    'nathan+bluetakk@bstudiob.co.uk': {
      button: 'Request research access',
      subject: 'BStudioB — BlueTakk research access'
    },
    'nathan+bpo@bstudiob.co.uk': {
      button: 'Become a design partner',
      subject: 'BStudioB — BPO design partner interest',
      note: 'Free, no-obligation updates about future BPO design-partner work.'
    },
    'nathan+picchat@bstudiob.co.uk': {
      button: 'Request research access',
      subject: 'BStudioB — PicChat research access',
      note: 'Free updates about PicChat research and any future private beta.'
    },
    'nathan+cards@bstudiob.co.uk': {
      button: 'Join playtester list',
      subject: 'BStudioB — Cards playtester interest',
      note: 'Free, no-obligation invitations to future Cards playtests.'
    },
    'nathan+blessed@bstudiob.co.uk': {
      button: 'Register community interest',
      subject: 'BStudioB — Blessed community interest',
      note: 'Free, no-obligation updates about the Blessed concept.'
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
    if (note && config.note) {
      note.firstChild.nodeValue = `${config.note} `;
    }
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
