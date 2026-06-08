import classNames from 'classnames';
import isEmpty from 'lodash-es/isEmpty';
import isString from 'lodash-es/isString';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { copyToClipboard } from '@panneau/core/utils';
import Button from '@panneau/element-button';
import Icon from '@panneau/element-icon';
import TextField from '@panneau/field-text';

function getScheme(url: string | null, schemesPattern: RegExp): string | null {
    const match = url !== null && isString(url) ? url.match(schemesPattern) : null;
    return match !== null && match[1].length !== url!.length ? match[1].toLowerCase() : null;
}

function removeScheme(url: string | null, schemesPattern: RegExp): string | null {
    return url !== null && isString(url) ? url.replace(schemesPattern, '') : null;
}

function withScheme(url: string | null, prefix: string, schemesPattern: RegExp): string | null {
    return url !== null && isString(url) && !url.match(schemesPattern) ? `${prefix}${url}` : url;
}

interface UrlFieldProps {
    name?: string | null;
    value?: string | null;
    schemes?: string[];
    url?: string | null;
    disabled?: boolean | null;
    prepend?: string | null;
    append?: string | null;
    preview?: boolean;
    copy?: boolean;
    className?: string | null;
    onChange?: ((value: string | null) => void) | null;
    [key: string]: unknown;
}

const DEFAULT_SCHEMES = ['https://', 'http://'];

function UrlField({
    name = null,
    value = null,
    schemes = DEFAULT_SCHEMES,
    url = null,
    disabled = null,
    prepend = null,
    append = null,
    preview = false,
    copy = false,
    className = null,
    onChange = null,
    ...props
}: UrlFieldProps) {
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
        (newValue: string | null) => {
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
        (sch: string) => {
            setOpen(false);
            const newValueWithScheme = !isEmpty(value)
                ? withScheme(valueWithoutScheme, sch, schemesPattern)
                : null;
            if (onChange !== null) {
                onChange(newValueWithScheme);
            }
        },
        [open, setOpen, schemesPattern, valueWithoutScheme, onChange, value],
    );

    const onClickCopy = useCallback(() => {
        copyToClipboard(valueWithoutScheme);
    }, [valueWithoutScheme]);

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
                    onClick={!disabled && !empty ? onClickOpen : undefined}
                    disabled={disabled || undefined}
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
                                disabled={disabled || undefined}
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

    const partialAppend = preview ? (
        // eslint-disable-next-line jsx-a11y/control-has-associated-label
        <a
            href={value !== null ? `${finalPrepend}${valueWithoutScheme}` : undefined}
            className="input-group-text"
            target="_blank"
            rel="noopener noreferrer"
        >
            <Icon name="eye-fill" />
        </a>
    ) : (
        append
    );

    const finalAppend = copy ? (
        <div className="input-group-text p-0">
            <Button size="sm" onClick={onClickCopy}>
                <Icon name="clipboard" />
            </Button>
        </div>
    ) : (
        partialAppend
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
}

export default UrlField;
