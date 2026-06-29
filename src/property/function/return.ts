// =============================================================================
// Return — declares function return type. Used in @Meta(Return, "T") on functions.
// =============================================================================

import { Property } from '../property';

// NOTE: Return is infrastructure — NOT registered as a property schema.
// It is used via @Meta(Return, "T") on functions to declare the return type.
export class Return extends Property<string> {}
