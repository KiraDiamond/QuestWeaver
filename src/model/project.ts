export const QUESTWEAVER_SCHEMA_VERSION = 1 as const;
export const FTB_FILE_FORMAT = 13 as const;
export const MAX_IMPORT_CHARACTERS = 1_000_000;

export type QuestShape =
  | 'circle'
  | 'square'
  | 'diamond'
  | 'rsquare'
  | 'pentagon'
  | 'hexagon'
  | 'octagon'
  | 'heart'
  | 'gear';

export type QuestTask =
  | {
      id: string;
      type: 'item';
      item: string;
      count: number;
      consumeItems: boolean;
    }
  | { id: string; type: 'checkmark' };

export type QuestReward =
  | { id: string; type: 'item'; item: string; count: number }
  | { id: string; type: 'xp'; xp: number };

export interface Quest {
  id: string;
  title: string;
  subtitle: string;
  description: string[];
  icon: string;
  x: number;
  y: number;
  size: number;
  shape: QuestShape;
  dependencies: string[];
  tasks: QuestTask[];
  rewards: QuestReward[];
}

export interface Chapter {
  id: string;
  title: string;
  subtitle: string[];
  filename: string;
  icon: string;
  quests: Quest[];
}

export interface QuestProject {
  schemaVersion: typeof QUESTWEAVER_SCHEMA_VERSION;
  ftbFormat: typeof FTB_FILE_FORMAT;
  title: string;
  chapters: Chapter[];
}

export type ParseProjectResult =
  | { ok: true; project: QuestProject }
  | { ok: false; errors: string[] };

const ID_PATTERN = /^[0-9A-F]{16}$/;
const RESOURCE_PATTERN = /^[a-z0-9_.-]+:[a-z0-9_./-]+$/;
const FILENAME_PATTERN = /^[a-z0-9][a-z0-9_-]{0,63}$/;
const SHAPES = new Set<QuestShape>([
  'circle',
  'square',
  'diamond',
  'rsquare',
  'pentagon',
  'hexagon',
  'octagon',
  'heart',
  'gear',
]);

export function makeId(existing: ReadonlySet<string> = new Set()): string {
  const bytes = new Uint8Array(8);
  for (let attempt = 0; attempt < 100; attempt += 1) {
    crypto.getRandomValues(bytes);
    const id = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
    if (!existing.has(id) && id !== '0000000000000000') return id;
  }
  throw new Error('Unable to generate a unique project ID');
}

export function slugifyFilename(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 64);
  return slug || 'chapter';
}

export function createQuest(existing: ReadonlySet<string> = new Set()): Quest {
  return {
    id: makeId(existing),
    title: 'New quest',
    subtitle: '',
    description: ['Describe what the player should do.'],
    icon: 'minecraft:book',
    x: 0,
    y: 0,
    size: 1,
    shape: 'circle',
    dependencies: [],
    tasks: [{ id: makeId(existing), type: 'checkmark' }],
    rewards: [],
  };
}

export function createChapter(existing: ReadonlySet<string> = new Set()): Chapter {
  return {
    id: makeId(existing),
    title: 'Getting Started',
    subtitle: [],
    filename: 'getting_started',
    icon: 'minecraft:book',
    quests: [],
  };
}

export function createProject(): QuestProject {
  return {
    schemaVersion: QUESTWEAVER_SCHEMA_VERSION,
    ftbFormat: FTB_FILE_FORMAT,
    title: 'My Quest Book',
    chapters: [createChapter()],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function addStringError(
  errors: string[],
  value: unknown,
  path: string,
  options: { allowEmpty?: boolean; max?: number; pattern?: RegExp; patternMessage?: string } = {},
): value is string {
  if (typeof value !== 'string') {
    errors.push(`${path}: must be a string`);
    return false;
  }
  if (!options.allowEmpty && value.trim().length === 0) {
    errors.push(`${path}: must not be empty`);
  }
  if (options.max !== undefined && value.length > options.max) {
    errors.push(`${path}: must be at most ${options.max} characters`);
  }
  if (options.pattern && !options.pattern.test(value)) {
    errors.push(`${path}: ${options.patternMessage ?? 'has an invalid format'}`);
  }
  return true;
}

function addNumberError(
  errors: string[],
  value: unknown,
  path: string,
  options: { integer?: boolean; min?: number; max?: number } = {},
): value is number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    errors.push(`${path}: must be a finite number`);
    return false;
  }
  if (options.integer && !Number.isInteger(value)) errors.push(`${path}: must be an integer`);
  if (options.min !== undefined && value < options.min) errors.push(`${path}: must be at least ${options.min}`);
  if (options.max !== undefined && value > options.max) errors.push(`${path}: must be at most ${options.max}`);
  return true;
}

