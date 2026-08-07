// =============================================================================
// StructNode — structured data node with named fields
// Mirrors C# SchemaNode.Core/Node/StructNode.cs
// =============================================================================

import { DataNode } from './dataNode';
import type { StructType } from '../runtime/type/structType';
import { IPropertyProvider, IRelationInfo, IValueAccess } from '../runtime/interfaces';
import { isEqual, isNull } from '../utility/toolset';
import { OverrideType, Unpack } from '../property';
import { NODE_SELF } from '../utility/constant';
import { getNodeType, ValueType } from '../runtime';

export class StructNode extends DataNode {
  // #region ── ctor & dtor ───────────────────────────────────────────────────

  private _fields: DataNode[] = [];
  private _fieldRelations?: Map<string, IRelationInfo[]>;
  private _fieldTypeTrack?: Map<string, Function>;

  constructor(type: StructType, value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider) {
    super(type, undefined, parent, propProvider);

    const fields = type.getFields();
    for (const field of fields.filter(f => f.type)) {
      const node = field.type!.create(undefined, this, field);
      this._fields.push(node);
    }

    value = typeof(value) === 'object' && !isNull(value) && !Array.isArray(value) ? value : {};
    this.setValue(value);
    this.confirm();

    // keep raw data update
    this._fields.forEach(f => {
      f.applyPropertyEffects();
      if (f.displayOnly) return;
      this.recordSubscription(f.subscribe(this.writeBackRawValue, true));
    });

    // attach relations from type
    this.attachRelations([{owner: this, relations: Array.from(type.getRelations())}]);
  }

  override dispose() {
    this._fields.forEach(f => f.dispose());
    this._fields = [];
    super.dispose();
  }

  // #endregion

  // #region Core Features  ───────────────────────────────────────────────────

  private *_getFields(): Generator<DataNode>{ yield* this._fields; }

  /** Get the fields of the struct. */
  get fields(): Iterable<DataNode> { return this._getFields(); }

  /** Check if the field is changable. */
  isFieldChangable(field: string): boolean {
    return this._fieldTypeTrack?.has(field.toLowerCase()) || false;
  }

  // #endregion

  // #region ── Value Access ──────────────────────────────────────────────────

  override setValue(value: unknown): void {
    const data: Record<string, unknown> = typeof(value) === 'object' && !isNull(value) && !Array.isArray(value) ? value as Record<string, unknown> : {};
    const consumed = new Set<string>();
    let packFields: DataNode[] = [];

    // as raw
    for (const f of this._fields)
    {
      if (consumed.has(f.name!)) continue;
      consumed.add(f.name!);
      let d = data[f.name!];

      // pack/unpack
      if (f.getPropertyValue(Unpack) && isNull(d))
      {
        packFields.push(f);
        continue;
      }
      f.setValue(d);
    }

    packFields.sort((a, b) => a instanceof StructNode ? -1 : 1);
    for (const f of packFields)
    {
      if (f instanceof StructNode)
      {
        for (const sf of f._fields)
        {
          if (consumed.has(sf.name!)) continue;
          consumed.add(sf.name!);
          // ignore pack field in sub struct
          sf.setValue(data[sf.name!]);
        }
      }
      else
      {
        const record: Record<string, unknown> = {};
        for (let k in data)
        {
          if (consumed.has(k)) continue;
          consumed.add(k);
          record[k] = data[k];
        }
        f.setValue(record);
      }
    }
    super.setValue(value);
  }

  override getValue(): unknown {
    const result: Record<string, unknown> = {};
    this._fields.forEach(f => {
      if (f.isEmpty || f.displayOnly) return;
      if (!f.isValid && !f.visible) return; // skip invisible & invalid field

      const d = f.getValue();
      if (f.getProperty(Unpack))
      {
        if (typeof(d) === 'object')
        {
          for (let k in d){
            const v = (d as Record<string, unknown>)[k];
            if (!isNull(v) && isNull(result[k])) result[k] = v;
          }
        }
        else
        {
          result[f.name!] = d;
        }
      }
      else
      {
        result[f.name!] = d;
      }
    });
    return result;
  }

  override get isEmpty(): boolean { return !this._fields.some(f => !f.displayOnly && !f.isEmpty) }

