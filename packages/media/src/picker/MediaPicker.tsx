import { Images, Lock, SearchX } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { formatSize, useFieldsContext, useRejectionMessage, useUploads } from '@panneau/fields';
import { mediaMessages as messages } from '@panneau/intl';
import type { FilterValue, MediaReference } from '@panneau/protocol';
import {
    Alert,
    Button,
    Dialog,
    Heading,
    LoadingRegion,
    SegmentedControl,
    Select,
    Skeleton,
    Spinner,
    Tab,
    TabList,
    TabPanel,
    Tabs,
    Text,
    usePanneauIntl,
} from '@panneau/ui';

import { MediaDetails } from './MediaDetails';
import { MediaGrid } from './MediaGrid';
import styles from './MediaPicker.module.css';
import { PickerToolbar } from './PickerToolbar';
import { UploadPanel } from './UploadPanel';
import { describeAccept, isProcessingMedia } from './format';
import type { MediaPickerProps, MediaSort, MediaSource, PickerMedia } from './types';
import { type BrowseQuery, useMediaBrowser } from './useMediaBrowser';

const NO_FILTER: Readonly<Record<string, FilterValue>> = {};

/** A selected media, with the source it comes from. */
interface Picked {
    source: string;
    item: PickerMedia;
}

const keyOf = (source: string, id: string) => `${source}\n${id}`;

/** The smallest of two limits, either of which may be missing. */
function smallest(a: number | null | undefined, b: number | null | undefined): number | null {
    const limits = [a, b].filter((limit): limit is number => typeof limit === 'number');
    return limits.length > 0 ? Math.min(...limits) : null;
}

function isDefaultQuery(query: BrowseQuery): boolean {
    return query.q === '' && query.type === null && Object.keys(query.filter).length === 0;
}

/** The reference a picker returns for a media of a source. */
function toReference({ source, item }: Picked): MediaReference {
    return { id: item.id, resource: source, label: item.label, media: item.media };
}

/** The cards of a library that loads: a thumbnail, a name and a line of details. */
function Skeletons() {
    return (
        <div className={styles.grid}>
            {Array.from({ length: 12 }, (_, index) => (
                <div key={index} className={styles.skeletonCard}>
                    <Skeleton shape="rect" aspectRatio={1} />
                    <Skeleton className={styles.cardName} width="80%" />
                    <Skeleton className={styles.cardMeta} width="50%" />
                </div>
            ))}
        </div>
    );
}

/**
 * The media picker (decision 0027): browse the libraries given as sources, upload to them, and
 * pick one media, or several with `multiple`. It returns references with their library
 * (`resource`). The `media` field opens it, and so can a product's own screens, with their
 * sources, title and button.
 */
export function MediaPicker(props: MediaPickerProps) {
    // A new picker each time it opens: its selection and tabs start over, while `stateKey` keeps
    // what the user browsed.
    if (!props.isOpen) {
        return null;
    }
    return <OpenMediaPicker {...props} />;
}