function validateId(errors: string[], value: unknown, path: string, ids: Set<string>): value is string {
  if (!addStringError(errors, value, path)) return false;
  if (!ID_PATTERN.test(value)) {
    errors.push(`${path}: must be 16 uppercase hexadecimal characters`);
    return false;
  }
  if (ids.has(value)) errors.push(`${path}: duplicates another object ID`);
  ids.add(value);
  return true;
}

function validateStringArray(errors: string[], value: unknown, path: string, maxItems: number): void {
  if (!Array.isArray(value)) {
    errors.push(`${path}: must be an array`);
    return;
  }
  if (value.length > maxItems) errors.push(`${path}: must contain at most ${maxItems} entries`);
  value.forEach((entry, index) => addStringError(errors, entry, `${path}[${index}]`, { allowEmpty: true, max: 500 }));
}

function validateTask(errors: string[], value: unknown, path: string, ids: Set<string>): void {
  if (!isRecord(value)) {
    errors.push(`${path}: must be an object`);
    return;
  }
  validateId(errors, value.id, `${path}.id`, ids);
  if (value.type === 'checkmark') return;
  if (value.type !== 'item') {
    errors.push(`${path}.type: must be "item" or "checkmark"`);
    return;
  }
  addStringError(errors, value.item, `${path}.item`, {
    pattern: RESOURCE_PATTERN,
    patternMessage: 'must be a namespaced resource such as minecraft:stone',
  });
  addNumberError(errors, value.count, `${path}.count`, { integer: true, min: 1, max: Number.MAX_SAFE_INTEGER });
  if (typeof value.consumeItems !== 'boolean') errors.push(`${path}.consumeItems: must be a boolean`);
}

function validateReward(errors: string[], value: unknown, path: string, ids: Set<string>): void {
  if (!isRecord(value)) {
    errors.push(`${path}: must be an object`);
    return;
  }
  validateId(errors, value.id, `${path}.id`, ids);
  if (value.type === 'item') {
    addStringError(errors, value.item, `${path}.item`, {
      pattern: RESOURCE_PATTERN,
      patternMessage: 'must be a namespaced resource such as minecraft:diamond',
    });
    addNumberError(errors, value.count, `${path}.count`, { integer: true, min: 1, max: 64 });
    return;
  }
  if (value.type === 'xp') {
    addNumberError(errors, value.xp, `${path}.xp`, { integer: true, min: 1, max: 1_000_000 });
    return;
  }
  errors.push(`${path}.type: must be "item" or "xp"`);
}

function validateQuest(
  errors: string[],
  value: unknown,
  path: string,
  ids: Set<string>,
  questIds: Set<string>,
): void {
  if (!isRecord(value)) {
    errors.push(`${path}: must be an object`);
    return;
  }
  if (validateId(errors, value.id, `${path}.id`, ids)) questIds.add(value.id);
  addStringError(errors, value.title, `${path}.title`, { max: 120 });
  addStringError(errors, value.subtitle, `${path}.subtitle`, { allowEmpty: true, max: 240 });
  validateStringArray(errors, value.description, `${path}.description`, 50);
  addStringError(errors, value.icon, `${path}.icon`, {
    pattern: RESOURCE_PATTERN,
    patternMessage: 'must be a namespaced resource such as minecraft:book',
  });
  addNumberError(errors, value.x, `${path}.x`, { min: -10_000, max: 10_000 });
  addNumberError(errors, value.y, `${path}.y`, { min: -10_000, max: 10_000 });
  addNumberError(errors, value.size, `${path}.size`, { min: 0.25, max: 4 });
  if (typeof value.shape !== 'string' || !SHAPES.has(value.shape as QuestShape)) {
    errors.push(`${path}.shape: is not a supported quest shape`);
  }
  validateStringArray(errors, value.dependencies, `${path}.dependencies`, 100);
  if (!Array.isArray(value.tasks)) errors.push(`${path}.tasks: must be an array`);
  else value.tasks.forEach((task, index) => validateTask(errors, task, `${path}.tasks[${index}]`, ids));
  if (!Array.isArray(value.rewards)) errors.push(`${path}.rewards: must be an array`);
  else value.rewards.forEach((reward, index) => validateReward(errors, reward, `${path}.rewards[${index}]`, ids));
}

