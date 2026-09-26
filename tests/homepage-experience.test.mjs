import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const home = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const script = readFileSync(new URL('../site.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

test('homepage product cards form the intended four-card, two-by-two grid', () => {
  const cards = [...home.matchAll(/<a class="hero-product ([^"]+)" href="([^"]+)"/g)];
  assert.equal(cards.length, 4);
  assert.deepEqual(cards.map((match) => match[1].split(' ').at(-1)), [
    'hero-flowcue', 'hero-buildy', 'hero-provisioning', 'hero-service'
  ]);
  assert.match(css, /\.hero-product-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /\.hero-product\s*\{[^}]*aspect-ratio:\s*1/);
  assert.match(css, /@media\s*\(max-width:\s*700px\)[\s\S]*?\.hero-product[^}]*aspect-ratio:\s*auto/);
  assert.doesNotMatch(css, /\.hero-service\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/);
  assert.doesNotMatch(css, /\.hero-product:hover,\s*\.hero-product:focus-within\s*\{[^}]*position:\s*absolute/);
  assert.doesNotMatch(css, /\.hero-product-grid:has\([^}]*visibility:\s*hidden/);
});

test('square product tiles keep their image, description and CTA compact', () => {
  assert.match(css, /\.hero-product figure\s*\{[^}]*flex-basis:\s*92px[^}]*height:\s*92px/);
  assert.match(css, /\.hero-product-copy h2\s*\{[^}]*font-size:\s*clamp\(1\.35rem,\s*2\.35vw,\s*2\.1rem\)/);
  assert.doesNotMatch(css, /\.hero-product-copy p\s*\{[^}]*display:\s*none/);
  for (const label of ['Explore product', 'Open staging app', 'Explore services']) assert.ok(home.includes(label), `${label} CTA remains in the homepage cards`);
});

test('homepage carousel includes the studio, product, service, portal and invitation slides', () => {
  assert.match(home, /data-studio-carousel/);
  for (const copy of [
    'Focused software, clearer systems and practical workflow improvement.',
    'Custom Workflow Solutions',
    'account.bstudiob.co.uk',
    'Have a product, pilot or partnership in mind?',
    'We welcome conversations with people and organisations who care about making useful things well.'
  ]) assert.ok(home.includes(copy), `carousel includes: ${copy}`);
  for (const href of ['creative-live.html', 'studio-tools.html', 'https://provisioning.bstudiob.co.uk/', 'trust-security.html', 'cards.html', 'products/pit/']) {
    assert.ok(home.includes(`href="${href}"`), `carousel links to ${href}`);
  }
  assert.match(home, /intended to give customers|planned customer portal/i);
  assert.match(home, /product access/i);
  assert.match(home, /support requests?/i);
});

test('one persistent enquiry form remains available beside every slide without changing routing or consent', () => {
  assert.equal((home.match(/<form\b/g) || []).length, 1);
  assert.match(home, /id="studio-enquiry-form"[^>]*action="https:\/\/formsubmit\.co\/nathan\+contact@bstudiob\.co\.uk"/);
  assert.match(home, /name="_next" value="https:\/\/bstudiob\.co\.uk\/thanks\.html"/);
  assert.match(home, /name="privacy_consent" type="checkbox" required/);
  assert.match(home, /class="studio-enquiry-panel"/);
  assert.match(home, /href="#studio-enquiry-form"/);
});

test('carousel controls are accessible, keyboard-operable and never auto-advance', () => {
  assert.match(home, /role="region" aria-roledescription="carousel"/);
  assert.match(home, /class="studio-carousel-slides" aria-live="polite"/);
  assert.match(home, /role="tablist"/);
  assert.match(home, /data-studio-tab/);
  assert.match(home, /data-studio-prev/);
  assert.match(home, /data-studio-next/);
  assert.match(script, /data-studio-carousel/);
  assert.match(script, /aria-hidden/);
  assert.match(script, /\['ArrowLeft', 'ArrowRight', 'Home', 'End'\]/);
  assert.match(script, /\.inert\s*=/);
  assert.doesNotMatch(script, /setInterval|autoplay/i);
});

test('homepage transitions keep content readable at touch sizes and respect reduced motion', () => {
  assert.match(css, /@media\s*\(max-width:\s*700px\)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /\.studio-slide[^}]*animation/);
  assert.match(css, /\.hero-product:focus-visible/);
  assert.match(script, /prefers-reduced-motion:\s*reduce/);
});
