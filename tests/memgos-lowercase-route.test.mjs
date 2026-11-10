import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const page = readFileSync('404.html', 'utf8');
const script = page.match(/<script>([\s\S]*?)<\/script>/)[1];

test('lowercase MemGos paths lead to the canonical page', () => {
  for (const pathname of ['/memgos', '/memgos/']) {
    let destination;
    runInNewContext(script, { location: { pathname, search: '?from=home', hash: '#exploration', replace: value => { destination = value; } } });
    assert.equal(destination, '/MemGos/?from=home#exploration');
  }
  assert.match(page, /href="\/MemGos\/"/);
});

test('other missing paths retain the 404 page', () => {
  for (const pathname of ['/unknown', '/memgos/other', '/MemGos/missing']) {
    let redirected = false;
    runInNewContext(script, { location: { pathname, replace: () => { redirected = true; } } });
    assert.equal(redirected, false);
  }
});
