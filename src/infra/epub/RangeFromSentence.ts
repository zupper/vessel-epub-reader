import { Sentence } from "app/Book";

type SearchSpec = {
  s: string;
  offset: number;
}

type SearchResult = {
  nodesWithOffsets: { node: Node; startOffset: number; endOffset: number; }[];
  searchSpec: SearchSpec;
}

const emptyResult = (s: SearchSpec): SearchResult => ({ nodesWithOffsets: [], searchSpec: s });
const isEmpty = (res: SearchResult): boolean => res.nodesWithOffsets.length === 0;

export default class RangeFromSentence {
  static find(root: Node, s: Sentence): Range {
    const result = this.#checkNode(root, { s: s.text, offset: 0 });
    if (isEmpty(result)) return null;

    const { nodesWithOffsets } = result;
    const range = root.ownerDocument.createRange();

    range.setStart(nodesWithOffsets[0].node, nodesWithOffsets[0].startOffset)
    range.setEnd(nodesWithOffsets[nodesWithOffsets.length - 1].node, nodesWithOffsets[nodesWithOffsets.length - 1].endOffset);

    return range;
  }

  static #checkNode(n: Node, spec: SearchSpec): SearchResult {
    // if the spec is already found, so we short-circuit
    if (spec.offset >= spec.s.length)
      return emptyResult(spec);

    if (n.nodeType === Node.TEXT_NODE && spec.offset === 0)
      return this.#forwardSearchFromStart(n, spec);

    // if the needle is partially matched from before, we must start from the start of the current node (no gaps allowed)
    if (n.nodeType === Node.TEXT_NODE && spec.offset > 0)
      return this.#matcherForLoop(n, 0, spec);

    // if it's not a text node, we process the child nodes
    if (n.nodeType !== Node.TEXT_NODE)
      return this.#checkChildren(Array.from(n.childNodes), spec);
  }

  static #forwardSearchFromStart(n: Node, spec: SearchSpec) {
    // the spec offset is 0, so we're looking for the first char of the needle anywhere in the haystack
    let fisrtCharOffset = 0;
    while (n.textContent.includes(spec.s.charAt(0), fisrtCharOffset)) {
      const searchStartOffset = n.textContent.indexOf(spec.s.charAt(0), fisrtCharOffset);
      const result = this.#matcherForLoop(n, searchStartOffset, spec);

      if (!isEmpty(result)) {
        // result is not empty, so it's a match - we return
        return result;
      }
      else {
        // we don't match yet, but we may still have a chance, so we try to find the first char again
        //   starting at the position after the previous match
        fisrtCharOffset = searchStartOffset + 1;
      }
    }

    // if we haven't matched by now, we don't match
    return emptyResult(spec);
  }

  static #checkChildren(ns: Node[], spec: SearchSpec) {
    return (
      ns.reduce(
        (acc, curr) => {
          const { nodesWithOffsets, searchSpec } = this.#checkNode(curr, acc.searchSpec);
          // if we have some previous results, but we haven't fulfilled the spec,
          //   AND we have an intermediate empty result, then we can't fulfill the spec
          //   so we should reset the search altogether
          if (
            acc.nodesWithOffsets.length > 0 &&
            nodesWithOffsets.length === 0 &&
            searchSpec.s.length > searchSpec.offset
          )
            return emptyResult(spec);

          return { nodesWithOffsets: [...acc.nodesWithOffsets, ...nodesWithOffsets], searchSpec };
        },
        emptyResult(spec)
      )
    );
  }

  static #matcherForLoop(n: Node, searchStartOffset: number, spec: SearchSpec): SearchResult {
    const text = n.textContent;
    for (
      let i = searchStartOffset;
      (i < text.length) && (spec.offset + (i - searchStartOffset) < spec.s.length);
      i++
    ) {
      const loopIteration = i - searchStartOffset;
      if (text.charAt(i) !== spec.s.charAt(spec.offset + loopIteration)) {
        // doesn't match current text node
        return emptyResult(spec);
      }
      else {
        if ((spec.offset + loopIteration === spec.s.length - 1) || (i === text.length - 1)) {
          // we've reached the end of either the needle or the haystack, witout differences, so it's a match
          // update the spec offset and return the current node with its start and end offsets
          return {
            nodesWithOffsets: [{ node: n, startOffset: searchStartOffset, endOffset: i + 1 }],
            searchSpec: { s: spec.s, offset: spec.offset + loopIteration + 1 }
          };
        }
      }
    }

    // shouldn't be able to reach this really
    return emptyResult(spec);
  }
}
