import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const home = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

test('resources follow the enquiry section and are the last landing-page section', () => {
  const form = home.indexOf('id="studio-enquiry-form"');
  const resources = home.indexOf('id="useful-resources"');
  assert.ok(form >= 0 && resources > form, 'resources appear after the enquiry form');
  assert.doesNotMatch(home.slice(resources, home.indexOf('</main>', resources)), /<section\b/i, 'no later section appears before the footer');
});

test('mobile resources use a compact, readable card treatment', () => {
  assert.match(css, /@media\s*\(max-width:\s*600px\)\s*\{[\s\S]*?\.resource-card\s*\{[^}]*padding:\s*1rem/);
  assert.match(css, /@media\s*\(max-width:\s*600px\)\s*\{[\s\S]*?\.resource-card h3\s*\{[^}]*font-size:\s*1\.5rem/);
});

test('useful resources links existing FindHer and the public Word macro and macOS tool', () => {
  const section = home.match(/<section\b[^>]*id="useful-resources"[\s\S]*?<\/section>/)?.[0] ?? '';
  assert.match(section, /https:\/\/github\.com\/JakkuAzzo\/FindHer/);
  assert.match(section, /https:\/\/github\.com\/JakkuAzzo\/Useful_Tools\/blob\/main\/FormatTwoColumnLayoutinWord\.vbs/);
  assert.match(section, /https:\/\/github\.com\/JakkuAzzo\/codex-mac-ui/);
  assert.match(section, /copy of your document/i);
  assert.match(section, /experimental/i);
});

test('useful resources links DisplayPlacerEasyMode with its macOS and displayplacer context', () => {
  const section = home.match(/<section\b[^>]*id="useful-resources"[\s\S]*?<\/section>/)?.[0] ?? '';
  const card = section.match(/<article\b[^>]*aria-labelledby="displayplacer-heading"[\s\S]*?<\/article>/)?.[0] ?? '';
  assert.match(card, /href="https:\/\/github\.com\/NathanBrownBennett\/DisplayPlacerEasyMode"/);
  assert.match(card, /macOS/);
  assert.match(card, /displayplacer/i);
});
