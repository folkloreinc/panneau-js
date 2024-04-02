/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { useFieldComponent } from '@panneau/core/contexts';
import { useForm } from '@panneau/core/hooks';
import Button from '@panneau/element-button';
import Form from '@panneau/element-form';

import { useMediaUpdate } from './hooks';
import useMediaDestroy from './hooks/useMediaDestroy';

import MediaFrame from './MediaFrame';
import MediaMetadata from './MediaMetadata';
import defaultFields from './fields';

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
    displays: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string,
        }),
    ),
    onChange: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onDelete: PropTypes.func,
    onClose: PropTypes.func,
    className: PropTypes.string,
};

const defaultProps = {
    value: null,
    fields: defaultFields,
    displays: null,
    onClose: null,
    onDelete: null,
    className: null,
};

function MediaForm({
    value: initialValue,
    fields: initialFields,
    displays,
    onChange,
    onConfirm,
    onDelete,
    onClose,
    className,
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
            if (onConfirm !== null) {
                onConfirm(newValue);
            }
            setChanged(false);
        },
        [onChange, setChanged],
    );

    const onDeleteMedia = useCallback(() => {
        // Destroy
        if (onClose !== null) {
            onClose();
        }
        setChanged(false);
    }, [destroy, setChanged]);

    const postForm = useCallback(
        (action, data) => (initialValue !== null ? update(initialValue.id, data) : new Promise()),
        [initialValue, update],
    );

    const { value, setValue, fields, onSubmit, status, generalError, errors } = useForm({
        fields: initialFields,
        postForm,
        onComplete: onMediaSaved,
        value: initialValue,
        setValue: onChange,
    });

    return (
        <div className={classNames([className, { [className]: className != null }])}>
            <div className="d-flex w-100 justify-content-between mb-2 pb-2 border-bottom">
                <div>
                    <h4 className="d-inline">{name}</h4>
                    <span className="mx-2">{type}</span>
                </div>
                <div>
                    <Button className="me-2" theme="danger" onClick={onDeleteMedia}>
                        <FormattedMessage defaultMessage="Delete" description="Button label" />
                    </Button>
                    {onConfirm !== null ? (
                        <Button theme="primary" onClick={onConfirm}>
                            <FormattedMessage defaultMessage="Save" description="Button label" />
                        </Button>
                    ) : null}
                </div>
            </div>
            <div className="row">
                <div className="col-md-6">
                    <div className="position-relative w-100" style={{ height: 400 }}>
                        <div className={styles.mediaFrame}>
                            <MediaFrame value={value} />
                        </div>
                    </div>
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
                    <MediaMetadata className="mt-5" value={value} displays={displays} />
                </div>
            </div>
        </div>
    );
}

MediaForm.propTypes = propTypes;
MediaForm.defaultProps = defaultProps;

export default MediaForm;
