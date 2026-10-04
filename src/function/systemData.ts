import { Meta } from "../attribute/meta";
import { OfNodeKind } from '../property/core/ofNodeKind';
import { SchemaType } from '../property/core/schemaType';

import { NODE_KIND_FUNCTION, NS_SYSTEM_DATA } from "../utility/constant";

@Meta(OfNodeKind, NODE_KIND_FUNCTION)
@Meta(SchemaType, NS_SYSTEM_DATA)
export class SystemData {}