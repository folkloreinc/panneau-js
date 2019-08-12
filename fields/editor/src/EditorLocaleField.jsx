import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import LocaleField from '@panneau/field-locale';

import EditorField from './EditorField';

const propTypes = {};

const defaultProps = {};

const EditorLocaleField = props => (
    <LocaleField {...props} FieldComponent={EditorField} />
);

EditorLocaleField.propTypes = propTypes;
EditorLocaleField.defaultProps = defaultProps;

export default EditorLocaleField;
