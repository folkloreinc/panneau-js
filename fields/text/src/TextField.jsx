/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import classNames from 'classnames';
import ReactQuill from 'react-quill';

import InputGroup from './InputGroup';

import styles from './styles.module.scss';

const propTypes = {
    feedback: PropTypes.oneOf(['valid', 'invalid', 'loading']),
    value: PropTypes.string,
    errors: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    required: PropTypes.bool,

    type: PropTypes.oneOf(['text', 'email', 'tel', 'password', 'url', 'textarea', 'rtf']),
    placeholder: PropTypes.string,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,

    align: PropTypes.oneOf(['left', 'center', 'right']),
    prefix: PropTypes.node,
    suffix: PropTypes.node,

    className: PropTypes.string,
};

const defaultProps = {
    feedback: null,
    value: null,
    errors: null,
    required: false,

    type: null,
    placeholder: null,
    onChange: null,
    onFocus: null,
    onBlur: null,

    align: null,
    prefix: null,
    suffix: null,

    className: null,
};

const TextField = ({
    feedback,
    value,
    errors,
    required,

    type,
    placeholder,
    onChange,
    onFocus,
    onBlur,

    align,
    prefix,
    suffix,

    className,
}) => {
    const elProps = {
        className: classNames([
            styles.container,
            'form-control',
            {
                [className]: className !== null,
                'is-valid': feedback === 'valid',
                'is-invalid': feedback === 'invalid' && errors !== null && errors.length > 0,
            },
        ]),

        onFocus,
        onBlur,
        value: value !== null ? value : null,
        style: { textAlign: align },
        onChange: ({ target: { value: newValue = '' } }) =>
            onChange !== null ? onChange(!isEmpty(newValue) ? newValue : null) : null,
    };

    const inputProps = { ...elProps, type, required, placeholder };

    return (
        <InputGroup prefix={prefix} suffix={suffix}>
            {type === 'rtf' ? (
                <ReactQuill {...elProps} />
            ) : (
                <>
                    {type === 'textarea' ? <input {...inputProps} /> : <textarea {...inputProps} />}
                </>
            )}
        </InputGroup>
    );
};

TextField.propTypes = propTypes;
TextField.defaultProps = defaultProps;

export default TextField;
