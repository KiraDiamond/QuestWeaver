import type { Chapter, Quest, QuestProject } from '../model/project';
import { TaskRewardEditor } from './TaskRewardEditor';

interface QuestInspectorProps {
  project: QuestProject;
  chapter: Chapter;
  quest: Quest | null;
  onProjectChange: (project: QuestProject) => void;
  onChapterChange: (updates: Partial<Omit<Chapter, 'id' | 'quests'>>) => void;
  onQuestChange: (updates: Partial<Omit<Quest, 'id'>>) => void;
  onToggleDependency: (id: string) => void;
  onDuplicateQuest: () => void;
  onDeleteQuest: () => void;
  onDeleteChapter: () => void;
}

export function QuestInspector(props: QuestInspectorProps) {
  const { project, chapter, quest, onChapterChange, onQuestChange } = props;
  const allQuests = project.chapters.flatMap((item) => item.quests);

  if (!quest) {
    return (
      <aside className="inspector" aria-labelledby="inspector-heading">
        <div className="inspector-heading">
          <div>
            <span className="eyebrow">Selected chapter</span>
            <h2 id="inspector-heading">Chapter settings</h2>
          </div>
        </div>
        <div className="inspector-scroll">
          <label className="field">
            <span>Chapter title</span>
            <input value={chapter.title} maxLength={120} onChange={(event) => onChapterChange({ title: event.target.value })} />
          </label>
          <label className="field">
            <span>File name</span>
            <input value={chapter.filename} maxLength={64} onChange={(event) => onChapterChange({ filename: event.target.value })} />
            <small>Lowercase letters, numbers, underscores, and hyphens.</small>
          </label>
          <label className="field">
            <span>Icon item</span>
            <input value={chapter.icon} onChange={(event) => onChapterChange({ icon: event.target.value })} placeholder="minecraft:book" />
          </label>
          <label className="field">
            <span>Subtitle lines</span>
            <textarea
              value={chapter.subtitle.join('\n')}
              rows={4}
              onChange={(event) => onChapterChange({ subtitle: event.target.value.split('\n') })}
            />
          </label>
          <div className="hint-box">
            <strong>Start weaving</strong>
            <p>Add a quest above the canvas, select it, and edit its tasks and rewards here.</p>
          </div>
          <button className="button button-danger button-wide" type="button" onClick={props.onDeleteChapter}>Delete chapter</button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="inspector" aria-labelledby="inspector-heading">
      <div className="inspector-heading">
        <div>
          <span className="eyebrow">Selected quest</span>
          <h2 id="inspector-heading">Quest details</h2>
        </div>
        <span className="id-chip" title={quest.id}>{quest.id.slice(-6)}</span>
      </div>
      <div className="inspector-scroll">
        <label className="field">
          <span>Quest title</span>
          <input value={quest.title} maxLength={120} onChange={(event) => onQuestChange({ title: event.target.value })} />
        </label>
        <label className="field">
          <span>Subtitle</span>
          <input value={quest.subtitle} maxLength={240} onChange={(event) => onQuestChange({ subtitle: event.target.value })} />
        </label>
        <label className="field">
          <span>Description</span>
          <textarea
            value={quest.description.join('\n')}
            rows={5}
            onChange={(event) => onQuestChange({ description: event.target.value.split('\n') })}
          />
          <small>Each line becomes one FTB description line.</small>
        </label>
        <div className="field-row">
          <label className="field">
            <span>Icon item</span>
            <input value={quest.icon} onChange={(event) => onQuestChange({ icon: event.target.value })} />
          </label>
          <label className="field field-small">
            <span>Size</span>
            <input type="number" min="0.25" max="4" step="0.25" value={quest.size} onChange={(event) => onQuestChange({ size: event.target.valueAsNumber })} />
          </label>
        </div>
        <div className="field-row">
          <label className="field">
            <span>Shape</span>
            <select value={quest.shape} onChange={(event) => onQuestChange({ shape: event.target.value as Quest['shape'] })}>
              {['circle', 'square', 'diamond', 'rsquare', 'pentagon', 'hexagon', 'octagon', 'heart', 'gear'].map((shape) => (
                <option key={shape} value={shape}>{shape}</option>
              ))}
            </select>
          </label>
          <label className="field field-small">
            <span>X</span>
            <input type="number" step="0.25" value={quest.x} onChange={(event) => onQuestChange({ x: event.target.valueAsNumber })} />
          </label>
          <label className="field field-small">
            <span>Y</span>
            <input type="number" step="0.25" value={quest.y} onChange={(event) => onQuestChange({ y: event.target.valueAsNumber })} />
          </label>
        </div>

        <section className="inspector-section" aria-labelledby="dependencies-heading">
          <div className="section-title"><h3 id="dependencies-heading">Dependencies</h3><span>{quest.dependencies.length}</span></div>
          {allQuests.filter((item) => item.id !== quest.id).length === 0 ? (
            <p className="muted">Add another quest to create a dependency.</p>
          ) : (
            <div className="check-list">
              {allQuests.filter((item) => item.id !== quest.id).map((candidate) => (
                <label key={candidate.id}>
                  <input
                    type="checkbox"
                    checked={quest.dependencies.includes(candidate.id)}
                    onChange={() => props.onToggleDependency(candidate.id)}
                  />
                  <span>{candidate.title}</span>
                </label>
              ))}
            </div>
          )}
        </section>

        <TaskRewardEditor project={project} quest={quest} onProjectChange={props.onProjectChange} />

        <div className="danger-row">
          <button className="button" type="button" onClick={props.onDuplicateQuest}>Duplicate</button>
          <button className="button button-danger" type="button" onClick={props.onDeleteQuest}>Delete quest</button>
        </div>
      </div>
    </aside>
  );
}
