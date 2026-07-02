// =============================================================================
// GenericType — placeholder for unresolved generic type parameters
// =============================================================================

import { ValueType } from './valueType';
import type { NodeSchema } from '../../schema/nodeSchema';
import { AnyNode } from '../../node/scalarNode';

export class GenericType extends ValueType {
  constructor(schema: NodeSchema) {
    super(schema);
  }

  override create(): AnyNode {
    return new AnyNode(this.schema);
  }
}
