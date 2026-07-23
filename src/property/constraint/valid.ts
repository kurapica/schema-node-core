import { FuncCallProperty } from '../funcCallProperty';
import { Meta } from '../../attribute/meta';
import { OfSchema, ForSchema, SchemaType, PropertyValueType } from '../index';
import type { IConstraintProperty } from '../constraintProperty';
import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_STRING, SCHEMA_KIND_INT, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_DATE, SCHEMA_KIND_ENUM, NS_SYSTEM_SCHEMA_PROPERTY_COMMON, NS_SYSTEM_SCHEMA_FUNC } from '../../utility/constant';
import { IValueAccess } from '../../runtime/interfaces';
import { getNodeType } from '../../runtime/schemaRuntime';
import { FunctionType } from '../../runtime/type';
import { isEmpty } from '../../utility/toolset';

@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(ForSchema, [SCHEMA_KIND_STRING, SCHEMA_KIND_INT, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_DATE, SCHEMA_KIND_ENUM])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.valid`)
@Meta(PropertyValueType, NS_SYSTEM_SCHEMA_FUNC)
export class Valid extends FuncCallProperty implements IConstraintProperty {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node.isEmpty || !this._value?.func) return undefined;
    const func = await getNodeType(this._value.func) as FunctionType;
    if (!func) {
      console.error(`Valid property function ${this._value.func} is not a function type`);
      return undefined;
    }
    const owner = node.parent;
    return await func.call(this._value!.args.map(a => {
      if (isEmpty(a.source)) return a.value;
      const source = owner?.getAccessValue(a.source!, node);
      return source?.getValue();
    })) as boolean;
  }
}
