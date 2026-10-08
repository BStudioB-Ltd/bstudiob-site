# Inspector-Edu Hosted Pilot and OS Runtime Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement task-by-task. This plan targets the Inspector-Edu repository and a future host; it does not authorize cloud provisioning or spend.

**Goal:** Make Inspector-Edu reachable at `https://inspector.bstudiob.co.uk` for an approved, supervised pilot that includes Kali/Linux, Windows, and macOS guest environments, all integrated with the learner flow and verified on the selected host.

**Architecture:** The agreed guest matrix is Kali/Linux, Windows, and macOS. Keep Linux/Kali on the existing Docker Engine path. Evaluate the repository's Windows and macOS VM-in-container path first, then integrate guests behind a server-owned runtime provider interface. The current provisioner requires `/dev/kvm` and is not wired into the learner execution flow; macOS also requires Apple hardware and compliant use. If one host cannot satisfy all requirements, separate the public Express app and one or more private lab runners behind a narrow authenticated API. Render is a candidate for the web app only after the selected service model is proven to provide persistent state; its public docs do not establish host Docker/KVM access.

**Tech Stack:** Node.js 22, Express, Dockerode, Docker Engine for the active Linux sandbox, SQLite, PASETO, systemd/Caddy candidate for a dedicated Linux VM, Jest and Playwright for app contract/runtime verification.

**Spec:** `docs/superpowers/specs/2026-10-08-inspector-products-and-edu-pilot-hosting.md` in the BStudioB site repo.

**Target repository:** `/Volumes/Adobe Scratch Disk/Inspector/Inspector_Edu.nosync/inspector-edu`, current branch `unstable`.

## Global Constraints

- Standalone Linux Docker Engine is open source under Apache 2.0; a Docker Desktop subscription is not the runtime choice for a headless Linux host. The VM, storage, outbound bandwidth, image pulls, monitoring, and operator time may still cost money.
- Docker containers share the host kernel. A Docker Engine on a Linux host does not provide native Windows containers or macOS guests. Do not describe a PowerShell container fallback as a Windows guest or Alpine Linux as macOS.
- The current active core sandbox is Linux/Kali. Windows/macOS profiles require a separate VM/runtime path, image/OS licensing review, and end-to-end integration. The experiment script requires `/dev/kvm`, states macOS requires Apple hardware and compliant use, and explicitly says it is not wired to the learner flow.
- All three guest environments are required. Do not silently downgrade the hosted pilot to Linux-only; if the selected provider cannot run all three, choose a compatible multi-host architecture or block deployment until a compatible host is selected.
- Do not expose the Docker socket over TCP. Remove the unused 2375 socket proxy from production startup/config; any split host must expose a narrow authenticated lab-runner API, never Docker's raw API.
- Production startup must bind the expected app port only. Do not start the development secondary listener on port 3002 or kill arbitrary processes on shared ports.
- Keep Containerlab disabled unless separately approved and verified on the target host.
- Do not provision cloud resources, change DNS, register billing, send pilot invitations, or add provider secrets during implementation planning. Provider, account, region, budget, backup retention, SMTP, DNS authority, and runtime matrix must be approved before those actions.
- Preserve the current auth/onboarding boundary. Do not add public self-service, a local entitlement, an auth bypass, or unapproved Product License Manager integration.

## Review Focus

- A profile is labelled as a live Windows/macOS OS although its actual image is Linux: `tests/hosted_runtime_contract.test.js` checks each runtime label against the selected guest provider and requires actual guest identity evidence before ready status.
- Production exposes the Docker API on `0.0.0.0:2375`: `tests/production_startup_contract.test.js` rejects the published socket proxy and verifies the manager continues to use a local Unix socket.
- A production start opens an undocumented port or kills another process: the same startup contract test checks `npm start`, `scripts/start-server.js`, and `bin/www` for no automatic Compose proxy, wide port cleanup, or production listener on 3002.
- A managed web host silently loses SQLite/PASETO state on restart: `tests/hosted_persistence_contract.test.js` validates configured persistent paths and a restart/restore drill is required on the actual target host.
- A host reports ready while one of the three OS runners or SMTP is absent: `tests/hosted_preflight_contract.test.js` verifies required Linux, Windows, macOS, and SMTP capability failures block readiness; host smoke records Docker/KVM/Apple hardware, guest identity, SMTP, health, backup/restore, and cleanup evidence separately.
- A user-facing pilot claim outruns the actual pilot scope: `tests/hosted_runtime_contract.test.js` pins the required three-guest matrix and prevents a Linux/Kali-only host from reaching pilot-ready status.

