// =============================================================================
// schema-node-core — Public API barrel exports
// =============================================================================

// ── Constants ──────────────────────────────────────────────────────────────
export * from './utility/constant';

// ── Enums ──────────────────────────────────────────────────────────────────
export * from './enum/expType';
export * from './enum/relationStage';
export * from './enum/enumValueType';
export * from './enum/logicType';
export * from './enum/arithmeticType';
export * from './enum/functionFlags';
export * from './enum/runtimeStage';
export * from './enum/schemaLoadState';

// ── Property System ────────────────────────────────────────────────────────
export * from './property/index';

// ── Attribute System ───────────────────────────────────────────────────────
export { Meta, getMetaProperty, getMetaProperties, getMetaPropertiesForSchema } from './attribute/meta';
export * from './attribute/relation';
export { Relation, RelationAssign, getRelationEntries } from './attribute/relation';

// ── Schema Types ───────────────────────────────────────────────────────────
export { NodeSchema } from './schema/nodeSchema';
export type { CompatibleSchema } from './schema/nodeSchema';
export { StructSchema, StructProperty } from './schema/structSchema';
export type { StructFieldSchema } from './schema/structSchema';
export { ArraySchema, ArrayProperty } from './schema/arraySchema';
export { EnumSchema, EnumProperty } from './schema/enumSchema';
export type { EnumValueSchema, EnumValueAccess } from './schema/enumSchema';
export { FunctionSchema, FuncProperty } from './schema/functionSchema';
export type { FuncArg, FuncExp, CallArg } from './schema/functionSchema';
export { PropertySchema } from './schema/propertySchema';
export { RelationSchema } from './schema/relationSchema';
export { IntSchema } from './schema/scalar/intSchema';
export { DecimalSchema } from './schema/scalar/decimalSchema';
export { StringSchema } from './schema/scalar/stringSchema';
export { DateSchema } from './schema/scalar/dateSchema';
export type { INodeSchemaProvider } from './schema/provider/schemaProvider';

// ── Runtime ────────────────────────────────────────────────────────────────
export type { IValueAccess } from './runtime/interfaces';

// ── Runtime Types ──────────────────────────────────────────────────────────
export {
  NodeType, ValueType, FunctionType, StructType, ArrayType, EnumType,
  NamespaceType, PropertyType, RelationType, GenericType, ScalarType,
  BoolType, IntType, DecimalType, StringType, DateType, ObjectType,
} from './runtime/type/index';
export type { StructFieldType } from './runtime/type/index';

// ── Node ───────────────────────────────────────────────────────────────────
export { DataNode } from './node/dataNode';
export { ScalarNode, AnyNode, BoolNode, StringNode, IntNode, DecimalNode, DateNode } from './node/scalarNode';
export { StructNode } from './node/structNode';
export { ArrayNode } from './node/arrayNode';
export { EnumNode } from './node/enumNode';

// ── Service ────────────────────────────────────────────────────────────────
export { createSchemaRuntime, scanModules, activateRuntime } from './service/service';
export { DefaultRuntimeStageHandler } from './service/runtimeStageHandler';

// ── Function ───────────────────────────────────────────────────────────────

// ── Struct & System Types ──────────────────────────────────────────────────
export { systemStructTypes, systemScalarTypes } from './struct/systemTypes';
export * from './struct/systemTypes';
