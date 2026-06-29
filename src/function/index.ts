// =============================================================================
// ISystemFunction — interface for callable system functions
// =============================================================================

/** A callable system function registered in the runtime. */
export interface ISystemFunction {
  /** Invoke the function with typed arguments. */
  call(args: unknown[]): unknown;
}
