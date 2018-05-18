import React from 'react';
// import PropTypes from 'prop-types';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import ItemsField from '@panneau/field-items';
import { defineMessages } from 'react-intl';
import LinkField from './LinkField';

const messages = defineMessages({
    typeLabel: {
        id: 'fields.links.add_button_type_label',
        description: 'The link type label on the add button',
        defaultMessage: 'a link',
    },
});

const propTypes = {
    addButtonTypeLabel: PanneauPropTypes.message,
};

const defaultProps = {
    addButtonTypeLabel: messages.typeLabel,
};

const LinksField = props => (
    <ItemsField FieldComponent={LinkField} withoutHeader {...props} />
);

LinksField.propTypes = propTypes;
LinksField.defaultProps = defaultProps;

export default LinksField;
