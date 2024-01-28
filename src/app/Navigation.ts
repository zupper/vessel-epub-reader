import { BookReader } from "app/BookReader";
import { Book, BookLocation, PageRef } from "app/Book";
import StringStorage from "app/StringStorage";

export type NavigationConstructorParams = {
  reader: BookReader;
  storage: StringStorage;
};

export default class Navigation {
  book: Book;
  #reader: BookReader;
  #storage: StringStorage;

  constructor(params: NavigationConstructorParams) {
    this.#reader = params.reader;
    this.#storage = params.storage;
  }

  async moveToLastReadPage() {
    if (this.#lastPageRef) {
      return this.#reader.moveTo(this.#lastPageRef);
    }
  }

  async nextPage() {
    return this.moveTo('next');
  }

  async prevPage() {
    return this.moveTo('prev');
  }

  async moveTo(ref: PageRef): Promise<BookLocation> {
    if (!this.book) {
      throw new Error('Must open book first');
    }

    const loc = ref === "next" ? await this.#reader.nextPage() :
                ref === "prev" ? await this.#reader.prevPage() :
                                 await this.#reader.moveTo(ref);

    this.#lastPageRef = loc.ref;

    return loc;
  }

  set #lastPageRef(ref: PageRef) {
    this.#storage.set(this.#getPageRefKey(), ref);
  }

  get #lastPageRef(): PageRef {
    return this.#storage.get(this.#getPageRefKey());
  }

  #getPageRefKey() {
    return (`"${this.book.cover.title}":lastPageRef`);
  }
}
