import { File as FileIcon, FileText, Globe, Hash, Mail, Phone } from 'lucide-react';
import { type ReactNode, useState } from 'react';

import type { Field, LinkValue } from '@panneau/protocol';
import {
    type LinkNewTab,
    type LinkType,
    getLinkNewTab,
    getLinkTypes,
} from '@panneau/protocol/runtime';
import {
    Checkbox,
    ComboBox,
    Fieldset,
    type IconComponent,
    SegmentedControl,
    TextInput,
    usePanneauIntl,
} from '@panneau/ui';

import { EmailField } from '../email/EmailField';
import { LocalizedField, type LocalizedValue } from '../localized/LocalizedField';
import { DefinitionField } from '../shared/DefinitionField';
import { useFieldsContext } from '../shared/context';
import { getFieldProps, getSetting, isString } from '../shared/entry';
import { messages } from '../shared/messages';
import { BoundPart, type BoundPartProps } from '../shared/part';
import type { FieldEntryProps, FieldProps } from '../shared/types';
import { TelField } from '../tel/TelField';
import { TextField } from '../text/TextField';
import { UrlField } from '../url/UrlField';
import styles from './LinkField.module.css';
import { type LinkPage, cleanLink, getLinkPage, isLink } from './link';
import { usePageSearch } from './pages';

/** Whether links have a label: optional, required, or none. */
export type LinkLabelMode = 'optional' | 'required' | 'none';

export interface LinkFieldProps extends FieldProps<LinkValue> {
    /** Dot path of the value, the prefix of the paths of its parts. Defaults to `name`. */
    path?: string;
    /** The types offered, in order. Defaults to `url`, `email` and `tel`. */
    types?: readonly LinkType[];
    /** The resources of `page` links. */
    pages?: readonly string[];
    /** The media libraries of `file` links. Defaults to every library. */
    libraries?: readonly string[];
    /** Which links open in a new tab. Defaults to `choose`, a checkbox. */
    newTab?: LinkNewTab;
    /** Whether links have a label. Defaults to `optional`. */
    labelMode?: LinkLabelMode;
    /**
     * The label is a string, not a value per locale: in a `localized` link field, where the whole
     * link is per locale already.
     */
    singleLabel?: boolean;
}

const DEFAULT_TYPES: readonly LinkType[] = [{ id: 'url' }, { id: 'email' }, { id: 'tel' }];

const TYPE_ICONS: Readonly<Record<string, IconComponent>> = {
    url: Globe,
    page: FileText,
    email: Mail,
    tel: Phone,
    file: FileIcon,
};

/** The text of a URL after its scheme: `info@example.com` in `mailto:info@example.com`. */
function withoutScheme(url: string | undefined, scheme: string): string | null {
    if (url === undefined || url === '') {
        return null;
    }
    return url.toLowerCase().startsWith(scheme) ? url.slice(scheme.length) : url;
}

/**
 * A link (decision 0055): its type, in a segmented control, then the input of the type (a URL, a
 * page searched in the resources of `pages`, an email address, a phone number, a media, or the
 * text of a type of the site), its label per locale, and whether it opens in a new tab. Each part
 * shows the errors of its own path (`link.url`) in a form.
 */
