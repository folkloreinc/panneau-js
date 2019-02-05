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

const JsonPreview = ({ value }) => (
    <pre className={styles.container}>{JSON.stringify(value, null, 4)}</pre>
);

JsonPreview.propTypes = propTypes;
JsonPreview.defaultProps = defaultProps;

export default JsonPreview;
