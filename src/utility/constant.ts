// =============================================================================
// SchemaNode.Core — Constants
// Mirrors C# SchemaNode.Core/Utility/Constant.cs
// =============================================================================

// ── Schema Kind ────────────────────────────────────────────────────────────

export const SCHEMA_KIND_NODE = 'node';
export const SCHEMA_KIND_NAMESPACE = 'namespace';
export const SCHEMA_KIND_OBJECT = 'object';
export const SCHEMA_KIND_BOOL = 'bool';
export const SCHEMA_KIND_INT = 'int';
export const SCHEMA_KIND_DECIMAL = 'decimal';
export const SCHEMA_KIND_STRING = 'string';
export const SCHEMA_KIND_DATE = 'date';
export const SCHEMA_KIND_ENUM = 'enum';
export const SCHEMA_KIND_STRUCT = 'struct';
export const SCHEMA_KIND_ARRAY = 'array';
export const SCHEMA_KIND_FUNCTION = 'function';
export const SCHEMA_KIND_PROPERTY = 'property';
export const SCHEMA_KIND_STRUCT_FIELD = 'structfield';
export const SCHEMA_KIND_ENUM_VALUE = 'enumvalue';
export const SCHEMA_KIND_RELATION = 'relation';

// ── Schema Kind Order ──────────────────────────────────────────────────────

export const SCHEMA_KIND_ORDER_NODE = 0;
export const SCHEMA_KIND_ORDER_NAMESPACE = 1;
export const SCHEMA_KIND_ORDER_OBJECT = 2;
export const SCHEMA_KIND_ORDER_BOOL = 3;
export const SCHEMA_KIND_ORDER_INT = 4;
export const SCHEMA_KIND_ORDER_DECIMAL = 5;
export const SCHEMA_KIND_ORDER_STRING = 6;
export const SCHEMA_KIND_ORDER_DATE = 7;
export const SCHEMA_KIND_ORDER_ENUM = 8;
export const SCHEMA_KIND_ORDER_STRUCT = 9;
export const SCHEMA_KIND_ORDER_ARRAY = 10;
export const SCHEMA_KIND_ORDER_FUNC = 11;
export const SCHEMA_KIND_ORDER_PROP = 12;
export const SCHEMA_KIND_ORDER_RELATION = 13;
export const SCHEMA_KIND_ORDER_ENUM_VALUE = 14;
export const SCHEMA_KIND_ORDER_STRUCT_FIELD = 15;

// ── Relation Path ──────────────────────────────────────────────────────────

export const RELATION_OWNER = '$owner';
export const ARRAY_PREVIOUS = '$previous';
export const ARRAY_ELEMENT = '$element';
export const NODE_SELF = '$self';

// ── Generic Pattern ────────────────────────────────────────────────────────

export const NS_GENERIC_TYPE = 'T';
export const REGEX_GENERIC_TYPE = /^T\d*$/;
export const REGEX_GENERIC_IMPLEMENT = /^([\w.]+)<(.+)>$/;

// ── System Namespace ───────────────────────────────────────────────────────

export const NS_SYSTEM = 'system';

// ── Data Types ─────────────────────────────────────────────────────────────

export const NS_SYSTEM_OBJECT = 'system.object';
export const NS_SYSTEM_ARRAY = 'system.array';
export const NS_SYSTEM_LIST = 'system.list';
export const NS_SYSTEM_BOOL = 'system.bool';
export const NS_SYSTEM_DATE = 'system.date';
export const NS_SYSTEM_NUMBER = 'system.number';
export const NS_SYSTEM_DOUBLE = 'system.double';
export const NS_SYSTEM_FLOAT = 'system.float';
export const NS_SYSTEM_PERCENT = 'system.percent';
export const NS_SYSTEM_FULL_DATE = 'system.fulldate';
export const NS_SYSTEM_INT = 'system.int';
export const NS_SYSTEM_STRING = 'system.string';
export const NS_SYSTEM_CHAR = 'system.char';
export const NS_SYSTEM_YEAR = 'system.year';
export const NS_SYSTEM_YEARMONTH = 'system.yearmonth';
export const NS_SYSTEM_GUID = 'system.guid';
export const NS_SYSTEM_RANGE_DATE = 'system.rangedate';
export const NS_SYSTEM_RANGE_FULL_DATE = 'system.rangefulldate';
export const NS_SYSTEM_RANGE_MONTH = 'system.rangemonth';
export const NS_SYSTEM_RANGE_YEAR = 'system.rangeyear';
export const NS_SYSTEM_IDENTIFIER = 'system.identifier';
export const NS_SYSTEM_CONTEXT = 'system.context';

