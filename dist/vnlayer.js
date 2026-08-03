var __vnlayerBundleInit = (() => {
  var sS = Object.create;
  var sh = Object.defineProperty;
  var oS = Object.getOwnPropertyDescriptor;
  var cS = Object.getOwnPropertyNames;
  var fS = Object.getPrototypeOf,
    hS = Object.prototype.hasOwnProperty;
  var un = (e, t) => () => (
    t || e((t = { exports: {} }).exports, t),
    t.exports
  );
  var dS = (e, t, n, a) => {
    if ((t && typeof t == "object") || typeof t == "function")
      for (let i of cS(t))
        !hS.call(e, i) &&
          i !== n &&
          sh(e, i, {
            get: () => t[i],
            enumerable: !(a = oS(t, i)) || a.enumerable,
          });
    return e;
  };
  var se = (e, t, n) => (
    (n = e != null ? sS(fS(e)) : {}),
    dS(
      t || !e || !e.__esModule
        ? sh(n, "default", { value: e, enumerable: !0 })
        : n,
      e,
    )
  );
  var Ah = un((Ct) => {
    "use strict";
    function Ms(e, t) {
      var n = e.length;
      e.push(t);
      t: for (; 0 < n;) {
        var a = (n - 1) >>> 1,
          i = e[a];
        if (0 < Nr(i, t)) ((e[a] = t), (e[n] = i), (n = a));
        else break t;
      }
    }
    function sn(e) {
      return e.length === 0 ? null : e[0];
    }
    function xr(e) {
      if (e.length === 0) return null;
      var t = e[0],
        n = e.pop();
      if (n !== t) {
        e[0] = n;
        t: for (var a = 0, i = e.length, l = i >>> 1; a < l;) {
          var r = 2 * (a + 1) - 1,
            u = e[r],
            s = r + 1,
            o = e[s];
          if (0 > Nr(u, n))
            s < i && 0 > Nr(o, u)
              ? ((e[a] = o), (e[s] = n), (a = s))
              : ((e[a] = u), (e[r] = n), (a = r));
          else if (s < i && 0 > Nr(o, n)) ((e[a] = o), (e[s] = n), (a = s));
          else break t;
        }
      }
      return t;
    }
    function Nr(e, t) {
      var n = e.sortIndex - t.sortIndex;
      return n !== 0 ? n : e.id - t.id;
    }
    Ct.unstable_now = void 0;
    typeof performance == "object" && typeof performance.now == "function"
      ? ((gh = performance),
        (Ct.unstable_now = function () {
          return gh.now();
        }))
      : ((Ns = Date),
        (ph = Ns.now()),
        (Ct.unstable_now = function () {
          return Ns.now() - ph;
        }));
    var gh,
      Ns,
      ph,
      Sn = [],
      qn = [],
      pS = 1,
      Ge = null,
      ae = 3,
      Ds = !1,
      nl = !1,
      al = !1,
      Rs = !1,
      Sh = typeof setTimeout == "function" ? setTimeout : null,
      bh = typeof clearTimeout == "function" ? clearTimeout : null,
      yh = typeof setImmediate != "undefined" ? setImmediate : null;
    function wr(e) {
      for (var t = sn(qn); t !== null;) {
        if (t.callback === null) xr(qn);
        else if (t.startTime <= e)
          (xr(qn), (t.sortIndex = t.expirationTime), Ms(Sn, t));
        else break;
        t = sn(qn);
      }
    }
    function zs(e) {
      if (((al = !1), wr(e), !nl))
        if (sn(Sn) !== null) ((nl = !0), $a || (($a = !0), Ja()));
        else {
          var t = sn(qn);
          t !== null && Vs(zs, t.startTime - e);
        }
    }
    var $a = !1,
      il = -1,
      Ch = 5,
      Th = -1;
    function Eh() {
      return Rs ? !0 : !(Ct.unstable_now() - Th < Ch);
    }
    function ws() {
      if (((Rs = !1), $a)) {
        var e = Ct.unstable_now();
        Th = e;
        var t = !0;
        try {
          t: {
            ((nl = !1), al && ((al = !1), bh(il), (il = -1)), (Ds = !0));
            var n = ae;
            try {
              e: {
                for (
                  wr(e), Ge = sn(Sn);
                  Ge !== null && !(Ge.expirationTime > e && Eh());
                ) {
                  var a = Ge.callback;
                  if (typeof a == "function") {
                    ((Ge.callback = null), (ae = Ge.priorityLevel));
                    var i = a(Ge.expirationTime <= e);
                    if (((e = Ct.unstable_now()), typeof i == "function")) {
                      ((Ge.callback = i), wr(e), (t = !0));
                      break e;
                    }
                    (Ge === sn(Sn) && xr(Sn), wr(e));
                  } else xr(Sn);
                  Ge = sn(Sn);
                }
                if (Ge !== null) t = !0;
                else {
                  var l = sn(qn);
                  (l !== null && Vs(zs, l.startTime - e), (t = !1));
                }
              }
              break t;
            } finally {
              ((Ge = null), (ae = n), (Ds = !1));
            }
            t = void 0;
          }
        } finally {
          t ? Ja() : ($a = !1);
        }
      }
    }
    var Ja;
    typeof yh == "function"
      ? (Ja = function () {
          yh(ws);
        })
      : typeof MessageChannel != "undefined"
        ? ((xs = new MessageChannel()),
          (vh = xs.port2),
          (xs.port1.onmessage = ws),
          (Ja = function () {
            vh.postMessage(null);
          }))
        : (Ja = function () {
            Sh(ws, 0);
          });
    var xs, vh;
    function Vs(e, t) {
      il = Sh(function () {
        e(Ct.unstable_now());
      }, t);
    }
    Ct.unstable_IdlePriority = 5;
    Ct.unstable_ImmediatePriority = 1;
    Ct.unstable_LowPriority = 4;
    Ct.unstable_NormalPriority = 3;
    Ct.unstable_Profiling = null;
    Ct.unstable_UserBlockingPriority = 2;
    Ct.unstable_cancelCallback = function (e) {
      e.callback = null;
    };
    Ct.unstable_forceFrameRate = function (e) {
      0 > e || 125 < e
        ? console.error(
            "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported",
          )
        : (Ch = 0 < e ? Math.floor(1e3 / e) : 5);
    };
    Ct.unstable_getCurrentPriorityLevel = function () {
      return ae;
    };
    Ct.unstable_next = function (e) {
      switch (ae) {
        case 1:
        case 2:
        case 3:
          var t = 3;
          break;
        default:
          t = ae;
      }
      var n = ae;
      ae = t;
      try {
        return e();
      } finally {
        ae = n;
      }
    };
    Ct.unstable_requestPaint = function () {
      Rs = !0;
    };
    Ct.unstable_runWithPriority = function (e, t) {
      switch (e) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          e = 3;
      }
      var n = ae;
      ae = e;
      try {
        return t();
      } finally {
        ae = n;
      }
    };
    Ct.unstable_scheduleCallback = function (e, t, n) {
      var a = Ct.unstable_now();
      switch (
        (typeof n == "object" && n !== null
          ? ((n = n.delay), (n = typeof n == "number" && 0 < n ? a + n : a))
          : (n = a),
        e)
      ) {
        case 1:
          var i = -1;
          break;
        case 2:
          i = 250;
          break;
        case 5:
          i = 1073741823;
          break;
        case 4:
          i = 1e4;
          break;
        default:
          i = 5e3;
      }
      return (
        (i = n + i),
        (e = {
          id: pS++,
          callback: t,
          priorityLevel: e,
          startTime: n,
          expirationTime: i,
          sortIndex: -1,
        }),
        n > a
          ? ((e.sortIndex = n),
            Ms(qn, e),
            sn(Sn) === null &&
              e === sn(qn) &&
              (al ? (bh(il), (il = -1)) : (al = !0), Vs(zs, n - a)))
          : ((e.sortIndex = i),
            Ms(Sn, e),
            nl || Ds || ((nl = !0), $a || (($a = !0), Ja()))),
        e
      );
    };
    Ct.unstable_shouldYield = Eh;
    Ct.unstable_wrapCallback = function (e) {
      var t = ae;
      return function () {
        var n = ae;
        ae = t;
        try {
          return e.apply(this, arguments);
        } finally {
          ae = n;
        }
      };
    };
  });
  var Oh = un((UC, _h) => {
    "use strict";
    _h.exports = Ah();
  });
  var Uh = un((L) => {
    "use strict";
    var Us = Symbol.for("react.transitional.element"),
      yS = Symbol.for("react.portal"),
      vS = Symbol.for("react.fragment"),
      SS = Symbol.for("react.strict_mode"),
      bS = Symbol.for("react.profiler"),
      CS = Symbol.for("react.consumer"),
      TS = Symbol.for("react.context"),
      ES = Symbol.for("react.forward_ref"),
      AS = Symbol.for("react.suspense"),
      _S = Symbol.for("react.memo"),
      Dh = Symbol.for("react.lazy"),
      OS = Symbol.for("react.activity"),
      Nh = Symbol.iterator;
    function NS(e) {
      return e === null || typeof e != "object"
        ? null
        : ((e = (Nh && e[Nh]) || e["@@iterator"]),
          typeof e == "function" ? e : null);
    }
    var Rh = {
        isMounted: function () {
          return !1;
        },
        enqueueForceUpdate: function () {},
        enqueueReplaceState: function () {},
        enqueueSetState: function () {},
      },
      zh = Object.assign,
      Vh = {};
    function ei(e, t, n) {
      ((this.props = e),
        (this.context = t),
        (this.refs = Vh),
        (this.updater = n || Rh));
    }
    ei.prototype.isReactComponent = {};
    ei.prototype.setState = function (e, t) {
      if (typeof e != "object" && typeof e != "function" && e != null)
        throw Error(
          "takes an object of state variables to update or a function which returns an object of state variables.",
        );
      this.updater.enqueueSetState(this, e, t, "setState");
    };
    ei.prototype.forceUpdate = function (e) {
      this.updater.enqueueForceUpdate(this, e, "forceUpdate");
    };
    function kh() {}
    kh.prototype = ei.prototype;
    function Bs(e, t, n) {
      ((this.props = e),
        (this.context = t),
        (this.refs = Vh),
        (this.updater = n || Rh));
    }
    var js = (Bs.prototype = new kh());
    js.constructor = Bs;
    zh(js, ei.prototype);
    js.isPureReactComponent = !0;
    var wh = Array.isArray;
    function Ls() {}
    var gt = { H: null, A: null, T: null, S: null },
      Lh = Object.prototype.hasOwnProperty;
    function Gs(e, t, n) {
      var a = n.ref;
      return {
        $$typeof: Us,
        type: e,
        key: t,
        ref: a !== void 0 ? a : null,
        props: n,
      };
    }
    function wS(e, t) {
      return Gs(e.type, t, e.props);
    }
    function Hs(e) {
      return typeof e == "object" && e !== null && e.$$typeof === Us;
    }
    function xS(e) {
      var t = { "=": "=0", ":": "=2" };
      return (
        "$" +
        e.replace(/[=:]/g, function (n) {
          return t[n];
        })
      );
    }
    var xh = /\/+/g;
    function ks(e, t) {
      return typeof e == "object" && e !== null && e.key != null
        ? xS("" + e.key)
        : t.toString(36);
    }
    function MS(e) {
      switch (e.status) {
        case "fulfilled":
          return e.value;
        case "rejected":
          throw e.reason;
        default:
          switch (
            (typeof e.status == "string"
              ? e.then(Ls, Ls)
              : ((e.status = "pending"),
                e.then(
                  function (t) {
                    e.status === "pending" &&
                      ((e.status = "fulfilled"), (e.value = t));
                  },
                  function (t) {
                    e.status === "pending" &&
                      ((e.status = "rejected"), (e.reason = t));
                  },
                )),
            e.status)
          ) {
            case "fulfilled":
              return e.value;
            case "rejected":
              throw e.reason;
          }
      }
      throw e;
    }
    function ti(e, t, n, a, i) {
      var l = typeof e;
      (l === "undefined" || l === "boolean") && (e = null);
      var r = !1;
      if (e === null) r = !0;
      else
        switch (l) {
          case "bigint":
          case "string":
          case "number":
            r = !0;
            break;
          case "object":
            switch (e.$$typeof) {
              case Us:
              case yS:
                r = !0;
                break;
              case Dh:
                return ((r = e._init), ti(r(e._payload), t, n, a, i));
            }
        }
      if (r)
        return (
          (i = i(e)),
          (r = a === "" ? "." + ks(e, 0) : a),
          wh(i)
            ? ((n = ""),
              r != null && (n = r.replace(xh, "$&/") + "/"),
              ti(i, t, n, "", function (o) {
                return o;
              }))
            : i != null &&
              (Hs(i) &&
                (i = wS(
                  i,
                  n +
                    (i.key == null || (e && e.key === i.key)
                      ? ""
                      : ("" + i.key).replace(xh, "$&/") + "/") +
                    r,
                )),
              t.push(i)),
          1
        );
      r = 0;
      var u = a === "" ? "." : a + ":";
      if (wh(e))
        for (var s = 0; s < e.length; s++)
          ((a = e[s]), (l = u + ks(a, s)), (r += ti(a, t, n, l, i)));
      else if (((s = NS(e)), typeof s == "function"))
        for (e = s.call(e), s = 0; !(a = e.next()).done;)
          ((a = a.value), (l = u + ks(a, s++)), (r += ti(a, t, n, l, i)));
      else if (l === "object") {
        if (typeof e.then == "function") return ti(MS(e), t, n, a, i);
        throw (
          (t = String(e)),
          Error(
            "Objects are not valid as a React child (found: " +
              (t === "[object Object]"
                ? "object with keys {" + Object.keys(e).join(", ") + "}"
                : t) +
              "). If you meant to render a collection of children, use an array instead.",
          )
        );
      }
      return r;
    }
    function Mr(e, t, n) {
      if (e == null) return e;
      var a = [],
        i = 0;
      return (
        ti(e, a, "", "", function (l) {
          return t.call(n, l, i++);
        }),
        a
      );
    }
    function DS(e) {
      if (e._status === -1) {
        var t = e._result;
        ((t = t()),
          t.then(
            function (n) {
              (e._status === 0 || e._status === -1) &&
                ((e._status = 1), (e._result = n));
            },
            function (n) {
              (e._status === 0 || e._status === -1) &&
                ((e._status = 2), (e._result = n));
            },
          ),
          e._status === -1 && ((e._status = 0), (e._result = t)));
      }
      if (e._status === 1) return e._result.default;
      throw e._result;
    }
    var Mh =
        typeof reportError == "function"
          ? reportError
          : function (e) {
              if (
                typeof window == "object" &&
                typeof window.ErrorEvent == "function"
              ) {
                var t = new window.ErrorEvent("error", {
                  bubbles: !0,
                  cancelable: !0,
                  message:
                    typeof e == "object" &&
                    e !== null &&
                    typeof e.message == "string"
                      ? String(e.message)
                      : String(e),
                  error: e,
                });
                if (!window.dispatchEvent(t)) return;
              } else if (
                typeof process == "object" &&
                typeof process.emit == "function"
              ) {
                process.emit("uncaughtException", e);
                return;
              }
              console.error(e);
            },
      RS = {
        map: Mr,
        forEach: function (e, t, n) {
          Mr(
            e,
            function () {
              t.apply(this, arguments);
            },
            n,
          );
        },
        count: function (e) {
          var t = 0;
          return (
            Mr(e, function () {
              t++;
            }),
            t
          );
        },
        toArray: function (e) {
          return (
            Mr(e, function (t) {
              return t;
            }) || []
          );
        },
        only: function (e) {
          if (!Hs(e))
            throw Error(
              "React.Children.only expected to receive a single React element child.",
            );
          return e;
        },
      };
    L.Activity = OS;
    L.Children = RS;
    L.Component = ei;
    L.Fragment = vS;
    L.Profiler = bS;
    L.PureComponent = Bs;
    L.StrictMode = SS;
    L.Suspense = AS;
    L.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = gt;
    L.__COMPILER_RUNTIME = {
      __proto__: null,
      c: function (e) {
        return gt.H.useMemoCache(e);
      },
    };
    L.cache = function (e) {
      return function () {
        return e.apply(null, arguments);
      };
    };
    L.cacheSignal = function () {
      return null;
    };
    L.cloneElement = function (e, t, n) {
      if (e == null)
        throw Error(
          "The argument must be a React element, but you passed " + e + ".",
        );
      var a = zh({}, e.props),
        i = e.key;
      if (t != null)
        for (l in (t.key !== void 0 && (i = "" + t.key), t))
          !Lh.call(t, l) ||
            l === "key" ||
            l === "__self" ||
            l === "__source" ||
            (l === "ref" && t.ref === void 0) ||
            (a[l] = t[l]);
      var l = arguments.length - 2;
      if (l === 1) a.children = n;
      else if (1 < l) {
        for (var r = Array(l), u = 0; u < l; u++) r[u] = arguments[u + 2];
        a.children = r;
      }
      return Gs(e.type, i, a);
    };
    L.createContext = function (e) {
      return (
        (e = {
          $$typeof: TS,
          _currentValue: e,
          _currentValue2: e,
          _threadCount: 0,
          Provider: null,
          Consumer: null,
        }),
        (e.Provider = e),
        (e.Consumer = { $$typeof: CS, _context: e }),
        e
      );
    };
    L.createElement = function (e, t, n) {
      var a,
        i = {},
        l = null;
      if (t != null)
        for (a in (t.key !== void 0 && (l = "" + t.key), t))
          Lh.call(t, a) &&
            a !== "key" &&
            a !== "__self" &&
            a !== "__source" &&
            (i[a] = t[a]);
      var r = arguments.length - 2;
      if (r === 1) i.children = n;
      else if (1 < r) {
        for (var u = Array(r), s = 0; s < r; s++) u[s] = arguments[s + 2];
        i.children = u;
      }
      if (e && e.defaultProps)
        for (a in ((r = e.defaultProps), r)) i[a] === void 0 && (i[a] = r[a]);
      return Gs(e, l, i);
    };
    L.createRef = function () {
      return { current: null };
    };
    L.forwardRef = function (e) {
      return { $$typeof: ES, render: e };
    };
    L.isValidElement = Hs;
    L.lazy = function (e) {
      return { $$typeof: Dh, _payload: { _status: -1, _result: e }, _init: DS };
    };
    L.memo = function (e, t) {
      return { $$typeof: _S, type: e, compare: t === void 0 ? null : t };
    };
    L.startTransition = function (e) {
      var t = gt.T,
        n = {};
      gt.T = n;
      try {
        var a = e(),
          i = gt.S;
        (i !== null && i(n, a),
          typeof a == "object" &&
            a !== null &&
            typeof a.then == "function" &&
            a.then(Ls, Mh));
      } catch (l) {
        Mh(l);
      } finally {
        (t !== null && n.types !== null && (t.types = n.types), (gt.T = t));
      }
    };
    L.unstable_useCacheRefresh = function () {
      return gt.H.useCacheRefresh();
    };
    L.use = function (e) {
      return gt.H.use(e);
    };
    L.useActionState = function (e, t, n) {
      return gt.H.useActionState(e, t, n);
    };
    L.useCallback = function (e, t) {
      return gt.H.useCallback(e, t);
    };
    L.useContext = function (e) {
      return gt.H.useContext(e);
    };
    L.useDebugValue = function () {};
    L.useDeferredValue = function (e, t) {
      return gt.H.useDeferredValue(e, t);
    };
    L.useEffect = function (e, t) {
      return gt.H.useEffect(e, t);
    };
    L.useEffectEvent = function (e) {
      return gt.H.useEffectEvent(e);
    };
    L.useId = function () {
      return gt.H.useId();
    };
    L.useImperativeHandle = function (e, t, n) {
      return gt.H.useImperativeHandle(e, t, n);
    };
    L.useInsertionEffect = function (e, t) {
      return gt.H.useInsertionEffect(e, t);
    };
    L.useLayoutEffect = function (e, t) {
      return gt.H.useLayoutEffect(e, t);
    };
    L.useMemo = function (e, t) {
      return gt.H.useMemo(e, t);
    };
    L.useOptimistic = function (e, t) {
      return gt.H.useOptimistic(e, t);
    };
    L.useReducer = function (e, t, n) {
      return gt.H.useReducer(e, t, n);
    };
    L.useRef = function (e) {
      return gt.H.useRef(e);
    };
    L.useState = function (e) {
      return gt.H.useState(e);
    };
    L.useSyncExternalStore = function (e, t, n) {
      return gt.H.useSyncExternalStore(e, t, n);
    };
    L.useTransition = function () {
      return gt.H.useTransition();
    };
    L.version = "19.2.7";
  });
  var bn = un((jC, Bh) => {
    "use strict";
    Bh.exports = Uh();
  });
  var Gh = un((ce) => {
    "use strict";
    var zS = bn();
    function jh(e) {
      var t = "https://react.dev/errors/" + e;
      if (1 < arguments.length) {
        t += "?args[]=" + encodeURIComponent(arguments[1]);
        for (var n = 2; n < arguments.length; n++)
          t += "&args[]=" + encodeURIComponent(arguments[n]);
      }
      return (
        "Minified React error #" +
        e +
        "; visit " +
        t +
        " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
      );
    }
    function Yn() {}
    var oe = {
        d: {
          f: Yn,
          r: function () {
            throw Error(jh(522));
          },
          D: Yn,
          C: Yn,
          L: Yn,
          m: Yn,
          X: Yn,
          S: Yn,
          M: Yn,
        },
        p: 0,
        findDOMNode: null,
      },
      VS = Symbol.for("react.portal");
    function kS(e, t, n) {
      var a =
        3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
      return {
        $$typeof: VS,
        key: a == null ? null : "" + a,
        children: e,
        containerInfo: t,
        implementation: n,
      };
    }
    var ll = zS.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
    function Dr(e, t) {
      if (e === "font") return "";
      if (typeof t == "string") return t === "use-credentials" ? t : "";
    }
    ce.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = oe;
    ce.createPortal = function (e, t) {
      var n =
        2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
      if (!t || (t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11))
        throw Error(jh(299));
      return kS(e, t, null, n);
    };
    ce.flushSync = function (e) {
      var t = ll.T,
        n = oe.p;
      try {
        if (((ll.T = null), (oe.p = 2), e)) return e();
      } finally {
        ((ll.T = t), (oe.p = n), oe.d.f());
      }
    };
    ce.preconnect = function (e, t) {
      typeof e == "string" &&
        (t
          ? ((t = t.crossOrigin),
            (t =
              typeof t == "string"
                ? t === "use-credentials"
                  ? t
                  : ""
                : void 0))
          : (t = null),
        oe.d.C(e, t));
    };
    ce.prefetchDNS = function (e) {
      typeof e == "string" && oe.d.D(e);
    };
    ce.preinit = function (e, t) {
      if (typeof e == "string" && t && typeof t.as == "string") {
        var n = t.as,
          a = Dr(n, t.crossOrigin),
          i = typeof t.integrity == "string" ? t.integrity : void 0,
          l = typeof t.fetchPriority == "string" ? t.fetchPriority : void 0;
        n === "style"
          ? oe.d.S(e, typeof t.precedence == "string" ? t.precedence : void 0, {
              crossOrigin: a,
              integrity: i,
              fetchPriority: l,
            })
          : n === "script" &&
            oe.d.X(e, {
              crossOrigin: a,
              integrity: i,
              fetchPriority: l,
              nonce: typeof t.nonce == "string" ? t.nonce : void 0,
            });
      }
    };
    ce.preinitModule = function (e, t) {
      if (typeof e == "string")
        if (typeof t == "object" && t !== null) {
          if (t.as == null || t.as === "script") {
            var n = Dr(t.as, t.crossOrigin);
            oe.d.M(e, {
              crossOrigin: n,
              integrity: typeof t.integrity == "string" ? t.integrity : void 0,
              nonce: typeof t.nonce == "string" ? t.nonce : void 0,
            });
          }
        } else t == null && oe.d.M(e);
    };
    ce.preload = function (e, t) {
      if (
        typeof e == "string" &&
        typeof t == "object" &&
        t !== null &&
        typeof t.as == "string"
      ) {
        var n = t.as,
          a = Dr(n, t.crossOrigin);
        oe.d.L(e, n, {
          crossOrigin: a,
          integrity: typeof t.integrity == "string" ? t.integrity : void 0,
          nonce: typeof t.nonce == "string" ? t.nonce : void 0,
          type: typeof t.type == "string" ? t.type : void 0,
          fetchPriority:
            typeof t.fetchPriority == "string" ? t.fetchPriority : void 0,
          referrerPolicy:
            typeof t.referrerPolicy == "string" ? t.referrerPolicy : void 0,
          imageSrcSet:
            typeof t.imageSrcSet == "string" ? t.imageSrcSet : void 0,
          imageSizes: typeof t.imageSizes == "string" ? t.imageSizes : void 0,
          media: typeof t.media == "string" ? t.media : void 0,
        });
      }
    };
    ce.preloadModule = function (e, t) {
      if (typeof e == "string")
        if (t) {
          var n = Dr(t.as, t.crossOrigin);
          oe.d.m(e, {
            as: typeof t.as == "string" && t.as !== "script" ? t.as : void 0,
            crossOrigin: n,
            integrity: typeof t.integrity == "string" ? t.integrity : void 0,
          });
        } else oe.d.m(e);
    };
    ce.requestFormReset = function (e) {
      oe.d.r(e);
    };
    ce.unstable_batchedUpdates = function (e, t) {
      return e(t);
    };
    ce.useFormState = function (e, t, n) {
      return ll.H.useFormState(e, t, n);
    };
    ce.useFormStatus = function () {
      return ll.H.useHostTransitionStatus();
    };
    ce.version = "19.2.7";
  });
  var Fh = un((HC, Wh) => {
    "use strict";
    function Hh() {
      if (!(
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ == "undefined" ||
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"
      ))
        try {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Hh);
        } catch (e) {
          console.error(e);
        }
    }
    (Hh(), (Wh.exports = Gh()));
  });
  var ey = un((ns) => {
    "use strict";
    var Ht = Oh(),
      gm = bn(),
      LS = Fh();
    function v(e) {
      var t = "https://react.dev/errors/" + e;
      if (1 < arguments.length) {
        t += "?args[]=" + encodeURIComponent(arguments[1]);
        for (var n = 2; n < arguments.length; n++)
          t += "&args[]=" + encodeURIComponent(arguments[n]);
      }
      return (
        "Minified React error #" +
        e +
        "; visit " +
        t +
        " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
      );
    }
    function pm(e) {
      return !(
        !e ||
        (e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11)
      );
    }
    function Yl(e) {
      var t = e,
        n = e;
      if (e.alternate) for (; t.return;) t = t.return;
      else {
        e = t;
        do ((t = e), t.flags & 4098 && (n = t.return), (e = t.return));
        while (e);
      }
      return t.tag === 3 ? n : null;
    }
    function ym(e) {
      if (e.tag === 13) {
        var t = e.memoizedState;
        if (
          (t === null &&
            ((e = e.alternate), e !== null && (t = e.memoizedState)),
          t !== null)
        )
          return t.dehydrated;
      }
      return null;
    }
    function vm(e) {
      if (e.tag === 31) {
        var t = e.memoizedState;
        if (
          (t === null &&
            ((e = e.alternate), e !== null && (t = e.memoizedState)),
          t !== null)
        )
          return t.dehydrated;
      }
      return null;
    }
    function qh(e) {
      if (Yl(e) !== e) throw Error(v(188));
    }
    function US(e) {
      var t = e.alternate;
      if (!t) {
        if (((t = Yl(e)), t === null)) throw Error(v(188));
        return t !== e ? null : e;
      }
      for (var n = e, a = t; ;) {
        var i = n.return;
        if (i === null) break;
        var l = i.alternate;
        if (l === null) {
          if (((a = i.return), a !== null)) {
            n = a;
            continue;
          }
          break;
        }
        if (i.child === l.child) {
          for (l = i.child; l;) {
            if (l === n) return (qh(i), e);
            if (l === a) return (qh(i), t);
            l = l.sibling;
          }
          throw Error(v(188));
        }
        if (n.return !== a.return) ((n = i), (a = l));
        else {
          for (var r = !1, u = i.child; u;) {
            if (u === n) {
              ((r = !0), (n = i), (a = l));
              break;
            }
            if (u === a) {
              ((r = !0), (a = i), (n = l));
              break;
            }
            u = u.sibling;
          }
          if (!r) {
            for (u = l.child; u;) {
              if (u === n) {
                ((r = !0), (n = l), (a = i));
                break;
              }
              if (u === a) {
                ((r = !0), (a = l), (n = i));
                break;
              }
              u = u.sibling;
            }
            if (!r) throw Error(v(189));
          }
        }
        if (n.alternate !== a) throw Error(v(190));
      }
      if (n.tag !== 3) throw Error(v(188));
      return n.stateNode.current === n ? e : t;
    }
    function Sm(e) {
      var t = e.tag;
      if (t === 5 || t === 26 || t === 27 || t === 6) return e;
      for (e = e.child; e !== null;) {
        if (((t = Sm(e)), t !== null)) return t;
        e = e.sibling;
      }
      return null;
    }
    var vt = Object.assign,
      BS = Symbol.for("react.element"),
      Rr = Symbol.for("react.transitional.element"),
      dl = Symbol.for("react.portal"),
      ui = Symbol.for("react.fragment"),
      bm = Symbol.for("react.strict_mode"),
      To = Symbol.for("react.profiler"),
      Cm = Symbol.for("react.consumer"),
      wn = Symbol.for("react.context"),
      yc = Symbol.for("react.forward_ref"),
      Eo = Symbol.for("react.suspense"),
      Ao = Symbol.for("react.suspense_list"),
      vc = Symbol.for("react.memo"),
      Pn = Symbol.for("react.lazy");
    Symbol.for("react.scope");
    var _o = Symbol.for("react.activity");
    Symbol.for("react.legacy_hidden");
    Symbol.for("react.tracing_marker");
    var jS = Symbol.for("react.memo_cache_sentinel");
    Symbol.for("react.view_transition");
    var Yh = Symbol.iterator;
    function rl(e) {
      return e === null || typeof e != "object"
        ? null
        : ((e = (Yh && e[Yh]) || e["@@iterator"]),
          typeof e == "function" ? e : null);
    }
    var GS = Symbol.for("react.client.reference");
    function Oo(e) {
      if (e == null) return null;
      if (typeof e == "function")
        return e.$$typeof === GS ? null : e.displayName || e.name || null;
      if (typeof e == "string") return e;
      switch (e) {
        case ui:
          return "Fragment";
        case To:
          return "Profiler";
        case bm:
          return "StrictMode";
        case Eo:
          return "Suspense";
        case Ao:
          return "SuspenseList";
        case _o:
          return "Activity";
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case dl:
            return "Portal";
          case wn:
            return e.displayName || "Context";
          case Cm:
            return (e._context.displayName || "Context") + ".Consumer";
          case yc:
            var t = e.render;
            return (
              (e = e.displayName),
              e ||
                ((e = t.displayName || t.name || ""),
                (e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef")),
              e
            );
          case vc:
            return (
              (t = e.displayName || null),
              t !== null ? t : Oo(e.type) || "Memo"
            );
          case Pn:
            ((t = e._payload), (e = e._init));
            try {
              return Oo(e(t));
            } catch {}
        }
      return null;
    }
    var ml = Array.isArray,
      V = gm.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
      nt = LS.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
      Ma = { pending: !1, data: null, method: null, action: null },
      No = [],
      si = -1;
    function dn(e) {
      return { current: e };
    }
    function Pt(e) {
      0 > si || ((e.current = No[si]), (No[si] = null), si--);
    }
    function dt(e, t) {
      (si++, (No[si] = e.current), (e.current = t));
    }
    var hn = dn(null),
      Dl = dn(null),
      aa = dn(null),
      fu = dn(null);
    function hu(e, t) {
      switch ((dt(aa, t), dt(Dl, e), dt(hn, null), t.nodeType)) {
        case 9:
        case 11:
          e = (e = t.documentElement) && (e = e.namespaceURI) ? Jd(e) : 0;
          break;
        default:
          if (((e = t.tagName), (t = t.namespaceURI)))
            ((t = Jd(t)), (e = Hp(t, e)));
          else
            switch (e) {
              case "svg":
                e = 1;
                break;
              case "math":
                e = 2;
                break;
              default:
                e = 0;
            }
      }
      (Pt(hn), dt(hn, e));
    }
    function Oi() {
      (Pt(hn), Pt(Dl), Pt(aa));
    }
    function wo(e) {
      e.memoizedState !== null && dt(fu, e);
      var t = hn.current,
        n = Hp(t, e.type);
      t !== n && (dt(Dl, e), dt(hn, n));
    }
    function du(e) {
      (Dl.current === e && (Pt(hn), Pt(Dl)),
        fu.current === e && (Pt(fu), (Wl._currentValue = Ma)));
    }
    var Ws, Ph;
    function Oa(e) {
      if (Ws === void 0)
        try {
          throw Error();
        } catch (n) {
          var t = n.stack.trim().match(/\n( *(at )?)/);
          ((Ws = (t && t[1]) || ""),
            (Ph =
              -1 <
              n.stack.indexOf(`
    at`)
                ? " (<anonymous>)"
                : -1 < n.stack.indexOf("@")
                  ? "@unknown:0:0"
                  : ""));
        }
      return (
        `
` +
        Ws +
        e +
        Ph
      );
    }
    var Fs = !1;
    function qs(e, t) {
      if (!e || Fs) return "";
      Fs = !0;
      var n = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      try {
        var a = {
          DetermineComponentFrameRoot: function () {
            try {
              if (t) {
                var h = function () {
                  throw Error();
                };
                if (
                  (Object.defineProperty(h.prototype, "props", {
                    set: function () {
                      throw Error();
                    },
                  }),
                  typeof Reflect == "object" && Reflect.construct)
                ) {
                  try {
                    Reflect.construct(h, []);
                  } catch (p) {
                    var f = p;
                  }
                  Reflect.construct(e, [], h);
                } else {
                  try {
                    h.call();
                  } catch (p) {
                    f = p;
                  }
                  e.call(h.prototype);
                }
              } else {
                try {
                  throw Error();
                } catch (p) {
                  f = p;
                }
                (h = e()) &&
                  typeof h.catch == "function" &&
                  h.catch(function () {});
              }
            } catch (p) {
              if (p && f && typeof p.stack == "string")
                return [p.stack, f.stack];
            }
            return [null, null];
          },
        };
        a.DetermineComponentFrameRoot.displayName =
          "DetermineComponentFrameRoot";
        var i = Object.getOwnPropertyDescriptor(
          a.DetermineComponentFrameRoot,
          "name",
        );
        i &&
          i.configurable &&
          Object.defineProperty(a.DetermineComponentFrameRoot, "name", {
            value: "DetermineComponentFrameRoot",
          });
        var l = a.DetermineComponentFrameRoot(),
          r = l[0],
          u = l[1];
        if (r && u) {
          var s = r.split(`
`),
            o = u.split(`
`);
          for (
            i = a = 0;
            a < s.length && !s[a].includes("DetermineComponentFrameRoot");
          )
            a++;
          for (; i < o.length && !o[i].includes("DetermineComponentFrameRoot");)
            i++;
          if (a === s.length || i === o.length)
            for (
              a = s.length - 1, i = o.length - 1;
              1 <= a && 0 <= i && s[a] !== o[i];
            )
              i--;
          for (; 1 <= a && 0 <= i; a--, i--)
            if (s[a] !== o[i]) {
              if (a !== 1 || i !== 1)
                do
                  if ((a--, i--, 0 > i || s[a] !== o[i])) {
                    var c =
                      `
` + s[a].replace(" at new ", " at ");
                    return (
                      e.displayName &&
                        c.includes("<anonymous>") &&
                        (c = c.replace("<anonymous>", e.displayName)),
                      c
                    );
                  }
                while (1 <= a && 0 <= i);
              break;
            }
        }
      } finally {
        ((Fs = !1), (Error.prepareStackTrace = n));
      }
      return (n = e ? e.displayName || e.name : "") ? Oa(n) : "";
    }
    function HS(e, t) {
      switch (e.tag) {
        case 26:
        case 27:
        case 5:
          return Oa(e.type);
        case 16:
          return Oa("Lazy");
        case 13:
          return e.child !== t && t !== null
            ? Oa("Suspense Fallback")
            : Oa("Suspense");
        case 19:
          return Oa("SuspenseList");
        case 0:
        case 15:
          return qs(e.type, !1);
        case 11:
          return qs(e.type.render, !1);
        case 1:
          return qs(e.type, !0);
        case 31:
          return Oa("Activity");
        default:
          return "";
      }
    }
    function Xh(e) {
      try {
        var t = "",
          n = null;
        do ((t += HS(e, n)), (n = e), (e = e.return));
        while (e);
        return t;
      } catch (a) {
        return (
          `
Error generating stack: ` +
          a.message +
          `
` +
          a.stack
        );
      }
    }
    var xo = Object.prototype.hasOwnProperty,
      Sc = Ht.unstable_scheduleCallback,
      Ys = Ht.unstable_cancelCallback,
      WS = Ht.unstable_shouldYield,
      FS = Ht.unstable_requestPaint,
      ze = Ht.unstable_now,
      qS = Ht.unstable_getCurrentPriorityLevel,
      Tm = Ht.unstable_ImmediatePriority,
      Em = Ht.unstable_UserBlockingPriority,
      mu = Ht.unstable_NormalPriority,
      YS = Ht.unstable_LowPriority,
      Am = Ht.unstable_IdlePriority,
      PS = Ht.log,
      XS = Ht.unstable_setDisableYieldValue,
      Pl = null,
      Ve = null;
    function Jn(e) {
      if (
        (typeof PS == "function" && XS(e),
        Ve && typeof Ve.setStrictMode == "function")
      )
        try {
          Ve.setStrictMode(Pl, e);
        } catch {}
    }
    var ke = Math.clz32 ? Math.clz32 : ZS,
      IS = Math.log,
      QS = Math.LN2;
    function ZS(e) {
      return ((e >>>= 0), e === 0 ? 32 : (31 - ((IS(e) / QS) | 0)) | 0);
    }
    var zr = 256,
      Vr = 262144,
      kr = 4194304;
    function Na(e) {
      var t = e & 42;
      if (t !== 0) return t;
      switch (e & -e) {
        case 1:
          return 1;
        case 2:
          return 2;
        case 4:
          return 4;
        case 8:
          return 8;
        case 16:
          return 16;
        case 32:
          return 32;
        case 64:
          return 64;
        case 128:
          return 128;
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
          return e & 261888;
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
          return e & 3932160;
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
          return e & 62914560;
        case 67108864:
          return 67108864;
        case 134217728:
          return 134217728;
        case 268435456:
          return 268435456;
        case 536870912:
          return 536870912;
        case 1073741824:
          return 0;
        default:
          return e;
      }
    }
    function Gu(e, t, n) {
      var a = e.pendingLanes;
      if (a === 0) return 0;
      var i = 0,
        l = e.suspendedLanes,
        r = e.pingedLanes;
      e = e.warmLanes;
      var u = a & 134217727;
      return (
        u !== 0
          ? ((a = u & ~l),
            a !== 0
              ? (i = Na(a))
              : ((r &= u),
                r !== 0
                  ? (i = Na(r))
                  : n || ((n = u & ~e), n !== 0 && (i = Na(n)))))
          : ((u = a & ~l),
            u !== 0
              ? (i = Na(u))
              : r !== 0
                ? (i = Na(r))
                : n || ((n = a & ~e), n !== 0 && (i = Na(n)))),
        i === 0
          ? 0
          : t !== 0 &&
              t !== i &&
              !(t & l) &&
              ((l = i & -i),
              (n = t & -t),
              l >= n || (l === 32 && (n & 4194048) !== 0))
            ? t
            : i
      );
    }
    function Xl(e, t) {
      return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & t) === 0;
    }
    function KS(e, t) {
      switch (e) {
        case 1:
        case 2:
        case 4:
        case 8:
        case 64:
          return t + 250;
        case 16:
        case 32:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
          return t + 5e3;
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
          return -1;
        case 67108864:
        case 134217728:
        case 268435456:
        case 536870912:
        case 1073741824:
          return -1;
        default:
          return -1;
      }
    }
    function _m() {
      var e = kr;
      return ((kr <<= 1), !(kr & 62914560) && (kr = 4194304), e);
    }
    function Ps(e) {
      for (var t = [], n = 0; 31 > n; n++) t.push(e);
      return t;
    }
    function Il(e, t) {
      ((e.pendingLanes |= t),
        t !== 268435456 &&
          ((e.suspendedLanes = 0), (e.pingedLanes = 0), (e.warmLanes = 0)));
    }
    function JS(e, t, n, a, i, l) {
      var r = e.pendingLanes;
      ((e.pendingLanes = n),
        (e.suspendedLanes = 0),
        (e.pingedLanes = 0),
        (e.warmLanes = 0),
        (e.expiredLanes &= n),
        (e.entangledLanes &= n),
        (e.errorRecoveryDisabledLanes &= n),
        (e.shellSuspendCounter = 0));
      var u = e.entanglements,
        s = e.expirationTimes,
        o = e.hiddenUpdates;
      for (n = r & ~n; 0 < n;) {
        var c = 31 - ke(n),
          h = 1 << c;
        ((u[c] = 0), (s[c] = -1));
        var f = o[c];
        if (f !== null)
          for (o[c] = null, c = 0; c < f.length; c++) {
            var p = f[c];
            p !== null && (p.lane &= -536870913);
          }
        n &= ~h;
      }
      (a !== 0 && Om(e, a, 0),
        l !== 0 &&
          i === 0 &&
          e.tag !== 0 &&
          (e.suspendedLanes |= l & ~(r & ~t)));
    }
    function Om(e, t, n) {
      ((e.pendingLanes |= t), (e.suspendedLanes &= ~t));
      var a = 31 - ke(t);
      ((e.entangledLanes |= t),
        (e.entanglements[a] = e.entanglements[a] | 1073741824 | (n & 261930)));
    }
    function Nm(e, t) {
      var n = (e.entangledLanes |= t);
      for (e = e.entanglements; n;) {
        var a = 31 - ke(n),
          i = 1 << a;
        ((i & t) | (e[a] & t) && (e[a] |= t), (n &= ~i));
      }
    }
    function wm(e, t) {
      var n = t & -t;
      return ((n = n & 42 ? 1 : bc(n)), n & (e.suspendedLanes | t) ? 0 : n);
    }
    function bc(e) {
      switch (e) {
        case 2:
          e = 1;
          break;
        case 8:
          e = 4;
          break;
        case 32:
          e = 16;
          break;
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
          e = 128;
          break;
        case 268435456:
          e = 134217728;
          break;
        default:
          e = 0;
      }
      return e;
    }
    function Cc(e) {
      return (
        (e &= -e),
        2 < e ? (8 < e ? (e & 134217727 ? 32 : 268435456) : 8) : 2
      );
    }
    function xm() {
      var e = nt.p;
      return e !== 0 ? e : ((e = window.event), e === void 0 ? 32 : Jp(e.type));
    }
    function Ih(e, t) {
      var n = nt.p;
      try {
        return ((nt.p = e), t());
      } finally {
        nt.p = n;
      }
    }
    var pa = Math.random().toString(36).slice(2),
      Zt = "__reactFiber$" + pa,
      Ce = "__reactProps$" + pa,
      Ui = "__reactContainer$" + pa,
      Mo = "__reactEvents$" + pa,
      $S = "__reactListeners$" + pa,
      t0 = "__reactHandles$" + pa,
      Qh = "__reactResources$" + pa,
      Ql = "__reactMarker$" + pa;
    function Tc(e) {
      (delete e[Zt], delete e[Ce], delete e[Mo], delete e[$S], delete e[t0]);
    }
    function oi(e) {
      var t = e[Zt];
      if (t) return t;
      for (var n = e.parentNode; n;) {
        if ((t = n[Ui] || n[Zt])) {
          if (
            ((n = t.alternate),
            t.child !== null || (n !== null && n.child !== null))
          )
            for (e = am(e); e !== null;) {
              if ((n = e[Zt])) return n;
              e = am(e);
            }
          return t;
        }
        ((e = n), (n = e.parentNode));
      }
      return null;
    }
    function Bi(e) {
      if ((e = e[Zt] || e[Ui])) {
        var t = e.tag;
        if (
          t === 5 ||
          t === 6 ||
          t === 13 ||
          t === 31 ||
          t === 26 ||
          t === 27 ||
          t === 3
        )
          return e;
      }
      return null;
    }
    function gl(e) {
      var t = e.tag;
      if (t === 5 || t === 26 || t === 27 || t === 6) return e.stateNode;
      throw Error(v(33));
    }
    function Si(e) {
      var t = e[Qh];
      return (
        t ||
          (t = e[Qh] =
            { hoistableStyles: new Map(), hoistableScripts: new Map() }),
        t
      );
    }
    function Yt(e) {
      e[Ql] = !0;
    }
    var Mm = new Set(),
      Dm = {};
    function Ga(e, t) {
      (Ni(e, t), Ni(e + "Capture", t));
    }
    function Ni(e, t) {
      for (Dm[e] = t, e = 0; e < t.length; e++) Mm.add(t[e]);
    }
    var e0 = RegExp(
        "^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$",
      ),
      Zh = {},
      Kh = {};
    function n0(e) {
      return xo.call(Kh, e)
        ? !0
        : xo.call(Zh, e)
          ? !1
          : e0.test(e)
            ? (Kh[e] = !0)
            : ((Zh[e] = !0), !1);
    }
    function Zr(e, t, n) {
      if (n0(t))
        if (n === null) e.removeAttribute(t);
        else {
          switch (typeof n) {
            case "undefined":
            case "function":
            case "symbol":
              e.removeAttribute(t);
              return;
            case "boolean":
              var a = t.toLowerCase().slice(0, 5);
              if (a !== "data-" && a !== "aria-") {
                e.removeAttribute(t);
                return;
              }
          }
          e.setAttribute(t, "" + n);
        }
    }
    function Lr(e, t, n) {
      if (n === null) e.removeAttribute(t);
      else {
        switch (typeof n) {
          case "undefined":
          case "function":
          case "symbol":
          case "boolean":
            e.removeAttribute(t);
            return;
        }
        e.setAttribute(t, "" + n);
      }
    }
    function Cn(e, t, n, a) {
      if (a === null) e.removeAttribute(n);
      else {
        switch (typeof a) {
          case "undefined":
          case "function":
          case "symbol":
          case "boolean":
            e.removeAttribute(n);
            return;
        }
        e.setAttributeNS(t, n, "" + a);
      }
    }
    function We(e) {
      switch (typeof e) {
        case "bigint":
        case "boolean":
        case "number":
        case "string":
        case "undefined":
          return e;
        case "object":
          return e;
        default:
          return "";
      }
    }
    function Rm(e) {
      var t = e.type;
      return (
        (e = e.nodeName) &&
        e.toLowerCase() === "input" &&
        (t === "checkbox" || t === "radio")
      );
    }
    function a0(e, t, n) {
      var a = Object.getOwnPropertyDescriptor(e.constructor.prototype, t);
      if (
        !e.hasOwnProperty(t) &&
        typeof a != "undefined" &&
        typeof a.get == "function" &&
        typeof a.set == "function"
      ) {
        var i = a.get,
          l = a.set;
        return (
          Object.defineProperty(e, t, {
            configurable: !0,
            get: function () {
              return i.call(this);
            },
            set: function (r) {
              ((n = "" + r), l.call(this, r));
            },
          }),
          Object.defineProperty(e, t, { enumerable: a.enumerable }),
          {
            getValue: function () {
              return n;
            },
            setValue: function (r) {
              n = "" + r;
            },
            stopTracking: function () {
              ((e._valueTracker = null), delete e[t]);
            },
          }
        );
      }
    }
    function Do(e) {
      if (!e._valueTracker) {
        var t = Rm(e) ? "checked" : "value";
        e._valueTracker = a0(e, t, "" + e[t]);
      }
    }
    function zm(e) {
      if (!e) return !1;
      var t = e._valueTracker;
      if (!t) return !0;
      var n = t.getValue(),
        a = "";
      return (
        e && (a = Rm(e) ? (e.checked ? "true" : "false") : e.value),
        (e = a),
        e !== n ? (t.setValue(e), !0) : !1
      );
    }
    function gu(e) {
      if (
        ((e = e || (typeof document != "undefined" ? document : void 0)),
        typeof e == "undefined")
      )
        return null;
      try {
        return e.activeElement || e.body;
      } catch {
        return e.body;
      }
    }
    var i0 = /[\n"\\]/g;
    function Ye(e) {
      return e.replace(i0, function (t) {
        return "\\" + t.charCodeAt(0).toString(16) + " ";
      });
    }
    function Ro(e, t, n, a, i, l, r, u) {
      ((e.name = ""),
        r != null &&
        typeof r != "function" &&
        typeof r != "symbol" &&
        typeof r != "boolean"
          ? (e.type = r)
          : e.removeAttribute("type"),
        t != null
          ? r === "number"
            ? ((t === 0 && e.value === "") || e.value != t) &&
              (e.value = "" + We(t))
            : e.value !== "" + We(t) && (e.value = "" + We(t))
          : (r !== "submit" && r !== "reset") || e.removeAttribute("value"),
        t != null
          ? zo(e, r, We(t))
          : n != null
            ? zo(e, r, We(n))
            : a != null && e.removeAttribute("value"),
        i == null && l != null && (e.defaultChecked = !!l),
        i != null &&
          (e.checked = i && typeof i != "function" && typeof i != "symbol"),
        u != null &&
        typeof u != "function" &&
        typeof u != "symbol" &&
        typeof u != "boolean"
          ? (e.name = "" + We(u))
          : e.removeAttribute("name"));
    }
    function Vm(e, t, n, a, i, l, r, u) {
      if (
        (l != null &&
          typeof l != "function" &&
          typeof l != "symbol" &&
          typeof l != "boolean" &&
          (e.type = l),
        t != null || n != null)
      ) {
        if (!((l !== "submit" && l !== "reset") || t != null)) {
          Do(e);
          return;
        }
        ((n = n != null ? "" + We(n) : ""),
          (t = t != null ? "" + We(t) : n),
          u || t === e.value || (e.value = t),
          (e.defaultValue = t));
      }
      ((a = a != null ? a : i),
        (a = typeof a != "function" && typeof a != "symbol" && !!a),
        (e.checked = u ? e.checked : !!a),
        (e.defaultChecked = !!a),
        r != null &&
          typeof r != "function" &&
          typeof r != "symbol" &&
          typeof r != "boolean" &&
          (e.name = r),
        Do(e));
    }
    function zo(e, t, n) {
      (t === "number" && gu(e.ownerDocument) === e) ||
        e.defaultValue === "" + n ||
        (e.defaultValue = "" + n);
    }
    function bi(e, t, n, a) {
      if (((e = e.options), t)) {
        t = {};
        for (var i = 0; i < n.length; i++) t["$" + n[i]] = !0;
        for (n = 0; n < e.length; n++)
          ((i = t.hasOwnProperty("$" + e[n].value)),
            e[n].selected !== i && (e[n].selected = i),
            i && a && (e[n].defaultSelected = !0));
      } else {
        for (n = "" + We(n), t = null, i = 0; i < e.length; i++) {
          if (e[i].value === n) {
            ((e[i].selected = !0), a && (e[i].defaultSelected = !0));
            return;
          }
          t !== null || e[i].disabled || (t = e[i]);
        }
        t !== null && (t.selected = !0);
      }
    }
    function km(e, t, n) {
      if (
        t != null &&
        ((t = "" + We(t)), t !== e.value && (e.value = t), n == null)
      ) {
        e.defaultValue !== t && (e.defaultValue = t);
        return;
      }
      e.defaultValue = n != null ? "" + We(n) : "";
    }
    function Lm(e, t, n, a) {
      if (t == null) {
        if (a != null) {
          if (n != null) throw Error(v(92));
          if (ml(a)) {
            if (1 < a.length) throw Error(v(93));
            a = a[0];
          }
          n = a;
        }
        (n == null && (n = ""), (t = n));
      }
      ((n = We(t)),
        (e.defaultValue = n),
        (a = e.textContent),
        a === n && a !== "" && a !== null && (e.value = a),
        Do(e));
    }
    function wi(e, t) {
      if (t) {
        var n = e.firstChild;
        if (n && n === e.lastChild && n.nodeType === 3) {
          n.nodeValue = t;
          return;
        }
      }
      e.textContent = t;
    }
    var l0 = new Set(
      "animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(
        " ",
      ),
    );
    function Jh(e, t, n) {
      var a = t.indexOf("--") === 0;
      n == null || typeof n == "boolean" || n === ""
        ? a
          ? e.setProperty(t, "")
          : t === "float"
            ? (e.cssFloat = "")
            : (e[t] = "")
        : a
          ? e.setProperty(t, n)
          : typeof n != "number" || n === 0 || l0.has(t)
            ? t === "float"
              ? (e.cssFloat = n)
              : (e[t] = ("" + n).trim())
            : (e[t] = n + "px");
    }
    function Um(e, t, n) {
      if (t != null && typeof t != "object") throw Error(v(62));
      if (((e = e.style), n != null)) {
        for (var a in n)
          !n.hasOwnProperty(a) ||
            (t != null && t.hasOwnProperty(a)) ||
            (a.indexOf("--") === 0
              ? e.setProperty(a, "")
              : a === "float"
                ? (e.cssFloat = "")
                : (e[a] = ""));
        for (var i in t)
          ((a = t[i]), t.hasOwnProperty(i) && n[i] !== a && Jh(e, i, a));
      } else for (var l in t) t.hasOwnProperty(l) && Jh(e, l, t[l]);
    }
    function Ec(e) {
      if (e.indexOf("-") === -1) return !1;
      switch (e) {
        case "annotation-xml":
        case "color-profile":
        case "font-face":
        case "font-face-src":
        case "font-face-uri":
        case "font-face-format":
        case "font-face-name":
        case "missing-glyph":
          return !1;
        default:
          return !0;
      }
    }
    var r0 = new Map([
        ["acceptCharset", "accept-charset"],
        ["htmlFor", "for"],
        ["httpEquiv", "http-equiv"],
        ["crossOrigin", "crossorigin"],
        ["accentHeight", "accent-height"],
        ["alignmentBaseline", "alignment-baseline"],
        ["arabicForm", "arabic-form"],
        ["baselineShift", "baseline-shift"],
        ["capHeight", "cap-height"],
        ["clipPath", "clip-path"],
        ["clipRule", "clip-rule"],
        ["colorInterpolation", "color-interpolation"],
        ["colorInterpolationFilters", "color-interpolation-filters"],
        ["colorProfile", "color-profile"],
        ["colorRendering", "color-rendering"],
        ["dominantBaseline", "dominant-baseline"],
        ["enableBackground", "enable-background"],
        ["fillOpacity", "fill-opacity"],
        ["fillRule", "fill-rule"],
        ["floodColor", "flood-color"],
        ["floodOpacity", "flood-opacity"],
        ["fontFamily", "font-family"],
        ["fontSize", "font-size"],
        ["fontSizeAdjust", "font-size-adjust"],
        ["fontStretch", "font-stretch"],
        ["fontStyle", "font-style"],
        ["fontVariant", "font-variant"],
        ["fontWeight", "font-weight"],
        ["glyphName", "glyph-name"],
        ["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
        ["glyphOrientationVertical", "glyph-orientation-vertical"],
        ["horizAdvX", "horiz-adv-x"],
        ["horizOriginX", "horiz-origin-x"],
        ["imageRendering", "image-rendering"],
        ["letterSpacing", "letter-spacing"],
        ["lightingColor", "lighting-color"],
        ["markerEnd", "marker-end"],
        ["markerMid", "marker-mid"],
        ["markerStart", "marker-start"],
        ["overlinePosition", "overline-position"],
        ["overlineThickness", "overline-thickness"],
        ["paintOrder", "paint-order"],
        ["panose-1", "panose-1"],
        ["pointerEvents", "pointer-events"],
        ["renderingIntent", "rendering-intent"],
        ["shapeRendering", "shape-rendering"],
        ["stopColor", "stop-color"],
        ["stopOpacity", "stop-opacity"],
        ["strikethroughPosition", "strikethrough-position"],
        ["strikethroughThickness", "strikethrough-thickness"],
        ["strokeDasharray", "stroke-dasharray"],
        ["strokeDashoffset", "stroke-dashoffset"],
        ["strokeLinecap", "stroke-linecap"],
        ["strokeLinejoin", "stroke-linejoin"],
        ["strokeMiterlimit", "stroke-miterlimit"],
        ["strokeOpacity", "stroke-opacity"],
        ["strokeWidth", "stroke-width"],
        ["textAnchor", "text-anchor"],
        ["textDecoration", "text-decoration"],
        ["textRendering", "text-rendering"],
        ["transformOrigin", "transform-origin"],
        ["underlinePosition", "underline-position"],
        ["underlineThickness", "underline-thickness"],
        ["unicodeBidi", "unicode-bidi"],
        ["unicodeRange", "unicode-range"],
        ["unitsPerEm", "units-per-em"],
        ["vAlphabetic", "v-alphabetic"],
        ["vHanging", "v-hanging"],
        ["vIdeographic", "v-ideographic"],
        ["vMathematical", "v-mathematical"],
        ["vectorEffect", "vector-effect"],
        ["vertAdvY", "vert-adv-y"],
        ["vertOriginX", "vert-origin-x"],
        ["vertOriginY", "vert-origin-y"],
        ["wordSpacing", "word-spacing"],
        ["writingMode", "writing-mode"],
        ["xmlnsXlink", "xmlns:xlink"],
        ["xHeight", "x-height"],
      ]),
      u0 =
        /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
    function Kr(e) {
      return u0.test("" + e)
        ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
        : e;
    }
    function xn() {}
    var Vo = null;
    function Ac(e) {
      return (
        (e = e.target || e.srcElement || window),
        e.correspondingUseElement && (e = e.correspondingUseElement),
        e.nodeType === 3 ? e.parentNode : e
      );
    }
    var ci = null,
      Ci = null;
    function $h(e) {
      var t = Bi(e);
      if (t && (e = t.stateNode)) {
        var n = e[Ce] || null;
        t: switch (((e = t.stateNode), t.type)) {
          case "input":
            if (
              (Ro(
                e,
                n.value,
                n.defaultValue,
                n.defaultValue,
                n.checked,
                n.defaultChecked,
                n.type,
                n.name,
              ),
              (t = n.name),
              n.type === "radio" && t != null)
            ) {
              for (n = e; n.parentNode;) n = n.parentNode;
              for (
                n = n.querySelectorAll(
                  'input[name="' + Ye("" + t) + '"][type="radio"]',
                ),
                  t = 0;
                t < n.length;
                t++
              ) {
                var a = n[t];
                if (a !== e && a.form === e.form) {
                  var i = a[Ce] || null;
                  if (!i) throw Error(v(90));
                  Ro(
                    a,
                    i.value,
                    i.defaultValue,
                    i.defaultValue,
                    i.checked,
                    i.defaultChecked,
                    i.type,
                    i.name,
                  );
                }
              }
              for (t = 0; t < n.length; t++)
                ((a = n[t]), a.form === e.form && zm(a));
            }
            break t;
          case "textarea":
            km(e, n.value, n.defaultValue);
            break t;
          case "select":
            ((t = n.value), t != null && bi(e, !!n.multiple, t, !1));
        }
      }
    }
    var Xs = !1;
    function Bm(e, t, n) {
      if (Xs) return e(t, n);
      Xs = !0;
      try {
        var a = e(t);
        return a;
      } finally {
        if (
          ((Xs = !1),
          (ci !== null || Ci !== null) &&
            (Ju(), ci && ((t = ci), (e = Ci), (Ci = ci = null), $h(t), e)))
        )
          for (t = 0; t < e.length; t++) $h(e[t]);
      }
    }
    function Rl(e, t) {
      var n = e.stateNode;
      if (n === null) return null;
      var a = n[Ce] || null;
      if (a === null) return null;
      n = a[t];
      t: switch (t) {
        case "onClick":
        case "onClickCapture":
        case "onDoubleClick":
        case "onDoubleClickCapture":
        case "onMouseDown":
        case "onMouseDownCapture":
        case "onMouseMove":
        case "onMouseMoveCapture":
        case "onMouseUp":
        case "onMouseUpCapture":
        case "onMouseEnter":
          ((a = !a.disabled) ||
            ((e = e.type),
            (a = !(
              e === "button" ||
              e === "input" ||
              e === "select" ||
              e === "textarea"
            ))),
            (e = !a));
          break t;
        default:
          e = !1;
      }
      if (e) return null;
      if (n && typeof n != "function") throw Error(v(231, t, typeof n));
      return n;
    }
    var Vn = !(
        typeof window == "undefined" ||
        typeof window.document == "undefined" ||
        typeof window.document.createElement == "undefined"
      ),
      ko = !1;
    if (Vn)
      try {
        ((ni = {}),
          Object.defineProperty(ni, "passive", {
            get: function () {
              ko = !0;
            },
          }),
          window.addEventListener("test", ni, ni),
          window.removeEventListener("test", ni, ni));
      } catch {
        ko = !1;
      }
    var ni,
      $n = null,
      _c = null,
      Jr = null;
    function jm() {
      if (Jr) return Jr;
      var e,
        t = _c,
        n = t.length,
        a,
        i = "value" in $n ? $n.value : $n.textContent,
        l = i.length;
      for (e = 0; e < n && t[e] === i[e]; e++);
      var r = n - e;
      for (a = 1; a <= r && t[n - a] === i[l - a]; a++);
      return (Jr = i.slice(e, 1 < a ? 1 - a : void 0));
    }
    function $r(e) {
      var t = e.keyCode;
      return (
        "charCode" in e
          ? ((e = e.charCode), e === 0 && t === 13 && (e = 13))
          : (e = t),
        e === 10 && (e = 13),
        32 <= e || e === 13 ? e : 0
      );
    }
    function Ur() {
      return !0;
    }
    function td() {
      return !1;
    }
    function Te(e) {
      function t(n, a, i, l, r) {
        ((this._reactName = n),
          (this._targetInst = i),
          (this.type = a),
          (this.nativeEvent = l),
          (this.target = r),
          (this.currentTarget = null));
        for (var u in e)
          e.hasOwnProperty(u) && ((n = e[u]), (this[u] = n ? n(l) : l[u]));
        return (
          (this.isDefaultPrevented = (
            l.defaultPrevented != null
              ? l.defaultPrevented
              : l.returnValue === !1
          )
            ? Ur
            : td),
          (this.isPropagationStopped = td),
          this
        );
      }
      return (
        vt(t.prototype, {
          preventDefault: function () {
            this.defaultPrevented = !0;
            var n = this.nativeEvent;
            n &&
              (n.preventDefault
                ? n.preventDefault()
                : typeof n.returnValue != "unknown" && (n.returnValue = !1),
              (this.isDefaultPrevented = Ur));
          },
          stopPropagation: function () {
            var n = this.nativeEvent;
            n &&
              (n.stopPropagation
                ? n.stopPropagation()
                : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0),
              (this.isPropagationStopped = Ur));
          },
          persist: function () {},
          isPersistent: Ur,
        }),
        t
      );
    }
    var Ha = {
        eventPhase: 0,
        bubbles: 0,
        cancelable: 0,
        timeStamp: function (e) {
          return e.timeStamp || Date.now();
        },
        defaultPrevented: 0,
        isTrusted: 0,
      },
      Hu = Te(Ha),
      Zl = vt({}, Ha, { view: 0, detail: 0 }),
      s0 = Te(Zl),
      Is,
      Qs,
      ul,
      Wu = vt({}, Zl, {
        screenX: 0,
        screenY: 0,
        clientX: 0,
        clientY: 0,
        pageX: 0,
        pageY: 0,
        ctrlKey: 0,
        shiftKey: 0,
        altKey: 0,
        metaKey: 0,
        getModifierState: Oc,
        button: 0,
        buttons: 0,
        relatedTarget: function (e) {
          return e.relatedTarget === void 0
            ? e.fromElement === e.srcElement
              ? e.toElement
              : e.fromElement
            : e.relatedTarget;
        },
        movementX: function (e) {
          return "movementX" in e
            ? e.movementX
            : (e !== ul &&
                (ul && e.type === "mousemove"
                  ? ((Is = e.screenX - ul.screenX),
                    (Qs = e.screenY - ul.screenY))
                  : (Qs = Is = 0),
                (ul = e)),
              Is);
        },
        movementY: function (e) {
          return "movementY" in e ? e.movementY : Qs;
        },
      }),
      ed = Te(Wu),
      o0 = vt({}, Wu, { dataTransfer: 0 }),
      c0 = Te(o0),
      f0 = vt({}, Zl, { relatedTarget: 0 }),
      Zs = Te(f0),
      h0 = vt({}, Ha, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }),
      d0 = Te(h0),
      m0 = vt({}, Ha, {
        clipboardData: function (e) {
          return "clipboardData" in e ? e.clipboardData : window.clipboardData;
        },
      }),
      g0 = Te(m0),
      p0 = vt({}, Ha, { data: 0 }),
      nd = Te(p0),
      y0 = {
        Esc: "Escape",
        Spacebar: " ",
        Left: "ArrowLeft",
        Up: "ArrowUp",
        Right: "ArrowRight",
        Down: "ArrowDown",
        Del: "Delete",
        Win: "OS",
        Menu: "ContextMenu",
        Apps: "ContextMenu",
        Scroll: "ScrollLock",
        MozPrintableKey: "Unidentified",
      },
      v0 = {
        8: "Backspace",
        9: "Tab",
        12: "Clear",
        13: "Enter",
        16: "Shift",
        17: "Control",
        18: "Alt",
        19: "Pause",
        20: "CapsLock",
        27: "Escape",
        32: " ",
        33: "PageUp",
        34: "PageDown",
        35: "End",
        36: "Home",
        37: "ArrowLeft",
        38: "ArrowUp",
        39: "ArrowRight",
        40: "ArrowDown",
        45: "Insert",
        46: "Delete",
        112: "F1",
        113: "F2",
        114: "F3",
        115: "F4",
        116: "F5",
        117: "F6",
        118: "F7",
        119: "F8",
        120: "F9",
        121: "F10",
        122: "F11",
        123: "F12",
        144: "NumLock",
        145: "ScrollLock",
        224: "Meta",
      },
      S0 = {
        Alt: "altKey",
        Control: "ctrlKey",
        Meta: "metaKey",
        Shift: "shiftKey",
      };
    function b0(e) {
      var t = this.nativeEvent;
      return t.getModifierState
        ? t.getModifierState(e)
        : (e = S0[e])
          ? !!t[e]
          : !1;
    }
    function Oc() {
      return b0;
    }
    var C0 = vt({}, Zl, {
        key: function (e) {
          if (e.key) {
            var t = y0[e.key] || e.key;
            if (t !== "Unidentified") return t;
          }
          return e.type === "keypress"
            ? ((e = $r(e)), e === 13 ? "Enter" : String.fromCharCode(e))
            : e.type === "keydown" || e.type === "keyup"
              ? v0[e.keyCode] || "Unidentified"
              : "";
        },
        code: 0,
        location: 0,
        ctrlKey: 0,
        shiftKey: 0,
        altKey: 0,
        metaKey: 0,
        repeat: 0,
        locale: 0,
        getModifierState: Oc,
        charCode: function (e) {
          return e.type === "keypress" ? $r(e) : 0;
        },
        keyCode: function (e) {
          return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
        },
        which: function (e) {
          return e.type === "keypress"
            ? $r(e)
            : e.type === "keydown" || e.type === "keyup"
              ? e.keyCode
              : 0;
        },
      }),
      T0 = Te(C0),
      E0 = vt({}, Wu, {
        pointerId: 0,
        width: 0,
        height: 0,
        pressure: 0,
        tangentialPressure: 0,
        tiltX: 0,
        tiltY: 0,
        twist: 0,
        pointerType: 0,
        isPrimary: 0,
      }),
      ad = Te(E0),
      A0 = vt({}, Zl, {
        touches: 0,
        targetTouches: 0,
        changedTouches: 0,
        altKey: 0,
        metaKey: 0,
        ctrlKey: 0,
        shiftKey: 0,
        getModifierState: Oc,
      }),
      _0 = Te(A0),
      O0 = vt({}, Ha, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }),
      N0 = Te(O0),
      w0 = vt({}, Wu, {
        deltaX: function (e) {
          return "deltaX" in e
            ? e.deltaX
            : "wheelDeltaX" in e
              ? -e.wheelDeltaX
              : 0;
        },
        deltaY: function (e) {
          return "deltaY" in e
            ? e.deltaY
            : "wheelDeltaY" in e
              ? -e.wheelDeltaY
              : "wheelDelta" in e
                ? -e.wheelDelta
                : 0;
        },
        deltaZ: 0,
        deltaMode: 0,
      }),
      x0 = Te(w0),
      M0 = vt({}, Ha, { newState: 0, oldState: 0 }),
      D0 = Te(M0),
      R0 = [9, 13, 27, 32],
      Nc = Vn && "CompositionEvent" in window,
      vl = null;
    Vn && "documentMode" in document && (vl = document.documentMode);
    var z0 = Vn && "TextEvent" in window && !vl,
      Gm = Vn && (!Nc || (vl && 8 < vl && 11 >= vl)),
      id = " ",
      ld = !1;
    function Hm(e, t) {
      switch (e) {
        case "keyup":
          return R0.indexOf(t.keyCode) !== -1;
        case "keydown":
          return t.keyCode !== 229;
        case "keypress":
        case "mousedown":
        case "focusout":
          return !0;
        default:
          return !1;
      }
    }
    function Wm(e) {
      return (
        (e = e.detail),
        typeof e == "object" && "data" in e ? e.data : null
      );
    }
    var fi = !1;
    function V0(e, t) {
      switch (e) {
        case "compositionend":
          return Wm(t);
        case "keypress":
          return t.which !== 32 ? null : ((ld = !0), id);
        case "textInput":
          return ((e = t.data), e === id && ld ? null : e);
        default:
          return null;
      }
    }
    function k0(e, t) {
      if (fi)
        return e === "compositionend" || (!Nc && Hm(e, t))
          ? ((e = jm()), (Jr = _c = $n = null), (fi = !1), e)
          : null;
      switch (e) {
        case "paste":
          return null;
        case "keypress":
          if (
            !(t.ctrlKey || t.altKey || t.metaKey) ||
            (t.ctrlKey && t.altKey)
          ) {
            if (t.char && 1 < t.char.length) return t.char;
            if (t.which) return String.fromCharCode(t.which);
          }
          return null;
        case "compositionend":
          return Gm && t.locale !== "ko" ? null : t.data;
        default:
          return null;
      }
    }
    var L0 = {
      color: !0,
      date: !0,
      datetime: !0,
      "datetime-local": !0,
      email: !0,
      month: !0,
      number: !0,
      password: !0,
      range: !0,
      search: !0,
      tel: !0,
      text: !0,
      time: !0,
      url: !0,
      week: !0,
    };
    function rd(e) {
      var t = e && e.nodeName && e.nodeName.toLowerCase();
      return t === "input" ? !!L0[e.type] : t === "textarea";
    }
    function Fm(e, t, n, a) {
      (ci ? (Ci ? Ci.push(a) : (Ci = [a])) : (ci = a),
        (t = zu(t, "onChange")),
        0 < t.length &&
          ((n = new Hu("onChange", "change", null, n, a)),
          e.push({ event: n, listeners: t })));
    }
    var Sl = null,
      zl = null;
    function U0(e) {
      Bp(e, 0);
    }
    function Fu(e) {
      var t = gl(e);
      if (zm(t)) return e;
    }
    function ud(e, t) {
      if (e === "change") return t;
    }
    var qm = !1;
    Vn &&
      (Vn
        ? ((jr = "oninput" in document),
          jr ||
            ((Ks = document.createElement("div")),
            Ks.setAttribute("oninput", "return;"),
            (jr = typeof Ks.oninput == "function")),
          (Br = jr))
        : (Br = !1),
      (qm = Br && (!document.documentMode || 9 < document.documentMode)));
    var Br, jr, Ks;
    function sd() {
      Sl && (Sl.detachEvent("onpropertychange", Ym), (zl = Sl = null));
    }
    function Ym(e) {
      if (e.propertyName === "value" && Fu(zl)) {
        var t = [];
        (Fm(t, zl, e, Ac(e)), Bm(U0, t));
      }
    }
    function B0(e, t, n) {
      e === "focusin"
        ? (sd(), (Sl = t), (zl = n), Sl.attachEvent("onpropertychange", Ym))
        : e === "focusout" && sd();
    }
    function j0(e) {
      if (e === "selectionchange" || e === "keyup" || e === "keydown")
        return Fu(zl);
    }
    function G0(e, t) {
      if (e === "click") return Fu(t);
    }
    function H0(e, t) {
      if (e === "input" || e === "change") return Fu(t);
    }
    function W0(e, t) {
      return (e === t && (e !== 0 || 1 / e === 1 / t)) || (e !== e && t !== t);
    }
    var Ue = typeof Object.is == "function" ? Object.is : W0;
    function Vl(e, t) {
      if (Ue(e, t)) return !0;
      if (
        typeof e != "object" ||
        e === null ||
        typeof t != "object" ||
        t === null
      )
        return !1;
      var n = Object.keys(e),
        a = Object.keys(t);
      if (n.length !== a.length) return !1;
      for (a = 0; a < n.length; a++) {
        var i = n[a];
        if (!xo.call(t, i) || !Ue(e[i], t[i])) return !1;
      }
      return !0;
    }
    function od(e) {
      for (; e && e.firstChild;) e = e.firstChild;
      return e;
    }
    function cd(e, t) {
      var n = od(e);
      e = 0;
      for (var a; n;) {
        if (n.nodeType === 3) {
          if (((a = e + n.textContent.length), e <= t && a >= t))
            return { node: n, offset: t - e };
          e = a;
        }
        t: {
          for (; n;) {
            if (n.nextSibling) {
              n = n.nextSibling;
              break t;
            }
            n = n.parentNode;
          }
          n = void 0;
        }
        n = od(n);
      }
    }
    function Pm(e, t) {
      return e && t
        ? e === t
          ? !0
          : e && e.nodeType === 3
            ? !1
            : t && t.nodeType === 3
              ? Pm(e, t.parentNode)
              : "contains" in e
                ? e.contains(t)
                : e.compareDocumentPosition
                  ? !!(e.compareDocumentPosition(t) & 16)
                  : !1
        : !1;
    }
    function Xm(e) {
      e =
        e != null &&
        e.ownerDocument != null &&
        e.ownerDocument.defaultView != null
          ? e.ownerDocument.defaultView
          : window;
      for (var t = gu(e.document); t instanceof e.HTMLIFrameElement;) {
        try {
          var n = typeof t.contentWindow.location.href == "string";
        } catch {
          n = !1;
        }
        if (n) e = t.contentWindow;
        else break;
        t = gu(e.document);
      }
      return t;
    }
    function wc(e) {
      var t = e && e.nodeName && e.nodeName.toLowerCase();
      return (
        t &&
        ((t === "input" &&
          (e.type === "text" ||
            e.type === "search" ||
            e.type === "tel" ||
            e.type === "url" ||
            e.type === "password")) ||
          t === "textarea" ||
          e.contentEditable === "true")
      );
    }
    var F0 = Vn && "documentMode" in document && 11 >= document.documentMode,
      hi = null,
      Lo = null,
      bl = null,
      Uo = !1;
    function fd(e, t, n) {
      var a =
        n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
      Uo ||
        hi == null ||
        hi !== gu(a) ||
        ((a = hi),
        "selectionStart" in a && wc(a)
          ? (a = { start: a.selectionStart, end: a.selectionEnd })
          : ((a = (
              (a.ownerDocument && a.ownerDocument.defaultView) ||
              window
            ).getSelection()),
            (a = {
              anchorNode: a.anchorNode,
              anchorOffset: a.anchorOffset,
              focusNode: a.focusNode,
              focusOffset: a.focusOffset,
            })),
        (bl && Vl(bl, a)) ||
          ((bl = a),
          (a = zu(Lo, "onSelect")),
          0 < a.length &&
            ((t = new Hu("onSelect", "select", null, t, n)),
            e.push({ event: t, listeners: a }),
            (t.target = hi))));
    }
    function _a(e, t) {
      var n = {};
      return (
        (n[e.toLowerCase()] = t.toLowerCase()),
        (n["Webkit" + e] = "webkit" + t),
        (n["Moz" + e] = "moz" + t),
        n
      );
    }
    var di = {
        animationend: _a("Animation", "AnimationEnd"),
        animationiteration: _a("Animation", "AnimationIteration"),
        animationstart: _a("Animation", "AnimationStart"),
        transitionrun: _a("Transition", "TransitionRun"),
        transitionstart: _a("Transition", "TransitionStart"),
        transitioncancel: _a("Transition", "TransitionCancel"),
        transitionend: _a("Transition", "TransitionEnd"),
      },
      Js = {},
      Im = {};
    Vn &&
      ((Im = document.createElement("div").style),
      "AnimationEvent" in window ||
        (delete di.animationend.animation,
        delete di.animationiteration.animation,
        delete di.animationstart.animation),
      "TransitionEvent" in window || delete di.transitionend.transition);
    function Wa(e) {
      if (Js[e]) return Js[e];
      if (!di[e]) return e;
      var t = di[e],
        n;
      for (n in t) if (t.hasOwnProperty(n) && n in Im) return (Js[e] = t[n]);
      return e;
    }
    var Qm = Wa("animationend"),
      Zm = Wa("animationiteration"),
      Km = Wa("animationstart"),
      q0 = Wa("transitionrun"),
      Y0 = Wa("transitionstart"),
      P0 = Wa("transitioncancel"),
      Jm = Wa("transitionend"),
      $m = new Map(),
      Bo =
        "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
          " ",
        );
    Bo.push("scrollEnd");
    function ln(e, t) {
      ($m.set(e, t), Ga(t, [e]));
    }
    var pu =
        typeof reportError == "function"
          ? reportError
          : function (e) {
              if (
                typeof window == "object" &&
                typeof window.ErrorEvent == "function"
              ) {
                var t = new window.ErrorEvent("error", {
                  bubbles: !0,
                  cancelable: !0,
                  message:
                    typeof e == "object" &&
                    e !== null &&
                    typeof e.message == "string"
                      ? String(e.message)
                      : String(e),
                  error: e,
                });
                if (!window.dispatchEvent(t)) return;
              } else if (
                typeof process == "object" &&
                typeof process.emit == "function"
              ) {
                process.emit("uncaughtException", e);
                return;
              }
              console.error(e);
            },
      He = [],
      mi = 0,
      xc = 0;
    function qu() {
      for (var e = mi, t = (xc = mi = 0); t < e;) {
        var n = He[t];
        He[t++] = null;
        var a = He[t];
        He[t++] = null;
        var i = He[t];
        He[t++] = null;
        var l = He[t];
        if (((He[t++] = null), a !== null && i !== null)) {
          var r = a.pending;
          (r === null ? (i.next = i) : ((i.next = r.next), (r.next = i)),
            (a.pending = i));
        }
        l !== 0 && tg(n, i, l);
      }
    }
    function Yu(e, t, n, a) {
      ((He[mi++] = e),
        (He[mi++] = t),
        (He[mi++] = n),
        (He[mi++] = a),
        (xc |= a),
        (e.lanes |= a),
        (e = e.alternate),
        e !== null && (e.lanes |= a));
    }
    function Mc(e, t, n, a) {
      return (Yu(e, t, n, a), yu(e));
    }
    function Fa(e, t) {
      return (Yu(e, null, null, t), yu(e));
    }
    function tg(e, t, n) {
      e.lanes |= n;
      var a = e.alternate;
      a !== null && (a.lanes |= n);
      for (var i = !1, l = e.return; l !== null;)
        ((l.childLanes |= n),
          (a = l.alternate),
          a !== null && (a.childLanes |= n),
          l.tag === 22 &&
            ((e = l.stateNode), e === null || e._visibility & 1 || (i = !0)),
          (e = l),
          (l = l.return));
      return e.tag === 3
        ? ((l = e.stateNode),
          i &&
            t !== null &&
            ((i = 31 - ke(n)),
            (e = l.hiddenUpdates),
            (a = e[i]),
            a === null ? (e[i] = [t]) : a.push(t),
            (t.lane = n | 536870912)),
          l)
        : null;
    }
    function yu(e) {
      if (50 < xl) throw ((xl = 0), (lc = null), Error(v(185)));
      for (var t = e.return; t !== null;) ((e = t), (t = e.return));
      return e.tag === 3 ? e.stateNode : null;
    }
    var gi = {};
    function X0(e, t, n, a) {
      ((this.tag = e),
        (this.key = n),
        (this.sibling =
          this.child =
          this.return =
          this.stateNode =
          this.type =
          this.elementType =
            null),
        (this.index = 0),
        (this.refCleanup = this.ref = null),
        (this.pendingProps = t),
        (this.dependencies =
          this.memoizedState =
          this.updateQueue =
          this.memoizedProps =
            null),
        (this.mode = a),
        (this.subtreeFlags = this.flags = 0),
        (this.deletions = null),
        (this.childLanes = this.lanes = 0),
        (this.alternate = null));
    }
    function De(e, t, n, a) {
      return new X0(e, t, n, a);
    }
    function Dc(e) {
      return ((e = e.prototype), !(!e || !e.isReactComponent));
    }
    function Dn(e, t) {
      var n = e.alternate;
      return (
        n === null
          ? ((n = De(e.tag, t, e.key, e.mode)),
            (n.elementType = e.elementType),
            (n.type = e.type),
            (n.stateNode = e.stateNode),
            (n.alternate = e),
            (e.alternate = n))
          : ((n.pendingProps = t),
            (n.type = e.type),
            (n.flags = 0),
            (n.subtreeFlags = 0),
            (n.deletions = null)),
        (n.flags = e.flags & 65011712),
        (n.childLanes = e.childLanes),
        (n.lanes = e.lanes),
        (n.child = e.child),
        (n.memoizedProps = e.memoizedProps),
        (n.memoizedState = e.memoizedState),
        (n.updateQueue = e.updateQueue),
        (t = e.dependencies),
        (n.dependencies =
          t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }),
        (n.sibling = e.sibling),
        (n.index = e.index),
        (n.ref = e.ref),
        (n.refCleanup = e.refCleanup),
        n
      );
    }
    function eg(e, t) {
      e.flags &= 65011714;
      var n = e.alternate;
      return (
        n === null
          ? ((e.childLanes = 0),
            (e.lanes = t),
            (e.child = null),
            (e.subtreeFlags = 0),
            (e.memoizedProps = null),
            (e.memoizedState = null),
            (e.updateQueue = null),
            (e.dependencies = null),
            (e.stateNode = null))
          : ((e.childLanes = n.childLanes),
            (e.lanes = n.lanes),
            (e.child = n.child),
            (e.subtreeFlags = 0),
            (e.deletions = null),
            (e.memoizedProps = n.memoizedProps),
            (e.memoizedState = n.memoizedState),
            (e.updateQueue = n.updateQueue),
            (e.type = n.type),
            (t = n.dependencies),
            (e.dependencies =
              t === null
                ? null
                : { lanes: t.lanes, firstContext: t.firstContext })),
        e
      );
    }
    function tu(e, t, n, a, i, l) {
      var r = 0;
      if (((a = e), typeof e == "function")) Dc(e) && (r = 1);
      else if (typeof e == "string")
        r = Zb(e, n, hn.current)
          ? 26
          : e === "html" || e === "head" || e === "body"
            ? 27
            : 5;
      else
        t: switch (e) {
          case _o:
            return (
              (e = De(31, n, t, i)),
              (e.elementType = _o),
              (e.lanes = l),
              e
            );
          case ui:
            return Da(n.children, i, l, t);
          case bm:
            ((r = 8), (i |= 24));
            break;
          case To:
            return (
              (e = De(12, n, t, i | 2)),
              (e.elementType = To),
              (e.lanes = l),
              e
            );
          case Eo:
            return (
              (e = De(13, n, t, i)),
              (e.elementType = Eo),
              (e.lanes = l),
              e
            );
          case Ao:
            return (
              (e = De(19, n, t, i)),
              (e.elementType = Ao),
              (e.lanes = l),
              e
            );
          default:
            if (typeof e == "object" && e !== null)
              switch (e.$$typeof) {
                case wn:
                  r = 10;
                  break t;
                case Cm:
                  r = 9;
                  break t;
                case yc:
                  r = 11;
                  break t;
                case vc:
                  r = 14;
                  break t;
                case Pn:
                  ((r = 16), (a = null));
                  break t;
              }
            ((r = 29),
              (n = Error(v(130, e === null ? "null" : typeof e, ""))),
              (a = null));
        }
      return (
        (t = De(r, n, t, i)),
        (t.elementType = e),
        (t.type = a),
        (t.lanes = l),
        t
      );
    }
    function Da(e, t, n, a) {
      return ((e = De(7, e, a, t)), (e.lanes = n), e);
    }
    function $s(e, t, n) {
      return ((e = De(6, e, null, t)), (e.lanes = n), e);
    }
    function ng(e) {
      var t = De(18, null, null, 0);
      return ((t.stateNode = e), t);
    }
    function to(e, t, n) {
      return (
        (t = De(4, e.children !== null ? e.children : [], e.key, t)),
        (t.lanes = n),
        (t.stateNode = {
          containerInfo: e.containerInfo,
          pendingChildren: null,
          implementation: e.implementation,
        }),
        t
      );
    }
    var hd = new WeakMap();
    function Pe(e, t) {
      if (typeof e == "object" && e !== null) {
        var n = hd.get(e);
        return n !== void 0
          ? n
          : ((t = { value: e, source: t, stack: Xh(t) }), hd.set(e, t), t);
      }
      return { value: e, source: t, stack: Xh(t) };
    }
    var pi = [],
      yi = 0,
      vu = null,
      kl = 0,
      Fe = [],
      qe = 0,
      ha = null,
      on = 1,
      cn = "";
    function On(e, t) {
      ((pi[yi++] = kl), (pi[yi++] = vu), (vu = e), (kl = t));
    }
    function ag(e, t, n) {
      ((Fe[qe++] = on), (Fe[qe++] = cn), (Fe[qe++] = ha), (ha = e));
      var a = on;
      e = cn;
      var i = 32 - ke(a) - 1;
      ((a &= ~(1 << i)), (n += 1));
      var l = 32 - ke(t) + i;
      if (30 < l) {
        var r = i - (i % 5);
        ((l = (a & ((1 << r) - 1)).toString(32)),
          (a >>= r),
          (i -= r),
          (on = (1 << (32 - ke(t) + i)) | (n << i) | a),
          (cn = l + e));
      } else ((on = (1 << l) | (n << i) | a), (cn = e));
    }
    function Rc(e) {
      e.return !== null && (On(e, 1), ag(e, 1, 0));
    }
    function zc(e) {
      for (; e === vu;)
        ((vu = pi[--yi]), (pi[yi] = null), (kl = pi[--yi]), (pi[yi] = null));
      for (; e === ha;)
        ((ha = Fe[--qe]),
          (Fe[qe] = null),
          (cn = Fe[--qe]),
          (Fe[qe] = null),
          (on = Fe[--qe]),
          (Fe[qe] = null));
    }
    function ig(e, t) {
      ((Fe[qe++] = on),
        (Fe[qe++] = cn),
        (Fe[qe++] = ha),
        (on = t.id),
        (cn = t.overflow),
        (ha = e));
    }
    var Kt = null,
      yt = null,
      X = !1,
      ia = null,
      Xe = !1,
      jo = Error(v(519));
    function da(e) {
      var t = Error(
        v(
          418,
          1 < arguments.length && arguments[1] !== void 0 && arguments[1]
            ? "text"
            : "HTML",
          "",
        ),
      );
      throw (Ll(Pe(t, e)), jo);
    }
    function dd(e) {
      var t = e.stateNode,
        n = e.type,
        a = e.memoizedProps;
      switch (((t[Zt] = e), (t[Ce] = a), n)) {
        case "dialog":
          (W("cancel", t), W("close", t));
          break;
        case "iframe":
        case "object":
        case "embed":
          W("load", t);
          break;
        case "video":
        case "audio":
          for (n = 0; n < Gl.length; n++) W(Gl[n], t);
          break;
        case "source":
          W("error", t);
          break;
        case "img":
        case "image":
        case "link":
          (W("error", t), W("load", t));
          break;
        case "details":
          W("toggle", t);
          break;
        case "input":
          (W("invalid", t),
            Vm(
              t,
              a.value,
              a.defaultValue,
              a.checked,
              a.defaultChecked,
              a.type,
              a.name,
              !0,
            ));
          break;
        case "select":
          W("invalid", t);
          break;
        case "textarea":
          (W("invalid", t), Lm(t, a.value, a.defaultValue, a.children));
      }
      ((n = a.children),
        (typeof n != "string" &&
          typeof n != "number" &&
          typeof n != "bigint") ||
        t.textContent === "" + n ||
        a.suppressHydrationWarning === !0 ||
        Gp(t.textContent, n)
          ? (a.popover != null && (W("beforetoggle", t), W("toggle", t)),
            a.onScroll != null && W("scroll", t),
            a.onScrollEnd != null && W("scrollend", t),
            a.onClick != null && (t.onclick = xn),
            (t = !0))
          : (t = !1),
        t || da(e, !0));
    }
    function md(e) {
      for (Kt = e.return; Kt;)
        switch (Kt.tag) {
          case 5:
          case 31:
          case 13:
            Xe = !1;
            return;
          case 27:
          case 3:
            Xe = !0;
            return;
          default:
            Kt = Kt.return;
        }
    }
    function ai(e) {
      if (e !== Kt) return !1;
      if (!X) return (md(e), (X = !0), !1);
      var t = e.tag,
        n;
      if (
        ((n = t !== 3 && t !== 27) &&
          ((n = t === 5) &&
            ((n = e.type),
            (n =
              !(n !== "form" && n !== "button") ||
              cc(e.type, e.memoizedProps))),
          (n = !n)),
        n && yt && da(e),
        md(e),
        t === 13)
      ) {
        if (((e = e.memoizedState), (e = e !== null ? e.dehydrated : null), !e))
          throw Error(v(317));
        yt = nm(e);
      } else if (t === 31) {
        if (((e = e.memoizedState), (e = e !== null ? e.dehydrated : null), !e))
          throw Error(v(317));
        yt = nm(e);
      } else
        t === 27
          ? ((t = yt),
            ya(e.type) ? ((e = mc), (mc = null), (yt = e)) : (yt = t))
          : (yt = Kt ? Qe(e.stateNode.nextSibling) : null);
      return !0;
    }
    function ka() {
      ((yt = Kt = null), (X = !1));
    }
    function eo() {
      var e = ia;
      return (
        e !== null &&
          (Se === null ? (Se = e) : Se.push.apply(Se, e), (ia = null)),
        e
      );
    }
    function Ll(e) {
      ia === null ? (ia = [e]) : ia.push(e);
    }
    var Go = dn(null),
      qa = null,
      Mn = null;
    function In(e, t, n) {
      (dt(Go, t._currentValue), (t._currentValue = n));
    }
    function Rn(e) {
      ((e._currentValue = Go.current), Pt(Go));
    }
    function Ho(e, t, n) {
      for (; e !== null;) {
        var a = e.alternate;
        if (
          ((e.childLanes & t) !== t
            ? ((e.childLanes |= t), a !== null && (a.childLanes |= t))
            : a !== null && (a.childLanes & t) !== t && (a.childLanes |= t),
          e === n)
        )
          break;
        e = e.return;
      }
    }
    function Wo(e, t, n, a) {
      var i = e.child;
      for (i !== null && (i.return = e); i !== null;) {
        var l = i.dependencies;
        if (l !== null) {
          var r = i.child;
          l = l.firstContext;
          t: for (; l !== null;) {
            var u = l;
            l = i;
            for (var s = 0; s < t.length; s++)
              if (u.context === t[s]) {
                ((l.lanes |= n),
                  (u = l.alternate),
                  u !== null && (u.lanes |= n),
                  Ho(l.return, n, e),
                  a || (r = null));
                break t;
              }
            l = u.next;
          }
        } else if (i.tag === 18) {
          if (((r = i.return), r === null)) throw Error(v(341));
          ((r.lanes |= n),
            (l = r.alternate),
            l !== null && (l.lanes |= n),
            Ho(r, n, e),
            (r = null));
        } else r = i.child;
        if (r !== null) r.return = i;
        else
          for (r = i; r !== null;) {
            if (r === e) {
              r = null;
              break;
            }
            if (((i = r.sibling), i !== null)) {
              ((i.return = r.return), (r = i));
              break;
            }
            r = r.return;
          }
        i = r;
      }
    }
    function ji(e, t, n, a) {
      e = null;
      for (var i = t, l = !1; i !== null;) {
        if (!l) {
          if (i.flags & 524288) l = !0;
          else if (i.flags & 262144) break;
        }
        if (i.tag === 10) {
          var r = i.alternate;
          if (r === null) throw Error(v(387));
          if (((r = r.memoizedProps), r !== null)) {
            var u = i.type;
            Ue(i.pendingProps.value, r.value) ||
              (e !== null ? e.push(u) : (e = [u]));
          }
        } else if (i === fu.current) {
          if (((r = i.alternate), r === null)) throw Error(v(387));
          r.memoizedState.memoizedState !== i.memoizedState.memoizedState &&
            (e !== null ? e.push(Wl) : (e = [Wl]));
        }
        i = i.return;
      }
      (e !== null && Wo(t, e, n, a), (t.flags |= 262144));
    }
    function Su(e) {
      for (e = e.firstContext; e !== null;) {
        if (!Ue(e.context._currentValue, e.memoizedValue)) return !0;
        e = e.next;
      }
      return !1;
    }
    function La(e) {
      ((qa = e),
        (Mn = null),
        (e = e.dependencies),
        e !== null && (e.firstContext = null));
    }
    function Jt(e) {
      return lg(qa, e);
    }
    function Gr(e, t) {
      return (qa === null && La(e), lg(e, t));
    }
    function lg(e, t) {
      var n = t._currentValue;
      if (((t = { context: t, memoizedValue: n, next: null }), Mn === null)) {
        if (e === null) throw Error(v(308));
        ((Mn = t),
          (e.dependencies = { lanes: 0, firstContext: t }),
          (e.flags |= 524288));
      } else Mn = Mn.next = t;
      return n;
    }
    var I0 =
        typeof AbortController != "undefined"
          ? AbortController
          : function () {
              var e = [],
                t = (this.signal = {
                  aborted: !1,
                  addEventListener: function (n, a) {
                    e.push(a);
                  },
                });
              this.abort = function () {
                ((t.aborted = !0),
                  e.forEach(function (n) {
                    return n();
                  }));
              };
            },
      Q0 = Ht.unstable_scheduleCallback,
      Z0 = Ht.unstable_NormalPriority,
      Lt = {
        $$typeof: wn,
        Consumer: null,
        Provider: null,
        _currentValue: null,
        _currentValue2: null,
        _threadCount: 0,
      };
    function Vc() {
      return { controller: new I0(), data: new Map(), refCount: 0 };
    }
    function Kl(e) {
      (e.refCount--,
        e.refCount === 0 &&
          Q0(Z0, function () {
            e.controller.abort();
          }));
    }
    var Cl = null,
      Fo = 0,
      xi = 0,
      Ti = null;
    function K0(e, t) {
      if (Cl === null) {
        var n = (Cl = []);
        ((Fo = 0),
          (xi = rf()),
          (Ti = {
            status: "pending",
            value: void 0,
            then: function (a) {
              n.push(a);
            },
          }));
      }
      return (Fo++, t.then(gd, gd), t);
    }
    function gd() {
      if (--Fo === 0 && Cl !== null) {
        Ti !== null && (Ti.status = "fulfilled");
        var e = Cl;
        ((Cl = null), (xi = 0), (Ti = null));
        for (var t = 0; t < e.length; t++) (0, e[t])();
      }
    }
    function J0(e, t) {
      var n = [],
        a = {
          status: "pending",
          value: null,
          reason: null,
          then: function (i) {
            n.push(i);
          },
        };
      return (
        e.then(
          function () {
            ((a.status = "fulfilled"), (a.value = t));
            for (var i = 0; i < n.length; i++) (0, n[i])(t);
          },
          function (i) {
            for (a.status = "rejected", a.reason = i, i = 0; i < n.length; i++)
              (0, n[i])(void 0);
          },
        ),
        a
      );
    }
    var pd = V.S;
    V.S = function (e, t) {
      ((Sp = ze()),
        typeof t == "object" &&
          t !== null &&
          typeof t.then == "function" &&
          K0(e, t),
        pd !== null && pd(e, t));
    };
    var Ra = dn(null);
    function kc() {
      var e = Ra.current;
      return e !== null ? e : ft.pooledCache;
    }
    function eu(e, t) {
      t === null ? dt(Ra, Ra.current) : dt(Ra, t.pool);
    }
    function rg() {
      var e = kc();
      return e === null ? null : { parent: Lt._currentValue, pool: e };
    }
    var Gi = Error(v(460)),
      Lc = Error(v(474)),
      Pu = Error(v(542)),
      bu = { then: function () {} };
    function yd(e) {
      return ((e = e.status), e === "fulfilled" || e === "rejected");
    }
    function ug(e, t, n) {
      switch (
        ((n = e[n]),
        n === void 0 ? e.push(t) : n !== t && (t.then(xn, xn), (t = n)),
        t.status)
      ) {
        case "fulfilled":
          return t.value;
        case "rejected":
          throw ((e = t.reason), Sd(e), e);
        default:
          if (typeof t.status == "string") t.then(xn, xn);
          else {
            if (((e = ft), e !== null && 100 < e.shellSuspendCounter))
              throw Error(v(482));
            ((e = t),
              (e.status = "pending"),
              e.then(
                function (a) {
                  if (t.status === "pending") {
                    var i = t;
                    ((i.status = "fulfilled"), (i.value = a));
                  }
                },
                function (a) {
                  if (t.status === "pending") {
                    var i = t;
                    ((i.status = "rejected"), (i.reason = a));
                  }
                },
              ));
          }
          switch (t.status) {
            case "fulfilled":
              return t.value;
            case "rejected":
              throw ((e = t.reason), Sd(e), e);
          }
          throw ((za = t), Gi);
      }
    }
    function wa(e) {
      try {
        var t = e._init;
        return t(e._payload);
      } catch (n) {
        throw n !== null && typeof n == "object" && typeof n.then == "function"
          ? ((za = n), Gi)
          : n;
      }
    }
    var za = null;
    function vd() {
      if (za === null) throw Error(v(459));
      var e = za;
      return ((za = null), e);
    }
    function Sd(e) {
      if (e === Gi || e === Pu) throw Error(v(483));
    }
    var Ei = null,
      Ul = 0;
    function Hr(e) {
      var t = Ul;
      return ((Ul += 1), Ei === null && (Ei = []), ug(Ei, e, t));
    }
    function sl(e, t) {
      ((t = t.props.ref), (e.ref = t !== void 0 ? t : null));
    }
    function Wr(e, t) {
      throw t.$$typeof === BS
        ? Error(v(525))
        : ((e = Object.prototype.toString.call(t)),
          Error(
            v(
              31,
              e === "[object Object]"
                ? "object with keys {" + Object.keys(t).join(", ") + "}"
                : e,
            ),
          ));
    }
    function sg(e) {
      function t(g, d) {
        if (e) {
          var m = g.deletions;
          m === null ? ((g.deletions = [d]), (g.flags |= 16)) : m.push(d);
        }
      }
      function n(g, d) {
        if (!e) return null;
        for (; d !== null;) (t(g, d), (d = d.sibling));
        return null;
      }
      function a(g) {
        for (var d = new Map(); g !== null;)
          (g.key !== null ? d.set(g.key, g) : d.set(g.index, g),
            (g = g.sibling));
        return d;
      }
      function i(g, d) {
        return ((g = Dn(g, d)), (g.index = 0), (g.sibling = null), g);
      }
      function l(g, d, m) {
        return (
          (g.index = m),
          e
            ? ((m = g.alternate),
              m !== null
                ? ((m = m.index), m < d ? ((g.flags |= 67108866), d) : m)
                : ((g.flags |= 67108866), d))
            : ((g.flags |= 1048576), d)
        );
      }
      function r(g) {
        return (e && g.alternate === null && (g.flags |= 67108866), g);
      }
      function u(g, d, m, y) {
        return d === null || d.tag !== 6
          ? ((d = $s(m, g.mode, y)), (d.return = g), d)
          : ((d = i(d, m)), (d.return = g), d);
      }
      function s(g, d, m, y) {
        var b = m.type;
        return b === ui
          ? c(g, d, m.props.children, y, m.key)
          : d !== null &&
              (d.elementType === b ||
                (typeof b == "object" &&
                  b !== null &&
                  b.$$typeof === Pn &&
                  wa(b) === d.type))
            ? ((d = i(d, m.props)), sl(d, m), (d.return = g), d)
            : ((d = tu(m.type, m.key, m.props, null, g.mode, y)),
              sl(d, m),
              (d.return = g),
              d);
      }
      function o(g, d, m, y) {
        return d === null ||
          d.tag !== 4 ||
          d.stateNode.containerInfo !== m.containerInfo ||
          d.stateNode.implementation !== m.implementation
          ? ((d = to(m, g.mode, y)), (d.return = g), d)
          : ((d = i(d, m.children || [])), (d.return = g), d);
      }
      function c(g, d, m, y, b) {
        return d === null || d.tag !== 7
          ? ((d = Da(m, g.mode, y, b)), (d.return = g), d)
          : ((d = i(d, m)), (d.return = g), d);
      }
      function h(g, d, m) {
        if (
          (typeof d == "string" && d !== "") ||
          typeof d == "number" ||
          typeof d == "bigint"
        )
          return ((d = $s("" + d, g.mode, m)), (d.return = g), d);
        if (typeof d == "object" && d !== null) {
          switch (d.$$typeof) {
            case Rr:
              return (
                (m = tu(d.type, d.key, d.props, null, g.mode, m)),
                sl(m, d),
                (m.return = g),
                m
              );
            case dl:
              return ((d = to(d, g.mode, m)), (d.return = g), d);
            case Pn:
              return ((d = wa(d)), h(g, d, m));
          }
          if (ml(d) || rl(d))
            return ((d = Da(d, g.mode, m, null)), (d.return = g), d);
          if (typeof d.then == "function") return h(g, Hr(d), m);
          if (d.$$typeof === wn) return h(g, Gr(g, d), m);
          Wr(g, d);
        }
        return null;
      }
      function f(g, d, m, y) {
        var b = d !== null ? d.key : null;
        if (
          (typeof m == "string" && m !== "") ||
          typeof m == "number" ||
          typeof m == "bigint"
        )
          return b !== null ? null : u(g, d, "" + m, y);
        if (typeof m == "object" && m !== null) {
          switch (m.$$typeof) {
            case Rr:
              return m.key === b ? s(g, d, m, y) : null;
            case dl:
              return m.key === b ? o(g, d, m, y) : null;
            case Pn:
              return ((m = wa(m)), f(g, d, m, y));
          }
          if (ml(m) || rl(m)) return b !== null ? null : c(g, d, m, y, null);
          if (typeof m.then == "function") return f(g, d, Hr(m), y);
          if (m.$$typeof === wn) return f(g, d, Gr(g, m), y);
          Wr(g, m);
        }
        return null;
      }
      function p(g, d, m, y, b) {
        if (
          (typeof y == "string" && y !== "") ||
          typeof y == "number" ||
          typeof y == "bigint"
        )
          return ((g = g.get(m) || null), u(d, g, "" + y, b));
        if (typeof y == "object" && y !== null) {
          switch (y.$$typeof) {
            case Rr:
              return (
                (g = g.get(y.key === null ? m : y.key) || null),
                s(d, g, y, b)
              );
            case dl:
              return (
                (g = g.get(y.key === null ? m : y.key) || null),
                o(d, g, y, b)
              );
            case Pn:
              return ((y = wa(y)), p(g, d, m, y, b));
          }
          if (ml(y) || rl(y))
            return ((g = g.get(m) || null), c(d, g, y, b, null));
          if (typeof y.then == "function") return p(g, d, m, Hr(y), b);
          if (y.$$typeof === wn) return p(g, d, m, Gr(d, y), b);
          Wr(d, y);
        }
        return null;
      }
      function S(g, d, m, y) {
        for (
          var b = null, N = null, E = d, M = (d = 0), w = null;
          E !== null && M < m.length;
          M++
        ) {
          E.index > M ? ((w = E), (E = null)) : (w = E.sibling);
          var D = f(g, E, m[M], y);
          if (D === null) {
            E === null && (E = w);
            break;
          }
          (e && E && D.alternate === null && t(g, E),
            (d = l(D, d, M)),
            N === null ? (b = D) : (N.sibling = D),
            (N = D),
            (E = w));
        }
        if (M === m.length) return (n(g, E), X && On(g, M), b);
        if (E === null) {
          for (; M < m.length; M++)
            ((E = h(g, m[M], y)),
              E !== null &&
                ((d = l(E, d, M)),
                N === null ? (b = E) : (N.sibling = E),
                (N = E)));
          return (X && On(g, M), b);
        }
        for (E = a(E); M < m.length; M++)
          ((w = p(E, g, M, m[M], y)),
            w !== null &&
              (e &&
                w.alternate !== null &&
                E.delete(w.key === null ? M : w.key),
              (d = l(w, d, M)),
              N === null ? (b = w) : (N.sibling = w),
              (N = w)));
        return (
          e &&
            E.forEach(function (j) {
              return t(g, j);
            }),
          X && On(g, M),
          b
        );
      }
      function T(g, d, m, y) {
        if (m == null) throw Error(v(151));
        for (
          var b = null, N = null, E = d, M = (d = 0), w = null, D = m.next();
          E !== null && !D.done;
          M++, D = m.next()
        ) {
          E.index > M ? ((w = E), (E = null)) : (w = E.sibling);
          var j = f(g, E, D.value, y);
          if (j === null) {
            E === null && (E = w);
            break;
          }
          (e && E && j.alternate === null && t(g, E),
            (d = l(j, d, M)),
            N === null ? (b = j) : (N.sibling = j),
            (N = j),
            (E = w));
        }
        if (D.done) return (n(g, E), X && On(g, M), b);
        if (E === null) {
          for (; !D.done; M++, D = m.next())
            ((D = h(g, D.value, y)),
              D !== null &&
                ((d = l(D, d, M)),
                N === null ? (b = D) : (N.sibling = D),
                (N = D)));
          return (X && On(g, M), b);
        }
        for (E = a(E); !D.done; M++, D = m.next())
          ((D = p(E, g, M, D.value, y)),
            D !== null &&
              (e &&
                D.alternate !== null &&
                E.delete(D.key === null ? M : D.key),
              (d = l(D, d, M)),
              N === null ? (b = D) : (N.sibling = D),
              (N = D)));
        return (
          e &&
            E.forEach(function (G) {
              return t(g, G);
            }),
          X && On(g, M),
          b
        );
      }
      function x(g, d, m, y) {
        if (
          (typeof m == "object" &&
            m !== null &&
            m.type === ui &&
            m.key === null &&
            (m = m.props.children),
          typeof m == "object" && m !== null)
        ) {
          switch (m.$$typeof) {
            case Rr:
              t: {
                for (var b = m.key; d !== null;) {
                  if (d.key === b) {
                    if (((b = m.type), b === ui)) {
                      if (d.tag === 7) {
                        (n(g, d.sibling),
                          (y = i(d, m.props.children)),
                          (y.return = g),
                          (g = y));
                        break t;
                      }
                    } else if (
                      d.elementType === b ||
                      (typeof b == "object" &&
                        b !== null &&
                        b.$$typeof === Pn &&
                        wa(b) === d.type)
                    ) {
                      (n(g, d.sibling),
                        (y = i(d, m.props)),
                        sl(y, m),
                        (y.return = g),
                        (g = y));
                      break t;
                    }
                    n(g, d);
                    break;
                  } else t(g, d);
                  d = d.sibling;
                }
                m.type === ui
                  ? ((y = Da(m.props.children, g.mode, y, m.key)),
                    (y.return = g),
                    (g = y))
                  : ((y = tu(m.type, m.key, m.props, null, g.mode, y)),
                    sl(y, m),
                    (y.return = g),
                    (g = y));
              }
              return r(g);
            case dl:
              t: {
                for (b = m.key; d !== null;) {
                  if (d.key === b)
                    if (
                      d.tag === 4 &&
                      d.stateNode.containerInfo === m.containerInfo &&
                      d.stateNode.implementation === m.implementation
                    ) {
                      (n(g, d.sibling),
                        (y = i(d, m.children || [])),
                        (y.return = g),
                        (g = y));
                      break t;
                    } else {
                      n(g, d);
                      break;
                    }
                  else t(g, d);
                  d = d.sibling;
                }
                ((y = to(m, g.mode, y)), (y.return = g), (g = y));
              }
              return r(g);
            case Pn:
              return ((m = wa(m)), x(g, d, m, y));
          }
          if (ml(m)) return S(g, d, m, y);
          if (rl(m)) {
            if (((b = rl(m)), typeof b != "function")) throw Error(v(150));
            return ((m = b.call(m)), T(g, d, m, y));
          }
          if (typeof m.then == "function") return x(g, d, Hr(m), y);
          if (m.$$typeof === wn) return x(g, d, Gr(g, m), y);
          Wr(g, m);
        }
        return (typeof m == "string" && m !== "") ||
          typeof m == "number" ||
          typeof m == "bigint"
          ? ((m = "" + m),
            d !== null && d.tag === 6
              ? (n(g, d.sibling), (y = i(d, m)), (y.return = g), (g = y))
              : (n(g, d), (y = $s(m, g.mode, y)), (y.return = g), (g = y)),
            r(g))
          : n(g, d);
      }
      return function (g, d, m, y) {
        try {
          Ul = 0;
          var b = x(g, d, m, y);
          return ((Ei = null), b);
        } catch (E) {
          if (E === Gi || E === Pu) throw E;
          var N = De(29, E, null, g.mode);
          return ((N.lanes = y), (N.return = g), N);
        } finally {
        }
      };
    }
    var Ua = sg(!0),
      og = sg(!1),
      Xn = !1;
    function Uc(e) {
      e.updateQueue = {
        baseState: e.memoizedState,
        firstBaseUpdate: null,
        lastBaseUpdate: null,
        shared: { pending: null, lanes: 0, hiddenCallbacks: null },
        callbacks: null,
      };
    }
    function qo(e, t) {
      ((e = e.updateQueue),
        t.updateQueue === e &&
          (t.updateQueue = {
            baseState: e.baseState,
            firstBaseUpdate: e.firstBaseUpdate,
            lastBaseUpdate: e.lastBaseUpdate,
            shared: e.shared,
            callbacks: null,
          }));
    }
    function la(e) {
      return { lane: e, tag: 0, payload: null, callback: null, next: null };
    }
    function ra(e, t, n) {
      var a = e.updateQueue;
      if (a === null) return null;
      if (((a = a.shared), et & 2)) {
        var i = a.pending;
        return (
          i === null ? (t.next = t) : ((t.next = i.next), (i.next = t)),
          (a.pending = t),
          (t = yu(e)),
          tg(e, null, n),
          t
        );
      }
      return (Yu(e, a, t, n), yu(e));
    }
    function Tl(e, t, n) {
      if (
        ((t = t.updateQueue),
        t !== null && ((t = t.shared), (n & 4194048) !== 0))
      ) {
        var a = t.lanes;
        ((a &= e.pendingLanes), (n |= a), (t.lanes = n), Nm(e, n));
      }
    }
    function no(e, t) {
      var n = e.updateQueue,
        a = e.alternate;
      if (a !== null && ((a = a.updateQueue), n === a)) {
        var i = null,
          l = null;
        if (((n = n.firstBaseUpdate), n !== null)) {
          do {
            var r = {
              lane: n.lane,
              tag: n.tag,
              payload: n.payload,
              callback: null,
              next: null,
            };
            (l === null ? (i = l = r) : (l = l.next = r), (n = n.next));
          } while (n !== null);
          l === null ? (i = l = t) : (l = l.next = t);
        } else i = l = t;
        ((n = {
          baseState: a.baseState,
          firstBaseUpdate: i,
          lastBaseUpdate: l,
          shared: a.shared,
          callbacks: a.callbacks,
        }),
          (e.updateQueue = n));
        return;
      }
      ((e = n.lastBaseUpdate),
        e === null ? (n.firstBaseUpdate = t) : (e.next = t),
        (n.lastBaseUpdate = t));
    }
    var Yo = !1;
    function El() {
      if (Yo) {
        var e = Ti;
        if (e !== null) throw e;
      }
    }
    function Al(e, t, n, a) {
      Yo = !1;
      var i = e.updateQueue;
      Xn = !1;
      var l = i.firstBaseUpdate,
        r = i.lastBaseUpdate,
        u = i.shared.pending;
      if (u !== null) {
        i.shared.pending = null;
        var s = u,
          o = s.next;
        ((s.next = null), r === null ? (l = o) : (r.next = o), (r = s));
        var c = e.alternate;
        c !== null &&
          ((c = c.updateQueue),
          (u = c.lastBaseUpdate),
          u !== r &&
            (u === null ? (c.firstBaseUpdate = o) : (u.next = o),
            (c.lastBaseUpdate = s)));
      }
      if (l !== null) {
        var h = i.baseState;
        ((r = 0), (c = o = s = null), (u = l));
        do {
          var f = u.lane & -536870913,
            p = f !== u.lane;
          if (p ? (q & f) === f : (a & f) === f) {
            (f !== 0 && f === xi && (Yo = !0),
              c !== null &&
                (c = c.next =
                  {
                    lane: 0,
                    tag: u.tag,
                    payload: u.payload,
                    callback: null,
                    next: null,
                  }));
            t: {
              var S = e,
                T = u;
              f = t;
              var x = n;
              switch (T.tag) {
                case 1:
                  if (((S = T.payload), typeof S == "function")) {
                    h = S.call(x, h, f);
                    break t;
                  }
                  h = S;
                  break t;
                case 3:
                  S.flags = (S.flags & -65537) | 128;
                case 0:
                  if (
                    ((S = T.payload),
                    (f = typeof S == "function" ? S.call(x, h, f) : S),
                    f == null)
                  )
                    break t;
                  h = vt({}, h, f);
                  break t;
                case 2:
                  Xn = !0;
              }
            }
            ((f = u.callback),
              f !== null &&
                ((e.flags |= 64),
                p && (e.flags |= 8192),
                (p = i.callbacks),
                p === null ? (i.callbacks = [f]) : p.push(f)));
          } else
            ((p = {
              lane: f,
              tag: u.tag,
              payload: u.payload,
              callback: u.callback,
              next: null,
            }),
              c === null ? ((o = c = p), (s = h)) : (c = c.next = p),
              (r |= f));
          if (((u = u.next), u === null)) {
            if (((u = i.shared.pending), u === null)) break;
            ((p = u),
              (u = p.next),
              (p.next = null),
              (i.lastBaseUpdate = p),
              (i.shared.pending = null));
          }
        } while (!0);
        (c === null && (s = h),
          (i.baseState = s),
          (i.firstBaseUpdate = o),
          (i.lastBaseUpdate = c),
          l === null && (i.shared.lanes = 0),
          (ga |= r),
          (e.lanes = r),
          (e.memoizedState = h));
      }
    }
    function cg(e, t) {
      if (typeof e != "function") throw Error(v(191, e));
      e.call(t);
    }
    function fg(e, t) {
      var n = e.callbacks;
      if (n !== null)
        for (e.callbacks = null, e = 0; e < n.length; e++) cg(n[e], t);
    }
    var Mi = dn(null),
      Cu = dn(0);
    function bd(e, t) {
      ((e = Bn), dt(Cu, e), dt(Mi, t), (Bn = e | t.baseLanes));
    }
    function Po() {
      (dt(Cu, Bn), dt(Mi, Mi.current));
    }
    function Bc() {
      ((Bn = Cu.current), Pt(Mi), Pt(Cu));
    }
    var Be = dn(null),
      Ie = null;
    function Qn(e) {
      var t = e.alternate;
      (dt(Rt, Rt.current & 1),
        dt(Be, e),
        Ie === null &&
          (t === null || Mi.current !== null || t.memoizedState !== null) &&
          (Ie = e));
    }
    function Xo(e) {
      (dt(Rt, Rt.current), dt(Be, e), Ie === null && (Ie = e));
    }
    function hg(e) {
      e.tag === 22
        ? (dt(Rt, Rt.current), dt(Be, e), Ie === null && (Ie = e))
        : Zn(e);
    }
    function Zn() {
      (dt(Rt, Rt.current), dt(Be, Be.current));
    }
    function Me(e) {
      (Pt(Be), Ie === e && (Ie = null), Pt(Rt));
    }
    var Rt = dn(0);
    function Tu(e) {
      for (var t = e; t !== null;) {
        if (t.tag === 13) {
          var n = t.memoizedState;
          if (n !== null && ((n = n.dehydrated), n === null || hc(n) || dc(n)))
            return t;
        } else if (
          t.tag === 19 &&
          (t.memoizedProps.revealOrder === "forwards" ||
            t.memoizedProps.revealOrder === "backwards" ||
            t.memoizedProps.revealOrder === "unstable_legacy-backwards" ||
            t.memoizedProps.revealOrder === "together")
        ) {
          if (t.flags & 128) return t;
        } else if (t.child !== null) {
          ((t.child.return = t), (t = t.child));
          continue;
        }
        if (t === e) break;
        for (; t.sibling === null;) {
          if (t.return === null || t.return === e) return null;
          t = t.return;
        }
        ((t.sibling.return = t.return), (t = t.sibling));
      }
      return null;
    }
    var kn = 0,
      U = null,
      ot = null,
      Vt = null,
      Eu = !1,
      Ai = !1,
      Ba = !1,
      Au = 0,
      Bl = 0,
      _i = null,
      $0 = 0;
    function xt() {
      throw Error(v(321));
    }
    function jc(e, t) {
      if (t === null) return !1;
      for (var n = 0; n < t.length && n < e.length; n++)
        if (!Ue(e[n], t[n])) return !1;
      return !0;
    }
    function Gc(e, t, n, a, i, l) {
      return (
        (kn = l),
        (U = t),
        (t.memoizedState = null),
        (t.updateQueue = null),
        (t.lanes = 0),
        (V.H = e === null || e.memoizedState === null ? Fg : Kc),
        (Ba = !1),
        (l = n(a, i)),
        (Ba = !1),
        Ai && (l = mg(t, n, a, i)),
        dg(e),
        l
      );
    }
    function dg(e) {
      V.H = jl;
      var t = ot !== null && ot.next !== null;
      if (((kn = 0), (Vt = ot = U = null), (Eu = !1), (Bl = 0), (_i = null), t))
        throw Error(v(300));
      e === null ||
        Ut ||
        ((e = e.dependencies), e !== null && Su(e) && (Ut = !0));
    }
    function mg(e, t, n, a) {
      U = e;
      var i = 0;
      do {
        if ((Ai && (_i = null), (Bl = 0), (Ai = !1), 25 <= i))
          throw Error(v(301));
        if (((i += 1), (Vt = ot = null), e.updateQueue != null)) {
          var l = e.updateQueue;
          ((l.lastEffect = null),
            (l.events = null),
            (l.stores = null),
            l.memoCache != null && (l.memoCache.index = 0));
        }
        ((V.H = qg), (l = t(n, a)));
      } while (Ai);
      return l;
    }
    function tb() {
      var e = V.H,
        t = e.useState()[0];
      return (
        (t = typeof t.then == "function" ? Jl(t) : t),
        (e = e.useState()[0]),
        (ot !== null ? ot.memoizedState : null) !== e && (U.flags |= 1024),
        t
      );
    }
    function Hc() {
      var e = Au !== 0;
      return ((Au = 0), e);
    }
    function Wc(e, t, n) {
      ((t.updateQueue = e.updateQueue), (t.flags &= -2053), (e.lanes &= ~n));
    }
    function Fc(e) {
      if (Eu) {
        for (e = e.memoizedState; e !== null;) {
          var t = e.queue;
          (t !== null && (t.pending = null), (e = e.next));
        }
        Eu = !1;
      }
      ((kn = 0), (Vt = ot = U = null), (Ai = !1), (Bl = Au = 0), (_i = null));
    }
    function fe() {
      var e = {
        memoizedState: null,
        baseState: null,
        baseQueue: null,
        queue: null,
        next: null,
      };
      return (
        Vt === null ? (U.memoizedState = Vt = e) : (Vt = Vt.next = e),
        Vt
      );
    }
    function zt() {
      if (ot === null) {
        var e = U.alternate;
        e = e !== null ? e.memoizedState : null;
      } else e = ot.next;
      var t = Vt === null ? U.memoizedState : Vt.next;
      if (t !== null) ((Vt = t), (ot = e));
      else {
        if (e === null)
          throw U.alternate === null ? Error(v(467)) : Error(v(310));
        ((ot = e),
          (e = {
            memoizedState: ot.memoizedState,
            baseState: ot.baseState,
            baseQueue: ot.baseQueue,
            queue: ot.queue,
            next: null,
          }),
          Vt === null ? (U.memoizedState = Vt = e) : (Vt = Vt.next = e));
      }
      return Vt;
    }
    function Xu() {
      return { lastEffect: null, events: null, stores: null, memoCache: null };
    }
    function Jl(e) {
      var t = Bl;
      return (
        (Bl += 1),
        _i === null && (_i = []),
        (e = ug(_i, e, t)),
        (t = U),
        (Vt === null ? t.memoizedState : Vt.next) === null &&
          ((t = t.alternate),
          (V.H = t === null || t.memoizedState === null ? Fg : Kc)),
        e
      );
    }
    function Iu(e) {
      if (e !== null && typeof e == "object") {
        if (typeof e.then == "function") return Jl(e);
        if (e.$$typeof === wn) return Jt(e);
      }
      throw Error(v(438, String(e)));
    }
    function qc(e) {
      var t = null,
        n = U.updateQueue;
      if ((n !== null && (t = n.memoCache), t == null)) {
        var a = U.alternate;
        a !== null &&
          ((a = a.updateQueue),
          a !== null &&
            ((a = a.memoCache),
            a != null &&
              (t = {
                data: a.data.map(function (i) {
                  return i.slice();
                }),
                index: 0,
              })));
      }
      if (
        (t == null && (t = { data: [], index: 0 }),
        n === null && ((n = Xu()), (U.updateQueue = n)),
        (n.memoCache = t),
        (n = t.data[t.index]),
        n === void 0)
      )
        for (n = t.data[t.index] = Array(e), a = 0; a < e; a++) n[a] = jS;
      return (t.index++, n);
    }
    function Ln(e, t) {
      return typeof t == "function" ? t(e) : t;
    }
    function nu(e) {
      var t = zt();
      return Yc(t, ot, e);
    }
    function Yc(e, t, n) {
      var a = e.queue;
      if (a === null) throw Error(v(311));
      a.lastRenderedReducer = n;
      var i = e.baseQueue,
        l = a.pending;
      if (l !== null) {
        if (i !== null) {
          var r = i.next;
          ((i.next = l.next), (l.next = r));
        }
        ((t.baseQueue = i = l), (a.pending = null));
      }
      if (((l = e.baseState), i === null)) e.memoizedState = l;
      else {
        t = i.next;
        var u = (r = null),
          s = null,
          o = t,
          c = !1;
        do {
          var h = o.lane & -536870913;
          if (h !== o.lane ? (q & h) === h : (kn & h) === h) {
            var f = o.revertLane;
            if (f === 0)
              (s !== null &&
                (s = s.next =
                  {
                    lane: 0,
                    revertLane: 0,
                    gesture: null,
                    action: o.action,
                    hasEagerState: o.hasEagerState,
                    eagerState: o.eagerState,
                    next: null,
                  }),
                h === xi && (c = !0));
            else if ((kn & f) === f) {
              ((o = o.next), f === xi && (c = !0));
              continue;
            } else
              ((h = {
                lane: 0,
                revertLane: o.revertLane,
                gesture: null,
                action: o.action,
                hasEagerState: o.hasEagerState,
                eagerState: o.eagerState,
                next: null,
              }),
                s === null ? ((u = s = h), (r = l)) : (s = s.next = h),
                (U.lanes |= f),
                (ga |= f));
            ((h = o.action),
              Ba && n(l, h),
              (l = o.hasEagerState ? o.eagerState : n(l, h)));
          } else
            ((f = {
              lane: h,
              revertLane: o.revertLane,
              gesture: o.gesture,
              action: o.action,
              hasEagerState: o.hasEagerState,
              eagerState: o.eagerState,
              next: null,
            }),
              s === null ? ((u = s = f), (r = l)) : (s = s.next = f),
              (U.lanes |= h),
              (ga |= h));
          o = o.next;
        } while (o !== null && o !== t);
        if (
          (s === null ? (r = l) : (s.next = u),
          !Ue(l, e.memoizedState) && ((Ut = !0), c && ((n = Ti), n !== null)))
        )
          throw n;
        ((e.memoizedState = l),
          (e.baseState = r),
          (e.baseQueue = s),
          (a.lastRenderedState = l));
      }
      return (i === null && (a.lanes = 0), [e.memoizedState, a.dispatch]);
    }
    function ao(e) {
      var t = zt(),
        n = t.queue;
      if (n === null) throw Error(v(311));
      n.lastRenderedReducer = e;
      var a = n.dispatch,
        i = n.pending,
        l = t.memoizedState;
      if (i !== null) {
        n.pending = null;
        var r = (i = i.next);
        do ((l = e(l, r.action)), (r = r.next));
        while (r !== i);
        (Ue(l, t.memoizedState) || (Ut = !0),
          (t.memoizedState = l),
          t.baseQueue === null && (t.baseState = l),
          (n.lastRenderedState = l));
      }
      return [l, a];
    }
    function gg(e, t, n) {
      var a = U,
        i = zt(),
        l = X;
      if (l) {
        if (n === void 0) throw Error(v(407));
        n = n();
      } else n = t();
      var r = !Ue((ot || i).memoizedState, n);
      if (
        (r && ((i.memoizedState = n), (Ut = !0)),
        (i = i.queue),
        Pc(vg.bind(null, a, i, e), [e]),
        i.getSnapshot !== t || r || (Vt !== null && Vt.memoizedState.tag & 1))
      ) {
        if (
          ((a.flags |= 2048),
          Di(9, { destroy: void 0 }, yg.bind(null, a, i, n, t), null),
          ft === null)
        )
          throw Error(v(349));
        l || kn & 127 || pg(a, t, n);
      }
      return n;
    }
    function pg(e, t, n) {
      ((e.flags |= 16384),
        (e = { getSnapshot: t, value: n }),
        (t = U.updateQueue),
        t === null
          ? ((t = Xu()), (U.updateQueue = t), (t.stores = [e]))
          : ((n = t.stores), n === null ? (t.stores = [e]) : n.push(e)));
    }
    function yg(e, t, n, a) {
      ((t.value = n), (t.getSnapshot = a), Sg(t) && bg(e));
    }
    function vg(e, t, n) {
      return n(function () {
        Sg(t) && bg(e);
      });
    }
    function Sg(e) {
      var t = e.getSnapshot;
      e = e.value;
      try {
        var n = t();
        return !Ue(e, n);
      } catch {
        return !0;
      }
    }
    function bg(e) {
      var t = Fa(e, 2);
      t !== null && be(t, e, 2);
    }
    function Io(e) {
      var t = fe();
      if (typeof e == "function") {
        var n = e;
        if (((e = n()), Ba)) {
          Jn(!0);
          try {
            n();
          } finally {
            Jn(!1);
          }
        }
      }
      return (
        (t.memoizedState = t.baseState = e),
        (t.queue = {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: Ln,
          lastRenderedState: e,
        }),
        t
      );
    }
    function Cg(e, t, n, a) {
      return ((e.baseState = n), Yc(e, ot, typeof a == "function" ? a : Ln));
    }
    function eb(e, t, n, a, i) {
      if (Zu(e)) throw Error(v(485));
      if (((e = t.action), e !== null)) {
        var l = {
          payload: i,
          action: e,
          next: null,
          isTransition: !0,
          status: "pending",
          value: null,
          reason: null,
          listeners: [],
          then: function (r) {
            l.listeners.push(r);
          },
        };
        (V.T !== null ? n(!0) : (l.isTransition = !1),
          a(l),
          (n = t.pending),
          n === null
            ? ((l.next = t.pending = l), Tg(t, l))
            : ((l.next = n.next), (t.pending = n.next = l)));
      }
    }
    function Tg(e, t) {
      var n = t.action,
        a = t.payload,
        i = e.state;
      if (t.isTransition) {
        var l = V.T,
          r = {};
        V.T = r;
        try {
          var u = n(i, a),
            s = V.S;
          (s !== null && s(r, u), Cd(e, t, u));
        } catch (o) {
          Qo(e, t, o);
        } finally {
          (l !== null && r.types !== null && (l.types = r.types), (V.T = l));
        }
      } else
        try {
          ((l = n(i, a)), Cd(e, t, l));
        } catch (o) {
          Qo(e, t, o);
        }
    }
    function Cd(e, t, n) {
      n !== null && typeof n == "object" && typeof n.then == "function"
        ? n.then(
            function (a) {
              Td(e, t, a);
            },
            function (a) {
              return Qo(e, t, a);
            },
          )
        : Td(e, t, n);
    }
    function Td(e, t, n) {
      ((t.status = "fulfilled"),
        (t.value = n),
        Eg(t),
        (e.state = n),
        (t = e.pending),
        t !== null &&
          ((n = t.next),
          n === t
            ? (e.pending = null)
            : ((n = n.next), (t.next = n), Tg(e, n))));
    }
    function Qo(e, t, n) {
      var a = e.pending;
      if (((e.pending = null), a !== null)) {
        a = a.next;
        do ((t.status = "rejected"), (t.reason = n), Eg(t), (t = t.next));
        while (t !== a);
      }
      e.action = null;
    }
    function Eg(e) {
      e = e.listeners;
      for (var t = 0; t < e.length; t++) (0, e[t])();
    }
    function Ag(e, t) {
      return t;
    }
    function Ed(e, t) {
      if (X) {
        var n = ft.formState;
        if (n !== null) {
          t: {
            var a = U;
            if (X) {
              if (yt) {
                e: {
                  for (var i = yt, l = Xe; i.nodeType !== 8;) {
                    if (!l) {
                      i = null;
                      break e;
                    }
                    if (((i = Qe(i.nextSibling)), i === null)) {
                      i = null;
                      break e;
                    }
                  }
                  ((l = i.data), (i = l === "F!" || l === "F" ? i : null));
                }
                if (i) {
                  ((yt = Qe(i.nextSibling)), (a = i.data === "F!"));
                  break t;
                }
              }
              da(a);
            }
            a = !1;
          }
          a && (t = n[0]);
        }
      }
      return (
        (n = fe()),
        (n.memoizedState = n.baseState = t),
        (a = {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: Ag,
          lastRenderedState: t,
        }),
        (n.queue = a),
        (n = Gg.bind(null, U, a)),
        (a.dispatch = n),
        (a = Io(!1)),
        (l = Zc.bind(null, U, !1, a.queue)),
        (a = fe()),
        (i = { state: t, dispatch: null, action: e, pending: null }),
        (a.queue = i),
        (n = eb.bind(null, U, i, l, n)),
        (i.dispatch = n),
        (a.memoizedState = e),
        [t, n, !1]
      );
    }
    function Ad(e) {
      var t = zt();
      return _g(t, ot, e);
    }
    function _g(e, t, n) {
      if (
        ((t = Yc(e, t, Ag)[0]),
        (e = nu(Ln)[0]),
        typeof t == "object" && t !== null && typeof t.then == "function")
      )
        try {
          var a = Jl(t);
        } catch (r) {
          throw r === Gi ? Pu : r;
        }
      else a = t;
      t = zt();
      var i = t.queue,
        l = i.dispatch;
      return (
        n !== t.memoizedState &&
          ((U.flags |= 2048),
          Di(9, { destroy: void 0 }, nb.bind(null, i, n), null)),
        [a, l, e]
      );
    }
    function nb(e, t) {
      e.action = t;
    }
    function _d(e) {
      var t = zt(),
        n = ot;
      if (n !== null) return _g(t, n, e);
      (zt(), (t = t.memoizedState), (n = zt()));
      var a = n.queue.dispatch;
      return ((n.memoizedState = e), [t, a, !1]);
    }
    function Di(e, t, n, a) {
      return (
        (e = { tag: e, create: n, deps: a, inst: t, next: null }),
        (t = U.updateQueue),
        t === null && ((t = Xu()), (U.updateQueue = t)),
        (n = t.lastEffect),
        n === null
          ? (t.lastEffect = e.next = e)
          : ((a = n.next), (n.next = e), (e.next = a), (t.lastEffect = e)),
        e
      );
    }
    function Og() {
      return zt().memoizedState;
    }
    function au(e, t, n, a) {
      var i = fe();
      ((U.flags |= e),
        (i.memoizedState = Di(
          1 | t,
          { destroy: void 0 },
          n,
          a === void 0 ? null : a,
        )));
    }
    function Qu(e, t, n, a) {
      var i = zt();
      a = a === void 0 ? null : a;
      var l = i.memoizedState.inst;
      ot !== null && a !== null && jc(a, ot.memoizedState.deps)
        ? (i.memoizedState = Di(t, l, n, a))
        : ((U.flags |= e), (i.memoizedState = Di(1 | t, l, n, a)));
    }
    function Od(e, t) {
      au(8390656, 8, e, t);
    }
    function Pc(e, t) {
      Qu(2048, 8, e, t);
    }
    function ab(e) {
      U.flags |= 4;
      var t = U.updateQueue;
      if (t === null) ((t = Xu()), (U.updateQueue = t), (t.events = [e]));
      else {
        var n = t.events;
        n === null ? (t.events = [e]) : n.push(e);
      }
    }
    function Ng(e) {
      var t = zt().memoizedState;
      return (
        ab({ ref: t, nextImpl: e }),
        function () {
          if (et & 2) throw Error(v(440));
          return t.impl.apply(void 0, arguments);
        }
      );
    }
    function wg(e, t) {
      return Qu(4, 2, e, t);
    }
    function xg(e, t) {
      return Qu(4, 4, e, t);
    }
    function Mg(e, t) {
      if (typeof t == "function") {
        e = e();
        var n = t(e);
        return function () {
          typeof n == "function" ? n() : t(null);
        };
      }
      if (t != null)
        return (
          (e = e()),
          (t.current = e),
          function () {
            t.current = null;
          }
        );
    }
    function Dg(e, t, n) {
      ((n = n != null ? n.concat([e]) : null),
        Qu(4, 4, Mg.bind(null, t, e), n));
    }
    function Xc() {}
    function Rg(e, t) {
      var n = zt();
      t = t === void 0 ? null : t;
      var a = n.memoizedState;
      return t !== null && jc(t, a[1]) ? a[0] : ((n.memoizedState = [e, t]), e);
    }
    function zg(e, t) {
      var n = zt();
      t = t === void 0 ? null : t;
      var a = n.memoizedState;
      if (t !== null && jc(t, a[1])) return a[0];
      if (((a = e()), Ba)) {
        Jn(!0);
        try {
          e();
        } finally {
          Jn(!1);
        }
      }
      return ((n.memoizedState = [a, t]), a);
    }
    function Ic(e, t, n) {
      return n === void 0 || (kn & 1073741824 && !(q & 261930))
        ? (e.memoizedState = t)
        : ((e.memoizedState = n), (e = Cp()), (U.lanes |= e), (ga |= e), n);
    }
    function Vg(e, t, n, a) {
      return Ue(n, t)
        ? n
        : Mi.current !== null
          ? ((e = Ic(e, n, a)), Ue(e, t) || (Ut = !0), e)
          : !(kn & 42) || (kn & 1073741824 && !(q & 261930))
            ? ((Ut = !0), (e.memoizedState = n))
            : ((e = Cp()), (U.lanes |= e), (ga |= e), t);
    }
    function kg(e, t, n, a, i) {
      var l = nt.p;
      nt.p = l !== 0 && 8 > l ? l : 8;
      var r = V.T,
        u = {};
      ((V.T = u), Zc(e, !1, t, n));
      try {
        var s = i(),
          o = V.S;
        if (
          (o !== null && o(u, s),
          s !== null && typeof s == "object" && typeof s.then == "function")
        ) {
          var c = J0(s, a);
          _l(e, t, c, Le(e));
        } else _l(e, t, a, Le(e));
      } catch (h) {
        _l(e, t, { then: function () {}, status: "rejected", reason: h }, Le());
      } finally {
        ((nt.p = l),
          r !== null && u.types !== null && (r.types = u.types),
          (V.T = r));
      }
    }
    function ib() {}
    function Zo(e, t, n, a) {
      if (e.tag !== 5) throw Error(v(476));
      var i = Lg(e).queue;
      kg(
        e,
        i,
        t,
        Ma,
        n === null
          ? ib
          : function () {
              return (Ug(e), n(a));
            },
      );
    }
    function Lg(e) {
      var t = e.memoizedState;
      if (t !== null) return t;
      t = {
        memoizedState: Ma,
        baseState: Ma,
        baseQueue: null,
        queue: {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: Ln,
          lastRenderedState: Ma,
        },
        next: null,
      };
      var n = {};
      return (
        (t.next = {
          memoizedState: n,
          baseState: n,
          baseQueue: null,
          queue: {
            pending: null,
            lanes: 0,
            dispatch: null,
            lastRenderedReducer: Ln,
            lastRenderedState: n,
          },
          next: null,
        }),
        (e.memoizedState = t),
        (e = e.alternate),
        e !== null && (e.memoizedState = t),
        t
      );
    }
    function Ug(e) {
      var t = Lg(e);
      (t.next === null && (t = e.alternate.memoizedState),
        _l(e, t.next.queue, {}, Le()));
    }
    function Qc() {
      return Jt(Wl);
    }
    function Bg() {
      return zt().memoizedState;
    }
    function jg() {
      return zt().memoizedState;
    }
    function lb(e) {
      for (var t = e.return; t !== null;) {
        switch (t.tag) {
          case 24:
          case 3:
            var n = Le();
            e = la(n);
            var a = ra(t, e, n);
            (a !== null && (be(a, t, n), Tl(a, t, n)),
              (t = { cache: Vc() }),
              (e.payload = t));
            return;
        }
        t = t.return;
      }
    }
    function rb(e, t, n) {
      var a = Le();
      ((n = {
        lane: a,
        revertLane: 0,
        gesture: null,
        action: n,
        hasEagerState: !1,
        eagerState: null,
        next: null,
      }),
        Zu(e)
          ? Hg(t, n)
          : ((n = Mc(e, t, n, a)), n !== null && (be(n, e, a), Wg(n, t, a))));
    }
    function Gg(e, t, n) {
      var a = Le();
      _l(e, t, n, a);
    }
    function _l(e, t, n, a) {
      var i = {
        lane: a,
        revertLane: 0,
        gesture: null,
        action: n,
        hasEagerState: !1,
        eagerState: null,
        next: null,
      };
      if (Zu(e)) Hg(t, i);
      else {
        var l = e.alternate;
        if (
          e.lanes === 0 &&
          (l === null || l.lanes === 0) &&
          ((l = t.lastRenderedReducer), l !== null)
        )
          try {
            var r = t.lastRenderedState,
              u = l(r, n);
            if (((i.hasEagerState = !0), (i.eagerState = u), Ue(u, r)))
              return (Yu(e, t, i, 0), ft === null && qu(), !1);
          } catch {
          } finally {
          }
        if (((n = Mc(e, t, i, a)), n !== null))
          return (be(n, e, a), Wg(n, t, a), !0);
      }
      return !1;
    }
    function Zc(e, t, n, a) {
      if (
        ((a = {
          lane: 2,
          revertLane: rf(),
          gesture: null,
          action: a,
          hasEagerState: !1,
          eagerState: null,
          next: null,
        }),
        Zu(e))
      ) {
        if (t) throw Error(v(479));
      } else ((t = Mc(e, n, a, 2)), t !== null && be(t, e, 2));
    }
    function Zu(e) {
      var t = e.alternate;
      return e === U || (t !== null && t === U);
    }
    function Hg(e, t) {
      Ai = Eu = !0;
      var n = e.pending;
      (n === null ? (t.next = t) : ((t.next = n.next), (n.next = t)),
        (e.pending = t));
    }
    function Wg(e, t, n) {
      if (n & 4194048) {
        var a = t.lanes;
        ((a &= e.pendingLanes), (n |= a), (t.lanes = n), Nm(e, n));
      }
    }
    var jl = {
      readContext: Jt,
      use: Iu,
      useCallback: xt,
      useContext: xt,
      useEffect: xt,
      useImperativeHandle: xt,
      useLayoutEffect: xt,
      useInsertionEffect: xt,
      useMemo: xt,
      useReducer: xt,
      useRef: xt,
      useState: xt,
      useDebugValue: xt,
      useDeferredValue: xt,
      useTransition: xt,
      useSyncExternalStore: xt,
      useId: xt,
      useHostTransitionStatus: xt,
      useFormState: xt,
      useActionState: xt,
      useOptimistic: xt,
      useMemoCache: xt,
      useCacheRefresh: xt,
    };
    jl.useEffectEvent = xt;
    var Fg = {
        readContext: Jt,
        use: Iu,
        useCallback: function (e, t) {
          return ((fe().memoizedState = [e, t === void 0 ? null : t]), e);
        },
        useContext: Jt,
        useEffect: Od,
        useImperativeHandle: function (e, t, n) {
          ((n = n != null ? n.concat([e]) : null),
            au(4194308, 4, Mg.bind(null, t, e), n));
        },
        useLayoutEffect: function (e, t) {
          return au(4194308, 4, e, t);
        },
        useInsertionEffect: function (e, t) {
          au(4, 2, e, t);
        },
        useMemo: function (e, t) {
          var n = fe();
          t = t === void 0 ? null : t;
          var a = e();
          if (Ba) {
            Jn(!0);
            try {
              e();
            } finally {
              Jn(!1);
            }
          }
          return ((n.memoizedState = [a, t]), a);
        },
        useReducer: function (e, t, n) {
          var a = fe();
          if (n !== void 0) {
            var i = n(t);
            if (Ba) {
              Jn(!0);
              try {
                n(t);
              } finally {
                Jn(!1);
              }
            }
          } else i = t;
          return (
            (a.memoizedState = a.baseState = i),
            (e = {
              pending: null,
              lanes: 0,
              dispatch: null,
              lastRenderedReducer: e,
              lastRenderedState: i,
            }),
            (a.queue = e),
            (e = e.dispatch = rb.bind(null, U, e)),
            [a.memoizedState, e]
          );
        },
        useRef: function (e) {
          var t = fe();
          return ((e = { current: e }), (t.memoizedState = e));
        },
        useState: function (e) {
          e = Io(e);
          var t = e.queue,
            n = Gg.bind(null, U, t);
          return ((t.dispatch = n), [e.memoizedState, n]);
        },
        useDebugValue: Xc,
        useDeferredValue: function (e, t) {
          var n = fe();
          return Ic(n, e, t);
        },
        useTransition: function () {
          var e = Io(!1);
          return (
            (e = kg.bind(null, U, e.queue, !0, !1)),
            (fe().memoizedState = e),
            [!1, e]
          );
        },
        useSyncExternalStore: function (e, t, n) {
          var a = U,
            i = fe();
          if (X) {
            if (n === void 0) throw Error(v(407));
            n = n();
          } else {
            if (((n = t()), ft === null)) throw Error(v(349));
            q & 127 || pg(a, t, n);
          }
          i.memoizedState = n;
          var l = { value: n, getSnapshot: t };
          return (
            (i.queue = l),
            Od(vg.bind(null, a, l, e), [e]),
            (a.flags |= 2048),
            Di(9, { destroy: void 0 }, yg.bind(null, a, l, n, t), null),
            n
          );
        },
        useId: function () {
          var e = fe(),
            t = ft.identifierPrefix;
          if (X) {
            var n = cn,
              a = on;
            ((n = (a & ~(1 << (32 - ke(a) - 1))).toString(32) + n),
              (t = "_" + t + "R_" + n),
              (n = Au++),
              0 < n && (t += "H" + n.toString(32)),
              (t += "_"));
          } else ((n = $0++), (t = "_" + t + "r_" + n.toString(32) + "_"));
          return (e.memoizedState = t);
        },
        useHostTransitionStatus: Qc,
        useFormState: Ed,
        useActionState: Ed,
        useOptimistic: function (e) {
          var t = fe();
          t.memoizedState = t.baseState = e;
          var n = {
            pending: null,
            lanes: 0,
            dispatch: null,
            lastRenderedReducer: null,
            lastRenderedState: null,
          };
          return (
            (t.queue = n),
            (t = Zc.bind(null, U, !0, n)),
            (n.dispatch = t),
            [e, t]
          );
        },
        useMemoCache: qc,
        useCacheRefresh: function () {
          return (fe().memoizedState = lb.bind(null, U));
        },
        useEffectEvent: function (e) {
          var t = fe(),
            n = { impl: e };
          return (
            (t.memoizedState = n),
            function () {
              if (et & 2) throw Error(v(440));
              return n.impl.apply(void 0, arguments);
            }
          );
        },
      },
      Kc = {
        readContext: Jt,
        use: Iu,
        useCallback: Rg,
        useContext: Jt,
        useEffect: Pc,
        useImperativeHandle: Dg,
        useInsertionEffect: wg,
        useLayoutEffect: xg,
        useMemo: zg,
        useReducer: nu,
        useRef: Og,
        useState: function () {
          return nu(Ln);
        },
        useDebugValue: Xc,
        useDeferredValue: function (e, t) {
          var n = zt();
          return Vg(n, ot.memoizedState, e, t);
        },
        useTransition: function () {
          var e = nu(Ln)[0],
            t = zt().memoizedState;
          return [typeof e == "boolean" ? e : Jl(e), t];
        },
        useSyncExternalStore: gg,
        useId: Bg,
        useHostTransitionStatus: Qc,
        useFormState: Ad,
        useActionState: Ad,
        useOptimistic: function (e, t) {
          var n = zt();
          return Cg(n, ot, e, t);
        },
        useMemoCache: qc,
        useCacheRefresh: jg,
      };
    Kc.useEffectEvent = Ng;
    var qg = {
      readContext: Jt,
      use: Iu,
      useCallback: Rg,
      useContext: Jt,
      useEffect: Pc,
      useImperativeHandle: Dg,
      useInsertionEffect: wg,
      useLayoutEffect: xg,
      useMemo: zg,
      useReducer: ao,
      useRef: Og,
      useState: function () {
        return ao(Ln);
      },
      useDebugValue: Xc,
      useDeferredValue: function (e, t) {
        var n = zt();
        return ot === null ? Ic(n, e, t) : Vg(n, ot.memoizedState, e, t);
      },
      useTransition: function () {
        var e = ao(Ln)[0],
          t = zt().memoizedState;
        return [typeof e == "boolean" ? e : Jl(e), t];
      },
      useSyncExternalStore: gg,
      useId: Bg,
      useHostTransitionStatus: Qc,
      useFormState: _d,
      useActionState: _d,
      useOptimistic: function (e, t) {
        var n = zt();
        return ot !== null
          ? Cg(n, ot, e, t)
          : ((n.baseState = e), [e, n.queue.dispatch]);
      },
      useMemoCache: qc,
      useCacheRefresh: jg,
    };
    qg.useEffectEvent = Ng;
    function io(e, t, n, a) {
      ((t = e.memoizedState),
        (n = n(a, t)),
        (n = n == null ? t : vt({}, t, n)),
        (e.memoizedState = n),
        e.lanes === 0 && (e.updateQueue.baseState = n));
    }
    var Ko = {
      enqueueSetState: function (e, t, n) {
        e = e._reactInternals;
        var a = Le(),
          i = la(a);
        ((i.payload = t),
          n != null && (i.callback = n),
          (t = ra(e, i, a)),
          t !== null && (be(t, e, a), Tl(t, e, a)));
      },
      enqueueReplaceState: function (e, t, n) {
        e = e._reactInternals;
        var a = Le(),
          i = la(a);
        ((i.tag = 1),
          (i.payload = t),
          n != null && (i.callback = n),
          (t = ra(e, i, a)),
          t !== null && (be(t, e, a), Tl(t, e, a)));
      },
      enqueueForceUpdate: function (e, t) {
        e = e._reactInternals;
        var n = Le(),
          a = la(n);
        ((a.tag = 2),
          t != null && (a.callback = t),
          (t = ra(e, a, n)),
          t !== null && (be(t, e, n), Tl(t, e, n)));
      },
    };
    function Nd(e, t, n, a, i, l, r) {
      return (
        (e = e.stateNode),
        typeof e.shouldComponentUpdate == "function"
          ? e.shouldComponentUpdate(a, l, r)
          : t.prototype && t.prototype.isPureReactComponent
            ? !Vl(n, a) || !Vl(i, l)
            : !0
      );
    }
    function wd(e, t, n, a) {
      ((e = t.state),
        typeof t.componentWillReceiveProps == "function" &&
          t.componentWillReceiveProps(n, a),
        typeof t.UNSAFE_componentWillReceiveProps == "function" &&
          t.UNSAFE_componentWillReceiveProps(n, a),
        t.state !== e && Ko.enqueueReplaceState(t, t.state, null));
    }
    function ja(e, t) {
      var n = t;
      if ("ref" in t) {
        n = {};
        for (var a in t) a !== "ref" && (n[a] = t[a]);
      }
      if ((e = e.defaultProps)) {
        n === t && (n = vt({}, n));
        for (var i in e) n[i] === void 0 && (n[i] = e[i]);
      }
      return n;
    }
    function Yg(e) {
      pu(e);
    }
    function Pg(e) {
      console.error(e);
    }
    function Xg(e) {
      pu(e);
    }
    function _u(e, t) {
      try {
        var n = e.onUncaughtError;
        n(t.value, { componentStack: t.stack });
      } catch (a) {
        setTimeout(function () {
          throw a;
        });
      }
    }
    function xd(e, t, n) {
      try {
        var a = e.onCaughtError;
        a(n.value, {
          componentStack: n.stack,
          errorBoundary: t.tag === 1 ? t.stateNode : null,
        });
      } catch (i) {
        setTimeout(function () {
          throw i;
        });
      }
    }
    function Jo(e, t, n) {
      return (
        (n = la(n)),
        (n.tag = 3),
        (n.payload = { element: null }),
        (n.callback = function () {
          _u(e, t);
        }),
        n
      );
    }
    function Ig(e) {
      return ((e = la(e)), (e.tag = 3), e);
    }
    function Qg(e, t, n, a) {
      var i = n.type.getDerivedStateFromError;
      if (typeof i == "function") {
        var l = a.value;
        ((e.payload = function () {
          return i(l);
        }),
          (e.callback = function () {
            xd(t, n, a);
          }));
      }
      var r = n.stateNode;
      r !== null &&
        typeof r.componentDidCatch == "function" &&
        (e.callback = function () {
          (xd(t, n, a),
            typeof i != "function" &&
              (ua === null ? (ua = new Set([this])) : ua.add(this)));
          var u = a.stack;
          this.componentDidCatch(a.value, {
            componentStack: u !== null ? u : "",
          });
        });
    }
    function ub(e, t, n, a, i) {
      if (
        ((n.flags |= 32768),
        a !== null && typeof a == "object" && typeof a.then == "function")
      ) {
        if (
          ((t = n.alternate),
          t !== null && ji(t, n, i, !0),
          (n = Be.current),
          n !== null)
        ) {
          switch (n.tag) {
            case 31:
            case 13:
              return (
                Ie === null
                  ? Mu()
                  : n.alternate === null && Mt === 0 && (Mt = 3),
                (n.flags &= -257),
                (n.flags |= 65536),
                (n.lanes = i),
                a === bu
                  ? (n.flags |= 16384)
                  : ((t = n.updateQueue),
                    t === null ? (n.updateQueue = new Set([a])) : t.add(a),
                    po(e, a, i)),
                !1
              );
            case 22:
              return (
                (n.flags |= 65536),
                a === bu
                  ? (n.flags |= 16384)
                  : ((t = n.updateQueue),
                    t === null
                      ? ((t = {
                          transitions: null,
                          markerInstances: null,
                          retryQueue: new Set([a]),
                        }),
                        (n.updateQueue = t))
                      : ((n = t.retryQueue),
                        n === null ? (t.retryQueue = new Set([a])) : n.add(a)),
                    po(e, a, i)),
                !1
              );
          }
          throw Error(v(435, n.tag));
        }
        return (po(e, a, i), Mu(), !1);
      }
      if (X)
        return (
          (t = Be.current),
          t !== null
            ? (!(t.flags & 65536) && (t.flags |= 256),
              (t.flags |= 65536),
              (t.lanes = i),
              a !== jo && ((e = Error(v(422), { cause: a })), Ll(Pe(e, n))))
            : (a !== jo && ((t = Error(v(423), { cause: a })), Ll(Pe(t, n))),
              (e = e.current.alternate),
              (e.flags |= 65536),
              (i &= -i),
              (e.lanes |= i),
              (a = Pe(a, n)),
              (i = Jo(e.stateNode, a, i)),
              no(e, i),
              Mt !== 4 && (Mt = 2)),
          !1
        );
      var l = Error(v(520), { cause: a });
      if (
        ((l = Pe(l, n)),
        wl === null ? (wl = [l]) : wl.push(l),
        Mt !== 4 && (Mt = 2),
        t === null)
      )
        return !0;
      ((a = Pe(a, n)), (n = t));
      do {
        switch (n.tag) {
          case 3:
            return (
              (n.flags |= 65536),
              (e = i & -i),
              (n.lanes |= e),
              (e = Jo(n.stateNode, a, e)),
              no(n, e),
              !1
            );
          case 1:
            if (
              ((t = n.type),
              (l = n.stateNode),
              (n.flags & 128) === 0 &&
                (typeof t.getDerivedStateFromError == "function" ||
                  (l !== null &&
                    typeof l.componentDidCatch == "function" &&
                    (ua === null || !ua.has(l)))))
            )
              return (
                (n.flags |= 65536),
                (i &= -i),
                (n.lanes |= i),
                (i = Ig(i)),
                Qg(i, e, n, a),
                no(n, i),
                !1
              );
        }
        n = n.return;
      } while (n !== null);
      return !1;
    }
    var Jc = Error(v(461)),
      Ut = !1;
    function Qt(e, t, n, a) {
      t.child = e === null ? og(t, null, n, a) : Ua(t, e.child, n, a);
    }
    function Md(e, t, n, a, i) {
      n = n.render;
      var l = t.ref;
      if ("ref" in a) {
        var r = {};
        for (var u in a) u !== "ref" && (r[u] = a[u]);
      } else r = a;
      return (
        La(t),
        (a = Gc(e, t, n, r, l, i)),
        (u = Hc()),
        e !== null && !Ut
          ? (Wc(e, t, i), Un(e, t, i))
          : (X && u && Rc(t), (t.flags |= 1), Qt(e, t, a, i), t.child)
      );
    }
    function Dd(e, t, n, a, i) {
      if (e === null) {
        var l = n.type;
        return typeof l == "function" &&
          !Dc(l) &&
          l.defaultProps === void 0 &&
          n.compare === null
          ? ((t.tag = 15), (t.type = l), Zg(e, t, l, a, i))
          : ((e = tu(n.type, null, a, t, t.mode, i)),
            (e.ref = t.ref),
            (e.return = t),
            (t.child = e));
      }
      if (((l = e.child), !$c(e, i))) {
        var r = l.memoizedProps;
        if (
          ((n = n.compare),
          (n = n !== null ? n : Vl),
          n(r, a) && e.ref === t.ref)
        )
          return Un(e, t, i);
      }
      return (
        (t.flags |= 1),
        (e = Dn(l, a)),
        (e.ref = t.ref),
        (e.return = t),
        (t.child = e)
      );
    }
    function Zg(e, t, n, a, i) {
      if (e !== null) {
        var l = e.memoizedProps;
        if (Vl(l, a) && e.ref === t.ref)
          if (((Ut = !1), (t.pendingProps = a = l), $c(e, i)))
            e.flags & 131072 && (Ut = !0);
          else return ((t.lanes = e.lanes), Un(e, t, i));
      }
      return $o(e, t, n, a, i);
    }
    function Kg(e, t, n, a) {
      var i = a.children,
        l = e !== null ? e.memoizedState : null;
      if (
        (e === null &&
          t.stateNode === null &&
          (t.stateNode = {
            _visibility: 1,
            _pendingMarkers: null,
            _retryCache: null,
            _transitions: null,
          }),
        a.mode === "hidden")
      ) {
        if (t.flags & 128) {
          if (((l = l !== null ? l.baseLanes | n : n), e !== null)) {
            for (a = t.child = e.child, i = 0; a !== null;)
              ((i = i | a.lanes | a.childLanes), (a = a.sibling));
            a = i & ~l;
          } else ((a = 0), (t.child = null));
          return Rd(e, t, l, n, a);
        }
        if (n & 536870912)
          ((t.memoizedState = { baseLanes: 0, cachePool: null }),
            e !== null && eu(t, l !== null ? l.cachePool : null),
            l !== null ? bd(t, l) : Po(),
            hg(t));
        else
          return (
            (a = t.lanes = 536870912),
            Rd(e, t, l !== null ? l.baseLanes | n : n, n, a)
          );
      } else
        l !== null
          ? (eu(t, l.cachePool), bd(t, l), Zn(t), (t.memoizedState = null))
          : (e !== null && eu(t, null), Po(), Zn(t));
      return (Qt(e, t, i, n), t.child);
    }
    function pl(e, t) {
      return (
        (e !== null && e.tag === 22) ||
          t.stateNode !== null ||
          (t.stateNode = {
            _visibility: 1,
            _pendingMarkers: null,
            _retryCache: null,
            _transitions: null,
          }),
        t.sibling
      );
    }
    function Rd(e, t, n, a, i) {
      var l = kc();
      return (
        (l = l === null ? null : { parent: Lt._currentValue, pool: l }),
        (t.memoizedState = { baseLanes: n, cachePool: l }),
        e !== null && eu(t, null),
        Po(),
        hg(t),
        e !== null && ji(e, t, a, !0),
        (t.childLanes = i),
        null
      );
    }
    function iu(e, t) {
      return (
        (t = Ou({ mode: t.mode, children: t.children }, e.mode)),
        (t.ref = e.ref),
        (e.child = t),
        (t.return = e),
        t
      );
    }
    function zd(e, t, n) {
      return (
        Ua(t, e.child, null, n),
        (e = iu(t, t.pendingProps)),
        (e.flags |= 2),
        Me(t),
        (t.memoizedState = null),
        e
      );
    }
    function sb(e, t, n) {
      var a = t.pendingProps,
        i = (t.flags & 128) !== 0;
      if (((t.flags &= -129), e === null)) {
        if (X) {
          if (a.mode === "hidden")
            return ((e = iu(t, a)), (t.lanes = 536870912), pl(null, e));
          if (
            (Xo(t),
            (e = yt)
              ? ((e = Fp(e, Xe)),
                (e = e !== null && e.data === "&" ? e : null),
                e !== null &&
                  ((t.memoizedState = {
                    dehydrated: e,
                    treeContext: ha !== null ? { id: on, overflow: cn } : null,
                    retryLane: 536870912,
                    hydrationErrors: null,
                  }),
                  (n = ng(e)),
                  (n.return = t),
                  (t.child = n),
                  (Kt = t),
                  (yt = null)))
              : (e = null),
            e === null)
          )
            throw da(t);
          return ((t.lanes = 536870912), null);
        }
        return iu(t, a);
      }
      var l = e.memoizedState;
      if (l !== null) {
        var r = l.dehydrated;
        if ((Xo(t), i))
          if (t.flags & 256) ((t.flags &= -257), (t = zd(e, t, n)));
          else if (t.memoizedState !== null)
            ((t.child = e.child), (t.flags |= 128), (t = null));
          else throw Error(v(558));
        else if (
          (Ut || ji(e, t, n, !1), (i = (n & e.childLanes) !== 0), Ut || i)
        ) {
          if (
            ((a = ft),
            a !== null && ((r = wm(a, n)), r !== 0 && r !== l.retryLane))
          )
            throw ((l.retryLane = r), Fa(e, r), be(a, e, r), Jc);
          (Mu(), (t = zd(e, t, n)));
        } else
          ((e = l.treeContext),
            (yt = Qe(r.nextSibling)),
            (Kt = t),
            (X = !0),
            (ia = null),
            (Xe = !1),
            e !== null && ig(t, e),
            (t = iu(t, a)),
            (t.flags |= 4096));
        return t;
      }
      return (
        (e = Dn(e.child, { mode: a.mode, children: a.children })),
        (e.ref = t.ref),
        (t.child = e),
        (e.return = t),
        e
      );
    }
    function lu(e, t) {
      var n = t.ref;
      if (n === null) e !== null && e.ref !== null && (t.flags |= 4194816);
      else {
        if (typeof n != "function" && typeof n != "object") throw Error(v(284));
        (e === null || e.ref !== n) && (t.flags |= 4194816);
      }
    }
    function $o(e, t, n, a, i) {
      return (
        La(t),
        (n = Gc(e, t, n, a, void 0, i)),
        (a = Hc()),
        e !== null && !Ut
          ? (Wc(e, t, i), Un(e, t, i))
          : (X && a && Rc(t), (t.flags |= 1), Qt(e, t, n, i), t.child)
      );
    }
    function Vd(e, t, n, a, i, l) {
      return (
        La(t),
        (t.updateQueue = null),
        (n = mg(t, a, n, i)),
        dg(e),
        (a = Hc()),
        e !== null && !Ut
          ? (Wc(e, t, l), Un(e, t, l))
          : (X && a && Rc(t), (t.flags |= 1), Qt(e, t, n, l), t.child)
      );
    }
    function kd(e, t, n, a, i) {
      if ((La(t), t.stateNode === null)) {
        var l = gi,
          r = n.contextType;
        (typeof r == "object" && r !== null && (l = Jt(r)),
          (l = new n(a, l)),
          (t.memoizedState =
            l.state !== null && l.state !== void 0 ? l.state : null),
          (l.updater = Ko),
          (t.stateNode = l),
          (l._reactInternals = t),
          (l = t.stateNode),
          (l.props = a),
          (l.state = t.memoizedState),
          (l.refs = {}),
          Uc(t),
          (r = n.contextType),
          (l.context = typeof r == "object" && r !== null ? Jt(r) : gi),
          (l.state = t.memoizedState),
          (r = n.getDerivedStateFromProps),
          typeof r == "function" &&
            (io(t, n, r, a), (l.state = t.memoizedState)),
          typeof n.getDerivedStateFromProps == "function" ||
            typeof l.getSnapshotBeforeUpdate == "function" ||
            (typeof l.UNSAFE_componentWillMount != "function" &&
              typeof l.componentWillMount != "function") ||
            ((r = l.state),
            typeof l.componentWillMount == "function" && l.componentWillMount(),
            typeof l.UNSAFE_componentWillMount == "function" &&
              l.UNSAFE_componentWillMount(),
            r !== l.state && Ko.enqueueReplaceState(l, l.state, null),
            Al(t, a, l, i),
            El(),
            (l.state = t.memoizedState)),
          typeof l.componentDidMount == "function" && (t.flags |= 4194308),
          (a = !0));
      } else if (e === null) {
        l = t.stateNode;
        var u = t.memoizedProps,
          s = ja(n, u);
        l.props = s;
        var o = l.context,
          c = n.contextType;
        ((r = gi), typeof c == "object" && c !== null && (r = Jt(c)));
        var h = n.getDerivedStateFromProps;
        ((c =
          typeof h == "function" ||
          typeof l.getSnapshotBeforeUpdate == "function"),
          (u = t.pendingProps !== u),
          c ||
            (typeof l.UNSAFE_componentWillReceiveProps != "function" &&
              typeof l.componentWillReceiveProps != "function") ||
            ((u || o !== r) && wd(t, l, a, r)),
          (Xn = !1));
        var f = t.memoizedState;
        ((l.state = f),
          Al(t, a, l, i),
          El(),
          (o = t.memoizedState),
          u || f !== o || Xn
            ? (typeof h == "function" &&
                (io(t, n, h, a), (o = t.memoizedState)),
              (s = Xn || Nd(t, n, s, a, f, o, r))
                ? (c ||
                    (typeof l.UNSAFE_componentWillMount != "function" &&
                      typeof l.componentWillMount != "function") ||
                    (typeof l.componentWillMount == "function" &&
                      l.componentWillMount(),
                    typeof l.UNSAFE_componentWillMount == "function" &&
                      l.UNSAFE_componentWillMount()),
                  typeof l.componentDidMount == "function" &&
                    (t.flags |= 4194308))
                : (typeof l.componentDidMount == "function" &&
                    (t.flags |= 4194308),
                  (t.memoizedProps = a),
                  (t.memoizedState = o)),
              (l.props = a),
              (l.state = o),
              (l.context = r),
              (a = s))
            : (typeof l.componentDidMount == "function" && (t.flags |= 4194308),
              (a = !1)));
      } else {
        ((l = t.stateNode),
          qo(e, t),
          (r = t.memoizedProps),
          (c = ja(n, r)),
          (l.props = c),
          (h = t.pendingProps),
          (f = l.context),
          (o = n.contextType),
          (s = gi),
          typeof o == "object" && o !== null && (s = Jt(o)),
          (u = n.getDerivedStateFromProps),
          (o =
            typeof u == "function" ||
            typeof l.getSnapshotBeforeUpdate == "function") ||
            (typeof l.UNSAFE_componentWillReceiveProps != "function" &&
              typeof l.componentWillReceiveProps != "function") ||
            ((r !== h || f !== s) && wd(t, l, a, s)),
          (Xn = !1),
          (f = t.memoizedState),
          (l.state = f),
          Al(t, a, l, i),
          El());
        var p = t.memoizedState;
        r !== h ||
        f !== p ||
        Xn ||
        (e !== null && e.dependencies !== null && Su(e.dependencies))
          ? (typeof u == "function" && (io(t, n, u, a), (p = t.memoizedState)),
            (c =
              Xn ||
              Nd(t, n, c, a, f, p, s) ||
              (e !== null && e.dependencies !== null && Su(e.dependencies)))
              ? (o ||
                  (typeof l.UNSAFE_componentWillUpdate != "function" &&
                    typeof l.componentWillUpdate != "function") ||
                  (typeof l.componentWillUpdate == "function" &&
                    l.componentWillUpdate(a, p, s),
                  typeof l.UNSAFE_componentWillUpdate == "function" &&
                    l.UNSAFE_componentWillUpdate(a, p, s)),
                typeof l.componentDidUpdate == "function" && (t.flags |= 4),
                typeof l.getSnapshotBeforeUpdate == "function" &&
                  (t.flags |= 1024))
              : (typeof l.componentDidUpdate != "function" ||
                  (r === e.memoizedProps && f === e.memoizedState) ||
                  (t.flags |= 4),
                typeof l.getSnapshotBeforeUpdate != "function" ||
                  (r === e.memoizedProps && f === e.memoizedState) ||
                  (t.flags |= 1024),
                (t.memoizedProps = a),
                (t.memoizedState = p)),
            (l.props = a),
            (l.state = p),
            (l.context = s),
            (a = c))
          : (typeof l.componentDidUpdate != "function" ||
              (r === e.memoizedProps && f === e.memoizedState) ||
              (t.flags |= 4),
            typeof l.getSnapshotBeforeUpdate != "function" ||
              (r === e.memoizedProps && f === e.memoizedState) ||
              (t.flags |= 1024),
            (a = !1));
      }
      return (
        (l = a),
        lu(e, t),
        (a = (t.flags & 128) !== 0),
        l || a
          ? ((l = t.stateNode),
            (n =
              a && typeof n.getDerivedStateFromError != "function"
                ? null
                : l.render()),
            (t.flags |= 1),
            e !== null && a
              ? ((t.child = Ua(t, e.child, null, i)),
                (t.child = Ua(t, null, n, i)))
              : Qt(e, t, n, i),
            (t.memoizedState = l.state),
            (e = t.child))
          : (e = Un(e, t, i)),
        e
      );
    }
    function Ld(e, t, n, a) {
      return (ka(), (t.flags |= 256), Qt(e, t, n, a), t.child);
    }
    var lo = {
      dehydrated: null,
      treeContext: null,
      retryLane: 0,
      hydrationErrors: null,
    };
    function ro(e) {
      return { baseLanes: e, cachePool: rg() };
    }
    function uo(e, t, n) {
      return ((e = e !== null ? e.childLanes & ~n : 0), t && (e |= Re), e);
    }
    function Jg(e, t, n) {
      var a = t.pendingProps,
        i = !1,
        l = (t.flags & 128) !== 0,
        r;
      if (
        ((r = l) ||
          (r =
            e !== null && e.memoizedState === null
              ? !1
              : (Rt.current & 2) !== 0),
        r && ((i = !0), (t.flags &= -129)),
        (r = (t.flags & 32) !== 0),
        (t.flags &= -33),
        e === null)
      ) {
        if (X) {
          if (
            (i ? Qn(t) : Zn(t),
            (e = yt)
              ? ((e = Fp(e, Xe)),
                (e = e !== null && e.data !== "&" ? e : null),
                e !== null &&
                  ((t.memoizedState = {
                    dehydrated: e,
                    treeContext: ha !== null ? { id: on, overflow: cn } : null,
                    retryLane: 536870912,
                    hydrationErrors: null,
                  }),
                  (n = ng(e)),
                  (n.return = t),
                  (t.child = n),
                  (Kt = t),
                  (yt = null)))
              : (e = null),
            e === null)
          )
            throw da(t);
          return (dc(e) ? (t.lanes = 32) : (t.lanes = 536870912), null);
        }
        var u = a.children;
        return (
          (a = a.fallback),
          i
            ? (Zn(t),
              (i = t.mode),
              (u = Ou({ mode: "hidden", children: u }, i)),
              (a = Da(a, i, n, null)),
              (u.return = t),
              (a.return = t),
              (u.sibling = a),
              (t.child = u),
              (a = t.child),
              (a.memoizedState = ro(n)),
              (a.childLanes = uo(e, r, n)),
              (t.memoizedState = lo),
              pl(null, a))
            : (Qn(t), tc(t, u))
        );
      }
      var s = e.memoizedState;
      if (s !== null && ((u = s.dehydrated), u !== null)) {
        if (l)
          t.flags & 256
            ? (Qn(t), (t.flags &= -257), (t = so(e, t, n)))
            : t.memoizedState !== null
              ? (Zn(t), (t.child = e.child), (t.flags |= 128), (t = null))
              : (Zn(t),
                (u = a.fallback),
                (i = t.mode),
                (a = Ou({ mode: "visible", children: a.children }, i)),
                (u = Da(u, i, n, null)),
                (u.flags |= 2),
                (a.return = t),
                (u.return = t),
                (a.sibling = u),
                (t.child = a),
                Ua(t, e.child, null, n),
                (a = t.child),
                (a.memoizedState = ro(n)),
                (a.childLanes = uo(e, r, n)),
                (t.memoizedState = lo),
                (t = pl(null, a)));
        else if ((Qn(t), dc(u))) {
          if (((r = u.nextSibling && u.nextSibling.dataset), r)) var o = r.dgst;
          ((r = o),
            (a = Error(v(419))),
            (a.stack = ""),
            (a.digest = r),
            Ll({ value: a, source: null, stack: null }),
            (t = so(e, t, n)));
        } else if (
          (Ut || ji(e, t, n, !1), (r = (n & e.childLanes) !== 0), Ut || r)
        ) {
          if (
            ((r = ft),
            r !== null && ((a = wm(r, n)), a !== 0 && a !== s.retryLane))
          )
            throw ((s.retryLane = a), Fa(e, a), be(r, e, a), Jc);
          (hc(u) || Mu(), (t = so(e, t, n)));
        } else
          hc(u)
            ? ((t.flags |= 192), (t.child = e.child), (t = null))
            : ((e = s.treeContext),
              (yt = Qe(u.nextSibling)),
              (Kt = t),
              (X = !0),
              (ia = null),
              (Xe = !1),
              e !== null && ig(t, e),
              (t = tc(t, a.children)),
              (t.flags |= 4096));
        return t;
      }
      return i
        ? (Zn(t),
          (u = a.fallback),
          (i = t.mode),
          (s = e.child),
          (o = s.sibling),
          (a = Dn(s, { mode: "hidden", children: a.children })),
          (a.subtreeFlags = s.subtreeFlags & 65011712),
          o !== null
            ? (u = Dn(o, u))
            : ((u = Da(u, i, n, null)), (u.flags |= 2)),
          (u.return = t),
          (a.return = t),
          (a.sibling = u),
          (t.child = a),
          pl(null, a),
          (a = t.child),
          (u = e.child.memoizedState),
          u === null
            ? (u = ro(n))
            : ((i = u.cachePool),
              i !== null
                ? ((s = Lt._currentValue),
                  (i = i.parent !== s ? { parent: s, pool: s } : i))
                : (i = rg()),
              (u = { baseLanes: u.baseLanes | n, cachePool: i })),
          (a.memoizedState = u),
          (a.childLanes = uo(e, r, n)),
          (t.memoizedState = lo),
          pl(e.child, a))
        : (Qn(t),
          (n = e.child),
          (e = n.sibling),
          (n = Dn(n, { mode: "visible", children: a.children })),
          (n.return = t),
          (n.sibling = null),
          e !== null &&
            ((r = t.deletions),
            r === null ? ((t.deletions = [e]), (t.flags |= 16)) : r.push(e)),
          (t.child = n),
          (t.memoizedState = null),
          n);
    }
    function tc(e, t) {
      return (
        (t = Ou({ mode: "visible", children: t }, e.mode)),
        (t.return = e),
        (e.child = t)
      );
    }
    function Ou(e, t) {
      return ((e = De(22, e, null, t)), (e.lanes = 0), e);
    }
    function so(e, t, n) {
      return (
        Ua(t, e.child, null, n),
        (e = tc(t, t.pendingProps.children)),
        (e.flags |= 2),
        (t.memoizedState = null),
        e
      );
    }
    function Ud(e, t, n) {
      e.lanes |= t;
      var a = e.alternate;
      (a !== null && (a.lanes |= t), Ho(e.return, t, n));
    }
    function oo(e, t, n, a, i, l) {
      var r = e.memoizedState;
      r === null
        ? (e.memoizedState = {
            isBackwards: t,
            rendering: null,
            renderingStartTime: 0,
            last: a,
            tail: n,
            tailMode: i,
            treeForkCount: l,
          })
        : ((r.isBackwards = t),
          (r.rendering = null),
          (r.renderingStartTime = 0),
          (r.last = a),
          (r.tail = n),
          (r.tailMode = i),
          (r.treeForkCount = l));
    }
    function $g(e, t, n) {
      var a = t.pendingProps,
        i = a.revealOrder,
        l = a.tail;
      a = a.children;
      var r = Rt.current,
        u = (r & 2) !== 0;
      if (
        (u ? ((r = (r & 1) | 2), (t.flags |= 128)) : (r &= 1),
        dt(Rt, r),
        Qt(e, t, a, n),
        (a = X ? kl : 0),
        !u && e !== null && e.flags & 128)
      )
        t: for (e = t.child; e !== null;) {
          if (e.tag === 13) e.memoizedState !== null && Ud(e, n, t);
          else if (e.tag === 19) Ud(e, n, t);
          else if (e.child !== null) {
            ((e.child.return = e), (e = e.child));
            continue;
          }
          if (e === t) break t;
          for (; e.sibling === null;) {
            if (e.return === null || e.return === t) break t;
            e = e.return;
          }
          ((e.sibling.return = e.return), (e = e.sibling));
        }
      switch (i) {
        case "forwards":
          for (n = t.child, i = null; n !== null;)
            ((e = n.alternate),
              e !== null && Tu(e) === null && (i = n),
              (n = n.sibling));
          ((n = i),
            n === null
              ? ((i = t.child), (t.child = null))
              : ((i = n.sibling), (n.sibling = null)),
            oo(t, !1, i, n, l, a));
          break;
        case "backwards":
        case "unstable_legacy-backwards":
          for (n = null, i = t.child, t.child = null; i !== null;) {
            if (((e = i.alternate), e !== null && Tu(e) === null)) {
              t.child = i;
              break;
            }
            ((e = i.sibling), (i.sibling = n), (n = i), (i = e));
          }
          oo(t, !0, n, null, l, a);
          break;
        case "together":
          oo(t, !1, null, null, void 0, a);
          break;
        default:
          t.memoizedState = null;
      }
      return t.child;
    }
    function Un(e, t, n) {
      if (
        (e !== null && (t.dependencies = e.dependencies),
        (ga |= t.lanes),
        !(n & t.childLanes))
      )
        if (e !== null) {
          if ((ji(e, t, n, !1), (n & t.childLanes) === 0)) return null;
        } else return null;
      if (e !== null && t.child !== e.child) throw Error(v(153));
      if (t.child !== null) {
        for (
          e = t.child, n = Dn(e, e.pendingProps), t.child = n, n.return = t;
          e.sibling !== null;
        )
          ((e = e.sibling),
            (n = n.sibling = Dn(e, e.pendingProps)),
            (n.return = t));
        n.sibling = null;
      }
      return t.child;
    }
    function $c(e, t) {
      return e.lanes & t ? !0 : ((e = e.dependencies), !!(e !== null && Su(e)));
    }
    function ob(e, t, n) {
      switch (t.tag) {
        case 3:
          (hu(t, t.stateNode.containerInfo),
            In(t, Lt, e.memoizedState.cache),
            ka());
          break;
        case 27:
        case 5:
          wo(t);
          break;
        case 4:
          hu(t, t.stateNode.containerInfo);
          break;
        case 10:
          In(t, t.type, t.memoizedProps.value);
          break;
        case 31:
          if (t.memoizedState !== null) return ((t.flags |= 128), Xo(t), null);
          break;
        case 13:
          var a = t.memoizedState;
          if (a !== null)
            return a.dehydrated !== null
              ? (Qn(t), (t.flags |= 128), null)
              : n & t.child.childLanes
                ? Jg(e, t, n)
                : (Qn(t), (e = Un(e, t, n)), e !== null ? e.sibling : null);
          Qn(t);
          break;
        case 19:
          var i = (e.flags & 128) !== 0;
          if (
            ((a = (n & t.childLanes) !== 0),
            a || (ji(e, t, n, !1), (a = (n & t.childLanes) !== 0)),
            i)
          ) {
            if (a) return $g(e, t, n);
            t.flags |= 128;
          }
          if (
            ((i = t.memoizedState),
            i !== null &&
              ((i.rendering = null), (i.tail = null), (i.lastEffect = null)),
            dt(Rt, Rt.current),
            a)
          )
            break;
          return null;
        case 22:
          return ((t.lanes = 0), Kg(e, t, n, t.pendingProps));
        case 24:
          In(t, Lt, e.memoizedState.cache);
      }
      return Un(e, t, n);
    }
    function tp(e, t, n) {
      if (e !== null)
        if (e.memoizedProps !== t.pendingProps) Ut = !0;
        else {
          if (!$c(e, n) && !(t.flags & 128)) return ((Ut = !1), ob(e, t, n));
          Ut = !!(e.flags & 131072);
        }
      else ((Ut = !1), X && t.flags & 1048576 && ag(t, kl, t.index));
      switch (((t.lanes = 0), t.tag)) {
        case 16:
          t: {
            var a = t.pendingProps;
            if (((e = wa(t.elementType)), (t.type = e), typeof e == "function"))
              Dc(e)
                ? ((a = ja(e, a)), (t.tag = 1), (t = kd(null, t, e, a, n)))
                : ((t.tag = 0), (t = $o(null, t, e, a, n)));
            else {
              if (e != null) {
                var i = e.$$typeof;
                if (i === yc) {
                  ((t.tag = 11), (t = Md(null, t, e, a, n)));
                  break t;
                } else if (i === vc) {
                  ((t.tag = 14), (t = Dd(null, t, e, a, n)));
                  break t;
                }
              }
              throw ((t = Oo(e) || e), Error(v(306, t, "")));
            }
          }
          return t;
        case 0:
          return $o(e, t, t.type, t.pendingProps, n);
        case 1:
          return ((a = t.type), (i = ja(a, t.pendingProps)), kd(e, t, a, i, n));
        case 3:
          t: {
            if ((hu(t, t.stateNode.containerInfo), e === null))
              throw Error(v(387));
            a = t.pendingProps;
            var l = t.memoizedState;
            ((i = l.element), qo(e, t), Al(t, a, null, n));
            var r = t.memoizedState;
            if (
              ((a = r.cache),
              In(t, Lt, a),
              a !== l.cache && Wo(t, [Lt], n, !0),
              El(),
              (a = r.element),
              l.isDehydrated)
            )
              if (
                ((l = { element: a, isDehydrated: !1, cache: r.cache }),
                (t.updateQueue.baseState = l),
                (t.memoizedState = l),
                t.flags & 256)
              ) {
                t = Ld(e, t, a, n);
                break t;
              } else if (a !== i) {
                ((i = Pe(Error(v(424)), t)), Ll(i), (t = Ld(e, t, a, n)));
                break t;
              } else {
                switch (((e = t.stateNode.containerInfo), e.nodeType)) {
                  case 9:
                    e = e.body;
                    break;
                  default:
                    e = e.nodeName === "HTML" ? e.ownerDocument.body : e;
                }
                for (
                  yt = Qe(e.firstChild),
                    Kt = t,
                    X = !0,
                    ia = null,
                    Xe = !0,
                    n = og(t, null, a, n),
                    t.child = n;
                  n;
                )
                  ((n.flags = (n.flags & -3) | 4096), (n = n.sibling));
              }
            else {
              if ((ka(), a === i)) {
                t = Un(e, t, n);
                break t;
              }
              Qt(e, t, a, n);
            }
            t = t.child;
          }
          return t;
        case 26:
          return (
            lu(e, t),
            e === null
              ? (n = lm(t.type, null, t.pendingProps, null))
                ? (t.memoizedState = n)
                : X ||
                  ((n = t.type),
                  (e = t.pendingProps),
                  (a = Vu(aa.current).createElement(n)),
                  (a[Zt] = t),
                  (a[Ce] = e),
                  $t(a, n, e),
                  Yt(a),
                  (t.stateNode = a))
              : (t.memoizedState = lm(
                  t.type,
                  e.memoizedProps,
                  t.pendingProps,
                  e.memoizedState,
                )),
            null
          );
        case 27:
          return (
            wo(t),
            e === null &&
              X &&
              ((a = t.stateNode = qp(t.type, t.pendingProps, aa.current)),
              (Kt = t),
              (Xe = !0),
              (i = yt),
              ya(t.type) ? ((mc = i), (yt = Qe(a.firstChild))) : (yt = i)),
            Qt(e, t, t.pendingProps.children, n),
            lu(e, t),
            e === null && (t.flags |= 4194304),
            t.child
          );
        case 5:
          return (
            e === null &&
              X &&
              ((i = a = yt) &&
                ((a = Ub(a, t.type, t.pendingProps, Xe)),
                a !== null
                  ? ((t.stateNode = a),
                    (Kt = t),
                    (yt = Qe(a.firstChild)),
                    (Xe = !1),
                    (i = !0))
                  : (i = !1)),
              i || da(t)),
            wo(t),
            (i = t.type),
            (l = t.pendingProps),
            (r = e !== null ? e.memoizedProps : null),
            (a = l.children),
            cc(i, l) ? (a = null) : r !== null && cc(i, r) && (t.flags |= 32),
            t.memoizedState !== null &&
              ((i = Gc(e, t, tb, null, null, n)), (Wl._currentValue = i)),
            lu(e, t),
            Qt(e, t, a, n),
            t.child
          );
        case 6:
          return (
            e === null &&
              X &&
              ((e = n = yt) &&
                ((n = Bb(n, t.pendingProps, Xe)),
                n !== null
                  ? ((t.stateNode = n), (Kt = t), (yt = null), (e = !0))
                  : (e = !1)),
              e || da(t)),
            null
          );
        case 13:
          return Jg(e, t, n);
        case 4:
          return (
            hu(t, t.stateNode.containerInfo),
            (a = t.pendingProps),
            e === null ? (t.child = Ua(t, null, a, n)) : Qt(e, t, a, n),
            t.child
          );
        case 11:
          return Md(e, t, t.type, t.pendingProps, n);
        case 7:
          return (Qt(e, t, t.pendingProps, n), t.child);
        case 8:
          return (Qt(e, t, t.pendingProps.children, n), t.child);
        case 12:
          return (Qt(e, t, t.pendingProps.children, n), t.child);
        case 10:
          return (
            (a = t.pendingProps),
            In(t, t.type, a.value),
            Qt(e, t, a.children, n),
            t.child
          );
        case 9:
          return (
            (i = t.type._context),
            (a = t.pendingProps.children),
            La(t),
            (i = Jt(i)),
            (a = a(i)),
            (t.flags |= 1),
            Qt(e, t, a, n),
            t.child
          );
        case 14:
          return Dd(e, t, t.type, t.pendingProps, n);
        case 15:
          return Zg(e, t, t.type, t.pendingProps, n);
        case 19:
          return $g(e, t, n);
        case 31:
          return sb(e, t, n);
        case 22:
          return Kg(e, t, n, t.pendingProps);
        case 24:
          return (
            La(t),
            (a = Jt(Lt)),
            e === null
              ? ((i = kc()),
                i === null &&
                  ((i = ft),
                  (l = Vc()),
                  (i.pooledCache = l),
                  l.refCount++,
                  l !== null && (i.pooledCacheLanes |= n),
                  (i = l)),
                (t.memoizedState = { parent: a, cache: i }),
                Uc(t),
                In(t, Lt, i))
              : (e.lanes & n && (qo(e, t), Al(t, null, null, n), El()),
                (i = e.memoizedState),
                (l = t.memoizedState),
                i.parent !== a
                  ? ((i = { parent: a, cache: a }),
                    (t.memoizedState = i),
                    t.lanes === 0 &&
                      (t.memoizedState = t.updateQueue.baseState = i),
                    In(t, Lt, a))
                  : ((a = l.cache),
                    In(t, Lt, a),
                    a !== i.cache && Wo(t, [Lt], n, !0))),
            Qt(e, t, t.pendingProps.children, n),
            t.child
          );
        case 29:
          throw t.pendingProps;
      }
      throw Error(v(156, t.tag));
    }
    function Tn(e) {
      e.flags |= 4;
    }
    function co(e, t, n, a, i) {
      if (((t = (e.mode & 32) !== 0) && (t = !1), t)) {
        if (((e.flags |= 16777216), (i & 335544128) === i))
          if (e.stateNode.complete) e.flags |= 8192;
          else if (Ap()) e.flags |= 8192;
          else throw ((za = bu), Lc);
      } else e.flags &= -16777217;
    }
    function Bd(e, t) {
      if (t.type !== "stylesheet" || t.state.loading & 4) e.flags &= -16777217;
      else if (((e.flags |= 16777216), !Xp(t)))
        if (Ap()) e.flags |= 8192;
        else throw ((za = bu), Lc);
    }
    function Fr(e, t) {
      (t !== null && (e.flags |= 4),
        e.flags & 16384 &&
          ((t = e.tag !== 22 ? _m() : 536870912), (e.lanes |= t), (Ri |= t)));
    }
    function ol(e, t) {
      if (!X)
        switch (e.tailMode) {
          case "hidden":
            t = e.tail;
            for (var n = null; t !== null;)
              (t.alternate !== null && (n = t), (t = t.sibling));
            n === null ? (e.tail = null) : (n.sibling = null);
            break;
          case "collapsed":
            n = e.tail;
            for (var a = null; n !== null;)
              (n.alternate !== null && (a = n), (n = n.sibling));
            a === null
              ? t || e.tail === null
                ? (e.tail = null)
                : (e.tail.sibling = null)
              : (a.sibling = null);
        }
    }
    function pt(e) {
      var t = e.alternate !== null && e.alternate.child === e.child,
        n = 0,
        a = 0;
      if (t)
        for (var i = e.child; i !== null;)
          ((n |= i.lanes | i.childLanes),
            (a |= i.subtreeFlags & 65011712),
            (a |= i.flags & 65011712),
            (i.return = e),
            (i = i.sibling));
      else
        for (i = e.child; i !== null;)
          ((n |= i.lanes | i.childLanes),
            (a |= i.subtreeFlags),
            (a |= i.flags),
            (i.return = e),
            (i = i.sibling));
      return ((e.subtreeFlags |= a), (e.childLanes = n), t);
    }
    function cb(e, t, n) {
      var a = t.pendingProps;
      switch ((zc(t), t.tag)) {
        case 16:
        case 15:
        case 0:
        case 11:
        case 7:
        case 8:
        case 12:
        case 9:
        case 14:
          return (pt(t), null);
        case 1:
          return (pt(t), null);
        case 3:
          return (
            (n = t.stateNode),
            (a = null),
            e !== null && (a = e.memoizedState.cache),
            t.memoizedState.cache !== a && (t.flags |= 2048),
            Rn(Lt),
            Oi(),
            n.pendingContext &&
              ((n.context = n.pendingContext), (n.pendingContext = null)),
            (e === null || e.child === null) &&
              (ai(t)
                ? Tn(t)
                : e === null ||
                  (e.memoizedState.isDehydrated && !(t.flags & 256)) ||
                  ((t.flags |= 1024), eo())),
            pt(t),
            null
          );
        case 26:
          var i = t.type,
            l = t.memoizedState;
          return (
            e === null
              ? (Tn(t),
                l !== null ? (pt(t), Bd(t, l)) : (pt(t), co(t, i, null, a, n)))
              : l
                ? l !== e.memoizedState
                  ? (Tn(t), pt(t), Bd(t, l))
                  : (pt(t), (t.flags &= -16777217))
                : ((e = e.memoizedProps),
                  e !== a && Tn(t),
                  pt(t),
                  co(t, i, e, a, n)),
            null
          );
        case 27:
          if (
            (du(t),
            (n = aa.current),
            (i = t.type),
            e !== null && t.stateNode != null)
          )
            e.memoizedProps !== a && Tn(t);
          else {
            if (!a) {
              if (t.stateNode === null) throw Error(v(166));
              return (pt(t), null);
            }
            ((e = hn.current),
              ai(t) ? dd(t, e) : ((e = qp(i, a, n)), (t.stateNode = e), Tn(t)));
          }
          return (pt(t), null);
        case 5:
          if ((du(t), (i = t.type), e !== null && t.stateNode != null))
            e.memoizedProps !== a && Tn(t);
          else {
            if (!a) {
              if (t.stateNode === null) throw Error(v(166));
              return (pt(t), null);
            }
            if (((l = hn.current), ai(t))) dd(t, l);
            else {
              var r = Vu(aa.current);
              switch (l) {
                case 1:
                  l = r.createElementNS("http://www.w3.org/2000/svg", i);
                  break;
                case 2:
                  l = r.createElementNS(
                    "http://www.w3.org/1998/Math/MathML",
                    i,
                  );
                  break;
                default:
                  switch (i) {
                    case "svg":
                      l = r.createElementNS("http://www.w3.org/2000/svg", i);
                      break;
                    case "math":
                      l = r.createElementNS(
                        "http://www.w3.org/1998/Math/MathML",
                        i,
                      );
                      break;
                    case "script":
                      ((l = r.createElement("div")),
                        (l.innerHTML = "<script><\/script>"),
                        (l = l.removeChild(l.firstChild)));
                      break;
                    case "select":
                      ((l =
                        typeof a.is == "string"
                          ? r.createElement("select", { is: a.is })
                          : r.createElement("select")),
                        a.multiple
                          ? (l.multiple = !0)
                          : a.size && (l.size = a.size));
                      break;
                    default:
                      l =
                        typeof a.is == "string"
                          ? r.createElement(i, { is: a.is })
                          : r.createElement(i);
                  }
              }
              ((l[Zt] = t), (l[Ce] = a));
              t: for (r = t.child; r !== null;) {
                if (r.tag === 5 || r.tag === 6) l.appendChild(r.stateNode);
                else if (r.tag !== 4 && r.tag !== 27 && r.child !== null) {
                  ((r.child.return = r), (r = r.child));
                  continue;
                }
                if (r === t) break t;
                for (; r.sibling === null;) {
                  if (r.return === null || r.return === t) break t;
                  r = r.return;
                }
                ((r.sibling.return = r.return), (r = r.sibling));
              }
              t.stateNode = l;
              t: switch (($t(l, i, a), i)) {
                case "button":
                case "input":
                case "select":
                case "textarea":
                  a = !!a.autoFocus;
                  break t;
                case "img":
                  a = !0;
                  break t;
                default:
                  a = !1;
              }
              a && Tn(t);
            }
          }
          return (
            pt(t),
            co(
              t,
              t.type,
              e === null ? null : e.memoizedProps,
              t.pendingProps,
              n,
            ),
            null
          );
        case 6:
          if (e && t.stateNode != null) e.memoizedProps !== a && Tn(t);
          else {
            if (typeof a != "string" && t.stateNode === null)
              throw Error(v(166));
            if (((e = aa.current), ai(t))) {
              if (
                ((e = t.stateNode),
                (n = t.memoizedProps),
                (a = null),
                (i = Kt),
                i !== null)
              )
                switch (i.tag) {
                  case 27:
                  case 5:
                    a = i.memoizedProps;
                }
              ((e[Zt] = t),
                (e = !!(
                  e.nodeValue === n ||
                  (a !== null && a.suppressHydrationWarning === !0) ||
                  Gp(e.nodeValue, n)
                )),
                e || da(t, !0));
            } else
              ((e = Vu(e).createTextNode(a)), (e[Zt] = t), (t.stateNode = e));
          }
          return (pt(t), null);
        case 31:
          if (((n = t.memoizedState), e === null || e.memoizedState !== null)) {
            if (((a = ai(t)), n !== null)) {
              if (e === null) {
                if (!a) throw Error(v(318));
                if (
                  ((e = t.memoizedState),
                  (e = e !== null ? e.dehydrated : null),
                  !e)
                )
                  throw Error(v(557));
                e[Zt] = t;
              } else
                (ka(),
                  !(t.flags & 128) && (t.memoizedState = null),
                  (t.flags |= 4));
              (pt(t), (e = !1));
            } else
              ((n = eo()),
                e !== null &&
                  e.memoizedState !== null &&
                  (e.memoizedState.hydrationErrors = n),
                (e = !0));
            if (!e) return t.flags & 256 ? (Me(t), t) : (Me(t), null);
            if (t.flags & 128) throw Error(v(558));
          }
          return (pt(t), null);
        case 13:
          if (
            ((a = t.memoizedState),
            e === null ||
              (e.memoizedState !== null && e.memoizedState.dehydrated !== null))
          ) {
            if (((i = ai(t)), a !== null && a.dehydrated !== null)) {
              if (e === null) {
                if (!i) throw Error(v(318));
                if (
                  ((i = t.memoizedState),
                  (i = i !== null ? i.dehydrated : null),
                  !i)
                )
                  throw Error(v(317));
                i[Zt] = t;
              } else
                (ka(),
                  !(t.flags & 128) && (t.memoizedState = null),
                  (t.flags |= 4));
              (pt(t), (i = !1));
            } else
              ((i = eo()),
                e !== null &&
                  e.memoizedState !== null &&
                  (e.memoizedState.hydrationErrors = i),
                (i = !0));
            if (!i) return t.flags & 256 ? (Me(t), t) : (Me(t), null);
          }
          return (
            Me(t),
            t.flags & 128
              ? ((t.lanes = n), t)
              : ((n = a !== null),
                (e = e !== null && e.memoizedState !== null),
                n &&
                  ((a = t.child),
                  (i = null),
                  a.alternate !== null &&
                    a.alternate.memoizedState !== null &&
                    a.alternate.memoizedState.cachePool !== null &&
                    (i = a.alternate.memoizedState.cachePool.pool),
                  (l = null),
                  a.memoizedState !== null &&
                    a.memoizedState.cachePool !== null &&
                    (l = a.memoizedState.cachePool.pool),
                  l !== i && (a.flags |= 2048)),
                n !== e && n && (t.child.flags |= 8192),
                Fr(t, t.updateQueue),
                pt(t),
                null)
          );
        case 4:
          return (
            Oi(),
            e === null && uf(t.stateNode.containerInfo),
            pt(t),
            null
          );
        case 10:
          return (Rn(t.type), pt(t), null);
        case 19:
          if ((Pt(Rt), (a = t.memoizedState), a === null)) return (pt(t), null);
          if (((i = (t.flags & 128) !== 0), (l = a.rendering), l === null))
            if (i) ol(a, !1);
            else {
              if (Mt !== 0 || (e !== null && e.flags & 128))
                for (e = t.child; e !== null;) {
                  if (((l = Tu(e)), l !== null)) {
                    for (
                      t.flags |= 128,
                        ol(a, !1),
                        e = l.updateQueue,
                        t.updateQueue = e,
                        Fr(t, e),
                        t.subtreeFlags = 0,
                        e = n,
                        n = t.child;
                      n !== null;
                    )
                      (eg(n, e), (n = n.sibling));
                    return (
                      dt(Rt, (Rt.current & 1) | 2),
                      X && On(t, a.treeForkCount),
                      t.child
                    );
                  }
                  e = e.sibling;
                }
              a.tail !== null &&
                ze() > wu &&
                ((t.flags |= 128), (i = !0), ol(a, !1), (t.lanes = 4194304));
            }
          else {
            if (!i)
              if (((e = Tu(l)), e !== null)) {
                if (
                  ((t.flags |= 128),
                  (i = !0),
                  (e = e.updateQueue),
                  (t.updateQueue = e),
                  Fr(t, e),
                  ol(a, !0),
                  a.tail === null &&
                    a.tailMode === "hidden" &&
                    !l.alternate &&
                    !X)
                )
                  return (pt(t), null);
              } else
                2 * ze() - a.renderingStartTime > wu &&
                  n !== 536870912 &&
                  ((t.flags |= 128), (i = !0), ol(a, !1), (t.lanes = 4194304));
            a.isBackwards
              ? ((l.sibling = t.child), (t.child = l))
              : ((e = a.last),
                e !== null ? (e.sibling = l) : (t.child = l),
                (a.last = l));
          }
          return a.tail !== null
            ? ((e = a.tail),
              (a.rendering = e),
              (a.tail = e.sibling),
              (a.renderingStartTime = ze()),
              (e.sibling = null),
              (n = Rt.current),
              dt(Rt, i ? (n & 1) | 2 : n & 1),
              X && On(t, a.treeForkCount),
              e)
            : (pt(t), null);
        case 22:
        case 23:
          return (
            Me(t),
            Bc(),
            (a = t.memoizedState !== null),
            e !== null
              ? (e.memoizedState !== null) !== a && (t.flags |= 8192)
              : a && (t.flags |= 8192),
            a
              ? n & 536870912 &&
                !(t.flags & 128) &&
                (pt(t), t.subtreeFlags & 6 && (t.flags |= 8192))
              : pt(t),
            (n = t.updateQueue),
            n !== null && Fr(t, n.retryQueue),
            (n = null),
            e !== null &&
              e.memoizedState !== null &&
              e.memoizedState.cachePool !== null &&
              (n = e.memoizedState.cachePool.pool),
            (a = null),
            t.memoizedState !== null &&
              t.memoizedState.cachePool !== null &&
              (a = t.memoizedState.cachePool.pool),
            a !== n && (t.flags |= 2048),
            e !== null && Pt(Ra),
            null
          );
        case 24:
          return (
            (n = null),
            e !== null && (n = e.memoizedState.cache),
            t.memoizedState.cache !== n && (t.flags |= 2048),
            Rn(Lt),
            pt(t),
            null
          );
        case 25:
          return null;
        case 30:
          return null;
      }
      throw Error(v(156, t.tag));
    }
    function fb(e, t) {
      switch ((zc(t), t.tag)) {
        case 1:
          return (
            (e = t.flags),
            e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
          );
        case 3:
          return (
            Rn(Lt),
            Oi(),
            (e = t.flags),
            e & 65536 && !(e & 128) ? ((t.flags = (e & -65537) | 128), t) : null
          );
        case 26:
        case 27:
        case 5:
          return (du(t), null);
        case 31:
          if (t.memoizedState !== null) {
            if ((Me(t), t.alternate === null)) throw Error(v(340));
            ka();
          }
          return (
            (e = t.flags),
            e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
          );
        case 13:
          if (
            (Me(t), (e = t.memoizedState), e !== null && e.dehydrated !== null)
          ) {
            if (t.alternate === null) throw Error(v(340));
            ka();
          }
          return (
            (e = t.flags),
            e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
          );
        case 19:
          return (Pt(Rt), null);
        case 4:
          return (Oi(), null);
        case 10:
          return (Rn(t.type), null);
        case 22:
        case 23:
          return (
            Me(t),
            Bc(),
            e !== null && Pt(Ra),
            (e = t.flags),
            e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
          );
        case 24:
          return (Rn(Lt), null);
        case 25:
          return null;
        default:
          return null;
      }
    }
    function ep(e, t) {
      switch ((zc(t), t.tag)) {
        case 3:
          (Rn(Lt), Oi());
          break;
        case 26:
        case 27:
        case 5:
          du(t);
          break;
        case 4:
          Oi();
          break;
        case 31:
          t.memoizedState !== null && Me(t);
          break;
        case 13:
          Me(t);
          break;
        case 19:
          Pt(Rt);
          break;
        case 10:
          Rn(t.type);
          break;
        case 22:
        case 23:
          (Me(t), Bc(), e !== null && Pt(Ra));
          break;
        case 24:
          Rn(Lt);
      }
    }
    function $l(e, t) {
      try {
        var n = t.updateQueue,
          a = n !== null ? n.lastEffect : null;
        if (a !== null) {
          var i = a.next;
          n = i;
          do {
            if ((n.tag & e) === e) {
              a = void 0;
              var l = n.create,
                r = n.inst;
              ((a = l()), (r.destroy = a));
            }
            n = n.next;
          } while (n !== i);
        }
      } catch (u) {
        it(t, t.return, u);
      }
    }
    function ma(e, t, n) {
      try {
        var a = t.updateQueue,
          i = a !== null ? a.lastEffect : null;
        if (i !== null) {
          var l = i.next;
          a = l;
          do {
            if ((a.tag & e) === e) {
              var r = a.inst,
                u = r.destroy;
              if (u !== void 0) {
                ((r.destroy = void 0), (i = t));
                var s = n,
                  o = u;
                try {
                  o();
                } catch (c) {
                  it(i, s, c);
                }
              }
            }
            a = a.next;
          } while (a !== l);
        }
      } catch (c) {
        it(t, t.return, c);
      }
    }
    function np(e) {
      var t = e.updateQueue;
      if (t !== null) {
        var n = e.stateNode;
        try {
          fg(t, n);
        } catch (a) {
          it(e, e.return, a);
        }
      }
    }
    function ap(e, t, n) {
      ((n.props = ja(e.type, e.memoizedProps)), (n.state = e.memoizedState));
      try {
        n.componentWillUnmount();
      } catch (a) {
        it(e, t, a);
      }
    }
    function Ol(e, t) {
      try {
        var n = e.ref;
        if (n !== null) {
          switch (e.tag) {
            case 26:
            case 27:
            case 5:
              var a = e.stateNode;
              break;
            case 30:
              a = e.stateNode;
              break;
            default:
              a = e.stateNode;
          }
          typeof n == "function" ? (e.refCleanup = n(a)) : (n.current = a);
        }
      } catch (i) {
        it(e, t, i);
      }
    }
    function fn(e, t) {
      var n = e.ref,
        a = e.refCleanup;
      if (n !== null)
        if (typeof a == "function")
          try {
            a();
          } catch (i) {
            it(e, t, i);
          } finally {
            ((e.refCleanup = null),
              (e = e.alternate),
              e != null && (e.refCleanup = null));
          }
        else if (typeof n == "function")
          try {
            n(null);
          } catch (i) {
            it(e, t, i);
          }
        else n.current = null;
    }
    function ip(e) {
      var t = e.type,
        n = e.memoizedProps,
        a = e.stateNode;
      try {
        t: switch (t) {
          case "button":
          case "input":
          case "select":
          case "textarea":
            n.autoFocus && a.focus();
            break t;
          case "img":
            n.src ? (a.src = n.src) : n.srcSet && (a.srcset = n.srcSet);
        }
      } catch (i) {
        it(e, e.return, i);
      }
    }
    function fo(e, t, n) {
      try {
        var a = e.stateNode;
        (Db(a, e.type, n, t), (a[Ce] = t));
      } catch (i) {
        it(e, e.return, i);
      }
    }
    function lp(e) {
      return (
        e.tag === 5 ||
        e.tag === 3 ||
        e.tag === 26 ||
        (e.tag === 27 && ya(e.type)) ||
        e.tag === 4
      );
    }
    function ho(e) {
      t: for (;;) {
        for (; e.sibling === null;) {
          if (e.return === null || lp(e.return)) return null;
          e = e.return;
        }
        for (
          e.sibling.return = e.return, e = e.sibling;
          e.tag !== 5 && e.tag !== 6 && e.tag !== 18;
        ) {
          if (
            (e.tag === 27 && ya(e.type)) ||
            e.flags & 2 ||
            e.child === null ||
            e.tag === 4
          )
            continue t;
          ((e.child.return = e), (e = e.child));
        }
        if (!(e.flags & 2)) return e.stateNode;
      }
    }
    function ec(e, t, n) {
      var a = e.tag;
      if (a === 5 || a === 6)
        ((e = e.stateNode),
          t
            ? (n.nodeType === 9
                ? n.body
                : n.nodeName === "HTML"
                  ? n.ownerDocument.body
                  : n
              ).insertBefore(e, t)
            : ((t =
                n.nodeType === 9
                  ? n.body
                  : n.nodeName === "HTML"
                    ? n.ownerDocument.body
                    : n),
              t.appendChild(e),
              (n = n._reactRootContainer),
              n != null || t.onclick !== null || (t.onclick = xn)));
      else if (
        a !== 4 &&
        (a === 27 && ya(e.type) && ((n = e.stateNode), (t = null)),
        (e = e.child),
        e !== null)
      )
        for (ec(e, t, n), e = e.sibling; e !== null;)
          (ec(e, t, n), (e = e.sibling));
    }
    function Nu(e, t, n) {
      var a = e.tag;
      if (a === 5 || a === 6)
        ((e = e.stateNode), t ? n.insertBefore(e, t) : n.appendChild(e));
      else if (
        a !== 4 &&
        (a === 27 && ya(e.type) && (n = e.stateNode), (e = e.child), e !== null)
      )
        for (Nu(e, t, n), e = e.sibling; e !== null;)
          (Nu(e, t, n), (e = e.sibling));
    }
    function rp(e) {
      var t = e.stateNode,
        n = e.memoizedProps;
      try {
        for (var a = e.type, i = t.attributes; i.length;)
          t.removeAttributeNode(i[0]);
        ($t(t, a, n), (t[Zt] = e), (t[Ce] = n));
      } catch (l) {
        it(e, e.return, l);
      }
    }
    var Nn = !1,
      kt = !1,
      mo = !1,
      jd = typeof WeakSet == "function" ? WeakSet : Set,
      qt = null;
    function hb(e, t) {
      if (((e = e.containerInfo), (sc = Bu), (e = Xm(e)), wc(e))) {
        if ("selectionStart" in e)
          var n = { start: e.selectionStart, end: e.selectionEnd };
        else
          t: {
            n = ((n = e.ownerDocument) && n.defaultView) || window;
            var a = n.getSelection && n.getSelection();
            if (a && a.rangeCount !== 0) {
              n = a.anchorNode;
              var i = a.anchorOffset,
                l = a.focusNode;
              a = a.focusOffset;
              try {
                (n.nodeType, l.nodeType);
              } catch {
                n = null;
                break t;
              }
              var r = 0,
                u = -1,
                s = -1,
                o = 0,
                c = 0,
                h = e,
                f = null;
              e: for (;;) {
                for (
                  var p;
                  h !== n || (i !== 0 && h.nodeType !== 3) || (u = r + i),
                    h !== l || (a !== 0 && h.nodeType !== 3) || (s = r + a),
                    h.nodeType === 3 && (r += h.nodeValue.length),
                    (p = h.firstChild) !== null;
                )
                  ((f = h), (h = p));
                for (;;) {
                  if (h === e) break e;
                  if (
                    (f === n && ++o === i && (u = r),
                    f === l && ++c === a && (s = r),
                    (p = h.nextSibling) !== null)
                  )
                    break;
                  ((h = f), (f = h.parentNode));
                }
                h = p;
              }
              n = u === -1 || s === -1 ? null : { start: u, end: s };
            } else n = null;
          }
        n = n || { start: 0, end: 0 };
      } else n = null;
      for (
        oc = { focusedElem: e, selectionRange: n }, Bu = !1, qt = t;
        qt !== null;
      )
        if (
          ((t = qt), (e = t.child), (t.subtreeFlags & 1028) !== 0 && e !== null)
        )
          ((e.return = t), (qt = e));
        else
          for (; qt !== null;) {
            switch (((t = qt), (l = t.alternate), (e = t.flags), t.tag)) {
              case 0:
                if (
                  e & 4 &&
                  ((e = t.updateQueue),
                  (e = e !== null ? e.events : null),
                  e !== null)
                )
                  for (n = 0; n < e.length; n++)
                    ((i = e[n]), (i.ref.impl = i.nextImpl));
                break;
              case 11:
              case 15:
                break;
              case 1:
                if (e & 1024 && l !== null) {
                  ((e = void 0),
                    (n = t),
                    (i = l.memoizedProps),
                    (l = l.memoizedState),
                    (a = n.stateNode));
                  try {
                    var S = ja(n.type, i);
                    ((e = a.getSnapshotBeforeUpdate(S, l)),
                      (a.__reactInternalSnapshotBeforeUpdate = e));
                  } catch (T) {
                    it(n, n.return, T);
                  }
                }
                break;
              case 3:
                if (e & 1024) {
                  if (
                    ((e = t.stateNode.containerInfo), (n = e.nodeType), n === 9)
                  )
                    fc(e);
                  else if (n === 1)
                    switch (e.nodeName) {
                      case "HEAD":
                      case "HTML":
                      case "BODY":
                        fc(e);
                        break;
                      default:
                        e.textContent = "";
                    }
                }
                break;
              case 5:
              case 26:
              case 27:
              case 6:
              case 4:
              case 17:
                break;
              default:
                if (e & 1024) throw Error(v(163));
            }
            if (((e = t.sibling), e !== null)) {
              ((e.return = t.return), (qt = e));
              break;
            }
            qt = t.return;
          }
    }
    function up(e, t, n) {
      var a = n.flags;
      switch (n.tag) {
        case 0:
        case 11:
        case 15:
          (An(e, n), a & 4 && $l(5, n));
          break;
        case 1:
          if ((An(e, n), a & 4))
            if (((e = n.stateNode), t === null))
              try {
                e.componentDidMount();
              } catch (r) {
                it(n, n.return, r);
              }
            else {
              var i = ja(n.type, t.memoizedProps);
              t = t.memoizedState;
              try {
                e.componentDidUpdate(
                  i,
                  t,
                  e.__reactInternalSnapshotBeforeUpdate,
                );
              } catch (r) {
                it(n, n.return, r);
              }
            }
          (a & 64 && np(n), a & 512 && Ol(n, n.return));
          break;
        case 3:
          if ((An(e, n), a & 64 && ((e = n.updateQueue), e !== null))) {
            if (((t = null), n.child !== null))
              switch (n.child.tag) {
                case 27:
                case 5:
                  t = n.child.stateNode;
                  break;
                case 1:
                  t = n.child.stateNode;
              }
            try {
              fg(e, t);
            } catch (r) {
              it(n, n.return, r);
            }
          }
          break;
        case 27:
          t === null && a & 4 && rp(n);
        case 26:
        case 5:
          (An(e, n), t === null && a & 4 && ip(n), a & 512 && Ol(n, n.return));
          break;
        case 12:
          An(e, n);
          break;
        case 31:
          (An(e, n), a & 4 && cp(e, n));
          break;
        case 13:
          (An(e, n),
            a & 4 && fp(e, n),
            a & 64 &&
              ((e = n.memoizedState),
              e !== null &&
                ((e = e.dehydrated),
                e !== null && ((n = Cb.bind(null, n)), jb(e, n)))));
          break;
        case 22:
          if (((a = n.memoizedState !== null || Nn), !a)) {
            ((t = (t !== null && t.memoizedState !== null) || kt), (i = Nn));
            var l = kt;
            ((Nn = a),
              (kt = t) && !l
                ? _n(e, n, (n.subtreeFlags & 8772) !== 0)
                : An(e, n),
              (Nn = i),
              (kt = l));
          }
          break;
        case 30:
          break;
        default:
          An(e, n);
      }
    }
    function sp(e) {
      var t = e.alternate;
      (t !== null && ((e.alternate = null), sp(t)),
        (e.child = null),
        (e.deletions = null),
        (e.sibling = null),
        e.tag === 5 && ((t = e.stateNode), t !== null && Tc(t)),
        (e.stateNode = null),
        (e.return = null),
        (e.dependencies = null),
        (e.memoizedProps = null),
        (e.memoizedState = null),
        (e.pendingProps = null),
        (e.stateNode = null),
        (e.updateQueue = null));
    }
    var Tt = null,
      ve = !1;
    function En(e, t, n) {
      for (n = n.child; n !== null;) (op(e, t, n), (n = n.sibling));
    }
    function op(e, t, n) {
      if (Ve && typeof Ve.onCommitFiberUnmount == "function")
        try {
          Ve.onCommitFiberUnmount(Pl, n);
        } catch {}
      switch (n.tag) {
        case 26:
          (kt || fn(n, t),
            En(e, t, n),
            n.memoizedState
              ? n.memoizedState.count--
              : n.stateNode &&
                ((n = n.stateNode), n.parentNode.removeChild(n)));
          break;
        case 27:
          kt || fn(n, t);
          var a = Tt,
            i = ve;
          (ya(n.type) && ((Tt = n.stateNode), (ve = !1)),
            En(e, t, n),
            Ml(n.stateNode),
            (Tt = a),
            (ve = i));
          break;
        case 5:
          kt || fn(n, t);
        case 6:
          if (
            ((a = Tt),
            (i = ve),
            (Tt = null),
            En(e, t, n),
            (Tt = a),
            (ve = i),
            Tt !== null)
          )
            if (ve)
              try {
                (Tt.nodeType === 9
                  ? Tt.body
                  : Tt.nodeName === "HTML"
                    ? Tt.ownerDocument.body
                    : Tt
                ).removeChild(n.stateNode);
              } catch (l) {
                it(n, t, l);
              }
            else
              try {
                Tt.removeChild(n.stateNode);
              } catch (l) {
                it(n, t, l);
              }
          break;
        case 18:
          Tt !== null &&
            (ve
              ? ((e = Tt),
                tm(
                  e.nodeType === 9
                    ? e.body
                    : e.nodeName === "HTML"
                      ? e.ownerDocument.body
                      : e,
                  n.stateNode,
                ),
                Li(e))
              : tm(Tt, n.stateNode));
          break;
        case 4:
          ((a = Tt),
            (i = ve),
            (Tt = n.stateNode.containerInfo),
            (ve = !0),
            En(e, t, n),
            (Tt = a),
            (ve = i));
          break;
        case 0:
        case 11:
        case 14:
        case 15:
          (ma(2, n, t), kt || ma(4, n, t), En(e, t, n));
          break;
        case 1:
          (kt ||
            (fn(n, t),
            (a = n.stateNode),
            typeof a.componentWillUnmount == "function" && ap(n, t, a)),
            En(e, t, n));
          break;
        case 21:
          En(e, t, n);
          break;
        case 22:
          ((kt = (a = kt) || n.memoizedState !== null), En(e, t, n), (kt = a));
          break;
        default:
          En(e, t, n);
      }
    }
    function cp(e, t) {
      if (
        t.memoizedState === null &&
        ((e = t.alternate), e !== null && ((e = e.memoizedState), e !== null))
      ) {
        e = e.dehydrated;
        try {
          Li(e);
        } catch (n) {
          it(t, t.return, n);
        }
      }
    }
    function fp(e, t) {
      if (
        t.memoizedState === null &&
        ((e = t.alternate),
        e !== null &&
          ((e = e.memoizedState),
          e !== null && ((e = e.dehydrated), e !== null)))
      )
        try {
          Li(e);
        } catch (n) {
          it(t, t.return, n);
        }
    }
    function db(e) {
      switch (e.tag) {
        case 31:
        case 13:
        case 19:
          var t = e.stateNode;
          return (t === null && (t = e.stateNode = new jd()), t);
        case 22:
          return (
            (e = e.stateNode),
            (t = e._retryCache),
            t === null && (t = e._retryCache = new jd()),
            t
          );
        default:
          throw Error(v(435, e.tag));
      }
    }
    function qr(e, t) {
      var n = db(e);
      t.forEach(function (a) {
        if (!n.has(a)) {
          n.add(a);
          var i = Tb.bind(null, e, a);
          a.then(i, i);
        }
      });
    }
    function pe(e, t) {
      var n = t.deletions;
      if (n !== null)
        for (var a = 0; a < n.length; a++) {
          var i = n[a],
            l = e,
            r = t,
            u = r;
          t: for (; u !== null;) {
            switch (u.tag) {
              case 27:
                if (ya(u.type)) {
                  ((Tt = u.stateNode), (ve = !1));
                  break t;
                }
                break;
              case 5:
                ((Tt = u.stateNode), (ve = !1));
                break t;
              case 3:
              case 4:
                ((Tt = u.stateNode.containerInfo), (ve = !0));
                break t;
            }
            u = u.return;
          }
          if (Tt === null) throw Error(v(160));
          (op(l, r, i),
            (Tt = null),
            (ve = !1),
            (l = i.alternate),
            l !== null && (l.return = null),
            (i.return = null));
        }
      if (t.subtreeFlags & 13886)
        for (t = t.child; t !== null;) (hp(t, e), (t = t.sibling));
    }
    var an = null;
    function hp(e, t) {
      var n = e.alternate,
        a = e.flags;
      switch (e.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          (pe(t, e),
            ye(e),
            a & 4 && (ma(3, e, e.return), $l(3, e), ma(5, e, e.return)));
          break;
        case 1:
          (pe(t, e),
            ye(e),
            a & 512 && (kt || n === null || fn(n, n.return)),
            a & 64 &&
              Nn &&
              ((e = e.updateQueue),
              e !== null &&
                ((a = e.callbacks),
                a !== null &&
                  ((n = e.shared.hiddenCallbacks),
                  (e.shared.hiddenCallbacks = n === null ? a : n.concat(a))))));
          break;
        case 26:
          var i = an;
          if (
            (pe(t, e),
            ye(e),
            a & 512 && (kt || n === null || fn(n, n.return)),
            a & 4)
          ) {
            var l = n !== null ? n.memoizedState : null;
            if (((a = e.memoizedState), n === null))
              if (a === null)
                if (e.stateNode === null) {
                  t: {
                    ((a = e.type),
                      (n = e.memoizedProps),
                      (i = i.ownerDocument || i));
                    e: switch (a) {
                      case "title":
                        ((l = i.getElementsByTagName("title")[0]),
                          (!l ||
                            l[Ql] ||
                            l[Zt] ||
                            l.namespaceURI === "http://www.w3.org/2000/svg" ||
                            l.hasAttribute("itemprop")) &&
                            ((l = i.createElement(a)),
                            i.head.insertBefore(
                              l,
                              i.querySelector("head > title"),
                            )),
                          $t(l, a, n),
                          (l[Zt] = e),
                          Yt(l),
                          (a = l));
                        break t;
                      case "link":
                        var r = um("link", "href", i).get(a + (n.href || ""));
                        if (r) {
                          for (var u = 0; u < r.length; u++)
                            if (
                              ((l = r[u]),
                              l.getAttribute("href") ===
                                (n.href == null || n.href === ""
                                  ? null
                                  : n.href) &&
                                l.getAttribute("rel") ===
                                  (n.rel == null ? null : n.rel) &&
                                l.getAttribute("title") ===
                                  (n.title == null ? null : n.title) &&
                                l.getAttribute("crossorigin") ===
                                  (n.crossOrigin == null
                                    ? null
                                    : n.crossOrigin))
                            ) {
                              r.splice(u, 1);
                              break e;
                            }
                        }
                        ((l = i.createElement(a)),
                          $t(l, a, n),
                          i.head.appendChild(l));
                        break;
                      case "meta":
                        if (
                          (r = um("meta", "content", i).get(
                            a + (n.content || ""),
                          ))
                        ) {
                          for (u = 0; u < r.length; u++)
                            if (
                              ((l = r[u]),
                              l.getAttribute("content") ===
                                (n.content == null ? null : "" + n.content) &&
                                l.getAttribute("name") ===
                                  (n.name == null ? null : n.name) &&
                                l.getAttribute("property") ===
                                  (n.property == null ? null : n.property) &&
                                l.getAttribute("http-equiv") ===
                                  (n.httpEquiv == null ? null : n.httpEquiv) &&
                                l.getAttribute("charset") ===
                                  (n.charSet == null ? null : n.charSet))
                            ) {
                              r.splice(u, 1);
                              break e;
                            }
                        }
                        ((l = i.createElement(a)),
                          $t(l, a, n),
                          i.head.appendChild(l));
                        break;
                      default:
                        throw Error(v(468, a));
                    }
                    ((l[Zt] = e), Yt(l), (a = l));
                  }
                  e.stateNode = a;
                } else sm(i, e.type, e.stateNode);
              else e.stateNode = rm(i, a, e.memoizedProps);
            else
              l !== a
                ? (l === null
                    ? n.stateNode !== null &&
                      ((n = n.stateNode), n.parentNode.removeChild(n))
                    : l.count--,
                  a === null
                    ? sm(i, e.type, e.stateNode)
                    : rm(i, a, e.memoizedProps))
                : a === null &&
                  e.stateNode !== null &&
                  fo(e, e.memoizedProps, n.memoizedProps);
          }
          break;
        case 27:
          (pe(t, e),
            ye(e),
            a & 512 && (kt || n === null || fn(n, n.return)),
            n !== null && a & 4 && fo(e, e.memoizedProps, n.memoizedProps));
          break;
        case 5:
          if (
            (pe(t, e),
            ye(e),
            a & 512 && (kt || n === null || fn(n, n.return)),
            e.flags & 32)
          ) {
            i = e.stateNode;
            try {
              wi(i, "");
            } catch (S) {
              it(e, e.return, S);
            }
          }
          (a & 4 &&
            e.stateNode != null &&
            ((i = e.memoizedProps), fo(e, i, n !== null ? n.memoizedProps : i)),
            a & 1024 && (mo = !0));
          break;
        case 6:
          if ((pe(t, e), ye(e), a & 4)) {
            if (e.stateNode === null) throw Error(v(162));
            ((a = e.memoizedProps), (n = e.stateNode));
            try {
              n.nodeValue = a;
            } catch (S) {
              it(e, e.return, S);
            }
          }
          break;
        case 3:
          if (
            ((su = null),
            (i = an),
            (an = ku(t.containerInfo)),
            pe(t, e),
            (an = i),
            ye(e),
            a & 4 && n !== null && n.memoizedState.isDehydrated)
          )
            try {
              Li(t.containerInfo);
            } catch (S) {
              it(e, e.return, S);
            }
          mo && ((mo = !1), dp(e));
          break;
        case 4:
          ((a = an),
            (an = ku(e.stateNode.containerInfo)),
            pe(t, e),
            ye(e),
            (an = a));
          break;
        case 12:
          (pe(t, e), ye(e));
          break;
        case 31:
          (pe(t, e),
            ye(e),
            a & 4 &&
              ((a = e.updateQueue),
              a !== null && ((e.updateQueue = null), qr(e, a))));
          break;
        case 13:
          (pe(t, e),
            ye(e),
            e.child.flags & 8192 &&
              (e.memoizedState !== null) !=
                (n !== null && n.memoizedState !== null) &&
              (Ku = ze()),
            a & 4 &&
              ((a = e.updateQueue),
              a !== null && ((e.updateQueue = null), qr(e, a))));
          break;
        case 22:
          i = e.memoizedState !== null;
          var s = n !== null && n.memoizedState !== null,
            o = Nn,
            c = kt;
          if (
            ((Nn = o || i),
            (kt = c || s),
            pe(t, e),
            (kt = c),
            (Nn = o),
            ye(e),
            a & 8192)
          )
            t: for (
              t = e.stateNode,
                t._visibility = i ? t._visibility & -2 : t._visibility | 1,
                i && (n === null || s || Nn || kt || xa(e)),
                n = null,
                t = e;
              ;
            ) {
              if (t.tag === 5 || t.tag === 26) {
                if (n === null) {
                  s = n = t;
                  try {
                    if (((l = s.stateNode), i))
                      ((r = l.style),
                        typeof r.setProperty == "function"
                          ? r.setProperty("display", "none", "important")
                          : (r.display = "none"));
                    else {
                      u = s.stateNode;
                      var h = s.memoizedProps.style,
                        f =
                          h != null && h.hasOwnProperty("display")
                            ? h.display
                            : null;
                      u.style.display =
                        f == null || typeof f == "boolean"
                          ? ""
                          : ("" + f).trim();
                    }
                  } catch (S) {
                    it(s, s.return, S);
                  }
                }
              } else if (t.tag === 6) {
                if (n === null) {
                  s = t;
                  try {
                    s.stateNode.nodeValue = i ? "" : s.memoizedProps;
                  } catch (S) {
                    it(s, s.return, S);
                  }
                }
              } else if (t.tag === 18) {
                if (n === null) {
                  s = t;
                  try {
                    var p = s.stateNode;
                    i ? em(p, !0) : em(s.stateNode, !1);
                  } catch (S) {
                    it(s, s.return, S);
                  }
                }
              } else if (
                ((t.tag !== 22 && t.tag !== 23) ||
                  t.memoizedState === null ||
                  t === e) &&
                t.child !== null
              ) {
                ((t.child.return = t), (t = t.child));
                continue;
              }
              if (t === e) break t;
              for (; t.sibling === null;) {
                if (t.return === null || t.return === e) break t;
                (n === t && (n = null), (t = t.return));
              }
              (n === t && (n = null),
                (t.sibling.return = t.return),
                (t = t.sibling));
            }
          a & 4 &&
            ((a = e.updateQueue),
            a !== null &&
              ((n = a.retryQueue),
              n !== null && ((a.retryQueue = null), qr(e, n))));
          break;
        case 19:
          (pe(t, e),
            ye(e),
            a & 4 &&
              ((a = e.updateQueue),
              a !== null && ((e.updateQueue = null), qr(e, a))));
          break;
        case 30:
          break;
        case 21:
          break;
        default:
          (pe(t, e), ye(e));
      }
    }
    function ye(e) {
      var t = e.flags;
      if (t & 2) {
        try {
          for (var n, a = e.return; a !== null;) {
            if (lp(a)) {
              n = a;
              break;
            }
            a = a.return;
          }
          if (n == null) throw Error(v(160));
          switch (n.tag) {
            case 27:
              var i = n.stateNode,
                l = ho(e);
              Nu(e, l, i);
              break;
            case 5:
              var r = n.stateNode;
              n.flags & 32 && (wi(r, ""), (n.flags &= -33));
              var u = ho(e);
              Nu(e, u, r);
              break;
            case 3:
            case 4:
              var s = n.stateNode.containerInfo,
                o = ho(e);
              ec(e, o, s);
              break;
            default:
              throw Error(v(161));
          }
        } catch (c) {
          it(e, e.return, c);
        }
        e.flags &= -3;
      }
      t & 4096 && (e.flags &= -4097);
    }
    function dp(e) {
      if (e.subtreeFlags & 1024)
        for (e = e.child; e !== null;) {
          var t = e;
          (dp(t),
            t.tag === 5 && t.flags & 1024 && t.stateNode.reset(),
            (e = e.sibling));
        }
    }
    function An(e, t) {
      if (t.subtreeFlags & 8772)
        for (t = t.child; t !== null;) (up(e, t.alternate, t), (t = t.sibling));
    }
    function xa(e) {
      for (e = e.child; e !== null;) {
        var t = e;
        switch (t.tag) {
          case 0:
          case 11:
          case 14:
          case 15:
            (ma(4, t, t.return), xa(t));
            break;
          case 1:
            fn(t, t.return);
            var n = t.stateNode;
            (typeof n.componentWillUnmount == "function" && ap(t, t.return, n),
              xa(t));
            break;
          case 27:
            Ml(t.stateNode);
          case 26:
          case 5:
            (fn(t, t.return), xa(t));
            break;
          case 22:
            t.memoizedState === null && xa(t);
            break;
          case 30:
            xa(t);
            break;
          default:
            xa(t);
        }
        e = e.sibling;
      }
    }
    function _n(e, t, n) {
      for (n = n && (t.subtreeFlags & 8772) !== 0, t = t.child; t !== null;) {
        var a = t.alternate,
          i = e,
          l = t,
          r = l.flags;
        switch (l.tag) {
          case 0:
          case 11:
          case 15:
            (_n(i, l, n), $l(4, l));
            break;
          case 1:
            if (
              (_n(i, l, n),
              (a = l),
              (i = a.stateNode),
              typeof i.componentDidMount == "function")
            )
              try {
                i.componentDidMount();
              } catch (o) {
                it(a, a.return, o);
              }
            if (((a = l), (i = a.updateQueue), i !== null)) {
              var u = a.stateNode;
              try {
                var s = i.shared.hiddenCallbacks;
                if (s !== null)
                  for (
                    i.shared.hiddenCallbacks = null, i = 0;
                    i < s.length;
                    i++
                  )
                    cg(s[i], u);
              } catch (o) {
                it(a, a.return, o);
              }
            }
            (n && r & 64 && np(l), Ol(l, l.return));
            break;
          case 27:
            rp(l);
          case 26:
          case 5:
            (_n(i, l, n), n && a === null && r & 4 && ip(l), Ol(l, l.return));
            break;
          case 12:
            _n(i, l, n);
            break;
          case 31:
            (_n(i, l, n), n && r & 4 && cp(i, l));
            break;
          case 13:
            (_n(i, l, n), n && r & 4 && fp(i, l));
            break;
          case 22:
            (l.memoizedState === null && _n(i, l, n), Ol(l, l.return));
            break;
          case 30:
            break;
          default:
            _n(i, l, n);
        }
        t = t.sibling;
      }
    }
    function tf(e, t) {
      var n = null;
      (e !== null &&
        e.memoizedState !== null &&
        e.memoizedState.cachePool !== null &&
        (n = e.memoizedState.cachePool.pool),
        (e = null),
        t.memoizedState !== null &&
          t.memoizedState.cachePool !== null &&
          (e = t.memoizedState.cachePool.pool),
        e !== n && (e != null && e.refCount++, n != null && Kl(n)));
    }
    function ef(e, t) {
      ((e = null),
        t.alternate !== null && (e = t.alternate.memoizedState.cache),
        (t = t.memoizedState.cache),
        t !== e && (t.refCount++, e != null && Kl(e)));
    }
    function nn(e, t, n, a) {
      if (t.subtreeFlags & 10256)
        for (t = t.child; t !== null;) (mp(e, t, n, a), (t = t.sibling));
    }
    function mp(e, t, n, a) {
      var i = t.flags;
      switch (t.tag) {
        case 0:
        case 11:
        case 15:
          (nn(e, t, n, a), i & 2048 && $l(9, t));
          break;
        case 1:
          nn(e, t, n, a);
          break;
        case 3:
          (nn(e, t, n, a),
            i & 2048 &&
              ((e = null),
              t.alternate !== null && (e = t.alternate.memoizedState.cache),
              (t = t.memoizedState.cache),
              t !== e && (t.refCount++, e != null && Kl(e))));
          break;
        case 12:
          if (i & 2048) {
            (nn(e, t, n, a), (e = t.stateNode));
            try {
              var l = t.memoizedProps,
                r = l.id,
                u = l.onPostCommit;
              typeof u == "function" &&
                u(
                  r,
                  t.alternate === null ? "mount" : "update",
                  e.passiveEffectDuration,
                  -0,
                );
            } catch (s) {
              it(t, t.return, s);
            }
          } else nn(e, t, n, a);
          break;
        case 31:
          nn(e, t, n, a);
          break;
        case 13:
          nn(e, t, n, a);
          break;
        case 23:
          break;
        case 22:
          ((l = t.stateNode),
            (r = t.alternate),
            t.memoizedState !== null
              ? l._visibility & 2
                ? nn(e, t, n, a)
                : Nl(e, t)
              : l._visibility & 2
                ? nn(e, t, n, a)
                : ((l._visibility |= 2),
                  li(e, t, n, a, (t.subtreeFlags & 10256) !== 0 || !1)),
            i & 2048 && tf(r, t));
          break;
        case 24:
          (nn(e, t, n, a), i & 2048 && ef(t.alternate, t));
          break;
        default:
          nn(e, t, n, a);
      }
    }
    function li(e, t, n, a, i) {
      for (
        i = i && ((t.subtreeFlags & 10256) !== 0 || !1), t = t.child;
        t !== null;
      ) {
        var l = e,
          r = t,
          u = n,
          s = a,
          o = r.flags;
        switch (r.tag) {
          case 0:
          case 11:
          case 15:
            (li(l, r, u, s, i), $l(8, r));
            break;
          case 23:
            break;
          case 22:
            var c = r.stateNode;
            (r.memoizedState !== null
              ? c._visibility & 2
                ? li(l, r, u, s, i)
                : Nl(l, r)
              : ((c._visibility |= 2), li(l, r, u, s, i)),
              i && o & 2048 && tf(r.alternate, r));
            break;
          case 24:
            (li(l, r, u, s, i), i && o & 2048 && ef(r.alternate, r));
            break;
          default:
            li(l, r, u, s, i);
        }
        t = t.sibling;
      }
    }
    function Nl(e, t) {
      if (t.subtreeFlags & 10256)
        for (t = t.child; t !== null;) {
          var n = e,
            a = t,
            i = a.flags;
          switch (a.tag) {
            case 22:
              (Nl(n, a), i & 2048 && tf(a.alternate, a));
              break;
            case 24:
              (Nl(n, a), i & 2048 && ef(a.alternate, a));
              break;
            default:
              Nl(n, a);
          }
          t = t.sibling;
        }
    }
    var yl = 8192;
    function ii(e, t, n) {
      if (e.subtreeFlags & yl)
        for (e = e.child; e !== null;) (gp(e, t, n), (e = e.sibling));
    }
    function gp(e, t, n) {
      switch (e.tag) {
        case 26:
          (ii(e, t, n),
            e.flags & yl &&
              e.memoizedState !== null &&
              Kb(n, an, e.memoizedState, e.memoizedProps));
          break;
        case 5:
          ii(e, t, n);
          break;
        case 3:
        case 4:
          var a = an;
          ((an = ku(e.stateNode.containerInfo)), ii(e, t, n), (an = a));
          break;
        case 22:
          e.memoizedState === null &&
            ((a = e.alternate),
            a !== null && a.memoizedState !== null
              ? ((a = yl), (yl = 16777216), ii(e, t, n), (yl = a))
              : ii(e, t, n));
          break;
        default:
          ii(e, t, n);
      }
    }
    function pp(e) {
      var t = e.alternate;
      if (t !== null && ((e = t.child), e !== null)) {
        t.child = null;
        do ((t = e.sibling), (e.sibling = null), (e = t));
        while (e !== null);
      }
    }
    function cl(e) {
      var t = e.deletions;
      if (e.flags & 16) {
        if (t !== null)
          for (var n = 0; n < t.length; n++) {
            var a = t[n];
            ((qt = a), vp(a, e));
          }
        pp(e);
      }
      if (e.subtreeFlags & 10256)
        for (e = e.child; e !== null;) (yp(e), (e = e.sibling));
    }
    function yp(e) {
      switch (e.tag) {
        case 0:
        case 11:
        case 15:
          (cl(e), e.flags & 2048 && ma(9, e, e.return));
          break;
        case 3:
          cl(e);
          break;
        case 12:
          cl(e);
          break;
        case 22:
          var t = e.stateNode;
          e.memoizedState !== null &&
          t._visibility & 2 &&
          (e.return === null || e.return.tag !== 13)
            ? ((t._visibility &= -3), ru(e))
            : cl(e);
          break;
        default:
          cl(e);
      }
    }
    function ru(e) {
      var t = e.deletions;
      if (e.flags & 16) {
        if (t !== null)
          for (var n = 0; n < t.length; n++) {
            var a = t[n];
            ((qt = a), vp(a, e));
          }
        pp(e);
      }
      for (e = e.child; e !== null;) {
        switch (((t = e), t.tag)) {
          case 0:
          case 11:
          case 15:
            (ma(8, t, t.return), ru(t));
            break;
          case 22:
            ((n = t.stateNode),
              n._visibility & 2 && ((n._visibility &= -3), ru(t)));
            break;
          default:
            ru(t);
        }
        e = e.sibling;
      }
    }
    function vp(e, t) {
      for (; qt !== null;) {
        var n = qt;
        switch (n.tag) {
          case 0:
          case 11:
          case 15:
            ma(8, n, t);
            break;
          case 23:
          case 22:
            if (
              n.memoizedState !== null &&
              n.memoizedState.cachePool !== null
            ) {
              var a = n.memoizedState.cachePool.pool;
              a != null && a.refCount++;
            }
            break;
          case 24:
            Kl(n.memoizedState.cache);
        }
        if (((a = n.child), a !== null)) ((a.return = n), (qt = a));
        else
          t: for (n = e; qt !== null;) {
            a = qt;
            var i = a.sibling,
              l = a.return;
            if ((sp(a), a === n)) {
              qt = null;
              break t;
            }
            if (i !== null) {
              ((i.return = l), (qt = i));
              break t;
            }
            qt = l;
          }
      }
    }
    var mb = {
        getCacheForType: function (e) {
          var t = Jt(Lt),
            n = t.data.get(e);
          return (n === void 0 && ((n = e()), t.data.set(e, n)), n);
        },
        cacheSignal: function () {
          return Jt(Lt).controller.signal;
        },
      },
      gb = typeof WeakMap == "function" ? WeakMap : Map,
      et = 0,
      ft = null,
      F = null,
      q = 0,
      at = 0,
      xe = null,
      ta = !1,
      Hi = !1,
      nf = !1,
      Bn = 0,
      Mt = 0,
      ga = 0,
      Va = 0,
      af = 0,
      Re = 0,
      Ri = 0,
      wl = null,
      Se = null,
      nc = !1,
      Ku = 0,
      Sp = 0,
      wu = 1 / 0,
      xu = null,
      ua = null,
      Gt = 0,
      sa = null,
      zi = null,
      zn = 0,
      ac = 0,
      ic = null,
      bp = null,
      xl = 0,
      lc = null;
    function Le() {
      return et & 2 && q !== 0 ? q & -q : V.T !== null ? rf() : xm();
    }
    function Cp() {
      if (Re === 0)
        if (!(q & 536870912) || X) {
          var e = Vr;
          ((Vr <<= 1), !(Vr & 3932160) && (Vr = 262144), (Re = e));
        } else Re = 536870912;
      return ((e = Be.current), e !== null && (e.flags |= 32), Re);
    }
    function be(e, t, n) {
      (((e === ft && (at === 2 || at === 9)) ||
        e.cancelPendingCommit !== null) &&
        (Vi(e, 0), ea(e, q, Re, !1)),
        Il(e, n),
        (!(et & 2) || e !== ft) &&
          (e === ft && (!(et & 2) && (Va |= n), Mt === 4 && ea(e, q, Re, !1)),
          mn(e)));
    }
    function Tp(e, t, n) {
      if (et & 6) throw Error(v(327));
      var a = (!n && (t & 127) === 0 && (t & e.expiredLanes) === 0) || Xl(e, t),
        i = a ? vb(e, t) : go(e, t, !0),
        l = a;
      do {
        if (i === 0) {
          Hi && !a && ea(e, t, 0, !1);
          break;
        } else {
          if (((n = e.current.alternate), l && !pb(n))) {
            ((i = go(e, t, !1)), (l = !1));
            continue;
          }
          if (i === 2) {
            if (((l = t), e.errorRecoveryDisabledLanes & l)) var r = 0;
            else
              ((r = e.pendingLanes & -536870913),
                (r = r !== 0 ? r : r & 536870912 ? 536870912 : 0));
            if (r !== 0) {
              t = r;
              t: {
                var u = e;
                i = wl;
                var s = u.current.memoizedState.isDehydrated;
                if (
                  (s && (Vi(u, r).flags |= 256), (r = go(u, r, !1)), r !== 2)
                ) {
                  if (nf && !s) {
                    ((u.errorRecoveryDisabledLanes |= l), (Va |= l), (i = 4));
                    break t;
                  }
                  ((l = Se),
                    (Se = i),
                    l !== null &&
                      (Se === null ? (Se = l) : Se.push.apply(Se, l)));
                }
                i = r;
              }
              if (((l = !1), i !== 2)) continue;
            }
          }
          if (i === 1) {
            (Vi(e, 0), ea(e, t, 0, !0));
            break;
          }
          t: {
            switch (((a = e), (l = i), l)) {
              case 0:
              case 1:
                throw Error(v(345));
              case 4:
                if ((t & 4194048) !== t) break;
              case 6:
                ea(a, t, Re, !ta);
                break t;
              case 2:
                Se = null;
                break;
              case 3:
              case 5:
                break;
              default:
                throw Error(v(329));
            }
            if ((t & 62914560) === t && ((i = Ku + 300 - ze()), 10 < i)) {
              if ((ea(a, t, Re, !ta), Gu(a, 0, !0) !== 0)) break t;
              ((zn = t),
                (a.timeoutHandle = Wp(
                  Gd.bind(
                    null,
                    a,
                    n,
                    Se,
                    xu,
                    nc,
                    t,
                    Re,
                    Va,
                    Ri,
                    ta,
                    l,
                    "Throttled",
                    -0,
                    0,
                  ),
                  i,
                )));
              break t;
            }
            Gd(a, n, Se, xu, nc, t, Re, Va, Ri, ta, l, null, -0, 0);
          }
        }
        break;
      } while (!0);
      mn(e);
    }
    function Gd(e, t, n, a, i, l, r, u, s, o, c, h, f, p) {
      if (
        ((e.timeoutHandle = -1),
        (h = t.subtreeFlags),
        h & 8192 || (h & 16785408) === 16785408)
      ) {
        ((h = {
          stylesheets: null,
          count: 0,
          imgCount: 0,
          imgBytes: 0,
          suspenseyImages: [],
          waitingForImages: !0,
          waitingForViewTransition: !1,
          unsuspend: xn,
        }),
          gp(t, l, h));
        var S =
          (l & 62914560) === l
            ? Ku - ze()
            : (l & 4194048) === l
              ? Sp - ze()
              : 0;
        if (((S = Jb(h, S)), S !== null)) {
          ((zn = l),
            (e.cancelPendingCommit = S(
              Wd.bind(null, e, t, l, n, a, i, r, u, s, c, h, null, f, p),
            )),
            ea(e, l, r, !o));
          return;
        }
      }
      Wd(e, t, l, n, a, i, r, u, s);
    }
    function pb(e) {
      for (var t = e; ;) {
        var n = t.tag;
        if (
          (n === 0 || n === 11 || n === 15) &&
          t.flags & 16384 &&
          ((n = t.updateQueue), n !== null && ((n = n.stores), n !== null))
        )
          for (var a = 0; a < n.length; a++) {
            var i = n[a],
              l = i.getSnapshot;
            i = i.value;
            try {
              if (!Ue(l(), i)) return !1;
            } catch {
              return !1;
            }
          }
        if (((n = t.child), t.subtreeFlags & 16384 && n !== null))
          ((n.return = t), (t = n));
        else {
          if (t === e) break;
          for (; t.sibling === null;) {
            if (t.return === null || t.return === e) return !0;
            t = t.return;
          }
          ((t.sibling.return = t.return), (t = t.sibling));
        }
      }
      return !0;
    }
    function ea(e, t, n, a) {
      ((t &= ~af),
        (t &= ~Va),
        (e.suspendedLanes |= t),
        (e.pingedLanes &= ~t),
        a && (e.warmLanes |= t),
        (a = e.expirationTimes));
      for (var i = t; 0 < i;) {
        var l = 31 - ke(i),
          r = 1 << l;
        ((a[l] = -1), (i &= ~r));
      }
      n !== 0 && Om(e, n, t);
    }
    function Ju() {
      return et & 6 ? !0 : (tr(0, !1), !1);
    }
    function lf() {
      if (F !== null) {
        if (at === 0) var e = F.return;
        else ((e = F), (Mn = qa = null), Fc(e), (Ei = null), (Ul = 0), (e = F));
        for (; e !== null;) (ep(e.alternate, e), (e = e.return));
        F = null;
      }
    }
    function Vi(e, t) {
      var n = e.timeoutHandle;
      (n !== -1 && ((e.timeoutHandle = -1), Vb(n)),
        (n = e.cancelPendingCommit),
        n !== null && ((e.cancelPendingCommit = null), n()),
        (zn = 0),
        lf(),
        (ft = e),
        (F = n = Dn(e.current, null)),
        (q = t),
        (at = 0),
        (xe = null),
        (ta = !1),
        (Hi = Xl(e, t)),
        (nf = !1),
        (Ri = Re = af = Va = ga = Mt = 0),
        (Se = wl = null),
        (nc = !1),
        t & 8 && (t |= t & 32));
      var a = e.entangledLanes;
      if (a !== 0)
        for (e = e.entanglements, a &= t; 0 < a;) {
          var i = 31 - ke(a),
            l = 1 << i;
          ((t |= e[i]), (a &= ~l));
        }
      return ((Bn = t), qu(), n);
    }
    function Ep(e, t) {
      ((U = null),
        (V.H = jl),
        t === Gi || t === Pu
          ? ((t = vd()), (at = 3))
          : t === Lc
            ? ((t = vd()), (at = 4))
            : (at =
                t === Jc
                  ? 8
                  : t !== null &&
                      typeof t == "object" &&
                      typeof t.then == "function"
                    ? 6
                    : 1),
        (xe = t),
        F === null && ((Mt = 1), _u(e, Pe(t, e.current))));
    }
    function Ap() {
      var e = Be.current;
      return e === null
        ? !0
        : (q & 4194048) === q
          ? Ie === null
          : (q & 62914560) === q || q & 536870912
            ? e === Ie
            : !1;
    }
    function _p() {
      var e = V.H;
      return ((V.H = jl), e === null ? jl : e);
    }
    function Op() {
      var e = V.A;
      return ((V.A = mb), e);
    }
    function Mu() {
      ((Mt = 4),
        ta || ((q & 4194048) !== q && Be.current !== null) || (Hi = !0),
        (!(ga & 134217727) && !(Va & 134217727)) ||
          ft === null ||
          ea(ft, q, Re, !1));
    }
    function go(e, t, n) {
      var a = et;
      et |= 2;
      var i = _p(),
        l = Op();
      ((ft !== e || q !== t) && ((xu = null), Vi(e, t)), (t = !1));
      var r = Mt;
      t: do
        try {
          if (at !== 0 && F !== null) {
            var u = F,
              s = xe;
            switch (at) {
              case 8:
                (lf(), (r = 6));
                break t;
              case 3:
              case 2:
              case 9:
              case 6:
                Be.current === null && (t = !0);
                var o = at;
                if (((at = 0), (xe = null), vi(e, u, s, o), n && Hi)) {
                  r = 0;
                  break t;
                }
                break;
              default:
                ((o = at), (at = 0), (xe = null), vi(e, u, s, o));
            }
          }
          (yb(), (r = Mt));
          break;
        } catch (c) {
          Ep(e, c);
        }
      while (!0);
      return (
        t && e.shellSuspendCounter++,
        (Mn = qa = null),
        (et = a),
        (V.H = i),
        (V.A = l),
        F === null && ((ft = null), (q = 0), qu()),
        r
      );
    }
    function yb() {
      for (; F !== null;) Np(F);
    }
    function vb(e, t) {
      var n = et;
      et |= 2;
      var a = _p(),
        i = Op();
      ft !== e || q !== t
        ? ((xu = null), (wu = ze() + 500), Vi(e, t))
        : (Hi = Xl(e, t));
      t: do
        try {
          if (at !== 0 && F !== null) {
            t = F;
            var l = xe;
            e: switch (at) {
              case 1:
                ((at = 0), (xe = null), vi(e, t, l, 1));
                break;
              case 2:
              case 9:
                if (yd(l)) {
                  ((at = 0), (xe = null), Hd(t));
                  break;
                }
                ((t = function () {
                  ((at !== 2 && at !== 9) || ft !== e || (at = 7), mn(e));
                }),
                  l.then(t, t));
                break t;
              case 3:
                at = 7;
                break t;
              case 4:
                at = 5;
                break t;
              case 7:
                yd(l)
                  ? ((at = 0), (xe = null), Hd(t))
                  : ((at = 0), (xe = null), vi(e, t, l, 7));
                break;
              case 5:
                var r = null;
                switch (F.tag) {
                  case 26:
                    r = F.memoizedState;
                  case 5:
                  case 27:
                    var u = F;
                    if (r ? Xp(r) : u.stateNode.complete) {
                      ((at = 0), (xe = null));
                      var s = u.sibling;
                      if (s !== null) F = s;
                      else {
                        var o = u.return;
                        o !== null ? ((F = o), $u(o)) : (F = null);
                      }
                      break e;
                    }
                }
                ((at = 0), (xe = null), vi(e, t, l, 5));
                break;
              case 6:
                ((at = 0), (xe = null), vi(e, t, l, 6));
                break;
              case 8:
                (lf(), (Mt = 6));
                break t;
              default:
                throw Error(v(462));
            }
          }
          Sb();
          break;
        } catch (c) {
          Ep(e, c);
        }
      while (!0);
      return (
        (Mn = qa = null),
        (V.H = a),
        (V.A = i),
        (et = n),
        F !== null ? 0 : ((ft = null), (q = 0), qu(), Mt)
      );
    }
    function Sb() {
      for (; F !== null && !WS();) Np(F);
    }
    function Np(e) {
      var t = tp(e.alternate, e, Bn);
      ((e.memoizedProps = e.pendingProps), t === null ? $u(e) : (F = t));
    }
    function Hd(e) {
      var t = e,
        n = t.alternate;
      switch (t.tag) {
        case 15:
        case 0:
          t = Vd(n, t, t.pendingProps, t.type, void 0, q);
          break;
        case 11:
          t = Vd(n, t, t.pendingProps, t.type.render, t.ref, q);
          break;
        case 5:
          Fc(t);
        default:
          (ep(n, t), (t = F = eg(t, Bn)), (t = tp(n, t, Bn)));
      }
      ((e.memoizedProps = e.pendingProps), t === null ? $u(e) : (F = t));
    }
    function vi(e, t, n, a) {
      ((Mn = qa = null), Fc(t), (Ei = null), (Ul = 0));
      var i = t.return;
      try {
        if (ub(e, i, t, n, q)) {
          ((Mt = 1), _u(e, Pe(n, e.current)), (F = null));
          return;
        }
      } catch (l) {
        if (i !== null) throw ((F = i), l);
        ((Mt = 1), _u(e, Pe(n, e.current)), (F = null));
        return;
      }
      t.flags & 32768
        ? (X || a === 1
            ? (e = !0)
            : Hi || q & 536870912
              ? (e = !1)
              : ((ta = e = !0),
                (a === 2 || a === 9 || a === 3 || a === 6) &&
                  ((a = Be.current),
                  a !== null && a.tag === 13 && (a.flags |= 16384))),
          wp(t, e))
        : $u(t);
    }
    function $u(e) {
      var t = e;
      do {
        if (t.flags & 32768) {
          wp(t, ta);
          return;
        }
        e = t.return;
        var n = cb(t.alternate, t, Bn);
        if (n !== null) {
          F = n;
          return;
        }
        if (((t = t.sibling), t !== null)) {
          F = t;
          return;
        }
        F = t = e;
      } while (t !== null);
      Mt === 0 && (Mt = 5);
    }
    function wp(e, t) {
      do {
        var n = fb(e.alternate, e);
        if (n !== null) {
          ((n.flags &= 32767), (F = n));
          return;
        }
        if (
          ((n = e.return),
          n !== null &&
            ((n.flags |= 32768), (n.subtreeFlags = 0), (n.deletions = null)),
          !t && ((e = e.sibling), e !== null))
        ) {
          F = e;
          return;
        }
        F = e = n;
      } while (e !== null);
      ((Mt = 6), (F = null));
    }
    function Wd(e, t, n, a, i, l, r, u, s) {
      e.cancelPendingCommit = null;
      do ts();
      while (Gt !== 0);
      if (et & 6) throw Error(v(327));
      if (t !== null) {
        if (t === e.current) throw Error(v(177));
        if (
          ((l = t.lanes | t.childLanes),
          (l |= xc),
          JS(e, n, l, r, u, s),
          e === ft && ((F = ft = null), (q = 0)),
          (zi = t),
          (sa = e),
          (zn = n),
          (ac = l),
          (ic = i),
          (bp = a),
          t.subtreeFlags & 10256 || t.flags & 10256
            ? ((e.callbackNode = null),
              (e.callbackPriority = 0),
              Eb(mu, function () {
                return (zp(), null);
              }))
            : ((e.callbackNode = null), (e.callbackPriority = 0)),
          (a = (t.flags & 13878) !== 0),
          t.subtreeFlags & 13878 || a)
        ) {
          ((a = V.T),
            (V.T = null),
            (i = nt.p),
            (nt.p = 2),
            (r = et),
            (et |= 4));
          try {
            hb(e, t, n);
          } finally {
            ((et = r), (nt.p = i), (V.T = a));
          }
        }
        ((Gt = 1), xp(), Mp(), Dp());
      }
    }
    function xp() {
      if (Gt === 1) {
        Gt = 0;
        var e = sa,
          t = zi,
          n = (t.flags & 13878) !== 0;
        if (t.subtreeFlags & 13878 || n) {
          ((n = V.T), (V.T = null));
          var a = nt.p;
          nt.p = 2;
          var i = et;
          et |= 4;
          try {
            hp(t, e);
            var l = oc,
              r = Xm(e.containerInfo),
              u = l.focusedElem,
              s = l.selectionRange;
            if (
              r !== u &&
              u &&
              u.ownerDocument &&
              Pm(u.ownerDocument.documentElement, u)
            ) {
              if (s !== null && wc(u)) {
                var o = s.start,
                  c = s.end;
                if ((c === void 0 && (c = o), "selectionStart" in u))
                  ((u.selectionStart = o),
                    (u.selectionEnd = Math.min(c, u.value.length)));
                else {
                  var h = u.ownerDocument || document,
                    f = (h && h.defaultView) || window;
                  if (f.getSelection) {
                    var p = f.getSelection(),
                      S = u.textContent.length,
                      T = Math.min(s.start, S),
                      x = s.end === void 0 ? T : Math.min(s.end, S);
                    !p.extend && T > x && ((r = x), (x = T), (T = r));
                    var g = cd(u, T),
                      d = cd(u, x);
                    if (
                      g &&
                      d &&
                      (p.rangeCount !== 1 ||
                        p.anchorNode !== g.node ||
                        p.anchorOffset !== g.offset ||
                        p.focusNode !== d.node ||
                        p.focusOffset !== d.offset)
                    ) {
                      var m = h.createRange();
                      (m.setStart(g.node, g.offset),
                        p.removeAllRanges(),
                        T > x
                          ? (p.addRange(m), p.extend(d.node, d.offset))
                          : (m.setEnd(d.node, d.offset), p.addRange(m)));
                    }
                  }
                }
              }
              for (h = [], p = u; (p = p.parentNode);)
                p.nodeType === 1 &&
                  h.push({ element: p, left: p.scrollLeft, top: p.scrollTop });
              for (
                typeof u.focus == "function" && u.focus(), u = 0;
                u < h.length;
                u++
              ) {
                var y = h[u];
                ((y.element.scrollLeft = y.left),
                  (y.element.scrollTop = y.top));
              }
            }
            ((Bu = !!sc), (oc = sc = null));
          } finally {
            ((et = i), (nt.p = a), (V.T = n));
          }
        }
        ((e.current = t), (Gt = 2));
      }
    }
    function Mp() {
      if (Gt === 2) {
        Gt = 0;
        var e = sa,
          t = zi,
          n = (t.flags & 8772) !== 0;
        if (t.subtreeFlags & 8772 || n) {
          ((n = V.T), (V.T = null));
          var a = nt.p;
          nt.p = 2;
          var i = et;
          et |= 4;
          try {
            up(e, t.alternate, t);
          } finally {
            ((et = i), (nt.p = a), (V.T = n));
          }
        }
        Gt = 3;
      }
    }
    function Dp() {
      if (Gt === 4 || Gt === 3) {
        ((Gt = 0), FS());
        var e = sa,
          t = zi,
          n = zn,
          a = bp;
        t.subtreeFlags & 10256 || t.flags & 10256
          ? (Gt = 5)
          : ((Gt = 0), (zi = sa = null), Rp(e, e.pendingLanes));
        var i = e.pendingLanes;
        if (
          (i === 0 && (ua = null),
          Cc(n),
          (t = t.stateNode),
          Ve && typeof Ve.onCommitFiberRoot == "function")
        )
          try {
            Ve.onCommitFiberRoot(
              Pl,
              t,
              void 0,
              (t.current.flags & 128) === 128,
            );
          } catch {}
        if (a !== null) {
          ((t = V.T), (i = nt.p), (nt.p = 2), (V.T = null));
          try {
            for (var l = e.onRecoverableError, r = 0; r < a.length; r++) {
              var u = a[r];
              l(u.value, { componentStack: u.stack });
            }
          } finally {
            ((V.T = t), (nt.p = i));
          }
        }
        (zn & 3 && ts(),
          mn(e),
          (i = e.pendingLanes),
          n & 261930 && i & 42
            ? e === lc
              ? xl++
              : ((xl = 0), (lc = e))
            : (xl = 0),
          tr(0, !1));
      }
    }
    function Rp(e, t) {
      (e.pooledCacheLanes &= t) === 0 &&
        ((t = e.pooledCache), t != null && ((e.pooledCache = null), Kl(t)));
    }
    function ts() {
      return (xp(), Mp(), Dp(), zp());
    }
    function zp() {
      if (Gt !== 5) return !1;
      var e = sa,
        t = ac;
      ac = 0;
      var n = Cc(zn),
        a = V.T,
        i = nt.p;
      try {
        ((nt.p = 32 > n ? 32 : n), (V.T = null), (n = ic), (ic = null));
        var l = sa,
          r = zn;
        if (((Gt = 0), (zi = sa = null), (zn = 0), et & 6)) throw Error(v(331));
        var u = et;
        if (
          ((et |= 4),
          yp(l.current),
          mp(l, l.current, r, n),
          (et = u),
          tr(0, !1),
          Ve && typeof Ve.onPostCommitFiberRoot == "function")
        )
          try {
            Ve.onPostCommitFiberRoot(Pl, l);
          } catch {}
        return !0;
      } finally {
        ((nt.p = i), (V.T = a), Rp(e, t));
      }
    }
    function Fd(e, t, n) {
      ((t = Pe(n, t)),
        (t = Jo(e.stateNode, t, 2)),
        (e = ra(e, t, 2)),
        e !== null && (Il(e, 2), mn(e)));
    }
    function it(e, t, n) {
      if (e.tag === 3) Fd(e, e, n);
      else
        for (; t !== null;) {
          if (t.tag === 3) {
            Fd(t, e, n);
            break;
          } else if (t.tag === 1) {
            var a = t.stateNode;
            if (
              typeof t.type.getDerivedStateFromError == "function" ||
              (typeof a.componentDidCatch == "function" &&
                (ua === null || !ua.has(a)))
            ) {
              ((e = Pe(n, e)),
                (n = Ig(2)),
                (a = ra(t, n, 2)),
                a !== null && (Qg(n, a, t, e), Il(a, 2), mn(a)));
              break;
            }
          }
          t = t.return;
        }
    }
    function po(e, t, n) {
      var a = e.pingCache;
      if (a === null) {
        a = e.pingCache = new gb();
        var i = new Set();
        a.set(t, i);
      } else ((i = a.get(t)), i === void 0 && ((i = new Set()), a.set(t, i)));
      i.has(n) ||
        ((nf = !0), i.add(n), (e = bb.bind(null, e, t, n)), t.then(e, e));
    }
    function bb(e, t, n) {
      var a = e.pingCache;
      (a !== null && a.delete(t),
        (e.pingedLanes |= e.suspendedLanes & n),
        (e.warmLanes &= ~n),
        ft === e &&
          (q & n) === n &&
          (Mt === 4 || (Mt === 3 && (q & 62914560) === q && 300 > ze() - Ku)
            ? !(et & 2) && Vi(e, 0)
            : (af |= n),
          Ri === q && (Ri = 0)),
        mn(e));
    }
    function Vp(e, t) {
      (t === 0 && (t = _m()), (e = Fa(e, t)), e !== null && (Il(e, t), mn(e)));
    }
    function Cb(e) {
      var t = e.memoizedState,
        n = 0;
      (t !== null && (n = t.retryLane), Vp(e, n));
    }
    function Tb(e, t) {
      var n = 0;
      switch (e.tag) {
        case 31:
        case 13:
          var a = e.stateNode,
            i = e.memoizedState;
          i !== null && (n = i.retryLane);
          break;
        case 19:
          a = e.stateNode;
          break;
        case 22:
          a = e.stateNode._retryCache;
          break;
        default:
          throw Error(v(314));
      }
      (a !== null && a.delete(t), Vp(e, n));
    }
    function Eb(e, t) {
      return Sc(e, t);
    }
    var Du = null,
      ri = null,
      rc = !1,
      Ru = !1,
      yo = !1,
      na = 0;
    function mn(e) {
      (e !== ri &&
        e.next === null &&
        (ri === null ? (Du = ri = e) : (ri = ri.next = e)),
        (Ru = !0),
        rc || ((rc = !0), _b()));
    }
    function tr(e, t) {
      if (!yo && Ru) {
        yo = !0;
        do
          for (var n = !1, a = Du; a !== null;) {
            if (!t)
              if (e !== 0) {
                var i = a.pendingLanes;
                if (i === 0) var l = 0;
                else {
                  var r = a.suspendedLanes,
                    u = a.pingedLanes;
                  ((l = (1 << (31 - ke(42 | e) + 1)) - 1),
                    (l &= i & ~(r & ~u)),
                    (l = l & 201326741 ? (l & 201326741) | 1 : l ? l | 2 : 0));
                }
                l !== 0 && ((n = !0), qd(a, l));
              } else
                ((l = q),
                  (l = Gu(
                    a,
                    a === ft ? l : 0,
                    a.cancelPendingCommit !== null || a.timeoutHandle !== -1,
                  )),
                  !(l & 3) || Xl(a, l) || ((n = !0), qd(a, l)));
            a = a.next;
          }
        while (n);
        yo = !1;
      }
    }
    function Ab() {
      kp();
    }
    function kp() {
      Ru = rc = !1;
      var e = 0;
      na !== 0 && zb() && (e = na);
      for (var t = ze(), n = null, a = Du; a !== null;) {
        var i = a.next,
          l = Lp(a, t);
        (l === 0
          ? ((a.next = null),
            n === null ? (Du = i) : (n.next = i),
            i === null && (ri = n))
          : ((n = a), (e !== 0 || l & 3) && (Ru = !0)),
          (a = i));
      }
      ((Gt !== 0 && Gt !== 5) || tr(e, !1), na !== 0 && (na = 0));
    }
    function Lp(e, t) {
      for (
        var n = e.suspendedLanes,
          a = e.pingedLanes,
          i = e.expirationTimes,
          l = e.pendingLanes & -62914561;
        0 < l;
      ) {
        var r = 31 - ke(l),
          u = 1 << r,
          s = i[r];
        (s === -1
          ? (!(u & n) || u & a) && (i[r] = KS(u, t))
          : s <= t && (e.expiredLanes |= u),
          (l &= ~u));
      }
      if (
        ((t = ft),
        (n = q),
        (n = Gu(
          e,
          e === t ? n : 0,
          e.cancelPendingCommit !== null || e.timeoutHandle !== -1,
        )),
        (a = e.callbackNode),
        n === 0 ||
          (e === t && (at === 2 || at === 9)) ||
          e.cancelPendingCommit !== null)
      )
        return (
          a !== null && a !== null && Ys(a),
          (e.callbackNode = null),
          (e.callbackPriority = 0)
        );
      if (!(n & 3) || Xl(e, n)) {
        if (((t = n & -n), t === e.callbackPriority)) return t;
        switch ((a !== null && Ys(a), Cc(n))) {
          case 2:
          case 8:
            n = Em;
            break;
          case 32:
            n = mu;
            break;
          case 268435456:
            n = Am;
            break;
          default:
            n = mu;
        }
        return (
          (a = Up.bind(null, e)),
          (n = Sc(n, a)),
          (e.callbackPriority = t),
          (e.callbackNode = n),
          t
        );
      }
      return (
        a !== null && a !== null && Ys(a),
        (e.callbackPriority = 2),
        (e.callbackNode = null),
        2
      );
    }
    function Up(e, t) {
      if (Gt !== 0 && Gt !== 5)
        return ((e.callbackNode = null), (e.callbackPriority = 0), null);
      var n = e.callbackNode;
      if (ts() && e.callbackNode !== n) return null;
      var a = q;
      return (
        (a = Gu(
          e,
          e === ft ? a : 0,
          e.cancelPendingCommit !== null || e.timeoutHandle !== -1,
        )),
        a === 0
          ? null
          : (Tp(e, a, t),
            Lp(e, ze()),
            e.callbackNode != null && e.callbackNode === n
              ? Up.bind(null, e)
              : null)
      );
    }
    function qd(e, t) {
      if (ts()) return null;
      Tp(e, t, !0);
    }
    function _b() {
      kb(function () {
        et & 6 ? Sc(Tm, Ab) : kp();
      });
    }
    function rf() {
      if (na === 0) {
        var e = xi;
        (e === 0 && ((e = zr), (zr <<= 1), !(zr & 261888) && (zr = 256)),
          (na = e));
      }
      return na;
    }
    function Yd(e) {
      return e == null || typeof e == "symbol" || typeof e == "boolean"
        ? null
        : typeof e == "function"
          ? e
          : Kr("" + e);
    }
    function Pd(e, t) {
      var n = t.ownerDocument.createElement("input");
      return (
        (n.name = t.name),
        (n.value = t.value),
        e.id && n.setAttribute("form", e.id),
        t.parentNode.insertBefore(n, t),
        (e = new FormData(e)),
        n.parentNode.removeChild(n),
        e
      );
    }
    function Ob(e, t, n, a, i) {
      if (t === "submit" && n && n.stateNode === i) {
        var l = Yd((i[Ce] || null).action),
          r = a.submitter;
        r &&
          ((t = (t = r[Ce] || null)
            ? Yd(t.formAction)
            : r.getAttribute("formAction")),
          t !== null && ((l = t), (r = null)));
        var u = new Hu("action", "action", null, a, i);
        e.push({
          event: u,
          listeners: [
            {
              instance: null,
              listener: function () {
                if (a.defaultPrevented) {
                  if (na !== 0) {
                    var s = r ? Pd(i, r) : new FormData(i);
                    Zo(
                      n,
                      { pending: !0, data: s, method: i.method, action: l },
                      null,
                      s,
                    );
                  }
                } else
                  typeof l == "function" &&
                    (u.preventDefault(),
                    (s = r ? Pd(i, r) : new FormData(i)),
                    Zo(
                      n,
                      { pending: !0, data: s, method: i.method, action: l },
                      l,
                      s,
                    ));
              },
              currentTarget: i,
            },
          ],
        });
      }
    }
    for (Yr = 0; Yr < Bo.length; Yr++)
      ((Pr = Bo[Yr]),
        (Xd = Pr.toLowerCase()),
        (Id = Pr[0].toUpperCase() + Pr.slice(1)),
        ln(Xd, "on" + Id));
    var Pr, Xd, Id, Yr;
    ln(Qm, "onAnimationEnd");
    ln(Zm, "onAnimationIteration");
    ln(Km, "onAnimationStart");
    ln("dblclick", "onDoubleClick");
    ln("focusin", "onFocus");
    ln("focusout", "onBlur");
    ln(q0, "onTransitionRun");
    ln(Y0, "onTransitionStart");
    ln(P0, "onTransitionCancel");
    ln(Jm, "onTransitionEnd");
    Ni("onMouseEnter", ["mouseout", "mouseover"]);
    Ni("onMouseLeave", ["mouseout", "mouseover"]);
    Ni("onPointerEnter", ["pointerout", "pointerover"]);
    Ni("onPointerLeave", ["pointerout", "pointerover"]);
    Ga(
      "onChange",
      "change click focusin focusout input keydown keyup selectionchange".split(
        " ",
      ),
    );
    Ga(
      "onSelect",
      "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
        " ",
      ),
    );
    Ga("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
    Ga(
      "onCompositionEnd",
      "compositionend focusout keydown keypress keyup mousedown".split(" "),
    );
    Ga(
      "onCompositionStart",
      "compositionstart focusout keydown keypress keyup mousedown".split(" "),
    );
    Ga(
      "onCompositionUpdate",
      "compositionupdate focusout keydown keypress keyup mousedown".split(" "),
    );
    var Gl =
        "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
          " ",
        ),
      Nb = new Set(
        "beforetoggle cancel close invalid load scroll scrollend toggle"
          .split(" ")
          .concat(Gl),
      );
    function Bp(e, t) {
      t = (t & 4) !== 0;
      for (var n = 0; n < e.length; n++) {
        var a = e[n],
          i = a.event;
        a = a.listeners;
        t: {
          var l = void 0;
          if (t)
            for (var r = a.length - 1; 0 <= r; r--) {
              var u = a[r],
                s = u.instance,
                o = u.currentTarget;
              if (((u = u.listener), s !== l && i.isPropagationStopped()))
                break t;
              ((l = u), (i.currentTarget = o));
              try {
                l(i);
              } catch (c) {
                pu(c);
              }
              ((i.currentTarget = null), (l = s));
            }
          else
            for (r = 0; r < a.length; r++) {
              if (
                ((u = a[r]),
                (s = u.instance),
                (o = u.currentTarget),
                (u = u.listener),
                s !== l && i.isPropagationStopped())
              )
                break t;
              ((l = u), (i.currentTarget = o));
              try {
                l(i);
              } catch (c) {
                pu(c);
              }
              ((i.currentTarget = null), (l = s));
            }
        }
      }
    }
    function W(e, t) {
      var n = t[Mo];
      n === void 0 && (n = t[Mo] = new Set());
      var a = e + "__bubble";
      n.has(a) || (jp(t, e, 2, !1), n.add(a));
    }
    function vo(e, t, n) {
      var a = 0;
      (t && (a |= 4), jp(n, e, a, t));
    }
    var Xr = "_reactListening" + Math.random().toString(36).slice(2);
    function uf(e) {
      if (!e[Xr]) {
        ((e[Xr] = !0),
          Mm.forEach(function (n) {
            n !== "selectionchange" &&
              (Nb.has(n) || vo(n, !1, e), vo(n, !0, e));
          }));
        var t = e.nodeType === 9 ? e : e.ownerDocument;
        t === null || t[Xr] || ((t[Xr] = !0), vo("selectionchange", !1, t));
      }
    }
    function jp(e, t, n, a) {
      switch (Jp(t)) {
        case 2:
          var i = e1;
          break;
        case 8:
          i = n1;
          break;
        default:
          i = ff;
      }
      ((n = i.bind(null, t, n, e)),
        (i = void 0),
        !ko ||
          (t !== "touchstart" && t !== "touchmove" && t !== "wheel") ||
          (i = !0),
        a
          ? i !== void 0
            ? e.addEventListener(t, n, { capture: !0, passive: i })
            : e.addEventListener(t, n, !0)
          : i !== void 0
            ? e.addEventListener(t, n, { passive: i })
            : e.addEventListener(t, n, !1));
    }
    function So(e, t, n, a, i) {
      var l = a;
      if (!(t & 1) && !(t & 2) && a !== null)
        t: for (;;) {
          if (a === null) return;
          var r = a.tag;
          if (r === 3 || r === 4) {
            var u = a.stateNode.containerInfo;
            if (u === i) break;
            if (r === 4)
              for (r = a.return; r !== null;) {
                var s = r.tag;
                if ((s === 3 || s === 4) && r.stateNode.containerInfo === i)
                  return;
                r = r.return;
              }
            for (; u !== null;) {
              if (((r = oi(u)), r === null)) return;
              if (((s = r.tag), s === 5 || s === 6 || s === 26 || s === 27)) {
                a = l = r;
                continue t;
              }
              u = u.parentNode;
            }
          }
          a = a.return;
        }
      Bm(function () {
        var o = l,
          c = Ac(n),
          h = [];
        t: {
          var f = $m.get(e);
          if (f !== void 0) {
            var p = Hu,
              S = e;
            switch (e) {
              case "keypress":
                if ($r(n) === 0) break t;
              case "keydown":
              case "keyup":
                p = T0;
                break;
              case "focusin":
                ((S = "focus"), (p = Zs));
                break;
              case "focusout":
                ((S = "blur"), (p = Zs));
                break;
              case "beforeblur":
              case "afterblur":
                p = Zs;
                break;
              case "click":
                if (n.button === 2) break t;
              case "auxclick":
              case "dblclick":
              case "mousedown":
              case "mousemove":
              case "mouseup":
              case "mouseout":
              case "mouseover":
              case "contextmenu":
                p = ed;
                break;
              case "drag":
              case "dragend":
              case "dragenter":
              case "dragexit":
              case "dragleave":
              case "dragover":
              case "dragstart":
              case "drop":
                p = c0;
                break;
              case "touchcancel":
              case "touchend":
              case "touchmove":
              case "touchstart":
                p = _0;
                break;
              case Qm:
              case Zm:
              case Km:
                p = d0;
                break;
              case Jm:
                p = N0;
                break;
              case "scroll":
              case "scrollend":
                p = s0;
                break;
              case "wheel":
                p = x0;
                break;
              case "copy":
              case "cut":
              case "paste":
                p = g0;
                break;
              case "gotpointercapture":
              case "lostpointercapture":
              case "pointercancel":
              case "pointerdown":
              case "pointermove":
              case "pointerout":
              case "pointerover":
              case "pointerup":
                p = ad;
                break;
              case "toggle":
              case "beforetoggle":
                p = D0;
            }
            var T = (t & 4) !== 0,
              x = !T && (e === "scroll" || e === "scrollend"),
              g = T ? (f !== null ? f + "Capture" : null) : f;
            T = [];
            for (var d = o, m; d !== null;) {
              var y = d;
              if (
                ((m = y.stateNode),
                (y = y.tag),
                (y !== 5 && y !== 26 && y !== 27) ||
                  m === null ||
                  g === null ||
                  ((y = Rl(d, g)), y != null && T.push(Hl(d, y, m))),
                x)
              )
                break;
              d = d.return;
            }
            0 < T.length &&
              ((f = new p(f, S, null, n, c)),
              h.push({ event: f, listeners: T }));
          }
        }
        if (!(t & 7)) {
          t: {
            if (
              ((f = e === "mouseover" || e === "pointerover"),
              (p = e === "mouseout" || e === "pointerout"),
              f &&
                n !== Vo &&
                (S = n.relatedTarget || n.fromElement) &&
                (oi(S) || S[Ui]))
            )
              break t;
            if (
              (p || f) &&
              ((f =
                c.window === c
                  ? c
                  : (f = c.ownerDocument)
                    ? f.defaultView || f.parentWindow
                    : window),
              p
                ? ((S = n.relatedTarget || n.toElement),
                  (p = o),
                  (S = S ? oi(S) : null),
                  S !== null &&
                    ((x = Yl(S)),
                    (T = S.tag),
                    S !== x || (T !== 5 && T !== 27 && T !== 6)) &&
                    (S = null))
                : ((p = null), (S = o)),
              p !== S)
            ) {
              if (
                ((T = ed),
                (y = "onMouseLeave"),
                (g = "onMouseEnter"),
                (d = "mouse"),
                (e === "pointerout" || e === "pointerover") &&
                  ((T = ad),
                  (y = "onPointerLeave"),
                  (g = "onPointerEnter"),
                  (d = "pointer")),
                (x = p == null ? f : gl(p)),
                (m = S == null ? f : gl(S)),
                (f = new T(y, d + "leave", p, n, c)),
                (f.target = x),
                (f.relatedTarget = m),
                (y = null),
                oi(c) === o &&
                  ((T = new T(g, d + "enter", S, n, c)),
                  (T.target = m),
                  (T.relatedTarget = x),
                  (y = T)),
                (x = y),
                p && S)
              )
                e: {
                  for (T = wb, g = p, d = S, m = 0, y = g; y; y = T(y)) m++;
                  y = 0;
                  for (var b = d; b; b = T(b)) y++;
                  for (; 0 < m - y;) ((g = T(g)), m--);
                  for (; 0 < y - m;) ((d = T(d)), y--);
                  for (; m--;) {
                    if (g === d || (d !== null && g === d.alternate)) {
                      T = g;
                      break e;
                    }
                    ((g = T(g)), (d = T(d)));
                  }
                  T = null;
                }
              else T = null;
              (p !== null && Qd(h, f, p, T, !1),
                S !== null && x !== null && Qd(h, x, S, T, !0));
            }
          }
          t: {
            if (
              ((f = o ? gl(o) : window),
              (p = f.nodeName && f.nodeName.toLowerCase()),
              p === "select" || (p === "input" && f.type === "file"))
            )
              var N = ud;
            else if (rd(f))
              if (qm) N = H0;
              else {
                N = j0;
                var E = B0;
              }
            else
              ((p = f.nodeName),
                !p ||
                p.toLowerCase() !== "input" ||
                (f.type !== "checkbox" && f.type !== "radio")
                  ? o && Ec(o.elementType) && (N = ud)
                  : (N = G0));
            if (N && (N = N(e, o))) {
              Fm(h, N, n, c);
              break t;
            }
            (E && E(e, f, o),
              e === "focusout" &&
                o &&
                f.type === "number" &&
                o.memoizedProps.value != null &&
                zo(f, "number", f.value));
          }
          switch (((E = o ? gl(o) : window), e)) {
            case "focusin":
              (rd(E) || E.contentEditable === "true") &&
                ((hi = E), (Lo = o), (bl = null));
              break;
            case "focusout":
              bl = Lo = hi = null;
              break;
            case "mousedown":
              Uo = !0;
              break;
            case "contextmenu":
            case "mouseup":
            case "dragend":
              ((Uo = !1), fd(h, n, c));
              break;
            case "selectionchange":
              if (F0) break;
            case "keydown":
            case "keyup":
              fd(h, n, c);
          }
          var M;
          if (Nc)
            t: {
              switch (e) {
                case "compositionstart":
                  var w = "onCompositionStart";
                  break t;
                case "compositionend":
                  w = "onCompositionEnd";
                  break t;
                case "compositionupdate":
                  w = "onCompositionUpdate";
                  break t;
              }
              w = void 0;
            }
          else
            fi
              ? Hm(e, n) && (w = "onCompositionEnd")
              : e === "keydown" &&
                n.keyCode === 229 &&
                (w = "onCompositionStart");
          (w &&
            (Gm &&
              n.locale !== "ko" &&
              (fi || w !== "onCompositionStart"
                ? w === "onCompositionEnd" && fi && (M = jm())
                : (($n = c),
                  (_c = "value" in $n ? $n.value : $n.textContent),
                  (fi = !0))),
            (E = zu(o, w)),
            0 < E.length &&
              ((w = new nd(w, e, null, n, c)),
              h.push({ event: w, listeners: E }),
              M ? (w.data = M) : ((M = Wm(n)), M !== null && (w.data = M)))),
            (M = z0 ? V0(e, n) : k0(e, n)) &&
              ((w = zu(o, "onBeforeInput")),
              0 < w.length &&
                ((E = new nd("onBeforeInput", "beforeinput", null, n, c)),
                h.push({ event: E, listeners: w }),
                (E.data = M))),
            Ob(h, e, o, n, c));
        }
        Bp(h, t);
      });
    }
    function Hl(e, t, n) {
      return { instance: e, listener: t, currentTarget: n };
    }
    function zu(e, t) {
      for (var n = t + "Capture", a = []; e !== null;) {
        var i = e,
          l = i.stateNode;
        if (
          ((i = i.tag),
          (i !== 5 && i !== 26 && i !== 27) ||
            l === null ||
            ((i = Rl(e, n)),
            i != null && a.unshift(Hl(e, i, l)),
            (i = Rl(e, t)),
            i != null && a.push(Hl(e, i, l))),
          e.tag === 3)
        )
          return a;
        e = e.return;
      }
      return [];
    }
    function wb(e) {
      if (e === null) return null;
      do e = e.return;
      while (e && e.tag !== 5 && e.tag !== 27);
      return e || null;
    }
    function Qd(e, t, n, a, i) {
      for (var l = t._reactName, r = []; n !== null && n !== a;) {
        var u = n,
          s = u.alternate,
          o = u.stateNode;
        if (((u = u.tag), s !== null && s === a)) break;
        ((u !== 5 && u !== 26 && u !== 27) ||
          o === null ||
          ((s = o),
          i
            ? ((o = Rl(n, l)), o != null && r.unshift(Hl(n, o, s)))
            : i || ((o = Rl(n, l)), o != null && r.push(Hl(n, o, s)))),
          (n = n.return));
      }
      r.length !== 0 && e.push({ event: t, listeners: r });
    }
    var xb = /\r\n?/g,
      Mb = /\u0000|\uFFFD/g;
    function Zd(e) {
      return (typeof e == "string" ? e : "" + e)
        .replace(
          xb,
          `
`,
        )
        .replace(Mb, "");
    }
    function Gp(e, t) {
      return ((t = Zd(t)), Zd(e) === t);
    }
    function st(e, t, n, a, i, l) {
      switch (n) {
        case "children":
          typeof a == "string"
            ? t === "body" || (t === "textarea" && a === "") || wi(e, a)
            : (typeof a == "number" || typeof a == "bigint") &&
              t !== "body" &&
              wi(e, "" + a);
          break;
        case "className":
          Lr(e, "class", a);
          break;
        case "tabIndex":
          Lr(e, "tabindex", a);
          break;
        case "dir":
        case "role":
        case "viewBox":
        case "width":
        case "height":
          Lr(e, n, a);
          break;
        case "style":
          Um(e, a, l);
          break;
        case "data":
          if (t !== "object") {
            Lr(e, "data", a);
            break;
          }
        case "src":
        case "href":
          if (a === "" && (t !== "a" || n !== "href")) {
            e.removeAttribute(n);
            break;
          }
          if (
            a == null ||
            typeof a == "function" ||
            typeof a == "symbol" ||
            typeof a == "boolean"
          ) {
            e.removeAttribute(n);
            break;
          }
          ((a = Kr("" + a)), e.setAttribute(n, a));
          break;
        case "action":
        case "formAction":
          if (typeof a == "function") {
            e.setAttribute(
              n,
              "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')",
            );
            break;
          } else
            typeof l == "function" &&
              (n === "formAction"
                ? (t !== "input" && st(e, t, "name", i.name, i, null),
                  st(e, t, "formEncType", i.formEncType, i, null),
                  st(e, t, "formMethod", i.formMethod, i, null),
                  st(e, t, "formTarget", i.formTarget, i, null))
                : (st(e, t, "encType", i.encType, i, null),
                  st(e, t, "method", i.method, i, null),
                  st(e, t, "target", i.target, i, null)));
          if (a == null || typeof a == "symbol" || typeof a == "boolean") {
            e.removeAttribute(n);
            break;
          }
          ((a = Kr("" + a)), e.setAttribute(n, a));
          break;
        case "onClick":
          a != null && (e.onclick = xn);
          break;
        case "onScroll":
          a != null && W("scroll", e);
          break;
        case "onScrollEnd":
          a != null && W("scrollend", e);
          break;
        case "dangerouslySetInnerHTML":
          if (a != null) {
            if (typeof a != "object" || !("__html" in a)) throw Error(v(61));
            if (((n = a.__html), n != null)) {
              if (i.children != null) throw Error(v(60));
              e.innerHTML = n;
            }
          }
          break;
        case "multiple":
          e.multiple = a && typeof a != "function" && typeof a != "symbol";
          break;
        case "muted":
          e.muted = a && typeof a != "function" && typeof a != "symbol";
          break;
        case "suppressContentEditableWarning":
        case "suppressHydrationWarning":
        case "defaultValue":
        case "defaultChecked":
        case "innerHTML":
        case "ref":
          break;
        case "autoFocus":
          break;
        case "xlinkHref":
          if (
            a == null ||
            typeof a == "function" ||
            typeof a == "boolean" ||
            typeof a == "symbol"
          ) {
            e.removeAttribute("xlink:href");
            break;
          }
          ((n = Kr("" + a)),
            e.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", n));
          break;
        case "contentEditable":
        case "spellCheck":
        case "draggable":
        case "value":
        case "autoReverse":
        case "externalResourcesRequired":
        case "focusable":
        case "preserveAlpha":
          a != null && typeof a != "function" && typeof a != "symbol"
            ? e.setAttribute(n, "" + a)
            : e.removeAttribute(n);
          break;
        case "inert":
        case "allowFullScreen":
        case "async":
        case "autoPlay":
        case "controls":
        case "default":
        case "defer":
        case "disabled":
        case "disablePictureInPicture":
        case "disableRemotePlayback":
        case "formNoValidate":
        case "hidden":
        case "loop":
        case "noModule":
        case "noValidate":
        case "open":
        case "playsInline":
        case "readOnly":
        case "required":
        case "reversed":
        case "scoped":
        case "seamless":
        case "itemScope":
          a && typeof a != "function" && typeof a != "symbol"
            ? e.setAttribute(n, "")
            : e.removeAttribute(n);
          break;
        case "capture":
        case "download":
          a === !0
            ? e.setAttribute(n, "")
            : a !== !1 &&
                a != null &&
                typeof a != "function" &&
                typeof a != "symbol"
              ? e.setAttribute(n, a)
              : e.removeAttribute(n);
          break;
        case "cols":
        case "rows":
        case "size":
        case "span":
          a != null &&
          typeof a != "function" &&
          typeof a != "symbol" &&
          !isNaN(a) &&
          1 <= a
            ? e.setAttribute(n, a)
            : e.removeAttribute(n);
          break;
        case "rowSpan":
        case "start":
          a == null ||
          typeof a == "function" ||
          typeof a == "symbol" ||
          isNaN(a)
            ? e.removeAttribute(n)
            : e.setAttribute(n, a);
          break;
        case "popover":
          (W("beforetoggle", e), W("toggle", e), Zr(e, "popover", a));
          break;
        case "xlinkActuate":
          Cn(e, "http://www.w3.org/1999/xlink", "xlink:actuate", a);
          break;
        case "xlinkArcrole":
          Cn(e, "http://www.w3.org/1999/xlink", "xlink:arcrole", a);
          break;
        case "xlinkRole":
          Cn(e, "http://www.w3.org/1999/xlink", "xlink:role", a);
          break;
        case "xlinkShow":
          Cn(e, "http://www.w3.org/1999/xlink", "xlink:show", a);
          break;
        case "xlinkTitle":
          Cn(e, "http://www.w3.org/1999/xlink", "xlink:title", a);
          break;
        case "xlinkType":
          Cn(e, "http://www.w3.org/1999/xlink", "xlink:type", a);
          break;
        case "xmlBase":
          Cn(e, "http://www.w3.org/XML/1998/namespace", "xml:base", a);
          break;
        case "xmlLang":
          Cn(e, "http://www.w3.org/XML/1998/namespace", "xml:lang", a);
          break;
        case "xmlSpace":
          Cn(e, "http://www.w3.org/XML/1998/namespace", "xml:space", a);
          break;
        case "is":
          Zr(e, "is", a);
          break;
        case "innerText":
        case "textContent":
          break;
        default:
          (!(2 < n.length) ||
            (n[0] !== "o" && n[0] !== "O") ||
            (n[1] !== "n" && n[1] !== "N")) &&
            ((n = r0.get(n) || n), Zr(e, n, a));
      }
    }
    function uc(e, t, n, a, i, l) {
      switch (n) {
        case "style":
          Um(e, a, l);
          break;
        case "dangerouslySetInnerHTML":
          if (a != null) {
            if (typeof a != "object" || !("__html" in a)) throw Error(v(61));
            if (((n = a.__html), n != null)) {
              if (i.children != null) throw Error(v(60));
              e.innerHTML = n;
            }
          }
          break;
        case "children":
          typeof a == "string"
            ? wi(e, a)
            : (typeof a == "number" || typeof a == "bigint") && wi(e, "" + a);
          break;
        case "onScroll":
          a != null && W("scroll", e);
          break;
        case "onScrollEnd":
          a != null && W("scrollend", e);
          break;
        case "onClick":
          a != null && (e.onclick = xn);
          break;
        case "suppressContentEditableWarning":
        case "suppressHydrationWarning":
        case "innerHTML":
        case "ref":
          break;
        case "innerText":
        case "textContent":
          break;
        default:
          if (!Dm.hasOwnProperty(n))
            t: {
              if (
                n[0] === "o" &&
                n[1] === "n" &&
                ((i = n.endsWith("Capture")),
                (t = n.slice(2, i ? n.length - 7 : void 0)),
                (l = e[Ce] || null),
                (l = l != null ? l[n] : null),
                typeof l == "function" && e.removeEventListener(t, l, i),
                typeof a == "function")
              ) {
                (typeof l != "function" &&
                  l !== null &&
                  (n in e
                    ? (e[n] = null)
                    : e.hasAttribute(n) && e.removeAttribute(n)),
                  e.addEventListener(t, a, i));
                break t;
              }
              n in e
                ? (e[n] = a)
                : a === !0
                  ? e.setAttribute(n, "")
                  : Zr(e, n, a);
            }
      }
    }
    function $t(e, t, n) {
      switch (t) {
        case "div":
        case "span":
        case "svg":
        case "path":
        case "a":
        case "g":
        case "p":
        case "li":
          break;
        case "img":
          (W("error", e), W("load", e));
          var a = !1,
            i = !1,
            l;
          for (l in n)
            if (n.hasOwnProperty(l)) {
              var r = n[l];
              if (r != null)
                switch (l) {
                  case "src":
                    a = !0;
                    break;
                  case "srcSet":
                    i = !0;
                    break;
                  case "children":
                  case "dangerouslySetInnerHTML":
                    throw Error(v(137, t));
                  default:
                    st(e, t, l, r, n, null);
                }
            }
          (i && st(e, t, "srcSet", n.srcSet, n, null),
            a && st(e, t, "src", n.src, n, null));
          return;
        case "input":
          W("invalid", e);
          var u = (l = r = i = null),
            s = null,
            o = null;
          for (a in n)
            if (n.hasOwnProperty(a)) {
              var c = n[a];
              if (c != null)
                switch (a) {
                  case "name":
                    i = c;
                    break;
                  case "type":
                    r = c;
                    break;
                  case "checked":
                    s = c;
                    break;
                  case "defaultChecked":
                    o = c;
                    break;
                  case "value":
                    l = c;
                    break;
                  case "defaultValue":
                    u = c;
                    break;
                  case "children":
                  case "dangerouslySetInnerHTML":
                    if (c != null) throw Error(v(137, t));
                    break;
                  default:
                    st(e, t, a, c, n, null);
                }
            }
          Vm(e, l, u, s, o, r, i, !1);
          return;
        case "select":
          (W("invalid", e), (a = r = l = null));
          for (i in n)
            if (n.hasOwnProperty(i) && ((u = n[i]), u != null))
              switch (i) {
                case "value":
                  l = u;
                  break;
                case "defaultValue":
                  r = u;
                  break;
                case "multiple":
                  a = u;
                default:
                  st(e, t, i, u, n, null);
              }
          ((t = l),
            (n = r),
            (e.multiple = !!a),
            t != null ? bi(e, !!a, t, !1) : n != null && bi(e, !!a, n, !0));
          return;
        case "textarea":
          (W("invalid", e), (l = i = a = null));
          for (r in n)
            if (n.hasOwnProperty(r) && ((u = n[r]), u != null))
              switch (r) {
                case "value":
                  a = u;
                  break;
                case "defaultValue":
                  i = u;
                  break;
                case "children":
                  l = u;
                  break;
                case "dangerouslySetInnerHTML":
                  if (u != null) throw Error(v(91));
                  break;
                default:
                  st(e, t, r, u, n, null);
              }
          Lm(e, a, i, l);
          return;
        case "option":
          for (s in n)
            if (n.hasOwnProperty(s) && ((a = n[s]), a != null))
              switch (s) {
                case "selected":
                  e.selected =
                    a && typeof a != "function" && typeof a != "symbol";
                  break;
                default:
                  st(e, t, s, a, n, null);
              }
          return;
        case "dialog":
          (W("beforetoggle", e), W("toggle", e), W("cancel", e), W("close", e));
          break;
        case "iframe":
        case "object":
          W("load", e);
          break;
        case "video":
        case "audio":
          for (a = 0; a < Gl.length; a++) W(Gl[a], e);
          break;
        case "image":
          (W("error", e), W("load", e));
          break;
        case "details":
          W("toggle", e);
          break;
        case "embed":
        case "source":
        case "link":
          (W("error", e), W("load", e));
        case "area":
        case "base":
        case "br":
        case "col":
        case "hr":
        case "keygen":
        case "meta":
        case "param":
        case "track":
        case "wbr":
        case "menuitem":
          for (o in n)
            if (n.hasOwnProperty(o) && ((a = n[o]), a != null))
              switch (o) {
                case "children":
                case "dangerouslySetInnerHTML":
                  throw Error(v(137, t));
                default:
                  st(e, t, o, a, n, null);
              }
          return;
        default:
          if (Ec(t)) {
            for (c in n)
              n.hasOwnProperty(c) &&
                ((a = n[c]), a !== void 0 && uc(e, t, c, a, n, void 0));
            return;
          }
      }
      for (u in n)
        n.hasOwnProperty(u) &&
          ((a = n[u]), a != null && st(e, t, u, a, n, null));
    }
    function Db(e, t, n, a) {
      switch (t) {
        case "div":
        case "span":
        case "svg":
        case "path":
        case "a":
        case "g":
        case "p":
        case "li":
          break;
        case "input":
          var i = null,
            l = null,
            r = null,
            u = null,
            s = null,
            o = null,
            c = null;
          for (p in n) {
            var h = n[p];
            if (n.hasOwnProperty(p) && h != null)
              switch (p) {
                case "checked":
                  break;
                case "value":
                  break;
                case "defaultValue":
                  s = h;
                default:
                  a.hasOwnProperty(p) || st(e, t, p, null, a, h);
              }
          }
          for (var f in a) {
            var p = a[f];
            if (((h = n[f]), a.hasOwnProperty(f) && (p != null || h != null)))
              switch (f) {
                case "type":
                  l = p;
                  break;
                case "name":
                  i = p;
                  break;
                case "checked":
                  o = p;
                  break;
                case "defaultChecked":
                  c = p;
                  break;
                case "value":
                  r = p;
                  break;
                case "defaultValue":
                  u = p;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  if (p != null) throw Error(v(137, t));
                  break;
                default:
                  p !== h && st(e, t, f, p, a, h);
              }
          }
          Ro(e, r, u, s, o, c, l, i);
          return;
        case "select":
          p = r = u = f = null;
          for (l in n)
            if (((s = n[l]), n.hasOwnProperty(l) && s != null))
              switch (l) {
                case "value":
                  break;
                case "multiple":
                  p = s;
                default:
                  a.hasOwnProperty(l) || st(e, t, l, null, a, s);
              }
          for (i in a)
            if (
              ((l = a[i]),
              (s = n[i]),
              a.hasOwnProperty(i) && (l != null || s != null))
            )
              switch (i) {
                case "value":
                  f = l;
                  break;
                case "defaultValue":
                  u = l;
                  break;
                case "multiple":
                  r = l;
                default:
                  l !== s && st(e, t, i, l, a, s);
              }
          ((t = u),
            (n = r),
            (a = p),
            f != null
              ? bi(e, !!n, f, !1)
              : !!a != !!n &&
                (t != null ? bi(e, !!n, t, !0) : bi(e, !!n, n ? [] : "", !1)));
          return;
        case "textarea":
          p = f = null;
          for (u in n)
            if (
              ((i = n[u]),
              n.hasOwnProperty(u) && i != null && !a.hasOwnProperty(u))
            )
              switch (u) {
                case "value":
                  break;
                case "children":
                  break;
                default:
                  st(e, t, u, null, a, i);
              }
          for (r in a)
            if (
              ((i = a[r]),
              (l = n[r]),
              a.hasOwnProperty(r) && (i != null || l != null))
            )
              switch (r) {
                case "value":
                  f = i;
                  break;
                case "defaultValue":
                  p = i;
                  break;
                case "children":
                  break;
                case "dangerouslySetInnerHTML":
                  if (i != null) throw Error(v(91));
                  break;
                default:
                  i !== l && st(e, t, r, i, a, l);
              }
          km(e, f, p);
          return;
        case "option":
          for (var S in n)
            if (
              ((f = n[S]),
              n.hasOwnProperty(S) && f != null && !a.hasOwnProperty(S))
            )
              switch (S) {
                case "selected":
                  e.selected = !1;
                  break;
                default:
                  st(e, t, S, null, a, f);
              }
          for (s in a)
            if (
              ((f = a[s]),
              (p = n[s]),
              a.hasOwnProperty(s) && f !== p && (f != null || p != null))
            )
              switch (s) {
                case "selected":
                  e.selected =
                    f && typeof f != "function" && typeof f != "symbol";
                  break;
                default:
                  st(e, t, s, f, a, p);
              }
          return;
        case "img":
        case "link":
        case "area":
        case "base":
        case "br":
        case "col":
        case "embed":
        case "hr":
        case "keygen":
        case "meta":
        case "param":
        case "source":
        case "track":
        case "wbr":
        case "menuitem":
          for (var T in n)
            ((f = n[T]),
              n.hasOwnProperty(T) &&
                f != null &&
                !a.hasOwnProperty(T) &&
                st(e, t, T, null, a, f));
          for (o in a)
            if (
              ((f = a[o]),
              (p = n[o]),
              a.hasOwnProperty(o) && f !== p && (f != null || p != null))
            )
              switch (o) {
                case "children":
                case "dangerouslySetInnerHTML":
                  if (f != null) throw Error(v(137, t));
                  break;
                default:
                  st(e, t, o, f, a, p);
              }
          return;
        default:
          if (Ec(t)) {
            for (var x in n)
              ((f = n[x]),
                n.hasOwnProperty(x) &&
                  f !== void 0 &&
                  !a.hasOwnProperty(x) &&
                  uc(e, t, x, void 0, a, f));
            for (c in a)
              ((f = a[c]),
                (p = n[c]),
                !a.hasOwnProperty(c) ||
                  f === p ||
                  (f === void 0 && p === void 0) ||
                  uc(e, t, c, f, a, p));
            return;
          }
      }
      for (var g in n)
        ((f = n[g]),
          n.hasOwnProperty(g) &&
            f != null &&
            !a.hasOwnProperty(g) &&
            st(e, t, g, null, a, f));
      for (h in a)
        ((f = a[h]),
          (p = n[h]),
          !a.hasOwnProperty(h) ||
            f === p ||
            (f == null && p == null) ||
            st(e, t, h, f, a, p));
    }
    function Kd(e) {
      switch (e) {
        case "css":
        case "script":
        case "font":
        case "img":
        case "image":
        case "input":
        case "link":
          return !0;
        default:
          return !1;
      }
    }
    function Rb() {
      if (typeof performance.getEntriesByType == "function") {
        for (
          var e = 0, t = 0, n = performance.getEntriesByType("resource"), a = 0;
          a < n.length;
          a++
        ) {
          var i = n[a],
            l = i.transferSize,
            r = i.initiatorType,
            u = i.duration;
          if (l && u && Kd(r)) {
            for (r = 0, u = i.responseEnd, a += 1; a < n.length; a++) {
              var s = n[a],
                o = s.startTime;
              if (o > u) break;
              var c = s.transferSize,
                h = s.initiatorType;
              c &&
                Kd(h) &&
                ((s = s.responseEnd),
                (r += c * (s < u ? 1 : (u - o) / (s - o))));
            }
            if ((--a, (t += (8 * (l + r)) / (i.duration / 1e3)), e++, 10 < e))
              break;
          }
        }
        if (0 < e) return t / e / 1e6;
      }
      return navigator.connection &&
        ((e = navigator.connection.downlink), typeof e == "number")
        ? e
        : 5;
    }
    var sc = null,
      oc = null;
    function Vu(e) {
      return e.nodeType === 9 ? e : e.ownerDocument;
    }
    function Jd(e) {
      switch (e) {
        case "http://www.w3.org/2000/svg":
          return 1;
        case "http://www.w3.org/1998/Math/MathML":
          return 2;
        default:
          return 0;
      }
    }
    function Hp(e, t) {
      if (e === 0)
        switch (t) {
          case "svg":
            return 1;
          case "math":
            return 2;
          default:
            return 0;
        }
      return e === 1 && t === "foreignObject" ? 0 : e;
    }
    function cc(e, t) {
      return (
        e === "textarea" ||
        e === "noscript" ||
        typeof t.children == "string" ||
        typeof t.children == "number" ||
        typeof t.children == "bigint" ||
        (typeof t.dangerouslySetInnerHTML == "object" &&
          t.dangerouslySetInnerHTML !== null &&
          t.dangerouslySetInnerHTML.__html != null)
      );
    }
    var bo = null;
    function zb() {
      var e = window.event;
      return e && e.type === "popstate"
        ? e === bo
          ? !1
          : ((bo = e), !0)
        : ((bo = null), !1);
    }
    var Wp = typeof setTimeout == "function" ? setTimeout : void 0,
      Vb = typeof clearTimeout == "function" ? clearTimeout : void 0,
      $d = typeof Promise == "function" ? Promise : void 0,
      kb =
        typeof queueMicrotask == "function"
          ? queueMicrotask
          : typeof $d != "undefined"
            ? function (e) {
                return $d.resolve(null).then(e).catch(Lb);
              }
            : Wp;
    function Lb(e) {
      setTimeout(function () {
        throw e;
      });
    }
    function ya(e) {
      return e === "head";
    }
    function tm(e, t) {
      var n = t,
        a = 0;
      do {
        var i = n.nextSibling;
        if ((e.removeChild(n), i && i.nodeType === 8))
          if (((n = i.data), n === "/$" || n === "/&")) {
            if (a === 0) {
              (e.removeChild(i), Li(t));
              return;
            }
            a--;
          } else if (
            n === "$" ||
            n === "$?" ||
            n === "$~" ||
            n === "$!" ||
            n === "&"
          )
            a++;
          else if (n === "html") Ml(e.ownerDocument.documentElement);
          else if (n === "head") {
            ((n = e.ownerDocument.head), Ml(n));
            for (var l = n.firstChild; l;) {
              var r = l.nextSibling,
                u = l.nodeName;
              (l[Ql] ||
                u === "SCRIPT" ||
                u === "STYLE" ||
                (u === "LINK" && l.rel.toLowerCase() === "stylesheet") ||
                n.removeChild(l),
                (l = r));
            }
          } else n === "body" && Ml(e.ownerDocument.body);
        n = i;
      } while (n);
      Li(t);
    }
    function em(e, t) {
      var n = e;
      e = 0;
      do {
        var a = n.nextSibling;
        if (
          (n.nodeType === 1
            ? t
              ? ((n._stashedDisplay = n.style.display),
                (n.style.display = "none"))
              : ((n.style.display = n._stashedDisplay || ""),
                n.getAttribute("style") === "" && n.removeAttribute("style"))
            : n.nodeType === 3 &&
              (t
                ? ((n._stashedText = n.nodeValue), (n.nodeValue = ""))
                : (n.nodeValue = n._stashedText || "")),
          a && a.nodeType === 8)
        )
          if (((n = a.data), n === "/$")) {
            if (e === 0) break;
            e--;
          } else (n !== "$" && n !== "$?" && n !== "$~" && n !== "$!") || e++;
        n = a;
      } while (n);
    }
    function fc(e) {
      var t = e.firstChild;
      for (t && t.nodeType === 10 && (t = t.nextSibling); t;) {
        var n = t;
        switch (((t = t.nextSibling), n.nodeName)) {
          case "HTML":
          case "HEAD":
          case "BODY":
            (fc(n), Tc(n));
            continue;
          case "SCRIPT":
          case "STYLE":
            continue;
          case "LINK":
            if (n.rel.toLowerCase() === "stylesheet") continue;
        }
        e.removeChild(n);
      }
    }
    function Ub(e, t, n, a) {
      for (; e.nodeType === 1;) {
        var i = n;
        if (e.nodeName.toLowerCase() !== t.toLowerCase()) {
          if (!a && (e.nodeName !== "INPUT" || e.type !== "hidden")) break;
        } else if (a) {
          if (!e[Ql])
            switch (t) {
              case "meta":
                if (!e.hasAttribute("itemprop")) break;
                return e;
              case "link":
                if (
                  ((l = e.getAttribute("rel")),
                  l === "stylesheet" && e.hasAttribute("data-precedence"))
                )
                  break;
                if (
                  l !== i.rel ||
                  e.getAttribute("href") !==
                    (i.href == null || i.href === "" ? null : i.href) ||
                  e.getAttribute("crossorigin") !==
                    (i.crossOrigin == null ? null : i.crossOrigin) ||
                  e.getAttribute("title") !== (i.title == null ? null : i.title)
                )
                  break;
                return e;
              case "style":
                if (e.hasAttribute("data-precedence")) break;
                return e;
              case "script":
                if (
                  ((l = e.getAttribute("src")),
                  (l !== (i.src == null ? null : i.src) ||
                    e.getAttribute("type") !==
                      (i.type == null ? null : i.type) ||
                    e.getAttribute("crossorigin") !==
                      (i.crossOrigin == null ? null : i.crossOrigin)) &&
                    l &&
                    e.hasAttribute("async") &&
                    !e.hasAttribute("itemprop"))
                )
                  break;
                return e;
              default:
                return e;
            }
        } else if (t === "input" && e.type === "hidden") {
          var l = i.name == null ? null : "" + i.name;
          if (i.type === "hidden" && e.getAttribute("name") === l) return e;
        } else return e;
        if (((e = Qe(e.nextSibling)), e === null)) break;
      }
      return null;
    }
    function Bb(e, t, n) {
      if (t === "") return null;
      for (; e.nodeType !== 3;)
        if (
          ((e.nodeType !== 1 ||
            e.nodeName !== "INPUT" ||
            e.type !== "hidden") &&
            !n) ||
          ((e = Qe(e.nextSibling)), e === null)
        )
          return null;
      return e;
    }
    function Fp(e, t) {
      for (; e.nodeType !== 8;)
        if (
          ((e.nodeType !== 1 ||
            e.nodeName !== "INPUT" ||
            e.type !== "hidden") &&
            !t) ||
          ((e = Qe(e.nextSibling)), e === null)
        )
          return null;
      return e;
    }
    function hc(e) {
      return e.data === "$?" || e.data === "$~";
    }
    function dc(e) {
      return (
        e.data === "$!" ||
        (e.data === "$?" && e.ownerDocument.readyState !== "loading")
      );
    }
    function jb(e, t) {
      var n = e.ownerDocument;
      if (e.data === "$~") e._reactRetry = t;
      else if (e.data !== "$?" || n.readyState !== "loading") t();
      else {
        var a = function () {
          (t(), n.removeEventListener("DOMContentLoaded", a));
        };
        (n.addEventListener("DOMContentLoaded", a), (e._reactRetry = a));
      }
    }
    function Qe(e) {
      for (; e != null; e = e.nextSibling) {
        var t = e.nodeType;
        if (t === 1 || t === 3) break;
        if (t === 8) {
          if (
            ((t = e.data),
            t === "$" ||
              t === "$!" ||
              t === "$?" ||
              t === "$~" ||
              t === "&" ||
              t === "F!" ||
              t === "F")
          )
            break;
          if (t === "/$" || t === "/&") return null;
        }
      }
      return e;
    }
    var mc = null;
    function nm(e) {
      e = e.nextSibling;
      for (var t = 0; e;) {
        if (e.nodeType === 8) {
          var n = e.data;
          if (n === "/$" || n === "/&") {
            if (t === 0) return Qe(e.nextSibling);
            t--;
          } else
            (n !== "$" &&
              n !== "$!" &&
              n !== "$?" &&
              n !== "$~" &&
              n !== "&") ||
              t++;
        }
        e = e.nextSibling;
      }
      return null;
    }
    function am(e) {
      e = e.previousSibling;
      for (var t = 0; e;) {
        if (e.nodeType === 8) {
          var n = e.data;
          if (
            n === "$" ||
            n === "$!" ||
            n === "$?" ||
            n === "$~" ||
            n === "&"
          ) {
            if (t === 0) return e;
            t--;
          } else (n !== "/$" && n !== "/&") || t++;
        }
        e = e.previousSibling;
      }
      return null;
    }
    function qp(e, t, n) {
      switch (((t = Vu(n)), e)) {
        case "html":
          if (((e = t.documentElement), !e)) throw Error(v(452));
          return e;
        case "head":
          if (((e = t.head), !e)) throw Error(v(453));
          return e;
        case "body":
          if (((e = t.body), !e)) throw Error(v(454));
          return e;
        default:
          throw Error(v(451));
      }
    }
    function Ml(e) {
      for (var t = e.attributes; t.length;) e.removeAttributeNode(t[0]);
      Tc(e);
    }
    var Ze = new Map(),
      im = new Set();
    function ku(e) {
      return typeof e.getRootNode == "function"
        ? e.getRootNode()
        : e.nodeType === 9
          ? e
          : e.ownerDocument;
    }
    var jn = nt.d;
    nt.d = { f: Gb, r: Hb, D: Wb, C: Fb, L: qb, m: Yb, X: Xb, S: Pb, M: Ib };
    function Gb() {
      var e = jn.f(),
        t = Ju();
      return e || t;
    }
    function Hb(e) {
      var t = Bi(e);
      t !== null && t.tag === 5 && t.type === "form" ? Ug(t) : jn.r(e);
    }
    var Wi = typeof document == "undefined" ? null : document;
    function Yp(e, t, n) {
      var a = Wi;
      if (a && typeof t == "string" && t) {
        var i = Ye(t);
        ((i = 'link[rel="' + e + '"][href="' + i + '"]'),
          typeof n == "string" && (i += '[crossorigin="' + n + '"]'),
          im.has(i) ||
            (im.add(i),
            (e = { rel: e, crossOrigin: n, href: t }),
            a.querySelector(i) === null &&
              ((t = a.createElement("link")),
              $t(t, "link", e),
              Yt(t),
              a.head.appendChild(t))));
      }
    }
    function Wb(e) {
      (jn.D(e), Yp("dns-prefetch", e, null));
    }
    function Fb(e, t) {
      (jn.C(e, t), Yp("preconnect", e, t));
    }
    function qb(e, t, n) {
      jn.L(e, t, n);
      var a = Wi;
      if (a && e && t) {
        var i = 'link[rel="preload"][as="' + Ye(t) + '"]';
        t === "image" && n && n.imageSrcSet
          ? ((i += '[imagesrcset="' + Ye(n.imageSrcSet) + '"]'),
            typeof n.imageSizes == "string" &&
              (i += '[imagesizes="' + Ye(n.imageSizes) + '"]'))
          : (i += '[href="' + Ye(e) + '"]');
        var l = i;
        switch (t) {
          case "style":
            l = ki(e);
            break;
          case "script":
            l = Fi(e);
        }
        Ze.has(l) ||
          ((e = vt(
            {
              rel: "preload",
              href: t === "image" && n && n.imageSrcSet ? void 0 : e,
              as: t,
            },
            n,
          )),
          Ze.set(l, e),
          a.querySelector(i) !== null ||
            (t === "style" && a.querySelector(er(l))) ||
            (t === "script" && a.querySelector(nr(l))) ||
            ((t = a.createElement("link")),
            $t(t, "link", e),
            Yt(t),
            a.head.appendChild(t)));
      }
    }
    function Yb(e, t) {
      jn.m(e, t);
      var n = Wi;
      if (n && e) {
        var a = t && typeof t.as == "string" ? t.as : "script",
          i =
            'link[rel="modulepreload"][as="' +
            Ye(a) +
            '"][href="' +
            Ye(e) +
            '"]',
          l = i;
        switch (a) {
          case "audioworklet":
          case "paintworklet":
          case "serviceworker":
          case "sharedworker":
          case "worker":
          case "script":
            l = Fi(e);
        }
        if (
          !Ze.has(l) &&
          ((e = vt({ rel: "modulepreload", href: e }, t)),
          Ze.set(l, e),
          n.querySelector(i) === null)
        ) {
          switch (a) {
            case "audioworklet":
            case "paintworklet":
            case "serviceworker":
            case "sharedworker":
            case "worker":
            case "script":
              if (n.querySelector(nr(l))) return;
          }
          ((a = n.createElement("link")),
            $t(a, "link", e),
            Yt(a),
            n.head.appendChild(a));
        }
      }
    }
    function Pb(e, t, n) {
      jn.S(e, t, n);
      var a = Wi;
      if (a && e) {
        var i = Si(a).hoistableStyles,
          l = ki(e);
        t = t || "default";
        var r = i.get(l);
        if (!r) {
          var u = { loading: 0, preload: null };
          if ((r = a.querySelector(er(l)))) u.loading = 5;
          else {
            ((e = vt({ rel: "stylesheet", href: e, "data-precedence": t }, n)),
              (n = Ze.get(l)) && sf(e, n));
            var s = (r = a.createElement("link"));
            (Yt(s),
              $t(s, "link", e),
              (s._p = new Promise(function (o, c) {
                ((s.onload = o), (s.onerror = c));
              })),
              s.addEventListener("load", function () {
                u.loading |= 1;
              }),
              s.addEventListener("error", function () {
                u.loading |= 2;
              }),
              (u.loading |= 4),
              uu(r, t, a));
          }
          ((r = { type: "stylesheet", instance: r, count: 1, state: u }),
            i.set(l, r));
        }
      }
    }
    function Xb(e, t) {
      jn.X(e, t);
      var n = Wi;
      if (n && e) {
        var a = Si(n).hoistableScripts,
          i = Fi(e),
          l = a.get(i);
        l ||
          ((l = n.querySelector(nr(i))),
          l ||
            ((e = vt({ src: e, async: !0 }, t)),
            (t = Ze.get(i)) && of(e, t),
            (l = n.createElement("script")),
            Yt(l),
            $t(l, "link", e),
            n.head.appendChild(l)),
          (l = { type: "script", instance: l, count: 1, state: null }),
          a.set(i, l));
      }
    }
    function Ib(e, t) {
      jn.M(e, t);
      var n = Wi;
      if (n && e) {
        var a = Si(n).hoistableScripts,
          i = Fi(e),
          l = a.get(i);
        l ||
          ((l = n.querySelector(nr(i))),
          l ||
            ((e = vt({ src: e, async: !0, type: "module" }, t)),
            (t = Ze.get(i)) && of(e, t),
            (l = n.createElement("script")),
            Yt(l),
            $t(l, "link", e),
            n.head.appendChild(l)),
          (l = { type: "script", instance: l, count: 1, state: null }),
          a.set(i, l));
      }
    }
    function lm(e, t, n, a) {
      var i = (i = aa.current) ? ku(i) : null;
      if (!i) throw Error(v(446));
      switch (e) {
        case "meta":
        case "title":
          return null;
        case "style":
          return typeof n.precedence == "string" && typeof n.href == "string"
            ? ((t = ki(n.href)),
              (n = Si(i).hoistableStyles),
              (a = n.get(t)),
              a ||
                ((a = { type: "style", instance: null, count: 0, state: null }),
                n.set(t, a)),
              a)
            : { type: "void", instance: null, count: 0, state: null };
        case "link":
          if (
            n.rel === "stylesheet" &&
            typeof n.href == "string" &&
            typeof n.precedence == "string"
          ) {
            e = ki(n.href);
            var l = Si(i).hoistableStyles,
              r = l.get(e);
            if (
              (r ||
                ((i = i.ownerDocument || i),
                (r = {
                  type: "stylesheet",
                  instance: null,
                  count: 0,
                  state: { loading: 0, preload: null },
                }),
                l.set(e, r),
                (l = i.querySelector(er(e))) &&
                  !l._p &&
                  ((r.instance = l), (r.state.loading = 5)),
                Ze.has(e) ||
                  ((n = {
                    rel: "preload",
                    as: "style",
                    href: n.href,
                    crossOrigin: n.crossOrigin,
                    integrity: n.integrity,
                    media: n.media,
                    hrefLang: n.hrefLang,
                    referrerPolicy: n.referrerPolicy,
                  }),
                  Ze.set(e, n),
                  l || Qb(i, e, n, r.state))),
              t && a === null)
            )
              throw Error(v(528, ""));
            return r;
          }
          if (t && a !== null) throw Error(v(529, ""));
          return null;
        case "script":
          return (
            (t = n.async),
            (n = n.src),
            typeof n == "string" &&
            t &&
            typeof t != "function" &&
            typeof t != "symbol"
              ? ((t = Fi(n)),
                (n = Si(i).hoistableScripts),
                (a = n.get(t)),
                a ||
                  ((a = {
                    type: "script",
                    instance: null,
                    count: 0,
                    state: null,
                  }),
                  n.set(t, a)),
                a)
              : { type: "void", instance: null, count: 0, state: null }
          );
        default:
          throw Error(v(444, e));
      }
    }
    function ki(e) {
      return 'href="' + Ye(e) + '"';
    }
    function er(e) {
      return 'link[rel="stylesheet"][' + e + "]";
    }
    function Pp(e) {
      return vt({}, e, { "data-precedence": e.precedence, precedence: null });
    }
    function Qb(e, t, n, a) {
      e.querySelector('link[rel="preload"][as="style"][' + t + "]")
        ? (a.loading = 1)
        : ((t = e.createElement("link")),
          (a.preload = t),
          t.addEventListener("load", function () {
            return (a.loading |= 1);
          }),
          t.addEventListener("error", function () {
            return (a.loading |= 2);
          }),
          $t(t, "link", n),
          Yt(t),
          e.head.appendChild(t));
    }
    function Fi(e) {
      return '[src="' + Ye(e) + '"]';
    }
    function nr(e) {
      return "script[async]" + e;
    }
    function rm(e, t, n) {
      if ((t.count++, t.instance === null))
        switch (t.type) {
          case "style":
            var a = e.querySelector('style[data-href~="' + Ye(n.href) + '"]');
            if (a) return ((t.instance = a), Yt(a), a);
            var i = vt({}, n, {
              "data-href": n.href,
              "data-precedence": n.precedence,
              href: null,
              precedence: null,
            });
            return (
              (a = (e.ownerDocument || e).createElement("style")),
              Yt(a),
              $t(a, "style", i),
              uu(a, n.precedence, e),
              (t.instance = a)
            );
          case "stylesheet":
            i = ki(n.href);
            var l = e.querySelector(er(i));
            if (l) return ((t.state.loading |= 4), (t.instance = l), Yt(l), l);
            ((a = Pp(n)),
              (i = Ze.get(i)) && sf(a, i),
              (l = (e.ownerDocument || e).createElement("link")),
              Yt(l));
            var r = l;
            return (
              (r._p = new Promise(function (u, s) {
                ((r.onload = u), (r.onerror = s));
              })),
              $t(l, "link", a),
              (t.state.loading |= 4),
              uu(l, n.precedence, e),
              (t.instance = l)
            );
          case "script":
            return (
              (l = Fi(n.src)),
              (i = e.querySelector(nr(l)))
                ? ((t.instance = i), Yt(i), i)
                : ((a = n),
                  (i = Ze.get(l)) && ((a = vt({}, n)), of(a, i)),
                  (e = e.ownerDocument || e),
                  (i = e.createElement("script")),
                  Yt(i),
                  $t(i, "link", a),
                  e.head.appendChild(i),
                  (t.instance = i))
            );
          case "void":
            return null;
          default:
            throw Error(v(443, t.type));
        }
      else
        t.type === "stylesheet" &&
          !(t.state.loading & 4) &&
          ((a = t.instance), (t.state.loading |= 4), uu(a, n.precedence, e));
      return t.instance;
    }
    function uu(e, t, n) {
      for (
        var a = n.querySelectorAll(
            'link[rel="stylesheet"][data-precedence],style[data-precedence]',
          ),
          i = a.length ? a[a.length - 1] : null,
          l = i,
          r = 0;
        r < a.length;
        r++
      ) {
        var u = a[r];
        if (u.dataset.precedence === t) l = u;
        else if (l !== i) break;
      }
      l
        ? l.parentNode.insertBefore(e, l.nextSibling)
        : ((t = n.nodeType === 9 ? n.head : n),
          t.insertBefore(e, t.firstChild));
    }
    function sf(e, t) {
      (e.crossOrigin == null && (e.crossOrigin = t.crossOrigin),
        e.referrerPolicy == null && (e.referrerPolicy = t.referrerPolicy),
        e.title == null && (e.title = t.title));
    }
    function of(e, t) {
      (e.crossOrigin == null && (e.crossOrigin = t.crossOrigin),
        e.referrerPolicy == null && (e.referrerPolicy = t.referrerPolicy),
        e.integrity == null && (e.integrity = t.integrity));
    }
    var su = null;
    function um(e, t, n) {
      if (su === null) {
        var a = new Map(),
          i = (su = new Map());
        i.set(n, a);
      } else ((i = su), (a = i.get(n)), a || ((a = new Map()), i.set(n, a)));
      if (a.has(e)) return a;
      for (
        a.set(e, null), n = n.getElementsByTagName(e), i = 0;
        i < n.length;
        i++
      ) {
        var l = n[i];
        if (
          !(
            l[Ql] ||
            l[Zt] ||
            (e === "link" && l.getAttribute("rel") === "stylesheet")
          ) &&
          l.namespaceURI !== "http://www.w3.org/2000/svg"
        ) {
          var r = l.getAttribute(t) || "";
          r = e + r;
          var u = a.get(r);
          u ? u.push(l) : a.set(r, [l]);
        }
      }
      return a;
    }
    function sm(e, t, n) {
      ((e = e.ownerDocument || e),
        e.head.insertBefore(
          n,
          t === "title" ? e.querySelector("head > title") : null,
        ));
    }
    function Zb(e, t, n) {
      if (n === 1 || t.itemProp != null) return !1;
      switch (e) {
        case "meta":
        case "title":
          return !0;
        case "style":
          if (
            typeof t.precedence != "string" ||
            typeof t.href != "string" ||
            t.href === ""
          )
            break;
          return !0;
        case "link":
          if (
            typeof t.rel != "string" ||
            typeof t.href != "string" ||
            t.href === "" ||
            t.onLoad ||
            t.onError
          )
            break;
          switch (t.rel) {
            case "stylesheet":
              return (
                (e = t.disabled),
                typeof t.precedence == "string" && e == null
              );
            default:
              return !0;
          }
        case "script":
          if (
            t.async &&
            typeof t.async != "function" &&
            typeof t.async != "symbol" &&
            !t.onLoad &&
            !t.onError &&
            t.src &&
            typeof t.src == "string"
          )
            return !0;
      }
      return !1;
    }
    function Xp(e) {
      return !(e.type === "stylesheet" && !(e.state.loading & 3));
    }
    function Kb(e, t, n, a) {
      if (
        n.type === "stylesheet" &&
        (typeof a.media != "string" || matchMedia(a.media).matches !== !1) &&
        !(n.state.loading & 4)
      ) {
        if (n.instance === null) {
          var i = ki(a.href),
            l = t.querySelector(er(i));
          if (l) {
            ((t = l._p),
              t !== null &&
                typeof t == "object" &&
                typeof t.then == "function" &&
                (e.count++, (e = Lu.bind(e)), t.then(e, e)),
              (n.state.loading |= 4),
              (n.instance = l),
              Yt(l));
            return;
          }
          ((l = t.ownerDocument || t),
            (a = Pp(a)),
            (i = Ze.get(i)) && sf(a, i),
            (l = l.createElement("link")),
            Yt(l));
          var r = l;
          ((r._p = new Promise(function (u, s) {
            ((r.onload = u), (r.onerror = s));
          })),
            $t(l, "link", a),
            (n.instance = l));
        }
        (e.stylesheets === null && (e.stylesheets = new Map()),
          e.stylesheets.set(n, t),
          (t = n.state.preload) &&
            !(n.state.loading & 3) &&
            (e.count++,
            (n = Lu.bind(e)),
            t.addEventListener("load", n),
            t.addEventListener("error", n)));
      }
    }
    var Co = 0;
    function Jb(e, t) {
      return (
        e.stylesheets && e.count === 0 && ou(e, e.stylesheets),
        0 < e.count || 0 < e.imgCount
          ? function (n) {
              var a = setTimeout(function () {
                if ((e.stylesheets && ou(e, e.stylesheets), e.unsuspend)) {
                  var l = e.unsuspend;
                  ((e.unsuspend = null), l());
                }
              }, 6e4 + t);
              0 < e.imgBytes && Co === 0 && (Co = 62500 * Rb());
              var i = setTimeout(
                function () {
                  if (
                    ((e.waitingForImages = !1),
                    e.count === 0 &&
                      (e.stylesheets && ou(e, e.stylesheets), e.unsuspend))
                  ) {
                    var l = e.unsuspend;
                    ((e.unsuspend = null), l());
                  }
                },
                (e.imgBytes > Co ? 50 : 800) + t,
              );
              return (
                (e.unsuspend = n),
                function () {
                  ((e.unsuspend = null), clearTimeout(a), clearTimeout(i));
                }
              );
            }
          : null
      );
    }
    function Lu() {
      if (
        (this.count--,
        this.count === 0 && (this.imgCount === 0 || !this.waitingForImages))
      ) {
        if (this.stylesheets) ou(this, this.stylesheets);
        else if (this.unsuspend) {
          var e = this.unsuspend;
          ((this.unsuspend = null), e());
        }
      }
    }
    var Uu = null;
    function ou(e, t) {
      ((e.stylesheets = null),
        e.unsuspend !== null &&
          (e.count++,
          (Uu = new Map()),
          t.forEach($b, e),
          (Uu = null),
          Lu.call(e)));
    }
    function $b(e, t) {
      if (!(t.state.loading & 4)) {
        var n = Uu.get(e);
        if (n) var a = n.get(null);
        else {
          ((n = new Map()), Uu.set(e, n));
          for (
            var i = e.querySelectorAll(
                "link[data-precedence],style[data-precedence]",
              ),
              l = 0;
            l < i.length;
            l++
          ) {
            var r = i[l];
            (r.nodeName === "LINK" || r.getAttribute("media") !== "not all") &&
              (n.set(r.dataset.precedence, r), (a = r));
          }
          a && n.set(null, a);
        }
        ((i = t.instance),
          (r = i.getAttribute("data-precedence")),
          (l = n.get(r) || a),
          l === a && n.set(null, i),
          n.set(r, i),
          this.count++,
          (a = Lu.bind(this)),
          i.addEventListener("load", a),
          i.addEventListener("error", a),
          l
            ? l.parentNode.insertBefore(i, l.nextSibling)
            : ((e = e.nodeType === 9 ? e.head : e),
              e.insertBefore(i, e.firstChild)),
          (t.state.loading |= 4));
      }
    }
    var Wl = {
      $$typeof: wn,
      Provider: null,
      Consumer: null,
      _currentValue: Ma,
      _currentValue2: Ma,
      _threadCount: 0,
    };
    function t1(e, t, n, a, i, l, r, u, s) {
      ((this.tag = 1),
        (this.containerInfo = e),
        (this.pingCache = this.current = this.pendingChildren = null),
        (this.timeoutHandle = -1),
        (this.callbackNode =
          this.next =
          this.pendingContext =
          this.context =
          this.cancelPendingCommit =
            null),
        (this.callbackPriority = 0),
        (this.expirationTimes = Ps(-1)),
        (this.entangledLanes =
          this.shellSuspendCounter =
          this.errorRecoveryDisabledLanes =
          this.expiredLanes =
          this.warmLanes =
          this.pingedLanes =
          this.suspendedLanes =
          this.pendingLanes =
            0),
        (this.entanglements = Ps(0)),
        (this.hiddenUpdates = Ps(null)),
        (this.identifierPrefix = a),
        (this.onUncaughtError = i),
        (this.onCaughtError = l),
        (this.onRecoverableError = r),
        (this.pooledCache = null),
        (this.pooledCacheLanes = 0),
        (this.formState = s),
        (this.incompleteTransitions = new Map()));
    }
    function Ip(e, t, n, a, i, l, r, u, s, o, c, h) {
      return (
        (e = new t1(e, t, n, r, s, o, c, h, u)),
        (t = 1),
        l === !0 && (t |= 24),
        (l = De(3, null, null, t)),
        (e.current = l),
        (l.stateNode = e),
        (t = Vc()),
        t.refCount++,
        (e.pooledCache = t),
        t.refCount++,
        (l.memoizedState = { element: a, isDehydrated: n, cache: t }),
        Uc(l),
        e
      );
    }
    function Qp(e) {
      return e ? ((e = gi), e) : gi;
    }
    function Zp(e, t, n, a, i, l) {
      ((i = Qp(i)),
        a.context === null ? (a.context = i) : (a.pendingContext = i),
        (a = la(t)),
        (a.payload = { element: n }),
        (l = l === void 0 ? null : l),
        l !== null && (a.callback = l),
        (n = ra(e, a, t)),
        n !== null && (be(n, e, t), Tl(n, e, t)));
    }
    function om(e, t) {
      if (((e = e.memoizedState), e !== null && e.dehydrated !== null)) {
        var n = e.retryLane;
        e.retryLane = n !== 0 && n < t ? n : t;
      }
    }
    function cf(e, t) {
      (om(e, t), (e = e.alternate) && om(e, t));
    }
    function Kp(e) {
      if (e.tag === 13 || e.tag === 31) {
        var t = Fa(e, 67108864);
        (t !== null && be(t, e, 67108864), cf(e, 67108864));
      }
    }
    function cm(e) {
      if (e.tag === 13 || e.tag === 31) {
        var t = Le();
        t = bc(t);
        var n = Fa(e, t);
        (n !== null && be(n, e, t), cf(e, t));
      }
    }
    var Bu = !0;
    function e1(e, t, n, a) {
      var i = V.T;
      V.T = null;
      var l = nt.p;
      try {
        ((nt.p = 2), ff(e, t, n, a));
      } finally {
        ((nt.p = l), (V.T = i));
      }
    }
    function n1(e, t, n, a) {
      var i = V.T;
      V.T = null;
      var l = nt.p;
      try {
        ((nt.p = 8), ff(e, t, n, a));
      } finally {
        ((nt.p = l), (V.T = i));
      }
    }
    function ff(e, t, n, a) {
      if (Bu) {
        var i = gc(a);
        if (i === null) (So(e, t, a, ju, n), fm(e, a));
        else if (i1(i, e, t, n, a)) a.stopPropagation();
        else if ((fm(e, a), t & 4 && -1 < a1.indexOf(e))) {
          for (; i !== null;) {
            var l = Bi(i);
            if (l !== null)
              switch (l.tag) {
                case 3:
                  if (
                    ((l = l.stateNode), l.current.memoizedState.isDehydrated)
                  ) {
                    var r = Na(l.pendingLanes);
                    if (r !== 0) {
                      var u = l;
                      for (u.pendingLanes |= 2, u.entangledLanes |= 2; r;) {
                        var s = 1 << (31 - ke(r));
                        ((u.entanglements[1] |= s), (r &= ~s));
                      }
                      (mn(l), !(et & 6) && ((wu = ze() + 500), tr(0, !1)));
                    }
                  }
                  break;
                case 31:
                case 13:
                  ((u = Fa(l, 2)), u !== null && be(u, l, 2), Ju(), cf(l, 2));
              }
            if (((l = gc(a)), l === null && So(e, t, a, ju, n), l === i)) break;
            i = l;
          }
          i !== null && a.stopPropagation();
        } else So(e, t, a, null, n);
      }
    }
    function gc(e) {
      return ((e = Ac(e)), hf(e));
    }
    var ju = null;
    function hf(e) {
      if (((ju = null), (e = oi(e)), e !== null)) {
        var t = Yl(e);
        if (t === null) e = null;
        else {
          var n = t.tag;
          if (n === 13) {
            if (((e = ym(t)), e !== null)) return e;
            e = null;
          } else if (n === 31) {
            if (((e = vm(t)), e !== null)) return e;
            e = null;
          } else if (n === 3) {
            if (t.stateNode.current.memoizedState.isDehydrated)
              return t.tag === 3 ? t.stateNode.containerInfo : null;
            e = null;
          } else t !== e && (e = null);
        }
      }
      return ((ju = e), null);
    }
    function Jp(e) {
      switch (e) {
        case "beforetoggle":
        case "cancel":
        case "click":
        case "close":
        case "contextmenu":
        case "copy":
        case "cut":
        case "auxclick":
        case "dblclick":
        case "dragend":
        case "dragstart":
        case "drop":
        case "focusin":
        case "focusout":
        case "input":
        case "invalid":
        case "keydown":
        case "keypress":
        case "keyup":
        case "mousedown":
        case "mouseup":
        case "paste":
        case "pause":
        case "play":
        case "pointercancel":
        case "pointerdown":
        case "pointerup":
        case "ratechange":
        case "reset":
        case "resize":
        case "seeked":
        case "submit":
        case "toggle":
        case "touchcancel":
        case "touchend":
        case "touchstart":
        case "volumechange":
        case "change":
        case "selectionchange":
        case "textInput":
        case "compositionstart":
        case "compositionend":
        case "compositionupdate":
        case "beforeblur":
        case "afterblur":
        case "beforeinput":
        case "blur":
        case "fullscreenchange":
        case "focus":
        case "hashchange":
        case "popstate":
        case "select":
        case "selectstart":
          return 2;
        case "drag":
        case "dragenter":
        case "dragexit":
        case "dragleave":
        case "dragover":
        case "mousemove":
        case "mouseout":
        case "mouseover":
        case "pointermove":
        case "pointerout":
        case "pointerover":
        case "scroll":
        case "touchmove":
        case "wheel":
        case "mouseenter":
        case "mouseleave":
        case "pointerenter":
        case "pointerleave":
          return 8;
        case "message":
          switch (qS()) {
            case Tm:
              return 2;
            case Em:
              return 8;
            case mu:
            case YS:
              return 32;
            case Am:
              return 268435456;
            default:
              return 32;
          }
        default:
          return 32;
      }
    }
    var pc = !1,
      oa = null,
      ca = null,
      fa = null,
      Fl = new Map(),
      ql = new Map(),
      Kn = [],
      a1 =
        "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(
          " ",
        );
    function fm(e, t) {
      switch (e) {
        case "focusin":
        case "focusout":
          oa = null;
          break;
        case "dragenter":
        case "dragleave":
          ca = null;
          break;
        case "mouseover":
        case "mouseout":
          fa = null;
          break;
        case "pointerover":
        case "pointerout":
          Fl.delete(t.pointerId);
          break;
        case "gotpointercapture":
        case "lostpointercapture":
          ql.delete(t.pointerId);
      }
    }
    function fl(e, t, n, a, i, l) {
      return e === null || e.nativeEvent !== l
        ? ((e = {
            blockedOn: t,
            domEventName: n,
            eventSystemFlags: a,
            nativeEvent: l,
            targetContainers: [i],
          }),
          t !== null && ((t = Bi(t)), t !== null && Kp(t)),
          e)
        : ((e.eventSystemFlags |= a),
          (t = e.targetContainers),
          i !== null && t.indexOf(i) === -1 && t.push(i),
          e);
    }
    function i1(e, t, n, a, i) {
      switch (t) {
        case "focusin":
          return ((oa = fl(oa, e, t, n, a, i)), !0);
        case "dragenter":
          return ((ca = fl(ca, e, t, n, a, i)), !0);
        case "mouseover":
          return ((fa = fl(fa, e, t, n, a, i)), !0);
        case "pointerover":
          var l = i.pointerId;
          return (Fl.set(l, fl(Fl.get(l) || null, e, t, n, a, i)), !0);
        case "gotpointercapture":
          return (
            (l = i.pointerId),
            ql.set(l, fl(ql.get(l) || null, e, t, n, a, i)),
            !0
          );
      }
      return !1;
    }
    function $p(e) {
      var t = oi(e.target);
      if (t !== null) {
        var n = Yl(t);
        if (n !== null) {
          if (((t = n.tag), t === 13)) {
            if (((t = ym(n)), t !== null)) {
              ((e.blockedOn = t),
                Ih(e.priority, function () {
                  cm(n);
                }));
              return;
            }
          } else if (t === 31) {
            if (((t = vm(n)), t !== null)) {
              ((e.blockedOn = t),
                Ih(e.priority, function () {
                  cm(n);
                }));
              return;
            }
          } else if (
            t === 3 &&
            n.stateNode.current.memoizedState.isDehydrated
          ) {
            e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
            return;
          }
        }
      }
      e.blockedOn = null;
    }
    function cu(e) {
      if (e.blockedOn !== null) return !1;
      for (var t = e.targetContainers; 0 < t.length;) {
        var n = gc(e.nativeEvent);
        if (n === null) {
          n = e.nativeEvent;
          var a = new n.constructor(n.type, n);
          ((Vo = a), n.target.dispatchEvent(a), (Vo = null));
        } else return ((t = Bi(n)), t !== null && Kp(t), (e.blockedOn = n), !1);
        t.shift();
      }
      return !0;
    }
    function hm(e, t, n) {
      cu(e) && n.delete(t);
    }
    function l1() {
      ((pc = !1),
        oa !== null && cu(oa) && (oa = null),
        ca !== null && cu(ca) && (ca = null),
        fa !== null && cu(fa) && (fa = null),
        Fl.forEach(hm),
        ql.forEach(hm));
    }
    function Ir(e, t) {
      e.blockedOn === t &&
        ((e.blockedOn = null),
        pc ||
          ((pc = !0),
          Ht.unstable_scheduleCallback(Ht.unstable_NormalPriority, l1)));
    }
    var Qr = null;
    function dm(e) {
      Qr !== e &&
        ((Qr = e),
        Ht.unstable_scheduleCallback(Ht.unstable_NormalPriority, function () {
          Qr === e && (Qr = null);
          for (var t = 0; t < e.length; t += 3) {
            var n = e[t],
              a = e[t + 1],
              i = e[t + 2];
            if (typeof a != "function") {
              if (hf(a || n) === null) continue;
              break;
            }
            var l = Bi(n);
            l !== null &&
              (e.splice(t, 3),
              (t -= 3),
              Zo(
                l,
                { pending: !0, data: i, method: n.method, action: a },
                a,
                i,
              ));
          }
        }));
    }
    function Li(e) {
      function t(s) {
        return Ir(s, e);
      }
      (oa !== null && Ir(oa, e),
        ca !== null && Ir(ca, e),
        fa !== null && Ir(fa, e),
        Fl.forEach(t),
        ql.forEach(t));
      for (var n = 0; n < Kn.length; n++) {
        var a = Kn[n];
        a.blockedOn === e && (a.blockedOn = null);
      }
      for (; 0 < Kn.length && ((n = Kn[0]), n.blockedOn === null);)
        ($p(n), n.blockedOn === null && Kn.shift());
      if (((n = (e.ownerDocument || e).$$reactFormReplay), n != null))
        for (a = 0; a < n.length; a += 3) {
          var i = n[a],
            l = n[a + 1],
            r = i[Ce] || null;
          if (typeof l == "function") r || dm(n);
          else if (r) {
            var u = null;
            if (l && l.hasAttribute("formAction")) {
              if (((i = l), (r = l[Ce] || null))) u = r.formAction;
              else if (hf(i) !== null) continue;
            } else u = r.action;
            (typeof u == "function"
              ? (n[a + 1] = u)
              : (n.splice(a, 3), (a -= 3)),
              dm(n));
          }
        }
    }
    function ty() {
      function e(l) {
        l.canIntercept &&
          l.info === "react-transition" &&
          l.intercept({
            handler: function () {
              return new Promise(function (r) {
                return (i = r);
              });
            },
            focusReset: "manual",
            scroll: "manual",
          });
      }
      function t() {
        (i !== null && (i(), (i = null)), a || setTimeout(n, 20));
      }
      function n() {
        if (!a && !navigation.transition) {
          var l = navigation.currentEntry;
          l &&
            l.url != null &&
            navigation.navigate(l.url, {
              state: l.getState(),
              info: "react-transition",
              history: "replace",
            });
        }
      }
      if (typeof navigation == "object") {
        var a = !1,
          i = null;
        return (
          navigation.addEventListener("navigate", e),
          navigation.addEventListener("navigatesuccess", t),
          navigation.addEventListener("navigateerror", t),
          setTimeout(n, 100),
          function () {
            ((a = !0),
              navigation.removeEventListener("navigate", e),
              navigation.removeEventListener("navigatesuccess", t),
              navigation.removeEventListener("navigateerror", t),
              i !== null && (i(), (i = null)));
          }
        );
      }
    }
    function df(e) {
      this._internalRoot = e;
    }
    es.prototype.render = df.prototype.render = function (e) {
      var t = this._internalRoot;
      if (t === null) throw Error(v(409));
      var n = t.current,
        a = Le();
      Zp(n, a, e, t, null, null);
    };
    es.prototype.unmount = df.prototype.unmount = function () {
      var e = this._internalRoot;
      if (e !== null) {
        this._internalRoot = null;
        var t = e.containerInfo;
        (Zp(e.current, 2, null, e, null, null), Ju(), (t[Ui] = null));
      }
    };
    function es(e) {
      this._internalRoot = e;
    }
    es.prototype.unstable_scheduleHydration = function (e) {
      if (e) {
        var t = xm();
        e = { blockedOn: null, target: e, priority: t };
        for (var n = 0; n < Kn.length && t !== 0 && t < Kn[n].priority; n++);
        (Kn.splice(n, 0, e), n === 0 && $p(e));
      }
    };
    var mm = gm.version;
    if (mm !== "19.2.7") throw Error(v(527, mm, "19.2.7"));
    nt.findDOMNode = function (e) {
      var t = e._reactInternals;
      if (t === void 0)
        throw typeof e.render == "function"
          ? Error(v(188))
          : ((e = Object.keys(e).join(",")), Error(v(268, e)));
      return (
        (e = US(t)),
        (e = e !== null ? Sm(e) : null),
        (e = e === null ? null : e.stateNode),
        e
      );
    };
    var r1 = {
      bundleType: 0,
      version: "19.2.7",
      rendererPackageName: "react-dom",
      currentDispatcherRef: V,
      reconcilerVersion: "19.2.7",
    };
    if (
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ != "undefined" &&
      ((hl = __REACT_DEVTOOLS_GLOBAL_HOOK__),
      !hl.isDisabled && hl.supportsFiber)
    )
      try {
        ((Pl = hl.inject(r1)), (Ve = hl));
      } catch {}
    var hl;
    ns.createRoot = function (e, t) {
      if (!pm(e)) throw Error(v(299));
      var n = !1,
        a = "",
        i = Yg,
        l = Pg,
        r = Xg;
      return (
        t != null &&
          (t.unstable_strictMode === !0 && (n = !0),
          t.identifierPrefix !== void 0 && (a = t.identifierPrefix),
          t.onUncaughtError !== void 0 && (i = t.onUncaughtError),
          t.onCaughtError !== void 0 && (l = t.onCaughtError),
          t.onRecoverableError !== void 0 && (r = t.onRecoverableError)),
        (t = Ip(e, 1, !1, null, null, n, a, null, i, l, r, ty)),
        (e[Ui] = t.current),
        uf(e),
        new df(t)
      );
    };
    ns.hydrateRoot = function (e, t, n) {
      if (!pm(e)) throw Error(v(299));
      var a = !1,
        i = "",
        l = Yg,
        r = Pg,
        u = Xg,
        s = null;
      return (
        n != null &&
          (n.unstable_strictMode === !0 && (a = !0),
          n.identifierPrefix !== void 0 && (i = n.identifierPrefix),
          n.onUncaughtError !== void 0 && (l = n.onUncaughtError),
          n.onCaughtError !== void 0 && (r = n.onCaughtError),
          n.onRecoverableError !== void 0 && (u = n.onRecoverableError),
          n.formState !== void 0 && (s = n.formState)),
        (t = Ip(e, 1, !0, t, n != null ? n : null, a, i, s, l, r, u, ty)),
        (t.context = Qp(null)),
        (n = t.current),
        (a = Le()),
        (a = bc(a)),
        (i = la(a)),
        (i.callback = null),
        ra(n, i, a),
        (n = a),
        (t.current.lanes = n),
        Il(t, n),
        mn(t),
        (e[Ui] = t.current),
        uf(e),
        new es(t)
      );
    };
    ns.version = "19.2.7";
  });
  var iy = un((FC, ay) => {
    "use strict";
    function ny() {
      if (!(
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ == "undefined" ||
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"
      ))
        try {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(ny);
        } catch (e) {
          console.error(e);
        }
    }
    (ny(), (ay.exports = ey()));
  });
  var Iv = un((ms) => {
    "use strict";
    var iC = Symbol.for("react.transitional.element"),
      lC = Symbol.for("react.fragment");
    function Xv(e, t, n) {
      var a = null;
      if (
        (n !== void 0 && (a = "" + n),
        t.key !== void 0 && (a = "" + t.key),
        "key" in t)
      ) {
        n = {};
        for (var i in t) i !== "key" && (n[i] = t[i]);
      } else n = t;
      return (
        (t = n.ref),
        {
          $$typeof: iC,
          type: e,
          key: a,
          ref: t !== void 0 ? t : null,
          props: n,
        }
      );
    }
    ms.Fragment = lC;
    ms.jsx = Xv;
    ms.jsxs = Xv;
  });
  var Wn = un((uA, Qv) => {
    "use strict";
    Qv.exports = Iv();
  });
  var ut = class e {
      constructor() {
        if (
          ((this._components = []),
          (this._componentsString = null),
          (this._isRelative = !1),
          typeof arguments[0] == "string")
        ) {
          let t = arguments[0];
          this.componentsString = t;
        } else if (
          arguments[0] instanceof e.Component &&
          arguments[1] instanceof e
        ) {
          let t = arguments[0],
            n = arguments[1];
          (this._components.push(t),
            (this._components = this._components.concat(n._components)));
        } else if (arguments[0] instanceof Array) {
          let t = arguments[0],
            n = !!arguments[1];
          ((this._components = this._components.concat(t)),
            (this._isRelative = n));
        }
      }
      get isRelative() {
        return this._isRelative;
      }
      get componentCount() {
        return this._components.length;
      }
      get head() {
        return this._components.length > 0 ? this._components[0] : null;
      }
      get tail() {
        if (this._components.length >= 2) {
          let t = this._components.slice(1, this._components.length);
          return new e(t);
        }
        return e.self;
      }
      get length() {
        return this._components.length;
      }
      get lastComponent() {
        let t = this._components.length - 1;
        return t >= 0 ? this._components[t] : null;
      }
      get containsNamedComponent() {
        for (let t = 0, n = this._components.length; t < n; t++)
          if (!this._components[t].isIndex) return !0;
        return !1;
      }
      static get self() {
        let t = new e();
        return ((t._isRelative = !0), t);
      }
      GetComponent(t) {
        return this._components[t];
      }
      PathByAppendingPath(t) {
        let n = new e(),
          a = 0;
        for (
          let i = 0;
          i < t._components.length && t._components[i].isParent;
          ++i
        )
          a++;
        for (let i = 0; i < this._components.length - a; ++i)
          n._components.push(this._components[i]);
        for (let i = a; i < t._components.length; ++i)
          n._components.push(t._components[i]);
        return n;
      }
      get componentsString() {
        return (
          this._componentsString == null &&
            ((this._componentsString = this._components.join(".")),
            this.isRelative &&
              (this._componentsString = "." + this._componentsString)),
          this._componentsString
        );
      }
      set componentsString(t) {
        if (
          ((this._components.length = 0),
          (this._componentsString = t),
          this._componentsString == null || this._componentsString == "")
        )
          return;
        this._componentsString[0] == "." &&
          ((this._isRelative = !0),
          (this._componentsString = this._componentsString.substring(1)));
        let n = this._componentsString.split(".");
        for (let a of n)
          /^(\-|\+)?([0-9]+|Infinity)$/.test(a)
            ? this._components.push(new e.Component(parseInt(a)))
            : this._components.push(new e.Component(a));
      }
      toString() {
        return this.componentsString;
      }
      Equals(t) {
        if (
          t == null ||
          t._components.length != this._components.length ||
          t.isRelative != this.isRelative
        )
          return !1;
        for (let n = 0, a = t._components.length; n < a; n++)
          if (!t._components[n].Equals(this._components[n])) return !1;
        return !0;
      }
      PathByAppendingComponent(t) {
        let n = new e();
        return (
          n._components.push(...this._components),
          n._components.push(t),
          n
        );
      }
    },
    pn,
    R,
    J,
    br;
  function _(e, t) {
    return e instanceof t ? ch(e) : null;
  }
  function tt(e, t) {
    if (e instanceof t) return ch(e);
    throw new Error(`${e} is not of type ${t}`);
  }
  function Sr(e) {
    return e.hasValidName && e.name ? e : null;
  }
  function vs(e) {
    return e === void 0 ? null : e;
  }
  function oh(e) {
    return typeof e == "object" && typeof e.Equals == "function";
  }
  function ch(e, t) {
    return e;
  }
  ((ut.parentId = "^"),
    (function (e) {
      class t {
        constructor(a) {
          ((this.index = -1),
            (this.name = null),
            typeof a == "string" ? (this.name = a) : (this.index = a));
        }
        get isIndex() {
          return this.index >= 0;
        }
        get isParent() {
          return this.name == e.parentId;
        }
        static ToParent() {
          return new t(e.parentId);
        }
        toString() {
          return this.isIndex ? this.index.toString() : this.name;
        }
        Equals(a) {
          return (
            a != null &&
            a.isIndex == this.isIndex &&
            (this.isIndex ? this.index == a.index : this.name == a.name)
          );
        }
      }
      e.Component = t;
    })(ut || (ut = {})),
    (function (e) {
      function t(n, a) {
        if (!n)
          throw (
            a !== void 0 && console.warn(a),
            console.trace && console.trace(),
            new Error("")
          );
      }
      ((e.AssertType = function (n, a, i) {
        t(n instanceof a, i);
      }),
        (e.Assert = t));
    })(pn || (pn = {})));
  var Ss = class extends Error {};
  function C(e) {
    throw new Ss(`${e} is null or undefined`);
  }
  var At = class {
      constructor() {
        ((this.parent = null),
          (this._debugMetadata = null),
          (this._path = null));
      }
      get debugMetadata() {
        return this._debugMetadata === null && this.parent
          ? this.parent.debugMetadata
          : this._debugMetadata;
      }
      set debugMetadata(t) {
        this._debugMetadata = t;
      }
      get ownDebugMetadata() {
        return this._debugMetadata;
      }
      DebugLineNumberOfPath(t) {
        if (t === null) return null;
        let n = this.rootContentContainer;
        if (n) {
          let a = n.ContentAtPath(t).obj;
          if (a) {
            let i = a.debugMetadata;
            if (i !== null) return i.startLineNumber;
          }
        }
        return null;
      }
      get path() {
        if (this._path == null)
          if (this.parent == null) this._path = new ut();
          else {
            let t = [],
              n = this,
              a = _(n.parent, K);
            for (; a !== null;) {
              let i = Sr(n);
              if (i != null && i.hasValidName) {
                if (i.name === null) return C("namedChild.name");
                t.unshift(new ut.Component(i.name));
              } else t.unshift(new ut.Component(a.content.indexOf(n)));
              ((n = a), (a = _(a.parent, K)));
            }
            this._path = new ut(t);
          }
        return this._path;
      }
      ResolvePath(t) {
        if (t === null) return C("path");
        if (t.isRelative) {
          let n = _(this, K);
          return (
            n === null &&
              (pn.Assert(
                this.parent !== null,
                "Can't resolve relative path because we don't have a parent",
              ),
              (n = _(this.parent, K)),
              pn.Assert(n !== null, "Expected parent to be a container"),
              pn.Assert(t.GetComponent(0).isParent),
              (t = t.tail)),
            n === null ? C("nearestContainer") : n.ContentAtPath(t)
          );
        }
        {
          let n = this.rootContentContainer;
          return n === null ? C("contentContainer") : n.ContentAtPath(t);
        }
      }
      ConvertPathToRelative(t) {
        let n = this.path,
          a = Math.min(t.length, n.length),
          i = -1;
        for (let u = 0; u < a; ++u) {
          let s = n.GetComponent(u),
            o = t.GetComponent(u);
          if (!s.Equals(o)) break;
          i = u;
        }
        if (i == -1) return t;
        let l = n.componentCount - 1 - i,
          r = [];
        for (let u = 0; u < l; ++u) r.push(ut.Component.ToParent());
        for (let u = i + 1; u < t.componentCount; ++u)
          r.push(t.GetComponent(u));
        return new ut(r, !0);
      }
      CompactPathString(t) {
        let n = null,
          a = null;
        return (
          t.isRelative
            ? ((a = t.componentsString),
              (n = this.path.PathByAppendingPath(t).componentsString))
            : ((a = this.ConvertPathToRelative(t).componentsString),
              (n = t.componentsString)),
          a.length < n.length ? a : n
        );
      }
      get rootContentContainer() {
        let t = this;
        for (; t.parent;) t = t.parent;
        return _(t, K);
      }
      Copy() {
        throw Error("Not Implemented: Doesn't support copying");
      }
      SetChild(t, n, a) {
        (t[n] && (t[n] = null), (t[n] = a), t[n] && (t[n].parent = this));
      }
      Equals(t) {
        return t === this;
      }
    },
    ee = class {
      constructor(t) {
        ((t = t !== void 0 ? t.toString() : ""), (this.string = t));
      }
      get Length() {
        return this.string.length;
      }
      Append(t) {
        t !== null && (this.string += t);
      }
      AppendLine(t) {
        (t !== void 0 && this.Append(t),
          (this.string += `
`));
      }
      AppendFormat(t) {
        for (
          var n = arguments.length, a = new Array(n > 1 ? n - 1 : 0), i = 1;
          i < n;
          i++
        )
          a[i - 1] = arguments[i];
        this.string += t.replace(/{(\d+)}/g, (l, r) =>
          a[r] !== void 0 ? a[r] : l,
        );
      }
      toString() {
        return this.string;
      }
      Clear() {
        this.string = "";
      }
    },
    ct = class e {
      constructor() {
        if (
          ((this.originName = null),
          (this.itemName = null),
          arguments[1] !== void 0)
        ) {
          let t = arguments[0],
            n = arguments[1];
          ((this.originName = t), (this.itemName = n));
        } else if (arguments[0]) {
          let t = arguments[0].toString().split(".");
          ((this.originName = t[0]), (this.itemName = t[1]));
        }
      }
      static get Null() {
        return new e(null, null);
      }
      get isNull() {
        return this.originName == null && this.itemName == null;
      }
      get fullName() {
        return (
          (this.originName !== null ? this.originName : "?") +
          "." +
          this.itemName
        );
      }
      toString() {
        return this.fullName;
      }
      Equals(t) {
        if (t instanceof e) {
          let n = t;
          return n.itemName == this.itemName && n.originName == this.originName;
        }
        return !1;
      }
      copy() {
        return new e(this.originName, this.itemName);
      }
      serialized() {
        return JSON.stringify({
          originName: this.originName,
          itemName: this.itemName,
        });
      }
      static fromSerializedKey(t) {
        let n = JSON.parse(t);
        if (!e.isLikeInkListItem(n)) return e.Null;
        let a = n;
        return new e(a.originName, a.itemName);
      }
      static isLikeInkListItem(t) {
        return (
          typeof t == "object" &&
          !(!t.hasOwnProperty("originName") || !t.hasOwnProperty("itemName")) &&
          (typeof t.originName == "string" || typeof t.originName === null) &&
          (typeof t.itemName == "string" || typeof t.itemName === null)
        );
      }
    },
    Ne = class e extends Map {
      constructor() {
        if (
          (super(arguments[0] instanceof e ? arguments[0] : []),
          (this.origins = null),
          (this._originNames = []),
          arguments[0] instanceof e)
        ) {
          let t = arguments[0],
            n = t.originNames;
          (n !== null && (this._originNames = n.slice()),
            t.origins !== null && (this.origins = t.origins.slice()));
        } else if (typeof arguments[0] == "string") {
          let t = arguments[0],
            n = arguments[1];
          if ((this.SetInitialOriginName(t), n.listDefinitions === null))
            return C("originStory.listDefinitions");
          let a = n.listDefinitions.TryListGetDefinition(t, null);
          if (!a.exists)
            throw new Error(
              "InkList origin could not be found in story when constructing new list: " +
                t,
            );
          if (a.result === null) return C("def.result");
          this.origins = [a.result];
        } else if (
          typeof arguments[0] == "object" &&
          arguments[0].hasOwnProperty("Key") &&
          arguments[0].hasOwnProperty("Value")
        ) {
          let t = arguments[0];
          this.Add(t.Key, t.Value);
        }
      }
      static FromString(t, n) {
        var a;
        if (t == null || t == "") return new e();
        let i =
          (a = n.listDefinitions) === null || a === void 0
            ? void 0
            : a.FindSingleItemListWithName(t);
        if (i) return i.value === null ? C("listValue.value") : new e(i.value);
        throw new Error(
          "Could not find the InkListItem from the string '" +
            t +
            "' to create an InkList because it doesn't exist in the original list definition in ink.",
        );
      }
      AddItem(t) {
        let n =
          arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null;
        if (t instanceof ct) {
          let a = t;
          if (a.originName == null) return void this.AddItem(a.itemName);
          if (this.origins === null) return C("this.origins");
          for (let i of this.origins)
            if (i.name == a.originName) {
              let l = i.TryGetValueForItem(a, 0);
              if (l.exists) return void this.Add(a, l.result);
              throw new Error(
                "Could not add the item " +
                  a +
                  " to this list because it doesn't exist in the original list definition in ink.",
              );
            }
          throw new Error(
            "Failed to add item to list because the item was from a new list definition that wasn't previously known to this list. Only items from previously known lists can be used, so that the int value can be found.",
          );
        }
        if (t !== null) {
          let a = t,
            i = null;
          if (this.origins === null) return C("this.origins");
          for (let l of this.origins) {
            if (a === null) return C("itemName");
            if (l.ContainsItemWithName(a)) {
              if (i != null)
                throw new Error(
                  "Could not add the item " +
                    a +
                    " to this list because it could come from either " +
                    l.name +
                    " or " +
                    i.name,
                );
              i = l;
            }
          }
          if (i == null) {
            if (n == null)
              throw new Error(
                "Could not add the item " +
                  a +
                  " to this list because it isn't known to any list definitions previously associated with this list.",
              );
            {
              let l = e.FromString(a, n).orderedItems[0];
              this.Add(l.Key, l.Value);
            }
          } else {
            let l = new ct(i.name, a),
              r = i.ValueForItem(l);
            this.Add(l, r);
          }
        }
      }
      ContainsItemNamed(t) {
        for (let [n] of this)
          if (ct.fromSerializedKey(n).itemName == t) return !0;
        return !1;
      }
      ContainsKey(t) {
        return this.has(t.serialized());
      }
      Add(t, n) {
        let a = t.serialized();
        if (this.has(a))
          throw new Error(`The Map already contains an entry for ${t}`);
        this.set(a, n);
      }
      Remove(t) {
        return this.delete(t.serialized());
      }
      get Count() {
        return this.size;
      }
      get originOfMaxItem() {
        if (this.origins == null) return null;
        let t = this.maxItem.Key.originName,
          n = null;
        return (this.origins.every((a) => a.name != t || ((n = a), !1)), n);
      }
      get originNames() {
        if (this.Count > 0) {
          this._originNames == null && this.Count > 0
            ? (this._originNames = [])
            : (this._originNames || (this._originNames = []),
              (this._originNames.length = 0));
          for (let [t] of this) {
            let n = ct.fromSerializedKey(t);
            if (n.originName === null) return C("item.originName");
            this._originNames.push(n.originName);
          }
        }
        return this._originNames;
      }
      SetInitialOriginName(t) {
        this._originNames = [t];
      }
      SetInitialOriginNames(t) {
        this._originNames = t == null ? null : t.slice();
      }
      get maxItem() {
        let t = { Key: ct.Null, Value: 0 };
        for (let [n, a] of this) {
          let i = ct.fromSerializedKey(n);
          (t.Key.isNull || a > t.Value) && (t = { Key: i, Value: a });
        }
        return t;
      }
      get minItem() {
        let t = { Key: ct.Null, Value: 0 };
        for (let [n, a] of this) {
          let i = ct.fromSerializedKey(n);
          (t.Key.isNull || a < t.Value) && (t = { Key: i, Value: a });
        }
        return t;
      }
      get inverse() {
        let t = new e();
        if (this.origins != null)
          for (let n of this.origins)
            for (let [a, i] of n.items) {
              let l = ct.fromSerializedKey(a);
              this.ContainsKey(l) || t.Add(l, i);
            }
        return t;
      }
      get all() {
        let t = new e();
        if (this.origins != null)
          for (let n of this.origins)
            for (let [a, i] of n.items) {
              let l = ct.fromSerializedKey(a);
              t.set(l.serialized(), i);
            }
        return t;
      }
      Union(t) {
        let n = new e(this);
        for (let [a, i] of t) n.set(a, i);
        return n;
      }
      Intersect(t) {
        let n = new e();
        for (let [a, i] of this) t.has(a) && n.set(a, i);
        return n;
      }
      HasIntersection(t) {
        for (let [n] of this) if (t.has(n)) return !0;
        return !1;
      }
      Without(t) {
        let n = new e(this);
        for (let [a] of t) n.delete(a);
        return n;
      }
      Contains(t) {
        if (typeof t == "string") return this.ContainsItemNamed(t);
        let n = t;
        if (n.size == 0 || this.size == 0) return !1;
        for (let [a] of n) if (!this.has(a)) return !1;
        return !0;
      }
      GreaterThan(t) {
        return (
          this.Count != 0 &&
          (t.Count == 0 || this.minItem.Value > t.maxItem.Value)
        );
      }
      GreaterThanOrEquals(t) {
        return (
          this.Count != 0 &&
          (t.Count == 0 ||
            (this.minItem.Value >= t.minItem.Value &&
              this.maxItem.Value >= t.maxItem.Value))
        );
      }
      LessThan(t) {
        return (
          t.Count != 0 &&
          (this.Count == 0 || this.maxItem.Value < t.minItem.Value)
        );
      }
      LessThanOrEquals(t) {
        return (
          t.Count != 0 &&
          (this.Count == 0 ||
            (this.maxItem.Value <= t.maxItem.Value &&
              this.minItem.Value <= t.minItem.Value))
        );
      }
      MaxAsList() {
        return this.Count > 0 ? new e(this.maxItem) : new e();
      }
      MinAsList() {
        return this.Count > 0 ? new e(this.minItem) : new e();
      }
      ListWithSubRange(t, n) {
        if (this.Count == 0) return new e();
        let a = this.orderedItems,
          i = 0,
          l = Number.MAX_SAFE_INTEGER;
        (Number.isInteger(t)
          ? (i = t)
          : t instanceof e && t.Count > 0 && (i = t.minItem.Value),
          Number.isInteger(n)
            ? (l = n)
            : n instanceof e && n.Count > 0 && (l = n.maxItem.Value));
        let r = new e();
        r.SetInitialOriginNames(this.originNames);
        for (let u of a) u.Value >= i && u.Value <= l && r.Add(u.Key, u.Value);
        return r;
      }
      Equals(t) {
        if (!(t instanceof e) || t.Count != this.Count) return !1;
        for (let [n] of this) if (!t.has(n)) return !1;
        return !0;
      }
      get orderedItems() {
        let t = new Array();
        for (let [n, a] of this) {
          let i = ct.fromSerializedKey(n);
          t.push({ Key: i, Value: a });
        }
        return (
          t.sort((n, a) =>
            n.Key.originName === null
              ? C("x.Key.originName")
              : a.Key.originName === null
                ? C("y.Key.originName")
                : n.Value == a.Value
                  ? n.Key.originName.localeCompare(a.Key.originName)
                  : n.Value < a.Value
                    ? -1
                    : n.Value > a.Value
                      ? 1
                      : 0,
          ),
          t
        );
      }
      get singleItem() {
        for (let t of this.orderedItems) return t.Key;
        return null;
      }
      toString() {
        let t = this.orderedItems,
          n = new ee();
        for (let a = 0; a < t.length; a++) {
          a > 0 && n.Append(", ");
          let i = t[a].Key;
          if (i.itemName === null) return C("item.itemName");
          n.Append(i.itemName);
        }
        return n.toString();
      }
      valueOf() {
        return NaN;
      }
    },
    ne = class extends Error {
      constructor(t) {
        (super(t),
          (this.useEndLineNumber = !1),
          (this.message = t),
          (this.name = "StoryException"));
      }
    };
  function Oe(e, t, n) {
    if (e === null) return { result: n, exists: !1 };
    let a = e.get(t);
    return a === void 0 ? { result: n, exists: !1 } : { result: a, exists: !0 };
  }
  var bs = class e extends At {
      static Create(t, n) {
        if (n) {
          if (n === R.Int && Number.isInteger(Number(t)))
            return new P(Number(t));
          if (n === R.Float && !isNaN(t)) return new we(Number(t));
        }
        return typeof t == "boolean"
          ? new vn(!!t)
          : typeof t == "string"
            ? new I(String(t))
            : Number.isInteger(Number(t))
              ? new P(Number(t))
              : isNaN(t)
                ? t instanceof ut
                  ? new $e(tt(t, ut))
                  : t instanceof Ne
                    ? new Et(tt(t, Ne))
                    : null
                : new we(Number(t));
      }
      Copy() {
        return tt(e.Create(this.valueObject), At);
      }
      BadCastException(t) {
        return new ne(
          "Can't cast " +
            this.valueObject +
            " from " +
            this.valueType +
            " to " +
            t,
        );
      }
    },
    Q = class extends bs {
      constructor(t) {
        (super(), (this.value = t));
      }
      get valueObject() {
        return this.value;
      }
      toString() {
        return this.value === null ? C("Value.value") : this.value.toString();
      }
    },
    vn = class extends Q {
      constructor(t) {
        super(t || !1);
      }
      get isTruthy() {
        return !!this.value;
      }
      get valueType() {
        return R.Bool;
      }
      Cast(t) {
        if (this.value === null) return C("Value.value");
        if (t == this.valueType) return this;
        if (t == R.Int) return new P(this.value ? 1 : 0);
        if (t == R.Float) return new we(this.value ? 1 : 0);
        if (t == R.String) return new I(this.value ? "true" : "false");
        throw this.BadCastException(t);
      }
      toString() {
        return this.value ? "true" : "false";
      }
    },
    P = class extends Q {
      constructor(t) {
        super(t || 0);
      }
      get isTruthy() {
        return this.value != 0;
      }
      get valueType() {
        return R.Int;
      }
      Cast(t) {
        if (this.value === null) return C("Value.value");
        if (t == this.valueType) return this;
        if (t == R.Bool) return new vn(this.value !== 0);
        if (t == R.Float) return new we(this.value);
        if (t == R.String) return new I("" + this.value);
        throw this.BadCastException(t);
      }
    },
    we = class extends Q {
      constructor(t) {
        super(t || 0);
      }
      get isTruthy() {
        return this.value != 0;
      }
      get valueType() {
        return R.Float;
      }
      Cast(t) {
        if (this.value === null) return C("Value.value");
        if (t == this.valueType) return this;
        if (t == R.Bool) return new vn(this.value !== 0);
        if (t == R.Int) return new P(this.value);
        if (t == R.String) return new I("" + this.value);
        throw this.BadCastException(t);
      }
    },
    I = class extends Q {
      constructor(t) {
        if (
          (super(t || ""),
          (this._isNewline =
            this.value ==
            `
`),
          (this._isInlineWhitespace = !0),
          this.value === null)
        )
          return C("Value.value");
        this.value.length > 0 &&
          this.value
            .split("")
            .every(
              (n) =>
                n == " " || n == "	" || ((this._isInlineWhitespace = !1), !1),
            );
      }
      get valueType() {
        return R.String;
      }
      get isTruthy() {
        return this.value === null ? C("Value.value") : this.value.length > 0;
      }
      get isNewline() {
        return this._isNewline;
      }
      get isInlineWhitespace() {
        return this._isInlineWhitespace;
      }
      get isNonWhitespace() {
        return !this.isNewline && !this.isInlineWhitespace;
      }
      Cast(t) {
        if (t == this.valueType) return this;
        if (t == R.Int) {
          let n = (function (a) {
            let i =
                arguments.length > 1 && arguments[1] !== void 0
                  ? arguments[1]
                  : 0,
              l = parseInt(a);
            return Number.isNaN(l)
              ? { result: i, exists: !1 }
              : { result: l, exists: !0 };
          })(this.value);
          if (n.exists) return new P(n.result);
          throw this.BadCastException(t);
        }
        if (t == R.Float) {
          let n = (function (a) {
            let i =
                arguments.length > 1 && arguments[1] !== void 0
                  ? arguments[1]
                  : 0,
              l = parseFloat(a);
            return Number.isNaN(l)
              ? { result: i, exists: !1 }
              : { result: l, exists: !0 };
          })(this.value);
          if (n.exists) return new we(n.result);
          throw this.BadCastException(t);
        }
        throw this.BadCastException(t);
      }
    },
    $e = class extends Q {
      constructor() {
        super(
          arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : null,
        );
      }
      get valueType() {
        return R.DivertTarget;
      }
      get targetPath() {
        return this.value === null ? C("Value.value") : this.value;
      }
      set targetPath(t) {
        this.value = t;
      }
      get isTruthy() {
        throw new Error(
          "Shouldn't be checking the truthiness of a divert target",
        );
      }
      Cast(t) {
        if (t == this.valueType) return this;
        throw this.BadCastException(t);
      }
      toString() {
        return "DivertTargetValue(" + this.targetPath + ")";
      }
    },
    tn = class e extends Q {
      constructor(t) {
        let n =
          arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : -1;
        (super(t), (this._contextIndex = n));
      }
      get contextIndex() {
        return this._contextIndex;
      }
      set contextIndex(t) {
        this._contextIndex = t;
      }
      get variableName() {
        return this.value === null ? C("Value.value") : this.value;
      }
      set variableName(t) {
        this.value = t;
      }
      get valueType() {
        return R.VariablePointer;
      }
      get isTruthy() {
        throw new Error(
          "Shouldn't be checking the truthiness of a variable pointer",
        );
      }
      Cast(t) {
        if (t == this.valueType) return this;
        throw this.BadCastException(t);
      }
      toString() {
        return "VariablePointerValue(" + this.variableName + ")";
      }
      Copy() {
        return new e(this.variableName, this.contextIndex);
      }
    },
    Et = class e extends Q {
      get isTruthy() {
        return this.value === null ? C("this.value") : this.value.Count > 0;
      }
      get valueType() {
        return R.List;
      }
      Cast(t) {
        if (this.value === null) return C("Value.value");
        if (t == R.Int) {
          let n = this.value.maxItem;
          return n.Key.isNull ? new P(0) : new P(n.Value);
        }
        if (t == R.Float) {
          let n = this.value.maxItem;
          return n.Key.isNull ? new we(0) : new we(n.Value);
        }
        if (t == R.String) {
          let n = this.value.maxItem;
          return n.Key.isNull ? new I("") : new I(n.Key.toString());
        }
        if (t == this.valueType) return this;
        throw this.BadCastException(t);
      }
      constructor(t, n) {
        (super(null),
          t || n
            ? t instanceof Ne
              ? (this.value = new Ne(t))
              : t instanceof ct &&
                typeof n == "number" &&
                (this.value = new Ne({ Key: t, Value: n }))
            : (this.value = new Ne()));
      }
      static RetainListOriginsForAssignment(t, n) {
        let a = _(t, e),
          i = _(n, e);
        return i && i.value === null
          ? C("newList.value")
          : a && a.value === null
            ? C("oldList.value")
            : void (
                a &&
                i &&
                i.value.Count == 0 &&
                i.value.SetInitialOriginNames(a.value.originNames)
              );
      }
    };
  (function (e) {
    ((e[(e.Bool = -1)] = "Bool"),
      (e[(e.Int = 0)] = "Int"),
      (e[(e.Float = 1)] = "Float"),
      (e[(e.List = 2)] = "List"),
      (e[(e.String = 3)] = "String"),
      (e[(e.DivertTarget = 4)] = "DivertTarget"),
      (e[(e.VariablePointer = 5)] = "VariablePointer"));
  })(R || (R = {}));
  var Cs = class e {
      constructor() {
        ((this.obj = null), (this.approximate = !1));
      }
      get correctObj() {
        return this.approximate ? null : this.obj;
      }
      get container() {
        return this.obj instanceof K ? this.obj : null;
      }
      copy() {
        let t = new e();
        return ((t.obj = this.obj), (t.approximate = this.approximate), t);
      }
    },
    K = class e extends At {
      constructor() {
        (super(...arguments),
          (this.name = null),
          (this._content = []),
          (this.namedContent = new Map()),
          (this.visitsShouldBeCounted = !1),
          (this.turnIndexShouldBeCounted = !1),
          (this.countingAtStartOnly = !1),
          (this._pathToFirstLeafContent = null));
      }
      get hasValidName() {
        return this.name != null && this.name.length > 0;
      }
      get content() {
        return this._content;
      }
      set content(t) {
        this.AddContent(t);
      }
      get namedOnlyContent() {
        let t = new Map();
        for (let [n, a] of this.namedContent) {
          let i = tt(a, At);
          t.set(n, i);
        }
        for (let n of this.content) {
          let a = Sr(n);
          a != null && a.hasValidName && t.delete(a.name);
        }
        return (t.size == 0 && (t = null), t);
      }
      set namedOnlyContent(t) {
        let n = this.namedOnlyContent;
        if (n != null) for (let [a] of n) this.namedContent.delete(a);
        if (t != null)
          for (let [, a] of t) {
            let i = Sr(a);
            i != null && this.AddToNamedContentOnly(i);
          }
      }
      get countFlags() {
        let t = 0;
        return (
          this.visitsShouldBeCounted && (t |= e.CountFlags.Visits),
          this.turnIndexShouldBeCounted && (t |= e.CountFlags.Turns),
          this.countingAtStartOnly && (t |= e.CountFlags.CountStartOnly),
          t == e.CountFlags.CountStartOnly && (t = 0),
          t
        );
      }
      set countFlags(t) {
        let n = t;
        ((n & e.CountFlags.Visits) > 0 && (this.visitsShouldBeCounted = !0),
          (n & e.CountFlags.Turns) > 0 && (this.turnIndexShouldBeCounted = !0),
          (n & e.CountFlags.CountStartOnly) > 0 &&
            (this.countingAtStartOnly = !0));
      }
      get pathToFirstLeafContent() {
        return (
          this._pathToFirstLeafContent == null &&
            (this._pathToFirstLeafContent = this.path.PathByAppendingPath(
              this.internalPathToFirstLeafContent,
            )),
          this._pathToFirstLeafContent
        );
      }
      get internalPathToFirstLeafContent() {
        let t = [],
          n = this;
        for (; n instanceof e;)
          n.content.length > 0 &&
            (t.push(new ut.Component(0)), (n = n.content[0]));
        return new ut(t);
      }
      AddContent(t) {
        if (t instanceof Array) {
          let n = t;
          for (let a of n) this.AddContent(a);
        } else {
          let n = t;
          if ((this._content.push(n), n.parent))
            throw new Error("content is already in " + n.parent);
          ((n.parent = this), this.TryAddNamedContent(n));
        }
      }
      TryAddNamedContent(t) {
        let n = Sr(t);
        n != null && n.hasValidName && this.AddToNamedContentOnly(n);
      }
      AddToNamedContentOnly(t) {
        if (
          (pn.AssertType(
            t,
            At,
            "Can only add Runtime.Objects to a Runtime.Container",
          ),
          (tt(t, At).parent = this),
          t.name === null)
        )
          return C("namedContentObj.name");
        this.namedContent.set(t.name, t);
      }
      ContentAtPath(t) {
        let n =
            arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0,
          a =
            arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : -1;
        a == -1 && (a = t.length);
        let i = new Cs();
        i.approximate = !1;
        let l = this,
          r = this;
        for (let u = n; u < a; ++u) {
          let s = t.GetComponent(u);
          if (l == null) {
            i.approximate = !0;
            break;
          }
          let o = l.ContentWithPathComponent(s);
          if (o == null) {
            i.approximate = !0;
            break;
          }
          let c = _(o, e);
          if (u < a - 1 && c == null) {
            i.approximate = !0;
            break;
          }
          ((r = o), (l = c));
        }
        return ((i.obj = r), i);
      }
      InsertContent(t, n) {
        if ((this.content.splice(n, 0, t), t.parent))
          throw new Error("content is already in " + t.parent);
        ((t.parent = this), this.TryAddNamedContent(t));
      }
      AddContentsOfContainer(t) {
        this.content.push(...t.content);
        for (let n of t.content)
          ((n.parent = this), this.TryAddNamedContent(n));
      }
      ContentWithPathComponent(t) {
        if (t.isIndex)
          return t.index >= 0 && t.index < this.content.length
            ? this.content[t.index]
            : null;
        if (t.isParent) return this.parent;
        {
          if (t.name === null) return C("component.name");
          let n = Oe(this.namedContent, t.name, null);
          return n.exists ? tt(n.result, At) : null;
        }
      }
      BuildStringOfHierarchy() {
        let t;
        if (arguments.length == 0)
          return (
            (t = new ee()),
            this.BuildStringOfHierarchy(t, 0, null),
            t.toString()
          );
        t = arguments[0];
        let n = arguments[1],
          a = arguments[2];
        function i() {
          for (let r = 0; r < 4 * n; ++r) t.Append(" ");
        }
        (i(),
          t.Append("["),
          this.hasValidName && t.AppendFormat(" ({0})", this.name),
          this == a && t.Append("  <---"),
          t.AppendLine(),
          n++);
        for (let r = 0; r < this.content.length; ++r) {
          let u = this.content[r];
          (u instanceof e
            ? u.BuildStringOfHierarchy(t, n, a)
            : (i(),
              u instanceof I
                ? (t.Append('"'),
                  t.Append(
                    u.toString().replace(
                      `
`,
                      "\\n",
                    ),
                  ),
                  t.Append('"'))
                : t.Append(u.toString())),
            r != this.content.length - 1 && t.Append(","),
            u instanceof e || u != a || t.Append("  <---"),
            t.AppendLine());
        }
        let l = new Map();
        for (let [r, u] of this.namedContent)
          this.content.indexOf(tt(u, At)) >= 0 || l.set(r, u);
        if (l.size > 0) {
          (i(), t.AppendLine("-- named: --"));
          for (let [, r] of l)
            (pn.AssertType(r, e, "Can only print out named Containers"),
              r.BuildStringOfHierarchy(t, n, a),
              t.AppendLine());
        }
        (n--, i(), t.Append("]"));
      }
    };
  (function (e) {
    var t;
    (((t = e.CountFlags || (e.CountFlags = {}))[(t.Start = 0)] = "Start"),
      (t[(t.Visits = 1)] = "Visits"),
      (t[(t.Turns = 2)] = "Turns"),
      (t[(t.CountStartOnly = 4)] = "CountStartOnly"));
  })(K || (K = {}));
  var Ea = class extends At {
      toString() {
        return "Glue";
      }
    },
    A = class e extends At {
      get commandType() {
        return this._commandType;
      }
      constructor() {
        let t =
          arguments.length > 0 && arguments[0] !== void 0
            ? arguments[0]
            : e.CommandType.NotSet;
        (super(), (this._commandType = t));
      }
      Copy() {
        return new e(this.commandType);
      }
      static EvalStart() {
        return new e(e.CommandType.EvalStart);
      }
      static EvalOutput() {
        return new e(e.CommandType.EvalOutput);
      }
      static EvalEnd() {
        return new e(e.CommandType.EvalEnd);
      }
      static Duplicate() {
        return new e(e.CommandType.Duplicate);
      }
      static PopEvaluatedValue() {
        return new e(e.CommandType.PopEvaluatedValue);
      }
      static PopFunction() {
        return new e(e.CommandType.PopFunction);
      }
      static PopTunnel() {
        return new e(e.CommandType.PopTunnel);
      }
      static BeginString() {
        return new e(e.CommandType.BeginString);
      }
      static EndString() {
        return new e(e.CommandType.EndString);
      }
      static NoOp() {
        return new e(e.CommandType.NoOp);
      }
      static ChoiceCount() {
        return new e(e.CommandType.ChoiceCount);
      }
      static Turns() {
        return new e(e.CommandType.Turns);
      }
      static TurnsSince() {
        return new e(e.CommandType.TurnsSince);
      }
      static ReadCount() {
        return new e(e.CommandType.ReadCount);
      }
      static Random() {
        return new e(e.CommandType.Random);
      }
      static SeedRandom() {
        return new e(e.CommandType.SeedRandom);
      }
      static VisitIndex() {
        return new e(e.CommandType.VisitIndex);
      }
      static SequenceShuffleIndex() {
        return new e(e.CommandType.SequenceShuffleIndex);
      }
      static StartThread() {
        return new e(e.CommandType.StartThread);
      }
      static Done() {
        return new e(e.CommandType.Done);
      }
      static End() {
        return new e(e.CommandType.End);
      }
      static ListFromInt() {
        return new e(e.CommandType.ListFromInt);
      }
      static ListRange() {
        return new e(e.CommandType.ListRange);
      }
      static ListRandom() {
        return new e(e.CommandType.ListRandom);
      }
      static BeginTag() {
        return new e(e.CommandType.BeginTag);
      }
      static EndTag() {
        return new e(e.CommandType.EndTag);
      }
      toString() {
        return "ControlCommand " + this.commandType.toString();
      }
    };
  ((function (e) {
    var t;
    (((t = e.CommandType || (e.CommandType = {}))[(t.NotSet = -1)] = "NotSet"),
      (t[(t.EvalStart = 0)] = "EvalStart"),
      (t[(t.EvalOutput = 1)] = "EvalOutput"),
      (t[(t.EvalEnd = 2)] = "EvalEnd"),
      (t[(t.Duplicate = 3)] = "Duplicate"),
      (t[(t.PopEvaluatedValue = 4)] = "PopEvaluatedValue"),
      (t[(t.PopFunction = 5)] = "PopFunction"),
      (t[(t.PopTunnel = 6)] = "PopTunnel"),
      (t[(t.BeginString = 7)] = "BeginString"),
      (t[(t.EndString = 8)] = "EndString"),
      (t[(t.NoOp = 9)] = "NoOp"),
      (t[(t.ChoiceCount = 10)] = "ChoiceCount"),
      (t[(t.Turns = 11)] = "Turns"),
      (t[(t.TurnsSince = 12)] = "TurnsSince"),
      (t[(t.ReadCount = 13)] = "ReadCount"),
      (t[(t.Random = 14)] = "Random"),
      (t[(t.SeedRandom = 15)] = "SeedRandom"),
      (t[(t.VisitIndex = 16)] = "VisitIndex"),
      (t[(t.SequenceShuffleIndex = 17)] = "SequenceShuffleIndex"),
      (t[(t.StartThread = 18)] = "StartThread"),
      (t[(t.Done = 19)] = "Done"),
      (t[(t.End = 20)] = "End"),
      (t[(t.ListFromInt = 21)] = "ListFromInt"),
      (t[(t.ListRange = 22)] = "ListRange"),
      (t[(t.ListRandom = 23)] = "ListRandom"),
      (t[(t.BeginTag = 24)] = "BeginTag"),
      (t[(t.EndTag = 25)] = "EndTag"),
      (t[(t.TOTAL_VALUES = 26)] = "TOTAL_VALUES"));
  })(A || (A = {})),
    (function (e) {
      ((e[(e.Tunnel = 0)] = "Tunnel"),
        (e[(e.Function = 1)] = "Function"),
        (e[(e.FunctionEvaluationFromGame = 2)] = "FunctionEvaluationFromGame"));
    })(J || (J = {})));
  var bt = class e {
      constructor() {
        ((this.container = null),
          (this.index = -1),
          arguments.length === 2 &&
            ((this.container = arguments[0]), (this.index = arguments[1])));
      }
      Resolve() {
        return this.index < 0
          ? this.container
          : this.container == null
            ? null
            : this.container.content.length == 0
              ? this.container
              : this.index >= this.container.content.length
                ? null
                : this.container.content[this.index];
      }
      get isNull() {
        return this.container == null;
      }
      get path() {
        return this.isNull
          ? null
          : this.index >= 0
            ? this.container.path.PathByAppendingComponent(
                new ut.Component(this.index),
              )
            : this.container.path;
      }
      toString() {
        return this.container
          ? "Ink Pointer -> " +
              this.container.path.toString() +
              " -- index " +
              this.index
          : "Ink Pointer (null)";
      }
      copy() {
        return new e(this.container, this.index);
      }
      static StartOf(t) {
        return new e(t, 0);
      }
      static get Null() {
        return new e(null, -1);
      }
    },
    Ka = class e extends At {
      get targetPath() {
        if (this._targetPath != null && this._targetPath.isRelative) {
          let t = this.targetPointer.Resolve();
          t && (this._targetPath = t.path);
        }
        return this._targetPath;
      }
      set targetPath(t) {
        ((this._targetPath = t), (this._targetPointer = bt.Null));
      }
      get targetPointer() {
        if (this._targetPointer.isNull) {
          let t = this.ResolvePath(this._targetPath).obj;
          if (this._targetPath === null) return C("this._targetPath");
          if (this._targetPath.lastComponent === null)
            return C("this._targetPath.lastComponent");
          if (this._targetPath.lastComponent.isIndex) {
            if (t === null) return C("targetObj");
            ((this._targetPointer.container =
              t.parent instanceof K ? t.parent : null),
              (this._targetPointer.index =
                this._targetPath.lastComponent.index));
          } else this._targetPointer = bt.StartOf(t instanceof K ? t : null);
        }
        return this._targetPointer.copy();
      }
      get targetPathString() {
        return this.targetPath == null
          ? null
          : this.CompactPathString(this.targetPath);
      }
      set targetPathString(t) {
        this.targetPath = t == null ? null : new ut(t);
      }
      get hasVariableTarget() {
        return this.variableDivertName != null;
      }
      constructor(t) {
        (super(),
          (this._targetPath = null),
          (this._targetPointer = bt.Null),
          (this.variableDivertName = null),
          (this.pushesToStack = !1),
          (this.stackPushType = 0),
          (this.isExternal = !1),
          (this.externalArgs = 0),
          (this.isConditional = !1),
          (this.pushesToStack = !1),
          t !== void 0 &&
            ((this.pushesToStack = !0), (this.stackPushType = t)));
      }
      Equals(t) {
        let n = t;
        return (
          n instanceof e &&
          this.hasVariableTarget == n.hasVariableTarget &&
          (this.hasVariableTarget
            ? this.variableDivertName == n.variableDivertName
            : this.targetPath === null
              ? C("this.targetPath")
              : this.targetPath.Equals(n.targetPath))
        );
      }
      toString() {
        if (this.hasVariableTarget)
          return "Divert(variable: " + this.variableDivertName + ")";
        if (this.targetPath == null) return "Divert(null)";
        {
          let t = new ee(),
            n = this.targetPath.toString();
          return (
            t.Append("Divert"),
            this.isConditional && t.Append("?"),
            this.pushesToStack &&
              (this.stackPushType == J.Function
                ? t.Append(" function")
                : t.Append(" tunnel")),
            t.Append(" -> "),
            t.Append(this.targetPathString),
            t.Append(" ("),
            t.Append(n),
            t.Append(")"),
            t.toString()
          );
        }
      }
    },
    $i = class extends At {
      constructor() {
        let t =
          !(arguments.length > 0 && arguments[0] !== void 0) || arguments[0];
        (super(),
          (this._pathOnChoice = null),
          (this.hasCondition = !1),
          (this.hasStartContent = !1),
          (this.hasChoiceOnlyContent = !1),
          (this.isInvisibleDefault = !1),
          (this.onceOnly = !0),
          (this.onceOnly = t));
      }
      get pathOnChoice() {
        if (this._pathOnChoice != null && this._pathOnChoice.isRelative) {
          let t = this.choiceTarget;
          t && (this._pathOnChoice = t.path);
        }
        return this._pathOnChoice;
      }
      set pathOnChoice(t) {
        this._pathOnChoice = t;
      }
      get choiceTarget() {
        return this._pathOnChoice === null
          ? C("ChoicePoint._pathOnChoice")
          : this.ResolvePath(this._pathOnChoice).container;
      }
      get pathStringOnChoice() {
        return this.pathOnChoice === null
          ? C("ChoicePoint.pathOnChoice")
          : this.CompactPathString(this.pathOnChoice);
      }
      set pathStringOnChoice(t) {
        this.pathOnChoice = new ut(t);
      }
      get flags() {
        let t = 0;
        return (
          this.hasCondition && (t |= 1),
          this.hasStartContent && (t |= 2),
          this.hasChoiceOnlyContent && (t |= 4),
          this.isInvisibleDefault && (t |= 8),
          this.onceOnly && (t |= 16),
          t
        );
      }
      set flags(t) {
        ((this.hasCondition = (1 & t) > 0),
          (this.hasStartContent = (2 & t) > 0),
          (this.hasChoiceOnlyContent = (4 & t) > 0),
          (this.isInvisibleDefault = (8 & t) > 0),
          (this.onceOnly = (16 & t) > 0));
      }
      toString() {
        return this.pathOnChoice === null
          ? C("ChoicePoint.pathOnChoice")
          : "Choice: -> " + this.pathOnChoice.toString();
      }
    },
    Qa = class extends At {
      get containerForCount() {
        return this.pathForCount === null
          ? null
          : this.ResolvePath(this.pathForCount).container;
      }
      get pathStringForCount() {
        return this.pathForCount === null
          ? null
          : this.CompactPathString(this.pathForCount);
      }
      set pathStringForCount(t) {
        this.pathForCount = t === null ? null : new ut(t);
      }
      constructor() {
        let t =
          arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : null;
        (super(), (this.pathForCount = null), (this.name = t));
      }
      toString() {
        return this.name != null
          ? "var(" + this.name + ")"
          : "read_count(" + this.pathStringForCount + ")";
      }
    },
    tl = class extends At {
      constructor(t, n) {
        (super(),
          (this.variableName = t || null),
          (this.isNewDeclaration = !!n),
          (this.isGlobal = !1));
      }
      toString() {
        return "VarAssign to " + this.variableName;
      }
    },
    en = class extends At {
      toString() {
        return "Void";
      }
    },
    H = class e extends At {
      static CallWithName(t) {
        return new e(t);
      }
      static CallExistsWithName(t) {
        return (
          this.GenerateNativeFunctionsIfNecessary(),
          this._nativeFunctions.get(t)
        );
      }
      get name() {
        return this._name === null ? C("NativeFunctionCall._name") : this._name;
      }
      set name(t) {
        ((this._name = t),
          this._isPrototype ||
            (e._nativeFunctions === null
              ? C("NativeFunctionCall._nativeFunctions")
              : (this._prototype =
                  e._nativeFunctions.get(this._name) || null)));
      }
      get numberOfParameters() {
        return this._prototype
          ? this._prototype.numberOfParameters
          : this._numberOfParameters;
      }
      set numberOfParameters(t) {
        this._numberOfParameters = t;
      }
      Call(t) {
        if (this._prototype) return this._prototype.Call(t);
        if (this.numberOfParameters != t.length)
          throw new Error("Unexpected number of parameters");
        let n = !1;
        for (let l of t) {
          if (l instanceof en)
            throw new ne(
              "Attempting to perform " +
                this.name +
                ' on a void value. Did you forget to "return" a value from a function you called here?',
            );
          l instanceof Et && (n = !0);
        }
        if (t.length == 2 && n) return this.CallBinaryListOperation(t);
        let a = this.CoerceValuesToSingleType(t),
          i = a[0].valueType;
        return i == R.Int ||
          i == R.Float ||
          i == R.String ||
          i == R.DivertTarget ||
          i == R.List
          ? this.CallType(a)
          : null;
      }
      CallType(t) {
        let n = tt(t[0], Q),
          a = n.valueType,
          i = n,
          l = t.length;
        if (l == 2 || l == 1) {
          if (this._operationFuncs === null)
            return C("NativeFunctionCall._operationFuncs");
          let r = this._operationFuncs.get(a);
          if (!r) {
            let u = R[a];
            throw new ne("Cannot perform operation " + this.name + " on " + u);
          }
          if (l == 2) {
            let u = tt(t[1], Q),
              s = r;
            if (i.value === null || u.value === null)
              return C("NativeFunctionCall.Call BinaryOp values");
            let o = s(i.value, u.value);
            return Q.Create(o);
          }
          {
            let u = r;
            if (i.value === null)
              return C("NativeFunctionCall.Call UnaryOp value");
            let s = u(i.value);
            return this.name === e.Int
              ? Q.Create(s, R.Int)
              : this.name === e.Float
                ? Q.Create(s, R.Float)
                : Q.Create(s, n.valueType);
          }
        }
        throw new Error(
          "Unexpected number of parameters to NativeFunctionCall: " + t.length,
        );
      }
      CallBinaryListOperation(t) {
        if (
          (this.name == "+" || this.name == "-") &&
          t[0] instanceof Et &&
          t[1] instanceof P
        )
          return this.CallListIncrementOperation(t);
        let n = tt(t[0], Q),
          a = tt(t[1], Q);
        if (!(
          (this.name != "&&" && this.name != "||") ||
          (n.valueType == R.List && a.valueType == R.List)
        )) {
          if (this._operationFuncs === null)
            return C("NativeFunctionCall._operationFuncs");
          let i = this._operationFuncs.get(R.Int);
          if (i === null)
            return C("NativeFunctionCall.CallBinaryListOperation op");
          let l = (function (r) {
            if (typeof r == "boolean") return r;
            throw new Error(`${r} is not a boolean`);
          })(i(n.isTruthy ? 1 : 0, a.isTruthy ? 1 : 0));
          return new vn(l);
        }
        if (n.valueType == R.List && a.valueType == R.List)
          return this.CallType([n, a]);
        throw new ne(
          "Can not call use " +
            this.name +
            " operation on " +
            R[n.valueType] +
            " and " +
            R[a.valueType],
        );
      }
      CallListIncrementOperation(t) {
        let n = tt(t[0], Et),
          a = tt(t[1], P),
          i = new Ne();
        if (n.value === null)
          return C(
            "NativeFunctionCall.CallListIncrementOperation listVal.value",
          );
        for (let [l, r] of n.value) {
          let u = ct.fromSerializedKey(l);
          if (this._operationFuncs === null)
            return C("NativeFunctionCall._operationFuncs");
          let s = this._operationFuncs.get(R.Int);
          if (a.value === null)
            return C(
              "NativeFunctionCall.CallListIncrementOperation intVal.value",
            );
          let o = s(r, a.value),
            c = null;
          if (n.value.origins === null)
            return C(
              "NativeFunctionCall.CallListIncrementOperation listVal.value.origins",
            );
          for (let h of n.value.origins)
            if (h.name == u.originName) {
              c = h;
              break;
            }
          if (c != null) {
            let h = c.TryGetItemWithValue(o, ct.Null);
            h.exists && i.Add(h.result, o);
          }
        }
        return new Et(i);
      }
      CoerceValuesToSingleType(t) {
        let n = R.Int,
          a = null;
        for (let l of t) {
          let r = tt(l, Q);
          (r.valueType > n && (n = r.valueType),
            r.valueType == R.List && (a = _(r, Et)));
        }
        let i = [];
        if (R[n] == R[R.List])
          for (let l of t) {
            let r = tt(l, Q);
            if (r.valueType == R.List) i.push(r);
            else {
              if (r.valueType != R.Int) {
                let u = R[r.valueType];
                throw new ne(
                  "Cannot mix Lists and " + u + " values in this operation",
                );
              }
              {
                let u = parseInt(r.valueObject);
                if (((a = tt(a, Et)), a.value === null))
                  return C(
                    "NativeFunctionCall.CoerceValuesToSingleType specialCaseList.value",
                  );
                let s = a.value.originOfMaxItem;
                if (s === null)
                  return C("NativeFunctionCall.CoerceValuesToSingleType list");
                let o = s.TryGetItemWithValue(u, ct.Null);
                if (!o.exists)
                  throw new ne(
                    "Could not find List item with the value " +
                      u +
                      " in " +
                      s.name,
                  );
                {
                  let c = new Et(o.result, u);
                  i.push(c);
                }
              }
            }
          }
        else
          for (let l of t) {
            let r = tt(l, Q).Cast(n);
            i.push(r);
          }
        return i;
      }
      constructor() {
        if (
          (super(),
          (this._name = null),
          (this._numberOfParameters = 0),
          (this._prototype = null),
          (this._isPrototype = !1),
          (this._operationFuncs = null),
          arguments.length === 0)
        )
          e.GenerateNativeFunctionsIfNecessary();
        else if (arguments.length === 1) {
          let t = arguments[0];
          (e.GenerateNativeFunctionsIfNecessary(), (this.name = t));
        } else if (arguments.length === 2) {
          let t = arguments[0],
            n = arguments[1];
          ((this._isPrototype = !0),
            (this.name = t),
            (this.numberOfParameters = n));
        }
      }
      static Identity(t) {
        return t;
      }
      static GenerateNativeFunctionsIfNecessary() {
        if (this._nativeFunctions == null) {
          ((this._nativeFunctions = new Map()),
            this.AddIntBinaryOp(this.Add, (a, i) => a + i),
            this.AddIntBinaryOp(this.Subtract, (a, i) => a - i),
            this.AddIntBinaryOp(this.Multiply, (a, i) => a * i),
            this.AddIntBinaryOp(this.Divide, (a, i) => Math.floor(a / i)),
            this.AddIntBinaryOp(this.Mod, (a, i) => a % i),
            this.AddIntUnaryOp(this.Negate, (a) => -a),
            this.AddIntBinaryOp(this.Equal, (a, i) => a == i),
            this.AddIntBinaryOp(this.Greater, (a, i) => a > i),
            this.AddIntBinaryOp(this.Less, (a, i) => a < i),
            this.AddIntBinaryOp(this.GreaterThanOrEquals, (a, i) => a >= i),
            this.AddIntBinaryOp(this.LessThanOrEquals, (a, i) => a <= i),
            this.AddIntBinaryOp(this.NotEquals, (a, i) => a != i),
            this.AddIntUnaryOp(this.Not, (a) => a == 0),
            this.AddIntBinaryOp(this.And, (a, i) => a != 0 && i != 0),
            this.AddIntBinaryOp(this.Or, (a, i) => a != 0 || i != 0),
            this.AddIntBinaryOp(this.Max, (a, i) => Math.max(a, i)),
            this.AddIntBinaryOp(this.Min, (a, i) => Math.min(a, i)),
            this.AddIntBinaryOp(this.Pow, (a, i) => Math.pow(a, i)),
            this.AddIntUnaryOp(this.Floor, e.Identity),
            this.AddIntUnaryOp(this.Ceiling, e.Identity),
            this.AddIntUnaryOp(this.Int, e.Identity),
            this.AddIntUnaryOp(this.Float, (a) => a),
            this.AddFloatBinaryOp(this.Add, (a, i) => a + i),
            this.AddFloatBinaryOp(this.Subtract, (a, i) => a - i),
            this.AddFloatBinaryOp(this.Multiply, (a, i) => a * i),
            this.AddFloatBinaryOp(this.Divide, (a, i) => a / i),
            this.AddFloatBinaryOp(this.Mod, (a, i) => a % i),
            this.AddFloatUnaryOp(this.Negate, (a) => -a),
            this.AddFloatBinaryOp(this.Equal, (a, i) => a == i),
            this.AddFloatBinaryOp(this.Greater, (a, i) => a > i),
            this.AddFloatBinaryOp(this.Less, (a, i) => a < i),
            this.AddFloatBinaryOp(this.GreaterThanOrEquals, (a, i) => a >= i),
            this.AddFloatBinaryOp(this.LessThanOrEquals, (a, i) => a <= i),
            this.AddFloatBinaryOp(this.NotEquals, (a, i) => a != i),
            this.AddFloatUnaryOp(this.Not, (a) => a == 0),
            this.AddFloatBinaryOp(this.And, (a, i) => a != 0 && i != 0),
            this.AddFloatBinaryOp(this.Or, (a, i) => a != 0 || i != 0),
            this.AddFloatBinaryOp(this.Max, (a, i) => Math.max(a, i)),
            this.AddFloatBinaryOp(this.Min, (a, i) => Math.min(a, i)),
            this.AddFloatBinaryOp(this.Pow, (a, i) => Math.pow(a, i)),
            this.AddFloatUnaryOp(this.Floor, (a) => Math.floor(a)),
            this.AddFloatUnaryOp(this.Ceiling, (a) => Math.ceil(a)),
            this.AddFloatUnaryOp(this.Int, (a) => Math.floor(a)),
            this.AddFloatUnaryOp(this.Float, e.Identity),
            this.AddStringBinaryOp(this.Add, (a, i) => a + i),
            this.AddStringBinaryOp(this.Equal, (a, i) => a === i),
            this.AddStringBinaryOp(this.NotEquals, (a, i) => a !== i),
            this.AddStringBinaryOp(this.Has, (a, i) => a.includes(i)),
            this.AddStringBinaryOp(this.Hasnt, (a, i) => !a.includes(i)),
            this.AddListBinaryOp(this.Add, (a, i) => a.Union(i)),
            this.AddListBinaryOp(this.Subtract, (a, i) => a.Without(i)),
            this.AddListBinaryOp(this.Has, (a, i) => a.Contains(i)),
            this.AddListBinaryOp(this.Hasnt, (a, i) => !a.Contains(i)),
            this.AddListBinaryOp(this.Intersect, (a, i) => a.Intersect(i)),
            this.AddListBinaryOp(this.Equal, (a, i) => a.Equals(i)),
            this.AddListBinaryOp(this.Greater, (a, i) => a.GreaterThan(i)),
            this.AddListBinaryOp(this.Less, (a, i) => a.LessThan(i)),
            this.AddListBinaryOp(this.GreaterThanOrEquals, (a, i) =>
              a.GreaterThanOrEquals(i),
            ),
            this.AddListBinaryOp(this.LessThanOrEquals, (a, i) =>
              a.LessThanOrEquals(i),
            ),
            this.AddListBinaryOp(this.NotEquals, (a, i) => !a.Equals(i)),
            this.AddListBinaryOp(
              this.And,
              (a, i) => a.Count > 0 && i.Count > 0,
            ),
            this.AddListBinaryOp(this.Or, (a, i) => a.Count > 0 || i.Count > 0),
            this.AddListUnaryOp(this.Not, (a) => (a.Count == 0 ? 1 : 0)),
            this.AddListUnaryOp(this.Invert, (a) => a.inverse),
            this.AddListUnaryOp(this.All, (a) => a.all),
            this.AddListUnaryOp(this.ListMin, (a) => a.MinAsList()),
            this.AddListUnaryOp(this.ListMax, (a) => a.MaxAsList()),
            this.AddListUnaryOp(this.Count, (a) => a.Count),
            this.AddListUnaryOp(this.ValueOfList, (a) => a.maxItem.Value));
          let t = (a, i) => a.Equals(i),
            n = (a, i) => !a.Equals(i);
          (this.AddOpToNativeFunc(this.Equal, 2, R.DivertTarget, t),
            this.AddOpToNativeFunc(this.NotEquals, 2, R.DivertTarget, n));
        }
      }
      AddOpFuncForType(t, n) {
        (this._operationFuncs == null && (this._operationFuncs = new Map()),
          this._operationFuncs.set(t, n));
      }
      static AddOpToNativeFunc(t, n, a, i) {
        if (this._nativeFunctions === null)
          return C("NativeFunctionCall._nativeFunctions");
        let l = this._nativeFunctions.get(t);
        (l || ((l = new e(t, n)), this._nativeFunctions.set(t, l)),
          l.AddOpFuncForType(a, i));
      }
      static AddIntBinaryOp(t, n) {
        this.AddOpToNativeFunc(t, 2, R.Int, n);
      }
      static AddIntUnaryOp(t, n) {
        this.AddOpToNativeFunc(t, 1, R.Int, n);
      }
      static AddFloatBinaryOp(t, n) {
        this.AddOpToNativeFunc(t, 2, R.Float, n);
      }
      static AddFloatUnaryOp(t, n) {
        this.AddOpToNativeFunc(t, 1, R.Float, n);
      }
      static AddStringBinaryOp(t, n) {
        this.AddOpToNativeFunc(t, 2, R.String, n);
      }
      static AddListBinaryOp(t, n) {
        this.AddOpToNativeFunc(t, 2, R.List, n);
      }
      static AddListUnaryOp(t, n) {
        this.AddOpToNativeFunc(t, 1, R.List, n);
      }
      toString() {
        return 'Native "' + this.name + '"';
      }
    };
  ((H.Add = "+"),
    (H.Subtract = "-"),
    (H.Divide = "/"),
    (H.Multiply = "*"),
    (H.Mod = "%"),
    (H.Negate = "_"),
    (H.Equal = "=="),
    (H.Greater = ">"),
    (H.Less = "<"),
    (H.GreaterThanOrEquals = ">="),
    (H.LessThanOrEquals = "<="),
    (H.NotEquals = "!="),
    (H.Not = "!"),
    (H.And = "&&"),
    (H.Or = "||"),
    (H.Min = "MIN"),
    (H.Max = "MAX"),
    (H.Pow = "POW"),
    (H.Floor = "FLOOR"),
    (H.Ceiling = "CEILING"),
    (H.Int = "INT"),
    (H.Float = "FLOAT"),
    (H.Has = "?"),
    (H.Hasnt = "!?"),
    (H.Intersect = "^"),
    (H.ListMin = "LIST_MIN"),
    (H.ListMax = "LIST_MAX"),
    (H.All = "LIST_ALL"),
    (H.Count = "LIST_COUNT"),
    (H.ValueOfList = "LIST_VALUE"),
    (H.Invert = "LIST_INVERT"),
    (H._nativeFunctions = null));
  var gn = class extends At {
      constructor(t) {
        (super(), (this.text = t.toString() || ""));
      }
      toString() {
        return "# " + this.text;
      }
    },
    el = class e extends At {
      constructor() {
        (super(...arguments),
          (this.text = ""),
          (this.index = 0),
          (this.threadAtGeneration = null),
          (this.sourcePath = ""),
          (this.targetPath = null),
          (this.isInvisibleDefault = !1),
          (this.tags = null),
          (this.originalThreadIndex = 0));
      }
      get pathStringOnChoice() {
        return this.targetPath === null
          ? C("Choice.targetPath")
          : this.targetPath.toString();
      }
      set pathStringOnChoice(t) {
        this.targetPath = new ut(t);
      }
      Clone() {
        let t = new e();
        return (
          (t.text = this.text),
          (t.sourcePath = this.sourcePath),
          (t.index = this.index),
          (t.targetPath = this.targetPath),
          (t.originalThreadIndex = this.originalThreadIndex),
          (t.isInvisibleDefault = this.isInvisibleDefault),
          this.threadAtGeneration !== null &&
            (t.threadAtGeneration = this.threadAtGeneration.Copy()),
          t
        );
      }
    },
    Ts = class {
      constructor(t, n) {
        ((this._name = t || ""),
          (this._items = null),
          (this._itemNameToValues = n || new Map()));
      }
      get name() {
        return this._name;
      }
      get items() {
        if (this._items == null) {
          this._items = new Map();
          for (let [t, n] of this._itemNameToValues) {
            let a = new ct(this.name, t);
            this._items.set(a.serialized(), n);
          }
        }
        return this._items;
      }
      ValueForItem(t) {
        if (!t.itemName) return 0;
        let n = this._itemNameToValues.get(t.itemName);
        return n !== void 0 ? n : 0;
      }
      ContainsItem(t) {
        return (
          !!t.itemName &&
          t.originName == this.name &&
          this._itemNameToValues.has(t.itemName)
        );
      }
      ContainsItemWithName(t) {
        return this._itemNameToValues.has(t);
      }
      TryGetItemWithValue(t, n) {
        for (let [a, i] of this._itemNameToValues)
          if (i == t) return { result: new ct(this.name, a), exists: !0 };
        return { result: ct.Null, exists: !1 };
      }
      TryGetValueForItem(t, n) {
        if (!t.itemName) return { result: 0, exists: !1 };
        let a = this._itemNameToValues.get(t.itemName);
        return a ? { result: a, exists: !0 } : { result: 0, exists: !1 };
      }
    },
    Cr = class {
      constructor(t) {
        ((this._lists = new Map()),
          (this._allUnambiguousListValueCache = new Map()));
        for (let n of t) {
          this._lists.set(n.name, n);
          for (let [a, i] of n.items) {
            let l = ct.fromSerializedKey(a),
              r = new Et(l, i);
            if (!l.itemName)
              throw new Error("item.itemName is null or undefined.");
            (this._allUnambiguousListValueCache.set(l.itemName, r),
              this._allUnambiguousListValueCache.set(l.fullName, r));
          }
        }
      }
      get lists() {
        let t = [];
        for (let [, n] of this._lists) t.push(n);
        return t;
      }
      TryListGetDefinition(t, n) {
        if (t === null) return { result: n, exists: !1 };
        let a = this._lists.get(t);
        return a ? { result: a, exists: !0 } : { result: n, exists: !1 };
      }
      FindSingleItemListWithName(t) {
        if (t === null) return C("name");
        let n = this._allUnambiguousListValueCache.get(t);
        return n !== void 0 ? n : null;
      }
    },
    wt = class e {
      static JArrayToRuntimeObjList(t) {
        let n = arguments.length > 1 && arguments[1] !== void 0 && arguments[1],
          a = t.length;
        n && a--;
        let i = [];
        for (let l = 0; l < a; l++) {
          let r = t[l],
            u = this.JTokenToRuntimeObject(r);
          if (u === null) return C("runtimeObj");
          i.push(u);
        }
        return i;
      }
      static WriteDictionaryRuntimeObjs(t, n) {
        t.WriteObjectStart();
        for (let [a, i] of n)
          (t.WritePropertyStart(a),
            this.WriteRuntimeObject(t, i),
            t.WritePropertyEnd());
        t.WriteObjectEnd();
      }
      static WriteListRuntimeObjs(t, n) {
        t.WriteArrayStart();
        for (let a of n) this.WriteRuntimeObject(t, a);
        t.WriteArrayEnd();
      }
      static WriteIntDictionary(t, n) {
        t.WriteObjectStart();
        for (let [a, i] of n) t.WriteIntProperty(a, i);
        t.WriteObjectEnd();
      }
      static WriteRuntimeObject(t, n) {
        let a = _(n, K);
        if (a) return void this.WriteRuntimeContainer(t, a);
        let i = _(n, Ka);
        if (i) {
          let m,
            y = "->";
          return (
            i.isExternal
              ? (y = "x()")
              : i.pushesToStack &&
                (i.stackPushType == J.Function
                  ? (y = "f()")
                  : i.stackPushType == J.Tunnel && (y = "->t->")),
            (m = i.hasVariableTarget
              ? i.variableDivertName
              : i.targetPathString),
            t.WriteObjectStart(),
            t.WriteProperty(y, m),
            i.hasVariableTarget && t.WriteProperty("var", !0),
            i.isConditional && t.WriteProperty("c", !0),
            i.externalArgs > 0 && t.WriteIntProperty("exArgs", i.externalArgs),
            void t.WriteObjectEnd()
          );
        }
        let l = _(n, $i);
        if (l)
          return (
            t.WriteObjectStart(),
            t.WriteProperty("*", l.pathStringOnChoice),
            t.WriteIntProperty("flg", l.flags),
            void t.WriteObjectEnd()
          );
        let r = _(n, vn);
        if (r) return void t.WriteBool(r.value);
        let u = _(n, P);
        if (u) return void t.WriteInt(u.value);
        let s = _(n, we);
        if (s) return void t.WriteFloat(s.value);
        let o = _(n, I);
        if (o)
          return void (o.isNewline
            ? t.Write(
                `
`,
                !1,
              )
            : (t.WriteStringStart(),
              t.WriteStringInner("^"),
              t.WriteStringInner(o.value),
              t.WriteStringEnd()));
        let c = _(n, Et);
        if (c) return void this.WriteInkList(t, c);
        let h = _(n, $e);
        if (h)
          return (
            t.WriteObjectStart(),
            h.value === null
              ? C("divTargetVal.value")
              : (t.WriteProperty("^->", h.value.componentsString),
                void t.WriteObjectEnd())
          );
        let f = _(n, tn);
        if (f)
          return (
            t.WriteObjectStart(),
            t.WriteProperty("^var", f.value),
            t.WriteIntProperty("ci", f.contextIndex),
            void t.WriteObjectEnd()
          );
        if (_(n, Ea)) return void t.Write("<>");
        let p = _(n, A);
        if (p) return void t.Write(e._controlCommandNames[p.commandType]);
        let S = _(n, H);
        if (S) {
          let m = S.name;
          return (m == "^" && (m = "L^"), void t.Write(m));
        }
        let T = _(n, Qa);
        if (T) {
          t.WriteObjectStart();
          let m = T.pathStringForCount;
          return (
            m != null
              ? t.WriteProperty("CNT?", m)
              : t.WriteProperty("VAR?", T.name),
            void t.WriteObjectEnd()
          );
        }
        let x = _(n, tl);
        if (x) {
          t.WriteObjectStart();
          let m = x.isGlobal ? "VAR=" : "temp=";
          return (
            t.WriteProperty(m, x.variableName),
            x.isNewDeclaration || t.WriteProperty("re", !0),
            void t.WriteObjectEnd()
          );
        }
        if (_(n, en)) return void t.Write("void");
        let g = _(n, gn);
        if (g)
          return (
            t.WriteObjectStart(),
            t.WriteProperty("#", g.text),
            void t.WriteObjectEnd()
          );
        let d = _(n, el);
        if (!d)
          throw new Error(
            "Failed to convert runtime object to Json token: " + n,
          );
        this.WriteChoice(t, d);
      }
      static JObjectToDictionaryRuntimeObjs(t) {
        let n = new Map();
        for (let a in t)
          if (t.hasOwnProperty(a)) {
            let i = this.JTokenToRuntimeObject(t[a]);
            if (i === null) return C("inkObject");
            n.set(a, i);
          }
        return n;
      }
      static JObjectToIntDictionary(t) {
        let n = new Map();
        for (let a in t) t.hasOwnProperty(a) && n.set(a, parseInt(t[a]));
        return n;
      }
      static JTokenToRuntimeObject(t) {
        if ((typeof t == "number" && !isNaN(t)) || typeof t == "boolean")
          return Q.Create(t);
        if (typeof t == "string") {
          let n = t.toString(),
            a = /^([0-9]+.[0-9]+f)$/.exec(n);
          if (a) return new we(parseFloat(a[0]));
          let i = n[0];
          if (i == "^") return new I(n.substring(1));
          if (
            i ==
              `
` &&
            n.length == 1
          )
            return new I(`
`);
          if (n == "<>") return new Ea();
          for (let l = 0; l < e._controlCommandNames.length; ++l)
            if (n == e._controlCommandNames[l]) return new A(l);
          if ((n == "L^" && (n = "^"), H.CallExistsWithName(n)))
            return H.CallWithName(n);
          if (n == "->->") return A.PopTunnel();
          if (n == "~ret") return A.PopFunction();
          if (n == "void") return new en();
        }
        if (typeof t == "object" && !Array.isArray(t)) {
          let n,
            a = t;
          if (a["^->"]) return ((n = a["^->"]), new $e(new ut(n.toString())));
          if (a["^var"]) {
            n = a["^var"];
            let c = new tn(n.toString());
            return (
              "ci" in a && ((n = a.ci), (c.contextIndex = parseInt(n))),
              c
            );
          }
          let i = !1,
            l = !1,
            r = J.Function,
            u = !1;
          if (
            ((n = a["->"])
              ? (i = !0)
              : (n = a["f()"])
                ? ((i = !0), (l = !0), (r = J.Function))
                : (n = a["->t->"])
                  ? ((i = !0), (l = !0), (r = J.Tunnel))
                  : (n = a["x()"]) &&
                    ((i = !0), (u = !0), (l = !1), (r = J.Function)),
            i)
          ) {
            let c = new Ka();
            ((c.pushesToStack = l), (c.stackPushType = r), (c.isExternal = u));
            let h = n.toString();
            return (
              (n = a.var)
                ? (c.variableDivertName = h)
                : (c.targetPathString = h),
              (c.isConditional = !!a.c),
              u && (n = a.exArgs) && (c.externalArgs = parseInt(n)),
              c
            );
          }
          if ((n = a["*"])) {
            let c = new $i();
            return (
              (c.pathStringOnChoice = n.toString()),
              (n = a.flg) && (c.flags = parseInt(n)),
              c
            );
          }
          if ((n = a["VAR?"])) return new Qa(n.toString());
          if ((n = a["CNT?"])) {
            let c = new Qa();
            return ((c.pathStringForCount = n.toString()), c);
          }
          let s = !1,
            o = !1;
          if (
            ((n = a["VAR="])
              ? ((s = !0), (o = !0))
              : (n = a["temp="]) && ((s = !0), (o = !1)),
            s)
          ) {
            let c = n.toString(),
              h = !a.re,
              f = new tl(c, h);
            return ((f.isGlobal = o), f);
          }
          if (a["#"] !== void 0) return ((n = a["#"]), new gn(n.toString()));
          if ((n = a.list)) {
            let c = n,
              h = new Ne();
            if ((n = a.origins)) {
              let f = n;
              h.SetInitialOriginNames(f);
            }
            for (let f in c)
              if (c.hasOwnProperty(f)) {
                let p = c[f],
                  S = new ct(f),
                  T = parseInt(p);
                h.Add(S, T);
              }
            return new Et(h);
          }
          if (a.originalChoicePath != null) return this.JObjectToChoice(a);
        }
        if (Array.isArray(t)) return this.JArrayToContainer(t);
        if (t == null) return null;
        throw new Error(
          "Failed to convert token to runtime object: " +
            this.toJson(t, ["parent"]),
        );
      }
      static toJson(t, n, a) {
        return JSON.stringify(
          t,
          (i, l) => (n != null && n.some((r) => r === i) ? void 0 : l),
          a,
        );
      }
      static WriteRuntimeContainer(t, n) {
        let a = arguments.length > 2 && arguments[2] !== void 0 && arguments[2];
        if ((t.WriteArrayStart(), n === null)) return C("container");
        for (let s of n.content) this.WriteRuntimeObject(t, s);
        let i = n.namedOnlyContent,
          l = n.countFlags,
          r = n.name != null && !a,
          u = i != null || l > 0 || r;
        if ((u && t.WriteObjectStart(), i != null))
          for (let [s, o] of i) {
            let c = s,
              h = _(o, K);
            (t.WritePropertyStart(c),
              this.WriteRuntimeContainer(t, h, !0),
              t.WritePropertyEnd());
          }
        (l > 0 && t.WriteIntProperty("#f", l),
          r && t.WriteProperty("#n", n.name),
          u ? t.WriteObjectEnd() : t.WriteNull(),
          t.WriteArrayEnd());
      }
      static JArrayToContainer(t) {
        let n = new K();
        n.content = this.JArrayToRuntimeObjList(t, !0);
        let a = t[t.length - 1];
        if (a != null) {
          let i = new Map();
          for (let l in a)
            if (l == "#f") n.countFlags = parseInt(a[l]);
            else if (l == "#n") n.name = a[l].toString();
            else {
              let r = this.JTokenToRuntimeObject(a[l]),
                u = _(r, K);
              (u && (u.name = l), i.set(l, r));
            }
          n.namedOnlyContent = i;
        }
        return n;
      }
      static JObjectToChoice(t) {
        let n = new el();
        return (
          (n.text = t.text.toString()),
          (n.index = parseInt(t.index)),
          (n.sourcePath = t.originalChoicePath.toString()),
          (n.originalThreadIndex = parseInt(t.originalThreadIndex)),
          (n.pathStringOnChoice = t.targetPath.toString()),
          (n.tags = this.JArrayToTags(t)),
          (n.isInvisibleDefault = !!t.isInvisibleDefault),
          n
        );
      }
      static JArrayToTags(t) {
        return t.tags ? t.tags : null;
      }
      static WriteChoice(t, n) {
        (t.WriteObjectStart(),
          t.WriteProperty("text", n.text),
          t.WriteIntProperty("index", n.index),
          t.WriteProperty("originalChoicePath", n.sourcePath),
          t.WriteIntProperty("originalThreadIndex", n.originalThreadIndex),
          t.WriteProperty("targetPath", n.pathStringOnChoice),
          t.WriteProperty("isInvisibleDefault", n.isInvisibleDefault),
          this.WriteChoiceTags(t, n),
          t.WriteObjectEnd());
      }
      static WriteChoiceTags(t, n) {
        if (n.tags && n.tags.length > 0) {
          (t.WritePropertyStart("tags"), t.WriteArrayStart());
          for (let a of n.tags) t.Write(a);
          (t.WriteArrayEnd(), t.WritePropertyEnd());
        }
      }
      static WriteInkList(t, n) {
        let a = n.value;
        if (a === null) return C("rawList");
        (t.WriteObjectStart(),
          t.WritePropertyStart("list"),
          t.WriteObjectStart());
        for (let [i, l] of a) {
          let r = ct.fromSerializedKey(i),
            u = l;
          if (r.itemName === null) return C("item.itemName");
          (t.WritePropertyNameStart(),
            t.WritePropertyNameInner(r.originName ? r.originName : "?"),
            t.WritePropertyNameInner("."),
            t.WritePropertyNameInner(r.itemName),
            t.WritePropertyNameEnd(),
            t.Write(u),
            t.WritePropertyEnd());
        }
        if (
          (t.WriteObjectEnd(),
          t.WritePropertyEnd(),
          a.Count == 0 && a.originNames != null && a.originNames.length > 0)
        ) {
          (t.WritePropertyStart("origins"), t.WriteArrayStart());
          for (let i of a.originNames) t.Write(i);
          (t.WriteArrayEnd(), t.WritePropertyEnd());
        }
        t.WriteObjectEnd();
      }
      static ListDefinitionsToJToken(t) {
        let n = {};
        for (let a of t.lists) {
          let i = {};
          for (let [l, r] of a.items) {
            let u = ct.fromSerializedKey(l);
            if (u.itemName === null) return C("item.itemName");
            i[u.itemName] = r;
          }
          n[a.name] = i;
        }
        return n;
      }
      static JTokenToListDefinitions(t) {
        let n = t,
          a = [];
        for (let i in n)
          if (n.hasOwnProperty(i)) {
            let l = i.toString(),
              r = n[i],
              u = new Map();
            for (let o in r)
              if (n.hasOwnProperty(i)) {
                let c = r[o];
                u.set(o, parseInt(c));
              }
            let s = new Ts(l, u);
            a.push(s);
          }
        return new Cr(a);
      }
    };
  wt._controlCommandNames = (() => {
    let e = [];
    ((e[A.CommandType.EvalStart] = "ev"),
      (e[A.CommandType.EvalOutput] = "out"),
      (e[A.CommandType.EvalEnd] = "/ev"),
      (e[A.CommandType.Duplicate] = "du"),
      (e[A.CommandType.PopEvaluatedValue] = "pop"),
      (e[A.CommandType.PopFunction] = "~ret"),
      (e[A.CommandType.PopTunnel] = "->->"),
      (e[A.CommandType.BeginString] = "str"),
      (e[A.CommandType.EndString] = "/str"),
      (e[A.CommandType.NoOp] = "nop"),
      (e[A.CommandType.ChoiceCount] = "choiceCnt"),
      (e[A.CommandType.Turns] = "turn"),
      (e[A.CommandType.TurnsSince] = "turns"),
      (e[A.CommandType.ReadCount] = "readc"),
      (e[A.CommandType.Random] = "rnd"),
      (e[A.CommandType.SeedRandom] = "srnd"),
      (e[A.CommandType.VisitIndex] = "visit"),
      (e[A.CommandType.SequenceShuffleIndex] = "seq"),
      (e[A.CommandType.StartThread] = "thread"),
      (e[A.CommandType.Done] = "done"),
      (e[A.CommandType.End] = "end"),
      (e[A.CommandType.ListFromInt] = "listInt"),
      (e[A.CommandType.ListRange] = "range"),
      (e[A.CommandType.ListRandom] = "lrnd"),
      (e[A.CommandType.BeginTag] = "#"),
      (e[A.CommandType.EndTag] = "/#"));
    for (let t = 0; t < A.CommandType.TOTAL_VALUES; ++t)
      if (e[t] == null)
        throw new Error("Control command not accounted for in serialisation");
    return e;
  })();
  var Aa = class e {
    get elements() {
      return this.callStack;
    }
    get depth() {
      return this.elements.length;
    }
    get currentElement() {
      let t = this._threads[this._threads.length - 1].callstack;
      return t[t.length - 1];
    }
    get currentElementIndex() {
      return this.callStack.length - 1;
    }
    get currentThread() {
      return this._threads[this._threads.length - 1];
    }
    set currentThread(t) {
      (pn.Assert(
        this._threads.length == 1,
        "Shouldn't be directly setting the current thread when we have a stack of them",
      ),
        (this._threads.length = 0),
        this._threads.push(t));
    }
    get canPop() {
      return this.callStack.length > 1;
    }
    constructor() {
      if (
        ((this._threadCounter = 0),
        (this._startOfRoot = bt.Null),
        arguments[0] instanceof yn)
      ) {
        let t = arguments[0];
        ((this._startOfRoot = bt.StartOf(t.rootContentContainer)),
          this.Reset());
      } else {
        let t = arguments[0];
        this._threads = [];
        for (let n of t._threads) this._threads.push(n.Copy());
        ((this._threadCounter = t._threadCounter),
          (this._startOfRoot = t._startOfRoot.copy()));
      }
    }
    Reset() {
      ((this._threads = []),
        this._threads.push(new e.Thread()),
        this._threads[0].callstack.push(
          new e.Element(J.Tunnel, this._startOfRoot),
        ));
    }
    SetJsonToken(t, n) {
      this._threads.length = 0;
      let a = t.threads;
      for (let i of a) {
        let l = i,
          r = new e.Thread(l, n);
        this._threads.push(r);
      }
      ((this._threadCounter = parseInt(t.threadCounter)),
        (this._startOfRoot = bt.StartOf(n.rootContentContainer)));
    }
    WriteJson(t) {
      t.WriteObject((n) => {
        (n.WritePropertyStart("threads"), n.WriteArrayStart());
        for (let a of this._threads) a.WriteJson(n);
        (n.WriteArrayEnd(),
          n.WritePropertyEnd(),
          n.WritePropertyStart("threadCounter"),
          n.WriteInt(this._threadCounter),
          n.WritePropertyEnd());
      });
    }
    PushThread() {
      let t = this.currentThread.Copy();
      (this._threadCounter++,
        (t.threadIndex = this._threadCounter),
        this._threads.push(t));
    }
    ForkThread() {
      let t = this.currentThread.Copy();
      return (this._threadCounter++, (t.threadIndex = this._threadCounter), t);
    }
    PopThread() {
      if (!this.canPopThread) throw new Error("Can't pop thread");
      this._threads.splice(this._threads.indexOf(this.currentThread), 1);
    }
    get canPopThread() {
      return this._threads.length > 1 && !this.elementIsEvaluateFromGame;
    }
    get elementIsEvaluateFromGame() {
      return this.currentElement.type == J.FunctionEvaluationFromGame;
    }
    Push(t) {
      let n =
          arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0,
        a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0,
        i = new e.Element(t, this.currentElement.currentPointer, !1);
      ((i.evaluationStackHeightWhenPushed = n),
        (i.functionStartInOutputStream = a),
        this.callStack.push(i));
    }
    CanPop() {
      let t =
        arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : null;
      return !!this.canPop && (t == null || this.currentElement.type == t);
    }
    Pop() {
      let t =
        arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : null;
      if (!this.CanPop(t)) throw new Error("Mismatched push/pop in Callstack");
      this.callStack.pop();
    }
    GetTemporaryVariableWithName(t) {
      let n =
        arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : -1;
      n == -1 && (n = this.currentElementIndex + 1);
      let a = Oe(this.callStack[n - 1].temporaryVariables, t, null);
      return a.exists ? a.result : null;
    }
    SetTemporaryVariable(t, n, a) {
      let i =
        arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : -1;
      i == -1 && (i = this.currentElementIndex + 1);
      let l = this.callStack[i - 1];
      if (!a && !l.temporaryVariables.get(t))
        throw new Error("Could not find temporary variable to set: " + t);
      let r = Oe(l.temporaryVariables, t, null);
      (r.exists && Et.RetainListOriginsForAssignment(r.result, n),
        l.temporaryVariables.set(t, n));
    }
    ContextForVariableNamed(t) {
      return this.currentElement.temporaryVariables.get(t)
        ? this.currentElementIndex + 1
        : 0;
    }
    ThreadWithIndex(t) {
      let n = this._threads.filter((a) => {
        if (a.threadIndex == t) return a;
      });
      return n.length > 0 ? n[0] : null;
    }
    get callStack() {
      return this.currentThread.callstack;
    }
    get callStackTrace() {
      let t = new ee();
      for (let n = 0; n < this._threads.length; n++) {
        let a = this._threads[n],
          i = n == this._threads.length - 1;
        t.AppendFormat(
          `=== THREAD {0}/{1} {2}===
`,
          n + 1,
          this._threads.length,
          i ? "(current) " : "",
        );
        for (let l = 0; l < a.callstack.length; l++) {
          a.callstack[l].type == J.Function
            ? t.Append("  [FUNCTION] ")
            : t.Append("  [TUNNEL] ");
          let r = a.callstack[l].currentPointer;
          if (!r.isNull) {
            if ((t.Append("<SOMEWHERE IN "), r.container === null))
              return C("pointer.container");
            (t.Append(r.container.path.toString()), t.AppendLine(">"));
          }
        }
      }
      return t.toString();
    }
  };
  (function (e) {
    class t {
      constructor(i, l) {
        let r = arguments.length > 2 && arguments[2] !== void 0 && arguments[2];
        ((this.evaluationStackHeightWhenPushed = 0),
          (this.functionStartInOutputStream = 0),
          (this.currentPointer = l.copy()),
          (this.inExpressionEvaluation = r),
          (this.temporaryVariables = new Map()),
          (this.type = i));
      }
      Copy() {
        let i = new t(
          this.type,
          this.currentPointer,
          this.inExpressionEvaluation,
        );
        return (
          (i.temporaryVariables = new Map(this.temporaryVariables)),
          (i.evaluationStackHeightWhenPushed =
            this.evaluationStackHeightWhenPushed),
          (i.functionStartInOutputStream = this.functionStartInOutputStream),
          i
        );
      }
    }
    e.Element = t;
    class n {
      constructor() {
        if (
          ((this.threadIndex = 0),
          (this.previousPointer = bt.Null),
          (this.callstack = []),
          arguments[0] && arguments[1])
        ) {
          let i = arguments[0],
            l = arguments[1];
          this.threadIndex = parseInt(i.threadIndex);
          let r = i.callstack;
          for (let s of r) {
            let o,
              c = s,
              h = parseInt(c.type),
              f = bt.Null,
              p = c.cPath;
            if (p !== void 0) {
              o = p.toString();
              let g = l.ContentAtPath(new ut(o));
              if (
                ((f.container = g.container),
                (f.index = parseInt(c.idx)),
                g.obj == null)
              )
                throw new Error(
                  "When loading state, internal story location couldn't be found: " +
                    o +
                    ". Has the story changed since this save data was created?",
                );
              g.approximate &&
                (f.container !== null
                  ? l.Warning(
                      "When loading state, exact internal story location couldn't be found: '" +
                        o +
                        "', so it was approximated to '" +
                        f.container.path.toString() +
                        "' to recover. Has the story changed since this save data was created?",
                    )
                  : l.Warning(
                      "When loading state, exact internal story location couldn't be found: '" +
                        o +
                        "' and it may not be recoverable. Has the story changed since this save data was created?",
                    ));
            }
            let S = !!c.exp,
              T = new t(h, f, S),
              x = c.temp;
            (x !== void 0
              ? (T.temporaryVariables = wt.JObjectToDictionaryRuntimeObjs(x))
              : T.temporaryVariables.clear(),
              this.callstack.push(T));
          }
          let u = i.previousContentObject;
          if (u !== void 0) {
            let s = new ut(u.toString());
            this.previousPointer = l.PointerAtPath(s);
          }
        }
      }
      Copy() {
        let i = new n();
        i.threadIndex = this.threadIndex;
        for (let l of this.callstack) i.callstack.push(l.Copy());
        return ((i.previousPointer = this.previousPointer.copy()), i);
      }
      WriteJson(i) {
        (i.WriteObjectStart(),
          i.WritePropertyStart("callstack"),
          i.WriteArrayStart());
        for (let l of this.callstack) {
          if ((i.WriteObjectStart(), !l.currentPointer.isNull)) {
            if (l.currentPointer.container === null)
              return C("el.currentPointer.container");
            (i.WriteProperty(
              "cPath",
              l.currentPointer.container.path.componentsString,
            ),
              i.WriteIntProperty("idx", l.currentPointer.index));
          }
          (i.WriteProperty("exp", l.inExpressionEvaluation),
            i.WriteIntProperty("type", l.type),
            l.temporaryVariables.size > 0 &&
              (i.WritePropertyStart("temp"),
              wt.WriteDictionaryRuntimeObjs(i, l.temporaryVariables),
              i.WritePropertyEnd()),
            i.WriteObjectEnd());
        }
        if (
          (i.WriteArrayEnd(),
          i.WritePropertyEnd(),
          i.WriteIntProperty("threadIndex", this.threadIndex),
          !this.previousPointer.isNull)
        ) {
          let l = this.previousPointer.Resolve();
          if (l === null) return C("this.previousPointer.Resolve()");
          i.WriteProperty("previousContentObject", l.path.toString());
        }
        i.WriteObjectEnd();
      }
    }
    e.Thread = n;
  })(Aa || (Aa = {}));
  var Tr = class e extends class {} {
    variableChangedEvent(t, n) {
      for (let a of this.variableChangedEventCallbacks) a(t, n);
    }
    StartVariableObservation() {
      ((this._batchObservingVariableChanges = !0),
        (this._changedVariablesForBatchObs = new Set()));
    }
    CompleteVariableObservation() {
      this._batchObservingVariableChanges = !1;
      let t = new Map();
      if (this._changedVariablesForBatchObs != null)
        for (let n of this._changedVariablesForBatchObs) {
          let a = this._globalVariables.get(n);
          this.variableChangedEvent(n, a);
        }
      if (this.patch != null)
        for (let n of this.patch.changedVariables) {
          let a = this.patch.TryGetGlobal(n, null);
          a.exists && t.set(n, a);
        }
      return ((this._changedVariablesForBatchObs = null), t);
    }
    NotifyObservers(t) {
      for (let [n, a] of t) this.variableChangedEvent(n, a);
    }
    get callStack() {
      return this._callStack;
    }
    set callStack(t) {
      this._callStack = t;
    }
    $(t, n) {
      if (n === void 0) {
        let a = null;
        return this.patch !== null &&
          ((a = this.patch.TryGetGlobal(t, null)), a.exists)
          ? a.result.valueObject
          : ((a = this._globalVariables.get(t)),
            a === void 0 && (a = this._defaultGlobalVariables.get(t)),
            a !== void 0 ? a.valueObject : null);
      }
      {
        if (this._defaultGlobalVariables.get(t) === void 0)
          throw new ne(
            "Cannot assign to a variable (" +
              t +
              ") that hasn't been declared in the story",
          );
        let a = Q.Create(n);
        if (a == null)
          throw n == null
            ? new Error("Cannot pass null to VariableState")
            : new Error(
                "Invalid value passed to VariableState: " + n.toString(),
              );
        this.SetGlobal(t, a);
      }
    }
    constructor(t, n) {
      (super(),
        (this.variableChangedEventCallbacks = []),
        (this.patch = null),
        (this._defaultGlobalVariables = new Map()),
        (this._changedVariablesForBatchObs = new Set()),
        (this._batchObservingVariableChanges = !1),
        (this._globalVariables = new Map()),
        (this._callStack = t),
        (this._listDefsOrigin = n));
      try {
        return new Proxy(this, {
          get: (a, i) => (i in a ? a[i] : a.$(i)),
          set: (a, i, l) => (i in a ? (a[i] = l) : a.$(i, l), !0),
          ownKeys: (a) => [
            ...new Set([
              ...a._defaultGlobalVariables.keys(),
              ...a._globalVariables.keys(),
            ]),
          ],
          getOwnPropertyDescriptor: (a, i) => ({
            enumerable: !0,
            configurable: !0,
            value: a.$(i),
          }),
        });
      } catch {}
    }
    ApplyPatch() {
      if (this.patch === null) return C("this.patch");
      for (let [t, n] of this.patch.globals) this._globalVariables.set(t, n);
      if (this._changedVariablesForBatchObs !== null)
        for (let t of this.patch.changedVariables)
          this._changedVariablesForBatchObs.add(t);
      this.patch = null;
    }
    SetJsonToken(t) {
      this._globalVariables.clear();
      for (let [n, a] of this._defaultGlobalVariables) {
        let i = t[n];
        if (i !== void 0) {
          let l = wt.JTokenToRuntimeObject(i);
          if (l === null) return C("tokenInkObject");
          this._globalVariables.set(n, l);
        } else this._globalVariables.set(n, a);
      }
    }
    WriteJson(t) {
      t.WriteObjectStart();
      for (let [n, a] of this._globalVariables) {
        let i = n,
          l = a;
        if (e.dontSaveDefaultValues && this._defaultGlobalVariables.has(i)) {
          let r = this._defaultGlobalVariables.get(i);
          if (this.RuntimeObjectsEqual(l, r)) continue;
        }
        (t.WritePropertyStart(i),
          wt.WriteRuntimeObject(t, l),
          t.WritePropertyEnd());
      }
      t.WriteObjectEnd();
    }
    RuntimeObjectsEqual(t, n) {
      if (t === null) return C("obj1");
      if (n === null) return C("obj2");
      if (t.constructor !== n.constructor) return !1;
      let a = _(t, vn);
      if (a !== null) return a.value === tt(n, vn).value;
      let i = _(t, P);
      if (i !== null) return i.value === tt(n, P).value;
      let l = _(t, we);
      if (l !== null) return l.value === tt(n, we).value;
      let r = _(t, Q),
        u = _(n, Q);
      if (r !== null && u !== null)
        return oh(r.valueObject) && oh(u.valueObject)
          ? r.valueObject.Equals(u.valueObject)
          : r.valueObject === u.valueObject;
      throw new Error(
        "FastRoughDefinitelyEquals: Unsupported runtime object type: " +
          t.constructor.name,
      );
    }
    GetVariableWithName(t) {
      let n =
          arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : -1,
        a = this.GetRawVariableWithName(t, n),
        i = _(a, tn);
      return (i !== null && (a = this.ValueAtVariablePointer(i)), a);
    }
    TryGetDefaultVariableValue(t) {
      let n = Oe(this._defaultGlobalVariables, t, null);
      return n.exists ? n.result : null;
    }
    GlobalVariableExistsWithName(t) {
      return (
        this._globalVariables.has(t) ||
        (this._defaultGlobalVariables !== null &&
          this._defaultGlobalVariables.has(t))
      );
    }
    GetRawVariableWithName(t, n) {
      let a = null;
      if (n == 0 || n == -1) {
        let i = null;
        if (
          (this.patch !== null &&
            ((i = this.patch.TryGetGlobal(t, null)), i.exists)) ||
          ((i = Oe(this._globalVariables, t, null)), i.exists) ||
          (this._defaultGlobalVariables !== null &&
            ((i = Oe(this._defaultGlobalVariables, t, null)), i.exists))
        )
          return i.result;
        if (this._listDefsOrigin === null)
          return C("VariablesState._listDefsOrigin");
        let l = this._listDefsOrigin.FindSingleItemListWithName(t);
        if (l) return l;
      }
      return ((a = this._callStack.GetTemporaryVariableWithName(t, n)), a);
    }
    ValueAtVariablePointer(t) {
      return this.GetVariableWithName(t.variableName, t.contextIndex);
    }
    Assign(t, n) {
      let a = t.variableName;
      if (a === null) return C("name");
      let i = -1,
        l = !1;
      if (
        ((l = t.isNewDeclaration
          ? t.isGlobal
          : this.GlobalVariableExistsWithName(a)),
        t.isNewDeclaration)
      ) {
        let r = _(n, tn);
        r !== null && (n = this.ResolveVariablePointer(r));
      } else {
        let r = null;
        do
          ((r = _(this.GetRawVariableWithName(a, i), tn)),
            r != null &&
              ((a = r.variableName), (i = r.contextIndex), (l = i == 0)));
        while (r != null);
      }
      l
        ? this.SetGlobal(a, n)
        : this._callStack.SetTemporaryVariable(a, n, t.isNewDeclaration, i);
    }
    SnapshotDefaultGlobals() {
      this._defaultGlobalVariables = new Map(this._globalVariables);
    }
    RetainListOriginsForAssignment(t, n) {
      let a = tt(t, Et),
        i = tt(n, Et);
      a.value &&
        i.value &&
        i.value.Count == 0 &&
        i.value.SetInitialOriginNames(a.value.originNames);
    }
    SetGlobal(t, n) {
      let a = null;
      if (
        (this.patch === null && (a = Oe(this._globalVariables, t, null)),
        this.patch !== null &&
          ((a = this.patch.TryGetGlobal(t, null)),
          a.exists || (a = Oe(this._globalVariables, t, null))),
        Et.RetainListOriginsForAssignment(a.result, n),
        t === null)
      )
        return C("variableName");
      if (
        (this.patch !== null
          ? this.patch.SetGlobal(t, n)
          : this._globalVariables.set(t, n),
        this.variableChangedEvent !== null && a !== null && n !== a.result)
      )
        if (this._batchObservingVariableChanges) {
          if (this._changedVariablesForBatchObs === null)
            return C("this._changedVariablesForBatchObs");
          this.patch !== null
            ? this.patch.AddChangedVariable(t)
            : this._changedVariablesForBatchObs !== null &&
              this._changedVariablesForBatchObs.add(t);
        } else this.variableChangedEvent(t, n);
    }
    ResolveVariablePointer(t) {
      let n = t.contextIndex;
      n == -1 && (n = this.GetContextIndexOfVariableNamed(t.variableName));
      let a = _(this.GetRawVariableWithName(t.variableName, n), tn);
      return a != null ? a : new tn(t.variableName, n);
    }
    GetContextIndexOfVariableNamed(t) {
      return this.GlobalVariableExistsWithName(t)
        ? 0
        : this._callStack.currentElementIndex;
    }
    ObserveVariableChange(t) {
      this.variableChangedEventCallbacks.push(t);
    }
  };
  Tr.dontSaveDefaultValues = !0;
  var Za = class {
      constructor(t) {
        ((this.seed = t % 2147483647),
          this.seed <= 0 && (this.seed += 2147483646));
      }
      next() {
        return (this.seed = (48271 * this.seed) % 2147483647);
      }
      nextFloat() {
        return (this.next() - 1) / 2147483646;
      }
    },
    Es = class {
      get globals() {
        return this._globals;
      }
      get changedVariables() {
        return this._changedVariables;
      }
      get visitCounts() {
        return this._visitCounts;
      }
      get turnIndices() {
        return this._turnIndices;
      }
      constructor() {
        if (
          ((this._changedVariables = new Set()),
          (this._visitCounts = new Map()),
          (this._turnIndices = new Map()),
          arguments.length === 1 && arguments[0] !== null)
        ) {
          let t = arguments[0];
          ((this._globals = new Map(t._globals)),
            (this._changedVariables = new Set(t._changedVariables)),
            (this._visitCounts = new Map(t._visitCounts)),
            (this._turnIndices = new Map(t._turnIndices)));
        } else
          ((this._globals = new Map()),
            (this._changedVariables = new Set()),
            (this._visitCounts = new Map()),
            (this._turnIndices = new Map()));
      }
      TryGetGlobal(t, n) {
        return t !== null && this._globals.has(t)
          ? { result: this._globals.get(t), exists: !0 }
          : { result: n, exists: !1 };
      }
      SetGlobal(t, n) {
        this._globals.set(t, n);
      }
      AddChangedVariable(t) {
        return this._changedVariables.add(t);
      }
      TryGetVisitCount(t, n) {
        return this._visitCounts.has(t)
          ? { result: this._visitCounts.get(t), exists: !0 }
          : { result: n, exists: !1 };
      }
      SetVisitCount(t, n) {
        this._visitCounts.set(t, n);
      }
      SetTurnIndex(t, n) {
        this._turnIndices.set(t, n);
      }
      TryGetTurnIndex(t, n) {
        return this._turnIndices.has(t)
          ? { result: this._turnIndices.get(t), exists: !0 }
          : { result: n, exists: !1 };
      }
    },
    Fn = class e {
      static TextToDictionary(t) {
        return new e.Reader(t).ToDictionary();
      }
      static TextToArray(t) {
        return new e.Reader(t).ToArray();
      }
    };
  (function (e) {
    e.Reader = class {
      constructor(n) {
        if (JSON.parse("0", (a, i, l) => l != null)) {
          let a = (i, l, r) =>
            Number.isInteger(l) && r.source.endsWith(".0") ? r.source + "f" : l;
          this._rootObject = JSON.parse(n, a);
        } else {
          let a = n.replace(/(,\s*)([0-9]+\.[0]+)([,]*)/g, '$1"$2f"$3');
          this._rootObject = JSON.parse(a);
        }
      }
      ToDictionary() {
        return this._rootObject;
      }
      ToArray() {
        return this._rootObject;
      }
    };
    class t {
      constructor() {
        ((this._currentPropertyName = null),
          (this._currentString = null),
          (this._stateStack = []),
          (this._collectionStack = []),
          (this._propertyNameStack = []),
          (this._jsonObject = null));
      }
      WriteObject(a) {
        (this.WriteObjectStart(), a(this), this.WriteObjectEnd());
      }
      WriteObjectStart() {
        this.StartNewObject(!0);
        let a = {};
        if (this.state === e.Writer.State.Property) {
          (this.Assert(this.currentCollection !== null),
            this.Assert(this.currentPropertyName !== null));
          let i = this._propertyNameStack.pop();
          ((this.currentCollection[i] = a), this._collectionStack.push(a));
        } else
          this.state === e.Writer.State.Array
            ? (this.Assert(this.currentCollection !== null),
              this.currentCollection.push(a),
              this._collectionStack.push(a))
            : (this.Assert(this.state === e.Writer.State.None),
              (this._jsonObject = a),
              this._collectionStack.push(a));
        this._stateStack.push(new e.Writer.StateElement(e.Writer.State.Object));
      }
      WriteObjectEnd() {
        (this.Assert(this.state === e.Writer.State.Object),
          this._collectionStack.pop(),
          this._stateStack.pop());
      }
      WriteProperty(a, i) {
        if ((this.WritePropertyStart(a), arguments[1] instanceof Function))
          (0, arguments[1])(this);
        else {
          let l = arguments[1];
          this.Write(l);
        }
        this.WritePropertyEnd();
      }
      WriteIntProperty(a, i) {
        (this.WritePropertyStart(a), this.WriteInt(i), this.WritePropertyEnd());
      }
      WriteFloatProperty(a, i) {
        (this.WritePropertyStart(a),
          this.WriteFloat(i),
          this.WritePropertyEnd());
      }
      WritePropertyStart(a) {
        (this.Assert(this.state === e.Writer.State.Object),
          this._propertyNameStack.push(a),
          this.IncrementChildCount(),
          this._stateStack.push(
            new e.Writer.StateElement(e.Writer.State.Property),
          ));
      }
      WritePropertyEnd() {
        (this.Assert(this.state === e.Writer.State.Property),
          this.Assert(this.childCount === 1),
          this._stateStack.pop());
      }
      WritePropertyNameStart() {
        (this.Assert(this.state === e.Writer.State.Object),
          this.IncrementChildCount(),
          (this._currentPropertyName = ""),
          this._stateStack.push(
            new e.Writer.StateElement(e.Writer.State.Property),
          ),
          this._stateStack.push(
            new e.Writer.StateElement(e.Writer.State.PropertyName),
          ));
      }
      WritePropertyNameEnd() {
        (this.Assert(this.state === e.Writer.State.PropertyName),
          this.Assert(this._currentPropertyName !== null),
          this._propertyNameStack.push(this._currentPropertyName),
          (this._currentPropertyName = null),
          this._stateStack.pop());
      }
      WritePropertyNameInner(a) {
        (this.Assert(this.state === e.Writer.State.PropertyName),
          this.Assert(this._currentPropertyName !== null),
          (this._currentPropertyName += a));
      }
      WriteArrayStart() {
        this.StartNewObject(!0);
        let a = [];
        if (this.state === e.Writer.State.Property) {
          (this.Assert(this.currentCollection !== null),
            this.Assert(this.currentPropertyName !== null));
          let i = this._propertyNameStack.pop();
          ((this.currentCollection[i] = a), this._collectionStack.push(a));
        } else
          this.state === e.Writer.State.Array
            ? (this.Assert(this.currentCollection !== null),
              this.currentCollection.push(a),
              this._collectionStack.push(a))
            : (this.Assert(this.state === e.Writer.State.None),
              (this._jsonObject = a),
              this._collectionStack.push(a));
        this._stateStack.push(new e.Writer.StateElement(e.Writer.State.Array));
      }
      WriteArrayEnd() {
        (this.Assert(this.state === e.Writer.State.Array),
          this._collectionStack.pop(),
          this._stateStack.pop());
      }
      Write(a) {
        a !== null
          ? (this.StartNewObject(!1), this._addToCurrentObject(a))
          : console.error("Warning: trying to write a null value");
      }
      WriteBool(a) {
        a !== null && (this.StartNewObject(!1), this._addToCurrentObject(a));
      }
      WriteInt(a) {
        a !== null &&
          (this.StartNewObject(!1), this._addToCurrentObject(Math.floor(a)));
      }
      WriteFloat(a) {
        a !== null &&
          (this.StartNewObject(!1),
          a == Number.POSITIVE_INFINITY
            ? this._addToCurrentObject(34e37)
            : a == Number.NEGATIVE_INFINITY
              ? this._addToCurrentObject(-34e37)
              : isNaN(a)
                ? this._addToCurrentObject(0)
                : this._addToCurrentObject(a));
      }
      WriteNull() {
        (this.StartNewObject(!1), this._addToCurrentObject(null));
      }
      WriteStringStart() {
        (this.StartNewObject(!1),
          (this._currentString = ""),
          this._stateStack.push(
            new e.Writer.StateElement(e.Writer.State.String),
          ));
      }
      WriteStringEnd() {
        (this.Assert(this.state == e.Writer.State.String),
          this._stateStack.pop(),
          this._addToCurrentObject(this._currentString),
          (this._currentString = null));
      }
      WriteStringInner(a) {
        (this.Assert(this.state === e.Writer.State.String),
          a !== null
            ? (this._currentString += a)
            : console.error("Warning: trying to write a null string"));
      }
      toString() {
        return this._jsonObject === null
          ? ""
          : JSON.stringify(this._jsonObject);
      }
      StartNewObject(a) {
        (a
          ? this.Assert(
              this.state === e.Writer.State.None ||
                this.state === e.Writer.State.Property ||
                this.state === e.Writer.State.Array,
            )
          : this.Assert(
              this.state === e.Writer.State.Property ||
                this.state === e.Writer.State.Array,
            ),
          this.state === e.Writer.State.Property &&
            this.Assert(this.childCount === 0),
          (this.state !== e.Writer.State.Array &&
            this.state !== e.Writer.State.Property) ||
            this.IncrementChildCount());
      }
      get state() {
        return this._stateStack.length > 0
          ? this._stateStack[this._stateStack.length - 1].type
          : e.Writer.State.None;
      }
      get childCount() {
        return this._stateStack.length > 0
          ? this._stateStack[this._stateStack.length - 1].childCount
          : 0;
      }
      get currentCollection() {
        return this._collectionStack.length > 0
          ? this._collectionStack[this._collectionStack.length - 1]
          : null;
      }
      get currentPropertyName() {
        return this._propertyNameStack.length > 0
          ? this._propertyNameStack[this._propertyNameStack.length - 1]
          : null;
      }
      IncrementChildCount() {
        this.Assert(this._stateStack.length > 0);
        let a = this._stateStack.pop();
        (a.childCount++, this._stateStack.push(a));
      }
      Assert(a) {
        if (!a) throw Error("Assert failed while writing JSON");
      }
      _addToCurrentObject(a) {
        (this.Assert(this.currentCollection !== null),
          this.state === e.Writer.State.Array
            ? (this.Assert(Array.isArray(this.currentCollection)),
              this.currentCollection.push(a))
            : this.state === e.Writer.State.Property &&
              (this.Assert(!Array.isArray(this.currentCollection)),
              this.Assert(this.currentPropertyName !== null),
              (this.currentCollection[this.currentPropertyName] = a),
              this._propertyNameStack.pop()));
      }
    }
    ((e.Writer = t),
      (function (n) {
        var a;
        (((a = n.State || (n.State = {}))[(a.None = 0)] = "None"),
          (a[(a.Object = 1)] = "Object"),
          (a[(a.Array = 2)] = "Array"),
          (a[(a.Property = 3)] = "Property"),
          (a[(a.PropertyName = 4)] = "PropertyName"),
          (a[(a.String = 5)] = "String"),
          (n.StateElement = class {
            constructor(i) {
              ((this.type = e.Writer.State.None),
                (this.childCount = 0),
                (this.type = i));
            }
          }));
      })((t = e.Writer || (e.Writer = {}))));
  })(Fn || (Fn = {}));
  var Ia = class {
      constructor() {
        let t = arguments[0],
          n = arguments[1];
        if (((this.name = t), (this.callStack = new Aa(n)), arguments[2])) {
          let a = arguments[2];
          (this.callStack.SetJsonToken(a.callstack, n),
            (this.outputStream = wt.JArrayToRuntimeObjList(a.outputStream)),
            (this.currentChoices = wt.JArrayToRuntimeObjList(
              a.currentChoices,
            )));
          let i = a.choiceThreads;
          i !== void 0 && this.LoadFlowChoiceThreads(i, n);
        } else ((this.outputStream = []), (this.currentChoices = []));
      }
      WriteJson(t) {
        (t.WriteObjectStart(),
          t.WriteProperty("callstack", (a) => this.callStack.WriteJson(a)),
          t.WriteProperty("outputStream", (a) =>
            wt.WriteListRuntimeObjs(a, this.outputStream),
          ));
        let n = !1;
        for (let a of this.currentChoices) {
          if (a.threadAtGeneration === null) return C("c.threadAtGeneration");
          ((a.originalThreadIndex = a.threadAtGeneration.threadIndex),
            this.callStack.ThreadWithIndex(a.originalThreadIndex) === null &&
              (n ||
                ((n = !0),
                t.WritePropertyStart("choiceThreads"),
                t.WriteObjectStart()),
              t.WritePropertyStart(a.originalThreadIndex),
              a.threadAtGeneration.WriteJson(t),
              t.WritePropertyEnd()));
        }
        (n && (t.WriteObjectEnd(), t.WritePropertyEnd()),
          t.WriteProperty("currentChoices", (a) => {
            a.WriteArrayStart();
            for (let i of this.currentChoices) wt.WriteChoice(a, i);
            a.WriteArrayEnd();
          }),
          t.WriteObjectEnd());
      }
      LoadFlowChoiceThreads(t, n) {
        for (let a of this.currentChoices) {
          let i = this.callStack.ThreadWithIndex(a.originalThreadIndex);
          if (i !== null) a.threadAtGeneration = i.Copy();
          else {
            let l = t[`${a.originalThreadIndex}`];
            a.threadAtGeneration = new Aa.Thread(l, n);
          }
        }
      }
    },
    As = class e {
      ToJson() {
        let t = new Fn.Writer();
        return (this.WriteJson(t), t.toString());
      }
      toJson() {
        let t = arguments.length > 0 && arguments[0] !== void 0 && arguments[0];
        return this.ToJson(t);
      }
      LoadJson(t) {
        let n = Fn.TextToDictionary(t);
        (this.LoadJsonObj(n),
          this.onDidLoadState !== null && this.onDidLoadState());
      }
      VisitCountAtPathString(t) {
        let n;
        if (this._patch !== null) {
          let a = this.story.ContentAtPath(new ut(t)).container;
          if (a === null) throw new Error("Content at path not found: " + t);
          if (((n = this._patch.TryGetVisitCount(a, 0)), n.exists))
            return n.result;
        }
        return ((n = Oe(this._visitCounts, t, null)), n.exists ? n.result : 0);
      }
      VisitCountForContainer(t) {
        if (t === null) return C("container");
        if (!t.visitsShouldBeCounted)
          return (
            this.story.Error(
              "Read count for target (" +
                t.name +
                " - on " +
                t.debugMetadata +
                ") unknown. The story may need to be compiled with countAllVisits flag (-c).",
            ),
            0
          );
        if (this._patch !== null) {
          let i = this._patch.TryGetVisitCount(t, 0);
          if (i.exists) return i.result;
        }
        let n = t.path.toString(),
          a = Oe(this._visitCounts, n, null);
        return a.exists ? a.result : 0;
      }
      IncrementVisitCountForContainer(t) {
        if (this._patch !== null) {
          let i = this.VisitCountForContainer(t);
          return (i++, void this._patch.SetVisitCount(t, i));
        }
        let n = t.path.toString(),
          a = Oe(this._visitCounts, n, null);
        a.exists
          ? this._visitCounts.set(n, a.result + 1)
          : this._visitCounts.set(n, 1);
      }
      RecordTurnIndexVisitToContainer(t) {
        if (this._patch !== null)
          return void this._patch.SetTurnIndex(t, this.currentTurnIndex);
        let n = t.path.toString();
        this._turnIndices.set(n, this.currentTurnIndex);
      }
      TurnsSinceForContainer(t) {
        if (
          (t.turnIndexShouldBeCounted ||
            this.story.Error(
              "TURNS_SINCE() for target (" +
                t.name +
                " - on " +
                t.debugMetadata +
                ") unknown. The story may need to be compiled with countAllVisits flag (-c).",
            ),
          this._patch !== null)
        ) {
          let i = this._patch.TryGetTurnIndex(t, 0);
          if (i.exists) return this.currentTurnIndex - i.result;
        }
        let n = t.path.toString(),
          a = Oe(this._turnIndices, n, 0);
        return a.exists ? this.currentTurnIndex - a.result : -1;
      }
      get callstackDepth() {
        return this.callStack.depth;
      }
      get outputStream() {
        return this._currentFlow.outputStream;
      }
      get currentChoices() {
        return this.canContinue ? [] : this._currentFlow.currentChoices;
      }
      get generatedChoices() {
        return this._currentFlow.currentChoices;
      }
      get currentErrors() {
        return this._currentErrors;
      }
      get currentWarnings() {
        return this._currentWarnings;
      }
      get variablesState() {
        return this._variablesState;
      }
      set variablesState(t) {
        this._variablesState = t;
      }
      get callStack() {
        return this._currentFlow.callStack;
      }
      get evaluationStack() {
        return this._evaluationStack;
      }
      get currentTurnIndex() {
        return this._currentTurnIndex;
      }
      set currentTurnIndex(t) {
        this._currentTurnIndex = t;
      }
      get currentPathString() {
        let t = this.currentPointer;
        return t.isNull
          ? null
          : t.path === null
            ? C("pointer.path")
            : t.path.toString();
      }
      get previousPathString() {
        let t = this.previousPointer;
        return t.isNull
          ? null
          : t.path === null
            ? C("previousPointer.path")
            : t.path.toString();
      }
      get currentPointer() {
        return this.callStack.currentElement.currentPointer.copy();
      }
      set currentPointer(t) {
        this.callStack.currentElement.currentPointer = t.copy();
      }
      get previousPointer() {
        return this.callStack.currentThread.previousPointer.copy();
      }
      set previousPointer(t) {
        this.callStack.currentThread.previousPointer = t.copy();
      }
      get canContinue() {
        return !this.currentPointer.isNull && !this.hasError;
      }
      get hasError() {
        return this.currentErrors != null && this.currentErrors.length > 0;
      }
      get hasWarning() {
        return this.currentWarnings != null && this.currentWarnings.length > 0;
      }
      get currentText() {
        if (this._outputStreamTextDirty) {
          let t = new ee(),
            n = !1;
          for (let a of this.outputStream) {
            let i = _(a, I);
            if (n || i === null) {
              let l = _(a, A);
              l !== null &&
                (l.commandType == A.CommandType.BeginTag
                  ? (n = !0)
                  : l.commandType == A.CommandType.EndTag && (n = !1));
            } else t.Append(i.value);
          }
          ((this._currentText = this.CleanOutputWhitespace(t.toString())),
            (this._outputStreamTextDirty = !1));
        }
        return this._currentText;
      }
      CleanOutputWhitespace(t) {
        let n = new ee(),
          a = -1,
          i = 0;
        for (let l = 0; l < t.length; l++) {
          let r = t.charAt(l),
            u = r == " " || r == "	";
          (u && a == -1 && (a = l),
            u ||
              (r !=
                `
` &&
                a > 0 &&
                a != i &&
                n.Append(" "),
              (a = -1)),
            r ==
              `
` && (i = l + 1),
            u || n.Append(r));
        }
        return n.toString();
      }
      get currentTags() {
        if (this._outputStreamTagsDirty) {
          this._currentTags = [];
          let t = !1,
            n = new ee();
          for (let a of this.outputStream) {
            let i = _(a, A);
            if (i != null) {
              if (i.commandType == A.CommandType.BeginTag) {
                if (t && n.Length > 0) {
                  let l = this.CleanOutputWhitespace(n.toString());
                  (this._currentTags.push(l), n.Clear());
                }
                t = !0;
              } else if (i.commandType == A.CommandType.EndTag) {
                if (n.Length > 0) {
                  let l = this.CleanOutputWhitespace(n.toString());
                  (this._currentTags.push(l), n.Clear());
                }
                t = !1;
              }
            } else if (t) {
              let l = _(a, I);
              l !== null && n.Append(l.value);
            } else {
              let l = _(a, gn);
              l != null &&
                l.text != null &&
                l.text.length > 0 &&
                this._currentTags.push(l.text);
            }
          }
          if (n.Length > 0) {
            let a = this.CleanOutputWhitespace(n.toString());
            (this._currentTags.push(a), n.Clear());
          }
          this._outputStreamTagsDirty = !1;
        }
        return this._currentTags;
      }
      get currentFlowName() {
        return this._currentFlow.name;
      }
      get currentFlowIsDefaultFlow() {
        return this._currentFlow.name == this.kDefaultFlowName;
      }
      get aliveFlowNames() {
        if (this._aliveFlowNamesDirty) {
          if (((this._aliveFlowNames = []), this._namedFlows != null))
            for (let t of this._namedFlows.keys())
              t != this.kDefaultFlowName && this._aliveFlowNames.push(t);
          this._aliveFlowNamesDirty = !1;
        }
        return this._aliveFlowNames;
      }
      get inExpressionEvaluation() {
        return this.callStack.currentElement.inExpressionEvaluation;
      }
      set inExpressionEvaluation(t) {
        this.callStack.currentElement.inExpressionEvaluation = t;
      }
      constructor(t) {
        ((this.kInkSaveStateVersion = 10),
          (this.kMinCompatibleLoadVersion = 8),
          (this.onDidLoadState = null),
          (this._currentErrors = null),
          (this._currentWarnings = null),
          (this.divertedPointer = bt.Null),
          (this._currentTurnIndex = 0),
          (this.storySeed = 0),
          (this.previousRandom = 0),
          (this.didSafeExit = !1),
          (this._currentText = null),
          (this._currentTags = null),
          (this._outputStreamTextDirty = !0),
          (this._outputStreamTagsDirty = !0),
          (this._patch = null),
          (this._aliveFlowNames = null),
          (this._namedFlows = null),
          (this.kDefaultFlowName = "DEFAULT_FLOW"),
          (this._aliveFlowNamesDirty = !0),
          (this.story = t),
          (this._currentFlow = new Ia(this.kDefaultFlowName, t)),
          this.OutputStreamDirty(),
          (this._aliveFlowNamesDirty = !0),
          (this._evaluationStack = []),
          (this._variablesState = new Tr(this.callStack, t.listDefinitions)),
          (this._visitCounts = new Map()),
          (this._turnIndices = new Map()),
          (this.currentTurnIndex = -1));
        let n = new Date().getTime();
        ((this.storySeed = new Za(n).next() % 100),
          (this.previousRandom = 0),
          this.GoToStart());
      }
      GoToStart() {
        this.callStack.currentElement.currentPointer = bt.StartOf(
          this.story.mainContentContainer,
        );
      }
      SwitchFlow_Internal(t) {
        if (t === null)
          throw new Error("Must pass a non-null string to Story.SwitchFlow");
        if (
          (this._namedFlows === null &&
            ((this._namedFlows = new Map()),
            this._namedFlows.set(this.kDefaultFlowName, this._currentFlow)),
          t === this._currentFlow.name)
        )
          return;
        let n,
          a = Oe(this._namedFlows, t, null);
        (a.exists
          ? (n = a.result)
          : ((n = new Ia(t, this.story)),
            this._namedFlows.set(t, n),
            (this._aliveFlowNamesDirty = !0)),
          (this._currentFlow = n),
          (this.variablesState.callStack = this._currentFlow.callStack),
          this.OutputStreamDirty());
      }
      SwitchToDefaultFlow_Internal() {
        this._namedFlows !== null &&
          this.SwitchFlow_Internal(this.kDefaultFlowName);
      }
      RemoveFlow_Internal(t) {
        if (t === null)
          throw new Error("Must pass a non-null string to Story.DestroyFlow");
        if (t === this.kDefaultFlowName)
          throw new Error("Cannot destroy default flow");
        if (
          (this._currentFlow.name === t && this.SwitchToDefaultFlow_Internal(),
          this._namedFlows === null)
        )
          return C("this._namedFlows");
        (this._namedFlows.delete(t), (this._aliveFlowNamesDirty = !0));
      }
      CopyAndStartPatching(t) {
        let n = new e(this.story);
        if (
          ((n._patch = new Es(this._patch)),
          (n._currentFlow.name = this._currentFlow.name),
          (n._currentFlow.callStack = new Aa(this._currentFlow.callStack)),
          n._currentFlow.outputStream.push(...this._currentFlow.outputStream),
          n.OutputStreamDirty(),
          t)
        )
          for (let a of this._currentFlow.currentChoices)
            n._currentFlow.currentChoices.push(a.Clone());
        else
          n._currentFlow.currentChoices.push(
            ...this._currentFlow.currentChoices,
          );
        if (this._namedFlows !== null) {
          n._namedFlows = new Map();
          for (let [a, i] of this._namedFlows)
            (n._namedFlows.set(a, i), (n._aliveFlowNamesDirty = !0));
          n._namedFlows.set(this._currentFlow.name, n._currentFlow);
        }
        return (
          this.hasError &&
            ((n._currentErrors = []),
            n._currentErrors.push(...(this.currentErrors || []))),
          this.hasWarning &&
            ((n._currentWarnings = []),
            n._currentWarnings.push(...(this.currentWarnings || []))),
          (n.variablesState = this.variablesState),
          (n.variablesState.callStack = n.callStack),
          (n.variablesState.patch = n._patch),
          n.evaluationStack.push(...this.evaluationStack),
          this.divertedPointer.isNull ||
            (n.divertedPointer = this.divertedPointer.copy()),
          (n.previousPointer = this.previousPointer.copy()),
          (n._visitCounts = this._visitCounts),
          (n._turnIndices = this._turnIndices),
          (n.currentTurnIndex = this.currentTurnIndex),
          (n.storySeed = this.storySeed),
          (n.previousRandom = this.previousRandom),
          (n.didSafeExit = this.didSafeExit),
          n
        );
      }
      RestoreAfterPatch() {
        ((this.variablesState.callStack = this.callStack),
          (this.variablesState.patch = this._patch));
      }
      ApplyAnyPatch() {
        if (this._patch !== null) {
          this.variablesState.ApplyPatch();
          for (let [t, n] of this._patch.visitCounts)
            this.ApplyCountChanges(t, n, !0);
          for (let [t, n] of this._patch.turnIndices)
            this.ApplyCountChanges(t, n, !1);
          this._patch = null;
        }
      }
      ApplyCountChanges(t, n, a) {
        (a ? this._visitCounts : this._turnIndices).set(t.path.toString(), n);
      }
      WriteJson(t) {
        if (
          (t.WriteObjectStart(),
          t.WritePropertyStart("flows"),
          t.WriteObjectStart(),
          this._namedFlows !== null)
        )
          for (let [n, a] of this._namedFlows)
            t.WriteProperty(n, (i) => a.WriteJson(i));
        else
          t.WriteProperty(this._currentFlow.name, (n) =>
            this._currentFlow.WriteJson(n),
          );
        if (
          (t.WriteObjectEnd(),
          t.WritePropertyEnd(),
          t.WriteProperty("currentFlowName", this._currentFlow.name),
          t.WriteProperty("variablesState", (n) =>
            this.variablesState.WriteJson(n),
          ),
          t.WriteProperty("evalStack", (n) =>
            wt.WriteListRuntimeObjs(n, this.evaluationStack),
          ),
          !this.divertedPointer.isNull)
        ) {
          if (this.divertedPointer.path === null) return C("divertedPointer");
          t.WriteProperty(
            "currentDivertTarget",
            this.divertedPointer.path.componentsString,
          );
        }
        (t.WriteProperty("visitCounts", (n) =>
          wt.WriteIntDictionary(n, this._visitCounts),
        ),
          t.WriteProperty("turnIndices", (n) =>
            wt.WriteIntDictionary(n, this._turnIndices),
          ),
          t.WriteIntProperty("turnIdx", this.currentTurnIndex),
          t.WriteIntProperty("storySeed", this.storySeed),
          t.WriteIntProperty("previousRandom", this.previousRandom),
          t.WriteIntProperty("inkSaveVersion", this.kInkSaveStateVersion),
          t.WriteIntProperty("inkFormatVersion", yn.inkVersionCurrent),
          t.WriteObjectEnd());
      }
      LoadJsonObj(t) {
        let n = t,
          a = n.inkSaveVersion;
        if (a == null)
          throw new Error("ink save format incorrect, can't load.");
        if (parseInt(a) < this.kMinCompatibleLoadVersion)
          throw new Error(
            "Ink save format isn't compatible with the current version (saw '" +
              a +
              "', but minimum is " +
              this.kMinCompatibleLoadVersion +
              "), so can't load.",
          );
        let i = n.flows;
        if (i != null) {
          let r = i;
          Object.keys(r).length === 1
            ? (this._namedFlows = null)
            : this._namedFlows === null
              ? (this._namedFlows = new Map())
              : this._namedFlows.clear();
          let u = Object.entries(r);
          for (let [s, o] of u) {
            let c = s,
              h = o,
              f = new Ia(c, this.story, h);
            if (Object.keys(r).length === 1)
              this._currentFlow = new Ia(c, this.story, h);
            else {
              if (this._namedFlows === null) return C("this._namedFlows");
              this._namedFlows.set(c, f);
            }
          }
          if (this._namedFlows != null && this._namedFlows.size > 1) {
            let s = n.currentFlowName;
            this._currentFlow = this._namedFlows.get(s);
          }
        } else {
          ((this._namedFlows = null),
            (this._currentFlow.name = this.kDefaultFlowName),
            this._currentFlow.callStack.SetJsonToken(
              n.callstackThreads,
              this.story,
            ),
            (this._currentFlow.outputStream = wt.JArrayToRuntimeObjList(
              n.outputStream,
            )),
            (this._currentFlow.currentChoices = wt.JArrayToRuntimeObjList(
              n.currentChoices,
            )));
          let r = n.choiceThreads;
          this._currentFlow.LoadFlowChoiceThreads(r, this.story);
        }
        (this.OutputStreamDirty(),
          (this._aliveFlowNamesDirty = !0),
          this.variablesState.SetJsonToken(n.variablesState),
          (this.variablesState.callStack = this._currentFlow.callStack),
          (this._evaluationStack = wt.JArrayToRuntimeObjList(n.evalStack)));
        let l = n.currentDivertTarget;
        if (l != null) {
          let r = new ut(l.toString());
          this.divertedPointer = this.story.PointerAtPath(r);
        }
        ((this._visitCounts = wt.JObjectToIntDictionary(n.visitCounts)),
          (this._turnIndices = wt.JObjectToIntDictionary(n.turnIndices)),
          (this.currentTurnIndex = parseInt(n.turnIdx)),
          (this.storySeed = parseInt(n.storySeed)),
          (this.previousRandom = parseInt(n.previousRandom)));
      }
      ResetErrors() {
        ((this._currentErrors = null), (this._currentWarnings = null));
      }
      ResetOutput() {
        let t =
          arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : null;
        ((this.outputStream.length = 0),
          t !== null && this.outputStream.push(...t),
          this.OutputStreamDirty());
      }
      PushToOutputStream(t) {
        let n = _(t, I);
        if (n !== null) {
          let a = this.TrySplittingHeadTailWhitespace(n);
          if (a !== null) {
            for (let i of a) this.PushToOutputStreamIndividual(i);
            return void this.OutputStreamDirty();
          }
        }
        (this.PushToOutputStreamIndividual(t), this.OutputStreamDirty());
      }
      PopFromOutputStream(t) {
        (this.outputStream.splice(this.outputStream.length - t, t),
          this.OutputStreamDirty());
      }
      TrySplittingHeadTailWhitespace(t) {
        let n = t.value;
        if (n === null) return C("single.value");
        let a = -1,
          i = -1;
        for (let c = 0; c < n.length; c++) {
          let h = n[c];
          if (
            h !=
            `
`
          ) {
            if (h == " " || h == "	") continue;
            break;
          }
          (a == -1 && (a = c), (i = c));
        }
        let l = -1,
          r = -1;
        for (let c = n.length - 1; c >= 0; c--) {
          let h = n[c];
          if (
            h !=
            `
`
          ) {
            if (h == " " || h == "	") continue;
            break;
          }
          (l == -1 && (l = c), (r = c));
        }
        if (a == -1 && l == -1) return null;
        let u = [],
          s = 0,
          o = n.length;
        if (a != -1) {
          if (a > 0) {
            let c = new I(n.substring(0, a));
            u.push(c);
          }
          (u.push(
            new I(`
`),
          ),
            (s = i + 1));
        }
        if ((l != -1 && (o = r), o > s)) {
          let c = n.substring(s, o);
          u.push(new I(c));
        }
        if (
          l != -1 &&
          r > i &&
          (u.push(
            new I(`
`),
          ),
          l < n.length - 1)
        ) {
          let c = n.length - l - 1,
            h = new I(n.substring(l + 1, l + 1 + c));
          u.push(h);
        }
        return u;
      }
      PushToOutputStreamIndividual(t) {
        let n = _(t, Ea),
          a = _(t, I),
          i = !0;
        if (n) (this.TrimNewlinesFromOutputStream(), (i = !0));
        else if (a) {
          let l = -1,
            r = this.callStack.currentElement;
          r.type == J.Function && (l = r.functionStartInOutputStream);
          let u = -1;
          for (let o = this.outputStream.length - 1; o >= 0; o--) {
            let c = this.outputStream[o],
              h = c instanceof A ? c : null;
            if ((c instanceof Ea ? c : null) != null) {
              u = o;
              break;
            }
            if (h != null && h.commandType == A.CommandType.BeginString) {
              o >= l && (l = -1);
              break;
            }
          }
          let s = -1;
          if (
            ((s = u != -1 && l != -1 ? Math.min(l, u) : u != -1 ? u : l),
            s != -1)
          ) {
            if (a.isNewline) i = !1;
            else if (
              a.isNonWhitespace &&
              (u > -1 && this.RemoveExistingGlue(), l > -1)
            ) {
              let o = this.callStack.elements;
              for (let c = o.length - 1; c >= 0; c--) {
                let h = o[c];
                if (h.type != J.Function) break;
                h.functionStartInOutputStream = -1;
              }
            }
          } else
            a.isNewline &&
              ((!this.outputStreamEndsInNewline &&
                this.outputStreamContainsContent) ||
                (i = !1));
        }
        if (i) {
          if (t === null) return C("obj");
          (this.outputStream.push(t), this.OutputStreamDirty());
        }
      }
      TrimNewlinesFromOutputStream() {
        let t = -1,
          n = this.outputStream.length - 1;
        for (; n >= 0;) {
          let a = this.outputStream[n],
            i = _(a, A),
            l = _(a, I);
          if (i != null || (l != null && l.isNonWhitespace)) break;
          (l != null && l.isNewline && (t = n), n--);
        }
        if (t >= 0)
          for (n = t; n < this.outputStream.length;)
            _(this.outputStream[n], I) ? this.outputStream.splice(n, 1) : n++;
        this.OutputStreamDirty();
      }
      RemoveExistingGlue() {
        for (let t = this.outputStream.length - 1; t >= 0; t--) {
          let n = this.outputStream[t];
          if (n instanceof Ea) this.outputStream.splice(t, 1);
          else if (n instanceof A) break;
        }
        this.OutputStreamDirty();
      }
      get outputStreamEndsInNewline() {
        if (this.outputStream.length > 0)
          for (
            let t = this.outputStream.length - 1;
            t >= 0 && !(this.outputStream[t] instanceof A);
            t--
          ) {
            let n = this.outputStream[t];
            if (n instanceof I) {
              if (n.isNewline) return !0;
              if (n.isNonWhitespace) break;
            }
          }
        return !1;
      }
      get outputStreamContainsContent() {
        for (let t of this.outputStream) if (t instanceof I) return !0;
        return !1;
      }
      get inStringEvaluation() {
        for (let t = this.outputStream.length - 1; t >= 0; t--) {
          let n = _(this.outputStream[t], A);
          if (n instanceof A && n.commandType == A.CommandType.BeginString)
            return !0;
        }
        return !1;
      }
      PushEvaluationStack(t) {
        let n = _(t, Et);
        if (n) {
          let a = n.value;
          if (a === null) return C("rawList");
          if (a.originNames != null) {
            (a.origins || (a.origins = []), (a.origins.length = 0));
            for (let i of a.originNames) {
              if (this.story.listDefinitions === null)
                return C("StoryState.story.listDefinitions");
              let l = this.story.listDefinitions.TryListGetDefinition(i, null);
              if (l.result === null) return C("StoryState def.result");
              a.origins.indexOf(l.result) < 0 && a.origins.push(l.result);
            }
          }
        }
        if (t === null) return C("obj");
        this.evaluationStack.push(t);
      }
      PopEvaluationStack(t) {
        if (t === void 0) return vs(this.evaluationStack.pop());
        if (t > this.evaluationStack.length)
          throw new Error("trying to pop too many objects");
        return vs(
          this.evaluationStack.splice(this.evaluationStack.length - t, t),
        );
      }
      PeekEvaluationStack() {
        return this.evaluationStack[this.evaluationStack.length - 1];
      }
      ForceEnd() {
        (this.callStack.Reset(),
          (this._currentFlow.currentChoices.length = 0),
          (this.currentPointer = bt.Null),
          (this.previousPointer = bt.Null),
          (this.didSafeExit = !0));
      }
      TrimWhitespaceFromFunctionEnd() {
        pn.Assert(this.callStack.currentElement.type == J.Function);
        let t = this.callStack.currentElement.functionStartInOutputStream;
        t == -1 && (t = 0);
        for (let n = this.outputStream.length - 1; n >= t; n--) {
          let a = this.outputStream[n],
            i = _(a, I),
            l = _(a, A);
          if (i != null) {
            if (l || (!i.isNewline && !i.isInlineWhitespace)) break;
            (this.outputStream.splice(n, 1), this.OutputStreamDirty());
          }
        }
      }
      PopCallStack() {
        let t =
          arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : null;
        (this.callStack.currentElement.type == J.Function &&
          this.TrimWhitespaceFromFunctionEnd(),
          this.callStack.Pop(t));
      }
      SetChosenPath(t, n) {
        this._currentFlow.currentChoices.length = 0;
        let a = this.story.PointerAtPath(t);
        (a.isNull || a.index != -1 || (a.index = 0),
          (this.currentPointer = a),
          n && this.currentTurnIndex++);
      }
      StartFunctionEvaluationFromGame(t, n) {
        (this.callStack.Push(
          J.FunctionEvaluationFromGame,
          this.evaluationStack.length,
        ),
          (this.callStack.currentElement.currentPointer = bt.StartOf(t)),
          this.PassArgumentsToEvaluationStack(n));
      }
      PassArgumentsToEvaluationStack(t) {
        if (t !== null)
          for (let n = 0; n < t.length; n++) {
            if (!(
              typeof t[n] == "number" ||
              typeof t[n] == "string" ||
              typeof t[n] == "boolean" ||
              t[n] instanceof Ne
            ))
              throw new Error(
                "ink arguments when calling EvaluateFunction / ChoosePathStringWithParameters must benumber, string, bool or InkList. Argument was " +
                  (vs(t[n]) === null ? "null" : t[n].constructor.name),
              );
            this.PushEvaluationStack(Q.Create(t[n]));
          }
      }
      TryExitFunctionEvaluationFromGame() {
        return (
          this.callStack.currentElement.type == J.FunctionEvaluationFromGame &&
          ((this.currentPointer = bt.Null), (this.didSafeExit = !0), !0)
        );
      }
      CompleteFunctionEvaluationFromGame() {
        if (this.callStack.currentElement.type != J.FunctionEvaluationFromGame)
          throw new Error(
            "Expected external function evaluation to be complete. Stack trace: " +
              this.callStack.callStackTrace,
          );
        let t = this.callStack.currentElement.evaluationStackHeightWhenPushed,
          n = null;
        for (; this.evaluationStack.length > t;) {
          let a = this.PopEvaluationStack();
          n === null && (n = a);
        }
        if ((this.PopCallStack(J.FunctionEvaluationFromGame), n)) {
          if (n instanceof en) return null;
          let a = tt(n, Q);
          return a.valueType == R.DivertTarget
            ? "-> " + a.valueObject.toString()
            : a.valueObject;
        }
        return null;
      }
      AddError(t, n) {
        n
          ? (this._currentWarnings == null && (this._currentWarnings = []),
            this._currentWarnings.push(t))
          : (this._currentErrors == null && (this._currentErrors = []),
            this._currentErrors.push(t));
      }
      OutputStreamDirty() {
        ((this._outputStreamTextDirty = !0),
          (this._outputStreamTagsDirty = !0));
      }
    },
    _s = class {
      constructor() {
        this.startTime = void 0;
      }
      get ElapsedMilliseconds() {
        return this.startTime === void 0
          ? 0
          : new Date().getTime() - this.startTime;
      }
      Start() {
        this.startTime = new Date().getTime();
      }
      Stop() {
        this.startTime = void 0;
      }
    };
  ((function (e) {
    ((e[(e.Author = 0)] = "Author"),
      (e[(e.Warning = 1)] = "Warning"),
      (e[(e.Error = 2)] = "Error"));
  })(br || (br = {})),
    Number.isInteger ||
      (Number.isInteger = function (e) {
        return (
          typeof e == "number" &&
          isFinite(e) &&
          e > -9007199254740992 &&
          e < 9007199254740992 &&
          Math.floor(e) === e
        );
      }));
  var yn = class e extends At {
    get currentChoices() {
      let t = [];
      if (this._state === null) return C("this._state");
      for (let n of this._state.currentChoices)
        n.isInvisibleDefault || ((n.index = t.length), t.push(n));
      return t;
    }
    get currentText() {
      return (
        this.IfAsyncWeCant("call currentText since it's a work in progress"),
        this.state.currentText
      );
    }
    get currentTags() {
      return (
        this.IfAsyncWeCant("call currentTags since it's a work in progress"),
        this.state.currentTags
      );
    }
    get currentErrors() {
      return this.state.currentErrors;
    }
    get currentWarnings() {
      return this.state.currentWarnings;
    }
    get currentFlowName() {
      return this.state.currentFlowName;
    }
    get currentFlowIsDefaultFlow() {
      return this.state.currentFlowIsDefaultFlow;
    }
    get aliveFlowNames() {
      return this.state.aliveFlowNames;
    }
    get hasError() {
      return this.state.hasError;
    }
    get hasWarning() {
      return this.state.hasWarning;
    }
    get variablesState() {
      return this.state.variablesState;
    }
    get listDefinitions() {
      return this._listDefinitions;
    }
    get state() {
      return this._state;
    }
    StartProfiling() {}
    EndProfiling() {}
    constructor() {
      let t;
      (super(),
        (this.inkVersionMinimumCompatible = 18),
        (this.onError = null),
        (this.onDidContinue = null),
        (this.onMakeChoice = null),
        (this.onEvaluateFunction = null),
        (this.onCompleteEvaluateFunction = null),
        (this.onChoosePathString = null),
        (this._prevContainers = []),
        (this.allowExternalFunctionFallbacks = !1),
        (this._listDefinitions = null),
        (this._variableObservers = null),
        (this._hasValidatedExternals = !1),
        (this._temporaryEvaluationContainer = null),
        (this._asyncContinueActive = !1),
        (this._stateSnapshotAtLastNewline = null),
        (this._sawLookaheadUnsafeFunctionAfterNewline = !1),
        (this._recursiveContinueCount = 0),
        (this._asyncSaving = !1),
        (this._profiler = null));
      let n = null,
        a = null;
      if (arguments[0] instanceof K)
        ((t = arguments[0]),
          arguments[1] !== void 0 && (n = arguments[1]),
          (this._mainContentContainer = t));
      else if (typeof arguments[0] == "string") {
        let i = arguments[0];
        a = Fn.TextToDictionary(i);
      } else a = arguments[0];
      if (
        (n != null && (this._listDefinitions = new Cr(n)),
        (this._externals = new Map()),
        a !== null)
      ) {
        let i = a,
          l = i.inkVersion;
        if (l == null)
          throw new Error(
            "ink version number not found. Are you sure it's a valid .ink.json file?",
          );
        let r = parseInt(l);
        if (r > e.inkVersionCurrent)
          throw new Error(
            "Version of ink used to build story was newer than the current version of the engine",
          );
        if (r < this.inkVersionMinimumCompatible)
          throw new Error(
            "Version of ink used to build story is too old to be loaded by this version of the engine",
          );
        r != e.inkVersionCurrent &&
          console.warn(
            `WARNING: Version of ink ${e.inkVersionCurrent} used to build story doesn't match current version of engine (${r}). Non-critical, but recommend synchronising.`,
          );
        let u,
          s = i.root;
        if (s == null)
          throw new Error(
            "Root node for ink not found. Are you sure it's a valid .ink.json file?",
          );
        ((u = i.listDefs) &&
          (this._listDefinitions = wt.JTokenToListDefinitions(u)),
          (this._mainContentContainer = tt(wt.JTokenToRuntimeObject(s), K)),
          this.ResetState());
      }
    }
    ToJson(t) {
      let n = !1;
      if (
        (t || ((n = !0), (t = new Fn.Writer())),
        t.WriteObjectStart(),
        t.WriteIntProperty("inkVersion", e.inkVersionCurrent),
        t.WriteProperty("root", (a) =>
          wt.WriteRuntimeContainer(a, this._mainContentContainer),
        ),
        this._listDefinitions != null)
      ) {
        (t.WritePropertyStart("listDefs"), t.WriteObjectStart());
        for (let a of this._listDefinitions.lists) {
          (t.WritePropertyStart(a.name), t.WriteObjectStart());
          for (let [i, l] of a.items) {
            let r = ct.fromSerializedKey(i),
              u = l;
            t.WriteIntProperty(r.itemName, u);
          }
          (t.WriteObjectEnd(), t.WritePropertyEnd());
        }
        (t.WriteObjectEnd(), t.WritePropertyEnd());
      }
      if ((t.WriteObjectEnd(), n)) return t.toString();
    }
    ResetState() {
      (this.IfAsyncWeCant("ResetState"),
        (this._state = new As(this)),
        this._state.variablesState.ObserveVariableChange(
          this.VariableStateDidChangeEvent.bind(this),
        ),
        this.ResetGlobals());
    }
    ResetErrors() {
      if (this._state === null) return C("this._state");
      this._state.ResetErrors();
    }
    ResetCallstack() {
      if ((this.IfAsyncWeCant("ResetCallstack"), this._state === null))
        return C("this._state");
      this._state.ForceEnd();
    }
    ResetGlobals() {
      if (this._mainContentContainer.namedContent.get("global decl")) {
        let t = this.state.currentPointer.copy();
        (this.ChoosePath(new ut("global decl"), !1),
          this.ContinueInternal(),
          (this.state.currentPointer = t));
      }
      this.state.variablesState.SnapshotDefaultGlobals();
    }
    SwitchFlow(t) {
      if ((this.IfAsyncWeCant("switch flow"), this._asyncSaving))
        throw new Error(
          "Story is already in background saving mode, can't switch flow to " +
            t,
        );
      this.state.SwitchFlow_Internal(t);
    }
    RemoveFlow(t) {
      this.state.RemoveFlow_Internal(t);
    }
    SwitchToDefaultFlow() {
      this.state.SwitchToDefaultFlow_Internal();
    }
    Continue() {
      return (this.ContinueAsync(0), this.currentText);
    }
    get canContinue() {
      return this.state.canContinue;
    }
    get asyncContinueComplete() {
      return !this._asyncContinueActive;
    }
    ContinueAsync(t) {
      (this._hasValidatedExternals || this.ValidateExternalBindings(),
        this.ContinueInternal(t));
    }
    ContinueInternal() {
      let t =
        arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;
      this._profiler != null && this._profiler.PreContinue();
      let n = t > 0;
      if ((this._recursiveContinueCount++, this._asyncContinueActive))
        this._asyncContinueActive && !n && (this._asyncContinueActive = !1);
      else {
        if (((this._asyncContinueActive = n), !this.canContinue))
          throw new Error(
            "Can't continue - should check canContinue before calling Continue",
          );
        ((this._state.didSafeExit = !1),
          this._state.ResetOutput(),
          this._recursiveContinueCount == 1 &&
            this._state.variablesState.StartVariableObservation());
      }
      let a = new _s();
      a.Start();
      let i = !1;
      this._sawLookaheadUnsafeFunctionAfterNewline = !1;
      do {
        try {
          i = this.ContinueSingleStep();
        } catch (r) {
          if (!(r instanceof ne)) throw r;
          this.AddError(r.message, void 0, r.useEndLineNumber);
          break;
        }
        if (i || (this._asyncContinueActive && a.ElapsedMilliseconds > t))
          break;
      } while (this.canContinue);
      a.Stop();
      let l = null;
      if (
        ((!i && this.canContinue) ||
          (this._stateSnapshotAtLastNewline !== null &&
            this.RestoreStateSnapshot(),
          this.canContinue ||
            (this.state.callStack.canPopThread &&
              this.AddError(
                "Thread available to pop, threads should always be flat by the end of evaluation?",
              ),
            this.state.generatedChoices.length != 0 ||
              this.state.didSafeExit ||
              this._temporaryEvaluationContainer != null ||
              (this.state.callStack.CanPop(J.Tunnel)
                ? this.AddError(
                    "unexpectedly reached end of content. Do you need a '->->' to return from a tunnel?",
                  )
                : this.state.callStack.CanPop(J.Function)
                  ? this.AddError(
                      "unexpectedly reached end of content. Do you need a '~ return'?",
                    )
                  : this.state.callStack.canPop
                    ? this.AddError(
                        "unexpectedly reached end of content for unknown reason. Please debug compiler!",
                      )
                    : this.AddError(
                        "ran out of content. Do you need a '-> DONE' or '-> END'?",
                      ))),
          (this.state.didSafeExit = !1),
          (this._sawLookaheadUnsafeFunctionAfterNewline = !1),
          this._recursiveContinueCount == 1 &&
            (l = this._state.variablesState.CompleteVariableObservation()),
          (this._asyncContinueActive = !1),
          this.onDidContinue !== null && this.onDidContinue()),
        this._recursiveContinueCount--,
        this._profiler != null && this._profiler.PostContinue(),
        this.state.hasError || this.state.hasWarning)
      ) {
        if (this.onError === null) {
          let r = new ee();
          throw (
            r.Append("Ink had "),
            this.state.hasError &&
              (r.Append(`${this.state.currentErrors.length}`),
              r.Append(
                this.state.currentErrors.length == 1 ? " error" : " errors",
              ),
              this.state.hasWarning && r.Append(" and ")),
            this.state.hasWarning &&
              (r.Append(`${this.state.currentWarnings.length}`),
              r.Append(
                this.state.currentWarnings.length == 1
                  ? " warning"
                  : " warnings",
              ),
              this.state.hasWarning && r.Append(" and ")),
            r.Append(
              ". It is strongly suggested that you assign an error handler to story.onError. The first issue was: ",
            ),
            r.Append(
              this.state.hasError
                ? this.state.currentErrors[0]
                : this.state.currentWarnings[0],
            ),
            new ne(r.toString())
          );
        }
        if (this.state.hasError)
          for (let r of this.state.currentErrors) this.onError(r, br.Error);
        if (this.state.hasWarning)
          for (let r of this.state.currentWarnings) this.onError(r, br.Warning);
        this.ResetErrors();
      }
      l != null &&
        Object.keys(l).length > 0 &&
        this._state.variablesState.NotifyObservers(l);
    }
    ContinueSingleStep() {
      if (
        (this._profiler != null && this._profiler.PreStep(),
        this.Step(),
        this._profiler != null && this._profiler.PostStep(),
        this.canContinue ||
          this.state.callStack.elementIsEvaluateFromGame ||
          this.TryFollowDefaultInvisibleChoice(),
        this._profiler != null && this._profiler.PreSnapshot(),
        !this.state.inStringEvaluation)
      ) {
        if (this._stateSnapshotAtLastNewline !== null) {
          if (this._stateSnapshotAtLastNewline.currentTags === null)
            return C("this._stateAtLastNewline.currentTags");
          if (this.state.currentTags === null)
            return C("this.state.currentTags");
          let t = this.CalculateNewlineOutputStateChange(
            this._stateSnapshotAtLastNewline.currentText,
            this.state.currentText,
            this._stateSnapshotAtLastNewline.currentTags.length,
            this.state.currentTags.length,
          );
          if (
            t == e.OutputStateChange.ExtendedBeyondNewline ||
            this._sawLookaheadUnsafeFunctionAfterNewline
          )
            return (this.RestoreStateSnapshot(), !0);
          t == e.OutputStateChange.NewlineRemoved && this.DiscardSnapshot();
        }
        this.state.outputStreamEndsInNewline &&
          (this.canContinue
            ? this._stateSnapshotAtLastNewline == null && this.StateSnapshot()
            : this.DiscardSnapshot());
      }
      return (this._profiler != null && this._profiler.PostSnapshot(), !1);
    }
    CalculateNewlineOutputStateChange(t, n, a, i) {
      if (t === null) return C("prevText");
      if (n === null) return C("currText");
      let l =
        n.length >= t.length &&
        t.length > 0 &&
        n.charAt(t.length - 1) ==
          `
`;
      if (a == i && t.length == n.length && l)
        return e.OutputStateChange.NoChange;
      if (!l) return e.OutputStateChange.NewlineRemoved;
      if (i > a) return e.OutputStateChange.ExtendedBeyondNewline;
      for (let r = t.length; r < n.length; r++) {
        let u = n.charAt(r);
        if (u != " " && u != "	")
          return e.OutputStateChange.ExtendedBeyondNewline;
      }
      return e.OutputStateChange.NoChange;
    }
    ContinueMaximally() {
      this.IfAsyncWeCant("ContinueMaximally");
      let t = new ee();
      for (; this.canContinue;) t.Append(this.Continue());
      return t.toString();
    }
    ContentAtPath(t) {
      return this.mainContentContainer.ContentAtPath(t);
    }
    KnotContainerWithName(t) {
      let n = this.mainContentContainer.namedContent.get(t);
      return n instanceof K ? n : null;
    }
    PointerAtPath(t) {
      if (t.length == 0) return bt.Null;
      let n = new bt(),
        a = t.length,
        i = null;
      return t.lastComponent === null
        ? C("path.lastComponent")
        : (t.lastComponent.isIndex
            ? ((a = t.length - 1),
              (i = this.mainContentContainer.ContentAtPath(t, void 0, a)),
              (n.container = i.container),
              (n.index = t.lastComponent.index))
            : ((i = this.mainContentContainer.ContentAtPath(t)),
              (n.container = i.container),
              (n.index = -1)),
          i.obj == null || (i.obj == this.mainContentContainer && a > 0)
            ? this.Error(
                "Failed to find content at path '" +
                  t +
                  "', and no approximation of it was possible.",
              )
            : i.approximate &&
              this.Warning(
                "Failed to find content at path '" +
                  t +
                  "', so it was approximated to: '" +
                  i.obj.path +
                  "'.",
              ),
          n);
    }
    StateSnapshot() {
      ((this._stateSnapshotAtLastNewline = this._state),
        (this._state = this._state.CopyAndStartPatching(!1)));
    }
    RestoreStateSnapshot() {
      (this._stateSnapshotAtLastNewline === null &&
        C("_stateSnapshotAtLastNewline"),
        this._stateSnapshotAtLastNewline.RestoreAfterPatch(),
        (this._state = this._stateSnapshotAtLastNewline),
        (this._stateSnapshotAtLastNewline = null),
        this._asyncSaving || this._state.ApplyAnyPatch());
    }
    DiscardSnapshot() {
      (this._asyncSaving || this._state.ApplyAnyPatch(),
        (this._stateSnapshotAtLastNewline = null));
    }
    CopyStateForBackgroundThreadSave() {
      if (
        (this.IfAsyncWeCant("start saving on a background thread"),
        this._asyncSaving)
      )
        throw new Error(
          "Story is already in background saving mode, can't call CopyStateForBackgroundThreadSave again!",
        );
      let t = this._state;
      return (
        (this._state = this._state.CopyAndStartPatching(!0)),
        (this._asyncSaving = !0),
        t
      );
    }
    BackgroundSaveComplete() {
      (this._stateSnapshotAtLastNewline === null && this._state.ApplyAnyPatch(),
        (this._asyncSaving = !1));
    }
    Step() {
      let t = !0,
        n = this.state.currentPointer.copy();
      if (n.isNull) return;
      let a = _(n.Resolve(), K);
      for (; a && (this.VisitContainer(a, !0), a.content.length != 0);)
        ((n = bt.StartOf(a)), (a = _(n.Resolve(), K)));
      ((this.state.currentPointer = n.copy()),
        this._profiler != null && this._profiler.Step(this.state.callStack));
      let i = n.Resolve(),
        l = this.PerformLogicAndFlowControl(i);
      if (this.state.currentPointer.isNull) return;
      l && (t = !1);
      let r = _(i, $i);
      if (r) {
        let s = this.ProcessChoice(r);
        (s && this.state.generatedChoices.push(s), (i = null), (t = !1));
      }
      if ((i instanceof K && (t = !1), t)) {
        let s = _(i, tn);
        if (s && s.contextIndex == -1) {
          let o = this.state.callStack.ContextForVariableNamed(s.variableName);
          i = new tn(s.variableName, o);
        }
        this.state.inExpressionEvaluation
          ? this.state.PushEvaluationStack(i)
          : this.state.PushToOutputStream(i);
      }
      this.NextContent();
      let u = _(i, A);
      u &&
        u.commandType == A.CommandType.StartThread &&
        this.state.callStack.PushThread();
    }
    VisitContainer(t, n) {
      (t.countingAtStartOnly && !n) ||
        (t.visitsShouldBeCounted &&
          this.state.IncrementVisitCountForContainer(t),
        t.turnIndexShouldBeCounted &&
          this.state.RecordTurnIndexVisitToContainer(t));
    }
    VisitChangedContainersDueToDivert() {
      let t = this.state.previousPointer.copy(),
        n = this.state.currentPointer.copy();
      if (n.isNull || n.index == -1) return;
      if (((this._prevContainers.length = 0), !t.isNull)) {
        let r = _(t.Resolve(), K) || _(t.container, K);
        for (; r;) (this._prevContainers.push(r), (r = _(r.parent, K)));
      }
      let a = n.Resolve();
      if (a == null) return;
      let i = _(a.parent, K),
        l = !0;
      for (
        ;
        i && (this._prevContainers.indexOf(i) < 0 || i.countingAtStartOnly);
      ) {
        let r = i.content.length > 0 && a == i.content[0] && l;
        (r || (l = !1),
          this.VisitContainer(i, r),
          (a = i),
          (i = _(i.parent, K)));
      }
    }
    PopChoiceStringAndTags(t) {
      let n = tt(this.state.PopEvaluationStack(), I);
      for (
        ;
        this.state.evaluationStack.length > 0 &&
        _(this.state.PeekEvaluationStack(), gn) != null;
      ) {
        let a = _(this.state.PopEvaluationStack(), gn);
        a && t.push(a.text);
      }
      return n.value;
    }
    ProcessChoice(t) {
      let n = !0;
      if (t.hasCondition) {
        let u = this.state.PopEvaluationStack();
        this.IsTruthy(u) || (n = !1);
      }
      let a = "",
        i = "",
        l = [];
      if (
        (t.hasChoiceOnlyContent && (i = this.PopChoiceStringAndTags(l) || ""),
        t.hasStartContent && (a = this.PopChoiceStringAndTags(l) || ""),
        t.onceOnly &&
          this.state.VisitCountForContainer(t.choiceTarget) > 0 &&
          (n = !1),
        !n)
      )
        return null;
      let r = new el();
      return (
        (r.targetPath = t.pathOnChoice),
        (r.sourcePath = t.path.toString()),
        (r.isInvisibleDefault = t.isInvisibleDefault),
        (r.threadAtGeneration = this.state.callStack.ForkThread()),
        (r.tags = l.reverse()),
        (r.text = (a + i).replace(/^[ \t]+|[ \t]+$/g, "")),
        r
      );
    }
    IsTruthy(t) {
      if (t instanceof Q) {
        let n = t;
        if (n instanceof $e) {
          let a = n;
          return (
            this.Error(
              "Shouldn't use a divert target (to " +
                a.targetPath +
                ") as a conditional value. Did you intend a function call 'likeThis()' or a read count check 'likeThis'? (no arrows)",
            ),
            !1
          );
        }
        return n.isTruthy;
      }
      return !1;
    }
    PerformLogicAndFlowControl(t) {
      if (t == null) return !1;
      if (t instanceof Ka) {
        let n = t;
        if (n.isConditional) {
          let a = this.state.PopEvaluationStack();
          if (!this.IsTruthy(a)) return !0;
        }
        if (n.hasVariableTarget) {
          let a = n.variableDivertName,
            i = this.state.variablesState.GetVariableWithName(a);
          if (i == null)
            this.Error(
              "Tried to divert using a target from a variable that could not be found (" +
                a +
                ")",
            );
          else if (!(i instanceof $e)) {
            let r = _(i, P),
              u =
                "Tried to divert to a target from a variable, but the variable (" +
                a +
                ") didn't contain a divert target, it ";
            (r instanceof P && r.value == 0
              ? (u += "was empty/null (the value 0).")
              : (u += "contained '" + i + "'."),
              this.Error(u));
          }
          let l = tt(i, $e);
          this.state.divertedPointer = this.PointerAtPath(l.targetPath);
        } else {
          if (n.isExternal)
            return (
              this.CallExternalFunction(n.targetPathString, n.externalArgs),
              !0
            );
          this.state.divertedPointer = n.targetPointer.copy();
        }
        return (
          n.pushesToStack &&
            this.state.callStack.Push(
              n.stackPushType,
              void 0,
              this.state.outputStream.length,
            ),
          this.state.divertedPointer.isNull &&
            !n.isExternal &&
            (n && n.debugMetadata && n.debugMetadata.sourceName != null
              ? this.Error(
                  "Divert target doesn't exist: " + n.debugMetadata.sourceName,
                )
              : this.Error("Divert resolution failed: " + n)),
          !0
        );
      }
      if (t instanceof A) {
        let n = t;
        switch (n.commandType) {
          case A.CommandType.EvalStart:
            (this.Assert(
              this.state.inExpressionEvaluation === !1,
              "Already in expression evaluation?",
            ),
              (this.state.inExpressionEvaluation = !0));
            break;
          case A.CommandType.EvalEnd:
            (this.Assert(
              this.state.inExpressionEvaluation === !0,
              "Not in expression evaluation mode",
            ),
              (this.state.inExpressionEvaluation = !1));
            break;
          case A.CommandType.EvalOutput:
            if (this.state.evaluationStack.length > 0) {
              let b = this.state.PopEvaluationStack();
              if (!(b instanceof en)) {
                let N = new I(b.toString());
                this.state.PushToOutputStream(N);
              }
            }
            break;
          case A.CommandType.NoOp:
            break;
          case A.CommandType.Duplicate:
            this.state.PushEvaluationStack(this.state.PeekEvaluationStack());
            break;
          case A.CommandType.PopEvaluatedValue:
            this.state.PopEvaluationStack();
            break;
          case A.CommandType.PopFunction:
          case A.CommandType.PopTunnel:
            let a =
                n.commandType == A.CommandType.PopFunction
                  ? J.Function
                  : J.Tunnel,
              i = null;
            if (a == J.Tunnel) {
              let b = this.state.PopEvaluationStack();
              ((i = _(b, $e)),
                i === null &&
                  this.Assert(
                    b instanceof en,
                    "Expected void if ->-> doesn't override target",
                  ));
            }
            if (this.state.TryExitFunctionEvaluationFromGame()) break;
            if (
              this.state.callStack.currentElement.type == a &&
              this.state.callStack.canPop
            )
              (this.state.PopCallStack(),
                i &&
                  (this.state.divertedPointer = this.PointerAtPath(
                    i.targetPath,
                  )));
            else {
              let b = new Map();
              (b.set(J.Function, "function return statement (~ return)"),
                b.set(J.Tunnel, "tunnel onwards statement (->->)"));
              let N = b.get(this.state.callStack.currentElement.type);
              this.state.callStack.canPop ||
                (N = "end of flow (-> END or choice)");
              let E = "Found " + b.get(a) + ", when expected " + N;
              this.Error(E);
            }
            break;
          case A.CommandType.BeginString:
            (this.state.PushToOutputStream(n),
              this.Assert(
                this.state.inExpressionEvaluation === !0,
                "Expected to be in an expression when evaluating a string",
              ),
              (this.state.inExpressionEvaluation = !1));
            break;
          case A.CommandType.BeginTag:
            this.state.PushToOutputStream(n);
            break;
          case A.CommandType.EndTag:
            if (this.state.inStringEvaluation) {
              let b = [],
                N = 0;
              for (let w = this.state.outputStream.length - 1; w >= 0; --w) {
                let D = this.state.outputStream[w];
                N++;
                let j = _(D, A);
                if (j != null) {
                  if (j.commandType == A.CommandType.BeginTag) break;
                  this.Error(
                    "Unexpected ControlCommand while extracting tag from choice",
                  );
                  break;
                }
                D instanceof I && b.push(D);
              }
              this.state.PopFromOutputStream(N);
              let E = new ee();
              for (let w of b.reverse()) E.Append(w.toString());
              let M = new gn(this.state.CleanOutputWhitespace(E.toString()));
              this.state.PushEvaluationStack(M);
            } else this.state.PushToOutputStream(n);
            break;
          case A.CommandType.EndString: {
            let b = [],
              N = [],
              E = 0;
            for (let w = this.state.outputStream.length - 1; w >= 0; --w) {
              let D = this.state.outputStream[w];
              E++;
              let j = _(D, A);
              if (j && j.commandType == A.CommandType.BeginString) break;
              (D instanceof gn && N.push(D), D instanceof I && b.push(D));
            }
            this.state.PopFromOutputStream(E);
            for (let w of N) this.state.PushToOutputStream(w);
            b = b.reverse();
            let M = new ee();
            for (let w of b) M.Append(w.toString());
            ((this.state.inExpressionEvaluation = !0),
              this.state.PushEvaluationStack(new I(M.toString())));
            break;
          }
          case A.CommandType.ChoiceCount:
            let l = this.state.generatedChoices.length;
            this.state.PushEvaluationStack(new P(l));
            break;
          case A.CommandType.Turns:
            this.state.PushEvaluationStack(
              new P(this.state.currentTurnIndex + 1),
            );
            break;
          case A.CommandType.TurnsSince:
          case A.CommandType.ReadCount:
            let r = this.state.PopEvaluationStack();
            if (!(r instanceof $e)) {
              let b = "";
              (r instanceof P &&
                (b =
                  ". Did you accidentally pass a read count ('knot_name') instead of a target ('-> knot_name')?"),
                this.Error(
                  "TURNS_SINCE / READ_COUNT expected a divert target (knot, stitch, label name), but saw " +
                    r +
                    b,
                ));
              break;
            }
            let u,
              s = tt(r, $e),
              o = _(this.ContentAtPath(s.targetPath).correctObj, K);
            (o != null
              ? (u =
                  n.commandType == A.CommandType.TurnsSince
                    ? this.state.TurnsSinceForContainer(o)
                    : this.state.VisitCountForContainer(o))
              : ((u = n.commandType == A.CommandType.TurnsSince ? -1 : 0),
                this.Warning(
                  "Failed to find container for " +
                    n.toString() +
                    " lookup at " +
                    s.targetPath.toString(),
                )),
              this.state.PushEvaluationStack(new P(u)));
            break;
          case A.CommandType.Random: {
            let b = _(this.state.PopEvaluationStack(), P),
              N = _(this.state.PopEvaluationStack(), P);
            if (N == null || !(N instanceof P))
              return this.Error(
                "Invalid value for minimum parameter of RANDOM(min, max)",
              );
            if (b == null || !(b instanceof P))
              return this.Error(
                "Invalid value for maximum parameter of RANDOM(min, max)",
              );
            if (b.value === null) return C("maxInt.value");
            if (N.value === null) return C("minInt.value");
            let E = b.value - N.value + 1;
            ((!isFinite(E) || E > Number.MAX_SAFE_INTEGER) &&
              ((E = Number.MAX_SAFE_INTEGER),
              this.Error(
                "RANDOM was called with a range that exceeds the size that ink numbers can use.",
              )),
              E <= 0 &&
                this.Error(
                  "RANDOM was called with minimum as " +
                    N.value +
                    " and maximum as " +
                    b.value +
                    ". The maximum must be larger",
                ));
            let M = this.state.storySeed + this.state.previousRandom,
              w = new Za(M).next(),
              D = (w % E) + N.value;
            (this.state.PushEvaluationStack(new P(D)),
              (this.state.previousRandom = w));
            break;
          }
          case A.CommandType.SeedRandom:
            let c = _(this.state.PopEvaluationStack(), P);
            if (c == null || !(c instanceof P))
              return this.Error("Invalid value passed to SEED_RANDOM");
            if (c.value === null) return C("minInt.value");
            ((this.state.storySeed = c.value),
              (this.state.previousRandom = 0),
              this.state.PushEvaluationStack(new en()));
            break;
          case A.CommandType.VisitIndex:
            let h =
              this.state.VisitCountForContainer(
                this.state.currentPointer.container,
              ) - 1;
            this.state.PushEvaluationStack(new P(h));
            break;
          case A.CommandType.SequenceShuffleIndex:
            let f = this.NextSequenceShuffleIndex();
            this.state.PushEvaluationStack(new P(f));
            break;
          case A.CommandType.StartThread:
            break;
          case A.CommandType.Done:
            this.state.callStack.canPopThread
              ? this.state.callStack.PopThread()
              : ((this.state.didSafeExit = !0),
                (this.state.currentPointer = bt.Null));
            break;
          case A.CommandType.End:
            this.state.ForceEnd();
            break;
          case A.CommandType.ListFromInt:
            let p = _(this.state.PopEvaluationStack(), P),
              S = tt(this.state.PopEvaluationStack(), I);
            if (p === null)
              throw new ne(
                "Passed non-integer when creating a list element from a numerical value.",
              );
            let T = null;
            if (this.listDefinitions === null) return C("this.listDefinitions");
            let x = this.listDefinitions.TryListGetDefinition(S.value, null);
            if (!x.exists)
              throw new ne("Failed to find LIST called " + S.value);
            {
              if (p.value === null) return C("minInt.value");
              let b = x.result.TryGetItemWithValue(p.value, ct.Null);
              b.exists && (T = new Et(b.result, p.value));
            }
            (T == null && (T = new Et()), this.state.PushEvaluationStack(T));
            break;
          case A.CommandType.ListRange:
            let g = _(this.state.PopEvaluationStack(), Q),
              d = _(this.state.PopEvaluationStack(), Q),
              m = _(this.state.PopEvaluationStack(), Et);
            if (m === null || d === null || g === null)
              throw new ne("Expected list, minimum and maximum for LIST_RANGE");
            if (m.value === null) return C("targetList.value");
            let y = m.value.ListWithSubRange(d.valueObject, g.valueObject);
            this.state.PushEvaluationStack(new Et(y));
            break;
          case A.CommandType.ListRandom: {
            let b = this.state.PopEvaluationStack();
            if (b === null) throw new ne("Expected list for LIST_RANDOM");
            let N = b.value,
              E = null;
            if (N === null) throw C("list");
            if (N.Count == 0) E = new Ne();
            else {
              let M = this.state.storySeed + this.state.previousRandom,
                w = new Za(M).next(),
                D = w % N.Count,
                j = N.entries();
              for (let le = 0; le <= D - 1; le++) j.next();
              let G = j.next().value,
                lt = { Key: ct.fromSerializedKey(G[0]), Value: G[1] };
              if (lt.Key.originName === null)
                return C("randomItem.Key.originName");
              ((E = new Ne(lt.Key.originName, this)),
                E.Add(lt.Key, lt.Value),
                (this.state.previousRandom = w));
            }
            this.state.PushEvaluationStack(new Et(E));
            break;
          }
          default:
            this.Error("unhandled ControlCommand: " + n);
        }
        return !0;
      }
      if (t instanceof tl) {
        let n = t,
          a = this.state.PopEvaluationStack();
        return (this.state.variablesState.Assign(n, a), !0);
      }
      if (t instanceof Qa) {
        let n = t,
          a = null;
        if (n.pathForCount != null) {
          let i = n.containerForCount,
            l = this.state.VisitCountForContainer(i);
          a = new P(l);
        } else
          ((a = this.state.variablesState.GetVariableWithName(n.name)),
            a == null &&
              (this.Warning(
                "Variable not found: '" +
                  n.name +
                  "'. Using default value of 0 (false). This can happen with temporary variables if the declaration hasn't yet been hit. Globals are always given a default value on load if a value doesn't exist in the save state.",
              ),
              (a = new P(0))));
        return (this.state.PushEvaluationStack(a), !0);
      }
      if (t instanceof H) {
        let n = t,
          a = this.state.PopEvaluationStack(n.numberOfParameters),
          i = n.Call(a);
        return (this.state.PushEvaluationStack(i), !0);
      }
      return !1;
    }
    ChoosePathString(t) {
      let n =
          !(arguments.length > 1 && arguments[1] !== void 0) || arguments[1],
        a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : [];
      if (
        (this.IfAsyncWeCant("call ChoosePathString right now"),
        this.onChoosePathString !== null && this.onChoosePathString(t, a),
        n)
      )
        this.ResetCallstack();
      else if (this.state.callStack.currentElement.type == J.Function) {
        let i = "",
          l = this.state.callStack.currentElement.currentPointer.container;
        throw (
          l != null && (i = "(" + l.path.toString() + ") "),
          new Error(
            "Story was running a function " +
              i +
              "when you called ChoosePathString(" +
              t +
              `) - this is almost certainly not not what you want! Full stack trace: 
` +
              this.state.callStack.callStackTrace,
          )
        );
      }
      (this.state.PassArgumentsToEvaluationStack(a),
        this.ChoosePath(new ut(t)));
    }
    IfAsyncWeCant(t) {
      if (this._asyncContinueActive)
        throw new Error(
          "Can't " +
            t +
            ". Story is in the middle of a ContinueAsync(). Make more ContinueAsync() calls or a single Continue() call beforehand.",
        );
    }
    ChoosePath(t) {
      let n =
        !(arguments.length > 1 && arguments[1] !== void 0) || arguments[1];
      (this.state.SetChosenPath(t, n),
        this.VisitChangedContainersDueToDivert());
    }
    ChooseChoiceIndex(t) {
      let n = this.currentChoices;
      this.Assert(t >= 0 && t < n.length, "choice out of range");
      let a = n[t];
      return (
        this.onMakeChoice !== null && this.onMakeChoice(a),
        a.threadAtGeneration === null
          ? C("choiceToChoose.threadAtGeneration")
          : a.targetPath === null
            ? C("choiceToChoose.targetPath")
            : ((this.state.callStack.currentThread = a.threadAtGeneration),
              void this.ChoosePath(a.targetPath))
      );
    }
    HasFunction(t) {
      try {
        return this.KnotContainerWithName(t) != null;
      } catch {
        return !1;
      }
    }
    EvaluateFunction(t) {
      let n =
          arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [],
        a = arguments.length > 2 && arguments[2] !== void 0 && arguments[2];
      if (
        (this.onEvaluateFunction !== null && this.onEvaluateFunction(t, n),
        this.IfAsyncWeCant("evaluate a function"),
        t == null)
      )
        throw new Error("Function is null");
      if (t == "" || t.trim() == "")
        throw new Error("Function is empty or white space.");
      let i = this.KnotContainerWithName(t);
      if (i == null) throw new Error("Function doesn't exist: '" + t + "'");
      let l = [];
      (l.push(...this.state.outputStream),
        this._state.ResetOutput(),
        this.state.StartFunctionEvaluationFromGame(i, n));
      let r = new ee();
      for (; this.canContinue;) r.Append(this.Continue());
      let u = r.toString();
      this._state.ResetOutput(l);
      let s = this.state.CompleteFunctionEvaluationFromGame();
      return (
        this.onCompleteEvaluateFunction != null &&
          this.onCompleteEvaluateFunction(t, n, u, s),
        a ? { returned: s, output: u } : s
      );
    }
    EvaluateExpression(t) {
      let n = this.state.callStack.elements.length;
      (this.state.callStack.Push(J.Tunnel),
        (this._temporaryEvaluationContainer = t),
        this.state.GoToStart());
      let a = this.state.evaluationStack.length;
      return (
        this.Continue(),
        (this._temporaryEvaluationContainer = null),
        this.state.callStack.elements.length > n && this.state.PopCallStack(),
        this.state.evaluationStack.length > a
          ? this.state.PopEvaluationStack()
          : null
      );
    }
    CallExternalFunction(t, n) {
      if (t === null) return C("funcName");
      let a = this._externals.get(t),
        i = null,
        l = a !== void 0;
      if (
        (l &&
          !a.lookAheadSafe &&
          this._state.inStringEvaluation &&
          this.Error(
            "External function " +
              t +
              ` could not be called because 1) it wasn't marked as lookaheadSafe when BindExternalFunction was called and 2) the story is in the middle of string generation, either because choice text is being generated, or because you have ink like "hello {func()}". You can work around this by generating the result of your function into a temporary variable before the string or choice gets generated: ~ temp x = ` +
              t +
              "()",
          ),
        l && !a.lookAheadSafe && this._stateSnapshotAtLastNewline !== null)
      )
        return void (this._sawLookaheadUnsafeFunctionAfterNewline = !0);
      if (!l) {
        if (this.allowExternalFunctionFallbacks)
          return (
            (i = this.KnotContainerWithName(t)),
            this.Assert(
              i !== null,
              "Trying to call EXTERNAL function '" +
                t +
                "' which has not been bound, and fallback ink function could not be found.",
            ),
            this.state.callStack.Push(
              J.Function,
              void 0,
              this.state.outputStream.length,
            ),
            void (this.state.divertedPointer = bt.StartOf(i))
          );
        this.Assert(
          !1,
          "Trying to call EXTERNAL function '" +
            t +
            "' which has not been bound (and ink fallbacks disabled).",
        );
      }
      let r = [];
      for (let o = 0; o < n; ++o) {
        let c = tt(this.state.PopEvaluationStack(), Q).valueObject;
        r.push(c);
      }
      r.reverse();
      let u = a.function(r),
        s = null;
      (u != null
        ? ((s = Q.Create(u)),
          this.Assert(
            s !== null,
            "Could not create ink value from returned object of type " +
              typeof u,
          ))
        : (s = new en()),
        this.state.PushEvaluationStack(s));
    }
    BindExternalFunctionGeneral(t, n) {
      let a =
        !(arguments.length > 2 && arguments[2] !== void 0) || arguments[2];
      (this.IfAsyncWeCant("bind an external function"),
        this.Assert(
          !this._externals.has(t),
          "Function '" + t + "' has already been bound.",
        ),
        this._externals.set(t, { function: n, lookAheadSafe: a }));
    }
    TryCoerce(t) {
      return t;
    }
    BindExternalFunction(t, n) {
      let a = arguments.length > 2 && arguments[2] !== void 0 && arguments[2];
      (this.Assert(n != null, "Can't bind a null function"),
        this.BindExternalFunctionGeneral(
          t,
          (i) => {
            this.Assert(
              i.length >= n.length,
              "External function expected " + n.length + " arguments",
            );
            let l = [];
            for (let r = 0, u = i.length; r < u; r++)
              l[r] = this.TryCoerce(i[r]);
            return n.apply(null, l);
          },
          a,
        ));
    }
    UnbindExternalFunction(t) {
      (this.IfAsyncWeCant("unbind an external a function"),
        this.Assert(
          this._externals.has(t),
          "Function '" + t + "' has not been bound.",
        ),
        this._externals.delete(t));
    }
    ValidateExternalBindings() {
      let t = null,
        n = null,
        a = arguments[1] || new Set();
      if (
        (arguments[0] instanceof K && (t = arguments[0]),
        arguments[0] instanceof At && (n = arguments[0]),
        t === null && n === null)
      )
        if (
          (this.ValidateExternalBindings(this._mainContentContainer, a),
          (this._hasValidatedExternals = !0),
          a.size == 0)
        )
          this._hasValidatedExternals = !0;
        else {
          let i = "Error: Missing function binding for external";
          ((i += a.size > 1 ? "s" : ""),
            (i += ": '"),
            (i += Array.from(a).join("', '")),
            (i += "' "),
            (i += this.allowExternalFunctionFallbacks
              ? ", and no fallback ink function found."
              : " (ink fallbacks disabled)"),
            this.Error(i));
        }
      else if (t != null) {
        for (let i of t.content)
          (i != null && i.hasValidName) || this.ValidateExternalBindings(i, a);
        for (let [, i] of t.namedContent)
          this.ValidateExternalBindings(_(i, At), a);
      } else if (n != null) {
        let i = _(n, Ka);
        if (i && i.isExternal) {
          let l = i.targetPathString;
          if (l === null) return C("name");
          this._externals.has(l) ||
            (this.allowExternalFunctionFallbacks &&
              this.mainContentContainer.namedContent.has(l)) ||
            a.add(l);
        }
      }
    }
    ObserveVariable(t, n) {
      if (
        (this.IfAsyncWeCant("observe a new variable"),
        this._variableObservers === null &&
          (this._variableObservers = new Map()),
        !this.state.variablesState.GlobalVariableExistsWithName(t))
      )
        throw new Error(
          "Cannot observe variable '" +
            t +
            "' because it wasn't declared in the ink story.",
        );
      this._variableObservers.has(t)
        ? this._variableObservers.get(t).push(n)
        : this._variableObservers.set(t, [n]);
    }
    ObserveVariables(t, n) {
      for (let a = 0, i = t.length; a < i; a++)
        this.ObserveVariable(t[a], n[a]);
    }
    RemoveVariableObserver(t, n) {
      if (
        (this.IfAsyncWeCant("remove a variable observer"),
        this._variableObservers !== null)
      ) {
        if (n != null) {
          if (this._variableObservers.has(n))
            if (t != null) {
              let a = this._variableObservers.get(n);
              a != null &&
                (a.splice(a.indexOf(t), 1),
                a.length === 0 && this._variableObservers.delete(n));
            } else this._variableObservers.delete(n);
        } else if (t != null) {
          let a = this._variableObservers.keys();
          for (let i of a) {
            let l = this._variableObservers.get(i);
            l != null &&
              (l.splice(l.indexOf(t), 1),
              l.length === 0 && this._variableObservers.delete(i));
          }
        }
      }
    }
    VariableStateDidChangeEvent(t, n) {
      if (this._variableObservers === null) return;
      let a = this._variableObservers.get(t);
      if (a !== void 0) {
        if (!(n instanceof Q))
          throw new Error(
            "Tried to get the value of a variable that isn't a standard type",
          );
        let i = tt(n, Q);
        for (let l of a) l(t, i.valueObject);
      }
    }
    get globalTags() {
      return this.TagsAtStartOfFlowContainerWithPathString("");
    }
    TagsForContentAtPath(t) {
      return this.TagsAtStartOfFlowContainerWithPathString(t);
    }
    TagsAtStartOfFlowContainerWithPathString(t) {
      let n = new ut(t),
        a = this.ContentAtPath(n).container;
      if (a === null) return C("flowContainer");
      for (;;) {
        let r = a.content[0];
        if (!(r instanceof K)) break;
        a = r;
      }
      let i = !1,
        l = null;
      for (let r of a.content) {
        let u = _(r, A);
        if (u != null)
          u.commandType == A.CommandType.BeginTag
            ? (i = !0)
            : u.commandType == A.CommandType.EndTag && (i = !1);
        else {
          if (!i) break;
          {
            let s = _(r, I);
            s !== null
              ? (l === null && (l = []), s.value !== null && l.push(s.value))
              : this.Error(
                  "Tag contained non-text content. Only plain text is allowed when using globalTags or TagsAtContentPath. If you want to evaluate dynamic content, you need to use story.Continue().",
                );
          }
        }
      }
      return l;
    }
    BuildStringOfHierarchy() {
      let t = new ee();
      return (
        this.mainContentContainer.BuildStringOfHierarchy(
          t,
          0,
          this.state.currentPointer.Resolve(),
        ),
        t.toString()
      );
    }
    BuildStringOfContainer(t) {
      let n = new ee();
      return (
        t.BuildStringOfHierarchy(n, 0, this.state.currentPointer.Resolve()),
        n.toString()
      );
    }
    NextContent() {
      if (
        ((this.state.previousPointer = this.state.currentPointer.copy()),
        !(
          !this.state.divertedPointer.isNull &&
          ((this.state.currentPointer = this.state.divertedPointer.copy()),
          (this.state.divertedPointer = bt.Null),
          this.VisitChangedContainersDueToDivert(),
          !this.state.currentPointer.isNull)
        ) && !this.IncrementContentPointer())
      ) {
        let t = !1;
        (this.state.callStack.CanPop(J.Function)
          ? (this.state.PopCallStack(J.Function),
            this.state.inExpressionEvaluation &&
              this.state.PushEvaluationStack(new en()),
            (t = !0))
          : this.state.callStack.canPopThread
            ? (this.state.callStack.PopThread(), (t = !0))
            : this.state.TryExitFunctionEvaluationFromGame(),
          t && !this.state.currentPointer.isNull && this.NextContent());
      }
    }
    IncrementContentPointer() {
      let t = !0,
        n = this.state.callStack.currentElement.currentPointer.copy();
      if ((n.index++, n.container === null)) return C("pointer.container");
      for (; n.index >= n.container.content.length;) {
        t = !1;
        let a = _(n.container.parent, K);
        if (!(a instanceof K)) break;
        let i = a.content.indexOf(n.container);
        if (i == -1) break;
        if (((n = new bt(a, i)), n.index++, (t = !0), n.container === null))
          return C("pointer.container");
      }
      return (
        t || (n = bt.Null),
        (this.state.callStack.currentElement.currentPointer = n.copy()),
        t
      );
    }
    TryFollowDefaultInvisibleChoice() {
      let t = this._state.currentChoices,
        n = t.filter((i) => i.isInvisibleDefault);
      if (n.length == 0 || t.length > n.length) return !1;
      let a = n[0];
      return a.targetPath === null
        ? C("choice.targetPath")
        : a.threadAtGeneration === null
          ? C("choice.threadAtGeneration")
          : ((this.state.callStack.currentThread = a.threadAtGeneration),
            this._stateSnapshotAtLastNewline !== null &&
              (this.state.callStack.currentThread =
                this.state.callStack.ForkThread()),
            this.ChoosePath(a.targetPath, !1),
            !0);
    }
    NextSequenceShuffleIndex() {
      let t = _(this.state.PopEvaluationStack(), P);
      if (!(t instanceof P))
        return (
          this.Error(
            "expected number of elements in sequence for shuffle index",
          ),
          0
        );
      let n = this.state.currentPointer.container;
      if (n === null) return C("seqContainer");
      if (t.value === null) return C("numElementsIntVal.value");
      let a = t.value,
        i = tt(this.state.PopEvaluationStack(), P).value;
      if (i === null) return C("seqCount");
      let l = i / a,
        r = i % a,
        u = n.path.toString(),
        s = 0;
      for (let f = 0, p = u.length; f < p; f++) s += u.charCodeAt(f) || 0;
      let o = s + l + this.state.storySeed,
        c = new Za(Math.floor(o)),
        h = [];
      for (let f = 0; f < a; ++f) h.push(f);
      for (let f = 0; f <= r; ++f) {
        let p = c.next() % h.length,
          S = h[p];
        if ((h.splice(p, 1), f == r)) return S;
      }
      throw new Error("Should never reach here");
    }
    Error(t) {
      let n = arguments.length > 1 && arguments[1] !== void 0 && arguments[1],
        a = new ne(t);
      throw ((a.useEndLineNumber = n), a);
    }
    Warning(t) {
      this.AddError(t, !0);
    }
    AddError(t) {
      let n = arguments.length > 1 && arguments[1] !== void 0 && arguments[1],
        a = arguments.length > 2 && arguments[2] !== void 0 && arguments[2],
        i = this.currentDebugMetadata,
        l = n ? "WARNING" : "ERROR";
      if (i != null) {
        let r = a ? i.endLineNumber : i.startLineNumber;
        t = "RUNTIME " + l + ": '" + i.fileName + "' line " + r + ": " + t;
      } else
        t = this.state.currentPointer.isNull
          ? "RUNTIME " + l + ": " + t
          : "RUNTIME " + l + ": (" + this.state.currentPointer + "): " + t;
      (this.state.AddError(t, n), n || this.state.ForceEnd());
    }
    Assert(t) {
      let n =
        arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null;
      if (t == 0)
        throw (
          n == null && (n = "Story assert"),
          new Error(n + " " + this.currentDebugMetadata)
        );
    }
    get currentDebugMetadata() {
      let t,
        n = this.state.currentPointer;
      if (
        !n.isNull &&
        n.Resolve() !== null &&
        ((t = n.Resolve().debugMetadata), t !== null)
      )
        return t;
      for (let a = this.state.callStack.elements.length - 1; a >= 0; --a)
        if (
          ((n = this.state.callStack.elements[a].currentPointer),
          !n.isNull &&
            n.Resolve() !== null &&
            ((t = n.Resolve().debugMetadata), t !== null))
        )
          return t;
      for (let a = this.state.outputStream.length - 1; a >= 0; --a)
        if (((t = this.state.outputStream[a].debugMetadata), t !== null))
          return t;
      return null;
    }
    get mainContentContainer() {
      return this._temporaryEvaluationContainer
        ? this._temporaryEvaluationContainer
        : this._mainContentContainer;
    }
  };
  ((yn.inkVersionCurrent = 21),
    (function (e) {
      var t;
      (((t = e.OutputStateChange || (e.OutputStateChange = {}))[
        (t.NoChange = 0)
      ] = "NoChange"),
        (t[(t.ExtendedBeyondNewline = 1)] = "ExtendedBeyondNewline"),
        (t[(t.NewlineRemoved = 2)] = "NewlineRemoved"));
    })(yn || (yn = {})));
  function fh(e, t) {
    var o, c, h, f, p, S, T, x, g, d, m;
    let n = [],
      a = t.speaker,
      i = { bg: t.bg, characters: { ...t.characters }, speaker: t.speaker },
      l = (y) => {
        var b, N;
        return String(
          y === "s"
            ? (b = e.variablesState.ref_speaker) != null
              ? b
              : ""
            : (N = e.variablesState.ref_target) != null
              ? N
              : "",
        );
      },
      r = "_var_",
      u = (y) => {
        var b;
        return String(
          (b = e.variablesState[y.slice(r.length)]) != null ? b : "",
        );
      };
    try {
      for (; e.canContinue;) {
        let y = e.Continue(),
          N = ((o = e.currentTags) != null ? o : []).map((w) => {
            let [D, ...j] = w.split(":"),
              G = j.map((lt) =>
                lt === "_ref" ? l(D) : lt.startsWith(r) ? u(lt) : lt,
              );
            return [D, ...G].join(":");
          }),
          E = N.filter((w) => w.split(":")[0] === "s");
        E.length > 0 && (a = E[E.length - 1].split(":")[1]);
        for (let w of N) {
          let [D, ...j] = w.split(":");
          if (D === "bg") i.bg = (c = j[0]) != null ? c : "";
          else if (D === "s") {
            let [G, lt] = j;
            if (!G || lt === void 0) continue;
            lt === "hide"
              ? delete i.characters[G]
              : lt === "pos" ||
                (i.characters[G] = {
                  ...i.characters[G],
                  expression: lt,
                  motion: (h = i.characters[G]) == null ? void 0 : h.motion,
                });
          } else if (D === "anim") {
            let [G, lt, le] = j;
            if (!G || !lt) continue;
            if (lt === "motion")
              i.characters[G] = {
                ...i.characters[G],
                expression:
                  (p = (f = i.characters[G]) == null ? void 0 : f.expression) !=
                  null
                    ? p
                    : "normal",
                motion: le,
                animLoop: !1,
                animReverse: !1,
              };
            else if (lt === "loop")
              i.characters[G] = {
                ...i.characters[G],
                expression:
                  (T = (S = i.characters[G]) == null ? void 0 : S.expression) !=
                  null
                    ? T
                    : "normal",
                motion: le,
                animLoop: !0,
                animReverse: !1,
              };
            else if (lt === "stop")
              i.characters[G] &&
                (i.characters[G] = {
                  ...i.characters[G],
                  motion: void 0,
                  animLoop: !1,
                  animReverse: !1,
                });
            else if (lt === "speed") {
              let Y = Number(le);
              Number.isFinite(Y) &&
                (i.characters[G] = {
                  ...i.characters[G],
                  expression:
                    (g =
                      (x = i.characters[G]) == null ? void 0 : x.expression) !=
                    null
                      ? g
                      : "normal",
                  animSpeed: Y,
                });
            } else
              lt === "reverse" &&
                (i.characters[G] = {
                  ...i.characters[G],
                  expression:
                    (m =
                      (d = i.characters[G]) == null ? void 0 : d.expression) !=
                    null
                      ? m
                      : "normal",
                  motion: le,
                  animReverse: !0,
                });
          }
        }
        i.speaker = a;
        let M = y ? y.trim() : "";
        (M.length > 0 || N.length > 0) &&
          n.push({ speaker: a, content: M, tags: N });
      }
    } catch (y) {
      console.warn(
        "[inkStepRunner] runtime error during Continue(), stopping here:",
        y,
      );
    }
    let s = e.currentChoices.map((y, b) => {
      var N;
      return { text: y.text, index: b, tags: (N = y.tags) != null ? N : [] };
    });
    return { steps: n, choices: s, visual: i };
  }
  var Er = new Map();
  async function mS(e, t) {
    let n = await fetch(`${t}/${e}/story.json`);
    if (!n.ok)
      throw new Error(
        `[VNLayer static] failed to load story.json for "${e}": ${n.status}`,
      );
    return n.json();
  }
  async function gS(e, t) {
    let n = await mS(e, t),
      a = new yn(n);
    return (
      (a.onError = (i, l) => {
        console.warn(`[VNLayer static onError:${e}] (${l}) ${i}`);
      }),
      { story: a, visual: { bg: "", characters: {}, speaker: "" } }
    );
  }
  function Ar(e = {}) {
    var i;
    let t = (i = e.dataBaseUrl) != null ? i : "./data";
    function n(l) {
      let r = Er.get(l);
      return (
        r ||
          ((r = gS(l, t)),
          Er.set(l, r),
          r.catch(() => {
            Er.delete(l);
          })),
        r
      );
    }
    function a(l, r) {
      let u = fh(r.story, r.visual);
      return ((r.visual = u.visual), u);
    }
    return {
      async init(l) {
        let r = await n(l);
        return a(l, r);
      },
      async choose(l, r) {
        let u = await n(l),
          s = u.story.currentChoices.length;
        if (r < 0 || r >= s)
          return (
            console.warn(
              `[VNLayer static] choose(${r}) ignored: only ${s} choice(s) are currently available (likely a stale #tick timer firing after the story already advanced).`,
            ),
            a(l, u)
          );
        try {
          u.story.ChooseChoiceIndex(r);
        } catch (o) {
          console.warn("[VNLayer static] ChooseChoiceIndex failed:", o);
        }
        return a(l, u);
      },
      async idle(l, r, u) {
        let s = await n(l);
        s.story.variablesState[r] = u;
      },
      async reset(l) {
        Er.delete(l);
        let r = await n(l);
        return a(l, r);
      },
    };
  }
  async function _r(e, t) {
    let n = await fetch(e, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(t),
      credentials: "include",
    });
    if (!n.ok) throw new Error(`story api error: ${n.status}`);
    return n.json();
  }
  function Os(e = {}) {
    var n;
    let t = (n = e.endpoint) != null ? n : "/api/story";
    return {
      init: (a) => _r(t, { action: "init", scenario: a }),
      choose: (a, i) => _r(t, { action: "choose", index: i, scenario: a }),
      idle: async (a, i, l) => {
        await _r(t, { action: "idle", scenario: a, varName: i, value: l });
      },
      reset: (a) => _r(t, { action: "reset", scenario: a }),
    };
  }
  var Or = Os();
  var hh = Or;
  function dh(e) {
    hh = e;
  }
  function mh() {
    return hh;
  }
  var aS = se(iy()),
    iS = se(bn());
  var pr = se(bn());
  var gs = se(bn());
  var Bt = se(bn());
  var Xt = {};
  function ry(e) {
    return "init" in e;
  }
  function mf(e) {
    return typeof e.write == "function";
  }
  function u1(e) {
    return !!e.onMount;
  }
  function ly(e) {
    return "v" in e || "e" in e;
  }
  function as(e) {
    if ("e" in e) throw e.e;
    if ((Xt.env ? Xt.env.MODE : void 0) !== "production" && !("v" in e))
      throw new Error("[Bug] atom state is not initialized");
    return e.v;
  }
  function is(e) {
    return typeof (e == null ? void 0 : e.then) == "function";
  }
  function s1(e) {
    if (!(e instanceof Error)) return !1;
    let t = e.name,
      n = e.message.toLowerCase();
    return (
      (t === "RangeError" || t === "InternalError") &&
      (n.includes("call stack") ||
        n.includes("too much recursion") ||
        n.includes("stack overflow"))
    );
  }
  function uy(e, t, n) {
    if (!n.p.has(e)) {
      n.p.add(e);
      let a = () => n.p.delete(e);
      t.then(a, a);
    }
  }
  function sy(e, t, n) {
    let a = n.get(e),
      i = a == null ? void 0 : a.t,
      l = t.p;
    if (!(i != null && i.size)) return l;
    if (!l.size) return i;
    let r = new Set(i);
    for (let u of l) r.add(u);
    return r;
  }
  function o1(e) {
    return !!e.INTERNAL_onInit;
  }
  var c1 = (e, t, n, ...a) => n.read(...a),
    f1 = (e, t, n, ...a) => n.write(...a),
    h1 = (e, t, n) => n.INTERNAL_onInit(t),
    d1 = (e, t, n, a) => {
      var i;
      return (i = n.onMount) == null ? void 0 : i.call(n, a);
    },
    m1 = (e, t, n) => {
      var a;
      let i = e[0],
        l = i.get(n);
      if (!l) {
        let r = e[6],
          u = e[9];
        ((l = { d: new Map(), p: new Set(), n: 0 }),
          i.set(n, l),
          (a = r.i) == null || a.call(r, n),
          o1(n) && u(e, t, n));
      }
      return l;
    },
    g1 = (e, t) => {
      var n;
      let a = e[1],
        i = e[3],
        l = e[4],
        r = e[5],
        u = e[6],
        s = e[13];
      if (!u.f && !i.size && !l.size && !r.size) return;
      let o = [],
        c = (h) => {
          try {
            h();
          } catch (f) {
            o.push(f);
          }
        };
      do {
        u.f && c(u.f);
        let h = new Set();
        for (let f of i) {
          let p = (n = a.get(f)) == null ? void 0 : n.l;
          if (p) for (let S of p) h.add(S);
        }
        i.clear();
        for (let f of r) h.add(f);
        r.clear();
        for (let f of l) h.add(f);
        l.clear();
        for (let f of h) c(f);
        i.size && s(e, t);
      } while (i.size || r.size || l.size);
      if (o.length) throw new AggregateError(o);
    },
    p1 = (e, t) => {
      let n = e[1],
        a = e[2],
        i = e[3],
        l = e[11],
        r = e[14],
        u = e[17];
      if (!i.size) return;
      let s = [],
        o = [],
        c = new WeakSet(),
        h = new WeakSet(),
        f = [],
        p = [];
      for (let S of i) (f.push(S), p.push(l(e, t, S)));
      for (; f.length;) {
        let S = f.length - 1,
          T = f[S],
          x = p[S];
        if (h.has(T)) {
          (f.pop(), p.pop());
          continue;
        }
        if (c.has(T)) {
          if (a.get(T) === x.n) (s.push(T), o.push(x));
          else if ((Xt.env ? Xt.env.MODE : void 0) !== "production" && a.has(T))
            throw new Error("[Bug] invalidated atom exists");
          (h.add(T), f.pop(), p.pop());
          continue;
        }
        c.add(T);
        for (let g of sy(T, x, n)) c.has(g) || (f.push(g), p.push(l(e, t, g)));
      }
      for (let S = s.length - 1; S >= 0; --S) {
        let T = s[S],
          x = o[S],
          g = !1;
        for (let d of x.d.keys())
          if (d !== T && i.has(d)) {
            g = !0;
            break;
          }
        (g && (a.set(T, x.n), r(e, t, T), u(e, t, T)), a.delete(T));
      }
    },
    gf = new WeakSet(),
    y1 = (e, t, n) => {
      var a, i;
      let l = e[1],
        r = e[2],
        u = e[3],
        s = e[6],
        o = e[7],
        c = e[11],
        h = e[12],
        f = e[13],
        p = e[14],
        S = e[16],
        T = e[17],
        x = e[20],
        g = e[26],
        d = e[28],
        m = c(e, t, n),
        y = d[0];
      if (ly(m)) {
        if ((l.has(n) && r.get(n) !== m.n) || m.m === y) return ((m.m = y), m);
        let Y = !1;
        for (let [re, $] of m.d)
          if (p(e, t, re).n !== $) {
            Y = !0;
            break;
          }
        if (!Y) return ((m.m = y), m);
      }
      let b = !0,
        N = new Set(m.d.keys()),
        E = () => {
          for (let Y of N) m.d.delete(Y);
        },
        M = () => {
          if (l.has(n)) {
            let Y = !u.size;
            (T(e, t, n), Y && (f(e, t), h(e, t)));
          }
        },
        w = (Y) => {
          var re;
          if (Y === n) {
            let Ft = c(e, t, Y);
            if (!ly(Ft))
              if (ry(Y)) x(e, t, Y, Y.init);
              else throw new Error("no atom init");
            return as(Ft);
          }
          let $ = p(e, t, Y);
          try {
            return as($);
          } finally {
            (N.delete(Y),
              m.d.set(Y, $.n),
              is(m.v) && uy(n, m.v, $),
              l.has(n) && ((re = l.get(Y)) == null || re.t.add(n)),
              b || M());
          }
        },
        D,
        j,
        G = {
          get signal() {
            return (D || (D = new AbortController()), D.signal);
          },
          get setSelf() {
            return (
              (Xt.env ? Xt.env.MODE : void 0) !== "production" &&
                console.warn(
                  "[DEPRECATED] setSelf is deprecated and will be removed in v3.",
                ),
              (Xt.env ? Xt.env.MODE : void 0) !== "production" &&
                !mf(n) &&
                console.warn(
                  "setSelf function cannot be used with read-only atom",
                ),
              !j &&
                mf(n) &&
                (j = (...Y) => {
                  if (
                    ((Xt.env ? Xt.env.MODE : void 0) !== "production" &&
                      b &&
                      console.warn("setSelf function cannot be called in sync"),
                    !b)
                  )
                    try {
                      return S(e, t, n, Y);
                    } finally {
                      (f(e, t), h(e, t));
                    }
                }),
              j
            );
          },
        },
        lt = m.n,
        le = r.get(n) === lt;
      try {
        (Xt.env ? Xt.env.MODE : void 0) !== "production" && gf.delete(t);
        let Y = o(e, t, n, w, G);
        if (
          ((Xt.env ? Xt.env.MODE : void 0) !== "production" &&
            gf.has(t) &&
            console.warn(
              "Detected store mutation during atom read. This is not supported.",
            ),
          x(e, t, n, Y),
          is(Y))
        ) {
          g(e, t, Y, () => (D == null ? void 0 : D.abort()));
          let re = () => {
            (E(), M());
          };
          Y.then(re, re);
        } else E();
        return ((a = s.r) == null || a.call(s, n), (m.m = y), m);
      } catch (Y) {
        if (s1(Y)) throw Y;
        return (delete m.v, (m.e = Y), ++m.n, (m.m = y), m);
      } finally {
        ((b = !1),
          m.n !== lt &&
            le &&
            (r.set(n, m.n), u.add(n), (i = s.c) == null || i.call(s, n)));
      }
    },
    v1 = (e, t, n) => {
      let a = e[1],
        i = e[2],
        l = e[11],
        r = [n];
      for (; r.length;) {
        let u = r.pop(),
          s = l(e, t, u);
        for (let o of sy(u, s, a)) {
          let c = l(e, t, o);
          i.get(o) !== c.n && (i.set(o, c.n), r.push(o));
        }
      }
    },
    S1 = (e, t, n, a) => {
      let i = e[3],
        l = e[6],
        r = e[8],
        u = e[11],
        s = e[12],
        o = e[13],
        c = e[14],
        h = e[15],
        f = e[16],
        p = e[17],
        S = e[20],
        T = e[28],
        x = !0,
        g = (m) => as(c(e, t, m)),
        d = (m, ...y) => {
          var b;
          let N = u(e, t, m);
          try {
            if (m === n) {
              if (!ry(m)) throw new Error("atom not writable");
              (Xt.env ? Xt.env.MODE : void 0) !== "production" && gf.add(t);
              let E = N.n,
                M = y[0];
              (S(e, t, m, M),
                p(e, t, m),
                E !== N.n &&
                  (++T[0],
                  i.add(m),
                  h(e, t, m),
                  (b = l.c) == null || b.call(l, m)));
              return;
            } else return f(e, t, m, y);
          } finally {
            x || (o(e, t), s(e, t));
          }
        };
      try {
        return r(e, t, n, g, d, ...a);
      } finally {
        x = !1;
      }
    },
    b1 = (e, t, n) => {
      var a;
      let i = e[1],
        l = e[3],
        r = e[6],
        u = e[11],
        s = e[15],
        o = e[18],
        c = e[19],
        h = u(e, t, n),
        f = i.get(n);
      if (f && h.d.size > 0) {
        for (let [p, S] of h.d)
          if (!f.d.has(p)) {
            let T = u(e, t, p);
            (o(e, t, p).t.add(n),
              f.d.add(p),
              S !== T.n &&
                (l.add(p), s(e, t, p), (a = r.c) == null || a.call(r, p)));
          }
        for (let p of f.d)
          if (!h.d.has(p)) {
            f.d.delete(p);
            let S = c(e, t, p);
            S == null || S.t.delete(n);
          }
      }
    },
    C1 = (e, t, n) => {
      var a;
      let i = e[1],
        l = e[4],
        r = e[6],
        u = e[10],
        s = e[11],
        o = e[12],
        c = e[13],
        h = e[14],
        f = e[16],
        p = e[18],
        S = s(e, t, n),
        T = i.get(n);
      if (!T) {
        h(e, t, n);
        for (let x of S.d.keys()) p(e, t, x).t.add(n);
        if (
          ((T = { l: new Set(), d: new Set(S.d.keys()), t: new Set() }),
          i.set(n, T),
          mf(n) && u1(n))
        ) {
          let x = () => {
            let g = !0,
              d = (...m) => {
                try {
                  return f(e, t, n, m);
                } finally {
                  g || (c(e, t), o(e, t));
                }
              };
            try {
              let m = u(e, t, n, d);
              m &&
                (T.u = () => {
                  g = !0;
                  try {
                    m();
                  } finally {
                    g = !1;
                  }
                });
            } finally {
              g = !1;
            }
          };
          l.add(x);
        }
        (a = r.m) == null || a.call(r, n);
      }
      return T;
    },
    T1 = (e, t, n) => {
      var a, i;
      let l = e[1],
        r = e[5],
        u = e[6],
        s = e[11],
        o = e[19],
        c = s(e, t, n),
        h = l.get(n);
      if (!h || h.l.size) return h;
      let f = !1;
      for (let p of h.t)
        if ((a = l.get(p)) != null && a.d.has(n)) {
          f = !0;
          break;
        }
      if (!f) {
        (h.u && r.add(h.u), (h = void 0), l.delete(n));
        for (let p of c.d.keys()) {
          let S = o(e, t, p);
          S == null || S.t.delete(n);
        }
        (i = u.u) == null || i.call(u, n);
        return;
      }
      return h;
    },
    E1 = (e, t, n, a) => {
      let i = e[11],
        l = e[27],
        r = i(e, t, n),
        u = "v" in r,
        s = r.v;
      if (is(a)) for (let o of r.d.keys()) uy(n, a, i(e, t, o));
      ((r.v = a),
        delete r.e,
        (!u || !Object.is(s, r.v)) && (++r.n, is(s) && l(e, t, s)));
    },
    A1 = (e, t, n) => {
      let a = e[14];
      return as(a(e, t, n));
    },
    _1 = (e, t, n, ...a) => {
      let i = e[3],
        l = e[12],
        r = e[13],
        u = e[16],
        s = i.size;
      try {
        return u(e, t, n, a);
      } finally {
        i.size !== s && (r(e, t), l(e, t));
      }
    },
    O1 = (e, t, n, a) => {
      let i = e[12],
        l = e[13],
        r = e[18],
        u = e[19],
        o = r(e, t, n).l;
      return (
        o.add(a),
        l(e, t),
        i(e, t),
        () => {
          (o.delete(a), u(e, t, n), l(e, t), i(e, t));
        }
      );
    },
    N1 = (e, t, n, a) => {
      let i = e[25],
        l = i.get(n);
      if (!l) {
        ((l = new Set()), i.set(n, l));
        let r = () => i.delete(n);
        n.then(r, r);
      }
      l.add(a);
    },
    w1 = (e, t, n) => {
      let i = e[25].get(n);
      i == null || i.forEach((l) => l());
    },
    oy = new WeakMap();
  function cy(e) {
    let t = oy.get(e);
    if ((Xt.env ? Xt.env.MODE : void 0) !== "production" && !t)
      throw new Error(
        "Store must be created by buildStore to read its building blocks",
      );
    let n = t[24];
    return n ? n(t, e) : t;
  }
  function fy(...e) {
    let t = {
        get(r) {
          return a(n, t, r);
        },
        set(r, ...u) {
          return i(n, t, r, ...u);
        },
        sub(r, u) {
          return l(n, t, r, u);
        },
      },
      n = [
        new WeakMap(),
        new WeakMap(),
        new WeakMap(),
        new Set(),
        new Set(),
        new Set(),
        {},
        c1,
        f1,
        h1,
        d1,
        m1,
        g1,
        p1,
        y1,
        v1,
        S1,
        b1,
        C1,
        T1,
        E1,
        A1,
        _1,
        O1,
        void 0,
        new WeakMap(),
        N1,
        w1,
        [0],
      ].map((r, u) => e[u] || r);
    oy.set(t, Object.freeze(n));
    let a = n[21],
      i = n[22],
      l = n[23];
    return t;
  }
  var ls = {},
    x1 = 0;
  function Dt(e, t) {
    let n = `atom${++x1}`,
      a = {
        toString() {
          return (ls.env ? ls.env.MODE : void 0) !== "production" &&
            this.debugLabel
            ? n + ":" + this.debugLabel
            : n;
        },
      };
    return (
      typeof e == "function"
        ? (a.read = e)
        : ((a.init = e), (a.read = M1), (a.write = D1)),
      t && (a.write = t),
      a
    );
  }
  function M1(e) {
    return e(this);
  }
  function D1(e, t, n) {
    return t(this, typeof n == "function" ? n(e(this)) : n);
  }
  var hy;
  function dy() {
    return hy ? hy() : fy();
  }
  var ar;
  function rs() {
    return (
      ar ||
        ((ar = dy()),
        (ls.env ? ls.env.MODE : void 0) !== "production" &&
          (globalThis.__JOTAI_DEFAULT_STORE__ ||
            (globalThis.__JOTAI_DEFAULT_STORE__ = ar),
          globalThis.__JOTAI_DEFAULT_STORE__ !== ar &&
            console.warn(
              "Detected multiple Jotai instances. It may cause unexpected behavior with the default store. https://github.com/pmndrs/jotai/discussions/2044",
            ))),
      ar
    );
  }
  var ie = se(bn(), 1);
  var R1 = (0, ie.createContext)(void 0);
  function z1(e) {
    let t = (0, ie.useContext)(R1);
    return (e == null ? void 0 : e.store) || t || rs();
  }
  var yf = (e) => typeof (e == null ? void 0 : e.then) == "function",
    vf = (e) => {
      e.status ||
        ((e.status = "pending"),
        e.then(
          (t) => {
            ((e.status = "fulfilled"), (e.value = t));
          },
          (t) => {
            ((e.status = "rejected"), (e.reason = t));
          },
        ));
    },
    V1 =
      ie.default.use ||
      ((e) => {
        if (e.status === "pending") throw e;
        if (e.status === "fulfilled") return e.value;
        throw e.status === "rejected" ? e.reason : (vf(e), e);
      }),
    pf = new WeakMap(),
    my = (e, t, n) => {
      let a = cy(e),
        i = a[26],
        l = pf.get(t);
      return (
        l ||
          ((l = new Promise((r, u) => {
            let s = t,
              o = (f) => (p) => {
                s === f && r(p);
              },
              c = (f) => (p) => {
                s === f && u(p);
              },
              h = () => {
                try {
                  let f = n();
                  yf(f)
                    ? (pf.set(f, l), (s = f), f.then(o(f), c(f)), i(a, e, f, h))
                    : r(f);
                } catch (f) {
                  u(f);
                }
              };
            (t.then(o(t), c(t)), i(a, e, t, h));
          })),
          pf.set(t, l)),
        l
      );
    };
  function Ee(e, t) {
    let { delay: n, unstable_promiseStatus: a = !ie.default.use } = t || {},
      i = z1(t),
      [[l, r, u], s] = (0, ie.useReducer)(
        (c) => {
          let h = i.get(e);
          return Object.is(c[0], h) && c[1] === i && c[2] === e ? c : [h, i, e];
        },
        void 0,
        () => [i.get(e), i, e],
      ),
      o = l;
    if (
      ((r !== i || u !== e) && (s(), (o = i.get(e))),
      (0, ie.useEffect)(() => {
        let c = i.sub(e, () => {
          if (a)
            try {
              let h = i.get(e);
              yf(h) && vf(my(i, h, () => i.get(e)));
            } catch {}
          if (typeof n == "number") {
            (console.warn(`[DEPRECATED] delay option is deprecated and will be removed in v3.

Migration guide:

Create a custom hook like the following.

function useAtomValueWithDelay<Value>(
  atom: Atom<Value>,
  options: { delay: number },
): Value {
  const { delay } = options
  const store = useStore(options)
  const [value, setValue] = useState(() => store.get(atom))
  useEffect(() => {
    const unsub = store.sub(atom, () => {
      setTimeout(() => setValue(store.get(atom)), delay)
    })
    return unsub
  }, [store, atom, delay])
  return value
}
`),
              setTimeout(s, n));
            return;
          }
          s();
        });
        return (s(), c);
      }, [i, e, n, a]),
      (0, ie.useDebugValue)(o),
      yf(o))
    ) {
      let c = my(i, o, () => i.get(e));
      return (a && vf(c), V1(c));
    }
    return o;
  }
  function B() {
    return rs();
  }
  function gy(e, t) {
    return t != null && t.aborted
      ? Promise.resolve()
      : new Promise((n) => {
          let a = setTimeout(() => {
              (t == null || t.removeEventListener("abort", i), n());
            }, e),
            i = () => {
              (clearTimeout(a), n());
            };
          t == null || t.addEventListener("abort", i, { once: !0 });
        });
  }
  var Sf = new Map(),
    ir = new Map();
  function qi(e) {
    let t = Sf.get(e);
    return (t || ((t = { generation: 0, controller: null }), Sf.set(e, t)), t);
  }
  function py(e) {
    let t = qi(e);
    return ((t.generation += 1), t.generation);
  }
  function yy(e, t) {
    return qi(e).generation !== t;
  }
  function Yi(e, t) {
    let n = qi(e),
      a = new AbortController();
    return ((n.controller = a), gy(t, a.signal));
  }
  function vy(e) {
    var t;
    (ir.set(e, !0), (t = qi(e).controller) == null || t.abort());
  }
  function Sy(e) {
    var n;
    let t = (n = ir.get(e)) != null ? n : !1;
    return (ir.set(e, !1), t);
  }
  function by(e) {
    var n;
    let t = qi(e);
    ((t.generation += 1),
      (n = t.controller) == null || n.abort(),
      ir.set(e, !1));
  }
  function Cy(e) {
    var t;
    ((t = qi(e).controller) == null || t.abort(), Sf.delete(e), ir.delete(e));
  }
  var Ya = new Map();
  function It(e) {
    Ya.set(e.key, {
      def: e,
      config: e.defaultConfig !== void 0 ? { ...e.defaultConfig } : void 0,
    });
  }
  function he(e, t) {
    let n = Ya.get(t);
    if (!n) {
      console.warn(
        `[VNLayer] registerAlias: unknown canonical tag "${t}" for alias "${e}"`,
      );
      return;
    }
    if (Ya.has(e)) {
      console.warn(
        `[VNLayer] registerAlias: alias "${e}" is already taken, skipping`,
      );
      return;
    }
    Ya.set(e, n);
  }
  function bf(e, t) {
    let n = Ya.get(e);
    if (!n) {
      console.warn(`[VNLayer] setTagConfig: unknown tag "${e}"`);
      return;
    }
    n.config = { ...n.config, ...t };
  }
  function Cf(e) {
    var t;
    return (t = Ya.get(e)) == null ? void 0 : t.config;
  }
  function Ae(e) {
    console.warn("[VNLayer] unknown tag or invalid arguments:", e);
  }
  async function Ty(e, t, n) {
    let a = Ya.get(e);
    if (!a) {
      Ae(e);
      return;
    }
    await a.def.run({ args: t, handlers: n, config: a.config });
  }
  function Gn(e) {
    It({
      key: e.key,
      defaultConfig: e.defaultConfig,
      run: async ({ args: t, config: n, handlers: a }) => {
        var o, c;
        let i = B(),
          l = e.atomFamily(a.atomKey),
          r = e.resolve(t, n, {
            atomKey: a.atomKey,
            instanceId: a.instanceId,
            store: i,
          });
        if (r === void 0) return;
        i.set(l, r);
        let u = (o = e.resolveWaitMs) == null ? void 0 : o.call(e, t, n);
        u && (await Yi(a.atomKey, u));
        let s = (c = e.resolveClearAfterMs) == null ? void 0 : c.call(e, t, n);
        s !== void 0 &&
          e.clearValue !== void 0 &&
          setTimeout(() => i.set(l, e.clearValue), s);
      },
    });
  }
  var Tf = {};
  function lr(e) {
    Tf = { ...Tf, ...e };
  }
  function Ef(e) {
    return Tf[e];
  }
  function _t(e, t) {
    let n = null,
      a = new Map(),
      i = new Set();
    function l(u) {
      let s;
      if (t === void 0) s = a.get(u);
      else
        for (let [c, h] of a)
          if (t(c, u)) {
            s = h;
            break;
          }
      if (s !== void 0)
        if (n != null && n(s[1], u)) l.remove(u);
        else return s[0];
      let o = e(u);
      return (a.set(u, [o, Date.now()]), r("CREATE", u, o), o);
    }
    function r(u, s, o) {
      for (let c of i) c({ type: u, param: s, atom: o });
    }
    return (
      (l.unstable_listen = (u) => (
        i.add(u),
        () => {
          i.delete(u);
        }
      )),
      (l.getParams = () => a.keys()),
      (l.remove = (u) => {
        if (t === void 0) {
          if (!a.has(u)) return;
          let [s] = a.get(u);
          (a.delete(u), r("REMOVE", u, s));
        } else
          for (let [s, [o]] of a)
            if (t(s, u)) {
              (a.delete(s), r("REMOVE", s, o));
              break;
            }
      }),
      (l.setShouldRemove = (u) => {
        if (((n = u), !!n))
          for (let [s, [o, c]] of a)
            n(c, s) && (a.delete(s), r("REMOVE", s, o));
      }),
      l
    );
  }
  var k1 = {
      messageWindow: {
        interactive: !0,
        offset: 130,
        autoHideOnCharHide: !0,
        autoHideOnBgChange: !0,
      },
      choice: {
        spacing: 8,
        anchor: void 0,
        offset: 130,
        interactive: !0,
        autoClearOnChoose: !0,
      },
      backlog: {
        mode: "perInstance",
        show: !0,
        anchor: void 0,
        offset: void 0,
      },
      character: { clickable: !0 },
      font: {},
      stage: { stickToViewport: !0, heightPx: void 0, widthPx: void 0 },
    },
    Ey = "__global__",
    ss = new Map();
  function Pi(e, t) {
    return t ? { ...e, ...t } : e;
  }
  function Ay(e, t) {
    return t
      ? {
          messageWindow: Pi(e.messageWindow, t.messageWindow),
          choice: Pi(e.choice, t.choice),
          backlog: Pi(e.backlog, t.backlog),
          character: Pi(e.character, t.character),
          font: Pi(e.font, t.font),
          stage: Pi(e.stage, t.stage),
        }
      : e;
  }
  function L1() {
    return Ay(k1, ss.get(Ey));
  }
  function mt(e, t) {
    var i;
    let n = t != null ? t : Ey,
      a = (i = ss.get(n)) != null ? i : {};
    ss.set(n, {
      messageWindow: { ...a.messageWindow, ...e.messageWindow },
      choice: { ...a.choice, ...e.choice },
      backlog: { ...a.backlog, ...e.backlog },
      character: { ...a.character, ...e.character },
      font: { ...a.font, ...e.font },
      stage: { ...a.stage, ...e.stage },
    });
  }
  function _e(e) {
    let t = L1();
    return e ? Ay(t, ss.get(e)) : t;
  }
  var Hn = _t((e) => Dt(null)),
    rr = new Map(),
    Af = new Map();
  function va(e) {
    let t = Af.get(e);
    t && (clearTimeout(t), Af.delete(e));
  }
  function _y(e, t) {
    rr.set(e, t);
  }
  function U1(e) {
    var n;
    let t = (n = rr.get(e)) != null ? n : !1;
    return (rr.set(e, !1), t);
  }
  function Oy(e, t, n, a) {
    va(e);
    let i = U1(e);
    B().set(Hn(e), { speaker: t, content: n, fadeIn: i, typeSpeedMs: a });
  }
  function os(e, t, n) {
    if (t === "hide") {
      (va(e), B().set(Hn(e), null));
      return;
    }
    if (t === "transient") {
      va(e);
      let a = setTimeout(
        () => {
          B().set(Hn(e), null);
        },
        n != null ? n : 4e3,
      );
      Af.set(e, a);
      return;
    }
    va(e);
  }
  function Ny(e) {
    (va(e), B().set(Hn(e), null));
  }
  function wy(e, t) {
    let n = B(),
      a = Hn(e),
      i = n.get(a);
    i && i.speaker === t && (va(e), n.set(a, null));
  }
  function xy(e) {
    (va(e), rr.delete(e), B().set(Hn(e), null));
  }
  function My(e) {
    (va(e), rr.delete(e), Hn.remove(e));
  }
  var Xi = _t((e) => Dt(""));
  function Dy(e, t, n) {
    let a = B(),
      i = Xi(e),
      l = a.get(i) !== n;
    (a.set(i, n), l && _e(t).messageWindow.autoHideOnBgChange && Ny(e));
  }
  function Ry(e, t) {
    B().set(Xi(e), t);
  }
  function zy(e) {
    B().set(Xi(e), "");
  }
  function Vy(e) {
    Xi.remove(e);
  }
  It({
    key: "bg",
    run: ({ args: e, handlers: t }) => {
      let [n, a, i] = e;
      (a === "color" && i && lr({ [n]: { color: i } }),
        Dy(t.atomKey, t.instanceId, n));
    },
  });
  function ky(e, t, n) {
    var a;
    if (e !== void 0 && e.trim() !== "") {
      let i = Number(e);
      if (Number.isFinite(i)) return i;
    }
    return (a = t[e != null ? e : ""]) != null ? a : n;
  }
  function St(e) {
    return e === void 0 || e.trim() === "" ? !1 : Number.isFinite(Number(e));
  }
  function de(e) {
    if (e === "on") return !0;
    if (e === "off") return !1;
  }
  var _f = {};
  function ur(e) {
    _f = { ..._f, ...e };
  }
  function Sa(e) {
    return _f[e];
  }
  var sr = _t((e) => Dt(""));
  function or(e, t) {
    B().set(sr(e), t);
  }
  function Ly(e) {
    B().set(sr(e), "");
  }
  function Uy(e) {
    sr.remove(e);
  }
  var ba = _t((e) => Dt({}));
  function Ca(e, t) {
    let n = B(),
      a = ba(e);
    n.set(a, t(n.get(a)));
  }
  function jy(e, t, n) {
    Ca(e, (a) => ({ ...a, [t]: { expression: n } }));
  }
  function Gy(e, t, n) {
    Ca(e, (a) => {
      var i, l, r;
      return {
        ...a,
        [t]: {
          expression:
            (l = (i = a[t]) == null ? void 0 : i.expression) != null
              ? l
              : "normal",
          motion: n,
          animLoop: !1,
          animReverse: !1,
          animSpeed: (r = a[t]) == null ? void 0 : r.animSpeed,
        },
      };
    });
  }
  function Hy(e, t, n) {
    Ca(e, (a) => {
      var i, l;
      return {
        ...a,
        [t]: {
          ...a[t],
          expression:
            (l = (i = a[t]) == null ? void 0 : i.expression) != null
              ? l
              : "normal",
          motion: n,
          animLoop: !0,
          animReverse: !1,
        },
      };
    });
  }
  function Wy(e, t) {
    Ca(e, (n) =>
      n[t]
        ? {
            ...n,
            [t]: { ...n[t], motion: void 0, animLoop: !1, animReverse: !1 },
          }
        : n,
    );
  }
  function Fy(e, t, n) {
    Ca(e, (a) => {
      var i, l;
      return {
        ...a,
        [t]: {
          ...a[t],
          expression:
            (l = (i = a[t]) == null ? void 0 : i.expression) != null
              ? l
              : "normal",
          animSpeed: n,
        },
      };
    });
  }
  function qy(e, t, n) {
    Ca(e, (a) => {
      var i, l;
      return {
        ...a,
        [t]: {
          ...a[t],
          expression:
            (l = (i = a[t]) == null ? void 0 : i.expression) != null
              ? l
              : "normal",
          motion: n,
          animReverse: !0,
        },
      };
    });
  }
  function Yy(e, t, n) {
    (Ca(e, (a) => {
      if (!(n in a)) return a;
      let i = { ...a };
      return (delete i[n], i);
    }),
      _e(t).messageWindow.autoHideOnCharHide && wy(e, n));
  }
  function Py(e, t) {
    Ca(e, (n) => {
      var i;
      let a = {};
      for (let [l, r] of Object.entries(t))
        a[l] = { ...r, gaze: (i = n[l]) == null ? void 0 : i.gaze };
      return a;
    });
  }
  function Xy(e) {
    B().set(ba(e), {});
  }
  function Iy(e) {
    ba.remove(e);
  }
  var Pa = _t((e) => Dt({}));
  function fs(e, t, n, a) {
    let i = B(),
      l = Pa(e),
      r = i.get(l);
    if (n === "reset") {
      if (!(t in r)) return;
      let u = { ...r };
      (delete u[t], i.set(l, u));
      return;
    }
    i.set(l, { ...r, [t]: { ...n, durationMs: a } });
  }
  function Qy(e) {
    B().set(Pa(e), {});
  }
  function Zy(e) {
    Pa.remove(e);
  }
  var j1 = { posPresets: { center: { originX: 50, originY: 50 } } };
  It({
    key: "sprite",
    defaultConfig: j1,
    run: ({ args: e, handlers: t, config: n }) => {
      let { atomKey: a, instanceId: i } = t,
        [l, r, ...u] = e;
      if ((l && or(a, l), !(!l || r === void 0))) {
        if (r === "hide") {
          Yy(a, i, l);
          return;
        }
        if (r === "initPos") {
          let [s, o] = u;
          St(s) &&
            St(o) &&
            ur({ [l]: { originX: Number(s), originY: Number(o) } });
          return;
        }
        if (r === "pos") {
          let [s, o, c] = u;
          if (s === "reset") {
            fs(a, l, "reset");
            return;
          }
          if (St(s) && St(o)) {
            let f = St(c) ? Number(c) : void 0;
            fs(a, l, { originX: Number(s), originY: Number(o) }, f);
            return;
          }
          let h = n.posPresets[s];
          if (h) {
            let f = St(o) ? Number(o) : void 0;
            fs(a, l, h, f);
          }
          return;
        }
        jy(a, l, r);
      }
    },
  });
  he("s", "sprite");
  var G1 = { speeds: { slow: 0.5, normal: 1, fast: 2 } };
  It({
    key: "anim",
    defaultConfig: G1,
    run: ({ args: e, handlers: t, config: n }) => {
      let [a, i, l] = e;
      if (!a || !i) return;
      let { atomKey: r } = t;
      switch (i) {
        case "motion":
          Gy(r, a, l);
          break;
        case "loop":
          Hy(r, a, l);
          break;
        case "stop":
          Wy(r, a);
          break;
        case "speed": {
          let u = St(l) ? Number(l) : n.speeds[l];
          u !== void 0 && Fy(r, a, u);
          break;
        }
        case "reverse":
          qy(r, a, l);
          break;
        default:
          Ae(["anim", a, i, l].filter(Boolean).join(":"));
      }
    },
  });
  he("a", "anim");
  function H1() {
    return Dt({ target: "", scale: 1, originX: 50, originY: 50 });
  }
  function W1() {
    return Dt({ nonce: 0, amplitude: 0, duration: 300 });
  }
  function F1() {
    return Dt(null);
  }
  function q1() {
    var e, t;
    return Dt(
      (t = (e = Cf("type")) == null ? void 0 : e.speeds.normal) != null
        ? t
        : 30,
    );
  }
  var Xa = _t((e) => H1()),
    cr = _t((e) => W1()),
    fr = _t((e) => F1()),
    Ii = _t((e) => q1());
  function Jy(e) {
    (Xa.remove(e), cr.remove(e), fr.remove(e));
  }
  var Y1 = {
    scales: { zoom: 1.6, zoomout: 0.8, reset: 1 },
    durations: { zoom: 500, zoomout: 500, reset: 500 },
  };
  Gn({
    key: "cam",
    defaultConfig: Y1,
    atomFamily: Xa,
    resolve: (e, t, { atomKey: n, store: a }) => {
      var c, h, f;
      let i = e[0],
        l = e[1],
        r = St(i) ? Number(i) : (c = t.scales[i]) != null ? c : t.scales.reset,
        u = a.get(Xa(n)),
        s = a.get(Pa(n)),
        o = l
          ? (f = (h = s[l]) != null ? h : Sa(l)) != null
            ? f
            : { originX: u.originX, originY: u.originY }
          : { originX: u.originX, originY: u.originY };
      return {
        target: l != null ? l : u.target,
        scale: r,
        originX: o.originX,
        originY: o.originY,
      };
    },
    resolveWaitMs: (e, t) => {
      var i;
      let n = e[0],
        a = (i = t.durations[n]) != null ? i : t.durations.reset;
      return St(e[2]) ? Number(e[2]) : a;
    },
  });
  he("c", "cam");
  Gn({
    key: "gaze",
    atomFamily: ba,
    resolve: (e, t, { atomKey: n, store: a }) => {
      var s;
      let [i, l, r] = e,
        u = a.get(ba(n));
      if (l === "reset") {
        if (!u[i]) return;
        let { gaze: o, ...c } = u[i];
        return { ...u, [i]: c };
      }
      if (St(l) && St(r)) {
        let o = (s = u[i]) != null ? s : { expression: "normal" };
        return { ...u, [i]: { ...o, gaze: { x: Number(l), y: Number(r) } } };
      }
    },
  });
  he("g", "gaze");
  var P1 = { durations: { short: 500, long: 1200, serve: 3e3 } };
  It({
    key: "wait",
    defaultConfig: P1,
    run: async ({ args: e, handlers: t, config: n }) => {
      let a = ky(e[0], n.durations, 500);
      await Yi(t.atomKey, a);
    },
  });
  var X1 = {
    colors: {
      white: { color: "rgba(255,255,255,0.8)", durationMs: 400 },
      red: { color: "rgba(255,0,0,0.5)", durationMs: 400 },
    },
  };
  Gn({
    key: "flash",
    defaultConfig: X1,
    atomFamily: fr,
    resolve: (e, t) => {
      var a;
      let n = (a = t.colors[e[0]]) != null ? a : t.colors.white;
      return { color: n.color, durationMs: n.durationMs };
    },
    resolveClearAfterMs: (e, t) => {
      var n;
      return ((n = t.colors[e[0]]) != null ? n : t.colors.white).durationMs;
    },
    clearValue: null,
  });
  he("f", "flash");
  var I1 = {
    presets: {
      short: { amplitude: 6, duration: 300 },
      long: { amplitude: 12, duration: 600 },
    },
  };
  Gn({
    key: "shake",
    defaultConfig: I1,
    atomFamily: cr,
    resolve: (e, t) => {
      var a;
      if (St(e[0]) && St(e[1]))
        return {
          nonce: Date.now(),
          amplitude: Number(e[0]),
          duration: Number(e[1]),
        };
      let n = (a = t.presets[e[0]]) != null ? a : t.presets.short;
      return {
        nonce: Date.now(),
        amplitude: n.amplitude,
        duration: n.duration,
      };
    },
  });
  var Nf = new Map(),
    wf = new Map();
  function $y(e, t) {
    B().set(Ii(e), t);
  }
  function tv(e) {
    return B().get(Ii(e));
  }
  function ev(e, t, n) {
    (Nf.set(e, t), n !== void 0 && wf.set(e, n));
  }
  function nv(e) {
    var t;
    return (t = Nf.get(e)) != null ? t : !1;
  }
  function av(e) {
    var t;
    return (t = wf.get(e)) != null ? t : 1500;
  }
  function iv(e) {
    (Nf.delete(e), wf.delete(e), Ii.remove(e));
  }
  var Q1 = {
    speeds: { super_slow: 150, slow: 70, normal: 30, fast: 12, off: 0 },
    readingBufferMs: 1500,
  };
  It({
    key: "type",
    defaultConfig: Q1,
    run: ({ args: e, handlers: t, config: n }) => {
      if (e[0] === "wait") {
        ev(t.atomKey, e[1] === "on", n.readingBufferMs);
        return;
      }
      let a = St(e[0]) ? Number(e[0]) : n.speeds[e[0]];
      a !== void 0 && $y(t.atomKey, a);
    },
  });
  he("t", "type");
  var hr = _t((e) => Dt(!1));
  function rv(e, t) {
    B().set(hr(e), !t);
  }
  function uv(e) {
    B().set(hr(e), !1);
  }
  function sv(e) {
    hr.remove(e);
  }
  var dr = _t((e) => Dt([])),
    mr = _t((e) => Dt(!1));
  function xf(e, t) {
    B().set(dr(e), t);
  }
  function cv(e, t) {
    B().set(mr(e), !t);
  }
  function fv(e) {
    (B().set(dr(e), []), B().set(mr(e), !1));
  }
  function hv(e) {
    (dr.remove(e), mr.remove(e));
  }
  var hs = [],
    mv = 0,
    Mf = new Set();
  function gv() {
    Mf.forEach((e) => e());
  }
  function pv(e, t) {
    ((mv += 1), (hs = [...hs, { ...e, instanceId: t, seq: mv }]), gv());
  }
  function yv() {
    ((hs = []), gv());
  }
  function Df() {
    return hs;
  }
  function vv(e) {
    return (Mf.add(e), () => Mf.delete(e));
  }
  var Qi = _t((e) => Dt([]));
  function Sv(e, t, n) {
    let a = B(),
      i = Qi(e);
    (a.set(i, [...a.get(i), n]), _e(t).backlog.mode === "global" && pv(n, t));
  }
  function bv(e, t, n, a) {
    Sv(e, t, { kind: "line", speaker: n, content: a });
  }
  function Cv(e, t, n, a) {
    Sv(e, t, { kind: "choice", number: n, text: a });
  }
  function Tv(e, t) {
    (B().set(Qi(e), []), _e(t).backlog.mode === "global" && yv());
  }
  function Ev(e) {
    B().set(Qi(e), []);
  }
  function Av(e) {
    Qi.remove(e);
  }
  var Z1 = { transientDurationMs: 4e3 };
  It({
    key: "ui",
    defaultConfig: Z1,
    run: ({ args: e, handlers: t, config: n }) => {
      let { atomKey: a, instanceId: i } = t,
        [l, r, ...u] = e,
        s = u.join(":");
      if (l === "messageWindow") {
        if (r === "mode")
          return s === "hide"
            ? os(a, "hide")
            : s === "transient"
              ? os(a, "transient", n.transientDurationMs)
              : os(a, "persist");
        if (r === "fade") return _y(a, s === "in");
        if (r === "show") {
          let o = de(s);
          o !== void 0 && rv(a, o);
          return;
        }
        if (r === "interactive") {
          let o = de(s);
          o !== void 0 && mt({ messageWindow: { interactive: o } }, i);
          return;
        }
        if (r === "skin") return mt({ messageWindow: { skin: s } }, i);
        if (r === "offset") {
          let o = Number(s);
          return Number.isFinite(o)
            ? mt({ messageWindow: { offset: o } }, i)
            : void 0;
        }
        if (r === "autoHideOnCharHide") {
          let o = de(s);
          o !== void 0 && mt({ messageWindow: { autoHideOnCharHide: o } }, i);
          return;
        }
        if (r === "autoHideOnBgChange") {
          let o = de(s);
          o !== void 0 && mt({ messageWindow: { autoHideOnBgChange: o } }, i);
          return;
        }
        return Ae(["ui", l, r, s].filter(Boolean).join(":"));
      }
      if (l === "choice") {
        if (r === "show") {
          let o = de(s);
          o !== void 0 && cv(a, o);
          return;
        }
        if (r === "autoClearOnChoose") {
          let o = de(s);
          o !== void 0 && mt({ choice: { autoClearOnChoose: o } }, i);
          return;
        }
        if (r === "interactive") {
          let o = de(s);
          o !== void 0 && mt({ choice: { interactive: o } }, i);
          return;
        }
        if (r === "spacing") {
          let o = Number(s);
          return Number.isFinite(o)
            ? mt({ choice: { spacing: o } }, i)
            : void 0;
        }
        if (r === "skin") return mt({ choice: { skin: s } }, i);
        if (r === "anchor")
          return mt({ choice: { anchor: s === "reset" ? void 0 : s } }, i);
        if (r === "offset") {
          let o = Number(s);
          return Number.isFinite(o) ? mt({ choice: { offset: o } }, i) : void 0;
        }
        return Ae(["ui", l, r, s].filter(Boolean).join(":"));
      }
      if (l === "backlog") {
        if (r === "clear") return Tv(a, i);
        if (r === "show") {
          let o = de(s);
          o !== void 0 && mt({ backlog: { show: o } }, i);
          return;
        }
        if (r === "skin") return mt({ backlog: { skin: s } }, i);
        if (r === "mode" && (s === "global" || s === "perInstance"))
          return mt({ backlog: { mode: s } }, i);
        if (r === "anchor")
          return mt({ backlog: { anchor: s === "reset" ? void 0 : s } }, i);
        if (r === "offset") {
          let o = Number(s);
          return Number.isFinite(o)
            ? mt({ backlog: { offset: o } }, i)
            : void 0;
        }
        return Ae(["ui", l, r, s].filter(Boolean).join(":"));
      }
      if (l === "character") {
        if (r === "clickable") {
          let o = de(s);
          o !== void 0 && mt({ character: { clickable: o } }, i);
          return;
        }
        return Ae(["ui", l, r, s].filter(Boolean).join(":"));
      }
      if (l === "font") {
        if (r === "family") return mt({ font: { family: s } }, i);
        if (r === "size") {
          let o = Number(s);
          return Number.isFinite(o) ? mt({ font: { sizePx: o } }, i) : void 0;
        }
        return Ae(["ui", l, r, s].filter(Boolean).join(":"));
      }
      if (l === "stage") {
        if (r === "stickToViewport") {
          let o = de(s);
          o !== void 0 && mt({ stage: { stickToViewport: o } }, i);
          return;
        }
        if (r === "height") {
          let o = Number(s);
          return Number.isFinite(o) && o > 0
            ? mt({ stage: { heightPx: o } }, i)
            : void 0;
        }
        if (r === "width") {
          let o = Number(s);
          return Number.isFinite(o) && o > 0
            ? mt({ stage: { widthPx: o } }, i)
            : void 0;
        }
        return Ae(["ui", l, r, s].filter(Boolean).join(":"));
      }
      Ae(["ui", l, r, s].filter(Boolean).join(":"));
    },
  });
  he("u", "ui");
  var Ov = new Map();
  function Rf(e) {
    for (let [t, n] of Object.entries(e)) Ov.set(t, n);
  }
  function zf(e) {
    return Ov.get(e);
  }
  var gr = new Map();
  function Nv(e, t) {
    gr.set(e, t);
  }
  function wv(e) {
    let t = gr.get(e);
    return (gr.delete(e), t);
  }
  function xv(e) {
    gr.delete(e);
  }
  function Mv(e) {
    gr.delete(e);
  }
  function Rv(e) {
    return e.startsWith("@")
      ? `#${e.slice(1)}`
      : e.startsWith(".")
        ? e
        : `[data-vn-id="${e}"]`;
  }
  function zv(e) {
    typeof window != "undefined" &&
      window.open(e, "_blank", "noopener,noreferrer");
  }
  function Vv(e, t) {
    if (typeof window == "undefined" || typeof document == "undefined") return;
    let n = Number(e),
      a;
    if (Number.isFinite(n) && e.trim() !== "") a = n;
    else {
      let o = null;
      try {
        o = document.querySelector(Rv(e));
      } catch (c) {
        console.warn(
          `[VNLayer] web:scroll: invalid selector/target "${e}", ignoring:`,
          c,
        );
      }
      o && (a = window.scrollY + o.getBoundingClientRect().top);
    }
    if (a === void 0) return;
    if (!t) {
      window.scrollTo({ top: a, behavior: "smooth" });
      return;
    }
    let i = window.scrollY,
      l = a - i,
      r = performance.now(),
      u = (o) => (o < 0.5 ? 2 * o * o : 1 - Math.pow(-2 * o + 2, 2) / 2),
      s = (o) => {
        let c = o - r,
          h = Math.min(c / t, 1);
        (window.scrollTo(0, i + l * u(h)), h < 1 && requestAnimationFrame(s));
      };
    requestAnimationFrame(s);
  }
  function kv(e, t, n) {
    typeof window != "undefined" &&
      window.dispatchEvent(
        new CustomEvent("vnlayer:emit", {
          detail: { name: t, payload: n, instanceId: e },
        }),
      );
  }
  It({
    key: "web",
    run: ({ args: e, handlers: t }) => {
      let { atomKey: n, instanceId: a } = t,
        [i, l, r] = e,
        u = (s) => {
          if (s.startsWith("/")) return s;
          let o = zf(s);
          return (
            o ||
            (console.warn(
              `[VNLayer] web:${i}:${s} \u306F\u8A31\u53EF\u6E08\u307F\u30EA\u30F3\u30AF\u306B\u767B\u9332\u3055\u308C\u3066\u3044\u307E\u305B\u3093(\u30D6\u30ED\u30C3\u30AF\u3057\u307E\u3057\u305F)`,
            ),
            null)
          );
        };
      switch (i) {
        case "goto": {
          let s = u(l);
          s && Nv(n, s);
          break;
        }
        case "open": {
          let s = u(l);
          s && zv(s);
          break;
        }
        case "scroll":
          Vv(l, St(r) ? Number(r) : void 0);
          break;
        case "emit": {
          let [, s, o] = e;
          if (!s) {
            console.warn(
              `[VNLayer] web:emit \u306E\u66F8\u5F0F\u304C\u4E0D\u6B63\u3067\u3059(# web:emit:<eventName>:<value>): ${e.join(":")}`,
            );
            break;
          }
          let c = o;
          if (St(o)) c = Number(o);
          else {
            let h = de(o);
            h !== void 0 && (c = h);
          }
          kv(a, s, c);
          break;
        }
        default:
          Ae(["web", i, l].filter(Boolean).join(":"));
      }
    },
  });
  function Vf(e) {
    return e.replace(/^[#.@]/, "");
  }
  var kf = new Map();
  function Lv(e, t) {
    kf.set(Vf(e), t);
  }
  function Uv(e) {
    kf.delete(Vf(e));
  }
  async function Bv(e, t, n) {
    let a = kf.get(Vf(e));
    if (!a) {
      console.warn(
        `[VNLayer] emit: no mounted instance found for selector "${e}" (is it mounted yet?)`,
      );
      return;
    }
    await a.setContextVars(t, n);
  }
  It({
    key: "emit",
    run: ({ args: e }) => {
      let [t, n, a] = e;
      if (!t || !n) {
        console.warn(
          `[VNLayer] emit \u306E\u66F8\u5F0F\u304C\u4E0D\u6B63\u3067\u3059(# emit:<selector>:<varName>:<value>): ${e.join(":")}`,
        );
        return;
      }
      let i = a;
      if (St(a)) i = Number(a);
      else {
        let l = de(a);
        l !== void 0 && (i = l);
      }
      Bv(t, { [n]: i }, { notify: !0, expose: !1 });
    },
  });
  function J1(e) {
    let [t, ...n] = e.split(":").map((a) => a.trim());
    return { key: t, args: n };
  }
  async function jv(e, t) {
    let { key: n, args: a } = J1(e);
    await Ty(n, a, t);
  }
  var ds = new Map(),
    Lf = new Map(),
    Uf = new Map(),
    $1 = 50;
  function Gv(e) {
    let t = ds.get(e);
    return (t || ((t = {}), ds.set(e, t)), t);
  }
  function tC(e) {
    let t = Lf.get(e);
    return (t || ((t = {}), Lf.set(e, t)), t);
  }
  function eC(e) {
    var a;
    let t = Date.now(),
      n = (a = Uf.get(e)) != null ? a : 0;
    t - n < $1 || (Uf.set(e, t), vy(e));
  }
  function Hv(e, t, n) {
    var i;
    let a = t;
    if (n != null && n.notify) {
      eC(e);
      let l = tC(e),
        r = { ...t };
      for (let u of Object.keys(t)) {
        let s = ((i = l[u]) != null ? i : 0) + 1;
        ((l[u] = s), (r[`${u}_seq`] = s));
      }
      a = r;
    }
    if ((n == null ? void 0 : n.expose) !== !1) {
      let l = Gv(e);
      Object.assign(l, a);
    }
    return a;
  }
  function Wv(e, t) {
    let n = Gv(e);
    if (!t || t.length === 0) return { ...n };
    let a = {};
    for (let i of t) a[i] = n[i];
    return a;
  }
  function Fv(e) {
    ds.set(e, {});
  }
  function qv(e) {
    (ds.delete(e), Lf.delete(e), Uf.delete(e));
  }
  function Yv(e, t = {}) {
    var re;
    let n = (re = t.stepProvider) != null ? re : mh(),
      a = t.onNavigate,
      i = t.instanceId,
      l = (0, Bt.useId)(),
      r = i != null ? i : l,
      u = Ee(Xi(r)),
      s = Ee(ba(r)),
      o = Ee(sr(r)),
      c = Ee(Xa(r)),
      h = Ee(cr(r)),
      f = Ee(fr(r)),
      p = Ee(Ii(r)),
      S = Ee(Pa(r)),
      T = Ee(Hn(r)),
      x = Ee(dr(r)),
      g = Ee(mr(r)),
      d = Ee(Qi(r)),
      m = Ee(hr(r)),
      [y, b] = (0, Bt.useState)(!1),
      [N, E] = (0, Bt.useState)(!1),
      M = (0, Bt.useRef)(!1),
      w = (0, Bt.useCallback)(
        async ($) => {
          let Ft = py(r),
            me = () => yy(r, Ft);
          ((M.current = !0), b(!0));
          let rt = { atomKey: r, instanceId: i };
          for (let z of $.steps) {
            if (me()) return;
            for (let Nt of z.tags) {
              if (me()) return;
              try {
                await jv(Nt, rt);
              } catch (ue) {
                console.warn(
                  `[VNLayer] tag dispatch failed, skipping this tag and continuing: "${Nt}"`,
                  ue,
                );
              }
            }
            if (me()) return;
            if (z.content) {
              (or(r, z.speaker), bv(r, i, z.speaker, z.content));
              let Nt = tv(r);
              if ((Oy(r, z.speaker, z.content, Nt), nv(r))) {
                let ge = (Nt > 0 ? z.content.length * Nt : 0) + av(r);
                if (me()) return;
                await Yi(r, ge);
              }
            }
          }
          if (me()) return;
          let jt = wv(r);
          (jt &&
            (a
              ? a(jt)
              : console.warn(
                  "[useStoryEngine] goto tag encountered but no onNavigate handler was provided:",
                  jt,
                )),
            $.visual &&
              (Ry(r, $.visual.bg),
              Py(r, $.visual.characters),
              or(r, $.visual.speaker)),
            xf(r, $.choices),
            (M.current = !1),
            b(!1));
        },
        [r, i, a],
      ),
      D = (0, Bt.useCallback)(async () => {
        if (M.current) return;
        let $ = await n.init(e);
        (await w($), E(!0));
      }, [e, n]),
      j = (0, Bt.useRef)(null);
    (0, Bt.useEffect)(() => {
      j.current !== e && ((j.current = e), D());
    }, [e]);
    let G = (0, Bt.useCallback)(
      async ($) => {
        var jt, z, Nt;
        if (M.current) {
          ((z =
            (jt = x.find((ge) => ge.index === $)) == null ? void 0 : jt.tags) ==
          null
            ? void 0
            : z.some(
                (ge) =>
                  ge.split(":")[0] === "tick" ||
                  ge.split(":")[0] === "interrupt",
              )) ||
            console.warn(
              `[VNLayer] choose(${$}) ignored: a previous advance() is still in progress.`,
            );
          return;
        }
        _e(i).choice.autoClearOnChoose && xf(r, []);
        let Ft = x.find((ue) => ue.index === $),
          me =
            (Nt = Ft == null ? void 0 : Ft.tags) == null
              ? void 0
              : Nt.some(
                  (ue) =>
                    ue.split(":")[0] === "tick" ||
                    ue.split(":")[0] === "interrupt",
                );
        if (Ft && !me) {
          let ge =
            x
              .filter((Ta) => {
                var rn;
                return !(
                  (rn = Ta.tags) != null &&
                  rn.some(
                    (Ki) =>
                      Ki.split(":")[0] === "tick" ||
                      Ki.split(":")[0] === "interrupt",
                  )
                );
              })
              .findIndex((Ta) => Ta.index === $) + 1;
          Cv(r, i, ge > 0 ? ge : 1, Ft.text);
        }
        let rt = await n.choose(e, $);
        await w(rt);
      },
      [x, w, e, n, r, i],
    );
    (0, Bt.useEffect)(() => {
      let $ = Sy(r),
        Ft = x.find((jt) => {
          var z;
          return (z = jt.tags) == null
            ? void 0
            : z.some((Nt) => Nt.split(":")[0] === "interrupt");
        });
      if (Ft && $) {
        G(Ft.index);
        return;
      }
      let me = x.filter((jt) => {
        var z;
        return (z = jt.tags) == null
          ? void 0
          : z.some((Nt) => Nt.split(":")[0] === "tick");
      });
      if (me.length === 0) return;
      let rt = [];
      for (let jt of me) {
        let z = jt.tags.find((ue) => ue.split(":")[0] === "tick"),
          Nt = z ? Number(z.split(":")[1]) : NaN;
        !Number.isFinite(Nt) ||
          Nt <= 0 ||
          rt.push(
            setTimeout(() => {
              G(jt.index);
            }, Nt * 1e3),
          );
      }
      return () => {
        rt.forEach(clearTimeout);
      };
    }, [x, G, r]);
    let lt = (0, Bt.useCallback)(async () => {
        (by(r),
          xv(r),
          Ev(r),
          fv(r),
          zy(r),
          Xy(r),
          Ly(r),
          B().set(Xa(r), { target: "", scale: 1, originX: 50, originY: 50 }),
          Qy(r),
          xy(r),
          uv(r),
          Fv(r));
        let $ = await n.reset(e);
        await w($);
      }, [w, e, n, r]),
      le = (0, Bt.useCallback)(
        async ($, Ft) => {
          let me = Hv(r, $, Ft);
          for (let [rt, jt] of Object.entries(me)) await n.idle(e, rt, jt);
        },
        [r, e, n],
      ),
      Y = (0, Bt.useCallback)(async ($) => Wv(r, $), [r]);
    return (
      (0, Bt.useEffect)(() => {
        if (i) return (Lv(i, { setContextVars: le }), () => Uv(i));
      }, [i, le]),
      (0, Bt.useEffect)(
        () => () => {
          (Jy(r),
            iv(r),
            Zy(r),
            Vy(r),
            Iy(r),
            Uy(r),
            My(r),
            hv(r),
            Av(r),
            sv(r),
            Mv(r),
            Cy(r),
            qv(r));
        },
        [r],
      ),
      {
        lines: d,
        choices: x,
        bg: u,
        characters: s,
        speaker: o,
        cam: c,
        shake: h,
        isProcessing: y,
        choose: G,
        choicesHidden: g,
        messageWindowHidden: m,
        positionOverrides: S,
        activeMessage: T,
        hasLoadedOnce: N,
        resetStory: lt,
        flash: f,
        typeSpeedMs: p,
        setContextVars: le,
        getContextVars: Y,
        instanceId: i,
      }
    );
  }
  var aC = (e) => {
    typeof window != "undefined"
      ? (window.location.href = e)
      : console.warn(
          "[VNLayer] onNavigate fallback called in a non-browser environment:",
          e,
        );
  };
  function Pv() {
    return aC;
  }
  var Jv = se(Wn()),
    Zv = (0, gs.createContext)(null),
    Kv = ({
      children: e,
      scenario: t = "Scenario1",
      stepProvider: n,
      onNavigate: a,
      instanceId: i,
    }) => {
      let l = Yv(t, {
        stepProvider: n,
        onNavigate: a != null ? a : Pv(),
        instanceId: i,
      });
      return (0, Jv.jsx)(Zv.Provider, { value: l, children: e });
    },
    ps = () => (0, gs.useContext)(Zv);
  var Wt = se(bn());
  var Ot = se(Wn()),
    $v = {
      izakaya_main_day: "#f3e3c8",
      izakaya_main_evening: "#e6b06a",
      izakaya_main_night: "#2b2440",
      izakaya_main_closed: "#4a4a4a",
    };
  function rC(e, t, n, a) {
    let i = n - e,
      l = a - t;
    return (Math.atan2(l, i) * 180) / Math.PI;
  }
  function uC(e) {
    var a, i, l, r;
    let t = (a = Ef(e)) == null ? void 0 : a.color;
    if (t) return t;
    let n = e.replace(":", "_");
    return (r =
      (l = $v[`izakaya_main_${(i = e.split(":")[1]) != null ? i : e}`]) != null
        ? l
        : $v[n]) != null
      ? r
      : "#333";
  }
  var tS = 800;
  function sC({ bg: e }) {
    return (0, Ot.jsx)("div", {
      style: { position: "absolute", inset: 0, background: uC(e) },
    });
  }
  function oC({
    name: e,
    state: t,
    slot: n,
    isFocused: a,
    hasSpeaker: i,
    onClick: l,
  }) {
    var u, s, o, c;
    let r = t.gaze ? rC(n.originX, n.originY, t.gaze.x, t.gaze.y) : null;
    return (0, Ot.jsxs)(Ot.Fragment, {
      children: [
        (0, Ot.jsxs)("div", {
          onClick: l,
          style: {
            position: "absolute",
            left: `${n.originX}%`,
            top: `${n.originY}%`,
            transform: "translate(-50%, -50%)",
            width: 80,
            height: 140,
            borderRadius: 6,
            background: "#8a8a8a",
            opacity: i ? (a ? 1 : 0.35) : 1,
            transition: `left ${(u = n.durationMs) != null ? u : 500}ms ease, top ${(s = n.durationMs) != null ? s : 500}ms ease, opacity 300ms ease`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
            color: "#fff",
            fontSize: 12,
            paddingBottom: 4,
            pointerEvents: l ? "auto" : void 0,
            cursor: l ? "pointer" : void 0,
          },
          children: [
            (0, Ot.jsx)("div", { children: e }),
            (0, Ot.jsxs)("div", {
              style: { fontSize: 10, opacity: 0.8 },
              children: [
                t.expression,
                t.motion ? ` / ${t.motion}` : "",
                t.animLoop ? " \u{1F501}" : "",
                t.animReverse ? " \u23EA" : "",
                t.animSpeed !== void 0 && t.animSpeed !== 1
                  ? ` x${t.animSpeed}`
                  : "",
              ],
            }),
          ],
        }),
        r !== null &&
          (0, Ot.jsx)("div", {
            style: {
              position: "absolute",
              left: `${n.originX}%`,
              top: `${n.originY}%`,
              transform: `translate(-50%, -50%) translateY(-84px) rotate(${r}deg)`,
              width: 0,
              height: 0,
              borderTop: "6px solid transparent",
              borderBottom: "6px solid transparent",
              borderLeft: "14px solid #ffd54a",
              transition: `transform 150ms linear, left ${(o = n.durationMs) != null ? o : 500}ms ease, top ${(c = n.durationMs) != null ? c : 500}ms ease`,
              pointerEvents: "none",
              zIndex: 6,
            },
          }),
      ],
    });
  }
  function cC({
    speaker: e,
    content: t,
    slot: n,
    revealedCount: a,
    visible: i,
    onClick: l,
    fontFamily: r,
    fontSizePx: u,
    offsetPx: s,
  }) {
    var o, c;
    return (0, Ot.jsxs)(Ot.Fragment, {
      children: [
        (0, Ot.jsx)("style", {
          children: `
        .vnlayer-scroll-hidden {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* \u65E7Edge/IE */
        }
        .vnlayer-scroll-hidden::-webkit-scrollbar {
          display: none; /* Chrome/Safari */
        }
      `,
        }),
        (0, Ot.jsxs)("div", {
          onClick: l,
          className: "vnlayer-scroll-hidden",
          style: {
            position: "absolute",
            left: `${n.originX}%`,
            top: `calc(${n.originY}% - ${s}px)`,
            transform: "translate(-50%, -100%)",
            maxWidth: 220,
            maxHeight: "70%",
            overflowY: "auto",
            background: "rgba(255,255,255,0.95)",
            color: "#111",
            borderRadius: 12,
            padding: "10px 14px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
            fontSize: u != null ? u : 13,
            fontFamily: r,
            lineHeight: 1.5,
            cursor: a < t.length ? "pointer" : "default",
            opacity: i ? 1 : 0,
            transition: `opacity ${tS}ms ease, left ${(o = n.durationMs) != null ? o : 500}ms ease, top ${(c = n.durationMs) != null ? c : 500}ms ease`,
            zIndex: 5,
          },
          children: [
            e &&
              (0, Ot.jsx)("div", {
                style: { fontSize: 11, opacity: 0.6, marginBottom: 2 },
                children: e,
              }),
            (0, Ot.jsx)("div", {
              style: { whiteSpace: "pre-wrap" },
              children: t.slice(0, a),
            }),
            (0, Ot.jsx)("div", {
              style: {
                position: "absolute",
                left: "50%",
                bottom: -8,
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "8px solid transparent",
                borderRight: "8px solid transparent",
                borderTop: "8px solid rgba(255,255,255,0.95)",
              },
            }),
          ],
        }),
      ],
    });
  }
  function fC({
    content: e,
    revealedCount: t,
    visible: n,
    onClick: a,
    fontFamily: i,
    fontSizePx: l,
  }) {
    return (0, Ot.jsx)("div", {
      onClick: a,
      style: {
        position: "absolute",
        left: "50%",
        top: 14,
        transform: "translateX(-50%)",
        maxWidth: 280,
        background: "rgba(0,0,0,0.6)",
        color: "#fff",
        borderRadius: 8,
        padding: "8px 16px",
        fontSize: l != null ? l : 13,
        fontFamily: i,
        lineHeight: 1.5,
        textAlign: "center",
        cursor: t < e.length ? "pointer" : "default",
        opacity: n ? 1 : 0,
        transition: `opacity ${tS}ms ease`,
        zIndex: 5,
      },
      children: e.slice(0, t),
    });
  }
  function hC({
    text: e,
    onClick: t,
    disabled: n,
    fontFamily: a,
    fontSizePx: i,
  }) {
    return (0, Ot.jsx)("button", {
      onClick: t,
      disabled: n,
      style: {
        padding: "10px 14px",
        borderRadius: 6,
        border: "1px solid #ccc",
        background: n ? "#eee" : "#fff",
        color: "#111",
        cursor: n ? "not-allowed" : "pointer",
        textAlign: "left",
        width: "100%",
        fontSize: i,
        fontFamily: a,
      },
      children: e,
    });
  }
  function dC({ color: e, durationMs: t }) {
    return (0, Ot.jsxs)(Ot.Fragment, {
      children: [
        (0, Ot.jsx)("style", {
          children: `
        @keyframes izakaya-mock-flash-fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `,
        }),
        (0, Ot.jsx)("div", {
          style: {
            position: "absolute",
            inset: 0,
            backgroundColor: e,
            pointerEvents: "none",
            zIndex: 10,
            animation: `izakaya-mock-flash-fade-out ${t}ms ease-out forwards`,
          },
        }),
      ],
    });
  }
  var eS = {
    Background: sC,
    CharacterSprite: oC,
    MessageBubble: cC,
    NarratorCaption: fC,
    ChoiceButton: hC,
    FlashOverlay: dC,
  };
  var ht = se(Wn()),
    Zi = eS,
    nS = 800;
  function Bf({ mode: e = "full", uiAnchor: t = "right", showUi: n = !0 }) {
    var Wf,
      Ff,
      qf,
      Yf,
      Pf,
      Xf,
      If,
      Qf,
      Zf,
      Kf,
      Jf,
      $f,
      th,
      eh,
      nh,
      ah,
      ih,
      lh,
      rh,
      uh;
    let a = ps(),
      [i, l] = (0, Wt.useState)(!1),
      r = (0, Wt.useSyncExternalStore)(vv, Df, Df),
      [u, s] = (0, Wt.useState)({}),
      o = (0, Wt.useRef)(null),
      c = (0, Wt.useRef)({}),
      h = (0, Wt.useRef)(null),
      f = (Wf = a == null ? void 0 : a.activeMessage) != null ? Wf : null;
    ((0, Wt.useEffect)(() => {
      if (f) {
        let O = o.current,
          k = f.speaker;
        ((o.current = k),
          O &&
            O !== k &&
            (c.current[O] && clearTimeout(c.current[O]),
            s((Z) => (Z[O] ? { ...Z, [O]: { ...Z[O], visible: !1 } } : Z)),
            (c.current[O] = setTimeout(() => {
              s((Z) => {
                let te = { ...Z };
                return (delete te[O], te);
              });
            }, nS))),
          c.current[k] && (clearTimeout(c.current[k]), delete c.current[k]),
          s((Z) => {
            var te;
            return {
              ...Z,
              [k]: {
                content: f.content,
                revealedCount: 0,
                visible: !1,
                typeSpeedMs: (te = f.typeSpeedMs) != null ? te : 30,
                fadeIn: f.fadeIn,
              },
            };
          }),
          requestAnimationFrame(() =>
            s((Z) => (Z[k] ? { ...Z, [k]: { ...Z[k], visible: !0 } } : Z)),
          ));
      } else {
        let O = o.current;
        if (((o.current = null), !O)) return;
        (c.current[O] && clearTimeout(c.current[O]),
          s((k) => (k[O] ? { ...k, [O]: { ...k[O], visible: !1 } } : k)),
          (c.current[O] = setTimeout(() => {
            s((k) => {
              let Z = { ...k };
              return (delete Z[O], Z);
            });
          }, nS)));
      }
    }, [f]),
      (0, Wt.useEffect)(() => {
        var te, Je;
        h.current && (clearInterval(h.current), (h.current = null));
        let O = f == null ? void 0 : f.speaker,
          k = (te = f == null ? void 0 : f.content) != null ? te : "";
        if (!O || !k) return;
        let Z = (Je = f == null ? void 0 : f.typeSpeedMs) != null ? Je : 30;
        if (Z <= 0) {
          s((je) =>
            je[O] ? { ...je, [O]: { ...je[O], revealedCount: k.length } } : je,
          );
          return;
        }
        return (
          (h.current = setInterval(() => {
            s((je) => {
              let vr = je[O];
              return vr
                ? vr.revealedCount >= k.length
                  ? (h.current && clearInterval(h.current), je)
                  : {
                      ...je,
                      [O]: { ...vr, revealedCount: vr.revealedCount + 1 },
                    }
                : je;
            });
          }, Z)),
          () => {
            h.current && clearInterval(h.current);
          }
        );
      }, [f]));
    let p = () => {
        h.current && (clearInterval(h.current), (h.current = null));
        let O = f == null ? void 0 : f.speaker;
        O &&
          s((k) =>
            k[O]
              ? { ...k, [O]: { ...k[O], revealedCount: k[O].content.length } }
              : k,
          );
      },
      S = (0, Wt.useRef)(null),
      [T, x] = (0, Wt.useState)(void 0),
      g = (0, Wt.useRef)(!1);
    (0, Wt.useEffect)(() => {
      var O;
      g.current = (O = a == null ? void 0 : a.isProcessing) != null ? O : !1;
    }, [a == null ? void 0 : a.isProcessing]);
    let d = a ? _e(a.instanceId).stage.stickToViewport : !0,
      m = a ? _e(a.instanceId).stage.heightPx : void 0,
      y = (0, Wt.useCallback)(() => {
        let O = S.current;
        if (!O || typeof document == "undefined") return;
        let k = O.style.height;
        ((O.style.height = "0px"), O.offsetHeight);
        let Z = Math.max(
          document.documentElement.scrollHeight,
          document.body.scrollHeight,
        );
        ((O.style.height = k), x(Z));
      }, []);
    if (
      ((0, Wt.useEffect)(() => {
        if (
          e !== "overlay" ||
          d ||
          m ||
          typeof document == "undefined" ||
          typeof ResizeObserver == "undefined"
        )
          return;
        y();
        let O = null,
          k = new ResizeObserver(() => {
            g.current || (O && clearTimeout(O), (O = setTimeout(y, 150)));
          });
        return (
          k.observe(document.body),
          () => {
            (k.disconnect(), O && clearTimeout(O));
          }
        );
      }, [e, d, m, y]),
      !a)
    )
      return null;
    let {
        lines: b,
        choices: N,
        bg: E,
        characters: M,
        speaker: w,
        cam: D,
        shake: j,
        isProcessing: G,
        choose: lt,
        choicesHidden: le,
        messageWindowHidden: Y,
        positionOverrides: re,
        instanceId: $,
      } = a,
      Ft = N.filter((O) => {
        var k;
        return !(
          (k = O.tags) != null &&
          k.some((Z) => ["tick", "interrupt"].includes(Z.split(":")[0]))
        );
      }),
      me = {
        transform: `scale(${D.scale})`,
        transformOrigin: `${D.originX}% ${D.originY}%`,
        transition: "transform 500ms ease",
      },
      rt = e === "overlay",
      jt = t === "left" ? { left: 12 } : { right: 12 },
      z = _e($),
      Nt = z.stage.stickToViewport ? "fixed" : "absolute",
      ue = z.choice.anchor,
      ge = ue && (qf = (Ff = re[ue]) != null ? Ff : Sa(ue)) != null ? qf : null,
      Ta = z.backlog.anchor,
      rn = Ta && (Pf = (Yf = re[Ta]) != null ? Yf : Sa(Ta)) != null ? Pf : null,
      Ki = z.backlog.mode === "global",
      Gf = Ki ? r : b,
      Ji =
        typeof n == "boolean"
          ? { backlogButton: n, choices: n, messageWindow: n }
          : {
              backlogButton: (Xf = n.backlogButton) != null ? Xf : !0,
              choices: (If = n.choices) != null ? If : !0,
              messageWindow: (Qf = n.messageWindow) != null ? Qf : !0,
            },
      ys = (Zf = z.stage.heightPx) != null ? Zf : T,
      rS = rt
        ? {
            position: Nt,
            ...(z.stage.stickToViewport || !ys
              ? { inset: 0 }
              : z.stage.widthPx
                ? {
                    top: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: `${z.stage.widthPx}px`,
                    height: `${ys}px`,
                  }
                : { top: 0, left: 0, right: 0, height: `${ys}px` }),
            pointerEvents: "none",
            zIndex: 50,
            fontFamily: (Kf = z.font.family) != null ? Kf : "sans-serif",
            fontSize: z.font.sizePx,
          }
        : {
            maxWidth: 640,
            margin: "0 auto",
            fontFamily: (Jf = z.font.family) != null ? Jf : "sans-serif",
            fontSize: z.font.sizePx,
          },
      Hf =
        j.nonce > 0 ? `izakaya-shake-${j.nonce} ${j.duration}ms ease` : void 0,
      uS = rt
        ? { position: "absolute", inset: 0, animation: Hf }
        : {
            position: "relative",
            height: 360,
            overflow: "hidden",
            borderRadius: 8,
            animation: Hf,
          };
    return (0, ht.jsxs)("div", {
      ref: S,
      style: rS,
      children: [
        (0, ht.jsx)(
          "style",
          {
            children: `
        @keyframes izakaya-shake-${j.nonce} {
          0% { transform: translateX(0); }
          25% { transform: translateX(-${j.amplitude}px); }
          50% { transform: translateX(${j.amplitude}px); }
          75% { transform: translateX(-${j.amplitude}px); }
          100% { transform: translateX(0); }
        }
      `,
          },
          j.nonce,
        ),
        (0, ht.jsx)("style", {
          children: `
        .vnlayer-scroll-hidden {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .vnlayer-scroll-hidden::-webkit-scrollbar {
          display: none;
        }
      `,
        }),
        Ji.backlogButton &&
          z.backlog.show &&
          (0, ht.jsx)("div", {
            style: rn
              ? {
                  position: "absolute",
                  left: `${rn.originX}%`,
                  top: `calc(${rn.originY}% + ${($f = z.backlog.offset) != null ? $f : 20}px)`,
                  transform: "translateX(-50%)",
                  pointerEvents: "auto",
                  zIndex: 51,
                }
              : rt
                ? {
                    position: Nt,
                    ...jt,
                    bottom: (th = z.backlog.offset) != null ? th : 12,
                    pointerEvents: "auto",
                    zIndex: 51,
                  }
                : {
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 6,
                    marginBottom: 6,
                  },
            children: (0, ht.jsx)("button", {
              onClick: () => l((O) => !O),
              style: {
                padding: "4px 10px",
                borderRadius: 6,
                border: "1px solid #999",
                background: "#fff",
                color: "#111",
                fontSize: 12,
                cursor: "pointer",
              },
              children: i
                ? "\u30D0\u30C3\u30AF\u30ED\u30B0\u3092\u9589\u3058\u308B"
                : "\u30D0\u30C3\u30AF\u30ED\u30B0",
            }),
          }),
        (0, ht.jsxs)("div", {
          style: uS,
          children: [
            !rt && (0, ht.jsx)(Zi.Background, { bg: E }),
            (0, ht.jsxs)("div", {
              style: {
                position: "absolute",
                inset: 0,
                ...me,
                pointerEvents: rt ? "none" : void 0,
              },
              children: [
                Object.entries(M).map(([O, k]) => {
                  var Je, je;
                  let Z =
                      (je = (Je = re[O]) != null ? Je : Sa(O)) != null
                        ? je
                        : { originX: 50, originY: 60 },
                    te = w === O;
                  return (0, ht.jsx)(
                    Zi.CharacterSprite,
                    {
                      name: O,
                      state: k,
                      slot: Z,
                      isFocused: te,
                      hasSpeaker: !!w,
                      onClick: z.character.clickable
                        ? () =>
                            a.setContextVars(
                              { vn_event_char_click: O },
                              { notify: !0 },
                            )
                        : void 0,
                    },
                    O,
                  );
                }),
                a.flash &&
                  (0, ht.jsx)(Zi.FlashOverlay, {
                    color: a.flash.color,
                    durationMs: a.flash.durationMs,
                  }),
              ],
            }),
            Ji.messageWindow &&
              !Y &&
              Object.entries(u)
                .filter(([O]) => O !== "narrator")
                .map(([O, k]) => {
                  var te, Je;
                  let Z =
                    (Je = (te = re[O]) != null ? te : Sa(O)) != null
                      ? Je
                      : { originX: 50, originY: 40 };
                  return (0, ht.jsx)(
                    "div",
                    {
                      style: rt ? { pointerEvents: "auto" } : void 0,
                      children: (0, ht.jsx)(Zi.MessageBubble, {
                        speaker: O,
                        content: k.content,
                        slot: Z,
                        revealedCount: k.revealedCount,
                        visible: k.visible,
                        onClick: z.messageWindow.interactive ? p : void 0,
                        fontFamily: z.font.family,
                        fontSizePx: z.font.sizePx,
                        offsetPx: z.messageWindow.offset,
                      }),
                    },
                    O,
                  );
                }),
            Ji.messageWindow &&
              !Y &&
              u.narrator &&
              (0, ht.jsx)("div", {
                style: rt ? { pointerEvents: "auto" } : void 0,
                children: (0, ht.jsx)(Zi.NarratorCaption, {
                  content: u.narrator.content,
                  revealedCount: u.narrator.revealedCount,
                  visible: u.narrator.visible,
                  onClick: z.messageWindow.interactive ? p : void 0,
                  fontFamily: z.font.family,
                  fontSizePx: z.font.sizePx,
                }),
              }),
          ],
        }),
        Ji.backlogButton &&
          z.backlog.show &&
          i &&
          (0, ht.jsxs)("div", {
            className: "vnlayer-scroll-hidden",
            style: rn
              ? {
                  position: "absolute",
                  left: `${rn.originX}%`,
                  top: `calc(${rn.originY}% + ${((eh = z.backlog.offset) != null ? eh : 20) + 36}px)`,
                  transform: "translateX(-50%)",
                  width: 280,
                  maxHeight: `calc(100% - ${rn.originY}% - ${((nh = z.backlog.offset) != null ? nh : 20) + 36}px - 8px)`,
                  overflowY: "auto",
                  pointerEvents: "auto",
                  padding: "12px 16px",
                  background: "#1e1e1e",
                  color: "#fff",
                  borderRadius: 8,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  zIndex: 51,
                }
              : {
                  position: rt ? Nt : "static",
                  ...(rt ? jt : {}),
                  bottom: rt
                    ? ((ah = z.backlog.offset) != null ? ah : 12) + 44
                    : void 0,
                  width: rt ? 320 : void 0,
                  pointerEvents: "auto",
                  marginTop: rt ? 0 : 12,
                  padding: "12px 16px",
                  background: "#1e1e1e",
                  color: "#fff",
                  borderRadius: 8,
                  maxHeight: 240,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  zIndex: 51,
                },
            children: [
              Gf.length === 0 &&
                (0, ht.jsx)("div", {
                  style: { opacity: 0.5, fontSize: 12 },
                  children:
                    "\u307E\u3060\u4F1A\u8A71\u304C\u3042\u308A\u307E\u305B\u3093",
                }),
              Gf.map((O, k) => {
                var te, Je;
                let Z =
                  Ki && O.instanceId && O.instanceId !== $
                    ? O.instanceId
                    : null;
                return O.kind === "choice"
                  ? (0, ht.jsxs)(
                      "div",
                      {
                        children: [
                          (0, ht.jsxs)("div", {
                            style: {
                              fontSize: 13,
                              opacity: 0.7,
                              marginBottom: 2,
                            },
                            children: ["[Choice]", Z ? ` (${Z})` : ""],
                          }),
                          (0, ht.jsxs)("div", {
                            style: { whiteSpace: "pre-wrap", lineHeight: 1.6 },
                            children: [O.number, ". ", O.text],
                          }),
                        ],
                      },
                      (te = O.seq) != null ? te : k,
                    )
                  : (0, ht.jsxs)(
                      "div",
                      {
                        children: [
                          O.speaker &&
                            (0, ht.jsxs)("div", {
                              style: {
                                fontSize: 13,
                                opacity: 0.7,
                                marginBottom: 2,
                              },
                              children: [
                                "[",
                                O.speaker,
                                "]",
                                Z ? ` (${Z})` : "",
                              ],
                            }),
                          (0, ht.jsx)("div", {
                            style: { whiteSpace: "pre-wrap", lineHeight: 1.6 },
                            children: O.content,
                          }),
                        ],
                      },
                      (Je = O.seq) != null ? Je : k,
                    );
              }),
            ],
          }),
        Ji.choices &&
          !le &&
          Ft.length > 0 &&
          (0, ht.jsx)("div", {
            className: "vnlayer-scroll-hidden",
            style: ge
              ? {
                  position: "absolute",
                  left: `${ge.originX}%`,
                  top: `calc(${ge.originY}% + ${(ih = z.choice.offset) != null ? ih : 20}px)`,
                  transform: "translateX(-50%)",
                  width: rt ? 220 : 200,
                  maxHeight: `calc(100% - ${ge.originY}% - ${(lh = z.choice.offset) != null ? lh : 20}px - 8px)`,
                  overflowY: "auto",
                  pointerEvents: "auto",
                  zIndex: 51,
                }
              : {
                  position: rt ? Nt : "static",
                  ...(rt ? jt : {}),
                  bottom: rt
                    ? (rh = z.choice.offset) != null
                      ? rh
                      : 130
                    : void 0,
                  width: rt ? 280 : void 0,
                  maxHeight: rt ? "60vh" : 220,
                  overflowY: "auto",
                  pointerEvents: "auto",
                  marginTop: rt ? 0 : 10,
                  zIndex: 51,
                },
            children: (0, ht.jsx)("div", {
              style: {
                display: "flex",
                flexDirection: "column",
                gap: (uh = z.choice.spacing) != null ? uh : 8,
              },
              children: Ft.map((O) =>
                (0, ht.jsx)(
                  Zi.ChoiceButton,
                  {
                    text: O.text,
                    onClick: () => lt(O.index),
                    disabled: G || !z.choice.interactive,
                    fontFamily: z.font.family,
                    fontSizePx: z.font.sizePx,
                  },
                  O.index,
                ),
              ),
            }),
          }),
      ],
    });
  }
  var yr = se(Wn());
  function mC({ onReady: e }) {
    let t = ps(),
      n = (0, pr.useRef)(t);
    n.current = t;
    let a = (0, pr.useRef)(!1);
    return (
      (0, pr.useEffect)(() => {
        a.current ||
          !e ||
          ((a.current = !0),
          e({
            setContextVars: (i, l) => n.current.setContextVars(i, l),
            getContextVars: (i) => n.current.getContextVars(i),
            resetStory: () => n.current.resetStory(),
          }));
      }, []),
      null
    );
  }
  function jf({
    scenario: e = "Scenario1",
    mode: t,
    uiAnchor: n,
    showUi: a,
    stepProvider: i,
    onNavigate: l,
    onReady: r,
    instanceId: u,
  }) {
    return (0, yr.jsxs)(Kv, {
      scenario: e,
      stepProvider: i,
      onNavigate: l,
      instanceId: u,
      children: [
        (0, yr.jsx)(mC, { onReady: r }),
        (0, yr.jsx)(Bf, { mode: t, uiAnchor: n, showUi: a }),
      ],
    });
  }
  var Ke = new Map();
  function gC(e) {
    let t = document.querySelector(e);
    if (!t) throw new Error(`[VNLayer] element not found for selector: ${e}`);
    return t;
  }
  function pC(e, t) {
    if (Ke.has(e))
      return (
        console.warn(
          `[VNLayer] "${e}" is already mounted. Call unmount() first if you want to remount.`,
        ),
        Promise.resolve()
      );
    let n = gC(e),
      a = (0, aS.createRoot)(n),
      i = { root: a, container: n, handle: null };
    return (
      Ke.set(e, i),
      new Promise((l) => {
        var r;
        a.render(
          (0, iS.createElement)(jf, {
            scenario: (r = t.scenario) != null ? r : "Scenario1",
            mode: t.mode,
            uiAnchor: t.uiAnchor,
            showUi: t.showUi,
            stepProvider: t.stepProvider,
            instanceId: e,
            onReady: (u) => {
              ((i.handle = u), l());
            },
          }),
        );
      })
    );
  }
  function yC(e) {
    let t = Ke.get(e);
    return (t && (t.root.unmount(), Ke.delete(e)), Promise.resolve());
  }
  async function vC(e, t, n) {
    let a = t ? [Ke.get(t)].filter(Boolean) : Array.from(Ke.values());
    if (a.length === 0) {
      console.warn(
        "[VNLayer] setContext called but no instance is mounted yet.",
      );
      return;
    }
    await Promise.all(
      a.map((i) =>
        i != null && i.handle
          ? i.handle.setContextVars(e, n)
          : (console.warn(
              "[VNLayer] setContext called before the instance finished initializing; ignoring this call.",
            ),
            Promise.resolve()),
      ),
    );
  }
  async function SC(e, t) {
    let n;
    if (t) n = Ke.get(t);
    else if (Ke.size === 1) n = Ke.values().next().value;
    else
      return (
        console.warn(
          `[VNLayer] getContext: ${Ke.size} instance(s) are mounted; please specify a selector to disambiguate.`,
        ),
        {}
      );
    if (!(n != null && n.handle))
      return (
        console.warn(
          "[VNLayer] getContext called before the instance finished initializing, or no matching instance is mounted.",
        ),
        {}
      );
    let a = e === void 0 ? void 0 : Array.isArray(e) ? e : [e];
    return n.handle.getContextVars(a);
  }
  async function bC(e) {
    let t = e ? [Ke.get(e)].filter(Boolean) : Array.from(Ke.values());
    if (t.length === 0) {
      console.warn("[VNLayer] reset called but no instance is mounted yet.");
      return;
    }
    await Promise.all(
      t.map((n) =>
        n != null && n.handle
          ? n.handle.resetStory()
          : (console.warn(
              "[VNLayer] reset called before the instance finished initializing; ignoring this call.",
            ),
            Promise.resolve()),
      ),
    );
  }
  async function CC(e, t) {
    if (
      (e.characterSlots && ur(e.characterSlots),
      e.backgroundSlots && lr(e.backgroundSlots),
      e.tags)
    )
      for (let [n, a] of Object.entries(e.tags)) bf(n, a);
    (e.ui && mt(e.ui, t), e.webLinks && Rf(e.webLinks));
  }
  var TC = {
    mount: pC,
    unmount: yC,
    setContext: vC,
    getContext: SC,
    reset: bC,
    configure: CC,
    serverStepProvider: Or,
    createServerStepProvider: Os,
    createStaticStepProvider: Ar,
  };
  typeof window != "undefined" && (window.VNLayer = TC);
  var lS,
    EC =
      typeof window != "undefined" &&
      (lS = window.VNLAYER_DATA_BASE_URL) != null
        ? lS
        : "./data";
  dh(Ar({ dataBaseUrl: EC }));
})();
/*! Bundled license information:

scheduler/cjs/scheduler.production.js:
  (**
   * @license React
   * scheduler.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react.production.js:
  (**
   * @license React
   * react.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom.production.js:
  (**
   * @license React
   * react-dom.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom-client.production.js:
  (**
   * @license React
   * react-dom-client.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react-jsx-runtime.production.js:
  (**
   * @license React
   * react-jsx-runtime.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
