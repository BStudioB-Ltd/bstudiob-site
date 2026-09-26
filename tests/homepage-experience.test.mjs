import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const home = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const script = readFileSync(new URL('../site.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

test('homepage keeps the original hero and lower-page composition around a four-slide hero carousel', () => {
  const hero = home.match(/<section class="hero hero-carousel"[\s\S]*?<\/section>/)?.[0] ?? '';
  assert.ok(hero, 'hero remains a distinct section');
  assert.match(hero, /grid-template|data-hero-carousel/);
  const tabs = [...hero.matchAll(/role="tab"[^>]*data-hero-tab[^>]*>([^<]+)</g)].map((match) => match[1]);
  assert.deepEqual(tabs, ['About', 'Products and Services', 'Make your BStudioB account', 'Contact']);
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
    'creative-live.html', 'studio-tools.html', 'https://provisioning.bstudiob.co.uk/', 'services.html'
  ]);
  assert.match(products, /hero-product-grid/);
  assert.match(products, /Custom Workflow Solutions/);
  assert.match(css, /\.hero-product-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /\.hero-product\s*\{[^}]*aspect-ratio:\s*1/);
});

test('About, account and Contact hero slides retain the earlier editorial hero footprint', () => {
  for (const slide of ['about', 'account', 'contact']) {
    const panel = home.match(new RegExp(`<article\\b(?=[^>]*id="hero-slide-${slide}")[^>]*>[\\s\\S]*?<\\/article>`))?.[0] ?? '';
    assert.ok(panel, `${slide} slide exists`);
    assert.match(panel, /hero-copy/);
  }
  const about = home.match(/<article\b(?=[^>]*id="hero-slide-about")[^>]*>[\s\S]*?<\/article>/)?.[0] ?? '';
  assert.match(about, /Exactly/);
  assert.match(about, /specifically/);
});

test('planned account and contact slides use the existing enquiry route without moving the form into the hero', () => {
  const account = home.match(/<article\b(?=[^>]*id="hero-slide-account")[^>]*>[\s\S]*?<\/article>/)?.[0] ?? '';
  const contact = home.match(/<article\b(?=[^>]*id="hero-slide-contact")[^>]*>[\s\S]*?<\/article>/)?.[0] ?? '';
  assert.match(account, /account\.bstudiob\.co\.uk/);
  assert.match(account, /planned|developing/i);
  assert.match(account, /not available yet|not open yet/i);
  assert.match(contact, /Have a product, pilot or partnership in mind\?/);
  assert.equal((home.match(/<form\b/g) || []).length, 1);
  assert.doesNotMatch(home.match(/<section class="hero hero-carousel"[\s\S]*?<\/section>/)?.[0] ?? '', /<form\b/);
  assert.match(home, /id="studio-enquiry-form"[^>]*action="https:\/\/formsubmit\.co\/nathan\+contact@bstudiob\.co\.uk"/);
  assert.match(home, /name="privacy_consent" type="checkbox" required/);
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

test('About uses four centered navigation cards over a restrained BStudioB mark backdrop', () => {
  const about = home.match(/<article\b(?=[^>]*id="hero-slide-about")[^>]*>[\s\S]*?<\/article>/)?.[0] ?? '';
  assert.match(about, /hero-about-options/);
  for (const label of ['About', 'Products and Services', 'Make your BStudioB account', 'Contact']) {
    assert.match(about, new RegExp(`>${label}<`));
  }
  assert.match(about, /data-hero-select/);
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
