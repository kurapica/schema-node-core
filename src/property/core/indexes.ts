// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Core/Indexes.cs
// =============================================================================

import { Meta } from '../../attribute/meta';
import { Alias } from './alias';
import { Default } from '../common/default';
import { OrderProperty } from '../orderProperty';

/**
 * The primary index
 */
@Meta(Alias, 'primaryIndex')
@Meta(Default, "primary")
export class PrimaryIndex extends OrderProperty<string> {}

/**
 * The unique index
 */
@Meta(Alias, 'uniqueIndex')
export class UniqueIndex extends OrderProperty<string> {}

/**
 * The index
 */
@Meta(Alias, 'index')
export class Index extends OrderProperty<string> {}
