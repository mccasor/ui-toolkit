let seq = 0;
/** Id univoco per collegare label, descrizioni e controlli (aria-*). */
export const uniqueId = (prefix: string) => `${prefix}-${++seq}`;
