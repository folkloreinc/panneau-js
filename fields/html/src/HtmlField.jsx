/* eslint-disable react/jsx-props-no-spreading */
import InputGroup from '@panneau/field-input-group';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import useCKEditor from './hooks/useCKEditor';
import useCKEditorBuild from './hooks/useCKEditorBuild';
import useQuill from './hooks/useQuill';
import './styles.global.scss';

const propTypes = {
    feedback: PropTypes.oneOf(['valid', 'invalid', 'loading']),
    errors: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    value: PropTypes.string,
    placeholder: PropTypes.string,
    type: PropTypes.oneOf([null, 'quill', 'ck-editor']),
    inline: PropTypes.bool,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    ckConfig: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    ckOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    quillOptions: PropTypes.shape({
        modules: PropTypes.shape({
            toolbar: PropTypes.arrayOf([PropTypes.array, PropTypes.string]),
        }),
        formats: PropTypes.arrayOf(PropTypes.string),
    }),
    className: PropTypes.string,
};

const defaultProps = {
    feedback: null,
    errors: null,
    value: null,
    placeholder: null,
    type: null,
    inline: false,
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
    },
    ckOptions: null,
    quillOptions: {
        formats: ['bold', 'italic', 'link', 'header', 'indent', 'list'],
    },
    className: null,
};

const HtmlField = ({
    feedback,
    errors,
    value,
    placeholder,
    type,
    inline,
    onChange,
    onFocus,
    onBlur,
    quillOptions,
    ckConfig,
    ckOptions,
    className,
}) => {
    const usingQuill = type === 'quill';
    const CKEditor = useCKEditor({ disabled: usingQuill });
    const CKEditorBuild = useCKEditorBuild({ disabled: usingQuill, inline });
    const Quill = useQuill({ disabled: !usingQuill, inline });
    const CKValue = value !== null ? value : '';

    const finalClassName = inline
        ? classNames([
              'form-control',
              {
                  [className]: className !== null,
                  'is-valid': feedback === 'valid',
                  'is-invalid': feedback === 'invalid' || (errors !== null && errors.length > 0),
              },
          ])
        : className;

    const onCkEditorChange = useCallback(
        (event, editor) => {
            const data = editor.getData();
            if (onChange !== null) {
                onChange(data === '' ? null : data);
            }
        },
        [onChange],
    );

    const onQuillChange = useCallback(
        (newValue, delta, source) => {
            if (onChange !== null && source === 'user') {
                onChange(newValue === '<p><br></p>' ? null : newValue);
            }
        },
        [onChange],
    );

    const commonProps = {
        onFocus,
        onBlur,
    };

    const ckElement =
        CKEditor !== null && CKEditorBuild !== null ? (
            <div className={finalClassName}>
                <CKEditor
                    editor={CKEditorBuild}
                    data={CKValue}
                    config={ckConfig}
                    onChange={onCkEditorChange}
                    {...commonProps}
                    {...ckOptions}
                />
            </div>
        ) : null;

    const quillElement =
        Quill !== null ? (
            <Quill
                className={finalClassName}
                value={value}
                theme={inline ? 'bubble' : 'snow'}
                onChange={onQuillChange}
                placeholder={placeholder}
                defaultValue={null}
                {...commonProps}
                {...quillOptions}
            />
        ) : null;

    const element = usingQuill ? quillElement : ckElement;

    return inline ? <InputGroup>{element}</InputGroup> : element;
};

HtmlField.propTypes = propTypes;
HtmlField.defaultProps = defaultProps;

export default HtmlField;
