// =============================================================================
// RelationSchema — extension data under "relation" key
// =============================================================================

import { Meta } from '../attribute/meta';
import { SchemaKind, SchemaType, Attach, ForSchema, OfSchema } from '../property/index';
import { Property } from '../property/property';
import { SCHEMA_KIND_RELATION, SCHEMA_KIND_NODE, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_RELATION, NS_SYSTEM_SCHEMA_PROPERTY_CORE } from '../utility/constant';

/** Pure data interface. */
export interface RelationSchema {
  target: string;
  property: string;
  stage: number;
  kind: string;
}

/** Meta registration class (NOT exported). */
@Meta(SchemaKind, [SCHEMA_KIND_RELATION, 13])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_RELATION}.schema`)
@Meta(Attach, SCHEMA_KIND_RELATION)
class RelationSchemaMeta implements RelationSchema {
  target: string = '';
  property: string = '';
  stage: number = 0;
  kind: string = '';
}

@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.relations`)
export class Relations extends Property<RelationSchema[]> {}
