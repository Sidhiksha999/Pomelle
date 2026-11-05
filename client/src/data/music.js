// Music section data: ambient sounds, built-in mixes and curated links.
// Every link below was checked to exist when it was added. Live streams can
// end one day; if one stops working, swap it for another here.

/** The ambient sounds in the mixer. `icon` is a name from components/Icon.jsx. */
export const AMBIENT_SOUNDS = [
  { id: 'rain', label: 'Rain', icon: 'rain' },
  { id: 'thunder', label: 'Thunder', icon: 'thunder' },
  { id: 'forest', label: 'Forest', icon: 'tree' },
  { id: 'ocean', label: 'Ocean', icon: 'wave' },
  { id: 'cafe', label: 'Café', icon: 'cup' },
  { id: 'fireplace', label: 'Fireplace', icon: 'flame' },
  { id: 'wind', label: 'Wind', icon: 'wind' },
  { id: 'keyboard', label: 'Typing', icon: 'keyboard' },
  { id: 'white', label: 'White noise', icon: 'noise' },
  { id: 'brown', label: 'Brown noise', icon: 'noise-low' },
];

/** Built-in mixes. Volumes go from 0 to 1. */
export const BUILT_IN_PRESETS = [
  { id: 'rainy-library', name: 'Rainy library', volumes: { rain: 0.6, keyboard: 0.25, brown: 0.2 } },
  { id: 'cozy-cabin', name: 'Cozy cabin', volumes: { fireplace: 0.65, wind: 0.3, rain: 0.2 } },
  { id: 'stormy-night', name: 'Stormy night', volumes: { rain: 0.7, thunder: 0.5, wind: 0.25 } },
  { id: 'seaside-desk', name: 'Seaside desk', volumes: { ocean: 0.6, wind: 0.2 } },
  { id: 'corner-cafe', name: 'Corner café', volumes: { cafe: 0.6, keyboard: 0.2 } },
  { id: 'forest-walk', name: 'Forest walk', volumes: { forest: 0.65, wind: 0.2 } },
];

export const YOUTUBE_SUGGESTIONS = [
  { label: 'Chillhop radio · beats to study/relax to', url: 'https://www.youtube.com/watch?v=7NOSDKb0HlU' },
  { label: 'Lofi Girl · 1 A.M. study session', url: 'https://www.youtube.com/watch?v=lTRiuFIWV54' },
  { label: 'Lofi Girl · synthwave radio', url: 'https://www.youtube.com/watch?v=4xDzrJKXOOY' },
  { label: 'Relaxing jazz piano radio', url: 'https://www.youtube.com/watch?v=Dx5qFachd3A' },
  { label: 'Lofi Girl · best of lofi hip hop 2021', url: 'https://www.youtube.com/watch?v=n61ULEU7CO0' },
];

export const SPOTIFY_SUGGESTIONS = [
  { label: 'lofi beats', url: 'https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn' },
  { label: 'Deep Focus', url: 'https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ' },
  { label: 'Peaceful Piano', url: 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO' },
  { label: 'Instrumental Study', url: 'https://open.spotify.com/playlist/37i9dQZF1DX9sIqqvKsjG8' },
  { label: 'Intense Studying', url: 'https://open.spotify.com/playlist/37i9dQZF1DX8NTLI2TtZa6' },
];

/** Sleep timer choices, in minutes. */
export const SLEEP_OPTIONS = [15, 30, 45, 60, 90];
