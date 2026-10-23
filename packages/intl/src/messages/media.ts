import { defineMessage } from '../message';

/**
 * The messages of `@panneau/media`, with their English text, which is also the default one.
 * French is in `../fr/media.ts`. Its fields also use those of `@panneau/fields` for uploads.
 */
export const mediaMessages = {
    noMedia: defineMessage({ id: 'panneau.media.noMedia', defaultMessage: 'No media' }),
    statusPending: defineMessage({ id: 'panneau.media.statusPending', defaultMessage: 'Waiting' }),
    statusProcessing: defineMessage({
        id: 'panneau.media.statusProcessing',
        defaultMessage: 'Processing',
    }),
    statusFailed: defineMessage({
        id: 'panneau.media.statusFailed',
        defaultMessage: 'Processing failed',
    }),
    unavailable: defineMessage({
        id: 'panneau.media.unavailable',
        defaultMessage: 'Files can’t be uploaded here.',
    }),
    chooseMedia: defineMessage({ id: 'panneau.media.chooseMedia', defaultMessage: 'Choose media' }),
    addMedia: defineMessage({ id: 'panneau.media.addMedia', defaultMessage: 'Add media' }),
    uploadFile: defineMessage({ id: 'panneau.media.uploadFile', defaultMessage: 'Upload a file' }),
    uploadFiles: defineMessage({ id: 'panneau.media.uploadFiles', defaultMessage: 'Upload files' }),
    // The media picker (`@panneau/media/picker`, decision 0027).
    pickerTitle: defineMessage({
        id: 'panneau.media.picker.title',
        defaultMessage: 'Choose media',
    }),
    pickerSelect: defineMessage({
        id: 'panneau.media.picker.select',
        defaultMessage: 'Select',
    }),
    pickerCancel: defineMessage({
        id: 'panneau.media.picker.cancel',
        defaultMessage: 'Cancel',
    }),
    pickerLibraries: defineMessage({
        id: 'panneau.media.picker.libraries',
        defaultMessage: 'Libraries',
    }),
    pickerTabs: defineMessage({
        id: 'panneau.media.picker.tabs',
        defaultMessage: 'Add media from',
    }),
    pickerTabLibrary: defineMessage({
        id: 'panneau.media.picker.tabLibrary',
        defaultMessage: 'Library',
    }),
    pickerTabUpload: defineMessage({
        id: 'panneau.media.picker.tabUpload',
        defaultMessage: 'Upload',
    }),
    pickerCannotUpload: defineMessage<{ library: string }>({
        id: 'panneau.media.picker.cannotUpload',
        defaultMessage: 'You can’t upload to {library}',
    }),
    pickerSearch: defineMessage({
        id: 'panneau.media.picker.search',
        defaultMessage: 'Search media',
    }),
    pickerSearchPlaceholder: defineMessage({
        id: 'panneau.media.picker.searchPlaceholder',
        defaultMessage: 'Search by name',
    }),
    pickerType: defineMessage({
        id: 'panneau.media.picker.type',
        defaultMessage: 'Type',
    }),
    pickerTypeAll: defineMessage({
        id: 'panneau.media.picker.typeAll',
        defaultMessage: 'All types',
    }),
    pickerTypeImage: defineMessage({
        id: 'panneau.media.picker.typeImage',
        defaultMessage: 'Images',
    }),
    pickerTypeVideo: defineMessage({
        id: 'panneau.media.picker.typeVideo',
        defaultMessage: 'Videos',
    }),
    pickerTypeAudio: defineMessage({
        id: 'panneau.media.picker.typeAudio',
        defaultMessage: 'Audio',
    }),
    pickerTypeDocument: defineMessage({
        id: 'panneau.media.picker.typeDocument',
        defaultMessage: 'Documents',
    }),
    pickerTypeOther: defineMessage({
        id: 'panneau.media.picker.typeOther',
        defaultMessage: 'Other',
    }),
    pickerSort: defineMessage({
        id: 'panneau.media.picker.sort',
        defaultMessage: 'Sort',
    }),
    pickerSortNewest: defineMessage({
        id: 'panneau.media.picker.sortNewest',
        defaultMessage: 'Newest',
    }),
    pickerSortOldest: defineMessage({
        id: 'panneau.media.picker.sortOldest',
        defaultMessage: 'Oldest',
    }),
    pickerSortName: defineMessage({
        id: 'panneau.media.picker.sortName',
        defaultMessage: 'Name',
    }),
    pickerSortSize: defineMessage({
        id: 'panneau.media.picker.sortSize',
        defaultMessage: 'File size',
    }),
    pickerSortDimensions: defineMessage({
        id: 'panneau.media.picker.sortDimensions',
        defaultMessage: 'Dimensions',
    }),
    pickerSortDuration: defineMessage({
        id: 'panneau.media.picker.sortDuration',
        defaultMessage: 'Duration',
    }),
    pickerFilters: defineMessage({
        id: 'panneau.media.picker.filters',
        defaultMessage: 'Filters',
    }),
    pickerResetFilters: defineMessage({
        id: 'panneau.media.picker.resetFilters',
        defaultMessage: 'Reset filters',
    }),
    pickerLockedFilter: defineMessage<{ label: string; value: string }>({
        id: 'panneau.media.picker.lockedFilter',
        defaultMessage: '{label}: {value}',
    }),
    pickerAccepted: defineMessage<{ types: string }>({
        id: 'panneau.media.picker.accepted',
        defaultMessage: 'Can be selected here: {types}.',
    }),
    pickerAcceptedSize: defineMessage<{ types: string; size: string }>({
        id: 'panneau.media.picker.acceptedSize',
        defaultMessage: 'Can be selected here: {types}, up to {size}.',
    }),
    pickerUploadAccepts: defineMessage<{ types: string }>({
        id: 'panneau.media.picker.uploadAccepts',
        defaultMessage: 'Accepted: {types}.',
    }),
    pickerUploadAcceptsSize: defineMessage<{ types: string; size: string }>({
        id: 'panneau.media.picker.uploadAcceptsSize',
        defaultMessage: 'Accepted: {types}, up to {size} each.',
    }),
    pickerAnyFile: defineMessage({
        id: 'panneau.media.picker.anyFile',
        defaultMessage: 'any file',
    }),
    pickerMedia: defineMessage<{ library: string }>({
        id: 'panneau.media.picker.media',
        defaultMessage: 'Media of {library}',
    }),
    pickerLoading: defineMessage({
        id: 'panneau.media.picker.loading',
        defaultMessage: 'Loading media…',
    }),
    pickerLoadingMore: defineMessage({
        id: 'panneau.media.picker.loadingMore',
        defaultMessage: 'Loading more media…',
    }),
    pickerLoadMore: defineMessage({
        id: 'panneau.media.picker.loadMore',
        defaultMessage: 'Load more',
    }),
    pickerCount: defineMessage<{ shown: number; total: number }>({
        id: 'panneau.media.picker.count',
        defaultMessage: '{shown, number} of {total, number} media',
    }),
    pickerLoadError: defineMessage({
        id: 'panneau.media.picker.loadError',
        defaultMessage: 'The media couldn’t be loaded',
    }),
    pickerRetry: defineMessage({
        id: 'panneau.media.picker.retry',
        defaultMessage: 'Try again',
    }),
    pickerEmpty: defineMessage<{ library: string }>({
        id: 'panneau.media.picker.empty',
        defaultMessage: '{library} has no media yet',
    }),
    pickerEmptyUpload: defineMessage<{ library: string }>({
        id: 'panneau.media.picker.emptyUpload',
        defaultMessage: 'Upload files: they’ll be added to {library} and selected.',
    }),
    pickerEmptyReadOnly: defineMessage({
        id: 'panneau.media.picker.emptyReadOnly',
        defaultMessage: 'You can’t add media to it.',
    }),
    pickerUploadFiles: defineMessage({
        id: 'panneau.media.picker.uploadFiles',
        defaultMessage: 'Upload files',
    }),
    pickerNoResults: defineMessage({
        id: 'panneau.media.picker.noResults',
        defaultMessage: 'No media match your search',
    }),
    pickerClearSearch: defineMessage({
        id: 'panneau.media.picker.clearSearch',
        defaultMessage: 'Clear the search',
    }),
    pickerRefusedType: defineMessage<{ type: string }>({
        id: 'panneau.media.picker.refusedType',
        defaultMessage: '{type} not accepted here',
    }),
    pickerRefusedSize: defineMessage<{ size: string }>({
        id: 'panneau.media.picker.refusedSize',
        defaultMessage: 'Over the {size} limit',
    }),
    pickerCurrent: defineMessage({
        id: 'panneau.media.picker.current',
        defaultMessage: 'Current',
    }),
    pickerNothingSelected: defineMessage({
        id: 'panneau.media.picker.nothingSelected',
        defaultMessage: 'Nothing selected',
    }),
    pickerSelected: defineMessage<{ name: string }>({
        id: 'panneau.media.picker.selected',
        defaultMessage: 'Selected: {name}',
    }),
    pickerSelectedCount: defineMessage<{ count: number }>({
        id: 'panneau.media.picker.selectedCount',
        defaultMessage: '{count, plural, one {# selected} other {# selected}}',
    }),
    pickerSelectedIn: defineMessage<{ count: number; libraries: number }>({
        id: 'panneau.media.picker.selectedIn',
        defaultMessage:
            '{count, plural, one {# selected} other {# selected}} in {libraries, number} libraries',
    }),
    pickerClear: defineMessage({
        id: 'panneau.media.picker.clear',
        defaultMessage: 'Clear',
    }),
    pickerDetails: defineMessage({
        id: 'panneau.media.picker.details',
        defaultMessage: 'Details',
    }),
    pickerDetailsOf: defineMessage<{ name: string }>({
        id: 'panneau.media.picker.detailsOf',
        defaultMessage: 'Details of {name}',
    }),
    pickerNoDetails: defineMessage({
        id: 'panneau.media.picker.noDetails',
        defaultMessage: 'Select a media to see its details.',
    }),
    pickerBack: defineMessage({
        id: 'panneau.media.picker.back',
        defaultMessage: 'Back to the media',
    }),
    pickerSave: defineMessage({
        id: 'panneau.media.picker.save',
        defaultMessage: 'Save',
    }),
    pickerSaveFailed: defineMessage<{ error: string }>({
        id: 'panneau.media.picker.saveFailed',
        defaultMessage: 'The changes couldn’t be saved: {error}',
    }),
    pickerUnsaved: defineMessage<{ name: string }>({
        id: 'panneau.media.picker.unsaved',
        defaultMessage: 'Save the changes to {name}?',
    }),
    pickerUnsavedText: defineMessage({
        id: 'panneau.media.picker.unsavedText',
        defaultMessage: 'You changed the details of this media without saving them.',
    }),
    pickerDiscard: defineMessage({
        id: 'panneau.media.picker.discard',
        defaultMessage: 'Discard',
    }),
    pickerStillProcessing: defineMessage({
        id: 'panneau.media.picker.stillProcessing',
        defaultMessage:
            'Still being processed: it can be used now, and its renditions will follow.',
    }),
    pickerFile: defineMessage({
        id: 'panneau.media.picker.file',
        defaultMessage: 'File',
    }),
    pickerFileType: defineMessage({
        id: 'panneau.media.picker.fileType',
        defaultMessage: 'Type',
    }),
    pickerSize: defineMessage({
        id: 'panneau.media.picker.size',
        defaultMessage: 'Size',
    }),
    pickerDimensions: defineMessage({
        id: 'panneau.media.picker.dimensions',
        defaultMessage: 'Dimensions',
    }),
    pickerDuration: defineMessage({
        id: 'panneau.media.picker.duration',
        defaultMessage: 'Duration',
    }),
    pickerAdded: defineMessage({
        id: 'panneau.media.picker.added',
        defaultMessage: 'Added',
    }),
    pickerAddedTo: defineMessage<{ library: string }>({
        id: 'panneau.media.picker.addedTo',
        defaultMessage: 'Added to {library}',
    }),
    pickerUploadTo: defineMessage<{ library: string }>({
        id: 'panneau.media.picker.uploadTo',
        defaultMessage: 'Files are added to {library} and selected.',
    }),
    pickerUploadToConfirm: defineMessage<{ library: string }>({
        id: 'panneau.media.picker.uploadToConfirm',
        defaultMessage: 'The file is added to {library} and used as soon as it is uploaded.',
    }),
    pickerCreateFailed: defineMessage<{ name: string; error: string }>({
        id: 'panneau.media.picker.createFailed',
        defaultMessage: '{name} couldn’t be added: {error}',
    }),
    // The image editor (`@panneau/media/editor`, decision 0031).
    editorTitle: defineMessage({
        id: 'panneau.media.editor.title',
        defaultMessage: 'Edit image',
    }),
    editorApply: defineMessage({
        id: 'panneau.media.editor.apply',
        defaultMessage: 'Apply',
    }),
    editorCancel: defineMessage({
        id: 'panneau.media.editor.cancel',
        defaultMessage: 'Cancel',
    }),
    editorReset: defineMessage({
        id: 'panneau.media.editor.reset',
        defaultMessage: 'Reset',
    }),
    editorBack: defineMessage({
        id: 'panneau.media.editor.back',
        defaultMessage: 'Back to the library',
    }),
    editorStartFrom: defineMessage({
        id: 'panneau.media.editor.startFrom',
        defaultMessage: 'Start from',
    }),
    editorBaseMedia: defineMessage({
        id: 'panneau.media.editor.baseMedia',
        defaultMessage: 'Library version',
    }),
    editorBaseOriginal: defineMessage({
        id: 'panneau.media.editor.baseOriginal',
        defaultMessage: 'Original file',
    }),
    editorBaseMediaNote: defineMessage({
        id: 'panneau.media.editor.baseMediaNote',
        defaultMessage:
            'Starts from the library’s version of the image: this edit applies over it.',
    }),
    editorBaseOriginalNote: defineMessage({
        id: 'panneau.media.editor.baseOriginalNote',
        defaultMessage: 'Starts from the original file: the library’s edits don’t apply.',
    }),
    editorMediaChangedTitle: defineMessage({
        id: 'panneau.media.editor.mediaChangedTitle',
        defaultMessage: 'The library’s version of this image changed',
    }),
    editorMediaChanged: defineMessage({
        id: 'panneau.media.editor.mediaChanged',
        defaultMessage:
            'The crop for this use was made on the previous version. It was moved inside the new one: check it before applying.',
    }),
    editorTools: defineMessage({
        id: 'panneau.media.editor.tools',
        defaultMessage: 'Tool',
    }),
    editorCanvas: defineMessage<{ name: string }>({
        id: 'panneau.media.editor.canvas',
        defaultMessage: '{name}, as it will be rendered',
    }),
    editorResult: defineMessage({
        id: 'panneau.media.editor.result',
        defaultMessage: 'Result',
    }),
    editorResultSize: defineMessage<{ width: number; height: number; ratio: string }>({
        id: 'panneau.media.editor.resultSize',
        defaultMessage: '{width} × {height} · {ratio}',
    }),
    editorToolCrop: defineMessage({
        id: 'panneau.media.editor.tool.crop',
        defaultMessage: 'Crop',
    }),
    editorToolRotate: defineMessage({
        id: 'panneau.media.editor.tool.rotate',
        defaultMessage: 'Rotate',
    }),
    editorToolFocalPoint: defineMessage({
        id: 'panneau.media.editor.tool.focalPoint',
        defaultMessage: 'Focal point',
    }),
    editorRatio: defineMessage({
        id: 'panneau.media.editor.ratio',
        defaultMessage: 'Aspect ratio',
    }),
    editorRatioFree: defineMessage({
        id: 'panneau.media.editor.ratioFree',
        defaultMessage: 'Free',
    }),
    editorRatioOriginal: defineMessage({
        id: 'panneau.media.editor.ratioOriginal',
        defaultMessage: 'Original',
    }),
    editorRatioRequired: defineMessage({
        id: 'panneau.media.editor.ratioRequired',
        defaultMessage: 'Required by the field',
    }),
    editorCropX: defineMessage({
        id: 'panneau.media.editor.cropX',
        defaultMessage: 'X',
    }),
    editorCropY: defineMessage({
        id: 'panneau.media.editor.cropY',
        defaultMessage: 'Y',
    }),
    editorCropWidth: defineMessage({
        id: 'panneau.media.editor.cropWidth',
        defaultMessage: 'Width',
    }),
    editorCropHeight: defineMessage({
        id: 'panneau.media.editor.cropHeight',
        defaultMessage: 'Height',
    }),
    editorCropPixels: defineMessage<{ width: number; height: number }>({
        id: 'panneau.media.editor.cropPixels',
        defaultMessage: 'In pixels of the image as rendered: {width} × {height}.',
    }),
    editorCropProposed: defineMessage({
        id: 'panneau.media.editor.cropProposed',
        defaultMessage:
            'The field requires a crop: this one is proposed around the focal point. Adjust it, or choose another ratio.',
    }),
    editorCropFrame: defineMessage<{ width: number; height: number }>({
        id: 'panneau.media.editor.cropFrame',
        defaultMessage: 'Crop, {width} by {height} pixels',
    }),
    editorCropFrameRole: defineMessage({
        id: 'panneau.media.editor.cropFrameRole',
        defaultMessage: 'crop frame',
    }),
    editorCropHint: defineMessage({
        id: 'panneau.media.editor.cropHint',
        defaultMessage:
            'Drag the frame or its corners. Keyboard: arrow keys move it, Shift + arrow keys resize it.',
    }),
    editorRotateLeft: defineMessage({
        id: 'panneau.media.editor.rotateLeft',
        defaultMessage: 'Rotate left',
    }),
    editorRotateRight: defineMessage({
        id: 'panneau.media.editor.rotateRight',
        defaultMessage: 'Rotate right',
    }),
    editorFlipHorizontal: defineMessage({
        id: 'panneau.media.editor.flipHorizontal',
        defaultMessage: 'Flip horizontally',
    }),
    editorFlipVertical: defineMessage({
        id: 'panneau.media.editor.flipVertical',
        defaultMessage: 'Flip vertically',
    }),
    editorRotated: defineMessage<{ degrees: number }>({
        id: 'panneau.media.editor.rotated',
        defaultMessage: 'Rotated {degrees}°.',
    }),
    editorRotateKeepsRatio: defineMessage<{ ratio: string }>({
        id: 'panneau.media.editor.rotateKeepsRatio',
        defaultMessage: 'The crop keeps its {ratio} ratio and follows the image.',
    }),
    editorRotateHint: defineMessage({
        id: 'panneau.media.editor.rotateHint',
        defaultMessage: 'The image is shown as it will be rendered.',
    }),
    editorFocalIntro: defineMessage({
        id: 'panneau.media.editor.focalIntro',
        defaultMessage: 'Automatic crops keep this point in view, for the sizes a site asks for:',
    }),
    editorFocalPreview: defineMessage<{ ratio: string }>({
        id: 'panneau.media.editor.focalPreview',
        defaultMessage: 'Automatic {ratio} crop',
    }),
    editorFocalLeft: defineMessage({
        id: 'panneau.media.editor.focalLeft',
        defaultMessage: 'From the left',
    }),
    editorFocalTop: defineMessage({
        id: 'panneau.media.editor.focalTop',
        defaultMessage: 'From the top',
    }),
    editorFocalPoint: defineMessage<{ x: number; y: number }>({
        id: 'panneau.media.editor.focalPoint',
        defaultMessage: 'Focal point, {x}% from the left, {y}% from the top',
    }),
    editorFocalRole: defineMessage({
        id: 'panneau.media.editor.focalRole',
        defaultMessage: 'focal point',
    }),
    editorFocalHint: defineMessage({
        id: 'panneau.media.editor.focalHint',
        defaultMessage: 'Click or drag where the subject is. Keyboard: arrow keys move the point.',
    }),
    editorCropRequired: defineMessage({
        id: 'panneau.media.editor.cropRequired',
        defaultMessage: 'Crop the image to apply.',
    }),
    editorCropRequiredRatios: defineMessage<{ ratios: string }>({
        id: 'panneau.media.editor.cropRequiredRatios',
        defaultMessage: 'Crop the image to {ratios} to apply.',
    }),
    editorCropRatios: defineMessage<{ ratios: string }>({
        id: 'panneau.media.editor.cropRatios',
        defaultMessage: 'The crop must be {ratios}.',
    }),
};
