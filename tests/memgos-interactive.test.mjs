import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';

test('the public page links to an accessible interactive comparison', () => {
  const page=readFileSync('MemGos/index.html','utf8');
  assert.match(page,/href="interactive\/"/);
  assert.match(page,/3D reference/i);
});
test('the study distinguishes the real source from the experimental build', () => {
  const page=readFileSync('MemGos/interactive/index.html','utf8');
  for (const id of ['view','progress','play','prev','next','reset']) assert.match(page,new RegExp(`id="${id}"`));
  assert.match(page,/<model-viewer/);
  assert.match(page,/not.*physically/i);
  assert.match(page,/Khronos/);
  assert.ok(existsSync('MemGos/interactive/ToyCar.glb'));
  assert.ok(existsSync('MemGos/interactive/review-data.js'));
  const raw=readFileSync('MemGos/interactive/review-data.js','utf8');
  const data=JSON.parse(raw.slice('window.MEMGOS_DATA='.length).trim().replace(/;$/, ''));
  assert.equal(data.steps.length,1717);
  const placements=data.steps.flatMap(s=>s.placements);
  assert.equal(new Set(placements).size,1717);
  assert.equal(data.physical_pieces,1721);
});

test('the photo mosaic is a separately credited 2D study with section controls', () => {
  const page=readFileSync('MemGos/interactive/index.html','utf8');
  for (const id of ['mosaic','mosaic-progress','mosaic-play','mosaic-reset']) assert.match(page,new RegExp(`id="${id}"`));
  assert.match(page,/JuliaC2006/);
  assert.match(page,/2D plate layout/);
  assert.ok(existsSync('MemGos/interactive/radcliffe-photo.jpg'));
  assert.ok(existsSync('MemGos/interactive/radcliffe-mosaic.png'));
  assert.ok(existsSync('MemGos/interactive/LDRAW-CREDITS.txt'));
});
