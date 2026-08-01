// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Core/Static.cs
// =============================================================================

import { Meta } from '../../attribute';
import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CORE, NS_SYSTEM_BOOL } from '../../utility';
import { Property } from '../property';
import { ForSchema } from './forSchema';
import { OfSchema } from './ofSchema';
import { PropertyValueType } from './propertyValueType';
import { SchemaType } from './schemaType';

/**
 * Static property type — prevents relation modification of this property.
 * This is used to mark properties that should not be modified by relation system.
 */
@Meta(ForSchema, [SCHEMA_KIND_PROPERTY])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.stackable`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Meta(Static, true)
export class Static extends Property<boolean> {
    apply(target: object, field?: string | symbol, descriptorOrIndex?: number | TypedPropertyDescriptor<unknown>): void {
        (target as unknown as Record<string, boolean>).static = this.getValue<boolean>() ?? false;
    }
}
