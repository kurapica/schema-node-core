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
  override effect(target: IValueAccess): void {
    this.clear(target);
    target.recordSubscription(target.subscribe(() => target.setPropertyValue(ReadOnly, !isEmpty(target.original) || undefined), true), this);
  }

  override clear(target: IValueAccess): void {
    target.clearSubscription(this);
  }
}
