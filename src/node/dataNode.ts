// =============================================================================
// DataNode — abstract base for all data-holding nodes
// Mirrors C# SchemaNode.Core/Node/DataNode.cs
// =============================================================================

import type { ValueType } from '../runtime/type/valueType';
import type { IProperty } from '../property/property';

/**
 * A DataNode holds a value (or children) governed by a runtime ValueType.
 * Violated constraints track validation status: undefined = never validated.
 */
export abstract class DataNode {
  /** The runtime value type (schema + runtime info). */
  readonly type: ValueType;

  /** Violated constraint names. undefined = never validated, [] = valid. */
  private _violated?: string[];

  // ── Constructor ────────────────────────────────────────────────────────

  constructor(type: ValueType) {
    this.type = type;
  }

  // ── Value Access ────────────────────────────────────────────────────────

  /** Whether this node holds no value. */
  abstract get isEmpty(): boolean;

  /** Try to set a typed value. Returns true on success. */
  abstract trySetValue<T>(value: T): boolean;

  /** Try to get the value as a specific type. */
  abstract tryGetValue<T>(): T | undefined;

  /** Clear the stored value. */
  clearValue(): void { this.trySetValue(null); }

  // ── Path Navigation ────────────────────────────────────────────────────

  /**
   * Navigate a dotted path relative to this node.
   * Mirrors C# DataNode.GetAccessValue(string path).
   * Supports: $self, field names, array indices.
   */
  getAccessValue(path: string): DataNode | undefined {
    if (!path || path === '$self') return this;

    // Split by '.' for compound paths
    const parts = path.split('.');
    let current: DataNode | undefined = this;
    for (const part of parts) {
      if (!current) return undefined;
      current = current.getAccessValue(part);
    }
    return current;
  }

  // ── Validation ─────────────────────────────────────────────────────────

  /** Violated constraint names. undefined = never validated. */
  get violated(): string[] | undefined { return this._violated; }

  /** Whether the node passed all constraint validations. */
  get isValid(): boolean { return !this._violated || this._violated.length === 0; }

  /** Set violated (and optional passed) constraints. */
  setViolated(
    violated?: IProperty[] | string[] | null,
    passed?: IProperty[] | string[] | null,
    reset?: boolean,
  ): void {
    const toNames = (items?: IProperty[] | string[] | null): string[] =>
      !items ? [] : items.map(i => typeof i === 'string' ? i : i.name);

    const vNames = toNames(violated);
    const pNames = toNames(passed);

    let result = reset || !this._violated
      ? vNames
      : [...this._violated, ...vNames];

    result = result.filter(n => !pNames.includes(n));
    this._violated = result.length > 0 ? result : [];
  }

  /** Clear specific passed constraints. */
  clearViolated(passed?: IProperty[] | string[]): void {
    this.setViolated(null, passed, false);
  }

  // ── Cloning ────────────────────────────────────────────────────────────

  /** Clone this data node. */
  abstract clone(): DataNode;

  // ── Equals ─────────────────────────────────────────────────────────────

  /** Equality check. */
  equals(other: DataNode | undefined): boolean {
    if (!other) return this.isEmpty;
    if (this === other) return true;
    if (this.isEmpty) return other.isEmpty;
    return this.tryGetValue<unknown>() === other.tryGetValue<unknown>();
  }

  // ── String conversion ──────────────────────────────────────────────────

  toString(): string {
    const val = this.tryGetValue<string>();
    return val ?? '';
  }
}
