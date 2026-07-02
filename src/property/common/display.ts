// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/Display.cs
// =============================================================================

import { IProperty, Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, ForSchema, SchemaType } from '../index';
import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_NODE, SCHEMA_KIND_STRUCT_FIELD, SCHEMA_KIND_ENUM_VALUE, NS_SYSTEM_SCHEMA_PROPERTY_COMMON } from '../../utility/constant';
import { SystemLocaleString } from '../..';

/**
 * The display property
 */
@Meta(ForSchema, [SCHEMA_KIND_NODE, SCHEMA_KIND_STRUCT_FIELD, SCHEMA_KIND_ENUM_VALUE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.display`)
export class Display extends Property<SystemLocaleString> {
    combine(other: IProperty): boolean {
        let otherUnit = other.getValue<SystemLocaleString>();
        if (!otherUnit) return false;
        if (!this.hasValue)
        {
            this.setValue(otherUnit);
            return true;
        }
        this.setValue(this.getValue<SystemLocaleString>()!.concat(otherUnit));
        return true;
    }
}

