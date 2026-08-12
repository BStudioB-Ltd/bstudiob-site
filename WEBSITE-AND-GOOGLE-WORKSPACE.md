# Website and Google Workspace verification

Status date: 11 August 2026
Scope: `bstudiob.co.uk`, public forms, analytics, social previews and BStudioB-owned Workspace routing.

Review readiness: **safe repository changes ready for founder/parent review; not yet committed or published.** The live site therefore still serves the prior sitemap/robots and product metadata revision until an approved GitHub Pages publication occurs.

Latest read-only rerun: 11 August 2026, Europe/London.

## Read-only evidence

- `https://bstudiob.co.uk/` returns HTTP 200 from GitHub Pages over HTTP/2.
- `https://www.bstudiob.co.uk/` returns HTTP 301 to `https://bstudiob.co.uk/`.
- `https://bstudiob-ltd.github.io/bstudiob-site/` returns HTTP 301 to `https://bstudiob.co.uk/`.
- The repository contains `CNAME` with `bstudiob.co.uk`.
- Apex DNS resolves to GitHub Pages addresses; `www` is a CNAME to `bstudiob-ltd.github.io.`.
- `https://cloud.umami.is/script.js` returns HTTP 200.
- The Umami script is present on the public homepage, product pages and thank-you page with the existing BStudioB website ID.
- The social-card PNG is present and is 1200×630.
- All local `href`/`src` targets resolve in the repository.
- The five FormSubmit actions are present for contact, FlowCue, Inspector-Edu, Cards and Buildy. Read-only HEAD requests to each endpoint return HTTP 200; no form submission was made.

## Current routing

| Surface | Route | Provider/address pattern | Test status |
|---|---|---|---|
| Enquiry | `/` | FormSubmit → `nathan+contact@bstudiob.co.uk` | Endpoint reachable; delivery still needs a founder-approved test submission |
| FlowCue | `/creative-live.html` | FormSubmit → `nathan+flowcue@bstudiob.co.uk` | Endpoint reachable; delivery still needs a founder-approved test submission |
| Inspector-Edu | `/trust-security.html` | FormSubmit → `nathan+inspector@bstudiob.co.uk` | Endpoint reachable; delivery still needs a founder-approved test submission |
| Cards | `/cards.html` | FormSubmit → `nathan+cards@bstudiob.co.uk` | Endpoint reachable; delivery still needs a founder-approved test submission |
| Buildy | `/studio-tools.html` | FormSubmit → `nathan+buildy@bstudiob.co.uk` | Endpoint reachable; delivery still needs a founder-approved test submission |

Plus-addresses are used only as routing addresses in the public form actions. Do not assume they are active or deliverable until the founder verifies the corresponding Workspace alias/routing behaviour.

## Privacy and analytics position

- Umami is described as anonymous and cookieless; names, email addresses and form contents are not sent to analytics.
- Form details are routed by FormSubmit to the relevant BStudioB mailbox and are not mirrored into analytics.
- The privacy notice states the current Umami Hobby plan and US data region. Review this before material traffic or any change of provider/region.
- Consent checkboxes are required on the enquiry form and are injected for product waitlist forms by `site.js`.
- This is operational website wording, not legal approval. Founder review is still required for final privacy, terms, retention and unsubscribe wording.

## Workspace and DNS blockers

Current DNS read-only checks show:

- SPF: `v=spf1 include:_spf.google.com ~all`
- DMARC: no TXT record discovered at `_dmarc.bstudiob.co.uk`
- DKIM: no TXT record discovered at the checked selectors; the exact Google Workspace selector must be confirmed in the Admin console before publishing or changing DNS.

Founder-only actions:

1. Confirm BStudioB-owned Workspace aliases for `hello@`, `nathan@` and each product plus-address.
2. Confirm recovery owner and backup method; enable 2-step verification for all admin/recovery accounts.
3. In Google Admin, generate or inspect the Workspace DKIM record and publish it at the registrar only after founder approval.
4. Draft and review a DMARC policy (start with monitoring/reporting if appropriate) before any DNS change.
5. Review Workspace billing, logo/brand profile and admin recovery without exposing credentials or recovery codes.
6. Submit one founder-approved test from each form and record only pass/fail, timestamp and recipient route—not message contents.

## Completed repository-safe change

