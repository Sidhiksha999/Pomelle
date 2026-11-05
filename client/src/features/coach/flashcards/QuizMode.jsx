import { useState } from 'react';
import { usableCards } from '../../../store/flashcardsSlice';
import { useCurrentTheme } from '../../../components/hooks/useCurrentTheme';
import { shuffle } from './shuffle';

const QUIZ_LENGTH = 10;

/**
 * Build multiple-choice questions. Wrong options come from the AI's
 * "distractors"; cards without them borrow answers from other cards.
 */
function buildQuiz(deck) {
  const cards = usableCards(deck);
  const allAnswers = cards.map((c) => c.answer);
  return shuffle(cards)
    .slice(0, QUIZ_LENGTH)
    .map((card) => {
      const wrong = [...card.distractors];
      for (const other of shuffle(allAnswers)) {
        if (wrong.length >= 3) break;
        if (other !== card.answer && !wrong.includes(other)) wrong.push(other);
      }
      return { card, options: shuffle([card.answer, ...wrong.slice(0, 3)]) };
    })
    .filter((q) => q.options.length >= 2);
}

export default function QuizMode({ deck, onEdit }) {
  const { voice } = useCurrentTheme();
  const [questions, setQuestions] = useState(() => buildQuiz(deck));
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [missed, setMissed] = useState([]);

  const restart = () => {
    setQuestions(buildQuiz(deck));
    setIndex(0);
    setChosen(null);
    setMissed([]);
  };

  if (questions.length === 0) {
    return (
      <div className="study-empty card">
        <p>A quiz needs at least two finished cards.</p>
        <button type="button" className="btn btn--primary btn--small" onClick={onEdit}>
          Write some cards
        </button>
      </div>
    );
  }

  if (index >= questions.length) {
    const score = questions.length - missed.length;
    return (
      <div className="study-done card">
        <p className="study-done__title">{voice.coach.quizDone}</p>
        <p className="quiz-score">
          <strong>{score}</strong> / {questions.length}
        </p>
        {missed.length > 0 && (
          <div className="quiz-missed">
            <h3>Worth another look</h3>
            <ul>
              {missed.map((card) => (
                <li key={card.id}>
                  <span className="quiz-missed__q">{card.question}</span>
                  <span className="quiz-missed__a">{card.answer}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <button type="button" className="btn btn--small" onClick={restart}>
          New quiz
        </button>
      </div>
    );
  }

  const { card, options } = questions[index];
  const answered = chosen !== null;

  const choose = (option) => {
    if (answered) return;
    setChosen(option);
    if (option !== card.answer) setMissed((m) => [...m, card]);
  };

  return (
    <div className="quiz">
      <p className="study__count">
        Question {index + 1} of {questions.length}
      </p>
      <div className="card quiz__question">
        <p className="flashcard__text">{card.question}</p>
      </div>
      <ul className="quiz__options">
        {options.map((option) => {
          const state = !answered ? '' : option === card.answer ? ' is-right' : option === chosen ? ' is-wrong' : '';
          return (
            <li key={option}>
              <button type="button" className={`quiz__option${state}`} onClick={() => choose(option)} disabled={answered && !state}>
                {option}
              </button>
            </li>
          );
        })}
      </ul>
      {answered && (
        <div className="quiz__feedback" role="status">
          <p>{chosen === card.answer ? 'Correct!' : `Not quite. The answer is: ${card.answer}`}</p>
          <button
            type="button"
            className="btn btn--primary btn--small"
            onClick={() => {
              setIndex((i) => i + 1);
              setChosen(null);
            }}
            autoFocus
          >
            {index + 1 === questions.length ? 'See my score' : 'Next question'}
          </button>
        </div>
      )}
    </div>
  );
}
