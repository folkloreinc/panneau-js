(window.webpackJsonp=window.webpackJsonp||[]).push([[14],{1070:function(module,exports){ace.define("ace/snippets",["require","exports","module","ace/lib/oop","ace/lib/event_emitter","ace/lib/lang","ace/range","ace/anchor","ace/keyboard/hash_handler","ace/tokenizer","ace/lib/dom","ace/editor"],function(acequire,exports,module){"use strict";var oop=acequire("./lib/oop"),EventEmitter=acequire("./lib/event_emitter").EventEmitter,lang=acequire("./lib/lang"),Range=acequire("./range").Range,Anchor=acequire("./anchor").Anchor,HashHandler=acequire("./keyboard/hash_handler").HashHandler,Tokenizer=acequire("./tokenizer").Tokenizer,comparePoints=Range.comparePoints,SnippetManager=function SnippetManager(){this.snippetMap={},this.snippetNameMap={}};(function(){oop.implement(this,EventEmitter),this.getTokenizer=function(){function TabstopToken(str,_,stack){return str=str.substr(1),/^\d+$/.test(str)&&!stack.inFormatString?[{tabstopId:parseInt(str,10)}]:[{text:str}]}function escape(ch){return"(?:[^\\\\"+ch+"]|\\\\.)"}return SnippetManager.$tokenizer=new Tokenizer({start:[{regex:/:/,onMatch:function onMatch(val,state,stack){return stack.length&&stack[0].expectIf?(stack[0].expectIf=!1,stack[0].elseBranch=stack[0],[stack[0]]):":"}},{regex:/\\./,onMatch:function onMatch(val,state,stack){var ch=val[1];return"}"==ch&&stack.length?val=ch:-1!="`$\\".indexOf(ch)?val=ch:stack.inFormatString&&("n"==ch?val="\n":"t"==ch?val="\n":-1!="ulULE".indexOf(ch)&&(val={changeCase:ch,local:ch>"a"})),[val]}},{regex:/}/,onMatch:function onMatch(val,state,stack){return[stack.length?stack.shift():val]}},{regex:/\$(?:\d+|\w+)/,onMatch:TabstopToken},{regex:/\$\{[\dA-Z_a-z]+/,onMatch:function onMatch(str,state,stack){var t=TabstopToken(str.substr(1),0,stack);return stack.unshift(t[0]),t},next:"snippetVar"},{regex:/\n/,token:"newline",merge:!1}],snippetVar:[{regex:"\\|"+escape("\\|")+"*\\|",onMatch:function onMatch(val,state,stack){stack[0].choices=val.slice(1,-1).split(",")},next:"start"},{regex:"/("+escape("/")+"+)/(?:("+escape("/")+"*)/)(\\w*):?",onMatch:function onMatch(val,state,stack){var ts=stack[0];return ts.fmtString=val,val=this.splitRegex.exec(val),ts.guard=val[1],ts.fmt=val[2],ts.flag=val[3],""},next:"start"},{regex:"`"+escape("`")+"*`",onMatch:function onMatch(val,state,stack){return stack[0].code=val.splice(1,-1),""},next:"start"},{regex:"\\?",onMatch:function onMatch(val,state,stack){stack[0]&&(stack[0].expectIf=!0)},next:"start"},{regex:"([^:}\\\\]|\\\\.)*:?",token:"",next:"start"}],formatString:[{regex:"/("+escape("/")+"+)/",token:"regex"},{regex:"",onMatch:function onMatch(val,state,stack){stack.inFormatString=!0},next:"start"}]}),SnippetManager.prototype.getTokenizer=function(){return SnippetManager.$tokenizer},SnippetManager.$tokenizer},this.tokenizeTmSnippet=function(str,startState){return this.getTokenizer().getLineTokens(str,startState).tokens.map(function(x){return x.value||x})},this.$getDefaultValue=function(editor,name){if(/^[A-Z]\d+$/.test(name)){var i=name.substr(1);return(this.variables[name[0]+"__"]||{})[i]}if(/^\d+$/.test(name))return(this.variables.__||{})[name];if(name=name.replace(/^TM_/,""),editor){var s=editor.session;switch(name){case"CURRENT_WORD":var r=s.getWordRange();case"SELECTION":case"SELECTED_TEXT":return s.getTextRange(r);case"CURRENT_LINE":return s.getLine(editor.getCursorPosition().row);case"PREV_LINE":return s.getLine(editor.getCursorPosition().row-1);case"LINE_INDEX":return editor.getCursorPosition().column;case"LINE_NUMBER":return editor.getCursorPosition().row+1;case"SOFT_TABS":return s.getUseSoftTabs()?"YES":"NO";case"TAB_SIZE":return s.getTabSize();case"FILENAME":case"FILEPATH":return"";case"FULLNAME":return"Ace"}}},this.variables={},this.getVariableValue=function(editor,varName){return this.variables.hasOwnProperty(varName)?this.variables[varName](editor,varName)||"":this.$getDefaultValue(editor,varName)||""},this.tmStrFormat=function(str,ch,editor){var flag=ch.flag||"",re=ch.guard;re=new RegExp(re,flag.replace(/[^gi]/,""));var fmtTokens=this.tokenizeTmSnippet(ch.fmt,"formatString"),_self=this,formatted=str.replace(re,function(){_self.variables.__=arguments;for(var fmtParts=_self.resolveVariables(fmtTokens,editor),gChangeCase="E",i=0;i<fmtParts.length;i++){var ch=fmtParts[i];if("object"==typeof ch)if(fmtParts[i]="",ch.changeCase&&ch.local){var next=fmtParts[i+1];next&&"string"==typeof next&&("u"==ch.changeCase?fmtParts[i]=next[0].toUpperCase():fmtParts[i]=next[0].toLowerCase(),fmtParts[i+1]=next.substr(1))}else ch.changeCase&&(gChangeCase=ch.changeCase);else"U"==gChangeCase?fmtParts[i]=ch.toUpperCase():"L"==gChangeCase&&(fmtParts[i]=ch.toLowerCase())}return fmtParts.join("")});return this.variables.__=null,formatted},this.resolveVariables=function(snippet,editor){for(var result=[],i=0;i<snippet.length;i++){var ch=snippet[i];if("string"==typeof ch)result.push(ch);else{if("object"!=typeof ch)continue;if(ch.skip)gotoNext(ch);else{if(ch.processed<i)continue;if(ch.text){var value=this.getVariableValue(editor,ch.text);value&&ch.fmtString&&(value=this.tmStrFormat(value,ch)),ch.processed=i,null==ch.expectIf?value&&(result.push(value),gotoNext(ch)):value?ch.skip=ch.elseBranch:gotoNext(ch)}else null!=ch.tabstopId?result.push(ch):null!=ch.changeCase&&result.push(ch)}}}function gotoNext(ch){var i1=snippet.indexOf(ch,i+1);-1!=i1&&(i=i1)}return result},this.insertSnippetForSelection=function(editor,snippetText){var cursor=editor.getCursorPosition(),line=editor.session.getLine(cursor.row),tabString=editor.session.getTabString(),indentString=line.match(/^\s*/)[0];cursor.column<indentString.length&&(indentString=indentString.slice(0,cursor.column)),snippetText=snippetText.replace(/\r/g,"");var tokens=this.tokenizeTmSnippet(snippetText);tokens=(tokens=this.resolveVariables(tokens,editor)).map(function(x){return"\n"==x?x+indentString:"string"==typeof x?x.replace(/\t/g,tabString):x});var tabstops=[];tokens.forEach(function(p,i){if("object"==typeof p){var id=p.tabstopId,ts=tabstops[id];if(ts||((ts=tabstops[id]=[]).index=id,ts.value=""),-1===ts.indexOf(p)){ts.push(p);var i1=tokens.indexOf(p,i+1);if(-1!==i1){var value=tokens.slice(i+1,i1);value.some(function(t){return"object"==typeof t})&&!ts.value?ts.value=value:!value.length||ts.value&&"string"==typeof ts.value||(ts.value=value.join(""))}}}}),tabstops.forEach(function(ts){ts.length=0});var expanding={};function copyValue(val){for(var copy=[],i=0;i<val.length;i++){var p=val[i];if("object"==typeof p){if(expanding[p.tabstopId])continue;p=copy[val.lastIndexOf(p,i-1)]||{tabstopId:p.tabstopId}}copy[i]=p}return copy}for(var i=0;i<tokens.length;i++){var p=tokens[i];if("object"==typeof p){var id=p.tabstopId,i1=tokens.indexOf(p,i+1);if(expanding[id])expanding[id]===p&&(expanding[id]=null);else{var ts=tabstops[id],arg="string"==typeof ts.value?[ts.value]:copyValue(ts.value);arg.unshift(i+1,Math.max(0,i1-i)),arg.push(p),expanding[id]=p,tokens.splice.apply(tokens,arg),-1===ts.indexOf(p)&&ts.push(p)}}}var row=0,column=0,text="";tokens.forEach(function(t){if("string"==typeof t){var lines=t.split("\n");lines.length>1?(column=lines[lines.length-1].length,row+=lines.length-1):column+=t.length,text+=t}else t.start?t.end={row:row,column:column}:t.start={row:row,column:column}});var range=editor.getSelectionRange(),end=editor.session.replace(range,text),tabstopManager=new TabstopManager(editor),selectionId=editor.inVirtualSelectionMode&&editor.selection.index;tabstopManager.addTabstops(tabstops,range.start,end,selectionId)},this.insertSnippet=function(editor,snippetText){var self=this;if(editor.inVirtualSelectionMode)return self.insertSnippetForSelection(editor,snippetText);editor.forEachSelection(function(){self.insertSnippetForSelection(editor,snippetText)},null,{keepOrder:!0}),editor.tabstopManager&&editor.tabstopManager.tabNext()},this.$getScope=function(editor){var scope=editor.session.$mode.$id||"";if("html"===(scope=scope.split("/").pop())||"php"===scope){"php"!==scope||editor.session.$mode.inlinePhp||(scope="html");var c=editor.getCursorPosition(),state=editor.session.getState(c.row);"object"==typeof state&&(state=state[0]),state.substring&&("js-"==state.substring(0,3)?scope="javascript":"css-"==state.substring(0,4)?scope="css":"php-"==state.substring(0,4)&&(scope="php"))}return scope},this.getActiveScopes=function(editor){var scope=this.$getScope(editor),scopes=[scope],snippetMap=this.snippetMap;return snippetMap[scope]&&snippetMap[scope].includeScopes&&scopes.push.apply(scopes,snippetMap[scope].includeScopes),scopes.push("_"),scopes},this.expandWithTab=function(editor,options){var self=this,result=editor.forEachSelection(function(){return self.expandSnippetForSelection(editor,options)},null,{keepOrder:!0});return result&&editor.tabstopManager&&editor.tabstopManager.tabNext(),result},this.expandSnippetForSelection=function(editor,options){var snippet,cursor=editor.getCursorPosition(),line=editor.session.getLine(cursor.row),before=line.substring(0,cursor.column),after=line.substr(cursor.column),snippetMap=this.snippetMap;return this.getActiveScopes(editor).some(function(scope){var snippets=snippetMap[scope];return snippets&&(snippet=this.findMatchingSnippet(snippets,before,after)),!!snippet},this),!!snippet&&(!(!options||!options.dryRun)||(editor.session.doc.removeInLine(cursor.row,cursor.column-snippet.replaceBefore.length,cursor.column+snippet.replaceAfter.length),this.variables.M__=snippet.matchBefore,this.variables.T__=snippet.matchAfter,this.insertSnippetForSelection(editor,snippet.content),this.variables.M__=this.variables.T__=null,!0))},this.findMatchingSnippet=function(snippetList,before,after){for(var i=snippetList.length;i--;){var s=snippetList[i];if((!s.startRe||s.startRe.test(before))&&((!s.endRe||s.endRe.test(after))&&(s.startRe||s.endRe)))return s.matchBefore=s.startRe?s.startRe.exec(before):[""],s.matchAfter=s.endRe?s.endRe.exec(after):[""],s.replaceBefore=s.triggerRe?s.triggerRe.exec(before)[0]:"",s.replaceAfter=s.endTriggerRe?s.endTriggerRe.exec(after)[0]:"",s}},this.snippetMap={},this.snippetNameMap={},this.register=function(snippets,scope){var snippetMap=this.snippetMap,snippetNameMap=this.snippetNameMap,self=this;function wrapRegexp(src){return src&&!/^\^?\(.*\)\$?$|^\\b$/.test(src)&&(src="(?:"+src+")"),src||""}function guardedRegexp(re,guard,opening){return re=wrapRegexp(re),guard=wrapRegexp(guard),opening?(re=guard+re)&&"$"!=re[re.length-1]&&(re+="$"):(re+=guard)&&"^"!=re[0]&&(re="^"+re),new RegExp(re)}function addSnippet(s){s.scope||(s.scope=scope||"_"),scope=s.scope,snippetMap[scope]||(snippetMap[scope]=[],snippetNameMap[scope]={});var map=snippetNameMap[scope];if(s.name){var old=map[s.name];old&&self.unregister(old),map[s.name]=s}snippetMap[scope].push(s),s.tabTrigger&&!s.trigger&&(!s.guard&&/^\w/.test(s.tabTrigger)&&(s.guard="\\b"),s.trigger=lang.escapeRegExp(s.tabTrigger)),(s.trigger||s.guard||s.endTrigger||s.endGuard)&&(s.startRe=guardedRegexp(s.trigger,s.guard,!0),s.triggerRe=new RegExp(s.trigger,"",!0),s.endRe=guardedRegexp(s.endTrigger,s.endGuard,!0),s.endTriggerRe=new RegExp(s.endTrigger,"",!0))}snippets||(snippets=[]),snippets&&snippets.content?addSnippet(snippets):Array.isArray(snippets)&&snippets.forEach(addSnippet),this._signal("registerSnippets",{scope:scope})},this.unregister=function(snippets,scope){var snippetMap=this.snippetMap,snippetNameMap=this.snippetNameMap;function removeSnippet(s){var nameMap=snippetNameMap[s.scope||scope];if(nameMap&&nameMap[s.name]){delete nameMap[s.name];var map=snippetMap[s.scope||scope],i=map&&map.indexOf(s);i>=0&&map.splice(i,1)}}snippets.content?removeSnippet(snippets):Array.isArray(snippets)&&snippets.forEach(removeSnippet)},this.parseSnippetFile=function(str){str=str.replace(/\r/g,"");for(var m,list=[],snippet={},re=/^#.*|^({[\s\S]*})\s*$|^(\S+) (.*)$|^((?:\n*\t.*)+)/gm;m=re.exec(str);){if(m[1])try{snippet=JSON.parse(m[1]),list.push(snippet)}catch(e){}if(m[4])snippet.content=m[4].replace(/^\t/gm,""),list.push(snippet),snippet={};else{var key=m[2],val=m[3];if("regex"==key){var guardRe=/\/((?:[^\/\\]|\\.)*)|$/g;snippet.guard=guardRe.exec(val)[1],snippet.trigger=guardRe.exec(val)[1],snippet.endTrigger=guardRe.exec(val)[1],snippet.endGuard=guardRe.exec(val)[1]}else"snippet"==key?(snippet.tabTrigger=val.match(/^\S*/)[0],snippet.name||(snippet.name=val)):snippet[key]=val}}return list},this.getSnippetByName=function(name,editor){var snippet,snippetMap=this.snippetNameMap;return this.getActiveScopes(editor).some(function(scope){var snippets=snippetMap[scope];return snippets&&(snippet=snippets[name]),!!snippet},this),snippet}}).call(SnippetManager.prototype);var TabstopManager=function TabstopManager(editor){if(editor.tabstopManager)return editor.tabstopManager;editor.tabstopManager=this,this.$onChange=this.onChange.bind(this),this.$onChangeSelection=lang.delayedCall(this.onChangeSelection.bind(this)).schedule,this.$onChangeSession=this.onChangeSession.bind(this),this.$onAfterExec=this.onAfterExec.bind(this),this.attach(editor)};(function(){this.attach=function(editor){this.index=0,this.ranges=[],this.tabstops=[],this.$openTabstops=null,this.selectedTabstop=null,this.editor=editor,this.editor.on("change",this.$onChange),this.editor.on("changeSelection",this.$onChangeSelection),this.editor.on("changeSession",this.$onChangeSession),this.editor.commands.on("afterExec",this.$onAfterExec),this.editor.keyBinding.addKeyboardHandler(this.keyboardHandler)},this.detach=function(){this.tabstops.forEach(this.removeTabstopMarkers,this),this.ranges=null,this.tabstops=null,this.selectedTabstop=null,this.editor.removeListener("change",this.$onChange),this.editor.removeListener("changeSelection",this.$onChangeSelection),this.editor.removeListener("changeSession",this.$onChangeSession),this.editor.commands.removeListener("afterExec",this.$onAfterExec),this.editor.keyBinding.removeKeyboardHandler(this.keyboardHandler),this.editor.tabstopManager=null,this.editor=null},this.onChange=function(delta){var isRemove="r"==delta.action[0],start=delta.start,end=delta.end,startRow=start.row,lineDif=end.row-startRow,colDiff=end.column-start.column;if(isRemove&&(lineDif=-lineDif,colDiff=-colDiff),!this.$inChange&&isRemove){var ts=this.selectedTabstop;if(ts&&!ts.some(function(r){return comparePoints(r.start,start)<=0&&comparePoints(r.end,end)>=0}))return this.detach()}for(var ranges=this.ranges,i=0;i<ranges.length;i++){var r=ranges[i];r.end.row<start.row||(isRemove&&comparePoints(start,r.start)<0&&comparePoints(end,r.end)>0?(this.removeRange(r),i--):(r.start.row==startRow&&r.start.column>start.column&&(r.start.column+=colDiff),r.end.row==startRow&&r.end.column>=start.column&&(r.end.column+=colDiff),r.start.row>=startRow&&(r.start.row+=lineDif),r.end.row>=startRow&&(r.end.row+=lineDif),comparePoints(r.start,r.end)>0&&this.removeRange(r)))}ranges.length||this.detach()},this.updateLinkedFields=function(){var ts=this.selectedTabstop;if(ts&&ts.hasLinkedRanges){this.$inChange=!0;for(var session=this.editor.session,text=session.getTextRange(ts.firstNonLinked),i=ts.length;i--;){var range=ts[i];if(range.linked){var fmt=exports.snippetManager.tmStrFormat(text,range.original);session.replace(range,fmt)}}this.$inChange=!1}},this.onAfterExec=function(e){e.command&&!e.command.readOnly&&this.updateLinkedFields()},this.onChangeSelection=function(){if(this.editor){for(var lead=this.editor.selection.lead,anchor=this.editor.selection.anchor,isEmpty=this.editor.selection.isEmpty(),i=this.ranges.length;i--;)if(!this.ranges[i].linked){var containsLead=this.ranges[i].contains(lead.row,lead.column),containsAnchor=isEmpty||this.ranges[i].contains(anchor.row,anchor.column);if(containsLead&&containsAnchor)return}this.detach()}},this.onChangeSession=function(){this.detach()},this.tabNext=function(dir){var max=this.tabstops.length,index=this.index+(dir||1);(index=Math.min(Math.max(index,1),max))==max&&(index=0),this.selectTabstop(index),0===index&&this.detach()},this.selectTabstop=function(index){this.$openTabstops=null;var ts=this.tabstops[this.index];if(ts&&this.addTabstopMarkers(ts),this.index=index,(ts=this.tabstops[this.index])&&ts.length){if(this.selectedTabstop=ts,this.editor.inVirtualSelectionMode)this.editor.selection.setRange(ts.firstNonLinked);else{var sel=this.editor.multiSelect;sel.toSingleRange(ts.firstNonLinked.clone());for(var i=ts.length;i--;)ts.hasLinkedRanges&&ts[i].linked||sel.addRange(ts[i].clone(),!0);sel.ranges[0]&&sel.addRange(sel.ranges[0].clone())}this.editor.keyBinding.addKeyboardHandler(this.keyboardHandler)}},this.addTabstops=function(tabstops,start,end){if(this.$openTabstops||(this.$openTabstops=[]),!tabstops[0]){var p=Range.fromPoints(end,end);moveRelative(p.start,start),moveRelative(p.end,start),tabstops[0]=[p],tabstops[0].index=0}var arg=[this.index+1,0],ranges=this.ranges;tabstops.forEach(function(ts,index){for(var dest=this.$openTabstops[index]||ts,i=ts.length;i--;){var p=ts[i],range=Range.fromPoints(p.start,p.end||p.start);movePoint(range.start,start),movePoint(range.end,start),range.original=p,range.tabstop=dest,ranges.push(range),dest!=ts?dest.unshift(range):dest[i]=range,p.fmtString?(range.linked=!0,dest.hasLinkedRanges=!0):dest.firstNonLinked||(dest.firstNonLinked=range)}dest.firstNonLinked||(dest.hasLinkedRanges=!1),dest===ts&&(arg.push(dest),this.$openTabstops[index]=dest),this.addTabstopMarkers(dest)},this),arg.length>2&&(this.tabstops.length&&arg.push(arg.splice(2,1)[0]),this.tabstops.splice.apply(this.tabstops,arg))},this.addTabstopMarkers=function(ts){var session=this.editor.session;ts.forEach(function(range){range.markerId||(range.markerId=session.addMarker(range,"ace_snippet-marker","text"))})},this.removeTabstopMarkers=function(ts){var session=this.editor.session;ts.forEach(function(range){session.removeMarker(range.markerId),range.markerId=null})},this.removeRange=function(range){var i=range.tabstop.indexOf(range);range.tabstop.splice(i,1),i=this.ranges.indexOf(range),this.ranges.splice(i,1),this.editor.session.removeMarker(range.markerId),range.tabstop.length||(-1!=(i=this.tabstops.indexOf(range.tabstop))&&this.tabstops.splice(i,1),this.tabstops.length||this.detach())},this.keyboardHandler=new HashHandler,this.keyboardHandler.bindKeys({Tab:function Tab(ed){exports.snippetManager&&exports.snippetManager.expandWithTab(ed)||ed.tabstopManager.tabNext(1)},"Shift-Tab":function ShiftTab(ed){ed.tabstopManager.tabNext(-1)},Esc:function Esc(ed){ed.tabstopManager.detach()},Return:function Return(ed){return!1}})}).call(TabstopManager.prototype);var changeTracker={};changeTracker.onChange=Anchor.prototype.onChange,changeTracker.setPosition=function(row,column){this.pos.row=row,this.pos.column=column},changeTracker.update=function(pos,delta,$insertRight){this.$insertRight=$insertRight,this.pos=pos,this.onChange(delta)};var movePoint=function movePoint(point,diff){0==point.row&&(point.column+=diff.column),point.row+=diff.row},moveRelative=function moveRelative(point,start){point.row==start.row&&(point.column-=start.column),point.row-=start.row};acequire("./lib/dom").importCssString(".ace_snippet-marker {    -moz-box-sizing: border-box;    box-sizing: border-box;    background: rgba(194, 193, 208, 0.09);    border: 1px dotted rgba(211, 208, 235, 0.62);    position: absolute;}"),exports.snippetManager=new SnippetManager;var Editor=acequire("./editor").Editor;(function(){this.insertSnippet=function(content,options){return exports.snippetManager.insertSnippet(this,content,options)},this.expandSnippet=function(options){return exports.snippetManager.expandWithTab(this,options)}}).call(Editor.prototype)}),ace.define("ace/ext/emmet",["require","exports","module","ace/keyboard/hash_handler","ace/editor","ace/snippets","ace/range","resources","resources","tabStops","resources","utils","actions","ace/config","ace/config"],function(acequire,exports,module){"use strict";var emmet,emmetPath,HashHandler=acequire("ace/keyboard/hash_handler").HashHandler,Editor=acequire("ace/editor").Editor,snippetManager=acequire("ace/snippets").snippetManager,Range=acequire("ace/range").Range;function AceEmmetEditor(){}AceEmmetEditor.prototype={setupContext:function setupContext(editor){this.ace=editor,this.indentation=editor.session.getTabString(),emmet||(emmet=window.emmet),(emmet.resources||emmet.require("resources")).setVariable("indentation",this.indentation),this.$syntax=null,this.$syntax=this.getSyntax()},getSelectionRange:function getSelectionRange(){var range=this.ace.getSelectionRange(),doc=this.ace.session.doc;return{start:doc.positionToIndex(range.start),end:doc.positionToIndex(range.end)}},createSelection:function createSelection(start,end){var doc=this.ace.session.doc;this.ace.selection.setRange({start:doc.indexToPosition(start),end:doc.indexToPosition(end)})},getCurrentLineRange:function getCurrentLineRange(){var ace=this.ace,row=ace.getCursorPosition().row,lineLength=ace.session.getLine(row).length,index=ace.session.doc.positionToIndex({row:row,column:0});return{start:index,end:index+lineLength}},getCaretPos:function getCaretPos(){var pos=this.ace.getCursorPosition();return this.ace.session.doc.positionToIndex(pos)},setCaretPos:function setCaretPos(index){var pos=this.ace.session.doc.indexToPosition(index);this.ace.selection.moveToPosition(pos)},getCurrentLine:function getCurrentLine(){var row=this.ace.getCursorPosition().row;return this.ace.session.getLine(row)},replaceContent:function replaceContent(value,start,end,noIndent){null==end&&(end=null==start?this.getContent().length:start),null==start&&(start=0);var editor=this.ace,doc=editor.session.doc,range=Range.fromPoints(doc.indexToPosition(start),doc.indexToPosition(end));editor.session.remove(range),range.end=range.start,value=this.$updateTabstops(value),snippetManager.insertSnippet(editor,value)},getContent:function getContent(){return this.ace.getValue()},getSyntax:function getSyntax(){if(this.$syntax)return this.$syntax;var syntax=this.ace.session.$modeId.split("/").pop();if("html"==syntax||"php"==syntax){var cursor=this.ace.getCursorPosition(),state=this.ace.session.getState(cursor.row);"string"!=typeof state&&(state=state[0]),state&&((state=state.split("-")).length>1?syntax=state[0]:"php"==syntax&&(syntax="html"))}return syntax},getProfileName:function getProfileName(){var resources=emmet.resources||emmet.require("resources");switch(this.getSyntax()){case"css":return"css";case"xml":case"xsl":return"xml";case"html":var profile=resources.getVariable("profile");return profile||(profile=-1!=this.ace.session.getLines(0,2).join("").search(/<!DOCTYPE[^>]+XHTML/i)?"xhtml":"html"),profile;default:var mode=this.ace.session.$mode;return mode.emmetConfig&&mode.emmetConfig.profile||"xhtml"}},prompt:function(_prompt){function prompt(_x){return _prompt.apply(this,arguments)}return prompt.toString=function(){return _prompt.toString()},prompt}(function(title){return prompt(title)}),getSelection:function getSelection(){return this.ace.session.getTextRange()},getFilePath:function getFilePath(){return""},$updateTabstops:function $updateTabstops(value){var zeroBase=0,lastZero=null,ts=emmet.tabStops||emmet.require("tabStops"),settings=(emmet.resources||emmet.require("resources")).getVocabulary("user"),tabstopOptions={tabstop:function tabstop(data){var group=parseInt(data.group,10),isZero=0===group;isZero?group=++zeroBase:group+=1e3;var placeholder=data.placeholder;placeholder&&(placeholder=ts.processText(placeholder,tabstopOptions));var result="${"+group+(placeholder?":"+placeholder:"")+"}";return isZero&&(lastZero=[data.start,result]),result},escape:function escape(ch){return"$"==ch?"\\$":"\\"==ch?"\\\\":ch}};if(value=ts.processText(value,tabstopOptions),settings.variables.insert_final_tabstop&&!/\$\{0\}$/.test(value))value+="${0}";else if(lastZero){value=(emmet.utils?emmet.utils.common:emmet.require("utils")).replaceSubstring(value,"${0}",lastZero[0],lastZero[1])}return value}};var keymap={expand_abbreviation:{mac:"ctrl+alt+e",win:"alt+e"},match_pair_outward:{mac:"ctrl+d",win:"ctrl+,"},match_pair_inward:{mac:"ctrl+j",win:"ctrl+shift+0"},matching_pair:{mac:"ctrl+alt+j",win:"alt+j"},next_edit_point:"alt+right",prev_edit_point:"alt+left",toggle_comment:{mac:"command+/",win:"ctrl+/"},split_join_tag:{mac:"shift+command+'",win:"shift+ctrl+`"},remove_tag:{mac:"command+'",win:"shift+ctrl+;"},evaluate_math_expression:{mac:"shift+command+y",win:"shift+ctrl+y"},increment_number_by_1:"ctrl+up",decrement_number_by_1:"ctrl+down",increment_number_by_01:"alt+up",decrement_number_by_01:"alt+down",increment_number_by_10:{mac:"alt+command+up",win:"shift+alt+up"},decrement_number_by_10:{mac:"alt+command+down",win:"shift+alt+down"},select_next_item:{mac:"shift+command+.",win:"shift+ctrl+."},select_previous_item:{mac:"shift+command+,",win:"shift+ctrl+,"},reflect_css_value:{mac:"shift+command+r",win:"shift+ctrl+r"},encode_decode_data_url:{mac:"shift+ctrl+d",win:"ctrl+'"},expand_abbreviation_with_tab:"Tab",wrap_with_abbreviation:{mac:"shift+ctrl+a",win:"shift+ctrl+a"}},editorProxy=new AceEmmetEditor;for(var command in exports.commands=new HashHandler,exports.runEmmetCommand=function runEmmetCommand(editor){try{editorProxy.setupContext(editor);var actions=emmet.actions||emmet.require("actions");if("expand_abbreviation_with_tab"==this.action){if(!editor.selection.isEmpty())return!1;var pos=editor.selection.lead,token=editor.session.getTokenAt(pos.row,pos.column);if(token&&/\btag\b/.test(token.type))return!1}if("wrap_with_abbreviation"==this.action)return setTimeout(function(){actions.run("wrap_with_abbreviation",editorProxy)},0);var result=actions.run(this.action,editorProxy)}catch(e){if(!emmet)return load(runEmmetCommand.bind(this,editor)),!0;editor._signal("changeStatus","string"==typeof e?e:e.message),console.log(e),result=!1}return result},keymap)exports.commands.addCommand({name:"emmet:"+command,action:command,bindKey:keymap[command],exec:exports.runEmmetCommand,multiSelectAction:"forEach"});exports.updateCommands=function(editor,enabled){enabled?editor.keyBinding.addKeyboardHandler(exports.commands):editor.keyBinding.removeKeyboardHandler(exports.commands)},exports.isSupportedMode=function(mode){if(!mode)return!1;if(mode.emmetConfig)return!0;var id=mode.$id||mode;return/css|less|scss|sass|stylus|html|php|twig|ejs|handlebars/.test(id)},exports.isAvailable=function(editor,command){if(/(evaluate_math_expression|expand_abbreviation)$/.test(command))return!0;var mode=editor.session.$mode,isSupported=exports.isSupportedMode(mode);if(isSupported&&mode.$modes)try{editorProxy.setupContext(editor),/js|php/.test(editorProxy.getSyntax())&&(isSupported=!1)}catch(e){}return isSupported};var onChangeMode=function onChangeMode(e,target){var editor=target;if(editor){var enabled=exports.isSupportedMode(editor.session.$mode);!1===e.enableEmmet&&(enabled=!1),enabled&&load(),exports.updateCommands(editor,enabled)}},load=function load(cb){"string"==typeof emmetPath&&acequire("ace/config").loadModule(emmetPath,function(){emmetPath=null,cb&&cb()})};exports.AceEmmetEditor=AceEmmetEditor,acequire("ace/config").defineOptions(Editor.prototype,"editor",{enableEmmet:{set:function set(val){this[val?"on":"removeListener"]("changeMode",onChangeMode),onChangeMode({enableEmmet:!!val},this)},value:!0}}),exports.setCore=function(e){"string"==typeof e?emmetPath=e:emmet=e}}),ace.acequire(["ace/ext/emmet"],function(){})}}]);
//# sourceMappingURL=14.88de1415e235c4e0f3c5.bundle.js.map