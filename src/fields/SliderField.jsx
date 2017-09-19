import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isArray from 'lodash/isArray';

import FormGroup from '../FormGroup';

const propTypes = {
    name: PropTypes.string,
    label: PropTypes.string,
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
        this.slider = null;
        this.Component = null;

        this.state = {
            ready: false,
        };
    }

    componentDidMount() {
        const { range } = this.props;
        const componentName = range ? 'Range' : 'Slider';
        import(/* webpackChunkName: "vendor/rc-slider/[request]" */`rc-slider/lib/${componentName}`)
            .then((SliderComponent) => {
                this.Component = SliderComponent;
                this.setState({
                    ready: true,
                });
            });
    }

    onChange(value) {
        const { range } = this.props;
        const newValue = range && isArray(value) && value.length === 0 ? null : value;
        if (this.props.onChange) {
            this.props.onChange(newValue);
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
        const { ready } = this.state;

        if (!ready) {
            return null;
        }

        const SliderComponent = this.Component;
        const sliderValue = range && value === null ? [] : value;

        return (
            <FormGroup
                {...other}
                className="form-group-slider"
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
