import { Sentence } from "app/Book";
import PlaybackQueue from "app/PlaybackQueue";

export type StateOption =
  'STOPPED' |
  'PLAYING' | 
  'PAUSED' | 
  'FINISHED_PLAYING' | 
  'FINISHED_PAUSED' | 
  'BEGINNING_PLAYING' |
  'BEGINNING_PAUSED';

export type StateChangeAction = 'play' | 'next' | 'prev' | 'pause' | 'resume' | 'stop';

export type StateDetails = {
  state: StateOption;
  sentence: Sentence;
  prev?: StateDetails;
};

type StateTransitionSpec = {
  action: StateChangeAction;
  condition?: (q: PlaybackQueue) => boolean;
  mutation?: (q: PlaybackQueue) => void;
  nextState: StateOption;
};

const hasNextSound = (q: PlaybackQueue) => q.hasNext();
const hasNoNextSound = (q: PlaybackQueue) => !q.hasNext();

const hasPrevSound = (q: PlaybackQueue) => q.hasPrev();
const hasNoPrevSound = (q: PlaybackQueue) => !q.hasPrev();

const next = (q: PlaybackQueue) => q.next();
const prev = (q: PlaybackQueue) => q.prev();

const stateMap: {[K in StateOption]: StateTransitionSpec[]} = {
  STOPPED: [
    { action: 'play', condition: hasNextSound,                   nextState: 'PLAYING' },
    { action: 'play', condition: hasNoNextSound,                 nextState: 'FINISHED_PLAYING' },
  ],
  PLAYING: [
    { action: 'next', condition: hasNextSound,   mutation: next, nextState: 'PLAYING' },
    { action: 'prev', condition: hasPrevSound,   mutation: prev, nextState: 'PLAYING' },
    { action: 'next', condition: hasNoNextSound,                 nextState: 'FINISHED_PLAYING' },
    { action: 'prev', condition: hasNoPrevSound,                 nextState: 'BEGINNING_PLAYING' },
    { action: 'stop',                                            nextState: 'STOPPED' },
    { action: 'pause',                                           nextState: 'PAUSED' },
  ],
  PAUSED: [
    { action: 'next', condition: hasNextSound,   mutation: next, nextState: 'PAUSED' },
    { action: 'prev', condition: hasPrevSound,   mutation: prev, nextState: 'PAUSED' },
    { action: 'next', condition: hasNoNextSound,                 nextState: 'FINISHED_PAUSED' },
    { action: 'prev', condition: hasNoPrevSound,                 nextState: 'BEGINNING_PAUSED' },
    { action: 'stop',                                            nextState: 'STOPPED' },
    { action: 'resume',                                          nextState: 'PLAYING' },
  ],
  FINISHED_PLAYING: [
    { action: 'next', condition: hasNextSound,   mutation: next, nextState: 'PLAYING' },
    { action: 'stop',                                            nextState: 'STOPPED' },
  ],
  FINISHED_PAUSED: [
    { action: 'next', condition: hasNextSound,   mutation: next, nextState: 'PAUSED' },
    { action: 'stop',                                            nextState: 'STOPPED' },
  ],
  BEGINNING_PLAYING: [
    { action: 'stop',                                            nextState: 'STOPPED' },
    { action: 'prev', condition: hasPrevSound,   mutation: prev, nextState: 'PLAYING' },
  ],
  BEGINNING_PAUSED: [
    { action: 'stop',                                            nextState: 'STOPPED' },
    { action: 'prev', condition: hasPrevSound,   mutation: prev, nextState: 'PAUSED' },
  ]
};

export default class TTSPlaybackState {
  #currentState: StateOption;
  #q: PlaybackQueue;

  constructor() {
    this.#currentState = 'STOPPED';
    this.#q = new PlaybackQueue([]);
  }

  append(ss: Sentence[]) {
    if (this.#q.last()?.trailingOffPage) ss = ss.slice(1); // don't know if it's a good idea to handle this here
    this.#q.enqueue(ss);
  }

  changeState(action: StateChangeAction): StateDetails {
    const prev = {
      state: this.#currentState,
      sentence: this.#q.current(),
    };

    const ts =
      stateMap[this.#currentState]
        .filter(t => t.action === action && (t.condition ? t.condition(this.#q) : true));

    if (ts.length != 1) throw new Error('Invalid TTS Playback State transition requested');
    
    const transition = ts[0];

    if (transition.mutation) transition.mutation(this.#q);
    this.#currentState = transition.nextState;

    return ({
      state: this.#currentState,
      sentence: this.#q.current(),
      prev,
    });
  }
}
