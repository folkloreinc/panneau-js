import get from 'lodash/get';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import { useIntl } from 'react-intl';

import { type ActionDefinition, type ActionValue, type Resource } from '@panneau/core';
import { useResourceUrlGenerator } from '@panneau/core/hooks';

// For backwards compatibility with the old actions element

interface UseActionsOptions {
    resource?: Resource | null;
    disabled?: boolean;
    iconsOnly?: boolean;
    showLabel?: string | null;
    editLabel?: string | null;
    deleteLabel?: string | null;
    onClickShow?: (() => void) | null;
    onClickEdit?: (() => void) | null;
    onClickDelete?: (() => void) | null;
    getShowPropsFromValue?: ((item: ActionValue) => Record<string, unknown>) | null;
    getEditPropsFromValue?: ((item: ActionValue) => Record<string, unknown>) | null;
    getDeletePropsFromValue?: ((item: ActionValue) => Record<string, unknown>) | null;
    showUrl?: string | null;
    withoutItemShowUrl?: boolean | null;
    preferEditModal?: boolean;
    preferDeleteModal?: boolean;
    hasDuplicateRoute?: boolean;
}

function useActions(
    actions: ActionDefinition[] = [],
    value: ActionValue = null,
    {
        disabled: globalDisabled = false,
        resource = null,
        iconsOnly = true,
        showLabel = null,
        editLabel = null,
        deleteLabel = null,
        onClickShow = null,
        onClickEdit = null,
        onClickDelete = null,
        getShowPropsFromValue = null,
        getEditPropsFromValue = null,
        getDeletePropsFromValue = null,
        showUrl = null,
        withoutItemShowUrl = null,
        preferEditModal = false,
        preferDeleteModal = false,
        hasDuplicateRoute = false,
    }: UseActionsOptions = {},
): Record<string, unknown>[] {
    const resourceUrl = useResourceUrlGenerator(resource);
    const { locale } = useIntl();
    const { id, url: itemUrl = null } = isObject(value) ? value : {};
    const { url = null } =
        itemUrl !== null && locale !== null && isObject(itemUrl)
            ? { url: itemUrl[locale] || null }
            : { url: itemUrl };

    const hasCustomShowUrl = showUrl !== null || url !== null;
    const withoutValue = value === null || (isArray(value) && value.length === 0);
    return (actions || [])
        .map((action) => {
            if (isString(action)) {
                switch (action) {
                    case 'show':
                        return {
                            id: 'show',
                            component: 'show',
                            label: iconsOnly ? null : showLabel,
                            icon: iconsOnly ? 'eye' : null,
                            href:
                                !hasCustomShowUrl || withoutItemShowUrl
                                    ? resourceUrl('show', {
                                          id,
                                      }) || null
                                    : showUrl || url,
                            external: hasCustomShowUrl,
                            theme: 'info',
                            target: '_blank',
                            onClick: onClickShow,
                            ...(getShowPropsFromValue !== null
                                ? getShowPropsFromValue(value)
                                : null),
                        };
                    case 'edit':
                        return {
                            id: 'edit',
                            component: 'edit',
                            label: iconsOnly ? null : editLabel,
                            icon: iconsOnly ? 'pencil-square' : null,
                            href: !preferEditModal
                                ? resourceUrl('edit', {
                                      id,
                                  }) || null
                                : null,
                            theme: 'primary',
                            onClick: onClickEdit,
                            ...(getEditPropsFromValue !== null
                                ? getEditPropsFromValue(value)
                                : null),
                        };
                    case 'duplicate':
                        return {
                            id: 'duplicate',
                            component: 'duplicate',
                            label: null,
                            href: hasDuplicateRoute
                                ? resourceUrl('duplicate', {
                                      id,
                                  }) || null
                                : null,
                        };
                    case 'restore':
                        return { id: 'restore', component: 'restore', label: null };
                    case 'delete':
                        return {
                            id: 'delete',
                            component: 'delete',
                            label: iconsOnly ? null : deleteLabel,
                            icon: iconsOnly ? 'trash3' : null,
                            href: !preferDeleteModal
                                ? resourceUrl('delete', {
                                      id,
                                  }) || null
                                : null,
                            theme: 'danger',
                            onClick: onClickDelete,
                            endpoint: preferDeleteModal
                                ? resourceUrl('delete', {
                                      id,
                                  }) || null
                                : null,
                            withConfirmation: preferDeleteModal,
                            ...(getDeletePropsFromValue !== null
                                ? getDeletePropsFromValue(value)
                                : null),
                        };

                    default:
                        break;
                }
            }

            if (isObject(action)) {
                const { itemLinkProp = null, urlPath } = action || {};
                const finalPath = itemLinkProp || urlPath;
                const actionLink = get(value, finalPath) || null;
                return {
                    ...(actionLink !== null ? { href: actionLink } : null),
                    ...action,
                };
            }

            return action;
        })
        .filter((action) => action !== null)
        .map((action) => {
            if (!isArray(value)) {
                return action;
            }
            const { multiple = false, global = false, outlineDisabled = true } = action || {};
            const enabled = multiple ? value.length > 0 : value.length === 1;
            const finalDisabled = !global && (globalDisabled || withoutValue || !enabled);
            return {
                disabled: finalDisabled,
                outline: finalDisabled && outlineDisabled,
                ...action,
            };
        });
}

export default useActions;
