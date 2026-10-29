import type { Editor } from '@tiptap/core';
import { useId, useState } from 'react';

import { editorMessages as messages } from '@panneau/intl';
import { Button, Checkbox, Dialog, TextInput, usePanneauIntl } from '@panneau/ui';

import styles from './RichTextField.module.css';
import type { NewTabLinks } from './settings';

const NEW_TAB_REL = ['noopener', 'noreferrer'];

/** Whether a URL points to another site: `https://…` or `//…`, as CKEditor decides it. */
export function isExternalUrl(url: string): boolean {
    return /^(https?:)?\/\//i.test(url.trim());
}

/** The `target` and `rel` of a link, keeping the relations that aren't about the new tab. */
export function getLinkTarget(newTab: boolean, rel: string | null) {
    const others = (rel ?? '')
        .split(/\s+/)
        .filter((name) => name !== '' && !NEW_TAB_REL.includes(name));
    const next = newTab ? [...NEW_TAB_REL, ...others] : others;
    return { target: newTab ? '_blank' : null, rel: next.length > 0 ? next.join(' ') : null };
}

export interface LinkDialogProps {
    editor: Editor;
    newTab: NewTabLinks;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

/** Adds, changes or removes the link of the selection. */
export function LinkDialog({ editor, newTab, isOpen, onOpenChange }: LinkDialogProps) {
    const intl = usePanneauIntl();
    const formId = useId();
    const current = editor.getAttributes('link');
    const currentHref = typeof current.href === 'string' ? current.href : '';
    const currentRel = typeof current.rel === 'string' ? current.rel : null;
    const [href, setHref] = useState(currentHref);
    const [openInNewTab, setOpenInNewTab] = useState(current.target === '_blank');
    const [opened, setOpened] = useState(isOpen);
    // Starts from the link of the selection each time it opens
    if (opened !== isOpen) {
        setOpened(isOpen);
        if (isOpen) {
            setHref(currentHref);
            setOpenInNewTab(current.target === '_blank');
        }
    }

    const apply = () => {
        const url = href.trim();
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            onOpenChange(false);
            return;
        }
        const inNewTab =
            newTab === 'choose' ? openInNewTab : newTab === 'external' && isExternalUrl(url);
        const attributes = { href: url, ...getLinkTarget(inNewTab, currentRel) };
        if (editor.state.selection.empty && !editor.isActive('link')) {
            editor
                .chain()
                .focus()
                .insertContent({
                    type: 'text',
                    text: url,
                    marks: [{ type: 'link', attrs: attributes }],
                })
                .run();
        } else {
            editor.chain().focus().extendMarkRange('link').setLink(attributes).run();
        }
        onOpenChange(false);
    };

    return (
        <Dialog
            title={intl.formatMessage(messages.linkTitle)}
            size="sm"
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            footer={(close) => (
                <>
                    {currentHref !== '' ? (
                        <Button
                            appearance="ghost"
                            tone="danger"
                            className={styles.removeLink}
                            onPress={() => {
                                editor.chain().focus().extendMarkRange('link').unsetLink().run();
                                close();
                            }}
                        >
                            {intl.formatMessage(messages.linkRemove)}
                        </Button>
                    ) : null}
                    <Button appearance="outline" onPress={close}>
                        {intl.formatMessage(messages.linkCancel)}
                    </Button>
                    <Button type="submit" form={formId} appearance="solid" tone="accent">
                        {intl.formatMessage(messages.linkApply)}
                    </Button>
                </>
            )}
        >
            <form
                id={formId}
                className={styles.linkForm}
                onSubmit={(event) => {
                    event.preventDefault();
                    apply();
                }}
            >
                <TextInput
                    label={intl.formatMessage(messages.linkUrl)}
                    type="url"
                    inputMode="url"
                    autoComplete="off"
                    autoFocus
                    value={href}
                    onChange={setHref}
                />
                {newTab === 'choose' ? (
                    <Checkbox isSelected={openInNewTab} onChange={setOpenInNewTab}>
                        {intl.formatMessage(messages.linkNewTab)}
                    </Checkbox>
                ) : null}
            </form>
        </Dialog>
    );
}
