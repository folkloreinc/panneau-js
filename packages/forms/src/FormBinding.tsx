import type { FieldBindingProps } from '@panneau/fields';
import { getValue } from '@panneau/protocol';
import { Alert, Button, usePanneauIntl } from '@panneau/ui';

import { FieldErrorBoundary } from './FieldErrorBoundary';
import styles from './Form.module.css';
import { selectErrors, selectVisible, useFormContext, useFormState } from './context';
import { messages } from './messages';

/** Fields that show the errors of their nested fields themselves. */
function rendersNestedFields(field: FieldBindingProps['field']): boolean {
    return field.localized === true || field.type === 'group' || field.type === 'repeater';
}

/**
 * Binds a field to the form by path: value, change, blur and errors. It hides fields whose
 * `visibleWhen` is false, marks the field's element with its path for the error summary, and
 * keeps a field that throws from breaking the form.
 */
export function FormBinding({ field, path, parentPath, render }: FieldBindingProps) {
    const form = useFormContext();
    const intl = usePanneauIntl();
    const state = useFormState(form);
    if (!selectVisible(state, field, parentPath)) {
        return null;
    }
    const errors = selectErrors(state, path, !rendersNestedFields(field));
    return (
        <div className={styles.field} data-panneau-path={path}>
            <FieldErrorBoundary
                fallback={(retry) => (
                    <Alert
                        tone="danger"
                        actions={
                            <Button size="sm" onPress={retry}>
                                {intl.formatMessage(messages.retry)}
                            </Button>
                        }
                    >
                        {intl.formatMessage(messages.fieldCrashed, {
                            field: field.label ?? field.name,
                        })}
                    </Alert>
                )}
            >
                {render({
                    value: getValue(state.values, path),
                    onChange: (value) => form.setValue(path, value),
                    onBlur: () => form.blur(path),
                    errors,
                })}
            </FieldErrorBoundary>
        </div>
    );
}
