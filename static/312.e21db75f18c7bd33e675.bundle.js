webpackJsonp([312],{1195:function(module,exports,__webpack_require__){Object.defineProperty(exports,"__esModule",{value:!0});var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||!1,descriptor.configurable=!0,"value"in descriptor&&(descriptor.writable=!0),Object.defineProperty(target,descriptor.key,descriptor)}}return function(Constructor,protoProps,staticProps){return protoProps&&defineProperties(Constructor.prototype,protoProps),staticProps&&defineProperties(Constructor,staticProps),Constructor}}(),_react2=_interopRequireDefault(__webpack_require__(0)),_propTypes2=_interopRequireDefault(__webpack_require__(1)),_consolidatedEvents=__webpack_require__(1196);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}var propTypes={children:_propTypes2.default.node,onOutsideClick:_propTypes2.default.func},defaultProps={children:_react2.default.createElement("span",null),onOutsideClick:function(){return function onOutsideClick(){}}()},OutsideClickHandler=function(_React$Component){function OutsideClickHandler(){var _ref;!function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor))throw new TypeError("Cannot call a class as a function")}(this,OutsideClickHandler);for(var _len=arguments.length,args=Array(_len),_key=0;_key<_len;_key++)args[_key]=arguments[_key];var _this=function _possibleConstructorReturn(self,call){if(!self)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!call||"object"!=typeof call&&"function"!=typeof call?self:call}(this,(_ref=OutsideClickHandler.__proto__||Object.getPrototypeOf(OutsideClickHandler)).call.apply(_ref,[this].concat(args)));return _this.onOutsideClick=_this.onOutsideClick.bind(_this),_this.setChildNodeRef=_this.setChildNodeRef.bind(_this),_this}return function _inherits(subClass,superClass){if("function"!=typeof superClass&&null!==superClass)throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:!1,writable:!0,configurable:!0}}),superClass&&(Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass)}(OutsideClickHandler,_react2["default"].Component),_createClass(OutsideClickHandler,[{key:"componentDidMount",value:function(){return function componentDidMount(){this.removeEventListener=(0,_consolidatedEvents.addEventListener)(document,"click",this.onOutsideClick,{capture:!0})}}()},{key:"componentWillUnmount",value:function(){return function componentWillUnmount(){this.removeEventListener&&this.removeEventListener()}}()},{key:"onOutsideClick",value:function(){return function onOutsideClick(e){var onOutsideClick=this.props.onOutsideClick,childNode=this.childNode;childNode&&childNode.contains(e.target)||onOutsideClick(e)}}()},{key:"setChildNodeRef",value:function(){return function setChildNodeRef(ref){this.childNode=ref}}()},{key:"render",value:function(){return function render(){return _react2.default.createElement("div",{ref:this.setChildNodeRef},this.props.children)}}()}]),OutsideClickHandler}();exports.default=OutsideClickHandler,OutsideClickHandler.propTypes=propTypes,OutsideClickHandler.defaultProps=defaultProps}});