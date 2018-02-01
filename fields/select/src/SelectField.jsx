import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isObject from 'lodash/isObject';
import pick from 'lodash/pick';
import omit from 'lodash/omit';
import classNames from 'classnames';
import FormGroup from '@panneau/form-group';
import './vendor.global.scss';
import styles from './styles.scss';

const valuePropTypes = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.array,
    PropTypes.object,
]);

const propTypes = {
    name: PropTypes.string,
    label: PropTypes.string,
    value: valuePropTypes,
    options: PropTypes.arrayOf(PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
            value: PropTypes.any,
            label: PropTypes.string,
        }),
    ])),
    getValueFromOption: PropTypes.func,
    onChange: PropTypes.func,
    onOptionsChange: PropTypes.func,

    inputOnly: PropTypes.bool,
    placeholder: PropTypes.string,
    noResultsText: PropTypes.string,
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
    onOptionsChange: null,

    inputOnly: false,
    getValueFromOption: null,
    cannotBeEmpty: false,
    notSearchable: false,
    notClearable: false,
    creatable: false,
    async: false,
    multiple: false,
    loadOptions: null,
    fetchOptions: null,
    placeholder: 'Aucun',
    noResultsText: 'Aucun résultat',
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
        this.onChange = this.onChange.bind(this);
        this.onNewOptionClick = this.onNewOptionClick.bind(this);
        this.getValueFromOption = this.getValueFromOption.bind(this);
        this.loadOptions = this.loadOptions.bind(this);
        this.importCanceled = false;
        this.Component = null;

        this.state = {
            options: props.options,
            ready: false,
        };
    }

    componentDidMount() {
        const {
            async,
            creatable,
        } = this.props;
        let componentName;
        if (async && creatable) {
            componentName = 'AsyncCreatable';
        } else if (async) {
            componentName = 'Async';
        } else if (creatable) {
            componentName = 'Creatable';
        } else {
            componentName = 'Select';
        }
        import(/* webpackChunkName: "vendor/react-select/[request]" */`react-select/lib/${componentName}`)
            .then((SliderComponent) => {
                if (this.importCanceled) {
                    return;
                }
                this.Component = SliderComponent.default;
                this.setState({
                    ready: true,
                });
            });
    }

    componentWillReceiveProps(nextProps) {
        const optionsChanged = this.props.options !== nextProps.options;
        if (optionsChanged) {
            this.setState({
                options: nextProps.options,
            });
        }
    }

    componentWillUnmount() {
        this.importCanceled = true;
    }

    onNewOptionClick(option) {
        const { options } = this.state;
        this.setState({
            options: [
                ...options,
                option,
            ],
        }, () => {
            if (this.props.onOptionsChange) {
                this.props.onOptionsChange(this.state.options);
            }
        });
    }

    onChange(value) {
        const { multiple, notClearable, cannotBeEmpty } = this.props;
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

        if (this.props.onChange) {
            this.props.onChange(newValue);
        }
    }

    getValueFromOption(opt) {
        const { getValueFromOption } = this.props;
        if (getValueFromOption !== null) {
            return getValueFromOption(opt);
        }
        return isObject(opt) && typeof opt.value !== 'undefined' ? opt.value : opt;
    }

    getOptions() {
        const {
            cannotBeEmpty,
            addEmptyOption,
            emptyOption,
        } = this.props;
        const {
            options,
        } = this.state;
        const selectOptions = [].concat(options);
        if (!cannotBeEmpty && addEmptyOption) {
            selectOptions.unshift(emptyOption);
        }
        return selectOptions;
    }

    loadOptions(input, callback) {
        const { loadOptions, fetchOptions } = this.props;
        if (loadOptions !== null) {
            return loadOptions(input, callback);
        } else if (fetchOptions !== null) {
            return fetchOptions(input).then(options => ({
                options,
            }));
        }
        return null;
    }

    render() {
        const { ready } = this.state;
        if (!ready) {
            return null;
        }
        const {
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
            ...other
        } = this.props;

        const groupProps = pick(this.props, Object.keys(FormGroup.propTypes));
        const selectProps = omit(other, Object.keys(FormGroup.propTypes));
        const selectOptions = this.getOptions();
        const defaultValue = selectOptions.length > 0 ?
            this.getValueFromOption(selectOptions[0]) : null;
        const shouldTakeDefaultValue = cannotBeEmpty && value === null && defaultValue !== null;
        const selectValue = shouldTakeDefaultValue ? defaultValue : value;
        const selectClearable = cannotBeEmpty && (
            shouldTakeDefaultValue ||
            selectValue === defaultValue
        ) ? false : !notClearable;
        const selectSearchable = !notSearchable;

        const asyncProps = async ? {
            loadOptions: this.loadOptions,
        } : {
            options: selectOptions,
        };

        const SelectComponent = this.Component;

        return (
            <FormGroup
                {...other}
                className={classNames({
                    'form-group-select': true,
                    [styles.container]: true,
                })}
            >
                <div style={style}>
                    <SelectComponent
                        name="form-field-select"
                        multi={multiple}
                        {...other}
                        {...asyncProps}
                        searchable={selectSearchable}
                        clearable={selectClearable}
                        value={selectValue}
                        onChange={this.onChange}
                        onNewOptionClick={this.onNewOptionClick}
                    />
                </div>
            </FormGroup>
        );
    }
}

SelectField.propTypes = propTypes;
SelectField.defaultProps = defaultProps;

export default SelectField;
