// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/Default.cs
// =============================================================================

import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { ForSchema } from '../core/forSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';
import { buildFuncCall } from '../../schema/function/type';
import { isEmpty, isEqual, isNull } from '../../utility/toolset';
import { Relation } from '../../attribute/relation';

import type { IValueAccess } from '../../interface';

import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_BOOL, SCHEMA_KIND_STRING, SCHEMA_KIND_DATE, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_INT, NS_SYSTEM_SCHEMA_PROPERTY_COMMON, NS_SYSTEM_OBJECT, SCHEMA_KIND_FUNC_ARG, SCHEMA_KIND_STRUCT_FIELD, NS_SYSTEM_INTRINSIC, NS_SYSTEM_SCHEMA_REFLECT, NS_SYSTEM_SCHEMA_REFLECT_ARRAY, SCHEMA_KIND_ENUM, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, NS_SYSTEM_SCHEMA_PROPERTY_CORE, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT } from '../../utility/constant';

/** The Default property represents the default value */
@Meta(ForSchema, [SCHEMA_KIND_STRUCT_FIELD])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.default`)
@Meta(PropertyValueType, NS_SYSTEM_OBJECT)
@Relation(`${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.visible`,'call', buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, '@type', true, SCHEMA_KIND_ENUM, SCHEMA_KIND_BOOL, SCHEMA_KIND_INT, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_STRING, SCHEMA_KIND_DATE))
@Relation(`${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.overridetype`,'call', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.getarrayelement`, '@type'))
@Relation(`${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.whitelist`,'call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@whiteList'))
@Relation(`${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.blacklist`,'call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@blackList'))
@Relation(`${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.root`,'call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@root'))
@Relation(`${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.leafonly`,'call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@leafOnly'))
@Relation(`${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.cascade`,'call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@cascade'))
@Relation(`${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.singleflag`,'call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@singleFlag'))
@Relation(`${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.asSuggest`,'call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@asSuggest'))
export class Default extends Property<unknown> {
  apply(target: object, field?: string | symbol, descriptorOrIndex?: number | TypedPropertyDescriptor<unknown>): void {
    if (!isNull(field) || !isNull(descriptorOrIndex)) return;
    target = typeof target === 'function' ? target : target.constructor;
    (target as unknown as Record<string, unknown>).default = this.getValue()!; // avoid cycle reference
  }

  override effect(target: IValueAccess, newValue?: unknown, oldValue?: unknown, source?: IValueAccess): void {
    const origin = target.getValue();
    if (isEmpty(origin) || isEqual(origin, oldValue))
      target.setValue(newValue);
  }
}
