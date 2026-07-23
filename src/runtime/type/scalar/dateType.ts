import { ScalarType } from '../scalarType';
import { DateNode } from '../../../node/scalarNode';
import { DateProperty, DateSchema } from '../../../schema/scalar/dateSchema';
import { getPropertiesBySchemaKind, getProperty } from '../../../property/propertyOwner';
import { IProperty } from '../../../property';
import { SCHEMA_KIND_DATE } from '../../../utility/constant';
import { getNodeType } from '../../schemaRuntime';
import { IPropertyProvider, IValueAccess } from '../../interfaces';

export class DateType extends ScalarType {
  private _dateSchema: DateSchema | undefined

  override create(value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider): DateNode { return new DateNode(this, value, parent, propProvider); }

  override get isIndexable(): boolean { return true; }

  override loadProperties(): IProperty[] {
    this._dateSchema = getProperty(this.schema, DateProperty)?.getValue()
    return this._dateSchema ? getPropertiesBySchemaKind(this._dateSchema, SCHEMA_KIND_DATE).toArray() : [];
  }

  override async load() {
    this.baseNode = this._dateSchema?.base
      ? await getNodeType(this._dateSchema.base) as DateType
      : undefined;
  }
}
