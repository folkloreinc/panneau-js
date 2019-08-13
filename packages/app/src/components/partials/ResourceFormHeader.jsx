import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FormattedHTMLMessage, defineMessages, injectIntl } from 'react-intl';
import get from 'lodash/get';
import { PropTypes as PanneauPropTypes, isMessage } from '@panneau/core';
import { Button } from '@panneau/core/components'
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
    resource: PanneauPropTypes.definitions.resource.isRequired,
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
    const { types = [] } = resource;

    const name = useMemo(
        () => get(resource, 'messages.names.a', get(resource, 'messages.name', resource.name)),
        [resource],
    );
    const resourceTitle = useMemo(() => {
        const customTitle =
            type !== null
                ? get(
                      resource,
                      `messages.titles.resources.${action}_${type.id}`,
                      get(
                          resource,
                          `messages.titles.resources.${action}_typed`,
                          get(
                              resource,
                              `messages.titles.resources.${action}`,
                              get(resource, 'messages.titles.resources.default', null),
                          ),
                      ),
                  )
                : get(
                      resource,
                      `messages.titles.resources.${action}`,
                      get(resource, 'messages.titles.resources.default', null),
                  );
        const defaultTitle = type !== null ? titleTyped : title;
        return customTitle || defaultTitle;
    }, [resource, action, type]);
    const titleElement = (
        <h1 className={classNames(['mb-0', 'mt-0', styles.title])}>
            {isMessage(resourceTitle) ? (
                <FormattedHTMLMessage
                    {...resourceTitle}
                    tagName="span"
                    values={{ name, type: type !== null ? type.label : null }}
                />
            ) : (
                resourceTitle
            )}
        </h1>
    );

    const onClickSwitchType = e => {
        const confirmMessage = isMessage(confirmSwitchTypeMessage)
            ? intl.formatMessage(confirmSwitchTypeMessage, {
                  type: type.label,
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
                            dropdown={types.map(({ id, label }) => ({
                                label,
                                href: `${urlGenerator.route('resource.create', {
                                    resource: resource.id,
                                })}?type=${id}`,
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
