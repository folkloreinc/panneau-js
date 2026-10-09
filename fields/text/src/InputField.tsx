import classNames from 'classnames';
import isEmpty from 'lodash-es/isEmpty';
import {
    type CSSProperties,
    type ChangeEvent,
    type FocusEventHandler,
    type KeyboardEventHandler,
    type MouseEventHandler,
    type ReactNode,
    type Ref,
    useMemo,
} from 'react';
import { v1 as uuid } from 'uuid';

import InputGroup from '@panneau/field-input-group';

import styles from './styles.module.css';

type InputType = 'text' | 'email' | 'tel' | 'password' | 'textarea' | 'number';
type Feedback = 'valid' | 'invalid' | 'loading';
type Size = null | 'lg' | 'sm';
type Align = 'left' | 'center' | 'right';

interface InputFieldProps {
    id?: string | null;
    name?: string | null;
    feedback?: Feedback | null;
    value?: string | null;
    errors?: string | string[] | null;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    nativeOnChange?: boolean;
    pattern?: string | null;
    title?: string | null;
    type?: InputType | null;
    placeholder?: string | null;
    onChange?: ((value: string | null) => void) | null;
    onFocus?: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement> | null;
    onBlur?: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement> | null;
    onClick?: MouseEventHandler<HTMLInputElement | HTMLTextAreaElement> | null;
    onKeyDown?: KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement> | null;
    align?: Align | null;
    size?: Size;
    maxLength?: number | null;
    prepend?: ReactNode | null;
    append?: ReactNode | null;
    min?: number | null;
    max?: number | null;
    step?: number | string | null;
    autoComplete?: string | null;
    autoFocus?: boolean;
    dataList?: string[] | null;
    inputRef?: Ref<HTMLInputElement | HTMLTextAreaElement> | null;
    style?: CSSProperties | null;
    className?: string | null;
}

function InputField({
    id = null,
    name = null,
    feedback = null,
    value = null,
    errors = null,
    required = false,
    disabled = false,
    readOnly = false,
    nativeOnChange = false,
    pattern = null,
    title = null,
    type = null,
    placeholder = null,
    onChange = null,
    onFocus = null,
    onBlur = null,
    onClick = null,
    onKeyDown = null,
    align = null,
    size = null,
    maxLength = null,
    prepend = null,
    append = null,
    min = null,
    max = null,
    step = null,
    autoComplete = null,
    autoFocus = false,
    dataList = null,
    inputRef = null,
    style = null,
    className = null,
}: InputFieldProps) {
    const dataListId = useMemo(() => (dataList !== null ? uuid() : null), [dataList]);

    const elProps = {
        ref: inputRef,
        id: id || undefined,
        name: name || undefined,
        className: classNames([
            styles.inputElement,
            'form-control',
            {
                [`form-control-${size}`]: size !== null,
                'is-valid': feedback === 'valid',
                'is-invalid': feedback === 'invalid' || errors !== null,
                [className]: className !== null,
            },
        ]),
        onFocus,
        onBlur,
        onClick: onClick || undefined,
        onKeyDown: onKeyDown || undefined,
        value: value !== null ? value : '',
        style: { textAlign: align || undefined },
        placeholder: placeholder || undefined,
        type: type || undefined,
        maxLength: maxLength || undefined,
        min: min ?? undefined,
        max: max ?? undefined,
        step: step ?? undefined,
        autoComplete: autoComplete || undefined,
        autoFocus,
        required,
        disabled,
        readOnly,
        list: dataListId || undefined,
        pattern: pattern || undefined,
        title: title || undefined,
        onChange: nativeOnChange
            ? onChange
            : ({
                  target: { value: newValue = '' },
              }: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                  onChange !== null ? onChange(!isEmpty(newValue) ? newValue : null) : null,
    };

    const inputElement =
        type !== 'textarea' ? (
            <input {...(elProps as any)} style={style || undefined} />
        ) : (
            <textarea {...(elProps as any)} style={style || undefined} />
        );
    const withInputGroup = prepend !== null || append !== null;

    return (
        <>
            {withInputGroup ? (
                <InputGroup prepend={prepend} append={append}>
                    {inputElement}
                </InputGroup>
            ) : (
                inputElement
            )}
            {dataListId !== null ? (
                <datalist id={dataListId}>
                    {dataList!.map((data, dataIndex) => (
                        <option key={`option-${dataIndex}`}>{data}</option>
                    ))}
                </datalist>
            ) : null}
        </>
    );
}

export default InputField;
