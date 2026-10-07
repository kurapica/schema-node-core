import { Property } from "../property";

import type { IRelationProcess } from "../../schema/relation/interface";

/** Binding relation process class to the relation kind property */
export class RelationProcess extends Property<(new() => IRelationProcess)>{}