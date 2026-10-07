import { RecordProperty } from '../recordProperty';
import { Meta } from '../../attribute/meta';
import { Alias } from '../core/alias';
import { OfNodeKind } from '../core/ofNodeKind';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';
import { isNull } from '../../utility/toolset';

import { NODE_KIND_ENUM, NS_SYSTEM_SCHEMA_NODE, NS_SYSTEM_STRING } from '../../utility/constant';

@Meta(Alias, 'nodeKind')
@Meta(OfNodeKind, NODE_KIND_ENUM)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_NODE}.kind`)
@Meta(PropertyValueType, NS_SYSTEM_STRING)
export class NodeKind extends RecordProperty<string> {
    apply(target: object, field?: string | symbol, descriptorOrIndex?: number | TypedPropertyDescriptor<unknown>): void {
        if (!isNull(field) || !isNull(descriptorOrIndex)) return;
        target = typeof target === 'function' ? target : target.constructor;
        (target as unknown as Record<string, string>).nodeKind = this.getValue<string>()!;
    }
}
