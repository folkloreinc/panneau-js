/* eslint-disable react/jsx-props-no-spreading */
import { faUndo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useFiltersComponents, usePanneauColorScheme } from '@panneau/core/contexts';
import { getComponentFromName } from '@panneau/core/utils';
import Button from '@panneau/element-button';
import FormGroup from '@panneau/element-form-group';
import Navbar from '@panneau/element-navbar';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

const propTypes = {
    filters: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            component: PropTypes.string.isRequired,
        }),
    ),
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func,
    onReset: PropTypes.func,
    withContainer: PropTypes.bool,
    withReset: PropTypes.bool,
    className: PropTypes.string,
};

const defaultProps = {
    filters: [],
    value: null,
    onChange: null,
    onReset: null,
    withContainer: false,
    withReset: true,
    className: null,
};

const ResourceFilters = ({
    filters,
    value,
    onChange,
    onReset,
    withContainer,
    withReset,
    className,
}) => {
    const FilterComponents = useFiltersComponents();
    const { background } = usePanneauColorScheme();

    const onFiltersReset = useCallback(() => {
        if (onReset !== null) {
            onReset(null);
        }
    }, [onReset]);

    const hasActiveFilter = filters.reduce((isActive, item) => {
        if (value !== null && value[item.name]) {
            return true;
        }
        return isActive;
    }, false);

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
            {filters.map(({ component, name, ...filterProps }, index) => {
                const FilterComponent = getComponentFromName(component, FilterComponents, null);
                const filterValue = value !== null && value[name] ? value[name] : null;
                const onFilterChange = useCallback(
                    (newFilterValue) => {
                        if (name !== null && onChange !== null) {
                            onChange({ ...value, [name]: newFilterValue });
                        }
                    },
                    [onChange, name],
                );

                return FilterComponent !== null ? (
                    <FormGroup
                        key={`filter-${name}-${index + 1}`}
                        label={filterProps.label}
                        className="me-4"
                    >
                        <FilterComponent
                            {...filterProps}
                            value={filterValue}
                            onChange={onFilterChange}
                        />
                    </FormGroup>
                ) : null;
            })}
            {withReset && hasActiveFilter ? (
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
