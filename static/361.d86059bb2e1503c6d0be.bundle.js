webpackJsonp([361],{1608:function(module,exports){ace.define("ace/mode/toml_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"],function(acequire,exports,module){"use strict";var oop=acequire("../lib/oop"),TextHighlightRules=acequire("./text_highlight_rules").TextHighlightRules,TomlHighlightRules=function(){var keywordMapper=this.createKeywordMapper({"constant.language.boolean":"true|false"},"identifier");this.$rules={start:[{token:"comment.toml",regex:/#.*$/},{token:"string",regex:'"(?=.)',next:"qqstring"},{token:["variable.keygroup.toml"],regex:"(?:^\\s*)(\\[\\[([^\\]]+)\\]\\])"},{token:["variable.keygroup.toml"],regex:"(?:^\\s*)(\\[([^\\]]+)\\])"},{token:keywordMapper,regex:"[a-zA-Z\\$_¡-￿][a-zA-Z\\d\\$_¡-￿]*\\b"},{token:"support.date.toml",regex:"\\d{4}-\\d{2}-\\d{2}(T)\\d{2}:\\d{2}:\\d{2}(Z)"},{token:"constant.numeric.toml",regex:"-?\\d+(\\.?\\d+)?"}],qqstring:[{token:"string",regex:"\\\\$",next:"qqstring"},{token:"constant.language.escape",regex:'\\\\[0tnr"\\\\]'},{token:"string",regex:'"|$',next:"start"},{defaultToken:"string"}]}};oop.inherits(TomlHighlightRules,TextHighlightRules),exports.TomlHighlightRules=TomlHighlightRules}),ace.define("ace/mode/folding/ini",["require","exports","module","ace/lib/oop","ace/range","ace/mode/folding/fold_mode"],function(acequire,exports,module){"use strict";var oop=acequire("../../lib/oop"),Range=acequire("../../range").Range,BaseFoldMode=acequire("./fold_mode").FoldMode,FoldMode=exports.FoldMode=function(){};oop.inherits(FoldMode,BaseFoldMode),function(){this.foldingStartMarker=/^\s*\[([^\])]*)]\s*(?:$|[;#])/,this.getFoldWidgetRange=function(session,foldStyle,row){var re=this.foldingStartMarker,line=session.getLine(row),m=line.match(re);if(m){for(var startName=m[1]+".",startColumn=line.length,maxRow=session.getLength(),startRow=row,endRow=row;++row<maxRow;)if(line=session.getLine(row),!/^\s*$/.test(line)){if((m=line.match(re))&&0!==m[1].lastIndexOf(startName,0))break;endRow=row}if(endRow>startRow){var endColumn=session.getLine(endRow).length;return new Range(startRow,startColumn,endRow,endColumn)}}}}.call(FoldMode.prototype)}),ace.define("ace/mode/toml",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/toml_highlight_rules","ace/mode/folding/ini"],function(acequire,exports,module){"use strict";var oop=acequire("../lib/oop"),TextMode=acequire("./text").Mode,TomlHighlightRules=acequire("./toml_highlight_rules").TomlHighlightRules,FoldMode=acequire("./folding/ini").FoldMode,Mode=function(){this.HighlightRules=TomlHighlightRules,this.foldingRules=new FoldMode,this.$behaviour=this.$defaultBehaviour};oop.inherits(Mode,TextMode),function(){this.lineCommentStart="#",this.$id="ace/mode/toml"}.call(Mode.prototype),exports.Mode=Mode})}});