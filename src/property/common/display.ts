// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/Display.cs
// =============================================================================

import { IProperty, Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, ForSchema, SchemaType, PropertyValueType } from '../index';
import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_NODE, SCHEMA_KIND_STRUCT_FIELD, SCHEMA_KIND_ENTRY, NS_SYSTEM_SCHEMA_PROPERTY_COMMON, SCHEMA_KIND_FUNC_ARG, NS_SYSTEM_LOCALE_STRING } from '../../utility/constant';
import { concatLocaleString, LocaleString } from '../../struct';

/**
 * The display property
 */
@Meta(ForSchema, [SCHEMA_KIND_NODE, SCHEMA_KIND_STRUCT_FIELD, SCHEMA_KIND_ENTRY, SCHEMA_KIND_FUNC_ARG])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.display`)
@Meta(PropertyValueType, NS_SYSTEM_LOCALE_STRING)
export class Display extends Property<LocaleString> {
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

