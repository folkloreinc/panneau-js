/* eslint-disable react/button-has-type */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import classNames from 'classnames';
import SplitPane from 'react-split-pane';
import { withPreviewsCollection, PropTypes as PanneauPropTypes } from '@panneau/core';
import NormalForm from '@panneau/form-normal';

import styles from './styles.scss';

const propTypes = {
    previewsCollection: PanneauPropTypes.componentsCollection.isRequired,
    preview: PropTypes.string,
    formWidth: PropTypes.number,
    formMinWidth: PropTypes.number,
    formMaxWidth: PropTypes.number,
};

const defaultProps = {
    preview: 'json',
    formWidth: 300,
    formMinWidth: 200,
    formMaxWidth: null,
};

// eslint-disable-next-line react/prefer-stateless-function
class PreviewForm extends Component {
    render() {
        const {
            value,
            preview,
            previewsCollection,
            formWidth,
            formMinWidth,
            formMaxWidth,
            ...props
        } = this.props;

        const PreviewComponent = previewsCollection.getComponent(preview);

        return (
            <div className={styles.container}>
                <SplitPane
                    split="vertical"
                    defaultSize={formWidth}
                    minSize={formMinWidth}
                    maxSize={formMaxWidth}
                    style={{ position: 'relative' }}
                >
                    <div
                        className={styles.form}
                    >
                        <NormalForm value={value} {...props} />
                    </div>
                    <div
                        className={styles.preview}
                    >
                        {PreviewComponent !== null ? (
                            <PreviewComponent value={value} {...props} />
                        ) : null}
                    </div>
                </SplitPane>
            </div>
        );
    }
}

PreviewForm.propTypes = propTypes;
PreviewForm.defaultProps = defaultProps;

export default withPreviewsCollection()(PreviewForm);
