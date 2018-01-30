import React from 'react';

import Media from './Media';

import classNames from './styles.scss';

const MediaDocument = props => (
    <Media
        {...props}
        className={classNames.document}
        getThumbnail={media => (
            typeof media.thumbnails !== 'undefined' && media.thumbnails.length ? media.thumbnails[0].url : null
        )}
        renderDetails={(media, common) => (
            <div>
                { common }
                { media.pages ? (
                    <div>Pages: { media.pages } page(s)</div>
                ) : null}
                { media.original_file ? (
                    <div>Poids: { media.original_file.size_human }</div>
                ) : null }
            </div>
        )}
    />
);

export default MediaDocument;
