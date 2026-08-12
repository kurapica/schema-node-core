import type { IRelationProcess } from "../../schema/relation/interface";
import { Property } from "../property";

/** Binding relation process class to the relation kind property */
export class RelationProcess extends Property<(new() => IRelationProcess)>{}