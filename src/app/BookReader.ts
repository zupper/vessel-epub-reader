import { Book, PageRef } from './Book';

export interface BookReader {
  open(filename: string): Promise<Book>;
  render(): void;
  nextPage: () => Promise<PageRef>;
  prevPage: () => Promise<PageRef>;
  moveTo: (ref: PageRef) => void;
}

