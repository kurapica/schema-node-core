import { ScalarType } from '../scalarType';
import { StringNode } from '../../../node/scalarNode';
import { StringProperty, StringSchema } from '../../../schema/scalar/stringSchema';
import { IProperty, UpLimitString } from '../../../property';
import { ENTITY_PRIMARY_KEY_MAX_LEN, SCHEMA_KIND_STRING } from '../../../utility/constant';
import { getProperty, getPropertiesBySchemaKind } from '../../../property/propertyOwner';
import { getNodeType } from '../../schemaRuntime';
import { IPropertyProvider, IValueAccess } from '../../interfaces';

export class StringType extends ScalarType {
  private _stringSchema: StringSchema | undefined;

  override create(value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider): StringNode { return new StringNode(this, value, parent, propProvider); }

  override get isIndexable(): boolean {
    const uplimit = this.getProperty(UpLimitString);
    return uplimit?.hasValue && uplimit.getValue<number>()! < ENTITY_PRIMARY_KEY_MAX_LEN ? true : false; 
  }

  override loadProperties(): IProperty[] {
    this._stringSchema = getProperty(this.schema, StringProperty)?.getValue();
    return this._stringSchema ? Array.from(getPropertiesBySchemaKind(this._stringSchema, SCHEMA_KIND_STRING)) : [];
  }

  override async load() {
    this.baseType = this._stringSchema?.base
      ? await getNodeType(this._stringSchema.base) as StringType
      : undefined;
  }
}
