import { Meta } from '../../../attribute/meta';
import { OfSchema } from '../../../property/core/ofSchema';
import { SchemaType } from '../../../property/core/schemaType';
import { PropertyValueType } from '../../../property/core/propertyValueType';
import { ForSchema } from '../../../property/core/forSchema';
import { Static } from '../../../property/core/static';
import { ConstraintProperty } from '../../../property/constraintProperty';
import { isNull } from '../../../utility/toolset';
import { Error } from '../../../property/common/error';

import type { IValueAccess } from '../../../interface';

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_STRING, SCHEMA_KIND_ARRAY, SCHEMA_KIND_STRUCT, NS_SYSTEM_LIST, NS_SYSTEM_SCHEMA_PRO_ARRAY, SCHEMA_KIND_ARRAY_DEFINE } from '../../../utility/constant';

@Meta(ForSchema, [SCHEMA_KIND_ARRAY, SCHEMA_KIND_ARRAY_DEFINE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_ARRAY}.primary`)
@Meta(Static, true)
@Meta(PropertyValueType, `${NS_SYSTEM_LIST}<${NS_SYSTEM_STRING}>`)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PRO_ARRAY}.primary.error`)
export class Primary extends ConstraintProperty<string[]> {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node.isEmpty || !this._value?.length || node.type.kind !== SCHEMA_KIND_ARRAY) return undefined;

    const keys = new Set<string>();
    for (const item of (node as unknown as Iterable<IValueAccess>))
    {
      const data = item.rawValue;
      const key = typeof(data) === 'object' ? this.getPrimarys(data as Record<string, unknown>) : undefined;
      if (!key || !keys.has(key)) {
        if (key) keys.add(key);
        this.recordViolation(item, true);
      }
      else {
        this.recordViolation(item, false);
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
