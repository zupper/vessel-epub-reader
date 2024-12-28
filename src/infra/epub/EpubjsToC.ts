import Fuse from "fuse.js";
import { NavItem } from "epubjs";
import { ToC, ToCItem } from "app/Book";
import { NavigationAction } from "./EpubjsBookReader";

const toTocItem = (navItem: NavItem): ToCItem => ({
  id: navItem.id,
  link: navItem.href?.split('#')[0],
  label: navItem.label.trim(),
  subitems: navItem.subitems.map(toTocItem),
});

const flattenItems = <T extends { subitems?: T[] }>(is: T[]) => {
  const result: T[] = [];
  is.forEach(i => {
    result.push(i)
    if (i.subitems?.length > 0) result.push(...flattenItems(i.subitems));
  });

  return result;
};

const relativeOffset = <T extends { id: string }>(array: T[], first: T, second: T) => {
  const firstIdx = array.findIndex(a => a.id === first.id);
  const secondIdx = array.findIndex(a => a.id === second.id);
  return secondIdx - firstIdx;
};

export type EpubjsToC = {
  getToC: () => ToC;
  determineChapter: (previousChapter: ToCItem, navAction: NavigationAction, url: string) => ToCItem | undefined;
  percentageAtToCItemEnd: (i: ToCItem) => number;
  percentageAtToCItemStart: (i: ToCItem) => number;
};

export const of = (ns: NavItem[]): EpubjsToC => {
  const toc = { items: ns.map(toTocItem) };
  const itemsFlat = flattenItems(toc.items);
  const fuse = new Fuse(itemsFlat, { keys: [ 'id', 'link', 'label' ], includeScore: true });

  const getToC = () => toc;

  const determineChapter = (previousChapter: ToCItem, navAction: NavigationAction, url: string) => {
    const res = findToCItems(url);
    if (res.length < 2 || !previousChapter) return res[0]?.item;

    // if we have more than one result, we should try to identify the most likely
    // result based on the previous chapter and nav action

    // if we're jumping, we can't really use heuristics, as we can jump anywhere
    // so we return the top-most item based on fuse's score
    if (navAction === NavigationAction.JUMP) return res[0].item;

    // we shouldn't consider results with a weaker score than the top-most one,
    // so we filter them out, making sure we're dealing with equal-score items
    const contestants = res.filter(r => r.score <= res[0].score);

    const relativeOffsets = contestants.map(r => ({...r, offset: relativeOffset(itemsFlat, previousChapter, r.item)}));

    // based on the nav action, we can limit the relevant items to ones further ahead or ones behind the current one
    const filtered = navAction === NavigationAction.PREV
      ? relativeOffsets.filter(r => r.offset <= 0).map(r => ({...r, offset: Math.abs(r.offset)}))
      : relativeOffsets.filter(r => r.offset >= 0);

    const sorted = filtered.sort(({ offset: offset1 }, { offset: offset2 }) => offset1 - offset2);

    // we should normally choose the closest one to our current position - including the same item
    // having the current chapter and the next adjacent one is an edge case, which we cannot reliably
    // determine, so we take a conservative approach and return the current item
    return sorted[0]?.item;
  };

  const findToCItems = (url: string) => {
    const rawSearch = fuse.search(url);
    if (rawSearch.length > 0) return rawSearch;

    const split = url.split('/')
    const processed = split[split.length - 1]
    const res = fuse.search(processed);

    return res;
  };

  const percentageAtToCItemEnd = (i: ToCItem) => {
    const itemIdx = itemsFlat.findIndex(ii => ii.link === i.link);
    if (itemIdx === -1) return 0;

    return (itemIdx + 1) / itemsFlat.length;
  };

  const percentageAtToCItemStart = (i: ToCItem) => {
    const itemIdx = itemsFlat.findIndex(ii => ii.link === i.link);
    if (itemIdx === -1) return 0;

    return itemIdx / itemsFlat.length;
  };

  return {
    getToC,
    determineChapter,
    percentageAtToCItemEnd,
    percentageAtToCItemStart,
  };
};
