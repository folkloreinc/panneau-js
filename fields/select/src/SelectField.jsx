import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import classNames from 'classnames';
import { FormGroup } from '@panneau/field';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { isMessage } from '@panneau/core/utils';
import { defineMessages, injectIntl } from 'react-intl';
import {
    AsyncCreatable, Async, Creatable, Select,
} from './vendors';
import styles from './styles.scss';

const messages = defineMessages({
    placeholder: {
        id: 'fields.select.placeholder',
        defaultMessage: 'Select...',
    },
    noOptions: {
        id: 'fields.select.no_options',
        defaultMessage: 'No options',
    },
    loading: {
        id: 'fields.select.loading',
        defaultMessage: 'Loading...',
    },
    create: {
        id: 'fields.select.create',
        defaultMessage: 'Create "{inputValue}"',
    },
    screenReaderStatus: {
        id: 'fields.select.screen_reader_status',
        defaultMessage:
            '{count, plural, =0 {no result} one {# result} other {# results}} available',
    },
});

const compareOption = (inputValue, option) => {
    const candidate = inputValue.toLowerCase();
    return (
        (isString(option.value) && option.value.toLowerCase() === candidate)
        || option.value === candidate
        || (isString(option.label) && option.label.toLowerCase() === candidate)
        || option.label === candidate
    );
};

const valuePropTypes = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.array,
    PropTypes.object,
]);

const propTypes = {
    intl: PanneauPropTypes.intl.isRequired,
    name: PropTypes.string,
    label: PanneauPropTypes.label,
    value: valuePropTypes,
    options: PropTypes.arrayOf(
        PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({
                value: PropTypes.any,
                label: PropTypes.string,
            }),
        ]),
    ),
    getValueFromOption: PropTypes.func,
    getOptionFromValue: PropTypes.func,
    isValidNewOption: PropTypes.func,
    createOption: PropTypes.func,
    onChange: PropTypes.func,
    onNewOption: PropTypes.func,

    inputOnly: PropTypes.bool,
    placeholder: PanneauPropTypes.message,
    noOptionsMessage: PropTypes.oneOfType([PropTypes.func, PanneauPropTypes.intlMessage]),
    loadingMessage: PropTypes.oneOfType([PropTypes.func, PanneauPropTypes.intlMessage]),
    screenReaderStatus: PropTypes.oneOfType([PropTypes.func, PanneauPropTypes.intlMessage]),
    formatCreateLabel: PropTypes.oneOfType([PropTypes.func, PanneauPropTypes.intlMessage]),
    cannotBeEmpty: PropTypes.bool,
    addEmptyOption: PropTypes.bool,
    emptyOption: PropTypes.shape({
        value: valuePropTypes,
        label: PropTypes.string,
    }),
    loadOptions: PropTypes.func,
    fetchOptions: PropTypes.func,
    async: PropTypes.bool,
    multiple: PropTypes.bool,
    disabled: PropTypes.bool,
    notSearchable: PropTypes.bool,
    notClearable: PropTypes.bool,
    creatable: PropTypes.bool,
    style: PropTypes.object, // eslint-disable-line
};

const defaultProps = {
    name: null,
    label: '',
    value: null,
    options: [],
    onChange: null,
    onNewOption: null,

    inputOnly: false,
    getValueFromOption: null,
    getOptionFromValue: null,
    isValidNewOption: null,
    createOption: null,
    cannotBeEmpty: false,
    notSearchable: false,
    notClearable: false,
    creatable: false,
    async: false,
    multiple: false,
    disabled: false,
    loadOptions: null,
    fetchOptions: null,
    placeholder: messages.placeholder,
    noOptionsMessage: messages.noOptions,
    loadingMessage: messages.loading,
    formatCreateLabel: messages.create,
    screenReaderStatus: messages.screenReaderStatus,
    addEmptyOption: false,
    emptyOption: { value: '', label: '--' },
    style: null,
};

/**
 *  Class: SelectField
 *  Makes a select using react-select
 *
 *  Options are using the format [{ label: "", value: "" }]
 *
 *  Note: value is array if multiple select is allowed
 *  @param {string,number,array,object} value
 *  @return {string,array} newValue
 */

