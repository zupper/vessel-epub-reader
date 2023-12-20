import { BookReader } from "app/BookReader";
import { Sentence } from "app/Book";
import Navigation from "app/Navigation";

import PlaybackState, { StateChangeAction } from "./PlaybackState";
import { StateDetails } from "./PlaybackState";

import { TTSSource } from './TTSSource';
import { TTSSourceProvider } from './TTSSourceProvider';

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
  #sentenceCompleteBoundCallback: EventListener;

  constructor(params: TTSControlConstructorParams) {
    this.#reader = params.reader;
    this.#ttsProvider = params.ttsSourceProvider;
    this.#nav = params.nav;

    this.#tts = this.#ttsProvider.getActiveSource();
    this.#sentenceCompleteBoundCallback = this.#onSentenceComplete.bind(this);
  }

  async startReading() {
    if (!this.#reader.isRendered()) throw new Error('Must open book first');
    if (this.#state) return;

    const chapterSentences = await this.#reader.getSentencesInCurrentChapter();

    const sentences = await this.#reader.getDisplayedSentences();

    this.#state = new PlaybackState();
    this.#state.append(sentences);

    // put all chapter sentences in the cache to allow for cross-page pre-buffering
    this.#tts.load(chapterSentences);

    this.#tts.addEventListener('sentencecomplete', this.#sentenceCompleteBoundCallback);
    this.#handleNewState(this.#state.changeState('play'));
  }

  #handleInput(action: StateChangeAction) {
    if (!this.#state || this.#stateTransitionInProgress) return;
    this.#handleNewState(this.#state.changeState(action));
  }

  stopReading() { this.#handleInput('stop'); }
  pauseReading() { this.#handleInput('pause'); }
  resumeReading() { this.#handleInput('resume'); }
  nextSentence() { this.#handleInput('next'); }
  previousSentence() { this.#handleInput('prev'); }

  getAvailableSources() {
    return this.#ttsProvider.getSources();
  }

  getCurrentSource() {
    return this.#tts;
  }

  changeSource(id: string) {
    if (!this.getAvailableSources().includes(id)) throw new Error('Invalid TTS Source requested.');
    this.#ttsProvider.activateSource(id);
    this.#tts = this.#ttsProvider.getActiveSource();
  }

  #onSentenceComplete() {
    this.#handleNewState(this.#state.changeState('next'));
  }

  async #handleNewState(st: StateDetails) {
    this.#stateTransitionInProgress = true;
    switch(st.state) {
      case 'PLAYING': {
        if (st.prev?.state === 'PAUSED' && st.prev?.sentence === st.sentence)
          this.#resume()
        else
          await this.#play(st.sentence);
        break;
      }
      case 'PAUSED': {
        if (st.prev?.state === 'PLAYING') this.#pause();
        else this.#loadPaused(st.sentence);
        break;
      }
      case 'STOPPED': {
        this.#stop();
        break;
      }
      case 'BEGINNING_PAUSED':
      case 'BEGINNING_PLAYING': {
        await this.#prevPage();
        break;
      }
      case 'FINISHED_PAUSED':
      case 'FINISHED_PLAYING': {
        await this.#nextPage();
        break;
      }
    }

    this.#stateTransitionInProgress = false;
  }

  async #play(s: Sentence) {
    await this.#loadPaused(s);
    this.#tts.play();
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
    this.#state = null;
  }

  #pause() {
    this.#tts.pause();
  }

  #resume() {
    this.#tts.play();
  }

  async #nextPage() {
    // TODO: consider tracking the chapter change and adding the next chapter text when we reach it
    let sentences: Sentence[] = [];
    while (sentences.length === 0) {
      await this.#nav.nextPage();
      sentences = await this.#reader.getDisplayedSentences();
    }

    this.#state.append(sentences);
    this.#tts.append(sentences);

    const action = sentences[0].partiallyOffPage ? 'next' : 'continue';
    this.#handleNewState(this.#state.changeState(action));
  }

  async #prevPage() {
    await this.#nav.prevPage();

    const sentences = await this.#reader.getDisplayedSentences();
    this.#state.prepend(sentences);
    this.#tts.prepend(sentences);

    const action = sentences[sentences.length - 1].partiallyOffPage ? 'prev' : 'continue';
    this.#handleNewState(this.#state.changeState(action));
  }
}
