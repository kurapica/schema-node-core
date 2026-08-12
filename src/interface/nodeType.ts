import type { SchemaLoadState } from "../enum/schemaLoadState";
import type { GenericParameter } from "../schema/generic/type";
import type { NodeSchema } from "../schema/node/type";
import type { IPropertyProvider } from "./propertyProvider";

/** The interface for all node types. */
export interface INodeType extends IPropertyProvider {
  /** The parent namespace (set once the type is loaded into a namespace). */
  get namespace(): INodeType | undefined;

  /** The loaded state flag. */
  loaded: boolean;

  /** Generic template parameters (declared on the schema). */
  get generics(): GenericParameter[] | undefined;

  /** Concrete generic type arguments (resolved at load time). */
  get genericParams(): INodeType[] | undefined;

  /** Full qualified name (namespace.name, may include generic params). */
  get name(): string;

  /** The type kind (e.g. ""enum", "struct", "workflow"). */
  get kind(): string;

  /** The error message (if any). */
  get error(): string | undefined;

  /** The load state. */
  get loadState(): SchemaLoadState;

  /** Get the backing NodeSchema. */
  getNodeSchema(): NodeSchema;

  /** Load the type from the schema. */
  loadType(schema: NodeSchema, genericParams?: INodeType[]): Promise<void>;

  // ── Generic Types ────────────────────────────────────────────────────
  /** Whether the type is generic */
  get isGeneric(): boolean;

  // ── Used-by tracking ─────────────────────────────────────────────────

  /** Whether the type is generic */
  get isUsed(): boolean;

  /** Add a type that uses this type. */
  addUsedBy(type: INodeType): void;

  /** Remove a type that uses this type. */
  removeUsedBy(type: INodeType): void;
}