/* eslint-disable react/jsx-props-no-spreading */
import { useFiltersComponents, usePanneauColorScheme } from '@panneau/core/contexts';
import { getComponentFromName } from '@panneau/core/utils';
import Button from '@panneau/element-button';
import Navbar from '@panneau/element-navbar';
import FormGroup from '@panneau/element-form-group';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';

const propTypes = {
    filters: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            component: PropTypes.string.isRequired,
        }),
    ),
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func,
    withContainer: PropTypes.bool,
    withReset: PropTypes.bool,
    className: PropTypes.string,
};

const defaultProps = {
    filters: [],
    value: null,
    onChange: null,
    withContainer: false,
    withReset: false,
    className: null,
};

const ResourceFilters = ({ filters, value, onChange, withContainer, withReset, className }) => {
    const FilterComponents = useFiltersComponents();
    const { background } = usePanneauColorScheme();

    const onReset = useCallback(() => {
        if (onChange !== null) {
            onChange(null);
        }
    }, [onChange]);

    return (
        <Navbar
            className={classNames([
                {
                    'navbar-expand-md': withContainer,
                    [className]: className !== null,
                },
                'justify-content-start',
                'align-items-start',
            ])}
            theme={background}
            withoutCollapse
        >
            {filters.map(({ id, component, ...filterProps }, index) => {
                const FilterComponent = getComponentFromName(component, FilterComponents, null);
                return FilterComponent !== null ? (
                    <FormGroup label={filterProps.label}>
                        <FilterComponent
                            {...filterProps}
                            key={`filter-${id}-${index + 1}`}
                            id={id}
                            value={value}
                            onChange={onChange}
                        />
                    </FormGroup>
                ) : null;
            })}
            {withReset ? (
                <Button theme="primary" onClick={onReset}>
                    <FormattedMessage defaultMessage="Reset" description="Button label" />
                </Button>
            ) : null}
        </Navbar>
    );
};

ResourceFilters.propTypes = propTypes;
ResourceFilters.defaultProps = defaultProps;

export default ResourceFilters;
