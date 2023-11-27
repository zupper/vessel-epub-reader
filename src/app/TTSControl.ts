import { TTSSource } from "app/TTSSource";
import { AudioPlayer, SentenceCompleteEvent } from "app/AudioPlayer";
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

  constructor(params: TTSControlParams) {
    this.#player = params.player;
    this.#ttsSource = params.ttsSource;
    this.#reader = params.reader;
  }

  async startReading() {
    if (!this.#reader.isRendered()) {
      throw new Error('Must open book first');
    }

    const sentences = await this.#reader.getDisplayedSentences();

    const startingSequence = sentences.slice(0, 3);
    this.#remainingSentences = sentences.slice(3);
    const buffered = await this.#ttsSource.generate(startingSequence);
    this.#player.enqueue(buffered);
    this.#player.play();
    this.#reader.highlight(startingSequence[0].id);
    this.#player.addEventListener('sentencecomplete', this.#onSentenceComplete.bind(this));
  }

  async #onSentenceComplete(e: SentenceCompleteEvent) {
    this.#reader.unhighlight(e.sentenceId);

    if (e.nextSentenceId) {
      this.#reader.highlight(e.nextSentenceId);
    }

    if (this.#remainingSentences.length === 0) return;

    const next = this.#remainingSentences.shift();
    this.#player.enqueue(await this.#ttsSource.generate([next]));
  }
}

