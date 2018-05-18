import React from 'react';
import PropTypes from 'prop-types';
import LocaleField from '@panneau/field-locale';

import LinkField from './LinkField';

const propTypes = {
    value: PropTypes.objectOf(LinkField.propTypes.value),
};

const defaultProps = {
    value: null,
};

const LinkLocaleField = props => (
    <LocaleField FieldComponent={LinkField} {...props} />
);

LinkLocaleField.propTypes = propTypes;
LinkLocaleField.defaultProps = defaultProps;

export default LinkLocaleField;
