// Turns the raw session log into the numbers shown on the stats page.
// Days are counted in the user's local time zone.

const pad = (n) => String(n).padStart(2, '0');

/** "2026-11-05" for a timestamp, in local time. */
export function dayKey(timestamp) {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function startOfDay(timestamp) {
  const d = new Date(timestamp);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Move by whole calendar days (safe across daylight-saving changes). */
function addDays(timestamp, days) {
  const d = new Date(timestamp);
  d.setDate(d.getDate() + days);
  return d.getTime();
}

/** "25m", "1h 20m" or "2h". */
export function formatMinutes(minutes) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

/**
 * Everything the stats page needs, from the list of finished focus sessions.
 * `now` is passed in so the result is easy to test.
 */
export function computeStats(sessions, now = Date.now()) {
  // Minutes and session counts for each day.
  const byDay = new Map();
  let totalMinutes = 0;
  for (const s of sessions) {
    const key = dayKey(s.at);
    const day = byDay.get(key) || { minutes: 0, count: 0 };
    day.minutes += s.minutes;
    day.count += 1;
    byDay.set(key, day);
    totalMinutes += s.minutes;
  }

  // Streak: consecutive days with at least one session, ending today.
  // If today has nothing yet, the streak is still alive from yesterday.
  let streak = 0;
  let cursor = startOfDay(now);
  if (!byDay.has(dayKey(cursor))) cursor = addDays(cursor, -1);
  while (byDay.has(dayKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  // The last seven days, oldest first, ending with today.
  const week = [];
  for (let i = 6; i >= 0; i -= 1) {
    const ts = addDays(startOfDay(now), -i);
    const day = byDay.get(dayKey(ts)) || { minutes: 0, count: 0 };
    week.push({
      key: dayKey(ts),
      label: new Date(ts).toLocaleDateString(undefined, { weekday: 'short' }),
      fullLabel: new Date(ts).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }),
      minutes: day.minutes,
      count: day.count,
      isToday: i === 0,
    });
  }

  // Minutes per subject, biggest first. An empty subject is "unsorted".
  const subjectMap = new Map();
  for (const s of sessions) {
    subjectMap.set(s.subject, (subjectMap.get(s.subject) || 0) + s.minutes);
  }
  const subjects = [...subjectMap.entries()]
    .map(([name, minutes]) => ({ name, minutes }))
    .sort((a, b) => b.minutes - a.minutes);

  const today = byDay.get(dayKey(now)) || { minutes: 0, count: 0 };

  return {
    totalMinutes,
    totalSessions: sessions.length,
    streak,
    todayCount: today.count,
    todayMinutes: today.minutes,
    week,
    weekMinutes: week.reduce((sum, d) => sum + d.minutes, 0),
    subjects,
  };
}
