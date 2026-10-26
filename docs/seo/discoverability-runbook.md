# BStudioB search and AI discoverability

Reviewed: 23 October 2026
State: local review patch; not committed or published

## What is verified

- The website is a static GitHub Pages site. Its canonical public hostname is `https://bstudiob.co.uk/`; public HTTP checks during this review returned 200 for the homepage, `robots.txt`, and `sitemap.xml`.
- The local source includes 11 canonical public routes in the sitemap: home, Tributary, Buildy, Inspector hub/Edu/Pro, Cards, PIT, services, privacy, and terms. Each route has an existing HTML file and a matching canonical URL.
- Account, founder-operations, and thank-you routes are excluded from the sitemap; account/admin/thank-you pages carry noindex directives. The admin route stays disallowed in robots.txt; the generic thank-you route is crawlable so engines can read its page-level noindex.
- Product and service pages describe current previews, invite-only access, planned availability, and limitations. The homepage names Nathan Brown-Bennett and links to his first-party biography; Organization/Person JSON-LD now connects him to BStudioB Ltd as Founder and Director.
- The Inspector story preview creates its YouTube player only after an explicit Play click. The local privacy notice now discloses this third-party request. Founder/legal review should still set a specific operational retention period for form records; current wording is event-based and provider-side retention is not verified.
- Search-facing page metadata and schema are in initial HTML. Open Graph URLs match page canonicals; social images are first-party files where configured.
- The site privacy notice says analytics are disabled. This patch does not add analytics, send form data to analytics, alter forms, or change external provider settings.
- `llms.txt` is maintained as a concise supplementary directory of public pages and current product boundaries. It is not treated as a Google ranking/indexing requirement.

## Not verified / external gates

- The BStudioB-owned authenticated profile showed no existing `bstudiob.co.uk` property in Google Search Console or Bing Webmaster Tools. No Pages indexing report, URL Inspection, crawl statistics, Google impressions or confirmed indexing state could be inspected.
- No Bing site property or AI citation data was available. Sitemap submission and URL Inspection in either console remain blocked until the founder verifies the domain and the local crawl fixes are intentionally published.
- Public PageSpeed Insights returned HTTP 429 and WebPageTest returned HTTP 403 during the companion audit. Chrome fallback measurements are listed below; CrUX field data and a Lighthouse score remain unavailable. This patch does not claim ranking improvements.
- Live pages still reflect the already-published repository revision. This local patch's founder schema and sitemap dates are not live until separately reviewed and published.

## Live versus local at review time

- All 11 sitemap routes returned HTTP 200 on the public apex host. `robots.txt` and `sitemap.xml` also returned 200; HTTP apex and `www` requests redirect to HTTPS/apex.
- The currently published `robots.txt` still disallows `/thanks.html`, even though `thanks.html` has a `noindex` meta directive. Google documents that a crawler cannot read a noindex tag on a robots-blocked URL. The local patch removes only the thank-you disallow while retaining noindex; `/admin/` remains disallowed.
- The current live sitemap still reports the homepage and Buildy as last modified `2026-08-27` and Tributary as `2026-10-08`. Local source updates those dates to their latest tracked content revisions. The homepage date is set to `2026-10-23` for the founder-identity update in this patch.
- The new founder JSON-LD/footer attribution and the crawl/sitemap changes are local only; live markup remains at the published revision until separately approved and published.
- Google/Bing currently have no visible property under the checked BStudioB profile. No verification token, DNS change, property creation or sitemap submission was attempted.
- The legacy `/creative-live.html` route returned 200 and had a canonical pointing to `/tributary/` but retained `index,follow`; the local patch changes it to `noindex,follow` while keeping the canonical as a visitor fallback. Extensionless `.html` variants that GitHub Pages serves as 200 aliases cannot be converted to HTTP redirects from this repository alone.

## Performance snapshot (live Chrome lab fallback)

Captured on 23 October 2026 in Chrome 155 with cache disabled/cleared, no CPU or network throttling. Viewports: mobile 390×844 at DPR 2; desktop 1440×900 at DPR 1. These are single-navigation lab observations, not CrUX field data, PageSpeed Insights, or Lighthouse results. Transfer sizes are bytes.

| Live page | Mobile FCP / LCP / load; transfer | Desktop FCP / LCP / load; transfer |
|---|---:|---:|
| Homepage | 508 / 644 / 730 ms; 4,426,940 B | 172 / 172 / 386 ms; 4,426,940 B |
| Tributary | 268 / 268 / 248 ms; 88,165 B | 220 / 220 / 212 ms; 88,165 B |
| Buildy | 244 / 244 / 291 ms; 295,838 B | 132 / 132 / 176 ms; 295,203 B |
| Inspector | 360 / 360 / 1,072 ms; 23,673 B | 100 / 100 / 373 ms; 23,673 B |

The homepage transfer is dominated by its large Inspector story image (approximately 4.4 MB total transfer in this run); review responsive source dimensions/encoding before changing visual quality. Re-test with Lighthouse/PageSpeed and field data when available.

