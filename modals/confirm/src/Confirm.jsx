import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Dialog from '@panneau/modal-dialog';

const propTypes = {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.node,
    onConfirm: PropTypes.func,
    onClose: PropTypes.func,
    confirmButton: PropTypes.shape({
        label: PropTypes.string,
    }),
    cancelButton: PropTypes.shape({
        label: PropTypes.string,
    }),
    className: PropTypes.string,
    children: PropTypes.node,
};

const defaultProps = {
    title: null,
    onConfirm: null,
    onClose: null,
    confirmButton: null,
    cancelButton: null,
    className: null,
    children: null,
};

function ConfirmModal({
    id,
    title,
    onConfirm,
    onClose,
    confirmButton,
    cancelButton,
    className,
    children,
}) {
    return (
        <Dialog
            id={id}
            title={title}
            size="lg"
            onClose={onClose}
            className={className}
            buttons={[
                {
                    id: 'no',
                    name: 'no',
                    label: <FormattedMessage defaultMessage="No" description="Button label" />,
                    theme: 'secondary',
                    onClick: onClose,
                    ...cancelButton,
                },
                {
                    id: 'yes',
                    name: 'yes',
                    label: <FormattedMessage defaultMessage="Yes" description="Button label" />,
                    theme: 'primary',
                    onClick: onConfirm,
                    ...confirmButton,
                },
            ]}
        >
            {children}
        </Dialog>
    );
}

ConfirmModal.propTypes = propTypes;
ConfirmModal.defaultProps = defaultProps;

export default ConfirmModal;
