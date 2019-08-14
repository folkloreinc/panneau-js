import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import isString from 'lodash/isString';
import { isMessage } from '@panneau/core/utils';
import { FormattedMessage } from 'react-intl';

import { notice as noticePropTypes } from './PropTypes';
import styles from './styles/form-notice.scss';

const propTypes = {
    notice: noticePropTypes,
    className: PropTypes.string,
};

const defaultProps = {
    notice: null,
    className: null,
};

const FormNotice = ({ notice, className }) => {
    const noticeIsLabel = isString(notice) || isMessage(notice);
    const { type = 'info', label = noticeIsLabel ? notice : null, icon = null } = !noticeIsLabel ? notice : {};
    return (
        <div
            className={classNames([
                styles.container,
                {
                    [className]: className !== null,
                },
            ])}
        >
            <span className={`text-${type === 'error' ? 'danger' : type}`}>
                <span
                    className={classNames(['mr-1', {
                        'fas fa-check-circle': icon === null && type === 'success',
                        'fas fa-exclamation-circle': icon === null && type === 'error',
                        'fas fa-exclamation-triangle': icon === null && type === 'warning',
                        'fas fa-info-circle': icon === null && type === 'info',
                        [icon]: icon !== null,
                    }])}
                />
                {isMessage(label) ? (
                    <FormattedMessage {...label} />
                ) : (
                    label
                )}
            </span>
        </div>
    );
};

FormNotice.propTypes = propTypes;
FormNotice.defaultProps = defaultProps;

export default FormNotice;
