(window.webpackJsonp=window.webpackJsonp||[]).push([[124],{974:function(module,exports){ace.define("ace/mode/pascal_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"],function(acequire,exports,module){"use strict";var oop=acequire("../lib/oop"),TextHighlightRules=acequire("./text_highlight_rules").TextHighlightRules,PascalHighlightRules=function PascalHighlightRules(){this.$rules={start:[{caseInsensitive:!0,token:"keyword.control.pascal",regex:"\\b(?:(absolute|abstract|all|and|and_then|array|as|asm|attribute|begin|bindable|case|class|const|constructor|destructor|div|do|do|else|end|except|export|exports|external|far|file|finalization|finally|for|forward|goto|if|implementation|import|in|inherited|initialization|interface|interrupt|is|label|library|mod|module|name|near|nil|not|object|of|only|operator|or|or_else|otherwise|packed|pow|private|program|property|protected|public|published|qualified|record|repeat|resident|restricted|segment|set|shl|shr|then|to|try|type|unit|until|uses|value|var|view|virtual|while|with|xor))\\b"},{caseInsensitive:!0,token:["variable.pascal","text","storage.type.prototype.pascal","entity.name.function.prototype.pascal"],regex:"\\b(function|procedure)(\\s+)(\\w+)(\\.\\w+)?(?=(?:\\(.*?\\))?;\\s*(?:attribute|forward|external))"},{caseInsensitive:!0,token:["variable.pascal","text","storage.type.function.pascal","entity.name.function.pascal"],regex:"\\b(function|procedure)(\\s+)(\\w+)(\\.\\w+)?"},{token:"constant.numeric.pascal",regex:"\\b((0(x|X)[0-9a-fA-F]*)|(([0-9]+\\.?[0-9]*)|(\\.[0-9]+))((e|E)(\\+|-)?[0-9]+)?)(L|l|UL|ul|u|U|F|f|ll|LL|ull|ULL)?\\b"},{token:"punctuation.definition.comment.pascal",regex:"--.*$",push_:[{token:"comment.line.double-dash.pascal.one",regex:"$",next:"pop"},{defaultToken:"comment.line.double-dash.pascal.one"}]},{token:"punctuation.definition.comment.pascal",regex:"//.*$",push_:[{token:"comment.line.double-slash.pascal.two",regex:"$",next:"pop"},{defaultToken:"comment.line.double-slash.pascal.two"}]},{token:"punctuation.definition.comment.pascal",regex:"\\(\\*",push:[{token:"punctuation.definition.comment.pascal",regex:"\\*\\)",next:"pop"},{defaultToken:"comment.block.pascal.one"}]},{token:"punctuation.definition.comment.pascal",regex:"\\{",push:[{token:"punctuation.definition.comment.pascal",regex:"\\}",next:"pop"},{defaultToken:"comment.block.pascal.two"}]},{token:"punctuation.definition.string.begin.pascal",regex:'"',push:[{token:"constant.character.escape.pascal",regex:"\\\\."},{token:"punctuation.definition.string.end.pascal",regex:'"',next:"pop"},{defaultToken:"string.quoted.double.pascal"}]},{token:"punctuation.definition.string.begin.pascal",regex:"'",push:[{token:"constant.character.escape.apostrophe.pascal",regex:"''"},{token:"punctuation.definition.string.end.pascal",regex:"'",next:"pop"},{defaultToken:"string.quoted.single.pascal"}]},{token:"keyword.operator",regex:"[+\\-;,/*%]|:=|="}]},this.normalizeRules()};oop.inherits(PascalHighlightRules,TextHighlightRules),exports.PascalHighlightRules=PascalHighlightRules}),ace.define("ace/mode/folding/coffee",["require","exports","module","ace/lib/oop","ace/mode/folding/fold_mode","ace/range"],function(acequire,exports,module){"use strict";var oop=acequire("../../lib/oop"),BaseFoldMode=acequire("./fold_mode").FoldMode,Range=acequire("../../range").Range,FoldMode=exports.FoldMode=function(){};oop.inherits(FoldMode,BaseFoldMode),function(){this.getFoldWidgetRange=function(session,foldStyle,row){var range=this.indentationBlock(session,row);if(range)return range;var re=/\S/,line=session.getLine(row),startLevel=line.search(re);if(-1!=startLevel&&"#"==line[startLevel]){for(var startColumn=line.length,maxRow=session.getLength(),startRow=row,endRow=row;++row<maxRow;){var level=(line=session.getLine(row)).search(re);if(-1!=level){if("#"!=line[level])break;endRow=row}}if(endRow>startRow){var endColumn=session.getLine(endRow).length;return new Range(startRow,startColumn,endRow,endColumn)}}},this.getFoldWidget=function(session,foldStyle,row){var line=session.getLine(row),indent=line.search(/\S/),next=session.getLine(row+1),prev=session.getLine(row-1),prevIndent=prev.search(/\S/),nextIndent=next.search(/\S/);if(-1==indent)return session.foldWidgets[row-1]=-1!=prevIndent&&prevIndent<nextIndent?"start":"","";if(-1==prevIndent){if(indent==nextIndent&&"#"==line[indent]&&"#"==next[indent])return session.foldWidgets[row-1]="",session.foldWidgets[row+1]="","start"}else if(prevIndent==indent&&"#"==line[indent]&&"#"==prev[indent]&&-1==session.getLine(row-2).search(/\S/))return session.foldWidgets[row-1]="start",session.foldWidgets[row+1]="","";return session.foldWidgets[row-1]=-1!=prevIndent&&prevIndent<indent?"start":"",indent<nextIndent?"start":""}}.call(FoldMode.prototype)}),ace.define("ace/mode/pascal",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/pascal_highlight_rules","ace/mode/folding/coffee"],function(acequire,exports,module){"use strict";var oop=acequire("../lib/oop"),TextMode=acequire("./text").Mode,PascalHighlightRules=acequire("./pascal_highlight_rules").PascalHighlightRules,FoldMode=acequire("./folding/coffee").FoldMode,Mode=function Mode(){this.HighlightRules=PascalHighlightRules,this.foldingRules=new FoldMode,this.$behaviour=this.$defaultBehaviour};oop.inherits(Mode,TextMode),function(){this.lineCommentStart=["--","//"],this.blockComment=[{start:"(*",end:"*)"},{start:"{",end:"}"}],this.$id="ace/mode/pascal"}.call(Mode.prototype),exports.Mode=Mode})}}]);
//# sourceMappingURL=124.88de1415e235c4e0f3c5.bundle.js.map