function OpenMediaPicker({
    onOpenChange,
    sources,
    source: initialSource,
    multiple = false,
    accept = null,
    maxSize = null,
    filter: locked = NO_FILTER,
    filters: openerFilters = [],
    sorts: openerSorts = [],
    sort: openerSort,
    value = [],
    title,
    confirmLabel,
    confirmOnUpload = false,
    stateKey,
    uploadSource,
    refreshInterval = 3000,
    onSelect,
}: MediaPickerProps) {
    const intl = usePanneauIntl();
    const context = useFieldsContext();
    const [sourceId, setSourceId] = useState(initialSource ?? sources[0]?.id ?? '');
    const source = sources.find((candidate) => candidate.id === sourceId) ?? sources[0] ?? null;
    const [tab, setTab] = useState<string>('library');
    const [selection, setSelection] = useState<ReadonlyMap<string, Picked>>(new Map());
    const [focused, setFocused] = useState<string | null>(null);
    const [pendingFocus, setPendingFocus] = useState<string | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [draft, setDraft] = useState<{ key: string; values: Record<string, unknown> } | null>(
        null,
    );
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [uploaded, setUploaded] = useState<ReadonlyMap<string, readonly PickerMedia[]>>(
        new Map(),
    );
    const [problems, setProblems] = useState<string[]>([]);
    const [creating, setCreating] = useState<string[]>([]);

    const sortsOf = (candidate: MediaSource): MediaSort[] => [
        ...(candidate.sorts ?? []),
        ...openerSorts.filter((sort) => !(candidate.sorts ?? []).some((own) => own.id === sort.id)),
    ];
    const browser = useMediaBrowser({
        sources,
        source,
        locked,
        defaultSort: (candidate) => openerSort ?? sortsOf(candidate)[0]?.id ?? null,
        stateKey,
    });
    const { state } = browser;

    // What the user selected, and what the opener's value has.
    const current = new Set(
        value.map((reference) => keyOf(reference.resource ?? sources[0]?.id ?? '', reference.id)),
    );
    const picked = [...selection.values()];
    const unchanged =
        !multiple &&
        picked.length === 1 &&
        value.length === 1 &&
        current.has(keyOf(picked[0]?.source ?? '', picked[0]?.item.id ?? ''));
    const pickedSources = new Set(picked.map((entry) => entry.source));

    // Every media the picker knows, to find the one focused or refreshed.
    const known = new Map<string, Picked>();
    for (const [id, items] of uploaded) {
        items.forEach((item) => known.set(keyOf(id, item.id), { source: id, item }));
    }
    if (source !== null) {
        state.items.forEach((item) =>
            known.set(keyOf(source.id, item.id), { source: source.id, item }),
        );
    }
    for (const [key, entry] of selection) {
        known.set(key, entry);
    }
    const focusedEntry = focused !== null ? (known.get(focused) ?? null) : null;
    const focusedSource = sources.find((candidate) => candidate.id === focusedEntry?.source);
    const fields =
        focusedSource?.update !== undefined ? (focusedSource.fields ?? []) : ([] as const);
    const draftValues =
        draft !== null && draft.key === focused ? draft.values : (focusedEntry?.item.values ?? {});
    const dirty = draft !== null && draft.key === focused;

    /** Puts a media everywhere the picker shows it: after a refresh or a save. */
    const replace = (sourceKey: string, item: PickerMedia) => {
        const key = keyOf(sourceKey, item.id);
        browser.upsert(sourceKey, [item]);
        setSelection((currentSelection) =>
            currentSelection.has(key)
                ? new Map(currentSelection).set(key, { source: sourceKey, item })
                : currentSelection,
        );
        setUploaded((currentUploaded) => {
            const items = currentUploaded.get(sourceKey);
            return items?.some((entry) => entry.id === item.id) === true
                ? new Map(currentUploaded).set(
                      sourceKey,
                      items.map((entry) => (entry.id === item.id ? item : entry)),
                  )
                : currentUploaded;
        });
    };

    const focus = (key: string | null) => {
        if (dirty && key !== focused) {
            setPendingFocus(key);
            return;
        }
        setFocused(key);
        setSaveError(null);
    };

    const save = async (): Promise<boolean> => {
        if (focusedEntry === null || focusedSource?.update === undefined || draft === null) {
            return true;
        }
        setSaving(true);
        setSaveError(null);
        try {
            const saved = await focusedSource.update(focusedEntry.item.id, draft.values);
            replace(focusedEntry.source, saved);
            setDraft(null);
            return true;
        } catch (error) {
            setSaveError(
                intl.formatMessage(messages.pickerSaveFailed, {
                    error: error instanceof Error ? error.message : String(error),
                }),
            );
            return false;
        } finally {
            setSaving(false);
        }
    };

    const confirm = (entries: readonly Picked[]) => {
        onSelect(entries.map(toReference));
        onOpenChange(false);
    };

    /**
     * A grid reports what it has selected among its media. Two grids show a source (its library and
     * its uploads): each only changes the selection of the media it shows.
     */
    const select = (
        sourceKey: string,
        items: readonly PickerMedia[],
        ids: Set<string>,
        added: string | null,
    ) => {
        const shown = new Set(items.map((item) => item.id));
        const isShown = (entry: Picked) => entry.source === sourceKey && shown.has(entry.item.id);
        setSelection((currentSelection) => {
            if (!multiple) {
                const item = items.find((entry) => ids.has(entry.id));
                if (item !== undefined) {
                    return new Map([[keyOf(sourceKey, item.id), { source: sourceKey, item }]]);
                }
                return [...currentSelection.values()].some(isShown) ? new Map() : currentSelection;
            }
            const next = new Map(
                [...currentSelection].filter(
                    ([, entry]) => !isShown(entry) || ids.has(entry.item.id),
                ),
            );
            for (const item of items) {
                if (ids.has(item.id)) {
                    next.set(keyOf(sourceKey, item.id), { source: sourceKey, item });
                }
            }
            return next;
        });
        if (added !== null) {
            focus(keyOf(sourceKey, added));
        }
    };

    // Media being processed are read again until they are ready or failed.
    const following = [...known.values()].filter(({ item }) => isProcessingMedia(item));
    const followKey = following
        .map(({ source: id, item }) => `${keyOf(id, item.id)}:${item.media.status ?? ''}`)
        .join(',');
    const latestFollowing = useRef(following);
    const latestReplace = useRef(replace);
    useEffect(() => {
        latestFollowing.current = following;
        latestReplace.current = replace;
    });
    useEffect(() => {
        if (followKey === '') {
            return undefined;
        }
        const controller = new AbortController();
        const timer = setTimeout(() => {
            for (const entry of latestFollowing.current) {
                const owner = sources.find((candidate) => candidate.id === entry.source);
                owner
                    ?.get(entry.item.id, { signal: controller.signal })
                    .then((item) => latestReplace.current(entry.source, item))
                    .catch(() => undefined);
            }
        }, refreshInterval);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [followKey, refreshInterval, sources]);

    // Uploads go to the source shown, become media, and are selected.
    const uploadAccept = accept ?? source?.accept ?? null;
    const uploadMaxSize = smallest(maxSize, source?.maxSize);
    const rejectionMessage = useRejectionMessage(uploadMaxSize);
    const upload = useUploads({
        source: uploadSource === undefined ? context.uploadSource : uploadSource,
        accept: uploadAccept,
        maxSize: uploadMaxSize,
        onUploaded: (file) => {
            if (source === null) {
                return;
            }
            const target = source;
            const name = file.name;
            setCreating((currentCreating) => [...currentCreating, name]);
            target
                .create(file)
                .then((item) => {
                    const entry = { source: target.id, item };
                    setUploaded((currentUploaded) =>
                        new Map(currentUploaded).set(target.id, [
                            item,
                            ...(currentUploaded.get(target.id) ?? []),
                        ]),
                    );
                    browser.upsert(target.id, [item]);
                    if (!multiple && confirmOnUpload) {
                        confirm([entry]);
                        return;
                    }
                    setSelection((currentSelection) =>
                        multiple
                            ? new Map(currentSelection).set(keyOf(target.id, item.id), entry)
                            : new Map([[keyOf(target.id, item.id), entry]]),
                    );
                    focus(keyOf(target.id, item.id));
                })
                .catch((error: unknown) =>
                    setProblems((currentProblems) => [
                        ...currentProblems,
                        intl.formatMessage(messages.pickerCreateFailed, {
                            name,
                            error: error instanceof Error ? error.message : String(error),
                        }),
                    ]),
                )
                .finally(() =>
                    setCreating((currentCreating) => {
                        const at = currentCreating.indexOf(name);
                        return at === -1
                            ? currentCreating
                            : currentCreating.filter((_, index) => index !== at);
                    }),
                );
        },
        onRejected: (file, reason) =>
            setProblems((currentProblems) => [...currentProblems, rejectionMessage(file, reason)]),
    });

    // Infinite scroll: the next page when the end of the grid shows, and the scroll position back
    // when the user returns to a source.
    const scroller = useRef<HTMLDivElement>(null);
    const sentinel = useRef<HTMLDivElement>(null);
    const latestLoadMore = useRef(browser.loadMore);
    useEffect(() => {
        latestLoadMore.current = browser.loadMore;
    });
    const hasMore = state.nextCursor !== null;
    const browsing = state.items.length > 0;
    useEffect(() => {
        const target = sentinel.current;
        if (target === null || !hasMore || typeof IntersectionObserver === 'undefined') {
            return undefined;
        }
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    latestLoadMore.current();
                }
            },
            { root: scroller.current, rootMargin: '200px' },
        );
        observer.observe(target);
        return () => observer.disconnect();
    }, [hasMore, browsing, sourceId, tab]);
    const restoreScroll = useRef(browser.scrollTop);
    useEffect(() => {
        restoreScroll.current = browser.scrollTop;
    });
    useLayoutEffect(() => {
        if (scroller.current !== null) {
            scroller.current.scrollTop = restoreScroll.current();
        }
    }, [sourceId, tab, browsing]);

    if (source === null) {
        return null;
    }
    const library = source.label;
    const filters = [...(source.filters ?? []), ...openerFilters];
    const label =
        typeof confirmLabel === 'function'
            ? confirmLabel(picked.length)
            : (confirmLabel ?? intl.formatMessage(messages.pickerSelect));
    const selectedIn = (sourceKey: string) =>
        new Set(picked.filter((entry) => entry.source === sourceKey).map((entry) => entry.item.id));
    const currentIn = (sourceKey: string) =>
        new Set(
            value
                .filter((reference) => (reference.resource ?? sources[0]?.id) === sourceKey)
                .map((reference) => reference.id),
        );

    const grid = (items: readonly PickerMedia[], gridLabel: string) => (
        <MediaGrid
            items={items}
            label={gridLabel}
            multiple={multiple}
            selected={selectedIn(source.id)}
            current={currentIn(source.id)}
            onSelectionChange={(ids, added) => select(source.id, items, ids, added)}
            onDetails={(id) => {
                focus(keyOf(source.id, id));
                setDetailsOpen(true);
            }}
            accept={accept}
            maxSize={maxSize}
        />
    );

    let libraryContent;
    if (state.items.length === 0 && (state.status === 'idle' || state.status === 'loading')) {
        libraryContent = (
            <LoadingRegion
                className={styles.scroll}
                label={intl.formatMessage(messages.pickerLoading)}
            >
                <Skeletons />
            </LoadingRegion>
        );
    } else if (state.items.length === 0 && state.status === 'error') {
        libraryContent = (
            <div className={styles.center}>
                <Alert
                    tone="danger"
                    role="alert"
                    title={intl.formatMessage(messages.pickerLoadError)}
                    actions={
                        <Button size="sm" onPress={browser.retry}>
                            {intl.formatMessage(messages.pickerRetry)}
                        </Button>
                    }
                />
            </div>
        );
    } else if (state.items.length === 0 && isDefaultQuery(state.query)) {
        libraryContent = (
            <div className={styles.empty}>
                <Images aria-hidden size={48} strokeWidth={1.25} className={styles.emptyIcon} />
                <Heading level={3} size={4}>
                    {intl.formatMessage(messages.pickerEmpty, { library })}
                </Heading>
                {source.canCreate ? (
                    <>
                        <Text muted size="sm">
                            {intl.formatMessage(messages.pickerEmptyUpload, { library })}
                        </Text>
                        <Button variant="primary" onPress={() => setTab('upload')}>
                            {intl.formatMessage(messages.pickerUploadFiles)}
                        </Button>
                    </>
                ) : (
                    <Text muted size="sm">
                        {intl.formatMessage(messages.pickerEmptyReadOnly)}
                    </Text>
                )}
            </div>
        );
    } else if (state.items.length === 0) {
        libraryContent = (
            <div className={styles.empty}>
                <SearchX aria-hidden size={48} strokeWidth={1.25} className={styles.emptyIcon} />
                <Heading level={3} size={4}>
                    {intl.formatMessage(messages.pickerNoResults)}
                </Heading>
                <Button
                    onPress={() =>
                        browser.setQuery({ ...state.query, q: '', type: null, filter: {} })
                    }
                >
                    {intl.formatMessage(messages.pickerClearSearch)}
                </Button>
            </div>
        );
    } else {
        libraryContent = (
            <div className={styles.browse} data-details-open={detailsOpen || undefined}>
                <div
                    ref={scroller}
                    className={styles.scroll}
                    onScroll={(event) => browser.rememberScroll(event.currentTarget.scrollTop)}
                >
                    {grid(state.items, intl.formatMessage(messages.pickerMedia, { library }))}
                    <div className={styles.more}>
                        {state.total !== null ? (
                            <Text muted size="sm" as="span">
                                {intl.formatMessage(messages.pickerCount, {
                                    shown: state.items.length,
                                    total: state.total,
                                })}
                            </Text>
                        ) : null}
                        {state.status === 'more' ? (
                            <Spinner
                                size="sm"
                                label={intl.formatMessage(messages.pickerLoadingMore)}
                            />
                        ) : null}
                        {state.status === 'error' ? (
                            <Button size="sm" onPress={browser.retry}>
                                {intl.formatMessage(messages.pickerRetry)}
                            </Button>
                        ) : hasMore && state.status === 'ready' ? (
                            <Button size="sm" variant="ghost" onPress={browser.loadMore}>
                                {intl.formatMessage(messages.pickerLoadMore)}
                            </Button>
                        ) : null}
                        <div ref={sentinel} className={styles.sentinel} />
                    </div>
                </div>
                <MediaDetails
                    item={focusedEntry?.item ?? null}
                    fields={fields}
                    draft={draftValues}
                    onDraftChange={(values) =>
                        focused !== null ? setDraft({ key: focused, values }) : undefined
                    }
                    dirty={dirty}
                    saving={saving}
                    error={saveError}
                    onSave={() => void save()}
                    onBack={() => setDetailsOpen(false)}
                />
            </div>
        );
    }

    const uploadedHere = uploaded.get(source.id) ?? [];

    return (
        <Dialog
            isOpen
            onOpenChange={onOpenChange}
            title={title ?? intl.formatMessage(messages.pickerTitle)}
            size="xl"
            fullScreenOnPhone
            className={styles.dialog}
            bodyClassName={styles.body}
            headerContent={
                sources.length > 3 ? (
                    <Select
                        aria-label={intl.formatMessage(messages.pickerLibraries)}
                        isRequired
                        options={sources.map((candidate) => ({
                            value: candidate.id,
                            label: candidate.label,
                        }))}
                        value={source.id}
                        onChange={(next) => setSourceId(String(next))}
                        className={styles.librarySelect}
                    />
                ) : sources.length > 1 ? (
                    <SegmentedControl
                        aria-label={intl.formatMessage(messages.pickerLibraries)}
                        size="sm"
                        options={sources.map((candidate) => ({
                            value: candidate.id,
                            label: candidate.label,
                        }))}
                        value={source.id}
                        onChange={setSourceId}
                    />
                ) : null
            }
            footer={
                <div className={styles.footer}>
                    <div className={styles.summary} aria-live="polite">
                        {picked.length === 0 ? (
                            <Text muted size="sm" as="span">
                                {intl.formatMessage(messages.pickerNothingSelected)}
                            </Text>
                        ) : multiple ? (
                            <>
                                <Text size="sm" weight="medium" as="span">
                                    {pickedSources.size > 1
                                        ? intl.formatMessage(messages.pickerSelectedIn, {
                                              count: picked.length,
                                              libraries: pickedSources.size,
                                          })
                                        : intl.formatMessage(messages.pickerSelectedCount, {
                                              count: picked.length,
                                          })}
                                </Text>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onPress={() => setSelection(new Map())}
                                >
                                    {intl.formatMessage(messages.pickerClear)}
                                </Button>
                            </>
                        ) : (
                            <Text size="sm" as="span" truncate>
                                {intl.formatMessage(messages.pickerSelected, {
                                    name: picked[0]?.item.label ?? '',
                                })}
                            </Text>
                        )}
                    </div>
                    <div className={styles.actions}>
                        <Button className={styles.cancel} onPress={() => onOpenChange(false)}>
                            {intl.formatMessage(messages.pickerCancel)}
                        </Button>
                        <Button
                            variant="primary"
                            isDisabled={picked.length === 0 || unchanged}
                            onPress={() => confirm(picked)}
                        >
                            {label}
                        </Button>
                    </div>
                </div>
            }
        >
            <Tabs
                className={styles.tabs}
                selectedKey={tab}
                onSelectionChange={(key) => setTab(String(key))}
                disabledKeys={source.canCreate ? [] : ['upload']}
            >
                <div className={styles.bar}>
                    <TabList
                        aria-label={intl.formatMessage(messages.pickerTabs)}
                        className={styles.tabList}
                    >
                        <Tab id="library">{intl.formatMessage(messages.pickerTabLibrary)}</Tab>
                        <Tab id="upload">{intl.formatMessage(messages.pickerTabUpload)}</Tab>
                    </TabList>
                    {!source.canCreate ? (
                        <span className={styles.cannotUpload}>
                            <Lock aria-hidden size={14} />
                            {intl.formatMessage(messages.pickerCannotUpload, { library })}
                        </span>
                    ) : null}
                </div>
                <TabPanel id="library" className={styles.panel}>
                    {state.items.length > 0 || !isDefaultQuery(state.query) ? (
                        <PickerToolbar
                            query={state.query}
                            onQueryChange={browser.setQuery}
                            sorts={sortsOf(source)}
                            filters={filters}
                            locked={locked}
                            lockedFilters={filters}
                        />
                    ) : null}
                    {accept !== null || maxSize !== null ? (
                        <Text size="sm" muted className={styles.constraints}>
                            {maxSize !== null
                                ? intl.formatMessage(messages.pickerAcceptedSize, {
                                      types:
                                          accept !== null && accept.length > 0
                                              ? describeAccept(accept, intl)
                                              : intl.formatMessage(messages.pickerAnyFile),
                                      size: formatSize(maxSize, intl.locale),
                                  })
                                : intl.formatMessage(messages.pickerAccepted, {
                                      types: describeAccept(accept ?? [], intl),
                                  })}
                        </Text>
                    ) : null}
                    {libraryContent}
                </TabPanel>
                <TabPanel id="upload" className={styles.panel}>
                    <div className={styles.scroll}>
                        <UploadPanel
                            library={library}
                            multiple={multiple}
                            confirmOnUpload={confirmOnUpload}
                            accept={uploadAccept}
                            maxSize={uploadMaxSize}
                            upload={upload}
                            problems={problems}
                            creating={creating}
                            uploaded={
                                uploadedHere.length > 0
                                    ? grid(
                                          uploadedHere,
                                          intl.formatMessage(messages.pickerAddedTo, { library }),
                                      )
                                    : null
                            }
                        />
                    </div>
                </TabPanel>
            </Tabs>
            <Dialog
                isOpen={pendingFocus !== null}
                onOpenChange={(open) => (open ? undefined : setPendingFocus(null))}
                role="alertdialog"
                isDismissable={false}
                size="sm"
                title={intl.formatMessage(messages.pickerUnsaved, {
                    name: focusedEntry?.item.label ?? '',
                })}
                footer={
                    <>
                        <Button
                            onPress={() => {
                                setDraft(null);
                                setFocused(pendingFocus);
                                setPendingFocus(null);
                            }}
                        >
                            {intl.formatMessage(messages.pickerDiscard)}
                        </Button>
                        <Button
                            variant="primary"
                            isDisabled={saving}
                            onPress={() =>
                                void save().then((saved) => {
                                    if (saved) {
                                        setFocused(pendingFocus);
                                    }
                                    setPendingFocus(null);
                                })
                            }
                        >
                            {intl.formatMessage(messages.pickerSave)}
                        </Button>
                    </>
                }
            >
                {intl.formatMessage(messages.pickerUnsavedText)}
            </Dialog>
        </Dialog>
    );
}
