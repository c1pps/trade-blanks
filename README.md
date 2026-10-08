# Blanks — paper trading for Terminal & Axiom

> [!IMPORTANT]
> **This repository is for checking the code, not for installing Blanks.** Install it only from the [Chrome Web Store](https://chromewebstore.google.com/detail/mhegkceocponjlnnbinngggdmniigkgo). A copy loaded by hand in developer mode gets no automatic updates, cannot link a Google account, and keeps its data apart from the Store version. If anyone sends you Blanks as a .zip, a .crx or a folder to load, it is not official.

Blanks is a Chrome extension that puts a paper-trading desk on top of [Terminal](https://trade.padre.gg) and [Axiom](https://axiom.trade): real prices, real fees, your fills on the real candles — with fake money.

- Website: https://trade-blanks.com
- Chrome Web Store: https://chromewebstore.google.com/detail/mhegkceocponjlnnbinngggdmniigkgo
- Security page: https://trade-blanks.com/security

This repository publishes the **exact code that runs in your browser**, so anyone can check what Blanks does before installing it. It is source-available for review, not open source — see [LICENSE](LICENSE).

## Blanks cannot touch your wallet

| Blanks never… | How you can check |
|---|---|
| connects to, reads or signs with a wallet (Phantom, MetaMask, Backpack…) | search the code for `signTransaction`, `signMessage`, `window.solana`, `window.phantom`, `ethereum.request` — there are none |
| asks for a seed phrase or a private key | there is no such field anywhere in the extension |
| runs on other websites | `manifest.json` → `content_scripts.matches`: only `trade.padre.gg` and `axiom.trade` |
| sends your data elsewhere | `manifest.json` → `host_permissions`: public price APIs and trade-blanks.com only |
| downloads and runs code | Manifest V3 forbids remote code; everything that runs is in [`extension/`](extension) |
| makes a real trade | the quick-buy click is stopped before their page sees it (`guard.js`) |

Blanks works with **no wallet extension installed at all** — that is the simplest proof: install it in a fresh Chrome profile and everything works.

## What is in this repository

| Folder / file | What it is |
|---|---|
| [`extension/`](extension) | The published files, identical to the Chrome Web Store package |
| [`source/`](source) | Readable source of `content.js`, `background.js` and `chart.js` (the three files that are minified for the Store) |
| [`readable/`](readable) | Formatted copies of every script, for reading only |
| [`releases/`](releases) | The Store zip of each version, with its SHA-256 |
| [`SHA256SUMS.txt`](SHA256SUMS.txt) | The SHA-256 of every published file |
| [`build.sh`](build.sh) | Rebuilds the minified files from `source/` and checks they match `extension/` byte for byte |
| [`VERIFY.md`](VERIFY.md) | How to compare the extension installed in your Chrome with this repository |
| [`SECURITY.md`](SECURITY.md) | Permissions, data, and how to report a vulnerability |

## Current release

**v4.34.2** — `releases/Blanks-store-4.34.2.zip`

```
SHA-256  28a2dfae6123e58d7f08e9b631a35795fc89a579bf6a04083a99ea04f53f4042
```

## Stay safe

The only official places are **trade-blanks.com** and the **Chrome Web Store listing above** (ID `mhegkceocponjlnnbinngggdmniigkgo`). Blanks has no token, no airdrop and no support DMs, and will never ask you to connect a wallet. Anything else using the name is a scam — please report it to jneveu.work@gmail.com.

Blanks is a simulator: no real funds, no transactions, not financial advice. Not affiliated with Terminal, Axiom or pump.fun.
