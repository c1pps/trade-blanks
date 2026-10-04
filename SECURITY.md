# Security

## Permissions

| Permission | Why Blanks needs it |
|---|---|
| `storage` | Keeps your paper wallets, trades and settings in your browser. |
| `alarms` | One check every 30 seconds for the price alerts you set, so they fire even when no Terminal or Axiom tab is open. |
| `identity` | Only if you choose **Link with Google** in the tracker: lets you recover your pseudo on another computer. Blanks stores a hashed Google id, never your name, email or picture. |
| `notifications` *(optional)* | Asked only when you click **Enable desktop alerts**. Shows a notification when one of your price alerts is crossed. |
| Site access: `trade.padre.gg`, `axiom.trade` | Draws the panel, the chart markers and the quick-buy buttons on these two sites. No other site. |
| Hosts: `lite-api.jup.ag`, `api.dexscreener.com` | Token prices and pool liquidity. |
| Hosts: `api.coinbase.com`, `api.binance.com`, `api.kraken.com`, `api.coingecko.com` | The SOL / USD rate only — public price endpoints, no account, no login. |
| Host: `trade-blanks.com` | The optional tracker, leaderboard and update emails. Nothing is sent until you create a pseudo. |

## What Blanks never does

- never connects to, reads or signs with a wallet, and never asks for a seed phrase or a private key;
- never runs on any site other than trade.padre.gg and axiom.trade;
- never downloads or runs remote code (Manifest V3);
- never places a real order: Blanks clicks are stopped before the site's own buy buttons receive them.

## Scripts that run in the page

Two scripts, `chart.js` and `trenches.js`, run in the page's own context ("MAIN world") on the two sites. They need to: `chart.js` draws your paper fills and order lines on the TradingView chart, and `trenches.js` places the quick-buy buttons on the token lists. Neither touches a wallet provider — their readable code is in [`readable/`](readable).

## Data

By default nothing about you leaves your browser except price lookups (a token address). The opt-in tracker, Google link and update emails are described in full at https://trade-blanks.com/privacy.

## Reporting a vulnerability

Email **jneveu.work@gmail.com** with the subject `Blanks security`. Please include the version (shown at the top of the Settings window) and steps to reproduce. 

## Scams

The only official places are https://trade-blanks.com and the Chrome Web Store listing `mhegkceocponjlnnbinngggdmniigkgo`. Blanks has no token, no airdrop and no support DMs.
