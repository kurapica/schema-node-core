import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';
import { ForSchema } from '../core/forSchema';
import { EntrySource } from '../core/entrySource';
import { buildFuncCall } from '../../schema/function/type';
import { ConstraintProperty } from '../constraintProperty';
import { Error } from '../common/error';
import { Visible } from '../common/visible';
import { Relation } from '../../attribute/relation';

import type { IValueAccess } from '../../interface';

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, NS_SYSTEM_STRING, SCHEMA_KIND_ARRAY, NS_SYSTEM_SCHEMA_ARRAY, NS_SYSTEM_IDENTIFIER, NS_SYSTEM_LIST, NS_SYSTEM_BOOL, ARRAY_ELEMENT, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, NS_SYSTEM_SCHEMA_REFLECT_STRUCT, SCHEMA_KIND_STRUCT } from '../../utility/constant';

@Meta(ForSchema, [SCHEMA_KIND_ARRAY])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.indexes`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_ARRAY}.indexs`)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.indexes.error`)
@Relation(Visible,'call', buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, '@element', true, SCHEMA_KIND_STRUCT))
@Relation(EntrySource,'assign', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_STRUCT}.getindexablefields`, '@element'), `indexes.${ARRAY_ELEMENT}.fields.${ARRAY_ELEMENT}`)
export class Indexes extends ConstraintProperty<DataIndex[]> {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    return undefined; // do nothing
  }
}

/** A named index definition with ordered fields. */
export interface DataIndex {
  /** The name of the index. */
  name: string;
  /** The fields of the index. */ 
  fields: string[];
  /** Whether the index is unique. */
  isUnique?: boolean;
}

@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_ARRAY}.index`)
class DataIndexMeta implements DataIndex {
  /** The name of the index. */
  @Meta(SchemaType, NS_SYSTEM_IDENTIFIER)
  name!: string;
  
  /** The fields of the index. */ 
  @Meta(SchemaType, `${NS_SYSTEM_LIST}<${NS_SYSTEM_STRING}>`)
  fields!: string[];

  /** Whether the index is unique. */
  @Meta(SchemaType, NS_SYSTEM_BOOL)
  isUnique?: boolean;
}