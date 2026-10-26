// =============================================================================
// system.calendar — date/time, timezone-free (browser local)
// Mirrors C# SchemaNode.Core/Function/SystemCalendar.cs
// =============================================================================

import { Meta } from '../attribute/meta';
import { OfNodeKind } from '../property/core/ofNodeKind';
import { SchemaType } from '../property/core/schemaType';
import { Return } from '../schema/function/property/return';
import { ArgName } from '../schema/function/property/argName';
import { NoCache } from '../schema/function/property/noCache';

import { NODE_KIND_FUNCTION, NS_SYSTEM_BOOL, NS_SYSTEM_FULL_DATE, NS_SYSTEM_INT, NS_SYSTEM_CALENDAR } from '../utility/constant';

// ── Helpers ────────────────────────────────────────────────────────────────

/** To local time start of day (00:00:00) in browser time zone */
function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** ISO week number (FirstFourDayWeek + Monday rule) */
function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7; // Sunday → 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum); // Move to first day of week number
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// ── Class ──────────────────────────────────────────────────────────────────

@Meta(OfNodeKind, NODE_KIND_FUNCTION)
@Meta(SchemaType, NS_SYSTEM_CALENDAR)
export class SystemCalendar {

  // ── Now ─────────────────────────────────────────────────────────────────

