# Implementation Plan: QuestWeaver MVP

## Overview

Deliver a contract-first static editor. Prove the risky FTB exporter with unit tests before building the visual interface, then add AI interchange and Pages deployment.

## Architecture Decisions

- Keep a small, versioned QuestWeaver JSON model separate from FTB's storage format.
- Use deterministic 16-character uppercase hexadecimal IDs and preserve imported IDs.
- Export strict JSON syntax to `.snbt`; JSON is accepted by FTB's current JSON5 reader and avoids ambiguous hand-built SNBT.
- Store text in split localization files matching the current FTB source layout.
- Keep all data in browser memory; downloads are the persistence mechanism.

## Task List

### Phase 1: Contract and exporter

- [ ] Task 1: Bootstrap the typed static app and public project contract.
- [ ] Task 2: Validate projects and generate deterministic FTB files.

### Checkpoint: Foundation

- [ ] Model and exporter tests pass.
- [ ] Application builds cleanly.

### Phase 2: Usable editor

- [ ] Task 3: Build the chapter/quest workspace and property editor.
- [ ] Task 4: Add visual positioning, dependencies, tasks, and rewards.
- [ ] Task 5: Add AI prompt, JSON import/export, and FTB ZIP download.

### Checkpoint: Core flow

- [ ] A project can be created, edited, round-tripped as JSON, and exported.

### Phase 3: Ship

- [ ] Task 6: Add onboarding, documentation, CI, and GitHub Pages deployment.
- [ ] Task 7: Perform automated, browser, accessibility, security, and code-quality verification.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| FTB's format changes | High | Pin project format and FTB file version; isolate exporter |
| AI returns malformed data | High | Schema, example, size cap, boundary validation, atomic import |
| Visual layout becomes complex | Medium | MVP uses drag positioning on one bounded canvas per chapter |
| GitHub project base path breaks assets | Medium | Configure Vite `base` and test the production preview |

## Open Questions

- Validate the first ZIP in a real modpack after this browser MVP is available.
