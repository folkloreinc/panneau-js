import classNames from 'classnames';
import { useRef } from 'react';

import Audio from './Audio';
import Video from './Video';

import styles from './styles.module.css';

interface MediaValue {
    filename?: string;
    size?: number;
    url?: string;
    type?: string;
}

interface MediaPlayerProps {
    value?: MediaValue[] | MediaValue | null;
    width?: number | string | null;
    height?: number | string | null;
    className?: string | null;
}

function MediaPlayer({
    value: initialValue = null,
    width = null,
    height = null,
    className = null,
    ...props
}: MediaPlayerProps) {
    const value = initialValue || {};
    const { type } = value || {};
    const apiRef = useRef(null);
    return (
        <div
            className={classNames([styles.container, 'border', 'p-2', className])}
            style={{ width: width || undefined, height: height || undefined }}
        >
            {type === 'video' ? <Video media={value} apiRef={apiRef} {...props} /> : null}
            {type === 'audio' ? <Audio media={value} apiRef={apiRef} {...props} /> : null}
        </div>
    );
}

export default MediaPlayer;
