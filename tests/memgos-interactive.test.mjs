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
  for (const id of ['view','progress','play','prev','next','reset','next-underneath']) assert.match(page,new RegExp(`id="${id}"`));
  assert.match(page,/<model-viewer/);
  assert.match(page,/not.*physically/i);
  assert.match(page,/Khronos/);
  assert.ok(existsSync('MemGos/interactive/ToyCar.glb'));
  assert.ok(existsSync('MemGos/interactive/review-data.js'));
  const raw=readFileSync('MemGos/interactive/review-data.js','utf8');
  const data=JSON.parse(raw.slice('window.MEMGOS_DATA='.length).trim().replace(/;$/, ''));
  assert.equal(data.steps.length,1430);
  const placements=data.steps.flatMap(s=>s.placements);
  assert.equal(new Set(placements).size,1430);
  assert.equal(data.physical_pieces,1434);
  assert.match(page,/1,434 pieces/);
  assert.match(page,/href="trim-parts.csv/);
  assert.match(page,/href="trim-candidate.ldr/);
  assert.equal(data.steps.filter(step=>step.instruction?.includes('Proposed approach from below')).length,11);
  const csv=readFileSync('MemGos/interactive/trim-parts.csv','utf8').trim().split('\n').slice(1);
  assert.equal(csv.reduce((sum,row)=>sum+Number(row.split(',')[2]),0),1434);
  assert.equal(data.steps.filter(step=>step.node?.startsWith('multi-merge:')).length,240);
  for (const part of ['3007.dat','3008.dat','2456.dat']) {
    assert.ok(data.meshes[part]?.length > 0);
    assert.ok(data.instances[part]?.length > 0);
    assert.match(readFileSync('MemGos/interactive/LDRAW-CREDITS.txt','utf8'),new RegExp(`ldraw/parts/${part.replace('.', '\\.')}`));
  }
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

test('the updated car data, viewer and credits use versioned URLs', () => {
  const page=readFileSync('MemGos/interactive/index.html','utf8');
  for (const name of ['review-data.js','viewer.js','LDRAW-CREDITS.txt']) {
    assert.ok(page.includes(`${name}?v=trimmed-car-20261110`), `${name} must have the matching asset version`);
  }
});
