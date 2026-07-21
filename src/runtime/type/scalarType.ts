// =============================================================================
// ScalarType — abstract base for scalar runtime types
// Mirrors C# SchemaNode.Core/Runtime/Type/ScalarType.cs
// =============================================================================

import { IProperty } from "../../property";
import { joinProperties } from "../interfaces";
import { filterSchemaKindProperties, getSchemaKindProperties, getSchemaKindProperty } from "../schemaRuntime";
import { NodeType } from "./nodeType";
import { ValueType } from "./valueType";

export abstract class ScalarType extends ValueType {
  /** Base type for scalar inheritance. */
  baseNode?: ScalarType;

  override isAssignableTo(other: ValueType): boolean {
    return this.kind.toLowerCase() === other.kind.toLowerCase() || super.isAssignableTo(other);
  }

  override *getRefTypes(): Generator<NodeType> {
    if (this.baseNode)
      yield this.baseNode;
    for (const type of super.getRefTypes())
      yield type;
  }

  override getProperty<T extends IProperty>(propCtor: new () => T): T | undefined {
    return super.getProperty(propCtor) ?? (this.baseNode ? this.baseNode.getProperty(propCtor) : getSchemaKindProperty(this.kind, propCtor));
  }

  override *getProperties<T extends IProperty>(propCtor: new () => T): Generator<T> {
    // self -> base -> prototype
    return joinProperties(super.getProperties(propCtor), (this.baseNode ? this.baseNode.getProperties(propCtor) : getSchemaKindProperties(this.kind, propCtor)));
  }

  override filterProperties(predicate: (prop: IProperty) => boolean): Generator<IProperty> {
    return joinProperties(super.filterProperties(predicate), (this.baseNode ? this.baseNode.filterProperties(predicate) : filterSchemaKindProperties(this.kind, predicate)));
  }
}
