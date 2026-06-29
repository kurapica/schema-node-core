// =============================================================================
// System schema registration — scans decorated classes for auto-registration
// =============================================================================

import type { SchemaRuntime } from '../runtime/schemaRuntime';
import { systemStructTypes, systemScalarTypes } from '../struct/systemTypes';
import { SystemIntrinsic } from './systemIntrinsic';
import { SystemLogic } from './systemLogic';
import { SystemMath } from './systemMath';
import { SystemStr } from './systemStr';
import { SystemCollection } from './systemCollection';

export function registerSystemSchemas(runtime: SchemaRuntime): void {
  // Struct & scalar types
  runtime.scanDecoratedClasses(systemStructTypes);
  runtime.scanDecoratedClasses(systemScalarTypes);

  // Function classes — @Meta(OfSchema, "function") on class triggers method scanning
  runtime.scanDecoratedClasses([SystemIntrinsic, SystemLogic, SystemMath, SystemStr, SystemCollection]);
}

export { SystemIntrinsic } from './systemIntrinsic';
export { SystemLogic } from './systemLogic';

