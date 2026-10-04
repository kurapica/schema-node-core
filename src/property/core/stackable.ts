// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Core/Stackable.cs
// =============================================================================

import { Meta } from '../../attribute/meta';
import { isNull } from '../../utility/toolset';
import { Property } from '../property';
import { ForSchema } from './forSchema';
import { OfNodeKind } from './ofNodeKind';
import { PropertyValueType } from './propertyValueType';
import { SchemaType } from './schemaType';
import { Static } from './static';

import { SCHEMA_KIND_NODE_PROPERTY, NS_SYSTEM_SCHEMA_PRO_PROPERTY, NS_SYSTEM_BOOL, NODE_KIND_PROPERTY } from '../../utility/constant';

/**
 * Declare whether duplicate properties from different sources stack (accumulate) vs override.
 * Mirrors C# SchemaNode.Core/Property/Core/Stackable.cs
 */
@Meta(ForSchema, [SCHEMA_KIND_NODE_PROPERTY])
@Meta(OfNodeKind, NODE_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_PROPERTY}.stackable`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Meta(Static, true)
export class Stackable extends Property<boolean> {
    apply(target: object, field?: string | symbol, descriptorOrIndex?: number | TypedPropertyDescriptor<unknown>): void {
        if (!isNull(field) || !isNull(descriptorOrIndex)) return;
        target = typeof target === 'function' ? target : target.constructor;
        (target as unknown as Record<string, boolean>).stackable = this.getValue<boolean>() ?? false;
    }
}
