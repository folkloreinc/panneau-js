import { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';

import { useFieldsComponentsManager } from '@panneau/core/contexts';
import type { ButtonTheme } from '@panneau/core/types';

// TODO: figure out what happens when an item / multiple items are selected

interface UploadActionProps {
    id?: string;
    endpoint?: string;
    action?: ((data: unknown) => Promise<unknown>) | null;
    label?: string | null;
    value?: Record<string, unknown> | null;
    icon?: string;
    theme?: ButtonTheme;
    disabled?: boolean;
    fieldComponent?: string;
    onConfirmed?: ((data: unknown) => void) | null;
    className?: string | null;
}

function UploadAction({
    endpoint: _endpoint = '/import',
    action: _action = null,
    label = null,
    value: _value = null,
    icon = 'upload',
    theme = 'primary',
    disabled = false,
    onConfirmed = null,
    fieldComponent = 'upload',
    className = null,
    ...props
}: UploadActionProps) {
    const FieldComponents = useFieldsComponentsManager();
    const FieldComponent = FieldComponents.getComponent(fieldComponent);

    const onComplete = useCallback(
        (data: unknown) => {
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
}

export default UploadAction;
