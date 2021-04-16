/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useForm } from '@panneau/core/hooks';
import { useResourceDestroy } from '@panneau/data';

import Form from '@panneau/element-form';
import Button from '@panneau/element-button';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
    item: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    actionRoute: PropTypes.string,
    cancelRoute: PropTypes.string,
    onSuccess: PropTypes.func,
};

const defaultProps = {
    actionRoute: null,
    cancelRoute: null,
    onSuccess: null,
};

const DeleteForm = ({ resource, actionRoute, cancelRoute, onSuccess, item, ...props }) => {
    const { destroy } = useResourceDestroy(resource, item.id);
    const postForm = useCallback(() => destroy(), [destroy]);
    const { onSubmit } = useForm({
        postForm,
        onComplete: onSuccess,
    });

    return (
        <Form action={actionRoute} onSubmit={onSubmit} withoutActions {...props}>
            <div className="card">
                <div className="card-body">
                    <FormattedMessage
                        id="form.confirm_delete"
                        defaultMessage="Are you sure you want to delete the item #{id}?"
                        values={{ ...item }}
                    />
                </div>
                <div className="card-body d-flex">
                    <Button href={cancelRoute} className="me-2" theme="secondary" outline>
                        <FormattedMessage id="form.cancel_button" defaultMessage="Cancel" />
                    </Button>
                    <Button type="submit" className="ms-auto" theme="danger">
                        <FormattedMessage id="form.delete_button" defaultMessage="Delete" />
                    </Button>
                </div>
            </div>
        </Form>
    );
};

DeleteForm.propTypes = propTypes;
DeleteForm.defaultProps = defaultProps;

export default DeleteForm;
