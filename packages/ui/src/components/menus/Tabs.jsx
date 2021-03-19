/* eslint-disable react/no-array-index-key, react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { PropTypes as PanneauPropTypes } from '../../lib';
import Buttons from '../buttons/Buttons';

import styles from '../../styles/menus/tabs.module.scss';

const propTypes = {
    items: PanneauPropTypes.menuItems,
    size: PanneauPropTypes.buttonSize,
    theme: PanneauPropTypes.buttonTheme,
    renderItemButton: PropTypes.func,
    buttonClassName: PropTypes.string,
    className: PropTypes.string,
    onClickItem: PropTypes.func,
};

const defaultProps = {
    items: [],
    size: null,
    theme: 'secondary',
    renderItemButton: null,
    buttonClassName: null,
    className: null,
    onClickItem: null,
};

const TabsMenu = ({
    items,
    size,
    theme,
    renderItemButton,
    buttonClassName,
    className,
    onClickItem,
}) => (
    <div
        className={classNames([
            styles.container,
            {
                [className]: className,
            },
        ])}
    >
        <Buttons
            buttons={items}
            size={size}
            theme={theme}
            renderButton={renderItemButton}
            onClickButton={onClickItem}
            className={styles.buttons}
            buttonClassName={classNames([
                styles.button,
                {
                    [buttonClassName]: buttonClassName !== null,
                },
            ])}
        />
    </div>
);

TabsMenu.propTypes = propTypes;
TabsMenu.defaultProps = defaultProps;

export default TabsMenu;
