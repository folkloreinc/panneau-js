import {
    ArrowLeft,
    AudioLines,
    Check,
    File,
    FileText,
    Film,
    Image as ImageIcon,
    Images,
    Info,
    Lock,
    type LucideIcon,
    Search,
    SearchX,
    SlidersHorizontal,
} from 'lucide-react';
import { useState } from 'react';
import { GridList, GridListItem, ToggleButton, ToggleButtonGroup } from 'react-aria-components';

import { FilePicker, type UploadItem, UploadList, formatSize, matchesMime } from '@panneau/fields';
import {
    Alert,
    Badge,
    Button,
    Dialog,
    Heading,
    IconButton,
    Select,
    Spinner,
    Tab,
    TabList,
    TabPanel,
    Tabs,
    Text,
    TextArea,
    TextInput,
} from '@panneau/ui';

import styles from './MediaPickerMockup.module.css';
import { DEFAULT_SORTS, type MediaType, type PickerMedia } from './MediaSource';

/**
 * A mockup of the media picker, for review: static data, no source, English text. It is not the
 * component: it shows the agreed layout and states, so they can be discussed before it's built.
 */

/** A filter of a library or of the opener, as a select. */
export interface MockFilter {
    id: string;
    label: string;
    options: string[];
    multiple?: boolean;
}

/** A library, as the mockup gets it: what a `MediaSource` would give. */
export interface MockLibrary {
    id: string;
    label: string;
    items: PickerMedia[];
    /** How many media the library has, when more pages would load. */
    total?: number;
    canCreate?: boolean;
    /** The library's own filters, after the type filter. */
    filters?: MockFilter[];
    /** Whether the details can edit the media's fields. Defaults to true. */
    canUpdate?: boolean;
}

export interface MediaPickerMockupProps {
    /** The title, which the opener chooses. */
    title?: string;
    /** The primary button, which the opener chooses, with the number of media selected. */
    confirmLabel?: string | ((count: number) => string);
    multiple?: boolean;
    libraries: MockLibrary[];
    /** The library shown first. Defaults to the first one. */
    library?: string;
    tab?: 'library' | 'upload';
    /** Loading the first page, or failed to. */
    state?: 'ready' | 'loading' | 'error';
    selected?: string[];
    /** The media of the field's value: the picker marks them, and a single pick replaces it. */
    current?: string[];
    /** The media shown in the details panel. */
    focused?: string | null;
    /** On phones, the details of the focused media are open, over the grid. */
    detailsOpen?: boolean;
    query?: string;
    type?: MediaType | null;
    sort?: string;
    /** Filters the opener adds, and their values. */
    filters?: MockFilter[];
    filterValues?: Record<string, string[]>;
    /** Whether the row of filters is open. Defaults to whether a filter has a value. */
    filtersOpen?: boolean;
    /** Filters the opener applies and the user can't change, as they are shown. */
    lockedFilters?: string[];
    /** The field's `accept` and `maxSize`, on top of the library's. */
    accept?: readonly string[] | null;
    maxSize?: number | null;
    /** Confirms as soon as a single media is uploaded. */
    confirmOnUpload?: boolean;
    /** The Upload tab: files being sent, refused, and made media. */
    uploads?: UploadItem[];
    rejected?: { name: string; reason: string }[];
    uploaded?: PickerMedia[];
}

const TYPE_ICONS: Record<string, LucideIcon> = {
    image: ImageIcon,
    video: Film,
    audio: AudioLines,
    document: FileText,
};

const TYPE_LABELS: Record<string, string> = {
    image: 'Image',
    video: 'Video',
    audio: 'Audio',
    document: 'Document',
    other: 'Other',
};

const TYPE_OPTIONS = [
    { value: 'all', label: 'All types' },
    { value: 'image', label: 'Images' },
    { value: 'video', label: 'Videos' },
    { value: 'audio', label: 'Audio' },
    { value: 'document', label: 'Documents' },
    { value: 'other', label: 'Other' },
];

const SORT_OPTIONS = DEFAULT_SORTS.map((sort) => ({ value: sort.id, label: sort.label }));

function extension(item: PickerMedia): string {
    const match = /\.([a-z0-9]+)$/i.exec(item.fileName ?? '');
    return match?.[1]?.toUpperCase() ?? TYPE_LABELS[item.media.type] ?? 'File';
}

