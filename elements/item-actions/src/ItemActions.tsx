import isObject from 'lodash-es/isObject';
// import isString from 'lodash-es/isString';
import { type ReactNode } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { useActionsComponentsManager } from '@panneau/core/contexts';
import { useActions, useResourceUrlGenerator } from '@panneau/core/hooks';
import type { ButtonSize, Item, Resource } from '@panneau/core/types';
import Buttons from '@panneau/element-buttons';
import Icon from '@panneau/element-icon';

// TODO: this one is unused now?

interface ItemActionsProps {
    resource?: Resource | null;
    size?: ButtonSize;
    item: Item;
    items?: any[] | null;
    actions?: (string | { id?: string })[];
    iconsOnly?: boolean;
    showLabel?: ReactNode | null;
    showUrl?: string | null;
    editLabel?: ReactNode | null;
    deleteLabel?: ReactNode | null;
    duplicateLabel?: ReactNode | null;
    reload?: (() => void) | null;
    updateItem?: ((item: Item) => void) | null;
    onClickShow?: (() => void) | null;
    onClickEdit?: (() => void) | null;
    onClickDelete?: (() => void) | null;
    onClickDuplicate?: (() => void) | null;
    getShowPropsFromValue?: ((item: Item) => Record<string, unknown>) | null;
    getEditPropsFromValue?: ((item: Item) => Record<string, unknown>) | null;
    getDeletePropsFromValue?: ((item: Item) => Record<string, unknown>) | null;
    getDuplicatePropsFromValue?: ((item: Item) => Record<string, unknown>) | null;
    withoutItemShowUrl?: boolean;
    itemLinkProp?: string | null;
    className?: string | null;
}

const DEFAULT_ACTIONS = ['show', 'edit', 'delete'];

function ItemActions({
    resource = null,
    size = 'sm',
    item,
    items = null,
    actions = DEFAULT_ACTIONS,
    iconsOnly = true,
    showLabel = null,
    showUrl = null,
    editLabel = null,
    deleteLabel = null,
    duplicateLabel = null,
    reload = null,
    updateItem = null,
    onClickShow = null,
    onClickEdit = null,
    onClickDelete = null,
    onClickDuplicate = null,
    getShowPropsFromValue = null,
    getEditPropsFromValue = null,
    getDeletePropsFromValue = null,
    getDuplicatePropsFromValue = null,
    withoutItemShowUrl = false,
    itemLinkProp = null,
    className = null,
}: ItemActionsProps) {
    const { locale = null } = useIntl();
    const urlGenerator = useResourceUrlGenerator(resource);
    const componentsManager = useActionsComponentsManager();
    const actionItems = items || actions || [];

    const finalActions = useActions(item, actionItems as any, urlGenerator, {
        iconsOnly,
        showLabel: showLabel || (
            <FormattedMessage defaultMessage="Show" description="Button label" />
        ),
        showUrl,
        editLabel: editLabel || (
            <FormattedMessage defaultMessage="Edit" description="Button label" />
        ),
        deleteLabel: deleteLabel || (
            <FormattedMessage defaultMessage="Delete" description="Button label" />
        ),
        duplicateLabel: duplicateLabel || (
            <FormattedMessage defaultMessage="Duplicate" description="Button label" />
        ),
        onClickShow,
        onClickEdit,
        onClickDelete,
        onClickDuplicate,
        getShowPropsFromValue,
        getEditPropsFromValue,
        getDeletePropsFromValue,
        getDuplicatePropsFromValue,
        withoutItemShowUrl,
        itemLinkProp,
        locale,
    } as any);

    return (
        <Buttons
            size={size}
            items={finalActions
                .map((action: any = null) => {
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
                                        ? (buttonProps: any, index: number, fixedProps: any) => (
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
                                ...(itemLinkProp !== null &&
                                item !== null &&
                                (item as any)[itemLinkProp]
                                    ? { href: (item as any)[itemLinkProp], ...linkProps }
                                    : null),
                            };
                        }
                    }
                    return null;
                })
                .filter((action: any) => action !== null)}
            className={className}
        />
    );
}

export default ItemActions;
