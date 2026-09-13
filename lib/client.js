window.__ModuleLoader__.load({
  id: "dsh-session-list",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    var React = require("react");

    // ---------------------------------------------------------------------
    // Styles
    // ---------------------------------------------------------------------
    var BASE_CSS = [
      ".sl-rail{position:fixed;width:22px;pointer-events:auto;z-index:8;}",
      ".sl-frame{position:absolute;inset:0;}",
      ".sl-scroll{position:absolute;inset:0;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:none;}",
      ".sl-scroll::-webkit-scrollbar{display:none;}",
      ".sl-fade-top{-webkit-mask-image:linear-gradient(#0000 0,#000 24px 100%);mask-image:linear-gradient(#0000 0,#000 24px 100%);}",
      ".sl-fade-bottom{-webkit-mask-image:linear-gradient(#000 0 calc(100% - 24px),#0000 100%);mask-image:linear-gradient(#000 0 calc(100% - 24px),#0000 100%);}",
      ".sl-fade-top.sl-fade-bottom{-webkit-mask-image:linear-gradient(#0000 0,#000 24px calc(100% - 24px),#0000 100%);mask-image:linear-gradient(#0000 0,#000 24px calc(100% - 24px),#0000 100%);}",
      ".sl-marks{position:relative;}",
      ".sl-pos{position:absolute;left:0;right:0;height:10px;transform:translateY(-50%);}",
      ".sl-mark{position:absolute;right:0;top:0;bottom:0;width:22px;background:none;border:0;padding:0;cursor:pointer;}",
      ".sl-mark::before{content:\"\";position:absolute;right:0;top:50%;transform:translateY(-50%);width:10px;height:2px;border-radius:1px;background:var(--dsw-alias-border-l4,rgba(128,128,128,.4));transition:width .14s,background-color .14s;}",
      ".sl-mark:hover::before{background:var(--dsw-alias-label-tertiary,rgba(128,128,128,.7));width:16px;}",
      ".sl-mark.is-active::before{background:var(--dsw-alias-label-primary,#222);width:18px;}",
      ".sl-mark.is-unloaded::before{opacity:.55;width:7px;}",
      ".sl-tip{position:absolute;right:20px;top:50%;transform:translateY(-50%);max-width:300px;max-height:60vh;overflow-y:auto;pointer-events:auto;background:var(--dsw-alias-bg-overlay,#fff);border:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,.08));border-radius:8px;box-shadow:0 6px 24px rgba(0,0,0,.16);padding:4px 0;}",
      ".sl-tip-item{display:block;width:100%;text-align:left;border:0;background:none;padding:5px 12px 5px 16px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-primary,#222);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:300px;cursor:pointer;}",
      ".sl-tip-item:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05));}",
      ".sl-tip-item.is-cur{color:var(--dsw-alias-brand-primary,#4d6bfe);background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05));}",
      ".sl-srow{border-bottom:1px solid var(--dsw-alias-border-l2);align-items:center;gap:8px;padding:16px 0;display:flex;}",
      ".sl-srow-text{flex-direction:column;flex:1;gap:4px;min-width:0;padding-right:24px;display:flex;}",
      ".sl-srow-title{color:var(--dsw-alias-label-primary);font-size:14px;line-height:22px;}",
      ".sl-srow-desc{color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));font-size:12px;line-height:18px;}",
      ".sl-seg{flex:none;display:inline-flex;gap:2px;padding:2px;border-radius:999px;background:var(--dsw-alias-bg-module-platform,rgba(128,128,128,.14));}",
      ".sl-seg-btn{border:0;background:none;padding:5px 12px;border-radius:999px;font-size:13px;line-height:18px;color:var(--dsw-alias-label-secondary);cursor:pointer;}",
      ".sl-seg-btn:hover{color:var(--dsw-alias-label-primary);}",
      ".sl-seg-btn.is-on{background:var(--dsw-alias-bg-layer-1,#fff);color:var(--dsw-alias-label-primary);box-shadow:0 1px 2px rgba(0,0,0,.12);}"
    ].join("");

    // Hide the built-in TurnNavigator while the custom rail is active. The
    // selector is structural on purpose: it targets the first child of the
    // element that directly contains [data-chat-flow] (today exactly the
    // built-in rail slot), so it survives class-hash and locale changes.
    // `visibility` (not `display`) keeps the box measurable so the custom rail
    // can mirror its exact position.
    var HIDE_CSS = "div:has(> [data-chat-flow]) > :first-child:not([data-chat-flow]){visibility:hidden !important;}";

    // ---------------------------------------------------------------------
    // Mode store (persisted): 'default' (official rail) | 'custom' (this rail)
    // ---------------------------------------------------------------------
    var KEY = "dsh.session-list.mode.v1";
    var mode = "default";
    try {
      var stored = window.localStorage.getItem(KEY);
      if (stored === "custom" || stored === "default") mode = stored;
    } catch (e) {}
    var subs = new Set();
    function getMode() { return mode; }
    function setMode(v) {
      var next = v === "custom" ? "custom" : "default";
      if (next === mode) return;
      mode = next;
      try { window.localStorage.setItem(KEY, mode); } catch (e) {}
      subs.forEach(function (f) { f(); });
    }
    function subscribe(fn) { subs.add(fn); return function () { subs.delete(fn); }; }
    function useMode() {
      var pair = React.useState(getMode);
      var state = pair[0];
      var setState = pair[1];
      React.useEffect(function () {
        return subscribe(function () { setState(getMode()); });
      }, []);
      return state;
    }

    // ---------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------
    function shortText(t) {
      var MAX = 16;
      return t.length > MAX ? t.slice(0, MAX) + "…" : t;
    }

    function scrollport() {
      return document.querySelector("[data-conversation-scroll]");
    }

    /** The built-in rail slot: a child of the chat scroller, before [data-chat-flow]. */
    function findOfficialSlot() {
      var sp = scrollport();
      if (!sp) return null;
      var flow = sp.querySelector("[data-chat-flow]");
      if (!flow || !flow.parentElement) return null;
      var parent = flow.parentElement;
      var prev = flow.previousElementSibling;
      if (prev && prev !== flow && prev.querySelector && prev.querySelector("nav")) return prev;
      var kids = parent.children;
      for (var i = 0; i < kids.length; i++) {
        var child = kids[i];
        if (child === flow) continue;
        if (child.querySelector && child.querySelector("nav")) return child;
      }
      return null;
    }

    /** True when a built-in rail nav is still visible inside the chat scroller. */
    function officialVisible() {
      var sp = scrollport();
      if (!sp) return false;
      var flow = sp.querySelector("[data-chat-flow]");
      if (!flow || !flow.parentElement) return false;
      var nav = flow.parentElement.querySelector("nav");
      if (!nav) return false;
      try { return window.getComputedStyle(nav).visibility !== "hidden"; } catch (e) { return true; }
    }

    /** The turn whose row currently sits at the reading edge (single hit test). */
    function activeTurnAt(sp) {
      var rect = sp.getBoundingClientRect();
      var x = rect.left + rect.width / 2;
      var y = rect.top + 26;
      if (typeof document.elementsFromPoint !== "function") return -1;
      var stack = document.elementsFromPoint(x, y);
      for (var i = 0; i < stack.length; i++) {
        var el = stack[i];
        var row = el && el.closest ? el.closest("[data-chat-turn]") : null;
        if (row && sp.contains(row)) {
          var turn = Number(row.getAttribute("data-chat-turn"));
          if (isFinite(turn)) return turn;
        }
      }
      return -1;
    }

    function scrollRowIntoView(sp, row) {
      var target = row.getBoundingClientRect().top - sp.getBoundingClientRect().top + sp.scrollTop - 16;
      if (typeof sp.scrollTo === "function") sp.scrollTo({ top: target, behavior: "smooth" });
      else sp.scrollTop = target;
    }

    function activeIndex(items, turn) {
      for (var i = 0; i < items.length; i++) if (items[i].turn === turn) return i;
      return -1;
    }

    function turnRow(turn) {
      var sp = scrollport();
      if (!sp) return null;
      return sp.querySelector('[data-chat-turn="' + turn + '"]');
    }

    var PITCH = 14; // px between marks
    var CAP = 420;  // px, rail height ceiling (same idea as the built-in rail)
    var INSET = 6;  // px padding above the first / below the last mark

    // ---------------------------------------------------------------------
    // Custom rail
    // ---------------------------------------------------------------------
    function QuestionRail(props) {
      var m = useMode();
      var enabled = m === "custom";
      var outline = props.useProjection("turnOutline");
      var sessionId = props.sessionId;
      var sessions = props.sessions;

      var items = React.useMemo(function () {
        var out = [];
        if (Array.isArray(outline)) {
          for (var i = 0; i < outline.length; i++) {
            var entry = outline[i];
            if (!entry || typeof entry.turn !== "number") continue;
            var prompt = typeof entry.prompt === "string" ? entry.prompt.trim() : "";
            out.push({
              turn: entry.turn,
              seq: entry.seq,
              text: prompt !== "" ? prompt : "第 " + entry.turn + " 轮"
            });
          }
        }
        return out;
      }, [outline]);

      var geomPair = React.useState(null);
      var geom = geomPair[0];
      var setGeom = geomPair[1];
      var activePair = React.useState(-1);
      var activeTurn = activePair[0];
      var setActiveTurn = activePair[1];
      var hoverPair = React.useState(false);
      var hover = hoverPair[0];
      var setHover = hoverPair[1];
      var hoverIdxPair = React.useState(-1);
      var hoverIdx = hoverIdxPair[0];
      var setHoverIdx = hoverIdxPair[1];

      var revertRef = React.useRef(null);
      var tipRef = React.useRef(null);

      React.useLayoutEffect(function () {
        if (!enabled) { setGeom(null); return; }
        var disposed = false;

        function measure() {
          if (disposed) return;
          var sp = scrollport();
          var flow = sp ? sp.querySelector("[data-chat-flow]") : null;
          if (!sp || !flow) { setGeom(null); return; }

          // Position: mirror the built-in rail's exact box (right edge and
          // vertical centre) so switching between the two never jumps.
          var slot = findOfficialSlot();
          var nav = slot ? slot.querySelector("nav") : null;
          var right;
          var centerY;
          if (nav) {
            var nr = nav.getBoundingClientRect();
            right = Math.max(8, window.innerWidth - nr.right);
            centerY = nr.top + nr.height / 2;
          } else {
            var sr0 = sp.getBoundingClientRect();
            right = Math.max(16, window.innerWidth - sr0.right + 16);
            centerY = sr0.top + sr0.height / 2;
          }

          var natural = items.length > 0 ? (items.length - 1) * PITCH + 2 + INSET * 2 : 0;
          var height = Math.min(natural, CAP);
          setGeom({
            right: right,
            top: centerY - height / 2,
            height: height,
            natural: natural,
            scrollable: natural > height + 1
          });
          setActiveTurn(activeTurnAt(sp));

          // Safety net: the built-in rail must be hidden while custom is on. If
          // one is still visible while it should exist, the structure changed —
          // fall back to the default rail instead of showing two rails.
          if (items.length >= 2 && officialVisible()) {
            if (revertRef.current === null) {
              revertRef.current = window.setTimeout(function () {
                revertRef.current = null;
                if (!disposed && getMode() === "custom" && officialVisible()) {
                  console.error("[dsh-session-list] 未能隐藏官方导航条，已自动退回默认模式（建议更新插件）");
                  setMode("default");
                }
              }, 2000);
            }
          } else if (revertRef.current !== null) {
            window.clearTimeout(revertRef.current);
            revertRef.current = null;
          }
        }

        measure();

        var raf = 0;
        function schedule() {
          if (raf) return;
          raf = window.requestAnimationFrame(function () { raf = 0; measure(); });
        }
        var sp = scrollport();
        if (sp) sp.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule);
        var interval = window.setInterval(schedule, 900);

        return function () {
          disposed = true;
          if (raf) window.cancelAnimationFrame(raf);
          if (revertRef.current !== null) { window.clearTimeout(revertRef.current); revertRef.current = null; }
          if (sp) sp.removeEventListener("scroll", schedule);
          window.removeEventListener("resize", schedule);
          window.clearInterval(interval);
        };
      }, [enabled, items]);

      // Keep the highlighted row of the hover list in view.
      React.useEffect(function () {
        if (!hover || !tipRef.current) return;
        var idx = hoverIdx >= 0 ? hoverIdx : activeIndex(items, activeTurn);
        if (idx < 0) return;
        var row = tipRef.current.children[idx];
        if (row && row.scrollIntoView) row.scrollIntoView({ block: "nearest" });
      }, [hover, hoverIdx, activeTurn, items]);

      if (!enabled || items.length === 0 || !geom) return null;

      function jumpTo(item) {
        var sp = scrollport();
        if (!sp) return;
        var row = turnRow(item.turn);
        if (row) { scrollRowIntoView(sp, row); return; }
        var binding = sessions && sessionId !== undefined ? sessions.binding(sessionId) : null;
        var session = binding ? binding.session : null;
        if (!session || typeof session.loadThrough !== "function") return;
        Promise.resolve(session.loadThrough(item.seq)).then(function () {
          window.requestAnimationFrame(function () {
            var sp2 = scrollport();
            var row2 = turnRow(item.turn);
            if (sp2 && row2) scrollRowIntoView(sp2, row2);
          });
        }).catch(function () {});
      }

      var curIndex = hoverIdx >= 0 ? hoverIdx : activeIndex(items, activeTurn);

      var marks = [];
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var isActive = item.turn === activeTurn;
        var loaded = turnRow(item.turn) !== null;
        var cls = "sl-mark" + (isActive ? " is-active" : "") + (loaded ? "" : " is-unloaded");
        marks.push(
          React.createElement("div", {
            key: item.turn,
            className: "sl-pos",
            style: { top: INSET + i * PITCH + "px" }
          },
            React.createElement("button", {
              type: "button",
              className: cls,
              "aria-label": (loaded ? "跳转到" : "加载并跳转到") + "第 " + item.turn + " 轮",
              "aria-current": isActive ? "true" : undefined,
              onMouseEnter: function (idx) { return function () { setHover(true); setHoverIdx(idx); }; }(i),
              onClick: function (it) { return function () { jumpTo(it); }; }(item)
            })
          )
        );
      }

      var tipItems = [];
      for (var k = 0; k < items.length; k++) {
        var it = items[k];
        tipItems.push(
          React.createElement("button", {
            key: it.turn,
            type: "button",
            className: k === curIndex ? "sl-tip-item is-cur" : "sl-tip-item",
            "aria-label": "跳转到第 " + it.turn + " 轮",
            onMouseEnter: function (idx) { return function () { setHover(true); setHoverIdx(idx); }; }(k),
            onClick: function (x) { return function () { jumpTo(x); }; }(it)
          }, shortText(it.text))
        );
      }

      var scrollCls = geom.scrollable ? "sl-scroll sl-fade-bottom" : "sl-scroll";

      return React.createElement("div", {
        className: "sl-rail",
        style: { right: geom.right + "px", top: geom.top + "px", height: geom.height + "px" },
        onMouseEnter: function () { setHover(true); },
        onMouseLeave: function () { setHover(false); setHoverIdx(-1); }
      },
        React.createElement("div", { className: "sl-frame" },
          React.createElement("div", { className: scrollCls },
            React.createElement("div", { className: "sl-marks", style: { height: geom.natural + "px" } }, marks)
          )
        ),
        hover
          ? React.createElement("div", { className: "sl-tip", ref: tipRef }, tipItems)
          : null
      );
    }

    // ---------------------------------------------------------------------
    // General settings row: 默认 | 自定义
    // ---------------------------------------------------------------------
    function ModeRow() {
      var m = useMode();
      function segment(value, label) {
        return React.createElement("button", {
          key: value,
          type: "button",
          className: m === value ? "sl-seg-btn is-on" : "sl-seg-btn",
          "aria-pressed": m === value ? "true" : "false",
          onClick: function () { setMode(value); }
        }, label);
      }
      return React.createElement("div", { className: "sl-srow" },
        React.createElement("div", { className: "sl-srow-text" },
          React.createElement("div", { className: "sl-srow-title" }, "问题导航条"),
          React.createElement("div", { className: "sl-srow-desc" }, "右侧导航条：默认用官方样式，自定义用本插件的样式")
        ),
        React.createElement("div", { className: "sl-seg" },
          segment("default", "默认"),
          segment("custom", "自定义")
        )
      );
    }

    // ---------------------------------------------------------------------
    // Plugin
    // ---------------------------------------------------------------------
    var inject = ["slots", "sessions"];

    function apply(ctx) {
      ctx.effect(function () {
        var base = document.createElement("style");
        base.setAttribute("data-plugin", "dsh-session-list");
        base.textContent = BASE_CSS;
        document.head.appendChild(base);
        return function () { base.remove(); };
      }, "dsh-session-list: base css");

      ctx.effect(function () {
        var hideTag = null;
        var observer = null;
        var observed = null;

        function setHideCss(on) {
          if (on && hideTag === null) {
            hideTag = document.createElement("style");
            hideTag.setAttribute("data-plugin", "dsh-session-list-hide");
            hideTag.textContent = HIDE_CSS;
            document.head.appendChild(hideTag);
          } else if (!on && hideTag !== null) {
            hideTag.remove();
            hideTag = null;
          }
        }

        function applyInlineHide() {
          if (getMode() !== "custom") return;
          var slot = findOfficialSlot();
          if (slot && slot.style.visibility !== "hidden") slot.style.visibility = "hidden";
        }

        function clearInlineHide() {
          var sp = scrollport();
          var flow = sp ? sp.querySelector("[data-chat-flow]") : null;
          var parent = flow ? flow.parentElement : null;
          if (!parent) return;
          for (var i = 0; i < parent.children.length; i++) {
            var child = parent.children[i];
            if (child !== flow && child.style && child.style.visibility === "hidden") child.style.visibility = "";
          }
        }

        function sync() {
          var on = getMode() === "custom";
          setHideCss(on);
          if (on) applyInlineHide();
          else clearInlineHide();
        }

        function observe() {
          var sp = scrollport();
          var flow = sp ? sp.querySelector("[data-chat-flow]") : null;
          var parent = flow ? flow.parentElement : null;
          if (parent === observed) return;
          if (observer !== null) observer.disconnect();
          observed = parent;
          if (parent === null || typeof MutationObserver === "undefined") { observer = null; return; }
          observer = new MutationObserver(function () {
            if (getMode() === "custom") applyInlineHide();
            else clearInlineHide();
          });
          observer.observe(parent, { childList: true });
        }

        var raf = 0;
        function schedule() {
          if (raf) return;
          raf = window.requestAnimationFrame(function () { raf = 0; observe(); sync(); });
        }

        var stop = subscribe(schedule);
        sync();
        observe();
        window.addEventListener("resize", schedule);
        var interval = window.setInterval(schedule, 1200);

        return function () {
          stop();
          if (raf) window.cancelAnimationFrame(raf);
          if (observer !== null) observer.disconnect();
          window.removeEventListener("resize", schedule);
          window.clearInterval(interval);
          setHideCss(false);
          clearInlineHide();
        };
      }, "dsh-session-list: hide built-in rail");

      ctx.effect(function () {
        return ctx.slots.inject("conversation.input.dock", function () {
          return ctx.slots.register(
            { name: "conversation.input.dock", id: "session-list", order: 95 },
            function (props) {
              return React.createElement(QuestionRail, {
                useProjection: props.useProjection,
                sessionId: props.sessionId,
                sessions: ctx.sessions
              });
            }
          );
        });
      }, "dsh-session-list: dock");

      ctx.effect(function () {
        return ctx.slots.inject("settings.general.item", function () {
          return ctx.slots.register(
            { name: "settings.general.item", id: "session-list", order: 30 },
            function () { return React.createElement(ModeRow); }
          );
        });
      }, "dsh-session-list: settings");
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
