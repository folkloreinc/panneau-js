import React, { Component } from 'react';
import PropTypes from 'prop-types';

const propTypes = {
    children: PropTypes.node.isRequired,
};

const defaultProps = {
};

class StateField extends Component {
    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);

        this.state = {
            value: props.children.props.value || null,
        };
    }

    onChange(value) {
        this.setState({
            value,
        }, () => {
            const props = this.props.children.props;
            if (props.onChange !== null) {
                props.onChange(value);
            }
        });
    }

    render() {
        return React.cloneElement(this.props.children, {
            value: this.state.value,
            onChange: this.onChange,
        });
    }
}

StateField.propTypes = propTypes;
StateField.defaultProps = defaultProps;

export default StateField;
