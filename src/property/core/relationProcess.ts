import { Meta } from "../../attribute/meta";
import { Alias } from "./alias";
import { Property } from "../property";

import type { IRelationProcess } from "../../schema/relation/interface";

/** Binding relation process class to the relation kind property */
@Meta(Alias, 'relationProcess')
export class RelationProcess extends Property<(new() => IRelationProcess)>{}