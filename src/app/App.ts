import { Book, PageRef, Sentence } from './Book';
import { BookReader } from './BookReader';
import { AudioPlayer, SentenceCompleteEvent } from './AudioPlayer';
import { TTSSource } from 'app/TTSSource';

export interface StringStorage {
  set: (key: string, value: string) => void;
  get: (key: string) => string;
}

export type AppConsructorParams = {
  bookReader: BookReader;
  storage: StringStorage;
  player: AudioPlayer;
  tts: TTSSource;
}

export default class App {
  reader: BookReader;
  currentBook: Book;
  #storage: StringStorage;
  #player: AudioPlayer;
  #ttsSource: TTSSource;

  #remainingSentences: Sentence[];

  constructor(params: AppConsructorParams) {
    this.reader = params.bookReader;
    this.#storage = params.storage;
    this.#player = params.player;
    this.#ttsSource = params.tts;
  }

  async openBook(filename: string) {
    this.currentBook = await this.reader.open(filename);
    this.reader.render();

    if (this.#lastPageRef) {
      this.reader.moveTo(this.#lastPageRef);
    }

    return this.currentBook;
  }

  async moveTo(ref: PageRef) {
    if (!this.currentBook) {
      throw new Error('Must open book first');
    }

    if (ref === "next") { this.#lastPageRef = await this.reader.nextPage(); }
    else if (ref === "prev") { this.#lastPageRef = await this.reader.prevPage(); }
    else {
      this.reader.moveTo(ref);
      this.#lastPageRef = ref;
    }
  }

  async startReading() {
    if (!this.currentBook) {
      throw new Error('Must open book first');
    }

    const sentences = await this.reader.getDisplayedSentences();

    const startingSequence = sentences.slice(0, 3);
    this.#remainingSentences = sentences.slice(3);
    const buffered = await this.#ttsSource.generate(startingSequence);
    this.#player.enqueue(buffered);
    this.#player.play();
    this.reader.highlight(startingSequence[0].id);
    this.#player.addEventListener('sentencecomplete', this.#onSentenceComplete.bind(this));
  }

  async #onSentenceComplete(e: SentenceCompleteEvent) {
    this.reader.unhighlight(e.sentenceId);

    if (e.nextSentenceId) {
      this.reader.highlight(e.nextSentenceId);
    }

    if (this.#remainingSentences.length === 0) return;

    const next = this.#remainingSentences.shift();
    this.#player.enqueue(await this.#ttsSource.generate([next]));
  }

  set #lastPageRef(ref: PageRef) {
    this.#storage.set(this.#getPageRefKey(), ref);
  }

  get #lastPageRef(): PageRef {
    return this.#storage.get(this.#getPageRefKey());
  }

  #getPageRefKey() {
    return (`"${this.currentBook.title}":lastPageRef`);
  }
}

