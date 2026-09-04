import { useMemo, useRef, useState } from 'react';
import { ChapterSidebar } from './components/ChapterSidebar';
import { ProjectDialog } from './components/ProjectDialog';
import { QuestCanvas } from './components/QuestCanvas';
import { QuestInspector } from './components/QuestInspector';
import { createQuestBookZip } from './export/ftb';
import {
  addChapter,
  addQuest,
  deleteChapter,
  deleteQuest,
  duplicateQuest,
  toggleDependency,
  updateChapter,
  updateQuest,
} from './model/editor';
import { buildAiPrompt } from './model/prompt';
import {
  createProject,
  MAX_IMPORT_CHARACTERS,
  parseProjectJson,
  validateProject,
  type QuestProject,
} from './model/project';

function download(name: string, data: Blob): void {
  const url = URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function App() {
  const initialProject = useMemo(() => createProject(), []);
  const [project, setProject] = useState<QuestProject>(initialProject);
  const [selectedChapterId, setSelectedChapterId] = useState(initialProject.chapters[0]!.id);
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<'ai' | 'import-errors' | null>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState('Ready');
  const importRef = useRef<HTMLInputElement>(null);

  const chapter =
    project.chapters.find((candidate) => candidate.id === selectedChapterId) ?? project.chapters[0]!;
  const quest = chapter.quests.find((candidate) => candidate.id === selectedQuestId) ?? null;
  const validationErrors = validateProject(project);

  function handleAddChapter() {
    const next = addChapter(project);
    const added = next.chapters.at(-1)!;
    setProject(next);
    setSelectedChapterId(added.id);
    setSelectedQuestId(null);
    setNotice(`Added chapter “${added.title}”`);
  }

  function handleDeleteChapter() {
    if (project.chapters.length <= 1) {
      setNotice('A quest book needs at least one chapter');
      return;
    }
    if (!window.confirm(`Delete “${chapter.title}” and all of its quests?`)) return;
    const next = deleteChapter(project, chapter.id);
    setProject(next);
    setSelectedChapterId(next.chapters[0]!.id);
    setSelectedQuestId(null);
    setNotice('Chapter deleted');
  }

  function handleAddQuest() {
    const next = addQuest(project, chapter.id);
    const added = next.chapters.find((candidate) => candidate.id === chapter.id)!.quests.at(-1)!;
    setProject(next);
    setSelectedQuestId(added.id);
    setNotice('Added a new quest');
  }

  async function handleImport(file: File | undefined) {
    if (!file) return;
    if (file.size > MAX_IMPORT_CHARACTERS) {
      setImportErrors(['file: exceeds the 1 MB import limit']);
      setDialog('import-errors');
      setNotice('Import rejected');
      if (importRef.current) importRef.current.value = '';
      return;
    }
    const text = await file.text();
    const result = parseProjectJson(text);
    if (!result.ok) {
      setImportErrors(result.errors);
      setDialog('import-errors');
      setNotice('Import rejected');
    } else {
      setProject(result.project);
      setSelectedChapterId(result.project.chapters[0]!.id);
      setSelectedQuestId(null);
      setNotice(`Imported “${result.project.title}”`);
    }
    if (importRef.current) importRef.current.value = '';
  }

  function handleDownloadProject() {
    download(
      'questweaver-project.json',
      new Blob([`${JSON.stringify(project, null, 2)}\n`], { type: 'application/json' }),
    );
    setNotice('Downloaded QuestWeaver project');
  }

  async function handleDownloadFtb() {
    if (validationErrors.length > 0) {
      setImportErrors(validationErrors);
      setDialog('import-errors');
      setNotice('Fix validation errors before exporting');
      return;
    }
    download('questweaver-ftbquests.zip', await createQuestBookZip(project));
    setNotice('Downloaded FTB Quests ZIP');
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand" aria-label="QuestWeaver">
          <span className="brand-mark" aria-hidden="true">QW</span>
          <span>
            <strong>QuestWeaver</strong>
            <small>FTB Quests builder</small>
          </span>
        </div>
        <div className="topbar-actions">
          <button className="button button-quiet" type="button" onClick={() => setDialog('ai')}>Ask AI</button>
          <label className="button button-quiet" htmlFor="import-project">Import JSON</label>
          <input
            ref={importRef}
            id="import-project"
            className="sr-only"
            type="file"
            accept="application/json,.json"
            aria-label="Import QuestWeaver JSON"
            onChange={(event) => void handleImport(event.currentTarget.files?.[0])}
          />
          <button className="button button-quiet" type="button" onClick={handleDownloadProject}>Save JSON</button>
          <button className="button button-primary" type="button" onClick={() => void handleDownloadFtb()}>
            Export FTB ZIP
          </button>
        </div>
      </header>

      <section className="bookbar" aria-labelledby="book-title">
        <div>
          <span className="eyebrow">Quest book</span>
          <h1 id="book-title">{project.title}</h1>
        </div>
        <label className="compact-field">
          <span>Book title</span>
          <input
            value={project.title}
            maxLength={120}
            onChange={(event) => setProject({ ...project, title: event.target.value })}
          />
        </label>
        <div className="book-stats" aria-label="Book summary">
          <span><strong>{project.chapters.length}</strong> chapters</span>
          <span><strong>{project.chapters.reduce((sum, item) => sum + item.quests.length, 0)}</strong> quests</span>
          <span className={validationErrors.length > 0 ? 'status-bad' : 'status-good'}>
            {validationErrors.length > 0 ? `${validationErrors.length} issues` : 'Ready to export'}
          </span>
        </div>
      </section>

      <main className="workspace">
        <ChapterSidebar
          chapters={project.chapters}
          selectedId={chapter.id}
          onSelect={(id) => {
            setSelectedChapterId(id);
            setSelectedQuestId(null);
          }}
          onAdd={handleAddChapter}
        />

        <section className="canvas-panel" aria-labelledby="chapter-heading">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Chapter canvas</span>
              <h2 id="chapter-heading">{chapter.title}</h2>
            </div>
            <button className="button button-primary" type="button" onClick={handleAddQuest}>Add quest</button>
          </div>
          <QuestCanvas
            chapter={chapter}
            selectedQuestId={selectedQuestId}
            onSelect={setSelectedQuestId}
            onCreate={handleAddQuest}
            onMove={(questId, x, y) => setProject(updateQuest(project, questId, { x, y }))}
          />
        </section>

        <QuestInspector
          project={project}
          chapter={chapter}
          quest={quest}
          onProjectChange={setProject}
          onChapterChange={(updates) => setProject(updateChapter(project, chapter.id, updates))}
          onQuestChange={(updates) => {
            if (quest) setProject(updateQuest(project, quest.id, updates));
          }}
          onToggleDependency={(dependencyId) => {
            if (quest) setProject(toggleDependency(project, quest.id, dependencyId));
          }}
          onDuplicateQuest={() => {
            if (!quest) return;
            const next = duplicateQuest(project, quest.id);
            setProject(next);
            setSelectedQuestId(next.chapters.find((item) => item.id === chapter.id)!.quests.at(-1)!.id);
            setNotice('Quest duplicated');
          }}
          onDeleteQuest={() => {
            if (!quest || !window.confirm(`Delete “${quest.title}”?`)) return;
            setProject(deleteQuest(project, quest.id));
            setSelectedQuestId(null);
            setNotice('Quest deleted');
          }}
          onDeleteChapter={handleDeleteChapter}
        />
      </main>

      <footer className="statusbar">
        <span aria-live="polite">{notice}</span>
        <span>QuestWeaver schema v1 · FTB file format 13</span>
      </footer>

      {dialog && (
        <ProjectDialog
          mode={dialog}
          prompt={buildAiPrompt(project)}
          errors={importErrors}
          onClose={() => setDialog(null)}
          onNotice={setNotice}
        />
      )}
    </div>
  );
}
