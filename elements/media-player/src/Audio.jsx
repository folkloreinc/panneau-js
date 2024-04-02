/* eslint-disable jsx-a11y/media-has-caption, react/jsx-props-no-spreading, no-param-reassign */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useRef } from 'react';

import useVideo from './hooks/useVideo';

import styles from './styles.module.scss';

const propTypes = {
    autoPlay: PropTypes.bool,
    loop: PropTypes.bool,
    initialMuted: PropTypes.bool,
    media: PropTypes.shape({}),
    width: PropTypes.number,
    height: PropTypes.number,
    // eslint-disable-next-line react/forbid-prop-types
    apiRef: PropTypes.any,
    withoutControls: PropTypes.bool,
    onPlay: PropTypes.func,
    onPause: PropTypes.func,
    onEnd: PropTypes.func,
    onMetadataChange: PropTypes.func,
    onVolumeChange: PropTypes.func,
    onBufferStart: PropTypes.func,
    onBufferEnded: PropTypes.func,
    onTimeUpdate: PropTypes.func,
    onLoaded: PropTypes.func,
    playsInline: PropTypes.bool,
    className: PropTypes.string,
    iframeClassName: PropTypes.string,
    audioClassName: PropTypes.string,
};

const defaultProps = {
    autoPlay: true,
    loop: true,
    initialMuted: true,
    media: null,
    width: null,
    height: null,
    apiRef: null,
    withoutControls: false,
    onPlay: null,
    onPause: null,
    onEnd: null,
    onMetadataChange: null,
    onVolumeChange: null,
    onBufferStart: null,
    onBufferEnded: null,
    onTimeUpdate: null,
    onLoaded: null,
    playsInline: null,
    className: null,
    iframeClassName: null,
    audioClassName: null,
};

const Video = ({
    autoPlay,
    loop,
    initialMuted,
    media,
    width,
    height,
    apiRef,
    withoutControls,
    onPlay,
    onPause,
    onEnd,
    onMetadataChange,
    onVolumeChange,
    onBufferStart,
    onBufferEnded,
    onTimeUpdate,
    onLoaded,
    playsInline,
    className,
    audioClassName,
}) => {
    const {
        url = null,
        // iframeUrl = null,
        thumbnail_url: thumbnail = null,
        thumbnailUrl: thumbnailUrl = null,
        provider: videoProvider = null,
        id: mediaId,
        duration: videoDuration,
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
                />
            ) : null}
        </div>
    );
};

Video.propTypes = propTypes;
Video.defaultProps = defaultProps;

export default React.forwardRef((props, ref) => <Video apiRef={ref} {...props} />);
