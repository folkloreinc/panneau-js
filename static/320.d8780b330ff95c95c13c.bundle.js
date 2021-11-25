webpackJsonp([320],{1218:function(module,exports,__webpack_require__){"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var _extends3=_interopRequireDefault(__webpack_require__(4)),_defineProperty3=_interopRequireDefault(__webpack_require__(12)),_react2=_interopRequireDefault(__webpack_require__(0)),_propTypes2=_interopRequireDefault(__webpack_require__(1)),_classnames2=_interopRequireDefault(__webpack_require__(27));function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}var Marks=function Marks(_ref){var className=_ref.className,vertical=_ref.vertical,reverse=_ref.reverse,marks=_ref.marks,included=_ref.included,upperBound=_ref.upperBound,lowerBound=_ref.lowerBound,max=_ref.max,min=_ref.min,onClickLabel=_ref.onClickLabel,marksKeys=Object.keys(marks),range=max-min,elements=marksKeys.map(parseFloat).sort(function(a,b){return a-b}).map(function(point){var _classNames,markPoint=marks[point],markPointIsObject="object"==typeof markPoint&&!_react2.default.isValidElement(markPoint),markLabel=markPointIsObject?markPoint.label:markPoint;if(!markLabel&&0!==markLabel)return null;var isActive=!included&&point===upperBound||included&&point<=upperBound&&point>=lowerBound,markClassName=(0,_classnames2.default)((_classNames={},(0,_defineProperty3.default)(_classNames,className+"-text",!0),(0,_defineProperty3.default)(_classNames,className+"-text-active",isActive),_classNames)),bottomStyle=(0,_defineProperty3.default)({marginBottom:"-50%"},reverse?"top":"bottom",(point-min)/range*100+"%"),leftStyle=(0,_defineProperty3.default)({transform:"translateX(-50%)",msTransform:"translateX(-50%)"},reverse?"right":"left",reverse?(point-min/4)/range*100+"%":(point-min)/range*100+"%"),style=vertical?bottomStyle:leftStyle,markStyle=markPointIsObject?(0,_extends3.default)({},style,markPoint.style):style;return _react2.default.createElement("span",{className:markClassName,style:markStyle,key:point,onMouseDown:function onMouseDown(e){return onClickLabel(e,point)},onTouchStart:function onTouchStart(e){return onClickLabel(e,point)}},markLabel)});return _react2.default.createElement("div",{className:className},elements)};Marks.propTypes={className:_propTypes2.default.string,vertical:_propTypes2.default.bool,reverse:_propTypes2.default.bool,marks:_propTypes2.default.object,included:_propTypes2.default.bool,upperBound:_propTypes2.default.number,lowerBound:_propTypes2.default.number,max:_propTypes2.default.number,min:_propTypes2.default.number,onClickLabel:_propTypes2.default.func},exports.default=Marks,module.exports=exports.default}});