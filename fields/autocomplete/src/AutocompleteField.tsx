import classNames from 'classnames';
import isObject from 'lodash-es/isObject';
import isString from 'lodash-es/isString';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Button from '@panneau/element-button';
import TextField from '@panneau/field-text';

import styles from './styles.module.css';

import Fuse from 'fuse.js';

interface AutocompleteItem {
    label?: string;
    value?: number | string;
    image?: {
        url?: string;
        thumbnailUrl?: string;
    };
}

interface AutocompleteValue {
    label?: string;
    value?: number | string;
}

interface SearchOptions {
    isCaseSensitive?: boolean;
    includeScore?: boolean;
    includeMatches?: boolean;
    minMatchCharLength?: number;
    shouldSort?: boolean;
    threshold?: number;
    distance?: number;
}

interface AutocompleteFieldProps {
    items?: AutocompleteItem[];
    value?: string | AutocompleteValue | null;
    textValue?: string | null;
    searchOptions?: SearchOptions;
    maxResults?: number;
    disabled?: boolean;
    showEmpty?: boolean;
    withoutClear?: boolean;
    withoutMatch?: boolean;
    placeholder?: string | null;
    className?: string | null;
    onFocus?: (() => void) | null;
    onBlur?: (() => void) | null;
    onChange?: ((value: AutocompleteValue) => void) | null;
    onTextChange?: ((value: string | null) => void) | null;
    children?: React.ReactNode | null;
}

const DEFAULT_ITEMS: AutocompleteItem[] = [];
const DEFAULT_SEARCH_OPTIONS: SearchOptions = {
    // Search in `label` and in `value` items in an object array
    keys: ['label', 'value'],
};

function AutocompleteField({
    items: providedItems = DEFAULT_ITEMS,
    value: providedValue = null,
    textValue: providedTextValue = null,
    searchOptions = DEFAULT_SEARCH_OPTIONS,
    maxResults = 10,
    disabled = false,
    showEmpty = true,
    placeholder = null,
    withoutClear = false,
    withoutMatch = false,
    className = null,
    onFocus = null,
    onBlur = null,
    onChange = null,
    onTextChange = null,
    children = null,
}: AutocompleteFieldProps) {
    const fuse = useRef<Fuse<AutocompleteItem> | null>(null);
    const [open, setOpen] = useState(false);
    const [focused, setFocused] = useState(false);
    const [showListIcon, setShowListIcon] = useState(false);

    const { label: partialValue = null } = isObject(providedValue) ? providedValue : {};
    const value = isString(providedValue) ? providedValue : partialValue || null;

    const [textValue, setTextValue] = useState(providedTextValue);

    const items = providedItems || [];

    useEffect(() => {
        const options = {
            isCaseSensitive: false,
            includeScore: true,
            includeMatches: true,
            minMatchCharLength: 1,
            shouldSort: true,
            ...searchOptions,
        };
        fuse.current = !withoutMatch ? new Fuse(items, options) : null;
    }, [items, searchOptions, withoutMatch]);

    const list = useMemo(
        () =>
            textValue && fuse.current !== null
                ? fuse.current.search(textValue)
                : items.map((item) => ({
                      item,
                  })), // Wrapped to match fuse results
        [textValue, items],
    );

    const maxedList = maxResults !== null && maxResults > 0 ? list.slice(0, maxResults) : list;

    const onClick = useCallback(
        (e: React.MouseEvent, newValue: AutocompleteValue) => {
            e.preventDefault();
            if (onChange !== null) {
                onChange(newValue);
            }
            const { label } = newValue || {};
            if (label !== null && label !== undefined) {
                setTextValue(label);
            }
            setOpen(false);
        },
        [onChange, setOpen, setTextValue],
    );

    const onFieldFocus = useCallback(() => {
        setShowListIcon(true);
        setOpen(true);
        setFocused(true);
        if (onFocus !== null) {
            onFocus();
        }
    }, [onFocus, setOpen, setFocused, setShowListIcon]);

    const onFieldBlur = useCallback(() => {
        setFocused(false);
        if (onBlur !== null) {
            onBlur();
        }
    }, [onBlur]);

    const onToggleOpen = useCallback(() => {
        setOpen(!open);
    }, [open, setOpen]);

    const onClear = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            setTextValue(null);
            setOpen(false);
        },
        [setTextValue],
    );

    const onInputChange = useCallback(
        (val: string | null) => {
            if (onTextChange !== null) {
                onTextChange(val);
            } else if (setTextValue !== null) {
                setTextValue(val);
            }
            if (val) {
                setOpen(true);
            } else {
                setOpen(showEmpty);
            }
        },
        [setTextValue, setOpen, onTextChange, showEmpty],
    );

    const listClassNames = classNames([
        styles.list,
        'border',
        'rounded',
        'rounded-top-0',
        {
            [styles.focused]: focused,
        },
    ]);

    const listItems =
        children !== null ? (
            <div className={listClassNames}>{children}</div>
        ) : (
            <div className={listClassNames}>
                <ul className="list-group list-group-flush">
                    {maxedList.map(({ item }) => {
                        const { label = null, image = null, value: itemValue = null } = item || {};
                        const { url: imageUrl, thumbnailUrl: imageThumbnailUrl } = image || {};
                        const finalImageUrl = imageThumbnailUrl || imageUrl || null;
                        return (
                            <li
                                className={classNames(['list-group-item', styles.item])}
                                key={`auto-${item.label}`}
                            >
                                <button
                                    type="button"
                                    className={classNames([
                                        'btn',
                                        'd-flex',
                                        'align-items-center',
                                        'border-0',
                                        styles.btn,
                                        { 'color-primary': itemValue === value },
                                    ])}
                                    data-value={item.value}
                                    onClick={(e) => onClick(e, item)}
                                >
                                    {finalImageUrl !== null ? (
                                        <img
                                            src={finalImageUrl}
                                            className={classNames([styles.thumbnail, 'img-fluid'])}
                                            alt={label || ''}
                                        />
                                    ) : null}
                                    {label}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>
        );

    return (
        <div
            className={classNames([
                styles.container,
                {
                    [styles.withClearButton]: !withoutClear,
                    [className]: className !== null,
                },
            ])}
        >
            <TextField
                className={classNames([
                    styles.input,
                    { [styles.open]: open, [styles.empty]: maxedList.length < 1 },
                ])}
                value={textValue}
                placeholder={placeholder}
                onChange={onInputChange}
                disabled={disabled}
                onFocus={onFieldFocus}
                onBlur={onFieldBlur}
            />
            {open && maxedList.length > 0 && !disabled ? listItems : null}
            {!withoutClear && !disabled && value !== null ? (
                <Button className={styles.clear} onClick={onClear} icon="x-circle" />
            ) : null}
            {showListIcon && maxedList.length > 0 && !disabled && value === null ? (
                <Button
                    className={styles.clear}
                    onClick={onToggleOpen}
                    icon={open ? 'caret-up' : 'caret-down'}
                />
            ) : null}
        </div>
    );
}

export default AutocompleteField;
