# 视图与自定义视图组件

`schema-node-vue-view`（源码目录 `schema-node-vueview`）是 Vue 3 + Element Plus 的视图库。它是为实现 `schema-node-man` 准备的，也适用于后台管理，或对前端样式要求不高的场景。整个视图库被替换的代价很低：它们只负责呈现，与业务逻辑和数据关联完全无关。

下面基于它说明如何为特定的语义类型注册视图组件，这套契约同样适用于其他视图库。

## 1. 语义数据节点

整个 SchemaNode 系统围绕语义实体、语义类型、语义原型三者设计。

`schema-node-core` 是 SchemaNode 的 TypeScript 核心，提供前端的完整语义运行时：它按照语义类型把数据封装为 `DataNode`。每个节点自行管理自身的值和属性，也依据类型声明的关联完成属性更新和自身校验。例如配置了 `entrySource` 属性的节点，会自行维护级联可选列表，类似枚举值；配置语义类型时的各种下拉选择也是基于这一点实现的。

如果要为特定的语义类型注册视图，首先需要大致了解 `DataNode` 的对外接口。

### 1.1 可用属性

* `name` 可读，节点名称，类似结构体的字段名。
* `access` 可读，节点访问路径，一些特殊的 UI 渲染库需要。
* `value` 可读/可写，节点的当前计算值。
* `rawValue` 可读，节点当前值的原始值。
* `original` 可读，节点的初始值。
* `submitValue` 可读，节点的提交值。
* `changed` 可读，节点是否被修改过。
* `isValid` 可读，节点是否校验通过。

### 1.2 常用方法

* `confirm()`，保存当前值为初始值，重置修改状态。
* `reset()`，重置当前值为初始值。
* `getPropertyValue(property: string | PropertyCtor)`，获取指定属性值。
* `getPropertyValues(property: string | PropertyCtor[])`，获取指定属性值的迭代器。可堆积属性可能存在多个值，例如校验属性；`PropertyCtor` 是属性的类型。
* `subscribe(func: Observer<[IValueAccess, unknown]>, immediate?: boolean): Function`，订阅节点值变化，返回取消订阅函数。
* `subscribeProperty(property: string | PropertyCtor, func: Observer<[IValueAccess, PropertyCtor, unknown, unknown]>, immediate?: boolean): Function`，订阅指定属性值变化，返回取消订阅函数，回调最后两个参数是当前值和旧值。
* `subscribeViolated(func: Observer<[IValueAccess, boolean]>, immediate?: boolean): Function`，订阅节点校验状态变化，返回取消订阅函数。

### 1.3 常用属性

创建自定义视图，核心是订阅节点的值、属性和校验状态变化。校验状态在对 `el-form` 的封装视图中已经处理，所以叶子视图只需订阅值和属性变化。

下面是一些常用属性类型（可以直接从 `schema-node-core` 引用），更多可以基于类型配置的属性判定：

* `Default` - 默认值。
* `Require` - 必填。
* `Readonly` - 只读。
* `Disable` - 禁用。
* `AsSuggest` - 级联数据仅作为建议，而非强制。
* `LeafOnly` - 级联只能选择叶子节点。
* `EntrySourceVersion` - 级联数据版本。`EntrySource` 及相关属性变化后，原本的级联数据可能失效，所以需要订阅它。

## 2. 自定义视图组件

详细的定制方式，可以参考 `schema-node-vue-view` 项目中各个视图的处理。因为脱离了业务，里面只是订阅数据和属性的变更来驱动渲染。AI 足以将这个视图库完整翻译为基于其他库的实现，所以下面仅针对属性细节做说明。

### 2.1 属性订阅

如果不是做通用视图，只针对特定语义类型处理，那么配置时已经清楚有哪些属性可以订阅。对于通用视图，则可以忽略校验相关属性，专注于渲染相关属性。

参考 `inputView` 的处理逻辑：

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

大部分更新通过 `node.subscribeProperty` 订阅节点自身的属性变化；只有 `Readonly` 和 `Disable` 需要订阅祖先属性，因为它们会从外层节点继承。

`subscribeAncestorProperty` 由 `schema-node-vue-view` 导出，可以直接复制使用。

`EntrySourceVersion` 的处理相对复杂，可以参考 `schema-node-vue-view` 中 `inputView` 的 `rebuildOptions` 方法。它只是从节点获取级联数据，并不关心级联数据如何获取和维护。

所有订阅都会返回取消订阅函数。组件卸载时需要统一调用，否则重新渲染后节点仍会向已失效的组件推送变化。

### 2.2 注册视图组件

`schema-node-vueview/src/index.ts` 注册了默认视图组件。注册分为两层。

**按节点种类注册。** `regBaseSchemaKindView(kind, view, resolve?)` 设置某个种类的默认视图。可选的第三个参数为特定节点形态挑选更具体的视图，例如：

* 枚举的 `type` 为 `EnumValueType.Flags` 时使用 `flagsEnumView`；
* `EnumArrayNode` 使用 `inputView`；
* 元素类型为结构体的数组使用 `tableView`，除非该结构体被配置为单值渲染。