export function validateProject(value: unknown): string[] {
  const errors: string[] = [];
  if (!isRecord(value)) return ['project: must be an object'];
  if (value.schemaVersion !== QUESTWEAVER_SCHEMA_VERSION) errors.push('schemaVersion: must be 1');
  if (value.ftbFormat !== FTB_FILE_FORMAT) errors.push('ftbFormat: must be 13');
  addStringError(errors, value.title, 'title', { max: 120 });
  if (!Array.isArray(value.chapters)) {
    errors.push('chapters: must be an array');
    return errors;
  }
  if (value.chapters.length === 0) errors.push('chapters: must contain at least one chapter');
  if (value.chapters.length > 100) errors.push('chapters: must contain at most 100 chapters');

  const ids = new Set<string>();
  const questIds = new Set<string>();
  value.chapters.forEach((chapter, chapterIndex) => {
    const path = `chapters[${chapterIndex}]`;
    if (!isRecord(chapter)) {
      errors.push(`${path}: must be an object`);
      return;
    }
    validateId(errors, chapter.id, `${path}.id`, ids);
    addStringError(errors, chapter.title, `${path}.title`, { max: 120 });
    validateStringArray(errors, chapter.subtitle, `${path}.subtitle`, 20);
    addStringError(errors, chapter.filename, `${path}.filename`, {
      pattern: FILENAME_PATTERN,
      patternMessage: 'must use only lowercase letters, numbers, underscores, or hyphens',
    });
    addStringError(errors, chapter.icon, `${path}.icon`, {
      pattern: RESOURCE_PATTERN,
      patternMessage: 'must be a namespaced resource such as minecraft:book',
    });
    if (!Array.isArray(chapter.quests)) errors.push(`${path}.quests: must be an array`);
    else if (chapter.quests.length > 500) errors.push(`${path}.quests: must contain at most 500 quests`);
    else chapter.quests.forEach((quest, questIndex) => validateQuest(errors, quest, `${path}.quests[${questIndex}]`, ids, questIds));
  });

  value.chapters.forEach((chapter, chapterIndex) => {
    if (!isRecord(chapter) || !Array.isArray(chapter.quests)) return;
    chapter.quests.forEach((quest, questIndex) => {
      if (!isRecord(quest) || !Array.isArray(quest.dependencies)) return;
      quest.dependencies.forEach((dependency, dependencyIndex) => {
        const path = `chapters[${chapterIndex}].quests[${questIndex}].dependencies[${dependencyIndex}]`;
        if (typeof dependency !== 'string' || !ID_PATTERN.test(dependency)) {
          errors.push(`${path}: must be a 16-character quest ID`);
        } else if (dependency === quest.id) {
          errors.push(`${path}: a quest cannot depend on itself`);
        } else if (!questIds.has(dependency)) {
          errors.push(`${path}: does not reference an existing quest`);
        }
      });
    });
  });
  return errors;
}

export function parseProjectJson(text: string): ParseProjectResult {
  if (text.length > MAX_IMPORT_CHARACTERS) {
    return { ok: false, errors: ['file: exceeds the 1 MB import limit'] };
  }
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return { ok: false, errors: ['file: is not valid JSON'] };
  }
  const errors = validateProject(value);
  return errors.length > 0
    ? { ok: false, errors }
    : { ok: true, project: value as QuestProject };
}

export function collectIds(project: QuestProject): Set<string> {
  const ids = new Set<string>();
  project.chapters.forEach((chapter) => {
    ids.add(chapter.id);
    chapter.quests.forEach((quest) => {
      ids.add(quest.id);
      quest.tasks.forEach((task) => ids.add(task.id));
      quest.rewards.forEach((reward) => ids.add(reward.id));
    });
  });
  return ids;
}
