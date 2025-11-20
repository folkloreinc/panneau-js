import classNames from 'classnames';
import get from 'lodash-es/get';
import isArray from 'lodash-es/isArray';
import { useMemo } from 'react';

import Icon from '@panneau/element-icon';

interface BadgesProps {
    value?: string | null;
    placeholder?: React.ReactNode | null;
    itemLabelPath?: string;
    itemIconPath?: string | any[] | null;
    itemClassName?: string;
    itemClassNamePath?: string | any[] | null;
}

function Badges({
    value = null,
    placeholder = null,
    itemLabelPath = 'label',
    itemIconPath = null,
    itemClassName = 'bg-secondary',
    itemClassNamePath = null,
}: BadgesProps) {
    const items = useMemo(
        () => (isArray(value) ? value : [value]).filter((it) => it !== null) || [],
        [value],
    );
    return items.map((it) => {
        const label = get(it, itemLabelPath, null);
        const icon = get(it, itemIconPath, null);
        const className = get(it, itemClassNamePath, null);
        return label !== null || icon !== null ? (
            <span
                className={classNames([
                    'badge',
                    'mb-1',
                    'me-1',
                    { [itemClassName]: itemClassName !== null, [className]: className !== null },
                ])}
            >
                {icon !== null ? <Icon name={icon} /> : label}
            </span>
        ) : (
            placeholder
        );
    });
}

export default Badges;
