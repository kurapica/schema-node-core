// =============================================================================
// FunctionSchema — extension data under "func" key
// Mirrors C# SchemaNode.Core/Schema/FunctionSchema.cs
// =============================================================================

import { Meta, getMetaMethods, getMetaPropertiesForSchema, getMetaProperty, getMetaProperties } from '../attribute/meta';
import { Relation } from '../attribute/relation';
import { RuntimeNodeType } from '../property/core/RuntimeNodeType';
import { SchemaKind, NodeSchemaKind, SchemaType, ForSchema, Attach, OfSchema, SchemaGenerator, Return, Generics, Display, Visible, PrimaryIndex, UpLimitString, Require, Valid } from '../property/index';
import { IProperty, Property } from '../property/property';
import { setProperty, setPropertyValue, combineProperties } from '../property/propertyOwner';
import { saveSchema } from '../runtime/schemaRuntime';
import { FunctionType } from '../runtime/type';
import { SCHEMA_KIND_FUNCTION, SCHEMA_KIND_PROPERTY, SCHEMA_KIND_NODE, NS_SYSTEM_SCHEMA_FUNC, NS_SYSTEM_SCHEMA_FUNC_CALL_ARG, NS_SYSTEM_SCHEMA_PROPERTY_CORE, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_STRING, NS_SYSTEM_LOGIC_EQ, SCHEMA_KIND_STRING, SCHEMA_KIND_ORDER_FUNC, PRIMARY_KEY_MAX_LEN, NS_SYSTEM_BOOL, NS_SYSTEM_OBJECT, NS_SYSTEM_LOCALE_STRING, NS_SYSTEM_LIST, NS_SYSTEM_SCHEMA_FUNC_TYPE, NODE_SELF, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, NS_SYSTEM_SCHEMA_REFLECT_FUNC_WITH_RETURN } from '../utility/constant';
import { combinePaths } from '../utility/toolset';
import { NodeSchema } from './nodeSchema';
import type { GenericParameter } from '../property/core/generics';
import { concatLocaleString, type LocaleString } from '../struct/localeString';
import { ExpType } from '../enum/expType';
import { Base } from '../property/core/base';
import { Params } from '../property/core/params';

// #region ── FunctionSchema ─────────────────────────────────────────────────────

/** Pure data interface for function schema extension data. */
export interface FunctionSchema {
  /** The return type of the function. 'T', 'T1', 'T2' denote generic type params. */
  return: string;

  /** The function arguments. */
  args: FuncArg[];

  /** The function expressions (compiled body). */
  exps: FuncExp[];
}

/** Meta registration class (NOT exported). */
@Meta(SchemaKind, [SCHEMA_KIND_FUNCTION, SCHEMA_KIND_ORDER_FUNC])
@Meta(NodeSchemaKind, [SCHEMA_KIND_FUNCTION, SCHEMA_KIND_ORDER_FUNC])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_FUNC}.schema`)
@Meta(RuntimeNodeType, FunctionType)
@Meta(Attach, SCHEMA_KIND_FUNCTION)
@Meta(SchemaGenerator, generateFunctionSchema)
class FunctionSchemaMeta implements FunctionSchema {
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
  @Meta(Require, true)
  return: string = '';

  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_FUNC}.args`)
  args: FuncArg[] = [];

  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_FUNC}.exps`)
  exps: FuncExp[] = [];
}

// #endregion

// #region ── FuncArg ────────────────────────────────────────────────────────────

/**
 * A single argument definition of a function.
 * Mirrors C# SchemaNode.Core/Schema/FunctionSchema.cs FuncArg.
 */
export interface FuncArg {
  /** The argument name. */
  name: string;

  /** The argument type. 'T', 'T1', 'T2' denote generic type params. */
  type: string;

  /** Whether the argument is nullable / optional. */
  nullable?: boolean;

  /** The display (localised) name. */
  display?: LocaleString;

  /** Whether this is a params/rest argument. */
  params?: boolean;

  /** Default value (schema-ignored in C#, stored for runtime). */
  default?: unknown;

  /** Schema node error status. */
  error?: string;
}

/** Meta registration class for function argument (NOT exported). */
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_FUNC}.arg`)
class FuncArgMeta implements FuncArg {
  @Meta(PrimaryIndex, 0)
  @Meta(UpLimitString, PRIMARY_KEY_MAX_LEN)
  @Meta(SchemaType, NS_SYSTEM_STRING)
  @Meta(Require, true)
  name: string = '';

