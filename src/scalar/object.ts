import { Meta } from '../attribute/meta';
import { OfNodeKind } from '../property/core/ofNodeKind';
import { SchemaType } from '../property/core/schemaType';

import { NODE_KIND_OBJECT, NS_SYSTEM_OBJECT } from '../utility/constant';

/** Represents the object type */
@Meta(OfNodeKind, NODE_KIND_OBJECT)
@Meta(SchemaType, NS_SYSTEM_OBJECT)
class ObjectMeta {}
