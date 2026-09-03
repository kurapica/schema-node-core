// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/Unit.cs
// =============================================================================

import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';
import { concatLocaleString, type LocaleString } from '../../struct/localeString/type';
import { Property } from '../property';

import type { IProperty } from '../../interface';

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PRO_COMMON, NS_SYSTEM_LOCALE_STRING } from '../../utility/constant';

/**
 * The unit property is used to define the unit of measurement
 */
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_COMMON}.Unit`)
@Meta(PropertyValueType, NS_SYSTEM_LOCALE_STRING)
export class Unit extends Property<LocaleString> {
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


