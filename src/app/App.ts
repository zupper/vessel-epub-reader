import { BookReader } from './BookReader';
import {
  ThemeId, DEFAULT_THEME, getTheme, isValidThemeId,
  FontSize, DEFAULT_FONT_SIZE, isValidFontSize,
  FontFamilyId, DEFAULT_FONT_FAMILY, getFontFamily, isValidFontFamilyId,
  TtsSpeed, DEFAULT_TTS_SPEED, isValidTtsSpeed,
} from './ReaderTheme';
import { TTSSourceProvider } from './tts/TTSSource';
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
  tts: TTSSourceProvider;
  io: AppIO;
  bookRepository: BookRepository;
}

export default class App {
  tts: TTSControl;
  nav: Navigation;
  reader: BookReader;
  #io: AppIO;
  #repo: BookRepository;

  #themeKey = 'reader-theme';
  #fontSizeKey = 'reader-font-size';
  #fontFamilyKey = 'reader-font-family';
  #ttsRateKey = 'tts-rate';
  #ttsVoiceKey = 'tts-voice';

  get themeId(): ThemeId {
    const stored = this.#io.stringStorage.get(this.#themeKey);
    if (!stored) return DEFAULT_THEME;

    /* Backward compat: old boolean values from dark mode toggle */
    if (stored === 'true') return 'slate';
    if (stored === 'false') return 'light';

    return isValidThemeId(stored) ? stored : DEFAULT_THEME;
  }

  setTheme(id: ThemeId) {
    this.#io.stringStorage.set(this.#themeKey, id);
    this.reader.setTheme(getTheme(id));
  }

  get fontSize(): FontSize {
    const stored = this.#io.stringStorage.get(this.#fontSizeKey);
    if (!stored) return DEFAULT_FONT_SIZE;
    const parsed = Number(stored);
    return isValidFontSize(parsed) ? parsed : DEFAULT_FONT_SIZE;
  }

  setFontSize(size: FontSize) {
    this.#io.stringStorage.set(this.#fontSizeKey, String(size));
    this.reader.setFontSize(size);
  }

  get fontFamilyId(): FontFamilyId {
    const stored = this.#io.stringStorage.get(this.#fontFamilyKey);
    if (!stored) return DEFAULT_FONT_FAMILY;
    return isValidFontFamilyId(stored) ? stored : DEFAULT_FONT_FAMILY;
  }

  setFontFamily(id: FontFamilyId) {
    this.#io.stringStorage.set(this.#fontFamilyKey, id);
    this.reader.setFontFamily(getFontFamily(id).value);
  }

  get ttsRate(): TtsSpeed {
    const stored = this.#io.stringStorage.get(this.#ttsRateKey);
    if (!stored) return DEFAULT_TTS_SPEED;
    const parsed = Number(stored);
    return isValidTtsSpeed(parsed) ? parsed : DEFAULT_TTS_SPEED;
  }

  setTtsRate(rate: TtsSpeed) {
    this.#io.stringStorage.set(this.#ttsRateKey, String(rate));
    this.tts.setRate(rate);
  }

  get ttsVoice(): string {
    return this.#io.stringStorage.get(this.#ttsVoiceKey) ?? '';
  }

  setTtsVoice(id: string) {
    this.#io.stringStorage.set(this.#ttsVoiceKey, id);
    this.tts.setVoice(id);
  }

  constructor(params: AppConsructorParams) {
    this.reader = params.bookReader;
    this.#io = params.io;
    this.#repo = params.bookRepository;

    this.nav = new Navigation({ reader: this.reader, storage: params.io.stringStorage });
    this.tts = new TTSControl({
      ttsSourceProvider: params.tts,
      reader: this.reader,
      nav: this.nav,
    });
  }

  async openBook(id: string) {
    const book = await this.#repo.get(id);
    await this.reader.open(book.data);
    this.reader.render();

    this.nav.book = book;
    const currentLocation = await this.nav.moveToLastReadPage();
    book.currentLocation = currentLocation;

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
    const book = await this.reader.open(data);
    await this.#repo.add(book);

    return book;
  }

  #loadBookURL(handle: URL) {
    // download the book data
  }

  deleteBook(id: string) {
    return this.#repo.delete(id);
  }
}

