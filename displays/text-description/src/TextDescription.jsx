/* eslint-disable react/jsx-no-useless-fragment */
import get from 'lodash/get';
import isObject from 'lodash/isObject';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';

const propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    placeholder: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    item: PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) }),
    descriptionPath: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    descriptionValues: PropTypes.object,
    locale: PropTypes.string,
};

const defaultProps = {
    value: null,
    placeholder: null,
    item: null,
    descriptionPath: null,
    descriptionValues: null,
    locale: null,
};

const TextDescription = ({
    value: initialValue,
    placeholder,
    locale: parentLocale,
    item,
    descriptionPath,
    descriptionValues,
}) => {
    const { locale } = useIntl();

    const { value, label } = useMemo(() => {
        const partialValue =
            initialValue !== null && isObject(initialValue)
                ? initialValue[parentLocale || locale] || null
                : initialValue;

        const labelValue = get(item, descriptionPath);
        const partialLabel =
            labelValue !== null && isObject(descriptionValues)
                ? descriptionValues[labelValue] || null
                : labelValue;
        return {
            value: partialValue,
            label: partialLabel,
        };
    }, [initialValue, descriptionPath, descriptionValues, item, locale, parentLocale]);

    return label !== null ? (
        <div>
            <p className="d-block m-0 p-0">{value || placeholder}</p>
            <p className="d-block m-0 p-0 text-secondary text-opacity-75 lh-sm">
                <small>{label}</small>
            </p>
        </div>
    ) : (
        <>{value || placeholder}</>
    );
};

TextDescription.propTypes = propTypes;
TextDescription.defaultProps = defaultProps;

export default TextDescription;
