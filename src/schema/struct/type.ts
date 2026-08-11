/** The struct schema */
export interface StructSchema {
  fields: StructFieldSchema[];
}

/** A single field definition within a struct. */
export interface StructFieldSchema {
  name: string;
  type: string;
  error?: string;
}
