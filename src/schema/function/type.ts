import { ExpType } from "../../enum/expType";

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

  /** The expression evaluation type (Call / Map / Reduce / etc.). */
  type: ExpType;

  /** The function to call — schema type of the target function. */
  func: string;

  /** Arguments — list of expression names or argument names. */
  args: CallArg[];
}

/**
 * A single argument in a function call.
 * If source is set, the value is a source reference path; otherwise value is a constant.
 * Mirrors C# SchemaNode.Core/Schema/FunctionSchema.cs CallArg.
 */
export interface CallArg {
  /** The runtime type hint. */
  type?: string;

  /** The argument source path (e.g. field access path). */
  source?: string;

  /** The constant value. */
  value?: unknown;
}