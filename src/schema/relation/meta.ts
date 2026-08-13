// =============================================================================
// RelationSchema — extension data under "relation" key
// =============================================================================

import { Relation } from '../../attribute/relation';
import { Meta } from '../../attribute/meta';
import { RelationStage } from '../../enum/relationStage';
import { SchemaKind } from '../../property/record/schemaKind';
import { SchemaType } from '../../property/core/schemaType';
import { Attach } from '../../property/core/attach';
import { PrimaryIndex } from '../../property/core/indexes';
import { EntrySourceConsumer } from '../../property/core/entrySourceConsumer';
import { Valid } from '../../property/constraint/valid';
import { buildFuncCall } from '../../schema/function/type';
import { Require } from '../../property/constraint/require';
import { DisplayOnly } from '../../property/common/displayOnly';
import { Default } from '../../property/common/default';
import { InVisible } from '../../property/common/invisible';
import { AccessValueTypeResolver } from '../../property/core/accessValueTypeResolver';

import type { RelationSchema } from './type';

import { SCHEMA_KIND_RELATION, NS_SYSTEM_SCHEMA_RELATION, SCHEMA_KIND_ORDER_RELATION, NS_SYSTEM_STRING, NS_SYSTEM_SCHEMA_PROPERTY_TYPE, NS_SYSTEM_SCHEMA_RELATION_TYPE, NS_SYSTEM_SCHEMA_RELATION_KIND, NS_SYSTEM_SCHEMA_KIND, NS_SYSTEM_SCHEMA_REFLECT_PROPERTY, NODE_SELF, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_SCHEMA_REFLECT_TYPE } from '../../utility/constant';

/** Meta registration class (NOT exported). */
@Meta(SchemaKind, [SCHEMA_KIND_RELATION, SCHEMA_KIND_ORDER_RELATION])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_RELATION}.schema`)
@Meta(Attach, SCHEMA_KIND_RELATION)
class RelationSchemaMeta implements RelationSchema {
  /** The target of the relation */
  @Meta(SchemaType, NS_SYSTEM_STRING)
  @Meta(PrimaryIndex, 0)
  @Meta(EntrySourceConsumer, true)
  @Meta(Require, true)
  target!: string;

  /** The schema type of the target */
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
  @Meta(DisplayOnly, true)
  @Meta(InVisible, true)
  @Meta(AccessValueTypeResolver, "target")
  targetType?: string;

  /** The schema kind of the target */
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_KIND)
  @Meta(DisplayOnly, true)
  @Meta(InVisible, true)
  @Relation(Default,'call', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_TYPE}.getschemakind`, '@targetType'))
  targetKind?: string;

  /** The property the relation applies to */
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_PROPERTY_TYPE)
  @Meta(PrimaryIndex, 1)
  @Meta(Require, true)
  @Meta(Valid, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_PROPERTY}.notstatic`, NODE_SELF))
  @Meta(Valid, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_PROPERTY}.forschema`, NODE_SELF, '@targetKind'))
  property!: string;

  /** The value type of the property */
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
  @Meta(DisplayOnly, true)
  @Meta(InVisible, true)
  @Relation(Default,'call', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_PROPERTY}.getvaluetype`, '@property'))
  valueType?: string;

  /** The stage of the realtion been applied */
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_RELATION_TYPE)
  stage!: RelationStage;

  /** The relation kind */
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_RELATION_KIND)
  kind!: string;
}
