import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from './App';

afterEach(cleanup);

describe('QuestWeaver editor', () => {
  it('creates a quest and edits its title from the inspector', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Add quest' }));
    const title = screen.getByLabelText('Quest title');
    await user.clear(title);
    await user.type(title, 'Punch a tree');

    expect(screen.getByRole('button', { name: /Punch a tree/ }).textContent).toContain('Punch a tree');
  });

  it('keeps a valid project unchanged when an invalid JSON import is chosen', async () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText('Import QuestWeaver JSON'), {
      target: { files: [new File(['{"title":"bad"}'], 'bad.json', { type: 'application/json' })] },
    });

    expect(await screen.findByRole('heading', { name: 'This JSON needs attention' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'My Quest Book' })).toBeTruthy();
  });

  it('rejects an oversized import before reading it', async () => {
    const user = userEvent.setup();
    render(<App />);
    const file = new File([new Uint8Array(1_000_001)], 'huge.json', { type: 'application/json' });

    await user.upload(screen.getByLabelText('Import QuestWeaver JSON'), file);

    expect(await screen.findByRole('heading', { name: 'This JSON needs attention' })).toBeTruthy();
    expect(screen.getByText('file: exceeds the 1 MB import limit')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'My Quest Book' })).toBeTruthy();
  });

  it('opens an AI handoff containing the schema and current project', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Ask AI' }));

    const prompt = screen.getByLabelText('AI prompt') as HTMLTextAreaElement;
    expect(prompt.value).toContain('questweaver.schema.json');
    expect(prompt.value).toContain('"schemaVersion": 1');

    await user.keyboard('{Escape}');
    expect(screen.queryByLabelText('AI prompt')).toBeNull();
  });
});
