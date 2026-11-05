import { useEffect, useRef, useState } from 'react';
import { CATEGORIES, getMethod } from '../../data/methods';
import { useCurrentTheme } from '../../components/hooks/useCurrentTheme';
import { routeHref, useHashParam } from '../../components/hooks/useHashRoute';
import Icon from '../../components/Icon';
import Library, { DifficultyMeter } from './Library';
import MethodArt from './MethodArt';
import { GUIDES } from './guides';
import './methods.css';

function MethodDetail({ method }) {
  const { voice } = useCurrentTheme();
  const [studying, setStudying] = useState(false);
  const sessionRef = useRef(null);
  const Guide = GUIDES[method.id];

  // Opening the guided session scrolls it into view.
  useEffect(() => {
    if (studying) sessionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [studying]);

  return (
    <article className="method-detail" aria-labelledby="method-name">
      <a className="method-detail__back" href={routeHref('methods')}>
        ← {voice.methods.back}
      </a>

      <header className="method-detail__head">
        <MethodArt id={method.id} className="method-detail__art" />
        <div>
          <span className="method-card__category">{CATEGORIES.find((c) => c.id === method.category).label}</span>
          <h1 id="method-name">{method.name}</h1>
          <p className="method-detail__tagline">{method.tagline}</p>
          <DifficultyMeter level={method.difficulty} />
        </div>
      </header>

      <div className="method-detail__body">
        <section className="method-detail__steps" aria-labelledby="how-title">
          <h2 id="how-title">How it works</h2>
          <ol>
            {method.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
        <aside className="method-detail__facts">
          <div>
            <h2>Best for</h2>
            <p>{method.bestFor}</p>
          </div>
          <div>
            <h2>Where it comes from</h2>
            <p>{method.origin}</p>
          </div>
          {!studying && (
            <button type="button" className="btn btn--primary" onClick={() => setStudying(true)}>
              <Icon name="play" filled />
              {voice.methods.studyWith}
            </button>
          )}
        </aside>
      </div>

      {studying && (
        <section ref={sessionRef} className="method-session" aria-label={`${method.name} guided session`}>
          <Guide method={method} />
        </section>
      )}
    </article>
  );
}

/** #/methods shows the library; #/methods/<id> opens one method. */
export default function MethodsPage() {
  const param = useHashParam();
  const method = param ? getMethod(param) : null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [param]);

  return method ? <MethodDetail key={method.id} method={method} /> : <Library />;
}
