import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const html = readFileSync(new URL('../creative-live.html', import.meta.url), 'utf8');
const home = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const script = readFileSync(new URL('../site.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
const slideStarts = [...html.matchAll(/<div class="tributary-slide(?: is-active)?"/g)].map((match) => match.index);
const slides = slideStarts.map((start, index) => html.slice(start, slideStarts[index + 1] ?? html.indexOf('<div class="tributary-carousel-controls"', start)));

test('Tributary product page identifies the rebranded trusted-LAN product', () => {
  assert.match(html, /<title>Tributary — BStudioB<\/title>/);
  assert.match(html, /Tributary \(formerly FlowCue\)/);
  assert.match(html, /invite-only/);
  assert.match(html, /trusted local network/);
  assert.doesNotMatch(html, /£(?:0|19|49|99)\b/);
});

test('carousel contains the overview followed by Church, Work, and Artist slides', () => {
  assert.match(html, /data-tributary-carousel/);
  assert.equal(slides.length, 4, 'there must be exactly four carousel panels');
  const titles = slides.map((slide) => slide.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)?.[1]?.replace(/<[^>]+>/g, '').trim());
  assert.deepEqual(titles, ['Start with Tributary', 'Church', 'Work', 'Artist']);
  for (const mode of ['Church', 'Work', 'Artist']) {
    const slide = slides.find((candidate) => candidate.includes(`<h2>${mode}</h2>`));
    assert.ok(slide, `${mode} slide exists`);
    assert.match(slide, /what-it-offers/);
    assert.match(slide, /how-it-works/);
    assert.match(slide, /alternative/);
  }
});

test('each mode compares the indicative tiers without promising unavailable features', () => {
  for (const slide of slides.slice(1)) {
    for (const tier of ['Venue', 'Studio', 'Network']) assert.ok(slide.includes(tier), `${tier} tier shown in each mode`);
    assert.match(slide, /£20\s*\/\s*month/);
    assert.match(slide, /£50\s*\/\s*month/);
    assert.match(slide, /£150\s*(?:from\s*)?\/\s*month/);
    assert.match(slide, /£190\s*\/\s*year/);
    assert.match(slide, /£490\s*\/\s*year/);
    assert.match(slide, /planned/i);
    assert.match(slide, /founding-pilot|indicative/i);
  }
  assert.doesNotMatch(html, /Buy now|Start subscription|Create account/i);
});

test('carousel imagery has meaningful alternative text and no auto-advance', () => {
  assert.equal((html.match(/class="tributary-slide(?: is-active)?"/g) || []).length, 4);
  for (const match of html.matchAll(/<img\b([^>]*)>/g)) assert.match(match[1], /alt="[^"]+"/);
  assert.match(html, /aria-selected="true"/);
  assert.match(html, /data-carousel-prev/);
  assert.match(html, /data-carousel-next/);
  assert.match(script, /data-tributary-carousel/);
  assert.match(script, /aria-hidden/);
  assert.match(script, /ArrowLeft|ArrowRight/);
  assert.doesNotMatch(script, /setInterval|autoplay/i);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(html, /assets\/brand\/tributary-mark-blue\.png/);
  assert.match(html, /assets\/brand\/tributary-logo\.svg/);
  assert.match(home, /assets\/brand\/tributary-mark-blue\.png/);
  assert.ok(existsSync(new URL('../assets/brand/tributary-mark-blue.png', import.meta.url)), 'single-colour transparent Tributary mark is present');
  const mark = readFileSync(new URL('../assets/brand/tributary-mark.svg', import.meta.url), 'utf8');
  assert.match(mark, /fill="#087EA4"/);
  assert.match(mark, /mask-type="alpha"/);
  assert.match(mark, /href="tributary-mark-source\.png"/);
  assert.ok(existsSync(new URL('../assets/brand/tributary-mark-source.png', import.meta.url)), 'the supplied-shape artwork is retained behind the monochrome alpha mask');
  assert.match(readFileSync(new URL('../assets/brand/tributary-logo.svg', import.meta.url), 'utf8'), /fill="#087EA4"/);
});

test('Tributary art uses the blue mark and wordmark without the former dark icon tile', () => {
  assert.match(css, /\.tributary-overview-art img[^}]*background:\s*transparent/i);
  assert.match(css, /\.tributary-overview-art[^}]*background:[^;]*#e8f5f8/i);
  assert.match(css, /\.tributary-overview-art\s+img\.tributary-wordmark/);
  assert.doesNotMatch(css, /\.tributary-overview-art img[^}]*background:\s*#101a31/i);
});

test('use-case and pricing cards scale without a narrow-screen horizontal table', () => {
  assert.match(css, /@media \(max-width: 1000px\)/);
  assert.match(css, /\.tributary-slide \{ grid-template-columns: minmax\(0, 1fr\)/);
  assert.match(css, /@media \(max-width: 680px\)/);
  assert.match(css, /\.tier-matrix tbody tr \{ margin:/);
  assert.match(css, /overflow-wrap: anywhere/);
});

test('mobile tier cards keep names and price labels intact instead of splitting words', () => {
  assert.match(css, /\.tier-matrix tbody th,\s*\.tier-matrix tbody td\s*\{[^}]*overflow-wrap: normal/);
  assert.match(css, /\.tier-matrix tbody th,\s*\.tier-matrix tbody td\s*\{[^}]*word-break: normal/);
  assert.match(css, /\.tier-matrix tbody th,\s*\.tier-matrix tbody td\s*\{[^}]*width: 100%/);
  assert.match(css, /\.tier-matrix tbody td:nth-child\(2\)\s*\{[^}]*width: 100%/);
  assert.match(css, /\.tier-matrix caption\s*\{[^}]*display: block[^}]*width: 100%/);
  assert.match(css, /\.tier-matrix td:nth-child\(2\)::before[^}]*white-space: nowrap/);
});

test('intake form uses the approved destination, minimal fields, consent, and removal instructions', () => {
  assert.match(html, /action="https:\/\/formsubmit\.co\/hello\+tributary@bstudiob\.co\.uk"/);
  for (const field of ['name', 'email', 'organisation', 'operating_system', 'venue_setup', 'use_case', 'privacy_consent']) {
    assert.match(html, new RegExp(`name="${field}"`), `${field} field exists`);
  }
  assert.match(html, /privacy\.html/);
  assert.match(html, /remove|unsubscribe/i);
  assert.doesNotMatch(html, /password|secret|payment details/i);
  assert.match(html, /Book a demo/);
  assert.match(html, /Request invite-only access/);
});
