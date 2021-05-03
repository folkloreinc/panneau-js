import classNames from 'classnames';
import React from 'react';
import PropTypes from 'prop-types';

// import { PropTypes as PanneauPropTypes } from '@panneau/core';
// import { isMessage } from '@panneau/core/utils';

import styles from './styles.module.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: null,
};

const Range = ({ className }) => {
    return (
        <input
            className={classNames([
                styles.container,
                {
                    [className]: className !== null,
                },
            ])}
            type="range"
        />
    );
};

Range.propTypes = propTypes;
Range.defaultProps = defaultProps;

export default Range;
