import { Meta } from '../../attribute/meta';
import { OfNodeKind } from '../core/ofNodeKind';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';
import { ConstraintProperty } from '../constraintProperty';
import { InVisible } from './invisible';
import { Visible } from './visible';

import type { IValueAccess } from '../../interface';

import { NS_SYSTEM_SCHEMA_PRO_COMMON, NS_SYSTEM_BOOL, NODE_KIND_PROPERTY } from '../../utility/constant';

@Meta(OfNodeKind, NODE_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_COMMON}.require`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
export class Require extends ConstraintProperty<boolean> {
  effect(target: IValueAccess): void {
    this.clear(target);
    target.recordSubscription(target.subscribeProperty(Visible, this._refersh), this);
    target.recordSubscription(target.subscribeProperty(InVisible, this._refersh), this);
  }

  clear(target: IValueAccess): void {
    target.clearSubscription(this);
  }

  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (!this.hasValue) return undefined;
    return !this._value || !node.isEmpty || node.getPropertyValue(InVisible) || node.getPropertyValue(Visible) === false;
  }

  private _refersh = async (target: IValueAccess) => {
    target.recordConstraint(this, await this.validate(target) as boolean);
  }
}
