const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/loaded-QH5RKCGC-BqRn-wh2.js","assets/jsx-runtime-ChLRiGhH.js","assets/chunk-XQHCQEAF-DW9qO_MS.js","assets/chunk-M5GPDW62-DqWm0WDU.js","assets/dist-bK4UpyKk.js","assets/dist-B9ctbAaE.js","assets/loaded-LAKI4KDY-iYrsiJzj.js","assets/chunk-3RQGAM3Z-DNyL8shC.js","assets/loaded-PILFUJGA-Db9_ync0.js","assets/chunk-XIGSFEU7-B3NUqm4R.js","assets/full-6ZILLKCS-BhQ4z1kR.js","assets/Render-DQXAYUBI-DgxEH8NP.js","assets/chunk-2CNEFIQP-DL9bx_es.js","assets/Editor-FJJNKTC3-Mp0zsKT5.js"])))=>i.map(i=>d[i]);
import{a as e,c as t,d as n,i as r,l as i,n as a,o,r as s,s as c,t as l,u}from"./assets/jsx-runtime-ChLRiGhH.js";import{$ as d,A as f,At as p,B as m,Bt as h,Ct as g,Dt as _,Et as v,F as y,Ft as b,G as x,Gt as S,H as C,Ht as ee,I as w,It as te,J as T,K as E,Kt as D,L as O,Lt as ne,M as re,Mt as ie,N as ae,Nt as k,O as A,Ot as oe,P as se,Pt as j,Q as M,R as ce,Rt as N,St as le,Tt as ue,U as de,Ut as fe,V as pe,Vt as me,W as he,Wt as ge,X as _e,Y as ve,Z as ye,_ as be,_t as xe,a as Se,at as Ce,b as we,bt as Te,c as Ee,ct as De,d as Oe,dt as ke,et as Ae,f as je,ft as Me,g as Ne,gt as Pe,h as Fe,ht as P,i as Ie,it as Le,j as Re,jt as ze,k as Be,kt as Ve,l as He,lt as Ue,m as We,mt as Ge,n as Ke,nt as qe,o as Je,ot as Ye,p as Xe,pt as Ze,q as Qe,r as $e,rt as et,s as tt,st as nt,t as rt,tt as it,u as at,ut as ot,v as st,vt as ct,wt as lt,x as ut,xt as dt,y as ft,yt as pt,z as mt,zt as ht}from"./assets/chunk-XQHCQEAF-DW9qO_MS.js";import{t as gt}from"./assets/chunk-M5GPDW62-DqWm0WDU.js";import{t as _t}from"./assets/chunk-3RQGAM3Z-DNyL8shC.js";import{t as vt}from"./assets/chunk-XIGSFEU7-B3NUqm4R.js";var yt=i((e=>{function t(e,t){var n=e.length;e.push(t);a:for(;0<n;){var r=n-1>>>1,a=e[r];if(0<i(a,t))e[r]=t,e[n]=a,n=r;else break a}}function n(e){return e.length===0?null:e[0]}function r(e){if(e.length===0)return null;var t=e[0],n=e.pop();if(n!==t){e[0]=n;a:for(var r=0,a=e.length,o=a>>>1;r<o;){var s=2*(r+1)-1,c=e[s],l=s+1,u=e[l];if(0>i(c,n))l<a&&0>i(u,c)?(e[r]=u,e[l]=n,r=l):(e[r]=c,e[s]=n,r=s);else if(l<a&&0>i(u,n))e[r]=u,e[l]=n,r=l;else break a}}return t}function i(e,t){var n=e.sortIndex-t.sortIndex;return n===0?e.id-t.id:n}if(e.unstable_now=void 0,typeof performance==`object`&&typeof performance.now==`function`){var a=performance;e.unstable_now=function(){return a.now()}}else{var o=Date,s=o.now();e.unstable_now=function(){return o.now()-s}}var c=[],l=[],u=1,d=null,f=3,p=!1,m=!1,h=!1,g=!1,_=typeof setTimeout==`function`?setTimeout:null,v=typeof clearTimeout==`function`?clearTimeout:null,y=typeof setImmediate<`u`?setImmediate:null;function b(e){for(var i=n(l);i!==null;){if(i.callback===null)r(l);else if(i.startTime<=e)r(l),i.sortIndex=i.expirationTime,t(c,i);else break;i=n(l)}}function x(e){if(h=!1,b(e),!m)if(n(c)!==null)m=!0,S||(S=!0,E());else{var t=n(l);t!==null&&ne(x,t.startTime-e)}}var S=!1,C=-1,ee=5,w=-1;function te(){return g?!0:!(e.unstable_now()-w<ee)}function T(){if(g=!1,S){var t=e.unstable_now();w=t;var i=!0;try{a:{m=!1,h&&(h=!1,v(C),C=-1),p=!0;var a=f;try{b:{for(b(t),d=n(c);d!==null&&!(d.expirationTime>t&&te());){var o=d.callback;if(typeof o==`function`){d.callback=null,f=d.priorityLevel;var s=o(d.expirationTime<=t);if(t=e.unstable_now(),typeof s==`function`){d.callback=s,b(t),i=!0;break b}d===n(c)&&r(c),b(t)}else r(c);d=n(c)}if(d!==null)i=!0;else{var u=n(l);u!==null&&ne(x,u.startTime-t),i=!1}}break a}finally{d=null,f=a,p=!1}i=void 0}}finally{i?E():S=!1}}}var E;if(typeof y==`function`)E=function(){y(T)};else if(typeof MessageChannel<`u`){var D=new MessageChannel,O=D.port2;D.port1.onmessage=T,E=function(){O.postMessage(null)}}else E=function(){_(T,0)};function ne(t,n){C=_(function(){t(e.unstable_now())},n)}e.unstable_IdlePriority=5,e.unstable_ImmediatePriority=1,e.unstable_LowPriority=4,e.unstable_NormalPriority=3,e.unstable_Profiling=null,e.unstable_UserBlockingPriority=2,e.unstable_cancelCallback=function(e){e.callback=null},e.unstable_forceFrameRate=function(e){0>e||125<e?console.error(`forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported`):ee=0<e?Math.floor(1e3/e):5},e.unstable_getCurrentPriorityLevel=function(){return f},e.unstable_next=function(e){switch(f){case 1:case 2:case 3:var t=3;break;default:t=f}var n=f;f=t;try{return e()}finally{f=n}},e.unstable_requestPaint=function(){g=!0},e.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var n=f;f=e;try{return t()}finally{f=n}},e.unstable_scheduleCallback=function(r,i,a){var o=e.unstable_now();switch(typeof a==`object`&&a?(a=a.delay,a=typeof a==`number`&&0<a?o+a:o):a=o,r){case 1:var s=-1;break;case 2:s=250;break;case 5:s=1073741823;break;case 4:s=1e4;break;default:s=5e3}return s=a+s,r={id:u++,callback:i,priorityLevel:r,startTime:a,expirationTime:s,sortIndex:-1},a>o?(r.sortIndex=a,t(l,r),n(c)===null&&r===n(l)&&(h?(v(C),C=-1):h=!0,ne(x,a-o))):(r.sortIndex=s,t(c,r),m||p||(m=!0,S||(S=!0,E()))),r},e.unstable_shouldYield=te,e.unstable_wrapCallback=function(e){var t=f;return function(){var n=f;f=t;try{return e.apply(this,arguments)}finally{f=n}}}})),bt=i(((e,t)=>{t.exports=yt()})),xt=i((e=>{var n=bt(),r=t(),i=D();function a(e){var t=`https://react.dev/errors/`+e;if(1<arguments.length){t+=`?args[]=`+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+=`&args[]=`+encodeURIComponent(arguments[n])}return`Minified React error #`+e+`; visit `+t+` for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`}function o(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function s(e){var t=e,n=e;if(e.alternate)for(;t.return;)t=t.return;else{e=t;do t=e,t.flags&4098&&(n=t.return),e=t.return;while(e)}return t.tag===3?n:null}function c(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function l(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function u(e){if(s(e)!==e)throw Error(a(188))}function d(e){var t=e.alternate;if(!t){if(t=s(e),t===null)throw Error(a(188));return t===e?e:null}for(var n=e,r=t;;){var i=n.return;if(i===null)break;var o=i.alternate;if(o===null){if(r=i.return,r!==null){n=r;continue}break}if(i.child===o.child){for(o=i.child;o;){if(o===n)return u(i),e;if(o===r)return u(i),t;o=o.sibling}throw Error(a(188))}if(n.return!==r.return)n=i,r=o;else{for(var c=!1,l=i.child;l;){if(l===n){c=!0,n=i,r=o;break}if(l===r){c=!0,r=i,n=o;break}l=l.sibling}if(!c){for(l=o.child;l;){if(l===n){c=!0,n=o,r=i;break}if(l===r){c=!0,r=o,n=i;break}l=l.sibling}if(!c)throw Error(a(189))}}if(n.alternate!==r)throw Error(a(190))}if(n.tag!==3)throw Error(a(188));return n.stateNode.current===n?e:t}function f(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=f(e),t!==null)return t;e=e.sibling}return null}var p=Object.assign,m=Symbol.for(`react.element`),h=Symbol.for(`react.transitional.element`),g=Symbol.for(`react.portal`),_=Symbol.for(`react.fragment`),v=Symbol.for(`react.strict_mode`),y=Symbol.for(`react.profiler`),b=Symbol.for(`react.consumer`),x=Symbol.for(`react.context`),S=Symbol.for(`react.forward_ref`),C=Symbol.for(`react.suspense`),ee=Symbol.for(`react.suspense_list`),w=Symbol.for(`react.memo`),te=Symbol.for(`react.lazy`),T=Symbol.for(`react.activity`),E=Symbol.for(`react.memo_cache_sentinel`),O=Symbol.iterator;function ne(e){return typeof e!=`object`||!e?null:(e=O&&e[O]||e[`@@iterator`],typeof e==`function`?e:null)}var re=Symbol.for(`react.client.reference`);function ie(e){if(e==null)return null;if(typeof e==`function`)return e.$$typeof===re?null:e.displayName||e.name||null;if(typeof e==`string`)return e;switch(e){case _:return`Fragment`;case y:return`Profiler`;case v:return`StrictMode`;case C:return`Suspense`;case ee:return`SuspenseList`;case T:return`Activity`}if(typeof e==`object`)switch(e.$$typeof){case g:return`Portal`;case x:return e.displayName||`Context`;case b:return(e._context.displayName||`Context`)+`.Consumer`;case S:var t=e.render;return e=e.displayName,e||=(e=t.displayName||t.name||``,e===``?`ForwardRef`:`ForwardRef(`+e+`)`),e;case w:return t=e.displayName||null,t===null?ie(e.type)||`Memo`:t;case te:t=e._payload,e=e._init;try{return ie(e(t))}catch{}}return null}var ae=Array.isArray,k=r.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,A=i.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,oe={pending:!1,data:null,method:null,action:null},se=[],j=-1;function M(e){return{current:e}}function ce(e){0>j||(e.current=se[j],se[j]=null,j--)}function N(e,t){j++,se[j]=e.current,e.current=t}var le=M(null),ue=M(null),de=M(null),fe=M(null);function pe(e,t){switch(N(de,t),N(ue,e),N(le,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?Wd(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=Wd(t),e=Gd(t,e);else switch(e){case`svg`:e=1;break;case`math`:e=2;break;default:e=0}}ce(le),N(le,e)}function me(){ce(le),ce(ue),ce(de)}function he(e){e.memoizedState!==null&&N(fe,e);var t=le.current,n=Gd(t,e.type);t!==n&&(N(ue,e),N(le,n))}function ge(e){ue.current===e&&(ce(le),ce(ue)),fe.current===e&&(ce(fe),ep._currentValue=oe)}var _e,ve;function ye(e){if(_e===void 0)try{throw Error()}catch(e){var t=e.stack.trim().match(/\n( *(at )?)/);_e=t&&t[1]||``,ve=-1<e.stack.indexOf(`
    at`)?` (<anonymous>)`:-1<e.stack.indexOf(`@`)?`@unknown:0:0`:``}return`
`+_e+e+ve}var be=!1;function xe(e,t){if(!e||be)return``;be=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var r={DetermineComponentFrameRoot:function(){try{if(t){var n=function(){throw Error()};if(Object.defineProperty(n.prototype,"props",{set:function(){throw Error()}}),typeof Reflect==`object`&&Reflect.construct){try{Reflect.construct(n,[])}catch(e){var r=e}Reflect.construct(e,[],n)}else{try{n.call()}catch(e){r=e}e.call(n.prototype)}}else{try{throw Error()}catch(e){r=e}(n=e())&&typeof n.catch==`function`&&n.catch(function(){})}}catch(e){if(e&&r&&typeof e.stack==`string`)return[e.stack,r.stack]}return[null,null]}};r.DetermineComponentFrameRoot.displayName=`DetermineComponentFrameRoot`;var i=Object.getOwnPropertyDescriptor(r.DetermineComponentFrameRoot,`name`);i&&i.configurable&&Object.defineProperty(r.DetermineComponentFrameRoot,"name",{value:`DetermineComponentFrameRoot`});var a=r.DetermineComponentFrameRoot(),o=a[0],s=a[1];if(o&&s){var c=o.split(`
`),l=s.split(`
`);for(i=r=0;r<c.length&&!c[r].includes(`DetermineComponentFrameRoot`);)r++;for(;i<l.length&&!l[i].includes(`DetermineComponentFrameRoot`);)i++;if(r===c.length||i===l.length)for(r=c.length-1,i=l.length-1;1<=r&&0<=i&&c[r]!==l[i];)i--;for(;1<=r&&0<=i;r--,i--)if(c[r]!==l[i]){if(r!==1||i!==1)do if(r--,i--,0>i||c[r]!==l[i]){var u=`
`+c[r].replace(` at new `,` at `);return e.displayName&&u.includes(`<anonymous>`)&&(u=u.replace(`<anonymous>`,e.displayName)),u}while(1<=r&&0<=i);break}}}finally{be=!1,Error.prepareStackTrace=n}return(n=e?e.displayName||e.name:``)?ye(n):``}function Se(e,t){switch(e.tag){case 26:case 27:case 5:return ye(e.type);case 16:return ye(`Lazy`);case 13:return e.child!==t&&t!==null?ye(`Suspense Fallback`):ye(`Suspense`);case 19:return ye(`SuspenseList`);case 0:case 15:return xe(e.type,!1);case 11:return xe(e.type.render,!1);case 1:return xe(e.type,!0);case 31:return ye(`Activity`);default:return``}}function Ce(e){try{var t=``,n=null;do t+=Se(e,n),n=e,e=e.return;while(e);return t}catch(e){return`
Error generating stack: `+e.message+`
`+e.stack}}var we=Object.prototype.hasOwnProperty,Te=n.unstable_scheduleCallback,Ee=n.unstable_cancelCallback,De=n.unstable_shouldYield,Oe=n.unstable_requestPaint,ke=n.unstable_now,Ae=n.unstable_getCurrentPriorityLevel,je=n.unstable_ImmediatePriority,Me=n.unstable_UserBlockingPriority,Ne=n.unstable_NormalPriority,Pe=n.unstable_LowPriority,Fe=n.unstable_IdlePriority,P=n.log,Ie=n.unstable_setDisableYieldValue,Le=null,Re=null;function ze(e){if(typeof P==`function`&&Ie(e),Re&&typeof Re.setStrictMode==`function`)try{Re.setStrictMode(Le,e)}catch{}}var Be=Math.clz32?Math.clz32:Ue,Ve=Math.log,He=Math.LN2;function Ue(e){return e>>>=0,e===0?32:31-(Ve(e)/He|0)|0}var We=256,Ge=262144,Ke=4194304;function qe(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&261888;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function Je(e,t,n){var r=e.pendingLanes;if(r===0)return 0;var i=0,a=e.suspendedLanes,o=e.pingedLanes;e=e.warmLanes;var s=r&134217727;return s===0?(s=r&~a,s===0?o===0?n||(n=r&~e,n!==0&&(i=qe(n))):i=qe(o):i=qe(s)):(r=s&~a,r===0?(o&=s,o===0?n||(n=s&~e,n!==0&&(i=qe(n))):i=qe(o)):i=qe(r)),i===0?0:t!==0&&t!==i&&(t&a)===0&&(a=i&-i,n=t&-t,a>=n||a===32&&n&4194048)?t:i}function Ye(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function Xe(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Ze(){var e=Ke;return Ke<<=1,!(Ke&62914560)&&(Ke=4194304),e}function Qe(e){for(var t=[],n=0;31>n;n++)t.push(e);return t}function $e(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function et(e,t,n,r,i,a){var o=e.pendingLanes;e.pendingLanes=n,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=n,e.entangledLanes&=n,e.errorRecoveryDisabledLanes&=n,e.shellSuspendCounter=0;var s=e.entanglements,c=e.expirationTimes,l=e.hiddenUpdates;for(n=o&~n;0<n;){var u=31-Be(n),d=1<<u;s[u]=0,c[u]=-1;var f=l[u];if(f!==null)for(l[u]=null,u=0;u<f.length;u++){var p=f[u];p!==null&&(p.lane&=-536870913)}n&=~d}r!==0&&tt(e,r,0),a!==0&&i===0&&e.tag!==0&&(e.suspendedLanes|=a&~(o&~t))}function tt(e,t,n){e.pendingLanes|=t,e.suspendedLanes&=~t;var r=31-Be(t);e.entangledLanes|=t,e.entanglements[r]=e.entanglements[r]|1073741824|n&261930}function nt(e,t){var n=e.entangledLanes|=t;for(e=e.entanglements;n;){var r=31-Be(n),i=1<<r;i&t|e[r]&t&&(e[r]|=t),n&=~i}}function rt(e,t){var n=t&-t;return n=n&42?1:it(n),(n&(e.suspendedLanes|t))===0?n:0}function it(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function at(e){return e&=-e,2<e?8<e?e&134217727?32:268435456:8:2}function ot(){var e=A.p;return e===0?(e=window.event,e===void 0?32:gp(e.type)):e}function st(e,t){var n=A.p;try{return A.p=e,t()}finally{A.p=n}}var ct=Math.random().toString(36).slice(2),lt=`__reactFiber$`+ct,ut=`__reactProps$`+ct,dt=`__reactContainer$`+ct,ft=`__reactEvents$`+ct,pt=`__reactListeners$`+ct,mt=`__reactHandles$`+ct,ht=`__reactResources$`+ct,gt=`__reactMarker$`+ct;function _t(e){delete e[lt],delete e[ut],delete e[ft],delete e[pt],delete e[mt]}function vt(e){var t=e[lt];if(t)return t;for(var n=e.parentNode;n;){if(t=n[dt]||n[lt]){if(n=t.alternate,t.child!==null||n!==null&&n.child!==null)for(e=Z(e);e!==null;){if(n=e[lt])return n;e=Z(e)}return t}e=n,n=e.parentNode}return null}function yt(e){if(e=e[lt]||e[dt]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function xt(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(a(33))}function St(e){var t=e[ht];return t||=e[ht]={hoistableStyles:new Map,hoistableScripts:new Map},t}function F(e){e[gt]=!0}var Ct=new Set,wt={};function I(e,t){Tt(e,t),Tt(e+`Capture`,t)}function Tt(e,t){for(wt[e]=t,e=0;e<t.length;e++)Ct.add(t[e])}var Et=RegExp(`^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$`),Dt={},Ot={};function kt(e){return we.call(Ot,e)?!0:we.call(Dt,e)?!1:Et.test(e)?Ot[e]=!0:(Dt[e]=!0,!1)}function At(e,t,n){if(kt(t))if(n===null)e.removeAttribute(t);else{switch(typeof n){case`undefined`:case`function`:case`symbol`:e.removeAttribute(t);return;case`boolean`:var r=t.toLowerCase().slice(0,5);if(r!==`data-`&&r!==`aria-`){e.removeAttribute(t);return}}e.setAttribute(t,``+n)}}function jt(e,t,n){if(n===null)e.removeAttribute(t);else{switch(typeof n){case`undefined`:case`function`:case`symbol`:case`boolean`:e.removeAttribute(t);return}e.setAttribute(t,``+n)}}function Mt(e,t,n,r){if(r===null)e.removeAttribute(n);else{switch(typeof r){case`undefined`:case`function`:case`symbol`:case`boolean`:e.removeAttribute(n);return}e.setAttributeNS(t,n,``+r)}}function Nt(e){switch(typeof e){case`bigint`:case`boolean`:case`number`:case`string`:case`undefined`:return e;case`object`:return e;default:return``}}function Pt(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()===`input`&&(t===`checkbox`||t===`radio`)}function Ft(e,t,n){var r=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&r!==void 0&&typeof r.get==`function`&&typeof r.set==`function`){var i=r.get,a=r.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return i.call(this)},set:function(e){n=``+e,a.call(this,e)}}),Object.defineProperty(e,t,{enumerable:r.enumerable}),{getValue:function(){return n},setValue:function(e){n=``+e},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function It(e){if(!e._valueTracker){var t=Pt(e)?`checked`:`value`;e._valueTracker=Ft(e,t,``+e[t])}}function Lt(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var n=t.getValue(),r=``;return e&&(r=Pt(e)?e.checked?`true`:`false`:e.value),e=r,e===n?!1:(t.setValue(e),!0)}function Rt(e){if(e||=typeof document<`u`?document:void 0,e===void 0)return null;try{return e.activeElement||e.body}catch{return e.body}}var zt=/[\n"\\]/g;function Bt(e){return e.replace(zt,function(e){return`\\`+e.charCodeAt(0).toString(16)+` `})}function Vt(e,t,n,r,i,a,o,s){e.name=``,o!=null&&typeof o!=`function`&&typeof o!=`symbol`&&typeof o!=`boolean`?e.type=o:e.removeAttribute(`type`),t==null?o!==`submit`&&o!==`reset`||e.removeAttribute(`value`):o===`number`?(t===0&&e.value===``||e.value!=t)&&(e.value=``+Nt(t)):e.value!==``+Nt(t)&&(e.value=``+Nt(t)),t==null?n==null?r!=null&&e.removeAttribute(`value`):Ut(e,o,Nt(n)):Ut(e,o,Nt(t)),i==null&&a!=null&&(e.defaultChecked=!!a),i!=null&&(e.checked=i&&typeof i!=`function`&&typeof i!=`symbol`),s!=null&&typeof s!=`function`&&typeof s!=`symbol`&&typeof s!=`boolean`?e.name=``+Nt(s):e.removeAttribute(`name`)}function Ht(e,t,n,r,i,a,o,s){if(a!=null&&typeof a!=`function`&&typeof a!=`symbol`&&typeof a!=`boolean`&&(e.type=a),t!=null||n!=null){if(!(a!==`submit`&&a!==`reset`||t!=null)){It(e);return}n=n==null?``:``+Nt(n),t=t==null?n:``+Nt(t),s||t===e.value||(e.value=t),e.defaultValue=t}r??=i,r=typeof r!=`function`&&typeof r!=`symbol`&&!!r,e.checked=s?e.checked:!!r,e.defaultChecked=!!r,o!=null&&typeof o!=`function`&&typeof o!=`symbol`&&typeof o!=`boolean`&&(e.name=o),It(e)}function Ut(e,t,n){t===`number`&&Rt(e.ownerDocument)===e||e.defaultValue===``+n||(e.defaultValue=``+n)}function Wt(e,t,n,r){if(e=e.options,t){t={};for(var i=0;i<n.length;i++)t[`$`+n[i]]=!0;for(n=0;n<e.length;n++)i=t.hasOwnProperty(`$`+e[n].value),e[n].selected!==i&&(e[n].selected=i),i&&r&&(e[n].defaultSelected=!0)}else{for(n=``+Nt(n),t=null,i=0;i<e.length;i++){if(e[i].value===n){e[i].selected=!0,r&&(e[i].defaultSelected=!0);return}t!==null||e[i].disabled||(t=e[i])}t!==null&&(t.selected=!0)}}function Gt(e,t,n){if(t!=null&&(t=``+Nt(t),t!==e.value&&(e.value=t),n==null)){e.defaultValue!==t&&(e.defaultValue=t);return}e.defaultValue=n==null?``:``+Nt(n)}function Kt(e,t,n,r){if(t==null){if(r!=null){if(n!=null)throw Error(a(92));if(ae(r)){if(1<r.length)throw Error(a(93));r=r[0]}n=r}n??=``,t=n}n=Nt(t),e.defaultValue=n,r=e.textContent,r===n&&r!==``&&r!==null&&(e.value=r),It(e)}function qt(e,t){if(t){var n=e.firstChild;if(n&&n===e.lastChild&&n.nodeType===3){n.nodeValue=t;return}}e.textContent=t}var Jt=new Set(`animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp`.split(` `));function Yt(e,t,n){var r=t.indexOf(`--`)===0;n==null||typeof n==`boolean`||n===``?r?e.setProperty(t,``):t===`float`?e.cssFloat=``:e[t]=``:r?e.setProperty(t,n):typeof n!=`number`||n===0||Jt.has(t)?t===`float`?e.cssFloat=n:e[t]=(``+n).trim():e[t]=n+`px`}function Xt(e,t,n){if(t!=null&&typeof t!=`object`)throw Error(a(62));if(e=e.style,n!=null){for(var r in n)!n.hasOwnProperty(r)||t!=null&&t.hasOwnProperty(r)||(r.indexOf(`--`)===0?e.setProperty(r,``):r===`float`?e.cssFloat=``:e[r]=``);for(var i in t)r=t[i],t.hasOwnProperty(i)&&n[i]!==r&&Yt(e,i,r)}else for(var o in t)t.hasOwnProperty(o)&&Yt(e,o,t[o])}function Zt(e){if(e.indexOf(`-`)===-1)return!1;switch(e){case`annotation-xml`:case`color-profile`:case`font-face`:case`font-face-src`:case`font-face-uri`:case`font-face-format`:case`font-face-name`:case`missing-glyph`:return!1;default:return!0}}var Qt=new Map([[`acceptCharset`,`accept-charset`],[`htmlFor`,`for`],[`httpEquiv`,`http-equiv`],[`crossOrigin`,`crossorigin`],[`accentHeight`,`accent-height`],[`alignmentBaseline`,`alignment-baseline`],[`arabicForm`,`arabic-form`],[`baselineShift`,`baseline-shift`],[`capHeight`,`cap-height`],[`clipPath`,`clip-path`],[`clipRule`,`clip-rule`],[`colorInterpolation`,`color-interpolation`],[`colorInterpolationFilters`,`color-interpolation-filters`],[`colorProfile`,`color-profile`],[`colorRendering`,`color-rendering`],[`dominantBaseline`,`dominant-baseline`],[`enableBackground`,`enable-background`],[`fillOpacity`,`fill-opacity`],[`fillRule`,`fill-rule`],[`floodColor`,`flood-color`],[`floodOpacity`,`flood-opacity`],[`fontFamily`,`font-family`],[`fontSize`,`font-size`],[`fontSizeAdjust`,`font-size-adjust`],[`fontStretch`,`font-stretch`],[`fontStyle`,`font-style`],[`fontVariant`,`font-variant`],[`fontWeight`,`font-weight`],[`glyphName`,`glyph-name`],[`glyphOrientationHorizontal`,`glyph-orientation-horizontal`],[`glyphOrientationVertical`,`glyph-orientation-vertical`],[`horizAdvX`,`horiz-adv-x`],[`horizOriginX`,`horiz-origin-x`],[`imageRendering`,`image-rendering`],[`letterSpacing`,`letter-spacing`],[`lightingColor`,`lighting-color`],[`markerEnd`,`marker-end`],[`markerMid`,`marker-mid`],[`markerStart`,`marker-start`],[`overlinePosition`,`overline-position`],[`overlineThickness`,`overline-thickness`],[`paintOrder`,`paint-order`],[`panose-1`,`panose-1`],[`pointerEvents`,`pointer-events`],[`renderingIntent`,`rendering-intent`],[`shapeRendering`,`shape-rendering`],[`stopColor`,`stop-color`],[`stopOpacity`,`stop-opacity`],[`strikethroughPosition`,`strikethrough-position`],[`strikethroughThickness`,`strikethrough-thickness`],[`strokeDasharray`,`stroke-dasharray`],[`strokeDashoffset`,`stroke-dashoffset`],[`strokeLinecap`,`stroke-linecap`],[`strokeLinejoin`,`stroke-linejoin`],[`strokeMiterlimit`,`stroke-miterlimit`],[`strokeOpacity`,`stroke-opacity`],[`strokeWidth`,`stroke-width`],[`textAnchor`,`text-anchor`],[`textDecoration`,`text-decoration`],[`textRendering`,`text-rendering`],[`transformOrigin`,`transform-origin`],[`underlinePosition`,`underline-position`],[`underlineThickness`,`underline-thickness`],[`unicodeBidi`,`unicode-bidi`],[`unicodeRange`,`unicode-range`],[`unitsPerEm`,`units-per-em`],[`vAlphabetic`,`v-alphabetic`],[`vHanging`,`v-hanging`],[`vIdeographic`,`v-ideographic`],[`vMathematical`,`v-mathematical`],[`vectorEffect`,`vector-effect`],[`vertAdvY`,`vert-adv-y`],[`vertOriginX`,`vert-origin-x`],[`vertOriginY`,`vert-origin-y`],[`wordSpacing`,`word-spacing`],[`writingMode`,`writing-mode`],[`xmlnsXlink`,`xmlns:xlink`],[`xHeight`,`x-height`]]),$t=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function en(e){return $t.test(``+e)?`javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')`:e}function tn(){}var nn=null;function rn(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var an=null,on=null;function sn(e){var t=yt(e);if(t&&(e=t.stateNode)){var n=e[ut]||null;a:switch(e=t.stateNode,t.type){case`input`:if(Vt(e,n.value,n.defaultValue,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name),t=n.name,n.type===`radio`&&t!=null){for(n=e;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll(`input[name="`+Bt(``+t)+`"][type="radio"]`),t=0;t<n.length;t++){var r=n[t];if(r!==e&&r.form===e.form){var i=r[ut]||null;if(!i)throw Error(a(90));Vt(r,i.value,i.defaultValue,i.defaultValue,i.checked,i.defaultChecked,i.type,i.name)}}for(t=0;t<n.length;t++)r=n[t],r.form===e.form&&Lt(r)}break a;case`textarea`:Gt(e,n.value,n.defaultValue);break a;case`select`:t=n.value,t!=null&&Wt(e,!!n.multiple,t,!1)}}}var cn=!1;function ln(e,t,n){if(cn)return e(t,n);cn=!0;try{return e(t)}finally{if(cn=!1,(an!==null||on!==null)&&(Su(),an&&(t=an,e=on,on=an=null,sn(t),e)))for(t=0;t<e.length;t++)sn(e[t])}}function un(e,t){var n=e.stateNode;if(n===null)return null;var r=n[ut]||null;if(r===null)return null;n=r[t];a:switch(t){case`onClick`:case`onClickCapture`:case`onDoubleClick`:case`onDoubleClickCapture`:case`onMouseDown`:case`onMouseDownCapture`:case`onMouseMove`:case`onMouseMoveCapture`:case`onMouseUp`:case`onMouseUpCapture`:case`onMouseEnter`:(r=!r.disabled)||(e=e.type,r=!(e===`button`||e===`input`||e===`select`||e===`textarea`)),e=!r;break a;default:e=!1}if(e)return null;if(n&&typeof n!=`function`)throw Error(a(231,t,typeof n));return n}var dn=!(typeof window>`u`||window.document===void 0||window.document.createElement===void 0),fn=!1;if(dn)try{var pn={};Object.defineProperty(pn,"passive",{get:function(){fn=!0}}),window.addEventListener(`test`,pn,pn),window.removeEventListener(`test`,pn,pn)}catch{fn=!1}var mn=null,hn=null,gn=null;function _n(){if(gn)return gn;var e,t=hn,n=t.length,r,i=`value`in mn?mn.value:mn.textContent,a=i.length;for(e=0;e<n&&t[e]===i[e];e++);var o=n-e;for(r=1;r<=o&&t[n-r]===i[a-r];r++);return gn=i.slice(e,1<r?1-r:void 0)}function vn(e){var t=e.keyCode;return`charCode`in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function yn(){return!0}function bn(){return!1}function xn(e){function t(t,n,r,i,a){for(var o in this._reactName=t,this._targetInst=r,this.type=n,this.nativeEvent=i,this.target=a,this.currentTarget=null,e)e.hasOwnProperty(o)&&(t=e[o],this[o]=t?t(i):i[o]);return this.isDefaultPrevented=(i.defaultPrevented==null?!1===i.returnValue:i.defaultPrevented)?yn:bn,this.isPropagationStopped=bn,this}return p(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var e=this.nativeEvent;e&&(e.preventDefault?e.preventDefault():typeof e.returnValue!=`unknown`&&(e.returnValue=!1),this.isDefaultPrevented=yn)},stopPropagation:function(){var e=this.nativeEvent;e&&(e.stopPropagation?e.stopPropagation():typeof e.cancelBubble!=`unknown`&&(e.cancelBubble=!0),this.isPropagationStopped=yn)},persist:function(){},isPersistent:yn}),t}var Sn={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Cn=xn(Sn),wn=p({},Sn,{view:0,detail:0}),Tn=xn(wn),En,Dn,On,kn=p({},wn,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:zn,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return`movementX`in e?e.movementX:(e!==On&&(On&&e.type===`mousemove`?(En=e.screenX-On.screenX,Dn=e.screenY-On.screenY):Dn=En=0,On=e),En)},movementY:function(e){return`movementY`in e?e.movementY:Dn}}),An=xn(kn),jn=xn(p({},kn,{dataTransfer:0})),Mn=xn(p({},wn,{relatedTarget:0})),L=xn(p({},Sn,{animationName:0,elapsedTime:0,pseudoElement:0})),Nn=xn(p({},Sn,{clipboardData:function(e){return`clipboardData`in e?e.clipboardData:window.clipboardData}})),Pn=xn(p({},Sn,{data:0})),Fn={Esc:`Escape`,Spacebar:` `,Left:`ArrowLeft`,Up:`ArrowUp`,Right:`ArrowRight`,Down:`ArrowDown`,Del:`Delete`,Win:`OS`,Menu:`ContextMenu`,Apps:`ContextMenu`,Scroll:`ScrollLock`,MozPrintableKey:`Unidentified`},In={8:`Backspace`,9:`Tab`,12:`Clear`,13:`Enter`,16:`Shift`,17:`Control`,18:`Alt`,19:`Pause`,20:`CapsLock`,27:`Escape`,32:` `,33:`PageUp`,34:`PageDown`,35:`End`,36:`Home`,37:`ArrowLeft`,38:`ArrowUp`,39:`ArrowRight`,40:`ArrowDown`,45:`Insert`,46:`Delete`,112:`F1`,113:`F2`,114:`F3`,115:`F4`,116:`F5`,117:`F6`,118:`F7`,119:`F8`,120:`F9`,121:`F10`,122:`F11`,123:`F12`,144:`NumLock`,145:`ScrollLock`,224:`Meta`},Ln={Alt:`altKey`,Control:`ctrlKey`,Meta:`metaKey`,Shift:`shiftKey`};function Rn(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=Ln[e])?!!t[e]:!1}function zn(){return Rn}var Bn=xn(p({},wn,{key:function(e){if(e.key){var t=Fn[e.key]||e.key;if(t!==`Unidentified`)return t}return e.type===`keypress`?(e=vn(e),e===13?`Enter`:String.fromCharCode(e)):e.type===`keydown`||e.type===`keyup`?In[e.keyCode]||`Unidentified`:``},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:zn,charCode:function(e){return e.type===`keypress`?vn(e):0},keyCode:function(e){return e.type===`keydown`||e.type===`keyup`?e.keyCode:0},which:function(e){return e.type===`keypress`?vn(e):e.type===`keydown`||e.type===`keyup`?e.keyCode:0}})),Vn=xn(p({},kn,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0})),Hn=xn(p({},wn,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:zn})),Un=xn(p({},Sn,{propertyName:0,elapsedTime:0,pseudoElement:0})),Wn=xn(p({},kn,{deltaX:function(e){return`deltaX`in e?e.deltaX:`wheelDeltaX`in e?-e.wheelDeltaX:0},deltaY:function(e){return`deltaY`in e?e.deltaY:`wheelDeltaY`in e?-e.wheelDeltaY:`wheelDelta`in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0})),Gn=xn(p({},Sn,{newState:0,oldState:0})),Kn=[9,13,27,32],qn=dn&&`CompositionEvent`in window,Jn=null;dn&&`documentMode`in document&&(Jn=document.documentMode);var Yn=dn&&`TextEvent`in window&&!Jn,Xn=dn&&(!qn||Jn&&8<Jn&&11>=Jn),Zn=` `,Qn=!1;function $n(e,t){switch(e){case`keyup`:return Kn.indexOf(t.keyCode)!==-1;case`keydown`:return t.keyCode!==229;case`keypress`:case`mousedown`:case`focusout`:return!0;default:return!1}}function er(e){return e=e.detail,typeof e==`object`&&`data`in e?e.data:null}var tr=!1;function nr(e,t){switch(e){case`compositionend`:return er(t);case`keypress`:return t.which===32?(Qn=!0,Zn):null;case`textInput`:return e=t.data,e===Zn&&Qn?null:e;default:return null}}function rr(e,t){if(tr)return e===`compositionend`||!qn&&$n(e,t)?(e=_n(),gn=hn=mn=null,tr=!1,e):null;switch(e){case`paste`:return null;case`keypress`:if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case`compositionend`:return Xn&&t.locale!==`ko`?null:t.data;default:return null}}var ir={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function ar(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t===`input`?!!ir[e.type]:t===`textarea`}function or(e,t,n,r){an?on?on.push(r):on=[r]:an=r,t=kd(t,`onChange`),0<t.length&&(n=new Cn(`onChange`,`change`,null,n,r),e.push({event:n,listeners:t}))}var sr=null,cr=null;function lr(e){Sd(e,0)}function ur(e){if(Lt(xt(e)))return e}function dr(e,t){if(e===`change`)return t}var fr=!1;if(dn){var pr;if(dn){var mr=`oninput`in document;if(!mr){var hr=document.createElement(`div`);hr.setAttribute(`oninput`,`return;`),mr=typeof hr.oninput==`function`}pr=mr}else pr=!1;fr=pr&&(!document.documentMode||9<document.documentMode)}function gr(){sr&&(sr.detachEvent(`onpropertychange`,_r),cr=sr=null)}function _r(e){if(e.propertyName===`value`&&ur(cr)){var t=[];or(t,cr,e,rn(e)),ln(lr,t)}}function vr(e,t,n){e===`focusin`?(gr(),sr=t,cr=n,sr.attachEvent(`onpropertychange`,_r)):e===`focusout`&&gr()}function yr(e){if(e===`selectionchange`||e===`keyup`||e===`keydown`)return ur(cr)}function br(e,t){if(e===`click`)return ur(t)}function xr(e,t){if(e===`input`||e===`change`)return ur(t)}function Sr(e,t){return e===t&&(e!==0||1/e==1/t)||e!==e&&t!==t}var Cr=typeof Object.is==`function`?Object.is:Sr;function wr(e,t){if(Cr(e,t))return!0;if(typeof e!=`object`||!e||typeof t!=`object`||!t)return!1;var n=Object.keys(e),r=Object.keys(t);if(n.length!==r.length)return!1;for(r=0;r<n.length;r++){var i=n[r];if(!we.call(t,i)||!Cr(e[i],t[i]))return!1}return!0}function Tr(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function Er(e,t){var n=Tr(e);e=0;for(var r;n;){if(n.nodeType===3){if(r=e+n.textContent.length,e<=t&&r>=t)return{node:n,offset:t-e};e=r}a:{for(;n;){if(n.nextSibling){n=n.nextSibling;break a}n=n.parentNode}n=void 0}n=Tr(n)}}function Dr(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?Dr(e,t.parentNode):`contains`in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function Or(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=Rt(e.document);t instanceof e.HTMLIFrameElement;){try{var n=typeof t.contentWindow.location.href==`string`}catch{n=!1}if(n)e=t.contentWindow;else break;t=Rt(e.document)}return t}function R(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t===`input`&&(e.type===`text`||e.type===`search`||e.type===`tel`||e.type===`url`||e.type===`password`)||t===`textarea`||e.contentEditable===`true`)}var kr=dn&&`documentMode`in document&&11>=document.documentMode,Ar=null,jr=null,Mr=null,Nr=!1;function Pr(e,t,n){var r=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;Nr||Ar==null||Ar!==Rt(r)||(r=Ar,`selectionStart`in r&&R(r)?r={start:r.selectionStart,end:r.selectionEnd}:(r=(r.ownerDocument&&r.ownerDocument.defaultView||window).getSelection(),r={anchorNode:r.anchorNode,anchorOffset:r.anchorOffset,focusNode:r.focusNode,focusOffset:r.focusOffset}),Mr&&wr(Mr,r)||(Mr=r,r=kd(jr,`onSelect`),0<r.length&&(t=new Cn(`onSelect`,`select`,null,t,n),e.push({event:t,listeners:r}),t.target=Ar)))}function Fr(e,t){var n={};return n[e.toLowerCase()]=t.toLowerCase(),n[`Webkit`+e]=`webkit`+t,n[`Moz`+e]=`moz`+t,n}var Ir={animationend:Fr(`Animation`,`AnimationEnd`),animationiteration:Fr(`Animation`,`AnimationIteration`),animationstart:Fr(`Animation`,`AnimationStart`),transitionrun:Fr(`Transition`,`TransitionRun`),transitionstart:Fr(`Transition`,`TransitionStart`),transitioncancel:Fr(`Transition`,`TransitionCancel`),transitionend:Fr(`Transition`,`TransitionEnd`)},Lr={},Rr={};dn&&(Rr=document.createElement(`div`).style,`AnimationEvent`in window||(delete Ir.animationend.animation,delete Ir.animationiteration.animation,delete Ir.animationstart.animation),`TransitionEvent`in window||delete Ir.transitionend.transition);function zr(e){if(Lr[e])return Lr[e];if(!Ir[e])return e;var t=Ir[e],n;for(n in t)if(t.hasOwnProperty(n)&&n in Rr)return Lr[e]=t[n];return e}var Br=zr(`animationend`),Vr=zr(`animationiteration`),Hr=zr(`animationstart`),Ur=zr(`transitionrun`),Wr=zr(`transitionstart`),Gr=zr(`transitioncancel`),Kr=zr(`transitionend`),qr=new Map,Jr=`abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel`.split(` `);Jr.push(`scrollEnd`);function Yr(e,t){qr.set(e,t),I(t,[e])}var Xr=typeof reportError==`function`?reportError:function(e){if(typeof window==`object`&&typeof window.ErrorEvent==`function`){var t=new window.ErrorEvent(`error`,{bubbles:!0,cancelable:!0,message:typeof e==`object`&&e&&typeof e.message==`string`?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process==`object`&&typeof process.emit==`function`){process.emit(`uncaughtException`,e);return}console.error(e)},Zr=[],Qr=0,$r=0;function ei(){for(var e=Qr,t=$r=Qr=0;t<e;){var n=Zr[t];Zr[t++]=null;var r=Zr[t];Zr[t++]=null;var i=Zr[t];Zr[t++]=null;var a=Zr[t];if(Zr[t++]=null,r!==null&&i!==null){var o=r.pending;o===null?i.next=i:(i.next=o.next,o.next=i),r.pending=i}a!==0&&ii(n,i,a)}}function ti(e,t,n,r){Zr[Qr++]=e,Zr[Qr++]=t,Zr[Qr++]=n,Zr[Qr++]=r,$r|=r,e.lanes|=r,e=e.alternate,e!==null&&(e.lanes|=r)}function ni(e,t,n,r){return ti(e,t,n,r),ai(e)}function ri(e,t){return ti(e,null,null,t),ai(e)}function ii(e,t,n){e.lanes|=n;var r=e.alternate;r!==null&&(r.lanes|=n);for(var i=!1,a=e.return;a!==null;)a.childLanes|=n,r=a.alternate,r!==null&&(r.childLanes|=n),a.tag===22&&(e=a.stateNode,e===null||e._visibility&1||(i=!0)),e=a,a=a.return;return e.tag===3?(a=e.stateNode,i&&t!==null&&(i=31-Be(n),e=a.hiddenUpdates,r=e[i],r===null?e[i]=[t]:r.push(t),t.lane=n|536870912),a):null}function ai(e){if(50<pu)throw pu=0,mu=null,Error(a(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var oi={};function si(e,t,n,r){this.tag=e,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function ci(e,t,n,r){return new si(e,t,n,r)}function li(e){return e=e.prototype,!(!e||!e.isReactComponent)}function ui(e,t){var n=e.alternate;return n===null?(n=ci(e.tag,t,e.key,e.mode),n.elementType=e.elementType,n.type=e.type,n.stateNode=e.stateNode,n.alternate=e,e.alternate=n):(n.pendingProps=t,n.type=e.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=e.flags&65011712,n.childLanes=e.childLanes,n.lanes=e.lanes,n.child=e.child,n.memoizedProps=e.memoizedProps,n.memoizedState=e.memoizedState,n.updateQueue=e.updateQueue,t=e.dependencies,n.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},n.sibling=e.sibling,n.index=e.index,n.ref=e.ref,n.refCleanup=e.refCleanup,n}function di(e,t){e.flags&=65011714;var n=e.alternate;return n===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=n.childLanes,e.lanes=n.lanes,e.child=n.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=n.memoizedProps,e.memoizedState=n.memoizedState,e.updateQueue=n.updateQueue,e.type=n.type,t=n.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function fi(e,t,n,r,i,o){var s=0;if(r=e,typeof e==`function`)li(e)&&(s=1);else if(typeof e==`string`)s=Gf(e,n,le.current)?26:e===`html`||e===`head`||e===`body`?27:5;else a:switch(e){case T:return e=ci(31,n,t,i),e.elementType=T,e.lanes=o,e;case _:return pi(n.children,i,o,t);case v:s=8,i|=24;break;case y:return e=ci(12,n,t,i|2),e.elementType=y,e.lanes=o,e;case C:return e=ci(13,n,t,i),e.elementType=C,e.lanes=o,e;case ee:return e=ci(19,n,t,i),e.elementType=ee,e.lanes=o,e;default:if(typeof e==`object`&&e)switch(e.$$typeof){case x:s=10;break a;case b:s=9;break a;case S:s=11;break a;case w:s=14;break a;case te:s=16,r=null;break a}s=29,n=Error(a(130,e===null?`null`:typeof e,``)),r=null}return t=ci(s,n,t,i),t.elementType=e,t.type=r,t.lanes=o,t}function pi(e,t,n,r){return e=ci(7,e,r,t),e.lanes=n,e}function mi(e,t,n){return e=ci(6,e,null,t),e.lanes=n,e}function hi(e){var t=ci(18,null,null,0);return t.stateNode=e,t}function gi(e,t,n){return t=ci(4,e.children===null?[]:e.children,e.key,t),t.lanes=n,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var _i=new WeakMap;function vi(e,t){if(typeof e==`object`&&e){var n=_i.get(e);return n===void 0?(t={value:e,source:t,stack:Ce(t)},_i.set(e,t),t):n}return{value:e,source:t,stack:Ce(t)}}var yi=[],bi=0,xi=null,Si=0,Ci=[],wi=0,Ti=null,Ei=1,Di=``;function Oi(e,t){yi[bi++]=Si,yi[bi++]=xi,xi=e,Si=t}function ki(e,t,n){Ci[wi++]=Ei,Ci[wi++]=Di,Ci[wi++]=Ti,Ti=e;var r=Ei;e=Di;var i=32-Be(r)-1;r&=~(1<<i),n+=1;var a=32-Be(t)+i;if(30<a){var o=i-i%5;a=(r&(1<<o)-1).toString(32),r>>=o,i-=o,Ei=1<<32-Be(t)+i|n<<i|r,Di=a+e}else Ei=1<<a|n<<i|r,Di=e}function Ai(e){e.return!==null&&(Oi(e,1),ki(e,1,0))}function ji(e){for(;e===xi;)xi=yi[--bi],yi[bi]=null,Si=yi[--bi],yi[bi]=null;for(;e===Ti;)Ti=Ci[--wi],Ci[wi]=null,Di=Ci[--wi],Ci[wi]=null,Ei=Ci[--wi],Ci[wi]=null}function Mi(e,t){Ci[wi++]=Ei,Ci[wi++]=Di,Ci[wi++]=Ti,Ei=t.id,Di=t.overflow,Ti=e}var Ni=null,Pi=null,z=!1,Fi=null,Ii=!1,Li=Error(a(519));function Ri(e){throw Wi(vi(Error(a(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?`text`:`HTML`,``)),e)),Li}function zi(e){var t=e.stateNode,n=e.type,r=e.memoizedProps;switch(t[lt]=e,t[ut]=r,n){case`dialog`:Y(`cancel`,t),Y(`close`,t);break;case`iframe`:case`object`:case`embed`:Y(`load`,t);break;case`video`:case`audio`:for(n=0;n<bd.length;n++)Y(bd[n],t);break;case`source`:Y(`error`,t);break;case`img`:case`image`:case`link`:Y(`error`,t),Y(`load`,t);break;case`details`:Y(`toggle`,t);break;case`input`:Y(`invalid`,t),Ht(t,r.value,r.defaultValue,r.checked,r.defaultChecked,r.type,r.name,!0);break;case`select`:Y(`invalid`,t);break;case`textarea`:Y(`invalid`,t),Kt(t,r.value,r.defaultValue,r.children)}n=r.children,typeof n!=`string`&&typeof n!=`number`&&typeof n!=`bigint`||t.textContent===``+n||!0===r.suppressHydrationWarning||Fd(t.textContent,n)?(r.popover!=null&&(Y(`beforetoggle`,t),Y(`toggle`,t)),r.onScroll!=null&&Y(`scroll`,t),r.onScrollEnd!=null&&Y(`scrollend`,t),r.onClick!=null&&(t.onclick=tn),t=!0):t=!1,t||Ri(e,!0)}function Bi(e){for(Ni=e.return;Ni;)switch(Ni.tag){case 5:case 31:case 13:Ii=!1;return;case 27:case 3:Ii=!0;return;default:Ni=Ni.return}}function Vi(e){if(e!==Ni)return!1;if(!z)return Bi(e),z=!0,!1;var t=e.tag,n;if((n=t!==3&&t!==27)&&((n=t===5)&&(n=e.type,n=!(n!==`form`&&n!==`button`)||Kd(e.type,e.memoizedProps)),n=!n),n&&Pi&&Ri(e),Bi(e),t===13){if(e=e.memoizedState,e=e===null?null:e.dehydrated,!e)throw Error(a(317));Pi=pf(e)}else if(t===31){if(e=e.memoizedState,e=e===null?null:e.dehydrated,!e)throw Error(a(317));Pi=pf(e)}else t===27?(t=Pi,ef(e.type)?(e=ff,ff=null,Pi=e):Pi=t):Pi=Ni?df(e.stateNode.nextSibling):null;return!0}function Hi(){Pi=Ni=null,z=!1}function Ui(){var e=Fi;return e!==null&&($l===null?$l=e:$l.push.apply($l,e),Fi=null),e}function Wi(e){Fi===null?Fi=[e]:Fi.push(e)}var Gi=M(null),Ki=null,qi=null;function Ji(e,t,n){N(Gi,t._currentValue),t._currentValue=n}function Yi(e){e._currentValue=Gi.current,ce(Gi)}function Xi(e,t,n){for(;e!==null;){var r=e.alternate;if((e.childLanes&t)===t?r!==null&&(r.childLanes&t)!==t&&(r.childLanes|=t):(e.childLanes|=t,r!==null&&(r.childLanes|=t)),e===n)break;e=e.return}}function Zi(e,t,n,r){var i=e.child;for(i!==null&&(i.return=e);i!==null;){var o=i.dependencies;if(o!==null){var s=i.child;o=o.firstContext;a:for(;o!==null;){var c=o;o=i;for(var l=0;l<t.length;l++)if(c.context===t[l]){o.lanes|=n,c=o.alternate,c!==null&&(c.lanes|=n),Xi(o.return,n,e),r||(s=null);break a}o=c.next}}else if(i.tag===18){if(s=i.return,s===null)throw Error(a(341));s.lanes|=n,o=s.alternate,o!==null&&(o.lanes|=n),Xi(s,n,e),s=null}else s=i.child;if(s!==null)s.return=i;else for(s=i;s!==null;){if(s===e){s=null;break}if(i=s.sibling,i!==null){i.return=s.return,s=i;break}s=s.return}i=s}}function Qi(e,t,n,r){e=null;for(var i=t,o=!1;i!==null;){if(!o){if(i.flags&524288)o=!0;else if(i.flags&262144)break}if(i.tag===10){var s=i.alternate;if(s===null)throw Error(a(387));if(s=s.memoizedProps,s!==null){var c=i.type;Cr(i.pendingProps.value,s.value)||(e===null?e=[c]:e.push(c))}}else if(i===fe.current){if(s=i.alternate,s===null)throw Error(a(387));s.memoizedState.memoizedState!==i.memoizedState.memoizedState&&(e===null?e=[ep]:e.push(ep))}i=i.return}e!==null&&Zi(t,e,n,r),t.flags|=262144}function $i(e){for(e=e.firstContext;e!==null;){if(!Cr(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function ea(e){Ki=e,qi=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function ta(e){return ra(Ki,e)}function na(e,t){return Ki===null&&ea(e),ra(e,t)}function ra(e,t){var n=t._currentValue;if(t={context:t,memoizedValue:n,next:null},qi===null){if(e===null)throw Error(a(308));qi=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else qi=qi.next=t;return n}var B=typeof AbortController<`u`?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(t,n){e.push(n)}};this.abort=function(){t.aborted=!0,e.forEach(function(e){return e()})}},V=n.unstable_scheduleCallback,ia=n.unstable_NormalPriority,aa={$$typeof:x,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function oa(){return{controller:new B,data:new Map,refCount:0}}function H(e){e.refCount--,e.refCount===0&&V(ia,function(){e.controller.abort()})}var sa=null,ca=0,la=0,ua=null;function da(e,t){if(sa===null){var n=sa=[];ca=0,la=md(),ua={status:`pending`,value:void 0,then:function(e){n.push(e)}}}return ca++,t.then(fa,fa),t}function fa(){if(--ca===0&&sa!==null){ua!==null&&(ua.status=`fulfilled`);var e=sa;sa=null,la=0,ua=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function pa(e,t){var n=[],r={status:`pending`,value:null,reason:null,then:function(e){n.push(e)}};return e.then(function(){r.status=`fulfilled`,r.value=t;for(var e=0;e<n.length;e++)(0,n[e])(t)},function(e){for(r.status=`rejected`,r.reason=e,e=0;e<n.length;e++)(0,n[e])(void 0)}),r}var ma=k.S;k.S=function(e,t){nu=ke(),typeof t==`object`&&t&&typeof t.then==`function`&&da(e,t),ma!==null&&ma(e,t)};var ha=M(null);function ga(){var e=ha.current;return e===null?K.pooledCache:e}function _a(e,t){t===null?N(ha,ha.current):N(ha,t.pool)}function va(){var e=ga();return e===null?null:{parent:aa._currentValue,pool:e}}var ya=Error(a(460)),ba=Error(a(474)),xa=Error(a(542)),Sa={then:function(){}};function Ca(e){return e=e.status,e===`fulfilled`||e===`rejected`}function wa(e,t,n){switch(n=e[n],n===void 0?e.push(t):n!==t&&(t.then(tn,tn),t=n),t.status){case`fulfilled`:return t.value;case`rejected`:throw e=t.reason,Oa(e),e;default:if(typeof t.status==`string`)t.then(tn,tn);else{if(e=K,e!==null&&100<e.shellSuspendCounter)throw Error(a(482));e=t,e.status=`pending`,e.then(function(e){if(t.status===`pending`){var n=t;n.status=`fulfilled`,n.value=e}},function(e){if(t.status===`pending`){var n=t;n.status=`rejected`,n.reason=e}})}switch(t.status){case`fulfilled`:return t.value;case`rejected`:throw e=t.reason,Oa(e),e}throw Ea=t,ya}}function Ta(e){try{var t=e._init;return t(e._payload)}catch(e){throw typeof e==`object`&&e&&typeof e.then==`function`?(Ea=e,ya):e}}var Ea=null;function Da(){if(Ea===null)throw Error(a(459));var e=Ea;return Ea=null,e}function Oa(e){if(e===ya||e===xa)throw Error(a(483))}var ka=null,Aa=0;function ja(e){var t=Aa;return Aa+=1,ka===null&&(ka=[]),wa(ka,e,t)}function Ma(e,t){t=t.props.ref,e.ref=t===void 0?null:t}function Na(e,t){throw t.$$typeof===m?Error(a(525)):(e=Object.prototype.toString.call(t),Error(a(31,e===`[object Object]`?`object with keys {`+Object.keys(t).join(`, `)+`}`:e)))}function Pa(e){function t(t,n){if(e){var r=t.deletions;r===null?(t.deletions=[n],t.flags|=16):r.push(n)}}function n(n,r){if(!e)return null;for(;r!==null;)t(n,r),r=r.sibling;return null}function r(e){for(var t=new Map;e!==null;)e.key===null?t.set(e.index,e):t.set(e.key,e),e=e.sibling;return t}function i(e,t){return e=ui(e,t),e.index=0,e.sibling=null,e}function o(t,n,r){return t.index=r,e?(r=t.alternate,r===null?(t.flags|=67108866,n):(r=r.index,r<n?(t.flags|=67108866,n):r)):(t.flags|=1048576,n)}function s(t){return e&&t.alternate===null&&(t.flags|=67108866),t}function c(e,t,n,r){return t===null||t.tag!==6?(t=mi(n,e.mode,r),t.return=e,t):(t=i(t,n),t.return=e,t)}function l(e,t,n,r){var a=n.type;return a===_?d(e,t,n.props.children,r,n.key):t!==null&&(t.elementType===a||typeof a==`object`&&a&&a.$$typeof===te&&Ta(a)===t.type)?(t=i(t,n.props),Ma(t,n),t.return=e,t):(t=fi(n.type,n.key,n.props,null,e.mode,r),Ma(t,n),t.return=e,t)}function u(e,t,n,r){return t===null||t.tag!==4||t.stateNode.containerInfo!==n.containerInfo||t.stateNode.implementation!==n.implementation?(t=gi(n,e.mode,r),t.return=e,t):(t=i(t,n.children||[]),t.return=e,t)}function d(e,t,n,r,a){return t===null||t.tag!==7?(t=pi(n,e.mode,r,a),t.return=e,t):(t=i(t,n),t.return=e,t)}function f(e,t,n){if(typeof t==`string`&&t!==``||typeof t==`number`||typeof t==`bigint`)return t=mi(``+t,e.mode,n),t.return=e,t;if(typeof t==`object`&&t){switch(t.$$typeof){case h:return n=fi(t.type,t.key,t.props,null,e.mode,n),Ma(n,t),n.return=e,n;case g:return t=gi(t,e.mode,n),t.return=e,t;case te:return t=Ta(t),f(e,t,n)}if(ae(t)||ne(t))return t=pi(t,e.mode,n,null),t.return=e,t;if(typeof t.then==`function`)return f(e,ja(t),n);if(t.$$typeof===x)return f(e,na(e,t),n);Na(e,t)}return null}function p(e,t,n,r){var i=t===null?null:t.key;if(typeof n==`string`&&n!==``||typeof n==`number`||typeof n==`bigint`)return i===null?c(e,t,``+n,r):null;if(typeof n==`object`&&n){switch(n.$$typeof){case h:return n.key===i?l(e,t,n,r):null;case g:return n.key===i?u(e,t,n,r):null;case te:return n=Ta(n),p(e,t,n,r)}if(ae(n)||ne(n))return i===null?d(e,t,n,r,null):null;if(typeof n.then==`function`)return p(e,t,ja(n),r);if(n.$$typeof===x)return p(e,t,na(e,n),r);Na(e,n)}return null}function m(e,t,n,r,i){if(typeof r==`string`&&r!==``||typeof r==`number`||typeof r==`bigint`)return e=e.get(n)||null,c(t,e,``+r,i);if(typeof r==`object`&&r){switch(r.$$typeof){case h:return e=e.get(r.key===null?n:r.key)||null,l(t,e,r,i);case g:return e=e.get(r.key===null?n:r.key)||null,u(t,e,r,i);case te:return r=Ta(r),m(e,t,n,r,i)}if(ae(r)||ne(r))return e=e.get(n)||null,d(t,e,r,i,null);if(typeof r.then==`function`)return m(e,t,n,ja(r),i);if(r.$$typeof===x)return m(e,t,n,na(t,r),i);Na(t,r)}return null}function v(i,a,s,c){for(var l=null,u=null,d=a,h=a=0,g=null;d!==null&&h<s.length;h++){d.index>h?(g=d,d=null):g=d.sibling;var _=p(i,d,s[h],c);if(_===null){d===null&&(d=g);break}e&&d&&_.alternate===null&&t(i,d),a=o(_,a,h),u===null?l=_:u.sibling=_,u=_,d=g}if(h===s.length)return n(i,d),z&&Oi(i,h),l;if(d===null){for(;h<s.length;h++)d=f(i,s[h],c),d!==null&&(a=o(d,a,h),u===null?l=d:u.sibling=d,u=d);return z&&Oi(i,h),l}for(d=r(d);h<s.length;h++)g=m(d,i,h,s[h],c),g!==null&&(e&&g.alternate!==null&&d.delete(g.key===null?h:g.key),a=o(g,a,h),u===null?l=g:u.sibling=g,u=g);return e&&d.forEach(function(e){return t(i,e)}),z&&Oi(i,h),l}function y(i,s,c,l){if(c==null)throw Error(a(151));for(var u=null,d=null,h=s,g=s=0,_=null,v=c.next();h!==null&&!v.done;g++,v=c.next()){h.index>g?(_=h,h=null):_=h.sibling;var y=p(i,h,v.value,l);if(y===null){h===null&&(h=_);break}e&&h&&y.alternate===null&&t(i,h),s=o(y,s,g),d===null?u=y:d.sibling=y,d=y,h=_}if(v.done)return n(i,h),z&&Oi(i,g),u;if(h===null){for(;!v.done;g++,v=c.next())v=f(i,v.value,l),v!==null&&(s=o(v,s,g),d===null?u=v:d.sibling=v,d=v);return z&&Oi(i,g),u}for(h=r(h);!v.done;g++,v=c.next())v=m(h,i,g,v.value,l),v!==null&&(e&&v.alternate!==null&&h.delete(v.key===null?g:v.key),s=o(v,s,g),d===null?u=v:d.sibling=v,d=v);return e&&h.forEach(function(e){return t(i,e)}),z&&Oi(i,g),u}function b(e,r,o,c){if(typeof o==`object`&&o&&o.type===_&&o.key===null&&(o=o.props.children),typeof o==`object`&&o){switch(o.$$typeof){case h:a:{for(var l=o.key;r!==null;){if(r.key===l){if(l=o.type,l===_){if(r.tag===7){n(e,r.sibling),c=i(r,o.props.children),c.return=e,e=c;break a}}else if(r.elementType===l||typeof l==`object`&&l&&l.$$typeof===te&&Ta(l)===r.type){n(e,r.sibling),c=i(r,o.props),Ma(c,o),c.return=e,e=c;break a}n(e,r);break}else t(e,r);r=r.sibling}o.type===_?(c=pi(o.props.children,e.mode,c,o.key),c.return=e,e=c):(c=fi(o.type,o.key,o.props,null,e.mode,c),Ma(c,o),c.return=e,e=c)}return s(e);case g:a:{for(l=o.key;r!==null;){if(r.key===l)if(r.tag===4&&r.stateNode.containerInfo===o.containerInfo&&r.stateNode.implementation===o.implementation){n(e,r.sibling),c=i(r,o.children||[]),c.return=e,e=c;break a}else{n(e,r);break}else t(e,r);r=r.sibling}c=gi(o,e.mode,c),c.return=e,e=c}return s(e);case te:return o=Ta(o),b(e,r,o,c)}if(ae(o))return v(e,r,o,c);if(ne(o)){if(l=ne(o),typeof l!=`function`)throw Error(a(150));return o=l.call(o),y(e,r,o,c)}if(typeof o.then==`function`)return b(e,r,ja(o),c);if(o.$$typeof===x)return b(e,r,na(e,o),c);Na(e,o)}return typeof o==`string`&&o!==``||typeof o==`number`||typeof o==`bigint`?(o=``+o,r!==null&&r.tag===6?(n(e,r.sibling),c=i(r,o),c.return=e,e=c):(n(e,r),c=mi(o,e.mode,c),c.return=e,e=c),s(e)):n(e,r)}return function(e,t,n,r){try{Aa=0;var i=b(e,t,n,r);return ka=null,i}catch(t){if(t===ya||t===xa)throw t;var a=ci(29,t,null,e.mode);return a.lanes=r,a.return=e,a}}}var Fa=Pa(!0),Ia=Pa(!1),La=!1;function Ra(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function za(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function Ba(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function Va(e,t,n){var r=e.updateQueue;if(r===null)return null;if(r=r.shared,G&2){var i=r.pending;return i===null?t.next=t:(t.next=i.next,i.next=t),r.pending=t,t=ai(e),ii(e,null,n),t}return ti(e,r,t,n),ai(e)}function Ha(e,t,n){if(t=t.updateQueue,t!==null&&(t=t.shared,n&4194048)){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,nt(e,n)}}function Ua(e,t){var n=e.updateQueue,r=e.alternate;if(r!==null&&(r=r.updateQueue,n===r)){var i=null,a=null;if(n=n.firstBaseUpdate,n!==null){do{var o={lane:n.lane,tag:n.tag,payload:n.payload,callback:null,next:null};a===null?i=a=o:a=a.next=o,n=n.next}while(n!==null);a===null?i=a=t:a=a.next=t}else i=a=t;n={baseState:r.baseState,firstBaseUpdate:i,lastBaseUpdate:a,shared:r.shared,callbacks:r.callbacks},e.updateQueue=n;return}e=n.lastBaseUpdate,e===null?n.firstBaseUpdate=t:e.next=t,n.lastBaseUpdate=t}var Wa=!1;function Ga(){if(Wa){var e=ua;if(e!==null)throw e}}function Ka(e,t,n,r){Wa=!1;var i=e.updateQueue;La=!1;var a=i.firstBaseUpdate,o=i.lastBaseUpdate,s=i.shared.pending;if(s!==null){i.shared.pending=null;var c=s,l=c.next;c.next=null,o===null?a=l:o.next=l,o=c;var u=e.alternate;u!==null&&(u=u.updateQueue,s=u.lastBaseUpdate,s!==o&&(s===null?u.firstBaseUpdate=l:s.next=l,u.lastBaseUpdate=c))}if(a!==null){var d=i.baseState;o=0,u=l=c=null,s=a;do{var f=s.lane&-536870913,m=f!==s.lane;if(m?(J&f)===f:(r&f)===f){f!==0&&f===la&&(Wa=!0),u!==null&&(u=u.next={lane:0,tag:s.tag,payload:s.payload,callback:null,next:null});a:{var h=e,g=s;f=t;var _=n;switch(g.tag){case 1:if(h=g.payload,typeof h==`function`){d=h.call(_,d,f);break a}d=h;break a;case 3:h.flags=h.flags&-65537|128;case 0:if(h=g.payload,f=typeof h==`function`?h.call(_,d,f):h,f==null)break a;d=p({},d,f);break a;case 2:La=!0}}f=s.callback,f!==null&&(e.flags|=64,m&&(e.flags|=8192),m=i.callbacks,m===null?i.callbacks=[f]:m.push(f))}else m={lane:f,tag:s.tag,payload:s.payload,callback:s.callback,next:null},u===null?(l=u=m,c=d):u=u.next=m,o|=f;if(s=s.next,s===null){if(s=i.shared.pending,s===null)break;m=s,s=m.next,m.next=null,i.lastBaseUpdate=m,i.shared.pending=null}}while(1);u===null&&(c=d),i.baseState=c,i.firstBaseUpdate=l,i.lastBaseUpdate=u,a===null&&(i.shared.lanes=0),ql|=o,e.lanes=o,e.memoizedState=d}}function qa(e,t){if(typeof e!=`function`)throw Error(a(191,e));e.call(t)}function Ja(e,t){var n=e.callbacks;if(n!==null)for(e.callbacks=null,e=0;e<n.length;e++)qa(n[e],t)}var Ya=M(null),Xa=M(0);function Za(e,t){e=Gl,N(Xa,e),N(Ya,t),Gl=e|t.baseLanes}function Qa(){N(Xa,Gl),N(Ya,Ya.current)}function $a(){Gl=Xa.current,ce(Ya),ce(Xa)}var eo=M(null),to=null;function no(e){var t=e.alternate;N(so,so.current&1),N(eo,e),to===null&&(t===null||Ya.current!==null||t.memoizedState!==null)&&(to=e)}function ro(e){N(so,so.current),N(eo,e),to===null&&(to=e)}function io(e){e.tag===22?(N(so,so.current),N(eo,e),to===null&&(to=e)):ao(e)}function ao(){N(so,so.current),N(eo,eo.current)}function oo(e){ce(eo),to===e&&(to=null),ce(so)}var so=M(0);function co(e){for(var t=e;t!==null;){if(t.tag===13){var n=t.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||cf(n)||lf(n)))return t}else if(t.tag===19&&(t.memoizedProps.revealOrder===`forwards`||t.memoizedProps.revealOrder===`backwards`||t.memoizedProps.revealOrder===`unstable_legacy-backwards`||t.memoizedProps.revealOrder===`together`)){if(t.flags&128)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var lo=0,U=null,uo=null,fo=null,po=!1,mo=!1,ho=!1,go=0,_o=0,vo=null,yo=0;function bo(){throw Error(a(321))}function xo(e,t){if(t===null)return!1;for(var n=0;n<t.length&&n<e.length;n++)if(!Cr(e[n],t[n]))return!1;return!0}function So(e,t,n,r,i,a){return lo=a,U=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,k.H=e===null||e.memoizedState===null?Rs:zs,ho=!1,a=n(r,i),ho=!1,mo&&(a=wo(t,n,r,i)),Co(e),a}function Co(e){k.H=Ls;var t=uo!==null&&uo.next!==null;if(lo=0,fo=uo=U=null,po=!1,_o=0,vo=null,t)throw Error(a(300));e===null||nc||(e=e.dependencies,e!==null&&$i(e)&&(nc=!0))}function wo(e,t,n,r){U=e;var i=0;do{if(mo&&(vo=null),_o=0,mo=!1,25<=i)throw Error(a(301));if(i+=1,fo=uo=null,e.updateQueue!=null){var o=e.updateQueue;o.lastEffect=null,o.events=null,o.stores=null,o.memoCache!=null&&(o.memoCache.index=0)}k.H=Bs,o=t(n,r)}while(mo);return o}function To(){var e=k.H,t=e.useState()[0];return t=typeof t.then==`function`?Mo(t):t,e=e.useState()[0],(uo===null?null:uo.memoizedState)!==e&&(U.flags|=1024),t}function Eo(){var e=go!==0;return go=0,e}function Do(e,t,n){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~n}function Oo(e){if(po){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}po=!1}lo=0,fo=uo=U=null,mo=!1,_o=go=0,vo=null}function ko(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return fo===null?U.memoizedState=fo=e:fo=fo.next=e,fo}function Ao(){if(uo===null){var e=U.alternate;e=e===null?null:e.memoizedState}else e=uo.next;var t=fo===null?U.memoizedState:fo.next;if(t!==null)fo=t,uo=e;else{if(e===null)throw U.alternate===null?Error(a(467)):Error(a(310));uo=e,e={memoizedState:uo.memoizedState,baseState:uo.baseState,baseQueue:uo.baseQueue,queue:uo.queue,next:null},fo===null?U.memoizedState=fo=e:fo=fo.next=e}return fo}function jo(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function Mo(e){var t=_o;return _o+=1,vo===null&&(vo=[]),e=wa(vo,e,t),t=U,(fo===null?t.memoizedState:fo.next)===null&&(t=t.alternate,k.H=t===null||t.memoizedState===null?Rs:zs),e}function No(e){if(typeof e==`object`&&e){if(typeof e.then==`function`)return Mo(e);if(e.$$typeof===x)return ta(e)}throw Error(a(438,String(e)))}function Po(e){var t=null,n=U.updateQueue;if(n!==null&&(t=n.memoCache),t==null){var r=U.alternate;r!==null&&(r=r.updateQueue,r!==null&&(r=r.memoCache,r!=null&&(t={data:r.data.map(function(e){return e.slice()}),index:0})))}if(t??={data:[],index:0},n===null&&(n=jo(),U.updateQueue=n),n.memoCache=t,n=t.data[t.index],n===void 0)for(n=t.data[t.index]=Array(e),r=0;r<e;r++)n[r]=E;return t.index++,n}function Fo(e,t){return typeof t==`function`?t(e):t}function Io(e){return Lo(Ao(),uo,e)}function Lo(e,t,n){var r=e.queue;if(r===null)throw Error(a(311));r.lastRenderedReducer=n;var i=e.baseQueue,o=r.pending;if(o!==null){if(i!==null){var s=i.next;i.next=o.next,o.next=s}t.baseQueue=i=o,r.pending=null}if(o=e.baseState,i===null)e.memoizedState=o;else{t=i.next;var c=s=null,l=null,u=t,d=!1;do{var f=u.lane&-536870913;if(f===u.lane?(lo&f)===f:(J&f)===f){var p=u.revertLane;if(p===0)l!==null&&(l=l.next={lane:0,revertLane:0,gesture:null,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null}),f===la&&(d=!0);else if((lo&p)===p){u=u.next,p===la&&(d=!0);continue}else f={lane:0,revertLane:u.revertLane,gesture:null,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null},l===null?(c=l=f,s=o):l=l.next=f,U.lanes|=p,ql|=p;f=u.action,ho&&n(o,f),o=u.hasEagerState?u.eagerState:n(o,f)}else p={lane:f,revertLane:u.revertLane,gesture:u.gesture,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null},l===null?(c=l=p,s=o):l=l.next=p,U.lanes|=f,ql|=f;u=u.next}while(u!==null&&u!==t);if(l===null?s=o:l.next=c,!Cr(o,e.memoizedState)&&(nc=!0,d&&(n=ua,n!==null)))throw n;e.memoizedState=o,e.baseState=s,e.baseQueue=l,r.lastRenderedState=o}return i===null&&(r.lanes=0),[e.memoizedState,r.dispatch]}function Ro(e){var t=Ao(),n=t.queue;if(n===null)throw Error(a(311));n.lastRenderedReducer=e;var r=n.dispatch,i=n.pending,o=t.memoizedState;if(i!==null){n.pending=null;var s=i=i.next;do o=e(o,s.action),s=s.next;while(s!==i);Cr(o,t.memoizedState)||(nc=!0),t.memoizedState=o,t.baseQueue===null&&(t.baseState=o),n.lastRenderedState=o}return[o,r]}function zo(e,t,n){var r=U,i=Ao(),o=z;if(o){if(n===void 0)throw Error(a(407));n=n()}else n=t();var s=!Cr((uo||i).memoizedState,n);if(s&&(i.memoizedState=n,nc=!0),i=i.queue,ls(Ho.bind(null,r,i,e),[e]),i.getSnapshot!==t||s||fo!==null&&fo.memoizedState.tag&1){if(r.flags|=2048,is(9,{destroy:void 0},Vo.bind(null,r,i,n,t),null),K===null)throw Error(a(349));o||lo&127||Bo(r,t,n)}return n}function Bo(e,t,n){e.flags|=16384,e={getSnapshot:t,value:n},t=U.updateQueue,t===null?(t=jo(),U.updateQueue=t,t.stores=[e]):(n=t.stores,n===null?t.stores=[e]:n.push(e))}function Vo(e,t,n,r){t.value=n,t.getSnapshot=r,Uo(t)&&Wo(e)}function Ho(e,t,n){return n(function(){Uo(t)&&Wo(e)})}function Uo(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!Cr(e,n)}catch{return!0}}function Wo(e){var t=ri(e,2);t!==null&&_u(t,e,2)}function Go(e){var t=ko();if(typeof e==`function`){var n=e;if(e=n(),ho){ze(!0);try{n()}finally{ze(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Fo,lastRenderedState:e},t}function Ko(e,t,n,r){return e.baseState=n,Lo(e,uo,typeof r==`function`?r:Fo)}function qo(e,t,n,r,i){if(Ps(e))throw Error(a(485));if(e=t.action,e!==null){var o={payload:i,action:e,next:null,isTransition:!0,status:`pending`,value:null,reason:null,listeners:[],then:function(e){o.listeners.push(e)}};k.T===null?o.isTransition=!1:n(!0),r(o),n=t.pending,n===null?(o.next=t.pending=o,Jo(t,o)):(o.next=n.next,t.pending=n.next=o)}}function Jo(e,t){var n=t.action,r=t.payload,i=e.state;if(t.isTransition){var a=k.T,o={};k.T=o;try{var s=n(i,r),c=k.S;c!==null&&c(o,s),Yo(e,t,s)}catch(n){Zo(e,t,n)}finally{a!==null&&o.types!==null&&(a.types=o.types),k.T=a}}else try{a=n(i,r),Yo(e,t,a)}catch(n){Zo(e,t,n)}}function Yo(e,t,n){typeof n==`object`&&n&&typeof n.then==`function`?n.then(function(n){Xo(e,t,n)},function(n){return Zo(e,t,n)}):Xo(e,t,n)}function Xo(e,t,n){t.status=`fulfilled`,t.value=n,Qo(t),e.state=n,t=e.pending,t!==null&&(n=t.next,n===t?e.pending=null:(n=n.next,t.next=n,Jo(e,n)))}function Zo(e,t,n){var r=e.pending;if(e.pending=null,r!==null){r=r.next;do t.status=`rejected`,t.reason=n,Qo(t),t=t.next;while(t!==r)}e.action=null}function Qo(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function $o(e,t){return t}function es(e,t){if(z){var n=K.formState;if(n!==null){a:{var r=U;if(z){if(Pi){b:{for(var i=Pi,a=Ii;i.nodeType!==8;){if(!a){i=null;break b}if(i=df(i.nextSibling),i===null){i=null;break b}}a=i.data,i=a===`F!`||a===`F`?i:null}if(i){Pi=df(i.nextSibling),r=i.data===`F!`;break a}}Ri(r)}r=!1}r&&(t=n[0])}}return n=ko(),n.memoizedState=n.baseState=t,r={pending:null,lanes:0,dispatch:null,lastRenderedReducer:$o,lastRenderedState:t},n.queue=r,n=js.bind(null,U,r),r.dispatch=n,r=Go(!1),a=Ns.bind(null,U,!1,r.queue),r=ko(),i={state:t,dispatch:null,action:e,pending:null},r.queue=i,n=qo.bind(null,U,i,a,n),i.dispatch=n,r.memoizedState=e,[t,n,!1]}function ts(e){return ns(Ao(),uo,e)}function ns(e,t,n){if(t=Lo(e,t,$o)[0],e=Io(Fo)[0],typeof t==`object`&&t&&typeof t.then==`function`)try{var r=Mo(t)}catch(e){throw e===ya?xa:e}else r=t;t=Ao();var i=t.queue,a=i.dispatch;return n!==t.memoizedState&&(U.flags|=2048,is(9,{destroy:void 0},rs.bind(null,i,n),null)),[r,a,e]}function rs(e,t){e.action=t}function W(e){var t=Ao(),n=uo;if(n!==null)return ns(t,n,e);Ao(),t=t.memoizedState,n=Ao();var r=n.queue.dispatch;return n.memoizedState=e,[t,r,!1]}function is(e,t,n,r){return e={tag:e,create:n,deps:r,inst:t,next:null},t=U.updateQueue,t===null&&(t=jo(),U.updateQueue=t),n=t.lastEffect,n===null?t.lastEffect=e.next=e:(r=n.next,n.next=e,e.next=r,t.lastEffect=e),e}function as(){return Ao().memoizedState}function os(e,t,n,r){var i=ko();U.flags|=e,i.memoizedState=is(1|t,{destroy:void 0},n,r===void 0?null:r)}function ss(e,t,n,r){var i=Ao();r=r===void 0?null:r;var a=i.memoizedState.inst;uo!==null&&r!==null&&xo(r,uo.memoizedState.deps)?i.memoizedState=is(t,a,n,r):(U.flags|=e,i.memoizedState=is(1|t,a,n,r))}function cs(e,t){os(8390656,8,e,t)}function ls(e,t){ss(2048,8,e,t)}function us(e){U.flags|=4;var t=U.updateQueue;if(t===null)t=jo(),U.updateQueue=t,t.events=[e];else{var n=t.events;n===null?t.events=[e]:n.push(e)}}function ds(e){var t=Ao().memoizedState;return us({ref:t,nextImpl:e}),function(){if(G&2)throw Error(a(440));return t.impl.apply(void 0,arguments)}}function fs(e,t){return ss(4,2,e,t)}function ps(e,t){return ss(4,4,e,t)}function ms(e,t){if(typeof t==`function`){e=e();var n=t(e);return function(){typeof n==`function`?n():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function hs(e,t,n){n=n==null?null:n.concat([e]),ss(4,4,ms.bind(null,t,e),n)}function gs(){}function _s(e,t){var n=Ao();t=t===void 0?null:t;var r=n.memoizedState;return t!==null&&xo(t,r[1])?r[0]:(n.memoizedState=[e,t],e)}function vs(e,t){var n=Ao();t=t===void 0?null:t;var r=n.memoizedState;if(t!==null&&xo(t,r[1]))return r[0];if(r=e(),ho){ze(!0);try{e()}finally{ze(!1)}}return n.memoizedState=[r,t],r}function ys(e,t,n){return n===void 0||lo&1073741824&&!(J&261930)?e.memoizedState=t:(e.memoizedState=n,e=gu(),U.lanes|=e,ql|=e,n)}function bs(e,t,n,r){return Cr(n,t)?n:Ya.current===null?!(lo&42)||lo&1073741824&&!(J&261930)?(nc=!0,e.memoizedState=n):(e=gu(),U.lanes|=e,ql|=e,t):(e=ys(e,n,r),Cr(e,t)||(nc=!0),e)}function xs(e,t,n,r,i){var a=A.p;A.p=a!==0&&8>a?a:8;var o=k.T,s={};k.T=s,Ns(e,!1,t,n);try{var c=i(),l=k.S;l!==null&&l(s,c),typeof c==`object`&&c&&typeof c.then==`function`?Ms(e,t,pa(c,r),hu(e)):Ms(e,t,r,hu(e))}catch(n){Ms(e,t,{then:function(){},status:`rejected`,reason:n},hu())}finally{A.p=a,o!==null&&s.types!==null&&(o.types=s.types),k.T=o}}function Ss(){}function Cs(e,t,n,r){if(e.tag!==5)throw Error(a(476));var i=ws(e).queue;xs(e,i,t,oe,n===null?Ss:function(){return Ts(e),n(r)})}function ws(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:oe,baseState:oe,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Fo,lastRenderedState:oe},next:null};var n={};return t.next={memoizedState:n,baseState:n,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Fo,lastRenderedState:n},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function Ts(e){var t=ws(e);t.next===null&&(t=e.alternate.memoizedState),Ms(e,t.next.queue,{},hu())}function Es(){return ta(ep)}function Ds(){return Ao().memoizedState}function Os(){return Ao().memoizedState}function ks(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var n=hu();e=Ba(n);var r=Va(t,e,n);r!==null&&(_u(r,t,n),Ha(r,t,n)),t={cache:oa()},e.payload=t;return}t=t.return}}function As(e,t,n){var r=hu();n={lane:r,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},Ps(e)?Fs(t,n):(n=ni(e,t,n,r),n!==null&&(_u(n,e,r),Is(n,t,r)))}function js(e,t,n){Ms(e,t,n,hu())}function Ms(e,t,n,r){var i={lane:r,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null};if(Ps(e))Fs(t,i);else{var a=e.alternate;if(e.lanes===0&&(a===null||a.lanes===0)&&(a=t.lastRenderedReducer,a!==null))try{var o=t.lastRenderedState,s=a(o,n);if(i.hasEagerState=!0,i.eagerState=s,Cr(s,o))return ti(e,t,i,0),K===null&&ei(),!1}catch{}if(n=ni(e,t,i,r),n!==null)return _u(n,e,r),Is(n,t,r),!0}return!1}function Ns(e,t,n,r){if(r={lane:2,revertLane:md(),gesture:null,action:r,hasEagerState:!1,eagerState:null,next:null},Ps(e)){if(t)throw Error(a(479))}else t=ni(e,n,r,2),t!==null&&_u(t,e,2)}function Ps(e){var t=e.alternate;return e===U||t!==null&&t===U}function Fs(e,t){mo=po=!0;var n=e.pending;n===null?t.next=t:(t.next=n.next,n.next=t),e.pending=t}function Is(e,t,n){if(n&4194048){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,nt(e,n)}}var Ls={readContext:ta,use:No,useCallback:bo,useContext:bo,useEffect:bo,useImperativeHandle:bo,useLayoutEffect:bo,useInsertionEffect:bo,useMemo:bo,useReducer:bo,useRef:bo,useState:bo,useDebugValue:bo,useDeferredValue:bo,useTransition:bo,useSyncExternalStore:bo,useId:bo,useHostTransitionStatus:bo,useFormState:bo,useActionState:bo,useOptimistic:bo,useMemoCache:bo,useCacheRefresh:bo};Ls.useEffectEvent=bo;var Rs={readContext:ta,use:No,useCallback:function(e,t){return ko().memoizedState=[e,t===void 0?null:t],e},useContext:ta,useEffect:cs,useImperativeHandle:function(e,t,n){n=n==null?null:n.concat([e]),os(4194308,4,ms.bind(null,t,e),n)},useLayoutEffect:function(e,t){return os(4194308,4,e,t)},useInsertionEffect:function(e,t){os(4,2,e,t)},useMemo:function(e,t){var n=ko();t=t===void 0?null:t;var r=e();if(ho){ze(!0);try{e()}finally{ze(!1)}}return n.memoizedState=[r,t],r},useReducer:function(e,t,n){var r=ko();if(n!==void 0){var i=n(t);if(ho){ze(!0);try{n(t)}finally{ze(!1)}}}else i=t;return r.memoizedState=r.baseState=i,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:i},r.queue=e,e=e.dispatch=As.bind(null,U,e),[r.memoizedState,e]},useRef:function(e){var t=ko();return e={current:e},t.memoizedState=e},useState:function(e){e=Go(e);var t=e.queue,n=js.bind(null,U,t);return t.dispatch=n,[e.memoizedState,n]},useDebugValue:gs,useDeferredValue:function(e,t){return ys(ko(),e,t)},useTransition:function(){var e=Go(!1);return e=xs.bind(null,U,e.queue,!0,!1),ko().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,n){var r=U,i=ko();if(z){if(n===void 0)throw Error(a(407));n=n()}else{if(n=t(),K===null)throw Error(a(349));J&127||Bo(r,t,n)}i.memoizedState=n;var o={value:n,getSnapshot:t};return i.queue=o,cs(Ho.bind(null,r,o,e),[e]),r.flags|=2048,is(9,{destroy:void 0},Vo.bind(null,r,o,n,t),null),n},useId:function(){var e=ko(),t=K.identifierPrefix;if(z){var n=Di,r=Ei;n=(r&~(1<<32-Be(r)-1)).toString(32)+n,t=`_`+t+`R_`+n,n=go++,0<n&&(t+=`H`+n.toString(32)),t+=`_`}else n=yo++,t=`_`+t+`r_`+n.toString(32)+`_`;return e.memoizedState=t},useHostTransitionStatus:Es,useFormState:es,useActionState:es,useOptimistic:function(e){var t=ko();t.memoizedState=t.baseState=e;var n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=n,t=Ns.bind(null,U,!0,n),n.dispatch=t,[e,t]},useMemoCache:Po,useCacheRefresh:function(){return ko().memoizedState=ks.bind(null,U)},useEffectEvent:function(e){var t=ko(),n={impl:e};return t.memoizedState=n,function(){if(G&2)throw Error(a(440));return n.impl.apply(void 0,arguments)}}},zs={readContext:ta,use:No,useCallback:_s,useContext:ta,useEffect:ls,useImperativeHandle:hs,useInsertionEffect:fs,useLayoutEffect:ps,useMemo:vs,useReducer:Io,useRef:as,useState:function(){return Io(Fo)},useDebugValue:gs,useDeferredValue:function(e,t){return bs(Ao(),uo.memoizedState,e,t)},useTransition:function(){var e=Io(Fo)[0],t=Ao().memoizedState;return[typeof e==`boolean`?e:Mo(e),t]},useSyncExternalStore:zo,useId:Ds,useHostTransitionStatus:Es,useFormState:ts,useActionState:ts,useOptimistic:function(e,t){return Ko(Ao(),uo,e,t)},useMemoCache:Po,useCacheRefresh:Os};zs.useEffectEvent=ds;var Bs={readContext:ta,use:No,useCallback:_s,useContext:ta,useEffect:ls,useImperativeHandle:hs,useInsertionEffect:fs,useLayoutEffect:ps,useMemo:vs,useReducer:Ro,useRef:as,useState:function(){return Ro(Fo)},useDebugValue:gs,useDeferredValue:function(e,t){var n=Ao();return uo===null?ys(n,e,t):bs(n,uo.memoizedState,e,t)},useTransition:function(){var e=Ro(Fo)[0],t=Ao().memoizedState;return[typeof e==`boolean`?e:Mo(e),t]},useSyncExternalStore:zo,useId:Ds,useHostTransitionStatus:Es,useFormState:W,useActionState:W,useOptimistic:function(e,t){var n=Ao();return uo===null?(n.baseState=e,[e,n.queue.dispatch]):Ko(n,uo,e,t)},useMemoCache:Po,useCacheRefresh:Os};Bs.useEffectEvent=ds;function Vs(e,t,n,r){t=e.memoizedState,n=n(r,t),n=n==null?t:p({},t,n),e.memoizedState=n,e.lanes===0&&(e.updateQueue.baseState=n)}var Hs={enqueueSetState:function(e,t,n){e=e._reactInternals;var r=hu(),i=Ba(r);i.payload=t,n!=null&&(i.callback=n),t=Va(e,i,r),t!==null&&(_u(t,e,r),Ha(t,e,r))},enqueueReplaceState:function(e,t,n){e=e._reactInternals;var r=hu(),i=Ba(r);i.tag=1,i.payload=t,n!=null&&(i.callback=n),t=Va(e,i,r),t!==null&&(_u(t,e,r),Ha(t,e,r))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var n=hu(),r=Ba(n);r.tag=2,t!=null&&(r.callback=t),t=Va(e,r,n),t!==null&&(_u(t,e,n),Ha(t,e,n))}};function Us(e,t,n,r,i,a,o){return e=e.stateNode,typeof e.shouldComponentUpdate==`function`?e.shouldComponentUpdate(r,a,o):t.prototype&&t.prototype.isPureReactComponent?!wr(n,r)||!wr(i,a):!0}function Ws(e,t,n,r){e=t.state,typeof t.componentWillReceiveProps==`function`&&t.componentWillReceiveProps(n,r),typeof t.UNSAFE_componentWillReceiveProps==`function`&&t.UNSAFE_componentWillReceiveProps(n,r),t.state!==e&&Hs.enqueueReplaceState(t,t.state,null)}function Gs(e,t){var n=t;if(`ref`in t)for(var r in n={},t)r!==`ref`&&(n[r]=t[r]);if(e=e.defaultProps)for(var i in n===t&&(n=p({},n)),e)n[i]===void 0&&(n[i]=e[i]);return n}function Ks(e){Xr(e)}function qs(e){console.error(e)}function Js(e){Xr(e)}function Ys(e,t){try{var n=e.onUncaughtError;n(t.value,{componentStack:t.stack})}catch(e){setTimeout(function(){throw e})}}function Xs(e,t,n){try{var r=e.onCaughtError;r(n.value,{componentStack:n.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(e){setTimeout(function(){throw e})}}function Zs(e,t,n){return n=Ba(n),n.tag=3,n.payload={element:null},n.callback=function(){Ys(e,t)},n}function Qs(e){return e=Ba(e),e.tag=3,e}function $s(e,t,n,r){var i=n.type.getDerivedStateFromError;if(typeof i==`function`){var a=r.value;e.payload=function(){return i(a)},e.callback=function(){Xs(t,n,r)}}var o=n.stateNode;o!==null&&typeof o.componentDidCatch==`function`&&(e.callback=function(){Xs(t,n,r),typeof i!=`function`&&(au===null?au=new Set([this]):au.add(this));var e=r.stack;this.componentDidCatch(r.value,{componentStack:e===null?``:e})})}function ec(e,t,n,r,i){if(n.flags|=32768,typeof r==`object`&&r&&typeof r.then==`function`){if(t=n.alternate,t!==null&&Qi(t,n,i,!0),n=eo.current,n!==null){switch(n.tag){case 31:case 13:return to===null?ku():n.alternate===null&&Kl===0&&(Kl=3),n.flags&=-257,n.flags|=65536,n.lanes=i,r===Sa?n.flags|=16384:(t=n.updateQueue,t===null?n.updateQueue=new Set([r]):t.add(r),Ju(e,r,i)),!1;case 22:return n.flags|=65536,r===Sa?n.flags|=16384:(t=n.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([r])},n.updateQueue=t):(n=t.retryQueue,n===null?t.retryQueue=new Set([r]):n.add(r)),Ju(e,r,i)),!1}throw Error(a(435,n.tag))}return Ju(e,r,i),ku(),!1}if(z)return t=eo.current,t===null?(r!==Li&&(t=Error(a(423),{cause:r}),Wi(vi(t,n))),e=e.current.alternate,e.flags|=65536,i&=-i,e.lanes|=i,r=vi(r,n),i=Zs(e.stateNode,r,i),Ua(e,i),Kl!==4&&(Kl=2)):(!(t.flags&65536)&&(t.flags|=256),t.flags|=65536,t.lanes=i,r!==Li&&(e=Error(a(422),{cause:r}),Wi(vi(e,n)))),!1;var o=Error(a(520),{cause:r});if(o=vi(o,n),Ql===null?Ql=[o]:Ql.push(o),Kl!==4&&(Kl=2),t===null)return!0;r=vi(r,n),n=t;do{switch(n.tag){case 3:return n.flags|=65536,e=i&-i,n.lanes|=e,e=Zs(n.stateNode,r,e),Ua(n,e),!1;case 1:if(t=n.type,o=n.stateNode,!(n.flags&128)&&(typeof t.getDerivedStateFromError==`function`||o!==null&&typeof o.componentDidCatch==`function`&&(au===null||!au.has(o))))return n.flags|=65536,i&=-i,n.lanes|=i,i=Qs(i),$s(i,e,n,r),Ua(n,i),!1}n=n.return}while(n!==null);return!1}var tc=Error(a(461)),nc=!1;function rc(e,t,n,r){t.child=e===null?Ia(t,null,n,r):Fa(t,e.child,n,r)}function ic(e,t,n,r,i){n=n.render;var a=t.ref;if(`ref`in r){var o={};for(var s in r)s!==`ref`&&(o[s]=r[s])}else o=r;return ea(t),r=So(e,t,n,o,a,i),s=Eo(),e!==null&&!nc?(Do(e,t,i),Oc(e,t,i)):(z&&s&&Ai(t),t.flags|=1,rc(e,t,r,i),t.child)}function ac(e,t,n,r,i){if(e===null){var a=n.type;return typeof a==`function`&&!li(a)&&a.defaultProps===void 0&&n.compare===null?(t.tag=15,t.type=a,oc(e,t,a,r,i)):(e=fi(n.type,null,r,t,t.mode,i),e.ref=t.ref,e.return=t,t.child=e)}if(a=e.child,!kc(e,i)){var o=a.memoizedProps;if(n=n.compare,n=n===null?wr:n,n(o,r)&&e.ref===t.ref)return Oc(e,t,i)}return t.flags|=1,e=ui(a,r),e.ref=t.ref,e.return=t,t.child=e}function oc(e,t,n,r,i){if(e!==null){var a=e.memoizedProps;if(wr(a,r)&&e.ref===t.ref)if(nc=!1,t.pendingProps=r=a,kc(e,i))e.flags&131072&&(nc=!0);else return t.lanes=e.lanes,Oc(e,t,i)}return mc(e,t,n,r,i)}function sc(e,t,n,r){var i=r.children,a=e===null?null:e.memoizedState;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),r.mode===`hidden`){if(t.flags&128){if(a=a===null?n:a.baseLanes|n,e!==null){for(r=t.child=e.child,i=0;r!==null;)i=i|r.lanes|r.childLanes,r=r.sibling;r=i&~a}else r=0,t.child=null;return lc(e,t,a,n,r)}if(n&536870912)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&_a(t,a===null?null:a.cachePool),a===null?Qa():Za(t,a),io(t);else return r=t.lanes=536870912,lc(e,t,a===null?n:a.baseLanes|n,n,r)}else a===null?(e!==null&&_a(t,null),Qa(),ao(t)):(_a(t,a.cachePool),Za(t,a),ao(t),t.memoizedState=null);return rc(e,t,i,n),t.child}function cc(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function lc(e,t,n,r,i){var a=ga();return a=a===null?null:{parent:aa._currentValue,pool:a},t.memoizedState={baseLanes:n,cachePool:a},e!==null&&_a(t,null),Qa(),io(t),e!==null&&Qi(e,t,r,!0),t.childLanes=i,null}function uc(e,t){return t=Cc({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function dc(e,t,n){return Fa(t,e.child,null,n),e=uc(t,t.pendingProps),e.flags|=2,oo(t),t.memoizedState=null,e}function fc(e,t,n){var r=t.pendingProps,i=(t.flags&128)!=0;if(t.flags&=-129,e===null){if(z){if(r.mode===`hidden`)return e=uc(t,r),t.lanes=536870912,cc(null,e);if(ro(t),(e=Pi)?(e=sf(e,Ii),e=e!==null&&e.data===`&`?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:Ti===null?null:{id:Ei,overflow:Di},retryLane:536870912,hydrationErrors:null},n=hi(e),n.return=t,t.child=n,Ni=t,Pi=null)):e=null,e===null)throw Ri(t);return t.lanes=536870912,null}return uc(t,r)}var o=e.memoizedState;if(o!==null){var s=o.dehydrated;if(ro(t),i)if(t.flags&256)t.flags&=-257,t=dc(e,t,n);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(a(558));else if(nc||Qi(e,t,n,!1),i=(n&e.childLanes)!==0,nc||i){if(r=K,r!==null&&(s=rt(r,n),s!==0&&s!==o.retryLane))throw o.retryLane=s,ri(e,s),_u(r,e,s),tc;ku(),t=dc(e,t,n)}else e=o.treeContext,Pi=df(s.nextSibling),Ni=t,z=!0,Fi=null,Ii=!1,e!==null&&Mi(t,e),t=uc(t,r),t.flags|=4096;return t}return e=ui(e.child,{mode:r.mode,children:r.children}),e.ref=t.ref,t.child=e,e.return=t,e}function pc(e,t){var n=t.ref;if(n===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof n!=`function`&&typeof n!=`object`)throw Error(a(284));(e===null||e.ref!==n)&&(t.flags|=4194816)}}function mc(e,t,n,r,i){return ea(t),n=So(e,t,n,r,void 0,i),r=Eo(),e!==null&&!nc?(Do(e,t,i),Oc(e,t,i)):(z&&r&&Ai(t),t.flags|=1,rc(e,t,n,i),t.child)}function hc(e,t,n,r,i,a){return ea(t),t.updateQueue=null,n=wo(t,r,n,i),Co(e),r=Eo(),e!==null&&!nc?(Do(e,t,a),Oc(e,t,a)):(z&&r&&Ai(t),t.flags|=1,rc(e,t,n,a),t.child)}function gc(e,t,n,r,i){if(ea(t),t.stateNode===null){var a=oi,o=n.contextType;typeof o==`object`&&o&&(a=ta(o)),a=new n(r,a),t.memoizedState=a.state!==null&&a.state!==void 0?a.state:null,a.updater=Hs,t.stateNode=a,a._reactInternals=t,a=t.stateNode,a.props=r,a.state=t.memoizedState,a.refs={},Ra(t),o=n.contextType,a.context=typeof o==`object`&&o?ta(o):oi,a.state=t.memoizedState,o=n.getDerivedStateFromProps,typeof o==`function`&&(Vs(t,n,o,r),a.state=t.memoizedState),typeof n.getDerivedStateFromProps==`function`||typeof a.getSnapshotBeforeUpdate==`function`||typeof a.UNSAFE_componentWillMount!=`function`&&typeof a.componentWillMount!=`function`||(o=a.state,typeof a.componentWillMount==`function`&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount==`function`&&a.UNSAFE_componentWillMount(),o!==a.state&&Hs.enqueueReplaceState(a,a.state,null),Ka(t,r,a,i),Ga(),a.state=t.memoizedState),typeof a.componentDidMount==`function`&&(t.flags|=4194308),r=!0}else if(e===null){a=t.stateNode;var s=t.memoizedProps,c=Gs(n,s);a.props=c;var l=a.context,u=n.contextType;o=oi,typeof u==`object`&&u&&(o=ta(u));var d=n.getDerivedStateFromProps;u=typeof d==`function`||typeof a.getSnapshotBeforeUpdate==`function`,s=t.pendingProps!==s,u||typeof a.UNSAFE_componentWillReceiveProps!=`function`&&typeof a.componentWillReceiveProps!=`function`||(s||l!==o)&&Ws(t,a,r,o),La=!1;var f=t.memoizedState;a.state=f,Ka(t,r,a,i),Ga(),l=t.memoizedState,s||f!==l||La?(typeof d==`function`&&(Vs(t,n,d,r),l=t.memoizedState),(c=La||Us(t,n,c,r,f,l,o))?(u||typeof a.UNSAFE_componentWillMount!=`function`&&typeof a.componentWillMount!=`function`||(typeof a.componentWillMount==`function`&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount==`function`&&a.UNSAFE_componentWillMount()),typeof a.componentDidMount==`function`&&(t.flags|=4194308)):(typeof a.componentDidMount==`function`&&(t.flags|=4194308),t.memoizedProps=r,t.memoizedState=l),a.props=r,a.state=l,a.context=o,r=c):(typeof a.componentDidMount==`function`&&(t.flags|=4194308),r=!1)}else{a=t.stateNode,za(e,t),o=t.memoizedProps,u=Gs(n,o),a.props=u,d=t.pendingProps,f=a.context,l=n.contextType,c=oi,typeof l==`object`&&l&&(c=ta(l)),s=n.getDerivedStateFromProps,(l=typeof s==`function`||typeof a.getSnapshotBeforeUpdate==`function`)||typeof a.UNSAFE_componentWillReceiveProps!=`function`&&typeof a.componentWillReceiveProps!=`function`||(o!==d||f!==c)&&Ws(t,a,r,c),La=!1,f=t.memoizedState,a.state=f,Ka(t,r,a,i),Ga();var p=t.memoizedState;o!==d||f!==p||La||e!==null&&e.dependencies!==null&&$i(e.dependencies)?(typeof s==`function`&&(Vs(t,n,s,r),p=t.memoizedState),(u=La||Us(t,n,u,r,f,p,c)||e!==null&&e.dependencies!==null&&$i(e.dependencies))?(l||typeof a.UNSAFE_componentWillUpdate!=`function`&&typeof a.componentWillUpdate!=`function`||(typeof a.componentWillUpdate==`function`&&a.componentWillUpdate(r,p,c),typeof a.UNSAFE_componentWillUpdate==`function`&&a.UNSAFE_componentWillUpdate(r,p,c)),typeof a.componentDidUpdate==`function`&&(t.flags|=4),typeof a.getSnapshotBeforeUpdate==`function`&&(t.flags|=1024)):(typeof a.componentDidUpdate!=`function`||o===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof a.getSnapshotBeforeUpdate!=`function`||o===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),t.memoizedProps=r,t.memoizedState=p),a.props=r,a.state=p,a.context=c,r=u):(typeof a.componentDidUpdate!=`function`||o===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof a.getSnapshotBeforeUpdate!=`function`||o===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),r=!1)}return a=r,pc(e,t),r=(t.flags&128)!=0,a||r?(a=t.stateNode,n=r&&typeof n.getDerivedStateFromError!=`function`?null:a.render(),t.flags|=1,e!==null&&r?(t.child=Fa(t,e.child,null,i),t.child=Fa(t,null,n,i)):rc(e,t,n,i),t.memoizedState=a.state,e=t.child):e=Oc(e,t,i),e}function _c(e,t,n,r){return Hi(),t.flags|=256,rc(e,t,n,r),t.child}var vc={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function yc(e){return{baseLanes:e,cachePool:va()}}function bc(e,t,n){return e=e===null?0:e.childLanes&~n,t&&(e|=Xl),e}function xc(e,t,n){var r=t.pendingProps,i=!1,o=(t.flags&128)!=0,s;if((s=o)||(s=e!==null&&e.memoizedState===null?!1:(so.current&2)!=0),s&&(i=!0,t.flags&=-129),s=(t.flags&32)!=0,t.flags&=-33,e===null){if(z){if(i?no(t):ao(t),(e=Pi)?(e=sf(e,Ii),e=e!==null&&e.data!==`&`?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:Ti===null?null:{id:Ei,overflow:Di},retryLane:536870912,hydrationErrors:null},n=hi(e),n.return=t,t.child=n,Ni=t,Pi=null)):e=null,e===null)throw Ri(t);return lf(e)?t.lanes=32:t.lanes=536870912,null}var c=r.children;return r=r.fallback,i?(ao(t),i=t.mode,c=Cc({mode:`hidden`,children:c},i),r=pi(r,i,n,null),c.return=t,r.return=t,c.sibling=r,t.child=c,r=t.child,r.memoizedState=yc(n),r.childLanes=bc(e,s,n),t.memoizedState=vc,cc(null,r)):(no(t),Sc(t,c))}var l=e.memoizedState;if(l!==null&&(c=l.dehydrated,c!==null)){if(o)t.flags&256?(no(t),t.flags&=-257,t=wc(e,t,n)):t.memoizedState===null?(ao(t),c=r.fallback,i=t.mode,r=Cc({mode:`visible`,children:r.children},i),c=pi(c,i,n,null),c.flags|=2,r.return=t,c.return=t,r.sibling=c,t.child=r,Fa(t,e.child,null,n),r=t.child,r.memoizedState=yc(n),r.childLanes=bc(e,s,n),t.memoizedState=vc,t=cc(null,r)):(ao(t),t.child=e.child,t.flags|=128,t=null);else if(no(t),lf(c)){if(s=c.nextSibling&&c.nextSibling.dataset,s)var u=s.dgst;s=u,r=Error(a(419)),r.stack=``,r.digest=s,Wi({value:r,source:null,stack:null}),t=wc(e,t,n)}else if(nc||Qi(e,t,n,!1),s=(n&e.childLanes)!==0,nc||s){if(s=K,s!==null&&(r=rt(s,n),r!==0&&r!==l.retryLane))throw l.retryLane=r,ri(e,r),_u(s,e,r),tc;cf(c)||ku(),t=wc(e,t,n)}else cf(c)?(t.flags|=192,t.child=e.child,t=null):(e=l.treeContext,Pi=df(c.nextSibling),Ni=t,z=!0,Fi=null,Ii=!1,e!==null&&Mi(t,e),t=Sc(t,r.children),t.flags|=4096);return t}return i?(ao(t),c=r.fallback,i=t.mode,l=e.child,u=l.sibling,r=ui(l,{mode:`hidden`,children:r.children}),r.subtreeFlags=l.subtreeFlags&65011712,u===null?(c=pi(c,i,n,null),c.flags|=2):c=ui(u,c),c.return=t,r.return=t,r.sibling=c,t.child=r,cc(null,r),r=t.child,c=e.child.memoizedState,c===null?c=yc(n):(i=c.cachePool,i===null?i=va():(l=aa._currentValue,i=i.parent===l?i:{parent:l,pool:l}),c={baseLanes:c.baseLanes|n,cachePool:i}),r.memoizedState=c,r.childLanes=bc(e,s,n),t.memoizedState=vc,cc(e.child,r)):(no(t),n=e.child,e=n.sibling,n=ui(n,{mode:`visible`,children:r.children}),n.return=t,n.sibling=null,e!==null&&(s=t.deletions,s===null?(t.deletions=[e],t.flags|=16):s.push(e)),t.child=n,t.memoizedState=null,n)}function Sc(e,t){return t=Cc({mode:`visible`,children:t},e.mode),t.return=e,e.child=t}function Cc(e,t){return e=ci(22,e,null,t),e.lanes=0,e}function wc(e,t,n){return Fa(t,e.child,null,n),e=Sc(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function Tc(e,t,n){e.lanes|=t;var r=e.alternate;r!==null&&(r.lanes|=t),Xi(e.return,t,n)}function Ec(e,t,n,r,i,a){var o=e.memoizedState;o===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:r,tail:n,tailMode:i,treeForkCount:a}:(o.isBackwards=t,o.rendering=null,o.renderingStartTime=0,o.last=r,o.tail=n,o.tailMode=i,o.treeForkCount=a)}function Dc(e,t,n){var r=t.pendingProps,i=r.revealOrder,a=r.tail;r=r.children;var o=so.current,s=(o&2)!=0;if(s?(o=o&1|2,t.flags|=128):o&=1,N(so,o),rc(e,t,r,n),r=z?Si:0,!s&&e!==null&&e.flags&128)a:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&Tc(e,n,t);else if(e.tag===19)Tc(e,n,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break a;for(;e.sibling===null;){if(e.return===null||e.return===t)break a;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(i){case`forwards`:for(n=t.child,i=null;n!==null;)e=n.alternate,e!==null&&co(e)===null&&(i=n),n=n.sibling;n=i,n===null?(i=t.child,t.child=null):(i=n.sibling,n.sibling=null),Ec(t,!1,i,n,a,r);break;case`backwards`:case`unstable_legacy-backwards`:for(n=null,i=t.child,t.child=null;i!==null;){if(e=i.alternate,e!==null&&co(e)===null){t.child=i;break}e=i.sibling,i.sibling=n,n=i,i=e}Ec(t,!0,n,null,a,r);break;case`together`:Ec(t,!1,null,null,void 0,r);break;default:t.memoizedState=null}return t.child}function Oc(e,t,n){if(e!==null&&(t.dependencies=e.dependencies),ql|=t.lanes,(n&t.childLanes)===0)if(e!==null){if(Qi(e,t,n,!1),(n&t.childLanes)===0)return null}else return null;if(e!==null&&t.child!==e.child)throw Error(a(153));if(t.child!==null){for(e=t.child,n=ui(e,e.pendingProps),t.child=n,n.return=t;e.sibling!==null;)e=e.sibling,n=n.sibling=ui(e,e.pendingProps),n.return=t;n.sibling=null}return t.child}function kc(e,t){return(e.lanes&t)===0?(e=e.dependencies,!!(e!==null&&$i(e))):!0}function Ac(e,t,n){switch(t.tag){case 3:pe(t,t.stateNode.containerInfo),Ji(t,aa,e.memoizedState.cache),Hi();break;case 27:case 5:he(t);break;case 4:pe(t,t.stateNode.containerInfo);break;case 10:Ji(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,ro(t),null;break;case 13:var r=t.memoizedState;if(r!==null)return r.dehydrated===null?(n&t.child.childLanes)===0?(no(t),e=Oc(e,t,n),e===null?null:e.sibling):xc(e,t,n):(no(t),t.flags|=128,null);no(t);break;case 19:var i=(e.flags&128)!=0;if(r=(n&t.childLanes)!==0,r||=(Qi(e,t,n,!1),(n&t.childLanes)!==0),i){if(r)return Dc(e,t,n);t.flags|=128}if(i=t.memoizedState,i!==null&&(i.rendering=null,i.tail=null,i.lastEffect=null),N(so,so.current),r)break;return null;case 22:return t.lanes=0,sc(e,t,n,t.pendingProps);case 24:Ji(t,aa,e.memoizedState.cache)}return Oc(e,t,n)}function jc(e,t,n){if(e!==null)if(e.memoizedProps!==t.pendingProps)nc=!0;else{if(!kc(e,n)&&!(t.flags&128))return nc=!1,Ac(e,t,n);nc=!!(e.flags&131072)}else nc=!1,z&&t.flags&1048576&&ki(t,Si,t.index);switch(t.lanes=0,t.tag){case 16:a:{var r=t.pendingProps;if(e=Ta(t.elementType),t.type=e,typeof e==`function`)li(e)?(r=Gs(e,r),t.tag=1,t=gc(null,t,e,r,n)):(t.tag=0,t=mc(null,t,e,r,n));else{if(e!=null){var i=e.$$typeof;if(i===S){t.tag=11,t=ic(null,t,e,r,n);break a}else if(i===w){t.tag=14,t=ac(null,t,e,r,n);break a}}throw t=ie(e)||e,Error(a(306,t,``))}}return t;case 0:return mc(e,t,t.type,t.pendingProps,n);case 1:return r=t.type,i=Gs(r,t.pendingProps),gc(e,t,r,i,n);case 3:a:{if(pe(t,t.stateNode.containerInfo),e===null)throw Error(a(387));r=t.pendingProps;var o=t.memoizedState;i=o.element,za(e,t),Ka(t,r,null,n);var s=t.memoizedState;if(r=s.cache,Ji(t,aa,r),r!==o.cache&&Zi(t,[aa],n,!0),Ga(),r=s.element,o.isDehydrated)if(o={element:r,isDehydrated:!1,cache:s.cache},t.updateQueue.baseState=o,t.memoizedState=o,t.flags&256){t=_c(e,t,r,n);break a}else if(r!==i){i=vi(Error(a(424)),t),Wi(i),t=_c(e,t,r,n);break a}else{switch(e=t.stateNode.containerInfo,e.nodeType){case 9:e=e.body;break;default:e=e.nodeName===`HTML`?e.ownerDocument.body:e}for(Pi=df(e.firstChild),Ni=t,z=!0,Fi=null,Ii=!0,n=Ia(t,null,r,n),t.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling}else{if(Hi(),r===i){t=Oc(e,t,n);break a}rc(e,t,r,n)}t=t.child}return t;case 26:return pc(e,t),e===null?(n=jf(t.type,null,t.pendingProps,null))?t.memoizedState=n:z||(n=t.type,e=t.pendingProps,r=Ud(de.current).createElement(n),r[lt]=t,r[ut]=e,Ld(r,n,e),F(r),t.stateNode=r):t.memoizedState=jf(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return he(t),e===null&&z&&(r=t.stateNode=mf(t.type,t.pendingProps,de.current),Ni=t,Ii=!0,i=Pi,ef(t.type)?(ff=i,Pi=df(r.firstChild)):Pi=i),rc(e,t,t.pendingProps.children,n),pc(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&z&&((i=r=Pi)&&(r=af(r,t.type,t.pendingProps,Ii),r===null?i=!1:(t.stateNode=r,Ni=t,Pi=df(r.firstChild),Ii=!1,i=!0)),i||Ri(t)),he(t),i=t.type,o=t.pendingProps,s=e===null?null:e.memoizedProps,r=o.children,Kd(i,o)?r=null:s!==null&&Kd(i,s)&&(t.flags|=32),t.memoizedState!==null&&(i=So(e,t,To,null,null,n),ep._currentValue=i),pc(e,t),rc(e,t,r,n),t.child;case 6:return e===null&&z&&((e=n=Pi)&&(n=of(n,t.pendingProps,Ii),n===null?e=!1:(t.stateNode=n,Ni=t,Pi=null,e=!0)),e||Ri(t)),null;case 13:return xc(e,t,n);case 4:return pe(t,t.stateNode.containerInfo),r=t.pendingProps,e===null?t.child=Fa(t,null,r,n):rc(e,t,r,n),t.child;case 11:return ic(e,t,t.type,t.pendingProps,n);case 7:return rc(e,t,t.pendingProps,n),t.child;case 8:return rc(e,t,t.pendingProps.children,n),t.child;case 12:return rc(e,t,t.pendingProps.children,n),t.child;case 10:return r=t.pendingProps,Ji(t,t.type,r.value),rc(e,t,r.children,n),t.child;case 9:return i=t.type._context,r=t.pendingProps.children,ea(t),i=ta(i),r=r(i),t.flags|=1,rc(e,t,r,n),t.child;case 14:return ac(e,t,t.type,t.pendingProps,n);case 15:return oc(e,t,t.type,t.pendingProps,n);case 19:return Dc(e,t,n);case 31:return fc(e,t,n);case 22:return sc(e,t,n,t.pendingProps);case 24:return ea(t),r=ta(aa),e===null?(i=ga(),i===null&&(i=K,o=oa(),i.pooledCache=o,o.refCount++,o!==null&&(i.pooledCacheLanes|=n),i=o),t.memoizedState={parent:r,cache:i},Ra(t),Ji(t,aa,i)):((e.lanes&n)!==0&&(za(e,t),Ka(t,null,null,n),Ga()),i=e.memoizedState,o=t.memoizedState,i.parent===r?(r=o.cache,Ji(t,aa,r),r!==i.cache&&Zi(t,[aa],n,!0)):(i={parent:r,cache:r},t.memoizedState=i,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=i),Ji(t,aa,r))),rc(e,t,t.pendingProps.children,n),t.child;case 29:throw t.pendingProps}throw Error(a(156,t.tag))}function Mc(e){e.flags|=4}function Nc(e,t,n,r,i){if((t=(e.mode&32)!=0)&&(t=!1),t){if(e.flags|=16777216,(i&335544128)===i)if(e.stateNode.complete)e.flags|=8192;else if(Eu())e.flags|=8192;else throw Ea=Sa,ba}else e.flags&=-16777217}function Pc(e,t){if(t.type!==`stylesheet`||t.state.loading&4)e.flags&=-16777217;else if(e.flags|=16777216,!Kf(t))if(Eu())e.flags|=8192;else throw Ea=Sa,ba}function Fc(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag===22?536870912:Ze(),e.lanes|=t,Zl|=t)}function Ic(e,t){if(!z)switch(e.tailMode){case`hidden`:t=e.tail;for(var n=null;t!==null;)t.alternate!==null&&(n=t),t=t.sibling;n===null?e.tail=null:n.sibling=null;break;case`collapsed`:n=e.tail;for(var r=null;n!==null;)n.alternate!==null&&(r=n),n=n.sibling;r===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:r.sibling=null}}function Lc(e){var t=e.alternate!==null&&e.alternate.child===e.child,n=0,r=0;if(t)for(var i=e.child;i!==null;)n|=i.lanes|i.childLanes,r|=i.subtreeFlags&65011712,r|=i.flags&65011712,i.return=e,i=i.sibling;else for(i=e.child;i!==null;)n|=i.lanes|i.childLanes,r|=i.subtreeFlags,r|=i.flags,i.return=e,i=i.sibling;return e.subtreeFlags|=r,e.childLanes=n,t}function Rc(e,t,n){var r=t.pendingProps;switch(ji(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return Lc(t),null;case 1:return Lc(t),null;case 3:return n=t.stateNode,r=null,e!==null&&(r=e.memoizedState.cache),t.memoizedState.cache!==r&&(t.flags|=2048),Yi(aa),me(),n.pendingContext&&(n.context=n.pendingContext,n.pendingContext=null),(e===null||e.child===null)&&(Vi(t)?Mc(t):e===null||e.memoizedState.isDehydrated&&!(t.flags&256)||(t.flags|=1024,Ui())),Lc(t),null;case 26:var i=t.type,o=t.memoizedState;return e===null?(Mc(t),o===null?(Lc(t),Nc(t,i,null,r,n)):(Lc(t),Pc(t,o))):o?o===e.memoizedState?(Lc(t),t.flags&=-16777217):(Mc(t),Lc(t),Pc(t,o)):(e=e.memoizedProps,e!==r&&Mc(t),Lc(t),Nc(t,i,e,r,n)),null;case 27:if(ge(t),n=de.current,i=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==r&&Mc(t);else{if(!r){if(t.stateNode===null)throw Error(a(166));return Lc(t),null}e=le.current,Vi(t)?zi(t,e):(e=mf(i,r,n),t.stateNode=e,Mc(t))}return Lc(t),null;case 5:if(ge(t),i=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==r&&Mc(t);else{if(!r){if(t.stateNode===null)throw Error(a(166));return Lc(t),null}if(o=le.current,Vi(t))zi(t,o);else{var s=Ud(de.current);switch(o){case 1:o=s.createElementNS(`http://www.w3.org/2000/svg`,i);break;case 2:o=s.createElementNS(`http://www.w3.org/1998/Math/MathML`,i);break;default:switch(i){case`svg`:o=s.createElementNS(`http://www.w3.org/2000/svg`,i);break;case`math`:o=s.createElementNS(`http://www.w3.org/1998/Math/MathML`,i);break;case`script`:o=s.createElement(`div`),o.innerHTML=`<script><\/script>`,o=o.removeChild(o.firstChild);break;case`select`:o=typeof r.is==`string`?s.createElement(`select`,{is:r.is}):s.createElement(`select`),r.multiple?o.multiple=!0:r.size&&(o.size=r.size);break;default:o=typeof r.is==`string`?s.createElement(i,{is:r.is}):s.createElement(i)}}o[lt]=t,o[ut]=r;a:for(s=t.child;s!==null;){if(s.tag===5||s.tag===6)o.appendChild(s.stateNode);else if(s.tag!==4&&s.tag!==27&&s.child!==null){s.child.return=s,s=s.child;continue}if(s===t)break a;for(;s.sibling===null;){if(s.return===null||s.return===t)break a;s=s.return}s.sibling.return=s.return,s=s.sibling}t.stateNode=o;a:switch(Ld(o,i,r),i){case`button`:case`input`:case`select`:case`textarea`:r=!!r.autoFocus;break a;case`img`:r=!0;break a;default:r=!1}r&&Mc(t)}}return Lc(t),Nc(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,n),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==r&&Mc(t);else{if(typeof r!=`string`&&t.stateNode===null)throw Error(a(166));if(e=de.current,Vi(t)){if(e=t.stateNode,n=t.memoizedProps,r=null,i=Ni,i!==null)switch(i.tag){case 27:case 5:r=i.memoizedProps}e[lt]=t,e=!!(e.nodeValue===n||r!==null&&!0===r.suppressHydrationWarning||Fd(e.nodeValue,n)),e||Ri(t,!0)}else e=Ud(e).createTextNode(r),e[lt]=t,t.stateNode=e}return Lc(t),null;case 31:if(n=t.memoizedState,e===null||e.memoizedState!==null){if(r=Vi(t),n!==null){if(e===null){if(!r)throw Error(a(318));if(e=t.memoizedState,e=e===null?null:e.dehydrated,!e)throw Error(a(557));e[lt]=t}else Hi(),!(t.flags&128)&&(t.memoizedState=null),t.flags|=4;Lc(t),e=!1}else n=Ui(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=n),e=!0;if(!e)return t.flags&256?(oo(t),t):(oo(t),null);if(t.flags&128)throw Error(a(558))}return Lc(t),null;case 13:if(r=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(i=Vi(t),r!==null&&r.dehydrated!==null){if(e===null){if(!i)throw Error(a(318));if(i=t.memoizedState,i=i===null?null:i.dehydrated,!i)throw Error(a(317));i[lt]=t}else Hi(),!(t.flags&128)&&(t.memoizedState=null),t.flags|=4;Lc(t),i=!1}else i=Ui(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=i),i=!0;if(!i)return t.flags&256?(oo(t),t):(oo(t),null)}return oo(t),t.flags&128?(t.lanes=n,t):(n=r!==null,e=e!==null&&e.memoizedState!==null,n&&(r=t.child,i=null,r.alternate!==null&&r.alternate.memoizedState!==null&&r.alternate.memoizedState.cachePool!==null&&(i=r.alternate.memoizedState.cachePool.pool),o=null,r.memoizedState!==null&&r.memoizedState.cachePool!==null&&(o=r.memoizedState.cachePool.pool),o!==i&&(r.flags|=2048)),n!==e&&n&&(t.child.flags|=8192),Fc(t,t.updateQueue),Lc(t),null);case 4:return me(),e===null&&Td(t.stateNode.containerInfo),Lc(t),null;case 10:return Yi(t.type),Lc(t),null;case 19:if(ce(so),r=t.memoizedState,r===null)return Lc(t),null;if(i=(t.flags&128)!=0,o=r.rendering,o===null)if(i)Ic(r,!1);else{if(Kl!==0||e!==null&&e.flags&128)for(e=t.child;e!==null;){if(o=co(e),o!==null){for(t.flags|=128,Ic(r,!1),e=o.updateQueue,t.updateQueue=e,Fc(t,e),t.subtreeFlags=0,e=n,n=t.child;n!==null;)di(n,e),n=n.sibling;return N(so,so.current&1|2),z&&Oi(t,r.treeForkCount),t.child}e=e.sibling}r.tail!==null&&ke()>ru&&(t.flags|=128,i=!0,Ic(r,!1),t.lanes=4194304)}else{if(!i)if(e=co(o),e!==null){if(t.flags|=128,i=!0,e=e.updateQueue,t.updateQueue=e,Fc(t,e),Ic(r,!0),r.tail===null&&r.tailMode===`hidden`&&!o.alternate&&!z)return Lc(t),null}else 2*ke()-r.renderingStartTime>ru&&n!==536870912&&(t.flags|=128,i=!0,Ic(r,!1),t.lanes=4194304);r.isBackwards?(o.sibling=t.child,t.child=o):(e=r.last,e===null?t.child=o:e.sibling=o,r.last=o)}return r.tail===null?(Lc(t),null):(e=r.tail,r.rendering=e,r.tail=e.sibling,r.renderingStartTime=ke(),e.sibling=null,n=so.current,N(so,i?n&1|2:n&1),z&&Oi(t,r.treeForkCount),e);case 22:case 23:return oo(t),$a(),r=t.memoizedState!==null,e===null?r&&(t.flags|=8192):e.memoizedState!==null!==r&&(t.flags|=8192),r?n&536870912&&!(t.flags&128)&&(Lc(t),t.subtreeFlags&6&&(t.flags|=8192)):Lc(t),n=t.updateQueue,n!==null&&Fc(t,n.retryQueue),n=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),r=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(r=t.memoizedState.cachePool.pool),r!==n&&(t.flags|=2048),e!==null&&ce(ha),null;case 24:return n=null,e!==null&&(n=e.memoizedState.cache),t.memoizedState.cache!==n&&(t.flags|=2048),Yi(aa),Lc(t),null;case 25:return null;case 30:return null}throw Error(a(156,t.tag))}function zc(e,t){switch(ji(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return Yi(aa),me(),e=t.flags,e&65536&&!(e&128)?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return ge(t),null;case 31:if(t.memoizedState!==null){if(oo(t),t.alternate===null)throw Error(a(340));Hi()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(oo(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(a(340));Hi()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return ce(so),null;case 4:return me(),null;case 10:return Yi(t.type),null;case 22:case 23:return oo(t),$a(),e!==null&&ce(ha),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return Yi(aa),null;case 25:return null;default:return null}}function Bc(e,t){switch(ji(t),t.tag){case 3:Yi(aa),me();break;case 26:case 27:case 5:ge(t);break;case 4:me();break;case 31:t.memoizedState!==null&&oo(t);break;case 13:oo(t);break;case 19:ce(so);break;case 10:Yi(t.type);break;case 22:case 23:oo(t),$a(),e!==null&&ce(ha);break;case 24:Yi(aa)}}function Vc(e,t){try{var n=t.updateQueue,r=n===null?null:n.lastEffect;if(r!==null){var i=r.next;n=i;do{if((n.tag&e)===e){r=void 0;var a=n.create,o=n.inst;r=a(),o.destroy=r}n=n.next}while(n!==i)}}catch(e){qu(t,t.return,e)}}function Hc(e,t,n){try{var r=t.updateQueue,i=r===null?null:r.lastEffect;if(i!==null){var a=i.next;r=a;do{if((r.tag&e)===e){var o=r.inst,s=o.destroy;if(s!==void 0){o.destroy=void 0,i=t;var c=n,l=s;try{l()}catch(e){qu(i,c,e)}}}r=r.next}while(r!==a)}}catch(e){qu(t,t.return,e)}}function Uc(e){var t=e.updateQueue;if(t!==null){var n=e.stateNode;try{Ja(t,n)}catch(t){qu(e,e.return,t)}}}function Wc(e,t,n){n.props=Gs(e.type,e.memoizedProps),n.state=e.memoizedState;try{n.componentWillUnmount()}catch(n){qu(e,t,n)}}function Gc(e,t){try{var n=e.ref;if(n!==null){switch(e.tag){case 26:case 27:case 5:var r=e.stateNode;break;case 30:r=e.stateNode;break;default:r=e.stateNode}typeof n==`function`?e.refCleanup=n(r):n.current=r}}catch(n){qu(e,t,n)}}function Kc(e,t){var n=e.ref,r=e.refCleanup;if(n!==null)if(typeof r==`function`)try{r()}catch(n){qu(e,t,n)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof n==`function`)try{n(null)}catch(n){qu(e,t,n)}else n.current=null}function qc(e){var t=e.type,n=e.memoizedProps,r=e.stateNode;try{a:switch(t){case`button`:case`input`:case`select`:case`textarea`:n.autoFocus&&r.focus();break a;case`img`:n.src?r.src=n.src:n.srcSet&&(r.srcset=n.srcSet)}}catch(t){qu(e,e.return,t)}}function Jc(e,t,n){try{var r=e.stateNode;Rd(r,e.type,n,t),r[ut]=t}catch(t){qu(e,e.return,t)}}function Yc(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&ef(e.type)||e.tag===4}function Xc(e){a:for(;;){for(;e.sibling===null;){if(e.return===null||Yc(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&ef(e.type)||e.flags&2||e.child===null||e.tag===4)continue a;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function Zc(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?(n.nodeType===9?n.body:n.nodeName===`HTML`?n.ownerDocument.body:n).insertBefore(e,t):(t=n.nodeType===9?n.body:n.nodeName===`HTML`?n.ownerDocument.body:n,t.appendChild(e),n=n._reactRootContainer,n!=null||t.onclick!==null||(t.onclick=tn));else if(r!==4&&(r===27&&ef(e.type)&&(n=e.stateNode,t=null),e=e.child,e!==null))for(Zc(e,t,n),e=e.sibling;e!==null;)Zc(e,t,n),e=e.sibling}function Qc(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?n.insertBefore(e,t):n.appendChild(e);else if(r!==4&&(r===27&&ef(e.type)&&(n=e.stateNode),e=e.child,e!==null))for(Qc(e,t,n),e=e.sibling;e!==null;)Qc(e,t,n),e=e.sibling}function $c(e){var t=e.stateNode,n=e.memoizedProps;try{for(var r=e.type,i=t.attributes;i.length;)t.removeAttributeNode(i[0]);Ld(t,r,n),t[lt]=e,t[ut]=n}catch(t){qu(e,e.return,t)}}var el=!1,tl=!1,nl=!1,rl=typeof WeakSet==`function`?WeakSet:Set,il=null;function al(e,t){if(e=e.containerInfo,Vd=lp,e=Or(e),R(e)){if(`selectionStart`in e)var n={start:e.selectionStart,end:e.selectionEnd};else a:{n=(n=e.ownerDocument)&&n.defaultView||window;var r=n.getSelection&&n.getSelection();if(r&&r.rangeCount!==0){n=r.anchorNode;var i=r.anchorOffset,o=r.focusNode;r=r.focusOffset;try{n.nodeType,o.nodeType}catch{n=null;break a}var s=0,c=-1,l=-1,u=0,d=0,f=e,p=null;b:for(;;){for(var m;f!==n||i!==0&&f.nodeType!==3||(c=s+i),f!==o||r!==0&&f.nodeType!==3||(l=s+r),f.nodeType===3&&(s+=f.nodeValue.length),(m=f.firstChild)!==null;)p=f,f=m;for(;;){if(f===e)break b;if(p===n&&++u===i&&(c=s),p===o&&++d===r&&(l=s),(m=f.nextSibling)!==null)break;f=p,p=f.parentNode}f=m}n=c===-1||l===-1?null:{start:c,end:l}}else n=null}n||={start:0,end:0}}else n=null;for(Hd={focusedElem:e,selectionRange:n},lp=!1,il=t;il!==null;)if(t=il,e=t.child,t.subtreeFlags&1028&&e!==null)e.return=t,il=e;else for(;il!==null;){switch(t=il,o=t.alternate,e=t.flags,t.tag){case 0:if(e&4&&(e=t.updateQueue,e=e===null?null:e.events,e!==null))for(n=0;n<e.length;n++)i=e[n],i.ref.impl=i.nextImpl;break;case 11:case 15:break;case 1:if(e&1024&&o!==null){e=void 0,n=t,i=o.memoizedProps,o=o.memoizedState,r=n.stateNode;try{var h=Gs(n.type,i);e=r.getSnapshotBeforeUpdate(h,o),r.__reactInternalSnapshotBeforeUpdate=e}catch(e){qu(n,n.return,e)}}break;case 3:if(e&1024){if(e=t.stateNode.containerInfo,n=e.nodeType,n===9)rf(e);else if(n===1)switch(e.nodeName){case`HEAD`:case`HTML`:case`BODY`:rf(e);break;default:e.textContent=``}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if(e&1024)throw Error(a(163))}if(e=t.sibling,e!==null){e.return=t.return,il=e;break}il=t.return}}function ol(e,t,n){var r=n.flags;switch(n.tag){case 0:case 11:case 15:xl(e,n),r&4&&Vc(5,n);break;case 1:if(xl(e,n),r&4)if(e=n.stateNode,t===null)try{e.componentDidMount()}catch(e){qu(n,n.return,e)}else{var i=Gs(n.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(i,t,e.__reactInternalSnapshotBeforeUpdate)}catch(e){qu(n,n.return,e)}}r&64&&Uc(n),r&512&&Gc(n,n.return);break;case 3:if(xl(e,n),r&64&&(e=n.updateQueue,e!==null)){if(t=null,n.child!==null)switch(n.child.tag){case 27:case 5:t=n.child.stateNode;break;case 1:t=n.child.stateNode}try{Ja(e,t)}catch(e){qu(n,n.return,e)}}break;case 27:t===null&&r&4&&$c(n);case 26:case 5:xl(e,n),t===null&&r&4&&qc(n),r&512&&Gc(n,n.return);break;case 12:xl(e,n);break;case 31:xl(e,n),r&4&&fl(e,n);break;case 13:xl(e,n),r&4&&pl(e,n),r&64&&(e=n.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(n=Zu.bind(null,n),uf(e,n))));break;case 22:if(r=n.memoizedState!==null||el,!r){t=t!==null&&t.memoizedState!==null||tl,i=el;var a=tl;el=r,(tl=t)&&!a?Cl(e,n,(n.subtreeFlags&8772)!=0):xl(e,n),el=i,tl=a}break;case 30:break;default:xl(e,n)}}function sl(e){var t=e.alternate;t!==null&&(e.alternate=null,sl(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&_t(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var cl=null,ll=!1;function ul(e,t,n){for(n=n.child;n!==null;)dl(e,t,n),n=n.sibling}function dl(e,t,n){if(Re&&typeof Re.onCommitFiberUnmount==`function`)try{Re.onCommitFiberUnmount(Le,n)}catch{}switch(n.tag){case 26:tl||Kc(n,t),ul(e,t,n),n.memoizedState?n.memoizedState.count--:n.stateNode&&(n=n.stateNode,n.parentNode.removeChild(n));break;case 27:tl||Kc(n,t);var r=cl,i=ll;ef(n.type)&&(cl=n.stateNode,ll=!1),ul(e,t,n),hf(n.stateNode),cl=r,ll=i;break;case 5:tl||Kc(n,t);case 6:if(r=cl,i=ll,cl=null,ul(e,t,n),cl=r,ll=i,cl!==null)if(ll)try{(cl.nodeType===9?cl.body:cl.nodeName===`HTML`?cl.ownerDocument.body:cl).removeChild(n.stateNode)}catch(e){qu(n,t,e)}else try{cl.removeChild(n.stateNode)}catch(e){qu(n,t,e)}break;case 18:cl!==null&&(ll?(e=cl,tf(e.nodeType===9?e.body:e.nodeName===`HTML`?e.ownerDocument.body:e,n.stateNode),Fp(e)):tf(cl,n.stateNode));break;case 4:r=cl,i=ll,cl=n.stateNode.containerInfo,ll=!0,ul(e,t,n),cl=r,ll=i;break;case 0:case 11:case 14:case 15:Hc(2,n,t),tl||Hc(4,n,t),ul(e,t,n);break;case 1:tl||(Kc(n,t),r=n.stateNode,typeof r.componentWillUnmount==`function`&&Wc(n,t,r)),ul(e,t,n);break;case 21:ul(e,t,n);break;case 22:tl=(r=tl)||n.memoizedState!==null,ul(e,t,n),tl=r;break;default:ul(e,t,n)}}function fl(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{Fp(e)}catch(e){qu(t,t.return,e)}}}function pl(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{Fp(e)}catch(e){qu(t,t.return,e)}}function ml(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new rl),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new rl),t;default:throw Error(a(435,e.tag))}}function hl(e,t){var n=ml(e);t.forEach(function(t){if(!n.has(t)){n.add(t);var r=Qu.bind(null,e,t);t.then(r,r)}})}function gl(e,t){var n=t.deletions;if(n!==null)for(var r=0;r<n.length;r++){var i=n[r],o=e,s=t,c=s;a:for(;c!==null;){switch(c.tag){case 27:if(ef(c.type)){cl=c.stateNode,ll=!1;break a}break;case 5:cl=c.stateNode,ll=!1;break a;case 3:case 4:cl=c.stateNode.containerInfo,ll=!0;break a}c=c.return}if(cl===null)throw Error(a(160));dl(o,s,i),cl=null,ll=!1,o=i.alternate,o!==null&&(o.return=null),i.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)vl(t,e),t=t.sibling}var _l=null;function vl(e,t){var n=e.alternate,r=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:gl(t,e),yl(e),r&4&&(Hc(3,e,e.return),Vc(3,e),Hc(5,e,e.return));break;case 1:gl(t,e),yl(e),r&512&&(tl||n===null||Kc(n,n.return)),r&64&&el&&(e=e.updateQueue,e!==null&&(r=e.callbacks,r!==null&&(n=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=n===null?r:n.concat(r))));break;case 26:var i=_l;if(gl(t,e),yl(e),r&512&&(tl||n===null||Kc(n,n.return)),r&4){var o=n===null?null:n.memoizedState;if(r=e.memoizedState,n===null)if(r===null)if(e.stateNode===null){a:{r=e.type,n=e.memoizedProps,i=i.ownerDocument||i;b:switch(r){case`title`:o=i.getElementsByTagName(`title`)[0],(!o||o[gt]||o[lt]||o.namespaceURI===`http://www.w3.org/2000/svg`||o.hasAttribute(`itemprop`))&&(o=i.createElement(r),i.head.insertBefore(o,i.querySelector(`head > title`))),Ld(o,r,n),o[lt]=e,F(o),r=o;break a;case`link`:var s=Uf(`link`,`href`,i).get(r+(n.href||``));if(s){for(var c=0;c<s.length;c++)if(o=s[c],o.getAttribute(`href`)===(n.href==null||n.href===``?null:n.href)&&o.getAttribute(`rel`)===(n.rel==null?null:n.rel)&&o.getAttribute(`title`)===(n.title==null?null:n.title)&&o.getAttribute(`crossorigin`)===(n.crossOrigin==null?null:n.crossOrigin)){s.splice(c,1);break b}}o=i.createElement(r),Ld(o,r,n),i.head.appendChild(o);break;case`meta`:if(s=Uf(`meta`,`content`,i).get(r+(n.content||``))){for(c=0;c<s.length;c++)if(o=s[c],o.getAttribute(`content`)===(n.content==null?null:``+n.content)&&o.getAttribute(`name`)===(n.name==null?null:n.name)&&o.getAttribute(`property`)===(n.property==null?null:n.property)&&o.getAttribute(`http-equiv`)===(n.httpEquiv==null?null:n.httpEquiv)&&o.getAttribute(`charset`)===(n.charSet==null?null:n.charSet)){s.splice(c,1);break b}}o=i.createElement(r),Ld(o,r,n),i.head.appendChild(o);break;default:throw Error(a(468,r))}o[lt]=e,F(o),r=o}e.stateNode=r}else Wf(i,e.type,e.stateNode);else e.stateNode=Rf(i,r,e.memoizedProps);else o===r?r===null&&e.stateNode!==null&&Jc(e,e.memoizedProps,n.memoizedProps):(o===null?n.stateNode!==null&&(n=n.stateNode,n.parentNode.removeChild(n)):o.count--,r===null?Wf(i,e.type,e.stateNode):Rf(i,r,e.memoizedProps))}break;case 27:gl(t,e),yl(e),r&512&&(tl||n===null||Kc(n,n.return)),n!==null&&r&4&&Jc(e,e.memoizedProps,n.memoizedProps);break;case 5:if(gl(t,e),yl(e),r&512&&(tl||n===null||Kc(n,n.return)),e.flags&32){i=e.stateNode;try{qt(i,``)}catch(t){qu(e,e.return,t)}}r&4&&e.stateNode!=null&&(i=e.memoizedProps,Jc(e,i,n===null?i:n.memoizedProps)),r&1024&&(nl=!0);break;case 6:if(gl(t,e),yl(e),r&4){if(e.stateNode===null)throw Error(a(162));r=e.memoizedProps,n=e.stateNode;try{n.nodeValue=r}catch(t){qu(e,e.return,t)}}break;case 3:if(Hf=null,i=_l,_l=vf(t.containerInfo),gl(t,e),_l=i,yl(e),r&4&&n!==null&&n.memoizedState.isDehydrated)try{Fp(t.containerInfo)}catch(t){qu(e,e.return,t)}nl&&(nl=!1,bl(e));break;case 4:r=_l,_l=vf(e.stateNode.containerInfo),gl(t,e),yl(e),_l=r;break;case 12:gl(t,e),yl(e);break;case 31:gl(t,e),yl(e),r&4&&(r=e.updateQueue,r!==null&&(e.updateQueue=null,hl(e,r)));break;case 13:gl(t,e),yl(e),e.child.flags&8192&&e.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&(tu=ke()),r&4&&(r=e.updateQueue,r!==null&&(e.updateQueue=null,hl(e,r)));break;case 22:i=e.memoizedState!==null;var l=n!==null&&n.memoizedState!==null,u=el,d=tl;if(el=u||i,tl=d||l,gl(t,e),tl=d,el=u,yl(e),r&8192)a:for(t=e.stateNode,t._visibility=i?t._visibility&-2:t._visibility|1,i&&(n===null||l||el||tl||Sl(e)),n=null,t=e;;){if(t.tag===5||t.tag===26){if(n===null){l=n=t;try{if(o=l.stateNode,i)s=o.style,typeof s.setProperty==`function`?s.setProperty(`display`,`none`,`important`):s.display=`none`;else{c=l.stateNode;var f=l.memoizedProps.style,p=f!=null&&f.hasOwnProperty(`display`)?f.display:null;c.style.display=p==null||typeof p==`boolean`?``:(``+p).trim()}}catch(e){qu(l,l.return,e)}}}else if(t.tag===6){if(n===null){l=t;try{l.stateNode.nodeValue=i?``:l.memoizedProps}catch(e){qu(l,l.return,e)}}}else if(t.tag===18){if(n===null){l=t;try{var m=l.stateNode;i?nf(m,!0):nf(l.stateNode,!1)}catch(e){qu(l,l.return,e)}}}else if((t.tag!==22&&t.tag!==23||t.memoizedState===null||t===e)&&t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break a;for(;t.sibling===null;){if(t.return===null||t.return===e)break a;n===t&&(n=null),t=t.return}n===t&&(n=null),t.sibling.return=t.return,t=t.sibling}r&4&&(r=e.updateQueue,r!==null&&(n=r.retryQueue,n!==null&&(r.retryQueue=null,hl(e,n))));break;case 19:gl(t,e),yl(e),r&4&&(r=e.updateQueue,r!==null&&(e.updateQueue=null,hl(e,r)));break;case 30:break;case 21:break;default:gl(t,e),yl(e)}}function yl(e){var t=e.flags;if(t&2){try{for(var n,r=e.return;r!==null;){if(Yc(r)){n=r;break}r=r.return}if(n==null)throw Error(a(160));switch(n.tag){case 27:var i=n.stateNode;Qc(e,Xc(e),i);break;case 5:var o=n.stateNode;n.flags&32&&(qt(o,``),n.flags&=-33),Qc(e,Xc(e),o);break;case 3:case 4:var s=n.stateNode.containerInfo;Zc(e,Xc(e),s);break;default:throw Error(a(161))}}catch(t){qu(e,e.return,t)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function bl(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;bl(t),t.tag===5&&t.flags&1024&&t.stateNode.reset(),e=e.sibling}}function xl(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)ol(e,t.alternate,t),t=t.sibling}function Sl(e){for(e=e.child;e!==null;){var t=e;switch(t.tag){case 0:case 11:case 14:case 15:Hc(4,t,t.return),Sl(t);break;case 1:Kc(t,t.return);var n=t.stateNode;typeof n.componentWillUnmount==`function`&&Wc(t,t.return,n),Sl(t);break;case 27:hf(t.stateNode);case 26:case 5:Kc(t,t.return),Sl(t);break;case 22:t.memoizedState===null&&Sl(t);break;case 30:Sl(t);break;default:Sl(t)}e=e.sibling}}function Cl(e,t,n){for(n&&=(t.subtreeFlags&8772)!=0,t=t.child;t!==null;){var r=t.alternate,i=e,a=t,o=a.flags;switch(a.tag){case 0:case 11:case 15:Cl(i,a,n),Vc(4,a);break;case 1:if(Cl(i,a,n),r=a,i=r.stateNode,typeof i.componentDidMount==`function`)try{i.componentDidMount()}catch(e){qu(r,r.return,e)}if(r=a,i=r.updateQueue,i!==null){var s=r.stateNode;try{var c=i.shared.hiddenCallbacks;if(c!==null)for(i.shared.hiddenCallbacks=null,i=0;i<c.length;i++)qa(c[i],s)}catch(e){qu(r,r.return,e)}}n&&o&64&&Uc(a),Gc(a,a.return);break;case 27:$c(a);case 26:case 5:Cl(i,a,n),n&&r===null&&o&4&&qc(a),Gc(a,a.return);break;case 12:Cl(i,a,n);break;case 31:Cl(i,a,n),n&&o&4&&fl(i,a);break;case 13:Cl(i,a,n),n&&o&4&&pl(i,a);break;case 22:a.memoizedState===null&&Cl(i,a,n),Gc(a,a.return);break;case 30:break;default:Cl(i,a,n)}t=t.sibling}}function wl(e,t){var n=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==n&&(e!=null&&e.refCount++,n!=null&&H(n))}function Tl(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&H(e))}function El(e,t,n,r){if(t.subtreeFlags&10256)for(t=t.child;t!==null;)Dl(e,t,n,r),t=t.sibling}function Dl(e,t,n,r){var i=t.flags;switch(t.tag){case 0:case 11:case 15:El(e,t,n,r),i&2048&&Vc(9,t);break;case 1:El(e,t,n,r);break;case 3:El(e,t,n,r),i&2048&&(e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&H(e)));break;case 12:if(i&2048){El(e,t,n,r),e=t.stateNode;try{var a=t.memoizedProps,o=a.id,s=a.onPostCommit;typeof s==`function`&&s(o,t.alternate===null?`mount`:`update`,e.passiveEffectDuration,-0)}catch(e){qu(t,t.return,e)}}else El(e,t,n,r);break;case 31:El(e,t,n,r);break;case 13:El(e,t,n,r);break;case 23:break;case 22:a=t.stateNode,o=t.alternate,t.memoizedState===null?a._visibility&2?El(e,t,n,r):(a._visibility|=2,Ol(e,t,n,r,(t.subtreeFlags&10256)!=0||!1)):a._visibility&2?El(e,t,n,r):kl(e,t),i&2048&&wl(o,t);break;case 24:El(e,t,n,r),i&2048&&Tl(t.alternate,t);break;default:El(e,t,n,r)}}function Ol(e,t,n,r,i){for(i&&=(t.subtreeFlags&10256)!=0||!1,t=t.child;t!==null;){var a=e,o=t,s=n,c=r,l=o.flags;switch(o.tag){case 0:case 11:case 15:Ol(a,o,s,c,i),Vc(8,o);break;case 23:break;case 22:var u=o.stateNode;o.memoizedState===null?(u._visibility|=2,Ol(a,o,s,c,i)):u._visibility&2?Ol(a,o,s,c,i):kl(a,o),i&&l&2048&&wl(o.alternate,o);break;case 24:Ol(a,o,s,c,i),i&&l&2048&&Tl(o.alternate,o);break;default:Ol(a,o,s,c,i)}t=t.sibling}}function kl(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var n=e,r=t,i=r.flags;switch(r.tag){case 22:kl(n,r),i&2048&&wl(r.alternate,r);break;case 24:kl(n,r),i&2048&&Tl(r.alternate,r);break;default:kl(n,r)}t=t.sibling}}var Al=8192;function jl(e,t,n){if(e.subtreeFlags&Al)for(e=e.child;e!==null;)Ml(e,t,n),e=e.sibling}function Ml(e,t,n){switch(e.tag){case 26:jl(e,t,n),e.flags&Al&&e.memoizedState!==null&&qf(n,_l,e.memoizedState,e.memoizedProps);break;case 5:jl(e,t,n);break;case 3:case 4:var r=_l;_l=vf(e.stateNode.containerInfo),jl(e,t,n),_l=r;break;case 22:e.memoizedState===null&&(r=e.alternate,r!==null&&r.memoizedState!==null?(r=Al,Al=16777216,jl(e,t,n),Al=r):jl(e,t,n));break;default:jl(e,t,n)}}function Nl(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function Pl(e){var t=e.deletions;if(e.flags&16){if(t!==null)for(var n=0;n<t.length;n++){var r=t[n];il=r,Ll(r,e)}Nl(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)Fl(e),e=e.sibling}function Fl(e){switch(e.tag){case 0:case 11:case 15:Pl(e),e.flags&2048&&Hc(9,e,e.return);break;case 3:Pl(e);break;case 12:Pl(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,Il(e)):Pl(e);break;default:Pl(e)}}function Il(e){var t=e.deletions;if(e.flags&16){if(t!==null)for(var n=0;n<t.length;n++){var r=t[n];il=r,Ll(r,e)}Nl(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:Hc(8,t,t.return),Il(t);break;case 22:n=t.stateNode,n._visibility&2&&(n._visibility&=-3,Il(t));break;default:Il(t)}e=e.sibling}}function Ll(e,t){for(;il!==null;){var n=il;switch(n.tag){case 0:case 11:case 15:Hc(8,n,t);break;case 23:case 22:if(n.memoizedState!==null&&n.memoizedState.cachePool!==null){var r=n.memoizedState.cachePool.pool;r!=null&&r.refCount++}break;case 24:H(n.memoizedState.cache)}if(r=n.child,r!==null)r.return=n,il=r;else a:for(n=e;il!==null;){r=il;var i=r.sibling,a=r.return;if(sl(r),r===n){il=null;break a}if(i!==null){i.return=a,il=i;break a}il=a}}}var Rl={getCacheForType:function(e){var t=ta(aa),n=t.data.get(e);return n===void 0&&(n=e(),t.data.set(e,n)),n},cacheSignal:function(){return ta(aa).controller.signal}},zl=typeof WeakMap==`function`?WeakMap:Map,G=0,K=null,q=null,J=0,Bl=0,Vl=null,Hl=!1,Ul=!1,Wl=!1,Gl=0,Kl=0,ql=0,Jl=0,Yl=0,Xl=0,Zl=0,Ql=null,$l=null,eu=!1,tu=0,nu=0,ru=1/0,iu=null,au=null,ou=0,su=null,cu=null,lu=0,uu=0,du=null,fu=null,pu=0,mu=null;function hu(){return G&2&&J!==0?J&-J:k.T===null?ot():md()}function gu(){if(Xl===0)if(!(J&536870912)||z){var e=Ge;Ge<<=1,!(Ge&3932160)&&(Ge=262144),Xl=e}else Xl=536870912;return e=eo.current,e!==null&&(e.flags|=32),Xl}function _u(e,t,n){(e===K&&(Bl===2||Bl===9)||e.cancelPendingCommit!==null)&&(wu(e,0),xu(e,J,Xl,!1)),$e(e,n),(!(G&2)||e!==K)&&(e===K&&(!(G&2)&&(Jl|=n),Kl===4&&xu(e,J,Xl,!1)),od(e))}function vu(e,t,n){if(G&6)throw Error(a(327));var r=!n&&(t&127)==0&&(t&e.expiredLanes)===0||Ye(e,t),i=r?Mu(e,t):Au(e,t,!0),o=r;do{if(i===0){Ul&&!r&&xu(e,t,0,!1);break}else{if(n=e.current.alternate,o&&!bu(n)){i=Au(e,t,!1),o=!1;continue}if(i===2){if(o=t,e.errorRecoveryDisabledLanes&o)var s=0;else s=e.pendingLanes&-536870913,s=s===0?s&536870912?536870912:0:s;if(s!==0){t=s;a:{var c=e;i=Ql;var l=c.current.memoizedState.isDehydrated;if(l&&(wu(c,s).flags|=256),s=Au(c,s,!1),s!==2){if(Wl&&!l){c.errorRecoveryDisabledLanes|=o,Jl|=o,i=4;break a}o=$l,$l=i,o!==null&&($l===null?$l=o:$l.push.apply($l,o))}i=s}if(o=!1,i!==2)continue}}if(i===1){wu(e,0),xu(e,t,0,!0);break}a:{switch(r=e,o=i,o){case 0:case 1:throw Error(a(345));case 4:if((t&4194048)!==t)break;case 6:xu(r,t,Xl,!Hl);break a;case 2:$l=null;break;case 3:case 5:break;default:throw Error(a(329))}if((t&62914560)===t&&(i=tu+300-ke(),10<i)){if(xu(r,t,Xl,!Hl),Je(r,0,!0)!==0)break a;lu=t,r.timeoutHandle=Yd(yu.bind(null,r,n,$l,iu,eu,t,Xl,Jl,Zl,Hl,o,`Throttled`,-0,0),i);break a}yu(r,n,$l,iu,eu,t,Xl,Jl,Zl,Hl,o,null,-0,0)}}break}while(1);od(e)}function yu(e,t,n,r,i,a,o,s,c,l,u,d,f,p){if(e.timeoutHandle=-1,d=t.subtreeFlags,d&8192||(d&16785408)==16785408){d={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:tn},Ml(t,a,d);var m=(a&62914560)===a?tu-ke():(a&4194048)===a?nu-ke():0;if(m=Yf(d,m),m!==null){lu=a,e.cancelPendingCommit=m(zu.bind(null,e,t,a,n,r,i,o,s,c,u,d,null,f,p)),xu(e,a,o,!l);return}}zu(e,t,a,n,r,i,o,s,c)}function bu(e){for(var t=e;;){var n=t.tag;if((n===0||n===11||n===15)&&t.flags&16384&&(n=t.updateQueue,n!==null&&(n=n.stores,n!==null)))for(var r=0;r<n.length;r++){var i=n[r],a=i.getSnapshot;i=i.value;try{if(!Cr(a(),i))return!1}catch{return!1}}if(n=t.child,t.subtreeFlags&16384&&n!==null)n.return=t,t=n;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function xu(e,t,n,r){t&=~Yl,t&=~Jl,e.suspendedLanes|=t,e.pingedLanes&=~t,r&&(e.warmLanes|=t),r=e.expirationTimes;for(var i=t;0<i;){var a=31-Be(i),o=1<<a;r[a]=-1,i&=~o}n!==0&&tt(e,n,t)}function Su(){return G&6?!0:(sd(0,!1),!1)}function Cu(){if(q!==null){if(Bl===0)var e=q.return;else e=q,qi=Ki=null,Oo(e),ka=null,Aa=0,e=q;for(;e!==null;)Bc(e.alternate,e),e=e.return;q=null}}function wu(e,t){var n=e.timeoutHandle;n!==-1&&(e.timeoutHandle=-1,Xd(n)),n=e.cancelPendingCommit,n!==null&&(e.cancelPendingCommit=null,n()),lu=0,Cu(),K=e,q=n=ui(e.current,null),J=t,Bl=0,Vl=null,Hl=!1,Ul=Ye(e,t),Wl=!1,Zl=Xl=Yl=Jl=ql=Kl=0,$l=Ql=null,eu=!1,t&8&&(t|=t&32);var r=e.entangledLanes;if(r!==0)for(e=e.entanglements,r&=t;0<r;){var i=31-Be(r),a=1<<i;t|=e[i],r&=~a}return Gl=t,ei(),n}function Tu(e,t){U=null,k.H=Ls,t===ya||t===xa?(t=Da(),Bl=3):t===ba?(t=Da(),Bl=4):Bl=t===tc?8:typeof t==`object`&&t&&typeof t.then==`function`?6:1,Vl=t,q===null&&(Kl=1,Ys(e,vi(t,e.current)))}function Eu(){var e=eo.current;return e===null?!0:(J&4194048)===J?to===null:(J&62914560)===J||J&536870912?e===to:!1}function Du(){var e=k.H;return k.H=Ls,e===null?Ls:e}function Ou(){var e=k.A;return k.A=Rl,e}function ku(){Kl=4,Hl||(J&4194048)!==J&&eo.current!==null||(Ul=!0),!(ql&134217727)&&!(Jl&134217727)||K===null||xu(K,J,Xl,!1)}function Au(e,t,n){var r=G;G|=2;var i=Du(),a=Ou();(K!==e||J!==t)&&(iu=null,wu(e,t)),t=!1;var o=Kl;a:do try{if(Bl!==0&&q!==null){var s=q,c=Vl;switch(Bl){case 8:Cu(),o=6;break a;case 3:case 2:case 9:case 6:eo.current===null&&(t=!0);var l=Bl;if(Bl=0,Vl=null,Iu(e,s,c,l),n&&Ul){o=0;break a}break;default:l=Bl,Bl=0,Vl=null,Iu(e,s,c,l)}}ju(),o=Kl;break}catch(t){Tu(e,t)}while(1);return t&&e.shellSuspendCounter++,qi=Ki=null,G=r,k.H=i,k.A=a,q===null&&(K=null,J=0,ei()),o}function ju(){for(;q!==null;)Pu(q)}function Mu(e,t){var n=G;G|=2;var r=Du(),i=Ou();K!==e||J!==t?(iu=null,ru=ke()+500,wu(e,t)):Ul=Ye(e,t);a:do try{if(Bl!==0&&q!==null){t=q;var o=Vl;b:switch(Bl){case 1:Bl=0,Vl=null,Iu(e,t,o,1);break;case 2:case 9:if(Ca(o)){Bl=0,Vl=null,Fu(t);break}t=function(){Bl!==2&&Bl!==9||K!==e||(Bl=7),od(e)},o.then(t,t);break a;case 3:Bl=7;break a;case 4:Bl=5;break a;case 7:Ca(o)?(Bl=0,Vl=null,Fu(t)):(Bl=0,Vl=null,Iu(e,t,o,7));break;case 5:var s=null;switch(q.tag){case 26:s=q.memoizedState;case 5:case 27:var c=q;if(s?Kf(s):c.stateNode.complete){Bl=0,Vl=null;var l=c.sibling;if(l!==null)q=l;else{var u=c.return;u===null?q=null:(q=u,Lu(u))}break b}}Bl=0,Vl=null,Iu(e,t,o,5);break;case 6:Bl=0,Vl=null,Iu(e,t,o,6);break;case 8:Cu(),Kl=6;break a;default:throw Error(a(462))}}Nu();break}catch(t){Tu(e,t)}while(1);return qi=Ki=null,k.H=r,k.A=i,G=n,q===null?(K=null,J=0,ei(),Kl):0}function Nu(){for(;q!==null&&!De();)Pu(q)}function Pu(e){var t=jc(e.alternate,e,Gl);e.memoizedProps=e.pendingProps,t===null?Lu(e):q=t}function Fu(e){var t=e,n=t.alternate;switch(t.tag){case 15:case 0:t=hc(n,t,t.pendingProps,t.type,void 0,J);break;case 11:t=hc(n,t,t.pendingProps,t.type.render,t.ref,J);break;case 5:Oo(t);default:Bc(n,t),t=q=di(t,Gl),t=jc(n,t,Gl)}e.memoizedProps=e.pendingProps,t===null?Lu(e):q=t}function Iu(e,t,n,r){qi=Ki=null,Oo(t),ka=null,Aa=0;var i=t.return;try{if(ec(e,i,t,n,J)){Kl=1,Ys(e,vi(n,e.current)),q=null;return}}catch(t){if(i!==null)throw q=i,t;Kl=1,Ys(e,vi(n,e.current)),q=null;return}t.flags&32768?(z||r===1?e=!0:Ul||J&536870912?e=!1:(Hl=e=!0,(r===2||r===9||r===3||r===6)&&(r=eo.current,r!==null&&r.tag===13&&(r.flags|=16384))),Ru(t,e)):Lu(t)}function Lu(e){var t=e;do{if(t.flags&32768){Ru(t,Hl);return}e=t.return;var n=Rc(t.alternate,t,Gl);if(n!==null){q=n;return}if(t=t.sibling,t!==null){q=t;return}q=t=e}while(t!==null);Kl===0&&(Kl=5)}function Ru(e,t){do{var n=zc(e.alternate,e);if(n!==null){n.flags&=32767,q=n;return}if(n=e.return,n!==null&&(n.flags|=32768,n.subtreeFlags=0,n.deletions=null),!t&&(e=e.sibling,e!==null)){q=e;return}q=e=n}while(e!==null);Kl=6,q=null}function zu(e,t,n,r,i,o,s,c,l){e.cancelPendingCommit=null;do Wu();while(ou!==0);if(G&6)throw Error(a(327));if(t!==null){if(t===e.current)throw Error(a(177));if(o=t.lanes|t.childLanes,o|=$r,et(e,n,o,s,c,l),e===K&&(q=K=null,J=0),cu=t,su=e,lu=n,uu=o,du=i,fu=r,t.subtreeFlags&10256||t.flags&10256?(e.callbackNode=null,e.callbackPriority=0,$u(Ne,function(){return Gu(),null})):(e.callbackNode=null,e.callbackPriority=0),r=(t.flags&13878)!=0,t.subtreeFlags&13878||r){r=k.T,k.T=null,i=A.p,A.p=2,s=G,G|=4;try{al(e,t,n)}finally{G=s,A.p=i,k.T=r}}ou=1,Bu(),Vu(),Hu()}}function Bu(){if(ou===1){ou=0;var e=su,t=cu,n=(t.flags&13878)!=0;if(t.subtreeFlags&13878||n){n=k.T,k.T=null;var r=A.p;A.p=2;var i=G;G|=4;try{vl(t,e);var a=Hd,o=Or(e.containerInfo),s=a.focusedElem,c=a.selectionRange;if(o!==s&&s&&s.ownerDocument&&Dr(s.ownerDocument.documentElement,s)){if(c!==null&&R(s)){var l=c.start,u=c.end;if(u===void 0&&(u=l),`selectionStart`in s)s.selectionStart=l,s.selectionEnd=Math.min(u,s.value.length);else{var d=s.ownerDocument||document,f=d&&d.defaultView||window;if(f.getSelection){var p=f.getSelection(),m=s.textContent.length,h=Math.min(c.start,m),g=c.end===void 0?h:Math.min(c.end,m);!p.extend&&h>g&&(o=g,g=h,h=o);var _=Er(s,h),v=Er(s,g);if(_&&v&&(p.rangeCount!==1||p.anchorNode!==_.node||p.anchorOffset!==_.offset||p.focusNode!==v.node||p.focusOffset!==v.offset)){var y=d.createRange();y.setStart(_.node,_.offset),p.removeAllRanges(),h>g?(p.addRange(y),p.extend(v.node,v.offset)):(y.setEnd(v.node,v.offset),p.addRange(y))}}}}for(d=[],p=s;p=p.parentNode;)p.nodeType===1&&d.push({element:p,left:p.scrollLeft,top:p.scrollTop});for(typeof s.focus==`function`&&s.focus(),s=0;s<d.length;s++){var b=d[s];b.element.scrollLeft=b.left,b.element.scrollTop=b.top}}lp=!!Vd,Hd=Vd=null}finally{G=i,A.p=r,k.T=n}}e.current=t,ou=2}}function Vu(){if(ou===2){ou=0;var e=su,t=cu,n=(t.flags&8772)!=0;if(t.subtreeFlags&8772||n){n=k.T,k.T=null;var r=A.p;A.p=2;var i=G;G|=4;try{ol(e,t.alternate,t)}finally{G=i,A.p=r,k.T=n}}ou=3}}function Hu(){if(ou===4||ou===3){ou=0,Oe();var e=su,t=cu,n=lu,r=fu;t.subtreeFlags&10256||t.flags&10256?ou=5:(ou=0,cu=su=null,Uu(e,e.pendingLanes));var i=e.pendingLanes;if(i===0&&(au=null),at(n),t=t.stateNode,Re&&typeof Re.onCommitFiberRoot==`function`)try{Re.onCommitFiberRoot(Le,t,void 0,(t.current.flags&128)==128)}catch{}if(r!==null){t=k.T,i=A.p,A.p=2,k.T=null;try{for(var a=e.onRecoverableError,o=0;o<r.length;o++){var s=r[o];a(s.value,{componentStack:s.stack})}}finally{k.T=t,A.p=i}}lu&3&&Wu(),od(e),i=e.pendingLanes,n&261930&&i&42?e===mu?pu++:(pu=0,mu=e):pu=0,sd(0,!1)}}function Uu(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,H(t)))}function Wu(){return Bu(),Vu(),Hu(),Gu()}function Gu(){if(ou!==5)return!1;var e=su,t=uu;uu=0;var n=at(lu),r=k.T,i=A.p;try{A.p=32>n?32:n,k.T=null,n=du,du=null;var o=su,s=lu;if(ou=0,cu=su=null,lu=0,G&6)throw Error(a(331));var c=G;if(G|=4,Fl(o.current),Dl(o,o.current,s,n),G=c,sd(0,!1),Re&&typeof Re.onPostCommitFiberRoot==`function`)try{Re.onPostCommitFiberRoot(Le,o)}catch{}return!0}finally{A.p=i,k.T=r,Uu(e,t)}}function Ku(e,t,n){t=vi(n,t),t=Zs(e.stateNode,t,2),e=Va(e,t,2),e!==null&&($e(e,2),od(e))}function qu(e,t,n){if(e.tag===3)Ku(e,e,n);else for(;t!==null;){if(t.tag===3){Ku(t,e,n);break}else if(t.tag===1){var r=t.stateNode;if(typeof t.type.getDerivedStateFromError==`function`||typeof r.componentDidCatch==`function`&&(au===null||!au.has(r))){e=vi(n,e),n=Qs(2),r=Va(t,n,2),r!==null&&($s(n,r,t,e),$e(r,2),od(r));break}}t=t.return}}function Ju(e,t,n){var r=e.pingCache;if(r===null){r=e.pingCache=new zl;var i=new Set;r.set(t,i)}else i=r.get(t),i===void 0&&(i=new Set,r.set(t,i));i.has(n)||(Wl=!0,i.add(n),e=Yu.bind(null,e,t,n),t.then(e,e))}function Yu(e,t,n){var r=e.pingCache;r!==null&&r.delete(t),e.pingedLanes|=e.suspendedLanes&n,e.warmLanes&=~n,K===e&&(J&n)===n&&(Kl===4||Kl===3&&(J&62914560)===J&&300>ke()-tu?!(G&2)&&wu(e,0):Yl|=n,Zl===J&&(Zl=0)),od(e)}function Xu(e,t){t===0&&(t=Ze()),e=ri(e,t),e!==null&&($e(e,t),od(e))}function Zu(e){var t=e.memoizedState,n=0;t!==null&&(n=t.retryLane),Xu(e,n)}function Qu(e,t){var n=0;switch(e.tag){case 31:case 13:var r=e.stateNode,i=e.memoizedState;i!==null&&(n=i.retryLane);break;case 19:r=e.stateNode;break;case 22:r=e.stateNode._retryCache;break;default:throw Error(a(314))}r!==null&&r.delete(t),Xu(e,n)}function $u(e,t){return Te(e,t)}var ed=null,td=null,nd=!1,rd=!1,id=!1,ad=0;function od(e){e!==td&&e.next===null&&(td===null?ed=td=e:td=td.next=e),rd=!0,nd||(nd=!0,pd())}function sd(e,t){if(!id&&rd){id=!0;do for(var n=!1,r=ed;r!==null;){if(!t)if(e!==0){var i=r.pendingLanes;if(i===0)var a=0;else{var o=r.suspendedLanes,s=r.pingedLanes;a=(1<<31-Be(42|e)+1)-1,a&=i&~(o&~s),a=a&201326741?a&201326741|1:a?a|2:0}a!==0&&(n=!0,fd(r,a))}else a=J,a=Je(r,r===K?a:0,r.cancelPendingCommit!==null||r.timeoutHandle!==-1),!(a&3)||Ye(r,a)||(n=!0,fd(r,a));r=r.next}while(n);id=!1}}function cd(){ld()}function ld(){rd=nd=!1;var e=0;ad!==0&&Jd()&&(e=ad);for(var t=ke(),n=null,r=ed;r!==null;){var i=r.next,a=ud(r,t);a===0?(r.next=null,n===null?ed=i:n.next=i,i===null&&(td=n)):(n=r,(e!==0||a&3)&&(rd=!0)),r=i}ou!==0&&ou!==5||sd(e,!1),ad!==0&&(ad=0)}function ud(e,t){for(var n=e.suspendedLanes,r=e.pingedLanes,i=e.expirationTimes,a=e.pendingLanes&-62914561;0<a;){var o=31-Be(a),s=1<<o,c=i[o];c===-1?((s&n)===0||(s&r)!==0)&&(i[o]=Xe(s,t)):c<=t&&(e.expiredLanes|=s),a&=~s}if(t=K,n=J,n=Je(e,e===t?n:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),r=e.callbackNode,n===0||e===t&&(Bl===2||Bl===9)||e.cancelPendingCommit!==null)return r!==null&&r!==null&&Ee(r),e.callbackNode=null,e.callbackPriority=0;if(!(n&3)||Ye(e,n)){if(t=n&-n,t===e.callbackPriority)return t;switch(r!==null&&Ee(r),at(n)){case 2:case 8:n=Me;break;case 32:n=Ne;break;case 268435456:n=Fe;break;default:n=Ne}return r=dd.bind(null,e),n=Te(n,r),e.callbackPriority=t,e.callbackNode=n,t}return r!==null&&r!==null&&Ee(r),e.callbackPriority=2,e.callbackNode=null,2}function dd(e,t){if(ou!==0&&ou!==5)return e.callbackNode=null,e.callbackPriority=0,null;var n=e.callbackNode;if(Wu()&&e.callbackNode!==n)return null;var r=J;return r=Je(e,e===K?r:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),r===0?null:(vu(e,r,t),ud(e,ke()),e.callbackNode!=null&&e.callbackNode===n?dd.bind(null,e):null)}function fd(e,t){if(Wu())return null;vu(e,t,!0)}function pd(){Qd(function(){G&6?Te(je,cd):ld()})}function md(){if(ad===0){var e=la;e===0&&(e=We,We<<=1,!(We&261888)&&(We=256)),ad=e}return ad}function hd(e){return e==null||typeof e==`symbol`||typeof e==`boolean`?null:typeof e==`function`?e:en(``+e)}function gd(e,t){var n=t.ownerDocument.createElement(`input`);return n.name=t.name,n.value=t.value,e.id&&n.setAttribute(`form`,e.id),t.parentNode.insertBefore(n,t),e=new FormData(e),n.parentNode.removeChild(n),e}function _d(e,t,n,r,i){if(t===`submit`&&n&&n.stateNode===i){var a=hd((i[ut]||null).action),o=r.submitter;o&&(t=(t=o[ut]||null)?hd(t.formAction):o.getAttribute(`formAction`),t!==null&&(a=t,o=null));var s=new Cn(`action`,`action`,null,r,i);e.push({event:s,listeners:[{instance:null,listener:function(){if(r.defaultPrevented){if(ad!==0){var e=o?gd(i,o):new FormData(i);Cs(n,{pending:!0,data:e,method:i.method,action:a},null,e)}}else typeof a==`function`&&(s.preventDefault(),e=o?gd(i,o):new FormData(i),Cs(n,{pending:!0,data:e,method:i.method,action:a},a,e))},currentTarget:i}]})}}for(var vd=0;vd<Jr.length;vd++){var yd=Jr[vd];Yr(yd.toLowerCase(),`on`+(yd[0].toUpperCase()+yd.slice(1)))}Yr(Br,`onAnimationEnd`),Yr(Vr,`onAnimationIteration`),Yr(Hr,`onAnimationStart`),Yr(`dblclick`,`onDoubleClick`),Yr(`focusin`,`onFocus`),Yr(`focusout`,`onBlur`),Yr(Ur,`onTransitionRun`),Yr(Wr,`onTransitionStart`),Yr(Gr,`onTransitionCancel`),Yr(Kr,`onTransitionEnd`),Tt(`onMouseEnter`,[`mouseout`,`mouseover`]),Tt(`onMouseLeave`,[`mouseout`,`mouseover`]),Tt(`onPointerEnter`,[`pointerout`,`pointerover`]),Tt(`onPointerLeave`,[`pointerout`,`pointerover`]),I(`onChange`,`change click focusin focusout input keydown keyup selectionchange`.split(` `)),I(`onSelect`,`focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange`.split(` `)),I(`onBeforeInput`,[`compositionend`,`keypress`,`textInput`,`paste`]),I(`onCompositionEnd`,`compositionend focusout keydown keypress keyup mousedown`.split(` `)),I(`onCompositionStart`,`compositionstart focusout keydown keypress keyup mousedown`.split(` `)),I(`onCompositionUpdate`,`compositionupdate focusout keydown keypress keyup mousedown`.split(` `));var bd=`abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting`.split(` `),xd=new Set(`beforetoggle cancel close invalid load scroll scrollend toggle`.split(` `).concat(bd));function Sd(e,t){t=(t&4)!=0;for(var n=0;n<e.length;n++){var r=e[n],i=r.event;r=r.listeners;a:{var a=void 0;if(t)for(var o=r.length-1;0<=o;o--){var s=r[o],c=s.instance,l=s.currentTarget;if(s=s.listener,c!==a&&i.isPropagationStopped())break a;a=s,i.currentTarget=l;try{a(i)}catch(e){Xr(e)}i.currentTarget=null,a=c}else for(o=0;o<r.length;o++){if(s=r[o],c=s.instance,l=s.currentTarget,s=s.listener,c!==a&&i.isPropagationStopped())break a;a=s,i.currentTarget=l;try{a(i)}catch(e){Xr(e)}i.currentTarget=null,a=c}}}}function Y(e,t){var n=t[ft];n===void 0&&(n=t[ft]=new Set);var r=e+`__bubble`;n.has(r)||(Ed(t,e,2,!1),n.add(r))}function Cd(e,t,n){var r=0;t&&(r|=4),Ed(n,e,r,t)}var wd=`_reactListening`+Math.random().toString(36).slice(2);function Td(e){if(!e[wd]){e[wd]=!0,Ct.forEach(function(t){t!==`selectionchange`&&(xd.has(t)||Cd(t,!1,e),Cd(t,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[wd]||(t[wd]=!0,Cd(`selectionchange`,!1,t))}}function Ed(e,t,n,r){switch(gp(t)){case 2:var i=up;break;case 8:i=dp;break;default:i=fp}n=i.bind(null,t,n,e),i=void 0,!fn||t!==`touchstart`&&t!==`touchmove`&&t!==`wheel`||(i=!0),r?i===void 0?e.addEventListener(t,n,!0):e.addEventListener(t,n,{capture:!0,passive:i}):i===void 0?e.addEventListener(t,n,!1):e.addEventListener(t,n,{passive:i})}function Dd(e,t,n,r,i){var a=r;if(!(t&1)&&!(t&2)&&r!==null)a:for(;;){if(r===null)return;var o=r.tag;if(o===3||o===4){var c=r.stateNode.containerInfo;if(c===i)break;if(o===4)for(o=r.return;o!==null;){var l=o.tag;if((l===3||l===4)&&o.stateNode.containerInfo===i)return;o=o.return}for(;c!==null;){if(o=vt(c),o===null)return;if(l=o.tag,l===5||l===6||l===26||l===27){r=a=o;continue a}c=c.parentNode}}r=r.return}ln(function(){var r=a,i=rn(n),o=[];a:{var c=qr.get(e);if(c!==void 0){var l=Cn,u=e;switch(e){case`keypress`:if(vn(n)===0)break a;case`keydown`:case`keyup`:l=Bn;break;case`focusin`:u=`focus`,l=Mn;break;case`focusout`:u=`blur`,l=Mn;break;case`beforeblur`:case`afterblur`:l=Mn;break;case`click`:if(n.button===2)break a;case`auxclick`:case`dblclick`:case`mousedown`:case`mousemove`:case`mouseup`:case`mouseout`:case`mouseover`:case`contextmenu`:l=An;break;case`drag`:case`dragend`:case`dragenter`:case`dragexit`:case`dragleave`:case`dragover`:case`dragstart`:case`drop`:l=jn;break;case`touchcancel`:case`touchend`:case`touchmove`:case`touchstart`:l=Hn;break;case Br:case Vr:case Hr:l=L;break;case Kr:l=Un;break;case`scroll`:case`scrollend`:l=Tn;break;case`wheel`:l=Wn;break;case`copy`:case`cut`:case`paste`:l=Nn;break;case`gotpointercapture`:case`lostpointercapture`:case`pointercancel`:case`pointerdown`:case`pointermove`:case`pointerout`:case`pointerover`:case`pointerup`:l=Vn;break;case`toggle`:case`beforetoggle`:l=Gn}var d=(t&4)!=0,f=!d&&(e===`scroll`||e===`scrollend`),p=d?c===null?null:c+`Capture`:c;d=[];for(var m=r,h;m!==null;){var g=m;if(h=g.stateNode,g=g.tag,g!==5&&g!==26&&g!==27||h===null||p===null||(g=un(m,p),g!=null&&d.push(Od(m,g,h))),f)break;m=m.return}0<d.length&&(c=new l(c,u,null,n,i),o.push({event:c,listeners:d}))}}if(!(t&7)){a:{if(c=e===`mouseover`||e===`pointerover`,l=e===`mouseout`||e===`pointerout`,c&&n!==nn&&(u=n.relatedTarget||n.fromElement)&&(vt(u)||u[dt]))break a;if((l||c)&&(c=i.window===i?i:(c=i.ownerDocument)?c.defaultView||c.parentWindow:window,l?(u=n.relatedTarget||n.toElement,l=r,u=u?vt(u):null,u!==null&&(f=s(u),d=u.tag,u!==f||d!==5&&d!==27&&d!==6)&&(u=null)):(l=null,u=r),l!==u)){if(d=An,g=`onMouseLeave`,p=`onMouseEnter`,m=`mouse`,(e===`pointerout`||e===`pointerover`)&&(d=Vn,g=`onPointerLeave`,p=`onPointerEnter`,m=`pointer`),f=l==null?c:xt(l),h=u==null?c:xt(u),c=new d(g,m+`leave`,l,n,i),c.target=f,c.relatedTarget=h,g=null,vt(i)===r&&(d=new d(p,m+`enter`,u,n,i),d.target=h,d.relatedTarget=f,g=d),f=g,l&&u)b:{for(d=Ad,p=l,m=u,h=0,g=p;g;g=d(g))h++;g=0;for(var _=m;_;_=d(_))g++;for(;0<h-g;)p=d(p),h--;for(;0<g-h;)m=d(m),g--;for(;h--;){if(p===m||m!==null&&p===m.alternate){d=p;break b}p=d(p),m=d(m)}d=null}else d=null;l!==null&&jd(o,c,l,d,!1),u!==null&&f!==null&&jd(o,f,u,d,!0)}}a:{if(c=r?xt(r):window,l=c.nodeName&&c.nodeName.toLowerCase(),l===`select`||l===`input`&&c.type===`file`)var v=dr;else if(ar(c))if(fr)v=xr;else{v=yr;var y=vr}else l=c.nodeName,!l||l.toLowerCase()!==`input`||c.type!==`checkbox`&&c.type!==`radio`?r&&Zt(r.elementType)&&(v=dr):v=br;if(v&&=v(e,r)){or(o,v,n,i);break a}y&&y(e,c,r),e===`focusout`&&r&&c.type===`number`&&r.memoizedProps.value!=null&&Ut(c,`number`,c.value)}switch(y=r?xt(r):window,e){case`focusin`:(ar(y)||y.contentEditable===`true`)&&(Ar=y,jr=r,Mr=null);break;case`focusout`:Mr=jr=Ar=null;break;case`mousedown`:Nr=!0;break;case`contextmenu`:case`mouseup`:case`dragend`:Nr=!1,Pr(o,n,i);break;case`selectionchange`:if(kr)break;case`keydown`:case`keyup`:Pr(o,n,i)}var b;if(qn)b:{switch(e){case`compositionstart`:var x=`onCompositionStart`;break b;case`compositionend`:x=`onCompositionEnd`;break b;case`compositionupdate`:x=`onCompositionUpdate`;break b}x=void 0}else tr?$n(e,n)&&(x=`onCompositionEnd`):e===`keydown`&&n.keyCode===229&&(x=`onCompositionStart`);x&&(Xn&&n.locale!==`ko`&&(tr||x!==`onCompositionStart`?x===`onCompositionEnd`&&tr&&(b=_n()):(mn=i,hn=`value`in mn?mn.value:mn.textContent,tr=!0)),y=kd(r,x),0<y.length&&(x=new Pn(x,e,null,n,i),o.push({event:x,listeners:y}),b?x.data=b:(b=er(n),b!==null&&(x.data=b)))),(b=Yn?nr(e,n):rr(e,n))&&(x=kd(r,`onBeforeInput`),0<x.length&&(y=new Pn(`onBeforeInput`,`beforeinput`,null,n,i),o.push({event:y,listeners:x}),y.data=b)),_d(o,e,r,n,i)}Sd(o,t)})}function Od(e,t,n){return{instance:e,listener:t,currentTarget:n}}function kd(e,t){for(var n=t+`Capture`,r=[];e!==null;){var i=e,a=i.stateNode;if(i=i.tag,i!==5&&i!==26&&i!==27||a===null||(i=un(e,n),i!=null&&r.unshift(Od(e,i,a)),i=un(e,t),i!=null&&r.push(Od(e,i,a))),e.tag===3)return r;e=e.return}return[]}function Ad(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function jd(e,t,n,r,i){for(var a=t._reactName,o=[];n!==null&&n!==r;){var s=n,c=s.alternate,l=s.stateNode;if(s=s.tag,c!==null&&c===r)break;s!==5&&s!==26&&s!==27||l===null||(c=l,i?(l=un(n,a),l!=null&&o.unshift(Od(n,l,c))):i||(l=un(n,a),l!=null&&o.push(Od(n,l,c)))),n=n.return}o.length!==0&&e.push({event:t,listeners:o})}var Md=/\r\n?/g,Nd=/\u0000|\uFFFD/g;function Pd(e){return(typeof e==`string`?e:``+e).replace(Md,`
`).replace(Nd,``)}function Fd(e,t){return t=Pd(t),Pd(e)===t}function X(e,t,n,r,i,o){switch(n){case`children`:typeof r==`string`?t===`body`||t===`textarea`&&r===``||qt(e,r):(typeof r==`number`||typeof r==`bigint`)&&t!==`body`&&qt(e,``+r);break;case`className`:jt(e,`class`,r);break;case`tabIndex`:jt(e,`tabindex`,r);break;case`dir`:case`role`:case`viewBox`:case`width`:case`height`:jt(e,n,r);break;case`style`:Xt(e,r,o);break;case`data`:if(t!==`object`){jt(e,`data`,r);break}case`src`:case`href`:if(r===``&&(t!==`a`||n!==`href`)){e.removeAttribute(n);break}if(r==null||typeof r==`function`||typeof r==`symbol`||typeof r==`boolean`){e.removeAttribute(n);break}r=en(``+r),e.setAttribute(n,r);break;case`action`:case`formAction`:if(typeof r==`function`){e.setAttribute(n,`javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')`);break}else typeof o==`function`&&(n===`formAction`?(t!==`input`&&X(e,t,`name`,i.name,i,null),X(e,t,`formEncType`,i.formEncType,i,null),X(e,t,`formMethod`,i.formMethod,i,null),X(e,t,`formTarget`,i.formTarget,i,null)):(X(e,t,`encType`,i.encType,i,null),X(e,t,`method`,i.method,i,null),X(e,t,`target`,i.target,i,null)));if(r==null||typeof r==`symbol`||typeof r==`boolean`){e.removeAttribute(n);break}r=en(``+r),e.setAttribute(n,r);break;case`onClick`:r!=null&&(e.onclick=tn);break;case`onScroll`:r!=null&&Y(`scroll`,e);break;case`onScrollEnd`:r!=null&&Y(`scrollend`,e);break;case`dangerouslySetInnerHTML`:if(r!=null){if(typeof r!=`object`||!(`__html`in r))throw Error(a(61));if(n=r.__html,n!=null){if(i.children!=null)throw Error(a(60));e.innerHTML=n}}break;case`multiple`:e.multiple=r&&typeof r!=`function`&&typeof r!=`symbol`;break;case`muted`:e.muted=r&&typeof r!=`function`&&typeof r!=`symbol`;break;case`suppressContentEditableWarning`:case`suppressHydrationWarning`:case`defaultValue`:case`defaultChecked`:case`innerHTML`:case`ref`:break;case`autoFocus`:break;case`xlinkHref`:if(r==null||typeof r==`function`||typeof r==`boolean`||typeof r==`symbol`){e.removeAttribute(`xlink:href`);break}n=en(``+r),e.setAttributeNS(`http://www.w3.org/1999/xlink`,`xlink:href`,n);break;case`contentEditable`:case`spellCheck`:case`draggable`:case`value`:case`autoReverse`:case`externalResourcesRequired`:case`focusable`:case`preserveAlpha`:r!=null&&typeof r!=`function`&&typeof r!=`symbol`?e.setAttribute(n,``+r):e.removeAttribute(n);break;case`inert`:case`allowFullScreen`:case`async`:case`autoPlay`:case`controls`:case`default`:case`defer`:case`disabled`:case`disablePictureInPicture`:case`disableRemotePlayback`:case`formNoValidate`:case`hidden`:case`loop`:case`noModule`:case`noValidate`:case`open`:case`playsInline`:case`readOnly`:case`required`:case`reversed`:case`scoped`:case`seamless`:case`itemScope`:r&&typeof r!=`function`&&typeof r!=`symbol`?e.setAttribute(n,``):e.removeAttribute(n);break;case`capture`:case`download`:!0===r?e.setAttribute(n,``):!1!==r&&r!=null&&typeof r!=`function`&&typeof r!=`symbol`?e.setAttribute(n,r):e.removeAttribute(n);break;case`cols`:case`rows`:case`size`:case`span`:r!=null&&typeof r!=`function`&&typeof r!=`symbol`&&!isNaN(r)&&1<=r?e.setAttribute(n,r):e.removeAttribute(n);break;case`rowSpan`:case`start`:r==null||typeof r==`function`||typeof r==`symbol`||isNaN(r)?e.removeAttribute(n):e.setAttribute(n,r);break;case`popover`:Y(`beforetoggle`,e),Y(`toggle`,e),At(e,`popover`,r);break;case`xlinkActuate`:Mt(e,`http://www.w3.org/1999/xlink`,`xlink:actuate`,r);break;case`xlinkArcrole`:Mt(e,`http://www.w3.org/1999/xlink`,`xlink:arcrole`,r);break;case`xlinkRole`:Mt(e,`http://www.w3.org/1999/xlink`,`xlink:role`,r);break;case`xlinkShow`:Mt(e,`http://www.w3.org/1999/xlink`,`xlink:show`,r);break;case`xlinkTitle`:Mt(e,`http://www.w3.org/1999/xlink`,`xlink:title`,r);break;case`xlinkType`:Mt(e,`http://www.w3.org/1999/xlink`,`xlink:type`,r);break;case`xmlBase`:Mt(e,`http://www.w3.org/XML/1998/namespace`,`xml:base`,r);break;case`xmlLang`:Mt(e,`http://www.w3.org/XML/1998/namespace`,`xml:lang`,r);break;case`xmlSpace`:Mt(e,`http://www.w3.org/XML/1998/namespace`,`xml:space`,r);break;case`is`:At(e,`is`,r);break;case`innerText`:case`textContent`:break;default:(!(2<n.length)||n[0]!==`o`&&n[0]!==`O`||n[1]!==`n`&&n[1]!==`N`)&&(n=Qt.get(n)||n,At(e,n,r))}}function Id(e,t,n,r,i,o){switch(n){case`style`:Xt(e,r,o);break;case`dangerouslySetInnerHTML`:if(r!=null){if(typeof r!=`object`||!(`__html`in r))throw Error(a(61));if(n=r.__html,n!=null){if(i.children!=null)throw Error(a(60));e.innerHTML=n}}break;case`children`:typeof r==`string`?qt(e,r):(typeof r==`number`||typeof r==`bigint`)&&qt(e,``+r);break;case`onScroll`:r!=null&&Y(`scroll`,e);break;case`onScrollEnd`:r!=null&&Y(`scrollend`,e);break;case`onClick`:r!=null&&(e.onclick=tn);break;case`suppressContentEditableWarning`:case`suppressHydrationWarning`:case`innerHTML`:case`ref`:break;case`innerText`:case`textContent`:break;default:if(!wt.hasOwnProperty(n))a:{if(n[0]===`o`&&n[1]===`n`&&(i=n.endsWith(`Capture`),t=n.slice(2,i?n.length-7:void 0),o=e[ut]||null,o=o==null?null:o[n],typeof o==`function`&&e.removeEventListener(t,o,i),typeof r==`function`)){typeof o!=`function`&&o!==null&&(n in e?e[n]=null:e.hasAttribute(n)&&e.removeAttribute(n)),e.addEventListener(t,r,i);break a}n in e?e[n]=r:!0===r?e.setAttribute(n,``):At(e,n,r)}}}function Ld(e,t,n){switch(t){case`div`:case`span`:case`svg`:case`path`:case`a`:case`g`:case`p`:case`li`:break;case`img`:Y(`error`,e),Y(`load`,e);var r=!1,i=!1,o;for(o in n)if(n.hasOwnProperty(o)){var s=n[o];if(s!=null)switch(o){case`src`:r=!0;break;case`srcSet`:i=!0;break;case`children`:case`dangerouslySetInnerHTML`:throw Error(a(137,t));default:X(e,t,o,s,n,null)}}i&&X(e,t,`srcSet`,n.srcSet,n,null),r&&X(e,t,`src`,n.src,n,null);return;case`input`:Y(`invalid`,e);var c=o=s=i=null,l=null,u=null;for(r in n)if(n.hasOwnProperty(r)){var d=n[r];if(d!=null)switch(r){case`name`:i=d;break;case`type`:s=d;break;case`checked`:l=d;break;case`defaultChecked`:u=d;break;case`value`:o=d;break;case`defaultValue`:c=d;break;case`children`:case`dangerouslySetInnerHTML`:if(d!=null)throw Error(a(137,t));break;default:X(e,t,r,d,n,null)}}Ht(e,o,c,l,u,s,i,!1);return;case`select`:for(i in Y(`invalid`,e),r=s=o=null,n)if(n.hasOwnProperty(i)&&(c=n[i],c!=null))switch(i){case`value`:o=c;break;case`defaultValue`:s=c;break;case`multiple`:r=c;default:X(e,t,i,c,n,null)}t=o,n=s,e.multiple=!!r,t==null?n!=null&&Wt(e,!!r,n,!0):Wt(e,!!r,t,!1);return;case`textarea`:for(s in Y(`invalid`,e),o=i=r=null,n)if(n.hasOwnProperty(s)&&(c=n[s],c!=null))switch(s){case`value`:r=c;break;case`defaultValue`:i=c;break;case`children`:o=c;break;case`dangerouslySetInnerHTML`:if(c!=null)throw Error(a(91));break;default:X(e,t,s,c,n,null)}Kt(e,r,i,o);return;case`option`:for(l in n)if(n.hasOwnProperty(l)&&(r=n[l],r!=null))switch(l){case`selected`:e.selected=r&&typeof r!=`function`&&typeof r!=`symbol`;break;default:X(e,t,l,r,n,null)}return;case`dialog`:Y(`beforetoggle`,e),Y(`toggle`,e),Y(`cancel`,e),Y(`close`,e);break;case`iframe`:case`object`:Y(`load`,e);break;case`video`:case`audio`:for(r=0;r<bd.length;r++)Y(bd[r],e);break;case`image`:Y(`error`,e),Y(`load`,e);break;case`details`:Y(`toggle`,e);break;case`embed`:case`source`:case`link`:Y(`error`,e),Y(`load`,e);case`area`:case`base`:case`br`:case`col`:case`hr`:case`keygen`:case`meta`:case`param`:case`track`:case`wbr`:case`menuitem`:for(u in n)if(n.hasOwnProperty(u)&&(r=n[u],r!=null))switch(u){case`children`:case`dangerouslySetInnerHTML`:throw Error(a(137,t));default:X(e,t,u,r,n,null)}return;default:if(Zt(t)){for(d in n)n.hasOwnProperty(d)&&(r=n[d],r!==void 0&&Id(e,t,d,r,n,void 0));return}}for(c in n)n.hasOwnProperty(c)&&(r=n[c],r!=null&&X(e,t,c,r,n,null))}function Rd(e,t,n,r){switch(t){case`div`:case`span`:case`svg`:case`path`:case`a`:case`g`:case`p`:case`li`:break;case`input`:var i=null,o=null,s=null,c=null,l=null,u=null,d=null;for(m in n){var f=n[m];if(n.hasOwnProperty(m)&&f!=null)switch(m){case`checked`:break;case`value`:break;case`defaultValue`:l=f;default:r.hasOwnProperty(m)||X(e,t,m,null,r,f)}}for(var p in r){var m=r[p];if(f=n[p],r.hasOwnProperty(p)&&(m!=null||f!=null))switch(p){case`type`:o=m;break;case`name`:i=m;break;case`checked`:u=m;break;case`defaultChecked`:d=m;break;case`value`:s=m;break;case`defaultValue`:c=m;break;case`children`:case`dangerouslySetInnerHTML`:if(m!=null)throw Error(a(137,t));break;default:m!==f&&X(e,t,p,m,r,f)}}Vt(e,s,c,l,u,d,o,i);return;case`select`:for(o in m=s=c=p=null,n)if(l=n[o],n.hasOwnProperty(o)&&l!=null)switch(o){case`value`:break;case`multiple`:m=l;default:r.hasOwnProperty(o)||X(e,t,o,null,r,l)}for(i in r)if(o=r[i],l=n[i],r.hasOwnProperty(i)&&(o!=null||l!=null))switch(i){case`value`:p=o;break;case`defaultValue`:c=o;break;case`multiple`:s=o;default:o!==l&&X(e,t,i,o,r,l)}t=c,n=s,r=m,p==null?!!r!=!!n&&(t==null?Wt(e,!!n,n?[]:``,!1):Wt(e,!!n,t,!0)):Wt(e,!!n,p,!1);return;case`textarea`:for(c in m=p=null,n)if(i=n[c],n.hasOwnProperty(c)&&i!=null&&!r.hasOwnProperty(c))switch(c){case`value`:break;case`children`:break;default:X(e,t,c,null,r,i)}for(s in r)if(i=r[s],o=n[s],r.hasOwnProperty(s)&&(i!=null||o!=null))switch(s){case`value`:p=i;break;case`defaultValue`:m=i;break;case`children`:break;case`dangerouslySetInnerHTML`:if(i!=null)throw Error(a(91));break;default:i!==o&&X(e,t,s,i,r,o)}Gt(e,p,m);return;case`option`:for(var h in n)if(p=n[h],n.hasOwnProperty(h)&&p!=null&&!r.hasOwnProperty(h))switch(h){case`selected`:e.selected=!1;break;default:X(e,t,h,null,r,p)}for(l in r)if(p=r[l],m=n[l],r.hasOwnProperty(l)&&p!==m&&(p!=null||m!=null))switch(l){case`selected`:e.selected=p&&typeof p!=`function`&&typeof p!=`symbol`;break;default:X(e,t,l,p,r,m)}return;case`img`:case`link`:case`area`:case`base`:case`br`:case`col`:case`embed`:case`hr`:case`keygen`:case`meta`:case`param`:case`source`:case`track`:case`wbr`:case`menuitem`:for(var g in n)p=n[g],n.hasOwnProperty(g)&&p!=null&&!r.hasOwnProperty(g)&&X(e,t,g,null,r,p);for(u in r)if(p=r[u],m=n[u],r.hasOwnProperty(u)&&p!==m&&(p!=null||m!=null))switch(u){case`children`:case`dangerouslySetInnerHTML`:if(p!=null)throw Error(a(137,t));break;default:X(e,t,u,p,r,m)}return;default:if(Zt(t)){for(var _ in n)p=n[_],n.hasOwnProperty(_)&&p!==void 0&&!r.hasOwnProperty(_)&&Id(e,t,_,void 0,r,p);for(d in r)p=r[d],m=n[d],!r.hasOwnProperty(d)||p===m||p===void 0&&m===void 0||Id(e,t,d,p,r,m);return}}for(var v in n)p=n[v],n.hasOwnProperty(v)&&p!=null&&!r.hasOwnProperty(v)&&X(e,t,v,null,r,p);for(f in r)p=r[f],m=n[f],!r.hasOwnProperty(f)||p===m||p==null&&m==null||X(e,t,f,p,r,m)}function zd(e){switch(e){case`css`:case`script`:case`font`:case`img`:case`image`:case`input`:case`link`:return!0;default:return!1}}function Bd(){if(typeof performance.getEntriesByType==`function`){for(var e=0,t=0,n=performance.getEntriesByType(`resource`),r=0;r<n.length;r++){var i=n[r],a=i.transferSize,o=i.initiatorType,s=i.duration;if(a&&s&&zd(o)){for(o=0,s=i.responseEnd,r+=1;r<n.length;r++){var c=n[r],l=c.startTime;if(l>s)break;var u=c.transferSize,d=c.initiatorType;u&&zd(d)&&(c=c.responseEnd,o+=u*(c<s?1:(s-l)/(c-l)))}if(--r,t+=8*(a+o)/(i.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e==`number`)?e:5}var Vd=null,Hd=null;function Ud(e){return e.nodeType===9?e:e.ownerDocument}function Wd(e){switch(e){case`http://www.w3.org/2000/svg`:return 1;case`http://www.w3.org/1998/Math/MathML`:return 2;default:return 0}}function Gd(e,t){if(e===0)switch(t){case`svg`:return 1;case`math`:return 2;default:return 0}return e===1&&t===`foreignObject`?0:e}function Kd(e,t){return e===`textarea`||e===`noscript`||typeof t.children==`string`||typeof t.children==`number`||typeof t.children==`bigint`||typeof t.dangerouslySetInnerHTML==`object`&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var qd=null;function Jd(){var e=window.event;return e&&e.type===`popstate`?e===qd?!1:(qd=e,!0):(qd=null,!1)}var Yd=typeof setTimeout==`function`?setTimeout:void 0,Xd=typeof clearTimeout==`function`?clearTimeout:void 0,Zd=typeof Promise==`function`?Promise:void 0,Qd=typeof queueMicrotask==`function`?queueMicrotask:Zd===void 0?Yd:function(e){return Zd.resolve(null).then(e).catch($d)};function $d(e){setTimeout(function(){throw e})}function ef(e){return e===`head`}function tf(e,t){var n=t,r=0;do{var i=n.nextSibling;if(e.removeChild(n),i&&i.nodeType===8)if(n=i.data,n===`/$`||n===`/&`){if(r===0){e.removeChild(i),Fp(t);return}r--}else if(n===`$`||n===`$?`||n===`$~`||n===`$!`||n===`&`)r++;else if(n===`html`)hf(e.ownerDocument.documentElement);else if(n===`head`){n=e.ownerDocument.head,hf(n);for(var a=n.firstChild;a;){var o=a.nextSibling,s=a.nodeName;a[gt]||s===`SCRIPT`||s===`STYLE`||s===`LINK`&&a.rel.toLowerCase()===`stylesheet`||n.removeChild(a),a=o}}else n===`body`&&hf(e.ownerDocument.body);n=i}while(n);Fp(t)}function nf(e,t){var n=e;e=0;do{var r=n.nextSibling;if(n.nodeType===1?t?(n._stashedDisplay=n.style.display,n.style.display=`none`):(n.style.display=n._stashedDisplay||``,n.getAttribute(`style`)===``&&n.removeAttribute(`style`)):n.nodeType===3&&(t?(n._stashedText=n.nodeValue,n.nodeValue=``):n.nodeValue=n._stashedText||``),r&&r.nodeType===8)if(n=r.data,n===`/$`){if(e===0)break;e--}else n!==`$`&&n!==`$?`&&n!==`$~`&&n!==`$!`||e++;n=r}while(n)}function rf(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var n=t;switch(t=t.nextSibling,n.nodeName){case`HTML`:case`HEAD`:case`BODY`:rf(n),_t(n);continue;case`SCRIPT`:case`STYLE`:continue;case`LINK`:if(n.rel.toLowerCase()===`stylesheet`)continue}e.removeChild(n)}}function af(e,t,n,r){for(;e.nodeType===1;){var i=n;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!r&&(e.nodeName!==`INPUT`||e.type!==`hidden`))break}else if(!r)if(t===`input`&&e.type===`hidden`){var a=i.name==null?null:``+i.name;if(i.type===`hidden`&&e.getAttribute(`name`)===a)return e}else return e;else if(!e[gt])switch(t){case`meta`:if(!e.hasAttribute(`itemprop`))break;return e;case`link`:if(a=e.getAttribute(`rel`),a===`stylesheet`&&e.hasAttribute(`data-precedence`)||a!==i.rel||e.getAttribute(`href`)!==(i.href==null||i.href===``?null:i.href)||e.getAttribute(`crossorigin`)!==(i.crossOrigin==null?null:i.crossOrigin)||e.getAttribute(`title`)!==(i.title==null?null:i.title))break;return e;case`style`:if(e.hasAttribute(`data-precedence`))break;return e;case`script`:if(a=e.getAttribute(`src`),(a!==(i.src==null?null:i.src)||e.getAttribute(`type`)!==(i.type==null?null:i.type)||e.getAttribute(`crossorigin`)!==(i.crossOrigin==null?null:i.crossOrigin))&&a&&e.hasAttribute(`async`)&&!e.hasAttribute(`itemprop`))break;return e;default:return e}if(e=df(e.nextSibling),e===null)break}return null}function of(e,t,n){if(t===``)return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!==`INPUT`||e.type!==`hidden`)&&!n||(e=df(e.nextSibling),e===null))return null;return e}function sf(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!==`INPUT`||e.type!==`hidden`)&&!t||(e=df(e.nextSibling),e===null))return null;return e}function cf(e){return e.data===`$?`||e.data===`$~`}function lf(e){return e.data===`$!`||e.data===`$?`&&e.ownerDocument.readyState!==`loading`}function uf(e,t){var n=e.ownerDocument;if(e.data===`$~`)e._reactRetry=t;else if(e.data!==`$?`||n.readyState!==`loading`)t();else{var r=function(){t(),n.removeEventListener(`DOMContentLoaded`,r)};n.addEventListener(`DOMContentLoaded`,r),e._reactRetry=r}}function df(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t===`$`||t===`$!`||t===`$?`||t===`$~`||t===`&`||t===`F!`||t===`F`)break;if(t===`/$`||t===`/&`)return null}}return e}var ff=null;function pf(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n===`/$`||n===`/&`){if(t===0)return df(e.nextSibling);t--}else n!==`$`&&n!==`$!`&&n!==`$?`&&n!==`$~`&&n!==`&`||t++}e=e.nextSibling}return null}function Z(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n===`$`||n===`$!`||n===`$?`||n===`$~`||n===`&`){if(t===0)return e;t--}else n!==`/$`&&n!==`/&`||t++}e=e.previousSibling}return null}function mf(e,t,n){switch(t=Ud(n),e){case`html`:if(e=t.documentElement,!e)throw Error(a(452));return e;case`head`:if(e=t.head,!e)throw Error(a(453));return e;case`body`:if(e=t.body,!e)throw Error(a(454));return e;default:throw Error(a(451))}}function hf(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);_t(e)}var gf=new Map,_f=new Set;function vf(e){return typeof e.getRootNode==`function`?e.getRootNode():e.nodeType===9?e:e.ownerDocument}var yf=A.d;A.d={f:bf,r:xf,D:wf,C:Tf,L:Ef,m:Df,X:kf,S:Of,M:Af};function bf(){var e=yf.f(),t=Su();return e||t}function xf(e){var t=yt(e);t!==null&&t.tag===5&&t.type===`form`?Ts(t):yf.r(e)}var Sf=typeof document>`u`?null:document;function Cf(e,t,n){var r=Sf;if(r&&typeof t==`string`&&t){var i=Bt(t);i=`link[rel="`+e+`"][href="`+i+`"]`,typeof n==`string`&&(i+=`[crossorigin="`+n+`"]`),_f.has(i)||(_f.add(i),e={rel:e,crossOrigin:n,href:t},r.querySelector(i)===null&&(t=r.createElement(`link`),Ld(t,`link`,e),F(t),r.head.appendChild(t)))}}function wf(e){yf.D(e),Cf(`dns-prefetch`,e,null)}function Tf(e,t){yf.C(e,t),Cf(`preconnect`,e,t)}function Ef(e,t,n){yf.L(e,t,n);var r=Sf;if(r&&e&&t){var i=`link[rel="preload"][as="`+Bt(t)+`"]`;t===`image`&&n&&n.imageSrcSet?(i+=`[imagesrcset="`+Bt(n.imageSrcSet)+`"]`,typeof n.imageSizes==`string`&&(i+=`[imagesizes="`+Bt(n.imageSizes)+`"]`)):i+=`[href="`+Bt(e)+`"]`;var a=i;switch(t){case`style`:a=Mf(e);break;case`script`:a=If(e)}gf.has(a)||(e=p({rel:`preload`,href:t===`image`&&n&&n.imageSrcSet?void 0:e,as:t},n),gf.set(a,e),r.querySelector(i)!==null||t===`style`&&r.querySelector(Nf(a))||t===`script`&&r.querySelector(Lf(a))||(t=r.createElement(`link`),Ld(t,`link`,e),F(t),r.head.appendChild(t)))}}function Df(e,t){yf.m(e,t);var n=Sf;if(n&&e){var r=t&&typeof t.as==`string`?t.as:`script`,i=`link[rel="modulepreload"][as="`+Bt(r)+`"][href="`+Bt(e)+`"]`,a=i;switch(r){case`audioworklet`:case`paintworklet`:case`serviceworker`:case`sharedworker`:case`worker`:case`script`:a=If(e)}if(!gf.has(a)&&(e=p({rel:`modulepreload`,href:e},t),gf.set(a,e),n.querySelector(i)===null)){switch(r){case`audioworklet`:case`paintworklet`:case`serviceworker`:case`sharedworker`:case`worker`:case`script`:if(n.querySelector(Lf(a)))return}r=n.createElement(`link`),Ld(r,`link`,e),F(r),n.head.appendChild(r)}}}function Of(e,t,n){yf.S(e,t,n);var r=Sf;if(r&&e){var i=St(r).hoistableStyles,a=Mf(e);t||=`default`;var o=i.get(a);if(!o){var s={loading:0,preload:null};if(o=r.querySelector(Nf(a)))s.loading=5;else{e=p({rel:`stylesheet`,href:e,"data-precedence":t},n),(n=gf.get(a))&&Bf(e,n);var c=o=r.createElement(`link`);F(c),Ld(c,`link`,e),c._p=new Promise(function(e,t){c.onload=e,c.onerror=t}),c.addEventListener(`load`,function(){s.loading|=1}),c.addEventListener(`error`,function(){s.loading|=2}),s.loading|=4,zf(o,t,r)}o={type:`stylesheet`,instance:o,count:1,state:s},i.set(a,o)}}}function kf(e,t){yf.X(e,t);var n=Sf;if(n&&e){var r=St(n).hoistableScripts,i=If(e),a=r.get(i);a||(a=n.querySelector(Lf(i)),a||(e=p({src:e,async:!0},t),(t=gf.get(i))&&Vf(e,t),a=n.createElement(`script`),F(a),Ld(a,`link`,e),n.head.appendChild(a)),a={type:`script`,instance:a,count:1,state:null},r.set(i,a))}}function Af(e,t){yf.M(e,t);var n=Sf;if(n&&e){var r=St(n).hoistableScripts,i=If(e),a=r.get(i);a||(a=n.querySelector(Lf(i)),a||(e=p({src:e,async:!0,type:`module`},t),(t=gf.get(i))&&Vf(e,t),a=n.createElement(`script`),F(a),Ld(a,`link`,e),n.head.appendChild(a)),a={type:`script`,instance:a,count:1,state:null},r.set(i,a))}}function jf(e,t,n,r){var i=(i=de.current)?vf(i):null;if(!i)throw Error(a(446));switch(e){case`meta`:case`title`:return null;case`style`:return typeof n.precedence==`string`&&typeof n.href==`string`?(t=Mf(n.href),n=St(i).hoistableStyles,r=n.get(t),r||(r={type:`style`,instance:null,count:0,state:null},n.set(t,r)),r):{type:`void`,instance:null,count:0,state:null};case`link`:if(n.rel===`stylesheet`&&typeof n.href==`string`&&typeof n.precedence==`string`){e=Mf(n.href);var o=St(i).hoistableStyles,s=o.get(e);if(s||(i=i.ownerDocument||i,s={type:`stylesheet`,instance:null,count:0,state:{loading:0,preload:null}},o.set(e,s),(o=i.querySelector(Nf(e)))&&!o._p&&(s.instance=o,s.state.loading=5),gf.has(e)||(n={rel:`preload`,as:`style`,href:n.href,crossOrigin:n.crossOrigin,integrity:n.integrity,media:n.media,hrefLang:n.hrefLang,referrerPolicy:n.referrerPolicy},gf.set(e,n),o||Ff(i,e,n,s.state))),t&&r===null)throw Error(a(528,``));return s}if(t&&r!==null)throw Error(a(529,``));return null;case`script`:return t=n.async,n=n.src,typeof n==`string`&&t&&typeof t!=`function`&&typeof t!=`symbol`?(t=If(n),n=St(i).hoistableScripts,r=n.get(t),r||(r={type:`script`,instance:null,count:0,state:null},n.set(t,r)),r):{type:`void`,instance:null,count:0,state:null};default:throw Error(a(444,e))}}function Mf(e){return`href="`+Bt(e)+`"`}function Nf(e){return`link[rel="stylesheet"][`+e+`]`}function Pf(e){return p({},e,{"data-precedence":e.precedence,precedence:null})}function Ff(e,t,n,r){e.querySelector(`link[rel="preload"][as="style"][`+t+`]`)?r.loading=1:(t=e.createElement(`link`),r.preload=t,t.addEventListener(`load`,function(){return r.loading|=1}),t.addEventListener(`error`,function(){return r.loading|=2}),Ld(t,`link`,n),F(t),e.head.appendChild(t))}function If(e){return`[src="`+Bt(e)+`"]`}function Lf(e){return`script[async]`+e}function Rf(e,t,n){if(t.count++,t.instance===null)switch(t.type){case`style`:var r=e.querySelector(`style[data-href~="`+Bt(n.href)+`"]`);if(r)return t.instance=r,F(r),r;var i=p({},n,{"data-href":n.href,"data-precedence":n.precedence,href:null,precedence:null});return r=(e.ownerDocument||e).createElement(`style`),F(r),Ld(r,`style`,i),zf(r,n.precedence,e),t.instance=r;case`stylesheet`:i=Mf(n.href);var o=e.querySelector(Nf(i));if(o)return t.state.loading|=4,t.instance=o,F(o),o;r=Pf(n),(i=gf.get(i))&&Bf(r,i),o=(e.ownerDocument||e).createElement(`link`),F(o);var s=o;return s._p=new Promise(function(e,t){s.onload=e,s.onerror=t}),Ld(o,`link`,r),t.state.loading|=4,zf(o,n.precedence,e),t.instance=o;case`script`:return o=If(n.src),(i=e.querySelector(Lf(o)))?(t.instance=i,F(i),i):(r=n,(i=gf.get(o))&&(r=p({},n),Vf(r,i)),e=e.ownerDocument||e,i=e.createElement(`script`),F(i),Ld(i,`link`,r),e.head.appendChild(i),t.instance=i);case`void`:return null;default:throw Error(a(443,t.type))}else t.type===`stylesheet`&&!(t.state.loading&4)&&(r=t.instance,t.state.loading|=4,zf(r,n.precedence,e));return t.instance}function zf(e,t,n){for(var r=n.querySelectorAll(`link[rel="stylesheet"][data-precedence],style[data-precedence]`),i=r.length?r[r.length-1]:null,a=i,o=0;o<r.length;o++){var s=r[o];if(s.dataset.precedence===t)a=s;else if(a!==i)break}a?a.parentNode.insertBefore(e,a.nextSibling):(t=n.nodeType===9?n.head:n,t.insertBefore(e,t.firstChild))}function Bf(e,t){e.crossOrigin??=t.crossOrigin,e.referrerPolicy??=t.referrerPolicy,e.title??=t.title}function Vf(e,t){e.crossOrigin??=t.crossOrigin,e.referrerPolicy??=t.referrerPolicy,e.integrity??=t.integrity}var Hf=null;function Uf(e,t,n){if(Hf===null){var r=new Map,i=Hf=new Map;i.set(n,r)}else i=Hf,r=i.get(n),r||(r=new Map,i.set(n,r));if(r.has(e))return r;for(r.set(e,null),n=n.getElementsByTagName(e),i=0;i<n.length;i++){var a=n[i];if(!(a[gt]||a[lt]||e===`link`&&a.getAttribute(`rel`)===`stylesheet`)&&a.namespaceURI!==`http://www.w3.org/2000/svg`){var o=a.getAttribute(t)||``;o=e+o;var s=r.get(o);s?s.push(a):r.set(o,[a])}}return r}function Wf(e,t,n){e=e.ownerDocument||e,e.head.insertBefore(n,t===`title`?e.querySelector(`head > title`):null)}function Gf(e,t,n){if(n===1||t.itemProp!=null)return!1;switch(e){case`meta`:case`title`:return!0;case`style`:if(typeof t.precedence!=`string`||typeof t.href!=`string`||t.href===``)break;return!0;case`link`:if(typeof t.rel!=`string`||typeof t.href!=`string`||t.href===``||t.onLoad||t.onError)break;switch(t.rel){case`stylesheet`:return e=t.disabled,typeof t.precedence==`string`&&e==null;default:return!0}case`script`:if(t.async&&typeof t.async!=`function`&&typeof t.async!=`symbol`&&!t.onLoad&&!t.onError&&t.src&&typeof t.src==`string`)return!0}return!1}function Kf(e){return!(e.type===`stylesheet`&&!(e.state.loading&3))}function qf(e,t,n,r){if(n.type===`stylesheet`&&(typeof r.media!=`string`||!1!==matchMedia(r.media).matches)&&!(n.state.loading&4)){if(n.instance===null){var i=Mf(r.href),a=t.querySelector(Nf(i));if(a){t=a._p,typeof t==`object`&&t&&typeof t.then==`function`&&(e.count++,e=Xf.bind(e),t.then(e,e)),n.state.loading|=4,n.instance=a,F(a);return}a=t.ownerDocument||t,r=Pf(r),(i=gf.get(i))&&Bf(r,i),a=a.createElement(`link`),F(a);var o=a;o._p=new Promise(function(e,t){o.onload=e,o.onerror=t}),Ld(a,`link`,r),n.instance=a}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(n,t),(t=n.state.preload)&&!(n.state.loading&3)&&(e.count++,n=Xf.bind(e),t.addEventListener(`load`,n),t.addEventListener(`error`,n))}}var Jf=0;function Yf(e,t){return e.stylesheets&&e.count===0&&Qf(e,e.stylesheets),0<e.count||0<e.imgCount?function(n){var r=setTimeout(function(){if(e.stylesheets&&Qf(e,e.stylesheets),e.unsuspend){var t=e.unsuspend;e.unsuspend=null,t()}},6e4+t);0<e.imgBytes&&Jf===0&&(Jf=62500*Bd());var i=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&Qf(e,e.stylesheets),e.unsuspend)){var t=e.unsuspend;e.unsuspend=null,t()}},(e.imgBytes>Jf?50:800)+t);return e.unsuspend=n,function(){e.unsuspend=null,clearTimeout(r),clearTimeout(i)}}:null}function Xf(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)Qf(this,this.stylesheets);else if(this.unsuspend){var e=this.unsuspend;this.unsuspend=null,e()}}}var Zf=null;function Qf(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,Zf=new Map,t.forEach($f,e),Zf=null,Xf.call(e))}function $f(e,t){if(!(t.state.loading&4)){var n=Zf.get(e);if(n)var r=n.get(null);else{n=new Map,Zf.set(e,n);for(var i=e.querySelectorAll(`link[data-precedence],style[data-precedence]`),a=0;a<i.length;a++){var o=i[a];(o.nodeName===`LINK`||o.getAttribute(`media`)!==`not all`)&&(n.set(o.dataset.precedence,o),r=o)}r&&n.set(null,r)}i=t.instance,o=i.getAttribute(`data-precedence`),a=n.get(o)||r,a===r&&n.set(null,i),n.set(o,i),this.count++,r=Xf.bind(this),i.addEventListener(`load`,r),i.addEventListener(`error`,r),a?a.parentNode.insertBefore(i,a.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(i,e.firstChild)),t.state.loading|=4}}var ep={$$typeof:x,Provider:null,Consumer:null,_currentValue:oe,_currentValue2:oe,_threadCount:0};function tp(e,t,n,r,i,a,o,s,c){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=Qe(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Qe(0),this.hiddenUpdates=Qe(null),this.identifierPrefix=r,this.onUncaughtError=i,this.onCaughtError=a,this.onRecoverableError=o,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=c,this.incompleteTransitions=new Map}function np(e,t,n,r,i,a,o,s,c,l,u,d){return e=new tp(e,t,n,o,c,l,u,d,s),t=1,!0===a&&(t|=24),a=ci(3,null,null,t),e.current=a,a.stateNode=e,t=oa(),t.refCount++,e.pooledCache=t,t.refCount++,a.memoizedState={element:r,isDehydrated:n,cache:t},Ra(a),e}function rp(e){return e?(e=oi,e):oi}function ip(e,t,n,r,i,a){i=rp(i),r.context===null?r.context=i:r.pendingContext=i,r=Ba(t),r.payload={element:n},a=a===void 0?null:a,a!==null&&(r.callback=a),n=Va(e,r,t),n!==null&&(_u(n,e,t),Ha(n,e,t))}function ap(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var n=e.retryLane;e.retryLane=n!==0&&n<t?n:t}}function op(e,t){ap(e,t),(e=e.alternate)&&ap(e,t)}function sp(e){if(e.tag===13||e.tag===31){var t=ri(e,67108864);t!==null&&_u(t,e,67108864),op(e,67108864)}}function cp(e){if(e.tag===13||e.tag===31){var t=hu();t=it(t);var n=ri(e,t);n!==null&&_u(n,e,t),op(e,t)}}var lp=!0;function up(e,t,n,r){var i=k.T;k.T=null;var a=A.p;try{A.p=2,fp(e,t,n,r)}finally{A.p=a,k.T=i}}function dp(e,t,n,r){var i=k.T;k.T=null;var a=A.p;try{A.p=8,fp(e,t,n,r)}finally{A.p=a,k.T=i}}function fp(e,t,n,r){if(lp){var i=pp(r);if(i===null)Dd(e,t,r,mp,n),Tp(e,r);else if(Dp(i,e,t,n,r))r.stopPropagation();else if(Tp(e,r),t&4&&-1<wp.indexOf(e)){for(;i!==null;){var a=yt(i);if(a!==null)switch(a.tag){case 3:if(a=a.stateNode,a.current.memoizedState.isDehydrated){var o=qe(a.pendingLanes);if(o!==0){var s=a;for(s.pendingLanes|=2,s.entangledLanes|=2;o;){var c=1<<31-Be(o);s.entanglements[1]|=c,o&=~c}od(a),!(G&6)&&(ru=ke()+500,sd(0,!1))}}break;case 31:case 13:s=ri(a,2),s!==null&&_u(s,a,2),Su(),op(a,2)}if(a=pp(r),a===null&&Dd(e,t,r,mp,n),a===i)break;i=a}i!==null&&r.stopPropagation()}else Dd(e,t,r,null,n)}}function pp(e){return e=rn(e),hp(e)}var mp=null;function hp(e){if(mp=null,e=vt(e),e!==null){var t=s(e);if(t===null)e=null;else{var n=t.tag;if(n===13){if(e=c(t),e!==null)return e;e=null}else if(n===31){if(e=l(t),e!==null)return e;e=null}else if(n===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return mp=e,null}function gp(e){switch(e){case`beforetoggle`:case`cancel`:case`click`:case`close`:case`contextmenu`:case`copy`:case`cut`:case`auxclick`:case`dblclick`:case`dragend`:case`dragstart`:case`drop`:case`focusin`:case`focusout`:case`input`:case`invalid`:case`keydown`:case`keypress`:case`keyup`:case`mousedown`:case`mouseup`:case`paste`:case`pause`:case`play`:case`pointercancel`:case`pointerdown`:case`pointerup`:case`ratechange`:case`reset`:case`resize`:case`seeked`:case`submit`:case`toggle`:case`touchcancel`:case`touchend`:case`touchstart`:case`volumechange`:case`change`:case`selectionchange`:case`textInput`:case`compositionstart`:case`compositionend`:case`compositionupdate`:case`beforeblur`:case`afterblur`:case`beforeinput`:case`blur`:case`fullscreenchange`:case`focus`:case`hashchange`:case`popstate`:case`select`:case`selectstart`:return 2;case`drag`:case`dragenter`:case`dragexit`:case`dragleave`:case`dragover`:case`mousemove`:case`mouseout`:case`mouseover`:case`pointermove`:case`pointerout`:case`pointerover`:case`scroll`:case`touchmove`:case`wheel`:case`mouseenter`:case`mouseleave`:case`pointerenter`:case`pointerleave`:return 8;case`message`:switch(Ae()){case je:return 2;case Me:return 8;case Ne:case Pe:return 32;case Fe:return 268435456;default:return 32}default:return 32}}var _p=!1,vp=null,yp=null,bp=null,xp=new Map,Sp=new Map,Cp=[],wp=`mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset`.split(` `);function Tp(e,t){switch(e){case`focusin`:case`focusout`:vp=null;break;case`dragenter`:case`dragleave`:yp=null;break;case`mouseover`:case`mouseout`:bp=null;break;case`pointerover`:case`pointerout`:xp.delete(t.pointerId);break;case`gotpointercapture`:case`lostpointercapture`:Sp.delete(t.pointerId)}}function Ep(e,t,n,r,i,a){return e===null||e.nativeEvent!==a?(e={blockedOn:t,domEventName:n,eventSystemFlags:r,nativeEvent:a,targetContainers:[i]},t!==null&&(t=yt(t),t!==null&&sp(t)),e):(e.eventSystemFlags|=r,t=e.targetContainers,i!==null&&t.indexOf(i)===-1&&t.push(i),e)}function Dp(e,t,n,r,i){switch(t){case`focusin`:return vp=Ep(vp,e,t,n,r,i),!0;case`dragenter`:return yp=Ep(yp,e,t,n,r,i),!0;case`mouseover`:return bp=Ep(bp,e,t,n,r,i),!0;case`pointerover`:var a=i.pointerId;return xp.set(a,Ep(xp.get(a)||null,e,t,n,r,i)),!0;case`gotpointercapture`:return a=i.pointerId,Sp.set(a,Ep(Sp.get(a)||null,e,t,n,r,i)),!0}return!1}function Op(e){var t=vt(e.target);if(t!==null){var n=s(t);if(n!==null){if(t=n.tag,t===13){if(t=c(n),t!==null){e.blockedOn=t,st(e.priority,function(){cp(n)});return}}else if(t===31){if(t=l(n),t!==null){e.blockedOn=t,st(e.priority,function(){cp(n)});return}}else if(t===3&&n.stateNode.current.memoizedState.isDehydrated){e.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}e.blockedOn=null}function kp(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var n=pp(e.nativeEvent);if(n===null){n=e.nativeEvent;var r=new n.constructor(n.type,n);nn=r,n.target.dispatchEvent(r),nn=null}else return t=yt(n),t!==null&&sp(t),e.blockedOn=n,!1;t.shift()}return!0}function Ap(e,t,n){kp(e)&&n.delete(t)}function jp(){_p=!1,vp!==null&&kp(vp)&&(vp=null),yp!==null&&kp(yp)&&(yp=null),bp!==null&&kp(bp)&&(bp=null),xp.forEach(Ap),Sp.forEach(Ap)}function Mp(e,t){e.blockedOn===t&&(e.blockedOn=null,_p||(_p=!0,n.unstable_scheduleCallback(n.unstable_NormalPriority,jp)))}var Np=null;function Pp(e){Np!==e&&(Np=e,n.unstable_scheduleCallback(n.unstable_NormalPriority,function(){Np===e&&(Np=null);for(var t=0;t<e.length;t+=3){var n=e[t],r=e[t+1],i=e[t+2];if(typeof r!=`function`){if(hp(r||n)===null)continue;break}var a=yt(n);a!==null&&(e.splice(t,3),t-=3,Cs(a,{pending:!0,data:i,method:n.method,action:r},r,i))}}))}function Fp(e){function t(t){return Mp(t,e)}vp!==null&&Mp(vp,e),yp!==null&&Mp(yp,e),bp!==null&&Mp(bp,e),xp.forEach(t),Sp.forEach(t);for(var n=0;n<Cp.length;n++){var r=Cp[n];r.blockedOn===e&&(r.blockedOn=null)}for(;0<Cp.length&&(n=Cp[0],n.blockedOn===null);)Op(n),n.blockedOn===null&&Cp.shift();if(n=(e.ownerDocument||e).$$reactFormReplay,n!=null)for(r=0;r<n.length;r+=3){var i=n[r],a=n[r+1],o=i[ut]||null;if(typeof a==`function`)o||Pp(n);else if(o){var s=null;if(a&&a.hasAttribute(`formAction`)){if(i=a,o=a[ut]||null)s=o.formAction;else if(hp(i)!==null)continue}else s=o.action;typeof s==`function`?n[r+1]=s:(n.splice(r,3),r-=3),Pp(n)}}}function Ip(){function e(e){e.canIntercept&&e.info===`react-transition`&&e.intercept({handler:function(){return new Promise(function(e){return i=e})},focusReset:`manual`,scroll:`manual`})}function t(){i!==null&&(i(),i=null),r||setTimeout(n,20)}function n(){if(!r&&!navigation.transition){var e=navigation.currentEntry;e&&e.url!=null&&navigation.navigate(e.url,{state:e.getState(),info:`react-transition`,history:`replace`})}}if(typeof navigation==`object`){var r=!1,i=null;return navigation.addEventListener(`navigate`,e),navigation.addEventListener(`navigatesuccess`,t),navigation.addEventListener(`navigateerror`,t),setTimeout(n,100),function(){r=!0,navigation.removeEventListener(`navigate`,e),navigation.removeEventListener(`navigatesuccess`,t),navigation.removeEventListener(`navigateerror`,t),i!==null&&(i(),i=null)}}}function Lp(e){this._internalRoot=e}Rp.prototype.render=Lp.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(a(409));var n=t.current;ip(n,hu(),e,t,null,null)},Rp.prototype.unmount=Lp.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;ip(e.current,2,null,e,null,null),Su(),t[dt]=null}};function Rp(e){this._internalRoot=e}Rp.prototype.unstable_scheduleHydration=function(e){if(e){var t=ot();e={blockedOn:null,target:e,priority:t};for(var n=0;n<Cp.length&&t!==0&&t<Cp[n].priority;n++);Cp.splice(n,0,e),n===0&&Op(e)}};var zp=r.version;if(zp!==`19.2.7`)throw Error(a(527,zp,`19.2.7`));A.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render==`function`?Error(a(188)):(e=Object.keys(e).join(`,`),Error(a(268,e)));return e=d(t),e=e===null?null:f(e),e=e===null?null:e.stateNode,e};var Bp={bundleType:0,version:`19.2.7`,rendererPackageName:`react-dom`,currentDispatcherRef:k,reconcilerVersion:`19.2.7`};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<`u`){var Vp=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!Vp.isDisabled&&Vp.supportsFiber)try{Le=Vp.inject(Bp),Re=Vp}catch{}}e.createRoot=function(e,t){if(!o(e))throw Error(a(299));var n=!1,r=``,i=Ks,s=qs,c=Js;return t!=null&&(!0===t.unstable_strictMode&&(n=!0),t.identifierPrefix!==void 0&&(r=t.identifierPrefix),t.onUncaughtError!==void 0&&(i=t.onUncaughtError),t.onCaughtError!==void 0&&(s=t.onCaughtError),t.onRecoverableError!==void 0&&(c=t.onRecoverableError)),t=np(e,1,!1,null,null,n,r,null,i,s,c,Ip),e[dt]=t.current,Td(e),new Lp(t)}})),St=i(((e,t)=>{function n(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>`u`||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!=`function`))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n)}catch(e){console.error(e)}}n(),t.exports=xt()})),F=n(t(),1),Ct=St();c();var wt={RichTextEditor:`_RichTextEditor_5wzos_1`,"RichTextEditor--editor":`_RichTextEditor--editor_5wzos_50`,"RichTextEditor--disabled":`_RichTextEditor--disabled_5wzos_123`,"RichTextEditor--isActive":`_RichTextEditor--isActive_5wzos_159`,"RichTextEditor-menu":`_RichTextEditor-menu_5wzos_165`},I=l(),Tt=`modulepreload`,Et=function(e){return`/`+e},Dt={},Ot=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}r=o(t.map(t=>{if(t=Et(t,n),t in Dt)return;Dt[t]=!0;let r=t.endsWith(`.css`),i=r?`[rel="stylesheet"]`:``;if(n)for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}else if(document.querySelector(`link[href="${t}"]${i}`))return;let o=document.createElement(`link`);if(o.rel=r?`stylesheet`:Tt,r||(o.as=`script`),o.crossOrigin=``,o.href=t,a&&o.setAttribute(`nonce`,a),document.head.appendChild(o),r)return new Promise((e,n)=>{o.addEventListener(`load`,e),o.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})};c(),c();var kt={RichTextMenu:`_RichTextMenu_1ve2j_1`,"RichTextMenu--form":`_RichTextMenu--form_1ve2j_7`,"RichTextMenu-group":`_RichTextMenu-group_1ve2j_21`,"RichTextMenu--inline":`_RichTextMenu--inline_1ve2j_39`};c(),c(),c(),c();var At=a(`Control`,{Control:`_Control_id4pm_1`,"Control--inline":`_Control--inline_id4pm_6`});function jt({icon:e,disabled:t,active:n,onClick:r,title:i}){let{inline:a}=xe();return a?(0,I.jsx)(`span`,{className:At({inline:!0}),children:(0,I.jsx)(rt,{onClick:r,disabled:t,active:n,label:i,children:e})}):(0,I.jsx)(`span`,{className:At(),children:(0,I.jsx)(A,{onClick:r,disabled:t,active:n,title:i,children:e})})}function Mt(){let{editor:e,editorState:t}=xe();return(0,I.jsx)(jt,{icon:(0,I.jsx)(Se,{}),onClick:t=>{t.stopPropagation(),e?.chain().focus().setTextAlign(`left`).run()},disabled:!t?.canAlignLeft,active:t?.isAlignLeft,title:`Align left`})}c();function Nt(){let{editor:e,editorState:t}=xe();return(0,I.jsx)(jt,{icon:(0,I.jsx)($e,{}),onClick:t=>{t.stopPropagation(),e?.chain().focus().setTextAlign(`center`).run()},disabled:!t?.canAlignCenter,active:t?.isAlignCenter,title:`Align center`})}c();function Pt(){let{editor:e,editorState:t}=xe();return(0,I.jsx)(jt,{icon:(0,I.jsx)(Je,{}),onClick:t=>{t.stopPropagation(),e?.chain().focus().setTextAlign(`right`).run()},disabled:!t?.canAlignRight,active:t?.isAlignRight,title:`Align right`})}c();function Ft(){let{editor:e,editorState:t}=xe();return(0,I.jsx)(jt,{icon:(0,I.jsx)(Ie,{}),onClick:t=>{t.stopPropagation(),e?.chain().focus().setTextAlign(`justify`).run()},disabled:!t?.canAlignJustify,active:t?.isAlignJustify,title:`Justify`})}c(),c();function It(){return(0,I.jsx)(ve,{options:gt(xe().options),onChange:()=>{},value:`left`,defaultValue:`left`,renderDefaultIcon:Se})}var Lt=(0,F.lazy)(()=>Ot(()=>import(`./assets/loaded-QH5RKCGC-BqRn-wh2.js`).then(e=>({default:e.AlignSelectLoaded})),__vite__mapDeps([0,1,2,3,4,5]))),Rt=()=>(0,I.jsx)(F.Suspense,{fallback:(0,I.jsx)(It,{}),children:(0,I.jsx)(Lt,{})});c();function zt(){let{editor:e,editorState:t}=xe();return(0,I.jsx)(jt,{icon:(0,I.jsx)(tt,{}),onClick:t=>{t.stopPropagation(),e?.chain().focus().toggleBold().run()},disabled:!t?.canBold,active:t?.isBold,title:`Bold`})}c();function Bt(){let{editor:e,editorState:t}=xe();return(0,I.jsx)(jt,{icon:(0,I.jsx)(Be,{}),onClick:t=>{t.stopPropagation(),e?.chain().focus().toggleItalic().run()},disabled:!t?.canItalic,active:t?.isItalic,title:`Italic`})}c();function Vt(){let{editor:e,editorState:t}=xe();return(0,I.jsx)(jt,{icon:(0,I.jsx)(Le,{}),onClick:t=>{t.stopPropagation(),e?.chain().focus().toggleUnderline().run()},disabled:!t?.canUnderline,active:t?.isUnderline,title:`Underline`})}c();function Ht(){let{editor:e,editorState:t}=xe();return(0,I.jsx)(jt,{icon:(0,I.jsx)(d,{}),onClick:t=>{t.stopPropagation(),e?.chain().focus().toggleStrike().run()},disabled:!t?.canStrike,active:t?.isStrike,title:`Strikethrough`})}c();function Ut(){let{editor:e,editorState:t}=xe();return(0,I.jsx)(jt,{icon:(0,I.jsx)(je,{}),onClick:t=>{t.stopPropagation(),e?.chain().focus().toggleCode().run()},disabled:!t?.canInlineCode,active:t?.isInlineCode,title:`Inline code`})}c();function Wt(){let{editor:e,editorState:t}=xe();return(0,I.jsx)(jt,{icon:(0,I.jsx)(ae,{}),onClick:t=>{t.stopPropagation(),e?.chain().focus().toggleBulletList().run()},disabled:!t?.canBulletList,active:t?.isBulletList,title:`Bullet list`})}c();function Gt(){let{editor:e,editorState:t}=xe();return(0,I.jsx)(jt,{icon:(0,I.jsx)(se,{}),onClick:t=>{t.stopPropagation(),e?.chain().focus().toggleOrderedList().run()},disabled:!t?.canOrderedList,active:t?.isOrderedList,title:`Ordered list`})}c();function Kt(){let{editor:e,editorState:t}=xe();return(0,I.jsx)(jt,{icon:(0,I.jsx)(M,{}),onClick:t=>{t.stopPropagation(),e?.chain().focus().toggleCodeBlock().run()},disabled:!t?.canCodeBlock,active:t?.isCodeBlock,title:`Code block`})}c();function qt(){let{editor:e,editorState:t}=xe();return(0,I.jsx)(jt,{icon:(0,I.jsx)(x,{}),onClick:t=>{t.stopPropagation(),e?.chain().focus().toggleBlockquote().run()},disabled:!t?.canBlockquote,active:t?.isBlockquote,title:`Blockquote`})}c();function Jt(){let{editor:e,editorState:t}=xe();return(0,I.jsx)(jt,{icon:(0,I.jsx)(m,{}),onClick:t=>{t.stopPropagation(),e?.chain().focus().setHorizontalRule().run()},disabled:!t?.canHorizontalRule,title:`Horizontal rule`})}c(),c();function Yt(){return(0,I.jsx)(ve,{options:_t(xe().options),onChange:()=>{},value:`p`,defaultValue:`p`,renderDefaultIcon:ut})}var Xt=(0,F.lazy)(()=>Ot(()=>import(`./assets/loaded-LAKI4KDY-iYrsiJzj.js`).then(e=>({default:e.HeadingSelectLoaded})),__vite__mapDeps([6,1,2,7,4,5]))),Zt=()=>(0,I.jsx)(F.Suspense,{fallback:(0,I.jsx)(Yt,{}),children:(0,I.jsx)(Xt,{})});c(),c();function Qt(){return(0,I.jsx)(ve,{options:vt(xe().options),onChange:()=>{},value:`p`,defaultValue:`p`,renderDefaultIcon:ae})}var $t=(0,F.lazy)(()=>Ot(()=>import(`./assets/loaded-PILFUJGA-Db9_ync0.js`).then(e=>({default:e.ListSelectLoaded})),__vite__mapDeps([8,1,2,9,4,5]))),en=()=>(0,I.jsx)(F.Suspense,{fallback:(0,I.jsx)(Qt,{}),children:(0,I.jsx)($t,{})}),tn=a(`RichTextMenu`,kt),nn=({children:e})=>(0,I.jsx)(rn,{children:e}),rn=({children:e})=>{let{inline:t}=xe();return(0,I.jsx)(`div`,{className:tn({inline:t,form:!t}),"data-puck-rte-menu":!0,children:e})},an=({children:e})=>(0,I.jsx)(`div`,{className:tn(`group`),children:e});rn.Group=an,rn.Control=jt,rn.AlignCenter=Nt,rn.AlignJustify=Ft,rn.AlignLeft=Mt,rn.AlignRight=Pt,rn.AlignSelect=Rt,rn.Blockquote=qt,rn.Bold=zt,rn.BulletList=Wt,rn.CodeBlock=Kt,rn.HeadingSelect=Zt,rn.HorizontalRule=Jt,rn.InlineCode=Ut,rn.Italic=Bt,rn.ListSelect=en,rn.OrderedList=Gt,rn.Strikethrough=Ht,rn.Underline=Vt;var on=({editor:e=null,editorState:t=null,field:n,readOnly:r,inline:i})=>{let{renderMenu:a,renderInlineMenu:o}=n,s=(0,F.useMemo)(()=>o||nn,[o]),c=(0,F.useMemo)(()=>a||nn,[a]);return(0,I.jsx)(Xe.Provider,{value:{editor:e,editorState:t,inline:i,options:n.options,readOnly:r},children:i?(0,I.jsx)(s,{editor:e,editorState:t,readOnly:r,children:(0,I.jsxs)(an,{children:[(0,I.jsx)(zt,{}),(0,I.jsx)(Bt,{}),(0,I.jsx)(Vt,{})]})}):(0,I.jsxs)(c,{editor:e,editorState:t,readOnly:r,children:[(0,I.jsxs)(an,{children:[(0,I.jsx)(Zt,{}),(0,I.jsx)(en,{})]}),(0,I.jsxs)(an,{children:[(0,I.jsx)(zt,{}),(0,I.jsx)(Bt,{}),(0,I.jsx)(Vt,{})]}),(0,I.jsx)(an,{children:(0,I.jsx)(Rt,{})})]})})};c();var sn=a(`RichTextEditor`,wt),cn=(0,F.memo)(({children:e,menu:t,readOnly:n=!1,field:r,inline:i=!1,editor:a,id:o})=>{let{initialHeight:s}=r,c=P(e=>e.currentRichText?.id===o&&i===e.currentRichText.inline),l=Pe(),u=(0,F.useCallback)(e=>{var t,n;(e.metaKey||e.ctrlKey)&&e.key.toLowerCase()===`i`&&(e.stopPropagation(),e.preventDefault(),(n=a==null?void 0:(t=a.commands).toggleItalic)==null||n.call(t)),e.key.toLowerCase()===`backspace`&&e.stopPropagation()},[a]),d=(0,F.useCallback)(e=>{var t;let n=!!((t=e.relatedTarget)?.closest)?.call(t,`[data-puck-rte-menu]`);e.relatedTarget&&!n?l.setState({currentRichText:null}):e.stopPropagation()},[l]);return(0,I.jsxs)(`div`,{className:sn({editor:!i,inline:i,isActive:c,disabled:n}),style:i?{}:{height:s??192,overflowY:`auto`},onKeyDownCapture:u,onBlur:d,children:[!i&&(0,I.jsx)(`div`,{className:sn(`menu`),children:t}),e]})});cn.displayName=`EditorInner`,c();var ln=(0,F.lazy)(()=>Ot(()=>import(`./assets/full-6ZILLKCS-BhQ4z1kR.js`).then(e=>({default:e.LoadedRichTextMenuFull})),__vite__mapDeps([10,1,2,7,3,9,4,5]))),un=e=>(0,I.jsx)(F.Suspense,{fallback:(0,I.jsx)(on,o({},e)),children:(0,I.jsx)(ln,o({},e))});c(),c(),c(),c(),c(),c();var dn=(t,n=t)=>({slot:({value:r,propName:i,field:a,isReadOnly:s})=>{let c=s?n:t;return t=>c(e(o({allow:a?.type===`slot`?a.allow:[],disallow:a?.type===`slot`?a.disallow:[]},t),{zone:i,content:r}))}});c(),c(),c();function fn(t,n,i){return Object.keys(t).reduce((a,s)=>{let c=s;return e(o({},a),{[c]:a=>{var s=a,{parentId:l}=s,u=r(s,[`parentId`]);let d=u.propPath.replace(/\[\d+\]/g,`[*]`),f=n?.[u.propPath]||n?.[d]||i||!1,p=t[c];return p?.(e(o({},u),{isReadOnly:f,componentId:l}))}})},{})}function pn(e,t,n,r,i){let a=(0,F.useMemo)(()=>fn(n,r,i),[n,r,i]),s=(0,F.useMemo)(()=>N(t,a,e).props,[e,t,a]);return(0,F.useMemo)(()=>o(o({},t.props),s),[t.props,s])}function mn(e,t,n,r=n,i,a){return pn(e,t,dn(n,r),i,a)}c(),c();var hn=a(`RichTextEditor`,wt);function gn({content:e}){return(0,I.jsx)(`div`,{className:hn(),children:(0,I.jsx)(`div`,{className:`rich-text`,dangerouslySetInnerHTML:{__html:e}})})}c();var _n=(t,n,r)=>{if(!t)return null;if(n.length===0)return r(t);let[i,...a]=n;return Array.isArray(t)?t.map(e=>_n(e,n,r)):e(o({},t),{[i]:_n(t[i],a,r)})},vn=(0,F.lazy)(()=>Ot(()=>import(`./assets/Render-DQXAYUBI-DgxEH8NP.js`).then(e=>({default:e.RichTextRender})),__vite__mapDeps([11,1,12,5])));function yn(e,t){let n=(e,t=[])=>{if(!e)return[];let r=[];for(let[i,a]of Object.entries(e)){let e=[...t,i];a.type===`richtext`&&r.push({path:e,field:a}),a.type===`array`&&`arrayFields`in a&&r.push(...n(a.arrayFields,e)),a.type===`object`&&`objectFields`in a&&r.push(...n(a.objectFields,e))}return r},r=(0,F.useMemo)(()=>n(e),[e]);return(0,F.useMemo)(()=>{if(!r?.length)return{};let e=o({},t);for(let{path:t,field:n}of r)e=_n(e,t,e=>(0,I.jsx)(F.Suspense,{fallback:(0,I.jsx)(gn,{content:e}),children:(0,I.jsx)(vn,{content:e,field:n})},t.join(`.`)));return e},[r,t,e])}c();var bn=e=>(0,I.jsx)(Sn,o({},e)),xn=({config:t,item:n,metadata:r})=>{let i=t.components[n.type],a=mn(t,n,n=>(0,I.jsx)(bn,e(o({},n),{config:t,metadata:r}))),s=yn(i.fields,a);return(0,I.jsx)(i.render,e(o(o({},a),s),{puck:e(o({},a.puck),{metadata:r||{}})}))},Sn=(0,F.forwardRef)(function({className:e,style:t,content:n,config:r,metadata:i,as:a},o){return(0,I.jsx)(a??`div`,{className:e,style:t,ref:o,children:n.map(e=>r.components[e.type]?(0,I.jsx)(xn,{config:r,item:e,metadata:i},e.props.id):null)})}),Cn=e=>Symbol.iterator in e,wn=e=>`entries`in e,Tn=(e,t)=>{let n=e instanceof Map?e:new Map(e.entries()),r=t instanceof Map?t:new Map(t.entries());if(n.size!==r.size)return!1;for(let[e,t]of n)if(!r.has(e)||!Object.is(t,r.get(e)))return!1;return!0},En=(e,t)=>{let n=e[Symbol.iterator](),r=t[Symbol.iterator](),i=n.next(),a=r.next();for(;!i.done&&!a.done;){if(!Object.is(i.value,a.value))return!1;i=n.next(),a=r.next()}return!!i.done&&!!a.done};function Dn(e,t){return Object.is(e,t)?!0:typeof e!=`object`||!e||typeof t!=`object`||!t||Object.getPrototypeOf(e)!==Object.getPrototypeOf(t)?!1:Cn(e)&&Cn(t)?wn(e)&&wn(t)?Tn(e,t):En(e,t):Tn({entries:()=>Object.entries(e)},{entries:()=>Object.entries(t)})}function On(e){let t=F.useRef(void 0);return n=>{let r=e(n);return Dn(t.current,r)?t.current:t.current=r}}var kn=Symbol.for(`preact-signals`);function An(){if(Fn>1)Fn--;else{var e,t=!1;for((function(){var e=zn;for(zn=void 0;e!==void 0;)e.S.v===e.v&&(e.S.i=e.i),e=e.o})();Pn!==void 0;){var n=Pn;for(Pn=void 0,In++;n!==void 0;){var r=n.u;if(n.u=void 0,n.f&=-3,!(8&n.f)&&Wn(n))try{n.c()}catch(n){t||=(e=n,!0)}n=r}}if(In=0,Fn--,t)throw e}}function jn(e){if(Fn>0)return e();Rn=++Ln,Fn++;try{return e()}finally{An()}}var Mn=void 0;function L(e){var t=Mn;Mn=void 0;try{return e()}finally{Mn=t}}var Nn,Pn=void 0,Fn=0,In=0,Ln=0,Rn=0,zn=void 0,Bn=0;function Vn(e){if(Mn!==void 0){var t=e.n;if(t===void 0||t.t!==Mn)return t={i:0,S:e,p:Mn.s,n:void 0,t:Mn,e:void 0,x:void 0,r:t},Mn.s!==void 0&&(Mn.s.n=t),Mn.s=t,e.n=t,32&Mn.f&&e.S(t),t;if(t.i===-1)return t.i=0,t.n!==void 0&&(t.n.p=t.p,t.p!==void 0&&(t.p.n=t.n),t.p=Mn.s,t.n=void 0,Mn.s.n=t,Mn.s=t),t}}function Hn(e,t){this.v=e,this.i=0,this.n=void 0,this.t=void 0,this.l=0,this.W=t?.watched,this.Z=t?.unwatched,this.name=t?.name}Hn.prototype.brand=kn,Hn.prototype.h=function(){return!0},Hn.prototype.S=function(e){var t=this,n=this.t;n!==e&&e.e===void 0&&(e.x=n,this.t=e,n===void 0?L(function(){var e;(e=t.W)==null||e.call(t)}):n.e=e)},Hn.prototype.U=function(e){var t=this;if(this.t!==void 0){var n=e.e,r=e.x;n!==void 0&&(n.x=r,e.e=void 0),r!==void 0&&(r.e=n,e.x=void 0),e===this.t&&(this.t=r,r===void 0&&L(function(){var e;(e=t.Z)==null||e.call(t)}))}},Hn.prototype.subscribe=function(e){var t=this;return $n(function(){var n=t.value;L(function(){return e(n)})},{name:`sub`})},Hn.prototype.valueOf=function(){return this.value},Hn.prototype.toString=function(){return this.value+``},Hn.prototype.toJSON=function(){return this.value},Hn.prototype.peek=function(){var e=this;return L(function(){return e.value})},Object.defineProperty(Hn.prototype,"value",{get:function(){var e=Vn(this);return e!==void 0&&(e.i=this.i),this.v},set:function(e){if(e!==this.v){if(In>100)throw Error(`Cycle detected`);(function(e){Fn!==0&&In===0&&e.l!==Rn&&(e.l=Rn,zn={S:e,v:e.v,i:e.i,o:zn})})(this),this.v=e,this.i++,Bn++,Fn++;try{for(var t=this.t;t!==void 0;t=t.x)t.t.N()}finally{An()}}}});function Un(e,t){return new Hn(e,t)}function Wn(e){for(var t=e.s;t!==void 0;t=t.n)if(t.S.i!==t.i||!t.S.h()||t.S.i!==t.i)return!0;return!1}function Gn(e){for(var t=e.s;t!==void 0;t=t.n){var n=t.S.n;if(n!==void 0&&(t.r=n),t.S.n=t,t.i=-1,t.n===void 0){e.s=t;break}}}function Kn(e){for(var t=e.s,n=void 0;t!==void 0;){var r=t.p;t.i===-1?(t.S.U(t),r!==void 0&&(r.n=t.n),t.n!==void 0&&(t.n.p=r)):n=t,t.S.n=t.r,t.r!==void 0&&(t.r=void 0),t=r}e.s=n}function qn(e,t){Hn.call(this,void 0,t),this.x=e,this.s=void 0,this.g=Bn-1,this.f=4}qn.prototype=new Hn,qn.prototype.h=function(){if(this.f&=-3,1&this.f)return!1;if((36&this.f)==32||(this.f&=-5,this.g===Bn))return!0;if(this.g=Bn,this.f|=1,this.i>0&&!Wn(this))return this.f&=-2,!0;var e=Mn;try{Gn(this),Mn=this;var t=this.x();(16&this.f||this.v!==t||this.i===0)&&(this.v=t,this.f&=-17,this.i++)}catch(e){this.v=e,this.f|=16,this.i++}return Mn=e,Kn(this),this.f&=-2,!0},qn.prototype.S=function(e){if(this.t===void 0){this.f|=36;for(var t=this.s;t!==void 0;t=t.n)t.S.S(t)}Hn.prototype.S.call(this,e)},qn.prototype.U=function(e){if(this.t!==void 0&&(Hn.prototype.U.call(this,e),this.t===void 0)){this.f&=-33;for(var t=this.s;t!==void 0;t=t.n)t.S.U(t)}},qn.prototype.N=function(){if(!(2&this.f)){this.f|=6;for(var e=this.t;e!==void 0;e=e.x)e.t.N()}},Object.defineProperty(qn.prototype,"value",{get:function(){if(1&this.f)throw Error(`Cycle detected`);var e=Vn(this);if(this.h(),e!==void 0&&(e.i=this.i),16&this.f)throw this.v;return this.v}});function Jn(e,t){return new qn(e,t)}function Yn(e){var t=e.m;if(e.m=void 0,typeof t==`function`){Fn++;var n=Mn;Mn=void 0;try{t()}catch(t){throw e.f&=-2,e.f|=8,Xn(e),t}finally{Mn=n,An()}}}function Xn(e){for(var t=e.s;t!==void 0;t=t.n)t.S.U(t);e.x=void 0,e.s=void 0,Yn(e)}function Zn(e){if(Mn!==this)throw Error(`Out-of-order effect`);Kn(this),Mn=e,this.f&=-2,8&this.f&&Xn(this),An()}function Qn(e,t){this.x=e,this.m=void 0,this.s=void 0,this.u=void 0,this.f=32,this.name=t?.name,Nn&&Nn.push(this)}Qn.prototype.c=function(){var e=this.S();try{if(8&this.f||this.x===void 0)return;var t=this.x();typeof t==`function`&&(this.m=t)}finally{e()}},Qn.prototype.S=function(){if(1&this.f)throw Error(`Cycle detected`);this.f|=1,this.f&=-9,Yn(this),Gn(this),Fn++;var e=Mn;return Mn=this,Zn.bind(this,e)},Qn.prototype.N=function(){2&this.f||(this.f|=2,this.u=Pn,Pn=this)},Qn.prototype.d=function(){this.f|=8,1&this.f||Xn(this)},Qn.prototype.dispose=function(){this.d()};function $n(e,t){var n=new Qn(e,t);try{n.c()}catch(e){throw n.d(),e}var r=n.d.bind(n);return r[Symbol.dispose]=r,r}var er=Object.create,tr=Object.defineProperty,nr=Object.defineProperties,rr=Object.getOwnPropertyDescriptor,ir=Object.getOwnPropertyDescriptors,ar=Object.getOwnPropertySymbols,or=Object.prototype.hasOwnProperty,sr=Object.prototype.propertyIsEnumerable,cr=(e,t)=>(t=Symbol[e])?t:Symbol.for(`Symbol.`+e),lr=e=>{throw TypeError(e)},ur=(e,t,n)=>t in e?tr(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,dr=(e,t)=>{for(var n in t||={})or.call(t,n)&&ur(e,n,t[n]);if(ar)for(var n of ar(t))sr.call(t,n)&&ur(e,n,t[n]);return e},fr=(e,t)=>nr(e,ir(t)),pr=(e,t)=>tr(e,`name`,{value:t,configurable:!0}),mr=e=>[,,,er(e?.[cr(`metadata`)]??null)],hr=[`class`,`method`,`getter`,`setter`,`accessor`,`field`,`value`,`get`,`set`],gr=e=>e!==void 0&&typeof e!=`function`?lr(`Function expected`):e,_r=(e,t,n,r,i)=>({kind:hr[e],name:t,metadata:r,addInitializer:e=>n._?lr(`Already initialized`):i.push(gr(e||null))}),vr=(e,t)=>ur(t,cr(`metadata`),e[3]),yr=(e,t,n,r)=>{for(var i=0,a=e[t>>1],o=a&&a.length;i<o;i++)t&1?a[i].call(n):r=a[i].call(n,r);return r},br=(e,t,n,r,i,a)=>{var o,s,c,l,u,d=t&7,f=!!(t&8),p=!!(t&16),m=d>3?e.length+1:d?f?1:2:0,h=hr[d+5],g=d>3&&(e[m-1]=[]),_=e[m]||(e[m]=[]),v=d&&(!p&&!f&&(i=i.prototype),d<5&&(d>3||!p)&&rr(d<4?i:{get[n](){return Cr(this,a)},set[n](e){return Tr(this,a,e)}},n));d?p&&d<4&&pr(a,(d>2?`set `:d>1?`get `:``)+n):pr(i,n);for(var y=r.length-1;y>=0;y--)l=_r(d,n,c={},e[3],_),d&&(l.static=f,l.private=p,u=l.access={has:p?e=>Sr(i,e):e=>n in e},d^3&&(u.get=p?e=>(d^1?Cr:Er)(e,i,d^4?a:v.get):e=>e[n]),d>2&&(u.set=p?(e,t)=>Tr(e,i,t,d^4?a:v.set):(e,t)=>e[n]=t)),s=(0,r[y])(d?d<4?p?a:v[h]:d>4?void 0:{get:v.get,set:v.set}:i,l),c._=1,d^4||s===void 0?gr(s)&&(d>4?g.unshift(s):d?p?a=s:v[h]=s:i=s):typeof s!=`object`||!s?lr(`Object expected`):(gr(o=s.get)&&(v.get=o),gr(o=s.set)&&(v.set=o),gr(o=s.init)&&g.unshift(o));return d||vr(e,i),v&&tr(i,n,v),p?d^4?a:v:i},xr=(e,t,n)=>t.has(e)||lr(`Cannot `+n),Sr=(e,t)=>Object(t)===t?e.has(t):lr(`Cannot use the "in" operator on this value`),Cr=(e,t,n)=>(xr(e,t,`read from private field`),n?n.call(e):t.get(e)),wr=(e,t,n)=>t.has(e)?lr(`Cannot add the same private member more than once`):t instanceof WeakSet?t.add(e):t.set(e,n),Tr=(e,t,n,r)=>(xr(e,t,`write to private field`),r?r.call(e,n):t.set(e,n),n),Er=(e,t,n)=>(xr(e,t,`access private method`),n);function Dr(e,t){if(t){let n;return Jn(()=>{let r=e();return r&&n&&t(n,r)?n:(n=r,r)})}return Jn(e)}function Or(e,t){if(Object.is(e,t))return!0;if(e===null||t===null)return!1;if(typeof e==`function`&&typeof t==`function`)return e===t;if(e instanceof Set&&t instanceof Set){if(e.size!==t.size)return!1;for(let n of e)if(!t.has(n))return!1;return!0}if(Array.isArray(e))return!Array.isArray(t)||e.length!==t.length?!1:!e.some((e,n)=>!Or(e,t[n]));if(typeof e==`object`&&typeof t==`object`){let n=Object.keys(e),r=Object.keys(t);return n.length===r.length?!n.some(n=>!Or(e[n],t[n])):!1}return!1}function R({get:e},t){return{init(e){return Un(e)},get(){return e.call(this).value},set(t){let n=e.call(this);n.peek()!==t&&(n.value=t)}}}function kr(e,t){let n=new WeakMap;return function(){let t=n.get(this);return t||(t=Dr(e.bind(this)),n.set(this,t)),t.value}}function Ar(e=!0){return function(t,n){n.addInitializer(function(){let t=n.kind===`field`||n.static?this:Object.getPrototypeOf(this),r=Object.getOwnPropertyDescriptor(t,n.name);r&&Object.defineProperty(t,n.name,fr(dr({},r),{enumerable:e}))})}}function jr(...e){let t=e.map(e=>$n(e));return()=>t.forEach(e=>e())}var Mr,Nr,Pr,Fr,Ir,Lr=[R],Rr,zr,Br,Vr,Hr,Ur,Wr,Gr,Kr,qr,Jr,Yr,Xr,Zr;Ir=[R],Fr=[R],Pr=[Ar()],Nr=[Ar()],Mr=[Ar()];var Qr=class{constructor(e,t=Object.is){this.defaultValue=e,this.equals=t,yr(Rr,5,this),wr(this,Ur),wr(this,zr,yr(Rr,8,this)),yr(Rr,11,this),wr(this,Wr,yr(Rr,12,this)),yr(Rr,15,this),wr(this,Jr,yr(Rr,16,this)),yr(Rr,19,this),this.reset=this.reset.bind(this),this.reset()}get current(){return Cr(this,Ur,Xr)}get initial(){return Cr(this,Ur,Vr)}get previous(){return Cr(this,Ur,Kr)}set current(e){let t=L(()=>Cr(this,Ur,Xr));e&&t&&this.equals(t,e)||jn(()=>{Cr(this,Ur,Vr)||Tr(this,Ur,e,Hr),Tr(this,Ur,t,qr),Tr(this,Ur,e,Zr)})}reset(e=this.defaultValue){jn(()=>{Tr(this,Ur,void 0,qr),Tr(this,Ur,e,Hr),Tr(this,Ur,e,Zr)})}};Rr=mr(null),zr=new WeakMap,Ur=new WeakSet,Wr=new WeakMap,Jr=new WeakMap,Br=br(Rr,20,`#initial`,Lr,Ur,zr),Vr=Br.get,Hr=Br.set,Gr=br(Rr,20,`#previous`,Ir,Ur,Wr),Kr=Gr.get,qr=Gr.set,Yr=br(Rr,20,`#current`,Fr,Ur,Jr),Xr=Yr.get,Zr=Yr.set,br(Rr,2,`current`,Pr,Qr),br(Rr,2,`initial`,Nr,Qr),br(Rr,2,`previous`,Mr,Qr),vr(Rr,Qr);function $r(e){return L(()=>{let t={};for(let n in e)t[n]=e[n];return t})}var ei,ti=class{constructor(){wr(this,ei,new WeakMap)}get(e,t){return e?Cr(this,ei).get(e)?.get(t):void 0}set(e,t,n){if(e)return Cr(this,ei).has(e)||Cr(this,ei).set(e,new Map),Cr(this,ei).get(e)?.set(t,n)}clear(e){return e?Cr(this,ei).get(e)?.clear():void 0}};ei=new WeakMap;var ni=Object.create,ri=Object.defineProperty,ii=Object.getOwnPropertyDescriptor,ai=Object.getOwnPropertySymbols,oi=Object.prototype.hasOwnProperty,si=Object.prototype.propertyIsEnumerable,ci=(e,t)=>(t=Symbol[e])?t:Symbol.for(`Symbol.`+e),li=e=>{throw TypeError(e)},ui=Math.pow,di=(e,t,n)=>t in e?ri(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,fi=(e,t)=>{for(var n in t||={})oi.call(t,n)&&di(e,n,t[n]);if(ai)for(var n of ai(t))si.call(t,n)&&di(e,n,t[n]);return e},pi=(e,t)=>ri(e,`name`,{value:t,configurable:!0}),mi=e=>[,,,ni(e?.[ci(`metadata`)]??null)],hi=[`class`,`method`,`getter`,`setter`,`accessor`,`field`,`value`,`get`,`set`],gi=e=>e!==void 0&&typeof e!=`function`?li(`Function expected`):e,_i=(e,t,n,r,i)=>({kind:hi[e],name:t,metadata:r,addInitializer:e=>n._?li(`Already initialized`):i.push(gi(e||null))}),vi=(e,t)=>di(t,ci(`metadata`),e[3]),yi=(e,t,n,r)=>{for(var i=0,a=e[t>>1],o=a&&a.length;i<o;i++)t&1?a[i].call(n):r=a[i].call(n,r);return r},bi=(e,t,n,r,i,a)=>{var o,s,c,l,u,d=t&7,f=!!(t&8),p=!!(t&16),m=d>3?e.length+1:d?f?1:2:0,h=hi[d+5],g=d>3&&(e[m-1]=[]),_=e[m]||(e[m]=[]),v=d&&(!p&&!f&&(i=i.prototype),d<5&&(d>3||!p)&&ii(d<4?i:{get[n](){return Ci(this,a)},set[n](e){return Ti(this,a,e)}},n));d?p&&d<4&&pi(a,(d>2?`set `:d>1?`get `:``)+n):pi(i,n);for(var y=r.length-1;y>=0;y--)l=_i(d,n,c={},e[3],_),d&&(l.static=f,l.private=p,u=l.access={has:p?e=>Si(i,e):e=>n in e},d^3&&(u.get=p?e=>(d^1?Ci:Ei)(e,i,d^4?a:v.get):e=>e[n]),d>2&&(u.set=p?(e,t)=>Ti(e,i,t,d^4?a:v.set):(e,t)=>e[n]=t)),s=(0,r[y])(d?d<4?p?a:v[h]:d>4?void 0:{get:v.get,set:v.set}:i,l),c._=1,d^4||s===void 0?gi(s)&&(d>4?g.unshift(s):d?p?a=s:v[h]=s:i=s):typeof s!=`object`||!s?li(`Object expected`):(gi(o=s.get)&&(v.get=o),gi(o=s.set)&&(v.set=o),gi(o=s.init)&&g.unshift(o));return d||vi(e,i),v&&ri(i,n,v),p?d^4?a:v:i},xi=(e,t,n)=>t.has(e)||li(`Cannot `+n),Si=(e,t)=>Object(t)===t?e.has(t):li(`Cannot use the "in" operator on this value`),Ci=(e,t,n)=>(xi(e,t,`read from private field`),n?n.call(e):t.get(e)),wi=(e,t,n)=>t.has(e)?li(`Cannot add the same private member more than once`):t instanceof WeakSet?t.add(e):t.set(e,n),Ti=(e,t,n,r)=>(xi(e,t,`write to private field`),r?r.call(e,n):t.set(e,n),n),Ei=(e,t,n)=>(xi(e,t,`access private method`),n),Di=class e{constructor(e,t){this.x=e,this.y=t}static delta(t,n){return new e(t.x-n.x,t.y-n.y)}static distance(e,t){return Math.hypot(e.x-t.x,e.y-t.y)}static equals(e,t){return e.x===t.x&&e.y===t.y}static from({x:t,y:n}){return new e(t,n)}},Oi=class e{constructor(e,t,n,r){this.left=e,this.top=t,this.width=n,this.height=r,this.scale={x:1,y:1}}get inverseScale(){return{x:1/this.scale.x,y:1/this.scale.y}}translate(t,n){let{top:r,left:i,width:a,height:o,scale:s}=this,c=new e(i+t,r+n,a,o);return c.scale=fi({},s),c}get boundingRectangle(){let{width:e,height:t,left:n,top:r,right:i,bottom:a}=this;return{width:e,height:t,left:n,top:r,right:i,bottom:a}}get center(){let{left:e,top:t,right:n,bottom:r}=this;return new Di((e+n)/2,(t+r)/2)}get area(){let{width:e,height:t}=this;return e*t}equals(t){if(!(t instanceof e))return!1;let{left:n,top:r,width:i,height:a}=this;return n===t.left&&r===t.top&&i===t.width&&a===t.height}containsPoint(e){let{top:t,left:n,bottom:r,right:i}=this;return t<=e.y&&e.y<=r&&n<=e.x&&e.x<=i}intersectionArea(t){return t instanceof e?ki(this,t):0}intersectionRatio(e){let{area:t}=this,n=this.intersectionArea(e);return n/(e.area+t-n)}get bottom(){let{top:e,height:t}=this;return e+t}get right(){let{left:e,width:t}=this;return e+t}get aspectRatio(){let{width:e,height:t}=this;return e/t}get corners(){return[{x:this.left,y:this.top},{x:this.right,y:this.top},{x:this.left,y:this.bottom},{x:this.right,y:this.bottom}]}static from({top:t,left:n,width:r,height:i}){return new e(n,t,r,i)}static delta(e,t,n={x:`center`,y:`center`}){let r=(e,t)=>{let r=n[t],i=t===`x`?e.left:e.top,a=t===`x`?e.width:e.height;return r==`start`?i:r==`end`?i+a:i+a/2};return Di.delta({x:r(e,`x`),y:r(e,`y`)},{x:r(t,`x`),y:r(t,`y`)})}static intersectionRatio(t,n){return e.from(t).intersectionRatio(e.from(n))}};function ki(e,t){let n=Math.max(t.top,e.top),r=Math.max(t.left,e.left),i=Math.min(t.left+t.width,e.left+e.width),a=Math.min(t.top+t.height,e.top+e.height),o=i-r,s=a-n;return r<i&&n<a?o*s:0}var Ai,ji,Mi,Ni,Pi,z=class extends (Mi=Qr,ji=[kr],Ai=[kr],Mi){constructor(e){let t=Di.from(e);super(t,(e,t)=>Di.equals(e,t)),yi(Pi,5,this),wi(this,Ni,0),this.velocity={x:0,y:0}}get delta(){return Di.delta(this.current,this.initial)}get direction(){let{current:e,previous:t}=this;if(!t)return null;let n={x:e.x-t.x,y:e.y-t.y};return!n.x&&!n.y?null:Math.abs(n.x)>Math.abs(n.y)?n.x>0?`right`:`left`:n.y>0?`down`:`up`}get current(){return super.current}set current(e){let{current:t}=this,n=Di.from(e),r={x:n.x-t.x,y:n.y-t.y},i=Date.now(),a=i-Ci(this,Ni),o=e=>Math.round(e/a*100);jn(()=>{Ti(this,Ni,i),this.velocity={x:o(r.x),y:o(r.y)},super.current=n})}reset(e=this.defaultValue){super.reset(Di.from(e)),this.velocity={x:0,y:0}}};Pi=mi(Mi),Ni=new WeakMap,bi(Pi,2,`delta`,ji,z),bi(Pi,2,`direction`,Ai,z),vi(Pi,z);function Fi({x:e,y:t},n){let r=Math.abs(e),i=Math.abs(t);return typeof n==`number`?Math.sqrt(ui(r,2)+ui(i,2))>n:`x`in n&&`y`in n?r>n.x&&i>n.y:`x`in n?r>n.x:`y`in n?i>n.y:!1}var Ii=(e=>(e.Horizontal=`x`,e.Vertical=`y`,e))(Ii||{}),Li=Object.values(Ii),Ri=Object.create,zi=Object.defineProperty,Bi=Object.defineProperties,Vi=Object.getOwnPropertyDescriptor,Hi=Object.getOwnPropertyDescriptors,Ui=Object.getOwnPropertySymbols,Wi=Object.prototype.hasOwnProperty,Gi=Object.prototype.propertyIsEnumerable,Ki=(e,t)=>(t=Symbol[e])?t:Symbol.for(`Symbol.`+e),qi=e=>{throw TypeError(e)},Ji=(e,t,n)=>t in e?zi(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,Yi=(e,t)=>{for(var n in t||={})Wi.call(t,n)&&Ji(e,n,t[n]);if(Ui)for(var n of Ui(t))Gi.call(t,n)&&Ji(e,n,t[n]);return e},Xi=(e,t)=>Bi(e,Hi(t)),Zi=(e,t)=>zi(e,`name`,{value:t,configurable:!0}),Qi=(e,t)=>{var n={};for(var r in e)Wi.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(e!=null&&Ui)for(var r of Ui(e))t.indexOf(r)<0&&Gi.call(e,r)&&(n[r]=e[r]);return n},$i=e=>[,,,Ri(e?.[Ki(`metadata`)]??null)],ea=[`class`,`method`,`getter`,`setter`,`accessor`,`field`,`value`,`get`,`set`],ta=e=>e!==void 0&&typeof e!=`function`?qi(`Function expected`):e,na=(e,t,n,r,i)=>({kind:ea[e],name:t,metadata:r,addInitializer:e=>n._?qi(`Already initialized`):i.push(ta(e||null))}),ra=(e,t)=>Ji(t,Ki(`metadata`),e[3]),B=(e,t,n,r)=>{for(var i=0,a=e[t>>1],o=a&&a.length;i<o;i++)t&1?a[i].call(n):r=a[i].call(n,r);return r},V=(e,t,n,r,i,a)=>{var o,s,c,l,u,d=t&7,f=!!(t&8),p=!!(t&16),m=d>3?e.length+1:d?f?1:2:0,h=ea[d+5],g=d>3&&(e[m-1]=[]),_=e[m]||(e[m]=[]),v=d&&(!p&&!f&&(i=i.prototype),d<5&&(d>3||!p)&&Vi(d<4?i:{get[n](){return oa(this,a)},set[n](e){return sa(this,a,e)}},n));d?p&&d<4&&Zi(a,(d>2?`set `:d>1?`get `:``)+n):Zi(i,n);for(var y=r.length-1;y>=0;y--)l=na(d,n,c={},e[3],_),d&&(l.static=f,l.private=p,u=l.access={has:p?e=>aa(i,e):e=>n in e},d^3&&(u.get=p?e=>(d^1?oa:ca)(e,i,d^4?a:v.get):e=>e[n]),d>2&&(u.set=p?(e,t)=>sa(e,i,t,d^4?a:v.set):(e,t)=>e[n]=t)),s=(0,r[y])(d?d<4?p?a:v[h]:d>4?void 0:{get:v.get,set:v.set}:i,l),c._=1,d^4||s===void 0?ta(s)&&(d>4?g.unshift(s):d?p?a=s:v[h]=s:i=s):typeof s!=`object`||!s?qi(`Object expected`):(ta(o=s.get)&&(v.get=o),ta(o=s.set)&&(v.set=o),ta(o=s.init)&&g.unshift(o));return d||ra(e,i),v&&zi(i,n,v),p?d^4?a:v:i},ia=(e,t,n)=>t.has(e)||qi(`Cannot `+n),aa=(e,t)=>Object(t)===t?e.has(t):qi(`Cannot use the "in" operator on this value`),oa=(e,t,n)=>(ia(e,t,`read from private field`),n?n.call(e):t.get(e)),H=(e,t,n)=>t.has(e)?qi(`Cannot add the same private member more than once`):t instanceof WeakSet?t.add(e):t.set(e,n),sa=(e,t,n,r)=>(ia(e,t,`write to private field`),r?r.call(e,n):t.set(e,n),n),ca=(e,t,n)=>(ia(e,t,`access private method`),n);function la(e,t){return{plugin:e,options:t}}function ua(e){return t=>la(e,t)}function da(e){return typeof e==`function`?{plugin:e,options:void 0}:e}var fa=[R],pa,ma,ha,ga=class{constructor(e,t){this.manager=e,this.options=t,H(this,ma,B(pa,8,this,!1)),B(pa,11,this),H(this,ha,new Set)}enable(){this.disabled=!1}disable(){this.disabled=!0}isDisabled(){return L(()=>this.disabled)}configure(e){this.options=e}registerEffect(e){let t=$n(e.bind(this));return oa(this,ha).add(t),t}destroy(){oa(this,ha).forEach(e=>e())}static configure(e){return la(this,e)}};pa=$i(null),ma=new WeakMap,ha=new WeakMap,V(pa,4,`disabled`,fa,ga,ma),ra(pa,ga);var _a=class extends ga{},va,ya=class{constructor(e){this.manager=e,this.instances=new Map,H(this,va,[])}get values(){return Array.from(this.instances.values())}set values(e){let t=e.map(da).reduce((e,t)=>{let n=e.find(({plugin:e})=>e===t.plugin);return n?(n.options=t.options,e):[...e,t]},[]),n=t.map(({plugin:e})=>e);for(let e of oa(this,va))if(!n.includes(e)){if(e.prototype instanceof _a)continue;this.unregister(e)}for(let{plugin:e,options:n}of t)this.register(e,n);sa(this,va,n)}get(e){return this.instances.get(e)}register(e,t){let n=this.instances.get(e);if(n)return n.options!==t&&(n.options=t),n;let r=new e(this.manager,t);return this.instances.set(e,r),r}unregister(e){let t=this.instances.get(e);t&&(t.destroy(),this.instances.delete(e))}destroy(){for(let e of this.instances.values())e.destroy();this.instances.clear()}};va=new WeakMap;function ba(e,t){return e.priority===t.priority?e.type===t.type?t.value-e.value:t.type-e.type:t.priority-e.priority}var xa=[],Sa,Ca,wa=class extends ga{constructor(e){super(e),H(this,Sa),H(this,Ca),this.computeCollisions=this.computeCollisions.bind(this),sa(this,Ca,Un(xa)),this.destroy=jr(()=>{let e=this.computeCollisions(),t=L(()=>this.manager.dragOperation.position.current);if(e!==xa){let e=oa(this,Sa);if(sa(this,Sa,t),e&&t.x==e.x&&t.y==e.y)return}else sa(this,Sa,void 0);oa(this,Ca).value=e},()=>{let{dragOperation:e}=this.manager;e.status.initialized&&this.forceUpdate()})}forceUpdate(e=!0){L(()=>{e?oa(this,Ca).value=this.computeCollisions():sa(this,Sa,void 0)})}computeCollisions(e,t){let{registry:n,dragOperation:r}=this.manager,{source:i,shape:a,status:o}=r;if(!o.initialized||!a)return xa;let s=[],c=[];for(let a of e??n.droppables){if(a.disabled||i&&!a.accepts(i))continue;let e=t??a.collisionDetector;if(!e)continue;c.push(a),a.shape;let n=L(()=>e({droppable:a,dragOperation:r}));n&&(a.collisionPriority!=null&&(n.priority=a.collisionPriority),s.push(n))}return c.length===0?xa:(s.sort(ba),s)}get collisions(){return oa(this,Ca).value}};Sa=new WeakMap,Ca=new WeakMap;var Ta,Ea,Da=[R],Oa,ka,Aa,ja,Ma,Na,Pa;Ea=[R],Ta=[R];var Fa=class e{constructor(e,t){H(this,ja,B(Aa,8,this)),B(Aa,11,this),H(this,Ma),H(this,Na,B(Aa,12,this)),B(Aa,15,this),H(this,Pa,B(Aa,16,this)),B(Aa,19,this);let{effects:n,id:r,data:i={},disabled:a=!1,register:o=!0}=e,s=r;sa(this,Ma,Un(r)),this.manager=t,this.data=i,this.disabled=a,this.effects=()=>[()=>{let{id:e,manager:t}=this;if(e!==s)return s=e,t?.registry.register(this),()=>t?.registry.unregister(this)},...n?.()??[]],this.register=this.register.bind(this),this.unregister=this.unregister.bind(this),this.destroy=this.destroy.bind(this),t&&o&&queueMicrotask(this.register)}get id(){let t=oa(this,Ma).value;return e.pendingIdChanges?.get(this)??t}set id(t){t!==(e.pendingIdChanges?.get(this)??oa(this,Ma).peek())&&(e.pendingIdChanges||(e.pendingIdChanges=new Map,queueMicrotask(()=>{var t;return ca(t=e,Oa,ka).call(t)})),e.pendingIdChanges.set(this,t))}register(){return this.manager?.registry.register(this)}unregister(){var e;(e=this.manager)==null||e.registry.unregister(this)}destroy(){var e;(e=this.manager)==null||e.registry.unregister(this)}};Aa=$i(null),Oa=new WeakSet,ka=function(){let e=Fa.pendingIdChanges;Fa.pendingIdChanges=null,e&&jn(()=>{for(let[t,n]of e)oa(t,Ma).value=n})},ja=new WeakMap,Ma=new WeakMap,Na=new WeakMap,Pa=new WeakMap,V(Aa,4,`manager`,Da,Fa,ja),V(Aa,4,`data`,Ea,Fa,Na),V(Aa,4,`disabled`,Ta,Fa,Pa),H(Fa,Oa),ra(Aa,Fa),Fa.pendingIdChanges=null;var Ia=Fa,La=class{constructor(){this.map=Un(new Map),this.cleanupFunctions=new WeakMap,this.register=(e,t)=>{let n=this.map.peek(),r=n.get(e),i=()=>this.unregister(e,t);if(r===t)return i;r&&r.id===e&&(this.cleanupFunctions.get(r)?.(),this.cleanupFunctions.delete(r));let a=new Map(n);for(let[r,i]of n)if(i===t&&r!==e){a.delete(r);break}a.set(e,t),this.map.value=a;let o=jr(...t.effects());return this.cleanupFunctions.set(t,o),i},this.unregister=(e,t)=>{let n=this.map.peek();if(n.get(e)!==t)return;this.cleanupFunctions.get(t)?.(),this.cleanupFunctions.delete(t);let r=new Map(n);r.delete(e),this.map.value=r}}[Symbol.iterator](){return this.map.peek().values()}get value(){return this.map.value.values()}has(e){return this.map.value.has(e)}get(e){return this.map.value.get(e)}destroy(){for(let e of this)this.cleanupFunctions.get(e)?.(),e.destroy();this.map.value=new Map}},Ra,za,Ba,Va,Ha,Ua,Wa,Ga,Ka,qa,Ja,Ya=class extends (Wa=Ia,Ua=[R],Ha=[R],Va=[R],Ba=[kr],za=[kr],Ra=[kr],Wa){constructor(e,t){var n=e,{modifiers:r,type:i,sensors:a,plugins:o,effects:s}=n,c=Qi(n,[`modifiers`,`type`,`sensors`,`plugins`,`effects`]);super(Xi(Yi({},c),{effects:()=>[...s?.()??[],()=>{let{manager:e,plugins:t}=this;if(!(!e||!t))for(let n of t){let{plugin:t}=da(n);e.registry.plugins.register(t)}}]}),t),B(Ga,5,this),H(this,Ka,B(Ga,8,this)),B(Ga,11,this),H(this,qa,B(Ga,12,this)),B(Ga,15,this),H(this,Ja,B(Ga,16,this,this.isDragSource?`dragging`:`idle`)),B(Ga,19,this),this.type=i,this.sensors=a,this.modifiers=r,this.alignment=c.alignment,this.plugins=o}pluginConfig(e){if(this.plugins)for(let t of this.plugins){let n=da(t);if(n.plugin===e)return n.options}}get isDropping(){return this.status===`dropping`&&this.isDragSource}get isDragging(){return this.status===`dragging`&&this.isDragSource}get isDragSource(){return this.manager?.dragOperation.source?.id===this.id}};Ga=$i(Wa),Ka=new WeakMap,qa=new WeakMap,Ja=new WeakMap,V(Ga,4,`type`,Ua,Ya,Ka),V(Ga,4,`modifiers`,Ha,Ya,qa),V(Ga,4,`status`,Va,Ya,Ja),V(Ga,2,`isDropping`,Ba,Ya),V(Ga,2,`isDragging`,za,Ya),V(Ga,2,`isDragSource`,Ra,Ya),ra(Ga,Ya);var Xa,Za,Qa,$a,eo,to,no,ro,io,ao,oo,so,co,lo=class extends (no=Ia,to=[R],eo=[R],$a=[R],Qa=[R],Za=[R],Xa=[kr],no){constructor(e,t){var n=e,{accept:r,collisionDetector:i,collisionPriority:a,type:o}=n,s=Qi(n,[`accept`,`collisionDetector`,`collisionPriority`,`type`]);super(s,t),B(ro,5,this),H(this,io,B(ro,8,this)),B(ro,11,this),H(this,ao,B(ro,12,this)),B(ro,15,this),H(this,oo,B(ro,16,this)),B(ro,19,this),H(this,so,B(ro,20,this)),B(ro,23,this),H(this,co,B(ro,24,this)),B(ro,27,this),this.accept=r,this.collisionDetector=i,this.collisionPriority=a,this.type=o}accepts(e){let{accept:t}=this;return t?typeof t==`function`?t(e):e.type?Array.isArray(t)?t.includes(e.type):e.type===t:!1:!0}get isDropTarget(){return this.manager?.dragOperation.target?.id===this.id}};ro=$i(no),io=new WeakMap,ao=new WeakMap,oo=new WeakMap,so=new WeakMap,co=new WeakMap,V(ro,4,`accept`,to,lo,io),V(ro,4,`type`,eo,lo,ao),V(ro,4,`collisionDetector`,$a,lo,oo),V(ro,4,`collisionPriority`,Qa,lo,so),V(ro,4,`shape`,Za,lo,co),V(ro,2,`isDropTarget`,Xa,lo),ra(ro,lo);var U=class{constructor(){this.registry=new Map}addEventListener(e,t){let{registry:n}=this,r=new Set(n.get(e));return r.add(t),n.set(e,r),()=>this.removeEventListener(e,t)}removeEventListener(e,t){let{registry:n}=this,r=new Set(n.get(e));r.delete(t),n.set(e,r)}dispatch(e,...t){let{registry:n}=this,r=n.get(e);if(r)for(let e of r)e(...t)}},uo=class extends U{constructor(e){super(),this.manager=e}dispatch(e,t){let n=[t,this.manager];super.dispatch(e,...n)}};function fo(e,t=!0){let n=!1;return Xi(Yi({},e),{cancelable:t,get defaultPrevented(){return n},preventDefault(){t&&(n=!0)}})}var po=class extends _a{constructor(e){super(e);let t=(e,t)=>e.map(({id:e})=>e).join(``)===t.map(({id:e})=>e).join(``),n=[];this.destroy=jr(()=>{let{dragOperation:t,collisionObserver:r}=e;t.status.initializing&&(n=[],r.enable())},()=>{let{collisionObserver:r,monitor:i}=e,{collisions:a}=r;if(r.isDisabled()||Ia.pendingIdChanges)return;let o=fo({collisions:a});if(i.dispatch(`collision`,o),o.defaultPrevented||t(a,n))return;n=a;let[s]=a;L(()=>{s?.id!==e.dragOperation.target?.id&&(r.disable(),e.actions.setDropTarget(s?.id).then(()=>{r.enable()}))})})}},mo=(e=>(e[e.Lowest=0]=`Lowest`,e[e.Low=1]=`Low`,e[e.Normal=2]=`Normal`,e[e.High=3]=`High`,e[e.Highest=4]=`Highest`,e))(mo||{}),ho=(e=>(e[e.Collision=0]=`Collision`,e[e.ShapeIntersection=1]=`ShapeIntersection`,e[e.PointerIntersection=2]=`PointerIntersection`,e))(ho||{}),go,_o,vo,yo,bo,xo,So=[R],Co,wo;xo=[kr],bo=[kr],yo=[kr],vo=[kr],_o=[kr],go=[kr];var To=class{constructor(){B(Co,5,this),H(this,wo,B(Co,8,this,`idle`)),B(Co,11,this)}get current(){return this.value}get idle(){return this.value===`idle`}get initializing(){return this.value===`initializing`}get initialized(){let{value:e}=this;return e!==`idle`&&e!==`initialization-pending`}get dragging(){return this.value===`dragging`}get dropped(){return this.value===`dropped`}set(e){this.value=e}};Co=$i(null),wo=new WeakMap,V(Co,4,`value`,So,To,wo),V(Co,2,`current`,xo,To),V(Co,2,`idle`,bo,To),V(Co,2,`initializing`,yo,To),V(Co,2,`initialized`,vo,To),V(Co,2,`dragging`,_o,To),V(Co,2,`dropped`,go,To),ra(Co,To);var Eo=class{constructor(e){this.manager=e}setDragSource(e){let{dragOperation:t}=this.manager;t.sourceIdentifier=typeof e==`string`||typeof e==`number`?e:e.id}setDropTarget(e){return L(()=>{let{dragOperation:t}=this.manager,n=e??null;if(t.targetIdentifier===n)return Promise.resolve(!1);t.targetIdentifier=n;let r=fo({operation:t.snapshot()});return t.status.dragging&&this.manager.monitor.dispatch(`dragover`,r),this.manager.renderer.rendering.then(()=>r.defaultPrevented)})}start(e){return L(()=>{let{dragOperation:t}=this.manager;if(e.source!=null&&this.setDragSource(e.source),!t.source)throw Error(`Cannot start a drag operation without a drag source`);if(!t.status.idle)throw Error(`Cannot start a drag operation while another is active`);let n=new AbortController,{event:r,coordinates:i}=e;jn(()=>{t.status.set(`initialization-pending`),t.shape=null,t.canceled=!1,t.activatorEvent=r??null,t.position.reset(i)});let a=fo({operation:t.snapshot()});return this.manager.monitor.dispatch(`beforedragstart`,a),a.defaultPrevented?(t.reset(),n.abort(),n):(t.status.set(`initializing`),t.controller=n,this.manager.renderer.rendering.then(()=>{if(n.signal.aborted)return;let{status:e}=t;e.current===`initializing`&&jn(()=>{t.status.set(`dragging`),this.manager.monitor.dispatch(`dragstart`,{nativeEvent:r,operation:t.snapshot(),cancelable:!1})})}),n)})}move(e){return L(()=>{let{dragOperation:t}=this.manager,{status:n,controller:r}=t;if(!n.dragging||!r||r.signal.aborted)return;let i=fo({nativeEvent:e.event,operation:t.snapshot(),by:e.by,to:e.to},e.cancelable??!0);(e.propagate??!0)&&this.manager.monitor.dispatch(`dragmove`,i),queueMicrotask(()=>{if(i.defaultPrevented)return;let n=e.to??{x:t.position.current.x+(e.by?.x??0),y:t.position.current.y+(e.by?.y??0)};t.position.current=n})})}stop(e={}){return L(()=>{let{dragOperation:t}=this.manager,{controller:n}=t;if(!n||n.signal.aborted)return;let r,i=()=>{let e={resume:()=>{},abort:()=>{}};return r=new Promise((t,n)=>{e.resume=t,e.abort=n}),e};n.abort();let a=()=>{this.manager.renderer.rendering.then(()=>{t.status.set(`dropped`);let e=L(()=>t.source?.status===`dropping`),r=()=>{t.controller===n&&(t.controller=void 0),t.reset()};if(e){let{source:e}=t,n=$n(()=>{e?.status===`idle`&&(n(),r())})}else this.manager.renderer.rendering.then(r)})};t.canceled=e.canceled??!1,this.manager.monitor.dispatch(`dragend`,{nativeEvent:e.event,operation:t.snapshot(),canceled:e.canceled??!1,suspend:i}),r?r.then(a).catch(()=>t.reset()):a()})}},Do=class extends ga{constructor(e,t){super(e,t),this.manager=e,this.options=t}},Oo=class extends AbortController{constructor(e,t){super(),this.constraints=e,this.onActivate=t,this.activated=!1;for(let t of e??[])t.controller=this}onEvent(e){if(!this.activated)if(this.constraints?.length)for(let t of this.constraints)t.onEvent(e);else this.activate(e)}activate(e){this.activated||(this.activated=!0,this.onActivate(e))}abort(e){this.activated=!1,super.abort(e)}},ko,Ao=class{constructor(e){this.options=e,H(this,ko)}set controller(e){sa(this,ko,e),e.signal.addEventListener(`abort`,()=>this.abort())}activate(e){var t;(t=oa(this,ko))==null||t.activate(e)}};ko=new WeakMap;var jo=class extends ga{constructor(e,t){super(e,t),this.manager=e,this.options=t}apply(e){return e.transform}},Mo=class{constructor(e){this.draggables=new La,this.droppables=new La,this.plugins=new ya(e),this.sensors=new ya(e),this.modifiers=new ya(e)}register(e,t){if(e instanceof Ya)return this.draggables.register(e.id,e);if(e instanceof lo)return this.droppables.register(e.id,e);if(e.prototype instanceof jo)return this.modifiers.register(e,t);if(e.prototype instanceof Do)return this.sensors.register(e,t);if(e.prototype instanceof ga)return this.plugins.register(e,t);throw Error(`Invalid instance type`)}unregister(e){if(e instanceof Ia)return e instanceof Ya?this.draggables.unregister(e.id,e):e instanceof lo?this.droppables.unregister(e.id,e):()=>{};if(e.prototype instanceof jo)return this.modifiers.unregister(e);if(e.prototype instanceof Do)return this.sensors.unregister(e);if(e.prototype instanceof ga)return this.plugins.unregister(e);throw Error(`Invalid instance type`)}destroy(){this.draggables.destroy(),this.droppables.destroy(),this.plugins.destroy(),this.sensors.destroy(),this.modifiers.destroy()}},No,Po,Fo,Io,Lo,Ro,zo,Bo,Vo=[kr],Ho,Uo,Wo,Go,Ko,qo,Jo,Yo,Xo,Zo;Bo=[R],zo=[R],Ro=[R],Lo=[R],Io=[R],Fo=[kr],Po=[kr],No=[kr];var Qo=class{constructor(e){B(Go,5,this),H(this,Ho),H(this,Uo),H(this,Wo,new Qr(void 0,(e,t)=>e&&t?e.equals(t):e===t)),this.status=new To,H(this,Ko,B(Go,8,this,!1)),B(Go,11,this),H(this,qo,B(Go,12,this,null)),B(Go,15,this),H(this,Jo,B(Go,16,this,null)),B(Go,19,this),H(this,Yo,B(Go,20,this,null)),B(Go,23,this),H(this,Xo,B(Go,24,this,[])),B(Go,27,this),this.position=new z({x:0,y:0}),H(this,Zo,{x:0,y:0}),sa(this,Ho,e)}get shape(){let{current:e,initial:t,previous:n}=oa(this,Wo);return!e||!t?null:{current:e,initial:t,previous:n}}set shape(e){e?oa(this,Wo).current=e:oa(this,Wo).reset()}get source(){let e=this.sourceIdentifier;if(e==null)return null;let t=oa(this,Ho).registry.draggables.get(e);return t&&sa(this,Uo,t),t??oa(this,Uo)??null}get target(){let e=this.targetIdentifier;return e==null?null:oa(this,Ho).registry.droppables.get(e)??null}get transform(){let{x:e,y:t}=this.position.delta,n={x:e,y:t};for(let e of this.modifiers)n=e.apply(Xi(Yi({},this.snapshot()),{transform:n}));return sa(this,Zo,n),n}snapshot(){return L(()=>({source:this.source,target:this.target,activatorEvent:this.activatorEvent,transform:oa(this,Zo),shape:this.shape?$r(this.shape):null,position:$r(this.position),status:$r(this.status),canceled:this.canceled}))}reset(){jn(()=>{this.status.set(`idle`),this.sourceIdentifier=null,this.targetIdentifier=null,oa(this,Wo).reset(),this.position.reset({x:0,y:0}),sa(this,Zo,{x:0,y:0}),this.modifiers=[]})}};Go=$i(null),Ho=new WeakMap,Uo=new WeakMap,Wo=new WeakMap,Ko=new WeakMap,qo=new WeakMap,Jo=new WeakMap,Yo=new WeakMap,Xo=new WeakMap,Zo=new WeakMap,V(Go,2,`shape`,Vo,Qo),V(Go,4,`canceled`,Bo,Qo,Ko),V(Go,4,`activatorEvent`,zo,Qo,qo),V(Go,4,`sourceIdentifier`,Ro,Qo,Jo),V(Go,4,`targetIdentifier`,Lo,Qo,Yo),V(Go,4,`modifiers`,Io,Qo,Xo),V(Go,2,`source`,Fo,Qo),V(Go,2,`target`,Po,Qo),V(Go,2,`transform`,No,Qo),ra(Go,Qo);var $o={get rendering(){return Promise.resolve()}};function es(e,t){return typeof e==`function`?e(t):e??t}var ts=class{constructor(e){this.destroy=()=>{this.dragOperation.status.idle||this.actions.stop({canceled:!0}),this.dragOperation.modifiers.forEach(e=>e.destroy()),this.registry.destroy(),this.collisionObserver.destroy()};let t=e??{},n=es(t.plugins,[]),r=es(t.sensors,[]),i=es(t.modifiers,[]),a=t.renderer??$o,o=new uo(this),s=new Mo(this);this.registry=s,this.monitor=o,this.renderer=a,this.actions=new Eo(this),this.dragOperation=new Qo(this),this.collisionObserver=new wa(this),this.plugins=[po,...n],this.modifiers=i,this.sensors=r;let{destroy:c}=this,l=jr(()=>{let e=L(()=>this.dragOperation.modifiers),t=this.modifiers;for(let n of e)t.includes(n)||n.destroy();this.dragOperation.modifiers=(this.dragOperation.source?.modifiers)?.map(e=>{let{plugin:t,options:n}=da(e);return new t(this,n)})??t});this.destroy=()=>{l(),c()}}get plugins(){return this.registry.plugins.values}set plugins(e){this.registry.plugins.values=e}get modifiers(){return this.registry.modifiers.values}set modifiers(e){this.registry.modifiers.values=e}get sensors(){return this.registry.sensors.values}set sensors(e){this.registry.sensors.values=e}},ns=e=>{throw TypeError(e)},rs=(e,t,n)=>t.has(e)||ns(`Cannot `+n),W=(e,t,n)=>(rs(e,t,`read from private field`),t.get(e)),is=(e,t,n)=>t.has(e)?ns(`Cannot add the same private member more than once`):t instanceof WeakSet?t.add(e):t.set(e,n),as=(e,t,n,r)=>(rs(e,t,`write to private field`),t.set(e,n),n),os=(e,t,n)=>(rs(e,t,`access private method`),n);function ss(e){return e?e instanceof KeyframeEffect?!0:`getKeyframes`in e&&typeof e.getKeyframes==`function`:!1}function cs(e,t){let n=e.getAnimations(),r=null;for(let e of n){if(e.playState!==`running`)continue;let{effect:n}=e,i=(ss(n)?n.getKeyframes():[]).filter(t);i.length>0&&(r=[i[i.length-1],e])}return r}function ls(e){let{width:t,height:n,top:r,left:i,bottom:a,right:o}=e.getBoundingClientRect();return{width:t,height:n,top:r,left:i,bottom:a,right:o}}function us(e){let t=Object.prototype.toString.call(e);return t===`[object Window]`||t===`[object global]`}function ds(e){return`nodeType`in e}function fs(e){return e?us(e)?e:ds(e)?`defaultView`in e?e.defaultView??window:e.ownerDocument?.defaultView??window:window:window}function ps(e){let{Document:t}=fs(e);return e instanceof t||`nodeType`in e&&e.nodeType===Node.DOCUMENT_NODE}function ms(e){return!e||us(e)?!1:e instanceof fs(e).HTMLElement||`namespaceURI`in e&&typeof e.namespaceURI==`string`&&e.namespaceURI.endsWith(`html`)}function hs(e){return e instanceof fs(e).SVGElement||`namespaceURI`in e&&typeof e.namespaceURI==`string`&&e.namespaceURI.endsWith(`svg`)}function gs(e){return e?us(e)?e.document:ds(e)?ps(e)?e:ms(e)||hs(e)?e.ownerDocument:document:document:document}function _s(e){let{documentElement:t}=gs(e),n=fs(e).visualViewport,r=n?.width??t.clientWidth,i=n?.height??t.clientHeight,a=n?.offsetTop??0,o=n?.offsetLeft??0;return{top:a,left:o,right:o+r,bottom:a+i,width:r,height:i}}function vs(e,t){if(ys(e)&&e.open===!1)return!1;let{overflow:n,overflowX:r,overflowY:i}=getComputedStyle(e);return n===`visible`&&r===`visible`&&i===`visible`}function ys(e){return e.tagName===`DETAILS`}function bs(e,t=e.getBoundingClientRect(),n=0){let r=t,{ownerDocument:i}=e,a=i.defaultView??window,o=e.parentElement;for(;o&&o!==i.documentElement;){if(!vs(o)){let e=o.getBoundingClientRect(),t=n*(e.bottom-e.top),i=n*(e.right-e.left),a=n*(e.bottom-e.top),s=n*(e.right-e.left);r={top:Math.max(r.top,e.top-t),right:Math.min(r.right,e.right+i),bottom:Math.min(r.bottom,e.bottom+a),left:Math.max(r.left,e.left-s),width:0,height:0},r.width=r.right-r.left,r.height=r.bottom-r.top}o=o.parentElement}let s=a.visualViewport,c=s?.offsetTop??0,l=s?.offsetLeft??0,u=s?.width??a.innerWidth,d=s?.height??a.innerHeight,f=n*d,p=n*u;return r={top:Math.max(r.top,c-f),right:Math.min(r.right,l+u+p),bottom:Math.min(r.bottom,c+d+f),left:Math.max(r.left,l-p),width:0,height:0},r.width=r.right-r.left,r.height=r.bottom-r.top,r.width<0&&(r.width=0),r.height<0&&(r.height=0),r}function xs(e){return{x:e.clientX,y:e.clientY}}var Ss=typeof window<`u`&&window.document!==void 0&&window.document.createElement!==void 0;function Cs(e=document,t=new Set){if(t.has(e))return[];t.add(e);let n=[e];for(let r of Array.from(e.querySelectorAll(`iframe, frame`)))try{let e=r.contentDocument;e&&!t.has(e)&&n.push(...Cs(e,t))}catch{}try{let r=e.defaultView;if(r&&r!==window.top){let i=r.parent;i&&i.document&&i.document!==e&&n.push(...Cs(i.document,t))}}catch{}return n}function ws(){return/^((?!chrome|android).)*safari/i.test(navigator.userAgent)}function Ts(){let e=ws()?window.visualViewport:null;return{x:e?.offsetLeft??0,y:e?.offsetTop??0}}function Es(e){return!e||!ds(e)?!1:e instanceof fs(e).ShadowRoot}function Ds(e){if(e&&ds(e)){let t=e.getRootNode();if(Es(t)||t instanceof Document)return t}return gs(e)}function Os(e){return e.matchMedia(`(prefers-reduced-motion: reduce)`).matches}function ks(e){let t=`input, textarea, select, canvas, [contenteditable]`,n=e.cloneNode(!0),r=Array.from(e.querySelectorAll(t));return Array.from(n.querySelectorAll(t)).forEach((e,t)=>{let n=r[t];As(e)&&As(n)&&(e.type!==`file`&&(e.value=n.value),e.type===`radio`&&e.name&&(e.name=`Cloned__${e.name}`)),js(e)&&js(n)&&n.width>0&&n.height>0&&e.getContext(`2d`)?.drawImage(n,0,0)}),n}function As(e){return`value`in e}function js(e){return e.tagName===`CANVAS`}function Ms(e,{x:t,y:n}){let r=e.elementFromPoint(t,n);if(Ns(r)){let{contentDocument:e}=r;if(e){let{left:i,top:a}=r.getBoundingClientRect();return Ms(e,{x:t-i,y:n-a})}}return r}function Ns(e){return e?.tagName===`IFRAME`}var Ps=new WeakMap;function Fs(e){return!!e.closest(`
      input:not([disabled]),
      select:not([disabled]),
      textarea:not([disabled]),
      button:not([disabled]),
      a[href],
      [contenteditable]:not([contenteditable="false"])
    `)}var Is=class{constructor(){this.entries=new Set,this.clear=()=>{for(let e of this.entries){let[t,{type:n,listener:r,options:i}]=e;t.removeEventListener(n,r,i)}this.entries.clear()}}bind(e,t){let n=Array.isArray(e)?e:[e],r=Array.isArray(t)?t:[t],i=[];for(let e of n)for(let t of r){let{type:n,listener:r,options:a}=t,o=[e,t];e.addEventListener(n,r,a),this.entries.add(o),i.push(o)}let a=this.entries;return function(){for(let e of i){let[t,{type:n,listener:r,options:i}]=e;t.removeEventListener(n,r,i),a.delete(e)}}}};function Ls(e){let t=e?.ownerDocument.defaultView;if(t&&t.self!==t.parent)return t.frameElement}function Rs(e){let t=new Set,n=Ls(e);for(;n;)t.add(n),n=Ls(n);return t}function zs(e,t){let n=setTimeout(e,t);return()=>clearTimeout(n)}function Bs(e,t){let n=()=>performance.now(),r,i;return function(...a){let o=this;i?(r?.(),r=zs(()=>{e.apply(o,a),i=n()},t-(n()-i))):(e.apply(o,a),i=n())}}function Vs(e,t){return e===t?!0:!e||!t?!1:e.top==t.top&&e.left==t.left&&e.right==t.right&&e.bottom==t.bottom}function Hs(e,t=e.getBoundingClientRect()){let{width:n,height:r}=bs(e,t);return n>0&&r>0}var Us=Ss?ResizeObserver:class{observe(){}unobserve(){}disconnect(){}},Ws,Gs=class extends Us{constructor(e){super(t=>{if(!W(this,Ws)){as(this,Ws,!0);return}e(t,this)}),is(this,Ws,!1)}};Ws=new WeakMap;var Ks=Array.from({length:100},(e,t)=>t/100),qs=75,Js,Ys,Xs,Zs,Qs,$s,ec,tc,nc,rc,ic,ac=class{constructor(e,t,n={debug:!1,skipInitial:!1}){this.element=e,this.callback=t,is(this,nc),this.disconnect=()=>{var e,t,n;as(this,ec,!0),(e=W(this,Xs))==null||e.disconnect(),(t=W(this,Zs))==null||t.disconnect(),W(this,Qs).disconnect(),(n=W(this,$s))==null||n.remove()},is(this,Js,!0),is(this,Ys),is(this,Xs),is(this,Zs),is(this,Qs),is(this,$s),is(this,ec,!1),is(this,tc,Bs(()=>{var e;let{element:t}=this;if((e=W(this,Zs))==null||e.disconnect(),W(this,ec)||!W(this,Js)||!t.isConnected)return;let n=t.ownerDocument??document,{innerHeight:r,innerWidth:i}=n.defaultView??window,a=t.getBoundingClientRect(),{top:o,left:s,bottom:c,right:l}=bs(t,a),u=-Math.floor(o),d=-Math.floor(s),f=`${u}px ${-Math.floor(i-l)}px ${-Math.floor(r-c)}px ${d}px`;this.boundingClientRect=a,as(this,Zs,new IntersectionObserver(e=>{let[n]=e,{intersectionRect:r}=n;(n.intersectionRatio===1?Oi.intersectionRatio(r,bs(t)):n.intersectionRatio)!==1&&W(this,tc).call(this)},{threshold:Ks,rootMargin:f,root:n})),W(this,Zs).observe(t),os(this,nc,rc).call(this)},qs)),this.boundingClientRect=e.getBoundingClientRect(),as(this,Js,Hs(e,this.boundingClientRect));let r=!0;this.callback=e=>{r&&(r=!1,n.skipInitial)||t(e)};let i=e.ownerDocument;n?.debug&&(as(this,$s,document.createElement(`div`)),W(this,$s).style.background=`rgba(0,0,0,0.15)`,W(this,$s).style.position=`fixed`,W(this,$s).style.pointerEvents=`none`,i.body.appendChild(W(this,$s))),as(this,Qs,new IntersectionObserver(t=>{var n,r;let{boundingClientRect:i,isIntersecting:a}=t[t.length-1],{width:o,height:s}=i,c=W(this,Js);as(this,Js,a),!(!o&&!s)&&(c&&!a?((n=W(this,Zs))==null||n.disconnect(),this.callback(null),(r=W(this,Xs))==null||r.disconnect(),as(this,Xs,void 0),W(this,$s)&&(W(this,$s).style.visibility=`hidden`)):W(this,tc).call(this),a&&!W(this,Xs)&&(as(this,Xs,new Gs(W(this,tc))),W(this,Xs).observe(e)))},{threshold:Ks,root:i})),W(this,Js)&&!n.skipInitial&&this.callback(this.boundingClientRect),W(this,Qs).observe(e)}};Js=new WeakMap,Ys=new WeakMap,Xs=new WeakMap,Zs=new WeakMap,Qs=new WeakMap,$s=new WeakMap,ec=new WeakMap,tc=new WeakMap,nc=new WeakSet,rc=function(){W(this,ec)||(os(this,nc,ic).call(this),!Vs(this.boundingClientRect,W(this,Ys))&&(this.callback(this.boundingClientRect),as(this,Ys,this.boundingClientRect)))},ic=function(){if(W(this,$s)){let{top:e,left:t,width:n,height:r}=bs(this.element);W(this,$s).style.overflow=`hidden`,W(this,$s).style.visibility=`visible`,W(this,$s).style.top=`${Math.floor(e)}px`,W(this,$s).style.left=`${Math.floor(t)}px`,W(this,$s).style.width=`${Math.floor(n)}px`,W(this,$s).style.height=`${Math.floor(r)}px`}};var oc=new WeakMap,sc=new WeakMap;function cc(e,t){let n=oc.get(e);return n||={disconnect:new ac(e,t=>{let n=oc.get(e);n&&n.callbacks.forEach(e=>e(t))},{skipInitial:!0}).disconnect,callbacks:new Set},n.callbacks.add(t),oc.set(e,n),()=>{n.callbacks.delete(t),n.callbacks.size===0&&(oc.delete(e),n.disconnect())}}function lc(e,t){let n=new Set;for(let r of e){let e=cc(r,t);n.add(e)}return()=>n.forEach(e=>e())}function uc(e,t){let n=e.ownerDocument;if(!sc.has(n)){let e=new AbortController,t=new Set;document.addEventListener(`scroll`,e=>t.forEach(t=>t(e)),{capture:!0,passive:!0,signal:e.signal}),sc.set(n,{disconnect:()=>e.abort(),listeners:t})}let{listeners:r,disconnect:i}=sc.get(n)??{};return!r||!i?()=>{}:(r.add(t),()=>{r.delete(t),r.size===0&&(i(),sc.delete(n))})}var dc,fc,pc,mc,hc=class{constructor(e,t,n){this.callback=t,is(this,dc),is(this,fc,!1),is(this,pc),is(this,mc,Bs(e=>{if(!W(this,fc)&&e.target&&`contains`in e.target&&typeof e.target.contains==`function`){for(let t of W(this,pc))if(e.target.contains(t)){this.callback(W(this,dc).boundingClientRect);break}}},qs));let r=Rs(e),i=lc(r,t),a=uc(e,W(this,mc));as(this,pc,r),as(this,dc,new ac(e,t,n)),this.disconnect=()=>{W(this,fc)||(as(this,fc,!0),i(),a(),W(this,dc).disconnect())}}};dc=new WeakMap,fc=new WeakMap,pc=new WeakMap,mc=new WeakMap;function gc(e){return`showPopover`in e&&`hidePopover`in e&&typeof e.showPopover==`function`&&typeof e.hidePopover==`function`}function _c(e){try{gc(e)&&e.isConnected&&e.hasAttribute(`popover`)&&!e.matches(`:popover-open`)&&e.showPopover()}catch{}}function vc(e){return!Ss||!e?!1:e===gs(e).scrollingElement}function yc(e){let t=fs(e),n=vc(e)?_s(e):ls(e),r=t.visualViewport,i=vc(e)?{height:r?.height??t.innerHeight,width:r?.width??t.innerWidth}:{height:e.clientHeight,width:e.clientWidth},a={current:{x:e.scrollLeft,y:e.scrollTop},max:{x:e.scrollWidth-i.width,y:e.scrollHeight-i.height}};return{rect:n,position:a,isTop:a.current.y<=0,isLeft:a.current.x<=0,isBottom:a.current.y>=a.max.y,isRight:a.current.x>=a.max.x}}function bc(e,t){let{isTop:n,isBottom:r,isLeft:i,isRight:a,position:o}=yc(e),{x:s,y:c}=t??{x:0,y:0},l=!n&&o.current.y+c>0,u=!r&&o.current.y+c<o.max.y,d=!i&&o.current.x+s>0,f=!a&&o.current.x+s<o.max.x;return{top:l,bottom:u,left:d,right:f,x:d||f,y:l||u}}var xc=class{constructor(e){this.scheduler=e,this.pending=!1,this.tasks=new Set,this.resolvers=new Set,this.flush=()=>{let{tasks:e,resolvers:t}=this;this.pending=!1,this.tasks=new Set,this.resolvers=new Set;for(let t of e)t();for(let e of t)e()}}schedule(e){return this.tasks.add(e),this.pending||(this.pending=!0,this.scheduler(this.flush)),new Promise(e=>this.resolvers.add(e))}},Sc=new xc(e=>{typeof requestAnimationFrame==`function`?requestAnimationFrame(e):e()}),Cc=new xc(e=>setTimeout(e,50)),wc=new Map,Tc=wc.clear.bind(wc);function Ec(e,t=!1){if(!t)return Dc(e);let n=wc.get(e);return n||(n=Dc(e),wc.set(e,n),Cc.schedule(Tc),n)}function Dc(e){return fs(e).getComputedStyle(e)}function Oc(e,t=Ec(e,!0)){return t.position===`fixed`||t.position===`sticky`}function kc(e,t=Ec(e,!0)){let n=/(auto|scroll|overlay)/;return[`overflow`,`overflowX`,`overflowY`].some(e=>{let r=t[e];return typeof r==`string`?n.test(r):!1})}var Ac={excludeElement:!0,escapeShadowDOM:!0};function jc(e,t=Ac){let{limit:n,excludeElement:r,escapeShadowDOM:i}=t,a=new Set;function o(t){if(n!=null&&a.size>=n||!t)return a;if(ps(t)&&t.scrollingElement!=null&&!a.has(t.scrollingElement))return a.add(t.scrollingElement),a;if(i&&Es(t))return o(t.host);if(!ms(t))return hs(t)?o(t.parentElement):a;if(a.has(t))return a;let s=Ec(t,!0);if(r&&t===e||kc(t,s)&&a.add(t),Oc(t,s)){let{scrollingElement:e}=t.ownerDocument;return e&&a.add(e),a}return o(t.parentNode)}return e?o(e):a}function Mc(e,t=window.frameElement){let n={x:0,y:0,scaleX:1,scaleY:1};if(!e)return n;let r=Ls(e);for(;r;){if(r===t)return n;let e=ls(r),{x:i,y:a}=Nc(r,e);n.x+=e.left,n.y+=e.top,n.scaleX*=i,n.scaleY*=a,r=Ls(r)}return n}function Nc(e,t=ls(e)){let n=Math.round(t.width),r=Math.round(t.height);if(ms(e))return{x:n/e.offsetWidth,y:r/e.offsetHeight};let i=Ec(e,!0);return{x:(parseFloat(i.width)||n)/n,y:(parseFloat(i.height)||r)/r}}function Pc(e){if(e===`none`)return null;let t=e.split(` `),n=parseFloat(t[0]),r=parseFloat(t[1]);return isNaN(n)&&isNaN(r)?null:{x:isNaN(n)?r:n,y:isNaN(r)?n:r}}function Fc(e){if(e===`none`)return null;let[t,n,r=`0`]=e.split(` `),i={x:parseFloat(t),y:parseFloat(n),z:parseInt(r,10)};return isNaN(i.x)&&isNaN(i.y)?null:{x:isNaN(i.x)?0:i.x,y:isNaN(i.y)?0:i.y,z:isNaN(i.z)?0:i.z}}function Ic(e){let{scale:t,transform:n,translate:r}=e,i=Pc(t),a=Fc(r),o=Lc(n);if(!o&&!i&&!a)return null;let s={x:i?.x??1,y:i?.y??1},c={x:a?.x??0,y:a?.y??0},l={x:o?.x??0,y:o?.y??0,scaleX:o?.scaleX??1,scaleY:o?.scaleY??1};return{x:c.x+l.x,y:c.y+l.y,z:a?.z??0,scaleX:s.x*l.scaleX,scaleY:s.y*l.scaleY}}function Lc(e){if(e.startsWith(`matrix3d(`)){let t=e.slice(9,-1).split(/, /);return{x:+t[12],y:+t[13],scaleX:+t[0],scaleY:+t[5]}}else if(e.startsWith(`matrix(`)){let t=e.slice(7,-1).split(/, /);return{x:+t[4],y:+t[5],scaleX:+t[0],scaleY:+t[3]}}return null}var Rc=(e=>(e[e.Idle=0]=`Idle`,e[e.Forward=1]=`Forward`,e[e.Reverse=-1]=`Reverse`,e))(Rc||{}),zc={x:.2,y:.2},Bc={x:10,y:10};function Vc(e,t,n,r=25,i=zc,a=Bc){let{x:o,y:s}=t,{rect:c,isTop:l,isBottom:u,isLeft:d,isRight:f}=yc(e),p=Mc(e),m=Ic(Ec(e,!0)),h=m===null?!1:m?.scaleX<0,g=m===null?!1:m?.scaleY<0,_=new Oi(c.left*p.scaleX+p.x,c.top*p.scaleY+p.y,c.width*p.scaleX,c.height*p.scaleY),v={x:0,y:0},y={x:0,y:0},b={height:_.height*i.y,width:_.width*i.x};return b.height>0&&(!l||g&&!u)&&s<=_.top+b.height&&n?.y!==1&&o>=_.left-a.x&&o<=_.right+a.x?(v.y=g?1:-1,y.y=r*Math.abs((_.top+b.height-s)/b.height)):b.height>0&&(!u||g&&!l)&&s>=_.bottom-b.height&&n?.y!==-1&&o>=_.left-a.x&&o<=_.right+a.x&&(v.y=g?-1:1,y.y=r*Math.abs((_.bottom-b.height-s)/b.height)),b.width>0&&(!f||h&&!d)&&o>=_.right-b.width&&n?.x!==-1&&s>=_.top-a.y&&s<=_.bottom+a.y?(v.x=h?-1:1,y.x=r*Math.abs((_.right-b.width-o)/b.width)):b.width>0&&(!d||h&&!f)&&o<=_.left+b.width&&n?.x!==1&&s>=_.top-a.y&&s<=_.bottom+a.y&&(v.x=h?1:-1,y.x=r*Math.abs((_.left+b.width-o)/b.width)),{direction:v,speed:y}}function Hc(e,{block:t=`nearest`,inline:n=`nearest`}={}){if(!ms(e))return;let r=jc(e),i=[];for(let a of r){if(!ms(a))continue;let{top:r,left:o}=Wc(e,a),s=r,c=o;for(let e of i)s-=e.scrollTop,c-=e.scrollLeft;if(t!==`none`){let n=s<a.scrollTop;n!==s+e.offsetHeight>a.scrollTop+a.clientHeight&&(t===`center`?a.scrollTop=s-a.clientHeight/2+e.offsetHeight/2:n?a.scrollTop=s:a.scrollTop=s+e.offsetHeight-a.clientHeight)}if(n!==`none`){let t=c<a.scrollLeft;t!==c+e.offsetWidth>a.scrollLeft+a.clientWidth&&(n===`center`?a.scrollLeft=c-a.clientWidth/2+e.offsetWidth/2:t?a.scrollLeft=c:a.scrollLeft=c+e.offsetWidth-a.clientWidth)}i.push(a)}}function Uc(e){let t=0,n=0,r=e;for(;r;){t+=r.offsetTop,n+=r.offsetLeft;let e=r.offsetParent;if(!ms(e))break;t+=e.clientTop,n+=e.clientLeft,r=e}return{top:t,left:n}}function Wc(e,t){let n=Uc(e),r=Uc(t);return{top:n.top-r.top-t.clientTop,left:n.left-r.left-t.clientLeft}}function Gc(e,t,n){let{scaleX:r,scaleY:i,x:a,y:o}=t,s=e.left+a+(1-r)*parseFloat(n),c=e.top+o+(1-i)*parseFloat(n.slice(n.indexOf(` `)+1)),l=r?e.width*r:e.width,u=i?e.height*i:e.height;return{width:l,height:u,top:c,right:s+l,bottom:c+u,left:s}}function Kc(e,t,n){let{scaleX:r,scaleY:i,x:a,y:o}=t,s=e.left-a-(1-r)*parseFloat(n),c=e.top-o-(1-i)*parseFloat(n.slice(n.indexOf(` `)+1)),l=r?e.width/r:e.width,u=i?e.height/i:e.height;return{width:l,height:u,top:c,right:s+l,bottom:c+u,left:s}}function qc({element:e,keyframes:t,options:n}){return e.animate(t,n).finished}function Jc(e,t=Ec(e).translate,n=!0){if(n){let t=cs(e,e=>`translate`in e);if(t){let{translate:e=``}=t[0];if(typeof e==`string`){let t=Fc(e);if(t)return t}}}if(t){let e=Fc(t);if(e)return e}return{x:0,y:0,z:0}}var Yc=new xc(e=>setTimeout(e,0)),Xc=new Map,Zc=Xc.clear.bind(Xc);function Qc(e){let t=e.ownerDocument,n=Xc.get(t);if(n)return n;n=t.getAnimations(),Xc.set(t,n),Yc.schedule(Zc);let r=n.filter(t=>ss(t.effect)&&t.effect.target===e);return Xc.set(e,r),n}function $c(e,t){let n=Qc(e).filter(e=>{if(ss(e.effect)){let{target:n}=e.effect;if((n&&t.isValidTarget?.call(t,n))??!0)return e.effect.getKeyframes().some(e=>{for(let n of t.properties)if(e[n])return!0})}}).map(e=>{let{effect:t,currentTime:n}=e,r=t?.getComputedTiming().duration;if(!(e.pending||e.playState===`finished`)&&typeof r==`number`&&typeof n==`number`&&n<r)return e.currentTime=r,()=>{e.currentTime=n}});if(n.length>0)return()=>n.forEach(e=>e?.())}var el=class extends Oi{constructor(e,t={}){let{frameTransform:n=Mc(e),ignoreTransforms:r,getBoundingClientRect:i=ls}=t,a=$c(e,{properties:[`transform`,`translate`,`scale`,`width`,`height`],isValidTarget:t=>(t!==e||ws())&&t.contains(e)}),o=i(e),{top:s,left:c,width:l,height:u}=o,d,f=Ec(e),p=Ic(f),m={x:p?.scaleX??1,y:p?.scaleY??1},h=tl(e,f);a?.(),p&&(d=Kc(o,p,f.transformOrigin),(r||h)&&(s=d.top,c=d.left,l=d.width,u=d.height));let g={width:d?.width??l,height:d?.height??u};if(h&&!r&&d){let e=Gc(d,h,f.transformOrigin);s=e.top,c=e.left,l=e.width,u=e.height,m.x=h.scaleX,m.y=h.scaleY}n&&(r||(c*=n.scaleX,l*=n.scaleX,s*=n.scaleY,u*=n.scaleY),c+=n.x,s+=n.y),super(c,s,l,u),this.scale=m,this.intrinsicWidth=g.width,this.intrinsicHeight=g.height}};function tl(e,t){let n=e.getAnimations();if(!n.length)return null;let r,i,a,o=!1;for(let e of n){if(e.playState!==`running`)continue;let t=ss(e.effect)?e.effect.getKeyframes():[],n=t[t.length-1];if(!n)continue;let{transform:s,translate:c,scale:l}=n;typeof s==`string`&&s&&(r=s,o=!0),typeof c==`string`&&c&&(i=c,o=!0),typeof l==`string`&&l&&(a=l,o=!0)}return o?Ic({transform:r??t.transform,translate:i??t.translate,scale:a??t.scale}):null}function nl(e){return`style`in e&&typeof e.style==`object`&&e.style!==null&&`setProperty`in e.style&&`removeProperty`in e.style&&typeof e.style.setProperty==`function`&&typeof e.style.removeProperty==`function`}var rl=class{constructor(e){this.element=e,this.initial=new Map}set(e,t=``){let{element:n}=this;if(nl(n))for(let[r,i]of Object.entries(e)){let e=`${t}${r}`;this.initial.has(e)||this.initial.set(e,n.style.getPropertyValue(e)),n.style.setProperty(e,typeof i==`string`?i:`${i}px`)}}remove(e,t=``){let{element:n}=this;if(nl(n))for(let r of e){let e=`${t}${r}`;n.style.removeProperty(e)}}reset(){let{element:e}=this;if(nl(e)){for(let[t,n]of this.initial)e.style.setProperty(t,n);e.getAttribute(`style`)===``&&e.removeAttribute(`style`)}}};function il(e){return e?e instanceof fs(e).Element||ds(e)&&e.nodeType===Node.ELEMENT_NODE:!1}function al(e){if(!e)return!1;let{KeyboardEvent:t}=fs(e.target);return e instanceof t}function ol(e){if(!e)return!1;let{PointerEvent:t}=fs(e.target);return e instanceof t}function sl(e){if(!il(e))return!1;let{tagName:t}=e;return t===`INPUT`||t===`TEXTAREA`||cl(e)}function cl(e){return e.hasAttribute(`contenteditable`)&&e.getAttribute(`contenteditable`)!==`false`}var ll={};function ul(e){let t=ll[e]==null?0:ll[e]+1;return ll[e]=t,`${e}-${t}`}var dl=({dragOperation:e,droppable:t})=>{let n=e.position.current;if(!n)return null;let{id:r}=t;return t.shape&&t.shape.containsPoint(n)?{id:r,value:1/Di.distance(t.shape.center,n),type:ho.PointerIntersection,priority:mo.High}:null},fl=({dragOperation:e,droppable:t})=>{let{shape:n}=e;if(!t.shape||!n?.current)return null;let r=n.current.intersectionArea(t.shape);if(r){let{position:i}=e,a=Di.distance(t.shape.center,i.current),o=r/(n.current.area+t.shape.area-r)/a;return{id:t.id,value:o,type:ho.ShapeIntersection,priority:mo.Normal}}return null},pl=e=>dl(e)??fl(e),ml=e=>{let{dragOperation:t,droppable:n}=e,{shape:r,position:i}=t;if(!n.shape)return null;let a=r?Oi.from(r.current.boundingRectangle).corners:void 0,o=Oi.from(n.shape.boundingRectangle).corners.reduce((e,t,n)=>e+Di.distance(Di.from(t),a?.[n]??i.current),0)/4;return{id:n.id,value:1/o,type:ho.Collision,priority:mo.Normal}},hl=Object.create,gl=Object.defineProperty,_l=Object.defineProperties,vl=Object.getOwnPropertyDescriptor,yl=Object.getOwnPropertyDescriptors,bl=Object.getOwnPropertySymbols,xl=Object.prototype.hasOwnProperty,Sl=Object.prototype.propertyIsEnumerable,Cl=(e,t)=>(t=Symbol[e])?t:Symbol.for(`Symbol.`+e),wl=e=>{throw TypeError(e)},Tl=(e,t,n)=>t in e?gl(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,El=(e,t)=>{for(var n in t||={})xl.call(t,n)&&Tl(e,n,t[n]);if(bl)for(var n of bl(t))Sl.call(t,n)&&Tl(e,n,t[n]);return e},Dl=(e,t)=>_l(e,yl(t)),Ol=(e,t)=>gl(e,`name`,{value:t,configurable:!0}),kl=(e,t)=>{var n={};for(var r in e)xl.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(e!=null&&bl)for(var r of bl(e))t.indexOf(r)<0&&Sl.call(e,r)&&(n[r]=e[r]);return n},Al=e=>[,,,hl(e?.[Cl(`metadata`)]??null)],jl=[`class`,`method`,`getter`,`setter`,`accessor`,`field`,`value`,`get`,`set`],Ml=e=>e!==void 0&&typeof e!=`function`?wl(`Function expected`):e,Nl=(e,t,n,r,i)=>({kind:jl[e],name:t,metadata:r,addInitializer:e=>n._?wl(`Already initialized`):i.push(Ml(e||null))}),Pl=(e,t)=>Tl(t,Cl(`metadata`),e[3]),Fl=(e,t,n,r)=>{for(var i=0,a=e[t>>1],o=a&&a.length;i<o;i++)t&1?a[i].call(n):r=a[i].call(n,r);return r},Il=(e,t,n,r,i,a)=>{var o,s,c,l,u,d=t&7,f=!!(t&8),p=!!(t&16),m=d>3?e.length+1:d?f?1:2:0,h=jl[d+5],g=d>3&&(e[m-1]=[]),_=e[m]||(e[m]=[]),v=d&&(!p&&!f&&(i=i.prototype),d<5&&(d>3||!p)&&vl(d<4?i:{get[n](){return zl(this,a)},set[n](e){return K(this,a,e)}},n));d?p&&d<4&&Ol(a,(d>2?`set `:d>1?`get `:``)+n):Ol(i,n);for(var y=r.length-1;y>=0;y--)l=Nl(d,n,c={},e[3],_),d&&(l.static=f,l.private=p,u=l.access={has:p?e=>Rl(i,e):e=>n in e},d^3&&(u.get=p?e=>(d^1?zl:q)(e,i,d^4?a:v.get):e=>e[n]),d>2&&(u.set=p?(e,t)=>K(e,i,t,d^4?a:v.set):(e,t)=>e[n]=t)),s=(0,r[y])(d?d<4?p?a:v[h]:d>4?void 0:{get:v.get,set:v.set}:i,l),c._=1,d^4||s===void 0?Ml(s)&&(d>4?g.unshift(s):d?p?a=s:v[h]=s:i=s):typeof s!=`object`||!s?wl(`Object expected`):(Ml(o=s.get)&&(v.get=o),Ml(o=s.set)&&(v.set=o),Ml(o=s.init)&&g.unshift(o));return d||Pl(e,i),v&&gl(i,n,v),p?d^4?a:v:i},Ll=(e,t,n)=>t.has(e)||wl(`Cannot `+n),Rl=(e,t)=>Object(t)===t?e.has(t):wl(`Cannot use the "in" operator on this value`),zl=(e,t,n)=>(Ll(e,t,`read from private field`),n?n.call(e):t.get(e)),G=(e,t,n)=>t.has(e)?wl(`Cannot add the same private member more than once`):t instanceof WeakSet?t.add(e):t.set(e,n),K=(e,t,n,r)=>(Ll(e,t,`write to private field`),r?r.call(e,n):t.set(e,n),n),q=(e,t,n)=>(Ll(e,t,`access private method`),n),J={role:`button`,roleDescription:`draggable`},Bl=`dnd-kit-description`,Vl=`dnd-kit-announcement`,Hl={draggable:`To pick up a draggable item, press the space bar. While dragging, use the arrow keys to move the item in a given direction. Press space again to drop the item in its new position, or press escape to cancel.`},Ul={dragstart({operation:{source:e}}){if(e)return`Picked up draggable item ${e.id}.`},dragover({operation:{source:e,target:t}}){if(!(!e||e.id===t?.id))return t?`Draggable item ${e.id} was moved over droppable target ${t.id}.`:`Draggable item ${e.id} is no longer over a droppable target.`},dragend({operation:{source:e,target:t},canceled:n}){if(e)return n?`Dragging was cancelled. Draggable item ${e.id} was dropped.`:t?`Draggable item ${e.id} was dropped over droppable target ${t.id}`:`Draggable item ${e.id} was dropped.`}};function Wl(e){let t=e.tagName.toLowerCase();return[`input`,`select`,`textarea`,`a`,`button`].includes(t)}function Gl(e,t){let n=document.createElement(`div`);return n.id=e,n.style.setProperty(`display`,`none`),n.textContent=t,n}function Kl(e){let t=document.createElement(`div`);return t.id=e,t.setAttribute(`role`,`status`),t.setAttribute(`aria-live`,`polite`),t.setAttribute(`aria-atomic`,`true`),t.style.setProperty(`position`,`fixed`),t.style.setProperty(`width`,`1px`),t.style.setProperty(`height`,`1px`),t.style.setProperty(`margin`,`-1px`),t.style.setProperty(`border`,`0`),t.style.setProperty(`padding`,`0`),t.style.setProperty(`overflow`,`hidden`),t.style.setProperty(`clip`,`rect(0 0 0 0)`),t.style.setProperty(`clip-path`,`inset(100%)`),t.style.setProperty(`white-space`,`nowrap`),t}var ql=[`dragover`,`dragmove`],Jl=class extends ga{constructor(e,t){super(e);let{id:n,idPrefix:{description:r=Bl,announcement:i=Vl}={},announcements:a=Ul,screenReaderInstructions:o=Hl,debounce:s=500}=t??{},c=n?`${r}-${n}`:ul(r),l=n?`${i}-${n}`:ul(i),u,d,f,p,m=(e=p)=>{!f||!e||f?.nodeValue!==e&&(f.nodeValue=e)},h=()=>Sc.schedule(m),g=Yl(h,s),_=Object.entries(a).map(([e,t])=>this.manager.monitor.addEventListener(e,(n,r)=>{let i=f;if(!i)return;let a=t?.(n,r);a&&i.nodeValue!==a&&(p=a,ql.includes(e)?g():(h(),g.cancel()))})),v=()=>{let e=[];u?.isConnected||(u=Gl(c,o.draggable),e.push(u)),d?.isConnected||(d=Kl(l),f=document.createTextNode(``),d.appendChild(f),e.push(d)),e.length>0&&document.body.append(...e)},y=new Set;function b(){for(let e of y)e()}this.registerEffect(()=>{y.clear();for(let e of this.manager.registry.draggables.value){let t=e.handle??e.element;if(t){(!u||!d)&&y.add(v),(!Wl(t)||ws())&&!t.hasAttribute(`tabindex`)&&y.add(()=>t.setAttribute(`tabindex`,`0`)),!t.hasAttribute(`role`)&&t.tagName.toLowerCase()!==`button`&&y.add(()=>t.setAttribute(`role`,J.role)),t.hasAttribute(`aria-roledescription`)||y.add(()=>t.setAttribute(`aria-roledescription`,J.roleDescription)),t.hasAttribute(`aria-describedby`)||y.add(()=>t.setAttribute(`aria-describedby`,c));for(let n of[`aria-pressed`,`aria-grabbed`]){let r=String(e.isDragging);t.getAttribute(n)!==r&&y.add(()=>t.setAttribute(n,r))}let n=String(e.disabled);t.getAttribute(`aria-disabled`)!==n&&y.add(()=>t.setAttribute(`aria-disabled`,n))}}y.size>0&&Sc.schedule(b)}),this.destroy=()=>{super.destroy(),u?.remove(),d?.remove(),_.forEach(e=>e())}}};function Yl(e,t){let n,r=()=>{clearTimeout(n),n=setTimeout(e,t)};return r.cancel=()=>clearTimeout(n),r}var Xl=new Map,Zl,Ql,$l,eu,tu,nu,ru,iu,au,ou,su,cu,lu,uu=class extends (tu=_a,eu=[R],$l=[kr],Ql=[kr],Zl=[kr],tu){constructor(e,t){super(e,t),Fl(ru,5,this),G(this,au),G(this,nu,new Set),G(this,iu,Fl(ru,8,this,new Set)),Fl(ru,11,this),this.registerEffect(q(this,au,ou))}register(e){return zl(this,nu).add(e),()=>{zl(this,nu).delete(e)}}addRoot(e){return L(()=>{let t=new Set(this.additionalRoots);t.add(e),this.additionalRoots=t}),()=>{L(()=>{let t=new Set(this.additionalRoots);t.delete(e),this.additionalRoots=t})}}get sourceRoot(){let{source:e}=this.manager.dragOperation;return Ds(e?.element??null)}get targetRoot(){let{target:e}=this.manager.dragOperation;return Ds(e?.element??null)}get roots(){let{status:e}=this.manager.dragOperation;if(e.initializing||e.initialized){let e=[this.sourceRoot,this.targetRoot].filter(e=>e!=null);return new Set([...e,...this.additionalRoots])}return new Set}};ru=Al(tu),nu=new WeakMap,iu=new WeakMap,au=new WeakSet,ou=function(){let{roots:e}=this,t=[];for(let n of e)for(let e of zl(this,nu))t.push(q(this,au,su).call(this,n,e));return()=>{for(let e of t)e()}},su=function(e,t){let n=Xl.get(e);n||(n=new Map,Xl.set(e,n));let r=n.get(t);if(!r){let i=ps(e)?q(this,au,cu).call(this,e,n,t):q(this,au,lu).call(this,e,n,t);if(!i)return()=>{};r=i,n.set(t,r)}r.refCount++;let i=!1;return()=>{i||(i=!0,r.refCount--,r.refCount===0&&r.cleanup())}},cu=function(e,t,n){let r=e.createElement(`style`),{nonce:i}=this.options??{};i&&r.setAttribute(`nonce`,i),r.textContent=n,e.head.prepend(r);let a=new MutationObserver(t=>{for(let n of t)for(let t of Array.from(n.removedNodes))if(t===r){e.head.prepend(r);return}});return a.observe(e.head,{childList:!0}),{refCount:0,cleanup:()=>{a.disconnect(),r.remove(),t.delete(n),t.size===0&&Xl.delete(e)}}},lu=function(e,t,n){`adoptedStyleSheets`in e&&Array.isArray(e.adoptedStyleSheets);let{CSSStyleSheet:r}=e.ownerDocument.defaultView??{};if(!r)return null;let i=new r;return i.replaceSync(n),e.adoptedStyleSheets.push(i),{refCount:0,cleanup:()=>{if(Es(e)&&e.host?.isConnected){let t=e.adoptedStyleSheets.indexOf(i);t!==-1&&e.adoptedStyleSheets.splice(t,1)}t.delete(n),t.size===0&&Xl.delete(e)}}},Il(ru,4,`additionalRoots`,eu,uu,iu),Il(ru,2,`sourceRoot`,$l,uu),Il(ru,2,`targetRoot`,Ql,uu),Il(ru,2,`roots`,Zl,uu),Pl(ru,uu),uu.configure=ua(uu);var du=uu,fu=class extends ga{constructor(e,t){super(e,t),this.manager=e;let{cursor:n=`grabbing`}=t??{},r=e.registry.plugins.get(du)?.register(`* { cursor: ${n} !important; }`);if(r){let e=this.destroy.bind(this);this.destroy=()=>{r(),e()}}}},pu=`data-dnd-`,mu=`${pu}dropping`,hu=`--dnd-`,gu=`${pu}dragging`,_u=`${pu}placeholder`,vu=[gu,_u,`popover`,`aria-pressed`,`aria-grabbing`],yu=[`view-transition-name`],bu=`
  :is(:root,:host) [${gu}] {
    position: fixed !important;
    pointer-events: none !important;
    touch-action: none;
    z-index: calc(infinity);
    will-change: translate;
    top: var(${hu}top, 0px) !important;
    left: var(${hu}left, 0px) !important;
    right: unset !important;
    bottom: unset !important;
    width: var(${hu}width, auto);
    max-width: var(${hu}width, auto);
    height: var(${hu}height, auto);
    max-height: var(${hu}height, auto);
    transform: var(${hu}transform, none) !important;
    transition: var(${hu}transition) !important;
  }

  :is(:root,:host) [${_u}] {
    transition: none;
  }

  :is(:root,:host) [${_u}='hidden'] {
    visibility: hidden;
  }

  [${gu}] * {
    pointer-events: none !important;
  }

  [${gu}]:not([${mu}]) {
    translate: var(${hu}translate) !important;
  }

  [${gu}][style*='${hu}scale'] {
    scale: var(${hu}scale) !important;
    transform-origin: var(${hu}transform-origin) !important;
  }

  @layer dnd-kit {
    :where([${gu}][popover]) {
      overflow: visible;
      background: unset;
      border: unset;
      margin: unset;
      padding: unset;
      color: inherit;

      &:is(input, button) {
        border: revert;
        background: revert;
      }
    }
  }
  [${gu}]::backdrop, [${pu}overlay]:not([${gu}]) {
    display: none;
    visibility: hidden;
  }
`.replace(/\n+/g,` `).replace(/\s+/g,` `).trim();function xu(e,t=`hidden`){return L(()=>{let{element:n,manager:r}=e;if(!n||!r)return;let i=Su(n,r.registry.droppables),a=[],o=ks(n),{remove:s}=o;return Cu(i,o,a),wu(o,t),o.remove=()=>{a.forEach(e=>e()),s.call(o)},o})}function Su(e,t){let n=new Map;for(let r of t)if(r.element&&(e===r.element||e.contains(r.element))){let e=`${pu}${ul(`dom-id`)}`;r.element.setAttribute(e,``),n.set(r,e)}return n}function Cu(e,t,n){for(let[r,i]of e){if(!r.element)continue;let e=`[${i}]`,a=t.matches(e)?t:t.querySelector(e);if(r.element.removeAttribute(i),!a)continue;let o=r.element;r.proxy=a,a.removeAttribute(i),Ps.set(o,a),n.push(()=>{Ps.delete(o),r.proxy=void 0})}}function wu(e,t=`hidden`){e.setAttribute(`inert`,`true`),e.setAttribute(`tab-index`,`-1`),e.setAttribute(`aria-hidden`,`true`),e.setAttribute(_u,t)}function Tu(e,t){return e===t?!0:Ls(e)===Ls(t)}function Eu(e){let{target:t}=e;`newState`in e&&e.newState===`closed`&&il(t)&&t.hasAttribute(`popover`)&&requestAnimationFrame(()=>_c(t))}function Du(e){return e.tagName===`TR`}function Ou(e,t,n){let r=new MutationObserver(r=>{let i=!1;for(let n of r){if(n.target!==e){i=!0;continue}if(n.type!==`attributes`)continue;let r=n.attributeName;if(r.startsWith(`aria-`)||vu.includes(r))continue;let a=e.getAttribute(r);if(r===`style`){if(nl(e)&&nl(t)){let n=e.style;for(let e of Array.from(t.style))n.getPropertyValue(e)===``&&t.style.removeProperty(e);for(let e of Array.from(n)){if(yu.includes(e)||e.startsWith(hu))continue;let r=n.getPropertyValue(e);t.style.setProperty(e,r)}}}else a===null?t.removeAttribute(r):t.setAttribute(r,a)}i&&n&&t.replaceChildren(...e.cloneNode(!0).childNodes)});return r.observe(e,{attributes:!0,subtree:!0,childList:!0}),r}function ku(e,t,n){let r=new MutationObserver(r=>{for(let i of r)if(i.addedNodes.length!==0)for(let r of Array.from(i.addedNodes)){if(r.contains(e)&&e.nextElementSibling!==t){e.insertAdjacentElement(`afterend`,t),_c(n);return}if(r.contains(t)&&t.previousElementSibling!==e){t.insertAdjacentElement(`beforebegin`,e),_c(n);return}}e.isConnected&&t.isConnected&&e.nextElementSibling!==t&&(e.insertAdjacentElement(`afterend`,t),_c(n))});return r.observe(e.ownerDocument.body,{childList:!0,subtree:!0}),r}function Au(e){return new ResizeObserver(()=>{var t;let n=new el(e.placeholder,{frameTransform:e.frameTransform,ignoreTransforms:!0}),r=e.transformOrigin??{x:1,y:1},i=(e.width-n.width)*r.x+e.delta.x,a=(e.height-n.height)*r.y+e.delta.y,o=Ts();if(e.styles.set({width:n.width-e.widthOffset,height:n.height-e.heightOffset,top:e.top+a+o.y,left:e.left+i+o.x},hu),(t=e.getElementMutationObserver())==null||t.takeRecords(),Du(e.element)&&Du(e.placeholder)){let t=Array.from(e.element.cells),n=Array.from(e.placeholder.cells);e.getSavedCellWidths()||e.setSavedCellWidths(t.map(e=>e.style.width));for(let[e,r]of t.entries()){let t=n[e];r.style.width=`${t.getBoundingClientRect().width}px`}}let s=e.getTranslate()??{x:0,y:0},c=e.left+i+o.x+s.x,l=e.top+a+o.y+s.y,u=n.width-e.widthOffset,d=n.height-e.heightOffset,f=e.frameTransform;e.dragOperation.shape=new Oi(c*f.scaleX+f.x,l*f.scaleY+f.y,u*f.scaleX,d*f.scaleY)})}var ju=250,Mu=`ease`;function Nu(e){var t;let{animation:n}=e;if(typeof n==`function`){let t=n({source:e.source,element:e.element,feedbackElement:e.feedbackElement,placeholder:e.placeholder,translate:e.translate,moved:e.moved});Promise.resolve(t).then(()=>{e.cleanup(),requestAnimationFrame(e.restoreFocus)});return}let{duration:r=ju,easing:i=Mu}=n??{};_c(e.feedbackElement);let[,a]=cs(e.feedbackElement,e=>`translate`in e)??[];a?.pause();let o=e.placeholder??e.element,s={frameTransform:Tu(e.feedbackElement,o)?null:void 0},c=new el(e.feedbackElement,s),l=Fc(Ec(e.feedbackElement).translate)??e.translate,u=new el(o,s),d=Oi.delta(c,u,e.alignment),f={x:l.x-d.x,y:l.y-d.y},p=Math.round(c.intrinsicHeight)===Math.round(u.intrinsicHeight)?{}:{minHeight:[`${c.intrinsicHeight}px`,`${u.intrinsicHeight}px`],maxHeight:[`${c.intrinsicHeight}px`,`${u.intrinsicHeight}px`]},m=Math.round(c.intrinsicWidth)===Math.round(u.intrinsicWidth)?{}:{minWidth:[`${c.intrinsicWidth}px`,`${u.intrinsicWidth}px`],maxWidth:[`${c.intrinsicWidth}px`,`${u.intrinsicWidth}px`]};e.styles.set({transition:e.transition},hu),e.feedbackElement.setAttribute(mu,``),(t=e.getElementMutationObserver())==null||t.takeRecords(),qc({element:e.feedbackElement,keyframes:Dl(El(El({},p),m),{translate:[`${l.x}px ${l.y}px 0`,`${f.x}px ${f.y}px 0`]}),options:{duration:Os(fs(e.feedbackElement))?0:e.moved||e.feedbackElement!==e.element?r:0,easing:i}}).then(()=>{e.feedbackElement.removeAttribute(mu),a?.finish(),e.cleanup(),requestAnimationFrame(e.restoreFocus)})}var Pu,Fu,Iu,Lu,Ru,zu,Bu,Vu=class extends (Fu=ga,Pu=[R],Fu){constructor(e,t){super(e,t),G(this,Ru),G(this,Lu,Fl(Iu,8,this)),Fl(Iu,11,this),this.state={initial:{},current:{}};let n=e.registry.plugins.get(du),r=n?.register(bu);if(r){let e=this.destroy.bind(this);this.destroy=()=>{r(),e()}}this.registerEffect(q(this,Ru,zu).bind(this,n)),this.registerEffect(q(this,Ru,Bu))}};Iu=Al(Fu),Lu=new WeakMap,Ru=new WeakSet,zu=function(e){let{overlay:t}=this;if(!t||!e)return;let n=Ds(t);if(n)return e.addRoot(n)},Bu=function(){let{state:e,manager:t,options:n}=this,{dragOperation:r}=t,{position:i,source:a,status:o}=r;if(o.idle){e.current={},e.initial={};return}if(!a)return;let{element:s}=a,c=a.pluginConfig(Vu),l=c?.feedback??n?.feedback??`default`,u=typeof l==`function`?l(a,t):l;if(!s||u===`none`||!o.initialized||o.initializing)return;let{initial:d}=e,f=this.overlay??s,p=Mc(f),m=Mc(s),h=!Tu(s,f),g=new el(s,{frameTransform:h?m:null,ignoreTransforms:!h}),_={x:m.scaleX/p.scaleX,y:m.scaleY/p.scaleY},{width:v,height:y,top:b,left:x}=g;h&&(v/=_.x,y/=_.y);let S=new rl(f),C=Ec(s),{transition:ee,translate:w,boxSizing:te,paddingBlockStart:T,paddingBlockEnd:E,paddingInlineStart:D,paddingInlineEnd:O,borderInlineStartWidth:ne,borderInlineEndWidth:re,borderBlockStartWidth:ie,borderBlockEndWidth:ae}=C,k=ee.split(`,`).filter(e=>!/^\s*(transform|translate|scale)\b/.test(e)).join(`,`),A=Ic(C),oe=C.transform,se=u===`clone`,j=te===`content-box`,M=j?parseInt(D)+parseInt(O)+parseInt(ne)+parseInt(re):0,ce=j?parseInt(T)+parseInt(E)+parseInt(ie)+parseInt(ae):0,N=u!==`move`&&!this.overlay?xu(a,se?`clone`:`hidden`):null,le=L(()=>al(t.dragOperation.activatorEvent));if(!d.translate){if(this.overlay&&A)d.translate={x:A.x,y:A.y};else if(w!==`none`){let e=Fc(w);e&&(d.translate=e)}}if(!d.transformOrigin){let e=L(()=>i.current),t=x+(A?.x??0),n=b+(A?.y??0);d.transformOrigin={x:(e.x-t*p.scaleX-p.x)/(v*p.scaleX),y:(e.y-n*p.scaleY-p.y)/(y*p.scaleY)}}let{transformOrigin:ue}=d,de=b*p.scaleY+p.y,fe=x*p.scaleX+p.x;if(!d.coordinates&&(d.coordinates={x:fe,y:de},_.x!==1||_.y!==1)){let{scaleX:e,scaleY:t}=m,{x:n,y:r}=ue;d.coordinates.x+=(v*e-v)*n,d.coordinates.y+=(y*t-y)*r}d.dimensions||={width:v,height:y},d.frameTransform||=p;let pe={x:d.coordinates.x-fe,y:d.coordinates.y-de},me={width:(d.dimensions.width*d.frameTransform.scaleX-v*p.scaleX)*ue.x,height:(d.dimensions.height*d.frameTransform.scaleY-y*p.scaleY)*ue.y},he={x:pe.x/p.scaleX+me.width,y:pe.y/p.scaleY+me.height},ge={left:x+he.x,top:b+he.y};f.setAttribute(gu,`true`);let _e=L(()=>r.transform),ve=d.translate??{x:0,y:0},ye=_e.x*p.scaleX+ve.x,be=_e.y*p.scaleY+ve.y,xe=Ts();S.set({width:v-M,height:y-ce,top:ge.top+xe.y,left:ge.left+xe.x,translate:`${ye}px ${be}px 0`,transform:this.overlay?`none`:oe,transition:k?`${k}, translate 0ms linear`:`translate 0ms linear`,scale:h?`${_.x} ${_.y}`:``,"transform-origin":`${ue.x*100}% ${ue.y*100}%`},hu),N&&(s.insertAdjacentElement(`afterend`,N),n?.rootElement&&(typeof n.rootElement==`function`?n.rootElement(a):n.rootElement).appendChild(s)),gc(f)&&(f.hasAttribute(`popover`)||f.setAttribute(`popover`,`manual`),_c(f),f.addEventListener(`beforetoggle`,Eu));let Se,Ce,we,Te=Au({placeholder:N,element:s,feedbackElement:f,frameTransform:p,transformOrigin:ue,width:v,height:y,top:b,left:x,widthOffset:M,heightOffset:ce,delta:he,styles:S,dragOperation:r,getTranslate:()=>e.current.translate,getElementMutationObserver:()=>Se,getSavedCellWidths:()=>we,setSavedCellWidths:e=>{we=e}}),Ee=new el(f);L(()=>r.shape=Ee);let De=fs(f),Oe=e=>{this.manager.actions.stop({event:e})},ke=Os(De);le&&De.addEventListener(`resize`,Oe),L(()=>a.status)===`idle`&&requestAnimationFrame(()=>a.status=`dragging`),N&&(Te.observe(N),Se=Ou(s,N,se),Ce=ku(s,N,f));let Ae=t.dragOperation.source?.id,je=()=>{if(!le||Ae==null)return;let e=t.registry.draggables.get(Ae),n=e?.handle??e?.element;ms(n)&&n.focus()},Me=()=>{if(Se?.disconnect(),Ce?.disconnect(),Te.disconnect(),De.removeEventListener(`resize`,Oe),gc(f)&&(f.removeEventListener(`beforetoggle`,Eu),f.removeAttribute(`popover`)),f.removeAttribute(gu),S.reset(),we&&Du(s)){let e=Array.from(s.cells);for(let[t,n]of e.entries())n.style.width=we[t]??``}a.status=`idle`;let t=e.current.translate!=null,n=r.status.dragging;N&&(!n&&t||N.parentElement!==f.parentElement)&&f.isConnected&&N.replaceWith(f),N?.remove()},Ne=n?.dropAnimation,Pe=this,Fe=jr(()=>{let{transform:t,status:i}=r;if(!(!t.x&&!t.y&&!e.current.translate)&&i.dragging){let i=d.translate??{x:0,y:0},a={x:t.x/p.scaleX+i.x,y:t.y/p.scaleY+i.y},o=e.current.translate,s=L(()=>r.modifiers),c=L(()=>r.shape?.current),l=n?.keyboardTransition,u=le&&!ke&&l!==null?`${l?.duration??250}ms ${l?.easing??`cubic-bezier(0.25, 1, 0.5, 1)`}`:`0ms linear`;if(S.set({transition:k?`${k}, translate ${u}`:`translate ${u}`,translate:`${a.x}px ${a.y}px 0`},hu),Se?.takeRecords(),c&&c!==Ee&&o&&!s.length){let e=Di.delta(a,o);r.shape=Oi.from(c.boundingRectangle).translate(e.x*p.scaleX,e.y*p.scaleY)}else r.shape=new el(f);e.current.translate=a}},function(){if(r.status.dropped){this.dispose(),a.status=`dropping`;let n=c?.dropAnimation===void 0?Pe.dropAnimation===void 0?Ne:Pe.dropAnimation:c.dropAnimation,r=e.current.translate,i=r!=null;if(!r&&s!==f&&(r={x:0,y:0}),!r||n===null){Me();return}t.renderer.rendering.then(()=>{Nu({source:a,element:s,feedbackElement:f,placeholder:N,translate:r,moved:i,transition:ee,alignment:a.alignment,styles:S,animation:n??void 0,getElementMutationObserver:()=>Se,cleanup:Me,restoreFocus:je})})}});return()=>{Me(),Fe()}},Il(Iu,4,`overlay`,Pu,Vu,Lu),Pl(Iu,Vu),Vu.configure=ua(Vu);var Hu=Vu,Uu=!0,Wu=!1,Gu,Ku,qu,Ju=(qu=[R],Rc.Forward),Yu,Xu,Zu;Ku=(Gu=[R],Rc.Reverse);var Qu=class{constructor(){G(this,Xu,Fl(Yu,8,this,Uu)),Fl(Yu,11,this),G(this,Zu,Fl(Yu,12,this,Uu)),Fl(Yu,15,this)}isLocked(e){return e===Rc.Idle?!1:e==null?this[Rc.Forward]===Uu&&this[Rc.Reverse]===Uu:this[e]===Uu}unlock(e){e!==Rc.Idle&&(this[e]=Wu)}};Yu=Al(null),Xu=new WeakMap,Zu=new WeakMap,Il(Yu,4,Ju,qu,Qu,Xu),Il(Yu,4,Ku,Gu,Qu,Zu),Pl(Yu,Qu);var $u=[Rc.Forward,Rc.Reverse],ed=class{constructor(){this.x=new Qu,this.y=new Qu}isLocked(){return this.x.isLocked()&&this.y.isLocked()}},td=class extends ga{constructor(e){super(e);let t=Un(new ed),n=null;this.signal=t,$n(()=>{let{status:r}=e.dragOperation;if(!r.initialized){n=null,t.value=new ed;return}let{delta:i}=e.dragOperation.position;if(n){let e={x:nd(i.x,n.x),y:nd(i.y,n.y)},r=t.peek();jn(()=>{for(let t of Li)for(let n of $u)e[t]===n&&r[t].unlock(n);t.value=r})}n=i})}get current(){return this.signal.peek()}};function nd(e,t){return Math.sign(e-t)}var rd,id,ad,od,sd,cd,ld=class extends (id=_a,rd=[R],id){constructor(e){super(e),G(this,od,Fl(ad,8,this,!1)),Fl(ad,11,this),G(this,sd),G(this,cd,()=>{if(!zl(this,sd))return;let{element:e,by:t}=zl(this,sd);t.y&&(e.scrollTop+=t.y),t.x&&(e.scrollLeft+=t.x)}),this.scroll=(e,t)=>{if(this.disabled)return!1;let n=this.getScrollableElements();if(!n)return K(this,sd,void 0),!1;let{position:r}=this.manager.dragOperation,i=r?.current;if(i){let{by:r}=e??{},a=r?{x:ud(r.x),y:ud(r.y)}:void 0,o=a?void 0:this.scrollIntentTracker.current;if(o?.isLocked())return!1;for(let e of n){let n=bc(e,r);if(n.x||n.y){let{speed:n,direction:s}=Vc(e,i,a,t?.acceleration,t?.threshold);if(o)for(let e of Li)o[e].isLocked(s[e])&&(n[e]=0,s[e]=0);if(s.x||s.y){let{x:t,y:i}=r??s,a=t*n.x,o=i*n.y;if(a||o){let t=zl(this,sd)?.by;if(this.autoScrolling&&t&&(t.x&&!a||t.y&&!o))continue;return K(this,sd,{element:e,by:{x:a,y:o}}),Sc.schedule(zl(this,cd)),!0}}}}}return K(this,sd,void 0),!1};let t=null,n=null,r=Dr(()=>{let{position:n,source:r}=e.dragOperation;if(!n)return null;let i=Ms(Ds(r?.element),n.current);return i&&(t=i),i??t}),i=Dr(()=>{let t=r.value,{documentElement:i}=gs(t);if(!t||t===i){let{target:t}=e.dragOperation,r=t?.element;if(r){let e=jc(r,{excludeElement:!1});return n=e,e}}if(t){let e=jc(t,{excludeElement:!1});return this.autoScrolling&&n&&e.size<n?.size?n:(n=e,e)}return n=null,null},Or);this.getScrollableElements=()=>i.value,this.scrollIntentTracker=new td(e),this.destroy=e.monitor.addEventListener(`dragmove`,t=>{this.disabled||t.defaultPrevented||!al(e.dragOperation.activatorEvent)||!t.by||this.scroll({by:t.by})&&t.preventDefault()})}};ad=Al(id),od=new WeakMap,sd=new WeakMap,cd=new WeakMap,Il(ad,4,`autoScrolling`,rd,ld,od),Pl(ad,ld);function ud(e){return e>0?Rc.Forward:e<0?Rc.Reverse:Rc.Idle}var dd=new class{constructor(e){this.scheduler=e,this.pending=!1,this.tasks=new Set,this.resolvers=new Set,this.flush=()=>{let{tasks:e,resolvers:t}=this;this.pending=!1,this.tasks=new Set,this.resolvers=new Set;for(let t of e)t();for(let e of t)e()}}schedule(e){return this.tasks.add(e),this.pending||(this.pending=!0,this.scheduler(this.flush)),new Promise(e=>this.resolvers.add(e))}}(e=>{typeof requestAnimationFrame==`function`?requestAnimationFrame(e):e()}),fd=10,pd=class extends ga{constructor(e,t){super(e,t);let n=e.registry.plugins.get(ld);if(!n)throw Error(`AutoScroller plugin depends on Scroller plugin`);this.destroy=$n(()=>{if(this.disabled)return;let{position:t,status:r}=e.dragOperation;if(r.dragging){let e={acceleration:this.options?.acceleration,threshold:typeof this.options?.threshold==`number`?{x:this.options.threshold,y:this.options.threshold}:this.options?.threshold};if(n.scroll(void 0,e)){n.autoScrolling=!0;let t=setInterval(()=>dd.schedule(()=>n.scroll(void 0,e)),fd);return()=>{clearInterval(t)}}else n.autoScrolling=!1}})}};pd.configure=ua(pd);var md=pd,hd={capture:!0,passive:!0},gd,_d=class extends _a{constructor(e){super(e),G(this,gd),this.handleScroll=()=>{zl(this,gd)??K(this,gd,setTimeout(()=>{this.manager.collisionObserver.forceUpdate(!1),K(this,gd,void 0)},50))};let{dragOperation:t}=this.manager;this.destroy=$n(()=>{if(t.status.dragging){let e=t.source?.element?.ownerDocument??document;return e.addEventListener(`scroll`,this.handleScroll,hd),()=>{e.removeEventListener(`scroll`,this.handleScroll,hd)}}})}};gd=new WeakMap;var vd=`* { user-select: none !important; -webkit-user-select: none !important; }`,yd=class extends ga{constructor(e){super(e),this.manager=e;let t=e.registry.plugins.get(du)?.register(vd);if(this.destroy=$n(()=>{let{dragOperation:e}=this.manager;if(e.status.initialized)return bd(),document.addEventListener(`selectionchange`,bd,{capture:!0}),()=>{document.removeEventListener(`selectionchange`,bd,{capture:!0})}}),t){let e=this.destroy.bind(this);this.destroy=()=>{t(),e()}}}};function bd(){var e;(e=document.getSelection())==null||e.removeAllRanges()}var xd=Object.freeze({offset:10,keyboardCodes:{start:[`Space`,`Enter`],cancel:[`Escape`],end:[`Space`,`Enter`,`Tab`],up:[`ArrowUp`],down:[`ArrowDown`],left:[`ArrowLeft`],right:[`ArrowRight`]},preventActivation(e,t){let n=t.handle??t.element;return e.target!==n}}),Sd,Y=class extends Do{constructor(e,t){super(e),this.manager=e,this.options=t,G(this,Sd,[]),this.listeners=new Is,this.handleSourceKeyDown=(e,t,n)=>{if(this.disabled||e.defaultPrevented||!il(e.target)||t.disabled)return;let{keyboardCodes:r=xd.keyboardCodes,preventActivation:i=xd.preventActivation}=n??{};r.start.includes(e.code)&&this.manager.dragOperation.status.idle&&(i?.(e,t)||this.handleStart(e,t,n))}}bind(e,t=this.options){return $n(()=>{let n=e.handle??e.element,r=n=>{al(n)&&this.handleSourceKeyDown(n,e,t)};if(n)return n.addEventListener(`keydown`,r),()=>{n.removeEventListener(`keydown`,r)}})}handleStart(e,t,n){let{element:r}=t;if(!r)throw Error(`Source draggable does not have an associated element`);e.preventDefault(),e.stopImmediatePropagation(),Hc(r);let{center:i}=new el(r);if(this.manager.actions.start({event:e,coordinates:{x:i.x,y:i.y},source:t}).signal.aborted)return this.cleanup();this.sideEffects();let a=gs(r),o=[this.listeners.bind(a,[{type:`keydown`,listener:e=>this.handleKeyDown(e,t,n),options:{capture:!0}}])];zl(this,Sd).push(...o)}handleKeyDown(e,t,n){let{keyboardCodes:r=xd.keyboardCodes}=n??{};if(wd(e,[...r.end,...r.cancel])){e.preventDefault();let t=wd(e,r.cancel);this.handleEnd(e,t);return}wd(e,r.up)?this.handleMove(`up`,e):wd(e,r.down)&&this.handleMove(`down`,e),wd(e,r.left)?this.handleMove(`left`,e):wd(e,r.right)&&this.handleMove(`right`,e)}handleEnd(e,t){this.manager.actions.stop({event:e,canceled:t}),this.cleanup()}handleMove(e,t){let{shape:n}=this.manager.dragOperation,r=t.shiftKey?5:1,i={x:0,y:0},a=this.options?.offset??xd.offset;if(typeof a==`number`&&(a={x:a,y:a}),n){switch(e){case`up`:i={x:0,y:-a.y*r};break;case`down`:i={x:0,y:a.y*r};break;case`left`:i={x:-a.x*r,y:0};break;case`right`:i={x:a.x*r,y:0};break}(i.x||i.y)&&(t.preventDefault(),this.manager.actions.move({event:t,by:i}))}}sideEffects(){let e=this.manager.registry.plugins.get(md);e?.disabled===!1&&(e.disable(),zl(this,Sd).push(()=>{e.enable()}))}cleanup(){zl(this,Sd).forEach(e=>e()),K(this,Sd,[])}destroy(){this.cleanup(),this.listeners.clear()}};Sd=new WeakMap,Y.configure=ua(Y),Y.defaults=xd;var Cd=Y;function wd(e,t){return t.includes(e.code)}var Td,Ed=class extends Ao{constructor(){super(...arguments),G(this,Td)}onEvent(e){switch(e.type){case`pointerdown`:K(this,Td,xs(e));break;case`pointermove`:if(!zl(this,Td))return;let{x:t,y:n}=xs(e),r={x:t-zl(this,Td).x,y:n-zl(this,Td).y},{tolerance:i}=this.options;if(i&&Fi(r,i)){this.abort();return}Fi(r,this.options.value)&&this.activate(e);break;case`pointerup`:this.abort();break}}abort(){K(this,Td,void 0)}};Td=new WeakMap;var Dd,Od,kd=class extends Ao{constructor(){super(...arguments),G(this,Dd),G(this,Od)}onEvent(e){switch(e.type){case`pointerdown`:K(this,Od,xs(e)),K(this,Dd,setTimeout(()=>this.activate(e),this.options.value));break;case`pointermove`:if(!zl(this,Od))return;let{x:t,y:n}=xs(e);Fi({x:t-zl(this,Od).x,y:n-zl(this,Od).y},this.options.tolerance)&&this.abort();break;case`pointerup`:this.abort();break}}abort(){zl(this,Dd)&&(clearTimeout(zl(this,Dd)),K(this,Od,void 0),K(this,Dd,void 0))}};Dd=new WeakMap,Od=new WeakMap;var Ad=class{};Ad.Delay=kd,Ad.Distance=Ed;var jd=Object.freeze({activationConstraints(e,t){let{pointerType:n,target:r}=e;if(!(n===`mouse`&&il(r)&&(t.handle===r||t.handle?.contains(r))))return n===`touch`?[new Ad.Delay({value:250,tolerance:5})]:sl(r)&&!e.defaultPrevented?[new Ad.Delay({value:200,tolerance:0})]:[new Ad.Delay({value:200,tolerance:10}),new Ad.Distance({value:5})]},preventActivation(e,t){let{target:n}=e;return n===t.element||n===t.handle||!il(n)||t.handle?.contains(n)?!1:Fs(n)}}),Md,Nd=class extends Do{constructor(e,t){super(e),this.manager=e,this.options=t,G(this,Md,new Set),this.listeners=new Is,this.latest={event:void 0,coordinates:void 0},this.handleMove=()=>{let{event:e,coordinates:t}=this.latest;!e||!t||this.manager.actions.move({event:e,to:t})},this.handleCancel=this.handleCancel.bind(this),this.handlePointerUp=this.handlePointerUp.bind(this),this.handleKeyDown=this.handleKeyDown.bind(this)}activationConstraints(e,t,n=this.options){let{activationConstraints:r=jd.activationConstraints}=n??{};return typeof r==`function`?r(e,t):r}bind(e,t=this.options){return $n(()=>{let n=new AbortController,{signal:r}=n,i=n=>{ol(n)&&this.handlePointerDown(n,e,t)},a=[e.handle??e.element];t?.activatorElements&&(a=Array.isArray(t.activatorElements)?t.activatorElements:t.activatorElements(e));for(let e of a)e&&(Rd(e.ownerDocument.defaultView),e.addEventListener(`pointerdown`,i,{signal:r}));return()=>n.abort()})}handlePointerDown(e,t,n){if(this.disabled||!e.isPrimary||e.button!==0||!il(e.target)||t.disabled||Fd(e)||!this.manager.dragOperation.status.idle)return;let{preventActivation:r=jd.preventActivation}=n??{};if(r?.(e,t))return;let{target:i}=e,a=ms(i)&&i.draggable&&i.getAttribute(`draggable`)===`true`,o=Mc(t.element),{x:s,y:c}=xs(e);this.initialCoordinates={x:s*o.scaleX+o.x,y:c*o.scaleY+o.y};let l=this.activationConstraints(e,t,n);e.sensor=this;let u=new Oo(l,e=>this.handleStart(t,e));u.signal.onabort=()=>this.handleCancel(e),u.onEvent(e),this.controller=u;let d=Cs(),f=this.listeners.bind(d,[{type:`pointermove`,listener:e=>this.handlePointerMove(e,t)},{type:`pointerup`,listener:this.handlePointerUp,options:{capture:!0}},{type:`pointercancel`,listener:this.handleCancel},{type:`dragstart`,listener:a?this.handleCancel:X,options:{capture:!0}}]);zl(this,Md).add(()=>{f(),this.initialCoordinates=void 0})}handlePointerMove(e,t){var n;if(this.controller?.activated===!1){(n=this.controller)==null||n.onEvent(e);return}if(this.manager.dragOperation.status.dragging){let n=xs(e),r=Mc(t.element);n.x=n.x*r.scaleX+r.x,n.y=n.y*r.scaleY+r.y,e.preventDefault(),e.stopPropagation(),this.latest.event=e,this.latest.coordinates=n,Sc.schedule(this.handleMove)}}handlePointerUp(e){let{status:t}=this.manager.dragOperation;if(!t.idle){e.preventDefault(),e.stopPropagation();let n=!t.initialized;this.manager.actions.stop({event:e,canceled:n})}this.cleanup()}handleKeyDown(e){e.key===`Escape`&&(e.preventDefault(),this.handleCancel(e))}handleStart(e,t){let{manager:n,initialCoordinates:r}=this;if(!r||!n.dragOperation.status.idle||t.defaultPrevented)return;if(n.actions.start({coordinates:r,event:t,source:e}).signal.aborted)return this.cleanup();t.preventDefault();let i=gs(t.target).body;try{i.setPointerCapture(t.pointerId)}catch{this.handleCancel(t);return}let a=il(t.target)?[t.target,i]:i,o=this.listeners.bind(a,[{type:`touchmove`,listener:X,options:{passive:!1}},{type:`click`,listener:X},{type:`contextmenu`,listener:X},{type:`keydown`,listener:this.handleKeyDown}]);zl(this,Md).add(o)}handleCancel(e){let{dragOperation:t}=this.manager;t.status.initialized&&this.manager.actions.stop({event:e,canceled:!0}),this.cleanup()}cleanup(){let{controller:e}=this;this.controller=void 0,e&&!e.signal.aborted&&e.abort(),this.latest={event:void 0,coordinates:void 0},zl(this,Md).forEach(e=>e()),zl(this,Md).clear()}destroy(){this.cleanup(),this.listeners.clear()}};Md=new WeakMap,Nd.configure=ua(Nd),Nd.defaults=jd;var Pd=Nd;function Fd(e){return`sensor`in e}function X(e){e.preventDefault()}function Id(){}var Ld=new WeakSet;function Rd(e){!e||Ld.has(e)||(e.addEventListener(`touchmove`,Id,{capture:!1,passive:!1}),Ld.add(e))}var zd={modifiers:[],plugins:[Jl,md,fu,Hu,yd],sensors:[Pd,Cd]},Bd=class extends ts{constructor(e={}){let t=es(e.plugins,zd.plugins),n=es(e.sensors,zd.sensors),r=es(e.modifiers,zd.modifiers);super(Dl(El({},e),{plugins:[_d,ld,du,...t],sensors:n,modifiers:r}))}},Vd,Hd,Ud,Wd,Gd,Kd,qd=class extends (Ud=Ya,Hd=[R],Vd=[R],Ud){constructor(e,t){var n=e,{element:r,effects:i=()=>[],handle:a}=n,o=kl(n,[`element`,`effects`,`handle`]);super(El({effects:()=>[...i(),()=>{let{manager:e}=this;if(!e)return;let t=(this.sensors?.map(da)??[...e.sensors]).map(t=>{let n=t instanceof Do?t:e.registry.register(t.plugin),r=t instanceof Do?void 0:t.options;return n.bind(this,r)});return function(){t.forEach(e=>e())}}]},o),t),G(this,Gd,Fl(Wd,8,this)),Fl(Wd,11,this),G(this,Kd,Fl(Wd,12,this)),Fl(Wd,15,this),this.element=r,this.handle=a}};Wd=Al(Ud),Gd=new WeakMap,Kd=new WeakMap,Il(Wd,4,`handle`,Hd,qd,Gd),Il(Wd,4,`element`,Vd,qd,Kd),Pl(Wd,qd);var Jd,Yd,Xd,Zd,Qd,$d,ef,tf,nf,rf,af=class extends (Xd=lo,Yd=[R],Jd=[R],Xd){constructor(e,t){var n=e,{element:r,effects:i=()=>[]}=n,a=kl(n,[`element`,`effects`]);let{collisionDetector:o=pl}=a,s=e=>{let{manager:t,element:n}=this;if(!n||e===null){this.shape=void 0;return}if(!t)return;let r=new el(n),i=L(()=>this.shape);return r&&i?.equals(r)?i:(this.shape=r,r)},c=Un(!1);super(Dl(El({},a),{collisionDetector:o,effects:()=>[...i(),()=>{let{element:e,manager:t}=this;if(!t)return;let{dragOperation:n}=t,{source:r}=n;c.value=!!(r&&n.status.initialized&&e&&!this.disabled&&this.accepts(r))},()=>{let{element:e}=this;if(c.value&&e){let t=new hc(e,s);return()=>{t.disconnect(),this.shape=void 0}}},()=>{if(this.manager?.dragOperation.status.initialized)return()=>{this.shape=void 0}}]}),t),G(this,nf),G(this,Qd,Fl(Zd,8,this)),Fl(Zd,11,this),G(this,rf,Fl(Zd,12,this)),Fl(Zd,15,this),this.element=r,this.refreshShape=()=>s()}set element(e){K(this,nf,e,tf)}get element(){return this.proxy??zl(this,nf,ef)}};Zd=Al(Xd),Qd=new WeakMap,nf=new WeakSet,rf=new WeakMap,$d=Il(Zd,20,`#element`,Yd,nf,Qd),ef=$d.get,tf=$d.set,Il(Zd,4,`proxy`,Jd,af,rf),Pl(Zd,af);var of=n(D(),1);function sf(e){return typeof e==`object`&&!!e&&`current`in e}function cf(e){if(e!=null)return sf(e)?e.current??void 0:e}var lf=typeof window<`u`&&window.document!==void 0&&window.document.createElement!==void 0?F.useLayoutEffect:F.useEffect;function uf(){let e=(0,F.useState)(0)[1];return(0,F.useCallback)(()=>{e(e=>e+1)},[e])}function df(e,t){let n=(0,F.useRef)(new Map),r=uf();return lf(()=>{if(!e){n.current.clear();return}return $n(()=>{let i=!1,a=!1;for(let r of n.current){let[o]=r,s=L(()=>r[1]),c=e[o];s!==c&&(i=!0,n.current.set(o,c),a=t?.(o,s,c)??!1)}i&&(a?queueMicrotask(()=>(0,of.flushSync)(r)):r())})},[e]),(0,F.useMemo)(()=>e&&new Proxy(e,{get(e,t){let r=e[t];return n.current.set(t,r),r}}),[e])}function ff(e,t){e()}function pf(e){let t=(0,F.useRef)(e);return lf(()=>{t.current=e},[e]),t}function Z(e,t,n=F.useEffect,r=Object.is){let i=(0,F.useRef)(e);n(()=>{let n=i.current;r(e,n)||(i.current=e,t(e,n))},[t,e])}function mf(e,t){let n=(0,F.useRef)(cf(e));lf(()=>{let r=cf(e);r!==n.current&&(n.current=r,t(r))})}var hf=Object.defineProperty,gf=Object.defineProperties,_f=Object.getOwnPropertyDescriptors,vf=Object.getOwnPropertySymbols,yf=Object.prototype.hasOwnProperty,bf=Object.prototype.propertyIsEnumerable,xf=(e,t,n)=>t in e?hf(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,Sf=(e,t)=>{for(var n in t||={})yf.call(t,n)&&xf(e,n,t[n]);if(vf)for(var n of vf(t))bf.call(t,n)&&xf(e,n,t[n]);return e},Cf=(e,t)=>gf(e,_f(t)),wf=(e,t)=>{var n={};for(var r in e)yf.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(e!=null&&vf)for(var r of vf(e))t.indexOf(r)<0&&bf.call(e,r)&&(n[r]=e[r]);return n},Tf=(0,F.createContext)(new Bd),Ef=(0,F.memo)((0,F.forwardRef)(({children:e},t)=>{let[n,r]=(0,F.useState)(0),i=(0,F.useRef)(null),a=(0,F.useRef)(null),o=(0,F.useMemo)(()=>({renderer:{get rendering(){return i.current??Promise.resolve()}},trackRendering(e){i.current||=new Promise(e=>{a.current=e}),(0,F.startTransition)(()=>{e(),r(e=>e+1)})}}),[]);return lf(()=>{var e;(e=a.current)==null||e.call(a),i.current=null},[e,n]),(0,F.useImperativeHandle)(t,()=>o),null})),Df=[void 0,Or];function Of(e){var t=e,{children:n,onCollision:r,onBeforeDragStart:i,onDragStart:a,onDragMove:o,onDragOver:s,onDragEnd:c}=t,l=wf(t,[`children`,`onCollision`,`onBeforeDragStart`,`onDragStart`,`onDragMove`,`onDragOver`,`onDragEnd`]);let u=(0,F.useRef)(null),{plugins:d,modifiers:f,sensors:p}=l,m=es(d,zd.plugins),h=es(p,zd.sensors),g=es(f,zd.modifiers),_=pf(i),v=pf(a),y=pf(s),b=pf(o),x=pf(c),S=pf(r),C=kf(()=>l.manager??new Bd(l));return(0,F.useEffect)(()=>{if(!u.current)throw Error(`Renderer not found`);let{renderer:e,trackRendering:t}=u.current,{monitor:n}=C;C.renderer=e;let r=[n.addEventListener(`beforedragstart`,e=>{let n=_.current;n&&t(()=>n(e,C))}),n.addEventListener(`dragstart`,e=>v.current?.call(v,e,C)),n.addEventListener(`dragover`,e=>{let n=y.current;n&&t(()=>n(e,C))}),n.addEventListener(`dragmove`,e=>{let n=b.current;n&&t(()=>n(e,C))}),n.addEventListener(`dragend`,e=>{let n=x.current;n&&t(()=>n(e,C))}),n.addEventListener(`collision`,e=>S.current?.call(S,e,C))];return()=>r.forEach(e=>e())},[C]),Z(m,()=>C&&(C.plugins=m),...Df),Z(h,()=>C&&(C.sensors=h),...Df),Z(g,()=>C&&(C.modifiers=g),...Df),(0,I.jsxs)(Tf.Provider,{value:C,children:[(0,I.jsx)(Ef,{ref:u,children:n}),n]})}function kf(e){let t=(0,F.useRef)(null);return t.current||=e(),(0,F.useInsertionEffect)(()=>()=>t.current?.destroy(),[]),t.current}function Af(){return(0,F.useContext)(Tf)}function jf(e){let t=Af()??void 0,[n]=(0,F.useState)(()=>e(t));return n.manager!==t&&(n.manager=t),lf(n.register,[t,n]),n}function Mf(e){let{disabled:t,data:n,element:r,handle:i,id:a,modifiers:o,sensors:s,plugins:c}=e,l=jf(t=>new qd(Cf(Sf({},e),{register:!1,handle:cf(i),element:cf(r)}),t)),u=df(l,Nf);return Z(a,()=>l.id=a),mf(i,e=>l.handle=e),mf(r,e=>l.element=e),Z(n,()=>n&&(l.data=n)),Z(t,()=>l.disabled=t===!0),Z(s,()=>l.sensors=s),Z(o,()=>l.modifiers=o,void 0,Or),Z(c,()=>l.plugins=c,void 0,Or),Z(e.alignment,()=>l.alignment=e.alignment),{draggable:u,get isDragging(){return u.isDragging},get isDropping(){return u.isDropping},get isDragSource(){return u.isDragSource},handleRef:(0,F.useCallback)(e=>{l.handle=e??void 0},[l]),ref:(0,F.useCallback)(e=>{!e&&l.element?.isConnected&&!l.manager?.dragOperation.status.idle||(l.element=e??void 0)},[l])}}function Nf(e,t,n){return!!(e===`isDragSource`&&!n&&t)}var Pf=Object.create,Ff=Object.defineProperty,If=Object.getOwnPropertyDescriptor,Lf=(e,t)=>(t=Symbol[e])?t:Symbol.for(`Symbol.`+e),Rf=e=>{throw TypeError(e)},zf=(e,t,n)=>t in e?Ff(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,Bf=e=>[,,,Pf(e?.[Lf(`metadata`)]??null)],Vf=[`class`,`method`,`getter`,`setter`,`accessor`,`field`,`value`,`get`,`set`],Hf=e=>e!==void 0&&typeof e!=`function`?Rf(`Function expected`):e,Uf=(e,t,n,r,i)=>({kind:Vf[e],name:t,metadata:r,addInitializer:e=>n._?Rf(`Already initialized`):i.push(Hf(e||null))}),Wf=(e,t)=>zf(t,Lf(`metadata`),e[3]),Gf=(e,t,n,r)=>{for(var i=0,a=e[t>>1],o=a&&a.length;i<o;i++)a[i].call(n);return r},Kf=(e,t,n,r,i,a)=>{for(var o,s,c,l,u=t&7,d=!1,f=!1,p=2,m=Vf[u+5],h=e[p]||(e[p]=[]),g=(i=i.prototype,If(i,n)),_=r.length-1;_>=0;_--)c=Uf(u,n,s={},e[3],h),c.static=d,c.private=f,l=c.access={has:e=>n in e},l.get=e=>e[n],o=(0,r[_])(g[m],c),s._=1,Hf(o)&&(g[m]=o);return g&&Ff(i,n,g),i},qf=(e,t,n)=>t.has(e)||Rf(`Cannot `+n),Jf=(e,t,n)=>(qf(e,t,`read from private field`),t.get(e)),Yf=(e,t,n)=>t.has(e)?Rf(`Cannot add the same private member more than once`):t instanceof WeakSet?t.add(e):t.set(e,n),Xf=(e,t,n,r)=>(qf(e,t,`write to private field`),t.set(e,n),n),Zf=class e{constructor(e,t){this.x=e,this.y=t}static delta(t,n){return new e(t.x-n.x,t.y-n.y)}static distance(e,t){return Math.hypot(e.x-t.x,e.y-t.y)}static equals(e,t){return e.x===t.x&&e.y===t.y}static from({x:t,y:n}){return new e(t,n)}},Qf,$f,ep,tp,np,rp=class extends (ep=Qr,$f=[kr],Qf=[kr],ep){constructor(e){let t=Zf.from(e);super(t,(e,t)=>Zf.equals(e,t)),Gf(np,5,this),Yf(this,tp,0),this.velocity={x:0,y:0}}get delta(){return Zf.delta(this.current,this.initial)}get direction(){let{current:e,previous:t}=this;if(!t)return null;let n={x:e.x-t.x,y:e.y-t.y};return!n.x&&!n.y?null:Math.abs(n.x)>Math.abs(n.y)?n.x>0?`right`:`left`:n.y>0?`down`:`up`}get current(){return super.current}set current(e){let{current:t}=this,n=Zf.from(e),r={x:n.x-t.x,y:n.y-t.y},i=Date.now(),a=i-Jf(this,tp),o=e=>Math.round(e/a*100);jn(()=>{Xf(this,tp,i),this.velocity={x:o(r.x),y:o(r.y)},super.current=n})}reset(e=this.defaultValue){super.reset(Zf.from(e)),this.velocity={x:0,y:0}}};np=Bf(ep),tp=new WeakMap,Kf(np,2,`delta`,$f,rp),Kf(np,2,`direction`,Qf,rp),Wf(np,rp);var ip=(e=>(e.Horizontal=`x`,e.Vertical=`y`,e))(ip||{});Object.values(ip);var ap=({dragOperation:e,droppable:t})=>{let n=e.position.current;if(!n)return null;let{id:r}=t;return t.shape&&t.shape.containsPoint(n)?{id:r,value:1/Zf.distance(t.shape.center,n),type:ho.PointerIntersection,priority:mo.High}:null},op=({dragOperation:e,droppable:t})=>{let{shape:n}=e;if(!t.shape||!n?.current)return null;let r=n.current.intersectionArea(t.shape);if(r){let{position:i}=e,a=Zf.distance(t.shape.center,i.current),o=r/(n.current.area+t.shape.area-r)/a;return{id:t.id,value:o,type:ho.ShapeIntersection,priority:mo.Normal}}return null},sp=e=>ap(e)??op(e);function cp(e){let{collisionDetector:t,data:n,disabled:r,element:i,id:a,accept:o,type:s}=e,c=jf(t=>new af(Cf(Sf({},e),{register:!1,element:cf(i)}),t)),l=df(c);return Z(a,()=>c.id=a),mf(i,e=>c.element=e),Z(o,()=>c.accept=o,void 0,Or),Z(t,()=>c.collisionDetector=t??sp),Z(n,()=>n&&(c.data=n)),Z(r,()=>c.disabled=r===!0),Z(s,()=>c.type=s),{droppable:l,get isDropTarget(){return l.isDropTarget},ref:(0,F.useCallback)(e=>{!e&&c.element?.isConnected&&!c.manager?.dragOperation.status.idle||(c.element=e??void 0)},[c])}}var lp=Object.create,up=Object.defineProperty,dp=Object.defineProperties,fp=Object.getOwnPropertyDescriptor,pp=Object.getOwnPropertyDescriptors,mp=Object.getOwnPropertySymbols,hp=Object.prototype.hasOwnProperty,gp=Object.prototype.propertyIsEnumerable,_p=(e,t)=>(t=Symbol[e])?t:Symbol.for(`Symbol.`+e),vp=e=>{throw TypeError(e)},yp=(e,t,n)=>t in e?up(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,bp=(e,t)=>{for(var n in t||={})hp.call(t,n)&&yp(e,n,t[n]);if(mp)for(var n of mp(t))gp.call(t,n)&&yp(e,n,t[n]);return e},xp=(e,t)=>dp(e,pp(t)),Sp=(e,t)=>{var n={};for(var r in e)hp.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(e!=null&&mp)for(var r of mp(e))t.indexOf(r)<0&&gp.call(e,r)&&(n[r]=e[r]);return n},Cp=e=>[,,,lp(null)],wp=[`class`,`method`,`getter`,`setter`,`accessor`,`field`,`value`,`get`,`set`],Tp=e=>e!==void 0&&typeof e!=`function`?vp(`Function expected`):e,Ep=(e,t,n,r,i)=>({kind:wp[e],name:t,metadata:r,addInitializer:e=>n._?vp(`Already initialized`):i.push(Tp(e||null))}),Dp=(e,t)=>yp(t,_p(`metadata`),e[3]),Op=(e,t,n,r)=>{for(var i=0,a=e[t>>1],o=a&&a.length;i<o;i++)t&1?a[i].call(n):r=a[i].call(n,r);return r},kp=(e,t,n,r,i,a)=>{for(var o,s,c,l,u,d=t&7,f=!1,p=!1,m=e.length+1,h=wp[d+5],g=e[m-1]=[],_=e[m]||(e[m]=[]),v=(i=i.prototype,fp({get[n](){return jp(this,a)},set[n](e){return Np(this,a,e)}},n)),y=r.length-1;y>=0;y--)l=Ep(d,n,c={},e[3],_),l.static=f,l.private=p,u=l.access={has:e=>n in e},u.get=e=>e[n],u.set=(e,t)=>e[n]=t,s=(0,r[y])({get:v.get,set:v.set},l),c._=1,s===void 0?Tp(s)&&(v[h]=s):typeof s!=`object`||!s?vp(`Object expected`):(Tp(o=s.get)&&(v.get=o),Tp(o=s.set)&&(v.set=o),Tp(o=s.init)&&g.unshift(o));return v&&up(i,n,v),i},Ap=(e,t,n)=>t.has(e)||vp(`Cannot `+n),jp=(e,t,n)=>(Ap(e,t,`read from private field`),t.get(e)),Mp=(e,t,n)=>t.has(e)?vp(`Cannot add the same private member more than once`):t instanceof WeakSet?t.add(e):t.set(e,n),Np=(e,t,n,r)=>(Ap(e,t,`write to private field`),t.set(e,n),n);function Pp(e){return e instanceof hm||e instanceof mm}var Fp=10,Ip=class extends ga{constructor(e){super(e);let t=$n(()=>{let{dragOperation:t}=e;if(al(t.activatorEvent)&&Pp(t.source)&&t.status.initialized){let t=e.registry.plugins.get(ld);if(t)return t.disable(),()=>t.enable()}}),n=e.monitor.addEventListener(`dragmove`,(e,t)=>{queueMicrotask(()=>{if(this.disabled||e.defaultPrevented||!e.nativeEvent)return;let{dragOperation:n}=t;if(!al(e.nativeEvent)||!Pp(n.source)||!n.shape)return;let{actions:r,collisionObserver:i,registry:a}=t,{by:o}=e;if(!o)return;let s=Lp(o),{source:c,target:l}=n,{center:u}=n.shape.current,d=[],f=[];jn(()=>{for(let e of a.droppables){let{id:t}=e;if(!e.accepts(c)||t===l?.id&&Pp(e)||!e.element)continue;let n=e.shape,r=new el(e.element,{getBoundingClientRect:e=>bs(e,void 0,.2)});!r.height||!r.width||(s==`down`&&u.y+Fp<r.center.y||s==`up`&&u.y-Fp>r.center.y||s==`left`&&u.x-Fp>r.center.x||s==`right`&&u.x+Fp<r.center.x)&&(d.push(e),e.shape=r,f.push(()=>e.shape=n))}}),e.preventDefault(),i.disable();let p=i.computeCollisions(d,ml);jn(()=>f.forEach(e=>e()));let[m]=p;if(!m)return;let{id:h}=m,{index:g,group:_}=c.sortable;r.setDropTarget(h).then(()=>{let{source:e,target:t,shape:a}=n;if(!e||!Pp(e)||!a)return;let{index:o,group:s,target:c}=e.sortable,l=g!==o||_!==s,u=l?c:t?.element;if(!u)return;Hc(u);let d=new el(u);if(!d)return;let f=Oi.delta(d,Oi.from(a.current.boundingRectangle),e.alignment);r.move({by:f}),l?r.setDropTarget(e.id).then(()=>i.enable()):i.enable()})})});this.destroy=()=>{n(),t()}}};function Lp(e){let{x:t,y:n}=e;if(t>0)return`right`;if(t<0)return`left`;if(n>0)return`down`;if(n<0)return`up`}var Rp=Object.defineProperty,zp=Object.defineProperties,Bp=Object.getOwnPropertyDescriptors,Vp=Object.getOwnPropertySymbols,Hp=Object.prototype.hasOwnProperty,Up=Object.prototype.propertyIsEnumerable,Wp=(e,t,n)=>t in e?Rp(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,Gp=(e,t)=>{for(var n in t||={})Hp.call(t,n)&&Wp(e,n,t[n]);if(Vp)for(var n of Vp(t))Up.call(t,n)&&Wp(e,n,t[n]);return e},Kp=(e,t)=>zp(e,Bp(t));function qp(e,t,n){if(t===n)return e;let r=e.slice();return r.splice(n,0,r.splice(t,1)[0]),r}function Jp(e){return`initialIndex`in e&&typeof e.initialIndex==`number`&&`index`in e&&typeof e.index==`number`}function Yp(e,t,n){let{source:r,target:i,canceled:a}=t.operation;if(!r||!i||a)return`preventDefault`in t&&t.preventDefault(),e;let o=(e,t)=>e===t||typeof e==`object`&&`id`in e&&e.id===t;if(Array.isArray(e)){let s=e.findIndex(e=>o(e,r.id)),c=e.findIndex(e=>o(e,i.id));if(s===-1||c===-1){if(Jp(r)){let i=r.initialIndex,a=r.index;return i===a||i<0||i>=e.length?(`preventDefault`in t&&t.preventDefault(),e):n(e,i,a)}return e}if(!a&&`index`in r&&typeof r.index==`number`){let t=r.index;if(t!==s)return n(e,s,t)}return n(e,s,c)}let s=Object.entries(e),c=-1,l,u=-1,d;for(let[e,t]of s)if(c===-1&&(c=t.findIndex(e=>o(e,r.id)),c!==-1&&(l=e)),u===-1&&(u=t.findIndex(e=>o(e,i.id)),u!==-1&&(d=e)),c!==-1&&u!==-1)break;if(c===-1&&Jp(r)){let i=r.initialGroup,a=r.initialIndex,o=r.group,s=r.index;if(i==null||o==null||!(i in e)||!(o in e)||i===o&&a===s)return`preventDefault`in t&&t.preventDefault(),e;if(i===o)return Kp(Gp({},e),{[i]:n(e[i],a,s)});let c=e[i][a];return Kp(Gp({},e),{[i]:[...e[i].slice(0,a),...e[i].slice(a+1)],[o]:[...e[o].slice(0,s),c,...e[o].slice(s)]})}if(!r.manager)return e;let{dragOperation:f}=r.manager,p=f.shape?.current.center??f.position.current;if(d==null&&i.id in e){let t=i.shape&&p.y>i.shape.center.y?e[i.id].length:0;d=i.id,u=t}if(l==null||d==null||l===d&&c===u){if(l!=null&&l===d&&c===u&&Jp(r)){let t=r.group!=null&&r.group!==l,i=r.index!==c;if(t||i){let t=r.group??l;if(t in e){if(l===t)return Kp(Gp({},e),{[l]:n(e[l],c,r.index)});let i=e[l][c];return Kp(Gp({},e),{[l]:[...e[l].slice(0,c),...e[l].slice(c+1)],[t]:[...e[t].slice(0,r.index),i,...e[t].slice(r.index)]})}}}return`preventDefault`in t&&t.preventDefault(),e}if(l===d)return Kp(Gp({},e),{[l]:n(e[l],c,u)});let m=i.shape&&Math.round(p.y)>Math.round(i.shape.center.y)?1:0,h=e[l][c];return Kp(Gp({},e),{[l]:[...e[l].slice(0,c),...e[l].slice(c+1)],[d]:[...e[d].slice(0,u+m),h,...e[d].slice(u+m)]})}function Xp(e,t){return Yp(e,t,qp)}var Zp=`__default__`,Qp=class extends ga{constructor(e){super(e);let t=()=>{let t=new Map;for(let n of e.registry.droppables)if(n instanceof hm){let{sortable:e}=n,{group:r}=e,i=t.get(r);i||(i=new Set,t.set(r,i)),i.add(e)}for(let[e,n]of t)t.set(e,new Set(tm(n)));return t},n=[e.monitor.addEventListener(`dragover`,(e,n)=>{if(this.disabled)return;let{dragOperation:r}=n,{source:i,target:a}=r;if(!Pp(i)||!Pp(a)||i.sortable===a.sortable)return;let o=t(),s=i.sortable.group===a.sortable.group,c=o.get(i.sortable.group),l=s?c:o.get(a.sortable.group);!c||!l||queueMicrotask(()=>{e.defaultPrevented||n.renderer.rendering.then(()=>{let r=t();for(let[e,t]of o.entries()){let n=Array.from(t).entries();for(let[t,i]of n)if(i.index!==t||i.group!==e||!r.get(e)?.has(i))return}let u=i.sortable.element,d=a.sortable.element;if(!d||!u||!s&&a.id===i.sortable.group)return;let f=tm(c),p=s?f:tm(l),m=i.sortable.group??Zp,h=a.sortable.group??Zp,g={[m]:f,[h]:p},_=Xp(g,e);if(g===_)return;let v=_[h].indexOf(i.sortable),y=_[h].indexOf(a.sortable);n.collisionObserver.disable(),$p(u,v,d,y),jn(()=>{for(let[e,t]of _[m].entries())t.index=e;if(!s)for(let[e,t]of _[h].entries())t.group=a.sortable.group,t.index=e}),n.actions.setDropTarget(i.id).then(()=>n.collisionObserver.enable())})})}),e.monitor.addEventListener(`dragend`,(e,n)=>{if(!e.canceled)return;let{dragOperation:r}=n,{source:i}=r;Pp(i)&&(i.sortable.initialIndex===i.sortable.index&&i.sortable.initialGroup===i.sortable.group||queueMicrotask(()=>{let e=t(),r=e.get(i.sortable.initialGroup);r&&n.renderer.rendering.then(()=>{for(let[t,n]of e.entries()){let e=Array.from(n).entries();for(let[n,r]of e)if(r.index!==n||r.group!==t)return}let t=tm(r),n=i.sortable.element,a=t[i.sortable.initialIndex],o=a?.element;!a||!o||!n||($p(n,a.index,o,i.index),jn(()=>{for(let[t,n]of e.entries()){let e=Array.from(n).values();for(let t of e)t.index=t.initialIndex,t.group=t.initialGroup}}))})}))})];this.destroy=()=>{for(let e of n)e()}}};function $p(e,t,n,r){let i=r<t?`afterend`:`beforebegin`;n.insertAdjacentElement(i,e)}function em(e,t){return e.index-t.index}function tm(e){return Array.from(e).sort(em)}var nm=[Ip,Qp],rm={duration:250,easing:`cubic-bezier(0.25, 1, 0.5, 1)`,idle:!1},im=new ti,am,om=[R],sm,cm,lm,um,dm,fm;am=[R];var pm=class{constructor(e,t){Mp(this,cm,Op(sm,8,this)),Op(sm,11,this),Mp(this,lm),Mp(this,um),Mp(this,dm,Op(sm,12,this)),Op(sm,15,this),Mp(this,fm),this.register=()=>(jn(()=>{var e,t;(e=this.manager)==null||e.registry.register(this.droppable),(t=this.manager)==null||t.registry.register(this.draggable)}),()=>this.unregister()),this.unregister=()=>{jn(()=>{var e,t;(e=this.manager)==null||e.registry.unregister(this.droppable),(t=this.manager)==null||t.registry.unregister(this.draggable)})},this.destroy=()=>{jn(()=>{this.droppable.destroy(),this.draggable.destroy()})};var n=e,{effects:r=()=>[],group:i,index:a,sensors:o,type:s,transition:c=rm,plugins:l}=n,u=Sp(n,[`effects`,`group`,`index`,`sensors`,`type`,`transition`,`plugins`]);let d=es(l,nm);this.droppable=new hm(u,t,this),this.draggable=new mm(xp(bp({},u),{plugins:d,effects:()=>[()=>{let e=this.manager?.dragOperation.status;e?.initializing&&this.id===this.manager?.dragOperation.source?.id&&im.clear(this.manager),e?.dragging&&im.set(this.manager,this.id,L(()=>({initialIndex:this.index,initialGroup:this.group})))},()=>{let{index:e,group:t,manager:n}=this,r=jp(this,um),i=jp(this,lm);(e!==r||t!==i)&&(Np(this,um,e),Np(this,lm,t),this.animate())},()=>{let{target:e}=this,{isDragSource:t}=this.draggable;(this.draggable.pluginConfig(Hu)?.feedback??`default`)===`move`&&t&&(this.droppable.disabled=!e)},...r()],type:s,sensors:o}),t,this),Np(this,fm,u.element),this.manager=t,this.index=a,Np(this,um,a),this.group=i,Np(this,lm,i),this.type=s,this.transition=c}get initialIndex(){return im.get(this.manager,this.id)?.initialIndex??this.index}get initialGroup(){return im.get(this.manager,this.id)?.initialGroup??this.group}animate(){L(()=>{let{manager:e,transition:t}=this,{shape:n}=this.droppable;if(!e)return;let{idle:r}=e.dragOperation.status;!n||!t||r&&!t.idle||e.renderer.rendering.then(()=>{let{element:r}=this;if(!r)return;for(let e of r.getAnimations())`transitionProperty`in e&&(e.transitionProperty===`transform`||e.transitionProperty===`translate`||e.transitionProperty===`scale`)&&e.cancel();let i=this.refreshShape();if(!i)return;let a={x:n.boundingRectangle.left-i.boundingRectangle.left,y:n.boundingRectangle.top-i.boundingRectangle.top},{translate:o}=Ec(r),s=Jc(r,o,!1),c=Jc(r,o);if(a.x||a.y){let n=Os(fs(r))?xp(bp({},t),{duration:0}):t;qc({element:r,keyframes:{translate:[`${s.x+a.x}px ${s.y+a.y}px ${s.z}`,`${c.x}px ${c.y}px ${c.z}`]},options:n}).then(()=>{e.dragOperation.status.dragging||(this.droppable.shape=void 0)})}})})}get manager(){return this.draggable.manager}set manager(e){jn(()=>{this.draggable.manager=e,this.droppable.manager=e})}set element(e){jn(()=>{let t=jp(this,fm),n=this.droppable.element,r=this.draggable.element;(!n||n===t)&&(this.droppable.element=e),(!r||r===t)&&(this.draggable.element=e),Np(this,fm,e)})}get element(){let e=jp(this,fm);if(e)return Ps.get(e)??e??this.droppable.element}set target(e){this.droppable.element=e}get target(){return this.droppable.element}set source(e){this.draggable.element=e}get source(){return this.draggable.element}get disabled(){return this.draggable.disabled&&this.droppable.disabled}set plugins(e){this.draggable.plugins=es(e,nm)}set disabled(e){jn(()=>{this.droppable.disabled=e,this.draggable.disabled=e})}set data(e){jn(()=>{this.droppable.data=e,this.draggable.data=e})}set handle(e){this.draggable.handle=e}set id(e){this.droppable.id=e,this.draggable.id=e}get id(){return this.droppable.id}set sensors(e){this.draggable.sensors=e}set modifiers(e){this.draggable.modifiers=e}set collisionPriority(e){this.droppable.collisionPriority=e}set collisionDetector(e){this.droppable.collisionDetector=e??pl}set alignment(e){this.draggable.alignment=e}get alignment(){return this.draggable.alignment}set type(e){jn(()=>{this.droppable.type=e,this.draggable.type=e})}get type(){return this.draggable.type}set accept(e){this.droppable.accept=e}get accept(){return this.droppable.accept}get isDropTarget(){return this.droppable.isDropTarget}get isDragSource(){return this.draggable.isDragSource}get isDragging(){return this.draggable.isDragging}get isDropping(){return this.draggable.isDropping}get status(){return this.draggable.status}refreshShape(){return this.droppable.refreshShape()}accepts(e){return this.droppable.accepts(e)}};sm=Cp(),cm=new WeakMap,lm=new WeakMap,um=new WeakMap,dm=new WeakMap,fm=new WeakMap,kp(sm,4,`index`,om,pm,cm),kp(sm,4,`group`,am,pm,dm),Dp(sm,pm);var mm=class extends qd{constructor(e,t,n){super(e,t),this.sortable=n}get index(){return this.sortable.index}get initialIndex(){return this.sortable.initialIndex}get group(){return this.sortable.group}get initialGroup(){return this.sortable.initialGroup}},hm=class extends af{constructor(e,t,n){super(e,t),this.sortable=n}get index(){return this.sortable.index}get group(){return this.sortable.group}},gm=Object.defineProperty,_m=Object.defineProperties,vm=Object.getOwnPropertyDescriptors,ym=Object.getOwnPropertySymbols,bm=Object.prototype.hasOwnProperty,xm=Object.prototype.propertyIsEnumerable,Sm=(e,t,n)=>t in e?gm(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,Cm=(e,t)=>{for(var n in t||={})bm.call(t,n)&&Sm(e,n,t[n]);if(ym)for(var n of ym(t))xm.call(t,n)&&Sm(e,n,t[n]);return e},wm=(e,t)=>_m(e,vm(t));function Tm(e){let{accept:t,collisionDetector:n,collisionPriority:r,id:i,data:a,element:o,handle:s,index:c,group:l,disabled:u,modifiers:d,sensors:f,target:p,type:m,plugins:h}=e,g=Cm(Cm({},rm),e.transition),_=jf(t=>new pm(wm(Cm({},e),{transition:g,register:!1,handle:cf(s),element:cf(o),target:cf(p)}),t)),v=df(_,Em);return Z(i,()=>_.id=i),lf(()=>{jn(()=>{_.group=l,_.index=c})},[_,l,c]),Z(m,()=>_.type=m),Z(t,()=>_.accept=t,void 0,Or),Z(a,()=>a&&(_.data=a)),Z(c,()=>{_.manager?.dragOperation.status.idle&&g?.idle&&_.refreshShape()},ff),mf(s,e=>_.handle=e),mf(o,e=>_.element=e),mf(p,e=>_.target=e),Z(u,()=>_.disabled=u===!0),Z(f,()=>_.sensors=f),Z(n,()=>_.collisionDetector=n),Z(r,()=>_.collisionPriority=r),Z(h,()=>_.plugins=h,void 0,Or),Z(g,()=>_.transition=g,void 0,Or),Z(d,()=>_.modifiers=d,void 0,Or),Z(e.alignment,()=>_.alignment=e.alignment),{sortable:v,get isDragging(){return v.isDragging},get isDropping(){return v.isDropping},get isDragSource(){return v.isDragSource},get isDropTarget(){return v.isDropTarget},handleRef:(0,F.useCallback)(e=>{_.handle=e??void 0},[_]),ref:(0,F.useCallback)(e=>{!e&&_.element?.isConnected&&!_.manager?.dragOperation.status.idle||(_.element=e??void 0)},[_]),sourceRef:(0,F.useCallback)(e=>{!e&&_.source?.isConnected&&!_.manager?.dragOperation.status.idle||(_.source=e??void 0)},[_]),targetRef:(0,F.useCallback)(e=>{!e&&_.target?.isConnected&&!_.manager?.dragOperation.status.idle||(_.target=e??void 0)},[_])}}function Em(e,t,n){return!!(e===`isDragSource`&&!n&&t)}function Dm(e,t,n){var r=this,i=(0,F.useRef)(null),a=(0,F.useRef)(0),o=(0,F.useRef)(null),s=(0,F.useRef)([]),c=(0,F.useRef)(),l=(0,F.useRef)(),u=(0,F.useRef)(e),d=(0,F.useRef)(!0);(0,F.useEffect)(function(){u.current=e},[e]);var f=!t&&t!==0&&typeof window<`u`;if(typeof e!=`function`)throw TypeError(`Expected a function`);t=+t||0;var p=!!(n||={}).leading,m=!(`trailing`in n)||!!n.trailing,h=`maxWait`in n,g=h?Math.max(+n.maxWait||0,t):null;return(0,F.useEffect)(function(){return d.current=!0,function(){d.current=!1}},[]),(0,F.useMemo)(function(){var e=function(e){var t=s.current,n=c.current;return s.current=c.current=null,a.current=e,l.current=u.current.apply(n,t)},n=function(e,t){f&&cancelAnimationFrame(o.current),o.current=f?requestAnimationFrame(e):setTimeout(e,t)},_=function(e){if(!d.current)return!1;var n=e-i.current;return!i.current||n>=t||n<0||h&&e-a.current>=g},v=function(t){return o.current=null,m&&s.current?e(t):(s.current=c.current=null,l.current)},y=function e(){var r=Date.now();if(_(r))return v(r);if(d.current){var o=t-(r-i.current);n(e,h?Math.min(o,g-(r-a.current)):o)}},b=function(){var u=Date.now(),f=_(u);if(s.current=[].slice.call(arguments),c.current=r,i.current=u,f){if(!o.current&&d.current)return a.current=i.current,n(y,t),p?e(i.current):l.current;if(h)return n(y,t),e(i.current)}return o.current||n(y,t),l.current};return b.cancel=function(){o.current&&(f?cancelAnimationFrame(o.current):clearTimeout(o.current)),a.current=0,s.current=i.current=c.current=o.current=null},b.isPending=function(){return!!o.current},b.flush=function(){return o.current?v(Date.now()):l.current},b},[p,h,t,g,m,f])}function Om(e,t){return e===t}function km(e){return typeof e==`function`?function(){return e}:e}function Am(e,t,n){var r,i,a=n&&n.equalityFn||Om,o=(r=(0,F.useState)(km(e)),i=r[1],[r[0],(0,F.useCallback)(function(e){return i(km(e))},[])]),s=o[0],c=o[1],l=Dm((0,F.useCallback)(function(e){return c(e)},[c]),t,n),u=(0,F.useRef)(e);return a(u.current,e)||(l(e),u.current=e),[s,l]}function jm(e,t,n){let r=Array(e);return new Proxy(r,{get(r,i,a){if(typeof i==`string`){let a=i.charCodeAt(0);if(a>=48&&a<=57){let a=+i;if(Number.isInteger(a)&&a>=0&&a<e){let e=r[a];if(!e){let i=t[a*2];e=r[a]={index:a,key:n(a),start:i,size:t[a*2+1],end:i+t[a*2+1],lane:0}}return e}}if(i===`length`)return e}return Reflect.get(r,i,a)}})}function Mm(e,t,n){let r=n.initialDeps??[],i,a=!0;function o(){let o=e();return o.length!==r.length||o.some((e,t)=>r[t]!==e)?(r=o,i=t(...o),n?.onChange&&!(a&&n.skipInitialOnChange)&&n.onChange(i),a=!1,i):i}return o.updateDeps=e=>{r=e},o}function Nm(e,t){if(e===void 0)throw Error(`Unexpected undefined${t?`: ${t}`:``}`);return e}var Pm=(e,t)=>Math.abs(e-t)<1.01,Fm=(e,t,n)=>{let r;return function(...i){e.clearTimeout(r),r=e.setTimeout(()=>t.apply(this,i),n)}},Im,Lm=()=>{if(Im!==void 0)return Im;if(typeof navigator>`u`)return Im=!1;if(/iP(hone|od|ad)/.test(navigator.userAgent))return Im=!0;let e=navigator.maxTouchPoints;return Im=navigator.platform===`MacIntel`&&e!==void 0&&e>0},Rm=e=>{let{offsetWidth:t,offsetHeight:n}=e;return{width:t,height:n}},zm=e=>e,Bm=e=>{let t=Math.max(e.startIndex-e.overscan,0),n=Math.min(e.endIndex+e.overscan,e.count-1)-t+1,r=Array(n);for(let e=0;e<n;e++)r[e]=t+e;return r},Vm=(e,t)=>{let n=e.scrollElement;if(!n)return;let r=e.targetWindow;if(!r)return;let i=e=>{let{width:n,height:r}=e;t({width:Math.round(n),height:Math.round(r)})};if(i(Rm(n)),!r.ResizeObserver)return()=>{};let a=new r.ResizeObserver(t=>{let r=()=>{let e=t[0];if(e?.borderBoxSize){let t=e.borderBoxSize[0];if(t){i({width:t.inlineSize,height:t.blockSize});return}}i(Rm(n))};e.options.useAnimationFrameWithResizeObserver?requestAnimationFrame(r):r()});return a.observe(n,{box:`border-box`}),()=>{a.unobserve(n)}},Hm={passive:!0},Um=(e,t)=>{let n=e.scrollElement;if(!n)return;let r=()=>{t({width:n.innerWidth,height:n.innerHeight})};return r(),n.addEventListener(`resize`,r,Hm),()=>{n.removeEventListener(`resize`,r)}},Wm=typeof window>`u`?!0:`onscrollend`in window,Gm=(e,t,n)=>{let r=e.scrollElement;if(!r)return;let i=e.targetWindow;if(!i)return;let a=e.options.useScrollendEvent&&Wm,o=0,s=a?null:Fm(i,()=>t(o,!1),e.options.isScrollingResetDelay),c=e=>()=>{o=n(r),s?.(),t(o,e)},l=c(!0),u=c(!1);return r.addEventListener(`scroll`,l,Hm),a&&r.addEventListener(`scrollend`,u,Hm),()=>{r.removeEventListener(`scroll`,l),a&&r.removeEventListener(`scrollend`,u)}},Km=(e,t)=>Gm(e,t,t=>{let{horizontal:n,isRtl:r}=e.options;return n?t.scrollLeft*(r&&-1||1):t.scrollTop}),qm=(e,t)=>Gm(e,t,t=>e.options.horizontal?t.scrollX:t.scrollY),Jm=(e,t,n)=>{if(n.options.useCachedMeasurements){let t=n.indexFromElement(e),r=n.options.getItemKey(t);return n.itemSizeCache.get(r)??n.options.estimateSize(t)}if(t?.borderBoxSize){let e=t.borderBoxSize[0];if(e)return Math.round(e[n.options.horizontal?`inlineSize`:`blockSize`])}if(!t){let t=n.indexFromElement(e),r=n.options.getItemKey(t),i=n.itemSizeCache.get(r);if(i!==void 0)return i}return e[n.options.horizontal?`offsetWidth`:`offsetHeight`]},Ym=(e,{adjustments:t=0,behavior:n},r)=>{var i,a;(a=(i=r.scrollElement)?.scrollTo)==null||a.call(i,{[r.options.horizontal?`left`:`top`]:e+t,behavior:n})},Xm=Ym,Zm=Ym,Qm=class{constructor(e){this.unsubs=[],this.scrollElement=null,this.targetWindow=null,this.isScrolling=!1,this.scrollState=null,this.measurementsCache=[],this._flatMeasurements=null,this.itemSizeCache=new Map,this.itemSizeCacheVersion=0,this.laneAssignments=new Map,this.pendingMin=null,this.prevLanes=void 0,this.lanesChangedFlag=!1,this.lanesSettling=!1,this.pendingScrollAnchor=null,this.scrollRect=null,this.scrollOffset=null,this.scrollDirection=null,this.scrollAdjustments=0,this._iosDeferredAdjustment=0,this._iosTouching=!1,this._iosJustTouchEnded=!1,this._iosTouchEndTimerId=null,this._intendedScrollOffset=null,this.elementsCache=new Map,this.now=()=>{var e;return((e=this.targetWindow?.performance)?.now)?.call(e)??Date.now()},this.observer=(()=>{let e=null,t=()=>e||(!this.targetWindow||!this.targetWindow.ResizeObserver?null:e=new this.targetWindow.ResizeObserver(e=>{e.forEach(e=>{let t=()=>{let t=e.target,n=this.indexFromElement(t);if(!t.isConnected){this.observer.unobserve(t);for(let[e,n]of this.elementsCache)if(n===t){this.elementsCache.delete(e);break}return}this.shouldMeasureDuringScroll(n)&&this.resizeItem(n,this.options.measureElement(t,e,this))};this.options.useAnimationFrameWithResizeObserver?requestAnimationFrame(t):t()})}));return{disconnect:()=>{var n;(n=t())==null||n.disconnect(),e=null},observe:e=>t()?.observe(e,{box:`border-box`}),unobserve:e=>t()?.unobserve(e)}})(),this.range=null,this.setOptions=e=>{let t={debug:!1,initialOffset:0,overscan:1,paddingStart:0,paddingEnd:0,scrollPaddingStart:0,scrollPaddingEnd:0,horizontal:!1,getItemKey:zm,rangeExtractor:Bm,onChange:()=>{},measureElement:Jm,initialRect:{width:0,height:0},scrollMargin:0,gap:0,indexAttribute:`data-index`,initialMeasurementsCache:[],lanes:1,anchorTo:`start`,followOnAppend:!1,scrollEndThreshold:1,isScrollingResetDelay:150,enabled:!0,isRtl:!1,useScrollendEvent:!1,useAnimationFrameWithResizeObserver:!1,laneAssignmentMode:`estimate`,useCachedMeasurements:!1};for(let n in e){let r=e[n];r!==void 0&&(t[n]=r)}let n=this.options,r=null,i=null,a=!1;if(n!==void 0&&n.enabled&&t.enabled&&t.anchorTo===`end`&&this.scrollElement!==null){let e=n.count,o=t.count,s=this.getMeasurements(),c=e>0?s[0]?.key??n.getItemKey(0):null,l=e>0?s[e-1]?.key??n.getItemKey(e-1):null;if(o!==e||e>0&&o>0&&(t.getItemKey(0)!==c||t.getItemKey(o-1)!==l)){a=!0;let c=e>0?this.getVirtualItemForOffset(this.getScrollOffset())??s[0]:null;c&&(r=[c.key,this.getScrollOffset()-c.start]);let u=t.followOnAppend===!0?`auto`:t.followOnAppend||null;u&&o>e&&this.isAtEnd(n.scrollEndThreshold)&&(e===0||t.getItemKey(o-1)!==l)&&(i=u)}}this.options=t,a&&(this.pendingMin=0,this.itemSizeCacheVersion++);let o=!1,s=0;if(r&&this.scrollOffset!==null){let[e,t]=r,n=this.getMeasurements(),{count:i,getItemKey:a}=this.options,c=0;for(;c<i&&a(c)!==e;)c++;if(c<i){let e=n[c];if(e){let n=e.start+t;n!==this.scrollOffset&&(s=n-this.scrollOffset,this.scrollOffset=n,o=!0)}}}(o||i)&&(this.pendingScrollAnchor=[o?r[0]:null,o?r[1]:0,i,s])},this.notify=e=>{var t,n;(n=(t=this.options).onChange)==null||n.call(t,this,e)},this.maybeNotify=Mm(()=>(this.calculateRange(),[this.isScrolling,this.range?this.range.startIndex:null,this.range?this.range.endIndex:null]),e=>{this.notify(e)},{key:!1,debug:()=>this.options.debug,initialDeps:[this.isScrolling,this.range?this.range.startIndex:null,this.range?this.range.endIndex:null]}),this.cleanup=()=>{this.unsubs.filter(Boolean).forEach(e=>e()),this.unsubs=[],this.observer.disconnect(),this.rafId!=null&&this.targetWindow&&(this.targetWindow.cancelAnimationFrame(this.rafId),this.rafId=null),this.scrollState=null,this.scrollElement=null,this.targetWindow=null},this._didMount=()=>()=>{this.cleanup()},this._willUpdate=()=>{let e=this.options.enabled?this.options.getScrollElement():null;if(this.scrollElement!==e){if(this.cleanup(),!e){this.maybeNotify();return}if(this.scrollElement=e,this.scrollElement&&`ownerDocument`in this.scrollElement?this.targetWindow=this.scrollElement.ownerDocument.defaultView:this.targetWindow=this.scrollElement?.window??null,this.elementsCache.forEach(e=>{this.observer.observe(e)}),this.unsubs.push(this.options.observeElementRect(this,e=>{this.scrollRect=e,this.maybeNotify()})),this.unsubs.push(this.options.observeElementOffset(this,(e,t)=>{if(t&&this._intendedScrollOffset===null&&e===this.scrollOffset)return;this._intendedScrollOffset!==null&&Math.abs(e-this._intendedScrollOffset)<1.5&&(e=this._intendedScrollOffset),this._intendedScrollOffset=null,this.scrollAdjustments=0;let n=this.getScrollOffset();this.scrollDirection=t?n===e?this.scrollDirection:n<e?`forward`:`backward`:null,this.scrollOffset=e,this.isScrolling=t,this._flushIosDeferredIfReady(),this.scrollState&&this.scheduleScrollReconcile(),this.maybeNotify()})),`addEventListener`in this.scrollElement){let e=this.scrollElement,t=()=>{this._iosTouching=!0,this._iosJustTouchEnded=!1,this._iosTouchEndTimerId!==null&&this.targetWindow!=null&&(this.targetWindow.clearTimeout(this._iosTouchEndTimerId),this._iosTouchEndTimerId=null)},n=()=>{this._iosTouching=!1,!(!Lm()||this.targetWindow==null)&&(this._iosJustTouchEnded=!0,this._iosTouchEndTimerId=this.targetWindow.setTimeout(()=>{this._iosJustTouchEnded=!1,this._iosTouchEndTimerId=null,this._flushIosDeferredIfReady()},150))};e.addEventListener(`touchstart`,t,Hm),e.addEventListener(`touchend`,n,Hm),this.unsubs.push(()=>{e.removeEventListener(`touchstart`,t),e.removeEventListener(`touchend`,n),this._iosTouchEndTimerId!==null&&this.targetWindow!=null&&(this.targetWindow.clearTimeout(this._iosTouchEndTimerId),this._iosTouchEndTimerId=null)})}this._scrollToOffset(this.getScrollOffset(),{adjustments:void 0,behavior:void 0})}let t=this.pendingScrollAnchor;if(this.pendingScrollAnchor=null,t&&this.scrollElement&&this.options.enabled){let[e,n,r,i]=t;e!==null&&!r&&(Lm()&&(this.isScrolling||this._iosTouching||this._iosJustTouchEnded)?i!==0&&(this._iosDeferredAdjustment+=i):this._scrollToOffset(this.getScrollOffset(),{adjustments:void 0,behavior:void 0})),r&&this.scrollToEnd({behavior:r})}},this._flushIosDeferredIfReady=()=>{if(this._iosDeferredAdjustment===0||this.isScrolling||this._iosTouching||this._iosJustTouchEnded)return;let e=this.getScrollOffset(),t=this.getMaxScrollOffset();if(e<0||e>t)return;let n=this._iosDeferredAdjustment;this._iosDeferredAdjustment=0,this._scrollToOffset(e,{adjustments:this.scrollAdjustments+=n,behavior:void 0})},this.rafId=null,this.getSize=()=>this.options.enabled?(this.scrollRect=this.scrollRect??this.options.initialRect,this.scrollRect[this.options.horizontal?`width`:`height`]):(this.scrollRect=null,0),this.getScrollOffset=()=>this.options.enabled?(this.scrollOffset=this.scrollOffset??(typeof this.options.initialOffset==`function`?this.options.initialOffset():this.options.initialOffset),this.scrollOffset):(this.scrollOffset=null,0),this.getFurthestMeasurement=(e,t)=>{let n=new Map,r=new Map;for(let i=t-1;i>=0;i--){let t=e[i];if(n.has(t.lane))continue;let a=r.get(t.lane);if(a==null||t.end>a.end?r.set(t.lane,t):t.end<a.end&&n.set(t.lane,!0),n.size===this.options.lanes)break}return r.size===this.options.lanes?Array.from(r.values()).sort((e,t)=>e.end===t.end?e.index-t.index:e.end-t.end)[0]:void 0},this.getMeasurementOptions=Mm(()=>[this.options.count,this.options.paddingStart,this.options.scrollMargin,this.options.getItemKey,this.options.enabled,this.options.lanes,this.options.laneAssignmentMode],(e,t,n,r,i,a,o)=>(this.prevLanes!==void 0&&this.prevLanes!==a&&(this.lanesChangedFlag=!0),this.prevLanes=a,this.pendingMin=null,{count:e,paddingStart:t,scrollMargin:n,getItemKey:r,enabled:i,lanes:a,laneAssignmentMode:o}),{key:!1}),this.getMeasurements=Mm(()=>[this.getMeasurementOptions(),this.itemSizeCacheVersion],({count:e,paddingStart:t,scrollMargin:n,getItemKey:r,enabled:i,lanes:a,laneAssignmentMode:o},s)=>{let c=this.itemSizeCache;if(!i)return this.measurementsCache=[],this.itemSizeCache.clear(),this.laneAssignments.clear(),[];if(this.laneAssignments.size>e)for(let t of this.laneAssignments.keys())t>=e&&this.laneAssignments.delete(t);this.lanesChangedFlag&&(this.lanesChangedFlag=!1,this.lanesSettling=!0,this.measurementsCache=[],this.itemSizeCache.clear(),this.laneAssignments.clear(),this.pendingMin=null),this.measurementsCache.length===0&&!this.lanesSettling&&(this.measurementsCache=this.options.initialMeasurementsCache,this.measurementsCache.forEach(e=>{this.itemSizeCache.set(e.key,e.size)}));let l=this.lanesSettling?0:this.pendingMin??0;if(this.pendingMin=null,this.lanesSettling&&this.measurementsCache.length===e&&(this.lanesSettling=!1),a===1){let i=this.options.gap,a=e*2,o=this._flatMeasurements;if(!o||o.length<a){let e=new Float64Array(a);o&&l>0&&e.set(o.subarray(0,l*2)),o=e,this._flatMeasurements=o}let s;if(l===0)s=t+n;else{let e=l-1;s=o[e*2]+o[e*2+1]+i}for(let t=l;t<e;t++){let e=r(t),n=c.get(e),a=typeof n==`number`?n:this.options.estimateSize(t);o[t*2]=s,o[t*2+1]=a,s+=a+i}let u=jm(e,o,r);return this.measurementsCache=u,u}let u=this.measurementsCache.slice(0,l),d=Array(a).fill(void 0);for(let e=0;e<l;e++){let t=u[e];t&&(d[t.lane]=e)}for(let i=l;i<e;i++){let e=r(i),a=this.laneAssignments.get(i),s,l,f=o===`estimate`||c.has(e);if(a!==void 0&&this.options.lanes>1){s=a;let e=d[s],r=e===void 0?void 0:u[e];l=r?r.end+this.options.gap:t+n}else{let e=this.options.lanes===1?u[i-1]:this.getFurthestMeasurement(u,i);l=e?e.end+this.options.gap:t+n,s=e?e.lane:i%this.options.lanes,this.options.lanes>1&&f&&this.laneAssignments.set(i,s)}let p=c.get(e),m=typeof p==`number`?p:this.options.estimateSize(i),h=l+m;u[i]={index:i,start:l,size:m,end:h,key:e,lane:s},d[s]=i}return this.measurementsCache=u,u},{key:!1,debug:()=>this.options.debug}),this.calculateRange=Mm(()=>[this.getMeasurements(),this.getSize(),this.getScrollOffset(),this.options.lanes],(e,t,n,r)=>e.length===0||t===0?(this.range=null,null):(this.range=th(e,t,n,r,r===1&&this._flatMeasurements!=null?this._flatMeasurements:null),this.range),{key:!1,debug:()=>this.options.debug}),this.getVirtualIndexes=Mm(()=>{let e=null,t=null,n=this.calculateRange();return n&&(e=n.startIndex,t=n.endIndex),this.maybeNotify.updateDeps([this.isScrolling,e,t]),[this.options.rangeExtractor,this.options.overscan,this.options.count,e,t]},(e,t,n,r,i)=>r===null||i===null?[]:e({startIndex:r,endIndex:i,overscan:t,count:n}),{key:!1,debug:()=>this.options.debug}),this.indexFromElement=e=>{let t=this.options.indexAttribute,n=e.getAttribute(t);return n?parseInt(n,10):(console.warn(`Missing attribute name '${t}={index}' on measured element.`),-1)},this.shouldMeasureDuringScroll=e=>{if(!this.scrollState||this.scrollState.behavior!==`smooth`)return!0;let t=this.scrollState.index??this.getVirtualItemForOffset(this.scrollState.lastTargetOffset)?.index;if(t!==void 0&&this.range){let n=Math.max(this.options.overscan,Math.ceil((this.range.endIndex-this.range.startIndex)/2)),r=Math.max(0,t-n),i=Math.min(this.options.count-1,t+n);return e>=r&&e<=i}return!0},this.measureElement=e=>{if(!e){this.elementsCache.forEach((e,t)=>{e.isConnected||(this.observer.unobserve(e),this.elementsCache.delete(t))});return}let t=this.indexFromElement(e),n=this.options.getItemKey(t),r=this.elementsCache.get(n);r!==e&&(r&&this.observer.unobserve(r),this.observer.observe(e),this.elementsCache.set(n,e)),(!this.isScrolling||this.scrollState)&&this.shouldMeasureDuringScroll(t)&&this.resizeItem(t,this.options.measureElement(e,void 0,this))},this.resizeItem=(e,t)=>{if(e<0||e>=this.options.count)return;let n,r,i,a=this._flatMeasurements;if(this.options.lanes===1&&a!==null)i=this.options.getItemKey(e),r=a[e*2],n=a[e*2+1];else{let t=this.measurementsCache[e];if(!t)return;i=t.key,r=t.start,n=t.size}let o=t-(this.itemSizeCache.get(i)??n);if(o!==0){let a=this.options.anchorTo===`end`&&this.scrollState?.behavior!==`smooth`&&this.getVirtualDistanceFromEnd()<=this.options.scrollEndThreshold,s=a?this.getTotalSize():0,c=this.scrollState?.behavior!==`smooth`&&(this.shouldAdjustScrollPositionOnItemSizeChange===void 0?r<this.getScrollOffset()+this.scrollAdjustments&&(!this.itemSizeCache.has(i)||this.scrollDirection!==`backward`):this.shouldAdjustScrollPositionOnItemSizeChange(this.measurementsCache[e]??{index:e,key:i,start:r,size:n,end:r+n,lane:0},o,this));(this.pendingMin===null||e<this.pendingMin)&&(this.pendingMin=e),this.itemSizeCache.set(i,t),this.itemSizeCacheVersion++,a?this.applyScrollAdjustment(this.getTotalSize()-s):c&&this.applyScrollAdjustment(o),this.notify(!1)}},this.getVirtualItems=Mm(()=>[this.getVirtualIndexes(),this.getMeasurements()],(e,t)=>{let n=[];for(let r=0,i=e.length;r<i;r++){let i=t[e[r]];n.push(i)}return n},{key:!1,debug:()=>this.options.debug}),this.getVirtualItemForOffset=e=>{let t=this.getMeasurements();if(t.length===0)return;let n=this._flatMeasurements,r=this.options.lanes===1&&n!=null;return Nm(t[$m(0,t.length-1,r?e=>n[e*2]:e=>Nm(t[e]).start,e)])},this.getMaxScrollOffset=()=>{if(!this.scrollElement)return 0;if(`scrollHeight`in this.scrollElement)return this.options.horizontal?this.scrollElement.scrollWidth-this.scrollElement.clientWidth:this.scrollElement.scrollHeight-this.scrollElement.clientHeight;{let e=this.scrollElement.document.documentElement;return this.options.horizontal?e.scrollWidth-this.scrollElement.innerWidth:e.scrollHeight-this.scrollElement.innerHeight}},this.getVirtualDistanceFromEnd=()=>Math.max(this.getTotalSize()-this.getSize()-this.getScrollOffset(),0),this.getDistanceFromEnd=()=>Math.max(this.getMaxScrollOffset()-this.getScrollOffset(),0),this.isAtEnd=(e=this.options.scrollEndThreshold)=>this.getDistanceFromEnd()<=e,this.getOffsetForAlignment=(e,t,n=0)=>{if(!this.scrollElement)return 0;let r=this.getSize(),i=this.getScrollOffset();t===`auto`&&(t=e>=i+r?`end`:`start`),t===`center`?e+=(n-r)/2:t===`end`&&(e-=r);let a=this.getMaxScrollOffset();return Math.max(Math.min(a,e),0)},this.getOffsetForIndex=(e,t=`auto`)=>{e=Math.max(0,Math.min(e,this.options.count-1));let n=this.getSize(),r=this.getScrollOffset(),i=this.measurementsCache[e];if(!i)return;if(t===`auto`)if(i.end>=r+n-this.options.scrollPaddingEnd)t=`end`;else if(i.start<=r+this.options.scrollPaddingStart)t=`start`;else return[r,t];if(t===`end`&&e===this.options.count-1)return[this.getMaxScrollOffset(),t];let a=t===`end`?i.end+this.options.scrollPaddingEnd:i.start-this.options.scrollPaddingStart;return[this.getOffsetForAlignment(a,t,i.size),t]},this.scrollToOffset=(e,{align:t=`start`,behavior:n=`auto`}={})=>{let r=this.getOffsetForAlignment(e,t),i=this.now();this.scrollState={index:null,align:t,behavior:n,startedAt:i,lastTargetOffset:r,stableFrames:0},this._scrollToOffset(r,{adjustments:void 0,behavior:n}),this.scheduleScrollReconcile()},this.scrollToIndex=(e,{align:t=`auto`,behavior:n=`auto`}={})=>{e=Math.max(0,Math.min(e,this.options.count-1));let r=this.getOffsetForIndex(e,t);if(!r)return;let[i,a]=r,o=this.now();this.scrollState={index:e,align:a,behavior:n,startedAt:o,lastTargetOffset:i,stableFrames:0},this._scrollToOffset(i,{adjustments:void 0,behavior:n}),this.scheduleScrollReconcile()},this.scrollBy=(e,{behavior:t=`auto`}={})=>{let n=this.getScrollOffset()+e,r=this.now();this.scrollState={index:null,align:`start`,behavior:t,startedAt:r,lastTargetOffset:n,stableFrames:0},this._scrollToOffset(n,{adjustments:void 0,behavior:t}),this.scheduleScrollReconcile()},this.scrollToEnd=({behavior:e=`auto`}={})=>{if(this.options.count>0){this.scrollToIndex(this.options.count-1,{align:`end`,behavior:e});return}this.scrollToOffset(Math.max(this.getTotalSize()-this.getSize(),0),{behavior:e})},this.getTotalSize=()=>{let e=this.getMeasurements(),t;if(e.length===0)t=this.options.paddingStart;else if(this.options.lanes===1){let n=e.length-1,r=this._flatMeasurements;t=r==null?e[n]?.end??0:r[n*2]+r[n*2+1]}else{let n=Array(this.options.lanes).fill(null),r=e.length-1;for(;r>=0&&n.some(e=>e===null);){let t=e[r];n[t.lane]===null&&(n[t.lane]=t.end),r--}t=Math.max(...n.filter(e=>e!==null))}return Math.max(t-this.options.scrollMargin+this.options.paddingEnd,0)},this.takeSnapshot=()=>{let e=[];if(this.itemSizeCache.size===0)return e;let t=this.getMeasurements();for(let n of t)n&&this.itemSizeCache.has(n.key)&&e.push({index:n.index,key:n.key,start:n.start,size:n.size,end:n.end,lane:n.lane});return e},this._scrollToOffset=(e,{adjustments:t,behavior:n})=>{this._intendedScrollOffset=e+(t??0),this.options.scrollToFn(e,{behavior:n,adjustments:t},this)},this.measure=()=>{this.pendingMin=null,this.itemSizeCache.clear(),this.laneAssignments.clear(),this.itemSizeCacheVersion++,this.notify(!1)},this.setOptions(e)}applyScrollAdjustment(e,t){e!==0&&(Lm()&&(this.isScrolling||this._iosTouching||this._iosJustTouchEnded)?this._iosDeferredAdjustment+=e:(this._scrollToOffset(this.getScrollOffset(),{adjustments:this.scrollAdjustments+=e,behavior:t}),this.scrollOffset!==null&&(this.scrollOffset+=this.scrollAdjustments,this.scrollAdjustments=0)))}scheduleScrollReconcile(){if(!this.targetWindow){this.scrollState=null;return}this.rafId??=this.targetWindow.requestAnimationFrame(()=>{this.rafId=null,this.reconcileScroll()})}reconcileScroll(){if(!this.scrollState||!this.scrollElement)return;if(this.now()-this.scrollState.startedAt>5e3){this.scrollState=null;return}let e=this.scrollState.index==null?void 0:this.getOffsetForIndex(this.scrollState.index,this.scrollState.align),t=e?e[0]:this.scrollState.lastTargetOffset,n=t!==this.scrollState.lastTargetOffset;if(!n&&Pm(t,this.getScrollOffset())){if(this.scrollState.stableFrames++,this.scrollState.stableFrames>=1){this.getScrollOffset()!==t&&this._scrollToOffset(t,{adjustments:void 0,behavior:`auto`}),this.scrollState=null;return}}else if(this.scrollState.stableFrames=0,n){let e=this.getSize()||600,n=Math.abs(t-this.getScrollOffset()),r=this.scrollState.behavior===`smooth`&&n>e;this.scrollState.lastTargetOffset=t,r||(this.scrollState.behavior=`auto`),this._scrollToOffset(t,{adjustments:void 0,behavior:r?`smooth`:`auto`})}this.scheduleScrollReconcile()}},$m=(e,t,n,r)=>{for(;e<=t;){let i=(e+t)/2|0,a=n(i);if(a<r)e=i+1;else if(a>r)t=i-1;else return i}return e>0?e-1:0};function eh(e,t,n){let r=0;for(;r<=t;){let i=(r+t)/2|0,a=e[i*2];if(a<n)r=i+1;else if(a>n)t=i-1;else return i}return r>0?r-1:0}function th(e,t,n,r,i){let a=e.length-1;if(e.length<=r)return{startIndex:0,endIndex:a};if(r===1&&i!==null){let e=eh(i,a,n),r=e,o=n+t;for(;r<a&&i[r*2]+i[r*2+1]<o;)r++;return{startIndex:e,endIndex:r}}let o=$m(0,a,t=>e[t].start,n),s=o;if(r===1)for(;s<a&&e[s].end<n+t;)s++;else if(r>1){let i=Array(r).fill(0);for(;s<a&&i.some(e=>e<n+t);){let t=e[s];i[t.lane]=t.end,s++}let c=Array(r).fill(n+t);for(;o>=0&&c.some(e=>e>=n);){let t=e[o];c[t.lane]=t.start,o--}o=Math.max(0,o-o%r),s=Math.min(a,s+(r-1-s%r))}return{startIndex:o,endIndex:s}}var nh=typeof document<`u`?F.useLayoutEffect:F.useEffect;function rh({useFlushSync:e=!0,directDomUpdates:t=!1,directDomUpdatesMode:n=`transform`,...r}){let i=F.useReducer(e=>e+1,0)[1],a=F.useRef({enabled:t,mode:n,container:null,lastSize:null,lastPositions:new WeakMap,prevRange:null});a.current.enabled=t,a.current.mode=n;let o=e=>{let t=a.current;if(!t.enabled||!t.container)return;let n=e.getTotalSize();if(n!==t.lastSize){t.lastSize=n;let r=e.options.horizontal?`width`:`height`;t.container.style[r]=`${n}px`}let r=!!e.options.horizontal,i=t.mode===`transform`,o=r?`left`:`top`,s=e.options.scrollMargin,c=e.getVirtualItems();for(let n of c){let a=n.start-s,c=e.elementsCache.get(n.key);c&&t.lastPositions.get(c)!==a&&(t.lastPositions.set(c,a),i?c.style.transform=r?`translate3d(${a}px, 0, 0)`:`translate3d(0, ${a}px, 0)`:c.style[o]=`${a}px`)}},s={...r,onChange:(t,n)=>{var s;let c=a.current,l=!0;if(c.enabled){o(t);let e=t.range,n=c.prevRange;l=!n||n.isScrolling!==t.isScrolling||n.startIndex!==e?.startIndex||n.endIndex!==e?.endIndex,l&&(c.prevRange=e?{startIndex:e.startIndex,endIndex:e.endIndex,isScrolling:t.isScrolling}:null)}l&&(e&&n?(0,of.flushSync)(i):i()),(s=r.onChange)==null||s.call(r,t,n)}},[c]=F.useState(()=>{let e=new Qm(s);return Object.assign(e,{containerRef:t=>{let n=a.current;if(n.container=t,n.lastSize=null,t&&n.enabled){let r=e.getTotalSize();n.lastSize=r;let i=e.options.horizontal?`width`:`height`;t.style[i]=`${r}px`}}})});return c.setOptions(s),nh(()=>c._didMount(),[]),nh(()=>c._willUpdate()),nh(()=>{o(c)}),c}function ih(e){return rh({observeElementRect:Vm,observeElementOffset:Km,scrollToFn:Zm,...e})}var ah=n(i(((e,t)=>{(function(n){var r;typeof e==`object`?t.exports=n():typeof define==`function`&&define.amd?define(n):(typeof window<`u`?r=window:typeof global<`u`?r=global:typeof self<`u`&&(r=self),r.objectHash=n())})(function(){return function e(t,n,r){function i(o,s){if(!n[o]){if(!t[o]){var c=typeof u==`function`&&u;if(!s&&c)return c(o,!0);if(a)return a(o,!0);throw Error(`Cannot find module '`+o+`'`)}s=n[o]={exports:{}},t[o][0].call(s.exports,function(e){var n=t[o][1][e];return i(n||e)},s,s.exports,e,t,n,r)}return n[o].exports}for(var a=typeof u==`function`&&u,o=0;o<r.length;o++)i(r[o]);return i}({1:[function(e,t,n){(function(r,i,a,o,s,c,l,u,d){var f=e(`crypto`);function p(e,t){t=g(e,t);var n;return(n=t.algorithm===`passthrough`?new y:f.createHash(t.algorithm)).write===void 0&&(n.write=n.update,n.end=n.update),v(t,n).dispatch(e),n.update||n.end(``),n.digest?n.digest(t.encoding===`buffer`?void 0:t.encoding):(e=n.read(),t.encoding===`buffer`?e:e.toString(t.encoding))}(n=t.exports=p).sha1=function(e){return p(e)},n.keys=function(e){return p(e,{excludeValues:!0,algorithm:`sha1`,encoding:`hex`})},n.MD5=function(e){return p(e,{algorithm:`md5`,encoding:`hex`})},n.keysMD5=function(e){return p(e,{algorithm:`md5`,encoding:`hex`,excludeValues:!0})};var m=f.getHashes?f.getHashes().slice():[`sha1`,`md5`],h=(m.push(`passthrough`),[`buffer`,`hex`,`binary`,`base64`]);function g(e,t){var n={};if(n.algorithm=(t||={}).algorithm||`sha1`,n.encoding=t.encoding||`hex`,n.excludeValues=!!t.excludeValues,n.algorithm=n.algorithm.toLowerCase(),n.encoding=n.encoding.toLowerCase(),n.ignoreUnknown=!0===t.ignoreUnknown,n.respectType=!1!==t.respectType,n.respectFunctionNames=!1!==t.respectFunctionNames,n.respectFunctionProperties=!1!==t.respectFunctionProperties,n.unorderedArrays=!0===t.unorderedArrays,n.unorderedSets=!1!==t.unorderedSets,n.unorderedObjects=!1!==t.unorderedObjects,n.replacer=t.replacer||void 0,n.excludeKeys=t.excludeKeys||void 0,e===void 0)throw Error(`Object argument required.`);for(var r=0;r<m.length;++r)m[r].toLowerCase()===n.algorithm.toLowerCase()&&(n.algorithm=m[r]);if(m.indexOf(n.algorithm)===-1)throw Error(`Algorithm "`+n.algorithm+`"  not supported. supported values: `+m.join(`, `));if(h.indexOf(n.encoding)===-1&&n.algorithm!==`passthrough`)throw Error(`Encoding "`+n.encoding+`"  not supported. supported values: `+h.join(`, `));return n}function _(e){if(typeof e==`function`)return/^function\s+\w*\s*\(\s*\)\s*{\s+\[native code\]\s+}$/i.exec(Function.prototype.toString.call(e))!=null}function v(e,t,n){n||=[];function r(e){return t.update?t.update(e,`utf8`):t.write(e,`utf8`)}return{dispatch:function(t){return this[`_`+((t=e.replacer?e.replacer(t):t)===null?`null`:typeof t)](t)},_object:function(t){var i,o=Object.prototype.toString.call(t),s=/\[object (.*)\]/i.exec(o);if(s=(s=s?s[1]:`unknown:[`+o+`]`).toLowerCase(),0<=(o=n.indexOf(t)))return this.dispatch(`[CIRCULAR:`+o+`]`);if(n.push(t),a!==void 0&&a.isBuffer&&a.isBuffer(t))return r(`buffer:`),r(t);if(s===`object`||s===`function`||s===`asyncfunction`)return o=Object.keys(t),e.unorderedObjects&&(o=o.sort()),!1===e.respectType||_(t)||o.splice(0,0,`prototype`,`__proto__`,`constructor`),e.excludeKeys&&(o=o.filter(function(t){return!e.excludeKeys(t)})),r(`object:`+o.length+`:`),i=this,o.forEach(function(n){i.dispatch(n),r(`:`),e.excludeValues||i.dispatch(t[n]),r(`,`)});if(!this[`_`+s]){if(e.ignoreUnknown)return r(`[`+s+`]`);throw Error(`Unknown object type "`+s+`"`)}this[`_`+s](t)},_array:function(t,i){i=i===void 0?!1!==e.unorderedArrays:i;var a=this;if(r(`array:`+t.length+`:`),!i||t.length<=1)return t.forEach(function(e){return a.dispatch(e)});var o=[],i=t.map(function(t){var r=new y,i=n.slice();return v(e,r,i).dispatch(t),o=o.concat(i.slice(n.length)),r.read().toString()});return n=n.concat(o),i.sort(),this._array(i,!1)},_date:function(e){return r(`date:`+e.toJSON())},_symbol:function(e){return r(`symbol:`+e.toString())},_error:function(e){return r(`error:`+e.toString())},_boolean:function(e){return r(`bool:`+e.toString())},_string:function(e){r(`string:`+e.length+`:`),r(e.toString())},_function:function(t){r(`fn:`),_(t)?this.dispatch(`[native]`):this.dispatch(t.toString()),!1!==e.respectFunctionNames&&this.dispatch(`function-name:`+String(t.name)),e.respectFunctionProperties&&this._object(t)},_number:function(e){return r(`number:`+e.toString())},_xml:function(e){return r(`xml:`+e.toString())},_null:function(){return r(`Null`)},_undefined:function(){return r(`Undefined`)},_regexp:function(e){return r(`regex:`+e.toString())},_uint8array:function(e){return r(`uint8array:`),this.dispatch(Array.prototype.slice.call(e))},_uint8clampedarray:function(e){return r(`uint8clampedarray:`),this.dispatch(Array.prototype.slice.call(e))},_int8array:function(e){return r(`int8array:`),this.dispatch(Array.prototype.slice.call(e))},_uint16array:function(e){return r(`uint16array:`),this.dispatch(Array.prototype.slice.call(e))},_int16array:function(e){return r(`int16array:`),this.dispatch(Array.prototype.slice.call(e))},_uint32array:function(e){return r(`uint32array:`),this.dispatch(Array.prototype.slice.call(e))},_int32array:function(e){return r(`int32array:`),this.dispatch(Array.prototype.slice.call(e))},_float32array:function(e){return r(`float32array:`),this.dispatch(Array.prototype.slice.call(e))},_float64array:function(e){return r(`float64array:`),this.dispatch(Array.prototype.slice.call(e))},_arraybuffer:function(e){return r(`arraybuffer:`),this.dispatch(new Uint8Array(e))},_url:function(e){return r(`url:`+e.toString())},_map:function(t){return r(`map:`),t=Array.from(t),this._array(t,!1!==e.unorderedSets)},_set:function(t){return r(`set:`),t=Array.from(t),this._array(t,!1!==e.unorderedSets)},_file:function(e){return r(`file:`),this.dispatch([e.name,e.size,e.type,e.lastModfied])},_blob:function(){if(e.ignoreUnknown)return r(`[blob]`);throw Error(`Hashing Blob objects is currently not supported
(see https://github.com/puleos/object-hash/issues/26)
Use "options.replacer" or "options.ignoreUnknown"
`)},_domwindow:function(){return r(`domwindow`)},_bigint:function(e){return r(`bigint:`+e.toString())},_process:function(){return r(`process`)},_timer:function(){return r(`timer`)},_pipe:function(){return r(`pipe`)},_tcp:function(){return r(`tcp`)},_udp:function(){return r(`udp`)},_tty:function(){return r(`tty`)},_statwatcher:function(){return r(`statwatcher`)},_securecontext:function(){return r(`securecontext`)},_connection:function(){return r(`connection`)},_zlib:function(){return r(`zlib`)},_context:function(){return r(`context`)},_nodescript:function(){return r(`nodescript`)},_httpparser:function(){return r(`httpparser`)},_dataview:function(){return r(`dataview`)},_signal:function(){return r(`signal`)},_fsevent:function(){return r(`fsevent`)},_tlswrap:function(){return r(`tlswrap`)}}}function y(){return{buf:``,write:function(e){this.buf+=e},end:function(e){this.buf+=e},read:function(){return this.buf}}}n.writeToStream=function(e,t,n){return n===void 0&&(n=t,t={}),v(t=g(e,t),n).dispatch(e)}}).call(this,e(`lYpoI2`),typeof self<`u`?self:typeof window<`u`?window:{},e(`buffer`).Buffer,arguments[3],arguments[4],arguments[5],arguments[6],`/fake_9a5aa49d.js`,`/`)},{buffer:3,crypto:5,lYpoI2:11}],2:[function(e,t,n){(function(e,t,r,i,a,o,s,c,l){(function(e){var t=typeof Uint8Array<`u`?Uint8Array:Array,n=43,r=47,i=48,a=97,o=65,s=45,c=95;function l(e){return e=e.charCodeAt(0),e===n||e===s?62:e===r||e===c?63:e<i?-1:e<i+10?e-i+26+26:e<o+26?e-o:e<a+26?e-a+26:void 0}e.toByteArray=function(e){var n,r;if(0<e.length%4)throw Error(`Invalid string. Length must be a multiple of 4`);var i=e.length,i=e.charAt(i-2)===`=`?2:+(e.charAt(i-1)===`=`),a=new t(3*e.length/4-i),o=0<i?e.length-4:e.length,s=0;function c(e){a[s++]=e}for(n=0;n<o;n+=4)c((16711680&(r=l(e.charAt(n))<<18|l(e.charAt(n+1))<<12|l(e.charAt(n+2))<<6|l(e.charAt(n+3))))>>16),c((65280&r)>>8),c(255&r);return i==2?c(255&(r=l(e.charAt(n))<<2|l(e.charAt(n+1))>>4)):i==1&&(c((r=l(e.charAt(n))<<10|l(e.charAt(n+1))<<4|l(e.charAt(n+2))>>2)>>8&255),c(255&r)),a},e.fromByteArray=function(e){var t,n,r,i,a=e.length%3,o=``;function s(e){return`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/`.charAt(e)}for(t=0,r=e.length-a;t<r;t+=3)n=(e[t]<<16)+(e[t+1]<<8)+e[t+2],o+=s((i=n)>>18&63)+s(i>>12&63)+s(i>>6&63)+s(63&i);switch(a){case 1:o=(o+=s((n=e[e.length-1])>>2))+s(n<<4&63)+`==`;break;case 2:o=(o=(o+=s((n=(e[e.length-2]<<8)+e[e.length-1])>>10))+s(n>>4&63))+s(n<<2&63)+`=`}return o}})(n===void 0?this.base64js={}:n)}).call(this,e(`lYpoI2`),typeof self<`u`?self:typeof window<`u`?window:{},e(`buffer`).Buffer,arguments[3],arguments[4],arguments[5],arguments[6],`/node_modules/gulp-browserify/node_modules/base64-js/lib/b64.js`,`/node_modules/gulp-browserify/node_modules/base64-js/lib`)},{buffer:3,lYpoI2:11}],3:[function(e,t,n){(function(t,r,i,a,o,s,c,l,u){var d=e(`base64-js`),f=e(`ieee754`);function i(e,t,n){if(!(this instanceof i))return new i(e,t,n);var r,a,o,s,c=typeof e;if(t===`base64`&&c==`string`)for(e=(s=e).trim?s.trim():s.replace(/^\s+|\s+$/g,``);e.length%4!=0;)e+=`=`;if(c==`number`)r=O(e);else if(c==`string`)r=i.byteLength(e,t);else{if(c!=`object`)throw Error(`First argument needs to be a number, array or string.`);r=O(e.length)}if(i._useTypedArrays?a=i._augment(new Uint8Array(r)):((a=this).length=r,a._isBuffer=!0),i._useTypedArrays&&typeof e.byteLength==`number`)a._set(e);else if(ne(s=e)||i.isBuffer(s)||s&&typeof s==`object`&&typeof s.length==`number`)for(o=0;o<r;o++)i.isBuffer(e)?a[o]=e.readUInt8(o):a[o]=e[o];else if(c==`string`)a.write(e,0,t);else if(c==`number`&&!i._useTypedArrays&&!n)for(o=0;o<r;o++)a[o]=0;return a}function p(e,t,n,r){return i._charsWritten=k(function(e){for(var t=[],n=0;n<e.length;n++)t.push(255&e.charCodeAt(n));return t}(t),e,n,r)}function m(e,t,n,r){return i._charsWritten=k(function(e){for(var t,n,r=[],i=0;i<e.length;i++)n=e.charCodeAt(i),t=n>>8,n%=256,r.push(n),r.push(t);return r}(t),e,n,r)}function h(e,t,n){var r=``;n=Math.min(e.length,n);for(var i=t;i<n;i++)r+=String.fromCharCode(e[i]);return r}function g(e,t,n,r){r||(M(typeof n==`boolean`,`missing or invalid endian`),M(t!=null,`missing offset`),M(t+1<e.length,`Trying to read beyond buffer length`));var i,r=e.length;if(!(r<=t))return n?(i=e[t],t+1<r&&(i|=e[t+1]<<8)):(i=e[t]<<8,t+1<r&&(i|=e[t+1])),i}function _(e,t,n,r){r||(M(typeof n==`boolean`,`missing or invalid endian`),M(t!=null,`missing offset`),M(t+3<e.length,`Trying to read beyond buffer length`));var i,r=e.length;if(!(r<=t))return n?(t+2<r&&(i=e[t+2]<<16),t+1<r&&(i|=e[t+1]<<8),i|=e[t],t+3<r&&(i+=e[t+3]<<24>>>0)):(t+1<r&&(i=e[t+1]<<16),t+2<r&&(i|=e[t+2]<<8),t+3<r&&(i|=e[t+3]),i+=e[t]<<24>>>0),i}function v(e,t,n,r){if(r||(M(typeof n==`boolean`,`missing or invalid endian`),M(t!=null,`missing offset`),M(t+1<e.length,`Trying to read beyond buffer length`)),!(e.length<=t))return r=g(e,t,n,!0),32768&r?-1*(65535-r+1):r}function y(e,t,n,r){if(r||(M(typeof n==`boolean`,`missing or invalid endian`),M(t!=null,`missing offset`),M(t+3<e.length,`Trying to read beyond buffer length`)),!(e.length<=t))return r=_(e,t,n,!0),2147483648&r?-1*(4294967295-r+1):r}function b(e,t,n,r){return r||(M(typeof n==`boolean`,`missing or invalid endian`),M(t+3<e.length,`Trying to read beyond buffer length`)),f.read(e,t,n,23,4)}function x(e,t,n,r){return r||(M(typeof n==`boolean`,`missing or invalid endian`),M(t+7<e.length,`Trying to read beyond buffer length`)),f.read(e,t,n,52,8)}function S(e,t,n,r,i){if(i||(M(t!=null,`missing value`),M(typeof r==`boolean`,`missing or invalid endian`),M(n!=null,`missing offset`),M(n+1<e.length,`trying to write beyond buffer length`),oe(t,65535)),i=e.length,!(i<=n))for(var a=0,o=Math.min(i-n,2);a<o;a++)e[n+a]=(t&255<<8*(r?a:1-a))>>>8*(r?a:1-a)}function C(e,t,n,r,i){if(i||(M(t!=null,`missing value`),M(typeof r==`boolean`,`missing or invalid endian`),M(n!=null,`missing offset`),M(n+3<e.length,`trying to write beyond buffer length`),oe(t,4294967295)),i=e.length,!(i<=n))for(var a=0,o=Math.min(i-n,4);a<o;a++)e[n+a]=t>>>8*(r?a:3-a)&255}function ee(e,t,n,r,i){i||(M(t!=null,`missing value`),M(typeof r==`boolean`,`missing or invalid endian`),M(n!=null,`missing offset`),M(n+1<e.length,`Trying to write beyond buffer length`),se(t,32767,-32768)),e.length<=n||S(e,0<=t?t:65535+t+1,n,r,i)}function w(e,t,n,r,i){i||(M(t!=null,`missing value`),M(typeof r==`boolean`,`missing or invalid endian`),M(n!=null,`missing offset`),M(n+3<e.length,`Trying to write beyond buffer length`),se(t,2147483647,-2147483648)),e.length<=n||C(e,0<=t?t:4294967295+t+1,n,r,i)}function te(e,t,n,r,i){i||(M(t!=null,`missing value`),M(typeof r==`boolean`,`missing or invalid endian`),M(n!=null,`missing offset`),M(n+3<e.length,`Trying to write beyond buffer length`),j(t,34028234663852886e22,-34028234663852886e22)),e.length<=n||f.write(e,t,n,r,23,4)}function T(e,t,n,r,i){i||(M(t!=null,`missing value`),M(typeof r==`boolean`,`missing or invalid endian`),M(n!=null,`missing offset`),M(n+7<e.length,`Trying to write beyond buffer length`),j(t,17976931348623157e292,-17976931348623157e292)),e.length<=n||f.write(e,t,n,r,52,8)}n.Buffer=i,n.SlowBuffer=i,n.INSPECT_MAX_BYTES=50,i.poolSize=8192,i._useTypedArrays=function(){try{var e=new Uint8Array(new ArrayBuffer(0));return e.foo=function(){return 42},e.foo()===42&&typeof e.subarray==`function`}catch{return!1}}(),i.isEncoding=function(e){switch(String(e).toLowerCase()){case`hex`:case`utf8`:case`utf-8`:case`ascii`:case`binary`:case`base64`:case`raw`:case`ucs2`:case`ucs-2`:case`utf16le`:case`utf-16le`:return!0;default:return!1}},i.isBuffer=function(e){return!(e==null||!e._isBuffer)},i.byteLength=function(e,t){var n;switch(e+=``,t||`utf8`){case`hex`:n=e.length/2;break;case`utf8`:case`utf-8`:n=ie(e).length;break;case`ascii`:case`binary`:case`raw`:n=e.length;break;case`base64`:n=ae(e).length;break;case`ucs2`:case`ucs-2`:case`utf16le`:case`utf-16le`:n=2*e.length;break;default:throw Error(`Unknown encoding`)}return n},i.concat=function(e,t){if(M(ne(e),`Usage: Buffer.concat(list, [totalLength])
list should be an Array.`),e.length===0)return new i(0);if(e.length===1)return e[0];if(typeof t!=`number`)for(a=t=0;a<e.length;a++)t+=e[a].length;for(var n=new i(t),r=0,a=0;a<e.length;a++){var o=e[a];o.copy(n,r),r+=o.length}return n},i.prototype.write=function(e,t,n,r){isFinite(t)?isFinite(n)||(r=n,n=void 0):(l=r,r=t,t=n,n=l),t=Number(t)||0;var a,o,s,c,l=this.length-t;switch((!n||l<(n=Number(n)))&&(n=l),r=String(r||`utf8`).toLowerCase()){case`hex`:a=function(e,t,n,r){n=Number(n)||0;var a=e.length-n;(!r||a<(r=Number(r)))&&(r=a),M((a=t.length)%2==0,`Invalid hex string`),a/2<r&&(r=a/2);for(var o=0;o<r;o++){var s=parseInt(t.substr(2*o,2),16);M(!isNaN(s),`Invalid hex string`),e[n+o]=s}return i._charsWritten=2*o,o}(this,e,t,n);break;case`utf8`:case`utf-8`:o=this,s=t,c=n,a=i._charsWritten=k(ie(e),o,s,c);break;case`ascii`:case`binary`:a=p(this,e,t,n);break;case`base64`:o=this,s=t,c=n,a=i._charsWritten=k(ae(e),o,s,c);break;case`ucs2`:case`ucs-2`:case`utf16le`:case`utf-16le`:a=m(this,e,t,n);break;default:throw Error(`Unknown encoding`)}return a},i.prototype.toString=function(e,t,n){var r,i,a,o,s=this;if(e=String(e||`utf8`).toLowerCase(),t=Number(t)||0,(n=n===void 0?s.length:Number(n))===t)return``;switch(e){case`hex`:r=function(e,t,n){var r=e.length;(!t||t<0)&&(t=0),(!n||n<0||r<n)&&(n=r);for(var i=``,a=t;a<n;a++)i+=re(e[a]);return i}(s,t,n);break;case`utf8`:case`utf-8`:r=function(e,t,n){var r=``,i=``;n=Math.min(e.length,n);for(var a=t;a<n;a++)e[a]<=127?(r+=A(i)+String.fromCharCode(e[a]),i=``):i+=`%`+e[a].toString(16);return r+A(i)}(s,t,n);break;case`ascii`:case`binary`:r=h(s,t,n);break;case`base64`:i=s,o=n,r=(a=t)===0&&o===i.length?d.fromByteArray(i):d.fromByteArray(i.slice(a,o));break;case`ucs2`:case`ucs-2`:case`utf16le`:case`utf-16le`:r=function(e,t,n){for(var r=e.slice(t,n),i=``,a=0;a<r.length;a+=2)i+=String.fromCharCode(r[a]+256*r[a+1]);return i}(s,t,n);break;default:throw Error(`Unknown encoding`)}return r},i.prototype.toJSON=function(){return{type:`Buffer`,data:Array.prototype.slice.call(this._arr||this,0)}},i.prototype.copy=function(e,t,n,r){if(t||=0,(r=r||r===0?r:this.length)!==(n||=0)&&e.length!==0&&this.length!==0){M(n<=r,`sourceEnd < sourceStart`),M(0<=t&&t<e.length,`targetStart out of bounds`),M(0<=n&&n<this.length,`sourceStart out of bounds`),M(0<=r&&r<=this.length,`sourceEnd out of bounds`),r>this.length&&(r=this.length);var a=(r=e.length-t<r-n?e.length-t+n:r)-n;if(a<100||!i._useTypedArrays)for(var o=0;o<a;o++)e[o+t]=this[o+n];else e._set(this.subarray(n,n+a),t)}},i.prototype.slice=function(e,t){var n=this.length;if(e=D(e,n,0),t=D(t,n,n),i._useTypedArrays)return i._augment(this.subarray(e,t));for(var r=t-e,a=new i(r,void 0,!0),o=0;o<r;o++)a[o]=this[o+e];return a},i.prototype.get=function(e){return console.log(`.get() is deprecated. Access using array indexes instead.`),this.readUInt8(e)},i.prototype.set=function(e,t){return console.log(`.set() is deprecated. Access using array indexes instead.`),this.writeUInt8(e,t)},i.prototype.readUInt8=function(e,t){if(t||(M(e!=null,`missing offset`),M(e<this.length,`Trying to read beyond buffer length`)),!(e>=this.length))return this[e]},i.prototype.readUInt16LE=function(e,t){return g(this,e,!0,t)},i.prototype.readUInt16BE=function(e,t){return g(this,e,!1,t)},i.prototype.readUInt32LE=function(e,t){return _(this,e,!0,t)},i.prototype.readUInt32BE=function(e,t){return _(this,e,!1,t)},i.prototype.readInt8=function(e,t){if(t||(M(e!=null,`missing offset`),M(e<this.length,`Trying to read beyond buffer length`)),!(e>=this.length))return 128&this[e]?-1*(255-this[e]+1):this[e]},i.prototype.readInt16LE=function(e,t){return v(this,e,!0,t)},i.prototype.readInt16BE=function(e,t){return v(this,e,!1,t)},i.prototype.readInt32LE=function(e,t){return y(this,e,!0,t)},i.prototype.readInt32BE=function(e,t){return y(this,e,!1,t)},i.prototype.readFloatLE=function(e,t){return b(this,e,!0,t)},i.prototype.readFloatBE=function(e,t){return b(this,e,!1,t)},i.prototype.readDoubleLE=function(e,t){return x(this,e,!0,t)},i.prototype.readDoubleBE=function(e,t){return x(this,e,!1,t)},i.prototype.writeUInt8=function(e,t,n){n||(M(e!=null,`missing value`),M(t!=null,`missing offset`),M(t<this.length,`trying to write beyond buffer length`),oe(e,255)),t>=this.length||(this[t]=e)},i.prototype.writeUInt16LE=function(e,t,n){S(this,e,t,!0,n)},i.prototype.writeUInt16BE=function(e,t,n){S(this,e,t,!1,n)},i.prototype.writeUInt32LE=function(e,t,n){C(this,e,t,!0,n)},i.prototype.writeUInt32BE=function(e,t,n){C(this,e,t,!1,n)},i.prototype.writeInt8=function(e,t,n){n||(M(e!=null,`missing value`),M(t!=null,`missing offset`),M(t<this.length,`Trying to write beyond buffer length`),se(e,127,-128)),t>=this.length||(0<=e?this.writeUInt8(e,t,n):this.writeUInt8(255+e+1,t,n))},i.prototype.writeInt16LE=function(e,t,n){ee(this,e,t,!0,n)},i.prototype.writeInt16BE=function(e,t,n){ee(this,e,t,!1,n)},i.prototype.writeInt32LE=function(e,t,n){w(this,e,t,!0,n)},i.prototype.writeInt32BE=function(e,t,n){w(this,e,t,!1,n)},i.prototype.writeFloatLE=function(e,t,n){te(this,e,t,!0,n)},i.prototype.writeFloatBE=function(e,t,n){te(this,e,t,!1,n)},i.prototype.writeDoubleLE=function(e,t,n){T(this,e,t,!0,n)},i.prototype.writeDoubleBE=function(e,t,n){T(this,e,t,!1,n)},i.prototype.fill=function(e,t,n){if(t||=0,n||=this.length,M(typeof(e=typeof(e||=0)==`string`?e.charCodeAt(0):e)==`number`&&!isNaN(e),`value is not a number`),M(t<=n,`end < start`),n!==t&&this.length!==0){M(0<=t&&t<this.length,`start out of bounds`),M(0<=n&&n<=this.length,`end out of bounds`);for(var r=t;r<n;r++)this[r]=e}},i.prototype.inspect=function(){for(var e=[],t=this.length,r=0;r<t;r++)if(e[r]=re(this[r]),r===n.INSPECT_MAX_BYTES){e[r+1]=`...`;break}return`<Buffer `+e.join(` `)+`>`},i.prototype.toArrayBuffer=function(){if(typeof Uint8Array>`u`)throw Error(`Buffer.toArrayBuffer not supported in this browser`);if(i._useTypedArrays)return new i(this).buffer;for(var e=new Uint8Array(this.length),t=0,n=e.length;t<n;t+=1)e[t]=this[t];return e.buffer};var E=i.prototype;function D(e,t,n){return typeof e==`number`?t<=(e=~~e)?t:0<=e||0<=(e+=t)?e:0:n}function O(e){return(e=~~Math.ceil(+e))<0?0:e}function ne(e){return(Array.isArray||function(e){return Object.prototype.toString.call(e)===`[object Array]`})(e)}function re(e){return e<16?`0`+e.toString(16):e.toString(16)}function ie(e){for(var t=[],n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<=127)t.push(e.charCodeAt(n));else for(var i=n,a=(55296<=r&&r<=57343&&n++,encodeURIComponent(e.slice(i,n+1)).substr(1).split(`%`)),o=0;o<a.length;o++)t.push(parseInt(a[o],16))}return t}function ae(e){return d.toByteArray(e)}function k(e,t,n,r){for(var i=0;i<r&&!(i+n>=t.length||i>=e.length);i++)t[i+n]=e[i];return i}function A(e){try{return decodeURIComponent(e)}catch{return`�`}}function oe(e,t){M(typeof e==`number`,`cannot write a non-number as a number`),M(0<=e,`specified a negative value for writing an unsigned value`),M(e<=t,`value is larger than maximum value for type`),M(Math.floor(e)===e,`value has a fractional component`)}function se(e,t,n){M(typeof e==`number`,`cannot write a non-number as a number`),M(e<=t,`value larger than maximum allowed value`),M(n<=e,`value smaller than minimum allowed value`),M(Math.floor(e)===e,`value has a fractional component`)}function j(e,t,n){M(typeof e==`number`,`cannot write a non-number as a number`),M(e<=t,`value larger than maximum allowed value`),M(n<=e,`value smaller than minimum allowed value`)}function M(e,t){if(!e)throw Error(t||`Failed assertion`)}i._augment=function(e){return e._isBuffer=!0,e._get=e.get,e._set=e.set,e.get=E.get,e.set=E.set,e.write=E.write,e.toString=E.toString,e.toLocaleString=E.toString,e.toJSON=E.toJSON,e.copy=E.copy,e.slice=E.slice,e.readUInt8=E.readUInt8,e.readUInt16LE=E.readUInt16LE,e.readUInt16BE=E.readUInt16BE,e.readUInt32LE=E.readUInt32LE,e.readUInt32BE=E.readUInt32BE,e.readInt8=E.readInt8,e.readInt16LE=E.readInt16LE,e.readInt16BE=E.readInt16BE,e.readInt32LE=E.readInt32LE,e.readInt32BE=E.readInt32BE,e.readFloatLE=E.readFloatLE,e.readFloatBE=E.readFloatBE,e.readDoubleLE=E.readDoubleLE,e.readDoubleBE=E.readDoubleBE,e.writeUInt8=E.writeUInt8,e.writeUInt16LE=E.writeUInt16LE,e.writeUInt16BE=E.writeUInt16BE,e.writeUInt32LE=E.writeUInt32LE,e.writeUInt32BE=E.writeUInt32BE,e.writeInt8=E.writeInt8,e.writeInt16LE=E.writeInt16LE,e.writeInt16BE=E.writeInt16BE,e.writeInt32LE=E.writeInt32LE,e.writeInt32BE=E.writeInt32BE,e.writeFloatLE=E.writeFloatLE,e.writeFloatBE=E.writeFloatBE,e.writeDoubleLE=E.writeDoubleLE,e.writeDoubleBE=E.writeDoubleBE,e.fill=E.fill,e.inspect=E.inspect,e.toArrayBuffer=E.toArrayBuffer,e}}).call(this,e(`lYpoI2`),typeof self<`u`?self:typeof window<`u`?window:{},e(`buffer`).Buffer,arguments[3],arguments[4],arguments[5],arguments[6],`/node_modules/gulp-browserify/node_modules/buffer/index.js`,`/node_modules/gulp-browserify/node_modules/buffer`)},{"base64-js":2,buffer:3,ieee754:10,lYpoI2:11}],4:[function(e,t,n){(function(n,r,i,a,o,s,c,l,u){var i=e(`buffer`).Buffer,d=4,f=new i(d);f.fill(0),t.exports={hash:function(e,t,n,r){for(var a=t(function(e,t){e.length%d!=0&&(n=e.length+(d-e.length%d),e=i.concat([e,f],n));for(var n,r=[],a=t?e.readInt32BE:e.readInt32LE,o=0;o<e.length;o+=d)r.push(a.call(e,o));return r}(e=i.isBuffer(e)?e:new i(e),r),8*e.length),t=r,o=new i(n),s=t?o.writeInt32BE:o.writeInt32LE,c=0;c<a.length;c++)s.call(o,a[c],4*c,!0);return o}}}).call(this,e(`lYpoI2`),typeof self<`u`?self:typeof window<`u`?window:{},e(`buffer`).Buffer,arguments[3],arguments[4],arguments[5],arguments[6],`/node_modules/gulp-browserify/node_modules/crypto-browserify/helpers.js`,`/node_modules/gulp-browserify/node_modules/crypto-browserify`)},{buffer:3,lYpoI2:11}],5:[function(e,t,n){(function(t,r,i,a,o,s,c,l,u){var i=e(`buffer`).Buffer,d=e(`./sha`),f=e(`./sha256`),p=e(`./rng`),m={sha1:d,sha256:f,md5:e(`./md5`)},h=64,g=new i(h);function _(e,t){var n=m[e||=`sha1`],r=[];return n||v(`algorithm:`,e,`is not yet supported`),{update:function(e){return i.isBuffer(e)||(e=new i(e)),r.push(e),e.length,this},digest:function(e){var a=i.concat(r),a=t?function(e,t,n){i.isBuffer(t)||(t=new i(t)),i.isBuffer(n)||(n=new i(n)),t.length>h?t=e(t):t.length<h&&(t=i.concat([t,g],h));for(var r=new i(h),a=new i(h),o=0;o<h;o++)r[o]=54^t[o],a[o]=92^t[o];return n=e(i.concat([r,n])),e(i.concat([a,n]))}(n,t,a):n(a);return r=null,e?a.toString(e):a}}}function v(){var e=[].slice.call(arguments).join(` `);throw Error([e,`we accept pull requests`,`http://github.com/dominictarr/crypto-browserify`].join(`
`))}g.fill(0),n.createHash=function(e){return _(e)},n.createHmac=_,n.randomBytes=function(e,t){if(!t||!t.call)return new i(p(e));try{t.call(this,void 0,new i(p(e)))}catch(e){t(e)}};var y,b=[`createCredentials`,`createCipher`,`createCipheriv`,`createDecipher`,`createDecipheriv`,`createSign`,`createVerify`,`createDiffieHellman`,`pbkdf2`],x=function(e){n[e]=function(){v(`sorry,`,e,`is not implemented yet`)}};for(y in b)x(b[y],y)}).call(this,e(`lYpoI2`),typeof self<`u`?self:typeof window<`u`?window:{},e(`buffer`).Buffer,arguments[3],arguments[4],arguments[5],arguments[6],`/node_modules/gulp-browserify/node_modules/crypto-browserify/index.js`,`/node_modules/gulp-browserify/node_modules/crypto-browserify`)},{"./md5":6,"./rng":7,"./sha":8,"./sha256":9,buffer:3,lYpoI2:11}],6:[function(e,t,n){(function(n,r,i,a,o,s,c,l,u){var d=e(`./helpers`);function f(e,t){e[t>>5]|=128<<t%32,e[14+(t+64>>>9<<4)]=t;for(var n=1732584193,r=-271733879,i=-1732584194,a=271733878,o=0;o<e.length;o+=16){var s=n,c=r,l=i,u=a,n=m(n,r,i,a,e[o+0],7,-680876936),a=m(a,n,r,i,e[o+1],12,-389564586),i=m(i,a,n,r,e[o+2],17,606105819),r=m(r,i,a,n,e[o+3],22,-1044525330);n=m(n,r,i,a,e[o+4],7,-176418897),a=m(a,n,r,i,e[o+5],12,1200080426),i=m(i,a,n,r,e[o+6],17,-1473231341),r=m(r,i,a,n,e[o+7],22,-45705983),n=m(n,r,i,a,e[o+8],7,1770035416),a=m(a,n,r,i,e[o+9],12,-1958414417),i=m(i,a,n,r,e[o+10],17,-42063),r=m(r,i,a,n,e[o+11],22,-1990404162),n=m(n,r,i,a,e[o+12],7,1804603682),a=m(a,n,r,i,e[o+13],12,-40341101),i=m(i,a,n,r,e[o+14],17,-1502002290),n=h(n,r=m(r,i,a,n,e[o+15],22,1236535329),i,a,e[o+1],5,-165796510),a=h(a,n,r,i,e[o+6],9,-1069501632),i=h(i,a,n,r,e[o+11],14,643717713),r=h(r,i,a,n,e[o+0],20,-373897302),n=h(n,r,i,a,e[o+5],5,-701558691),a=h(a,n,r,i,e[o+10],9,38016083),i=h(i,a,n,r,e[o+15],14,-660478335),r=h(r,i,a,n,e[o+4],20,-405537848),n=h(n,r,i,a,e[o+9],5,568446438),a=h(a,n,r,i,e[o+14],9,-1019803690),i=h(i,a,n,r,e[o+3],14,-187363961),r=h(r,i,a,n,e[o+8],20,1163531501),n=h(n,r,i,a,e[o+13],5,-1444681467),a=h(a,n,r,i,e[o+2],9,-51403784),i=h(i,a,n,r,e[o+7],14,1735328473),n=g(n,r=h(r,i,a,n,e[o+12],20,-1926607734),i,a,e[o+5],4,-378558),a=g(a,n,r,i,e[o+8],11,-2022574463),i=g(i,a,n,r,e[o+11],16,1839030562),r=g(r,i,a,n,e[o+14],23,-35309556),n=g(n,r,i,a,e[o+1],4,-1530992060),a=g(a,n,r,i,e[o+4],11,1272893353),i=g(i,a,n,r,e[o+7],16,-155497632),r=g(r,i,a,n,e[o+10],23,-1094730640),n=g(n,r,i,a,e[o+13],4,681279174),a=g(a,n,r,i,e[o+0],11,-358537222),i=g(i,a,n,r,e[o+3],16,-722521979),r=g(r,i,a,n,e[o+6],23,76029189),n=g(n,r,i,a,e[o+9],4,-640364487),a=g(a,n,r,i,e[o+12],11,-421815835),i=g(i,a,n,r,e[o+15],16,530742520),n=_(n,r=g(r,i,a,n,e[o+2],23,-995338651),i,a,e[o+0],6,-198630844),a=_(a,n,r,i,e[o+7],10,1126891415),i=_(i,a,n,r,e[o+14],15,-1416354905),r=_(r,i,a,n,e[o+5],21,-57434055),n=_(n,r,i,a,e[o+12],6,1700485571),a=_(a,n,r,i,e[o+3],10,-1894986606),i=_(i,a,n,r,e[o+10],15,-1051523),r=_(r,i,a,n,e[o+1],21,-2054922799),n=_(n,r,i,a,e[o+8],6,1873313359),a=_(a,n,r,i,e[o+15],10,-30611744),i=_(i,a,n,r,e[o+6],15,-1560198380),r=_(r,i,a,n,e[o+13],21,1309151649),n=_(n,r,i,a,e[o+4],6,-145523070),a=_(a,n,r,i,e[o+11],10,-1120210379),i=_(i,a,n,r,e[o+2],15,718787259),r=_(r,i,a,n,e[o+9],21,-343485551),n=v(n,s),r=v(r,c),i=v(i,l),a=v(a,u)}return[n,r,i,a]}function p(e,t,n,r,i,a){return v((t=v(v(t,e),v(r,a)))<<i|t>>>32-i,n)}function m(e,t,n,r,i,a,o){return p(t&n|~t&r,e,t,i,a,o)}function h(e,t,n,r,i,a,o){return p(t&r|n&~r,e,t,i,a,o)}function g(e,t,n,r,i,a,o){return p(t^n^r,e,t,i,a,o)}function _(e,t,n,r,i,a,o){return p(n^(t|~r),e,t,i,a,o)}function v(e,t){var n=(65535&e)+(65535&t);return(e>>16)+(t>>16)+(n>>16)<<16|65535&n}t.exports=function(e){return d.hash(e,f,16)}}).call(this,e(`lYpoI2`),typeof self<`u`?self:typeof window<`u`?window:{},e(`buffer`).Buffer,arguments[3],arguments[4],arguments[5],arguments[6],`/node_modules/gulp-browserify/node_modules/crypto-browserify/md5.js`,`/node_modules/gulp-browserify/node_modules/crypto-browserify`)},{"./helpers":4,buffer:3,lYpoI2:11}],7:[function(e,t,n){(function(e,n,r,i,a,o,s,c,l){var u;t.exports=u||function(e){for(var t,n=Array(e),r=0;r<e;r++)!(3&r)&&(t=4294967296*Math.random()),n[r]=t>>>((3&r)<<3)&255;return n}}).call(this,e(`lYpoI2`),typeof self<`u`?self:typeof window<`u`?window:{},e(`buffer`).Buffer,arguments[3],arguments[4],arguments[5],arguments[6],`/node_modules/gulp-browserify/node_modules/crypto-browserify/rng.js`,`/node_modules/gulp-browserify/node_modules/crypto-browserify`)},{buffer:3,lYpoI2:11}],8:[function(e,t,n){(function(n,r,i,a,o,s,c,l,u){var d=e(`./helpers`);function f(e,t){e[t>>5]|=128<<24-t%32,e[15+(t+64>>9<<4)]=t;for(var n,r,i,a=Array(80),o=1732584193,s=-271733879,c=-1732584194,l=271733878,u=-1009589776,d=0;d<e.length;d+=16){for(var f=o,h=s,g=c,_=l,v=u,y=0;y<80;y++){a[y]=y<16?e[d+y]:m(a[y-3]^a[y-8]^a[y-14]^a[y-16],1);var b=p(p(m(o,5),(b=s,r=c,i=l,(n=y)<20?b&r|~b&i:!(n<40)&&n<60?b&r|b&i|r&i:b^r^i)),p(p(u,a[y]),(n=y)<20?1518500249:n<40?1859775393:n<60?-1894007588:-899497514)),u=l,l=c,c=m(s,30),s=o,o=b}o=p(o,f),s=p(s,h),c=p(c,g),l=p(l,_),u=p(u,v)}return[o,s,c,l,u]}function p(e,t){var n=(65535&e)+(65535&t);return(e>>16)+(t>>16)+(n>>16)<<16|65535&n}function m(e,t){return e<<t|e>>>32-t}t.exports=function(e){return d.hash(e,f,20,!0)}}).call(this,e(`lYpoI2`),typeof self<`u`?self:typeof window<`u`?window:{},e(`buffer`).Buffer,arguments[3],arguments[4],arguments[5],arguments[6],`/node_modules/gulp-browserify/node_modules/crypto-browserify/sha.js`,`/node_modules/gulp-browserify/node_modules/crypto-browserify`)},{"./helpers":4,buffer:3,lYpoI2:11}],9:[function(e,t,n){(function(n,r,i,a,o,s,c,l,u){function d(e,t){var n=(65535&e)+(65535&t);return(e>>16)+(t>>16)+(n>>16)<<16|65535&n}function f(e,t){var n,r=[1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298],i=[1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225],a=Array(64);e[t>>5]|=128<<24-t%32,e[15+(t+64>>9<<4)]=t;for(var o,s,c=0;c<e.length;c+=16){for(var l=i[0],u=i[1],f=i[2],p=i[3],g=i[4],_=i[5],v=i[6],y=i[7],b=0;b<64;b++)a[b]=b<16?e[b+c]:d(d(d((s=a[b-2],m(s,17)^m(s,19)^h(s,10)),a[b-7]),(s=a[b-15],m(s,7)^m(s,18)^h(s,3))),a[b-16]),n=d(d(d(d(y,m(s=g,6)^m(s,11)^m(s,25)),g&_^~g&v),r[b]),a[b]),o=d(m(o=l,2)^m(o,13)^m(o,22),l&u^l&f^u&f),y=v,v=_,_=g,g=d(p,n),p=f,f=u,u=l,l=d(n,o);i[0]=d(l,i[0]),i[1]=d(u,i[1]),i[2]=d(f,i[2]),i[3]=d(p,i[3]),i[4]=d(g,i[4]),i[5]=d(_,i[5]),i[6]=d(v,i[6]),i[7]=d(y,i[7])}return i}var p=e(`./helpers`),m=function(e,t){return e>>>t|e<<32-t},h=function(e,t){return e>>>t};t.exports=function(e){return p.hash(e,f,32,!0)}}).call(this,e(`lYpoI2`),typeof self<`u`?self:typeof window<`u`?window:{},e(`buffer`).Buffer,arguments[3],arguments[4],arguments[5],arguments[6],`/node_modules/gulp-browserify/node_modules/crypto-browserify/sha256.js`,`/node_modules/gulp-browserify/node_modules/crypto-browserify`)},{"./helpers":4,buffer:3,lYpoI2:11}],10:[function(e,t,n){(function(e,t,r,i,a,o,s,c,l){n.read=function(e,t,n,r,i){var a,o,s=8*i-r-1,c=(1<<s)-1,l=c>>1,u=-7,d=n?i-1:0,f=n?-1:1,i=e[t+d];for(d+=f,a=i&(1<<-u)-1,i>>=-u,u+=s;0<u;a=256*a+e[t+d],d+=f,u-=8);for(o=a&(1<<-u)-1,a>>=-u,u+=r;0<u;o=256*o+e[t+d],d+=f,u-=8);if(a===0)a=1-l;else{if(a===c)return o?NaN:1/0*(i?-1:1);o+=2**r,a-=l}return(i?-1:1)*o*2**(a-r)},n.write=function(e,t,n,r,i,a){var o,s,c=8*a-i-1,l=(1<<c)-1,u=l>>1,d=i===23?2**-24-2**-77:0,f=r?0:a-1,p=r?1:-1,a=+(t<0||t===0&&1/t<0);for(t=Math.abs(t),isNaN(t)||t===1/0?(s=+!!isNaN(t),o=l):(o=Math.floor(Math.log(t)/Math.LN2),t*(r=2**-o)<1&&(o--,r*=2),2<=(t+=1<=o+u?d/r:d*2**(1-u))*r&&(o++,r/=2),l<=o+u?(s=0,o=l):1<=o+u?(s=(t*r-1)*2**i,o+=u):(s=t*2**(u-1)*2**i,o=0));8<=i;e[n+f]=255&s,f+=p,s/=256,i-=8);for(o=o<<i|s,c+=i;0<c;e[n+f]=255&o,f+=p,o/=256,c-=8);e[n+f-p]|=128*a}}).call(this,e(`lYpoI2`),typeof self<`u`?self:typeof window<`u`?window:{},e(`buffer`).Buffer,arguments[3],arguments[4],arguments[5],arguments[6],`/node_modules/gulp-browserify/node_modules/ieee754/index.js`,`/node_modules/gulp-browserify/node_modules/ieee754`)},{buffer:3,lYpoI2:11}],11:[function(e,t,n){(function(e,n,r,i,a,o,s,c,l){var u,d,f;function p(){}(e=t.exports={}).nextTick=(d=typeof window<`u`&&window.setImmediate,f=typeof window<`u`&&window.postMessage&&window.addEventListener,d?function(e){return window.setImmediate(e)}:f?(u=[],window.addEventListener(`message`,function(e){var t=e.source;t!==window&&t!==null||e.data!==`process-tick`||(e.stopPropagation(),0<u.length&&u.shift()())},!0),function(e){u.push(e),window.postMessage(`process-tick`,`*`)}):function(e){setTimeout(e,0)}),e.title=`browser`,e.browser=!0,e.env={},e.argv=[],e.on=p,e.addListener=p,e.once=p,e.off=p,e.removeListener=p,e.removeAllListeners=p,e.emit=p,e.binding=function(e){throw Error(`process.binding is not supported`)},e.cwd=function(){return`/`},e.chdir=function(e){throw Error(`process.chdir is not supported`)}}).call(this,e(`lYpoI2`),typeof self<`u`?self:typeof window<`u`?window:{},e(`buffer`).Buffer,arguments[3],arguments[4],arguments[5],arguments[6],`/node_modules/gulp-browserify/node_modules/process/browser.js`,`/node_modules/gulp-browserify/node_modules/process`)},{buffer:3,lYpoI2:11}]},{},[1])(1)})}))(),1);c(),c();function oh(e,t,n){let r=t.split(`.`),i=o({},e),a=i;for(let e=0;e<r.length;e++){let[t,i]=r[e].replace(`]`,``).split(`[`),o=e===r.length-1;if(i!==void 0){Array.isArray(a[t])||(a[t]=[]);let e=Number(i);if(o){a[t][e]=n;continue}a[t][e]===void 0&&(a[t][e]={}),a=a[t][e];continue}if(o){a[t]=n;continue}a[t]===void 0&&(a[t]={}),a=a[t]}return o(o({},e),i)}c(),c();var sh={Button:`_Button_oe4qj_1`,"Button--medium":`_Button--medium_oe4qj_34`,"Button--large":`_Button--large_oe4qj_62`,"Button-icon":`_Button-icon_oe4qj_89`,"Button--primary":`_Button--primary_oe4qj_93`,"Button--disabled":`_Button--disabled_oe4qj_123`,"Button--secondary":`_Button--secondary_oe4qj_135`,"Button--flush":`_Button--flush_oe4qj_171`,"Button--fullWidth":`_Button--fullWidth_oe4qj_179`,"Button-spinner":`_Button-spinner_oe4qj_184`};c();var ch=/^(data-.*)$/,lh=e=>{let t={};for(let n in e)Object.prototype.hasOwnProperty.call(e,n)&&ch.test(n)&&(t[n]=e[n]);return t},uh=a(`Button`,sh),dh=t=>{var n=t,{children:i,href:a,onClick:s,variant:c=`primary`,type:l,disabled:u,tabIndex:d,newTab:f,fullWidth:p,icon:m,size:h=`medium`,loading:g=!1}=n,_=r(n,[`children`,`href`,`onClick`,`variant`,`type`,`disabled`,`tabIndex`,`newTab`,`fullWidth`,`icon`,`size`,`loading`]);let[v,b]=(0,F.useState)(g);(0,F.useEffect)(()=>b(g),[g]);let x=a?`a`:l?`button`:`span`,S=lh(_);return(0,I.jsxs)(x,e(o({className:uh({primary:c===`primary`,secondary:c===`secondary`,disabled:u,fullWidth:p,[h]:!0}),onClick:e=>{s&&(b(!0),Promise.resolve(s(e)).then(()=>{b(!1)}))},type:l,disabled:u||v,tabIndex:d,target:f?`_blank`:void 0,rel:f?`noreferrer`:void 0,href:a},S),{children:[m&&(0,I.jsx)(`div`,{className:uh(`icon`),children:m}),i,v&&(0,I.jsx)(`div`,{className:uh(`spinner`),children:(0,I.jsx)(y,{size:14})})]}))};c(),c();var fh={InputWrapper:`_InputWrapper_qyenz_1`,"Input-label":`_Input-label_qyenz_5`,"Input-labelIcon":`_Input-labelIcon_qyenz_17`,"Input-disabledIcon":`_Input-disabledIcon_qyenz_24`,"Input-input":`_Input-input_qyenz_29`,"Input-select":`_Input-select_qyenz_61`,"Input-selectIcon":`_Input-selectIcon_qyenz_71`,Input:`_Input_qyenz_1`,"Input--readOnly":`_Input--readOnly_qyenz_111`,"Input-radioGroupItems":`_Input-radioGroupItems_qyenz_150`,"Input-radio":`_Input-radio_qyenz_150`,"Input-radioInner":`_Input-radioInner_qyenz_179`,"Input-radioInput":`_Input-radioInput_qyenz_261`},ph=a(`Input`,fh),mh=({children:e,icon:t,label:n,el:r=`label`,readOnly:i,className:a})=>(0,I.jsxs)(r,{className:a,children:[(0,I.jsxs)(`div`,{className:ph(`label`),children:[t?(0,I.jsx)(`div`,{className:ph(`labelIcon`),children:t}):(0,I.jsx)(I.Fragment,{}),n,i&&(0,I.jsx)(`div`,{className:ph(`disabledIcon`),title:`Read-only`,children:(0,I.jsx)(w,{size:`12`})})]}),e]}),hh=({children:e,icon:t,label:n,el:r=`label`,readOnly:i})=>{let a=P(e=>e.overrides),o=(0,F.useMemo)(()=>a.fieldLabel||mh,[a]);return n?(0,I.jsx)(o,{label:n,icon:t,className:ph({readOnly:i}),readOnly:i,el:r,children:e}):(0,I.jsx)(I.Fragment,{children:e})};c(),c(),c(),c();var gh={ArrayField:`_ArrayField_62huh_5`,"ArrayField--isDraggingFrom":`_ArrayField--isDraggingFrom_62huh_30`,"ArrayField-addButton":`_ArrayField-addButton_62huh_38`,"ArrayField--hasItems":`_ArrayField--hasItems_62huh_58`,"ArrayField-inner":`_ArrayField-inner_62huh_93`,ArrayFieldItem:`_ArrayFieldItem_62huh_101`,"ArrayFieldItem--isDragging":`_ArrayFieldItem--isDragging_62huh_110`,"ArrayFieldItem--isExpanded":`_ArrayFieldItem--isExpanded_62huh_114`,"ArrayFieldItem-summary":`_ArrayFieldItem-summary_62huh_132`,"ArrayFieldItem--noFields":`_ArrayFieldItem--noFields_62huh_167`,"ArrayField--addDisabled":`_ArrayField--addDisabled_62huh_176`,"ArrayFieldItem-body":`_ArrayFieldItem-body_62huh_228`,"ArrayFieldItem-fieldset":`_ArrayFieldItem-fieldset_62huh_237`,"ArrayFieldItem-rhs":`_ArrayFieldItem-rhs_62huh_250`,"ArrayFieldItem-actions":`_ArrayFieldItem-actions_62huh_256`};c(),c();function _h(e,t){let n=(0,F.useContext)(e);if(!n)throw Error(`useContextStore must be used inside context`);return ue(n,On(t))}function vh(e){return({children:t,value:n})=>{let[r]=(0,F.useState)(()=>v(()=>n));return(0,I.jsx)(e.Provider,{value:r,children:t})}}function yh(e){let t=(0,F.createContext)(v(lt(()=>e)));return{ctx:t,Provider:vh(t)}}var bh=yh({}),xh=()=>(0,F.useContext)(bh.ctx);function Sh(e){let t=(0,F.useContext)(bh.ctx);if(!t)throw Error(`useContextStore must be used inside context`);return ue(t,On(e))}c(),c();var Ch=a(`DragIcon`,{DragIcon:`_DragIcon_5e515_1`,"DragIcon--disabled":`_DragIcon--disabled_5e515_10`}),wh=({isDragDisabled:e})=>(0,I.jsx)(`div`,{className:Ch({disabled:e}),children:(0,I.jsx)(`svg`,{viewBox:`0 0 20 20`,width:`12`,fill:`currentColor`,children:(0,I.jsx)(`path`,{d:`M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z`})})});c(),c();var{Delay:Th,Distance:Eh}=Ad,Dh=[new Th({value:200,tolerance:10})],Oh=[new Th({value:200,tolerance:10}),new Eh({value:5})],kh=({other:e=Oh,mouse:t,touch:n=Dh}={touch:Dh,other:Oh})=>{let[r]=(0,F.useState)(()=>[Pd.configure({activationConstraints(r,i){let{pointerType:a,target:o}=r;return a===`mouse`&&il(o)&&(i.handle===o||i.handle?.contains(o))?t:a===`touch`?n:e}})]);return r};c(),c(),c();var Ah=!1,jh={},Mh,Nh=(e,t,n,r,i)=>{if(!Ah)return;let a=`${n}-debug`;clearTimeout(Mh),Mh=setTimeout(()=>{Object.entries(jh).forEach(([e,{svg:t}])=>{t.remove(),delete jh[e]})},1e3),requestAnimationFrame(()=>{let n=jh[a],o=jh[a]?.line,s=jh[a]?.text;if(!n){let e=`http://www.w3.org/2000/svg`,t=document.createElementNS(e,`svg`);o=document.createElementNS(e,`line`),s=document.createElementNS(e,`text`),t.setAttribute(`id`,a),t.setAttribute(`style`,`position: fixed; height: 100%; width: 100%; pointer-events: none; top: 0px; left: 0px;`),t.appendChild(o),t.appendChild(s),s.setAttribute(`fill`,`black`),document.body.appendChild(t),jh[a]={svg:t,line:o,text:s}}o.setAttribute(`x1`,e.x.toString()),o.setAttribute(`x2`,t.x.toString()),o.setAttribute(`y1`,e.y.toString()),o.setAttribute(`y2`,t.y.toString()),o.setAttribute(`style`,`stroke:${r};stroke-width:2`),s.setAttribute(`x`,(e.x-(e.x-t.x)/2).toString()),s.setAttribute(`y`,(e.y-(e.y-t.y)/2).toString()),i&&(s.innerHTML=i)})},Ph=`increasing`,Fh=(e,t)=>{let{dragOperation:n,droppable:r}=e,{shape:i}=r,{position:a}=n,o=n.shape?.current;if(!o||!i)return null;let s=i.center,c=Math.sqrt((s.x-t.x)**2+(s.y-t.y)**2),l=Math.sqrt((s.x-a.current.x)**2+(s.y-a.current.y)**2);return Ph=l===c?Ph:l<c?`decreasing`:`increasing`,Nh(o.center,s,r.id.toString(),`rebeccapurple`),Ph===`decreasing`?{id:r.id,value:1,type:ho.Collision}:null};c();var Ih=(e,t)=>e===`dynamic`?Math.abs(t.y)>Math.abs(t.x)?t.y===0?null:t.y>0?`down`:`up`:t.x===0?null:t.x>0?`right`:`left`:e===`x`?t.x===0?null:t.x>0?`right`:`left`:t.y===0?null:t.y>0?`down`:`up`;c();var Lh=(e,t,n,r=0)=>{let i=e.boundingRectangle,a=t.center;if(n===`down`){let e=r*t.boundingRectangle.height;return i.bottom>=a.y+e}else if(n===`up`){let e=r*t.boundingRectangle.height;return i.top<a.y-e}else if(n===`left`){let e=r*t.boundingRectangle.width;return a.x-e>=i.left}let o=r*t.boundingRectangle.width;return i.right-o>=a.x};c();var Rh=10,zh={current:{x:0,y:0},delta:{x:0,y:0},previous:{x:0,y:0},direction:null},Bh=(e,t=`dynamic`)=>(zh.current=e,zh.delta={x:e.x-zh.previous.x,y:e.y-zh.previous.y},zh.direction=Ih(t,zh.delta)||zh.direction,(Math.abs(zh.delta.x)>Rh||Math.abs(zh.delta.y)>Rh)&&(zh.previous=Di.from(e)),zh);c();var Vh=({dragOperation:e,droppable:t})=>{let n=e.position.current;if(!n)return null;let{id:r}=t;return t.shape&&t.shape.containsPoint(n)?{id:r,value:1/Di.distance(t.shape.center,n),type:ho.PointerIntersection,priority:mo.High}:null},Hh=e=>{let{dragOperation:t,droppable:n}=e,{shape:r,position:i}=t;if(!n.shape)return null;let a=r?Oi.from(r.current.boundingRectangle).corners:void 0,o=Oi.from(n.shape.boundingRectangle).corners.reduce((e,t,n)=>e+Di.distance(Di.from(t),a?.[n]??i.current),0)/4;return{id:n.id,value:1/o,type:ho.Collision,priority:mo.Normal}};c();var Uh=v(()=>({fallbackEnabled:!1})),Wh=``,Gh=(t,n=.05)=>(r=>{let{dragOperation:i,droppable:a}=r,{position:s}=i,c=i.shape?.current,{shape:l}=a;if(!c||!l)return null;let{center:u}=c,{fallbackEnabled:d}=Uh.getState(),f=Bh(s.current,t),p={direction:f.direction},{center:m}=l,h=Lh(c,l,f.direction,n);if(i.source?.id===a.id){let t=Fh(r,f.previous);if(Nh(u,m,a.id.toString(),`yellow`),t)return e(o({},t),{priority:mo.Highest,data:p})}let g=c.intersectionArea(l),_=g/l.area;if(g&&h){Nh(u,m,a.id.toString(),`green`,f.direction);let t={id:a.id,value:_,priority:mo.High,type:ho.Collision},n=Wh===a.id;return Wh=``,e(o({},t),{id:n?`flush`:t.id,data:p})}if(d&&i.source?.id!==a.id){let n=l.boundingRectangle.right>c.boundingRectangle.left&&l.boundingRectangle.left<c.boundingRectangle.right,i=l.boundingRectangle.bottom>c.boundingRectangle.top&&l.boundingRectangle.top<c.boundingRectangle.bottom;if(t===`y`&&n||i){let n=Hh(r);if(n){let r=Ih(t,{x:c.center.x-(a.shape?.center.x||0),y:c.center.y-(a.shape?.center.y||0)});return p.direction=r,g?(Nh(u,m,a.id.toString(),`red`,r||``),Wh=a.id,e(o({},n),{priority:mo.Low,data:p})):(Nh(u,m,a.id.toString(),`orange`,r||``),e(o({},n),{priority:mo.Lowest,data:p}))}}}return Nh(u,m,a.id.toString(),`hotpink`),null}),Kh=({children:e,onDragStart:t,onDragEnd:n,onMove:r})=>(0,I.jsx)(Of,{sensors:kh({mouse:[new Ad.Distance({value:5})]}),onDragStart:e=>t(e.operation.source?.id.toString()??``),onDragOver:(e,t)=>{e.preventDefault();let{operation:n}=e,{source:i,target:a}=n;if(!i||!a)return;let o=i.data.index,s=a.data.index,c=t.collisionObserver.collisions[0]?.data;if(o!==s&&i.id!==a.id){let e=c?.direction===`up`?`before`:`after`;s>=o&&--s,e===`after`&&(s+=1),r({source:o,target:s})}},onDragEnd:()=>{setTimeout(()=>{n()},250)},children:e}),qh=({id:e,index:t,disabled:n,children:r,type:i=`item`})=>{let{ref:a,isDragging:o,isDropping:s,handleRef:c}=Tm({id:e,type:i,index:t,disabled:n,data:{index:t},collisionDetector:Gh(`y`)});return r({isDragging:o,isDropping:s,ref:a,handleRef:c})};c();var Jh=(0,F.createContext)({}),Yh=()=>{let t=(0,F.useContext)(Jh);return e(o({},t),{readOnlyFields:t.readOnlyFields||{}})},Xh=({children:t,name:n,subName:r,wildcardName:i=n,readOnlyFields:a})=>{let s=`${n}.${r}`,c=`${i}.${r}`,l=(0,F.useMemo)(()=>Object.keys(a).reduce((t,r)=>{if(r.indexOf(s)>-1||r.indexOf(c)>-1){let s=new RegExp(`^(${n}|${i}).`.replace(/\[/g,`\\[`).replace(/\]/g,`\\]`).replace(/\./g,`\\.`).replace(/\*/g,`\\*`)),c=r.replace(s,``);return e(o({},t),{[c]:a[r]})}return t},{}),[n,r,i,a]);return(0,I.jsx)(Jh.Provider,{value:{readOnlyFields:l,localName:r},children:t})};c();var Zh=(e,t)=>t.split(`.`).reduce((e,t)=>{if(!e)return;let[n,r]=t.replace(`]`,``).split(`[`),i=e[n];return r&&i?i[parseInt(r)]:i},e);c();var Qh=(0,F.memo)(({field:t,id:n,index:r,name:i,subName:a,localName:s,onChange:c,forceReadOnly:l})=>{let u=r===void 0?i:`${i}[${r}]`,d=i?`${u}.${a}`:a,f=r===void 0?s??a:`${s}[${r}]`,p=r===void 0?s:`${s}[*]`,m=`${f}.${a}`,h=`${p}.${a}`,{readOnlyFields:g}=Yh(),_=l||(g[d]===void 0?g[h]:g[m]),v=t.label||a;return(0,I.jsx)(Xh,{name:f,wildcardName:p,subName:a,readOnlyFields:g,children:(0,I.jsx)(Fg,{name:d,label:v,id:n,readOnly:_,field:e(o({},t),{label:v}),onChange:(e,t)=>{c(e,t,a)}})})}),$h=a(`ArrayField`,gh),eg=a(`ArrayFieldItem`,gh),tg=(0,F.memo)(({index:e,originalIndex:t,field:n,name:r})=>{let i=Sh(t=>Zh(t,`${[r]}[${e}]`));return(0,F.useMemo)(()=>i&&n.getItemSummary?n.getItemSummary(i,e):`Item #${t}`,[i,n,t,e])}),ng=(0,F.memo)(({id:e,arrayId:t,index:n,dragIndex:r,originalIndex:i,field:a,onChange:o,onToggleExpand:s,readOnly:c,actions:l,name:u,localName:d})=>{let f=P(n=>n.state.ui.arrayState[t]?.openId===e),p=P(e=>e.permissions.getPermissions({item:e.selectedItem}).edit),m=(0,F.useMemo)(()=>a.arrayFields?Object.values(a.arrayFields).some(e=>e.type!==`slot`&&e.visible!==!1):!1,[a.arrayFields]);return(0,I.jsx)(qh,{id:e,index:r,disabled:c,children:({isDragging:t,ref:r,handleRef:h})=>(0,I.jsxs)(`div`,{ref:r,className:eg({isExpanded:f&&m,isDragging:t,noFields:!m}),children:[(0,I.jsxs)(`div`,{ref:h,onClick:n=>{t||(n.preventDefault(),n.stopPropagation(),m&&s(e,f))},className:eg(`summary`),children:[(0,I.jsx)(tg,{index:n,originalIndex:i,field:a,name:u}),(0,I.jsxs)(`div`,{className:eg(`rhs`),children:[!c&&(0,I.jsx)(`div`,{className:eg(`actions`),children:l}),(0,I.jsx)(`div`,{children:(0,I.jsx)(wh,{})})]})]}),(0,I.jsx)(`div`,{className:eg(`body`),children:f&&m&&(0,I.jsx)(`fieldset`,{className:eg(`fieldset`),children:Object.keys(a.arrayFields).map(t=>{let r=a.arrayFields[t];return(0,I.jsx)(Qh,{id:`${e}_${t}`,name:u,index:n,subName:t,localName:d,field:r,onChange:o,forceReadOnly:!p},`${e}_${t}_${n}`)})})})]})})}),rg=({field:t,onChange:n,id:r,name:i=r,label:a,labelIcon:s,readOnly:c,Label:l=e=>(0,I.jsx)(`div`,o({},e))})=>{let u=P(e=>e.setUi),d=Pe(),f=xh(),{localName:p=i}=Yh(),m=()=>Zh(f.getState(),i)??[],h=(0,F.useCallback)(()=>{let{state:e}=d.getState(),t=e.ui.arrayState[r];if(t?.items?.length)return t;let n=m();return{items:Array.from(n||[]).map((e,t)=>({_originalIndex:t,_currentIndex:t,_arrayId:`${r}-${t}`})),openId:``}},[d,r,m,i]),g=Sh(()=>m().length),_=(0,F.useMemo)(h,[h]),v=P(e=>e.state.ui.arrayState[r]??_),y=Pe(),x=(0,F.useCallback)(t=>{let n=y.getState().state;return{arrayState:e(o({},n.ui.arrayState),{[r]:o(o({},h()),t)})}},[y]),C=(0,F.useCallback)(()=>h().items.reduce((e,t)=>t._originalIndex>e?t._originalIndex:e,-1),[]),ee=(0,F.useCallback)(t=>{let n=C(),i=h(),a=Array.from(t||[]).map((e,t)=>{let a=i.items[t],o={_originalIndex:a?._originalIndex??n+1,_currentIndex:a?._currentIndex??t,_arrayId:i.items[t]?._arrayId||`${r}-${n+1}`};return o._originalIndex>n&&(n=o._originalIndex),o});return e(o({},i),{items:a})},[]),[w,T]=(0,F.useState)(``),E=!!w,D=(0,F.useRef)([]);(0,F.useEffect)(()=>{D.current=m()},[]);let O=(0,F.useCallback)(e=>{if(t.type!==`array`||!t.arrayFields)return;let n=y.getState().config;return S({value:e,fields:t.arrayFields,mappers:{slot:({value:e})=>e.map(e=>b(e,n,!0))},config:n})},[y,t]),ne=(0,F.useCallback)(()=>{let t=h(),n=t.items.map((t,n)=>e(o({},t),{_currentIndex:n})),i=y.getState().state;u({arrayState:e(o({},i.ui.arrayState),{[r]:e(o({},t),{items:n})})},!1)},[]),re=(0,F.useCallback)(e=>{u(x(ee(e)),!1),n(e)},[ee,u,x,n]);if((0,F.useEffect)(()=>{u(x(ee(m())),!1)},[g]),t.type!==`array`||!t.arrayFields)return null;let ie=t.max!==void 0&&v?.items.length>=t.max||c;return(0,I.jsx)(l,{label:a||i,icon:s||(0,I.jsx)(ae,{size:16}),el:`div`,readOnly:c,children:(0,I.jsx)(Kh,{onDragStart:e=>{D.current=m(),T(e),ne()},onDragEnd:()=>{T(``),n(D.current);let e=f.getState();f.setState(oh(e,i,D.current)),ne()},onMove:t=>{let n=h();if(n.items[t.source]._arrayId!==w)return;let i=Ze(D.current,t.source,t.target),a=Ze(n.items,t.source,t.target),s=y.getState().state;u({arrayState:e(o({},s.ui.arrayState),{[r]:e(o({},n),{items:a})})},!1),D.current=i},children:(0,I.jsxs)(`div`,{className:$h({hasItems:g>0,addDisabled:ie}),children:[v.items.length>0&&(0,I.jsx)(`div`,{className:$h(`inner`),"data-dnd-container":!0,children:v.items.map((a,s)=>{let{_arrayId:l=`${r}-${s}`,_originalIndex:d=s,_currentIndex:f=s}=a;return(0,I.jsx)(ng,{index:f,dragIndex:s,originalIndex:d,arrayId:r,id:l,readOnly:c,field:t,name:i,localName:p,onChange:(t,r,i)=>{let a=m();n(Ge(a,s,e(o({},Array.from(a||[])[s]||{}),{[i]:t})),r)},onToggleExpand:(e,t)=>{u(x(t?{openId:``}:{openId:e}))},actions:(0,I.jsxs)(I.Fragment,{children:[(0,I.jsx)(`div`,{className:eg(`action`),children:(0,I.jsx)(A,{type:`button`,disabled:!!ie,onClick:e=>{e.stopPropagation();let t=[...m()||[]],n=O(t[s]);t.splice(s,0,n),re(t)},title:`Duplicate`,children:(0,I.jsx)(We,{size:16})})}),(0,I.jsx)(`div`,{className:eg(`action`),children:(0,I.jsx)(A,{type:`button`,disabled:t.min!==void 0&&t.min>=v.items.length,onClick:e=>{e.stopPropagation();let t=[...m()||[]];t.splice(s,1),re(t)},title:`Delete`,children:(0,I.jsx)(qe,{size:16})})})]})},l)})}),!ie&&(0,I.jsx)(`button`,{type:`button`,className:$h(`addButton`),onClick:()=>{if(E)return;let e=m()||[],n=te(O(typeof t.defaultItemProps==`function`?t.defaultItemProps(e.length):t.defaultItemProps??{}),t.arrayFields);re([...e,n])},children:(0,I.jsx)(he,{size:21})})]})})})};c(),c(),c();var ig=e=>Sh(t=>Zh(t,e));c();var ag=e=>P(t=>t.state.ui.field.focus===e),og=(e,t)=>{let n=ig(e),r=ag(e),[i,a]=(0,F.useState)(n?.toString()),o=(0,F.useCallback)(e=>{a(e),t(e)},[t]);return(0,F.useEffect)(()=>{r||a(n)},[r,n]),[i??``,o]},sg=a(`Input`,fh),cg=({field:e,onChange:t,readOnly:n,id:r,name:i=r,label:a,labelIcon:o,Label:s})=>{let[c,l]=og(i,t);return(0,I.jsx)(s,{label:a||i,icon:o||(0,I.jsxs)(I.Fragment,{children:[e.type===`text`&&(0,I.jsx)(et,{size:16}),e.type===`number`&&(0,I.jsx)(we,{size:16})]}),readOnly:n,children:(0,I.jsx)(`input`,{className:sg(`input`),autoComplete:`off`,type:e.type,title:a||i,name:i,value:c,onChange:t=>{if(e.type===`number`){let n=Number(t.currentTarget.value);if(e.min!==void 0&&n<e.min||e.max!==void 0&&n>e.max)return;l(n)}else l(t.currentTarget.value)},readOnly:n,tabIndex:n?-1:void 0,id:r,min:e.type===`number`?e.min:void 0,max:e.type===`number`?e.max:void 0,placeholder:e.type===`text`||e.type===`number`?e.placeholder:void 0,step:e.type===`number`?e.step:void 0})})};c(),c(),c();var lg={"ExternalInput-actions":`_ExternalInput-actions_143vl_1`,"ExternalInput-button":`_ExternalInput-button_143vl_5`,"ExternalInput--dataSelected":`_ExternalInput--dataSelected_143vl_34`,"ExternalInput--readOnly":`_ExternalInput--readOnly_143vl_41`,"ExternalInput-detachButton":`_ExternalInput-detachButton_143vl_48`,ExternalInput:`_ExternalInput_143vl_1`,ExternalInputModal:`_ExternalInputModal_143vl_118`,"ExternalInputModal-grid":`_ExternalInputModal-grid_143vl_128`,"ExternalInputModal--filtersToggled":`_ExternalInputModal--filtersToggled_143vl_139`,"ExternalInputModal-filters":`_ExternalInputModal-filters_143vl_144`,"ExternalInputModal-masthead":`_ExternalInputModal-masthead_143vl_164`,"ExternalInputModal-tableWrapper":`_ExternalInputModal-tableWrapper_143vl_173`,"ExternalInputModal-table":`_ExternalInputModal-table_143vl_173`,"ExternalInputModal-thead":`_ExternalInputModal-thead_143vl_189`,"ExternalInputModal-th":`_ExternalInputModal-th_143vl_189`,"ExternalInputModal-td":`_ExternalInputModal-td_143vl_204`,"ExternalInputModal-tr":`_ExternalInputModal-tr_143vl_210`,"ExternalInputModal-tbody":`_ExternalInputModal-tbody_143vl_217`,"ExternalInputModal--hasData":`_ExternalInputModal--hasData_143vl_244`,"ExternalInputModal-loadingBanner":`_ExternalInputModal-loadingBanner_143vl_248`,"ExternalInputModal--isLoading":`_ExternalInputModal--isLoading_143vl_265`,"ExternalInputModal-searchForm":`_ExternalInputModal-searchForm_143vl_269`,"ExternalInputModal-search":`_ExternalInputModal-search_143vl_269`,"ExternalInputModal-searchIcon":`_ExternalInputModal-searchIcon_143vl_306`,"ExternalInputModal-searchIconText":`_ExternalInputModal-searchIconText_143vl_333`,"ExternalInputModal-searchInput":`_ExternalInputModal-searchInput_143vl_343`,"ExternalInputModal-searchActions":`_ExternalInputModal-searchActions_143vl_358`,"ExternalInputModal-searchActionIcon":`_ExternalInputModal-searchActionIcon_143vl_371`,"ExternalInputModal-footerContainer":`_ExternalInputModal-footerContainer_143vl_375`,"ExternalInputModal-footer":`_ExternalInputModal-footer_143vl_375`,"ExternalInputModal-field":`_ExternalInputModal-field_143vl_388`};c(),c();var ug=a(`Modal`,{Modal:`_Modal_g5xob_1`,"Modal--isOpen":`_Modal--isOpen_g5xob_15`,"Modal-inner":`_Modal-inner_g5xob_19`}),dg=({children:e,onClose:t,isOpen:n})=>{let[r,i]=(0,F.useState)(null);return(0,F.useEffect)(()=>{i(document.getElementById(`puck-portal-root`))},[]),r?(0,of.createPortal)((0,I.jsx)(`div`,{className:ug({isOpen:n}),onClick:t,children:(0,I.jsx)(`div`,{className:ug(`inner`),onClick:e=>e.stopPropagation(),children:e})}),r):(0,I.jsx)(`div`,{})};c(),c();var fg=a(`Heading`,{Heading:`_Heading_97eh4_1`,"Heading--xxxxl":`_Heading--xxxxl_97eh4_12`,"Heading--xxxl":`_Heading--xxxl_97eh4_18`,"Heading--xxl":`_Heading--xxl_97eh4_22`,"Heading--xl":`_Heading--xl_97eh4_26`,"Heading--l":`_Heading--l_97eh4_30`,"Heading--m":`_Heading--m_97eh4_34`,"Heading--s":`_Heading--s_97eh4_38`,"Heading--xs":`_Heading--xs_97eh4_42`}),pg=({children:e,rank:t,size:n=`m`})=>(0,I.jsx)(t?`h${t}`:`span`,{className:fg({[n]:!0}),children:e});c();var mg=a(`ExternalInput`,lg),hg=a(`ExternalInputModal`,lg),gg={},_g=({field:t,onChange:n,value:r=null,name:i,id:a,readOnly:c})=>{let{mapProp:l=e=>e,mapRow:u=e=>e,filterFields:d}=t||{},{enabled:f}=t.cache??{enabled:!0},[p,m]=(0,F.useState)([]),[h,g]=(0,F.useState)(!1),[_,v]=(0,F.useState)(!0),b=!!d,[x,S]=(0,F.useState)(t.initialFilters||{}),[C,ee]=(0,F.useState)(b),w=(0,F.useMemo)(()=>p.map(u),[p]),te=(0,F.useMemo)(()=>{let e=new Set;for(let t of w)for(let n of Object.keys(t))(typeof t[n]==`string`||typeof t[n]==`number`||(0,F.isValidElement)(t[n]))&&e.add(n);return Array.from(e)},[w]),[E,D]=(0,F.useState)(t.initialQuery||``),ne=(0,F.useCallback)((e,n)=>s(null,null,function*(){v(!0);let r=`${a}-${e}-${JSON.stringify(n)}`,i;i=f&&gg[r]?gg[r]:yield t.fetchList({query:e,filters:n}),i&&(m(i),v(!1),f&&(gg[r]=i))}),[a,t]),ie=(0,F.useCallback)(e=>t.renderFooter?t.renderFooter(e):(0,I.jsxs)(`span`,{className:hg(`footer`),children:[e.items.length,` result`,e.items.length===1?``:`s`]}),[t.renderFooter]);return(0,F.useEffect)(()=>{ne(E,x)},[]),(0,I.jsxs)(`div`,{className:mg({dataSelected:!!r,modalVisible:h,readOnly:c}),id:a,children:[(0,I.jsxs)(`div`,{className:mg(`actions`),children:[(0,I.jsx)(`button`,{type:`button`,onClick:()=>g(!0),className:mg(`button`),disabled:c,children:r?t.getItemSummary?t.getItemSummary(r):`External item`:(0,I.jsxs)(I.Fragment,{children:[(0,I.jsx)(re,{size:`16`}),(0,I.jsx)(`span`,{children:t.placeholder})]})}),r&&(0,I.jsx)(`button`,{type:`button`,className:mg(`detachButton`),onClick:()=>{n(null)},disabled:c,children:(0,I.jsx)(O,{size:16})})]}),(0,I.jsx)(dg,{onClose:()=>g(!1),isOpen:h,children:(0,I.jsxs)(`form`,{className:hg({isLoading:_,loaded:!_,hasData:w.length>0,filtersToggled:C}),onSubmit:e=>{e.preventDefault(),e.stopPropagation(),ne(E,x)},children:[(0,I.jsx)(`div`,{className:hg(`masthead`),children:t.showSearch?(0,I.jsxs)(`div`,{className:hg(`searchForm`),children:[(0,I.jsxs)(`label`,{className:hg(`search`),children:[(0,I.jsx)(`span`,{className:hg(`searchIconText`),children:`Search`}),(0,I.jsx)(`div`,{className:hg(`searchIcon`),children:(0,I.jsx)(T,{size:`18`})}),(0,I.jsx)(`input`,{className:hg(`searchInput`),name:`q`,type:`search`,placeholder:t.placeholder,onChange:e=>{D(e.currentTarget.value)},autoComplete:`off`,value:E})]}),(0,I.jsxs)(`div`,{className:hg(`searchActions`),children:[(0,I.jsx)(dh,{type:`submit`,loading:_,fullWidth:!0,children:`Search`}),b&&(0,I.jsx)(`div`,{className:hg(`searchActionIcon`),children:(0,I.jsx)(A,{type:`button`,title:`Toggle filters`,onClick:e=>{e.preventDefault(),e.stopPropagation(),ee(!C)},children:(0,I.jsx)(_e,{size:20})})})]})]}):(0,I.jsx)(pg,{rank:`2`,size:`xs`,children:t.placeholder||`Select data`})}),(0,I.jsxs)(`div`,{className:hg(`grid`),children:[b&&(0,I.jsx)(`div`,{className:hg(`filters`),children:b&&Object.keys(d).map(t=>{let n=d[t];return(0,I.jsx)(`div`,{className:hg(`field`),children:(0,I.jsx)(mh,{label:n.label||t,children:(0,I.jsx)(Lg,{field:n,id:`external_field_${t}_filter`,value:x[t],onChange:n=>{S(r=>{let i=e(o({},r),{[t]:n});return ne(E,i),i})}})})},t)})}),(0,I.jsxs)(`div`,{className:hg(`tableWrapper`),children:[(0,I.jsxs)(`table`,{className:hg(`table`),children:[(0,I.jsx)(`thead`,{className:hg(`thead`),children:(0,I.jsx)(`tr`,{className:hg(`tr`),children:te.map(e=>(0,I.jsx)(`th`,{className:hg(`th`),style:{textAlign:`left`},children:e},e))})}),(0,I.jsx)(`tbody`,{className:hg(`tbody`),children:w.map((e,t)=>(0,I.jsx)(`tr`,{style:{whiteSpace:`nowrap`},className:hg(`tr`),onClick:()=>{n(l(p[t])),g(!1)},children:te.map(t=>(0,I.jsx)(`td`,{className:hg(`td`),children:e[t]},t))},t))})]}),(0,I.jsx)(`div`,{className:hg(`loadingBanner`),children:(0,I.jsx)(y,{size:24})})]})]}),(0,I.jsx)(`div`,{className:hg(`footerContainer`),children:(0,I.jsx)(ie,{items:w})})]})})]})},vg=({field:t,onChange:n,id:r,name:i=r,label:a,labelIcon:c,Label:l,readOnly:u})=>{let d=ig(i),f=t,p=t;return(0,F.useEffect)(()=>{p.adaptor&&console.error("Warning: The `adaptor` API is deprecated. Please use updated APIs on the `external` field instead. This will be a breaking change in a future release.")},[]),t.type===`external`?(0,I.jsx)(l,{label:a||i,icon:c||(0,I.jsx)(re,{size:16}),el:`div`,children:(0,I.jsx)(_g,{name:i,field:e(o({},f),{placeholder:p.adaptor?.name?`Select from ${p.adaptor.name}`:f.placeholder||`Select data`,mapProp:p.adaptor?.mapProp||f.mapProp,mapRow:f.mapRow,fetchList:p.adaptor?.fetchList?()=>s(null,null,function*(){return yield p.adaptor.fetchList(p.adaptorParams)}):f.fetchList}),onChange:n,value:d,id:r,readOnly:u})}):null};c();var yg=a(`Input`,fh),bg=({field:e,onChange:t,readOnly:n,id:r,name:i=r,label:a,labelIcon:o,Label:s})=>{let c=ig(i);return e.type!==`radio`||!e.options?null:(0,I.jsx)(s,{icon:o||(0,I.jsx)(Oe,{size:16}),label:a||i,readOnly:n,el:`div`,children:(0,I.jsx)(`div`,{className:yg(`radioGroupItems`),id:r,children:e.options.map(e=>(0,I.jsxs)(`label`,{className:yg(`radio`),children:[(0,I.jsx)(`input`,{type:`radio`,className:yg(`radioInput`),value:JSON.stringify({value:e.value}),name:i,onChange:e=>{t(JSON.parse(e.target.value).value)},disabled:n,checked:c===e.value}),(0,I.jsx)(`div`,{className:yg(`radioInner`),children:e.label||e.value?.toString()})]},e.label+e.value))})})};c();var xg=a(`Input`,fh),Sg=({field:e,onChange:t,label:n,labelIcon:r,Label:i,id:a,name:o=a,readOnly:s})=>{let c=ig(o);return e.type!==`select`||!e.options?null:(0,I.jsx)(i,{label:n||o,icon:r||(0,I.jsx)(Ee,{size:16}),readOnly:s,children:(0,I.jsxs)(`div`,{className:xg(`select`),children:[(0,I.jsx)(`select`,{id:a,title:n||o,className:xg(`input`),disabled:s,onChange:e=>{t(JSON.parse(e.target.value).value)},value:JSON.stringify({value:c}),children:e.options.map(e=>(0,I.jsx)(`option`,{label:e.label,value:JSON.stringify({value:e.value})},e.label+JSON.stringify(e.value)))}),(0,I.jsx)(Ee,{size:18,className:xg(`selectIcon`)})]})})};c();var Cg=a(`Input`,fh),wg=({field:e,onChange:t,readOnly:n,id:r,name:i=r,label:a,labelIcon:o,Label:s})=>{let[c,l]=og(i,t);return(0,I.jsx)(s,{label:a||i,icon:o||(0,I.jsx)(et,{size:16}),readOnly:n,children:(0,I.jsx)(`textarea`,{id:r,className:Cg(`input`),autoComplete:`off`,name:i,value:c===void 0?``:c,onChange:e=>l(e.currentTarget.value),readOnly:n,tabIndex:n?-1:void 0,rows:5,placeholder:e.type===`textarea`?e.placeholder:void 0})})};c(),c();var Tg=(0,F.memo)(t=>(0,I.jsx)(cn,e(o({},t),{editor:null,menu:(0,I.jsx)(on,{field:t.field,editor:null,editorState:null,readOnly:t.readOnly??!1}),children:(0,I.jsx)(`div`,{className:`rich-text`,dangerouslySetInnerHTML:{__html:t.content},contentEditable:!0})})));Tg.displayName=`EditorFallback`;var Eg=(0,F.lazy)(()=>Ot(()=>import(`./assets/Editor-FJJNKTC3-Mp0zsKT5.js`).then(e=>({default:e.Editor})),__vite__mapDeps([13,1,2,12,5,7,3,9,4]))),Dg=({onChange:e,readOnly:t=!1,id:n,name:r=n,label:i,labelIcon:a,Label:s,field:c})=>{let l={onChange:e,content:ig(r),readOnly:t,field:c,id:n,name:r};return(0,I.jsx)(I.Fragment,{children:(0,I.jsx)(s,{label:i||r,icon:a||(0,I.jsx)(et,{size:16}),readOnly:t,el:`div`,children:(0,I.jsx)(F.Suspense,{fallback:(0,I.jsx)(Tg,o({},l)),children:(0,I.jsx)(Eg,o({},l))})})})};c(),c();var Og=a(`ObjectField`,{ObjectField:`_ObjectField_c5reb_1`,"ObjectField-fieldset":`_ObjectField-fieldset_c5reb_10`}),kg=({field:t,onChange:n,id:r,name:i=r,label:a,labelIcon:s,Label:c,readOnly:l})=>{let{localName:u=i}=Yh(),d=xh(),f=P(e=>e.permissions.getPermissions({item:e.selectedItem}).edit),p=()=>Zh(d.getState(),i)??{};return t.type!==`object`||!t.objectFields?null:(0,I.jsx)(c,{label:a||i,icon:s||(0,I.jsx)(Ne,{size:16}),el:`div`,readOnly:l,children:(0,I.jsx)(`div`,{className:Og(),children:(0,I.jsx)(`fieldset`,{className:Og(`fieldset`),children:Object.keys(t.objectFields).map(a=>{let s=t.objectFields[a],c=`${u}.${a}`;return(0,I.jsx)(Qh,{id:`${r}_${a}`,name:i,subName:a,localName:u,field:s,forceReadOnly:!f,onChange:(t,r,i)=>{let a=p();a[i]!==t&&n(e(o({},a),{[i]:t}),r)}},c)})})})})};c();var Ag=()=>{if(F.useId!==void 0)return F.useId();let[e]=(0,F.useState)(p());return e},jg=a(`Input`,fh),Mg=a(`InputWrapper`,fh),Ng={array:rg,external:vg,object:kg,select:Sg,textarea:wg,radio:bg,text:cg,number:cg,richtext:Dg};function Pg(t){let n=P(e=>e.dispatch),r=P(e=>e.overrides),i=P(On(e=>e.selectedItem?.readOnly)),a=(0,F.useContext)(Jh),{id:s,Label:c=hh}=t,l=t.field,u=l.label,d=l.labelIcon,f=Ag(),p=s||f,m=(0,F.useMemo)(()=>e(o({},r.fieldTypes),{custom:r.fieldTypes?.custom,array:r.fieldTypes?.array||Ng.array,external:r.fieldTypes?.external||Ng.external,object:r.fieldTypes?.object||Ng.object,select:r.fieldTypes?.select||Ng.select,textarea:r.fieldTypes?.textarea||Ng.textarea,radio:r.fieldTypes?.radio||Ng.radio,text:r.fieldTypes?.text||Ng.text,number:r.fieldTypes?.number||Ng.number,richtext:r.fieldTypes?.richtext||Ng.richtext}),[r]),h=Sh(e=>{if(l.type===`custom`||r.fieldTypes?.[l.type])return Zh(e,t.name??p)}),g=(0,F.useMemo)(()=>e(o({},t),{field:l,label:u,labelIcon:d,Label:c,id:p,value:h}),[t,l,u,d,c,p,h]),_=(0,F.useCallback)(e=>{g.name&&(e.target.nodeName===`INPUT`||e.target.nodeName===`TEXTAREA`)&&(e.stopPropagation(),n({type:`setUi`,ui:{field:{focus:g.name}}}))},[g.name]),v=(0,F.useCallback)(e=>{`name`in e.target&&n({type:`setUi`,ui:{field:{focus:null}}})},[]),y=(0,F.useMemo)(()=>l.type!==`custom`&&l.type!==`slot`?Ng[l.type]:e=>null,[l.type]),b=l.type===`custom`?l.key:void 0,x=(0,F.useMemo)(()=>{if(l.type===`custom`&&!m[l.type])return l.render?l.render:null;if(l.type!==`slot`)return m[l.type]},[l.type,b,m]),{visible:S=!0}=t.field;if(!S||l.type===`slot`)return null;if(!x)throw Error(`Field type for ${l.type} did not exist.`);return(0,I.jsx)(Jh.Provider,{value:{readOnlyFields:a.readOnlyFields||i||{},localName:a.localName??g.name},children:(0,I.jsx)(`div`,{className:Mg(),onFocus:_,onBlur:v,onClick:e=>{e.stopPropagation()},children:(0,I.jsx)(x,e(o({},g),{children:(0,I.jsx)(y,o({},g))}))})})}function Fg(e){return(0,I.jsx)(Pg,o({},e))}function Ig(t){var n=t,{value:i}=n,a=r(n,[`value`]);let s=(0,F.useMemo)(()=>t=>(0,I.jsx)(`div`,e(o({},t),{className:jg({readOnly:a.readOnly})})),[a.readOnly]),c=xh(),l=(0,F.useCallback)(e=>{a.id&&(c.setState({[a.id]:e}),a.onChange(e))},[c,a.onChange,a.id]);return(0,F.useEffect)(()=>{a.id&&c.setState({[a.id]:i})},[a.id,i,c]),(0,I.jsx)(Pg,e(o({},a),{onChange:l,Label:s}))}function Lg(t){let n=Ag();return t.field.type===`slot`?null:(0,I.jsx)(bh.Provider,{value:{[n]:t.value},children:(0,I.jsx)(Ig,e(o({},t),{id:n}))})}c(),c(),c(),c();var Rg={DraggableComponent:`_DraggableComponent_1627v_1`,"DraggableComponent-overlayWrapper":`_DraggableComponent-overlayWrapper_1627v_6`,"DraggableComponent-overlay":`_DraggableComponent-overlay_1627v_6`,"DraggableComponent-loadingOverlay":`_DraggableComponent-loadingOverlay_1627v_38`,"DraggableComponent--hover":`_DraggableComponent--hover_1627v_54`,"DraggableComponent--isSelected":`_DraggableComponent--isSelected_1627v_72`,"DraggableComponent-actionsOverlay":`_DraggableComponent-actionsOverlay_1627v_89`,"DraggableComponent-actions":`_DraggableComponent-actions_1627v_89`,"DraggableComponent-actionsAction":`_DraggableComponent-actionsAction_1627v_111`};c();function zg(e){let t={x:0,y:0},n=e;for(;n&&n!==document.documentElement;){let e=n.parentElement;e&&(t.x+=e.scrollLeft,t.y+=e.scrollTop),n=e}return t}c();var Bg=(0,F.createContext)(null),Vg=(0,F.createContext)(v(()=>({zoneDepthIndex:{},nextZoneDepthIndex:{},areaDepthIndex:{},nextAreaDepthIndex:{},draggedItem:null,previewIndex:{},enabledIndex:{},hoveringComponent:null,registerRootVirtualizer:()=>{},unregisterRootVirtualizer:()=>{},scrollToComponent:()=>!1}))),Hg=({children:e,store:t})=>(0,I.jsx)(Vg.Provider,{value:t,children:e}),Ug=({children:e,value:t})=>{let n=P(e=>e.dispatch),r=(0,F.useCallback)(e=>{n({type:`registerZone`,zone:e})},[n]),i=(0,F.useMemo)(()=>o({registerZone:r},t),[t]);return(0,I.jsx)(I.Fragment,{children:i&&(0,I.jsx)(Bg.Provider,{value:i,children:e})})};c();var Wg=(e,t=[])=>{let n=Pe();return(0,F.useCallback)(()=>{let t=()=>{},r=n=>{n?e(!1):(setTimeout(()=>{e(!0)},0),t&&t())},i=n.getState().state.ui.isDragging;return r(i),i&&(t=n.subscribe(e=>e.state.ui.isDragging,e=>{r(e)})),t},[n,...t])};c();function Gg(e,t){typeof e==`function`?e(t):e&&typeof e==`object`&&`current`in e&&(e.current=t)}function Kg(e,t){e.forEach(e=>{Gg(e,t)})}var qg=a(`DraggableComponent`,Rg),Jg=!1,Yg=100,Xg=8,Zg=Xg*6.5,Qg=-(Zg-8),$g=Xg,e_=({label:e,children:t,parentAction:n})=>(0,I.jsxs)(Ke,{children:[(0,I.jsxs)(Ke.Group,{children:[n,e&&(0,I.jsx)(Ke.Label,{label:e})]}),(0,I.jsx)(Ke.Group,{children:t})]}),t_=({children:e})=>(0,I.jsx)(I.Fragment,{children:e}),n_=({children:t,depth:n,componentType:r,id:i,index:a,zoneCompound:s,isLoading:c=!1,isSelected:l=!1,debug:u,label:d,autoDragAxis:f,userDragAxis:p,inDroppableZone:m=!0,itemRef:h})=>{let g=P(e=>e.selectedItem?.props.id===i?e.zoomConfig.zoom:1),_=P(e=>e._experimentalFullScreenCanvas),v=P(e=>e.overrides),b=P(e=>e.dispatch),x=P(e=>e.iframe),S=(0,F.useRef)(0),C=(0,F.useContext)(Bg),[ee,w]=(0,F.useState)({}),te=(0,F.useCallback)((t,n)=>{var r;(r=C?.registerLocalZone)==null||r.call(C,t,n),w(r=>e(o({},r),{[t]:n}))},[w]),T=(0,F.useCallback)(e=>{var t;(t=C?.unregisterLocalZone)==null||t.call(C,e),w(t=>{let n=o({},t);return delete n[e],n})},[w]),E=Object.values(ee).filter(Boolean).length>0,D=P(On(e=>e.state.indexes.nodes[i]?.path)),O=P(On(e=>{let t=ze({index:a,zone:s},e.state);return e.permissions.getPermissions({item:t})})),ne=(0,F.useContext)(Vg),[re,ie]=(0,F.useState)(p||f),ae=(0,F.useMemo)(()=>Gh(re),[re]),{ref:k,isDragging:A,sortable:oe}=Tm({id:i,index:a,group:s,type:`component`,data:{areaId:C?.areaId,zone:s,index:a,componentType:r,containsActiveZone:E,depth:n,path:D||[],inDroppableZone:m},collisionPriority:n,collisionDetector:ae,transition:{duration:200,easing:`cubic-bezier(0.2, 0, 0, 1)`},plugins:e=>[...e,Hu.configure({feedback:`clone`})]});(0,F.useEffect)(()=>{let e=ne.getState().enabledIndex[s];oe.droppable.disabled=!e,oe.draggable.disabled=!O.drag;let t=ne.subscribe(e=>{oe.droppable.disabled=!e.enabledIndex[s]});return j.current&&!O.drag?(j.current.setAttribute(`data-puck-disabled`,``),()=>{var e;(e=j.current)==null||e.removeAttribute(`data-puck-disabled`),t()}):t},[O.drag,s]);let[,se]=(0,F.useState)(0),j=(0,F.useRef)(null),M=(0,F.useCallback)(e=>{k(e),j.current!==e&&(j.current=e,se(e=>e+1),h&&Kg([h],e))},[h,k]),[ce,N]=(0,F.useState)();(0,F.useEffect)(()=>{N(x.enabled?j.current?.ownerDocument.body:j.current?.closest(`[data-puck-preview]`)??document.body)},[x.enabled]);let le=(0,F.useCallback)(()=>{if(!j.current)return;let e=j.current,t=e.getBoundingClientRect(),n=x.enabled?null:e.closest(`[data-puck-preview]`),r=(()=>{let t=e;for(;t&&t!==document.documentElement;){if(getComputedStyle(t).position===`fixed`)return!0;t=t.parentElement}return!1})(),i=n?.getBoundingClientRect(),a=n?zg(n):{x:0,y:0},o=r?{x:0,y:0}:zg(e),s=r?{x:0,y:0}:{x:o.x-a.x-(i?.left??0),y:o.y-a.y-(i?.top??0)};return{left:`${t.left+s.x}px`,top:`${t.top+s.y}px`,height:`${t.height}px`,width:`${t.width}px`,position:r?`fixed`:void 0}},[x.enabled]),[ue,de]=(0,F.useState)(),fe=(0,F.useRef)(null),pe=(0,F.useRef)(null),me=(0,F.useCallback)(()=>{de(le()),h&&Kg([h],j.current)},[le,h]),he=(0,F.useCallback)(()=>{pe.current??=requestAnimationFrame(()=>{pe.current=null,me()})},[me]);(0,F.useEffect)(()=>()=>{pe.current!=null&&(cancelAnimationFrame(pe.current),pe.current=null)},[]),(0,F.useEffect)(()=>{if(j.current){let e=new ResizeObserver(()=>{he()});return e.observe(j.current),()=>{e.disconnect()}}},[he,h]);let ge=P(e=>e.nodes.registerNode),_e=P(e=>e.nodes.unregisterNode),ve=(0,F.useCallback)(()=>{Me(!1)},[]),ye=(0,F.useCallback)(()=>{Me(!0)},[]),be=(0,F.useRef)({sync:()=>null,hideOverlay:()=>null,showOverlay:()=>null});(0,F.useLayoutEffect)(()=>{be.current.sync=me,be.current.hideOverlay=ve,be.current.showOverlay=ye},[ve,ye,me]),(0,F.useEffect)(()=>(ge(i,be.current),()=>{_e(i)}),[i,ge,_e]);let xe=(0,F.useMemo)(()=>v.actionBar||e_,[v.actionBar]),Se=(0,F.useMemo)(()=>v.componentOverlay||t_,[v.componentOverlay]),Ce=(0,F.useCallback)(e=>{ne.getState().draggedItem||(e.target.closest(`[data-puck-overlay-portal]`)||e.stopPropagation(),b(_?{type:`setUi`,ui:{itemSelector:l?null:{index:a,zone:s}}}:{type:`setUi`,ui:{itemSelector:{index:a,zone:s}}}))},[a,s,i,l,_]),we=Pe(),Te=(0,F.useCallback)(()=>{let{nodes:e,zones:t}=we.getState().state.indexes,n=e[i],r=n?.parentId?e[n?.parentId]:null;if(!r||!n.parentId)return;let a=`${r.parentId}:${r.zone}`;b({type:`setUi`,ui:{itemSelector:{zone:a,index:t[a].contentIds.indexOf(n.parentId)}}})},[C,D]),Ee=(0,F.useCallback)(()=>{b({type:`duplicate`,sourceIndex:a,sourceZone:s})},[a,s]),De=(0,F.useCallback)(()=>{b({type:`remove`,index:a,zone:s})},[a,s]),[Oe,ke]=(0,F.useState)(!1),Ae=_h(Vg,e=>e.hoveringComponent===i);(0,F.useEffect)(()=>{if(!j.current)return;let e=j.current,t=e=>{ne.getState().draggedItem?ke(!!A):ke(!0),e.stopPropagation()},n=e=>{e.stopPropagation(),ke(!1)};return e.setAttribute(`data-puck-component`,i),e.setAttribute(`data-puck-dnd`,i),e.style.position=`relative`,e.addEventListener(`click`,Ce),e.addEventListener(`mouseover`,t),e.addEventListener(`mouseout`,n),()=>{e.removeAttribute(`data-puck-component`),e.removeAttribute(`data-puck-dnd`),e.removeEventListener(`click`,Ce),e.removeEventListener(`mouseover`,t),e.removeEventListener(`mouseout`,n)}},[j.current,Ce,E,s,i,A,m]);let[je,Me]=(0,F.useState)(!1),[Ne,Ie]=(0,F.useState)(!0),[Le,Re]=(0,F.useTransition)();(0,F.useEffect)(()=>{Re(()=>{Oe||Ae||l?(he(),Me(!0),Ve(!1)):Me(!1)})},[Oe,Ae,l,x]);let[Be,Ve]=(0,F.useState)(!1),He=Wg(e=>{e?Re(()=>{me(),Ie(!0)}):Ie(!1)});(0,F.useEffect)(()=>{A&&Ve(!0)},[A]),(0,F.useEffect)(()=>{if(Be)return He()},[Be,He]),(0,F.useEffect)(()=>{if(!Ne||!(l||A))return;let e=j.current;if(!e)return;let t=e.ownerDocument,n=t.defaultView;if(!n)return;S.current=0,he();let r=()=>he(),i=()=>he();t.addEventListener(`scroll`,r,!0),n.addEventListener(`resize`,i);let a=0,o=e=>{if(e-S.current>=Yg){S.current=e;let t=j.current;if(t){let e=t.getBoundingClientRect(),n=fe.current;(!n||Math.abs(e.x-n.x)>.5||Math.abs(e.y-n.y)>.5||Math.abs(e.width-n.width)>.5||Math.abs(e.height-n.height)>.5)&&(fe.current=e,he())}}a=requestAnimationFrame(o)};return a=requestAnimationFrame(o),()=>{t.removeEventListener(`scroll`,r,!0),n.removeEventListener(`resize`,i),cancelAnimationFrame(a)}},[Ne,l,A,he]);let Ue=(0,F.useCallback)(e=>{if(e&&e.ownerDocument.defaultView){let t=e.getBoundingClientRect(),n=t.x<0,r=t.y<0;n&&(e.style.transformOrigin=`left top`,e.style.left=`0px`),r&&(e.style.top=`12px`,n||(e.style.transformOrigin=`right top`))}},[g]),Ge=(0,F.useRef)(null);(0,F.useEffect)(()=>{Ue(Ge.current)},[Ge.current,Ue]),(0,F.useEffect)(()=>{if(p){ie(p);return}if(j.current){let e=window.getComputedStyle(j.current);if(e.display===`inline`||e.display===`inline-block`){ie(`x`);return}}ie(f)},[j,p,f]);let Je=(0,F.useMemo)(()=>C?.areaId&&C?.areaId!==`root`&&(0,I.jsx)(Ke.Action,{onClick:Te,label:`Select parent`,children:(0,I.jsx)(Fe,{size:16})}),[C?.areaId]),Ye=(0,F.useMemo)(()=>e(o({},C),{areaId:i,zoneCompound:s,index:a,depth:n+1,registerLocalZone:te,unregisterLocalZone:T}),[C,i,s,a,n,te,T]),Xe=P(e=>e.currentRichText?.inlineComponentId===i?e.currentRichText:null),Ze=O.duplicate||O.delete;return(0,I.jsxs)(Ug,{value:Ye,children:[Ne&&je&&(0,of.createPortal)((0,I.jsxs)(`div`,{className:qg({isSelected:l,isDragging:A,hover:Oe||Ae}),style:o({},ue),"data-puck-overlay":!0,children:[u,c&&(0,I.jsx)(`div`,{className:qg(`loadingOverlay`),children:(0,I.jsx)(y,{})}),(0,I.jsx)(`div`,{className:qg(`actionsOverlay`),style:{top:Zg/g},children:(0,I.jsx)(`div`,{className:qg(`actions`),style:{transform:`scale(${1/g}`,top:Qg/g,right:0,paddingLeft:$g,paddingRight:$g},ref:Ge,children:(0,I.jsxs)(xe,{parentAction:Je,label:Jg?i:d,children:[Xe&&(0,I.jsxs)(I.Fragment,{children:[(0,I.jsx)(un,{editor:Xe.editor,field:Xe.field,inline:!0,readOnly:!1}),Ze&&(0,I.jsx)(Ke.Separator,{})]}),O.duplicate&&(0,I.jsx)(Ke.Action,{onClick:Ee,label:`Duplicate`,children:(0,I.jsx)(We,{className:qg(`actionsAction`)})}),O.delete&&(0,I.jsx)(Ke.Action,{onClick:De,label:`Delete`,children:(0,I.jsx)(qe,{className:qg(`actionsAction`)})})]})})}),(0,I.jsx)(`div`,{className:qg(`overlayWrapper`),children:(0,I.jsx)(Se,{componentId:i,componentType:r,hover:Oe,isSelected:l,children:(0,I.jsx)(`div`,{className:qg(`overlay`)})})})]}),ce||document.body),t(M)]})};c();var r_={DropZone:`_DropZone_ybznu_1`,"DropZone--hasChildren":`_DropZone--hasChildren_ybznu_11`,"DropZone--isAreaSelected":`_DropZone--isAreaSelected_ybznu_24`,"DropZone--hoveringOverArea":`_DropZone--hoveringOverArea_ybznu_25`,"DropZone--isRootZone":`_DropZone--isRootZone_ybznu_25`,"DropZone-item":`_DropZone-item_ybznu_39`,"DropZone-hitbox":`_DropZone-hitbox_ybznu_43`,"DropZone--isEnabled":`_DropZone--isEnabled_ybznu_51`,"DropZone--isAnimating":`_DropZone--isAnimating_ybznu_62`};c(),c();var i_={Drawer:`_Drawer_1n90m_1`,"Drawer-draggable":`_Drawer-draggable_1n90m_8`,"Drawer-draggableBg":`_Drawer-draggableBg_1n90m_12`,"DrawerItem-draggable":`_DrawerItem-draggable_1n90m_22`,"DrawerItem--disabled":`_DrawerItem--disabled_1n90m_38`,DrawerItem:`_DrawerItem_1n90m_22`,"Drawer--isDraggingFrom":`_Drawer--isDraggingFrom_1n90m_48`,"DrawerItem-name":`_DrawerItem-name_1n90m_72`};c(),c(),c();function a_(e,t){let n=setTimeout(e,t);return()=>clearTimeout(n)}function o_(e,t){let n=()=>performance.now(),r,i=0;return function(...a){let o=n(),s=this;o-i>=t?(e.apply(s,a),i=o):(r?.(),r=a_(()=>{e.apply(s,a),i=n()},t-(o-i)))}}c();var s_=()=>{if(typeof window>`u`)return;let e=document.querySelector(`#preview-frame`);return e?.tagName===`IFRAME`?e.contentDocument||document:e?.ownerDocument||document};c();var c_=class{constructor(e,t){this.scaleFactor=1,this.frameEl=null,this.frameRect=null,this.target=e,this.original=t,this.frameEl=document.querySelector(`iframe#preview-frame`),this.frameEl&&(this.frameRect=this.frameEl.getBoundingClientRect(),this.scaleFactor=this.frameRect.width/(this.frameEl.contentWindow?.innerWidth||1))}get x(){return this.original.x}get y(){return this.original.y}get global(){return document!==this.target.ownerDocument&&this.frameRect?{x:this.x*this.scaleFactor+this.frameRect.left,y:this.y*this.scaleFactor+this.frameRect.top}:this.original}get frame(){return document===this.target.ownerDocument&&this.frameRect?{x:(this.x-this.frameRect.left)/this.scaleFactor,y:(this.y-this.frameRect.top)/this.scaleFactor}:this.original}};c();var l_=typeof PointerEvent<`u`?PointerEvent:Event,u_=class extends l_{constructor(e,t){super(e,t),this._originalTarget=null,this.originalTarget=t.originalTarget}set originalTarget(e){this._originalTarget=e}get originalTarget(){return this._originalTarget}},d_=e=>e.sort((e,t)=>{let n=e.data,r=t.data;return n.depth>r.depth?1:r.depth>n.depth?-1:0}),f_=e=>{let t=e?.id;if(!e)return null;if(e.type===`component`){let n=e.data;t=n.containsActiveZone?null:n.zone}else if(e.type===`void`)return`void`;return t},p_=6,m_=(e,t)=>{let n=[],r=e.target.ownerDocument.elementsFromPoint(e.x,e.y),i=r.find(e=>e.getAttribute(`data-puck-preview`)),a=r.find(e=>e.getAttribute(`data-puck-drawer`));if(a&&(r=[a]),i){let t=s_();t&&(r=t.elementsFromPoint(e.frame.x,e.frame.y))}if(r)for(let i=0;i<r.length;i++){let a=r[i],o=a.getAttribute(`data-puck-dropzone`),s=a.getAttribute(`data-puck-dnd`),c=a.hasAttribute(`data-puck-dnd-void`);if(p_&&(o||s)&&!c){let t=a.getBoundingClientRect(),n={left:t.left+p_,right:t.right-p_,top:t.top+p_,bottom:t.bottom-p_};if(e.frame.x<n.left||e.frame.x>n.right||e.frame.y>n.bottom||e.frame.y<n.top)continue}if(o){let e=t.registry.droppables.get(o);e&&n.push(e)}if(s){let e=t.registry.droppables.get(s);e&&n.push(e)}}return n},h_=(e,t)=>{let n=m_(e,t);if(n.length>0){let e=d_(n),r=t.dragOperation.source,i=e.findIndex(e=>e.id===r?.id),a=r?.id,o=[...e];a&&i>-1&&o.splice(i,1),o=o.filter(e=>{let t=e.data;if(a&&i>-1&&t.path.indexOf(a)>-1)return!1;if(e.type===`dropzone`){let t=e.data;if(!t.isDroppableTarget||t.areaId===a)return!1}else if(e.type===`component`&&!e.data.inDroppableZone)return!1;return!0}),o.reverse();let s=o[0];if(!s)return{zone:null,area:null};let c=s.data,l=`containsActiveZone`in c;return{zone:f_(s),area:l&&c.containsActiveZone?o[0].id:o[0]?.data.areaId}}return{zone:h,area:ht}},g_=({onChange:e},t)=>class extends ga{constructor(n,r){super(n),!(typeof window>`u`)&&this.registerEffect(()=>{let r=o_(r=>{let i=new c_(r instanceof u_&&r.originalTarget||r.target,{x:r.clientX,y:r.clientY});document.elementsFromPoint(i.global.x,i.global.y).some(e=>e.id===t)&&e(h_(i,n),n)},50),i=e=>{r(e)};return document.body.addEventListener(`pointermove`,i,{capture:!0}),()=>{document.body.removeEventListener(`pointermove`,i,{capture:!0})}})}};c(),c();var __=(e,t)=>{let n=e.indexes.nodes[t];if(!n)return;let r=`${n.parentId}:${n.zone}`;return{zone:r,index:e.indexes.zones[r].contentIds.indexOf(t)}},v_=(t,n,r,i)=>s(null,null,function*(){let{getState:a}=i,s=p(t),c={type:`insert`,componentType:t,destinationIndex:r,destinationZone:n,id:s},l=a().state,u=k(l,c,a()),d=a().dispatch;d(e(o({},c),{recordHistory:!0}));let f={index:r,zone:n};d({type:`setUi`,ui:{itemSelector:f}});let m=ze(f,u);if(!m)return;let h=a().resolveComponentData,g=yield h(m,`insert`);if(!g.didChange)return;let _=__(a().state,s);_&&d({type:`replace`,destinationZone:_.zone,destinationIndex:_.index,data:g.node})});c();var y_=(e,t,n,r)=>s(null,null,function*(){let i=r.getState().dispatch;i({type:`move`,sourceIndex:t.index,sourceZone:t.zone??h,destinationIndex:n.index,destinationZone:n.zone??h,recordHistory:!1});let a=r.getState().state.indexes.nodes[e]?.data;if(!a)return;let o=r.getState().resolveComponentData,s=yield o(a,`move`),c=__(r.getState().state,a.props.id);c&&s.didChange&&i({type:`replace`,data:s.node,destinationIndex:c.index,destinationZone:c.zone??h})});c();function b_(e){function t(e){return e?e.getAttribute(`dir`)||t(e.parentElement):`ltr`}return e?t(e):`ltr`}var x_=!1,S_=(0,F.createContext)({dragListeners:{}});function C_(t,n,r=[]){let{setDragListeners:i}=(0,F.useContext)(S_);(0,F.useEffect)(()=>{i&&i(r=>e(o({},r),{[t]:[...r[t]||[],n]}))},r)}var w_=100,T_=e=>{let t=(0,F.useRef)(null);return(0,F.useCallback)(n=>{Uh.setState({fallbackEnabled:!1});let r=p();t.current=r,setTimeout(()=>{t.current===r&&(Uh.setState({fallbackEnabled:!0}),n.collisionObserver.forceUpdate(!0))},e)},[])},E_=({children:e,disableAutoScroll:t})=>{let n=P(e=>e.dispatch),r=P(e=>e.instanceId),i=Pe(),a=(0,F.useRef)(null),o=T_(100),[s]=(0,F.useState)(()=>{let e=new Map;return v(()=>({zoneDepthIndex:{},nextZoneDepthIndex:{},areaDepthIndex:{},nextAreaDepthIndex:{},draggedItem:null,previewIndex:{},enabledIndex:{},hoveringComponent:null,registerRootVirtualizer:(t,n)=>{e.set(t,n)},unregisterRootVirtualizer:t=>{e.delete(t)},scrollToComponent:t=>{let n=Array.from(e.values());if(n.length>0)for(let e of n){let n=e.resolveIndex(t);n<0||e.virtualizer.scrollToIndex(n,{behavior:`auto`,align:`auto`})}else (s_()?.querySelector(`[data-puck-component="${t}"]`))?.scrollIntoView({behavior:`smooth`})}}))}),c=(0,F.useCallback)(e=>{let{zoneDepthIndex:t={},areaDepthIndex:n={}}=s.getState()||{},r=Object.keys(t).length>0,i=Object.keys(n).length>0,a=!1,o=!1;return(e.zone&&!t[e.zone]||!e.zone&&r)&&(a=!0),(e.area&&!n[e.area]||!e.area&&i)&&(o=!0),{zoneChanged:a,areaChanged:o}},[s]),l=(0,F.useCallback)((e,t)=>{let{zoneChanged:n,areaChanged:r}=c(e);!n&&!r||(s.setState({zoneDepthIndex:e.zone?{[e.zone]:!0}:{},areaDepthIndex:e.area?{[e.area]:!0}:{}}),o(t),setTimeout(()=>{t.collisionObserver.forceUpdate(!0)},50),a.current=null)},[s]),u=Dm(l,w_),d=()=>{u.cancel(),a.current=null};(0,F.useEffect)(()=>{x_&&s.subscribe(e=>console.log(e.previewIndex,Object.entries(e.zoneDepthIndex||{})[0]?.[0],Object.entries(e.areaDepthIndex||{})[0]?.[0]))},[]);let[f]=(0,F.useState)(()=>[...t?zd.plugins.filter(e=>e!==md):zd.plugins,g_({onChange:(e,t)=>{let n=s.getState(),{zoneChanged:r,areaChanged:i}=c(e),o=t.dragOperation.status.dragging;if(i||r){let t={},n={};e.zone&&(t={[e.zone]:!0}),e.area&&(n={[e.area]:!0}),s.setState({nextZoneDepthIndex:t,nextAreaDepthIndex:n})}if(e.zone!==`void`&&n?.zoneDepthIndex.void){l(e,t);return}if(i){if(o){let n=a.current;n&&n.area===e.area&&n.zone===e.zone||(d(),u(e,t),a.current=e)}else d(),l(e,t);return}r&&l(e,t),d()}},r)]),p=kh(),[m,h]=(0,F.useState)({}),g=(0,F.useRef)(null),_=(0,F.useRef)(void 0),y=(0,F.useMemo)(()=>({mode:`edit`,areaId:`root`,depth:0}),[]);return(0,I.jsx)(S_.Provider,{value:{dragListeners:m,setDragListeners:h},children:(0,I.jsx)(Of,{plugins:f,sensors:p,onDragEnd:(e,t)=>{(s_()?.querySelector(`[data-puck-entry]`))?.removeAttribute(`data-puck-dragging`);let{source:r,target:a}=e.operation;if(!r){s.setState({draggedItem:null});return}let{zone:o,index:c}=r.data,{previewIndex:l={}}=s.getState()||{},u=l[o]?.props.id===r.id?l[o]:null,d=()=>{var r,l;if(s.setState({draggedItem:null}),e.canceled||a?.type===`void`){s.setState({previewIndex:{}}),(r=m.dragend)==null||r.forEach(n=>{n(e,t)}),n({type:`setUi`,ui:{itemSelector:null,isDragging:!1}});return}u&&(s.setState({previewIndex:{}}),u.type===`insert`?v_(u.componentType,u.zone,u.index,i):_.current&&y_(u.props.id,_.current,u,i));let d=_.current?.zone!==u?.zone||_.current?.index!==u?.index;n({type:`setUi`,ui:{itemSelector:{index:c,zone:o},isDragging:!1},recordHistory:d}),(l=m.dragend)==null||l.forEach(n=>{n(e,t)})},f;f=$n(()=>{r.status===`idle`&&(d(),f?.())})},onDragOver:(e,t)=>{var n;if(e.preventDefault(),!s.getState()?.draggedItem)return;d();let{source:r,target:a}=e.operation;if(!a||!r||a.type===`void`)return;let[o]=r.id.split(`:`),[c]=a.id.split(`:`),l=r.data,u=l.zone,f=l.index,p=``,h=0;if(a.type===`component`){let e=a.data;p=e.zone,h=e.index;let n=t.collisionObserver.collisions[0]?.data,r=b_(a.element),i=n?.direction===`up`||r===`ltr`&&n?.direction===`left`||r===`rtl`&&n?.direction===`right`?`before`:`after`;h>=f&&u===p&&--h,i===`after`&&(h+=1)}else p=a.id.toString(),h=0;let v=i.getState().state.indexes.nodes[a.id]?.path||[];if(!(c===o||v.find(e=>{let[t]=e.split(`:`);return t===o}))){if(g.current===`new`)s.setState({previewIndex:{[p]:{componentType:l.componentType,type:`insert`,index:h,zone:p,element:r.element,props:{id:r.id.toString()}}}});else{_.current||={zone:l.zone,index:l.index};let e=ze(_.current,i.getState().state);e&&s.setState({previewIndex:{[p]:{componentType:l.componentType,type:`move`,index:h,zone:p,props:e.props,element:r.element}}})}(n=m.dragover)==null||n.forEach(n=>{n(e,t)})}},onDragStart:(e,t)=>{var n;let{source:r}=e.operation;if(r&&r.type!==`void`){let e=r.data,t=ze({zone:e.zone,index:e.index},i.getState().state);t&&s.setState({previewIndex:{[e.zone]:{componentType:e.componentType,type:`move`,index:e.index,zone:e.zone,props:t.props,element:r.element}}})}(n=m.dragstart)==null||n.forEach(n=>{n(e,t)})},onBeforeDragStart:e=>{g.current=e.operation.source?.type===`drawer`?`new`:`existing`,_.current=void 0,s.setState({draggedItem:e.operation.source}),i.getState().selectedItem?.props.id===e.operation.source?.id?n({type:`setUi`,ui:{isDragging:!0},recordHistory:!1}):n({type:`setUi`,ui:{itemSelector:null,isDragging:!0},recordHistory:!1}),(s_()?.querySelector(`[data-puck-entry]`))?.setAttribute(`data-puck-dragging`,`true`)},children:(0,I.jsx)(Hg,{store:s,children:(0,I.jsx)(Ug,{value:y,children:e})})})})},D_=({children:e,disableAutoScroll:t})=>P(e=>e.status)===`LOADING`?e:(0,I.jsx)(E_,{disableAutoScroll:t,children:e}),O_=a(`Drawer`,i_),k_=a(`DrawerItem`,i_),A_=({children:e,name:t,label:n,dragRef:r,isDragDisabled:i})=>{let a=(0,F.useMemo)(()=>e||(({children:e})=>(0,I.jsx)(`div`,{className:k_(`default`),children:e})),[e]);return(0,I.jsx)(`div`,{className:k_({disabled:i}),ref:r,onMouseDown:e=>e.preventDefault(),"data-testid":r?`drawer-item:${t}`:``,"data-puck-drawer-item":!0,children:(0,I.jsx)(a,{name:t,children:(0,I.jsx)(`div`,{className:k_(`draggableWrapper`),children:(0,I.jsxs)(`div`,{className:k_(`draggable`),children:[(0,I.jsx)(`div`,{className:k_(`name`),children:n??t}),(0,I.jsx)(`div`,{className:k_(`icon`),children:(0,I.jsx)(wh,{})})]})})})})},j_=({children:e,name:t,label:n,id:r,isDragDisabled:i})=>{let{ref:a}=Mf({id:r,data:{componentType:t},disabled:i,type:`drawer`});return(0,I.jsxs)(`div`,{className:O_(`draggable`),children:[(0,I.jsx)(`div`,{className:O_(`draggableBg`),children:(0,I.jsx)(A_,{name:t,label:n,children:e})}),(0,I.jsx)(`div`,{className:O_(`draggableFg`),children:(0,I.jsx)(A_,{name:t,label:n,dragRef:a,isDragDisabled:i,children:e})})]})},M_=({name:e,children:t,id:n,label:r,index:i,isDragDisabled:a})=>{let o=n||e,[s,c]=(0,F.useState)(p(o));return i!==void 0&&console.error("Warning: The `index` prop on Drawer.Item is deprecated and no longer required."),C_(`dragend`,()=>{c(p(o))},[o]),(0,I.jsx)(`div`,{children:(0,I.jsx)(j_,{name:e,label:r,id:s,isDragDisabled:a,children:t})},s)},N_=({children:e,droppableId:t,direction:n})=>{t&&console.error("Warning: The `droppableId` prop on Drawer is deprecated and no longer required."),n&&console.error("Warning: The `direction` prop on Drawer is deprecated and no longer required to achieve multi-directional dragging.");let r=Ag(),{ref:i}=cp({id:r,type:`void`,collisionPriority:0});return(0,I.jsx)(`div`,{className:O_(),ref:i,"data-puck-dnd":r,"data-puck-drawer":!0,"data-puck-dnd-void":!0,children:e})};N_.Item=M_,c();var P_=(e,t)=>e.getState().state.indexes.zones[t].contentIds.length,F_=({zoneCompound:e,userMinEmptyHeight:t,ref:n})=>{let r=Pe(),[i,a]=(0,F.useState)(0),[o,s]=(0,F.useState)(!1),{draggedItem:c,isZone:l}=_h(Vg,t=>({draggedItem:t.draggedItem?.data.zone===e?t.draggedItem:null,isZone:t.draggedItem?.data.zone===e})),u=(0,F.useRef)(0),d=Wg(t=>{if(t){let t=P_(r,e);if(a(0),t||u.current===0){s(!1);return}let n=r.getState().selectedItem,i=r.getState().state.indexes.zones,o=r.getState().nodes;o.setOverlayVisible(n?.props.id,!1),setTimeout(()=>{let t=i[e]?.contentIds||[];o.syncNodes(t),n&&setTimeout(()=>{o.syncNode(n.props.id),o.setOverlayVisible(n.props.id,!0)},200),s(!1)},100)}},[r,i,e]);(0,F.useEffect)(()=>{if(c&&n.current&&l){let t=n.current.getBoundingClientRect();return u.current=P_(r,e),a(t.height),s(!0),d()}},[n.current,c,d]);let f=isNaN(Number(t))?t:`${t}px`;return[i?`${i}px`:f,o]};c(),c();function I_(e,t){let n=Af();return(0,F.useCallback)((...t)=>s(null,null,function*(){return yield n?.renderer.rendering,e(...t)}),[...t,n])}var L_=(e,t)=>{let n=(0,F.useContext)(Vg),r=_h(Vg,e=>e.previewIndex[t]),i=P(e=>e.state.ui.isDragging),[a,o]=(0,F.useState)(e),[s,c]=(0,F.useState)(r),l=I_((e,t,n,r,i)=>{n&&!i||(t?(t.type,o(ie(e.filter(e=>e!==t.props.id),t.index,t.props.id))):o(i?e.filter(e=>e!==r):e),c(t))},[]);return(0,F.useEffect)(()=>{let t=n.getState();l(e,r,i,t.draggedItem?.id,Object.keys(t.previewIndex||{}).length>0)},[e,r,i]),[a,s]};c();var R_=`dynamic`,z_=`x`,B_=`y`,V_=(e,t)=>{let n=P(e=>e.status),[r,i]=(0,F.useState)(t||B_),a=(0,F.useCallback)(()=>{if(e.current){let t=window.getComputedStyle(e.current);t.display===`grid`?i(R_):t.display===`flex`&&t.flexDirection===`row`?i(z_):i(B_)}},[e.current]);return(0,F.useEffect)(()=>{let e=()=>{a()};return window.addEventListener(`viewportchange`,e),()=>{window.removeEventListener(`viewportchange`,e)}},[]),(0,F.useEffect)(a,[n,t]),[r,a]};c();var H_=({componentId:e,zone:t})=>{let n=P(e=>e.config),r=P(e=>e.metadata);return(0,I.jsx)(bn,{content:P(On(n=>{let r=n.state.indexes;return(r.zones[`${e}:${t}`]?.contentIds??[]).map(e=>r.nodes[e].flatData)})),zone:t,config:n,metadata:r})};c();function U_(t,n,r,i,a){let s=(0,F.useRef)(null),c=(0,F.useRef)(n.props),l=(0,F.useMemo)(()=>fn(r,i,a),[r,i,a]),u=(0,F.useMemo)(()=>{let r={},i=n.type===`root`?t.root:t.components?.[n.type],a=!1;for(let e in n.props){let t=i?.fields?.[e]?.type;(!s.current||n.props[e]!==s.current[e])&&(r[e]=n.props[e],t===`slot`&&(a=!0))}r.id=n.props.id,s.current=n.props;let u=N(e(o({},n),{props:r}),l,t,!1,a).props;return c.current=o(o({},c.current),u),c.current},[t,n,l]);return(0,F.useMemo)(()=>o(o({},n.props),u),[n.props,u])}c(),c(),c();var W_=(e,t={})=>{if(!e)return;let{disableDrag:n=!1,disableDragOnFocus:r=!0}=t,i=e=>{e.stopPropagation()};e.addEventListener(`mouseover`,i,{capture:!0});let a=()=>{setTimeout(()=>{e.addEventListener(`pointerdown`,i,{capture:!0})},200)},o=()=>{e.removeEventListener(`pointerdown`,i,{capture:!0})};return n?e.addEventListener(`pointerdown`,i,{capture:!0}):r&&(e.addEventListener(`focus`,a,{capture:!0}),e.addEventListener(`blur`,o,{capture:!0})),e.setAttribute(`data-puck-overlay-portal`,`true`),()=>{e.removeEventListener(`mouseover`,i,{capture:!0}),n?e.removeEventListener(`pointerdown`,i,{capture:!0}):r&&(e.removeEventListener(`focus`,a,{capture:!0}),e.removeEventListener(`blur`,o,{capture:!0})),e.removeAttribute(`data-puck-overlay-portal`)}};c();var G_=a(`InlineTextField`,{InlineTextField:`_InlineTextField_104qp_1`}),K_=(0,F.memo)(({propPath:t,componentId:n,value:r,isReadOnly:i,opts:a={}})=>{let c=(0,F.useRef)(null),l=Pe(),u=a.disableLineBreaks??!1;(0,F.useEffect)(()=>{let i=l.getState(),a=i.state.indexes.nodes[n].data;if(!i.getComponentConfig(a.type))throw Error(`InlineTextField Error: No config defined for ${a.type}`);if(c.current){let i=r??``;i!==c.current.innerText&&c.current.replaceChildren(i);let a=W_(c.current),d=r=>s(null,null,function*(){let i=l.getState(),a=i.state.indexes.nodes[n],s=`${a.parentId}:${a.zone}`,c=i.state.indexes.zones[s]?.contentIds.indexOf(n),d=r.target.innerText;u&&(d=d.replaceAll(/\n/gm,``));let f=oh(a.data.props,t,d),p=yield i.resolveComponentData(e(o({},a.data),{props:f}),`replace`);i.dispatch({type:`replace`,data:p.node,destinationIndex:c,destinationZone:s})});return c.current.addEventListener(`input`,d),()=>{var e;(e=c.current)==null||e.removeEventListener(`input`,d),a?.()}}},[l,c.current,r,u]);let[d,f]=(0,F.useState)(!1),[p,m]=(0,F.useState)(!1);return(0,I.jsx)(`span`,{className:G_(),ref:c,contentEditable:d||p?`plaintext-only`:`false`,onClick:e=>{e.preventDefault(),e.stopPropagation()},onClickCapture:e=>{e.preventDefault(),e.stopPropagation();let t=__(l.getState().state,n);l.getState().setUi({itemSelector:t})},onKeyDown:e=>{e.stopPropagation(),(u&&e.key===`Enter`||i)&&e.preventDefault()},onKeyUp:e=>{e.stopPropagation(),e.preventDefault()},onMouseOverCapture:()=>f(!0),onMouseOutCapture:()=>f(!1),onFocus:()=>m(!0),onBlur:()=>m(!1)})}),q_=()=>({text:({value:e,componentId:t,field:n,propPath:r,isReadOnly:i})=>n.contentEditable?(0,I.jsx)(K_,{propPath:r,componentId:t,value:e,opts:{disableLineBreaks:!0},isReadOnly:i}):e,textarea:({value:e,componentId:t,field:n,propPath:r,isReadOnly:i})=>n.contentEditable?(0,I.jsx)(K_,{propPath:r,componentId:t,value:e,isReadOnly:i}):e,custom:({value:e,componentId:t,field:n,propPath:r,isReadOnly:i})=>n.contentEditable&&typeof e==`string`?(0,I.jsx)(K_,{propPath:r,componentId:t,value:e,isReadOnly:i}):e});c();var J_=(0,F.lazy)(()=>Ot(()=>import(`./assets/Editor-FJJNKTC3-Mp0zsKT5.js`).then(e=>({default:e.Editor})),__vite__mapDeps([13,1,2,12,5,7,3,9,4]))),Y_=(0,F.lazy)(()=>Ot(()=>import(`./assets/Render-DQXAYUBI-DgxEH8NP.js`).then(e=>({default:e.RichTextRender})),__vite__mapDeps([11,1,12,5]))),X_=(0,F.memo)(({value:t,componentId:n,propPath:r,field:i,id:a})=>{let c=(0,F.useRef)(null),l=Pe(),u=e=>{e.preventDefault(),e.stopPropagation()},d=e=>{e.preventDefault(),e.stopPropagation();let t=__(l.getState().state,n);l.getState().setUi({itemSelector:t})};(0,F.useEffect)(()=>{if(!c.current)return;let e=W_(c.current,{disableDragOnFocus:!0});return()=>e?.()},[c.current]);let f=(0,F.useCallback)((t,i)=>s(null,null,function*(){let a=l.getState(),s=a.state.indexes.nodes[n],c=`${s.parentId}:${s.zone}`,u=a.state.indexes.zones[c]?.contentIds.indexOf(n),d=oh(s.data.props,r,t),f=yield a.resolveComponentData(e(o({},s.data),{props:d}),`replace`);a.dispatch({type:`replace`,data:f.node,destinationIndex:u,destinationZone:c,ui:i})}),[l,n,r]),p=(0,F.useCallback)(e=>{l.setState({currentRichText:{inlineComponentId:n,inline:!0,field:i,editor:e,id:a}})},[i,n]);if(!i.contentEditable)return(0,I.jsx)(F.Suspense,{fallback:(0,I.jsx)(gn,{content:t}),children:(0,I.jsx)(Y_,{content:t,field:i})});let m={content:t,onChange:f,field:i,inline:!0,onFocus:p,id:a,name:r};return(0,I.jsx)(`div`,{ref:c,onClick:u,onClickCapture:d,children:(0,I.jsx)(F.Suspense,{fallback:(0,I.jsx)(Tg,o({},m)),children:(0,I.jsx)(J_,o({},m))})})});X_.displayName=`InlineEditorWrapper`;var Z_=()=>({richtext:({value:e,componentId:t,field:n,propPath:r,isReadOnly:i})=>{let{contentEditable:a=!0,tiptap:o}=n;if(a===!1||i)return(0,I.jsx)(Y_,{content:e,field:n});let s=`${t}_${n.type}_${r}`;return(0,I.jsx)(X_,{value:e,componentId:t,propPath:r,field:n,id:s},s)}});c(),c();function Q_(e,t,n=[]){if(Object.is(e,t))return!0;if(typeof e!=`object`||!e||typeof t!=`object`||!t||Object.getPrototypeOf(e)!==Object.getPrototypeOf(t))return!1;let r=new Set(n),i=Object.keys(e).filter(e=>!r.has(e)),a=Object.keys(t).filter(e=>!r.has(e));if(i.length!==a.length)return!1;for(let n=0;n<i.length;n++){let r=i[n];if(!Object.prototype.hasOwnProperty.call(t,r))return!1;let a=e[r],o=t[r];if(!Object.is(a,o))return!1}return!0}var $_=(0,F.memo)(({Component:e,componentProps:t})=>(0,I.jsx)(e,o({},t)),(e,t)=>{let n=!0;return`puck`in e.componentProps&&`puck`in t.componentProps&&(n=Ve(e.componentProps.puck,t.componentProps.puck)),e.Component===t.Component&&Q_(e.componentProps,t.componentProps,[`puck`])&&n});c();var ev=5,tv=320,nv=new Map,rv=e=>nv.get(e)??tv,iv=(e,t)=>{t<=0||nv.set(e,t)},av=({contentIds:e,zoneCompound:t,renderItem:n})=>{let r=P(e=>e.selectedItem?.props.id??null),i=s_(),a=(0,F.useContext)(Vg),o=_h(Vg,e=>{let t=e.draggedItem?.id;return t?String(t):null}),s=_h(Vg,e=>e.draggedItem?.id?Object.keys(e.previewIndex??{})[0]?.split(`:`)[0]:null),c=i?.defaultView,l=(0,F.useRef)(new Map),u=Pe(),d=(0,F.useCallback)(t=>{if(!t||t===`root`)return-1;let n=e.indexOf(t);if(n>-1)return n;let r=u.getState().state.indexes.nodes?.[t]?.path??[];for(let t=r.length-1;t>=0;--t){let n=r[t]?.split(`:`)[0];if(!n||n===`root`)continue;let i=e.indexOf(n);if(i>-1)return i}return-1},[u,e]),f=(0,F.useMemo)(()=>{let e=new Set;return[r,o,s].forEach(t=>{let n=d(t);n>-1&&e.add(n)}),Array.from(e).sort((e,t)=>e-t)},[s,o,d,r]),p=(0,F.useCallback)(e=>{let t=Bm(e);return f.forEach(e=>{t.includes(e)||t.push(e)}),t.sort((e,t)=>e-t),t},[f]),m=ih({count:e.length,getItemKey:t=>e[t],estimateSize:t=>rv(e[t]),getScrollElement:()=>c??null,overscan:ev,observeElementRect:(e,t)=>c?Um(e,t):Vm(e,t),observeElementOffset:(e,t)=>c?qm(e,t):Km(e,t),scrollToFn:(e,t,n)=>c?Xm(e,t,n):Zm(e,t,n),rangeExtractor:p,initialOffset:()=>c?c.scrollY:0});(0,F.useEffect)(()=>(a.getState().registerRootVirtualizer(t,{resolveIndex:e=>d(e),virtualizer:m}),()=>{a.getState().unregisterRootVirtualizer(t)}),[d,m,t,a]);let h=(0,F.useCallback)(e=>{let t=l.current.get(e);if(t)return t;let n=t=>{if(!t)return;let n=Math.ceil(t.getBoundingClientRect().height)||tv;typeof n==`number`&&n>0&&iv(e,n)};return l.current.set(e,n),n},[]);(0,F.useEffect)(()=>{let t=new Set(e);Array.from(l.current.keys()).forEach(e=>{t.has(e)||l.current.delete(e)})},[e]);let g=m.getVirtualItems(),_=m.getTotalSize();return(0,I.jsx)(I.Fragment,{children:(0,F.useMemo)(()=>{let t=[],r=0,i=-1;g.forEach(a=>{if(!a)return;let o=e[a.index],s=Math.max(a.start-r,0);s>0&&t.push((0,I.jsx)(`div`,{style:{height:`${s}px`}},`gap:${i}:${a.index}`)),t.push(n({componentId:o,index:a.index,measureRef:h(o)})),r=a.end,i=a.index});let a=Math.max(_-r,0);return a>0&&t.push((0,I.jsx)(`div`,{style:{height:`${a}px`}},`gap:${i}:end`)),t},[_,g,h])})},ov=a(`DropZone`,r_),sv=()=>`#${Math.floor(Math.random()*16777215).toString(16)}`,cv=!1,lv=({element:e,label:t,override:n})=>e?(0,I.jsx)(`div`,{dangerouslySetInnerHTML:{__html:e.outerHTML}}):(0,I.jsx)(A_,{name:t,children:n}),uv=e=>(0,I.jsx)(fv,o({},e)),dv=(0,F.memo)(({zoneCompound:t,componentId:n,index:r,dragAxis:i,collisionAxis:a,inDroppableZone:s,itemRef:c})=>{let l=P(e=>e.metadata),{depth:u=1}=(0,F.useContext)(Bg)??{},d=(0,F.useContext)(Vg),f=P(On(e=>e.state.indexes.nodes[n]?.flatData.props)),p=P(e=>e.state.indexes.nodes[n]?.data.type),m=P(On(e=>e.state.indexes.nodes[n]?.data.readOnly)),h=(0,F.useMemo)(()=>{if(f)return ne({type:p,props:f});let e=d.getState().previewIndex[t];return n===e?.props.id?{type:e.componentType,props:e.props,previewType:e.type,element:e.element}:null},[Pe(),n,t,p,f]),g=P(e=>h?.type?e.config.components[h.type]:null),_=(0,F.useMemo)(()=>({renderDropZone:uv,isEditing:!0,dragRef:null,metadata:o(o({},l),g?.metadata)}),[l,g?.metadata]),v=P(e=>e.overrides),y=P(e=>e.componentState[n]?.loadingCount>0),b=P(e=>e.selectedItem?.props.id===n||!1),x=g?.label??h?.type.toString()??`Component`,S=(0,F.useMemo)(()=>e(o(o({},g?.defaultProps),h?.props),{puck:_,editMode:!0}),[g?.defaultProps,h?.props,_]),C=(0,F.useMemo)(()=>({type:h?.type??p,props:S}),[h?.type,p,S]),ee=P(e=>e.config),w=P(e=>e.plugins),te=P(e=>e.fieldTransforms),T=U_(ee,C,(0,F.useMemo)(()=>o(o(o(o(o({},dn(uv,e=>(0,I.jsx)(H_,{componentId:n,zone:e.zone}))),q_()),Z_()),w.reduce((e,t)=>o(o({},e),t.fieldTransforms),{})),te),[w,te]),m,y);if(!h)return;let E=g?g.render:()=>(0,I.jsxs)(`div`,{style:{padding:48,textAlign:`center`},children:[`No configuration for `,h.type]}),D=h.type,O=`previewType`in h?h.previewType===`insert`:!1;return(0,I.jsx)(n_,{id:n,componentType:D,zoneCompound:t,depth:u+1,index:r,isLoading:y,isSelected:b,label:x,autoDragAxis:i,userDragAxis:a,inDroppableZone:s,itemRef:c,children:t=>g?.inline&&!O?(0,I.jsx)($_,{Component:E,componentProps:e(o({},T),{puck:e(o({},T.puck),{dragRef:t})})}):(0,I.jsx)(`div`,{ref:t,children:O?(0,I.jsx)(lv,{label:x,override:v.componentItem??v.drawerItem,element:`element`in h&&h.element?h.element:void 0}):(0,I.jsx)($_,{Component:E,componentProps:T})})})}),fv=(0,F.forwardRef)(function({zone:t,allow:n,disallow:r,style:i,className:a,minEmptyHeight:s=`128px`,collisionAxis:c,as:l},u){let d=(0,F.useContext)(Bg),f=Pe(),{areaId:p,depth:m=0,registerLocalZone:g,unregisterLocalZone:_}=d??{},v=P(On(e=>p?e.state.indexes.nodes[p]?.path:null)),y=h;p&&t!==h&&(y=`${p}:${t}`);let b=y===h||t===h||p===`root`,x=_h(Vg,e=>e.nextAreaDepthIndex[p||``]),S=P(On(e=>e.state.indexes.zones[y]?.contentIds)),C=P(On(e=>e.state.indexes.zones[y]?.type));(0,F.useEffect)(()=>{(!C||C===`dropzone`)&&d?.registerZone&&d?.registerZone(y)},[C,f]),(0,F.useEffect)(()=>{C===`dropzone`&&y!==h&&console.warn(`DropZones have been deprecated in favor of slot fields and will be removed in a future version of Puck. Please see the migration guide: https://www.puckeditor.com/docs/guides/migrations/dropzones-to-slots`)},[C]);let ee=(0,F.useMemo)(()=>S||[],[S]),w=(0,F.useRef)(null),te=(0,F.useCallback)(e=>{if(!e)return!0;if(r){let t=n||[];if((r||[]).filter(e=>t.indexOf(e)===-1).indexOf(e)!==-1)return!1}else if(n&&n.indexOf(e)===-1)return!1;return!0},[n,r]),T=_h(Vg,e=>te(e.draggedItem?.data.componentType)),E=x||b,D=_h(Vg,e=>{let t=!0;return t=e.zoneDepthIndex[y]??!1,t&&=T,t});(0,F.useEffect)(()=>(g&&g(y,T||D),()=>{_&&_(y)}),[T,D,y]);let[O,ne]=L_(ee,y),re=D&&(ne?O.length===1:O.length===0),ie=(0,F.useContext)(Vg);(0,F.useEffect)(()=>{let{enabledIndex:t}=ie.getState();ie.setState({enabledIndex:e(o({},t),{[y]:D})})},[D,ie,y]);let{ref:ae}=cp({id:y,collisionPriority:D?m:0,disabled:!re,collisionDetector:Vh,type:`dropzone`,data:{areaId:p,depth:m,isDroppableTarget:T,path:v||[]}}),k=P(e=>e?.selectedItem&&p===e?.selectedItem.props.id),[A]=V_(w,c),[oe,se]=F_({zoneCompound:y,userMinEmptyHeight:s,ref:w}),j=(0,F.useCallback)(e=>{Kg([w,ae,u],e)},[ae]),M=P(e=>e._experimentalVirtualization),ce=l??`div`,N=M&&(p??`root`)===`root`&&m===0;return(0,I.jsx)(ce,{className:`${ov({isRootZone:b,hoveringOverArea:E,isEnabled:D,isAreaSelected:k,hasChildren:ee.length>0,isAnimating:se})}${a?` ${a}`:``}`,ref:j,"data-testid":`dropzone:${y}`,"data-puck-dropzone":y,style:e(o({},i),{"--puck-slot-min-empty-height":oe,backgroundColor:cv?sv():i?.backgroundColor}),children:N?(0,I.jsx)(av,{contentIds:O,zoneCompound:y,renderItem:e=>(0,I.jsx)(dv,{zoneCompound:y,componentId:e.componentId,dragAxis:A,index:e.index,collisionAxis:c,inDroppableZone:T,itemRef:e.measureRef},e.componentId)}):O.map((e,t)=>(0,I.jsx)(dv,{zoneCompound:y,componentId:e,dragAxis:A,index:t,collisionAxis:c,inDroppableZone:T},e))})}),pv=({config:t,item:n,metadata:r})=>{let i=t.components[n.type],a=mn(t,n,n=>(0,I.jsx)(bn,e(o({},n),{config:t,metadata:r}))),s=(0,F.useMemo)(()=>({areaId:a.id,depth:1}),[a]),c=yn(i.fields,a);return(0,I.jsx)(Ug,{value:s,children:(0,I.jsx)(i.render,e(o(o({},a),c),{puck:e(o({},a.puck),{renderDropZone:mv,metadata:o(o({},r),i.metadata)})}))},a.id)},mv=e=>(0,I.jsx)(hv,o({},e)),hv=(0,F.forwardRef)(function({className:e,style:t,zone:n,as:r},i){let a=(0,F.useContext)(Bg),{areaId:o=`root`}=a||{},{config:s,data:c,metadata:l}=(0,F.useContext)(vv),u=`${o}:${n}`,d=c?.content||[];(0,F.useEffect)(()=>{d||a?.registerZone&&a?.registerZone(u)},[d]);let f=r??`div`;return!c||!s?null:(u!==h&&(d=ee(c,u).zones[u]),(0,I.jsx)(f,{className:e,style:t,ref:i,children:d.map(e=>s.components[e.type]?(0,I.jsx)(pv,{config:s,item:e,metadata:l},e.props.id):null)}))}),gv=e=>(0,I.jsx)(_v,o({},e)),_v=(0,F.forwardRef)(function(t,n){return(0,F.useContext)(Bg)?.mode===`edit`?(0,I.jsx)(I.Fragment,{children:(0,I.jsx)(fv,e(o({},t),{ref:n}))}):(0,I.jsx)(I.Fragment,{children:(0,I.jsx)(hv,e(o({},t),{ref:n}))})}),vv=F.createContext({config:{components:{}},data:{root:{},content:[]},metadata:{}});function yv({config:t,data:n,metadata:r={}}){let i=e(o({},n),{root:n.root||{},content:n.content||[]}),a=`props`in i.root?i.root.props:i.root,s=a?.title||``,c=e(o({},a),{puck:{renderDropZone:gv,isEditing:!1,dragRef:null,metadata:r},title:s,editMode:!1,id:`puck-root`}),l=mn(t,{type:`root`,props:c},n=>(0,I.jsx)(Sn,e(o({},n),{config:t,metadata:r}))),u=yn(t.root?.fields,c),d=(0,F.useMemo)(()=>({mode:`render`,depth:0}),[]);return t.root?.render?(0,I.jsx)(vv.Provider,{value:{config:t,data:i,metadata:r},children:(0,I.jsx)(Ug,{value:d,children:(0,I.jsx)(t.root.render,e(o(o({},l),u),{children:(0,I.jsx)(mv,{zone:me})}))})}):(0,I.jsx)(vv.Provider,{value:{config:t,data:i,metadata:r},children:(0,I.jsx)(Ug,{value:d,children:(0,I.jsx)(mv,{zone:me})})})}c(),c(),c();function bv(e,t,n=`force`){return s(this,null,function*(){let r=yield t().resolveComponentData(e,n);if(!r.didChange)return;let i=__(t().state,r.node.props.id);if(!i){console.warn(`Warning: Could not find component with id "${e.props.id}" to resolve its data. Component may have been removed or the id is invalid.`);return}t().dispatch({type:`replace`,data:fe(r.node),destinationIndex:i.index,destinationZone:i.zone})})}function xv(e,t,n){return s(this,null,function*(){let r=t().state.indexes.nodes[e];if(!r){console.warn(`Warning: Could not find component with id "${e}" to resolve its data. Component may have been removed or the id is invalid.`);return}yield bv(r.data,t,n)})}c();function Sv(e,t,n){return s(this,null,function*(){let r=ze(e,t().state);if(!r){console.warn(`Warning: Could not find component for selector "${JSON.stringify(e)}" to resolve its data. Component may have been removed or the selector is invalid.`);return}yield bv(fe(r),t,n)})}var Cv=(e,t)=>{let n={back:e.history.back,forward:e.history.forward,setHistories:e.history.setHistories,setHistoryIndex:e.history.setHistoryIndex,hasPast:e.history.hasPast(),hasFuture:e.history.hasFuture(),histories:e.history.histories,index:e.history.index},r={appState:j(e.state),config:e.config,dispatch:e.dispatch,getPermissions:e.permissions.getPermissions,refreshPermissions:e.permissions.refreshPermissions,resolveDataById:(e,n)=>xv(e,t,n),resolveDataBySelector:(e,n)=>Sv(e,t,n),history:n,selectedItem:e.selectedItem||null,getItemBySelector:t=>ze(t,e.state),getItemById:t=>e.state.indexes.nodes[t].data,getSelectorForId:t=>__(e.state,t),getParentById:t=>{let n=e.state.indexes.nodes[t].parentId;if(n===null)return;let r=e.state.indexes.nodes[n];if(r)return r.data}};return r.__private={appState:e.state},r},wv=(0,F.createContext)(null),Tv=e=>({state:e.state,config:e.config,dispatch:e.dispatch,permissions:e.permissions,history:e.history,selectedItem:e.selectedItem}),Ev=e=>{let[t]=(0,F.useState)(()=>v(()=>Cv(Tv(e.getState()),e.getState)));return(0,F.useEffect)(()=>e.subscribe(e=>Tv(e),n=>{t.setState(Cv(n,e.getState))}),[]),t};c(),c(),c(),c(),c();var Dv=a(`ComponentList`,{ComponentList:`_ComponentList_htktj_1`,"ComponentList--isExpanded":`_ComponentList--isExpanded_htktj_5`,"ComponentList-content":`_ComponentList-content_htktj_9`,"ComponentList-title":`_ComponentList-title_htktj_17`,"ComponentList-titleIcon":`_ComponentList-titleIcon_htktj_63`}),Ov=({name:e,label:t})=>{let n=P(e=>e.overrides),r=P(t=>t.permissions.getPermissions({type:e}).insert);return(0,F.useEffect)(()=>{n.componentItem&&console.warn("The `componentItem` override has been deprecated and renamed to `drawerItem`")},[n]),(0,I.jsx)(N_.Item,{label:t,name:e,isDragDisabled:!r,children:n.componentItem??n.drawerItem})},kv=({children:t,title:n,id:r})=>{let i=P(e=>e.config),a=P(e=>e.setUi),s=P(e=>e.state.ui.componentList),{expanded:c=!0}=s[r]||{},l=`puck-drawer-category-${r}`;return(0,I.jsxs)(`div`,{className:Dv({isExpanded:c}),children:[n&&(0,I.jsxs)(`button`,{type:`button`,className:Dv(`title`),"aria-expanded":c,"aria-controls":l,onClick:()=>a({componentList:e(o({},s),{[r]:e(o({},s[r]),{expanded:!c})})}),title:c?`Collapse${n?` ${n}`:``}`:`Expand${n?` ${n}`:``}`,children:[(0,I.jsx)(`div`,{children:n}),(0,I.jsx)(`div`,{className:Dv(`titleIcon`),children:c?(0,I.jsx)(at,{size:12}):(0,I.jsx)(Ee,{size:12})})]}),(0,I.jsx)(`div`,{className:Dv(`content`),id:l,children:(0,I.jsx)(N_,{children:t||Object.keys(i.components).map(e=>(0,I.jsx)(Ov,{label:i.components[e].label??e,name:e},e))})})]})};kv.Item=Ov;var Av=()=>{let[e,t]=(0,F.useState)(),n=P(e=>e.config),r=P(e=>e.state.ui.componentList);return(0,F.useEffect)(()=>{if(Object.keys(r).length>0){let e=[],i;i=Object.entries(r).map(([t,r])=>!r.components||(r.components.forEach(t=>{e.push(t)}),r.visible===!1)?null:(0,I.jsx)(kv,{id:t,title:r.title||t,children:r.components.map((e,t)=>{let r=n.components[e]||{};return(0,I.jsx)(kv.Item,{label:r.label??e,name:e,index:t},e)})},t));let a=Object.keys(n.components).filter(t=>e.indexOf(t)===-1);a.length>0&&!r.other?.components&&r.other?.visible!==!1&&i.push((0,I.jsx)(kv,{id:`other`,title:r.other?.title||`Other`,children:a.map((e,t)=>{let r=n.components[e]||{};return(0,I.jsx)(kv.Item,{name:e,label:r.label??e,index:t},e)})},`other`)),t(i)}},[n.categories,n.components,r]),e},jv=()=>{let e=P(e=>e.overrides),t=Av();return(0,I.jsx)((0,F.useMemo)(()=>(e.components&&console.warn("The `components` override has been deprecated and renamed to `drawer`"),e.components||e.drawer||`div`),[e]),{children:t||(0,I.jsx)(kv,{id:`all`})})};c();var Mv=a(`BlocksPlugin`,{BlocksPlugin:`_BlocksPlugin_9af19_1`}),Nv=()=>({name:`blocks`,label:`Blocks`,render:()=>(0,I.jsx)(`div`,{className:Mv(),children:(0,I.jsx)(jv,{})}),icon:(0,I.jsx)(ft,{})});c(),c(),c(),c();var Pv={LayerTree:`_LayerTree_1vltj_1`,"LayerTree-zoneTitle":`_LayerTree-zoneTitle_1vltj_11`,"LayerTree-helper":`_LayerTree-helper_1vltj_17`,Layer:`_Layer_1vltj_1`,"Layer-inner":`_Layer-inner_1vltj_30`,"Layer--containsZone":`_Layer--containsZone_1vltj_37`,"Layer-clickable":`_Layer-clickable_1vltj_41`,"Layer--isSelected":`_Layer--isSelected_1vltj_63`,"Layer-chevron":`_Layer-chevron_1vltj_91`,"Layer--childIsSelected":`_Layer--childIsSelected_1vltj_92`,"Layer-zones":`_Layer-zones_1vltj_96`,"Layer-title":`_Layer-title_1vltj_110`,"Layer-name":`_Layer-name_1vltj_119`,"Layer-icon":`_Layer-icon_1vltj_125`,"Layer-zoneIcon":`_Layer-zoneIcon_1vltj_130`},Fv=a(`LayerTree`,Pv),Iv=a(`Layer`,Pv),Lv=32,Rv=8,zv=25,Bv=new Map,Vv=e=>Object.keys(e).reduce((e,t)=>{let[n]=t.split(`:`);return e[n]=[...e[n]||[],t],e},{}),Hv=(e,t,n,r)=>{if(r!==void 0)return r;let[i,a]=e.split(`:`);if(!a)return;let o=t[i]?.data.type;return(o&&o!==`root`?n.components[o]:n.root)?.fields?.[a]?.label??a},Uv=({config:e,itemId:t,index:n,nodes:r,zoneCompound:i,zones:a,zonesByParent:o})=>{let s=(r[t]?.data.type)?.toString()||`Component`,c=e.components[s]?.label??s;return{childZones:(o[t]||[]).map(t=>Wv({config:e,nodes:r,zoneCompound:t,zones:a,zonesByParent:o})),componentType:s,index:n,itemId:t,label:c,zoneCompound:i}},Wv=({config:e,label:t,nodes:n,zoneCompound:r,zones:i,zonesByParent:a=Vv(i)})=>({items:(i[r]?.contentIds??[]).map((t,o)=>Uv({config:e,itemId:t,index:o,nodes:n,zoneCompound:r,zones:i,zonesByParent:a})),label:Hv(r,n,e,t),zoneCompound:r}),Gv=e=>Bv.get(e)??Lv,Kv=(e,t)=>{t<=0||Bv.set(e,t)},qv=e=>{let t=e?.parentElement??null;for(;t;){let{overflow:e,overflowY:n}=getComputedStyle(t);if([e,n].some(e=>/auto|scroll/.test(e)))return t;t=t.parentElement}return null},Jv=(0,F.forwardRef)(function({childIsSelected:e,dataIndex:t,depth:n,isSelected:r,node:i,selectedId:a,selectedPathIds:o},s){let c=P(e=>e.dispatch),l=(0,F.useContext)(Vg),u=_h(Vg,e=>e.hoveringComponent===i.itemId),d=i.childZones.length>0,f=(0,F.useCallback)(e=>{c({type:`setUi`,ui:{itemSelector:e}})},[c]),p=r||e;return(0,I.jsxs)(`li`,{ref:s,className:Iv({childIsSelected:e,containsZone:d,isHovering:u,isSelected:r}),"data-index":t,"data-puck-layer-tree-id":i.itemId,children:[(0,I.jsx)(`div`,{className:Iv(`inner`),children:(0,I.jsxs)(`button`,{type:`button`,className:Iv(`clickable`),onClick:()=>{if(r){f(null);return}f({index:i.index,zone:i.zoneCompound}),l.getState().scrollToComponent(i.itemId)},onMouseEnter:e=>{e.stopPropagation(),l.setState({hoveringComponent:i.itemId})},onMouseLeave:e=>{e.stopPropagation(),l.setState({hoveringComponent:null})},children:[d&&(0,I.jsx)(`div`,{className:Iv(`chevron`),title:r?`Collapse`:`Expand`,children:(0,I.jsx)(Ee,{size:`12`})}),(0,I.jsxs)(`div`,{className:Iv(`title`),children:[(0,I.jsx)(`div`,{className:Iv(`icon`),children:i.componentType===`Text`||i.componentType===`Heading`?(0,I.jsx)(et,{size:`16`}):(0,I.jsx)(Re,{size:`16`})}),(0,I.jsx)(`div`,{className:Iv(`name`),children:i.label})]})]})}),d&&p&&i.childZones.map(e=>(0,I.jsx)(`div`,{className:Iv(`zones`),children:(0,I.jsx)(Yv,{depth:n+1,selectedId:a,selectedPathIds:o,tree:e})},e.zoneCompound))]})}),Yv=({depth:e,selectedId:t,selectedPathIds:n,tree:r})=>{let i=e===0&&r.items.length>=zv;return(0,I.jsxs)(I.Fragment,{children:[r.label&&(0,I.jsxs)(`div`,{className:Fv(`zoneTitle`),children:[(0,I.jsx)(`div`,{className:Fv(`zoneIcon`),children:(0,I.jsx)(f,{size:`16`})}),r.label]}),i?(0,I.jsx)(Zv,{depth:e,selectedId:t,selectedPathIds:n,tree:r}):(0,I.jsx)(Xv,{depth:e,selectedId:t,selectedPathIds:n,tree:r})]})},Xv=({depth:e,selectedId:t,selectedPathIds:n,tree:r})=>(0,I.jsxs)(`ul`,{className:Fv(),children:[r.items.length===0&&(0,I.jsx)(`div`,{className:Fv(`helper`),children:`No items`}),r.items.map(r=>(0,I.jsx)(Jv,{childIsSelected:n.has(r.itemId),depth:e,isSelected:t===r.itemId,node:r,selectedId:t,selectedPathIds:n},r.itemId))]}),Zv=({depth:e,selectedId:t,selectedPathIds:n,tree:r})=>{let i=(0,F.useRef)(null),a=ih({count:r.items.length,estimateSize:e=>Gv(r.items[e].itemId),getItemKey:e=>r.items[e].itemId,getScrollElement:()=>qv(i.current),overscan:Rv,measureElement:e=>{let t=Math.ceil(e.getBoundingClientRect().height),n=e.dataset.puckLayerTreeId;return n&&Kv(n,t),t||Lv}}),o=a.getVirtualItems(),s=a.getTotalSize(),c=[],l=0,u=-1;o.forEach(i=>{let o=r.items[i.index],s=Math.max(i.start-l,0);s>0&&c.push((0,I.jsx)(`li`,{"aria-hidden":`true`,style:{height:`${s}px`}},`gap:${r.zoneCompound}:${u}:${i.index}`)),c.push((0,I.jsx)(Jv,{childIsSelected:n.has(o.itemId),dataIndex:i.index,depth:e,isSelected:t===o.itemId,node:o,ref:a.measureElement,selectedId:t,selectedPathIds:n},o.itemId)),l=i.end,u=i.index});let d=Math.max(s-l,0);return d>0&&c.push((0,I.jsx)(`li`,{"aria-hidden":`true`,style:{height:`${d}px`}},`gap:${r.zoneCompound}:${u}:end`)),(0,I.jsxs)(`ul`,{className:Fv(),ref:i,children:[r.items.length===0&&(0,I.jsx)(`div`,{className:Fv(`helper`),children:`No items`}),c]})},Qv=({selectedId:e,selectedPathIds:t,trees:n})=>(0,I.jsx)(I.Fragment,{children:n.map(n=>(0,I.jsx)(Yv,{depth:0,selectedId:e,selectedPathIds:t,tree:n},n.zoneCompound))});c();var $v=(e,t)=>Object.keys(e.indexes.zones).filter(e=>e.split(`:`)[0]===t),ey=()=>{let e=P(e=>e.overrides.outline),t=P(e=>e.config),n=P(e=>e.state.indexes.nodes),r=P(e=>e.state.indexes.zones),i=P(e=>e.selectedItem?.props.id||null),a=P(On(e=>$v(e.state,`root`))),o=(0,F.useMemo)(()=>{let e=i?n[i]?.path:null;return new Set(e?.map(e=>e.split(`:`)[0]).filter(Boolean)||[])},[n,i]),s=(0,F.useMemo)(()=>a.map(e=>Wv({config:t,label:a.length===1?``:e.split(`:`)[1],nodes:n,zoneCompound:e,zones:r})),[t,n,a,r]);return(0,I.jsx)((0,F.useMemo)(()=>e||`div`,[e]),{children:(0,I.jsx)(Qv,{selectedId:i,selectedPathIds:o,trees:s})})};c();var ty=a(`OutlinePlugin`,{OutlinePlugin:`_OutlinePlugin_16k03_1`}),ny=()=>({name:`outline`,label:`Outline`,render:()=>(0,I.jsx)(`div`,{className:ty(),children:(0,I.jsx)(ey,{})}),icon:(0,I.jsx)(f,{})});c(),c(),c();var ry={Breadcrumbs:`_Breadcrumbs_8c6w5_1`,"Breadcrumbs-breadcrumbLabel":`_Breadcrumbs-breadcrumbLabel_8c6w5_7`,"Breadcrumbs-breadcrumb":`_Breadcrumbs-breadcrumb_8c6w5_7`};c();var iy=e=>{let t=P(e=>e.selectedItem?.props.id),n=P(e=>e.config),r=P(e=>e.state.indexes.nodes[t]?.path),i=Pe();return(0,F.useMemo)(()=>{let t=r?.map(e=>{let[t]=e.split(`:`);if(t===`root`)return{label:n?.root?.label||`Page`,selector:null};let r=i.getState().state.indexes.nodes[t],a=r.path[r.path.length-1],o=(i.getState().state.indexes.zones[a]?.contentIds||[]).indexOf(t);return{label:r?n.components[r.data.type]?.label??r.data.type:`Component`,selector:r?{index:o,zone:r.path[r.path.length-1]}:null}})||[];return e?t.slice(t.length-e):t},[r,e])},ay=a(`Breadcrumbs`,ry),oy=({children:e,numParents:t=1})=>{let n=P(e=>e.setUi),r=iy(t);return(0,I.jsxs)(`div`,{className:ay(),children:[r.map((e,t)=>(0,I.jsxs)(`div`,{className:ay(`breadcrumb`),children:[(0,I.jsx)(`button`,{type:`button`,className:ay(`breadcrumbLabel`),onClick:()=>n({itemSelector:e.selector}),children:e.label}),(0,I.jsx)(He,{size:16})]},t)),e]})};c(),c();var sy=a(`PuckFields`,{PuckFields:`_PuckFields_wnj25_1`,"PuckFields--isLoading":`_PuckFields--isLoading_wnj25_6`,"PuckFields-loadingOverlay":`_PuckFields-loadingOverlay_wnj25_10`,"PuckFields-loadingOverlayInner":`_PuckFields-loadingOverlayInner_wnj25_25`,"PuckFields-field":`_PuckFields-field_wnj25_32`,"PuckFields--wrapFields":`_PuckFields--wrapFields_wnj25_36`}),cy=({children:e})=>(0,I.jsx)(I.Fragment,{children:e}),ly=(t,n)=>(r,i)=>s(null,null,function*(){let{dispatch:a,state:s,selectedItem:c,resolveComponentData:l}=n.getState(),{data:u,ui:d}=s,{itemSelector:f}=d,p=u.root.props||u.root,m=e(o({},c?c.props:p),{[t]:r});if(c&&f){let t=yield l(e(o({},c),{props:m}),`replace`),r=__(n.getState().state,c.props.id);if(!r)return;a({type:`replace`,destinationIndex:r.index,destinationZone:r.zone||h,data:t.node,ui:i});return}if(u.root.props){a({type:`replaceRoot`,root:(yield l(e(o({},u.root),{props:m}),`replace`)).node,ui:o(o({},d),i),recordHistory:!0});return}a({type:`setData`,data:{root:m}})}),uy=({fieldName:e})=>{let t=P(t=>t.fields.fields[e]),n=P(t=>((t.selectedItem?t.selectedItem.readOnly:t.state.data.root.readOnly)||{})[e]),r=P(n=>t?n.selectedItem?`${n.selectedItem.props.id}_${t.type}_${e}`:`root_${t.type}_${e}`:null),i=P(On(e=>{let{selectedItem:t,permissions:n}=e;return t?n.getPermissions({item:t}):n.getPermissions({root:!0})})),a=Pe(),o=(0,F.useCallback)(ly(e,a),[e]),{visible:s=!0}=t??{},c=(0,F.useContext)(bh.ctx);return(0,F.useEffect)(()=>a.subscribe(t=>t.getCurrentData().props?.[e],t=>{c.setState({[e]:t})}),[a,c]),!t||!r||!s||t.type===`slot`?null:(0,I.jsx)(`div`,{className:sy(`field`),children:(0,I.jsx)(Fg,{field:t,name:e,id:r,readOnly:!i.edit||n,onChange:o})},r)},dy=(0,F.memo)(({fieldName:e})=>{let t=Pe(),n=(0,F.useMemo)(()=>{let n=t.getState().getCurrentData().props?.[e];return{[e]:n}},[]);return(0,I.jsx)(bh.Provider,{value:n,children:(0,I.jsx)(uy,{fieldName:e})})}),fy=(0,F.memo)(({wrapFields:e=!0})=>{let t=P(e=>e.overrides),n=P(e=>((e.selectedItem?e.componentState[e.selectedItem.props.id]?.loadingCount:e.componentState.root?.loadingCount)??0)>0),r=P(On(e=>e.state.ui.itemSelector)),i=P(e=>e.selectedItem?.props.id);Te(Pe(),i);let a=P(e=>e.fields.loading),o=P(On(e=>e.fields.id===i?Object.keys(e.fields.fields):[])),s=a||n,c=(0,F.useMemo)(()=>t.fields||cy,[t]);return(0,I.jsxs)(`form`,{className:sy({wrapFields:e}),onSubmit:e=>{e.preventDefault()},children:[(0,I.jsx)(c,{isLoading:s,itemSelector:r,children:o.map(e=>(0,I.jsx)(dy,{fieldName:e},e))}),s&&(0,I.jsx)(`div`,{className:sy(`loadingOverlay`),children:(0,I.jsx)(`div`,{className:sy(`loadingOverlayInner`),children:(0,I.jsx)(y,{size:16})})})]})});c();var py=a(`FieldsPlugin`,{FieldsPlugin:`_FieldsPlugin_18cj3_1`,"FieldsPlugin-header":`_FieldsPlugin-header_18cj3_7`}),my=()=>P(e=>{let t=e.selectedItem;return t?e.config.components[t.type]?.label??t.type:`Page`}),hy=({desktopSideBar:e=`right`}={})=>({name:`fields`,label:`Fields`,render:()=>(0,I.jsxs)(`div`,{className:py(),children:[(0,I.jsx)(`div`,{className:py(`header`),children:(0,I.jsx)(oy,{numParents:2,children:(0,I.jsx)(my,{})})}),(0,I.jsx)(fy,{})]}),icon:(0,I.jsx)(E,{}),mobileOnly:e===`right`});c(),c(),c(),c(),c();var gy=`@import "https://rsms.me/inter/inter.css";

/* styles/color.css */
@layer puck-tokens {
  :root {
    --puck-color-rose-01: #4a001c;
    --puck-color-rose-02: #670833;
    --puck-color-rose-03: #87114c;
    --puck-color-rose-04: #a81a66;
    --puck-color-rose-05: #bc5089;
    --puck-color-rose-06: #cc7ca5;
    --puck-color-rose-07: #d89aba;
    --puck-color-rose-08: #e3b8cf;
    --puck-color-rose-09: #efd6e3;
    --puck-color-rose-10: #f6eaf1;
    --puck-color-rose-11: #faf4f8;
    --puck-color-rose-12: #fef8fc;
    --puck-color-azure-01: #00175d;
    --puck-color-azure-02: #002c77;
    --puck-color-azure-03: #014292;
    --puck-color-azure-04: #0158ad;
    --puck-color-azure-05: #3479be;
    --puck-color-azure-06: #6499cf;
    --puck-color-azure-07: #88b0da;
    --puck-color-azure-08: #abc7e5;
    --puck-color-azure-09: #cfdff0;
    --puck-color-azure-10: #e7eef7;
    --puck-color-azure-11: #f3f6fb;
    --puck-color-azure-12: #f7faff;
    --puck-color-green-01: #002000;
    --puck-color-green-02: #043604;
    --puck-color-green-03: #084e08;
    --puck-color-green-04: #0c680c;
    --puck-color-green-05: #1d882f;
    --puck-color-green-06: #2faa53;
    --puck-color-green-07: #56c16f;
    --puck-color-green-08: #7dd78b;
    --puck-color-green-09: #b8e8bf;
    --puck-color-green-10: #ddf3e0;
    --puck-color-green-11: #eff8f0;
    --puck-color-green-12: #f3fcf4;
    --puck-color-yellow-01: #211000;
    --puck-color-yellow-02: #362700;
    --puck-color-yellow-03: #4c4000;
    --puck-color-yellow-04: #645a00;
    --puck-color-yellow-05: #877614;
    --puck-color-yellow-06: #ab9429;
    --puck-color-yellow-07: #bfac4e;
    --puck-color-yellow-08: #d4c474;
    --puck-color-yellow-09: #e6deb1;
    --puck-color-yellow-10: #f3efd9;
    --puck-color-yellow-11: #f9f7ed;
    --puck-color-yellow-12: #fcfaf0;
    --puck-color-red-01: #4c0000;
    --puck-color-red-02: #6a0a10;
    --puck-color-red-03: #8a1422;
    --puck-color-red-04: #ac1f35;
    --puck-color-red-05: #bf5366;
    --puck-color-red-06: #ce7e8e;
    --puck-color-red-07: #d99ca8;
    --puck-color-red-08: #e4b9c2;
    --puck-color-red-09: #efd7db;
    --puck-color-red-10: #f6eaec;
    --puck-color-red-11: #faf4f5;
    --puck-color-red-12: #fff9fa;
    --puck-color-grey-01: #181818;
    --puck-color-grey-02: #292929;
    --puck-color-grey-03: #404040;
    --puck-color-grey-04: #5a5a5a;
    --puck-color-grey-05: #767676;
    --puck-color-grey-06: #949494;
    --puck-color-grey-07: #ababab;
    --puck-color-grey-08: #c3c3c3;
    --puck-color-grey-09: #dcdcdc;
    --puck-color-grey-10: #efefef;
    --puck-color-grey-11: #f5f5f5;
    --puck-color-grey-12: #fafafa;
    --puck-color-black: #000000;
    --puck-color-white: #ffffff;
  }
}

/* styles/tokens.css */
@layer puck-tokens {
  :root {
    --puck-color-surface: var(--puck-color-white);
    --puck-color-surface-muted: var(--puck-color-grey-11);
    --puck-color-surface-subtle: var(--puck-color-grey-12);
    --puck-color-surface-inverse: var(--puck-color-grey-01);
    --puck-color-border: var(--puck-color-grey-09);
    --puck-color-border-hover: var(--puck-color-grey-05);
    --puck-color-border-muted: var(--puck-color-grey-10);
    --puck-color-border-inverse: var(--puck-color-grey-05);
    --puck-color-text: var(--puck-color-black);
    --puck-color-text-secondary: var(--puck-color-grey-04);
    --puck-color-text-muted: var(--puck-color-grey-05);
    --puck-color-text-subtle: var(--puck-color-grey-07);
    --puck-color-text-inverse: var(--puck-color-white);
    --puck-opacity-text-inverse: 0.75;
    --puck-color-interactive: var(--puck-color-azure-04);
    --puck-color-interactive-hover: var(--puck-color-azure-03);
    --puck-color-interactive-active: var(--puck-color-azure-02);
    --puck-color-interactive-subtle: var(--puck-color-azure-10);
    --puck-color-interactive-soft: var(--puck-color-azure-11);
    --puck-color-interactive-soft-hover: var(--puck-color-azure-12);
    --puck-color-interactive-neutral-hover: var(--puck-color-grey-10);
    --puck-color-interactive-inverse-hover: var(--puck-color-azure-06);
    --puck-color-interactive-inverse-active: var(--puck-color-azure-07);
    --puck-color-focus-ring: var(--puck-color-azure-05);
    --puck-color-selection-bg: color-mix( in srgb, var(--puck-color-azure-09) 30%, transparent );
    --puck-color-selection-border: var(--puck-color-azure-08);
    --puck-color-highlight: var(--puck-color-rose-07);
    --puck-color-bg-disabled: var(--puck-color-grey-07);
    --puck-color-text-disabled: var(--puck-color-grey-03);
    --puck-color-overlay-backdrop: color-mix( in srgb, var(--puck-color-black) 75%, transparent );
    --puck-space-1: 4px;
    --puck-space-2: 8px;
    --puck-space-3: 12px;
    --puck-space-4: 16px;
    --puck-space-5: 24px;
    --puck-space-chrome-gutter: var(--puck-space-4);
    --puck-radius-none: 0;
    --puck-radius-xs: 2px;
    --puck-radius-s: 3px;
    --puck-radius-m: 4px;
    --puck-radius-l: 8px;
    --puck-radius-pill: 30px;
    --puck-radius-round: 100%;
    --puck-border-width-hairline: 0.5px;
    --puck-border-width-regular: 1px;
    --puck-border-width-focus: 2px;
    --puck-border-width-strong: 4px;
    --puck-duration-fast: 50ms;
    --puck-duration-medium: 150ms;
    --puck-duration-slow: 250ms;
    --puck-ease-exit: ease-in;
    --puck-ease-emphasized: ease-in-out;
    --puck-ease-entrance: ease-out;
    --puck-font-weight-regular: 400;
    --puck-font-weight-medium: 500;
    --puck-font-weight-semibold: 600;
    --puck-font-weight-bold: 700;
    --puck-font-weight-heavy: 800;
    --puck-letter-spacing-ui: 0.05ch;
    --puck-letter-spacing-heading: 0.08ch;
    --puck-icon-size-s: 16px;
    --puck-icon-size-m: 18px;
    --puck-icon-size-l: 24px;
    --puck-space-m-unitless: 24;
    --puck-user-sidebar-left-width: var(--puck-sidebar-width);
    --puck-user-sidebar-right-width: var(--puck-sidebar-width);
    --puck-slot-min-empty-height: 128px;
  }
}

/* styles/typography.css */
@layer puck-tokens {
  :root {
    --puck-font-size-scale-base-unitless: 12;
    --puck-font-size-xxxs-unitless: 12;
    --puck-font-size-xxs-unitless: 14;
    --puck-font-size-xs-unitless: 16;
    --puck-font-size-s-unitless: 18;
    --puck-font-size-m-unitless: 21;
    --puck-font-size-l-unitless: 24;
    --puck-font-size-xl-unitless: 28;
    --puck-font-size-xxl-unitless: 36;
    --puck-font-size-xxxl-unitless: 48;
    --puck-font-size-xxxxl-unitless: 56;
    --puck-font-size-xxxs: calc( 1rem * var(--puck-font-size-xxxs-unitless) / 16 );
    --puck-font-size-xxs: calc(1rem * var(--puck-font-size-xxs-unitless) / 16);
    --puck-font-size-xs: calc(1rem * var(--puck-font-size-xs-unitless) / 16);
    --puck-font-size-s: calc(1rem * var(--puck-font-size-s-unitless) / 16);
    --puck-font-size-m: calc(1rem * var(--puck-font-size-m-unitless) / 16);
    --puck-font-size-l: calc(1rem * var(--puck-font-size-l-unitless) / 16);
    --puck-font-size-xl: calc(1rem * var(--puck-font-size-xl-unitless) / 16);
    --puck-font-size-xxl: calc(1rem * var(--puck-font-size-xxl-unitless) / 16);
    --puck-font-size-xxxl: calc( 1rem * var(--puck-font-size-xxxl-unitless) / 16 );
    --puck-font-size-xxxxl: calc( 1rem * var(--puck-font-size-xxxxl-unitless) / 16 );
    --puck-font-size-base: var(--puck-font-size-xs);
    --puck-line-height-reset: 1;
    --puck-line-height-xs: calc( var(--puck-space-m-unitless) / var(--puck-font-size-m-unitless) );
    --puck-line-height-s: calc( var(--puck-space-m-unitless) / var(--puck-font-size-s-unitless) );
    --puck-line-height-m: calc( var(--puck-space-m-unitless) / var(--puck-font-size-xs-unitless) );
    --puck-line-height-l: calc( var(--puck-space-m-unitless) / var(--puck-font-size-xxs-unitless) );
    --puck-line-height-xl: calc( var(--puck-space-m-unitless) / var(--puck-font-size-scale-base-unitless) );
    --puck-line-height-base: var(--puck-line-height-m);
    --puck-fallback-font-stack:
      -apple-system,
      BlinkMacSystemFont,
      Segoe UI,
      Helvetica Neue,
      sans-serif,
      Apple Color Emoji,
      Segoe UI Emoji,
      Segoe UI Symbol;
    --puck-font-family: Inter, var(--puck-fallback-font-stack);
    --puck-font-family-monospaced:
      ui-monospace,
      "Cascadia Code",
      "Source Code Pro",
      Menlo,
      Consolas,
      "DejaVu Sans Mono",
      monospace;
  }
  @supports (font-variation-settings: normal) {
    :root {
      --puck-font-family: InterVariable, var(--puck-fallback-font-stack);
    }
  }
}

/* bundle/core.css */
:root {
  --_puck-styles-loaded: "true";
}
#frame-root {
  height: 1px;
  min-height: 100vh;
}
[data-puck-entry] {
  position: relative;
  z-index: 0;
}

/* bundle/index.css */

/* css-module:/home/runner/work/puck/puck/packages/core/components/ActionBar/styles.module.css/#css-module-data */
._ActionBar_5vdfr_1 {
  align-items: center;
  cursor: default;
  display: flex;
  width: auto;
  padding-top: var(--puck-actionbar-space-y, var(--puck-space-1));
  padding-bottom: var(--puck-actionbar-space-y, var(--puck-space-1));
  padding-inline-start: var(--puck-actionbar-space-x, 0);
  padding-inline-end: var(--puck-actionbar-space-x, 0);
  border-radius: var(--puck-actionbar-radius, var(--puck-radius-l));
  background: var(--puck-actionbar-color-bg, var(--puck-color-surface-inverse));
  color: var(--puck-color-text-inverse);
  font-family: var(--puck-font-family);
  min-height: 26px;
}
._ActionBar-label_5vdfr_17 {
  color: var(--puck-actionbar-color-text, var(--puck-color-text-inverse));
  font-size: var(--puck-actionbar-font-size, var(--puck-font-size-xxxs));
  opacity: var(--puck-actionbar-opacity-text, var(--puck-opacity-text-inverse));
  font-weight: var(--puck-font-weight-medium);
  padding-inline-start: var(--puck-space-2);
  padding-inline-end: var(--puck-space-2);
  margin-inline-start: var(--puck-space-1);
  margin-inline-end: var(--puck-space-1);
  text-overflow: ellipsis;
  white-space: nowrap;
}
._ActionBarAction_5vdfr_30 + ._ActionBar-label_5vdfr_17 {
  padding-inline-start: 0;
}
._ActionBar-label_5vdfr_17 + ._ActionBarAction_5vdfr_30 {
  margin-inline-start: calc(var(--puck-space-1) * -1);
}
._ActionBar-group_5vdfr_38 {
  align-items: center;
  border-inline-start: var(--puck-border-width-hairline) solid var(--puck-actionbar-color-separator, var(--puck-color-border-inverse));
  display: flex;
  height: 100%;
  padding-inline-start: var(--puck-space-1);
  padding-inline-end: var(--puck-space-1);
}
._ActionBar-group_5vdfr_38:first-of-type {
  border-inline-start: 0;
}
._ActionBar-group_5vdfr_38:empty {
  display: none;
}
._ActionBarAction_5vdfr_30 {
  background: transparent;
  border: none;
  color: var(--puck-actionbar-color-text, var(--puck-color-text-inverse));
  cursor: pointer;
  padding: var(--puck-actionbar-action-space, 6px);
  margin-inline-start: var(--puck-space-1);
  margin-inline-end: var(--puck-space-1);
  border-radius: var(--puck-radius-m);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: var(--puck-actionbar-opacity-text, var(--puck-opacity-text-inverse));
  transition: color var(--puck-duration-fast) var(--puck-ease-exit), opacity var(--puck-duration-fast) var(--puck-ease-exit);
}
._ActionBarAction--disabled_5vdfr_74 {
  cursor: auto;
  color: var( --puck-actionbar-color-action-disabled, var(--puck-color-text-inverse) );
  opacity: var(--puck-actionbar-opacity-action-disabled, 0.54);
}
._ActionBarAction_5vdfr_30 svg {
  max-width: none !important;
}
._ActionBarAction_5vdfr_30:focus-visible {
  outline: var(--puck-border-width-focus) solid var(--puck-color-focus-ring);
  outline-offset: calc(var(--puck-border-width-focus) * -1);
}
@media (hover: hover) and (pointer: fine) {
  ._ActionBarAction_5vdfr_30:hover:not(._ActionBarAction--disabled_5vdfr_74) {
    color: var( --puck-actionbar-color-action-hover, var(--puck-color-interactive-inverse-hover) );
    opacity: 1;
    transition: none;
  }
}
._ActionBarAction_5vdfr_30:active:not(._ActionBarAction--disabled_5vdfr_74),
._ActionBarAction--active_5vdfr_104 {
  color: var( --puck-actionbar-color-action-active, var(--puck-color-interactive-inverse-active) );
  opacity: 1;
  transition: none;
}
._ActionBar-group_5vdfr_38 * {
  margin: 0;
}
._ActionBar-separator_5vdfr_117 {
  background: var( --puck-actionbar-color-separator, var(--puck-color-border-inverse) );
  margin-inline: var(--puck-space-1);
  width: var( --puck-border-width-hairline );
  height: 100%;
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/AutoField/styles.module.css/#css-module-data */
._InputWrapper_qyenz_1 + ._InputWrapper_qyenz_1 {
  margin-top: var(--puck-space-3);
}
._Input-label_qyenz_5 {
  align-items: center;
  color: var(--puck-field-label-color-text, var(--puck-color-text-secondary));
  display: flex;
  padding-bottom: var(--puck-field-label-space-y, var(--puck-space-3));
  font-size: var(--puck-field-label-font-size, var(--puck-font-size-xxs));
  font-weight: var( --puck-field-label-font-weight, var(--puck-font-weight-semibold) );
}
._Input-labelIcon_qyenz_17 {
  color: var(--puck-field-label-color-icon, var(--puck-color-text-subtle));
  display: flex;
  margin-inline-end: var(--puck-space-1);
  padding-inline-start: var(--puck-space-1);
}
._Input-disabledIcon_qyenz_24 {
  color: var(--puck-color-text-muted);
  margin-inline-start: auto;
}
._Input-input_qyenz_29 {
  background: var(--puck-field-color-bg, var(--puck-color-surface));
  border-width: var( --puck-field-border-width, var(--puck-border-width-regular) );
  border-style: solid;
  border-color: var(--puck-field-color-border, var(--puck-color-border));
  border-radius: var(--puck-field-radius, var(--puck-radius-m));
  box-sizing: border-box;
  color: var(--puck-field-color-text, var(--puck-color-text));
  font-family: inherit;
  font-size: var(--puck-font-size-xs);
  padding: var(--puck-field-space-y, var(--puck-space-3)) var( --puck-field-space-x, calc( var(--puck-space-4) - var(--puck-field-border-width, var(--puck-border-width-regular)) ) );
  transition: border-color var(--puck-duration-fast) var(--puck-ease-exit);
  width: 100%;
  max-width: 100%;
}
@media (min-width: 458px) {
  ._Input-input_qyenz_29 {
    font-size: var(--puck-field-font-size, var(--puck-font-size-xxs));
  }
}
._Input-select_qyenz_61 {
  position: relative;
  width: 100%;
}
select._Input-input_qyenz_29 {
  appearance: none;
  cursor: pointer;
}
._Input-selectIcon_qyenz_71 {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  fill: var(--puck-field-color-border, var(--puck-color-border));
  stroke-width: 0;
}
._Input-selectIcon_qyenz_71:dir(rtl) {
  right: auto;
  left: 12px;
}
@media (hover: hover) and (pointer: fine) {
  ._Input_qyenz_1:has(> input):hover ._Input-input_qyenz_29:not([readonly]),
  ._Input_qyenz_1:has(> textarea):hover ._Input-input_qyenz_29:not([readonly]) {
    border-color: var( --puck-field-color-border-hover, var(--puck-color-border-hover) );
    transition: none;
  }
  ._Input_qyenz_1:has(> ._Input-select_qyenz_61):hover ._Input-input_qyenz_29:not([disabled]) {
    color: var( --puck-field-color-text-hover, var(--puck-field-color-text, var(--puck-color-text)) );
    background-color: var( --puck-field-color-bg-hover, var(--puck-color-interactive-soft-hover) );
    border-color: var( --puck-field-color-border-hover, var(--puck-color-border-hover) );
    transition: none;
  }
  ._Input_qyenz_1:not(._Input--readOnly_qyenz_111):has(> ._Input-select_qyenz_61):hover ._Input-selectIcon_qyenz_71 {
    fill: var(--puck-field-color-border-hover, var(--puck-color-border-hover));
  }
}
._Input-input_qyenz_29:focus {
  border-color: var( --puck-field-color-border-hover, var(--puck-color-border-hover) );
  outline: var(--puck-border-width-focus) solid var(--puck-field-color-border-focus, var(--puck-color-focus-ring));
  transition: none;
}
._Input--readOnly_qyenz_111 > ._Input-input_qyenz_29,
._Input--readOnly_qyenz_111 > ._Input-select_qyenz_61 > select._Input-input_qyenz_29 {
  background-color: var( --puck-field-color-bg-disabled, var(--puck-color-surface-muted) );
  border-color: var( --puck-field-color-border-disabled, var(--puck-color-border) );
  color: var( --puck-field-color-text-disabled, var(--puck-color-text-secondary) );
  cursor: default;
  opacity: 1;
  outline: 0;
  transition: none;
}
._Input--readOnly_qyenz_111 > ._Input-select_qyenz_61 > select._Input-input_qyenz_29 ~ ._Input-selectIcon_qyenz_71 {
  fill: var(--puck-field-color-text-disabled, var(--puck-color-text-secondary));
}
._Input-radioGroupItems_qyenz_150 {
  --_puck-field-radio-radius: var(--puck-field-radius, var(--puck-radius-m));
  --_puck-field-radio-border-width: var( --puck-field-border-width, var(--puck-border-width-regular) );
  --_puck-field-radio-border-color: var( --puck-field-color-border, var(--puck-color-border) );
  display: flex;
  border: var(--_puck-field-radio-border-width) solid var(--_puck-field-radio-border-color);
  border-radius: var(--_puck-field-radio-radius);
  flex-wrap: wrap;
}
._Input-radio_qyenz_150 {
  border-inline-end: var(--_puck-field-radio-border-width) solid var(--_puck-field-radio-border-color);
  flex-grow: 1;
}
._Input-radio_qyenz_150:first-of-type {
  border-bottom-left-radius: var(--_puck-field-radio-radius);
  border-top-left-radius: var(--_puck-field-radio-radius);
}
._Input-radio_qyenz_150:first-of-type ._Input-radioInner_qyenz_179 {
  border-bottom-left-radius: calc(var(--_puck-field-radio-radius) - var(--_puck-field-radio-border-width));
  border-top-left-radius: calc(var(--_puck-field-radio-radius) - var(--_puck-field-radio-border-width));
}
._Input-radio_qyenz_150:last-of-type {
  border-bottom-right-radius: var(--_puck-field-radio-radius);
  border-inline-end: 0;
  border-top-right-radius: var(--_puck-field-radio-radius);
}
._Input-radio_qyenz_150:last-of-type ._Input-radioInner_qyenz_179 {
  border-bottom-right-radius: calc(var(--_puck-field-radio-radius) - var(--_puck-field-radio-border-width));
  border-top-right-radius: calc(var(--_puck-field-radio-radius) - var(--_puck-field-radio-border-width));
}
._Input-radioInner_qyenz_179 {
  background-color: var(--puck-field-color-bg, var(--puck-color-surface));
  color: var(--puck-field-color-text, var(--puck-color-text));
  cursor: pointer;
  font-size: var(--puck-field-font-size, var(--puck-font-size-xxs));
  padding: var(--puck-field-space-y, var(--puck-space-3)) var( --puck-field-space-x, calc(var(--puck-space-4) - var(--_puck-field-radio-border-width)) );
  text-align: center;
  transition: background-color var(--puck-duration-fast) var(--puck-ease-exit), color var(--puck-duration-fast) var(--puck-ease-exit);
}
._Input-radio_qyenz_150:has(:focus-visible) {
  outline: var(--puck-border-width-focus) solid var(--puck-field-color-border-focus, var(--puck-color-focus-ring));
  outline-offset: var(--puck-border-width-focus);
  position: relative;
}
@media (hover: hover) and (pointer: fine) {
  ._Input-radioInner_qyenz_179:hover {
    background-color: var( --puck-field-color-bg-hover, var(--puck-color-interactive-soft-hover) );
    color: var( --puck-field-color-text-hover, var(--puck-field-color-text, var(--puck-color-text)) );
    transition: none;
  }
}
._Input--readOnly_qyenz_111 ._Input-radioGroupItems_qyenz_150 {
  border-color: var( --puck-field-color-border-disabled, var(--puck-color-border) );
}
._Input--readOnly_qyenz_111 ._Input-radioInner_qyenz_179 {
  background-color: var(--puck-field-color-bg, var(--puck-color-surface));
  color: var(--puck-field-color-text, var(--puck-color-text-secondary));
  cursor: default;
}
._Input--readOnly_qyenz_111 ._Input-radio_qyenz_150 {
  border-inline-end: var(--_puck-field-radio-border-width) solid var(--puck-field-color-border-disabled, var(--puck-color-border));
}
._Input--readOnly_qyenz_111 ._Input-radio_qyenz_150:last-of-type {
  border-inline-end: 0;
}
._Input-radio_qyenz_150 ._Input-radioInput_qyenz_261:checked ~ ._Input-radioInner_qyenz_179 {
  background-color: var( --puck-field-color-bg-active, var(--puck-color-interactive-soft) );
  color: var(--puck-field-color-text-active, var(--puck-color-interactive));
  font-weight: var(--puck-font-weight-medium);
}
._Input--readOnly_qyenz_111 ._Input-radioInput_qyenz_261:checked ~ ._Input-radioInner_qyenz_179 {
  background-color: var( --puck-field-color-bg-disabled, var(--puck-color-surface-muted) );
  color: var( --puck-field-color-text-disabled, var(--puck-color-text-secondary) );
}
._Input-radio_qyenz_150 ._Input-radioInput_qyenz_261 {
  clip: rect(0 0 0 0);
  clip-path: inset(100%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}
textarea._Input-input_qyenz_29 {
  margin-bottom: calc(var(--puck-space-1) * -1);
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/AutoField/fields/ArrayField/styles.module.css/#css-module-data */
._ArrayField_62huh_5 {
  --_puck-field-array-border-color: var( --puck-field-color-border, var(--puck-color-border) );
  --_puck-field-array-border-width: var( --puck-field-border-width, var(--puck-border-width-regular) );
  --_puck-field-array-radius: var(--puck-field-radius, var(--puck-radius-m));
  --_puck-field-array-radius-inner: calc( var(--_puck-field-array-radius) - var(--_puck-field-array-border-width) );
  display: flex;
  flex-direction: column;
  background: var( --puck-field-color-bg-active, var(--puck-color-interactive-soft) );
  border: var(--_puck-field-array-border-width) solid var(--_puck-field-array-border-color);
  border-radius: var(--_puck-field-array-radius);
}
._ArrayField--isDraggingFrom_62huh_30 {
  background-color: var( --puck-field-color-bg-active, var(--puck-color-interactive-soft) );
  overflow: hidden;
}
._ArrayField-addButton_62huh_38 {
  background-color: var(--puck-field-color-bg, var(--puck-color-surface));
  border: none;
  border-radius: var(--_puck-field-array-radius-inner);
  display: flex;
  color: var(--puck-field-array-add-color-icon, var(--puck-color-interactive));
  justify-content: center;
  cursor: pointer;
  width: 100%;
  margin: 0;
  padding: calc(var(--puck-field-space-y, var(--puck-space-3)) + 2px) var( --puck-field-space-x, calc(var(--puck-space-4) - var(--_puck-field-array-border-width)) );
  text-align: left;
  transition: background-color var(--puck-duration-fast) var(--puck-ease-exit);
}
._ArrayField--hasItems_62huh_58 > ._ArrayField-addButton_62huh_38 {
  border-top: var(--_puck-field-array-border-width) solid var(--_puck-field-array-border-color);
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
._ArrayField-addButton_62huh_38:focus-visible {
  outline: var(--puck-border-width-focus) solid var(--puck-color-focus-ring);
  outline-offset: var(--puck-border-width-focus);
  position: relative;
}
@media (hover: hover) and (pointer: fine) {
  ._ArrayField_62huh_5:not(._ArrayField--isDraggingFrom_62huh_30) > ._ArrayField-addButton_62huh_38:hover {
    background: var( --puck-field-color-bg-hover, var(--puck-color-interactive-soft-hover) );
    color: var( --puck-field-color-text-hover, var(--puck-field-color-text, var(--puck-color-text)) );
    transition: none;
  }
}
._ArrayField_62huh_5:not(._ArrayField--isDraggingFrom_62huh_30) > ._ArrayField-addButton_62huh_38:active {
  background: var( --puck-field-color-bg-hover, var(--puck-color-interactive-soft-hover) );
  transition: none;
}
._ArrayField-inner_62huh_93 {
  margin-top: -1px;
}
._ArrayFieldItem_62huh_101 {
  display: block;
  position: relative;
  border-top-left-radius: var(--_puck-field-array-radius-inner);
  border-top-right-radius: var(--_puck-field-array-radius-inner);
  border-top: var(--_puck-field-array-border-width) solid var(--_puck-field-array-border-color);
}
._ArrayFieldItem--isDragging_62huh_110 {
  border-top: transparent;
}
._ArrayFieldItem--isExpanded_62huh_114::before {
  display: none;
}
._ArrayFieldItem--isExpanded_62huh_114 {
  border-bottom: 0;
  outline-offset: 0px !important;
  outline: var(--_puck-field-array-border-width) solid var(--puck-field-color-border-focus, var(--puck-color-focus-ring)) !important;
  z-index: 2;
}
._ArrayFieldItem--isDragging_62huh_110 {
  outline: var(--puck-border-width-focus) var(--puck-field-color-border-dragging, var(--puck-color-selection-border)) solid !important;
}
._ArrayFieldItem--isDragging_62huh_110 ._ArrayFieldItem-summary_62huh_132:active {
  background-color: var(--puck-field-color-bg, var(--puck-color-surface));
}
._ArrayFieldItem_62huh_101 + ._ArrayFieldItem_62huh_101 {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
._ArrayFieldItem-summary_62huh_132 {
  --_puck-drag-icon-color: var(--puck-field-color-text, var(--puck-color-text));
  --_puck-drag-icon-color-hover: var( --puck-field-color-text-hover, var(--puck-field-color-text, var(--puck-color-text)) );
  background: var(--puck-field-color-bg, var(--puck-color-surface));
  color: var(--puck-field-color-text, var(--puck-color-text));
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 2px;
  justify-content: space-between;
  font-size: var(--puck-field-font-size, var(--puck-font-size-xxs));
  list-style: none;
  padding: var(--puck-field-space-y, var(--puck-space-3)) var( --puck-field-space-x, calc(var(--puck-space-4) - var(--_puck-field-array-border-width)) );
  position: relative;
  overflow: hidden;
  transition: background-color var(--puck-duration-fast) var(--puck-ease-exit);
}
._ArrayFieldItem--noFields_62huh_167 > ._ArrayFieldItem-summary_62huh_132 {
  cursor: grab;
}
._ArrayFieldItem_62huh_101:first-of-type > ._ArrayFieldItem-summary_62huh_132 {
  border-top-left-radius: var(--_puck-field-array-radius-inner);
  border-top-right-radius: var(--_puck-field-array-radius-inner);
}
._ArrayField--addDisabled_62huh_176 > ._ArrayField-inner_62huh_93 > ._ArrayFieldItem_62huh_101:last-of-type:not(._ArrayFieldItem--isExpanded_62huh_114) > ._ArrayFieldItem-summary_62huh_132 {
  border-bottom-left-radius: var(--_puck-field-array-radius-inner);
  border-bottom-right-radius: var(--_puck-field-array-radius-inner);
}
._ArrayField--addDisabled_62huh_176 > ._ArrayField-inner_62huh_93 > ._ArrayFieldItem--isExpanded_62huh_114:last-of-type {
  border-bottom-left-radius: var(--_puck-field-array-radius-inner);
  border-bottom-right-radius: var(--_puck-field-array-radius-inner);
}
._ArrayFieldItem-summary_62huh_132:focus-visible {
  outline: var(--puck-border-width-focus) solid var(--puck-color-focus-ring);
  outline-offset: var(--puck-border-width-focus);
}
@media (hover: hover) and (pointer: fine) {
  ._ArrayFieldItem-summary_62huh_132:hover {
    background-color: var( --puck-field-color-bg-hover, var(--puck-color-interactive-soft-hover) );
    color: var( --puck-field-color-text-hover, var(--puck-field-color-text, var(--puck-color-text)) );
    transition: none;
  }
}
._ArrayFieldItem-summary_62huh_132:active {
  background-color: var( --puck-field-color-bg-hover, var(--puck-color-interactive-soft-hover) );
  transition: none;
}
._ArrayFieldItem--isExpanded_62huh_114 > ._ArrayFieldItem-summary_62huh_132 {
  background: var( --puck-field-color-bg-active, var(--puck-color-interactive-soft) );
  color: var(--puck-field-color-text-active, var(--puck-color-interactive));
  font-weight: var(--puck-font-weight-semibold);
  transition: none;
}
._ArrayFieldItem-body_62huh_228 {
  background: var(--puck-field-color-surface, var(--puck-color-surface));
  display: none;
}
._ArrayFieldItem--isExpanded_62huh_114 > ._ArrayFieldItem-body_62huh_228 {
  display: block;
}
._ArrayFieldItem-fieldset_62huh_237 {
  border: none;
  border-top: var(--_puck-field-array-border-width) solid var(--_puck-field-array-border-color);
  margin: 0;
  min-width: 0;
  padding: var(--puck-field-space-surface-y, var(--puck-space-4)) var( --puck-field-space-surface-x, calc(var(--puck-space-4) - var(--_puck-field-array-border-width)) );
}
._ArrayFieldItem-rhs_62huh_250 {
  display: flex;
  gap: var(--puck-space-1);
  align-items: center;
}
._ArrayFieldItem-actions_62huh_256 {
  color: var(--puck-color-text-secondary);
  display: flex;
  gap: var(--puck-space-1);
  opacity: 0;
}
._ArrayFieldItem-summary_62huh_132:focus-within > ._ArrayFieldItem-rhs_62huh_250 > ._ArrayFieldItem-actions_62huh_256,
._ArrayFieldItem-summary_62huh_132:hover > ._ArrayFieldItem-rhs_62huh_250 > ._ArrayFieldItem-actions_62huh_256 {
  opacity: 1;
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/IconButton/IconButton.module.css/#css-module-data */
._IconButton_yuha3_1 {
  align-items: center;
  background: var(--puck-iconbutton-color-bg, transparent);
  border: none;
  border-radius: var(--puck-iconbutton-radius, var(--puck-radius-m));
  color: var(--puck-iconbutton-color-icon, currentColor);
  display: flex;
  font-family: var(--puck-font-family);
  justify-content: center;
  padding: var(--puck-iconbutton-space, var(--puck-space-1));
  transition: background-color var(--puck-duration-fast) var(--puck-ease-exit), color var(--puck-duration-fast) var(--puck-ease-exit);
}
._IconButton--active_yuha3_15 {
  color: var( --puck-iconbutton-color-icon-active, var(--puck-color-interactive) );
}
._IconButton_yuha3_1:focus-visible {
  outline: var(--puck-border-width-focus) solid var(--puck-color-focus-ring);
  outline-offset: calc(var(--puck-border-width-focus) * -1);
}
@media (hover: hover) and (pointer: fine) {
  ._IconButton_yuha3_1:hover:not(._IconButton--disabled_yuha3_28) {
    background: var( --puck-iconbutton-color-bg-hover, var(--puck-color-interactive-neutral-hover) );
    color: var( --puck-iconbutton-color-icon-hover, var(--puck-color-interactive) );
    cursor: pointer;
    transition: none;
  }
}
._IconButton_yuha3_1:active {
  background: var( --puck-iconbutton-color-bg-active, var(--puck-color-interactive-soft) );
  transition: none;
}
._IconButton--disabled_yuha3_28 {
  color: var( --puck-iconbutton-color-icon-disabled, var(--puck-color-text-subtle) );
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/Loader/styles.module.css/#css-module-data */
@keyframes _loader-animation_1w5zn_1 {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(0.8);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}
._Loader_1w5zn_13 {
  background: transparent;
  border-radius: var(--puck-radius-round);
  border: var(--puck-border-width-focus) solid currentColor;
  border-bottom-color: transparent;
  display: inline-block;
  animation: _loader-animation_1w5zn_1 1s 0s infinite linear;
  animation-fill-mode: both;
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/DragIcon/styles.module.css/#css-module-data */
._DragIcon_5e515_1 {
  color: var(--_puck-drag-icon-color, var(--puck-color-text-muted));
  cursor: grab;
  padding: var(--puck-space-1);
  border-radius: var(--puck-radius-m);
}
._DragIcon--disabled_5e515_10 {
  cursor: no-drop;
}
@media (hover: hover) and (pointer: fine) {
  ._DragIcon_5e515_1:not(._DragIcon--disabled_5e515_10):hover {
    color: var(--_puck-drag-icon-color-hover, var(--puck-color-focus-ring));
  }
}

/* components/Sortable/styles.css */
[data-dnd-placeholder] * {
  opacity: 0 !important;
}
[data-dnd-placeholder] {
  background: var( --_puck-field-array-color-placeholder, var(--puck-color-azure-06) ) !important;
  border: none !important;
  color: transparent !important;
  opacity: 0.3 !important;
  outline: none !important;
  transition: none !important;
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/ExternalInput/styles.module.css/#css-module-data */
._ExternalInput-actions_143vl_1 {
  display: flex;
}
._ExternalInput-button_143vl_5 {
  display: flex;
  gap: var(--puck-space-2);
  align-items: center;
  justify-content: center;
  background-color: var(--puck-field-color-bg, var(--puck-color-surface));
  border: var(--puck-field-border-width, var(--puck-border-width-regular)) solid var(--puck-field-color-border, var(--puck-color-border));
  border-radius: var(--puck-field-radius, var(--puck-radius-m));
  color: var(--puck-field-color-text-active, var(--puck-color-interactive));
  padding: var(--puck-field-space-y, var(--puck-space-3)) var( --puck-field-space-x, calc( var(--puck-space-4) - var(--puck-field-border-width, var(--puck-border-width-regular)) ) );
  font-size: var(--puck-field-font-size, var(--puck-font-size-xxs));
  font-weight: var(--puck-font-weight-medium);
  white-space: nowrap;
  text-overflow: ellipsis;
  transition: background-color var(--puck-duration-fast) var(--puck-ease-exit);
  position: relative;
  overflow: hidden;
  flex-grow: 1;
  cursor: pointer;
}
._ExternalInput--dataSelected_143vl_34 ._ExternalInput-button_143vl_5 {
  color: var(--puck-field-color-text, var(--puck-color-text));
  display: block;
  border-top-right-radius: 0px;
  border-bottom-right-radius: 0px;
}
._ExternalInput--readOnly_143vl_41 ._ExternalInput-button_143vl_5 {
  background-color: var( --puck-field-color-bg-disabled, var(--puck-color-surface-muted) );
}
._ExternalInput-detachButton_143vl_48 {
  border: var(--puck-field-border-width, var(--puck-border-width-regular)) solid var(--puck-field-color-border, var(--puck-color-border));
  border-top-right-radius: var(--puck-field-radius, var(--puck-radius-m));
  border-bottom-right-radius: var(--puck-field-radius, var(--puck-radius-m));
  background-color: var( --puck-field-external-detach-color-bg, var(--puck-color-surface-subtle) );
  color: var( --puck-field-external-detach-color-text, var(--puck-color-text-muted) );
  display: flex;
  gap: var(--puck-space-2);
  align-items: center;
  justify-content: center;
  padding: var(--puck-space-2) var(--puck-space-3);
  position: relative;
  transition: background-color var(--puck-duration-fast) var(--puck-ease-exit), color var(--puck-duration-fast) var(--puck-ease-exit);
  margin-inline-start: -1px;
  cursor: pointer;
}
._ExternalInput-button_143vl_5:focus-visible,
._ExternalInput-detachButton_143vl_48:focus-visible {
  outline: var(--puck-border-width-focus) solid var(--puck-color-focus-ring);
  outline-offset: var(--puck-border-width-focus);
  z-index: 1;
}
@media (hover: hover) and (pointer: fine) {
  ._ExternalInput_143vl_1:not(._ExternalInput--readOnly_143vl_41) ._ExternalInput-button_143vl_5:hover,
  ._ExternalInput_143vl_1:not(._ExternalInput--readOnly_143vl_41) ._ExternalInput-detachButton_143vl_48:hover {
    background: var( --puck-field-color-bg-hover, var(--puck-color-interactive-soft-hover) );
    transition: none;
  }
  ._ExternalInput_143vl_1:not(._ExternalInput--readOnly_143vl_41) ._ExternalInput-detachButton_143vl_48:hover {
    color: var( --puck-field-color-text-hover, var(--puck-field-external-detach-color-text, var(--puck-color-text-muted)) );
  }
  ._ExternalInput--dataSelected_143vl_34:not(._ExternalInput--readOnly_143vl_41) ._ExternalInput-button_143vl_5:hover {
    color: var( --puck-field-color-text-hover, var(--puck-field-color-text, var(--puck-color-text)) );
  }
}
._ExternalInput_143vl_1:not(._ExternalInput--readOnly_143vl_41) ._ExternalInput-button_143vl_5:active,
._ExternalInput_143vl_1:not(._ExternalInput--readOnly_143vl_41) ._ExternalInput-detachButton_143vl_48:active {
  background: var( --puck-field-color-bg-hover, var(--puck-color-interactive-soft-hover) );
  transition: none;
}
._ExternalInputModal_143vl_118 {
  color: var(--puck-color-text);
  display: grid;
  grid-template-rows: min-content minmax(128px, 100%) min-content;
  grid-template-columns: 100%;
  position: relative;
  min-height: 50dvh;
  max-height: 90dvh;
}
._ExternalInputModal-grid_143vl_128 {
  display: flex;
  flex-direction: column;
}
@media (min-width: 458px) {
  ._ExternalInputModal-grid_143vl_128 {
    display: grid;
    grid-template-columns: 100%;
  }
  ._ExternalInputModal--filtersToggled_143vl_139 ._ExternalInputModal-grid_143vl_128 {
    grid-template-columns: 25% 75%;
  }
}
._ExternalInputModal-filters_143vl_144 {
  border-bottom: var(--puck-border-width-regular) solid var(--puck-color-border);
}
._ExternalInputModal--filtersToggled_143vl_139 ._ExternalInputModal-filters_143vl_144 {
  display: none;
}
@media (min-width: 458px) {
  ._ExternalInputModal-filters_143vl_144 {
    border-inline-end: var(--puck-border-width-regular) solid var(--puck-color-border);
    display: none;
  }
  ._ExternalInputModal--filtersToggled_143vl_139 ._ExternalInputModal-filters_143vl_144 {
    display: block;
  }
}
._ExternalInputModal-masthead_143vl_164 {
  background-color: var(--puck-color-surface-subtle);
  border-bottom: var(--puck-border-width-regular) solid var(--puck-color-border);
  display: flex;
  flex-wrap: wrap;
  gap: var(--puck-space-5);
  padding: var(--puck-space-5);
}
._ExternalInputModal-tableWrapper_143vl_173 {
  position: relative;
  overflow-x: auto;
  overflow-y: auto;
  flex-grow: 1;
}
._ExternalInputModal-table_143vl_173 {
  border-collapse: unset;
  border-spacing: 0px;
  color: var(--puck-color-text);
  position: relative;
  z-index: 0;
  min-width: 100%;
}
._ExternalInputModal-thead_143vl_189 {
  background-color: var(--puck-color-surface);
  position: sticky;
  top: 0;
  z-index: 1;
}
._ExternalInputModal-th_143vl_189 {
  border-bottom: var(--puck-border-width-regular) solid var(--puck-color-border);
  color: var(--puck-color-text-secondary);
  font-weight: var(--puck-font-weight-medium);
  font-size: var(--puck-font-size-xxs);
  padding: var(--puck-space-4) var(--puck-space-5);
}
._ExternalInputModal-td_143vl_204 {
  border-bottom: var(--puck-border-width-regular) solid var(--puck-color-border-muted);
  padding: var(--puck-space-4) var(--puck-space-5);
}
._ExternalInputModal-tr_143vl_210 ._ExternalInputModal-td_143vl_204:first-of-type {
  font-weight: var(--puck-font-weight-medium);
  width: 1%;
  white-space: nowrap;
}
@media (hover: hover) and (pointer: fine) {
  ._ExternalInputModal-tbody_143vl_217 ._ExternalInputModal-tr_143vl_210:hover {
    background: var(--puck-color-interactive-soft-hover);
    color: var(--puck-color-interactive);
    cursor: pointer;
    position: relative;
    margin-inline-start: -5px;
  }
  ._ExternalInputModal-tbody_143vl_217 ._ExternalInputModal-tr_143vl_210:hover ._ExternalInputModal-td_143vl_204:first-of-type {
    border-inline-start: var(--puck-border-width-strong) solid var(--puck-color-interactive);
    padding-inline-start: 20px;
  }
}
._ExternalInputModal-tbody_143vl_217 ._ExternalInputModal-tr_143vl_210:last-of-type ._ExternalInputModal-td_143vl_204 {
  border-bottom: none;
}
._ExternalInputModal-tableWrapper_143vl_173 {
  display: none;
}
._ExternalInputModal--hasData_143vl_244 ._ExternalInputModal-tableWrapper_143vl_173 {
  display: block;
}
._ExternalInputModal-loadingBanner_143vl_248 {
  display: none;
  background-color: color-mix(in srgb, var(--puck-color-surface) 90%, transparent);
  padding: 64px;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
._ExternalInputModal--isLoading_143vl_265 ._ExternalInputModal-loadingBanner_143vl_248 {
  display: flex;
}
._ExternalInputModal-searchForm_143vl_269 {
  display: flex;
  flex-wrap: wrap;
  gap: var(--puck-space-3);
  flex-grow: 1;
}
@media (min-width: 458px) {
  ._ExternalInputModal-searchForm_143vl_269 {
    flex-wrap: nowrap;
  }
}
._ExternalInputModal-search_143vl_269 {
  display: flex;
  background: var(--puck-color-surface);
  border-width: var(--puck-border-width-regular);
  border-style: solid;
  border-color: var(--puck-color-border);
  border-radius: var(--puck-radius-m);
  flex-grow: 1;
  transition: border-color var(--puck-duration-fast) var(--puck-ease-exit);
}
._ExternalInputModal-search_143vl_269:focus-within {
  border-color: var(--puck-color-border-hover);
  outline: var(--puck-border-width-focus) solid var(--puck-color-focus-ring);
  transition: none;
}
@media (hover: hover) and (pointer: fine) {
  ._ExternalInputModal-search_143vl_269:hover {
    border-color: var(--puck-color-border-hover);
    transition: none;
  }
}
._ExternalInputModal-searchIcon_143vl_306 {
  align-items: center;
  background: var(--puck-color-surface-subtle);
  border-bottom-left-radius: var(--puck-radius-m);
  border-top-left-radius: var(--puck-radius-m);
  border-inline-end: var(--puck-border-width-regular) solid var(--puck-color-border);
  color: var(--puck-color-text-subtle);
  display: flex;
  justify-content: center;
  padding: var(--puck-space-3) calc(var(--puck-space-4) - var(--puck-border-width-regular));
  transition: color var(--puck-duration-fast) var(--puck-ease-exit);
}
._ExternalInputModal-search_143vl_269:focus-within ._ExternalInputModal-searchIcon_143vl_306 {
  color: var(--puck-color-text-secondary);
  transition: none;
}
@media (hover: hover) and (pointer: fine) {
  ._ExternalInputModal-search_143vl_269:hover ._ExternalInputModal-searchIcon_143vl_306 {
    color: var(--puck-color-text-secondary);
    transition: none;
  }
}
._ExternalInputModal-searchIconText_143vl_333 {
  clip: rect(0 0 0 0);
  clip-path: inset(100%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}
._ExternalInputModal-searchInput_143vl_343 {
  border: none;
  border-radius: var(--puck-radius-m);
  background: var(--puck-color-surface);
  font-family: inherit;
  font-size: var(--puck-font-size-xxs);
  padding: var(--puck-space-3) calc(var(--puck-space-4) - var(--puck-border-width-regular));
  width: 100%;
}
._ExternalInputModal-searchInput_143vl_343:focus {
  outline: 0;
}
._ExternalInputModal-searchActions_143vl_358 {
  display: flex;
  gap: var(--puck-space-2);
  height: 44px;
  width: 100%;
}
@media (min-width: 458px) {
  ._ExternalInputModal-searchActions_143vl_358 {
    width: auto;
  }
}
._ExternalInputModal-searchActionIcon_143vl_371 {
  align-self: center;
}
._ExternalInputModal-footerContainer_143vl_375 {
  background-color: var(--puck-color-surface-subtle);
  border-top: var(--puck-border-width-regular) solid var(--puck-color-border);
  color: var(--puck-color-text-secondary);
  padding: var(--puck-space-4);
}
._ExternalInputModal-footer_143vl_375 {
  font-weight: var(--puck-font-weight-medium);
  font-size: var(--puck-font-size-xxs);
  text-align: right;
}
._ExternalInputModal-field_143vl_388 {
  color: var(--puck-color-text-secondary);
  margin: var(--puck-space-4);
  margin-bottom: var(--puck-space-3);
  display: block;
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/Modal/styles.module.css/#css-module-data */
._Modal_g5xob_1 {
  background: var(--puck-color-overlay-backdrop);
  display: none;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 1;
  padding: 32px;
}
._Modal--isOpen_g5xob_15 {
  display: flex;
}
._Modal-inner_g5xob_19 {
  width: 100%;
  max-width: 1024px;
  border-radius: var(--puck-radius-l);
  overflow: hidden;
  background: var(--puck-color-surface);
  display: flex;
  flex-direction: column;
  max-height: 90dvh;
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/Heading/styles.module.css/#css-module-data */
._Heading_97eh4_1 {
  display: block;
  color: var(--_puck-heading-color, var(--puck-color-text));
  font-weight: var(--puck-font-weight-bold);
  margin: 0;
}
._Heading_97eh4_1 b {
  font-weight: var(--puck-font-weight-bold);
}
._Heading--xxxxl_97eh4_12 {
  font-size: var(--puck-font-size-xxxxl);
  letter-spacing: var(--puck-letter-spacing-heading);
  font-weight: var(--puck-font-weight-heavy);
}
._Heading--xxxl_97eh4_18 {
  font-size: var(--puck-font-size-xxxl);
}
._Heading--xxl_97eh4_22 {
  font-size: var(--puck-font-size-xxl);
}
._Heading--xl_97eh4_26 {
  font-size: var(--puck-font-size-xl);
}
._Heading--l_97eh4_30 {
  font-size: var(--puck-font-size-l);
}
._Heading--m_97eh4_34 {
  font-size: var(--puck-font-size-m);
}
._Heading--s_97eh4_38 {
  font-size: var(--puck-font-size-s);
}
._Heading--xs_97eh4_42 {
  font-size: var(--puck-font-size-xs);
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/Button/Button.module.css/#css-module-data */
._Button_oe4qj_1 {
  --_puck-button-default-space-x: 20px;
  --_puck-button-default-font-size: var(--puck-font-size-xxs);
  --_puck-button-default-font-weight: var(--puck-font-weight-regular);
  --_puck-button-default-color-bg-disabled: var(--puck-color-bg-disabled);
  --_puck-button-default-color-text-disabled: var(--puck-color-text-disabled);
  appearance: none;
  background: none;
  border: var(--puck-border-width-regular) solid transparent;
  border-radius: var(--puck-button-radius, var(--puck-radius-m));
  color: var(--puck-color-text-inverse);
  display: inline-flex;
  align-items: center;
  gap: var(--puck-space-2);
  letter-spacing: var(--puck-letter-spacing-ui);
  font-family: var(--puck-font-family);
  box-sizing: border-box;
  line-height: 1;
  text-align: center;
  text-decoration: none;
  transition: background-color var(--puck-duration-fast) var(--puck-ease-exit), color var(--puck-duration-fast) var(--puck-ease-exit);
  cursor: pointer;
  white-space: nowrap;
  margin: 0;
}
._Button_oe4qj_1:hover,
._Button_oe4qj_1:active {
  transition: none;
}
._Button--medium_oe4qj_34 {
  min-height: 34px;
  padding-bottom: var( --puck-button-medium-space-y, calc(var(--puck-space-2) - var(--puck-border-width-regular)) );
  padding-inline-start: var( --puck-button-medium-space-x, calc(var(--_puck-button-default-space-x) - var(--puck-border-width-regular)) );
  padding-inline-end: var( --puck-button-medium-space-x, calc(var(--_puck-button-default-space-x) - var(--puck-border-width-regular)) );
  padding-top: var( --puck-button-medium-space-y, calc(var(--puck-space-2) - var(--puck-border-width-regular)) );
  font-weight: var( --puck-button-medium-font-weight, var(--_puck-button-default-font-weight) );
  font-size: var( --puck-button-medium-font-size, var(--_puck-button-default-font-size) );
}
._Button--large_oe4qj_62 {
  padding-bottom: var( --puck-button-large-space-y, calc(var(--puck-space-3) - var(--puck-border-width-regular)) );
  padding-inline-start: var( --puck-button-large-space-x, calc(var(--_puck-button-default-space-x) - var(--puck-border-width-regular)) );
  padding-inline-end: var( --puck-button-large-space-x, calc(var(--_puck-button-default-space-x) - var(--puck-border-width-regular)) );
  padding-top: var( --puck-button-large-space-y, calc(var(--puck-space-3) - var(--puck-border-width-regular)) );
  font-weight: var( --puck-button-large-font-weight, var(--_puck-button-default-font-weight) );
  font-size: var( --puck-button-large-font-size, var(--_puck-button-default-font-size) );
}
._Button-icon_oe4qj_89 {
  margin-top: 2px;
}
._Button--primary_oe4qj_93 {
  background: var( --puck-button-primary-color-bg, var(--puck-color-interactive) );
  border-color: var(--puck-button-primary-color-border, transparent);
  color: var(--puck-button-primary-color-text, var(--puck-color-text-inverse));
}
._Button_oe4qj_1:focus-visible {
  outline: var(--puck-border-width-focus) solid var(--puck-color-focus-ring);
  outline-offset: var(--puck-border-width-focus);
}
@media (hover: hover) and (pointer: fine) {
  ._Button--primary_oe4qj_93:hover {
    background-color: var( --puck-button-primary-color-bg-hover, var(--puck-color-interactive-hover) );
  }
}
._Button--primary_oe4qj_93:active {
  background-color: var( --puck-button-primary-color-bg-active, var(--puck-color-interactive-active) );
}
._Button--primary_oe4qj_93._Button--disabled_oe4qj_123,
._Button--primary_oe4qj_93._Button--disabled_oe4qj_123:hover {
  background-color: var( --puck-button-primary-color-bg-disabled, var(--_puck-button-default-color-bg-disabled) );
  color: var( --puck-button-primary-color-text-disabled, var(--_puck-button-default-color-text-disabled) );
}
._Button--secondary_oe4qj_135 {
  background: var(--puck-button-secondary-color-bg, transparent);
  border-color: var(--puck-button-secondary-color-border, currentColor);
  color: var(--puck-button-secondary-color-text, currentColor);
}
@media (hover: hover) and (pointer: fine) {
  ._Button--secondary_oe4qj_135:hover {
    background-color: var( --puck-button-secondary-color-bg-hover, var(--puck-color-interactive-soft) );
    color: var(--puck-button-secondary-color-text, var(--puck-color-text));
  }
}
._Button--secondary_oe4qj_135:active {
  background-color: var( --puck-button-secondary-color-bg-active, var(--puck-color-interactive-soft) );
  color: var(--puck-button-secondary-color-text, var(--puck-color-text));
}
._Button--secondary_oe4qj_135._Button--disabled_oe4qj_123,
._Button--secondary_oe4qj_135._Button--disabled_oe4qj_123:hover {
  background-color: var( --puck-button-secondary-color-bg-disabled, var(--_puck-button-default-color-bg-disabled) );
  color: var( --puck-button-secondary-color-text-disabled, var(--_puck-button-default-color-text-disabled) );
}
._Button--flush_oe4qj_171 {
  border-radius: var(--puck-radius-none);
}
._Button--disabled_oe4qj_123:hover {
  cursor: not-allowed;
}
._Button--fullWidth_oe4qj_179 {
  justify-content: center;
  width: 100%;
}
._Button-spinner_oe4qj_184 {
  padding-inline-start: var(--puck-space-2);
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/RichTextMenu/styles.module.css/#css-module-data */
._RichTextMenu_1ve2j_1 {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}
._RichTextMenu--form_1ve2j_7 {
  border-top-left-radius: var(--puck-field-radius, var(--puck-radius-m));
  border-top-right-radius: var(--puck-field-radius, var(--puck-radius-m));
  padding: var(--puck-field-richtext-menu-space-y, 6px) var(--puck-field-richtext-menu-space-x, 6px);
  background-color: var( --puck-field-richtext-menu-color-bg, var(--puck-color-surface-subtle) );
  position: relative;
  scrollbar-width: none;
  overflow-x: auto;
}
._RichTextMenu-group_1ve2j_21 {
  display: flex;
  align-items: space-between;
  flex-direction: row;
  flex-wrap: nowrap;
  padding-inline: 6px;
  gap: 2px;
  position: relative;
}
._RichTextMenu-group_1ve2j_21:first-of-type {
  padding-left: 0;
}
._RichTextMenu-group_1ve2j_21:last-of-type {
  padding-right: 0;
}
._RichTextMenu--inline_1ve2j_39 ._RichTextMenu-group_1ve2j_21 {
  color: var(--puck-color-text-inverse);
  gap: 0px;
  flex-wrap: nowrap;
}
._RichTextMenu-group_1ve2j_21 + ._RichTextMenu-group_1ve2j_21 {
  border-left: var(--puck-border-width-regular) solid var( --puck-field-richtext-menu-color-separator, var(--puck-color-border-muted) );
}
._RichTextMenu--inline_1ve2j_39 ._RichTextMenu-group_1ve2j_21 + ._RichTextMenu-group_1ve2j_21 {
  border-left: var(--puck-border-width-hairline) solid var(--puck-color-border-inverse);
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/RichTextMenu/components/Control/styles.module.css/#css-module-data */
._Control_id4pm_1 .lucide {
  height: var(--puck-icon-size-m);
  width: var(--puck-icon-size-m);
}
._Control--inline_id4pm_6 .lucide {
  height: var(--puck-actionbar-action-size, var(--puck-icon-size-s));
  width: var(--puck-actionbar-action-size, var(--puck-icon-size-s));
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/Select/styles.module.css/#css-module-data */
._Select_1n4iv_1 {
  position: relative;
  z-index: 1;
}
._Select-buttonInner_1n4iv_6 {
  align-items: center;
  display: flex;
}
._Select-buttonIcon_1n4iv_11 {
  align-items: center;
  display: flex;
  justify-content: center;
}
._Select--standalone_1n4iv_17 ._Select-buttonIcon_1n4iv_11 .lucide {
  height: var(--puck-icon-size-m);
  width: var(--puck-icon-size-m);
}
._Select--actionBar_1n4iv_22 ._Select-buttonIcon_1n4iv_11 .lucide {
  height: var(--puck-actionbar-action-size, var(--puck-icon-size-s));
  width: var(--puck-actionbar-action-size, var(--puck-icon-size-s));
}
._Select-items_1n4iv_27 {
  background: var(--puck-color-surface);
  border: var(--puck-border-width-regular) solid var(--puck-color-border);
  border-radius: var(--puck-radius-l);
  margin: 10px 8px;
  margin-left: 0;
  padding: var(--puck-space-1);
  z-index: 2;
  list-style: none;
}
._SelectItem_1n4iv_38 {
  background: transparent;
  border-radius: var(--puck-radius-m);
  border: none;
  color: var(--puck-color-text-secondary);
  cursor: pointer;
  display: flex;
  gap: var(--puck-space-2);
  align-items: center;
  font-size: var(--puck-font-size-xxs);
  margin: 0;
  padding: var(--puck-space-2) var(--puck-space-3);
  width: 100%;
}
._SelectItem--isSelected_1n4iv_53 {
  background: var(--puck-color-interactive-soft);
  color: var(--puck-color-interactive);
  font-weight: var(--puck-font-weight-medium);
}
._SelectItem--isSelected_1n4iv_53 ._SelectItem-icon_1n4iv_59 {
  color: var(--puck-color-interactive);
}
._SelectItem_1n4iv_38:hover {
  background: var(--puck-color-interactive-soft);
  color: var(--puck-color-interactive);
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/RichTextEditor/styles.module.css/#css-module-data */
._RichTextEditor_5wzos_1 .ProseMirror {
  white-space: pre-wrap;
  word-wrap: break-word;
  cursor: text;
  outline: none;
  position: relative;
}
._RichTextEditor_5wzos_1 .rich-text * {
  white-space: pre-wrap;
  user-select: auto;
  -webkit-user-select: auto;
}
._RichTextEditor_5wzos_1 .rich-text blockquote {
  margin: 1em 0;
  padding: 0 1em;
  border-left: var(--puck-border-width-strong) solid var(--puck-color-border);
}
._RichTextEditor_5wzos_1 .rich-text code {
  background-color: var(--puck-color-surface-muted);
  padding: var(--puck-space-1) var(--puck-space-2);
  border-radius: var(--puck-radius-m);
}
._RichTextEditor_5wzos_1 .rich-text p:empty::before {
  content: "\\a0";
}
._RichTextEditor_5wzos_1 .rich-text pre code {
  display: block;
  padding: var(--puck-space-2) var(--puck-space-3);
}
._RichTextEditor_5wzos_1 .rich-text > *:first-child,
._RichTextEditor_5wzos_1 .ProseMirror > *:first-child,
._RichTextEditor_5wzos_1 .rich-text * p:first-of-type {
  margin-top: 0;
}
._RichTextEditor_5wzos_1 .rich-text > *:last-child,
._RichTextEditor_5wzos_1 .ProseMirror > *:last-child,
._RichTextEditor_5wzos_1 .rich-text * p:last-of-type {
  margin-bottom: 0;
}
._RichTextEditor--editor_5wzos_50 {
  color: var(--puck-field-color-text, var(--puck-color-text));
  background: var(--puck-field-color-bg, var(--puck-color-surface));
  border-width: var( --puck-field-border-width, var(--puck-border-width-regular) );
  border-style: solid;
  border-color: var(--puck-field-color-border, var(--puck-color-border));
  border-radius: var(--puck-field-radius, var(--puck-radius-m));
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  font-family: inherit;
  font-size: var(--puck-field-font-size, var(--puck-font-size-xxs));
  resize: vertical;
  text-align: initial;
  transition: border-color var(--puck-duration-fast) var(--puck-ease-exit);
  width: 100%;
  max-width: 100%;
  min-height: 128px;
}
._RichTextEditor--editor_5wzos_50 .rich-text {
  flex-grow: 1;
}
._RichTextEditor--editor_5wzos_50 .rich-text:not(:has(.ProseMirror)),
._RichTextEditor--editor_5wzos_50 .rich-text .ProseMirror {
  height: 100%;
  padding: var(--puck-field-space-y, var(--puck-space-3)) var( --puck-field-space-x, calc( var(--puck-space-4) - var(--puck-field-border-width, var(--puck-border-width-regular)) ) );
}
._RichTextEditor--editor_5wzos_50 .rich-text ul,
._RichTextEditor--editor_5wzos_50 .rich-text ol {
  padding-left: var(--puck-space-5);
}
._RichTextEditor--editor_5wzos_50 .rich-text li {
  line-height: 1.5;
}
._RichTextEditor--editor_5wzos_50 .rich-text p {
  margin-block: var(--puck-space-3);
}
._RichTextEditor--editor_5wzos_50 .rich-text ul {
  list-style: disc;
}
._RichTextEditor--editor_5wzos_50 .rich-text ol {
  list-style: decimal;
}
._RichTextEditor--editor_5wzos_50:focus-within {
  border-color: var( --puck-field-color-border-hover, var(--puck-color-border-hover) );
  outline: var(--puck-border-width-focus) solid var(--puck-field-color-border-focus, var(--puck-color-focus-ring));
  transition: none;
}
@media (hover: hover) and (pointer: fine) {
  ._RichTextEditor--editor_5wzos_50:hover:not(._RichTextEditor--disabled_5wzos_123) {
    border-color: var( --puck-field-color-border-hover, var(--puck-color-border-hover) );
    transition: none;
  }
}
._RichTextEditor--editor_5wzos_50._RichTextEditor--disabled_5wzos_123 {
  background: var( --puck-field-color-bg-disabled, var(--puck-color-surface-muted) );
  border-color: var( --puck-field-color-border-disabled, var(--puck-color-border) );
}
._RichTextEditor--editor_5wzos_50._RichTextEditor--disabled_5wzos_123 .rich-text:not(:has(.ProseMirror)),
._RichTextEditor--editor_5wzos_50._RichTextEditor--disabled_5wzos_123 .rich-text .ProseMirror {
  color: var( --puck-field-color-text-disabled, var(--puck-color-text-secondary) );
}
._RichTextEditor--editor_5wzos_50._RichTextEditor--disabled_5wzos_123 .ProseMirror[contenteditable=false] {
  cursor: default;
}
._RichTextEditor_5wzos_1:not(:focus-within):not(._RichTextEditor--isActive_5wzos_159) .ProseMirror ::selection {
  background-color: transparent;
}
._RichTextEditor-menu_5wzos_165 {
  border-bottom: var(--puck-border-width-regular) solid var(--puck-color-border-muted);
  position: sticky;
  top: 0;
  z-index: 1;
}
._RichTextEditor--disabled_5wzos_123 ._RichTextEditor-menu_5wzos_165 {
  border-bottom: var(--puck-border-width-regular) solid var(--puck-color-border);
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/AutoField/fields/ObjectField/styles.module.css/#css-module-data */
._ObjectField_c5reb_1 {
  display: flex;
  flex-direction: column;
  background-color: var(--puck-field-color-surface, var(--puck-color-surface));
  border: var(--puck-field-border-width, var(--puck-border-width-regular)) solid var(--puck-field-color-border, var(--puck-color-border));
  border-radius: var(--puck-field-radius, var(--puck-radius-m));
}
._ObjectField-fieldset_c5reb_10 {
  border: none;
  margin: 0;
  min-width: 0;
  padding: var(--puck-field-space-surface-y, var(--puck-space-4)) var( --puck-field-space-surface-x, calc( var(--puck-space-4) - var(--puck-field-border-width, var(--puck-border-width-regular)) ) );
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/Drawer/styles.module.css/#css-module-data */
._Drawer_1n90m_1 {
  display: flex;
  flex-direction: column;
  font-family: var(--puck-font-family);
  gap: var(--puck-space-3);
}
._Drawer-draggable_1n90m_8 {
  position: relative;
}
._Drawer-draggableBg_1n90m_12 {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  pointer-events: none;
  z-index: -1;
}
._DrawerItem-draggable_1n90m_22 {
  background: var(--puck-drawer-item-color-bg, var(--puck-color-surface));
  color: var(--puck-drawer-item-color-text, var(--puck-color-text));
  cursor: grab;
  padding: var(--puck-drawer-item-space, var(--puck-space-3));
  display: flex;
  border: var(--puck-drawer-item-border-width, var(--puck-border-width-regular)) var(--puck-drawer-item-color-border, var(--puck-color-border)) solid;
  border-radius: var(--puck-drawer-item-radius, var(--puck-radius-m));
  font-size: var(--puck-drawer-item-font-size, var(--puck-font-size-xxs));
  justify-content: space-between;
  align-items: center;
  transition: background-color var(--puck-duration-fast) var(--puck-ease-exit), color var(--puck-duration-fast) var(--puck-ease-exit);
}
._DrawerItem--disabled_1n90m_38 ._DrawerItem-draggable_1n90m_22 {
  background: var(--puck-color-surface-muted);
  color: var(--puck-color-text-muted);
  cursor: not-allowed;
}
._DrawerItem_1n90m_22:focus-visible {
  outline: 0;
}
._Drawer_1n90m_1:not(._Drawer--isDraggingFrom_1n90m_48) ._DrawerItem_1n90m_22:focus-visible ._DrawerItem-draggable_1n90m_22 {
  border-radius: var(--puck-radius-m);
  outline: var(--puck-border-width-focus) solid var(--puck-color-focus-ring);
  outline-offset: var(--puck-border-width-focus);
}
@media (hover: hover) and (pointer: fine) {
  ._Drawer_1n90m_1:not(._Drawer--isDraggingFrom_1n90m_48) ._DrawerItem_1n90m_22:not(._DrawerItem--disabled_1n90m_38) ._DrawerItem-draggable_1n90m_22:hover {
    background-color: var( --puck-drawer-item-color-bg-hover, var(--puck-color-interactive-soft-hover) );
    color: var( --puck-drawer-item-color-text-hover, var(--puck-color-interactive) );
    transition: none;
  }
}
._DrawerItem-name_1n90m_72 {
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/DraggableComponent/styles.module.css/#css-module-data */
._DraggableComponent_1627v_1 {
  position: absolute;
  pointer-events: none;
}
._DraggableComponent-overlayWrapper_1627v_6 {
  height: 100%;
  width: 100%;
  top: 0;
  position: absolute;
  pointer-events: none;
  box-sizing: border-box;
  z-index: 1;
}
._DraggableComponent-overlay_1627v_6 {
  cursor: pointer;
  height: 100%;
  outline: var( --puck-slot-component-border-width, var(--puck-border-width-focus) ) var( --puck-slot-component-color-overlay-border, var(--puck-color-selection-border) ) solid;
  outline-offset: calc(var(--puck-slot-component-border-width, var(--puck-border-width-focus)) * -1);
  width: 100%;
}
._DraggableComponent_1627v_1:focus-visible > ._DraggableComponent-overlayWrapper_1627v_6 {
  outline: var(--puck-border-width-regular) solid var(--puck-color-focus-ring);
}
._DraggableComponent-loadingOverlay_1627v_38 {
  background: var(--puck-color-surface);
  color: var(--puck-color-text);
  border-radius: var(--puck-radius-m);
  display: flex;
  padding: var(--puck-space-2);
  top: var(--puck-space-2);
  right: var(--puck-space-2);
  position: absolute;
  z-index: 1;
  pointer-events: all;
  box-sizing: border-box;
  opacity: 0.8;
  z-index: 1;
}
._DraggableComponent--hover_1627v_54 > ._DraggableComponent-overlayWrapper_1627v_6 > ._DraggableComponent-overlay_1627v_6 {
  background: var( --puck-slot-component-color-overlay, var(--puck-color-selection-bg) );
  outline: var( --puck-slot-component-border-width, var(--puck-border-width-focus) ) var( --puck-slot-component-color-overlay-border, var(--puck-color-selection-border) ) solid;
}
._DraggableComponent--isSelected_1627v_72 > ._DraggableComponent-overlayWrapper_1627v_6 > ._DraggableComponent-overlay_1627v_6 {
  outline-color: var( --puck-slot-component-color-border-selected, var(--puck-color-selection-border) );
}
._DraggableComponent_1627v_1:has(._DraggableComponent--hover_1627v_54 > ._DraggableComponent-overlayWrapper_1627v_6) > ._DraggableComponent-overlayWrapper_1627v_6 {
  display: none;
}
._DraggableComponent-actionsOverlay_1627v_89 {
  position: sticky;
  opacity: 0;
  pointer-events: none;
  z-index: 2;
}
._DraggableComponent--isSelected_1627v_72 ._DraggableComponent-actionsOverlay_1627v_89 {
  opacity: 1;
  pointer-events: auto;
}
._DraggableComponent-actions_1627v_89 {
  position: absolute;
  width: auto;
  cursor: grab;
  display: flex;
  box-sizing: border-box;
  transform-origin: right top;
  min-height: 36px;
}
._DraggableComponent-actionsAction_1627v_111 {
  height: var(--puck-actionbar-action-size, var(--puck-icon-size-s));
  width: var(--puck-actionbar-action-size, var(--puck-icon-size-s));
}

/* components/DraggableComponent/styles.css */
[data-puck-component] * {
  pointer-events: none;
  user-select: none;
  -webkit-user-select: none;
}
[data-puck-component] {
  cursor: grab;
  pointer-events: auto !important;
  user-select: none;
  -webkit-user-select: none;
}
[data-puck-dropzone] {
  pointer-events: auto !important;
}
[data-puck-disabled] {
  cursor: pointer;
}
[data-dnd-placeholder] {
  background: var( --puck-slot-component-color-placeholder, var(--puck-color-azure-06) ) !important;
  border: none !important;
  color: transparent !important;
  opacity: 0.3 !important;
  outline: none !important;
  transition: none !important;
}
[data-dnd-placeholder] *,
[data-dnd-placeholder]::after,
[data-dnd-placeholder]::before {
  opacity: 0 !important;
}
[data-dnd-dragging][data-puck-component] {
  pointer-events: none !important;
  outline: var( --puck-slot-component-border-width, var(--puck-border-width-focus) ) var(--puck-slot-component-color-border-dragging, var(--puck-color-azure-09)) solid !important;
  outline-offset: calc(var(--puck-slot-component-border-width, var(--puck-border-width-focus)) * -1) !important;
}
[data-dnd-dragging][data-puck-component] > :first-child {
  margin-top: 0 !important;
}
[data-dnd-dragging][data-puck-component] > :last-child {
  margin-bottom: 0 !important;
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/DropZone/styles.module.css/#css-module-data */
._DropZone_ybznu_1 {
  position: relative;
  height: 100%;
  min-height: var(--puck-slot-min-empty-height);
  outline-offset: calc(var(--puck-slot-border-width, var(--puck-border-width-focus)) * -1);
  width: 100%;
}
._DropZone--hasChildren_ybznu_11 {
  min-height: 0;
}
._DropZone_ybznu_1:empty {
  min-height: var(--puck-slot-min-empty-height);
}
[data-puck-entry]:not([data-puck-dragging]) ._DropZone_ybznu_1 {
  transition: min-height var(--puck-duration-medium) var(--puck-ease-exit);
}
._DropZone--isAreaSelected_ybznu_24,
._DropZone--hoveringOverArea_ybznu_25:not(._DropZone--isRootZone_ybznu_25) {
  background: var(--puck-slot-color-bg, var(--puck-color-selection-bg));
  outline: var(--puck-slot-border-width, var(--puck-border-width-focus)) var(--puck-slot-border-style, dashed) var(--puck-slot-color-border, var(--puck-color-selection-border));
}
._DropZone_ybznu_1:empty {
  background: var(--puck-slot-color-bg, var(--puck-color-selection-bg));
  outline: var(--puck-slot-border-width, var(--puck-border-width-focus)) var(--puck-slot-border-style, dashed) var(--puck-slot-color-border, var(--puck-color-selection-border));
}
._DropZone-item_ybznu_39 {
  position: relative;
}
._DropZone-hitbox_ybznu_43 {
  position: absolute;
  bottom: calc(var(--puck-space-3) * -1);
  height: var(--puck-space-5);
  width: 100%;
  z-index: 1;
}
[data-puck-dragging] ._DropZone--isEnabled_ybznu_51 {
  outline: var(--puck-slot-border-width, var(--puck-border-width-focus)) var(--puck-slot-border-style, dashed) var(--puck-slot-color-border, var(--puck-color-selection-border));
}
._DropZone_ybznu_1 > *:not([data-puck-component]) {
  opacity: 0;
}
body:has(._DropZone--isAnimating_ybznu_62:empty) [data-puck-overlay] {
  opacity: 0 !important;
}

/* lib/overlay-portal/styles.css */
[data-puck-overlay-portal],
[data-puck-overlay-portal] * {
  pointer-events: auto !important;
}
[data-puck-entry][data-puck-preview-mode=edit] [data-puck-overlay-portal]:hover {
  outline: 2px var(--puck-color-azure-09, #cfdff0) dashed;
  outline-offset: 2px;
}
[data-puck-entry][data-puck-preview-mode=edit] [data-puck-overlay-portal]:focus-within {
  outline: 2px var(--puck-color-azure-07, #88b0da) dashed;
  outline-offset: 2px;
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/InlineTextField/styles.module.css/#css-module-data */
._InlineTextField_104qp_1 {
  cursor: text;
  display: inline-block;
  white-space: pre-wrap;
  text-decoration: inherit;
}
[data-dnd-dragging] ._InlineTextField_104qp_1 {
  cursor: none;
  caret-color: transparent;
}
[data-dnd-dragging] ._InlineTextField_104qp_1::selection {
  display: none;
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/Puck/components/Fields/styles.module.css/#css-module-data */
._PuckFields_wnj25_1 {
  position: relative;
  font-family: var(--puck-font-family);
}
._PuckFields--isLoading_wnj25_6 {
  min-height: 48px;
}
._PuckFields-loadingOverlay_wnj25_10 {
  background: var(--puck-color-surface);
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  height: 100%;
  width: 100%;
  top: 0px;
  position: absolute;
  z-index: 1;
  pointer-events: all;
  box-sizing: border-box;
  opacity: 0.8;
}
._PuckFields-loadingOverlayInner_wnj25_25 {
  display: flex;
  padding: var(--puck-space-4);
  position: sticky;
  top: 0;
}
._PuckFields-field_wnj25_32 * {
  box-sizing: border-box;
}
._PuckFields--wrapFields_wnj25_36 ._PuckFields-field_wnj25_32 {
  color: var(--puck-color-text-secondary);
  padding: var(--puck-space-4);
  padding-bottom: var(--puck-space-3);
  display: block;
}
._PuckFields--wrapFields_wnj25_36 ._PuckFields-field_wnj25_32 + ._PuckFields-field_wnj25_32 {
  border-top: var(--puck-border-width-regular) solid var(--puck-color-border);
  margin-top: var(--puck-space-2);
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/ComponentList/styles.module.css/#css-module-data */
._ComponentList_htktj_1 {
  max-width: 100%;
}
._ComponentList--isExpanded_htktj_5 + ._ComponentList_htktj_1 {
  margin-top: var(--puck-space-3);
}
._ComponentList-content_htktj_9 {
  display: none;
}
._ComponentList--isExpanded_htktj_5 > ._ComponentList-content_htktj_9 {
  display: block;
}
._ComponentList-title_htktj_17 {
  background-color: transparent;
  border: 0;
  color: var(--puck-drawer-category-color-text, var(--puck-color-text-muted));
  cursor: pointer;
  display: flex;
  font: inherit;
  font-size: var(--puck-drawer-category-font-size, var(--puck-font-size-xxxs));
  list-style: none;
  margin-bottom: 6px;
  padding: var(--puck-drawer-category-space, var(--puck-space-2));
  text-transform: uppercase;
  transition: background-color var(--puck-duration-fast) var(--puck-ease-exit), color var(--puck-duration-fast) var(--puck-ease-exit);
  gap: var(--puck-space-1);
  border-radius: var(--puck-radius-m);
  width: 100%;
}
._ComponentList-title_htktj_17:focus-visible {
  outline: var(--puck-border-width-focus) solid var(--puck-color-focus-ring);
  outline-offset: var(--puck-border-width-focus);
}
@media (hover: hover) and (pointer: fine) {
  ._ComponentList-title_htktj_17:hover {
    background-color: var( --puck-drawer-category-color-bg-hover, var(--puck-color-interactive-soft) );
    color: var( --puck-drawer-category-color-text-hover, var(--puck-color-interactive) );
    transition: none;
  }
}
._ComponentList-title_htktj_17:active {
  background-color: var( --puck-drawer-category-color-bg-active, var(--puck-color-interactive-subtle) );
  transition: none;
}
._ComponentList-titleIcon_htktj_63 {
  margin-inline-start: auto;
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/Puck/components/Preview/styles.module.css/#css-module-data */
._PuckPreview_z2rgu_1 {
  position: relative;
  height: 100%;
}
._PuckPreview-frame_z2rgu_6 {
  border: none;
  height: 100%;
  width: 100%;
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/LayerTree/styles.module.css/#css-module-data */
._LayerTree_1vltj_1 {
  color: var(--puck-outline-color-text, var(--puck-color-text-secondary));
  font-family: var(--puck-font-family);
  font-size: var(--puck-outline-font-size, var(--puck-font-size-xxs));
  margin: 0;
  position: relative;
  list-style: none;
  padding: 0;
}
._LayerTree-zoneTitle_1vltj_11 {
  color: var(--puck-outline-zone-color-text, var(--puck-color-text-muted));
  font-size: var(--puck-outline-zone-font-size, var(--puck-font-size-xxxs));
  text-transform: uppercase;
}
._LayerTree-helper_1vltj_17 {
  text-align: center;
  color: var(--puck-color-text-subtle);
  margin: var(--puck-space-2) var(--puck-space-1);
}
._Layer_1vltj_1 {
  position: relative;
  border: var(--puck-outline-border-width, var(--puck-border-width-regular)) solid transparent;
  border-radius: var(--puck-outline-radius, var(--puck-radius-m));
}
._Layer-inner_1vltj_30 {
  border: var(--puck-outline-border-width, var(--puck-border-width-regular)) solid transparent;
  border-radius: var(--puck-outline-radius, var(--puck-radius-m));
  transition: color var(--puck-duration-fast) var(--puck-ease-exit);
}
._Layer--containsZone_1vltj_37 > ._Layer-inner_1vltj_30 {
  padding-inline-start: 0;
}
._Layer-clickable_1vltj_41 {
  align-items: center;
  background: none;
  border: 0;
  border-radius: var(--puck-outline-radius, var(--puck-radius-m));
  color: inherit;
  cursor: pointer;
  display: flex;
  font: inherit;
  padding-inline-start: var(--puck-space-3);
  padding-inline-end: var(--puck-space-1);
  width: 100%;
}
._Layer-clickable_1vltj_41:focus-visible {
  outline: var(--puck-border-width-focus) solid var(--puck-color-focus-ring);
  outline-offset: var(--puck-border-width-focus);
  position: relative;
  z-index: 1;
}
@media (hover: hover) and (pointer: fine) {
  ._Layer_1vltj_1:not(._Layer--isSelected_1vltj_63) > ._Layer-inner_1vltj_30:hover {
    border-color: var( --puck-outline-color-border-hover, var(--puck-color-interactive-subtle) );
    background: var( --puck-outline-color-bg-hover, var(--puck-color-interactive-soft) );
    color: var(--puck-outline-color-text-hover, var(--puck-color-interactive));
    transition: none;
  }
}
._Layer--isSelected_1vltj_63 {
  border-color: var( --puck-outline-color-border-selected, var(--puck-color-selection-border) );
}
._Layer--isSelected_1vltj_63 > ._Layer-inner_1vltj_30 {
  background: var( --puck-outline-color-bg-selected, var(--puck-color-interactive-subtle) );
}
._Layer--isSelected_1vltj_63 > ._Layer-inner_1vltj_30 > ._Layer-clickable_1vltj_41 > ._Layer-chevron_1vltj_91,
._Layer--childIsSelected_1vltj_92 > ._Layer-inner_1vltj_30 > ._Layer-clickable_1vltj_41 > ._Layer-chevron_1vltj_91 {
  transform: scaleY(-1);
}
._Layer-zones_1vltj_96 {
  display: none;
  margin-inline-start: var(--puck-space-3);
}
._Layer--isSelected_1vltj_63 > ._Layer-zones_1vltj_96,
._Layer--childIsSelected_1vltj_92 > ._Layer-zones_1vltj_96 {
  display: block;
}
._Layer-zones_1vltj_96 > ._LayerTree_1vltj_1 {
  margin-inline-start: var(--puck-space-3);
}
._Layer-title_1vltj_110,
._LayerTree-zoneTitle_1vltj_11 {
  display: flex;
  gap: var(--puck-space-2);
  align-items: center;
  margin: var(--puck-space-2) var(--puck-space-1);
  overflow-x: hidden;
}
._Layer-name_1vltj_119 {
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
._Layer-icon_1vltj_125 {
  color: var(--puck-outline-color-icon, var(--puck-color-highlight));
  margin-top: var(--puck-space-1);
}
._Layer-zoneIcon_1vltj_130 {
  color: var(--puck-outline-zone-color-text, var(--puck-color-text-muted));
  margin-top: var(--puck-space-1);
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/Puck/components/Layout/styles.module.css/#css-module-data */
._Puck_mr27u_19 {
  font-family: var(--puck-font-family);
  overflow-x: hidden;
  visibility: visible !important;
}
@media (min-width: 766px) {
  ._Puck_mr27u_19 {
    overflow-x: auto;
  }
}
._Puck-portal_mr27u_31 {
  position: relative;
  z-index: 2;
}
._PuckLayout_mr27u_36 {
  height: 100dvh;
}
._PuckLayout-inner_mr27u_40 {
  --puck-frame-width: auto;
  --puck-pluginbar-width: min-content;
  --puck-sidebar-width: 0px;
  --puck-sidebar-left-width: var( --puck-user-sidebar-left-width, var(--puck-sidebar-width) );
  --puck-sidebar-right-width: var( --puck-user-sidebar-right-width, var(--puck-sidebar-width) );
  background-color: var(--puck-color-surface-subtle);
  display: grid;
  grid-template-areas: "header" "editor" "left" "right" "sidenav";
  grid-template-columns: var(--puck-frame-width);
  grid-template-rows: min-content auto 0 0 var(--puck-pluginbar-width);
  height: 100%;
  position: relative;
  transition: grid-template-rows var(--puck-duration-medium) var(--puck-ease-exit);
  z-index: 0;
  overflow: hidden;
}
@media (min-width: 638px) {
  ._PuckLayout-inner_mr27u_40 {
    --puck-pluginbar-width: 68px;
    grid-template-areas: "header header header header" "sidenav left editor right";
    grid-template-columns: var(--puck-pluginbar-width) 0 var(--puck-frame-width) 0;
    grid-template-rows: min-content auto;
  }
  ._Puck--hidePlugins_mr27u_73 ._PuckLayout-inner_mr27u_40 {
    --puck-pluginbar-width: 0;
  }
}
._PuckLayout--mounted_mr27u_78 ._PuckLayout-inner_mr27u_40 {
  --puck-sidebar-width: 186px;
}
._PuckLayout--mobilePanelHeightToggle_mr27u_82._PuckLayout--leftSideBarVisible_mr27u_82 ._PuckLayout-inner_mr27u_40 {
  grid-template-rows: 0 auto 30% 0 var(--puck-pluginbar-width);
  transition: grid-template-rows var(--puck-duration-medium) var(--puck-ease-entrance);
}
._PuckLayout--mobilePanelHeightToggle_mr27u_82._PuckLayout--leftSideBarVisible_mr27u_82._PuckLayout--isExpanded_mr27u_90 ._PuckLayout-inner_mr27u_40 {
  grid-template-rows: 0 auto 55% 0 var(--puck-pluginbar-width);
  transition: grid-template-rows var(--puck-duration-medium) var(--puck-ease-entrance);
}
@media (min-width: 638px) {
  ._PuckLayout--mobilePanelHeightToggle_mr27u_82._PuckLayout--leftSideBarVisible_mr27u_82 ._PuckLayout-inner_mr27u_40 {
    grid-template-columns: var(--puck-pluginbar-width) var(--puck-sidebar-left-width) var( --puck-frame-width ) 0;
    grid-template-rows: min-content auto;
  }
}
._PuckLayout--mobilePanelHeightMinContent_mr27u_110._PuckLayout--leftSideBarVisible_mr27u_82 ._PuckLayout-inner_mr27u_40,
._PuckLayout--mobilePanelHeightMinContent_mr27u_110._PuckLayout--leftSideBarVisible_mr27u_82._PuckLayout--isExpanded_mr27u_90 ._PuckLayout-inner_mr27u_40 {
  grid-template-rows: 0 auto min-content 0 var(--puck-pluginbar-width);
}
@media (min-width: 638px) {
  ._PuckLayout--mobilePanelHeightToggle_mr27u_82._PuckLayout--leftSideBarVisible_mr27u_82 ._PuckLayout-inner_mr27u_40,
  ._PuckLayout--mobilePanelHeightToggle_mr27u_82._PuckLayout--leftSideBarVisible_mr27u_82._PuckLayout--isExpanded_mr27u_90 ._PuckLayout-inner_mr27u_40,
  ._PuckLayout--mobilePanelHeightMinContent_mr27u_110._PuckLayout--leftSideBarVisible_mr27u_82 ._PuckLayout-inner_mr27u_40,
  ._PuckLayout--mobilePanelHeightMinContent_mr27u_110._PuckLayout--leftSideBarVisible_mr27u_82._PuckLayout--isExpanded_mr27u_90 ._PuckLayout-inner_mr27u_40 {
    grid-template-columns: var(--puck-pluginbar-width) var(--puck-sidebar-left-width) var( --puck-frame-width ) 0;
    grid-template-rows: min-content auto;
  }
}
@media (min-width: 638px) {
  ._PuckLayout--rightSideBarVisible_mr27u_137 ._PuckLayout-inner_mr27u_40 {
    grid-template-columns: var(--puck-pluginbar-width) 0 var(--puck-frame-width) var(--puck-sidebar-right-width);
  }
}
@media (min-width: 638px) {
  ._PuckLayout--leftSideBarVisible_mr27u_82._PuckLayout--rightSideBarVisible_mr27u_137 ._PuckLayout-inner_mr27u_40 {
    grid-template-columns: var(--puck-pluginbar-width) var(--puck-sidebar-left-width) var( --puck-frame-width ) var(--puck-sidebar-right-width);
  }
}
@media (min-width: 458px) {
  ._PuckLayout-mounted_mr27u_156 ._PuckLayout-inner_mr27u_40 {
    --puck-frame-width: minmax(266px, auto);
  }
}
@media (min-width: 638px) {
  ._PuckLayout_mr27u_36 ._PuckLayout-inner_mr27u_40 {
    --puck-sidebar-width: minmax(186px, 250px);
  }
}
@media (min-width: 766px) {
  ._PuckLayout_mr27u_36 ._PuckLayout-inner_mr27u_40 {
    --puck-frame-width: auto;
  }
}
@media (min-width: 990px) {
  ._PuckLayout_mr27u_36 ._PuckLayout-inner_mr27u_40 {
    --puck-sidebar-width: 256px;
  }
}
@media (min-width: 1198px) {
  ._PuckLayout_mr27u_36 ._PuckLayout-inner_mr27u_40 {
    --puck-sidebar-width: 274px;
  }
}
@media (min-width: 1398px) {
  ._PuckLayout_mr27u_36 ._PuckLayout-inner_mr27u_40 {
    --puck-sidebar-width: 290px;
  }
}
@media (min-width: 1598px) {
  ._PuckLayout_mr27u_36 ._PuckLayout-inner_mr27u_40 {
    --puck-sidebar-width: 320px;
  }
}
._PuckLayout-nav_mr27u_197 {
  border-top: var(--puck-border-width-regular) solid var(--puck-color-border);
  background-color: var( --puck-pluginbar-color-bg, var(--puck-color-surface-subtle) );
  grid-area: sidenav;
  overflow: hidden;
  width: 100%;
}
@media (min-width: 638px) {
  ._PuckLayout-nav_mr27u_197 {
    border-top: 0;
    border-right: var(--puck-border-width-regular) solid var(--puck-color-border);
    box-sizing: border-box;
  }
}
._PuckLayout-header_mr27u_217 {
  grid-area: header;
}
._PuckLayout--leftSideBarVisible_mr27u_82 ._PuckLayout-header_mr27u_217 {
  overflow: hidden;
}
@media (min-width: 638px) {
  ._PuckLayout--leftSideBarVisible_mr27u_82 ._PuckLayout-header_mr27u_217 {
    overflow: auto;
  }
}
._PuckPluginTab_mr27u_231 {
  display: none;
  flex-grow: 1;
  max-height: 100%;
}
._PuckPluginTab--visible_mr27u_237 {
  display: flex;
  flex-direction: column;
}
._PuckPluginTab-body_mr27u_242 {
  flex-grow: 1;
  max-height: 100%;
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/MenuBar/styles.module.css/#css-module-data */
._MenuBar_1hxnj_1 {
  background-color: var(--_puck-menu-bar-color-bg, var(--puck-color-surface));
  border-bottom: var(--puck-border-width-regular) solid var(--puck-color-border);
  display: none;
  left: 0;
  margin-top: 1px;
  padding: var(--puck-space-2) var(--puck-space-4);
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 2;
}
._MenuBar--menuOpen_1hxnj_14 {
  display: block;
}
@media (min-width: 638px) {
  ._MenuBar_1hxnj_1 {
    border: none;
    display: block;
    margin-top: 0;
    overflow-y: visible;
    padding: 0;
    position: static;
  }
}
._MenuBar-inner_1hxnj_29 {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--puck-space-2) var(--puck-space-4);
  justify-content: flex-end;
}
@media (min-width: 638px) {
  ._MenuBar-inner_1hxnj_29 {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
  }
}
._MenuBar-history_1hxnj_45 {
  display: flex;
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/Puck/components/Header/styles.module.css/#css-module-data */
._PuckHeader_c2nei_1 {
  --_puck-menu-bar-color-bg: var( --puck-header-color-bg, var(--puck-color-surface) );
  background: var(--puck-header-color-bg, var(--puck-color-surface));
  border-bottom: var(--puck-border-width-regular) solid var(--puck-color-border);
  color: var(--puck-header-color-text, var(--puck-color-text));
  --_puck-heading-color: var(--puck-header-color-text, var(--puck-color-text));
  grid-area: header;
  position: relative;
  max-width: 100vw;
}
@media (min-width: 638px) {
  ._PuckHeader_c2nei_1 {
    padding-left: 67px;
  }
  ._PuckHeader--hidePlugins_c2nei_21 {
    padding-left: 0;
  }
}
._PuckHeader-inner_c2nei_26 {
  align-items: end;
  display: grid;
  gap: var(--puck-space-chrome-gutter);
  grid-template-areas: "left middle right";
  grid-template-columns: 1fr auto 1fr;
  grid-template-rows: auto;
  padding: var(--puck-space-chrome-gutter);
}
@media (min-width: 638px) {
  ._PuckHeader-inner_c2nei_26 {
    border-left: var(--puck-border-width-regular) solid var(--puck-color-border);
  }
  ._PuckHeader--hidePlugins_c2nei_21 ._PuckHeader-inner_c2nei_26 {
    border-left: none;
  }
}
._PuckHeader-toggle_c2nei_46 {
  display: flex;
  margin-inline-start: calc(var(--puck-space-1) * -1);
  padding-top: 2px;
}
._PuckHeader-rightSideBarToggle_c2nei_52,
._PuckHeader-leftSideBarToggle_c2nei_53 {
  display: none;
}
@media (min-width: 638px) {
  ._PuckHeader-rightSideBarToggle_c2nei_52,
  ._PuckHeader-leftSideBarToggle_c2nei_53 {
    display: block;
  }
}
._PuckHeader-title_c2nei_64 {
  align-self: center;
}
._PuckHeader-path_c2nei_68 {
  font-family: var(--puck-font-family-monospaced);
  font-size: var(--puck-font-size-xxs);
  font-weight: normal;
  word-break: break-all;
}
._PuckHeader-tools_c2nei_75 {
  display: flex;
  gap: var(--puck-space-4);
  justify-content: flex-end;
}
._PuckHeader-menuButton_c2nei_81 {
  color: var(--puck-color-text-muted);
  margin-inline-start: calc(var(--puck-space-1) * -1);
}
._PuckHeader--menuOpen_c2nei_86 ._PuckHeader-menuButton_c2nei_81 {
  color: var(--puck-color-text);
}
@media (min-width: 638px) {
  ._PuckHeader-menuButton_c2nei_81 {
    display: none;
  }
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/SidebarSection/styles.module.css/#css-module-data */
._SidebarSection_1uv88_1 {
  display: flex;
  position: relative;
  flex-direction: column;
  color: var(--puck-color-text);
}
._SidebarSection_1uv88_1:last-of-type {
  flex-grow: 1;
}
._SidebarSection-title_1uv88_12 {
  background: var(--_puck-sidebar-section-color-bg, var(--puck-color-surface));
  padding: var(--puck-space-4);
  border-bottom: var(--puck-border-width-regular) solid var(--puck-color-border);
  border-top: var(--puck-border-width-regular) solid var(--puck-color-border);
  overflow-x: auto;
}
._SidebarSection--noBorderTop_1uv88_20 > ._SidebarSection-title_1uv88_12 {
  border-top: 0px;
}
._SidebarSection-content_1uv88_24:last-child {
  padding-bottom: var(--puck-space-1);
}
._SidebarSection_1uv88_1:last-of-type ._SidebarSection-content_1uv88_24 {
  border-bottom: none;
  flex-grow: 1;
}
._SidebarSection-breadcrumbLabel_1uv88_33 {
  background: none;
  border: 0;
  border-radius: var(--puck-radius-xs);
  color: var(--puck-color-interactive);
  cursor: pointer;
  font: inherit;
  flex-shrink: 0;
  padding: 0;
  transition: color var(--puck-duration-fast) var(--puck-ease-exit);
}
._SidebarSection-breadcrumbLabel_1uv88_33:focus-visible {
  outline: var(--puck-border-width-focus) solid var(--puck-color-focus-ring);
  outline-offset: var(--puck-border-width-focus);
}
@media (hover: hover) and (pointer: fine) {
  ._SidebarSection-breadcrumbLabel_1uv88_33:hover {
    color: var(--puck-color-interactive-hover);
    transition: none;
  }
}
._SidebarSection-breadcrumbLabel_1uv88_33:active {
  color: var(--puck-color-interactive-active);
  transition: none;
}
._SidebarSection-breadcrumbs_1uv88_62 {
  align-items: center;
  display: flex;
  gap: var(--puck-space-1);
}
._SidebarSection-breadcrumb_1uv88_33 {
  align-items: center;
  display: flex;
  gap: var(--puck-space-1);
}
._SidebarSection-heading_1uv88_74 {
  padding-inline-end: var(--puck-space-4);
}
._SidebarSection-loadingOverlay_1uv88_78 {
  background: var(--puck-color-surface);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  top: 0;
  position: absolute;
  z-index: 1;
  pointer-events: all;
  box-sizing: border-box;
  opacity: 0.8;
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/Breadcrumbs/styles.module.css/#css-module-data */
._Breadcrumbs_8c6w5_1 {
  align-items: center;
  display: flex;
  gap: var(--puck-space-1);
}
._Breadcrumbs-breadcrumbLabel_8c6w5_7 {
  background: none;
  border: 0;
  border-radius: var(--puck-radius-xs);
  color: var(--puck-color-interactive);
  cursor: pointer;
  font: inherit;
  flex-shrink: 0;
  padding: 0;
  transition: color var(--puck-duration-fast) var(--puck-ease-exit);
}
._Breadcrumbs-breadcrumbLabel_8c6w5_7:focus-visible {
  outline: var(--puck-border-width-focus) solid var(--puck-color-focus-ring);
  outline-offset: var(--puck-border-width-focus);
}
@media (hover: hover) and (pointer: fine) {
  ._Breadcrumbs-breadcrumbLabel_8c6w5_7:hover {
    color: var(--puck-color-interactive-hover);
    transition: none;
  }
}
._Breadcrumbs-breadcrumbLabel_8c6w5_7:active {
  color: var(--puck-color-interactive-active);
  transition: none;
}
._Breadcrumbs-breadcrumb_8c6w5_7 {
  align-items: center;
  display: flex;
  gap: var(--puck-space-1);
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/ViewportControls/styles.module.css/#css-module-data */
._ViewportControls_v26yb_1 {
  position: relative;
}
._ViewportControls--fullScreen_v26yb_5 {
  border-radius: 32px;
  display: flex;
  position: absolute;
  bottom: var(--puck-space-3);
  right: var(--puck-space-3);
  overflow: hidden;
}
._ViewportControls-toggleButton_v26yb_14 {
  display: none;
}
._ViewportControls--fullScreen_v26yb_5 ._ViewportControls-toggleButton_v26yb_14 {
  align-items: center;
  background-color: var(--puck-color-surface-inverse);
  border: var(--puck-border-width-regular) solid var(--puck-color-border-inverse);
  border-radius: var(--puck-radius-pill);
  cursor: pointer;
  color: var(--puck-color-text-inverse);
  display: flex;
  justify-content: center;
  width: 42px;
  height: 42px;
  z-index: 1;
}
._ViewportControls--fullScreen_v26yb_5 ._ViewportControls-toggleButton_v26yb_14:hover {
  color: var(--puck-color-interactive-inverse-hover);
  border: var(--puck-border-width-regular) solid var(--puck-color-interactive-inverse-hover);
}
._ViewportControls-actions_v26yb_39 {
  display: flex;
}
._ViewportControls-actionsInner_v26yb_43 {
  display: flex;
  box-sizing: border-box;
  justify-content: center;
  margin-left: auto;
  margin-right: auto;
  z-index: 0;
  overflow: hidden;
}
._ViewportControls--fullScreen_v26yb_5 ._ViewportControls-actionsInner_v26yb_43 {
  background: var(--puck-color-surface-muted);
  border: var(--puck-border-width-regular) solid var(--puck-color-border);
  border-radius: var(--puck-radius-pill);
  margin-left: none;
  margin-right: none;
  padding-right: 42px;
}
._ViewportControls--fullScreen_v26yb_5 ._ViewportControls-actionsInner_v26yb_43 {
  transform: translateX(100%);
  transition: transform var(--puck-duration-medium) var(--puck-ease-emphasized);
}
._ViewportControls--fullScreen_v26yb_5._ViewportControls--isExpanded_v26yb_67 ._ViewportControls-actionsInner_v26yb_43 {
  transform: translateX(42px);
}
._ViewportControls-divider_v26yb_72 {
  border-inline-end: var(--puck-border-width-regular) solid var(--puck-color-border);
  margin-bottom: var(--puck-space-2);
  margin-top: var(--puck-space-2);
}
._ViewportControls-zoomSelect_v26yb_79 {
  appearance: none;
  background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='%23c3c3c3'><polygon points='0,0 100,0 50,50'/></svg>") no-repeat;
  background-size: 10px;
  color: currentColor;
  background-position: calc(100% - 12px) calc(50% + 3px);
  background-repeat: no-repeat;
  border: 0;
  font-size: var(--puck-font-size-xxxs);
  padding: 0;
  padding-left: var(--puck-space-2);
  width: 96px;
}
._ViewportControls--fullScreen_v26yb_5 ._ViewportControls-zoom_v26yb_79 {
  display: none;
}
@media (min-width: 638px) {
  ._ViewportControls-zoom_v26yb_79,
  ._ViewportControls--fullScreen_v26yb_5 ._ViewportControls-zoom_v26yb_79 {
    display: flex;
    justify-content: center;
  }
}
._ViewportControls-zoomSelect_v26yb_79:dir(rtl) {
  background-position: 12px calc(50% + 3px);
}
._ViewportButton-inner_v26yb_110 {
  align-items: center;
  display: flex;
  justify-content: center;
  height: 32px;
  width: 32px;
}
._ViewportButton--isActive_v26yb_118 ._ViewportButton-inner_v26yb_110 {
  color: var(--puck-color-interactive);
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/Puck/components/Canvas/styles.module.css/#css-module-data */
._PuckCanvas_zw9iy_1 {
  color: var(--puck-canvas-color-text, var(--puck-color-text));
  background: var(--puck-canvas-color-bg, var(--puck-color-surface-muted));
  display: flex;
  grid-area: editor;
  flex-direction: column;
  padding: var(--puck-space-chrome-gutter);
  position: relative;
  overflow: auto;
}
@media (min-width: 1198px) {
  ._PuckCanvas_zw9iy_1 {
    padding: calc(var(--puck-space-chrome-gutter) * 1.5);
    padding-top: calc(var(--puck-space-chrome-gutter) * 0.5);
  }
  ._PuckCanvas_zw9iy_1:not(._PuckCanvas_zw9iy_1:has(._PuckCanvas-controls_zw9iy_18)) {
    padding-top: calc(var(--puck-space-chrome-gutter) * 1.5);
  }
}
._PuckCanvas--fullScreen_zw9iy_23 {
  padding: 0;
  overflow: hidden;
}
@media (min-width: 1198px) {
  ._PuckCanvas--fullScreen_zw9iy_23 {
    padding: 0;
  }
}
._PuckCanvas-inner_zw9iy_34 {
  display: flex;
  height: 100%;
  justify-content: center;
  min-width: 288px;
  position: relative;
  width: 100%;
}
._PuckCanvas-root_zw9iy_43 {
  background: var(--puck-canvas-preview-color-bg, var(--puck-color-surface));
  outline: var(--puck-border-width-regular) solid var(--puck-color-border);
  box-sizing: content-box;
  min-width: 321px;
  position: absolute;
  pointer-events: none;
  transform-origin: top;
  top: 0;
  bottom: 0;
  opacity: 0;
}
@media (min-width: 1198px) {
  ._PuckCanvas-root_zw9iy_43 {
    min-width: unset;
  }
}
@media (prefers-reduced-motion: reduce) {
  ._PuckCanvas-root_zw9iy_43 {
    transition: none !important;
  }
}
._PuckCanvas--ready_zw9iy_68 ._PuckCanvas-root_zw9iy_43 {
  pointer-events: unset;
  opacity: 1;
}
._PuckCanvas-loader_zw9iy_73 {
  align-items: center;
  color: var(--puck-color-text-subtle);
  display: flex;
  height: 100%;
  justify-content: center;
  transition: opacity var(--puck-duration-slow) var(--puck-ease-entrance);
  opacity: 0;
  pointer-events: none;
}
._PuckCanvas--showLoader_zw9iy_84 ._PuckCanvas-loader_zw9iy_73 {
  opacity: 1;
}
._PuckCanvas--showLoader_zw9iy_84._PuckCanvas--ready_zw9iy_68 ._PuckCanvas-loader_zw9iy_73 {
  opacity: 0;
  height: 0;
  transition: none;
}
._PuckCanvas-controls_zw9iy_18 {
  padding-bottom: calc(var(--puck-space-chrome-gutter) * 0.5);
}
._PuckCanvas--fullScreen_zw9iy_23 ._PuckCanvas-controls_zw9iy_18 {
  padding-bottom: 0;
  z-index: 1;
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/Puck/components/ResizeHandle/styles.module.css/#css-module-data */
@media (min-width: 766px) {
  ._ResizeHandle_144bf_2 {
    position: absolute;
    width: 5px;
    height: 100%;
    cursor: col-resize;
    z-index: 10;
    background: transparent;
    top: 0;
  }
  ._ResizeHandle_144bf_2:hover {
    background: rgba(0, 0, 0, 0.1);
  }
  ._ResizeHandle--left_144bf_16 {
    right: -3px;
  }
  ._ResizeHandle--right_144bf_20 {
    left: -3px;
  }
}

/* components/Puck/components/ResizeHandle/styles.css */
[data-resize-overlay] {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  cursor: col-resize;
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/Puck/components/Sidebar/styles.module.css/#css-module-data */
._Sidebar_16oed_1 {
  border-block-start: var(--puck-border-width-regular) solid var(--puck-color-border);
  position: relative;
  display: none;
  flex-direction: column;
  overflow-y: auto;
}
._Sidebar--isVisible_16oed_10 {
  display: flex;
}
._Sidebar--left_16oed_14 {
  --_puck-sidebar-section-color-bg: var( --puck-sidebar-left-color-bg, var(--puck-color-surface) );
  background: var( --puck-sidebar-left-color-bg, var(--puck-color-surface-subtle) );
  grid-area: left;
}
@media (min-width: 766px) {
  ._Sidebar--left_16oed_14 {
    border-block-start: 0;
    border-inline-end: var(--puck-border-width-regular) solid var(--puck-color-border);
  }
}
._Sidebar--right_16oed_34 {
  --_puck-sidebar-section-color-bg: var( --puck-sidebar-right-color-bg, var(--puck-color-surface) );
  background: var(--puck-sidebar-right-color-bg, var(--puck-color-surface));
  grid-area: right;
}
@media (min-width: 766px) {
  ._Sidebar--right_16oed_34 {
    border-block-start: 0;
    border-inline-start: var(--puck-border-width-regular) solid var(--puck-color-border);
  }
}
._Sidebar-resizeHandle_16oed_51 {
  position: absolute;
  height: 100%;
}
._Sidebar--left_16oed_14 + ._Sidebar-resizeHandle_16oed_51 {
  grid-area: left;
  justify-self: end;
}
._Sidebar--right_16oed_34 + ._Sidebar-resizeHandle_16oed_51 {
  grid-area: right;
  justify-self: start;
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/Puck/components/Nav/styles.module.css/#css-module-data */
._Nav_vll2r_1 {
  display: flex;
}
._Nav-list_vll2r_5 {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-x: auto;
  gap: var(--puck-space-2);
}
@media (min-width: 638px) {
  ._Nav-list_vll2r_5 {
    padding-top: 32px;
    flex-direction: column;
    gap: var(--puck-space-4);
    width: 100%;
  }
}
._Nav-mobileActions_vll2r_23 {
  align-items: center;
  display: flex;
  justify-content: center;
  margin-inline-start: auto;
  padding: var(--puck-space-1) var(--puck-space-4);
  border-inline-start: var(--puck-border-width-regular) solid var(--puck-color-border);
}
@media (min-width: 638px) {
  ._Nav-mobileActions_vll2r_23 {
    display: none;
  }
}
._NavItem-link_vll2r_39 {
  text-align: center;
  align-items: center;
  color: var(--puck-pluginbar-color-text, var(--puck-color-text-secondary));
  display: flex;
  gap: var(--puck-space-2);
  text-decoration: none;
  cursor: pointer;
  border-radius: var(--puck-radius-m);
  padding: var(--puck-space-2) var(--puck-space-1);
  width: 64px;
  box-sizing: border-box;
}
@media (min-width: 638px) {
  ._NavItem-link_vll2r_39 {
    width: auto;
  }
}
._NavItem_vll2r_39:first-of-type {
  padding-left: var(--puck-space-4);
}
._NavItem_vll2r_39:last-of-type {
  padding-right: var(--puck-space-4);
}
@media (min-width: 638px) {
  ._NavItem_vll2r_39:first-of-type,
  ._NavItem_vll2r_39:last-of-type {
    padding: 0;
  }
}
._NavItem-link_vll2r_39 {
  border-top: var(--puck-border-width-strong) solid transparent;
  border-bottom: var(--puck-border-width-strong) solid transparent;
  border-radius: var(--puck-radius-none);
  flex-direction: column;
  font-size: var(--puck-pluginbar-font-size, var(--puck-font-size-xxxs));
}
@media (min-width: 638px) {
  ._NavItem-link_vll2r_39 {
    border: 0;
    border-left: var(--puck-border-width-strong) solid transparent;
    border-right: var(--puck-border-width-strong) solid transparent;
  }
}
._NavItem-linkIcon_vll2r_90 {
  height: 2em;
  width: 2em;
}
._NavItem-linkIcon_vll2r_90 svg {
  height: 100%;
  width: 100%;
}
._NavItem--active_vll2r_100 > ._NavItem-link_vll2r_39 {
  background-color: var(--puck-color-interactive-subtle);
  color: var( --puck-pluginbar-color-text-selected, var(--puck-color-interactive) );
  font-weight: var(--puck-font-weight-semibold);
}
._NavItem--active_vll2r_100 > ._NavItem-link_vll2r_39 {
  background-color: transparent;
  border-top-color: var(--puck-color-interactive);
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  font-weight: var(--puck-font-weight-semibold);
}
@media (min-width: 638px) {
  ._NavItem--active_vll2r_100 > ._NavItem-link_vll2r_39 {
    border-top-color: transparent;
    border-right-color: var( --puck-pluginbar-color-text-selected, var(--puck-color-interactive) );
  }
}
._NavItem_vll2r_39:not(._NavItem--active_vll2r_100) > ._NavItem-link_vll2r_39:hover {
  background-color: var( --puck-pluginbar-color-bg-hover, var(--puck-color-interactive-soft) );
  color: var(--puck-pluginbar-color-text-hover, var(--puck-color-interactive));
}
@media (min-width: 638px) {
  ._NavItem--mobileOnly_vll2r_136 {
    display: none;
  }
}
._NavItem--desktopOnly_vll2r_141 {
  display: none;
}
@media (min-width: 638px) {
  ._NavItem--desktopOnly_vll2r_141 {
    display: block;
  }
}

/* css-module:/home/runner/work/puck/puck/packages/core/plugins/blocks/styles.module.css/#css-module-data */
._BlocksPlugin_9af19_1 {
  padding: var(--puck-drawer-space, var(--puck-space-4));
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
}

/* css-module:/home/runner/work/puck/puck/packages/core/plugins/outline/styles.module.css/#css-module-data */
._OutlinePlugin_16k03_1 {
  padding: var(--puck-space-4);
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
}

/* css-module:/home/runner/work/puck/puck/packages/core/plugins/fields/styles.module.css/#css-module-data */
._FieldsPlugin_18cj3_1 {
  background: var(--puck-color-surface);
  height: 100%;
  overflow-y: auto;
}
._FieldsPlugin-header_18cj3_7 {
  border-bottom: var(--puck-border-width-regular) solid var(--puck-color-border);
  font-weight: var(--puck-font-weight-semibold);
  padding-bottom: var(--puck-space-2);
  padding-left: var(--puck-space-4);
  padding-right: var(--puck-space-4);
  padding-top: var(--puck-space-2);
}
@media (min-width: 638px) {
  ._FieldsPlugin-header_18cj3_7 {
    padding: var(--puck-space-4);
  }
}`,_y=`/* styles/color.css */
@layer puck-tokens {
  :root {
    --puck-color-rose-01: #4a001c;
    --puck-color-rose-02: #670833;
    --puck-color-rose-03: #87114c;
    --puck-color-rose-04: #a81a66;
    --puck-color-rose-05: #bc5089;
    --puck-color-rose-06: #cc7ca5;
    --puck-color-rose-07: #d89aba;
    --puck-color-rose-08: #e3b8cf;
    --puck-color-rose-09: #efd6e3;
    --puck-color-rose-10: #f6eaf1;
    --puck-color-rose-11: #faf4f8;
    --puck-color-rose-12: #fef8fc;
    --puck-color-azure-01: #00175d;
    --puck-color-azure-02: #002c77;
    --puck-color-azure-03: #014292;
    --puck-color-azure-04: #0158ad;
    --puck-color-azure-05: #3479be;
    --puck-color-azure-06: #6499cf;
    --puck-color-azure-07: #88b0da;
    --puck-color-azure-08: #abc7e5;
    --puck-color-azure-09: #cfdff0;
    --puck-color-azure-10: #e7eef7;
    --puck-color-azure-11: #f3f6fb;
    --puck-color-azure-12: #f7faff;
    --puck-color-green-01: #002000;
    --puck-color-green-02: #043604;
    --puck-color-green-03: #084e08;
    --puck-color-green-04: #0c680c;
    --puck-color-green-05: #1d882f;
    --puck-color-green-06: #2faa53;
    --puck-color-green-07: #56c16f;
    --puck-color-green-08: #7dd78b;
    --puck-color-green-09: #b8e8bf;
    --puck-color-green-10: #ddf3e0;
    --puck-color-green-11: #eff8f0;
    --puck-color-green-12: #f3fcf4;
    --puck-color-yellow-01: #211000;
    --puck-color-yellow-02: #362700;
    --puck-color-yellow-03: #4c4000;
    --puck-color-yellow-04: #645a00;
    --puck-color-yellow-05: #877614;
    --puck-color-yellow-06: #ab9429;
    --puck-color-yellow-07: #bfac4e;
    --puck-color-yellow-08: #d4c474;
    --puck-color-yellow-09: #e6deb1;
    --puck-color-yellow-10: #f3efd9;
    --puck-color-yellow-11: #f9f7ed;
    --puck-color-yellow-12: #fcfaf0;
    --puck-color-red-01: #4c0000;
    --puck-color-red-02: #6a0a10;
    --puck-color-red-03: #8a1422;
    --puck-color-red-04: #ac1f35;
    --puck-color-red-05: #bf5366;
    --puck-color-red-06: #ce7e8e;
    --puck-color-red-07: #d99ca8;
    --puck-color-red-08: #e4b9c2;
    --puck-color-red-09: #efd7db;
    --puck-color-red-10: #f6eaec;
    --puck-color-red-11: #faf4f5;
    --puck-color-red-12: #fff9fa;
    --puck-color-grey-01: #181818;
    --puck-color-grey-02: #292929;
    --puck-color-grey-03: #404040;
    --puck-color-grey-04: #5a5a5a;
    --puck-color-grey-05: #767676;
    --puck-color-grey-06: #949494;
    --puck-color-grey-07: #ababab;
    --puck-color-grey-08: #c3c3c3;
    --puck-color-grey-09: #dcdcdc;
    --puck-color-grey-10: #efefef;
    --puck-color-grey-11: #f5f5f5;
    --puck-color-grey-12: #fafafa;
    --puck-color-black: #000000;
    --puck-color-white: #ffffff;
  }
}

/* styles/tokens.css */
@layer puck-tokens {
  :root {
    --puck-color-surface: var(--puck-color-white);
    --puck-color-surface-muted: var(--puck-color-grey-11);
    --puck-color-surface-subtle: var(--puck-color-grey-12);
    --puck-color-surface-inverse: var(--puck-color-grey-01);
    --puck-color-border: var(--puck-color-grey-09);
    --puck-color-border-hover: var(--puck-color-grey-05);
    --puck-color-border-muted: var(--puck-color-grey-10);
    --puck-color-border-inverse: var(--puck-color-grey-05);
    --puck-color-text: var(--puck-color-black);
    --puck-color-text-secondary: var(--puck-color-grey-04);
    --puck-color-text-muted: var(--puck-color-grey-05);
    --puck-color-text-subtle: var(--puck-color-grey-07);
    --puck-color-text-inverse: var(--puck-color-white);
    --puck-opacity-text-inverse: 0.75;
    --puck-color-interactive: var(--puck-color-azure-04);
    --puck-color-interactive-hover: var(--puck-color-azure-03);
    --puck-color-interactive-active: var(--puck-color-azure-02);
    --puck-color-interactive-subtle: var(--puck-color-azure-10);
    --puck-color-interactive-soft: var(--puck-color-azure-11);
    --puck-color-interactive-soft-hover: var(--puck-color-azure-12);
    --puck-color-interactive-neutral-hover: var(--puck-color-grey-10);
    --puck-color-interactive-inverse-hover: var(--puck-color-azure-06);
    --puck-color-interactive-inverse-active: var(--puck-color-azure-07);
    --puck-color-focus-ring: var(--puck-color-azure-05);
    --puck-color-selection-bg: color-mix( in srgb, var(--puck-color-azure-09) 30%, transparent );
    --puck-color-selection-border: var(--puck-color-azure-08);
    --puck-color-highlight: var(--puck-color-rose-07);
    --puck-color-bg-disabled: var(--puck-color-grey-07);
    --puck-color-text-disabled: var(--puck-color-grey-03);
    --puck-color-overlay-backdrop: color-mix( in srgb, var(--puck-color-black) 75%, transparent );
    --puck-space-1: 4px;
    --puck-space-2: 8px;
    --puck-space-3: 12px;
    --puck-space-4: 16px;
    --puck-space-5: 24px;
    --puck-space-chrome-gutter: var(--puck-space-4);
    --puck-radius-none: 0;
    --puck-radius-xs: 2px;
    --puck-radius-s: 3px;
    --puck-radius-m: 4px;
    --puck-radius-l: 8px;
    --puck-radius-pill: 30px;
    --puck-radius-round: 100%;
    --puck-border-width-hairline: 0.5px;
    --puck-border-width-regular: 1px;
    --puck-border-width-focus: 2px;
    --puck-border-width-strong: 4px;
    --puck-duration-fast: 50ms;
    --puck-duration-medium: 150ms;
    --puck-duration-slow: 250ms;
    --puck-ease-exit: ease-in;
    --puck-ease-emphasized: ease-in-out;
    --puck-ease-entrance: ease-out;
    --puck-font-weight-regular: 400;
    --puck-font-weight-medium: 500;
    --puck-font-weight-semibold: 600;
    --puck-font-weight-bold: 700;
    --puck-font-weight-heavy: 800;
    --puck-letter-spacing-ui: 0.05ch;
    --puck-letter-spacing-heading: 0.08ch;
    --puck-icon-size-s: 16px;
    --puck-icon-size-m: 18px;
    --puck-icon-size-l: 24px;
    --puck-space-m-unitless: 24;
    --puck-user-sidebar-left-width: var(--puck-sidebar-width);
    --puck-user-sidebar-right-width: var(--puck-sidebar-width);
    --puck-slot-min-empty-height: 128px;
  }
}

/* styles/typography.css */
@layer puck-tokens {
  :root {
    --puck-font-size-scale-base-unitless: 12;
    --puck-font-size-xxxs-unitless: 12;
    --puck-font-size-xxs-unitless: 14;
    --puck-font-size-xs-unitless: 16;
    --puck-font-size-s-unitless: 18;
    --puck-font-size-m-unitless: 21;
    --puck-font-size-l-unitless: 24;
    --puck-font-size-xl-unitless: 28;
    --puck-font-size-xxl-unitless: 36;
    --puck-font-size-xxxl-unitless: 48;
    --puck-font-size-xxxxl-unitless: 56;
    --puck-font-size-xxxs: calc( 1rem * var(--puck-font-size-xxxs-unitless) / 16 );
    --puck-font-size-xxs: calc(1rem * var(--puck-font-size-xxs-unitless) / 16);
    --puck-font-size-xs: calc(1rem * var(--puck-font-size-xs-unitless) / 16);
    --puck-font-size-s: calc(1rem * var(--puck-font-size-s-unitless) / 16);
    --puck-font-size-m: calc(1rem * var(--puck-font-size-m-unitless) / 16);
    --puck-font-size-l: calc(1rem * var(--puck-font-size-l-unitless) / 16);
    --puck-font-size-xl: calc(1rem * var(--puck-font-size-xl-unitless) / 16);
    --puck-font-size-xxl: calc(1rem * var(--puck-font-size-xxl-unitless) / 16);
    --puck-font-size-xxxl: calc( 1rem * var(--puck-font-size-xxxl-unitless) / 16 );
    --puck-font-size-xxxxl: calc( 1rem * var(--puck-font-size-xxxxl-unitless) / 16 );
    --puck-font-size-base: var(--puck-font-size-xs);
    --puck-line-height-reset: 1;
    --puck-line-height-xs: calc( var(--puck-space-m-unitless) / var(--puck-font-size-m-unitless) );
    --puck-line-height-s: calc( var(--puck-space-m-unitless) / var(--puck-font-size-s-unitless) );
    --puck-line-height-m: calc( var(--puck-space-m-unitless) / var(--puck-font-size-xs-unitless) );
    --puck-line-height-l: calc( var(--puck-space-m-unitless) / var(--puck-font-size-xxs-unitless) );
    --puck-line-height-xl: calc( var(--puck-space-m-unitless) / var(--puck-font-size-scale-base-unitless) );
    --puck-line-height-base: var(--puck-line-height-m);
    --puck-fallback-font-stack:
      -apple-system,
      BlinkMacSystemFont,
      Segoe UI,
      Helvetica Neue,
      sans-serif,
      Apple Color Emoji,
      Segoe UI Emoji,
      Segoe UI Symbol;
    --puck-font-family: Inter, var(--puck-fallback-font-stack);
    --puck-font-family-monospaced:
      ui-monospace,
      "Cascadia Code",
      "Source Code Pro",
      Menlo,
      Consolas,
      "DejaVu Sans Mono",
      monospace;
  }
  @supports (font-variation-settings: normal) {
    :root {
      --puck-font-family: InterVariable, var(--puck-fallback-font-stack);
    }
  }
}

/* bundle/core.css */
:root {
  --_puck-styles-loaded: "true";
}
#frame-root {
  height: 1px;
  min-height: 100vh;
}
[data-puck-entry] {
  position: relative;
  z-index: 0;
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/ActionBar/styles.module.css/#css-module-data */
._ActionBar_5vdfr_1 {
  align-items: center;
  cursor: default;
  display: flex;
  width: auto;
  padding-top: var(--puck-actionbar-space-y, var(--puck-space-1));
  padding-bottom: var(--puck-actionbar-space-y, var(--puck-space-1));
  padding-inline-start: var(--puck-actionbar-space-x, 0);
  padding-inline-end: var(--puck-actionbar-space-x, 0);
  border-radius: var(--puck-actionbar-radius, var(--puck-radius-l));
  background: var(--puck-actionbar-color-bg, var(--puck-color-surface-inverse));
  color: var(--puck-color-text-inverse);
  font-family: var(--puck-font-family);
  min-height: 26px;
}
._ActionBar-label_5vdfr_17 {
  color: var(--puck-actionbar-color-text, var(--puck-color-text-inverse));
  font-size: var(--puck-actionbar-font-size, var(--puck-font-size-xxxs));
  opacity: var(--puck-actionbar-opacity-text, var(--puck-opacity-text-inverse));
  font-weight: var(--puck-font-weight-medium);
  padding-inline-start: var(--puck-space-2);
  padding-inline-end: var(--puck-space-2);
  margin-inline-start: var(--puck-space-1);
  margin-inline-end: var(--puck-space-1);
  text-overflow: ellipsis;
  white-space: nowrap;
}
._ActionBarAction_5vdfr_30 + ._ActionBar-label_5vdfr_17 {
  padding-inline-start: 0;
}
._ActionBar-label_5vdfr_17 + ._ActionBarAction_5vdfr_30 {
  margin-inline-start: calc(var(--puck-space-1) * -1);
}
._ActionBar-group_5vdfr_38 {
  align-items: center;
  border-inline-start: var(--puck-border-width-hairline) solid var(--puck-actionbar-color-separator, var(--puck-color-border-inverse));
  display: flex;
  height: 100%;
  padding-inline-start: var(--puck-space-1);
  padding-inline-end: var(--puck-space-1);
}
._ActionBar-group_5vdfr_38:first-of-type {
  border-inline-start: 0;
}
._ActionBar-group_5vdfr_38:empty {
  display: none;
}
._ActionBarAction_5vdfr_30 {
  background: transparent;
  border: none;
  color: var(--puck-actionbar-color-text, var(--puck-color-text-inverse));
  cursor: pointer;
  padding: var(--puck-actionbar-action-space, 6px);
  margin-inline-start: var(--puck-space-1);
  margin-inline-end: var(--puck-space-1);
  border-radius: var(--puck-radius-m);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: var(--puck-actionbar-opacity-text, var(--puck-opacity-text-inverse));
  transition: color var(--puck-duration-fast) var(--puck-ease-exit), opacity var(--puck-duration-fast) var(--puck-ease-exit);
}
._ActionBarAction--disabled_5vdfr_74 {
  cursor: auto;
  color: var( --puck-actionbar-color-action-disabled, var(--puck-color-text-inverse) );
  opacity: var(--puck-actionbar-opacity-action-disabled, 0.54);
}
._ActionBarAction_5vdfr_30 svg {
  max-width: none !important;
}
._ActionBarAction_5vdfr_30:focus-visible {
  outline: var(--puck-border-width-focus) solid var(--puck-color-focus-ring);
  outline-offset: calc(var(--puck-border-width-focus) * -1);
}
@media (hover: hover) and (pointer: fine) {
  ._ActionBarAction_5vdfr_30:hover:not(._ActionBarAction--disabled_5vdfr_74) {
    color: var( --puck-actionbar-color-action-hover, var(--puck-color-interactive-inverse-hover) );
    opacity: 1;
    transition: none;
  }
}
._ActionBarAction_5vdfr_30:active:not(._ActionBarAction--disabled_5vdfr_74),
._ActionBarAction--active_5vdfr_104 {
  color: var( --puck-actionbar-color-action-active, var(--puck-color-interactive-inverse-active) );
  opacity: 1;
  transition: none;
}
._ActionBar-group_5vdfr_38 * {
  margin: 0;
}
._ActionBar-separator_5vdfr_117 {
  background: var( --puck-actionbar-color-separator, var(--puck-color-border-inverse) );
  margin-inline: var(--puck-space-1);
  width: var( --puck-border-width-hairline );
  height: 100%;
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/DraggableComponent/styles.module.css/#css-module-data */
._DraggableComponent_1627v_1 {
  position: absolute;
  pointer-events: none;
}
._DraggableComponent-overlayWrapper_1627v_6 {
  height: 100%;
  width: 100%;
  top: 0;
  position: absolute;
  pointer-events: none;
  box-sizing: border-box;
  z-index: 1;
}
._DraggableComponent-overlay_1627v_6 {
  cursor: pointer;
  height: 100%;
  outline: var( --puck-slot-component-border-width, var(--puck-border-width-focus) ) var( --puck-slot-component-color-overlay-border, var(--puck-color-selection-border) ) solid;
  outline-offset: calc(var(--puck-slot-component-border-width, var(--puck-border-width-focus)) * -1);
  width: 100%;
}
._DraggableComponent_1627v_1:focus-visible > ._DraggableComponent-overlayWrapper_1627v_6 {
  outline: var(--puck-border-width-regular) solid var(--puck-color-focus-ring);
}
._DraggableComponent-loadingOverlay_1627v_38 {
  background: var(--puck-color-surface);
  color: var(--puck-color-text);
  border-radius: var(--puck-radius-m);
  display: flex;
  padding: var(--puck-space-2);
  top: var(--puck-space-2);
  right: var(--puck-space-2);
  position: absolute;
  z-index: 1;
  pointer-events: all;
  box-sizing: border-box;
  opacity: 0.8;
  z-index: 1;
}
._DraggableComponent--hover_1627v_54 > ._DraggableComponent-overlayWrapper_1627v_6 > ._DraggableComponent-overlay_1627v_6 {
  background: var( --puck-slot-component-color-overlay, var(--puck-color-selection-bg) );
  outline: var( --puck-slot-component-border-width, var(--puck-border-width-focus) ) var( --puck-slot-component-color-overlay-border, var(--puck-color-selection-border) ) solid;
}
._DraggableComponent--isSelected_1627v_72 > ._DraggableComponent-overlayWrapper_1627v_6 > ._DraggableComponent-overlay_1627v_6 {
  outline-color: var( --puck-slot-component-color-border-selected, var(--puck-color-selection-border) );
}
._DraggableComponent_1627v_1:has(._DraggableComponent--hover_1627v_54 > ._DraggableComponent-overlayWrapper_1627v_6) > ._DraggableComponent-overlayWrapper_1627v_6 {
  display: none;
}
._DraggableComponent-actionsOverlay_1627v_89 {
  position: sticky;
  opacity: 0;
  pointer-events: none;
  z-index: 2;
}
._DraggableComponent--isSelected_1627v_72 ._DraggableComponent-actionsOverlay_1627v_89 {
  opacity: 1;
  pointer-events: auto;
}
._DraggableComponent-actions_1627v_89 {
  position: absolute;
  width: auto;
  cursor: grab;
  display: flex;
  box-sizing: border-box;
  transform-origin: right top;
  min-height: 36px;
}
._DraggableComponent-actionsAction_1627v_111 {
  height: var(--puck-actionbar-action-size, var(--puck-icon-size-s));
  width: var(--puck-actionbar-action-size, var(--puck-icon-size-s));
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/Drawer/styles.module.css/#css-module-data */
._Drawer_1n90m_1 {
  display: flex;
  flex-direction: column;
  font-family: var(--puck-font-family);
  gap: var(--puck-space-3);
}
._Drawer-draggable_1n90m_8 {
  position: relative;
}
._Drawer-draggableBg_1n90m_12 {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  pointer-events: none;
  z-index: -1;
}
._DrawerItem-draggable_1n90m_22 {
  background: var(--puck-drawer-item-color-bg, var(--puck-color-surface));
  color: var(--puck-drawer-item-color-text, var(--puck-color-text));
  cursor: grab;
  padding: var(--puck-drawer-item-space, var(--puck-space-3));
  display: flex;
  border: var(--puck-drawer-item-border-width, var(--puck-border-width-regular)) var(--puck-drawer-item-color-border, var(--puck-color-border)) solid;
  border-radius: var(--puck-drawer-item-radius, var(--puck-radius-m));
  font-size: var(--puck-drawer-item-font-size, var(--puck-font-size-xxs));
  justify-content: space-between;
  align-items: center;
  transition: background-color var(--puck-duration-fast) var(--puck-ease-exit), color var(--puck-duration-fast) var(--puck-ease-exit);
}
._DrawerItem--disabled_1n90m_38 ._DrawerItem-draggable_1n90m_22 {
  background: var(--puck-color-surface-muted);
  color: var(--puck-color-text-muted);
  cursor: not-allowed;
}
._DrawerItem_1n90m_22:focus-visible {
  outline: 0;
}
._Drawer_1n90m_1:not(._Drawer--isDraggingFrom_1n90m_48) ._DrawerItem_1n90m_22:focus-visible ._DrawerItem-draggable_1n90m_22 {
  border-radius: var(--puck-radius-m);
  outline: var(--puck-border-width-focus) solid var(--puck-color-focus-ring);
  outline-offset: var(--puck-border-width-focus);
}
@media (hover: hover) and (pointer: fine) {
  ._Drawer_1n90m_1:not(._Drawer--isDraggingFrom_1n90m_48) ._DrawerItem_1n90m_22:not(._DrawerItem--disabled_1n90m_38) ._DrawerItem-draggable_1n90m_22:hover {
    background-color: var( --puck-drawer-item-color-bg-hover, var(--puck-color-interactive-soft-hover) );
    color: var( --puck-drawer-item-color-text-hover, var(--puck-color-interactive) );
    transition: none;
  }
}
._DrawerItem-name_1n90m_72 {
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/DropZone/styles.module.css/#css-module-data */
._DropZone_ybznu_1 {
  position: relative;
  height: 100%;
  min-height: var(--puck-slot-min-empty-height);
  outline-offset: calc(var(--puck-slot-border-width, var(--puck-border-width-focus)) * -1);
  width: 100%;
}
._DropZone--hasChildren_ybznu_11 {
  min-height: 0;
}
._DropZone_ybznu_1:empty {
  min-height: var(--puck-slot-min-empty-height);
}
[data-puck-entry]:not([data-puck-dragging]) ._DropZone_ybznu_1 {
  transition: min-height var(--puck-duration-medium) var(--puck-ease-exit);
}
._DropZone--isAreaSelected_ybznu_24,
._DropZone--hoveringOverArea_ybznu_25:not(._DropZone--isRootZone_ybznu_25) {
  background: var(--puck-slot-color-bg, var(--puck-color-selection-bg));
  outline: var(--puck-slot-border-width, var(--puck-border-width-focus)) var(--puck-slot-border-style, dashed) var(--puck-slot-color-border, var(--puck-color-selection-border));
}
._DropZone_ybznu_1:empty {
  background: var(--puck-slot-color-bg, var(--puck-color-selection-bg));
  outline: var(--puck-slot-border-width, var(--puck-border-width-focus)) var(--puck-slot-border-style, dashed) var(--puck-slot-color-border, var(--puck-color-selection-border));
}
._DropZone-item_ybznu_39 {
  position: relative;
}
._DropZone-hitbox_ybznu_43 {
  position: absolute;
  bottom: calc(var(--puck-space-3) * -1);
  height: var(--puck-space-5);
  width: 100%;
  z-index: 1;
}
[data-puck-dragging] ._DropZone--isEnabled_ybznu_51 {
  outline: var(--puck-slot-border-width, var(--puck-border-width-focus)) var(--puck-slot-border-style, dashed) var(--puck-slot-color-border, var(--puck-color-selection-border));
}
._DropZone_ybznu_1 > *:not([data-puck-component]) {
  opacity: 0;
}
body:has(._DropZone--isAnimating_ybznu_62:empty) [data-puck-overlay] {
  opacity: 0 !important;
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/InlineTextField/styles.module.css/#css-module-data */
._InlineTextField_104qp_1 {
  cursor: text;
  display: inline-block;
  white-space: pre-wrap;
  text-decoration: inherit;
}
[data-dnd-dragging] ._InlineTextField_104qp_1 {
  cursor: none;
  caret-color: transparent;
}
[data-dnd-dragging] ._InlineTextField_104qp_1::selection {
  display: none;
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/Loader/styles.module.css/#css-module-data */
@keyframes _loader-animation_1w5zn_1 {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(0.8);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}
._Loader_1w5zn_13 {
  background: transparent;
  border-radius: var(--puck-radius-round);
  border: var(--puck-border-width-focus) solid currentColor;
  border-bottom-color: transparent;
  display: inline-block;
  animation: _loader-animation_1w5zn_1 1s 0s infinite linear;
  animation-fill-mode: both;
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/RichTextMenu/styles.module.css/#css-module-data */
._RichTextMenu_1ve2j_1 {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}
._RichTextMenu--form_1ve2j_7 {
  border-top-left-radius: var(--puck-field-radius, var(--puck-radius-m));
  border-top-right-radius: var(--puck-field-radius, var(--puck-radius-m));
  padding: var(--puck-field-richtext-menu-space-y, 6px) var(--puck-field-richtext-menu-space-x, 6px);
  background-color: var( --puck-field-richtext-menu-color-bg, var(--puck-color-surface-subtle) );
  position: relative;
  scrollbar-width: none;
  overflow-x: auto;
}
._RichTextMenu-group_1ve2j_21 {
  display: flex;
  align-items: space-between;
  flex-direction: row;
  flex-wrap: nowrap;
  padding-inline: 6px;
  gap: 2px;
  position: relative;
}
._RichTextMenu-group_1ve2j_21:first-of-type {
  padding-left: 0;
}
._RichTextMenu-group_1ve2j_21:last-of-type {
  padding-right: 0;
}
._RichTextMenu--inline_1ve2j_39 ._RichTextMenu-group_1ve2j_21 {
  color: var(--puck-color-text-inverse);
  gap: 0px;
  flex-wrap: nowrap;
}
._RichTextMenu-group_1ve2j_21 + ._RichTextMenu-group_1ve2j_21 {
  border-left: var(--puck-border-width-regular) solid var( --puck-field-richtext-menu-color-separator, var(--puck-color-border-muted) );
}
._RichTextMenu--inline_1ve2j_39 ._RichTextMenu-group_1ve2j_21 + ._RichTextMenu-group_1ve2j_21 {
  border-left: var(--puck-border-width-hairline) solid var(--puck-color-border-inverse);
}

/* css-module:/home/runner/work/puck/puck/packages/core/components/RichTextMenu/components/Control/styles.module.css/#css-module-data */
._Control_id4pm_1 .lucide {
  height: var(--puck-icon-size-m);
  width: var(--puck-icon-size-m);
}
._Control--inline_id4pm_6 .lucide {
  height: var(--puck-actionbar-action-size, var(--puck-icon-size-s));
  width: var(--puck-actionbar-action-size, var(--puck-icon-size-s));
}

/* components/DraggableComponent/styles.css */
[data-puck-component] * {
  pointer-events: none;
  user-select: none;
  -webkit-user-select: none;
}
[data-puck-component] {
  cursor: grab;
  pointer-events: auto !important;
  user-select: none;
  -webkit-user-select: none;
}
[data-puck-dropzone] {
  pointer-events: auto !important;
}
[data-puck-disabled] {
  cursor: pointer;
}
[data-dnd-placeholder] {
  background: var( --puck-slot-component-color-placeholder, var(--puck-color-azure-06) ) !important;
  border: none !important;
  color: transparent !important;
  opacity: 0.3 !important;
  outline: none !important;
  transition: none !important;
}
[data-dnd-placeholder] *,
[data-dnd-placeholder]::after,
[data-dnd-placeholder]::before {
  opacity: 0 !important;
}
[data-dnd-dragging][data-puck-component] {
  pointer-events: none !important;
  outline: var( --puck-slot-component-border-width, var(--puck-border-width-focus) ) var(--puck-slot-component-color-border-dragging, var(--puck-color-azure-09)) solid !important;
  outline-offset: calc(var(--puck-slot-component-border-width, var(--puck-border-width-focus)) * -1) !important;
}
[data-dnd-dragging][data-puck-component] > :first-child {
  margin-top: 0 !important;
}
[data-dnd-dragging][data-puck-component] > :last-child {
  margin-bottom: 0 !important;
}

/* lib/overlay-portal/styles.css */
[data-puck-overlay-portal],
[data-puck-overlay-portal] * {
  pointer-events: auto !important;
}
[data-puck-entry][data-puck-preview-mode=edit] [data-puck-overlay-portal]:hover {
  outline: 2px var(--puck-color-azure-09, #cfdff0) dashed;
  outline-offset: 2px;
}
[data-puck-entry][data-puck-preview-mode=edit] [data-puck-overlay-portal]:focus-within {
  outline: 2px var(--puck-color-azure-07, #88b0da) dashed;
  outline-offset: 2px;
}`,vy=`data-puck-style-source`,yy=`puck`,by=`data-puck-style-id`,xy={uiDefault:`ui-default`,iframeInteractions:`iframe-styles`},Sy=new WeakMap,Cy=e=>{if(e)return e;if(!(typeof document>`u`))return document},wy=e=>{let t=Sy.get(e);if(t)return t;let n=new Map;return Sy.set(e,n),n},Ty=(e,t,n=!1)=>{let r=e.head;if(r){if(t.parentElement!==r){n?r.prepend(t):r.append(t);return}n&&r.firstChild!==t&&r.prepend(t),!n&&r.lastChild!==t&&r.append(t)}},Ey=(e,t,n,r=!1)=>{let i=e.createElement(`style`);return i.setAttribute(vy,yy),i.setAttribute(by,t),i.textContent=n,Ty(e,i,r),i},Dy=e=>e?.getAttribute(vy)===yy,Oy=e=>{let t=Cy(e?.document);(0,F.useInsertionEffect)(()=>{if(!e||!t)return;let n=wy(t),r=n.get(e.id);if(r)r.count+=1,r.el.textContent!==e.cssText&&(r.el.textContent=e.cssText),Ty(t,r.el,e.prepend);else{let r=Ey(t,e.id,e.cssText,e.prepend);n.set(e.id,{count:1,el:r})}return()=>{let t=n.get(e.id);t&&(--t.count,t.count<=0&&(t.el.remove(),n.delete(e.id)))}},[e?.cssText,e?.id,e?.prepend,e?.document,t])},ky=null,Ay=()=>ky===null?typeof document>`u`?!1:(ky=getComputedStyle(document.documentElement).getPropertyValue(`--_puck-styles-loaded`).trim()!==``,ky):ky,jy=()=>{Oy(Ay()?null:{cssText:gy,id:xy.uiDefault,prepend:!0}),(0,F.useEffect)(()=>{},[])},My=e=>{Oy(e?{cssText:_y,document:e,id:xy.iframeInteractions}:null)},Ny=`style, link[rel="stylesheet"]`,Py=`data-puck-style-mirror`,Fy=e=>!e.matches(Ny)||Dy(e)?!1:e.tagName===`STYLE`?!!e.innerHTML.trim():!0,Iy=e=>{let t=[];return e.querySelectorAll(Ny).forEach(e=>{Fy(e)&&t.push(e)}),t},Ly=e=>Array.from(document.styleSheets).find(t=>t.ownerNode.href===e.href),Ry=e=>{if(e)try{return Array.from(e.cssRules).map(e=>e.cssText).join(``)}catch{console.warn(`Access to stylesheet %s is denied. Ignoring…`,e.href)}return``},zy=(e,t)=>{let n=e.attributes;n?.length>0&&Array.from(n).forEach(e=>{t.setAttribute(e.name,e.value)})},By=e=>setTimeout(e,0),Vy=({children:e,debug:t=!1,onStylesLoaded:n=()=>null,syncHostStyles:r=!0})=>{let{document:i,window:a}=Uy();return My(i),(0,F.useEffect)(()=>{if(!a||!i)return()=>{};let e=[],o={},c=()=>{e.forEach(({mirror:e})=>{e.remove()}),e=[],Array.from(i.head.querySelectorAll(`[${Py}="true"]`)).forEach(e=>{e.remove()}),Object.keys(o).forEach(e=>{delete o[e]})},l=t=>e.findIndex(e=>e.original===t),u=(e,n=!1)=>s(null,null,function*(){let r;if(e.nodeName===`LINK`&&n){r=document.createElement(`style`),r.type=`text/css`;let n=Ly(e);n||=(yield new Promise(t=>{let n=()=>{t(),e.removeEventListener(`load`,n)};e.addEventListener(`load`,n)}),Ly(e));let i=Ry(n);if(!i){t&&console.warn(`Tried to load styles for link element, but couldn't find them. Skipping...`);return}r.innerHTML=i,r.setAttribute(`data-href`,e.getAttribute(`href`))}else r=e.cloneNode(!0);return r.setAttribute(Py,`true`),r}),d=n=>s(null,null,function*(){let r=l(n);if(r>-1){t&&console.log(`Tried to add an element that was already mirrored. Updating instead...`),e[r].mirror.innerText=n.innerText;return}let a=yield u(n);if(!a)return;let s=(0,ah.default)(a.outerHTML);if(o[s]){t&&console.log(`iframe already contains element that is being mirrored. Skipping...`);return}o[s]=!0,i.head.append(a),e.push({original:n,mirror:a}),t&&console.log(`Added style node ${n.outerHTML}`)}),f=n=>{var r;let i=l(n);if(i===-1){t&&console.log(`Tried to remove an element that did not exist. Skipping...`);return}let a=(0,ah.default)(n.outerHTML);(r=e[i]?.mirror)==null||r.remove(),delete o[a],t&&console.log(`Removed style node ${n.outerHTML}`)},p=new MutationObserver(e=>{e.forEach(e=>{e.type===`childList`&&(e.addedNodes.forEach(e=>{if(e.nodeType===Node.TEXT_NODE||e.nodeType===Node.ELEMENT_NODE){let t=e.nodeType===Node.TEXT_NODE?e.parentElement:e;t&&Fy(t)&&By(()=>d(t))}}),e.removedNodes.forEach(e=>{if(e.nodeType===Node.TEXT_NODE||e.nodeType===Node.ELEMENT_NODE){let t=e.nodeType===Node.TEXT_NODE?e.parentElement:e;t&&t.matches(Ny)&&!Dy(t)&&By(()=>f(t))}}))})});if(!r)return n(),()=>{p.disconnect(),c()};let m=a.parent.document,h=Iy(m),g=[],_=0,v=m.getElementsByTagName(`html`)[0];zy(v,i.documentElement);let y=m.getElementsByTagName(`body`)[0];return zy(y,i.body),Promise.all(h.map((t,n)=>s(null,null,function*(){if(t.nodeName===`LINK`){let e=t.href;if(g.indexOf(e)>-1)return;g.push(e)}let n=yield u(t);if(n)return e.push({original:t,mirror:n}),n}))).then(e=>{let t=e.filter(e=>e!==void 0);t.forEach(e=>{e.onload=()=>{_+=1,_>=t.length&&n()},e.onerror=()=>{let r=e instanceof HTMLLinkElement?e.href:void 0;console.warn(`AutoFrame couldn't load a stylesheet${r?`: ${r}`:``}. This can happen if the parent document's stylesheet is blocked by the iframe's CSP, returns a non-2xx status, or fails to reach the network.`),_+=1,_>=t.length&&n()}}),i.head.querySelectorAll(`[${Py}="true"]`).forEach(e=>{e.remove()}),i.head.append(...t),t.forEach(e=>{e.nodeName===`STYLE`&&(_+=1)}),_>=t.length&&n(),p.observe(m.head,{childList:!0,subtree:!0}),t.forEach(e=>{let t=(0,ah.default)(e.outerHTML);o[t]=!0})}),()=>{p.disconnect(),c()}},[r]),(0,I.jsx)(I.Fragment,{children:e})},Hy=(0,F.createContext)({}),Uy=()=>(0,F.useContext)(Hy);function Wy(t){var n=t,{children:i,className:a,debug:s,id:c,onReady:l=()=>{},onNotReady:u=()=>{},frameRef:d,syncHostStyles:f=!0}=n,p=r(n,[`children`,`className`,`debug`,`id`,`onReady`,`onNotReady`,`frameRef`,`syncHostStyles`]);let[m,h]=(0,F.useState)(!1),[g,_]=(0,F.useState)({}),[v,y]=(0,F.useState)(),[b,x]=(0,F.useState)(!1);return(0,F.useEffect)(()=>{m&&x(!f)},[m,f]),(0,F.useEffect)(()=>{if(d.current){let e=d.current.contentDocument,t=d.current.contentWindow;_({document:e||void 0,window:t||void 0}),y(d.current.contentDocument?.getElementById(`frame-root`)),e&&t&&b?l():u()}},[d,m,b]),(0,I.jsx)(`iframe`,e(o({},p),{className:a,id:c,srcDoc:`<!DOCTYPE html><html><head></head><body><div id="frame-root" data-puck-entry></div></body></html>`,ref:d,onLoad:()=>{h(!0)},children:(0,I.jsx)(Hy.Provider,{value:g,children:m&&v&&(0,I.jsx)(Vy,{debug:s,onStylesLoaded:()=>x(!0),syncHostStyles:f,children:(0,of.createPortal)(i,v)})})}))}Wy.displayName=`AutoFrame`;var Gy=Wy;c();var Ky=a(`PuckPreview`,{PuckPreview:`_PuckPreview_z2rgu_1`,"PuckPreview-frame":`_PuckPreview-frame_z2rgu_6`}),qy=t=>{let n=P(e=>e.status);(0,F.useEffect)(()=>{if(t.current&&n===`READY`){let n=t.current,r=t=>{let r=new u_(`pointermove`,e(o({},t),{bubbles:!0,cancelable:!1,clientX:t.clientX,clientY:t.clientY,pointerId:t.pointerId,pointerType:t.pointerType,isPrimary:t.isPrimary,originalTarget:t.target}));n.dispatchEvent(r)},i=()=>{var e;a(),(e=n.contentDocument)==null||e.addEventListener(`pointermove`,r,{capture:!0})},a=()=>{var e;(e=n.contentDocument)==null||e.removeEventListener(`pointermove`,r)};return i(),()=>{a()}}},[n])},Jy=e=>{let t=P(e=>e.state.ui.previewMode),n=P(e=>e.status),r=P(e=>e.iframe.enabled);(0,F.useEffect)(()=>{(r?(e.current?.contentDocument)?.querySelector(`[data-puck-entry]`):e.current)?.setAttribute(`data-puck-preview-mode`,t)},[t,n,r])},Yy=(0,F.memo)(e=>{var t=e,{config:n}=t,i=r(t,[`config`]);let a=mn(n,{type:`root`,props:i},uv),s=yn(n.root?.fields??{},i);return n.root?.render?n.root?.render(o(o({id:`puck-root`},a),s)):(0,I.jsx)(I.Fragment,{children:a.children})});Yy.displayName=`Page`;var Xy=({id:t=`puck-preview`})=>{let n=P(e=>e.dispatch),r=P(e=>e.state.data.root),i=P(e=>e.config),a=P(e=>e.setStatus),s=P(e=>e.iframe),c=P(e=>e.overrides),l=P(e=>e.metadata),u=P(e=>e.state.ui.previewMode===`edit`?null:e.state.data),d=(0,F.useMemo)(()=>c.iframe,[c]),f=r.props||r,p=(0,F.useRef)(null);qy(p),Jy(p);let m=u?(0,I.jsx)(yv,{data:u,config:i,metadata:l}):(0,I.jsx)(Yy,e(o({},f),{config:i,puck:{renderDropZone:gv,isEditing:!0,dragRef:null,metadata:l},editMode:!0,children:(0,I.jsx)(gv,{zone:h})}));return(0,F.useEffect)(()=>{s.enabled||a(`READY`)},[s.enabled]),(0,I.jsx)(`div`,{className:Ky(),id:t,"data-puck-preview":!0,onClick:e=>{let t=e.target;!t.hasAttribute(`data-puck-component`)&&!t.hasAttribute(`data-puck-dropzone`)&&n({type:`setUi`,ui:{itemSelector:null}})},children:s.enabled?(0,I.jsx)(Gy,{id:`preview-frame`,className:Ky(`frame`),"data-rfd-iframe":!0,syncHostStyles:s.syncHostStyles,onReady:()=>{a(`READY`)},onNotReady:()=>{a(`MOUNTED`)},frameRef:p,children:(0,I.jsx)(Hy.Consumer,{children:({document:e})=>d?(0,I.jsx)(d,{document:e,children:m}):m})}):(0,I.jsx)(`div`,{id:`preview-frame`,className:Ky(`frame`),ref:p,"data-puck-entry":!0,children:m})})};c(),c();var Zy=({overrides:t,plugins:n})=>{let r=o({},t);return n?.forEach(t=>{t.overrides&&Object.keys(t.overrides).forEach(n=>{let i=n;if(!t.overrides?.[i])return;if(i===`fieldTypes`){let n=t.overrides.fieldTypes;Object.keys(n).forEach(t=>{r.fieldTypes=r.fieldTypes||{};let i=r.fieldTypes[t],a=r=>n[t](e(o({},r),{children:i?i(r):r.children}));r.fieldTypes[t]=a});return}let a=r[i];r[i]=n=>t.overrides[i](e(o({},n),{children:a?a(n):n.children}))})}),r},Qy=({overrides:e,plugins:t})=>(0,F.useMemo)(()=>Zy({overrides:e,plugins:t}),[t,e]);c(),c();var $y={Puck:`_Puck_mr27u_19`,"Puck-portal":`_Puck-portal_mr27u_31`,PuckLayout:`_PuckLayout_mr27u_36`,"PuckLayout-inner":`_PuckLayout-inner_mr27u_40`,"Puck--hidePlugins":`_Puck--hidePlugins_mr27u_73`,"PuckLayout--mounted":`_PuckLayout--mounted_mr27u_78`,"PuckLayout--mobilePanelHeightToggle":`_PuckLayout--mobilePanelHeightToggle_mr27u_82`,"PuckLayout--leftSideBarVisible":`_PuckLayout--leftSideBarVisible_mr27u_82`,"PuckLayout--isExpanded":`_PuckLayout--isExpanded_mr27u_90`,"PuckLayout--mobilePanelHeightMinContent":`_PuckLayout--mobilePanelHeightMinContent_mr27u_110`,"PuckLayout--rightSideBarVisible":`_PuckLayout--rightSideBarVisible_mr27u_137`,"PuckLayout-mounted":`_PuckLayout-mounted_mr27u_156`,"PuckLayout-nav":`_PuckLayout-nav_mr27u_197`,"PuckLayout-header":`_PuckLayout-header_mr27u_217`,PuckPluginTab:`_PuckPluginTab_mr27u_231`,"PuckPluginTab--visible":`_PuckPluginTab--visible_mr27u_237`,"PuckPluginTab-body":`_PuckPluginTab-body_mr27u_242`};c();var eb=({children:e})=>(0,I.jsx)(I.Fragment,{children:e});c();var tb=()=>{let e=Pe(),t=(0,F.useCallback)(()=>{let t=e.getState().dispatch;t({type:`setUi`,ui:e=>({previewMode:e.previewMode===`edit`?`interactive`:`edit`})})},[e]);ct({meta:!0,i:!0},t),ct({ctrl:!0,i:!0},t)};c(),c(),c();var nb=a(`MenuBar`,{MenuBar:`_MenuBar_1hxnj_1`,"MenuBar--menuOpen":`_MenuBar--menuOpen_1hxnj_14`,"MenuBar-inner":`_MenuBar-inner_1hxnj_29`,"MenuBar-history":`_MenuBar-history_1hxnj_45`});function rb({menuOpen:e=!1,renderHeaderActions:t,setMenuOpen:n}){let r=P(e=>e.history.back),i=P(e=>e.history.forward),a=P(e=>e.history.hasFuture()),o=P(e=>e.history.hasPast());return(0,I.jsx)(`div`,{className:nb({menuOpen:e}),onClick:e=>{let t=e.target;window.matchMedia(`(min-width: 638px)`).matches||t.tagName===`A`&&t.getAttribute(`href`)?.startsWith(`#`)&&n(!1)},children:(0,I.jsxs)(`div`,{className:nb(`inner`),children:[(0,I.jsxs)(`div`,{className:nb(`history`),children:[(0,I.jsx)(A,{type:`button`,title:`undo`,disabled:!o,onClick:r,children:(0,I.jsx)(Ce,{size:21})}),(0,I.jsx)(A,{type:`button`,title:`redo`,disabled:!a,onClick:i,children:(0,I.jsx)(Qe,{size:21})})]}),(0,I.jsx)(I.Fragment,{children:t&&t()})]})})}c();var ib=a(`PuckHeader`,{PuckHeader:`_PuckHeader_c2nei_1`,"PuckHeader--hidePlugins":`_PuckHeader--hidePlugins_c2nei_21`,"PuckHeader-inner":`_PuckHeader-inner_c2nei_26`,"PuckHeader-toggle":`_PuckHeader-toggle_c2nei_46`,"PuckHeader-rightSideBarToggle":`_PuckHeader-rightSideBarToggle_c2nei_52`,"PuckHeader-leftSideBarToggle":`_PuckHeader-leftSideBarToggle_c2nei_53`,"PuckHeader-title":`_PuckHeader-title_c2nei_64`,"PuckHeader-path":`_PuckHeader-path_c2nei_68`,"PuckHeader-tools":`_PuckHeader-tools_c2nei_75`,"PuckHeader-menuButton":`_PuckHeader-menuButton_c2nei_81`,"PuckHeader--menuOpen":`_PuckHeader--menuOpen_c2nei_86`}),ab=(0,F.memo)(({hidePlugins:t})=>{let{onPublish:n,renderHeader:i,renderHeaderActions:a,headerTitle:s,headerPath:c,iframe:l}=Kb(),u=P(e=>e.dispatch),d=Pe(),f=(0,F.useMemo)(()=>i?(console.warn("`renderHeader` is deprecated. Please use `overrides.header` and the `usePuck` hook instead"),t=>{var n=t,{actions:a}=n,s=r(n,[`actions`]);let c=i,l=P(e=>e.state);return(0,I.jsx)(c,e(o({},s),{dispatch:u,state:l,children:a}))}):eb,[i]),p=(0,F.useMemo)(()=>a?(console.warn("`renderHeaderActions` is deprecated. Please use `overrides.headerActions` and the `usePuck` hook instead."),t=>{let n=a,r=P(e=>e.state);return(0,I.jsx)(n,e(o({},t),{dispatch:u,state:r}))}):eb,[a]),m=P(e=>e.overrides.header||f),h=P(e=>e.overrides.headerActions||p),[g,_]=(0,F.useState)(!1),v=P(e=>(e.state.indexes.nodes.root?.data).props.title??``),y=P(e=>e.state.ui.leftSideBarVisible),b=P(e=>e.state.ui.rightSideBarVisible),x=(0,F.useCallback)(e=>{let t=window.matchMedia(`(min-width: 638px)`).matches,n=e===`left`?y:b,r=e===`left`?`rightSideBarVisible`:`leftSideBarVisible`;u({type:`setUi`,ui:o({[`${e}SideBarVisible`]:!n},t?{}:{[r]:!1})})},[u,y,b]);return(0,I.jsx)(m,{actions:(0,I.jsx)(I.Fragment,{children:(0,I.jsx)(h,{children:(0,I.jsx)(dh,{onClick:()=>{let e=d.getState().state.data;n&&n(e)},icon:(0,I.jsx)(st,{size:`14px`}),children:`Publish`})})}),children:(0,I.jsx)(`header`,{className:ib({leftSideBarVisible:y,rightSideBarVisible:b,hidePlugins:t}),children:(0,I.jsxs)(`div`,{className:ib(`inner`),children:[(0,I.jsxs)(`div`,{className:ib(`toggle`),children:[(0,I.jsx)(`div`,{className:ib(`leftSideBarToggle`),children:(0,I.jsx)(A,{type:`button`,onClick:()=>{x(`left`)},title:`Toggle left sidebar`,children:(0,I.jsx)(C,{focusable:`false`})})}),(0,I.jsx)(`div`,{className:ib(`rightSideBarToggle`),children:(0,I.jsx)(A,{type:`button`,onClick:()=>{x(`right`)},title:`Toggle right sidebar`,children:(0,I.jsx)(de,{focusable:`false`})})})]}),(0,I.jsx)(`div`,{className:ib(`title`),children:(0,I.jsxs)(pg,{rank:`2`,size:`xs`,children:[s||v||`Page`,c&&(0,I.jsxs)(I.Fragment,{children:[` `,(0,I.jsx)(`code`,{className:ib(`path`),children:c})]})]})}),(0,I.jsxs)(`div`,{className:ib(`tools`),children:[(0,I.jsx)(`div`,{className:ib(`menuButton`),children:(0,I.jsx)(A,{type:`button`,onClick:()=>_(!g),title:`Toggle menu bar`,children:g?(0,I.jsx)(at,{focusable:`false`}):(0,I.jsx)(Ee,{focusable:`false`})})}),(0,I.jsx)(rb,{dispatch:u,onPublish:n,menuOpen:g,renderHeaderActions:()=>(0,I.jsx)(h,{children:(0,I.jsx)(dh,{onClick:()=>{let e=d.getState().state.data;n&&n(e)},icon:(0,I.jsx)(st,{size:`14px`}),children:`Publish`})}),setMenuOpen:_})]})]})})})});c(),c();var ob=a(`SidebarSection`,{SidebarSection:`_SidebarSection_1uv88_1`,"SidebarSection-title":`_SidebarSection-title_1uv88_12`,"SidebarSection--noBorderTop":`_SidebarSection--noBorderTop_1uv88_20`,"SidebarSection-content":`_SidebarSection-content_1uv88_24`,"SidebarSection-breadcrumbLabel":`_SidebarSection-breadcrumbLabel_1uv88_33`,"SidebarSection-breadcrumbs":`_SidebarSection-breadcrumbs_1uv88_62`,"SidebarSection-breadcrumb":`_SidebarSection-breadcrumb_1uv88_33`,"SidebarSection-heading":`_SidebarSection-heading_1uv88_74`,"SidebarSection-loadingOverlay":`_SidebarSection-loadingOverlay_1uv88_78`}),sb=({children:e,title:t,background:n,showBreadcrumbs:r,noBorderTop:i,isLoading:a})=>(0,I.jsxs)(`div`,{className:ob({noBorderTop:i}),style:{background:n},children:[(0,I.jsx)(`div`,{className:ob(`title`),children:(0,I.jsxs)(`div`,{className:ob(`breadcrumbs`),children:[r&&(0,I.jsx)(oy,{}),(0,I.jsx)(`div`,{className:ob(`heading`),children:(0,I.jsx)(pg,{rank:`2`,size:`xs`,children:t})})]})}),(0,I.jsx)(`div`,{className:ob(`content`),children:e}),a&&(0,I.jsx)(`div`,{className:ob(`loadingOverlay`),children:(0,I.jsx)(y,{size:32})})]});c(),c(),c();var cb={ViewportControls:`_ViewportControls_v26yb_1`,"ViewportControls--fullScreen":`_ViewportControls--fullScreen_v26yb_5`,"ViewportControls-toggleButton":`_ViewportControls-toggleButton_v26yb_14`,"ViewportControls-actions":`_ViewportControls-actions_v26yb_39`,"ViewportControls-actionsInner":`_ViewportControls-actionsInner_v26yb_43`,"ViewportControls--isExpanded":`_ViewportControls--isExpanded_v26yb_67`,"ViewportControls-divider":`_ViewportControls-divider_v26yb_72`,"ViewportControls-zoomSelect":`_ViewportControls-zoomSelect_v26yb_79`,"ViewportControls-zoom":`_ViewportControls-zoom_v26yb_79`,"ViewportButton-inner":`_ViewportButton-inner_v26yb_110`,"ViewportButton--isActive":`_ViewportButton--isActive_v26yb_118`},lb={Smartphone:(0,I.jsx)(ye,{size:16}),Tablet:(0,I.jsx)(Ae,{size:16}),Monitor:(0,I.jsx)(pe,{size:16}),FullWidth:(0,I.jsx)(be,{size:16})},ub=a(`ViewportControls`,cb),db=a(`ViewportButton`,cb),fb=({children:e,title:t,onClick:n,isActive:r,disabled:i})=>(0,I.jsx)(`span`,{className:db({isActive:r}),suppressHydrationWarning:!0,children:(0,I.jsx)(A,{type:`button`,title:t,disabled:i||r,onClick:n,suppressHydrationWarning:!0,children:(0,I.jsx)(`span`,{className:db(`inner`),children:e})})}),pb=[{label:`25%`,value:.25},{label:`50%`,value:.5},{label:`75%`,value:.75},{label:`100%`,value:1},{label:`125%`,value:1.25},{label:`150%`,value:1.5},{label:`200%`,value:2}],mb=({autoZoom:e,zoom:t,onViewportChange:n,onZoom:r,fullScreen:i})=>{let a=P(e=>e.viewports),o=P(e=>e.state.ui.viewports),s=pb.find(t=>t.value===e),c=(0,F.useMemo)(()=>[...pb,...s?[]:[{value:e,label:`${(e*100).toFixed(0)}% (Auto)`}]].filter(t=>t.value<=e).sort((e,t)=>e.value>t.value?1:-1),[e]),[l,u]=(0,F.useState)(o.current.width);(0,F.useEffect)(()=>{u(o.current.width)},[o.current]);let[d,f]=(0,F.useState)(!1);return(0,I.jsxs)(`div`,{className:ub({isExpanded:d,fullScreen:i}),suppressHydrationWarning:!0,children:[(0,I.jsx)(`div`,{className:ub(`actions`),children:(0,I.jsxs)(`div`,{className:ub(`actionsInner`),children:[a.map((e,t)=>(0,I.jsx)(fb,{title:e.label?`Switch to ${e.label} viewport`:`Switch viewport`,onClick:()=>{u(e.width),n(e)},isActive:l===e.width,children:typeof e.icon==`string`?lb[e.icon]||e.icon:e.icon||lb.Smartphone},t)),(0,I.jsx)(`div`,{className:ub(`divider`)}),(0,I.jsx)(fb,{title:`Zoom viewport out`,disabled:t<=c[0]?.value,onClick:e=>{e.stopPropagation(),r(c[Math.max(c.findIndex(e=>e.value===t)-1,0)].value)},children:(0,I.jsx)(De,{size:16})}),(0,I.jsx)(fb,{title:`Zoom viewport in`,disabled:t>=c[c.length-1]?.value,onClick:e=>{e.stopPropagation(),r(c[Math.min(c.findIndex(e=>e.value===t)+1,c.length-1)].value)},children:(0,I.jsx)(nt,{size:16})}),(0,I.jsxs)(`div`,{className:ub(`zoom`),children:[(0,I.jsx)(`div`,{className:ub(`divider`)}),(0,I.jsx)(`select`,{className:ub(`zoomSelect`),value:t.toString(),onClick:e=>{e.stopPropagation()},onChange:e=>{r(parseFloat(e.currentTarget.value))},children:c.map(e=>(0,I.jsx)(`option`,{value:e.value,label:e.label},e.label))})]})]})}),(0,I.jsx)(`button`,{className:ub(`toggleButton`),title:`Toggle viewport menu`,onClick:()=>f(e=>!e),children:d?(0,I.jsx)(Ye,{size:16}):(0,I.jsx)(pe,{size:16})})]})};c();var hb={PuckCanvas:`_PuckCanvas_zw9iy_1`,"PuckCanvas-controls":`_PuckCanvas-controls_zw9iy_18`,"PuckCanvas--fullScreen":`_PuckCanvas--fullScreen_zw9iy_23`,"PuckCanvas-inner":`_PuckCanvas-inner_zw9iy_34`,"PuckCanvas-root":`_PuckCanvas-root_zw9iy_43`,"PuckCanvas--ready":`_PuckCanvas--ready_zw9iy_68`,"PuckCanvas-loader":`_PuckCanvas-loader_zw9iy_73`,"PuckCanvas--showLoader":`_PuckCanvas--showLoader_zw9iy_84`};c();var gb=(0,F.createContext)(null),_b=({children:e})=>{let t=(0,F.useRef)(null),n=(0,F.useMemo)(()=>({frameRef:t}),[]);return(0,I.jsx)(gb.Provider,{value:n,children:e})},vb=()=>{let e=(0,F.useContext)(gb);if(e===null)throw Error(`useCanvasFrame must be used within a FrameProvider`);return e},yb=a(`PuckCanvas`,hb),bb=!0,xb=150,Sb=()=>{let{frameRef:t}=vb(),n=g(t),{viewports:r=oe,ui:i}=Kb(),{dispatch:a,overrides:s,setUi:c,zoomConfig:l,setZoomConfig:u,status:d,iframe:f,_experimentalFullScreenCanvas:p}=P(On(e=>({dispatch:e.dispatch,overrides:e.overrides,setUi:e.setUi,zoomConfig:e.zoomConfig,setZoomConfig:e.setZoomConfig,status:e.status,iframe:e.iframe,_experimentalFullScreenCanvas:e._experimentalFullScreenCanvas}))),{leftSideBarVisible:m,rightSideBarVisible:h,leftSideBarWidth:_,rightSideBarWidth:v,viewports:b}=P(On(e=>({leftSideBarVisible:e.state.ui.leftSideBarVisible,rightSideBarVisible:e.state.ui.rightSideBarVisible,leftSideBarWidth:e.state.ui.leftSideBarWidth,rightSideBarWidth:e.state.ui.rightSideBarWidth,viewports:e.state.ui.viewports}))),[x,S]=(0,F.useState)(!1),C=(0,F.useRef)(!1),ee=(0,F.useMemo)(()=>({children:e})=>(0,I.jsx)(I.Fragment,{children:e}),[]),w=(0,F.useMemo)(()=>s.preview||ee,[s]),te=(0,F.useCallback)(()=>{if(t.current){let e=t.current,n=ke(e);return{width:n.contentBox.width,height:n.contentBox.height}}return{width:0,height:0}},[t]);(0,F.useEffect)(()=>{n()},[t,m,h,_,v,b]),(0,F.useEffect)(()=>{let{height:t}=te();b.current.height===`auto`&&u(e(o({},l),{rootHeight:t/l.zoom}))},[l.zoom,te,u]),(0,F.useEffect)(()=>{bb&&n()},[b.current.width,b]),(0,F.useEffect)(()=>{if(!t.current)return;let e=new ResizeObserver(()=>{C.current||n()});return e.observe(t.current),()=>{e.disconnect()}},[t.current]);let[T,E]=(0,F.useState)(!1);(0,F.useEffect)(()=>{setTimeout(()=>{E(!0)},500)},[]);let D=Pe();return(0,F.useEffect)(()=>{if(typeof window>`u`||i?.viewports?.current)return;let n=window.innerWidth,a=t.current?.getBoundingClientRect().width;if(!n||!a||r.length===0)return;let s=Object.values(r).find(e=>e.width===`100%`),c=!!s,l=Object.entries(r).filter(([e,t])=>t.width!==`100%`).map(([e,t])=>({key:e,diff:Math.abs(n-(typeof t.width==`string`?n:t.width)),value:t})).sort((e,t)=>e.diff>t.diff?1:-1)[0].value;if(l.width<a&&c&&(l=s),f.enabled){let t=D.getState(),n={state:e(o({},t.state),{ui:e(o({},t.state.ui),{viewports:e(o({},t.state.ui.viewports),{current:e(o({},t.state.ui.viewports.current),{height:l?.height||`auto`,width:l?.width})})})})},r=t.history;t.history.histories.length===1&&(r=e(o({},r),{histories:[n]})),D.setState(e(o({},n),{history:r}))}},[r,t.current,f,D,i?.viewports?.current]),(0,I.jsxs)(`div`,{className:yb({ready:d===`READY`||!f.enabled||!f.waitForStyles,showLoader:T,fullScreen:p}),onClick:e=>{let t=e.target;!t.hasAttribute(`data-puck-component`)&&!t.hasAttribute(`data-puck-dropzone`)&&a({type:`setUi`,ui:{itemSelector:null},recordHistory:!1})},children:[b.controlsVisible&&f.enabled&&(0,I.jsx)(`div`,{className:yb(`controls`),children:(0,I.jsx)(mb,{fullScreen:p,autoZoom:l.autoZoom,zoom:l.zoom,onViewportChange:t=>{S(!0),C.current=!0;let r=e(o({},t),{height:t.height||`auto`,zoom:l.zoom});c({viewports:e(o({},b),{current:r})}),bb&&n({viewports:e(o({},b),{current:r})})},onZoom:t=>{S(!0),C.current=!0,u(e(o({},l),{zoom:t}))}})}),(0,I.jsxs)(`div`,{className:yb(`inner`),ref:t,children:[(0,I.jsx)(`div`,{className:yb(`root`),style:{width:f.enabled?b.current.width:`100%`,height:l.rootHeight,transform:f.enabled?`scale(${l.zoom})`:void 0,transition:x?`width ${xb}ms ease-out, height ${xb}ms ease-out, transform ${xb}ms ease-out`:``,overflow:f.enabled?void 0:`auto`},suppressHydrationWarning:!0,id:`puck-canvas-root`,onTransitionEnd:()=>{S(!1),C.current=!1},children:(0,I.jsx)(w,{children:(0,I.jsx)(Xy,{})})}),(0,I.jsx)(`div`,{className:yb(`loader`),children:(0,I.jsx)(y,{size:24})})]})]})};c();function Cb(t,n){let[r,i]=(0,F.useState)(null),a=(0,F.useRef)(null),s=P(e=>t===`left`?e.state.ui.leftSideBarWidth:e.state.ui.rightSideBarWidth);return(0,F.useEffect)(()=>{if(typeof window<`u`&&!s)try{let e=localStorage.getItem(`puck-sidebar-widths`);if(e){let r=JSON.parse(e)[t];r&&n({type:`setUi`,ui:{[t===`left`?`leftSideBarWidth`:`rightSideBarWidth`]:r}})}}catch(e){console.error(`Failed to load ${t} sidebar width from localStorage`,e)}},[n,t,s]),(0,F.useEffect)(()=>{s!==void 0&&i(s)},[s]),{width:r,setWidth:i,sidebarRef:a,handleResizeEnd:(0,F.useCallback)(r=>{n({type:`setUi`,ui:{[t===`left`?`leftSideBarWidth`:`rightSideBarWidth`]:r}});let i={};try{let e=localStorage.getItem(`puck-sidebar-widths`);i=e?JSON.parse(e):{}}catch(e){console.error(`Failed to save ${t} sidebar width to localStorage`,e)}finally{localStorage.setItem(`puck-sidebar-widths`,JSON.stringify(e(o({},i),{[t]:r})))}window.dispatchEvent(new CustomEvent(`viewportchange`,{bubbles:!0,cancelable:!1}))},[n,t])}}c(),c(),c();var wb=a(`ResizeHandle`,{ResizeHandle:`_ResizeHandle_144bf_2`,"ResizeHandle--left":`_ResizeHandle--left_144bf_16`,"ResizeHandle--right":`_ResizeHandle--right_144bf_20`}),Tb=({position:e,sidebarRef:t,onResize:n,onResizeEnd:r})=>{let{frameRef:i}=vb(),a=g(i),o=(0,F.useRef)(null),s=(0,F.useRef)(!1),c=(0,F.useRef)(0),l=(0,F.useRef)(0),u=(0,F.useCallback)(t=>{if(!s.current)return;let r=t.clientX-c.current,i=e===`left`?l.current+r:l.current-r;n(Math.max(192,i)),t.preventDefault()},[n,e]),d=(0,F.useCallback)(()=>{if(!s.current)return;s.current=!1,document.body.style.cursor=``,document.body.style.userSelect=``;let e=document.getElementById(`resize-overlay`);e&&document.body.removeChild(e),document.removeEventListener(`mousemove`,u),document.removeEventListener(`mouseup`,d),r(t.current?.getBoundingClientRect().width||0),a()},[r]),f=(0,F.useCallback)(e=>{s.current=!0,c.current=e.clientX,l.current=t.current?.getBoundingClientRect().width||0,document.body.style.cursor=`col-resize`,document.body.style.userSelect=`none`;let n=document.createElement(`div`);n.id=`resize-overlay`,n.setAttribute(`data-resize-overlay`,``),document.body.appendChild(n),document.addEventListener(`mousemove`,u),document.addEventListener(`mouseup`,d),e.preventDefault()},[e,u,d]);return(0,I.jsx)(`div`,{ref:o,className:wb({[e]:!0}),onMouseDown:f})};c();var Eb=a(`Sidebar`,{Sidebar:`_Sidebar_16oed_1`,"Sidebar--isVisible":`_Sidebar--isVisible_16oed_10`,"Sidebar--left":`_Sidebar--left_16oed_14`,"Sidebar--right":`_Sidebar--right_16oed_34`,"Sidebar-resizeHandle":`_Sidebar-resizeHandle_16oed_51`}),Db=({position:e,sidebarRef:t,isVisible:n,onResize:r,onResizeEnd:i,children:a})=>(0,I.jsxs)(I.Fragment,{children:[(0,I.jsx)(`div`,{ref:t,className:Eb({[e]:!0,isVisible:n}),children:a}),(0,I.jsx)(`div`,{className:`${Eb(`resizeHandle`)}`,children:(0,I.jsx)(Tb,{position:e,sidebarRef:t,onResize:r,onResizeEnd:i})})]});c();var Ob=e=>{let t=e;for(;t&&t!==document.body;){let e=window.getComputedStyle(t);if(e.display===`none`||e.visibility===`hidden`||e.opacity===`0`||t.getAttribute(`aria-hidden`)===`true`||t.hasAttribute(`hidden`))return!1;t=t.parentElement}return!0},kb=e=>{if(e?.defaultPrevented)return!0;let t=(e?.composedPath)?.call(e)[0]||e?.target||document.activeElement;if(t instanceof HTMLElement){let e=t.tagName.toLowerCase();if(e===`input`||e===`textarea`||e===`select`||t.isContentEditable)return!0;let n=t.getAttribute(`role`);if(n===`textbox`||n===`combobox`||n===`searchbox`||n===`listbox`||n===`grid`)return!0}let n=document.querySelector(`dialog[open], [aria-modal="true"], [role="dialog"], [role="alertdialog"]`);return!!(n&&Ob(n))},Ab=()=>{let e=Pe(),t=(0,F.useCallback)(t=>{if(kb(t))return!1;let{state:n,dispatch:r,permissions:i,selectedItem:a}=e.getState(),o=n.ui?.itemSelector;return!o?.zone||!a||!i.getPermissions({item:a}).delete||r({type:`remove`,index:o.index,zone:o.zone}),!0},[e]);ct({delete:!0},t),ct({backspace:!0},t)};c(),c();var jb={Nav:`_Nav_vll2r_1`,"Nav-list":`_Nav-list_vll2r_5`,"Nav-mobileActions":`_Nav-mobileActions_vll2r_23`,"NavItem-link":`_NavItem-link_vll2r_39`,NavItem:`_NavItem_vll2r_39`,"NavItem-linkIcon":`_NavItem-linkIcon_vll2r_90`,"NavItem--active":`_NavItem--active_vll2r_100`,"NavItem--mobileOnly":`_NavItem--mobileOnly_vll2r_136`,"NavItem--desktopOnly":`_NavItem--desktopOnly_vll2r_141`},Mb=a(`Nav`,jb),Nb=a(`NavItem`,jb),Pb=({label:e,icon:t,onClick:n,isActive:r,mobileOnly:i,desktopOnly:a})=>(0,I.jsx)(`li`,{className:Nb({active:r,mobileOnly:i,desktopOnly:a}),children:n&&(0,I.jsxs)(`div`,{className:Nb(`link`),onClick:n,children:[t&&(0,I.jsx)(`span`,{className:Nb(`linkIcon`),children:t}),(0,I.jsx)(`span`,{className:Nb(`linkLabel`),children:e})]})}),Fb=({items:e,mobileActions:t})=>(0,I.jsxs)(`nav`,{className:Mb(),children:[(0,I.jsx)(`ul`,{className:Mb(`list`),children:Object.entries(e).map(([e,t])=>(0,I.jsx)(Pb,o({},t),e))}),t&&(0,I.jsx)(`div`,{className:Mb(`mobileActions`),children:t})]});c();var Ib=e=>o({enabled:!0,waitForStyles:!0,syncHostStyles:!0},e),Lb=a(`Puck`,$y),Rb=a(`PuckLayout`,$y),zb=a(`PuckPluginTab`,$y),Bb=typeof window>`u`?F.useEffect:F.useLayoutEffect,Vb=()=>(0,I.jsx)(sb,{noBorderTop:!0,showBreadcrumbs:!0,title:P(e=>e.selectedItem?e.config.components[e.selectedItem.type]?.label??e.selectedItem.type.toString():e.config.root?.label||`Page`),children:(0,I.jsx)(fy,{})}),Hb=({children:e,visible:t,mobileOnly:n})=>(0,I.jsx)(`div`,{className:zb({visible:t,mobileOnly:n}),children:(0,I.jsx)(`div`,{className:zb(`body`),children:e})}),Ub=({children:e})=>{let{iframe:t,dnd:n,initialHistory:r,plugins:i,height:a}=Kb(),s=(0,F.useMemo)(()=>Ib(t),[t]);jy();let c=P(e=>e.dispatch),l=P(e=>e.state.ui.leftSideBarVisible),u=P(e=>e.state.ui.rightSideBarVisible),d=P(e=>e.instanceId),{width:f,setWidth:p,sidebarRef:m,handleResizeEnd:h}=Cb(`left`,c),{width:g,setWidth:_,sidebarRef:v,handleResizeEnd:y}=Cb(`right`,c);(0,F.useEffect)(()=>{window.matchMedia(`(min-width: 638px)`).matches||c({type:`setUi`,ui:{leftSideBarVisible:!1,rightSideBarVisible:!1}});let e=()=>{window.matchMedia(`(min-width: 638px)`).matches||c({type:`setUi`,ui:e=>o(o({},e),e.rightSideBarVisible?{leftSideBarVisible:!1}:{})})};return window.addEventListener(`resize`,e),()=>{window.removeEventListener(`resize`,e)}},[]);let b=P(e=>e.overrides),x=(0,F.useMemo)(()=>b.puck||eb,[b]),[S,C]=(0,F.useState)(!1);Bb(()=>{C(!0)},[]);let ee=P(e=>e.status===`READY`);pt(),(0,F.useEffect)(()=>{if(ee&&s.enabled){let e=s_();if(e)return Me(e)}},[ee,s.enabled]),tb(),Ab();let w={};f&&(w[`--puck-user-sidebar-left-width`]=`${f}px`),g&&(w[`--puck-user-sidebar-right-width`]=`${g}px`);let te=P(e=>e.setUi),T=P(e=>e.state.ui.plugin?.current),E=Pe(),[D,O]=(0,F.useState)(`toggle`),ne=(0,F.useMemo)(()=>!!i?.find(e=>e.name===`legacy-side-bar`),[i]),re=(0,F.useMemo)(()=>{let e={},t=[Nv(),ny()],n=e=>e.name===`legacy-side-bar`?-1:0,r=[...t,...i??[]].sort((e,t)=>n(e)-n(t));return i?.some(e=>e.name===`fields`)||r.push(hy()),r?.forEach(t=>{t.name&&t.render&&(e[t.name]&&delete e[t.name],e[t.name]={label:t.label??t.name,icon:t.icon??(0,I.jsx)(it,{}),onClick:()=>{O(t.mobilePanelHeight??`toggle`),t.name===T?te(l?{leftSideBarVisible:!1}:{leftSideBarVisible:!0}):t.name&&te({plugin:{current:t.name},leftSideBarVisible:!0})},isActive:l&&T===t.name,render:t.render,mobileOnly:ne||t.mobileOnly,desktopOnly:t.name===`legacy-side-bar`||t.desktopOnly})}),e},[i,T,E,l]);(0,F.useEffect)(()=>{T||te({plugin:{current:Object.keys(re)[0]}})},[re,T]);let ie=re.fields&&re.fields.mobileOnly===!1,ae=P(e=>e.state.ui.mobilePanelExpanded??!1);return(0,I.jsxs)(`div`,{className:`Puck ${Lb({hidePlugins:ne})}`,id:d,style:{height:a,visibility:`hidden`},children:[(0,I.jsx)(D_,{disableAutoScroll:n?.disableAutoScroll,children:(0,I.jsx)(x,{children:e||(0,I.jsx)(_b,{children:(0,I.jsx)(`div`,{className:Rb({leftSideBarVisible:l,mounted:S,rightSideBarVisible:!ie&&u,isExpanded:ae,mobilePanelHeightToggle:D===`toggle`,mobilePanelHeightMinContent:D===`min-content`}),style:{height:a},children:(0,I.jsxs)(`div`,{className:Rb(`inner`),style:w,children:[(0,I.jsx)(`div`,{className:Rb(`header`),children:(0,I.jsx)(ab,{hidePlugins:ne})}),(0,I.jsx)(`div`,{className:Rb(`nav`),children:(0,I.jsx)(Fb,{items:re,mobileActions:l&&D===`toggle`&&(0,I.jsx)(A,{type:`button`,title:`maximize`,onClick:()=>{te({mobilePanelExpanded:!ae})},children:ae?(0,I.jsx)(mt,{size:21}):(0,I.jsx)(ce,{size:21})})})}),(0,I.jsx)(Db,{position:`left`,sidebarRef:m,isVisible:l,onResize:p,onResizeEnd:h,children:Object.entries(re).map(([e,{mobileOnly:t,render:n,label:r}])=>(0,I.jsx)(Hb,{visible:T===e,mobileOnly:t,children:(0,I.jsx)(n,{})},e))}),(0,I.jsx)(Sb,{}),!ie&&(0,I.jsx)(Db,{position:`right`,sidebarRef:v,isVisible:u,onResize:_,onResizeEnd:y,children:(0,I.jsx)(Vb,{})})]})})})})}),(0,I.jsx)(`div`,{id:`puck-portal-root`,className:Lb(`portal`)})]})},Wb=(0,F.createContext)({});function Gb(e){return(0,I.jsx)(Wb.Provider,{value:e,children:e.children})}var Kb=()=>(0,F.useContext)(Wb);function qb({children:t}){let{config:n,data:r,ui:i,onChange:a,permissions:s={},plugins:c,overrides:l,viewports:u=oe,iframe:d,initialHistory:f,metadata:p,onAction:m,fieldTransforms:h,_experimentalFullScreenCanvas:g,_experimentalVirtualization:v}=Kb(),y=(0,F.useMemo)(()=>Ib(d),[d]),[x]=(0,F.useState)(()=>{let t=o(o({},_.ui),i),a={};Object.keys(r?.root||{}).length>0&&!r?.root?.props&&console.warn("Warning: Defining props on `root` is deprecated. Please use `root.props`, or republish this page to migrate automatically.");let s=r?.root?.props||r?.root||{},c=o(o({},n.root?.defaultProps),s),l=b(fe(e(o({},r?.root),{props:c})),n);return ge(e(o({},_),{data:e(o({},r),{root:e(o({},r?.root),{props:l.props}),content:r.content||[]}),ui:e(o(o({},t),a),{componentList:n.categories?Object.entries(n.categories).reduce((t,[n,r])=>e(o({},t),{[n]:{title:r.title,components:r.components,expanded:r.defaultExpanded,visible:r.visible}}),{}):{}})}),n)}),{appendData:S=!0}=f||{},[C]=(0,F.useState)([...f?.histories||[],...S?[{state:x}]:[]].map(t=>{let r=o(o({},x),t.state);return t.state.indexes||(r=ge(r,n)),e(o({},t),{state:r})})),ee=(0,F.useMemo)(()=>f?.index!==void 0&&f?.index>=0&&f?.index<C.length?f?.index:C.length-1,[]),w=C[ee].state,te=Qy({overrides:l,plugins:c}),T=(0,F.useMemo)(()=>o(o({},(c||[]).reduce((e,t)=>o(o({},e),t.fieldTransforms),{})),h),[h,c]),E=Ag(),D=(0,F.useCallback)(e=>({instanceId:E,state:e,config:n,plugins:c||[],overrides:te,viewports:u,iframe:y,_experimentalFullScreenCanvas:!!g,_experimentalVirtualization:!!v,onAction:m,metadata:p,fieldTransforms:T}),[E,w,n,c,te,u,y,g,v,m,p,T]),[O]=(0,F.useState)(()=>ot(D(w)));(0,F.useEffect)(()=>{},[O]),(0,F.useEffect)(()=>{let e=O.getState().state;O.setState(o({},D(e)))},[D]),dt(O,{histories:C,index:ee,initialAppState:w});let ne=(0,F.useRef)(null);(0,F.useEffect)(()=>O.subscribe(e=>e.state.data,e=>{if(a){if(Ve(e,ne.current))return;a(e),ne.current=e}}),[a]),le(O,s);let re=Ev(O);return(0,F.useEffect)(()=>{let{resolveAndCommitData:e}=O.getState();setTimeout(()=>{e()},0)},[]),(0,I.jsx)(Ue.Provider,{value:O,children:(0,I.jsx)(wv.Provider,{value:re,children:t})})}function Jb(t){return(0,I.jsx)(Gb,e(o({},t),{children:(0,I.jsx)(qb,e(o({},t),{children:(0,I.jsx)(Ub,{children:t.children})}))}))}Jb.Components=jv,Jb.Fields=fy,Jb.Layout=Ub,Jb.Outline=ey,Jb.Preview=Xy,c(),c(),c(),c(),c(),c(),c(),c(),c(),c(),c(),c(),c(),c();var Yb=`project-cyan:puck-inline-edit`,Xb=[{key:`eyebrow`,label:`상단 보조 문구`},{key:`title`,label:`제목`},{key:`summaryTitle`,label:`섹션 제목`},{key:`summaryBody`,label:`섹션 설명`,kind:`textarea`},{key:`heroImageUrl`,label:`대표 이미지 URL`}],Zb=[{key:`navHome`,label:`메뉴 Home`},{key:`navArtists`,label:`메뉴 Artists`},{key:`navGoods`,label:`메뉴 Goods`},{key:`navCart`,label:`메뉴 Cart`},{key:`statusSignalLabel`,label:`상태 라벨`},{key:`statusReadyLabel`,label:`상태 Live`},{key:`statusLoadingLabel`,label:`상태 Loading`},{key:`statusErrorLabel`,label:`상태 Offline`},{key:`statusModeLabel`,label:`모드 라벨`},{key:`artistsEyebrow`,label:`아티스트 보조 문구`},{key:`artistsTitle`,label:`아티스트 제목`},{key:`physicalEyebrow`,label:`실물 굿즈 보조 문구`},{key:`physicalTitle`,label:`실물 굿즈 제목`},{key:`physicalCta`,label:`실물 굿즈 버튼`},{key:`digitalEyebrow`,label:`디지털 보조 문구`},{key:`digitalTitle`,label:`디지털 제목`},{key:`digitalCta`,label:`디지털 버튼`},{key:`digitalFeatureEyebrow`,label:`디지털 드롭 라벨`},{key:`digitalFeatureDescription`,label:`디지털 드롭 설명`,kind:`textarea`},{key:`digitalFeatureCta`,label:`디지털 드롭 버튼`},{key:`byArtistEyebrow`,label:`아티스트별 굿즈 보조 문구`},{key:`byArtistTitle`,label:`아티스트별 굿즈 제목`},{key:`byArtistCta`,label:`아티스트별 굿즈 버튼`},{key:`categoryEyebrow`,label:`카테고리 보조 문구`},{key:`categoryTitle`,label:`카테고리 제목`},{key:`categoryCta`,label:`카테고리 버튼`},{key:`footerEyebrow`,label:`하단 보조 문구`},{key:`footerTitle`,label:`하단 제목`},{key:`footerShopTitle`,label:`Shop 컬럼 제목`},{key:`footerShopAllGoods`,label:`Shop 전체 굿즈`},{key:`footerShopPhysicalGoods`,label:`Shop 실물 굿즈`},{key:`footerShopDigitalGoods`,label:`Shop 디지털 굿즈`},{key:`footerArtistTitle`,label:`Artist 컬럼 제목`},{key:`footerArtistArtistsPage`,label:`Artist 페이지`},{key:`footerArtistGroups`,label:`Artist 그룹`},{key:`footerArtistGoodsByArtist`,label:`Artist별 굿즈`},{key:`footerAccountTitle`,label:`Account 컬럼 제목`},{key:`footerAccountSignIn`,label:`Account 로그인`},{key:`footerAccountCart`,label:`Account 장바구니`},{key:`footerAccountLikes`,label:`Account 좋아요`},{key:`footerInfoTitle`,label:`Info 컬럼 제목`},{key:`footerInfoTop`,label:`Info 상단`},{key:`footerInfoCategories`,label:`Info 카테고리`},{key:`footerBottomLabel`,label:`하단 제작사`},{key:`footerBackToFirst`,label:`첫 페이지 이동`}],Qb=[{key:`broadcastStrip`,label:`방송 스트립`,kind:`textarea`},{key:`navHome`,label:`메뉴 Home`},{key:`navArtists`,label:`메뉴 Artists`},{key:`navGoods`,label:`메뉴 Goods`},{key:`navCart`,label:`메뉴 Cart`},{key:`statsArtistsLabel`,label:`요약 Artists`},{key:`statsModeLabel`,label:`요약 Mode`},{key:`statsViewLabel`,label:`요약 View`},{key:`statsViewValue`,label:`View 값`},{key:`statusLoadingLabel`,label:`상태 Loading`},{key:`statusLiveLabel`,label:`상태 Live`},{key:`statusPreviewLabel`,label:`상태 Preview`},{key:`channelWorld`,label:`채널 WORLD`},{key:`channelArea`,label:`채널 AREA`},{key:`channelCharacter`,label:`채널 CHARACTER`},{key:`channelMusic`,label:`채널 MUSIC`},{key:`profileBpmLabel`,label:`BPM 라벨`},{key:`profileDebutLabel`,label:`Debut 라벨`},{key:`profileCollectionsLabel`,label:`Collections 라벨`},{key:`profileSignalLabel`,label:`Signal 라벨`},{key:`artistGoodsCta`,label:`아티스트 굿즈 버튼`},{key:`groupGoodsCta`,label:`그룹 굿즈 버튼`},{key:`indexEyebrow`,label:`인덱스 보조 문구`},{key:`indexTitle`,label:`인덱스 제목`},{key:`indexGroupGoodsCta`,label:`인덱스 그룹 굿즈`},{key:`pagerIndexLabel`,label:`페이저 인덱스`}],Q={eyebrow:`Project Cyan`,title:`Project Cyan SHOP`,summaryTitle:`Official shop signal`,summaryBody:`A vertical shop map for characters, physical goods, digital drops, artist collections, and category browsing.`,navHome:`Home`,navArtists:`Artists`,navGoods:`Goods`,navCart:`Cart`,statusSignalLabel:`SHOP SIGNAL`,statusReadyLabel:`Live`,statusModeLabel:`FULLPAGE MODE`,artistsEyebrow:`Cyan Idol Network`,artistsTitle:`Artist Signals`,physicalEyebrow:`Physical Goods`,physicalTitle:`Goods you can hold`,physicalCta:`View physical`,digitalEyebrow:`Digital Goods`,digitalTitle:`Voice, message, and download drops`,digitalCta:`Open digital`,digitalFeatureEyebrow:`DATA DROP`,digitalFeatureDescription:`Project Cyan channel goods for voice, message, download, or AI-assisted shopping flows.`,digitalFeatureCta:`Open drop`,byArtistEyebrow:`Goods By Artist`,byArtistTitle:`Shop from each artist channel`,byArtistCta:`Browse artist goods`,categoryEyebrow:`Goods Categories`,categoryTitle:`Browse by type`,categoryCta:`Open categories`,footerEyebrow:`Project Cyan SHOP`,footerTitle:`Official Shop Index`,footerShopTitle:`Shop`,footerArtistTitle:`Artist`,footerAccountTitle:`Account`,footerInfoTitle:`Info`,footerBottomLabel:`CYAN PRODUCTION`,footerBackToFirst:`Back to first page`},$b={eyebrow:`Cyan Character Area`,title:`CHARACTER`,summaryTitle:`CYAN`,summaryBody:`A full-screen character signal map for virtual idols, stage districts, music energy, and future-pop worlds.`,broadcastStrip:`CYAN IDOL NETWORK // AREA STREAM // MUSIC MEDIA MIX // CHARACTER SIGNAL`,navHome:`Home`,navArtists:`Artists`,navGoods:`Goods`,navCart:`Cart`,statsArtistsLabel:`Artists`,statsModeLabel:`Mode`,statsViewLabel:`View`,statsViewValue:`Stage`,statusLiveLabel:`Live`,statusPreviewLabel:`Preview`,channelWorld:`WORLD`,channelArea:`AREA`,channelCharacter:`CHARACTER`,channelMusic:`MUSIC`,profileBpmLabel:`BPM`,profileDebutLabel:`Debut`,profileCollectionsLabel:`Collections`,profileSignalLabel:`Signal`,artistGoodsCta:`이 아티스트 굿즈 보기`,groupGoodsCta:`그룹 굿즈 보기`,indexEyebrow:`Roster`,indexTitle:`Artist Index`,indexGroupGoodsCta:`그룹 굿즈 보기`,pagerIndexLabel:`All`};function ex(e,t,n=``){let r=e[t];return typeof r==`string`&&r.trim()?r:n}function tx(e,t){window.dispatchEvent(new CustomEvent(Yb,{detail:{fieldKey:e,value:t}}))}function $({as:e=`span`,className:t,fieldKey:n,fallback:r,multiline:i=!1,props:a}){let o=e,s=ex(a,n,r);function c(e){tx(n,e.currentTarget.textContent?.trim()??``)}function l(e){!i&&e.key===`Enter`&&(e.preventDefault(),e.currentTarget.blur())}return(0,I.jsx)(o,{className:t,contentEditable:!0,"data-cms-inline-edit":!0,"data-cms-inline-key":n,onBlur:c,onKeyDown:l,suppressContentEditableWarning:!0,children:s})}function nx(e){return{type:e.kind??`text`,label:e.label,placeholder:e.placeholder,contentEditable:!0}}function rx(e){return Object.fromEntries(e.map(e=>[e.key,nx(e)]))}function ix(e){let t=ex(e,`heroImageUrl`),n=t?{backgroundImage:`linear-gradient(90deg, rgb(0 0 0 / 78%), rgb(0 0 0 / 28%)), url("${t}")`}:void 0;return(0,I.jsxs)(`main`,{className:`cms-puck-preview cms-puck-home-preview`,children:[(0,I.jsxs)(`nav`,{className:`cms-puck-preview-nav`,"aria-label":`Home preview navigation`,children:[(0,I.jsx)($,{as:`span`,fieldKey:`navHome`,fallback:Q.navHome,props:e}),(0,I.jsx)($,{as:`span`,fieldKey:`navArtists`,fallback:Q.navArtists,props:e}),(0,I.jsx)($,{as:`span`,fieldKey:`navGoods`,fallback:Q.navGoods,props:e}),(0,I.jsx)($,{as:`span`,fieldKey:`navCart`,fallback:Q.navCart,props:e})]}),(0,I.jsxs)(`section`,{className:`cms-puck-hero`,style:n,children:[(0,I.jsx)($,{as:`p`,fieldKey:`eyebrow`,fallback:Q.eyebrow,props:e}),(0,I.jsx)($,{as:`h1`,fieldKey:`title`,fallback:Q.title,props:e}),(0,I.jsx)($,{as:`strong`,fieldKey:`summaryTitle`,fallback:Q.summaryTitle,props:e}),(0,I.jsxs)(`div`,{className:`cms-puck-status-strip`,children:[(0,I.jsx)($,{as:`span`,fieldKey:`statusSignalLabel`,fallback:Q.statusSignalLabel,props:e}),(0,I.jsx)($,{as:`span`,fieldKey:`statusReadyLabel`,fallback:Q.statusReadyLabel,props:e}),(0,I.jsx)($,{as:`span`,fieldKey:`statusModeLabel`,fallback:Q.statusModeLabel,props:e})]})]}),(0,I.jsxs)(`section`,{className:`cms-puck-page-strip`,children:[(0,I.jsx)(ox,{eyebrowKey:`artistsEyebrow`,eyebrowFallback:Q.artistsEyebrow,titleKey:`artistsTitle`,titleFallback:Q.artistsTitle,props:e}),(0,I.jsx)(ox,{eyebrowKey:`physicalEyebrow`,eyebrowFallback:Q.physicalEyebrow,titleKey:`physicalTitle`,titleFallback:Q.physicalTitle,actionKey:`physicalCta`,actionFallback:Q.physicalCta,props:e}),(0,I.jsx)(ox,{eyebrowKey:`digitalEyebrow`,eyebrowFallback:Q.digitalEyebrow,titleKey:`digitalTitle`,titleFallback:Q.digitalTitle,actionKey:`digitalCta`,actionFallback:Q.digitalCta,props:e})]}),(0,I.jsxs)(`section`,{className:`cms-puck-feature-grid`,children:[(0,I.jsxs)(`article`,{children:[(0,I.jsx)($,{as:`span`,fieldKey:`digitalFeatureEyebrow`,fallback:Q.digitalFeatureEyebrow,props:e}),(0,I.jsx)(`h2`,{children:`Voice Message Pack`}),(0,I.jsx)($,{as:`p`,fieldKey:`digitalFeatureDescription`,fallback:Q.digitalFeatureDescription,multiline:!0,props:e}),(0,I.jsx)(`button`,{type:`button`,children:(0,I.jsx)($,{as:`span`,fieldKey:`digitalFeatureCta`,fallback:Q.digitalFeatureCta,props:e})})]}),(0,I.jsxs)(`article`,{children:[(0,I.jsx)($,{as:`span`,fieldKey:`byArtistEyebrow`,fallback:Q.byArtistEyebrow,props:e}),(0,I.jsx)($,{as:`h2`,fieldKey:`byArtistTitle`,fallback:Q.byArtistTitle,props:e}),(0,I.jsx)(`button`,{type:`button`,children:(0,I.jsx)($,{as:`span`,fieldKey:`byArtistCta`,fallback:Q.byArtistCta,props:e})})]}),(0,I.jsxs)(`article`,{children:[(0,I.jsx)($,{as:`span`,fieldKey:`categoryEyebrow`,fallback:Q.categoryEyebrow,props:e}),(0,I.jsx)($,{as:`h2`,fieldKey:`categoryTitle`,fallback:Q.categoryTitle,props:e}),(0,I.jsx)(`button`,{type:`button`,children:(0,I.jsx)($,{as:`span`,fieldKey:`categoryCta`,fallback:Q.categoryCta,props:e})})]})]}),(0,I.jsxs)(`footer`,{className:`cms-puck-footer-preview`,children:[(0,I.jsxs)(`div`,{children:[(0,I.jsx)($,{as:`span`,fieldKey:`footerEyebrow`,fallback:Q.footerEyebrow,props:e}),(0,I.jsx)($,{as:`h2`,fieldKey:`footerTitle`,fallback:Q.footerTitle,props:e}),(0,I.jsx)($,{as:`p`,fieldKey:`summaryBody`,fallback:Q.summaryBody,multiline:!0,props:e})]}),(0,I.jsxs)(`div`,{className:`cms-puck-footer-columns`,children:[(0,I.jsx)($,{as:`strong`,fieldKey:`footerShopTitle`,fallback:Q.footerShopTitle,props:e}),(0,I.jsx)($,{as:`strong`,fieldKey:`footerArtistTitle`,fallback:Q.footerArtistTitle,props:e}),(0,I.jsx)($,{as:`strong`,fieldKey:`footerAccountTitle`,fallback:Q.footerAccountTitle,props:e}),(0,I.jsx)($,{as:`strong`,fieldKey:`footerInfoTitle`,fallback:Q.footerInfoTitle,props:e})]}),(0,I.jsxs)(`small`,{children:[(0,I.jsx)($,{as:`span`,fieldKey:`footerBottomLabel`,fallback:Q.footerBottomLabel,props:e}),` / `,(0,I.jsx)($,{as:`span`,fieldKey:`footerBackToFirst`,fallback:Q.footerBackToFirst,props:e})]})]})]})}function ax(e){let t=ex(e,`heroImageUrl`),n=t?{backgroundImage:`linear-gradient(90deg, rgb(4 5 16 / 88%), rgb(4 5 16 / 34%)), url("${t}")`}:void 0;return(0,I.jsxs)(`main`,{className:`cms-puck-preview cms-puck-artist-preview`,children:[(0,I.jsxs)(`nav`,{className:`cms-puck-preview-nav`,"aria-label":`Artist preview navigation`,children:[(0,I.jsx)($,{as:`span`,fieldKey:`navHome`,fallback:$b.navHome,props:e}),(0,I.jsx)($,{as:`span`,fieldKey:`navArtists`,fallback:$b.navArtists,props:e}),(0,I.jsx)($,{as:`span`,fieldKey:`navGoods`,fallback:$b.navGoods,props:e}),(0,I.jsx)($,{as:`span`,fieldKey:`navCart`,fallback:$b.navCart,props:e})]}),(0,I.jsxs)(`section`,{className:`cms-puck-hero cms-puck-artist-hero`,style:n,children:[(0,I.jsx)($,{as:`span`,className:`cms-puck-broadcast`,fieldKey:`broadcastStrip`,fallback:$b.broadcastStrip,multiline:!0,props:e}),(0,I.jsx)($,{as:`p`,fieldKey:`eyebrow`,fallback:$b.eyebrow,props:e}),(0,I.jsx)($,{as:`h1`,fieldKey:`title`,fallback:$b.title,props:e}),(0,I.jsx)($,{as:`strong`,fieldKey:`summaryTitle`,fallback:$b.summaryTitle,props:e}),(0,I.jsx)($,{as:`p`,fieldKey:`summaryBody`,fallback:$b.summaryBody,multiline:!0,props:e}),(0,I.jsxs)(`dl`,{className:`cms-puck-artist-stats`,children:[(0,I.jsxs)(`div`,{children:[(0,I.jsx)(`dt`,{children:(0,I.jsx)($,{as:`span`,fieldKey:`statsArtistsLabel`,fallback:$b.statsArtistsLabel,props:e})}),(0,I.jsx)(`dd`,{children:`8`})]}),(0,I.jsxs)(`div`,{children:[(0,I.jsx)(`dt`,{children:(0,I.jsx)($,{as:`span`,fieldKey:`statsModeLabel`,fallback:$b.statsModeLabel,props:e})}),(0,I.jsx)(`dd`,{children:(0,I.jsx)($,{as:`span`,fieldKey:`statusLiveLabel`,fallback:$b.statusLiveLabel,props:e})})]}),(0,I.jsxs)(`div`,{children:[(0,I.jsx)(`dt`,{children:(0,I.jsx)($,{as:`span`,fieldKey:`statsViewLabel`,fallback:$b.statsViewLabel,props:e})}),(0,I.jsx)(`dd`,{children:(0,I.jsx)($,{as:`span`,fieldKey:`statsViewValue`,fallback:$b.statsViewValue,props:e})})]})]}),(0,I.jsxs)(`div`,{className:`cms-puck-channel-row`,children:[(0,I.jsx)($,{as:`span`,fieldKey:`channelWorld`,fallback:$b.channelWorld,props:e}),(0,I.jsx)($,{as:`span`,fieldKey:`channelArea`,fallback:$b.channelArea,props:e}),(0,I.jsx)($,{as:`span`,fieldKey:`channelCharacter`,fallback:$b.channelCharacter,props:e}),(0,I.jsx)($,{as:`span`,fieldKey:`channelMusic`,fallback:$b.channelMusic,props:e})]})]}),(0,I.jsxs)(`section`,{className:`cms-puck-artist-card`,children:[(0,I.jsx)(`div`,{className:`cms-puck-artist-visual`,children:`CY`}),(0,I.jsxs)(`div`,{children:[(0,I.jsx)(`p`,{children:`AREA STREAM`}),(0,I.jsx)(`h2`,{children:`Artist Name`}),(0,I.jsx)(`strong`,{children:`GROUP NAME`}),(0,I.jsx)(`p`,{children:`아티스트 DB 소개문은 오른쪽 DB 영역에서 관리되고, 이 화면은 공통 라벨과 안내 문구를 편집합니다.`}),(0,I.jsxs)(`dl`,{children:[(0,I.jsxs)(`div`,{children:[(0,I.jsx)(`dt`,{children:(0,I.jsx)($,{as:`span`,fieldKey:`profileBpmLabel`,fallback:$b.profileBpmLabel,props:e})}),(0,I.jsx)(`dd`,{children:`142`})]}),(0,I.jsxs)(`div`,{children:[(0,I.jsx)(`dt`,{children:(0,I.jsx)($,{as:`span`,fieldKey:`profileDebutLabel`,fallback:$b.profileDebutLabel,props:e})}),(0,I.jsx)(`dd`,{children:`2026`})]}),(0,I.jsxs)(`div`,{children:[(0,I.jsx)(`dt`,{children:(0,I.jsx)($,{as:`span`,fieldKey:`profileCollectionsLabel`,fallback:$b.profileCollectionsLabel,props:e})}),(0,I.jsx)(`dd`,{children:`3`})]}),(0,I.jsxs)(`div`,{children:[(0,I.jsx)(`dt`,{children:(0,I.jsx)($,{as:`span`,fieldKey:`profileSignalLabel`,fallback:$b.profileSignalLabel,props:e})}),(0,I.jsx)(`dd`,{children:`POP`})]})]}),(0,I.jsxs)(`div`,{className:`cms-puck-action-row`,children:[(0,I.jsx)(`button`,{type:`button`,children:(0,I.jsx)($,{as:`span`,fieldKey:`artistGoodsCta`,fallback:$b.artistGoodsCta,props:e})}),(0,I.jsx)(`button`,{type:`button`,children:(0,I.jsx)($,{as:`span`,fieldKey:`groupGoodsCta`,fallback:$b.groupGoodsCta,props:e})})]})]})]}),(0,I.jsxs)(`section`,{className:`cms-puck-index-preview`,children:[(0,I.jsx)($,{as:`p`,fieldKey:`indexEyebrow`,fallback:$b.indexEyebrow,props:e}),(0,I.jsx)($,{as:`h2`,fieldKey:`indexTitle`,fallback:$b.indexTitle,props:e}),(0,I.jsx)($,{as:`span`,fieldKey:`pagerIndexLabel`,fallback:$b.pagerIndexLabel,props:e}),(0,I.jsx)(`button`,{type:`button`,children:(0,I.jsx)($,{as:`span`,fieldKey:`indexGroupGoodsCta`,fallback:$b.indexGroupGoodsCta,props:e})})]})]})}function ox({eyebrowKey:e,eyebrowFallback:t,titleKey:n,titleFallback:r,actionKey:i,actionFallback:a,props:o}){return(0,I.jsxs)(`article`,{children:[(0,I.jsx)($,{as:`span`,fieldKey:e,fallback:t,props:o}),(0,I.jsx)($,{as:`h2`,fieldKey:n,fallback:r,props:o}),i&&a&&(0,I.jsx)(`button`,{type:`button`,children:(0,I.jsx)($,{as:`span`,fieldKey:i,fallback:a,props:o})})]})}var sx={components:{HomeCmsScreen:{label:`홈 화면`,fields:rx([...Xb,...Zb]),render:ix}}},cx={components:{ArtistCmsScreen:{label:`아티스트 화면`,fields:rx([...Xb,...Qb]),render:ax}}};function lx(e,t){let n=e.elements.namedItem(t);return n instanceof HTMLInputElement||n instanceof HTMLTextAreaElement||n instanceof HTMLSelectElement?n:null}function ux(e,t){return lx(e,t)?.value??``}function dx(e,t,n){let r=lx(e,t);r&&(r.value=typeof n==`string`?n:``)}function fx(e){return e===`home`?Zb:Qb}function px(e){return e===`home`?`HomeCmsScreen`:`ArtistCmsScreen`}function mx(e){return e===`home`?`홈 화면 시각 편집`:`아티스트 화면 시각 편집`}function hx(e,t){let n={};return Xb.forEach(t=>{n[t.key]=ux(e,t.key)}),fx(t).forEach(t=>{n[t.key]=ux(e,`copySettings[${t.key}]`)}),n}function gx(e,t){return{content:[{type:px(t),props:{id:`${t}-cms-screen`,...hx(e,t)}}],root:{props:{title:mx(t)}}}}function _x(e,t){let n=Array.isArray(e.content)?e.content:[];return(n.find(e=>e.type===px(t))??n[0])?.props??{}}function vx(e,t,n){let r=_x(t,n);Xb.forEach(t=>{dx(e,t.key,r[t.key])}),fx(n).forEach(t=>{dx(e,`copySettings[${t.key}]`,r[t.key])})}function yx(e,t,n,r){let i=Array.isArray(e.content)?e.content:[],a=px(t),o=i.map((e,t)=>e.type!==a&&t!==0?e:{...e,props:{...e.props??{},[n]:r}});return{...e,content:o}}function bx({form:e,pageKey:t}){let n=t===`home`?sx:cx,[r,i]=(0,F.useState)(()=>gx(e,t)),a=(0,F.useMemo)(()=>mx(t),[t]);function o(n){i(n),vx(e,n,t)}function s(){e.requestSubmit()}return(0,F.useEffect)(()=>{function n(n){let r=n.detail;r?.fieldKey&&i(n=>{let i=yx(n,t,r.fieldKey,r.value);return vx(e,i,t),i})}return window.addEventListener(Yb,n),()=>{window.removeEventListener(Yb,n)}},[e,t]),(0,I.jsx)(Jb,{config:n,data:r,headerTitle:a,iframe:{enabled:!1},onChange:o,onPublish:s,permissions:{delete:!1,drag:!1,duplicate:!1,edit:!0,insert:!1}})}function xx(){let e=document.querySelector(`[data-puck-cms-editor]`);if(!e)return;let t=e.dataset.pageKey===`artists`?`artists`:`home`,n=e.dataset.formId,r=n?document.getElementById(n):null;if(!(r instanceof HTMLFormElement)){e.textContent=`Puck 편집기를 연결할 저장 form을 찾지 못했습니다.`;return}(0,Ct.createRoot)(e).render((0,I.jsx)(bx,{form:r,pageKey:t}))}xx();export{wt as a,on as i,cn as n,un as r,Am as t};