import { ArrowDown, ArrowUp, Plus, Trash2, X } from 'lucide-react';
import { type ReactNode, useId, useState } from 'react';

import type { Field } from '@panneau/protocol';
import {
    Badge,
    Button,
    Checkbox,
    ComboBox,
    Fieldset,
    IconButton,
    SegmentedControl,
    TextInput,
    usePanneauIntl,
} from '@panneau/ui';

import { useLocaleName } from '../localized/LocalizedField';
import { RelationField, useRelationSearch } from '../relation/RelationField';
import { NestedField } from '../shared/DefinitionField';
import { type BoundFieldProps, getParentPath, useFieldsContext } from '../shared/context';
import { cx } from '../shared/cx';
import { getFieldProps, getRuleNumber, getSetting, isBoolean, isString } from '../shared/entry';
import { messages } from '../shared/messages';
import {
    type RelationReference,
    type RelationSource,
    toReferences,
    useRelationReferences,
} from '../shared/relation';
import type { FieldEntryProps, FieldProps } from '../shared/types';
import styles from './CreditsField.module.css';
import {
    type Credit,
    type CreditPerson,
    type CreditRole,
    type CreditRoleName,
    getPersonName,
    isCreditName,
    toCreditPerson,
    toCreditRoles,
    toCredits,
} from './credits';

/** The ids of the last options of the person picker. */
const CREATE_ID = '\u0000create';
const NAME_ID = '\u0000name';

/**
 * A part of a credit at its own path (`credits.2.person`): bound to the form when there is a
 * binding, so that its value is set and its errors shown at that path, or given by the credit.
 */
function Part({
    path,
    label,
    value,
    onChange,
    children,
}: {
    path: string;
    label: string;
    value: unknown;
    onChange: (value: unknown) => void;
    children: (bound: BoundFieldProps) => ReactNode;
}) {
    const { binding: Binding } = useFieldsContext();
    if (Binding === null) {
        return children({ value, onChange });
    }
    const name = path.slice(path.lastIndexOf('.') + 1);
    return (
        <Binding
            field={{ name, type: 'credits-part', label }}
            path={path}
            parentPath={getParentPath(path)}
            render={children}
        />
    );
}

interface PersonPickerProps {
    resource: string | null;
    source: RelationSource | null;
    names: boolean;
    value: CreditPerson | null;
    onChange: (value: CreditPerson | null) => void;
    onBlur?: (() => void) | undefined;
    errors?: readonly string[] | undefined;
    disabled?: boolean | undefined;
    readOnly?: boolean | undefined;
    required?: boolean | undefined;
    name?: string | undefined;
}

/**
 * The person of a credit: a combo box over the relation source, which can create a person or keep
 * the text as a name; a text input for names without a resource of people.
 */
