import { Book as EpubjsBook, Rendition, Location } from "epubjs";
import * as CFI from './CFI';
import SentenceExtractor from "./SentenceExtractor";
import RangeFromSentence from './RangeFromSentence';

export default class ReaderAssistant {
  #epubjsBook: EpubjsBook;
  #displayedCfiRange: string;
  #sentenceRanges: { [key: string]: Range };
  #sentenceExtractor: SentenceExtractor;
  #rendition: Rendition;
  #highlighted: string[];

  constructor(book: EpubjsBook) {
    this.#epubjsBook = book;
    this.#sentenceExtractor = new SentenceExtractor();
    this.#sentenceRanges = {};
    this.#highlighted = [];
  }

  #resolveRendition() {
    this.#rendition = this.#epubjsBook.rendition;
    this.#epubjsBook.rendition.on("relocated", (l: Location) => {
      this.#displayedCfiRange = CFI.getRange(l.start.cfi, l.end.cfi);
    });

    const l = this.#rendition.location;
    this.#displayedCfiRange = CFI.getRange(l.start.cfi, l.end.cfi);
  }

  async getDisplayedSentences() {
    if (!this.#rendition) this.#resolveRendition();

    const range = await this.#epubjsBook.getRange(this.#displayedCfiRange);
    const sentences = this.#sentenceExtractor.extractSentencesInRange(range);

    const sentenceRanges = sentences.map(s => RangeFromSentence.find(range.commonAncestorContainer, s));
    sentences.forEach((s, idx) => {
      this.#sentenceRanges[s.id] = sentenceRanges[idx];
    });

    return sentences;
  }

  getSentencesInCurrentChapter() {
    if (!this.#rendition) this.#resolveRendition();

    const chapter = this.#epubjsBook.section(this.#rendition.location.start.href);
    const sentences = this.#sentenceExtractor.extractSentencesFromString(chapter?.contents?.textContent);

    return Promise.resolve(sentences);
  }

  async addHighlight(sentenceId: string) {
    const range = this.#sentenceRanges[sentenceId];
    if (!range) return;

    const sentenceCfi = CFI.fromDOMRangeWithScreenCfi(range, this.#displayedCfiRange);
    this.#rendition.annotations.highlight(sentenceCfi);
    this.#highlighted.push(sentenceId);
  }

  removeHighlight(sentenceId: string) {
    const range = this.#sentenceRanges[sentenceId];
    if (!range) return;

    const sentenceCfi = CFI.fromDOMRangeWithScreenCfi(range, this.#displayedCfiRange);
    this.#rendition.annotations.remove(sentenceCfi, "highlight");
    this.#highlighted = this.#highlighted.filter(s => s !== sentenceId);
  }

  removeAllHightlights() {
    this.#highlighted.forEach(s => this.removeHighlight(s));
  }
}
