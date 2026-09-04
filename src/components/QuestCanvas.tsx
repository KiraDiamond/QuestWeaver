import { useRef, type CSSProperties, type PointerEvent } from 'react';
import type { Chapter, Quest } from '../model/project';

interface QuestCanvasProps {
  chapter: Chapter;
  selectedQuestId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onMove: (id: string, x: number, y: number) => void;
}

const WIDTH = 1600;
const HEIGHT = 1000;
const GRID = 80;
const NODE = 72;
const ORIGIN_X = 360;
const ORIGIN_Y = 240;

function nodePosition(quest: Quest) {
  return { left: ORIGIN_X + quest.x * GRID - NODE / 2, top: ORIGIN_Y + quest.y * GRID - NODE / 2 };
}

export function QuestCanvas({ chapter, selectedQuestId, onSelect, onCreate, onMove }: QuestCanvasProps) {
  const drag = useRef<{ id: string; clientX: number; clientY: number; x: number; y: number } | null>(null);
  const questsById = new Map(chapter.quests.map((quest) => [quest.id, quest]));

  const hasQuests = chapter.quests.length > 0;

  function startDrag(event: PointerEvent<HTMLButtonElement>, quest: Quest) {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { id: quest.id, clientX: event.clientX, clientY: event.clientY, x: quest.x, y: quest.y };
    onSelect(quest.id);
  }

  function moveDrag(event: PointerEvent<HTMLButtonElement>) {
    if (!drag.current || drag.current.id !== event.currentTarget.dataset.questId) return;
    const x = Math.round((drag.current.x + (event.clientX - drag.current.clientX) / GRID) * 4) / 4;
    const y = Math.round((drag.current.y + (event.clientY - drag.current.clientY) / GRID) * 4) / 4;
    onMove(drag.current.id, x, y);
  }

  return (
    <div className="canvas-scroll" aria-label={`${chapter.title} quest layout`}>
      <div className={`quest-canvas ${hasQuests ? '' : 'is-empty'}`}>
        {!hasQuests ? (
          <div className="canvas-empty">
            <span className="empty-rune" aria-hidden="true">✦</span>
            <h3>This chapter is a blank page</h3>
            <p>Add a quest, then drag it into place.</p>
            <button className="button button-primary" type="button" onClick={onCreate}>Create first quest</button>
          </div>
        ) : (
          <>
            <svg className="dependency-lines" width={WIDTH} height={HEIGHT} aria-hidden="true">
              {chapter.quests.flatMap((quest) =>
                quest.dependencies.map((dependencyId) => {
                  const dependency = questsById.get(dependencyId);
                  if (!dependency) return null;
                  const from = nodePosition(dependency);
                  const to = nodePosition(quest);
                  return (
                    <line
                      key={`${quest.id}-${dependencyId}`}
                      x1={from.left + NODE / 2}
                      y1={from.top + NODE / 2}
                      x2={to.left + NODE / 2}
                      y2={to.top + NODE / 2}
                    />
                  );
                }),
              )}
            </svg>
            {chapter.quests.map((quest) => {
              const position = nodePosition(quest);
              return (
                <button
                  key={quest.id}
                  className={`quest-node shape-${quest.shape} ${selectedQuestId === quest.id ? 'selected' : ''}`}
                  style={{ left: position.left, top: position.top, '--quest-scale': quest.size } as CSSProperties}
                  type="button"
                  data-quest-id={quest.id}
                  aria-label={`${quest.title}, quest node`}
                  onClick={() => onSelect(quest.id)}
                  onPointerDown={(event) => startDrag(event, quest)}
                  onPointerMove={moveDrag}
                  onPointerUp={() => { drag.current = null; }}
                  onPointerCancel={() => { drag.current = null; }}
                >
                  <span className="quest-icon" aria-hidden="true">{quest.icon.split(':')[1]?.slice(0, 2).toUpperCase()}</span>
                  <span className="quest-node-title">{quest.title}</span>
                </button>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
