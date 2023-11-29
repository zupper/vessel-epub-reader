import { TTSSource } from "app/TTSSource";
import { AudioPlayer, SentenceCompleteEvent } from "app/AudioPlayer";
import { BookReader } from "app/BookReader";
import PlaybackQueue from "app/PlaybackQueue";
import SoundSource from "app/SoundSource";

export type TTSControlParams = {
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
  #q: PlaybackQueue;
  #soundSource: SoundSource;
  #isTransitioningBetweenSentences: boolean;

  constructor(params: TTSControlParams) {
    this.#player = params.player;
    this.#ttsSource = params.ttsSource;
    this.#reader = params.reader;
    this.#sentenceCompleteBoundCallback = this.#onSentenceComplete.bind(this);
    this.#isPlaying = false;
    this.#isTransitioningBetweenSentences = false;
  }

  async startReading() {
    if (!this.#reader.isRendered()) throw new Error('Must open book first');

    if (this.#isPlaying) return;
    this.#isPlaying = true;

    const sentences = await this.#reader.getDisplayedSentences();
    this.#q = new PlaybackQueue(sentences);
    this.#soundSource = new SoundSource({ ttsSource: this.#ttsSource, sentences });
    this.#player.addEventListener('sentencecomplete', this.#sentenceCompleteBoundCallback);

    this.#resumePlayback();
  }

  async #resumePlayback() {
    const sound = await this.#soundSource.get(this.#q.current().id);
    if (sound && this.#isPlaying) {
      this.#player.play(sound);
      this.#reader.highlight(sound.id);
    }
  }

  async #onSentenceComplete(e: SentenceCompleteEvent) {
    if (this.#isTransitioningBetweenSentences) return;

    this.#isTransitioningBetweenSentences = true;
    this.#reader.unhighlight(e.sentenceId);
    this.#q.next();
    await this.#resumePlayback();
    this.#isTransitioningBetweenSentences = false;
  }

  stopReading() {
    this.#player.removeEventListener('sentencecomplete', this.#sentenceCompleteBoundCallback)
    this.#reader.removeAllHighlights();
    this.#player.stop();
    this.#isPlaying = false;
  }

  nextSentence() {
    this.#sentenceTransition('next');
  }

  previousSentence() {
    this.#sentenceTransition('prev');
  }

  async #sentenceTransition(direction: 'next' | 'prev') {
    if (this.#isTransitioningBetweenSentences) return;

    this.#isTransitioningBetweenSentences = true;
    this.#reader.unhighlight(this.#q.current().id);
    this.#player.stop();

    if (direction === 'next') this.#q.next();
    else if (direction === 'prev') this.#q.prev();

    await this.#resumePlayback();
    this.#isTransitioningBetweenSentences = false;
  }
}

