// =============================================================================
// RelationSchema — extension data under "relation" key
// =============================================================================

import { Relation } from '../../attribute/relation';
import { Meta } from '../../attribute/meta';
import { SchemaKind } from '../../property/record/schemaKind';
import { SchemaType } from '../../property/core/schemaType';
import { Attach } from "../../schema/struct/property/attach";
import { PrimaryIndex } from '../../property/core/indexes';
import { Valid } from '../../property/common/valid';
import { buildFuncCall } from '../../schema/function/type';
import { Require } from '../../property/common/require';
import { Default } from '../../property/common/default';
import { InVisible } from '../../property/common/invisible';

import type { RelationSchema } from './type';

import { SCHEMA_KIND_RELATION, NS_SYSTEM_SCHEMA_RELATION, SCHEMA_KIND_ORDER_RELATION, NS_SYSTEM_STRING, NS_SYSTEM_SCHEMA_PRO_TYPE, NS_SYSTEM_SCHEMA_RELATION_KIND, NS_SYSTEM_SCHEMA_KIND, NS_SYSTEM_SCHEMA_REFLECT_PROPERTY, NODE_SELF, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_SCHEMA_REFLECT_TYPE, NS_SYSTEM_SCHEMA_PRO } from '../../utility/constant';
import { EntrySourceConsumer } from '../string/property/entrySourceConsumer';
import { Root } from '../enum/property/root';
import { DisplayOnly } from '../struct/property/displayOnly';
import { AccessValueTypeProvider } from '../../property';
import { AccessValueTypeResolver } from '../string';

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

  @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
  @Meta(DisplayOnly, true)
  @Meta(AccessValueTypeResolver, 'target')
  targetType?: string;

  /** The property the relation applies to */
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_PRO_TYPE)
  @Meta(PrimaryIndex, 1)
  @Meta(Require, true)
  @Meta(Valid, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_PROPERTY}.notstatic`, NODE_SELF))
  @Meta(Root, NS_SYSTEM_SCHEMA_PRO)
  property!: string;

  /** The value type of the property */
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
  @Meta(DisplayOnly, true)
  @Relation(Default,'call', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_PROPERTY}.getvaluetype`, '@property', '@targetType'))
  valueType?: string;

  /** The relation kind */
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_RELATION_KIND)
  kind!: string;
}
