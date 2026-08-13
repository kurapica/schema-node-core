import { RecordProperty } from '../recordProperty';
import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';
import { registerSchemaKind } from '../../runtime/schemaRuntime';
import { isNull } from '../../utility/toolset';

import { SCHEMA_KIND_ENUM, NS_SYSTEM_SCHEMA, NS_SYSTEM_STRING } from '../../utility/constant';

@Meta(OfSchema, SCHEMA_KIND_ENUM)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA}.kind`)
@Meta(PropertyValueType, NS_SYSTEM_STRING)
export class SchemaKind extends RecordProperty<string> {
    apply(target: object, field?: string | symbol, descriptorOrIndex?: number | TypedPropertyDescriptor<unknown>): void {
        if (!isNull(field) || !isNull(descriptorOrIndex)) return;
        target = typeof target === 'function' ? target : target.constructor;
        registerSchemaKind(this.getValue<string>()!.toLowerCase(), target as Function);
    }
}

