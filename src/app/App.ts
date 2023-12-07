import { BookReader } from './BookReader';
import { AudioPlayer  } from './AudioPlayer';
import { TTSSource } from './tts/TTSSource';
import TTSControl from './tts/TTSControl';
import Navigation from './Navigation';
import StringStorage from './StringStorage';
import BookSourceReader from './BookSourceReader';
import BookRepository from './BookRepository';

export type AppIO = {
  stringStorage: StringStorage;
  bookSourceReader: BookSourceReader;
}

export type AppConsructorParams = {
  bookReader: BookReader;
  player: AudioPlayer;
  tts: TTSSource;
  io: AppIO;
  bookRepository: BookRepository;
}

export default class App {
  tts: TTSControl;
  nav: Navigation;
  #reader: BookReader;
  #io: AppIO;
  #repo: BookRepository;

  constructor(params: AppConsructorParams) {
    this.#reader = params.bookReader;
    this.#io = params.io;
    this.#repo = params.bookRepository;

    this.nav = new Navigation({ reader: this.#reader, storage: params.io.stringStorage });
    this.tts = new TTSControl({
      player: params.player,
      ttsSource: params.tts,
      reader: this.#reader,
      nav: this.nav,
    });
  }

  async openBook(id: string) {
    const book = await this.#repo.get(id);
    await this.#reader.open(book.data);
    this.#reader.render();

    this.nav.book = book;
    this.nav.moveToLastReadPage();

    return book;
  }

  addBook(handle: File | URL) {
    if (handle instanceof File) return this.#loadBookFile(handle);
    if (handle instanceof URL) return this.#loadBookURL(handle);

    throw new Error('unsupported book input type');
  }

  listBooks() {
    return this.#repo.list();
  }

  async #loadBookFile(handle: File) {
    const data = await this.#io.bookSourceReader.readFile(handle);
    const book = await this.#reader.open(data);
    await this.#repo.add(book);

    return book;
  }

  #loadBookURL(handle: URL) {
    // download the book data
  }
}

