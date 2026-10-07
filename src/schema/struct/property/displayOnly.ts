// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/DisplayOnly.cs
// =============================================================================

import { Meta } from '../../../attribute/meta';
import { Alias } from '../../../property/core/alias';
import { OfNodeKind } from '../../../property/core/ofNodeKind';
import { SchemaType } from '../../../property/core/schemaType';
import { ForSchema } from '../../../property/core/forSchema';
import { Static } from '../../../property/core/static';
import { PropertyValueType } from '../../../property/core/propertyValueType';

import type { IValueAccess } from '../../../interface';

import { NODE_KIND_PROPERTY, NS_SYSTEM_BOOL, SCHEMA_KIND_NODE_STRUCT_FIELD, NS_SYSTEM_SCHEMA_PRO_STRUCT } from '../../../utility/constant';
import { Property } from '../../../property/property';
import { ReadOnly } from '../../../property/common/readOnly';

/* The struct field is display only, meaning it is not editable in the UI and is not persisted to the database.*/
@Meta(Alias, 'displayOnly')
@Meta(ForSchema, [SCHEMA_KIND_NODE_STRUCT_FIELD])
@Meta(OfNodeKind, NODE_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_STRUCT}.DisplayOnly`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Meta(Static, true)
export class DisplayOnly extends Property<boolean> {
  override effect(target: IValueAccess): void {
    if (this._value) // static property only effect once
      target.setPropertyValue(ReadOnly, true);
  }
}
