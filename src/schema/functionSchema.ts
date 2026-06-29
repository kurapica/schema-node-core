// =============================================================================
// FunctionSchema — extension data under "func" key
// =============================================================================

import { Meta } from '../attribute/meta';
import { SchemaKindRecord, NodeSchemaKindRecord, SchemaType, Attach, ForSchema, OfSchema } from '../property/index';
import { Property } from '../property/property';
import { SCHEMA_KIND_FUNCTION, SCHEMA_KIND_NODE, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_FUNC, NS_SYSTEM_SCHEMA_PROPERTY_CORE } from '../utility/constant';
import type { GenericParameter } from '../property/core/generics';

export interface FunctionArgumentInfo { name: string; type: string; optional?: boolean; }
export interface FunctionExpression { type: string; func?: string; args?: FunctionExpression[]; value?: unknown; }

@Meta(SchemaKindRecord, [SCHEMA_KIND_FUNCTION, 11])
@Meta(NodeSchemaKindRecord, [SCHEMA_KIND_FUNCTION, 11])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_FUNC}.schema`)
@Meta(Attach, SCHEMA_KIND_FUNCTION)
export class FunctionSchema {
  return: string = '';
  args: FunctionArgumentInfo[] = [];
  exps: FunctionExpression[] = [];
  generic?: GenericParameter[];
  converter?: boolean;
  server?: boolean;
  nocache?: boolean;
  sideEffect?: boolean;
}

@Meta(ForSchema, [SCHEMA_KIND_NODE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.func`)
export class FuncProperty extends Property<FunctionSchema> {}
