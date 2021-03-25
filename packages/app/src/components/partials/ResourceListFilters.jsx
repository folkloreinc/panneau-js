import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Navbar from '../menus/Navbar';

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
    // onSubmit: PropTypes.func,
    withContainer: PropTypes.bool,
    className: PropTypes.string,
};

const defaultProps = {
    filters: ['search'],
    value: null,
    onChange: null,
    // onSubmit: null,
    withContainer: false,
    className: null,
};

const ResourceListFilters = ({
    filters,
    value: initialValue,
    onChange,
    // onSubmit,
    withContainer,
    className,
}) => {
    const [value, setValue] = useState(initialValue);

    // eslint-disable-next-line
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

    const filterElements = filters.map((filter) => <p>{filter}</p>);

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
            {withContainer ? <div className="container">{filterElements}</div> : { filterElements }}
        </Navbar>
    );
};
ResourceListFilters.propTypes = propTypes;
ResourceListFilters.defaultProps = defaultProps;

export default ResourceListFilters;
