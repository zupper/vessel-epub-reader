import { BookReader } from "app/BookReader";
import { Sentence } from "app/Book";
import Navigation from "app/Navigation";

import PlaybackState, { StateChangeAction, StateOption } from "./PlaybackState";
import { StateDetails } from "./PlaybackState";

import { TTSSource, TTSSourceConfig, TTSSourceProvider } from './TTSSource';

const DEBOUNCE_MS = 100;

export type TTSControlConstructorParams = {
  ttsSourceProvider: TTSSourceProvider;
  reader: BookReader;
  nav: Navigation;
};

export default class TTSControl {
  #reader: BookReader;
  #state: PlaybackState;
  #stateTransitionInProgress: boolean;
  #ttsProvider: TTSSourceProvider;
  #nav: Navigation

  #tts: TTSSource;
  #ttsReady: Promise<void>;
  #sentenceCompleteBoundCallback: EventListener;

  #pendingActions: StateChangeAction[];
  #debounceTimer: ReturnType<typeof setTimeout> | null;
  #onErrorCallback: (() => void) | null;

  constructor(params: TTSControlConstructorParams) {
    this.#reader = params.reader;
    this.#ttsProvider = params.ttsSourceProvider;
    this.#nav = params.nav;

    this.#ttsReady = this.#ttsProvider.getActiveSource().then(s => { this.#tts = s; });
    this.#sentenceCompleteBoundCallback = this.#onSentenceComplete.bind(this);
    this.#pendingActions = [];
    this.#debounceTimer = null;
    this.#onErrorCallback = null;
  }

  onError(cb: () => void) { this.#onErrorCallback = cb; }

  async startReading() {
    if (!this.#reader.isRendered()) throw new Error('Must open book first');
    if (this.#state) return;
    await this.#ttsReady;

    const chapterSentences = await this.#reader.getSentencesInCurrentChapter();

    const sentences = await this.#reader.getDisplayedSentences();

    this.#state = new PlaybackState();
    this.#state.append(sentences);

    // put all chapter sentences in the cache to allow for cross-page pre-buffering
    this.#tts.load(chapterSentences);

    this.#tts.addEventListener('sentencecomplete', this.#sentenceCompleteBoundCallback);
    this.#enqueueAction('play');
    this.#drainQueue();
  }

  #enqueueAction(action: StateChangeAction) {
    this.#pendingActions.push(action);
  }

  #handleInput(action: StateChangeAction) {
    if (!this.#state) return;
    this.#enqueueAction(action);

    if (!this.#stateTransitionInProgress) {
      this.#drainQueue();
    }
  }

  async #drainQueue() {
    try {
      while (this.#pendingActions.length > 0) {
        if (!this.#state) break;

        const collapsed = this.#collapseNavigationActions(this.#pendingActions);
        this.#pendingActions = [];

        let i = 0;
        while (i < collapsed.length) {
          if (!this.#state) break;
          const action = collapsed[i];

          if (action === 'next' || action === 'prev') {
            let st = await this.#advanceNav(collapsed, i);
            i = st.nextIndex;
            await this.#handleNewState(st.result);
          } else {
            const st = this.#state.changeState(action);
            await this.#handleNewState(st);
            i++;
          }
        }
      }
    } catch {
      this.#forceStop();
    }
  }

  // Batch consecutive nav actions: advance state for all, execute side effects only for the last.
  // Page boundaries are handled inline (I/O only, no playback) so we don't trigger
  // rapid cancel→speak cycles that wedge WebSpeech.
  async #advanceNav(actions: StateChangeAction[], startIndex: number) {
    let st = this.#state.changeState(actions[startIndex]);
    let i = startIndex + 1;

    while (i < actions.length && (actions[i] === 'next' || actions[i] === 'prev')) {
      if (this.#isPageBoundary(st.state)) {
        st = await this.#turnPage(st.state);
      }
      st = this.#state.changeState(actions[i]);
      i++;
    }

    return { result: st, nextIndex: i };
  }

  #isPageBoundary(state: StateOption): boolean {
    return state === 'FINISHED_PLAYING' || state === 'FINISHED_PAUSED'
      || state === 'BEGINNING_PLAYING' || state === 'BEGINNING_PAUSED';
  }

  // [next, next, next, prev] → net +2 → [next, next]
  #collapseNavigationActions(actions: StateChangeAction[]): StateChangeAction[] {
    const result: StateChangeAction[] = [];
    let navDelta = 0;

    const flushNav = () => {
      if (navDelta > 0) {
        for (let i = 0; i < navDelta; i++) result.push('next');
      } else if (navDelta < 0) {
        for (let i = 0; i < -navDelta; i++) result.push('prev');
      }
      navDelta = 0;
    };

    for (const action of actions) {
      if (action === 'next') {
        navDelta++;
      } else if (action === 'prev') {
        navDelta--;
      } else {
        flushNav();
        result.push(action);
      }
    }

    flushNav();
    return result;
  }

