import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import get from 'lodash/get';
import omit from 'lodash/omit';
import isEmpty from 'lodash/isEmpty';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { FormGroup } from '@panneau/field';

import styles from './styles.scss';

const propTypes = {
    name: PropTypes.string,
    label: PanneauPropTypes.label,
    helpText: PropTypes.string,
    value: PropTypes.object, // eslint-disable-line
    onChange: PropTypes.func,
    locale: PropTypes.string,
    className: PropTypes.string,
    locales: PropTypes.arrayOf(PropTypes.string),
    FieldComponent: PropTypes.oneOfType([PropTypes.instanceOf(Component), PropTypes.func]),
    getFieldProps: PropTypes.func,
    renderField: PropTypes.func,
    children: PropTypes.func,
};

const defaultProps = {
    name: 'locale',
    label: null,
    helpText: null,
    value: null,
    onChange: null,
    locale: null,
    locales: null,
    className: 'form-group-locale',
    FieldComponent: null,
    getFieldProps: null,
    renderField: null,
    children: null,
};

const contextTypes = {
    definition: PanneauPropTypes.definition,
};

const defaultLocales = ['en'];

class LocaleField extends Component {
    constructor(props) {
        super(props);

        this.onLocaleClick = this.onLocaleClick.bind(this);
        this.onFieldChange = this.onFieldChange.bind(this);
        this.renderLocaleField = this.renderLocaleField.bind(this);
        this.renderLocaleButton = this.renderLocaleButton.bind(this);

        const locales = this.getLocales();
        const firstLocale = get(locales, '0', null);
        this.state = {
            locale: props.locale || firstLocale,
        };
    }

    onLocaleClick(e, locale) {
        e.preventDefault();
        this.setState({
            locale,
        });
    }

    onFieldChange(locale, value) {
        const { value: currentValue, onChange } = this.props;
        const newValue = {
            ...currentValue,
            [locale]: value,
        };

        if (onChange !== null) {
            const allValuesNull = Object.values(newValue).reduce(
                (allNull, val) => allNull && val === null,
                true,
            );
            onChange(!allValuesNull ? newValue : null);
        }
    }

    getLocales() {
        const { locales } = this.props;
        if (locales !== null) {
            return locales;
        }
        const { definition } = this.context || {};
        return get(definition || null, 'locales', LocaleField.defaultLocales);
    }

    renderLocaleField(locale, index) {
        const {
            locales,
            value,
            label,
            helpText,
            name,
            onChange,
            renderField,
            children,
            FieldComponent,
            getFieldProps,
            ...props
        } = this.props;

        const { locale: currentLocale } = this.state;
        const key = `input_${name.replace(/[^a-z0-9-]+/gi, '-')}_${locale}`;
        const style = {
            display: currentLocale === locale ? 'block' : 'none',
        };

        const fieldOnChange = val => this.onFieldChange(locale, val);
        const fieldValue = get(value, locale, null);
        const fieldName = `${name}[${locale}]`;
        const fieldProps = {
            ...props,
            onChange: fieldOnChange,
            name: fieldName,
            value: fieldValue,
            withoutMargin: true,
        };
        const customProps = getFieldProps !== null ? getFieldProps(locale, fieldProps) : null;
        const finalProps = {
            ...fieldProps,
            ...customProps,
        };
        const renderFieldMethod = renderField || children || null;
        return (
            <div key={key} className="form-group-locale-field" style={style}>
                {renderFieldMethod !== null ? (
                    renderFieldMethod(locale, finalProps, FieldComponent, index)
                ) : (
                    <FieldComponent {...finalProps} />
                )}
            </div>
        );
    }

    renderLocaleButton(locale) {
        const { value } = this.props;
        const { locale: currentLocale } = this.state;
        const key = `button_${locale}`;
        const hasValue = !isEmpty(get(value, locale));
        const className = classNames({
            btn: true,
            active: currentLocale === locale,
            'btn-warning': !hasValue,
            'btn-outline-secondary': hasValue,
        });

        const onClick = e => this.onLocaleClick(e, locale);

        return (
            <button key={key} type="button" className={className} onClick={onClick}>
                {locale.toUpperCase()}
            </button>
        );
    }

    render() {
        const { label, className, ...props } = this.props;

        const locales = this.getLocales();
        const fields = locales.map(this.renderLocaleField);
        const buttons = locales.map(this.renderLocaleButton);
        const buttonsClassName = classNames({
            'btn-group btn-group-sm': true,
            [styles.btnGroup]: true,
        });
        const labelSuffix = locales.length > 1 ? (
            <span className={buttonsClassName} data-toggle="buttons">
                {buttons}
            </span>
        ) : null;

        const propsWithoutErrors = omit(props, 'errors');

        const groupClassName = classNames({
            [styles.formGroup]: true,
            [styles.withLocales]: locales.length > 1,
            [className]: className !== null,
        });
        return (
            <FormGroup
                label={label}
                labelSuffix={labelSuffix}
                className={groupClassName}
                {...propsWithoutErrors}
            >
                {fields}
            </FormGroup>
        );
    }
}

LocaleField.defaultLocales = defaultLocales;
LocaleField.propTypes = propTypes;
LocaleField.defaultProps = defaultProps;
LocaleField.contextTypes = contextTypes;

export default LocaleField;
