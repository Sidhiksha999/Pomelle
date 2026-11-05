import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { MODES, STATUS } from '../../store/timerSlice';

/**
 * True for a short moment right after the timer starts running
 * (used for the cat's big stretch).
 */
export function useJustStarted(status, durationMs = 1600) {
  const [flag, setFlag] = useState(false);
  const previous = useRef(status);

  useEffect(() => {
    const startedNow = status === STATUS.RUNNING && previous.current !== STATUS.RUNNING;
    previous.current = status;
    if (!startedNow) return undefined;
    setFlag(true);
    const id = setTimeout(() => setFlag(false), durationMs);
    return () => {
      clearTimeout(id);
      setFlag(false);
    };
  }, [status, durationMs]);

  return flag;
}

/**
 * Watches for finished focus sessions. Returns the id of the current
 * celebration while it should be showing, or null.
 */
export function useFocusCelebration(durationMs) {
  const lastEvent = useSelector((s) => s.timer.lastEvent);
  const [activeId, setActiveId] = useState(null);
  // Remember the event that already existed when this component appeared,
  // so we only celebrate new ones.
  const seenId = useRef(lastEvent?.id ?? 0);

  useEffect(() => {
    if (!lastEvent || lastEvent.id === seenId.current) return undefined;
    seenId.current = lastEvent.id;
    if (lastEvent.mode !== MODES.FOCUS) return undefined;
    setActiveId(lastEvent.id);
    const id = setTimeout(() => setActiveId(null), durationMs);
    return () => clearTimeout(id);
  }, [lastEvent, durationMs]);

  return activeId;
}

/** "25:00", or "1:30:00" for sessions an hour or longer. */
export function formatTime(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}
