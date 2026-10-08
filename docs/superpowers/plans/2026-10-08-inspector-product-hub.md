# Inspector Product Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a distinctive, accessible BStudioB Inspector hub at `/inspector/` that markets Edu and Pro, links Edu to its approved live app, and lists only verified Pro downloads.

**Architecture:** Add one static `inspector/index.html` hub with in-page Edu and Pro sections and a product-specific stylesheet. Preserve existing site entry points and use its current static form, navigation, metadata, sitemap, and Node built-in test conventions.

**Tech Stack:** Static HTML/CSS, existing `site.js`, Node.js 22 `node:test`, local static HTTP server for browser review.

**Spec:** `docs/superpowers/specs/2026-10-08-inspector-products-and-edu-pilot-hosting.md`

## Global Constraints

- Canonical Inspector hub: `https://bstudiob.co.uk/inspector/`.
- Inspector-Edu live app target: `https://inspector.bstudiob.co.uk/`; do not enable its link publicly before the supervised pilot host is verified.
- Inspector-Pro download targets: macOS, Windows, and Linux; do not link missing, unverified, or unsupported artifacts.
- Keep Edu copy within the supervised, configured-host pilot boundary and preserve its privacy-consented enquiry flow.
- Give Edu and Pro distinct visual systems while retaining BStudioB navigation, shared brand identity, accessibility, and responsive behavior.
- Preserve the current BStudioB homepage story and unrelated untracked files.

## Review Focus

- Missing Pro package or checksum: the hub shows a clear preparation state, never a dead download; test in `tests/inspector-hub.test.mjs`.
- Edu host is not ready: the app access action stays disabled/withheld while the enquiry route remains usable; test the section's pilot state in the same file.
- `/trust-security.html` or `/inspector` without a trailing slash: visitors still reach the canonical Edu section; test old and canonical routes in the same file.
- Direct `#edu`/`#pro` navigation on keyboard and narrow screens: section headings, focus, and navigation remain usable; assert anchors in unit tests and inspect the rendered page at mobile width.
- Product claims or enquiry consent drift: only approved product copy and the existing required consent/action appear; pin exact content and form fields in the same file.

---

## File Structure

- Create `inspector/index.html` for both product sections, form, download availability states, canonical metadata, and semantic navigation.
- Create `inspector/inspector.css` for the Edu field-guide treatment and Pro technical-workbench treatment; leave shared `styles.css` focused on the rest of the site.
- Modify `index.html` so existing Inspector preview links point to the hub.
- Modify `trust-security.html` into a compatibility entry with a no-JavaScript fallback link to `/inspector/#edu`.
- Modify `sitemap.xml` and `llms.txt` so `/inspector/` is the Inspector marketing destination.
- Create `tests/inspector-hub.test.mjs` using the site's Node built-in test style.

## Tasks

### Task 1: Add Inspector hub and availability contract tests

**Files:**
- Create: `tests/inspector-hub.test.mjs`
- Create (next task): `inspector/index.html`

**Interfaces:**
- Test surface: repository-root static files and canonical URLs, no DOM framework or new dependency.

- [ ] **Step 1: Write failing static-contract tests** named `hub presents distinct Edu and Pro sections`, `Edu access points to the approved app host and remains pilot-only`, `unreleased Pro targets are not clickable downloads`, `pilot enquiry retains required privacy consent`, and `legacy and sitemap routes resolve to the Inspector hub`.
- [ ] **Step 2: Run the new tests and confirm they fail because the hub/route contracts are not implemented.**

Run: `node --test tests/inspector-hub.test.mjs`  
Expected: FAIL on missing hub content or legacy/sitemap links.

- [ ] **Step 3: Commit the failing contract tests.**

```bash
git add tests/inspector-hub.test.mjs
git commit -m "test: define Inspector hub contract"
```

### Task 2: Build the two-product hub

**Files:**
- Create: `inspector/index.html`
- Create: `inspector/inspector.css`
- Test: `tests/inspector-hub.test.mjs`

**Interfaces:**
- Edu section id: `edu`; Pro section id: `pro`.
- Edu app target: `https://inspector.bstudiob.co.uk/`, linked only once the live pilot is ready.
- Pro download controls: three platform-specific states; until immutable artifact URLs and hashes are approved, each is a non-link “in preparation” state.
- Enquiry form: preserve the current Inspector form destination, subject, privacy notice link, and required `privacy_consent` field.

