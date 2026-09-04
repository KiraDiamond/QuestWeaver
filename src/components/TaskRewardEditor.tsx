import {
  addReward,
  addTask,
  deleteReward,
  deleteTask,
  updateReward,
  updateTask,
} from '../model/editor';
import type { Quest, QuestProject } from '../model/project';

interface TaskRewardEditorProps {
  project: QuestProject;
  quest: Quest;
  onProjectChange: (project: QuestProject) => void;
}

export function TaskRewardEditor({ project, quest, onProjectChange }: TaskRewardEditorProps) {
  return (
    <>
      <section className="inspector-section" aria-labelledby="tasks-heading">
        <div className="section-title"><h3 id="tasks-heading">Tasks</h3><span>{quest.tasks.length}</span></div>
        <div className="item-stack">
          {quest.tasks.map((task, index) => (
            <article className="mini-card" key={task.id}>
              <div className="mini-card-heading">
                <strong>{index + 1}. {task.type === 'item' ? 'Item task' : 'Checkmark task'}</strong>
                <button
                  className="text-button danger-text"
                  type="button"
                  aria-label={`Delete task ${index + 1}`}
                  onClick={() => onProjectChange(deleteTask(project, quest.id, task.id))}
                >Delete</button>
              </div>
              {task.type === 'item' && (
                <>
                  <label className="field">
                    <span>Item ID</span>
                    <input value={task.item} onChange={(event) => onProjectChange(updateTask(project, quest.id, task.id, { item: event.target.value }))} />
                  </label>
                  <div className="field-row">
                    <label className="field field-small">
                      <span>Count</span>
                      <input type="number" min="1" step="1" value={task.count} onChange={(event) => onProjectChange(updateTask(project, quest.id, task.id, { count: event.target.valueAsNumber }))} />
                    </label>
                    <label className="check-field">
                      <input type="checkbox" checked={task.consumeItems} onChange={(event) => onProjectChange(updateTask(project, quest.id, task.id, { consumeItems: event.target.checked }))} />
                      <span>Consume items</span>
                    </label>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
        <div className="add-row">
          <button className="button button-small" type="button" onClick={() => onProjectChange(addTask(project, quest.id, 'item'))}>+ Item</button>
          <button className="button button-small" type="button" onClick={() => onProjectChange(addTask(project, quest.id, 'checkmark'))}>+ Checkmark</button>
        </div>
      </section>

      <section className="inspector-section" aria-labelledby="rewards-heading">
        <div className="section-title"><h3 id="rewards-heading">Rewards</h3><span>{quest.rewards.length}</span></div>
        <div className="item-stack">
          {quest.rewards.length === 0 && <p className="muted">No rewards yet.</p>}
          {quest.rewards.map((reward, index) => (
            <article className="mini-card" key={reward.id}>
              <div className="mini-card-heading">
                <strong>{index + 1}. {reward.type === 'item' ? 'Item reward' : 'XP reward'}</strong>
                <button
                  className="text-button danger-text"
                  type="button"
                  aria-label={`Delete reward ${index + 1}`}
                  onClick={() => onProjectChange(deleteReward(project, quest.id, reward.id))}
                >Delete</button>
              </div>
              {reward.type === 'item' ? (
                <div className="field-row">
                  <label className="field">
                    <span>Item ID</span>
                    <input value={reward.item} onChange={(event) => onProjectChange(updateReward(project, quest.id, reward.id, { item: event.target.value }))} />
                  </label>
                  <label className="field field-small">
                    <span>Count</span>
                    <input type="number" min="1" max="64" value={reward.count} onChange={(event) => onProjectChange(updateReward(project, quest.id, reward.id, { count: event.target.valueAsNumber }))} />
                  </label>
                </div>
              ) : (
                <label className="field">
                  <span>Experience points</span>
                  <input type="number" min="1" value={reward.xp} onChange={(event) => onProjectChange(updateReward(project, quest.id, reward.id, { xp: event.target.valueAsNumber }))} />
                </label>
              )}
            </article>
          ))}
        </div>
        <div className="add-row">
          <button className="button button-small" type="button" onClick={() => onProjectChange(addReward(project, quest.id, 'item'))}>+ Item</button>
          <button className="button button-small" type="button" onClick={() => onProjectChange(addReward(project, quest.id, 'xp'))}>+ XP</button>
        </div>
      </section>
    </>
  );
}
