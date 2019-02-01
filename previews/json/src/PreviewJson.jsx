import React from 'react';
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

const PreviewJson = ({ value }) => (
    <pre className={styles.container}>{JSON.stringify(value, null, 4)}</pre>
);

PreviewJson.propTypes = propTypes;
PreviewJson.defaultProps = defaultProps;

export default PreviewJson;
