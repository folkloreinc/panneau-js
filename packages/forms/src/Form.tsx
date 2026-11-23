import { useLayoutEffect, useState } from 'react';

import { type FormOptions, createForm, resolveFields, usePanneau } from '@panneau/core';
import type { Field, Item, LayoutNode } from '@panneau/protocol';

import { FormView, type FormViewProps } from './FormView';
import { useFormatRuleFailure } from './formatError';

// Not `[]` in the component: the React Compiler doesn't memoize what is computed from an array
// made before a hook, and the whole form would render again with the component
const NO_LAYOUT: readonly LayoutNode[] = [];
const NO_LOCALES: readonly string[] = [];

export interface FormProps
    extends
        Omit<FormViewProps, 'form' | 'fields' | 'layout'>,
        Pick<FormOptions, 'values' | 'version' | 'mode' | 'store' | 'formatError' | 'onSubmit'> {
    /** The fields of the form. Without a layout, they are rendered in order. */
    fields: readonly Field[];
    /** The layout tree. Fields that no node references are added at the end. */
    layout?: readonly LayoutNode[];
    /**
     * The item the form edits, as the backend has it now: give the latest one after every fetch.
     * When its version changes, a form without unsaved changes takes its values, and a form with
     * unsaved changes keeps them and says that a newer version exists (`form.refresh()`).
     */
    item?: Item | null | undefined;
}

/**
 * A form from a list of fields and an `onSubmit`, with or without a definition. It creates its
 * state with `createForm()` of `@panneau/core`: values, validation with the portable rules, server
 * errors (`422`) and version conflicts (`412`) from what `onSubmit` throws. Rule messages are
 * translated with react-intl.
 *
 * Initial values and the version are read once: give the form a new `key` to start from another
 * item, or use `useForm()` and `FormView`. Newer versions of the same item go through `item`, which
 * keeps the form and what is typed in it. While the item loads, `isLoading` draws a skeleton of the
 * form, and a new `key` once it is there starts the form from its values.
 */
export function Form({
    fields,
    layout = NO_LAYOUT,
    values,
    version,
    mode,
    store,
    formatError,
    onSubmit,
    locales,
    item,
    ...props
}: FormProps) {
    const { definition } = usePanneau();
    // The mode `useForm()` would infer: rules limited to a mode are resolved in it
    const formMode = mode ?? (version !== undefined && version !== null ? 'update' : 'create');
    const resolved = resolveFields(fields, layout, { mode: formMode });
    const formatRuleFailure = useFormatRuleFailure(resolved.fields);
    const formLocales = locales ?? definition?.locales ?? NO_LOCALES;
    const options: FormOptions = {
        fields: resolved.fields,
        locales: [...formLocales],
        formatError: formatError ?? formatRuleFailure,
        ...(values !== undefined ? { values } : {}),
        ...(version !== undefined ? { version } : {}),
        mode: formMode,
        ...(store !== undefined ? { store } : {}),
        ...(onSubmit !== undefined ? { onSubmit } : {}),
    };
    // As `useForm()` does, without subscribing to the state: the parts of the form subscribe to
    // the slices they show, so that a change doesn't render the whole form again
    const [form] = useState(() => createForm(options));
    useLayoutEffect(() => {
        form.setOptions({
            fields: options.fields,
            locales: options.locales,
            formatError: options.formatError,
            onSubmit: options.onSubmit,
        });
    });
    // A newer version of the item, from a refetch or another save
    useLayoutEffect(() => {
        if (item !== undefined && item !== null) {
            form.refresh(item);
        }
    }, [form, item]);
    return (
        <FormView
            {...props}
            form={form}
            fields={resolved.fields}
            // The layout as given: fields it doesn't place flow in columns at the end
            layout={layout}
            locales={formLocales}
        />
    );
}