class SelectField extends Component {
    constructor(props) {
        super(props);

        this.onInputChange = this.onInputChange.bind(this);
        this.onMenuOpen = this.onMenuOpen.bind(this);
        this.onMenuClose = this.onMenuClose.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onNewOptionClick = this.onNewOptionClick.bind(this);
        this.getValueFromOption = this.getValueFromOption.bind(this);
        this.isValidNewOption = this.isValidNewOption.bind(this);
        this.addLoadedOptions = this.addLoadedOptions.bind(this);
        this.loadOptions = this.loadOptions.bind(this);
        this.importCanceled = false;

        this.state = {
            options: props.options,
            newOptions: [],
            loadedOptions: [],
            inputValue: '',
            menuIsOpen: false,
        };
    }

    componentWillReceiveProps({ options: nextOptions }) {
        const { options } = this.props;
        const optionsChanged = options !== nextOptions;
        if (optionsChanged) {
            this.setState({
                options: nextOptions,
            });
        }
    }

    componentWillUnmount() {
        this.importCanceled = true;
    }

    onInputChange(value) {
        this.setState({
            inputValue: value,
        });
    }

    onMenuOpen() {
        this.setState({
            menuIsOpen: true,
        });
    }

    onMenuClose() {
        this.setState({
            menuIsOpen: false,
        });
    }

    onNewOptionClick(optionLabel) {
        const {
            multiple, value, onNewOption, onChange,
        } = this.props;
        if (onNewOption !== null) {
            onNewOption(optionLabel);
            return;
        }

        const option = this.createOption(optionLabel);

        this.setState(({ newOptions }) => ({
            newOptions: [...newOptions, option],
        }));

        let newValue;
        if (multiple) {
            newValue = (value || []).concat([option]).map(this.getValueFromOption);
        } else {
            newValue = this.getValueFromOption(option);
        }
        if (onChange !== null) {
            onChange(newValue);
        }
    }

    onChange(value) {
        const {
            multiple, notClearable, cannotBeEmpty, onChange,
        } = this.props;
        let newValue;
        if (multiple && value === null) {
            newValue = null;
        } else if (multiple && value.length === 0 && !notClearable) {
            newValue = null;
        } else if (multiple) {
            newValue = value.map(this.getValueFromOption);
        } else {
            newValue = this.getValueFromOption(value);
        }

        if (cannotBeEmpty && newValue === null) {
            const selectOptions = this.getOptions();
            newValue = selectOptions.length > 0 ? this.getValueFromOption(selectOptions[0]) : null;
        }

        if (onChange !== null) {
            onChange(newValue);
        }
    }

    getSelectComponent() {
        const { async, creatable } = this.props;
        if (async && creatable) {
            return AsyncCreatable;
        }
        if (async) {
            return Async;
        }
        if (creatable) {
            return Creatable;
        }
        return Select;
    }

    getValueFromOption(opt) {
        const { getValueFromOption } = this.props;
        if (getValueFromOption !== null) {
            return getValueFromOption(opt);
        }
        return isObject(opt) && typeof opt.value !== 'undefined' ? opt.value : opt;
    }

    getOptionFromValue(value, options) {
        const { getOptionFromValue } = this.props;
        if (getOptionFromValue !== null) {
            return getOptionFromValue(value, options);
        }
        return options.find(opt => this.getValueFromOption(opt) === value) || null;
    }

    getOptions() {
        const { cannotBeEmpty, addEmptyOption, emptyOption } = this.props;
        const { options, newOptions } = this.state;
        const selectOptions = [].concat(options).concat(newOptions);
        if (!cannotBeEmpty && addEmptyOption) {
            selectOptions.unshift(emptyOption);
        }
        return selectOptions;
    }

    getAllOptions() {
        // const { creatable, value } = this.props;
        const { loadedOptions } = this.state;
        const options = this.getOptions();
        return [].concat(options).concat(loadedOptions);
    }

    isValidNewOption(inputValue, selectValue, selectOptions) {
        const { isValidNewOption } = this.props;
        if (isValidNewOption !== null) {
            return isValidNewOption(inputValue, selectValue, selectOptions);
        }
        return !(
            !inputValue
            || selectValue.some(option => compareOption(inputValue, option))
            || selectOptions.some(option => compareOption(inputValue, option))
        );
    }

