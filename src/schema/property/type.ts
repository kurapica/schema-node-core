/** Pure data interface. */
export interface PropertySchema {
  /** The property name, such as 'upLimit' */
  property: string;

  /** The property value type */
  type: string;

  /** the schema kinds that the property applies to */
  forSchemas?: string[];

  /** Whether the property value can't be changed by relations */
  static?: boolean;

  /** Whether the property is stackable */
  stackable?: boolean;
}