function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const rest = String(Math.round(seconds % 60)).padStart(2, '0');
    return minutes >= 60
        ? `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}:${rest}`
        : `${minutes}:${rest}`;
}

function sortValue(item: PickerMedia, key: string): number | string {
    const { media } = item;
    switch (key) {
        case 'name':
            return item.label;
        case 'size':
            return media.size ?? 0;
        case 'pixels':
            return (media.width ?? 0) * (media.height ?? 0);
        case 'duration':
            return media.duration ?? 0;
        default:
            return item.createdAt ?? '';
    }
}

function sortItems(items: PickerMedia[], sort: string): PickerMedia[] {
    const descending = sort.startsWith('-');
    const key = descending ? sort.slice(1) : sort;
    return [...items].sort((a, b) => {
        const left = sortValue(a, key);
        const right = sortValue(b, key);
        const order =
            typeof left === 'number' && typeof right === 'number'
                ? left - right
                : String(left).localeCompare(String(right));
        return descending ? -order : order;
    });
}

/** Why a media can't be picked here, or null. */
function refusal(
    item: PickerMedia,
    accept: readonly string[] | null,
    maxSize: number | null,
): string | null {
    if (item.media.status === 'failed') {
        return 'Processing failed';
    }
    const mime = item.media.mime ?? '';
    if (accept !== null && accept.length > 0 && !matchesMime(mime, accept)) {
        return `${extension(item)} not accepted here`;
    }
    const size = item.media.size ?? 0;
    if (maxSize !== null && size > maxSize) {
        return `Over the ${formatSize(maxSize, 'en')} limit`;
    }
    return null;
}

function isProcessing(item: PickerMedia): boolean {
    return item.media.status === 'pending' || item.media.status === 'processing';
}

function StatusBadge({ item }: { item: PickerMedia }) {
    if (item.media.status === 'failed') {
        return (
            <Badge tone="danger" appearance="solid">
                Failed
            </Badge>
        );
    }
    if (isProcessing(item)) {
        return (
            <Badge tone="warning" appearance="solid">
                {item.media.status === 'pending' ? 'Waiting' : 'Processing'}
            </Badge>
        );
    }
    return null;
}

function Thumbnail({ item, large = false }: { item: PickerMedia; large?: boolean }) {
    const url = large ? (item.media.url ?? item.media.thumbnailUrl) : item.media.thumbnailUrl;
    if (typeof url === 'string') {
        const alt = item.values?.alt;
        return (
            <img
                className={large ? styles.previewImage : styles.thumbnailImage}
                src={url}
                alt={large && typeof alt === 'string' ? alt : ''}
            />
        );
    }
    const Icon = TYPE_ICONS[item.media.type] ?? File;
    return (
        <span className={styles.typeIcon} data-type={item.media.type}>
            <Icon aria-hidden size={large ? 48 : 32} strokeWidth={1.5} />
            <span className={styles.extension}>{extension(item)}</span>
        </span>
    );
}

interface MediaGridProps {
    items: PickerMedia[];
    label: string;
    multiple: boolean;
    selected: Set<string>;
    current: Set<string>;
    onSelect: (ids: Set<string>, toggled: string | null) => void;
    onDetails: (id: string) => void;
    accept: readonly string[] | null;
    maxSize: number | null;
}

