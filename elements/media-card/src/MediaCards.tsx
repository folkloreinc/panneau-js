import classNames from 'classnames';
import isArray from 'lodash-es/isArray';

import MediaCard from './MediaCard';
import type { MediaCardProps, MediaValue } from './MediaCard';

import styles from './styles.module.css';

interface MediaCardsProps extends Omit<
    MediaCardProps,
    'value' | 'index' | 'className' | 'cardClassName'
> {
    value?: MediaValue[] | MediaValue | null;
    className?: string | null;
    cardClassName?: string | null;
}

function MediaCards({
    value = null,
    className = null,
    cardClassName = null,
    ...props
}: MediaCardsProps) {
    let values: MediaValue[] = [];
    if (isArray(value)) {
        values = value;
    } else if (value !== null) {
        values = [value];
    }

    return (
        <div className={classNames([styles.mediaCards, className])}>
            {values.map((media, idx) => (
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
