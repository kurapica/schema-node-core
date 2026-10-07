import { Meta } from "../../attribute/meta";
import { Alias } from "./alias";
import { Property } from "../property";

/** Disable constraint. */
@Meta(Alias, 'disableConstraint')
export class DisableConstraint extends Property<boolean> {}