import { Book, PageRef, Sentence } from './Book';

export interface BookReader {
  open(bookOrURL: ArrayBuffer): Promise<Book>;
  render(): void;
  nextPage: () => Promise<PageRef>;
  prevPage: () => Promise<PageRef>;
  moveTo: (ref: PageRef) => void;
  getDisplayedSentences: () => Promise<Sentence[]>;
  getSentencesInCurrentChapter: () => Promise<Sentence[]>;
  highlight: (sentenceId: string) => void;
  unhighlight: (sentenceId: string) => void;
  removeAllHighlights: () => void;
  isRendered: () => boolean;
}

