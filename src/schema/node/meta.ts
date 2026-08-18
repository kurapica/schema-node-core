// =============================================================================
// Mirrors C# SchemaNode.Core/Schema/NodeSchema.cs
// =============================================================================

import { Relation } from '../../attribute/relation';
import { Meta } from '../../attribute/meta';
import { SchemaLoadState } from '../../enum/schemaLoadState';
import { Base } from '../../property/core/base';
import { buildFuncCall } from '../../schema/function/type';
import { SchemaKind } from '../../property/record/schemaKind';
import { SchemaType } from '../../property/core/schemaType';
import { Attach } from '../../property/core/attach';
import { PrimaryIndex } from '../../property/core/indexes';
import { OfSchema } from '../../property/core/ofSchema';
import { UpLimitString } from '../../property/constraint/upLimit';
import { EntrySource } from '../../property/core/entrySource';
import { Valid } from '../../property/constraint/valid';
import { Require } from '../../property/constraint/require';
import { ReadOnly } from '../../property/common/readOnly';
import { Immutable } from '../../property/common/immutable';
import { RuntimeNodeType } from '../../property';
import { NodeType } from './runtime';

import type { CompatibleSchema, NodeSchema } from './type';

import { SCHEMA_KIND_NODE, NS_SYSTEM_SCHEMA_NODE, NS_SYSTEM_SCHEMA_NODE_TYPE, NS_SYSTEM_SCHEMA_NAMESPACE_TYPE, NS_SYSTEM_IDENTIFIER, NS_SYSTEM_SCHEMA_KIND, NS_SYSTEM_SCHEMA_ERROR, SCHEMA_KIND_STRING, NS_SYSTEM_STRING, NS_SYSTEM_SCHEMA_REFLECT, NODE_SELF, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_SCHEMA_REFLECT_IS_VALUE_KIND, PRIMARY_KEY_MAX_LEN, SCHEMA_KIND_ORDER_NODE, NS_SYSTEM_LOGIC, ENTRY_ROOT, NS_SYSTEM_SCHEMA_REFLECT_TYPE } from '../../utility/constant';


/** Represents the node kind */
@Meta(SchemaKind, [SCHEMA_KIND_NODE, SCHEMA_KIND_ORDER_NODE])
@Meta(RuntimeNodeType, NodeType)
class NodeKind {}

/**
 * The meta definition of the node schema
 */
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_NODE}.schema`)
@Meta(Attach, SCHEMA_KIND_NODE)
class NodeSchemaMeta implements NodeSchema {
  @Meta(PrimaryIndex, 0)
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_NAMESPACE_TYPE)
  @Relation(ReadOnly, 'call', buildFuncCall(`${NS_SYSTEM_LOGIC}.notempty`, "@name"))
  namespace?: string;

  @Meta(PrimaryIndex, 1)
  @Meta(SchemaType, NS_SYSTEM_IDENTIFIER)
  @Meta(Require, true)
  @Meta(Immutable, true)
  name: string = '';

  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_NODE}.kind`)
  @Meta(Require, true)
  kind: string = '';

  /** The error status */
  error?: string;

  /** Sub-schemas — only for namespace schemas. */
  schemas?: NodeSchema[];

  /** Compatible type names for coercion. */
  compatibles?: CompatibleSchema[];

  /** Schemas that reference (use) this one. */
  usedBy?: string[];

  /** Load state tracking. */
  loadState?: SchemaLoadState;
}

/** Represents the namespace type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_TYPE)
@Meta(Base, NS_SYSTEM_STRING)
@Meta(UpLimitString, PRIMARY_KEY_MAX_LEN)
@Meta(EntrySource, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_TYPE}.gettypeentries`, NODE_SELF, ENTRY_ROOT))
class AnyTypeMeta {}

/** Represents the value type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
@Meta(Base, NS_SYSTEM_SCHEMA_NODE_TYPE)
@Meta(Valid, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_VALUE_KIND, NODE_SELF))
class ValueTypeMeta {}
