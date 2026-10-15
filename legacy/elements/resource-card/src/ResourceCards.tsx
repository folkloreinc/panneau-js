import classNames from 'classnames';
import isArray from 'lodash-es/isArray';
import { useMemo } from 'react';

import ResourceCard from './ResourceCard';
import type { ResourceCardProps, ResourceItem } from './ResourceCard';

import styles from './styles.module.css';

interface ResourceCardsProps extends Omit<ResourceCardProps, 'item' | 'className'> {
    value?: ResourceItem[] | ResourceItem | null;
    className?: string | null;
    cardClassName?: string | null;
}

function ResourceCards({
    value = null,
    className = null,
    cardClassName = null,
    ...props
}: ResourceCardsProps) {
    const values = useMemo(() => {
        if (isArray(value)) {
            return value.filter((v) => v !== null);
        }
        return value !== null ? [value] : [];
    }, [value]);
    return (
        <div className={classNames([styles.container, className])}>
            {values.map((val, idx) => (
                <ResourceCard
                    key={`resource-card-${idx + 1}-${val !== null ? val?.id : null}`}
                    className={classNames([styles.card, cardClassName])}
                    {...props}
                    item={val}
                />
            ))}
        </div>
    );
}

export default ResourceCards;