function PersonPicker({
    resource,
    source,
    names,
    value,
    onChange,
    onBlur,
    errors,
    disabled,
    readOnly,
    required,
    name,
}: PersonPickerProps) {
    const intl = usePanneauIntl();
    const label = intl.formatMessage(messages.creditPerson);
    const reference = value !== null && !isCreditName(value) ? value : null;
    const [resolved] = useRelationReferences(
        source,
        resource ?? '',
        reference !== null ? [reference] : [],
    );
    const current: CreditPerson | null = resolved ?? (reference === null ? value : null);
    const [query, setQuery] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const searchable =
        resource !== null && source !== null && disabled !== true && readOnly !== true;
    const { items: found, isLoading: searching } = useRelationSearch(
        source,
        resource ?? '',
        query ?? '',
        { enabled: searchable },
    );
    const chrome = {
        label,
        errors: createError !== null ? [...(errors ?? []), createError] : (errors ?? []),
        isRequired: required,
        ...(name !== undefined ? { name } : {}),
    };

    if (!searchable || resource === null || source === null) {
        // Names typed as they are; a reference that can't be searched shows its label.
        const editable = names && (current === null || isCreditName(current));
        return (
            <TextInput
                {...chrome}
                value={getPersonName(current)}
                onChange={(text) => onChange(text === '' ? null : { name: text })}
                {...(onBlur !== undefined ? { onBlur } : {})}
                isDisabled={disabled}
                isReadOnly={readOnly === true || !editable}
            />
        );
    }

    const sourceCreate = source.create;
    const canCreate = sourceCreate !== undefined && source.canCreate?.(resource) !== false;
    const text = (query ?? '').trim();
    const known = [...found, ...(current !== null ? [current] : [])].some(
        (item) =>
            getPersonName(item).toLocaleLowerCase(intl.locale) ===
            text.toLocaleLowerCase(intl.locale),
    );
    const extra =
        text !== '' && !searching && !known
            ? [
                  ...(canCreate
                      ? [
                            {
                                id: CREATE_ID,
                                label: intl.formatMessage(messages.createRelation, { text }),
                            },
                        ]
                      : []),
                  ...(names
                      ? [{ id: NAME_ID, label: intl.formatMessage(messages.creditName, { text }) }]
                      : []),
              ]
            : [];
    const shown: RelationReference[] = [
        ...(current !== null &&
        !isCreditName(current) &&
        !found.some((item) => item.id === current.id)
            ? [current]
            : []),
        ...found,
    ];
    const isName = current !== null && isCreditName(current);

    return (
        <div className={styles.person}>
            <ComboBox
                {...chrome}
                className={styles.personInput}
                items={[...shown, ...extra].map((item) => ({ id: item.id, label: item.label }))}
                value={current !== null && !isCreditName(current) ? current.id : null}
                inputValue={query ?? getPersonName(current)}
                onInputChange={(next) => {
                    setQuery(next);
                    if (next === '' && current !== null) {
                        onChange(null);
                    }
                }}
                onChange={(id) => {
                    if (id === CREATE_ID) {
                        setCreating(true);
                        setCreateError(null);
                        sourceCreate
                            ?.call(source, resource, text)
                            .then((created) => {
                                if (created !== null) {
                                    onChange(created);
                                    setQuery(null);
                                }
                            })
                            .catch(() =>
                                setCreateError(
                                    intl.formatMessage(messages.createRelationFailed, { text }),
                                ),
                            )
                            .finally(() => setCreating(false));
                        return;
                    }
                    if (id === NAME_ID) {
                        onChange({ name: text });
                        setQuery(null);
                        return;
                    }
                    setQuery(null);
                    const picked = shown.find((item) => item.id === id);
                    if (picked !== undefined && picked.id !== (current as { id?: string })?.id) {
                        onChange(picked);
                    }
                }}
                onBlur={() => {
                    setQuery(null);
                    onBlur?.();
                }}
                isLoading={searching || creating}
                placeholder={intl.formatMessage(messages.creditPersonPlaceholder)}
                emptyMessage={intl.formatMessage(messages.noResults)}
            />
            {isName && query === null ? (
                <Badge className={styles.nameOnly}>
                    {intl.formatMessage(messages.creditNameOnly)}
                </Badge>
            ) : null}
        </div>
    );
}

interface RoleNamesProps {
    value: readonly CreditRole[];
    onChange: (value: CreditRole[]) => void;
    onBlur?: (() => void) | undefined;
    errors?: readonly string[] | undefined;
    locale: string;
    localeLabel: string | null;
    disabled?: boolean | undefined;
    readOnly?: boolean | undefined;
}

