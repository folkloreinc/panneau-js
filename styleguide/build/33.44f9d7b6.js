(window.webpackJsonp=window.webpackJsonp||[]).push([[33],{1787:function(e,t){ace.define("ace/ext/whitespace",["require","exports","module","ace/lib/lang"],function(e,t,n){"use strict";var r=e("../lib/lang");t.$detectIndentation=function(e,t){for(var n=[],r=[],i=0,a=0,c=Math.min(e.length,1e3),s=0;s<c;s++){var o=e[s];if(/^\s*[^*+\-\s]/.test(o)){if("\t"==o[0])i++,a=-Number.MAX_VALUE;else{var g=o.match(/^ */)[0].length;if(g&&"\t"!=o[g]){var h=g-a;!(h>0)||a%h||g%h||(r[h]=(r[h]||0)+1),n[g]=(n[g]||0)+1}a=g}for(;s<c&&"\\"==o[o.length-1];)o=e[s++]}}function getScore(e){for(var t=0,r=e;r<n.length;r+=e)t+=n[r]||0;return t}var l=r.reduce(function(e,t){return e+t},0),f={score:0,length:0},u=0;for(s=1;s<12;s++){var v=getScore(s);1==s?(u=v,v=n[1]?.9:.8,n.length||(v=0)):v/=u,r[s]&&(v+=r[s]/l),v>f.score&&(f={score:v,length:s})}if(f.score&&f.score>1.4)var d=f.length;return i>u+1?((1==d||u<i/4||f.score<1.8)&&(d=void 0),{ch:"\t",length:d}):u>i+1?{ch:" ",length:d}:void 0},t.detectIndentation=function(e){var n=e.getLines(0,1e3),r=t.$detectIndentation(n)||{};return r.ch&&e.setUseSoftTabs(" "==r.ch),r.length&&e.setTabSize(r.length),r},t.trimTrailingSpace=function(e,t){for(var n=e.getDocument(),r=n.getAllLines(),i=t?-1:0,a=0,c=r.length;a<c;a++){var s=r[a],o=s.search(/\s+$/);o>i&&n.removeInLine(a,o,s.length)}},t.convertIndentation=function(e,t,n){var i=e.getTabString()[0],a=e.getTabSize();n||(n=a),t||(t=i);for(var c="\t"==t?t:r.stringRepeat(t,n),s=e.doc,o=s.getAllLines(),g={},h={},l=0,f=o.length;l<f;l++){var u=o[l].match(/^\s*/)[0];if(u){var v=e.$getStringScreenWidth(u)[0],d=Math.floor(v/a),p=v%a,m=g[d]||(g[d]=r.stringRepeat(c,d));(m+=h[p]||(h[p]=r.stringRepeat(" ",p)))!=u&&(s.removeInLine(l,0,u.length),s.insertInLine({row:l,column:0},m))}}e.setTabSize(n),e.setUseSoftTabs(" "==t)},t.$parseStringArg=function(e){var t={};/t/.test(e)?t.ch="\t":/s/.test(e)&&(t.ch=" ");var n=e.match(/\d+/);return n&&(t.length=parseInt(n[0],10)),t},t.$parseArg=function(e){return e?"string"==typeof e?t.$parseStringArg(e):"string"==typeof e.text?t.$parseStringArg(e.text):e:{}},t.commands=[{name:"detectIndentation",exec:function exec(e){t.detectIndentation(e.session)}},{name:"trimTrailingSpace",exec:function exec(e){t.trimTrailingSpace(e.session)}},{name:"convertIndentation",exec:function exec(e,n){var r=t.$parseArg(n);t.convertIndentation(e.session,r.ch,r.length)}},{name:"setIndentation",exec:function exec(e,n){var r=t.$parseArg(n);r.length&&e.session.setTabSize(r.length),r.ch&&e.session.setUseSoftTabs(" "==r.ch)}}]}),ace.acequire(["ace/ext/whitespace"],function(){})}}]);