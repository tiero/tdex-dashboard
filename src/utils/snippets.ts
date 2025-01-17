export function snippets(str: string): string {
  return str.replace(str[0], str[0].toUpperCase());
}

// Help Typescript filtering undefined values
export function filterUndef<T>(ts: (T | undefined)[]): T[] {
  return ts.filter((t: T | undefined): t is T => !!t);
}

// Helper to check if readonly array (like LbtcUnit) includes a value
// https://fettblog.eu/typescript-array-includes
export function includes<T extends U, U>(coll: readonly T[], el: U): el is T {
  return coll.includes(el as T);
}
