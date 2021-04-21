/* eslint-disable react/jsx-props-no-spreading, react/no-array-index-key */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import classNames from 'classnames';
import InputGroup from '@panneau/field-input-group';
import { v1 as uuid } from 'uuid';

import styles from './styles.module.scss';

const propTypes = {
    feedback: PropTypes.oneOf(['valid', 'invalid', 'loading']),
    value: PropTypes.string,
    errors: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    required: PropTypes.bool,
    nativeOnChange: PropTypes.bool,
    type: PropTypes.oneOf(['text', 'email', 'tel', 'password', 'textarea']),
    placeholder: PropTypes.string,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    align: PropTypes.oneOf(['left', 'center', 'right']),
    prepend: PropTypes.node,
    append: PropTypes.node,
    dataList: PropTypes.arrayOf(PropTypes.string),
    inputRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({
            current: PropTypes.any, // eslint-disable-line
        }),
    ]),
    className: PropTypes.string,
};

const defaultProps = {
    feedback: null,
    value: null,
    errors: null,
    required: false,
    nativeOnChange: false,
    type: null,
    placeholder: null,
    onChange: null,
    onFocus: null,
    onBlur: null,
    align: null,
    prepend: null,
    append: null,
    dataList: null,
    inputRef: null,
    className: null,
};

const TextField = ({
    feedback,
    value,
    errors,
    required,
    nativeOnChange,
    type,
    placeholder,
    onChange,
    onFocus,
    onBlur,
    align,
    prepend,
    append,
    dataList,
    inputRef,
    className,
    ...props
}) => {
    const dataListId = useMemo(() => (dataList !== null ? uuid() : null), [dataList]);

    const elProps = {
        ...props,
        ref: inputRef,
        className: classNames([
            styles.inputElement,
            'form-control',
            {
                [className]: className !== null,
                'is-valid': feedback === 'valid',
                'is-invalid': feedback === 'invalid' && errors !== null && errors.length > 0,
            },
        ]),
        onFocus,
        onBlur,
        value: value !== null ? value : '',
        style: { textAlign: align },
        placeholder,
        type,
        required,
        list: dataListId,
        onChange: nativeOnChange
            ? onChange
            : ({ target: { value: newValue = '' } }) =>
                  onChange !== null ? onChange(!isEmpty(newValue) ? newValue : null) : null,
    };

    const { horizontal, ...cleanProps } = elProps;
    const inputElement =
        type !== 'textarea' ? <input {...cleanProps} /> : <textarea {...cleanProps} />;
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

TextField.propTypes = propTypes;
TextField.defaultProps = defaultProps;

export default React.forwardRef((props, ref) => <TextField inputRef={ref} {...props} />);
