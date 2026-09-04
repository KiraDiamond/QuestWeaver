import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import type { QuestProject } from '../model/project';
import { createQuestBookZip, exportProjectFiles } from './ftb';

const project: QuestProject = {
  schemaVersion: 1,
  ftbFormat: 13,
  title: 'Test "Book"',
  chapters: [
    {
      id: 'A000000000000001',
      title: 'First steps',
      subtitle: ['Learn the ropes'],
      filename: 'first_steps',
      icon: 'minecraft:crafting_table',
      quests: [
        {
          id: 'B000000000000001',
          title: 'Gather stone',
          subtitle: 'A sturdy start',
          description: ['Collect stone', 'Then bring it home'],
          icon: 'minecraft:stone',
          x: -1.5,
          y: 2,
          size: 1,
          shape: 'circle',
          dependencies: [],
          tasks: [
            {
              id: 'C000000000000001',
              type: 'item',
              item: 'minecraft:stone',
              count: 16,
              consumeItems: false,
            },
            { id: 'C000000000000002', type: 'checkmark' },
          ],
          rewards: [
            { id: 'D000000000000001', type: 'item', item: 'minecraft:diamond', count: 2 },
            { id: 'D000000000000002', type: 'xp', xp: 100 },
          ],
        },
      ],
    },
  ],
};

describe('FTB Quests exporter', () => {
  it('creates the file-format v13 directory structure', () => {
    const files = exportProjectFiles(project);

    expect(files.map((file) => file.path)).toEqual([
      'config/ftbquests/quests/data.snbt',
      'config/ftbquests/quests/chapter_groups.snbt',
      'config/ftbquests/quests/chapters/first_steps.snbt',
      'config/ftbquests/quests/lang/en_us/file.snbt',
      'config/ftbquests/quests/lang/en_us/chapters/first_steps.snbt',
    ]);
    expect(JSON.parse(files[0]?.contents ?? '{}')).toMatchObject({
      version: 13,
      fallback_locale: 'en_us',
      progression_mode: 'linear',
    });
  });

  it('maps quest tasks, rewards, positions, and dependencies to FTB fields', () => {
    const chapterFile = exportProjectFiles(project).find((file) => file.path.includes('/chapters/'));
    const chapter = JSON.parse(chapterFile?.contents ?? '{}') as Record<string, unknown>;
    const quest = (chapter.quests as Array<Record<string, unknown>>)[0];

    expect(quest).toMatchObject({
      id: 'B000000000000001',
      x: -1.5,
      y: 2,
      shape: 'circle',
      size: 1,
      tasks: [
        {
          id: 'C000000000000001',
          type: 'item',
          item: { id: 'minecraft:stone' },
          count: 16,
          consume_items: false,
        },
        { id: 'C000000000000002', type: 'checkmark' },
      ],
      rewards: [
        { id: 'D000000000000001', type: 'item', item: { id: 'minecraft:diamond' }, count: 2 },
        { id: 'D000000000000002', type: 'xp', xp: 100 },
      ],
    });
  });

  it('writes split localization with safely escaped user text', () => {
    const files = exportProjectFiles(project);
    const fileLang = files.find((file) => file.path.endsWith('/file.snbt'));
    const chapterLang = files.find((file) => file.path.includes('/lang/en_us/chapters/'));

    expect(JSON.parse(fileLang?.contents ?? '{}')).toEqual({
      'file.0000000000000001.title': 'Test "Book"',
    });
    expect(JSON.parse(chapterLang?.contents ?? '{}')).toMatchObject({
      'chapter.A000000000000001.title': 'First steps',
      'quest.B000000000000001.title': 'Gather stone',
      'quest.B000000000000001.quest_desc': ['Collect stone', 'Then bring it home'],
    });
  });

  it('packages every generated file into a ZIP', async () => {
    const blob = await createQuestBookZip(project);
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());

    expect(Object.keys(zip.files).filter((path) => !zip.files[path]?.dir).sort()).toEqual(
      exportProjectFiles(project).map((file) => file.path).sort(),
    );
  });

  it('refuses to export an invalid project', () => {
    expect(() => exportProjectFiles({ ...project, title: '' })).toThrow(
      'Quest project is invalid: title: must not be empty',
    );
  });
});
