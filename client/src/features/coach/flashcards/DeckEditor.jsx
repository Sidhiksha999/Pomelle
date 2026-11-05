import { useDispatch } from 'react-redux';
import {
  addCard,
  deleteCard,
  deleteDeck,
  renameDeck,
  resetDeckProgress,
  updateCard,
} from '../../../store/flashcardsSlice';
import Icon from '../../../components/Icon';

/** Edit the deck name and every card. Changes save as you type. */
export default function DeckEditor({ deck }) {
  const dispatch = useDispatch();

  const edit = (card, field, value) => {
    // Changing a card makes the AI's wrong answers out of date, so drop them;
    // the quiz will borrow answers from other cards instead.
    dispatch(updateCard({ deckId: deck.id, cardId: card.id, changes: { [field]: value, distractors: [] } }));
  };

  return (
    <div className="deck-editor">
      <div className="field">
        <label className="field__label" htmlFor="deck-title">
          Deck name
        </label>
        <input
          id="deck-title"
          className="input"
          maxLength={60}
          value={deck.title}
          onChange={(event) => dispatch(renameDeck({ deckId: deck.id, title: event.target.value }))}
        />
      </div>

      <ol className="deck-editor__cards">
        {deck.cards.map((card, i) => (
          <li key={card.id} className="card deck-editor__card">
            <span className="deck-editor__number" aria-hidden="true">
              {i + 1}
            </span>
            <div className="field">
              <label className="field__label" htmlFor={`q-${card.id}`}>
                Question
              </label>
              <textarea id={`q-${card.id}`} className="input" rows={2} maxLength={300} value={card.question} onChange={(e) => edit(card, 'question', e.target.value)} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor={`a-${card.id}`}>
                Answer
              </label>
              <textarea id={`a-${card.id}`} className="input" rows={2} maxLength={300} value={card.answer} onChange={(e) => edit(card, 'answer', e.target.value)} />
            </div>
            <button
              type="button"
              className="task__btn deck-editor__delete"
              aria-label={`Delete card ${i + 1}`}
              onClick={() => dispatch(deleteCard({ deckId: deck.id, cardId: card.id }))}
            >
              <Icon name="trash" />
            </button>
          </li>
        ))}
      </ol>

      <div className="deck-editor__actions">
        <button type="button" className="btn btn--small btn--primary" onClick={() => dispatch(addCard(deck.id))}>
          <Icon name="plus" />
          Add a card
        </button>
        <button
          type="button"
          className="btn btn--small"
          onClick={() => window.confirm('Forget all study progress for this deck?') && dispatch(resetDeckProgress(deck.id))}
        >
          <Icon name="reset" />
          Reset progress
        </button>
        <button
          type="button"
          className="btn btn--small btn--quiet"
          onClick={() => window.confirm(`Delete the deck “${deck.title}”?`) && dispatch(deleteDeck(deck.id))}
        >
          <Icon name="trash" />
          Delete deck
        </button>
      </div>
    </div>
  );
}