## File Structure

- Modify `docker-compose.yml` to remove the unused TCP-published Docker socket proxy after a full reference search.
- Modify `scripts/start-server.js`, `package.json`, and `bin/www` to make production startup single-port and avoid automatic port cleanup or Docker Compose changes.
- Modify `backend/lessons/pilotLessons.js`, `backend/containers/manager.js`, and focused runtime metadata to align all three profile labels with their actual guest providers.
- Create a provider interface under `backend/containers/providers/` for the existing Linux sandbox and the selected Windows/macOS guest hosts; preserve server-owned command/action policy and session ownership.
- Modify `scripts/pilot-preflight.js` and tests only after the runtime decision identifies which capability checks are required.
- Create `tests/hosted_runtime_contract.test.js`, `tests/production_startup_contract.test.js`, `tests/hosted_persistence_contract.test.js`, and `tests/hosted_preflight_contract.test.js` as test-first implementation contracts.
- Modify `docs/deployment.md` and `docs/pilot-runbook.md`; create `docs/hosted-runtime-architecture.md` with the chosen OS matrix, host capability proof, data paths, isolation model, cost assumptions, rollback, backup, and cleanup.
- If a dedicated Linux VM is selected, create `deploy/inspector-edu.service` and `deploy/Caddyfile.example` with secrets supplied from an operator-managed environment file outside Git. Keep actual host names and secrets out of sample values except the public app URL.
- If Render or a split runner is selected, add only the provider adapter/config proven for that architecture. Do not add raw Docker TCP, nested virtualization, or a remote runner based on assumption.

## Tasks

### Task 1: Establish the hosted runtime matrix and architecture record

**Files:**
- Create: `tests/hosted_runtime_contract.test.js`
- Create: `docs/hosted-runtime-architecture.md`
- Modify: `backend/lessons/pilotLessons.js` only if existing metadata misstates availability
- Review: `backend/containers/manager.js`, `scripts/provision_os_container.sh`, `docs/task-mode-curriculum-plan.md`, `docs/os-specific-guarded-blocks.md`, and `docs/pilot-readiness-final-snapshot.md`

**Interfaces:**
- Required guest matrix: `kali-linux`, `windows`, `macos`.
- Runtime states stay explicit: `active-local`, `configured-host-required`, `unavailable`, or `verified-hosted`.
- A profile is `verified-hosted` only when the correct guest boots, the app connects through a managed runner, the approved learner action works, isolation limits hold, and session cleanup is proven.
- Candidate Windows host must provide `/dev/kvm` for the current VM-in-container approach (or a separately reviewed supported hypervisor), enough resources, compatible networking, and valid Windows licensing.
- Candidate macOS host must be Apple hardware and use a compliant route. The current script's KVM requirement must be proven on the exact machine/hypervisor rather than assumed.
- Any Render evaluation must distinguish “can run the Express service with persistent storage” from “can run/operate Docker or KVM guest workloads.” Current Render documentation describes web services, Docker deployments, and persistent disks, but does not establish host Docker daemon or KVM access.

