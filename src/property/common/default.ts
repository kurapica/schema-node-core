// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/Default.cs
// =============================================================================

import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, ForSchema, SchemaType, PropertyValueType } from '../index';
import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_BOOL, SCHEMA_KIND_STRING, SCHEMA_KIND_DATE, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_INT, NS_SYSTEM_SCHEMA_PROPERTY_COMMON, NS_SYSTEM_OBJECT, SCHEMA_KIND_FUNC_ARG } from '../../utility/constant';
import { IValueAccess } from '../../runtime';
import { isEmpty, isEqual } from '../../utility';

/** The Default property represents the default value */
@Meta(ForSchema, [SCHEMA_KIND_BOOL, SCHEMA_KIND_STRING, SCHEMA_KIND_DATE, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_INT, SCHEMA_KIND_PROPERTY, SCHEMA_KIND_FUNC_ARG])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.default`)
@Meta(PropertyValueType, NS_SYSTEM_OBJECT)
export class Default extends Property<unknown> {
    override effect(target: IValueAccess, newValue?: unknown | undefined, oldValue?: unknown | undefined): void {
        const origin = target.getValue();
        if (isEmpty(origin) || isEqual(origin, oldValue))
            target.setValue(newValue);
    }
}
