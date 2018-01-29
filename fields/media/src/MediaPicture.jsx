import React from 'react';

import Media from './Media';

import classNames from './styles.scss';

const MediaPicture = props => (
    <Media
        {...props}
        className={classNames.picture}
        getThumbnail={media => (
            media.url
        )}
        renderDetails={(media, common) => (
            <div>
                { common }
                <div>Dimension: { media.width }x{ media.height }</div>
                { media.original_file ? (
                    <div>Poids: { media.original_file.size_human }</div>
                ) : null }
            </div>
        )}
    />
);

export default MediaPicture;