/** Roles as names, one input each, in the locale shown. */
function RoleNames({
    value,
    onChange,
    onBlur,
    errors,
    locale,
    localeLabel,
    disabled,
    readOnly,
}: RoleNamesProps) {
    const intl = usePanneauIntl();
    const roles = value.filter((role): role is CreditRoleName => isCreditName(role));
    const editable = disabled !== true && readOnly !== true;
    const setName = (index: number, text: string) =>
        onChange(
            roles.map((role, i) =>
                i === index ? { name: { ...role.name, [locale]: text } } : role,
            ),
        );
    return (
        <Fieldset
            legend={intl.formatMessage(messages.creditRoles)}
            errors={errors ?? []}
            className={styles.roles}
        >
            {roles.length > 0 ? (
                <ul className={styles.roleList}>
                    {roles.map((role, index) => {
                        const number = index + 1;
                        const label = intl.formatMessage(messages.creditRole, { index: number });
                        // A name in another locale shows as a hint until it is translated.
                        const other = Object.values(role.name).find(
                            (name) => name !== undefined && name !== '',
                        );
                        return (
                            <li key={index} className={styles.role}>
                                <TextInput
                                    aria-label={
                                        localeLabel !== null ? `${label} (${localeLabel})` : label
                                    }
                                    className={styles.roleInput}
                                    value={role.name[locale] ?? ''}
                                    onChange={(text) => setName(index, text)}
                                    {...(onBlur !== undefined ? { onBlur } : {})}
                                    {...(other !== undefined ? { placeholder: other } : {})}
                                    isDisabled={disabled}
                                    isReadOnly={readOnly}
                                />
                                {editable ? (
                                    <IconButton
                                        icon={X}
                                        size="sm"
                                        label={intl.formatMessage(messages.removeRole, {
                                            index: number,
                                        })}
                                        showTooltip={false}
                                        onPress={() =>
                                            onChange(roles.filter((_, i) => i !== index))
                                        }
                                    />
                                ) : null}
                            </li>
                        );
                    })}
                </ul>
            ) : null}
            {editable ? (
                <div>
                    <Button
                        size="sm"
                        appearance="ghost"
                        icon={Plus}
                        onPress={() => onChange([...roles, { name: {} }])}
                    >
                        {intl.formatMessage(messages.addRole)}
                    </Button>
                </div>
            ) : null}
        </Fieldset>
    );
}

export interface CreditsFieldProps extends FieldProps<Credit[]> {
    /** Id of the resource of people. Without it, people are names. */
    resource?: string | null;
    /** Id of the resource of roles. Without it, roles are names in each locale. */
    roles?: string | null;
    /** Whether a person can be a name, when they aren't in the resource. Defaults to true. */
    names?: boolean;
    /** Whether users mark the credits to put forward. */
    featured?: boolean;
    /** The fields of each credit, next to its person and roles. */
    fields?: readonly Field[];
    /** The locales of the names of roles. Defaults to the fields context's, or the UI's. */
    locales?: readonly string[];
    /** Where people and roles are searched. Defaults to the fields context's. */
    source?: RelationSource | null;
    /** Dot path of the list, the prefix of the paths of its parts. Defaults to `name`. */
    path?: string;
    /** Fewest credits: credits can't be removed below it. */
    min?: number;
    /** Most credits: none can be added above it. */
    max?: number;
    itemClassName?: string;
}

/**
 * Credits (decision 0053): a list of people, each with their roles. A person is picked in the
 * resource of people, created from the picker when the source can, or kept as a name. Roles are
 * picked in the resource of roles, or typed as names in each locale. Credits can be added, moved
 * and removed. An empty list is `null`.
 */
