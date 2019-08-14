(window.webpackJsonp=window.webpackJsonp||[]).push([[177],{1027:function(module,exports,__webpack_require__){ace.define("ace/mode/xml_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"],function(acequire,exports,module){"use strict";var oop=acequire("../lib/oop"),TextHighlightRules=acequire("./text_highlight_rules").TextHighlightRules,XmlHighlightRules=function XmlHighlightRules(normalize){var tagRegex="[_:a-zA-ZÀ-￿][-_:.a-zA-Z0-9À-￿]*";this.$rules={start:[{token:"string.cdata.xml",regex:"<\\!\\[CDATA\\[",next:"cdata"},{token:["punctuation.instruction.xml","keyword.instruction.xml"],regex:"(<\\?)("+tagRegex+")",next:"processing_instruction"},{token:"comment.start.xml",regex:"<\\!--",next:"comment"},{token:["xml-pe.doctype.xml","xml-pe.doctype.xml"],regex:"(<\\!)(DOCTYPE)(?=[\\s])",next:"doctype",caseInsensitive:!0},{include:"tag"},{token:"text.end-tag-open.xml",regex:"</"},{token:"text.tag-open.xml",regex:"<"},{include:"reference"},{defaultToken:"text.xml"}],processing_instruction:[{token:"entity.other.attribute-name.decl-attribute-name.xml",regex:tagRegex},{token:"keyword.operator.decl-attribute-equals.xml",regex:"="},{include:"whitespace"},{include:"string"},{token:"punctuation.xml-decl.xml",regex:"\\?>",next:"start"}],doctype:[{include:"whitespace"},{include:"string"},{token:"xml-pe.doctype.xml",regex:">",next:"start"},{token:"xml-pe.xml",regex:"[-_a-zA-Z0-9:]+"},{token:"punctuation.int-subset",regex:"\\[",push:"int_subset"}],int_subset:[{token:"text.xml",regex:"\\s+"},{token:"punctuation.int-subset.xml",regex:"]",next:"pop"},{token:["punctuation.markup-decl.xml","keyword.markup-decl.xml"],regex:"(<\\!)("+tagRegex+")",push:[{token:"text",regex:"\\s+"},{token:"punctuation.markup-decl.xml",regex:">",next:"pop"},{include:"string"}]}],cdata:[{token:"string.cdata.xml",regex:"\\]\\]>",next:"start"},{token:"text.xml",regex:"\\s+"},{token:"text.xml",regex:"(?:[^\\]]|\\](?!\\]>))+"}],comment:[{token:"comment.end.xml",regex:"--\x3e",next:"start"},{defaultToken:"comment.xml"}],reference:[{token:"constant.language.escape.reference.xml",regex:"(?:&#[0-9]+;)|(?:&#x[0-9a-fA-F]+;)|(?:&[a-zA-Z0-9_:\\.-]+;)"}],attr_reference:[{token:"constant.language.escape.reference.attribute-value.xml",regex:"(?:&#[0-9]+;)|(?:&#x[0-9a-fA-F]+;)|(?:&[a-zA-Z0-9_:\\.-]+;)"}],tag:[{token:["meta.tag.punctuation.tag-open.xml","meta.tag.punctuation.end-tag-open.xml","meta.tag.tag-name.xml"],regex:"(?:(<)|(</))((?:"+tagRegex+":)?"+tagRegex+")",next:[{include:"attributes"},{token:"meta.tag.punctuation.tag-close.xml",regex:"/?>",next:"start"}]}],tag_whitespace:[{token:"text.tag-whitespace.xml",regex:"\\s+"}],whitespace:[{token:"text.whitespace.xml",regex:"\\s+"}],string:[{token:"string.xml",regex:"'",push:[{token:"string.xml",regex:"'",next:"pop"},{defaultToken:"string.xml"}]},{token:"string.xml",regex:'"',push:[{token:"string.xml",regex:'"',next:"pop"},{defaultToken:"string.xml"}]}],attributes:[{token:"entity.other.attribute-name.xml",regex:tagRegex},{token:"keyword.operator.attribute-equals.xml",regex:"="},{include:"tag_whitespace"},{include:"attribute_value"}],attribute_value:[{token:"string.attribute-value.xml",regex:"'",push:[{token:"string.attribute-value.xml",regex:"'",next:"pop"},{include:"attr_reference"},{defaultToken:"string.attribute-value.xml"}]},{token:"string.attribute-value.xml",regex:'"',push:[{token:"string.attribute-value.xml",regex:'"',next:"pop"},{include:"attr_reference"},{defaultToken:"string.attribute-value.xml"}]}]},this.constructor===XmlHighlightRules&&this.normalizeRules()};(function(){this.embedTagRules=function(HighlightRules,prefix,tag){this.$rules.tag.unshift({token:["meta.tag.punctuation.tag-open.xml","meta.tag."+tag+".tag-name.xml"],regex:"(<)("+tag+"(?=\\s|>|$))",next:[{include:"attributes"},{token:"meta.tag.punctuation.tag-close.xml",regex:"/?>",next:prefix+"start"}]}),this.$rules[tag+"-end"]=[{include:"attributes"},{token:"meta.tag.punctuation.tag-close.xml",regex:"/?>",next:"start",onMatch:function onMatch(value,currentState,stack){return stack.splice(0),this.token}}],this.embedRules(HighlightRules,prefix,[{token:["meta.tag.punctuation.end-tag-open.xml","meta.tag."+tag+".tag-name.xml"],regex:"(</)("+tag+"(?=\\s|>|$))",next:tag+"-end"},{token:"string.cdata.xml",regex:"<\\!\\[CDATA\\["},{token:"string.cdata.xml",regex:"\\]\\]>"}])}}).call(TextHighlightRules.prototype),oop.inherits(XmlHighlightRules,TextHighlightRules),exports.XmlHighlightRules=XmlHighlightRules}),ace.define("ace/mode/behaviour/xml",["require","exports","module","ace/lib/oop","ace/mode/behaviour","ace/token_iterator","ace/lib/lang"],function(acequire,exports,module){"use strict";var oop=acequire("../../lib/oop"),Behaviour=acequire("../behaviour").Behaviour,TokenIterator=acequire("../../token_iterator").TokenIterator;acequire("../../lib/lang");function is(token,type){return token.type.lastIndexOf(type+".xml")>-1}var XmlBehaviour=function XmlBehaviour(){this.add("string_dquotes","insertion",function(state,action,editor,session,text){if('"'==text||"'"==text){var quote=text,selected=session.doc.getTextRange(editor.getSelectionRange());if(""!==selected&&"'"!==selected&&'"'!=selected&&editor.getWrapBehavioursEnabled())return{text:quote+selected+quote,selection:!1};var cursor=editor.getCursorPosition(),rightChar=session.doc.getLine(cursor.row).substring(cursor.column,cursor.column+1),iterator=new TokenIterator(session,cursor.row,cursor.column),token=iterator.getCurrentToken();if(rightChar==quote&&(is(token,"attribute-value")||is(token,"string")))return{text:"",selection:[1,1]};if(token||(token=iterator.stepBackward()),!token)return;for(;is(token,"tag-whitespace")||is(token,"whitespace");)token=iterator.stepBackward();var rightSpace=!rightChar||rightChar.match(/\s/);if(is(token,"attribute-equals")&&(rightSpace||">"==rightChar)||is(token,"decl-attribute-equals")&&(rightSpace||"?"==rightChar))return{text:quote+quote,selection:[1,1]}}}),this.add("string_dquotes","deletion",function(state,action,editor,session,range){var selected=session.doc.getTextRange(range);if(!range.isMultiLine()&&('"'==selected||"'"==selected)&&session.doc.getLine(range.start.row).substring(range.start.column+1,range.start.column+2)==selected)return range.end.column++,range}),this.add("autoclosing","insertion",function(state,action,editor,session,text){if(">"==text){var position=editor.getSelectionRange().start,iterator=new TokenIterator(session,position.row,position.column),token=iterator.getCurrentToken()||iterator.stepBackward();if(!token||!(is(token,"tag-name")||is(token,"tag-whitespace")||is(token,"attribute-name")||is(token,"attribute-equals")||is(token,"attribute-value")))return;if(is(token,"reference.attribute-value"))return;if(is(token,"attribute-value")){var firstChar=token.value.charAt(0);if('"'==firstChar||"'"==firstChar){var lastChar=token.value.charAt(token.value.length-1),tokenEnd=iterator.getCurrentTokenColumn()+token.value.length;if(tokenEnd>position.column||tokenEnd==position.column&&firstChar!=lastChar)return}}for(;!is(token,"tag-name");)if("<"==(token=iterator.stepBackward()).value){token=iterator.stepForward();break}var tokenRow=iterator.getCurrentTokenRow(),tokenColumn=iterator.getCurrentTokenColumn();if(is(iterator.stepBackward(),"end-tag-open"))return;var element=token.value;if(tokenRow==position.row&&(element=element.substring(0,position.column-tokenColumn)),this.voidElements.hasOwnProperty(element.toLowerCase()))return;return{text:"></"+element+">",selection:[1,1]}}}),this.add("autoindent","insertion",function(state,action,editor,session,text){if("\n"==text){var cursor=editor.getCursorPosition(),line=session.getLine(cursor.row),iterator=new TokenIterator(session,cursor.row,cursor.column),token=iterator.getCurrentToken();if(token&&-1!==token.type.indexOf("tag-close")){if("/>"==token.value)return;for(;token&&-1===token.type.indexOf("tag-name");)token=iterator.stepBackward();if(!token)return;var tag=token.value,row=iterator.getCurrentTokenRow();if(!(token=iterator.stepBackward())||-1!==token.type.indexOf("end-tag"))return;if(this.voidElements&&!this.voidElements[tag]){var nextToken=session.getTokenAt(cursor.row,cursor.column+1),nextIndent=(line=session.getLine(row),this.$getIndent(line)),indent=nextIndent+session.getTabString();return nextToken&&"</"===nextToken.value?{text:"\n"+indent+"\n"+nextIndent,selection:[1,indent.length,1,indent.length]}:{text:"\n"+indent}}}}})};oop.inherits(XmlBehaviour,Behaviour),exports.XmlBehaviour=XmlBehaviour}),ace.define("ace/mode/folding/xml",["require","exports","module","ace/lib/oop","ace/lib/lang","ace/range","ace/mode/folding/fold_mode","ace/token_iterator"],function(acequire,exports,module){"use strict";var oop=acequire("../../lib/oop"),Range=(acequire("../../lib/lang"),acequire("../../range").Range),BaseFoldMode=acequire("./fold_mode").FoldMode,TokenIterator=acequire("../../token_iterator").TokenIterator,FoldMode=exports.FoldMode=function(voidElements,optionalEndTags){BaseFoldMode.call(this),this.voidElements=voidElements||{},this.optionalEndTags=oop.mixin({},this.voidElements),optionalEndTags&&oop.mixin(this.optionalEndTags,optionalEndTags)};oop.inherits(FoldMode,BaseFoldMode);var Tag=function Tag(){this.tagName="",this.closing=!1,this.selfClosing=!1,this.start={row:0,column:0},this.end={row:0,column:0}};function is(token,type){return token.type.lastIndexOf(type+".xml")>-1}(function(){this.getFoldWidget=function(session,foldStyle,row){var tag=this._getFirstTagInLine(session,row);return tag?tag.closing||!tag.tagName&&tag.selfClosing?"markbeginend"==foldStyle?"end":"":!tag.tagName||tag.selfClosing||this.voidElements.hasOwnProperty(tag.tagName.toLowerCase())?"":this._findEndTagInLine(session,row,tag.tagName,tag.end.column)?"":"start":this.getCommentFoldWidget(session,row)},this.getCommentFoldWidget=function(session,row){return/comment/.test(session.getState(row))&&/<!-/.test(session.getLine(row))?"start":""},this._getFirstTagInLine=function(session,row){for(var tokens=session.getTokens(row),tag=new Tag,i=0;i<tokens.length;i++){var token=tokens[i];if(is(token,"tag-open")){if(tag.end.column=tag.start.column+token.value.length,tag.closing=is(token,"end-tag-open"),!(token=tokens[++i]))return null;for(tag.tagName=token.value,tag.end.column+=token.value.length,i++;i<tokens.length;i++)if(token=tokens[i],tag.end.column+=token.value.length,is(token,"tag-close")){tag.selfClosing="/>"==token.value;break}return tag}if(is(token,"tag-close"))return tag.selfClosing="/>"==token.value,tag;tag.start.column+=token.value.length}return null},this._findEndTagInLine=function(session,row,tagName,startColumn){for(var tokens=session.getTokens(row),column=0,i=0;i<tokens.length;i++){var token=tokens[i];if(!((column+=token.value.length)<startColumn)&&is(token,"end-tag-open")&&(token=tokens[i+1])&&token.value==tagName)return!0}return!1},this._readTagForward=function(iterator){var token=iterator.getCurrentToken();if(!token)return null;var tag=new Tag;do{if(is(token,"tag-open"))tag.closing=is(token,"end-tag-open"),tag.start.row=iterator.getCurrentTokenRow(),tag.start.column=iterator.getCurrentTokenColumn();else if(is(token,"tag-name"))tag.tagName=token.value;else if(is(token,"tag-close"))return tag.selfClosing="/>"==token.value,tag.end.row=iterator.getCurrentTokenRow(),tag.end.column=iterator.getCurrentTokenColumn()+token.value.length,iterator.stepForward(),tag}while(token=iterator.stepForward());return null},this._readTagBackward=function(iterator){var token=iterator.getCurrentToken();if(!token)return null;var tag=new Tag;do{if(is(token,"tag-open"))return tag.closing=is(token,"end-tag-open"),tag.start.row=iterator.getCurrentTokenRow(),tag.start.column=iterator.getCurrentTokenColumn(),iterator.stepBackward(),tag;is(token,"tag-name")?tag.tagName=token.value:is(token,"tag-close")&&(tag.selfClosing="/>"==token.value,tag.end.row=iterator.getCurrentTokenRow(),tag.end.column=iterator.getCurrentTokenColumn()+token.value.length)}while(token=iterator.stepBackward());return null},this._pop=function(stack,tag){for(;stack.length;){var top=stack[stack.length-1];if(tag&&top.tagName!=tag.tagName){if(this.optionalEndTags.hasOwnProperty(top.tagName)){stack.pop();continue}return null}return stack.pop()}},this.getFoldWidgetRange=function(session,foldStyle,row){var firstTag=this._getFirstTagInLine(session,row);if(!firstTag)return this.getCommentFoldWidget(session,row)&&session.getCommentFoldRange(row,session.getLine(row).length);var tag,stack=[];if(firstTag.closing||firstTag.selfClosing){iterator=new TokenIterator(session,row,firstTag.end.column);for(var end={row:row,column:firstTag.start.column};tag=this._readTagBackward(iterator);){if(tag.selfClosing){if(stack.length)continue;return tag.start.column+=tag.tagName.length+2,tag.end.column-=2,Range.fromPoints(tag.start,tag.end)}if(tag.closing)stack.push(tag);else if(this._pop(stack,tag),0==stack.length)return tag.start.column+=tag.tagName.length+2,tag.start.row==tag.end.row&&tag.start.column<tag.end.column&&(tag.start.column=tag.end.column),Range.fromPoints(tag.start,end)}}else{var iterator=new TokenIterator(session,row,firstTag.start.column),start={row:row,column:firstTag.start.column+firstTag.tagName.length+2};for(firstTag.start.row==firstTag.end.row&&(start.column=firstTag.end.column);tag=this._readTagForward(iterator);){if(tag.selfClosing){if(stack.length)continue;return tag.start.column+=tag.tagName.length+2,tag.end.column-=2,Range.fromPoints(tag.start,tag.end)}if(tag.closing){if(this._pop(stack,tag),0==stack.length)return Range.fromPoints(start,tag.start)}else stack.push(tag)}}}}).call(FoldMode.prototype)}),ace.define("ace/mode/xml",["require","exports","module","ace/lib/oop","ace/lib/lang","ace/mode/text","ace/mode/xml_highlight_rules","ace/mode/behaviour/xml","ace/mode/folding/xml","ace/worker/worker_client"],function(acequire,exports,module){"use strict";var oop=acequire("../lib/oop"),lang=acequire("../lib/lang"),TextMode=acequire("./text").Mode,XmlHighlightRules=acequire("./xml_highlight_rules").XmlHighlightRules,XmlBehaviour=acequire("./behaviour/xml").XmlBehaviour,XmlFoldMode=acequire("./folding/xml").FoldMode,WorkerClient=acequire("../worker/worker_client").WorkerClient,Mode=function Mode(){this.HighlightRules=XmlHighlightRules,this.$behaviour=new XmlBehaviour,this.foldingRules=new XmlFoldMode};oop.inherits(Mode,TextMode),function(){this.voidElements=lang.arrayToMap([]),this.blockComment={start:"\x3c!--",end:"--\x3e"},this.createWorker=function(session){var worker=new WorkerClient(["ace"],__webpack_require__(2550),"Worker");return worker.attachToDocument(session.getDocument()),worker.on("error",function(e){session.setAnnotations(e.data)}),worker.on("terminate",function(){session.clearAnnotations()}),worker},this.$id="ace/mode/xml"}.call(Mode.prototype),exports.Mode=Mode})}}]);
//# sourceMappingURL=177.88de1415e235c4e0f3c5.bundle.js.map