import { faCheckCircle, faSpinner, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import Label from '@panneau/element-label';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

const propTypes = {
    status: PanneauPropTypes.formStatus,
    successLabel: PanneauPropTypes.label,
    errorLabel: PanneauPropTypes.label,
    loadingLabel: PanneauPropTypes.label,
    className: PropTypes.string,
};

const defaultProps = {
    status: null,
    successLabel: <FormattedMessage defaultMessage="Success!" description="Form status" />,
    errorLabel: <FormattedMessage defaultMessage="Error" description="Form status" />,
    loadingLabel: <FormattedMessage defaultMessage="Loading..." description="Form status" />,
    className: null,
};

const FormStatus = ({ status, successLabel, errorLabel, loadingLabel, className }) => {
    let label = null;
    if (status === 'success') {
        label = successLabel;
    } else if (status === 'error') {
        label = errorLabel;
    } else if (status === 'loading') {
        label = loadingLabel;
    }

    let icon = null;
    if (status === 'success') {
        icon = faCheckCircle;
    } else if (status === 'error') {
        icon = faTimesCircle;
    } else if (status === 'loading') {
        icon = faSpinner;
    }

    return (
        <div
            className={classNames([
                'd-flex',
                'align-items-center',
                {
                    [`text-danger`]: status === 'error',
                    [`text-success`]: status === 'success',
                    [`text-muted`]: status === 'loading',
                    [className]: className !== null,
                },
            ])}
        >
            {icon !== null ? (
                <FontAwesomeIcon
                    icon={icon}
                    className={classNames([
                        'me-2',
                        {
                            'fa-spin': status === 'loading',
                        },
                    ])}
                />
            ) : null}
            <Label>{label}</Label>
        </div>
    );
};
FormStatus.propTypes = propTypes;
FormStatus.defaultProps = defaultProps;

export default FormStatus;
