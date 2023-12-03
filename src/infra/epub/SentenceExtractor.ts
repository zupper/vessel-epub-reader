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

      if (node === r.startContainer) {

        const offPage: string[] =
          nlp(textContent.slice(0, r.startOffset))
            .json()
            .map((o: { text: string }) => o.text);

        const offPagePartOfFirstSentence = offPage.length > 0 ? offPage.pop() : '';

        // if we have a sentence that continues from the prev page, we should include all of it
        textContent = offPagePartOfFirstSentence + textContent.substring(r.startOffset);
      }

      if (node === r.endContainer) {
        const offPage: string[] =
          nlp(textContent.slice(r.endOffset))
            .json()
            .map((o: { text: string }) => o.text);

        const trailingPartOfLastSentence = offPage.length > 0 ? offPage.shift() : '';

        // if we have a sentence that continues on the next page, we should include all of it
        textContent = textContent.substring(0, r.endOffset) + trailingPartOfLastSentence;
      }

      const sentenceStrings: string[] =
        nlp(textContent)
          .json()
          .map((o: { text: string }): string => o.text);

      if (sentenceStrings.length > 0) {
        const sentences =
          sentenceStrings
            .map(s => s.trim())
            .filter(t => !!t)
            .map(t => this.#toSentence(t));

        result.push({ node, sentences })
      }
    }

    return result;
  }

  #toSentence(t: string) {
    return ({
      id: this.#getHash(t),
      text: t,
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
