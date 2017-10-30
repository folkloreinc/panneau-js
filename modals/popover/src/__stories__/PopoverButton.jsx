import React, { Component } from 'react';
import PropTypes from 'prop-types';

const propTypes = {
    children: PropTypes.node.isRequired,
    visible: PropTypes.bool,
    buttonLabel: PropTypes.string,
};

const defaultProps = {
    visible: false,
    buttonLabel: 'Open popover',
};

class Popover extends Component {
    constructor(props) {
        super(props);

        this.onClick = this.onClick.bind(this);

        this.refButton = null;

        this.state = {
            visible: props.visible,
        };
    }

    componentDidUpdate() {

    }

    onClick() {
        this.setState({
            visible: !this.state.visible,
        });
    }

    render() {
        const { buttonLabel, children } = this.props;
        const { visible } = this.state;
        const style = {
            display: 'inline-block',
            position: 'relative',
        };
        return (
            <div style={style}>
                <button
                    type="button"
                    className="btn btn-default"
                    onClick={this.onClick}
                    ref={(ref) => { this.refButton = ref; }}
                >
                    { buttonLabel }
                </button>
                { React.cloneElement(children, {
                    element: this.refButton,
                    visible,
                }) }
            </div>
        );
    }
}

Popover.propTypes = propTypes;
Popover.defaultProps = defaultProps;

export default Popover;
