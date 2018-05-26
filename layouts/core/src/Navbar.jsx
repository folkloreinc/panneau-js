/* eslint-disable react/no-array-index-key */
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import get from 'lodash/get';
import isString from 'lodash/isString';

const propTypes = {
    title: PropTypes.string,
    titleLink: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({
        type: PropTypes.string,
        label: PropTypes.string,
        position: PropTypes.oneOf(['right', 'left', 'center']),
    })),
    opened: PropTypes.bool,
    onClickTitle: PropTypes.func,
    onClickItem: PropTypes.func,
};

const defaultProps = {
    title: 'Panneau',
    titleLink: '#',
    items: [],
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

    componentWillReceiveProps(nextProps) {
        const openedChanged = nextProps.opened !== this.props.opened;
        if (openedChanged) {
            this.setState({
                opened: nextProps.opened,
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
        const { onClickItem } = this.props;
        if (onClickItem !== null) {
            onClickItem(e, it, index, position);
        }
    }

    renderItem(it, index, position) {
        const link = get(it, 'link', '#');
        const divider = get(it, 'type', 'item') === 'divider';
        const label = get(it, 'label', '');
        const items = get(it, 'items', null);
        const linkProps = it.dropdown
            ? {
                role: 'button',
                'data-toggle': 'dropdown',
                'aria-haspopup': 'true',
                'aria-expanded': 'false',
            }
            : {};

        return (
            <li
                key={`item-${position}-${index}`}
                className={classNames({
                    'nav-item': true,
                    dropdown: it.dropdown,
                    divider,
                })}
            >
                {!divider ? (
                    <a
                        href={link}
                        className={classNames({
                            'nav-link': true,
                            'dropdown-toggle': it.dropdown,
                        })}
                        {...linkProps}
                        onClick={e => this.onClickItem(e, it, index, position)}
                    >
                        {isString(label) ? label : <FormattedMessage {...label} />}{' '}
                        {it.dropdown ? <span className="caret" /> : null}
                    </a>
                ) : null}
                {it.dropdown ? (
                    <div className="dropdown-menu">
                        {items.map((subIt, subIndex) =>
                            (get(subIt, 'type', 'item') === 'divider' ? (
                                <div
                                    key={`subitem-${position}-${index}-${subIndex}`}
                                    className="dropdown-divider"
                                />
                            ) : (
                                <a
                                    key={`subitem-${position}-${index}-${subIndex}`}
                                    href={subIt.link || '#'}
                                    className={classNames({
                                        'dropdown-item': true,
                                    })}
                                    onClick={e =>
                                        this.onClickItem(e, subIt, subIndex, position)
                                    }
                                >
                                    {isString(subIt.label || '') ? (
                                        subIt.label
                                    ) : (
                                        <FormattedMessage {...subIt.label || null} />
                                    )}{' '}
                                    {it.dropdown ? <span className="caret" /> : null}
                                </a>
                            )))}
                    </div>
                ) : null}
            </li>
        );
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

        return (
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <a href={titleLink} className="navbar-brand" onClick={this.onClickTitle}>
                    {title}
                </a>
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
                    {this.renderItems(leftItems, 'left')}
                    {this.renderItems(rightItems, 'right')}
                </div>
            </nav>
        );
    }
}

Navbar.propTypes = propTypes;
Navbar.defaultProps = defaultProps;

export default Navbar;
