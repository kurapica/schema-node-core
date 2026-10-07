// =============================================================================
// Return — declares function return type. Used in @Meta(Return, "T") on functions.
// =============================================================================

import { Meta } from "../../../attribute/meta";
import { Alias } from "../../../property/core/alias";
import { Property } from "../../../property/property";

// NOTE: Return is infrastructure — NOT registered as a property schema.
// It is used via @Meta(Return, "T") on functions to declare the return type.
@Meta(Alias, 'return')
export class Return extends Property<string> {}
