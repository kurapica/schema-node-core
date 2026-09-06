// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Core/Static.cs
// =============================================================================

import { Meta } from '../../attribute/meta';
import { isNull } from '../../utility/toolset';
import { Property } from '../property';
import { ForSchema } from './forSchema';
import { OfSchema } from './ofSchema';
import { PropertyValueType } from './propertyValueType';
import { SchemaType } from './schemaType';

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PRO_PROPERTY, NS_SYSTEM_BOOL } from '../../utility/constant';

/**
 * Static property type — prevents relation modification of this property.
 * This is used to mark properties that should not be modified by relation system.
 */
@Meta(ForSchema, [SCHEMA_KIND_PROPERTY])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_PROPERTY}.static`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Meta(Static, true)
export class Static extends Property<boolean> {
    apply(target: object, field?: string | symbol, descriptorOrIndex?: number | TypedPropertyDescriptor<unknown>): void {
        if (!isNull(field) || !isNull(descriptorOrIndex)) return;
        target = typeof target === 'function' ? target : target.constructor;
        (target as unknown as Record<string, boolean>).static = this.getValue<boolean>() ?? false;
    }
}
