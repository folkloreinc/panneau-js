import React from 'react';
import PropTypes from 'prop-types';
import LinksField from './LinksField';
import LinkLocaleField from './LinkLocaleField';

const propTypes = {
    locales: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
    locales: null,
};

const LinksLocaleField = ({ locales, ...props }) => (
    <LinksField
        renderItemField={(it, index, fieldProps) => (
            <LinkLocaleField locales={locales} {...fieldProps} />
        )}
        {...props}
    />
);

LinksLocaleField.propTypes = propTypes;
LinksLocaleField.defaultProps = defaultProps;

export default LinksLocaleField;
