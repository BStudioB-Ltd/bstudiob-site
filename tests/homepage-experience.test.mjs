import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const home = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const script = readFileSync(new URL('../site.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

test('homepage opens on a distinct Home slide with a separate About slide in the hero carousel', () => {
  const heroStart = home.indexOf('<section class="hero hero-carousel"');
  const heroEnd = home.indexOf('<section class="studio-summary"', heroStart);
  const hero = home.slice(heroStart, heroEnd);
  assert.ok(hero, 'hero remains a distinct section');
  assert.match(hero, /grid-template|data-hero-carousel/);
  const tabs = [...hero.matchAll(/role="tab"[^>]*data-hero-tab[^>]*>([^<]+)</g)].map((match) => match[1]);
  assert.deepEqual(tabs, ['Home', 'About BStudioB', 'Products and Services', 'Your account', 'Contact']);
  assert.match(hero, /<article class="hero-slide hero-slide-home is-active" id="hero-slide-home"/);
  assert.match(hero, /<article class="hero-slide hero-slide-about" id="hero-slide-about"[^>]*hidden/);
  const homeSlide = hero.match(/<article\b(?=[^>]*id="hero-slide-home")[^>]*>[\s\S]*?<\/article>/)?.[0] ?? '';
  assert.deepEqual([...homeSlide.matchAll(/data-hero-select="(\d+)"/g)].map((match) => Number(match[1])), [1, 2, 3, 4]);
  assert.match(home, /<section class="studio-summary"/);
  assert.match(home, /class="studio-enquiry-panel"/);
});

test('the Products and Services hero slide alone reveals the four existing square cards', () => {
  const products = home.match(/<article\b(?=[^>]*id="hero-slide-products")[^>]*>[\s\S]*?<\/article>/)?.[0] ?? '';
  const cards = [...products.matchAll(/<a class="hero-product ([^"]+)" href="([^"]+)"/g)];
  assert.equal(cards.length, 4);
  assert.deepEqual(cards.map((match) => match[1].split(' ').at(-1)), [
    'hero-flowcue', 'hero-buildy', 'hero-provisioning', 'hero-service'
  ]);
  assert.deepEqual(cards.map((match) => match[2]), [
    'tributary/', 'studio-tools.html', 'https://provisioning.bstudiob.co.uk/', 'services.html'
  ]);
  assert.match(products, /hero-product-grid/);
  assert.match(products, /Custom Workflow Solutions/);
  assert.match(css, /\.hero-product-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /\.hero-product\s*\{[^}]*aspect-ratio:\s*1/);
});

test('Home remains the tagline and topic-card landing, while About tells the company story', () => {
  const homeSlide = home.match(/<article\b(?=[^>]*id="hero-slide-home")[^>]*>[\s\S]*?<\/article>/)?.[0] ?? '';
  assert.match(homeSlide, /Exactly/);
  assert.match(homeSlide, /specifically/);
  assert.match(homeSlide, /hero-about-options/);
  const about = home.match(/<article\b(?=[^>]*id="hero-slide-about")[^>]*>[\s\S]*?<\/article>/)?.[0] ?? '';
  assert.match(about, /Why BStudioB exists/);
  assert.match(about, /Why it matters/);
  assert.match(about, /Our approach/);
  assert.match(about, /Nathan Brown-Bennett/);
  assert.match(about, /Our aims/);
  assert.match(about, /href="#studio-enquiry-form">Invest in us/);
  assert.match(script, /Number\(card\.dataset\.heroSelect\)\s*===\s*current/);
  for (const slide of ['home', 'about', 'account', 'contact']) {
    const panel = home.match(new RegExp(`<article\\b(?=[^>]*id="hero-slide-${slide}")[^>]*>[\\s\\S]*?<\\/article>`))?.[0] ?? '';
    assert.ok(panel, `${slide} slide exists`);
    assert.match(panel, /hero-copy/);
  }
});

test('customer account slide embeds the working portal with a direct fallback without moving the enquiry form', () => {
  const account = home.match(/<article\b(?=[^>]*id="hero-slide-account")[^>]*>[\s\S]*?<\/article>/)?.[0] ?? '';
  const contact = home.match(/<article\b(?=[^>]*id="hero-slide-contact")[^>]*>[\s\S]*?<\/article>/)?.[0] ?? '';
  assert.match(account, /Buildy/);
  assert.match(account, /FlowCue/);
  assert.match(account, /Device Provisioning Toolkit/);
  assert.match(account, /status and expiry/i);
  assert.match(account, /<iframe[^>]+src="https:\/\/product-license-manager-staging\.nathan-e53\.workers\.dev\//);
  assert.match(account, /title="BStudioB customer sign in and account creation"/);
  assert.match(account, /href="https:\/\/product-license-manager-staging\.nathan-e53\.workers\.dev\//);
  assert.match(account, /Open account portal/i);
  assert.doesNotMatch(account, /Planned customer portal|not available yet|not open yet|account\.bstudiob\.co\.uk/i);
  assert.match(contact, /Have a product, pilot or partnership in mind\?/);
  assert.equal((home.match(/<form\b/g) || []).length, 1);
  assert.doesNotMatch(home.match(/<section class="hero hero-carousel"[\s\S]*?<\/section>/)?.[0] ?? '', /<form\b/);
  assert.match(home, /id="studio-enquiry-form"[^>]*action="https:\/\/formsubmit\.co\/nathan\+contact@bstudiob\.co\.uk"/);
  assert.match(home, /name="privacy_consent" type="checkbox" required/);
});

test('homepage navigation includes My account and carousel controls follow the hero slides', () => {
  const nav = home.match(/<nav aria-label="Primary navigation">[\s\S]*?<\/nav>/)?.[0] ?? '';
  const heroStart = home.indexOf('<section class="hero hero-carousel"');
  const slidesStart = home.indexOf('class="hero-carousel-slides"', heroStart);
  const controlsStart = home.indexOf('class="hero-carousel-controls"', heroStart);
  assert.match(nav, /href="\/myaccount\/">My account/);
  assert.match(nav, /href="#studio-enquiry-form">Contact/);
  assert.ok(slidesStart >= 0 && controlsStart > slidesStart, 'carousel controls follow the slides');
  assert.match(script, /carousel\.classList\.add\('has-selection'\)[\s\S]*?show\(index\)/);
  assert.match(script, /a\[href\^="#hero-slide-"\]/);
});

test('successful iframe sign-in redirects to a first-party My account dashboard route', () => {
  const nav = home.match(/<nav aria-label="Primary navigation">[\s\S]*?<\/nav>/)?.[0] ?? '';
  const accountPagePath = new URL('../myaccount/index.html', import.meta.url);
  assert.match(nav, /href="\/myaccount\/">My account/);
  assert.match(script, /event\.data\.authenticated\s*&&\s*window\.location\.pathname\s*!==\s*'\/myaccount\/'/);
  assert.match(script, /window\.location\.assign\('\/myaccount\/'\)/);
  assert.equal(existsSync(accountPagePath), true);
  const accountPage = readFileSync(accountPagePath, 'utf8');
  assert.match(accountPage, /<iframe[^>]+class="account-portal-frame"/);
  assert.match(accountPage, /src="https:\/\/product-license-manager-staging\.nathan-e53\.workers\.dev\//);
  assert.match(accountPage, /id="account-frame-heading"/);
});

test('embedded account portal is responsive and has a usable direct-link fallback', () => {
  const account = home.match(/<article\b(?=[^>]*id="hero-slide-account")[^>]*>[\s\S]*?<\/article>/)?.[0] ?? '';
  assert.match(account, /class="account-portal-frame"/);
  assert.match(account, /loading="lazy"/);
  assert.match(account, /\?embed=1/);
  assert.match(account, /referrerpolicy="strict-origin-when-cross-origin"/);
  assert.match(css, /\.account-portal-frame\s*\{[^}]*width:\s*100%/);
  assert.match(css, /\.account-portal-frame\s*\{[^}]*min-height:/);
  assert.match(script, /account-portal-frame/);
  assert.match(script, /event\.source\s*!==\s*accountFrame\.contentWindow/);
  assert.match(script, /event\.origin\s*!==\s*new URL\(accountFrame\.src\)\.origin/);
  assert.match(script, /account-portal:resize/);
  assert.match(script, /Math\.ceil\(height\)\s*\+\s*4/);
  assert.match(home, /site\.js\?v=[^"']+/);
  assert.match(home, /styles\.css\?v=[^"']+/);
});

test('BStudioB page reflects verified account state only from its account iframe', () => {
  assert.match(home, /id="account-auth-status"[^>]+aria-live="polite"/);
  assert.match(home, /id="account-intro-copy"/);
  assert.match(home, /id="account-frame-heading"/);
  assert.match(script, /event\.source\s*!==\s*accountFrame\.contentWindow/);
  assert.match(script, /event\.origin\s*!==\s*new URL\(accountFrame\.src\)\.origin/);
  assert.match(script, /account-portal:auth-state/);
  assert.match(script, /typeof event\.data\.authenticated\s*!==\s*'boolean'/);
  assert.match(script, /account-auth-status/);
  assert.match(script, /account-frame-heading/);
  assert.match(script, /You’re signed in to your BStudioB account/);
  assert.match(script, /Your BStudioB dashboard/);
});

test('BStudioB page requests auth state after iframe load and retries until it receives a response', () => {
  assert.match(script, /accountFrame\.addEventListener\('load',\s*requestAccountState\)/);
  assert.match(script, /account-portal:request-auth-state/);
  assert.match(script, /window\.setTimeout\(retryAccountState, 500\)/);
  assert.match(script, /accountStateReceived = true/);
});

test('hero tabs are keyboard-accessible and navigation activates Products and Services', () => {
  assert.match(home, /<section class="hero hero-carousel"[^>]*data-hero-carousel[^>]*role="region" aria-roledescription="carousel"/);
  assert.match(home, /role="tablist"/);
  assert.match(home, /data-hero-tab/);
  assert.match(home, /data-hero-prev/);
  assert.match(home, /data-hero-next/);
  assert.match(script, /data-studio-carousel/);
  assert.match(script, /aria-hidden/);
  assert.match(script, /\['ArrowLeft', 'ArrowRight', 'Home', 'End'\]/);
  assert.match(script, /\.inert\s*=/);
  assert.match(script, /a\[href\^="#hero-tab-"\]/);
  assert.doesNotMatch(script, /setInterval|autoplay/i);
});

test('primary Contact navigation returns visitors to the consent-aware enquiry form', () => {
  const nav = home.match(/<nav aria-label="Primary navigation">[\s\S]*?<\/nav>/)?.[0] ?? '';
  assert.match(nav, /<a href="#studio-enquiry-form">Contact<\/a>/);
  assert.match(home, /<form id="studio-enquiry-form"[^>]*>/);
  assert.match(home, /name="privacy_consent" type="checkbox" required/);
});

test('homepage header keeps Contact and removes the redundant Company, Products, and Services links', () => {
  const nav = home.match(/<nav aria-label="Primary navigation">[\s\S]*?<\/nav>/)?.[0] ?? '';
  assert.match(nav, /href="\/myaccount\/">My account<\/a>/);
  assert.match(nav, /<a href="#studio-enquiry-form">Contact<\/a>/);
  assert.doesNotMatch(nav, />Company<|>Products<|>Services</);
});

test('homepage carousel controls use the site’s square-edged geometric style', () => {
  assert.match(css, /\.hero-tab, \.hero-carousel-arrows button, \.studio-tab, \.studio-carousel-arrows button\s*\{\s*border-radius:\s*0/);
});

test('four service cards remain aligned and the founder-requested copy is retained', () => {
  assert.match(css, /\.hero-product-copy\s*\{[^}]*display:\s*flex[^}]*flex-direction:\s*column/);
  assert.match(css, /\.hero-product-copy h2\s*\{[^}]*min-height:/);
  assert.match(css, /\.hero-product-copy b\s*\{[^}]*margin-top:\s*auto/);
  assert.match(home, /BStudioB LTD/);
  assert.doesNotMatch(home, /Subject to scope\s*[·-]\s*no guaranteed savings implied/i);
});

test('the hero uses restrained load and scroll-driven motion with reduced-motion support', () => {
  assert.match(css, /scroll-behavior:\s*smooth/);
  assert.match(css, /@supports\s*\(animation-timeline:\s*view\(\)\)/);
  assert.match(css, /animation-timeline:\s*view\(\)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /scroll-behavior:\s*auto/);
  assert.match(script, /prefers-reduced-motion:\s*reduce/);
});

test('hero carousel and cards adapt to tablet and mobile widths', () => {
  assert.match(css, /@media\s*\(max-width:\s*1000px\)/);
  assert.match(css, /@media\s*\(max-width:\s*700px\)/);
  assert.match(css, /\.hero-product-grid\s*\{[^}]*grid-template-columns:\s*1fr/);
  assert.match(css, /\.hero-slide\s*\{[^}]*display:\s*grid/);
});

test('Home keeps four centered navigation cards over a restrained BStudioB mark backdrop', () => {
  const homeSlide = home.match(/<article\b(?=[^>]*id="hero-slide-home")[^>]*>[\s\S]*?<\/article>/)?.[0] ?? '';
  assert.match(homeSlide, /hero-about-options/);
  for (const label of ['About', 'Products and Services', 'Your account', 'Contact']) {
    assert.match(homeSlide, new RegExp(`>${label}<`));
  }
  assert.match(homeSlide, /data-hero-select/);
  assert.match(script, /data-hero-select/);
  assert.match(css, /hero-slide-about[^}]*::before|hero-about-options/);
  assert.match(css, /bstudiob-signature\.svg/);
  assert.match(css, /\.hero-about-card\s*\{[^}]*background:\s*var\(--paper\)/);
  assert.match(css, /\.hero-about-card:hover,\s*\.hero-about-card:focus-visible\s*\{[^}]*background:\s*#eae8e0/);
  assert.doesNotMatch(css, /\.hero-about-card\s*\{[^}]*backdrop-filter/);
  assert.match(css, /cubic-bezier\(\.22,\s*1,\s*\.36,\s*1\)/);
});

test('BStudioB hero watermark stays centered behind the carousel and scales up responsively', () => {
  assert.match(css, /\.hero\.hero-carousel::before\s*\{[^}]*z-index:\s*0/);
  assert.match(css, /\.hero-carousel-controls\s*,\s*\.hero-carousel-slides\s*\{[^}]*position:\s*relative[^}]*z-index:\s*1/);
  assert.match(css, /background:\s*url\("assets\/brand\/bstudiob-signature\.svg"\)\s+50%\s+50%\s*\/\s*min\(100%,\s*1180px\)\s+auto\s+no-repeat/);
  assert.match(css, /@media\s*\(max-width:\s*700px\)\s*\{[^}]*hero\.hero-carousel::before[^}]*background-position:\s*50%\s+50%[^}]*background-size:\s*135%\s+auto/);
});

test('hero carousel controls are revealed only after a visitor selects an About card', () => {
  const hero = home.match(/<section class="hero hero-carousel"[\s\S]*?<\/section>/)?.[0] ?? '';
  assert.doesNotMatch(hero, /has-selection/);
  assert.match(css, /\.hero-carousel:not\(\.has-selection\)\s+\.hero-carousel-controls\s*\{\s*display:\s*none/);
  assert.match(script, /carousel\.classList\.add\('has-selection'\);\s*const selected = Number\(card\.dataset\.heroSelect\);\s*tabs\[selected\]\?\.focus\(\);\s*show\(selected\)/);
});

test('selecting an About card moves keyboard focus out of its slide before the slide is hidden', () => {
  assert.match(script, /const selected = Number\(card\.dataset\.heroSelect\);\s*tabs\[selected\]\?\.focus\(\);\s*show\(selected\)/);
});

test('Products and Services has an accessible preview carousel with first-party product imagery', () => {
  const products = home.match(/<article\b(?=[^>]*id="hero-slide-products")[^>]*>[\s\S]*?<\/article>/)?.[0] ?? '';
  assert.match(products, /data-product-gallery/);
  assert.match(products, /Inspector-Edu™/);
  assert.match(products, /Cards™/);
  assert.match(products, /PIT™ \/ PicChat/);
  for (const asset of ['inspector-story-mode.png', 'cards-mobile.png', 'pit-moderation-desktop.png']) {
    assert.match(products, new RegExp(`assets/projects/${asset}`));
  }
  assert.match(products, /data-product-gallery-tab/);
  assert.match(script, /data-product-gallery/);
  assert.match(script, /data-product-gallery-tab/);
});

test('studio summary is a four-page carousel with honest case-study and research placeholders', () => {
  const summary = home.match(/<section class="studio-summary"[\s\S]*?<\/section>/)?.[0] ?? '';
  assert.ok(summary);
  const tabs = [...summary.matchAll(/class="studio-tab[^\"]*"[^>]*>([^<]+)</g)].map((match) => match[1].replaceAll('&amp;', '&'));
  assert.deepEqual(tabs, ['Projects & images', 'Case studies', 'Research', 'CTA']);
  assert.match(summary, /Project imagery/);
  assert.match(summary, /Public client case studies will be added/);
  assert.match(summary, /Approved research will be added/);
  assert.match(summary, /Have a product, pilot or partnership in mind\?/);
  assert.match(css, /\.studio-project-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(summary, /id="studio-enquiry-form"[^>]*action="https:\/\/formsubmit\.co\/nathan\+contact@bstudiob\.co\.uk"/);
  assert.match(summary, /privacy_consent/);
});

test('homepage carousel keeps preview boundaries, accessible imagery and motion fallbacks', () => {
  const products = home.match(/<article\b(?=[^>]*id="hero-slide-products")[^>]*>[\s\S]*?<\/article>/)?.[0] ?? '';
  assert.match(products, /Availability varies/);
  assert.match(products, /alt="[^"]+"/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /product-gallery/);
  assert.match(css, /studio-project-grid/);
});
