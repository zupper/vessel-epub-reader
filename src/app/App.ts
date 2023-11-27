import { Book, PageRef } from './Book';
import { BookReader } from './BookReader';
import { AudioPlayer  } from './AudioPlayer';
import { TTSSource } from 'app/TTSSource';
import TTSControl from 'app/TTSControl';

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
  ttsControl: TTSControl;

  constructor(params: AppConsructorParams) {
    this.reader = params.bookReader;
    this.#storage = params.storage;
    this.ttsControl = new TTSControl({ player: params.player, ttsSource: params.tts, reader: this.reader });
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

