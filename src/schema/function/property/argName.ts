import { Meta } from "../../../attribute/meta";
import { Alias } from "../../../property/core/alias";
import { Property } from "../../../property/property";

/** The argument name */
@Meta(Alias, 'argName')
export class ArgName extends Property<string> {};