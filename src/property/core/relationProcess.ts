import { Property } from '../property';import { IRelationProcess } from "../../schema/relationSchema";

/** Binding relation process class to the relation kind property */
export class RelationProcess extends Property<(new() => IRelationProcess)>{}