import { TTSSource } from "app/TTSSource";
import { Sentence } from "app/Book";
import { AudioPlayer  } from "app/AudioPlayer";
import { BookReader } from "app/BookReader";
import PlaybackQueue from "app/PlaybackQueue";
import SoundSource from "app/SoundSource";

export type TTSControlConstructorParams = {
  ttsSource: TTSSource;
  player: AudioPlayer;
  reader: BookReader;
};

export default class TTSControl {
  #ttsSource: TTSSource;
  #player: AudioPlayer;
  #reader: BookReader;
  #sentenceCompleteBoundCallback: EventListener;
  #isPlaying: boolean;
  #isPaused: boolean;
  #q: PlaybackQueue;
  #soundSource: SoundSource;
  #isTransitioningBetweenSentences: boolean;

  constructor(params: TTSControlConstructorParams) {
    this.#player = params.player;
    this.#ttsSource = params.ttsSource;
    this.#reader = params.reader;
    this.#sentenceCompleteBoundCallback = this.#onSentenceComplete.bind(this);
    this.#isPlaying = false;
    this.#isPaused = false;
    this.#isTransitioningBetweenSentences = false;
  }

  async startReading() {
    if (!this.#reader.isRendered()) throw new Error('Must open book first');

    if (this.#isPlaying) return;
    this.#isPlaying = true;

    const sentences = await this.#reader.getDisplayedSentences();
    this.#setupPlaybackSupport(sentences);
    this.#player.addEventListener('sentencecomplete', this.#sentenceCompleteBoundCallback);
    this.#resumePlayback();
  }

  stopReading() {
    this.#player.removeEventListener('sentencecomplete', this.#sentenceCompleteBoundCallback)
    this.#reader.removeAllHighlights();
    this.#player.stop();
    this.#isPlaying = false;
    this.#isPaused = false;
  }

  #setupPlaybackSupport(ss: Sentence[]) {
    this.#q = new PlaybackQueue(ss);
    this.#soundSource = new SoundSource({ ttsSource: this.#ttsSource, sentences: ss });
  }

  async #resumePlayback() {
    const sound = await this.#soundSource.get(this.#q.current().id);
    if (sound && this.#isPlaying) {
      this.#player.play(sound);
      this.#reader.highlight(sound.id);
    }
  }

  nextSentence() {
    this.#sentenceTransition('next');
  }

  previousSentence() {
    this.#sentenceTransition('prev');
  }

  #onSentenceComplete() {
    this.#sentenceTransition('next');
  }

  pauseReading() {
    if (this.#isTransitioningBetweenSentences || !this.#isPlaying) return;

    this.#player.pause();
    this.#isPaused = true;
  }

  resumeReading() {
    if (!this.#isPaused) return;

    this.#player.play();
    this.#isPaused = false;
  }

  async #sentenceTransition(direction: 'next' | 'prev') {
    if (this.#isTransitioningBetweenSentences) return;

    this.#isTransitioningBetweenSentences = true;
    this.#reader.unhighlight(this.#q.current().id);
    this.#player.stop();

    if (direction === 'next') {
      if (this.#q.hasNext()) this.#q.next();
      else await this.#pageTransition();
    }
    else if (direction === 'prev') {
      const upcomingSentence = this.#q.prev();
      if (!upcomingSentence) {
        // todo
      }
    }

    await this.#resumePlayback();
    this.#isPaused = false;
    this.#isTransitioningBetweenSentences = false;
  }

  async #pageTransition() {
    await this.#reader.nextPage();
    const sentences = await this.#reader.getDisplayedSentences();

    if (this.#q.last().trailingOffPage) sentences.shift();

    this.#setupPlaybackSupport(sentences);
  }
}

