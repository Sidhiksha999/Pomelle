import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addCornell, deleteCornell, updateCornell } from '../../../store/methodsSlice';
import Icon from '../../../components/Icon';
import MethodTimer from '../MethodTimer';

const PHASES = [
  { id: 'notes', label: '1 · Take notes', minutes: 25, tip: 'Write in the big right column while you read or listen. Short phrases, not full sentences.' },
  { id: 'cues', label: '2 · Write cues', minutes: 10, tip: 'In the left column, write a question or keyword for each chunk of notes.' },
  { id: 'summary', label: '3 · Summarise', minutes: 5, tip: 'At the bottom, sum the whole page up in two or three sentences.' },
  { id: 'quiz', label: '4 · Quiz yourself', minutes: 10, tip: 'Your notes are covered. Answer each cue out loud, then peek to check.' },
];

/** Cornell notes: a three-part page (cues, notes, summary) that turns into a self-quiz. */
export default function CornellGuide() {
  const dispatch = useDispatch();
  const pages = useSelector((s) => s.methods.cornell);
  const [pageId, setPageId] = useState(pages[0]?.id ?? null);
  const [title, setTitle] = useState('');
  const [phase, setPhase] = useState('notes');
  const [peek, setPeek] = useState(false);
  const page = pages.find((p) => p.id === pageId);
  const current = PHASES.find((p) => p.id === phase);
  const edit = (changes) => dispatch(updateCornell({ id: page.id, changes }));

  const create = (event) => {
    event.preventDefault();
    if (!title.trim()) return;
    const action = addCornell(title.trim());
    dispatch(action);
    setPageId(action.payload.id);
    setTitle('');
    setPhase('notes');
  };

  const notesHidden = phase === 'quiz' && !peek;

  return (
    <div className="guide guide--cornell">
      <form className="guide__inline-form" onSubmit={create}>
        <label className="visually-hidden" htmlFor="cornell-title">
          New page title
        </label>
        <input
          id="cornell-title"
          className="input"
          maxLength={80}
          placeholder="Lecture or chapter title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <button type="submit" className="btn btn--small btn--primary" disabled={!title.trim()}>
          <Icon name="plus" /> New page
        </button>
      </form>

      {pages.length > 0 && (
        <div className="field">
          <label className="field__label" htmlFor="cornell-pick">
            Page
          </label>
          <select id="cornell-pick" className="input" value={pageId ?? ''} onChange={(event) => setPageId(event.target.value)}>
            {pages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {page ? (
        <>
          <div className="guide__steps" role="group" aria-label="Steps">
            {PHASES.map((p) => (
              <button
                key={p.id}
                type="button"
                className="guide__step"
                aria-pressed={phase === p.id}
                onClick={() => {
                  setPhase(p.id);
                  setPeek(false);
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
          <p className="guide__tip">{current.tip}</p>
          <MethodTimer minutes={current.minutes} label={current.label} countsAsFocus />

          <div className={`cornell-sheet${notesHidden ? ' is-quiz' : ''}`}>
            <h3 className="cornell-sheet__title">{page.title}</h3>
            <div className="cornell-sheet__cues">
              <label className="field__label" htmlFor="cornell-cues">
                Cues & questions
              </label>
              <textarea id="cornell-cues" className="input" value={page.cues} onChange={(event) => edit({ cues: event.target.value })} />
            </div>
            <div className="cornell-sheet__notes">
              <label className="field__label" htmlFor="cornell-notes">
                Notes
              </label>
              {notesHidden ? (
                <div className="cornell-sheet__cover">
                  <p>Notes covered. Answer the cues first.</p>
                  <button type="button" className="btn btn--small" onClick={() => setPeek(true)}>
                    Peek at my notes
                  </button>
                </div>
              ) : (
                <textarea id="cornell-notes" className="input" value={page.notes} onChange={(event) => edit({ notes: event.target.value })} />
              )}
            </div>
            <div className="cornell-sheet__summary">
              <label className="field__label" htmlFor="cornell-summary">
                Summary
              </label>
              <textarea id="cornell-summary" className="input" rows={3} value={page.summary} onChange={(event) => edit({ summary: event.target.value })} />
            </div>
          </div>
          <button
            type="button"
            className="btn btn--small btn--quiet"
            onClick={() => {
              if (window.confirm(`Delete the page “${page.title}”?`)) {
                dispatch(deleteCornell(page.id));
                setPageId(pages.find((p) => p.id !== page.id)?.id ?? null);
              }
            }}
          >
            <Icon name="trash" /> Delete page
          </button>
        </>
      ) : (
        <p className="guide__note">Give your page a title above to start taking notes.</p>
      )}
    </div>
  );
}
