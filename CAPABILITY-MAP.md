# Capability Map: QuestWeaver

| Module id | Responsibility | Depends on |
|---|---|---|
| `quest-model` | Versioned, model-friendly JSON project contract and validation | — |
| `ftb-exporter` | Deterministic FTB Quests file-format v13 export | `quest-model` |
| `visual-editor` | Human-friendly chapter, quest, task, reward, layout, and dependency editing | `quest-model` |
| `model-interface` | Copyable AI prompt, schema, example, and JSON import/export | `quest-model`, `ftb-exporter` |
| `static-site` | GitHub Pages build and deployment | All modules |

Build order: `quest-model` → `ftb-exporter` → `visual-editor` → `model-interface` → `static-site`.
