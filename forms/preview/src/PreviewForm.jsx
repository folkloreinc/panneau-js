/* eslint-disable react/button-has-type */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import SplitPane from 'react-split-pane';
import {
    PropTypes as PanneauPropTypes,
    withPreviewsCollection,
    withFormsCollection,
} from '@panneau/core';
import { PropTypes as FormPropTypes, FormActions, messages } from '@panneau/form';

import styles from './styles.scss';

const stylePropType = PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number]));

const propTypes = {
    formsCollection: PanneauPropTypes.componentsCollection.isRequired,
    previewsCollection: PanneauPropTypes.componentsCollection.isRequired,
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    errors: FormPropTypes.errors,
    notice: FormPropTypes.notice,
    buttons: PanneauPropTypes.buttons,
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
    fullscreen: PropTypes.bool,
    className: PropTypes.string,
    onChange: PropTypes.func,
    onErrors: PropTypes.func,
};

const defaultProps = {
    value: null,
    errors: null,
    notice: null,
    buttons: [
        {
            id: 'submit',
            type: 'submit',
            label: messages.save,
            className: 'btn-primary',
        },
    ],
    form: 'normal',
    preview: 'json',
    paneStyle: null,
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
    fullscreen: false,
    className: null,
    onChange: null,
    onErrors: null,
};

const childContextTypes = {
    form: FormPropTypes.form,
};

const contextTypes = {
    form: FormPropTypes.form,
};

export class PreviewForm extends Component {
    static getDerivedStateFromProps(props, state) {
        const isValueControlled = props.onChange !== null;
        const isErrorsControlled = props.onErrors !== null;
        const valueChanged = isValueControlled && props.value !== state.value;
        const errorsChanged = isErrorsControlled && props.errors !== state.errors;
        if (valueChanged || errorsChanged) {
            return {
                value: valueChanged ? props.value : state.value,
                errors: errorsChanged ? props.errors : state.errors,
            };
        }
        return null;
    }

    constructor(props) {
        super(props);

        this.onFormChange = this.onFormChange.bind(this);
        this.onFormErrors = this.onFormErrors.bind(this);
        this.onClickSubmit = this.onClickSubmit.bind(this);

        this.refForm = React.createRef();

        this.state = {
            value: props.value,
            errors: props.errors,
        };
    }

    getChildContext() {
        const { value, errors } = this.state;
        const { form = null } = this.context;
        return {
            form:
                form !== null
                    ? form
                    : {
                        errors,
                        value,
                    },
        };
    }

    onFormChange(value) {
        this.setValue(value);
    }

    onFormErrors(errors) {
        this.setErrors(errors);
    }

    onClickSubmit() {
        this.submit();
    }

    /**
     * Set the errors
     *
     * @param {object} errors
     * @public
     */
    setErrors(errors) {
        const { onErrors } = this.props;
        if (onErrors !== null) {
            onErrors(errors);
        } else {
            this.setState({
                errors,
            });
        }
    }

    /**
     * Set the value
     *
     * @param {object} value
     * @public
     */
    setValue(value) {
        const { onChange } = this.props;
        if (onChange !== null) {
            onChange(value);
        } else {
            this.setState({
                value,
            });
        }
    }

    /**
     * Submit the form
     *
     * @public
     */
    submit() {
        this.refForm.current.submit();
    }

    render() {
        const {
            formsCollection,
            previewsCollection,
            value: propsValue,
            errors: propsErrors,
            notice,
            buttons,
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
            fullscreen,
            className,
            onChange,
            onErrors,
            ...props
        } = this.props;
        const { value, errors } = this.state;

        const FormComponent = formsCollection.getComponent(form);
        const PreviewComponent = previewsCollection.getComponent(preview);

        return (
            <div
                className={classNames([
                    styles.container,
                    {
                        [styles.isFullscreen]: fullscreen,
                        [className]: className !== null,
                    },
                ])}
            >
                <div className={styles.pane}>
                    <SplitPane
                        split={paneSplit}
                        step={paneStep}
                        defaultSize={formWidth}
                        minSize={formMinWidth}
                        maxSize={formMaxWidth}
                        style={paneStyle === null && !fullscreen ? { position: 'relative' } : paneStyle}
                        paneStyle={panesStyle}
                        pane1Style={paneFormStyle}
                        pane2Style={panePreviewStyle}
                        resizerStyle={paneResizerStyle}
                    >
                        <div className={styles.form}>
                            {FormComponent !== null ? (
                                <FormComponent
                                    {...props}
                                    value={value}
                                    errors={errors}
                                    withoutActions
                                    onChange={this.onFormChange}
                                    onErrors={this.onFormErrors}
                                    ref={this.refForm}
                                />
                            ) : null}
                        </div>
                        <div className={styles.preview}>
                            {PreviewComponent !== null ? (
                                <PreviewComponent value={value} {...props} />
                            ) : null}
                        </div>
                    </SplitPane>
                </div>
                <FormActions
                    notice={notice}
                    buttons={buttons.map(button => (button.id === 'submit' ? {
                        ...button,
                        type: 'button',
                        onClick: this.onClickSubmit,
                    } : button))}
                    className={classNames(['border-top', 'p-2', styles.actions])}
                />
            </div>
        );
    }
}

PreviewForm.propTypes = propTypes;
PreviewForm.defaultProps = defaultProps;
PreviewForm.childContextTypes = childContextTypes;
PreviewForm.contextTypes = contextTypes;

const WithPreviewCollectionContainer = withPreviewsCollection()(PreviewForm);
const WithFormsCollectionContainer = withFormsCollection()(WithPreviewCollectionContainer);
export default WithFormsCollectionContainer;
