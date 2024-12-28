import { pipe } from "fp-ts/function";
import { NavItem } from "epubjs";
import { ToC, ToCItem } from "app/Book";
import * as M from "infra/Matcher";

const toTocItem = (navItem: NavItem): ToCItem => ({
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

export type EpubjsToC = {
  getToC: () => ToC;
  getToCItem: (url: string) => ToCItem | undefined;
  percentageAtToCItemEnd: (i: ToCItem) => number;
  percentageAtToCItemStart: (i: ToCItem) => number;
};

export const of = (ns: NavItem[]): EpubjsToC => {
  const toc = { items: ns.map(toTocItem) };

  const itemsFlat = flattenItems(toc.items);
  const hrefToItemMapping = new Map(itemsFlat.map(f => [f.link, f]));

  const nsFlat = flattenItems(ns);
  const idToItemMapping: [string, ToCItem][] = nsFlat.map(n => [n.id, toTocItem(n)]);

  const getToC = () => toc;

  const getToCItem = (url: string) => pipe(
    M.of(url),
    M.bind(matchUrlToLink),
    M.bind(matchUrlToPartialLink),
    M.bind(matchUrlToId),
    M.bind(fuzzyMatchIdToUrl),
    M.fold
  );

  const matchUrlToLink = (url: string) => hrefToItemMapping.get(url);
  const matchUrlToPartialLink = (url: string) => itemsFlat.find(i => url.includes(i.link));

  // attempt to match the url to an id, hope for a partial match
  const matchUrlToId = (url: string) => idToItemMapping.find(([id]) => url.includes(id))?.[1];

  const fuzzyMatchIdToUrl = (url: string) => {
    const numbersInUrl = url.match(/\d+/g);

    if (numbersInUrl) {
      // typicaly the first number is a chapter reference, so we try to match it against the id
      const chapterRef = numbersInUrl[0];

      const entry = idToItemMapping.find(([id]) => {
        const numbersInId = id.match(/\d+/g);
        if (!numbersInId) return false;

        // we try to reverse-match the chapter ID to the link
        // it's a match if chapter id 36 is part of a link like "chapter_0036"
        const regex = new RegExp(`(?<!\\d)(?:[^\\d]*0*)${numbersInId[0]}(?!\\d)`);
        return regex.test(chapterRef);
      });

      if (entry) return entry[1];
    }

    return undefined;
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
    getToCItem,
    percentageAtToCItemEnd,
    percentageAtToCItemStart,
  };
};

