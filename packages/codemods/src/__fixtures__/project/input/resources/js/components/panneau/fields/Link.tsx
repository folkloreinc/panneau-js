import { useFieldComponent } from '@panneau/core/contexts';
import FormGroup from '@panneau/element-form-group';
import { defineMessages, useIntl } from 'react-intl';

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
    const ToggleField = useFieldComponent('toggle');
    const UrlField = useFieldComponent('url');
    const TextField = useFieldComponent('text');
    const LocalizedField = useFieldComponent('localized');
    const { external = false, label = null, page = null, url = null } = value || {};

    const change = (key: keyof LinkValue, newValue: unknown) => {
        if (onChange !== null) {
            onChange({ ...value, [key]: newValue });
        }
    };

    return (
        <div>
            <LocalizedField
                label={messages.label}
                locales={locales}
                fieldComponent={TextField}
                value={label}
                onChange={(newValue: any) => change('label', newValue)}
            />
            <FormGroup label={intl.formatMessage(messages.external)} className="col-auto">
                <ToggleField value={external} onChange={(newValue: any) => change('external', newValue)} />
            </FormGroup>
            {external ? (
                <LocalizedField
                    label={intl.formatMessage(messages.url)}
                    locales={locales}
                    fieldComponent={UrlField}
                    value={url}
                    onChange={(newValue: any) => change('url', newValue)}
                />
            ) : (
                <FormGroup label={intl.formatMessage(messages.page)}>
                    <ItemsResource
                        resource="pages"
                        value={page}
                        onChange={(newValue: any) => change('page', newValue)}
                    />
                </FormGroup>
            )}
        </div>
    );
}
