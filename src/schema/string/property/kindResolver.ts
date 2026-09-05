import { Meta } from '../../../attribute/meta';
import { ReadOnly } from '../../../property/common/readOnly';
import { InVisible } from '../../../property/common/invisible';
import { Default } from '../../../property/common/default';
import { ForSchema } from '../../../property/core/forSchema';
import { OfSchema } from '../../../property/core/ofSchema';
import { SchemaType } from '../../../property/core/schemaType';
import { PropertyValueType } from '../../../property/core/propertyValueType';
import { Static } from '../../../property/core/static';
import { Property } from '../../../property/property';
import { KindProvider } from '../../../property/core/kindProvider';

import type { IValueAccess } from '../../../interface';

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_STRING, SCHEMA_KIND_STRING, NS_SYSTEM_SCHEMA_PRO_STRING } from '../../../utility/constant';

/** The access value provider property */
@Meta(ForSchema, [SCHEMA_KIND_STRING])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_STRING}.KindResolver`)
@Meta(PropertyValueType, NS_SYSTEM_STRING)
@Meta(Static, true)
@Meta(ReadOnly, true)
@Meta(InVisible, true)
export class KindResolver extends Property<boolean> {
  effect(target: IValueAccess, newValue?: unknown, oldValue?: unknown, source?: IValueAccess): void {
    this.clear(target, source);
    if (!newValue) return;
    setTimeout(() => {
      let provider: IValueAccess | undefined = target;

      // find the access value provider
      while (provider)
      {
        const kind = provider.getPropertyValue<string>(KindProvider);
        if (kind) {
          target.setPropertyValue(Default, kind, provider);
          break;
        }
        provider = provider.parent;
       }
    }, 0);
  } 
}   