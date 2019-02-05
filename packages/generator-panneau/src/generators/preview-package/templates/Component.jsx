import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './styles.scss';

const propTypes = {
    value: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array,
        PropTypes.number,
        PropTypes.string,
    ]),
};

const defaultProps = {
    value: null,
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
            <div className={styles.container}></div>
        );
    }
}

<%= componentName %>.propTypes = propTypes;
<%= componentName %>.defaultProps = defaultProps;

export default <%= componentName %>;
