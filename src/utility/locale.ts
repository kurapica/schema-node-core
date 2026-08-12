import enUS from '../locale/enUS.json';
import zhCN from '../locale/zhCN.json';

import { Observable, type Observer } from "./observable";
import { setLocaleStringFormat, type LocaleString } from '../struct/localeString/type';
import { isNull } from "./toolset";
import { getCachedNodeType } from '../runtime/context';
import { Display } from '../property/common/display';
import type { IValueTypeAccess } from "../interface/valueTypeAccess";
import type { INodeType } from '../interface';

const locales: {[key:string]: {[key:string]: string}} = { zhCN, enUS, 'zh': zhCN, 'en': enUS }

// language
const langWatches = new Observable<[string]>()
let currLang = navigator?.languages?.map(l => l.replace("-", "")).find(l => locales[l]) ?? 'en'
let currLocale = locales[currLang] ?? locales['en']

/** Try set the language with order */
export function setLanguage(...languages: string[]) 
{
  const newLan = languages.map(l => l.replace('-', '')).find(l => locales[l]) ?? 'en'
  if (currLang === newLan) return currLang
  currLang = newLan
  currLocale = locales[currLang] ?? locales['en']
  langWatches.onNext(currLang)
  return currLang
}

/** Gets current language */
export function getLanguage() { return currLang }

/** Add language change observer */
export function subscribeLanguage(func: Observer<[string]>, immediate?: boolean) : Function
{
  const handler = langWatches.subscribe(func)
  if (immediate && handler) handler(currLang)
  return handler
}

/**
 * import locales for language
 * @param lang language, like 'zhCN', 'enUS'
 * @param items locale items
 */
export function importLanguage(lang: string, items:{ [key:string]: string })
{
  lang = lang.replace('-', '')
  let locale = locales[lang]
  if (!locale)
  {
    locale = { ...items }
    locales[lang] = locale
    if (lang.length >= 4) locales[lang.slice(0, 2)] = locale
  }
  else
  {
    for(let k in items)
        locale[k] = items[k]
  }
}

export type LocaleFunction = {
(key?: string | LocaleString): string
[key: string]: string
}

/** Gets a dynamic locale string entity */
export function _LS(key: string | LocaleString): LocaleString
{
  if (typeof(key) === "object") return key
  return { key }
}

/** Get the locale proxy */
export function getLocaleProxy() {  
  return new Proxy(function(key: string) { 
    return currLocale[key] ?? key } as LocaleFunction, 
    {
      get (target, prop) {
        return typeof(prop) === "string" && prop in currLocale ? currLocale[prop] : prop
      },
      apply(target, thisArg, args) {
        const [key] = args
        return localeStringToString(key)
      }
    }
  );
}

/** Get the default local proxy */
export const _L = getLocaleProxy()

/** parse the locale string to string, the key may complex like '{list.prefix}{@system.schema.def.struct.schema.type}{list.suffix}' */
function localeStringToString(value: LocaleString | string | null | undefined): string
{
  if (isNull(value)) return ""
  if (typeof(value) === "string") return currLocale[value] !== undefined && currLocale[value] !== null ? currLocale[value] : value
  if (typeof(value) !== "object") return isNull(value) ? "" : `${value}`

  if (!value?.key) return ""

  if (value.key && value.key.indexOf("{") >= 0)
  {
      let count = 0;
      const result = value.key.replace(/{(.*?)}/g, (match, p1) => {
          count++;

          if (p1.startsWith("@"))
          {
              // schema
              let key = p1.substring(1)
              let field: string = ""
              if (key.indexOf(":") >= 0)
                  [key, field] = key.split(":")

              const schema = getCachedNodeType(key)
              if (schema) {
                  if (!isNull(field)) {
                      const f = (schema as unknown as IValueTypeAccess).getAccessValueType(field) as unknown as INodeType;
                      const display = f?.getProperty(Display)?.getValue<LocaleString>();
                      return display?.key ? localeStringToString(display) : _L(f?.name || field)
                  }
                  const display = schema?.getProperty(Display)?.getValue<LocaleString>();
                  return display?.key ? localeStringToString(display) : _L(schema.name)
              }

              return currLocale[key] !== undefined && currLocale[key] !== null ? currLocale[key] : p1
          }
          else
          {
              return currLocale[p1] !== undefined && currLocale[p1] !== null ? currLocale[p1] : p1
          }
      })
      if (count > 0) return result
  }
  
  const tran = value.trans?.find(t => currLang.startsWith(t.lang) || t.lang.startsWith(currLang))
  return tran?.tran ?? currLocale[value.key] ?? value.key ?? ""
}

/** format string */
function sformat(template: string | LocaleString, ...args: any[]): string {
  return _L(template).replace(/{(\d+)}/g, (match, index) => {
    return typeof args[index] !== 'undefined' ? _L(args[index]) : match;
  });
}

setLocaleStringFormat(sformat)