  /** Current local time in browser time zone */
  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_FULL_DATE)
  static now(): Date { return new Date(); }

  /** Today 00:00:00 */
  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_FULL_DATE)
  static today(): Date { return startOfDay(new Date()); }

  /** Tomorrow 00:00:00 */
  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_FULL_DATE)
  static tomorrow(): Date {
    const t = startOfDay(new Date());
    t.setDate(t.getDate() + 1);
    return t;
  }

  // ── Locale Info ────────────────────────────────────────────────────────

  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_INT)
  static getsecond(@Meta(ArgName, 'dt') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) dt: Date): number {
    return dt.getSeconds();
  }

  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_INT)
  static getminute(@Meta(ArgName, 'dt') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) dt: Date): number {
    return dt.getMinutes();
  }

  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_INT)
  static getday(@Meta(ArgName, 'dt') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) dt: Date): number {
    return dt.getDate();
  }

  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_INT)
  static getmonth(@Meta(ArgName, 'dt') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) dt: Date): number {
    return dt.getMonth() + 1; // JS 是 0-based
  }

  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_INT)
  static getyear(@Meta(ArgName, 'dt') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) dt: Date): number {
    return dt.getFullYear();
  }

  /** 0=Sunday … 6=Saturday */
  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_INT)
  static getweekday(@Meta(ArgName, 'dt') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) dt: Date): number {
    return dt.getDay();
  }

  /** ISO week number (FirstFourDayWeek + Monday rule) */
  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_INT)
  static getweekofyear(@Meta(ArgName, 'dt') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) dt: Date): number {
    return getISOWeek(dt);
  }

  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_INT)
  static getquarter(@Meta(ArgName, 'dt') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) dt: Date): number {
    return Math.floor(dt.getMonth() / 3) + 1;
  }

  // ── First Of … ─────────────────────────────────────────────────────────

  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_FULL_DATE)
  static getfirstofyear(@Meta(ArgName, 'date') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) date: Date): Date {
    return new Date(date.getFullYear(), 0, 1);
  }

  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_FULL_DATE)
  static getfirstofmonth(@Meta(ArgName, 'date') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_FULL_DATE)
  static getfirstofday(@Meta(ArgName, 'date') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) date: Date): Date {
    return startOfDay(date);
  }

  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_FULL_DATE)
  static getfirstofquarter(@Meta(ArgName, 'date') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) date: Date): Date {
    const month = Math.floor(date.getMonth() / 3) * 3; // 0, 3, 6, 9
    return new Date(date.getFullYear(), month, 1);
  }

  /** First day of week week number */
  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_FULL_DATE)
  static getfirstofweek(@Meta(ArgName, 'date') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) date: Date): Date {
    const d = startOfDay(date);
    const diff = (7 + d.getDay() - 1) % 7; // Monday=0 … Sunday=6
    d.setDate(d.getDate() - diff);
    return d;
  }

  // ── Last Of … ──────────────────────────────────────────────────────────

  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_FULL_DATE)
  static getlastofyear(@Meta(ArgName, 'date') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) date: Date): Date {
    return new Date(date.getFullYear(), 11, 31, 23, 59, 59);
  }

  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_FULL_DATE)
  static getlastofmonth(@Meta(ArgName, 'date') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) date: Date): Date {
    const firstNextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    firstNextMonth.setSeconds(firstNextMonth.getSeconds() - 1);
    return firstNextMonth;
  }

  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_FULL_DATE)
  static getlastofday(@Meta(ArgName, 'date') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) date: Date): Date {
    const start = startOfDay(date);
    start.setDate(start.getDate() + 1);
    start.setSeconds(start.getSeconds() - 1);
    return start;
  }

  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_FULL_DATE)
  static getlastofquarter(@Meta(ArgName, 'date') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) date: Date): Date {
    const month = Math.floor(date.getMonth() / 3) * 3; // 0, 3, 6, 9
    const firstNextQuarter = new Date(date.getFullYear(), month + 3, 1);
    firstNextQuarter.setSeconds(firstNextQuarter.getSeconds() - 1);
    return firstNextQuarter;
  }

  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_FULL_DATE)
  static getlastofweek(@Meta(ArgName, 'date') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) date: Date): Date {
    const mon = SystemCalendar.getfirstofweek(date);
    mon.setDate(mon.getDate() + 6);
    mon.setHours(23, 59, 59, 0);
    return mon;
  }

  // ── Span ────────────────────────────────────────────────────────────────

  /** Number of years between start and stop dates, inclusive */
  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_INT)
  static getyears(
    @Meta(ArgName, 'start') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) start: Date,
    @Meta(ArgName, 'stop') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) stop: Date,
  ): number {
    return stop.getFullYear() - start.getFullYear() + 1;
  }

  /** Number of months between start and stop dates, inclusive */ 
  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_INT)
  static getmonths(
    @Meta(ArgName, 'start') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) start: Date,
    @Meta(ArgName, 'stop') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) stop: Date,
  ): number {
    return (stop.getMonth() - start.getMonth() + 1) + 12 * (stop.getFullYear() - start.getFullYear());
  }

  /** Number of whole days between start and stop dates, inclusive */
  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_INT)
  static getdays(
    @Meta(ArgName, 'start') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) start: Date,
    @Meta(ArgName, 'stop') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) stop: Date,
  ): number {
    const diff = (stop.getTime() - start.getTime()) / 86400000;
    return diff >= 0 ? Math.ceil(diff) : -Math.ceil(-diff);
  }

  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_INT)
  static gethours(
    @Meta(ArgName, 'start') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) start: Date,
    @Meta(ArgName, 'stop') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) stop: Date,
  ): number {
    return Math.trunc((stop.getTime() - start.getTime()) / 3600000);
  }

  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_INT)
  static getminutes(
    @Meta(ArgName, 'start') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) start: Date,
    @Meta(ArgName, 'stop') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) stop: Date,
  ): number {
    return Math.trunc((stop.getTime() - start.getTime()) / 60000);
  }

  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_INT)
  static getseconds(
    @Meta(ArgName, 'start') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) start: Date,
    @Meta(ArgName, 'stop') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) stop: Date,
  ): number {
    return Math.trunc((stop.getTime() - start.getTime()) / 1000);
  }

  /** Number of days in the month of the specified date */
  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_INT)
  static getmonthdays(@Meta(ArgName, 'date') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  // ── Modify ──────────────────────────────────────────────────────────────

  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_FULL_DATE)
  static addseconds(
    @Meta(ArgName, 'dt') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) dt: Date,
    @Meta(ArgName, 'seconds') @Meta(SchemaType, NS_SYSTEM_INT) seconds: number,
  ): Date {
    const d = new Date(dt);
    d.setSeconds(d.getSeconds() + seconds);
    return d;
  }

  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_FULL_DATE)
  static addminutes(
    @Meta(ArgName, 'dt') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) dt: Date,
    @Meta(ArgName, 'min') @Meta(SchemaType, NS_SYSTEM_INT) min: number,
  ): Date {
    const d = new Date(dt);
    d.setMinutes(d.getMinutes() + min);
    return d;
  }

  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_FULL_DATE)
  static addhours(
    @Meta(ArgName, 'dt') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) dt: Date,
    @Meta(ArgName, 'hours') @Meta(SchemaType, NS_SYSTEM_INT) hours: number,
  ): Date {
    const d = new Date(dt);
    d.setHours(d.getHours() + hours);
    return d;
  }

  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_FULL_DATE)
  static adddays(
    @Meta(ArgName, 'dt') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) dt: Date,
    @Meta(ArgName, 'days') @Meta(SchemaType, NS_SYSTEM_INT) days: number,
  ): Date {
    const d = new Date(dt);
    d.setDate(d.getDate() + days);
    return d;
  }

  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_FULL_DATE)
  static addmonths(
    @Meta(ArgName, 'dt') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) dt: Date,
    @Meta(ArgName, 'months') @Meta(SchemaType, NS_SYSTEM_INT) months: number,
  ): Date {
    const d = new Date(dt);
    d.setMonth(d.getMonth() + months);
    return d;
  }

  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_FULL_DATE)
  static addyears(
    @Meta(ArgName, 'dt') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) dt: Date,
    @Meta(ArgName, 'year') @Meta(SchemaType, NS_SYSTEM_INT) year: number,
  ): Date {
    const d = new Date(dt);
    d.setFullYear(d.getFullYear() + year);
    return d;
  }

  // ── Compare ────────────

  /** Whether the date parts of two dates are the same (ignoring time) */
  private static _sameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate();
  }
  
  private static _dayGe(left: Date, right: Date): boolean {
    const ly = left.getFullYear(), ry = right.getFullYear();
    if (ly !== ry) return ly > ry;
    const lm = left.getMonth(), rm = right.getMonth();
    if (lm !== rm) return lm > rm;
    return left.getDate() >= right.getDate();
  }

  private static _dayGt(left: Date, right: Date): boolean {
    const ly = left.getFullYear(), ry = right.getFullYear();
    if (ly !== ry) return ly > ry;
    const lm = left.getMonth(), rm = right.getMonth();
    if (lm !== rm) return lm > rm;
    return left.getDate() > right.getDate();
  }

  private static _dayLe(left: Date, right: Date): boolean {
    return SystemCalendar._sameDay(left, right) || SystemCalendar._dayGe(right, left);
  }

  private static _dayLt(left: Date, right: Date): boolean {
    return SystemCalendar._dayGt(right, left);
  }

  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_BOOL)
  static eq(
    @Meta(ArgName, 'left') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) left: Date,
    @Meta(ArgName, 'right') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) right: Date,
  ): boolean {
    return SystemCalendar._sameDay(left, right);
  }

  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_BOOL)
  static ge(
    @Meta(ArgName, 'left') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) left: Date,
    @Meta(ArgName, 'right') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) right: Date,
  ): boolean {
    return SystemCalendar._dayGe(left, right);
  }

  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_BOOL)
  static gt(
    @Meta(ArgName, 'left') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) left: Date,
    @Meta(ArgName, 'right') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) right: Date,
  ): boolean {
    return SystemCalendar._dayGt(left, right);
  }

  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_BOOL)
  static le(
    @Meta(ArgName, 'left') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) left: Date,
    @Meta(ArgName, 'right') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) right: Date,
  ): boolean {
    return SystemCalendar._dayLe(left, right);
  }

  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_BOOL)
  static lt(
    @Meta(ArgName, 'left') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) left: Date,
    @Meta(ArgName, 'right') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) right: Date,
  ): boolean {
    return SystemCalendar._dayLt(left, right);
  }

  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_BOOL)
  static neq(
    @Meta(ArgName, 'left') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) left: Date,
    @Meta(ArgName, 'right') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) right: Date,
  ): boolean {
    return !SystemCalendar._sameDay(left, right);
  }

  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_FULL_DATE)
  static clamp(
    @Meta(ArgName, 'value') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) value: Date,
    @Meta(ArgName, 'min') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) min: Date,
    @Meta(ArgName, 'max') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) max: Date,
  ): Date {
    if (SystemCalendar._dayLt(value, min)) return min;
    if (SystemCalendar._dayGt(value, max)) return max;
    return value;
  }

  /** Number of whole days between two date ranges (inclusive) that overlap */
  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_INT)
  static overlapdays(
    @Meta(ArgName, 'a1') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) a1: Date,
    @Meta(ArgName, 'a2') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) a2: Date,
    @Meta(ArgName, 'b1') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) b1: Date,
    @Meta(ArgName, 'b2') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) b2: Date,
  ): number {
    const start = SystemCalendar._dayGt(a1, b1) ? a1 : b1;
    const end = SystemCalendar._dayLt(a2, b2) ? a2 : b2;
    if (SystemCalendar._dayGt(start, end)) return 0;
    return SystemCalendar.getdays(start, end);
  }

  /** Check if date is between min and max dates (inclusive) */
  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_BOOL)
  static between(
    @Meta(ArgName, 'date') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) date: Date,
    @Meta(ArgName, 'min') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) min: Date,
    @Meta(ArgName, 'max') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) max: Date,
  ): boolean {
    return SystemCalendar._dayGe(date, min) && SystemCalendar._dayLe(date, max);
  }

  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_BOOL)
  static isweekend(@Meta(ArgName, 'dt') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) dt: Date): boolean {
    const wd = dt.getDay();
    return wd === 0 || wd === 6;
  }

  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_BOOL)
  static isworkday(@Meta(ArgName, 'dt') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) dt: Date): boolean {
    return !SystemCalendar.isweekend(dt);
  }

  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_BOOL)
  static issameyear(
    @Meta(ArgName, 'a') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) a: Date,
    @Meta(ArgName, 'b') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) b: Date,
  ): boolean {
    return a.getFullYear() === b.getFullYear();
  }

  @Meta(NoCache, true)
  @Meta(Return, NS_SYSTEM_BOOL)
  static issamemonth(
    @Meta(ArgName, 'a') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) a: Date,
    @Meta(ArgName, 'b') @Meta(SchemaType, NS_SYSTEM_FULL_DATE) b: Date,
  ): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
  }
}
