import React from 'react';
import PropTypes from 'prop-types';

import { convertStyleToString } from '../../utils';

const propTypes = {
    selector: PropTypes.string,
    style: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
};

const defaultProps = {
    selector: null,
    style: null,
};

const LinkStyle = ({ selector, style }) => (
    <style type="text/css">{`${selector !== null ? `${selector} ` : ''}a{${convertStyleToString(
        style,
    )}}`}</style>
);

LinkStyle.propTypes = propTypes;
LinkStyle.defaultProps = defaultProps;

export default LinkStyle;
