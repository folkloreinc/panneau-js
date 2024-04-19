import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useRef } from 'react';

import Audio from './Audio';
import Video from './Video';

import styles from './styles.module.scss';

const propTypes = {
    value: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.shape({
            filename: PropTypes.string,
            size: PropTypes.number,
            url: PropTypes.string,
        }),
    ]),
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    className: PropTypes.string,
};

const defaultProps = {
    value: null,
    width: null,
    height: null,
    className: null,
};

const MediaPlayer = ({ value: initialValue, width, height, className }) => {
    const value = initialValue || {};
    const { type } = value || {};
    const apiRef = useRef(null);

    return (
        <div
            className={classNames([
                styles.container,
                'border',
                'p-2',
                { [className]: className !== null },
            ])}
            style={{ width, height }}
        >
            {type === 'video' ? <Video media={value} apiRef={apiRef} /> : null}
            {type === 'audio' ? <Audio media={value} apiRef={apiRef} /> : null}
        </div>
    );
};

MediaPlayer.propTypes = propTypes;
MediaPlayer.defaultProps = defaultProps;

export default MediaPlayer;
