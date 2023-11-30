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
        // ignore the start of the sentence from the previous page for now
        textContent = textContent.substring(r.startOffset, textContent.length);
      }

      if (node === r.endContainer) {
        // if we have a sentence that continues on the next page, we should include all of it
        let idxOffPage = textContent.slice(r.endOffset).search(/[\.!\?]/);
        idxOffPage = idxOffPage < 0 ? r.endOffset : idxOffPage + r.endOffset + 1;
        textContent = textContent.substring(0, idxOffPage);
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
