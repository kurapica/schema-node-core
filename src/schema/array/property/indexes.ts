import { Meta } from '../../../attribute/meta';
import { OfSchema } from '../../../property/core/ofSchema';
import { SchemaType } from '../../../property/core/schemaType';
import { PropertyValueType } from '../../../property/core/propertyValueType';
import { ForSchema } from '../../../property/core/forSchema';
import { ConstraintProperty } from '../../../property/constraintProperty';
import { Error } from '../../../property/common/error';

import type { IValueAccess } from '../../../interface';

import { SCHEMA_KIND_ARRAY_DEFINE, SCHEMA_KIND_PROPERTY, NS_SYSTEM_STRING, SCHEMA_KIND_ARRAY, NS_SYSTEM_SCHEMA_ARRAY, NS_SYSTEM_IDENTIFIER, NS_SYSTEM_LIST, NS_SYSTEM_BOOL, NS_SYSTEM_SCHEMA_PRO_ARRAY, NS_SYSTEM_INTRINSIC, ARRAY_PREVIOUS, ARRAY_ELEMENT } from '../../../utility/constant';
import { PrimaryIndex } from '../../../property/core/indexes';
import { Relation } from '../../../attribute';
import { BlackList, Require } from '../../../property';
import { Call } from '../../../relation';
import { buildFuncCall } from '../../function';

@Meta(ForSchema, [SCHEMA_KIND_ARRAY, SCHEMA_KIND_ARRAY_DEFINE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_ARRAY}.indexes`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_ARRAY}.indexs`)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PRO_ARRAY}.indexes.error`)
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
  @Meta(PrimaryIndex)
  @Meta(Require, true)
  name!: string;
  
  /** The fields of the index. */ 
  @Meta(SchemaType, `${NS_SYSTEM_LIST}<${NS_SYSTEM_STRING}>`)
  @Meta(Require, true)
  @Relation(BlackList, Call, buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, `@fields.${ARRAY_PREVIOUS}`), `fields.${ARRAY_ELEMENT}`)
  fields!: string[];

  /** Whether the index is unique. */
  @Meta(SchemaType, NS_SYSTEM_BOOL)
  isUnique?: boolean;
}