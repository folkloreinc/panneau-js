/* eslint-disable react/jsx-props-no-spreading */
import { CKEditor } from '@ckeditor/ckeditor5-react';
import classNames from 'classnames';
import React, { useCallback } from 'react';

import type { Feedback } from '@panneau/core/types';
import InputGroup from '@panneau/field-input-group';

import useCKEditorBuilds from './hooks/useCKEditorBuilds';

import styles from './styles.module.css';

interface HtmlFieldProps {
    feedback?: Feedback;
    errors?: string | string[] | null;
    value?: string | null;
    placeholder?: string;
    inline?: boolean;
    disabled?: boolean;
    onChange?: ((value: string | null) => void) | null;
    onFocus?: (() => void) | null;
    onBlur?: (() => void) | null;
    ckConfig?: Record<string, unknown>;
    ckOptions?: Record<string, unknown> | null;
    className?: string | null;
}

function HtmlField({
    feedback = null,
    errors = null,
    value = null,
    // placeholder,
    inline = false,
    disabled = false,
    onChange = null,
    onFocus = null,
    onBlur = null,
    ckConfig = {
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
            // TODO: test this
            // decorators: {
            //     openInSamePage: {
            //         mode: 'manual',
            //         label: 'Open in same page',
            //         attributes: {
            //             target: '_self',
            //             rel: 'noopener noreferrer',
            //         },
            //     },
            // },
            // allowedProtocols: [ 'https?', 'tel', 'sms', 'mailto' ],
        },
        // mediaEmbed: {
        //     previewsInData: true,
        // },
    },
    ckOptions = null,
    className = null,
}: HtmlFieldProps) {
    const { Editor = null, InlineEditor = null } = useCKEditorBuilds() || {};
    const CKValue = value !== null ? value : '';
    const EditorBuild = inline ? InlineEditor : Editor;

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
        (event: unknown, editor: { getData: () => string } | null) => {
            const data = editor !== null ? editor.getData() : null;
            if (editor !== null && onChange !== null) {
                onChange(data === '' ? null : data);
            }
        },
        [onChange],
    );

    const commonProps = {
        onFocus,
        onBlur,
    };

    const finalCkConfig = {
        ...ckConfig,
        licenseKey:
            (ckConfig != null && typeof ckConfig.licenseKey !== 'undefined'
                ? ckConfig.licenseKey
                : null) || 'GPL',
    };

    const ckElement =
        EditorBuild !== null ? (
            <div className={finalClassName}>
                <CKEditor
                    editor={EditorBuild}
                    data={CKValue}
                    config={finalCkConfig}
                    onChange={onCkEditorChange}
                    {...commonProps}
                    {...ckOptions}
                    disabled={disabled}
                />
            </div>
        ) : null;

    return inline ? <InputGroup>{ckElement}</InputGroup> : ckElement;
}

export default HtmlField;
