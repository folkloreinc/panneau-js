import classNames from 'classnames';
import isArray from 'lodash/isArray';
import { useMemo } from 'react';

import MediaCard from './MediaCard';

import styles from './styles.module.css';

interface MediaValue {
    id?: string;
    filename?: string;
    size?: number;
    url?: string;
}

interface MediaCardsProps {
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
    const values = useMemo(() => {
        if (isArray(value)) {
            return value;
        }
        return value !== null ? [value] : [];
    }, [value]);

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
