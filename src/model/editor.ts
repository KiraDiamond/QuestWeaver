import type { Chapter, Quest, QuestProject, QuestReward, QuestTask } from './project';
import { collectIds, makeId, slugifyFilename } from './project';

export type IdFactory = (existing: ReadonlySet<string>) => string;

function nextId(ids: Set<string>, factory: IdFactory): string {
  const id = factory(ids);
  if (ids.has(id)) throw new Error(`ID factory returned duplicate ID ${id}`);
  ids.add(id);
  return id;
}

function mapQuests(project: QuestProject, mapper: (quest: Quest) => Quest): QuestProject {
  return {
    ...project,
    chapters: project.chapters.map((chapter) => ({
      ...chapter,
      quests: chapter.quests.map(mapper),
    })),
  };
}

export function updateChapter(
  project: QuestProject,
  chapterId: string,
  updates: Partial<Omit<Chapter, 'id' | 'quests'>>,
): QuestProject {
  return {
    ...project,
    chapters: project.chapters.map((chapter) =>
      chapter.id === chapterId ? { ...chapter, ...updates } : chapter,
    ),
  };
}

export function addChapter(project: QuestProject, factory: IdFactory = makeId): QuestProject {
  const ids = collectIds(project);
  const usedFilenames = new Set(project.chapters.map((chapter) => chapter.filename));
  const base = slugifyFilename('New chapter');
  let filename = base;
  let suffix = 2;
  while (usedFilenames.has(filename)) {
    filename = `${base}_${suffix}`;
    suffix += 1;
  }
  return {
    ...project,
    chapters: [
      ...project.chapters,
      {
        id: nextId(ids, factory),
        title: 'New chapter',
        subtitle: [],
        filename,
        icon: 'minecraft:book',
        quests: [],
      },
    ],
  };
}

export function deleteChapter(project: QuestProject, chapterId: string): QuestProject {
  if (project.chapters.length <= 1) return project;
  const removedQuestIds = new Set(
    project.chapters.find((chapter) => chapter.id === chapterId)?.quests.map((quest) => quest.id) ?? [],
  );
  return {
    ...project,
    chapters: project.chapters
      .filter((chapter) => chapter.id !== chapterId)
      .map((chapter) => ({
        ...chapter,
        quests: chapter.quests.map((quest) => ({
          ...quest,
          dependencies: quest.dependencies.filter((id) => !removedQuestIds.has(id)),
        })),
      })),
  };
}

export function addQuest(
  project: QuestProject,
  chapterId: string,
  factory: IdFactory = makeId,
): QuestProject {
  const ids = collectIds(project);
  const quest: Quest = {
    id: nextId(ids, factory),
    title: 'New quest',
    subtitle: '',
    description: ['Describe what the player should do.'],
    icon: 'minecraft:book',
    x: 0,
    y: 0,
    size: 1,
    shape: 'circle',
    dependencies: [],
    tasks: [{ id: nextId(ids, factory), type: 'checkmark' }],
    rewards: [],
  };
  return {
    ...project,
    chapters: project.chapters.map((chapter) =>
      chapter.id === chapterId ? { ...chapter, quests: [...chapter.quests, quest] } : chapter,
    ),
  };
}

export function updateQuest(
  project: QuestProject,
  questId: string,
  updates: Partial<Omit<Quest, 'id'>>,
): QuestProject {
  return mapQuests(project, (quest) => (quest.id === questId ? { ...quest, ...updates } : quest));
}

export function duplicateQuest(
  project: QuestProject,
  questId: string,
  factory: IdFactory = makeId,
): QuestProject {
  const ids = collectIds(project);
  return {
    ...project,
    chapters: project.chapters.map((chapter) => {
      const source = chapter.quests.find((quest) => quest.id === questId);
      if (!source) return chapter;
      const copy: Quest = {
        ...source,
        id: nextId(ids, factory),
        title: `${source.title} copy`,
        x: source.x + 1,
        y: source.y + 1,
        dependencies: [],
        tasks: source.tasks.map((task) => ({ ...task, id: nextId(ids, factory) })),
        rewards: source.rewards.map((reward) => ({ ...reward, id: nextId(ids, factory) })),
      };
      return { ...chapter, quests: [...chapter.quests, copy] };
    }),
  };
}

