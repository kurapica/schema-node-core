// =============================================================================
// SchemaNode.Core — Constants
// Mirrors C# SchemaNode.Core/Utility/Constant.cs
// =============================================================================

export const DEBOUNCE_TIME = 20;

// ── Schema Kind ────────────────────────────────────────────────────────────

export const SCHEMA_KIND_NODE = "node";
export const SCHEMA_KIND_NODE_NAMESPACE = "node.namespace";
export const SCHEMA_KIND_NODE_OBJECT = "node.object";
export const SCHEMA_KIND_NODE_BOOL = "node.bool";
export const SCHEMA_KIND_NODE_BOOL_USAGE = "node.bool.usage";
export const SCHEMA_KIND_NODE_INT = "node.int";
export const SCHEMA_KIND_NODE_INT_DEFINE = "node.int.define";
export const SCHEMA_KIND_NODE_INT_USAGE = "node.int.usage";
export const SCHEMA_KIND_NODE_DECIMAL = "node.decimal";
export const SCHEMA_KIND_NODE_DECIMAL_DEFINE = "node.decimal.define";
export const SCHEMA_KIND_NODE_DECIMAL_USAGE = "node.decimal.usage";
export const SCHEMA_KIND_NODE_STRING = "node.string";
export const SCHEMA_KIND_NODE_STRING_DEFINE = "node.string.define";
export const SCHEMA_KIND_NODE_STRING_USAGE = "node.string.usage";
export const SCHEMA_KIND_NODE_DATE = "node.date";
export const SCHEMA_KIND_NODE_DATE_DEFINE = "node.date.define";
export const SCHEMA_KIND_NODE_DATE_USAGE = "node.date.usage";
export const SCHEMA_KIND_NODE_ENUM = "node.enum";
export const SCHEMA_KIND_NODE_ENUM_DEFINE = "node.enum.define";
export const SCHEMA_KIND_NODE_ENUM_USAGE = "node.enum.usage";
export const SCHEMA_KIND_NODE_STRUCT = "node.struct";
export const SCHEMA_KIND_NODE_STRUCT_DEFINE = "node.struct.define";
export const SCHEMA_KIND_NODE_STRUCT_USAGE = "node.struct.usage";
export const SCHEMA_KIND_NODE_STRUCT_FIELD = "node.struct.field";
export const SCHEMA_KIND_NODE_ARRAY = "node.array";
export const SCHEMA_KIND_NODE_ARRAY_DEFINE = "node.array.define";
export const SCHEMA_KIND_NODE_ARRAY_USAGE = "node.array.usage";
export const SCHEMA_KIND_NODE_FUNCTION = "node.function";
export const SCHEMA_KIND_NODE_PROPERTY = "node.property";
export const SCHEMA_KIND_NODE_RELATION = "node.relation";
export const SCHEMA_KIND_NODE_FUNC_ARG = "node.function.arg";
export const SCHEMA_KIND_NODE_ENTRY = "node.entry";
export const SCHEMA_KIND_NODE_GENERIC = 'node.generic';

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
export const SCHEMA_KIND_ORDER_STRUCT_FIELD = 14;
export const SCHEMA_KIND_ORDER_FUNC_ARG = 15;
export const SCHEMA_KIND_ORDER_ENTRY = 16;
export const SCHEMA_KIND_ORDER_GENERIC = 99;

// ── Node Kind ──────────────────────────────────────────────────────
export const NODE_KIND_NAMESPACE = "namespace";
export const NODE_KIND_OBJECT = "object";
export const NODE_KIND_BOOL = "bool";
export const NODE_KIND_INT = "int";
export const NODE_KIND_DECIMAL = "decimal";
export const NODE_KIND_STRING = "string";
export const NODE_KIND_DATE = "date";
export const NODE_KIND_ENUM = "enum";
export const NODE_KIND_STRUCT = "struct";
export const NODE_KIND_ARRAY = "array";
export const NODE_KIND_FUNCTION = "function";
export const NODE_KIND_PROPERTY = "property";
export const NODE_KIND_RELATION = "relation";
export const NODE_KIND_GENERIC = "generic";

// ── Relation Path ──────────────────────────────────────────────────────────

export const NODE_SELF = '$self';
export const TYPE_PROVIDER = '$type';
export const ARRAY_PREVIOUS = '$prev';
export const ARRAY_ELEMENT = '$ele';
export const FUNC_RETURN = 'return';

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
export const NS_SYSTEM_ENTRYS = 'system.entrys';
export const NS_SYSTEM_ENTRY_ACCESS = 'system.entryaccess';

