
import { NavItem } from "epubjs";
import { ToC, ToCItem } from "app/Book";

export default class EpubjsToC {
  #ns: NavItem[];
  #toc: ToC;
  #hrefToItemMapping: Map<string, ToCItem>;
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
   return this.#hrefToItemMapping.get(url);
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

    this.#itemsFlat = this.#flattenTocItems(this.#toc.items);
    this.#hrefToItemMapping = new Map(this.#itemsFlat.map(f => [f.link, f]));
  }

  #flattenTocItems(is: ToCItem[]) {
    const result: ToCItem[] = [];
    is.forEach(i => {
      result.push(i)
      if (i.subitems.length > 0) result.push(...this.#flattenTocItems(i.subitems));
    });

    return result;
  }

  #toTocItem = (navItem: NavItem): ToCItem => ({
    link: navItem.href,
    label: navItem.label.trim(),
    subitems: navItem.subitems.map(this.#toTocItem),
  });
}
