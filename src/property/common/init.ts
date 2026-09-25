import { FuncCallProperty } from '../funcCallProperty';
import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PRO_COMMON, NS_SYSTEM_SCHEMA_FUNC_CALL, NS_SYSTEM_SCHEMA_FUNC_TYPE } from '../../utility/constant';

/** The init property to init the node value, not effect directly, require its parent node to init, like array node add a row. */
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_COMMON}.init`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_FUNC_CALL}<${NS_SYSTEM_SCHEMA_FUNC_TYPE}>`)
export class Init extends FuncCallProperty{}
