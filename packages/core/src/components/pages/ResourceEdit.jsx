import React from 'react';
import { defineMessages } from 'react-intl';

import ResourceForm from './ResourceForm';

const messages = defineMessages({
    save: {
        id: 'core.buttons.resources.edit',
        description: 'The label of the "save" form button',
        defaultMessage: 'Save',
    },
    title: {
        id: 'core.titles.resources.edit',
        description: 'The title of the resource edit form',
        defaultMessage: 'Edit {name}',
    },
});

const propTypes = {

};

const defaultProps = {

};

const ResourceEdit = props => (
    <ResourceForm
        action="edit"
        title={messages.title}
        buttons={[
            {
                id: 'submit',
                type: 'submit',
                label: messages.save,
                className: 'btn-primary',
            },
        ]}
        {...props}
    />
);

ResourceEdit.propTypes = propTypes;
ResourceEdit.defaultProps = defaultProps;

export default ResourceEdit;
