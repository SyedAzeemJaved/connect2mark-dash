export const nullIfEmpty = (v: string | undefined | null) => {
  if (typeof v === 'string') {
    v = v.trim();
    if (v === '') {
      return null;
    }
  } else if (typeof v === 'undefined') {
    return null;
  }
  return v;
};
