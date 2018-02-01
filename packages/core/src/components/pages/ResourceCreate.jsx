import React from 'react';
import { defineMessages } from 'react-intl';

import ResourceForm from './ResourceForm';

const messages = defineMessages({
    create: {
        id: 'packages.core.components.pages.create.buttons.submit',
        description: 'The label of the "create" form button',
        defaultMessage: 'Create',
    },
});

const propTypes = {

};

const defaultProps = {

};

const ResourceCreate = props => (
    <ResourceForm
        action="create"
        buttons={[
            {
                id: 'submit',
                type: 'submit',
                label: messages.create,
                className: 'btn-primary',
            },
        ]}
        {...props}
    />
);

ResourceCreate.propTypes = propTypes;
ResourceCreate.defaultProps = defaultProps;

export default ResourceCreate;
