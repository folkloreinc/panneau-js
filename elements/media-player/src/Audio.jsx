/* eslint-disable jsx-a11y/media-has-caption, react/jsx-props-no-spreading, no-param-reassign */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useRef } from 'react';

import styles from './styles.module.scss';

const propTypes = {
    autoPlay: PropTypes.bool,
    muted: PropTypes.bool,
    loop: PropTypes.bool,
    media: PropTypes.shape({}),
    width: PropTypes.number,
    height: PropTypes.number,
    // eslint-disable-next-line react/forbid-prop-types
    withoutControls: PropTypes.bool,
    className: PropTypes.string,
    audioClassName: PropTypes.string,
};

const defaultProps = {
    autoPlay: false,
    muted: false,
    loop: true,
    media: null,
    width: null,
    height: null,
    withoutControls: false,
    className: null,
    audioClassName: null,
};

const Audio = ({
    autoPlay,
    muted,
    loop,
    media,
    width,
    height,
    withoutControls,
    className,
    audioClassName,
}) => {
    const {
        url = null,
        thumbnail_url: thumbnail = null,
        thumbnailUrl = null,
        provider: videoProvider = null,
    } = media || {};

    const el = useRef(null);
    const finalThumbnailUrl = thumbnail || thumbnailUrl || null;

    return (
        <div
            ref={el}
            className={classNames([
                styles.audioContainer,
                {
                    [styles.isNative]: videoProvider === null,
                    [className]: className !== null,
                },
            ])}
            style={{
                backgroundImage: finalThumbnailUrl !== null ? `url(${finalThumbnailUrl})` : null,
            }}
        >
            {url !== null ? (
                <audio
                    key={media !== null ? `video-${url}` : 'video'}
                    className={classNames([
                        styles.audio,
                        { [audioClassName]: audioClassName !== null },
                    ])}
                    src={url !== null ? url : null}
                    type="audio/mp3"
                    style={{ width, height }}
                    controls={!withoutControls}
                    loop={loop}
                    autoPlay={autoPlay}
                    muted={muted}
                />
            ) : null}
        </div>
    );
};

Audio.propTypes = propTypes;
Audio.defaultProps = defaultProps;

export default React.forwardRef((props, ref) => <Audio apiRef={ref} {...props} />);
