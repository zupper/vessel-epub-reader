export type Book = {
  title: string;
  toc: ToCItem[];
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
}
