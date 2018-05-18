import React from 'react';
import PropTypes from 'prop-types';
import LocaleField from '@panneau/field-locale';

import UrlField from './UrlField';

const propTypes = {
    value: PropTypes.objectOf(PropTypes.string),
    onChange: PropTypes.func,
};

const defaultProps = {
    value: null,
    onChange: null,
};

const UrlLocaleField = props => (
    <LocaleField
        FieldComponent={UrlField}
        {...props}
    />
);

UrlLocaleField.propTypes = propTypes;
UrlLocaleField.defaultProps = defaultProps;

export default UrlLocaleField;
