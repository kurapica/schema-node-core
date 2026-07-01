// =============================================================================
// FunctionSchema — extension data under "func" key
// =============================================================================

import { Meta } from '../attribute/meta';
import { SchemaKindRecord, NodeSchemaKindRecord, SchemaType, Attach, ForSchema, OfSchema } from '../property/index';
import { Property } from '../property/property';
import { SCHEMA_KIND_FUNCTION, SCHEMA_KIND_NODE, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_FUNC, NS_SYSTEM_SCHEMA_PROPERTY_CORE } from '../utility/constant';
import type { GenericParameter } from '../property/core/generics';

export interface FunctionArgumentInfo { name: string; type: string; optional?: boolean; }
export interface FunctionExpression { type: string; func?: string; args?: FunctionExpression[]; value?: unknown; }

@Meta(SchemaKindRecord, [SCHEMA_KIND_FUNCTION, 11])
@Meta(NodeSchemaKindRecord, [SCHEMA_KIND_FUNCTION, 11])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_FUNC}.schema`)
@Meta(Attach, SCHEMA_KIND_FUNCTION)
export class FunctionSchema {
  return: string = '';
  args: FunctionArgumentInfo[] = [];
  exps: FunctionExpression[] = [];
  generic?: GenericParameter[];
  converter?: boolean;
  server?: boolean;
  nocache?: boolean;
  sideEffect?: boolean;
}

@Meta(ForSchema, [SCHEMA_KIND_NODE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.func`)
export class FuncProperty extends Property<FunctionSchema> {}


const META_KEY = Symbol.for('schema-node:meta');

export function generateFunctionSchema(target: object, runtime: SchemaRuntime): void {
  const proto = (target as { prototype?: object }).prototype;
  if (!proto) return;
  const metaStore = (proto as Record<symbol, Array<{ property: { _memberKey?: string; name: string; hasValue: boolean; getValue: <T>() => T | undefined } }>>)[META_KEY];
  if (!metaStore) return;

  for (const entry of metaStore) {
    const p = entry.property;
    if (!p._memberKey || p.name !== 'ofSchema') continue;
    const methodName = p._memberKey;
    let methodSchemaType: string | undefined;
    for (const me of metaStore) {
      const mp = (me.property as { _memberKey?: string });
      if (mp._memberKey === methodName && me.property instanceof SchemaType) {
        methodSchemaType = (me.property as SchemaType).getValue<string>(); break;
      }
    }
    if (!methodSchemaType) continue;
    const fullName = methodSchemaType;
    const lastDot = fullName.lastIndexOf('.');
    const ns = lastDot >= 0 ? fullName.substring(0, lastDot) : '';
    const nm = lastDot >= 0 ? fullName.substring(lastDot + 1) : fullName;

    const funcData = new FunctionSchema();
    funcData.return = getMethodMeta(metaStore, methodName, Return)?.getValue<string>() ?? '';
    funcData.converter = getMethodMeta(metaStore, methodName, Converter)?.getValue<boolean>() ?? false;
    funcData.server = getMethodMeta(metaStore, methodName, ServerOnly)?.getValue<boolean>() ?? false;
    funcData.nocache = getMethodMeta(metaStore, methodName, NoCache)?.getValue<boolean>() ?? false;
    funcData.generic = (getMethodMeta(metaStore, methodName, Generics)?.getValue()) as GenericParameter[] | undefined;
    funcData.args = extractMethodArgs(metaStore, methodName);

    const node = new NodeSchema(nm, SCHEMA_KIND_FUNCTION, ns);
    node.extensions = { func: funcData };
    runtime.saveSchema(node);
  }
}

function getMethodMeta(metaStore: Array<{ property: unknown }>, memberName: string, PropCtor: new () => object): { getValue: <T>() => T | undefined } | undefined {
  for (const entry of metaStore) {
    const p = entry.property;
    if ((p as { _memberKey?: string })._memberKey === memberName && p instanceof PropCtor) return p as { getValue: <T>() => T | undefined };
  }
}

function extractMethodArgs(metaStore: Array<{ property: unknown }>, methodName: string): FunctionArgumentInfo[] {
  const args: FunctionArgumentInfo[] = [];
  const paramMap = new Map<number, { name: string; type: string }>();
  for (const entry of metaStore) {
    const p = entry.property as { _memberKey?: string; _paramIndex?: number; _paramKey?: string };
    if (p._memberKey !== methodName || p._paramIndex === undefined) continue;
    if (entry.property instanceof SchemaType) {
      const existing = paramMap.get(p._paramIndex) ?? { name: p._paramKey?.toString() ?? `arg${p._paramIndex}`, type: 'system.object' };
      existing.type = (entry.property as SchemaType).getValue<string>()!;
      paramMap.set(p._paramIndex, existing);
    }
  }
  for (const [, info] of [...paramMap.entries()].sort(([a], [b]) => a - b)) args.push(info);
  return args;
}

export function registerFunctionGenerator(runtime: SchemaRuntime): void {
  runtime.registerSchemaKind(SCHEMA_KIND_FUNCTION, { generator: generateFunctionSchema });
}
