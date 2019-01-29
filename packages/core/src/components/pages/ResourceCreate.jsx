import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';

import ResourceForm from './ResourceForm';
import withUrlGenerator from '../../lib/withUrlGenerator';

const messages = defineMessages({
    create: {
        id: 'core.buttons.resources.create',
        description: 'The label of the "create" form button',
        defaultMessage: 'Create',
    },
    title: {
        id: 'core.titles.resources.create',
        description: 'The title of the resource create form',
        defaultMessage: 'Create {name}',
    },
    titleTyped: {
        id: 'core.titles.resources.create_typed',
        description: 'The title of the typed resource create form',
        defaultMessage: 'Create {name} <small class="text-muted">({type})</small>',
    },
});

const propTypes = {
    gotoResourceAction: PropTypes.func.isRequired,
};

const defaultProps = {

};

class ResourceCreate extends Component {
    constructor(props) {
        super(props);

        this.onFormComplete = this.onFormComplete.bind(this);
    }

    onFormComplete(it) {
        const { gotoResourceAction } = this.props;
        gotoResourceAction('edit', it.id);
    }

    render() {
        return (
            <ResourceForm
                title={messages.title}
                titleTyped={messages.titleTyped}
                saveButtonLabel={messages.create}
                onFormComplete={this.onFormComplete}
                {...this.props}
            />
        );
    }
}

ResourceCreate.propTypes = propTypes;
ResourceCreate.defaultProps = defaultProps;

const WithUrlGeneratorContainer = withUrlGenerator()(ResourceCreate);
export default WithUrlGeneratorContainer;
