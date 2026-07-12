// =============================================================================
// ScalarType — abstract base for scalar runtime types
// Mirrors C# SchemaNode.Core/Runtime/Type/ScalarType.cs
// =============================================================================

import { IProperty } from "../../property";
import { NodeType } from "./nodeType";
import { ValueType } from "./valueType";

export abstract class ScalarType extends ValueType {
  /** Base type for scalar inheritance. */
  baseNode?: ScalarType;

  override isAssignableTo(other: ValueType): boolean {
    return this.kind.toLowerCase() === other.kind.toLowerCase() || super.isAssignableTo(other);
  }

  override getRefTypes(): NodeType[] {
    return this.baseNode ? [this.baseNode as NodeType].concat(super.getRefTypes()) : super.getRefTypes();
  }

  override getProperty<T extends IProperty>(propCtor: new () => T): T | undefined {
    return super.getProperty(propCtor) ?? this.baseNode?.getProperty(propCtor);
  }

  override getProperties<T extends IProperty>(propCtor: new () => T): T[] {
    const props = super.getProperties(propCtor);
    if (props?.length) return props;
    return this.baseNode?.getProperties(propCtor) ?? [];
  }
}
