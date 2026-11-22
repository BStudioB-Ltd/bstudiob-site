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

test('MemGos community plan states the two leaderboard views and agreed rewards', () => {
  const html = readFileSync('MemGos/index.html', 'utf8');
  assert.match(html, /finished scenes? on (?:their )?profile/i);
  assert.match(html, /accessible from the leaderboard/i);
  assert.match(html, /best finished brick scenes/i);
  assert.match(html, /filters? (?:by|for) area, time of day and weather/i);
  assert.match(html, /walk-arounds?.{0,40}not (?:be )?assessed/i);
  assert.match(html, /unique guided walk-around video.{0,120}2–10%/i);
  assert.match(html, /other video.{0,100}2–5%/i);
  assert.match(html, /images? of a location.{0,80}1–3%/i);
  assert.match(html, /each time another user uses? (?:a )?contribution.{0,80}0\.5–2%/i);
  assert.match(html, /credit accumulates? in (?:the )?(?:user'?s|your) account/i);
  assert.match(html, /55% of a purchase/);
  assert.match(html, /Google Maps.{0,100}permission|permission.{0,100}Google Maps/i);
  assert.match(html, /proposed|planned|concept/i);
});
