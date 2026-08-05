import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, SchemaType, PropertyValueType, ForSchema, Static, buildFuncCall, EntrySource } from '../index';
import type { IConstraintProperty } from '../constraintProperty';
import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, NS_SYSTEM_STRING, SCHEMA_KIND_ARRAY, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, SCHEMA_KIND_STRUCT, NS_SYSTEM_LIST, NS_SYSTEM_SCHEMA_REFLECT_STRUCT, ARRAY_ELEMENT } from '../../utility/constant';
import { IValueAccess } from '../../runtime/interfaces';
import { ArrayNode } from '../../node/arrayNode';
import { isNull } from '../../utility/toolset';
import { StructNode } from '../../node/structNode';
import { Error, Visible } from '../common';
import { Relation } from '../../attribute';
import { Assign, Call } from '../../relation';

@Meta(ForSchema, [SCHEMA_KIND_ARRAY])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.primary`)
@Meta(Static, true)
@Meta(PropertyValueType, `${NS_SYSTEM_LIST}<${NS_SYSTEM_STRING}>`)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.primary.error`)
@Relation(Visible, Call, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, '@element', SCHEMA_KIND_STRUCT))
@Relation(EntrySource, Assign, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_STRUCT}.getindexablefields`, '@element'), `primary.${ARRAY_ELEMENT}`)
export class Primary extends Property<string[]> implements IConstraintProperty {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node.isEmpty || !this._value?.length) return undefined;
    if (node instanceof ArrayNode)
    {
      const keys = new Set<string>();
      for (const item of node)
      {
        const data = item.rawValue;
        const key = typeof(data) === 'object' ? this.getPrimarys(data as Record<string, unknown>) : undefined;
        if (!key || !keys.has(key)) {
          if (key) keys.add(key);
          this.recordViolation(item, false);
        }
        else {
          this.recordViolation(item, false);
        }
      }
    }
    return undefined;
  }

  private recordViolation(node: IValueAccess, result: boolean) {
    if (node instanceof StructNode)
    {
      for (let i = this._value!.length; i--;) {
        const last = node.getAccessValue(this._value![i]);
        if (last) {
          last.recordConstraint(this, result);
          break;
        }
      }
    }
    else
    {
      node.recordConstraint(this, result);
    }
  }

  private getPrimarys(data: Record<string, unknown>): string | undefined
  {
    const keys: string[] = [];
    for (const key of this._value!)
    {
      if (isNull(data[key])) return undefined;
      keys.push(`${data[key]}`);
    }
    return keys.join('|');
  }
}
