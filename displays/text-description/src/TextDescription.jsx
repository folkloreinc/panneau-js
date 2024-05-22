/* eslint-disable react/jsx-no-useless-fragment */
import classNames from 'classnames';
import get from 'lodash-es/get';
import isObject from 'lodash-es/isObject';
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
    selected: PropTypes.bool,
    className: PropTypes.string,
};

const defaultProps = {
    value: null,
    placeholder: null,
    item: null,
    descriptionPath: null,
    descriptionValues: null,
    locale: null,
    selected: false,
    className: null,
};

const TextDescription = ({
    value: initialValue,
    placeholder,
    locale: parentLocale,
    item,
    descriptionPath,
    descriptionValues,
    selected,
    className,
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
        <div
            className={classNames([
                {
                    [className]: className !== null,
                },
            ])}
        >
            <p className="d-block m-0 p-0 lh-sm">{value || placeholder}</p>
            <p
                className={classNames([
                    'd-block m-0 p-0 text-opacity-50 lh-sm',
                    {
                        'text-body': !selected,
                    },
                ])}
            >
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
