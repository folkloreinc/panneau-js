import isArray from 'lodash-es/isArray';
import isObject from 'lodash-es/isObject';
import isString from 'lodash-es/isString';

import { Action, type ActionDefinition, type ActionValue, type Resource } from '@panneau/core';

// For backwards compatibility with the old actions element

export interface UseActionsOptions {
    resource?: Resource | null;
    disabled?: boolean;
    iconsOnly?: boolean;
    showUrl?: string | null;
    showLabel?: string | null;
    editLabel?: string | null;
    duplicateLabel?: string | null;
    deleteLabel?: string | null;
    restoreLabel?: string | null;
    onClickShow?: (() => void) | null;
    onClickEdit?: (() => void) | null;
    onClickDuplicate?: (() => void) | null;
    onClickDelete?: (() => void) | null;
    onClickRestore?: (() => void) | null;
    getShowPropsFromValue?: ((value: ActionValue) => Partial<Action> | null) | null;
    getEditPropsFromValue?: ((value: ActionValue) => Partial<Action> | null) | null;
    getDuplicatePropsFromValue?: ((value: ActionValue) => Partial<Action> | null) | null;
    getDeletePropsFromValue?: ((value: ActionValue) => Partial<Action> | null) | null;
    getRestorePropsFromValue?: ((value: ActionValue) => Partial<Action> | null) | null;
    withoutItemShowUrl?: boolean | null;
    withShowModal?: boolean;
    withDuplicateModal?: boolean;
    withEditModal?: boolean;
    withDeleteModal?: boolean;
    withRestoreModal?: boolean;
}

function useActions(
    actions: ActionDefinition[] = [],
    value: ActionValue = null,
    {
        disabled: globalDisabled = false,
        iconsOnly = true,
        showUrl = null,
        showLabel = null,
        editLabel = null,
        duplicateLabel = null,
        deleteLabel = null,
        restoreLabel = null,
        onClickShow = null,
        onClickEdit = null,
        onClickDuplicate = null,
        onClickDelete = null,
        onClickRestore = null,
        getShowPropsFromValue = null,
        getEditPropsFromValue = null,
        getDuplicatePropsFromValue = null,
        getDeletePropsFromValue = null,
        getRestorePropsFromValue = null,
        withShowModal = false,
        withDuplicateModal = false,
        withEditModal = false,
        withDeleteModal = false,
        withRestoreModal = false,
    }: UseActionsOptions = {},
): Action[] {
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
                            href: showUrl,
                            external: showUrl !== null,
                            theme: 'info',
                            target: '_blank',
                            withModal: withShowModal,
                            onClick: onClickShow,
                            ...getShowPropsFromValue?.(value),
                        };
                    case 'edit':
                        return {
                            id: 'edit',
                            component: 'edit',
                            label: iconsOnly ? null : editLabel,
                            icon: iconsOnly ? 'pencil-square' : null,
                            theme: 'primary',
                            withModal: withEditModal,
                            onClick: onClickEdit,
                            ...getEditPropsFromValue?.(value),
                        };
                    case 'duplicate':
                        return {
                            id: 'duplicate',
                            component: 'duplicate',
                            label: iconsOnly ? null : duplicateLabel,
                            icon: iconsOnly ? 'copy' : null,
                            withModal: withDuplicateModal,
                            onClick: onClickDuplicate,
                            ...getDuplicatePropsFromValue?.(value),
                        };
                    case 'restore':
                        return {
                            id: 'restore',
                            component: 'restore',
                            label: iconsOnly ? null : restoreLabel,
                            icon: iconsOnly ? 'recycle' : null,
                            withModal: withRestoreModal,
                            onClick: onClickRestore,
                            ...getRestorePropsFromValue?.(value),
                        };
                    case 'delete':
                        return {
                            id: 'delete',
                            component: 'delete',
                            label: iconsOnly ? null : deleteLabel,
                            icon: iconsOnly ? 'trash3' : null,
                            theme: 'danger',
                            onClick: onClickDelete,
                            withConfirmation: withDeleteModal,
                            ...getDeletePropsFromValue?.(value),
                        };

                    default:
                        break;
                }
            }

            // if (isObject(action)) {
            //     const { itemLinkProp = null, urlPath = null, ...rest } = action || {};
            //     const finalPath = itemLinkProp || urlPath || null;
            //     const actionLink = get(value, finalPath) || null;
            //     return {
            //         ...(actionLink !== null ? { href: actionLink } : null),
            //         ...rest,
            //     };
            // }

            return action;
        })
        .filter((action) => action !== null && isObject(action))
        .map((action: Action) => ({
            multiple: isArray(value),
            disabled: globalDisabled || (isArray(value) ? value.length === 0 : value === null),
            ...action,
        }));
    // .map((action: Action) => {
    //     if (!isArray(value)) {
    //         return action;
    //     }
    //     const { multiple = false, global = false, outlineDisabled = true } = action || {};
    //     const enabled = multiple ? value.length > 0 : value.length === 1;
    //     const finalDisabled = !global && (globalDisabled || withoutValue || !enabled);
    //     return {
    //         disabled: finalDisabled,
    //         outline: finalDisabled && outlineDisabled,
    //         ...action,
    //     };
    // });
}

export default useActions;
