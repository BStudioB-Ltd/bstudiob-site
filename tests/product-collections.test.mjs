import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const read=path=>readFileSync(resolve(root,path),'utf8');

test('homepage retains product links and provides both collection entry points below the hero',()=>{
  const html=read('index.html');
  const start=html.indexOf('<section class="product-collections"');
  const summary=html.indexOf('<section class="studio-summary"');
  assert.ok(start>html.indexOf('id="hero-slide-products"') && start<summary,'collections follow the hero and precede studio summary');
  const section=html.slice(start,summary);
  assert.match(section,/href="collections\/creative\/"/);
  assert.match(section,/href="inspector\/"/);
  assert.match(section,/Tie it all together/i);
  assert.match(section,/Inspector collection/i);
  for (const href of ['tributary/','studio-tools.html','services.html','earquity.html','inspector/']) assert.ok(html.includes(`href="${href}"`),`${href} remains linked`);
  assert.match(html,/>MemGos</);
});

test('creative collection explains product boundaries and links to real destinations',()=>{
  const path=resolve(root,'collections/creative/index.html');
  assert.ok(existsSync(path),'creative collection page exists');
  const html=read('collections/creative/index.html');
  assert.match(html,/<link rel="canonical" href="https:\/\/bstudiob\.co\.uk\/collections\/creative\/"/);
  for (const name of ['Inspire','Tributary','Earquity']) assert.match(html,new RegExp(name,'i'));
  assert.match(html,/href="\/tributary\/"/);
  assert.match(html,/href="\/earquity\.html"/);
  assert.match(html,/early concept/i);
  assert.match(html,/not (?:yet )?(?:available|integrated)|do not imply.*integrat/i);
  assert.match(read('sitemap.xml'),/<loc>https:\/\/bstudiob\.co\.uk\/collections\/creative\/<\/loc>/);
});
