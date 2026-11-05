import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearCoachError,
  createBlankMap,
  deleteMap,
  generateMindMap,
  mapProgress,
  setActiveMap,
} from '../../../store/coachSlice';
import { useCurrentTheme } from '../../../components/hooks/useCurrentTheme';
import Icon from '../../../components/Icon';
import { CoachError, CoachSkeleton } from '../CoachNotice';
import MindMapCanvas from './MindMapCanvas';
import MindMapOutline from './MindMapOutline';
import NodeInspector from './NodeInspector';

export default function MindMapPanel() {
  const dispatch = useDispatch();
  const { voice } = useCurrentTheme();
  const copy = voice.coach;
  const { maps, activeMapId, status, error } = useSelector((s) => s.coach);
  const activeMap = maps.find((m) => m.id === activeMapId) || null;

  const [goal, setGoal] = useState('');
  const [lastGoal, setLastGoal] = useState('');
  const [selectedId, setSelectedId] = useState(activeMap?.rootId ?? null);
  const [view, setView] = useState('map'); // 'map' | 'outline'

  // Opening a different map selects its centre.
  const activeRootId = activeMap?.rootId ?? null;
  useEffect(() => {
    setSelectedId(activeRootId);
  }, [activeRootId]);

  const loading = status === 'loading';

  const generate = (text) => {
    setLastGoal(text);
    dispatch(generateMindMap(text));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    if (goal.trim().length >= 3 && !loading) generate(goal.trim());
  };

  const onDelete = (map) => {
    if (window.confirm(`Delete the map “${map.title}”?`)) dispatch(deleteMap(map.id));
  };

  const progress = activeMap ? mapProgress(activeMap) : 0;

  return (
    <div className="coach-workspace">
      <div className="coach-side">
        <form className="card coach-form" onSubmit={onSubmit}>
          <label className="field__label" htmlFor="coach-goal">
            What’s your goal?
          </label>
          <textarea
            id="coach-goal"
            className="input"
            rows={3}
            maxLength={500}
            placeholder="e.g. Pass my chemistry final in 4 weeks"
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
          />
          <div className="coach-form__actions">
            <button type="submit" className="btn btn--primary" disabled={loading || goal.trim().length < 3}>
              <Icon name="sparkle" />
              Make my map
            </button>
            <button
              type="button"
              className="btn btn--small btn--quiet"
              onClick={() => dispatch(createBlankMap(goal.trim() || 'My goal'))}
            >
              Start a blank map
            </button>
          </div>
        </form>

        {maps.length > 0 && (
          <nav className="coach-list" aria-label="Saved mind maps">
            <h2 className="coach-list__title">Your maps</h2>
            <ul>
              {maps.map((map) => {
                const pct = Math.round(mapProgress(map) * 100);
                return (
                  <li key={map.id} className={`coach-list__item${map.id === activeMapId ? ' is-active' : ''}`}>
                    <button
                      type="button"
                      className="coach-list__open"
                      aria-current={map.id === activeMapId ? 'true' : undefined}
                      onClick={() => dispatch(setActiveMap(map.id))}
                    >
                      <span className="coach-list__name">{map.title}</span>
                      <span className="coach-list__meta">{pct}% done</span>
                    </button>
                    <button type="button" className="task__btn" aria-label={`Delete map “${map.title}”`} onClick={() => onDelete(map)}>
                      <Icon name="trash" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </div>

      <div className="coach-main">
        {error && (
          <CoachError
            error={error}
            onRetry={lastGoal ? () => generate(lastGoal) : undefined}
            onDismiss={() => dispatch(clearCoachError())}
          />
        )}

        {loading ? (
          <CoachSkeleton kind="map" label={copy.thinkingMap} />
        ) : activeMap ? (
          <>
            <div className="map-head">
              <div>
                <h2 className="map-head__title">{activeMap.title}</h2>
                {activeMap.summary && <p className="map-head__summary">{activeMap.summary}</p>}
              </div>
              <div className="map-head__tools">
                <div
                  className="coach-progress"
                  role="progressbar"
                  aria-label="Map progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(progress * 100)}
                >
                  <span className="coach-progress__bar" style={{ width: `${progress * 100}%` }} />
                </div>
                <span className="map-head__pct">{Math.round(progress * 100)}%</span>
                <div className="segmented" role="group" aria-label="View">
                  <button type="button" aria-pressed={view === 'map'} onClick={() => setView('map')}>
                    Map
                  </button>
                  <button type="button" aria-pressed={view === 'outline'} onClick={() => setView('outline')}>
                    Outline
                  </button>
                </div>
              </div>
            </div>

            <div className="map-body">
              {view === 'map' ? (
                <MindMapCanvas map={activeMap} selectedId={selectedId} onSelect={setSelectedId} />
              ) : (
                <div className="card map-outline-card">
                  <MindMapOutline map={activeMap} selectedId={selectedId} onSelect={setSelectedId} />
                </div>
              )}
              <NodeInspector map={activeMap} nodeId={selectedId} onSelect={setSelectedId} />
            </div>
          </>
        ) : (
          <p className="coach-empty">{copy.emptyMaps}</p>
        )}
      </div>
    </div>
  );
}
