import { Checkbox, Switch } from '@panneau/ui';

import { getFieldProps, getSetting, isString } from '../shared/entry';
import type { FieldEntryProps, FieldProps } from '../shared/types';

export interface BooleanFieldProps extends Omit<FieldProps<boolean>, 'labelClassName'> {
    /** `checkbox` (default) for a choice saved with the form, `switch` for an on and off setting. */
    widget?: 'checkbox' | 'switch';
    controlClassName?: string;
}

/** A yes or no value, as a checkbox or a switch with its label. An empty value is `false`. */
export function BooleanField({
    value,
    onChange,
    label,
    widget = 'checkbox',
    disabled,
    readOnly,
    required,
    controlClassName,
    ...props
}: BooleanFieldProps) {
    const shared = {
        ...props,
        isSelected: value === true,
        onChange: (next: boolean) => onChange?.(next),
        isDisabled: disabled,
        isReadOnly: readOnly,
        isRequired: required,
        children: label,
    };
    return widget === 'switch' ? (
        <Switch {...shared} switchClassName={controlClassName} />
    ) : (
        <Checkbox {...shared} checkboxClassName={controlClassName} />
    );
}

/** The `boolean` type: setting `widget` (`checkbox` or `switch`). */
export function BooleanFieldEntry(props: FieldEntryProps) {
    const widget = getSetting(props.field, 'widget', isString);
    return (
        <BooleanField
            {...getFieldProps(props)}
            value={props.value === true}
            onChange={props.onChange}
            {...(widget === 'switch' || widget === 'checkbox' ? { widget } : {})}
        />
    );
}
