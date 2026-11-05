// Turns pasted YouTube / Spotify links into something the players understand.
// Returns null when the link isn't recognized.

const YT_ID = /^[\w-]{11}$/;

/**
 * Accepts e.g.
 *   https://www.youtube.com/watch?v=VIDEO&list=PLAYLIST
 *   https://youtu.be/VIDEO
 *   https://www.youtube.com/playlist?list=PLAYLIST
 *   https://www.youtube.com/live/VIDEO, /shorts/VIDEO, /embed/VIDEO
 * → { kind: 'youtube', videoId, listId, url }
 */
export function parseYouTube(text) {
  let url;
  try {
    url = new URL(text.trim());
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www\.|m\.|music\.)/, '');
  let videoId = null;
  if (host === 'youtu.be') {
    videoId = url.pathname.slice(1).split('/')[0];
  } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    videoId = url.searchParams.get('v');
    const match = url.pathname.match(/^\/(live|shorts|embed)\/([\w-]{11})/);
    if (match) videoId = match[2];
  } else {
    return null;
  }
  const listId = url.searchParams.get('list');
  if (videoId && !YT_ID.test(videoId)) videoId = null;
  if (!videoId && !listId) return null;
  return { kind: 'youtube', videoId, listId, url: url.href };
}

/**
 * Accepts e.g.
 *   https://open.spotify.com/playlist/ID?si=…
 *   https://open.spotify.com/intl-de/album/ID
 *   spotify:track:ID
 * → { kind: 'spotify', uri: 'spotify:playlist:ID', url }
 */
export function parseSpotify(text) {
  const trimmed = text.trim();
  const types = 'playlist|album|track|episode|show|artist';
  const uriMatch = trimmed.match(new RegExp(`^spotify:(${types}):([A-Za-z0-9]+)$`));
  if (uriMatch) {
    return { kind: 'spotify', uri: trimmed, url: `https://open.spotify.com/${uriMatch[1]}/${uriMatch[2]}` };
  }
  let url;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  if (url.hostname !== 'open.spotify.com') return null;
  const match = url.pathname.match(new RegExp(`^/(?:intl-[a-z-]+/)?(${types})/([A-Za-z0-9]+)`));
  if (!match) return null;
  return { kind: 'spotify', uri: `spotify:${match[1]}:${match[2]}`, url: `https://open.spotify.com/${match[1]}/${match[2]}` };
}
