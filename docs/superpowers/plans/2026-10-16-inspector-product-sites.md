# Inspector Edu and Pro Websites Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish distinct Inspector-Edu and Inspector-Pro product pages under the existing Inspector hub, with faithful browser-only demos and accurate availability states.

**Architecture:** Keep the existing `/inspector/` route as the product selector and preserve its current demos. Add `/inspector/edu/` and `/inspector/pro/` as standalone static pages with independent visual systems. Edu reuses the existing Cave Bash iframe and parent evidence bridge; Pro combines the existing local topology editor with a deterministic network-flow scenario that demonstrates a weakness, remediation, and replay.

**Tech Stack:** GitHub Pages static HTML, page-local CSS, vanilla JavaScript, SVG/CSS animation, existing Inspector sprite assets.

**Spec:** `docs/superpowers/specs/2026-10-08-inspector-products-and-edu-pilot-hosting.md` and `/Volumes/Adobe Scratch Disk/Inspector/Inspector_Pro.nosync/docs/superpowers/specs/2026-10-16-inspector-pro-network-simulation-design.md`.

## Global Constraints

- The canonical hub remains `https://bstudiob.co.uk/inspector/`; product routes are `https://bstudiob.co.uk/inspector/edu/` and `https://bstudiob.co.uk/inspector/pro/`.
- The hub continues to provide the Edu and Pro previews and links to each standalone product page.
- Do not load the BStudioB global stylesheet, company navigation, or company wordmark into either product page.
- Edu's frame keeps `sandbox="allow-scripts"`, reuses `cave-bash-preview-v2.html`, and accepts only the existing fixed local sample interactions.
- The Pro network scenario is deterministic browser data. It makes no API, app, Docker, Containerlab, Kali, remote-lab, or external-service request.
- Every browser-generated result is labelled simulated. Neither product page implies that the current desktop app or hosted learner runtime is available.
- Inspector-Edu pilot access remains unavailable until hosted runtime is independently verified. Inspector-Pro installers remain in preparation until signed artifacts and checksums exist.
- Preserve source attribution for the existing sprites, current hub's privacy consent, pilot contact destination, canonical metadata, anchor IDs, and reduced-motion support.
- Keep the Edu iframe sandboxed without `allow-same-origin`. Because that produces an opaque frame origin, the parent bridge must broker the existing local sprite-map files through a fixed character allowlist so the animated actors remain visible without weakening the iframe boundary.
- Keep the optional Rickroll video within Story Mode; the user has said no video notice is needed. Scope general safety copy to the in-frame simulation, command execution, Inspector backend, and learner-lab boundary.
- No automated test files or test suite runs are part of this website update; perform the manual rendered-page and interaction review below.

## Review Focus

- Does either new page make a simulation appear to be a real hosted/native run? Check all labels, CTAs, result panes, and metadata.
- Can visitors reach Edu's Cave Bash startup menu, the Coffee Shop Story Mode, and Task Mode without broken relative paths or a network backend?
- Does Pro show a visible attacker path and a policy change that changes the resulting flow, with all events labelled simulated?
- Do product routes work at the GitHub Pages subpath with correct asset URLs, canonical links, keyboard operation, reduced motion, and narrow viewports?
- Does the existing hub continue to work and retain its privacy, contact, availability, and anchor behavior after adding product-page links?

---

## File Structure

- Create `inspector/edu/index.html` for the standalone Edu website and its Cave Bash preview.
- Create `inspector/edu/edu.css` for the pixel-world learning identity, responsive layout, and reduced-motion presentation.
- Reuse `inspector/cave-bash-preview-v2.html`, its page-local CSS/JS, and the existing `inspector/demo-edu.js` message bridge; do not copy or alter sprite assets for this task.
- Modify `inspector/demo-edu.js` and `inspector/cave-bash-preview-v2.js` only as needed to broker local sprite-map JSON through the parent page; keep the existing sprite assets and map JSON unchanged.
- Create `inspector/pro/index.html` for the standalone Pro website, the topology editor, and its network-scenario preview.
- Create `inspector/pro/pro.css` and `inspector/pro/network-demo.js` for the network-lab visual design and deterministic scenario interaction.
- Modify `inspector/index.html` to link from the existing Edu/Pro index and product sections to the standalone routes; preserve the current in-page demos and `#edu`, `#pro`, and `#pilot-enquiry` anchors.
- Modify `inspector/inspector.css` only if a focused style is required for the two new product-page links.

## Tasks

### Task 1: Build the Inspector-Edu product page

**Files:**
- Create: `inspector/edu/index.html`
- Create: `inspector/edu/edu.css`
- Reuse: `inspector/cave-bash-preview-v2.html`
- Reuse: `inspector/demo-edu.js`
- Modify only for sprite-map brokering: `inspector/demo-edu.js`, `inspector/cave-bash-preview-v2.js`
- Modify only for contextual external-video copy: `inspector/edu/index.html`, `inspector/cave-bash-preview-v2.html`, `inspector/demo-edu.js`

