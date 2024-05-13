/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';

import { useFieldsComponentsManager } from '@panneau/core/contexts';

// TODO: figure out what happens when an item / multiple items are selected

const propTypes = {
    // eslint-disable-next-line react/no-unused-prop-types
    id: PropTypes.string,
    endpoint: PropTypes.string,
    action: PropTypes.func, // Promise
    label: PropTypes.string,
    value: PropTypes.shape({}),
    icon: PropTypes.string,
    theme: PropTypes.string,
    disabled: PropTypes.bool,
    fieldComponent: PropTypes.string,
    onConfirmed: PropTypes.func,
    className: PropTypes.string,
};

const defaultProps = {
    id: null,
    endpoint: '/import',
    action: null,
    label: null,
    value: null,
    icon: 'upload',
    theme: 'primary',
    disabled: false,
    fieldComponent: 'upload',
    onConfirmed: null,
    className: null,
};

const ImportAction = ({
    endpoint,
    action,
    label,
    value,
    icon,
    theme,
    disabled,
    onConfirmed,
    fieldComponent,
    className,
    ...props
}) => {
    const FieldComponents = useFieldsComponentsManager();
    const FieldComponent = FieldComponents.getComponent(fieldComponent);

    const onComplete = useCallback(
        (data) => {
            if (onConfirmed !== null) {
                onConfirmed(data);
            }
        },
        [onConfirmed],
    );

    return (
        <FieldComponent
            withButton
            outline={false}
            theme={theme}
            addButtonIcon={icon}
            addButtonLabel={
                label || <FormattedMessage defaultMessage="Add file" description="Button label" />
            }
            onChange={onComplete}
            disabled={disabled}
            className={className}
            {...props}
        />
    );
};

ImportAction.propTypes = propTypes;
ImportAction.defaultProps = defaultProps;

export default ImportAction;
