# Inspector-Pro All-Platform Release Packaging Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement task-by-task. This plan is for the Inspector-Pro repository, not the BStudioB site checkout.

**Goal:** Produce verified, self-contained Inspector-Pro downloads for macOS, Windows, and Linux, and publish only immutable versioned assets with install notes and matching SHA-256 hashes.

**Architecture:** Keep one Python/PyQt6 source tree and build each package on its native operating system. Use an explicit release allowlist, separate runtime data from the installed app, and exclude the existing setup scripts from downloads. No release artifact is public until each target has clean-system launch/use evidence and a release host is selected.

**Tech Stack:** Python 3.10+, PyQt6/PyQt6-WebEngine, `pyproject.toml`, candidate PyInstaller-based native bundles, pytest, OS-native signing/notarization tools where approved.

**Spec:** `docs/superpowers/specs/2026-10-08-inspector-products-and-edu-pilot-hosting.md` in the BStudioB site repo.

**Target repository:** `/Volumes/Adobe Scratch Disk/Inspector/Inspector_Pro.nosync`, current local branch `QT6`. Resolve the repository's canonical remote/source access before any public release work; the observed remote currently rejects fetch/pull as “Repository not found.”

## Global Constraints

- Support all three requested desktop platforms, but choose processor architectures only after native dependency and smoke checks. Record exact OS minimum and architecture in each artifact's release manifest.
- Deliver Inspector-Pro as a desktop topology design/validation tool; do not claim a hosted app, digital-twin execution, security assessment, or production readiness.
- Do not run `setup_qt6.sh` or `setup_qt6.bat` from a user download. They install system dependencies, may request elevation, may install Docker/Containerlab, and launch the development tree.
- Store SQLite data, user topology files, preferences, and logs in per-user OS data locations. Never write runtime data into the application install directory or a bundled database.
- Package only required application code/assets. Exclude credentials, private keys, user databases, environment files, virtual environments, caches, build output, Playwright artifacts, and unrelated vendored projects.
- Preserve the MIT notice and confirm the copyright owner has authority to distribute this branch and its dependency bundle.
- Do not choose a public download host, sign/notarize with an identity, upload artifacts, or enable website links until the owner, host, signing route, and platform matrix are approved.

## Review Focus

- A release archive contains a tracked private key or user data: `tests/release/test_archive_policy.py` enumerates built archives and rejects `.key`, `.pem`, `authorized_keys`, `.env`, SQLite/database files, user data, `node_modules`, `.venv`, and generated output.
- A clean install cannot launch because a Qt plugin or runtime dependency was omitted: `tests/release/test_bundle_manifest.py` compares the declared dependency manifest to the bundle; each native build then passes a GUI launch/use smoke on a clean OS image.
- The first launch writes into the install directory or overwrites a prior topology/database: `tests/test_user_data_location.py` verifies per-user paths and the non-destructive legacy migration contract using temporary homes.
- An installer invokes a setup script, Docker, Containerlab, a package manager, or elevation: `tests/release/test_install_contract.py` rejects those commands and the archive-policy test verifies that legacy setup scripts are absent.
- A website link points to a missing package or a hash does not match its bytes: `tests/release/test_release_manifest.py` requires all target metadata, immutable URLs, and a calculated SHA-256 before a target is marked downloadable.
- A release silently drops license/third-party attribution: `tests/release/test_notices.py` requires the MIT license and bundled dependency notices in every assembled package.

## File Structure

- Modify `pyproject.toml` to point at a real project README and define only the runtime dependency groups needed by the app bundle.
- Create `README.md` as the packaging-facing product/install guide, keeping product scope aligned with `README_QT6.md`.
- Modify `inspector_qt6/database/db_manager.py` and add `inspector_qt6/utils/user_data.py` for OS-specific per-user runtime paths and safe one-time migration.
- Create `packaging/release-files.txt`, `packaging/release-manifest.schema.json`, and `scripts/build_release.py` for a reviewed allowlist, metadata validation, artifact generation, and checksums.
- Create `packaging/pyinstaller/inspector.spec` and native build instructions under `packaging/platforms/` after the packaging proof-of-concept settles.
- Create tests under `tests/release/` and `tests/test_user_data_location.py`.
- Create `release/` output only as ignored local build output; never commit generated packages, personal databases, or private signing material.

