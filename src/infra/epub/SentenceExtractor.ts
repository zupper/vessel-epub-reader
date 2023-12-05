import { v3 as murmurhashV3 } from "murmurhash";
import nlp from "compromise/one";
import { Sentence } from 'app/Book';

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
  extractSentencesInRange(r: Range): NodeWithSentences[] {
    const nodes = this.#walkRange(r);
    let result: NodeWithSentences[] = [];

    for (let node of nodes) {
      let metaSentences: MetaSentence[] =
        nlp(node.textContent)
          .json({ text: true, offset: true })
          .map((o: { text: string }) => ({ sentence: this.#toSentence(o.text), ...o }));

      if (metaSentences.length > 0) {
        if (node === r.startContainer) metaSentences = this.#trimStartNodeContent(r.startOffset, metaSentences);
        if (node === r.endContainer) metaSentences = this.#truncateEndNodeContent(r.endOffset, metaSentences);

        const sentences = metaSentences.map(({ sentence }) => sentence);

        result.push({ node, sentences })
      }
    }

    return result;
  }

  #trimStartNodeContent(startOffset: number, ss: MetaSentence[]) {
    const trimmed = ss.filter((o) => o.offset.start + o.offset.length >= startOffset);

    const first = trimmed[0];
    if (first.offset.start < startOffset) first.sentence.partiallyOffPage = true;

    return trimmed;
  }

  #truncateEndNodeContent(endOffset: number, ss: MetaSentence[]) {
    const trimmed = ss.filter((o) => o.offset.start < endOffset);

    const last = trimmed[trimmed.length - 1];
    if (last.offset.start + last.offset.length > endOffset) last.sentence.partiallyOffPage = true;

    return trimmed;
  }

  #toSentence(t: string) {
    return ({
      id: this.#getHash(t),
      text: t,
      partiallyOffPage: false,
    });
  }

  #getHash(s: string) {
    return murmurhashV3(s).toString();
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
