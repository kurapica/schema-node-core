// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Core/NodeType.cs
// =============================================================================

import { NodeType } from '../../runtime/type/nodeType';
import { Property } from '../property';

/**
 * Define the runtime type of a node schema kind.
 */
export class RuntimeNodeType extends Property<new () => NodeType> {};
