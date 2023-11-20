import { Sentence } from 'app/Book';
import * as ePubjs from "epubjs";
import * as CFI from './CFI';
import SentenceExtractor from "./SentenceExtractor";

export default class ReaderAssistant {
  #epubjsBook: ePubjs.Book;
  #displayedCfiRange: string;
  #sentenceRanges: { [key: string]: Range };
  #sentenceExtractor: SentenceExtractor;
  #rendition: ePubjs.Rendition;
  #highlighted: string[];

  constructor(book: ePubjs.Book) {
    this.#epubjsBook = book;
    this.#sentenceExtractor = new SentenceExtractor();
    this.#sentenceRanges = {};
    this.#highlighted = [];
  }

  #resolveRendition() {
    this.#rendition = this.#epubjsBook.rendition;
    this.#epubjsBook.rendition.on("relocated", (l: ePubjs.Location) => {
      this.#displayedCfiRange = CFI.getRange(l.start.cfi, l.end.cfi);
    });

    const l = this.#rendition.location;
    this.#displayedCfiRange = CFI.getRange(l.start.cfi, l.end.cfi);
  }

  async getDisplayedSentences() {
    if (!this.#rendition) {
      this.#resolveRendition();
    }

    const range = await this.#epubjsBook.getRange(this.#displayedCfiRange);
    const nodesWithSentences = this.#sentenceExtractor.extractSentencesInRange(range);

    for (let { node, sentences } of nodesWithSentences) {
      const sentenceRanges = sentences.map(s => this.#getRangeForSentenceInNode(s, node));
      sentences.forEach((s, idx) => {
        this.#sentenceRanges[s.id] = sentenceRanges[idx]; 
      });
    }

    return nodesWithSentences.map(({ sentences }) => sentences).flat();
  }

  #getRangeForSentenceInNode(s: Sentence, n: Node) {
    let offset = n.textContent.indexOf(s.text);
    if (offset < 0) return null;

    const range = n.ownerDocument.createRange();
    range.setStart(n, offset)
    range.setEnd(n, offset + s.text.length);

    return range;
  }

  async addHighlight(sentenceId: string) {
    const range = this.#sentenceRanges[sentenceId];
    if (!range) return;

    const sentenceCfi = CFI.fromDOMRangeWithScreenCfi(range, this.#displayedCfiRange);
    this.#rendition.annotations.highlight(sentenceCfi);
  }

  removeHighlight(sentenceId: string) {
    const range = this.#sentenceRanges[sentenceId];
    if (!range) return;

    const sentenceCfi = CFI.fromDOMRangeWithScreenCfi(range, this.#displayedCfiRange);
    this.#rendition.annotations.remove(sentenceCfi, "highlight");
  }

  removeAllHightlights() {}
}
