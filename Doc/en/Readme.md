# schema-node-core

The TypeScript core runtime of SchemaNode — the semantic kernel shared by the frontend packages.

SchemaNode treats business semantics as structured definitions that can be described, composed and executed. `schema-node-core` implements that kernel in TypeScript: it registers schema definitions, resolves them into runtime types, wraps data into `DataNode`s, and executes the properties, relations, functions and validation declared on those types. It mirrors the C# reference implementation, [SchemaNode.Core](#related-projects).

[简体中文](../zh/Readme.md)

## Scope

`schema-node-core` is the semantic runtime and nothing else:

- **In scope**: namespaces, scalar / enum / struct / array / function types, schema registration and resolution, `DataNode` value and property management, relations, validation, entry sources and cascading options, locale messages for its own texts.
- **Out of scope**: HTTP access, app definitions and app data, workflows, permissions beyond the declared properties, and any UI component. Those belong to the layers above.

The package has no dependency on Vue, on any UI library, or on the application layer. A node created here can be rendered by any view library that honors the `DataNode` contract.

## Layering

Views are split by dependency rather than by widget type:

| Package | Depends on | Responsibility |
| --- | --- | --- |
| `schema-node-core` | — | Semantic kernel: types, nodes, properties, relations, functions, validation |
| `schema-node-vue-view` | core only | Generic views: input, bool, date, year, range date, enum flags, struct, array, table, locale string, plus the `SchemaView` resolver; also exposes the root-node loader extension point |
| `schema-node-app-view` | core, `schema-node-vue-view`, app | App-level views: paginated table, table filter, and registration of the app root-node lazy loader |
| `schema-node-app` | core | App dialect: app definitions, app fields, app data and workflows |
| `schema-node-man` | all of the above | The admin application that consumes the libraries |

Only `schema-node-core` is required to use the semantic runtime. The view packages are optional and replaceable. Package names above are the published names; the source folder of `schema-node-vue-view` is `schema-node-vueview`.

## Install

```bash
npm install schema-node-core
```

## Quick Start

```ts
import { initSchemaRuntime, saveNodeSchema, getNodeType } from 'schema-node-core'
import schema from './type.json'

initSchemaRuntime()      // Prepare the namespace tree and built-in types
saveNodeSchema(schema)   // Register the semantic types from a JSON definition

const type = await getNodeType('activity.address')
const node = type?.create()

node.name          // node name
node.value         // current value
node.isValid       // validation state
node.subscribe((owner, value) => console.log(value)) // unsubscribe is the return value
```

The semantic types are execution-layer independent. The same definitions can be consumed by this runtime, by the C# implementation, or by any other layer that understands the schema model.

For a complete frontend setup, including Vue 3, Element Plus and `SchemaView`, see [Frontend Integration](./useit/01-integration.md).

## Customizing Views

Views are registered against the runtime, never inside it:

- register a default view for a node kind, or a dedicated view for a specific semantic type, optionally per skin;
- subscribe to `value`, to individual properties, and to validation state on the `DataNode`;
- treat `Readonly` and `Disable` as inherited constraints and subscribe through ancestors;
- rebuild cascading options when `EntrySourceVersion` changes;
- let the form wrapper own labels and validation, and keep leaf views focused on rendering the value.

`schema-node-vue-view` is the reference implementation of the generic view layer. Its `SchemaView` component resolves a component from a type or node, and its built-in views demonstrate every subscription pattern above. `schema-node-app-view` is the reference for app-level views such as paginated tables and table filters.

See [Views and Custom View Components](./useit/02-views.md) for the `DataNode` interface, the property subscription model, registration APIs and the `SchemaView` component.

## Documentation

- [Frontend Integration](./useit/01-integration.md) — create a project, initialize the runtime, render a type.
- [Views and Custom View Components](./useit/02-views.md) — node contract, custom views, registration and layering.

## Related Projects

- [schema-node-csharp](https://github.com/kurapica/schema-node-csharp) — C# reference implementation, architecture documentation and the semantic model.
- [schema-node-vue-view](https://github.com/kurapica/schema-node-vue-view) — generic Vue 3 view library.
- [schema-node-app-view](https://github.com/kurapica/schema-node-app-view) — app-level Vue 3 views.
- [schema-node-man](https://github.com/kurapica/schema-node-man) — the admin application built on these packages.

## Development

```bash
npm run build      # Build the distribution bundle
npm run typecheck  # Type check without emitting
```

## Community

You can join the community on [Discord](https://discord.gg/5xZuk7kMpz).
