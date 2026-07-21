import { ScalarType } from '../scalarType';
import { StringNode } from '../../../node/scalarNode';
import { StringProperty, StringSchema } from '../../../schema/scalar/stringSchema';
import { IProperty, UpLimitString } from '../../../property';
import { ENTITY_PRIMARY_KEY_MAX_LEN, SCHEMA_KIND_STRING } from '../../../utility/constant';
import { getProperty, getPropertiesBySchemaKind } from '../../../property/propertyOwner';
import { getNodeType } from '../../schemaRuntime';
import { IValueAccess } from '../../interfaces';

export class StringType extends ScalarType {
  private _stringSchema: StringSchema | undefined;

  override create(value: unknown, parent?: IValueAccess): StringNode { return new StringNode(this, value, parent); }

  override get isIndexable(): boolean {
    const uplimit = this.getProperty(UpLimitString);
    return uplimit?.hasValue && uplimit.getValue<number>()! < ENTITY_PRIMARY_KEY_MAX_LEN ? true : false; 
  }

  override loadProperties(): IProperty[] {
    this._stringSchema = getProperty(this.schema, StringProperty)?.getValue();
    return this._stringSchema ? getPropertiesBySchemaKind(this._stringSchema, SCHEMA_KIND_STRING).toArray() : [];
  }

  override async load() {
    this.baseNode = this._stringSchema?.base
      ? await getNodeType(this._stringSchema.base) as StringType
      : undefined;
  }
}
