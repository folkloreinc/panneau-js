import classNames from 'classnames';
import { type ChangeEvent, type ReactNode, useCallback, useId, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import type { ButtonTheme } from '@panneau/core';
import Button from '@panneau/element-button';
import Label from '@panneau/element-label';
import Dialog from '@panneau/modal-dialog';

import parseCsv from './parseCsv';

import styles from './styles.module.css';

export interface ImportTemplateColumn {
    name?: string;
    key?: string;
    required?: boolean;
    description?: string;
    suggested_mappings?: string[];
    data_type?: string;
}

export interface ImportTemplate {
    columns?: ImportTemplateColumn[];
}

export interface ImportResultColumn {
    key: string;
    name: string;
}

export interface ImportResultRow {
    index: number;
    values: Record<string, string | null>;
}

export interface ImportResult {
    num_rows: number;
    num_columns: number;
    error: string | null;
    columns: ImportResultColumn[];
    rows: ImportResultRow[];
}

interface ImportFieldProps {
    format?: string;
    template?: ImportTemplate | null;
    isModal?: boolean;
    title?: ReactNode | null;
    icon?: string;
    iconPosition?: 'left' | 'right' | 'inline' | null;
    label?: ReactNode | null;
    disabled?: boolean;
    theme?: ButtonTheme;
    outline?: boolean;
    showDownloadTemplateButton?: boolean;
    onChange?: ((data: ImportResult) => void) | null;
    onClose?: (() => void) | null;
    className?: string | null;
}

const normalizeHeader = (header: string): string => header.trim().toLowerCase();

function getResult(
    data: string[][],
    templateColumns: ImportTemplateColumn[] | null,
): { result: ImportResult; missingColumns: string[] } {
    const [headers = [], ...lines] = data;
    const normalizedHeaders = headers.map(normalizeHeader);
    const columns =
        templateColumns !== null && templateColumns.length > 0
            ? templateColumns.map(
                  ({ key = null, name = null, required = false, suggested_mappings = [] }) => {
                      const candidates = [key, name, ...(suggested_mappings || [])]
                          .filter((candidate) => candidate !== null && candidate !== '')
                          .map(normalizeHeader);
                      return {
                          key: key || name || '',
                          name: name || key || '',
                          required,
                          headerIndex: normalizedHeaders.findIndex(
                              (header) => candidates.indexOf(header) !== -1,
                          ),
                      };
                  },
              )
            : headers.map((header, headerIndex) => ({
                  key: header,
                  name: header,
                  required: false,
                  headerIndex,
              }));

    const missingColumns = columns
        .filter(({ required, headerIndex }) => required && headerIndex === -1)
        .map(({ name }) => name);

    const rows = lines.map((line, index) => ({
        index,
        values: columns.reduce(
            (values, { key, headerIndex }) => ({
                ...values,
                [key]: headerIndex !== -1 ? (line[headerIndex] ?? null) : null,
            }),
            {},
        ),
    }));

    return {
        result: {
            num_rows: rows.length,
            num_columns: columns.length,
            error: null,
            columns: columns.map(({ key, name }) => ({ key, name })),
            rows,
        },
        missingColumns,
    };
}

function ImportField({
    format = 'csv',
    template = null,
    isModal = false,
    title = null,
    icon = 'database',
    iconPosition = null,
    label = null,
    disabled = false,
    theme = 'primary',
    outline = false,
    showDownloadTemplateButton = true,
    onChange = null,
    onClose = null,
    className = null,
}: ImportFieldProps) {
    const id = useId();
    const [isOpen, setIsOpen] = useState(false);
    const [modalMounted, setModalMounted] = useState(false);
    const [inputKey, setInputKey] = useState(0);
    const [parsed, setParsed] = useState<{
        result: ImportResult;
        missingColumns: string[];
    } | null>(null);
    const [parseError, setParseError] = useState(false);

    const { columns: templateColumns = null } = template || {};

    const reset = useCallback(() => {
        setParsed(null);
        setParseError(false);
        setInputKey((key) => key + 1);
    }, []);

    const openModal = useCallback(() => {
        setModalMounted(true);
        setIsOpen(true);
    }, []);

    const requestClose = useCallback(() => {
        setIsOpen(false);
    }, []);

    const onModalClosed = useCallback(() => {
        setModalMounted(false);
        reset();
        if (onClose !== null) {
            onClose();
        }
    }, [onClose, reset]);

    const onFileChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const [file = null] = e.target.files || [];
            if (file === null) {
                setParsed(null);
                return;
            }
            file.text()
                .then((text) => {
                    setParsed(getResult(parseCsv(text), templateColumns));
                    setParseError(false);
                })
                .catch(() => {
                    setParsed(null);
                    setParseError(true);
                });
        },
        [templateColumns],
    );

    const onClickImport = useCallback(() => {
        if (parsed === null) {
            return;
        }
        if (onChange !== null) {
            onChange(parsed.result);
        }
        if (isModal) {
            setIsOpen(false);
        } else {
            reset();
        }
    }, [parsed, onChange, isModal, reset]);

    const templateUrl = useMemo(() => {
        if (!showDownloadTemplateButton || templateColumns === null) {
            return null;
        }
        const headers = templateColumns.map(({ name = null, key = null }) => name || key || '');
        const csv = `${headers.map((header) => `"${header.replace(/"/g, '""')}"`).join(',')}\n`;
        return `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    }, [showDownloadTemplateButton, templateColumns]);

    if (format !== 'csv') {
        return null;
    }

    const { result = null, missingColumns = [] } = parsed || {};
    const canImport = result !== null && result.num_rows > 0 && missingColumns.length === 0;

    const importer = (
        <div className={styles.importer}>
            <div className="d-flex align-items-center gap-2 mb-2">
                <input
                    key={`file-${inputKey}`}
                    id={`${id}-file`}
                    type="file"
                    className="form-control"
                    accept=".csv,text/csv"
                    disabled={disabled}
                    onChange={onFileChange}
                />
                {templateUrl !== null ? (
                    <a
                        href={templateUrl}
                        download="template.csv"
                        className="btn btn-outline-secondary text-nowrap"
                    >
                        <FormattedMessage
                            defaultMessage="Download template"
                            description="Import field button label"
                        />
                    </a>
                ) : null}
            </div>
            {parseError ? (
                <p className="text-danger small mb-2">
                    <FormattedMessage
                        defaultMessage="The file could not be read."
                        description="Import field error"
                    />
                </p>
            ) : null}
            {result !== null ? (
                <p className="small mb-2">
                    <FormattedMessage
                        defaultMessage="{count, plural, =0 {No row found} one {# row found} other {# rows found}}"
                        description="Import field summary"
                        values={{ count: result.num_rows }}
                    />
                </p>
            ) : null}
            {missingColumns.length > 0 ? (
                <p className="text-danger small mb-2">
                    <FormattedMessage
                        defaultMessage="Missing required columns: {columns}"
                        description="Import field error"
                        values={{ columns: missingColumns.join(', ') }}
                    />
                </p>
            ) : null}
            {!isModal ? (
                <Button
                    type="button"
                    theme={theme}
                    outline={outline}
                    disabled={disabled || !canImport}
                    onClick={onClickImport}
                >
                    <FormattedMessage defaultMessage="Import" description="Button label" />
                </Button>
            ) : null}
        </div>
    );

    return (
        <div
            className={classNames([
                styles.container,
                {
                    [styles.disabled]: disabled && !isModal,
                    [className]: className !== null,
                },
            ])}
        >
            {isModal ? (
                <>
                    <Button
                        type="button"
                        theme={theme}
                        icon={icon || 'upload'}
                        iconPosition={iconPosition || 'right'}
                        onClick={openModal}
                        disabled={isOpen || disabled}
                        outline={outline}
                    >
                        <Label>
                            {label || (
                                <FormattedMessage
                                    defaultMessage="Import"
                                    description="Button label"
                                />
                            )}
                        </Label>
                    </Button>
                    {modalMounted ? (
                        <Dialog
                            id={`${id}-modal`}
                            visible={isOpen}
                            title={
                                title || (
                                    <FormattedMessage
                                        defaultMessage="Import"
                                        description="Button label"
                                    />
                                )
                            }
                            requestClose={requestClose}
                            onClosed={onModalClosed}
                            withCancelButton
                            withSubmitButton
                            submitButtonLabel={
                                <FormattedMessage
                                    defaultMessage="Import"
                                    description="Button label"
                                />
                            }
                            submitButton={{ disabled: !canImport }}
                            onClickSubmit={onClickImport}
                        >
                            {importer}
                        </Dialog>
                    ) : null}
                </>
            ) : (
                importer
            )}
        </div>
    );
}

export default ImportField;
