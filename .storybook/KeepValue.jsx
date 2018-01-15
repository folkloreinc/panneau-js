import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';

const propTypes = {
    children: PropTypes.node.isRequired,
    valueName: PropTypes.string,
    onChangeName: PropTypes.string,
    onChange: PropTypes.func,
};

const defaultProps = {
    valueName: 'value',
    onChangeName: 'onChange',
    onChange: null,
};

class KeepValue extends Component {
    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);

        this.state = {
            value: get(props.children.props, props.valueName, null),
        };
    }

    onChange(value) {
        const { children, onChangeName, onChange } = this.props;
        this.setState({
            value,
        }, () => {
            const childrenOnChange = get(children.props, onChangeName, null)
            if (childrenOnChange !== null) {
                childrenOnChange(value);
            }

            if (onChange !== null) {
                onChange(value);
            }
        });
    }

    render() {
        const { children, valueName, onChangeName } = this.props;
        return React.cloneElement(children, {
            [valueName]: this.state.value,
            [onChangeName]: this.onChange,
        });
    }
}

KeepValue.propTypes = propTypes;
KeepValue.defaultProps = defaultProps;

export default KeepValue;
