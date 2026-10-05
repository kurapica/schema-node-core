// =============================================================================
// RelationType — runtime type that executes relation processes
// Mirrors C# SchemaNode.Core/Runtime/Type/RelationType.cs
// =============================================================================

import { getMetaProperty } from '../../attribute/meta';
import { RelationKind } from '../../property/record/relationKind';
import { RelationProcess } from '../../property/core/relationProcess';
import { deepClone, generateGuid } from '../../utility/toolset';
import { hasNodeReferences } from '../../interface';
import { getPropertyType, PropertyType } from '../property/runtime';
import { getSchemaKindByNodeKind, getSchemaKindPropertyTypes, getSchemaType } from '../../runtime/schemaRuntime';
import { SCHEMA_KIND_NODE_RELATION } from '../../utility/constant';
import { logger } from '../../utility/logger';

import type { RelationSchema } from './type';
import type { IRelationProcess } from './interface';

import type { PropertyCtor, INodeReference, IErrorProvider, IValueAccess, IValueTypeAccess, INodeType, IRelation, IProperty } from '../../interface';
import { Attach } from '../struct/property/attach';

/** The relation type */
export class RelationType implements INodeReference, IErrorProvider, IRelation {
  
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
  private _propertyInstance?: IProperty;

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

  /** Execution kind. */
  get kind() { return this._relationSchema.kind };

  /** The error message */
  get error() { return this._relationSchema.error }

  /** The processer */
  get processer(): IRelationProcess | undefined { return this._process };

  /** The relation schema */
  get schema() { return deepClone(this._relationSchema) };

  // ── Methods ────────────────────────────────────────────────────────────

  async load(threadId?: string, ...kinds: (string | undefined)[]) {
    const nodeKind = this._owner?.getAccessValueType(this._relationSchema.target)?.kind;
    const kind = nodeKind ? getSchemaKindByNodeKind(nodeKind) : undefined;
    if (kind && !kinds.includes(kind)) kinds.push(kind);

    const attachKind = this._owner?.getPropertyValue<string>(Attach);
    if (attachKind && !kinds.includes(attachKind)) kinds.push(attachKind);

    this._property = await getPropertyType(this._relationSchema.property, ...kinds, threadId) as PropertyType;
    this._propCtor = this._property ? getSchemaType(this._property.name) as PropertyCtor : undefined;
    this._propertyInstance = this._propCtor ? new this._propCtor() : undefined;

    if (!this._property) 
      logger.error('[Relation][Load]', this._owner?.name, "[Target]",this._owner?.getAccessValueType(this._relationSchema.target), "[Schema]", this._relationSchema, '[Kinds]', ...kinds);

    // load process
    for(const propCtor of getSchemaKindPropertyTypes(SCHEMA_KIND_NODE_RELATION))
    {
      const kind = getMetaProperty(propCtor, RelationKind);
      if (kind?.hasValue && kind.getValue() === this._relationSchema.kind)
      {
        const processCtor = getMetaProperty(propCtor, RelationProcess)?.getValue() as new() => IRelationProcess;
        if (processCtor)
        {
          const process = new processCtor();
          await process.load(this._relationSchema, threadId);
          this._process = process;
        }
        break;
      }
    }
  }

  /** Get reference types */
  *getRefTypes(): Generator<INodeType> {
    if (this.property)
      yield this.property;

    if (hasNodeReferences(this.process))
      yield* (this.process as unknown as INodeReference).getRefTypes();
  }

  /** Attach the relation to target with the owner */
  attach(owner: IValueAccess, target: IValueAccess)
  {
    logger.verbose('[Relation][Attach]', '[Property]', this._property?.property, '[Owner]', (owner as IValueAccess).access ?? owner, '[Target]', (target as IValueAccess).access ?? target  );

    if (!this._propCtor) return;
    this._process?.detach(this, owner, target); // clear first
    this._process?.attach(this, owner, target);
    if (this._propertyInstance?.initWithRelation(this, owner, target))
      return this.process(owner, target);
  }

  /** Whether the relation depends on other nodes */
  hasDepends(): boolean {
    return this._process?.hasDepends() ?? false;
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
    target.setPropertyValue(this._propCtor, await this._process?.process(owner, target), owner, this);
  }
}