  @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
  @Meta(Require, true)
  type: string = '';

  @Meta(SchemaType, NS_SYSTEM_BOOL)
  nullable?: boolean;

  @Meta(SchemaType, NS_SYSTEM_LOCALE_STRING)
  display?: LocaleString;

  @Meta(SchemaType, NS_SYSTEM_BOOL)
  params?: boolean;
}

// #endregion

// #region ── FuncExp ────────────────────────────────────────────────────────────

/**
 * A single expression in the function body.
 * Mirrors C# SchemaNode.Core/Schema/FunctionSchema.cs FuncExp.
 */
export interface FuncExp {
  /** The expression name (identifier). */
  name: string;

  /** The function to call — schema type of the target function. */
  func: string;

  /** The expression evaluation type (Call / Map / Reduce / etc.). */
  type: ExpType;

  /** The return type of this expression. */
  return: string;

  /** Arguments — list of expression names or argument names. */
  args: CallArg[];

  /** Schema error status. */
  error?: string;
}

/** Meta registration class for function expression (NOT exported). */
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_FUNC}.exp`)
class FuncExpMeta implements FuncExp {
  @Meta(PrimaryIndex, 0)
  @Meta(UpLimitString, PRIMARY_KEY_MAX_LEN)
  @Meta(SchemaType, NS_SYSTEM_STRING)
  @Meta(Require, true)
  name: string = '';

  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_FUNC}.type`)
  @Meta(Require, true)
  func: string = '';

  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_FUNC}.exptype`)
  @Meta(Require, true)
  type: ExpType = ExpType.Call;

  @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
  return: string = '';

  @Meta(SchemaType, `${NS_SYSTEM_LIST}<${NS_SYSTEM_SCHEMA_FUNC_CALL_ARG}>`)
  @Meta(Require, true)
  args: CallArg[] = [];
}

// #endregion

// #region ── CallArg ────────────────────────────────────────────────────────────

/**
 * A single argument in a function call.
 * If source is set, the value is a source reference path; otherwise value is a constant.
 * Mirrors C# SchemaNode.Core/Schema/FunctionSchema.cs CallArg.
 */
export interface CallArg {
  /** The argument source path (e.g. field access path). */
  source?: string;

  /** The constant value. */
  value?: unknown;

  /** The runtime type hint. */
  type?: string;
}

/** Meta registration class for call argument (NOT exported). */
@Meta(SchemaType, NS_SYSTEM_SCHEMA_FUNC_CALL_ARG)
class CallArgMeta implements CallArg {
  @Meta(SchemaType, NS_SYSTEM_STRING)
  source?: string;

  /** The const value */
  @Meta(SchemaType, NS_SYSTEM_OBJECT)
  value?: unknown;

  @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
  type?: string;
}

// #endregion

// #region ── FuncProperty ───────────────────────────────────────────────────────

/** The function property for node schemas. */
@Meta(ForSchema, [SCHEMA_KIND_NODE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.func`)
@Relation(Visible, NS_SYSTEM_LOGIC_EQ, '$kind', SCHEMA_KIND_FUNCTION)
export class FuncProperty extends Property<FunctionSchema> {
  combine(other: IProperty): boolean {
    const otherSchema = other?.getValue<FunctionSchema>();
    if (!otherSchema) return false;
    const selfSchema = this.getValue<FunctionSchema>();
    if (!selfSchema) {
      this.setValue(otherSchema);
      return true;
    }

    // Combine argument display
    for (let i = 0; i < Math.min(selfSchema.args.length, otherSchema.args.length); i++) {
      const arg = selfSchema.args[i];
      const otherArg = otherSchema.args[i];
      if (!otherArg || otherArg.type !== arg.type) continue;
      if (!arg.display)
        arg.display = otherArg.display;
      else if (otherArg.display)
        concatLocaleString(arg.display, otherArg.display);
    }

    // Combine properties
    combineProperties(selfSchema, otherSchema, SCHEMA_KIND_FUNCTION);
    this.setValue(selfSchema);
    return true;
  }
}

