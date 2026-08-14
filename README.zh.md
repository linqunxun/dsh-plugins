# dsh-plugins

[English](./README.md) · 简体中文

DeepSeek Harness (DSH) 客户端 UI 插件集合。

## 插件列表

### dsh-client-ui-money-go-brrr

Money go brrr — 右下角「持续入账」动效卡片：轮播全球知名人物（科技创始人、明星运动员、甚至净资产缩水的亏损人物），按每人每秒收入实时累计总金额，金钱+ 飘字展示入账（金色）与亏损（红色），总金额永久累积不因刷新或重启清零，并跟随系统语言。

> 每秒收入为基于公开数据的粗略估算，仅供娱乐。

## 安装

把 `packages/dsh-client-ui-money-go-brrr` 复制到任意 DSH web profile 的
`packages/` 目录，在 profile 的 `package.json` 中加入依赖：

```json
{
  "dependencies": {
    "dsh-client-ui-money-go-brrr": "file:./packages/dsh-client-ui-money-go-brrr"
  }
}
```

然后在 profile 的 `cordis.patch.yml` 注册插件行：

```yaml
- insert:
    - id: ui-money-go-brrr
      name: 'dsh-client-ui-money-go-brrr'
```

最后在 profile 目录运行 `pnpm install` 并重启 `dsh web`。

## 开发

浏览器端 bundle 采用 DSH web 应用标准的
`window.__ModuleLoader__.load({ id, factory })` 格式（见
`lib/client.js`），由 `client-modules` 服务在
`/plugins/<id>/client.js` 提供。
