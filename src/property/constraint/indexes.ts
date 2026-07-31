import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, SchemaType, PropertyValueType, ForSchema } from '../index';
import type { IConstraintProperty } from '../constraintProperty';
import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, NS_SYSTEM_STRING, SCHEMA_KIND_ARRAY, NS_SYSTEM_SCHEMA_ARRAY, NS_SYSTEM_IDENTIFIER, NS_SYSTEM_LIST, NS_SYSTEM_BOOL } from '../../utility/constant';
import { IValueAccess } from '../../runtime/interfaces';
import { Error } from '../common';

@Meta(ForSchema, [SCHEMA_KIND_ARRAY])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.indexes`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_ARRAY}.indexs`)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.indexes.error`)
export class Indexes extends Property<DataIndex[]> implements IConstraintProperty {
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