// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/DisplayOnly.cs
// =============================================================================

import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { SchemaType } from '../core/schemaType';
import { ForSchema } from '../core/forSchema';
import { Static } from '../core/static';
import { PropertyValueType } from '../core/propertyValueType';
import { Default } from './default';
import { ReadOnly } from './readOnly';
import { isEmpty } from '../../utility/toolset';

import type { IValueAccess } from '../../interface';

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_COMMON, NS_SYSTEM_BOOL, SCHEMA_KIND_STRUCT_FIELD } from '../../utility/constant';

/**
 * The struct field is display only, meaning it is not editable in the UI and is not persisted to the database.
 */
@Meta(ForSchema, [SCHEMA_KIND_STRUCT_FIELD])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.DisplayOnly`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Meta(Static, true)
export class DisplayOnly extends Property<boolean> {
  override effect(target: IValueAccess, newValue?: unknown, oldValue?: unknown, source?: IValueAccess): void {
    if (newValue) // static property only effect once
    {
      const value = target.getValue();
      if (!isEmpty(value))
        target.setPropertyValue(Default, value);
      target.setPropertyValue(ReadOnly, true);
    }
  }
}
