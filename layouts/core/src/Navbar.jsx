/* eslint-disable react/no-array-index-key */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import get from 'lodash/get';
import isArray from 'lodash/isArray';
import { Link } from 'react-router-dom';
import { withComponentsCollection, PropTypes as PanneauPropTypes } from '@panneau/core';

import NavbarItem from './NavbarItem';
import NavbarDivider from './NavbarDivider';
import NavbarUser from './NavbarUser';
import NavbarResource from './NavbarResource';

const defaultItemsComponents = {
    item: NavbarItem,
    divider: NavbarDivider,
    user: NavbarUser,
    resource: NavbarResource,
};

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
    itemsCollection: PanneauPropTypes.componentsCollection,
    itemsComponents: PropTypes.objectOf(PropTypes.func),
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
    itemsCollection: null,
    itemsComponents: defaultItemsComponents,
    opened: false,
    onClickTitle: null,
    onClickItem: null,
};

class Navbar extends Component {
    constructor(props) {
        super(props);

        this.onClickTitle = this.onClickTitle.bind(this);
        this.onClickHamburger = this.onClickHamburger.bind(this);
        this.renderItem = this.renderItem.bind(this);

        this.state = {
            opened: props.opened,
        };
    }

    componentWillReceiveProps({ opened: nextOpened }) {
        const { opened } = this.props;
        const openedChanged = nextOpened !== opened;
        if (openedChanged) {
            this.setState({
                opened: nextOpened,
            });
        }
    }

    onClickTitle(e) {
        const { onClickTitle } = this.props;
        if (onClickTitle !== null) {
            onClickTitle(e);
        }
    }

    onClickHamburger() {
        this.setState(({ opened }) => ({
            opened: !opened,
        }));
    }

    onClickItem(e, { index, ...it }, relIndex, position) {
        const { onClickItem, gotoRoute } = this.props;
        if (onClickItem !== null) {
            onClickItem(e, it, index, position);
        }
        if (typeof it.gotoRoute !== 'undefined') {
            gotoRoute(...(isArray(it.gotoRoute) ? it.gotoRoute : [it.gotoRoute]));
        }
    }

    getItemComponent(type = 'item') {
        const { itemsCollection, itemsComponents } = this.props;
        const defaultComponent = itemsComponents !== null ? itemsComponents[type] || null : null;
        return (
            (itemsCollection !== null ? itemsCollection.getComponent(type) : null)
            || defaultComponent
        );
    }

    renderItem(it, index, position) {
        const { gotoHome, gotoLink, gotoRoute } = this.props;
        const ItemComponent = this.getItemComponent(it.type || 'item');
        return ItemComponent !== null ? (
            <ItemComponent
                key={`item-${position}-${index}`}
                {...it}
                position={position}
                gotoHome={gotoHome}
                gotoLink={gotoLink}
                gotoRoute={gotoRoute}
                onClick={e => this.onClickItem(e, it, index, position)}
                onClickItem={(e, subIt, subIndex) => this.onClickItem(e, subIt, subIndex, position)}
            />
        ) : null;
    }

    renderItems(items, position) {
        return (
            <ul
                className={classNames({
                    'navbar-nav mr-auto': true,
                    'navbar-right': position === 'right',
                })}
            >
                {items.map((it, index) => this.renderItem(it, index, position))}
            </ul>
        );
    }

    render() {
        const { title, titleLink, items } = this.props;

        const { opened } = this.state;

        const itemsWithIndex = items.map((it, index) => ({
            ...it,
            dropdown: get(it, 'type', 'item') !== 'divider' && get(it, 'items', null) !== null,
            index,
        }));
        const leftItems = itemsWithIndex.filter(it => get(it, 'position', 'left') === 'left');
        const rightItems = itemsWithIndex.filter(it => get(it, 'position', 'left') === 'right');
        const hasLeftItems = leftItems.length > 0;
        const hasRightItems = rightItems.length > 0;

        return (
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <Link to={{ pathname: titleLink }} className="navbar-brand" onClick={this.onClickTitle}>
                    {title}
                </Link>
                <button
                    type="button"
                    className="navbar-toggler"
                    aria-expanded="false"
                    onClick={this.onClickHamburger}
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
                            {leftItems.map((it, index) => this.renderItem(it, index, 'left'))}
                        </ul>
                    ) : null}

                    {hasRightItems ? (
                        <ul
                            className={classNames({
                                'navbar-nav': true,
                                'ml-auto': !hasLeftItems,
                            })}
                        >
                            {rightItems.map((it, index) => this.renderItem(it, index, 'right'))}
                        </ul>
                    ) : null}
                </div>
            </nav>
        );
    }
}

Navbar.propTypes = propTypes;
Navbar.defaultProps = defaultProps;

const mapCollectionToProps = (
    { componentsCollection: propsCollection },
    { componentsCollection: contextCollection },
) => {
    const collection = propsCollection || contextCollection || null;
    return {
        itemsCollection: collection !== null ? collection.getCollection('navbarItems') : null,
    };
};
export default withComponentsCollection(mapCollectionToProps)(Navbar);
