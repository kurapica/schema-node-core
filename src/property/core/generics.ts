// =============================================================================
// Generics — declares generic type parameters
// =============================================================================

import { Property } from '../property';

/** A single generic type parameter declaration. */
export interface GenericParameter {
  name: string;
  compatibles?: string[];
}

export class Generics extends Property<GenericParameter[]> {}
