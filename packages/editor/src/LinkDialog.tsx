import { type Editor, getMarkRange } from '@tiptap/core';
import { isAllowedUri } from '@tiptap/extension-link';
import { FileText, Globe } from 'lucide-react';
import { useId, useState } from 'react';

import { useFieldsContext } from '@panneau/fields';
import { type LinkPage, PagePicker } from '@panneau/fields/link';
import { editorMessages as messages } from '@panneau/intl';
import { isExternalUrl } from '@panneau/protocol/runtime';
import { Button, Checkbox, Dialog, SegmentedControl, TextInput, usePanneauIntl } from '@panneau/ui';

import styles from './RichTextField.module.css';
import type { NewTabLinks } from './settings';

const NEW_TAB_REL = ['noopener', 'noreferrer'];

/** The `target` and `rel` of a link, keeping the relations that aren't about the new tab. */
export function getLinkTarget(newTab: boolean, rel: string | null) {
    const others = (rel ?? '')
        .split(/\s+/)
        .filter((name) => name !== '' && !NEW_TAB_REL.includes(name));
    const next = newTab ? [...NEW_TAB_REL, ...others] : others;
    return { target: newTab ? '_blank' : null, rel: next.length > 0 ? next.join(' ') : null };
}

/**
 * The `href` of a new link to an item, until the backend writes the item's URL in its place
 * (decision 0107).
 */
export const PAGE_HREF = '#';

/** The item a link points to, from its `data-page-id` and `data-page-resource`. */
function getCurrentPage(editor: Editor, attributes: Record<string, unknown>): LinkPage | null {
    if (typeof attributes.pageId !== 'string' || attributes.pageId === '') {
        return null;
    }
    // Its text, as the label of the item until it is picked again: the selected text, or the
    // text of the link around the cursor
    const { selection, doc } = editor.state;
    const type = editor.schema.marks.link;
    const range = selection.empty
        ? type !== undefined
            ? getMarkRange(selection.$from, type)
            : undefined
        : selection;
    const text = range !== undefined ? doc.textBetween(range.from, range.to, ' ').trim() : '';
    return {
        id: attributes.pageId,
        ...(typeof attributes.pageResource === 'string'
            ? { resource: attributes.pageResource }
            : {}),
        ...(text !== '' ? { label: text } : {}),
    };
}

export interface LinkDialogProps {
    editor: Editor;
    newTab: NewTabLinks;
    /** The resources whose items links can point to, searched with the relation source. */
    pages?: readonly string[];
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

type LinkKind = 'page' | 'url';

/** The attributes of a link that the dialog sets: those of the item are `null` for a URL. */
interface LinkAttributes {
    href: string;
    target: string | null;
    rel: string | null;
    pageId: string | null;
    pageResource: string | null;
}

/**
 * Adds, changes or removes the link of the selection: to an item of the site, searched in `pages`
 * with the relation source of the fields context, or to a URL.
 */
export function LinkDialog({ editor, newTab, pages = [], isOpen, onOpenChange }: LinkDialogProps) {
    const intl = usePanneauIntl();
    const formId = useId();
    const current = editor.getAttributes('link');
    const currentHref = typeof current.href === 'string' ? current.href : '';
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
            <LinkForm
                id={formId}
                editor={editor}
                newTab={newTab}
                pages={pages}
                onDone={() => onOpenChange(false)}
            />
        </Dialog>
    );
}

/**
 * The form of the dialog, mounted each time it opens: it starts from the link of the selection.
 */
