import React from 'react';
import PropTypes from 'prop-types';
import { IntlProvider } from 'react-intl';

import '../../packages/core/src/styles/vendor.global.scss';

const propTypes = {
    children: PropTypes.node.isRequired,
};

const Wrapper = ({ children }) => (
    <IntlProvider locale="en">
        {children}
    </IntlProvider>
);

Wrapper.propTypes = propTypes;

export default Wrapper;
