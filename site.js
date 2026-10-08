(() => {
  document.querySelectorAll('[data-tributary-demo]').forEach((demo) => {
    const cues = [
      { label: 'VERSE 1', line: 'Amazing grace, how sweet the sound', subline: 'That saved a soul like me.', next: 'CHORUS', nextLine: 'I once was lost, but now am found' },
      { label: 'CHORUS', line: 'I once was lost, but now am found', subline: 'Was blind, but now I see.', next: 'VERSE 2', nextLine: 'Through many dangers, toils and snares' },
      { label: 'VERSE 2', line: 'Through many dangers, toils and snares', subline: 'I have already come.', next: 'BRIDGE', nextLine: 'Tis grace has brought me safe thus far' },
      { label: 'BRIDGE', line: 'Tis grace has brought me safe thus far', subline: 'And grace will lead me home.', next: 'VERSE 1', nextLine: 'Amazing grace, how sweet the sound' },
    ];
    const pitches = [
      { eyebrow: 'TRIBUTARY / WORK', title: 'One room.', accent: 'Every slide in sync.', note: 'Import · arrange · present', presenter: 'Open with the problem: one room, multiple screens, one calm signal.', nextTitle: 'Build once.', nextAccent: 'Present with confidence.', performerNotes: 'Stay on the current slide until the Controller advances.' },
      { eyebrow: 'TRIBUTARY / WORKFLOW', title: 'Build once.', accent: 'Present with confidence.', note: 'Agenda · slides · audience', presenter: 'Show how the Presenter keeps the next idea ready without taking over the room.', nextTitle: 'The right view.', nextAccent: 'For every person.', performerNotes: 'The next slide is queued while the current slide stays readable.' },
      { eyebrow: 'TRIBUTARY / ROOM', title: 'The right view.', accent: 'For every person.', note: 'Controller · performer · audience', presenter: 'Close on the shared state: every screen receives the right view at the right time.', nextTitle: 'One room.', nextAccent: 'Every slide in sync.', performerNotes: 'Return to the opening slide or continue into questions.' },
    ];
    let cueIndex = 0;
    let performerPreviewIndex = 0;
    let pitchIndex = 0;
    const panels = [...demo.querySelectorAll('[data-tributary-demo-panel]')];
    const tabs = [...demo.querySelectorAll('[data-tributary-demo-tab]')];
    const formatSection = (label) => label.replace('VERSE ', 'Verse ').replace('CHORUS', 'Chorus').replace('BRIDGE', 'Bridge');
    const setPerformerPreview = (nextIndex) => {
      performerPreviewIndex = (nextIndex + cues.length) % cues.length;
      const preview = cues[performerPreviewIndex];
      demo.querySelectorAll('[data-tributary-performer-preview-label]').forEach((node) => { node.textContent = formatSection(preview.label); });
      demo.querySelectorAll('[data-tributary-performer-preview-line]').forEach((node) => { node.textContent = preview.line; });
      demo.querySelectorAll('[data-tributary-performer-preview-subline]').forEach((node) => { node.textContent = preview.subline; });
      demo.querySelectorAll('[data-tributary-performer-section]').forEach((button) => button.classList.toggle('is-current', Number(button.dataset.tributaryPerformerSection) === performerPreviewIndex));
    };
    const setCue = (nextIndex) => {
      cueIndex = (nextIndex + cues.length) % cues.length;
      const cue = cues[cueIndex];
      demo.querySelectorAll('[data-tributary-demo-label]').forEach((node) => { node.textContent = cue.label; });
      demo.querySelectorAll('[data-tributary-demo-line], [data-tributary-audience-line], [data-tributary-performer-line]').forEach((node) => { node.textContent = cue.line; });
      demo.querySelectorAll('[data-tributary-demo-subline], [data-tributary-audience-subline]').forEach((node) => { node.textContent = cue.subline; });
      demo.querySelectorAll('[data-tributary-demo-next-label], [data-tributary-performer-next]').forEach((node) => { node.textContent = cue.next; });
      demo.querySelectorAll('[data-tributary-demo-next-line], [data-tributary-performer-next-line]').forEach((node) => { node.textContent = cue.nextLine; });
      demo.querySelectorAll('[data-tributary-demo-preview-meta]').forEach((node) => { node.textContent = `${formatSection(cue.label)} · Next: ${formatSection(cue.next)}`; });
      demo.querySelectorAll('[data-tributary-demo-section-label], [data-tributary-performer-label]').forEach((node) => { node.textContent = formatSection(cue.label); });
      demo.querySelectorAll('[data-tributary-demo-counter], [data-tributary-performer-count]').forEach((node) => { node.textContent = `${cueIndex + 1} / ${cues.length}`; });
      demo.querySelectorAll('[data-tributary-demo-section]').forEach((button) => button.classList.toggle('is-current', Number(button.dataset.tributaryDemoSection) === cueIndex));
      setPerformerPreview(cueIndex);
      document.querySelectorAll('[data-tributary-hero-label], [data-tributary-hero-line], [data-tributary-hero-subline], [data-tributary-hero-next], [data-tributary-hero-audience], [data-tributary-hero-performer]').forEach((node) => {
        if (node.matches('[data-tributary-hero-label]')) node.textContent = `PREVIEW · ${cue.label}`;
        if (node.matches('[data-tributary-hero-line]')) node.textContent = cue.line;
        if (node.matches('[data-tributary-hero-subline]')) node.textContent = cue.subline;
        if (node.matches('[data-tributary-hero-next]')) node.textContent = cue.next;
        if (node.matches('[data-tributary-hero-audience], [data-tributary-hero-performer]')) node.textContent = formatSection(cue.label);
      });
    };
    const setPanel = (name) => {
      tabs.forEach((tab) => { const active = tab.dataset.tributaryDemoTab === name; tab.classList.toggle('is-active', active); tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; });
      panels.forEach((panel) => { const active = panel.dataset.tributaryDemoPanel === name; panel.classList.toggle('is-active', active); panel.hidden = !active; });
    };
    tabs.forEach((tab, index) => { tab.addEventListener('click', () => setPanel(tab.dataset.tributaryDemoTab)); tab.addEventListener('keydown', (event) => { if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return; event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length; tabs[next].focus(); setPanel(tabs[next].dataset.tributaryDemoTab); }); });
    demo.querySelectorAll('[data-tributary-demo-next]').forEach((button) => button.addEventListener('click', () => setCue(cueIndex + 1)));
    demo.querySelectorAll('[data-tributary-demo-prev]').forEach((button) => button.addEventListener('click', () => setCue(cueIndex - 1)));
    demo.querySelectorAll('[data-tributary-demo-section]').forEach((button) => button.addEventListener('click', () => setCue(Number(button.dataset.tributaryDemoSection))));
    demo.querySelectorAll('[data-tributary-performer-section]').forEach((button) => button.addEventListener('click', () => setPerformerPreview(Number(button.dataset.tributaryPerformerSection))));
    document.querySelector('[data-tributary-hero-next-button]')?.addEventListener('click', () => setCue(cueIndex + 1));
    document.querySelector('[data-tributary-hero-prev]')?.addEventListener('click', () => setCue(cueIndex - 1));

    const setPitch = (nextIndex) => {
      pitchIndex = (nextIndex + pitches.length) % pitches.length;
      const pitch = pitches[pitchIndex];
      const text = (selector, value) => demo.querySelectorAll(selector).forEach((node) => { node.textContent = value; });
      text('[data-tributary-pitch-audience-eyebrow], [data-tributary-pitch-performer-eyebrow], [data-tributary-pitch-performer-label]', pitch.eyebrow);
      text('[data-tributary-pitch-audience-title], [data-tributary-pitch-performer-title]', pitch.title);
      text('[data-tributary-pitch-audience-accent], [data-tributary-pitch-performer-accent]', pitch.accent);
      text('[data-tributary-pitch-audience-note]', pitch.note);
      text('[data-tributary-pitch-notes]', pitch.presenter);
      text('[data-tributary-pitch-performer-next-title]', pitch.nextTitle);
      text('[data-tributary-pitch-performer-next-accent]', pitch.nextAccent);
      text('[data-tributary-pitch-performer-notes]', pitch.performerNotes);
      text('[data-tributary-pitch-counter], [data-tributary-pitch-performer-count]', `${pitchIndex + 1} / ${pitches.length}`);
      demo.querySelectorAll('[data-tributary-pitch-select]').forEach((button) => button.classList.toggle('is-current', Number(button.dataset.tributaryPitchSelect) === pitchIndex));
    };
    demo.querySelector('[data-tributary-pitch-next]')?.addEventListener('click', () => setPitch(pitchIndex + 1));
    demo.querySelector('[data-tributary-pitch-prev]')?.addEventListener('click', () => setPitch(pitchIndex - 1));
    demo.querySelectorAll('[data-tributary-pitch-select]').forEach((button) => button.addEventListener('click', () => setPitch(Number(button.dataset.tributaryPitchSelect))));

    const present = demo.querySelector('[data-tributary-present]');
    if (present) {
      const cameraStreams = { a: null, b: null };
      const cameraNames = { a: 'Camera A', b: 'Camera B' };
      const stage = present.querySelector('[data-tributary-camera-stage]');
      const status = present.querySelector('[data-tributary-camera-status]');
      const fade = present.querySelector('[data-tributary-camera-fade]');
      const switchButton = present.querySelector('[data-tributary-camera-switch]');
      const activeLabel = present.querySelector('[data-tributary-camera-active-label]');
      const stageStatus = present.querySelector('[data-tributary-camera-stage-status]');
      let activeCamera = 'a';
      const updateCameraUi = () => {
        const otherCamera = activeCamera === 'a' ? 'b' : 'a';
        const activeStream = cameraStreams[activeCamera];
        stage.style.setProperty('--tributary-fade-duration', `${fade.value}ms`);
        stage.dataset.activeCamera = activeCamera;
        activeLabel.textContent = `${cameraNames[activeCamera]} · ${activeStream ? 'ON AIR' : 'PREVIEW'}`;
        stageStatus.textContent = `${activeStream ? 'Live camera' : 'Preview scene'} · fade ${fade.value}ms`;
        switchButton.textContent = cameraStreams[otherCamera] ? `Fade to ${cameraNames[otherCamera]} →` : `Request ${cameraNames[otherCamera]} first`;
        switchButton.disabled = !cameraStreams[otherCamera];
        ['a', 'b'].forEach((id) => {
          const video = present.querySelector(`[data-tributary-camera-video="${id}"]`);
          const placeholder = present.querySelector(`[data-tributary-camera-placeholder="${id}"]`);
          video.hidden = !cameraStreams[id];
          placeholder.hidden = Boolean(cameraStreams[id]) || activeCamera !== id;
        });
      };
      const setCamera = async (id) => {
        const button = present.querySelector(`[data-tributary-camera-request="${id}"]`);
        try {
          if (cameraStreams[id]) {
            cameraStreams[id].getTracks().forEach((track) => track.stop());
            cameraStreams[id] = null;
            if (activeCamera === id && cameraStreams[id === 'a' ? 'b' : 'a']) activeCamera = id === 'a' ? 'b' : 'a';
            button.firstChild.nodeValue = `Request ${cameraNames[id]} `;
            status.textContent = `${cameraNames[id]} stopped. Request another angle when ready.`;
            updateCameraUi();
            return;
          }
          if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera access is not available in this browser.');
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          cameraStreams[id] = stream;
          const video = present.querySelector(`[data-tributary-camera-video="${id}"]`);
          video.srcObject = stream;
          button.firstChild.nodeValue = `${cameraNames[id]} active · stop `;
          if (!cameraStreams[activeCamera]) activeCamera = id;
          status.textContent = `${cameraNames[id]} is available in the local scene preview.`;
          updateCameraUi();
        } catch (error) {
          status.textContent = `${cameraNames[id]} was not shared: ${error.message || 'permission was not granted.'}`;
        }
      };
      present.querySelectorAll('[data-tributary-camera-request]').forEach((button) => button.addEventListener('click', () => setCamera(button.dataset.tributaryCameraRequest)));
      fade.addEventListener('change', updateCameraUi);
      switchButton.addEventListener('click', () => {
        const otherCamera = activeCamera === 'a' ? 'b' : 'a';
        if (!cameraStreams[otherCamera]) return;
        activeCamera = otherCamera;
        status.textContent = `Fading to ${cameraNames[activeCamera]} over ${fade.value}ms.`;
        updateCameraUi();
      });

      const overlay = present.querySelector('[data-tributary-camera-overlay]');
      const overlayText = present.querySelector('[data-tributary-overlay-text]');
      const overlayCopy = present.querySelector('[data-tributary-overlay-copy]');
      const overlayState = present.querySelector('[data-tributary-overlay-state]');
      const overlayScale = present.querySelector('[data-tributary-overlay-scale]');
      const overlayOpacity = present.querySelector('[data-tributary-overlay-opacity]');
      const updateOverlay = () => {
        overlayCopy.textContent = overlayText.value.trim() || 'Live text overlay';
        overlay.style.setProperty('--overlay-scale', Number(overlayScale.value) / 100);
        overlay.style.setProperty('--overlay-opacity', Number(overlayOpacity.value) / 100);
      };
      overlayText.addEventListener('input', updateOverlay);
      overlayScale.addEventListener('input', updateOverlay);
      overlayOpacity.addEventListener('input', updateOverlay);
      present.querySelectorAll('[data-tributary-overlay-position]').forEach((button) => button.addEventListener('click', () => {
        present.querySelectorAll('[data-tributary-overlay-position]').forEach((item) => item.classList.toggle('is-current', item === button));
        overlay.dataset.position = button.dataset.tributaryOverlayPosition;
        overlayState.textContent = button.textContent;
      }));
      updateOverlay();
      updateCameraUi();

      const interactions = [
        { alert: 'New question from the room', copy: '“Can you share the next section?”', kind: 'Question · waiting for host', name: 'Alex', chat: 'Love the lower third — clear and calm.' },
        { alert: 'Poll response spike', copy: '“Show the wide camera view.”', kind: 'Request · 34 votes', name: 'Maya', chat: 'The detail angle makes this feel close.' },
        { alert: 'Chat message approved', copy: '“Please repeat the final point.”', kind: 'Question · moderator approved', name: 'Jordan', chat: 'Ready when you are — we can see the slide.' },
      ];
      let interactionIndex = 0;
      const setInteraction = (nextIndex) => {
        interactionIndex = (nextIndex + interactions.length) % interactions.length;
        const interaction = interactions[interactionIndex];
        present.querySelector('[data-tributary-interaction-alert]').textContent = interaction.alert;
        present.querySelector('[data-tributary-interaction-copy]').textContent = interaction.copy;
        present.querySelector('[data-tributary-interaction-kind]').textContent = interaction.kind;
        present.querySelector('[data-tributary-chat-name]').textContent = interaction.name;
        present.querySelector('[data-tributary-chat-copy]').textContent = interaction.chat;
        present.querySelector('[data-tributary-interaction-alert-count]').textContent = String(interactionIndex + 2).padStart(2, '0');
      };
      present.querySelector('[data-tributary-interaction-next]')?.addEventListener('click', () => setInteraction(interactionIndex + 1));
      setInteraction(0);
    }

    setCue(0);
    setPitch(0);
    setPanel('perform');
  });

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
