import { useState } from 'react';
import { CATEGORIES, METHODS } from '../../data/methods';
import { useCurrentTheme } from '../../components/hooks/useCurrentTheme';
import { routeHref } from '../../components/hooks/useHashRoute';
import MethodArt from './MethodArt';

const INTENSITY = ['', 'Gentle', 'Easy-going', 'Steady', 'Demanding', 'Intense'];

/** Five little marks showing how demanding a method is. */
export function DifficultyMeter({ level }) {
  return (
    <span className="difficulty" role="img" aria-label={`Intensity ${level} of 5: ${INTENSITY[level]}`}>
      <span className="difficulty__marks" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={n <= level ? 'is-on' : ''} />
        ))}
      </span>
      <span className="difficulty__label">{INTENSITY[level]}</span>
    </span>
  );
}

/** The browsable library: filter by what you need, open a method to study with it. */
export default function Library() {
  const { voice } = useCurrentTheme();
  const [category, setCategory] = useState('all');
  const shown = category === 'all' ? METHODS : METHODS.filter((m) => m.category === category);

  return (
    <section className="methods-library" aria-labelledby="methods-title">
      <header className="methods-hero">
        <h1 id="methods-title">{voice.methods.title}</h1>
        <p>{voice.methods.intro}</p>
      </header>

      <div className="methods-filter" role="group" aria-label="Filter methods">
        {[{ id: 'all', label: 'All' }, ...CATEGORIES].map((c) => (
          <button key={c.id} type="button" className="methods-filter__chip" aria-pressed={category === c.id} onClick={() => setCategory(c.id)}>
            {c.label}
          </button>
        ))}
      </div>

      <ul className="methods-grid">
        {shown.map((method, i) => (
          <li key={method.id} className={`method-card method-card--${i % 5}`}>
            <a className="method-card__link" href={routeHref('methods', method.id)}>
              <MethodArt id={method.id} className="method-card__art" />
              <span className="method-card__category">{CATEGORIES.find((c) => c.id === method.category).label}</span>
              <span className="method-card__name">{method.name}</span>
              <span className="method-card__tagline">{method.tagline}</span>
              <DifficultyMeter level={method.difficulty} />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
