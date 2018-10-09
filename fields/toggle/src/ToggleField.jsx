import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isObject from 'lodash/isObject';
import SelectField from '@panneau/field-select';
import { FormGroup } from '@panneau/field';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import 'rc-switch/assets/index.css';
import Switch from './vendors';

/**
 *  Class: ToggleField
 *  Makes a true-false select
 *  @param {string,number,bool} value
 *  @return {bool} val
 */
const propTypes = {
    type: PropTypes.oneOf(['switch', 'select']),
    name: PropTypes.string,
    label: PanneauPropTypes.label,
    helpText: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
    onChange: PropTypes.func,

    selectOptions: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.any,
            label: PropTypes.string,
        }),
    ),
    clearable: PropTypes.bool,
    canBeEmpty: PropTypes.bool,
    collapsed: PropTypes.bool,
    collapsible: PropTypes.bool,
};

const defaultProps = {
    type: 'switch',
    name: null,
    label: '',
    helpText: null,
    value: null,
    onChange: null,
    selectOptions: [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }],
    clearable: false,
    canBeEmpty: false,
    collapsed: false,
    collapsible: false,
};

class ToggleField extends Component {
    static parse(value) {
        if (value === true || value === 1 || value === '1' || value === 'true') {
            return true;
        }
        return false;
    }

    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    onChange(value) {
        const { onChange } = this.props;
        const val = isObject(value) && typeof value.value !== 'undefined' ? value.value : value;
        const newValue = val === '' || value === null ? null : ToggleField.parse(val);
        if (onChange !== null) {
            onChange(newValue);
        }
    }

    renderSelect() {
        const {
            type,
            label,
            collapsed,
            collapsible,
            clearable,
            canBeEmpty,
            value,
            selectOptions,
            ...other
        } = this.props;
        const val = value !== null ? `${ToggleField.parse(value)}` : null;
        return (
            <SelectField
                {...other}
                inputOnly
                notSearchable
                notClearable={!clearable}
                canBeEmpty={canBeEmpty}
                value={val}
                onChange={this.onChange}
                options={selectOptions}
            />
        );
    }

    renderSwitch() {
        const {
            type,
            label,
            collapsed,
            collapsible,
            clearable,
            canBeEmpty,
            value,
            selectOptions,
            helpText,
            ...other
        } = this.props;
        const val = value !== null ? ToggleField.parse(value) : null;
        return <Switch {...other} checked={val} onChange={this.onChange} />;
    }

    render() {
        const {
            type,
            label,
            collapsed,
            collapsible,
            clearable,
            canBeEmpty,
            value,
            ...other
        } = this.props;

        let input = null;
        if (type === 'select') {
            input = this.renderSelect();
        } else if (type === 'switch') {
            input = this.renderSwitch();
        }

        return (
            <FormGroup
                {...other}
                label={label}
                className={`form-group-${type}`}
                collapsible={collapsible}
                collapsed={collapsed}
                inline
            >
                {input}
            </FormGroup>
        );
    }
}

ToggleField.propTypes = propTypes;
ToggleField.defaultProps = defaultProps;

export default ToggleField;
