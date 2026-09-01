// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/Default.cs
// =============================================================================

import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';
import { buildFuncCall } from '../../schema/function/type';
import { isEmpty, isEqual, isNull } from '../../utility/toolset';
import { Relation } from '../../attribute/relation';

import type { IValueAccess } from '../../interface';

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_COMMON, NS_SYSTEM_OBJECT,  NS_SYSTEM_SCHEMA_REFLECT_ARRAY, NS_SYSTEM_SCHEMA_PROPERTY_CORE, NODE_TYPE } from '../../utility/constant';

/** The Default property represents the default value */
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.default`)
@Meta(PropertyValueType, NS_SYSTEM_OBJECT)
@Relation(`${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.overridetype`,'call', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.getarrayelement`, NODE_TYPE))
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
