import { A } from './fp.js';

const makeLink = (href, label, onItemClick) => {
  const a = document.createElement('a');
  a.href = href;
  a.appendChild(document.createTextNode(label));
  a.addEventListener('click', onItemClick);
  return a;
};

const toTocItemView = (onItemClick) => ({ href, label, subitems }) => {
  let subitemsView = '';
  if (Array.isArray(subitems) && subitems.length > 0) {
    subitemsView = '<ul class="subitems">' + A.map(toTocItemView(onItemClick))(subitems).join('\n') + '</ul>';
  }
  return '<li "toc-item">' + makeLink(href, label, onItemClick) + subitemsView + '</li>';
};

export const toTocView = ({ items, onItemClick }) => 
  Promise.resolve(items)
    .then(A.map(toTocItemView(onItemClick)))
    .then(A.join('\n  '))
    .then(lis => ('<ul id="toc-list">\n  ' + lis + '\n</ul>'))