## Tasks

### Task 1: Freeze the release target matrix and package contract

**Files:**
- Create: `tests/release/test_release_manifest.py`
- Create: `packaging/release-manifest.schema.json`
- Create: `packaging/platforms/README.md`
- Modify: `README.md`
- Modify: `pyproject.toml`

**Interfaces:**
- Manifest fields: product, semantic version, platform, architecture, minimum supported OS, artifact name, immutable asset URL, SHA-256, install notes, release notes, license, and verification record.
- Initial format candidates: macOS `.dmg`, Windows `.zip` or signed installer, and Linux `.AppImage` or `.tar.gz`; select one per OS only after a native build and install smoke.
- Architecture matrix is a release decision. Candidate starting point is macOS arm64, Windows x86_64, Linux x86_64; do not claim Intel Mac or ARM Windows/Linux without dedicated artifacts and smoke results.

- [ ] **Step 1: Write failing schema/manifest tests** for exactly one entry per supported platform, valid version and architecture, immutable versioned URLs, install notes, license, and 64-character SHA-256.
- [ ] **Step 2: Run `python -m pytest tests/release/test_release_manifest.py` and confirm the new contract fails because no manifest exists.**
- [ ] **Step 3: Repair the packaging metadata:** point `pyproject.toml` to a real README, normalize package metadata to only evidenced product claims, and add concise OS-specific install instructions without privileged setup steps.
- [ ] **Step 4: Record selected output format and minimum OS per target in `packaging/platforms/README.md`; leave unsupported architectures explicitly out.**
- [ ] **Step 5: Run `python -m pytest tests/release/test_release_manifest.py`; expect the schema/manifest contract to pass.**
- [ ] **Step 6: Commit the metadata and manifest contract.**

```bash
git add pyproject.toml README.md packaging/platforms/README.md packaging/release-manifest.schema.json tests/release/test_release_manifest.py
git commit -m "build: define Inspector-Pro release contract"
```

### Task 2: Move app state to per-user data locations

**Files:**
- Create: `inspector_qt6/utils/user_data.py`
- Modify: `inspector_qt6/database/db_manager.py`
- Create: `tests/test_user_data_location.py`

**Interfaces:**
- Resolve the database and writable config/cache paths with an OS-aware per-user library such as `platformdirs`.
- Preserve an explicit `INSPECTOR_DATA_DIR` override for development/support diagnostics; do not change any existing environment variable without checking repository references.
- If a legacy project-local database exists, copy it to the user data directory only when the destination is absent, retain the source until the migrated database opens successfully, and never overwrite an existing user database.

- [ ] **Step 1: Add failing tests** for Windows/macOS/Linux path resolution, an explicit temp-dir override, first-launch directory creation, migration success, and refusal to overwrite an existing destination.
- [ ] **Step 2: Run `python -m pytest tests/test_user_data_location.py` and confirm failure on the current project-local database default.**
- [ ] **Step 3: Implement the resolver and safe migration; update the startup path to use it without depending on the current working directory.**
- [ ] **Step 4: Run `python -m pytest tests/test_user_data_location.py` and the existing database unit tests; expect all to pass with no writes outside temporary test homes.**
- [ ] **Step 5: Commit the data-path change and tests.**

```bash
git add inspector_qt6/utils/user_data.py inspector_qt6/database/db_manager.py tests/test_user_data_location.py
git commit -m "fix: store Inspector-Pro data per user"
```

### Task 3: Build a safe release archive from an explicit allowlist

**Files:**
- Create: `packaging/release-files.txt`
- Create: `scripts/build_release.py`
- Create: `tests/release/test_archive_policy.py`
- Create: `tests/release/test_bundle_manifest.py`
- Create: `tests/release/test_notices.py`
- Modify: `.gitignore`

**Interfaces:**
- Build consumes one clean source revision and a target descriptor; writes only to an ignored `release/` directory.
- The allowlist includes the GUI entry point, required app modules/resources, PyInstaller hooks/spec, license/notice, and install/readme files.
- Deny patterns include `*.key`, `*.pem`, `authorized_keys`, `.env*`, `*.sqlite`, `*.sqlite3`, `*.db`, `database/**`, `.venv/**`, `venv/**`, `node_modules/**`, `.playwright-*`, `output/**`, and unrelated `OTLP/**`.
- Package must not bundle Docker, Containerlab, the development backend unless the GUI demonstrably needs it, or the existing setup scripts.

