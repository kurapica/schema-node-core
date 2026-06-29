// =============================================================================
// IRelationProcess — interface for relation processing
// =============================================================================

import type { DataNode } from '../node/dataNode';
import type { IPropertyOwner } from '../property/propertyOwner';

/** A relation process applies a computed behavior to a target node. */
export interface IRelationProcess {
  /** Load/resolve the relation's configuration. */
  load(owner: IPropertyOwner): Promise<void>;

  /** Execute the relation process and return the result value. */
  process(owner: IPropertyOwner): Promise<unknown>;
}

/**
 * Call relation — invokes a function and assigns the result to a property.
 */
export class CallRelation implements IRelationProcess {
  func: string;
  args: { source?: string; value?: unknown }[];

  constructor(func: string, args: { source?: string; value?: unknown }[] = []) {
    this.func = func;
    this.args = args;
  }

  async load(_owner: IPropertyOwner): Promise<void> {
    // Resolve function reference
  }

  async process(_owner: IPropertyOwner): Promise<unknown> {
    // Invoke function with resolved args
    return undefined;
  }
}

/**
 * Assign relation — directly assigns a value to a property.
 */
export class AssignRelation implements IRelationProcess {
  value: unknown;

  constructor(value: unknown) {
    this.value = value;
  }

  async load(_owner: IPropertyOwner): Promise<void> {
    // No loading needed
  }

  async process(_owner: IPropertyOwner): Promise<unknown> {
    return this.value;
  }
}
