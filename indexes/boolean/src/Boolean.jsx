import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';

import Label from '@panneau/element-label';

import styles from './styles.module.scss';

const messages = defineMessages({
    yes: {
        id: 'yes',
        defaultMessage: 'Oui',
    },
    no: {
        id: 'no',
        defaultMessage: 'Non',
    },
});

const propTypes = {
    value: PropTypes.string,
};

const defaultProps = {
    value: null,
};

const Boolean = ({ value }) => (
    <div className={styles.container}>
        {value !== null && value === true ? (
            <span className="badge badge-success">
                <Label>{messages.yes}</Label>
            </span>
        ) : (
            <span className="badge badge-warning">
                <Label>{messages.no}</Label>
            </span>
        )}
    </div>
);
Boolean.propTypes = propTypes;
Boolean.defaultProps = defaultProps;

export default Boolean;
