import nlp from "compromise/one";
import { Sentence } from 'app/Book';
import HashGenerator from "./HashGenerator";

export type NodeWithSentences = {
  node: Node;
  sentences: Sentence[];
}

type MetaSentence = {
  text: string;
  sentence: Sentence;
  offset: { start: number; length: number }
}

export default class SentenceExtractor {
  #hasher: HashGenerator;

  constructor() {
    this.#hasher = new HashGenerator();
  }

  extractSentencesFromString(s: string) {
    // compromise doesn't handle new lines well, so we'll do some massaging
    return s.split('\n')
      .filter(s => s.length > 0)
      .map(this.#tokenizeString)
      .flat()
      .map(s => this.#toSentence(s));
  }

  #tokenizeString(s: string): string[] {
    return nlp(s)
      .json({ text: true })
      .map((o: { text: string }) => o.text);
  }

  extractSentencesInRange(r: Range): Sentence[] {
    const nodes = this.#walkRange(r);

    const textNodes = nodes.map(n => n.textContent);
    if (textNodes.length === 0) return [];

    const trimmedFirstTextNode = this.#trimStartNodeText(textNodes[0], r.startOffset);
    const trimmedLastTextNode = this.#trimEndNodeText(textNodes[textNodes.length - 1], r.endOffset);

    const firstSentenceOffPage = textNodes[0].length - r.startOffset < trimmedFirstTextNode.length;
    const lastSentenceOffPage = trimmedLastTextNode.length > r.endOffset;

    textNodes[0] = trimmedFirstTextNode;
    textNodes[textNodes.length - 1] = trimmedLastTextNode;

    const sentences = this.extractSentencesFromString(textNodes.join(''));
    sentences[0].partiallyOffPage = firstSentenceOffPage;
    sentences[sentences.length - 1].partiallyOffPage = lastSentenceOffPage;

    return sentences;
  }

  #trimStartNodeText(s: string, offset: number) {
    const trimmed =
      nlp(s)
        .json({ text: true, offset: true })
        .map((o: { text: string }) => ({ sentence: this.#toSentence(o.text), ...o }))
        .filter((o: MetaSentence) => o.offset.start + o.offset.length >= offset)
        .map((o: MetaSentence) => o.sentence.text);

    return trimmed.join(' ');
  }

  #trimEndNodeText(s: string, offset: number) {
    const trimmed =
      nlp(s)
        .json({ text: true, offset: true })
        .map((o: { text: string }) => ({ sentence: this.#toSentence(o.text), ...o }))
        .filter((o: MetaSentence) => o.offset.start < offset)
        .map((o: MetaSentence) => o.sentence.text);

    return trimmed.join(' ');
  }

  #toSentence(t: string) {
    return ({
      id: this.#hasher.generate(t),
      text: t,
      partiallyOffPage: false,
    });
  }

  #walkRange(range: Range) {
    const root = range.commonAncestorContainer;
    const doc = root.ownerDocument;
    const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    const result = [];

    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (this.#isNodeWithinRange(node, range) && this.#isTextNode(node)) {
        result.push(node);
      }
    }

    return result;
  }

  #isTextNode(node: Node) {
    return node.nodeType === 3
  }

  #isNodeWithinRange(node: Node, range: Range) {
    const followingStart = (range.startContainer.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING) > 0;
    const precedingEnd = (range.endContainer.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_PRECEDING) > 0;

    return (
      node === range.startContainer ||
      node === range.endContainer ||
      (followingStart && precedingEnd)
    );
  }
}
