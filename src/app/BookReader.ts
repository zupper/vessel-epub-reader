import { Book, BookLocation, PageRef, Sentence } from './Book';
import { ReaderThemeConfig } from './ReaderTheme';

export interface BookReader {
  open(bookOrURL: ArrayBuffer): Promise<Book>;
  render(): void;
  nextPage: () => Promise<BookLocation>;
  prevPage: () => Promise<BookLocation>;
  moveTo: (ref: PageRef) => Promise<BookLocation>;
  getDisplayedSentences: () => Promise<Sentence[]>;
  getSentencesInCurrentChapter: () => Promise<Sentence[]>;
  highlight: (sentenceId: string) => void;
  unhighlight: (sentenceId: string) => void;
  removeAllHighlights: () => void;
  isRendered: () => boolean;
  setTheme: (theme: ReaderThemeConfig) => void;
  setFontSize: (percent: number) => void;
  setFontFamily: (cssValue: string) => void;
}

