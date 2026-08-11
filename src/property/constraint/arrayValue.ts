import { Meta } from '../../attribute/meta';
import { ArrayNode } from '../../node/arrayNode';
import { IValueAccess } from "../../runtime/interfaces";
import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, NS_SYSTEM_BOOL, SCHEMA_KIND_ARRAY } from '../../utility/constant';
import { InVisible } from '../common/invisible';
import { Default } from '../common/default';
import { Error } from '../common/error';
import { ConstraintProperty } from "../constraintProperty";
import { Alias } from '../core/alias';
import { ForSchema } from '../core/forSchema';
import { OfSchema } from '../core/ofSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';
import { Static } from '../core/static';

@Meta(Alias, 'array')
@Meta(ForSchema, [SCHEMA_KIND_ARRAY])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.array`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Meta(InVisible, true)
@Meta(Default, true)
@Meta(Static, true)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.array.error`)
export class ArrayValue extends ConstraintProperty<boolean> {
  override get hasValue(): boolean { return true; }

  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node instanceof ArrayNode)
    {
      for (const element of node.elements)
        await element.validate();
      return undefined;
    }
    return undefined;
  }
}
