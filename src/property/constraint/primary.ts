import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';
import { ForSchema } from '../core/forSchema';
import { Static } from '../core/static';
import { buildFuncCall } from '../../schema/function/type';
import { EntrySource } from '../core/entrySource';
import { ConstraintProperty } from '../constraintProperty';
import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, NS_SYSTEM_STRING, SCHEMA_KIND_ARRAY, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, SCHEMA_KIND_STRUCT, NS_SYSTEM_LIST, NS_SYSTEM_SCHEMA_REFLECT_STRUCT, ARRAY_ELEMENT } from '../../utility/constant';
import type { IValueAccess } from '../../interface';
import { isNull } from '../../utility/toolset';
import { Error } from '../common/error';
import { Visible } from '../common/visible';
import { Relation } from '../../attribute/relation';

@Meta(ForSchema, [SCHEMA_KIND_ARRAY])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.primary`)
@Meta(Static, true)
@Meta(PropertyValueType, `${NS_SYSTEM_LIST}<${NS_SYSTEM_STRING}>`)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.primary.error`)
@Relation(Visible,'call', buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, '@element', SCHEMA_KIND_STRUCT))
@Relation(EntrySource,'assign', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_STRUCT}.getindexablefields`, '@element'), `primary.${ARRAY_ELEMENT}`)
export class Primary extends ConstraintProperty<string[]> {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node.isEmpty || !this._value?.length) return undefined;
    if (node.type.kind === SCHEMA_KIND_ARRAY)
    {
      const keys = new Set<string>();
      for (const item of (node as unknown as Iterable<IValueAccess>))
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
    if (node.type.kind === SCHEMA_KIND_STRUCT)
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
