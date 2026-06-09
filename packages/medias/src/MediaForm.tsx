import classNames from 'classnames';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import type { Field, Media } from '@panneau/core';
import { useFieldComponent } from '@panneau/core/contexts';
import { useForm } from '@panneau/core/hooks';
import Button from '@panneau/element-button';
import Form from '@panneau/element-form';
import FormStatus from '@panneau/element-form-status';
import UploadField from '@panneau/field-upload';

import { useMediaDestroy, useMediaReplace, useMediaUpdate } from './hooks';

import MediaFrame from './MediaFrame';
import defaultFields from './defaults/fields';

import styles from './styles.module.css';

type MediaFormPayload = Record<string, unknown>;

interface MediaFormProps {
    value?: Media | null;
    fields?: Field[] | null;
    onChange?: ((newValue: Media | null) => void) | null;
    onSave?: ((newValue: Media | null) => void) | null;
    onReplace?: ((newValue: unknown) => void) | null;
    onDelete?: (() => void) | null;
    onClose?: (() => void) | null;
    withDelete?: boolean;
    withTrash?: boolean;
    withReplace?: boolean;
    className?: string | null;
    children?: ReactNode | null;
}

function MediaForm({
    value: initialValue = null,
    fields: initialFields = defaultFields,
    onChange = null,
    onSave = null,
    onReplace = null,
    onDelete = null,
    onClose = null,
    withDelete = false,
    withTrash = false,
    withReplace = false,
    className = null,
    children = null,
}: MediaFormProps) {
    const FieldsComponent = useFieldComponent('fields');

    const { update, updating } = useMediaUpdate();
    const { mediaDestroy, destroying } = useMediaDestroy();
    const { mediaReplace, replacing } = useMediaReplace();

    const [changed, setChanged] = useState(false);
    const disabled = updating || destroying || initialValue === null;

    const { name = null, type = null, deletedAt = null } = initialValue || {};

    const onChangeMedia = (newValue: Media | null) => {
        if (onChange !== null) {
            onChange(newValue);
        }
        setChanged(true);
    };

    const onMediaSaved = (newValue: Media | null) => {
        if (onSave !== null) {
            onSave(newValue);
        }
        setChanged(false);
    };

    const onDeleteMedia = () => {
        const { id = null } = initialValue || {};
        // Destroy
        mediaDestroy(id, initialValue).then(() => {
            if (onDelete !== null) {
                onDelete();
            }
            setChanged(false);
            if (onClose !== null) {
                onClose();
            }
        });
    };

    const onUploadComplete = (data: unknown) => {
        const { id = null } = initialValue || {};
        mediaReplace(id, data).then(onReplace);
    };

    const postForm = (action: unknown, data: MediaFormPayload) =>
        initialValue !== null ? update(initialValue.id, data) : Promise.resolve(null);

    const { value, setValue, fields, onSubmit, status, generalError } = useForm({
        fields: initialFields,
        postForm,
        onComplete: onMediaSaved,
        value: initialValue,
        setValue: onChangeMedia,
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
                <div
                    className={classNames(
                        'd-flex',
                        'justify-content-between',
                        'align-items-center',
                        'gap-1',
                    )}
                >
                    {withReplace ? (
                        <UploadField
                            className="w-auto text-nowrap"
                            withButton
                            withoutMedia
                            types={[type]}
                            outline={false}
                            closeAfterFinish
                            disabled={destroying || updating || replacing}
                            addButtonLabel={
                                <FormattedMessage
                                    defaultMessage="Replace"
                                    description="Media form action"
                                />
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
                            disabled={destroying || updating || replacing}
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
                            disabled={!changed || updating || destroying}
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
                    <Form withoutActions>
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

export default MediaForm;
