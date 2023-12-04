import { v3 as murmurhashV3 } from "murmurhash";
import nlp from "compromise/one";
import { Sentence } from 'app/Book';

export type NodeWithSentences = {
  node: Node;
  sentences: Sentence[];
}

export default class SentenceExtractor {

  extractSentencesInRange(r: Range): NodeWithSentences[] {
    const nodes = this.#walkRange(r);
    let result: NodeWithSentences[] = [];

    for (let node of nodes) {
      let textContent = node.textContent;

      let sentences =
        nlp(textContent)
          .json()
          .map((o: { text: string }): string => o.text)
          .map((t: string) => this.#toSentence(t));

      if (sentences.length > 0) {
        if (node === r.startContainer) {
          const { idx: leftBoundary, inclusionType } = this.#findSentenceIncludingIndex(textContent, sentences, r.startOffset);
          sentences = sentences.slice(leftBoundary);

          if (inclusionType === 'internal') {
            sentences[0].partiallyOffPage = true;
          }
        }

        if (node === r.endContainer) {
          const { idx: rightBoundary, inclusionType } = this.#findSentenceIncludingIndex(textContent, sentences, r.endOffset);
          sentences = sentences.slice(0, rightBoundary + 1);

          if (inclusionType === 'internal') {
            sentences[sentences.length - 1].partiallyOffPage = true;
          }
        }

        result.push({ node, sentences })
      }
    }

    return result;
  }

  #findSentenceIncludingIndex(p: string, ss: Sentence[], idx: number) {
    for (let i = 0; i < ss.length; i++) {
      const startIdx = p.indexOf(ss[i].text);
      const endIdx = startIdx + ss[i].text.length;
      if (startIdx === idx || endIdx === idx) return ({ idx: i, inclusionType: 'border' });
      if (startIdx !== -1 && startIdx < idx && endIdx > idx) return ({ idx: i, inclusionType: 'internal' });
    }
    return null;
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
