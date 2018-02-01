import React from 'react';
import { defineMessages } from 'react-intl';

import ResourceForm from './ResourceForm';

const messages = defineMessages({
    save: {
        id: 'packages.core.components.pages.edit.buttons.submit',
        description: 'The label of the "save" form button',
        defaultMessage: 'Save',
    },
});

const propTypes = {

};

const defaultProps = {

};

const ResourceEdit = props => (
    <ResourceForm
        action="edit"
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
