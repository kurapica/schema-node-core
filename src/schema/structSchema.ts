// =============================================================================
// StructSchema — extension data stored under the "struct" key in NodeSchema
// StructProperty is the Property<StructSchema> bridge for getProperty/getProperties
// =============================================================================

import { Meta, getMetaFields, getMetaProperties, getMetaPropertiesForSchema } from '../attribute/meta';
import { RuntimeNodeType } from '../property/core/runtimeNodeType';
import { PrimaryIndex, UniqueIndex, Index } from '../property/core/indexes';
import { Primary } from '../property/constraint/primary';
import { DataIndex, Indexes } from '../property/constraint/indexes';
import { SchemaKind, NodeSchemaKind, ValueSchemaKind, SchemaType, Attach, Append, ForSchema, OfSchema, SchemaGenerator, Require, Display, PropertyValueType, Visible, Valid, Generics, GenericParameter, StructValue, Default, EntrySourceProvider } from '../property/index';
import { IProperty, Property } from '../property/property';
import { combineProperties, getProperty, setProperty, setPropertyValue } from '../property/propertyOwner';
import { StructType } from '../runtime/type';
import { SCHEMA_KIND_STRUCT, SCHEMA_KIND_STRUCT_FIELD, SCHEMA_KIND_NODE, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_STRUCT, NS_SYSTEM_SCHEMA_PROPERTY_CORE, SCHEMA_KIND_ORDER_STRUCT, SCHEMA_KIND_ORDER_STRUCT_FIELD, NS_SYSTEM_IDENTIFIER, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, SCHEMA_KIND_ARRAY, NS_SYSTEM_LOGIC_EQ, NODE_SELF, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, SCHEMA_KIND_STRING, NS_SYSTEM_SCHEMA_REFLECT, NS_SYSTEM_SCHEMA_REFLECT_STRUCT, NS_SYSTEM_SCHEMA_REFLECT_TYPE, ENTRY_ROOT } from '../utility/constant';
import { combinePaths } from '../utility/toolset';
import { NodeSchema } from './nodeSchema';
import { Relations } from './relationSchema';
import { ArraySchema, ArrayProperty } from './arraySchema';
import { getRelationSchemas, Relation } from '../attribute/relation';
import { Base } from '../property/core/base';
import { saveNodeSchema } from '../runtime/schemaRuntime';
import { Call } from '../relation/call';
import { buildFuncCall } from '../property/funcCallProperty';

/** The struct schema */
export interface StructSchema {
  fields: StructFieldSchema[];
}

/** A single field definition within a struct. */
export interface StructFieldSchema {
  name: string;
  type: string;
  error?: string;
}

/** Built-in struct type Meta registration (NOT exported). */
@Meta(SchemaKind, [SCHEMA_KIND_STRUCT, SCHEMA_KIND_ORDER_STRUCT])
@Meta(NodeSchemaKind, [SCHEMA_KIND_STRUCT, SCHEMA_KIND_ORDER_STRUCT])
@Meta(ValueSchemaKind, [SCHEMA_KIND_STRUCT, SCHEMA_KIND_ORDER_STRUCT])
@Meta(RuntimeNodeType, StructType)
@Meta(SchemaGenerator, generateStructSchema)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_STRUCT}.schema`)
@Meta(Attach, SCHEMA_KIND_STRUCT)
@Meta(StructValue)
@Meta(Append, [Relations, EntrySourceProvider])
@Meta(EntrySourceProvider, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_STRUCT}.getaccessentries`, '@fields', NODE_SELF, ENTRY_ROOT))
class StructSchemaMeta implements StructSchema {
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_STRUCT}.fields`)
  fields: StructFieldSchema[] = [];
}

/** The struct field schema meta */
@Meta(SchemaKind, [SCHEMA_KIND_STRUCT_FIELD, SCHEMA_KIND_ORDER_STRUCT_FIELD])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_STRUCT}.field`)
@Meta(Attach, SCHEMA_KIND_STRUCT_FIELD)
class StructFieldSchemaMeta implements StructFieldSchema {
  /** The field name */
  @Meta(SchemaType, NS_SYSTEM_IDENTIFIER)
  @Meta(Require, true)
  @Meta(PrimaryIndex)
  @Relation(Default, Call, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_TYPE}.gettypename`, '@type'))
  name!: string;

  /** The field type */
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
  @Meta(Require, true)
  type!: string;
}

/** Property bridge. */
@Meta(ForSchema, [SCHEMA_KIND_NODE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.struct`)
@Meta(PropertyValueType, `$${NS_SYSTEM_SCHEMA_STRUCT}.schema`)
@Relation(Visible, Call, buildFuncCall(NS_SYSTEM_LOGIC_EQ, '@kind', SCHEMA_KIND_STRUCT))
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
        }
        combineFields.push(combineProperties(selfSchema.fields[index], otherField, SCHEMA_KIND_STRUCT_FIELD));
      }
      else
        combineFields.push(otherField);
    }
    combineFields.push(...selfSchema.fields.filter(f => !matched.has(f.name.toLowerCase())))
    selfSchema.fields = combineFields;

    // combine properties
    combineProperties(selfSchema, otherSchema, SCHEMA_KIND_STRUCT);
    this.setValue(selfSchema);
    return true;
  }
}

