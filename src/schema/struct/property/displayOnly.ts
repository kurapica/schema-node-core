// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/DisplayOnly.cs
// =============================================================================

import { Meta } from '../../../attribute/meta';
import { OfSchema } from '../../../property/core/ofSchema';
import { SchemaType } from '../../../property/core/schemaType';
import { ForSchema } from '../../../property/core/forSchema';
import { Static } from '../../../property/core/static';
import { PropertyValueType } from '../../../property/core/propertyValueType';
import { Default } from '../../../property/common/default';
import { isEmpty } from '../../../utility/toolset';

import type { IValueAccess } from '../../../interface';

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_BOOL, SCHEMA_KIND_STRUCT_FIELD, NS_SYSTEM_SCHEMA_PRO_STRUCT } from '../../../utility/constant';
import { Property } from '../../../property/property';
import { ReadOnly } from '../../../property/common/readOnly';

/* The struct field is display only, meaning it is not editable in the UI and is not persisted to the database.*/
@Meta(ForSchema, [SCHEMA_KIND_STRUCT_FIELD])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_STRUCT}.DisplayOnly`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Meta(Static, true)
export class DisplayOnly extends Property<boolean> {
  override effect(target: IValueAccess): void {
    if (this._value) // static property only effect once
    {
      const value = target.getValue();
      if (!isEmpty(value))
        target.setPropertyValue(Default, value);
      target.setPropertyValue(ReadOnly, true);
    }
  }
}
