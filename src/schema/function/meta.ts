// =============================================================================
// FunctionSchema — extension data under "func" key
// Mirrors C# SchemaNode.Core/Schema/FunctionSchema.cs
// =============================================================================

import { Meta, getMetaMethods, getMetaProperty, getMetaProperties } from '../../attribute/meta';
import { getRelationSchemas, Relation } from '../../attribute/relation';
import { RuntimeNodeType } from '../../property/core/runtimeNodeType';
import { SchemaKind } from '../../property/record/schemaKind';
import { NodeSchemaKind } from '../../property/record/nodeSchemaKind';
import { SchemaType } from '../../property/core/schemaType';
import { Attach } from '../../property/core/attach';
import { OfSchema } from '../../property/core/ofSchema';
import { SchemaGenerator } from '../../property/core/schemaGenerator';
import { Return } from '../../property/function/return';
import { Display } from '../../property/common/display';
import { Visible } from '../../property/common/visible';
import { PrimaryIndex } from '../../property/core/indexes';
import { UpLimitString } from '../../property/constraint/upLimit';
import { Require } from '../../property/constraint/require';
import { Valid } from '../../property/constraint/valid';
import { DisplayOnly } from '../../property/common/displayOnly';
import { ReadOnly } from '../../property/common/readOnly';
import { OverrideType } from '../../property/core/overrideType';
import { AccessEntryConsumer } from '../../property/core/accessEntryConsumer';
import { InVisible } from '../../property/common/invisible';
import { WhiteList } from '../../property/constraint/whiteList';
import { Default } from '../../property/common/default';
import { Immutable } from '../../property/common/immutable';
import { DataNodeType } from '../../property/core/dataNodeType';
import { EntrySourceProvider } from '../../property/core/entrySourceProvider';
import { AccessValueTypeProvider } from '../../property/core/accessValueTypeProvider';
import { AccessValueTypeResolver } from '../../property/core/accessValueTypeResolver';
import { setProperty, setPropertyValue } from '../../property/propertyOwner';
import { getMetaPropertiesForSchema, saveNodeSchema } from '../../runtime/schemaRuntime';
import { combinePaths } from '../../utility/toolset';
import { ExpType } from '../../enum/expType';
import { Base } from '../../property/core/base';
import { ArgName } from '../../property/function/argName';
import { FunctionNode } from './function/funcNode';
import { FuncArgsNode } from './function/funcArgsNode';
import { FuncExpNode } from './function/funcExpNode';
import { FuncArgNode } from './function/funcArgNode';
import { FuncExpArgsNode } from './function/funcExpArgsNode';
import { buildFuncCall } from './type';
import { Relations } from '../relation/property';
import { FuncProperty } from './property';
import { FunctionType } from './runtime';
import { ArrayNodeTemplate } from '../array/node';

import type { CallArg, FuncArg, FuncCall, FuncExp, FunctionSchema } from './type';
import type { NodeSchema } from '../node/type';

import { SCHEMA_KIND_FUNCTION, SCHEMA_KIND_NODE, NS_SYSTEM_SCHEMA_FUNC, NS_SYSTEM_SCHEMA_FUNC_CALL_ARG, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_STRING, SCHEMA_KIND_STRING, SCHEMA_KIND_ORDER_FUNC, PRIMARY_KEY_MAX_LEN, NS_SYSTEM_BOOL, NS_SYSTEM_OBJECT, NS_SYSTEM_LIST, NS_SYSTEM_SCHEMA_FUNC_TYPE, NODE_SELF, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, NS_SYSTEM_SCHEMA_REFLECT_FUNC_WITH_RETURN, SCHEMA_KIND_NAMESPACE, SCHEMA_KIND_ORDER_FUNC_ARG, SCHEMA_KIND_FUNC_ARG, NS_SYSTEM_INTRINSIC, NS_SYSTEM_SCHEMA_REFLECT_TYPE, NS_SYSTEM_LOGIC, SCHEMA_KIND_INT, SCHEMA_KIND_DATE, SCHEMA_KIND_BOOL, SCHEMA_KIND_ENUM, NS_SYSTEM_SCHEMA_REFLECT_FUNC, ENTRY_ROOT } from '../../utility/constant';

// #region ── FunctionSchema ─────────────────────────────────────────────────────

@Meta(SchemaKind, [SCHEMA_KIND_FUNCTION, SCHEMA_KIND_ORDER_FUNC])
@Meta(NodeSchemaKind, [SCHEMA_KIND_FUNCTION, SCHEMA_KIND_ORDER_FUNC])
@Meta(RuntimeNodeType, FunctionType)
@Meta(SchemaGenerator, generateFunctionSchema)
class FunctionKind {}

