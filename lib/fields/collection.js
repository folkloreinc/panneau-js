'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _FieldsCollection = require('../lib/FieldsCollection');

var _FieldsCollection2 = _interopRequireDefault(_FieldsCollection);

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fields = {
    Select: _SelectField2.default,
    Text: _TextField2.default,
    Color: _ColorField2.default,
    Code: _CodeField2.default,
    Slider: _SliderField2.default,
    Date: _DateField2.default
};

var fieldsCollection = new _FieldsCollection2.default(fields);

exports.default = fieldsCollection;