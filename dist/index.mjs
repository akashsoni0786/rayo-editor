import Oe, { useRef as ee, useCallback as te, useEffect as ke, useState as P } from "react";
var re = { exports: {} }, W = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Ce;
function gr() {
  if (Ce)
    return W;
  Ce = 1;
  var a = Oe, o = Symbol.for("react.element"), n = Symbol.for("react.fragment"), s = Object.prototype.hasOwnProperty, i = a.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, l = { key: !0, ref: !0, __self: !0, __source: !0 };
  function R(v, h, x) {
    var m, E = {}, _ = null, O = null;
    x !== void 0 && (_ = "" + x), h.key !== void 0 && (_ = "" + h.key), h.ref !== void 0 && (O = h.ref);
    for (m in h)
      s.call(h, m) && !l.hasOwnProperty(m) && (E[m] = h[m]);
    if (v && v.defaultProps)
      for (m in h = v.defaultProps, h)
        E[m] === void 0 && (E[m] = h[m]);
    return { $$typeof: o, type: v, key: _, ref: O, props: E, _owner: i.current };
  }
  return W.Fragment = n, W.jsx = R, W.jsxs = R, W;
}
var L = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Pe;
function hr() {
  return Pe || (Pe = 1, process.env.NODE_ENV !== "production" && function() {
    var a = Oe, o = Symbol.for("react.element"), n = Symbol.for("react.portal"), s = Symbol.for("react.fragment"), i = Symbol.for("react.strict_mode"), l = Symbol.for("react.profiler"), R = Symbol.for("react.provider"), v = Symbol.for("react.context"), h = Symbol.for("react.forward_ref"), x = Symbol.for("react.suspense"), m = Symbol.for("react.suspense_list"), E = Symbol.for("react.memo"), _ = Symbol.for("react.lazy"), O = Symbol.for("react.offscreen"), ne = Symbol.iterator, De = "@@iterator";
    function Ie(e) {
      if (e === null || typeof e != "object")
        return null;
      var r = ne && e[ne] || e[De];
      return typeof r == "function" ? r : null;
    }
    var I = a.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function j(e) {
      {
        for (var r = arguments.length, t = new Array(r > 1 ? r - 1 : 0), u = 1; u < r; u++)
          t[u - 1] = arguments[u];
        Fe("error", e, t);
      }
    }
    function Fe(e, r, t) {
      {
        var u = I.ReactDebugCurrentFrame, d = u.getStackAddendum();
        d !== "" && (r += "%s", t = t.concat([d]));
        var g = t.map(function(f) {
          return String(f);
        });
        g.unshift("Warning: " + r), Function.prototype.apply.call(console[e], console, g);
      }
    }
    var Ae = !1, $e = !1, Me = !1, Ne = !1, We = !1, ae;
    ae = Symbol.for("react.module.reference");
    function Le(e) {
      return !!(typeof e == "string" || typeof e == "function" || e === s || e === l || We || e === i || e === x || e === m || Ne || e === O || Ae || $e || Me || typeof e == "object" && e !== null && (e.$$typeof === _ || e.$$typeof === E || e.$$typeof === R || e.$$typeof === v || e.$$typeof === h || // This needs to include all possible module reference object
      // types supported by any Flight configuration anywhere since
      // we don't know which Flight build this will end up being used
      // with.
      e.$$typeof === ae || e.getModuleId !== void 0));
    }
    function Ve(e, r, t) {
      var u = e.displayName;
      if (u)
        return u;
      var d = r.displayName || r.name || "";
      return d !== "" ? t + "(" + d + ")" : t;
    }
    function oe(e) {
      return e.displayName || "Context";
    }
    function C(e) {
      if (e == null)
        return null;
      if (typeof e.tag == "number" && j("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof e == "function")
        return e.displayName || e.name || null;
      if (typeof e == "string")
        return e;
      switch (e) {
        case s:
          return "Fragment";
        case n:
          return "Portal";
        case l:
          return "Profiler";
        case i:
          return "StrictMode";
        case x:
          return "Suspense";
        case m:
          return "SuspenseList";
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case v:
            var r = e;
            return oe(r) + ".Consumer";
          case R:
            var t = e;
            return oe(t._context) + ".Provider";
          case h:
            return Ve(e, e.render, "ForwardRef");
          case E:
            var u = e.displayName || null;
            return u !== null ? u : C(e.type) || "Memo";
          case _: {
            var d = e, g = d._payload, f = d._init;
            try {
              return C(f(g));
            } catch {
              return null;
            }
          }
        }
      return null;
    }
    var k = Object.assign, $ = 0, ie, se, ue, le, ce, fe, de;
    function pe() {
    }
    pe.__reactDisabledLog = !0;
    function Ye() {
      {
        if ($ === 0) {
          ie = console.log, se = console.info, ue = console.warn, le = console.error, ce = console.group, fe = console.groupCollapsed, de = console.groupEnd;
          var e = {
            configurable: !0,
            enumerable: !0,
            value: pe,
            writable: !0
          };
          Object.defineProperties(console, {
            info: e,
            log: e,
            warn: e,
            error: e,
            group: e,
            groupCollapsed: e,
            groupEnd: e
          });
        }
        $++;
      }
    }
    function ze() {
      {
        if ($--, $ === 0) {
          var e = {
            configurable: !0,
            enumerable: !0,
            writable: !0
          };
          Object.defineProperties(console, {
            log: k({}, e, {
              value: ie
            }),
            info: k({}, e, {
              value: se
            }),
            warn: k({}, e, {
              value: ue
            }),
            error: k({}, e, {
              value: le
            }),
            group: k({}, e, {
              value: ce
            }),
            groupCollapsed: k({}, e, {
              value: fe
            }),
            groupEnd: k({}, e, {
              value: de
            })
          });
        }
        $ < 0 && j("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
      }
    }
    var U = I.ReactCurrentDispatcher, G;
    function V(e, r, t) {
      {
        if (G === void 0)
          try {
            throw Error();
          } catch (d) {
            var u = d.stack.trim().match(/\n( *(at )?)/);
            G = u && u[1] || "";
          }
        return `
` + G + e;
      }
    }
    var J = !1, Y;
    {
      var Be = typeof WeakMap == "function" ? WeakMap : Map;
      Y = new Be();
    }
    function ve(e, r) {
      if (!e || J)
        return "";
      {
        var t = Y.get(e);
        if (t !== void 0)
          return t;
      }
      var u;
      J = !0;
      var d = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      var g;
      g = U.current, U.current = null, Ye();
      try {
        if (r) {
          var f = function() {
            throw Error();
          };
          if (Object.defineProperty(f.prototype, "props", {
            set: function() {
              throw Error();
            }
          }), typeof Reflect == "object" && Reflect.construct) {
            try {
              Reflect.construct(f, []);
            } catch (S) {
              u = S;
            }
            Reflect.construct(e, [], f);
          } else {
            try {
              f.call();
            } catch (S) {
              u = S;
            }
            e.call(f.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (S) {
            u = S;
          }
          e();
        }
      } catch (S) {
        if (S && u && typeof S.stack == "string") {
          for (var c = S.stack.split(`
`), w = u.stack.split(`
`), b = c.length - 1, y = w.length - 1; b >= 1 && y >= 0 && c[b] !== w[y]; )
            y--;
          for (; b >= 1 && y >= 0; b--, y--)
            if (c[b] !== w[y]) {
              if (b !== 1 || y !== 1)
                do
                  if (b--, y--, y < 0 || c[b] !== w[y]) {
                    var T = `
` + c[b].replace(" at new ", " at ");
                    return e.displayName && T.includes("<anonymous>") && (T = T.replace("<anonymous>", e.displayName)), typeof e == "function" && Y.set(e, T), T;
                  }
                while (b >= 1 && y >= 0);
              break;
            }
        }
      } finally {
        J = !1, U.current = g, ze(), Error.prepareStackTrace = d;
      }
      var A = e ? e.displayName || e.name : "", D = A ? V(A) : "";
      return typeof e == "function" && Y.set(e, D), D;
    }
    function Ue(e, r, t) {
      return ve(e, !1);
    }
    function Ge(e) {
      var r = e.prototype;
      return !!(r && r.isReactComponent);
    }
    function z(e, r, t) {
      if (e == null)
        return "";
      if (typeof e == "function")
        return ve(e, Ge(e));
      if (typeof e == "string")
        return V(e);
      switch (e) {
        case x:
          return V("Suspense");
        case m:
          return V("SuspenseList");
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case h:
            return Ue(e.render);
          case E:
            return z(e.type, r, t);
          case _: {
            var u = e, d = u._payload, g = u._init;
            try {
              return z(g(d), r, t);
            } catch {
            }
          }
        }
      return "";
    }
    var M = Object.prototype.hasOwnProperty, ge = {}, he = I.ReactDebugCurrentFrame;
    function B(e) {
      if (e) {
        var r = e._owner, t = z(e.type, e._source, r ? r.type : null);
        he.setExtraStackFrame(t);
      } else
        he.setExtraStackFrame(null);
    }
    function Je(e, r, t, u, d) {
      {
        var g = Function.call.bind(M);
        for (var f in e)
          if (g(e, f)) {
            var c = void 0;
            try {
              if (typeof e[f] != "function") {
                var w = Error((u || "React class") + ": " + t + " type `" + f + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof e[f] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                throw w.name = "Invariant Violation", w;
              }
              c = e[f](r, f, u, t, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
            } catch (b) {
              c = b;
            }
            c && !(c instanceof Error) && (B(d), j("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", u || "React class", t, f, typeof c), B(null)), c instanceof Error && !(c.message in ge) && (ge[c.message] = !0, B(d), j("Failed %s type: %s", t, c.message), B(null));
          }
      }
    }
    var qe = Array.isArray;
    function q(e) {
      return qe(e);
    }
    function Ke(e) {
      {
        var r = typeof Symbol == "function" && Symbol.toStringTag, t = r && e[Symbol.toStringTag] || e.constructor.name || "Object";
        return t;
      }
    }
    function He(e) {
      try {
        return me(e), !1;
      } catch {
        return !0;
      }
    }
    function me(e) {
      return "" + e;
    }
    function be(e) {
      if (He(e))
        return j("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", Ke(e)), me(e);
    }
    var N = I.ReactCurrentOwner, Xe = {
      key: !0,
      ref: !0,
      __self: !0,
      __source: !0
    }, ye, Re, K;
    K = {};
    function Ze(e) {
      if (M.call(e, "ref")) {
        var r = Object.getOwnPropertyDescriptor(e, "ref").get;
        if (r && r.isReactWarning)
          return !1;
      }
      return e.ref !== void 0;
    }
    function Qe(e) {
      if (M.call(e, "key")) {
        var r = Object.getOwnPropertyDescriptor(e, "key").get;
        if (r && r.isReactWarning)
          return !1;
      }
      return e.key !== void 0;
    }
    function er(e, r) {
      if (typeof e.ref == "string" && N.current && r && N.current.stateNode !== r) {
        var t = C(N.current.type);
        K[t] || (j('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', C(N.current.type), e.ref), K[t] = !0);
      }
    }
    function rr(e, r) {
      {
        var t = function() {
          ye || (ye = !0, j("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", r));
        };
        t.isReactWarning = !0, Object.defineProperty(e, "key", {
          get: t,
          configurable: !0
        });
      }
    }
    function tr(e, r) {
      {
        var t = function() {
          Re || (Re = !0, j("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", r));
        };
        t.isReactWarning = !0, Object.defineProperty(e, "ref", {
          get: t,
          configurable: !0
        });
      }
    }
    var nr = function(e, r, t, u, d, g, f) {
      var c = {
        // This tag allows us to uniquely identify this as a React Element
        $$typeof: o,
        // Built-in properties that belong on the element
        type: e,
        key: r,
        ref: t,
        props: f,
        // Record the component responsible for creating this element.
        _owner: g
      };
      return c._store = {}, Object.defineProperty(c._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: !1
      }), Object.defineProperty(c, "_self", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: u
      }), Object.defineProperty(c, "_source", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: d
      }), Object.freeze && (Object.freeze(c.props), Object.freeze(c)), c;
    };
    function ar(e, r, t, u, d) {
      {
        var g, f = {}, c = null, w = null;
        t !== void 0 && (be(t), c = "" + t), Qe(r) && (be(r.key), c = "" + r.key), Ze(r) && (w = r.ref, er(r, d));
        for (g in r)
          M.call(r, g) && !Xe.hasOwnProperty(g) && (f[g] = r[g]);
        if (e && e.defaultProps) {
          var b = e.defaultProps;
          for (g in b)
            f[g] === void 0 && (f[g] = b[g]);
        }
        if (c || w) {
          var y = typeof e == "function" ? e.displayName || e.name || "Unknown" : e;
          c && rr(f, y), w && tr(f, y);
        }
        return nr(e, c, w, d, u, N.current, f);
      }
    }
    var H = I.ReactCurrentOwner, xe = I.ReactDebugCurrentFrame;
    function F(e) {
      if (e) {
        var r = e._owner, t = z(e.type, e._source, r ? r.type : null);
        xe.setExtraStackFrame(t);
      } else
        xe.setExtraStackFrame(null);
    }
    var X;
    X = !1;
    function Z(e) {
      return typeof e == "object" && e !== null && e.$$typeof === o;
    }
    function Ee() {
      {
        if (H.current) {
          var e = C(H.current.type);
          if (e)
            return `

Check the render method of \`` + e + "`.";
        }
        return "";
      }
    }
    function or(e) {
      {
        if (e !== void 0) {
          var r = e.fileName.replace(/^.*[\\\/]/, ""), t = e.lineNumber;
          return `

Check your code at ` + r + ":" + t + ".";
        }
        return "";
      }
    }
    var _e = {};
    function ir(e) {
      {
        var r = Ee();
        if (!r) {
          var t = typeof e == "string" ? e : e.displayName || e.name;
          t && (r = `

Check the top-level render call using <` + t + ">.");
        }
        return r;
      }
    }
    function je(e, r) {
      {
        if (!e._store || e._store.validated || e.key != null)
          return;
        e._store.validated = !0;
        var t = ir(r);
        if (_e[t])
          return;
        _e[t] = !0;
        var u = "";
        e && e._owner && e._owner !== H.current && (u = " It was passed a child from " + C(e._owner.type) + "."), F(e), j('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', t, u), F(null);
      }
    }
    function we(e, r) {
      {
        if (typeof e != "object")
          return;
        if (q(e))
          for (var t = 0; t < e.length; t++) {
            var u = e[t];
            Z(u) && je(u, r);
          }
        else if (Z(e))
          e._store && (e._store.validated = !0);
        else if (e) {
          var d = Ie(e);
          if (typeof d == "function" && d !== e.entries)
            for (var g = d.call(e), f; !(f = g.next()).done; )
              Z(f.value) && je(f.value, r);
        }
      }
    }
    function sr(e) {
      {
        var r = e.type;
        if (r == null || typeof r == "string")
          return;
        var t;
        if (typeof r == "function")
          t = r.propTypes;
        else if (typeof r == "object" && (r.$$typeof === h || // Note: Memo only checks outer props here.
        // Inner props are checked in the reconciler.
        r.$$typeof === E))
          t = r.propTypes;
        else
          return;
        if (t) {
          var u = C(r);
          Je(t, e.props, "prop", u, e);
        } else if (r.PropTypes !== void 0 && !X) {
          X = !0;
          var d = C(r);
          j("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", d || "Unknown");
        }
        typeof r.getDefaultProps == "function" && !r.getDefaultProps.isReactClassApproved && j("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
      }
    }
    function ur(e) {
      {
        for (var r = Object.keys(e.props), t = 0; t < r.length; t++) {
          var u = r[t];
          if (u !== "children" && u !== "key") {
            F(e), j("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", u), F(null);
            break;
          }
        }
        e.ref !== null && (F(e), j("Invalid attribute `ref` supplied to `React.Fragment`."), F(null));
      }
    }
    var Se = {};
    function Te(e, r, t, u, d, g) {
      {
        var f = Le(e);
        if (!f) {
          var c = "";
          (e === void 0 || typeof e == "object" && e !== null && Object.keys(e).length === 0) && (c += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var w = or(d);
          w ? c += w : c += Ee();
          var b;
          e === null ? b = "null" : q(e) ? b = "array" : e !== void 0 && e.$$typeof === o ? (b = "<" + (C(e.type) || "Unknown") + " />", c = " Did you accidentally export a JSX literal instead of a component?") : b = typeof e, j("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", b, c);
        }
        var y = ar(e, r, t, d, g);
        if (y == null)
          return y;
        if (f) {
          var T = r.children;
          if (T !== void 0)
            if (u)
              if (q(T)) {
                for (var A = 0; A < T.length; A++)
                  we(T[A], e);
                Object.freeze && Object.freeze(T);
              } else
                j("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
            else
              we(T, e);
        }
        if (M.call(r, "key")) {
          var D = C(e), S = Object.keys(r).filter(function(vr) {
            return vr !== "key";
          }), Q = S.length > 0 ? "{key: someKey, " + S.join(": ..., ") + ": ...}" : "{key: someKey}";
          if (!Se[D + Q]) {
            var pr = S.length > 0 ? "{" + S.join(": ..., ") + ": ...}" : "{}";
            j(`A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`, Q, D, pr, D), Se[D + Q] = !0;
          }
        }
        return e === s ? ur(y) : sr(y), y;
      }
    }
    function lr(e, r, t) {
      return Te(e, r, t, !0);
    }
    function cr(e, r, t) {
      return Te(e, r, t, !1);
    }
    var fr = cr, dr = lr;
    L.Fragment = s, L.jsx = fr, L.jsxs = dr;
  }()), L;
}
process.env.NODE_ENV === "production" ? re.exports = gr() : re.exports = hr();
var p = re.exports;
const mr = ({ title: a, onTitleChange: o, readOnly: n }) => {
  const s = ee(null), i = te(() => {
    const l = s.current;
    l && (l.style.height = "auto", l.style.height = `${l.scrollHeight}px`);
  }, []);
  return ke(() => {
    i();
  }, [a, i]), /* @__PURE__ */ p.jsx(
    "textarea",
    {
      ref: s,
      value: a,
      onChange: (l) => {
        o == null || o(l.target.value), i();
      },
      placeholder: "Enter blog title...",
      className: "w-full text-2xl font-bold outline-none resize-none",
      readOnly: n,
      rows: 1,
      "data-testid": "title-textarea"
    }
  );
}, br = ({
  diffPairs: a,
  overlayHoleRect: o,
  onPairHover: n,
  onPairClick: s
}) => a.length === 0 ? null : /* @__PURE__ */ p.jsxs(
  "div",
  {
    className: "fixed inset-0 pointer-events-none",
    "data-testid": "diff-overlay",
    style: { zIndex: 40 },
    children: [
      a.map((i, l) => /* @__PURE__ */ p.jsx(
        "div",
        {
          className: "absolute border-2 border-green-400",
          style: {
            top: `${i.rect.top}px`,
            left: `${i.rect.left}px`,
            width: `${i.rect.width}px`,
            height: `${i.rect.bottom - i.rect.top}px`
          },
          onMouseEnter: () => n == null ? void 0 : n(l),
          onClick: () => s == null ? void 0 : s(l),
          "data-testid": `diff-pair-${l}`
        },
        l
      )),
      o && /* @__PURE__ */ p.jsx(
        "div",
        {
          className: "absolute pointer-events-auto",
          style: {
            top: `${o.top}px`,
            bottom: `${o.bottom}px`,
            left: 0,
            right: 0,
            zIndex: 50
          },
          "data-testid": "overlay-hole"
        }
      )
    ]
  }
), yr = () => /* @__PURE__ */ p.jsxs("svg", { width: "18", height: "18", viewBox: "0 0 18 18", fill: "none", children: [
  /* @__PURE__ */ p.jsx("path", { d: "M9 15.75C5.27175 15.75 2.25 12.7282 2.25 9C2.25 5.27175 5.27175 2.25 9 2.25C12.7282 2.25 15.75 5.27175 15.75 9C15.75 12.7282 12.7282 15.75 9 15.75Z", stroke: "white", strokeWidth: "1.5" }),
  /* @__PURE__ */ p.jsx("path", { d: "M12 7.5L8.25 11.25L6 9", stroke: "white", strokeWidth: "1.5" })
] }), Rr = () => /* @__PURE__ */ p.jsx("svg", { width: "18", height: "18", viewBox: "0 0 18 18", fill: "none", children: /* @__PURE__ */ p.jsx("path", { d: "M2.25 15.75V2.25H12.5325L15.75 5.4675V15.75H2.25ZM5.99625 2.25V5.99625M5.99625 2.25H11.9962M11.9962 2.25V5.99625M5.25 15.75V9H12.75V15.75", stroke: "#AFB0B6", strokeWidth: "1.5" }) }), xr = ({ onAccept: a, onReject: o, position: n }) => /* @__PURE__ */ p.jsxs(
  "div",
  {
    className: "fixed flex gap-2 z-50",
    style: { top: `${n.top}px`, left: `${n.left}px` },
    "data-testid": "review-buttons",
    children: [
      /* @__PURE__ */ p.jsx(
        "button",
        {
          onClick: a,
          className: "p-2 bg-green-500 rounded hover:bg-green-600",
          title: "Accept changes",
          "data-testid": "accept-button",
          children: /* @__PURE__ */ p.jsx(yr, {})
        }
      ),
      /* @__PURE__ */ p.jsx(
        "button",
        {
          onClick: o,
          className: "p-2 bg-red-500 rounded hover:bg-red-600",
          title: "Reject changes",
          "data-testid": "reject-button",
          children: /* @__PURE__ */ p.jsx(Rr, {})
        }
      )
    ]
  }
), Er = (a, o) => {
  const [n, s] = P([]), [i, l] = P(-1), [R, v] = P(-1), [h, x] = P(null), m = ee(!1), E = ee(0), _ = te(() => {
    if (!(m.current || Date.now() - E.current < 500))
      try {
        m.current = !0, s([]);
      } finally {
        m.current = !1, E.current = Date.now();
      }
  }, []);
  return ke(() => {
    _();
  }, [_]), {
    diffPairs: n,
    setDiffPairs: s,
    activePairIndex: i,
    setActivePairIndex: l,
    hoverPairIndex: R,
    setHoverPairIndex: v,
    overlayHoleRect: h,
    setOverlayHoleRect: x,
    updateDiffRanges: _
  };
}, _r = ({
  content: a,
  title: o,
  onChange: n,
  onTitleChange: s,
  isLoading: i,
  showDiffs: l,
  focusMode: R,
  readOnly: v,
  editorRef: h
}) => {
  const [x] = P({ top: 0, left: 0 }), { diffPairs: m, overlayHoleRect: E, setActivePairIndex: _ } = Er();
  return /* @__PURE__ */ p.jsxs(
    "div",
    {
      className: `rayo-blog-editor ${R ? "focus-mode" : ""}`,
      "data-testid": "blog-editor",
      children: [
        /* @__PURE__ */ p.jsx("div", { className: "mb-6", "data-testid": "title-section", children: /* @__PURE__ */ p.jsx(
          mr,
          {
            title: o,
            onTitleChange: s,
            readOnly: v
          }
        ) }),
        /* @__PURE__ */ p.jsxs("div", { className: "relative", "data-testid": "content-section", children: [
          /* @__PURE__ */ p.jsx(
            "textarea",
            {
              value: a,
              onChange: (O) => n(O.target.value),
              className: "w-full min-h-96 p-4 border rounded font-mono text-sm",
              placeholder: "Blog content...",
              readOnly: v,
              "data-testid": "content-textarea"
            }
          ),
          l && m.length > 0 && /* @__PURE__ */ p.jsxs(p.Fragment, { children: [
            /* @__PURE__ */ p.jsx(
              br,
              {
                diffPairs: m,
                overlayHoleRect: E,
                onPairClick: _
              }
            ),
            /* @__PURE__ */ p.jsx(
              xr,
              {
                onAccept: () => n(a),
                onReject: () => n(a),
                position: x
              }
            )
          ] })
        ] }),
        i && /* @__PURE__ */ p.jsx("div", { className: "mt-4 p-4 bg-gray-100 rounded", "data-testid": "loading-state", children: "Loading..." })
      ]
    }
  );
}, Sr = (a) => /* @__PURE__ */ p.jsx("div", { className: "rayo-editor", "data-testid": "rayo-editor", children: /* @__PURE__ */ p.jsx(_r, { ...a }) }), Tr = ({ isLoading: a }) => a ? /* @__PURE__ */ p.jsxs("div", { className: "flex items-center justify-center p-4", "data-testid": "image-loader", children: [
  /* @__PURE__ */ p.jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" }),
  /* @__PURE__ */ p.jsx("span", { className: "ml-2", children: "Generating image..." })
] }) : null, Cr = (a = "") => {
  const [o, n] = P(a), [s, i] = P(!1), [l, R] = P(null), v = te((h) => {
    try {
      i(!0), R(null), n(h);
    } catch (x) {
      R(x instanceof Error ? x : new Error("Unknown error"));
    } finally {
      i(!1);
    }
  }, []);
  return {
    content: o,
    setContent: n,
    isProcessing: s,
    error: l,
    processContent: v
  };
}, Pr = (a) => {
  try {
    const o = /<(ins|del)\b/i.test(a) || /data-color="#c7f0d6ff"/i.test(a) || /data-color="#fecaca"/i.test(a) || /data-pending-delete="true"/i.test(a) || /data-pending-insert="true"/i.test(a), n = [];
    if (!o)
      return { hasDiffs: !1, markers: [] };
    const s = /<ins\b[^>]*>([\s\S]*?)<\/ins>/gi;
    let i;
    for (; (i = s.exec(a)) !== null; )
      n.push({
        type: "insertion",
        from: i.index,
        to: i.index + i[0].length
      });
    const l = /<del\b[^>]*>([\s\S]*?)<\/del>/gi;
    for (; (i = l.exec(a)) !== null; )
      n.push({
        type: "deletion",
        from: i.index,
        to: i.index + i[0].length
      });
    return /data-color="#c7f0d6ff"/i.test(a) && n.push({
      type: "highlight",
      color: "#c7f0d6ff"
    }), /data-color="#fecaca"/i.test(a) && n.push({
      type: "highlight",
      color: "#fecaca"
    }), { hasDiffs: !0, markers: n };
  } catch (o) {
    return console.warn("Diff detection failed:", o), { hasDiffs: !1, markers: [] };
  }
}, Or = (a) => {
  try {
    return a.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/g, "-").replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, " ").replace(/[\u2018\u2019\u201A\u201B]/g, "'").replace(/[\u201C\u201D\u201E\u201F]/g, '"').replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/\s+/g, " ").trim();
  } catch (o) {
    return console.warn("Text normalization failed:", o), a;
  }
}, kr = (a) => [];
function jr(a) {
  if (a.length === 0)
    return [];
  const o = [...a].sort((i, l) => i.from - l.from), n = [];
  let s = o[0];
  for (let i = 1; i < o.length; i++) {
    const l = o[i];
    l.from <= s.to ? s = {
      from: s.from,
      to: Math.max(s.to, l.to)
    } : (n.push(s), s = l);
  }
  return n.push(s), n;
}
function Dr(a, o) {
  return a.substring(o.from, o.to);
}
function Ir(a) {
  const o = a.filter((n) => n.from < n.to);
  return jr(o);
}
const Fr = (a) => {
  if (a.length === 0)
    return [];
  const o = [];
  let n = [];
  for (const s of a)
    if (n.length === 0)
      n.push(s);
    else {
      const i = n[n.length - 1];
      s.pos === i.pos + i.nodeSize ? n.push(s) : (o.push(n), n = [s]);
    }
  return n.length > 0 && o.push(n), o;
}, Ar = (a, o) => {
  const n = [], s = /* @__PURE__ */ new Set();
  for (const i of a) {
    const l = [];
    let R = i.pos + i.nodeSize;
    for (let v = 0; v < o.length; v++)
      s.has(v) || o[v].pos === R && (l.push(o[v]), s.add(v), R = o[v].pos + o[v].nodeSize);
    l.length > 0 ? n.push({
      redRange: { from: i.pos, to: i.pos + i.nodeSize },
      greenRange: {
        from: l[0].pos,
        to: l[l.length - 1].pos + l[l.length - 1].nodeSize
      },
      rect: i.rect,
      lastGreenRect: l[l.length - 1].rect,
      isImageReplacement: !0,
      newImagesCount: l.length
    }) : n.push({
      redRange: { from: i.pos, to: i.pos + i.nodeSize },
      greenRange: void 0,
      rect: i.rect,
      lastGreenRect: i.rect,
      isImageDeletion: !0
    });
  }
  return n;
}, $r = (a, o) => {
  const n = Math.abs(a.from - o.to), s = Math.abs(o.from - a.to);
  return Math.min(n, s);
}, Mr = (a, o, n) => {
  var l, R, v, h;
  if (n.length <= 1)
    return n[0] || null;
  let s = null, i = 1 / 0;
  for (const x of n) {
    const m = Math.min(((l = x.redRange) == null ? void 0 : l.from) ?? 1 / 0, ((R = x.greenRange) == null ? void 0 : R.from) ?? 1 / 0), E = Math.max(((v = x.redRange) == null ? void 0 : v.to) ?? 0, ((h = x.greenRange) == null ? void 0 : h.to) ?? 0), _ = Math.min(
      Math.abs(a - m),
      Math.abs(a - E)
    );
    _ < i && (i = _, s = x);
  }
  return s;
}, Nr = (a) => {
  if (a.length === 0)
    return [];
  const o = [];
  let n = [];
  for (const s of a)
    if (n.length === 0)
      n.push(s);
    else {
      const i = n[n.length - 1];
      s.pos === i.pos + i.nodeSize ? n.push(s) : (o.push(n), n = [s]);
    }
  return n.length > 0 && o.push(n), o;
};
class Wr extends Error {
  /**
   * Create a new DiffProcessingError
   * @param message - Error message
   * @param context - Additional context object for debugging
   */
  constructor(o, n) {
    super(o), this.context = n, this.name = "DiffProcessingError";
  }
}
const Lr = (a, o) => {
  try {
    return a();
  } catch (n) {
    return console.warn("Error in diff processing:", n), o;
  }
};
export {
  _r as BlogEditor,
  br as DiffOverlay,
  Wr as DiffProcessingError,
  Tr as ImageGenerationLoader,
  Sr as RayoEditor,
  xr as ReviewButtons,
  mr as TitleTextarea,
  $r as calculateProximity,
  Pr as detectDiffMarkers,
  kr as extractDiffRanges,
  Dr as extractTextContent,
  Mr as findOwnerTextPair,
  Fr as groupConsecutiveImages,
  Nr as groupConsecutiveItems,
  Ar as matchImageReplacements,
  jr as mergeConsecutiveRanges,
  Or as normalizeDiffText,
  Ir as optimizeRanges,
  Lr as safeExecute,
  Cr as useContentProcessing,
  Er as useEditorDiff
};
