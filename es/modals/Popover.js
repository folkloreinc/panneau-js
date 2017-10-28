import _extends from 'babel-runtime/helpers/extends';
import _defineProperty from 'babel-runtime/helpers/defineProperty';
import _objectWithoutProperties from 'babel-runtime/helpers/objectWithoutProperties';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import OutsideClickHandler from '../partials/OutsideClickHandler';

var styles = {
    'popover': 'panneau-popover-popover'
};


var propTypes = {
    children: PropTypes.node.isRequired,
    closable: PropTypes.bool,
    className: PropTypes.string,
    onClose: PropTypes.func
};

var defaultProps = {
    closable: true,
    className: null,
    onClose: null
};

var Popover = function Popover(_ref) {
    var _classNames;

    var closable = _ref.closable,
        className = _ref.className,
        children = _ref.children,
        onClose = _ref.onClose,
        other = _objectWithoutProperties(_ref, ['closable', 'className', 'children', 'onClose']);

    var popoverClassName = classNames((_classNames = {}, _defineProperty(_classNames, styles.popover, true), _defineProperty(_classNames, className, className !== null), _classNames));
    if (closable) {
        return React.createElement(
            'div',
            _extends({ className: popoverClassName }, other),
            React.createElement(
                OutsideClickHandler,
                { onOutsideClick: onClose },
                children
            )
        );
    }
    return React.createElement(
        'div',
        _extends({ className: popoverClassName }, other),
        children
    );
};

Popover.propTypes = propTypes;
Popover.defaultProps = defaultProps;

export default Popover;