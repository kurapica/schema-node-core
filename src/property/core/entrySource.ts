import { buildFuncCall, FuncCallProperty } from '../funcCallProperty';
import { Meta } from '../../attribute/meta';
import { OfSchema } from './ofSchema';
import { ForSchema } from './forSchema';
import { SchemaType } from './schemaType';
import { Valid } from '../constraint/valid';
import { PropertyValueType } from './propertyValueType';
import { Property } from '../property';
import { Static } from './static';
import { InVisible } from '../common/invisible';
import { ReadOnly } from '../common/readOnly';
import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_INT, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_STRING, NS_SYSTEM_SCHEMA_PROPERTY_CORE, NS_SYSTEM_ENTRY, NODE_SELF, NS_SYSTEM_SCHEMA_REFLECT_FUNC, NS_SYSTEM_LIST, NS_SYSTEM_SCHEMA_PROPERTY, NS_SYSTEM_ENTRY_ACCESS } from '../../utility/constant';
import { Relation } from '../../attribute/relation';
import { Assign } from '../../relation/assign';

/** The entry source function */
@Meta(ForSchema, [SCHEMA_KIND_INT, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_STRING])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.entrysource`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_PROPERTY}.funccall`)
@Relation(Valid, Assign, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_FUNC}.withreturn`, NODE_SELF, `${NS_SYSTEM_LIST}<${NS_SYSTEM_ENTRY_ACCESS}>`, true), "@entrySource.func")
export class EntrySource extends FuncCallProperty {}