The sitemap and robots file advertise the canonical `bstudiob.co.uk` hostname instead of the underlying GitHub Pages hostname. Product pages carry canonical and OG/Twitter metadata using the existing social card. The approved patch was merged to `main` as `54b3bf3` and the Pages deployment completed successfully; no DNS, GitHub settings or mailbox routing changed.

## Commit-ready review pack

### Changed files

| File | Change | Risk / review note |
|---|---|---|
| `README.md` | Corrects the analytics description and links to this verification record. | Documentation only. |
| `creative-live.html` | Adds canonical, Open Graph and X/Twitter metadata for FlowCue. | Uses the existing approved social card; no form or visual-system change. |
| `trust-security.html` | Adds canonical, Open Graph and X/Twitter metadata for Inspector-Edu. | Uses the existing approved social card; no form or visual-system change. |
| `cards.html` | Adds canonical, Open Graph and X/Twitter metadata for Cards. | Uses the existing approved social card; no form or visual-system change. |
| `studio-tools.html` | Adds canonical, Open Graph and X/Twitter metadata for Buildy. | Uses the existing approved social card; no form or visual-system change. |
| `sitemap.xml` | Replaces GitHub Pages URLs with canonical `bstudiob.co.uk` URLs. | Search-indexing change only. |
| `robots.txt` | Points the sitemap reference at `https://bstudiob.co.uk/sitemap.xml`. | Search-crawler reference only. |
| `WEBSITE-AND-GOOGLE-WORKSPACE.md` | Records evidence, routing, blockers, review readiness and founder checklist. | Documentation only; contains no credentials or PII. |

### Local-versus-live differences

- Local working tree: all five public HTML routes have the expected canonical/social metadata; sitemap and robots use `bstudiob.co.uk`.
- Live site: the homepage and four product pages serve the published metadata revision; live sitemap and robots use the canonical `bstudiob.co.uk` hostname.
- Live forms and analytics are unchanged and were checked read-only only. No delivery has been proven without an approved real test submission.

### Founder decisions for remaining provider actions

The founder should reply with an explicit decision for each item below:

1. **Patch/publication record:** complete; the eight-file patch is merged and live verification passed.
2. **Public wording:** approve or request edits to the privacy, terms, retention and unsubscribe wording; publication does not constitute legal approval.
3. **Form routing:** confirm that `hello@`, `nathan@`, and the five product plus-address routes are BStudioB-owned and intentionally used; approve or defer one controlled test submission per form.
4. **Workspace security:** confirm the named recovery owner, backup method and 2-step-verification coverage for admin/recovery accounts.
5. **Email authentication:** approve or defer generation of the exact Google Workspace DKIM record and a reviewed DMARC monitoring policy; no DNS change is included in this patch.
6. **Workspace administration:** approve or defer logo/brand-profile review and billing review; no payment or terms acceptance is included in this patch.

## Short publish checklist

For the already-approved patch:

1. Review the working-tree diff and confirm no credentials, recovery codes, form contents or unrelated files are included.
2. Publish verification completed through the existing GitHub Pages configuration (deployment `31499602408`).
3. Re-check the live homepage, all four product pages, sitemap, robots, HTTPS, `www` redirect and GitHub Pages redirect.
4. Confirm the live pages expose the expected canonical/social metadata and the existing form/Umami markup.
5. Record the commit, publication timestamp and pass/fail evidence in the parent operations thread.
6. Only after separate founder approval, perform Workspace/DNS actions and controlled form-delivery tests.

## WEB-002 execution record

### WEB-002.01 — Working-tree freeze

Scope was limited to the existing website patch and this review document. The exact eight paths were reviewed and merged; `git diff --check` and local checks passed for canonical metadata, social metadata, local `href`/`src` targets, sitemap hostnames and robots sitemap reference. No unrelated files were included.

### WEB-002.02 — Content review findings

- Privacy notice: identifies Umami, FormSubmit, purpose, US data region, removal request route and a retention statement for waitlist details.
- Terms: identifies informational-site status, waitlist/pilot non-order status, IP wording, and lawful/authorised-use limits for security products.
- Product readiness: FlowCue is invite-only/manual installer; Inspector-Edu is a supervised configured-host pilot; Cards is an early concept; Buildy has planned pricing and states that prices/features/availability may change.
- Founder/legal review flags: confirm the lawful basis and final wording; decide whether enquiry retention needs its own explicit period; decide whether “occasional relevant updates” is sufficiently specific; confirm the email-based removal route is adequate for unsubscribe/withdrawal requests; approve all planned pricing and product-readiness claims.

