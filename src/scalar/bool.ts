import { Meta } from '../attribute/meta';
import { OfNodeKind } from '../property/core/ofNodeKind';
import { SchemaType } from '../property/core/schemaType';

import { NODE_KIND_BOOL, NS_SYSTEM_BOOL } from '../utility/constant';

/** Represents the boolean type */
@Meta(OfNodeKind, NODE_KIND_BOOL)
@Meta(SchemaType, NS_SYSTEM_BOOL)
class BoolMeta {}