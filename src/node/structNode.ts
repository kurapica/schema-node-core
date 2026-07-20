// =============================================================================
// StructNode — structured data node with named fields
// Mirrors C# SchemaNode.Core/Node/StructNode.cs
// =============================================================================

import { DataNode } from './dataNode';
import type { StructType } from '../runtime/type/structType';
import { IValueAccess } from '../runtime/interfaces';
import { isNull } from '../utility/toolset';
import { DisplayOnly, InVisible, Unpack } from '../property';

export class StructNode extends DataNode {
  // #region ── ctor & dtor ───────────────────────────────────────────────────

  private _fields: DataNode[] = [];

  constructor(type: StructType, value: unknown, parent: IValueAccess | undefined = undefined) {
    super(type, undefined, parent);

    const fields = type.getFields();
    for (const field of fields.filter(f => f.type)) {
      const node = field.type!.create(undefined, this);
      node.setPropertyProvider(field);
      this._fields.push(node);
    }

    if (typeof(value) === 'object' && !isNull(value) && !Array.isArray(value))
    {
      this.setValue(value);
      this.confirm();
    }
  }

  dispose() {
    super.dispose();
  }

  // #endregion

  // #region ── Value Access ──────────────────────────────────────────────────

  override setValue(value: unknown): void {
    const data: Record<string, unknown> = typeof(value) === 'object' && !isNull(value) && !Array.isArray(value) ? value as Record<string, unknown> : {};
    // as raw
    this._value = data;
    this._fields.forEach(f => {
      let d = data[f.name!];
      if (f.getPropertyValue(Unpack) && isNull(d))
      {
          const names = this._fields.map(f => f.name);
          d = {} ;
          for (let k in data)
          {
            if (!names.includes(k))
              (d as Record<string, unknown>)[k] = data[k];
          }
      }
      f.setValue(d);
    });
  }

  override getValue(): unknown {
    const result: Record<string, unknown> = {};
    this._fields.forEach(f => {
      if (f.isEmpty || f.getPropertyValue(DisplayOnly)) return;
      if (f.getProperty(InVisible) && !f.isValid) return; // skip invisible required fields
      const d = f.getValue();
      if (f.getProperty(Unpack))
      {
        if (typeof(d) === 'object')
        {
          for (let k in d){
            const v = (d as Record<string, unknown>)[k];
            if (!isNull(v)) result[k] = v;
          }
        }
        else
        {
          result[f.name!] = d;
        }
      }
    });
    return result;
  }

  override get isEmpty(): boolean { return !this._fields.some(f => !f.isEmpty) }

  override get changed(): boolean { return this._fields.some(f => !f.getPropertyValue(DisplayOnly) && f.changed) }

  override confirm(): void { 
    this._fields.forEach(f => f.confirm())  
    super.confirm();
  }

  // #endregion

  // #region ── Path Navigation ───────────────────────────────────────────────

  override getAccessValue(path: string): DataNode | undefined {
    const dot = path.indexOf('.');
    const first = dot >= 0 ? path.substring(0, dot) : path;
    const rest = dot >= 0 ? path.substring(dot + 1) : '';

    if (first === '$self') return this;
    if (first === '$previous') return undefined;

    const field = this._fields.get(first);
    if (!field) return undefined;
    return rest ? field.getAccessValue(rest) : field;
  }

  // #endregion
}
