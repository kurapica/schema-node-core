// =============================================================================
// DataNode — abstract base for all data-holding nodes
// Mirrors C# SchemaNode.Core/Node/DataNode.cs
//
// Key differences from C#:
//   - schema: NodeSchema (not ValueType) — registered schema IS the runtime type
//   - getProperty() cascades: parent override → schema fallback → stackable accumulate
//   - No Rule/RuleSchema — relation + property system is the core mechanism
// =============================================================================

import type { NodeSchema } from '../schema/nodeSchema';
import type { IProperty } from '../property/property';
import type { IPropertyOwner } from '../property/propertyOwner';
import { getPropertyTyped, getPropertiesTyped } from '../property/propertyOwner';
import { Stackable } from '../property/core/stackable';
import type { IConstraintProperty } from '../property/constraintProperty';
import { ExtensibleSchema } from '../schema/extensibleSchema';

/**
 * A DataNode holds a value (or children) governed by a registered NodeSchema.
 * It supports property cascading: parent-provided properties override schema defaults.
 * Stackable properties (constraints) accumulate through the hierarchy.
 */
export abstract class DataNode implements IPropertyOwner {
  /** The registered schema this node conforms to. */
  readonly schema: NodeSchema;

  /** Optional parent node (struct field container, array container). */
  readonly parent?: DataNode;

  /** Property overrides provided by the parent (or creator). */
  private _propertyOverrides?: Record<string, unknown>;

  /** Violated constraint names. undefined = never validated, [] = valid, [...] = invalid. */
  private _violated?: string[];

  // ── Constructor ────────────────────────────────────────────────────────

  constructor(schema: NodeSchema, parent?: DataNode, propertyOverrides?: Record<string, unknown>) {
    this.schema = schema;
    this.parent = parent;
    this._propertyOverrides = propertyOverrides;
  }

  // ── Property Cascading ─────────────────────────────────────────────────

  getProperty(propCtor: new () => IProperty): IProperty | undefined {
    const temp = new propCtor();
    const name = temp.name;

    // 1. Check parent-provided overrides
    if (this._propertyOverrides && name in this._propertyOverrides) {
      const raw = this._propertyOverrides[name];
      temp.setValue(raw);
      return temp;
    }

    // 2. Fall back to schema extensions
    return this.schema.getProperty(propCtor);
  }

  getProperties(propCtor: new () => IProperty): IProperty[] {
    const results: IProperty[] = [];
    const temp = new propCtor();
    const name = temp.name;
    const isStackable = this._isStackable(propCtor);

    // 1. Schema properties
    const schemaProps = this.schema.getProperties(propCtor);

    // 2. Parent override properties
    if (this._propertyOverrides && name in this._propertyOverrides) {
      const raw = this._propertyOverrides[name];
      if (Array.isArray(raw) && isStackable) {
        for (const v of raw) {
          const p = new propCtor();
          p.setValue(v);
          results.push(p);
        }
      } else {
        const p = new propCtor();
        p.setValue(raw);
        if (isStackable) {
          results.push(...schemaProps.filter((sp) => sp.hasValue));
          results.push(p);
        } else {
          results.push(p);
          return results;
        }
      }
    } else {
      results.push(...schemaProps);
    }

    return results;
  }

  setProperty(property: IProperty): void {
    this.schema.setProperty(property);
  }

  private _isStackable(propCtor: new () => IProperty): boolean {
    // Check if the property class has @Meta(Stackable) or implements stacking behavior
    const temp = new propCtor();
    return temp.stackable;
  }

  // ── Data Access ────────────────────────────────────────────────────────

  /** Whether this node holds no value. */
  abstract get isEmpty(): boolean;

  /** Try to set a typed value. Returns true on success. */
  abstract trySetValue<T>(value: T): boolean;

  /** Try to get the value as a specific type. */
  abstract tryGetValue<T>(): T | undefined;

  // ── Path Navigation ────────────────────────────────────────────────────

  /**
   * Navigate a dotted path relative to this node.
   * Supports: $self, $previous (in arrays), $element, field names.
   */
  getAccessValue(path: string): DataNode | undefined {
    if (!path || path === '$self') return this;
    // Subclasses override for struct field access, array element access
    return undefined;
  }

  // ── Validation ─────────────────────────────────────────────────────────

  /** Violated constraint names. undefined = never validated. */
  get violated(): string[] | undefined {
    return this._violated;
  }

  /** Whether the node passed all constraint validations. */
  get isValid(): boolean {
    return this._violated === undefined || this._violated.length === 0;
  }

  /**
   * Run all applicable constraint validations.
   * Stackable constraints accumulate from parent → schema.
   */
  validate(): void {
    const violated: string[] = [];
    const passed: string[] = [];

    // Get all constraint properties (stacked from parent + schema)
    const constraintProps = this._collectConstraints();

    for (const prop of constraintProps) {
      if (!prop.hasValue) continue;
      const result = prop.validate(this);
      if (result === false) {
        violated.push(prop.name);
      } else if (result === true) {
        passed.push(prop.name);
      }
    }

    this._violated = violated.length > 0 ? violated : [];
  }

  /** Collect all constraint properties through the cascading chain. */
  private _collectConstraints(): IConstraintProperty[] {
    const constraints: IConstraintProperty[] = [];
    // Collect from schema
    if (this.schema.extensions) {
      for (const [key, raw] of Object.entries(this.schema.extensions)) {
        // We can't know which properties are IConstraintProperty without the registry
        // This will be refined when the property registry is integrated
      }
    }
    return constraints;
  }
}
