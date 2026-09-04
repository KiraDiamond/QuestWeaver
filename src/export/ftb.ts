import JSZip from 'jszip';
import type { Chapter, Quest, QuestProject, QuestReward, QuestTask } from '../model/project';
import { validateProject } from '../model/project';

export interface ExportFile {
  path: string;
  contents: string;
}

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

const ROOT = 'config/ftbquests/quests';

function serialize(value: JsonValue): string {
  return `${JSON.stringify(value, null, '\t')}\n`;
}

function itemStack(id: string): { id: string } {
  return { id };
}

function exportTask(task: QuestTask): JsonValue {
  if (task.type === 'checkmark') return { id: task.id, type: task.type };
  return {
    id: task.id,
    type: task.type,
    item: itemStack(task.item),
    count: task.count,
    consume_items: task.consumeItems,
  };
}

function exportReward(reward: QuestReward): JsonValue {
  if (reward.type === 'xp') return { id: reward.id, type: reward.type, xp: reward.xp };
  return {
    id: reward.id,
    type: reward.type,
    item: itemStack(reward.item),
    count: reward.count,
  };
}

function exportQuest(quest: Quest): JsonValue {
  const result: { [key: string]: JsonValue } = {
    icon: itemStack(quest.icon),
    x: quest.x,
    y: quest.y,
    shape: quest.shape,
    size: quest.size,
    id: quest.id,
    tasks: quest.tasks.map(exportTask),
    rewards: quest.rewards.map(exportReward),
  };
  if (quest.dependencies.length > 0) result.dependencies = quest.dependencies;
  return result;
}

function exportChapter(chapter: Chapter, orderIndex: number): JsonValue {
  return {
    id: chapter.id,
    group: '',
    order_index: orderIndex,
    icon: itemStack(chapter.icon),
    filename: chapter.filename,
    default_quest_shape: '',
    default_hide_dependency_lines: false,
    quests: chapter.quests.map(exportQuest),
    quest_links: [],
    images: [],
  };
}

function exportChapterLanguage(chapter: Chapter): JsonValue {
  const translations: { [key: string]: JsonValue } = {
    [`chapter.${chapter.id}.title`]: chapter.title,
  };
  if (chapter.subtitle.length > 0) {
    translations[`chapter.${chapter.id}.chapter_subtitle`] = chapter.subtitle;
  }
  chapter.quests.forEach((quest) => {
    translations[`quest.${quest.id}.title`] = quest.title;
    if (quest.subtitle) translations[`quest.${quest.id}.quest_subtitle`] = quest.subtitle;
    if (quest.description.length > 0) translations[`quest.${quest.id}.quest_desc`] = quest.description;
  });
  return translations;
}

function exportData(): JsonValue {
  return {
    version: 13,
    default_reward_team: false,
    default_consume_items: false,
    default_autoclaim_rewards: 'disabled',
    default_quest_shape: 'circle',
    default_quest_disable_jei: false,
    emergency_items_cooldown: 300,
    drop_loot_crates: false,
    loot_crate_no_drop: { passive: 4000, monster: 600, boss: 0 },
    disable_gui: false,
    grid_scale: 0.5,
    pause_game: false,
    lock_message: '',
    progression_mode: 'linear',
    detection_delay: 20,
    show_lock_icons: false,
    drop_book_on_death: false,
    hide_excluded_quests: false,
    fallback_locale: 'en_us',
    verify_on_load: false,
  };
}

export function exportProjectFiles(project: QuestProject): ExportFile[] {
  const errors = validateProject(project);
  if (errors.length > 0) throw new Error(`Quest project is invalid: ${errors.join('; ')}`);

  const files: ExportFile[] = [
    { path: `${ROOT}/data.snbt`, contents: serialize(exportData()) },
    {
      path: `${ROOT}/chapter_groups.snbt`,
      contents: serialize({ chapter_groups: [] }),
    },
  ];

  project.chapters.forEach((chapter, index) => {
    files.push({
      path: `${ROOT}/chapters/${chapter.filename}.snbt`,
      contents: serialize(exportChapter(chapter, index)),
    });
  });
  files.push({
    path: `${ROOT}/lang/en_us/file.snbt`,
    contents: serialize({ 'file.0000000000000001.title': project.title }),
  });
  project.chapters.forEach((chapter) => {
    files.push({
      path: `${ROOT}/lang/en_us/chapters/${chapter.filename}.snbt`,
      contents: serialize(exportChapterLanguage(chapter)),
    });
  });
  return files;
}

export async function createQuestBookZip(project: QuestProject): Promise<Blob> {
  const zip = new JSZip();
  exportProjectFiles(project).forEach((file) => zip.file(file.path, file.contents));
  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
}
