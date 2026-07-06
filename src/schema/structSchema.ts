// =============================================================================
// StructSchema — extension data stored under the "struct" key in NodeSchema
// StructProperty is the Property<StructSchema> bridge for getProperty/getProperties
// =============================================================================

import { Meta, getMetaProperty } from '../attribute/meta';
import { Relation } from '../attribute/relation';
import { RuntimeNodeType } from '../property/core/RuntimeNodeType';
import { SchemaKind, NodeSchemaKind, ValueSchemaKind, SchemaType, Attach, Append, ForSchema, OfSchema, PropertyValueType, SchemaGenerator, EntrySource, Require } from '../property/index';
import { IProperty, Property } from '../property/property';
import { combineProperties } from '../property/propertyOwner';
import { StructType } from '../runtime/type';
import { SCHEMA_KIND_STRUCT, SCHEMA_KIND_STRUCT_FIELD, SCHEMA_KIND_NODE, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_STRUCT, NS_SYSTEM_SCHEMA_PROPERTY_CORE, SCHEMA_KIND_ORDER_STRING, SCHEMA_KIND_ORDER_STRUCT, NS_SYSTEM_SCHEMA_REFLECT_GET_SUB_ENTRIES, RELATION_OWNER, NODE_SELF, SCHEMA_KIND_ORDER_STRUCT_FIELD, NS_SYSTEM_IDENTIFIER, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_SCHEMA_ERROR, NS_SYSTEM_SCHEMA_FUNC, NS_SYSTEM_LIST, NS_SYSTEM_SCHEMA_FUNC_CALL_ARG } from '../utility/constant';
import { CallArg } from './functionSchema';
import { Relations } from './relationSchema';

/** A single field definition within a struct. */
export interface StructFieldSchema {
  name: string;
  type: string;
  error?: string;
}

/** The union validation between fields */
export interface StructUnionValidation {
  func: string;
  args: CallArg[];
  error?: string;
}

/** The struct schema */
export interface StructSchema {
  fields: StructFieldSchema[];
  unionValids?: StructUnionValidation[];
}

/** Built-in struct type Meta registration (NOT exported). */
@Meta(SchemaKind, [SCHEMA_KIND_STRUCT, SCHEMA_KIND_ORDER_STRUCT])
@Meta(NodeSchemaKind, [SCHEMA_KIND_STRUCT, SCHEMA_KIND_ORDER_STRUCT])
@Meta(ValueSchemaKind, [SCHEMA_KIND_STRUCT, SCHEMA_KIND_ORDER_STRUCT])
@Meta(RuntimeNodeType, StructType)
@Meta(SchemaGenerator, generateStructSchema)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_STRUCT}.schema`)
@Meta(Attach, SCHEMA_KIND_STRUCT)
@Meta(Append, [Relations])
@Relation(EntrySource,'$unionValids.args.source', NS_SYSTEM_SCHEMA_REFLECT_GET_SUB_ENTRIES, RELATION_OWNER, NODE_SELF)
class StructSchemaMeta implements StructSchema {
  fields: StructFieldSchema[] = [];
  unionValids?: StructUnionValidation[];
}

/** The struct field schema meta */
@Meta(SchemaKind, [SCHEMA_KIND_STRUCT_FIELD, SCHEMA_KIND_ORDER_STRUCT_FIELD])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_STRUCT}.field`)
@Meta(Attach, SCHEMA_KIND_STRUCT_FIELD)
class StructFieldSchemaMeta implements StructFieldSchema {
  /** The field name */
  @Meta(SchemaType, NS_SYSTEM_IDENTIFIER)
  @Meta(Require, true)
  name!: string;

  /** The field type */
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
  @Meta(Require, true)
  type!: string;

  /** The field error */
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_ERROR)
  error?: string;
}

/** The struct union validation meta */
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_STRUCT}.unionvalid`)
class StructUnionValidationMeta implements StructUnionValidation {
  /** The validation function */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_FUNC}.valid`)
  @Meta(Require, true)
  func!: string;

  /** The valdiation arguments */
  @Meta(SchemaType, `${NS_SYSTEM_LIST}<${NS_SYSTEM_SCHEMA_FUNC_CALL_ARG}>`)
  args!: CallArg[];

  /** The error */
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_ERROR)
  error?: string;
}

