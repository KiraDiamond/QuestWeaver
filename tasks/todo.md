# QuestWeaver MVP Tasks

## Task 1: Bootstrap and contract

- [x] React/Vite/TypeScript project installs and builds.
- [x] Versioned project types, sample, and JSON Schema agree.
- [x] Verify with type checking and schema fixture tests.

## Task 2: Validation and FTB export

- [x] Invalid imported projects produce path-specific errors.
- [x] Stable IDs, dependency rules, and supported variants are checked.
- [x] FTB file-format v13 output and ZIP paths match the spec.
- [x] Verify with focused unit tests and production build.

## Task 3: Chapter and quest workspace

- [x] Users can add, select, rename, and delete chapters, and duplicate quests.
- [x] Empty states and destructive-action confirmation are present.
- [x] Verify with component tests and keyboard interaction.

## Task 4: Layout, tasks, rewards, and dependencies

- [x] Quest nodes are draggable on a bounded canvas.
- [x] Users can set dependencies and edit supported task/reward variants.
- [x] Verify state updates and dependency lines in tests/browser.

## Task 5: Model and file interchange

- [x] AI prompt copies the contract location and embeds current project JSON.
- [x] Project JSON import is capped, validated, and atomic.
- [x] Project JSON and FTB ZIP download successfully.
- [x] Verify round-trip and download behavior.

## Task 6: Documentation and deployment

- [x] README covers human workflow, AI workflow, local use, output location, and limitations.
- [x] CI gates lint, types, tests, build, and high-severity audit.
- [x] Pages workflow publishes `dist` from `main`.

## Task 7: Final verification

- [ ] Full checks pass locally.
- [ ] Browser console is clean at desktop and mobile sizes.
- [ ] Keyboard focus, labels, headings, and responsive layout are verified.
- [ ] Code review finds no unresolved high-priority issues.
