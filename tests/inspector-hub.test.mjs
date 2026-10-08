import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const hubPath = new URL('../inspector/index.html', import.meta.url);
const hub = (() => {
  try {
    return readFileSync(hubPath, 'utf8');
  } catch {
    return '';
  }
})();
const legacy = readFileSync(new URL('../trust-security.html', import.meta.url), 'utf8');
const sitemap = readFileSync(new URL('../sitemap.xml', import.meta.url), 'utf8');
const homepage = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const llms = readFileSync(new URL('../llms.txt', import.meta.url), 'utf8');

test('hub presents distinct Edu and Pro sections', () => {
  assert.match(hub, /<section\b[^>]*id="edu"[^>]*>/i, 'Inspector-Edu has a canonical section');
  assert.match(hub, /<section\b[^>]*id="pro"[^>]*>/i, 'Inspector-Pro has a canonical section');
  assert.match(hub, /Inspector-Edu/i);
  assert.match(hub, /Inspector-Pro/i);
  assert.match(hub, /href="#edu"/i, 'the hub links directly to Edu');
  assert.match(hub, /href="#pro"/i, 'the hub links directly to Pro');
});

test('Edu access stays visibly unavailable until the pilot host is verified', () => {
  assert.match(hub, /supervised[^.]{0,100}pilot|pilot[^.]{0,100}supervised/i, 'Edu is explicitly bounded to a supervised pilot');
  const anchorHrefs = [...hub.matchAll(/<a\b[^>]*\bhref\s*=\s*["']([^"']*)["']/gi)].map((match) => match[1]);
  for (const href of anchorHrefs) {
    const target = new URL(href, 'https://bstudiob.co.uk/inspector/');
    assert.notEqual(target.hostname, 'inspector.bstudiob.co.uk', 'no public link points to the unverified app host');
  }
  assert.match(hub, /Inspector-Edu access unavailable/i, 'the unavailable state is visible');
  assert.match(hub, /role="status"[^>]*aria-label="Inspector-Edu access unavailable"|aria-label="Inspector-Edu access unavailable"[^>]*role="status"/i, 'the unavailable state is announced accessibly');
  assert.match(hub, /hosted learner runtime has not yet been verified/i, 'the hosting state is explicit');
  assert.match(hub, /href="#pilot-enquiry"[^>]*>Discuss an institutional pilot/i, 'the institutional pilot enquiry remains available');
  assert.doesNotMatch(hub, /Linux\/Kali|active execution profile/i, 'the unsupported Linux/Kali profile claim is removed');
});

test('unreleased Pro targets are not clickable downloads', () => {
  const pro = hub.match(/<section\b[^>]*id="pro"[^>]*>([\s\S]*?)<\/section>/i)?.[1] ?? '';
  assert.ok(pro, 'Inspector-Pro section exists');
  for (const platform of ['macOS', 'Windows', 'Linux']) {
    const platformState = pro.match(new RegExp(`<[^>]+>[^<]*${platform}[^<]*<[^>]*>[\\s\\S]{0,220}`, 'i'))?.[0] ?? pro;
    assert.match(platformState, new RegExp(platform, 'i'), `${platform} availability is stated`);
    assert.match(platformState, /in preparation|preparing|coming soon|not yet available/i, `${platform} is shown as unreleased`);
    assert.doesNotMatch(platformState, /<a\b[^>]*href=/i, `${platform} has no clickable download`);
  }
});

test('Pro copy describes design, validation, and export without denying execution capability', () => {
  const pro = hub.match(/<section\b[^>]*id="pro"[^>]*>([\s\S]*?)<\/section>/i)?.[1] ?? '';
  assert.match(pro, /topology design and validation/i);
  assert.match(pro, /Export project data as JSON or Containerlab YAML/i);
  assert.doesNotMatch(pro, /not\s+(?:a\s+)?network execution environment/i);
});

test('pilot enquiry retains required privacy consent', () => {
  const form = hub.match(/<form\b[^>]*>[\s\S]*?<\/form>/i)?.[0] ?? '';
  assert.ok(form, 'pilot enquiry form exists');
  assert.match(form, /action="https:\/\/formsubmit\.co\/nathan\+inspector@bstudiob\.co\.uk"/);
  assert.match(form, /name="_subject" value="BStudioB — Inspector pilot application"/);
  assert.match(form, /name="_url" value="https:\/\/bstudiob\.co\.uk\/inspector\/"/, 'FormSubmit identifies the canonical Inspector hub as the form source');
  assert.doesNotMatch(form, /name="_url" value="https:\/\/bstudiob\.co\.uk\/trust-security\.html"/, 'the retired source URL is not used');
  assert.match(form, /<input\b(?=[^>]*name="privacy_consent")(?=[^>]*type="checkbox")(?=[^>]*required)[^>]*>/i);
  assert.match(form, /href="(?:\.\.\/)?privacy\.html"[^>]*>Privacy notice|href="(?:\.\.\/)?privacy\.html"[^>]*>Privacy/i);
});

test('legacy and sitemap routes resolve to the Inspector hub', () => {
  assert.match(legacy, /http-equiv="refresh"[^>]*url=\/inspector\/#edu|url=\/inspector\/#edu[^>]*http-equiv="refresh"/i, 'legacy page redirects to the canonical Edu section');
  assert.match(legacy, /href="\/inspector\/#edu"/, 'legacy page has a no-JavaScript fallback');
  assert.match(legacy, /rel="canonical" href="https:\/\/bstudiob\.co\.uk\/inspector\/"/, 'legacy metadata points at the hub');
  assert.match(sitemap, /<loc>https:\/\/bstudiob\.co\.uk\/inspector\/<\/loc>/, 'sitemap includes the hub');
});

test('both homepage Inspector cards lead to the product hub', () => {
  const inspectorLinks = [...homepage.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>[\s\S]*?<\/a>/gi)]
    .filter((match) => /Inspector-Edu|Inspector supervised learning interface preview/i.test(match[0]));
  assert.equal(inspectorLinks.length, 2, 'both existing Inspector cards remain present');
  for (const [, href] of inspectorLinks) {
    assert.match(href, /^inspector\/(?:#(?:edu|pro))?$/, 'homepage Inspector links point into the hub');
  }
});

test('compatibility route names the canonical hub and keeps an Edu fallback', () => {
  assert.match(legacy, /rel="canonical" href="https:\/\/bstudiob\.co\.uk\/inspector\/"/i);
  assert.match(legacy, /href="\/inspector\/#edu"/i, 'visitors can continue to the Edu section without JavaScript');
  assert.match(legacy, /http-equiv="refresh"[^>]*url=\/inspector\/#edu|url=\/inspector\/#edu[^>]*http-equiv="refresh"/i);
});

test('AI discovery points Inspector at the canonical product hub', () => {
  assert.match(llms, /- Inspector(?:-Edu)?: https:\/\/bstudiob\.co\.uk\/inspector\//i);
  assert.doesNotMatch(llms, /Inspector(?:-Edu)?: https:\/\/bstudiob\.co\.uk\/trust-security\.html/i);
});
