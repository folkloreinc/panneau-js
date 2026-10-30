import { defineMessages, useIntl } from 'react-intl';

import { BooleanField as ToggleField } from '@panneau/fields/boolean';
import { UrlField } from '@panneau/fields/url';
import { TextField } from '@panneau/fields/text';
import { LocalizedField } from '@panneau/fields/localized';
import { Fieldset } from '@panneau/ui';
import { type FieldEntryProps, getFieldProps, useFieldsContext } from '@panneau/fields';

import ItemsResource from '../ItemsResource';

const messages = defineMessages({
    label: { id: 'fields.label', defaultMessage: 'Label' },
    external: { id: 'fields.external_link', defaultMessage: 'External link' },
    page: { id: 'fields.page', defaultMessage: 'Page' },
    url: { id: 'fields.url', defaultMessage: 'URL' },
});

interface LinkValue {
    label?: Record<string, string> | null;
    external?: boolean;
    page?: { id: string } | null;
    url?: Record<string, string> | null;
}

interface LinkFieldProps {
    locales?: string[];
    value?: LinkValue | null;
    onChange?: ((value: LinkValue) => void) | null;
}

export default function LinkField({ locales = ['fr', 'en'], value = null, onChange = null }: LinkFieldProps) {
    const intl = useIntl();
    const { external = false, label = null, page = null, url = null } = value || {};

    const change = (key: keyof LinkValue, newValue: unknown) => {
        if (onChange !== null) {
            onChange({ ...value, [key]: newValue });
        }
    };

    // TODO(panneau-5): `<LocalizedField label>` is a message descriptor: labels of Panneau 5 are nodes, format it (`intl.formatMessage()`)
    // TODO(panneau-5): Bootstrap class `col-auto` in `className`: Panneau 5 has no Bootstrap (`@panneau/ui` primitives, CSS Modules, or the Bootstrap-compatible theme)
    return (
        <div>
            <LocalizedField
                label={messages.label}
                locales={locales}
                value={label}
                onChange={(newValue: any) => change('label', newValue)}>{input => <TextField
                    label={input.label}
                    value={input.value as string | null}
                    onChange={input.onChange}
                    onBlur={input.onBlur}
                    disabled={input.disabled}
                    readOnly={input.readOnly}
                    required={input.required} />}</LocalizedField>
            <ToggleField
                label={intl.formatMessage(messages.external)}
                className="col-auto"
                value={external}
                onChange={(newValue: any) => change('external', newValue)}
                widget="switch" />
            {external ? (
                <LocalizedField
                    label={intl.formatMessage(messages.url)}
                    locales={locales}
                    value={url}
                    onChange={(newValue: any) => change('url', newValue)}>{input => <UrlField
                        label={input.label}
                        value={input.value as string | null}
                        onChange={input.onChange}
                        onBlur={input.onBlur}
                        disabled={input.disabled}
                        readOnly={input.readOnly}
                        required={input.required} />}</LocalizedField>
            ) : (
                <Fieldset legend={intl.formatMessage(messages.page)}>
                    <ItemsResource
                        resource="pages"
                        value={page}
                        onChange={(newValue: any) => change('page', newValue)}
                    />
                </Fieldset>
            )}
        </div>
    );
}

// TODO(panneau-5): `LinkField` renders every locale itself: its PHP field must not be `localized()`, which renders a field once per locale
/** The registry entry of `LinkField` for Panneau 5: its props from the field (written by @panneau/codemods). */
export function LinkFieldEntry(props: FieldEntryProps) {
    const { label, description, errors, required, className } = getFieldProps(props);
    const { locales } = useFieldsContext();
    return (
        <Fieldset
            legend={label}
            description={description}
            errors={errors}
            isRequired={required}
            className={className}
        >
            <LinkField
                locales={locales as LinkFieldProps['locales']}
                value={props.value as LinkFieldProps['value']}
                onChange={props.onChange}
            />
        </Fieldset>
    );
}
