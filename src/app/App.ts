import { BookReader } from './BookReader';
import { AudioPlayer  } from './AudioPlayer';
import { TTSSource } from './tts/TTSSource';
import TTSControl from './tts/TTSControl';
import Navigation from './Navigation';
import StringStorage from './StringStorage';

export type AppConsructorParams = {
  bookReader: BookReader;
  storage: StringStorage;
  player: AudioPlayer;
  tts: TTSSource;
}

export default class App {
  tts: TTSControl;
  nav: Navigation;
  #reader: BookReader;

  constructor(params: AppConsructorParams) {
    this.#reader = params.bookReader;
    this.nav = new Navigation({ reader: this.#reader, storage: params.storage });
    this.tts = new TTSControl({
      player: params.player,
      ttsSource: params.tts,
      reader: this.#reader,
      nav: this.nav,
    });
  }

  async openBook(filename: string) {
    const book = await this.#reader.open(filename);
    this.#reader.render();

    this.nav.book = book;
    this.nav.moveToLastReadPage();

    return book;
  }
}

