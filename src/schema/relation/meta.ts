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
import { EntrySourceConsumer } from '../string/property/entrySourceConsumer';
import { DisplayOnly } from '../struct/property/displayOnly';
import { Assign } from '../../relation/assign/meta';
import { AccessValueTypeResolver } from '../string/property/accessValueTypeResolver';

import type { RelationSchema } from './type';

import { SCHEMA_KIND_NODE_RELATION, NS_SYSTEM_SCHEMA_RELATION, SCHEMA_KIND_ORDER_RELATION, NS_SYSTEM_STRING, NS_SYSTEM_SCHEMA_RELATION_KIND, NS_SYSTEM_SCHEMA_REFLECT_PROPERTY, NODE_SELF, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_SCHEMA_REFLECT_TYPE, NS_SYSTEM_SCHEMA_PRO, NS_SYSTEM_STR } from '../../utility/constant';
import { KindResolver } from '../string';
import { InVisible } from '../../property/common/invisible';
import { EntrySource } from '../../property/core/entrySource';

/** Meta registration class (NOT exported). */
@Meta(SchemaKind, [SCHEMA_KIND_NODE_RELATION, SCHEMA_KIND_ORDER_RELATION])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_RELATION}.schema`)
@Meta(Attach, SCHEMA_KIND_NODE_RELATION)
class RelationSchemaMeta implements RelationSchema {
  /** The target of the relation */
  @Meta(SchemaType, NS_SYSTEM_STRING)
  @Meta(PrimaryIndex, 0)
  @Meta(EntrySourceConsumer, true)
  @Meta(Require, true)
  target!: string;

  /** The value type of the target */
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
  @Meta(DisplayOnly, true)
  @Meta(AccessValueTypeResolver, 'target')
  targetType?: string;

  /** The kind of the target */
  @Meta(SchemaType, NS_SYSTEM_STRING)
  @Meta(DisplayOnly, true)
  @Relation(Default, 'call', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_TYPE}.getschemakind`, '@targetType'))
  targetKind?: string;

  /** The owner kind of the property */
  @Meta(SchemaType, NS_SYSTEM_STRING)
  @Meta(KindResolver, true)
  @Meta(DisplayOnly, true)
  ownerKind?: boolean;

  /** The property the relation applies to */
  @Meta(SchemaType, NS_SYSTEM_STRING)
  @Meta(PrimaryIndex, 1)
  @Meta(Require, true)
  @Relation(EntrySource, Assign, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_PROPERTY}.getkindproperties`, '@targetKind', '@ownerKind'), 'property')
  property!: string;

  /** The value type of the property */
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
  @Meta(DisplayOnly, true)
  @Meta(InVisible, true)
  @Relation(Default,'call', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_PROPERTY}.getkindpropvaluetype`, '@property', '@targetKind', '@ownerKind'))
  valueType?: string;

  /** The relation kind */
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_RELATION_KIND)
  kind!: string;
}
