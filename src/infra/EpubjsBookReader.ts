import * as ePubjs from "epubjs";
import { Book, PageRef, ToCItem } from "app/Book";
import { BookReader } from "app/BookReader";

export default class EpubjsBookReader implements BookReader {
  epubjsBook: ePubjs.Book;
  rendition: ePubjs.Rendition;
  book: Book;
  #view: Element;

  constructor() {
    this.epubjsBook = new ePubjs.Book();
  }

  set view(v: Element) {
    this.#view = v;
  }

  open(filename: string): Promise<Book> {
    this.epubjsBook.open(filename);
    return Promise.all([
      this.epubjsBook.opened,
      this.epubjsBook.loaded.navigation,
    ])
    .then(([opened, nav]) => {
      this.book = {
        title: opened.packaging.metadata.title,
        toc: nav.toc.map(this.#toTocItem),
      };
      return this.book;
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

    this.rendition = this.epubjsBook.renderTo(this.#view, { width: "100%", height: "90%" });
    this.rendition.display();
  }

  nextPage(): Promise<PageRef> {
    return new Promise((res) => {
      this.rendition.next();
      this.rendition.on("relocated", () => res(this.currentCfi))
    });
  }

  prevPage(): Promise<PageRef> {
    return new Promise((res) => {
      this.rendition.prev();
      this.rendition.on("relocated", () => res(this.currentCfi))
    });
  }

  loaded() {
    return this.epubjsBook.loaded;
  }

  get currentCfi() {
    return this.rendition.location.start.cfi;
  }

  moveTo(ref: PageRef) {
    this.rendition.display(ref);
  }
}
