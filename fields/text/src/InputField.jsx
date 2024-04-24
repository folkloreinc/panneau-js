/* eslint-disable react/jsx-props-no-spreading, react/no-array-index-key */
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { v1 as uuid } from 'uuid';

import InputGroup from '@panneau/field-input-group';

import styles from './styles.module.scss';

const propTypes = {
    feedback: PropTypes.oneOf(['valid', 'invalid', 'loading']),
    value: PropTypes.string,
    errors: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    nativeOnChange: PropTypes.bool,
    type: PropTypes.oneOf(['text', 'email', 'tel', 'password', 'textarea', 'number']),
    placeholder: PropTypes.string,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    align: PropTypes.oneOf(['left', 'center', 'right']),
    size: PropTypes.oneOf([null, 'lg', 'sm']),
    maxLength: PropTypes.number,
    prepend: PropTypes.node,
    append: PropTypes.node,
    min: PropTypes.number,
    max: PropTypes.number,
    dataList: PropTypes.arrayOf(PropTypes.string),
    inputRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({
            current: PropTypes.any, // eslint-disable-line
        }),
    ]),
    style: PropTypes.shape({}),
    className: PropTypes.string,
};

const defaultProps = {
    feedback: null,
    value: null,
    errors: null,
    required: false,
    disabled: false,
    readOnly: false,
    nativeOnChange: false,
    type: null,
    placeholder: null,
    onChange: null,
    onFocus: null,
    onBlur: null,
    align: null,
    size: null,
    maxLength: null,
    prepend: null,
    append: null,
    min: null,
    max: null,
    dataList: null,
    inputRef: null,
    style: null,
    className: null,
};

const InputField = ({
    feedback,
    value,
    errors,
    required,
    disabled,
    readOnly,
    nativeOnChange,
    type,
    placeholder,
    onChange,
    onFocus,
    onBlur,
    align,
    size,
    maxLength,
    prepend,
    append,
    min,
    max,
    dataList,
    inputRef,
    style,
    className,
}) => {
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
        style: { textAlign: align },
        placeholder,
        type,
        maxLength,
        min,
        max,
        required,
        disabled,
        readOnly,
        list: dataListId,
        onChange: nativeOnChange
            ? onChange
            : ({ target: { value: newValue = '' } }) =>
                  onChange !== null ? onChange(!isEmpty(newValue) ? newValue : null) : null,
    };

    const { horizontal, ...cleanProps } = elProps;
    const inputElement =
        type !== 'textarea' ? (
            <input {...cleanProps} style={style} />
        ) : (
            <textarea style={style} {...cleanProps} />
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
                    {dataList.map((data, dataIndex) => (
                        <option key={`option-${dataIndex}`}>{data}</option>
                    ))}
                </datalist>
            ) : null}
        </>
    );
};

InputField.propTypes = propTypes;
InputField.defaultProps = defaultProps;

export default InputField; // React.forwardRef((props, ref) => <InputField inputRef={ref} {...props} />);
