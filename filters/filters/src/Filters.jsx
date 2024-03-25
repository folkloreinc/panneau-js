/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useFiltersComponents } from '@panneau/core/contexts';
import { getComponentFromName } from '@panneau/core/utils';
import Button from '@panneau/element-button';
import FormGroup from '@panneau/element-form-group';
import Icon from '@panneau/element-icon';
import Navbar from '@panneau/element-navbar';

const propTypes = {
    filters: PanneauPropTypes.filters,
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func,
    onReset: PropTypes.func,
    withContainer: PropTypes.bool,
    withReset: PropTypes.bool,
    withGrid: PropTypes.bool,
    defaultValue: PropTypes.objectOf(PropTypes.object), // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,
};

const defaultProps = {
    filters: [],
    value: null,
    onChange: null,
    onReset: null,
    withContainer: false,
    withReset: true,
    withGrid: false,
    defaultValue: { page: null },
    className: null,
};

const Filters = ({
    filters,
    value,
    onChange,
    onReset,
    withContainer,
    withReset,
    withGrid,
    defaultValue,
    className,
}) => {
    const FilterComponents = useFiltersComponents();
    const currentFilters = filters || [];

    const onFiltersReset = useCallback(() => {
        if (onReset !== null) {
            onReset(null);
        }
        if (onChange !== null) {
            onChange(null);
        }
    }, [onReset]);

    const hasActiveFilter = (currentFilters || []).reduce((isActive, item) => {
        if (value !== null && value[item.name]) {
            return true;
        }
        return isActive;
    }, false);

    const onFilterChange = useCallback(
        (name, newFilterValue) => {
            if (name !== null && onChange !== null) {
                onChange({ ...value, [name]: newFilterValue, ...defaultValue });
            }
        },
        [onChange, value, defaultValue],
    );

    const onFilterClear = useCallback(
        (name) => {
            if (name !== null && onChange !== null) {
                const { [name]: oldName, ...newValue } = value || {};
                onChange({ ...newValue, ...defaultValue });
            }
        },
        [onChange, value, defaultValue],
    );

    return (
        <Navbar
            className={classNames([
                {
                    'navbar-expand-md': withContainer,
                    [className]: className !== null,
                },
            ])}
            withoutCollapse
        >
            <div className="row row-cols-3 w-100">
                {currentFilters.map(({ component, name, groupLabel, ...filterProps }, index) => {
                    const FilterComponent = getComponentFromName(component, FilterComponents, null);
                    const filterValue = value !== null && value[name] ? value[name] : null;
                    return FilterComponent !== null ? (
                        <FormGroup
                            key={`filter-${name}-${index + 1}`}
                            label={groupLabel}
                            className="position-relative col mb-3"
                        >
                            <FilterComponent
                                {...filterProps}
                                value={filterValue}
                                onChange={(newValue) => onFilterChange(name, newValue)}
                                onClear={() => onFilterClear(name)}
                                className={component === 'select' ? 'mw-100' : null}
                            />
                        </FormGroup>
                    ) : null;
                })}
                {withReset && hasActiveFilter && currentFilters.length > 0 ? (
                    <div className="col mb-3">
                        <Button theme="primary" onClick={onFiltersReset}>
                            <Icon name="arrow-counterclockwise" bold />
                        </Button>
                    </div>
                ) : null}
            </div>
        </Navbar>
    );
};

Filters.propTypes = propTypes;
Filters.defaultProps = defaultProps;

export default Filters;