### WEB-002.03 — Commit package

Exact scope: the eight changed paths listed in WEB-002.01. Suggested commit message: `Prepare canonical metadata and website review pack`. Rollback: revert that single commit, or restore the eight paths to the prior `main` revision before publication; no DNS, Workspace, mailbox or provider state is coupled to this patch.

### WEB-002.04 — Publication checklist

Publication verification: apex returns 200 over HTTPS; `www` returns 301 to apex; the GitHub Pages project URL returns 301 to apex; homepage and all four product pages return 200; product pages expose their canonical URLs and social-card metadata; sitemap URLs and robots sitemap reference use `bstudiob.co.uk`; the existing `/privacy.html`, `/terms.html` and `/thanks.html` routes remain reachable; no unexpected visual or form markup changes appeared in the published diff.

### WEB-002.05 — Form routing audit

Verified routes: contact → `nathan+contact@bstudiob.co.uk`; FlowCue → `nathan+flowcue@bstudiob.co.uk`; Inspector-Edu → `nathan+inspector@bstudiob.co.uk`; Cards → `nathan+cards@bstudiob.co.uk`; Buildy → `nathan+buildy@bstudiob.co.uk`. Each has `_next=https://bstudiob.co.uk/thanks.html`, `_url` matching its source page, a honeypot and required email input. The contact form has a static required consent checkbox; product forms receive a required consent checkbox from `site.js` at runtime. All five provider endpoints returned HTTP 200 to read-only HEAD checks. These checks do not prove mailbox delivery or plus-address activation.

### WEB-002.06 — Controlled form test plan

Only after separate founder approval, submit one minimal, non-sensitive test per route using a founder-controlled test address and clearly labelled test content. Record only: UTC timestamp, source route, provider route, pass/fail, redirect result and recipient route. Do not retain message body, test address or form contents in this repository. If any test fails, stop and investigate provider activation/routing before retrying.

### WEB-002.07 — Workspace administration audit

Founder must confirm, without sharing secrets: owner of `hello@bstudiob.co.uk` and `nathan@bstudiob.co.uk`; intended product plus-address behaviour; named recovery owner; independent backup method; 2-step verification for every admin/recovery account; least-privilege admin roles and super-admin count; logo/brand-profile owner and desired public display; billing owner, payment-review status and renewal reminder. No credentials, recovery codes, billing data or Workspace settings were accessed or changed here.

### WEB-002.08 — DKIM/DMARC worksheet

| Item | Founder input/action | Safe state / rollback |
|---|---|---|
| DKIM selector | Generate/inspect the exact selector in Google Admin; do not guess it. | Publish only the exact TXT name/value after approval; remove that record to roll back. |
| DKIM status | Verify Google reports authentication passing after DNS propagation. | Keep existing SPF unchanged while testing; do not rotate selectors casually. |
| DMARC host | `_dmarc.bstudiob.co.uk` | A TXT record at this host is currently absent. Remove the new TXT record to roll back. |
| DMARC starting policy | Founder/legal review of monitoring-first `p=none`, reporting mailbox and retention. | Begin monitoring-only; do not move to quarantine/reject until reports and legitimate senders are understood. |
| SPF | Existing `v=spf1 include:_spf.google.com ~all` | Do not replace or append providers without confirming every legitimate sender; restore the prior value to roll back. |

No DNS change was made. FormSubmit’s sending/authentication requirements and any Brevo sender-domain requirements must be confirmed before adding providers to SPF/DKIM/DMARC.

### WEB-002.09 — Analytics/privacy QA

Static QA confirms the Umami script is placed on the homepage, four product pages and thank-you page; the script uses the existing website ID; no form field values are referenced by the analytics markup; the privacy notice states anonymous/cookieless analytics and the current US data region; form consent wording links to the privacy notice. Runtime consent injection is implemented in `site.js` and remains suitable for one approved browser test. Legal review remains required for the data-region, retention and unsubscribe wording.

### WEB-002.10 — Final founder decision table