export function LinkField({
    value,
    onChange,
    onBlur,
    path,
    name,
    types: typesProp,
    pages = [],
    libraries,
    newTab = 'choose',
    labelMode = 'optional',
    singleLabel = false,
    label,
    description,
    errors,
    disabled,
    readOnly,
    required,
    className,
}: LinkFieldProps) {
    const intl = usePanneauIntl();
    const { locales, relationSource } = useFieldsContext();
    const types = typesProp !== undefined && typesProp.length > 0 ? typesProp : DEFAULT_TYPES;
    const defaultType = types[0]?.id;
    const type = types.find((candidate) => candidate.id === value?.type) ?? types[0];
    const base = path ?? name ?? '';
    const partPath = (part: string) => (base !== '' ? `${base}.${part}` : part);
    const editable = disabled !== true && readOnly !== true;

    const change = (next: Partial<LinkValue>) => {
        const link = { ...value, type: value?.type ?? defaultType ?? 'url', ...next };
        onChange?.(cleanLink(link, { newTab, defaultType }));
    };
    const setUrl = (url: string | null) => change({ url: url ?? undefined });

    const typeName = (candidate: LinkType) => {
        switch (candidate.id) {
            case 'url':
                return intl.formatMessage(messages.linkTypeUrl);
            case 'page':
                return intl.formatMessage(messages.linkTypePage);
            case 'email':
                return intl.formatMessage(messages.linkTypeEmail);
            case 'tel':
                return intl.formatMessage(messages.linkTypeTel);
            case 'file':
                return intl.formatMessage(messages.linkTypeFile);
            default:
                return candidate.label ?? candidate.id;
        }
    };
    const shared = (bound: BoundPartProps) => ({
        errors: bound.errors ?? [],
        ...(bound.onBlur !== undefined ? { onBlur: bound.onBlur } : {}),
        ...(disabled !== undefined ? { disabled } : {}),
        ...(readOnly !== undefined ? { readOnly } : {}),
        required: required === true || (value ?? null) !== null,
    });
    const part = (
        partName: string,
        partType: string,
        render: (bound: BoundPartProps) => ReactNode,
    ) => (
        <BoundPart
            field={{ name: partName, type: partType }}
            path={partPath(partName)}
            {...(onBlur !== undefined ? { onBlur } : {})}
            render={render}
        />
    );

    let input: ReactNode = null;
    if (type !== undefined) {
        switch (type.id) {
            case 'url':
                input = part('url', 'url', (bound) => (
                    <UrlField
                        {...shared(bound)}
                        label={intl.formatMessage(messages.linkUrl)}
                        value={value?.url ?? null}
                        onChange={setUrl}
                    />
                ));
                break;
            case 'email':
                input = part('url', 'email', (bound) => (
                    <EmailField
                        {...shared(bound)}
                        label={intl.formatMessage(messages.linkEmail)}
                        value={withoutScheme(value?.url, 'mailto:')}
                        onChange={(email) => setUrl(email !== null ? `mailto:${email}` : null)}
                    />
                ));
                break;
            case 'tel':
                input = part('url', 'tel', (bound) => (
                    <TelField
                        {...shared(bound)}
                        label={intl.formatMessage(messages.linkTel)}
                        value={withoutScheme(value?.url, 'tel:')}
                        onChange={(number) => setUrl(number !== null ? `tel:${number}` : null)}
                    />
                ));
                break;
            case 'page':
                input = part('page', 'relation', (bound) => (
                    <PagePicker
                        {...shared(bound)}
                        label={intl.formatMessage(messages.linkPage)}
                        resources={pages}
                        page={getLinkPage(value)}
                        editable={editable && relationSource !== null}
                        onChange={(page) =>
                            change({ page: page !== null ? { ...page } : undefined })
                        }
                    />
                ));
                break;
            case 'file': {
                const fileField: Field = {
                    name: 'file',
                    type: 'media',
                    label: intl.formatMessage(messages.linkFile),
                    ...(libraries !== undefined && libraries.length > 0
                        ? { resource: [...libraries] }
                        : {}),
                };
                // The media entry of the fields context, set as a part of the link
                input = part('file', 'media', (bound) => (
                    <DefinitionField
                        field={fileField}
                        path={partPath('file')}
                        value={value?.file ?? null}
                        onChange={(file) =>
                            change({ file: (file ?? undefined) as LinkValue['file'] })
                        }
                        errors={bound.errors ?? []}
                        {...(bound.onBlur !== undefined ? { onBlur: bound.onBlur } : {})}
                        {...(disabled !== undefined ? { disabled } : {})}
                        {...(readOnly !== undefined ? { readOnly } : {})}
                    />
                ));
                break;
            }
            default:
                input = part('url', 'text', (bound) => (
                    <TextField
                        {...shared(bound)}
                        label={typeName(type)}
                        autoComplete="off"
                        {...(type.placeholder !== undefined
                            ? { placeholder: type.placeholder }
                            : {})}
                        value={value?.url ?? null}
                        onChange={setUrl}
                    />
                ));
        }
    }

    const labelText = intl.formatMessage(messages.linkLabel);
    const labelRequired = labelMode === 'required';
    const labelInput =
        labelMode === 'none'
            ? null
            : part('label', 'text', (bound) =>
                  singleLabel || locales.length === 0 ? (
                      <TextField
                          {...shared(bound)}
                          label={labelText}
                          required={labelRequired}
                          value={typeof value?.label === 'string' ? value.label : null}
                          onChange={(text) => change({ label: text })}
                      />
                  ) : (
                      <LocalizedField<string>
                          label={labelText}
                          errors={bound.errors ?? []}
                          required={labelRequired}
                          locales={locales}
                          value={
                              value?.label !== null && typeof value?.label === 'object'
                                  ? (value.label as LocalizedValue<string>)
                                  : {}
                          }
                          onChange={(next) =>
                              change({ label: (next ?? null) as LinkValue['label'] })
                          }
                      >
                          {(localeInput) => (
                              <TextInput
                                  aria-label={`${labelText} (${localeInput.label})`}
                                  value={localeInput.value ?? ''}
                                  onChange={(text) =>
                                      localeInput.onChange(text === '' ? null : text)
                                  }
                                  {...(bound.onBlur !== undefined ? { onBlur: bound.onBlur } : {})}
                                  isDisabled={disabled === true}
                                  isReadOnly={readOnly === true}
                              />
                          )}
                      </LocalizedField>
                  ),
              );

    return (
        <Fieldset
            legend={label}
            description={description}
            errors={errors}
            isRequired={required}
            isDisabled={disabled}
            className={className}
        >
            <div className={styles.link}>
                {types.length > 1 ? (
                    <SegmentedControl
                        aria-label={intl.formatMessage(messages.linkType)}
                        size="sm"
                        isDisabled={!editable}
                        options={types.map((candidate) => ({
                            value: candidate.id,
                            label: typeName(candidate),
                            icon: TYPE_ICONS[candidate.id] ?? Hash,
                        }))}
                        {...(type !== undefined ? { value: type.id } : {})}
                        onChange={(next) => {
                            if (next !== type?.id) {
                                // A new type keeps the label only
                                onChange?.(
                                    cleanLink(
                                        {
                                            type: next,
                                            label: value?.label ?? null,
                                            newTab: value?.newTab ?? false,
                                        },
                                        { newTab, defaultType },
                                    ),
                                );
                            }
                        }}
                    />
                ) : null}
                {input}
                {labelInput}
                {newTab === 'choose' ? (
                    <Checkbox
                        isSelected={value?.newTab === true}
                        onChange={(selected) => change({ newTab: selected })}
                        isDisabled={!editable}
                    >
                        {intl.formatMessage(messages.linkNewTab)}
                    </Checkbox>
                ) : null}
            </div>
        </Fieldset>
    );
}

