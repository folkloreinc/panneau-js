/* eslint-disable react/button-has-type */
import React, { useMemo, useCallback, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import SplitPane from 'react-split-pane';
import isFunction from 'lodash/isFunction';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useComponent } from '@panneau/core/contexts';
import {
    PropTypes as FormPropTypes,
    FormActions,
    messages,
    withFormContainer,
} from '@panneau/form';

import styles from './styles.scss';

const stylePropType = PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number]));

const propTypes = {
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
    withoutPreviewFullscreen: PropTypes.bool,
    className: PropTypes.string,
    forwardRef: PanneauPropTypes.ref,
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
    withoutPreviewFullscreen: false,
    className: null,
    forwardRef: null,
    onChange: null,
    onErrors: null,
};

const PreviewForm = ({
    value,
    errors,
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
    withoutPreviewFullscreen,
    className,
    forwardRef,
    onChange,
    onErrors,
    ...props
}) => {
    const [previewFullscreen, setPreviewFullscreen] = useState(false);
    const FormComponent = useComponent(form, 'forms');
    const PreviewComponent = useComponent(preview, 'previews');
    const refForm = useRef(null);

    const submit = useCallback(() => {
        if (refForm !== null) {
            refForm.current.submit();
        }
    }, [refForm]);

    const onClickSubmit = useCallback(() => {
        submit();
    }, []);

    const onClickPreviewFullscreen = useCallback(() => {
        setPreviewFullscreen(!previewFullscreen);
    }, [previewFullscreen]);

    const refApi = useMemo(
        () => ({
            submit,
        }),
        [],
    );

    if (isFunction(forwardRef)) {
        forwardRef(refApi);
    } else if (forwardRef !== null) {
        // eslint-disable-next-line no-param-reassign
        forwardRef.current = refApi;
    }

    return (
        <div
            className={classNames([
                styles.container,
                {
                    [styles.isFullscreen]: fullscreen,
                    [styles.previewIsFullscreen]: previewFullscreen,
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
                                onChange={onChange}
                                onErrors={onErrors}
                                ref={refForm}
                            />
                        ) : null}
                    </div>
                    <div className={styles.preview}>
                        {!withoutPreviewFullscreen ? (
                            <button
                                type="button"
                                className={classNames([
                                    'btn',
                                    'btn-light',
                                    styles.fullscreenButton,
                                    'fas',
                                    {
                                        'fa-expand': !previewFullscreen,
                                        'fa-compress': previewFullscreen,
                                    },
                                ])}
                                onClick={onClickPreviewFullscreen}
                            />
                        ) : null}
                        <div className={styles.inner}>
                            {PreviewComponent !== null ? (
                                <PreviewComponent value={value} {...props} />
                            ) : null}
                        </div>
                    </div>
                </SplitPane>
            </div>
            <FormActions
                notice={notice}
                buttons={buttons.map(button =>
                    button.id === 'submit'
                        ? {
                              ...button,
                              type: 'button',
                              onClick: onClickSubmit,
                          }
                        : button,
                )}
                className={classNames(['border-top', 'p-2', styles.actions])}
            />
        </div>
    );
};

PreviewForm.propTypes = propTypes;
PreviewForm.defaultProps = defaultProps;

export default withFormContainer(
    React.forwardRef((props, ref) => <PreviewForm {...props} forwardRef={ref} />),
);