上述注册来自通用视图库。App 级视图（分页表格、表格过滤）由 `schema-node-app-view` 在拥有它们的层注册，因此通用视图库不会引入 App 代码。

**按语义类型注册。** `regSchemaTypeView(type, view, skin = 'default', asSingle = false)` 为具体类型名注册视图：

```ts
regSchemaTypeView(NS_SYSTEM_RANGE_FULL_DATE, rangeDateView);
```

第四个参数 `asSingle` 表示该类型可以按单值展示，`NS_SYSTEM_LOCALE_STRING` 就使用了它。第三个参数是皮肤（skin）：`regSchemaTypeView(type, view, 'compact')` 为同一类型再注册一套 `compact` 皮肤，指定的皮肤没有对应组件时回退到 `default`；标量类型还会沿基类型继续查找。

### 2.3 容器视图与叶子视图

视图构成一条链，而不是彼此独立的集合。容器视图（结构体、数组、表格）持有子节点，并把每个子节点再次交给 `SchemaView` 渲染，因此嵌套类型在每一层都遵循同一套解析规则。表单项封装视图负责标签、必填规则、错误信息与 `subscribeViolated` 订阅；叶子视图只负责渲染值控件。叶子视图不应自行创建子节点或绘制校验提示，否则错误会重复出现，或与 `el-form` 的判断不一致。

## 3. SchemaView 组件

`SchemaView` 是 `schema-node-vue-view` 提供的主要组件。它的功能很简单：基于指定的语义类型或已有节点，自动选择合适的视图组件来渲染。它会将非自身的属性透传给最终视图组件，例如 `el-table` 自身属性。

| Prop | 说明 |
| --- | --- |
| `node` | 已有的 `DataNode`；提供后不再新建节点 |
| `type` | 类型名；没有 `node` 时按它创建节点 |
| `modelValue` | 与 `v-model` 配合的节点值 |
| `value` | 只读显示时使用的值，不建立双向绑定 |
| `props` | 新建节点时要设置的属性集合 |
| `skin` | 视图皮肤，默认 `default`，用于同一类型的多套视图 |
| `inForm` | 表单展示方式：`'expand'`、`'expand2'`、`'expand3'`、`'expandall'`、`'nest'` 或空 |
| `text` | 只读文本对齐方式：`left`、`right`、`center` |
| `readonly` | 只读模式 |
| `rootDiv` | App 字段懒加载时的滚动容器 |
| `instantValid` | 输入时立即校验 |
| `debug` | 显示类型、属性与关联等调试信息 |

两种典型用法：

```vue
<!-- 自己持有节点 -->
<schema-view :node="fieldNode" :readonly="true" text="left" />

<!-- 按类型创建节点，并用 v-model 取值 -->
<schema-view
  v-model="data"
  type="activity.address"
  :in-form="SchemaNodeFormType.ExpandAll"
  text="left"
/>
```

`inForm` 传 `true` 时，组件会自动选择：能按单值展示的类型用 `Nest`，否则用 `Expand`。这控制嵌套结构的展开方式，需要展平时可以显式配置。

组件会把默认插槽透传给实际视图，因此可以包装任意字段的输入区域。

## 4. 视图层的分层位置

视图包按依赖关系拆分，而不是按控件类型拆分：

| 层 | 依赖 | 内容 |
| --- | --- | --- |
| `schema-node-core` | — | 语义运行时：类型、节点、属性、关联、函数 |
| `schema-node-vue-view` | 仅 core | 通用视图：输入、布尔、日期、年份、区间日期、枚举多选、结构体、数组、表格、本地化字符串，以及 `SchemaView` 解析器 |
| `schema-node-app-view` | core、`schema-node-vue-view`、app | App 级视图：分页表格、表格过滤、App 根节点懒加载的注册 |
| `schema-node-app` | core | App 方言：应用定义、应用字段、应用数据与工作流 |
| `schema-node-man` | 以上全部 | 消费这些库的管理端应用 |

这个拆分让通用视图不携带 App 语义。`schema-node-vue-view` 暴露根节点加载的扩展点 `regRootNodeLoader(loader)`，并提供 `getRootNodeLoader()` 供消费方读取；加载器提供 `match`、`isLoaded`、`load` 与 `subscribe`，`SchemaView` 借此驱动它不拥有的节点的加载状态。`schema-node-app-view` 在其中注册 App 专用的实现：匹配父节点为 `AppNode` 的字段，读取 `Loaded` 属性，并通过 App 重新加载。只需要通用视图的项目不会注册加载器，也就不会引入 App 数据代码。

定制时的参考对象：

* 通用渲染（叶子控件、结构体布局、普通表格）参考 `schema-node-vue-view`；
* App 级渲染（分页表格、表格过滤、根节点懒加载）参考 `schema-node-app-view`；
* core 不承载视图逻辑；视图按节点形态或类型名自行注册，core 只提供节点契约。
