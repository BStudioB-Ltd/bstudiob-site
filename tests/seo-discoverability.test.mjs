import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const sitemap = read('sitemap.xml');
const robots = read('robots.txt');

const expectedRoutes = [
  '/',
  '/tributary/',
  '/studio-tools.html',
  '/inspector/',
  '/inspector/edu/',
  '/inspector/pro/',
  '/cards.html',
  '/products/pit/',
  '/services.html',
  '/privacy.html',
  '/terms.html'
];

function routeToFile(route) {
  if (route === '/') return 'index.html';
  if (route.endsWith('/')) return `${route.slice(1)}index.html`;
  return route.slice(1);
}

function metaContent(html, property, value) {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const tag = new RegExp(`<meta\\s+${property}=["']${escaped}["'][^>]*>`, 'i').exec(html)?.[0] ?? '';
  return tag.match(/content=["']([^"']*)["']/i)?.[1] ?? '';
}

function parseJsonLd(html, page) {
  return [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => {
      try {
        return JSON.parse(match[1]);
      } catch (error) {
        assert.fail(`${page} has invalid JSON-LD: ${error.message}`);
      }
    });
}

test('sitemap is valid, canonical-only, current, and covers every public indexable route', () => {
  assert.match(sitemap, /^<\?xml version="1\.0" encoding="UTF-8"\?>\s*<urlset\b[\s\S]*<\/urlset>\s*$/i);
  const urls = [...sitemap.matchAll(/<url>\s*<loc>([^<]+)<\/loc>(?:\s*<lastmod>([^<]+)<\/lastmod>)?\s*<\/url>/g)];
  const routes = urls.map(([, loc]) => new URL(loc).pathname);
  assert.deepEqual(routes, expectedRoutes);
  assert.equal(new Set(routes).size, routes.length, 'sitemap routes are unique');
  assert.ok(urls.some(([, loc, lastmod]) => loc === 'https://bstudiob.co.uk/' && lastmod === '2026-10-23'), 'homepage lastmod reflects this content update');
  assert.ok(urls.some(([, loc, lastmod]) => loc === 'https://bstudiob.co.uk/privacy.html' && lastmod === '2026-10-23'), 'privacy lastmod reflects its disclosure update');

  for (const [, loc, lastmod] of urls) {
    const url = new URL(loc);
    assert.equal(url.origin, 'https://bstudiob.co.uk', `${loc} uses the apex HTTPS origin`);
    assert.ok(existsSync(resolve(root, routeToFile(url.pathname))), `${loc} maps to an HTML page`);
    if (lastmod) assert.match(lastmod, /^\d{4}-\d{2}-\d{2}$/);
    assert.doesNotMatch(url.pathname, /(?:^|\/)(?:admin|myaccount|thanks)(?:\/|\.|$)/i, `${loc} is a public route`);
  }
});

test('sitemap pages have unique metadata, matching canonicals, and valid local social imagery', () => {
  const titles = new Set();
  const descriptions = new Set();

  for (const [, loc] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const route = new URL(loc).pathname;
    const pagePath = routeToFile(route);
    const html = read(pagePath);
    const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim();
    const description = metaContent(html, 'name', 'description');
    const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/i)?.[1];

    assert.ok(title, `${pagePath} has a title`);
    assert.ok(description, `${pagePath} has a description`);
    assert.ok(canonical, `${pagePath} has a canonical URL`);
    assert.equal(canonical, loc, `${pagePath} canonical matches its sitemap URL`);
    assert.ok(!titles.has(title), `${pagePath} title is unique`);
    assert.ok(!descriptions.has(description), `${pagePath} description is unique`);
    titles.add(title);
    descriptions.add(description);

    const robotsTag = metaContent(html, 'name', 'robots');
    assert.doesNotMatch(robotsTag, /noindex/i, `${pagePath} is not accidentally noindexed`);
    const ogUrl = metaContent(html, 'property', 'og:url');
    assert.equal(ogUrl, canonical, `${pagePath} Open Graph URL matches its canonical`);
    const image = metaContent(html, 'property', 'og:image');
    if (image) {
      const imageUrl = new URL(image);
      assert.equal(imageUrl.origin, 'https://bstudiob.co.uk', `${pagePath} social image is first-party`);
      assert.ok(existsSync(resolve(root, imageUrl.pathname.slice(1))), `${pagePath} social image exists`);
    }
    parseJsonLd(html, pagePath);
  }
});