interface PagePickerProps {
    label: string;
    resources: readonly string[];
    page: LinkPage | null;
    onChange: (page: LinkPage | null) => void;
    editable: boolean;
    errors: readonly string[];
    onBlur?: () => void;
    required: boolean;
}

/** The page of a link: searched in every resource of `pages`, with the relation source. */
function PagePicker({
    label,
    resources,
    page,
    onChange,
    editable,
    errors,
    onBlur,
    required,
}: PagePickerProps) {
    const intl = usePanneauIntl();
    const { relationSource } = useFieldsContext();
    const [query, setQuery] = useState<string | null>(null);
    const { items, isLoading } = usePageSearch(relationSource, resources, query ?? '', {
        enabled: editable,
    });
    const keyOf = (item: { id: string; resource?: string }) =>
        `${item.resource ?? resources[0] ?? ''}\u0000${item.id}`;
    const current = page !== null ? { ...page, label: page.label ?? page.id } : null;
    const shown =
        current !== null && !items.some((item) => keyOf(item) === keyOf(current))
            ? [current, ...items]
            : items;
    return (
        <ComboBox
            label={label}
            errors={errors}
            isRequired={required}
            isDisabled={!editable}
            items={shown.map((item) => ({ id: keyOf(item), label: item.label }))}
            value={current !== null ? keyOf(current) : null}
            inputValue={query ?? current?.label ?? ''}
            onInputChange={(text) => {
                setQuery(text);
                if (text === '' && current !== null) {
                    onChange(null);
                }
            }}
            onChange={(key) => {
                setQuery(null);
                const found = shown.find((item) => keyOf(item) === key);
                if (found !== undefined) {
                    onChange({
                        id: found.id,
                        label: found.label,
                        ...(found.resource !== undefined
                            ? { resource: found.resource }
                            : resources[0] !== undefined
                              ? { resource: resources[0] }
                              : {}),
                    });
                }
            }}
            isLoading={isLoading}
            placeholder={intl.formatMessage(messages.search)}
            emptyMessage={intl.formatMessage(messages.noResults)}
            {...(onBlur !== undefined ? { onBlur: () => onBlur() } : {})}
        />
    );
}

const isLabelMode = (value: unknown): value is LinkLabelMode =>
    value === 'optional' || value === 'required' || value === 'none';
const isCodes = (value: unknown): value is string[] =>
    Array.isArray(value) && value.every(isString);

/**
 * The `link` type: its `resource` (the resources of `page` links), and settings `types`,
 * `newTab`, `label` and `libraries`. In a localized field, the label of each locale's link is a
 * string.
 */
export function LinkFieldEntry(props: FieldEntryProps) {
    const { field } = props;
    const labelMode = getSetting(field, 'label', isLabelMode);
    const libraries = getSetting(field, 'libraries', isCodes);
    const pages =
        field.resource === undefined
            ? []
            : typeof field.resource === 'string'
              ? [field.resource]
              : field.resource;
    const { placeholder: _placeholder, ...fieldProps } = getFieldProps(props);
    return (
        <LinkField
            {...fieldProps}
            path={props.path}
            value={isLink(props.value) ? props.value : null}
            onChange={props.onChange}
            types={getLinkTypes(field)}
            pages={pages}
            newTab={getLinkNewTab(field)}
            singleLabel={props.locale !== undefined}
            {...(labelMode !== undefined ? { labelMode } : {})}
            {...(libraries !== undefined ? { libraries } : {})}
        />
    );
}
