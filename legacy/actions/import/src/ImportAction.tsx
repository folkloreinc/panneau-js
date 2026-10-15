import { getCSRFHeaders, postJSON } from '@folklore/fetch';
import { type ReactNode, useCallback, useState } from 'react';

import type { ButtonTheme } from '@panneau/core';
import { useFieldsComponentsManager } from '@panneau/core/contexts';

// TODO: figure out what happens when an item / multiple items are selected

interface TemplateColumn {
    name?: string;
}

interface Template {
    columns?: TemplateColumn[];
}

interface ImportActionProps {
    id?: string;
    title?: ReactNode | null;
    endpoint?: string;
    action?: ((data: unknown) => Promise<unknown>) | null;
    label?: string | null;
    template?: Template | null;
    icon?: string;
    theme?: ButtonTheme;
    disabled?: boolean;
    outline?: boolean;
    fieldComponent?: string;
    onConfirmed?: ((response: unknown) => void) | null;
    className?: string | null;
}

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
}: ImportActionProps) {
    const FieldComponents = useFieldsComponentsManager();
    const FieldComponent = FieldComponents.getComponent(fieldComponent);

    const [error, setError] = useState<string | null>(null);

    const onComplete = useCallback(
        (data: unknown) =>
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
                .catch((err: { message?: string }) => {
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

export default ImportAction;
