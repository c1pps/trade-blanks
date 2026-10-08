/* Blanks — les nouvelles fonctions du panneau (4.31).
   Charge apres content.js dans le meme monde isole ; passe par window.__BLANKS_X,
   que content.js remplit (api) et appelle (hooks). Lisible expres.

   Sections ajoutees a la fenetre des reglages : Today (le bilan du jour),
   Challenges, Risk rules, Paper wallets, Price alerts, Replay ; et une carte
   une section « Chart » (mode fantome, zones d'entree, bulles du top).
   Dans le panneau : chrono de la position, note d'entree, cloche d'alerte.
   Et le mode Replay : rejouer le graphique ouvert, en accelere, avec un wallet
   a part. */
(function () {
  "use strict";
  const X = window.__BLANKS_X;
  if (!X || !X.api) return;
  const A = X.api;

  /* ------------------------------------------------------------ outils */

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const sol = (v, sign) => {
    v = +v || 0;
    const a = Math.abs(v),
      t = a >= 100 ? v.toFixed(1) : a >= 1 ? v.toFixed(2) : v.toFixed(3);
    return (sign && v > 0 ? "+" : "") + t;
  };
  const pct = (v) => ((v = +v || 0), (v > 0 ? "+" : "") + (Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(1)) + "%");
  const money = (v) =>
    v >= 1e9 ? "$" + (v / 1e9).toFixed(2) + "B" : v >= 1e6 ? "$" + (v / 1e6).toFixed(2) + "M" : v >= 1e3 ? "$" + (v / 1e3).toFixed(1) + "K" : "$" + Math.round(v || 0);
  const tone = (v) => (v > 0 ? "up" : v < 0 ? "down" : "");
  const dur = (ms) => {
    const s = Math.max(0, Math.floor(ms / 1e3));
    if (s < 60) return s + "s";
    if (s < 3600) return Math.floor(s / 60) + "m" + String(s % 60).padStart(2, "0");
    if (s < 86400) return Math.floor(s / 3600) + "h" + String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    return Math.floor(s / 86400) + "d" + Math.floor((s % 86400) / 3600) + "h";
  };
  const dayStart = (ts) => {
    const d = new Date(ts || Date.now());
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };
  const hhmm = (ts) => {
    const d = new Date(ts);
    return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  };
  const dateTxt = (ts) => new Date(ts).toLocaleDateString(undefined, { day: "numeric", month: "short" });
  const S = () => A.S;
  const set = (o) => A.send({ cmd: "settings", settings: o });
  const solTrades = () => ((S() && S().trades) || []).filter((t) => (t.asset || "SOL") === "SOL");
  /* Une market cap tapee a la main : « 150k », « 2.5m », « 1b », « +50% », « -30% ». */
  function parseMc(txt, cur) {
    const s = String(txt || "").trim().toLowerCase().replace(/[$,\s]/g, "");
    if (!s) return 0;
    const p = /^([+-])?(\d+(?:\.\d+)?)%$/.exec(s);
    if (p) {
      if (!(cur > 0)) return 0;
      const v = +p[2] / 100;
      return p[1] === "-" ? cur * (1 - v) : cur * (1 + v);
    }
    const m = /^(\d+(?:\.\d+)?)([kmb])?$/.exec(s);
    if (!m) return 0;
    return +m[1] * ({ k: 1e3, m: 1e6, b: 1e9 }[m[2]] || 1);
  }
  function curMc() {
    const q = A.pair();
    return q ? +(q.marketCap || q.fdv) || 0 : 0;
  }

  /* ------------------------------------------------- sections et cartes */

  const NEW = [
    { after: "log", id: "recap", title: "Today", keys: ["Today"], desc: "The recap of your day: what you made, where it went wrong, and the habits that cost you." },
    { after: "recap", id: "chal", title: "Challenges", keys: ["Challenges"], desc: "Goals that make you a better trader, not a busier one. Each unlocks once, for good." },
    { after: "chal", id: "risk", title: "Risk rules", keys: ["Risk rules"], desc: "Limits you set when you are calm, enforced when you are not: a daily loss cap, a trade cap, a pause after a losing streak." },
    { after: "wallet", id: "wallets", title: "Paper wallets", keys: ["Paper wallets"], desc: "Several wallets side by side — one per strategy, each with its own balance, positions and history." },
    { after: "wallets", id: "alerts", title: "Price alerts", keys: ["Price alerts"], desc: "A market cap to watch. Blanks tells you when it is crossed — even with the tab closed." },
    { after: "alerts", id: "replay", title: "Replay", keys: ["Replay"], desc: "Trade a chart's past, sped up, with a separate 10 SOL wallet. Practice without waiting for the market." },
  ];
  for (const s of NEW) {
    const i = A.SECTIONS.findIndex((x) => x.id === s.after);
    const o = { id: s.id, title: s.title, keys: s.keys, desc: s.desc };
    i >= 0 ? A.SECTIONS.splice(i + 1, 0, o) : A.SECTIONS.push(o);
  }
  {
    const i = A.SECTIONS.findIndex((x) => x.id === "pnl");
    const o = { id: "kc", title: "PNL replay", keys: ["PNL replay"], desc: "The video of a trade: its real candles, your buys and sells, the PNL counting up — ready to save and share." };
    i >= 0 ? A.SECTIONS.splice(i + 1, 0, o) : A.SECTIONS.push(o);
  }
  /* Une section a part, facile a trouver : ce que Blanks dessine sur le graphique. */
  {
    const i = A.SECTIONS.findIndex((x) => x.id === "look");
    const o = { id: "chart", title: "Chart", keys: ["Chart overlays"], desc: "What Blanks draws on the token chart, on top of your buys and sells. Turn off anything you don't want to see." };
    i >= 0 ? A.SECTIONS.splice(i + 1, 0, o) : A.SECTIONS.push(o);
  }

  /* l'ordre de la barre laterale, par groupes (les titres de groupe sont en CSS) */
  const ORDER = ["dash", "stats", "log", "recap", "chal", "risk", "replay", "alerts", "qb", "wallets", "wallet", "chart", "look", "card", "pnl", "kc", "sound", "feed", "lb", "news"];
  A.SECTIONS.sort((a, b) => (ORDER.indexOf(a.id) + 1 || 99) - (ORDER.indexOf(b.id) + 1 || 99));

  const card = (id, lbl, sub) =>
    `<div class="card bxcard" data-bx="${id}"><div class="lbl">${lbl}${sub ? ` <span class="dim2">${sub}</span>` : ""}</div><div class="bxb"></div></div>`;
  X.cards =
    card("recap", "Today", "your day in numbers") +
    card("chal", "Challenges", "unlocked once, kept forever") +
    card("risk", "Risk rules", "limits on yourself") +
    card("wallets", "Paper wallets", "one per strategy") +
    card("alerts", "Price alerts", "on the market cap") +
    card("replay", "Replay", "the past, sped up") +
    card("overlays", "Chart overlays", "what Blanks draws on the chart") +
    card("kc", "PNL replay", "the video of a trade");

  const SEC_CARD = { recap: "recap", chal: "chal", risk: "risk", wallets: "wallets", alerts: "alerts", replay: "replay", chart: "overlays", kc: "kc" };

  /* ---------------------------------------------------------- rendus */

  function cardEl(id) {
    const r = A.root;
    return r ? r.querySelector('.bxcard[data-bx="' + id + '"]') : null;
  }
  function typing(el) {
    const a = A.root && A.root.activeElement;
    return !!(a && el && el.contains(a) && /INPUT|TEXTAREA/.test(a.tagName));
  }
  const R = {};

  /* Les listes de lignes (bxlist) n'ont un filet qu'entre deux lignes ; les blocs d'une
     carte sont espaces par la grille du CSS (gap), jamais par des marges en ligne. */
  const row2 = (a, b, c) => `<div class="bxrow2"><span>${a}</span><b>${b}</b><b class="${c[1] || ""}">${c[0]}</b></div>`;
  const WCOL = ["#f0b43a", "#526fff", "#6fdc90", "#ff6aa8", "#3ec7e0", "#b48cff", "#ff8a4c", "#9bd96f", "#e5e7eb", "#ff4d6d", "#14d8b8", "#c9a227"];
  function wColor(id) {
    const ids = Object.keys((S() && S().wallets) || {});
    const i = Math.max(0, ids.indexOf(id));
    return WCOL[i % WCOL.length];
  }
  function walletRows() {
    const st = S();
    const ws = st.wallets || { main: { name: "Main" } };
    const cur = st.walletId || "main";
    const tr = solTrades();
    const live = { bal: st.balanceSol, n: tr.length, pnl: tr.reduce((a, t) => a + (+t.pnlSol || 0), 0), open: Object.values(st.positions || {}).filter((p) => p.tokens > 0).length };
    const sel = new Set(Array.isArray(st.walletSel) ? st.walletSel : []);
    return Object.keys(ws).map((id) => ({ id, name: ws[id].name, on: id === cur, sel: id === cur || sel.has(id), s: id === cur ? live : ws[id].sum || { bal: 0, n: 0, pnl: 0, open: 0 }, col: wColor(id) }));
  }

  R.recap = function () {
    const st = S();
    const t0 = dayStart(),
      y0 = t0 - 864e5;
    const all = solTrades();
    const tr = all.filter((t) => t.closedAt >= t0);
    const yd = all.filter((t) => t.closedAt >= y0 && t.closedAt < t0);
    const sum = (a) => a.reduce((s, t) => s + (+t.pnlSol || 0), 0);
    const pnl = sum(tr),
      wins = tr.filter((t) => t.pnlSol > 0).length;
    if (!tr.length)
      return `<div class="bxstats"><div><b>0</b><small>trades today</small></div><div><b class="${tone(sum(yd))}">${sol(sum(yd), 1)}</b><small>yesterday · ${yd.length} trade${yd.length === 1 ? "" : "s"}</small></div></div><div class="empty">No closed trade today yet. The recap fills itself as you trade.</div>`;
    const best = tr.reduce((a, t) => (!a || t.pnlSol > a.pnlSol ? t : a), null),
      worst = tr.reduce((a, t) => (!a || t.pnlSol < a.pnlSol ? t : a), null);
    const byH = {};
    for (const t of tr) {
      const h = new Date(t.closedAt).getHours();
      byH[h] = (byH[h] || 0) + (+t.pnlSol || 0);
    }
    const hs = Object.keys(byH).sort((a, b) => byH[a] - byH[b]);
    const badH = hs.length && byH[hs[0]] < 0 ? +hs[0] : null;
    const quick = tr.filter((t) => t.closedAt - t.openedAt < 3e4),
      fomo = tr.filter((t) => t.entry && t.entry.fomo),
      rev = tr.filter((t) => t.entry && t.entry.revenge),
      scored = tr.filter((t) => t.entry),
      avgScore = scored.length ? Math.round(scored.reduce((a, t) => a + t.entry.score, 0) / scored.length) : null;
    const habit = (a, txt) => (a.length ? `<div class="bxhab"><span>${txt}</span><b>${a.length}×</b><b class="${tone(sum(a))}">${sol(sum(a), 1)}</b></div>` : "");
    const habits = habit(quick, "Quick flips (under 30 s)") + habit(fomo, "FOMO entries (after a +25% candle)") + habit(rev, "Revenge buys (within 2 min of a loss)");
    const tip = (() => {
      if (rev.length && sum(rev) < 0) return "Your revenge buys cost you " + sol(-sum(rev)) + " SOL today. Risk rules can force a pause after a losing streak.";
      if (fomo.length && sum(fomo) < 0) return "Chasing pumps cost you " + sol(-sum(fomo)) + " SOL. Wait for the first pullback.";
      if (quick.length >= 3 && sum(quick) < 0) return "Your sub-30-second flips lost " + sol(-sum(quick)) + " SOL — fees eat scalps alive.";
      if (badH !== null) return "Your worst hour was " + String(badH).padStart(2, "0") + ":00 (" + sol(byH[badH], 1) + " SOL).";
      return pnl >= 0 ? "Clean day. Same rules tomorrow." : "Red day, but no bad habit stands out — sometimes the market just wins.";
    })();
    const rk = st && st.settings && st.settings.risk && st.settings.risk.on;
    return `<div class="bxstats">
      <div><b class="${tone(pnl)}">${sol(pnl, 1)}</b><small>SOL today</small></div>
      <div><b>${tr.length}</b><small>trades · ${Math.round((wins / tr.length) * 100)}% won</small></div>
      <div><b>${avgScore === null ? "—" : avgScore}</b><small>avg entry score</small></div>
      <div><b class="${tone(sum(yd))}">${sol(sum(yd), 1)}</b><small>yesterday</small></div>
    </div>
    <div class="bxlist">
      ${row2("Best", esc(best.symbol), [sol(best.pnlSol, 1) + " · " + pct(best.pnlPct), tone(best.pnlSol)])}
      ${row2("Worst", esc(worst.symbol), [sol(worst.pnlSol, 1) + " · " + pct(worst.pnlPct), tone(worst.pnlSol)])}
      ${badH !== null ? row2("Worst hour", String(badH).padStart(2, "0") + ":00", [sol(byH[badH], 1), "down"]) : ""}
    </div>
    ${habits ? `<div class="bxsub">Habits</div><div class="bxlist">${habits}</div>` : ""}
    <div class="bxtip">${esc(tip)}</div>
    ${rk ? "" : `<div class="themes"><div class="th" data-go="risk">Set risk rules</div></div>`}`;
  };

  R.chal = function () {
    const c = (S() && S().chal) || [];
    if (!c.length) return '<div class="empty">Loading…</div>';
    const done = c.filter((x) => x.at).length;
    return (
      `<div class="bxchsum"><b>${done}</b> / ${c.length} unlocked</div><div class="bxch">` +
      c
        .map((x) => {
          const p = Math.max(0, Math.min(1, x.cur / x.goal));
          const prog = x.goal > 1 ? (x.id === "ten" ? sol(x.cur) + " / 10 SOL" : Math.floor(x.cur) + " / " + x.goal) : "";
          return `<div class="bxc ${x.at ? "on" : ""}"><div class="bxct"><b>${esc(x.name)}</b>${x.at ? `<span class="bxok">${dateTxt(x.at)}</span>` : prog ? `<span class="dim2">${prog}</span>` : ""}</div><small>${esc(x.desc)}</small>${x.at ? "" : `<i style="--p:${(p * 100).toFixed(1)}%"></i>`}</div>`;
        })
        .join("") +
      "</div>"
    );
  };

  function riskNow() {
    const st = S();
    const c = Object.assign({ on: false, maxLoss: 1, maxTrades: 20, lossStreak: 3, pauseMin: 30 }, (st && st.settings.risk) || {});
    const t0 = dayStart(),
      tr = solTrades().filter((t) => t.closedAt >= t0),
      pnl = tr.reduce((a, t) => a + (+t.pnlSol || 0), 0),
      opened = (st.trades || []).filter((t) => t.openedAt >= t0).length + Object.values(st.positions || {}).filter((p) => p.tokens > 0 && p.openedAt >= t0).length;
    let streak = 0;
    for (const t of st.trades || []) {
      if (t.pnlSol < 0) streak++;
      else break;
    }
    const last = (st.trades || [])[0];
    const pause = c.lossStreak > 0 && streak >= c.lossStreak && last ? last.closedAt + c.pauseMin * 6e4 : 0;
    return { c, pnl, opened, streak, pause: pause > Date.now() ? pause : 0 };
  }

  R.risk = function () {
    const st = S();
    const r = riskNow(),
      c = r.c;
    const lossTxt = c.maxLoss > 0 ? sol(r.pnl, 1) + " / −" + c.maxLoss : sol(r.pnl, 1);
    const state = !c.on
      ? `<span class="bxpill">off</span>Rules are not enforced.`
      : r.pnl <= -c.maxLoss && c.maxLoss > 0
        ? `<span class="bxpill down">locked</span>Daily loss limit reached — buys are blocked until tomorrow.`
        : r.pause
          ? `<span class="bxpill down">paused</span>${r.streak} losses in a row — buys resume at ${hhmm(r.pause)}.`
          : c.maxTrades > 0 && r.opened >= c.maxTrades
            ? `<span class="bxpill down">capped</span>Trade limit reached — you can still add to open positions.`
            : `<span class="bxpill up">armed</span>Buys go through.`;
    const rp = (st.settings && st.settings.riskPct) || 2;
    return `<div class="swrow bxfirst"><span>Enforce my rules<small>Blocks new buys — and limit orders — when a rule trips. Sells always work.</small></span><div class="sw ${c.on ? "on" : ""}" data-rk="on"></div></div>
    <div class="set bxset">
      <label>Max daily loss (SOL)</label><input data-rk="maxLoss" inputmode="decimal" value="${c.maxLoss}">
      <label>Max new trades per day</label><input data-rk="maxTrades" inputmode="numeric" value="${c.maxTrades}">
      <label>Pause after N losses in a row</label><input data-rk="lossStreak" inputmode="numeric" value="${c.lossStreak}">
      <label>Pause length (minutes)</label><input data-rk="pauseMin" inputmode="numeric" value="${c.pauseMin}">
      <label>Risk per trade (% of balance)</label><input data-rp="1" inputmode="decimal" value="${rp}">
    </div>
    <div class="bxstats">
      <div><b class="${tone(r.pnl)}">${lossTxt}</b><small>SOL today</small></div>
      <div><b>${r.opened}${c.maxTrades > 0 ? " / " + c.maxTrades : ""}</b><small>new trades</small></div>
      <div><b class="${r.streak ? "down" : ""}">${r.streak}</b><small>losses in a row</small></div>
    </div>
    <div class="bxstate">${state}</div>
    <details class="help"><summary>Help</summary><div class="note">Zero turns a rule off. <b>Risk per trade</b> feeds the size helper under the exit orders: with a stop loss at −30% and 2% risk, it suggests the buy that loses 2% of your balance if the stop is hit. Rules count SOL trades of the active paper wallet, and the day starts at midnight on your computer.</div></details>`;
  };

  R.wallets = function () {
    const st = S();
    const nsel = walletRows().filter((w) => w.sel).length;
    const rows = walletRows()
      .map(
        (w) => `<div class="bxw ${w.on ? "on" : ""}" data-id="${esc(w.id)}" style="--wc:${w.col}">
          <i class="bxwsq"></i>
          <div class="bxwn"><div class="bxwt"><b>${esc(w.name)}</b>${w.on ? '<span class="bxpill up">shown</span>' : w.sel ? '<span class="bxpill up">trading</span>' : ""}</div><small>${w.s.n} trade${w.s.n === 1 ? "" : "s"}${w.s.open ? " · " + w.s.open + " open" : ""}</small></div>
          <div class="bxwv"><b>${A.icon("SOL")}${sol(w.s.bal)}</b><small class="${tone(w.s.pnl)}">${sol(w.s.pnl, 1)} realised</small></div>
          <div class="bxwa">${w.on ? (nsel > 1 ? `<span class="bxbtn" data-w="sel">Stop trading with it</span>` : "") : `<span class="bxbtn" data-w="use">Switch</span><span class="bxbtn" data-w="sel">${w.sel ? "Stop trading with it" : "Trade with it too"}</span>`}<span class="bxbtn" data-w="ren">Rename</span>${w.on ? "" : `<span class="bxbtn bxdel" data-w="del">Delete</span>`}</div>
        </div>`,
      )
      .join("");
    const sw = st.settings.walletBar !== false;
    return `<div class="bxws">${rows}</div>
      <div class="bxsub">New wallet</div>
      <div class="set bxset"><label>Name</label><input data-nw="name" placeholder="Scalps"><label>Starting balance (SOL)</label><input data-nw="bal" inputmode="decimal" placeholder="10"></div>
      <div class="themes"><div class="th" data-w="new">Create and switch</div></div>
      <div class="swrow"><span>Switcher above the panel<small>A wallet button on top of the trade panel, like Terminal's: one click lists your wallets, another switches.</small></span><div class="sw ${sw ? "on" : ""}" data-ov="walletBar"></div></div>
      <details class="help"><summary>Help</summary><div class="note">Each wallet keeps its own balance, open positions, orders, history and stats. Switching is instant and nothing is lost. <b>Trade with it too</b> (or the boxes in the switcher above the panel) makes several wallets trade together: each buy spends the same amount in every ticked wallet, each sell sells the same share of each position, exit lines are placed in each, and their TP / SL fire even while another wallet is shown. Limit orders stay on the wallet that placed them. Challenges and price alerts are shared. The Backup button in <b>Wallet &amp; backup</b> saves the active wallet; Chrome sync mirrors the active wallet too.</div></details>`;
  };

  R.alerts = function () {
    const st = S();
    const q = A.pair(),
      mc = curMc(),
      al = st.alerts || [];
    const head = q
      ? `<div class="bxlist">${row2("This token", esc(q.baseToken && q.baseToken.symbol), [mc > 0 ? money(mc) + " MC" : "—", ""])}</div>
         <div class="set bxset"><label>Alert at market cap</label><input data-al="mc" placeholder="150k, 2m or +50%"></div>
         <div class="themes"><div class="th" data-al="add">Add alert</div><div class="th" data-al="q" data-amc="+50%">+50%</div><div class="th" data-al="q" data-amc="+100%">×2</div><div class="th" data-al="q" data-amc="-30%">−30%</div></div>`
      : `<div class="note">Open a token chart to add an alert on it.</div>`;
    const list = al.length
      ? al
          .slice()
          .sort((a, b) => b.created - a.created)
          .map((a) => {
            const now = a.last || a.from,
              span = Math.abs(a.mc - a.from) || 1,
              p = Math.max(0, Math.min(1, 1 - Math.abs(a.mc - now) / span));
            return `<div class="bxal" data-id="${esc(a.id)}"><div><b>${esc(a.symbol)}</b> <span class="${a.dir === "up" ? "up" : "down"}">${a.dir === "up" ? "above" : "below"} ${money(a.mc)}</span><small>now ${money(now)} · set ${dateTxt(a.created)}</small><i style="--p:${(p * 100).toFixed(1)}%"></i></div><span class="ico bxx" data-al="del" title="Remove">✕</span></div>`;
          })
          .join("")
      : '<div class="empty">No alert yet.</div>';
    const log = (st.alertLog || []).slice(0, 5);
    const notif = st.notifOk
      ? `<div class="note"><span class="bxpill up">on</span>Desktop notifications are on: alerts reach you even with every Terminal / Axiom tab closed.</div>`
      : `<div class="note"><span class="bxpill">tab only</span>Alerts show here while a tab is open. For desktop notifications with the tab closed, click the Blanks icon in Chrome's toolbar → <b>Enable desktop alerts</b>.</div>`;
    return `${head}<div class="bxsub">Active <span>${al.length}</span></div><div class="bxals">${list}</div>${
      log.length ? `<div class="bxsub">Fired</div><div class="bxlist">` + log.map((l) => row2(hhmm(l.ts) + " · " + dateTxt(l.ts), esc(l.symbol), [money(l.mc), l.dir === "up" ? "up" : "down"])).join("") + `</div>` : ""
    }${notif}`;
  };

  R.replay = function () {
    const st = S();
    const rs = (st.replays || []).slice(0, 8);
    return `<div class="note">Blanks reads the candles already loaded in the chart, hides everything after the start you pick and plays them back at your speed. You trade with a separate 10 SOL replay wallet, with your own fees and exit lines — your real paper balance is never touched.</div>
      <div class="bxkeys"><span><kbd>Space</kbd> play / pause</span><span><kbd>→</kbd> one candle</span><span><kbd>B</kbd> buy</span><span><kbd>S</kbd> sell all</span><span><kbd>Esc</kbd> close</span></div>
      <div class="themes"><div class="th ${A.pairAddr ? "" : "dis"}" data-rp="go">${A.pairAddr ? "Replay this chart" : "Open a token chart first"}</div></div>
      ${
        rs.length
          ? `<div class="bxsub">Last replays</div><div class="bxlist">` +
            rs.map((r) => row2(dateTxt(r.ts) + " · " + r.trades + " trade" + (r.trades > 1 ? "s" : ""), esc(r.symbol), [sol(r.pnl, 1) + " · " + pct(r.pct), tone(r.pnl)])).join("") +
            `</div>`
          : ""
      }`;
  };

  R.overlays = function () {
    const s = S().settings || {};
    const row = (k, on, t, sub, f) => `<div class="swrow${f ? " bxfirst" : ""}"><span>${t}<small>${sub}</small></span><div class="sw ${on ? "on" : ""}" data-ov="${k}"></div></div>`;
    return (
      row("ghost", s.ghost !== false, "Ghost mode", "After you sell, a dashed line runs from your last sell to the current price with how much the token moved since — amber when it kept rising (you left money on the table), grey when it dropped (good exit).", 1) +
      row("zones", s.zones !== false, "Past entry zones", "Your previous trades on the token, as green and red bands with their result.") +
      row("topBubbles", !!s.topBubbles, "Top-trader bubbles", "The trades of the 10 best paper traders of the week on this token, as bubbles — no follow needed.")
    );
  };

  /* PNL replay : la killcam (la video d'un trade) a enfin sa section, comme la PNL card. */
  R.kc = function () {
    const st = S(),
      s = st.settings || {};
    const t = (st.trades || [])[0];
    const sp = s.killcamSpeed === undefined ? 1 : +s.killcamSpeed;
    const speeds = [
      [0, "Auto"],
      [1, "1:1"],
      [2, "2×"],
      [4, "4×"],
      [10, "10×"],
    ];
    const dim = s.kcDim === undefined ? 0.62 : +s.kcDim,
      blur = +s.kcBlur || 0;
    const last = t
      ? `<div class="bxkcl"><div><b>${esc(t.symbol || "?")}</b><small>${dur((t.closedAt || 0) - (t.openedAt || 0))} held · ${dateTxt(t.closedAt)}</small></div><b class="${tone(t.pnlSol)}">${sol(t.pnlSol, 1)} SOL · ${pct(t.pnlPct)}</b></div>`
      : `<div class="empty">No closed trade yet — the sample shows what it looks like.</div>`;
    return `<div class="bxkcprev" data-kc="last"><div class="bxkcplay"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></div><span>${t ? "Play your last trade" : "Play the sample"}<small>${t ? esc(t.symbol || "?") + " · " + sol(t.pnlSol, 1) + " SOL" : "BLANKS · +0.21 SOL"}</small></span><svg class="bxkcsp" viewBox="0 0 200 60" preserveAspectRatio="none"><polyline points="0,48 18,44 32,50 50,38 66,41 82,30 98,34 116,22 132,27 150,14 168,19 186,8 200,11" fill="none" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke"/><circle cx="50" cy="38" r="3.5" fill="#6fdc90"/><circle cx="186" cy="8" r="3.5" fill="#ff007b"/></svg></div>
      ${last}
      <div class="bxsub">Speed</div>
      <div class="themes">${speeds.map(([v, l]) => `<div class="th ${v === sp ? "on" : ""}" data-kcs="${v}">${l}</div>`).join("")}</div>
      <div class="slid bxslid">
        <label>Background darkness</label><span class="sv">${Math.round(dim * 100)}%</span><input type="range" data-kcr="kcDim" min="0" max="1" step="0.05" value="${dim}" style="--p:${(dim * 100).toFixed(1)}%">
        <label>Background blur</label><span class="sv">${blur}px</span><input type="range" data-kcr="kcBlur" min="0" max="10" step="0.5" value="${blur}" style="--p:${(blur * 10).toFixed(1)}%">
      </div>
      <div class="themes"><div class="th" data-kc="last">${t ? "Open on last trade" : "Open"}</div><div class="th" data-kc="sample">Preview with a sample</div></div>
      <details class="help"><summary>Help</summary><div class="note">The PNL replay replays a closed trade on its real candles, with your buys and sells popping in, and saves it as a video to share. Open it on any trade from <b>History</b> (▶ at the end of a row). The background image is picked in the replay window and remembered, like the speed and these two sliders. <b>Auto</b> fits the whole trade in about 10 seconds; 1:1 plays it in real time.</div></details>`;
  };

  function render(id, force) {
    const el = cardEl(id);
    if (!el || !S()) return;
    const b = el.querySelector(".bxb");
    /* pas de reecriture sous la souris ni pendant la saisie : remplacer l'element
       survole fait perdre le curseur main jusqu'au prochain mouvement */
    /* seule la saisie bloque : le HTML n'est reecrit que s'il a change, donc le
       curseur ne clignote pas, et un clic se voit tout de suite meme sous la souris */
    if (!force && typing(el)) return;
    let html = "";
    try {
      html = R[id]();
    } catch (e) {
      html = '<div class="empty">—</div>';
    }
    if (b.__h !== html) {
      b.__h = html;
      b.innerHTML = html;
    }
    bind(el, id);
  }

  /* ------------------------------------------------------- evenements */

  const armed = new Map();
  function bind(el, id) {
    if (el.__bx) return;
    el.__bx = 1;
    el.addEventListener("keydown", (e) => {
      e.stopPropagation();
      if (e.key !== "Enter" || !e.target.matches("input")) return;
      const t = e.target;
      if (t.dataset.al === "mc") return addAlert(t.value);
      if (t.dataset.nw) return el.querySelector('[data-w="new"]').click();
      t.blur();
    });
    el.addEventListener("input", (e) => {
      const t = e.target;
      if (!t.dataset.kcr) return;
      t.style.setProperty("--p", (((t.value - t.min) / (t.max - t.min)) * 100).toFixed(1) + "%");
      const sv = t.previousElementSibling;
      sv && (sv.textContent = t.dataset.kcr === "kcDim" ? Math.round(t.value * 100) + "%" : t.value + "px");
    });
    el.addEventListener("change", (e) => {
      const t = e.target;
      if (t.dataset.kcr) return set({ [t.dataset.kcr]: +t.value });
      if (t.dataset.rk) {
        const v = Math.max(0, parseFloat(String(t.value).replace(",", ".")) || 0);
        const cur = Object.assign({ on: false, maxLoss: 1, maxTrades: 20, lossStreak: 3, pauseMin: 30 }, S().settings.risk || {});
        cur[t.dataset.rk] = v;
        set({ risk: cur });
        A.toast("risk rule saved", "good");
      } else if (t.dataset.rp) {
        const v = Math.max(0.1, Math.min(100, parseFloat(String(t.value).replace(",", ".")) || 2));
        set({ riskPct: v });
      }
    });
    el.addEventListener("click", (e) => {
      const t = e.target.closest("[data-rk],[data-ov],[data-w],[data-al],[data-rp],[data-go],[data-kc],[data-kcs]");
      if (!t || t.tagName === "INPUT" || t.classList.contains("dis")) return;
      if (t.dataset.kc) {
        const tr = t.dataset.kc === "sample" ? A.sampleTrade() : null;
        return A.killcam(tr);
      }
      if (t.dataset.kcs !== undefined) {
        el.querySelectorAll("[data-kcs]").forEach((b) => b.classList.toggle("on", b === t));
        return set({ killcamSpeed: +t.dataset.kcs });
      }
      if (t.dataset.go) return A.openSettings(t.dataset.go);
      if (t.dataset.rk === "on") {
        const cur = Object.assign({ on: false, maxLoss: 1, maxTrades: 20, lossStreak: 3, pauseMin: 30 }, S().settings.risk || {});
        cur.on = !cur.on;
        t.classList.toggle("on", cur.on);
        set({ risk: cur });
        return A.toast(cur.on ? "risk rules enforced" : "risk rules off", cur.on ? "good" : "");
      }
      if (t.dataset.ov) {
        const k = t.dataset.ov,
          on = !t.classList.contains("on");
        t.classList.toggle("on", on);
        return set({ [k]: on });
      }
      if (t.dataset.rp === "go") return A.pairAddr ? openReplay() : A.toast("open a token chart first", "bad");
      if (t.dataset.al) {
        if (t.dataset.al === "add") return addAlert(el.querySelector('[data-al="mc"]').value);
        if (t.dataset.al === "q") return addAlert(t.dataset.amc);
        if (t.dataset.al === "del") return A.send({ cmd: "alertDel", id: t.closest(".bxal").dataset.id });
      }
      if (t.dataset.w) {
        const row = t.closest(".bxw"),
          wid = row && row.dataset.id;
        if (t.dataset.w === "use") return A.send({ cmd: "walletSwitch", id: wid });
        if (t.dataset.w === "sel") return wToggle(wid);
        if (t.dataset.w === "del") {
          if (armed.get("del") !== wid) {
            armed.set("del", wid);
            t.textContent = "Sure? Delete";
            t.classList.add("arm");
            setTimeout(() => armed.get("del") === wid && (armed.delete("del"), render("wallets", true)), 3500);
            return;
          }
          armed.delete("del");
          return A.send({ cmd: "walletDelete", id: wid });
        }
        if (t.dataset.w === "ren") {
          const nb = row.querySelector(".bxwn b");
          if (row.querySelector("input")) return;
          const inp = document.createElement("input");
          inp.className = "bxren";
          inp.value = nb.textContent;
          nb.replaceWith(inp);
          inp.focus();
          inp.select();
          const done = () => {
            const v = inp.value.trim();
            v && A.send({ cmd: "walletRename", id: wid, name: v });
            setTimeout(() => render("wallets", true), 50);
          };
          inp.addEventListener("blur", done, { once: true });
          return;
        }
        if (t.dataset.w === "new") {
          const nm = el.querySelector('[data-nw="name"]').value,
            bal = parseFloat(String(el.querySelector('[data-nw="bal"]').value).replace(",", ".")) || 0;
          A.send({ cmd: "walletNew", name: nm, balance: bal });
          el.querySelectorAll("[data-nw]").forEach((i) => (i.value = ""));
          return;
        }
      }
    });
  }

  function addAlert(txt) {
    const mc = parseMc(txt, curMc());
    if (!(mc > 0)) return A.toast("type a market cap, e.g. 150k, 2m or +50%", "bad");
    A.send({ cmd: "alertAdd", pair: A.pairAddr, mc, url: location.href });
    const i = cardEl("alerts") && cardEl("alerts").querySelector('[data-al="mc"]');
    i && (i.value = "");
  }

  X.hooks.section = function (sec) {
    const id = SEC_CARD[sec];
    id && render(id, true);
  };
  setInterval(() => {
    const r = A.root;
    const m = r && r.querySelector(".smodal.on");
    if (!m) return;
    const id = SEC_CARD[A.secCur];
    id && render(id, false);
  }, 250);

  /* --------------------------------------- dans le panneau : chrono, note */

  const BELL =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>';
  X.hooks.trade = function (pos, mkt, pair) {
    const r = A.root;
    if (!r) return;
    const head = r.querySelector(".sellcard .shead");
    if (!head) return;
    let box = head.querySelector(".bxchips");
    if (!box) {
      box = document.createElement("span");
      box.className = "bxchips";
      const ped = head.querySelector('.pedit[data-side="sell"]');
      ped ? ped.after(box) : head.appendChild(box);
      box.addEventListener("click", (e) => {
        const t = e.target.closest("[data-bx]");
        if (!t) return;
        e.stopPropagation();
        A.openSettings(t.dataset.bx === "bell" ? "alerts" : "recap");
      });
    }
    const st = S();
    const open = pos && pos.tokens > 0;
    let html = "";
    /* le chrono change chaque seconde : son texte est mis a jour sur place, le reste
       n'est reecrit que s'il change vraiment */
    if (open && pos.openedAt) html += `<span class="bxtm" data-tip="Time in this position"></span>`;
    if (open && pos.entry) {
      const e = pos.entry,
        lines = ["Entry score " + e.score + "/100"].concat((e.notes || []).map((n) => "− " + n), (e.good || []).map((n) => "+ " + n));
      html += `<span class="bxgr g${e.grade}" data-bx="grade" data-tip="${esc(lines.join("\n"))}">${e.grade}</span>`;
    }
    const n = ((st && st.alerts) || []).filter((a) => a.pair === A.pairAddr).length;
    html += `<span class="bxbell ${n ? "on" : ""}" data-bx="bell" data-tip="${n ? n + " price alert" + (n > 1 ? "s" : "") + " on this token" : "Set a price alert on this token"}">${BELL}${n ? "<b>" + n + "</b>" : ""}</span>`;
    if (box.__h !== html) {
      box.__h = html;
      box.innerHTML = html;
    }
    const tm = box.querySelector(".bxtm");
    if (tm) {
      const t = dur(Date.now() - pos.openedAt);
      tm.textContent !== t && (tm.textContent = t);
    }
    eveningRecap();
    wbTick();
  };

  /* ------------------------------- le selecteur de wallet au-dessus du panneau */

  /* Comme sur Terminal : un bouton colle au haut du panneau (nom, solde), qui deroule
     la liste des wallets papier. Il suit le panneau quand on le deplace ou le redimensionne. */
  const CHEV = '<svg class="bxwbc" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  let WB = null;
  function wbInit() {
    const r = A.root,
      wrap = A.el && A.el.wrap;
    if (!r || !wrap) return null;
    if (WB && WB.el.isConnected && WB.wrap === wrap) return WB;
    WB && WB.el.remove();
    const el = document.createElement("div");
    el.className = "bxwb";
    el.innerHTML = `<button class="bxwbb" type="button" data-tip="Paper wallets — switch strategy in one click"><i class="bxwsq"></i><span class="bxwbn"></span><span class="bxwbv"></span>${CHEV}</button><div class="bxwm" hidden></div>`;
    r.appendChild(el);
    WB = { el, wrap, btn: el.querySelector(".bxwbb"), menu: el.querySelector(".bxwm"), open: false, form: false, h: "", mh: "" };
    WB.btn.addEventListener("click", (e) => {
      e.stopPropagation();
      wbOpen(!WB.open);
    });
    el.addEventListener("keydown", (e) => {
      e.stopPropagation();
      if (e.key === "Escape") return wbOpen(false);
      if (e.key === "Enter" && e.target.matches(".bxwnf input")) wbCreate();
    });
    WB.menu.addEventListener("click", (e) => {
      e.stopPropagation();
      const t = e.target.closest("[data-wsel],[data-wid],[data-wb]");
      if (!t) return;
      if (t.dataset.wsel) return wToggle(t.dataset.wsel);
      if (t.dataset.wid) {
        t.classList.contains("on") || A.send({ cmd: "walletSwitch", id: t.dataset.wid });
        return wbOpen(false);
      }
      const a = t.dataset.wb;
      if (a === "manage") return wbOpen(false), A.openSettings("wallets");
      if (a === "all") {
        const rows = walletRows();
        const all = rows.every((w) => w.sel);
        return A.send({ cmd: "walletSel", ids: all ? [] : rows.filter((w) => !w.on).map((w) => w.id) });
      }
      if (a === "new") {
        WB.form = true;
        wbRender(true);
        const i = WB.menu.querySelector(".bxwnf input");
        i && i.focus();
        return;
      }
      if (a === "create") return wbCreate();
      if (a === "cancel") return (WB.form = false), wbRender(true);
    });
    /* clic ailleurs : dans le shadow root (cible reelle) ou sur la page (cible = l'hote) */
    r.addEventListener("click", (e) => WB && WB.open && !WB.el.contains(e.target) && wbOpen(false));
    document.addEventListener("click", (e) => WB && WB.open && e.target !== r.host && wbOpen(false), true);
    const place = () => wbPlace();
    new MutationObserver(place).observe(wrap, { attributes: true, attributeFilter: ["style", "class"] });
    try {
      new ResizeObserver(place).observe(wrap);
    } catch (e) {}
    window.addEventListener("resize", place);
    return WB;
  }
  function wToggle(id) {
    const st = S();
    if (!st) return;
    const cur = new Set(Array.isArray(st.walletSel) ? st.walletSel : []);
    if (id === st.walletId) {
      /* Decocher le wallet affiche : il arrete de trader, le premier wallet coche
         prend sa place dans le panneau et les autres restent coches. */
      const rest = [...cur].filter((x) => st.wallets && st.wallets[x]);
      if (!rest.length) return A.toast("one wallet at least has to trade", "bad");
      const next = rest[0];
      st.walletSel = rest.slice(1);
      A.send({ cmd: "walletSwitch", id: next, sel: rest.slice(1) });
      WB && (WB.h = "");
      return;
    }
    cur.has(id) ? cur.delete(id) : cur.add(id);
    st.walletSel = [...cur];
    A.send({ cmd: "walletSel", ids: [...cur] });
    wbRender(true);
    WB.h = "";
    wbRender(false);
  }
  function wbCreate() {
    const f = WB.menu.querySelector(".bxwnf");
    if (!f) return;
    const name = f.querySelector('[name="n"]').value,
      bal = parseFloat(String(f.querySelector('[name="b"]').value).replace(",", ".")) || 0;
    A.send({ cmd: "walletNew", name, balance: bal });
    WB.form = false;
    wbOpen(false);
  }
  function wbOpen(on) {
    if (!WB) return;
    WB.open = on;
    if (!on) WB.form = false;
    WB.el.classList.toggle("open", on);
    WB.menu.hidden = !on;
    on && wbRender(true);
    wbPlace();
  }
  function wbRender(force) {
    if (!WB || !S()) return;
    const rows = walletRows(),
      cur = rows.find((w) => w.on) || rows[0];
    if (!cur) return;
    const sel = rows.filter((w) => w.sel),
      extra = sel.length - 1,
      bal = sel.reduce((a, w) => a + (+w.s.bal || 0), 0);
    const h = cur.col + "|" + cur.name + "|" + extra + "|" + sol(bal);
    if (h !== WB.h) {
      WB.h = h;
      WB.btn.style.setProperty("--wc", cur.col);
      WB.btn.querySelector(".bxwbn").innerHTML = esc(cur.name) + (extra > 0 ? `<b class="bxwbx">+${extra}</b>` : "");
      WB.btn.querySelector(".bxwbv").innerHTML = A.icon("SOL") + sol(bal);
      WB.btn.dataset.tip =
        extra > 0
          ? "Trading with " + sel.length + " wallets: " + sel.map((w) => w.name).join(", ") + " — every buy and sell goes to each of them. Balance shown is their total."
          : "Paper wallets — switch strategy, or tick several to trade with all of them at once";
    }
    if (!WB.open) return;
    const a = WB.menu.contains(A.root.activeElement);
    if (a && !force) return;
    const nsel = rows.filter((w) => w.sel).length;
    const mh =
      `<div class="bxwmh"><span>Paper wallets</span><span class="bxwmb">${rows.length > 1 ? `<span class="bxwma" data-wb="all">${rows.every((w) => w.sel) ? "Unselect all" : "Select all"}</span>` : ""}<span class="bxwma" data-wb="manage">Manage</span></span></div>` +
      `<div class="bxwmt">${nsel > 1 ? `<b>${nsel} wallets</b> buy and sell together — same amount in each.` : `Tick a box to trade with several wallets at once. Click a name to switch to it alone.`}</div><div class="bxwml">` +
      rows
        .map(
          (w) => `<div class="bxwr ${w.on ? "on" : ""} ${w.sel ? "sel" : ""}" data-wid="${esc(w.id)}" style="--wc:${w.col}">
            <i class="bxwsq ${w.on && nsel < 2 ? "lock" : ""}" ${w.on && nsel < 2 ? `data-tip="The wallet shown in the panel — it trades"` : `data-wsel="${esc(w.id)}" data-tip="${w.sel ? "Stop trading with this wallet" : "Also trade with this wallet"}"`}>${w.sel ? CHECK : ""}</i>
            <span class="bxwrn"><b>${esc(w.name)}</b><small>${w.s.n} trade${w.s.n === 1 ? "" : "s"}${w.s.open ? " · " + w.s.open + " open" : ""}</small></span>
            <span class="bxwrb">${A.icon("SOL")}${sol(w.s.bal)}</span>
            <span class="bxwrp ${tone(w.s.pnl)}">${sol(w.s.pnl, 1)}</span>
          </div>`,
        )
        .join("") +
      `</div>` +
      (WB.form
        ? `<div class="bxwnf"><input name="n" placeholder="Name" maxlength="24"><input name="b" inputmode="decimal" placeholder="10 SOL"><button type="button" data-wb="create">Create</button><button type="button" class="ghost" data-wb="cancel">✕</button></div>`
        : `<div class="bxwmf" data-wb="new"><span>+</span> New wallet</div>`);
    if (force || mh !== WB.mh) {
      WB.mh = mh;
      WB.menu.innerHTML = mh;
    }
  }
  function wbPlace() {
    if (!WB) return;
    const st = S(),
      wrap = WB.wrap;
    const show = !!(st && st.settings.walletBar !== false && wrap.isConnected && wrap.style.display !== "none" && !wrap.classList.contains("collapsed"));
    const r = show ? wrap.getBoundingClientRect() : null;
    if (!r || !r.width) return (WB.el.style.display = "none");
    WB.el.style.display = "";
    const bh = WB.btn.offsetHeight || 26;
    const above = r.top - bh - 6 >= 4;
    WB.el.style.left = Math.round(r.left) + "px";
    WB.el.style.top = Math.round(above ? r.top - bh - 6 : r.bottom + 6) + "px";
    WB.el.classList.toggle("below", !above);
    WB.menu.style.maxHeight = Math.max(160, (above ? innerHeight - r.top : innerHeight - r.bottom - bh - 12) - 16) + "px";
  }
  function wbTick() {
    if (!wbInit()) return;
    wbRender(false);
    wbPlace();
  }
  setInterval(() => A.root && wbTick(), 700);

  /* Le soir (apres 20 h), une fois par jour : le bilan en un toast cliquable. */
  let recapShown = "";
  function eveningRecap() {
    const st = S();
    if (!st || new Date().getHours() < 20) return;
    const key = new Date().toDateString();
    if (recapShown === key || (st.ui && st.ui.recapDay === key)) return;
    const tr = solTrades().filter((t) => t.closedAt >= dayStart());
    if (!tr.length) return;
    recapShown = key;
    A.send({ cmd: "ui", ui: { recapDay: key } });
    const pnl = tr.reduce((a, t) => a + (+t.pnlSol || 0), 0);
    setTimeout(() => {
      A.toast("Your day: " + sol(pnl, 1) + " SOL on " + tr.length + " trade" + (tr.length > 1 ? "s" : "") + " · click for the recap", pnl >= 0 ? "good" : "bad");
      const t = A.el && A.el.toast;
      if (!t) return;
      t.classList.add("link");
      const go = () => {
        t.removeEventListener("click", go);
        t.classList.remove("link", "on");
        A.openSettings("recap");
      };
      t.addEventListener("click", go);
      setTimeout(() => {
        t.removeEventListener("click", go);
        t.classList.remove("link");
      }, 8e3);
    }, 1500);
  }

  /* ----------------------------------------------------------- replay */

  /* Les bougies du graphique ouvert, en USD, via chart.js (monde MAIN). */
  function getBars() {
    return new Promise((res) => {
      const id = "rp" + Date.now() + Math.random().toString(36).slice(2, 6);
      const on = (ev) => {
        const d = ev.data;
        if (ev.source !== window || !d || d.source !== "PAPR-CHART" || d.type !== "bars" || d.id !== id) return;
        /* une reponse vide (graphique pas encore pret) n'arrete pas l'attente */
        if (!Array.isArray(d.bars) || !d.bars.length) return;
        window.removeEventListener("message", on);
        clearTimeout(to);
        res({ bars: d.bars, step: d.step || 0 });
      };
      const to = setTimeout(() => {
        window.removeEventListener("message", on);
        res({ bars: [], step: 0 });
      }, 1500);
      window.addEventListener("message", on);
      window.postMessage({ source: "PAPR", type: "bars?", id, t0: 0, t1: Date.now() + 864e5, ctx: 200 }, location.origin);
    });
  }

  const tfTxt = (ms) => (ms < 6e4 ? Math.round(ms / 1e3) + "s" : ms < 36e5 ? Math.round(ms / 6e4) + "m" : Math.round(ms / 36e5) + "h");
  function aggregate(raw, k) {
    if (k <= 1) return raw.slice();
    const out = [];
    for (let i = 0; i < raw.length; i += k) {
      const g = raw.slice(i, i + k);
      out.push([g[0][0], g[0][1], Math.max(...g.map((b) => b[2])), Math.min(...g.map((b) => b[3])), g[g.length - 1][4]]);
    }
    return out;
  }
  /* Le chemin du prix dans une bougie : o → bas → haut → c pour une verte,
     o → haut → bas → c pour une rouge. f de 0 a 1. Renvoie [prix, haut vu, bas vu]. */
  function pathIn(b, f) {
    const [, o, h, l, c] = b;
    const pts = c >= o ? [o, l, h, c] : [o, h, l, c];
    const seg = Math.min(2, Math.floor(f * 3)),
      u = f * 3 - seg;
    const p = pts[seg] + (pts[seg + 1] - pts[seg]) * Math.max(0, Math.min(1, u));
    let hi = o,
      lo = o;
    for (let s = 0; s <= seg; s++) {
      const a = pts[s],
        z = s === seg ? p : pts[s + 1];
      hi = Math.max(hi, a, z);
      lo = Math.min(lo, a, z);
    }
    return [p, hi, lo];
  }

  let RP = null;
  const SPEEDS = [1, 2, 5, 10, 25];

  async function openReplay() {
    if (RP) return;
    const q = A.pair();
    const { bars, step } = await getBars();
    if (bars.length < 40) return A.toast("not enough candles loaded — zoom the chart out (or pick a shorter timeframe) and try again", "bad");
    const st = S(),
      s = (st && st.settings) || {};
    const sym = (q && q.baseToken && q.baseToken.symbol) || "token";
    const supply = q && +q.priceUsd > 0 ? (+(q.marketCap || q.fdv) || 0) / +q.priceUsd : 0;
    const curve = !!(q && /pump/i.test(q.dexId || ""));
    const presets = (Array.isArray(s.buyPresets) ? s.buyPresets : [0.25, 0.5, 1, 2]).map(Number).filter((v) => v > 0 && v <= 10).slice(0, 4);
    const tfs = [1, 3, 5, 15].filter((k) => k === 1 || (bars.length / k >= 50 && step * k <= 36e5));
    RP = {
      raw: bars,
      step: step || (bars[1][0] - bars[0][0]) || 6e4,
      tfs,
      k: 1,
      bars: bars.slice(),
      sym,
      supply,
      solUsd: A.solUsd || 0,
      feePct: ((+s.platformFeePct || 0.9) * (1 - (+s.cashbackPct || 0) / 100)) / 100 + (curve ? 0.01 : 0.0025),
      slipMax: Math.max(0, +s.slippageMaxPct || 0.5) / 100,
      fixed: (+s.priorityFeeSol || 0.001) + (+s.tipSol || 0.001) + 5e-6,
      exitsOn: !!s.exitOn,
      exitDef: Array.isArray(s.exits) && s.exits.length ? s.exits : [{ k: "tp", v: 100, s: 50 }, { k: "sl", v: 30, s: 100 }],
      presets: presets.length ? presets : [0.25, 0.5, 1, 2],
      amt: presets[1] || presets[0] || 0.5,
      speed: 5,
      N: 90,
      hover: null,
    };
    resetRun(randomStart());
    buildReplay();
  }

  function randomStart() {
    const n = RP.bars.length;
    return Math.max(30, Math.min(n - 20, Math.floor(n * (0.12 + Math.random() * 0.45))));
  }
  function resetRun(i0) {
    Object.assign(RP, {
      i0,
      i: i0,
      t: 1,
      phase: "pick",
      play: false,
      bal: 10,
      tokens: 0,
      cost: 0,
      buyTok: 0,
      buyUsd: 0,
      cycInv: 0,
      cycOut: 0,
      realized: 0,
      fills: [],
      closed: [],
      exits: [],
      peak: 10,
      dd: 0,
      saved: false,
      endAt: 0,
      px: RP.bars[i0][4],
    });
  }

  function buildReplay() {
    const wrap = document.createElement("div");
    wrap.className = "bxrep";
    wrap.innerHTML = `<div class="bxrbox" role="dialog" aria-label="Replay">
      <div class="bxrhd"><b>Replay</b><span class="bxrsym">${esc(RP.sym)}</span><span class="bxrclock"></span><span class="sp"></span>
        <span class="bxrtf">${RP.tfs.map((k) => `<b data-k="${k}" class="${k === 1 ? "on" : ""}">${tfTxt(RP.step * k)}</b>`).join("")}</span>
        <span class="bxrx" title="Close (Esc)">✕</span></div>
      <div class="bxrmain">
        <div class="bxrchart"><canvas class="bxrcv"></canvas><div class="bxrov"></div></div>
        <div class="bxrside">
          <div class="bxrkv"><span>Replay wallet</span><b class="bxrbal"></b></div>
          <div class="bxrkv"><span>Position</span><b class="bxrpos"></b></div>
          <div class="bxrkv"><span>Realised</span><b class="bxrrl"></b></div>
          <div class="bxrkv"><span>Trades</span><b class="bxrnt"></b></div>
          <div class="bxrlh">Fills</div>
          <div class="bxrlog"></div>
        </div>
      </div>
      <div class="bxrscrub" title="Drag to pick where the replay starts"><div class="bxrtrack"><i class="bxrdone"></i><i class="bxrthumb"></i></div></div>
      <div class="bxrctl">
        <button class="bxrplay pri">Start</button>
        <button class="bxrstep" title="One candle (→)">Step</button>
        <span class="bxrspd">${SPEEDS.map((v) => `<b data-s="${v}" class="${v === RP.speed ? "on" : ""}">${v}×</b>`).join("")}</span>
        <span class="sp"></span>
        <button class="bxrrnd" title="Another random start">Random start</button>
        <button class="bxrstop" title="End now and see what happened next">Stop &amp; score</button>
      </div>
      <div class="bxrtr">
        <div class="bxrbuy">${RP.presets.map((a) => `<button data-b="${a}">${a}</button>`).join("")}<span class="bxramt"><input class="bxrin" inputmode="decimal" value="${RP.amt}" aria-label="Buy amount in SOL"><button class="bxrgo">Buy</button></span></div>
        <label class="bxrex"><input type="checkbox" ${RP.exitsOn ? "checked" : ""}><span>Exit lines</span></label>
        <div class="bxrsell">${[25, 50, 100].map((p) => `<button data-p="${p}">${p}%</button>`).join("")}</div>
      </div>
    </div>`;
    A.root.appendChild(wrap);
    RP.el = wrap;
    RP.cv = wrap.querySelector("canvas");
    const $ = (s) => wrap.querySelector(s);
    wrap.addEventListener("keydown", (e) => e.stopPropagation());
    wrap.addEventListener("click", (e) => {
      if (e.target === wrap) return closeReplay();
      const t = e.target.closest("button, b[data-s], b[data-k], .bxrx, [data-end]");
      if (!t) return;
      if (t.classList.contains("bxrx")) return closeReplay();
      if (t.dataset.end) return endAction(t.dataset.end);
      if (t.classList.contains("bxrplay")) return togglePlay();
      if (t.classList.contains("bxrstep")) return stepOne();
      if (t.classList.contains("bxrrnd")) return resetRun(randomStart()), ui();
      if (t.classList.contains("bxrstop")) return RP.phase === "play" && finish(true);
      if (t.dataset.s) return setSpeed(+t.dataset.s);
      if (t.dataset.k) return setTf(+t.dataset.k);
      if (t.dataset.b) return rpBuy(+t.dataset.b);
      if (t.classList.contains("bxrgo")) return rpBuy(parseFloat(String($(".bxrin").value).replace(",", ".")));
      if (t.dataset.p) return rpSell(+t.dataset.p / 100);
    });
    $(".bxrex input").addEventListener("change", (e) => {
      RP.exitsOn = e.target.checked;
      RP.tokens > 0 && armExits();
      ui();
    });
    $(".bxrin").addEventListener("change", (e) => {
      const v = parseFloat(String(e.target.value).replace(",", "."));
      v > 0 && (RP.amt = v);
    });
    /* glisser le debut de la partie (tant qu'elle n'a pas commence) */
    const scrub = $(".bxrscrub");
    const pick = (ev) => {
      if (RP.phase !== "pick") return;
      const r = scrub.getBoundingClientRect(),
        f = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width));
      resetRun(Math.max(30, Math.min(RP.bars.length - 10, Math.round(f * (RP.bars.length - 1)))));
      ui();
    };
    scrub.addEventListener("pointerdown", (ev) => {
      if (RP.phase !== "pick") return;
      scrub.setPointerCapture(ev.pointerId);
      pick(ev);
      const mv = (e) => pick(e),
        up = () => (scrub.removeEventListener("pointermove", mv), scrub.removeEventListener("pointerup", up));
      scrub.addEventListener("pointermove", mv);
      scrub.addEventListener("pointerup", up);
    });
    /* zoom a la molette, reticule au survol */
    RP.cv.addEventListener("wheel", (e) => {
      e.preventDefault();
      RP.N = Math.max(30, Math.min(240, Math.round(RP.N * (e.deltaY > 0 ? 1.15 : 0.87))));
    }, { passive: false });
    RP.cv.addEventListener("mousemove", (e) => {
      const r = RP.cv.getBoundingClientRect();
      RP.hover = { x: e.clientX - r.left, y: e.clientY - r.top };
    });
    RP.cv.addEventListener("mouseleave", () => (RP.hover = null));
    RP.key = (e) => {
      if (!RP) return;
      const tag = (A.root.activeElement && A.root.activeElement.tagName) || "";
      if (e.key === "Escape") return e.preventDefault(), closeReplay();
      if (tag === "INPUT") return;
      if (e.key === " ") return e.preventDefault(), e.stopPropagation(), togglePlay();
      if (e.key === "ArrowRight") return e.preventDefault(), stepOne();
      if (e.key === "b" || e.key === "B") return rpBuy(RP.amt);
      if (e.key === "s" || e.key === "S") return rpSell(1);
      if (e.key === "+" || e.key === "=") return setSpeed(SPEEDS[Math.min(SPEEDS.length - 1, SPEEDS.indexOf(RP.speed) + 1)]);
      if (e.key === "-") return setSpeed(SPEEDS[Math.max(0, SPEEDS.indexOf(RP.speed) - 1)]);
    };
    window.addEventListener("keydown", RP.key, true);
    RP.last = performance.now();
    RP.raf = requestAnimationFrame(loop);
    ui();
  }

  function setSpeed(v) {
    RP.speed = v;
    RP.el.querySelectorAll(".bxrspd b").forEach((b) => b.classList.toggle("on", +b.dataset.s === v));
  }
  function setTf(k) {
    if (k === RP.k) return;
    const ts0 = RP.bars[RP.i0][0],
      ts = RP.bars[RP.i][0];
    const map = (t) => Math.max(0, RP.bars.findIndex((b) => b[0] >= t));
    const fills = RP.fills.map((f) => ({ ...f, ts: RP.bars[f.i][0] }));
    RP.k = k;
    RP.bars = aggregate(RP.raw, k);
    RP.i0 = Math.max(10, map(ts0));
    RP.i = Math.max(RP.i0, map(ts));
    RP.t = 1;
    RP.fills = fills.map((f) => ({ ...f, i: map(f.ts) }));
    RP.el.querySelectorAll(".bxrtf b").forEach((b) => b.classList.toggle("on", +b.dataset.k === k));
    ui();
  }
  function togglePlay() {
    if (RP.phase === "end") return endAction("again");
    if (RP.phase === "pick") RP.phase = "play";
    RP.play = !RP.play;
    ui();
  }
  function stepOne() {
    if (RP.phase === "end") return;
    if (RP.phase === "pick") RP.phase = "play";
    RP.play = false;
    advance(RP.t >= 1 - 1e-9 ? 1 : 1 - RP.t);
    ui();
  }

  function closeReplay() {
    if (!RP) return;
    cancelAnimationFrame(RP.raf);
    window.removeEventListener("keydown", RP.key, true);
    if (RP.fills.length && !RP.saved) saveReplay();
    RP.el.remove();
    RP = null;
  }

  /* ------------------------------------------------- portefeuille du replay */

  function fee(a) {
    return a * (RP.feePct + Math.random() * RP.slipMax) + RP.fixed;
  }
  function rpBuy(a) {
    if (!RP || RP.phase === "end") return;
    if (!(a > 0)) return flash("type an amount");
    if (a > RP.bal + 1e-9) return flash("not enough replay SOL");
    if (!(RP.solUsd > 0)) return flash("no SOL price yet");
    if (RP.phase === "pick") RP.phase = "play";
    const px = RP.px,
      net = a - fee(a);
    if (net <= 0) return flash("amount too small for the fees");
    const tok = (net * RP.solUsd) / px;
    RP.bal -= a;
    RP.tokens += tok;
    RP.cost += a;
    RP.cycInv += a;
    RP.buyTok += tok;
    RP.buyUsd += tok * px;
    RP.fills.push({ i: RP.i, side: "buy", px, sol: a, tag: "" });
    armExits();
    ui();
  }
  function rpSell(f, at, tag) {
    if (!RP || RP.phase === "end" || !(RP.tokens > 0)) return tag ? 0 : flash("nothing to sell");
    const px = at || RP.px,
      tok = f >= 0.999 ? RP.tokens : RP.tokens * f,
      gross = (tok * px) / RP.solUsd,
      got = Math.max(0, gross - fee(gross)),
      part = RP.cost * (tok / RP.tokens);
    RP.bal += got;
    RP.cost -= part;
    RP.tokens -= tok;
    RP.cycOut += got;
    RP.realized += got - part;
    RP.fills.push({ i: RP.i, side: "sell", px, sol: got, pnl: got - part, tag: tag || "" });
    if (RP.tokens < 1e-9) {
      RP.closed.push({ pnl: RP.cycOut - RP.cycInv, pct: RP.cycInv > 0 ? (RP.cycOut / RP.cycInv - 1) * 100 : 0 });
      Object.assign(RP, { tokens: 0, cost: 0, cycInv: 0, cycOut: 0, buyTok: 0, buyUsd: 0, exits: [] });
    }
    ui();
    return 1;
  }
  function avgPx() {
    return RP.buyTok > 0 ? RP.buyUsd / RP.buyTok : 0;
  }
  /* Les lignes de sortie du panneau (TP / SL en % de PnL), recalculees a chaque achat. */
  function armExits() {
    const done = new Set(RP.exits.filter((x) => x.hit).map((x) => x.k + x.v));
    RP.exits = RP.exitsOn
      ? RP.exitDef
          .filter((x) => +x.v > 0 && !(x.k === "sl" && +x.v >= 100))
          .map((x) => ({ k: x.k === "sl" ? "sl" : "tp", v: +x.v, s: Math.min(100, Math.max(1, +x.s || 100)), hit: done.has((x.k === "sl" ? "sl" : "tp") + +x.v) }))
      : [];
  }
  /* Comme en live depuis 4.34.2 : le % vise le PnL affiche de la position (cout avec
     frais d'achat), pas l'ecart au prix moyen. */
  function exitLevel(x) {
    const g = RP.cost * (x.k === "tp" ? 1 + x.v / 100 : 1 - x.v / 100);
    if (RP.tokens > 0 && RP.cost > 0 && RP.solUsd > 0) return (g * RP.solUsd) / RP.tokens;
    const a = avgPx();
    return x.k === "tp" ? a * (1 + x.v / 100) : a * (1 - x.v / 100);
  }
  function checkExits(hi, lo) {
    if (!RP.tokens || !RP.exits.length) return;
    for (const x of RP.exits) {
      if (x.hit || !RP.tokens) continue;
      const lv = exitLevel(x);
      if ((x.k === "tp" && hi >= lv) || (x.k === "sl" && lo <= lv)) {
        x.hit = true;
        rpSell(x.s / 100, lv, x.k.toUpperCase());
      }
    }
  }
  function flash(t) {
    RP.flash = t;
    clearTimeout(RP.flashT);
    RP.flashT = setTimeout(() => RP && ((RP.flash = ""), ui()), 1600);
    ui();
  }
  function value() {
    return RP.bal + (RP.tokens > 0 ? Math.max(0, (RP.tokens * RP.px) / RP.solUsd - fee((RP.tokens * RP.px) / RP.solUsd)) : 0);
  }

  /* --------------------------------------------------------- avance, fin */

  /* Le haut et le bas parcourus dans une bougie entre ta et tb (le chemin est lineaire
     par morceaux, ses coudes sont a 1/3 et 2/3). */
  function rangeIn(b, ta, tb) {
    const ks = [ta, tb];
    for (const k of [1 / 3, 2 / 3]) k > ta && k < tb && ks.push(k);
    const ps = ks.map((f) => pathIn(b, f)[0]);
    return [Math.max(...ps), Math.min(...ps)];
  }
  /* Avance de d bougies. Les lignes de sortie ne voient que le prix parcouru depuis le
     dernier pas : un TP ne se declenche jamais sur un haut atteint avant l'achat. */
  function advance(d) {
    let left = d;
    for (let guard = 0; guard < 400; guard++) {
      if (RP.t >= 1 - 1e-9) {
        if (RP.i >= RP.bars.length - 1) {
          RP.t = 1;
          RP.px = RP.bars[RP.i][4];
          return finish(false);
        }
        RP.i++;
        RP.t = 0;
        RP.px = RP.bars[RP.i][1];
      }
      if (left <= 1e-9) break;
      const b = RP.bars[RP.i],
        ta = RP.t,
        tb = Math.min(1, ta + left);
      left -= tb - ta;
      const [hi, lo] = rangeIn(b, ta, tb);
      RP.t = tb;
      RP.px = pathIn(b, tb)[0];
      checkExits(hi, lo);
      if (RP.phase === "end") return;
    }
    const v = value();
    RP.peak = Math.max(RP.peak, v);
    RP.dd = Math.max(RP.dd, RP.peak > 0 ? (1 - v / RP.peak) * 100 : 0);
  }

  function finish(early) {
    RP.phase = "end";
    RP.play = false;
    RP.early = early;
    RP.endAt = RP.i;
    RP.final = value();
    if (!RP.saved && RP.fills.length) saveReplay();
    ui();
  }
  function endAction(a) {
    if (a === "again") resetRun(RP.i0);
    else if (a === "new") resetRun(randomStart());
    else if (a === "close") return closeReplay();
    ui();
  }
  function saveReplay() {
    RP.saved = true;
    const v = RP.phase === "end" ? RP.final : value();
    const wins = RP.closed.filter((c) => c.pnl > 0).length;
    A.send({
      cmd: "replaySave",
      mint: A.pairAddr || "",
      symbol: RP.sym,
      pnl: v - 10,
      pct: (v / 10 - 1) * 100,
      trades: RP.closed.length + (RP.tokens > 0 ? 1 : 0),
      speed: RP.speed,
      wins,
    });
  }

  /* ------------------------------------------------------------ interface */

  function ui() {
    if (!RP) return;
    const el = RP.el,
      $ = (s) => el.querySelector(s);
    const v = RP.phase === "end" ? RP.final : value(),
      pnl = v - 10,
      b = RP.bars[Math.min(RP.i, RP.bars.length - 1)];
    $(".bxrplay").textContent = RP.phase === "pick" ? "Start" : RP.phase === "end" ? "Again" : RP.play ? "Pause" : "Play";
    $(".bxrclock").textContent = new Date(b[0]).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    el.classList.toggle("picking", RP.phase === "pick");
    el.classList.toggle("ended", RP.phase === "end");
    const n = RP.bars.length - 1;
    $(".bxrthumb").style.left = ((RP.i0 / n) * 100).toFixed(2) + "%";
    $(".bxrdone").style.left = ((RP.i0 / n) * 100).toFixed(2) + "%";
    $(".bxrdone").style.width = (((RP.i - RP.i0) / n) * 100).toFixed(2) + "%";
    const mc = (p) => (RP.supply > 0 ? money(p * RP.supply) : "$" + p.toPrecision(3));
    const posV = RP.tokens > 0 ? (RP.tokens * RP.px) / RP.solUsd : 0,
      upnl = RP.tokens > 0 ? posV - RP.cost : 0;
    $(".bxrbal").innerHTML = `${sol(RP.bal)} <i>SOL free</i>`;
    $(".bxrpos").innerHTML = RP.tokens > 0 ? `${sol(posV)} <i class="${tone(upnl)}">${sol(upnl, 1)} (${pct(RP.cost > 0 ? (upnl / RP.cost) * 100 : 0)})</i>` : `<i>none</i>`;
    $(".bxrrl").innerHTML = `<span class="${tone(RP.realized)}">${sol(RP.realized, 1)}</span>`;
    const wins = RP.closed.filter((c) => c.pnl > 0).length;
    $(".bxrnt").textContent = (RP.closed.length ? RP.closed.length + " · " + Math.round((wins / RP.closed.length) * 100) + "% won" : "0") + (RP.tokens > 0 ? " + 1 open" : "");
    $(".bxrlog").innerHTML = RP.fills.length
      ? RP.fills
          .slice(-30)
          .reverse()
          .map(
            (f) =>
              `<div class="bxrf ${f.side} ${(f.tag || "").toLowerCase()}"><b>${f.tag || (f.side === "buy" ? "Buy" : "Sell")}</b><span>${mc(f.px)}</span><span>${sol(f.sol)}${f.side === "sell" && f.pnl !== undefined ? ` <i class="${tone(f.pnl)}">${sol(f.pnl, 1)}</i>` : ""}</span></div>`,
          )
          .join("")
      : `<div class="bxrempty">Buy with the buttons below or <kbd>B</kbd>.</div>`;
    const ov = $(".bxrov");
    if (RP.flash) ov.innerHTML = `<div class="bxrmsg bad">${esc(RP.flash)}</div>`;
    else if (RP.phase === "pick")
      ov.innerHTML = `<div class="bxrmsg">Drag the bar under the chart to choose where it starts — everything after is hidden. <b>Start</b> or <kbd>Space</kbd> when ready.</div>`;
    else if (RP.phase === "end") {
      const end = RP.bars[RP.endAt][4],
        hold = (end / RP.bars[RP.i0][4] - 1) * 100,
        all = RP.closed.concat(RP.tokens > 0 ? [{ pnl: RP.cycOut + posV - RP.cycInv }] : []),
        won = all.filter((c) => c.pnl > 0).length,
        best = all.reduce((a, c) => Math.max(a, c.pnl), -Infinity);
      ov.innerHTML = `<div class="bxrend">
        <div class="bxrendh">${RP.early ? "Stopped" : "End of the chart"} · ${((n) => n + " trade" + (n === 1 ? "" : "s"))(RP.closed.length + (RP.tokens > 0 ? 1 : 0))}</div>
        <div class="bxrendv ${tone(pnl)}">${sol(pnl, 1)} SOL</div>
        <div class="bxrendp ${tone(pnl)}">${pct((v / 10 - 1) * 100)} on the replay wallet</div>
        <div class="bxrendg">
          <div><b>${all.length ? Math.round((won / all.length) * 100) + "%" : "—"}</b><small>won</small></div>
          <div><b class="${tone(best)}">${isFinite(best) ? sol(best, 1) : "—"}</b><small>best trade</small></div>
          <div><b class="down">${RP.dd ? "−" + RP.dd.toFixed(1) + "%" : "0%"}</b><small>max drawdown</small></div>
          <div><b class="${tone(hold)}">${pct(hold)}</b><small>if you just held</small></div>
        </div>
        ${RP.early && RP.endAt < RP.bars.length - 1 ? `<div class="bxrendn">The candles after your stop are now visible, faded — that is what happened next.</div>` : ""}
        <div class="bxrenda"><button data-end="again" class="pri">Same start</button><button data-end="new">New start</button><button data-end="close">Close</button></div>
      </div>`;
    } else ov.innerHTML = "";
    $(".bxrstop").disabled = RP.phase !== "play";
    $(".bxrstep").disabled = RP.phase === "end";
  }

  function loop(now) {
    if (!RP) return;
    const dt = Math.min(250, now - RP.last);
    RP.last = now;
    if (RP.play && RP.phase === "play") {
      const i = RP.i,
        nf = RP.fills.length;
      advance((dt / 1e3) * RP.speed);
      (RP.i !== i || RP.fills.length !== nf) && RP.phase !== "end" && ui();
      if (RP._uiT === undefined || now - RP._uiT > 250) (RP._uiT = now), ui();
    }
    draw();
    RP.raf = requestAnimationFrame(loop);
  }

  function draw() {
    const cv = RP.cv,
      dpr = window.devicePixelRatio || 1,
      W = cv.clientWidth,
      H = cv.clientHeight;
    if (!W || !H) return;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) (cv.width = Math.round(W * dpr)), (cv.height = Math.round(H * dpr));
    const g = cv.getContext("2d");
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    const AX = 66,
      BT = 22,
      PW = W - AX,
      PH = H - BT;
    const N = RP.N;
    const ended = RP.phase === "end";
    /* a la fin : on montre aussi la suite, estompee */
    const lastShown = ended ? Math.min(RP.bars.length - 1, RP.endAt + Math.floor(N * 0.35)) : RP.i;
    const end = lastShown,
      from = Math.max(0, end - N + 1 + (ended ? 0 : 4));
    const live = !ended && RP.phase === "play";
    const vis = [];
    for (let k = from; k <= end; k++) {
      let b = RP.bars[k];
      if (k === RP.i && live) {
        const [p, hi, lo] = pathIn(b, RP.t);
        b = [b[0], b[1], hi, lo, p];
      }
      vis.push(b);
    }
    let lo = Infinity,
      hi = -Infinity;
    for (const b of vis) (lo = Math.min(lo, b[3])), (hi = Math.max(hi, b[2]));
    for (const x of RP.exits) {
      const lv = exitLevel(x);
      if (lv > 0 && !x.hit) (lo = Math.min(lo, lv)), (hi = Math.max(hi, lv));
    }
    if (!(hi > lo)) (hi = lo * 1.01 + 1e-12), (lo = lo * 0.99);
    const pad = (hi - lo) * 0.08;
    (lo -= pad), (hi += pad);
    const cw = PW / N,
      X = (k) => (k - from) * cw + cw / 2,
      Y = (p) => 8 + (1 - (p - lo) / (hi - lo)) * (PH - 16);
    const mc = (p) => (RP.supply > 0 ? money(p * RP.supply) : "$" + p.toPrecision(3));
    g.font = "10.5px Geist, system-ui, sans-serif";
    g.textBaseline = "middle";
    /* grille et axe */
    for (let k = 0; k <= 4; k++) {
      const p = lo + ((hi - lo) * k) / 4,
        y = Math.round(Y(p)) + 0.5;
      g.strokeStyle = "rgba(255,255,255,.045)";
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(PW, y);
      g.stroke();
      g.fillStyle = "#6a707f";
      if (Math.abs(y - Y(RP.px)) > 14) g.fillText(mc(p), PW + 8, y);
    }
    const every = Math.max(1, Math.round(90 / cw));
    g.fillStyle = "#4e535e";
    g.textAlign = "center";
    for (let k = from; k <= end; k++) {
      if ((k - from) % every) continue;
      const d = new Date(RP.bars[k][0]);
      g.fillText(String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"), X(k), H - 10);
    }
    g.textAlign = "left";
    /* le futur cache pendant le choix du depart */
    if (RP.phase === "pick") {
      const x0 = X(RP.i) + cw / 2;
      g.fillStyle = "rgba(82,111,255,.06)";
      g.fillRect(x0, 0, PW - x0, PH);
      g.strokeStyle = "rgba(82,111,255,.5)";
      g.setLineDash([3, 3]);
      g.beginPath();
      g.moveTo(Math.round(x0) + 0.5, 0);
      g.lineTo(Math.round(x0) + 0.5, PH);
      g.stroke();
      g.setLineDash([]);
    }
    /* bougies */
    vis.forEach((b, j) => {
      const k = from + j,
        [, o, h, l, c] = b,
        after = ended && k > RP.endAt,
        up = c >= o,
        x = X(k);
      g.globalAlpha = after ? 0.28 : 1;
      g.strokeStyle = g.fillStyle = up ? "#6fdc90" : "#ff007b";
      g.beginPath();
      g.moveTo(Math.round(x) + 0.5, Y(h));
      g.lineTo(Math.round(x) + 0.5, Y(l));
      g.stroke();
      const y1 = Y(Math.max(o, c)),
        y2 = Y(Math.min(o, c));
      g.fillRect(x - Math.max(1, cw * 0.32), y1, Math.max(2, cw * 0.64), Math.max(1, y2 - y1));
    });
    g.globalAlpha = 1;
    if (ended && RP.endAt < end) {
      const x = X(RP.endAt) + cw / 2;
      g.strokeStyle = "rgba(255,255,255,.25)";
      g.setLineDash([2, 4]);
      g.beginPath();
      g.moveTo(Math.round(x) + 0.5, 0);
      g.lineTo(Math.round(x) + 0.5, PH);
      g.stroke();
      g.setLineDash([]);
    }
    const hline = (p, col, txt, dash) => {
      if (!(p > lo && p < hi)) return;
      const y = Math.round(Y(p)) + 0.5;
      g.strokeStyle = col;
      g.setLineDash(dash || [4, 4]);
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(PW, y);
      g.stroke();
      g.setLineDash([]);
      g.font = "600 10px Geist, system-ui, sans-serif";
      const w = g.measureText(txt).width + 10;
      g.fillStyle = col;
      g.fillRect(4, y - 8, w, 16);
      g.fillStyle = "#0b0b0d";
      g.fillText(txt, 9, y);
      g.font = "10.5px Geist, system-ui, sans-serif";
    };
    if (RP.tokens > 0) hline(avgPx(), "#526fff", "avg " + mc(avgPx()));
    for (const x of RP.exits) !x.hit && hline(exitLevel(x), x.k === "tp" ? "#6fdc90" : "#ff007b", (x.k === "tp" ? "TP +" : "SL −") + x.v + "% · " + x.s + "%");
    /* prix courant, etiquette sur l'axe */
    if (!ended || RP.endAt === RP.i) {
      const p = RP.px,
        y = Math.round(Y(p)) + 0.5,
        up = p >= RP.bars[RP.i][1];
      g.strokeStyle = "rgba(221,225,233,.35)";
      g.setLineDash([1, 3]);
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(PW, y);
      g.stroke();
      g.setLineDash([]);
      g.fillStyle = up ? "#6fdc90" : "#ff007b";
      g.fillRect(PW + 2, y - 9, AX - 4, 18);
      g.fillStyle = "#0b0b0d";
      g.font = "600 10.5px Geist, system-ui, sans-serif";
      g.fillText(mc(p), PW + 7, y);
      g.font = "10.5px Geist, system-ui, sans-serif";
    }
    /* achats et ventes */
    for (const f of RP.fills) {
      if (f.i < from || f.i > end) continue;
      const x = X(f.i),
        y = Y(f.px),
        buy = f.side === "buy";
      g.fillStyle = buy ? "#6fdc90" : "#ff007b";
      g.beginPath();
      g.arc(x, y, 6, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "#0b0b0d";
      g.lineWidth = 1.5;
      g.stroke();
      g.lineWidth = 1;
      g.fillStyle = "#0b0b0d";
      g.font = "700 8px Geist, system-ui, sans-serif";
      g.textAlign = "center";
      g.fillText(buy ? "B" : "S", x, y + 0.5);
      g.textAlign = "left";
      g.font = "10.5px Geist, system-ui, sans-serif";
    }
    /* reticule */
    const hv = RP.hover;
    if (hv && hv.x < PW && hv.y < PH) {
      const k = Math.max(from, Math.min(end, from + Math.floor(hv.x / cw)));
      const b = vis[k - from];
      g.strokeStyle = "rgba(255,255,255,.18)";
      g.setLineDash([3, 3]);
      g.beginPath();
      g.moveTo(Math.round(X(k)) + 0.5, 0);
      g.lineTo(Math.round(X(k)) + 0.5, PH);
      g.moveTo(0, Math.round(hv.y) + 0.5);
      g.lineTo(PW, Math.round(hv.y) + 0.5);
      g.stroke();
      g.setLineDash([]);
      const p = lo + (1 - (hv.y - 8) / (PH - 16)) * (hi - lo);
      g.fillStyle = "#2e303a";
      g.fillRect(PW + 2, hv.y - 9, AX - 4, 18);
      g.fillStyle = "#dde1e9";
      g.fillText(mc(p), PW + 7, hv.y);
      if (b) {
        const t = "O " + mc(b[1]) + "   H " + mc(b[2]) + "   L " + mc(b[3]) + "   C " + mc(b[4]);
        g.fillStyle = "rgba(16,16,17,.85)";
        g.fillRect(6, 6, g.measureText(t).width + 14, 20);
        g.fillStyle = b[4] >= b[1] ? "#6fdc90" : "#ff007b";
        g.fillText(t, 13, 16);
      }
    }
  }

  X.hooks.replay = openReplay;
})();
