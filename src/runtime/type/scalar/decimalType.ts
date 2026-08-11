import { ScalarType } from '../scalarType';
import { DecimalNode } from '../../../node/scalarNode';
import { DecimalProperty, DecimalSchema } from '../../../schema/scalar/decimalSchema';
import { IProperty } from '../../../property/property';
import { getPropertiesBySchemaKind, getProperty } from '../../../property/propertyOwner';
import { SCHEMA_KIND_DECIMAL } from '../../../utility/constant';
import { getNodeType } from '../../schemaRuntime';
import { IPropertyProvider, IValueAccess } from '../../interfaces';

export class DecimalType extends ScalarType {
  private _decimalSchema: DecimalSchema | undefined

  override create(value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider): DecimalNode { return new DecimalNode(this, value, parent, propProvider); }

  override loadProperties(): IProperty[] {
    this._decimalSchema = getProperty(this.schema, DecimalProperty)?.getValue();
    return this._decimalSchema ? Array.from(getPropertiesBySchemaKind(this._decimalSchema, SCHEMA_KIND_DECIMAL)) : [];
  }

  override async load() {
    this.baseType = this._decimalSchema?.base
      ? await getNodeType(this._decimalSchema.base) as DecimalType
      : undefined;
  }  
}
