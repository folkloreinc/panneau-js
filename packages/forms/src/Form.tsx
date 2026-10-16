import { type FormOptions, resolveFields, useForm, usePanneau } from '@panneau/core';
import type { Field, LayoutNode } from '@panneau/protocol';

import { FormView, type FormViewProps } from './FormView';
import { useFormatRuleFailure } from './formatError';

export interface FormProps
    extends
        Omit<FormViewProps, 'form' | 'fields' | 'layout'>,
        Pick<FormOptions, 'values' | 'version' | 'mode' | 'store' | 'formatError' | 'onSubmit'> {
    /** The fields of the form. Without a layout, they are rendered in order. */
    fields: readonly Field[];
    /** The layout tree. Fields that no node references are added at the end. */
    layout?: readonly LayoutNode[];
}

/**
 * A form from a list of fields and an `onSubmit`, with or without a definition. It creates its
 * state with `useForm()` of `@panneau/core`: values, validation with the portable rules, server
 * errors (`422`) and version conflicts (`412`) from what `onSubmit` throws. Rule messages are
 * translated with react-intl.
 *
 * Initial values and the version are read once: give the form a new `key` to start from another
 * item, or use `useForm()` and `FormView`.
 */
export function Form({
    fields,
    layout = [],
    values,
    version,
    mode,
    store,
    formatError,
    onSubmit,
    locales,
    ...props
}: FormProps) {
    const { definition } = usePanneau();
    const resolved = resolveFields(fields, layout, mode !== undefined ? { mode } : {});
    const formatRuleFailure = useFormatRuleFailure(resolved.fields);
    const formLocales = locales ?? definition?.locales ?? [];
    const { form } = useForm({
        fields: resolved.fields,
        locales: [...formLocales],
        formatError: formatError ?? formatRuleFailure,
        ...(values !== undefined ? { values } : {}),
        ...(version !== undefined ? { version } : {}),
        ...(mode !== undefined ? { mode } : {}),
        ...(store !== undefined ? { store } : {}),
        ...(onSubmit !== undefined ? { onSubmit } : {}),
    });
    return (
        <FormView
            {...props}
            form={form}
            fields={resolved.fields}
            layout={resolved.layout}
            locales={formLocales}
        />
    );
}
