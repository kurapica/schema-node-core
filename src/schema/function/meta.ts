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
import { Attach } from '../struct/property/attach';
import { OfSchema } from '../../property/core/ofSchema';
import { SchemaGenerator } from '../../property/core/schemaGenerator';
import { Display } from '../../property/common/display';
import { Visible } from '../../property/common/visible';
import { PrimaryIndex } from '../../property/core/indexes';
import { ReadOnly } from '../../property/common/readOnly';
import { OverrideType } from '../../property/core/overrideType';
import { InVisible } from '../../property/common/invisible';
import { Default } from '../../property/common/default';
import { Immutable } from '../../property/common/immutable';
import { DataNodeType } from '../../property/core/dataNodeType';
import { EntrySourceProvider } from '../../property/core/entrySourceProvider';
import { AccessValueTypeProvider } from '../../property/core/accessValueTypeProvider';
import { setProperty, setPropertyValue } from '../../property/propertyOwner';
import { getMetaPropertiesForSchema, saveNodeSchema } from '../../runtime/schemaRuntime';
import { combinePaths } from '../../utility/toolset';
import { ApplyMode } from '../../enum/applyMode/type';
import { Base } from '../../property/core/base';
import { FunctionNode } from './node/funcNode';
import { FuncArgsNode } from './node/funcArgsNode';
import { FuncCallNode } from './node/funcCallNode';
import { FuncArgNode } from './node/funcArgNode';
import { buildFuncCall } from './type';
import { Relations } from '../relation/property';
import { FunctionType } from './runtime';
import { Assign } from '../../relation';
import { FuncCallArgsNode } from './node/funcCallArgsNode';
import { UpLimitString } from '../string/property/upLimit';
import { Require } from '../../property/common/require';
import { BlackList } from '../../property/common/blackList';
import { Valid } from '../../property/common/valid';
import { DisplayOnly } from '../struct/property/displayOnly';
import { WhiteList } from '../../property/common/whiteList';
import { AccessEntryConsumer } from '../string/property/accessEntryConsumer';
import { AccessValueTypeResolver } from '../string/property/accessValueTypeResolver';
import { Return } from './property/return';
import { ArgName } from './property/argName';
import { FuncProperty } from './func';
import { Generics } from '../generic/generics';
import { Append } from '../../property/core/append';

import type { CallArg, FuncArg, FuncCall, FuncExp, FunctionSchema } from './type';
import type { NodeSchema } from '../node/type';
import type { LocaleString } from '../../struct/localeString/type';

import { SCHEMA_KIND_FUNCTION, SCHEMA_KIND_NODE, NS_SYSTEM_SCHEMA_FUNC, NS_SYSTEM_SCHEMA_FUNC_CALL_ARG, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_STRING, SCHEMA_KIND_STRING, SCHEMA_KIND_ORDER_FUNC, PRIMARY_KEY_MAX_LEN, NS_SYSTEM_BOOL, NS_SYSTEM_OBJECT, NS_SYSTEM_LIST, NS_SYSTEM_SCHEMA_FUNC_TYPE, NODE_SELF, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, NS_SYSTEM_SCHEMA_REFLECT_FUNC_WITH_RETURN, SCHEMA_KIND_NAMESPACE, SCHEMA_KIND_ORDER_FUNC_ARG, SCHEMA_KIND_FUNC_ARG, NS_SYSTEM_INTRINSIC, NS_SYSTEM_SCHEMA_REFLECT_TYPE, NS_SYSTEM_LOGIC, SCHEMA_KIND_INT, SCHEMA_KIND_DATE, SCHEMA_KIND_BOOL, SCHEMA_KIND_ENUM, NS_SYSTEM_SCHEMA_REFLECT_FUNC, NS_SYSTEM_SCHEMA_NODE_TYPE, NS_SYSTEM_LOCALE_STRING, NS_SYSTEM_COLLECTION, ARRAY_ELEMENT } from '../../utility/constant';
import { TypeProvider } from '../../property';

// #region ── FunctionSchema ─────────────────────────────────────────────────────

@Meta(SchemaKind, [SCHEMA_KIND_FUNCTION, SCHEMA_KIND_ORDER_FUNC])
@Meta(NodeSchemaKind, [SCHEMA_KIND_FUNCTION, SCHEMA_KIND_ORDER_FUNC])
@Meta(RuntimeNodeType, FunctionType)
@Meta(SchemaGenerator, generateFunctionSchema)
@Meta(Append, [Generics])
class FunctionKind {}

