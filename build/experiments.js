!function(t,e){for(var r in e)t[r]=e[r]}(this,function(t){function e(e){for(var r,o,i=e[0],a=e[1],c=0,s=[];c<i.length;c++)o=i[c],n[o]&&s.push(n[o][0]),n[o]=0;for(r in a)Object.prototype.hasOwnProperty.call(a,r)&&(t[r]=a[r]);for(u&&u(e);s.length;)s.shift()()}var r={},n={0:0};function o(e){if(r[e])return r[e].exports;var n=r[e]={i:e,l:!1,exports:{}};return t[e].call(n.exports,n,n.exports,o),n.l=!0,n.exports}o.e=function(t){var e=[],r=n[t];if(0!==r)if(r)e.push(r[2]);else{var i=new Promise(function(e,o){r=n[t]=[e,o]});e.push(r[2]=i);var a,c=document.createElement("script");c.charset="utf-8",c.timeout=120,o.nc&&c.setAttribute("nonce",o.nc),c.src=function(t){return o.p+""+({}[t]||t)+".chunk.js"}(t);var u=new Error;a=function(e){c.onerror=c.onload=null,clearTimeout(s);var r=n[t];if(0!==r){if(r){var o=e&&("load"===e.type?"missing":e.type),i=e&&e.target&&e.target.src;u.message="Loading chunk "+t+" failed.\n("+o+": "+i+")",u.name="ChunkLoadError",u.type=o,u.request=i,r[1](u)}n[t]=void 0}};var s=setTimeout(function(){a({type:"timeout",target:c})},12e4);c.onerror=c.onload=a,document.head.appendChild(c)}return Promise.all(e)},o.m=t,o.c=r,o.d=function(t,e,r){o.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:r})},o.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},o.t=function(t,e){if(1&e&&(t=o(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(o.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var n in t)o.d(r,n,function(e){return t[e]}.bind(null,n));return r},o.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return o.d(e,"a",e),e},o.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},o.p=".",o.oe=function(t){throw console.error(t),t};var i=window.AltisABTestsJSONP=window.AltisABTestsJSONP||[],a=i.push.bind(i);i.push=e,i=i.slice();for(var c=0;c<i.length;c++)e(i[c]);var u=a;return o(o.s=36)}([,,,function(t,e,r){t.exports=r(13)},function(t,e){function r(t,e,r,n,o,i,a){try{var c=t[i](a),u=c.value}catch(t){return void r(t)}c.done?e(u):Promise.resolve(u).then(n,o)}t.exports=function(t){return function(){var e=this,n=arguments;return new Promise(function(o,i){var a=t.apply(e,n);function c(t){r(a,o,i,c,u,"next",t)}function u(t){r(a,o,i,c,u,"throw",t)}c(void 0)})}}},function(t,e){t.exports=function(t,e,r){return e in t?Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[e]=r,t}},function(t,e){function r(e){return t.exports=r=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)},r(e)}t.exports=r},function(t,e){t.exports=function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}},function(t,e,r){var n=r(37),o=r(10);t.exports=function(t,e){return!e||"object"!==n(e)&&"function"!=typeof e?o(t):e}},function(t,e,r){var n=r(14);t.exports=function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&n(t,e)}},function(t,e){t.exports=function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}},function(t,e){function r(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}t.exports=function(t,e,n){return e&&r(t.prototype,e),n&&r(t,n),t}},function(t,e,r){var n=r(6),o=r(14),i=r(38),a=r(39);function c(e){var r="function"==typeof Map?new Map:void 0;return t.exports=c=function(t){if(null===t||!i(t))return t;if("function"!=typeof t)throw new TypeError("Super expression must either be null or a function");if(void 0!==r){if(r.has(t))return r.get(t);r.set(t,e)}function e(){return a(t,arguments,n(this).constructor)}return e.prototype=Object.create(t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),o(e,t)},c(e)}t.exports=c},function(t,e,r){var n=function(t){"use strict";var e,r=Object.prototype,n=r.hasOwnProperty,o="function"==typeof Symbol?Symbol:{},i=o.iterator||"@@iterator",a=o.asyncIterator||"@@asyncIterator",c=o.toStringTag||"@@toStringTag";function u(t,e,r,n){var o=e&&e.prototype instanceof y?e:y,i=Object.create(o.prototype),a=new P(n||[]);return i._invoke=function(t,e,r){var n=f;return function(o,i){if(n===h)throw new Error("Generator is already running");if(n===p){if("throw"===o)throw i;return _()}for(r.method=o,r.arg=i;;){var a=r.delegate;if(a){var c=L(a,r);if(c){if(c===d)continue;return c}}if("next"===r.method)r.sent=r._sent=r.arg;else if("throw"===r.method){if(n===f)throw n=p,r.arg;r.dispatchException(r.arg)}else"return"===r.method&&r.abrupt("return",r.arg);n=h;var u=s(t,e,r);if("normal"===u.type){if(n=r.done?p:l,u.arg===d)continue;return{value:u.arg,done:r.done}}"throw"===u.type&&(n=p,r.method="throw",r.arg=u.arg)}}}(t,r,a),i}function s(t,e,r){try{return{type:"normal",arg:t.call(e,r)}}catch(t){return{type:"throw",arg:t}}}t.wrap=u;var f="suspendedStart",l="suspendedYield",h="executing",p="completed",d={};function y(){}function v(){}function g(){}var m={};m[i]=function(){return this};var w=Object.getPrototypeOf,b=w&&w(w(j([])));b&&b!==r&&n.call(b,i)&&(m=b);var x=g.prototype=y.prototype=Object.create(m);function O(t){["next","throw","return"].forEach(function(e){t[e]=function(t){return this._invoke(e,t)}})}function E(t){var e;this._invoke=function(r,o){function i(){return new Promise(function(e,i){!function e(r,o,i,a){var c=s(t[r],t,o);if("throw"!==c.type){var u=c.arg,f=u.value;return f&&"object"==typeof f&&n.call(f,"__await")?Promise.resolve(f.__await).then(function(t){e("next",t,i,a)},function(t){e("throw",t,i,a)}):Promise.resolve(f).then(function(t){u.value=t,i(u)},function(t){return e("throw",t,i,a)})}a(c.arg)}(r,o,e,i)})}return e=e?e.then(i,i):i()}}function L(t,r){var n=t.iterator[r.method];if(n===e){if(r.delegate=null,"throw"===r.method){if(t.iterator.return&&(r.method="return",r.arg=e,L(t,r),"throw"===r.method))return d;r.method="throw",r.arg=new TypeError("The iterator does not provide a 'throw' method")}return d}var o=s(n,t.iterator,r.arg);if("throw"===o.type)return r.method="throw",r.arg=o.arg,r.delegate=null,d;var i=o.arg;return i?i.done?(r[t.resultName]=i.value,r.next=t.nextLoc,"return"!==r.method&&(r.method="next",r.arg=e),r.delegate=null,d):i:(r.method="throw",r.arg=new TypeError("iterator result is not an object"),r.delegate=null,d)}function T(t){var e={tryLoc:t[0]};1 in t&&(e.catchLoc=t[1]),2 in t&&(e.finallyLoc=t[2],e.afterLoc=t[3]),this.tryEntries.push(e)}function S(t){var e=t.completion||{};e.type="normal",delete e.arg,t.completion=e}function P(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(T,this),this.reset(!0)}function j(t){if(t){var r=t[i];if(r)return r.call(t);if("function"==typeof t.next)return t;if(!isNaN(t.length)){var o=-1,a=function r(){for(;++o<t.length;)if(n.call(t,o))return r.value=t[o],r.done=!1,r;return r.value=e,r.done=!0,r};return a.next=a}}return{next:_}}function _(){return{value:e,done:!0}}return v.prototype=x.constructor=g,g.constructor=v,g[c]=v.displayName="GeneratorFunction",t.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===v||"GeneratorFunction"===(e.displayName||e.name))},t.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,g):(t.__proto__=g,c in t||(t[c]="GeneratorFunction")),t.prototype=Object.create(x),t},t.awrap=function(t){return{__await:t}},O(E.prototype),E.prototype[a]=function(){return this},t.AsyncIterator=E,t.async=function(e,r,n,o){var i=new E(u(e,r,n,o));return t.isGeneratorFunction(r)?i:i.next().then(function(t){return t.done?t.value:i.next()})},O(x),x[c]="Generator",x[i]=function(){return this},x.toString=function(){return"[object Generator]"},t.keys=function(t){var e=[];for(var r in t)e.push(r);return e.reverse(),function r(){for(;e.length;){var n=e.pop();if(n in t)return r.value=n,r.done=!1,r}return r.done=!0,r}},t.values=j,P.prototype={constructor:P,reset:function(t){if(this.prev=0,this.next=0,this.sent=this._sent=e,this.done=!1,this.delegate=null,this.method="next",this.arg=e,this.tryEntries.forEach(S),!t)for(var r in this)"t"===r.charAt(0)&&n.call(this,r)&&!isNaN(+r.slice(1))&&(this[r]=e)},stop:function(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval},dispatchException:function(t){if(this.done)throw t;var r=this;function o(n,o){return c.type="throw",c.arg=t,r.next=n,o&&(r.method="next",r.arg=e),!!o}for(var i=this.tryEntries.length-1;i>=0;--i){var a=this.tryEntries[i],c=a.completion;if("root"===a.tryLoc)return o("end");if(a.tryLoc<=this.prev){var u=n.call(a,"catchLoc"),s=n.call(a,"finallyLoc");if(u&&s){if(this.prev<a.catchLoc)return o(a.catchLoc,!0);if(this.prev<a.finallyLoc)return o(a.finallyLoc)}else if(u){if(this.prev<a.catchLoc)return o(a.catchLoc,!0)}else{if(!s)throw new Error("try statement without catch or finally");if(this.prev<a.finallyLoc)return o(a.finallyLoc)}}}},abrupt:function(t,e){for(var r=this.tryEntries.length-1;r>=0;--r){var o=this.tryEntries[r];if(o.tryLoc<=this.prev&&n.call(o,"finallyLoc")&&this.prev<o.finallyLoc){var i=o;break}}i&&("break"===t||"continue"===t)&&i.tryLoc<=e&&e<=i.finallyLoc&&(i=null);var a=i?i.completion:{};return a.type=t,a.arg=e,i?(this.method="next",this.next=i.finallyLoc,d):this.complete(a)},complete:function(t,e){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&e&&(this.next=e),d},finish:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.finallyLoc===t)return this.complete(r.completion,r.afterLoc),S(r),d}},catch:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.tryLoc===t){var n=r.completion;if("throw"===n.type){var o=n.arg;S(r)}return o}}throw new Error("illegal catch attempt")},delegateYield:function(t,r,n){return this.delegate={iterator:j(t),resultName:r,nextLoc:n},"next"===this.method&&(this.arg=e),d}},t}(t.exports);try{regeneratorRuntime=n}catch(t){Function("r","regeneratorRuntime = r")(n)}},function(t,e){function r(e,n){return t.exports=r=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t},r(e,n)}t.exports=r},,,,,,,,,,,,,,,,,,,,,,function(t,e,r){"use strict";r.r(e);var n=r(3),o=r.n(n),i=r(10),a=r.n(i),c=r(11),u=r.n(c),s=r(5),f=r.n(s),l=r(7),h=r.n(l),p=r(8),d=r.n(p),y=r(6),v=r.n(y),g=r(9),m=r.n(g),w=r(12),b=r.n(w),x=r(4);function O(t,e){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(t);e&&(n=n.filter(function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable})),r.push.apply(r,n)}return r}function E(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?O(r,!0).forEach(function(e){f()(t,e,r[e])}):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):O(r).forEach(function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))})}return t}r.n(x)()(o.a.mark(function t(){var e,n,i,c;return o.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:if(r.p=window.Altis.Analytics.Experiments.BuildURL,!!HTMLElement.prototype.attachShadow){t.next=5;break}return t.next=5,r.e(2).then(r.t.bind(null,41,7));case 5:e=function(t){function e(){var t;return h()(this,e),(t=d()(this,v()(e).call(this))).attachShadow({mode:"open"}).innerHTML="<slot></slot>",t}return m()(e,t),e}(b()(HTMLElement)),n=function(t){function e(){var t;return h()(this,e),(t=d()(this,v()(e).call(this))).attachShadow({mode:"open"}).innerHTML="<slot></slot>",t}return m()(e,t),e}(b()(HTMLElement)),i=function(t){function e(){var t;return h()(this,e),t=d()(this,v()(e).call(this)),f()(a()(t),"storageKey","_altis_tests"),t.attachShadow({mode:"open"}).innerHTML="<slot></slot>",t}return m()(e,t),u()(e,[{key:"testId",get:function(){return this.getAttribute("test-id")}},{key:"postId",get:function(){return this.getAttribute("post-id")}},{key:"testIdWithPost",get:function(){return"".concat(this.testId,"_").concat(this.postId)}},{key:"trafficPercentage",get:function(){return this.getAttribute("traffic-percentage")}},{key:"variantCount",get:function(){return parseInt(this.getAttribute("variant-count"),10)}},{key:"goal",get:function(){return this.getAttribute("goal")}}]),u()(e,[{key:"connectedCallback",value:function(){var t=new RegExp("(utm_campaign|set_test)=test_".concat(this.testIdWithPost,":(\\d+)"),"i"),e=unescape(window.location.search).match(t);e&&this.addTestForUser(f()({},this.testIdWithPost,parseInt(e[2],10))),this.init()}},{key:"init",value:function(){window.console&&window.console.error("Children of Class Test must implement an init() method.")}},{key:"getTestsForUser",value:function(){return JSON.parse(window.localStorage.getItem(this.storageKey))||{}}},{key:"addTestForUser",value:function(t){window.localStorage.setItem(this.storageKey,JSON.stringify(E({},this.getTestsForUser(),{},t)))}}]),e}(b()(HTMLElement)),c=function(t){function e(){var t,r;h()(this,e);for(var n=arguments.length,o=new Array(n),i=0;i<n;i++)o[i]=arguments[i];return r=d()(this,(t=v()(e)).call.apply(t,[this].concat(o))),f()(a()(r),"storageKey","_altis_ab_tests"),r}return m()(e,t),u()(e,[{key:"init",value:function(){var t=this.getVariantId(),e=this.variantCount,r=this.goal.split(":"),n=this.testId,o=this.postId,a=this,c={testId:n,postId:o,variantId:t,eventType:r[0],selector:r[1]||!1},u=!1,s=this.shadowRoot.querySelector("slot");s.addEventListener("slotchange",function(){if(!u){var n=Array.from(s.assignedElements()).filter(function(t){return"TEST-FALLBACK"===t.nodeName});if(n.length>0&&!1===t)return a.outerHTML=n[0].innerHTML,void(u=!0);var o=Array.from(s.assignedElements()).filter(function(t){return"TEST-VARIANT"===t.nodeName});if(o.length===e){u=!0;var f=o[t||0],l=a.parentNode;a.outerHTML=f.innerHTML;var h=i.goalHandlers[r[0]]||!1;if(!1!==t&&r[0]&&h){var p=[l];if(c.selector)p=l.querySelectorAll(c.selector);else if(h.closest.length){for(var d=h.closest.map(function(t){return t.toUpperCase()}),y=l;y.parentNode&&d.indexOf(y.nodeName)<0;)y=y.parentNode;d.indexOf(y.nodeName)>=0&&(p=[y])}p.forEach(function(t){h.callback(t,function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};window.Altis.Analytics.record(c.eventType,{attributes:E({},t,{eventTestId:c.testId,eventPostId:c.postId,eventVariantId:c.variantId}),metrics:E({},e)})})})}}}})}},{key:"getVariantId",value:function(){var t=this.testIdWithPost,e=this.trafficPercentage,r=this.getTestsForUser(),n=!1;if(void 0!==r[t]&&!1!==r[t]&&r[t]<this.variantCount)n=r[t];else{if(!1===r[t])return n;if(100*Math.random()>e)return this.addTestForUser(f()({},t,!1)),n;n=Math.floor(Math.random()*this.variantCount),this.addTestForUser(f()({},t,n))}return window.Altis&&window.Altis.Analytics&&window.Altis.Analytics.registerAttribute("test_".concat(t),n),n}}]),e}(i),i.goalHandlers={},i.registerGoal=function(t,e){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:[];i.goalHandlers[t]={callback:e,closest:Array.isArray(r)?r:[r]}},i.registerGoal("click",function(t,e){var r={elementNode:t.nodeName||"",elementText:t.innerText||"",elementClassName:t.className||"",elementId:t.id||"",elementHref:t.href||""};t.addEventListener("click",function(t){e(Object.assign({},r,{targetNode:t.target.nodeName||"",targetText:t.target.innerText||"",targetClassName:t.target.className||"",targetId:t.target.id||"",targetSrc:"IMG"===t.target.nodeName?t.target.src:""}))})},["a"]),window.customElements.define("test-fallback",e),window.customElements.define("test-variant",n),window.customElements.define("ab-test",c),window.Altis.Analytics.Experiments=Object.assign({},window.Altis.Analytics.Experiments||{},{registerGoal:i.registerGoal});case 16:case"end":return t.stop()}},t)}))()},function(t,e){function r(t){return(r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function n(e){return"function"==typeof Symbol&&"symbol"===r(Symbol.iterator)?t.exports=n=function(t){return r(t)}:t.exports=n=function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":r(t)},n(e)}t.exports=n},function(t,e){t.exports=function(t){return-1!==Function.toString.call(t).indexOf("[native code]")}},function(t,e,r){var n=r(14);function o(e,r,i){return!function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],function(){})),!0}catch(t){return!1}}()?t.exports=o=function(t,e,r){var o=[null];o.push.apply(o,e);var i=new(Function.bind.apply(t,o));return r&&n(i,r.prototype),i}:t.exports=o=Reflect.construct,o.apply(null,arguments)}t.exports=o}]));
//# sourceMappingURL=experiments.js.map