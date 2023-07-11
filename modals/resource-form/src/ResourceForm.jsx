import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import ResourceForm from '@panneau/form-resource';
// import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useResourceValues } from '@panneau/intl';
import Dialog from '@panneau/modal-dialog';

const propTypes = {
    resource: PropTypes.string,
    type: PropTypes.string,
    item: PropTypes.shape({ id: PropTypes.string }),
    isCreate: PropTypes.bool,
    onSuccess: PropTypes.func,
    onClose: PropTypes.func,
    className: PropTypes.string,
};

const defaultProps = {
    resource: null,
    type: null,
    item: null,
    isCreate: null,
    onSuccess: null,
    onClose: null,
    className: null,
};

const ModalResourceForm = ({ resource, type, item, isCreate, onSuccess, onClose, className }) => {
    const resourceValues = useResourceValues(resource);

    return (
        <Dialog
            title={
                !isCreate !== null ? (
                    <FormattedMessage
                        values={resourceValues}
                        defaultMessage="Edit {a_singular}"
                        description="Page title"
                    />
                ) : (
                    <FormattedMessage
                        values={resourceValues}
                        defaultMessage="Create {a_singular}"
                        description="Page title"
                    />
                )
            }
            size="lg"
            onClose={onClose}
            className={className}
        >
            <ResourceForm resource={resource} type={type} item={item} onSuccess={onSuccess} />
        </Dialog>
    );
};

ModalResourceForm.propTypes = propTypes;
ModalResourceForm.defaultProps = defaultProps;

export default ModalResourceForm;