**Interfaces:**
- The iframe uses `src="../cave-bash-preview-v2.html"`, `sandbox="allow-scripts"`, and `referrerpolicy="no-referrer"`.
- The parent page provides the `edu-activity-frame`, `edu-evidence`, `edu-expected`, `edu-expected-title`, and `edu-safety` elements consumed by `../demo-edu.js`.
- Since the iframe remains sandboxed with no same-origin permission, it requests sprite maps from its parent by message. The parent accepts only the exact iframe source and a fixed list of sprite characters, fetches the corresponding local JSON from the frame's asset base, and responds only to that iframe; no dynamic path or external URL is accepted.
- The page links to `../` for the Inspector hub and `../../privacy.html` for the privacy notice.

- [x] Create a self-contained Edu marketing page with its own canonical and social metadata, clear Story Mode/Task Mode learning progression, and no BStudioB shell.
- [x] Embed the existing Cave Bash preview using the exact iframe boundary above; preserve its sprite-driven startup menu, Coffee Shop Story Mode, Task Mode, and fixed evidence messages.
- [x] Keep the sandbox boundary while loading and animating the existing character sprites through a validated parent message bridge; do not use `allow-same-origin`.
- [x] State that commands, traffic, deauthentication, and the fictional FBI finale are page-local samples; no learner progress is saved and no live network action occurs.
- [x] Keep the optional Rickroll video confined to Story Mode; do not imply the Cave Bash menu or Task Mode uses it.
- [x] Remove video notice copy as requested. Keep general safety copy accurate by scoping it to the in-frame simulation and learner-lab boundary.
- [x] Show “Pilot in preparation” and unavailable access status. Link institutional enquiries to the existing `/inspector/#pilot-enquiry` form; do not link to the unresolved app hostname.
- [x] Use a pixel-world visual language with warm paper, cave colors, and the existing character artwork. Keep controls, labels, keyboard focus, responsive sizing, and reduced-motion behavior readable.
- [x] Manually confirm the iframe starts at the Cave Bash menu, sprites appear and animate, and the complete Coffee Shop Story Mode and Task Mode render inside the frame and update parent evidence without console errors.

### Task 2: Build the Inspector-Pro product page and network scenario

**Files:**
- Create: `inspector/pro/index.html`
- Create: `inspector/pro/pro.css`
- Create: `inspector/pro/network-demo.js`
- Reuse: `inspector/demo-pro.js`

**Interfaces:**
- The topology editor container remains `#pro-demo` and loads `../demo-pro.js` unchanged.
- The new scenario root is `#network-simulation`; its script initializes only when that root exists.
- Scenario actions update a local state model and render both the SVG flow overlay and accessible event timeline from the same ordered events.

- [x] Create a self-contained Pro product page with its own canonical/social metadata, desktop topology-design positioning, and no BStudioB shell.
- [x] Reuse the current editable topology sample and preserve its structural-check scope, local file downloads, and truthful “no network launched” language.
- [x] Add a deterministic sample with an attacker, router/firewall boundary, and service. Show an explainable weak-policy finding and a visible attempted/allowed traffic path.
- [x] Add Play/Replay and a user-applied hardening action. Replay the same scenario after hardening and show the changed flow as blocked, with before/after findings and an accessible timeline.
- [x] Label every event “Simulated browser sample”. Do not include attack commands, network targets, external requests, or controls that suggest the website launches a lab.
- [x] Show Pro availability and platform installers as in preparation; do not expose a fake download or hosted lab CTA.
- [x] Use a distinct topology-console visual system: dark canvas, visible device/link map, concise evidence labels, and a restrained signal color for allowed/blocked events. Keep responsive layout, keyboard use, focus, and reduced-motion support.
- [x] Manually confirm running, hardening, replay, and reset produce different, internally consistent flow overlays and timeline states.

### Task 3: Connect both product websites from the Inspector hub

**Files:**
- Modify: `inspector/index.html`
- Modify if needed: `inspector/inspector.css`

**Interfaces:**
- Standalone links use relative paths `edu/` and `pro/` so they work on the BStudioB custom domain under `/inspector/`.
- Existing section anchors, embedded demos, privacy text, contact form, and availability stamps remain available.

- [x] Add clear links from the hub's product index and each matching section to its standalone page.
- [x] Preserve all existing section IDs and current standalone preview behavior.
- [x] Keep general safety copy scoped to in-frame actions, command execution, Inspector backend, and learner-lab boundaries; the user has said no video notice is needed.
- [x] Manually confirm the product links resolve from the hub and both standalone pages provide a return link.

### Task 4: Review, publish, and verify the two routes

**Files:**
- Review the complete changes in `inspector/` and the plan document only.

- [x] Run `git diff --check` and confirm only this plan and the scoped Inspector hub/product-page files changed.
- [x] Serve the site from the repository root and review `/inspector/`, `/inspector/edu/`, and `/inspector/pro/` at desktop and mobile widths.
- [x] Manually walk through Edu Story Mode and Task Mode, Pro edit/check/export, Pro attack/flow/remediation/replay, navigation, keyboard focus, reduced motion, and availability/privacy copy.
- [x] Confirm every required HTML/CSS/JS and sprite URL returns successfully beneath the `/inspector/` path; keep browser-generated files outside Git.
- [x] Commit the scoped site update and publish it through the repository's existing GitHub Pages `main`-branch source.
- [x] Verify the three public routes return the new page titles and feature markers after publication. Do not report the Edu app hostname as live unless its DNS and runtime are separately verified.
