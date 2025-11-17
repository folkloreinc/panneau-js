import classNames from 'classnames';
import get from 'lodash-es/get';
import isArray from 'lodash-es/isArray';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import Icon from '@panneau/element-icon';

const propTypes = {
    value: PropTypes.string,
    placeholder: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    itemLabelPath: PropTypes.string,
    itemClassName: PropTypes.string,
    itemClassNamePath: PropTypes.string,
};

function Badges({
    value = null,
    placeholder = null,
    itemLabelPath = 'label',
    itemIconPath = null,
    itemClassName = 'bg-secondary',
    itemClassNamePath = null
}) {
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

Badges.propTypes = propTypes;

export default Badges;
