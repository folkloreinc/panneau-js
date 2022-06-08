/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback, useState } from 'react';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import isNaN from 'lodash/isNaN';
import isNumber from 'lodash/isNumber';
import PropTypes from 'prop-types';
import TextField from '@panneau/field-text';
import styles from './styles.module.scss';

const propTypes = {
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    step: PropTypes.number,
    floatStep: PropTypes.number,
    float: PropTypes.bool,
    dataList: PropTypes.arrayOf(PropTypes.number),
    autoComplete: PropTypes.bool,
    className: PropTypes.string,
    onChange: PropTypes.func,
};

const defaultProps = {
    value: null,
    step: 1,
    floatStep: 0.1,
    float: false,
    dataList: null,
    autoComplete: false,
    className: null,
    onChange: null,
};

function isNumeric(str) {
    if (typeof str !== 'string') return false; // we only process strings!
    return (
        !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str))
    );
}

const NumberField = ({
    value,
    step,
    floatStep,
    float,
    dataList,
    autoComplete,
    className,
    onChange,
    ...props
}) => {
    const parseValue = useCallback(
        (newValue) => {
            if (newValue !== null) {
                if (float) {
                    return newValue;
                }
                if (isNumber(newValue)) {
                    return newValue;
                }
                if (isNumeric(newValue)) {
                    return float ? parseFloat(newValue) : parseInt(newValue, 10);
                }
            }
            return null;
        },
        [float],
    );

    const onInputChange = useCallback(
        (val) => {
            if (onChange !== null) {
                if (float) {
                    onChange(val !== null && val.length > 0 ? val : null);
                } else {
                    onChange(val !== null && val.length > 0 ? parseValue(val) : null);
                }
                onChange(val !== null && val.length > 0 ? parseValue(val) : null);
            }
        },
        [onChange, float],
    );

    // Datalist

    const hasDataList = dataList !== null;
    const [dataListActive, setDataListActive] = useState(false);

    const onInputFocus = useCallback(() => {
        if (hasDataList) {
            setDataListActive(true);
        }
    }, [setDataListActive, hasDataList]);

    const onInputBlur = useCallback(() => {
        if (hasDataList && dataListActive) {
            setDataListActive(false);
        }
    }, [setDataListActive, hasDataList, dataListActive]);

    const onDataListClick = useCallback(
        (dataListValue) => {
            if (onChange !== null && dataListValue !== null) {
                onChange(parseValue(dataListValue));
                setDataListActive(false);
            }
        },
        [onChange, setDataListActive],
    );

    return (
        <div className={classNames([styles.container, { [className]: className !== null }])}>
            <TextField
                type="number"
                className={styles.input}
                value={value !== null ? `${value}` : ''}
                step={float ? floatStep : step}
                autoComplete={autoComplete ? 'on' : 'off'}
                onChange={onInputChange}
                onFocus={onInputFocus}
                onBlur={onInputBlur}
                {...props}
            />
            {hasDataList ? (
                <div className={styles.arrow}>
                    <FontAwesomeIcon className={styles.arrowIcon} icon={faChevronDown} />
                </div>
            ) : null}
            {hasDataList && dataListActive ? (
                <ul className={styles.dataListItems}>
                    {dataList.map((dataListValue) => (
                        <li key={`data-list-${dataListValue}`} className={styles.dataListItem}>
                            <button
                                className={styles.dataListItemButton}
                                type="button"
                                onTouchStart={() => {
                                    onDataListClick(dataListValue);
                                }}
                                onMouseDown={() => {
                                    onDataListClick(dataListValue);
                                }}
                            >
                                {dataListValue}
                            </button>
                        </li>
                    ))}
                </ul>
            ) : null}
        </div>
    );
};

NumberField.propTypes = propTypes;
NumberField.defaultProps = defaultProps;

export default NumberField;
