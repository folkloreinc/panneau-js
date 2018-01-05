import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FormGroup from '@panneau/form-group';

const propTypes = {
    name: PropTypes.string,
    label: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
};

const defaultProps = {
    name: null,
    label: null,
    value: null,
    onChange: null,
};

class <%= componentName %> extends Component {
    static parse(value) {
        return value;
    }

    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);

        this.refInput = null;
    }

    onChange(e) {
        const newValue = (e.currentTarget || this.refInput).value;
        if (this.props.onChange) {
            this.props.onChange(newValue);
        }
    }

    render() {
        const {
            label,
            name,
            value,
            ...other
        } = this.props;

        return (
            <FormGroup
                className="form-group-<%= name %>"
                name={name}
                label={label}
                {...other}
            >
                <input
                    type="text"
                    value={value}
                    onChange={this.onChange}
                    ref={(ref) => { this.refInput = ref; }}
                />
            </FormGroup>
        );
    }
}

<%= componentName %>.propTypes = propTypes;
<%= componentName %>.defaultProps = defaultProps;

export default <%= componentName %>;
