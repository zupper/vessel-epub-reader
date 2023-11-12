import * as _ from './lib/epub.js/dist/epub.js';
import { A } from './fp.js';
import { toTocView } from './View.js';

const book = ePub('./books/read-aloud-test.epub');
const rendition = book.renderTo("area", { width: "100%", height: "90%" });
const displayed = rendition.display();

const toToc = ({ toc }) => toc;
const toTocItem = ({ href, label, subitems }) => ({ 
  href, 
  label: label.trim(), 
  subitems: A.map(toTocItem)(subitems)
});

book.loaded.navigation
  .then(toToc)
  .then(A.map(toTocItem))
  .then((tocItems) => ({ items: tocItems, onItemClick: () => {} }))
  .then(toTocView)
  .then((tocView) => {
    document.getElementById("contents").innerHTML = tocView;
  });

book.ready.then(() => {
  console.log(book);
  setupButtonClick("next", nextPage(rendition));
  setupButtonClick("prev", prevPage(rendition));
  rendition.on("relocated", setLastCfi(rendition));

  goTo(rendition)(getLastCfi());
});

const goTo = (r) => (target) => r.display(target);

const setLastCfi = (r) => () => localStorage.setItem("lastCfi", r.currentLocation().start.cfi);
const getLastCfi = () => localStorage.getItem("lastCfi");

const nextPage = (r) => () => r.next();
const prevPage = (r) => () => r.prev();

const setupButtonClick = (id, cb) =>
  document
    .getElementById(id)
    .addEventListener("click", cb, false);
