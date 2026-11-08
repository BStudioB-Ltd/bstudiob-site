import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const home = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

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