  stopReading() { this.#handleInput('stop'); }
  pauseReading() { this.#handleInput('pause'); }
  resumeReading() { this.#handleInput('resume'); }

  nextSentence() { this.#debouncedNav('next'); }
  previousSentence() { this.#debouncedNav('prev'); }

  #debouncedNav(action: 'next' | 'prev') {
    if (!this.#state) return;
    this.#enqueueAction(action);

    if (this.#debounceTimer !== null) {
      clearTimeout(this.#debounceTimer);
    }

    this.#debounceTimer = setTimeout(() => {
      this.#debounceTimer = null;
      if (!this.#stateTransitionInProgress) {
        this.#drainQueue();
      }
    }, DEBOUNCE_MS);
  }

  getAvailableSources() {
    return this.#ttsProvider.getSources();
  }

  getCurrentSource() {
    return this.#tts;
  }

  getCurrentSourceConfig() {
    return this.#ttsProvider.getConfig(this.#tts.id());
  }

  updateCurrentSourceConfig(config: TTSSourceConfig) {
    this.#ttsProvider.setConfig(this.#tts.id(), config);
  }

  async changeSource(id: string) {
    if (!this.getAvailableSources().includes(id)) throw new Error('Invalid TTS Source requested.');
    this.#ttsProvider.activateSource(id);
    this.#tts = await this.#ttsProvider.getActiveSource();
  }

  #onSentenceComplete() {
    this.#handleInput('next');
  }

  async #handleNewState(st: StateDetails) {
    this.#stateTransitionInProgress = true;
    try {
      switch(st.state) {
        case 'PLAYING': {
          if (st.prev?.state === 'PAUSED' && st.prev?.sentence === st.sentence)
            await this.#resume();
          else
            await this.#play(st.sentence);
          break;
        }
        case 'PAUSED': {
          if (st.prev?.state === 'PLAYING') this.#pause();
          else await this.#loadPaused(st.sentence);
          break;
        }
        case 'STOPPED': {
          this.#stop();
          break;
        }
        case 'BEGINNING_PAUSED':
        case 'BEGINNING_PLAYING': {
          const prevSt = await this.#turnToPrevPage();
          await this.#handleNewState(prevSt);
          break;
        }
        case 'FINISHED_PAUSED':
        case 'FINISHED_PLAYING': {
          const nextSt = await this.#turnToNextPage();
          await this.#handleNewState(nextSt);
          break;
        }
      }
    } catch {
      this.#forceStop();
      return;
    } finally {
      this.#stateTransitionInProgress = false;
    }
  }

  async #play(s: Sentence) {
    await this.#loadPaused(s);
    await this.#tts.play();
  }

  async #loadPaused(s: Sentence) {
    this.#reader.removeAllHighlights();
    this.#reader.highlight(s.id);
    await this.#tts.prepare(s);
  }

  #stop() {
    this.#tts.removeEventListener('sentencecomplete', this.#sentenceCompleteBoundCallback)
    this.#reader.removeAllHighlights();
    this.#tts.stop();
    this.#clearState();
  }

  #forceStop() {
    try { this.#tts.removeEventListener('sentencecomplete', this.#sentenceCompleteBoundCallback); } catch {}
    try { this.#reader.removeAllHighlights(); } catch {}
    try { this.#tts.stop(); } catch {}
    this.#clearState();
    this.#onErrorCallback?.();
  }

  #clearState() {
    this.#state = null;
    this.#pendingActions = [];
    if (this.#debounceTimer !== null) {
      clearTimeout(this.#debounceTimer);
      this.#debounceTimer = null;
    }
  }

  #pause() {
    this.#tts.pause();
  }

  async #resume() {
    await this.#tts.play();
  }

  async #turnPage(boundaryState: StateOption): Promise<StateDetails> {
    if (boundaryState === 'FINISHED_PLAYING' || boundaryState === 'FINISHED_PAUSED') {
      return this.#turnToNextPage();
    }
    return this.#turnToPrevPage();
  }

  async #turnToNextPage(): Promise<StateDetails> {
    let sentences: Sentence[] = [];
    while (sentences.length === 0) {
      await this.#nav.nextPage();
      sentences = await this.#reader.getDisplayedSentences();
    }

    this.#state.append(sentences);
    this.#tts.append(sentences);

    const action = sentences[0].partiallyOffPage ? 'next' : 'continue';
    return this.#state.changeState(action);
  }

  async #turnToPrevPage(): Promise<StateDetails> {
    await this.#nav.prevPage();

    const sentences = await this.#reader.getDisplayedSentences();
    this.#state.prepend(sentences);
    this.#tts.prepend(sentences);

    const action = sentences[sentences.length - 1].partiallyOffPage ? 'prev' : 'continue';
    return this.#state.changeState(action);
  }
}
