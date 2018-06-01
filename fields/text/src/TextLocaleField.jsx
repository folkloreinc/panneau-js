import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import LocaleField from '@panneau/field-locale';

import TextField from './TextField';

const propTypes = {
    placeholder: PropTypes.oneOfType([PropTypes.string, PropTypes.objectOf(PropTypes.string)]),
    prefix: PropTypes.oneOfType([PropTypes.node, PropTypes.objectOf(PropTypes.node)]),
    suffix: PropTypes.oneOfType([PropTypes.node, PropTypes.objectOf(PropTypes.node)]),
    prefixClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.objectOf(PropTypes.string)]),
    suffixClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.objectOf(PropTypes.string)]),
};

const defaultProps = {
    placeholder: null,
    prefix: null,
    suffix: null,
    prefixClassName: null,
    suffixClassName: null,
};

const getFieldProps = (
    locale,
    {
        placeholder, prefix, suffix, prefixClassName, suffixClassName,
    },
) => ({
    placeholder: get(placeholder, locale, placeholder),
    prefix: get(prefix, locale, prefix),
    suffix: get(suffix, locale, suffix),
    prefixClassName: get(prefixClassName, locale, prefixClassName),
    suffixClassName: get(suffixClassName, locale, suffixClassName),
});

const TextLocaleField = props => (
    <LocaleField {...props} FieldComponent={TextField} getFieldProps={getFieldProps} />
);

TextLocaleField.propTypes = propTypes;
TextLocaleField.defaultProps = defaultProps;

export default TextLocaleField;