/** The grid of media, with React Aria's grid list: arrows to move, Space to select. */
function MediaGrid({
    items,
    label,
    multiple,
    selected,
    current,
    onSelect,
    onDetails,
    accept,
    maxSize,
}: MediaGridProps) {
    const refused = new Map(
        items.map((item) => [item.id, refusal(item, accept, maxSize)] as const),
    );
    return (
        <GridList
            aria-label={label}
            layout="grid"
            className={styles.grid}
            selectionMode={multiple ? 'multiple' : 'single'}
            selectionBehavior="toggle"
            selectedKeys={selected}
            disabledKeys={[...refused].filter(([, reason]) => reason !== null).map(([id]) => id)}
            onSelectionChange={(keys) => {
                const next = new Set(
                    keys === 'all' ? items.map((item) => item.id) : [...keys].map(String),
                );
                const toggled =
                    [...next].find((id) => !selected.has(id)) ??
                    [...selected].find((id) => !next.has(id)) ??
                    null;
                onSelect(next, toggled);
            }}
        >
            {items.map((item) => {
                const reason = refused.get(item.id) ?? null;
                const size = item.media.size;
                return (
                    <GridListItem
                        key={item.id}
                        id={item.id}
                        textValue={item.label}
                        className={styles.card}
                    >
                        {({ isSelected }) => (
                            <>
                                <span className={styles.thumbnail}>
                                    <Thumbnail item={item} />
                                    <span
                                        className={multiple ? styles.checkbox : styles.radio}
                                        data-selected={isSelected || undefined}
                                        aria-hidden
                                    >
                                        {isSelected ? <Check size={14} strokeWidth={3} /> : null}
                                    </span>
                                    <span className={styles.badges}>
                                        {current.has(item.id) ? (
                                            <Badge tone="info" appearance="solid">
                                                Current
                                            </Badge>
                                        ) : null}
                                        <StatusBadge item={item} />
                                    </span>
                                    {item.media.duration !== null &&
                                    item.media.duration !== undefined ? (
                                        <span className={styles.duration}>
                                            {formatDuration(item.media.duration)}
                                        </span>
                                    ) : null}
                                </span>
                                <span className={styles.cardText}>
                                    <span className={styles.cardName}>{item.label}</span>
                                    {reason !== null ? (
                                        <span className={styles.reason}>{reason}</span>
                                    ) : (
                                        <span className={styles.cardMeta}>
                                            {extension(item)}
                                            {typeof size === 'number'
                                                ? ` · ${formatSize(size, 'en')}`
                                                : null}
                                        </span>
                                    )}
                                </span>
                                {/* On phones, where there is no details panel. */}
                                <IconButton
                                    icon={Info}
                                    size="sm"
                                    label={`Details of ${item.label}`}
                                    showTooltip={false}
                                    className={styles.detailsButton}
                                    onPress={() => onDetails(item.id)}
                                />
                            </>
                        )}
                    </GridListItem>
                );
            })}
        </GridList>
    );
}

const FIELD_LABELS: Record<string, string> = {
    alt: 'Alt text',
    description: 'Description',
    tags: 'Tags',
};

function Details({
    item,
    editable,
    onBack,
}: {
    item: PickerMedia | null;
    editable: boolean;
    onBack: () => void;
}) {
    if (item === null) {
        return (
            <aside className={styles.details} aria-label="Details" tabIndex={0}>
                <Text muted size="sm">
                    Select a media to see its details.
                </Text>
            </aside>
        );
    }
    const { media } = item;
    const rows: [string, string][] = [
        ['File', item.fileName ?? '—'],
        ['Type', `${TYPE_LABELS[media.type] ?? media.type} · ${media.mime ?? ''}`],
    ];
    if (typeof media.size === 'number') {
        rows.push(['Size', formatSize(media.size, 'en')]);
    }
    if (typeof media.width === 'number' && typeof media.height === 'number') {
        rows.push(['Dimensions', `${media.width} × ${media.height}`]);
    }
    if (typeof media.duration === 'number') {
        rows.push(['Duration', formatDuration(media.duration)]);
    }
    if (typeof item.createdAt === 'string') {
        rows.push(['Added', item.createdAt]);
    }
    const values = item.values ?? {};
    const text = (name: string) => {
        const value = values[name];
        return Array.isArray(value) ? value.join(', ') : typeof value === 'string' ? value : '';
    };
    return (
        <aside className={styles.details} aria-label="Details" tabIndex={0}>
            <Button
                size="sm"
                variant="ghost"
                icon={ArrowLeft}
                onPress={onBack}
                className={styles.backButton}
            >
                Back to the media
            </Button>
            <div className={styles.preview}>
                <Thumbnail item={item} large />
            </div>
            <div className={styles.detailsTitle}>
                {editable ? null : (
                    <Heading level={3} size={4}>
                        {item.label}
                    </Heading>
                )}
                <StatusBadge item={item} />
            </div>
            {isProcessing(item) ? (
                <Text size="sm" muted>
                    Still being processed: it can be used now, and its renditions will follow.
                </Text>
            ) : null}
            {editable ? (
                <form
                    key={item.id}
                    className={styles.form}
                    onSubmit={(event) => event.preventDefault()}
                >
                    <TextInput label="Title" defaultValue={item.label} />
                    {media.type === 'image' ? (
                        <TextInput label={FIELD_LABELS.alt} defaultValue={text('alt')} />
                    ) : null}
                    <TextArea
                        label={FIELD_LABELS.description}
                        defaultValue={text('description')}
                        rows={2}
                    />
                    <TextInput
                        label={FIELD_LABELS.tags}
                        defaultValue={text('tags')}
                        description="The fields of the library, or those the app gives."
                    />
                    <div className={styles.formActions}>
                        <Button size="sm" isDisabled>
                            Save
                        </Button>
                    </div>
                </form>
            ) : null}
            <dl className={styles.properties}>
                {rows.map(([term, value]) => (
                    <div key={term}>
                        <dt>{term}</dt>
                        <dd>{value}</dd>
                    </div>
                ))}
            </dl>
        </aside>
    );
}

