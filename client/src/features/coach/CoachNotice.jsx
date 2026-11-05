import { useCurrentTheme } from '../../components/hooks/useCurrentTheme';
import Icon from '../../components/Icon';
import { IS_LOCAL_SERVER } from './api';

/**
 * Shown when the AI isn't available: either the server isn't running, or it
 * has no Gemini key. Explains how to fix it, in the theme's voice.
 */
export default function CoachNotice({ health, onRecheck }) {
  const { voice } = useCurrentTheme();
  const offline = !health.reachable;

  return (
    <aside className="card coach-notice" role="status">
      <p className="coach-notice__lead">{offline ? voice.coach.offline : voice.coach.needsKey}</p>
      {offline && IS_LOCAL_SERVER && (
        <ol className="coach-notice__steps">
          <li>
            Open a second terminal in the <code>pomelle/server</code> folder.
          </li>
          <li>
            Run <code>npm install</code> (first time only), then <code>npm run dev</code>.
          </li>
        </ol>
      )}
      {offline && !IS_LOCAL_SERVER && (
        <ol className="coach-notice__steps">
          <li>The server may be restarting or still waking up. Wait a minute, then press Check again.</li>
          <li>Everything else in Pomelle keeps working in the meantime, and your maps and decks are saved.</li>
        </ol>
      )}
      {!offline && (
        <ol className="coach-notice__steps">
          <li>
            Get a free key at <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">aistudio.google.com/apikey</a>.
          </li>
          <li>
            Copy <code>server/.env.example</code> to <code>server/.env</code> and paste the key after <code>GEMINI_API_KEY=</code>.
          </li>
          <li>Stop the server (Ctrl + C) and start it again.</li>
        </ol>
      )}
      <button type="button" className="btn btn--small" onClick={onRecheck}>
        <Icon name="refresh" />
        Check again
      </button>
    </aside>
  );
}

/** The right message for an error code from the server. */
export function coachErrorMessage(error, copy) {
  switch (error?.code) {
    case 'OFFLINE':
      return copy.offline;
    case 'NO_KEY':
      return copy.needsKey;
    case 'RATE_LIMITED':
      return copy.busy;
    case 'BAD_INPUT':
      return error.message; // the server says exactly what to fix
    default:
      return copy.failed;
  }
}

/** A themed error box with a "try again" button. */
export function CoachError({ error, onRetry, onDismiss }) {
  const { voice } = useCurrentTheme();
  return (
    <div className="coach-error" role="alert">
      <p>{coachErrorMessage(error, voice.coach)}</p>
      <div className="coach-error__actions">
        {onRetry && error?.code !== 'BAD_INPUT' && (
          <button type="button" className="btn btn--small btn--primary" onClick={onRetry}>
            <Icon name="refresh" />
            Try again
          </button>
        )}
        <button type="button" className="btn btn--small btn--quiet" onClick={onDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
}

/** Placeholder shapes that shimmer while the AI is thinking. */
export function CoachSkeleton({ kind, label }) {
  return (
    <div className={`coach-skeleton coach-skeleton--${kind}`} role="status" aria-live="polite">
      <div className="coach-skeleton__shapes" aria-hidden="true">
        {kind === 'map' ? (
          <>
            <span className="sk sk--root" />
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className={`sk sk--branch sk--b${n}`} />
            ))}
          </>
        ) : (
          [1, 2, 3].map((n) => <span key={n} className={`sk sk--card sk--c${n}`} />)
        )}
      </div>
      <p className="coach-skeleton__label">{label}</p>
    </div>
  );
}
