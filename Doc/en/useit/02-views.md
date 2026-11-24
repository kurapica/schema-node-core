# Views and Custom View Components

`schema-node-vue-view` (source directory `schema-node-vueview`) is a Vue 3 + Element Plus view library. It was prepared for `schema-node-man`, and it also suits admin backends or any scenario with modest styling requirements. The library is cheap to replace: it only renders, and it owns no business logic or data relations.

This page explains how to register a view component for a semantic type. The same contract applies to any other view library.

## 1. Semantic Data Nodes

The whole SchemaNode system is designed around three things: semantic entities, semantic types and semantic prototypes.

`schema-node-core` is the TypeScript core of SchemaNode. It provides the complete frontend semantic runtime: it wraps data into `DataNode`s according to semantic types. Each node manages its own value and properties, updates properties and validates itself according to the relations declared by the type. For example, a node configured with an `entrySource` property maintains its own cascading option list, similar to enum values. The dropdown selections used while configuring semantic types are implemented this way as well.

To register a view for a specific semantic type, you first need a rough understanding of the public `DataNode` interface.

### 1.1 Available Properties

* `name` read-only, the node name, similar to a struct field name.
* `access` read-only, the node access path, needed by some special UI rendering libraries.
* `value` readable/writable, the computed value of the node.
* `rawValue` read-only, the raw value of the node.
* `original` read-only, the initial value of the node.
* `submitValue` read-only, the submitted value of the node.
* `changed` read-only, whether the node has been modified.
* `isValid` read-only, whether the node passes validation.

### 1.2 Common Methods

* `confirm()`, save the current value as the initial value and reset the modification state.
* `reset()`, reset the current value to the initial value.
* `getPropertyValue(property: string | PropertyCtor)`, get the value of the specified property.
* `getPropertyValues(property: string | PropertyCtor[])`, get an iterator over the specified property values. Accumulable properties may have multiple values, for example validation properties; `PropertyCtor` is the property type.
* `subscribe(func: Observer<[IValueAccess, unknown]>, immediate?: boolean): Function`, subscribe to node value changes and return an unsubscribe function.
* `subscribeProperty(property: string | PropertyCtor, func: Observer<[IValueAccess, PropertyCtor, unknown, unknown]>, immediate?: boolean): Function`, subscribe to changes of the specified property and return an unsubscribe function. The last two callback arguments are the current value and the old value.
* `subscribeViolated(func: Observer<[IValueAccess, boolean]>, immediate?: boolean): Function`, subscribe to changes of the node's validation state and return an unsubscribe function.

### 1.3 Common Properties

Creating a custom view is essentially about subscribing to the node's value, properties and validation state. Validation state is already handled by the view that wraps `el-form`, so a leaf view only needs to subscribe to value and property changes.

Commonly used property types (they can be imported directly from `schema-node-core`); more can be determined from the properties configured on the type:

* `Default` - default value.
* `Require` - required.
* `Readonly` - read-only.
* `Disable` - disabled.
* `AsSuggest` - cascading data is only a suggestion, not a constraint.
* `LeafOnly` - cascading selection can only choose leaf nodes.
* `EntrySourceVersion` - cascading data version. `EntrySource` and related properties may invalidate previously loaded options, so subscribe to `EntrySourceVersion`.

## 2. Custom View Components

For detailed customization, refer to how each view is implemented in the `schema-node-vue-view` project. Because the library is decoupled from business, its views only subscribe to value and property changes to drive rendering. AI can translate the whole library into an implementation based on another component library, so the following focuses on the property details.

### 2.1 Property Subscription

For a view dedicated to one semantic type, the configurable properties are known in advance. For a generic view, ignore validation-related properties and focus on rendering-related ones.

Reference implementation from `inputView`:

```ts
// state change
if (props.readonly) {
  state.readonly = true;
}
else {
  subs.push(subscribeAncestorProperty(node, ReadOnly, (values: boolean[]) => state.readonly = values.some(v => v), true));
  subs.push(subscribeAncestorProperty(node, Disable, (values: boolean[]) => state.disable = values.some(v => v), true));
}
subs.push(node.subscribeProperty(Default, (owner: IValueAccess, propCtor: PropertyCtor, newValue: any, oldValue: any) => state.default = newValue, true));
subs.push(node.subscribeProperty(Require, (owner: IValueAccess, propChange: PropertyCtor, newValue: any, oldValue: any) => state.require = newValue as boolean, true));
subs.push(node.subscribeProperty(AsSuggest, (owner: IValueAccess, propChange: PropertyCtor, newValue: any, oldValue: any) => state.asSuggest = newValue as boolean, true));
subs.push(node.subscribeProperty(LeafOnly, (owner: IValueAccess, propChange: PropertyCtor, newValue: any, oldValue: any) => state.leafOnly = newValue as boolean, true));
```

Most updates use `node.subscribeProperty` on the node itself. Only `Readonly` and `Disable` need ancestor subscriptions, because those constraints are inherited from enclosing nodes.

`subscribeAncestorProperty` is exported by `schema-node-vue-view` and can be copied as is.

