/** The locale translation */
export interface LocaleTran {
  /** The language */
  lang: string;

  /** The translation */
  tran: string;
}

/** The locale string */
export interface LocaleString {
  /** The key */
  key: string;

  /** The translations */
  trans?: LocaleTran[];
}

  /** Concat the other locale string */
export function concatLocaleString(left: LocaleString, right: LocaleString): LocaleString {
  if (right == null) return left;
  left.key = right.key == null || right.key.length === 0 ? left.key : right.key;

  // Combine trans
  if (left.trans == null || left.trans.length === 0)
      left.trans = right.trans;
  else if (right.trans != null && right.trans.length > 0)
  {
      for (let tran of left.trans)
      {
          let inOther = right.trans.find(t => t.lang === tran.lang);
          if (inOther != null)
              tran.tran = inOther.tran == null || inOther.tran.trim() === '' ? tran.tran : inOther.tran;
      }
      var otherOnly = right.trans.filter(t => !left.trans?.some(a => a.lang === t.lang));
      if (otherOnly.length > 0)
          left.trans = left.trans.concat(otherOnly);
  }
  return left;
}

/** Match the keyword in the locale string */
export function matchKeyworkInLocaleString(keyword: string, localeString?: LocaleString): boolean {
  return !localeString ? false : !!localeString?.key.match(keyword)?.length || localeString?.trans?.some(t => !!t.tran.match(keyword)?.length) || false;
}

let localeStringFormat : (template: string | LocaleString, ...args: any[]) => string = () => '';

/** Format the locale string */
export function formatLocaleString(template: string | LocaleString, ...args: any[]): string {
  return localeStringFormat?.(template, ...args) || '';
}

/** Set the locale string format */
export function setLocaleStringFormat(format: (template: string | LocaleString, ...args: any[]) => string) {
  localeStringFormat = format;
}