/** Meta registration class (NOT exported). */
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_FUNC}.schema`)
@Meta(Attach, SCHEMA_KIND_FUNCTION)
@Meta(EntrySourceProvider, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_FUNC}.getaccessentries`, '@args', '@exps', NODE_SELF))
@Meta(AccessValueTypeProvider, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_FUNC}.getaccessvaluetype`, '@args', '@exps', NODE_SELF))
@Meta(DataNodeType, FunctionNode)
class FunctionSchemaMeta implements FunctionSchema {
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
  @Meta(Require, true)
  @Meta(Immutable, true)
  return: string = '';

  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_FUNC}.args`)
  @Meta(DataNodeType, FuncArgsNode)
  args: FuncArg[] = [];

  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_FUNC}.exps`)
  @Relation(BlackList, 'call', buildFuncCall(`${NS_SYSTEM_COLLECTION}.getfields`, '@args', 'name'), `exps.${ARRAY_ELEMENT}.name`)
  exps: FuncExp[] = [];
}

// #endregion

// #region ── FuncArg ────────────────────────────────────────────────────────────

/** Meta registration class for function argument (NOT exported). */
@Meta(SchemaKind, [SCHEMA_KIND_FUNC_ARG, SCHEMA_KIND_ORDER_FUNC_ARG])
@Meta(Append, [Display, Default, Require])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_FUNC}.arg`)
@Meta(Attach, SCHEMA_KIND_FUNC_ARG)
@Meta(DataNodeType, FuncArgNode)
@Meta(TypeProvider, 'type')
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

  /** The function call. */
  @Meta(Require, true)
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_FUNC}.funccall`)
  @Relation(Default, 'call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@return'), 'call.return')
  call: FuncCall = { mode: ApplyMode.Call, func: '', args: [] };
}

// #endregion

// #region ── CallArg ────────────────────────────────────────────────────────────

@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_FUNC}.funccall`)
@Meta(DataNodeType, FuncCallNode)
@Relation(Valid, Assign, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_FUNC_WITH_RETURN, '@func', '@funcReturn'), 'func')
class FuncCallMeta implements FuncCall {
  /** The return type of the function */
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
  @Meta(DisplayOnly, true)
  @Meta(InVisible, true)
  return?: string;

  /** The apply mode. */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_FUNC}.applymode`)
  @Meta(Require, true)
  @Relation(WhiteList,'call', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_FUNC}.getapplymodes`, '@return'))
  mode: ApplyMode = ApplyMode.Call;

  /** The expected function return type */
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
  @Meta(DisplayOnly, true)
  @Meta(InVisible, true)
  @Relation(Default,'call', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_FUNC}.getexpectreturn`, '@return', '@mode'))
  funcReturn?: string;

  /** Fully qualified function schema name. */
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_FUNC_TYPE)
  @Meta(Require, true)
  @Relation(Visible, 'call', buildFuncCall(`${NS_SYSTEM_LOGIC}.notempty`, '@mode'))
  func!: string;

  /** Call arguments. */
  @Meta(SchemaType, `${NS_SYSTEM_LIST}<${NS_SYSTEM_SCHEMA_FUNC_CALL_ARG}>`)
  @Relation(Visible,'call', buildFuncCall(`${NS_SYSTEM_LOGIC}.notempty`, '@func'))
  @Meta(DataNodeType, FuncCallArgsNode)
  args!: CallArg[];
}

/** Meta registration class for call argument (NOT exported). */
@Meta(SchemaType, NS_SYSTEM_SCHEMA_FUNC_CALL_ARG)
@Relation(AccessEntryConsumer, 'assign', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_TYPE}.isassignableto`, '@source', false, '@type'), 'source')
class CallArgMeta implements CallArg {
  /** The argument name */
  @Meta(DisplayOnly, true)
  @Meta(SchemaType, NS_SYSTEM_LOCALE_STRING)
  name?: LocaleString;
  
  /** The argument type */
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
  @Meta(ReadOnly, true)
  type?: string;

  /** The source value */
  @Meta(SchemaType, NS_SYSTEM_STRING)
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

// #endregion

// #region ── FunType ───────────────────────────────────────────────────────

/** Represents the function type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(Base, NS_SYSTEM_SCHEMA_NODE_TYPE)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_FUNC_TYPE)
@Meta(Valid, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, NODE_SELF, false, SCHEMA_KIND_FUNCTION))
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
