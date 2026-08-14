# dsh-plugins

DeepSeek Harness (DSH) 客户端 UI 插件集合。

## 插件列表

### dsh-client-ui-money-counter

右下角「知名人物每秒收入」动效卡片：

- 轮播全球知名人物（马斯克、特朗普、贝索斯、盖茨、巴菲特、扎克伯格、黄仁勋、马云），每 8 秒自动切换，点击卡片也可手动切换
- 显示人物头像（维基百科官方肖像缩略图）、姓名、每秒收入估算
- 金额按该人物每秒收入实时累计（千分位格式）
- **中英文双语**：跟随界面语言自动切换（中文显示中文名 + 「每秒收入」；英文显示英文名 + "per second"）
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
