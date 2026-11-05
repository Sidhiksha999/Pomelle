// Which guided session each study method opens.
import RhythmGuide from './RhythmGuide';
import FlowtimeGuide from './FlowtimeGuide';
import KaizenGuide from './KaizenGuide';
import ShuHaRiGuide from './ShuHaRiGuide';
import FeynmanGuide from './FeynmanGuide';
import RecallGuide from './RecallGuide';
import CornellGuide from './CornellGuide';
import SQ3RGuide from './SQ3RGuide';
import BlurtingGuide from './BlurtingGuide';
import TimeBlockGuide from './TimeBlockGuide';
import EisenhowerGuide from './EisenhowerGuide';

export const GUIDES = {
  pomodoro: RhythmGuide,
  '52-17': RhythmGuide,
  ultradian: RhythmGuide,
  flowtime: FlowtimeGuide,
  kaizen: KaizenGuide,
  shuhari: ShuHaRiGuide,
  feynman: FeynmanGuide,
  'active-recall': RecallGuide,
  cornell: CornellGuide,
  sq3r: SQ3RGuide,
  blurting: BlurtingGuide,
  'time-blocking': TimeBlockGuide,
  eisenhower: EisenhowerGuide,
};
