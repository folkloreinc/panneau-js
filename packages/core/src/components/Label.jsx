/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';

import { label as labelPropTypes } from '../lib/PropTypes';
import { isMessage } from '../lib/utils';

const propTypes = {
    children: labelPropTypes.isRequired,
    isHtml: PropTypes.bool,
    values: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    isHtml: false,
    values: {},
};

const Label = ({ children, isHtml, values }) => {
    const Message = isHtml ? FormattedHTMLMessage : FormattedMessage;
    return isMessage(children) ? (
        <Message values={values} {...children} />
    ) : (
        children
    )
};

Label.propTypes = propTypes;
Label.defaultProps = defaultProps;

export default Label;
