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

import { useMediaUpdate } from './hooks';
import useMediaDestroy from './hooks/useMediaDestroy';

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
    onDelete: PropTypes.func,
    onClose: PropTypes.func,
    className: PropTypes.string,
    children: PropTypes.node,
};

const defaultProps = {
    value: null,
    fields: defaultFields,
    onChange: null,
    onSave: null,
    onDelete: null,
    onClose: null,
    className: null,
    children: null,
};

function MediaForm({
    value: initialValue,
    fields: initialFields,
    onChange,
    onSave,
    onDelete,
    onClose,
    className,
    children,
}) {
    const FieldsComponent = useFieldComponent('fields');

    const { update, loading: updating } = useMediaUpdate();
    const { destroy, loading: destroying } = useMediaDestroy();

    const [changed, setChanged] = useState(false);
    const disabled = updating || destroying || initialValue === null;

    const { name = null, type = null } = initialValue || {};

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
        // Destroy
        const { id = null } = initialValue || {};
        destroy(id, initialValue).then(() => {
            if (onDelete !== null) {
                onDelete();
            }
            setChanged(false);
            if (onClose !== null) {
                onClose();
            }
        });
    }, [initialValue, destroy, destroying, setChanged]);

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
                <div className="d-flex align-items-end justify-content-end mb-1">
                    <h4 className="d-inline text-break mb-0">{name}</h4>
                    <span className="mx-2">{type}</span>
                </div>
                <div>
                    <Button
                        className="me-2 mb-1 mt-1"
                        theme="danger"
                        onClick={onDeleteMedia}
                        disabled={destroying}
                    >
                        <FormattedMessage defaultMessage="Delete" description="Button label" />
                    </Button>
                    {onSave !== null ? (
                        <Button
                            className="mb-1 mt-1"
                            theme="primary"
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
