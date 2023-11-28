import { TTSSource } from "app/TTSSource";
import { AudioPlayer, SentenceCompleteEvent, Sound } from "app/AudioPlayer";
import { BookReader } from "app/BookReader";
import { Sentence } from "app/Book";

export type TTSControlParams = {
  ttsSource: TTSSource;
  player: AudioPlayer;
  reader: BookReader;
};

export default class TTSControl {
  #ttsSource: TTSSource;
  #player: AudioPlayer;
  #reader: BookReader;
  #remainingSentences: Sentence[];
  #sentenceCompleteBoundCallback: EventListener;
  #isPlaying: boolean;

  constructor(params: TTSControlParams) {
    this.#player = params.player;
    this.#ttsSource = params.ttsSource;
    this.#reader = params.reader;
    this.#sentenceCompleteBoundCallback = this.#onSentenceComplete.bind(this);
    this.#isPlaying = false;
  }

  async startReading() {
    if (!this.#reader.isRendered()) throw new Error('Must open book first');

    if (this.#isPlaying) return;
    this.#isPlaying = true;

    const buffered = await this.#getStartingSentences();

    // as the above is async, we may have stopped playing, so we shouldn't enqueue
    if (this.#isPlaying) {
      this.#startPlayback(buffered);
    }
  }

  #startPlayback(buf: Sound[]) {
    this.#player.enqueue(buf);
    this.#player.play();
    this.#reader.highlight(buf[0].id);
    this.#player.addEventListener('sentencecomplete', this.#sentenceCompleteBoundCallback);
  }

  async #getStartingSentences() {
    const sentences = await this.#reader.getDisplayedSentences();

    const startingSequence = sentences.slice(0, 3);
    this.#remainingSentences = sentences.slice(3);
    return this.#ttsSource.generate(startingSequence);
  }

  async #onSentenceComplete(e: SentenceCompleteEvent) {
    this.#reader.unhighlight(e.sentenceId);

    if (e.nextSentenceId) {
      this.#reader.highlight(e.nextSentenceId);
    }

    if (this.#remainingSentences.length === 0) return;

    const next = this.#remainingSentences.shift();
    const nextSound = await this.#ttsSource.generate([next]);

    // as the above is async, we may have stopped playing, so we shouldn't enqueue
    if (this.#isPlaying) {
      this.#player.enqueue(nextSound);
    }
  }

  stopReading() {
    this.#player.clearQueue();
    this.#player.removeEventListener('sentencecomplete', this.#sentenceCompleteBoundCallback)
    this.#reader.removeAllHighlights();
    this.#player.stop();
    this.#isPlaying = false;
  }
}

