import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import Button from '@panneau/element-button';
import TextField from '@panneau/field-text';

import styles from './styles.module.scss';

// eslint-disable-next-line import/order
import Fuse from 'fuse.js';

const propTypes = {
    items: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string,
            value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        }),
    ),
    value: PropTypes.string,
    searchOptions: PropTypes.shape({
        isCaseSensitive: PropTypes.bool,
        includeScore: PropTypes.bool,
        includeMatches: PropTypes.bool,
        minMatchCharLength: PropTypes.number,
        shouldSort: PropTypes.bool,
        threshold: PropTypes.number,
        distance: PropTypes.number,
    }),
    maxResults: PropTypes.number,
    disabled: PropTypes.bool,
    showEmpty: PropTypes.bool,
    withoutClear: PropTypes.bool,
    placeholder: PropTypes.string,
    className: PropTypes.string,
    onChange: PropTypes.func,
    children: PropTypes.node,
};

const defaultProps = {
    items: [],
    value: null,
    searchOptions: {
        // Search in `label` and in `value` items in an object array
        keys: ['label', 'value'],
    },
    maxResults: 10,
    disabled: false,
    showEmpty: true,
    placeholder: null,
    withoutClear: false,
    className: null,
    onChange: null,
    children: null,
};

const AutocompleteField = ({
    items,
    value,
    searchOptions,
    maxResults,
    disabled,
    showEmpty,
    placeholder,
    withoutClear,
    className,
    onChange,
    children,
}) => {
    const fuse = useRef(null);
    const [open, setOpen] = useState(false);
    const [showListIcon, setShowListIcon] = useState(false);

    useEffect(() => {
        const options = {
            isCaseSensitive: false,
            includeScore: true,
            includeMatches: true,
            minMatchCharLength: 1,
            shouldSort: true,
            ...searchOptions,
        };
        fuse.current = new Fuse(items, options);
    }, [items, searchOptions]);

    const list =
        value && fuse.current !== null
            ? fuse.current.search(value)
            : items.map((item) => ({
                  item,
              }));

    const maxedList = maxResults > 0 ? list.slice(0, maxResults) : list;

    const onClick = useCallback(
        (e) => {
            e.preventDefault();
            if (e.target.dataset.value) {
                onChange(e.target.dataset.value);
                setOpen(false);
            }
        },
        [onChange],
    );

    const onFocus = useCallback(() => {
        setShowListIcon(true);
    }, [setShowListIcon]);

    const onToggleOpen = useCallback(() => {
        setOpen(!open);
    }, [open, setOpen]);

    const onClear = useCallback(
        (e) => {
            e.stopPropagation();
            onChange(null);
            setOpen(false);
        },
        [onChange],
    );

    const onInputChange = useCallback(
        (val) => {
            onChange(val);
            if (val) {
                setOpen(true);
            } else {
                setOpen(showEmpty);
            }
        },
        [onChange, showEmpty],
    );

    const listItems =
        children !== null ? (
            <div className={styles.list}>{children}</div>
        ) : (
            <div className={styles.list}>
                <ul className="list-group">
                    {maxedList.map(({ item }) => (
                        <li
                            className={classNames(['list-group-item', styles.item])}
                            key={`auto-${item.label}`}
                        >
                            <button
                                type="button"
                                className={classNames(['btn', styles.btn])}
                                data-value={item.label}
                                onClick={onClick}
                            >
                                {item.label}
                            </button>
                        </li>
                    ))}
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
                className={styles.input}
                value={value}
                placeholder={placeholder}
                onChange={onInputChange}
                disabled={disabled}
                onFocus={onFocus}
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
};

AutocompleteField.propTypes = propTypes;
AutocompleteField.defaultProps = defaultProps;

export default AutocompleteField;
