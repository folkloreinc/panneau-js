/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
// import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useDefinition } from '@panneau/core/contexts';
import ItemsField from '@panneau/field-items';

const messages = defineMessages({
    typeLabel: {
        id: 'fields.blocks.add_button_type_label',
        description: 'The block type label on the add button',
        defaultMessage: 'a block',
    },
    title: {
        id: 'fields.blocks.item_title',
        description: 'The title of each block item',
        defaultMessage: 'Block #{index}',
    },
});

const propTypes = {
    addButtonTypeLabel: PanneauPropTypes.message,
    itemTitle: PanneauPropTypes.message,
};

const defaultProps = {
    addButtonTypeLabel: messages.typeLabel,
    itemTitle: messages.title,
};

const BlocksField = props => {
    const definition = useDefinition();
    return <ItemsField types={definition.blocks()} {...props} />;
};

BlocksField.propTypes = propTypes;
BlocksField.defaultProps = defaultProps;

export default BlocksField;