/** Property bridge. */
@Meta(ForSchema, [SCHEMA_KIND_NODE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.struct`)
export class StructProperty extends Property<StructSchema> {
  combine(other: IProperty): boolean {
    const otherSchema = other?.getValue<StructSchema>();
    if (!otherSchema) return false;
    const selfSchema = this.getValue<StructSchema>();
    if (!selfSchema)
    {
      this.setValue(otherSchema);
      return true;
    }

    // combine fields
    const combineFields : StructFieldSchema[] = []
    const matched = new Set<string>();
    for (let i = 0; i < otherSchema.fields.length; i++)
    {
      const otherField = otherSchema.fields[i];
      const name = otherField.name.toLowerCase();
      if (matched.has(name)) continue;
      matched.add(name);

      const index = selfSchema.fields.findIndex(f => f.name.toLowerCase() === name);
      if (index >= 0)
      {
        for (let j = 0; j < index; j++)
        {
          const existField = selfSchema.fields[j];
          const ename = existField.name.toLowerCase();
          if (otherSchema.fields.findIndex(f => f.name.toLowerCase() === ename) < 0 && !matched.has(ename))
          {
            matched.add(ename);
            combineFields.push(existField);
          }
          combineFields.push(combineProperties(selfSchema.fields[index], otherField, SCHEMA_KIND_STRUCT_FIELD));
        }
      }
      else
        combineFields.push(otherField);
    }
    combineFields.push(...selfSchema.fields.filter(f => !matched.has(f.name.toLowerCase())))
    selfSchema.fields = combineFields;

    // combine union valids
    if (otherSchema.unionValids?.length)
    {
      if (!selfSchema.unionValids?.length)
        selfSchema.unionValids = [...otherSchema.unionValids];
      else
      {
        for (let i = 0; i < otherSchema.unionValids.length; i++)
        {
          const otherValid = otherSchema.unionValids[i];
          let matched = false;
          for (let j = 0; j < selfSchema.unionValids.length; j++)
          {
            const selfValid = selfSchema.unionValids[j];
            if (selfValid.func === otherValid.func && selfValid.args.length === otherValid.args.length)
            {
              matched = true;
              for (let k = 0; k < selfValid.args.length; k++)
              {
                const sarg = selfValid.args[k];
                const oarg = otherValid.args[k];
                if (sarg.source != oarg.source && sarg.value != oarg.value)
                {
                  matched = false;
                  break;
                }
              }
              if (matched) break;
            }
          }
          if (!matched)
            selfSchema.unionValids.push(otherValid);
        }
      }
    }

    // combine properties
    combineProperties(selfSchema, otherSchema, SCHEMA_KIND_STRUCT);
    this.setValue(selfSchema);
    return true;
  }
}


export function generateStructSchema(name: string, target: object): void {
  const schemaTypeProp = getMetaProperty(target as Function, SchemaType);
  if (!schemaTypeProp?.hasValue) return;
  const fullName = schemaTypeProp.getValue<string>()!;
  const lastDot = fullName.lastIndexOf('.');
  const ns = lastDot >= 0 ? fullName.substring(0, lastDot) : '';
  const nm = lastDot >= 0 ? fullName.substring(lastDot + 1) : fullName;
  const structData: StructSchema = { fields: buildStructFields(target) };
  const node = new NodeSchema(nm, SCHEMA_KIND_STRUCT, ns);
  node.extensions = { struct: structData };
  saveSchema(node);
}

function buildStructFields(target: object): StructFieldSchema[] {
  const fields: StructFieldSchema[] = [];
  const proto = (target as { prototype?: object }).prototype;
  if (!proto) return fields;
  const metaStore = (proto as Record<symbol, Array<{ property: { _memberKey?: string } }>>)[Symbol.for('schema-node:meta')];
  if (!metaStore) return fields;
  let seqno = 0;
  for (const entry of metaStore) {
    const p = entry.property;
    if (!p._memberKey || !(entry.property instanceof SchemaType)) continue;
    fields.push({ name: p._memberKey, type: (entry.property as SchemaType).getValue<string>()!, seqno: seqno++, extensions: {} });
  }
  return fields;
}
