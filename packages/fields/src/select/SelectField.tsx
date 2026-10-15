import type { Option } from '@panneau/protocol';
import { Checkbox, Fieldset, type OptionValue, RadioGroup, Select } from '@panneau/ui';

import { getFieldProps, getSetting, isString } from '../shared/entry';
import type { FieldEntryProps, FieldProps } from '../shared/types';
import styles from './SelectField.module.css';

export type { OptionValue };

/** Props of both single and multiple select fields. */
export interface SelectFieldBaseProps extends Omit<FieldProps<never>, 'value' | 'onChange'> {
    /** The choices. Same shape as the protocol's `Option`. */
    options: readonly Option[];
    placeholder?: string;
    controlClassName?: string;
}

export interface SingleSelectFieldProps extends SelectFieldBaseProps {
    multiple?: false;
    value?: OptionValue | null;
    onChange?: (value: OptionValue | null) => void;
    /** `select` (default): a dropdown. `radios`: every choice visible. */
    widget?: 'select' | 'radios';
}

export interface MultipleSelectFieldProps extends SelectFieldBaseProps {
    multiple: true;
    value?: readonly OptionValue[] | null;
    /** Called with the selected values, in the order of the options. An empty list is `null`. */
    onChange?: (value: OptionValue[] | null) => void;
    /** `select` (default): a dropdown. `checkboxes`: every choice visible. */
    widget?: 'select' | 'checkboxes';
}

export type SelectFieldProps = SingleSelectFieldProps | MultipleSelectFieldProps;

/**
 * A choice among options, or several with `multiple`, as a dropdown or as radios and checkboxes.
 * Values keep their type (strings, numbers, booleans).
 */
export function SelectField(props: SelectFieldProps) {
    const {
        options,
        label,
        description,
        errors,
        disabled,
        readOnly,
        required,
        placeholder,
        name,
        id,
        autoFocus,
        onBlur,
        className,
        labelClassName,
        descriptionClassName,
        errorsClassName,
        controlClassName,
    } = props;
    const chrome = {
        label,
        description,
        errors,
        className,
        labelClassName,
        descriptionClassName,
        errorsClassName,
        ...(props['aria-label'] !== undefined ? { 'aria-label': props['aria-label'] } : {}),
    };
    const locked = disabled === true || readOnly === true;

    if (props.multiple === true) {
        const selected = props.value ?? [];
        const change = (next: readonly OptionValue[]) => {
            // Keep the order of the options, whatever the order of the clicks.
            const ordered = options
                .map((option) => option.value)
                .filter((value) => next.includes(value));
            props.onChange?.(ordered.length > 0 ? ordered : null);
        };
        if (props.widget === 'checkboxes') {
            return (
                <Fieldset
                    legend={label}
                    description={description}
                    errors={errors}
                    isRequired={required}
                    isDisabled={disabled}
                    className={className}
                    legendClassName={labelClassName}
                    descriptionClassName={descriptionClassName}
                    errorsClassName={errorsClassName}
                >
                    <div className={styles.checkboxes}>
                        {options.map((option, index) => (
                            <Checkbox
                                key={index}
                                isSelected={selected.includes(option.value)}
                                isDisabled={option.disabled}
                                isReadOnly={readOnly}
                                description={option.description}
                                onChange={(checked) =>
                                    change(
                                        checked
                                            ? [...selected, option.value]
                                            : selected.filter((value) => value !== option.value),
                                    )
                                }
                                checkboxClassName={controlClassName}
                            >
                                {option.label}
                            </Checkbox>
                        ))}
                    </div>
                </Fieldset>
            );
        }
        return (
            <Select
                {...chrome}
                multiple
                options={options}
                value={selected}
                onChange={change}
                isRequired={required}
                isDisabled={locked}
                {...(placeholder !== undefined ? { placeholder } : {})}
                {...(name !== undefined ? { name } : {})}
                {...(id !== undefined ? { id } : {})}
                {...(autoFocus !== undefined ? { autoFocus } : {})}
                {...(onBlur !== undefined ? { onBlur } : {})}
                {...(controlClassName !== undefined ? { triggerClassName: controlClassName } : {})}
            />
        );
    }

    if (props.widget === 'radios') {
        return (
            <RadioGroup
                {...chrome}
                options={options}
                value={props.value ?? null}
                onChange={(value) => props.onChange?.(value)}
                isRequired={required}
                isDisabled={disabled}
                isReadOnly={readOnly}
                {...(name !== undefined ? { name } : {})}
                {...(id !== undefined ? { id } : {})}
                {...(onBlur !== undefined ? { onBlur } : {})}
                {...(controlClassName !== undefined ? { radioClassName: controlClassName } : {})}
            />
        );
    }
    return (
        <Select
            {...chrome}
            options={options}
            value={props.value ?? null}
            onChange={(value) => props.onChange?.(value)}
            isRequired={required}
            isDisabled={locked}
            {...(placeholder !== undefined ? { placeholder } : {})}
            {...(name !== undefined ? { name } : {})}
            {...(id !== undefined ? { id } : {})}
            {...(autoFocus !== undefined ? { autoFocus } : {})}
            {...(onBlur !== undefined ? { onBlur } : {})}
            {...(controlClassName !== undefined ? { triggerClassName: controlClassName } : {})}
        />
    );
}

function isOptionValue(value: unknown): value is OptionValue {
    return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

/**
 * The `select` type: `options`, `multiple`, and setting `widget` (`radios` for a single choice,
 * `checkboxes` for several).
 */
export function SelectFieldEntry(props: FieldEntryProps) {
    const { field } = props;
    const widget = getSetting(field, 'widget', isString);
    const options = field.options ?? [];
    if (field.multiple === true) {
        const value = Array.isArray(props.value) ? props.value.filter(isOptionValue) : null;
        return (
            <SelectField
                {...getFieldProps(props)}
                multiple
                options={options}
                value={value}
                onChange={props.onChange}
                {...(widget === 'checkboxes' ? { widget } : {})}
            />
        );
    }
    return (
        <SelectField
            {...getFieldProps(props)}
            options={options}
            value={isOptionValue(props.value) ? props.value : null}
            onChange={props.onChange}
            {...(widget === 'radios' ? { widget } : {})}
        />
    );
}