// language / translate
export const NS_SYSTEM_LANGUAGE = 'system.language';
export const NS_SYSTEM_LOCALE_STRING = 'system.localestring';
export const NS_SYSTEM_LOCALE_TRAN = 'system.localetran';

// entry for white list
export const NS_SYSTEM_ENTRY = 'system.entry';

// ── Schema Namespace ───────────────────────────────────────────────────────

export const NS_SYSTEM_SCHEMA = 'system.schema';
export const NS_SYSTEM_SCHEMA_KIND = `${NS_SYSTEM_SCHEMA}.kind`;
export const NS_SYSTEM_SCHEMA_NODE = `${NS_SYSTEM_SCHEMA}.node`;
export const NS_SYSTEM_SCHEMA_NODE_VALUE_KIND = `${NS_SYSTEM_SCHEMA}.node.valuekind`;
export const NS_SYSTEM_SCHEMA_NS = `${NS_SYSTEM_SCHEMA}.namespace`;
export const NS_SYSTEM_SCHEMA_OBJECT = `${NS_SYSTEM_SCHEMA}.object`;
export const NS_SYSTEM_SCHEMA_BOOL = `${NS_SYSTEM_SCHEMA}.bool`;
export const NS_SYSTEM_SCHEMA_INT = `${NS_SYSTEM_SCHEMA}.int`;
export const NS_SYSTEM_SCHEMA_DECIMAL = `${NS_SYSTEM_SCHEMA}.decimal`;
export const NS_SYSTEM_SCHEMA_STRING = `${NS_SYSTEM_SCHEMA}.string`;
export const NS_SYSTEM_SCHEMA_DATE = `${NS_SYSTEM_SCHEMA}.date`;
export const NS_SYSTEM_SCHEMA_ENUM = `${NS_SYSTEM_SCHEMA}.enum`;
export const NS_SYSTEM_SCHEMA_STRUCT = `${NS_SYSTEM_SCHEMA}.struct`;
export const NS_SYSTEM_SCHEMA_STRUCT_FIELD = `${NS_SYSTEM_SCHEMA_STRUCT}.field`;
export const NS_SYSTEM_SCHEMA_ARRAY = `${NS_SYSTEM_SCHEMA}.array`;
export const NS_SYSTEM_SCHEMA_FUNC = `${NS_SYSTEM_SCHEMA}.func`;
export const NS_SYSTEM_SCHEMA_RELATION = `${NS_SYSTEM_SCHEMA}.relation`;
export const NS_SYSTEM_SCHEMA_PROPERTY = `${NS_SYSTEM_SCHEMA}.prop`;
export const NS_SYSTEM_SCHEMA_PROPERTY_CORE = `${NS_SYSTEM_SCHEMA_PROPERTY}.core`;
export const NS_SYSTEM_SCHEMA_PROPERTY_COMMON = `${NS_SYSTEM_SCHEMA_PROPERTY}.common`;
export const NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT = `${NS_SYSTEM_SCHEMA_PROPERTY}.constraint`;
export const NS_SYSTEM_SCHEMA_PROPERTY_FUNC = `${NS_SYSTEM_SCHEMA_PROPERTY}.func`;
export const NS_SYSTEM_SCHEMA_PROPERTY_RELATION = `${NS_SYSTEM_SCHEMA_PROPERTY}.relation`;

export const NS_SYSTEM_SCHEMA_ERROR = `${NS_SYSTEM_SCHEMA}.error`;

// ── Function Namespace ─────────────────────────────────────────────────────

export const NS_SYSTEM_INTRINSIC = 'system.intrinsic';
export const NS_SYSTEM_MATH = 'system.math';
export const NS_SYSTEM_LOGIC = 'system.logic';
export const NS_SYSTEM_CALENDAR = 'system.calendar';
export const NS_SYSTEM_COLLECTION = 'system.collection';
export const NS_SYSTEM_DATA = 'system.data';
export const NS_SYSTEM_STR = 'system.str';

export const NS_SYSTEM_SCHEMA_REFLECT = `${NS_SYSTEM_SCHEMA}.reflect`;
export const NS_SYSTEM_SCHEMA_REFLECT_FUNC = `${NS_SYSTEM_SCHEMA}.func`;

// ── Expression Priority ────────────────────────────────────────────────────

export const EXP_INTRINSIC_PRIORITY = 100;
export const EXP_LOGIC_PRIORITY = 90;
export const EXP_ARITHMETIC_PRIORITY = 80;
export const EXP_COLLECTION_PRIORITY = 70;
export const EXP_DATA_SOURCE_PRIORITY = 60;

// ── Constraint ─────────────────────────────────────────────────────────────

export const LANGUAGE_MAX_LEN = 8;
export const PRIMARY_KEY_MAX_LEN = 128;
export const ENTITY_PRIMARY_KEY_MAX_LEN = 128;
