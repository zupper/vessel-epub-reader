import Fuse from "fuse.js";
import { NavItem } from "epubjs";
import { ToC, ToCItem } from "app/Book";

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

export type EpubjsToC = {
  getToC: () => ToC;
  getToCItem: (url: string) => ToCItem | undefined;
  percentageAtToCItemEnd: (i: ToCItem) => number;
  percentageAtToCItemStart: (i: ToCItem) => number;
};

export const of = (ns: NavItem[]): EpubjsToC => {
  const toc = { items: ns.map(toTocItem) };
  const itemsFlat = flattenItems(toc.items);
  const fuse = new Fuse(itemsFlat, { keys: [ 'id', 'link', 'label' ], includeScore: true });

  const getToC = () => toc;

  const getToCItem = (url: string) => {
    const rawSearch = fuse.search(url);
    if (rawSearch.length > 0) return rawSearch[0].item;

    const split = url.split('/')
    const processed = split[split.length - 1]
    const res = fuse.search(processed);

    return res[0]?.item;
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
