/* eslint-disable react/button-has-type */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { PropTypes as PanneauPropTypes } from '@panneau/core';

import * as FormPropTypes from './PropTypes';
import FormButtons from './FormButtons';
import FormNotice from './FormNotice';
import styles from './styles/form-actions.scss';

const propTypes = {
    notice: FormPropTypes.notice,
    buttons: PanneauPropTypes.buttons,
    className: PropTypes.string,
    noticeClassName: PropTypes.string,
    buttonsClassName: PropTypes.string,
};

const defaultProps = {
    notice: null,
    buttons: [],
    className: null,
    noticeClassName: null,
    buttonsClassName: null,
};

const FormActions = ({
    notice, buttons, className, noticeClassName, buttonsClassName,
}) => (
    <div
        className={classNames([
            styles.container,
            {
                [className]: className !== null,
            },
        ])}
    >
        <div className={classNames(['row', 'no-gutters', 'align-items-center'])}>
            <div className={classNames(['col-sm', 'col-sm-auto', 'pb-2', 'pb-sm-0', 'text-right'])}>
                <FormButtons buttons={buttons} className={buttonsClassName} />
            </div>
            <div className={classNames(['col-sm', 'order-sm-first', 'pr-sm-3', 'text-right'])}>
                {notice !== null ? (
                    <FormNotice notice={notice} className={noticeClassName} />
                ) : null}
            </div>
        </div>
    </div>
);

FormActions.propTypes = propTypes;
FormActions.defaultProps = defaultProps;

export default FormActions;
