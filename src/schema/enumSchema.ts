// =============================================================================
// EnumSchema — extension data under "enum" key
// =============================================================================

import { Meta } from '../attribute/meta';
import { SchemaKindRecord, NodeSchemaKindRecord, ValueSchemaKindRecord, SchemaType, Attach, ForSchema, OfSchema } from '../property/index';
import { Property } from '../property/property';
import { SCHEMA_KIND_ENUM, SCHEMA_KIND_NODE, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_ENUM, NS_SYSTEM_SCHEMA_PROPERTY_CORE } from '../utility/constant';
import { EnumValueType, type EnumValueTypeValue } from '../enum/enumValueType';

export interface EnumValueInfo {
  value: string;
  display?: string;
  children?: EnumValueInfo[];
}

export interface EnumValueAccess {
  value: string;
  hasSub?: boolean;
}

@Meta(SchemaKindRecord, [SCHEMA_KIND_ENUM, 8])
@Meta(NodeSchemaKindRecord, [SCHEMA_KIND_ENUM, 8])
@Meta(ValueSchemaKindRecord, [SCHEMA_KIND_ENUM, 8])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_ENUM}.schema`)
@Meta(Attach, SCHEMA_KIND_ENUM)
export class EnumSchema {
  type: EnumValueTypeValue = EnumValueType.String;
  cascade?: number;
  root?: string;
  values: EnumValueInfo[] = [];
}

@Meta(ForSchema, [SCHEMA_KIND_NODE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.enum`)
export class EnumProperty extends Property<EnumSchema> {}
