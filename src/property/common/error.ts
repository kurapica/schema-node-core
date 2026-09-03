// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/Display.cs
// =============================================================================

import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';
import { concatLocaleString, type LocaleString } from '../../struct/localeString/type';
import { Property } from '../property';

import type { IProperty } from '../../interface';

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PRO_COMMON, NS_SYSTEM_LOCALE_STRING } from '../../utility/constant';
import { isNull } from '../../utility/toolset';

/** The error property */
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_COMMON}.error`)
@Meta(PropertyValueType, NS_SYSTEM_LOCALE_STRING)
export class Error extends Property<LocaleString> {
  apply(target: object, field?: string | symbol, descriptorOrIndex?: number | TypedPropertyDescriptor<unknown>): void {
    if (!isNull(field) || !isNull(descriptorOrIndex)) return;
    target = typeof target === 'function' ? target : target.constructor;
    (target as unknown as Record<string, string>).error = this.getValue<string>()!;
  }

  combine(other: IProperty): boolean {
      let otherUnit = other.getValue<LocaleString>();
      if (!otherUnit) return false;
      if (!this.hasValue)
      {
          this.setValue(otherUnit);
          return true;
      }
      this.setValue(concatLocaleString(this.getValue<LocaleString>()!, otherUnit));
      return true;
  }
}