/** Meta registration class (NOT exported). */
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_FUNC}.schema`)
@Meta(Attach, SCHEMA_KIND_FUNCTION)
@Meta(DataNodeType, FunctionNode)
@Meta(EntrySourceProvider, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_FUNC}.getaccessentries`, '@args', '@exps', NODE_SELF, ENTRY_ROOT))
@Meta(AccessValueTypeProvider, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_FUNC}.getaccessvaluetype`, '@args', '@exps', NODE_SELF))
class FunctionSchemaMeta implements FunctionSchema {
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
  @Meta(Require, true)
  @Meta(Immutable, true)
  return: string = '';

  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_FUNC}.args`)
  @Meta(DataNodeType, FuncArgsNode)
  args: FuncArg[] = [];

  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_FUNC}.exps`)
  @Meta(DataNodeType, ArrayNodeTemplate<FuncExpNode>)
  exps: FuncExp[] = [];
}

// #endregion

// #region ── FuncArg ────────────────────────────────────────────────────────────

/** Meta registration class for function argument (NOT exported). */
@Meta(SchemaKind, [SCHEMA_KIND_FUNC_ARG, SCHEMA_KIND_ORDER_FUNC_ARG])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_FUNC}.arg`)
@Meta(Attach, SCHEMA_KIND_FUNC_ARG)
@Meta(DataNodeType, FuncArgNode)
class FuncArgMeta implements FuncArg {
  @Meta(PrimaryIndex, 0)
  @Meta(UpLimitString, PRIMARY_KEY_MAX_LEN)
  @Meta(SchemaType, NS_SYSTEM_STRING)
  @Meta(Require, true)
  name: string = '';

  @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
  @Meta(Require, true)
  type: string = '';
}

// #endregion

// #region ── FuncExp ────────────────────────────────────────────────────────────

/** Meta registration class for function expression (NOT exported). */
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_FUNC}.exp`)
@Meta(DataNodeType, FuncExpNode)
class FuncExpMeta implements FuncExp {
  /** The expression name */
  @Meta(PrimaryIndex, 0)
  @Meta(UpLimitString, PRIMARY_KEY_MAX_LEN)
  @Meta(SchemaType, NS_SYSTEM_STRING)
  @Meta(Require, true)
  name: string = '';

  /** the return value type */
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
  @Meta(Require, true)
  return: string = '';

  /** the expression type */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_FUNC}.exptype`)
  @Meta(Require, true)
  @Relation(WhiteList,'call', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_FUNC}.getexptypes`, '@return'))
  type: ExpType = ExpType.Call;

  /** The expected function return type */
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
  @Meta(DisplayOnly, true)
  @Meta(InVisible, true)
  @Relation(Default,'call', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_FUNC}.getexpectreturn`, '@return', '@type'))
  funcReturn?: string;

  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_FUNC}.type`)
  @Meta(Require, true)
  @Meta(Valid, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_FUNC_WITH_RETURN, NODE_SELF, '@funcReturn'))
  func: string = '';

  @Meta(SchemaType, `${NS_SYSTEM_LIST}<${NS_SYSTEM_SCHEMA_FUNC_CALL_ARG}>`)
  @Meta(Require, true)
  @Meta(DataNodeType, FuncExpArgsNode)
  args: CallArg[] = [];
}

// #endregion

// #region ── CallArg ────────────────────────────────────────────────────────────


/** Meta registration class for call argument (NOT exported). */
@Meta(SchemaType, NS_SYSTEM_SCHEMA_FUNC_CALL_ARG)
class CallArgMeta implements CallArg {
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
  @Meta(ReadOnly, true)
  type?: string;

  @Meta(SchemaType, NS_SYSTEM_STRING)
  @Meta(AccessEntryConsumer, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_TYPE}.isassignableto`, NODE_SELF, '@type'))
  @Relation(InVisible,'call', buildFuncCall(`${NS_SYSTEM_LOGIC}.notempty`, '@value'))
  source?: string;

  /** The source value type */
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
  @Meta(DisplayOnly, true)
  @Meta(InVisible, true)
  @Meta(AccessValueTypeResolver, 'source')
  sourceType?: string;

  /** The const value (no complex struct value) */
  @Meta(SchemaType, NS_SYSTEM_OBJECT)
  @Relation(OverrideType,'call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@type'))
  @Relation(InVisible,'call', buildFuncCall(`${NS_SYSTEM_LOGIC}.notempty`, '@source'))
  @Relation(Visible,'call', buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, '@type', true, SCHEMA_KIND_INT, SCHEMA_KIND_STRING, SCHEMA_KIND_DATE, SCHEMA_KIND_BOOL, SCHEMA_KIND_ENUM))
  value?: unknown;
}

