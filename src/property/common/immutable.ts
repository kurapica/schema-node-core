// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/Immutable.cs
// =============================================================================

import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { SchemaType } from '../core/schemaType';
import { ForSchema } from '../core/forSchema';
import { PropertyValueType } from '../core/propertyValueType';
import { Static } from '../core/static';
import { ReadOnly } from './readOnly';
import { isEmpty } from '../../utility/toolset';
import { DataNode } from '../../schema/value/node';

import type { IValueAccess } from '../../interface';

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PRO_COMMON, NS_SYSTEM_BOOL } from '../../utility/constant';

/**
 * The `Immutable` property indicates whether a field is immutable, meaning that its value cannot be changed after it has been set. 
 */
@Meta(ForSchema, [SCHEMA_KIND_PROPERTY])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_COMMON}.Immutable`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Meta(Static, true)
export class Immutable extends Property<boolean> {
  override effect(target: IValueAccess, newValue?: unknown, oldValue?: unknown, source?: IValueAccess): void {
    if (newValue && target instanceof DataNode) // static property only effect once
    {
      const value = target.original;
      if (!isEmpty(value))
        target.setPropertyValue(ReadOnly, true);
    }
  }
}
