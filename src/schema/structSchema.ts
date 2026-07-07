// =============================================================================
// StructSchema — extension data stored under the "struct" key in NodeSchema
// StructProperty is the Property<StructSchema> bridge for getProperty/getProperties
// =============================================================================

import { Meta, getMetaFields, getMetaProperties, getMetaPropertiesForSchema } from '../attribute/meta';
import { RuntimeNodeType } from '../property/core/RuntimeNodeType';
import { PrimaryIndex, UniqueIndex, Index } from '../property/core/indexes';
import { Primary } from '../property/constraint/primary';
import { Indexes } from '../property/constraint/indexes';
import { SchemaKind, NodeSchemaKind, ValueSchemaKind, SchemaType, Attach, Append, ForSchema, OfSchema, SchemaGenerator, Require, Display, PropertyValueType } from '../property/index';
import { IProperty, Property } from '../property/property';
import { combineProperties, setProperty, setPropertyValue } from '../property/propertyOwner';
import { saveSchema } from '../runtime/schemaRuntime';
import { StructType } from '../runtime/type';
import { SCHEMA_KIND_STRUCT, SCHEMA_KIND_STRUCT_FIELD, SCHEMA_KIND_NODE, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_STRUCT, NS_SYSTEM_SCHEMA_PROPERTY_CORE, SCHEMA_KIND_ORDER_STRUCT, SCHEMA_KIND_ORDER_STRUCT_FIELD, NS_SYSTEM_IDENTIFIER, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_SCHEMA_ERROR, SCHEMA_KIND_ARRAY } from '../utility/constant';
import { combinePaths } from '../utility/toolset';
import { NodeSchema } from './nodeSchema';
import { Relations } from './relationSchema';
import { ArraySchema, ArrayProperty, DataIndex } from './arraySchema';

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
@Meta(Append, [Relations])
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
  name!: string;

  /** The field type */
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
  @Meta(Require, true)
  type!: string;

  /** The field error */
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_ERROR)
  error?: string;
}

/** Property bridge. */
@Meta(ForSchema, [SCHEMA_KIND_NODE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.struct`)
@Meta(PropertyValueType, `$${NS_SYSTEM_SCHEMA_STRUCT}.schema`)
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

    // combine properties
    combineProperties(selfSchema, otherSchema, SCHEMA_KIND_STRUCT);
    this.setValue(selfSchema);
    return true;
  }
}

export function generateStructSchema(namespace: string, name: string, ctor: Function) {
  const structName = combinePaths(namespace, name);
  const nodeSchema: NodeSchema = { namespace, name, kind: SCHEMA_KIND_STRUCT };
  const structSchema: StructSchema = { fields: [] };

  // Collect primary fields & indexes from Meta-declared fields
  const primaries: { order: number; field: string }[] = [];
  const pendingIndexes = new Map<string, { name: string; isUnique: boolean; fields: { order: number; field: string }[] }>();

  const fields = getMetaFields(ctor);
  for (const field of fields) {
    const props = getMetaProperties(ctor, undefined, field);
    const schemaType = props.find(p => p instanceof SchemaType);
    if (!schemaType?.hasValue) {
      console.error(`The field ${field}'s schema type missing in struct ${structName}`);
      continue;
    }

    const fieldSchema: StructFieldSchema = { name: field, type: schemaType.getValue<string>()! };
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
  setPropertyValue(nodeSchema, StructProperty, structSchema);
  saveSchema(nodeSchema);

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

    const arrayNode: NodeSchema = { namespace, name: `${name}s`, kind: SCHEMA_KIND_ARRAY };
    setPropertyValue(arrayNode, Display, { key: `list of ${structName}` });
    setPropertyValue(arrayNode, ArrayProperty, arraySchema);
    saveSchema(arrayNode);
  }
}

// ── Helper ─────────────────────────────────────────────────────────────────

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