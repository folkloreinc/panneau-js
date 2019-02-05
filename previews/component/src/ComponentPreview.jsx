import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import isFunction from 'lodash/isFunction';
import get from 'lodash/get';

import styles from './styles.scss';

const propTypes = {
    value: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array,
        PropTypes.number,
        PropTypes.string,
    ]),
    valueToProps: PropTypes.oneOfType([PropTypes.func, PropTypes.objectOf(PropTypes.string)]),
    children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
    Component: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    withoutReset: PropTypes.bool,
    withoutContainerReset: PropTypes.bool,
    withoutChildrenReset: PropTypes.bool,
    containerStyle: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
};

const defaultProps = {
    value: null,
    valueToProps: null,
    children: null,
    Component: null,
    withoutReset: false,
    withoutContainerReset: false,
    withoutChildrenReset: false,
    containerStyle: null,
};

const ComponentPreview = ({
    value,
    children,
    valueToProps,
    Component,
    withoutReset,
    withoutContainerReset,
    withoutChildrenReset,
    containerStyle,
    ...props
}) => {
    let previewProps = null;
    if (valueToProps !== null) {
        if (isFunction(valueToProps)) {
            previewProps = valueToProps(value, props);
        } else {
            previewProps = Object.keys(valueToProps).reduce(
                (allProps, key) => ({
                    ...allProps,
                    [key]: get(value, valueToProps[key]),
                }),
                {
                    ...props,
                },
            );
        }
    } else {
        previewProps = {
            value,
            ...props,
        };
    }

    let element;
    if (children !== null) {
        if (isFunction(children)) {
            element = children(previewProps);
        } else {
            element = React.cloneElement(children, previewProps);
        }
    } else if (Component !== null) {
        element = <Component {...previewProps} />;
    }

    return (
        <div
            className={classNames([
                styles.container,
                {
                    [styles.resetContainer]: !withoutReset && !withoutContainerReset,
                    [styles.resetChildren]: !withoutReset && !withoutChildrenReset,
                },
            ])}
            style={containerStyle}
        >
            {element}
        </div>
    );
};

ComponentPreview.propTypes = propTypes;
ComponentPreview.defaultProps = defaultProps;

export default ComponentPreview;