// ── Schema Namespace ───────────────────────────────────────────────────────

export const NS_SYSTEM_SCHEMA = 'system.schema';
export const NS_SYSTEM_SCHEMA_KIND = `${NS_SYSTEM_SCHEMA}.kind`;
export const NS_SYSTEM_SCHEMA_DESIGN = `${NS_SYSTEM_SCHEMA}.design`;
export const NS_SYSTEM_SCHEMA_NODE = `${NS_SYSTEM_SCHEMA}.node`;
export const NS_SYSTEM_SCHEMA_NODE_TYPE = `${NS_SYSTEM_SCHEMA_NODE}.type`;
export const NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE = `${NS_SYSTEM_SCHEMA_NODE}.valuetype`;
export const NS_SYSTEM_SCHEMA_NODE_VALUE_KIND = `${NS_SYSTEM_SCHEMA}.node.valuekind`;
export const NS_SYSTEM_SCHEMA_NAMESPACE = `${NS_SYSTEM_SCHEMA}.namespace`;
export const NS_SYSTEM_SCHEMA_NAMESPACE_TYPE = `${NS_SYSTEM_SCHEMA_NAMESPACE}.type`;
export const NS_SYSTEM_SCHEMA_OBJECT = `${NS_SYSTEM_SCHEMA}.object`;
export const NS_SYSTEM_SCHEMA_OBJECT_TYPE = `${NS_SYSTEM_SCHEMA_OBJECT}.type`;
export const NS_SYSTEM_SCHEMA_BOOL = `${NS_SYSTEM_SCHEMA}.bool`;
export const NS_SYSTEM_SCHEMA_BOOL_TYPE = `${NS_SYSTEM_SCHEMA_BOOL}.type`;
export const NS_SYSTEM_SCHEMA_INT = `${NS_SYSTEM_SCHEMA}.int`;
export const NS_SYSTEM_SCHEMA_INT_TYPE = `${NS_SYSTEM_SCHEMA_INT}.type`;
export const NS_SYSTEM_SCHEMA_DECIMAL = `${NS_SYSTEM_SCHEMA}.decimal`;
export const NS_SYSTEM_SCHEMA_DECIMAL_TYPE = `${NS_SYSTEM_SCHEMA_DECIMAL}.type`;
export const NS_SYSTEM_SCHEMA_STRING = `${NS_SYSTEM_SCHEMA}.string`;
export const NS_SYSTEM_SCHEMA_STRING_TYPE = `${NS_SYSTEM_SCHEMA_STRING}.type`;
export const NS_SYSTEM_SCHEMA_DATE = `${NS_SYSTEM_SCHEMA}.date`;
export const NS_SYSTEM_SCHEMA_DATE_TYPE = `${NS_SYSTEM_SCHEMA_DATE}.type`;
export const NS_SYSTEM_SCHEMA_ENUM = `${NS_SYSTEM_SCHEMA}.enum`;
export const NS_SYSTEM_SCHEMA_STRUCT = `${NS_SYSTEM_SCHEMA}.struct`;
export const NS_SYSTEM_SCHEMA_STRUCT_FIELD = `${NS_SYSTEM_SCHEMA_STRUCT}.field`;
export const NS_SYSTEM_SCHEMA_ARRAY = `${NS_SYSTEM_SCHEMA}.array`;
export const NS_SYSTEM_SCHEMA_ARRAY_TYPE = `${NS_SYSTEM_SCHEMA_ARRAY}.type`;
export const NS_SYSTEM_SCHEMA_ARRAY_ELEMENT = `${NS_SYSTEM_SCHEMA_ARRAY}.elementtype`;
export const NS_SYSTEM_SCHEMA_FUNC = `${NS_SYSTEM_SCHEMA}.func`;
export const NS_SYSTEM_SCHEMA_FUNC_CALL = `${NS_SYSTEM_SCHEMA_FUNC}.funccall`;
export const NS_SYSTEM_SCHEMA_FUNC_TYPE = `${NS_SYSTEM_SCHEMA_FUNC}.type`;
export const NS_SYSTEM_SCHEMA_FUNC_CALL_ARG = `${NS_SYSTEM_SCHEMA_FUNC}.callarg`;
export const NS_SYSTEM_SCHEMA_RELATION = `${NS_SYSTEM_SCHEMA}.relation`;
export const NS_SYSTEM_SCHEMA_RELATION_TYPE = `${NS_SYSTEM_SCHEMA_RELATION}.type`;
export const NS_SYSTEM_SCHEMA_RELATION_KIND = `${NS_SYSTEM_SCHEMA_RELATION}.kind`;
export const NS_SYSTEM_SCHEMA_PRO = `${NS_SYSTEM_SCHEMA}.prop`;
export const NS_SYSTEM_SCHEMA_PRO_TYPE = `${NS_SYSTEM_SCHEMA_PRO}.type`;
export const NS_SYSTEM_SCHEMA_PRO_CORE = `${NS_SYSTEM_SCHEMA_PRO}.core`;
export const NS_SYSTEM_SCHEMA_PRO_COMMON = `${NS_SYSTEM_SCHEMA_PRO}.common`;
export const NS_SYSTEM_SCHEMA_PRO_FUNC = `${NS_SYSTEM_SCHEMA_PRO}.func`;
export const NS_SYSTEM_SCHEMA_PRO_RELATION = `${NS_SYSTEM_SCHEMA_PRO}.relation`;
export const NS_SYSTEM_SCHEMA_PRO_BOOL = `${NS_SYSTEM_SCHEMA_PRO}.bool`;
export const NS_SYSTEM_SCHEMA_PRO_INT = `${NS_SYSTEM_SCHEMA_PRO}.int`;
export const NS_SYSTEM_SCHEMA_PRO_DECIMAL = `${NS_SYSTEM_SCHEMA_PRO}.decimal`;
export const NS_SYSTEM_SCHEMA_PRO_STRING = `${NS_SYSTEM_SCHEMA_PRO}.string`;
export const NS_SYSTEM_SCHEMA_PRO_DATE = `${NS_SYSTEM_SCHEMA_PRO}.date`;
export const NS_SYSTEM_SCHEMA_PRO_ENUM = `${NS_SYSTEM_SCHEMA_PRO}.enum`;
export const NS_SYSTEM_SCHEMA_PRO_STRUCT = `${NS_SYSTEM_SCHEMA_PRO}.struct`;
export const NS_SYSTEM_SCHEMA_PRO_ARRAY = `${NS_SYSTEM_SCHEMA_PRO}.array`;
export const NS_SYSTEM_SCHEMA_PRO_PROPERTY = `${NS_SYSTEM_SCHEMA_PRO}.property`;

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
export const NS_SYSTEM_SCHEMA_REFLECT_TYPE = `${NS_SYSTEM_SCHEMA_REFLECT}.type`;
export const NS_SYSTEM_SCHEMA_REFLECT_FUNC = `${NS_SYSTEM_SCHEMA_REFLECT}.func`;
export const NS_SYSTEM_SCHEMA_REFLECT_ARRAY = `${NS_SYSTEM_SCHEMA_REFLECT}.array`;
export const NS_SYSTEM_SCHEMA_REFLECT_ENUM = `${NS_SYSTEM_SCHEMA_REFLECT}.enum`;
export const NS_SYSTEM_SCHEMA_REFLECT_STRUCT = `${NS_SYSTEM_SCHEMA_REFLECT}.struct`;
export const NS_SYSTEM_SCHEMA_REFLECT_PROPERTY = `${NS_SYSTEM_SCHEMA_REFLECT}.prop`;

export const NS_SYSTEM_SCHEMA_REFLECT_IS_NODE_KIND = `${NS_SYSTEM_SCHEMA_REFLECT_TYPE}.isnodekind`;
export const NS_SYSTEM_SCHEMA_REFLECT_IS_VALUE_KIND = `${NS_SYSTEM_SCHEMA_REFLECT_TYPE}.isvaluekind`;
export const NS_SYSTEM_SCHEMA_REFLECT_GET_ACCESS_ENTRIES = `${NS_SYSTEM_SCHEMA_REFLECT_TYPE}.getaccessentries`;
export const NS_SYSTEM_SCHEMA_REFLECT_IS_ARRAY_ELE = `${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.isarrayele`;


export const NS_SYSTEM_SCHEMA_REFLECT_FUNC_WITH_RETURN = `${NS_SYSTEM_SCHEMA_REFLECT_FUNC}.withreturn`;
export const NS_SYSTEM_SCHEMA_REFLECT_FUNC_WITH_ARGS = `${NS_SYSTEM_SCHEMA_REFLECT_FUNC}.withargs`;

export const NS_SYSTEM_LOGIC_EQ = `${NS_SYSTEM_LOGIC}.eq`;

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

