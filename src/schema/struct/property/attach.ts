// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Core/Attach.cs
// =============================================================================

import { Property } from '../../../property/property';
import { ForSchema } from '../../../property/core/forSchema';
import { Meta } from '../../../attribute/meta';

import { OfNodeKind } from '../../../property/core/ofNodeKind';
import { SchemaType } from '../../../property/core/schemaType';
import { PropertyValueType } from '../../../property/core/propertyValueType';
import { Static } from '../../../property/core/static';
import { ReadOnly } from '../../../property/common/readOnly';
import { InVisible } from '../../../property/common/invisible';

import { NS_SYSTEM_SCHEMA, SCHEMA_KIND_NODE_STRUCT, NS_SYSTEM_SCHEMA_PRO_CORE, NODE_KIND_PROPERTY } from '../../../utility/constant';
/**
 * Attach the properties of a schema kind to the struct type
 */
@Meta(ForSchema, [SCHEMA_KIND_NODE_STRUCT])
@Meta(OfNodeKind, NODE_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_CORE}.attach`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA}.kind`)
@Meta(Static, true)
@Meta(ReadOnly, true)
@Meta(InVisible, true)
export class Attach extends Property<string> {}
