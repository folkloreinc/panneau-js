import isString from 'lodash/isString';

// For backwards compatibility with the old actions element

const useActions = (
    item = null,
    actions = [],
    urlGenerator = null,
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
    } = {},
) => {
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
                    // case 'duplicate':
                    //     return {
                    //         id: 'duplicate',
                    //         component: 'duplicate',
                    //         label: iconsOnly ? null : duplicateLabel,
                    //         icon: iconsOnly ? 'copy' : null,
                    //         href:
                    //             urlGenerator !== null && !preferDuplicateModal
                    //                 ? urlGenerator('duplicate', {
                    //                       id,
                    //                   }) || null
                    //                 : null,
                    //         theme: 'warning',
                    //         onClick: onClickDuplicate,
                    //         endpoint:
                    //             urlGenerator !== null && preferDuplicateModal
                    //                 ? urlGenerator('duplicate', {
                    //                       id,
                    //                   }) || null
                    //                 : null,
                    //         ...(getDuplicatePropsFromItem !== null
                    //             ? getDuplicatePropsFromItem(item)
                    //             : null),
                    //     };
                    case 'duplicate':
                        return { id: 'duplicate', component: 'duplicate' };
                    case 'restore':
                        return { id: 'restore', component: 'restore' };
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
            return action;
        })
        .filter((action) => action !== null);
};

export default useActions;
