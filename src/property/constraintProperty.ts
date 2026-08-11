// =============================================================================
// IConstraintProperty — validation interface for constraint properties
// Mirrors C# SchemaNode.Core/Property/ConstraintProperty.cs
// =============================================================================

import { IValueAccess } from '../runtime/interfaces';
import { LocaleString } from '../struct/localeString';
import { sformat } from '../utility/locale';
import { Display } from './common/display';
import { Name } from './core/name';
import { Property, type IProperty } from './property';

/**
 * Interface for constraint property components.
 * Each method returns:
 *   true  = valid
 *   false = invalid
 *   undefined/null = not applicable to this node type
 */
export interface IConstraintProperty extends IProperty {
  /** validate the data node */
  validate(node: IValueAccess): Promise<boolean | undefined>;

  /** The error message if the property is invalid. */
  error(node: IValueAccess): string | undefined;
}

/** Check if the property is constraint */
export function isConstraintProperty(prop: IProperty): prop is IConstraintProperty {
    // for simple
  return typeof (prop as any).validate === 'function'
}

export abstract class ConstraintProperty<T> extends Property<T> implements IConstraintProperty {
  abstract validate(node: IValueAccess): Promise<boolean | undefined>;

  /** The error message if the property is invalid(for constraint properties only) */
  error(node: IValueAccess): string | undefined {
    const ctor = this.constructor as Function;
    const error = (ctor as unknown as Record<string, LocaleString>).error;
    if (error)
    {
      const msg = sformat(error, node.getPropertyValue(Display) ?? node.getPropertyValue(Name) );
      if (msg && msg !== error?.key) return msg
    }
    return sformat("VALUE_NOT_VALID", node.getPropertyValue(Display) ?? node.getPropertyValue(Name));
  }
}

/** Gets the default error message */
export function getErrorMessage(prop: IConstraintProperty, node: IValueAccess)
{
    const ctor = prop.constructor as Function;
    const error = (ctor as unknown as Record<string, LocaleString>).error;
    if (error)
    {
      const msg = sformat(error, node.getPropertyValue(Display) ?? node.getPropertyValue(Name) );
      if (msg && msg !== error?.key) return msg
    }
    return sformat("VALUE_NOT_VALID", node.getPropertyValue(Display) ?? node.getPropertyValue(Name));
}