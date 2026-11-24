# Frontend Integration

This page shows how to bring `schema-node-core` into a TypeScript frontend project and render data with it. If you only want to know how views are resolved and customized, continue with [Views and Custom View Components](./02-views.md).

## Packages

| Package | Responsibility | Required |
| --- | --- | --- |
| `schema-node-core` | Semantic runtime: schema registration, type resolution, `DataNode`, properties, relations, functions and validation | Yes |
| `schema-node-vue-view` | Vue 3 + Element Plus view library; presentation only | Optional |
| `schema-node-app-view` | App-level views (paginated table, table filter); needed only when the schema belongs to an App | No |
| `schema-node-app` | Application layer: app definitions, app data and workflows; needed only when the schema belongs to an App | No |

`schema-node-core` knows nothing about HTTP, app data or UI components. It turns schema definitions into runtime types, wraps data into `DataNode`s and executes the semantics declared on those types.

## 1. Create a Vue 3 Project

Use Vite to create a Vue 3 + TypeScript project:

```bash
npm create vite@latest my-schema-app -- --template vue-ts
cd my-schema-app
npm install
```

Any other way of creating a Vue 3 + TypeScript project works as well.

## 2. Install SchemaNode

Install the core runtime and the view library:

```bash
npm install schema-node-core schema-node-vue-view
```

Install Vue 3 and Element Plus if the project does not include them yet:

```bash
npm install vue element-plus
```

## 3. Initialize the Runtime

Put the schema JSON file into `src/assets` (for example `type.json`), then configure `src/main.ts`:

```ts
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import schema from './assets/type.json'
import { initSchemaRuntime, saveNodeSchema, setLanguage } from 'schema-node-core'

initSchemaRuntime() // Must run before any type is registered or resolved
setLanguage('zhCN') // Pick a built-in locale; zhCN and enUS are bundled
saveNodeSchema(schema) // Register the semantic types declared in the JSON file

const app = createApp(App)

app.use(ElementPlus)

app.mount('#app')
```

- `setLanguage` selects one of the locales bundled with core (`zhCN`, `enUS`, plus the `zh` / `en` aliases). It only affects core's own messages and display names.
- `initSchemaRuntime` prepares the namespace tree and registers the built-in system types. Call it once, before registering or resolving any type.
- `saveNodeSchema` accepts one `NodeSchema` or an array of them and registers each definition in the namespace tree. The JSON file is a plain serialization of schema definitions, so it can be version-controlled like any other asset.

You can obtain such a file from the type manager of the static `schema-node-man` build:

<https://kurapica.github.io/schema-node-man/#/type>

Create or import types there, then use the download action to export them. Types can also be declared in code with the `@Meta` decorators and registered through the same API.

## 4. Render a Type

Replace the content of `src/App.vue`:

```vue
<template>
  <el-form label-width="240px" label-position="left">
    <schema-view
      text="left"
      type="activity.address"
      :in-form="SchemaNodeFormType.ExpandAll"
      v-model="data"
    ></schema-view>
    <section style="width: 100%;text-align: center;">
      <textarea style="width:100%;max-width:72ch;height:20rem;" disabled>{{ data }}</textarea>
    </section>
  </el-form>
</template>

<script lang="ts" setup>
import { schemaView, SchemaNodeFormType } from 'schema-node-vue-view'
import { ref } from 'vue'

const data = ref(null)
</script>
```

`schema-view` is the universal component provided by `schema-node-vue-view`. It resolves a view component from the given type (or node) and renders the semantic data. Here `type="activity.address"` selects the semantic type, `SchemaNodeFormType.ExpandAll` flattens nested structs into form rows, and `v-model` keeps the node value in sync.

Save the file and run `npm run dev` to see the result.

## 5. Next Steps

- To change how a type is rendered, register your own view component or replace the whole view library: see [Views and Custom View Components](./02-views.md).
- To read and write App data, workflows or permissions, use `schema-node-app`. That layer is outside the scope of this package.
