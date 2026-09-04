# QuestWeaver

QuestWeaver is a browser-based editor for making [FTB Quests](https://github.com/FTBTeam/FTB-Quests) books without writing SNBT by hand. It is designed for both people and general-purpose AI models such as Gemini and GPT.

**Open the editor:** [kiradiamond.github.io/QuestWeaver](https://kiradiamond.github.io/QuestWeaver/)

Everything runs in the browser. Quest projects are not uploaded or stored on a server.

## Make a quest book

1. Rename the starter chapter or add more chapters.
2. Add quests and edit their title, description, icon, size, and shape.
3. Add item or checkmark tasks and item or XP rewards.
4. Connect quests with dependencies and drag their nodes into position.
5. Select **Export FTB ZIP**.
6. Extract the ZIP into the modpack root. It contains `config/ftbquests/quests` and the files FTB Quests expects beneath it.

Keep a reusable copy with **Save JSON**. That file can be imported into QuestWeaver later.

## Build with Gemini, GPT, or another AI

1. Select **Ask AI**.
2. Copy the generated prompt into the model of your choice and tell it what to add or change.
3. Save the model's response as a `.json` file. The response must contain only the JSON object, without a Markdown code fence.
4. Select **Import JSON** in QuestWeaver.
5. Review the result visually, then save the project or export the FTB ZIP.

The prompt links to the public [JSON Schema](https://kiradiamond.github.io/QuestWeaver/questweaver.schema.json) and [example project](https://kiradiamond.github.io/QuestWeaver/questweaver.example.json), so a model can discover the exact contract from the published site.

## Current support

- QuestWeaver project schema version 1
- FTB Quests file format 13
- English (`en_us`) text files
- Item and checkmark tasks
- Item and XP rewards
- Chapter layout, quest dependencies, JSON round-tripping, and ZIP export

The first release intentionally does not import existing FTB `.snbt` books or target older FTB Quests formats. Test an exported book in a copy of your modpack before replacing a working quest book.

## Run locally

Requires a current Node.js LTS release and npm.

```sh
npm ci --ignore-scripts
npm run dev
```

Quality checks:

```sh
npm run lint
npm run typecheck
npm test -- --run
npm run build
```

The production build is written to `dist`. GitHub Pages publishes it automatically from `main` using the workflow in `.github/workflows/deploy.yml`.

## Format notes

QuestWeaver's exporter is based on FTB Quests' current format-13 source behavior: chapter data and localized text are split into their expected directories, and built-in task/reward types use their short type names. The `.snbt` files use strict JSON syntax, which is accepted by the mod's JSON5 reader.

Useful references:

- [FTB Quests source](https://github.com/FTBTeam/FTB-Quests)
- [FTB Quests documentation](https://docs.feed-the-beast.com/docs/mods/suite/Quests/)
- [Vite static deployment guide](https://vite.dev/guide/static-deploy.html#github-pages)
