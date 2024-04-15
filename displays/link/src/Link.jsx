import get from 'lodash/get';
import isString from 'lodash/isString';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link as WouterLink } from 'wouter';

const propTypes = {
    item: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
    value: PropTypes.string,
    label: PropTypes.string,
    labelPath: PropTypes.string,
    external: PropTypes.bool,
    target: PropTypes.string,
    placeholder: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
};

const defaultProps = {
    item: null,
    value: null,
    label: null,
    labelPath: null,
    external: false,
    target: null,
    placeholder: null,
};

const Link = ({ item, label, labelPath, value, external, target, placeholder }) => {
    const itemLabel = get(item, labelPath);
    const finalValue = itemLabel || label || placeholder || (
        <FormattedMessage defaultMessage="Link" description="Display label" />
    );
    const isExternal = value !== null && isString(value) ? value.indexOf('http') === 0 : false;

    return external || isExternal ? (
        <a href={value} target={target || '_blank'} rel="noopener noreferrer">
            {finalValue}
        </a>
    ) : (
        <WouterLink href={value}>{finalValue}</WouterLink>
    );
};

Link.propTypes = propTypes;
Link.defaultProps = defaultProps;

export default Link;
