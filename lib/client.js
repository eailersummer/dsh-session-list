window.__ModuleLoader__.load({
  id: "dsh-session-list",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    var React = require("react");

    var CSS = [
      ".sl-rail{position:fixed;width:16px;pointer-events:auto;z-index:40;}",
      ".sl-mark{position:absolute;right:0;pointer-events:auto;padding:3px 2px;margin:-3px 0;}",
      ".sl-line{display:block;width:10px;height:2px;border-radius:1px;background:var(--dsw-alias-label-secondary,rgba(128,128,128,.5));transition:width .12s ease,background .12s ease;cursor:pointer;}",
      ".sl-mark:hover .sl-line,.sl-mark.is-active .sl-line{width:16px;background:var(--dsw-alias-brand-primary,#4d6bfe);}",
      ".sl-tip{position:absolute;right:12px;top:50%;transform:translateY(-50%);max-width:280px;max-height:60vh;overflow-y:auto;background:var(--dsw-alias-bg-overlay,#fff);border:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,.08));border-radius:8px;box-shadow:0 6px 24px rgba(0,0,0,.16);padding:4px 0;}",
      ".sl-tip-item{display:block;width:100%;text-align:left;border:none;background:transparent;padding:5px 12px 5px 16px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-primary,#222);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:280px;cursor:pointer;}",
      ".sl-tip-item:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05));}",
      ".sl-tip-item.is-cur{color:var(--dsw-alias-brand-primary,#4d6bfe);background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05));}",
      ".sl-srow{border-bottom:1px solid var(--dsw-alias-border-l2);align-items:center;gap:8px;padding:16px 0;display:flex;}",
      ".sl-srow-text{flex-direction:column;flex:1;gap:4px;min-width:0;padding-right:24px;display:flex;}",
      ".sl-srow-title{color:var(--dsw-alias-label-primary);font-size:14px;line-height:22px;}",
      ".sl-srow-desc{color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));font-size:12px;line-height:18px;}",
      ".sl-switch{position:relative;flex:none;width:36px;height:20px;border:none;border-radius:10px;background:var(--dsw-alias-border-l2,rgba(128,128,128,.4));cursor:pointer;padding:0;transition:background .15s ease;}",
      ".sl-switch.is-on{background:var(--dsw-alias-brand-primary,#4d6bfe);}",
      ".sl-switch-knob{position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.2);transition:left .15s ease;}",
      ".sl-switch.is-on .sl-switch-knob{left:18px;}"
    ].join("");

    // ---- shared enable state (persisted to localStorage) ----
    var KEY = "dsh.session-list.enabled.v1";
    var enabled = true;
    try {
      var raw = window.localStorage.getItem(KEY);
      if (raw === "0") enabled = false;
      else if (raw === "1") enabled = true;
    } catch (e) {}
    var subs = new Set();
    function getEnabled() { return enabled; }
    function setEnabled(v) {
      enabled = !!v;
      try { window.localStorage.setItem(KEY, enabled ? "1" : "0"); } catch (e) {}
      subs.forEach(function (f) { f(); });
    }
    function subscribe(fn) { subs.add(fn); return function () { subs.delete(fn); }; }
    function useEnabled() {
      var pair = React.useState(getEnabled);
      var state = pair[0];
      var setState = pair[1];
      React.useEffect(function () {
        return subscribe(function () { setState(getEnabled()); });
      }, []);
      return state;
    }

    function questionText(content) {
      var parts = [];
      if (Array.isArray(content)) {
        for (var i = 0; i < content.length; i++) {
          var b = content[i];
          if (!b) continue;
          if (b.type === "text" && typeof b.text === "string") {
            var t = b.text.trim();
            if (t) parts.push(t);
          }
        }
      }
      return parts.join(" ").trim() || "(无文本)";
    }

    function shortText(t) {
      var MAX = 16;
      return t.length > MAX ? t.slice(0, MAX) + "…" : t;
    }

    function QuestionRail(props) {
      var isOn = useEnabled();
      var session = props.session;
      var questions = React.useMemo(function () {
        if (!isOn) return [];
        var out = [];
        var nodes = session && session.nodes;
        if (nodes) {
          for (var i = 0; i < nodes.length; i++) {
            var n = nodes[i];
            if (n && n.kind === "user") out.push({ seq: n.seq, text: questionText(n.content) });
          }
        }
        return out;
      }, [session, isOn]);

      var geomPair = React.useState(null);
      var geometry = geomPair[0];
      var setGeometry = geomPair[1];
      var hoverPair = React.useState(false);
      var hover = hoverPair[0];
      var setHover = hoverPair[1];
      var hoverIdxPair = React.useState(-1);
      var hoverIndex = hoverIdxPair[0];
      var setHoverIndex = hoverIdxPair[1];

      React.useLayoutEffect(function () {
        if (!isOn) { setGeometry(null); return; }
        var SPACING = 14;
        function measure() {
          var sp = document.querySelector("[data-conversation-scroll]");
          if (!sp) { setGeometry(null); return; }
          var spRect = sp.getBoundingClientRect();
          var rows = sp.querySelectorAll('[data-chat-flow-kind="user"]');
          var right = Math.max(16, window.innerWidth - spRect.right + 16);
          var active = -1;
          var marks = [];
          for (var i = 0; i < rows.length; i++) {
            var rect = rows[i].getBoundingClientRect();
            marks.push({ y: i * SPACING });
            if (rect.top <= spRect.top + 28) active = i;
          }
          for (var j = 0; j < marks.length; j++) marks[j].active = (j === active);
          var height = marks.length > 0 ? (marks.length - 1) * SPACING + 2 : 0;
          var top = Math.max(8, spRect.top + spRect.height / 2 - height / 2);
          setGeometry({ top: top, height: height, right: right, marks: marks });
        }

        measure();

        var raf = 0;
        function onScroll() {
          if (raf) return;
          raf = window.requestAnimationFrame(function () { raf = 0; measure(); });
        }
        var ro = null;
        var sp = document.querySelector("[data-conversation-scroll]");
        if (sp) {
          sp.addEventListener("scroll", onScroll, { passive: true });
          if (typeof ResizeObserver !== "undefined") {
            ro = new ResizeObserver(onScroll);
            ro.observe(sp);
          }
        }
        window.addEventListener("resize", onScroll);

        return function () {
          var s = document.querySelector("[data-conversation-scroll]");
          if (s) s.removeEventListener("scroll", onScroll);
          if (ro) ro.disconnect();
          window.removeEventListener("resize", onScroll);
        };
      }, [questions, isOn]);

      if (!isOn || questions.length === 0) return null;

      var railStyle = geometry
        ? { top: geometry.top + "px", height: geometry.height + "px", right: geometry.right + "px" }
        : { display: "none" };
      var marks = geometry ? geometry.marks : [];

      function jumpTo(i) {
        var sp = document.querySelector("[data-conversation-scroll]");
        if (!sp) return;
        var rows = sp.querySelectorAll('[data-chat-flow-kind="user"]');
        var row = rows[i];
        if (!row) return;
        var spRect = sp.getBoundingClientRect();
        var target = row.getBoundingClientRect().top - spRect.top + sp.scrollTop - 16;
        sp.scrollTo({ top: target, behavior: "smooth" });
      }

      var curIndex = hoverIndex;
      if (curIndex < 0) {
        curIndex = -1;
        for (var k = 0; k < marks.length; k++) { if (marks[k].active) { curIndex = k; break; } }
        if (curIndex < 0) curIndex = 0;
      }

      var children = [];
      for (var m = 0; m < marks.length; m++) {
        var mark = marks[m];
        var cls = mark.active ? "sl-mark is-active" : "sl-mark";
        children.push(
          React.createElement("div", {
            key: "m" + m,
            className: cls,
            style: { top: mark.y + "px" },
            onMouseEnter: function (idx) { return function () { setHover(true); setHoverIndex(idx); }; }(m),
            onClick: function (idx) { return function () { jumpTo(idx); }; }(m)
          },
            React.createElement("span", { className: "sl-line" })
          )
        );
      }

      var tipItems = [];
      for (var q = 0; q < questions.length; q++) {
        var tcls = q === curIndex ? "sl-tip-item is-cur" : "sl-tip-item";
        tipItems.push(
          React.createElement("button", {
            key: "t" + q,
            type: "button",
            className: tcls,
            onMouseEnter: function (idx) { return function () { setHover(true); setHoverIndex(idx); }; }(q),
            onClick: function (idx) { return function () { jumpTo(idx); }; }(q)
          }, shortText(questions[q].text))
        );
      }

      return React.createElement("div", {
        className: "sl-rail",
        style: railStyle,
        onMouseEnter: function () { setHover(true); },
        onMouseLeave: function () { setHover(false); setHoverIndex(-1); }
      },
        children,
        hover ? React.createElement("div", { className: "sl-tip" }, tipItems) : null
      );
    }

    function ToggleRow() {
      var isOn = useEnabled();
      return React.createElement("div", { className: "sl-srow" },
        React.createElement("div", { className: "sl-srow-text" },
          React.createElement("div", { className: "sl-srow-title" }, "问题导航条"),
          React.createElement("div", { className: "sl-srow-desc" }, "在会话右侧显示各提问的导航横线，点击可跳转")
        ),
        React.createElement("button", {
          type: "button",
          role: "switch",
          "aria-checked": isOn ? "true" : "false",
          className: isOn ? "sl-switch is-on" : "sl-switch",
          onClick: function () { setEnabled(!isOn); }
        },
          React.createElement("span", { className: "sl-switch-knob" })
        )
      );
    }

    var inject = ["slots"];

    function apply(ctx) {
      ctx.effect(function () {
        var tag = document.createElement("style");
        tag.setAttribute("data-plugin", "dsh-session-list");
        tag.textContent = CSS;
        document.head.appendChild(tag);
        return function () { tag.remove(); };
      }, "dsh-session-list: css");

      ctx.effect(function () {
        return ctx.slots.inject("conversation.input.dock", function () {
          return ctx.slots.register(
            { name: "conversation.input.dock", id: "session-list", order: 95 },
            function (props) { return React.createElement(QuestionRail, { session: props.session }); }
          );
        });
      }, "dsh-session-list: dock");

      ctx.effect(function () {
        return ctx.slots.inject("settings.general.item", function () {
          return ctx.slots.register(
            { name: "settings.general.item", id: "session-list", order: 30 },
            function () { return React.createElement(ToggleRow); }
          );
        });
      }, "dsh-session-list: settings");
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
