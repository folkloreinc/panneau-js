import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import isArray from 'lodash/isArray';
import { FormGroup } from '@panneau/field';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import 'rc-slider/assets/index.css';
import { Slider, Range } from './vendors';
import styles from './styles.scss';

const propTypes = {
    name: PropTypes.string,
    label: PanneauPropTypes.label,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number, // Numbers are simple and tested
        PropTypes.array,
    ]),
    defaultValue: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number, // Numbers are simple and tested
        PropTypes.array,
    ]),
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    range: PropTypes.bool,
    onChange: PropTypes.func,
};

const defaultProps = {
    name: 'name',
    label: 'label',
    value: null,
    defaultValue: null,
    min: 0,
    max: 100,
    step: 1,
    range: false,
    onChange: null,
};

class SliderField extends Component {
    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
    }

    onChange(value) {
        const { range, onChange } = this.props;
        const newValue = range && isArray(value) && value.length === 0 ? null : value;
        if (onChange !== null) {
            onChange(newValue);
        }
    }

    render() {
        const {
            name,
            label,
            value,
            range,
            ...other
        } = this.props;

        const SliderComponent = range ? Range : Slider;
        const sliderValue = range && value === null ? [] : value;

        return (
            <FormGroup
                {...other}
                className={classNames({
                    'form-group-slider': true,
                    [styles.container]: true,
                })}
                name={name}
                label={label}
            >
                <SliderComponent
                    {...other}
                    value={sliderValue}
                    onChange={this.onChange}
                />
            </FormGroup>
        );
    }
}

SliderField.propTypes = propTypes;
SliderField.defaultProps = defaultProps;

export default SliderField;