    createOption(label) {
        const { createOption } = this.props;
        if (createOption !== null) {
            return createOption(label);
        }
        return {
            label,
            value: label,
        };
    }

    addLoadedOptions(options) {
        return new Promise((resolve) => {
            this.setState(
                () => ({
                    loadedOptions: [...options],
                }),
                () => resolve(options),
            );
        });
    }

    loadOptions(input) {
        const { loadOptions, fetchOptions } = this.props;
        if (loadOptions !== null) {
            return new Promise(resolve => loadOptions(input, resolve)).then(this.addLoadedOptions);
        }
        if (fetchOptions !== null) {
            return fetchOptions(input).then(this.addLoadedOptions);
        }
        return null;
    }

    render() {
        const {
            intl,
            value,
            cannotBeEmpty,
            addEmptyOption,
            emptyOption,
            style,
            async,
            creatable,
            notSearchable,
            notClearable,
            multiple,
            disabled,
            fetchOptions,
            loadOptions,
            options,
            getValueFromOption,
            placeholder,
            noOptionsMessage,
            loadingMessage,
            screenReaderStatus,
            formatCreateLabel,
            onNewOption,
            onChange,
            ...other
        } = this.props;

        const { menuIsOpen, inputValue } = this.state;

        const allOptions = this.getAllOptions();

        // Get value
        // prettier-ignore
        const defaultValue = allOptions.length > 0
            ? this.getValueFromOption(allOptions[0])
            : null;
        const shouldTakeDefaultValue = cannotBeEmpty && value === null && defaultValue !== null;
        const finalValue = shouldTakeDefaultValue ? defaultValue : value;
        let selectValue = null;
        if (finalValue !== null) {
            selectValue = multiple
                ? finalValue
                    .map(val => this.getOptionFromValue(val, allOptions))
                    .filter(it => it !== null)
                : this.getOptionFromValue(finalValue, allOptions);
        }

        const SelectComponent = this.getSelectComponent();

        return (
            <FormGroup
                {...other}
                disabled={disabled}
                className={classNames({
                    'form-group-select': true,
                    [styles.container]: true,
                })}
            >
                <div style={style}>
                    <SelectComponent
                        name="form-field-select"
                        isMulti={multiple}
                        className={styles.select}
                        classNamePrefix={styles.select}
                        {...other}
                        {...(async
                            ? {
                                loadOptions: this.loadOptions,
                            }
                            : {
                                options: this.getOptions(),
                            })}
                        placeholder={
                            isMessage(placeholder) ? intl.formatMessage(placeholder) : placeholder
                        }
                        noOptionsMessage={
                            isMessage(noOptionsMessage)
                                ? values => intl.formatMessage(noOptionsMessage, values)
                                : noOptionsMessage
                        }
                        loadingMessage={
                            isMessage(loadingMessage)
                                ? values => intl.formatMessage(loadingMessage, values)
                                : loadingMessage
                        }
                        screenReaderStatus={
                            isMessage(screenReaderStatus)
                                ? values => intl.formatMessage(screenReaderStatus, values)
                                : screenReaderStatus
                        }
                        formatCreateLabel={
                            // prettier-ignore
                            isMessage(formatCreateLabel)
                                ? val => intl.formatMessage(formatCreateLabel, {
                                    inputValue: val,
                                })
                                : formatCreateLabel
                        }
                        isValidNewOption={this.isValidNewOption}
                        isDisabled={disabled}
                        isSearchable={!notSearchable}
                        isClearable={
                            (cannotBeEmpty
                                && (!shouldTakeDefaultValue && finalValue !== defaultValue))
                            || (!cannotBeEmpty && !notClearable)
                        }
                        value={selectValue}
                        onChange={this.onChange}
                        onCreateOption={this.onNewOptionClick}
                        inputValue={inputValue}
                        onInputChange={this.onInputChange}
                        menuIsOpen={menuIsOpen}
                        onMenuOpen={this.onMenuOpen}
                        onMenuClose={this.onMenuClose}
                    />
                </div>
            </FormGroup>
        );
    }
}

SelectField.propTypes = propTypes;
SelectField.defaultProps = defaultProps;

export default injectIntl(SelectField);
