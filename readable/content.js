!(function () {
  "use strict";
  if (window.__PAPR_LOADED) return;
  window.__PAPR_LOADED = !0;
  const e = window.__PAPR_ENGINE;
  /* Les nouvelles fonctions (extras.js) se branchent ici : sections et cartes des
     reglages, crochets de rendu, rejeu. */
  const BX$ = (window.__BLANKS_X = window.__BLANKS_X || { hooks: {}, cards: "" });
  /* Le rendu repasse toutes les 600 ms et reecrivait des textes identiques : chaque
     ecriture remplace le noeud texte sous la souris, et Chrome perd alors le curseur
     main jusqu'au prochain mouvement. Ecrire le meme texte ne fait plus rien
     (seulement pour un element qui ne contient deja que ce texte). */
  try {
    const TC = Object.getOwnPropertyDescriptor(Node.prototype, "textContent");
    TC &&
      TC.set &&
      Object.defineProperty(Node.prototype, "textContent", {
        configurable: !0,
        enumerable: TC.enumerable,
        get: TC.get,
        set(v) {
          if (1 === this.nodeType && 1 === this.childNodes.length && 3 === this.firstChild.nodeType && this.firstChild.data === (null == v ? "" : String(v))) return;
          TC.set.call(this, v);
        },
      });
  } catch (e) {}
  function t(e) {
    const t = e || ("function" == typeof d ? d() : "SOL");
    return "ETH" === t
      ? '<svg class="solico" viewBox="0 0 256 417" xmlns="http://www.w3.org/2000/svg"><path fill="#8A92B2" d="M127.9 0 125 9.5v276.6l2.9 2.9 127.9-75.6z"/><path fill="#62688F" d="M127.9 0 0 213.4l127.9 75.6V154.2z"/><path fill="#8A92B2" d="M127.9 312.2l-1.6 2v98.6l1.6 4.7L256 237.6z"/><path fill="#62688F" d="M127.9 417.5V312.2L0 237.6z"/><path fill="#454A75" d="M127.9 289l127.9-75.6-127.9-58.2z"/><path fill="#8A92B2" d="M0 213.4 127.9 289V155.2z"/></svg>'
      : "BNB" === t
        ? '<svg class="solico" viewBox="0 0 126 126" xmlns="http://www.w3.org/2000/svg"><path fill="#F3BA2F" d="M38.9 53.2 63 29.1l24.1 24.1 14-14L63 1 24.9 39.1l14 14.1zM1 63l14-14 14 14-14 14L1 63zm37.9 9.8L63 96.9l24.1-24.1 14 14L63 125 24.9 86.9l14-14.1zM97 63l14-14 14 14-14 14-14-14zm-19.8 0L63 48.8 52.5 59.3l-1.2 1.2-2.5 2.5L63 77.2 77.2 63z"/></svg>'
        : '<svg class="ic solico" viewBox="0 0 16 16"><use href="#i-sol"/></svg>';
  }
  const s = (chrome.runtime.getManifest && chrome.runtime.getManifest().version) || "?";
  let n = null,
    a = {},
    o = [],
    l = 0,
    i = { SOL: 0, ETH: 0, BNB: 0 },
    r = "solana",
    c = "mint";
  const d = () => e.assetOf(r),
    p = (e) => ((e && e.asset) || "SOL") === d();
  function u() {
    if (!n) return 0;
    const e = d();
    return "SOL" === e ? n.balanceSol || 0 : (n.balances && n.balances[e]) || 0;
  }
  let h,
    m = null,
    v = !1,
    f = null,
    y = {},
    g = !1,
    b = !1,
    k = null,
    w = null,
    x = { x: 16, y: 96, w: 348, h: 0, collapsed: !1, tab: "trade" },
    S = !1,
    C = 0;
  function L(e) {
    (Object.assign(x, e), (C = Date.now()), W({ cmd: "ui", ui: e }));
  }
  function q() {
    !n ||
      !n.ui ||
      S ||
      Date.now() - C < 1500 ||
      (Object.assign(x, n.ui),
      (function () {
        const e = y.wrap;
        if (!e) return;
        ((e.style.left = x.x + "px"),
          (e.style.top = x.y + "px"),
          (e.style.width = x.w + "px"),
          M(e),
          e.classList.toggle("collapsed", !!x.collapsed));
      })());
  }
  function M(e) {
    const t = +x.h || 0;
    (e.classList.toggle("sized", t > 0), (e.style.height = ""), (e.style.minHeight = t > 0 ? t + "px" : ""));
  }
  const E = () => (n && n.settings.currency) || "SOL";
  let A = { addr: null, p: null, ts: 0 };
  const $ = () => {
      const e = m ? a[m] : null;
      return e ? ((A = { addr: m, p: e, ts: Date.now() }), e) : A.addr === m && A.p && Date.now() - A.ts < 3e4 ? A.p : null;
    },
    T = () => {
      const t = $();
      return t ? e.marketState(t, l, r) : null;
    },
    B = () => {
      const e = $();
      return (e && n && n.positions[e.baseToken.address]) || null;
    };
  let P = 0;
  function H(t) {
    if (!(g && n && m && t > 0)) return;
    const s = a[m] || (A.addr === m ? A.p : null);
    if (!s) return;
    const o = parseFloat(s.priceUsd);
    if (!(o > 0) || Math.abs(t / o - 1) < 1e-9) return;
    const i = Object.assign({}, s, { priceUsd: String(t) });
    (l > 0 && (i.priceNative = String(t / l)), (a[m] = i), (A = { addr: m, p: i, ts: Date.now() }), (O = t));
    try {
      !(function () {
        if (!g || !n || S || !y.wrap) return;
        if (!Y()) return;
        Hs = performance.now();
        const t = $(),
          s = T(),
          o = B();
        if (y.card && y.pcbal && os().on) {
          let t = 0;
          for (const s in n.positions) {
            const o = n.positions[s],
              i = a[o.pair];
            if (!p(o)) continue;
            const c = i ? e.marketState(i, l, r) : null;
            c && o.tokens > 0 && (t += e.exitValue(c, o.tokens, n.settings));
          }
          const s = Ks(t);
          Ps(s.total, s.pnl, s.pct, s.pnl >= 0 ? "up" : "down", os());
        }
        if (!m || !t) return;
        if ((As(y.px, te(parseFloat(t.priceUsd))), o && s && o.tokens > 0)) {
          const a = e.exitValue(s, o.tokens, n.settings),
            i = a - o.costSol,
            r = o.costSol > 0 ? 100 * (a / o.costSol - 1) : 0;
          (As(y.hdpnl, (i >= 0 ? "+" : "") + oe(i, { unit: !1 }) + " · " + ce(r, 1)),
            $s(y.hdpnl, "pill hdpnl " + (i >= 0 ? "up" : "down")));
          const c = o.returnedSol + a - o.investedSol;
          ((k = c),
            As(y.bx.pnl, (c >= 0 ? "+" : "") + (x.posUsd && l > 0 ? ae(c * l) : ne(c, 3))),
            $s(y.bx.pnl, "v bxpnl " + (c >= 0 ? "up" : "down")),
            pnlPct(c, o.investedSol),
            y.sellrest &&
              (As(Ts(y.sellrest), oe(a, { d: 2, unit: !1 })),
              As(y.sellrest.__pre || (y.sellrest.__pre = Fs(y.sellrest)), ie(o.tokens)),
              As(y.sellrest.__suf || (y.sellrest.__suf = _s(y.sellrest)), " " + t.baseToken.symbol)));
        } else (o && o.tokens > 0) || (As(y.hdpnl, oe(u(), { d: 3 })), $s(y.hdpnl, "pill hdpnl"));
      })();
    } catch (e) {}
    (V(),
      P ||
        (P = requestAnimationFrame(() => {
          P = 0;
          try {
            zs();
          } catch (e) {}
        })));
  }
  const F = 100;
  let _ = 0,
    O = 0;
  function V(e) {
    if (!(m && O > 0)) return;
    const t = Date.now();
    (!e && t - _ < F) || ((_ = t), W({ cmd: "live", pair: m, px: O }));
  }
  function N() {
    const e = $();
    return e && e.baseToken ? e.baseToken.address : null;
  }
  function z() {
    const e = Ce("Price");
    return (function (e) {
      return (
        String(e || "")
          .replace(/[^0-9]/g, "")
          .replace(/^0+/, "").length < 3
      );
    })(e)
      ? null
      : be(e);
  }
  window.addEventListener("message", (e) => {
    const t = e.data;
    t &&
      "PAPR-CHART" === t.source &&
      ("user" !== t.type ? "tick" === t.type && ((t.mint && m && t.mint !== m && t.mint !== N()) || H(t.priceUsd)) : Nn(t.user));
  });
  let D = null,
    R = null,
    U = null;
  function j(e) {
    (D && D.disconnect(), (R = e));
    const t = e.parentElement || e;
    let s = 0;
    ((D = new MutationObserver(() => {
      const e = performance.now();
      if (e - s < 1) return;
      s = e;
      const t = z();
      t > 0 && H(t);
    })),
      D.observe(t, { childList: !0, characterData: !0, subtree: !0 }));
  }
  let Z = 0;
  function I() {
    f = null;
    const e = Math.min(5e3, 400 * Math.pow(1.6, Z++));
    setTimeout(() => {
      (G(), W({ cmd: "hello", pair: m }));
    }, e);
  }
  function G() {
    try {
      f = chrome.runtime.connect({ name: "papr" });
    } catch (e) {
      return void I();
    }
    ((Z = 0),
      f.onMessage.addListener((e) => {
        try {
          if ("sync" === e.type)
            ((n = e.state),
              (a = e.quotes || {}),
              e.px ? (i = Object.assign(i, e.px)) : e.solUsd && (i.SOL = e.solUsd),
              (l = i[d()] || 0),
              (o = e.unresolved || []),
              (w = e.dbg || null),
              q(),
              vt(),
              g
                ? (zs(),
                  (function () {
                    if (bs || !n || !n.ui || !n.ui.upd || n.ui.upd.seen || n.ui.upd.to !== s || !y.toast) return;
                    ((bs = !0), Yt("Blanks " + s + " installed · click for what's new", "good"), y.toast.classList.add("link"));
                    const e = () => {
                      (y.toast.removeEventListener("click", e), y.toast.classList.remove("link", "on"), Rt("news"));
                    };
                    (y.toast.addEventListener("click", e),
                      setTimeout(() => {
                        (y.toast.removeEventListener("click", e), y.toast.classList.remove("link"));
                      }, 8e3),
                      clearTimeout(Kt),
                      (Kt = setTimeout(() => y.toast.classList.remove("on"), 8e3)),
                      L({ upd: Object.assign({}, n.ui.upd, { seen: !0 }) }));
                  })())
                : b ||
                  ((b = !0),
                  (async function () {
                    const e = document.createElement("div");
                    ((e.id = "papr-host"),
                      (e.style.cssText = "position:fixed;inset:0;width:0;height:0;z-index:2147483000"),
                      (e.dataset.v = s),
                      document.documentElement.appendChild(e),
                      (h = e.attachShadow({ mode: "open" })));
                    let a = "",
                      o = "";
                    try {
                      o = chrome.runtime.getURL("panel.css");
                    } catch (e) {
                      o = "";
                    }
                    for (let e = 0; e < 2 && o && !a; e++)
                      try {
                        a = await fetch(o).then((e) => (e.ok ? e.text() : ""));
                      } catch (e) {
                        await new Promise((e) => setTimeout(e, 400));
                      }
                    if (!o || !chrome.runtime || !chrome.runtime.id)
                      return (console.info("[Blanks] extension reloaded — refresh this tab (F5) to load the new version"), void e.remove());
                    const l = document.createElement("style");
                    ((l.textContent = a), h.appendChild(l));
                    const i = document.createElement("div");
                    ((i.style.cssText = "position:absolute;width:0;height:0;overflow:hidden"), (i.innerHTML = wt), h.appendChild(i));
                    try {
                      const t = a.match(/@font-face\s*\{[^}]*remixicon[^}]*\}/i);
                      if (t && !document.getElementById("papr-ri")) {
                        const e = document.createElement("style");
                        ((e.id = "papr-ri"), (e.textContent = t[0]), document.head.appendChild(e));
                      }
                      document.fonts &&
                        document.fonts.load &&
                        document.fonts
                          .load("16px remixicon")
                          .then(() => {
                            e.classList.toggle("no-ri", !document.fonts.check("16px remixicon"));
                          })
                          .catch(() => e.classList.add("no-ri"));
                    } catch (t) {
                      e.classList.add("no-ri");
                    }
                    if (!a) {
                      const e = document.createElement("link");
                      ((e.rel = "stylesheet"),
                        (e.href = o),
                        h.appendChild(e),
                        console.info("[Blanks] panel.css loaded via <link> fallback"));
                    }
                    const r = document.createElement("div");
                    ((r.className = "wrap" + (x.collapsed ? " collapsed" : "")),
                      (r.dataset.theme = (n && n.settings.theme) || "padre"),
                      (r.dataset.skin = Ae()),
                      (r.style.left = x.x + "px"),
                      (r.style.top = x.y + "px"),
                      (r.style.width = x.w + "px"),
                      M(r),
                      (r.innerHTML = `\n      <div class="hd hdr">\n        <div class="grip"></div>\n        <div class="hgl hl">\n          <div class="ico hb hotk" data-tip="Trading settings — fees of each preset, delay, platform fee">${Ct}</div>\n          <div class="pslots presets">\n            <div class="pslot pb" data-s="0" data-tip="Preset 1 — its own amounts and fees">P1</div>\n            <div class="pslot pb" data-s="1" data-tip="Preset 2 — its own amounts and fees">P2</div>\n            <div class="pslot pb" data-s="2" data-tip="Preset 3 — its own amounts and fees">P3</div>\n          </div>\n          <div class="ico hb pedit" data-side="buy" data-tip="Edit the amounts of the buttons, buy and sell">${Lt}</div>\n          <div class="ico hb gear" data-tip="Settings — stats, history, look, tracking">${Mt}</div>\n          <div class="ico hb dly" data-tip="Execution delay and fees">${Et}</div>\n        </div>\n        <div class="tick">BLANKS</div>\n        <div class="px"></div>\n        <div class="spacer"></div>\n        <div class="pill hdpnl">—</div>\n        <div class="ico cardbtn" title="Balance card">▣</div>\n        <div class="ico curbtn" title="native / $">◎</div>\n        <div class="hgr hl">\n          <div class="wpill wbtn" title="Paper wallets">${$t}<span class="wasset">SOL</span></div>\n          <div class="ico hb xclose" data-tip="Close the panel — the Blanks button at the bottom right brings it back">${At}</div>\n        </div>\n        <div class="ico fold" title="Collapse">&#9662;</div>\n      </div>\n      <hr class="hsep">\n      <div class="tabs">\n        <div class="tab" data-t="trade">Trade</div>\n        <div class="tab" data-t="orders">Orders</div>\n        <div class="tab" data-t="stats">Stats</div>\n        <div class="tab" data-t="log">History</div>\n        <div class="tab" data-t="track">Track</div>\n      </div>\n      <div class="body">\n        <div class="pane main" data-p="trade"></div>\n        <div class="pane" data-p="orders"></div>\n        <div class="pane" data-p="stats"></div>\n        <div class="pane" data-p="log"></div>\n        <div class="pane" data-p="track"></div>\n      </div>\n      <div class="resize"></div>\n      <div class="toast"></div>`),
                      h.appendChild(r));
                    const c = document.createElement("div");
                    ((c.className = "pnlcard"),
                      (c.innerHTML = `\n      <div class="pcbg"></div>\n      <img class="pcimg" src="https://trade.padre.gg/pnlTrackerBg.png" alt="">\n      <div class="pcveil"></div>\n      <div class="pcin">\n        <div class="pcr1"><span class="pclbl">BALANCE</span><span class="pcpct">+0.00%</span></div>\n        <div class="pcr2"><span class="pcbal">0</span><span class="pcpnl">+0.00</span></div>\n        <div class="pcr3"><span class="pcusd">$0</span><span class="pcpnlusd">+$0</span></div>\n      </div>\n      <div class="pcctl pcx" title="Hide the card">×</div>\n      <div class="pcctl pcgear" title="Card settings"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg></div>\n      ${["n", "s", "e", "w", "ne", "nw", "se", "sw"].map((e) => '<div class="pcrz" data-d="' + e + '"></div>').join("")}`),
                      h.appendChild(c),
                      (y.card = c),
                      (c.querySelector(".pcx").onclick = (e) => {
                        (e.stopPropagation(), ls({ on: !1 }));
                      }),
                      (c.querySelector(".pcgear").onclick = (e) => {
                        (e.stopPropagation(), Rt("card"));
                      }),
                      c.querySelectorAll(".pcrz").forEach((e) => Gs(e)));
                    const p = document.createElement("div");
                    ((p.className = "launcher"),
                      (p.title = "Blanks"),
                      (p.innerHTML =
                        '<svg viewBox="0 0 128 128" aria-hidden="true"><line x1="64" y1="22" x2="64" y2="106" stroke="currentColor" stroke-width="12" stroke-linecap="round"/><rect x="38" y="42" width="52" height="46" rx="9" fill="currentColor"/><rect x="51" y="55" width="26" height="20" rx="4" fill="#1fbf6f"/></svg>'),
                      h.appendChild(p),
                      (y.launch = p));
                    const u = document.createElement("div");
                    ((u.className = "lmenu"),
                      (u.innerHTML =
                        '<div class="lhd">Blanks</div>\n      <div class="li lpanel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v5"/></svg><span>Trade panel<small class="lpsub">Buy, sell, exit orders</small></span></div>\n      <div class="li lset"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg><span>Settings<small>Look, quick buy, fees, wallet</small></span></div>\n      <div class="li lrep"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M10 9l5 3-5 3z"/></svg><span>Replay this chart<small class="lrsub">Trade its past, sped up</small></span></div>'),
                      h.appendChild(u),
                      (y.lmenu = u));
                    const f = (e) => {
                      (u.classList.toggle("on", e), p.classList.toggle("on", e));
                    };
                    (p.addEventListener("click", (e) => {
                      (e.stopPropagation(), f(!u.classList.contains("on")));
                    }),
                      (u.querySelector(".lpanel").onclick = () => {
                        m && (f(!1), (v = !v), zs());
                      }),
                      (u.querySelector(".lset").onclick = () => {
                        (f(!1), Rt());
                      }),
                      (u.querySelector(".lrep").onclick = () => {
                        if (!m) return;
                        (f(!1), BX$.hooks.replay && BX$.hooks.replay());
                      }),
                      h.addEventListener("click", (e) => {
                        u.contains(e.target) || e.target === p || f(!1);
                      }),
                      window.addEventListener(
                        "keydown",
                        (e) => {
                          "Escape" === e.key && f(!1);
                        },
                        !0,
                      ),
                      h.addEventListener(
                        "keydown",
                        (e) => {
                          "Escape" === e.key && f(!1);
                        },
                        !0,
                      ),
                      document.addEventListener("click", () => f(!1)),
                      (y.pcbg = c.querySelector(".pcbg")),
                      (y.pcimg = c.querySelector(".pcimg")),
                      (y.pcimg.onerror = () => {
                        y.pcimg.style.display = "none";
                      }),
                      (y.pcpct = c.querySelector(".pcpct")),
                      (y.pcbal = c.querySelector(".pcbal")),
                      (y.pcpnl = c.querySelector(".pcpnl")),
                      (y.pcr3 = c.querySelector(".pcr3")),
                      (y.pcusd = c.querySelector(".pcusd")),
                      (y.pcpnlusd = c.querySelector(".pcpnlusd")),
                      jt(c, c, "card"),
                      (y.wrap = r),
                      Te(),
                      (y.tick = r.querySelector(".tick")),
                      (y.px = r.querySelector(".px")),
                      (y.hdpnl = r.querySelector(".hdpnl")),
                      (y.toast = r.querySelector(".toast")),
                      (y.curbtn = r.querySelector(".curbtn")),
                      (r.querySelector(".cardbtn").onclick = () => {
                        const e = !(n.settings.card && n.settings.card.on);
                        ((n.settings.card = Object.assign({}, n.settings.card, { on: e })),
                          W({ cmd: "settings", settings: { card: n.settings.card } }),
                          zs());
                      }),
                      (y.hotk = r.querySelector(".hotk")),
                      (y.dly = r.querySelector(".dly")),
                      (y.wpill = r.querySelector(".wpill")),
                      (y.hotk.onclick = (e) => {
                        (e.stopPropagation(), Gt("buy"));
                      }),
                      (y.dly.onclick = (e) => {
                        (e.stopPropagation(), y.fees && y.fees.classList.contains("on") ? Wt() : Gt("buy"));
                      }),
                      (y.wpill.onclick = () => Rt("wallet")),
                      (r.querySelector(".xclose").onclick = () => {
                        ((v = !0), zs());
                      }),
                      (y.tabs = [...r.querySelectorAll(".tab")]),
                      (y.panes = {}),
                      r.querySelectorAll(".pane").forEach((e) => (y.panes[e.dataset.p] = e)),
                      y.panes.stats.addEventListener("mouseover", pn),
                      y.panes.stats.addEventListener("mouseleave", pn),
                      y.tabs.forEach(
                        (e) =>
                          (e.onclick = () =>
                            (function (e) {
                              (L({ tab: e }), zs());
                            })(e.dataset.t)),
                      ),
                      (r.querySelector(".gear").onclick = () => Rt()),
                      (r.querySelector(".fold").onclick = () => {
                        (L({ collapsed: !x.collapsed }), r.classList.toggle("collapsed", x.collapsed));
                      }),
                      (y.curbtn.onclick = () => {
                        const e = "SOL" === E() ? "USD" : "SOL";
                        ((n.settings.currency = e), W({ cmd: "settings", settings: { currency: e } }), zs());
                      }),
                      jt(r, r.querySelector(".hd")),
                      (function (e, t) {
                        let s = 0,
                          n = 0,
                          a = 0,
                          o = 0,
                          l = 0,
                          i = 0,
                          r = !1,
                          c = 0,
                          d = null,
                          p = 0;
                        const u = () => {
                          ((c = 0),
                            (e.style.width = l + "px"),
                            e.classList.toggle("sized", i > 0),
                            (e.style.height = ""),
                            (e.style.minHeight = i > 0 ? i + "px" : ""),
                            nn());
                        };
                        (t.addEventListener("pointerdown", (c) => {
                          if (0 !== c.button) return;
                          ((r = !0),
                            (S = !0),
                            (d = c.pointerId),
                            (s = c.clientX),
                            (n = c.clientY),
                            (a = e.offsetWidth),
                            (o = e.offsetHeight),
                            (l = a),
                            (i = +x.h || 0));
                          const u = e.style.minHeight,
                            h = e.classList.contains("sized"),
                            m = [y.buychips, y.sellchips].map((e) => e && e.classList.contains("one"));
                          (e.classList.remove("sized"),
                            (e.style.minHeight = ""),
                            [y.buychips, y.sellchips].forEach((e) => e && e.classList.add("one")),
                            (p = e.offsetHeight),
                            e.classList.toggle("sized", h),
                            (e.style.minHeight = u),
                            [y.buychips, y.sellchips].forEach((e, t) => e && e.classList.toggle("one", !!m[t])));
                          try {
                            t.setPointerCapture(d);
                          } catch (e) {}
                          (c.preventDefault(), c.stopPropagation());
                        }),
                          t.addEventListener("pointermove", (e) => {
                            if (!r) return;
                            l = Math.max(310, Math.min(640, a + e.clientX - s));
                            const t = o + e.clientY - n;
                            /* sa hauteur max : deux rangees de boutons de 83 px de chaque cote */
                            const gH = (y.buychips ? y.buychips.offsetHeight : 0) + (y.sellchips ? y.sellchips.offsetHeight : 0);
                            const hMax = Math.min(Math.round(0.94 * window.innerHeight), y.wrap.offsetHeight - gH + 2 * (2 * 83 + 8));
                            ((i = t <= p + 4 ? 0 : Math.min(hMax, t)),
                              c || (c = requestAnimationFrame(u)));
                          }));
                        const h = () => {
                          if (r) {
                            ((r = !1), (S = !1), c && (cancelAnimationFrame(c), (c = 0)));
                            try {
                              t.releasePointerCapture(d);
                            } catch (e) {}
                            ((x.wSet = !0), L({ w: e.offsetWidth, h: i, wSet: !0 }), zs());
                          }
                        };
                        (t.addEventListener("pointerup", h), t.addEventListener("pointercancel", h));
                      })(r, r.querySelector(".resize")),
                      (function () {
                        const e = document.createElement("div");
                        ((e.className = "btip"), h.appendChild(e));
                        let t = null,
                          s = 0;
                        const n = () => {
                            (clearTimeout(s), (t = null), e.classList.remove("on"));
                          },
                          a = (t) => {
                            const s = t.getAttribute("data-tip");
                            if (!s) return;
                            ((e.textContent = s), (e.dataset.skin = Ae() || "terminal"), e.classList.add("on"));
                            const n = t.getBoundingClientRect(),
                              a = e.offsetWidth,
                              o = e.offsetHeight;
                            let l = n.left + n.width / 2 - a / 2,
                              i = n.top - o - 14,
                              r = !1;
                            (i < 0 && ((i = n.bottom + 14), (r = !0)),
                              (l = Math.max(4, Math.min(innerWidth - a - 4, l))),
                              (e.style.left = Math.round(l) + "px"),
                              (e.style.top = Math.round(i) + "px"),
                              e.classList.toggle("below", r));
                          };
                        (h.addEventListener("pointerover", (e) => {
                          let o = e.target && e.target.closest && e.target.closest("[data-tip], .wrap [title], .tsx [title]");
                          (o &&
                            !o.hasAttribute("data-tip") &&
                            (o.setAttribute("data-tip", o.getAttribute("title")), o.removeAttribute("title")),
                            o !== t &&
                              (n(),
                              o &&
                                !S &&
                                ((t = o),
                                (s = setTimeout(() => {
                                  t === o && o.isConnected && a(o);
                                }, 0)))));
                        }),
                          h.addEventListener("pointerout", (e) => {
                            t && !t.contains(e.relatedTarget) && n();
                          }),
                          h.addEventListener("pointerdown", n, !0),
                          window.addEventListener("scroll", n, !0));
                      })(),
                      (function () {
                        y.panes.trade.innerHTML = `\n      <div class="sect sec buysect">\n        <div class="shead lab">\n          <span class="sttl">Buy</span>\n          <div class="ccy curw"><span class="cur" data-c="SOL">${t()}<i class="un">${d()}</i></span><span class="cur" data-c="USD">$ USD</span></div>\n          <span class="pedit" data-side="buy" title="Edit the amounts"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2.2"/><circle cx="10" cy="17" r="2.2"/></svg></span>\n          <div class="spacer"></div>\n          <div class="preview est buyprev"></div>\n          <span class="hbal rt" data-tip="Your paper balance on this chain"><span class="rti"><b class="hbaln"></b><span class="unit buyunit">${t()}</span></span></span>\n          <div class="amt"><input class="buyamt" type="text" inputmode="decimal" placeholder="0.00"></div>\n        </div>\n        <div class="chips pills buychips"></div>\n        <div class="srow"><div class="strip sets buystrip"></div>\n          <span class="exitck" data-tip="Exit strategy — your take profit and stop loss lines are placed with every buy">${xt("i-cb", 14).replace('class="ic"', 'class="ic cb0"')}${xt("i-cb-on", 14).replace('class="ic"', 'class="ic cb1"')}<span class="exl">Exit</span></span></div>\n        <div class="exits"></div>\n      </div>\n      <div class="sect sec sellcard">\n        <div class="shead lab">\n          <span class="sttl selltitle">Sell %</span><span class="swapmode smode" data-tip="Sell by % of the position, or by amount">${St("i-swap", "arrow-left-right-line", 12)}</span>\n          <span class="pedit" data-side="sell" title="Edit the amounts"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2.2"/><circle cx="10" cy="17" r="2.2"/></svg></span>\n          <div class="spacer"></div>\n          <div class="preview est sellprev"></div>\n          <span class="sbal rt sellrest" data-tip="Tokens you hold and what they are worth now"></span>\n        </div>\n        <div class="chips pills sellchips"></div>\n        <div class="srow">\n          <div class="strip sets sellstrip"></div>\n          <span class="sellinit"><span class="si sinit" data-tip="Sell just enough to get back what you put in — the rest rides for free">Sell Init.</span></span>\n        </div>\n      </div>\n      <div class="foot pos">\n        <div class="restbar" style="display:none"><i></i></div>\n        <div class="boxes posg">\n          <div class="box ps" data-tip="Invested — what you put into this token. Click to switch SOL / $"><div class="v bxin">—</div>${t()}</div>\n          <div class="box ps" data-tip="Sold — what you took out of it. Click to switch SOL / $"><div class="v bxout">—</div>${t()}</div>\n          <div class="box ps" data-tip="Remaining — share of your tokens still held"><div class="v bxrest">—</div></div>\n          <div class="box ps" data-tip="Total PNL — what you sold plus what is left at the current price, minus what you put in. Click to switch SOL / $"><div class="v bxpnl">—</div>${t()}<span class="bxpct"></span></div>\n        </div>\n      </div>`;
                        const e = y.panes.trade;
                        ((y.buyamt = e.querySelector(".buyamt")),
                          (y.buyunit = e.querySelector(".buyunit")),
                          (y.buyprev = e.querySelector(".buyprev")),
                          (y.buychips = e.querySelector(".buychips")),
                          (y.buystrip = e.querySelector(".buystrip")),
                          (y.exitck = e.querySelector(".exitck")),
                          (y.exits = e.querySelector(".exits")),
                          (y.exitck.onclick = () => {
                            const e = !n.settings.exitOn;
                            n.settings.exitOn = e;
                            const t = { exitOn: e };
                            (e && !Array.isArray(n.settings.exits) && (t.exits = n.settings.exits = ve.map((e) => Object.assign({}, e))),
                              W({ cmd: "settings", settings: t }),
                              zs());
                          }),
                          (y.sellchips = e.querySelector(".sellchips")),
                          (y.sellstrip = e.querySelector(".sellstrip")),
                          (y.sellprev = e.querySelector(".sellprev")),
                          (y.sellrest = e.querySelector(".sellrest")),
                          (y.selltitle = e.querySelector(".selltitle")),
                          (e.querySelector(".swapmode").onclick = () => {
                            ((n.settings.sellMode = "sol" === n.settings.sellMode ? "pct" : "sol"),
                              W({ cmd: "settings", settings: { sellMode: n.settings.sellMode } }),
                              zs());
                          }),
                          (y.sellinit = e.querySelector(".sellinit")),
                          (y.sellinit.querySelector(".si").onclick = () => {
                            const e = Qs(B(), T());
                            if (!e) return Yt("initial already recovered");
                            ye(e);
                          }),
                          (y.sellinit.querySelector(".si").onmouseenter = () => {
                            const e = Qs(B(), T());
                            e && Js(e);
                          }),
                          (y.sellinit.querySelector(".si").onmouseleave = () => Js(1)),
                          (y.sellcard = e.querySelector(".sellcard")),
                          (y.ccy = e.querySelectorAll(".ccy span")),
                          (y.bx = {
                            in: e.querySelector(".bxin"),
                            out: e.querySelector(".bxout"),
                            rest: e.querySelector(".bxrest"),
                            pnl: e.querySelector(".bxpnl"),
                            pct: e.querySelector(".bxpct"),
                          }),
                          (y.posg = e.querySelector(".posg")),
                          (y.posg.onclick = () => {
                            (L({ posUsd: !x.posUsd }), zs());
                          }),
                          (y.restbar = e.querySelector(".restbar")),
                          (y.restfill = e.querySelector(".restbar i")),
                          (y.pslots = y.wrap.querySelectorAll(".pslot")),
                          y.pslots.forEach(
                            (e) =>
                              (e.onclick = () => {
                                ((n.settings.slot = +e.dataset.s), W({ cmd: "settings", settings: { slot: n.settings.slot } }), zs());
                              }),
                          ),
                          y.ccy.forEach(
                            (e) =>
                              (e.onclick = () =>
                                (function (e) {
                                  if (!n || n.settings.currency === e) return;
                                  ((n.settings.currency = e), W({ cmd: "settings", settings: { currency: e } }), zs());
                                })(e.dataset.c)),
                          ),
                          y.wrap.querySelectorAll(".pedit").forEach(
                            (e) =>
                              (e.onclick = () =>
                                (function () {
                                  if (Jt) return void ss();
                                  const e = Zs()[n.settings.slot || 0] || Zs()[0];
                                  ((Jt = { side: "both", buy: e.buy.slice(0, 8).map(Number), sell: e.sell.slice(0, 8).map(Number) }), zs());
                                })()),
                          ),
                          y.buyamt.addEventListener("input", () => Ys()),
                          y.buyamt.addEventListener("keydown", (e) => {
                            ("Enter" === e.key &&
                              (!(function () {
                                const e = me();
                                if (!(e > 0)) return Yt("enter an amount");
                                if (!m) return Yt("no token");
                                V(!0);
                                const t = n.settings.exitOn ? fe() : null;
                                W(t && t.length ? { cmd: "buy", pair: m, amountSol: e, exits: t } : { cmd: "buy", pair: m, amountSol: e });
                              })(),
                              (y.buyamt.value = ""),
                              Ys()),
                              e.stopPropagation());
                          }));
                      })(),
                      (y.panes.orders.innerHTML =
                        sn("tp") +
                        sn("sl") +
                        `\n      <div class="card" data-k="limit">\n        <div class="lbl">Limit Buy <span class="dim2 sym"></span></div>\n        <div class="obody">\n          <div class="orow">\n            <div class="seg"><span data-m="price">$</span><span data-m="mc">MC</span></div>\n            <input class="oin wide" data-f="value" placeholder="0">\n            <span class="olab un">SOL</span>\n            <input class="oin" data-f="amount" placeholder="0.5">\n          </div>\n          <div class="chips limitchips">${[5, 10, 25, 50].map((e) => `<div class="chip" data-d="${e}">-${e}%</div>`).join("")}</div>\n          <div class="preview prev"></div>\n          <button class="btn buy place" style="margin-top:7px">Place Limit</button>\n        </div>\n      </div>\n      <div class="card">\n        <div class="lbl">Active Orders <span class="dim2 ocount">0</span></div>\n        <div class="olist"></div>\n      </div>`),
                      (y.oCards = {}),
                      y.panes.orders.querySelectorAll(".card[data-k]").forEach((e) => {
                        const t = e.dataset.k;
                        ((y.oCards[t] = e),
                          e.querySelectorAll(".seg span").forEach(
                            (e) =>
                              (e.onclick = () => {
                                const s = e.dataset.m;
                                en[t].mode = s;
                                const n = $(),
                                  a = n ? parseFloat(n.priceUsd) : 0,
                                  o = he(n),
                                  l = "tp" === t ? 1.5 : "sl" === t ? 0.75 : 0.9;
                                ((en[t].value =
                                  "pct" === s
                                    ? "tp" === t
                                      ? 50
                                      : 25
                                    : "mc" === s
                                      ? o && a
                                        ? ue(o * a * l)
                                        : ""
                                      : a
                                        ? String(+(a * l).toPrecision(4))
                                        : ""),
                                  zs());
                              }),
                          ),
                          e.querySelectorAll(".oin").forEach((e) => {
                            (e.addEventListener("keydown", (e) => e.stopPropagation()),
                              e.addEventListener("input", () => {
                                ((en[t][e.dataset.f] = "value" === e.dataset.f ? e.value : "" === e.value ? "" : de(e.value)),
                                  ln(B(), T(), $()));
                              }));
                          }),
                          e.querySelectorAll(".limitchips .chip").forEach(
                            (e) =>
                              (e.onclick = () => {
                                const t = $();
                                if (!t) return;
                                const s = parseFloat(t.priceUsd),
                                  n = 1 - parseFloat(e.dataset.d) / 100;
                                ((en.limit.value = "mc" === en.limit.mode ? ue(he(t) * s * n) : String(+(s * n).toPrecision(6))),
                                  ln(B(), T(), t));
                              }),
                          ),
                          (e.querySelector(".place").onclick = () => rn(t, B(), $())));
                      }),
                      (y.olist = y.panes.orders.querySelector(".olist")),
                      (y.ocount = y.panes.orders.querySelector(".ocount")),
                      (function () {
                        const e = document.createElement("div");
                        ((e.className = "smodal"),
                          (e.innerHTML = `\n      <div class="sbox">\n        <div class="shd"><span class="slogo">${zt}</span><span class="stt">Settings</span><span class="sver">v${s}</span>\n          <span class="skey">close<b>esc</b></span><div class="ico sx" title="Close">✕</div></div>\n        <div class="sgrid">\n          <div class="snav">${Ot.map((e, t) => `<div class="sni" data-s="${e.id}"><i>${String(t + 1).padStart(2, "0")}</i>${e.title}</div>`).join("")}\n            <div class="sfoot">Paper trading<br><b>trade-blanks.com</b></div></div>\n          <div class="scont"><div class="shero"><div class="eb"></div><h2></h2><p></p></div><div class="pane on" data-p="set"></div></div>\n        </div>\n      </div>`),
                          h.appendChild(e),
                          (y.smodal = e),
                          (y.panes.set = e.querySelector('.pane[data-p="set"]')),
                          (e.querySelector(".sx").onclick = Ut),
                          e.addEventListener("click", (t) => {
                            t.target === e && Ut();
                          }),
                          e.querySelectorAll(".sni").forEach(
                            (e) =>
                              (e.onclick = () => {
                                ((Vt = e.dataset.s), L({ sec: Vt }), Dt());
                              }),
                          ),
                          e.addEventListener("keydown", (e) => {
                            (e.stopPropagation(), "Escape" === e.key && Ut());
                          }));
                      })(),
                      us(),
                      Dt(),
                      (g = !0),
                      (function () {
                        (clearInterval(U),
                          (U = setInterval(() => {
                            const e = xe("Price");
                            e && e !== R && j(e);
                            const t = z();
                            t > 0 && H(t);
                          }, 1e3)));
                        const e = xe("Price");
                        e && j(e);
                      })(),
                      zs());
                  })().catch((e) => console.warn("[PAPR]", e))),
              Me());
          else if ("backup" === e.type)
            !(function (e) {
              try {
                const t = JSON.stringify({ blanks: 1, papr: 1, at: e.at, version: s, state: e.state }),
                  n = new Blob([t], { type: "application/json" }),
                  a = document.createElement("a");
                ((a.href = URL.createObjectURL(n)),
                  (a.download = "blanks-backup-" + new Date(e.at).toISOString().slice(0, 10) + ".json"),
                  document.body.appendChild(a),
                  a.click(),
                  a.remove(),
                  setTimeout(() => URL.revokeObjectURL(a.href), 4e3),
                  Yt("backup saved", "good"));
              } catch (e) {
                Yt("backup failed", "bad");
              }
            })(e);
          else if ("ticks" === e.type) window.__BLANKS_KILLCAM && window.__BLANKS_KILLCAM.ticks(e.mint, e.ticks);
          else if ("search" === e.type)
            !(function (e) {
              const t =
                  (y.smodal && "track" === Vt && y.smodal.classList.contains("on") && y.smodal.querySelector(".tsetwrap")) || y.panes.track,
                s = t && t.querySelector(".tsug");
              if (!s || e.q !== bn.follow) return;
              const a = ((n.settings.account && n.settings.account.pseudo) || "").toLowerCase(),
                o = (e.users || []).filter(
                  (e) => e.pseudo.toLowerCase() !== a && !kn().some((t) => t.toLowerCase() === e.pseudo.toLowerCase()),
                );
              ((s.innerHTML = o
                .slice(0, 5)
                .map(
                  (e) =>
                    '<div class="th tsu" data-u="' +
                    e.pseudo +
                    '" title="See their stats">' +
                    (e.avatar
                      ? '<img class="tav tavs" src="' + e.avatar + '" alt="">'
                      : '<span class="tav tavs" style="background:' + hn(e.pseudo) + '">' + e.pseudo[0].toUpperCase() + "</span>") +
                    e.pseudo +
                    (e.rank
                      ? '<span class="rk rks' +
                        (e.rank <= 3 ? " rk" + e.rank : "") +
                        '" title="#' +
                        e.rank +
                        ' on the public leaderboard">#' +
                        e.rank +
                        "</span>"
                      : "") +
                    ' <span class="dim2">' +
                    e.fills +
                    '</span><b class="tsadd" data-u="' +
                    e.pseudo +
                    '" title="Follow">+</b></div>',
                )
                .join("")),
                (s.style.display = o.length ? "" : "none"),
                s.querySelectorAll(".tsu").forEach(
                  (e) =>
                    (e.onclick = (t) => {
                      if (t.target.classList.contains("tsadd")) return (W({ cmd: "follow", pseudo: e.dataset.u }), void (bn.follow = ""));
                      Nn(e.dataset.u);
                    }),
                ));
            })(e);
          else if ("ustats" === e.type)
            !(function (e) {
              if (!On || String(e.pseudo || "").toLowerCase() !== On.pseudo.toLowerCase()) return;
              ((On.loading = !1),
                e.err || !e.stats
                  ? (On.err = e.err || "no answer")
                  : ((On.data = e.stats), e.stats.pseudo && (On.pseudo = e.stats.pseudo)));
              In();
            })(e);
          else if ("top" === e.type)
            !(function (e) {
              if (!e || e.period !== Mn.period) return;
              ((Mn.loading = !1),
                (Mn.ts = Date.now()),
                e.err || !e.top ? (Mn.err = e.err || "no answer") : ((Mn.err = null), (Mn.cache[e.period] = e.top)));
              Bn(!0);
            })(e);
          else if ("changelog" === e.type) ((vs = Array.isArray(e.log) ? e.log : []), gs());
          else if ("event" === e.type) {
            const t = !!e.sfx || "wait" === e.tone || /order(s)? (placed|cancelled)/i.test(e.text || "");
            (ct
              ? (function (e) {
                  if (!ct) return;
                  if ("wait" === e.tone) return;
                  const t = ct;
                  ct = null;
                  const s = "bad" === e.tone;
                  (dt(t.b, s ? "err" : "ok", s ? "✗" : "✓"),
                    (function (e, t) {
                      if (!h) return;
                      (pt && pt.isConnected) || ((pt = document.createElement("div")), (pt.className = "qbtoast"), h.appendChild(pt));
                      ((pt.textContent = e),
                        (pt.className = "qbtoast on" + (t ? " " + t : "")),
                        clearTimeout(ut),
                        (ut = setTimeout(() => pt.classList.remove("on"), 3200)));
                    })(e.text, e.tone));
                })(e)
              : t || Yt(e.text, e.tone),
              e.sfx && Es("buy" === e.sfx));
          }
        } catch (e) {
          console.warn("[PAPR] sync", e);
        }
      }),
      f.onDisconnect.addListener(I));
  }
  function W(e) {
    try {
      f && f.postMessage(e);
    } catch (e) {}
  }
  const K = /(^|\.)axiom\.trade$/.test(location.hostname) ? "axiom" : "padre";
  function Y() {
    if (!n || !n.settings) return !1;
    if (!1 === n.settings.enabled) return !1;
    const e = n.settings.sites;
    return !(e && !1 === e[K]);
  }
  function J() {
    const t = e.parseUrl(location.pathname, location.search);
    if (!t) {
      const t = /[?&]chain=([A-Za-z]+)/.exec(location.search),
        s = t && e.slugChain(t[1]);
      return ((r = s || "solana"), (c = "mint"), null);
    }
    return ((r = t.chain), (c = t.kind), t.addr);
  }
  function X(t, s, n) {
    const a = n || "solana",
      o = e.chainInfo(a).evm;
    if ("axiom" === K) {
      if (!o) return s ? location.origin + "/meme/" + s : null;
      const e = "bsc" === a ? "bnb" : "ethereum" === a ? "eth" : a;
      return location.origin + "/token/" + t + "?chain=" + e;
    }
    return o ? (s ? location.origin + "/trade/" + a + "/" + s : null) : location.origin + "/trade/solana/" + t;
  }
  let Q = null;
  const ee = (e) =>
    String(e)
      .split("")
      .map((e) => "₀₁₂₃₄₅₆₇₈₉"[+e])
      .join("");
  function te(e) {
    if (!(e > 0)) return "$0";
    if (e >= 1e3) return "$" + e.toLocaleString("en-US", { maximumFractionDigits: 0 });
    if (e >= 1) return "$" + e.toFixed(3);
    if (e >= 0.001) return "$" + e.toFixed(6).replace(/0+$/, "");
    const t = Math.floor(Math.log10(e));
    return (
      "$0.0" +
      ee(-t - 1) +
      Math.round(e * Math.pow(10, 3 - t))
        .toString()
        .slice(0, 4)
    );
  }
  function se(e) {
    return e > 0
      ? e >= 1e9
        ? "$" + (e / 1e9).toFixed(2) + "B"
        : e >= 1e6
          ? "$" + (e / 1e6).toFixed(2) + "M"
          : e >= 1e3
            ? "$" + (e / 1e3).toFixed(2) + "K"
            : "$" + e.toFixed(0)
      : "—";
  }
  function ne(e, t) {
    const s = Number(e) || 0;
    return (Math.abs(s) >= 100 ? s.toFixed(1) : s.toFixed(void 0 === t ? 4 : t)).replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
  }
  function ae(e) {
    const t = Number(e) || 0,
      s = Math.abs(t);
    return (
      (t < 0 ? "-$" : "$") +
      (s >= 1e3
        ? s.toLocaleString("en-US", { maximumFractionDigits: 0 })
        : s >= 10
          ? s.toFixed(2)
          : s.toFixed(3).replace(/0+$/, "").replace(/\.$/, ""))
    );
  }
  function oe(e, t) {
    const s = t || {};
    return "USD" === E() && l > 0 ? ae(e * l) : ne(e, s.d) + (!1 === s.unit ? "" : " " + d());
  }
  const le = (e) => (Number(e) >= 0 ? "+" : "") + oe(e);
  function ie(e) {
    const t = Number(e) || 0;
    return t >= 1e9
      ? (t / 1e9).toFixed(2) + "B"
      : t >= 1e6
        ? (t / 1e6).toFixed(2) + "M"
        : t >= 1e3
          ? (t / 1e3).toFixed(2) + "K"
          : t.toFixed(2);
  }
  function re(e, t) {
    const s = Number(e) || 0,
      n = Math.abs(s),
      a = t ? (s >= 0 ? "+" : "-") : s < 0 ? "-" : "";
    let o;
    return (
      (o =
        n >= 1e9
          ? (n / 1e9).toFixed(2) + "B"
          : n >= 1e6
            ? (n / 1e6).toFixed(2) + "M"
            : n >= 1e3
              ? (n / 1e3).toFixed(n >= 1e5 ? 0 : 2) + "K"
              : n >= 1
                ? n.toFixed(2)
                : n.toFixed(3)),
      a + "$" + o
    );
  }
  const ce = (e, t) => (Number(e) >= 0 ? "+" : "") + (Number(e) || 0).toFixed(void 0 === t ? 2 : t) + "%",
    de = (e) => parseFloat(String(e).replace(",", ".")),
    pe = (e) => {
      const t = String(null == e ? "" : e)
        .trim()
        .toLowerCase()
        .replace(",", ".")
        .match(/^\$?([\d.]+)\s*([kmb])?$/);
      return t ? parseFloat(t[1]) * ({ k: 1e3, m: 1e6, b: 1e9 }[t[2]] || 1) : NaN;
    },
    ue = (e) =>
      e >= 1e9
        ? +(e / 1e9).toPrecision(3) + "b"
        : e >= 1e6
          ? +(e / 1e6).toPrecision(3) + "m"
          : e >= 1e3
            ? +(e / 1e3).toPrecision(3) + "k"
            : String(Math.round(e)),
    he = (e) => {
      const t = e ? parseFloat(e.priceUsd) : 0,
        s = e ? e.marketCap || e.fdv : 0;
      return t > 0 && s > 0 ? s / t : 0;
    };
  function me() {
    const e = de(y.buyamt.value);
    return e > 0 ? ("USD" === E() && l > 0 ? e / l : e) : 0;
  }
  const ve = [
    { k: "tp", v: 100, s: 50 },
    { k: "sl", v: 30, s: 100 },
  ];
  function fe() {
    return (Array.isArray(n.settings.exits) ? n.settings.exits : ve)
      .filter((e) => e && +e.v > 0 && +e.s > 0 && !("sl" === e.k && +e.v >= 100))
      .slice(0, 6);
  }
  function ye(e) {
    if (!m) return Yt("no token");
    (V(!0), W({ cmd: "sell", pair: m, fraction: e }));
  }
  const ge = "₀₁₂₃₄₅₆₇₈₉";
  function be(e) {
    if (!e) return null;
    let t = String(e).replace(/[$,\s]/g, "");
    const s = t.match(/^-?0\.0([₀-₉]+)(\d+)$/);
    if (s) {
      const e = [...s[1]].reduce((e, t) => 10 * e + ge.indexOf(t), 0);
      return +("0." + "0".repeat(e) + s[2]);
    }
    const n = { K: 1e3, M: 1e6, B: 1e9, T: 1e12 }[t.slice(-1).toUpperCase()];
    n && (t = t.slice(0, -1));
    const a = parseFloat(t);
    return isFinite(a) ? a * (n || 1) : null;
  }
  function ke(e) {
    const t = new Set(),
      s = (n) => {
        if (!n || t.has(n)) return null;
        t.add(n);
        const a = document.createTreeWalker(n, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
        let o;
        for (; (o = a.nextNode());)
          if (3 === o.nodeType) {
            const t = o.nodeValue;
            if (t && t.length <= 24 && t.trim() === e) return o.parentElement;
          } else if (o.shadowRoot) {
            const e = s(o.shadowRoot);
            if (e) return e;
          }
        return null;
      };
    return s(document.body);
  }
  const we = new Map();
  function xe(e) {
    const t = we.get(e);
    if (t && t.isConnected && (t.textContent || "").trim() === e) return t;
    const s = ke(e);
    return (s ? we.set(e, s) : we.delete(e), s);
  }
  function Se(e) {
    if (!e) return "";
    if (!e.querySelector || !e.querySelector("sub")) return e.textContent || "";
    let t = "";
    const s = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
    let n;
    for (; (n = s.nextNode());) {
      const e = n.nodeValue || "";
      t += n.parentElement && "SUB" === n.parentElement.tagName ? e.replace(/\d/g, (e) => ge[+e]) : e;
    }
    return t;
  }
  function Ce(e) {
    const t = xe(e);
    if (!t) return null;
    let s = t;
    for (let t = 0; t < 3 && s; t++) {
      let t = s.nextElementSibling;
      for (; t;) {
        const s = Se(t).trim();
        if (s && s !== e) return s;
        t = t.nextElementSibling;
      }
      s = s.parentElement;
    }
    let n = t.parentElement;
    for (let t = 0; t < 3 && n; t++) {
      const t = Se(n).trim();
      if (t.startsWith(e) && t !== e) return t.slice(e.length).trim();
      n = n.parentElement;
    }
    n = t.parentElement;
    for (let t = 0; t < 3 && n; t++) {
      const t = (n.textContent || "").trim(),
        s = t.indexOf(e);
      if (s >= 0 && t.length > e.length) {
        const n = t.slice(s + e.length).trim();
        if (n) return n;
      }
      n = n.parentElement;
    }
    return null;
  }
  let Le = { key: null, val: !1 };
  function qe() {
    return (Le.key !== m && (Le = { key: m, val: !(!ke("B. Curve") && !ke("B.Curve")) }), Le.val);
  }
  function Me() {
    if (!m) return;
    const e = (function () {
      try {
        const e = Ce("Price"),
          t = be(e),
          s = document.title.match(/^(.+?)\s*[↓↑]?\s*\$([\d.,]+[KMBT]?)/),
          n = [...document.querySelectorAll("iframe")].map((e) => e.src).find((e) => e && e.indexOf("insightx") >= 0),
          a = n ? (n.match(/\/sol\/([1-9A-HJ-NP-Za-km-z]{32,44})/) || [])[1] : null,
          o = (s ? be(s[2]) : null) || be(Ce("MC")),
          l = be(Ce("Supply"));
        if (!(t > 0 || o > 0)) return null;
        let i = t > 0 ? t : 0,
          r =
            i > 0 &&
            String(e || "")
              .replace(/[^0-9]/g, "")
              .replace(/^0+/, "").length < 3;
        return (
          !(o > 0 && l > 0) || (i > 0 && !r) || ((i = o / l), (r = !1)),
          {
            price: i,
            coarse: r,
            liq: be(Ce("Liquidity")),
            supply: l,
            symbol: s ? s[1].trim() : null,
            mcap: o,
            mint: a || null,
            curve: qe(),
          }
        );
      } catch (e) {
        return null;
      }
    })();
    e && W({ cmd: "padre", pair: m, data: e });
  }
  const Ee = ["terminal", "axiom"];
  function Ae() {
    const e = n && n.settings && n.settings.skin;
    return Ee.indexOf(e) >= 0 ? e : "axiom" === K ? "axiom" : "terminal";
  }
  const $e = { terminal: 328, axiom: 348 };
  function Te() {
    const e = Ae();
    y.wrap && !x.wSet && ((x.w = $e[e] || 348), (y.wrap.style.width = x.w + "px"));
    for (const t of [y.wrap, y.smodal, y.umodal, y.lmenu, y.card]) t && (t.dataset.skin = e);
    h && h.host && (h.host.dataset.skin = e);
  }
  const Be = { on: !0, sol: 0.25, eth: 0.01, bnb: 0.05, pos: "replace", size: "m", style: "contour", unit: !0, goto: !0, one: !0, n: 1 },
    Pe = [1, 2, 4, 8];
  function He() {
    const e = Object.assign({}, Be, n && n.settings && n.settings.quickBuy);
    return (("right" !== e.pos && "near" !== e.pos) || (e.pos = "replace"), e);
  }
  function Fe(e) {
    const t = e || d();
    return "ETH" === t ? "eth" : "BNB" === t ? "bnb" : "sol";
  }
  function _e(e) {
    const t = +He()[Fe(e)];
    return t > 0 ? t : "BNB" === e ? 0.05 : "ETH" === e ? 0.01 : 0.25;
  }
  const Oe = { tr: "top:3px;right:3px", tl: "top:3px;left:3px", br: "bottom:3px;right:3px", bl: "bottom:3px;left:3px" };
  let Ve = null,
    Ne = null,
    ze = null,
    De = null,
    Re = !1;
  function Ue() {
    if (!Re) {
      Re = !0;
      try {
        Yt("Blanks could not take over this list’s buy button — the site’s real one is still live next to ours", "wait");
      } catch (e) {}
    }
  }
  function je(t) {
    const s = He(),
      a = Pe.indexOf(+s.n) >= 0 ? +s.n : 1,
      o = e.assetOf(t || r);
    if (a <= 1) return [_e(o)];
    const l = n ? Is(o) : null,
      i = l ? l[0 | n.settings.slot] || l[0] : null,
      c = "ETH" === o ? e.DEFAULTS.buyPresetsEth : "BNB" === o ? e.DEFAULTS.buyPresetsBnb : [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10],
      d = i && Array.isArray(i.buy) && i.buy.length ? i.buy : c,
      p = [];
    for (let e = 0; e < a; e++) p.push(+d[e % d.length]);
    return p;
  }
  function Ze() {
    const t = He();
    if (t.on && Y() && !m) {
      !(function () {
        if (document.getElementById("papr-qb-style")) return;
        const e = document.createElement("style");
        ((e.id = "papr-qb-style"),
          (e.textContent =
            '\n.papr-qb:not(.papr-qb-clone){display:inline-flex;align-items:center;justify-content:center;gap:4px;flex:none;\n  box-sizing:border-box;border-radius:6px;font-family:Geist,"Geist Variable",Inter,system-ui,sans-serif;\n  font-weight:600;letter-spacing:.01em;line-height:1;cursor:pointer;user-select:none;\n  white-space:nowrap;vertical-align:middle;\n  transition:background .12s,color .12s,border-color .12s,transform .08s}\n/* Calque sur leur bouton d\'achat rapide : fond sombre, filet discret. */\n.papr-qb:not(.papr-qb-clone)[data-style="contour"]{background:#12161c;color:#dde1e9;border:1px solid #2a3038}\n.papr-qb:not(.papr-qb-clone)[data-style="contour"]:hover{border-color:#14D8B8;color:#14D8B8}\n.papr-qb:not(.papr-qb-clone)[data-style="plein"]{background:rgba(20,216,184,.16);color:#14D8B8;\n  border:1px solid rgba(20,216,184,.5);font-weight:700}\n.papr-qb:not(.papr-qb-clone)[data-style="plein"]:hover{background:rgba(20,216,184,.3);border-color:rgba(20,216,184,.85)}\n.papr-qb:not(.papr-qb-clone)[data-style="discret"]{background:transparent;color:#7d8694;border:1px solid transparent}\n.papr-qb:not(.papr-qb-clone)[data-style="discret"]:hover{color:#14D8B8;border-color:#2a3038}\n/* Le clone garde LEURS classes, donc leur style exact. On n\'ajoute que le filigrane\n   qui permet de distinguer les deux boutons d\'un coup d\'oeil. */\n.papr-qb-clone{cursor:pointer}\n.papr-qb-face{position:relative!important}\n.papr-qb-mark{position:absolute;inset:0;display:grid;place-items:center;\n  opacity:.2;pointer-events:none;color:currentColor}\n.papr-qb-mark svg{width:auto;height:72%;max-height:22px}\n.papr-qb-clone[data-s="arm"] .papr-qb-face{color:#FFBA3C}\n.papr-qb-clone[data-s="ok"] .papr-qb-face{color:#2BC08A}\n.papr-qb-clone[data-s="err"] .papr-qb-face{color:#FB4A69}\n.papr-qb-clone[data-s="run"] .papr-qb-face{opacity:.55}\n\n.papr-qb:not(.papr-qb-clone)[data-z="s"]{font-size:11px;padding:4px 7px;min-height:22px}\n.papr-qb:not(.papr-qb-clone)[data-z="m"]{font-size:13px;padding:6px 10px;min-height:28px}\n.papr-qb:not(.papr-qb-clone)[data-z="l"]{font-size:15px;padding:8px 13px;min-height:34px}\n.papr-qbrow{display:grid;gap:3px;grid-template-columns:repeat(var(--qbc,4),minmax(0,1fr));\n  align-items:center;flex:none;vertical-align:middle}\n.papr-qbrow[data-mode="corner"]{position:absolute;z-index:6}\n.papr-qbrow[data-mode="inline"]{position:relative;z-index:2;margin:0 6px;display:inline-grid}\n.papr-qbrow .papr-qb{width:100%}\n.papr-qb:not(.papr-qb-clone)[data-mode="corner"]{position:absolute;z-index:6}\n.papr-qb:not(.papr-qb-clone)[data-mode="inline"]{position:relative;z-index:2;margin:0 6px}\n.papr-qb{cursor:pointer;user-select:none}\n.papr-qb-glyph{width:1em;height:1em;flex:none;opacity:.9}\n.papr-qb:active{transform:translateY(1px)}\n.papr-qb:not(.papr-qb-clone)[data-s="arm"]{background:rgba(255,186,60,.24);color:#FFBA3C;border-color:#FFBA3C}\n.papr-qb:not(.papr-qb-clone)[data-s="run"]{background:rgba(255,255,255,.12);color:#c9ced9;border-color:rgba(255,255,255,.3)}\n.papr-qb:not(.papr-qb-clone)[data-s="ok"]{background:rgba(43,192,138,.28);color:#2BC08A;border-color:#2BC08A}\n.papr-qb:not(.papr-qb-clone)[data-s="err"]{background:rgba(251,74,105,.22);color:#FB4A69;border-color:#FB4A69}'),
          (document.head || document.documentElement).appendChild(e));
      })();
      for (const s of document.querySelectorAll("[data-papr-mint]")) {
        const n = s.getAttribute("data-papr-mint"),
          a = s.getAttribute("data-papr-chain") || "solana";
        if (e.chainInfo(a).evm ? !/^0x[0-9a-fA-F]{40}$/.test(n) : !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(n)) continue;
        const o = e.assetOf(a);
        let l = s.__paprQb;
        l && !l.isConnected && (l = null);
        const i = [s];
        l && l.parentElement && l.parentElement !== s && i.push(l.parentElement);
        const r = !!(l && l.classList && l.classList.contains("papr-qbrow"));
        for (const e of i) for (const t of e.querySelectorAll(".papr-qb, .papr-qbrow")) t !== l && ((r && l.contains(t)) || t.remove());
        const c = je(a).length;
        if ((!l || (l.dataset.pos === t.pos && +l.dataset.qn === c) || (l.remove(), ot(s), (l = null)), l || ((l = st(s, a)), l)))
          if (((l.dataset.qn = String(c)), l.classList.contains("papr-qbrow"))) {
            for (const e of l.children)
              ((e.__mint = n),
                (e.__chain = a),
                (e.__asset = o),
                e.dataset.s || Ye(e, et(e.dataset.a) + (t.unit ? " " + o : "")),
                (e.dataset.z = t.size || "m"),
                (e.dataset.style = t.style || "contour"));
            l.dataset.pos = t.pos;
          } else {
            if (
              ((l.__mint = n),
              (l.__chain = a),
              (l.__asset = o),
              (l.dataset.pos = t.pos),
              "replace" !== l.dataset.mode &&
                ((l.dataset.z = t.size || "m"), (l.dataset.style = t.style || "contour"), "corner" === l.dataset.mode))
            ) {
              const e = Oe[t.pos] || Oe.tr;
              l.style.cssText = l.style.cssText.replace(/(top|bottom|left|right)\s*:[^;]*;?/g, "") + ";" + e;
            }
            l.dataset.s || Ye(l, Qe(t, "1" === l.dataset.clone, o));
          }
      }
    }
  }
  const Ie = '.trenches-ultra-quick-buy-hover, [class*="quick-buy"], [class*="quickBuy"], [class*="quickbuy"], [data-quick-buy]',
    Ge = /^[^\d]{0,3}[\d.,]+\s*(SOL|ETH|BNB)?$/i;
  function We(e, t) {
    const s = t.getBoundingClientRect();
    if (!(s.height > 0)) return null;
    const n = (e) => {
        const t = e.top + e.height / 2;
        return t >= s.top - 2 && t <= s.bottom + 2;
      },
      a = (e) => e.width >= 34 && e.width <= 260 && e.height >= 16 && e.height <= 56;
    for (const t of e.querySelectorAll(Ie)) {
      if (!n(t.getBoundingClientRect())) continue;
      let e = null,
        s = 1 / 0;
      for (const o of [t, ...t.querySelectorAll("div,span,button")]) {
        if (o.classList && o.classList.contains("papr-qb")) continue;
        if (o.querySelector && o.querySelector(".papr-qb")) continue;
        const t = o.getBoundingClientRect();
        if (!a(t) || !n(t)) continue;
        const l = t.width * t.height;
        l < s && ((s = l), (e = o));
      }
      if (e) return e;
    }
    let o = null,
      l = 1 / 0;
    for (const t of e.querySelectorAll("div,span,button")) {
      if (t.classList && t.classList.contains("papr-qb")) continue;
      if (t.querySelector && t.querySelector(".papr-qb")) continue;
      const e = (t.textContent || "").replace(/\s+/g, " ").trim(),
        s = Ge.exec(e);
      if (!s) continue;
      if (!s[1] && "BUTTON" !== t.tagName) continue;
      const i = t.getBoundingClientRect();
      if (!a(i) || !n(i)) continue;
      const r = i.width * i.height;
      r < l && ((l = r), (o = t));
    }
    return o;
  }
  function Ke(e, t) {
    let s = e;
    for (let e = 0; e < 4 && s && s.parentElement; e++, s = s.parentElement) {
      if (s.matches && s.matches(Ie)) return s;
      if (s.parentElement === document.body) break;
    }
    const n = t.getBoundingClientRect();
    let a = e,
      o = e.parentElement;
    for (let e = 0; e < 4 && o && o !== t && o !== document.body && (!t.contains(o) || o !== t); e++, o = o.parentElement) {
      const e = o.getBoundingClientRect(),
        t = e.top + e.height / 2;
      if (!(t >= n.top - 2 && t <= n.bottom + 2) || e.width > 320 || e.height > 72) break;
      a = o;
    }
    return a;
  }
  function Ye(e, t) {
    if ("1" !== e.dataset.clone) return ((e.innerHTML = Xe + "<span></span>"), void (e.lastChild.textContent = t));
    let s = e.__label;
    if (!s || !e.contains(s)) {
      const t = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
      let n,
        a = null,
        o = null,
        l = !1;
      for (; (n = t.nextNode());) {
        const e = (n.nodeValue || "").trim();
        a || (!/[\d]/.test(e) && !/SOL/i.test(e)) ? (a && /^SOL$/i.test(e) && (l = !0), !o && e && (o = n)) : (a = n);
      }
      ((s = e.__label = a || o), (e.__unit = l));
    }
    (e.__unit && (t = t.replace(/\s*SOL$/i, "")), s ? (s.nodeValue = t) : (e.textContent = t));
  }
  function Je(e, t) {
    if ("near" === t) {
      const t = e.querySelectorAll("div,span,button");
      for (const e of t) {
        if (e.children.length > 2) continue;
        const t = (e.textContent || "").replace(/\s+/g, " ").trim();
        if (!/^[\d.,]+\s*SOL$/i.test(t)) continue;
        const s = e.getBoundingClientRect();
        if (!(s.width < 24 || s.height < 12)) return { mode: "inline", ref: e, where: "after" };
      }
      return { mode: "corner", ref: null };
    }
    return "left" === t
      ? { mode: "inline", ref: null, where: "first" }
      : "right" === t
        ? { mode: "inline", ref: null, where: "last" }
        : { mode: "corner", ref: null };
  }
  const Xe =
    '<svg class="papr-qb-glyph" viewBox="0 0 128 128" aria-hidden="true"><line x1="64" y1="22" x2="64" y2="106" stroke="currentColor" stroke-width="14" stroke-linecap="round"/><rect x="36" y="42" width="56" height="46" rx="10" fill="currentColor"/></svg>';
  function Qe(e, t, s) {
    const n = s || d();
    return et(_e(n)) + (e.unit ? " " + n : "");
  }
  function et(e) {
    const t = Number(e) || 0;
    return t >= 1 ? String(+t.toFixed(2)) : t.toFixed(2).replace(/0$/, "");
  }
  function tt(e, t, s, n, a) {
    const o = document.createElement("div");
    ((o.className = "papr-qbrow"),
      (o.dataset.mode = s),
      o.style.setProperty("--qbc", String(Math.min(4, t.length))),
      o.setAttribute("data-row-nav-ignore", "true"));
    for (const s of t) {
      const t = document.createElement("div");
      ((t.className = "papr-qb"),
        (t.dataset.mode = "inline"),
        (t.dataset.z = n),
        (t.dataset.style = a),
        (t.dataset.a = String(s)),
        at(t, e),
        o.appendChild(t));
    }
    return o;
  }
  function st(e, t) {
    try {
      const s = He(),
        n = (function (e) {
          let t = e;
          for (let s = 0; s < 5 && t && t !== document.body; s++, t = t.parentElement) {
            const s = We(t, e);
            if (s) return s;
          }
          return null;
        })(e),
        a = je(t);
      if (a.length > 1) {
        const t = s.size || "m",
          o = s.style || "contour";
        if (("replace" !== s.pos || (n && n.parentElement) || Ue(), "replace" === s.pos && n && n.parentElement)) {
          const s = Ke(n, e),
            l = tt(e, a, "inline", t, o);
          return (
            s.parentElement.insertBefore(l, s.nextSibling),
            (s.style.display = "none"),
            s.setAttribute("data-papr-hidden", "1"),
            (e.__paprHid = s),
            (e.__paprQb = l),
            l
          );
        }
        const l = Je(e, "replace" === s.pos ? "bl" : s.pos),
          i = tt(e, a, l.mode, t, o);
        if ("inline" === l.mode)
          "after" === l.where && l.ref && l.ref.parentElement
            ? l.ref.parentElement.insertBefore(i, l.ref.nextSibling)
            : "first" === l.where
              ? e.insertBefore(i, e.firstChild)
              : e.appendChild(i);
        else {
          ("static" === getComputedStyle(e).position && (e.style.position = "relative"),
            Object.assign(i.style, { position: "absolute", zIndex: "6" }));
          ((Oe[s.pos] || Oe.bl).split(";").forEach((e) => {
            const [t, s] = e.split(":");
            i.style[t.trim()] = s.trim();
          }),
            e.appendChild(i));
        }
        return ((e.__paprQb = i), i);
      }
      if (("replace" !== s.pos || (n && n.parentElement) || Ue(), "replace" === s.pos && n && n.parentElement)) {
        const t = Ke(n, e),
          s = (function (e, t) {
            const s = e.cloneNode(!0);
            (s.classList.add("papr-qb", "papr-qb-clone"),
              s.removeAttribute("id"),
              s.querySelectorAll("[id]").forEach((e) => e.removeAttribute("id")));
            const n = [];
            for (let s = t; s && s !== e; s = s.parentElement) n.unshift([...s.parentElement.children].indexOf(s));
            let a = s;
            for (const e of n)
              if (((a = a.children[e]), !a)) {
                a = s;
                break;
              }
            a.classList.add("papr-qb-face");
            const o = document.createElement("span");
            return (
              (o.className = "papr-qb-mark"),
              (o.innerHTML =
                '<svg viewBox="0 0 128 128" aria-hidden="true">\n      <rect width="128" height="128" rx="29" fill="currentColor"/>\n      <line x1="64" y1="22" x2="64" y2="106" stroke="#000" stroke-width="12" stroke-linecap="round"/>\n      <rect x="38" y="42" width="52" height="46" rx="9" fill="#000"/>\n      <rect x="51" y="55" width="26" height="20" rx="4" fill="currentColor"/></svg>'),
              a.appendChild(o),
              (s.__face = a),
              s
            );
          })(t, n);
        return (
          (s.dataset.clone = "1"),
          (s.dataset.mode = "replace"),
          at(s, e),
          t.parentElement.insertBefore(s, t.nextSibling),
          (t.style.display = "none"),
          t.setAttribute("data-papr-hidden", "1"),
          (e.__paprHid = t),
          (e.__paprQb = s),
          s
        );
      }
      const o = Je(e, "replace" === s.pos ? "bl" : s.pos),
        l = document.createElement("div");
      return (
        (l.className = "papr-qb"),
        (l.dataset.mode = o.mode),
        (l.dataset.z = s.size || "m"),
        (l.dataset.style = s.style || "contour"),
        at(l, e),
        "inline" === o.mode
          ? "after" === o.where && o.ref && o.ref.parentElement
            ? o.ref.parentElement.insertBefore(l, o.ref.nextSibling)
            : "first" === o.where
              ? e.insertBefore(l, e.firstChild)
              : e.appendChild(l)
          : ("static" === getComputedStyle(e).position && (e.style.position = "relative"), e.appendChild(l)),
        (e.__paprQb = l),
        l
      );
    } catch (e) {
      return null;
    }
  }
  let nt = !1;
  function at(e, t) {
    ((e.title = "Blanks — double-click to buy (simulated)"),
      e.setAttribute("data-row-nav-ignore", "true"),
      (e.__card = t),
      (function () {
        if (nt) return;
        if (
          ((nt = !0),
          (window.__PAPR_QB = (e) => {
            const t = e && e.__card;
            t && lt(e, t);
          }),
          window.__PAPR_GUARD)
        )
          return;
        const e = [
          "pointerdown",
          "mousedown",
          "pointerup",
          "mouseup",
          "click",
          "dblclick",
          "auxclick",
          "touchstart",
          "touchend",
          "contextmenu",
        ];
        for (const t of e)
          window.addEventListener(
            t,
            (e) => {
              const s = e.target && e.target.closest && e.target.closest(".papr-qb");
              if (s && (e.preventDefault(), e.stopImmediatePropagation(), "click" === t)) {
                const e = s.__card;
                e && lt(s, e);
              }
            },
            !0,
          );
      })());
  }
  function ot(e) {
    const t = e.__paprHid;
    (t && t.getAttribute && "1" === t.getAttribute("data-papr-hidden") && ((t.style.display = ""), t.removeAttribute("data-papr-hidden")),
      (e.__paprHid = null));
  }
  function lt(e, t) {
    if ("run" !== e.dataset.s)
      if (He().one) rt(e, t);
      else {
        if (ze === e) return (clearTimeout(De), (ze = null), void rt(e, t));
        (ze && it(ze),
          (ze = e),
          (e.dataset.s = "arm"),
          Ye(e, "×²"),
          clearTimeout(De),
          (De = setTimeout(() => {
            ze === e && ((ze = null), it(e));
          }, 1600)));
      }
  }
  function it(e) {
    (delete e.dataset.s, Ye(e, Qe(He(), e.dataset.clone, e.__asset)));
  }
  function rt(t, s) {
    const n = t.__mint,
      a = t.__chain || s.getAttribute("data-papr-chain") || "solana",
      o = e.assetOf(a),
      l = void 0 !== t.dataset.a ? +t.dataset.a : _e(o);
    if (!(n && l > 0)) return void dt(t, "err", "✗");
    ((t.dataset.s = "run"), Ye(t, "…"));
    let i = "";
    for (const e of s.children) (e.classList && e.classList.contains("papr-qb")) || (i += " " + (e.innerText || e.textContent || ""));
    (i.trim() || (i = s.innerText || ""), (i = i.replace(/\s+/g, " ").trim()));
    const r = be((i.match(/MC\s*(\$?[\d.,]+[KMB]?)/i) || [])[1]),
      c = /^(MC|V|F|SOL|DS|TX|ATH|USD|MCAP|VOL)$/i,
      d = (i.split(/\s+/).find((e) => /^[A-Za-z][A-Za-z0-9]{1,11}$/.test(e) && !c.test(e)) || "").slice(0, 12) || null;
    (W({ cmd: "pairinfo", pair: n, chain: a, kind: e.chainInfo(a).evm ? "token" : "mint" }),
      W({
        cmd: "padre",
        pair: n,
        data: {
          price: 0,
          liq: null,
          supply: 0,
          symbol: d,
          mcap: r > 0 ? r : 0,
          mint: n,
          curve: !e.chainInfo(a).evm && /pump$/i.test(n),
          lp: !0,
        },
      }),
      W({ cmd: "buy", pair: n, amountSol: l, tag: "trenches" }));
    const p = He().goto ? X(n, s.getAttribute("data-papr-pair"), a) : null;
    if (p) return ((ct = null), "trade" !== x.tab && ((x.tab = "trade"), L({ tab: "trade" })), void (location.href = p));
    ((ct = { b: t, mint: n, at: Date.now() }),
      setTimeout(() => {
        ct && ct.b === t && ((ct = null), dt(t, "ok", "✓"));
      }, 2600));
  }
  let ct = null;
  function dt(e, t, s) {
    ((e.dataset.s = t),
      Ye(e, s),
      setTimeout(() => {
        e.isConnected && it(e);
      }, 1800));
  }
  let pt = null,
    ut = null;
  function ht() {
    Ne ||
      (Ne = setTimeout(() => {
        Ne = null;
        try {
          Ze();
        } catch (e) {}
      }, 50));
  }
  function mt() {
    Ve ||
      ((Ve = new MutationObserver(ht)),
      Ve.observe(document.documentElement, { childList: !0, subtree: !0, attributes: !0, attributeFilter: ["data-papr-mint"] }),
      addEventListener("scroll", ht, !0),
      ht());
  }
  function vt() {
    !m && He().on && Y() ? (mt(), ht()) : ft();
  }
  function ft() {
    if (Ve) {
      (Ve.disconnect(), (Ve = null), removeEventListener("scroll", ht, !0), clearTimeout(Ne), (Ne = null));
      for (const e of document.querySelectorAll(".papr-qb")) e.remove();
      for (const e of document.querySelectorAll("[data-papr-hidden]")) ((e.style.display = ""), e.removeAttribute("data-papr-hidden"));
    }
  }
  function yt() {
    const t = $();
    if (!t || !n) return;
    const s = t.baseToken.address,
      o = n.fills[s] || [],
      i = n.positions[s],
      c = parseFloat(t.priceUsd),
      p = t.fdv || t.marketCap,
      u = c > 0 && p > 0 ? p / c : 0,
      h = (e) => (e.midUsd > 0 ? e.midUsd : e.priceUsd);
    let m = 0,
      v = 0,
      f = 0,
      y = 0;
    for (const e of o)
      e.tokens > 0 &&
        h(e) > 0 &&
        ("buy" === e.side ? ((m += e.tokens), (v += e.tokens * h(e))) : ((f += e.tokens), (y += e.tokens * h(e))));
    const g = m > 0 ? v / m : null,
      b = f > 0 ? y / f : null;
    let k = null;
    i && i.tokens > 0 && l && (k = (i.costSol / i.tokens) * l);
    const w = n.orders
      .filter((e) => e.mint === s)
      .map((e) => {
        let t = null;
        if ("price" === e.mode) t = e.value;
        else if ("mc" === e.mode) {
          const s = e.supply > 0 ? e.supply : u;
          t = s > 0 ? e.value / s : null;
        } else e.lvUsd > 0 ? (t = e.lvUsd) : k && (t = "tp" === e.kind ? k * (1 + e.value / 100) : k * (1 - e.value / 100));
        return t ? { kind: e.kind, priceUsd: t, mcap: t * u } : null;
      })
      .filter(Boolean);
    (!(function () {
      const e = (n.track && n.track.profiles) || {},
        t = {};
      let s = "";
      const a = {};
      for (const n in e) {
        const o = e[n] && e[n].avatar;
        o && ((t[n] = o), (s += n + ":" + o.length + ":" + o.slice(-24) + "|"));
        const l = e[n] && e[n].rank;
        l && ((a[n] = l), (s += n + "#" + l + "|"));
      }
      if (s === gt) return;
      gt = s;
      try {
        window.postMessage({ source: "PAPR", type: "avatars", map: t, ranks: a }, location.origin);
      } catch (e) {}
    })(),
      window.postMessage(
        {
          source: "PAPR",
          type: "marks",
          payload: {
            mint: s,
            refPriceUsd: c || 0,
            refMcap: p || 0,
            avgUsd: g,
            avgSellUsd: b,
            beUsd: k,
            orders: w,
            symbol: t.baseToken.symbol || "",
            solUsd: l || 0,
            asset: d(),
            chain: r,
            supply: u,
            avatar: kt(s),
            pos:
              i && i.tokens > 0
                ? {
                    tokens: i.tokens,
                    costSol: i.costSol,
                    valueSol: (() => {
                      const t = a[i.pair],
                        s = t ? e.marketState(t, l, r) : null;
                      return s ? e.exitValue(s, i.tokens, n.settings) : 0;
                    })(),
                  }
                : null,
            tot: o.reduce((e, t) => ("buy" === t.side ? (e.nb++, (e.sb += t.sol || 0)) : (e.ns++, (e.ss += t.sol || 0)), e), {
              nb: 0,
              sb: 0,
              ns: 0,
              ss: 0,
            }),
            others: fn(s),
            /* Mode fantome : ce que les jetons vendus vaudraient maintenant, depuis la
               derniere vente du dernier trade clos. Zones : tes trades passes sur ce token. */
            ghost: (() => {
              if (!1 === n.settings.ghost || (i && i.tokens > 0) || !(c > 0) || !(l > 0)) return null;
              const tr = (n.trades || []).find((e) => e.mint === s);
              if (!tr) return null;
              const sl = o.filter((e) => "sell" === e.side && e.tokens > 0 && e.ts >= (tr.openedAt || 0) - 1e3 && e.ts <= (tr.closedAt || 0) + 5e3);
              if (!sl.length) return null;
              const tok = sl.reduce((e, t) => e + t.tokens, 0),
                got = sl.reduce((e, t) => e + (t.sol || 0), 0),
                now = (tok * c) / l,
                last = sl[sl.length - 1];
              return got > 0 ? { ts: last.ts, priceUsd: h(last), diffSol: now - got, pct: ((now - got) / got) * 100, asset: d() } : null;
            })(),
            zones:
              !1 === n.settings.zones
                ? []
                : (n.trades || [])
                    .filter((e) => e.mint === s && e.openedAt && e.closedAt)
                    .slice(0, 25)
                    .map((e) => ({ t0: e.openedAt, t1: e.closedAt, pnl: e.pnlSol, pct: e.pnlPct })),
            marks: (() => {
              let e = 0,
                t = 0;
              return o.map((s) => {
                const n = {
                  ts: s.ts,
                  side: s.side,
                  sol: s.sol,
                  tokens: s.tokens || 0,
                  priceUsd: h(s),
                  execUsd: s.priceUsd || h(s),
                  tag: s.tag || null,
                  mcap: s.mcap > 0 ? s.mcap : s.supply > 0 ? h(s) * s.supply : null,
                };
                if ("buy" === s.side) ((e += s.tokens || 0), (t += s.sol || 0));
                else if (e > 0 && s.tokens > 0) {
                  const a = t * Math.min(1, s.tokens / e);
                  ((n.pnlSol = (s.sol || 0) - a),
                    (n.pnlPct = a > 0 ? (n.pnlSol / a) * 100 : 0),
                    (t -= a),
                    (e -= s.tokens),
                    e < 1e-9 && ((e = 0), (t = 0)));
                }
                return n;
              });
            })(),
          },
        },
        location.origin,
      ));
  }
  let gt = "";
  let bt = { mint: null, url: null };
  function kt(e) {
    if (bt.mint === e) return bt.url;
    let t = null;
    try {
      const s = e && document.querySelector('img[src*="' + e + '"]');
      if (s) t = s.src;
      else {
        let e = xe("Price");
        for (let t = 0; t < 6 && e && e !== document.body; t++) e = e.parentElement;
        const s = (e ? [...e.querySelectorAll("img")] : []).find((e) => {
          const t = e.getBoundingClientRect();
          return t.width >= 24 && t.width <= 80 && Math.abs(t.width - t.height) < 6;
        });
        s && (t = s.src);
      }
    } catch (e) {}
    return ((bt = { mint: e, url: t }), t);
  }
  const wt =
      '<svg width="0" height="0" style="position:absolute;overflow:hidden" aria-hidden="true"><defs><linearGradient id="solg2" x1="1.77" y1="13.33" x2="13.96" y2="1.14" gradientUnits="userSpaceOnUse"><stop stop-color="#9945FF"/><stop offset="0.24" stop-color="#8752F3"/><stop offset="0.46" stop-color="#5497D5"/><stop offset="0.6" stop-color="#43B4CA"/><stop offset="0.73" stop-color="#28E0B9"/><stop offset="1" stop-color="#19FB9B"/></linearGradient></defs><symbol id="i-kbd" viewBox="0 0 50 50"><path d="M6.25 6.25H43.75C47.20 6.25 50 9.04 50 12.5V37.5C50 40.95 47.20 43.75 43.75 43.75H6.25C2.79 43.75 0 40.95 0 37.5V12.5C0 9.04 2.79 6.25 6.25 6.25ZM6.25 10.41C5.09 10.41 4.16 11.34 4.16 12.5V37.5C4.16 38.65 5.09 39.58 6.25 39.58H43.75C44.90 39.58 45.83 38.65 45.83 37.5V12.5C45.83 11.34 44.90 10.41 43.75 10.41H6.25ZM29.16 14.58C30.31 14.58 31.25 15.51 31.25 16.66C31.25 17.81 30.31 18.75 29.16 18.75C28.01 18.75 27.08 17.81 27.08 16.66C27.08 15.51 28.01 14.58 29.16 14.58ZM20.83 14.58C21.98 14.58 22.91 15.51 22.91 16.66C22.91 17.81 21.98 18.75 20.83 18.75C19.68 18.75 18.75 17.81 18.75 16.66C18.75 15.51 19.68 14.58 20.83 14.58ZM37.5 14.58C38.65 14.58 39.58 15.51 39.58 16.66C39.58 17.81 38.65 18.75 37.5 18.75C36.34 18.75 35.41 17.81 35.41 16.66C35.41 15.51 36.34 14.58 37.5 14.58ZM29.16 22.91C30.31 22.91 31.25 23.84 31.25 25C31.25 26.15 30.31 27.08 29.16 27.08C28.01 27.08 27.08 26.15 27.08 25C27.08 23.84 28.01 22.91 29.16 22.91ZM20.83 22.91C21.98 22.91 22.91 23.84 22.91 25C22.91 26.15 21.98 27.08 20.83 27.08C19.68 27.08 18.75 26.15 18.75 25C18.75 23.84 19.68 22.91 20.83 22.91ZM18.75 35.41C17.59 35.41 16.66 34.48 16.66 33.33C16.66 32.18 17.59 31.25 18.75 31.25H31.25C32.40 31.25 33.33 32.18 33.33 33.33C33.33 34.48 32.40 35.41 31.25 35.41H18.75ZM37.5 22.91C38.65 22.91 39.58 23.84 39.58 25C39.58 26.15 38.65 27.08 37.5 27.08C36.34 27.08 35.41 26.15 35.41 25C35.41 23.84 36.34 22.91 37.5 22.91ZM12.5 14.58C13.65 14.58 14.58 15.51 14.58 16.66C14.58 17.81 13.65 18.75 12.5 18.75C11.34 18.75 10.41 17.81 10.41 16.66C10.41 15.51 11.34 14.58 12.5 14.58ZM12.5 22.91C13.65 22.91 14.58 23.84 14.58 25C14.58 26.15 13.65 27.08 12.5 27.08C11.34 27.08 10.41 26.15 10.41 25C10.41 23.84 11.34 22.91 12.5 22.91Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"/></symbol><symbol id="i-edit" viewBox="0 0 24 24"><path d="M11.25 4.5C11.66 4.5 12 4.16 12 3.75C12 3.33 11.66 3 11.25 3V4.5ZM21 12.75V12H19.5V12.75H21ZM17.05 19.5H6.95V21H17.05V19.5ZM4.5 17.05V6.95H3V17.05H4.5ZM6.95 4.5H11.25V3H6.95V4.5ZM19.5 12.75V17.05H21V12.75H19.5ZM6.95 19.5C6.37 19.5 5.99 19.49 5.69 19.47C5.41 19.45 5.27 19.40 5.18 19.36L4.50 20.70C4.83 20.87 5.19 20.93 5.57 20.97C5.94 21.00 6.40 21 6.95 21V19.5ZM3 17.05C3 17.59 2.99 18.05 3.02 18.42C3.06 18.80 3.12 19.16 3.29 19.49L4.63 18.81C4.59 18.72 4.54 18.58 4.52 18.30C4.50 18.00 4.5 17.62 4.5 17.05H3ZM5.18 19.36C4.94 19.24 4.75 19.05 4.63 18.81L3.29 19.49C3.56 20.01 3.98 20.43 4.50 20.70L5.18 19.36ZM17.05 21C17.59 21 18.05 21.00 18.42 20.97C18.80 20.93 19.16 20.87 19.49 20.70L18.81 19.36C18.72 19.40 18.58 19.45 18.30 19.47C18.00 19.49 17.62 19.5 17.05 19.5V21ZM19.5 17.05C19.5 17.62 19.49 18.00 19.47 18.30C19.45 18.58 19.40 18.72 19.36 18.81L20.70 19.49C20.87 19.16 20.93 18.80 20.97 18.42C21.00 18.05 21 17.59 21 17.05H19.5ZM19.49 20.70C20.01 20.43 20.43 20.01 20.70 19.49L19.36 18.81C19.24 19.05 19.05 19.24 18.81 19.36L19.49 20.70ZM4.5 6.95C4.5 6.37 4.50 5.99 4.52 5.69C4.54 5.41 4.59 5.27 4.63 5.18L3.29 4.50C3.12 4.83 3.06 5.19 3.02 5.57C2.99 5.94 3 6.40 3 6.95H4.5ZM6.95 3C6.40 3 5.94 2.99 5.57 3.02C5.19 3.06 4.83 3.12 4.50 3.29L5.18 4.63C5.27 4.59 5.41 4.54 5.69 4.52C5.99 4.50 6.37 4.5 6.95 4.5V3ZM4.63 5.18C4.75 4.94 4.94 4.75 5.18 4.63L4.50 3.29C3.98 3.56 3.56 3.98 3.29 4.50L4.63 5.18Z" fill="currentColor"/><path d="M8.75 15.24V12.66C8.75 12.39 8.85 12.14 9.04 11.95L17.58 3.41C18.36 2.63 19.63 2.63 20.41 3.41L20.58 3.58C21.36 4.36 21.36 5.63 20.58 6.41L12.04 14.95C11.85 15.14 11.60 15.24 11.33 15.24H8.75Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="round"/></symbol><symbol id="i-gear" viewBox="0 0 16 16"><path d="M7.99 10C9.10 10 9.99 9.10 9.99 8.00C9.99 6.89 9.10 6.00 7.99 6.00C6.89 6.00 5.99 6.89 5.99 8.00C5.99 9.10 6.89 10 7.99 10Z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12.48 9.81C12.40 10.00 12.38 10.20 12.41 10.40C12.45 10.59 12.54 10.77 12.68 10.92L12.72 10.95C12.83 11.07 12.92 11.20 12.98 11.35C13.04 11.49 13.07 11.65 13.07 11.81C13.07 11.97 13.04 12.13 12.98 12.27C12.92 12.42 12.83 12.56 12.72 12.67C12.60 12.78 12.47 12.87 12.32 12.93C12.18 12.99 12.02 13.02 11.86 13.02C11.70 13.02 11.54 12.99 11.39 12.93C11.25 12.87 11.11 12.78 11.00 12.67L10.96 12.63C10.82 12.49 10.64 12.40 10.44 12.36C10.25 12.33 10.04 12.35 9.86 12.43C9.68 12.51 9.53 12.64 9.42 12.80C9.31 12.96 9.26 13.15 9.26 13.35V13.45C9.26 13.77 9.13 14.08 8.90 14.31C8.67 14.53 8.36 14.66 8.04 14.66C7.72 14.66 7.41 14.53 7.19 14.31C6.96 14.08 6.83 13.77 6.83 13.45V13.4C6.83 13.19 6.76 13.00 6.64 12.84C6.53 12.67 6.37 12.55 6.18 12.48C5.99 12.40 5.79 12.38 5.59 12.41C5.40 12.45 5.22 12.54 5.07 12.68L5.04 12.72C4.92 12.83 4.79 12.92 4.64 12.98C4.50 13.04 4.34 13.07 4.18 13.07C4.02 13.07 3.86 13.04 3.72 12.98C3.57 12.92 3.43 12.83 3.32 12.72C3.21 12.60 3.12 12.47 3.06 12.32C3.00 12.18 2.97 12.02 2.97 11.86C2.97 11.70 3.00 11.54 3.06 11.39C3.12 11.25 3.21 11.11 3.32 11.00L3.36 10.96C3.50 10.82 3.59 10.64 3.63 10.44C3.66 10.25 3.64 10.04 3.56 9.86C3.48 9.68 3.35 9.53 3.19 9.42C3.03 9.31 2.84 9.26 2.64 9.26H2.54C2.22 9.26 1.91 9.13 1.68 8.90C1.46 8.67 1.33 8.37 1.33 8.04C1.33 7.72 1.46 7.41 1.68 7.19C1.91 6.96 2.22 6.83 2.54 6.83H2.59C2.80 6.83 2.99 6.76 3.15 6.65C3.32 6.53 3.44 6.37 3.51 6.18C3.59 5.99 3.61 5.79 3.58 5.59C3.54 5.40 3.45 5.22 3.31 5.07L3.27 5.04C3.16 4.92 3.07 4.79 3.01 4.64C2.95 4.50 2.92 4.34 2.92 4.18C2.92 4.02 2.95 3.86 3.01 3.72C3.07 3.57 3.16 3.43 3.27 3.32C3.39 3.21 3.52 3.12 3.67 3.06C3.81 3.00 3.97 2.97 4.13 2.97C4.29 2.97 4.45 3.00 4.60 3.06C4.74 3.12 4.88 3.21 4.99 3.32L5.03 3.36C5.17 3.50 5.35 3.59 5.55 3.63C5.74 3.66 5.95 3.64 6.13 3.56H6.18C6.36 3.48 6.51 3.35 6.62 3.19C6.72 3.03 6.78 2.84 6.78 2.64V2.54C6.78 2.22 6.91 1.91 7.14 1.68C7.37 1.46 7.67 1.33 7.99 1.33C8.32 1.33 8.62 1.46 8.85 1.68C9.08 1.91 9.21 2.22 9.21 2.54V2.60C9.21 2.79 9.27 2.98 9.37 3.14C9.48 3.31 9.63 3.43 9.81 3.51C10.00 3.59 10.20 3.61 10.40 3.58C10.59 3.54 10.77 3.45 10.92 3.31L10.95 3.27C11.07 3.16 11.20 3.07 11.35 3.01C11.49 2.95 11.65 2.92 11.81 2.92C11.97 2.92 12.13 2.95 12.27 3.01C12.42 3.07 12.56 3.16 12.67 3.27C12.78 3.39 12.87 3.52 12.93 3.67C12.99 3.81 13.02 3.97 13.02 4.13C13.02 4.29 12.99 4.45 12.93 4.60C12.87 4.74 12.78 4.88 12.67 4.99L12.63 5.03C12.49 5.17 12.40 5.35 12.36 5.55C12.33 5.74 12.35 5.95 12.43 6.13V6.18C12.51 6.36 12.64 6.51 12.80 6.62C12.96 6.72 13.15 6.78 13.35 6.78H13.45C13.77 6.78 14.08 6.91 14.31 7.14C14.53 7.37 14.66 7.67 14.66 8.00C14.66 8.32 14.53 8.62 14.31 8.85C14.08 9.08 13.77 9.21 13.45 9.21H13.39C13.20 9.21 13.01 9.27 12.85 9.37C12.68 9.48 12.56 9.63 12.48 9.81Z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></symbol><symbol id="i-alarm" viewBox="0 0 24 24"><path d="M2 5.25L5 2.25M22 5.25L19 2.25M12 8V12L14.5 14.5M21.25 12C21.25 17.10 17.10 21.25 12 21.25C6.89 21.25 2.75 17.10 2.75 12C2.75 6.89 6.89 2.75 12 2.75C17.10 2.75 21.25 6.89 21.25 12Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></symbol><symbol id="i-wallet" viewBox="0 0 18 18"><path d="M11.99 10.49H11.37H11.99ZM16.49 5.24H17.12C17.12 4.90 16.84 4.62 16.49 4.62V5.24ZM16.49 15.74V16.37C16.84 16.37 17.12 16.09 17.12 15.74H16.49ZM1.5 15.74H0.87C0.87 16.09 1.15 16.37 1.5 16.37L1.5 15.74ZM1.5 2.24V1.62C1.15 1.62 0.87 1.90 0.87 2.24H1.5ZM13.49 2.24H14.12C14.12 1.90 13.84 1.62 13.49 1.62V2.24ZM11.37 10.49C11.37 10.96 11.55 11.40 11.88 11.73L12.76 10.85C12.67 10.75 12.62 10.62 12.62 10.49H11.37ZM11.88 11.73C12.21 12.06 12.65 12.24 13.12 12.24V10.99C12.99 10.99 12.86 10.94 12.76 10.85L11.88 11.73ZM13.12 12.24C13.58 12.24 14.03 12.06 14.36 11.73L13.47 10.85C13.38 10.94 13.25 10.99 13.12 10.99V12.24ZM14.36 11.73C14.68 11.40 14.87 10.96 14.87 10.49H13.62C13.62 10.62 13.57 10.75 13.47 10.85L14.36 11.73ZM14.87 10.49C14.87 10.03 14.68 9.58 14.36 9.25L13.47 10.14C13.57 10.23 13.62 10.36 13.62 10.49H14.87ZM14.36 9.25C14.03 8.93 13.58 8.74 13.12 8.74V9.99C13.25 9.99 13.38 10.04 13.47 10.14L14.36 9.25ZM13.12 8.74C12.65 8.74 12.21 8.93 11.88 9.25L12.76 10.14C12.86 10.04 12.99 9.99 13.12 9.99V8.74ZM11.88 9.25C11.55 9.58 11.37 10.03 11.37 10.49H12.62C12.62 10.36 12.67 10.23 12.76 10.14L11.88 9.25ZM7.49 5.87H13.49V4.62H7.49V5.87ZM13.49 5.87H16.49V4.62H13.49V5.87ZM15.87 5.24V15.74H17.12V5.24H15.87ZM16.49 15.12H1.5V16.37H16.49V15.12ZM2.12 15.74V2.24H0.87V15.74H2.12ZM1.5 2.87H13.49V1.62H1.5V2.87ZM12.87 2.24V5.24H14.12V2.24H12.87Z" fill="currentColor"/></symbol><symbol id="i-x" viewBox="0 0 16 16"><path d="M12 4L4 12M4 4L12 12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></symbol><symbol id="i-sol" viewBox="0 0 16 16"><path fill-rule="evenodd" clip-rule="evenodd" d="M2.44 6.75H12.03C12.15 6.75 12.26 6.80 12.35 6.89L13.87 8.45C14.15 8.74 13.95 9.23 13.55 9.23H3.96C3.84 9.23 3.73 9.18 3.64 9.09L2.12 7.53C1.84 7.24 2.04 6.75 2.44 6.75ZM2.12 4.68L3.64 3.12C3.72 3.03 3.84 2.98 3.96 2.98H13.54C13.94 2.98 14.14 3.47 13.86 3.76L12.35 5.32C12.27 5.41 12.15 5.46 12.03 5.46H2.44C2.04 5.46 1.84 4.97 2.12 4.68ZM13.86 11.3L12.34 12.86C12.25 12.95 12.14 13 12.02 13H2.44C2.04 13 1.84 12.51 2.12 12.22L3.64 10.66C3.72 10.57 3.84 10.52 3.96 10.52H13.54C13.94 10.52 14.14 11.01 13.86 11.3Z" fill="url(#solg2)"/></symbol><symbol id="i-usdc" viewBox="0 0 24 24"><path d="M12 24C18.62 24 24 18.62 24 12C24 5.37 18.62 0 12 0C5.37 0 0 5.37 0 12C0 18.62 5.37 24 12 24Z" fill="#3E73C4"/><path d="M15.01 13.59C15.01 12.00 14.05 11.45 12.13 11.22C10.76 11.04 10.49 10.68 10.49 10.04C10.49 9.40 10.94 8.99 11.86 8.99C12.68 8.99 13.14 9.26 13.37 9.95C13.39 10.01 13.43 10.07 13.49 10.11C13.55 10.15 13.62 10.17 13.69 10.17H14.42C14.46 10.18 14.50 10.17 14.54 10.15C14.58 10.14 14.62 10.11 14.65 10.08C14.68 10.05 14.70 10.02 14.71 9.98C14.73 9.94 14.74 9.90 14.74 9.86V9.81C14.65 9.32 14.40 8.87 14.03 8.53C13.65 8.19 13.18 7.98 12.68 7.94V6.85C12.68 6.67 12.54 6.53 12.31 6.49H11.63C11.45 6.49 11.31 6.62 11.26 6.85V7.90C9.89 8.08 9.02 8.99 9.02 10.13C9.02 11.63 9.94 12.22 11.86 12.45C13.14 12.68 13.55 12.95 13.55 13.68C13.55 14.41 12.91 14.91 12.04 14.91C10.85 14.91 10.44 14.41 10.30 13.72C10.26 13.54 10.12 13.45 9.98 13.45H9.21C9.16 13.45 9.12 13.46 9.08 13.47C9.04 13.49 9.01 13.51 8.98 13.54C8.95 13.57 8.92 13.61 8.91 13.65C8.89 13.69 8.89 13.73 8.89 13.77V13.82C9.07 14.95 9.80 15.77 11.31 16.00V17.09C11.31 17.28 11.45 17.41 11.67 17.46H12.36C12.54 17.46 12.68 17.32 12.73 17.09V16.00C14.10 15.77 15.01 14.82 15.01 13.59V13.59Z" fill="white"/><path d="M9.66 18.37C6.10 17.09 4.27 13.13 5.60 9.63C6.28 7.72 7.79 6.26 9.66 5.58C9.85 5.49 9.94 5.35 9.94 5.12V4.48C9.94 4.30 9.85 4.17 9.66 4.12C9.62 4.12 9.53 4.12 9.48 4.17C8.45 4.49 7.50 5.01 6.67 5.70C5.85 6.39 5.16 7.24 4.67 8.20C4.17 9.15 3.87 10.20 3.78 11.27C3.68 12.35 3.81 13.43 4.13 14.45C4.96 17.00 6.92 18.96 9.48 19.78C9.66 19.87 9.85 19.78 9.89 19.60C9.94 19.55 9.94 19.51 9.94 19.41V18.78C9.94 18.64 9.80 18.46 9.66 18.37ZM14.51 4.17C14.33 4.07 14.14 4.17 14.10 4.35C14.05 4.39 14.05 4.44 14.05 4.53V5.17C14.05 5.35 14.19 5.53 14.33 5.62C17.89 6.90 19.72 10.86 18.39 14.36C17.71 16.27 16.20 17.73 14.33 18.41C14.14 18.50 14.05 18.64 14.05 18.87V19.51C14.05 19.69 14.19 19.82 14.33 19.87C14.37 19.87 14.46 19.87 14.51 19.83C18.5 18.5 20.8 14.2 19.5 10.1C18.8 7.4 16.9 5 14.51 4.17Z" fill="white"/></symbol><symbol id="i-gas" viewBox="0 0 24 24"><path d="M14 19H15V21H2V19H3V4C3 3.44 3.44 3 4 3H13C13.55 3 14 3.44 14 4V12H16C17.10 12 18 12.89 18 14V18C18 18.55 18.44 19 19 19C19.55 19 20 18.55 20 18V11H18C17.44 11 17 10.55 17 10V6.41L15.34 4.75L16.75 3.34L21.70 8.29C21.90 8.48 22 8.74 22 9V18C22 19.65 20.65 21 19 21C17.34 21 16 19.65 16 18V14H14V19ZM5 19H12V13H5V19ZM5 5V11H12V5H5Z" fill="currentColor"/></symbol><symbol id="i-coin" viewBox="0 0 24 24"><path d="M12.00 4.00C18.08 4.00 23.00 6.68 23.00 10.00V14.00C23.00 17.31 18.08 20.00 12.00 20.00C6.03 20.00 1.18 17.41 1.00 14.17L1.00 14.00V10.00C1.00 6.68 5.92 4.00 12.00 4.00ZM12.00 16.00C8.28 16.00 4.99 14.99 3.00 13.45L3.00 14.00C3.00 15.88 6.88 18.00 12.00 18.00C17.01 18.00 20.84 15.97 20.99 14.12L21.00 14.00L21.00 13.45C19.01 14.99 15.72 16.00 12.00 16.00ZM12.00 6.00C6.88 6.00 3.00 8.12 3.00 10.00C3.00 11.88 6.88 14.00 12.00 14.00C17.12 14.00 21.00 11.88 21.00 10.00C21.00 8.12 17.12 6.00 12.00 6.00Z" fill="currentColor"/></symbol><symbol id="i-slip" viewBox="0 0 12 12"><path d="M5.61 3.63C5.98 3.96 6.32 4.27 6.67 4.57C6.70 4.60 6.75 4.61 6.79 4.60C7.36 4.54 7.94 4.48 8.51 4.41C8.79 4.37 9.01 4.46 9.17 4.70C9.48 5.14 9.80 5.57 10.12 6.00C10.25 6.19 10.28 6.39 10.16 6.60C10.04 6.81 9.85 6.92 9.60 6.91C9.42 6.90 9.28 6.80 9.18 6.65C8.95 6.33 8.71 6.01 8.49 5.68C8.42 5.57 8.34 5.54 8.20 5.55C7.64 5.63 7.08 5.69 6.49 5.75C6.53 5.79 6.55 5.81 6.57 5.83C6.93 6.15 7.29 6.46 7.65 6.78C7.83 6.93 7.91 7.11 7.90 7.34C7.87 7.96 7.86 8.57 7.85 9.19C7.84 9.51 7.60 9.76 7.26 9.75C6.94 9.75 6.71 9.51 6.72 9.18C6.74 8.67 6.77 8.17 6.79 7.66C6.79 7.60 6.77 7.51 6.72 7.47C5.80 6.64 4.87 5.82 3.94 4.99C3.91 4.97 3.89 4.96 3.86 4.93C3.66 5.23 3.46 5.51 3.27 5.81C3.25 5.84 3.26 5.91 3.28 5.95C3.46 6.32 3.64 6.68 3.82 7.05C3.96 7.32 3.86 7.60 3.59 7.71C3.30 7.82 3.04 7.69 2.93 7.41C2.79 7.05 2.62 6.71 2.47 6.36C2.41 6.23 2.35 6.10 2.29 5.98C2.21 5.83 2.22 5.69 2.30 5.55C2.64 4.99 2.97 4.43 3.31 3.87C3.34 3.82 3.39 3.78 3.44 3.73C3.45 3.72 3.47 3.71 3.49 3.69C4.16 3.04 5.03 2.77 5.89 2.51C6.02 2.47 6.12 2.40 6.20 2.29C6.42 2.00 6.65 1.72 6.88 1.44C7.02 1.27 7.21 1.23 7.41 1.31C7.61 1.40 7.75 1.59 7.72 1.80C7.70 1.89 7.66 2.00 7.60 2.08C7.32 2.44 7.04 2.79 6.75 3.14C6.69 3.22 6.58 3.29 6.49 3.32C6.20 3.43 5.92 3.52 5.61 3.63H5.61Z" fill="currentColor"/><path d="M5.99 11.05C4.55 11.05 3.10 11.05 1.66 11.05C1.60 11.05 1.55 11.05 1.50 11.05C1.24 11.03 1.03 10.84 1.02 10.61C1.02 10.38 1.22 10.18 1.49 10.15C1.53 10.15 1.57 10.15 1.62 10.15C4.54 10.15 7.46 10.15 10.38 10.15C10.46 10.15 10.53 10.16 10.60 10.17C10.85 10.23 10.99 10.42 10.97 10.64C10.96 10.84 10.77 11.02 10.54 11.05C10.48 11.05 10.42 11.05 10.36 11.05C8.90 11.05 7.45 11.05 5.99 11.05Z" fill="currentColor"/><path d="M2.90 0.92C3.53 0.92 4.03 1.41 4.03 2.04C4.04 2.67 3.54 3.18 2.91 3.18C2.29 3.19 1.77 2.68 1.77 2.05C1.76 1.43 2.27 0.92 2.90 0.92Z" fill="currentColor"/></symbol><symbol id="i-mev-off" viewBox="0 0 24 24"><path d="M18.94 3.24C19.05 3.12 19.20 3.03 19.37 3.01C19.53 2.98 19.70 3.01 19.85 3.09C20.00 3.17 20.11 3.29 20.18 3.45C20.25 3.60 20.26 3.77 20.22 3.93C20.46 4.06 20.65 4.25 20.79 4.48C20.92 4.71 20.99 4.98 21 5.25V10.5C21 15.44 18.60 18.43 16.60 20.08C14.43 21.84 12.28 22.44 12.19 22.47C12.06 22.50 11.92 22.50 11.80 22.47C11.67 22.43 8.86 21.65 6.44 19.21L5.05 20.75C4.98 20.82 4.90 20.88 4.81 20.93C4.72 20.97 4.63 21.00 4.53 21.00C4.43 21.01 4.33 20.99 4.23 20.96C4.14 20.93 4.06 20.87 3.98 20.81C3.91 20.74 3.85 20.66 3.81 20.57C3.76 20.48 3.74 20.38 3.74 20.28C3.73 20.18 3.75 20.08 3.78 19.99C3.82 19.90 3.87 19.81 3.94 19.74L18.94 3.24ZM12.00 20.96C13.32 20.50 14.56 19.80 15.64 18.91C18.20 16.82 19.5 13.99 19.5 10.5V5.25H19.15L7.46 18.10C8.74 19.38 10.29 20.36 12 20.96H12.00ZM3 5.25V10.5C3 12.42 3.36 14.21 4.08 15.80C4.16 15.98 4.31 16.12 4.50 16.19C4.68 16.26 4.89 16.26 5.07 16.17C5.25 16.09 5.39 15.94 5.46 15.76C5.53 15.57 5.53 15.36 5.45 15.18C4.81 13.79 4.5 12.21 4.5 10.5V5.25H14.76C14.96 5.25 15.15 5.17 15.29 5.03C15.43 4.88 15.51 4.69 15.51 4.50C15.51 4.30 15.43 4.11 15.29 3.96C15.15 3.82 14.96 3.75 14.76 3.75H4.5C4.10 3.75 3.72 3.90 3.43 4.18C3.15 4.47 3 4.85 3 5.25Z" fill="currentColor"/></symbol><symbol id="i-mev-on" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" d="M4 5.2C4 4.6 4.5 4.2 5 4.2H19C19.6 4.2 20 4.6 20 5.2V10.5C20 17.5 12 21.7 12 21.7S4 17.5 4 10.5Z"/><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="M8.5 12.2l2.4 2.4 4.6-4.9"/></symbol><symbol id="i-cb" viewBox="0 0 24 24"><path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" fill="currentColor"/></symbol><symbol id="i-cb-on" viewBox="0 0 24 24"><path fill="currentColor" d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></symbol><symbol id="i-swap" viewBox="0 0 17 16"><path d="M3.41 11.33H14.08M14.08 11.33L11.41 8.66M14.08 11.33L11.41 14M14.08 4.66H3.41M3.41 4.66L6.08 2M3.41 4.66L6.08 7.33" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></symbol><symbol id="i-editok" viewBox="0 0 16 16"><path d="M13.3333 4.5L5.99996 11.8333L2.66663 8.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></symbol></svg>',
    xt = (e, t) => '<svg class="ic" width="' + t + '" height="' + t + '"><use href="#' + e + '"/></svg>',
    St = (e, t, s) =>
      '<svg class="ic swp" width="' + s + '" height="' + s + '"><use href="#' + e + '"/></svg><i class="ri ri-' + t + '"></i>',
    Ct = St("i-kbd", "keyboard-box-line", 16),
    Lt = St("i-edit", "edit-line", 16),
    qt = St("i-editok", "check-line", 16),
    Mt = St("i-gear", "settings-3-line", 16),
    Et = St("i-alarm", "timer-line", 16),
    At = St("i-x", "close-line", 16),
    $t = St("i-wallet", "wallet-line", 14);
  try {
    chrome.runtime.onMessage.addListener((e, t, s) => {
      !e ||
        ("togglePanel" !== e.cmd && "openSettings" !== e.cmd) ||
        (g && Y()
          ? ("togglePanel" === e.cmd ? (m ? ((v = !v), zs()) : Rt("stats")) : Rt(), s({ ok: !0 }))
          : s({ ok: !1, why: g ? "off" : "loading" }));
    });
  } catch (e) {}
  let Tt = 30,
    Bt = "";
  function Pt() {
    const e = y.panes.set.querySelector(".dash");
    if (!e) return;
    const t = (function (e) {
        const t = Date.now(),
          s = e ? t - 864e5 * e : 0,
          a = n.trades
            .filter((e) => e.closedAt >= s && p(e))
            .slice()
            .sort((e, t) => e.closedAt - t.closedAt),
          o = a.length,
          l = a.filter((e) => e.pnlSol > 0).length,
          i = a.reduce((e, t) => e + t.pnlSol, 0),
          r = a.reduce((e, t) => e + t.investedSol, 0),
          c = a.reduce((e, t) => e + (t.feesSol || 0), 0),
          d = a.reduce((e, t) => (!e || t.pnlSol > e.pnlSol ? t : e), null),
          u = a.reduce((e, t) => (!e || t.pnlSol < e.pnlSol ? t : e), null),
          h = o ? a.reduce((e, t) => e + (t.closedAt - t.openedAt), 0) / o : 0,
          m = a.filter((e) => e.pnlSol > 0).reduce((e, t) => e + t.pnlSol, 0),
          v = -a.filter((e) => e.pnlSol <= 0).reduce((e, t) => e + t.pnlSol, 0),
          f = v > 0 ? m / v : m > 0 ? 1 / 0 : 0;
        let y = 0;
        const g = [{ t: a.length ? Math.min(a[0].openedAt || a[0].closedAt, s || a[0].closedAt) : t - 864e5, v: 0 }];
        for (const e of a) ((y += e.pnlSol), g.push({ t: e.closedAt, v: y }));
        const b = (e) => {
            const t = new Date(e);
            return t.getFullYear() + "-" + String(t.getMonth() + 1).padStart(2, "0") + "-" + String(t.getDate()).padStart(2, "0");
          },
          k = {};
        for (const e of a) {
          const t = b(e.closedAt);
          k[t] = (k[t] || 0) + e.pnlSol;
        }
        const w = [],
          x = e || Math.max(7, Math.ceil((t - (a[0] ? a[0].closedAt : t)) / 864e5) + 1),
          S = new Date();
        S.setHours(12, 0, 0, 0);
        for (let e = Math.min(x, 90) - 1; e >= 0; e--) {
          const t = new Date(S.getTime() - 864e5 * e),
            s = b(t.getTime());
          w.push({ k: s, d: t, v: k[s] || 0 });
        }
        return { T: a, n: o, wins: l, pnl: i, inv: r, fees: c, best: d, worst: u, avgHold: h, pf: f, curve: g, days: w };
      })(Tt),
      s = e.clientWidth || 600,
      a = [n.trades.length, (n.trades[0] || {}).closedAt, Tt, E(), s, Math.round(l)].join("|");
    if (Bt === a) return;
    Bt = a;
    const o = t.n ? (t.wins / t.n) * 100 : 0,
      i = t.inv > 0 ? (t.pnl / t.inv) * 100 : 0,
      r =
        t.avgHold >= 36e5
          ? (t.avgHold / 36e5).toFixed(1) + "h"
          : t.avgHold >= 6e4
            ? Math.round(t.avgHold / 6e4) + "m"
            : Math.round(t.avgHold / 1e3) + "s",
      c = (e) => (e >= 0 ? "+" : "") + oe(e, { d: 2 }),
      d = (e, t, s, n) =>
        `<div class="dt"><div class="dk">${e}</div><div class="dv ${s || ""}">${t}</div>${n ? `<div class="ds">${n}</div>` : ""}</div>`,
      u = t.T.slice(-8)
        .reverse()
        .map(
          (e) =>
            `<tr>\n        <td class="sym">${e.symbol || "?"}</td>\n        <td class="dim">${oe(e.investedSol, { d: 3 })}</td>\n        <td class="${e.pnlSol >= 0 ? "up" : "down"}">${le(e.pnlSol)}</td>\n        <td class="${e.pnlSol >= 0 ? "up" : "down"}">${ce(e.pnlPct, 1)}</td>\n        <td class="dim2">${yn(e.closedAt)} ago</td>\n        <td class="shcell"><span class="kc" data-i="${n.trades.indexOf(e)}" title="Killcam">▶</span><span class="sh" data-i="${n.trades.indexOf(e)}" title="PNL card">▣</span></td></tr>`,
        )
        .join("");
    ((e.innerHTML = `\n      <div class="drange">${[
      [7, "7 days"],
      [30, "30 days"],
      [0, "All time"],
    ]
      .map(([e, t]) => `<span class="dr ${Tt === e ? "on" : ""}" data-r="${e}">${t}</span>`)
      .join(
        "",
      )}</div>\n      <div class="dhero ${t.pnl >= 0 ? "up" : "down"}"><div class="dk">Net profit</div><div class="dbig">${t.n ? le(t.pnl) : "—"}</div>\n        <div class="ds">${t.n} trade${t.n > 1 ? "s" : ""} · ${oe(t.inv, { d: 2 })} invested · ${oe(t.fees, { d: 3 })} fees</div></div>\n      <div class="dtiles">\n        ${d("Win rate", t.n ? o.toFixed(0) + "%" : "—", t.n ? (o >= 50 ? "up" : "down") : "", t.n ? `<span class="up">${t.wins}</span> / <span class="down">${t.n - t.wins}</span>` : "")}\n        ${d("ROI", t.n ? ce(i, 1) : "—", t.n ? (i >= 0 ? "up" : "down") : "")}\n        ${d("Profit factor", t.n ? (t.pf === 1 / 0 ? "∞" : t.pf.toFixed(2)) : "—", t.n ? (t.pf >= 1 ? "up" : "down") : "", "gains / losses")}\n        ${d("Best", t.best ? c(t.best.pnlSol) : "—", t.best && t.best.pnlSol >= 0 ? "up" : "down", t.best ? t.best.symbol : "")}\n        ${d("Worst", t.worst ? c(t.worst.pnlSol) : "—", t.worst && t.worst.pnlSol >= 0 ? "up" : "down", t.worst ? t.worst.symbol : "")}\n        ${d("Avg hold", t.n ? r : "—", "")}\n      </div>\n      <div class="dch"><div class="dk">Equity curve <span class="dim2">cumulative PNL</span></div><canvas class="dcv deq"></canvas><div class="dtip"></div></div>\n      <div class="dch"><div class="dk">PNL per day</div><canvas class="dcv dday"></canvas><div class="dtip"></div></div>\n      <div class="dch"><div class="dk">Last trades</div>${u ? `<table class="dtab"><tr><th>Token</th><th>Invested</th><th>PNL</th><th>%</th><th>Closed</th><th></th></tr>${u}</table>` : '<div class="empty">No closed trades in this period.</div>'}</div>`),
      e.querySelectorAll(".dr").forEach(
        (e) =>
          (e.onclick = () => {
            ((Tt = +e.dataset.r), (Bt = ""), Pt());
          }),
      ),
      e.querySelectorAll(".sh").forEach((e) => (e.onclick = () => Qn(n.trades[+e.dataset.i]))),
      e.querySelectorAll(".kc").forEach((e) => (e.onclick = () => Yn(n.trades[+e.dataset.i]))),
      (function (e, t) {
        if (!e) return;
        const { g: s, w: n, h: a, up: o, down: l, tx: i, dim: r, line: c, bg: d, font: p, mono: u } = Ht(e, 220),
          h = t.curve,
          m = 12,
          v = 86,
          f = 14,
          y = 26;
        if (h.length < 2)
          return (
            (s.fillStyle = r),
            (s.font = p),
            (s.textAlign = "center"),
            void s.fillText("The curve starts with your first closed trade.", n / 2, a / 2)
          );
        let g = Math.min(0, ...h.map((e) => e.v)),
          b = Math.max(0, ...h.map((e) => e.v));
        b === g && ((b += 0.01), (g -= 0.01));
        const k = 0.12 * (b - g);
        ((g -= k), (b += k));
        const w = h[0].t,
          x = Math.max(h[h.length - 1].t, w + 1),
          S = (e) => m + ((n - m - v) * (e - w)) / (x - w),
          C = (e) => f + (a - f - y) * (1 - (e - g) / (b - g));
        ((s.font = u), (s.fillStyle = r), (s.textAlign = "left"));
        for (let e = 0; e <= 4; e++) {
          const t = g + ((b - g) * e) / 4,
            a = C(t);
          ((s.strokeStyle = Ft(c, 0.8)),
            (s.lineWidth = 1),
            s.beginPath(),
            s.moveTo(m, a),
            s.lineTo(n - v + 6, a),
            s.stroke(),
            s.fillText(oe(t, { d: 2 }), n - v + 12, a + 4));
        }
        (s.setLineDash([3, 4]),
          (s.strokeStyle = Ft(i, 0.25)),
          s.beginPath(),
          s.moveTo(m, C(0)),
          s.lineTo(n - v + 6, C(0)),
          s.stroke(),
          s.setLineDash([]),
          (s.fillStyle = r),
          (s.textAlign = "center"));
        const L = Math.max(2, Math.min(6, Math.floor((n - m - v) / 110))),
          q = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          M = (e) => {
            const t = new Date(e);
            return t.getDate() + " " + q[t.getMonth()];
          };
        for (let e = 0; e <= L; e++) {
          const t = w + ((x - w) * e) / L;
          s.fillText(M(t), S(t), a - 8);
        }
        const E = h[h.length - 1],
          A = E.v >= 0 ? o : l,
          $ = () => {
            (s.beginPath(),
              h.forEach((e, t) => {
                t ? (s.lineTo(S(e.t), C(h[t - 1].v)), s.lineTo(S(e.t), C(e.v))) : s.moveTo(S(e.t), C(e.v));
              }));
          };
        ($(), s.lineTo(S(E.t), C(0)), s.lineTo(S(h[0].t), C(0)), s.closePath());
        const T = s.createLinearGradient(0, C(Math.max(b - k, E.v)), 0, C(0));
        (T.addColorStop(0, Ft(A, 0.28)),
          T.addColorStop(1, Ft(A, 0)),
          (s.fillStyle = T),
          s.fill(),
          $(),
          (s.strokeStyle = A),
          (s.lineWidth = 2),
          (s.lineJoin = "round"),
          s.stroke(),
          s.beginPath(),
          s.arc(S(E.t), C(E.v), 4, 0, 7),
          (s.fillStyle = A),
          s.fill(),
          s.beginPath(),
          s.arc(S(E.t), C(E.v), 8, 0, 7),
          (s.fillStyle = Ft(A, 0.25)),
          s.fill());
        const B = le(E.v);
        s.font = "600 11px " + (cs() || 'Geist, "Geist Variable"') + ", system-ui, sans-serif";
        const P = s.measureText(B).width,
          H = Math.min(n - v + 8, n - P - 16);
        ((s.fillStyle = A),
          ea(s, H, C(E.v) - 10, P + 12, 20, 5),
          s.fill(),
          (s.fillStyle = E.v >= 0 ? d : "#fff"),
          (s.textAlign = "left"),
          s.fillText(B, H + 6, C(E.v) + 4));
        const F = e.parentElement.querySelector(".dtip");
        ((e.onmousemove = (e) => {
          const t = e.offsetX;
          let s = null,
            a = 1e9;
          for (const e of h) {
            const n = Math.abs(S(e.t) - t);
            n < a && ((a = n), (s = e));
          }
          !s || a > 40
            ? (F.style.display = "none")
            : ((F.style.display = ""),
              (F.innerHTML = `<b class="${s.v >= 0 ? "up" : "down"}">${le(s.v)}</b><span>${new Date(s.t).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>`),
              (F.style.left = Math.min(n - 150, Math.max(0, S(s.t) - 60)) + "px"),
              (F.style.top = C(s.v) - 44 + "px"));
        }),
          (e.onmouseleave = () => {
            F.style.display = "none";
          }));
      })(e.querySelector(".deq"), t),
      (function (e, t) {
        if (!e) return;
        const { g: s, w: n, h: a, up: o, down: l, tx: i, dim: r, line: c, font: d, mono: p } = Ht(e, 160),
          u = t.days,
          h = 12,
          m = 92,
          v = 12,
          f = 24,
          y = Math.max(0.001, ...u.map((e) => Math.abs(e.v))),
          g = (e) => v + (a - v - f) * (1 - (e + y) / (2 * y));
        ((s.font = p), (s.fillStyle = r), (s.textAlign = "left"));
        for (const e of [y, 0, -y]) {
          const t = g(e);
          ((s.strokeStyle = Ft(c, 0.8)),
            s.beginPath(),
            s.moveTo(h, t),
            s.lineTo(n - m + 6, t),
            s.stroke(),
            s.fillText((e >= 0 ? "+" : "") + oe(e, { d: 2 }), n - m + 12, t + 4));
        }
        const b = (n - h - m) / u.length,
          k = Math.max(3, Math.min(22, 0.66 * b));
        (u.forEach((e, t) => {
          const n = h + b * t + (b - k) / 2;
          if (!e.v) return ((s.fillStyle = Ft(i, 0.08)), void s.fillRect(n, g(0) - 1, k, 2));
          s.fillStyle = e.v > 0 ? o : l;
          const a = g(Math.max(0, e.v)),
            r = g(Math.min(0, e.v));
          (ea(s, n, a, k, Math.max(2, r - a), 3), s.fill());
        }),
          (s.fillStyle = r),
          (s.font = p),
          (s.textAlign = "center"));
        const w = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          x = Math.max(1, Math.ceil(u.length / Math.max(2, Math.floor((n - h - m) / 80))));
        u.forEach((e, t) => {
          ((t % x === 0 && t <= u.length - x / 2) || t === u.length - 1) &&
            s.fillText(e.d.getDate() + " " + w[e.d.getMonth()], h + b * t + b / 2, a - 8);
        });
        const S = e.parentElement.querySelector(".dtip");
        ((e.onmousemove = (e) => {
          const t = Math.floor((e.offsetX - h) / b),
            s = u[t];
          s
            ? ((S.style.display = ""),
              (S.innerHTML = `<b class="${s.v > 0 ? "up" : s.v < 0 ? "down" : ""}">${s.v ? le(s.v) : "no trade"}</b><span>${s.d.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })}</span>`),
              (S.style.left = Math.min(n - 150, Math.max(0, h + b * t + b / 2 - 60)) + "px"),
              (S.style.top = "6px"))
            : (S.style.display = "none");
        }),
          (e.onmouseleave = () => {
            S.style.display = "none";
          }));
      })(e.querySelector(".dday"), t));
  }
  function Ht(e, t) {
    const s = e.parentElement.clientWidth || 600,
      n = Math.min(2, devicePixelRatio || 1);
    ((e.width = Math.round(s * n)), (e.height = Math.round(t * n)), (e.style.width = s + "px"), (e.style.height = t + "px"));
    const a = e.getContext("2d");
    a.scale(n, n);
    const o = getComputedStyle(y.smodal);
    return {
      g: a,
      w: s,
      h: t,
      up: o.getPropertyValue("--up").trim() || "#6fdc90",
      down: o.getPropertyValue("--down").trim() || "#ff007b",
      tx: o.getPropertyValue("--tx").trim() || "#dde1e9",
      dim: o.getPropertyValue("--dim").trim() || "#6a707f",
      line: o.getPropertyValue("--line").trim() || "#2e303a",
      bg: o.getPropertyValue("--bg").trim() || "#101011",
      font: "500 11px " + (cs() || 'Geist, "Geist Variable"') + ", system-ui, sans-serif",
      mono: '500 10.5px ui-monospace, "Geist Mono", "Geist Mono Variable", Menlo, monospace',
    };
  }
  const Ft = (e, t) => {
    const s = String(e).match(/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    return s ? `rgba(${parseInt(s[1], 16)},${parseInt(s[2], 16)},${parseInt(s[3], 16)},${t})` : e;
  };
  function _t(e) {
    const t = e && e.querySelector(".skinrow");
    if (!t) return;
    const s = n && n.settings && Ee.indexOf(n.settings.skin) >= 0 ? n.settings.skin : "auto";
    t.querySelectorAll(".th").forEach((e) => {
      (e.classList.toggle("on", e.dataset.k === s),
        (e.onclick = () => {
          return (
            (t = "auto" === e.dataset.k ? null : e.dataset.k),
            void (
              n &&
              ((n.settings.skin = Ee.indexOf(t) >= 0 ? t : null),
              W({ cmd: "settings", settings: { skin: (t = n.settings.skin) } }),
              Te(),
              zs())
            )
          );
          var t;
        }));
    });
  }
  const Ot = [
    {
      id: "dash",
      title: "Dashboard",
      keys: ["Dashboard"],
      desc: "Your paper trading at a glance: profit, win rate, the equity curve and the last trades.",
    },
    {
      id: "stats",
      title: "Stats",
      pane: "stats",
      keys: [],
      desc: "Your paper record: balance, win rate, best and worst trades, the calendar.",
    },
    { id: "log", title: "History", pane: "log", keys: [], desc: "Every closed trade, with its PNL card and its killcam." },
    {
      id: "qb",
      title: "Quick buy",
      keys: ["Quick buy"],
      desc: "The one-click paper buy on every trenches and Pulse card — amount, look, placement.",
    },
    {
      id: "wallet",
      title: "Wallet & backup",
      keys: ["Wallet"],
      desc: "Your virtual balance, a backup file with everything, and the reset.",
    },
    {
      id: "look",
      title: "Look",
      keys: ["Style", "Theme", "Font"],
      desc: "Theme and typeface of the panel, the balance card and this window.",
    },
    {
      id: "card",
      title: "Balance card",
      keys: ["Balance card"],
      desc: "The floating card in the style of their PnL Tracker. Every change shows in the preview.",
    },
    {
      id: "pnl",
      title: "PNL card",
      keys: ["PNL card"],
      desc: "The shareable card of a trade, with the real price animated behind the numbers.",
    },
    { id: "sound", title: "Sound", keys: ["Sound"], desc: "A sound for buys, one for sells — the default beeps or your own files." },
    {
      id: "feed",
      title: "Tracking",
      pane: "track",
      keys: [],
      desc: "Your pseudo, the traders you follow, and the live feed of their trades — the same one their bubbles on your chart come from.",
    },
    {
      id: "lb",
      title: "Leaderboard",
      keys: ["Leaderboard"],
      desc: "The public ranking of paper traders on trade-blanks.com: where you stand, and who is ahead.",
    },
    {
      id: "news",
      title: "Updates",
      keys: ["Updates", "What's new"],
      desc: "What changed in each version — and one email when a new one ships, if you want it.",
    },
  ];
  let Vt = "dash";
  BX$.api = {
    SECTIONS: Ot,
    get S() { return n; },
    get el() { return y; },
    get root() { return h; },
    get pairAddr() { return m; },
    get solUsd() { return l; },
    get secCur() { return Vt; },
    send: (e) => W(e),
    toast: (e, t) => Yt(e, t),
    render: () => zs(),
    pair: () => $(),
    pos: () => B(),
    mkt: () => T(),
    asset: () => d(),
    balance: () => u(),
    skin: () => Ae(),
    exitList: () => fe(),
    openSettings: (e) => Rt(e),
    live: () => V(!0),
    icon: (a) => t(a),
    killcam: (tr) => Yn(tr || (n && n.trades && n.trades[0]) || Jn()),
    sampleTrade: () => Jn(),
    E: e,
  };
  const Nt = ["orders", "stats", "log", "track"],
    zt =
      '<svg viewBox="0 0 128 128" aria-hidden="true"><line x1="64" y1="22" x2="64" y2="106" stroke="#0b0b0b" stroke-width="12" stroke-linecap="round"/><rect x="38" y="42" width="52" height="46" rx="9" fill="#0b0b0b"/><rect x="51" y="55" width="26" height="20" rx="4" fill="#1fbf6f"/></svg>';
  function Dt() {
    const e = y.panes.set;
    if (!e) return;
    ("track" === Vt && (Vt = "feed"),
      Ot.some((e) => e.id === Vt) || (Vt = "dash"),
      e.classList && e.classList.toggle("wide", "dash" === Vt));
    const t = Ot.find((e) => e.id === Vt),
      s = Ot.indexOf(t),
      a = y.smodal.querySelector(".scont");
    e.style.display = t.pane ? "none" : "";
    for (const e of Nt) {
      const s = y.panes[e];
      s && (t.pane === e ? (s.parentElement !== a && a.appendChild(s), s.classList.add("on", "inset")) : s.classList.remove("on"));
    }
    e.querySelectorAll(":scope > .card").forEach((e) => {
      const s = e.querySelector(":scope > .lbl"),
        n = s ? (s.textContent || "").trim() : "",
        a = t.keys.some((e) => n.startsWith(e));
      (a && "none" === e.style.display && ((e.style.animation = "none"), e.offsetWidth, (e.style.animation = "")),
        (e.style.display = a ? "" : "none"));
    });
    const o = y.smodal.querySelector(".shero");
    (o &&
      ((o.querySelector(".eb").textContent = "Section · " + String(s + 1).padStart(2, "0")),
      (o.querySelector("h2").textContent = t.title),
      (o.querySelector("p").textContent = t.desc),
      (o.style.animation = "none"),
      o.offsetWidth,
      (o.style.animation = "")),
      y.smodal.querySelectorAll(".sni").forEach((e) => e.classList.toggle("on", e.dataset.s === Vt)),
      a && (a.scrollTop = 0),
      "dash" === Vt && n && ((Bt = ""), Pt()),
      "news" === Vt && (gs(), ys()),
      "track" === Vt && qn(),
      t.pane && zs(),
      "lb" === Vt && (Bn(!0), An()),
      BX$.hooks.section && BX$.hooks.section(Vt, e));
  }
  function Rt(e) {
    if (!y.smodal) return;
    (e ? (Vt = e) : x.sec && (Vt = x.sec),
      Dt(),
      y.smodal.classList.remove("out"),
      y.smodal.classList.add("on"),
      (y.smodal.dataset.theme = (n && n.settings.theme) || "padre"),
      ks());
    const t = (e) => {
      "Escape" === e.key && (Ut(), window.removeEventListener("keydown", t, !0), h.removeEventListener("keydown", t, !0));
    };
    (window.addEventListener("keydown", t, !0), h.addEventListener("keydown", t, !0));
  }
  function Ut() {
    const e = y.smodal;
    e && e.classList.contains("on") && (e.classList.add("out"), e.classList.remove("on"), setTimeout(() => e.classList.remove("out"), 240));
  }
  function jt(e, t, s) {
    let n = 0,
      a = 0,
      o = 0,
      l = 0,
      i = 0,
      r = 0,
      c = !1,
      d = 0,
      p = null,
      u = 60,
      h = 30,
      m = 1;
    const v = () => {
      ((d = 0), (e.style.transform = "translate3d(" + i + "px," + r + "px,0)"));
    };
    (t.addEventListener("pointerdown", (s) => {
      if (0 === s.button && !s.target.closest(".ico, .grip, .pcrz, .pcctl, .pslot, .pb, .wpill, input, .exitck")) {
        ((c = !0),
          (S = !0),
          (p = s.pointerId),
          (n = s.clientX),
          (a = s.clientY),
          (i = r = 0),
          (o = parseInt(e.style.left) || 0),
          (l = parseInt(e.style.top) || 0),
          (m = parseFloat(getComputedStyle(e).zoom) || 1),
          m > 0 || (m = 1),
          e.classList.add("drag"),
          (u = Math.min(e.offsetWidth || 60, 60)),
          (h = Math.min(e.offsetHeight || 30, 30)),
          (e.style.willChange = "transform"));
        try {
          t.setPointerCapture(p);
        } catch (e) {}
        s.preventDefault();
      }
    }),
      t.addEventListener("pointermove", (e) => {
        c &&
          ((i = Math.max(-o, Math.min(innerWidth / m - u - o, (e.clientX - n) / m))),
          (r = Math.max(-l, Math.min(innerHeight / m - h - l, (e.clientY - a) / m))),
          d || (d = requestAnimationFrame(v)));
      }));
    const f = () => {
      if (!c) return;
      ((c = !1), (S = !1), e.classList.remove("drag"), d && (cancelAnimationFrame(d), (d = 0)));
      try {
        t.releasePointerCapture(p);
      } catch (e) {}
      const n = (e) => Math.round(e * m) / m,
        a = n(o + i),
        u = n(l + r);
      ((e.style.transform = ""),
        (e.style.willChange = ""),
        (e.style.left = a + "px"),
        (e.style.top = u + "px"),
        L("card" === s ? { cardX: a, cardY: u } : "launch" === s ? { lx: a, ly: u } : { x: a, y: u }),
        zs());
    };
    (t.addEventListener("pointerup", f), t.addEventListener("pointercancel", f));
  }
  function Zt(t) {
    const s = +t.dataset.slot || 0,
      a = t.dataset.side || "buy",
      o = t.dataset.asset || d(),
      l = e.feesOf(Object.assign({}, n.settings, { slot: s }), a, o);
    (t.querySelectorAll(".fpre b").forEach((e) => e.classList.toggle("on", +e.dataset.o === s)),
      t.querySelectorAll(".fside b").forEach((e) => e.classList.toggle("on", e.dataset.o === a)),
      t.querySelectorAll(".fside").forEach((e) => (e.dataset.side = a)));
    const i = h.activeElement;
    (t.querySelectorAll("input[data-f]").forEach((e) => {
      e !== i && (e.value = +(+l[e.dataset.f] || 0).toFixed("slip" === e.dataset.f ? 2 : 6));
    }),
      t.__onSync && t.__onSync(s, a));
  }
  function It(t, s) {
    ((t.dataset.asset = s),
      (t.innerHTML = (function (e) {
        const t = "SOL" !== e,
          s = {
            slip: "Max slippage you accept with this preset. The slippage you really get is random, always against you, and never above 1.5%.",
            prio: "Priority fee, in SOL, paid on every trade with this preset.",
            tip: "Jito tip, in SOL, paid on every trade with this preset.",
            gas: "Gas paid on every swap with this preset.",
          },
          n = (e, t, n, a) =>
            `<label class="fc" data-tip="${s[e]}"><span class="fcin"><input data-f="${e}" inputmode="decimal" autocomplete="off">${a ? "<i>" + a + "</i>" : ""}</span><span class="fcl">${t}${n}</span></label>`;
        return `<div class="fseg fpre">${[0, 1, 2].map((e) => `<b data-o="${e}" data-tip="Edit the fees of preset ${e + 1}">P${e + 1}</b>`).join("")}</div>\n      <div class="fseg fside"><b data-o="buy" data-tip="Fees used when you buy">Buy settings</b><b data-o="sell" data-tip="Fees used when you sell">Sell settings</b></div>\n      <div class="fcards ${t ? "two" : ""}">\n        ${n("slip", xt("i-slip", 14), "Slippage", "%")}\n        ${t ? n("gas", St("i-gas", "gas-station-line", 14), "Gas", e) : n("prio", St("i-gas", "gas-station-line", 14), "Priority", "SOL") + n("tip", St("i-coin", "coin-line", 14), "Tip", "SOL")}\n      </div>`;
      })(s)),
      t.querySelectorAll(".fpre b").forEach(
        (e) =>
          (e.onclick = () => {
            ((t.dataset.slot = e.dataset.o), Zt(t));
          }),
      ),
      t.querySelectorAll(".fside b").forEach(
        (e) =>
          (e.onclick = () => {
            ((t.dataset.side = e.dataset.o), Zt(t));
          }),
      ),
      t.querySelectorAll("input[data-f]").forEach((s) => {
        (s.addEventListener("keydown", (e) => {
          (e.stopPropagation(), "Enter" === e.key && s.blur());
        }),
          s.addEventListener("focus", () => s.select()));
        s.addEventListener("change", () => {
          const a = de(s.value),
            o = s.dataset.f;
          if (!(isFinite(a) && a >= 0) || ("slip" === o && a > 100))
            return (Zt(t), Yt("slip" === o ? "slippage between 0 and 100%" : "invalid fee", "bad"));
          const l = +t.dataset.slot || 0,
            i = t.dataset.side || "buy",
            r = t.dataset.asset,
            c = e.feeKey(r),
            d = [0, 1, 2].map((e) => {
              const t = (n.settings[c] || [])[e] || {};
              return { buy: Object.assign({}, t.buy), sell: Object.assign({}, t.sell) };
            });
          ((d[l][i] = Object.assign(e.feesOf(Object.assign({}, n.settings, { slot: l }), i, r), { [o]: a })),
            (n.settings[c] = d),
            W({ cmd: "settings", settings: { [c]: d } }),
            zs());
        });
      }),
      Zt(t));
  }
  function Gt(t) {
    if (!y.fees) {
      const e = document.createElement("div");
      ((e.className = "tsx"),
        (e.innerHTML = `<div class="tsh"><span>Trading Settings</span><div class="tsc" title="Close">${At}</div></div>\n        <div class="fed"></div>\n        <div class="tsmore">\n          <div class="tsrow"><span class="tsl" data-tip="Time between your click and the fill, like a real transaction landing. 0 means instant.">Execution delay</span><span class="fcin sm"><input data-g="execDelayMs" data-max="10000" inputmode="numeric"><i>ms</i></span></div>\n          <div class="tsrow"><span class="tsl" data-tip="Terminal’s own fee, taken on every buy and sell (0.9% by default).">Platform fee</span><span class="fcin sm"><input data-g="platformFeePct" data-max="10" inputmode="decimal"><i>%</i></span></div>\n          <div class="tsrow"><span class="tsl" data-tip="The part of the platform fee you get back — it lowers the fee you really pay.">Cashback on that fee</span><span class="fcin sm"><input data-g="cashbackPct" data-max="100" inputmode="decimal"><i>%</i></span></div>\n          <div class="tsrow"><span class="tsl" data-tip="Only used when the pool’s reserves are unknown: a fixed slippage applied to the fill instead of the real price impact.">Slippage with no liquidity data</span><span class="fcin sm"><input data-g="fallbackSlippagePct" data-max="50" inputmode="decimal"><i>%</i></span></div>\n          <div class="tsrow"><span class="tsl" data-tip="When on, hovering a buy or sell button shows what you would get: tokens, fees and price impact — before you click.">Fill preview on hover</span><span class="tssw" data-sw="previews"></span></div>\n        </div>\n        <div class="tsft"><span class="tsnote">Fees are saved on the preset, for this side. Same maths as a real fill.</span><div class="tsok">Done</div></div>`),
        h.appendChild(e),
        (y.fees = e),
        (e.querySelector(".tsc").onclick = Wt),
        (e.querySelector(".tsok").onclick = Wt),
        e.querySelectorAll("[data-g]").forEach((e) => {
          (e.addEventListener("keydown", (t) => {
            (t.stopPropagation(), "Enter" === t.key && e.blur(), "Escape" === t.key && Wt());
          }),
            e.addEventListener("focus", () => e.select()),
            e.addEventListener("change", () => {
              const t = e.dataset.g,
                s = "execDelayMs" === t ? Math.round(de(e.value)) : de(e.value);
              isFinite(s) && s >= 0 && s <= +e.dataset.max
                ? ((n.settings[t] = s), W({ cmd: "settings", settings: { [t]: s } }), zs())
                : ((e.value = n.settings[t] || 0), Yt("between 0 and " + e.dataset.max, "bad"));
            }));
        }));
      const t = e.querySelector('[data-sw="previews"]');
      ((t.onclick = () => {
        const e = !n.settings.previews;
        ((n.settings.previews = e), t.classList.toggle("on", e), W({ cmd: "settings", settings: { previews: e } }), zs());
      }),
        e.addEventListener("pointerdown", (e) => e.stopPropagation()),
        e.addEventListener("keydown", (e) => {
          (e.stopPropagation(), "Escape" === e.key && Wt());
        }),
        document.addEventListener("pointerdown", () => Wt()),
        h.addEventListener("pointerdown", (e) => {
          !y.fees || y.fees.contains(e.target) || (e.target.closest && e.target.closest("[data-fee]")) || Wt();
        }));
    }
    const s = y.fees,
      a = s.querySelector(".fed");
    ((s.dataset.skin = Ae() || "terminal"),
      (a.dataset.slot = String(n.settings.slot || 0)),
      (a.dataset.side = t || "buy"),
      It(a, d()),
      s.querySelectorAll("[data-g]").forEach((t) => {
        t.value = void 0 !== n.settings[t.dataset.g] ? n.settings[t.dataset.g] : e.DEFAULTS[t.dataset.g] || 0;
      }),
      s.querySelector('[data-sw="previews"]').classList.toggle("on", !!n.settings.previews),
      s.classList.add("on"));
    const o = y.wrap.getBoundingClientRect(),
      l = s.offsetWidth || 364,
      i = s.offsetHeight || 300;
    let r = o.left - l - 8;
    (r < 8 && (r = o.right + 8), r + l > innerWidth - 8 && (r = Math.max(8, innerWidth - l - 8)));
    let c = o.top;
    (c + i > innerHeight - 8 && (c = Math.max(8, innerHeight - i - 8)),
      (s.style.left = Math.round(r) + "px"),
      (s.style.top = Math.round(c) + "px"));
    const p = s.querySelector(".fcards input");
    p &&
      setTimeout(() => {
        try {
          p.focus();
        } catch (e) {}
      }, 30);
  }
  function Wt() {
    y.fees && y.fees.classList.remove("on");
  }
  let Kt;
  function Yt(e, t) {
    /* La fenetre des reglages recouvre le panneau, et hors d'un chart le panneau est
       cache : le message s'affiche alors dans la fenetre, sinon il etait invisible
       (« ca fait rien » quand un pseudo ou Google echouait). */
    if (y.smodal && y.smodal.classList.contains("on")) {
      const box = y.smodal.querySelector(".sbox") || y.smodal;
      let mt = box.querySelector(":scope > .mtoast");
      mt || ((mt = document.createElement("div")), (mt.className = "mtoast"), box.appendChild(mt));
      ((mt.textContent = e), (mt.className = "mtoast on" + (t ? " " + t : "")), clearTimeout(Yt.mt));
      Yt.mt = setTimeout(() => mt.classList.remove("on"), "bad" === t ? 7e3 : "wait" === t ? 6e3 : 3200);
      return;
    }
    y.toast &&
      ((y.toast.textContent = e),
      (y.toast.className = "toast on" + (t ? " " + t : "")),
      clearTimeout(Kt),
      (Kt = setTimeout(() => y.toast.classList.remove("on"), "wait" === t ? 6e3 : 2600)));
  }
  let Jt = null;
  function Xt(e) {
    return "both" === Jt.side ? Jt[e] : Jt.list;
  }
  function Qt(e) {
    return !!Jt && (Jt.side === e || "both" === Jt.side);
  }
  function es(e) {
    const t = Xt(e),
      s = "sell" === e && "sol" !== n.settings.sellMode;
    return (
      t
        .map(
          (t, n) =>
            '<span class="ce"><input class="cei" data-s="' +
            e +
            '" data-i="' +
            n +
            '" value="' +
            t +
            '" inputmode="decimal">' +
            (s ? "<i>%</i>" : "") +
            '<b class="cex" data-s="' +
            e +
            '" data-i="' +
            n +
            '" title="Remove">×</b></span>',
        )
        .join("") +
      (t.length < 8 ? '<div class="chip pill ' + e + ' cadd" data-s="' + e + '" title="Add an amount">+</div>' : "") +
      '<div class="chip pill ' +
      e +
      ' cdone" title="Save">Done</div>'
    );
  }
  /* L'editeur des montants : tant qu'on tape dans un de ses champs, on ne le
     reecrit pas (il perdait le focus apres chaque caractere). Seul un ajout ou un
     retrait de montant le redessine. */
  function peHTML(box, side) {
    const a = box.getRootNode && box.getRootNode().activeElement;
    if (a && box.contains(a) && a.classList.contains("cei") && box.querySelectorAll(".cei").length === Xt(side).length) return !1;
    return tn(box, es(side));
  }
  function ts(e, t) {
    (e.querySelectorAll(".cei").forEach((e) => {
      (e.addEventListener("keydown", (e) => {
        (e.stopPropagation(), "Enter" === e.key && ss(), "Escape" === e.key && ((Jt = null), zs()));
      }),
        e.addEventListener("input", () => {
          Xt(e.dataset.s)[+e.dataset.i] = e.value;
        }));
    }),
      e.querySelectorAll(".cex").forEach(
        (e) =>
          (e.onclick = () => {
            const t = Xt(e.dataset.s);
            if (t.length <= 2) return Yt("keep at least two", "bad");
            (t.splice(+e.dataset.i, 1), zs());
          }),
      ));
    const s = e.querySelector(".cadd");
    s &&
      (s.onclick = () => {
        const t = s.dataset.s,
          n = Xt(t),
          a = de(n[n.length - 1]) || 1;
        (n.push("buy" === t ? +(2 * a).toFixed(4) : Math.min(100, Math.round(a + 25))), zs());
        const o = e.querySelectorAll(".cei"),
          l = o[o.length - 1];
        l && (l.focus(), l.select());
      });
    const n = e.querySelector(".cdone");
    n && (n.onclick = ss);
  }
  function ss() {
    if (!Jt) return;
    const e = "both" === Jt.side ? ["buy", "sell"] : [Jt.side],
      t = {};
    for (const s of e) {
      const e = "sell" === s && "sol" !== n.settings.sellMode ? 100 : 1e6,
        a = Xt(s)
          .map((e) => de(e))
          .filter((t) => isFinite(t) && t > 0 && t <= e)
          .map((e) => +(+e).toFixed(4)),
        o = [];
      for (const e of a) o.indexOf(e) < 0 && o.push(e);
      if (o.length < 2) return void Yt("two amounts at least", "bad");
      t[s] = o.slice(0, 8);
    }
    const s = Zs().map((e) => ({ buy: e.buy.slice(), sell: e.sell.slice() })),
      a = n.settings.slot || 0;
    for (const n of e) s[a][n] = t[n];
    ((Jt = null), W({ cmd: "settings", settings: { [js()]: s } }), Yt("amounts saved", "good"), zs());
  }
  const ns = { bw: 1, r: 4, rb: 14, zoom: 1 };
  const as = {
    on: !1,
    bg: null,
    dim: 0.45,
    w: 238,
    h: 108,
    r: 0,
    blur: 0,
    zoom: 1,
    tsh: 0,
    fs: 22,
    showPct: !0,
    showPnl: !0,
    showLbl: !0,
    showUsd: !0,
    label: "BALANCE",
  };
  function os() {
    return Object.assign({}, as, n && n.settings.card);
  }
  function ls(e) {
    ("on" in e || os().on || (e = Object.assign({ on: !0 }, e)),
      (n.settings.card = Object.assign({}, as, n.settings.card, e)),
      W({ cmd: "settings", settings: { card: n.settings.card } }),
      zs());
  }
  function is() {
    return Object.assign({}, "axiom" === Ae() ? { bw: 1, r: 4, rb: 9999, zoom: 1 } : ns, n && n.settings.look);
  }
  const rs = [
    { k: "geist", n: "Geist", css: 'Geist, "Geist Variable", "Geist Fallback"' },
    { k: "inter", n: "Inter", css: 'Inter, "Inter Fallback"' },
    { k: "system", n: "System", css: '-apple-system, "Segoe UI", system-ui' },
    { k: "mono", n: "Mono", css: 'ui-monospace, "SF Mono", Menlo, Consolas' },
  ];
  function cs() {
    const e = n && n.settings,
      t = e && e.fontCustom;
    if (t && String(t).trim()) return String(t).trim();
    return (rs.find((t) => t.k === (e && e.font)) || rs[0]).css;
  }
  const ds = {};
  function ps(e) {
    if (e in ds) return ds[e];
    let t = !1;
    try {
      const s = "mmmwwwiiilll0123456789",
        n = document.createElement("canvas").getContext("2d"),
        a = (e) => ((n.font = "32px " + e), n.measureText(s).width),
        o = '"' + e + '"';
      t = a(o + ", monospace") !== a("monospace") || a(o + ", serif") !== a("serif");
    } catch (e) {
      t = !1;
    }
    return ((ds[e] = t), t);
  }
  function us() {
    y.panes.set.innerHTML = `\n      <div class="card dashcard">\n        <div class="lbl">Dashboard</div>\n        <div class="dash"></div>\n      </div>\n      <div class="card">\n        <div class="lbl">Style <span class="dim2">the shape of the panel</span></div>\n        <div class="themes skinrow">\n          <div class="th" data-k="auto">Follow the site</div>\n          <div class="th" data-k="terminal">Terminal</div>\n          <div class="th" data-k="axiom">Axiom</div>\n        </div>\n        <details class="help"><summary>Help</summary><div class="note">Blanks sits on top of their terminal, so the panel takes the shape of their instant trade: the same header, the same rows of amounts, the same settings line, the same position row. <b>Follow the site</b> uses Terminal's shape on Terminal and Axiom's on Axiom. Everything Blanks has on top — Orders, Stats, History, the Track feed — lives in this window, behind the gear: their interface gains no button.</div></details>\n      </div>\n      <div class="card">\n        <div class="lbl">Theme</div>\n        <div class="themes">\n          <div class="th" data-t="padre"><i></i>Padre</div>\n          <div class="th" data-t="slate"><i></i>Slate</div>\n          <div class="th" data-t="light"><i></i>Light</div>\n        </div>\n      </div>\n      <div class="card">\n        <div class="lbl">Font</div>\n        <div class="themes fontrow"></div>\n        <div class="set" style="margin-top:8px">\n          <label>Custom font</label><input class="fontcustom" placeholder="e.g. JetBrains Mono">\n        </div>\n        <details class="help"><summary>Help</summary><div class="note">Nothing is downloaded: fonts come from what the page already loads (Terminal ships <b>Geist</b>) and from your system. A missing font is greyed out.</div></details>\n      </div>\n      <div class="card" data-open="1">\n        <div class="lbl">Quick buy</div>\n        <div class="themes">\n          <div class="th qbon">Enabled</div>\n          <div class="th qbgoto">Open chart</div>\n          <div class="th qbunit"><span>Show <span class="un">SOL</span></span></div>\n          <div class="th qbone">One click</div>\n        </div>\n        <div class="set" style="margin-top:8px">\n          <label>Amount (<i class="un">SOL</i>)</label><input class="qbsol" inputmode="decimal" placeholder="0.25">\n        </div>\n        <div class="lbl" style="margin-top:9px">Amounts on their rows</div>\n        <div class="themes">\n          <div class="th qbn" data-n="1">1</div>\n          <div class="th qbn" data-n="2">2</div>\n          <div class="th qbn" data-n="4">4</div>\n          <div class="th qbn" data-n="8">8</div>\n        </div>\n        <div class="note" style="margin-top:6px">Past one, the amounts come from the preset row open in the Trade tab — four per line, so eight make two rows, like their own quick buy.</div>\n        <div class="qbown">\n        <div class="lbl" style="margin-top:9px">Size</div>\n        <div class="themes">\n          <div class="th qbsize" data-z="s">S</div>\n          <div class="th qbsize" data-z="m">M</div>\n          <div class="th qbsize" data-z="l">L</div>\n        </div>\n        <div class="lbl" style="margin-top:9px">Style</div>\n        <div class="themes">\n          <div class="th qbst" data-y="contour">Outline</div>\n          <div class="th qbst" data-y="plein">Filled</div>\n          <div class="th qbst" data-y="discret">Subtle</div>\n        </div>\n        </div>\n        <div class="note qbtheirs" style="margin-top:9px">Their button, their look — only the faint logo tells them apart.</div>\n        <div class="lbl" style="margin-top:9px">Placement</div>\n        <div class="themes">\n          <div class="th qbpos" data-q="replace">Replace theirs</div>\n        </div>\n        <div class="themes" style="margin-top:5px">\n          <div class="th qbpos" data-q="left">Left of the card</div>\n        </div>\n        <div class="themes" style="margin-top:5px">\n          <div class="th qbpos" data-q="tl">↖</div>\n          <div class="th qbpos" data-q="tr">↗</div>\n          <div class="th qbpos" data-q="bl">↙</div>\n          <div class="th qbpos" data-q="br">↘</div>\n        </div>\n        <details class="help"><summary>Help</summary><div class="note">A quick-buy button appears on every trenches / Pulse card. <b>One click</b> buys; turn it off and the first click arms, the second fires. <b>Open chart</b> jumps to the token chart on the second click, on the Trade tab. <b>Replace theirs</b> clones their own quick-buy button (same node, same CSS) and hides the original; the faint logo tells them apart. Size and style only apply to Blanks' own button (Left / corners). Corner placements sit on top of the card and may cover the market cap in a narrow column.</div></details>\n      </div>\n      <div class="card">\n        <div class="lbl">Balance card</div>\n        <div class="themes">\n          <div class="th cardon">Show</div>\n          <div class="th cardpick">Background…</div>\n          <div class="th cardclear">Remove</div>\n        </div>\n        <div class="slid" style="margin-top:9px">\n          <label>Width</label><span class="sv" data-cv="w"></span>\n          <input type="range" data-cl="w" min="150" max="900" step="2">\n          <label>Height</label><span class="sv" data-cv="h"></span>\n          <input type="range" data-cl="h" min="48" max="400" step="2">\n          <label>Corner radius</label><span class="sv" data-cv="r"></span>\n          <input type="range" data-cl="r" min="0" max="28" step="1">\n          <label>Darkness</label><span class="sv" data-cv="dim"></span>\n          <input type="range" data-cl="dim" min="0" max="1" step="0.05">\n          <label>Background blur</label><span class="sv" data-cv="blur"></span>\n          <input type="range" data-cl="blur" min="0" max="10" step="0.5">\n          <label>Text shadow</label><span class="sv" data-cv="tsh"></span>\n          <input type="range" data-cl="tsh" min="0" max="16" step="1">\n          <label>Text size</label><span class="sv" data-cv="fs"></span>\n          <input type="range" data-cl="fs" min="8" max="80" step="1">\n          <label>Scale</label><span class="sv" data-cv="zoom"></span>\n          <input type="range" data-cl="zoom" min="0.7" max="1.8" step="0.05">\n        </div>\n        <div class="themes" style="margin-top:9px">\n          <div class="th cshowpct">%</div>\n          <div class="th cshowpnl">PNL</div>\n          <div class="th cshowlbl">Label</div>\n          <div class="th cshowusd">$</div>\n        </div>\n        <div class="set" style="margin-top:8px">\n          <label>Label text</label><input data-c="label">\n        </div>\n        <div class="lbl prevlbl" style="margin-top:9px">Preview</div>\n        <div class="cardprev"></div>\n        <details class="help"><summary>Help</summary><div class="note">With no image chosen, Terminal's own PnL Tracker background is used. A custom image is resized to 1000 px and never leaves your browser.</div></details>\n      </div>\n      <div class="card">\n        <div class="lbl">PNL card</div>\n        <img class="shprev" alt="">\n        <button class="btn ghost shopen" style="margin-top:8px">Customize…</button>\n        <details class="help"><summary>Help</summary><div class="note">The card of a trade: <b>History</b> tab → ▣ at the end of a row. Background image, what to show and the animated chart are chosen in that window and remembered. Customize opens it on your last trade.</div></details>\n      </div>\n      <div class="card">\n        <div class="lbl">Sound</div>\n        <div class="themes">\n          <div class="th sndon">On</div>\n          <div class="th sndtest">Test buy</div>\n          <div class="th sndtest2">Test sell</div>\n        </div>\n        <div class="themes" style="margin-top:6px">\n          <div class="th sndpick" data-k="sndBuy">Buy file…</div>\n          <div class="th sndpick" data-k="sndSell">Sell file…</div>\n          <div class="th sndreset">Reset</div>\n        </div>\n        <div class="slid" style="margin-top:9px">\n          <label>Volume</label><span class="sv sndvv"></span>\n          <input type="range" class="sndv" min="0" max="1" step="0.05">\n        </div>\n        <div class="themes sndtrims" style="margin-top:6px">\n          <div class="th sndtrim" data-k="sndBuy">Trim buy</div>\n          <div class="th sndtrim" data-k="sndSell">Trim sell</div>\n        </div>\n        <div class="trimbox" style="display:none"></div>\n        <details class="help"><summary>Help</summary><div class="note">Two synthesized beeps by default. To get Terminal's exact sounds, load their files here — they stay in your browser. A loaded file opens in the <b>trimmer</b>: drag the two handles to keep just the part you want (8 s max), play it, save. <b>Trim buy / Trim sell</b> reopen it later.</div></details>\n      </div>\n      <div class="card">\n        <div class="lbl">Presets</div>\n        <div class="fed setfed"></div>\n        <div class="pamts buy"></div>\n        <div class="phint">The amounts of this preset — the same buttons as the panel. Up to eight per side.</div>\n        <details class="help"><summary>Help</summary><div class="note">Each preset (P1, P2, P3) has its own amounts and its own fees, one set for buying and one for selling — like on Terminal and Axiom. Switch presets from the panel header. Clicking the fee row under the buttons of the panel opens the same settings. Max slippage is a tolerance: the slippage you actually get is random, always against you, and never above 1.5%.</div></details>\n      </div>\n      <div class="card">\n        <div class="lbl">Execution</div>\n        <div class="set">\n          <label>Execution delay (ms)</label><input data-s="execDelayMs">\n          <label>Slippage with no liquidity data (%)</label><input data-s="fallbackSlippagePct">\n        </div>\n        <div class="swrow"><span>Fill previews<small>Tokens, fees and impact of a button when you hover it.</small></span><div class="sw prevon"></div></div>\n      </div>\n      <div class="card">\n        <div class="lbl">Fees</div>\n        <div class="set">\n          <label>Platform fee (%)</label><input data-s="platformFeePct">\n          <label>Cashback (%)</label><input data-s="cashbackPct">\n        </div>\n        <details class="help"><summary>Help</summary><div class="note">DEX fees are detected automatically: 1% on the pump.fun curve, 0.25% on Raydium / PumpSwap / Meteora, 0.3% on Uniswap. The platform fee is Terminal's, minus your cashback.</div></details>\n      </div>\n      <div class="card">\n        <div class="lbl">Wallet</div>\n        <div class="set">\n          <label>Balance (<i class="un">SOL</i>)</label><input data-b="1">\n        </div>\n        <div class="note" style="margin-top:6px">Type a number and press Enter. Your PNL and stats don't change — only what you have to trade with.</div>\n        <div class="themes" style="margin:10px 0 2px">\n          <div class="th bkexp">Backup</div>\n          <div class="th bkimp">Restore</div>\n          <div class="th resetbtn">Reset wallet</div>\n        </div>\n        <div class="note" style="margin-top:8px"><b>Kept across updates.</b> Your wallet lives in the extension's storage and survives every update. It is also mirrored to your Google account (Chrome sync): reinstall Blanks, or install it on another computer signed in with the same account, and it comes back by itself — images and sounds excepted.</div>\n        <details class="help"><summary>Help</summary><div class="note"><b>Backup</b> writes a file with everything (wallet, trades, settings, images) to keep aside — the belt to the braces. <b>Restore</b> reads one. <b>Reset</b> goes back to 10 SOL and clears positions, orders and history; it cannot be undone.</div></details>\n        <details class="help"><summary>Advanced</summary>\n          <div class="set" style="margin-top:6px"><label>SOL price ($)</label><input class="solpx" placeholder="auto"></div>\n          <div class="note">Fetched automatically (Jupiter, Coinbase, Binance, Kraken, CoinGecko). Only fill this in if a blocker stops all of them — the panel then shows <b>sol ✗</b>.</div>\n          <div class="note diagline" style="margin-top:7px;opacity:.7">—</div>\n        </details>\n        <div class="note" style="margin-top:6px;text-align:right;opacity:.7">Blanks v${s}</div>\n      </div>\n      <div class="card tsetcard">\n        <div class="lbl">Tracking <span class="dim2">pseudo, Google, people you follow</span></div>\n        <div class="tsetwrap"></div>\n        <div class="note" style="margin-top:10px;opacity:.8">The live feed of their trades stays in the <b>Track</b> tab of the panel, on any token page.</div>\n      </div>\n      <div class="card lbcard">\n        <div class="lbl">Leaderboard <span class="dim2">the public ranking on trade-blanks.com</span></div>\n        <div class="lbwrap"></div>\n        <details class="help"><summary>Help</summary><div class="note">The ranking counts the paper trades published by everyone who leaves <b>On the leaderboard</b> on, over the period you pick, and sorts them by realised PNL. <b>ROI</b> is that PNL against the SOL put at risk on the period, not against a starting balance. Your rank is the <b>#</b> shown next to your pseudo everywhere in Blanks — in the panel, on the bubbles of your chart and in the feed. Everyone with a pseudo is on the board, even before their first trade. Turn the switch off and your row stays, under <b>Anonymous</b>: your name and your photo leave the public page, nothing changes for the people who follow you.</div></details>\n      </div>\n      <div class="card">\n        <div class="lbl">Updates <span class="dim2">by email</span></div>\n        <div class="nlbox"></div>\n        <details class="help"><summary>Help</summary><div class="note">One email per new version, with the changelog — nothing else. You confirm from your inbox, and every email has an unsubscribe link. The address goes to trade-blanks.com only for this; it is not tied to your pseudo or your wallet.</div></details>\n      </div>\n      <div class="card">\n        <div class="lbl">What's new <span class="dim2">v${s}</span></div>\n        <div class="clog"><div class="empty">Loading…</div></div>\n      </div>${BX$.cards || ""}`;
    const e = y.panes.set;
    (e.querySelectorAll(".themes .th[data-t]").forEach(
      (e) =>
        (e.onclick = () =>
          (function (e) {
            n && ((n.settings.theme = e), (y.wrap.dataset.theme = e), W({ cmd: "settings", settings: { theme: e } }), zs());
          })(e.dataset.t)),
    ),
      ys(),
      gs());
    const t = ls,
      a = (e) => {
        ((n.settings.quickBuy = Object.assign({}, Be, n.settings.quickBuy, e)),
          W({ cmd: "settings", settings: { quickBuy: n.settings.quickBuy } }),
          zs(),
          vt());
      };
    ((e.querySelector(".qbon").onclick = () => a({ on: !He().on })),
      e.querySelectorAll(".qbpos").forEach((e) => (e.onclick = () => a({ pos: e.dataset.q }))),
      e.querySelectorAll(".qbsize").forEach((e) => (e.onclick = () => a({ size: e.dataset.z }))),
      e.querySelectorAll(".qbn").forEach((e) => (e.onclick = () => a({ n: +e.dataset.n }))),
      e.querySelectorAll(".qbst").forEach((e) => (e.onclick = () => a({ style: e.dataset.y }))),
      (e.querySelector(".qbunit").onclick = () => a({ unit: !He().unit })),
      (e.querySelector(".qbgoto").onclick = () => a({ goto: !He().goto })),
      (e.querySelector(".qbone").onclick = () => a({ one: !He().one })));
    const o = e.querySelector(".qbsol");
    ((o.onchange = o.onblur =
      () => {
        const e = de(o.value);
        e > 0 ? a({ [Fe()]: Math.min(1e3, e) }) : (o.value = et(_e()));
      }),
      (o.onkeydown = (e) => {
        "Enter" === e.key && o.blur();
      }),
      (e.querySelector(".cardon").onclick = () => t({ on: !os().on })),
      (e.querySelector(".cshowpct").onclick = () => t({ showPct: !os().showPct })),
      (e.querySelector(".cshowpnl").onclick = () => t({ showPnl: !os().showPnl })),
      (e.querySelector(".cshowlbl").onclick = () => t({ showLbl: !os().showLbl })),
      (e.querySelector(".cshowusd").onclick = () => t({ showUsd: !os().showUsd })),
      e.querySelectorAll("[data-cl]").forEach((e) => {
        (e.addEventListener("keydown", (e) => e.stopPropagation()),
          e.addEventListener("input", () => {
            (hs(e), t({ [e.dataset.cl]: parseFloat(e.value) }));
          }));
      }));
    const l = e.querySelector('[data-c="label"]');
    (l.addEventListener("keydown", (e) => e.stopPropagation()),
      l.addEventListener("change", () => t({ label: l.value.slice(0, 24) })),
      (e.querySelector(".cardclear").onclick = () => t({ bg: null })),
      (e.querySelector(".shopen").onclick = () => Qn(n.trades[0] || Jn())),
      (e.querySelector(".prevon").onclick = () => {
        const e = !n.settings.previews;
        ((n.settings.previews = e), W({ cmd: "settings", settings: { previews: e } }), zs());
      }),
      (e.querySelector(".sndon").onclick = () => {
        const e = !(!1 === n.settings.sound);
        ((n.settings.sound = !e), W({ cmd: "settings", settings: { sound: !e } }), e || Es(!0), zs());
      }),
      (e.querySelector(".bkexp").onclick = () => W({ cmd: "export" })),
      (e.querySelector(".bkimp").onclick = () => {
        const e = document.createElement("input");
        ((e.type = "file"),
          (e.accept = "application/json,.json"),
          (e.onchange = () => {
            const t = e.files && e.files[0];
            if (!t) return;
            const s = new FileReader();
            ((s.onload = () => {
              try {
                const e = JSON.parse(s.result),
                  t = e && e.state ? e.state : e;
                if (!t || "object" != typeof t) throw new Error("format");
                W({ cmd: "import", state: t });
              } catch (e) {
                Yt("unreadable file", "bad");
              }
            }),
              s.readAsText(t));
          }),
          e.click());
      }));
    const i = e.querySelector(".solpx");
    ((i.onkeydown = (e) => {
      if ("Enter" !== e.key) return;
      const t = parseFloat(i.value);
      t > 0 && (W({ cmd: "solusd", value: t }), Yt("SOL = $" + t, "good"));
    }),
      e.querySelectorAll(".sndpick").forEach((e) => {
        e.onclick = () => {
          const t = document.createElement("input");
          ((t.type = "file"),
            (t.accept = "audio/*"),
            (t.onchange = () => {
              const s = t.files && t.files[0];
              if (!s) return;
              if (s.size > 6e6) return void Yt("file too large (6 MB max)", "bad");
              const n = new FileReader();
              ((n.onload = () => {
                (Yt(s.name + " loaded — trim it below", "good"), qs(e.dataset.k, n.result));
              }),
                n.readAsDataURL(s));
            }),
            t.click());
        };
      }));
    const r = e.querySelector(".fontrow");
    ((r.innerHTML = rs
      .map((e) => '<div class="th fnt" data-f="' + e.k + '" style="font-family:' + e.css + ',system-ui">' + e.n + "</div>")
      .join("")),
      r.querySelectorAll(".fnt").forEach((t) => {
        t.onclick = () => {
          ((n.settings.font = t.dataset.f),
            (n.settings.fontCustom = ""),
            W({ cmd: "settings", settings: { font: t.dataset.f, fontCustom: "" } }));
          const s = e.querySelector(".fontcustom");
          (s && (s.value = ""), zs());
        };
      }));
    const c = e.querySelector(".fontcustom");
    ((c.onkeydown = (e) => {
      if ("Enter" !== e.key) return;
      const t = c.value.trim();
      ((n.settings.fontCustom = t),
        W({ cmd: "settings", settings: { fontCustom: t } }),
        Yt(t ? "font: " + t : "default font", "good"),
        zs());
    }),
      e.querySelectorAll(".sndtrim").forEach((e) => (e.onclick = () => qs(e.dataset.k))),
      (e.querySelector(".sndreset").onclick = () => {
        ((n.settings.sndBuy = null),
          (n.settings.sndSell = null),
          W({ cmd: "settings", settings: { sndBuy: null, sndSell: null } }),
          Yt("default sounds", "good"),
          zs());
      }),
      (e.querySelector(".sndtest").onclick = () => Es(!0)),
      (e.querySelector(".sndtest2").onclick = () => Es(!1)));
    const p = e.querySelector(".sndv");
    ((p.oninput = () => {
      const t = parseFloat(p.value);
      ((n.settings.soundVol = t),
        hs(p),
        (e.querySelector(".sndvv").textContent = Math.round(100 * t) + "%"),
        W({ cmd: "settings", settings: { soundVol: t } }));
    }),
      (p.onchange = () => Es(!0)),
      (e.querySelector(".cardpick").onclick = () => {
        const e = document.createElement("input");
        ((e.type = "file"),
          (e.accept = "image/*"),
          (e.onchange = () => {
            const s = e.files && e.files[0];
            if (!s) return;
            const n = new FileReader();
            ((n.onload = () => {
              const e = new Image();
              ((e.onload = () => {
                const s = Math.min(1, 1e3 / Math.max(e.width, e.height)),
                  n = document.createElement("canvas");
                ((n.width = Math.round(e.width * s)),
                  (n.height = Math.round(e.height * s)),
                  n.getContext("2d").drawImage(e, 0, 0, n.width, n.height),
                  t({ bg: n.toDataURL("image/jpeg", 0.82), on: !0 }),
                  Yt("background set"));
              }),
                (e.onerror = () => Yt("unreadable image")),
                (e.src = n.result));
            }),
              n.readAsDataURL(s));
          }),
          e.click());
      }),
      e.querySelectorAll("[data-s]").forEach((e) => {
        (e.addEventListener("keydown", (e) => e.stopPropagation()),
          e.addEventListener("change", () => {
            const t = de(e.value);
            isFinite(t) && t >= 0 ? W({ cmd: "settings", settings: { [e.dataset.s]: t } }) : (e.value = n.settings[e.dataset.s]);
          }));
      }));
    const u = e.querySelector(".setfed"),
      m = e.querySelector(".pamts");
    ((u.__onSync = (e, t) => {
      const s = Zs(),
        a = s[e] || s[0],
        o = (a && a[t]) || [],
        l = e + t + d() + o.join(",") + (n.settings.sellMode || "");
      if (m.__sig === l || m.contains(h.activeElement)) return;
      ((m.__sig = l), (m.className = "pamts " + t));
      const i = "sell" === t && "sol" !== n.settings.sellMode;
      ((m.innerHTML = Array.from(
        { length: 8 },
        (e, t) =>
          `<input data-i="${t}" inputmode="decimal" placeholder="—" value="${void 0 !== o[t] ? o[t] : ""}" title="${i ? "% of the position" : d()}">`,
      ).join("")),
        m.querySelectorAll("input").forEach((s) => {
          (s.addEventListener("keydown", (e) => {
            (e.stopPropagation(), "Enter" === e.key && s.blur());
          }),
            s.addEventListener("change", () => {
              const s = Array.from(m.querySelectorAll("input"))
                .map((e) => de(e.value))
                .filter((e) => isFinite(e) && e > 0)
                .slice(0, 8);
              if (s.length < 2) return (Yt("keep at least two", "bad"), (m.__sig = ""), Zt(u));
              const n = Zs().map((e) => Object.assign({}, e, { buy: e.buy.slice(), sell: e.sell.slice() }));
              ((n[e][t] = s), W({ cmd: "settings", settings: { [js()]: n } }), (m.__sig = ""));
            }));
        }));
    }),
      (u.dataset.slot = String(n.settings.slot || 0)),
      (u.dataset.side = "buy"),
      It(u, d()));
    const v = e.querySelector("[data-b]");
    (v.addEventListener("keydown", (e) => e.stopPropagation()),
      v.addEventListener("change", () => {
        const e = de(v.value);
        isFinite(e) && e >= 0 && (W({ cmd: "balance", value: e, asset: d() }), Yt("balance set to " + e + " " + d(), "good"));
      }));
    let f = !1;
    const g = e.querySelector(".resetbtn");
    g.onclick = () => {
      if (!f)
        return (
          (f = !0),
          (g.textContent = "Confirm reset"),
          void setTimeout(() => {
            ((f = !1), (g.textContent = "Reset wallet"));
          }, 4e3)
        );
      (W({ cmd: "reset" }), (f = !1), (g.textContent = "Reset wallet"));
    };
  }
  function hs(e) {
    const t = parseFloat(e.min),
      s = parseFloat(e.max),
      n = parseFloat(e.value);
    isFinite(t) && isFinite(s) && s > t && e.style.setProperty("--p", (((n - t) / (s - t)) * 100).toFixed(1) + "%");
  }
  function ms() {
    const e = (e) => (e ? "✓" : "✗"),
      t = $();
    let s = null,
      n = null,
      a = null,
      o = null,
      i = !1,
      r = null;
    try {
      s = be(Ce("Price"));
    } catch (e) {}
    try {
      n = be(Ce("Liquidity"));
    } catch (e) {}
    try {
      a = be(Ce("Supply"));
    } catch (e) {}
    try {
      o = document.title.match(/^(.+?)\s*[\u2193\u2191]?\s*\$([\d.,]+[KMBT]?)/);
    } catch (e) {}
    try {
      i = qe();
    } catch (e) {}
    try {
      const e = [...document.querySelectorAll("iframe")].map((e) => e.src).find((e) => e && e.indexOf("insightx") >= 0);
      r = e ? (e.match(/\/sol\/([1-9A-HJ-NP-Za-km-z]{32,44})/) || [])[1] : null;
    } catch (e) {}
    return (
      "px " +
      e(s > 0) +
      " mc " +
      e(o) +
      " liq " +
      e(n > 0) +
      " sup " +
      e(a > 0) +
      " curve " +
      e(i) +
      " mint " +
      e(r) +
      " sol " +
      (l > 0 ? "✓" + (w && w.solSrc ? "(" + w.solSrc + ")" : "") : "✗") +
      " addr " +
      e(m) +
      " · quote " +
      (t ? t._src || "?" : "✗") +
      (w ? " · sw " + (w.why || "?") + " w" + w.watched : " · sw ✗")
    );
  }
  let vs = null,
    fs = "";
  function ys() {
    const e = y.panes.set,
      t = e && e.querySelector(".nlbox");
    if (!t || !n) return;
    const s = n.settings.news,
      a =
        s && s.email
          ? `<div class="nlst"><span class="nlmail">${String(s.email).replace(/[<>&"]/g, "")}</span>${s.confirmed ? '<span class="tgok"><i>✓</i>Subscribed</span>' : '<span class="dim2">waiting for your confirmation — check your inbox</span>'}</div>\n         <div class="themes" style="margin-top:8px">${s.confirmed ? "" : '<div class="th nlresend">Resend the email</div>'}<div class="th nlstop">Unsubscribe</div></div>`
          : `<div class="tregrow"><input class="nlin" type="email" maxlength="120" placeholder="you@example.com" value="${fs.replace(/[<>&"]/g, "")}"><button class="btn nlgo">Email me updates</button></div>`;
    if (t.dataset.h === a) return;
    ((t.dataset.h = a), (t.innerHTML = a));
    const o = t.querySelector(".nlin"),
      l = t.querySelector(".nlgo");
    o &&
      (o.addEventListener("keydown", (e) => {
        (e.stopPropagation(), "Enter" === e.key && l.click());
      }),
      o.addEventListener("input", () => {
        fs = o.value;
      }),
      (l.onclick = () => {
        const e = o.value.trim();
        if (!/^[^@\s]+@[^@\s]+\.[A-Za-z]{2,}$/.test(e)) return Yt("that does not look like an email address", "bad");
        ((fs = ""), W({ cmd: "subscribe", email: e }));
      }));
    const i = t.querySelector(".nlresend");
    i && (i.onclick = () => W({ cmd: "subscribe", email: s.email }));
    const r = t.querySelector(".nlstop");
    (r && (r.onclick = () => W({ cmd: "unsubscribe" })), s && !s.confirmed && W({ cmd: "newsStatus" }));
  }
  function gs() {
    const e = y.panes.set,
      t = e && e.querySelector(".clog");
    if (!t) return;
    if (null === vs) return ((vs = []), void W({ cmd: "changelog" }));
    if (!vs.length) return void (t.innerHTML = '<div class="empty">The changelog is on <b>trade-blanks.com/docs</b>.</div>');
    const n = x.upd && x.upd.to === s ? x.upd.from : null;
    t.innerHTML =
      vs
        .slice(0, 6)
        .map(
          (e, t) =>
            `\n      <details class="cv"${0 === t ? " open" : ""}><summary><b>${e.version}</b><span>${String(e.title || "").replace(/[<>&]/g, "")}</span>${0 === t ? '<i class="cvnow">current</i>' : n && e.version === n ? '<i class="cvwas">you had this</i>' : ""}</summary>\n        <ul>${(e.items || []).map((e) => "<li>" + (e.html || String(e.text || "").replace(/[<>&]/g, "")) + "</li>").join("")}</ul></details>`,
        )
        .join("") + '<div class="note" style="margin-top:8px;opacity:.7">Older versions: <b>trade-blanks.com/docs</b> → Changelog.</div>';
  }
  let bs = !1;
  function ks() {
    const e = y.panes.set,
      t = h.activeElement;
    (_t(e), "dash" === Vt && y.smodal && y.smodal.classList.contains("on") && Pt(), ys());
    const s = !1 !== n.settings.sound,
      a = e.querySelector(".sndon");
    a && (a.classList.toggle("on", s), (a.textContent = s ? "On" : "Off"));
    const o = e.querySelector(".prevon");
    o && o.classList.toggle("on", !!n.settings.previews);
    const i = e.querySelector(".setfed");
    if ((i && i.__onSync && (i.dataset.asset !== d() ? It(i, d()) : i.contains(t) || Zt(i)), y.fees && y.fees.classList.contains("on"))) {
      const e = y.fees.querySelector(".fed");
      e && !e.contains(t) && Zt(e);
    }
    const r = (n.settings.fontCustom || "").trim();
    e.querySelectorAll(".fnt").forEach((e) => {
      e.classList.toggle("on", !r && (n.settings.font || "geist") === e.dataset.f);
      const t = rs
          .find((t) => t.k === e.dataset.f)
          .css.split(",")
          .map((e) => e.trim().replace(/"/g, ""))
          .filter((e) => !/Fallback$/i.test(e)),
        s = "system" === e.dataset.f || "mono" === e.dataset.f || t.some(ps);
      (e.classList.toggle("missing", !s), (e.title = s ? "" : t[0] + " not available on this page"));
    });
    const c = e.querySelector(".fontcustom");
    (c && c !== t && (c.value = r),
      e.querySelectorAll(".sndpick").forEach((e) => {
        const t = !!n.settings[e.dataset.k];
        (e.classList.toggle("on", t), (e.textContent = ("sndBuy" === e.dataset.k ? "Buy" : "Sell") + (t ? " ✓" : " file…")));
      }),
      e.querySelectorAll(".sndtrim").forEach((e) => {
        e.style.display = n.settings[e.dataset.k] ? "" : "none";
      }));
    const p = e.querySelector(".sndtrims");
    p && (p.style.display = n.settings.sndBuy || n.settings.sndSell ? "" : "none");
    const m = e.querySelector(".solpx");
    m && m !== t && (m.value = l > 0 ? l.toFixed(2) : "");
    const v = e.querySelector(".sndv");
    if (v && v !== t) {
      const t = void 0 === n.settings.soundVol ? 0.35 : n.settings.soundVol;
      ((v.value = String(t)), hs(v), (e.querySelector(".sndvv").textContent = Math.round(100 * t) + "%"));
    }
    const f = e.querySelector(".diagline");
    f && (f.textContent = ms());
    const g = n.settings.theme || "padre";
    (e.querySelectorAll(".themes .th[data-t]").forEach((e) => e.classList.toggle("on", e.dataset.t === g)),
      e.querySelectorAll("[data-s]").forEach((e) => {
        e !== t && (e.value = n.settings[e.dataset.s]);
      }));
    const b = Zs()[n.settings.slot || 0];
    e.querySelectorAll("[data-p]").forEach((e) => {
      e !== t && (e.value = ("buyPresets" === e.dataset.p ? b.buy : b.sell).join(", "));
    });
    const k = e.querySelector("[data-b]");
    k && k !== t && (k.value = ne(u()));
    const w = is();
    (e.querySelectorAll("[data-l]").forEach((e) => {
      e !== t && (e.value = w[e.dataset.l]);
    }),
      e.querySelectorAll("[data-v]").forEach((e) => {
        const t = e.dataset.v;
        e.textContent = "zoom" === t ? Math.round(100 * w.zoom) + "%" : w[t] + "px";
      }));
    const x = os(),
      S = e.querySelector(".cardprev");
    if (S && y.card) {
      const e = y.card.cloneNode(!0);
      ((e.style.position = "relative"),
        (e.style.left = "0"),
        (e.style.top = "0"),
        (e.style.display = ""),
        (e.style.transform = "none"),
        (e.style.cursor = "default"));
      const t = Math.max(120, S.clientWidth - 20);
      e.style.zoom = String(Math.min(1, t / (x.w || 238)));
      const s = e.outerHTML;
      S.dataset.sig !== s && ((S.dataset.sig = s), (S.innerHTML = ""), S.appendChild(e));
    }
    const C = e.querySelector(".shprev");
    if (C && window.__BLANKS_KILLCAM) {
      const e = [
        n.settings.shareBg ? n.settings.shareBg.length : 0,
        n.settings.shareDim,
        n.settings.shareBlur,
        n.settings.shareGlassBlur,
        n.settings.shareGlassTint,
        n.settings.shareStyle,
        n.settings.sharePct,
        n.settings.shareRows,
        n.settings.shareAnim,
        (n.trades[0] || {}).closedAt,
      ].join("|");
      if (C.dataset.sig !== e) {
        C.dataset.sig = e;
        const t = n.trades[0] || Jn();
        window.__BLANKS_KILLCAM
          .still(
            Object.assign(Xn(t), { pct: !1 !== n.settings.sharePct, rows: !1 !== n.settings.shareRows, anim: !1 !== n.settings.shareAnim }),
          )
          .then((t) => {
            C.dataset.sig === e && (C.src = t);
          })
          .catch(() => {});
      }
    }
    (e.querySelector(".cardon").classList.toggle("on", !!x.on),
      e.querySelector(".cshowpct").classList.toggle("on", !!x.showPct),
      e.querySelector(".cshowpnl").classList.toggle("on", !!x.showPnl),
      e.querySelector(".cshowlbl").classList.toggle("on", !!x.showLbl),
      e.querySelector(".cshowusd").classList.toggle("on", !!x.showUsd));
    const L = He();
    (e.querySelector(".qbon").classList.toggle("on", !!L.on),
      e.querySelectorAll(".qbpos").forEach((e) => e.classList.toggle("on", e.dataset.q === L.pos)),
      e.querySelectorAll(".qbsize").forEach((e) => e.classList.toggle("on", e.dataset.z === (L.size || "m"))),
      e.querySelectorAll(".qbn").forEach((e) => e.classList.toggle("on", +e.dataset.n === (+L.n || 1))),
      e.querySelectorAll(".qbst").forEach((e) => e.classList.toggle("on", e.dataset.y === (L.style || "contour"))),
      e.querySelector(".qbunit").classList.toggle("on", !!L.unit),
      e.querySelector(".qbgoto").classList.toggle("on", !!L.goto),
      e.querySelector(".qbone").classList.toggle("on", !!L.one));
    const q = "replace" !== L.pos || (+L.n || 1) > 1;
    ((e.querySelector(".qbown").style.display = q ? "" : "none"), (e.querySelector(".qbtheirs").style.display = q ? "none" : ""));
    const M = e.querySelector(".qbsol");
    (document.activeElement !== M && h.activeElement !== M && (M.value = et(_e())),
      e.querySelectorAll("[data-cl]").forEach((e) => {
        (e !== t && (e.value = x[e.dataset.cl]), hs(e));
      }),
      e.querySelectorAll("[data-cv]").forEach((e) => {
        const t = e.dataset.cv;
        e.textContent = "zoom" === t ? Math.round(100 * x.zoom) + "%" : "dim" === t ? Math.round(100 * x.dim) + "%" : x[t] + "px";
      }));
    const E = e.querySelector('[data-c="label"]');
    E && E !== t && (E.value = x.label || "BALANCE");
  }
  let ws = null;
  function xs() {
    if (ws) return ws;
    try {
      ws = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      ws = null;
    }
    return ws;
  }
  const Ss = {};
  function Cs(e) {
    try {
      let t = Ss[e];
      t || ((t = Ss[e] = new Audio(e)), (t.preload = "auto"));
      const s = n && n.settings;
      ((t.volume = Math.max(0, Math.min(1, s && void 0 !== s.soundVol ? s.soundVol : 0.35))), (t.currentTime = 0));
      const a = t.play();
      return (a && a.catch && a.catch(() => {}), !0);
    } catch (e) {
      return !1;
    }
  }
  let Ls = null;
  async function qs(e, t) {
    const s = y.panes.set,
      a = s && s.querySelector(".trimbox"),
      o = t || (n && n.settings[e]),
      l = !!t;
    if (!a || !o) return;
    const i = xs();
    if (!i) return Yt("audio is not available on this page", "bad");
    let r;
    "suspended" === i.state && i.resume().catch(() => {});
    try {
      const e = await (await fetch(o)).arrayBuffer();
      r = await i.decodeAudioData(e);
    } catch (e) {
      return void Yt("could not decode this sound", "bad");
    }
    const c = r.duration,
      d = 400,
      p = new Float32Array(d),
      u = Math.max(1, Math.floor(r.length / d));
    for (let e = 0; e < r.numberOfChannels; e++) {
      const t = r.getChannelData(e);
      for (let e = 0; e < d; e++) {
        let s = 0;
        const n = e * u,
          a = Math.min(t.length, n + u);
        for (let e = n; e < a; e += 4) {
          const n = Math.abs(t[e]);
          n > s && (s = n);
        }
        s > p[e] && (p[e] = s);
      }
    }
    if (Ls && Ls.src)
      try {
        Ls.src.stop();
      } catch (e) {}
    ((Ls = { k: e, buf: r, dur: c, peaks: p, a: 0, b: Math.min(c, 8), src: null, drag: null }),
      (a.style.display = ""),
      (a.innerHTML = `\n      <div class="trimhd"><b>Trim ${"sndBuy" === e ? "buy" : "sell"} sound</b><span class="trimrng dim2"></span></div>\n      <canvas class="trimcv"></canvas>\n      <div class="themes" style="margin-top:8px"><div class="th trimplay">▶ Play selection</div><div class="th trimok">Save</div><div class="th trimcancel">Cancel</div></div>`));
    const m = a.querySelector(".trimcv"),
      v = Math.max(200, a.clientWidth || 520),
      f = 84,
      g = window.devicePixelRatio || 1;
    ((m.width = Math.round(v * g)), (m.height = Math.round(f * g)), (m.style.width = v + "px"), (m.style.height = "84px"));
    const b = m.getContext("2d");
    b.scale(g, g);
    const k = (e) => (e / c) * v,
      w = getComputedStyle(y.smodal || h.host || document.documentElement),
      x = (e, t) => (w.getPropertyValue(e) || "").trim() || t,
      S = () => {
        (b.clearRect(0, 0, v, f), (b.fillStyle = x("--bg2", "#14171c")), b.fillRect(0, 0, v, f));
        const e = k(Ls.a),
          t = k(Ls.b);
        ((b.fillStyle = "rgba(31,191,111,.14)"), b.fillRect(e, 0, t - e, f));
        for (let e = 0; e < d; e++) {
          const t = (e / d) * v,
            s = Math.max(1, 74 * p[e]),
            n = (e / d) * c;
          ((b.fillStyle = n >= Ls.a && n <= Ls.b ? x("--up", "#1fbf6f") : x("--line2", "#3a3f47")),
            b.fillRect(t, (f - s) / 2, Math.max(1, v / d - 0.5), s));
        }
        b.fillStyle = "#fff";
        for (const s of [e, t]) (b.fillRect(s - 1, 0, 2, f), b.fillRect(s - 5, 33, 10, 18));
        ((b.fillStyle = "#0b0e15"),
          (b.font = "700 10px " + (w.getPropertyValue("--font") || "system-ui")),
          (b.textAlign = "center"),
          (b.textBaseline = "middle"),
          b.fillText("‹", e, 42),
          b.fillText("›", t, 42));
        const s = a.querySelector(".trimrng");
        if (
          (s &&
            (s.textContent = Ls.a.toFixed(2) + " s → " + Ls.b.toFixed(2) + " s · " + (Ls.b - Ls.a).toFixed(2) + " s of " + c.toFixed(2)),
          null != Ls.playT)
        ) {
          const e = k(Ls.playT);
          ((b.fillStyle = "#fff"), (b.globalAlpha = 0.7), b.fillRect(e, 0, 1, f), (b.globalAlpha = 1));
        }
      };
    (S(),
      m.addEventListener("pointerdown", (e) => {
        const t = m.getBoundingClientRect(),
          s = e.clientX - t.left;
        Ls.drag = Math.abs(s - k(Ls.a)) <= Math.abs(s - k(Ls.b)) ? "a" : "b";
        try {
          m.setPointerCapture(e.pointerId);
        } catch (e) {}
        (C(e), e.preventDefault(), e.stopPropagation());
      }));
    const C = (e) => {
      if (!Ls || !Ls.drag) return;
      const t = m.getBoundingClientRect(),
        s = ((n = e.clientX - t.left), Math.max(0, Math.min(c, (n / v) * c)));
      var n;
      ("a" === Ls.drag ? (Ls.a = Math.min(s, Ls.b - 0.05)) : (Ls.b = Math.max(s, Ls.a + 0.05)),
        Ls.b - Ls.a > 8 && ("a" === Ls.drag ? (Ls.b = Ls.a + 8) : (Ls.a = Ls.b - 8)),
        (Ls.a = Math.max(0, Ls.a)),
        (Ls.b = Math.min(c, Ls.b)),
        S());
    };
    m.addEventListener("pointermove", C);
    const L = () => {
      Ls && (Ls.drag = null);
    };
    (m.addEventListener("pointerup", L), m.addEventListener("pointercancel", L));
    const q = a.querySelector(".trimplay"),
      M = () => {
        if (Ls && Ls.src) {
          try {
            Ls.src.stop();
          } catch (e) {}
          Ls.src = null;
        }
        (Ls && ((Ls.playT = null), cancelAnimationFrame(Ls.raf)), (q.textContent = "▶ Play selection"));
      };
    a.querySelector(".trimplay").onclick = () => {
      if (!Ls) return;
      if (Ls.src) return (M(), void S());
      const e = n.settings,
        t = Math.max(0, Math.min(1, void 0 === e.soundVol ? 0.35 : e.soundVol)),
        s = i.createBufferSource(),
        a = i.createGain();
      ((s.buffer = r), (a.gain.value = t), s.connect(a), a.connect(i.destination));
      const o = i.currentTime,
        l = Ls.a,
        c = Ls.b - Ls.a;
      (s.start(o, l, c),
        (Ls.src = s),
        (q.textContent = "■ Stop"),
        (s.onended = () => {
          Ls && Ls.src === s && ((Ls.src = null), (Ls.playT = null), (q.textContent = "▶ Play selection"), S());
        }));
      const d = () => {
        Ls && Ls.src === s && ((Ls.playT = Math.min(Ls.b, l + (i.currentTime - o))), S(), (Ls.raf = requestAnimationFrame(d)));
      };
      d();
    };
    const E = () => {
      ((Ls = null), (a.style.display = "none"), (a.innerHTML = ""));
    };
    ((a.querySelector(".trimcancel").onclick = () => {
      (M(), l ? ((Ls.a = 0), (Ls.b = Math.min(c, 8)), a.querySelector(".trimok").onclick()) : E());
    }),
      (a.querySelector(".trimok").onclick = async () => {
        if (Ls) {
          M();
          try {
            const e = 32e3,
              t = Math.max(1, Math.round((Ls.b - Ls.a) * e)),
              s = new OfflineAudioContext(1, t, e),
              a = s.createBufferSource();
            ((a.buffer = r), a.connect(s.destination), a.start(0, Ls.a, Ls.b - Ls.a));
            const l = (function (e, t) {
                const s = e.length,
                  n = new ArrayBuffer(44 + 2 * s),
                  a = new DataView(n),
                  o = (e, t) => {
                    for (let s = 0; s < t.length; s++) a.setUint8(e + s, t.charCodeAt(s));
                  };
                (o(0, "RIFF"),
                  a.setUint32(4, 36 + 2 * s, !0),
                  o(8, "WAVE"),
                  o(12, "fmt "),
                  a.setUint32(16, 16, !0),
                  a.setUint16(20, 1, !0),
                  a.setUint16(22, 1, !0),
                  a.setUint32(24, t, !0),
                  a.setUint32(28, 2 * t, !0),
                  a.setUint16(32, 2, !0),
                  a.setUint16(34, 16, !0),
                  o(36, "data"),
                  a.setUint32(40, 2 * s, !0));
                for (let t = 0; t < s; t++) {
                  const s = Math.max(-1, Math.min(1, e[t]));
                  a.setInt16(44 + 2 * t, s < 0 ? 32768 * s : 32767 * s, !0);
                }
                let l = "";
                const i = new Uint8Array(n);
                for (let e = 0; e < i.length; e += 8192) l += String.fromCharCode.apply(null, i.subarray(e, e + 8192));
                return "data:audio/wav;base64," + btoa(l);
              })((await s.startRendering()).getChannelData(0), e),
              i = Ls.k,
              c = {};
            ((c[i] = l),
              (n.settings[i] = l),
              delete Ss[o],
              W({ cmd: "settings", settings: c }),
              Yt("sound saved · " + (Ls.b - Ls.a).toFixed(2) + " s", "good"),
              E(),
              Es("sndBuy" === i));
          } catch (e) {
            Yt("could not save the trim", "bad");
          }
        }
      }));
  }
  let Ms = 0;
  function Es(e) {
    const t = n && n.settings;
    if (!t || !1 === t.sound) return;
    const s = e ? t.sndBuy : t.sndSell,
      a = xs();
    if (!a) return void (s && Cs(s));
    "suspended" === a.state && a.resume().catch(() => {});
    const o = Math.max(0, Math.min(1, void 0 === t.soundVol ? 0.35 : t.soundVol));
    if (!o) return;
    const l = document.getElementById("papr-host"),
      i = e ? t.sndBuy : t.sndSell;
    if (i && (l && (l.dataset.sfx = String(++Ms)), Cs(i))) return;
    const r = a.currentTime,
      c = document.getElementById("papr-host");
    c && (c.dataset.sfx = String(++Ms));
    (e ? [660, 990] : [590, 440]).forEach((e, t) => {
      const s = r + 0.075 * t,
        n = a.createOscillator(),
        l = a.createGain();
      ((n.type = "triangle"),
        n.frequency.setValueAtTime(e, s),
        l.gain.setValueAtTime(1e-4, s),
        l.gain.exponentialRampToValueAtTime(0.5 * o, s + 0.012),
        l.gain.exponentialRampToValueAtTime(1e-4, s + 0.13),
        n.connect(l),
        l.connect(a.destination),
        n.start(s),
        n.stop(s + 0.15));
    });
  }
  function As(e, t) {
    e && e.__t !== t && ((e.__t = t), (e.textContent = t));
  }
  function $s(e, t) {
    e && e.__c !== t && ((e.__c = t), (e.className = t));
  }
  function Ts(e) {
    if (!e) return null;
    let t = e.__num;
    return (
      (t && t.parentNode === e) ||
        ((e.innerHTML = '<svg class="ic solico" viewBox="0 0 16 16"><use href="#i-sol"/></svg><span class="n"></span>'),
        (t = e.__num = e.querySelector(".n")),
        (e.__h = null),
        (e.__pre = null),
        (e.__suf = null)),
      t
    );
  }
  function Bs(e, t) {
    const s = Number(e) || 0,
      n = Math.abs(s);
    return !t && n >= 100
      ? Math.round(s).toLocaleString("en-US")
      : n >= 1e3
        ? s.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : s.toFixed(2);
  }
  function Ps(e, t, s, n, a) {
    if (
      (As(Ts(y.pcbal), Bs(e)),
      As(Ts(y.pcpnl), (t >= 0 ? "+" : "") + Bs(t, !0)),
      $s(y.pcpnl, "pcpnl " + n),
      As(y.pcpct, ce(s, 2)),
      $s(y.pcpct, "pcpct " + n),
      a.showUsd && y.pcusd)
    ) {
      const s = l > 0 ? l : 0;
      (As(y.pcusd, s > 0 ? re(e * s) : "—"), As(y.pcpnlusd, s > 0 ? re(t * s, !0) : "—"), $s(y.pcpnlusd, "pcpnlusd " + n));
    }
  }
  let Hs = 0;
  function Fs(e) {
    const t = document.createElement("span");
    return (e.insertBefore(t, e.firstChild), t);
  }
  function _s(e) {
    const t = document.createElement("span");
    return ((t.className = "sym"), e.appendChild(t), t);
  }
  const Os = 50;
  let Vs = 0,
    Ns = null;
  function zs() {
    const s = Date.now(),
      a = s - Vs;
    a < Os
      ? Ns ||
        (Ns = setTimeout(() => {
          ((Ns = null), zs());
        }, Os - a))
      : (clearTimeout(Ns),
        (Ns = null),
        (Vs = s),
        (function () {
          if (!g || !n || S) return;
          ("set" === x.tab || Nt.indexOf(x.tab) >= 0) && (x.tab = "trade");
          (Te(), y.tabs.forEach((e) => e.classList.toggle("on", e.dataset.t === x.tab)));
          const s = !(!y.smodal || !y.smodal.classList.contains("on"));
          (Object.entries(y.panes).forEach(([e, t]) => {
            if (Nt.indexOf(e) >= 0) {
              const n = Ot.find((e) => e.id === Vt);
              t.classList.toggle("on", s && !!n && n.pane === e);
            } else t.classList.toggle("on", e === x.tab);
          }),
            (y.curbtn.textContent = "SOL" === E() ? ("ETH" === d() ? "Ξ" : "BNB" === d() ? "⬢" : "◎") : "$"));
          const a = n.settings.theme || "padre";
          y.wrap.dataset.theme !== a && (y.wrap.dataset.theme = a);
          y.card && y.card.dataset.theme !== a && (y.card.dataset.theme = a);
          if (
            ((function () {
              const e = is(),
                t = y.wrap;
              if (!t) return;
              const s = cs(),
                n = h && h.host;
              (n && n.style.setProperty("--font", s),
                t.style.setProperty("--bw", e.bw + "px"),
                t.style.setProperty("--r", e.r + "px"),
                t.style.setProperty("--rb", e.rb + "px"),
                (t.style.zoom = e.zoom),
                y.card && y.card.style.setProperty("--bw", e.bw + "px"));
            })(),
            !Y())
          )
            return (
              (y.wrap.style.display = "none"),
              y.card && (y.card.style.display = "none"),
              Ut(),
              y.launch && (y.launch.style.display = "none"),
              y.lmenu && y.lmenu.classList.remove("on"),
              void ft()
            );
          Ws();
          const o = !!m && !v;
          o || Wt();
          ((y.wrap.style.display = o ? "" : "none"), y.smodal && ((y.smodal.dataset.theme = a), y.smodal.classList.contains("on") && ks()));
          y.smodal && y.smodal.classList.contains("on") && ("track" === Vt ? qn() : "lb" === Vt && Bn());
          y.launch && (y.launch.style.display = "");
          if (y.lmenu) {
            const e = y.lmenu.querySelector(".lpanel");
            e &&
              (e.classList.toggle("dis", !m),
              As(e.querySelector(".lpsub"), m ? (v ? "Show it again" : "Buy, sell, exit orders") : "Open a token chart first"));
          }
          y.lmenu && (y.lmenu.dataset.theme = a);
          if (!m) {
            if (s) {
              const e = (Ot.find((e) => e.id === Vt) || {}).pane;
              "stats" === e ? cn() : "log" === e ? Kn() : "track" === e && Ln();
            }
            return;
          }
          const i = $(),
            r = B(),
            c = T();
          if ((As(y.tick, i ? i.baseToken.symbol : "…"), As(y.px, i ? te(parseFloat(i.priceUsd)) : ""), r && c && r.tokens > 0)) {
            const t = e.exitValue(c, r.tokens, n.settings),
              s = t - r.costSol,
              a = r.costSol > 0 ? 100 * (t / r.costSol - 1) : 0;
            (As(y.hdpnl, (s >= 0 ? "+" : "") + oe(s, { unit: !1 }) + " · " + ce(a, 1)),
              $s(y.hdpnl, "pill hdpnl " + (s >= 0 ? "up" : "down")));
          } else (As(y.hdpnl, oe(u(), { d: 3 })), $s(y.hdpnl, "pill hdpnl"));
          "trade" === x.tab
            ? (function (s, a, o) {
                const i = n.settings;
                !(function (e, t) {
                  const s = n.settings,
                    a = !!s.exitOn,
                    o = "axiom" === Ae();
                  (y.exitck.classList.toggle("on", a), As(y.exitck.querySelector(".exl"), o ? "Adv." : "Exit"));
                  const l = y.exits;
                  if (l.contains(h.activeElement)) return;
                  const i = t ? t.baseToken.address : "",
                    r = he(t),
                    c = t ? parseFloat(t.priceUsd) : 0,
                    p = Array.isArray(s.exits) ? s.exits : ve,
                    u = (n.orders || []).filter((e) => e.mint === i).sort((e, t) => e.createdAt - t.createdAt),
                    v = !!(e && e.tokens > 0),
                    f = (e) =>
                      "pct" === e.mode
                        ? ("sl" === e.kind ? "−" : "+") + +e.value + "% PnL" + (e.lvUsd > 0 ? " · " + (r ? se(e.lvUsd * r) + " MC" : te(e.lvUsd)) : "")
                        : "mc" === e.mode
                          ? se(e.value) + " MC"
                          : r
                            ? se(e.value * r) + " MC"
                            : te(e.value),
                    g = a
                      ? p
                          .map(
                            (e, t) =>
                              `<div class="exrow">\n        <span class="exk ${"sl" === e.k ? "sl" : "tp"}" data-i="${t}" data-tip="Take profit or stop loss — click to switch">${"sl" === e.k ? "SL" : "TP"}</span>\n        <span class="exin" data-tip="Trigger: your PnL on this position, fees included — the same % the panel shows. SL 20 sells when you are down 20%"><i>${"sl" === e.k ? "−" : "+"}</i><input data-i="${t}" data-f="v" value="${e.v}" inputmode="decimal"><i>%</i></span>\n        <span class="exlb">sell</span>\n        <span class="exin" data-tip="Share of the position sold when it triggers"><input data-i="${t}" data-f="s" value="${e.s}" inputmode="decimal"><i>%</i></span>\n        <span class="exx" data-i="${t}" title="Remove">${At}</span>\n      </div>`,
                          )
                          .join("")
                      : "",
                    slR = p.find((e) => "sl" === e.k && +e.v > 0),
                    rkP = +s.riskPct > 0 ? +s.riskPct : 2,
                    rkA = slR ? ((bl) => Math.min(bl, (bl * rkP) / 100 / (+slR.v / 100)))(BX$.api.balance()) : 0,
                    b = a
                      ? `<div class="exft">${p.length < 6 ? '<span class="exa exadd">+ Add</span>' : "<span></span>"}<span class="exa exlad" data-tip="Sell in steps: 25% at +50%, a third of the rest at +100%, everything left at +200%, stop at −30%">Ladder</span>${v ? '<span class="exa exnow" data-tip="Place these orders on the position you already hold">Apply to position</span>' : ""}</div>` +
                        (slR && rkA > 0
                          ? `<div class="exft exsize"><span class="exsl" data-tip="With your stop loss at −${+slR.v}%, buying this much loses ${rkP}% of your balance if the stop is hit. Change the % in Settings › Risk rules">Size for ${rkP}% risk</span><span class="exa exbuy" data-a="${+rkA.toFixed(rkA >= 1 ? 2 : 3)}" data-tip="Buy this amount, with your exit lines">Buy ${ne(rkA, rkA >= 1 ? 2 : 3)} ${d()}</span></div>`
                          : "")
                      : "",
                    k = u.length
                      ? `<div class="exact">${u.map((e) => `<div class="exo">\n        <b class="${"sl" === e.kind ? "dn" : "up"}">${"tp" === e.kind ? "TP" : "sl" === e.kind ? "SL" : "Limit"}</b>\n        <span>${f(e)}</span><span class="exd">${"limit" === e.kind ? ne(e.amountSol, 3) + " " + (e.asset || d()) : "sell " + e.sizePct + "%"}</span>\n        <span class="exx exc" data-id="${e.id}" title="Cancel">${At}</span></div>`).join("")}</div>`
                      : "",
                    w = a
                      ? an
                        ? `<div class="exrow exlim"><span class="exk lim" data-tip="Limit buy — buys when the market cap drops to your level">Limit</span>\n          <span class="exin wide"><i>MC</i><input data-lim="value" value="${("mc" === en.limit.mode && en.limit.value) || ""}" placeholder="${r && c ? ue(r * c * 0.8) : "50k"}"></span>\n          <span class="exin"><input data-lim="amount" value="${en.limit.amount || ""}" inputmode="decimal"><i>${d()}</i></span>\n          <span class="exa exgo">Place</span><span class="exx exlx" title="Close">${At}</span></div>`
                        : '<div class="exft"><span class="exa exlopen">+ Limit buy</span></div>'
                      : "",
                    x = g + b + w + k;
                  if (!tn(l, x)) return;
                  l.style.display = x ? "" : "none";
                  const S = (e) => {
                      ((n.settings.exits = e), W({ cmd: "settings", settings: { exits: e } }), zs());
                    },
                    C = () => p.map((e) => Object.assign({}, e));
                  (l.querySelectorAll(".exk[data-i]").forEach(
                    (e) =>
                      (e.onclick = () => {
                        const t = C(),
                          s = t[+e.dataset.i];
                        ((s.k = "sl" === s.k ? "tp" : "sl"), "sl" === s.k && s.v >= 100 && (s.v = 50), S(t));
                      }),
                  ),
                    l.querySelectorAll(".exrow input[data-f]").forEach((e) => {
                      (e.addEventListener("keydown", (t) => {
                        (t.stopPropagation(), "Enter" === t.key && e.blur());
                      }),
                        e.addEventListener("focus", () => e.select()),
                        e.addEventListener("change", () => {
                          const t = C(),
                            s = t[+e.dataset.i],
                            n = de(e.value);
                          if (!(n > 0) || ("s" === e.dataset.f && n > 100) || ("v" === e.dataset.f && "sl" === s.k && n >= 100))
                            return (
                              Yt(
                                "s" === e.dataset.f
                                  ? "sell between 1 and 100%"
                                  : "sl" === s.k
                                    ? "stop loss between 1 and 99%"
                                    : "invalid %",
                                "bad",
                              ),
                              (l.__h = ""),
                              zs()
                            );
                          ((s[e.dataset.f] = n), S(t));
                        }));
                    }),
                    l.querySelectorAll(".exx[data-i]").forEach(
                      (e) =>
                        (e.onclick = () => {
                          const t = C();
                          (t.splice(+e.dataset.i, 1), S(t));
                        }),
                    ));
                  const L = l.querySelector(".exadd");
                  L &&
                    (L.onclick = () => {
                      const e = C();
                      (e.push(e.some((e) => "tp" === e.k) ? { k: "sl", v: 30, s: 100 } : { k: "tp", v: 100, s: 50 }), S(e));
                    });
                  const LD = l.querySelector(".exlad");
                  LD &&
                    (LD.onclick = () =>
                      S([
                        { k: "tp", v: 50, s: 25 },
                        { k: "tp", v: 100, s: 33 },
                        { k: "tp", v: 200, s: 100 },
                        { k: "sl", v: 30, s: 100 },
                      ]));
                  const BY = l.querySelector(".exbuy");
                  BY &&
                    (BY.onclick = () => {
                      if (!m) return Yt("no token");
                      V(!0);
                      W({ cmd: "buy", pair: m, amountSol: +BY.dataset.a, exits: fe() });
                    });
                  const q = l.querySelector(".exnow");
                  q &&
                    (q.onclick = () => {
                      m && W({ cmd: "exits", pair: m, exits: fe() });
                    });
                  l.querySelectorAll(".exc").forEach((e) => (e.onclick = () => W({ cmd: "cancel", id: e.dataset.id })));
                  const M = l.querySelector(".exlopen");
                  M &&
                    (M.onclick = () => {
                      ((an = !0), (l.__h = ""), zs());
                    });
                  const E = l.querySelector(".exlx");
                  E &&
                    (E.onclick = () => {
                      ((an = !1), (l.__h = ""), zs());
                    });
                  l.querySelectorAll("input[data-lim]").forEach((e) => {
                    (e.addEventListener("keydown", (t) => {
                      if ((t.stopPropagation(), "Enter" === t.key)) {
                        e.dispatchEvent(new Event("change"));
                        const t = l.querySelector(".exgo");
                        t && t.click();
                      }
                    }),
                      e.addEventListener("change", () => {
                        ((en.limit.mode = "mc"), (en.limit[e.dataset.lim] = e.value));
                      }));
                  });
                  const A = l.querySelector(".exgo");
                  A &&
                    (A.onclick = () => {
                      (l.querySelectorAll("input[data-lim]").forEach((e) => {
                        en.limit[e.dataset.lim] = e.value;
                      }),
                        (en.limit.mode = "mc"),
                        rn("limit", B(), $()),
                        (l.__h = ""),
                        zs());
                    });
                })(s, o);
                const r = !!x.posUsd && l > 0;
                y.posg.classList.toggle("usd", r);
                const c = (e) => (r ? ae(e * l) : ne(e, 3));
                (tn(y.buyunit, "SOL" === E() ? t() : "$"), y.ccy.forEach((e) => e.classList.toggle("on", e.dataset.c === E())));
                const p = Zs(),
                  v = p[i.slot || 0] || p[0],
                  f = v.buy,
                  g = v.sell;
                (y.pslots.forEach((e) => e.classList.toggle("on", +e.dataset.s === (i.slot || 0))),
                  y.wrap.querySelectorAll(".pedit").forEach((e) => {
                    (e.classList.toggle("on", !!Jt),
                      "buy" === e.dataset.side && e.parentElement.classList.contains("hgl") && tn(e, Jt ? qt : Lt));
                  }));
                const b = Qt("buy");
                (y.buychips.classList.toggle("editing", !!b),
                  b
                    ? peHTML(y.buychips, "buy") && ts(y.buychips)
                    : tn(
                        y.buychips,
                        f
                          .map((e) => `<div class="chip pill buy" data-a="${e}">${"USD" === E() && l ? "$" + Math.round(e * l) : e}</div>`)
                          .join(""),
                      ) &&
                      y.buychips.querySelectorAll(".chip").forEach((e) => {
                        const t = parseFloat(e.dataset.a);
                        ((e.onclick = () => {
                          if (!m) return Yt("no token");
                          V(!0);
                          const e = n.settings.exitOn ? fe() : null;
                          W(Object.assign({ cmd: "buy", pair: m, amountSol: t }, e && e.length ? { exits: e } : {}));
                        }),
                          (e.onmouseenter = () => Ys(t)),
                          (e.onmouseleave = () => Ys()));
                      }));
                const w = "sol" === i.sellMode;
                y.selltitle.textContent = w ? "Sell " + d() : "Sell %";
                const S = Qt("sell");
                y.sellchips.classList.toggle("editing", !!S);
                const C = S
                  ? es("sell")
                  : w
                    ? v.buy.map((e) => `<div class="chip pill sell" data-a="${e}">${e}</div>`).join("")
                    : g.map((e) => `<div class="chip pill sell" data-f="${e / 100}">${e}%</div>`).join("");
                S
                  ? peHTML(y.sellchips, "sell") && ts(y.sellchips)
                  : tn(y.sellchips, C) &&
                    y.sellchips.querySelectorAll(".chip").forEach((t) => {
                      const s = () =>
                        void 0 !== t.dataset.f
                          ? parseFloat(t.dataset.f)
                          : (function (t, s, a) {
                              if (!(t && s && t.tokens > 0 && a > 0)) return null;
                              const o = e.simulateSell(s, t.tokens, n.settings, 0);
                              if (!o) return null;
                              if (o.solNet <= a) return 1;
                              let l = 0,
                                i = 1;
                              for (let o = 0; o < 30; o++) {
                                const o = (l + i) / 2,
                                  r = e.simulateSell(s, t.tokens * o, n.settings, 0);
                                r && r.solNet >= a ? (i = o) : (l = o);
                              }
                              return i;
                            })(B(), T(), parseFloat(t.dataset.a));
                      ((t.onclick = () => {
                        const e = s();
                        e ? ye(e) : Yt("position too small");
                      }),
                        (t.onmouseenter = () => {
                          const e = s();
                          e && Js(e);
                        }),
                        (t.onmouseleave = () => Js(1)));
                    });
                const L = '<hr class="vsep">',
                  q = (t) => {
                    const s = e.feesOf(i, t, d()),
                      n = "SOL" !== d(),
                      a = `<span class="si" data-fee="${t}" data-tip="Max slippage of this preset — click to edit">${xt("i-slip", 14)}<span>${(+s.slip || 0).toFixed(2)}%</span></span>`;
                    if (n) {
                      const e = `<span class="si" data-fee="${t}" data-tip="Gas paid on each swap — click to edit">${St("i-gas", "gas-station-line", 14)}<span>${ne(s.gas, 5)}</span></span>`;
                      return "axiom" === Ae() ? a + L + e : e + L + a;
                    }
                    const o = `<span class="si" data-fee="${t}" data-tip="Priority fee paid on each trade — click to edit">${St("i-gas", "gas-station-line", 14)}<span>${ne(s.prio, 4)}</span></span>`,
                      l = `<span class="si" data-fee="${t}" data-tip="Jito tip paid on each trade — click to edit">${St("i-coin", "coin-line", 14)}<span>${ne(s.tip, 4)}</span></span>`;
                    return "axiom" === Ae() ? a + L + o + L + l : o + L + l + L + a;
                  };
                tn(y.buystrip, q("buy")) &&
                  y.buystrip.querySelectorAll("[data-fee]").forEach(
                    (e) =>
                      (e.onclick = (e) => {
                        (e.stopPropagation(), Gt("buy"));
                      }),
                  );
                (As(y.wrap.querySelector(".hbaln"), oe(u(), { d: 3, unit: !1 })),
                  As(y.wrap.querySelector(".wasset"), d()),
                  tn(y.sellstrip, q("sell")) &&
                    y.sellstrip.querySelectorAll("[data-fee]").forEach(
                      (e) =>
                        (e.onclick = (e) => {
                          (e.stopPropagation(), Gt("sell"));
                        }),
                    ));
                const M = !!(s && s.tokens > 0 && a && o);
                if (((y.sellcard.style.display = ""), y.sellcard.classList.toggle("flat", !(s && s.tokens > 0)), M)) {
                  const t = e.exitValue(a, s.tokens, i),
                    n = s.returnedSol + t - s.investedSol,
                    l = s.peakTokens > 0 ? (s.tokens / s.peakTokens) * 100 : 100;
                  (s.costSol, s.tokens, parseFloat(o.priceUsd));
                  ((y.bx.in.textContent = c(s.investedSol)),
                    (y.bx.out.textContent = c(s.returnedSol)),
                    (y.bx.rest.textContent = l.toFixed(0) + "%"),
                    (k = n),
                    As(y.bx.pnl, (n >= 0 ? "+" : "") + c(n)),
                    $s(y.bx.pnl, "v bxpnl " + (n >= 0 ? "up" : "down")),
                    pnlPct(n, s.investedSol),
                    (y.restbar.style.display = l < 99.5 ? "" : "none"),
                    (y.restfill.style.width = Math.max(2, l) + "%"));
                  const r = Qs(s, a);
                  ((y.sellinit.style.display = r ? "" : "none"),
                    As(Ts(y.sellrest), oe(t, { d: 2, unit: !1 })),
                    As(y.sellrest.__pre || (y.sellrest.__pre = Fs(y.sellrest)), ie(s.tokens)),
                    As(y.sellrest.__suf || (y.sellrest.__suf = _s(y.sellrest)), " " + o.baseToken.symbol),
                    Js(1));
                } else if (s && s.tokens > 0) {
                  const e = s.peakTokens > 0 ? (s.tokens / s.peakTokens) * 100 : 100;
                  ((y.bx.in.textContent = c(s.investedSol)),
                    (y.bx.out.textContent = c(s.returnedSol)),
                    (y.bx.rest.textContent = e.toFixed(0) + "%"),
                    As(y.bx.pnl, null != k ? (k >= 0 ? "+" : "") + c(k) : "—"),
                    $s(y.bx.pnl, "v bxpnl dim2"),
                    pnlPct(k, s.investedSol, !0),
                    (y.restbar.style.display = e < 99.5 ? "" : "none"),
                    (y.restfill.style.width = Math.max(2, e) + "%"),
                    (y.sellinit.style.display = "none"));
                } else {
                  /* Position fermee : la rangee garde le bilan de ce token (tous les trades
                     clos dessus), pour toujours, au lieu de retomber a zero. */
                  k = null;
                  const H = tokHist(o ? o.baseToken.address : N(), m);
                  if (H) {
                    const hp = H.out - H.inv;
                    ((y.bx.in.textContent = c(H.inv)),
                      (y.bx.out.textContent = c(H.out)),
                      (y.bx.rest.textContent = "0%"),
                      As(y.bx.pnl, (hp >= 0 ? "+" : "") + c(hp)),
                      $s(y.bx.pnl, "v bxpnl " + (hp >= 0 ? "up" : "down")),
                      pnlPct(hp, H.inv));
                  } else
                    ((y.bx.in.textContent = c(0)),
                      (y.bx.out.textContent = c(0)),
                      (y.bx.rest.textContent = "—"),
                      As(y.bx.pnl, "—"),
                      $s(y.bx.pnl, "v bxpnl dim2"),
                      pnlPct(null));
                  ((y.restbar.style.display = "none"), (y.sellinit.style.display = "none"));
                }
                (Ys(), nn(), BX$.hooks.trade && BX$.hooks.trade(s, a, o));
              })(r, c, i)
            : "orders" === x.tab
              ? ln(r, c, i)
              : "stats" === x.tab
                ? cn()
                : "log" === x.tab
                  ? Kn()
                  : "track" === x.tab && Ln();
          if (s) {
            const e = (Ot.find((e) => e.id === Vt) || {}).pane;
            "orders" === e ? ln(r, c, i) : "stats" === e ? cn() : "log" === e ? Kn() : "track" === e && Ln();
          }
          "track" === Vt && y.smodal && y.smodal.classList.contains("on") && qn();
          "lb" === Vt && y.smodal && y.smodal.classList.contains("on") && Bn();
          Us();
        })());
  }
  let Ds = 0,
    Rs = null;
  function Us() {
    const e = Date.now(),
      t = e - Ds;
    if (t < 200)
      Rs ||
        (Rs = setTimeout(() => {
          ((Rs = null), Us());
        }, 200 - t));
    else {
      (clearTimeout(Rs), (Rs = null), (Ds = e));
      try {
        yt();
      } catch (e) {}
    }
  }
  function js(e) {
    const t = e || d();
    return "ETH" === t ? "slotsEth" : "BNB" === t ? "slotsBnb" : "slots";
  }
  function Zs() {
    return Is(d());
  }
  function Is(t) {
    const s = n.settings,
      a = js(t);
    if (Array.isArray(s[a]) && 3 === s[a].length) return s[a];
    const o = s.sellPresets || e.DEFAULTS.sellPresets.slice();
    if ("ETH" === t || "BNB" === t) {
      const n = ("ETH" === t ? s.buyPresetsEth : s.buyPresetsBnb) || ("ETH" === t ? e.DEFAULTS.buyPresetsEth : e.DEFAULTS.buyPresetsBnb);
      return [
        { buy: n, sell: o },
        { buy: n.slice(1, 5), sell: [25, 50, 75, 100] },
        { buy: n.slice(3, 7), sell: [10, 25, 50, 100] },
      ];
    }
    return [
      { buy: s.buyPresets || [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10], sell: o },
      { buy: [0.5, 1, 2, 5], sell: [25, 50, 75, 100] },
      { buy: [1, 2, 5, 10], sell: [10, 25, 50, 100] },
    ];
  }
  function Gs(e) {
    const t = e.dataset.d;
    let s = !1,
      n = null,
      a = 0,
      o = 0,
      l = 0,
      i = 0,
      r = 0,
      c = 0,
      d = 22,
      p = 1,
      u = null,
      h = 0;
    const m = () => {
      ((h = 0),
        u &&
          ((y.card.style.width = u.w + "px"),
          (y.card.style.height = u.h + "px"),
          (y.card.style.left = u.x + "px"),
          (y.card.style.top = u.y + "px"),
          y.card.style.setProperty("--pcfs", u.fs + "px"),
          y.card.style.setProperty("--pcs", String(u.w / 238))));
    };
    (e.addEventListener("pointerdown", (t) => {
      if (0 !== t.button) return;
      const u = os();
      ((s = !0),
        (S = !0),
        (n = t.pointerId),
        (a = t.clientX),
        (o = t.clientY),
        (l = u.w),
        (i = u.h),
        (d = u.fs),
        (p = u.zoom || 1),
        (r = parseInt(y.card.style.left) || 0),
        (c = parseInt(y.card.style.top) || 0));
      try {
        e.setPointerCapture(n);
      } catch (e) {}
      (t.preventDefault(), t.stopPropagation());
    }),
      e.addEventListener("pointermove", (e) => {
        if (!s) return;
        const n = (e.clientX - a) / p,
          v = (e.clientY - o) / p;
        let f = l,
          y = i,
          g = r,
          b = c;
        (t.includes("e") && (f = l + n),
          t.includes("s") && (y = i + v),
          t.includes("w") && (f = l - n),
          t.includes("n") && (y = i - v),
          (f = Math.max(150, Math.min(900, Math.round(f)))),
          (y = Math.max(48, Math.min(400, Math.round(y)))),
          t.includes("w") && (g = r + (l - f) * p),
          t.includes("n") && (b = c + (i - y) * p));
        const k = Math.min(f / l, y / i);
        ((u = { w: f, h: y, x: Math.round(g), y: Math.round(b), fs: Math.max(8, Math.round(d * k * 10) / 10) }),
          h || (h = requestAnimationFrame(m)));
      }));
    const v = () => {
      if (s) {
        ((s = !1), (S = !1), h && (cancelAnimationFrame(h), (h = 0)));
        try {
          e.releasePointerCapture(n);
        } catch (e) {}
        u && (m(), L({ cardX: u.x, cardY: u.y }), ls({ w: u.w, h: u.h, fs: u.fs }), (u = null));
      }
    };
    (e.addEventListener("pointerup", v), e.addEventListener("pointercancel", v));
  }
  function Ws() {
    const t = os();
    ((y.card.style.display = t.on ? "" : "none"),
      (y.card.style.left = (null != x.cardX ? x.cardX : 420) + "px"),
      (y.card.style.top = (null != x.cardY ? x.cardY : 96) + "px"),
      (y.card.style.width = t.w + "px"),
      (y.card.style.height = t.h + "px"),
      (y.card.style.borderRadius = t.r + "px"),
      (y.card.style.zoom = t.zoom),
      y.card.style.setProperty("--tsh", t.tsh + "px"),
      y.card.style.setProperty("--pcfs", t.fs + "px"),
      y.card.style.setProperty("--pcs", String(t.w / 238)),
      y.card.style.setProperty("--pcdim", String(t.dim)),
      t.bg
        ? ((y.pcbg.style.backgroundImage = `url(${t.bg})`), y.card.classList.add("custombg"))
        : ((y.pcbg.style.backgroundImage = "none"), y.card.classList.remove("custombg")));
    const s = t.blur ? `blur(${t.blur}px)` : "none";
    ((y.pcbg.style.filter = s),
      (y.pcimg.style.filter = s),
      (y.pcpct.style.display = t.showPct ? "" : "none"),
      (y.pcpnl.style.display = t.showPnl ? "" : "none"),
      (y.pcr3.style.display = t.showUsd ? "" : "none"),
      (y.pcpnlusd.style.display = t.showPnl ? "" : "none"));
    const o = y.card.querySelector(".pclbl");
    ((o.style.display = t.showLbl ? "" : "none"), (o.textContent = t.label || "BALANCE"));
    let i = 0;
    for (const t in n.positions) {
      const s = n.positions[t],
        o = a[s.pair];
      if (!p(s)) continue;
      const c = o ? e.marketState(o, l, r) : null;
      c && s.tokens > 0 && (i += e.exitValue(c, s.tokens, n.settings));
    }
    const c = Ks(i);
    Ps(c.total, c.pnl, c.pct, c.pnl >= 0 ? "up" : "down", t);
  }
  function Ks(e) {
    const t = u() + e;
    let s = 0;
    for (const e of n.trades || []) p(e) && (s += e.pnlSol || 0);
    let a = 0;
    for (const e in n.positions) {
      const t = n.positions[e];
      t.tokens > 0 && p(t) && (a += t.costSol || 0);
    }
    const o = s + e - a,
      l = t - o;
    return { total: t, pnl: o, pct: l > 0 ? (o / l) * 100 : 0 };
  }
  function Ys(t) {
    if (!y.buyprev) return;
    if (!$()) return void ((y.buyprev.innerHTML = ""), (y.buyprev.className = "preview buyprev"));
    const s = T(),
      a = $(),
      o = t > 0 ? t : me();
    if (!(n.settings.previews && s && o > 0)) return void (y.buyprev.innerHTML = "");
    const l = e.cfgFor(n.settings, "buy", d()),
      i = e.simulateBuy(s, o, l, "max"),
      r = e.simulateBuy(s, o, l, 0);
    ((y.buyprev.className = "preview buyprev"),
      (y.buyprev.innerHTML = i
        ? `Receive ≈ <b>${ie(r.tokens)}</b> ${a.baseToken.symbol} <span class="dim2">(min. ${ie(i.tokens)})</span><br>Impact <span class="${Math.abs(i.impactPct) > 3 ? "warn" : ""}">${ce(i.impactPct)}</span> · fees <b>${oe(i.feesTotalSol, { d: 4, unit: !1 })}</b> · debit <b>${oe(i.solTotal)}</b>` +
          (i.exact ? "" : ' <span class="warn">(estimated impact)</span>')
        : '<span class="warn">cannot simulate</span>'));
  }
  function Js(t) {
    if (!y.sellprev) return;
    const s = B(),
      a = T();
    if (!(n.settings.previews && s && a && s.tokens > 0)) return void (y.sellprev.innerHTML = "");
    const o = e.simulateSell(a, s.tokens * t, e.cfgFor(n.settings, "sell", d()), "max");
    if (!o) return void (y.sellprev.innerHTML = '<span class="warn">not enough liquidity</span>');
    const l = o.solNet - s.costSol * t,
      i = s.tokens * (1 - t);
    y.sellprev.innerHTML =
      `Sell <b>${Math.round(100 * t)}%</b> → <b>${oe(o.solNet)}</b> net · impact <span class="${Math.abs(o.impactPct) > 3 ? "warn" : ""}">${ce(o.impactPct)}</span><br>Result <b class="${l >= 0 ? "up" : "down"}">${le(l)}</b>` +
      (i > 0 ? ` <span class="dim2">· ${ie(i)} left</span>` : ' <span class="dim2">· position closed</span>');
  }
  let Xs = { k: null, v: null };
  function Qs(t, s) {
    if (!(t && s && t.tokens > 0)) return null;
    const a = t.tokens + "|" + t.investedSol + "|" + t.returnedSol + "|" + (s.priceSol > 0 ? s.priceSol.toPrecision(6) : 0);
    if (Xs.k === a) return Xs.v;
    const o = (function (t, s) {
      const a = t.investedSol - t.returnedSol;
      if (!(a > 0)) return null;
      const o = e.simulateSell(s, t.tokens, n.settings, 0);
      if (!o) return null;
      if (o.solNet <= a) return 1;
      let l = 0,
        i = 1;
      for (let o = 0; o < 30; o++) {
        const o = (l + i) / 2,
          r = e.simulateSell(s, t.tokens * o, n.settings, 0);
        r && r.solNet >= a ? (i = o) : (l = o);
      }
      return i;
    })(t, s);
    return ((Xs = { k: a, v: o }), o);
  }
  const en = {
    tp: { mode: "pct", value: 50, size: 100 },
    sl: { mode: "pct", value: 25, size: 100 },
    limit: { mode: "price", value: "", amount: 0.5 },
  };
  function tn(e, t) {
    return !(!e || e.__h === t) && ((e.__h = t), (e.innerHTML = t), !0);
  }
  function sn(e) {
    const t = "tp" === e ? "Take Profit" : "Stop Loss";
    return `<div class="card" data-k="${e}">\n      <div class="lbl">${t} <span class="dim2 sym"></span></div>\n      <div class="obody">\n        <div class="orow">\n          <div class="seg"><span data-m="pct">%</span><span data-m="price">$</span><span data-m="mc">MC</span></div>\n          <input class="oin" data-f="value">\n          <span class="olab">size</span>\n          <input class="oin sz" data-f="size">\n          <span class="olab">%</span>\n        </div>\n        <div class="preview prev"></div>\n        <button class="btn ${"tp" === e ? "buy" : "sell"} place" style="margin-top:7px">Place ${e.toUpperCase()}</button>\n      </div>\n      <div class="empty nopos">Open a position to place a ${t}.</div>\n    </div>`;
  }
  /* Le PNL en %, a droite du montant : par rapport a ce qu'on a mis sur le token. */
  function pnlPct(v, base, dim) {
    const el = y.bx && y.bx.pct;
    if (!el) return;
    if (!(base > 0) || null == v || !isFinite(v)) return void (As(el, ""), $s(el, "bxpct"));
    const p = (v / base) * 100, a = Math.abs(p);
    As(el, (p >= 0 ? "+" : "−") + (a >= 1000 ? Math.round(a).toLocaleString("en-US") : a >= 10 ? a.toFixed(0) : a.toFixed(1)) + "%");
    $s(el, "bxpct " + (dim ? "dim2" : p >= 0 ? "up" : "down"));
  }
  function tokHist(mint, pair) {
    if (!n) return null;
    const ts = n.tokenStats || {};
    if (mint && ts[mint] && ts[mint].n > 0) return ts[mint];
    let o = null;
    for (const t of n.trades || []) {
      if (!((mint && t.mint === mint) || (pair && t.pair === pair))) continue;
      o = o || { inv: 0, out: 0, n: 0 };
      ((o.inv += +t.investedSol || 0), (o.out += +t.returnedSol || 0), (o.n += 1));
    }
    if (!o && pair) for (const k in ts) if (ts[k].pair === pair && ts[k].n > 0) return ts[k];
    return o;
  }
  function nn() {
    /* Son applySize, a l'identique.
       Terminal : petit, une rangee de chaque cote ; la 2e rangee apparait pour les
       deux quand un bouton sur une rangee ferait 66 px (la place pour deux rangees
       de 33 px).
       Axiom : les rangees s'ajoutent une a une des qu'elles tiennent a leur hauteur
       minimale (28 px, 30 en vente) — achat et vente ensemble. */
    if (!y.buychips || !y.sellchips || !y.wrap) return;
    const B = y.buychips, Sl = y.sellchips;
    const many = (e) => e.querySelectorAll(":scope > .chip").length > 4;
    if (!y.wrap.classList.contains("sized")) return void (B.classList.toggle("one", many(B)), Sl.classList.toggle("one", many(Sl)));
    const avail = B.offsetHeight + Sl.offsetHeight;
    let b = 1, s = 1;
    if ("axiom" === Ae()) {
      const g = (rows, min) => rows * min + (rows - 1) * 8;
      /* achat et vente passent a deux rangees au meme moment, des qu'elles tiennent
         toutes les deux a leur hauteur minimale */
      if (g(many(B) ? 2 : 1, 28) + g(many(Sl) ? 2 : 1, 30) <= avail) (b = 2), (s = 2);
    } else if (avail / 2 >= 66) (b = 2), (s = 2);
    B.classList.toggle("one", many(B) && b === 1), Sl.classList.toggle("one", many(Sl) && s === 1);
  }
  let an = !1;
  function on(e, t, s) {
    return "price" === t ? te(e) + (s ? ' <span class="dim2">· ' + se(e * s) + " MC</span>" : "") : s ? se(e * s) + " MC" : te(e);
  }
  function ln(e, t, s) {
    if (!y.oCards) return;
    const o = s ? s.baseToken.symbol : "—",
      i = s ? parseFloat(s.priceUsd) : 0,
      r = !!(e && e.tokens > 0),
      c = r && l ? (e.costSol / e.tokens) * l : 0,
      p = h.activeElement;
    ["tp", "sl"].forEach((e) => {
      const t = y.oCards[e],
        n = en[e];
      if (
        ((t.querySelector(".sym").textContent = o),
        (t.querySelector(".obody").style.display = r ? "" : "none"),
        (t.querySelector(".nopos").style.display = r ? "none" : ""),
        !r)
      )
        return;
      (t.querySelectorAll(".seg span").forEach((e) => e.classList.toggle("on", e.dataset.m === n.mode)),
        t.querySelectorAll(".oin").forEach((e) => {
          e !== p && (e.value = n[e.dataset.f]);
        }));
      const a = he(s),
        l =
          "price" === n.mode
            ? pe(n.value)
            : "mc" === n.mode
              ? a
                ? pe(n.value) / a
                : 0
              : c
                ? "tp" === e
                  ? c * (1 + pe(n.value) / 100)
                  : c * (1 - pe(n.value) / 100)
                : 0;
      t.querySelector(".prev").innerHTML =
        l > 0
          ? `Triggers at <b>${on(l, n.mode, a)}</b>${i ? ` <span class="dim2">(${ce(100 * (l / i - 1), 1)} vs current)</span>` : ""}`
          : "mc" !== n.mode || a
            ? '<span class="warn">invalid trigger</span>'
            : '<span class="warn">no market cap for this token</span>';
    });
    const u = y.oCards.limit,
      m = en.limit,
      v = he(s);
    ((u.querySelector(".sym").textContent = o),
      u.querySelectorAll(".seg span").forEach((e) => e.classList.toggle("on", e.dataset.m === m.mode)),
      u.querySelectorAll(".oin").forEach((e) => {
        e !== p && (e.value = m[e.dataset.f]);
      }),
      (u.querySelector('[data-f="value"]').placeholder = "mc" === m.mode ? (v ? ue(v * i) : "50k") : i ? i.toPrecision(4) : "0"));
    const f = "mc" === m.mode ? (v ? pe(m.value) / v : 0) : pe(m.value);
    u.querySelector(".prev").innerHTML = s
      ? f > 0
        ? `Buys at <b>${on(f, m.mode, v)}</b>${i ? ` <span class="dim2">(${ce(100 * (f / i - 1), 1)} vs current)</span>` : ""}`
        : `Buys when the trigger is reached. Now <b>${v ? se(v * i) + " MC" : te(i)}</b>.`
      : `Open a token on ${"axiom" === K ? "Axiom" : "Terminal"}.`;
    const g = n.orders.slice().sort((e, t) => t.createdAt - e.createdAt);
    y.ocount.textContent = g.length;
    const b = g
        .map((e) => {
          let t,
            s = e.value;
          if ("pct" === e.mode) {
            const t = n.positions[e.mint];
            s = t && t.tokens > 0 ? (e.lvUsd > 0 ? e.lvUsd : l ? (t.costSol / t.tokens) * l * ("tp" === e.kind ? 1 + e.value / 100 : 1 - e.value / 100) : 0) : 0;
          }
          if ("mc" === e.mode) t = se(e.value) + " MC";
          else {
            const n = he(a[e.pair]);
            t = s > 0 ? (n ? se(s * n) + " MC" : te(s)) : "—";
          }
          const o = "tp" === e.kind ? "TP" : "sl" === e.kind ? "SL" : "LIMIT";
          return `<tr>\n        <td class="sym"><b class="${"sl" === e.kind ? "down" : "up"}">${o}</b> ${e.symbol || ""}</td>\n        <td>${t}</td>\n        <td class="dim">${"limit" === e.kind ? ne(e.amountSol, 3) + " " + (e.asset || d()) : e.sizePct + "%"}</td>\n        <td><span class="xbtn" data-id="${e.id}">✕</span></td>\n      </tr>`;
        })
        .join(""),
      k = g.length
        ? `<table><tr><th>Type</th><th>Trigger</th><th>Size</th><th></th></tr>${b}</table>`
        : '<div class="empty">No pending orders.</div>';
    tn(y.olist, k) && y.olist.querySelectorAll(".xbtn").forEach((e) => (e.onclick = () => W({ cmd: "cancel", id: e.dataset.id })));
  }
  function rn(e, t, s) {
    if (!s || !m) return Yt("no token");
    const a = parseFloat(s.priceUsd),
      o = he(s);
    if ("limit" === e) {
      const e = "mc" === en.limit.mode ? "mc" : "price",
        t = pe(en.limit.value),
        l = de(en.limit.amount);
      if (!(t > 0)) return Yt("mc" === e ? "invalid market cap" : "invalid price");
      if ("mc" === e && !o) return Yt("no market cap for this token");
      if (!(l > 0)) return Yt("invalid amount");
      if (("mc" === e ? t / o : t) >= a) return Yt("trigger must be below current " + ("mc" === e ? "market cap" : "price"));
      const i = n.settings.exitOn ? fe() : null;
      return (
        W({
          cmd: "order",
          order: Object.assign(
            {
              kind: "limit",
              mode: e,
              value: t,
              amountSol: l,
              supply: "mc" === e ? o : 0,
              mint: s.baseToken.address,
              pair: m,
              symbol: s.baseToken.symbol,
            },
            i && i.length ? { exits: i } : {},
          ),
        }),
        void (en.limit = { mode: e, value: "", amount: l })
      );
    }
    if (!(t && t.tokens > 0)) return Yt("no position");
    const l = en[e],
      i = pe(l.value),
      r = de(l.size);
    if (!(i > 0)) return Yt("invalid trigger");
    if ("mc" === l.mode && !o) return Yt("no market cap for this token");
    if ("pct" !== l.mode) {
      const t = "mc" === l.mode ? i / o : i;
      if ("tp" === e && t <= a) return Yt("take profit must be above current " + ("mc" === l.mode ? "market cap" : "price"));
      if ("sl" === e && t >= a) return Yt("stop loss must be below current " + ("mc" === l.mode ? "market cap" : "price"));
    }
    if (!(r > 0) || r > 100) return Yt("size between 1 and 100");
    W({
      cmd: "order",
      order: {
        kind: e,
        mode: l.mode,
        value: i,
        sizePct: r,
        supply: "mc" === l.mode ? o : 0,
        mint: s.baseToken.address,
        pair: m,
        symbol: s.baseToken.symbol,
      },
    });
  }
  function cn() {
    const t = n.trades.filter(p),
      s = t.length,
      o = t.filter((e) => e.pnlSol > 0).length,
      i = s - o,
      c = t.reduce((e, t) => e + t.pnlSol, 0),
      d = t.reduce((e, t) => e + t.investedSol, 0),
      h = t.reduce((e, t) => e + t.feesSol, 0),
      m = t.reduce((e, t) => (!e || t.pnlSol > e.pnlSol ? t : e), null),
      v = t.reduce((e, t) => (!e || t.pnlSol < e.pnlSol ? t : e), null),
      f = s ? t.reduce((e, t) => e + (t.closedAt - t.openedAt), 0) / s : 0,
      g = s ? (o / s) * 100 : 0,
      b = d > 0 ? (c / d) * 100 : 0;
    let k = 0;
    for (const t in n.positions) {
      const s = n.positions[t];
      if (!p(s)) continue;
      const o = a[s.pair],
        i = o ? e.marketState(o, l, r) : null;
      i && s.tokens > 0 && (k += e.exitValue(i, s.tokens, n.settings));
    }
    const w = (e) => {
        const t = new Date(e);
        return t.getFullYear() + "-" + String(t.getMonth() + 1).padStart(2, "0") + "-" + String(t.getDate()).padStart(2, "0");
      },
      x = {};
    t.forEach((e) => {
      const t = w(e.closedAt),
        s = x[t] || (x[t] = { pnl: 0, n: 0, w: 0, l: 0, inv: 0, list: [] });
      ((s.pnl += e.pnlSol),
        s.n++,
        (s.inv += e.investedSol),
        e.pnlSol > 0 ? s.w++ : s.l++,
        s.list.push({ s: e.symbol || "?", p: e.pnlSol }));
    });
    const S = [];
    dn = [];
    const C = new Date();
    C.setHours(12, 0, 0, 0);
    for (let e = 29; e >= 0; e--) {
      const t = new Date(C.getTime() - 864e5 * e),
        s = w(t.getTime()),
        n = x[s],
        a = n ? n.pnl : void 0;
      let o = "";
      if (void 0 !== a && 0 !== a) {
        const e = Math.abs(a);
        o = (a > 0 ? "g" : "r") + (e > 1 ? 3 : e > 0.25 ? 2 : 1);
      }
      (dn.push({ k: s, d: n || null, c: o }), S.push(`<i class="${o}" data-h="${dn.length - 1}">${t.getDate()}</i>`));
    }
    const L = f >= 36e5 ? (f / 36e5).toFixed(1) + "h" : f >= 6e4 ? Math.round(f / 6e4) + "m" : Math.round(f / 1e3) + "s",
      q = `\n      <div class="card">\n        <div class="lbl">Portfolio</div>\n        <div class="poshero">\n          <div class="big">${oe(u() + k, { d: 3 })}</div>\n          <div style="flex:1"></div>\n          <div class="sub ${c >= 0 ? "up" : "down"}">${s ? le(c) : "—"}</div>\n        </div>\n        <div class="grid2">\n          <div class="kv"><span>Available</span><span>${oe(u(), { d: 3 })}</span></div>\n          <div class="kv"><span>In position</span><span>${oe(k, { d: 3 })}</span></div>\n        </div>\n      </div>\n      <div class="stats">\n        <div class="stat"><div class="v ${s ? (g >= 50 ? "up" : "down") : "dim2"}">${s ? g.toFixed(0) + "%" : "—"}</div><div class="k">Win rate</div></div>\n        <div class="stat"><div class="v">${s}</div><div class="k">Trades</div></div>\n        <div class="stat"><div class="v"><span class="up">${o}</span><span class="dim2">/</span><span class="down">${i}</span></div><div class="k">Wins / Losses</div></div>\n      </div>\n      <div class="card">\n        <div class="lbl">Details</div>\n        <div class="grid2">\n          <div class="kv"><span>ROI</span><span class="${b >= 0 ? "up" : "down"}">${s ? ce(b, 1) : "—"}</span></div>\n          <div class="kv"><span>Avg hold</span><span>${s ? L : "—"}</span></div>\n          <div class="kv"><span>Best</span><span class="${m && m.pnlSol >= 0 ? "up" : "down"}">${m ? le(m.pnlSol) : "—"}</span></div>\n          <div class="kv"><span>Worst</span><span class="${v && v.pnlSol >= 0 ? "up" : "down"}">${v ? le(v.pnlSol) : "—"}</span></div>\n          <div class="kv"><span>Total fees</span><span>${oe(h, { d: 3 })}</span></div>\n          <div class="kv"><span>Open orders</span><span>${n.orders.length}</span></div>\n        </div>\n      </div>\n      <div class="card">\n        <div class="lbl" style="display:flex;align-items:center;justify-content:space-between">Last 30 days\n          <span class="heatexp" title="Export as image">Export PNG</span></div>\n        <div class="heat">${S.join("")}</div>\n      </div>`;
    y.panes.stats.__h !== q &&
      ((y.panes.stats.__h = q), (y.panes.stats.innerHTML = q), (y.panes.stats.querySelector(".heatexp").onclick = un));
  }
  let dn = [];
  function pn(e) {
    const t = e.target && e.target.closest && e.target.closest(".heat i"),
      s = y.panes.stats.closest(".scont") || y.wrap;
    let n = s.querySelector(":scope > .heatpop");
    if (!t) return void (n && (n.style.display = "none"));
    const a = dn[+t.dataset.h];
    if (!a) return;
    n || ((n = document.createElement("div")), (n.className = "heatpop"), s.appendChild(n));
    let o = `<div class="hpt">${new Date(a.k + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })}</div>`;
    if (a.d) {
      const e = a.d;
      o += `<div class="hpv ${e.pnl >= 0 ? "up" : "down"}">${le(e.pnl)}</div>\n        <div class="hpd">${e.n} trade${e.n > 1 ? "s" : ""} · <span class="up">${e.w}</span> / <span class="down">${e.l}</span> · ${oe(e.inv, { d: 2 })} invested</div>\n        <div class="hpl">${e.list
        .slice(0, 6)
        .map((e) => `<span><b>${e.s}</b><i class="${e.p >= 0 ? "up" : "down"}">${le(e.p)}</i></span>`)
        .join("")}${e.list.length > 6 ? `<span class="dim2">+${e.list.length - 6} more</span>` : ""}</div>`;
    } else o += '<div class="hpd">No trades</div>';
    ((n.innerHTML = o), (n.style.display = ""));
    const l = s.getBoundingClientRect(),
      i = t.getBoundingClientRect(),
      r = s.scrollLeft || 0,
      c = s.scrollTop || 0,
      d = n.offsetWidth || 180,
      p = n.offsetHeight || 60;
    let u = i.left - l.left + r + i.width / 2 - d / 2,
      h = i.top - l.top + c - p - 8;
    ((u = Math.max(6 + r, Math.min(r + l.width - d - 6, u))),
      h < c + 4 && (h = i.bottom - l.top + c + 8),
      (n.style.left = Math.round(u) + "px"),
      (n.style.top = Math.round(h) + "px"));
  }
  function un() {
    const e = getComputedStyle(y.wrap),
      t = e.getPropertyValue("--up").trim() || "#2BC08A",
      s = e.getPropertyValue("--down").trim() || "#EF4A5A",
      n = 104,
      a = Math.ceil(dn.length / 10),
      o = 30,
      i = 1172,
      r = 118 + 92 * a - 8 + 40,
      c = document.createElement("canvas");
    ((c.width = 2 * i), (c.height = 2 * r));
    const p = c.getContext("2d");
    p.scale(2, 2);
    const u = 'Geist, "Geist Variable", Inter, system-ui, sans-serif';
    ((p.fillStyle = "#0d0f14"),
      p.fillRect(0, 0, i, r),
      (p.fillStyle = "#e6e9ee"),
      (p.font = "700 18px " + u),
      p.fillText("Blanks · last 30 days", o, 40));
    const h = dn.reduce((e, t) => e + (t.d ? t.d.pnl : 0), 0),
      m = dn.reduce((e, t) => e + (t.d ? t.d.n : 0), 0),
      v = dn.reduce((e, t) => e + (t.d ? t.d.w : 0), 0),
      f = m - v,
      g = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      b = (e) => {
        const t = new Date(e + "T12:00:00");
        return String(t.getDate()).padStart(2, "0") + " " + g[t.getMonth()];
      };
    ((p.font = "500 12.5px " + u),
      (p.fillStyle = "#8b93a1"),
      p.fillText(
        b(dn[0].k) +
          " → " +
          b(dn[dn.length - 1].k) +
          " · " +
          m +
          (m > 1 ? " trades" : " trade") +
          (m ? " · " + v + " W / " + f + " L" : ""),
        o,
        62,
      ),
      (p.textAlign = "right"),
      (p.font = "700 20px " + u),
      (p.fillStyle = h >= 0 ? t : s),
      p.fillText(m ? le(h) : "—", 1142, 40),
      (p.font = "500 12px " + u),
      (p.fillStyle = "#8b93a1"),
      p.fillText("total PNL", 1142, 62),
      (p.textAlign = "left"));
    const k = "USD" === E() && l > 0;
    let w = "";
    (dn.forEach((e, a) => {
      const i = a % 10,
        r = Math.floor(a / 10),
        c = o + 112 * i,
        h = 88 + 92 * r,
        m = new Date(e.k + "T12:00:00"),
        v = g[m.getMonth()];
      let f = "#181c22",
        y = "#e6e9ee",
        b = "rgba(230,233,238,.62)";
      if (e.c) {
        const n = "g" === e.c[0] ? t : s;
        ((f =
          "3" === e.c[1]
            ? n
            : ((e, t) => {
                const s = e.match(/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
                return s ? `rgba(${parseInt(s[1], 16)},${parseInt(s[2], 16)},${parseInt(s[3], 16)},${t})` : e;
              })(n, "2" === e.c[1] ? 0.58 : 0.3)),
          "3" === e.c[1] && "g" === e.c[0] && ((y = "#0d0f14"), (b = "rgba(13,15,20,.7)")));
      }
      ((p.fillStyle = f),
        p.beginPath(),
        p.roundRect(c, h, n, 84, 8),
        p.fill(),
        (p.fillStyle = e.d ? b : "rgba(230,233,238,.32)"),
        (p.font = "600 11px " + u),
        p.fillText(String(m.getDate()) + (v !== w ? " " + v : ""), c + 9, h + 18),
        (w = v),
        e.d &&
          ((p.textAlign = "center"),
          (p.fillStyle = y),
          (p.font = "700 15px " + u),
          p.fillText(
            ((e) => {
              if (k) return re(e * l, !0);
              const t = Math.abs(e);
              return (e >= 0 ? "+" : "−") + (t >= 100 ? t.toFixed(0) : t >= 10 ? t.toFixed(1) : t.toFixed(2)) + " " + d();
            })(e.d.pnl),
            c + 52,
            h + 50,
          ),
          (p.fillStyle = b),
          (p.font = "500 10.5px " + u),
          p.fillText(e.d.n + (e.d.n > 1 ? " trades" : " trade") + " · " + e.d.w + "W " + e.d.l + "L", c + 52, h + 68),
          (p.textAlign = "left")));
    }),
      (p.fillStyle = "#5b6470"),
      (p.font = "500 11px " + u),
      p.fillText("PNL in " + (k ? "USD" : d()) + " · blanks · paper trading · trade-blanks.com", o, r - o + 12),
      c.toBlob((e) => {
        if (!e) return;
        const t = URL.createObjectURL(e),
          s = document.createElement("a");
        ((s.href = t),
          (s.download = "blanks-calendar-" + dn[dn.length - 1].k + ".png"),
          document.body.appendChild(s),
          s.click(),
          s.remove(),
          setTimeout(() => URL.revokeObjectURL(t), 4e3),
          Yt("calendar exported", "good"));
      }, "image/png"));
  }
  function hn(e) {
    let t = 0;
    for (const s of String(e || "")) t = (31 * t + s.charCodeAt(0)) >>> 0;
    const s = [28, 45, 200, 265, 300, 330, 180, 90];
    return "hsl(" + s[t % s.length] + " 80% 62%)";
  }
  function mn(e, t) {
    const s = (function (e) {
      const t = String(e || "").toLowerCase(),
        s = n.settings.account;
      if (s && s.pseudo && s.pseudo.toLowerCase() === t) return !1 === s.lb ? null : s.rank || null;
      const a = n.track && n.track.profiles && n.track.profiles[t];
      return (a && a.rank) || null;
    })(e);
    return s
      ? '<span class="rk' +
          (s <= 3 ? " rk" + s : "") +
          (t ? " " + t : "") +
          '" title="#' +
          s +
          ' on the public leaderboard (7 days)">#' +
          s +
          "</span>"
      : "";
  }
  function vn(e, t) {
    const s = (function (e) {
      const t = String(e || "").toLowerCase(),
        s = n.settings.account;
      return s && s.pseudo && s.pseudo.toLowerCase() === t
        ? { pseudo: s.pseudo, avatar: s.avatar || null }
        : (n.track && n.track.profiles && n.track.profiles[t]) || null;
    })(e);
    return s && s.avatar
      ? '<img class="' + (t || "tav") + '" src="' + s.avatar + '" alt="">'
      : '<span class="' + (t || "tav") + '" style="background:' + hn(e) + '">' + String(e || "?")[0].toUpperCase() + "</span>";
  }
  function fn(e) {
    const t = n.track || {},
      s = (t.byMint && t.byMint[e]) || [],
      a = new Set(s.map((e) => e.user + "|" + e.ts + "|" + e.side)),
      o = (t.feed || []).filter((t) => t.mint === e && !a.has(t.user + "|" + t.ts + "|" + t.side));
    return s
      .concat(o)
      .sort((e, t) => e.ts - t.ts)
      .slice(-200)
      .map((e) => ({
        user: e.user,
        color: hn(e.user),
        ts: e.ts,
        side: e.side,
        sol: +e.sol || 0,
        tokens: +e.tokens || 0,
        priceUsd: +e.priceUsd || 0,
        mcap: +e.mcap || 0,
        pnlSol: "number" == typeof e.pnlSol ? e.pnlSol : null,
        symbol: e.symbol || "",
      }));
  }
  function yn(e) {
    const t = Math.max(0, Math.round((Date.now() - e) / 1e3));
    return t < 60 ? t + "s" : t < 3600 ? Math.floor(t / 60) + "m" : t < 86400 ? Math.floor(t / 3600) + "h" : Math.floor(t / 86400) + "d";
  }
  function gn(e) {
    return e >= 1e9
      ? "$" + (e / 1e9).toFixed(2) + "B"
      : e >= 1e6
        ? "$" + (e / 1e6).toFixed(2) + "M"
        : e >= 1e3
          ? "$" + (e / 1e3).toFixed(1) + "K"
          : e > 0
            ? "$" + e.toFixed(0)
            : "—";
  }
  let bn = { pseudo: "", follow: "", rename: null };
  function kn() {
    return Array.isArray(n.settings.follow) ? n.settings.follow : [];
  }
  function wn() {
    const e = document.createElement("input");
    ((e.type = "file"),
      (e.accept = "image/*"),
      (e.onchange = () => {
        const t = e.files && e.files[0];
        if (!t) return;
        const s = new FileReader();
        ((s.onload = () => {
          const e = new Image();
          ((e.onload = () => {
            const t = document.createElement("canvas");
            ((t.width = 64), (t.height = 64));
            const s = t.getContext("2d"),
              n = Math.min(e.width, e.height);
            s.drawImage(e, (e.width - n) / 2, (e.height - n) / 2, n, n, 0, 0, 64, 64);
            let a = 0.86,
              o = t.toDataURL("image/jpeg", a);
            for (; o.length > 11500 && a > 0.4;) ((a -= 0.1), (o = t.toDataURL("image/jpeg", a)));
            if (o.length > 11500) return Yt("photo too complex, try another one", "bad");
            W({ cmd: "avatar", avatar: o });
          }),
            (e.onerror = () => Yt("unreadable image", "bad")),
            (e.src = s.result));
        }),
          s.readAsDataURL(t));
      }),
      e.click());
  }
  function xn() {
    const e = n.settings.account;
    return `\n      <div class="card">\n        <div class="lbl">${e ? "You" : "Your pseudo"}</div>\n        ${e ? "\n        " + (e.stale ? `\n        <div class="trme">${vn(e.pseudo, "tav tavme")}<b>${e.pseudo}</b><span class="dim2" style="margin-left:auto">key expired</span></div>\n        <div class="note" style="margin-top:8px">This pseudo was recovered with Google on another computer, so the key kept here no longer works. Sign in again to keep using it here, or remove it from this browser.</div>\n        <div class="themes" style="margin-top:8px"><div class="th tgrec">Reconnect with Google</div><div class="th tforget">Remove from this browser</div></div>` : `\n        ${null !== bn.rename ? `\n        <div class="tregrow trename">${vn(e.pseudo, "tav tavme")}<input class="tnew" maxlength="20" placeholder="New display name" value="${String(bn.rename).replace(/[^A-Za-z0-9_]/g, "")}"><button class="btn tnok">Save</button><button class="btn tncancel">Cancel</button></div>` : `\n        <div class="trme">${vn(e.pseudo, "tav tavme")}<b>${e.pseudo}</b>${mn(e.pseudo)}<span class="tedit" title="Change display name">✎</span>\n          <div class="th tshare ${e.share ? "on" : ""}" style="margin-left:auto">${e.share ? "Sharing on" : "Sharing off"}</div></div>`}\n        <div class="tgrow">${e.google ? '<span class="tgok"><i>✓</i>Linked to Google — recoverable on any computer</span>' : '<div class="th tglink"><svg viewBox="0 0 24 24" width="12" height="12"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z"/><path fill="#FBBC05" d="M6.4 14a6 6 0 0 1 0-3.9V7.5H3.1a10 10 0 0 0 0 9z"/><path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.5L6.4 10c.8-2.3 3-4 5.6-4z"/></svg>Link with Google</div>'}</div>\n        <div class="themes" style="margin-top:8px"><div class="th tlb ${!1 === e.lb ? "" : "on"}" title="Appear in the public leaderboard on trade-blanks.com">${!1 === e.lb ? "Off the leaderboard" : "On the leaderboard"}</div></div>\n        ${!1 === e.lb ? '<div class="note lbwarn" style="margin-top:6px">On the public ranking at trade-blanks.com you show up as <b>Anonymous</b>: your place is there, your name and your photo are not. Your followers still see your trades.</div>' : ""}\n        <div class="themes" style="margin-top:6px"><div class="th tphoto">${e.avatar ? "Change photo" : "Add a photo"}</div>${e.avatar ? '<div class="th tnophoto">Remove photo</div>' : ""}${e.google ? '<div class="th tgphoto">Google photo</div>' : ""}</div>\n        <div class="themes" style="margin-top:6px"><div class="th twipe">Delete my published trades</div><div class="th tquit">Remove account</div></div>\n        <details class="help"><summary>Help</summary><div class="note">${e.share ? "Every paper trade you make is published under this pseudo; people who follow you see them on their chart and in their feed." : "Nothing is published while sharing is off."} <b>✎</b> changes your display name — people who follow you keep following you, and your old name stays reserved for a while. <b>Link with Google</b> attaches the pseudo to your Google account so you can get it back on any computer with <b>Recover with Google</b>; Blanks keeps only a hashed Google id, never your name or email, and the name shown is always the one you pick here. Your <b>photo</b> is shown in place of your initial: in your followers' feed and inside your bubbles on their chart. It is shrunk to 64 px before it leaves your browser; with a Google link, your Google photo is used until you pick one. <b>On the leaderboard</b> decides whether your <i>name</i> appears in the public ranking on trade-blanks.com; turn it off and your row shows up as <b>Anonymous</b>, without a photo and without a record to open. <b>Delete my published trades</b> wipes them from the server and turns sharing off. <b>Remove account</b> deletes the pseudo, the photo and everything under it.</div></details>`) : '\n        <div class="tregrow"><input class="tpseudo" maxlength="20" placeholder="Pick a pseudo"><button class="btn treg">Register</button></div>\n        <div class="themes" style="margin-top:6px"><div class="th tgrec"><svg viewBox="0 0 24 24" width="12" height="12"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z"/><path fill="#FBBC05" d="M6.4 14a6 6 0 0 1 0-3.9V7.5H3.1a10 10 0 0 0 0 9z"/><path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.5L6.4 10c.8-2.3 3-4 5.6-4z"/></svg>Recover with Google</div></div>\n        <details class="help"><summary>Help</summary><div class="note">3 to 20 letters, digits or _. No email, no password: a secret key is created on this device and kept in your backup file. Registering turns sharing on — your paper trades become visible to people who follow you. You can turn it off any time. Already have a pseudo linked to Google? <b>Recover with Google</b> brings it back — name, photo, published trades.</div></details>'}\n      </div>`;
  }
  function Sn() {
    const e = kn();
    return `\n      <div class="card">\n        <div class="lbl">Following <span class="dim2">${e.length}</span></div>\n        <div class="set"><label>Add a trader</label><input class="tfollow" maxlength="20" placeholder="pseudo" value="${bn.follow}"></div>\n        <div class="themes tsug" style="margin-top:6px;display:none"></div>\n        <div class="tchips">${e.map((e) => '<span class="tchip" data-u="' + e + '" title="See ' + e + '’s stats">' + vn(e, "tav tavc") + e + mn(e, "rks") + '<b class="tx" data-u="' + e + '" title="Unfollow">×</b></span>').join("") || '<span class="dim2">Nobody yet.</span>'}</div>\n        <div class="themes" style="margin-top:8px"><div class="th texp">Export list</div><div class="th timp">Import list</div></div>\n        <details class="help"><summary>Help</summary><div class="note"><b>Export list</b> saves the pseudos you follow in a small file; <b>Import list</b> adds the ones from such a file (unknown pseudos are skipped). Type a pseudo and pick it from the suggestions, or press Enter. The buys and sells of the people you follow show up in the feed below and as bubbles on your chart — their photo (or their initial) ringed in teal for a buy, pink for a sell — with the same hover card as your own trades, on Terminal and on Axiom. Click a row of the feed to open that token. × unfollows.</div></details>\n      </div>`;
  }
  let Cn = 0;
  function Ln() {
    const e = y.panes.track;
    if (!e) return;
    const t = h.activeElement,
      s =
        xn() +
        Sn() +
        (function () {
          const e = n.track || { feed: [] },
            t = kn(),
            s = (e.feed || []).slice(0, 300),
            a = Math.max(1, Math.ceil(s.length / 12));
          Cn = Math.max(0, Math.min(Cn, a - 1));
          const o = s
            .slice(12 * Cn, 12 * Cn + 12)
            .map((e) => {
              const t = "buy" === e.side;
              return (
                '<tr class="trow" data-mint="' +
                e.mint +
                '" data-pair="' +
                (e.pair || "") +
                '" data-chain="' +
                (e.chain || "solana") +
                '"><td><span class="twho" data-u="' +
                e.user +
                '" title="See ' +
                e.user +
                '’s stats">' +
                vn(e.user) +
                e.user +
                mn(e.user, "rks") +
                '</span></td><td class="sym">' +
                (e.symbol || "?") +
                '</td><td><span class="tside ' +
                (t ? "up" : "down") +
                '">' +
                (t ? "Buy" : "Sell") +
                '</span></td><td class="' +
                (t ? "dim" : e.pnlSol > 0 ? "up" : e.pnlSol < 0 ? "down" : "dim") +
                '" title="' +
                (e.asset ? (+e.amt).toFixed(4) + " " + e.asset : (+e.sol).toFixed(4) + " SOL") +
                '">' +
                (e.asset && e.amt > 0 ? (+e.amt).toFixed(3) + '<i class="fasset">' + e.asset + "</i>" : (+e.sol).toFixed(3)) +
                '</td><td class="dim2">' +
                gn(+e.mcap) +
                '</td><td class="dim2">' +
                yn(e.ts) +
                "</td></tr>"
              );
            })
            .join("");
          return `\n      <div class="card">\n        <div class="lbl">Feed <span class="dim2">${s.length ? s.length + " trade" + (s.length > 1 ? "s" : "") : ""}</span></div>\n        ${s.length ? `<table class="tfeed"><tr><th>Who</th><th>Token</th><th></th><th>SOL</th><th>MC</th><th></th></tr>${o}</table>\n        ${a > 1 ? `<div class="pager">\n          <button class="fprev" ${0 === Cn ? "disabled" : ""}>‹</button>\n          <span class="dim2" style="font-size:10.5px">${Cn + 1} / ${a}</span>\n          <button class="fnext" ${Cn >= a - 1 ? "disabled" : ""}>›</button>\n        </div>` : ""}` : '<div class="empty">' + (t.length ? "No trades from the people you follow yet." : "Follow someone to see their trades here.") + "</div>"}\n      </div>`;
        })();
    if (e.dataset.h === s) return;
    e.dataset.h = s;
    const a = Array.from(e.querySelectorAll("details.help")).map((e) => e.open);
    ((e.innerHTML = s),
      e.querySelectorAll("details.help").forEach((e, t) => {
        a[t] && (e.open = !0);
      }),
      Pn(e, t));
  }
  function qn() {
    const e = y.smodal && y.smodal.querySelector(".tsetwrap");
    if (!e) return;
    const t = h.activeElement,
      s = xn() + Sn();
    if (e.dataset.h !== s) {
      const n = Array.from(e.querySelectorAll("details.help")).map((e) => e.open);
      ((e.dataset.h = s),
        (e.innerHTML = s),
        e.querySelectorAll("details.help").forEach((e, t) => {
          n[t] && (e.open = !0);
        }),
        Pn(e, t));
    }
  }
  let Mn = { period: "7d", cache: {}, loading: !1, err: null, ts: 0 };
  const En = [
    ["1d", "24h"],
    ["7d", "7 days"],
    ["30d", "30 days"],
    ["all", "All time"],
  ];
  function An(e) {
    const t = Mn.period;
    (!e && Mn.cache[t] && Date.now() - Mn.ts < 6e4) || ((Mn.loading = !0), (Mn.err = null), W({ cmd: "top", period: t }));
  }
  function $n(e) {
    return (e > 0 ? "+" : e < 0 ? "−" : "") + Math.abs(+e || 0).toFixed(2);
  }
  function Tn() {
    const e = n.settings.account,
      t = Mn.cache[Mn.period],
      s = ((e && e.pseudo) || "").toLowerCase(),
      a =
        '<div class="themes lbpers">' +
        En.map(([e, t]) => '<div class="th lbper' + (e === Mn.period ? " on" : "") + '" data-p="' + e + '">' + t + "</div>").join("") +
        '<a class="th lbopen" href="https://trade-blanks.com/leaderboard" target="_blank" rel="noopener">Open on the site ↗</a></div>';
    let o,
      l = "";
    if (e) {
      const n = !1 === e.lb,
        a =
          t &&
          ((t.rows || []).find((e) => e.pseudo && e.pseudo.toLowerCase() === s) ||
            (n && e.rank ? (t.rows || []).find((t) => t.anon && t.rank === e.rank) : null)),
        o = e.rank || (a && a.rank) || null;
      l =
        '<div class="lbmine' +
        (n ? " lbout" : "") +
        '">' +
        vn(e.pseudo, "tav tavme") +
        '<div class="lbmw"><b>' +
        e.pseudo +
        '</b><span class="' +
        (n ? "lbwarn" : "dim2") +
        '">' +
        (n
          ? "you show up as Anonymous" + (o ? " · #" + o : "") + " — your name is hidden, your row counts"
          : o
            ? "#" + o + (e.ranked ? " of " + e.ranked + " traders" : "") + " · last 7 days"
            : "not ranked yet — close a trade to appear") +
        "</span></div>" +
        (a
          ? '<div class="lbmk"><span class="dim2">PNL</span><b class="' +
            (a.pnl >= 0 ? "up" : "down") +
            '">' +
            $n(a.pnl) +
            '</b></div><div class="lbmk"><span class="dim2">Win rate</span><b>' +
            (a.winRate || 0).toFixed(0) +
            "%</b></div>"
          : "") +
        '<div class="th lbtgl ' +
        (n ? "" : "on") +
        '" title="Appear in the public leaderboard on trade-blanks.com">' +
        (n ? "Off the leaderboard" : "On the leaderboard") +
        "</div></div>";
    } else l = '<div class="lbmine lbnone">Pick a pseudo in <b>Tracking</b> to take part in the ranking.</div>';
    return (
      (o = Mn.err
        ? '<div class="empty">Could not load the ranking: ' + Mn.err + ' <span class="th lbretry">Try again</span></div>'
        : t
          ? (t.rows || []).length
            ? '<div class="lbtot dim2">' +
              t.traders +
              " trader" +
              (t.traders > 1 ? "s" : "") +
              " · " +
              t.trades +
              " paper trades · " +
              (t.volume || 0).toFixed(1) +
              ' SOL of volume</div><table class="lbtable"><tr><th></th><th>Trader</th><th>Trades</th><th>Win</th><th>PNL</th><th>ROI</th></tr>' +
              (t.rows || [])
                .map((e) =>
                  (function (e, t) {
                    const s = e.rank || 0,
                      n = e.anon || !e.pseudo,
                      a = n ? "Anonymous" : e.pseudo,
                      o = !e.closed,
                      l = n
                        ? '<span class="twho lbanon"><span class="tav tavs lbqm">?</span>' + a + "</span>"
                        : '<span class="twho" data-u="' +
                          e.pseudo +
                          '">' +
                          (e.avatar
                            ? '<img class="tav tavs" src="' + e.avatar + '" alt="">'
                            : '<span class="tav tavs" style="background:' + hn(e.pseudo) + '">' + e.pseudo[0].toUpperCase() + "</span>") +
                          e.pseudo +
                          (t ? '<i class="lbyou">you</i>' : "") +
                          "</span>";
                    return (
                      '<tr class="lbrow' +
                      (t ? " lbme" : "") +
                      (o ? " lbidle" : "") +
                      '"' +
                      (n ? "" : ' data-u="' + e.pseudo + '"') +
                      '><td class="lbpos"><span class="rk' +
                      (!o && s <= 3 ? " rk" + s : "") +
                      '">#' +
                      s +
                      '</span></td><td class="lbwho">' +
                      l +
                      '</td><td class="dim2">' +
                      e.trades +
                      "</td>" +
                      (o
                        ? '<td class="dim2">—</td><td class="dim2">—</td><td class="dim2">—</td></tr>'
                        : '<td class="dim2">' +
                          (e.winRate || 0).toFixed(0) +
                          '%</td><td class="' +
                          (e.pnl > 0 ? "up" : e.pnl < 0 ? "down" : "dim2") +
                          '">' +
                          $n(e.pnl) +
                          '</td><td class="' +
                          (e.roi > 0 ? "up" : e.roi < 0 ? "down" : "dim2") +
                          '">' +
                          (e.roi > 0 ? "+" : "") +
                          (e.roi || 0).toFixed(1) +
                          "%</td></tr>")
                    );
                  })(e, !!e.pseudo && e.pseudo.toLowerCase() === s),
                )
                .join("") +
              "</table>"
            : '<div class="empty">Nobody has picked a pseudo yet.</div>'
          : '<div class="empty">Loading the ranking…</div>'),
      a + l + o
    );
  }
  function Bn(e) {
    const t = y.smodal && y.smodal.querySelector(".lbwrap");
    if (!t) return;
    const s = Tn();
    if (!e && t.dataset.h === s) return;
    ((t.dataset.h = s),
      (t.innerHTML = s),
      t.querySelectorAll(".lbper").forEach(
        (e) =>
          (e.onclick = () => {
            ((Mn.period = e.dataset.p), Bn(!0), An());
          }),
      ));
    const a = t.querySelector(".lbretry");
    a &&
      (a.onclick = () => {
        (An(!0), Bn(!0));
      });
    const o = t.querySelector(".lbtgl");
    (o && (o.onclick = () => W({ cmd: "lb", value: !(n.settings.account && !1 !== n.settings.account.lb) })),
      t.querySelectorAll(".lbrow").forEach((e) => (e.onclick = () => Nn(e.dataset.u))));
  }
  function Pn(e, t) {
    const s = n.settings.account,
      a = e.querySelector(".treg"),
      o = e.querySelector(".tpseudo");
    a &&
      ((o.value = bn.pseudo),
      o.addEventListener("keydown", (e) => {
        (e.stopPropagation(), "Enter" === e.key && a.click());
      }),
      o.addEventListener("input", () => {
        bn.pseudo = o.value;
      }),
      (a.onclick = () => {
        const e = o.value.trim();
        if (!/^[A-Za-z0-9_]{3,20}$/.test(e)) return Yt("3 to 20 letters, digits or _", "bad");
        (W({ cmd: "register", pseudo: e }), (bn.pseudo = ""));
      }));
    const l = e.querySelector(".tshare");
    l && (l.onclick = () => W({ cmd: "share", value: !(n.settings.account && n.settings.account.share) }));
    const i = e.querySelector(".tlb");
    i && (i.onclick = () => W({ cmd: "lb", value: !(n.settings.account && !1 !== n.settings.account.lb) }));
    const r = e.querySelector(".twipe");
    r && (r.onclick = () => W({ cmd: "share", value: !1, wipe: !0 }));
    const c = e.querySelector(".tphoto");
    c && (c.onclick = wn);
    const d = e.querySelector(".tnophoto");
    d && (d.onclick = () => W({ cmd: "avatar", avatar: null }));
    const p = e.querySelector(".tgphoto");
    p &&
      (p.onclick = () => {
        (Yt("opening Google…"), W({ cmd: "gphoto" }));
      });
    const u = e.querySelector(".tglink");
    (u &&
      (u.onclick = () => {
        (Yt("opening Google…"), W({ cmd: "glink" }));
      }),
      e.querySelectorAll(".tgrec").forEach(
        (e) =>
          (e.onclick = () => {
            (Yt("opening Google…"), W({ cmd: "grecover" }));
          }),
      ));
    const h = e.querySelector(".tforget");
    h && (h.onclick = () => W({ cmd: "forget" }));
    const m = e.querySelector(".tedit");
    m &&
      (m.onclick = () => {
        ((bn.rename = s ? s.pseudo : ""), Ln());
        const t = e.querySelector(".tnew");
        t && (t.focus(), t.select());
      });
    const v = e.querySelector(".tnew");
    if (v) {
      const s = () => {
        const e = v.value.trim();
        if (!/^[A-Za-z0-9_]{3,20}$/.test(e)) return Yt("3 to 20 letters, digits or _", "bad");
        ((bn.rename = null), W({ cmd: "rename", pseudo: e }));
      };
      (v.addEventListener("keydown", (e) => {
        (e.stopPropagation(), "Enter" === e.key && s(), "Escape" === e.key && ((bn.rename = null), Ln()));
      }),
        v.addEventListener("input", () => {
          bn.rename = v.value;
        }),
        (e.querySelector(".tnok").onclick = s),
        (e.querySelector(".tncancel").onclick = () => {
          ((bn.rename = null), Ln());
        }),
        t && t.classList && t.classList.contains("tnew") && (v.focus(), v.setSelectionRange(v.value.length, v.value.length)));
    }
    const f = e.querySelector(".tquit");
    if (f) {
      let e = 0;
      f.onclick = () => {
        Date.now() - e < 3e3
          ? W({ cmd: "unregister" })
          : ((e = Date.now()),
            (f.textContent = "Click again to confirm"),
            setTimeout(() => {
              f.textContent = "Remove account";
            }, 3e3));
      };
    }
    const y = e.querySelector(".tfollow");
    let g = null;
    (y.addEventListener("keydown", (e) => {
      if ((e.stopPropagation(), "Enter" === e.key)) {
        const e = y.value.trim();
        e && (W({ cmd: "follow", pseudo: e }), (bn.follow = ""), (y.value = ""));
      }
    }),
      y.addEventListener("input", () => {
        if (((bn.follow = y.value.trim()), clearTimeout(g), bn.follow.length >= 2))
          g = setTimeout(() => W({ cmd: "search", q: bn.follow }), 250);
        else {
          const t = e.querySelector(".tsug");
          t && (t.style.display = "none");
        }
      }),
      t && t.classList && t.classList.contains("tfollow") && (y.focus(), y.setSelectionRange(y.value.length, y.value.length)),
      e.querySelectorAll(".tx").forEach((e) => (e.onclick = () => W({ cmd: "unfollow", pseudo: e.dataset.u }))));
    const b = e.querySelector(".texp");
    b && (b.onclick = Hn);
    const k = e.querySelector(".timp");
    (k && (k.onclick = Fn),
      e.querySelectorAll(".trow").forEach(
        (e) =>
          (e.onclick = () => {
            const t = X(e.dataset.mint, e.dataset.pair || null, e.dataset.chain || "solana");
            t && location.assign(t);
          }),
      ),
      e.querySelectorAll(".twho").forEach(
        (e) =>
          (e.onclick = (t) => {
            (t.stopPropagation(), Nn(e.dataset.u));
          }),
      ),
      e.querySelectorAll(".tchip").forEach(
        (e) =>
          (e.onclick = (t) => {
            t.target.classList.contains("tx") || Nn(e.dataset.u);
          }),
      ));
    const w = e.querySelector(".fprev"),
      x = e.querySelector(".fnext");
    (w &&
      (w.onclick = () => {
        (Cn--, Ln());
      }),
      x &&
        (x.onclick = () => {
          (Cn++, Ln());
        }));
  }
  function Hn() {
    const e = kn();
    if (!e.length) return Yt("you follow nobody yet", "bad");
    const t = new Blob([JSON.stringify({ blanks: "tracker", v: 1, exported: new Date().toISOString(), follow: e }, null, 2)], {
        type: "application/json",
      }),
      s = URL.createObjectURL(t),
      n = document.createElement("a");
    ((n.href = s),
      (n.download = "blanks-tracker.json"),
      document.body.appendChild(n),
      n.click(),
      n.remove(),
      setTimeout(() => URL.revokeObjectURL(s), 4e3),
      Yt(e.length + " trader" + (e.length > 1 ? "s" : "") + " exported", "good"));
  }
  function Fn() {
    const e = document.createElement("input");
    ((e.type = "file"),
      (e.accept = ".json,.txt,application/json,text/plain"),
      (e.onchange = () => {
        const t = e.files && e.files[0];
        if (!t) return;
        const s = new FileReader();
        ((s.onload = () => {
          let e = [];
          try {
            const t = JSON.parse(s.result);
            ((e = Array.isArray(t) ? t : Array.isArray(t.follow) ? t.follow : Array.isArray(t.users) ? t.users : []),
              (e = e.map((e) => ("string" == typeof e ? e : (e && e.pseudo) || ""))));
          } catch (t) {
            e = String(s.result || "").split(/[\s,;]+/);
          }
          if (
            ((e = e
              .map((e) =>
                String(e || "")
                  .trim()
                  .replace(/^@/, ""),
              )
              .filter((e) => /^[A-Za-z0-9_]{3,20}$/.test(e))),
            !e.length)
          )
            return Yt("no pseudo found in that file", "bad");
          (Yt("importing " + e.length + "…"), W({ cmd: "followMany", pseudos: e.slice(0, 60) }));
        }),
          s.readAsText(t));
      }),
      e.click());
  }
  const _n = [
    { id: "hist", t: "Trades History" },
    { id: "prof", t: "Most Profitable" },
    { id: "pos", t: "Active Positions" },
    { id: "xfer", t: "Transfers" },
    { id: "dev", t: "Dev Tokens" },
  ];
  let On = null,
    Vn = "hist";
  function Nn(e) {
    const t = String(e || "").trim();
    /^[A-Za-z0-9_]{2,20}$/.test(t) &&
      (!(function () {
        if (y.umodal) return;
        const e = document.createElement("div");
        ((e.className = "umodal"),
          (e.innerHTML = '<div class="ubox"></div>'),
          h.appendChild(e),
          (y.umodal = e),
          e.addEventListener("click", (t) => {
            t.target === e && zn();
          }),
          e.addEventListener("keydown", (e) => {
            (e.stopPropagation(), "Escape" === e.key && zn());
          }));
      })(),
      (On = { pseudo: t, tab: Vn, data: null, err: null, loading: !0 }),
      y.umodal.classList.remove("out"),
      y.umodal.classList.add("on"),
      (y.umodal.dataset.theme = (n && n.settings.theme) || "padre"),
      In(),
      y.umodal.setAttribute("tabindex", "-1"),
      y.umodal.focus(),
      W({ cmd: "ustats", pseudo: t }));
  }
  function zn() {
    const e = y.umodal;
    e &&
      e.classList.contains("on") &&
      (e.classList.add("out"), e.classList.remove("on"), setTimeout(() => e.classList.remove("out"), 220), (On = null));
  }
  const Dn = [
    ["1d", 864e5],
    ["7d", 6048e5],
    ["30d", 2592e6],
    ["all", 0],
  ];
  let Rn = "all";
  function Un(e, t, s) {
    return (
      "<thead><tr>" +
      e.map((e) => '<th class="' + (e.r ? "r" : "") + '">' + e.t + "</th>").join("") +
      "</tr></thead>" +
      "<tbody>" +
      (t.length
        ? t
            .map(
              (t) =>
                '<tr class="urow"' +
                (t.mint ? ' data-mint="' + t.mint + '" data-pair="' + (t.pair || "") + '"' : "") +
                ">" +
                t.c.map((t, s) => '<td class="' + (e[s].r ? "r " : "") + (e[s].k || "") + '">' + t + "</td>").join("") +
                "</tr>",
            )
            .join("")
        : '<tr><td colspan="' + e.length + '" class="uempty">' + (s || "Nothing here yet.") + "</td></tr>") +
      "</tbody>"
    );
  }
  const jn = (e, t) => '<span class="usym">' + e + "</span>" + (t ? '<span class="usub2">' + t + "</span>" : ""),
    Zn = (e) => '<span class="' + (e >= 0 ? "up" : "down") + '">' + (e >= 0 ? "+" : "−") + oe(Math.abs(e), { d: 3 }) + "</span>";
  function In() {
    if (!On || !y.umodal) return;
    const e = y.umodal.querySelector(".ubox"),
      t = On.data,
      s = ((n.settings.account && n.settings.account.pseudo) || "").toLowerCase(),
      a = On.pseudo.toLowerCase() === s,
      o = kn().some((e) => e.toLowerCase() === On.pseudo.toLowerCase()),
      i =
        '<div class="uhd">' +
        (t && t.avatar
          ? '<img class="tav uav" src="' + t.avatar + '" alt="">'
          : '<span class="tav uav" style="background:' + hn(On.pseudo) + '">' + On.pseudo[0].toUpperCase() + "</span>") +
        '<div class="uwho"><b>' +
        On.pseudo +
        (t && t.rank
          ? '<span class="rk' +
            (t.rank <= 3 ? " rk" + t.rank : "") +
            '" title="#' +
            t.rank +
            " of " +
            (t.ranked || 0) +
            ' on the public leaderboard (7 days)">#' +
            t.rank +
            "</span>"
          : mn(On.pseudo)) +
        '</b><span class="dim2">' +
        (t
          ? t.n +
            " paper trade" +
            (t.n > 1 ? "s" : "") +
            (t.since
              ? " · since " + new Date(1e3 * t.since).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })
              : "")
          : "paper trader") +
        '</span></div><div class="uacts">' +
        (a
          ? '<span class="uself">That’s you</span>'
          : '<div class="ubtn ufol ' + (o ? "on" : "") + '">' + (o ? "Following" : "Follow") + "</div>") +
        '<div class="ux" title="Close">' +
        At +
        "</div></div></div>";
    if (!t)
      return (
        (e.innerHTML =
          i +
          '<div class="uload">' +
          (On.err ? "Could not load this trader: " + On.err : '<span class="uspin"></span>Loading…') +
          "</div>"),
        void Gn()
      );
    const r = t.wins || 0,
      c = t.losses || 0,
      d = r + c,
      p = d ? (r / d) * 100 : 0,
      u = Array.isArray(t.tokens) ? t.tokens : [],
      h = u.filter((e) => (+e.net || 0) > 1e-9),
      m = h.reduce((e, t) => e + Math.max(0, (+t.bought || 0) - (+t.sold || 0)), 0),
      v = (function (e, t) {
        const s = (Dn.find((e) => e[0] === t) || Dn[3])[1],
          n = Date.now(),
          a = s ? n - s : 0;
        let o = 0;
        const l = (e || []).map(([e, t]) => ((o += +t || 0), [e < 1e12 ? 1e3 * e : e, o])),
          i = l.filter((e) => e[0] < a),
          r = l.filter((e) => e[0] >= a),
          c = i.length ? i[i.length - 1][1] : 0,
          d = [[a || (r[0] ? r[0][0] : n), 0]].concat(r.map((e) => [e[0], e[1] - c]));
        r.length && d.push([n, d[d.length - 1][1]]);
        const p = d[d.length - 1][1];
        if (d.length < 3) return { empty: !0, tot: p };
        let u = 0,
          h = 0;
        d.forEach((e) => {
          (e[1] > u && (u = e[1]), e[1] < h && (h = e[1]));
        });
        const m = d[0][0],
          v = d[d.length - 1][0],
          f = Math.max(1, v - m),
          y = Math.max(1e-9, u - h),
          g = (e) => 4 + (292 * (e - m)) / f,
          b = (e) => 4 + 88 * (1 - (e - h) / y);
        let k = "M" + g(d[0][0]).toFixed(1) + " " + b(d[0][1]).toFixed(1);
        for (let e = 1; e < d.length; e++) k += "H" + g(d[e][0]).toFixed(1) + "V" + b(d[e][1]).toFixed(1);
        const w = b(0).toFixed(1);
        return { d: k, area: k + "V" + w + "H" + g(m).toFixed(1) + "Z", zy: w, W: 300, H: 96, mx: u, mn: h, tot: p, up: p >= 0 };
      })(t.curve, Rn),
      f = u.reduce((e, t) => e + (+t.buys || 0), 0),
      g = u.reduce((e, t) => e + (+t.sells || 0), 0),
      b = [
        [">500%", (e) => e > 500, "b5"],
        ["200% – 500%", (e) => e > 200 && e <= 500, "b4"],
        ["0% – 200%", (e) => e >= 0 && e <= 200, "b3"],
        ["0% – −50%", (e) => e < 0 && e >= -50, "b2"],
        ["< −50%", (e) => e < -50, "b1"],
      ],
      k = u.filter((e) => (+e.sells || 0) > 0 && (+e.bought || 0) > 0).map((e) => ((+e.pnl || 0) / +e.bought) * 100),
      w = b.map((e) => k.filter(e[1]).length),
      x =
        '<div class="udist">' +
        (k.length
          ? b.map((e, t) => (w[t] ? '<i class="' + e[2] + '" style="flex:' + w[t] + '"></i>' : "")).join("")
          : '<i class="b0" style="flex:1"></i>') +
        "</div>" +
        b
          .map((e, t) => '<div class="urow2 ub"><span><i class="udot2 ' + e[2] + '"></i>' + e[0] + "</span><b>" + w[t] + "</b></div>")
          .join(""),
      S =
        '<div class="ugrid"><div class="ucard"><div class="uct">Balance</div><div class="ubig">' +
        oe(m, { d: 2 }) +
        '</div><div class="usub">in ' +
        h.length +
        " open position" +
        (1 === h.length ? "" : "s") +
        (l > 0 && "USD" !== E() ? " · " + ae(m * l) : "") +
        '</div><div class="urow2"><span>Bought</span><b>' +
        oe(t.bought, { d: 2 }) +
        '</b></div><div class="urow2"><span>Sold</span><b>' +
        oe(t.sold, { d: 2 }) +
        '</b></div><div class="urow2"><span>TXNS</span><b>' +
        t.n +
        ' <i class="up">' +
        f +
        '</i><i class="dim2">/</i><i class="down">' +
        g +
        '</i></b></div><div class="urow2"><span>Coins traded</span><b>' +
        (t.coins || 0) +
        '</b></div><div class="urow2"><span>First trade</span><b>' +
        (((C = t.first) ? new Date(C < 1e12 ? 1e3 * C : C).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—") +
          '</b></div></div><div class="ucard ucurvec"><div class="uct uctr"><span>Realized PNL</span><span class="urng">') +
        Dn.map((e) => '<b data-r="' + e[0] + '" class="' + (e[0] === Rn ? "on" : "") + '">' + e[0].toUpperCase() + "</b>").join("") +
        '</span></div><div class="ubig ' +
        (v.tot >= 0 ? "up" : "down") +
        '">' +
        (v.tot >= 0 ? "+" : "−") +
        oe(Math.abs(v.tot || 0), { d: 2 }) +
        "</div>" +
        (v.empty
          ? '<div class="uempty2">No closed trade in this period.</div>'
          : '<svg class="ucurve ' +
            (v.up ? "up" : "down") +
            '" viewBox="0 0 ' +
            v.W +
            " " +
            v.H +
            '" preserveAspectRatio="none"><line class="uz" x1="0" x2="' +
            v.W +
            '" y1="' +
            v.zy +
            '" y2="' +
            v.zy +
            '"/><path class="ua" d="' +
            v.area +
            '"/><path class="ul" d="' +
            v.d +
            '"/></svg><div class="uminmax"><span>min ' +
            oe(v.mn, { d: 2 }) +
            "</span><span>max " +
            oe(v.mx, { d: 2 }) +
            "</span></div>") +
        '</div><div class="ucard"><div class="uct">Performance</div><div class="urow2"><span>Realized PNL</span><b class="' +
        (t.pnl >= 0 ? "up" : "down") +
        '">' +
        (d ? le(t.pnl) : "—") +
        '</b></div><div class="urow2"><span>Win rate</span><b class="' +
        (p >= 50 ? "up" : "down") +
        '">' +
        (d ? p.toFixed(0) + "%" : "—") +
        ' <i class="dim2">' +
        r +
        "W / " +
        c +
        "L</i></b></div>" +
        x +
        "</div></div>";
    var C;
    const L =
      '<div class="utabs">' +
      _n
        .map(
          (e) =>
            '<span class="ut ' +
            (e.id === On.tab ? "on" : "") +
            '" data-u="' +
            e.id +
            '">' +
            e.t +
            ("pos" === e.id && h.length ? "<i>" + h.length + "</i>" : "") +
            "</span>",
        )
        .join("") +
      "</div>";
    let q = "";
    if ("hist" === On.tab)
      q = Un(
        [{ t: "Type" }, { t: "Token" }, { t: "Amount", r: 1 }, { t: "Market cap", r: 1 }, { t: "Age", r: 1, k: "dim2" }],
        (t.history || []).map((e) => ({
          mint: e.mint,
          pair: e.pair,
          c: [
            '<span class="utype ' + ("buy" === e.side ? "up" : "down") + '">' + ("buy" === e.side ? "Buy" : "Sell") + "</span>",
            jn(e.symbol || "?"),
            "buy" === e.side
              ? '<span class="down">−' + oe(Math.abs(+e.sol || 0), { d: 3 }) + "</span>"
              : '<span class="up">+' + oe(Math.abs(+e.sol || 0), { d: 3 }) + "</span>",
            gn(+e.mcap),
            yn(e.ts),
          ],
        })),
      );
    else if ("prof" === On.tab) {
      q = Un(
        [
          { t: "Token" },
          { t: "Bought", r: 1 },
          { t: "Sold", r: 1 },
          { t: "PNL", r: 1 },
          { t: "ROI", r: 1 },
          { t: "Last", r: 1, k: "dim2" },
        ],
        u
          .filter((e) => (+e.sells || 0) > 0)
          .sort((e, t) => (+t.pnl || 0) - (+e.pnl || 0))
          .map((e) => {
            const t = (+e.bought || 0) > 0 ? ((+e.pnl || 0) / +e.bought) * 100 : 0;
            return {
              mint: e.mint,
              pair: e.pair,
              c: [
                jn(e.symbol || "?", e.n + " txn" + (e.n > 1 ? "s" : "")),
                oe(+e.bought || 0, { d: 3 }),
                oe(+e.sold || 0, { d: 3 }),
                Zn(+e.pnl || 0),
                '<span class="' + (t >= 0 ? "up" : "down") + '">' + ce(t, 0) + "</span>",
                yn(e.last),
              ],
            };
          }),
      );
    } else
      q =
        "pos" === On.tab
          ? Un(
              [{ t: "Token" }, { t: "Holding", r: 1 }, { t: "Invested", r: 1 }, { t: "Market cap", r: 1 }, { t: "Last", r: 1, k: "dim2" }],
              h
                .sort((e, t) => t.last - e.last)
                .map((e) => ({
                  mint: e.mint,
                  pair: e.pair,
                  c: [
                    jn(e.symbol || "?", e.n + " txn" + (e.n > 1 ? "s" : "")),
                    ie(+e.net),
                    oe(Math.max(0, (+e.bought || 0) - (+e.sold || 0)), { d: 3 }),
                    gn(+e.mcap),
                    yn(e.last),
                  ],
                })),
              "No open position.",
            )
          : "xfer" === On.tab
            ? Un([{ t: "" }], [], "No transfers — Blanks never moves real funds. Every balance here is simulated.")
            : Un([{ t: "" }], [], "No dev tokens — paper traders don’t deploy anything on-chain.");
    const M = e.querySelector(".ubody"),
      A = M ? M.scrollTop : 0;
    ((e.innerHTML = i + S + L + '<div class="ubody"><table class="utable">' + q + "</table></div>"),
      A && (e.querySelector(".ubody").scrollTop = A),
      Gn());
  }
  function Gn() {
    const e = y.umodal.querySelector(".ubox"),
      t = e.querySelector(".ux");
    t && (t.onclick = zn);
    const s = e.querySelector(".ufol");
    (s &&
      (s.onclick = () => {
        const e = s.classList.contains("on");
        (W({ cmd: e ? "unfollow" : "follow", pseudo: On.pseudo }),
          s.classList.toggle("on", !e),
          (s.textContent = e ? "Follow" : "Following"));
      }),
      e.querySelectorAll(".ut").forEach(
        (t) =>
          (t.onclick = () => {
            On.tab = Vn = t.dataset.u;
            const s = e.querySelector(".ubody");
            (s && (s.scrollTop = 0), In());
          }),
      ),
      e.querySelectorAll(".urng b").forEach(
        (e) =>
          (e.onclick = () => {
            ((Rn = e.dataset.r), In());
          }),
      ),
      e.querySelectorAll(".urow[data-mint]").forEach(
        (e) =>
          (e.onclick = () => {
            const t = X(e.dataset.mint, e.dataset.pair || null);
            t && location.assign(t);
          }),
      ));
  }
  let Wn = 0;
  function Kn() {
    const e = n.trades.filter(p),
      t = Math.max(1, Math.ceil(e.length / 8));
    Wn = Math.min(Wn, t - 1);
    const s = e
        .slice(8 * Wn, 8 * Wn + 8)
        .map(
          (t) =>
            `\n      <tr>\n        <td class="sym">${t.symbol || "?"}</td>\n        <td class="dim">${oe(t.investedSol, { d: 3 })}</td>\n        <td class="${t.pnlSol >= 0 ? "up" : "down"}">${le(t.pnlSol)}</td>\n        <td class="${t.pnlSol >= 0 ? "up" : "down"}">${ce(t.pnlPct, 0)}</td>\n        <td class="dim2">${new Date(t.closedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}</td>\n        <td class="shcell"><span class="kc" data-i="${e.indexOf(t)}" title="Killcam">▶</span><span class="sh" data-i="${e.indexOf(t)}" title="PNL card">▣</span></td>\n      </tr>`,
        )
        .join(""),
      a = `\n      <div class="card">\n        <div class="lbl">History <span class="dim2">${e.length} trade${e.length > 1 ? "s" : ""}</span></div>\n        ${e.length ? `<table><tr><th>Token</th><th>Invested</th><th>PNL</th><th>%</th><th>Date</th><th></th></tr>${s}</table>\n        <div class="pager">\n          <button class="prev" ${0 === Wn ? "disabled" : ""}>‹</button>\n          <span class="dim2" style="font-size:10.5px">${Wn + 1} / ${t}</span>\n          <button class="next" ${Wn >= t - 1 ? "disabled" : ""}>›</button>\n        </div>` : '<div class="empty">No closed trades yet.</div>'}\n      </div>\n      <button class="btn ghost csv">Export CSV</button>`;
    if (y.panes.log.__h === a) return;
    ((y.panes.log.__h = a), (y.panes.log.innerHTML = a));
    const o = y.panes.log.querySelector(".prev"),
      l = y.panes.log.querySelector(".next");
    (o &&
      (o.onclick = () => {
        (Wn--, Kn());
      }),
      l &&
        (l.onclick = () => {
          (Wn++, Kn());
        }),
      y.panes.log.querySelectorAll(".sh").forEach((e) => {
        e.onclick = () => Qn(n.trades[+e.dataset.i]);
      }),
      y.panes.log.querySelectorAll(".kc").forEach((e) => {
        e.onclick = () => Yn(n.trades[+e.dataset.i]);
      }),
      (y.panes.log.querySelector(".csv").onclick = ta));
  }
  function Yn(e) {
    const t = window.__BLANKS_KILLCAM;
    if (!t || !e) return Yt("killcam unavailable", "bad");
    const s = n.settings.account,
      a = n.settings;
    t.open(
      Object.assign(Xn(e), {
        pseudo: s ? s.pseudo : "",
        speed: void 0 === a.killcamSpeed ? 1 : a.killcamSpeed,
        bg: a.kcBg || null,
        dim: void 0 === a.kcDim ? 0.62 : a.kcDim,
        blur: a.kcBlur || 0,
        gblur: void 0 === a.kcGlassBlur ? 14 : a.kcGlassBlur,
        gtint: void 0 === a.kcGlassTint ? 0.55 : a.kcGlassTint,
        onSettings: (e) => {
          const t = { speed: "killcamSpeed", bg: "kcBg", dim: "kcDim", blur: "kcBlur", gblur: "kcGlassBlur", gtint: "kcGlassTint" },
            s = {};
          for (const n in e) t[n] && (s[t[n]] = e[n]);
          (Object.assign(n.settings, s), W({ cmd: "settings", settings: s }));
        },
        sound: !1 !== n.settings.sound,
        vol: void 0 === n.settings.soundVol ? 0.35 : n.settings.soundVol,
        sndBuy: n.settings.sndBuy || null,
        sndSell: n.settings.sndSell || null,
      }),
    );
  }
  function Jn() {
    const e = Date.now();
    return {
      mint: "sample",
      symbol: "BLANKS",
      pair: null,
      openedAt: e - 282e4,
      closedAt: e,
      investedSol: 0.5,
      returnedSol: 0.71,
      pnlSol: 0.21,
      pnlPct: 42,
      feesSol: 0.012,
      buys: 1,
      sells: 1,
      _sample: !0,
    };
  }
  /* Un chemin de prix credible pour l'exemple : un creux apres l'achat, une montee,
     un sommet, puis la vente a +42 %. Toujours le meme (pseudo-hasard fixe). */
  function sampleTicks(e) {
    const sl = l || 150,
      p0 = 5e-5 * sl,
      p1 = 71e-6 * sl,
      t0 = e.openedAt,
      t1 = e.closedAt,
      pad = 0.08 * (t1 - t0),
      out = [];
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) - 0.5;
    const shape = (f) => (f < 0 ? 0 : f < 0.2 ? -0.14 * Math.sin((f / 0.2) * Math.PI * 0.5) : f < 0.75 ? -0.14 + 0.74 * ((f - 0.2) / 0.55) : 0.6 - 0.18 * ((f - 0.75) / 0.25));
    for (let i = 0; i <= 160; i++) {
      const ts = t0 - pad + ((t1 - t0 + 2 * pad) * i) / 160,
        f = (ts - t0) / (t1 - t0),
        base = f >= 1 ? p1 * (1 - 0.04 * Math.min(1, (f - 1) * 12)) : p0 * (1 + shape(f));
      out.push([ts, base * (1 + rnd() * 0.035)]);
    }
    return out;
  }
  function Xn(e) {
    const t = e._sample
      ? [
          { ts: e.openedAt, side: "buy", sol: 0.5, tokens: 1e4, midUsd: 5e-5 * (l || 150), priceUsd: 5e-5 * (l || 150), supply: 1e9 },
          { ts: e.closedAt, side: "sell", sol: 0.71, tokens: 1e4, midUsd: 71e-6 * (l || 150), priceUsd: 71e-6 * (l || 150), supply: 1e9 },
        ]
      : (n.fills[e.mint] || []).filter((t) => t.ts >= (e.openedAt || 0) - 1e3 && t.ts <= (e.closedAt || 1 / 0) + 1e3);
    return {
      trade: e,
      fills: t,
      solUsd: l || (e._sample ? 150 : l),
      avatar: N() === e.mint ? kt(e.mint) : null,
      bg: n.settings.shareBg || null,
      dim: void 0 === n.settings.shareDim ? 0.62 : n.settings.shareDim,
      blur: n.settings.shareBlur || 0,
      gblur: void 0 === n.settings.shareGlassBlur ? 14 : n.settings.shareGlassBlur,
      gtint: void 0 === n.settings.shareGlassTint ? 0.55 : n.settings.shareGlassTint,
      style: n.settings.shareStyle || "candles",
      onChart: N() === e.mint,
      askTicks: () => {
        /* l'exemple n'a pas de ticks : la reponse vide part au tour suivant, une fois la
           fenetre prete a la recevoir */
        e._sample ? setTimeout(() => window.__BLANKS_KILLCAM && window.__BLANKS_KILLCAM.ticks(e.mint, sampleTicks(e)), 0) : W({ cmd: "ticks", mint: e.mint });
      },
    };
  }
  function Qn(e) {
    const t = window.__BLANKS_KILLCAM;
    if (!t || !e) return Yt("card unavailable", "bad");
    t.openCard(
      Object.assign(Xn(e), {
        pct: !1 !== n.settings.sharePct,
        rows: !1 !== n.settings.shareRows,
        anim: !1 !== n.settings.shareAnim,
        onSettings: (e) => {
          const t = {
              bg: "shareBg",
              dim: "shareDim",
              blur: "shareBlur",
              gblur: "shareGlassBlur",
              gtint: "shareGlassTint",
              style: "shareStyle",
              pct: "sharePct",
              rows: "shareRows",
              anim: "shareAnim",
            },
            s = {};
          for (const n in e) t[n] && (s[t[n]] = e[n]);
          (Object.assign(n.settings, s), W({ cmd: "settings", settings: s }));
        },
      }),
    );
  }
  function ea(e, t, s, n, a, o) {
    (e.beginPath(),
      e.moveTo(t + o, s),
      e.arcTo(t + n, s, t + n, s + a, o),
      e.arcTo(t + n, s + a, t, s + a, o),
      e.arcTo(t, s + a, t, s, o),
      e.arcTo(t, s, t + n, s, o),
      e.closePath());
  }
  function ta() {
    if (!n.trades.length) return Yt("nothing to export");
    const e = [
      ["opened", "closed", "token", "mint", "invested_sol", "returned_sol", "pnl_sol", "pnl_pct", "fees_sol", "buys", "sells"].join(","),
    ];
    n.trades
      .slice()
      .reverse()
      .forEach((t) =>
        e.push(
          [
            new Date(t.openedAt).toISOString(),
            new Date(t.closedAt).toISOString(),
            '"' + String(t.symbol || "").replace(/"/g, '""') + '"',
            t.mint,
            t.investedSol.toFixed(6),
            t.returnedSol.toFixed(6),
            t.pnlSol.toFixed(6),
            t.pnlPct.toFixed(2),
            t.feesSol.toFixed(6),
            t.buys,
            t.sells,
          ].join(","),
        ),
      );
    const t = new Blob([e.join("\n")], { type: "text/csv;charset=utf-8" }),
      s = document.createElement("a");
    ((s.href = URL.createObjectURL(t)),
      (s.download = "papr-trades-" + new Date().toISOString().slice(0, 10) + ".csv"),
      document.body.appendChild(s),
      s.click(),
      s.remove(),
      setTimeout(() => URL.revokeObjectURL(s.href), 4e3),
      Yt("CSV exported"));
  }
  (G(),
    (m = J()),
    W({ cmd: "hello", pair: m, chain: r, kind: c }),
    m || mt(),
    setInterval(function () {
      const e = J();
      (!(function () {
        if (!h || Q === r) return;
        Q = r;
        const e = d();
        h.querySelectorAll(".un").forEach((t) => {
          t.textContent = e;
        });
        const s = h.querySelector(".buyunit");
        s && "SOL" === E() && (s.innerHTML = t());
        const n = h.querySelector('.ccy [data-c="SOL"] .solico');
        n && (n.parentNode.innerHTML = t() + '<i class="un">' + e + "</i>");
        (y.curbtn && (y.curbtn.textContent = "SOL" === E() ? ("ETH" === e ? "Ξ" : "BNB" === e ? "⬢" : "◎") : "$"),
          (Bt = ""),
          (k = null),
          g && (Ws(), zs()));
      })(),
        e !== m && ((m = e), W({ cmd: "pair", pair: e, mint: N(), chain: r, kind: c }), h && zs(), (v = !1), vt()));
    }, 400),
    setInterval(Me, 1e3),
    setInterval(() => W({ cmd: "ping" }), 2e4));
})();