export function CreditsField({
    resource = null,
    roles: rolesResource = null,
    names = true,
    featured = false,
    fields = [],
    locales: localesProp,
    source: sourceProp,
    path,
    name,
    value,
    onChange,
    onBlur,
    label,
    description,
    errors,
    disabled,
    readOnly,
    required,
    min = 0,
    max,
    className,
    labelClassName,
    descriptionClassName,
    errorsClassName,
    itemClassName,
}: CreditsFieldProps) {
    const intl = usePanneauIntl();
    const context = useFieldsContext();
    const localeName = useLocaleName();
    const id = useId();
    const source = sourceProp === undefined ? context.relationSource : sourceProp;
    const locales = localesProp ?? (context.locales.length > 0 ? context.locales : [intl.locale]);
    const [shownLocale, setShownLocale] = useState(locales[0] ?? intl.locale);
    const locale = locales.includes(shownLocale) ? shownLocale : (locales[0] ?? intl.locale);
    const base = path ?? name ?? '';
    const credits = toCredits(value);
    const editable = disabled !== true && readOnly !== true;
    const canAdd = editable && (max === undefined || credits.length < max);
    const canRemove = editable && credits.length > min;
    const peopleAreNames = resource === null || resource === '';
    const set = (next: Credit[]) => onChange?.(next.length > 0 ? next : null);
    const update = (index: number, key: string, next: unknown) =>
        set(
            credits.map((credit, i) => {
                if (i !== index) {
                    return credit;
                }
                const updated: Credit = { ...credit, [key]: next };
                // `featured` is left out unless it is true.
                if (updated.featured !== true) {
                    delete updated.featured;
                }
                return updated;
            }),
        );
    const move = (from: number, to: number) => {
        const next = [...credits];
        const [moved] = next.splice(from, 1);
        if (moved !== undefined) {
            next.splice(to, 0, moved);
            set(next);
        }
    };
    const add = () =>
        set([
            ...credits,
            {
                person: null,
                roles: [],
                ...Object.fromEntries(
                    fields.flatMap((field) =>
                        field.default !== undefined ? [[field.name, field.default]] : [],
                    ),
                ),
            },
        ]);
    const showLocales = (rolesResource === null || rolesResource === '') && locales.length > 1;

    return (
        <Fieldset
            legend={label}
            legendEnd={
                showLocales && credits.length > 0 ? (
                    <SegmentedControl
                        size="sm"
                        aria-label={intl.formatMessage(messages.locales)}
                        options={locales.map((option) => ({
                            value: option,
                            label: option.toUpperCase(),
                            textValue: localeName(option),
                        }))}
                        value={locale}
                        onChange={setShownLocale}
                    />
                ) : undefined
            }
            description={description}
            errors={errors}
            isRequired={required}
            className={className}
            legendClassName={labelClassName}
            descriptionClassName={descriptionClassName}
            errorsClassName={errorsClassName}
        >
            {credits.length > 0 ? (
                <ol className={styles.items}>
                    {credits.map((credit, index) => {
                        const number = index + 1;
                        const titleId = `${id}-${index}`;
                        const at = `${base}.${index}`;
                        const person = getPersonName(credit.person);
                        return (
                            <li
                                key={index}
                                className={cx(styles.item, itemClassName)}
                                aria-labelledby={titleId}
                            >
                                <div className={styles.header}>
                                    <span id={titleId} className={styles.title}>
                                        <span className={styles.index}>{number}</span>
                                        {person !== ''
                                            ? person
                                            : intl.formatMessage(messages.credit, {
                                                  index: number,
                                              })}
                                    </span>
                                    {editable ? (
                                        <span className={styles.tools}>
                                            <IconButton
                                                icon={ArrowUp}
                                                size="sm"
                                                label={intl.formatMessage(messages.moveCreditUp, {
                                                    index: number,
                                                })}
                                                isDisabled={index === 0}
                                                onPress={() => move(index, index - 1)}
                                            />
                                            <IconButton
                                                icon={ArrowDown}
                                                size="sm"
                                                label={intl.formatMessage(messages.moveCreditDown, {
                                                    index: number,
                                                })}
                                                isDisabled={index === credits.length - 1}
                                                onPress={() => move(index, index + 1)}
                                            />
                                            <IconButton
                                                icon={Trash2}
                                                size="sm"
                                                label={intl.formatMessage(messages.removeCredit, {
                                                    index: number,
                                                })}
                                                isDisabled={!canRemove}
                                                onPress={() =>
                                                    set(credits.filter((_, i) => i !== index))
                                                }
                                            />
                                        </span>
                                    ) : null}
                                </div>
                                <div className={styles.body}>
                                    <div className={styles.main}>
                                        <Part
                                            path={`${at}.person`}
                                            label={intl.formatMessage(messages.creditPerson)}
                                            value={credit.person}
                                            onChange={(next) => update(index, 'person', next)}
                                        >
                                            {(bound) => (
                                                <PersonPicker
                                                    resource={peopleAreNames ? null : resource}
                                                    source={source}
                                                    names={peopleAreNames || names}
                                                    value={toCreditPerson(bound.value)}
                                                    onChange={bound.onChange}
                                                    onBlur={bound.onBlur ?? onBlur}
                                                    errors={bound.errors}
                                                    disabled={disabled}
                                                    readOnly={readOnly}
                                                    required
                                                    name={`${at}.person`}
                                                />
                                            )}
                                        </Part>
                                        <Part
                                            path={`${at}.roles`}
                                            label={intl.formatMessage(messages.creditRoles)}
                                            value={credit.roles}
                                            onChange={(next) => update(index, 'roles', next)}
                                        >
                                            {(bound) => {
                                                const current = toCreditRoles(bound.value);
                                                const setRoles = (next: CreditRole[]) =>
                                                    bound.onChange(next);
                                                if (
                                                    rolesResource !== null &&
                                                    rolesResource !== ''
                                                ) {
                                                    return (
                                                        <RelationField
                                                            multiple
                                                            label={intl.formatMessage(
                                                                messages.creditRoles,
                                                            )}
                                                            resource={rolesResource}
                                                            source={source}
                                                            value={toReferences(
                                                                current.filter(
                                                                    (role) => !isCreditName(role),
                                                                ),
                                                            )}
                                                            onChange={(next) =>
                                                                setRoles(next ?? [])
                                                            }
                                                            {...(bound.onBlur !== undefined
                                                                ? { onBlur: bound.onBlur }
                                                                : {})}
                                                            errors={bound.errors ?? []}
                                                            {...(disabled !== undefined
                                                                ? { disabled }
                                                                : {})}
                                                            {...(readOnly !== undefined
                                                                ? { readOnly }
                                                                : {})}
                                                            className={styles.roles}
                                                        />
                                                    );
                                                }
                                                return (
                                                    <RoleNames
                                                        value={current}
                                                        onChange={setRoles}
                                                        onBlur={bound.onBlur ?? onBlur}
                                                        errors={bound.errors}
                                                        locale={locale}
                                                        localeLabel={
                                                            locales.length > 1
                                                                ? localeName(locale)
                                                                : null
                                                        }
                                                        disabled={disabled}
                                                        readOnly={readOnly}
                                                    />
                                                );
                                            }}
                                        </Part>
                                    </div>
                                    {featured ? (
                                        <Part
                                            path={`${at}.featured`}
                                            label={intl.formatMessage(messages.creditFeatured)}
                                            value={credit.featured === true}
                                            onChange={(next) => update(index, 'featured', next)}
                                        >
                                            {(bound) => (
                                                <Checkbox
                                                    isSelected={bound.value === true}
                                                    onChange={(next) =>
                                                        bound.onChange(next ? true : undefined)
                                                    }
                                                    isDisabled={disabled}
                                                    isReadOnly={readOnly}
                                                    errors={bound.errors ?? []}
                                                >
                                                    {intl.formatMessage(messages.creditFeatured)}
                                                </Checkbox>
                                            )}
                                        </Part>
                                    ) : null}
                                    {fields.map((field) => (
                                        <NestedField
                                            key={field.name}
                                            field={field}
                                            path={`${at}.${field.name}`}
                                            value={credit[field.name]}
                                            onChange={(next) => update(index, field.name, next)}
                                            {...(onBlur !== undefined ? { onBlur } : {})}
                                            parentValue={credit}
                                            {...(disabled !== undefined ? { disabled } : {})}
                                            {...(readOnly !== undefined ? { readOnly } : {})}
                                        />
                                    ))}
                                </div>
                            </li>
                        );
                    })}
                </ol>
            ) : (
                <p className={styles.empty}>{intl.formatMessage(messages.noCredits)}</p>
            )}
            {editable ? (
                <div className={styles.footer}>
                    <Button size="sm" icon={Plus} isDisabled={!canAdd} onPress={add}>
                        {intl.formatMessage(messages.addCredit)}
                    </Button>
                </div>
            ) : null}
        </Fieldset>
    );
}

/**
 * The `credits` type: `resource` for the people, settings `roles` (the resource of roles), `names`
 * (true by default) and `featured`, `fields` for the fields of each credit, and `min` and `max`
 * credits from its rules.
 */
export function CreditsFieldEntry(props: FieldEntryProps) {
    const { field } = props;
    const min = getRuleNumber(field, 'min');
    const max = getRuleNumber(field, 'max');
    const roles = getSetting(field, 'roles', isString);
    const names = getSetting(field, 'names', isBoolean);
    const featured = getSetting(field, 'featured', isBoolean);
    const credits = toCredits(props.value);
    return (
        <CreditsField
            {...getFieldProps(props)}
            path={props.path}
            resource={typeof field.resource === 'string' ? field.resource : null}
            {...(roles !== undefined ? { roles } : {})}
            {...(names !== undefined ? { names } : {})}
            {...(featured !== undefined ? { featured } : {})}
            {...(field.fields !== undefined ? { fields: field.fields } : {})}
            value={credits.length > 0 ? credits : null}
            onChange={props.onChange}
            {...(min !== undefined ? { min } : {})}
            {...(max !== undefined ? { max } : {})}
        />
    );
}
