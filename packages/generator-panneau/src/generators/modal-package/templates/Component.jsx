import React, { Component } from 'react';
import PropTypes from 'prop-types';

const propTypes = {

};

const defaultProps = {

};

class <%= componentName %> extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            ...other
        } = this.props;

        return (
            <div></div>
        );
    }
}

<%= componentName %>.propTypes = propTypes;
<%= componentName %>.defaultProps = defaultProps;

export default <%= componentName %>;
