import type { QuestProject } from './project';

export function buildAiPrompt(project: QuestProject): string {
  const schemaUrl = new URL('questweaver.schema.json', window.location.href).href;
  return `You are helping me edit an FTB Quests book through QuestWeaver.

Return only one valid JSON object. Do not wrap it in Markdown. Preserve every existing object ID. Generate any new IDs as unique 16-character uppercase hexadecimal strings. Follow the schema exactly:
${schemaUrl}

Supported quest task types: item, checkmark.
Supported reward types: item, xp.
Use Minecraft resource IDs such as minecraft:stone. Quest dependencies must reference existing quest IDs.

Here is the current QuestWeaver project:
${JSON.stringify(project, null, 2)}
`;
}
