/* eslint-disable react/jsx-props-no-spreading */
import { faEdit, faEye, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useResourceUrlGenerator } from '@panneau/core/hooks';
import Buttons from '@panneau/element-buttons';

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
                [
                    ...(showUrl !== null || url !== null
                        ? [
                              {
                                  id: 'show',
                                  label: iconsOnly ? <FontAwesomeIcon icon={faEye} /> : showLabel,
                                  href: showUrl || url,
                                  external: true,
                                  theme: 'info',
                                  target: '_blank',
                                  onClick: onClickShow,
                              },
                          ]
                        : []),
                    {
                        id: 'edit',
                        label: iconsOnly ? <FontAwesomeIcon icon={faEdit} /> : editLabel,
                        href:
                            urlGenerator !== null
                                ? urlGenerator('edit', {
                                      id,
                                  })
                                : null,
                        theme: 'primary',
                        onClick: onClickEdit,
                    },
                    {
                        id: 'delete',
                        label: iconsOnly ? <FontAwesomeIcon icon={faTrash} /> : deleteLabel,
                        href:
                            urlGenerator !== null
                                ? urlGenerator('delete', {
                                      id,
                                  })
                                : null,
                        theme: 'danger',
                        onClick: onClickDelete,
                    },
                ].filter(({ id: actionId }) => actions.indexOf(actionId) !== -1)
            }
            outline
            className={className}
        />
    );
};

ItemActions.propTypes = propTypes;
ItemActions.defaultProps = defaultProps;

export default ItemActions;
