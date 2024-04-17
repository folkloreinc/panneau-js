// eslint-disable-next-line max-classes-per-file
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { ClassicEditor as ClassicEditorBase } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Link } from '@ckeditor/ckeditor5-link';
import { List } from '@ckeditor/ckeditor5-list';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

// import { SimpleUploadAdapter } from '@ckeditor/ckeditor5-upload';

// Keep all editors in the same file to avoid ckeditor duplicated modules in build

// class Editor extends ClassicEditorBase {}

ClassicEditorBase.builtinPlugins = [Essentials, Heading, Paragraph, Bold, Italic, Link, List];
ClassicEditorBase.defaultConfig = {};

// console.log('editor 2', Editor);

export default ClassicEditorBase;