| Decision | Approve / defer | Required evidence or note |
|---|---|---|
| Patch scope | Approved | Eight-path patch and review document merged as `54b3bf3`. |
| Commit and publication | Complete | GitHub Pages deployment `31499602408` succeeded; live metadata and canonical routes verified. |
| Public wording |  | Approve privacy, terms, retention, unsubscribe and authorised-use wording, or specify edits. |
| Controlled form tests |  | Approve one minimal test per route, or defer; record metadata only. |
| Workspace security |  | Confirm aliases, recovery owner/backup, 2SV and admin-role review. |
| DKIM/DMARC |  | Approve selector generation/inspection and monitoring-first DMARC plan, or defer all DNS work. |
| Billing/logo review |  | Approve review of Workspace billing and logo/brand profile, or defer; no purchase or terms acceptance. |

## Closure pass — 11 August 2026

The safe website-repository validation and documentation work is complete. The approved patch is merged as `54b3bf3`; Pages deployment `31499602408` succeeded and live canonical/social metadata, sitemap, robots and redirects were verified read-only. Remaining work is formal founder/provider approval or external action only: wording approval, controlled form tests, Workspace ownership/security review, Google-generated DKIM inspection, reviewed DMARC policy/DNS change, and billing/logo review. No credentials, form contents, payments, DNS records, Workspace settings or terms acceptance were accessed or changed.

## Read-only DNS recheck — 12 August 2026

The public DNS now exposes the Google Workspace SPF record (`v=spf1 include:_spf.google.com ~all`) and a Google DKIM TXT record at the `google._domainkey` selector. No `_dmarc.bstudiob.co.uk` TXT record was observed. This records public evidence only; it does not verify that Google Admin reports DKIM as passing, identify the intended recovery/alias owners, or authorise a DMARC change. A founder-approved Workspace check and monitoring-first DMARC decision remain outstanding.

## BSTUDIOB-PIT-WEB-011 — PIT/PicChat subdomain readiness

Status: **Static showcase only now; PIT app subdomain is not ready for controlled pilot.**
Review date: 11 August 2026
Scope: PIT/PicChat website showcase, future `pit.bstudiob.co.uk` boundary and founder/provider gates. No production PIT, MyMark, Buildy, Supabase, Stripe or personal-data systems were touched.

### 1. Static PIT audit result

The local showcase is at `products/pit/index.html` and uses the existing BStudioB layout plus PIT-specific black/paper/violet/coral/mint accents. It has:

- canonical `https://bstudiob.co.uk/products/pit/`, Open Graph/X metadata and the existing 1200×630 BStudioB social card as a conservative placeholder;
- a PIT wordmark copied from the sanitized PIT repository and a sanitized moderation QA image, with descriptive alt text;
- a homepage product card, local links, footer privacy/terms links and a sitemap entry;
- explicit “PIT is the public name of PicChat”, MyMark protection/provenance wording, internal beta/development-preview status and a disabled private-preview CTA;
- explicit limits: no screenshot, browser-cache, camera, outside-copy or unintegrated-platform observability claim; no store, hosted production or live-app claim;
- no form, localhost link, credentials, private key, native build, personal media or authenticated application code.

The responsive CSS includes a five-card mobile layout and the PIT notes grid collapses to one column. The static page is launch-safe as a showcase only, subject to founder copy/asset approval and the existing website publication gate.

### 2. Least-cost hosting boundary decision

The least-cost BStudioB-owned boundary currently evidenced is the existing GitHub Pages site for the static showcase. Keep `/products/pit/` there. GitHub Pages is not an authenticated Flask/API host and must not be used to expose the PIT app, database, media store, workers or MyMark credentials.

No already-approved BStudioB-owned HTTPS app host, DNS activation or production PIT deployment is evidenced in the available sessions. Do not select or configure a paid provider by inference. A future app host must be separately approved, support HTTPS, managed secrets, private storage/database, logs, backups, health checks and deployment rollback, and be contractually owned by BStudioB.

Decision: **do not activate `pit.bstudiob.co.uk` or present a controlled-pilot app link yet.**

### 3. Precise DNS/hosting/HTTPS runbook — future use only

