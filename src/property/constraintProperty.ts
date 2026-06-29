// =============================================================================
// IConstraintProperty — validation interface for constraint properties
// Mirrors C# SchemaNode.Core/Property/ConstraintProperty.cs
// =============================================================================

import type { IProperty } from './property';

// Forward references — resolved at runtime to avoid circular imports
interface DataNode { isEmpty: boolean; }
interface EnumNode extends DataNode { }
interface IntNode extends DataNode { }
interface StringNode extends DataNode { }
interface NumericNode extends DataNode { }
interface DateNode extends DataNode { }
interface StructNode extends DataNode { }
interface ArrayNode extends DataNode { }

/**
 * Interface for constraint property components.
 * Each method returns:
 *   true  = valid
 *   false = invalid
 *   undefined/null = not applicable to this node type
 */
export interface IConstraintProperty extends IProperty {
  /** Default dispatch — picks the right validate method by node type. */
  validate(node: DataNode): boolean | undefined;

  /** Async version of validate. */
  validateAsync(node: DataNode): Promise<boolean | undefined>;

  // ── Enum ───────────────────────────────────────────────────────────────

  validateEnum?(node: EnumNode): boolean | undefined;
  validateEnumAsync?(node: EnumNode): Promise<boolean | undefined>;

  // ── Int ────────────────────────────────────────────────────────────────

  validateInt?(node: IntNode): boolean | undefined;
  validateIntAsync?(node: IntNode): Promise<boolean | undefined>;

  // ── String ─────────────────────────────────────────────────────────────

  validateString?(node: StringNode): boolean | undefined;
  validateStringAsync?(node: StringNode): Promise<boolean | undefined>;

  // ── Numeric (decimal) ──────────────────────────────────────────────────

  validateNumeric?(node: NumericNode): boolean | undefined;
  validateNumericAsync?(node: NumericNode): Promise<boolean | undefined>;

  // ── Date ───────────────────────────────────────────────────────────────

  validateDate?(node: DateNode): boolean | undefined;
  validateDateAsync?(node: DateNode): Promise<boolean | undefined>;

  // ── Struct ─────────────────────────────────────────────────────────────

  validateStruct?(node: StructNode): boolean | undefined;
  validateStructAsync?(node: StructNode): Promise<boolean | undefined>;

  // ── Array ──────────────────────────────────────────────────────────────

  validateArray?(node: ArrayNode): boolean | undefined;
  validateArrayAsync?(node: ArrayNode): Promise<boolean | undefined>;
}
