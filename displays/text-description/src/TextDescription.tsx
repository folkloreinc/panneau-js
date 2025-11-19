/* eslint-disable react/jsx-no-useless-fragment */
import classNames from 'classnames';
import get from 'lodash-es/get';
import isObject from 'lodash-es/isObject';
import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';

interface TextDescriptionProps {
    value?: string | Record<string, unknown> | null;
    placeholder?: React.ReactNode | null;
    item?: { id: string | number } | null;
    descriptionPath?: string | null;
    descriptionValues?: Record<string, unknown> | null;
    locale?: string | null;
    selected?: boolean;
    className?: string | null;
}

function TextDescription({
    value: initialValue = null,
    placeholder = null,
    locale: parentLocale = null,
    item = null,
    descriptionPath = null,
    descriptionValues = null,
    selected = false,
    className = null,
}: TextDescriptionProps) {
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
                    [className!]: className !== null,
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
}

export default TextDescription;