1. Founder names the BStudioB-owned hosting project, provider owner, billing owner and rollback operator; provider terms and cost are approved separately.
2. Provider creates the PIT app environment with a staging hostname first. Production and staging must use separate secrets, databases/buckets, OAuth clients and webhook keys.
3. Provider supplies the exact DNS record for `pit.bstudiob.co.uk` (CNAME or A/AAAA as applicable). Founder reviews the target and TTL; never guess or reuse a personal host record.
4. Registrar adds only that provider-issued record after explicit founder approval. Existing apex, `www`, SPF, DKIM and DMARC records remain untouched.
5. Provider issues the certificate, enforces HTTP→HTTPS, sets HSTS only after HTTPS is confirmed, and verifies certificate renewal.
6. PIT sets `PICCHAT_PUBLIC_ORIGIN`/equivalent to the exact HTTPS origin, validates HTTP and Socket.IO origins, sets secure cookies, and rejects the staging/local origins in production.
7. Register exact OAuth/PKCE callbacks, logout URLs, Capacitor deep links and allowed origins for the approved host; test unauthenticated redirect and denied-origin behaviour.
8. Publish `pit.bstudiob.co.uk` only after health checks, logs, backups, deletion/restore, moderator controls, rate limits and support escalation pass the release checklist.
9. Decide indexing separately: keep authenticated app routes `noindex`/excluded; index only an approved public landing page; do not add staging, localhost, admin, API or media routes to a sitemap.
10. Record DNS owner, provider project, certificate status, deployment commit, test timestamps and rollback reference without recording secrets or user data.

Rollback: disable the public showcase/app link first; roll the app deployment back to the last known-good image/commit; restore the prior environment variables and database migration state; only then remove or restore the provider-issued `pit` DNS record if the host is being withdrawn. Preserve the root BStudioB site and static showcase. DNS rollback is not a substitute for application/data rollback.

### 4. Future PIT app-boundary requirements

- **Authentication/session:** production HTTPS, secure cookies, CSRF, OAuth/PKCE or approved Keycloak boundary, short-lived sessions, logout/revocation, rate limiting, device/session inventory, suspicious-session revocation and account deletion.
- **Authorization/moderation:** conversation membership and media access deny by default; report, quarantine, remove, restore, appeal, takedown and moderator audit paths; signed webhook verification, replay protection and tenant/case binding.
- **Storage/data:** private encrypted object storage, PostgreSQL ownership/tenant isolation, KMS-managed encryption, no public buckets, bounded media access, retention/deletion jobs, export/erasure procedure and no original media in static web assets.
- **Operational safety:** structured logs without message bodies, media, credentials or unnecessary PII; alerting, health checks, backup/PITR, restore rehearsal, incident owner, abuse escalation and release rollback.
- **MyMark boundary:** keep private keys, scanner tokens and service credentials in an approved secret store; do not place them in the website repo, browser bundle, mobile artifact or ops hub; do not claim screenshot or unintegrated-platform visibility.
- **Ops hub boundary:** only non-PII opaque username, product, plan, access/subscription state and source may be mirrored; do not copy messages, email addresses, media, reports or credentials into the founder operations hub.
- **Legal/content:** founder/legal approval for privacy, terms, retention, deletion, moderation, authorised-use, beta limitations, support, incident and takedown wording before invite-only access.

### 5. Evidence and blockers

Verified locally or from the supplied PIT release record: sanitized PIT repository branch `agent/picchat-release-foundation`; responsive `/app` implementation; Chats, Spaces, Create, Activity and Profile surfaces; 49 PicChat tests; Capacitor doctor; Android debug APK; unsigned iOS Simulator app; design QA with no browser console errors; PIT `com.bstudiob.pit` app ID; static showcase assets and metadata in this website repo.

Blocked/not verified: BStudioB-owned production app host; `pit.bstudiob.co.uk` DNS/CNAME; HTTPS certificate; production auth/PKCE/deep links; physical-device qualification; signed APK/AAB/iOS/TestFlight; production PostgreSQL/S3/KMS/Keycloak/PicChat qualification; support/incident owner; privacy/terms approval; store/hosted/public launch approval; any production credential or secret-store evidence.

### 6. Founder/provider approvals required

1. Approve the static showcase wording, sanitized assets and shared social-card placeholder.
2. Confirm “static showcase only now” or separately approve a named BStudioB-owned app host and controlled-pilot plan.
3. If approving a host, name the provider project/owner, cost/terms approver, DNS owner, certificate owner and rollback operator.
4. Approve the exact provider-issued DNS record and HTTPS/redirect plan before any registrar action.
5. Approve production auth/PKCE, device/session controls, storage, moderation, logs, backups, takedown/restore and support/incident design.
6. Approve privacy/terms, retention/deletion, authorised-use, beta limitations and MyMark observability wording.
7. Approve physical-device/signing/deep-link qualification and any later public or store launch separately.

