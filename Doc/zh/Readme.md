# schema-node-core

SchemaNode 的 TypeScript 核心运行时，也就是前端各包共享的语义内核。

SchemaNode 把业务语义视为可以被描述、组合和执行的结构化定义。`schema-node-core` 用 TypeScript 实现这一内核：注册语义定义，把定义解析为运行时类型，把数据封装为 `DataNode`，并执行类型上声明的属性、关联、函数与校验。它对应 C# 参考实现 [SchemaNode.Core](#相关项目)。

[English](../en/Readme.md)

## 边界

`schema-node-core` 只承载语义运行时：

- **范围内**：命名空间、标量 / 枚举 / 结构体 / 数组 / 函数类型、语义注册与解析、`DataNode` 的值与属性管理、关联、校验、入口来源与级联选项、核心自身文案的多语言。
- **范围外**：HTTP 访问、应用定义与应用数据、工作流、超出已声明属性的权限处理，以及任何 UI 组件。这些属于更上层的包。

本项目不依赖 Vue、不依赖任何 UI 库，也不依赖应用层。这里创建的节点可以被任何遵循 `DataNode` 契约的视图库渲染。

## 分层

视图按依赖关系拆分，而不是按控件类型拆分：

| 包 | 依赖 | 职责 |
| --- | --- | --- |
| `schema-node-core` | — | 语义内核：类型、节点、属性、关联、函数、校验 |
| `schema-node-vue-view` | 仅 core | 通用视图：输入、布尔、日期、年份、区间日期、枚举多选、结构体、数组、表格、本地化字符串，以及 `SchemaView` 解析器；同时暴露根节点加载的扩展点 |
| `schema-node-app-view` | core、`schema-node-vue-view`、app | App 级视图：分页表格、表格过滤，以及 App 根节点懒加载的注册 |
| `schema-node-app` | core | App 方言：应用定义、应用字段、应用数据与工作流 |
| `schema-node-man` | 以上全部 | 消费这些库的管理端应用 |

只有 `schema-node-core` 是使用语义运行时的必需项。视图相关包是可选的，也可以整体替换。表中使用发布名；`schema-node-vue-view` 的源码目录为 `schema-node-vueview`。

## 安装

```bash
npm install schema-node-core
```

## 快速开始

```ts
import { initSchemaRuntime, saveNodeSchema, getNodeType } from 'schema-node-core'
import schema from './type.json'

initSchemaRuntime()      // 准备命名空间树与内置类型
saveNodeSchema(schema)   // 注册 JSON 定义中的语义类型

const type = await getNodeType('activity.address')
const node = type?.create()

node.name          // 节点名称
node.value         // 当前值
node.isValid       // 校验状态
node.subscribe((owner, value) => console.log(value)) // 返回值即取消订阅函数
```

语义类型与具体执行层无关。同一份定义可以被本运行时、C# 实现，或任何理解该语义模型的执行层使用。

包含 Vue 3、Element Plus 与 `SchemaView` 的完整前端接入步骤，见[前端接入](./useit/01-integration.md)。

## 定制视图

视图注册在运行时之外，不会进入内核：

- 为某个节点种类注册默认视图，或为具体语义类型注册专用视图，并可按皮肤区分；
- 在 `DataNode` 上订阅 `value`、单个属性以及校验状态；
- 把 `Readonly` 与 `Disable` 视为可继承的约束，通过祖先订阅；
- `EntrySourceVersion` 变化时重建级联选项；
- 标签与校验交给表单封装视图，叶子视图只专注于渲染值。

`schema-node-vue-view` 是通用视图层的参考实现：它的 `SchemaView` 组件按类型或节点解析组件，内置视图覆盖了上述全部订阅模式。`schema-node-app-view` 是 App 级视图（分页表格、表格过滤等）的参考。

`DataNode` 接口、属性订阅模型、注册 API 与 `SchemaView` 组件见[视图与自定义视图组件](./useit/02-views.md)。

## 文档

- [前端接入](./useit/01-integration.md) — 创建项目、初始化运行时、渲染语义类型。
- [视图与自定义视图组件](./useit/02-views.md) — 节点契约、自定义视图、注册方式与分层。

## 相关项目

- [schema-node-csharp](https://github.com/kurapica/schema-node-csharp) — C# 参考实现、架构文档与语义模型。
- [schema-node-vue-view](https://github.com/kurapica/schema-node-vue-view) — 通用 Vue 3 视图库。
- [schema-node-app-view](https://github.com/kurapica/schema-node-app-view) — App 级 Vue 3 视图。
- [schema-node-man](https://github.com/kurapica/schema-node-man) — 基于这些包构建的管理端应用。

## 开发

```bash
npm run build      # 构建发布产物
npm run typecheck  # 仅类型检查，不产出文件
```

## 交流

可以在 Discord 上加入社区：[5xZuk7kMpz](https://discord.gg/5xZuk7kMpz)。

也可以加入 QQ 群：[1043828069](https://qm.qq.com/cgi-bin/qm/qr?k=q7Fr8seFSdRzgAD-j5d3OZDKIWNNES3U)
