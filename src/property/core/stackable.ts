// =============================================================================
// Stackable — whether duplicate properties from different sources stack
// Default: false (override). Set to true for constraint stacking (e.g., Valid).
// =============================================================================

import { Property } from '../property';

export class Stackable extends Property<boolean> {}
