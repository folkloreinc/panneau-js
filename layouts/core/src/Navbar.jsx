/* eslint-disable react/no-array-index-key */
import React, { useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import get from 'lodash/get';
import isArray from 'lodash/isArray';
import { Link } from 'react-router-dom';
import { PropTypes as PanneauPropTypes, ComponentsCollection } from '@panneau/core';
import { useComponents } from '@panneau/core/contexts';

import * as ItemsComponents from './navbarItems';

const defaultItemsComponentsCollection = new ComponentsCollection(ItemsComponents);

const propTypes = {
    title: PropTypes.string,
    titleLink: PropTypes.string,
    items: PropTypes.arrayOf(
        PropTypes.shape({
            type: PropTypes.string,
            label: PropTypes.string,
            position: PropTypes.oneOf(['right', 'left', 'center']),
        }),
    ),
    itemsComponents: PanneauPropTypes.components,
    opened: PropTypes.bool,
    gotoHome: PropTypes.func.isRequired,
    gotoLink: PropTypes.func.isRequired,
    gotoRoute: PropTypes.func.isRequired,
    onClickTitle: PropTypes.func,
    onClickItem: PropTypes.func,
};

const defaultProps = {
    title: 'Panneau',
    titleLink: '#',
    items: [],
    itemsComponents: null,
    opened: false,
    onClickTitle: null,
    onClickItem: null,
};

const Navbar = ({
    opened: initialOpened,
    title,
    titleLink,
    items,
    gotoHome,
    gotoLink,
    gotoRoute,
    itemsComponents,
    onClickTitle,
    onClickItem: customOnClickItem,
}) => {
    const [opened, setOpened] = useState(initialOpened);
    const itemsComponentsCollection = useComponents('navbarItems', itemsComponents);

    const onClickHamburger = useCallback(() => {
        setOpened(!opened);
    }, [opened]);

    const onClickItem = useCallback(
        (e, it, index, position) => {
            if (customOnClickItem !== null) {
                customOnClickItem(e, it, index, position);
            }
            if (typeof it.gotoRoute !== 'undefined') {
                gotoRoute(...(isArray(it.gotoRoute) ? it.gotoRoute : [it.gotoRoute]));
            }
        },
        [items, customOnClickItem, gotoRoute],
    );

    const { left: leftItems, right: rightItems } = useMemo(
        () =>
            items
                .map((it, index) => ({
                    ...it,
                    dropdown:
                        get(it, 'type', 'item') !== 'divider' && get(it, 'items', null) !== null,
                    index,
                }))
                .reduce(
                    (splittedItems, it) => {
                        const { position = 'left' } = it;
                        return {
                            ...splittedItems,
                            [position]: [...splittedItems[position], it],
                        };
                    },
                    { left: [], right: [] },
                ),
        [items],
    );

    const hasLeftItems = leftItems.length > 0;
    const hasRightItems = rightItems.length > 0;

    const renderItem = (it, index) => {
        const { position = 'left', type = 'item' } = it;
        const ItemComponent =
            (itemsComponentsCollection !== null
                ? itemsComponentsCollection.getComponent(type)
                : null) || defaultItemsComponentsCollection.getComponent(type) || null;
        return (
            ItemComponent !== null ? (
                <ItemComponent
                    key={`item-${position}-${index}`}
                    {...it}
                    position={position}
                    gotoHome={gotoHome}
                    gotoLink={gotoLink}
                    gotoRoute={gotoRoute}
                    onClick={e => onClickItem(e, it, index, position)}
                    onClickItem={(e, subIt, subIndex) =>
                        onClickItem(e, subIt, subIndex, position)
                    }
                />
            ) : null
        );
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <Link to={titleLink} className="navbar-brand" onClick={onClickTitle}>
                {title}
            </Link>
            <button
                type="button"
                className="navbar-toggler"
                aria-expanded="false"
                onClick={onClickHamburger}
            >
                <span className="sr-only">Menu</span>
                <span className="navbar-toggler-icon" />
            </button>
            <div
                className={classNames({
                    collapse: true,
                    'navbar-collapse': true,
                    show: opened,
                })}
            >
                {hasLeftItems ? (
                    <ul
                        className={classNames({
                            'navbar-nav': true,
                            'mr-auto': true,
                        })}
                    >
                        {leftItems.map(renderItem)}
                    </ul>
                ) : null}

                {hasRightItems ? (
                    <ul
                        className={classNames({
                            'navbar-nav': true,
                            'ml-auto': !hasLeftItems,
                        })}
                    >
                        {rightItems.map(renderItem)}
                    </ul>
                ) : null}
            </div>
        </nav>
    );
};

Navbar.propTypes = propTypes;
Navbar.defaultProps = defaultProps;

export default Navbar;