- [ ] **Step 1: Write failing contract tests** for the three required guest profiles, their provider IDs/capability states, and actual OS identity checks. Include regression cases that fail if Alpine is advertised as macOS or a PowerShell image as a native Windows guest.
- [ ] **Step 2: Run `NO_GLOBAL_SERVER=1 SKIP_DOCKER=1 npx jest --runInBand tests/hosted_runtime_contract.test.js` and confirm the false capability case fails against the current profile/runtime mapping.**
- [ ] **Step 3: Correct runtime profile labels and replace the misleading Windows/macOS Linux-image fallback with explicit configured-host errors until the real guest provider is integrated.** Do not implement arbitrary shells or broaden the existing server-owned policy surface.
- [ ] **Step 4: Complete a host-capability decision record:** compare a Linux/KVM host with Windows/macOS VM-in-container, separate Windows and Apple hardware runners, and a managed app plus private runners. Include guest OS proof, `/dev/kvm`/nested virtualization, persistent storage, network isolation, operator effort, current instance costs, image/OS licensing, and recovery. Mark unknown provider features as unknown until proven with official provider evidence or a bounded disposable-host smoke.
- [ ] **Step 5: Review the host decision record with the owner before any provider-specific resource or DNS work.** No provider account, spend, DNS, or secret changes in this task.
- [ ] **Step 6: Run `NO_GLOBAL_SERVER=1 SKIP_DOCKER=1 npx jest --runInBand tests/hosted_runtime_contract.test.js` and the existing Task Mode profile contract tests; expect accurate availability and labels.**
- [ ] **Step 7: Commit the runtime contract, tests, and decision record only.**

```bash
git add backend/lessons/pilotLessons.js tests/hosted_runtime_contract.test.js docs/hosted-runtime-architecture.md
git commit -m "docs: define Inspector-Edu hosted runtime matrix"
```

### Task 2: Remove unsafe/development-only production listeners and startup side effects

**Files:**
- Create: `tests/production_startup_contract.test.js`
- Modify: `docker-compose.yml`
- Modify: `scripts/start-server.js`
- Modify: `package.json`
- Modify: `bin/www`
- Review: `scripts/kill-port.js` call sites and development docs

**Interfaces:**
- Production runtime requires a pre-installed, host-local Docker Engine for the selected Linux sandbox. Development may start dependencies explicitly, but production `npm start` must not publish a Docker proxy or sweep processes by port.
- Dockerode connects through a local Unix socket by default; no `tcp://0.0.0.0:2375` fallback.
- The secondary port is absent in production and enabled only if a separately named local/test opt-in is still required.

- [ ] **Step 1: Add failing tests** that spawn or statically inspect the production start path and assert no `docker compose up`, `kill-port 3000 3002`, published port 2375, or production listener 3002.
- [ ] **Step 2: Run `NO_GLOBAL_SERVER=1 SKIP_DOCKER=1 npx jest --runInBand tests/production_startup_contract.test.js` and confirm failures against current startup behavior.**
- [ ] **Step 3: Remove or disable the socket-proxy Compose service after confirming no supported app path depends on it; the manager already uses Docker's Unix socket.**
- [ ] **Step 4: Make production startup launch the Node server only, require Docker via existing preflight, and avoid killing unrelated processes. Retain an explicit development command for any needed local Compose services.**
- [ ] **Step 5: Gate or remove the secondary 3002 server so it cannot bind in production.**
- [ ] **Step 6: Run `NO_GLOBAL_SERVER=1 SKIP_DOCKER=1 npx jest --runInBand tests/production_startup_contract.test.js tests/startup_readiness.integration.test.js`; separately run the focused Docker-backed sandbox tests on a disposable local Engine. Expect only the documented app port and no published daemon API.**
- [ ] **Step 7: Commit startup and test changes separately from host/provider config.**

```bash
git add docker-compose.yml scripts/start-server.js package.json bin/www tests/production_startup_contract.test.js
git commit -m "fix: constrain Inspector-Edu production startup"
```

### Task 3: Integrate the three guest providers with server-owned lifecycle and policy

