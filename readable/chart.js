!(function () {
  "use strict";
  if (window.__PAPR_CHART) return;
  window.__PAPR_CHART = !0;
  const t = "#2BC08A",
    e = "#EF4A5A",
    n = "#0b0e15",
    o = "#0d0d0f",
    i = "Geist, Inter, system-ui, sans-serif";
  let r = null;
  const l = new Map();
  function s(t) {
    const e = l.get(String(t || "").toLowerCase());
    return e && e.ok ? e.img : null;
  }
  const a = new Map();
  function c(t) {
    const e = (function (t) {
      return a.get(String(t || "").toLowerCase()) || 0;
    })(t);
    if (!e) return "";
    return (
      '<span style="background:' +
      (1 === e ? "#f0c43a" : 2 === e ? "#cfd6e2" : 3 === e ? "#d79a62" : "#1b1f26") +
      ";color:" +
      (e <= 3 ? "#0b0e15" : "#8b93a1") +
      ';font-size:9.5px;font-weight:700;border-radius:999px;padding:1px 5px;line-height:1.3">#' +
      e +
      "</span>"
    );
  }
  let d = null,
    u = null,
    p = null,
    f = null;
  function h(t) {
    for (let e = t, n = 0; e && e !== document.body && n < 12; e = e.parentElement, n++) {
      const t = getComputedStyle(e);
      if ("none" === t.display || "hidden" === t.visibility || "0" === t.opacity) return !0;
    }
    return !1;
  }
  function g() {
    const t = (function () {
      const t = document.querySelectorAll('iframe[id^="tradingview"]');
      let e = null;
      for (const n of t) {
        const t = n.getBoundingClientRect();
        t.width < 50 || t.height < 50 || h(n) || (e = n);
      }
      return e || t[0] || null;
    })();
    if (!t) return null;
    let e, n;
    try {
      ((e = t.contentWindow), (n = t.contentDocument));
    } catch (t) {
      return null;
    }
    if (!e || !n || !e.chartWidget) return null;
    const o = e.chartWidget;
    try {
      const t = o._model.timeScale(),
        i = o._paneWidgets && o._paneWidgets[0];
      if (!i) return null;
      const r = i.state().mainDataSource();
      if (!r) return null;
      const l = r.priceScale(),
        s = r.bars();
      if (!s || "function" != typeof s.lastIndex) return null;
      let a = n.querySelector(".chart-gui-wrapper");
      if (!a) {
        const t = [...n.querySelectorAll("canvas")].sort((t, e) => e.clientWidth * e.clientHeight - t.clientWidth * t.clientHeight)[0];
        a = t && t.parentElement;
      }
      return a ? { doc: n, win: e, ts: t, ps: l, src: r, bars: s, wrap: a } : null;
    } catch (t) {
      return null;
    }
  }
  function y(t, e) {
    const n = t.bars;
    let o, i;
    try {
      ((o = n.firstIndex()), (i = n.lastIndex()));
    } catch (t) {
      return null;
    }
    if (null === o || null === i || i < o) return null;
    const r = e / 1e3,
      l = (t) => {
        const e = n.valueAt(t);
        return e ? e[0] : null;
      };
    if (r < l(o)) return null;
    if (r >= l(i)) {
      const e = t.ts.indexToCoordinate(i),
        n = "function" == typeof t.ts.barSpacing ? t.ts.barSpacing() : 6,
        s = i > o ? l(i - 1) : null,
        a = null !== s ? l(i) - s : 1;
      return e + (a > 0 ? Math.min(1, (r - l(i)) / a) : 0) * n;
    }
    for (; i - o > 1;) {
      const t = (o + i) >> 1;
      l(t) <= r ? (o = t) : (i = t);
    }
    const s = l(o),
      a = l(o + 1),
      c = t.ts.indexToCoordinate(o);
    return c + (a > s ? (r - s) / (a - s) : 0) * (t.ts.indexToCoordinate(o + 1) - c);
  }
  function x(t, e) {
    const n = t.bars;
    let o, i;
    try {
      ((o = n.firstIndex()), (i = n.lastIndex()));
    } catch (t) {
      return null;
    }
    if (null === o || null === i || i < o) return null;
    const r = e / 1e3,
      l = (t) => {
        const e = n.valueAt(t);
        return e ? e[0] : null;
      },
      s = l(o);
    if (null === s || r < s) return null;
    if (r >= l(i)) {
      const t = n.valueAt(i);
      return (t && (t.idx = i), t);
    }
    for (; i - o > 1;) {
      const t = (o + i) >> 1;
      l(t) <= r ? (o = t) : (i = t);
    }
    const a = n.valueAt(o);
    return (a && (a.idx = o), a);
  }
  window.addEventListener("message", (t) => {
    const e = t.data;
    if (e && "PAPR" === e.source) {
      if ("marks" === e.type) return ((r = e.payload), void (W = !0));
      if ("avatars" === e.type)
        return (
          (function (t) {
            const e = new Set();
            for (const n in t) {
              const o = String(n).toLowerCase(),
                i = t[n];
              if ((e.add(o), !i)) {
                l.delete(o);
                continue;
              }
              const r = l.get(o);
              if (r && r.src === i) continue;
              const s = new Image(),
                a = { src: i, img: s, ok: !1 };
              ((s.onload = () => {
                ((a.ok = !0), (W = !0));
              }),
                (s.onerror = () => {
                  a.ok = !1;
                }),
                (s.src = i),
                l.set(o, a));
            }
            for (const t of [...l.keys()]) e.has(t) || l.delete(t);
            W = !0;
          })(e.map || {}),
          void (function (t) {
            a.clear();
            for (const e in t) {
              const n = +t[e];
              n > 0 && a.set(String(e).toLowerCase(), n);
            }
            W = !0;
          })(e.ranks || {})
        );
      if ("bars?" === e.type) {
        const n = [];
        let o = 0;
        try {
          const t = g();
          if (t && b) {
            const i = t.bars,
              r = i.firstIndex(),
              l = i.lastIndex(),
              s = [];
            for (let t = r; t <= l && s.length < 4e3; t++) {
              const e = i.valueAt(t);
              e && e[4] > 0 && s.push([1e3 * e[0], e[1] / b, e[2] / b, e[3] / b, e[4] / b]);
            }
            if (s.length > 1) {
              const t = [];
              for (let e = 1; e < s.length; e++) t.push(s[e][0] - s[e - 1][0]);
              (t.sort((t, e) => t - e), (o = t[t.length >> 1] || 0));
            }
            const a = Math.max(1, Math.min(200, 0 | e.ctx || 16));
            let c = s.findIndex((t) => t[0] >= e.t0);
            c < 0 && (c = Math.max(0, s.length - 1));
            let d = c;
            for (let t = s.length - 1; t >= 0; t--)
              if (s[t][0] <= e.t1) {
                d = t;
                break;
              }
            const u = Math.max(1, d - c + 1),
              p = Math.max(6, Math.min(2 * a, Math.round(1.2 * u))),
              f = Math.max(0, c - p),
              h = Math.min(s.length - 1, Math.max(d, c) + p);
            for (let t = f; t <= h; t++) n.push(s[t]);
          }
        } catch (t) {}
        try {
          window.postMessage({ source: "PAPR-CHART", type: "bars", id: e.id, bars: n, step: o }, location.origin);
        } catch (t) {}
      }
    }
  });
  try {
    Object.defineProperty(window, "__PAPR_DIAG", { get: () => f, configurable: !0 });
  } catch (t) {}
  let b = null;
  function m(t) {
    try {
      const e = t.bars.valueAt(t.bars.lastIndex());
      return e && e[4] > 0 ? e[4] : null;
    } catch (t) {
      return null;
    }
  }
  const v = (t) => (b && t > 0 ? t * b : null);
  let w = 0;
  function M() {
    const n = g();
    if (!n || !r || !r.marks) return void (u && d && u.clearRect(0, 0, d.width, d.height));
    !(function (t) {
      (d && p === t.wrap && d.isConnected) ||
        (d && d.parentElement && d.remove(),
        (d = t.doc.createElement("canvas")),
        d.setAttribute("data-papr", "1"),
        (d.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:3"),
        t.wrap.appendChild(d),
        (u = d.getContext("2d")),
        (p = t.wrap));
    })(n);
    const o = n.wrap.clientWidth,
      a = n.wrap.clientHeight,
      h = n.win.devicePixelRatio || 1;
    if (
      ((d.width === Math.round(o * h) && d.height === Math.round(a * h)) || ((d.width = Math.round(o * h)), (d.height = Math.round(a * h))),
      u.setTransform(h, 0, 0, h, 0, 0),
      u.clearRect(0, 0, o, a),
      !o || !a)
    )
      return;
    (!(function (t) {
      const e = m(t);
      if (!(null !== e && r && r.refPriceUsd > 0)) return;
      const n = r.refMcap > 0 ? r.refMcap / r.refPriceUsd : 0,
        o = n > 0 ? [1, n] : [1];
      let i = null,
        l = 1 / 0;
      for (const t of o) {
        const n = Math.abs(Math.log(e / (r.refPriceUsd * t)));
        n < l && ((l = n), (i = t));
      }
      null !== i && l < 1.5 ? (null === b || Math.abs(Math.log(i / b)) > 0.3) && (b = i) : null === b && null !== i && (b = i);
    })(n),
      (function (t) {
        if (!r || !b) return;
        const e = m(t);
        if (null === e) return;
        const n = e / b;
        if (n > 0 && n !== w) {
          w = n;
          try {
            window.postMessage({ source: "PAPR-CHART", type: "tick", mint: r.mint, priceUsd: n }, location.origin);
          } catch (t) {}
        }
      })(n));
    let M = null;
    try {
      M = n.src.firstValue ? n.src.firstValue() : void 0;
    } catch (t) {}
    const P = (t) => {
      const e = v(t);
      if (null === e) return null;
      try {
        const t = n.ps.priceToCoordinate(e, M);
        return isFinite(t) ? t : null;
      } catch (t) {
        return null;
      }
    };
    f = {
      scaleK: b,
      W: o,
      H: a,
      refPriceUsd: r.refPriceUsd,
      avgUsd: r.avgUsd,
      yAvg: r.avgUsd ? P(r.avgUsd) : null,
      marks: r.marks.length,
      orders: r.orders.length,
    };
    const z = [],
      F = (t, e, n, o) => {
        const i = P(t);
        null !== i && z.push({ y: i, col: e, tag: n, solid: o, txt: A(v(t)) });
      };
    try {
      (F(r.avgUsd, t, "Avg. Buy", 0), F(r.avgSellUsd, e, "Avg. Sell", 0), F(r.beUsd, "#c9ced9", "B/E", 0));
      for (const n of r.orders || [])
        F(n.priceUsd, "tp" === n.kind ? t : "sl" === n.kind ? e : "#526fff", "tp" === n.kind ? "TP" : "sl" === n.kind ? "SL" : "LIMIT", 0);
      const n = 20;
      z.sort((t, e) => t.y - e.y);
      /* Deux etiquettes trop proches ne se poussent plus verticalement : la seconde passe
         dans une colonne a gauche, et chaque etiquette reste a son vrai prix. */
      (u.save(), (u.font = "500 11px " + i));
      const W = z.reduce((t, e) => Math.max(t, u.measureText(e.txt).width + u.measureText(e.tag).width + 34), 0);
      u.restore();
      const C = [];
      for (const t of z) {
        let e = 0;
        for (; C.some((o) => o.c === e && Math.abs(o.y - t.y) < n); ) e++;
        ((t.c = e), C.push({ c: e, y: t.y }));
      }
      for (const t of z.slice().sort((t, e) => t.c - e.c)) S(u, o - t.c * W, a, t.y, t.col, t.txt, t.tag, t.solid);
    } catch (t) {}
    /* Zones de tes trades passes sur ce token, et ligne fantome apres la vente */
    try {
      const L = (t) => {
        try {
          return n.ts.indexToCoordinate(t);
        } catch (e) {
          return null;
        }
      };
      let lastX = null;
      try {
        lastX = L(n.bars.lastIndex());
      } catch (t) {}
      const pill = (txt, x, yy, bg, fg) => {
        u.font = "600 10.5px " + i;
        const w = u.measureText(txt).width + 12;
        x = Math.max(2, Math.min(o - w - 2, x));
        u.fillStyle = bg;
        u.beginPath();
        u.roundRect ? u.roundRect(x, yy, w, 17, 8.5) : u.rect(x, yy, w, 17);
        u.fill();
        u.fillStyle = fg;
        u.textBaseline = "middle";
        u.textAlign = "left";
        u.fillText(txt, x + 6, yy + 9);
      };
      for (const zn of r.zones || []) {
        let x0 = y(n, zn.t0),
          x1 = y(n, zn.t1);
        if (null === x0 && null === x1) continue;
        (null === x0 && (x0 = 0), null === x1 && (x1 = null !== lastX ? lastX : o));
        if (x1 < 0 || x0 > o) continue;
        const up = (zn.pnl || 0) >= 0;
        ((u.fillStyle = up ? "rgba(43,192,138,.08)" : "rgba(239,74,90,.08)"), u.fillRect(x0, 0, Math.max(2, x1 - x0), a));
        ((u.strokeStyle = up ? "rgba(43,192,138,.35)" : "rgba(239,74,90,.35)"), (u.lineWidth = 1));
        (u.beginPath(), u.moveTo(Math.round(x0) + 0.5, 0), u.lineTo(Math.round(x0) + 0.5, a), u.moveTo(Math.round(x1) + 0.5, 0), u.lineTo(Math.round(x1) + 0.5, a), u.stroke());
        const pc = isFinite(zn.pct) ? (zn.pct >= 0 ? "+" : "−") + Math.abs(zn.pct).toFixed(Math.abs(zn.pct) >= 10 ? 0 : 1) + "%" : "";
        pc && pill("you " + pc, x0 + 4, 6, up ? "rgba(43,192,138,.9)" : "rgba(239,74,90,.9)", "#0b0e15");
      }
      const gh = r.ghost;
      if (gh && b) {
        const gx = y(n, gh.ts),
          gy = P(gh.priceUsd),
          cur = m(n),
          cy = null !== cur ? P(cur / b) : null;
        if (null !== gx && null !== gy && null !== cy && null !== lastX) {
          const better = gh.diffSol > 0,
            col = better ? "#f0b43a" : "#8b93a1";
          ((u.strokeStyle = col), (u.lineWidth = 1.5), u.setLineDash([5, 4]));
          (u.beginPath(), u.moveTo(gx, gy), u.lineTo(lastX, cy), u.stroke(), u.setLineDash([]));
          ((u.fillStyle = col), u.beginPath(), u.arc(lastX, cy, 3.5, 0, 2 * Math.PI), u.fill());
          const amt = Math.abs(gh.diffSol),
            dec = amt >= 1 ? 2 : amt >= 0.01 ? 3 : 4,
            pc = Math.abs(gh.pct).toFixed(Math.abs(gh.pct) >= 10 ? 0 : 1) + "%";
          const txt = better
            ? "+" + pc + " since you sold · " + amt.toFixed(dec) + " " + (gh.asset || "SOL") + " missed"
            : "−" + pc + " since you sold · good exit";
          pill(txt, lastX - 8 - u.measureText(txt).width - 12, cy - 26, col, "#0b0e15");
        }
      }
    } catch (t) {}
    try {
      const d = [],
        p = new Map();
      C = [];
      for (let t = 0; t < (r.marks || []).length; t++) {
        const e = r.marks[t],
          i = "buy" === e.side;
        let l = y(n, e.ts),
          s = v(e.priceUsd);
        if (null === l || null === s) continue;
        const c = x(n, e.ts);
        if (c && "number" == typeof c.idx)
          try {
            const t = n.ts.indexToCoordinate(c.idx);
            isFinite(t) && (l = t);
          } catch (t) {}
        let f = s,
          h = Math.round(l);
        c && c[2] > 0 && c[3] > 0 && ((f = Math.max(c[2], c[3])), (h = c[0]));
        let g = null;
        try {
          g = n.ps.priceToCoordinate(f, M);
        } catch (t) {}
        if (!isFinite(g)) continue;
        const b = p.get(h) || 0;
        p.set(h, b + 1);
        const m = 11,
          w = g - 9 - m - b * (2 * m + 4);
        if (
          (d.push({ side: e.side, x: Math.round(l), y: Math.round(w), clamped: !1, inBar: !0 }),
          l < -16 || l > o + 16 || w < -16 || w > a + 16)
        )
          continue;
        const S = U && U.i === t;
        (S && ((U.x = l), (U.y = w)), k(u, l, w, i, S), C.push({ i: t, x: l, y: w, r: S ? 12 : m }));
      }
      for (let t = 0; t < (r.others || []).length; t++) {
        const e = r.others[t],
          i = "buy" === e.side;
        let l = y(n, e.ts),
          c = v(e.priceUsd);
        if (null === l || null === c) continue;
        const d = x(n, e.ts);
        if (d && "number" == typeof d.idx)
          try {
            const t = n.ts.indexToCoordinate(d.idx);
            isFinite(t) && (l = t);
          } catch (t) {}
        let f = c,
          h = Math.round(l);
        d && d[2] > 0 && d[3] > 0 && ((f = Math.max(d[2], d[3])), (h = d[0]));
        let g = null;
        try {
          g = n.ps.priceToCoordinate(f, M);
        } catch (t) {}
        if (!isFinite(g)) continue;
        const b = p.get(h) || 0;
        p.set(h, b + 1);
        const m = 11,
          w = g - 9 - m - b * (2 * m + 4);
        if (l < -16 || l > o + 16 || w < -16 || w > a + 16) continue;
        const S = U && U.o === t;
        (S && ((U.x = l), (U.y = w)), k(u, l, w, i, S, e.color, s(e.user), e.user), C.push({ o: t, x: l, y: w, r: S ? 12 : m }));
      }
      ((f.markPos = d),
        (f.hits = C.map((t) => ({
          x: t.x,
          y: t.y,
          mine: "number" == typeof t.i,
          buy: "buy" === ("number" == typeof t.i ? r.marks[t.i] : r.others[t.o] || {}).side,
        }))),
        U &&
          (function (n, o) {
            const s = "number" == typeof o.o ? (r.others || [])[o.o] : null,
              a = s || r.marks[o.i];
            if (!a) return;
            (L && R === n.wrap && L.isConnected) ||
              (L && L.remove(),
              (L = n.doc.createElement("div")),
              L.setAttribute("data-papr", "1"),
              (L.style.cssText =
                "position:absolute;z-index:4;pointer-events:none;background:#0f1114;border:1px solid #23272e;border-radius:12px;padding:10px;font:13px/1.35 " +
                i +
                ";color:#e6e9ee;box-shadow:0 10px 30px rgba(0,0,0,.55);white-space:nowrap;width:212px;box-sizing:border-box"),
              n.wrap.appendChild(L),
              (R = n.wrap));
            const d = "buy" === a.side,
              u = d ? t : e,
              p = d ? "rgba(43,192,138,.10)" : "rgba(239,74,90,.10)",
              f = r.symbol || "",
              h = a.mcap > 0 ? a.mcap : s ? 0 : r.supply > 0 ? a.priceUsd * r.supply : 0,
              g = s && l.get(String(a.user || "").toLowerCase()),
              y = s
                ? g && g.ok
                  ? '<img src="' + g.src + '" style="width:22px;height:22px;border-radius:50%;object-fit:cover;background:#1b1f26">'
                  : '<span style="display:inline-grid;place-items:center;width:22px;height:22px;border-radius:50%;background:' +
                    a.color +
                    ';color:#0b0e15;font-size:11px;font-weight:700">' +
                    String(a.user || "?")[0].toUpperCase() +
                    "</span>"
                : r.avatar
                  ? '<img src="' + r.avatar + '" style="width:22px;height:22px;border-radius:50%;object-fit:cover;background:#1b1f26">'
                  : '<span style="display:inline-grid;place-items:center;width:22px;height:22px;border-radius:50%;background:#1b1f26;color:#8b93a1;font-size:11px;font-weight:700">' +
                    (f[0] || "?") +
                    "</span>",
              x = d || "number" != typeof a.pnlSol ? 0 : a.pnlSol,
              b = s ? null : r.pos ? r.pos.valueSol - r.pos.costSol : 0,
              m = (n, o) =>
                '<div><div style="color:#6f7886;font-size:11px">' +
                n +
                '</div><div style="font-weight:600;margin-top:2px;color:' +
                (o > 1e-9 ? t : o < -1e-9 ? e : "#e6e9ee") +
                '">' +
                (o > 1e-9 ? "+ " : o < -1e-9 ? "- " : "") +
                B(Math.abs(o)) +
                "</div></div>";
            let v = r.tot || { nb: 0, sb: 0, ns: 0, ss: 0 };
            if (s) {
              v = { nb: 0, sb: 0, ns: 0, ss: 0 };
              for (const t of r.others)
                t.user === a.user && ("buy" === t.side ? (v.nb++, (v.sb += t.sol || 0)) : (v.ns++, (v.ss += t.sol || 0)));
            }
            const w =
              null === b
                ? '<div><div style="color:#6f7886;font-size:11px">U. PnL</div><div style="font-weight:600;margin-top:2px;color:#6f7886">—</div></div>'
                : m("U. PnL", b);
            L.innerHTML =
              '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">' +
              y +
              '<b style="font-size:13px">' +
              (s ? a.user : f) +
              "</b>" +
              (s ? c(a.user) + '<span style="color:#8b93a1;font-size:11px">' + f + "</span>" : "") +
              '<span style="margin-left:auto;color:#6f7886;font-size:11px">' +
              (function (t) {
                const e = new Date(t),
                  n = (t) => String(t).padStart(2, "0");
                return (
                  n(e.getDate()) + "/" + n(e.getMonth() + 1) + " " + n(e.getHours()) + ":" + n(e.getMinutes()) + ":" + n(e.getSeconds())
                );
              })(a.ts).slice(6) +
              '</span></div><div style="background:' +
              p +
              ";border:1px solid " +
              (d ? "rgba(43,192,138,.35)" : "rgba(239,74,90,.35)") +
              ';border-radius:9px;padding:8px 10px"><div style="font-size:19px;font-weight:700;color:' +
              u +
              '">' +
              B(a.sol || 0) +
              '</div><div style="display:flex;align-items:center;gap:8px;margin-top:5px"><span style="background:' +
              u +
              ';color:#0b0e15;font-weight:700;font-size:11px;border-radius:5px;padding:2px 7px">' +
              (d ? "Buy" : "Sell") +
              '</span><span style="color:#c9ced9;font-size:12px">@ ' +
              (h > 0 ? "$" + A(h) + " MC" : T(a.priceUsd)) +
              '</span></div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:9px">' +
              m("R. PnL", x) +
              w +
              '</div><div style="border-top:1px solid #23272e;margin-top:9px;padding-top:8px"><div style="display:flex;justify-content:space-between"><span style="color:#8b93a1">Trades</span><b>' +
              (v.nb + v.ns) +
              '</b></div><div style="display:flex;justify-content:space-between;margin-top:5px;font-size:12px"><span style="color:' +
              t +
              '">' +
              v.nb +
              " / " +
              B(v.sb) +
              '</span><span style="color:' +
              e +
              '">' +
              v.ns +
              " / " +
              B(v.ss) +
              '</span></div><div style="display:flex;height:3px;border-radius:2px;overflow:hidden;margin-top:5px;background:#23272e"><i style="flex:' +
              (v.sb || 0) +
              ";background:" +
              t +
              '"></i><i style="flex:' +
              (v.ss || 0) +
              ";background:" +
              e +
              '"></i></div></div>';
            const M = n.wrap.clientWidth,
              S = L.offsetWidth || 212,
              P = L.offsetHeight || 150;
            let k = o.x + 16,
              C = o.y - P / 2;
            k + S > M - 8 && (k = o.x - S - 16);
            C < 6 && (C = 6);
            C + P > n.wrap.clientHeight - 6 && (C = Math.max(6, n.wrap.clientHeight - P - 6));
            ((L.style.left = Math.round(k) + "px"), (L.style.top = Math.round(C) + "px"), (L.style.display = ""));
          })(n, U));
    } catch (t) {}
  }
  function S(t, e, n, r, l, s, a, c, d) {
    const u = r < 9 ? -1 : r > n - 9 ? 1 : 0,
      p = void 0 === d ? r : d,
      f = u < 0 ? 9 : u > 0 ? n - 9 : Math.max(9, Math.min(n - 9, p));
    (t.save(), (t.font = "500 11px " + i));
    const h = t.measureText(s).width + 12 + (u ? 10 : 0),
      g = e - h - 1,
      y = f - 9;
    let x = g;
    if (a) {
      t.font = "500 11px " + i;
      ((x = g - t.measureText(a).width - 8), u || ((t.fillStyle = l), t.fillText(a, x, f + 4)));
    }
    if (
      (u ||
        ((t.strokeStyle = l),
        (t.lineWidth = 1),
        (t.globalAlpha = c ? 0.9 : 0.7),
        c || t.setLineDash([4, 4]),
        t.beginPath(),
        t.moveTo(0, r + 0.5),
        t.lineTo(Math.max(0, x - 46), r + 0.5),
        t.lineTo(x - 6, f + 0.5),
        t.stroke(),
        t.setLineDash([]),
        (t.globalAlpha = 1)),
      (t.fillStyle = l),
      (t.globalAlpha = u ? 0.8 : 1),
      (function (t, e, n, o, i, r) {
        (t.beginPath(),
          t.moveTo(e + r, n),
          t.arcTo(e + o, n, e + o, n + i, r),
          t.arcTo(e + o, n + i, e, n + i, r),
          t.arcTo(e, n + i, e, n, r),
          t.arcTo(e, n, e + o, n, r),
          t.closePath());
      })(t, g, y, h, 18, 3),
      t.fill(),
      (t.globalAlpha = 1),
      (t.fillStyle = o),
      (t.font = "600 11px " + i),
      t.fillText(s, g + 6, f + 4),
      u)
    ) {
      const e = g + h - 7,
        n = f;
      (t.beginPath(), t.moveTo(e, n + 4.5 * u), t.lineTo(e - 3.5, n - 2.5 * u), t.lineTo(e + 3.5, n - 2.5 * u), t.closePath(), t.fill());
    }
    t.restore();
  }
  function A(t) {
    return t > 0
      ? t >= 1e9
        ? (t / 1e9).toFixed(2) + "B"
        : t >= 1e6
          ? (t / 1e6).toFixed(2) + "M"
          : t >= 1e3
            ? (t / 1e3).toFixed(2) + "K"
            : T(t)
      : "";
  }
  function T(t) {
    if (!(t > 0)) return "";
    if (t >= 1) return "$" + t.toFixed(t >= 100 ? 2 : 4);
    const e = Math.floor(Math.log10(t));
    return e >= -4
      ? "$" + t.toFixed(Math.min(8, 3 - e))
      : "$0.0" +
          String(-e - 1)
            .split("")
            .map((t) => P[+t])
            .join("") +
          Math.round(t * Math.pow(10, 3 - e))
            .toString()
            .slice(0, 4);
  }
  const P = "₀₁₂₃₄₅₆₇₈₉";
  function k(t, e, r, l, s, a, c, d) {
    const u = l ? "#14D8B8" : "#FB4A69",
      p = s ? 12 : a ? 10 : 11;
    if (
      (t.save(),
      s && (t.beginPath(), t.arc(e, r, p + 6, 0, 6.2832), (t.fillStyle = u), (t.globalAlpha = 0.22), t.fill(), (t.globalAlpha = 1)),
      a)
    ) {
      if (
        (t.beginPath(),
        t.arc(e, r, p + 2.5, 0, 6.2832),
        (t.fillStyle = u),
        t.fill(),
        t.beginPath(),
        t.arc(e, r, p + 1, 0, 6.2832),
        (t.fillStyle = n),
        t.fill(),
        t.beginPath(),
        t.arc(e, r, p, 0, 6.2832),
        c)
      ) {
        (t.save(), t.clip());
        try {
          t.drawImage(c, e - p, r - p, 2 * p, 2 * p);
        } catch (t) {}
        t.restore();
      } else
        ((t.fillStyle = a),
          t.fill(),
          (t.fillStyle = o),
          (t.font = "700 " + (s ? 12 : 11) + "px " + i),
          (t.textAlign = "center"),
          (t.textBaseline = "middle"),
          t.fillText(String(d || "?")[0].toUpperCase(), e, r + 0.5));
      const f = e + 0.72 * p,
        h = r + 0.72 * p,
        g = s ? 6 : 5.5;
      return (
        t.beginPath(),
        t.arc(f, h, g + 1.2, 0, 6.2832),
        (t.fillStyle = n),
        t.fill(),
        t.beginPath(),
        t.arc(f, h, g, 0, 6.2832),
        (t.fillStyle = u),
        t.fill(),
        (t.fillStyle = o),
        (t.font = "800 " + (s ? 8 : 7.5) + "px " + i),
        (t.textAlign = "center"),
        (t.textBaseline = "middle"),
        t.fillText(l ? "B" : "S", f, h + 0.4),
        void t.restore()
      );
    }
    (t.beginPath(),
      t.arc(e, r, p + 1.5, 0, 6.2832),
      (t.fillStyle = n),
      (t.globalAlpha = 0.95),
      t.fill(),
      (t.globalAlpha = 1),
      t.beginPath(),
      t.arc(e, r, p, 0, 6.2832),
      (t.fillStyle = u),
      t.fill(),
      (t.fillStyle = "#ffffff"),
      (t.font = "700 " + (s ? 13 : 12) + "px " + i),
      (t.textAlign = "center"),
      (t.textBaseline = "middle"),
      t.fillText(l ? "B" : "S", e, r + 0.5),
      t.restore());
  }
  let C = [],
    U = null,
    L = null,
    R = null,
    z = null;
  function F() {
    return (r && r.asset) || "SOL";
  }
  const H =
    '<svg viewBox="0 0 398 312" style="width:1em;height:.8em;vertical-align:-.05em"><defs><linearGradient id="pgs_t" x1="0" y1="312" x2="398" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#00FFA3"/><stop offset="1" stop-color="#DC1FFF"/></linearGradient></defs><path fill="url(#pgs_t)" d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7zM64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8zM333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z"/></svg>';
  function B(t, e) {
    return (
      (function () {
        const t = F();
        return "SOL" === t ? H : '<span style="font-size:.85em;color:#8b93a1;margin-right:1px">' + ("ETH" === t ? "Ξ" : t) + "</span>";
      })() +
      " " +
      (Math.abs(t) < 1e-9 ? "0" : (+t).toFixed(void 0 === e ? (Math.abs(t) >= 100 ? 1 : Math.abs(t) >= 1 ? 2 : 4) : e))
    );
  }
  function I() {
    L && (L.style.display = "none");
  }
  let _ = "",
    W = !1;
  function E() {
    try {
      const t = g();
      if (!t) return (u && d && u.clearRect(0, 0, d.width, d.height), void I());
      !(function (t) {
        if (z === t.wrap) return;
        ((z = t.wrap),
          t.wrap.addEventListener(
            "mousemove",
            (e) => {
              const n = t.wrap.getBoundingClientRect(),
                o = e.clientX - n.left,
                i = e.clientY - n.top;
              let r = null,
                l = 1e9;
              for (const t of C) {
                const e = Math.hypot(t.x - o, t.y - i);
                e <= t.r + 3 && e < l && ((l = e), (r = t));
              }
              const s = r ? { i: r.i, o: r.o, x: r.x, y: r.y } : null;
              ((s && !U) || (!s && U) || (s && U && (s.i !== U.i || s.o !== U.o))) && ((U = s), (W = !0));
            },
            !0,
          ),
          t.wrap.addEventListener(
            "mouseleave",
            () => {
              U && ((U = null), (W = !0));
            },
            !0,
          ),
          t.wrap.addEventListener(
            "click",
            (e) => {
              const n = t.wrap.getBoundingClientRect(),
                o = e.clientX - n.left,
                i = e.clientY - n.top;
              let l = null,
                s = 1e9;
              for (const t of C) {
                if ("number" != typeof t.o) continue;
                const e = Math.hypot(t.x - o, t.y - i);
                e <= t.r + 3 && e < s && ((s = e), (l = t));
              }
              const a = l && r.others && r.others[l.o];
              if (a && a.user) {
                (e.preventDefault(), e.stopPropagation());
                try {
                  window.postMessage({ source: "PAPR-CHART", type: "user", user: a.user }, location.origin);
                } catch (t) {}
              }
            },
            !0,
          ));
      })(t);
      const e = (function (t) {
        let e = 0,
          n = 0,
          o = 0,
          i = 0;
        try {
          ((i = t.bars.lastIndex()), (e = t.ts.indexToCoordinate(i)), (o = t.ts.barSpacing ? t.ts.barSpacing() : 0));
        } catch (t) {}
        try {
          const e = t.bars.valueAt(i);
          n = e ? t.ps.priceToCoordinate(e[4]) : 0;
        } catch (t) {}
        return [
          e,
          n,
          o,
          i,
          t.wrap.clientWidth,
          t.wrap.clientHeight,
          r ? r.marks.length + (r.others ? 1e3 * r.others.length : 0) : -1,
          r ? r.avgUsd : 0,
          r ? r.beUsd : 0,
          r ? r.orders.length : 0,
        ].join("|");
      })(t);
      if (e === _ && !W) return;
      ((_ = e), (W = !1), M(), U || I());
    } catch (t) {}
  }
  (setInterval(() => {
    try {
      E();
    } catch (t) {}
  }, 250),
    (function t() {
      (requestAnimationFrame(t), E());
    })());
})();
