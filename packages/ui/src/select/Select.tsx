import { Check, ChevronDown, X } from 'lucide-react';
import { type ReactNode, useRef } from 'react';
import type { Key } from 'react-aria-components';
import {
    Select as AriaSelect,
    Button,
    ButtonContext,
    ListBox,
    ListBoxItem,
    SelectValue,
    Text,
} from 'react-aria-components';

import {
    type FieldChromeProps,
    FieldDescription,
    FieldErrors,
    FieldLabel,
    fieldStyles,
} from '../field/FieldParts';
import { IconButton } from '../icon-button/IconButton';
import { Icon } from '../icon/Icon';
import { messages } from '../intl/messages';
import { usePanneauIntl } from '../intl/usePanneauIntl';
import { PopoverSurface } from '../popover/Popover';
import { cx } from '../utils/cx';
import styles from './ListBox.module.css';

/** The value of an option. */
export type OptionValue = string | number | boolean;

/** A choice of a select, a radio group or a combo box. Same shape as the protocol's `Option`. */
export interface SelectOption {
    value: OptionValue;
    label: string;
    description?: string;
    disabled?: boolean;
    /** Decorative content before the label, such as a flag. Assistive technologies skip it. */
    prefix?: ReactNode;
    /** The language of the label, when it differs from the interface's: a language's own name. */
    lang?: string;
}

/** Props of both single and multiple selects. */
export interface SelectBaseProps extends FieldChromeProps {
    options: readonly SelectOption[];
    /** Text shown without a value. Defaults to "Select…". */
    placeholder?: string;
    isRequired?: boolean;
    isDisabled?: boolean;
    name?: string;
    autoFocus?: boolean;
    onBlur?: () => void;
    'aria-label'?: string;
    id?: string;
    /**
     * `field` (default): a control with its box. `bare`: the button alone, without a box, inside
     * another control (the country of a phone number).
     */
    appearance?: 'field' | 'bare';
    /** Class name of the button that opens the options. */
    triggerClassName?: string;
    popoverClassName?: string;
    /**
     * Empties the select. With a value, a button in place of the arrow calls it: a filter, whose
     * value can be removed in one click. The focus then goes back to the select.
     */
    onClear?: (() => void) | undefined;
    /** The name of the button that empties the select. Defaults to "Clear". */
    clearLabel?: string | undefined;
}

export interface SingleSelectProps extends SelectBaseProps {
    multiple?: false;
    /** The selected value, or `null`. */
    value?: OptionValue | null;
    onChange?: (value: OptionValue | null) => void;
    /**
     * What the button shows for the selected option, instead of its label: a shorter text when
     * the button is narrow. The options keep their labels.
     */
    renderValue?: (option: SelectOption) => ReactNode;
}

export interface MultipleSelectProps extends SelectBaseProps {
    /** Several values can be selected. */
    multiple: true;
    value?: readonly OptionValue[];
    onChange?: (value: OptionValue[]) => void;
}

export type SelectProps = SingleSelectProps | MultipleSelectProps;

const EMPTY_KEY = '__panneau_empty__';

function keyOf(options: readonly SelectOption[], value: OptionValue): Key | null {
    const index = options.findIndex((option) => option.value === value);
    return index === -1 ? null : String(index);
}

function valueOf(options: readonly SelectOption[], key: Key | null): OptionValue | null {
    if (key === null || key === EMPTY_KEY) {
        return null;
    }
    return options[Number(key)]?.value ?? null;
}

/**
 * A dropdown to pick one option, or several with `multiple`. Option values can be strings,
 * numbers or booleans. Unless `isRequired`, a single select has an empty choice first.
 */
