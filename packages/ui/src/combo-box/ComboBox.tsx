import { Check, ChevronDown } from 'lucide-react';
import {
    ComboBox as AriaComboBox,
    type ComboBoxProps as AriaComboBoxProps,
    Button,
    Group,
    Input,
    ListBox,
    ListBoxItem,
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
import listStyles from '../select/ListBox.module.css';
import { Spinner } from '../spinner/Spinner';
import { cx } from '../utils/cx';
import styles from './ComboBox.module.css';

/** An item that a combo box can pick. */
export interface ComboBoxItem {
    id: string;
    label: string;
    description?: string;
    disabled?: boolean;
}

export interface ComboBoxProps
    extends
        Omit<
            AriaComboBoxProps<ComboBoxItem>,
            | 'className'
            | 'style'
            | 'children'
            | 'items'
            | 'defaultItems'
            | 'isInvalid'
            | 'validate'
            | 'selectedKey'
            | 'defaultSelectedKey'
            | 'onSelectionChange'
            | 'value'
            | 'defaultValue'
            | 'onChange'
        >,
        FieldChromeProps {
    /** The items to show. For a local list, filter them with `inputValue`; for a search, fetch them. */
    items: readonly ComboBoxItem[];
    /** Id of the selected item, or `null`. */
    value?: string | null;
    onChange?: (id: string | null) => void;
    placeholder?: string;
    /** Shows a spinner while items load. */
    isLoading?: boolean;
    /** Text shown without items. Defaults to "No results". */
    emptyMessage?: string;
    controlClassName?: string;
    inputClassName?: string;
    popoverClassName?: string;
}

/**
 * A text input with a list of suggestions, to pick one item. Items can be filtered locally or come
 * from a search (`inputValue`, `onInputChange` and `isLoading`).
 */
export function ComboBox({
    items,
    value,
    onChange,
    label,
    description,
    errors = [],
    placeholder,
    isLoading = false,
    emptyMessage,
    isRequired,
    menuTrigger = 'focus',
    className,
    labelClassName,
    descriptionClassName,
    errorsClassName,
    controlClassName,
    inputClassName,
    popoverClassName,
    ...props
}: ComboBoxProps) {
    const intl = usePanneauIntl();
    const invalid = errors.length > 0;
    return (
        <AriaComboBox
            {...props}
            items={items}
            selectedKey={value}
            onSelectionChange={
                onChange !== undefined
                    ? (key) => onChange(key === null ? null : String(key))
                    : undefined
            }
            disabledKeys={items.filter((item) => item.disabled === true).map((item) => item.id)}
            menuTrigger={menuTrigger}
            allowsEmptyCollection
            isRequired={isRequired}
            isInvalid={invalid}
            validationBehavior="aria"
            className={cx('panneau-combo-box', fieldStyles.field, className)}
        >
            <FieldLabel isRequired={isRequired} className={labelClassName}>
                {label}
            </FieldLabel>
            <Group
                className={cx(fieldStyles.control, styles.control, controlClassName)}
                data-invalid={invalid || undefined}
            >
                <Input placeholder={placeholder} className={cx(fieldStyles.bare, inputClassName)} />
                {isLoading ? (
                    <span className={styles.status}>
                        <Spinner size="sm" />
                    </span>
                ) : null}
                <Button
                    className={styles.button}
                    aria-label={intl.formatMessage(messages.showOptions)}
                >
                    <Icon icon={ChevronDown} />
                </Button>
            </Group>
            <FieldDescription className={descriptionClassName}>{description}</FieldDescription>
            <FieldErrors errors={errors} className={errorsClassName} />
            <PopoverSurface className={popoverClassName}>
                <ListBox<ComboBoxItem>
                    className={listStyles.listBox}
                    renderEmptyState={() => (
                        <div className={listStyles.empty}>
                            {isLoading
                                ? intl.formatMessage(messages.loading)
                                : (emptyMessage ?? intl.formatMessage(messages.noResults))}
                        </div>
                    )}
                >
                    {(item) => (
                        <ListBoxItem
                            id={item.id}
                            textValue={item.label}
                            className={listStyles.item}
                        >
                            {({ isSelected }) => (
                                <>
                                    <span className={listStyles.check}>
                                        {isSelected ? <Icon icon={Check} size="sm" /> : null}
                                    </span>
                                    <span className={listStyles.itemText}>
                                        <Text slot="label" className={listStyles.itemLabel}>
                                            {item.label}
                                        </Text>
                                        {item.description !== undefined ? (
                                            <Text
                                                slot="description"
                                                className={listStyles.itemDescription}
                                            >
                                                {item.description}
                                            </Text>
                                        ) : null}
                                    </span>
                                </>
                            )}
                        </ListBoxItem>
                    )}
                </ListBox>
            </PopoverSurface>
        </AriaComboBox>
    );
}
