// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/Description.cs
// =============================================================================

import { IProperty, Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, ForSchema, SchemaType, PropertyValueType } from '../index';
import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_NODE, SCHEMA_KIND_STRUCT_FIELD, NS_SYSTEM_SCHEMA_PROPERTY_COMMON, NS_SYSTEM_LOCALE_STRING } from '../../utility/constant';
import { concatLocaleString, LocaleString } from '../../struct';

/**
 * The Description property
 */
@Meta(ForSchema, [SCHEMA_KIND_NODE, SCHEMA_KIND_STRUCT_FIELD])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.description`)
@Meta(PropertyValueType, NS_SYSTEM_LOCALE_STRING)
export class Description extends Property<LocaleString> {
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

