import { ApplyMode } from "../../enum/applyMode/type";
import type { LocaleString } from "../../struct/localeString/type";

/** Pure data interface for function schema extension data. */
export interface FunctionSchema {
  /** The return type of the function. 'T', 'T1', 'T2' denote generic type params. */
  return: string;

  /** The function arguments. */
  args: FuncArg[];

  /** The function expressions (compiled body). */
  exps: FuncExp[];

  /** The runtime function reference (not part of schema). */
  func?: Function; // runtime function reference (not part of schema)
}

/**
 * A single argument definition of a function.
 * Mirrors C# SchemaNode.Core/Schema/FunctionSchema.cs FuncArg.
 */
export interface FuncArg {
  /** The argument name. */
  name: string;

  /** The argument type. 'T', 'T1', 'T2' denote generic type params. */
  type: string;
}

/**
 * A single expression in the function body.
 * Mirrors C# SchemaNode.Core/Schema/FunctionSchema.cs FuncExp.
 */
export interface FuncExp {
  /** The expression name (identifier). */
  name: string;

  /** The return type of this expression. */
  return: string;

  /** The function call. */
  call: FuncCall;
}

/**
 * Represents a deferred function call: func(args...).
 */
export interface FuncCall {
  /** The apply mode. */
  mode: ApplyMode;

  /** Fully qualified function schema name. */
  func: string;
  
  /** Call arguments. */
  args: CallArg[];
}

/**
 * A single argument in a function call.
 * If source is set, the value is a source reference path; otherwise value is a constant.
 * Mirrors C# SchemaNode.Core/Schema/FunctionSchema.cs CallArg.
 */
export interface CallArg {
  /** The argument name.(not savable) */
  name?: LocaleString;

  /** The runtime type hint. */
  type?: string;

  /** The argument source path (e.g. field access path). */
  source?: string;

  /** The constant value. */
  value?: unknown;
}

/** build the function call for simple */
export function buildFuncCall(func: string, ...args: unknown[]): FuncCall
{
  return {
    mode: ApplyMode.Call,
    func,
    args: args.map(a => {
      if (typeof(a) === 'string')
      {
        if (a.startsWith('@'))
        {
          if (a.startsWith('@@'))
            return { value: a.substring(1) }
          return { source: a.substring(1) }
        }
        else if (a.startsWith('$'))
        {
          if (a.startsWith('$$'))
            return { value: a.substring(1) }
          return { source: a }
        }
      }
      return { value: a }
    })
  }
}