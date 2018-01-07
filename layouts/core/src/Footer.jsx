import React, { Component } from 'react';
import PropTypes from 'prop-types';

const propTypes = {

};

const defaultProps = {

};

class Footer extends Component {
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

Footer.propTypes = propTypes;
Footer.defaultProps = defaultProps;

export default Footer;
