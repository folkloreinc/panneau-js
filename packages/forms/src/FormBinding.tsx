import {
    type FormState,
    selectErrors,
    selectValue,
    selectVisible,
    useFormSelector,
} from '@panneau/core';
import type { FieldBindingProps } from '@panneau/fields';
import { getNestedShape } from '@panneau/protocol/runtime';
import { Alert, Button, usePanneauIntl } from '@panneau/ui';

import { FieldErrorBoundary } from './FieldErrorBoundary';
import styles from './Form.module.css';
import { useFormContext } from './context';
import { messages } from './messages';

/**
 * Fields that show the errors of their nested fields themselves: an address and a link show the
 * errors of each part under its input. Groups, repeaters and compound fields (decision 0065) bind
 * their fields to their own paths.
 */
const NESTED_TYPES = new Set(['address', 'link']);

function rendersNestedFields(field: FieldBindingProps['field']): boolean {
    return (
        field.localized === true || NESTED_TYPES.has(field.type) || getNestedShape(field) !== null
    );
}

const EMPTY: readonly string[] = Object.freeze([]);

/** Paths inside each path that have errors, for each `errors` object of a state. */
const invalidPathsCache = new WeakMap<FormState['errors'], Map<string, readonly string[]>>();

/**
 * The paths inside a path that have errors (`title.fr` for `title`): the same array for the same
 * errors, so that a field doesn't render again when other errors change.
 */
function selectInvalidPaths(state: FormState, path: string): readonly string[] {
    let cache = invalidPathsCache.get(state.errors);
    if (cache === undefined) {
        cache = new Map();
        invalidPathsCache.set(state.errors, cache);
    }
    let paths = cache.get(path);
    if (paths === undefined) {
        const found = Object.keys(state.errors).filter((key) => key.startsWith(`${path}.`));
        paths = found.length > 0 ? found : EMPTY;
        cache.set(path, paths);
    }
    return paths;
}

/**
 * Binds a field to the form by path: value, change, blur and errors. It hides fields whose
 * `visibleWhen` is false, marks the field's element with its path for the error summary, and
 * keeps a field that throws from breaking the form. It subscribes to the slices of its path only
 * (visibility, value, errors), so a change elsewhere in the form doesn't render it again.
 */
export function FormBinding({ field, path, parentPath, render }: FieldBindingProps) {
    const form = useFormContext();
    const intl = usePanneauIntl();
    const nested = rendersNestedFields(field);
    const visible = useFormSelector(form, (state) => selectVisible(state, field, parentPath));
    const value = useFormSelector(form, (state) => selectValue(state, path));
    const errors = useFormSelector(form, (state) => selectErrors(state, path, { nested: !nested }));
    const invalidPaths = useFormSelector(form, (state) =>
        nested ? selectInvalidPaths(state, path) : EMPTY,
    );
    if (!visible) {
        return null;
    }
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
                    value,
                    onChange: (value) => form.setValue(path, value),
                    onBlur: () => form.blur(path),
                    errors,
                    ...(invalidPaths.length > 0 ? { invalidPaths } : {}),
                })}
            </FieldErrorBoundary>
        </div>
    );
}
