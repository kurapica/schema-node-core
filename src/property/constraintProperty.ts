// =============================================================================
// IConstraintProperty — validation interface for constraint properties
// Mirrors C# SchemaNode.Core/Property/ConstraintProperty.cs
// =============================================================================

import { formatLocaleString } from '../struct/localeString/type';
import { Display } from './common/display';
import { Name } from './core/name';
import { Property } from './property';

import type { LocaleString } from '../struct/localeString/type';
import type {IValueAccess, IConstraintProperty } from '../interface';

export abstract class ConstraintProperty<T> extends Property<T> implements IConstraintProperty {
  abstract validate(node: IValueAccess): Promise<boolean | undefined>;

  /** The error message if the property is invalid(for constraint properties only) */
  error(node: IValueAccess): string | undefined {
    return getErrorMessage(this, node);
  }
}

/** Gets the default error message */
export function getErrorMessage(prop: IConstraintProperty, node: IValueAccess)
{
    const ctor = prop.constructor as Function;
    const error = (ctor as unknown as Record<string, LocaleString>).error;
    if (error)
    {
      const msg = formatLocaleString(error, node.getPropertyValue(Display) ?? node.getPropertyValue(Name), prop.getValue());
      if (msg && msg !== error?.key) return msg
    }
    return formatLocaleString("VALUE_NOT_VALID", node.getPropertyValue(Display) ?? node.getPropertyValue(Name));
}