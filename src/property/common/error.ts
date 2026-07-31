// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/Display.cs
// =============================================================================

import { IProperty, Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, ForSchema, SchemaType, PropertyValueType } from '../index';
import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_COMMON, SCHEMA_KIND_DATE, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_INT, SCHEMA_KIND_STRING, NS_SYSTEM_LOCALE_STRING } from '../../utility/constant';
import { concatLocaleString, LocaleString } from '../../struct';

/** The error property */
@Meta(ForSchema, [SCHEMA_KIND_INT, SCHEMA_KIND_STRING, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_DATE, SCHEMA_KIND_PROPERTY])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.error`)
@Meta(PropertyValueType, NS_SYSTEM_LOCALE_STRING)
export class Error extends Property<LocaleString> {
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

