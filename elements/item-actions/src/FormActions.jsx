/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
// import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

// import * as AppPropTypes from '../../../lib/PropTypes';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useResourceUrlGenerator } from '@panneau/core/hooks';
import Buttons from '@panneau/element-buttons';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
    size: PanneauPropTypes.buttonSize,
    item: PanneauPropTypes.item.isRequired,
    iconsOnly: PropTypes.bool,
    showLabel: PropTypes.node,
    editLabel: PropTypes.node,
    deleteLabel: PropTypes.node,
    onClickEdit: PropTypes.func,
    onClickDelete: PropTypes.func,
    className: PropTypes.string,
};

const defaultProps = {
    size: 'sm',
    iconsOnly: true,
    showLabel: <FormattedMessage defaultMessage="Show" description="Button label" />,
    editLabel: <FormattedMessage defaultMessage="Edit" description="Button label" />,
    deleteLabel: <FormattedMessage defaultMessage="Delete" description="Button label" />,
    onClickEdit: null,
    onClickDelete: null,
    className: null,
};

const FormActions = ({
    resource,
    size,
    item,
    iconsOnly,
    showLabel,
    editLabel,
    deleteLabel,
    onClickEdit,
    onClickDelete,
    className,
}) => {
    const urlGenerator = useResourceUrlGenerator(resource);
    const { id } = item || {};
    return (
        <Buttons
            size={size}
            items={[
                {
                    id: 'show',
                    label: iconsOnly ? <FontAwesomeIcon icon={faEye} /> : showLabel,
                    href:
                        urlGenerator !== null
                            ? urlGenerator('show', {
                                  id,
                              })
                            : null,
                    theme: 'info',
                },
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
            ]}
            outline
            className={className}
        />
    );
};

FormActions.propTypes = propTypes;
FormActions.defaultProps = defaultProps;

export default FormActions;
