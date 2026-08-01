// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Core/Stackable.cs
// =============================================================================

import { Meta } from '../../attribute';
import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CORE, NS_SYSTEM_BOOL } from '../../utility';
import { Property } from '../property';
import { ForSchema } from './forSchema';
import { OfSchema } from './ofSchema';
import { PropertyValueType } from './propertyValueType';
import { SchemaType } from './schemaType';
import { Static } from './static';

/**
 * Declare whether duplicate properties from different sources stack (accumulate) vs override.
 * Mirrors C# SchemaNode.Core/Property/Core/Stackable.cs
 */
@Meta(ForSchema, [SCHEMA_KIND_PROPERTY])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.stackable`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Meta(Static, true)
export class Stackable extends Property<boolean> {
    apply(target: object, field?: string | symbol, descriptorOrIndex?: number | TypedPropertyDescriptor<unknown>): void {
        (target as unknown as Record<string, boolean>).stackable = this.getValue<boolean>() ?? false;
    }
}
