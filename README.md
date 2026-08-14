# dsh-plugins

[简体中文](./README.zh.md) · English

DeepSeek Harness (DSH) client UI plugins collection.

## Plugins

### dsh-client-ui-money-go-brrr

Money go brrr — a bottom-right "keep printing cash" card: rotates through famous people (tech founders, athletes, even net-worth-losers), accumulates a grand total at each person's real per-second income, shows money+ particles (gold gains / red losses), never resets across refreshes or restarts, and follows your system language.

> Per-second incomes are rough estimates based on public figures, for entertainment only.

## Install

Copy `packages/dsh-client-ui-money-go-brrr` into any DSH web profile's
`packages/` directory, then add the dependency to the profile's
`package.json`:

```json
{
  "dependencies": {
    "dsh-client-ui-money-go-brrr": "file:./packages/dsh-client-ui-money-go-brrr"
  }
}
```

Register the plugin row in the profile's `cordis.patch.yml`:

```yaml
- insert:
    - id: ui-money-go-brrr
      name: 'dsh-client-ui-money-go-brrr'
```

Then run `pnpm install` in the profile directory and restart `dsh web`.

## Development

The browser bundle uses the standard DSH web format
`window.__ModuleLoader__.load({ id, factory })` (see `lib/client.js`),
served by the `client-modules` service at `/plugins/<id>/client.js`.
