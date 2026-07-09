// =============================================================================
// system.str — string logic, state, convert, map, util
// Mirrors C# SchemaNode.Core/Function/SystemStr.cs
// =============================================================================

import { Meta } from '../attribute/meta';
import { OfSchema, SchemaType, Return, ArgName, Converter, ServerOnly, NoCache, Default } from '../property/index';
import { SCHEMA_KIND_FUNCTION, NS_SYSTEM_BOOL, NS_SYSTEM_INT, NS_SYSTEM_STRING, NS_SYSTEM_LOCALE_STRING, NS_SYSTEM_STR } from '../utility/constant';

// ── Main class ─────────────────────────────────────────────────────────────

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, NS_SYSTEM_STR)
export class SystemStr {
  // No methods on the root — all are in sub-namespaces below
}

// ── Logic ──────────────────────────────────────────────────────────────────

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, `${NS_SYSTEM_STR}.logic`)
export class SystemStrLogic {
  /** str.startwith(prefix) */
  @Meta(Return, NS_SYSTEM_BOOL)
  static startswith(
    @Meta(ArgName, 'str') @Meta(SchemaType, NS_SYSTEM_STRING) str: string = "",
    @Meta(ArgName, 'prefix') @Meta(SchemaType, NS_SYSTEM_STRING) prefix: string = "",
  ): boolean { return prefix.length > 0 && str.toLowerCase().startsWith(prefix.toLowerCase()); }

  /** str.notstartwith(prefix) */
  @Meta(Return, NS_SYSTEM_BOOL)
  static notstartswith(
    @Meta(ArgName, 'str') @Meta(SchemaType, NS_SYSTEM_STRING) str: string = "",
    @Meta(ArgName, 'prefix') @Meta(SchemaType, NS_SYSTEM_STRING) prefix: string = "",
  ): boolean { return prefix.length > 0 && !str.toLowerCase().startsWith(prefix.toLowerCase()); }

  /** str.endswith(suffix) */
  @Meta(Return, NS_SYSTEM_BOOL)
  static endswith(
    @Meta(ArgName, 'str') @Meta(SchemaType, NS_SYSTEM_STRING) str: string = "",
    @Meta(ArgName, 'suffix') @Meta(SchemaType, NS_SYSTEM_STRING) suffix: string = "",
  ): boolean { return suffix.length > 0 && str.toLowerCase().endsWith(suffix.toLowerCase()); }

  /** str.notendswith(suffix) */
  @Meta(Return, NS_SYSTEM_BOOL)
  static notendswith(
    @Meta(ArgName, 'str') @Meta(SchemaType, NS_SYSTEM_STRING) str: string = "",
    @Meta(ArgName, 'suffix') @Meta(SchemaType, NS_SYSTEM_STRING) suffix: string = "",
  ): boolean { return suffix.length > 0 && !str.toLowerCase().endsWith(suffix.toLowerCase()); }

  /** str.contains(substr) */
  @Meta(Return, NS_SYSTEM_BOOL)
  static contains(
    @Meta(ArgName, 'str') @Meta(SchemaType, NS_SYSTEM_STRING) str: string = "",
    @Meta(ArgName, 'substr') @Meta(SchemaType, NS_SYSTEM_STRING) sub: string = "",
  ): boolean { return sub.length > 0 && str.toLowerCase().includes(sub.toLowerCase()); }

  /** str.notcontains(substr) */
  @Meta(Return, NS_SYSTEM_BOOL)
  static notcontains(
    @Meta(ArgName, 'str') @Meta(SchemaType, NS_SYSTEM_STRING) str: string = "",
    @Meta(ArgName, 'substr') @Meta(SchemaType, NS_SYSTEM_STRING) sub: string = "",
  ): boolean { return sub.length > 0 && !str.toLowerCase().includes(sub.toLowerCase()); }
}

