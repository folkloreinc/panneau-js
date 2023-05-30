/* eslint-disable react/no-unstable-nested-components, react/jsx-props-no-spreading, react/jsx-indent */
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useActionsComponentsManager } from '@panneau/core/contexts';
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
    actions: PropTypes.arrayOf(
        PropTypes.oneOfType([PropTypes.string, PropTypes.shape({ id: PropTypes.string })]),
    ),
    iconsOnly: PropTypes.bool,
    showLabel: PropTypes.node,
    showUrl: PropTypes.string,
    editLabel: PropTypes.node,
    deleteLabel: PropTypes.node,
    selectLabel: PropTypes.node,
    reload: PropTypes.func,
    reloadPage: PropTypes.func,
    updateItem: PropTypes.func,
    onClickShow: PropTypes.func,
    onClickEdit: PropTypes.func,
    onClickDelete: PropTypes.func,
    onClickSelect: PropTypes.func,
    withoutItemShowUrl: PropTypes.bool,
    className: PropTypes.string,
};

const defaultProps = {
    resource: null,
    items: null,
    actions: ['edit', 'delete'],
    size: 'sm',
    iconsOnly: true,
    showLabel: <FormattedMessage defaultMessage="Show" description="Button label" />,
    showUrl: null,
    editLabel: <FormattedMessage defaultMessage="Edit" description="Button label" />,
    deleteLabel: <FormattedMessage defaultMessage="Delete" description="Button label" />,
    selectLabel: <FormattedMessage defaultMessage="Select" description="Button label" />,
    reload: null,
    reloadPage: null,
    updateItem: null,
    onClickShow: null,
    onClickEdit: null,
    onClickDelete: null,
    onClickSelect: null,
    withoutItemShowUrl: false,
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
    selectLabel,
    reload,
    reloadPage,
    updateItem,
    onClickShow,
    onClickEdit,
    onClickDelete,
    onClickSelect,
    withoutItemShowUrl,
    className,
}) => {
    const urlGenerator = useResourceUrlGenerator(resource);
    const { id, url = null } = item || {};
    const hasCustomShowUrl = showUrl !== null || url !== null;
    const componentsManager = useActionsComponentsManager();

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
                                    linkProps = null,
                                    component = null,
                                    ...otherProps
                                } = action;
                                const ActionComponent =
                                    component !== null
                                        ? componentsManager.getComponent(component)
                                        : null;
                                return {
                                    renderButton:
                                        ActionComponent !== null
                                            ? (buttonProps, index, fixedProps) => (
                                                  <ActionComponent
                                                      resource={resource}
                                                      item={item}
                                                      {...fixedProps}
                                                      {...buttonProps}
                                                  />
                                              )
                                            : null,
                                    ...otherProps,
                                    ...(ActionComponent !== null
                                        ? { reload, reloadPage, updateItem }
                                        : null),
                                    label: iconsOnly && icon !== null ? null : label,
                                    icon: iconsOnly && icon !== null ? <Icon name={icon} /> : null,
                                    ...(itemLinkProp !== null && item !== null && item[itemLinkProp]
                                        ? { href: item[itemLinkProp], ...linkProps }
                                        : null),
                                };
                            }
                            if (isString(action)) {
                                switch (action) {
                                    case 'show':
                                        return {
                                            id: 'show',
                                            label: iconsOnly ? null : showLabel,
                                            icon: iconsOnly ? <Icon name="eye-fill" /> : null,
                                            href:
                                                urlGenerator !== null &&
                                                (!hasCustomShowUrl || withoutItemShowUrl)
                                                    ? urlGenerator('show', {
                                                          id,
                                                      })
                                                    : showUrl || url,
                                            external: hasCustomShowUrl,
                                            theme: 'info',
                                            target: '_blank',
                                            onClick: onClickShow,
                                        };

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
                                    case 'select':
                                        return {
                                            id: 'select',
                                            label: iconsOnly ? null : selectLabel,
                                            icon: iconsOnly ? <Icon name="check-circle" /> : null,
                                            theme: 'primary',
                                            onClick: () => onClickSelect(item),
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
