
import { NavItem } from "epubjs";
import { ToC, ToCItem } from "app/Book";

export default class EpubjsToC {
  #ns: NavItem[];
  #toc: ToC;
  #hrefToItemMapping: Map<string, ToCItem>;

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

  #makeToC() {
    this.#toc = {
      current: undefined,
      items: this.#ns.map(this.#toTocItem),
    };

    const itemsFlat = this.#flattenTocItems(this.#toc.items);
    this.#hrefToItemMapping = new Map(itemsFlat.map(f => [f.link, f]));
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
