import { describe, expect, it } from 'vitest';
import { createProject } from './project';
import {
  addChapter,
  addQuest,
  addReward,
  addTask,
  deleteChapter,
  deleteQuest,
  deleteReward,
  deleteTask,
  duplicateQuest,
  toggleDependency,
  updateQuest,
} from './editor';

function idFactory(...ids: string[]): () => string {
  let index = 0;
  return () => {
    const id = ids[index];
    index += 1;
    if (!id) throw new Error('Test ID factory exhausted');
    return id;
  };
}

describe('editor project operations', () => {
  it('adds chapters with unique filenames', () => {
    const project = createProject();
    const next = addChapter(project, idFactory('A000000000000002'));
    const again = addChapter(next, idFactory('A000000000000003'));

    expect(again.chapters.map((chapter) => chapter.filename)).toEqual([
      'getting_started',
      'new_chapter',
      'new_chapter_2',
    ]);
  });

  it('does not delete the final chapter', () => {
    const project = createProject();
    expect(deleteChapter(project, project.chapters[0]!.id)).toBe(project);
  });

  it('adds and edits a quest without mutating the previous project', () => {
    const project = createProject();
    const chapterId = project.chapters[0]!.id;
    const withQuest = addQuest(
      project,
      chapterId,
      idFactory('B000000000000001', 'C000000000000001'),
    );
    const updated = updateQuest(withQuest, 'B000000000000001', { title: 'Punch a tree', x: 2 });

    expect(project.chapters[0]!.quests).toEqual([]);
    expect(updated.chapters[0]!.quests[0]).toMatchObject({ title: 'Punch a tree', x: 2 });
  });

  it('duplicates quests with fresh child IDs and no dependencies', () => {
    const project = createProject();
    const chapterId = project.chapters[0]!.id;
    const withQuest = addQuest(
      project,
      chapterId,
      idFactory('B000000000000001', 'C000000000000001'),
    );
    const duplicated = duplicateQuest(
      withQuest,
      'B000000000000001',
      idFactory('B000000000000002', 'C000000000000002'),
    );

    expect(duplicated.chapters[0]!.quests[1]).toMatchObject({
      id: 'B000000000000002',
      title: 'New quest copy',
      x: 1,
      y: 1,
      dependencies: [],
      tasks: [{ id: 'C000000000000002', type: 'checkmark' }],
    });
  });

  it('removes deleted quests from every dependency list', () => {
    const project = createProject();
    const chapterId = project.chapters[0]!.id;
    const withFirst = addQuest(
      project,
      chapterId,
      idFactory('B000000000000001', 'C000000000000001'),
    );
    const withSecond = addQuest(
      withFirst,
      chapterId,
      idFactory('B000000000000002', 'C000000000000002'),
    );
    const linked = toggleDependency(withSecond, 'B000000000000002', 'B000000000000001');
    const deleted = deleteQuest(linked, 'B000000000000001');

    expect(deleted.chapters[0]!.quests).toHaveLength(1);
    expect(deleted.chapters[0]!.quests[0]!.dependencies).toEqual([]);
  });

  it('adds and removes supported task and reward variants', () => {
    const project = createProject();
    const chapterId = project.chapters[0]!.id;
    const withQuest = addQuest(
      project,
      chapterId,
      idFactory('B000000000000001', 'C000000000000001'),
    );
    const withTask = addTask(withQuest, 'B000000000000001', 'item', idFactory('C000000000000002'));
    const withReward = addReward(withTask, 'B000000000000001', 'xp', idFactory('D000000000000001'));

    expect(withReward.chapters[0]!.quests[0]).toMatchObject({
      tasks: [
        { id: 'C000000000000001', type: 'checkmark' },
        { id: 'C000000000000002', type: 'item', item: 'minecraft:stone', count: 1 },
      ],
      rewards: [{ id: 'D000000000000001', type: 'xp', xp: 100 }],
    });

    const withoutChildren = deleteReward(
      deleteTask(withReward, 'B000000000000001', 'C000000000000002'),
      'B000000000000001',
      'D000000000000001',
    );
    expect(withoutChildren.chapters[0]!.quests[0]).toMatchObject({
      tasks: [{ type: 'checkmark' }],
      rewards: [],
    });
  });
});
