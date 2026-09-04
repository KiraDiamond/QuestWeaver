# Spec: QuestWeaver MVP

## Objective

Build a static web application for humans and general-purpose AI models to author FTB Quests books without hand-writing SNBT. A user can arrange quests, edit common fields, exchange a documented JSON project with an AI, and download a ZIP ready to copy into `config/ftbquests/quests`.

The MVP targets FTB Quests save format version 13 and English (`en_us`) localization. Its supported task types are item and checkmark. Its supported reward types are item and XP.

## Tech Stack

- React 19.2 with TypeScript 7
- Vite 8 static build
- Vitest 5 for unit tests
- JSZip 3 for browser-side ZIP generation
- Plain CSS with semantic design tokens

## Commands

- Install: `npm ci --ignore-scripts`
- Develop: `npm run dev`
- Test: `npm test -- --run`
- Type check: `npm run typecheck`
- Lint: `npm run lint`
- Build: `npm run build`
- Preview: `npm run preview`

## Project Structure

- `src/model/` — public project types, constructors, and boundary validation
- `src/export/` — deterministic JSON5/SNBT-compatible FTB file generation
- `src/components/` — focused editor UI components
- `src/__tests__/` — unit and component tests
- `public/` — downloadable schema and model example
- `tasks/` — implementation plan and progress
- `.github/workflows/` — CI and GitHub Pages deployment

## Code Style

Use explicit domain names, immutable state updates, discriminated unions, and pure functions for validation/export.

```ts
export type QuestTask =
  | { id: string; type: 'item'; item: string; count: number; consumeItems: boolean }
  | { id: string; type: 'checkmark' };
```

Components use semantic HTML and accessible native controls. User/model strings render as text only; never as HTML.

## Testing Strategy

- Unit-test ID generation, external JSON validation, dependency validation, and every exported file.
- Component-test the critical create/edit/import interactions.
- Verify the production build in a real browser at desktop and mobile sizes with a clean console.
- Run lint, type checking, tests, build, and dependency audit before completion.

## Boundaries

- Always: validate imported JSON, cap import size, escape serialized strings, preserve stable IDs, test exports, and keep the app client-only.
- Ask first: add new FTB versions, task/reward types, external services, analytics, or runtime permissions.
- Never: execute imported content, render it as HTML, upload projects, collect personal data, or overwrite an imported ID silently.

## Success Criteria

- A first-time user can create and edit chapters and quests without reading SNBT documentation.
- Quests can be repositioned and connected with dependencies.
- Item/checkmark tasks and item/XP rewards can be edited.
- Valid QuestWeaver JSON can be imported and exported; invalid input yields actionable errors without changing the current project.
- An AI prompt plus public JSON Schema and example describes the exact accepted contract.
- Downloaded ZIP contains `data.snbt`, `chapter_groups.snbt`, chapter files, and split `en_us` localization in the current FTB directory structure.
- The app builds and deploys under the `/QuestWeaver/` GitHub Pages base path.

## Open Questions

- Compatibility with older 1.20.x books is intentionally deferred until a real exported book can be tested in-game.
- Additional task/reward types will be prioritized from user and Gemini feedback.
