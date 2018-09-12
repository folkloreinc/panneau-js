import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import { FormGroup } from '@panneau/field';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import TextField from '@panneau/field-text';

import Url from './Url';

const propTypes = {
    name: PropTypes.string,
    label: PanneauPropTypes.label,
    value: PropTypes.string,
    schemes: PropTypes.arrayOf(PropTypes.string),
    onChange: PropTypes.func,
};

const defaultProps = {
    name: null,
    label: null,
    value: null,
    schemes: ['http://', 'https://', 'ftp://'],
    onChange: null,
};

class UrlField extends Component {
    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);

        this.url = new Url({
            schemes: props.schemes,
        });

        this.state = {
            scheme: this.url.getScheme(props.value),
        };
    }

    componentWillReceiveProps({ value: nextValue }) {
        const { value } = this.props;
        const valueChanged = nextValue !== value;
        if (valueChanged) {
            this.setState({
                scheme: this.url.getScheme(nextValue),
            });
        }
    }

    onChange(value) {
        const { onChange } = this.props;
        const { scheme } = this.state;
        if (onChange !== null) {
            onChange(!isEmpty(value) ? this.url.withScheme(value, scheme) : '');
        }
    }

    render() {
        const {
            label, name, value, ...other
        } = this.props;
        const { scheme } = this.state;

        return (
            <FormGroup className="form-group-url" name={name} label={label} {...other}>
                <TextField
                    inputOnly
                    prefix={scheme}
                    value={this.url.removeScheme(value)}
                    onChange={this.onChange}
                />
            </FormGroup>
        );
    }
}

UrlField.propTypes = propTypes;
UrlField.defaultProps = defaultProps;

export default UrlField;
