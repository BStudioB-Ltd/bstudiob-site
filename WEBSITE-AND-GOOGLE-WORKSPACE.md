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

The working tree sitemap and robots file now advertise the canonical `bstudiob.co.uk` hostname instead of the underlying GitHub Pages hostname. Product pages in the working tree also carry canonical and OG/Twitter metadata using the existing social card. These changes do not change DNS, GitHub settings or mailbox routing, and remain unpublished pending review.

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
- Live site: the homepage is reachable over HTTPS, but the four product pages still serve the previous revision without these new canonical/social tags; live sitemap and robots still expose the previous GitHub Pages hostname.
- Live forms and analytics are unchanged and were checked read-only only. No delivery has been proven without an approved real test submission.

### Founder decisions required before publication

The founder should reply with an explicit decision for each item below:

1. **Patch approval:** approve or reject the eight-file repository patch listed above.
2. **Publication approval:** approve or defer committing the patch to the BStudioB GitHub repository and publishing it through GitHub Pages.
3. **Public wording:** approve or request edits to the privacy, terms, retention and unsubscribe wording; this patch does not constitute legal approval.
4. **Form routing:** confirm that `hello@`, `nathan@`, and the five product plus-address routes are BStudioB-owned and intentionally used; approve or defer one controlled test submission per form.
5. **Workspace security:** confirm the named recovery owner, backup method and 2-step-verification coverage for admin/recovery accounts.
6. **Email authentication:** approve or defer generation of the exact Google Workspace DKIM record and a reviewed DMARC monitoring policy; no DNS change is included in this patch.
7. **Workspace administration:** approve or defer logo/brand-profile review and billing review; no payment or terms acceptance is included in this patch.

## Short publish checklist

After the founder approves items 1–2 above:

1. Review the working-tree diff and confirm no credentials, recovery codes, form contents or unrelated files are included.
2. Commit the exact patch with an intentional message.
3. Publish the approved `main` revision through the existing GitHub Pages configuration.
4. Re-check the live homepage, all four product pages, sitemap, robots, HTTPS, `www` redirect and GitHub Pages redirect.
5. Confirm the live pages expose the expected canonical/social metadata and the existing form/Umami markup.
6. Record the commit, publication timestamp and pass/fail evidence in the parent operations thread.
7. Only after separate founder approval, perform Workspace/DNS actions and controlled form-delivery tests.

## WEB-002 execution record

### WEB-002.01 — Working-tree freeze

Scope is limited to the existing website patch and this review document. Current changed paths are `README.md`, `creative-live.html`, `trust-security.html`, `cards.html`, `studio-tools.html`, `sitemap.xml`, `robots.txt` and this file. `git diff --check` passes. Local checks pass for canonical metadata, social metadata, local `href`/`src` targets, sitemap hostnames and robots sitemap reference. No unrelated files are included. The tree remains uncommitted.

### WEB-002.02 — Content review findings

- Privacy notice: identifies Umami, FormSubmit, purpose, US data region, removal request route and a retention statement for waitlist details.
- Terms: identifies informational-site status, waitlist/pilot non-order status, IP wording, and lawful/authorised-use limits for security products.
- Product readiness: FlowCue is invite-only/manual installer; Inspector-Edu is a supervised configured-host pilot; Cards is an early concept; Buildy has planned pricing and states that prices/features/availability may change.
- Founder/legal review flags: confirm the lawful basis and final wording; decide whether enquiry retention needs its own explicit period; decide whether “occasional relevant updates” is sufficiently specific; confirm the email-based removal route is adequate for unsubscribe/withdrawal requests; approve all planned pricing and product-readiness claims.

### WEB-002.03 — Commit package

Exact scope: the eight changed paths listed in WEB-002.01. Suggested commit message: `Prepare canonical metadata and website review pack`. Rollback: revert that single commit, or restore the eight paths to the prior `main` revision before publication; no DNS, Workspace, mailbox or provider state is coupled to this patch.

### WEB-002.04 — Publication checklist

After intentional founder approval and publication, check: apex returns 200 over HTTPS; `www` returns 301 to apex; the GitHub Pages project URL returns 301 to apex; homepage and all four product pages return 200; product pages expose their canonical URLs and social-card metadata; sitemap URLs and robots sitemap reference use `bstudiob.co.uk`; the existing `/privacy.html`, `/terms.html` and `/thanks.html` routes remain reachable; no unexpected visual or form markup changes appear in the published diff.

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

Static QA confirms the Umami script is placed on the homepage, four product pages and thank-you page; the script uses the existing website ID; no form field values are referenced by the analytics markup; the privacy notice states anonymous/cookieless analytics and the current US data region; form consent wording links to the privacy notice. Runtime consent injection is implemented in `site.js` for product forms and should be checked in one approved browser test before publication if founder review requires it. Legal review remains required for the data-region, retention and unsubscribe wording.

### WEB-002.10 — Final founder decision table

| Decision | Approve / defer | Required evidence or note |
|---|---|---|
| Patch scope |  | Eight-path patch and review document are ready; no commit made. |
| Commit and publication |  | Approve intentional commit and GitHub Pages publication, or defer. |
| Public wording |  | Approve privacy, terms, retention, unsubscribe and authorised-use wording, or specify edits. |
| Controlled form tests |  | Approve one minimal test per route, or defer; record metadata only. |
| Workspace security |  | Confirm aliases, recovery owner/backup, 2SV and admin-role review. |
| DKIM/DMARC |  | Approve selector generation/inspection and monitoring-first DMARC plan, or defer all DNS work. |
| Billing/logo review |  | Approve review of Workspace billing and logo/brand profile, or defer; no purchase or terms acceptance. |

## Closure pass — 11 August 2026

The safe website-repository validation and documentation work is complete. No remaining autonomous action is identified within scope. The patch remains intentionally uncommitted and unpublished. Remaining work is formal founder/provider approval or external action only: wording approval, intentional commit/publication, controlled form tests, Workspace ownership/security review, Google-generated DKIM inspection, reviewed DMARC policy/DNS change, and billing/logo review. No credentials, form contents, payments, DNS records, Workspace settings or terms acceptance were accessed or changed.
