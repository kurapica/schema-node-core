import { ScalarType } from '../scalarType';
import { IntNode } from '../../../node/scalarNode';
import { IntProperty, IntSchema } from '../../../schema/scalar/intSchema';
import { IProperty } from '../../../property';
import { getPropertiesBySchemaKind, getProperty } from '../../../property/propertyOwner';
import { SCHEMA_KIND_INT } from '../../../utility/constant';
import { getNodeType } from '../../schemaRuntime';
import { IPropertyProvider, IValueAccess } from '../../interfaces';

export class IntType extends ScalarType {
  private _intSchema: IntSchema | undefined
  
  override create(value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider): IntNode { return new IntNode(this, value, parent, propProvider); }

  override get isIndexable(): boolean { return true; }

  override loadProperties(): IProperty[] {
    this._intSchema = getProperty(this.schema, IntProperty)?.getValue();
    return this._intSchema ? Array.from(getPropertiesBySchemaKind(this._intSchema, SCHEMA_KIND_INT)) : [];
  }

  override async load() {
    this.baseNode = this._intSchema?.base
      ? await getNodeType(this._intSchema.base) as IntType
      : undefined;
  }
}
