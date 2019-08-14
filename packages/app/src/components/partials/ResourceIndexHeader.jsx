/* eslint-disable jsx-a11y/anchor-is-valid, react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { getLocalizedName } from '@panneau/core/utils';
import { Button, Label } from '@panneau/core/components';

import styles from '../../styles/partials/resource-index-header.scss';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
    title: PanneauPropTypes.label,
    showAddButton: PropTypes.bool,
    addButtonLabel: PanneauPropTypes.label,
    getResourceActionUrl: PropTypes.func.isRequired,
};

const defaultProps = {
    title: null,
    showAddButton: true,
    addButtonLabel: null,
};

const ResourceIndexHeader = ({
    resource,
    showAddButton,
    title,
    addButtonLabel,
    getResourceActionUrl,
}) => {
    const isTyped = resource.type() === 'typed';
    const resourceName = resource.localizedName('plural');

    // Title
    const resourceTitle = resource.message(
        'titles.resources.index',
        <Label values={{ name: resourceName }}>{title}</Label>,
    );

    // Add button
    const resourceAddButtonLabel = resource.message(
        'buttons.resources.add',
        <Label values={{ name: resourceName }}>{addButtonLabel}</Label>,
    );

    return (
        <div className={classNames(['py-4', styles.header])}>
            <div className={styles.cols}>
                <div className={styles.col}>
                    <h1 className={classNames([styles.title, 'mb-0', 'mt-0'])}>{resourceTitle}</h1>
                </div>
                <div className={classNames([styles.col, 'text-right'])}>
                    {showAddButton ? (
                        <Button
                            href={isTyped ? getResourceActionUrl('create') : null}
                            dropdown={
                                isTyped
                                    ? resource.types().map((type) => ({
                                          href: `${getResourceActionUrl('create')}?type=${type.id}`,
                                          label: getLocalizedName(type),
                                      }))
                                    : null
                            }
                        >
                            {isTyped ? (
                                <>
                                    {resourceAddButtonLabel} <span className="caret" />
                                </>
                            ) : (
                                resourceAddButtonLabel
                            )}
                        </Button>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

ResourceIndexHeader.propTypes = propTypes;
ResourceIndexHeader.defaultProps = defaultProps;

export default ResourceIndexHeader;