## Robots and AI crawler policy

`robots.txt` allows general crawlers, disallows `/admin/`, leaves `/thanks.html` crawlable for its `noindex` meta directive, points to the apex sitemap, and explicitly allows `OAI-SearchBot`. Googlebot and Bingbot inherit the general allow rule. The local review patch explicitly disallows `GPTBot` while preserving `OAI-SearchBot` access: OpenAI documents them as separate crawlers for model training and ChatGPT Search respectively. This is a crawler preference, not an access-control or privacy boundary, and it does not guarantee indexing or ranking. Check any CDN, WAF, or host-level bot controls separately; robots.txt alone does not prove a fetch succeeds.

## Founder Search Console and Bing checklist

After reviewing and publishing the patch:

1. Create and verify the `bstudiob.co.uk` Domain property in Google Search Console by publishing the provider-issued TXT record. This is an explicit founder/DNS-owner gate; do not paste verification tokens into this repository.
2. After the corrected static patch is intentionally published and the property is verified, submit `https://bstudiob.co.uk/sitemap.xml` once and inspect discovered URL count and sitemap errors.
3. Use URL Inspection on the homepage, each product page, services page, and Inspector subpages. Record Google-selected canonical, crawl/index status, last crawl and any exclusion reason. Request indexing only for corrected, indexable canonical pages; requests are not guarantees.
4. Review Page indexing and Crawl stats for blocked URLs, duplicate canonicals, soft 404s, server errors, and unexpected exclusions. Confirm account/admin/thank-you routes remain excluded; verify the thank-you route is excluded because of its meta noindex, not robots.txt.
5. Verify/import the same domain in Bing Webmaster Tools (Google Search Console import is available after verification), submit the sitemap, and review crawl/index status. If AI Performance is available, treat cited URLs and sampled queries as evidence, not a ranking score or guarantee.
6. Recheck `https://bstudiob.co.uk/`, all sitemap routes, `https://bstudiob.co.uk/robots.txt`, and `https://bstudiob.co.uk/sitemap.xml` after publication. Confirm HTTPS and the intended `www` → apex redirect.
7. Save only sanitized status, date, route, and error category in the operations log. Do not copy account credentials, recovery material, personal query details, or form contents.

## Content and authority roadmap

Publish only after the evidence and any needed approvals exist; do not fill an Insights section with thin or synthetic case studies.

- **Tributary engineering article:** explain the verified local-network architecture, supported presentation/import workflows, test setup, and known platform limits. Product owner must verify every implementation detail before publication.
- **Buildy engineering article:** describe the actual GitHub Pages workflow, supported editing/export operations, invitation status, and limitations. Do not present planned pricing or unreleased capabilities as available.
- **Provisioning technical note:** document the real workflow and validation boundary. Do not claim certification, compliance, guaranteed security, or measured savings without evidence.
- **Case studies/research:** wait for a real deployment or reproducible study, method, results, limitations, and permission to identify or anonymize participants. No client, result, benchmark, testimonial, award, or independent coverage is asserted here.
- **Founder/company consistency:** when the founder controls each profile, use the legal company name, the same founder/director role, the canonical site link, and product links only where the company ownership/development relationship is evidenced. External profile edits are manual.
- **Independent authority:** prioritize substantive editorial review, a real product demonstration, relevant technical communities, or an appropriate launch only when the product and supporting evidence are ready. Do not buy links, automate submissions, or imply independent coverage from a company announcement.

## Measurement and priorities

- **P0 — Establish index state:** founder verifies Search Console and checks the canonical routes. This is the main unresolved indexing question.
- **P1 — Keep crawl contracts green:** canonical/sitemap/robots/schema regression tests; review only content changes that affect a route's truthful public description.
- **P1 — Measure experience:** run PageSpeed Insights or Lighthouse on mobile and desktop after publication; distinguish lab data from field Core Web Vitals. No performance score was measured in this repository pass.
- **P2 — Build evidence-backed content:** publish the technical pieces above only after implementation and editorial review.
- **P2 — Improve external identity consistency:** manual updates to verified founder/company profiles and genuinely owned product repositories.
- **P3 — AI visibility:** use OpenAI crawler access and Bing Webmaster Tools' AI Performance data where available. Keep `llms.txt` as optional machine-readable context, not a substitute for crawlable HTML, factual content, or indexing.

## Rollback and maintenance

This patch is static and does not change DNS or hosting. If a post-publication inspection shows an incorrect canonical or entity relationship, revert only the affected task-scoped HTML/sitemap/docs/test edits and re-run `node --test tests/*.test.mjs`. Preserve unrelated files and existing product-readiness boundaries. Update `lastmod` only when the corresponding page content materially changes; do not use a blanket current date.

## References

- [Google: AI features and Search best practices](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [Google: build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google: ask Google to recrawl a URL](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)
- [Google: use `noindex` to block indexing](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- [OpenAI: crawler overview](https://developers.openai.com/api/docs/bots)
- [Bing Webmaster Tools: AI Performance public preview](https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/)
