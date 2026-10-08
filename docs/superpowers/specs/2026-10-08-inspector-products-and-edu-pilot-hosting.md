# Inspector products and Edu pilot hosting

**Status:** Draft for review  
**Date:** 2026-10-08  
**Owner:** BStudioB Ltd

## Purpose

Give Inspector-Edu and Inspector-Pro clear, distinctive product experiences under the BStudioB website, and make the Inspector-Edu supervised pilot reachable online from a stable, controlled host.

The work must describe each product according to its current implementation and readiness. Hosting the pilot does not make Inspector-Edu a public, unsupervised, enterprise, or generally available service.

## User and business outcomes

- An institution can understand Inspector-Edu's guided curriculum, supervised lab model, and pilot status, then ask BStudioB to discuss a pilot.
- A technical team can understand Inspector-Pro as a desktop topology design and validation application, then contact BStudioB about its current availability.
- An approved Inspector-Edu pilot participant can reach a stable HTTPS URL when the institution's supervised pilot is running.
- BStudioB can operate the pilot with known data, credential, backup, and host boundaries.

## Current evidence and constraints

- The BStudioB website is a static GitHub Pages site. It already has an Inspector-Edu page at `trust-security.html`, existing Edu imagery, and a pilot enquiry form.
- Inspector-Edu is an Express application. Its documented pilot requires Node.js 22, Docker Engine available to the Node process, persistent SQLite and PASETO storage, real SMTP, an HTTP(S) `APP_BASE_URL`, an operator present during the session, and preflight/backup/restore checks.
- Docker absence is an abort condition for the documented core pilot. Containerlab is optional and must remain off unless separately configured and proven on the intended host.
- Inspector-Pro's current `QT6` branch describes a PyQt6 desktop application for visual topology editing, device properties, validation, save/load, and JSON/Containerlab YAML export. It is not a hosted web product.
- The existing BStudioB Product License Manager currently accepts `buildy`, `flowcue`, and `device-provisioning-toolkit`; Inspector is not an accepted product key. A production PLM entitlement path therefore remains unresolved.
- The website and product repositories contain unrelated ignored or untracked files. Implementation must preserve them and use narrowly scoped commits.

## Proposed product-site experience

Keep both pages within the existing BStudioB static site, share its header/footer and contact patterns, and give Edu and Pro separate page-level visual systems rather than presenting them as a generic pair of product cards.

### Inspector-Edu page

- Preserve the existing `/trust-security.html` URL and its enquiry flow.
- Rework its composition around a guided learning field guide: warm paper surfaces, restrained blue/green accents drawn from the existing BStudioB palette, clear lesson stages, and genuine Inspector-Edu story imagery.
- Explain the current supported modes and boundaries: guided Story and Task learning, bounded lab tasks, approved Network Editor work, fictional Inspector Online missions, and instructor/operator evidence. Do not imply arbitrary shell access, arbitrary targets, open packet capture, or unrestricted hosted labs.
- Present the supervised, configured-host pilot status beside the enquiry action. The action remains a pilot enquiry; a direct application login is not shown until the account and entitlement path is approved and deployed.
- Add a product-family link to Inspector-Pro.

### Inspector-Pro page

- Add a dedicated Inspector-Pro product page in the BStudioB static site.
- Use a distinct technical workbench direction: deep graphite surfaces, topology/grid linework, cool blue/green accents, and real or clearly labelled interface imagery. Preserve readable type and contrast on smaller screens.
- Describe only evidenced desktop capabilities from the current PyQt6 product: topology canvas, device templates and properties, validation, save/load, and JSON/YAML export.
- State platform and release availability from verified product artifacts. Do not claim a public download, cloud service, digital-twin execution, security assessment, or production readiness without corresponding evidence.
- Provide a contact CTA, not an invented purchase, waitlist, or authenticated-product flow.
- Add a reciprocal product-family link to Inspector-Edu.

### Shared site behavior

- Link both products from the current product gallery and from each product page; retain existing BStudioB navigation and brand assets.
- Keep page-specific layout/styles isolated behind product classes or dedicated stylesheets so the site stylesheet remains maintainable.
- Support keyboard use, semantic headings, visible focus, reduced motion, descriptive alt text, and responsive layouts from mobile through desktop.
- Refresh page title, description, canonical and social metadata, and the sitemap for the new Pro route. Preserve the existing Edu canonical URL.
- Do not change BStudioB's company homepage positioning or rewrite other product pages.

## Proposed Inspector-Edu pilot hosting

### Recommended initial architecture: one dedicated Linux VM

Deploy the clean, approved Inspector-Edu release to a single operator-controlled Linux VM. Run the Express app on this host with a host-local Docker Engine for its supervised learner sandboxes. Keep Docker's Unix socket local to the host; never expose the Docker API over TCP or mount the host socket into unrelated services. Keep Containerlab disabled until the configured-host feature is separately approved and passes its live smoke.

Use persistent, access-restricted paths for the SQLite database, PASETO key, and verified backups. Configure production HTTPS, `APP_BASE_URL`, secure cookies, SMTP, bootstrap admin credentials, and environment secrets outside Git. Permit public inbound traffic only to the HTTPS proxy/application port; restrict operator SSH to an approved source range. Use a dedicated host for Inspector workloads, with no unrelated services or sensitive datasets on the same machine.

