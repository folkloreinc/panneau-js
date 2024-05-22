/* eslint-disable react/no-unstable-nested-components, react/jsx-props-no-spreading, react/jsx-indent */
import isObject from 'lodash-es/isObject';
// import isString from 'lodash-es/isString';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useActionsComponentsManager } from '@panneau/core/contexts';
import { useActions, useResourceUrlGenerator } from '@panneau/core/hooks';
import Buttons from '@panneau/element-buttons';
import Icon from '@panneau/element-icon';

// TODO: this one is unused now?

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
    duplicateLabel: PropTypes.node,
    reload: PropTypes.func,
    updateItem: PropTypes.func,
    onClickShow: PropTypes.func,
    onClickEdit: PropTypes.func,
    onClickDelete: PropTypes.func,
    onClickDuplicate: PropTypes.func,
    getShowPropsFromItem: PropTypes.func,
    getEditPropsFromItem: PropTypes.func,
    getDeletePropsFromItem: PropTypes.func,
    getDuplicatePropsFromItem: PropTypes.func,
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
    duplicateLabel: <FormattedMessage defaultMessage="Duplicate" description="Button label" />,
    reload: null,
    updateItem: null,
    onClickShow: null,
    onClickEdit: null,
    onClickDelete: null,
    onClickDuplicate: null,
    getShowPropsFromItem: null,
    getEditPropsFromItem: null,
    getDeletePropsFromItem: null,
    getDuplicatePropsFromItem: null,
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
    duplicateLabel,
    reload,
    updateItem,
    onClickShow,
    onClickEdit,
    onClickDelete,
    onClickDuplicate,
    getShowPropsFromItem,
    getEditPropsFromItem,
    getDeletePropsFromItem,
    getDuplicatePropsFromItem,
    withoutItemShowUrl,
    itemLinkProp,
    className,
}) => {
    const urlGenerator = useResourceUrlGenerator(resource);
    const componentsManager = useActionsComponentsManager();
    const actionItems = items || actions || [];
    const finalActions = useActions(item, actionItems, urlGenerator, {
        iconsOnly,
        showLabel,
        showUrl,
        editLabel,
        deleteLabel,
        duplicateLabel,
        onClickShow,
        onClickEdit,
        onClickDelete,
        onClickDuplicate,
        getShowPropsFromItem,
        getEditPropsFromItem,
        getDeletePropsFromItem,
        getDuplicatePropsFromItem,
        withoutItemShowUrl,
        itemLinkProp,
    });
    return (
        <Buttons
            size={size}
            items={finalActions
                .map((action = null) => {
                    if (action !== null) {
                        if (isObject(action)) {
                            const {
                                label = null,
                                icon = null,
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
                                ...(ActionComponent !== null ? { reload, updateItem } : null),
                                label: iconsOnly && icon !== null ? null : label,
                                icon: iconsOnly && icon !== null ? <Icon name={icon} /> : null,
                                ...(itemLinkProp !== null && item !== null && item[itemLinkProp]
                                    ? { href: item[itemLinkProp], ...linkProps }
                                    : null),
                            };
                        }
                    }
                    return null;
                })
                .filter((action) => action !== null)}
            className={className}
        />
    );
};

ItemActions.propTypes = propTypes;
ItemActions.defaultProps = defaultProps;

export default ItemActions;