**Files:**
- Create: `backend/containers/providers/linuxContainerProvider.js`
- Create: `backend/containers/providers/windowsVmProvider.js`
- Create: `backend/containers/providers/macosVmProvider.js`
- Create: `backend/containers/providers/registry.js`
- Modify: `backend/containers/manager.js`
- Modify: `backend/containers/sandboxSessions.js`
- Modify: `backend/operations/cleanupCoordinator.js`
- Modify: `backend/lessons/pilotLessons.js`
- Create: `tests/guest_provider_contract.test.js`
- Create: `tests/guest_provider_lifecycle.integration.test.js`

**Interfaces:**
- Provider contract: `provision(session)`, `inspect(session)`, `runApprovedAction(session, actionId, args)`, `stop(session)`, and `destroy(session)`; no browser-provided image, host, VM ID, Docker ID, or arbitrary command.
- Each guest record is bound to an authenticated user, organization, server-owned session ID, guest OS, approved image/VM template, resource policy, and cleanup lease.
- Linux/Kali keeps the current server-owned command policy and fixed sandbox resource limits. Windows and macOS use only reviewed task/block actions and an approved guest control channel such as a restricted PowerShell/WinRM or SSH adapter; do not execute the current `sh -lc` path against a non-Linux guest.
- Do not expose guest RDP/VNC/SSH/WinRM ports publicly. If a visual console is required, route it through authenticated app-controlled access with short-lived session binding.
- The current `scripts/provision_os_container.sh` is a candidate provisioner only; validate pinned image provenance, `/dev/kvm`, resource controls, network isolation, readiness, and guest cleanup before adapting it. Keep macOS on Apple hardware and confirm compliant use before enabling it.

- [ ] **Step 1: Add failing provider contract and lifecycle tests** for all three profiles, wrong-OS detection, auth/session binding, allowed action IDs, resource limits, readiness timeout, per-user isolation, idempotent cleanup, and unavailable provider behavior.
- [ ] **Step 2: Run `NO_GLOBAL_SERVER=1 SKIP_DOCKER=1 npx jest --runInBand tests/guest_provider_contract.test.js tests/guest_provider_lifecycle.integration.test.js` and confirm the tests fail because the current manager has one local Docker implementation and no Windows/macOS guest provider.**
- [ ] **Step 3: Extract the current Linux Docker path behind the provider interface without changing its allowlist/policy behavior.**
- [ ] **Step 4: Integrate Windows VM provision/readiness/action/stop/cleanup for the selected host path; pin the approved image/version and bind the guest to a private lab network.**
- [ ] **Step 5: Integrate the macOS VM provider on the selected Apple hardware path; verify guest identity, restricted control channel, session lifecycle, and no public listener.**
- [ ] **Step 6: Update session persistence and cleanup to use provider-owned IDs and leases; stop or quarantine a guest when ownership cannot be established.**
- [ ] **Step 7: Run provider contract/lifecycle tests plus focused Linux sandbox, policy, cleanup, and session tests; expect all three profiles to be represented accurately and no shell/action policy expansion.**
- [ ] **Step 8: Commit the provider interface and contracts as one focused change; do not check in host credentials, VM images, or runtime databases.**

```bash
git add backend/containers/providers/linuxContainerProvider.js backend/containers/providers/windowsVmProvider.js backend/containers/providers/macosVmProvider.js backend/containers/providers/registry.js backend/containers/manager.js backend/containers/sandboxSessions.js backend/operations/cleanupCoordinator.js backend/lessons/pilotLessons.js tests/guest_provider_contract.test.js tests/guest_provider_lifecycle.integration.test.js
git commit -m "feat: add managed multi-OS pilot runtimes"
```

### Task 4: Prepare persistent supervised-host configuration

**Files:**
- Create: `docs/hosted-pilot-runbook.md`
- Create: `tests/hosted_persistence_contract.test.js`
- Create: `tests/hosted_preflight_contract.test.js`
- Create (dedicated VM choice only): `deploy/inspector-edu.service`
- Create (dedicated VM choice only): `deploy/Caddyfile.example`
- Modify: `docs/deployment.md`
- Modify: `docs/pilot-runbook.md`
- Modify: `scripts/pilot-preflight.js` only where the selected runtime needs a new explicit check

