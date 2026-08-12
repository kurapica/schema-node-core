// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/Default.cs
// =============================================================================

import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { ForSchema } from '../core/forSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';
import { buildFuncCall } from '../../schema/function/type';
import { BlackList } from '../constraint/blackList';
import { Cascade } from '../constraint/cascade';
import { LeafOnly } from '../constraint/leafOnly';
import { OverrideType } from '../core/overrideType';
import { Root } from '../constraint/root';
import { SingleFlag } from '../constraint/singleFlag';
import { Visible } from './visible';
import { WhiteList } from '../constraint/whiteList';
import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_BOOL, SCHEMA_KIND_STRING, SCHEMA_KIND_DATE, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_INT, NS_SYSTEM_SCHEMA_PROPERTY_COMMON, NS_SYSTEM_OBJECT, SCHEMA_KIND_FUNC_ARG, SCHEMA_KIND_STRUCT_FIELD, NS_SYSTEM_INTRINSIC, NS_SYSTEM_SCHEMA_REFLECT, NS_SYSTEM_SCHEMA_REFLECT_ARRAY, SCHEMA_KIND_ENUM, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND } from '../../utility/constant';
import { isEmpty, isEqual } from '../../utility/toolset';
import { Relation } from '../../attribute/relation';
import { Call } from '../../relation/call/meta';
import type { IValueAccess } from '../../interface/valueAccess';

/** The Default property represents the default value */
@Meta(ForSchema, [SCHEMA_KIND_STRUCT_FIELD])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.default`)
@Meta(PropertyValueType, NS_SYSTEM_OBJECT)
@Relation(Visible, Call, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, '@type', true, SCHEMA_KIND_ENUM, SCHEMA_KIND_BOOL, SCHEMA_KIND_INT, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_STRING, SCHEMA_KIND_DATE))
@Relation(OverrideType, Call, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.getarrayelement`, '@type'))
@Relation(WhiteList, Call, buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@whiteList'))
@Relation(BlackList, Call, buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@blackList'))
@Relation(Root, Call, buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@root'))
@Relation(LeafOnly, Call, buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@leafOnly'))
@Relation(Cascade, Call, buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@cascade'))
@Relation(SingleFlag, Call, buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@singleFlag'))
export class Default extends Property<unknown> {
    apply(target: object, field?: string | symbol, descriptorOrIndex?: number | TypedPropertyDescriptor<unknown>): void {
        (target as unknown as Record<string, unknown>).default = this.getValue()!; // avoid cycle reference
    }

    override effect(target: IValueAccess, newValue?: unknown, oldValue?: unknown, source?: IValueAccess): void {
        const origin = target.getValue();
        if (isEmpty(origin) || isEqual(origin, oldValue))
            target.setValue(newValue);
    }
}
