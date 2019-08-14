/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import { Header, Footer } from '@panneau/layout';
import { useDefinition } from '@panneau/core/contexts';

import styles from './styles.scss';

const propTypes = {
    children: PropTypes.node,
    header: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    footer: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    gotoHome: PropTypes.func.isRequired,
    gotoLink: PropTypes.func.isRequired,
    gotoRoute: PropTypes.func.isRequired,
};

const defaultProps = {
    children: null,
    header: true,
    footer: true,
};

const NormalLayout = ({ header, footer, children, gotoHome, gotoLink, gotoRoute }) => {
    const definition = useDefinition();
    return (
        <div className={styles.container}>
            {header !== false ? (
                <div className={styles.header}>
                    <Header
                        title={definition.localizedName()}
                        {...header}
                        gotoHome={gotoHome}
                        gotoLink={gotoLink}
                        gotoRoute={gotoRoute}
                    />
                </div>
            ) : null}

            <div className={styles.content}>{children}</div>

            {footer !== false ? (
                <div className={styles.footer}>
                    <Footer
                        {...footer}
                        gotoHome={gotoHome}
                        gotoLink={gotoLink}
                        gotoRoute={gotoRoute}
                    />
                </div>
            ) : null}
        </div>
    );
};

NormalLayout.propTypes = propTypes;
NormalLayout.defaultProps = defaultProps;

export default NormalLayout;
