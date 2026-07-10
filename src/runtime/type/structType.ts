// =============================================================================
// StructType — runtime type for struct schemas
// Mirrors C# SchemaNode.Core/Runtime/Type/StructType.cs
// =============================================================================

import { ValueType } from './valueType';
import { StructNode } from '../../node/structNode';
import type { NodeSchema } from '../../schema/nodeSchema';
import type { StructFieldSchema } from '../../schema/structSchema';
import { StructProperty } from '../../schema/structSchema';
import { getProperty } from '../../property/propertyOwner';

/** A resolved field type for a struct. */
export interface StructFieldType {
  name: string;
  typeName: string;
  type?: ValueType;
  seqno: number;
}

export class StructType extends ValueType {
  /** Field type definitions. */
  fields: StructFieldType[] = [];

  override async loadTypeAsync(schema: NodeSchema, genericParams?: import('./nodeType').NodeType[]): Promise<void> {
    await super.loadTypeAsync(schema, genericParams);

    // Load fields from StructProperty
    const structProp = getProperty(schema, StructProperty);
    const structData = structProp?.getValue<{ fields: StructFieldSchema[] }>();
    if (structData?.fields) {
      this.fields = structData.fields.map((f, i) => ({
        name: f.name,
        typeName: f.type,
        seqno: i,
      }));
    }
  }

  /** Get a field's type definition by name. */
  getField(name: string): StructFieldType | undefined {
    return this.fields.find((f) => f.name === name);
  }

  /** Get all field definitions. */
  getFields(): StructFieldType[] {
    return this.fields;
  }

  override create(): StructNode {
    return new StructNode(this);
  }
}
