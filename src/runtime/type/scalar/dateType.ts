import { ScalarType } from '../scalarType';
import { DateNode } from '../../../node/scalarNode';
import { DateProperty, DateSchema } from '../../../schema/scalar/dateSchema';
import { getPropertiesBySchemaKind, getProperty } from '../../../property/propertyOwner';
import { IProperty } from '../../../property';
import { SCHEMA_KIND_DATE } from '../../../utility/constant';
import { getNodeType } from '../../schemaRuntime';

export class DateType extends ScalarType {
  private _dateSchema: DateSchema | undefined

  override create(): DateNode { return new DateNode(this); }

  override get isIndexable(): boolean { return true; }

  override loadProperties(): IProperty[] {
    this._dateSchema = getProperty(this.schema, DateProperty)?.getValue()
    return this._dateSchema ? getPropertiesBySchemaKind(this._dateSchema, SCHEMA_KIND_DATE) : [];
  }

  override async load() {
    this.baseNode = this._dateSchema?.base
      ? await getNodeType(this._dateSchema.base) as DateType
      : undefined;
  }
}
