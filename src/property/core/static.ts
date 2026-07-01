// =============================================================================
// Static — prevent relation modification of this property
// =============================================================================

import { Property } from '../property';

/**
 * Static property type — prevents relation modification of this property.
 * This is used to mark properties that should not be modified by relation system.
 */
export class Static extends Property<boolean> {}