// ── State ──────────────────────────────────────────────────────────────────

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, `${NS_SYSTEM_STR}.state`)
export class SystemStrState {
  /** str.length */
  @Meta(Return, NS_SYSTEM_INT)
  @Meta(SchemaType, 'system.str.state.length')
  static len(@Meta(ArgName, 'str') @Meta(SchemaType, NS_SYSTEM_STRING) str: string = ""): number { return str.length; }

  /** str.isempty */
  @Meta(Return, NS_SYSTEM_BOOL)
  static isempty(@Meta(ArgName, 'str') @Meta(SchemaType, NS_SYSTEM_STRING) str: string = ""): boolean { return !str || str.trim().length === 0; }
}

// ── Convert ────────────────────────────────────────────────────────────────

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, `${NS_SYSTEM_STR}.convert`)
export class SystemStrConvert {
  /** a..b */
  @Meta(SchemaType, 'system.str.convert.concat') @Meta(Return, NS_SYSTEM_STRING)
  static concat(
    @Meta(ArgName, 'str1') @Meta(SchemaType, NS_SYSTEM_STRING) a: string = "",
    @Meta(ArgName, 'str2') @Meta(SchemaType, NS_SYSTEM_STRING) b: string = "",
  ): string { return a + b; }

  @Meta(SchemaType, 'system.str.convert.split') @Meta(Return, `system.list<${NS_SYSTEM_STRING}>`)
  static split(
    @Meta(ArgName, 'str') @Meta(SchemaType, NS_SYSTEM_STRING) str: string = "",
    @Meta(ArgName, 'sep') @Meta(SchemaType, NS_SYSTEM_STRING) sep: string = "",
  ): string[] { return str.split(sep).filter(s => s.length > 0); }

  @Meta(SchemaType, 'system.str.convert.substr') @Meta(Return, NS_SYSTEM_STRING)
  static substr(
    @Meta(ArgName, 'str') @Meta(SchemaType, NS_SYSTEM_STRING) str: string = "",
    @Meta(ArgName, 'startIndex') @Meta(SchemaType, NS_SYSTEM_INT) start: number = 0,
    @Meta(ArgName, 'stop') @Meta(SchemaType, NS_SYSTEM_INT) stop?: number,
  ): string {
    const s = Math.max(0, Math.min(start, str.length));
    const e = stop !== undefined ? Math.max(s, Math.min(stop, str.length)) : str.length;
    return str.substring(s, e);
  }

  @Meta(SchemaType, 'system.str.convert.replace') @Meta(Return, NS_SYSTEM_STRING)
  static replace(
    @Meta(ArgName, 'str') @Meta(SchemaType, NS_SYSTEM_STRING) str: string = "",
    @Meta(ArgName, 'search') @Meta(SchemaType, NS_SYSTEM_STRING) search: string = "",
    @Meta(ArgName, 'replace') @Meta(SchemaType, NS_SYSTEM_STRING) replace?: string,
  ): string { return str.split(search).join(replace ?? ''); }

  @Meta(SchemaType, 'system.str.convert.trim') @Meta(Return, NS_SYSTEM_STRING)
  static trim(@Meta(ArgName, 'str') @Meta(SchemaType, NS_SYSTEM_STRING) str: string = ""): string { return str.trim(); }

  @Meta(SchemaType, 'system.str.convert.tolower') @Meta(Return, NS_SYSTEM_STRING)
  static tolower(@Meta(ArgName, 'str') @Meta(SchemaType, NS_SYSTEM_STRING) str: string = ""): string { return str.toLowerCase(); }

  @Meta(SchemaType, 'system.str.convert.toupper') @Meta(Return, NS_SYSTEM_STRING)
  static toupper(@Meta(ArgName, 'str') @Meta(SchemaType, NS_SYSTEM_STRING) str: string = ""): string { return str.toUpperCase(); }

  @Meta(SchemaType, 'system.str.convert.reverse') @Meta(Return, NS_SYSTEM_STRING)
  static reverse(@Meta(ArgName, 'str') @Meta(SchemaType, NS_SYSTEM_STRING) str: string = ""): string { return str.split('').reverse().join(''); }

