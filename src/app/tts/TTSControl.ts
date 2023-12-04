import { BookReader } from "app/BookReader";
import { AudioPlayer } from "app/AudioPlayer";
import { Sentence } from "app/Book";
import Navigation from "app/Navigation";

import SoundCache from "./SoundCache";
import PlaybackState, { StateChangeAction } from "./PlaybackState";
import { TTSSource } from "./TTSSource";
import { StateDetails } from "./PlaybackState";

export type TTSControlConstructorParams = {
  ttsSource: TTSSource;
  player: AudioPlayer;
  reader: BookReader;
  nav: Navigation;
};

export default class TTSControl {

  #reader: BookReader;
  #player: AudioPlayer;
  #state: PlaybackState;
  #soundSource: SoundCache;
  #stateTransitionInProgress: boolean;
  #ttsSource: TTSSource;
  #nav: Navigation

  #sentenceCompleteBoundCallback: EventListener;

  constructor(params: TTSControlConstructorParams) {
    this.#reader = params.reader;
    this.#player = params.player;
    this.#ttsSource = params.ttsSource;
    this.#sentenceCompleteBoundCallback = this.#onSentenceComplete.bind(this);
    this.#nav = params.nav;
  }

  async startReading() {
    if (!this.#reader.isRendered()) throw new Error('Must open book first');
    if (this.#state) return;

    const sentences = await this.#reader.getDisplayedSentences();
    this.#state = new PlaybackState();
    this.#state.append(sentences);
    this.#soundSource = new SoundCache({ ttsSource: this.#ttsSource, sentences });

    this.#player.addEventListener('sentencecomplete', this.#sentenceCompleteBoundCallback);
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
    this.#player.play();
  }

  async #loadPaused(s: Sentence) {
    const sound = await this.#soundSource.get(s.id);
    this.#player.stop();
    this.#reader.removeAllHighlights();
    this.#reader.highlight(sound.id);
    this.#player.load(sound);
  }

  #stop() {
    this.#player.removeEventListener('sentencecomplete', this.#sentenceCompleteBoundCallback)
    this.#reader.removeAllHighlights();
    this.#player.stop();
    this.#state = null;
  }

  #pause() {
    this.#player.pause();
  }

  #resume() {
    this.#player.play();
  }

  async #nextPage() {
    await this.#nav.nextPage();

    const sentences = await this.#reader.getDisplayedSentences();
    this.#state.append(sentences);
    this.#soundSource.append(sentences);

    const action = sentences[0].partiallyOffPage ? 'next' : 'continue';
    this.#handleNewState(this.#state.changeState(action));
  }

  async #prevPage() {
    await this.#nav.prevPage();

    const sentences = await this.#reader.getDisplayedSentences();
    this.#state.prepend(sentences);
    this.#soundSource.prepend(sentences);

    const action = sentences[sentences.length - 1].partiallyOffPage ? 'prev' : 'continue';
    this.#handleNewState(this.#state.changeState(action));
  }
}
