import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';

import { useFiltersComponents } from '@panneau/core/contexts';
import { getComponentFromName } from '@panneau/core/utils';

import Button from '@panneau/element-button';
import Navbar from '@panneau/element-navbar';

const getValueWithout = (value, withoutKey) =>
    value !== null
        ? {
              ...Object.keys(value).reduce(
                  (newValueMap, key) =>
                      key !== withoutKey
                          ? {
                                ...newValueMap,
                                [key]: value[key],
                            }
                          : newValueMap,
                  {},
              ),
          }
        : null;

const propTypes = {
    filters: PropTypes.arrayOf(PropTypes.oneOf([''])),
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func,
    onSubmit: PropTypes.func,
    withContainer: PropTypes.bool,
    withReset: PropTypes.bool,
    className: PropTypes.string,
};

const defaultProps = {
    filters: [],
    value: null,
    onChange: null,
    onSubmit: null,
    withContainer: false,
    withReset: false,
    className: null,
};

const ResourceFilters = ({
    filters,
    value: initialValue,
    onChange,
    onSubmit,
    withContainer,
    withReset,
    className,
}) => {
    const FilterComponents = useFiltersComponents();
    const [value, setValue] = useState(initialValue);

    const onFormChange = useCallback(
        (newFieldValue, key) => {
            const newValue =
                newFieldValue !== null
                    ? {
                          ...value,
                          [key]: newFieldValue,
                      }
                    : getValueWithout(value, key);
            setValue(newValue);
            if (onChange !== null) {
                onChange(newValue);
            }
        },
        [value, setValue, onChange],
    );

    const onReset = useCallback(() => {
        setValue(initialValue);
        onChange(initialValue);
    }, [onChange, setValue, initialValue]);

    const filterItems = (filters || []).filter((f) => f !== null);

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
            {filterItems.map(({ id, component }, index) => {
                const FilterComponent = getComponentFromName(component, FilterComponents, null);
                return FilterComponent !== null ? (
                    <FilterComponent key={`filter-${id}-${index + 1}`} onChange={onFormChange} />
                ) : null;
            })}
            {filterItems.length > 0 && onSubmit !== null ? (
                <Button theme="primary" onClick={onSubmit}>
                    <FormattedMessage id="lists.filters.submit" defaultMessage="Submit" />
                </Button>
            ) : null}
            {filterItems.length > 0 && withReset ? (
                <Button theme="primary" onClick={onReset}>
                    <FormattedMessage id="lists.filters.reset" defaultMessage="Reset" />
                </Button>
            ) : null}
        </Navbar>
    );
};

ResourceFilters.propTypes = propTypes;
ResourceFilters.defaultProps = defaultProps;

export default ResourceFilters;
