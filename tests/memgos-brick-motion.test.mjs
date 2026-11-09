import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync('MemGos/index.html', 'utf8');
const css = readFileSync('MemGos/memgos.css', 'utf8');

test('the animated title keeps one accessible name and visible brick letters', () => {
  assert.match(html, /<h1[^>]*aria-label="That place\. Your story\. In bricks\."/);
  const title = html.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/)?.[0];
  assert.ok(title);
  assert.equal((title.match(/class="title-brick"/g) || []).length, 29);
  assert.equal((title.match(/class="brick-line" aria-hidden="true"/g) || []).length, 3);
  assert.doesNotMatch(html, /\p{Extended_Pictographic}/u);
  assert.doesNotMatch(title, /\sstyle=/);
});

test('brick motion is opt-in to the system motion preference', () => {
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*no-preference\)/);
  assert.match(css, /@keyframes\s+brick-arrive/);
  assert.match(css, /animation:\s*brick-arrive/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});
