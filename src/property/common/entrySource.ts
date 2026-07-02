import { FuncCallProperty } from '../funcCallProperty';
import { Meta } from '../../attribute/meta';
import { OfSchema, ForSchema, SchemaType, Valid } from '../index';
import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_INT, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_STRING, NS_SYSTEM_SCHEMA_PROPERTY_CORE, NS_SYSTEM_ENTRY, NODE_SELF, NS_SYSTEM_SCHEMA_REFLECT_FUNC, NS_SYSTEM_LIST } from '../../utility/constant';
import { RelationAssign } from '../../attribute/relation';

/**
 * The white list declaration of the data
 */
@Meta(ForSchema, [SCHEMA_KIND_INT, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_STRING])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.entrysource`)
@RelationAssign(Valid, { func: `${NS_SYSTEM_SCHEMA_REFLECT_FUNC}.withreturn`, args: [ { source: NODE_SELF }, { value: `${NS_SYSTEM_LIST}<${NS_SYSTEM_ENTRY}>`}, { value: true }]}, "$entrySource.func")
export class EntrySource extends FuncCallProperty {}
