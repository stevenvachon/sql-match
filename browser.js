!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this).sqlMatch=e()}}(function(){return function(){return function e(t,r,n){function o(f,u){if(!r[f]){if(!t[f]){var s="function"==typeof require&&require;if(!u&&s)return s(f,!0);if(i)return i(f,!0);var c=new Error("Cannot find module '"+f+"'");throw c.code="MODULE_NOT_FOUND",c}var p=r[f]={exports:{}};t[f][0].call(p.exports,function(e){return o(t[f][1][e]||e)},p,p.exports,e,t,r,n)}return r[f].exports}for(var i="function"==typeof require&&require,f=0;f<n.length;f++)o(n[f]);return o}}()({1:[function(e,t,r){"use strict";var n=e("escape-string-regexp"),o=e("is-string"),i=/[\\%_]|[^\\%_]+/g,f=function(e){if(!o(e))throw new TypeError("Input must be a string");var t="",r=void 0;e:for(;null!==(r=i.exec(e));)switch(r[0]){case"\\":if(null===(r=i.exec(e)))break e;t+=n(r[0]);break;case"%":t+="[^]*";break;case"_":t+="[^]";break;default:t+=n(r[0])}return new RegExp("^"+t+"$")};t.exports={isSQLMatch:function(e,t){if(!o(t))throw new TypeError("Input must be a string");return f(e).test(t)},sqlToRegex:f}},{"escape-string-regexp":2,"is-string":3}],2:[function(e,t,r){"use strict";var n=/[|\\{}()[\]^$+*?.]/g;t.exports=function(e){if("string"!=typeof e)throw new TypeError("Expected a string");return e.replace(n,"\\$&")}},{}],3:[function(e,t,r){"use strict";var n=String.prototype.valueOf,o=Object.prototype.toString,i="function"==typeof Symbol&&"symbol"==typeof Symbol.toStringTag;t.exports=function(e){return"string"==typeof e||"object"==typeof e&&(i?function(e){try{return n.call(e),!0}catch(e){return!1}}(e):"[object String]"===o.call(e))}},{}]},{},[1])(1)});