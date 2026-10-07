import { ScalarType } from "../value/scalar";

export class BoolType extends ScalarType {
  override get isIndexable(): boolean { return true; }
}