  @Meta(SchemaType, 'system.str.convert.padleft') @Meta(Return, NS_SYSTEM_STRING)
  static padleft(
    @Meta(ArgName, 'str') @Meta(SchemaType, NS_SYSTEM_STRING) str: string = "",
    @Meta(ArgName, 'totalWidth') @Meta(SchemaType, NS_SYSTEM_INT) totalWidth: number,
    @Meta(ArgName, 'paddingChar') @Meta(SchemaType, NS_SYSTEM_STRING) paddingChar?: string,
  ): string { return str.padStart(totalWidth, (paddingChar ?? ' ')[0]); }

  @Meta(SchemaType, 'system.str.convert.padright') @Meta(Return, NS_SYSTEM_STRING)
  static padright(
    @Meta(ArgName, 'str') @Meta(SchemaType, NS_SYSTEM_STRING) str: string = "",
    @Meta(ArgName, 'totalWidth') @Meta(SchemaType, NS_SYSTEM_INT) totalWidth: number,
    @Meta(ArgName, 'paddingChar') @Meta(SchemaType, NS_SYSTEM_STRING) paddingChar?: string,
  ): string { return str.padEnd(totalWidth, (paddingChar ?? ' ')[0]); }

  @Meta(SchemaType, 'system.str.convert.repeat') @Meta(Return, NS_SYSTEM_STRING)
  static repeat(
    @Meta(ArgName, 'str') @Meta(SchemaType, NS_SYSTEM_STRING) str: string = "",
    @Meta(ArgName, 'count') @Meta(SchemaType, NS_SYSTEM_INT) count: number,
  ): string { return str.repeat(Math.max(0, count)); }
}

// ── Map ────────────────────────────────────────────────────────────────────

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, 'system.str.map')
export class SystemStrMap {
  @Meta(SchemaType, 'system.str.map.tolocale') @Meta(Return, NS_SYSTEM_LOCALE_STRING) @Meta(Converter, true)
  static tolocale(
    @Meta(ArgName, 'str') @Meta(SchemaType, NS_SYSTEM_STRING) str?: string,
  ): { key: string } { return { key: str ?? '' }; }

  @Meta(SchemaType, 'system.str.map.tolocalestr') @Meta(Return, NS_SYSTEM_STRING) @Meta(Converter, true)
  static tolocalestr(
    @Meta(ArgName, 'locale') @Meta(SchemaType, NS_SYSTEM_LOCALE_STRING) locale?: { key: string },
  ): string { return locale?.key ?? ''; }

  @Meta(SchemaType, 'system.str.map.rectifylocale') @Meta(Return, NS_SYSTEM_LOCALE_STRING)
  static rectifylocale(
    @Meta(ArgName, 'locale') @Meta(SchemaType, NS_SYSTEM_LOCALE_STRING) locale: { key: string; trans?: { lang: string; tran: string }[] },
    @Meta(ArgName, 'defaultLang') @Meta(SchemaType, NS_SYSTEM_STRING) defaultLang?: string,
  ): { key: string; trans?: { lang: string; tran: string }[] } {
    if (!locale.key && locale.trans && locale.trans.length > 0) {
      const t = defaultLang
        ? locale.trans.find(t => t.lang.toLowerCase() === defaultLang.toLowerCase())
        : locale.trans[0];
      if (t) locale.key = t.tran;
    }
    return locale;
  }
}

// ── Util ───────────────────────────────────────────────────────────────────

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, 'system.str.util')
export class SystemStrUtil {
  @Meta(SchemaType, 'system.str.util.newguid') @Meta(Return, NS_SYSTEM_STRING) @Meta(ServerOnly, true) @Meta(NoCache, true)
  static newguid(): string {
    // Use crypto.randomUUID if available, fallback to manual
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }
}