- [ ] **Step 1: Add the two sections, exact approved product boundaries, reciprocal in-page navigation, enquiry form, download states, title/description/canonical/social metadata, and a CSS link to `inspector/inspector.css`.**
- [ ] **Step 2: Run `node --test tests/inspector-hub.test.mjs` and confirm the content and link-state tests pass.**
- [ ] **Step 3: Add component-specific styles:** Edu uses warm BStudioB paper with blue/green guided lesson stages and existing Story imagery; Pro uses graphite surfaces, topology linework, and clear desktop-product imagery. Add visible focus, reduced-motion behavior, responsive layouts, and descriptive image alternatives.
- [ ] **Step 4: Run `node --test tests/inspector-hub.test.mjs` again and confirm all static contracts pass.**
- [ ] **Step 5: Commit only the hub and stylesheet.**

```bash
git add inspector/index.html inspector/inspector.css
git commit -m "feat: add Inspector product hub"
```

### Task 3: Connect existing BStudioB discovery and legacy route

**Files:**
- Modify: `index.html`
- Modify: `trust-security.html`
- Modify: `sitemap.xml`
- Modify: `llms.txt`
- Test: `tests/inspector-hub.test.mjs`

**Interfaces:**
- All Inspector marketing links lead to `/inspector/` or its `#edu`/`#pro` sections.
- `/trust-security.html` is a compatibility entry with a clear fallback link to `/inspector/#edu`; the canonical hub is `/inspector/`.

- [ ] **Step 1: Extend failing tests** to cover both existing Inspector cards, old-route fallback/canonical metadata, sitemap inclusion, and `llms.txt` product destination.
- [ ] **Step 2: Run `node --test tests/inspector-hub.test.mjs` and confirm the new cases fail.**
- [ ] **Step 3: Update the existing home-page product links, compatibility page, sitemap, and AI-discovery entry.**
- [ ] **Step 4: Run `node --test tests/inspector-hub.test.mjs` and the complete static suite `node --test tests/*.test.mjs`; expected: PASS.**
- [ ] **Step 5: Commit only the changed site files and tests.**

```bash
git add index.html trust-security.html sitemap.xml llms.txt tests/inspector-hub.test.mjs
git commit -m "feat: route Inspector discovery to product hub"
```

### Task 4: Review the rendered hub before publication

**Files:**
- Review: `inspector/index.html`, `inspector/inspector.css`, `trust-security.html`

- [ ] **Step 1: Serve the static site locally with `python3 -m http.server 4173`.**
- [ ] **Step 2: Review `/inspector/`, `#edu`, `#pro`, and `/trust-security.html` at 390×844, 768×1024, and 1440×900.**
- [ ] **Step 3: Check keyboard-only navigation, visible focus, reduced motion, image alternatives, privacy consent, outbound links, and horizontal overflow; fix any issue in the owning page/style and rerun the static suite.**
- [ ] **Step 4: Record screenshots for all three viewports in ignored local review output; do not add screenshots or generated output to Git.**
- [ ] **Step 5: Commit any review fixes with a focused message.**

### Task 5: Keep public availability states honest until the pilot is verified

**Files:**
- Modify: `inspector/index.html`
- Modify: `inspector/inspector.css` (only if needed for the unavailable app control)
- Modify: `tests/inspector-hub.test.mjs`

- [x] Replace the active Inspector-Edu app link with a visibly unavailable, accessible control while keeping the institutional enquiry link usable.
- [x] Remove the unsupported Linux/Kali execution claim. State that the hosted learner runtime is not yet verified; identify the current development image as Alpine Linux only if needed for clarity.
- [x] Add regression assertions that no link points to `inspector.bstudiob.co.uk`, app access is unavailable, and the pilot enquiry remains available.
- [x] Run the focused Inspector hub test and the full static suite; review the diff and commit only the task files and this plan update.

## Publication Gate

Do not publish the Edu app link until the live `inspector.bstudiob.co.uk` pilot passes the hosting plan's gates. Do not publish Pro download links until all three platform artifacts have clean-install evidence, hashes, and approved release URLs. The product hub can be reviewed locally before either external service is live.
