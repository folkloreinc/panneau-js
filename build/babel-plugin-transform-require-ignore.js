/* eslint-disable */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  function extFix(ext) {
    return ext.charAt(0) === '.' ? ext : '.' + ext;
  }

  return {
    visitor: {
      CallExpression: {
        enter: function enter(nodePath, _ref) {
          var opts = _ref.opts;

          var extensionsInput = [].concat(opts.extensions || []);
          if (extensionsInput.length === 0) {
            return;
          }
          var extensions = extensionsInput.map(extFix);
          var callee = nodePath.get('callee');

          if (callee.isIdentifier() && callee.equals('name', 'require')) {
            var arg = nodePath.get('arguments')[0];
            if (arg && arg.isStringLiteral() && extensions.indexOf(_path2.default.extname(arg.node.value)) > -1) {
              if (nodePath.parentPath.isVariableDeclarator()) {
                throw new Error(arg.node.value + ' should not be assign to variable.');
              } else {
                nodePath.remove();
              }
            }
          }
        }
      },

      ImportDeclaration: {
        enter: function enter(nodePath, _ref2) {
          var opts = _ref2.opts;

          var extensionsInput = [].concat(opts.extensions || []);

          if (extensionsInput.length === 0) {
            return;
          }
          var extensions = extensionsInput.map(extFix);
          const regExp = new RegExp('('+extensions.join('|')+')$', 'i');

          if (nodePath.node.source.value.match(regExp)) {
            var specifiers = nodePath.get('specifiers');

            if (specifiers.length) {
              var specifier = specifiers[specifiers.length - 1];

              if (specifier.isImportDefaultSpecifier()) {
                throw new Error(nodePath.node.source.value + ' should not be imported using default imports.');
              }
              if (specifier.isImportSpecifier()) {
                throw new Error(nodePath.node.source.value + ' should not be imported using named imports.');
              }
              if (specifier.isImportNamespaceSpecifier()) {
                throw new Error(nodePath.node.source.value + ' should not be imported using namespace imports.');
              }
            }

            nodePath.remove();
          }
        }
      }
    }
  };
};

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
