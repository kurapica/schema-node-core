// =============================================================================
// Index properties — PrimaryIndex, UniqueIndex, Index
// =============================================================================

import { Meta } from '../../attribute/meta';
import { Default } from '../common/default';
import { OrderProperty } from '../orderProperty';

/**
 * The primary index
 */
@Meta(Default, "primary")
export class PrimaryIndex extends OrderProperty<string> {}

/**
 * The unique index
 */
export class UniqueIndex extends OrderProperty<string> {}

/**
 * The index
 */
export class Index extends OrderProperty<string> {}
