// =============================================================================
// PropertySchema — extension data under "property" key
// =============================================================================

import { Meta } from '../attribute/meta';
import { SchemaKindRecord, NodeSchemaKindRecord, SchemaType, Attach, Append, ForSchema, OfSchema } from '../property/index';
import { Property } from '../property/property';
import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_NODE, NS_SYSTEM_SCHEMA_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CORE } from '../utility/constant';

@Meta(SchemaKindRecord, [SCHEMA_KIND_PROPERTY, 12])
@Meta(NodeSchemaKindRecord, [SCHEMA_KIND_PROPERTY, 12])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY}.schema`)
@Meta(Attach, SCHEMA_KIND_PROPERTY)
export class PropertySchema {
  property: string = '';
  valueType?: string;
  depends?: string[];
  forSchemas?: string[];
  forValues?: string[];
  constraint?: boolean;
  typeref?: boolean;
  relationOnly?: boolean;
  convert?: boolean;
}

@Meta(ForSchema, [SCHEMA_KIND_NODE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.prop`)
export class PropProperty extends Property<PropertySchema> {}