/** Represents the struct value type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_STRUCT}.type`)
@Meta(Base, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
@Meta(Valid, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, NODE_SELF, SCHEMA_KIND_STRUCT))
class StructTypeMeta {}

// ── Helper ─────────────────────────────────────────────────────────────────

function generateStructSchema(namespace: string, name: string, ctor: Function) {
  const structName = combinePaths(namespace, name);
  const nodeSchema: NodeSchema = { namespace, name, kind: SCHEMA_KIND_STRUCT };
  const structSchema: StructSchema = { fields: [] };

  // Collect primary fields & indexes from Meta-declared fields
  const primaries: { order: number; field: string }[] = [];
  const pendingIndexes = new Map<string, { name: string; isUnique: boolean; fields: { order: number; field: string }[] }>();

  const fields = getMetaFields(ctor);
  for (const field of fields) {
    // Gets the schema type for the field
    const props = getMetaProperties(ctor, undefined, field);
    const schemaType = props.find(p => p instanceof SchemaType);
    if (!schemaType?.hasValue) {
      console.error(`The field ${field}'s schema type missing in struct ${structName}`);
      continue;
    }

    // Generate the StructFieldSchema with savable properties and add to the struct schema
    const fieldSchema: StructFieldSchema = { name: field, type: schemaType.getValue<string>()! };
    props.filter(p => p.savable).forEach(p => setProperty(fieldSchema, p));
    structSchema.fields.push(fieldSchema);

    // Collect index metadata per field
    for (const prop of props) {
      if (prop instanceof PrimaryIndex) {
        primaries.push({ order: prop.order, field });
      } else if (prop instanceof UniqueIndex) {
        const value = prop.getValue<string>();
        const indexName = value || field;
        if (!pendingIndexes.has(indexName)) {
          pendingIndexes.set(indexName, { name: indexName, isUnique: true, fields: [] });
        } else {
          pendingIndexes.get(indexName)!.isUnique = true;
        }
        pendingIndexes.get(indexName)!.fields.push({ order: prop.order, field });
      } else if (prop instanceof Index) {
        const value = prop.getValue<string>();
        const indexName = value || field;
        if (!pendingIndexes.has(indexName)) {
          pendingIndexes.set(indexName, { name: indexName, isUnique: false, fields: [] });
        }
        pendingIndexes.get(indexName)!.fields.push({ order: prop.order, field });
      }
    }
  }

  // Build
  setPropertyValue(nodeSchema, Display, { key: structName });
  getMetaPropertiesForSchema(SCHEMA_KIND_NODE, ctor).forEach(p => setProperty(nodeSchema, p));
  getMetaPropertiesForSchema(SCHEMA_KIND_STRUCT, ctor).forEach(p => setProperty(structSchema, p));

  // Collect relations
  const relations = getRelationSchemas(ctor);
  if (relations.length > 0)
    setPropertyValue(structSchema, Relations, relations);
  
  // save struct schema
  setPropertyValue(nodeSchema, StructProperty, structSchema);
  saveNodeSchema(nodeSchema);

  // Companion ArraySchema
  const primaryFields = buildOrderedFields(primaries);
  const dataIndexes = buildDataIndexes(pendingIndexes);
  if (primaryFields.length > 0 || dataIndexes.length > 0) {
    const arraySchema: ArraySchema = { element: structName };
    if (primaryFields.length > 0) {
      setPropertyValue(arraySchema, Primary, primaryFields);
    }
    if (dataIndexes.length > 0) {
      setPropertyValue(arraySchema, Indexes, dataIndexes);
    }
    // generic
    const generics = getProperty(structSchema, Generics);
    if (generics?.hasValue)
    {
      setProperty(arraySchema, generics);
      arraySchema.element = `${structName}<${generics.getValue<GenericParameter[]>()!.map(g => g.name).join(',')}>`
    }

    const arrayNode: NodeSchema = { namespace, name: `${name}s`, kind: SCHEMA_KIND_ARRAY };
    setPropertyValue(arrayNode, Display, { key: `{LIST.PREFIX}{${structName}}{LIST.SUFFIX}` });
    setPropertyValue(arrayNode, ArrayProperty, arraySchema);
    saveNodeSchema(arrayNode);
  }
}

function buildOrderedFields(items: { order: number; field: string }[]): string[] {
  const result: string[] = [];
  const seen = new Set<string>();
  for (const item of [...items].sort((a, b) => a.order - b.order)) {
    if (item.field && !seen.has(item.field)) {
      seen.add(item.field);
      result.push(item.field);
    }
  }
  return result;
}

function buildDataIndexes(indexes: Map<string, { name: string; isUnique: boolean; fields: { order: number; field: string }[] }>): DataIndex[] {
  const result: DataIndex[] = [];
  for (const [, idx] of indexes) {
    const fields = buildOrderedFields(idx.fields);
    if (fields.length > 0) {
      result.push({ name: idx.name, fields, isUnique: idx.isUnique });
    }
  }
  return result;
}