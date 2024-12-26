
import { NavItem } from "epubjs";
import { ToC, ToCItem } from "app/Book";

export default class EpubjsToC {
  #ns: NavItem[];
  #toc: ToC;
  #hrefToItemMapping: Map<string, ToCItem>;
  #idToItemMapping: [string, ToCItem][];
  #itemsFlat: ToCItem[];

  constructor(ns: NavItem[]) {
    this.#ns = ns;
  }

  getToC(): ToC {
    if (!this.#toc)
      this.#makeToC();

    return this.#toc;
  }

  getToCItem(url: string) {
    const i = this.#hrefToItemMapping.get(url);
    if (i) return i;

    return this.#matchUrlToId(url);
  }

  // attempt to match the url to an id, hope for a partial match
  #matchUrlToId(url: string) {
    const entry = this.#idToItemMapping.find(([id]) => url.includes(id))?.[1];
    if (entry) return entry;

    return this.#fuzzyMatchIdToUrl(url);
  }

  #fuzzyMatchIdToUrl(url: string) {
    const numbersInUrl = url.match(/\d+/g);

    if (numbersInUrl) {
      // typicaly the first number is a chapter reference, so we try to match it against the id
      const chapterRef = numbersInUrl[0];

      const entry = this.#idToItemMapping.find(([id]) => {
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
  }

  percentageAtToCItemEnd(i: ToCItem) {
    const itemIdx = this.#itemsFlat.findIndex(ii => ii.link === i.link);
    if (itemIdx === -1) return 0;

    return (itemIdx + 1) / this.#itemsFlat.length;
  }

  percentageAtToCItemStart(i: ToCItem) {
    const itemIdx = this.#itemsFlat.findIndex(ii => ii.link === i.link);
    if (itemIdx === -1) return 0;

    return itemIdx / this.#itemsFlat.length;
  }

  #makeToC() {
    this.#toc = {
      items: this.#ns.map(this.#toTocItem),
    };

    this.#itemsFlat = this.#flattenItems(this.#toc.items);
    this.#hrefToItemMapping = new Map(this.#itemsFlat.map(f => [f.link, f]));

    const nsFlat = this.#flattenItems(this.#ns);
    this.#idToItemMapping = nsFlat.map(n => [n.id, this.#toTocItem(n)]);
  }

  #flattenItems<T extends { subitems?: T[] }>(is: T[]) {
    const result: T[] = [];
    is.forEach(i => {
      result.push(i)
      if (i.subitems?.length > 0) result.push(...this.#flattenItems(i.subitems));
    });

    return result;
  }

  #toTocItem = (navItem: NavItem): ToCItem => ({
    link: navItem.href?.split('#')[0],
    label: navItem.label.trim(),
    subitems: navItem.subitems.map(this.#toTocItem),
  });
}
