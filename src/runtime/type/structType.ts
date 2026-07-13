// =============================================================================
// StructType — runtime type for struct schemas
// Mirrors C# SchemaNode.Core/Runtime/Type/StructType.cs
// =============================================================================

import { ValueType } from './valueType';
import { StructNode } from '../../node/structNode';
import { StructProperty, type StructFieldSchema } from '../../schema/structSchema';
import { getPropertiesBySchemaKind, getProperty } from '../../property/propertyOwner';
import type { INodeReference } from '../interfaces';
import type { IProperty } from '../../property/property';
import type { IConstraintProperty } from '../../property/constraintProperty';
import { NodeType } from './nodeType';
import { getNodeType } from '../schemaRuntime';
import { SCHEMA_KIND_STRUCT_FIELD, SCHEMA_KIND_STRUCT, NODE_SELF } from '../../utility/constant';
import { isEmpty } from '../../utility/toolset';
import type { Entry } from '../../struct/entry';

// ── StructType ────────────────────────────────────────────────────────────

export class StructType extends ValueType {
  /** Field type definitions. */
  private _fields: StructFieldType[] = [];

  /** Relation types (loaded from Relations property). */
  private _relations: RelationType[] | undefined;

  /** The struct schema data. */
  private _structSchema: { fields: StructFieldSchema[] } | undefined;

  // ── Loading ─────────────────────────────────────────────────────────

  override loadProperties(): IProperty[] {
    this._structSchema = getProperty(this.getNodeSchema(), StructProperty)?.getValue();
    return this._structSchema
      ? getPropertiesBySchemaKind(this._structSchema, SCHEMA_KIND_STRUCT)
      : [];
  }

  override async load(): Promise<void> {
    this._fields = [];
    this._relations = undefined;

    if (!this._structSchema?.fields) {
      if (this.schema) this.schema.error = 'NO_DEFINITION';
      return;
    }

    for (const field of this._structSchema.fields) {
      const fieldType = new StructFieldType();
      await fieldType.loadAsync(field, this.generics, this.genericParams);
      if (fieldType.error && this.schema) this.schema.error = fieldType.error;
      this._fields.push(fieldType);
    }

    // TODO: load relations from Relations property (similar to ArrayType)
  }

  override unload(): void {
    this._fields = [];
    this._relations = undefined;
  }

  // ── Field Access ────────────────────────────────────────────────────

  /** Get all field type definitions. */
  getFields(): StructFieldType[] { return this._fields; }

  /** Get a field by name (case-insensitive). */
  getField(name: string): StructFieldType | undefined {
    return this._fields.find(f => f.name.toLowerCase() === name.toLowerCase());
  }

  /** Get index of a field by name. */
  getFieldIndex(fieldName: string): number {
    return this._fields.findIndex(f => f.name.toLowerCase() === fieldName.toLowerCase());
  }

  // ── Path Navigation ─────────────────────────────────────────────────

  override getAccessValueType(path: string): ValueType | undefined {
    if (isEmpty(path) || path === NODE_SELF) return this;

    const dotIdx = path.indexOf('.');
    const first = dotIdx >= 0 ? path.substring(0, dotIdx) : path;
    const remain = dotIdx >= 0 ? path.substring(dotIdx + 1) : '';

    for (const field of this._fields) {
      if (first.toLowerCase() === field.name.toLowerCase()) {
        return remain ? field.type?.getAccessValueType(remain) : field.type;
      }
    }
    return undefined;
  }

  // ── Sub Entries ─────────────────────────────────────────────────────

  override getSubEntries(): Entry<string>[] {
    return this._fields
      .filter(f => f.type != null && !f.displayOnly)
      .map(f => ({ value: f.name } as Entry<string>));
  }

  override get hasSubEntries(): boolean {
    return this._fields.length > 0;
  }

  // ── References ──────────────────────────────────────────────────────

