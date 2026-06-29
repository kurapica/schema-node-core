// ── Base classes ──────────────────────────────────────────────────────────
export { Property } from './property';
export type { IProperty } from './property';
export type { IPropertyOwner } from './propertyOwner';
export {
  getPropertyTyped,
  getPropertiesTyped,
  setPropertyTyped,
  getPropertiesOrdered,
} from './propertyOwner';
export type { IConstraintProperty } from './constraintProperty';
export type { IOrderProperty } from './orderProperty';
export { OrderProperty } from './orderProperty';
export { FuncCallProperty } from './funcCallProperty';
export type { FuncCall, CallArg } from './funcCallProperty';
export { RecordProperty, getRecordedValues } from './recordProperty';

// ── Core properties ───────────────────────────────────────────────────────
export {
  ForSchema, OfSchema, SchemaType, NodeType, SchemaGenerator,
  Generics, Attach, Append, Record, ClrEquivalent, OverrideType,
  PropertyValueType, Stackable, Static, Alias,
  PrimaryIndex, UniqueIndex, Index,
} from './core/index';
export type { GenericParameter } from './core/generics';

// ── Common properties ─────────────────────────────────────────────────────
export {
  Default, Display, Visible, InVisible, ReadOnly, Disable,
  DisplayOnly, Immutable, Error, Suggest, EntrySource, Unpack, StackUpLimit,
} from './common/index';

// ── Constraint properties ─────────────────────────────────────────────────
export {
  Require, Valid, Primary, PrimaryIndex as CPrimaryIndex,
  UniqueIndex as CUniqueIndex, Indexes,
  UpLimitString, UpLimitNumber, UpLimitInt, UpLimitDate,
  LowLimitString, LowLimitNumber, LowLimitInt, LowLimitDate,
  WhiteList, BlackList, SingleFlag, Cascade, LeafOnly, Root,
  StringEntries, IntEntries,
} from './constraint/index';
export type { Entry } from './constraint/entries';

// ── Function properties ───────────────────────────────────────────────────
export {
  Arithmetic, Logic, Converter, Constant, NoCache, ServerOnly, Return,
} from './function/index';

// ── Record properties ─────────────────────────────────────────────────────
export {
  SchemaKindRecord, NodeSchemaKindRecord, ValueSchemaKindRecord,
  RelationKindRecord, ErrorCode,
} from './record/index';
