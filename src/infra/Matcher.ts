export type Matched<T, P> = {
  _tag: "matched";
  needle: T;
  result: P;
}

export type Unmatched<T> = {
  _tag: "unmatched";
  needle: T;
}

export type Matcher<T, P> = Matched<T, P> | Unmatched<T>;

export const of = <T, P>(needle: T): Matcher<T, P> => ({
  _tag: "unmatched",
  needle
});

export const bind = <T, P>(f: (needle: T) => P | undefined) => (ma: Matcher<T, P>): Matcher<T, P> => {
  // short-circuit if we have a previous match
  if (ma._tag === "matched") return ma;

  const needle = ma.needle;
  const result = f(ma.needle);
  if (result) return ({ _tag: "matched", needle, result });

  return ma;
};

export const fold = <T, P>(ma: Matcher<T, P>): P | undefined => ma._tag === "matched" ? ma.result : undefined;