### 7. Commit-ready website handoff

The review-ready local patch consists of the existing PIT showcase changes plus `sitemap.xml` and this task record. Run `git diff --check`, nested local-link checks, metadata/alt-text checks, no-secret scan and the existing website validation before any intentional commit. Do not add a `pit.bstudiob.co.uk` DNS record or app link as part of the static showcase commit. Final decision: **static showcase only now; app subdomain not ready for controlled pilot.**

## BSTUDIOB-HOME-UX-012 — Homepage product-card redesign

Status: **Review-ready local patch; not committed or published.**

### Audit of the previous system

The previous homepage used absolute positioning with hover/focus expansion. On mobile, card copy was hidden and the layout depended on compact tiles. Product descriptions and CTAs were therefore less discoverable on touch and keyboard, while expansion could change the visual position of neighbouring cards. PIT also belonged to a separate preview/subdomain boundary rather than the primary homepage offer.

### Implemented structure

- The homepage now has exactly five cards: FlowCue, Inspector-Edu, Cards, Buildy and a fifth **Custom Workflow Solutions** service card.
- The four product cards occupy a balanced two-column desktop grid; the fifth service card spans the full row as the clear services treatment. Tablet remains two columns and mobile becomes one column.
- PIT remains available at `/products/pit/` as a separate internal-beta showcase; it is not presented as a fifth product card or production app.
- All descriptions and CTAs remain visible without hover. Hover/focus adds only a restrained lift/shadow treatment; it no longer expands one card or hides the others.
- Keyboard focus and touch activation use the same visible content. `prefers-reduced-motion` removes card transforms/transitions, while the existing global motion fallback remains in place.
- The service card uses the BStudioB wordmark rather than implying a specific client case study. Existing product screenshots and alt text are preserved.

### Services wording boundary

The new card and dedicated `services.html` page describe workflow digitisation, company-system configuration, bespoke internal tools and efficiency/process improvement. They are framed as advisory/implementation work subject to scope. They do not promise savings, enterprise scale, a particular technology stack, or guaranteed outcomes. The enquiry CTA uses the existing FormSubmit route, requires consent, links the Privacy notice and states the enquiry-retention position without submitting a test.

### Accessibility/performance checks

- One `h1` remains on the homepage; the services card and all product cards retain meaningful headings, links and descriptive image alt text.
- No essential card copy or CTA is hidden behind hover, and the services CTA is a normal link to `services.html`.
- Responsive checks cover the explicit desktop, tablet and mobile grid breakpoints in CSS; the existing global reduced-motion rule is supplemented with a card-specific no-transform fallback.
- Existing image dimensions and lazy/decode behaviour are preserved; the services card reuses the first-party BStudioB wordmark and adds no external media or runtime dependency.
- Local validation covers nested links, product-link preservation, metadata, sitemap, `git diff --check` and no-secret patterns. Authenticated BStudioB Chrome is used for the local visual pass; no external site state is changed.
- The intended visual check is 1440px desktop, 900px tablet and 390px mobile: five cards, visible copy/CTAs, two product columns, full-width service row and one mobile column. Reduced-motion and keyboard focus must be checked before publication.
- Current automated/static checks pass and the local server returns HTTP 200 for `/`, `/services.html`, `/products/pit/`, `/sitemap.xml` and `/robots.txt`. The authenticated Chrome connector was unavailable in this session because its runtime module could not be mounted; therefore screenshot-level visual confirmation remains a founder/local-browser follow-up, not a claimed pass.

### Changed files and rollback

- `index.html` — updates navigation and implements the five-card homepage composition, with PIT removed from the primary card grid.
- `services.html` — adds the dedicated Custom Workflow Solutions page, scope-bound copy, FormSubmit enquiry CTA and retention/consent wording.
- `privacy.html` — clarifies enquiry retention alongside existing waitlist wording.
- `styles.css` — implements the two-column/fifth-card treatment, restrained interaction, responsive layout and reduced-motion fallback; existing visual tokens are reused.
- `sitemap.xml` — adds the public services route while retaining the PIT showcase route.
- `WEBSITE-AND-GOOGLE-WORKSPACE.md` — records this rationale and the separate PIT app-subdomain boundary.

