// =============================================================================
// NodeType — abstract base for all runtime types
// Mirrors C# SchemaNode.Core/Runtime/Type/NodeType.cs
//
// Each NodeType wraps a NodeSchema loaded from the runtime.
// Provides schema-level introspection: kind, name, generics, property access.
// =============================================================================

import type { NodeSchema } from '../../schema/nodeSchema';
import type { IProperty } from '../../property/property';
import type { GenericParameter } from '../../property/core/generics';

export abstract class NodeType {
  /** The wrapped schema — source of truth. */
  readonly schema: NodeSchema;

  /** Full qualified name (namespace.name, may include generic params). */
  readonly name: string;

  /** Schema kind string. */
  readonly kind: string;

  /** Generic template parameters (declared on the schema). */
  readonly generics?: GenericParameter[];

  /** Concrete generic type arguments (resolved at load time). */
  genericParams?: NodeType[];

  /** Load state. */
  loaded = false;

  constructor(schema: NodeSchema, genericParams?: NodeType[]) {
    this.schema = schema;
    this.name = schema.fullName;
    this.kind = schema.kind;
    this.genericParams = genericParams;

    // Read Generics from schema extensions
    const genericsProp = this.getPropertyFromExtensions<GenericParameter[]>('generics');
    this.generics = genericsProp;
  }

  /** Load type associations. Subclasses override for field/element type resolution. */
  load(): void {
    this.loaded = true;
  }

  // ── Property access via schema extensions ──────────────────────────────

  /** Get a single property value from schema extensions by name. */
  getProperty<T>(propName: string): T | undefined {
    return this.getPropertyFromExtensions<T>(propName);
  }

  /** Get stacked property values. */
  getProperties<T>(propName: string): T[] {
    const raw = this.schema.extensions?.[propName];
    if (!raw) return [];
    return Array.isArray(raw) ? raw as T[] : [raw as T];
  }

  private getPropertyFromExtensions<T>(key: string): T | undefined {
    return this.schema.extensions?.[key] as T | undefined;
  }
}
