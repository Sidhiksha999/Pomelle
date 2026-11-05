import { useState } from 'react';
import Icon from '../../../components/Icon';
import MethodTimer from '../MethodTimer';

const STEPS = [
  { id: 'survey', name: 'Survey', minutes: 5, tip: 'Skim the chapter: title, headings, bold words, pictures, the summary at the end. Don’t read properly yet.' },
  { id: 'question', name: 'Question', minutes: 5, tip: 'Turn each heading into a question you want answered. One per line.' },
  { id: 'read', name: 'Read', minutes: 25, tip: 'Now read properly, section by section, hunting for the answers. Tick each question once you find it.' },
  { id: 'recite', name: 'Recite', minutes: 10, tip: 'Book closed. Answer every question in your own words, from memory.' },
  { id: 'review', name: 'Review', minutes: 5, tip: 'Compare your answers with the book. Mark what you’re confident about, and re-read the rest.' },
];

/** SQ3R: survey, question, read, recite, review, one step at a time. */
export default function SQ3RGuide() {
  const [stepIndex, setStepIndex] = useState(0);
  const [chapter, setChapter] = useState('');
  const [survey, setSurvey] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [found, setFound] = useState({}); // question → found while reading
  const [answers, setAnswers] = useState({}); // question → answer from memory
  const [confident, setConfident] = useState({}); // question → confident after review

  const step = STEPS[stepIndex];
  const questions = questionText
    .split('\n')
    .map((q) => q.trim())
    .filter(Boolean);
  const toggle = (setter) => (q) => setter((map) => ({ ...map, [q]: !map[q] }));

  return (
    <div className="guide guide--sq3r">
      <div className="field">
        <label className="field__label" htmlFor="sq3r-chapter">
          Chapter or reading
        </label>
        <input
          id="sq3r-chapter"
          className="input"
          maxLength={100}
          placeholder="e.g. Chapter 5: The French Revolution"
          value={chapter}
          onChange={(event) => setChapter(event.target.value)}
        />
      </div>

      <ol className="sq3r-steps">
        {STEPS.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              className={i < stepIndex ? 'is-past' : ''}
              aria-current={i === stepIndex ? 'step' : undefined}
              onClick={() => setStepIndex(i)}
            >
              <span className="sq3r-steps__letter">{s.name[0]}</span>
              {s.name}
            </button>
          </li>
        ))}
      </ol>

      <p className="guide__tip">{step.tip}</p>
      <MethodTimer minutes={step.minutes} label={step.name} countsAsFocus />

      {step.id === 'survey' && (
        <div className="field">
          <label className="field__label" htmlFor="sq3r-survey">
            What did you notice? (headings, key terms, pictures)
          </label>
          <textarea id="sq3r-survey" className="input" rows={5} value={survey} onChange={(event) => setSurvey(event.target.value)} />
        </div>
      )}

      {step.id === 'question' && (
        <div className="field">
          <label className="field__label" htmlFor="sq3r-questions">
            Your questions, one per line
          </label>
          <textarea
            id="sq3r-questions"
            className="input"
            rows={6}
            placeholder={'Why did the revolution start in 1789?\nWho were the Jacobins?'}
            value={questionText}
            onChange={(event) => setQuestionText(event.target.value)}
          />
        </div>
      )}

      {step.id !== 'survey' && step.id !== 'question' && questions.length === 0 && (
        <p className="guide__note">Write some questions in the Question step first. They guide the next three steps.</p>
      )}

      {step.id === 'read' && questions.length > 0 && (
        <ul className="sq3r-list">
          {questions.map((q) => (
            <li key={q}>
              <label>
                <input type="checkbox" checked={Boolean(found[q])} onChange={() => toggle(setFound)(q)} />
                {q}
              </label>
            </li>
          ))}
        </ul>
      )}

      {step.id === 'recite' && questions.length > 0 && (
        <ul className="sq3r-list sq3r-list--answers">
          {questions.map((q, i) => (
            <li key={q} className="field">
              <label className="field__label" htmlFor={`sq3r-a-${i}`}>
                {q}
              </label>
              <textarea
                id={`sq3r-a-${i}`}
                className="input"
                rows={2}
                value={answers[q] || ''}
                onChange={(event) => setAnswers((map) => ({ ...map, [q]: event.target.value }))}
              />
            </li>
          ))}
        </ul>
      )}

      {step.id === 'review' && questions.length > 0 && (
        <>
          <ul className="sq3r-list sq3r-list--review">
            {questions.map((q) => (
              <li key={q}>
                <span className="sq3r-list__q">{q}</span>
                <span className="sq3r-list__a">{answers[q] || <em>no answer written</em>}</span>
                <label>
                  <input type="checkbox" checked={Boolean(confident[q])} onChange={() => toggle(setConfident)(q)} />
                  I’m confident about this
                </label>
              </li>
            ))}
          </ul>
          <p className="guide__note">
            Confident on {questions.filter((q) => confident[q]).length} of {questions.length}. Re-read the sections for the others.
          </p>
        </>
      )}

      <div className="guide__actions">
        {stepIndex > 0 && (
          <button type="button" className="btn btn--small btn--quiet" onClick={() => setStepIndex((i) => i - 1)}>
            Back
          </button>
        )}
        {stepIndex < STEPS.length - 1 && (
          <button type="button" className="btn btn--small btn--primary" onClick={() => setStepIndex((i) => i + 1)}>
            Next: {STEPS[stepIndex + 1].name}
            <Icon name="skip" />
          </button>
        )}
      </div>
    </div>
  );
}
