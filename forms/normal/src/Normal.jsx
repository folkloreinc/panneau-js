/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import Form from '@panneau/element-form';
import { useFieldComponent } from '@panneau/core/contexts';

import styles from './styles.module.scss';

const propTypes = {
    fields: PanneauPropTypes.fields.isRequired,
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func,
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
    status: null,
    value: null,
    onSubmit: null,
    generalError: null,
    errors: null,
    buttons: null,
    children: null,
    className: null,
};

const NormalForm = ({
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
    const FieldsComponent = useFieldComponent('fields');
    return (
        <Form
            className={classNames([
                styles.container,
                'form',
                {
                    [className]: className !== null,
                },
            ])}
            status={status}
            buttons={buttons}
            onSubmit={onSubmit}
            {...props}
        >
            {children !== null ? (
                children
            ) : (
                <FieldsComponent fields={fields} value={value} onChange={onChange} />
            )}
        </Form>
    );
};

NormalForm.propTypes = propTypes;
NormalForm.defaultProps = defaultProps;

export default NormalForm;
