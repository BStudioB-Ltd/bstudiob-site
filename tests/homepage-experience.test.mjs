import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const home = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const script = readFileSync(new URL('../site.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

test('homepage hero opens on About and provides four accessible destinations', () => {
  assert.match(home, /data-studio-carousel/);
  const tabs = [...home.matchAll(/role="tab"[^>]*data-studio-tab[^>]*>([^<]+)</g)].map((match) => match[1]);
  assert.deepEqual(tabs, ['About', 'Products and Services', 'Make your BStudioB account', 'Contact']);
  const slides = [...home.matchAll(/<article class="studio-slide[^>]*id="studio-slide-([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(slides, ['about', 'products', 'account', 'contact']);
  assert.match(home, /studio-slide-about[^>]*role="tabpanel"[^>]*aria-labelledby="studio-tab-about"/);
  assert.match(home, /studio-slide-about[^>]*is-active/);
});

test('Products and Services reveals the four existing square hero cards and routes', () => {
  const products = home.match(/<article\b(?=[^>]*id="studio-slide-products")[^>]*>[\s\S]*?<\/article>/)?.[0] ?? '';
  const cards = [...products.matchAll(/<a class="hero-product ([^"]+)" href="([^"]+)"/g)];
  assert.equal(cards.length, 4);
  assert.deepEqual(cards.map((match) => match[1].split(' ').at(-1)), [
    'hero-flowcue', 'hero-buildy', 'hero-provisioning', 'hero-service'
  ]);
  assert.deepEqual(cards.map((match) => match[2]), [
    'creative-live.html', 'studio-tools.html', 'https://provisioning.bstudiob.co.uk/', 'services.html'
  ]);
  assert.match(css, /\.hero-product-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /\.hero-product\s*\{[^}]*aspect-ratio:\s*1/);
});

test('square product cards align titles, descriptions and links without clipping', () => {
  assert.match(css, /\.hero-product-copy\s*\{[^}]*display:\s*flex[^}]*flex-direction:\s*column/);
  assert.match(css, /\.hero-product-copy h3\s*\{[^}]*min-height:/);
  assert.match(css, /\.hero-product-copy b\s*\{[^}]*margin-top:\s*auto/);
  assert.match(css, /\.studio-summary \.hero-product \.hero-product-copy > p:not\(\.studio-summary-links\)\s*\{[^}]*margin:\s*0[^}]*font-size:\s*\.76rem/);
  assert.match(css, /\.studio-summary \.hero-product\.hero-service \.hero-product-copy > p:not\(\.studio-summary-links\)\s*\{[^}]*font-size:\s*\.68rem/);
  assert.doesNotMatch(home, /Subject to scope\s*[·-]\s*no guaranteed savings implied/i);
  for (const label of ['Explore product', 'Open staging app', 'Explore services']) assert.ok(home.includes(label), `${label} CTA remains in the homepage cards`);
});

test('account slide describes the planned portal without implying open registration', () => {
  const account = home.match(/<article\b(?=[^>]*id="studio-slide-account")[^>]*>[\s\S]*?<\/article>/)?.[0] ?? '';
  assert.match(account, /account\.bstudiob\.co\.uk/);
  assert.match(account, /planned|developing/i);
  assert.match(account, /not available yet|not open yet/i);
  assert.doesNotMatch(account, /<form|Sign up now|Create account now/i);
});

test('one persistent enquiry form remains beside every slide with routing and consent intact', () => {
  assert.equal((home.match(/<form\b/g) || []).length, 1);
  assert.match(home, /id="studio-enquiry-form"[^>]*action="https:\/\/formsubmit\.co\/nathan\+contact@bstudiob\.co\.uk"/);
  assert.match(home, /name="_next" value="https:\/\/bstudiob\.co\.uk\/thanks\.html"/);
  assert.match(home, /name="privacy_consent" type="checkbox" required/);
  assert.match(home, /class="studio-enquiry-panel"/);
});

test('carousel controls are accessible, keyboard-operable and never auto-advance', () => {
  assert.match(home, /role="region" aria-roledescription="carousel"/);
  assert.match(home, /aria-live="polite"/);
  assert.match(home, /role="tablist"/);
  assert.match(home, /data-studio-tab/);
  assert.match(home, /data-studio-prev/);
  assert.match(home, /data-studio-next/);
  assert.match(script, /data-studio-carousel/);
  assert.match(script, /aria-hidden/);
  assert.match(script, /\['ArrowLeft', 'ArrowRight', 'Home', 'End'\]/);
  assert.match(script, /\.inert\s*=/);
  assert.match(script, /a\[href\^="#studio-tab-"\]/);
  assert.doesNotMatch(script, /setInterval|autoplay/i);
});

test('homepage and card copy identify BStudioB LTD and remove the old studio strapline', () => {
  assert.match(home, /BStudioB LTD/);
  assert.doesNotMatch(home, /Independent product studio\s*[·-]\s*UK/i);
});

test('scroll reveals progressively enhance with view timelines and defer to reduced motion', () => {
  assert.match(css, /scroll-behavior:\s*smooth/);
  assert.match(css, /@supports\s*\(animation-timeline:\s*view\(\)\)/);
  assert.match(css, /animation-timeline:\s*view\(\)/);
  assert.match(css, /animation-range:/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /scroll-behavior:\s*auto/);
});

test('hero carousel and square cards adapt to tablet and mobile widths', () => {
  assert.match(css, /@media\s*\(max-width:\s*1000px\)/);
  assert.match(css, /@media\s*\(max-width:\s*700px\)/);
  assert.ok(css.includes('.hero-product-grid { grid-template-columns: minmax(0, 1fr);'), 'mobile product cards use a single-column layout');
  assert.match(css, /\.studio-carousel-layout[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
});
