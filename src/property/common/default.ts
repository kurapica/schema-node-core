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

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PRO_COMMON, NS_SYSTEM_OBJECT,  NS_SYSTEM_SCHEMA_REFLECT_ARRAY, NS_SYSTEM_SCHEMA_PRO_CORE, TYPE_PROVIDER } from '../../utility/constant';

/** The Default property represents the default value */
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_COMMON}.default`)
@Meta(PropertyValueType, NS_SYSTEM_OBJECT)
@Relation(`${NS_SYSTEM_SCHEMA_PRO_CORE}.overridetype`,'call', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.getarrayelement`, TYPE_PROVIDER))
export class Default extends Property<unknown> {
  private oldValue: unknown;

  override setValue<TValue>(value: TValue): void {
    this.oldValue = this.getValue();
    super.setValue(value);
  }
  
  apply(target: object, field?: string | symbol, descriptorOrIndex?: number | TypedPropertyDescriptor<unknown>): void {
    if (!isNull(field) || !isNull(descriptorOrIndex)) return;
    target = typeof target === 'function' ? target : target.constructor;
    (target as unknown as Record<string, unknown>).default = this.getValue()!; // avoid cycle reference
  }

  override effect(target: IValueAccess): void {
    const origin = target.getValue();
    if (isEmpty(origin) || isEqual(origin, this.oldValue))
      target.setValue(this.getValue()); 
  }
}
