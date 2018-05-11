import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import get from 'lodash/get';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import ItemsField from '@panneau/field-items';
import { defineMessages } from 'react-intl';

const messages = defineMessages({
    typeLabel: {
        id: 'fields.blocks.add_button_type_label',
        description: 'The block type label on the add button',
        defaultMessage: 'a block',
    },
});

const propTypes = {
    addButtonTypeLabel: PanneauPropTypes.message,
};

const defaultProps = {
    addButtonTypeLabel: messages.typeLabel,
};

const contextTypes = {
    definition: PanneauPropTypes.definition,
};

class BlocksField extends Component {
    getTypes() {
        const { definition } = this.context || {};
        return get(definition || null, 'blocks', null);
    }
    render() {
        return <ItemsField {...this.props} types={this.getTypes()} />;
    }
}

BlocksField.propTypes = propTypes;
BlocksField.defaultProps = defaultProps;
BlocksField.contextTypes = contextTypes;

export default BlocksField;
