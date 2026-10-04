/* Blanks — les nouvelles fonctions du service worker (4.31).
   Charge par background.js via importScripts : il partage la portee globale du
   worker (S, quoteOf, mintFor, notify, save, broadcast, api, mergeMint...).
   Lisible expres : c'est le seul fichier du worker qui n'est pas minifie.

   - Regles de risque : perte max du jour, trades max du jour, pause apres N pertes.
   - Note d'entree : chaque premier achat recoit une note (A..F) et ses raisons.
   - Portefeuilles papier : plusieurs wallets, chacun ses positions et son historique.
   - Alertes de prix : sur la market cap, meme onglet ferme (chrome.alarms).
   - Bulles du top : les trades des 10 meilleurs du classement sur ton graphique.
   - Defis : calcules sur l'historique, debloques une fois pour toutes. */

const BX = (self.BX = { cmds: {} });

/* ------------------------------------------------------------------ outils */

const BX_DAY = 864e5;
function bxDayStart(ts) {
  const d = new Date(ts || Date.now());
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
function bxId() {
  return self.crypto && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : String(Date.now() % 1e8) + Math.floor(Math.random() * 99);
}
function bxMoney(v) {
  return v >= 1e9 ? "$" + (v / 1e9).toFixed(2) + "B" : v >= 1e6 ? "$" + (v / 1e6).toFixed(2) + "M" : v >= 1e3 ? "$" + (v / 1e3).toFixed(1) + "K" : "$" + Math.round(v);
}
function bxSolTrades() {
  return (S.trades || []).filter((t) => (t.asset || "SOL") === "SOL");
}

/* ------------------------------------------------------- regles de risque */

const RISK_DEF = { on: false, maxLoss: 1, maxTrades: 20, lossStreak: 3, pauseMin: 30 };

function riskCfg() {
  return Object.assign({}, RISK_DEF, (S && S.settings && S.settings.risk) || {});
}

function riskStatus() {
  const c = riskCfg(),
    t0 = bxDayStart(),
    now = Date.now();
  const today = bxSolTrades().filter((t) => t.closedAt >= t0);
  const pnl = today.reduce((a, t) => a + (+t.pnlSol || 0), 0);
  const opened =
    (S.trades || []).filter((t) => t.openedAt >= t0).length +
    Object.values(S.positions || {}).filter((p) => p.tokens > 0 && p.openedAt >= t0).length;
  let streak = 0;
  for (const t of S.trades || []) {
    if (t.pnlSol < 0) streak++;
    else break;
  }
  const last = (S.trades || [])[0];
  let pauseUntil = 0;
  if (c.lossStreak > 0 && streak >= c.lossStreak && last && c.pauseMin > 0) {
    const until = last.closedAt + c.pauseMin * 6e4;
    if (until > now) pauseUntil = until;
  }
  return {
    cfg: c,
    pnl,
    opened,
    streak,
    pauseUntil,
    lossHit: c.maxLoss > 0 && pnl <= -c.maxLoss,
    tradesHit: c.maxTrades > 0 && opened >= c.maxTrades,
  };
}

function hhmm(ts) {
  const d = new Date(ts);
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}

/* Renvoie la raison du refus (en anglais, comme toute l'interface), ou null. */
BX.blockBuy = function (msg) {
  if (!S) return null;
  const st = riskStatus();
  if (!st.cfg.on) return null;
  if (st.lossHit) return "risk rule: daily loss limit reached (" + st.pnl.toFixed(2) + " SOL today) — back tomorrow";
  if (st.pauseUntil) return "risk rule: " + st.streak + " losses in a row — pause until " + hhmm(st.pauseUntil);
  if (st.tradesHit) {
    const pair = msg && msg.pair;
    const adding = pair && Object.values(S.positions || {}).some((p) => p.tokens > 0 && (p.pair === pair || p.mint === mintFor(pair)));
    if (!adding) return "risk rule: " + st.opened + " trades today, your limit is " + st.cfg.maxTrades;
  }
  return null;
};
BX.riskStatus = riskStatus;

/* ------------------------------------------------- memoire courte des prix */

/* Les 15 dernieres minutes de prix des paires regardees, un point toutes les 5 s :
   de quoi dire si un achat court apres une bougie ou achete un creux, meme quand
   DexScreener ne donne pas de variation. */
const pmem = new Map();
let pmemTs = 0;
function recPrices() {
  const now = Date.now();
  if (now - pmemTs < 5e3) return;
  pmemTs = now;
  for (const p of watchedPairs()) {
    let q = null;
    try {
      q = quoteOf(p);
    } catch (e) {}
    const px = q ? parseFloat(q.priceUsd) : 0;
    if (!(px > 0)) continue;
    const a = pmem.get(p) || [];
    a.push([now, px]);
    while (a.length && now - a[0][0] > 9e5) a.shift();
    pmem.set(p, a);
  }
  for (const k of [...pmem.keys()]) {
    const a = pmem.get(k);
    if (!a.length || now - a[a.length - 1][0] > 9e5) pmem.delete(k);
  }
}

/* ---------------------------------------------------------- note d'entree */

function entryScore(pos, q, r) {
  const now = Date.now(),
    px = parseFloat(q.priceUsd) || 0,
    notes = [],
    good = [];
  let s = 78;
  const mem = (pmem.get(pos.pair) || []).filter((x) => now - x[0] <= 3e5);
  const dx = quotes.get(pos.pair) ? quotes.get(pos.pair).pair : null;
  let ch5 = dx && dx.priceChange && isFinite(+dx.priceChange.m5) ? +dx.priceChange.m5 : null;
  if (ch5 === null && mem.length >= 3 && now - mem[0][0] > 6e4 && mem[0][1] > 0) ch5 = (px / mem[0][1] - 1) * 100;
  const hi = mem.length ? Math.max.apply(null, mem.map((x) => x[1])) : 0,
    lo = mem.length ? Math.min.apply(null, mem.map((x) => x[1])) : 0,
    fromHi = hi > 0 && px > 0 ? (px / hi - 1) * 100 : 0;

  if (ch5 !== null) {
    if (ch5 > 60) (s -= 26), notes.push("chased a +" + ch5.toFixed(0) + "% pump in 5 min (FOMO)");
    else if (ch5 > 25) (s -= 13), notes.push("bought after a +" + ch5.toFixed(0) + "% run in 5 min");
    else if (ch5 < -40) (s -= 10), notes.push("caught a falling knife (" + ch5.toFixed(0) + "% in 5 min)");
  }
  if (fromHi < -12 && fromHi > -45 && !(ch5 !== null && ch5 < -40)) (s += 8), good.push("bought a " + (-fromHi).toFixed(0) + "% dip from the 5-min high");
  else if (mem.length >= 4 && hi > lo * 1.15 && fromHi > -2) (s -= 8), notes.push("bought the top of the move");

  const imp = +r.impactPct || 0;
  if (imp > 8) (s -= 18), notes.push("price impact " + imp.toFixed(1) + "% — too big for this pool");
  else if (imp > 3) (s -= 8), notes.push("price impact " + imp.toFixed(1) + "%");
  else good.push("low impact (" + imp.toFixed(1) + "%)");

  const asset = pos.asset || "SOL",
    balBefore = (asset === "SOL" ? S.balanceSol : (S.balances && S.balances[asset]) || 0) + (+r.solTotal || 0),
    share = balBefore > 0 ? (+r.solTotal || 0) / balBefore : 0;
  if (share > 0.4) (s -= 16), notes.push(Math.round(share * 100) + "% of your balance on one coin");
  else if (share > 0.2) (s -= 7), notes.push(Math.round(share * 100) + "% of your balance on one coin");
  else good.push("sane size (" + Math.max(1, Math.round(share * 100)) + "% of balance)");

  const last = (S.trades || [])[0];
  if (last && last.pnlSol < 0 && now - last.closedAt < 12e4)
    (s -= 15), notes.push("revenge buy — " + Math.round((now - last.closedAt) / 1e3) + "s after a loss");

  const liq = q.liquidity && +q.liquidity.usd;
  if (liq > 0 && liq < 5e3) (s -= 8), notes.push("thin liquidity (" + bxMoney(liq) + ")");
  const age = dx && dx.pairCreatedAt ? now - dx.pairCreatedAt : null;
  if (age !== null && age < 18e4) (s -= 5), notes.push("token under 3 minutes old");

  s = Math.max(0, Math.min(100, Math.round(s)));
  const grade = s >= 85 ? "A" : s >= 70 ? "B" : s >= 55 ? "C" : s >= 40 ? "D" : "F";
  return { score: s, grade, notes, good, fomo: ch5 !== null && ch5 > 25, revenge: notes.some((n) => n.startsWith("revenge")), ts: now };
}

BX.afterBuy = function (pos, q, r, tag) {
  try {
    if (!pos || pos.entry || !q || !r) return;
    pos.entry = entryScore(pos, q, r);
  } catch (e) {}
};

BX.onClose = function (trade, pos) {
  try {
    if (trade && pos) {
      if (pos.entry) trade.entry = { score: pos.entry.score, grade: pos.entry.grade, fomo: !!pos.entry.fomo, revenge: !!pos.entry.revenge };
      trade.peakTokens = pos.peakTokens || 0;
    }
    BX.mute || computeChal(false);
  } catch (e) {}
};

/* ------------------------------------------------------- portefeuilles */

/* Le wallet affiche vit a plat dans S (rien ne change pour le reste du code) ; les
   autres sont gardes en memoire (WD) et dans leur propre cle de stockage, pour ne pas
   alourdir l'etat que le worker envoie au panneau toutes les 600 ms. S.wallets ne
   garde que les noms et un resume. S.walletSel : les autres wallets qui tradent en
   meme temps que celui affiche (multi-wallet, comme sur Terminal). */
const WKEY = "papr.wallets";
const WF = ["balanceSol", "balances", "positions", "orders", "trades", "fills", "tokenStats"];
let WD = null,
  wdLoading = null,
  wdT = null;

function wLoad() {
  if (WD) return Promise.resolve(WD);
  return (
    wdLoading ||
    (wdLoading = new Promise((res) =>
      chrome.storage.local.get(WKEY, (o) => {
        WD = (o && o[WKEY]) || {};
        res(WD);
      }),
    ))
  );
}
async function wGet() {
  return wLoad();
}
function wPersist() {
  clearTimeout(wdT);
  wdT = null;
  return new Promise((res) => chrome.storage.local.set({ [WKEY]: WD || {} }, () => res()));
}
function wDirty() {
  clearTimeout(wdT);
  wdT = setTimeout(wPersist, 400);
}
async function wSet(v) {
  WD = v;
  await wPersist();
}
function wInit() {
  if (!S.wallets || typeof S.wallets !== "object" || !Object.keys(S.wallets).length) {
    S.wallets = { main: { name: "Main", created: Date.now() } };
    S.walletId = "main";
  }
  if (!S.wallets[S.walletId]) S.walletId = Object.keys(S.wallets)[0];
  S.wallets[S.walletId].sum = wSum(S);
  wSelClean();
}
function wSelClean() {
  const sel = Array.isArray(S.walletSel) ? S.walletSel : [];
  S.walletSel = [...new Set(sel)].filter((id) => id !== S.walletId && S.wallets && S.wallets[id] && (!WD || WD[id]));
}
function wSum(d) {
  const tr = (d.trades || []).filter((t) => (t.asset || "SOL") === "SOL");
  return {
    bal: +d.balanceSol || 0,
    n: tr.length,
    pnl: tr.reduce((a, t) => a + (+t.pnlSol || 0), 0),
    wins: tr.filter((t) => t.pnlSol > 0).length,
    open: Object.values(d.positions || {}).filter((p) => p.tokens > 0).length,
  };
}
function wGrab() {
  const d = {};
  for (const k of WF) d[k] = S[k];
  return JSON.parse(JSON.stringify(d));
}
function wFresh(bal) {
  return {
    balanceSol: bal > 0 ? bal : S.settings.startBalanceSol || 10,
    balances: { ETH: S.settings.startBalanceEth || E.DEFAULTS.startBalanceEth, BNB: S.settings.startBalanceBnb || E.DEFAULTS.startBalanceBnb },
    positions: {},
    orders: [],
    trades: [],
    fills: {},
    tokenStats: {},
  };
}
function wApply(d) {
  const f = wFresh();
  for (const k of WF) S[k] = d && d[k] !== undefined ? d[k] : f[k];
}

/* Execute fn() sur un autre wallet : ses champs remplacent un instant ceux du wallet
   affiche, puis tout revient. Synchrone, donc rien d'autre ne passe entre les deux.
   Les fills de ces wallets ne sont pas publies sur le classement (BX.mute). */
function withWallet(id, fn, quiet) {
  const d = WD && WD[id];
  if (!d || id === S.walletId) return null;
  const keep = {};
  for (const k of WF) keep[k] = S[k];
  wApply(d);
  BX.mute = true;
  let r = null;
  try {
    r = fn();
  } catch (e) {
    r = { err: e.message };
  } finally {
    const nd = {};
    for (const k of WF) nd[k] = S[k];
    WD[id] = nd;
    for (const k of WF) S[k] = keep[k];
    BX.mute = false;
  }
  if (quiet && !r) return r;
  S.wallets[id] && (S.wallets[id].sum = wSum(WD[id]));
  wDirty();
  return r;
}

BX.mirror = function (kind, e) {
  if (!S || !WD) return;
  wSelClean();
  const ids = S.walletSel.slice();
  if (!ids.length) return;
  const ok = [],
    bad = [];
  for (const id of ids) {
    const name = (S.wallets[id] && S.wallets[id].name) || "wallet";
    const r = withWallet(id, () => {
      if (kind === "buy") {
        const o = execBuy(e.pair, e.amountSol, e.tag || "manuel");
        !o.err && e.exits && placeExits(e.pair, e.exits);
        return o;
      }
      const q = quoteOf(e.pair),
        m = q && q.baseToken ? q.baseToken.address : mintFor(e.pair);
      if (!(S.positions[m] && S.positions[m].tokens > 0)) return { skip: 1 };
      if (kind === "sell") return execSell(e.pair, e.fraction, "manuel");
      if (kind === "exits") return placeExits(e.pair, e.exits) ? { ok: 1 } : { skip: 1 };
      return { skip: 1 };
    });
    if (!r || r.skip) continue;
    r.err ? bad.push(name + ": " + r.err) : ok.push(name + (kind === "sell" && typeof r.realized === "number" ? " " + (r.realized >= 0 ? "+" : "") + r.realized.toFixed(3) : ""));
  }
  if (kind === "buy" && ok.length) notify("also bought in " + ok.join(", "), "good");
  if (kind === "sell" && ok.length) notify("also sold in " + ok.join(", "), "good");
  if (kind === "exits" && ok.length) notify("exit orders also placed in " + ok.join(", "), "good");
  bad.length && notify(bad.join(" · "), "bad");
};

/* Les ordres (TP / SL / limit) des wallets qui ne sont pas affiches se declenchent
   aussi : meme regle que checkOrders (deux ticks de suite au-dela du niveau). */
function checkWalletOrders() {
  if (!WD) return;
  for (const id in WD) {
    const d = WD[id];
    if (id === S.walletId || !d || !Array.isArray(d.orders) || !d.orders.length || !S.wallets[id]) continue;
    const done = [];
    let removed = 0;
    withWallet(id, () => {
      for (const o of S.orders.slice()) {
        let q = null;
        try {
          q = quoteOf(o.pair);
        } catch (e) {}
        if (!q) continue;
        const p = parseFloat(q.priceUsd),
          lv = triggerPrice(o, q);
        if ((o.kind === "tp" || o.kind === "sl") && !(S.positions[o.mint] && S.positions[o.mint].tokens > 0)) {
          S.orders = S.orders.filter((x) => x !== o);
          removed++;
          continue;
        }
        if (!(p > 0 && lv > 0)) continue;
        const hit = (o.kind === "tp" && p >= lv) || (o.kind === "sl" && p <= lv) || (o.kind === "limit" && p <= lv);
        if (!hit) {
          o.hits = 0;
          continue;
        }
        o.hits = (o.hits || 0) + 1;
        if (o.hits < 2) continue;
        S.orders = S.orders.filter((x) => x !== o);
        const tag = o.kind === "tp" ? "TP" : o.kind === "sl" ? "SL" : "Limit";
        const r = o.kind === "limit" ? execBuy(o.pair, o.amountSol, tag) : execSell(o.pair, (o.sizePct || 100) / 100, tag);
        !r.err && o.kind === "limit" && o.exits && placeExits(o.pair, o.exits);
        done.push({ tag, sym: o.symbol || "", r });
      }
      return done.length + removed;
    }, true);
    const name = S.wallets[id].name;
    for (const x of done)
      x.r.err
        ? notify(name + " · " + x.tag + " " + x.sym + " failed: " + x.r.err, "bad")
        : notify(
            name + " · " + x.tag + " " + (x.tag === "Limit" ? "filled" : "triggered") + " · " + x.sym + (typeof x.r.realized === "number" ? " · " + (x.r.realized >= 0 ? "+" : "") + x.r.realized.toFixed(4) : ""),
            x.r.err ? "bad" : x.r.realized < 0 ? "bad" : "good",
          );
    done.length && (save(), broadcast());
  }
}

BX.cmds.walletNew = async function (e) {
  wInit();
  if (Object.keys(S.wallets).length >= 12) throw new Error("12 wallets max");
  const name = String(e.name || "").trim().slice(0, 24) || "Wallet " + (Object.keys(S.wallets).length + 1);
  const bal = +e.balance > 0 ? Math.min(1e6, +e.balance) : 0;
  const all = await wGet();
  all[S.walletId] = wGrab();
  S.wallets[S.walletId].sum = wSum(S);
  const id = bxId();
  S.wallets[id] = { name, created: Date.now() };
  wApply(wFresh(bal));
  S.walletId = id;
  S.walletSel = [];
  S.wallets[id].sum = wSum(S);
  await wSet(all);
  notify("new wallet · " + name + " · " + S.balanceSol + " SOL", "good");
};

/* Afficher un wallet (clic sur sa ligne) : il devient le seul a trader, comme un
   clic simple sur Terminal. keepSel garde la selection multiple. */
BX.cmds.walletSwitch = async function (e) {
  wInit();
  const id = e.id;
  if (!id || id === S.walletId || !S.wallets[id]) return;
  const all = await wGet();
  const old = S.walletId;
  all[old] = wGrab();
  S.wallets[old].sum = wSum(S);
  wApply(all[id]);
  delete all[id];
  S.walletId = id;
  S.wallets[id].sum = wSum(S);
  if (e.keepSel) S.walletSel = (S.walletSel || []).concat(old);
  else S.walletSel = [];
  wSelClean();
  await wSet(all);
  notify("wallet · " + S.wallets[id].name, "good");
};

/* La selection multiple : les wallets qui achetent et vendent avec celui affiche. */
BX.cmds.walletSel = async function (e) {
  wInit();
  await wLoad();
  S.walletSel = Array.isArray(e.ids) ? e.ids.map(String) : [];
  wSelClean();
};

BX.cmds.walletRename = async function (e) {
  wInit();
  const w = S.wallets[e.id];
  const name = String(e.name || "").trim().slice(0, 24);
  if (w && name) w.name = name;
};

BX.cmds.walletDelete = async function (e) {
  wInit();
  const id = e.id;
  if (!S.wallets[id]) return;
  if (id === S.walletId) throw new Error("switch to another wallet before deleting this one");
  const name = S.wallets[id].name;
  const all = await wGet();
  delete all[id];
  delete S.wallets[id];
  wSelClean();
  await wSet(all);
  notify("wallet deleted · " + name);
};

/* ------------------------------------------------------- alertes de prix */

function alertMc(a) {
  let q = null;
  try {
    q = quoteOf(a.pair);
  } catch (e) {}
  if (!q) return 0;
  const p = parseFloat(q.priceUsd);
  if (a.supply > 0 && p > 0) return p * a.supply;
  const mc = +(q.marketCap || q.fdv) || 0;
  return mc > 0 ? mc : 0;
}

let notifHooked = false;
function hookNotif() {
  if (notifHooked || !chrome.notifications || !chrome.notifications.onClicked) return;
  notifHooked = true;
  chrome.notifications.onClicked.addListener((id) => {
    const m = /^bx-al-(.*)$/.exec(id);
    if (!m) return;
    chrome.storage.local.get("papr.alurl", (o) => {
      const u = o && o["papr.alurl"] && o["papr.alurl"][m[1]];
      if (u && /^https:\/\/(trade\.padre\.gg|axiom\.trade)\//.test(u)) chrome.tabs.create({ url: u });
      chrome.notifications.clear(id);
    });
  });
}

function fireAlert(a, mc) {
  const txt = (a.symbol || "token") + " hit " + bxMoney(mc) + " market cap (" + (a.dir === "up" ? "above " : "below ") + bxMoney(a.mc) + ")";
  notify("alert · " + txt, a.dir === "up" ? "good" : "bad");
  S.alertLog = [{ symbol: a.symbol, mc, target: a.mc, dir: a.dir, ts: Date.now(), pair: a.pair }].concat(S.alertLog || []).slice(0, 12);
  try {
    if (chrome.notifications && chrome.notifications.create) {
      hookNotif();
      if (a.url)
        chrome.storage.local.get("papr.alurl", (o) => {
          const m = Object.assign({}, (o && o["papr.alurl"]) || {});
          m[a.id] = a.url;
          const ks = Object.keys(m);
          if (ks.length > 30) delete m[ks[0]];
          chrome.storage.local.set({ "papr.alurl": m });
        });
      chrome.notifications.create("bx-al-" + a.id, {
        type: "basic",
        iconUrl: chrome.runtime.getURL("icons/icon128.png"),
        title: "Blanks · " + (a.symbol || "alert"),
        message: txt,
        priority: 2,
      });
    }
  } catch (e) {}
}

function checkAlerts() {
  if (!S || !S.alerts || !S.alerts.length) return 0;
  const hit = [];
  for (const a of S.alerts) {
    const mc = alertMc(a);
    if (!(mc > 0)) continue;
    a.last = mc;
    a.lastTs = Date.now();
    if (a.dir === "up" ? mc >= a.mc : mc <= a.mc) hit.push([a, mc]);
  }
  if (!hit.length) return 0;
  const gone = new Set(hit.map((h) => h[0].id));
  S.alerts = S.alerts.filter((a) => !gone.has(a.id));
  for (const [a, mc] of hit) fireAlert(a, mc);
  ensureAlarm();
  save();
  broadcast();
  return hit.length;
}

function ensureAlarm() {
  try {
    if (!chrome.alarms) return;
    if (S && S.alerts && S.alerts.length) {
      chrome.alarms.get("bx-alerts", (al) => {
        al || chrome.alarms.create("bx-alerts", { periodInMinutes: 0.5 });
      });
    } else chrome.alarms.clear("bx-alerts");
  } catch (e) {}
}

BX.cmds.alertAdd = async function (e) {
  const pair = e.pair;
  if (!pair) throw new Error("open a token chart first");
  const target = +e.mc;
  if (!(target > 0)) throw new Error("type a market cap, e.g. 150k or +50%");
  const q = quoteOf(pair);
  if (!q) throw new Error("no price yet for this token — try again in a second");
  const px = parseFloat(q.priceUsd);
  const mcNow = +(q.marketCap || q.fdv) || 0;
  if (!(mcNow > 0 && px > 0)) throw new Error("no market cap yet for this token");
  if ((S.alerts || []).length >= 30) throw new Error("30 alerts max");
  const a = {
    id: bxId(),
    pair,
    mint: q.baseToken.address,
    symbol: q.baseToken.symbol || "?",
    chain: chainOf(pair),
    mc: target,
    dir: target > mcNow ? "up" : "down",
    supply: mcNow / px,
    from: mcNow,
    created: Date.now(),
    url: typeof e.url === "string" ? e.url.slice(0, 300) : "",
  };
  (S.alerts = S.alerts || []).push(a);
  mints.set(pair, a.mint);
  ensureAlarm();
  notify("alert set · " + a.symbol + " " + (a.dir === "up" ? "above " : "below ") + bxMoney(target), "good");
};

BX.cmds.alertDel = async function (e) {
  S.alerts = (S.alerts || []).filter((a) => a.id !== e.id);
  ensureAlarm();
};

/* Onglet ferme : le worker se reveille toutes les 30 s, demande les prix a Jupiter
   (et a DexScreener pour l'EVM) et verifie les alertes. Avec un onglet ouvert, la
   boucle normale de 600 ms s'en charge deja. */
try {
  chrome.alarms &&
    chrome.alarms.onAlarm.addListener(async (al) => {
      if (!al || al.name !== "bx-alerts") return;
      await loadState();
      if (!S.alerts || !S.alerts.length) return ensureAlarm();
      if (ports.size && loopId) return;
      for (const a of S.alerts) {
        a.mint && mints.set(a.pair, a.mint);
        a.chain && chains.set(a.pair, a.chain);
      }
      const sol = S.alerts.filter((a) => !isEvm(a.pair));
      if (sol.length)
        try {
          const ms = [...new Set(sol.map((a) => a.mint).filter(Boolean).concat(SOL_MINT))];
          const r = await fetchJup(ms),
            now = Date.now();
          for (const k in r) r[k] && r[k].usdPrice > 0 && jup.set(k, Object.assign({ ts: now }, r[k]));
          const so = jup.get(SOL_MINT);
          so && so.usdPrice > 0 && setSolUsd(so.usdPrice);
        } catch (e) {}
      for (const a of S.alerts)
        if (isEvm(a.pair))
          try {
            await timeBox(refreshOne(a.pair), 3e3);
          } catch (e) {}
      checkAlerts() || save();
    });
} catch (e) {}

/* --------------------------------------------------------- bulles du top */

let topList = [],
  topTs = 0,
  topDirty = false;
const topMintTs = new Map();

async function topTick() {
  if (!S) return;
  if (!S.settings.topBubbles) {
    if (topDirty) {
      topDirty = false;
      const fol = new Set(follows().map((u) => String(u).toLowerCase()));
      for (const m in S.track.byMint) S.track.byMint[m] = S.track.byMint[m].filter((f) => !f.top || fol.has(String(f.user).toLowerCase()));
      topMintTs.clear();
      save();
      broadcast();
    }
    return;
  }
  if (!ports.size) return;
  const now = Date.now();
  if (now - topTs > 6e5) {
    topTs = now;
    try {
      const r = await api("/leaderboard?period=7d&limit=12", { auth: false });
      const rows = Array.isArray(r) ? r : (r && r.rows) || [];
      const me = account() && account().pseudo ? account().pseudo.toLowerCase() : "";
      topList = rows
        .filter((x) => x && x.pseudo && !x.anon && x.closed > 0 && x.pseudo.toLowerCase() !== me)
        .slice(0, 10)
        .map((x) => ({ u: x.pseudo, rank: x.rank }));
    } catch (e) {
      topTs = now - 5.4e5;
    }
  }
  if (!topList.length) return;
  for (const p of new Set(activePair.values())) {
    if (!p) continue;
    const mint = mintFor(p);
    if (!mint || mint.length < 30) continue;
    if (now - (topMintTs.get(mint) || 0) < 45e3) continue;
    topMintTs.set(mint, now);
    if (topMintTs.size > 60) topMintTs.delete(topMintTs.keys().next().value);
    api("/mint?mint=" + encodeURIComponent(mint) + "&users=" + encodeURIComponent(topList.map((x) => x.u).join(",")), { auth: false })
      .then((rows) => {
        if (!Array.isArray(rows) || !rows.length || !S.settings.topBubbles) return;
        let added = 0;
        for (const f of rows) {
          if (!f || !f.mint) continue;
          const r = topList.find((x) => x.u.toLowerCase() === String(f.user).toLowerCase());
          f.top = r ? r.rank : 1;
          const before = (S.track.byMint[f.mint] || []).length;
          mergeMint(f);
          (S.track.byMint[f.mint] || []).length > before && added++;
        }
        if (added) (topDirty = true), save(), broadcast();
      })
      .catch(() => {});
  }
}
BX.topNow = () => topList.slice();

/* ------------------------------------------------------------------ defis */

function bestRun(trades, ok) {
  let best = 0,
    cur = 0;
  for (let i = trades.length - 1; i >= 0; i--) {
    ok(trades[i]) ? (cur++, cur > best && (best = cur)) : (cur = 0);
  }
  return best;
}
function dayMap(trades) {
  const m = {};
  for (const t of trades) {
    const k = bxDayStart(t.closedAt);
    const d = m[k] || (m[k] = { n: 0, pnl: 0 });
    d.n++;
    d.pnl += +t.pnlSol || 0;
  }
  return m;
}

const CHALLENGES = [
  { id: "first", name: "First blood", desc: "Close your first trade", goal: 1, f: (t) => t.length },
  { id: "double", name: "Doubler", desc: "Close a trade at +100% or more", goal: 1, f: (t) => (t.some((x) => x.pnlPct >= 100) ? 1 : 0) },
  { id: "moon", name: "Moonshot", desc: "Close a trade at +400% or more", goal: 1, f: (t) => (t.some((x) => x.pnlPct >= 400) ? 1 : 0) },
  { id: "hat", name: "Hat-trick", desc: "Win 3 trades in a row", goal: 3, f: (t) => bestRun(t, (x) => x.pnlSol > 0) },
  { id: "fire", name: "On fire", desc: "Win 7 trades in a row", goal: 7, f: (t) => bestRun(t, (x) => x.pnlSol > 0) },
  { id: "cut", name: "Cut it early", desc: "Close 5 losers before they reach −20%", goal: 5, f: (t) => t.filter((x) => x.pnlPct < 0 && x.pnlPct > -20).length },
  { id: "clean", name: "Clean sheet", desc: "10 trades in a row with no loss worse than −25%", goal: 10, f: (t) => bestRun(t, (x) => !(x.pnlPct <= -25)) },
  { id: "patient", name: "Diamond hands", desc: "Win a trade held 30 minutes or more", goal: 1, f: (t) => (t.some((x) => x.pnlSol > 0 && x.closedAt - x.openedAt >= 18e5) ? 1 : 0) },
  { id: "sniper", name: "Sniper", desc: "Win a trade whose entry scored 85 or more", goal: 1, f: (t) => (t.some((x) => x.pnlSol > 0 && x.entry && x.entry.score >= 85) ? 1 : 0) },
  { id: "calm", name: "Ice in the veins", desc: "20 entries in a row with no FOMO and no revenge buy", goal: 20, f: (t) => bestRun(t.filter((x) => x.entry), (x) => !x.entry.fomo && !x.entry.revenge) },
  { id: "green", name: "Green day", desc: "End a day in profit with 5 trades or more", goal: 1, f: (t) => (Object.values(dayMap(t)).some((d) => d.n >= 5 && d.pnl > 0) ? 1 : 0) },
  { id: "week", name: "Green week", desc: "5 days in profit", goal: 5, f: (t) => Object.values(dayMap(t)).filter((d) => d.pnl > 0).length },
  { id: "ten", name: "Ten SOL", desc: "Make +10 SOL in realised profit", goal: 10, f: (t) => Math.max(0, t.reduce((a, x) => a + (+x.pnlSol || 0), 0)) },
  { id: "hundred", name: "Centurion", desc: "Close 100 trades", goal: 100, f: (t) => t.length },
];

function computeChal(silent) {
  if (!S) return;
  const tr = bxSolTrades();
  S.badges = S.badges && typeof S.badges === "object" ? S.badges : {};
  const first = !S.badges._init;
  const out = [];
  for (const c of CHALLENGES) {
    let cur = 0;
    try {
      cur = +c.f(tr) || 0;
    } catch (e) {}
    const done = cur >= c.goal;
    if (done && !S.badges[c.id]) {
      S.badges[c.id] = Date.now();
      if (!silent && !first) notify("challenge unlocked · " + c.name + " — " + c.desc, "good");
    }
    out.push({ id: c.id, name: c.name, desc: c.desc, goal: c.goal, cur: Math.min(cur, c.goal), at: S.badges[c.id] || 0 });
  }
  S.badges._init = S.badges._init || Date.now();
  S.chal = out;
}

/* --------------------------------------------------------------- replays */

BX.cmds.replaySave = async function (e) {
  const r = {
    ts: Date.now(),
    mint: String(e.mint || "").slice(0, 64),
    symbol: String(e.symbol || "?").slice(0, 16),
    pnl: +e.pnl || 0,
    pct: +e.pct || 0,
    trades: +e.trades || 0,
    speed: +e.speed || 1,
    wins: +e.wins || 0,
  };
  S.replays = [r].concat(Array.isArray(S.replays) ? S.replays : []).slice(0, 30);
};

/* ------------------------------------------------------- branchement boucle */

BX.watch = function () {
  if (!S) return [];
  const out = (S.alerts || []).map((a) => {
    a.mint && mints.set(a.pair, a.mint);
    a.chain && chains.set(a.pair, a.chain);
    return a.pair;
  });
  /* les paires des ordres et positions des autres wallets selectionnes ou avec ordres */
  if (WD)
    for (const id in WD) {
      if (id === S.walletId) continue;
      const d = WD[id] || {};
      for (const o of d.orders || []) o.pair && (o.mint && mints.set(o.pair, o.mint), o.chain && chains.set(o.pair, o.chain), out.push(o.pair));
    }
  return out;
};

/* Le panneau ne peut pas lire les permissions : le worker lui dit si les
   notifications de bureau sont accordees (elles s'activent depuis la popup). */
let notifTs = 0;
function notifCheck() {
  if (Date.now() - notifTs < 1e4) return;
  notifTs = Date.now();
  try {
    chrome.permissions.contains({ permissions: ["notifications"] }, (r) => {
      r = !!r;
      if (S && S.notifOk !== r) S.notifOk = r;
      r && hookNotif();
    });
  } catch (e) {}
}

let bxSumTs = 0;
BX.tick = function () {
  if (!S) return;
  if (!S.wallets || !S.wallets[S.walletId]) wInit();
  if (!S.chal) computeChal(true);
  try {
    recPrices();
  } catch (e) {}
  try {
    checkAlerts();
  } catch (e) {}
  try {
    checkWalletOrders();
  } catch (e) {}
  try {
    topTick();
  } catch (e) {}
  notifCheck();
  if (Date.now() - bxSumTs > 5e3 && S.wallets && S.wallets[S.walletId]) {
    bxSumTs = Date.now();
    S.wallets[S.walletId].sum = wSum(S);
  }
};

loadState().then(async () => {
  await wLoad();
  try {
    wInit();
    computeChal(true);
    ensureAlarm();
  } catch (e) {}
});