  override getRefTypes(): NodeType[] {
    const refs: NodeType[] = [];
    for (const field of this._fields) {
      if (field.type) refs.push(field.type as NodeType);
      if (field.refTypes) refs.push(...field.refTypes);
    }
    return refs.concat(super.getRefTypes());
  }

  // ── Type Compatibility ──────────────────────────────────────────────

  override isAssignableTo(other: ValueType): boolean {
    if (super.isAssignableTo(other)) return true;
    if (!(other instanceof StructType)) return false;

    // At least one common field, and all other fields are assignable
    const otherFields = other.getFields();
    const hasCommon = otherFields.some(v =>
      this._fields.some(f => f.name.toLowerCase() === v.name.toLowerCase()),
    );
    if (!hasCommon) return false;

    return otherFields.every(v => {
      const match = this._fields.find(
        f => f.name.toLowerCase() === v.name.toLowerCase(),
      );
      if (!match?.type) return !(v.require ?? false);
      return v.type != null && match.type.isAssignableTo(v.type);
    });
  }

  // ── DataNode Factory ────────────────────────────────────────────────

  override create(): StructNode {
    return new StructNode(this);
  }

  // ── Relations ───────────────────────────────────────────────────────

  /** Get all relation types. */
  getRelations(): RelationType[] {
    return this._relations ?? [];
  }

  /** Get relations for a specific field name. */
  getRelationsForField(fieldName: string): RelationType[] {
    return (this._relations ?? []).filter(
      r => r.target?.toLowerCase() === fieldName.toLowerCase(),
    );
  }
}

// ── StructFieldType ────────────────────────────────────────────────────────

export class StructFieldType implements INodeReference {
  /** The field name. */
  name = '';

  /** The resolved value type. */
  type?: ValueType;

  /** All properties (from schema extensions). */
  properties?: IProperty[];

  /** Constraint properties (subset of properties). */
  constraints?: IConstraintProperty[];

  /** Referenced types from property values. */
  refTypes?: NodeType[];

  /** Whether the field is required. */
  require?: boolean;

  /** Whether the field is display-only. */
  displayOnly?: boolean;

  /** Error status. */
  error?: string;

  // ── Loading ─────────────────────────────────────────────────────────

  /**
   * Load field from StructFieldSchema. Resolves the type name via getNodeType,
   * collects properties and constraints.
   */
  async loadAsync(
    field: StructFieldSchema,
    generics?: import('../../property/core/generics').GenericParameter[],
    genericParams?: NodeType[],
  ): Promise<void> {
    this.name = field.name;

    // Resolve the field's value type
    this.type = await getNodeType(field.type, generics, genericParams) as ValueType | undefined;
    if (!this.type) {
      this.error = 'STRUCT_FIELD_WRONG_TYPE';
      return;
    }

    // Collect properties from schema kind registries
    const valueType = this.type instanceof ArrayType ? this.type.element : this.type;
    const props = getPropertiesBySchemaKind(field, SCHEMA_KIND_STRUCT_FIELD);
    if (valueType) {
      props.push(...getPropertiesBySchemaKind(field, valueType.kind));
    }

    this.properties = props;
    this.constraints = props.filter(
      p => 'validate' in p || 'validateAsync' in p,
    ) as IConstraintProperty[];

    // Useful flags
    this.require = props.find(p => p.name === 'require')?.getValue<boolean>() ?? undefined;
    this.displayOnly = props.find(p => p.name === 'displayonly')?.getValue<boolean>() ?? undefined;
  }

  // ── Reference Types ─────────────────────────────────────────────────

  getReferenceTypes(): NodeType[] {
    const refs: NodeType[] = [];
    if (this.type) refs.push(this.type as NodeType);
    if (this.refTypes) refs.push(...this.refTypes);
    return refs;
  }
}

// Re-import for internal use (circular dependency workaround)
import { RelationType } from './relationType';
import { ArrayType } from './arrayType';