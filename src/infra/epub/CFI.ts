import * as ePubjs from "epubjs";

export const fromDOMRangeWithScreenCfi = (r: Range, scfi: string) => {
  const screenCfi = (new ePubjs.EpubCFI()).parse(scfi);
  const sentenceCfi = new ePubjs.EpubCFI(r);
  sentenceCfi.base = screenCfi.base;
  return sentenceCfi.toString();
};

export const getRange = (start: string, end: string) => {
  const cfiObj = new ePubjs.EpubCFI();
  try {
    cfiObj.parse(start);
    cfiObj.parse(end);
  }
  catch (e) {
    throw new Error('cannot parse start or cfi');
  }

  const base = getBase(start, end);
  const startPath = barebones(start).replace(base, '');
  const endPath = barebones(end).replace(base, '');
  return `epubcfi(${base},${startPath},${endPath})`;
};

const getBase = (cfi1: string, cfi2: string) => {

  const bare1 = barebones(cfi1);
  const bare2 = barebones(cfi2);

  let base = '';
  for (let i = 0; bare1[i] === bare2[i]; i++) {
    base += bare1[i];
  }

  if (base.length === 0) {
    throw new Error('cannot determine cfi base');
  }

  while (base.charAt(base.length - 1) !== '/') {
    base = base.substring(0, base.length - 1);
  }

  return base.substring(0, base.length - 1);
};

const barebones = (cfi: string) => cfi.replace('epubcfi(', '').replace(')', '');
