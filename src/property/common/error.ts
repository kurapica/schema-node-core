// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/Display.cs
// =============================================================================

import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_COMMON, NS_SYSTEM_LOCALE_STRING } from '../../utility/constant';
import { isNull } from '../../utility/toolset';
import { Display } from './display';

/** The error property */
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.error`)
@Meta(PropertyValueType, NS_SYSTEM_LOCALE_STRING)
export class Error extends Display {
  apply(target: object, field?: string | symbol, descriptorOrIndex?: number | TypedPropertyDescriptor<unknown>): void {
    if (!isNull(field) || !isNull(descriptorOrIndex)) return;
    target = typeof target === 'function' ? target : target.constructor;
    (target as unknown as Record<string, string>).error = this.getValue<string>()!;
  }
}