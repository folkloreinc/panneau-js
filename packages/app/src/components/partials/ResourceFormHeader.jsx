import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { defineMessages, injectIntl } from 'react-intl';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { isMessage, getLocalizedName } from '@panneau/core/utils';
import { Button, Label } from '@panneau/core/components';
import { useUrlGenerator } from '@panneau/core/contexts';

import styles from '../../styles/partials/resource-form-header.scss';

const messages = defineMessages({
    switchType: {
        id: 'app.buttons.resources.switch_type',
        description: 'The label of the select type button',
        defaultMessage: 'Switch type',
    },
    confirmSwitchType: {
        id: 'app.resources.form.confirm_switch_type',
        description: 'The confirm message when switching type',
        defaultMessage: 'Are you sure you want to switch type?',
    },
});

const propTypes = {
    intl: PanneauPropTypes.intl.isRequired,
    action: PropTypes.string,
    type: PropTypes.definitionFormType,
    fullscreen: PanneauPropTypes.bool,
    resource: PanneauPropTypes.resource.isRequired,
    title: PanneauPropTypes.label.isRequired,
    titleTyped: PanneauPropTypes.label.isRequired,
    valueHasChanged: PropTypes.bool,
    confirmSwitchTypeMessage: PanneauPropTypes.label,
};

const defaultProps = {
    action: 'create',
    type: null,
    confirmSwitchTypeMessage: messages.confirmSwitchType,
    fullscreen: false,
    valueHasChanged: false,
};

const ResourceFormHeader = ({
    intl,
    resource,
    type,
    fullscreen,
    action,
    title,
    titleTyped,
    valueHasChanged,
    confirmSwitchTypeMessage,
}) => {
    const urlGenerator = useUrlGenerator();
    const localizedName = resource.localizedName('a');

    const resourceTitle = useMemo(() => {
        const customTitle =
            type !== null
                ? resource.message(`titles.resources.${action}_${type.id}`) ||
                  resource.message(`titles.resources.${action}_typed`) ||
                  resource.message(`titles.resources.${action}`) ||
                  resource.message('titles.resources.default', null)
                : resource.message(`titles.resources.${action}`) ||
                  resource.message('titles.resources.default', null);
        const defaultTitle = type !== null ? titleTyped : title;
        return customTitle || defaultTitle;
    }, [resource, action, type]);

    const titleElement = (
        <h1 className={classNames(['mb-0', 'mt-0', styles.title])}>
            <Label
                isHtml
                values={{
                    name: localizedName,
                    type: type !== null ? getLocalizedName(type) : null,
                }}
            >
                {resourceTitle}
            </Label>
        </h1>
    );

    const onClickSwitchType = e => {
        const confirmMessage = isMessage(confirmSwitchTypeMessage)
            ? intl.formatMessage(confirmSwitchTypeMessage, {
                  type: getLocalizedName(type),
              })
            : confirmSwitchTypeMessage;
        // eslint-disable-next-line no-alert
        if (valueHasChanged && !window.confirm(confirmMessage)) {
            e.preventDefault();
        }
    };

    return (
        <div
            className={classNames([
                styles.header,
                {
                    'py-4': !fullscreen,
                    'px-2': fullscreen,
                    'py-3': fullscreen,
                    [styles.isFullscreen]: fullscreen,
                },
            ])}
        >
            {type !== null && action === 'create' ? (
                <div className={classNames(['row', 'no-gutters', 'align-items-center'])}>
                    <div className="col">{titleElement}</div>
                    <div className={classNames(['col', 'col-md-auto', 'text-right'])}>
                        <Button
                            size="sm"
                            dropdown={resource.types().map(({ id, ...typeProps }) => ({
                                label: getLocalizedName(typeProps),
                                href: `${urlGenerator.resource(resource, 'create')}?type=${id}`,
                                active: id === type.id,
                                onClick: onClickSwitchType,
                            }))}
                        >
                            {messages.switchType}
                        </Button>
                    </div>
                </div>
            ) : (
                titleElement
            )}
        </div>
    );
};

ResourceFormHeader.propTypes = propTypes;
ResourceFormHeader.defaultProps = defaultProps;

export default injectIntl(ResourceFormHeader);
