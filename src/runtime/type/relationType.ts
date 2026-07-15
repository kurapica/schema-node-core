// =============================================================================
// RelationType — runtime type that executes relation processes
// Mirrors C# SchemaNode.Core/Runtime/Type/RelationType.cs
// =============================================================================

import { getMetaProperty } from '../../attribute/meta';
import { RelationStage } from '../../enum/relationStage';
import { RelationKind } from '../../property';
import { RelationProcess } from '../../property/core/relationProcess';
import type { IProperty } from '../../property/property';
import { IRelationProcess, RelationSchema } from '../../schema/relationSchema';
import { SCHEMA_KIND_RELATION } from '../../utility/constant';
import { IErrorProvider, INodeReference, IValueTypeAccess } from '../interfaces';
import { getNodeType, getSchemaKindProperties } from '../schemaRuntime';
import { NodeType } from './nodeType';
import { PropertyType } from './propertyType';

export class RelationType implements INodeReference, IErrorProvider {
  
  // ── Constructor ────────────────────────────────────────────────────────

  constructor(schema: RelationSchema) {
    this._relationSchema = schema;
  }

  // ── Properties ─────────────────────────────────────────────────────────

  private _relationSchema: RelationSchema;
  private _property?: PropertyType;

  /** Target access path. */
  readonly target = '';

  /** The relation owner type */
  readonly owner!: IValueTypeAccess;

  /** The property type */
  get property() { return this._property };

  /** Stage bit flags. */
  get stage() { return this._relationSchema.stage };

  /** Execution kind. */
  get kind() { return this._relationSchema.kind };

  /** The execution process (Call or Assign). */
  readonly process?: IRelationProcess;

  /** The error message */
  readonly error?: string | undefined;

  // ── Methods ────────────────────────────────────────────────────────────

  async load() {
    this._property = await getNodeType(this._relationSchema.property) as PropertyType;

    // load process
    for(const propCtor of getSchemaKindProperties(SCHEMA_KIND_RELATION))
    {
      const kind = getMetaProperty(propCtor, RelationKind);
      if (kind?.hasValue && kind.getValue() === this._relationSchema.kind)
      {
        const processCtor = getMetaProperty(propCtor, RelationProcess)?.getValue() as new() => IRelationProcess;
        if (processCtor)
        {
          const process = new processCtor()
        }
        break;
      }
    }
  }

  /** Get reference types */
  *getRefTypes(): Generator<NodeType> {
    if (this.property)
      yield this.property;

    if (typeof (this.process as any)?.getRefTypes === 'function')
    {
      for (const type of (this.process as unknown as INodeReference).getRefTypes())
        yield type;
    }
  }

  /** Execute the relation and return the resulting property. */
  async execute(owner: unknown): Promise<IProperty | undefined> {
    // TODO: resolve owner to IValueAccess, call process.ProcessAsync
    return undefined;
  }
}
