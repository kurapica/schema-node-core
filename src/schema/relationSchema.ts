// =============================================================================
// RelationSchema — extension data under "relation" key
// =============================================================================

import { Relation } from '../attribute';
import { Meta } from '../attribute/meta';
import { RelationStage } from '../enum/relationStage';
import { SchemaKind, SchemaType, Attach, OfSchema, IProperty, PrimaryIndex, PropertyValueType, EntrySourceConsumer, Valid, buildFuncCall, Require, DisplayOnly, Default, InVisible } from '../property/index';
import { Property } from '../property/property';
import { Call } from '../relation';
import { IValueAccess } from '../runtime/interfaces';
import { RelationType } from '../runtime/type';
import { SCHEMA_KIND_RELATION, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_RELATION, NS_SYSTEM_SCHEMA_PROPERTY_CORE, SCHEMA_KIND_ORDER_RELATION, NS_SYSTEM_STRING, NS_SYSTEM_SCHEMA_PROPERTY_TYPE, NS_SYSTEM_SCHEMA_RELATION_TYPE, NS_SYSTEM_SCHEMA_RELATION_KIND, NS_SYSTEM_SCHEMA_KIND, NS_SYSTEM_SCHEMA_REFLECT_PROPERTY, NODE_SELF, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE } from '../utility/constant';

/** Pure data interface. */
export interface RelationSchema {
  /** The target of the relation */
  target: string;

  /** The property the relation applies to */
  property: string;

  /** The stage of the realtion been applied */
  stage: RelationStage;

  /** The relation kind */
  kind: string;

  /** The relation only works for the given schema kind(for property relation only) */
  forSchema?: string;

  /** The error message */
  error?: string;
}

/** Meta registration class (NOT exported). */
@Meta(SchemaKind, [SCHEMA_KIND_RELATION, SCHEMA_KIND_ORDER_RELATION])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_RELATION}.schema`)
@Meta(Attach, SCHEMA_KIND_RELATION)
class RelationSchemaMeta implements RelationSchema {
  /** The target of the relation */
  @Meta(SchemaType, NS_SYSTEM_STRING)
  @Meta(PrimaryIndex, 0)
  @Meta(EntrySourceConsumer, true)
  @Meta(Require, true)
  target!: string;

  /** The property the relation applies to */
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_PROPERTY_TYPE)
  @Meta(PrimaryIndex, 1)
  @Meta(Require, true)
  @Meta(Valid, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_PROPERTY}.notstatic`, NODE_SELF))
  property!: string;

  /** The value type of the property */
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
  @Meta(DisplayOnly, true)
  @Meta(InVisible, true)
  @Relation(Default, Call, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_PROPERTY}.getvaluetype`, '@property'))
  valueType?: string;

  /** The stage of the realtion been applied */
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_RELATION_TYPE)
  stage!: RelationStage;

  /** The relation kind */
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_RELATION_KIND)
  kind!: string;
}

/** The relations property */
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.relations`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_RELATION}.schemas`)
export class Relations extends Property<RelationSchema[]> {
  combine(other: IProperty): boolean {
    const otherSchema = other.getValue<RelationSchema[]>();
    if (!otherSchema?.length) return false;
    const selfSchema = this.getValue<RelationSchema[]>() ?? [];
    if (!selfSchema.length) {
      this.setValue(otherSchema);
      return true;
    }
    otherSchema.filter(r => !selfSchema.some(s => equal(s, r))).forEach(r => selfSchema.push(r));
    this.setValue(selfSchema);
    return true;
  }
}

/** Checks if two relation schemas are equal */
function equal(a: RelationSchema, b: RelationSchema): boolean {
  return a.target === b.target && a.property === b.property && a.stage === b.stage && a.kind === b.kind;
}

/** The handler to process the relations */
export interface IRelationProcess {
  /** load relation kind data from relation schema */
  load(schema: RelationSchema): Promise<void>;

  /** Attach the relation to the target */
  attach(relation: RelationType, owner: IValueAccess, target: IValueAccess): void;

  /** Detach the relation from the target */
  detach(relation: RelationType, owner: IValueAccess, target: IValueAccess): void;

  /** Execute the relation process and return the reuslt value */
  process(owner: IValueAccess, target: IValueAccess) : Promise<unknown>;
}