// =============================================================================
// PropertyType — runtime type for property schemas
// =============================================================================

import { getPropertiesBySchemaKind, getPropertyValue } from '../../property/propertyOwner';
import { getNodeType } from '../../runtime/context';
import { NodeType } from '../node/runtime';

import { type INodeType, type IProperty, type IValueTypeAccess } from '../../interface';
import type { PropertySchema } from './type';

import { SCHEMA_KIND_NODE_PROPERTY } from '../../utility/constant';
import { isEmpty, isValidGUID } from '../../utility/toolset';
import { getSchemaKindSchemaProperties } from '../../runtime/schemaRuntime';

export class PropertyType extends NodeType {
  private _propertySchema: PropertySchema | undefined
  private _valueType: IValueTypeAccess | undefined  

  /** The property type property name */
  get property() { return this._propertySchema?.property; }

  /** the property value type */
  get valueType(): IValueTypeAccess | undefined { return this._valueType; }

  /** The property works for schema kind */
  get forSchemas(): string[] | undefined { return this._propertySchema?.forSchemas ? [...this._propertySchema.forSchemas] : []; }

  forSchema(schemaKind: string): boolean {
    return this.forSchemas?.includes(schemaKind) ?? false;
  }

  override loadProperties(): IProperty[] {
    this._propertySchema = getPropertyValue<PropertySchema>(this.schema, "property");
    return this._propertySchema ? Array.from(getPropertiesBySchemaKind(this._propertySchema, SCHEMA_KIND_NODE_PROPERTY)) : [];
  }

  override async load(threadId?: string) {
    this._valueType = this._propertySchema?.type
      ? await getNodeType(this._propertySchema.type, undefined, undefined, undefined, threadId) as unknown as IValueTypeAccess
      : undefined;
  }

  override *getRefTypes(): Generator<INodeType> {
    if (this._valueType)
      yield this._valueType as unknown as INodeType;
    yield* super.getRefTypes();
  }
}

/** Get the property type for the given kind with property name */
export async function getPropertyType(
  property: string,
  ...kinds: (string | undefined)[]
): Promise<PropertyType | undefined> {
  if (isEmpty(property)) return undefined;

  let threadId : string | undefined = undefined;

  if (kinds.length && isValidGUID(kinds[kinds.length - 1]!)) {
    threadId = kinds.pop();
  }

  if (property.includes('.')) {
    const ptype = await getNodeType(property, undefined, undefined, undefined, threadId);
    if (ptype) return ptype as PropertyType;
  }
  property = property.toLowerCase();
  for (const kind of kinds)
  {
    if (isEmpty(kind)) continue;
    for (let kind of kinds) {
      if (isEmpty(kind)) continue;
      for(const p of getSchemaKindSchemaProperties(kind!)){
        const ptype = await getNodeType(p, undefined, undefined, undefined, threadId) as PropertyType;
        if (!ptype) continue;
        if (ptype && ptype.property?.toLowerCase() === property) return ptype
      }
    }
  }
  return undefined;
}