function LinkForm({
    id,
    editor,
    newTab,
    pages,
    onDone,
}: {
    id: string;
    editor: Editor;
    newTab: NewTabLinks;
    pages: readonly string[];
    onDone: () => void;
}) {
    const intl = usePanneauIntl();
    const { relationSource } = useFieldsContext();
    const withPages = pages.length > 0 && relationSource !== null;
    const [initial] = useState(() => {
        const current = editor.getAttributes('link');
        const href = typeof current.href === 'string' ? current.href : '';
        const page = withPages ? getCurrentPage(editor, current) : null;
        return {
            href,
            rel: typeof current.rel === 'string' ? current.rel : null,
            newTab: current.target === '_blank',
            page,
            // Links to items first, as in `link` fields, unless the selection links to a URL
            kind: (withPages && (page !== null || href === '') ? 'page' : 'url') as LinkKind,
        };
    });
    const [kind, setKind] = useState<LinkKind>(initial.kind);
    const [href, setHref] = useState(initial.page !== null ? '' : initial.href);
    const [page, setPage] = useState<LinkPage | null>(initial.page);
    const [openInNewTab, setOpenInNewTab] = useState(initial.newTab);
    const [invalid, setInvalid] = useState(false);

    const unsetLink = () => {
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
        onDone();
    };

    const setLink = (attributes: LinkAttributes, text: string) => {
        if (editor.state.selection.empty && !editor.isActive('link')) {
            editor
                .chain()
                .focus()
                .insertContent({ type: 'text', text, marks: [{ type: 'link', attrs: attributes }] })
                .run();
        } else {
            editor.chain().focus().extendMarkRange('link').setLink(attributes).run();
        }
        onDone();
    };

    const applyPage = () => {
        if (page === null) {
            unsetLink();
            return;
        }
        const resource = page.resource ?? pages[0] ?? null;
        // The same item keeps the URL the backend wrote for it
        const same = initial.page?.id === page.id && (initial.page.resource ?? null) === resource;
        setLink(
            {
                href: same && initial.href !== '' ? initial.href : PAGE_HREF,
                pageId: page.id,
                pageResource: resource,
                ...getLinkTarget(newTab === 'choose' && openInNewTab, initial.rel),
            },
            page.label ?? page.id,
        );
    };

    const applyUrl = () => {
        const url = href.trim();
        if (url === '') {
            unsetLink();
            return;
        }
        // A `javascript:` URL, which the link would refuse
        if (!isAllowedUri(url)) {
            setInvalid(true);
            return;
        }
        const inNewTab =
            newTab === 'choose' ? openInNewTab : newTab === 'external' && isExternalUrl(url);
        setLink(
            {
                href: url,
                pageId: null,
                pageResource: null,
                ...getLinkTarget(inNewTab, initial.rel),
            },
            url,
        );
    };

    return (
        <form
            id={id}
            className={styles.linkForm}
            onSubmit={(event) => {
                event.preventDefault();
                if (kind === 'page') {
                    applyPage();
                } else {
                    applyUrl();
                }
            }}
        >
            {withPages ? (
                <SegmentedControl
                    aria-label={intl.formatMessage(messages.linkType)}
                    size="sm"
                    options={[
                        {
                            value: 'page',
                            label: intl.formatMessage(messages.linkTypePage),
                            icon: FileText,
                        },
                        {
                            value: 'url',
                            label: intl.formatMessage(messages.linkTypeUrl),
                            icon: Globe,
                        },
                    ]}
                    value={kind}
                    onChange={(next) => setKind(next === 'page' ? 'page' : 'url')}
                />
            ) : null}
            {kind === 'page' ? (
                <PagePicker
                    label={intl.formatMessage(messages.linkPage)}
                    resources={pages}
                    page={page}
                    onChange={setPage}
                    editable
                    errors={[]}
                    required={false}
                />
            ) : (
                <TextInput
                    label={intl.formatMessage(messages.linkUrl)}
                    type="url"
                    inputMode="url"
                    autoComplete="off"
                    autoFocus
                    value={href}
                    onChange={(next) => {
                        setHref(next);
                        setInvalid(false);
                    }}
                    errors={invalid ? [intl.formatMessage(messages.linkInvalid)] : []}
                />
            )}
            {newTab === 'choose' ? (
                <Checkbox isSelected={openInNewTab} onChange={setOpenInNewTab}>
                    {intl.formatMessage(messages.linkNewTab)}
                </Checkbox>
            ) : null}
        </form>
    );
}
