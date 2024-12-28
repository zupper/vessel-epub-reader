export type BookCover = {
  id: string;
  title: string;
  coverImageUrl: string;
}

export type ToC = {
  items: ToCItem[];
}

export type Book = {
  cover: BookCover;
  toc: ToC;
  data: ArrayBuffer;
  currentLocation?: BookLocation;
}

export type PageRef = string;

export type ChapterProgress = {
  bookPercentage: number;
  totalPages: number;
  currentPage: number;
}

export type BookLocation = {
  ref: PageRef;
  chapter?: ToCItem;
  chapterProgress: ChapterProgress;
}

export type ToCItem = {
  id: string;
  label: string;
  link: PageRef;
  subitems: ToCItem[];
}

export type Sentence = {
  id: string;
  text: string;
  partiallyOffPage: boolean;
}
