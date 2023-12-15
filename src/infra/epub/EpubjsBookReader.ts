import { Book as EpubjsBook, Rendition, NavItem } from "epubjs";
import { Book, PageRef, ToCItem } from "app/Book";
import { BookReader } from "app/BookReader";
import ReaderAssistant from "./ReaderAssistant";
import HashGenerator from "./HashGenerator";

export default class EpubjsBookReader implements BookReader {
  #book: Book;
  #view: Element;
  #epubjsBook: EpubjsBook;
  #rendition: Rendition;
  #assistant: ReaderAssistant;
  #isRendered: boolean;
  #hasher: HashGenerator;

  constructor() {
    this.#isRendered = false;
    this.#hasher = new HashGenerator();
  }

  set view(v: Element) {
    if (v === null) {
      this.#rendition.clear();
      this.#epubjsBook.destroy();
      this.#view = null;
      this.#isRendered = false;
    }
    else this.#view = v;
  }

  async open(data: ArrayBuffer): Promise<Book> {
    this.#epubjsBook = new EpubjsBook();
    this.#assistant = new ReaderAssistant(this.#epubjsBook)
    this.#epubjsBook.open(data);

    const [opened, nav] = await Promise.all([
      this.#epubjsBook.opened,
      this.#epubjsBook.loaded.navigation,
    ])

    const title = opened.packaging.metadata.title;
    this.#book = {
      cover: {
        id: this.#hasher.generate(title),
        title,
      },
      toc: nav.toc.map(this.#toTocItem),
      data,
    };

    return this.#book;
  }

  #toTocItem = (navItem: NavItem):ToCItem => ({
    link: navItem.href,
    label: navItem.label.trim(),
    subitems: navItem.subitems.map(this.#toTocItem),
  });

  render() {
    if (!this.#view) {
      throw new Error('Must provide view first');
    }

    this.#rendition = this.#epubjsBook.renderTo(this.#view, { width: "100%", height: "90%" });
    this.#rendition.display();
    this.#isRendered = true;
  }

  nextPage(): Promise<PageRef> {
    this.#assistant.removeAllHightlights();
    return new Promise((res) => {
      this.#rendition.next();
      this.#rendition.on("relocated", () => res(this.currentCfi))
    });
  }

  prevPage(): Promise<PageRef> {
    this.#assistant.removeAllHightlights();
    return new Promise((res) => {
      this.#rendition.prev();
      this.#rendition.on("relocated", () => res(this.currentCfi))
    });
  }

  getDisplayedSentences() {
    return this.#assistant.getDisplayedSentences();
  }

  getSentencesInCurrentChapter() {
    return this.#assistant.getSentencesInCurrentChapter();
  }

  get currentCfi() {
    return this.#rendition.location.start.cfi;
  }

  moveTo(ref: PageRef) {
    this.#rendition.display(ref);
  }

  highlight(sentenceId: string) {
    this.#assistant.addHighlight(sentenceId);
  }

  unhighlight(sentenceId: string) {
    this.#assistant.removeHighlight(sentenceId);
  }

  removeAllHighlights() {
    this.#assistant.removeAllHightlights();
  }

  isRendered() {
    return this.#isRendered;
  }
}
