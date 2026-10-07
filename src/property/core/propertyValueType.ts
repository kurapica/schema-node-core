// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Core/PropertyValueType.cs
// =============================================================================

import { Meta } from '../../attribute/meta';
import { Alias } from './alias';
import { Property } from '../property';

/** Represents the value type of a property in the schema node core. */
@Meta(Alias, 'propertyValueType')
export class PropertyValueType extends Property<string> {}
