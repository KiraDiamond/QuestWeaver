import { describe, expect, it } from 'vitest';
import indexHtml from '../index.html?raw';
import aiGuide from '../public/ai-guide.txt?raw';
import llmsText from '../public/llms.txt?raw';

describe('AI-readable static entry points', () => {
  it('advertises a plain-text guide without requiring JavaScript', () => {
    expect(indexHtml).toContain('AI models that cannot operate web interfaces');
    expect(indexHtml).toContain('/QuestWeaver/ai-guide.txt');
  });

  it('gives models a stable contract and a human handoff', () => {
    expect(aiGuide).toContain('https://kiradiamond.github.io/QuestWeaver/questweaver.schema.json');
    expect(aiGuide).toContain('https://kiradiamond.github.io/QuestWeaver/questweaver.example.json');
    expect(aiGuide).toContain('Return only one valid JSON object');
    expect(aiGuide).toContain('The human will import your JSON');
  });

  it('lists the AI guide in llms.txt', () => {
    expect(llmsText).toContain('https://kiradiamond.github.io/QuestWeaver/ai-guide.txt');
  });
});
