import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Form from '@panneau/form';
import Dialog from '@panneau/modal-dialog';

const propTypes = {
    title: PropTypes.node,
    name: PropTypes.string,
    fields: PropTypes.arrayOf(PropTypes.shape({})),
    action: PropTypes.string,
    type: PropTypes.string,
    item: PropTypes.shape({ id: PropTypes.string }),
    onComplete: PropTypes.func,
    onClose: PropTypes.func,
    submitButtonLabel: PropTypes.node,
    className: PropTypes.string,
    children: PropTypes.node,
};

const defaultProps = {
    title: null,
    name: null,
    fields: null,
    action: null,
    type: 'normal',
    item: null,
    onComplete: null,
    onClose: null,
    submitButtonLabel: null,
    className: null,
    children: null,
};

function ModalForm({
    title,
    name,
    fields,
    action,
    type,
    item,
    onComplete,
    onClose,
    submitButtonLabel,
    className,
    children,
}) {
    return (
        <Dialog
            title={
                title ||
                (name !== null ? (
                    <FormattedMessage
                        defaultMessage="Edit {name}"
                        description="Page title"
                        values={{ name }}
                    />
                ) : (
                    <FormattedMessage defaultMessage="Edit" description="Page title" />
                ))
            }
            size="lg"
            onClose={onClose}
            className={className}
        >
            {children}
            <Form
                fields={fields}
                action={action}
                type={type}
                item={item}
                onComplete={onComplete}
                submitButtonLabel={submitButtonLabel}
            />
        </Dialog>
    );
}

ModalForm.propTypes = propTypes;
ModalForm.defaultProps = defaultProps;

export default ModalForm;
