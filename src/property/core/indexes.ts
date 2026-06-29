// =============================================================================
// Index properties — PrimaryIndex, UniqueIndex, Index
// =============================================================================

import { OrderProperty } from '../orderProperty';

export class PrimaryIndex extends OrderProperty<string> {}
export class UniqueIndex extends OrderProperty<string> {}
export class Index extends OrderProperty<string> {}
