/* eslint-disable react/button-has-type */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import classNames from 'classnames';
import SplitPane from 'react-split-pane';
import {
    PropTypes as PanneauPropTypes,
    withPreviewsCollection,
    withFormsCollection,
} from '@panneau/core';

import styles from './styles.scss';

const stylePropType = PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number]));

const propTypes = {
    formsCollection: PanneauPropTypes.componentsCollection.isRequired,
    previewsCollection: PanneauPropTypes.componentsCollection.isRequired,
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    form: PropTypes.string,
    preview: PropTypes.string,
    paneStyle: stylePropType,
    paneSplit: PropTypes.oneOf(['vertical', 'horizontal']),
    paneStep: PropTypes.number,
    panesStyle: stylePropType,
    paneFormStyle: stylePropType,
    panePreviewStyle: stylePropType,
    paneResizerStyle: stylePropType,
    formWidth: PropTypes.number,
    formMinWidth: PropTypes.number,
    formMaxWidth: PropTypes.number,
    formStyle: stylePropType,
    previewStyle: stylePropType,
};

const defaultProps = {
    value: null,
    form: 'normal',
    preview: 'json',
    paneStyle: { position: 'relative' },
    paneSplit: 'vertical',
    paneStep: 1,
    panesStyle: null,
    paneFormStyle: null,
    panePreviewStyle: null,
    paneResizerStyle: null,
    formWidth: 300,
    formMinWidth: 200,
    formMaxWidth: null,
    formStyle: null,
    previewStyle: null,
};

// eslint-disable-next-line react/prefer-stateless-function
export class PreviewForm extends Component {
    render() {
        const {
            formsCollection,
            previewsCollection,
            value,
            form,
            preview,
            paneStyle,
            paneSplit,
            paneStep,
            panesStyle,
            paneFormStyle,
            panePreviewStyle,
            paneResizerStyle,
            formWidth,
            formMinWidth,
            formMaxWidth,
            formStyle,
            previewStyle,
            ...props
        } = this.props;

        const FormComponent = formsCollection.getComponent(form);
        const PreviewComponent = previewsCollection.getComponent(preview);

        return (
            <div className={styles.container}>
                <SplitPane
                    split={paneSplit}
                    step={paneStep}
                    defaultSize={formWidth}
                    minSize={formMinWidth}
                    maxSize={formMaxWidth}
                    style={paneStyle}
                    paneStyle={panesStyle}
                    pane1Style={paneFormStyle}
                    pane2Style={panePreviewStyle}
                    resizerStyle={paneResizerStyle}
                >
                    <div className={styles.form}>
                        {FormComponent !== null ? <FormComponent value={value} {...props} /> : null}
                    </div>
                    <div className={styles.preview}>
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

const WithPreviewCollectionContainer = withPreviewsCollection()(PreviewForm);
const WithFormsCollectionContainer = withFormsCollection()(WithPreviewCollectionContainer);
export default WithFormsCollectionContainer;
