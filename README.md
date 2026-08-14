# dsh-plugins

DeepSeek Harness (DSH) 客户端 UI 插件集合。

## 插件列表

### dsh-client-ui-money-counter

右下角「持续入账」动效卡片：

- 轮播全球知名人物（马斯克、特朗普、贝索斯、盖茨、巴菲特、扎克伯格、黄仁勋、马云），每 8 秒自动切换，点击卡片也可手动切换
- 显示人物头像（维基百科官方肖像缩略图）与双语姓名
- **金钱+ 飘字效果**：卡片上方持续飘起 "+$X" 金色粒子，粒子平均金额即该人物每秒收入 —— 每秒收入直接体现在 +金额 中
- **总金额永久累积**：不因切换人物、刷新页面或重启而清零（localStorage 持久化，离线期间的差额按上次人物的速率补算）
- **系统语言识别**：检测浏览器/系统语言，中文（`zh*`）显示中文，其他语言显示英文
- 头像加载失败时自动回退为姓名首字母

> 每秒收入为基于公开净资产数据的粗略估算，仅供娱乐。

纯装饰效果，不遮挡界面交互。

## 安装

把 `packages/dsh-client-ui-money-counter` 复制到任意 DSH web profile 的
`packages/` 目录，在 profile 的 `package.json` 中加入依赖：

```json
{
  "dependencies": {
    "dsh-client-ui-money-counter": "file:./packages/dsh-client-ui-money-counter"
  }
}
```

然后在 profile 的 `cordis.patch.yml` 注册插件行：

```yaml
- insert:
    - id: ui-money-counter
      name: 'dsh-client-ui-money-counter'
```

最后在 profile 目录运行 `pnpm install` 并重启 `dsh web`。

## 开发

浏览器端 bundle 采用 DSH web 应用标准的
`window.__ModuleLoader__.load({ id, factory })` 格式（见
`lib/client.js`），由 `client-modules` 服务在
`/plugins/<id>/client.js` 提供。

人物数据（`PEOPLE`）位于 `lib/client.js`：`name`（zh/en 双语）、
`perSec`（每秒收入估算）、`avatar`（维基百科头像 URL）。新增人物只需
在数组中加一项。
