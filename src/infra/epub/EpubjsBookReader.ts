import { Book as EpubjsBook, Rendition } from "epubjs";
import { Book, BookLocation, PageRef, ToCItem } from "app/Book";
import { BookReader } from "app/BookReader";
import ReaderAssistant from "./ReaderAssistant";
import HashGenerator from "./HashGenerator";
import * as TOC from "./EpubjsToC";

export enum NavigationAction {
  PREV,
  NEXT,
  JUMP,
}

export default class EpubjsBookReader implements BookReader {
  #book: Book;
  #view: Element;
  #epubjsBook: EpubjsBook;
  #rendition: Rendition;
  #assistant: ReaderAssistant;
  #isRendered: boolean;
  #hasher: HashGenerator;
  #epubjsToC: TOC.EpubjsToC;

  #locationChangedListeners: ((loc: BookLocation) => unknown)[];
  #lastNavigationAction: NavigationAction;
  #currentChapter: ToCItem;

  constructor() {
    this.#isRendered = false;
    this.#hasher = new HashGenerator();
    this.#locationChangedListeners = [];
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
    ]);

    const title = opened.packaging.metadata.title;
    this.#epubjsToC = TOC.of(nav.toc);

    this.#book = {
      cover: {
        id: this.#hasher.generate(title),
        title,
        coverImageUrl: await this.#epubjsBook.coverUrl(),
      },
      toc: this.#epubjsToC.getToC(),
      data,
    };

    return this.#book;
  }

  render() {
    if (!this.#view) {
      throw new Error('Must provide view first');
    }

    this.#rendition = this.#epubjsBook.renderTo(this.#view, { width: "100%", height: "100%" });
    this.#rendition.display();
    this.#isRendered = true;

    this.#rendition.on("relocated", () => {
      const loc = this.#getBookLocation();
      this.#locationChangedListeners.forEach(l => l(loc));
      this.#locationChangedListeners = [];
    });
  }

  #getBookLocation(): BookLocation {
    this.#currentChapter =
      this.#epubjsToC.determineChapter(
        this.#currentChapter,
        this.#lastNavigationAction,
        this.#rendition.location.start.href
      );
    const chapterProgress = this.#currentChapter ? this.#getChapterProgress(this.#currentChapter) : null;

    return {
      ref: this.currentCfi,
      chapter: this.#currentChapter,
      chapterProgress,
    };
  }

  #getChapterProgress(i: ToCItem) {
    const bookPercentageAtStart = this.#epubjsToC.percentageAtToCItemStart(i);
    const bookPercentageAtEnd = this.#epubjsToC.percentageAtToCItemEnd(i);
    const totalPages = this.#rendition.location.start.displayed.total;
    const currentPage = this.#rendition.location.end.displayed.page;
    const chapterPercentageTotal = bookPercentageAtEnd - bookPercentageAtStart;

    const bookPercentage = bookPercentageAtStart + (chapterPercentageTotal / totalPages) * currentPage;

    return {
      bookPercentage: this.#decToPercentage(bookPercentage),
      totalPages,
      currentPage,
    };
  }

  #decToPercentage(d: number) {
    return Number((d * 100).toFixed(2));
  }

  nextPage(): Promise<BookLocation> {
    this.#lastNavigationAction = NavigationAction.NEXT;
    this.#assistant.removeAllHightlights();
    return new Promise((res) => {
      this.#rendition.next();
      this.#locationChangedListeners.push(res);
    });
  }

  prevPage(): Promise<BookLocation> {
    this.#lastNavigationAction = NavigationAction.PREV;
    this.#assistant.removeAllHightlights();
    return new Promise((res) => {
      this.#rendition.prev();
      this.#locationChangedListeners.push(res);
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

  get currentChapter() {
    return this.#currentChapter;
  }

  moveTo(ref: PageRef): Promise<BookLocation> {
    this.#lastNavigationAction = NavigationAction.JUMP;
    return new Promise((res) => {
      this.#rendition.display(ref);
      this.#locationChangedListeners.push(res);
    });
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
