import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import MethodTimer from '../MethodTimer';

// Common little words that don't count as "key terms".
const STOPWORDS = new Set(
  'the a an and or but if then than that this these those with without into onto from for to of in on at by as is are was were be been being it its they them their there here which who whom whose what when where why how not no yes can could should would will just also very more most such each other some any all both only same so too own about over under again further once during before after above below between through up down out off while because until against do does did doing have has had having i you he she we your our his her my me him us happen happens happened use uses used using make makes made making get gets got like many much well often usually called known include includes including example'
    .split(' '),
);

/** Turn a word into a simple base form so "cells" matches "cell". */
function stem(word) {
  return word.replace(/(ing|ed|es|s)$/, '');
}

/** The key terms in a text: words of 4+ letters (or numbers), minus filler words. */
function keyTerms(text) {
  const terms = new Map(); // stem → the word as written
  for (const raw of text.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}'-]*/gu) || []) {
    const word = raw.replace(/'s$/, '');
    if ((word.length < 4 && !/\d/.test(word)) || STOPWORDS.has(word)) continue;
    const key = stem(word);
    if (!terms.has(key)) terms.set(key, word);
  }
  return terms;
}

/** The notes with every missed term wrapped in <mark>. */
function HighlightedNotes({ notes, missed }) {
  const parts = notes.split(/([\p{L}\p{N}][\p{L}\p{N}'-]*)/u);
  return (
    <p className="blurt-notes">
      {parts.map((part, i) => {
        const key = stem(part.toLowerCase().replace(/'s$/, ''));
        return missed.has(key) ? <mark key={i}>{part}</mark> : part;
      })}
    </p>
  );
}

/** Blurting: read, hide, write everything you remember, then compare. */
export default function BlurtingGuide() {
  const cornellPages = useSelector((s) => s.methods.cornell);
  const [phase, setPhase] = useState('read'); // 'read' | 'blurt' | 'compare'
  const [notes, setNotes] = useState('');
  const [blurt, setBlurt] = useState('');
  const [round, setRound] = useState(1);

  const result = useMemo(() => {
    if (phase !== 'compare') return null;
    const noteTerms = keyTerms(notes);
    const recalled = keyTerms(blurt);
    const missed = new Map([...noteTerms].filter(([key]) => !recalled.has(key)));
    const coverage = noteTerms.size ? Math.round(((noteTerms.size - missed.size) / noteTerms.size) * 100) : 0;
    return { total: noteTerms.size, missed, coverage };
  }, [phase, notes, blurt]);

  return (
    <div className="guide guide--blurting">
      {phase === 'read' && (
        <>
          <p className="guide__tip">Paste the notes you want to learn, read them through once, then hide them.</p>
          {cornellPages.length > 0 && (
            <div className="field">
              <label className="field__label" htmlFor="blurt-from">
                Or load one of your Cornell pages
              </label>
              <select
                id="blurt-from"
                className="input"
                value=""
                onChange={(event) => {
                  const page = cornellPages.find((p) => p.id === event.target.value);
                  if (page) setNotes([page.notes, page.summary].filter(Boolean).join('\n\n'));
                }}
              >
                <option value="">Choose a page…</option>
                {cornellPages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="field">
            <label className="field__label" htmlFor="blurt-notes">
              Your notes
            </label>
            <textarea id="blurt-notes" className="input" rows={8} value={notes} onChange={(event) => setNotes(event.target.value)} />
          </div>
          <MethodTimer minutes={5} label="Read once" />
          <button type="button" className="btn btn--primary" disabled={notes.trim().length < 20} onClick={() => setPhase('blurt')}>
            Hide my notes and start blurting
          </button>
        </>
      )}

      {phase === 'blurt' && (
        <>
          <p className="guide__tip">
            Round {round}. Your notes are hidden. Write <strong>everything</strong> you remember: keywords, half-sentences,
            arrows. Speed beats neatness.
          </p>
          <MethodTimer minutes={10} label="Blurt" countsAsFocus />
          <div className="field">
            <label className="field__label" htmlFor="blurt-text">
              From memory
            </label>
            <textarea id="blurt-text" className="input blurt-input" rows={10} value={blurt} onChange={(event) => setBlurt(event.target.value)} autoFocus />
          </div>
          <button type="button" className="btn btn--primary" disabled={!blurt.trim()} onClick={() => setPhase('compare')}>
            Reveal my notes and compare
          </button>
        </>
      )}

      {phase === 'compare' && result && (
        <>
          <div className="blurt-score">
            <span className="blurt-score__number">{result.coverage}%</span>
            <span>
              of the key terms recalled ({result.total - result.missed.size} of {result.total})
            </span>
          </div>
          {result.missed.size > 0 && (
            <div className="blurt-missed">
              <h3>You missed</h3>
              <ul>
                {[...result.missed.values()].map((word) => (
                  <li key={word}>{word}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="blurt-compare">
            <section>
              <h3>Your notes (missed terms highlighted)</h3>
              <HighlightedNotes notes={notes} missed={result.missed} />
            </section>
            <section>
              <h3>What you wrote</h3>
              <p className="blurt-notes">{blurt}</p>
            </section>
          </div>
          <p className="guide__note">This is a word-level check, so read both sides too: you may have said it in other words.</p>
          <div className="guide__actions">
            <button
              type="button"
              className="btn btn--primary btn--small"
              onClick={() => {
                setBlurt('');
                setRound((r) => r + 1);
                setPhase('blurt');
              }}
            >
              Blurt again
            </button>
            <button
              type="button"
              className="btn btn--small btn--quiet"
              onClick={() => {
                setBlurt('');
                setRound(1);
                setPhase('read');
              }}
            >
              New notes
            </button>
          </div>
        </>
      )}
    </div>
  );
}