  override get changed(): boolean { return this._fields.some(f => !f.displayOnly && f.changed) }

  override confirm(): void { 
    this._fields.forEach(f => f.confirm())  
    super.confirm();
  }

  // #endregion

  // #region ── Path Navigation ───────────────────────────────────────────────

  override getAccessValue(path: string, node?: IValueAccess): IValueAccess | undefined {
    const dot = path.indexOf('.');
    const first = dot >= 0 ? path.substring(0, dot).toLowerCase() : path.toLowerCase();
    const rest = dot >= 0 ? path.substring(dot + 1) : '';

    if (!first || first == NODE_SELF) return this;
    const field = this._fields.find(f => f.name?.toLowerCase() == first);
    if (!field) return undefined;
    return rest ? field.getAccessValue(rest, node) : field;
  }

  // #endregion
  
  // #region ── Validation ────────────────────────────────────────────────────

  override get isValid(): boolean { return !this._fields.some(f => !f.displayOnly && !f.isValid) && super.isValid }

  // #endregion

  // #region ── Relation ──────────────────────────────────────────────────────
  override attachRelations(relationInfos: IRelationInfo[]): void {
    const fieldRelations = new Map<string, IRelationInfo[]>();

    // attach relations from given infos
    relationInfos.forEach(info => {
      info.relations.forEach(r => {
        const paths = r.target.split('.').filter(p => p.trim() !== '');
        let curr: IValueAccess | undefined = info.owner;
        for (let i = 0; i < paths.length; i++)
        {
          if (curr === undefined) return;
          if (curr === this){
            if (i === paths.length - 1)
              r.attach(info.owner, this);
            else
            {
              const next = paths[i].toLowerCase();
              const fieldInfos = fieldRelations.get(next) ?? [];
              const exist = fieldInfos.find(f => f.owner === info.owner);
              if (exist){
                exist.relations.push(r);
              }
              else{
                fieldInfos.push({owner: info.owner, relations: [r]});
              }
              fieldRelations.set(next, fieldInfos);
            }
            break;
          }
          curr = curr?.getAccessValue(paths[i], this);
        }
      });
    });

    // attach relations from children
    this._fields.forEach(f => {
      const name = f.name!.toLowerCase();
      const infos = fieldRelations.get(name) ?? [];
      if (infos.length)
      {
        // keep track of field relations
        this._fieldRelations ??= new Map();
        if (this._fieldRelations?.get(name))
        {
          this._fieldRelations.get(name)!.push(...infos);
        }
        else
        {
          this._fieldRelations.set(name, infos);
        }

        // track override type
        if (infos.some(i => i.relations.some(r => r.propertyCtor === OverrideType && i.owner.getAccessValue(r.target, f) === f)))
        {
          this._fieldTypeTrack ??= new Map();
          if (!this._fieldTypeTrack.has(name))
            this._fieldTypeTrack.set(name, f.subscribeProperty(OverrideType, this.trackOverrideType));
        }

        // attach relations to child
        f.attachRelations(infos);
      }
    });
  }
  
  // #endregion
  
  // #region ── Utility ────────────────────────────────────────────────────

  private writeBackRawValue(field: IValueAccess, value: unknown) {
    (this._value as any)[(field as DataNode).name!] = value;
    this.onNext();
  }

  private async trackOverrideType(field: IValueAccess, newValue?: unknown | undefined, oldValue?: unknown | undefined) {
    if (!isEqual(oldValue, newValue))
    {
      const node = field as DataNode;
      const strutField = (this.type as StructType).getField(node.name!)!;
      const index = this._fields.indexOf(node);
      if (index === -1) return;

      const type = newValue ? await getNodeType(newValue as string) as ValueType : strutField.type;
      if (!type || type == node.type) return;
      
      const newNode = type.create(node.original, this, strutField);
      newNode.value = node.rawValue;
      node.moveSubscription(newNode);

      // replace old node with new node
      this._fields[index] = newNode;
      node.dispose();

      // attach relations to new node
      newNode.attachRelations(this._fieldRelations?.get(node.name!.toLowerCase()) ?? []);

      // write back raw value
      this.writeBackRawValue(newNode, newNode.rawValue);
    }
  }

  // #endregion
}
