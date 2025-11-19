import isObject from 'lodash-es/isObject';
import isString from 'lodash-es/isString';
import type { Item } from '@panneau/core/types';

// For backwards compatibility with the old actions element

interface UseActionsOptions {
    iconsOnly?: boolean;
    showLabel?: string | null;
    editLabel?: string | null;
    deleteLabel?: string | null;
    onClickShow?: (() => void) | null;
    onClickEdit?: (() => void) | null;
    onClickDelete?: (() => void) | null;
    getShowPropsFromItem?: ((item: Item) => Record<string, unknown>) | null;
    getEditPropsFromItem?: ((item: Item) => Record<string, unknown>) | null;
    getDeletePropsFromItem?: ((item: Item) => Record<string, unknown>) | null;
    showUrl?: string | null;
    withoutItemShowUrl?: boolean | null;
    preferEditModal?: boolean;
    preferDeleteModal?: boolean;
    hasDuplicateRoute?: boolean;
}

type ActionDefinition = string | Record<string, unknown>;
type UrlGenerator = ((action: string, params: Record<string, unknown>) => string) | null;

function useActions(
    item: Item | null = null,
    actions: ActionDefinition[] = [],
    urlGenerator: UrlGenerator = null,
    {
        iconsOnly = true,
        showLabel = null,
        editLabel = null,
        deleteLabel = null,
        onClickShow = null,
        onClickEdit = null,
        onClickDelete = null,
        getShowPropsFromItem = null,
        getEditPropsFromItem = null,
        getDeletePropsFromItem = null,
        showUrl = null,
        withoutItemShowUrl = null,
        preferEditModal = false,
        preferDeleteModal = false,
        hasDuplicateRoute = false,
    }: UseActionsOptions = {},
): Record<string, unknown>[] {
    const { id, url = null } = item || {};
    const hasCustomShowUrl = showUrl !== null || url !== null;
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
                                urlGenerator !== null && (!hasCustomShowUrl || withoutItemShowUrl)
                                    ? urlGenerator('show', {
                                          id,
                                      }) || null
                                    : showUrl || url,
                            external: hasCustomShowUrl,
                            theme: 'info',
                            target: '_blank',
                            onClick: onClickShow,
                            ...(getShowPropsFromItem !== null ? getShowPropsFromItem(item) : null),
                        };
                    case 'edit':
                        return {
                            id: 'edit',
                            component: 'edit',
                            label: iconsOnly ? null : editLabel,
                            icon: iconsOnly ? 'pencil-square' : null,
                            href:
                                urlGenerator !== null && !preferEditModal
                                    ? urlGenerator('edit', {
                                          id,
                                      }) || null
                                    : null,
                            theme: 'primary',
                            onClick: onClickEdit,
                            ...(getEditPropsFromItem !== null ? getEditPropsFromItem(item) : null),
                        };
                    case 'duplicate':
                        return {
                            id: 'duplicate',
                            component: 'duplicate',
                            label: null,
                            href:
                                urlGenerator !== null && hasDuplicateRoute
                                    ? urlGenerator('duplicate', {
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
                            href:
                                urlGenerator !== null && !preferDeleteModal
                                    ? urlGenerator('delete', {
                                          id,
                                      }) || null
                                    : null,
                            theme: 'danger',
                            onClick: onClickDelete,
                            endpoint:
                                urlGenerator !== null && preferDeleteModal
                                    ? urlGenerator('delete', {
                                          id,
                                      }) || null
                                    : null,
                            withConfirmation: preferDeleteModal,
                            ...(getDeletePropsFromItem !== null
                                ? getDeletePropsFromItem(item)
                                : null),
                        };

                    default:
                        break;
                }
            }

            if (isObject(action)) {
                const { itemLinkProp = null } = action || {};
                return {
                    ...action,
                    ...(itemLinkProp !== null &&
                    isObject(item) &&
                    typeof item[itemLinkProp] !== 'undefined'
                        ? { href: item[itemLinkProp] }
                        : null),
                };
            }

            return action;
        })
        .filter((action) => action !== null);
}

export default useActions;