/** Represents the function type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(Base, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_FUNC_TYPE)
@Meta(Valid, { func: NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, args: [ { source: NODE_SELF }, { value: SCHEMA_KIND_FUNCTION }] } )
class FunctionTypeMeta {}

/** Represents the validation function type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(Base, NS_SYSTEM_SCHEMA_FUNC_TYPE)
@Meta(SchemaType, `{NS_SYSTEM_SCHEMA_FUNC}.valid`)
@Meta(Valid, { func: NS_SYSTEM_SCHEMA_REFLECT_FUNC_WITH_RETURN, args: [ { source: NODE_SELF }, { value: NS_SYSTEM_BOOL }] } )
class ValidFuncTypeMeta {}

/** Represents the function return value type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(Base, NS_SYSTEM_SCHEMA_FUNC_TYPE)
@Meta(SchemaType, `{NS_SYSTEM_SCHEMA_FUNC}.valuetype`)
@Meta(Valid, { func: NS_SYSTEM_SCHEMA_REFLECT_FUNC_WITH_RETURN, args: [ { source: NODE_SELF }, { value: `{NS_SYSTEM_SCHEMA_NODE}.valuetype` }] } )
class TypeFuncTypeMeta {}

// #endregion

// #region ── Generator ──────────────────────────────────────────────────────────

/**
 * Generate a FunctionSchema for each public static method of a function class.
 *
 * Each method must carry @Meta(OfSchema, SCHEMA_KIND_FUNCTION) plus at least
 * @Meta(SchemaType, 'ns.funcName') and @Meta(Return, 'returnType').
 * Parameter types are declared via @Meta(SchemaType, 'type') on each parameter.
 */
export function generateFunctionSchema(namespace: string, name: string, ctor: Function) {
  const methods = getMetaMethods(ctor);
  for (const methodName of methods) {
    // A method is only a function schema if it has @Meta(OfSchema, SCHEMA_KIND_FUNCTION)
    const ofSchema = getMetaProperty(ctor, OfSchema, methodName);
    if (!ofSchema?.hasValue || ofSchema.getValue<string>() !== SCHEMA_KIND_FUNCTION) continue;

    // Schema type (full name) — required
    const schemaTypeProp = getMetaProperty(ctor, SchemaType, methodName);
    if (!schemaTypeProp?.hasValue) {
      console.warn(`FunctionSchema: method ${name}.${methodName} has no @Meta(SchemaType), skipping`);
      continue;
    }
    const fullName = schemaTypeProp.getValue<string>()!;
    const lastDot = fullName.lastIndexOf('.');
    const methodNs = lastDot >= 0 ? fullName.substring(0, lastDot) : '';
    const methodNameOnly = lastDot >= 0 ? fullName.substring(lastDot + 1) : fullName;

    // Return type — required
    const returnProp = getMetaProperty(ctor, Return, methodName);
    const returnType = returnProp?.hasValue ? returnProp.getValue<string>()! : '';

    // Extract argument types from parameter @Meta(SchemaType) annotations
    const args: FuncArg[] = [];
    for (let i = 0; i < 32; i++) {
      const paramProps = getMetaProperties(ctor, undefined, methodName, i);
      if (!paramProps || paramProps.length === 0) break;
      const schemaTypeProp = paramProps.find(p => p instanceof SchemaType);
      if (!schemaTypeProp?.hasValue) {
        console.error(`FunctionSchema: method ${name}.${methodName} parameter ${i} has no @Meta(SchemaType), skipping`);
        break;
      }
      const arg : FuncArg = {
        name: `arg${i}`,
        type: schemaTypeProp.getValue<string>()!,
        nullable: !paramProps.some(p => p instanceof Require && p.getValue<boolean>() === true),
        params: paramProps.some(p => p instanceof Params && p.getValue<boolean>() === true),
      };
      paramProps.filter(p => p.savable).forEach(p => setProperty(arg, p));
      args.push(arg);
    }

    // Build NodeSchema
    const nodeSchema: NodeSchema = { namespace: methodNs, name: methodNameOnly, kind: SCHEMA_KIND_FUNCTION };
    setPropertyValue(nodeSchema, Display, { key: combinePaths(methodNs, methodNameOnly) });

    // Build FunctionSchema
    const funcSchema: FunctionSchema = {
      return: returnType,
      args,
      exps: [],
    };

    getMetaPropertiesForSchema(SCHEMA_KIND_NODE, ctor).forEach(p => setProperty(nodeSchema, p));
    getMetaPropertiesForSchema(SCHEMA_KIND_FUNCTION, ctor).forEach(p => setProperty(funcSchema, p));
    setPropertyValue(nodeSchema, FuncProperty, funcSchema);
    saveSchema(nodeSchema);
  }
}

// #endregion