The service is a supervised pilot endpoint. A healthy HTTP response or a working sign-in screen does not establish production readiness, public launch, or successful pilot operation. The operator remains present during each learner session and performs the documented pre-session backup, verification, restore drill, capacity check, and shutdown/cleanup.

### Hosting alternatives

1. **Render for the app, plus a separate controlled Docker host:** Render offers managed web services and paid persistent disks, but the application still needs access to Docker Engine for learner sandboxes. A split deployment would require an explicitly designed and secured remote-lab contract, which the current repository does not document. Render disks are single-instance and prevent zero-downtime deploys. Do not select this architecture without a separate design and end-to-end proof.
2. **Single dedicated Linux VM (recommended for the current pilot):** Matches the documented host-local Docker, SQLite, PASETO, SMTP, and operator model with the fewest architectural changes. It is a single-instance service; availability, patching, monitoring, backups, and host security are BStudioB/operator responsibilities.
3. **Future managed SaaS architecture:** Separate the application from the lab runtime, define an authenticated lab-host API, and move state to a supported shared datastore before multi-instance scaling. This is explicitly outside this project.

The cloud provider, account, instance size, region, domain/DNS, operating system image, backup destination/retention, SMTP sender, and budget must be resolved before provisioning. This spec does not create a cloud resource or authorize spend.

## Access and entitlement boundary

- Keep the application available only to approved, verified pilot accounts and an authorised institutional operator. Do not expose an anonymous learner sandbox or add public self-service registration as part of this work.
- Reuse the repository's existing PASETO authentication, organization scoping, admin authorization, policy, sandbox limits, and startup preflight. Do not add an alternate identity, bypass, client-supplied entitlement, or local licensing grant.
- Do not wire Inspector into the Product License Manager until the product key, entitlement contract, grant/expiry behavior, and account handoff are separately approved and implemented fail-closed. Until then, onboarding must follow an existing authorised pilot process; if no such process is available, pilot access is blocked and the service must not be advertised as login-ready.
- Keep the marketing call to action as an enquiry until that approved access path exists.

## Out of scope

- Inspector-Edu conversion to public SaaS, unsupervised use, enterprise/multi-tenant readiness, or a public mission marketplace.
- Arbitrary commands, targets, Docker actions, Containerlab YAML, host packet capture, payload persistence, or removal of existing safety policies.
- Public Pro binary distribution, code-signing/release work, licence integration, payments, or a browser-based Pro rewrite.
- Automated provisioning that writes credentials, DNS, SMTP configuration, cloud costs, or user data without a separately approved runbook.
- High availability, multiple app instances, autoscaling, database migration to Postgres, or guaranteed uptime.

## Delivery sequence

1. Review and approve this spec, including the hosting model and product page directions.
2. Write a separately reviewable implementation plan covering the BStudioB site and Inspector-Edu repository changes.
3. Implement and locally verify the marketing pages. Review the rendered Edu/Pro pages and responsive states before preparing any public site update.
4. Resolve provider/account/budget/domain and pilot-account authorization; prepare a host runbook and environment/secret inventory without placing secrets in Git.
5. On the chosen host, fetch `origin/unstable`, record and deploy the exact clean approved SHA, and complete the current pilot deployment gates: preflight, SMTP smoke, secure bootstrap-admin rotation, verified backup plus temporary restore drill, capacity check for 10 learners, health checks, and an operator-led end-to-end pilot journey.
6. Only after the pilot journey and cleanup are verified, add a clearly labelled pilot-access link to the BStudioB Edu page. Continue describing the service as supervised pilot access.

## Acceptance criteria

### Website

- Edu retains its established URL, inquiry form, privacy consent, and existing working links.
- Pro has its own discoverable page and accurate desktop-first description; no unsupported download or hosted-service claims appear.
- Edu and Pro have visibly different page compositions and visual treatments while retaining BStudioB ownership and navigation.
- Product-family links work in both directions, metadata and sitemap are correct, and neither page changes the BStudioB homepage's established story.
- Layouts remain usable at mobile, tablet, laptop, and desktop widths; keyboard focus, contrast, reduced motion, form consent, and image alternatives are reviewed.

### Hosted pilot

- A recorded, approved clean `origin/unstable` commit is the deployed release identity.
- Production preflight passes with persistent database/key paths, HTTPS/secure cookies, SMTP, correct `APP_BASE_URL`, and host-local Docker available.
- Registration/verification and operator/admin access are checked through real SMTP and the approved pilot onboarding route; no unapproved account or entitlement bypass is used.
- A new SQLite backup verifies and passes a temporary restore drill; database and PASETO key persist across restart/redeploy.
- The documented 10-learner capacity check passes on the target host before a class pilot is claimed.
- An operator completes the supervised learner journey, verifies only intended lab-owned resources were created, and proves shutdown/cleanup.
- Public claims remain limited to the tested supervised pilot profile. No claim of 24/7 availability, enterprise readiness, or production SaaS follows from the endpoint being online.

## Decisions still required before implementation/deployment

1. Approve or revise the two page art directions and the one-VM pilot hosting recommendation.
2. Select the cloud provider/account, region, machine size, domain/DNS, backup destination, SMTP sender, and spend limit.
3. Identify the approved pilot participant onboarding and entitlement route; PLM does not currently accept Inspector.
4. Decide whether any lab feature beyond the core Docker sandbox is required for the first hosted pilot; Containerlab remains disabled by default.
