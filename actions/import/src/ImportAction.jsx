/* eslint-disable react/jsx-props-no-spreading */
import { getCSRFHeaders, postJSON } from '@folklore/fetch';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';

import { useFieldsComponentsManager } from '@panneau/core/contexts';

// TODO: figure out what happens when an item / multiple items are selected

const propTypes = {
    // eslint-disable-next-line react/no-unused-prop-types
    id: PropTypes.string,
    title: PropTypes.node,
    endpoint: PropTypes.string,
    action: PropTypes.func, // Promise
    label: PropTypes.string,
    template: PropTypes.shape({
        columns: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string })),
    }),
    icon: PropTypes.string,
    theme: PropTypes.string,
    disabled: PropTypes.bool,
    outline: PropTypes.bool,
    fieldComponent: PropTypes.string,
    onConfirmed: PropTypes.func,
    className: PropTypes.string,
};

function ImportAction({
    title = null,
    endpoint = '/import',
    action = null,
    label = null,
    icon = 'database',
    template = null,
    theme = 'primary',
    disabled = false,
    outline = false,
    onConfirmed = null,
    fieldComponent = 'import',
    className = null,
    ...props
}) {
    const FieldComponents = useFieldsComponentsManager();
    const FieldComponent = FieldComponents.getComponent(fieldComponent);

    const [error, setError] = useState(null);

    const onComplete = useCallback(
        (data) =>
            (action !== null
                ? action(data)
                : postJSON(endpoint, data, {
                      credentials: 'include',
                      headers: getCSRFHeaders(),
                  })
            )
                .then((response) => {
                    if (onConfirmed !== null) {
                        onConfirmed(response);
                    }
                    setError(null);
                })
                .catch((err) => {
                    const { message = null } = err || {};
                    setError(message);
                }),
        [endpoint, action, setError, onConfirmed],
    );

    return (
        <>
            <FieldComponent
                isModal
                title={title}
                theme={theme}
                template={template}
                icon={icon}
                label={label}
                onChange={onComplete}
                disabled={disabled}
                outline={outline}
                className={className}
                {...props}
            />
            {error !== null ? <p className="text-danger">{error}</p> : null}
        </>
    );
}

ImportAction.propTypes = propTypes;

export default ImportAction;
