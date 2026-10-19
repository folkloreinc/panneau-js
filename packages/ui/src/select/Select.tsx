import { Check, ChevronDown } from 'lucide-react';
import type { Key } from 'react-aria-components';
import {
    Select as AriaSelect,
    Button,
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
    /** Class name of the button that opens the options. */
    triggerClassName?: string;
    popoverClassName?: string;
}

export interface SingleSelectProps extends SelectBaseProps {
    multiple?: false;
    /** The selected value, or `null`. */
    value?: OptionValue | null;
    onChange?: (value: OptionValue | null) => void;
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
        placeholder = intl.formatMessage(messages.selectPlaceholder),
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
        triggerClassName,
        popoverClassName,
    } = props;
    const invalid = errors.length > 0;
    const items = options.map((option, index) => ({ ...option, key: String(index) }));
    const withEmpty = props.multiple !== true && !isRequired;

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
            <Button className={cx(fieldStyles.control, styles.trigger, triggerClassName)}>
                <SelectValue className={styles.value} />
                <Icon icon={ChevronDown} className={styles.chevron} />
            </Button>
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
                                    <span className={styles.itemText}>
                                        <Text slot="label" className={styles.itemLabel}>
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
