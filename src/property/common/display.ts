// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/Display.cs
// =============================================================================

import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';
import { concatLocaleString } from '../../struct/localeString/type';
import { ForSchema } from '../core/forSchema';

import type { LocaleString } from '../../struct/localeString/type';
import type { IProperty } from '../../interface';

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PRO_COMMON, NS_SYSTEM_LOCALE_STRING } from '../../utility/constant';

/** The display property */
@Meta(ForSchema, [SCHEMA_KIND_PROPERTY])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_COMMON}.display`)
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

