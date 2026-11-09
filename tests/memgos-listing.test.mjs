import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

test('MemGos listing links to its concept page without claiming availability', () => {
  const html = readFileSync('index.html', 'utf8');
  assert.match(html, /href="\/MemGos\/"[^>]*><figure><img src="assets\/memgos\/memgos-mark\.svg"/);
  assert.match(html, /<h2>MemGos<\/h2>/);
  assert.match(html, /Early concept · feasibility research/);
  assert.match(html, /Not yet available/);
});

test('MemGos page states planned scope and credits the sample image', () => {
  const html = readFileSync('MemGos/index.html', 'utf8');
  assert.match(html, /not yet available/i);
  assert.match(html, /digital instructions/i);
  assert.match(html, /physical kits.*later/i);
  assert.match(html, /not physically (?:built|validated)/i);
  assert.match(html, /JuliaC2006/);
  assert.match(html, /creativecommons\.org\/licenses\/by\/2\.0/);
  assert.match(html, /openstreetmap\.org\/copyright/);
  assert.match(html, /nationalarchives\.gov\.uk\/doc\/open-government-licence/);
  assert.doesNotMatch(html, /href="https:\/\/memgos\.bstudiob\.co\.uk/);
  assert.match(html, /mailto:hello@bstudiob\.co\.uk/);
  assert.match(html, /memgos\.bstudiob\.co\.uk/);
  assert.match(html, /Licensing, pricing and the terms/);
  assert.ok(existsSync('assets/memgos/memgos-mark.svg'));
  assert.match(readFileSync('sitemap.xml', 'utf8'), /https:\/\/bstudiob\.co\.uk\/MemGos\//);
});
