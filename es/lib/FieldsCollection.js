import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';

var FieldsCollection = function () {
    _createClass(FieldsCollection, null, [{
        key: 'normalizeKey',
        value: function normalizeKey(key) {
            return key.replace(/[^A-Za-z0-9]/gi, '').toLowerCase();
        }
    }]);

    function FieldsCollection(fields) {
        _classCallCheck(this, FieldsCollection);

        this.fields = {};
        this.addFields(fields);
    }

    _createClass(FieldsCollection, [{
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

export default FieldsCollection;