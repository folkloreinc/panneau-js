'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var FieldsCollection = function () {
    (0, _createClass3.default)(FieldsCollection, null, [{
        key: 'normalizeKey',
        value: function normalizeKey(key) {
            return key.replace(/[^A-Za-z0-9]/gi, '').toLowerCase();
        }
    }]);

    function FieldsCollection(fields) {
        (0, _classCallCheck3.default)(this, FieldsCollection);

        this.fields = {};
        this.addFields(fields);
    }

    (0, _createClass3.default)(FieldsCollection, [{
        key: 'addField',
        value: function addField(key, Component) {
            this.fields[FieldsCollection.normalizeKey(key)] = Component;
        }
    }, {
        key: 'addFields',
        value: function addFields(fields) {
            var _this = this;

            Object.keys(fields || {}).forEach(function (key) {
                _this.addField(key, fields[key]);
            });
        }
    }, {
        key: 'getFields',
        value: function getFields() {
            return this.fields;
        }
    }, {
        key: 'getComponent',
        value: function getComponent(key) {
            var normalizedKey = FieldsCollection.normalizeKey(key);
            var foundKey = Object.keys(this.fields).find(function (fieldKey) {
                return fieldKey === normalizedKey;
            });
            return typeof foundKey !== 'undefined' && foundKey !== null ? this.fields[foundKey] : null;
        }
    }]);
    return FieldsCollection;
}();

exports.default = FieldsCollection;