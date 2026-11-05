import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearFeynmanError, deleteFeynman, reviewExplanation } from '../../../store/methodsSlice';
import { useCurrentTheme } from '../../../components/hooks/useCurrentTheme';
import Icon from '../../../components/Icon';
import { CoachError, CoachSkeleton } from '../../coach/CoachNotice';
import MethodTimer from '../MethodTimer';

const AUDIENCES = [
  { id: 'child', label: 'a 12-year-old' },
  { id: 'classmate', label: 'a classmate who missed class' },
  { id: 'beginner', label: 'a complete beginner' },
];

function ScoreBar({ label, value, max = 5 }) {
  return (
    <div className="score">
      <span className="score__label">{label}</span>
      <span className="score__track" role="img" aria-label={`${value} out of ${max}`}>
        <span style={{ width: `${(value / max) * 100}%` }} />
      </span>
      <span className="score__value">
        {value}/{max}
      </span>
    </div>
  );
}

function Review({ entry }) {
  const { review } = entry;
  return (
    <div className="feynman-review">
      <div className="feynman-review__top">
        <p className="feynman-review__overall">
          <strong>{review.overall}</strong>
          <span>/10</span>
        </p>
        <p className="feynman-review__verdict">{review.verdict}</p>
      </div>
      <div className="feynman-review__scores">
        <ScoreBar label="Clarity" value={review.clarity} />
        <ScoreBar label="Accuracy" value={review.accuracy} />
        <ScoreBar label="Completeness" value={review.completeness} />
      </div>
      <div className="feynman-review__grid">
        {review.strengths.length > 0 && (
          <section>
            <h3>What worked</h3>
            <ul>
              {review.strengths.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>
        )}
        {review.gaps.length > 0 && (
          <section>
            <h3>Gaps to fix</h3>
            <ul>
              {review.gaps.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
      {review.jargon.length > 0 && (
        <section>
          <h3>Jargon to simplify</h3>
          <dl className="feynman-review__jargon">
            {review.jargon.map((j) => (
              <div key={j.term}>
                <dt>{j.term}</dt>
                <dd>{j.plain}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
      <section>
        <h3>A simpler way to say it</h3>
        <p className="feynman-review__simpler">{review.simplerVersion}</p>
      </section>
      <section>
        <h3>Questions they might ask next</h3>
        <ol>
          {review.followUpQuestions.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}

/** Feynman: explain it simply, get an honest AI review, then explain it again better. */
export default function FeynmanGuide() {
  const dispatch = useDispatch();
  const { voice } = useCurrentTheme();
  const { feynman: history, feynmanStatus: status, feynmanError: error } = useSelector((s) => s.methods);
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('child');
  const [explanation, setExplanation] = useState('');
  const [shownId, setShownId] = useState(null);
  const shown = history.find((h) => h.id === shownId);

  const words = explanation.trim() ? explanation.trim().split(/\s+/).length : 0;
  const canSubmit = topic.trim().length >= 2 && explanation.trim().length >= 40 && status !== 'loading';

  const submit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    const result = await dispatch(reviewExplanation({ topic: topic.trim(), audience, explanation: explanation.trim() }));
    if (result.meta.requestStatus === 'fulfilled') setShownId(null); // show the newest review
  };

  const newest = history[0];
  const current = shown || (status === 'idle' && newest?.topic === topic.trim() && newest?.explanation === explanation.trim() ? newest : null);

  return (
    <div className="guide guide--feynman">
      <form className="guide__form" onSubmit={submit}>
        <div className="feynman-setup">
          <div className="field">
            <label className="field__label" htmlFor="feynman-topic">
              1. The concept
            </label>
            <input
              id="feynman-topic"
              className="input"
              maxLength={120}
              placeholder="e.g. How vaccines work"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="feynman-audience">
              2. Explaining it to…
            </label>
            <select id="feynman-audience" className="input" value={audience} onChange={(event) => setAudience(event.target.value)}>
              {AUDIENCES.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="feynman-write">
          <div className="field">
            <label className="field__label" htmlFor="feynman-text">
              3. Your explanation, in plain words. No notes!
            </label>
            <textarea
              id="feynman-text"
              className="input"
              rows={9}
              maxLength={6000}
              placeholder="Start with the big idea, then use an example…"
              value={explanation}
              onChange={(event) => setExplanation(event.target.value)}
              aria-describedby="feynman-count"
            />
            <span id="feynman-count" className="field__hint">
              {words} words {words > 0 && words < 40 && '· aim for at least a short paragraph'}
            </span>
          </div>
          <MethodTimer minutes={15} label="Explain it" countsAsFocus />
        </div>

        <button type="submit" className="btn btn--primary" disabled={!canSubmit}>
          <Icon name="sparkle" />
          Review my explanation
        </button>
      </form>

      {error && <CoachError error={error} onRetry={() => submit({ preventDefault() {} })} onDismiss={() => dispatch(clearFeynmanError())} />}
      {status === 'loading' && <CoachSkeleton kind="cards" label="Reading your explanation…" />}
      {current && status !== 'loading' && (
        <>
          <Review entry={current} />
          <p className="guide__tip">Now fix the gaps and explain it again, more simply. Edit your text above and ask for another review.</p>
        </>
      )}

      {history.length > 0 && (
        <div className="guide__log">
          <h3>Past explanations</h3>
          <ul>
            {history.map((h) => (
              <li key={h.id} className="feynman-history">
                <button type="button" className="feynman-history__open" onClick={() => setShownId(h.id)} aria-pressed={h.id === current?.id}>
                  <span>{h.topic}</span>
                  <span className="feynman-history__score">{h.review.overall}/10</span>
                </button>
                <button
                  type="button"
                  className="task__btn"
                  aria-label={`Load “${h.topic}” to improve it`}
                  title="Load to improve"
                  onClick={() => {
                    setTopic(h.topic);
                    setAudience(h.audience);
                    setExplanation(h.explanation);
                    setShownId(h.id);
                  }}
                >
                  <Icon name="pencil" />
                </button>
                <button type="button" className="task__btn" aria-label={`Delete “${h.topic}”`} onClick={() => dispatch(deleteFeynman(h.id))}>
                  <Icon name="trash" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <span className="visually-hidden" aria-live="polite">
        {status === 'loading' ? voice.coach.thinkingCards : ''}
      </span>
    </div>
  );
}
