import { FuncCallProperty } from '../funcCallProperty';
import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { ForSchema } from '../core/forSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';
import { Stackable } from '../core/stackable';
import { getNodeType } from '../../runtime/context';
import { isEmpty, isNull } from '../../utility/toolset';
import { Error } from '../common/error';
import { StructNode } from '../../schema/struct/node';
import { FunctionType } from '../../schema/function/runtime';
import { getErrorMessage } from '../constraintProperty';

import type { IConstraintProperty, IValueAccess } from '../../interface';

import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_STRING, SCHEMA_KIND_INT, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_DATE, SCHEMA_KIND_ENUM, NS_SYSTEM_SCHEMA_PROPERTY_COMMON, NS_SYSTEM_SCHEMA_FUNC, SCHEMA_KIND_STRUCT } from '../../utility/constant';
import { Property } from '../property';

/** The valid constraint. Check if the node is valid. If not, return the error message. */
@Meta(ForSchema, [SCHEMA_KIND_STRING, SCHEMA_KIND_INT, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_DATE, SCHEMA_KIND_ENUM, SCHEMA_KIND_STRUCT])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.valid`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_FUNC}.funccall`)
@Meta(Stackable, true)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.valid.error`)
export class Valid extends FuncCallProperty implements IConstraintProperty {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node.isEmpty || !this._value?.func) return undefined;
    if (!(node instanceof StructNode) && isNull(node.getValue())) return undefined;
    
    const func = await getNodeType(this._value.func) as FunctionType;
    if (!func) {
      console.error(`Valid property function ${this._value.func} is not a function type`);
      return undefined;
    }
    const owner = node;
    return await func.call(this._value!.args.map(a => {
      if (isEmpty(a.source)) return a.value;
      const source = owner?.getAccessValue(a.source!, node);
      return source?.getValue();
    })) as boolean;
  }

  error(node: IValueAccess): string | undefined {
    return getErrorMessage(this, node);
  }
}
