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

  override *getRefTypes(): Generator<NodeType> {
    if (this.baseNode)
      yield this.baseNode;
    for (const type of super.getRefTypes())
      yield type;
  }

  override getProperty<T extends IProperty>(propCtor: new () => T): T | undefined {
    return super.getProperty(propCtor) ?? this.baseNode?.getProperty(propCtor);
  }

  override *getProperties<T extends IProperty>(propCtor: new () => T): Generator<T> {
    for(let p of super.getProperties(propCtor))
    {
      yield p;
      if (!p.stackable) return;
    }
    if (this.baseNode)
    {
      for (let p of this.baseNode.getProperties(propCtor))
      {
        yield p;
        if (!p.stackable) return;
      }
    }
  }
}