Rollback is a single local revert of the homepage, service page, privacy, stylesheet, sitemap and documentation changes. It does not touch DNS, Workspace, FormSubmit configuration, PIT assets or the PIT app boundary.

### Founder decision points

1. Approve the five-card order, service positioning and “subject to scope” wording before publication.
2. Approve the dedicated service-page privacy, retention and FormSubmit enquiry wording; conduct one controlled test only after approval.
3. Approve desktop/tablet/mobile visual QA, then approve publication separately.
4. Keep `buildy.bstudiob.co.uk`, `inspector-edu.bstudiob.co.uk` and `pit.bstudiob.co.uk` reserved for independently hosted apps; no DNS, Workspace, Forms, Stripe, billing or external settings are part of this patch.

## PIT website/subdomain showcase handoff

### Scope and naming

PIT is the public name of PicChat for this handoff. The website must present PIT as an internal beta/development preview and must not imply a public production service, store release, screenshot detection capability or unintegrated-platform activity observability. The static marketing showcase and the authenticated PIT application are separate surfaces:

- **Static showcase:** recommended first placement is `https://bstudiob.co.uk/products/pit/` in the existing BStudioB site, reusing the current black/paper/violet/coral/mint visual system and existing social-preview conventions. It can link to the application only when a founder-approved HTTPS origin exists.
- **Authenticated app:** keep `/app` behind the PIT application deployment and authentication. Do not expose `http://127.0.0.1:5099/app`, the local Flask server, debug endpoints, or native development artifacts through the public website.

The conservative link pattern is: BStudioB homepage product card → `/products/pit/` showcase → clearly labelled “Private beta / authorised access” link to the approved PIT HTTPS origin. Until that origin exists, use a non-actionable “Private beta — access by invitation” status rather than a dead or misleading app link.

### Subdomain and deployment proposal

Candidate subdomain: `pit.bstudiob.co.uk`. This is a proposal only; no DNS or hosting action has been taken.

| Surface | Proposed canonical | Deployment target | Required status |
|---|---|---|---|
| Marketing showcase | `https://bstudiob.co.uk/products/pit/` | Existing BStudioB GitHub Pages site | Safe to prepare as a static page after founder content approval. |
| PIT web/PWA | `https://pit.bstudiob.co.uk/` | Separately approved HTTPS-capable application host for the PIT API/web client | Blocked pending host choice, origin configuration, auth/PKCE, production data/storage and security qualification. |
| Native shells | No public website URL; use approved PIT origin/deep links | Capacitor Android/iOS artifacts | Debug-only evidence exists; signing, device qualification and store review are blocked. |

Required domain behaviour for a future PIT origin:

1. Founder/provider chooses the host and confirms it supports HTTPS, health checks, logs, backups, secret management and a rollback deployment.
2. Registrar adds only the provider-issued record for `pit.bstudiob.co.uk` after founder approval; do not guess a CNAME or A record.
3. Provider issues a certificate and redirects HTTP to HTTPS; no broad wildcard or unrelated DNS change is implied.
4. The app sets its canonical public origin to the exact HTTPS URL, validates HTTP and Socket.IO origins against it, and configures approved OAuth/PKCE redirect and native deep-link URLs.
5. The showcase uses a canonical URL, PIT-specific Open Graph/X metadata and an approved social image; the PIT app and showcase have separate robots/sitemap decisions. Do not index an authenticated app, staging host, local address or debug route.
6. Redirect and rollback behaviour is tested before any public link is added: old/temporary host → approved origin only where intentionally configured; deployment rollback restores the last known-good app version without changing DNS.

### Verified PIT evidence versus blocked gates

Verified locally from `/Users/nathanbrown-bennett/Developer/PicChat-sanitized`, branch `agent/picchat-release-foundation` and the supplied release record:

