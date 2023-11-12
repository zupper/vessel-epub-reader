export const id = a => a;
export const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)));

export const A = {};
A.filter = fn => arr => arr.filter(fn);
A.map = fn => arr => arr.map(fn);
A.reduce = (fn, init) => arr => init === undefined ? arr.reduce(fn) : arr.reduce(fn, init);
A.every = fn => arr => arr.every(fn);
A.join = c => arr => arr.join(c);
A.peek = arr => { console.table(arr); return arr };

