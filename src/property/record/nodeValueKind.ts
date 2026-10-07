import { RecordProperty } from '../recordProperty';
import { Meta } from '../../attribute/meta';
import { Alias } from '../core/alias';
import { OfNodeKind } from '../core/ofNodeKind';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';

import { NODE_KIND_PROPERTY, NS_SYSTEM_SCHEMA_NODE, NS_SYSTEM_STRING } from '../../utility/constant';

@Meta(Alias, 'nodeValueKind')
@Meta(OfNodeKind, NODE_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_NODE}.valuekind`)
@Meta(PropertyValueType, NS_SYSTEM_STRING)
export class NodeValueKind extends RecordProperty<string> {}
