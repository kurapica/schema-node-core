// =============================================================================
// RelationType — runtime type that executes relation processes
// Mirrors C# SchemaNode.Core/Runtime/Type/RelationType.cs
// =============================================================================

import { getMetaProperty } from '../../attribute/meta';
import { RelationKind } from '../../property';
import { RelationProcess } from '../../property/core/relationProcess';
import type { PropertyCtor } from '../../property/property';
import { IRelationProcess, RelationSchema } from '../../schema/relationSchema';
import { SCHEMA_KIND_RELATION } from '../../utility/constant';
import { generateGuid } from '../../utility/toolset';
import { hasNodeReferences, IErrorProvider, INodeReference, IValueAccess, IValueTypeAccess } from '../interfaces';
import { getNodeType, getSchemaKindPropertyTypes, getSchemaType } from '../schemaRuntime';
import { NodeType } from './nodeType';
import { PropertyType } from './propertyType';

/** The relation type */
export class RelationType implements INodeReference, IErrorProvider {
  
  // ── Constructor ────────────────────────────────────────────────────────

  constructor(schema: RelationSchema, owner: IValueTypeAccess) {
    this._relationSchema = schema;
    this._owner = owner;
  }

  // ── Properties ─────────────────────────────────────────────────────────

  private _relationSchema: RelationSchema;
  private _owner: IValueTypeAccess;
  private _property?: PropertyType;
  private _propCtor?: PropertyCtor;
  private _process?: IRelationProcess;

  /** A guid */
  readonly guid = generateGuid();

  /** Target access path. */
  get target() { return this._relationSchema.target };

  /** The relation owner type */
  get owner() { return this._owner };

  /** The property type */
  get property() { return this._property };

  /** The property constructor */
  get propertyCtor() { return this._propCtor };

  /** Stage bit flags. */
  get stage() { return this._relationSchema.stage };

  /** Execution kind. */
  get kind() { return this._relationSchema.kind };

  /** The error message */
  get error() { return this._relationSchema.error }

  /** The processer */
  get processer(): IRelationProcess | undefined { return this._process };

  // ── Methods ────────────────────────────────────────────────────────────

  async load() {
    this._property = await getNodeType(this._relationSchema.property) as PropertyType;
    this._propCtor = this._property ? getSchemaType(this._property.name) as PropertyCtor : undefined;

    // load process
    for(const propCtor of getSchemaKindPropertyTypes(SCHEMA_KIND_RELATION))
    {
      const kind = getMetaProperty(propCtor, RelationKind);
      if (kind?.hasValue && kind.getValue() === this._relationSchema.kind)
      {
        const processCtor = getMetaProperty(propCtor, RelationProcess)?.getValue() as new() => IRelationProcess;
        if (processCtor)
        {
          const process = new processCtor();
          await process.load(this._relationSchema);
          this._process = process;
        }
        break;
      }
    }
  }

  /** Get reference types */
  *getRefTypes(): Generator<NodeType> {
    if (this.property)
      yield this.property;

    if (hasNodeReferences(this.process))
      yield* (this.process as unknown as INodeReference).getRefTypes();
  }

  /** Attach the relation to target with the owner */
  attach(owner: IValueAccess, target: IValueAccess)
  {
    if (!this._propCtor) return;
    this._process?.detach(this, owner, target); // clear first
    this._process?.attach(this, owner, target);
  }

  /** Detach the relation from the target with the owner */
  detach(owner: IValueAccess, target: IValueAccess)
  {
    if (!this._propCtor) return;
    this._process?.detach(this, owner, target);
    target.setPropertyValue(this._propCtor, undefined, owner); // clear
  }

  /** Execute the relation and set new property to the target */
  async process(owner: IValueAccess, target: IValueAccess) {
    if (!this._propCtor) return undefined;
    target.setPropertyValue(this._propCtor, await this._process?.process(owner, target), owner);
  }
}
