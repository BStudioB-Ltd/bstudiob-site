# Inspector products and Edu pilot hosting

**Status:** Draft for review  
**Date:** 2026-10-08  
**Owner:** BStudioB Ltd

## Purpose

Create one distinctive Inspector product hub at `https://bstudiob.co.uk/inspector/` that markets Inspector-Edu and Inspector-Pro, links visitors to the Inspector-Edu web app at `https://inspector.bstudiob.co.uk`, and offers a verified Inspector-Pro download. Make the Inspector-Edu supervised pilot reachable online from a stable, controlled host.

The work must describe each product according to its current implementation and readiness. Hosting the pilot does not make Inspector-Edu a public, unsupervised, enterprise, or generally available service.

## User and business outcomes

- An institution can understand Inspector-Edu's guided curriculum, supervised lab model, and pilot status, then ask BStudioB to discuss a pilot.
- A pilot participant can follow a clear link from the Inspector hub to the live Inspector-Edu application at `inspector.bstudiob.co.uk`.
- A technical team can understand Inspector-Pro as a desktop topology design and validation application, then contact BStudioB about its current availability.
- A visitor can download a versioned Inspector-Pro release for macOS, Windows, or Linux from the Inspector hub.
- An approved Inspector-Edu pilot participant can reach a stable HTTPS URL when the institution's supervised pilot is running.
- The hosted pilot is intended to provide three learner environments: Kali/Linux, Windows, and macOS, subject to each guest runtime being integrated and proven on the selected host.
- BStudioB can operate the pilot with known data, credential, backup, and host boundaries.

## Current evidence and constraints

