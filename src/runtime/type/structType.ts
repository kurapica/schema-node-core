// =============================================================================
// StructType — runtime type for struct schemas
// Mirrors C# SchemaNode.Core/Runtime/Type/StructType.cs
// =============================================================================

import { ValueType } from './valueType';
import { StructNode } from '../../node/structNode';
import type { NodeSchema } from '../../schema/nodeSchema';
import type { StructFieldSchema } from '../../schema/structSchema';

export class StructType extends ValueType {
  /** Field type definitions. */
  fields: StructFieldType[] = [];

  constructor(schema: NodeSchema, genericParams?: ValueType[]) {
    super(schema, genericParams);
  }

  override load(): void {
    const structData = this.schema.extensions?.['struct'] as StructSchemaData | undefined;
    if (structData?.fields) {
      this.fields = structData.fields.map((f, i) => ({
        name: f.name,
        typeName: f.type,
        seqno: f.seqno ?? i,
      }));
    }
    super.load();
  }

  /** Get a field's ValueType by name. */
  getFieldType(name: string): StructFieldType | undefined {
    return this.fields.find((f) => f.name === name);
  }

  override create(): StructNode {
    return new StructNode(this.schema);
  }

  override getAccessValueType(path: string): ValueType | undefined {
    const dot = path.indexOf('.');
    const first = dot >= 0 ? path.substring(0, dot) : path;
    const rest = dot >= 0 ? path.substring(dot + 1) : '';
    if (first === '$self') return this;
    const field = this.getFieldType(first);
    if (!field?._resolvedType) return undefined;
    return rest ? field._resolvedType.getAccessValueType(rest) : field._resolvedType;
  }
}

export interface StructFieldType {
  name: string;
  typeName: string;
  seqno: number;
  /** Resolved at load time by the runtime context. */
  _resolvedType?: ValueType;
}

interface StructSchemaData {
  fields?: StructFieldSchema[];
}
