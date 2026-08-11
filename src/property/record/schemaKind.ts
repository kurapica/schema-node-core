import { RecordProperty } from '../recordProperty';
import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';
import { SCHEMA_KIND_ENUM, NS_SYSTEM_SCHEMA, NS_SYSTEM_STRING } from '../../utility/constant';
import { registerSchemaKind } from '../../runtime/schemaRuntime';

@Meta(OfSchema, SCHEMA_KIND_ENUM)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA}.kind`)
@Meta(PropertyValueType, NS_SYSTEM_STRING)
export class SchemaKind extends RecordProperty<string> {
    apply(target: object, field?: string | symbol, descriptorOrIndex?: number | TypedPropertyDescriptor<unknown>): void {
        return registerSchemaKind(this.getValue<string>()!.toLowerCase(), typeof target === 'function' ? target : target.constructor);
    }
}

