(window.webpackJsonp=window.webpackJsonp||[]).push([[147],{997:function(module,exports){ace.define("ace/mode/scheme_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"],function(acequire,exports,module){"use strict";var oop=acequire("../lib/oop"),TextHighlightRules=acequire("./text_highlight_rules").TextHighlightRules,SchemeHighlightRules=function SchemeHighlightRules(){var keywordMapper=this.createKeywordMapper({"keyword.control":"case|do|let|loop|if|else|when","keyword.operator":"eq?|eqv?|equal?|and|or|not|null?","constant.language":"#t|#f","support.function":"cons|car|cdr|cond|lambda|lambda*|syntax-rules|format|set!|quote|eval|append|list|list?|member?|load"},"identifier",!0);this.$rules={start:[{token:"comment",regex:";.*$"},{token:["storage.type.function-type.scheme","text","entity.name.function.scheme"],regex:"(?:\\b(?:(define|define-syntax|define-macro))\\b)(\\s+)((?:\\w|\\-|\\!|\\?)*)"},{token:"punctuation.definition.constant.character.scheme",regex:"#:\\S+"},{token:["punctuation.definition.variable.scheme","variable.other.global.scheme","punctuation.definition.variable.scheme"],regex:"(\\*)(\\S*)(\\*)"},{token:"constant.numeric",regex:"#[xXoObB][0-9a-fA-F]+"},{token:"constant.numeric",regex:"[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?"},{token:keywordMapper,regex:"[a-zA-Z_#][a-zA-Z0-9_\\-\\?\\!\\*]*"},{token:"string",regex:'"(?=.)',next:"qqstring"}],qqstring:[{token:"constant.character.escape.scheme",regex:"\\\\."},{token:"string",regex:'[^"\\\\]+',merge:!0},{token:"string",regex:"\\\\$",next:"qqstring",merge:!0},{token:"string",regex:'"|$',next:"start",merge:!0}]}};oop.inherits(SchemeHighlightRules,TextHighlightRules),exports.SchemeHighlightRules=SchemeHighlightRules}),ace.define("ace/mode/matching_parens_outdent",["require","exports","module","ace/range"],function(acequire,exports,module){"use strict";var Range=acequire("../range").Range,MatchingParensOutdent=function MatchingParensOutdent(){};(function(){this.checkOutdent=function(line,input){return!!/^\s+$/.test(line)&&/^\s*\)/.test(input)},this.autoOutdent=function(doc,row){var match=doc.getLine(row).match(/^(\s*\))/);if(!match)return 0;var column=match[1].length,openBracePos=doc.findMatchingBracket({row:row,column:column});if(!openBracePos||openBracePos.row==row)return 0;var indent=this.$getIndent(doc.getLine(openBracePos.row));doc.replace(new Range(row,0,row,column-1),indent)},this.$getIndent=function(line){var match=line.match(/^(\s+)/);return match?match[1]:""}}).call(MatchingParensOutdent.prototype),exports.MatchingParensOutdent=MatchingParensOutdent}),ace.define("ace/mode/scheme",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/scheme_highlight_rules","ace/mode/matching_parens_outdent"],function(acequire,exports,module){"use strict";var oop=acequire("../lib/oop"),TextMode=acequire("./text").Mode,SchemeHighlightRules=acequire("./scheme_highlight_rules").SchemeHighlightRules,MatchingParensOutdent=acequire("./matching_parens_outdent").MatchingParensOutdent,Mode=function Mode(){this.HighlightRules=SchemeHighlightRules,this.$outdent=new MatchingParensOutdent,this.$behaviour=this.$defaultBehaviour};oop.inherits(Mode,TextMode),function(){this.lineCommentStart=";",this.minorIndentFunctions=["define","lambda","define-macro","define-syntax","syntax-rules","define-record-type","define-structure"],this.$toIndent=function(str){return str.split("").map(function(ch){return/\s/.exec(ch)?ch:" "}).join("")},this.$calculateIndent=function(line,tab){for(var isParen,ch,baseIndent=this.$getIndent(line),delta=0,i=line.length-1;i>=0&&("("===(ch=line[i])?(delta--,isParen=!0):"("===ch||"["===ch||"{"===ch?(delta--,isParen=!1):")"!==ch&&"]"!==ch&&"}"!==ch||delta++,!(delta<0));i--);if(!(delta<0&&isParen))return delta<0&&!isParen?this.$toIndent(line.substring(0,i+1)):delta>0?baseIndent=baseIndent.substring(0,baseIndent.length-tab.length):baseIndent;for(var iBefore=i+=1,fn="";;){if(" "===(ch=line[i])||"\t"===ch)return-1!==this.minorIndentFunctions.indexOf(fn)?this.$toIndent(line.substring(0,iBefore-1)+tab):this.$toIndent(line.substring(0,i+1));if(void 0===ch)return this.$toIndent(line.substring(0,iBefore-1)+tab);fn+=line[i],i++}},this.getNextLineIndent=function(state,line,tab){return this.$calculateIndent(line,tab)},this.checkOutdent=function(state,line,input){return this.$outdent.checkOutdent(line,input)},this.autoOutdent=function(state,doc,row){this.$outdent.autoOutdent(doc,row)},this.$id="ace/mode/scheme"}.call(Mode.prototype),exports.Mode=Mode})}}]);
//# sourceMappingURL=147.88de1415e235c4e0f3c5.bundle.js.map