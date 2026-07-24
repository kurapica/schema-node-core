// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/Error.cs
// =============================================================================

import { IProperty, Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, ForSchema, SchemaType } from '../index';
import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_STRUCT_FIELD, SCHEMA_KIND_INT, SCHEMA_KIND_STRING, SCHEMA_KIND_DATE, SCHEMA_KIND_DECIMAL, NS_SYSTEM_SCHEMA_PROPERTY_COMMON } from '../../utility/constant';
import { concatLocaleString, LocaleString } from '../../struct';

/**
 * The error message to be used
 */
@Meta(ForSchema, [SCHEMA_KIND_STRUCT_FIELD, SCHEMA_KIND_INT, SCHEMA_KIND_STRING, SCHEMA_KIND_DATE, SCHEMA_KIND_DECIMAL])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.ErrorMessage`)
export class ErrorMessage extends Property<LocaleString> {
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
