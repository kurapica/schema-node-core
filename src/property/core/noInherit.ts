// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Core/Static.cs
// =============================================================================

import { Meta } from '../../attribute/meta';
import { Alias } from './alias';
import { isNull } from '../../utility/toolset';
import { Property } from '../property';
import { ForSchema } from './forSchema';
import { OfNodeKind } from './ofNodeKind';
import { PropertyValueType } from './propertyValueType';
import { SchemaType } from './schemaType';
import { Static } from './static';

import { SCHEMA_KIND_NODE_PROPERTY, NS_SYSTEM_SCHEMA_PRO_PROPERTY, NS_SYSTEM_BOOL, NODE_KIND_PROPERTY } from '../../utility/constant';

/**
 * NoInherit property type — prevents inheritance of this property.
 */
@Meta(Alias, 'noInherit')
@Meta(ForSchema, [SCHEMA_KIND_NODE_PROPERTY])
@Meta(OfNodeKind, NODE_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_PROPERTY}.noinherit`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Meta(Static, true)
export class NoInherit extends Property<boolean> {
    apply(target: object, field?: string | symbol, descriptorOrIndex?: number | TypedPropertyDescriptor<unknown>): void {
        if (!isNull(field) || !isNull(descriptorOrIndex)) return;
        target = typeof target === 'function' ? target : target.constructor;
        (target as unknown as Record<string, boolean>).noInherit = this.getValue<boolean>() ?? false;
    }
}
