# dsh-plugins

DeepSeek Harness (DSH) 客户端 UI 插件集合。

## 插件列表

### dsh-client-ui-money-counter

右下角「金钱持续增加」动效徽章：

- 金币徽章（暗色玻璃质感 + 金色描边，呼吸光晕 + 金币跳动）
- ¥ 金额每 90ms 自动增长（千分位格式）
- 每 0.43s 飘起一个 "+¥xx.xx" 粒子，上浮淡出

纯装饰效果（`pointer-events: none`），不遮挡界面交互。

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