- [ ] **Step 1: Write failing archive tests** using temporary source fixtures containing a valid app module plus every denylisted credential/data/cache pattern.
- [ ] **Step 2: Run `python -m pytest tests/release/test_archive_policy.py tests/release/test_bundle_manifest.py tests/release/test_notices.py` and confirm they fail before the builder exists.**
- [ ] **Step 3: Implement the allowlist-driven builder and PyInstaller spec.** Produce a dependency report and verify bundled Qt WebEngine resources, plugin paths, licences/notices, and launch entry point for each OS.
- [ ] **Step 4: Verify the three archives exclude all denylisted fixtures and include only reviewed resources; fail closed on an unknown file.**
- [ ] **Step 5: Run the focused release tests and packaging metadata checks; expect all policy tests to pass.**
- [ ] **Step 6: Commit only release source/config/tests, not generated bundles.**

```bash
git add .gitignore packaging/release-files.txt packaging/ scripts/build_release.py tests/release/
git commit -m "build: add allowlisted Inspector-Pro packaging"
```

### Task 4: Build and smoke-test native platform packages

**Files:**
- Modify: `packaging/platforms/README.md`
- Modify: `packaging/pyinstaller/inspector.spec`
- Create: `packaging/platforms/macos.md`
- Create: `packaging/platforms/windows.md`
- Create: `packaging/platforms/linux.md`
- Create: `tests/release/test_install_contract.py`
- Create: `scripts/smoke_release.py`

- [ ] **Step 1: Add a smoke contract** that starts the packaged app, creates a two-node topology, validates it, saves/reopens it, and exports JSON plus YAML in an isolated temporary user profile.
- [ ] **Step 2: Run the smoke harness against a disposable development bundle and verify each operation fails loudly when a required resource is removed.**
- [ ] **Step 3: Build each approved target on its native OS runner.** Do not build macOS/Windows binaries on Linux or claim cross-architecture support without an explicit validated toolchain.
- [ ] **Step 4: Install each package on a clean supported OS image; run the launch/use smoke, confirm data persists after relaunch, and verify no setup script, shell elevation, package manager, Docker, or Containerlab is invoked.**
- [ ] **Step 5: Review macOS signing/notarization and Windows signing requirements against the selected distribution route. Sign only with the approved owner identity; if that identity is unavailable, mark the package unready instead of implying trust.**
- [ ] **Step 6: Record OS build number, CPU architecture, source SHA, dependency inventory, smoke evidence, and unresolved notices for all three targets.**
- [ ] **Step 7: Commit only installer/build documentation and smoke source. Keep binaries ignored.**

```bash
git add packaging/platforms/ packaging/pyinstaller/inspector.spec tests/release/test_install_contract.py scripts/smoke_release.py
git commit -m "build: add native Inspector-Pro release smoke"
```

### Task 5: Create the immutable release manifest and website handoff

**Files:**
- Create: `release/manifest.json` (generated, never committed)
- Modify: BStudioB site `inspector/index.html` only after artifacts are published and verified
- Modify: BStudioB site `tests/inspector-hub.test.mjs`

- [ ] **Step 1: After the release host is selected, upload versioned artifacts and install notes to an immutable release.** Do not overwrite a previously published version.
- [ ] **Step 2: Download each published asset again, calculate SHA-256 locally, and compare the value to the release manifest.**
- [ ] **Step 3: Extend hub tests to require all three links to resolve to the manifest's immutable asset URLs and to display version, OS, architecture, and matching checksum.**
- [ ] **Step 4: Enable website downloads only for targets with complete clean-install evidence and matching hashes; keep any incomplete target in its preparation state.**
- [ ] **Step 5: Review the rendered download section at mobile, tablet, and desktop widths, then commit the site handoff separately from Pro packaging.**

## Publication Gate

No public download is ready until each operating system has its own complete package, install/use smoke, source SHA, version, architecture, install guide, license notices, immutable URL, and matching checksum. The target repo's remote/source-of-truth access, artifact host, publication owner, supported architecture matrix, and signing identity remain explicit release gates.
