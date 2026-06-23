import classNames from 'classnames';
import isArray from 'lodash-es/isArray';

import type { Media } from '@panneau/core';

import MediaCard from './MediaCard';

import styles from './styles.module.css';

interface MediaCardsProps {
    value?: Media[] | Media | null;
    className?: string | null;
    cardClassName?: string | null;
}

function MediaCards({
    value = null,
    className = null,
    cardClassName = null,
    ...props
}: MediaCardsProps) {
    const values = !isArray(value) && value !== null ? [value] : value;

    return (
        <div className={classNames([styles.mediaCards, className])}>
            {(values || []).map((media, idx) => (
                <MediaCard
                    key={`media-card-${idx + 1}-${media !== null ? media?.id : null}`}
                    className={classNames([styles.card, cardClassName])}
                    {...props}
                    value={media}
                    index={idx}
                />
            ))}
        </div>
    );
}

export default MediaCards;
