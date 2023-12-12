import classNames from 'classnames';
import get from 'lodash/get';
import isArray from 'lodash/isArray';
import PropTypes from 'prop-types';
import React from 'react';

import Icon from '@panneau/element-icon';

const propTypes = {
    value: PropTypes.string,
    itemLabelPath: PropTypes.string,
    itemClassName: PropTypes.string,
    itemClassNamePath: PropTypes.string,
};

const defaultProps = {
    value: null,
    itemLabelPath: 'label',
    itemIconPath: null,
    itemClassName: 'bg-secondary',
    itemClassNamePath: null,
};

const Badges = ({ value, itemLabelPath, itemIconPath, itemClassName, itemClassNamePath }) => {
    const items = (isArray(value) ? value : [value]).filter((it) => it !== null) || [];
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
        ) : null;
    });
};

Badges.propTypes = propTypes;
Badges.defaultProps = defaultProps;

export default Badges;
