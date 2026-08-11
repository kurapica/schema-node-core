// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/Unit.cs
// =============================================================================

import { IProperty, Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { ForSchema } from '../core/forSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';
import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_INT, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_STRING, NS_SYSTEM_SCHEMA_PROPERTY_COMMON, NS_SYSTEM_LOCALE_STRING } from '../../utility/constant';
import { concatLocaleString, LocaleString } from '../../struct/localeString';

/**
 * The unit property is used to define the unit of measurement
 */
@Meta(ForSchema, [SCHEMA_KIND_INT, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_STRING])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.Unit`)
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
