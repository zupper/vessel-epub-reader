import * as ePubjs from "epubjs";
import { Book, PageRef, ToCItem } from "app/Book";
import { BookReader } from "app/BookReader";
import { getRange } from "./CFI";

export default class EpubjsBookReader implements BookReader {
  #book: Book;
  #view: Element;
  #epubjsBook: ePubjs.Book;
  #rendition: ePubjs.Rendition;
  #displayedCfiRange: string;

  constructor() {
    this.#epubjsBook = new ePubjs.Book();
  }

  set view(v: Element) {
    this.#view = v;
  }

  open(filename: string): Promise<Book> {
    this.#epubjsBook.open(filename);
    return Promise.all([
      this.#epubjsBook.opened,
      this.#epubjsBook.loaded.navigation,
    ])
    .then(([opened, nav]) => {
      this.#book = {
        title: opened.packaging.metadata.title,
        toc: nav.toc.map(this.#toTocItem),
      };
      return this.#book;
    });
  }

  #toTocItem = (navItem: ePubjs.NavItem):ToCItem => ({
    link: navItem.href,
    label: navItem.label.trim(),
    subitems: navItem.subitems.map(this.#toTocItem),
  });

  render() {
    if (!this.#view) {
      throw new Error('Must provide view first');
    }

    this.#rendition = this.#epubjsBook.renderTo(this.#view, { width: "100%", height: "90%" });
    this.#rendition.on("relocated", (l: ePubjs.Location) => {
      this.#displayedCfiRange = getRange(l.start.cfi, l.end.cfi);
    });
    this.#rendition.display();
  }

  nextPage(): Promise<PageRef> {
    return new Promise((res) => {
      this.#rendition.next();
      this.#rendition.on("relocated", () => res(this.currentCfi))
    });
  }

  prevPage(): Promise<PageRef> {
    return new Promise((res) => {
      this.#rendition.prev();
      this.#rendition.on("relocated", () => res(this.currentCfi))
    });
  }

  async getDisplayedText() {
    const range = await this.#epubjsBook.getRange(this.#displayedCfiRange);
    return range.toString();
  }

  get currentCfi() {
    return this.#rendition.location.start.cfi;
  }

  moveTo(ref: PageRef) {
    this.#rendition.display(ref);
  }
}
