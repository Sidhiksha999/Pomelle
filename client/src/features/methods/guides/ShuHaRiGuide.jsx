import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addShuHaRiTopic, deleteShuHaRiTopic, updateShuHaRiTopic } from '../../../store/methodsSlice';
import Icon from '../../../components/Icon';
import MethodTimer from '../MethodTimer';

const STAGES = [
  {
    id: 'shu',
    kanji: '守',
    name: 'Shu: follow',
    prompt: 'Copy the method exactly as taught. Work through a worked example step by step, without changing anything.',
    ideas: ['Redo a textbook example by hand', 'Follow a tutorial line by line', 'Write out the standard steps from memory'],
    notePrompt: 'Which example did you follow? What were the exact steps?',
  },
  {
    id: 'ha',
    kanji: '破',
    name: 'Ha: break',
    prompt: 'Now bend the rules. Change the numbers, try another source’s approach, find where the method breaks.',
    ideas: ['Solve a variation with different values', 'Compare two textbooks’ explanations', 'Find an edge case where it fails'],
    notePrompt: 'What did you change? What surprised you?',
  },
  {
    id: 'ri',
    kanji: '離',
    name: 'Ri: go beyond',
    prompt: 'Make it yours. Create your own problem, combine it with another idea, or teach it your own way.',
    ideas: ['Write an original exam question', 'Explain it to a friend without notes', 'Use it in a mini-project'],
    notePrompt: 'What did you create? How would you teach it?',
  },
];

/** Shu-Ha-Ri: track each skill through follow → break → go beyond. */
export default function ShuHaRiGuide() {
  const dispatch = useDispatch();
  const topics = useSelector((s) => s.methods.shuhari);
  const [selectedId, setSelectedId] = useState(topics[0]?.id ?? null);
  const [name, setName] = useState('');
  const topic = topics.find((t) => t.id === selectedId);
  const stageIndex = topic ? STAGES.findIndex((s) => s.id === topic.stage) : 0;
  const stage = STAGES[stageIndex];

  const add = (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    const action = addShuHaRiTopic(name.trim());
    dispatch(action);
    setSelectedId(action.payload.id);
    setName('');
  };

  return (
    <div className="guide guide--shuhari">
      <form className="guide__inline-form" onSubmit={add}>
        <label className="visually-hidden" htmlFor="shuhari-topic">
          A skill to master
        </label>
        <input
          id="shuhari-topic"
          className="input"
          maxLength={60}
          placeholder="A skill to master, e.g. integration by parts"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <button type="submit" className="btn btn--small btn--primary" disabled={!name.trim()}>
          <Icon name="plus" /> Add skill
        </button>
      </form>

      {topics.length > 0 && (
        <ul className="shuhari-topics">
          {topics.map((t) => (
            <li key={t.id}>
              <button type="button" className="shuhari-topic" aria-pressed={t.id === selectedId} onClick={() => setSelectedId(t.id)}>
                {t.topic}
                <span className="shuhari-topic__stage">{STAGES.find((s) => s.id === t.stage).kanji}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {topic ? (
        <div className="shuhari-stage">
          <ol className="shuhari-path" aria-label="Stages">
            {STAGES.map((s, i) => (
              <li key={s.id} className={i < stageIndex ? 'is-past' : i === stageIndex ? 'is-current' : ''}>
                <button
                  type="button"
                  aria-current={i === stageIndex ? 'step' : undefined}
                  onClick={() => dispatch(updateShuHaRiTopic({ id: topic.id, stage: s.id }))}
                >
                  <span className="shuhari-path__kanji" aria-hidden="true">
                    {s.kanji}
                  </span>
                  {s.name}
                </button>
              </li>
            ))}
          </ol>

          <p className="guide__tip">{stage.prompt}</p>
          <ul className="guide__ideas">
            {stage.ideas.map((idea) => (
              <li key={idea}>{idea}</li>
            ))}
          </ul>

          <MethodTimer minutes={25} label={stage.name} countsAsFocus />

          <label className="field__label" htmlFor="shuhari-note">
            {stage.notePrompt}
          </label>
          <textarea
            id="shuhari-note"
            className="input"
            rows={4}
            value={topic.notes[stage.id]}
            onChange={(event) => dispatch(updateShuHaRiTopic({ id: topic.id, note: { stage: stage.id, text: event.target.value } }))}
          />

          <div className="guide__actions">
            {stageIndex < 2 && (
              <button
                type="button"
                className="btn btn--primary btn--small"
                onClick={() => dispatch(updateShuHaRiTopic({ id: topic.id, stage: STAGES[stageIndex + 1].id }))}
              >
                This feels easy now: move to {STAGES[stageIndex + 1].name.split(':')[0]}
              </button>
            )}
            <button
              type="button"
              className="btn btn--small btn--quiet"
              onClick={() => {
                if (window.confirm(`Remove “${topic.topic}”?`)) {
                  dispatch(deleteShuHaRiTopic(topic.id));
                  setSelectedId(topics.find((t) => t.id !== topic.id)?.id ?? null);
                }
              }}
            >
              <Icon name="trash" /> Remove skill
            </button>
          </div>
        </div>
      ) : (
        <p className="guide__note">Add a skill above to start at Shu.</p>
      )}
    </div>
  );
}
