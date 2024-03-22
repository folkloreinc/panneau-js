/* eslint-disable react/no-array-index-key, react/jsx-props-no-spreading */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';

// import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useModal } from '@panneau/core/contexts';

import styles from './styles.module.scss';

const propTypes = {
    theme: PropTypes.string,
    className: PropTypes.string,
};

const defaultProps = {
    theme: null,
    className: null,
};

const Modals = ({ theme, className }) => {
    const { modals = null, setContainer = null } = useModal();

    const containerRef = useRef(null);

    useEffect(() => {
        if (setContainer !== null) {
            setContainer(containerRef.current);
        }
    }, [setContainer]);

    useEffect(() => {
        if (document.body) {
            if (modals !== null && modals.length > 0) {
                document.body.className = 'modal-open';
            } else {
                document.body.className = '';
            }
        }
    }, [modals]);

    return (
        <div
            className={classNames([
                styles.modalsContainer,
                {
                    [className]: className,
                },
            ])}
            data-bs-theme={theme !== null ? theme : null}
            style={{ color: theme === 'dark' ? '#FFF' : null }}
        >
            <div
                className={classNames([
                    styles.modals,
                    {
                        [styles.hasModals]: modals !== null && modals.length > 0,
                    },
                ])}
                ref={containerRef}
            />
        </div>
    );
};

Modals.propTypes = propTypes;
Modals.defaultProps = defaultProps;

export default Modals;
