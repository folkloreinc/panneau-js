/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { useFieldComponent } from '@panneau/core/contexts';
import { useForm } from '@panneau/core/hooks';
import Button from '@panneau/element-button';
import Form from '@panneau/element-form';
import FormStatus from '@panneau/element-form-status';
import UploadField from '@panneau/field-upload';

import { useMediaDelete, useMediaReplace, useMediaTrash, useMediaUpdate } from './hooks';

import MediaFrame from './MediaFrame';
import defaultFields from './defaults/fields';

import styles from './styles.module.scss';

const propTypes = {
    value: PropTypes.shape({
        id: PropTypes.string,
    }),
    fields: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string,
        }),
    ),
    onChange: PropTypes.func,
    onSave: PropTypes.func,
    onReplace: PropTypes.func,
    onDelete: PropTypes.func,
    onClose: PropTypes.func,
    withDelete: PropTypes.bool,
    withTrash: PropTypes.bool,
    withReplace: PropTypes.bool,
    className: PropTypes.string,
    children: PropTypes.node,
};

const defaultProps = {
    value: null,
    fields: defaultFields,
    onChange: null,
    onSave: null,
    onReplace: null,
    onDelete: null,
    onClose: null,
    withDelete: false,
    withTrash: false,
    withReplace: false,
    className: null,
    children: null,
};

function MediaForm({
    value: initialValue,
    fields: initialFields,
    onChange,
    onSave,
    onReplace,
    onDelete,
    onClose,
    withDelete,
    withTrash,
    withReplace,
    className,
    children,
}) {
    const FieldsComponent = useFieldComponent('fields');

    const { update, updating } = useMediaUpdate();
    const { mediaTrash, trashing } = useMediaTrash();
    const { mediaDelete, deleting } = useMediaDelete();
    const { mediaReplace, replacing } = useMediaReplace();

    const [changed, setChanged] = useState(false);
    const disabled = updating || deleting || trashing || initialValue === null;

    const { name = null, type = null, deletedAt = null } = initialValue || {};

    const onChangeMedia = useCallback(
        (newValue) => {
            if (onChange !== null) {
                onChange(newValue);
            }
            setChanged(true);
        },
        [onChange, setChanged],
    );

    const onMediaSaved = useCallback(
        (newValue) => {
            if (onSave !== null) {
                onSave(newValue);
            }
            setChanged(false);
        },
        [onChange, setChanged],
    );

    const onDeleteMedia = useCallback(() => {
        const { id = null } = initialValue || {};
        if (withTrash && deletedAt !== null) {
            mediaTrash(id, initialValue).then(() => {
                if (onDelete !== null) {
                    onDelete();
                }
                setChanged(false);
                if (onClose !== null) {
                    onClose();
                }
            });
        } else {
            // Destroy
            mediaDelete(id, initialValue).then(() => {
                if (onDelete !== null) {
                    onDelete();
                }
                setChanged(false);
                if (onClose !== null) {
                    onClose();
                }
            });
        }
    }, [initialValue, mediaDelete, mediaTrash, deletedAt, setChanged, onDelete, withTrash]);

    const onUploadComplete = useCallback((data) => {
        const { id = null } = initialValue || {};
        mediaReplace(id, data).then(onReplace);
    }, [initialValue, onReplace]);

    const postForm = useCallback(
        (action, data) => (initialValue !== null ? update(initialValue.id, data) : new Promise()),
        [initialValue, update],
    );

    const { value, setValue, fields, onSubmit, status, generalError } = useForm({
        fields: initialFields,
        postForm,
        onComplete: onMediaSaved,
        value: initialValue,
        setValue: onChangeMedia,
        disabled: updating,
    });

    return (
        <div className={classNames(['text-body', { [className]: className !== null }])}>
            <nav className="navbar d-flex w-100 align-items-end justify-content-between border-bottom mb-3">
                <div
                    className="d-flex align-items-end justify-content-start mb-1"
                    style={{ maxWidth: '66%' }}
                >
                    <div className="me-3 mb-0">
                        <Button theme="secondary" outline onClick={onClose} icon="arrow-left">
                            <FormattedMessage defaultMessage="Back" description="Button label" />
                        </Button>
                    </div>
                    <h4 className="d-inline text-truncate mb-0">{name}</h4>
                    <span className="mx-2">{type}</span>
                </div>
                <div className={classNames('d-flex', 'justify-content-between', 'align-items-center', 'gap-1')}>
                    {withReplace ? (
                        <UploadField
                            className="w-auto text-nowrap"
                            withButton
                            withoutMedia
                            types={[type]}
                            outline={false}
                            closeAfterFinish
                            addButtonLabel={
                                <FormattedMessage defaultMessage="Replace" description="Media form action" />
                            }
                            onChange={onUploadComplete}
                        />
                    ) : null}
                    {withDelete ? (
                        <Button
                            className="me-2 mb-1 mt-1"
                            theme="danger"
                            icon={withTrash && deletedAt !== null ? 'trash-fill' : 'trash'}
                            iconPosition="right"
                            onClick={onDeleteMedia}
                            disabled={deleting || trashing || updating || replacing}
                        >
                            {withTrash && deletedAt === null ? (
                                <FormattedMessage
                                    defaultMessage="Trash"
                                    description="Button label"
                                />
                            ) : (
                                <FormattedMessage
                                    defaultMessage="Delete"
                                    description="Button label"
                                />
                            )}
                        </Button>
                    ) : null}
                    {onSave !== null ? (
                        <Button
                            className="mb-1 mt-1"
                            theme="primary"
                            icon={changed ? 'check' : 'check'}
                            iconPosition="right"
                            onClick={onSubmit}
                            disabled={!changed || updating || deleting || trashing}
                        >
                            <FormattedMessage defaultMessage="Save" description="Button label" />
                        </Button>
                    ) : null}
                </div>
            </nav>
            <div className="row">
                <div className="col-md-6">
                    <div className="position-relative w-100">
                        <div className={styles.mediaFrame}>
                            <MediaFrame value={value} />
                        </div>
                    </div>
                    {children}
                </div>
                <div className="col-md-6">
                    <Form onChange={onChangeMedia} withoutActions>
                        <FieldsComponent
                            fields={fields}
                            value={value}
                            onChange={setValue}
                            disabled={disabled}
                        />
                    </Form>
                    {generalError !== null && status !== null ? (
                        <div className="mt-5">
                            <FormStatus status={status} />
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

MediaForm.propTypes = propTypes;
MediaForm.defaultProps = defaultProps;

export default MediaForm;
