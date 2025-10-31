/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useFieldComponent, usePreviewComponent } from '@panneau/core/contexts';
import Form from '@panneau/element-form';

const propTypes = {
    fields: PropTypes.objectOf(PropTypes.shape({})).isRequired,
    resource: PropTypes.shape({
        id: PropTypes.string,
    }),
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    status: PanneauPropTypes.formStatus,
    generalError: PropTypes.string,
    errors: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),
    buttons: PropTypes.arrayOf(
        PropTypes.shape({
            type: PropTypes.oneOf(['submit', 'button', 'link', 'reset']),
            id: PropTypes.string,
            label: PropTypes.string,
            position: PropTypes.string,
            onClick: PropTypes.func,
        }),
    ),
    children: PropTypes.node,
    className: PropTypes.string,
};

const defaultProps = {
    resource: null,
    status: null,
    value: null,
    generalError: null,
    errors: null,
    buttons: null,
    children: null,
    className: null,
};

const TwoPaneForm = ({
    resource,
    fields,
    status,
    value,
    onChange,
    onSubmit,
    buttons,
    children,
    className,
    ...props
}) => {
    const { id = null } = resource || {};
    const FieldsComponent = useFieldComponent('fields');
    const PreviewComponent = usePreviewComponent(id);
    return (
        <div className="container-fluid row gx-4">
            <Form
                className={classNames([
                    'form',
                    'col-12',
                    'col-lg-6',
                    {
                        [className]: className !== null,
                    },
                ])}
                resource={resource}
                status={status}
                buttons={buttons}
                onSubmit={onSubmit}
                {...props}
            >
                <FieldsComponent fields={fields} value={value} onChange={onChange} />
            </Form>
            <div className="col-12 col-lg-6">
                {PreviewComponent !== null ? (
                    <PreviewComponent resource={resource} value={value} />
                ) : (
                    children
                )}
            </div>
        </div>
    );
};

TwoPaneForm.propTypes = propTypes;
TwoPaneForm.defaultProps = defaultProps;

export default TwoPaneForm;
