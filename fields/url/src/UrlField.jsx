/* eslint-disable react/jsx-props-no-spreading */
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import isString from 'lodash/isString';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import TextField from '@panneau/field-text';

const getScheme = (url, schemesPattern) => {
    const match = url !== null && isString(url) ? url.match(schemesPattern) : null;
    return match !== null && match[1].length !== url.length ? match[1].toLowerCase() : null;
};

const removeScheme = (url, schemesPattern) =>
    url !== null && isString(url) ? url.replace(schemesPattern, '') : null;

const withScheme = (url, prefix, schemesPattern) =>
    url !== null && isString(url) && !url.match(schemesPattern) ? `${prefix}${url}` : url;

const propTypes = {
    name: PropTypes.string,
    value: PropTypes.string,
    schemes: PropTypes.arrayOf(PropTypes.string),
    url: PropTypes.string,
    disabled: PropTypes.bool,
    prepend: PropTypes.string,
    append: PropTypes.string,
    preview: PropTypes.bool,
    className: PropTypes.string,
    onChange: PropTypes.func,
};

const defaultProps = {
    name: null,
    value: null,
    schemes: ['https://', 'http://', 'tel:', 'mailto:'],
    url: null,
    disabled: null,
    prepend: null,
    append: null,
    preview: false,
    className: null,
    onChange: null,
};

const UrlField = ({
    name,
    value,
    schemes,
    url,
    disabled,
    prepend,
    append,
    preview,
    className,
    onChange,
    ...props
}) => {
    const empty = isEmpty(value);

    const [open, setOpen] = useState(false);
    useEffect(() => {
        setOpen(false);
    }, [value, disabled]);

    const schemesPattern = useMemo(() => new RegExp(`^(${schemes.join('|')})`, 'i'), [schemes]);

    const scheme = useMemo(
        () => getScheme(value, schemesPattern) || schemes[0],
        [value, schemes, schemesPattern],
    );

    const valueWithoutScheme = useMemo(
        () => removeScheme(value, schemesPattern),
        [value, schemesPattern],
    );

    const onFieldChange = useCallback(
        (newValue) => {
            const newValueWithScheme = !isEmpty(newValue)
                ? withScheme(newValue, scheme, schemesPattern)
                : null;

            if (onChange !== null) {
                onChange(newValueWithScheme);
            }
        },
        [onChange, scheme, schemesPattern],
    );

    const onClickOpen = useCallback(() => {
        setOpen(!open);
    }, [open, setOpen]);

    const onClickScheme = useCallback(
        (sch) => {
            setOpen(false);
            const newValueWithScheme = !isEmpty(value)
                ? withScheme(valueWithoutScheme, sch, schemesPattern)
                : null;
            if (onChange !== null) {
                onChange(newValueWithScheme);
            }
        },
        [open, setOpen, schemesPattern, valueWithoutScheme, onChange],
    );

    const finalPrependValue = prepend || url || scheme;

    const finalPrepend =
        prepend === null && url === null ? (
            <>
                <button
                    className={classNames([
                        'btn',
                        'btn-outline-secondary',
                        {
                            show: open,
                            disabled: disabled || empty,
                            'dropdown-toggle': !disabled && !empty,
                            'btn-secondary': disabled || empty,
                        },
                    ])}
                    type="button"
                    aria-expanded={open ? 'false' : 'true'}
                    onClick={!disabled && !empty ? onClickOpen : null}
                >
                    {finalPrependValue}
                </button>
                <ul className={classNames(['dropdown-menu', { show: open }])}>
                    {schemes.map((sch) => (
                        <li key={`${name}-${sch}`}>
                            <button
                                className={classNames([
                                    'dropdown-item',
                                    { active: sch === scheme },
                                ])}
                                type="button"
                                onClick={() => onClickScheme(sch)}
                            >
                                {sch}
                            </button>
                        </li>
                    ))}
                </ul>
            </>
        ) : (
            prepend || url
        );

    const finalAppend = preview ? (
        <a
            href={value !== null ? `${finalPrepend}${valueWithoutScheme}` : null}
            className="input-group-text"
            target="_blank"
            rel="noreferrer"
        >
            <FontAwesomeIcon icon={faEye} />
        </a>
    ) : (
        append
    );

    return (
        <TextField
            {...props}
            className={className}
            value={valueWithoutScheme}
            onChange={onFieldChange}
            prepend={finalPrepend}
            append={finalAppend}
            disabled={disabled}
            type="text"
        />
    );
};

UrlField.propTypes = propTypes;
UrlField.defaultProps = defaultProps;

export default UrlField;
