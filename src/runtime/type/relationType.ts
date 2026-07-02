// =============================================================================
// RelationType — runtime type that executes relation processes
// Mirrors C# SchemaNode.Core/Runtime/Type/RelationType.cs
// =============================================================================

import type { IRelationProcess } from '../../attribute/relation';
import type { IProperty } from '../../property/property';

export class RelationType {
  /** Target access path. */
  target = '';

  /** Stage bit flags. */
  stage = 0;

  /** Execution kind: "call" or "assign". */
  kind = '';

  /** The execution process (Call or Assign). */
  process?: IRelationProcess;

  /** Execute the relation and return the resulting property. */
  async execute(owner: unknown): Promise<IProperty | undefined> {
    // TODO: resolve owner to IValueAccess, call process.ProcessAsync
    return undefined;
  }
}