- [ ] **Step 1: Add failing contracts** for `APP_BASE_URL=https://inspector.bstudiob.co.uk`, secure production cookies, SQLite and PASETO paths under persistent controlled storage, no secrets in Git, and profile-specific host requirements.
- [ ] **Step 2: Run `NO_GLOBAL_SERVER=1 SKIP_DOCKER=1 npx jest --runInBand tests/hosted_persistence_contract.test.js tests/hosted_preflight_contract.test.js` and confirm missing deployment samples/guards fail.**
- [ ] **Step 3: Document the selected architecture only.** For a dedicated Linux VM, include least-privilege operator accounts, local Unix socket handling, systemd restart policy, HTTPS proxy, SSH source restriction, external environment file, backup destination/retention, restore drill, image pre-pull, rollback, and cleanup. For Render or a split runner, include the separate runner API and testable service boundaries before adding infrastructure config.
- [ ] **Step 4: Add safe example service/proxy configuration only after the host model is selected.** Templates must contain no credentials, service IDs, actual account data, or DNS mutations.
- [ ] **Step 5: Extend preflight to fail closed for each explicitly requested runtime:** Linux Docker daemon; guest/KVM or runner health only when that guest is part of the approved pilot. The result must state profile availability without leaking secrets.
- [ ] **Step 6: Run focused preflight/runtime config/backup unit tests; verify no secret values appear in human or JSON output.**
- [ ] **Step 7: Commit docs/config/tests. Do not apply the service file, create a VM, or change DNS as part of this commit.**

```bash
git add docs/deployment.md docs/pilot-runbook.md docs/hosted-pilot-runbook.md tests/hosted_persistence_contract.test.js tests/hosted_preflight_contract.test.js scripts/pilot-preflight.js deploy/
git commit -m "docs: prepare Inspector-Edu hosted pilot operations"
```

### Task 5: Provision and verify the approved host after provider and budget selection

**Files:**
- Deployment only: approved host/service configuration
- Evidence: operator-controlled deployment record and smoke outputs
- Site handoff: BStudioB `inspector/index.html` and `tests/inspector-hub.test.mjs`

- [ ] **Step 1: Confirm in the deployment record the three guest profiles, exact clean `origin/unstable` SHA, provider/account and every required runner type, region, host shape, DNS authority, backup destination, SMTP sender, monthly limit, and rollback owner. Stop if any item is unresolved.**
- [ ] **Step 2: Provision only the approved resources and configure the exact host name `inspector.bstudiob.co.uk`; keep all secret values in the selected host's secret manager/environment file.**
- [ ] **Step 3: Verify HTTPS and DNS from outside the host, `/healthz`, `/readyz`, and the correct source SHA. Confirm no 2375 listener and no 3002 listener.**
- [ ] **Step 4: Run `npm run preflight:pilot`, actual SMTP verification/reset smoke, bootstrap-admin rotation, SQLite backup/verify/temporary restore, and persistent database/key restart checks.**
- [ ] **Step 5: For Kali/Linux, Windows, and macOS, prove actual guest identity, app connection, approved local-only task, resource limits, network restriction, and shutdown/cleanup. A missing or failed guest blocks the all-three pilot claim.**
- [ ] **Step 6: Run the 10-learner capacity smoke against the exact selected mix of the three guest runtimes, then complete operator-led learner journeys and cleanup. Record all evidence and abort on any failed gate.**
- [ ] **Step 7: Only after pilot proof, enable the BStudioB hub's Edu app link. Reopen the hub and verify its status/copy and exact outbound target.**

## Deployment Gate

The hosted URL may be prepared after a provider and budget are chosen, but the public hub must not label the app login-ready or a guest OS available until the actual pilot journey has passed for all three required guests. Docker Engine license cost is not a reason by itself to replace it; decide based on host cost, `/dev/kvm` or other hypervisor capability, Apple hardware, OS licensing, isolation, and integration effort. A Linux VM with ordinary Docker alone does not satisfy the agreed Windows/macOS guest requirement.
