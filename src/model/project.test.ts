import { describe, expect, it } from 'vitest';
import {
  createProject,
  makeId,
  parseProjectJson,
  validateProject,
} from './project';

describe('QuestWeaver project contract', () => {
  it('creates a valid starter project with stable FTB format metadata', () => {
    const project = createProject();

    expect(project.schemaVersion).toBe(1);
    expect(project.ftbFormat).toBe(13);
    expect(project.chapters).toHaveLength(1);
    expect(validateProject(project)).toEqual([]);
  });

  it('generates 16-character uppercase hexadecimal IDs', () => {
    expect(makeId()).toMatch(/^[0-9A-F]{16}$/);
  });

  it('round-trips a valid project from JSON', () => {
    const project = createProject();
    const result = parseProjectJson(JSON.stringify(project));

    expect(result).toEqual({ ok: true, project });
  });

  it('rejects malformed model output with actionable paths', () => {
    const input = JSON.stringify({
      schemaVersion: 1,
      ftbFormat: 13,
      title: '',
      chapters: [{ id: 'not-hex', title: 'Start', quests: [] }],
    });
    const result = parseProjectJson(input);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContain('title: must not be empty');
      expect(result.errors).toContain('chapters[0].id: must be 16 uppercase hexadecimal characters');
    }
  });

  it('rejects imports larger than one megabyte before parsing', () => {
    const result = parseProjectJson(' '.repeat(1_000_001));

    expect(result).toEqual({
      ok: false,
      errors: ['file: exceeds the 1 MB import limit'],
    });
  });

  it('rejects duplicate chapter filenames that would overwrite exported files', () => {
    const project = createProject();
    const duplicate = {
      ...project.chapters[0]!,
      id: 'A000000000000002',
      quests: [],
    };

    expect(validateProject({ ...project, chapters: [...project.chapters, duplicate] })).toContain(
      'chapters[1].filename: duplicates another chapter filename',
    );
  });

  it('rejects unsupported fields from model output instead of silently discarding them', () => {
    const project = createProject();
    const result = parseProjectJson(JSON.stringify({ ...project, surprise: 'execute me' }));

    expect(result).toEqual({ ok: false, errors: ['surprise: is not a supported field'] });
  });
});
