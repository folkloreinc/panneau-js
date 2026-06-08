import classNames from 'classnames';
import isArray from 'lodash-es/isArray';
import { type ReactNode, useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import type { Filter } from '@panneau/core';
import { useFiltersComponents } from '@panneau/core/contexts';
import { getComponentFromName } from '@panneau/core/utils';
import Button from '@panneau/element-button';
import FormGroup from '@panneau/element-form-group';
import Icon from '@panneau/element-icon';
import Navbar from '@panneau/element-navbar';

import styles from './styles.module.css';

interface FiltersProps {
    onChange?: ((value: Record<string, unknown> | null) => void) | null;
    onClear?: ((value: null) => void) | null;
    filters?: Filter[];
    value?: Record<string, unknown> | null;
    clearValue?: Record<string, unknown> | null;
    withContainer?: boolean;
    withReset?: boolean;
    withResetLabel?: boolean;
    defaultValue?: Record<string, unknown> | null;
    className?: string | null;
    children?: ReactNode | null;
}

const DEFAULT_FILTERS: Filter[] = [];

function Filters({
    onChange = null,
    onClear = null,
    filters = DEFAULT_FILTERS,
    value = null,
    clearValue = null,
    withContainer = false,
    withReset = true,
    withResetLabel = false,
    defaultValue: initialDefaultValue = null,
    className = null,
    children = null,
}: FiltersProps) {
    const FilterComponents = useFiltersComponents();
    const currentFilters = filters || [];
    const defaultValue = useMemo(
        () => initialDefaultValue || { page: null },
        [initialDefaultValue],
    );

    const onFiltersReset = useCallback(() => {
        if (onClear !== null) {
            onClear(null);
        }
        if (onChange !== null) {
            onChange(null);
        }
    }, [onClear, onChange]);

    const hasActiveFilter = (currentFilters || []).reduce((isActive, item) => {
        const activeValue = clearValue || value || null;
        if (activeValue !== null && typeof activeValue[item.name || ''] !== 'undefined') {
            if (isArray(activeValue[item.name || ''])) {
                return (activeValue[item.name || ''] as unknown[]).length > 0;
            }
            return activeValue[item.name || ''] !== null;
        }
        return isActive;
    }, false);

    const onFilterChange = useCallback(
        (name: string, newFilterValue: unknown) => {
            if (name !== null && onChange !== null) {
                onChange({ ...value, [name]: newFilterValue, ...defaultValue });
            }
        },
        [onChange, value, defaultValue],
    );

    const onFilterClear = useCallback(
        (name: string) => {
            if (name !== null && onChange !== null) {
                const { [name]: _oldName, ...newValue } = value || {};
                onChange({ ...newValue, ...defaultValue });
            }
        },
        [onChange, value, defaultValue],
    );

    const withButton = withReset && hasActiveFilter && currentFilters.length > 0;

    return (
        <Navbar
            className={classNames([
                'gap-2',
                'align-items-start',
                'justify-content-start',
                {
                    'navbar-expand-md': withContainer,
                },
                className,
            ])}
            withoutCollapse
        >
            {(currentFilters || []).map(
                ({ component, name, groupLabel, groupClassName, ...filterProps }, index) => {
                    const FilterComponent = getComponentFromName(component, FilterComponents, null);
                    const filterValue = value !== null && name && value[name] ? value[name] : null;
                    const withSize = component === 'select' || component === 'search';
                    return FilterComponent !== null ? (
                        <FormGroup
                            key={`filter-${name}-${index + 1}`}
                            label={groupLabel}
                            className={classNames([
                                'nav-item',
                                {
                                    [styles.select]: withSize,
                                    [styles.last]:
                                        currentFilters.length < 3 &&
                                        index === currentFilters.length - 1 &&
                                        name === 'search',
                                },
                                groupClassName,
                            ])}
                        >
                            <FilterComponent
                                {...filterProps}
                                value={filterValue}
                                onChange={(newValue: unknown) =>
                                    onFilterChange(name || '', newValue)
                                }
                                onClear={() => onFilterClear(name || '')}
                                className={component === 'select' ? 'mw-100' : null}
                            />
                        </FormGroup>
                    ) : null;
                },
            )}
            {withButton && (currentFilters || []).length > 1 ? (
                <Button size="md" theme="secondary" outline onClick={onFiltersReset}>
                    {withResetLabel ? (
                        <span className="me-2">
                            <FormattedMessage defaultMessage="Clear" description="Button label" />
                        </span>
                    ) : null}
                    <Icon name="x-circle" />
                </Button>
            ) : null}
            {children}
        </Navbar>
    );
}

export default Filters;
