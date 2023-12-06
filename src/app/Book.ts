export type BookCover = {
  id: string;
  title: string;
}

export type Book = {
  cover: BookCover;
  toc: ToCItem[];
  data: ArrayBuffer;
}

export type PageRef = string;

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
