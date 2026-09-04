import type { Chapter } from '../model/project';

interface ChapterSidebarProps {
  chapters: Chapter[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
}

export function ChapterSidebar({ chapters, selectedId, onSelect, onAdd }: ChapterSidebarProps) {
  return (
    <nav className="chapter-sidebar" aria-labelledby="chapters-heading">
      <div className="sidebar-heading">
        <h2 id="chapters-heading">Chapters</h2>
        <button className="icon-button" type="button" aria-label="Add chapter" onClick={onAdd}>+</button>
      </div>
      <ol className="chapter-list">
        {chapters.map((chapter, index) => (
          <li key={chapter.id}>
            <button
              className={`chapter-button ${chapter.id === selectedId ? 'selected' : ''}`}
              type="button"
              aria-current={chapter.id === selectedId ? 'page' : undefined}
              onClick={() => onSelect(chapter.id)}
            >
              <span className="chapter-number">{String(index + 1).padStart(2, '0')}</span>
              <span>
                <strong>{chapter.title}</strong>
                <small>{chapter.quests.length} {chapter.quests.length === 1 ? 'quest' : 'quests'}</small>
              </span>
            </button>
          </li>
        ))}
      </ol>
      <button className="button button-wide" type="button" onClick={onAdd}>New chapter</button>
      <div className="sidebar-note">
        <strong>AI-ready</strong>
        <p>Use Ask AI to hand this book to Gemini, GPT, or another model.</p>
        <a href="ai-guide.txt" target="_blank" rel="noreferrer">Open the text-only AI guide</a>
      </div>
    </nav>
  );
}