export function deleteQuest(project: QuestProject, questId: string): QuestProject {
  return {
    ...project,
    chapters: project.chapters.map((chapter) => ({
      ...chapter,
      quests: chapter.quests
        .filter((quest) => quest.id !== questId)
        .map((quest) => ({
          ...quest,
          dependencies: quest.dependencies.filter((dependency) => dependency !== questId),
        })),
    })),
  };
}

export function toggleDependency(
  project: QuestProject,
  questId: string,
  dependencyId: string,
): QuestProject {
  if (questId === dependencyId) return project;
  const exists = project.chapters.some((chapter) =>
    chapter.quests.some((quest) => quest.id === dependencyId),
  );
  if (!exists) return project;
  return mapQuests(project, (quest) => {
    if (quest.id !== questId) return quest;
    const hasDependency = quest.dependencies.includes(dependencyId);
    return {
      ...quest,
      dependencies: hasDependency
        ? quest.dependencies.filter((id) => id !== dependencyId)
        : [...quest.dependencies, dependencyId],
    };
  });
}

export function addTask(
  project: QuestProject,
  questId: string,
  type: QuestTask['type'],
  factory: IdFactory = makeId,
): QuestProject {
  const ids = collectIds(project);
  const id = nextId(ids, factory);
  const task: QuestTask =
    type === 'item'
      ? { id, type, item: 'minecraft:stone', count: 1, consumeItems: false }
      : { id, type };
  return mapQuests(project, (quest) =>
    quest.id === questId ? { ...quest, tasks: [...quest.tasks, task] } : quest,
  );
}

export function updateTask(
  project: QuestProject,
  questId: string,
  taskId: string,
  updates: Partial<QuestTask>,
): QuestProject {
  return mapQuests(project, (quest) =>
    quest.id === questId
      ? {
          ...quest,
          tasks: quest.tasks.map((task) =>
            task.id === taskId ? ({ ...task, ...updates, id: task.id } as QuestTask) : task,
          ),
        }
      : quest,
  );
}

export function deleteTask(project: QuestProject, questId: string, taskId: string): QuestProject {
  return mapQuests(project, (quest) =>
    quest.id === questId
      ? { ...quest, tasks: quest.tasks.filter((task) => task.id !== taskId) }
      : quest,
  );
}

export function addReward(
  project: QuestProject,
  questId: string,
  type: QuestReward['type'],
  factory: IdFactory = makeId,
): QuestProject {
  const ids = collectIds(project);
  const id = nextId(ids, factory);
  const reward: QuestReward =
    type === 'item'
      ? { id, type, item: 'minecraft:diamond', count: 1 }
      : { id, type, xp: 100 };
  return mapQuests(project, (quest) =>
    quest.id === questId ? { ...quest, rewards: [...quest.rewards, reward] } : quest,
  );
}

export function updateReward(
  project: QuestProject,
  questId: string,
  rewardId: string,
  updates: Partial<QuestReward>,
): QuestProject {
  return mapQuests(project, (quest) =>
    quest.id === questId
      ? {
          ...quest,
          rewards: quest.rewards.map((reward) =>
            reward.id === rewardId
              ? ({ ...reward, ...updates, id: reward.id } as QuestReward)
              : reward,
          ),
        }
      : quest,
  );
}

export function deleteReward(project: QuestProject, questId: string, rewardId: string): QuestProject {
  return mapQuests(project, (quest) =>
    quest.id === questId
      ? { ...quest, rewards: quest.rewards.filter((reward) => reward.id !== rewardId) }
      : quest,
  );
}
