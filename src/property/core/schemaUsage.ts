import { Meta } from "../../attribute/meta";
import { Alias } from "./alias";
import { Property } from "../property";

/** The schema usage */
@Meta(Alias, 'schemaUsage')
export class SchemaUsage extends Property<string>{}