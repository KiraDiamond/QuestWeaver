import { useEffect, useRef } from 'react';

interface ProjectDialogProps {
  mode: 'ai' | 'import-errors';
  prompt: string;
  errors: string[];
  onClose: () => void;
  onNotice: (notice: string) => void;
}

export function ProjectDialog({ mode, prompt, errors, onClose, onNotice }: ProjectDialogProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt);
      onNotice('AI prompt copied');
      onClose();
    } catch {
      textareaRef.current?.select();
      onNotice('Select and copy the prompt manually');
    }
  }

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="dialog-card" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <div className="dialog-heading">
          <div>
            <span className="eyebrow">{mode === 'ai' ? 'Model handoff' : 'Validation'}</span>
            <h2 id="dialog-title">{mode === 'ai' ? 'Build with any AI' : 'This JSON needs attention'}</h2>
          </div>
          <button className="icon-button" type="button" aria-label="Close dialog" onClick={onClose}>×</button>
        </div>
        {mode === 'ai' ? (
          <>
            <p>Copy this into Gemini, GPT, or another model. Paste its JSON response back with Import JSON.</p>
            <label className="field">
              <span>AI prompt</span>
              <textarea ref={textareaRef} className="prompt-area" value={prompt} readOnly rows={14} autoFocus />
            </label>
            <div className="dialog-links">
              <a href="questweaver.schema.json" target="_blank" rel="noreferrer">Open JSON Schema</a>
              <a href="questweaver.example.json" target="_blank" rel="noreferrer">Open example project</a>
            </div>
            <button className="button button-primary button-wide" type="button" onClick={() => void copyPrompt()}>
              Copy prompt
            </button>
          </>
        ) : (
          <>
            <p>The current book was not changed. Fix these fields and try again:</p>
            <ul className="error-list">
              {errors.slice(0, 30).map((error) => <li key={error}>{error}</li>)}
            </ul>
            <button className="button button-primary button-wide" type="button" onClick={onClose}>Back to editor</button>
          </>
        )}
      </section>
    </div>
  );
}
