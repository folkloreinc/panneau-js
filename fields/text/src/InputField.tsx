import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import {
    type CSSProperties,
    type ChangeEvent,
    type FocusEventHandler,
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
    align?: Align | null;
    size?: Size;
    maxLength?: number | null;
    prepend?: ReactNode | null;
    append?: ReactNode | null;
    min?: number | null;
    max?: number | null;
    dataList?: string[] | null;
    inputRef?: Ref<HTMLInputElement | HTMLTextAreaElement> | null;
    style?: CSSProperties | null;
    className?: string | null;
}

function InputField({
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
    align = null,
    size = null,
    maxLength = null,
    prepend = null,
    append = null,
    min = null,
    max = null,
    dataList = null,
    inputRef = null,
    style = null,
    className = null,
}: InputFieldProps) {
    const dataListId = useMemo(() => (dataList !== null ? uuid() : null), [dataList]);

    const elProps = {
        ref: inputRef,
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
        value: value !== null ? value : '',
        style: { textAlign: align || undefined },
        placeholder: placeholder || undefined,
        type: type || undefined,
        maxLength: maxLength || undefined,
        min: min || undefined,
        max: max || undefined,
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

    const { horizontal, ...cleanProps } = elProps as any;
    const inputElement =
        type !== 'textarea' ? (
            <input {...cleanProps} style={style || undefined} />
        ) : (
            <textarea style={style || undefined} {...cleanProps} />
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
