webpackJsonp([427],{1525:function(module,exports){ace.define("ace/mode/doc_comment_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"],function(acequire,exports,module){"use strict";var oop=acequire("../lib/oop"),TextHighlightRules=acequire("./text_highlight_rules").TextHighlightRules,DocCommentHighlightRules=function(){this.$rules={start:[{token:"comment.doc.tag",regex:"@[\\w\\d_]+"},DocCommentHighlightRules.getTagRule(),{defaultToken:"comment.doc",caseInsensitive:!0}]}};oop.inherits(DocCommentHighlightRules,TextHighlightRules),DocCommentHighlightRules.getTagRule=function(start){return{token:"comment.doc.tag.storage.type",regex:"\\b(?:TODO|FIXME|XXX|HACK)\\b"}},DocCommentHighlightRules.getStartRule=function(start){return{token:"comment.doc",regex:"\\/\\*(?=\\*)",next:start}},DocCommentHighlightRules.getEndRule=function(start){return{token:"comment.doc",regex:"\\*\\/",next:start}},exports.DocCommentHighlightRules=DocCommentHighlightRules}),ace.define("ace/mode/haxe_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/doc_comment_highlight_rules","ace/mode/text_highlight_rules"],function(acequire,exports,module){"use strict";var oop=acequire("../lib/oop"),DocCommentHighlightRules=acequire("./doc_comment_highlight_rules").DocCommentHighlightRules,TextHighlightRules=acequire("./text_highlight_rules").TextHighlightRules,HaxeHighlightRules=function(){var keywordMapper=this.createKeywordMapper({"variable.language":"this",keyword:"break|case|cast|catch|class|continue|default|else|enum|extends|for|function|if|implements|import|in|inline|interface|new|override|package|private|public|return|static|super|switch|this|throw|trace|try|typedef|untyped|var|while|Array|Void|Bool|Int|UInt|Float|Dynamic|String|List|Hash|IntHash|Error|Unknown|Type|Std","constant.language":"null|true|false"},"identifier");this.$rules={start:[{token:"comment",regex:"\\/\\/.*$"},DocCommentHighlightRules.getStartRule("doc-start"),{token:"comment",regex:"\\/\\*",next:"comment"},{token:"string.regexp",regex:"[/](?:(?:\\[(?:\\\\]|[^\\]])+\\])|(?:\\\\/|[^\\]/]))*[/]\\w*\\s*(?=[).,;]|$)"},{token:"string",regex:'["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]'},{token:"string",regex:"['](?:(?:\\\\.)|(?:[^'\\\\]))*?[']"},{token:"constant.numeric",regex:"0[xX][0-9a-fA-F]+\\b"},{token:"constant.numeric",regex:"[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"},{token:"constant.language.boolean",regex:"(?:true|false)\\b"},{token:keywordMapper,regex:"[a-zA-Z_$][a-zA-Z0-9_$]*\\b"},{token:"keyword.operator",regex:"!|\\$|%|&|\\*|\\-\\-|\\-|\\+\\+|\\+|~|===|==|=|!=|!==|<=|>=|<<=|>>=|>>>=|<>|<|>|!|&&|\\|\\||\\?\\:|\\*=|%=|\\+=|\\-=|&=|\\^=|\\b(?:in|instanceof|new|delete|typeof|void)"},{token:"punctuation.operator",regex:"\\?|\\:|\\,|\\;|\\."},{token:"paren.lparen",regex:"[[({<]"},{token:"paren.rparen",regex:"[\\])}>]"},{token:"text",regex:"\\s+"}],comment:[{token:"comment",regex:".*?\\*\\/",next:"start"},{token:"comment",regex:".+"}]},this.embedRules(DocCommentHighlightRules,"doc-",[DocCommentHighlightRules.getEndRule("start")])};oop.inherits(HaxeHighlightRules,TextHighlightRules),exports.HaxeHighlightRules=HaxeHighlightRules}),ace.define("ace/mode/matching_brace_outdent",["require","exports","module","ace/range"],function(acequire,exports,module){"use strict";var Range=acequire("../range").Range,MatchingBraceOutdent=function(){};(function(){this.checkOutdent=function(line,input){return!!/^\s+$/.test(line)&&/^\s*\}/.test(input)},this.autoOutdent=function(doc,row){var match=doc.getLine(row).match(/^(\s*\})/);if(!match)return 0;var column=match[1].length,openBracePos=doc.findMatchingBracket({row:row,column:column});if(!openBracePos||openBracePos.row==row)return 0;var indent=this.$getIndent(doc.getLine(openBracePos.row));doc.replace(new Range(row,0,row,column-1),indent)},this.$getIndent=function(line){return line.match(/^\s*/)[0]}}).call(MatchingBraceOutdent.prototype),exports.MatchingBraceOutdent=MatchingBraceOutdent}),ace.define("ace/mode/folding/cstyle",["require","exports","module","ace/lib/oop","ace/range","ace/mode/folding/fold_mode"],function(acequire,exports,module){"use strict";var oop=acequire("../../lib/oop"),Range=acequire("../../range").Range,BaseFoldMode=acequire("./fold_mode").FoldMode,FoldMode=exports.FoldMode=function(commentRegex){commentRegex&&(this.foldingStartMarker=new RegExp(this.foldingStartMarker.source.replace(/\|[^|]*?$/,"|"+commentRegex.start)),this.foldingStopMarker=new RegExp(this.foldingStopMarker.source.replace(/\|[^|]*?$/,"|"+commentRegex.end)))};oop.inherits(FoldMode,BaseFoldMode),function(){this.foldingStartMarker=/(\{|\[)[^\}\]]*$|^\s*(\/\*)/,this.foldingStopMarker=/^[^\[\{]*(\}|\])|^[\s\*]*(\*\/)/,this.singleLineBlockCommentRe=/^\s*(\/\*).*\*\/\s*$/,this.tripleStarBlockCommentRe=/^\s*(\/\*\*\*).*\*\/\s*$/,this.startRegionRe=/^\s*(\/\*|\/\/)#?region\b/,this._getFoldWidgetBase=this.getFoldWidget,this.getFoldWidget=function(session,foldStyle,row){var line=session.getLine(row);if(this.singleLineBlockCommentRe.test(line)&&!this.startRegionRe.test(line)&&!this.tripleStarBlockCommentRe.test(line))return"";var fw=this._getFoldWidgetBase(session,foldStyle,row);return!fw&&this.startRegionRe.test(line)?"start":fw},this.getFoldWidgetRange=function(session,foldStyle,row,forceMultiline){var match,line=session.getLine(row);if(this.startRegionRe.test(line))return this.getCommentRegionBlock(session,line,row);if(match=line.match(this.foldingStartMarker)){var i=match.index;if(match[1])return this.openingBracketBlock(session,match[1],row,i);var range=session.getCommentFoldRange(row,i+match[0].length,1);return range&&!range.isMultiLine()&&(forceMultiline?range=this.getSectionRange(session,row):"all"!=foldStyle&&(range=null)),range}if("markbegin"!==foldStyle&&(match=line.match(this.foldingStopMarker))){i=match.index+match[0].length;return match[1]?this.closingBracketBlock(session,match[1],row,i):session.getCommentFoldRange(row,i,-1)}},this.getSectionRange=function(session,row){for(var line=session.getLine(row),startIndent=line.search(/\S/),startRow=row,startColumn=line.length,endRow=row+=1,maxRow=session.getLength();++row<maxRow;){var indent=(line=session.getLine(row)).search(/\S/);if(-1!==indent){if(startIndent>indent)break;var subRange=this.getFoldWidgetRange(session,"all",row);if(subRange){if(subRange.start.row<=startRow)break;if(subRange.isMultiLine())row=subRange.end.row;else if(startIndent==indent)break}endRow=row}}return new Range(startRow,startColumn,endRow,session.getLine(endRow).length)},this.getCommentRegionBlock=function(session,line,row){for(var startColumn=line.search(/\s*$/),maxRow=session.getLength(),startRow=row,re=/^\s*(?:\/\*|\/\/|--)#?(end)?region\b/,depth=1;++row<maxRow;){line=session.getLine(row);var m=re.exec(line);if(m&&(m[1]?depth--:depth++,!depth))break}if(row>startRow)return new Range(startRow,startColumn,row,line.length)}}.call(FoldMode.prototype)}),ace.define("ace/mode/haxe",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/haxe_highlight_rules","ace/mode/matching_brace_outdent","ace/mode/behaviour/cstyle","ace/mode/folding/cstyle"],function(acequire,exports,module){"use strict";var oop=acequire("../lib/oop"),TextMode=acequire("./text").Mode,HaxeHighlightRules=acequire("./haxe_highlight_rules").HaxeHighlightRules,MatchingBraceOutdent=acequire("./matching_brace_outdent").MatchingBraceOutdent,CstyleBehaviour=acequire("./behaviour/cstyle").CstyleBehaviour,CStyleFoldMode=acequire("./folding/cstyle").FoldMode,Mode=function(){this.HighlightRules=HaxeHighlightRules,this.$outdent=new MatchingBraceOutdent,this.$behaviour=new CstyleBehaviour,this.foldingRules=new CStyleFoldMode};oop.inherits(Mode,TextMode),function(){this.lineCommentStart="//",this.blockComment={start:"/*",end:"*/"},this.getNextLineIndent=function(state,line,tab){var indent=this.$getIndent(line),tokens=this.getTokenizer().getLineTokens(line,state).tokens;if(tokens.length&&"comment"==tokens[tokens.length-1].type)return indent;"start"==state&&(line.match(/^.*[\{\(\[]\s*$/)&&(indent+=tab));return indent},this.checkOutdent=function(state,line,input){return this.$outdent.checkOutdent(line,input)},this.autoOutdent=function(state,doc,row){this.$outdent.autoOutdent(doc,row)},this.$id="ace/mode/haxe"}.call(Mode.prototype),exports.Mode=Mode})}});