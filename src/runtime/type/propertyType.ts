// =============================================================================
// PropertyType — runtime type for property schemas
// =============================================================================

import { NodeType } from './nodeType';
import type { NodeSchema } from '../../schema/nodeSchema';

export class PropertyType extends NodeType {
  /** Property key name. */
  property = '';

  /** Value type name (for type reference resolution). */
  valueType?: string;

  constructor(schema: NodeSchema) {
    super(schema);
    const propData = schema.extensions?.['property'] as PropertySchemaData | undefined;
    this.property = propData?.property ?? '';
    this.valueType = propData?.valueType;
  }
}

interface PropertySchemaData {
  property?: string;
  valueType?: string;
  forSchemas?: string[];
  constraint?: boolean;
  typeref?: boolean;
}
