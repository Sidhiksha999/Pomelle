import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { stopAllMusic } from '../../store/musicSlice';
import { MODES, STATUS } from '../../store/timerSlice';
import { applyAmbient } from './ambientEngine';
import { fadeYouTubeTo, players } from './players';

const BREAK_LEVEL = 0.3; // music plays at 30% during breaks when fading is on

/**
 * Mounted once in <App>. Keeps the speakers in line with the music settings,
 * whatever page is open:
 * - the ambient mixer follows the sliders
 * - during breaks (if enabled) ambient + YouTube get quieter and Spotify pauses
 * - the sleep timer stops everything when it runs out
 */
export function useMusicEngine() {
  const dispatch = useDispatch();
  const ambient = useSelector((s) => s.music.ambient);
  const fadeOnBreaks = useSelector((s) => s.music.fadeOnBreaks);
  const sleepEndsAt = useSelector((s) => s.music.sleepEndsAt);
  const spotifyPlaying = useSelector((s) => s.music.externalPlaying.spotify);
  const mode = useSelector((s) => s.timer.mode);
  const status = useSelector((s) => s.timer.status);

  const onBreak = fadeOnBreaks && status === STATUS.RUNNING && mode !== MODES.FOCUS;

  // The ambient mixer.
  useEffect(() => {
    applyAmbient({ ...ambient, duck: onBreak ? BREAK_LEVEL : 1 });
  }, [ambient, onBreak]);

  // YouTube and Spotify during breaks. Spotify's embed can't change volume,
  // so it pauses for the break and resumes afterwards.
  const spotifyPlayingRef = useRef(spotifyPlaying);
  spotifyPlayingRef.current = spotifyPlaying;
  const youtubeVolumeBefore = useRef(null);
  const pausedSpotify = useRef(false);

  useEffect(() => {
    if (onBreak) {
      if (players.youtube?.getVolume) {
        youtubeVolumeBefore.current = players.youtube.getVolume();
        fadeYouTubeTo(Math.round(youtubeVolumeBefore.current * BREAK_LEVEL));
      }
      if (spotifyPlayingRef.current && players.spotify) {
        players.spotify.pause();
        pausedSpotify.current = true;
      }
    } else {
      if (youtubeVolumeBefore.current !== null) {
        fadeYouTubeTo(youtubeVolumeBefore.current);
        youtubeVolumeBefore.current = null;
      }
      if (pausedSpotify.current) {
        players.spotify?.resume();
        pausedSpotify.current = false;
      }
    }
  }, [onBreak]);

  // The sleep timer. Like the Pomodoro timer, it compares timestamps.
  useEffect(() => {
    if (!sleepEndsAt) return undefined;
    const check = () => {
      if (Date.now() < sleepEndsAt) return;
      dispatch(stopAllMusic()); // the mixer fades out by itself
      const yt = players.youtube;
      if (yt?.getVolume) {
        const volume = yt.getVolume();
        fadeYouTubeTo(0);
        setTimeout(() => {
          yt.pauseVideo();
          yt.setVolume(volume); // back to normal for next time
        }, 1600);
      }
      players.spotify?.pause();
    };
    check();
    const id = setInterval(check, 1000);
    return () => clearInterval(id);
  }, [sleepEndsAt, dispatch]);
}
