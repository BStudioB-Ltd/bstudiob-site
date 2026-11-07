import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('MemGos is described as an early concept without a public product link', () => {
  const html = readFileSync('index.html', 'utf8');
  assert.match(html, /<h2>MemGos<\/h2>/);
  assert.match(html, /Early concept · feasibility research/);
  assert.match(html, /Not yet available/);
});
