export type PageRef = string;

export type Book = {
  title: string;
  toc: ToCItem[];
}

export type ToCItem = {
  label: string;
  link: PageRef;
  subitems: ToCItem[];
}

export interface ReadingArea {
  view: unknown;
  book: Book;
}

export interface BookReader {
  open(filename: string): Promise<Book>;
  render(): void;
  nextPage: () => Promise<PageRef>;
  prevPage: () => Promise<PageRef>;
  moveTo: (ref: PageRef) => void;
}

export interface StringStorage {
  set: (key: string, value: string) => void;
  get: (key: string) => string;
}

export type AppConsructorParams = {
  bookReader: BookReader;
  storage: StringStorage;
}

export class App {
  reader: BookReader;
  currentBook: Book;
  #storage: StringStorage;

  constructor(params: AppConsructorParams) {
    this.reader = params.bookReader;
    this.#storage = params.storage;
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

