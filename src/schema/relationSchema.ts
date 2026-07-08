// =============================================================================
// RelationSchema — extension data under "relation" key
// =============================================================================

import { Meta } from '../attribute/meta';
import { RelationStage } from '../enum/relationStage';
import { SchemaKind, SchemaType, Attach, OfSchema, IProperty } from '../property/index';
import { Property } from '../property/property';
import { SCHEMA_KIND_RELATION, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_RELATION, NS_SYSTEM_SCHEMA_PROPERTY_CORE, SCHEMA_KIND_ORDER_RELATION, NS_SYSTEM_STRING, NS_SYSTEM_SCHEMA_PROPERTY_TYPE, NS_SYSTEM_SCHEMA_RELATION_TYPE, NS_SYSTEM_SCHEMA_RELATION_KIND } from '../utility/constant';

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
}

/** Meta registration class (NOT exported). */
@Meta(SchemaKind, [SCHEMA_KIND_RELATION, SCHEMA_KIND_ORDER_RELATION])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_RELATION}.schema`)
@Meta(Attach, SCHEMA_KIND_RELATION)
class RelationSchemaMeta implements RelationSchema {
  /** The target of the relation */
  @Meta(SchemaType, NS_SYSTEM_STRING)
  target!: string;

  /** The property the relation applies to */
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_PROPERTY_TYPE)
  property!: string;

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
  
}