// =============================================================================
// ObjectSchema — arbitrary JSON value container
// =============================================================================

import { Meta } from '../attribute/meta';
import { SchemaKindRecord, NodeSchemaKindRecord, ValueSchemaKindRecord, SchemaType, Attach, ForSchema, OfSchema } from '../property/index';
import { Property } from '../property/property';
import { SCHEMA_KIND_OBJECT, SCHEMA_KIND_NODE, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_OBJECT, NS_SYSTEM_SCHEMA_PROPERTY_CORE } from '../utility/constant';

@Meta(SchemaKindRecord, [SCHEMA_KIND_OBJECT, 2])
@Meta(NodeSchemaKindRecord, [SCHEMA_KIND_OBJECT, 2])
@Meta(ValueSchemaKindRecord, [SCHEMA_KIND_OBJECT, 2])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_OBJECT}.schema`)
@Meta(Attach, SCHEMA_KIND_OBJECT)
export class ObjectSchema {
}

@Meta(ForSchema, [SCHEMA_KIND_NODE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.object`)
export class ObjectProperty extends Property<ObjectSchema> {}