@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_FUNC}.funccall`)
class FuncCallMeta implements FuncCall {
  /** The return type of the function */
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
  @Meta(DisplayOnly, true)
  @Meta(InVisible, true)
  return?: string;

  /** Fully qualified function schema name. */
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_FUNC_TYPE)
  @Meta(Valid, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_FUNC_WITH_RETURN, NODE_SELF, '@return'))
  func!: string;

  /** Call arguments. */
  @Meta(SchemaType, `${NS_SYSTEM_LIST}<${NS_SYSTEM_SCHEMA_FUNC_CALL_ARG}>`)
  args!: CallArg[];
}

// #endregion

// #region ── FunType ───────────────────────────────────────────────────────

/** Represents the function type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(Base, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_FUNC_TYPE)
@Meta(Valid, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, NODE_SELF, SCHEMA_KIND_FUNCTION))
class FunctionTypeMeta {}

/** Represents the validation function type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(Base, NS_SYSTEM_SCHEMA_FUNC_TYPE)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_FUNC}.valid`)
@Meta(Valid, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_FUNC_WITH_RETURN, NODE_SELF, NS_SYSTEM_BOOL))
class ValidFuncTypeMeta {}

/** Represents the function return value type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(Base, NS_SYSTEM_SCHEMA_FUNC_TYPE)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_FUNC}.valuetype`)
@Meta(Valid, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_FUNC_WITH_RETURN, NODE_SELF, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE))
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
function generateFunctionSchema(namespace: string, name: string, ctor: Function) {
  const methods = getMetaMethods(ctor);
  
  // save the namespace
  const nsName = combinePaths(namespace, name);
  const nsSchema: NodeSchema = { namespace, name, kind: SCHEMA_KIND_NAMESPACE };
  setPropertyValue(nsSchema, Display, { key: nsName });
  getMetaPropertiesForSchema(SCHEMA_KIND_NODE, ctor).forEach(p => setProperty(nsSchema, p));
  saveNodeSchema(nsSchema);

  // save the functions
  for (const methodName of methods) {
    const func = (ctor as unknown as Record<string, Function>)[methodName];
    if (!func || typeof func !== 'function') continue;

    // Schema type (full name) — required
    const schemaTypeProp = getMetaProperty(ctor, SchemaType, methodName);
    const fullName = schemaTypeProp?.getValue<string>() ?? combinePaths(nsName, methodName);
    const lastDot = fullName.lastIndexOf('.');
    const methodNs = lastDot >= 0 ? fullName.substring(0, lastDot) : '';
    const methodNameOnly = lastDot >= 0 ? fullName.substring(lastDot + 1) : fullName;
    const argRelations = getRelationSchemas(ctor);

    // Return type — required
    const returnProp = getMetaProperty(ctor, Return, methodName);
    if (!returnProp?.hasValue) {
      console.error(`FunctionSchema: method ${name}.${methodName} has no @Meta(Return), skipping`);
      continue;
    }
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
        name: getMetaProperty(ctor, ArgName, methodName, i)?.getValue<string>() ?? `arg${i}`,
        type: schemaTypeProp.getValue<string>()!,
      };
      paramProps.filter(p => p.savable).forEach(p => setProperty(arg, p));
      args.push(arg);

      // add argument relations
      const argRelation = argRelations.filter(r => r.target.toLowerCase() === arg.name.toLowerCase() || r.target.toLowerCase() === `${arg.name.toLowerCase()}.${NODE_SELF}`);
      if (argRelation?.length) setPropertyValue(arg, Relations, argRelation.map(r => ({...r, target: `${arg.name}.${NODE_SELF}`})));
    }

    // Build NodeSchema
    const nodeSchema: NodeSchema = { namespace: methodNs, name: methodNameOnly, kind: SCHEMA_KIND_FUNCTION };
    setPropertyValue(nodeSchema, Display, { key: combinePaths(methodNs, methodNameOnly) });

    // Build FunctionSchema
    const funcSchema: FunctionSchema = {
      return: returnType,
      args,
      exps: [],
      func,
    };

    getMetaPropertiesForSchema(SCHEMA_KIND_NODE, ctor, undefined, methodName).forEach(p => setProperty(nodeSchema, p));
    getMetaPropertiesForSchema(SCHEMA_KIND_FUNCTION, ctor, undefined, methodName).forEach(p => setProperty(funcSchema, p));
    setPropertyValue(nodeSchema, FuncProperty, funcSchema);
    saveNodeSchema(nodeSchema);
  }
}

// #endregion
