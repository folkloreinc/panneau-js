/* eslint-disable react/jsx-props-no-spreading */
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useResourceUrlGenerator } from '@panneau/core/hooks';
import Buttons from '@panneau/element-buttons';
import Icon from '@panneau/element-icon';

const propTypes = {
    resource: PanneauPropTypes.resource,
    size: PanneauPropTypes.buttonSize,
    item: PanneauPropTypes.item.isRequired,
    items: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
            url: PropTypes.string,
            theme: PropTypes.string,
        }),
    ),
    actions: PropTypes.arrayOf(PropTypes.string),
    iconsOnly: PropTypes.bool,
    showLabel: PropTypes.node,
    showUrl: PropTypes.string,
    editLabel: PropTypes.node,
    deleteLabel: PropTypes.node,
    onClickShow: PropTypes.func,
    onClickEdit: PropTypes.func,
    onClickDelete: PropTypes.func,
    className: PropTypes.string,
};

const defaultProps = {
    resource: null,
    items: null,
    actions: ['show', 'edit', 'delete'],
    size: 'sm',
    iconsOnly: true,
    showLabel: <FormattedMessage defaultMessage="Show" description="Button label" />,
    showUrl: null,
    editLabel: <FormattedMessage defaultMessage="Edit" description="Button label" />,
    deleteLabel: <FormattedMessage defaultMessage="Delete" description="Button label" />,
    onClickShow: null,
    onClickEdit: null,
    onClickDelete: null,
    className: null,
};

const ItemActions = ({
    resource,
    size,
    item,
    items,
    actions,
    iconsOnly,
    showLabel,
    showUrl,
    editLabel,
    deleteLabel,
    onClickShow,
    onClickEdit,
    onClickDelete,
    className,
}) => {
    const urlGenerator = useResourceUrlGenerator(resource);
    const { id, url = null } = item || {};

    return (
        <Buttons
            size={size}
            items={
                items ||
                (actions || [])
                    .map((action = null) => {
                        if (action !== null) {
                            if (isObject(action)) {
                                const {
                                    label = null,
                                    icon = null,
                                    itemLinkProp = null,
                                    ...otherProps
                                } = action;
                                return {
                                    ...otherProps,
                                    label: iconsOnly && icon !== null ? null : label,
                                    icon: iconsOnly && icon !== null ? <Icon name={icon} /> : null,
                                    ...(itemLinkProp !== null && item !== null && item[itemLinkProp]
                                        ? { href: item[itemLinkProp] }
                                        : null),
                                };
                            }
                            if (isString(action)) {
                                switch (action) {
                                    case 'show':
                                        if (showUrl !== null || url !== null) {
                                            return {
                                                id: 'show',
                                                label: iconsOnly ? null : showLabel,
                                                icon: iconsOnly ? <Icon name="eye-fill" /> : null,
                                                href: showUrl || url,
                                                external: true,
                                                theme: 'info',
                                                target: '_blank',
                                                onClick: onClickShow,
                                            };
                                        }
                                        break;
                                    case 'edit':
                                        return {
                                            id: 'edit',
                                            label: iconsOnly ? null : editLabel,
                                            icon: iconsOnly ? <Icon name="pencil-square" /> : null,
                                            href:
                                                urlGenerator !== null
                                                    ? urlGenerator('edit', {
                                                          id,
                                                      })
                                                    : null,
                                            theme: 'primary',
                                            onClick: onClickEdit,
                                        };
                                    case 'delete':
                                        return {
                                            id: 'delete',
                                            label: iconsOnly ? null : deleteLabel,
                                            icon: iconsOnly ? <Icon name="trash3" /> : null,
                                            href:
                                                urlGenerator !== null
                                                    ? urlGenerator('delete', {
                                                          id,
                                                      })
                                                    : null,
                                            theme: 'danger',
                                            onClick: onClickDelete,
                                        };
                                    default:
                                        break;
                                }
                            }
                        }
                        return null;
                    })
                    .filter((action) => action !== null)
            }
            outline
            className={className}
        />
    );
};

ItemActions.propTypes = propTypes;
ItemActions.defaultProps = defaultProps;

export default ItemActions;
