'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.fieldsCollection = exports.Date = exports.Slider = exports.Code = exports.Color = exports.Text = exports.Select = undefined;

var _SelectField = require('./SelectField');

var _SelectField2 = _interopRequireDefault(_SelectField);

var _TextField = require('./TextField');

var _TextField2 = _interopRequireDefault(_TextField);

var _ColorField = require('./ColorField');

var _ColorField2 = _interopRequireDefault(_ColorField);

var _CodeField = require('./CodeField');

var _CodeField2 = _interopRequireDefault(_CodeField);

var _SliderField = require('./SliderField');

var _SliderField2 = _interopRequireDefault(_SliderField);

var _DateField = require('./DateField');

var _DateField2 = _interopRequireDefault(_DateField);

var _collection = require('./collection');

var _collection2 = _interopRequireDefault(_collection);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.Select = _SelectField2.default;
exports.Text = _TextField2.default;
exports.Color = _ColorField2.default;
exports.Code = _CodeField2.default;
exports.Slider = _SliderField2.default;
exports.Date = _DateField2.default;
exports.fieldsCollection = _collection2.default;