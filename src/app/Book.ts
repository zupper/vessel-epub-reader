export type BookCover = {
  id: string;
  title: string;
  coverImageUrl: string;
}

export type ToC = {
  items: ToCItem[];
  current?: ToCItem;
}

export type Book = {
  cover: BookCover;
  toc: ToC;
  data: ArrayBuffer;
}

export type PageRef = string;

export type BookLocation = {
  ref: PageRef;
  currentChapter?: ToCItem;
}

export type ToCItem = {
  label: string;
  link: PageRef;
  subitems: ToCItem[];
}

export type Sentence = {
  id: string;
  text: string;
  partiallyOffPage: boolean;
}