- The BStudioB website is a static GitHub Pages site. It already has an Inspector-Edu page at `trust-security.html`, existing Edu imagery, and a pilot enquiry form.
- Inspector-Edu is an Express application. Its documented core pilot requires Node.js 22, a Docker Engine runtime available to the Node process for the active Linux/Kali sandbox, persistent SQLite and PASETO storage, real SMTP, an HTTP(S) `APP_BASE_URL`, an operator present during the session, and preflight/backup/restore checks.
- The standalone Linux Docker Engine is an open-source Apache 2.0 project. Docker Desktop subscription terms are a separate product; hosted compute, storage, bandwidth, and registry use may still cost money. See [Docker Engine installation and licensing](https://docs.docker.com/engine/install/) and [Docker Desktop licensing](https://docs.docker.com/subscription-billing/desktop-license/).
- Docker containers share the host kernel. A Linux-host Docker Engine cannot run native Windows containers; see [Docker's multi-platform documentation](https://docs.docker.com/build/building/multi-platform/).
- The implemented active execution profile is Linux/Kali. Windows and macOS are configured-host profiles, not general-purpose live learners' runtimes. `backend/containers/manager.js` currently defaults the Windows selector to a PowerShell image and both macOS and Kali selectors to Alpine Linux. The separate `scripts/provision_os_container.sh` demonstrates candidate VM-in-container paths for Windows (`dockurr/windows`) and macOS (`sickcodes/docker-osx`), requires `/dev/kvm`, and states that these guests are not integrated into Inspector-Edu's execution flow. Windows additionally requires valid licensing; macOS requires Apple hardware and compliant use. Apple documents macOS virtualization on Apple silicon and Intel Mac computers in its [Virtualization framework](https://developer.apple.com/documentation/virtualization).
- The production host must not expose Docker's API over TCP. The current `docker-compose.yml` publishes a socket proxy on port 2375 even though the app's Dockerode manager uses the local Unix socket; `scripts/start-server.js` also starts Compose and kills ports 3000/3002, and `bin/www` opens a secondary listener on 3002. Production startup must not publish/start the proxy, kill unrelated port owners, or expose the test listener. Containerlab remains off unless separately configured and proven on the intended host.
- Inspector-Pro's current `QT6` branch describes a PyQt6 desktop application for visual topology editing, device properties, validation, save/load, and JSON/Containerlab YAML export. It is not a hosted web product.
- The local Inspector-Pro checkout has separate setup paths for macOS, Linux, and Windows, but no packaged release artifact or release tag. The `pyproject.toml` metadata refers to a missing `README.md`; current setup scripts install dependencies on the host and may request elevated privileges. Packaging and a clean-install review are required before any installer is offered as a download.
- The existing BStudioB Product License Manager currently accepts `buildy`, `flowcue`, and `device-provisioning-toolkit`; Inspector is not an accepted product key. A production PLM entitlement path therefore remains unresolved.
- The website and product repositories contain unrelated ignored or untracked files. Implementation must preserve them and use narrowly scoped commits.

## Proposed product-site experience

Create a single BStudioB product hub at `/inspector/`, with a clear contents/navigation pattern for two substantial, visually distinct product sections. Keep the existing BStudioB header/footer and contact patterns, but give Edu and Pro separate visual systems rather than presenting them as a generic pair of product cards.

### Inspector-Edu section

- Use `/inspector/#edu` as the canonical marketing destination and retain the existing pilot enquiry flow.
- Rework its composition around a guided learning field guide: warm paper surfaces, restrained blue/green accents drawn from the existing BStudioB palette, clear lesson stages, and genuine Inspector-Edu story imagery.
- Explain the current supported modes and boundaries: guided Story and Task learning, bounded lab tasks, approved Network Editor work, fictional Inspector Online missions, and instructor/operator evidence. Do not imply arbitrary shell access, arbitrary targets, open packet capture, or unrestricted hosted labs.
- Present the supervised, configured-host pilot status beside both the enquiry action and an `Open Inspector-Edu` action linking directly to `https://inspector.bstudiob.co.uk/`. The link opens the application; it does not promise self-service access or an entitlement.
- Preserve `/trust-security.html` as a compatibility route that clearly links or redirects to `/inspector/#edu`.
- Add a product-family link to Inspector-Pro within the hub.

### Inspector-Pro section and download

- Use a distinct technical workbench direction: deep graphite surfaces, topology/grid linework, cool blue/green accents, and real or clearly labelled interface imagery. Preserve readable type and contrast on smaller screens.
- Describe only evidenced desktop capabilities from the current PyQt6 product: topology canvas, device templates and properties, validation, save/load, and JSON/YAML export.
- Provide a product download control backed by versioned macOS, Windows, and Linux release artifacts and installation notes. The hub may advertise the planned downloads before release, but must not enable a link to a missing, untested, or unsupported artifact.
- State supported platform, processor architecture, and release version from verified release artifacts. Do not claim a cloud service, digital-twin execution, security assessment, or production readiness without corresponding evidence.
- Add a contact CTA and a reciprocal in-page link to Inspector-Edu.
- Build and verify a releasable package for macOS, Windows, and Linux. Each platform's package must install and pass a focused launch/use smoke on a clean supported system. Include an installation guide, version, architecture/platform label, license notice, SHA-256 checksum, and release notes. Review dependency collection, security, and OS-specific signing/notarization requirements before enabling public download. Do not silently elevate privileges or install Docker, Containerlab, or other host services as part of a learner's Pro app installation.
- Keep download hosting separate from the marketing page implementation choice: select an approved release-asset host and link to the immutable, versioned artifact from `/inspector/`.

### Shared site behavior

- Link the current product gallery to `/inspector/`, and include navigation between the Edu and Pro sections within the hub; retain existing BStudioB navigation and brand assets.
- Keep page-specific layout/styles isolated behind product classes or dedicated stylesheets so the site stylesheet remains maintainable.
- Support keyboard use, semantic headings, visible focus, reduced motion, descriptive alt text, and responsive layouts from mobile through desktop.
- Set the hub's title, description, canonical and social metadata, and sitemap entry. Keep `/trust-security.html` as a compatible entry to the canonical hub section.
- Do not change BStudioB's company homepage positioning or rewrite other product pages.

## Proposed Inspector-Edu pilot hosting

### Runtime and hosting decision

The target hosted pilot requires all three guest environments: Kali/Linux, Windows, and macOS. Docker Engine is a valid open-source container runtime for Linux; changing it solely to avoid a Docker Desktop subscription would not provide guest OS virtualization. The host's compute and operations have a cost, and the Windows/macOS profiles need actual guest VMs rather than labels over Linux containers.

Use the repository's Docker plus KVM/QEMU VM-in-container experiment as the first implementation candidate, with these capability gates:

1. **Kali/Linux:** run the current bounded learner sandbox on a Linux Docker Engine. Confirm pinned image provenance, resource limits, network isolation, command policy, and cleanup on the selected host.
2. **Windows:** run the repo's candidate Windows VM image only on a host that provides `/dev/kvm` or another explicitly supported hypervisor path, sufficient CPU/RAM/disk, valid Windows licensing, isolated lab networking, and a controlled guest connection. The current learner manager defaults `windows` to PowerShell on Linux; replace that misleading fallback with the real guest-provider path or an unavailable error.
3. **macOS:** run a macOS guest only on suitable Apple hardware through a compliant virtualization route. The current Docker-OSX experiment's stated `/dev/kvm` requirement and its Apple-hardware requirement must both be reconciled on the actual target; do not assume a generic Linux cloud VM or Docker Desktop host can satisfy them. Require a dedicated compatible Mac host if necessary.
4. **Managed app and runner split:** Render may be considered for the Express app, persistent storage, and public HTTPS edge, but the public docs do not establish access to its host Docker daemon or KVM. Since the current app talks to a local Docker socket, a separate lab host requires a narrow, authenticated, audited runner API with session ownership, network restrictions, timeouts, and cleanup; never expose Docker's raw TCP API.

If one selected host cannot safely run all three, use a multi-host runner architecture and prove the private links and per-OS journey. Do not reduce the agreed OS scope silently; keep the endpoint and relevant marketing action gated until all three are integrated and proven.

For whichever route is selected, set production `APP_BASE_URL` to `https://inspector.bstudiob.co.uk`, configure the approved DNS and TLS certificate, secure cookies, SMTP, bootstrap admin credentials, persistent SQLite/PASETO/backup paths, and secrets outside Git. The deployment must bind only the intended HTTPS application/proxy ports; restrict operator SSH to an approved source range and keep Inspector workloads isolated from unrelated services and sensitive datasets. Keep Containerlab disabled until separately approved and proven on the chosen host.

The service is a supervised pilot endpoint. A healthy HTTP response or working sign-in screen does not establish production readiness, public launch, or successful pilot operation. The operator remains present during each learner session and performs the documented pre-session backup, verification, restore drill, selected-runtime capacity check, and shutdown/cleanup.

The cloud provider, account, instance or host types, region, DNS management for `inspector.bstudiob.co.uk`, backup destination/retention, SMTP sender, and budget must be resolved before provisioning. The Pro release-asset host, build/signing identity, and supported processor architectures must also be resolved before packaging and publishing. This spec does not create a cloud resource, external release, or authorize spend.

## Access and entitlement boundary

- The Edu app link on the hub is public, but app use remains limited to approved, verified pilot accounts and an authorised institutional operator. Do not expose an anonymous learner sandbox or add public self-service registration as part of this work.
- Reuse the repository's existing PASETO authentication, organization scoping, admin authorization, policy, sandbox limits, and startup preflight. Do not add an alternate identity, bypass, client-supplied entitlement, or local licensing grant.
- Do not wire Inspector into the Product License Manager until the product key, entitlement contract, grant/expiry behavior, and account handoff are separately approved and implemented fail-closed. Until then, onboarding must follow an existing authorised pilot process; if no such process is available, pilot access is blocked and the service must not be advertised as login-ready.
- Keep the marketing call to action as an enquiry until that approved access path exists.

## Out of scope

- Inspector-Edu conversion to public SaaS, unsupervised use, enterprise/multi-tenant readiness, or a public mission marketplace.
- Arbitrary commands, targets, Docker actions, Containerlab YAML, host packet capture, payload persistence, or removal of existing safety policies.
- Licence integration, payments, or a browser-based Pro rewrite.
- Automated provisioning that writes credentials, DNS, SMTP configuration, cloud costs, or user data without a separately approved runbook.
- High availability, multiple app instances, autoscaling, database migration to Postgres, or guaranteed uptime.

## Delivery sequence

1. Review and approve this spec, including the three-OS pilot requirement and product page directions.
2. Write a separately reviewable implementation plan covering the BStudioB site, macOS/Windows/Linux Inspector-Pro release packaging, and Inspector-Edu repository/host changes.
3. Implement and locally verify the `/inspector/` product hub and legacy Edu route. Review the rendered sections and responsive states before preparing any public site update.
4. Repair release metadata and build/install-smoke the Pro packages for macOS, Windows, and Linux. Document each immutable release asset/checksum and verify each download from the hub in a clean environment.
5. Integrate and locally prove the Linux/Kali, Windows, and macOS guest providers, secure session lifecycle, and no-TCP-Docker startup. Prepare host-runner-specific operations docs without placing secrets in Git.
6. Resolve provider/account/budget/DNS and pilot-account authorization. Select runner hosts that can actually provide Docker Engine, the required KVM/hypervisor capability, and compliant Apple hardware for macOS.
7. On the selected host set, fetch `origin/unstable`, record and deploy the exact clean approved SHA, and complete the pilot gates: preflight, SMTP smoke, secure bootstrap-admin rotation, verified backup plus temporary restore drill, capacity check for 10 learners across the agreed guest mix, health checks, and an operator-led journey on each guest OS.
8. Only after all three guest journeys and cleanup are verified, make the Edu app link live at `inspector.bstudiob.co.uk`. Continue describing the service as supervised pilot access.

## Acceptance criteria

### Website

- `/inspector/` is the canonical hub and advertises both Edu and Pro in distinct sections; `/trust-security.html` remains a working compatibility route to the Edu section.
- The Edu section has an accurate desktop-first description, retained inquiry form and privacy consent, and a working `Open Inspector-Edu` link to `https://inspector.bstudiob.co.uk/` when the hosted pilot is ready.
- The Pro section has an accurate desktop-first description and working macOS, Windows, and Linux download entries. Each artifact installs and passes a focused launch/use smoke in a clean supported environment, has a version and matching checksum, and has reviewed install instructions; no link points to a missing or unverified artifact.
- Edu and Pro have visibly different page compositions and visual treatments while retaining BStudioB ownership and navigation.
- Product-section links work in both directions, hub metadata and sitemap are correct, and the change does not alter the BStudioB homepage's established story.
- Layouts remain usable at mobile, tablet, laptop, and desktop widths; keyboard focus, contrast, reduced motion, form consent, and image alternatives are reviewed.

### Hosted pilot

- A recorded, approved clean `origin/unstable` commit is the deployed release identity across the app and every lab runner.
- Production preflight passes with persistent app and runner state, HTTPS/secure cookies, SMTP, correct `APP_BASE_URL`, Docker Engine available on the Linux/Kali runner, and verified Windows/macOS guest-runner health.
- Registration/verification and operator/admin access are checked through real SMTP and the approved pilot onboarding route; no unapproved account or entitlement bypass is used.
- A new SQLite backup verifies and passes a temporary restore drill; database and PASETO key persist across restart/redeploy.
- All three required guest environments are integrated with the learner flow on the actual target host set: Kali/Linux, Windows, and macOS. Each has a correct guest-identity check, approved task flow, isolation/resource checks, and session cleanup evidence; no Linux image is presented as a Windows or macOS guest.
- The documented 10-learner capacity check passes on the selected host set for the agreed mix of all three guest runtimes before a class pilot is claimed.
- An operator completes the supervised learner journey, verifies only intended lab-owned resources were created, and proves shutdown/cleanup.
- Public claims remain limited to the tested supervised pilot profile. No claim of 24/7 availability, enterprise readiness, or production SaaS follows from the endpoint being online.

## Decisions still required before implementation/deployment

1. Approve or revise the hub structure and distinct Edu/Pro art directions.
2. Select the Pro release-asset host, build/signing identity, supported processor architectures, and publication owner for all three OS targets.
3. Select the hosting model for all required guest environments. Verify Docker Engine, `/dev/kvm`/hypervisor, suitable Apple hardware, guest licenses, storage, and networking; Render is not assumed to provide VM-host capabilities.
4. Select the cloud/provider accounts and host types, region, machine sizes, DNS management for `inspector.bstudiob.co.uk`, backup destination, SMTP sender, and spend limit.
5. Identify the approved pilot participant onboarding and entitlement route; PLM does not currently accept Inspector.
6. Decide whether any lab feature beyond the three OS guests is required for the first hosted pilot; Containerlab remains disabled by default.