export function Select(props: SelectProps) {
    const intl = usePanneauIntl();
    const {
        options,
        label,
        description,
        errors = [],
        isRequired = false,
        isDisabled,
        name,
        autoFocus,
        onBlur,
        id,
        className,
        labelClassName,
        descriptionClassName,
        errorsClassName,
        appearance = 'field',
        triggerClassName,
        popoverClassName,
        onClear,
        clearLabel,
    } = props;
    const box = useRef<HTMLDivElement>(null);
    const hasValue =
        props.multiple === true
            ? (props.value ?? []).length > 0
            : props.value !== undefined && props.value !== null;
    const clearable = onClear !== undefined && hasValue && isDisabled !== true;
    const placeholder = props.placeholder ?? intl.formatMessage(messages.selectPlaceholder);
    const invalid = errors.length > 0;
    const items = options.map((option, index) => ({ ...option, key: String(index) }));
    const withEmpty = props.multiple !== true && !isRequired;
    const renderValue = props.multiple !== true ? props.renderValue : undefined;
    const selected =
        props.multiple !== true && props.value !== undefined && props.value !== null
            ? options.find((option) => option.value === props.value)
            : undefined;
    // Several options read as one line, their labels in a list ("Draft, In review and Published"):
    // their whole content (descriptions, prefixes) would stack in the trigger.
    const chosenLabels =
        props.multiple === true
            ? options
                  .filter((option) => (props.value ?? []).includes(option.value))
                  .map((option) => option.label)
            : [];

    const shared = {
        id,
        name,
        autoFocus,
        isDisabled,
        isRequired,
        isInvalid: invalid,
        placeholder,
        'aria-label': props['aria-label'],
        validationBehavior: 'aria' as const,
        onBlur: onBlur !== undefined ? () => onBlur() : undefined,
        disabledKeys: items.filter((item) => item.disabled === true).map((item) => item.key),
        className: cx('panneau-select', fieldStyles.field, className),
    };

    const content = (
        <>
            <FieldLabel isRequired={isRequired} className={labelClassName}>
                {label}
            </FieldLabel>
            <div ref={box} className={styles.triggerBox}>
                <Button
                    // The box shows the error, as the box of a text input does
                    data-invalid={invalid || undefined}
                    data-clearable={clearable || undefined}
                    className={cx(
                        appearance === 'bare' ? styles.bareTrigger : fieldStyles.control,
                        styles.trigger,
                        triggerClassName,
                    )}
                >
                    <SelectValue className={styles.value}>
                        {({ defaultChildren, isPlaceholder }) =>
                            !isPlaceholder && chosenLabels.length > 0 ? (
                                <span className={styles.valueList}>
                                    {intl.formatList(chosenLabels, { type: 'conjunction' })}
                                </span>
                            ) : !isPlaceholder && selected !== undefined ? (
                                <span className={styles.valueText} lang={selected.lang}>
                                    {selected.prefix !== undefined ? (
                                        <span className={styles.prefix} aria-hidden="true">
                                            {selected.prefix}
                                        </span>
                                    ) : null}
                                    {renderValue !== undefined
                                        ? renderValue(selected)
                                        : defaultChildren}
                                </span>
                            ) : (
                                defaultChildren
                            )
                        }
                    </SelectValue>
                    <Icon icon={ChevronDown} className={styles.chevron} />
                </Button>
                {clearable ? (
                    // Not a part of the select: its own button, over the place of the arrow
                    <ButtonContext.Provider value={null}>
                        <IconButton
                            icon={X}
                            label={clearLabel ?? intl.formatMessage(messages.clear)}
                            size="sm"
                            className={styles.clear}
                            onPress={() => {
                                onClear();
                                // The button goes away with the value: the focus goes to the select
                                box.current?.querySelector('button')?.focus();
                            }}
                        />
                    </ButtonContext.Provider>
                ) : null}
            </div>
            <FieldDescription className={descriptionClassName}>{description}</FieldDescription>
            <FieldErrors errors={errors} className={errorsClassName} />
            <PopoverSurface className={popoverClassName}>
                <ListBox className={styles.listBox}>
                    {withEmpty ? (
                        <ListBoxItem id={EMPTY_KEY} textValue={placeholder} className={styles.item}>
                            <span className={styles.check} />
                            <span className={styles.placeholder}>{placeholder}</span>
                        </ListBoxItem>
                    ) : null}
                    {items.map((item) => (
                        <ListBoxItem
                            key={item.key}
                            id={item.key}
                            textValue={item.label}
                            className={styles.item}
                        >
                            {({ isSelected }) => (
                                <>
                                    <span className={styles.check}>
                                        {isSelected ? <Icon icon={Check} size="sm" /> : null}
                                    </span>
                                    {item.prefix !== undefined ? (
                                        <span className={styles.prefix} aria-hidden="true">
                                            {item.prefix}
                                        </span>
                                    ) : null}
                                    <span className={styles.itemText}>
                                        <Text
                                            slot="label"
                                            lang={item.lang}
                                            className={styles.itemLabel}
                                        >
                                            {item.label}
                                        </Text>
                                        {item.description !== undefined ? (
                                            <Text
                                                slot="description"
                                                className={styles.itemDescription}
                                            >
                                                {item.description}
                                            </Text>
                                        ) : null}
                                    </span>
                                </>
                            )}
                        </ListBoxItem>
                    ))}
                </ListBox>
            </PopoverSurface>
        </>
    );

    if (props.multiple === true) {
        const { value, onChange } = props;
        return (
            <AriaSelect
                {...shared}
                selectionMode="multiple"
                value={
                    value !== undefined
                        ? value.flatMap((item) => {
                              const key = keyOf(options, item);
                              return key !== null ? [key] : [];
                          })
                        : undefined
                }
                onChange={(keys) =>
                    onChange?.(
                        keys.flatMap((key) => {
                            const item = valueOf(options, key);
                            return item !== null ? [item] : [];
                        }),
                    )
                }
            >
                {content}
            </AriaSelect>
        );
    }

    const { value, onChange } = props;
    return (
        <AriaSelect
            {...shared}
            selectionMode="single"
            value={
                value !== undefined ? (value !== null ? keyOf(options, value) : null) : undefined
            }
            onChange={(key) => onChange?.(valueOf(options, key))}
        >
            {content}
        </AriaSelect>
    );
}
