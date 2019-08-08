import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';

import ResourceForm from './ResourceForm';

export const messages = defineMessages({
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

const defaultProps = {};

const ResourceCreate = ({ gotoResourceAction, ...props }) => {
    const onFormComplete = useCallback(it => gotoResourceAction('edit', it.id), [
        gotoResourceAction,
    ]);
    return (
        <ResourceForm
            title={messages.title}
            titleTyped={messages.titleTyped}
            saveButtonLabel={messages.create}
            onFormComplete={onFormComplete}
            gotoResourceAction={gotoResourceAction}
            {...props}
        />
    );
};

ResourceCreate.propTypes = propTypes;
ResourceCreate.defaultProps = defaultProps;

export default ResourceCreate;
