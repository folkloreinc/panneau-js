(window.webpackJsonp=window.webpackJsonp||[]).push([[168],{1018:function(module,exports){ace.define("ace/mode/turtle_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"],function(acequire,exports,module){"use strict";var oop=acequire("../lib/oop"),TextHighlightRules=acequire("./text_highlight_rules").TextHighlightRules,TurtleHighlightRules=function TurtleHighlightRules(){this.$rules={start:[{include:"#comments"},{include:"#strings"},{include:"#base-prefix-declarations"},{include:"#string-language-suffixes"},{include:"#string-datatype-suffixes"},{include:"#relative-urls"},{include:"#xml-schema-types"},{include:"#rdf-schema-types"},{include:"#owl-types"},{include:"#qnames"},{include:"#punctuation-operators"}],"#base-prefix-declarations":[{token:"keyword.other.prefix.turtle",regex:/@(?:base|prefix)/}],"#comments":[{token:["punctuation.definition.comment.turtle","comment.line.hash.turtle"],regex:/(#)(.*$)/}],"#owl-types":[{token:"support.type.datatype.owl.turtle",regex:/owl:[a-zA-Z]+/}],"#punctuation-operators":[{token:"keyword.operator.punctuation.turtle",regex:/;|,|\.|\(|\)|\[|\]/}],"#qnames":[{token:"entity.name.other.qname.turtle",regex:/(?:[a-zA-Z][-_a-zA-Z0-9]*)?:(?:[_a-zA-Z][-_a-zA-Z0-9]*)?/}],"#rdf-schema-types":[{token:"support.type.datatype.rdf.schema.turtle",regex:/rdfs?:[a-zA-Z]+|(?:^|\s)a(?:\s|$)/}],"#relative-urls":[{token:"string.quoted.other.relative.url.turtle",regex:/</,push:[{token:"string.quoted.other.relative.url.turtle",regex:/>/,next:"pop"},{defaultToken:"string.quoted.other.relative.url.turtle"}]}],"#string-datatype-suffixes":[{token:"keyword.operator.datatype.suffix.turtle",regex:/\^\^/}],"#string-language-suffixes":[{token:["keyword.operator.language.suffix.turtle","constant.language.suffix.turtle"],regex:/(?!")(@)([a-z]+(?:\-[a-z0-9]+)*)/}],"#strings":[{token:"string.quoted.triple.turtle",regex:/"""/,push:[{token:"string.quoted.triple.turtle",regex:/"""/,next:"pop"},{defaultToken:"string.quoted.triple.turtle"}]},{token:"string.quoted.double.turtle",regex:/"/,push:[{token:"string.quoted.double.turtle",regex:/"/,next:"pop"},{token:"invalid.string.newline",regex:/$/},{token:"constant.character.escape.turtle",regex:/\\./},{defaultToken:"string.quoted.double.turtle"}]}],"#xml-schema-types":[{token:"support.type.datatype.xml.schema.turtle",regex:/xsd?:[a-z][a-zA-Z]+/}]},this.normalizeRules()};TurtleHighlightRules.metaData={fileTypes:["ttl","nt"],name:"Turtle",scopeName:"source.turtle"},oop.inherits(TurtleHighlightRules,TextHighlightRules),exports.TurtleHighlightRules=TurtleHighlightRules}),ace.define("ace/mode/folding/cstyle",["require","exports","module","ace/lib/oop","ace/range","ace/mode/folding/fold_mode"],function(acequire,exports,module){"use strict";var oop=acequire("../../lib/oop"),Range=acequire("../../range").Range,BaseFoldMode=acequire("./fold_mode").FoldMode,FoldMode=exports.FoldMode=function(commentRegex){commentRegex&&(this.foldingStartMarker=new RegExp(this.foldingStartMarker.source.replace(/\|[^|]*?$/,"|"+commentRegex.start)),this.foldingStopMarker=new RegExp(this.foldingStopMarker.source.replace(/\|[^|]*?$/,"|"+commentRegex.end)))};oop.inherits(FoldMode,BaseFoldMode),function(){this.foldingStartMarker=/([\{\[\(])[^\}\]\)]*$|^\s*(\/\*)/,this.foldingStopMarker=/^[^\[\{\(]*([\}\]\)])|^[\s\*]*(\*\/)/,this.singleLineBlockCommentRe=/^\s*(\/\*).*\*\/\s*$/,this.tripleStarBlockCommentRe=/^\s*(\/\*\*\*).*\*\/\s*$/,this.startRegionRe=/^\s*(\/\*|\/\/)#?region\b/,this._getFoldWidgetBase=this.getFoldWidget,this.getFoldWidget=function(session,foldStyle,row){var line=session.getLine(row);if(this.singleLineBlockCommentRe.test(line)&&!this.startRegionRe.test(line)&&!this.tripleStarBlockCommentRe.test(line))return"";var fw=this._getFoldWidgetBase(session,foldStyle,row);return!fw&&this.startRegionRe.test(line)?"start":fw},this.getFoldWidgetRange=function(session,foldStyle,row,forceMultiline){var match,line=session.getLine(row);if(this.startRegionRe.test(line))return this.getCommentRegionBlock(session,line,row);if(match=line.match(this.foldingStartMarker)){var i=match.index;if(match[1])return this.openingBracketBlock(session,match[1],row,i);var range=session.getCommentFoldRange(row,i+match[0].length,1);return range&&!range.isMultiLine()&&(forceMultiline?range=this.getSectionRange(session,row):"all"!=foldStyle&&(range=null)),range}if("markbegin"!==foldStyle&&(match=line.match(this.foldingStopMarker))){i=match.index+match[0].length;return match[1]?this.closingBracketBlock(session,match[1],row,i):session.getCommentFoldRange(row,i,-1)}},this.getSectionRange=function(session,row){for(var line=session.getLine(row),startIndent=line.search(/\S/),startRow=row,startColumn=line.length,endRow=row+=1,maxRow=session.getLength();++row<maxRow;){var indent=(line=session.getLine(row)).search(/\S/);if(-1!==indent){if(startIndent>indent)break;var subRange=this.getFoldWidgetRange(session,"all",row);if(subRange){if(subRange.start.row<=startRow)break;if(subRange.isMultiLine())row=subRange.end.row;else if(startIndent==indent)break}endRow=row}}return new Range(startRow,startColumn,endRow,session.getLine(endRow).length)},this.getCommentRegionBlock=function(session,line,row){for(var startColumn=line.search(/\s*$/),maxRow=session.getLength(),startRow=row,re=/^\s*(?:\/\*|\/\/|--)#?(end)?region\b/,depth=1;++row<maxRow;){line=session.getLine(row);var m=re.exec(line);if(m&&(m[1]?depth--:depth++,!depth))break}if(row>startRow)return new Range(startRow,startColumn,row,line.length)}}.call(FoldMode.prototype)}),ace.define("ace/mode/turtle",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/turtle_highlight_rules","ace/mode/folding/cstyle"],function(acequire,exports,module){"use strict";var oop=acequire("../lib/oop"),TextMode=acequire("./text").Mode,TurtleHighlightRules=acequire("./turtle_highlight_rules").TurtleHighlightRules,FoldMode=acequire("./folding/cstyle").FoldMode,Mode=function Mode(){this.HighlightRules=TurtleHighlightRules,this.foldingRules=new FoldMode};oop.inherits(Mode,TextMode),function(){this.$id="ace/mode/turtle"}.call(Mode.prototype),exports.Mode=Mode})}}]);
//# sourceMappingURL=168.88de1415e235c4e0f3c5.bundle.js.map