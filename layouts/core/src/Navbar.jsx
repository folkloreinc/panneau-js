import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import get from 'lodash/get';

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
            dropdownOpenedIndex: -1,
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
        if (it.dropdown) {
            e.preventDefault();
            this.setState(({ dropdownOpenedIndex }) => ({
                dropdownOpenedIndex: index !== dropdownOpenedIndex ? index : -1,
            }));
        }

        const { onClickItem } = this.props;
        if (onClickItem !== null) {
            onClickItem(e, it, index, position);
        }
    }

    renderItem(it, index, position) {
        const { dropdownOpenedIndex } = this.state;
        const link = get(it, 'link', '#');
        const divider = get(it, 'type', 'item') === 'divider';
        const items = get(it, 'items', null);
        const linkProps = it.dropdown ? {
            role: 'button',
            'data-toggle': 'dropdown',
            'aria-haspopup': 'true',
            'aria-expanded': 'false',
        } : {};

        return (
            <li
                key={`item-${position}-${index}`}
                className={classNames({
                    dropdown: it.dropdown,
                    divider,
                    open: dropdownOpenedIndex === it.index,
                })}
            >
                { !divider ? (
                    <a
                        href={link}
                        className={classNames({
                            'dropdown-toggle': it.dropdown,
                        })}
                        {...linkProps}
                        onClick={e => this.onClickItem(e, it, index, position)}
                    >
                        { it.label } { it.dropdown ? (<span className="caret" />) : null }
                    </a>
                ) : null }
                { it.dropdown ? (
                    <ul className="dropdown-menu">
                        { items.map((subIt, subIndex) => (
                            this.renderItem(subIt, subIndex, `${position}-${index}-dropdown`)
                        )) }
                    </ul>
                ) : null }
            </li>
        );
    }

    renderItems(items, position) {
        return (
            <ul
                className={classNames({
                    nav: true,
                    'navbar-nav': true,
                    'navbar-right': position === 'right',
                })}
            >
                { items.map((it, index) => this.renderItem(it, index, position)) }
            </ul>
        );
    }

    render() {
        const {
            title,
            titleLink,
            items,
        } = this.props;

        const { opened } = this.state;

        const itemsWithIndex = items.map((it, index) => ({
            ...it,
            dropdown: get(it, 'type', 'item') !== 'divider' && get(it, 'items', null) !== null,
            index,
        }));
        const leftItems = itemsWithIndex.filter(it => get(it, 'position', 'left') === 'left');
        const rightItems = itemsWithIndex.filter(it => get(it, 'position', 'left') === 'right');

        return (
            <nav className="navbar navbar-default">
                <div className="container-fluid">
                    <div className="navbar-header">
                        <button
                            type="button"
                            className="navbar-toggle collapsed"
                            aria-expanded="false"
                            onClick={this.onClickHamburger}
                        >
                            <span className="sr-only">Menu</span>
                            <span className="icon-bar" />
                            <span className="icon-bar" />
                            <span className="icon-bar" />
                        </button>
                        <a
                            href={titleLink}
                            className="navbar-brand"
                            onClick={this.onClickTitle}
                        >
                            { title }
                        </a>
                    </div>

                    <div
                        className={classNames({
                            collapse: true,
                            'navbar-collapse': true,
                            in: opened,
                        })}
                    >
                        { this.renderItems(leftItems, 'left') }
                        { this.renderItems(rightItems, 'right') }
                    </div>
                </div>
            </nav>
        );
    }
}

Navbar.propTypes = propTypes;
Navbar.defaultProps = defaultProps;

export default Navbar;
