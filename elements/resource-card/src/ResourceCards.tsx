import classNames from 'classnames';
import isArray from 'lodash/isArray';
import { useMemo } from 'react';

import ResourceCard from './ResourceCard';

import styles from './styles.module.css';

interface ResourceItem {
    id?: string;
    filename?: string;
    size?: number;
    url?: string;
}

interface ResourceCardsProps {
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
        <div className={classNames([styles.container, { [className!]: className !== null }])}>
            {values.map((val, idx) => (
                <ResourceCard
                    key={`resource-card-${idx + 1}-${val !== null ? val?.id : null}`}
                    className={classNames([
                        styles.card,
                        { [cardClassName!]: cardClassName !== null },
                    ])}
                    {...props}
                    item={val}
                />
            ))}
        </div>
    );
}

export default ResourceCards;