function LibrarySwitcher({
    libraries,
    value,
    onChange,
}: {
    libraries: MockLibrary[];
    value: string;
    onChange: (id: string) => void;
}) {
    if (libraries.length < 2) {
        return null;
    }
    // A segmented control for a few libraries, a select beyond.
    if (libraries.length <= 3) {
        return (
            <ToggleButtonGroup
                aria-label="Library"
                className={styles.segmented}
                selectionMode="single"
                disallowEmptySelection
                selectedKeys={[value]}
                onSelectionChange={(keys) => {
                    const [key] = [...keys];
                    if (key !== undefined) {
                        onChange(String(key));
                    }
                }}
            >
                {libraries.map((library) => (
                    <ToggleButton key={library.id} id={library.id} className={styles.segment}>
                        {library.label}
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>
        );
    }
    return (
        <Select
            aria-label="Library"
            className={styles.librarySelect}
            isRequired
            options={libraries.map((library) => ({ value: library.id, label: library.label }))}
            value={value}
            onChange={(next) => onChange(String(next))}
        />
    );
}

function Skeletons() {
    return (
        <div className={styles.grid} aria-hidden>
            {Array.from({ length: 12 }, (_, index) => (
                <div key={index} className={styles.skeletonCard}>
                    <span className={styles.skeletonThumbnail} />
                    <span className={styles.skeletonLine} />
                    <span className={styles.skeletonLineShort} />
                </div>
            ))}
        </div>
    );
}

export function MediaPickerMockup({
    title = 'Choose media',
    confirmLabel = 'Select',
    multiple = false,
    libraries,
    library: initialLibrary,
    tab: initialTab = 'library',
    state = 'ready',
    selected: initialSelected = [],
    current: currentIds = [],
    focused: initialFocused,
    detailsOpen: initialDetailsOpen = false,
    query: initialQuery = '',
    type: initialType = null,
    sort: initialSort = '-createdAt',
    filters: openerFilters = [],
    filterValues: initialFilterValues = {},
    filtersOpen: initialFiltersOpen,
    lockedFilters = [],
    accept = null,
    maxSize = null,
    confirmOnUpload = false,
    uploads = [],
    rejected = [],
    uploaded = [],
}: MediaPickerMockupProps) {
    const [libraryId, setLibraryId] = useState(initialLibrary ?? libraries[0]?.id ?? '');
    const [tab, setTab] = useState<string>(initialTab);
    const [selected, setSelected] = useState(() => new Set(initialSelected));
    const [focused, setFocused] = useState<string | null>(
        initialFocused !== undefined ? initialFocused : (initialSelected.at(-1) ?? null),
    );
    const [detailsOpen, setDetailsOpen] = useState(initialDetailsOpen);
    const [query, setQuery] = useState(initialQuery);
    const [type, setType] = useState<string>(initialType ?? 'all');
    const [sort, setSort] = useState(initialSort);
    const [filterValues, setFilterValues] = useState(initialFilterValues);
    const activeFilters = Object.values(filterValues).filter((values) => values.length > 0);
    const [filtersOpen, setFiltersOpen] = useState(
        initialFiltersOpen ?? (activeFilters.length > 0 || lockedFilters.length > 0),
    );

    const library = libraries.find((candidate) => candidate.id === libraryId) ?? libraries[0];
    const canCreate = library?.canCreate !== false;
    const filters = [...(library?.filters ?? []), ...openerFilters];
    const everything = [...uploaded, ...libraries.flatMap((candidate) => candidate.items)];
    const items = sortItems(
        (library?.items ?? []).filter(
            (item) =>
                (type === 'all' || item.media.type === type) &&
                Object.entries(filterValues).every(([id, values]) => {
                    const value = item.values?.[id];
                    const itemValues = Array.isArray(value) ? value : [value];
                    return values.length === 0 || values.some((v) => itemValues.includes(v));
                }) &&
                (query === '' ||
                    `${item.label} ${item.fileName ?? ''}`
                        .toLowerCase()
                        .includes(query.toLowerCase())),
        ),
        sort,
    );
    const current = new Set(currentIds);
    const selection = everything.filter((item) => selected.has(item.id));
    const selectedLibraries = libraries.filter((candidate) =>
        candidate.items.some((item) => selected.has(item.id)),
    );
    const focusedItem = everything.find((item) => item.id === focused) ?? null;
    const label =
        typeof confirmLabel === 'function' ? confirmLabel(selection.length) : confirmLabel;
    const unchanged = !multiple && selection.length === 1 && current.has(selection[0]?.id ?? '');

    const select = (ids: Set<string>, toggled: string | null) => {
        setSelected(ids);
        if (toggled !== null && ids.has(toggled)) {
            setFocused(toggled);
        }
    };

    const showDetails = (id: string) => {
        setFocused(id);
        setDetailsOpen(true);
    };

    const grid = (gridItems: PickerMedia[], gridLabel: string) => (
        <MediaGrid
            items={gridItems}
            label={gridLabel}
            multiple={multiple}
            selected={selected}
            current={current}
            onSelect={select}
            onDetails={showDetails}
            accept={accept}
            maxSize={maxSize}
        />
    );

    let libraryContent;
    if (state === 'loading') {
        libraryContent = (
            <div className={styles.scroll} aria-busy="true">
                <span className={styles.visuallyHidden} role="status">
                    Loading media…
                </span>
                <Skeletons />
            </div>
        );
    } else if (state === 'error') {
        libraryContent = (
            <div className={styles.center}>
                <Alert
                    tone="danger"
                    title="The media couldn’t be loaded"
                    actions={<Button size="sm">Try again</Button>}
                >
                    The server didn’t answer (503). Check your connection, then try again.
                </Alert>
            </div>
        );
    } else if ((library?.items.length ?? 0) === 0) {
        libraryContent = (
            <div className={styles.empty}>
                <Images aria-hidden size={48} strokeWidth={1.25} className={styles.emptyIcon} />
                <Heading level={3} size={4}>
                    {library?.label ?? 'This library'} has no media yet
                </Heading>
                {canCreate ? (
                    <>
                        <Text muted size="sm">
                            Upload images, videos or documents: they’ll be added to{' '}
                            {library?.label ?? 'the library'} and selected.
                        </Text>
                        <Button variant="primary" onPress={() => setTab('upload')}>
                            Upload files
                        </Button>
                    </>
                ) : (
                    <Text muted size="sm">
                        You can’t add media to it. Ask someone who manages it.
                    </Text>
                )}
            </div>
        );
    } else if (items.length === 0) {
        libraryContent = (
            <div className={styles.empty}>
                <SearchX aria-hidden size={48} strokeWidth={1.25} className={styles.emptyIcon} />
                <Heading level={3} size={4}>
                    No media match “{query}”
                </Heading>
                <Button
                    onPress={() => {
                        setQuery('');
                        setType('all');
                    }}
                >
                    Clear the search
                </Button>
            </div>
        );
    } else {
        // The library's total, unless the list is narrowed: the source then gives its own.
        const narrowed = query !== '' || type !== 'all' || activeFilters.length > 0;
        const total = narrowed ? items.length : (library?.total ?? items.length);
        libraryContent = (
            <div className={styles.browse} data-details-open={detailsOpen || undefined}>
                <div className={styles.scroll}>
                    {grid(items, `Media of ${library?.label ?? 'the library'}`)}
                    <div className={styles.more}>
                        {total > items.length ? (
                            <Spinner size="sm" label="Loading more media" />
                        ) : null}
                        <Text muted size="sm">
                            {items.length} of {total} media
                        </Text>
                    </div>
                </div>
                <Details
                    item={focusedItem}
                    editable={library?.canUpdate !== false}
                    onBack={() => setDetailsOpen(false)}
                />
            </div>
        );
    }

    const filterCount = activeFilters.length + (type !== 'all' ? 1 : 0);

    return (
        <Dialog
            isOpen
            title={title}
            size="lg"
            overlayClassName={styles.overlay}
            className={styles.dialog}
            bodyClassName={styles.body}
            footer={
                <div className={styles.footer}>
                    <div className={styles.summary} aria-live="polite">
                        {selection.length === 0 ? (
                            <Text muted size="sm" as="span">
                                {multiple ? 'No media selected' : 'Nothing selected'}
                            </Text>
                        ) : multiple ? (
                            <>
                                <Text size="sm" weight="medium" as="span">
                                    {selection.length} selected
                                    {selectedLibraries.length > 1
                                        ? ` in ${selectedLibraries.length} libraries`
                                        : ''}
                                </Text>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onPress={() => select(new Set(), null)}
                                >
                                    Clear
                                </Button>
                            </>
                        ) : (
                            <Text size="sm" as="span" truncate>
                                {unchanged ? 'Current: ' : 'Selected: '}
                                <strong>{selection[0]?.label}</strong>
                            </Text>
                        )}
                    </div>
                    <div className={styles.actions}>
                        <Button>Cancel</Button>
                        <Button variant="primary" isDisabled={selection.length === 0 || unchanged}>
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
                disabledKeys={canCreate ? [] : ['upload']}
            >
                <div className={styles.bar}>
                    <TabList aria-label="Add media from" className={styles.tabList}>
                        <Tab id="library">Library</Tab>
                        <Tab id="upload">Upload</Tab>
                    </TabList>
                    {!canCreate ? (
                        <span className={styles.locked}>
                            <Lock aria-hidden size={14} />
                            You can’t upload to {library?.label}
                        </span>
                    ) : null}
                    <div className={styles.switcher}>
                        <LibrarySwitcher
                            libraries={libraries}
                            value={libraryId}
                            onChange={setLibraryId}
                        />
                    </div>
                </div>
                <TabPanel id="library" className={styles.panel}>
                    {state === 'ready' && (library?.items.length ?? 0) > 0 ? (
                        <div className={styles.toolbar}>
                            <TextInput
                                type="search"
                                aria-label="Search media"
                                placeholder="Search by name"
                                prefix={<Search aria-hidden size={16} />}
                                value={query}
                                onChange={setQuery}
                                className={styles.search}
                            />
                            <Select
                                aria-label="Type"
                                isRequired
                                options={TYPE_OPTIONS}
                                value={type}
                                onChange={(next) => setType(String(next))}
                                className={styles.typeFilter}
                            />
                            <Select
                                aria-label="Sort"
                                isRequired
                                options={SORT_OPTIONS}
                                value={sort}
                                onChange={(next) => setSort(String(next))}
                                className={styles.sort}
                            />
                            {filters.length > 0 || lockedFilters.length > 0 ? (
                                <Button
                                    icon={SlidersHorizontal}
                                    aria-expanded={filtersOpen}
                                    onPress={() => setFiltersOpen(!filtersOpen)}
                                >
                                    Filters
                                    {filterCount > 0 ? (
                                        <Badge appearance="solid" tone="accent">
                                            {filterCount}
                                        </Badge>
                                    ) : null}
                                </Button>
                            ) : null}
                        </div>
                    ) : null}
                    {filtersOpen && state === 'ready' ? (
                        <div className={styles.filters}>
                            {lockedFilters.map((locked) => (
                                <span key={locked} className={styles.lockedFilter}>
                                    <Lock aria-hidden size={12} />
                                    {locked}
                                </span>
                            ))}
                            {filters.map((filter) =>
                                filter.multiple === true ? (
                                    <Select
                                        key={filter.id}
                                        aria-label={filter.label}
                                        placeholder={filter.label}
                                        multiple
                                        options={filter.options.map((option) => ({
                                            value: option,
                                            label: option,
                                        }))}
                                        value={filterValues[filter.id] ?? []}
                                        onChange={(values) =>
                                            setFilterValues({
                                                ...filterValues,
                                                [filter.id]: values.map(String),
                                            })
                                        }
                                        className={styles.filter}
                                    />
                                ) : (
                                    <Select
                                        key={filter.id}
                                        aria-label={filter.label}
                                        placeholder={filter.label}
                                        options={filter.options.map((option) => ({
                                            value: option,
                                            label: option,
                                        }))}
                                        value={filterValues[filter.id]?.[0] ?? null}
                                        onChange={(value) =>
                                            setFilterValues({
                                                ...filterValues,
                                                [filter.id]: value === null ? [] : [String(value)],
                                            })
                                        }
                                        className={styles.filter}
                                    />
                                ),
                            )}
                            {activeFilters.length > 0 ? (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onPress={() => setFilterValues({})}
                                >
                                    Reset filters
                                </Button>
                            ) : null}
                        </div>
                    ) : null}
                    {accept !== null || maxSize !== null ? (
                        <Text size="sm" muted className={styles.constraints}>
                            Only {describeAccept(accept)}
                            {maxSize !== null ? ` up to ${formatSize(maxSize, 'en')}` : ''} can be
                            selected here.
                        </Text>
                    ) : null}
                    {libraryContent}
                </TabPanel>
                <TabPanel id="upload" className={styles.panel}>
                    <div className={styles.scroll}>
                        <div className={styles.upload}>
                            <div className={styles.dropZone}>
                                <FilePicker multiple={multiple} onSelect={() => undefined} />
                                <Text size="sm" muted>
                                    {capitalize(
                                        describeAccept(
                                            accept ?? ['image/*', 'video/*', 'application/pdf'],
                                        ),
                                    )}
                                    , up to {formatSize(maxSize ?? 2 * 1024 ** 3, 'en')} each. Files
                                    are added to <strong>{library?.label}</strong>
                                    {multiple
                                        ? ' and selected.'
                                        : confirmOnUpload
                                          ? `, and the media is used as soon as it’s ready to be: no need to confirm.`
                                          : ', and the last one is selected.'}
                                </Text>
                            </div>
                            {rejected.length > 0 ? (
                                <Alert
                                    tone="danger"
                                    title={`${rejected.length} files weren’t sent`}
                                    className={styles.rejectedAlert}
                                >
                                    <ul className={styles.rejected}>
                                        {rejected.map((file) => (
                                            <li key={file.name}>
                                                <strong>{file.name}</strong>: {file.reason}
                                            </li>
                                        ))}
                                    </ul>
                                </Alert>
                            ) : null}
                            {uploaded.length > 0 ? (
                                <section className={styles.uploaded} aria-labelledby="uploaded">
                                    <Heading level={3} size={4} id="uploaded">
                                        Added to {library?.label}
                                    </Heading>
                                    {grid(uploaded, `Added to ${library?.label ?? 'the library'}`)}
                                </section>
                            ) : null}
                            {uploads.length > 0 ? (
                                <section className={styles.sending} aria-labelledby="sending">
                                    <Heading level={3} size={4} id="sending">
                                        Uploading {uploads.length}{' '}
                                        {uploads.length > 1 ? 'files' : 'file'}
                                    </Heading>
                                    <UploadList
                                        items={uploads}
                                        onPause={() => undefined}
                                        onResume={() => undefined}
                                        onCancel={() => undefined}
                                        onRetry={() => undefined}
                                    />
                                </section>
                            ) : null}
                        </div>
                    </div>
                </TabPanel>
            </Tabs>
        </Dialog>
    );
}

function capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function describeAccept(accept: readonly string[] | null): string {
    if (accept === null || accept.length === 0) {
        return 'any file';
    }
    const names = accept.map((pattern) => {
        if (pattern.endsWith('/*')) {
            return `${pattern.slice(0, -2)}s`;
        }
        return pattern === 'application/pdf' ? 'PDF' : (pattern.split('/')[1] ?? pattern);
    });
    return names.length > 1
        ? `${names.slice(0, -1).join(', ')} and ${names.at(-1) ?? ''}`
        : (names[0] ?? '');
}