test('robots policy keeps private routes out and explicitly allows OpenAI Search crawling', () => {
  assert.match(robots, /User-agent:\s*\*\s*Allow:\s*\//i);
  assert.match(robots, /Disallow:\s*\/admin\//i);
  assert.doesNotMatch(robots, /Disallow:\s*\/thanks\.html/i, 'search crawlers must be able to read the page-level noindex directive');
  assert.match(robots, /User-agent:\s*GPTBot\s*Disallow:\s*\//i, 'OpenAI training crawler is explicitly disallowed');
  assert.match(robots, /User-agent:\s*OAI-SearchBot\s*Allow:\s*\//i);
  assert.match(robots, /Sitemap:\s*https:\/\/bstudiob\.co\.uk\/sitemap\.xml/i);
  assert.match(read('thanks.html'), /<meta name="robots" content="noindex, follow">/i);
});

test('sitemap pages have no broken local href or src references', () => {
  for (const [, loc] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const pagePath = routeToFile(new URL(loc).pathname);
    const html = read(pagePath);
    const references = [...html.matchAll(/<(?:a|area|link|script|img|source|iframe|video|audio|form)\b[^>]*\b(?:href|src|action|poster)=["']([^"']+)["'][^>]*>/gi)];

    for (const [, reference] of references) {
      if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(reference)) continue;
      const resolved = new URL(reference, `file://${resolve(root, pagePath)}`);
      if (resolved.protocol !== 'file:') continue;
      let target = decodeURIComponent(resolved.pathname);
      if (reference.startsWith('/')) target = resolve(root, reference.split(/[?#]/, 1)[0].slice(1));
      if (target.endsWith('/')) target = resolve(target, 'index.html');
      assert.ok(existsSync(target), `${pagePath} references missing local target ${reference}`);
    }
  }
});

test('homepage connects the visible founder identity to the BStudioB Organization entity', () => {
  const home = read('index.html');
  const visibleFooter = home.match(/<footer\b[^>]*>[\s\S]*?<\/footer>/i)?.[0] ?? '';
  assert.match(visibleFooter, /Nathan Brown-Bennett/);
  assert.match(visibleFooter, /Founder and Director/i);
  assert.match(visibleFooter, /https:\/\/nathanbrownbennett\.github\.io\/NathanBrown-Bennett\/index\.html/);

  const structuredData = parseJsonLd(home, 'index.html').flatMap((data) => data['@graph'] ?? [data]);
  const organization = structuredData.find((node) => node['@type'] === 'Organization');
  const founder = structuredData.find((node) => node['@type'] === 'Person' && node['@id'] === 'https://bstudiob.co.uk/#founder');
  assert.ok(organization, 'homepage declares the BStudioB Organization');
  assert.ok(founder, 'homepage declares the founder Person entity');
  assert.equal(organization.legalName, 'BStudioB Ltd');
  assert.equal(organization.founder?.['@id'], founder['@id']);
  assert.equal(founder.name, 'Nathan Brown-Bennett');
  assert.equal(founder.jobTitle, 'Founder and Director');
  assert.equal(founder.worksFor?.['@id'], organization['@id']);
});

test('legacy duplicate product alias is excluded while its canonical page remains indexable', () => {
  const alias = read('creative-live.html');
  const canonical = read('tributary/index.html');
  assert.match(alias, /<meta name="robots" content="noindex, follow">/i);
  assert.match(alias, /<link rel="canonical" href="https:\/\/bstudiob\.co\.uk\/tributary\/">/i);
  assert.match(canonical, /<meta name="robots" content="index, follow/i);
});

test('privacy notice matches disabled analytics and the click-to-load third-party video', () => {
  const privacy = read('privacy.html');
  const video = read('inspector/cave-bash-preview-v2.js');
  assert.match(privacy, /analytics are currently disabled/i);
  assert.match(privacy, /FormSubmit/i);
  assert.match(privacy, /youtube-nocookie\.com/i);
  assert.match(video, /Created only in the explicit Play button handler/);
  assert.match(video, /https:\/\/www\.youtube-nocookie\.com\/embed\//);
});
