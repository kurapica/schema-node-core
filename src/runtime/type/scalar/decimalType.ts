import { ScalarType } from '../scalarType';
import { NumericNode } from '../../../node/scalarNode';
import { DecimalProperty, DecimalSchema } from '../../../schema/scalar/decimalSchema';
import { IProperty } from '../../../property';
import { getPropertiesBySchemaKind, getProperty } from '../../../property/propertyOwner';
import { SCHEMA_KIND_DECIMAL } from '../../../utility/constant';
import { getNodeType } from '../../schemaRuntime';

export class DecimalType extends ScalarType {
  private _decimalSchema: DecimalSchema | undefined

  override create(): NumericNode { return new NumericNode(this); }

  override loadProperties(): IProperty[] {
    this._decimalSchema = getProperty(this.schema, DecimalProperty)?.getValue();
    return this._decimalSchema ? getPropertiesBySchemaKind(this._decimalSchema, SCHEMA_KIND_DECIMAL) : [];
  }

  override async load() {
    this.baseNode = this._decimalSchema?.base
      ? await getNodeType(this._decimalSchema.base) as DecimalType
      : undefined;
  }  
}