- Responsive PIT web route implemented at `/app` with Chats, Spaces, Create, Activity and Profile surfaces.
- Black/paper/violet/coral/mint direction and PIT dialogue wordmark are implemented; MyMark protection and observability limitations are stated.
- 49 PicChat tests passed; Capacitor doctor passed for iOS/Android; Android and iOS debug builds succeeded.
- Android debug APK exists at `apps/pit-mobile/android/app/build/outputs/apk/debug/app-debug.apk`.
- iOS Simulator app exists at `/tmp/pit-ios-build/Build/Products/Debug-iphonesimulator/App.app`.
- `design-qa.md` records browser QA, no console errors, responsive checks and the remaining P3 icon/fixture refinements.
- Capacitor app ID is `com.bstudiob.pit`.

Not verified or not ready to claim publicly:

- A production HTTPS PIT origin, host/provider, deployment project, health monitoring or DNS record.
- Production auth/PKCE configuration, OAuth client, deep links, session/storage policy or physical-device testing.
- Production PostgreSQL, Keycloak, object-store conformance, backups, restore, rate limits and incident runbooks.
- MyMark/PicChat production tenant, scanner, webhook, signing and service credentials; private keys and credentials must remain outside Git and the website.
- Android signing/AAB, iOS signing/TestFlight, privacy manifest, account deletion, notifications, store review or desktop releases.
- Founder-approved public PIT privacy/terms, retention, moderation, reporting, blocking, consent and beta-access wording.
- A final PIT icon set and populated disposable visual-fixture screenshots.

### Founder/provider gates

Before adding a public PIT link or subdomain, record explicit decisions for:

1. **Showcase approval:** approve `/products/pit/`, the PIT public name, visual treatment, preview status and copy; confirm whether the app link is withheld until an origin is live.
2. **Domain/host approval:** select `pit.bstudiob.co.uk`, approve the host/provider, registrar change and certificate/redirect plan; no DNS change is authorised by this handoff.
3. **Application release boundary:** confirm PIT remains internal beta/development preview until HTTPS, auth, production data/storage, MyMark qualification and security gates pass.
4. **Production credentials:** name the approved secret-store owner and rotation/recovery process for OAuth, MyMark, scanner, signing and storage credentials; never place values in the website repo.
5. **Privacy/terms:** approve or revise PIT data collection, moderation, media retention/deletion, reporting/appeals, account deletion, authorised-use, beta limitations and MyMark observability wording.
6. **Native release:** approve or defer signing, physical-device testing, deep links, privacy manifests, store metadata and release channels.
7. **Public launch:** approve or defer the public website link, indexing, announcement and any user onboarding; no launch is inferred from the existing debug artifacts.

### PIT commit-ready website checklist

The local, uncommitted showcase patch is now prepared. Changed website paths are `index.html`, `styles.css`, `products/pit/index.html`, `assets/projects/pit-moderation-desktop.png`, `assets/brand/pit-mark.svg`, `sitemap.xml` and this review document. The image and mark were copied only from the supplied sanitized PIT QA/static paths. The PIT page currently uses the existing BStudioB 1200×630 social card as a conservative placeholder; a PIT-specific card requires separate founder approval.

No commit is proposed in this handoff. When separately approved, the website-only change should be limited to the showcase page and the minimum navigation/sitemap/social-preview references required to support it:

- [ ] Founder approves the PIT showcase copy, preview label, product link pattern and approved imagery.
- [ ] Add `/products/pit/` as a static page without importing the Flask app, private APIs, credentials, media, keys or native artifacts.
- [ ] Keep the app link invitation-only until the approved HTTPS PIT origin exists; never link to localhost.
- [ ] Add canonical, Open Graph/X metadata and approved 1200×630 social preview; keep authenticated/staging routes out of indexing.
- [ ] Update sitemap only for the public showcase page; update robots only if the final indexing decision requires it.
- [ ] Validate local links, metadata, accessibility basics, no-secret scan, `git diff --check` and the existing visual system.
- [ ] After separate hosting/DNS approval, verify HTTPS, HTTP redirect, canonical origin, auth redirect/deep links, health endpoint, app unauthenticated redirect and no public debug route.
- [ ] Record commit, deployment, rollback reference and post-publication evidence in this review record; do not include credentials, user data or test media.

### PIT rollback

For the static showcase, revert the single website commit and restore the prior sitemap/navigation/social metadata; no DNS rollback is needed. For a future subdomain, first roll back the application deployment to the last known-good version, then remove or restore only the provider-issued `pit` DNS record if the host is being withdrawn, and finally remove the public website link. Preserve the last known-good showcase and BStudioB root site while the PIT app is unavailable.
