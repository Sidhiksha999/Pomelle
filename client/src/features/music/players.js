// Loads YouTube's and Spotify's official embed APIs (plain <script> tags from
// their own sites, not npm packages) and keeps a handle on the live players,
// so the rest of the app can pause them or turn them down.

export const players = {
  youtube: null, // a YT.Player
  spotify: null, // a Spotify EmbedController
};

let youTubePromise = null;
let spotifyPromise = null;

function addScript(src) {
  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  document.head.appendChild(script);
}

/** Resolves with window.YT once the YouTube IFrame Player API is ready. */
export function loadYouTubeApi() {
  if (!youTubePromise) {
    youTubePromise = new Promise((resolve) => {
      if (window.YT?.Player) return resolve(window.YT);
      // YouTube calls this global function when its API has loaded.
      window.onYouTubeIframeAPIReady = () => resolve(window.YT);
      addScript('https://www.youtube.com/iframe_api');
    });
  }
  return youTubePromise;
}

/** Resolves with Spotify's IFrameAPI once its embed API is ready. */
export function loadSpotifyApi() {
  if (!spotifyPromise) {
    spotifyPromise = new Promise((resolve) => {
      window.onSpotifyIframeApiReady = (api) => resolve(api);
      addScript('https://open.spotify.com/embed/iframe-api/v1');
    });
  }
  return spotifyPromise;
}

/** Fade YouTube's volume (0–100) over about a second. */
let fadeTimer = null;
export function fadeYouTubeTo(target) {
  const player = players.youtube;
  if (!player?.getVolume) return;
  clearInterval(fadeTimer);
  fadeTimer = setInterval(() => {
    const current = player.getVolume();
    const next = current + Math.sign(target - current) * Math.min(5, Math.abs(target - current));
    player.setVolume(next);
    if (next === target) clearInterval(fadeTimer);
  }, 60);
}
