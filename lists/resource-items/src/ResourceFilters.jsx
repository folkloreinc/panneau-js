/* eslint-disable react/jsx-props-no-spreading */
import { faUndo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import { useFiltersComponents, usePanneauColorScheme } from '@panneau/core/contexts';
import { getComponentFromName } from '@panneau/core/utils';
import Button from '@panneau/element-button';
import FormGroup from '@panneau/element-form-group';
import Navbar from '@panneau/element-navbar';

const propTypes = {
    filters: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string,
            component: PropTypes.string.isRequired,
        }),
    ),
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func,
    onReset: PropTypes.func,
    withContainer: PropTypes.bool,
    withReset: PropTypes.bool,
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
    defaultValue: { page: null },
    className: null,
};

const ResourceFilters = ({
    filters,
    value,
    onChange,
    onReset,
    withContainer,
    withReset,
    defaultValue,
    className,
}) => {
    const FilterComponents = useFiltersComponents();
    const { background } = usePanneauColorScheme();
    const currentFilters = filters || [];

    const onFiltersReset = useCallback(() => {
        if (onReset !== null) {
            onReset(null);
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
                'justify-content-start',
                'align-items-start',
                'flex-column',
                'flex-md-row',
            ])}
            theme={background}
            withoutCollapse
        >
            {currentFilters.map(({ component, name, groupLabel, ...filterProps }, index) => {
                const FilterComponent = getComponentFromName(component, FilterComponents, null);
                const filterValue = value !== null && value[name] ? value[name] : null;
                return FilterComponent !== null ? (
                    <FormGroup
                        key={`filter-${name}-${index + 1}`}
                        label={groupLabel}
                        className="mb-3 me-3"
                    >
                        <FilterComponent
                            {...filterProps}
                            value={filterValue}
                            onChange={(newValue) => onFilterChange(name, newValue)}
                            onClear={() => onFilterClear(name)}
                        />
                    </FormGroup>
                ) : null;
            })}
            {withReset && hasActiveFilter && currentFilters.length > 0 ? (
                <Button theme="primary" onClick={onFiltersReset}>
                    <FontAwesomeIcon icon={faUndo} />
                </Button>
            ) : null}
        </Navbar>
    );
};

ResourceFilters.propTypes = propTypes;
ResourceFilters.defaultProps = defaultProps;

export default ResourceFilters;