`EntrySourceVersion` is more involved; refer to the `rebuildOptions` method of `inputView` in `schema-node-vue-view`. It only reads cascading options from the node and does not care how those options are loaded or maintained.

Every subscription returns an unsubscribe function. Collect them and call them when the component unmounts, otherwise a re-rendered node keeps pushing into a dead component.

### 2.2 Registering View Components

`schema-node-vueview/src/index.ts` registers the default view components. Registration happens at two levels.

**By node kind.** `regBaseSchemaKindView(kind, view, resolve?)` sets the default view for a kind. The optional third argument picks a more specific view for a node shape, for example:

* an enum whose `type` is `EnumValueType.Flags` renders with `flagsEnumView`;
* an `EnumArrayNode` renders with `inputView`;
* an array whose element type is a struct renders with `tableView` unless the struct is configured to render as a single value.

These registrations come from the generic library. App-level views (the paginated table, the table filter) are registered by `schema-node-app-view` from the layer that owns them, so the generic library never imports app code.

**By semantic type.** `regSchemaTypeView(type, view, skin = 'default', asSingle = false)` registers a view for a specific type name:

```ts
regSchemaTypeView(NS_SYSTEM_RANGE_FULL_DATE, rangeDateView);
```

A fourth parameter, `asSingle`, marks the type as renderable as a single value. `NS_SYSTEM_LOCALE_STRING` uses it. The third argument is the skin: `regSchemaTypeView(type, view, 'compact')` registers the same type again under the `compact` skin, and `default` is used when the requested skin has no registered component. Scalar types also fall back to their base type's registration.

### 2.3 Container Views and Leaf Views

Views form a chain rather than a flat set. A container view (struct, array, table) owns the child nodes and renders each of them through `SchemaView` again, so nested types follow the same resolution rules at every level. The form-item wrapper owns the label, the required rule, the error message and the `subscribeViolated` subscription; the leaf view only renders the value control. A leaf view should not create child nodes or display validation on its own, otherwise errors appear twice or disagree with `el-form`.

## 3. SchemaView Component

`SchemaView` is the central component provided by `schema-node-vue-view`. Its job is simple: given a semantic type or an existing node, it resolves a suitable view component and renders it. It passes through properties that do not belong to itself, such as `el-table` attributes.

| Prop | Description |
| --- | --- |
| `node` | An existing `DataNode`; when provided, no new node is created |
| `type` | Type name; creates a node by it when `node` is absent |
| `modelValue` | Node value used with `v-model` |
| `value` | Value used for read-only display, without two-way binding |
| `props` | Property set applied when creating a node |
| `skin` | View skin, default `default`; allows multiple view sets for one type |
| `inForm` | Form display mode: `'expand'`, `'expand2'`, `'expand3'`, `'expandall'`, `'nest'`, or empty |
| `text` | Read-only text alignment: `left`, `right`, `center` |
| `readonly` | Read-only mode |
| `rootDiv` | Scroll container for lazy loading of app fields |
| `instantValid` | Validate immediately on input |
| `debug` | Show type, property and relation information |

Two typical usages:

```vue
<!-- Hold the node yourself -->
<schema-view :node="fieldNode" :readonly="true" text="left" />

<!-- Create a node by type and bind its value -->
<schema-view
  v-model="data"
  type="activity.address"
  :in-form="SchemaNodeFormType.ExpandAll"
  text="left"
/>
```

When `inForm` is `true`, the component decides automatically: types that can be displayed as a single value use `Nest`, otherwise `Expand`. This controls how nested structures are laid out; configure it explicitly if you want a flattened form.

The component passes its default slot through to the actual view, so you can wrap the input area of any field.

## 4. Where a View Layer Fits

The view packages are split by dependency, not by widget type:

| Layer | Depends on | Content |
| --- | --- | --- |
| `schema-node-core` | — | Semantic runtime: types, nodes, properties, relations, functions |
| `schema-node-vue-view` | core only | Generic views: input, bool, date, year, range date, enum flags, struct, array, table, locale string, plus the `SchemaView` resolver |
| `schema-node-app-view` | core, `schema-node-vue-view`, app | App-level views: paginated table, table filter, registration of the app root node lazy loader |
| `schema-node-app` | core | App dialect: app definitions, app fields, app data and workflows |
| `schema-node-man` | all of the above | The admin application that consumes the libraries |

The split keeps generic views free of app semantics. `schema-node-vue-view` exposes the root-node loader extension point `regRootNodeLoader(loader)` alongside `getRootNodeLoader()`; a loader supplies `match`, `isLoaded`, `load` and `subscribe`, and `SchemaView` uses it to drive loading state for nodes it does not own. `schema-node-app-view` registers the app-specific loader there: it matches any field whose parent is an `AppNode`, reads the `Loaded` property, and reloads through the app. A project that only needs generic views never registers a loader and never pulls in app data code.

When customizing:

* change generic rendering (leaf controls, struct layout, plain tables) by following `schema-node-vue-view`;
* change app-level rendering (paginated tables, table filters, root node lazy loading) by following `schema-node-app-view`;
* keep core free of view concerns; a view registers itself against a node shape or a type name, and core only exposes the node contract.
