# 前端接入

本页说明如何把 `schema-node-core` 引入 TypeScript 前端项目，并用它渲染数据。如果只想了解视图如何解析与定制，请继续阅读[视图与自定义视图组件](./02-views.md)。

## 依赖包

| 包 | 职责 | 是否必需 |
| --- | --- | --- |
| `schema-node-core` | 语义运行时：类型注册、类型解析、`DataNode`、属性、关联、函数与校验 | 必需 |
| `schema-node-vue-view` | Vue 3 + Element Plus 视图库，只负责呈现 | 可选 |
| `schema-node-app-view` | App 级视图（分页表格、表格过滤）；仅当 Schema 属于某个 App 时需要 | 否 |
| `schema-node-app` | 应用层：应用定义、应用数据与工作流；仅当 Schema 属于某个 App 时需要 | 否 |

`schema-node-core` 不涉及 HTTP、应用数据或 UI 组件。它把语义定义解析为运行时类型，把数据封装为 `DataNode`，并执行类型上声明的语义。

## 1. 创建 Vue 3 项目

使用 Vite 创建 Vue 3 + TypeScript 项目：

```bash
npm create vite@latest my-schema-app -- --template vue-ts
cd my-schema-app
npm install
```

也可以使用其他方式创建 Vue 3 + TypeScript 项目。

## 2. 安装 SchemaNode

安装核心运行时和视图库：

```bash
npm install schema-node-core schema-node-vue-view
```

如果项目尚未包含 Vue 3 与 Element Plus，一并安装：

```bash
npm install vue element-plus
```

## 3. 初始化运行时

把 Schema JSON 文件放入 `src/assets`（例如 `type.json`），然后配置 `src/main.ts`：

```ts
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import schema from './assets/type.json'
import { initSchemaRuntime, saveNodeSchema, setLanguage } from 'schema-node-core'

initSchemaRuntime() // 必须先于任何类型注册与解析
setLanguage('zhCN') // 选择内置语言；核心内置 zhCN 与 enUS
saveNodeSchema(schema) // 注册 JSON 文件中声明的语义类型

const app = createApp(App)

app.use(ElementPlus)

app.mount('#app')
```

- `setLanguage` 从核心内置的语言中选择一种（`zhCN`、`enUS`，以及 `zh` / `en` 别名），只影响核心自身的提示与展示名。
- `initSchemaRuntime` 准备命名空间树并注册内置系统类型。它只调用一次，必须在注册或解析类型之前完成。
- `saveNodeSchema` 接受一个 `NodeSchema` 或数组，把每个定义注册到命名空间树中。JSON 文件只是语义定义的可序列化形式，可以像其他资源一样纳入版本管理。

这样的文件可以从 `schema-node-man` 静态构建的类型管理中导出：

<https://kurapica.github.io/schema-node-man/#/type>

在页面中创建或导入类型后，使用下载操作导出即可。也可以用 `@Meta` 装饰器在代码中声明类型，再通过同一套 API 注册。

## 4. 渲染语义类型

把 `src/App.vue` 的内容替换为：

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

`schema-view` 是 `schema-node-vue-view` 提供的通用组件。它根据指定的类型或已有节点解析出视图组件并渲染语义数据。这里 `type="activity.address"` 指定语义类型，`SchemaNodeFormType.ExpandAll` 把嵌套结构体展平成表单项，`v-model` 保持节点值与界面同步。

保存后运行 `npm run dev` 即可查看效果。

## 5. 后续步骤

- 如果需要改变某个类型的渲染方式，可以注册自定义视图组件，或整体替换视图库：见[视图与自定义视图组件](./02-views.md)。
- 如果需要读写 App 数据、工作流或权限，使用 `schema-node-app`；该层不在本包范围内。
