import isEmpty from 'lodash-es/isEmpty';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';

import { KEYCODES, useKeyboardKeys } from '@panneau/core/hooks';
import Button from '@panneau/element-button';
import Icon from '@panneau/element-icon';
import TextField from '@panneau/field-text';

interface SearchFilterProps {
    name?: string;
    value?: string | null;
    onChange: (value: string | null) => void;
    onClear?: (() => void) | null;
    placeholder?: string | null;
    position?: string | null;
    width?: number | null;
    delay?: number;
    className?: string | null;
}

function SearchFilter({
    name = 'q',
    value = null,
    onChange = null,
    onClear: initialOnClear = null,
    placeholder = null,
    position = null,
    width = null,
    delay = 500,
    className = null,
}: SearchFilterProps) {
    const intl = useIntl();

    const [searchValue, setSearchValue] = useState<string | null>(value);
    const hasChanged = useRef<boolean | null>(null);

    const onInputChange = useCallback(
        (newValue: string) => {
            setSearchValue(newValue !== '' ? newValue : null);
            hasChanged.current = true;
        },
        [setSearchValue],
    );

    const onValueChange = useCallback(
        (newValue: string | null) => {
            setSearchValue(newValue !== '' ? newValue : null);
            hasChanged.current = false;
        },
        [setSearchValue],
    );

    const onSubmit = useCallback(
        (e: FormEvent) => {
            e.preventDefault();
            hasChanged.current = false;
            if (onChange !== null) {
                onChange(searchValue);
            }
        },
        [searchValue, onChange],
    );

    const onClear = useCallback(() => {
        setSearchValue(null);
        hasChanged.current = false;
        if (initialOnClear !== null) {
            initialOnClear();
        }
    }, [initialOnClear, setSearchValue]);

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout> | null = null;
        if (hasChanged.current && delay !== null) {
            timeout = setTimeout(() => {
                onChange(searchValue);
                hasChanged.current = false;
            }, delay);
        }
        return () => {
            if (timeout !== null) {
                clearTimeout(timeout);
            }
        };
    }, [searchValue, onChange, delay]);

    // Keep in sync
    useEffect(() => {
        onValueChange(value);
    }, [value, onValueChange]);

    const active = !isEmpty(value);
    const canClear = !isEmpty(searchValue);

    useKeyboardKeys({
        [KEYCODES.ESCAPE]: onClear,
    });

    return (
        <form className={className || undefined} onSubmit={onSubmit}>
            <div className="input-group flex-nowrap">
                {position === 'left' ? (
                    <Button
                        theme={active ? 'primary' : 'secondary'}
                        type="submit"
                        onClick={onSubmit}
                        style={{ zIndex: 0 }}
                    >
                        <Icon name="search" bold />
                    </Button>
                ) : null}
                <TextField
                    type="search"
                    name={name}
                    value={searchValue}
                    theme="light"
                    onChange={onInputChange}
                    placeholder={
                        placeholder ||
                        intl.formatMessage({
                            defaultMessage: 'Search',
                            description: 'Filter label',
                        })
                    }
                    style={{
                        width: width !== null ? width - 42 : undefined,
                    }}
                />
                {canClear ? (
                    <Button
                        type="button"
                        onClick={onClear}
                        className="position-absolute top-0 me-0 border-0"
                        outline={false}
                        style={{
                            zIndex: 10,
                            right: position !== 'left' ? `40px` : 0,
                        }}
                    >
                        <Icon name="x-circle" />
                    </Button>
                ) : null}
                {position !== 'left' ? (
                    <Button
                        theme={active ? 'primary' : 'secondary'}
                        type="submit"
                        onClick={onSubmit}
                        style={{ zIndex: 0 }}
                    >
                        <Icon name="search" bold />
                    </Button>
                ) : null}
            </div>
        </form>
    );
}

export default SearchFilter;
