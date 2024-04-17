/* eslint-disable react/jsx-props-no-spreading */
import { CKEditor } from '@ckeditor/ckeditor5-react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import InputGroup from '@panneau/field-input-group';

import useCKEditorBuild from './hooks/useCKEditorBuild';

import './styles.global.scss';
import styles from './styles.module.scss';

const propTypes = {
    feedback: PropTypes.oneOf(['valid', 'invalid', 'loading']),
    errors: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    value: PropTypes.string,
    placeholder: PropTypes.string,
    inline: PropTypes.bool,
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    ckConfig: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    ckOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,
};

const defaultProps = {
    feedback: null,
    errors: null,
    value: null,
    placeholder: null,
    inline: false,
    disabled: false,
    onChange: null,
    onFocus: null,
    onBlur: null,
    ckConfig: {
        toolbar: [
            'heading',
            '|',
            'bold',
            'italic',
            'link',
            'bulletedList',
            'numberedList',
            // 'blockQuote',
            // 'mediaEmbed',
        ],
        heading: {
            options: [
                { model: 'paragraph', title: 'Paragraph' },
                { model: 'heading1', view: 'h1', title: 'Heading 1' },
                { model: 'heading2', view: 'h2', title: 'Heading 2' },
                { model: 'heading3', view: 'h3', title: 'Heading 3' },
            ],
        },
        link: {
            addTargetToExternalLinks: true,
        },
        // mediaEmbed: {
        //     previewsInData: true,
        // },
    },
    ckOptions: null,
    className: null,
};

const HtmlField = ({
    feedback,
    errors,
    value,
    // placeholder,
    inline,
    disabled,
    onChange,
    onFocus,
    onBlur,
    ckConfig,
    ckOptions,
    className,
}) => {
    const CKEditorBuild = useCKEditorBuild() || null;
    const CKValue = value !== null ? value : '';

    const finalClassName = inline
        ? classNames([
              styles.container,
              'form-control',
              {
                  [className]: className !== null,
                  'is-valid': feedback === 'valid',
                  'is-invalid': feedback === 'invalid' || (errors !== null && errors.length > 0),
              },
          ])
        : classNames([
              styles.container,
              {
                  [className]: className !== null,
              },
          ]);

    const onCkEditorChange = useCallback(
        (event, editor) => {
            const data = editor.getData();
            if (onChange !== null) {
                onChange(data === '' ? null : data);
            }
        },
        [onChange],
    );

    const commonProps = {
        onFocus,
        onBlur,
    };

    // console.log('my build', CKEditorBuild);

    const ckElement =
        CKEditorBuild !== null ? (
            <div className={finalClassName}>
                <CKEditor
                    editor={CKEditorBuild}
                    data={CKValue}
                    config={ckConfig}
                    onChange={onCkEditorChange}
                    {...commonProps}
                    {...ckOptions}
                    disabled={disabled}
                />
            </div>
        ) : null;

    return inline ? <InputGroup>{ckElement}</InputGroup> : ckElement;
};

HtmlField.propTypes = propTypes;
HtmlField.defaultProps = defaultProps;

export default HtmlField;
