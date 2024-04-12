import isString from 'lodash/isString';

const useActions = (
    item = null,
    actions = [],
    urlGenerator = null,
    {
        iconsOnly = true,
        showLabel = null,
        editLabel = null,
        deleteLabel = null,
        duplicateLabel = null,
        onClickShow = null,
        onClickEdit = null,
        onClickDelete = null,
        onClickDuplicate = null,
        getShowPropsFromItem = null,
        getEditPropsFromItem = null,
        getDeletePropsFromItem = null,
        getDuplicatePropsFromItem = null,
        showUrl = null,
        withoutItemShowUrl = null,
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
                            icon: iconsOnly ? 'eye-fill' : null,
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
                                urlGenerator !== null
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
                            label: iconsOnly ? null : duplicateLabel,
                            icon: iconsOnly ? 'copy' : null,
                            href:
                                urlGenerator !== null
                                    ? urlGenerator('duplicate', {
                                          id,
                                      }) || null
                                    : null,
                            theme: 'warning',
                            onClick: onClickDuplicate,
                            ...(getDuplicatePropsFromItem !== null
                                ? getDuplicatePropsFromItem(item)
                                : null),
                        };
                    case 'delete':
                        return {
                            id: 'delete',
                            component: 'delete',
                            label: iconsOnly ? null : deleteLabel,
                            icon: iconsOnly ? 'trash3' : null,
                            href:
                                urlGenerator !== null
                                    ? urlGenerator('delete', {
                                          id,
                                      }) || null
                                    : null,
                            theme: 'danger',
                            onClick: onClickDelete,
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
