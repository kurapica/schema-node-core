import { DataNode } from "../value/node";

/** The data node represets the scalar types */
export abstract class ScalarNode extends DataNode {}

// ── Concrete scalar nodes ─────────────────────────────────────────────────

/** The data node represents the object type */
export class AnyNode extends ScalarNode {}